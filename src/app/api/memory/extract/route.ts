import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnthropicClient, EXTRACTION_MODEL } from "@/lib/claude/client";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const EXTRACTION_PROMPT = `You are a post-session analyst for AI Cofounder. Review the conversation and extract key learnings.

For each learning, output a JSON object on its own line with these fields:
- memory_type: one of "decision", "pivot", "insight", "research", "gap", "strength", "risk"
- content: the specific learning (be concise and actionable)
- layer: one of "problem_pain", "customer_market", "solution_diff", "unit_economics", "pnl_viability", "market_timing", "founder_fit", "traction_pmf" (or null if general)

Also output a session summary as the first line, prefixed with "SUMMARY: ".

Rules:
- Only extract non-obvious learnings not already captured
- Be specific, not generic
- Decisions = founder choices (pricing, market, model)
- Pivots = changes in direction
- Gaps = unresolved questions
- Risks = identified kill zones
- Strengths = validated advantages
- Output valid JSON per line (after the summary line)`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await request.json();
  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  const admin = createAdminClient();

  // Load conversation and messages
  const { data: conversation } = await admin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: messages } = await admin
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  // Load existing memories to avoid duplicates
  const { data: existingMemories } = await admin
    .from("memories")
    .select("content")
    .eq("startup_id", conversation.startup_id)
    .eq("is_superseded", false);

  const existingSummary = (existingMemories || []).map((m) => m.content).join("\n");

  // Call Claude for extraction
  const client = getAnthropicClient();
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 2048,
    system: EXTRACTION_PROMPT,
    messages: [
      {
        role: "user",
        content: `Existing memories (avoid duplicates):\n${existingSummary}\n\n---\n\nConversation to analyze:\n${conversationText}`,
      },
    ],
  });

  const output =
    response.content[0].type === "text" ? response.content[0].text : "";
  const lines = output.split("\n").filter((l) => l.trim());

  let summary = "";
  const newMemories: Array<{
    memory_type: string;
    content: string;
    layer: string | null;
  }> = [];

  for (const line of lines) {
    if (line.startsWith("SUMMARY: ")) {
      summary = line.replace("SUMMARY: ", "");
      continue;
    }
    try {
      const parsed = JSON.parse(line);
      if (parsed.memory_type && parsed.content) {
        newMemories.push(parsed);
      }
    } catch {
      // Skip malformed lines
    }
  }

  // Save memories
  if (newMemories.length > 0) {
    await admin.from("memories").insert(
      newMemories.map((m) => ({
        user_id: user.id,
        startup_id: conversation.startup_id,
        conversation_id: conversationId,
        memory_type: m.memory_type,
        content: m.content,
        layer: m.layer || null,
      }))
    );
  }

  // Update conversation with summary and mark as completed
  if (summary) {
    await admin
      .from("conversations")
      .update({
        summary,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);
  }

  return NextResponse.json({
    summary,
    memoriesExtracted: newMemories.length,
    memories: newMemories,
  });
}
