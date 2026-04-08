import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPrompt } from "@/lib/claude/system-prompt";
import { streamChat } from "@/lib/claude/stream";
import type Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { conversationId, startupId, message } = await request.json();

  if (!conversationId || !startupId || !message) {
    return new Response("Missing required fields", { status: 400 });
  }

  const admin = createAdminClient();

  // Load startup
  const { data: startup } = await admin
    .from("startups")
    .select("*")
    .eq("id", startupId)
    .eq("user_id", user.id)
    .single();

  if (!startup) {
    return new Response("Startup not found", { status: 404 });
  }

  // Load conversation
  const { data: conversation } = await admin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  // Save user message
  await admin.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: message,
  });

  // Load past messages for context
  const { data: pastMessages } = await admin
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  // Load memories
  const { data: memories } = await admin
    .from("memories")
    .select("*")
    .eq("startup_id", startupId)
    .eq("is_superseded", false)
    .order("created_at", { ascending: false });

  // Load scores
  const { data: scores } = await admin
    .from("validation_scores")
    .select("*")
    .eq("startup_id", startupId);

  // Build system prompt
  const systemPrompt = buildSystemPrompt({
    startup,
    memories: memories || [],
    scores: scores || [],
    sessionGoal: conversation.session_goal,
    layersExplored: conversation.layers_explored,
  });

  // Format messages for Claude
  const claudeMessages: Anthropic.MessageParam[] = (pastMessages || [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // Stream the response
  const encoder = new TextEncoder();
  let fullAssistantText = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamChat({
          systemPrompt,
          messages: claudeMessages,
          userId: user.id,
          startupId,
          conversationId,
        })) {
          if (event.type === "text") {
            fullAssistantText += event.content || "";
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        }

        // Save assistant message
        if (fullAssistantText) {
          await admin.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: fullAssistantText,
          });

          // Update message count
          await admin
            .from("conversations")
            .update({
              message_count: (conversation.message_count || 0) + 2,
              updated_at: new Date().toISOString(),
            })
            .eq("id", conversationId);
        }

        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", content: String(error) })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
