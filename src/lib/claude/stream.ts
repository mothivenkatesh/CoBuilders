import { getAnthropicClient, CHAT_MODEL } from "./client";
import { agentTools } from "./tools";
import { handleToolCall } from "./tool-handlers";
import type Anthropic from "@anthropic-ai/sdk";
import type { StreamEvent } from "@/types/chat";

type StreamOptions = {
  systemPrompt: string;
  messages: Anthropic.MessageParam[];
  userId: string;
  startupId: string;
  conversationId: string;
  enableTools?: boolean;
};

export async function* streamChat(options: StreamOptions): AsyncGenerator<StreamEvent> {
  const client = getAnthropicClient();
  const { systemPrompt, messages, userId, startupId, conversationId, enableTools = true } = options;

  let currentMessages = [...messages];
  let continueLoop = true;

  while (continueLoop) {
    const response = await client.messages.create({
      model: CHAT_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: currentMessages,
      tools: enableTools ? agentTools : undefined,
      stream: true,
    });

    let currentText = "";
    let toolUseBlocks: Array<{
      id: string;
      name: string;
      input: Record<string, unknown>;
    }> = [];
    let currentToolId = "";
    let currentToolName = "";
    let currentToolInput = "";

    for await (const event of response) {
      if (event.type === "content_block_start") {
        if (event.content_block.type === "text") {
          currentText = "";
        } else if (event.content_block.type === "tool_use") {
          currentToolId = event.content_block.id;
          currentToolName = event.content_block.name;
          currentToolInput = "";
          yield {
            type: "tool_call_start",
            toolName: currentToolName,
          };
        }
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          currentText += event.delta.text;
          yield { type: "text", content: event.delta.text };
        } else if (event.delta.type === "input_json_delta") {
          currentToolInput += event.delta.partial_json;
        }
      } else if (event.type === "content_block_stop") {
        if (currentToolName && currentToolId) {
          let parsedInput: Record<string, unknown> = {};
          try {
            parsedInput = JSON.parse(currentToolInput);
          } catch {
            parsedInput = {};
          }
          toolUseBlocks.push({
            id: currentToolId,
            name: currentToolName,
            input: parsedInput,
          });
          currentToolId = "";
          currentToolName = "";
          currentToolInput = "";
        }
      } else if (event.type === "message_stop") {
        // Check if we need to handle tool calls
      }
    }

    // If there are tool calls, execute them and continue the loop
    if (toolUseBlocks.length > 0) {
      // Add the assistant message with tool use to history
      const assistantContent: Anthropic.ContentBlockParam[] = [];
      if (currentText) {
        assistantContent.push({ type: "text", text: currentText });
      }
      for (const tool of toolUseBlocks) {
        assistantContent.push({
          type: "tool_use",
          id: tool.id,
          name: tool.name,
          input: tool.input,
        });
      }
      currentMessages.push({ role: "assistant", content: assistantContent });

      // Execute each tool and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tool of toolUseBlocks) {
        const result = await handleToolCall(tool.name, tool.input, {
          userId,
          startupId,
          conversationId,
        });

        yield {
          type: "tool_call_result",
          toolName: tool.name,
          toolInput: tool.input,
          toolResult: result,
        };

        toolResults.push({
          type: "tool_result",
          tool_use_id: tool.id,
          content: result,
        });
      }

      // Add tool results to messages and continue
      currentMessages.push({ role: "user", content: toolResults });
      toolUseBlocks = [];
    } else {
      // No tool calls — we're done
      continueLoop = false;
      yield { type: "done", content: currentText };
    }
  }
}
