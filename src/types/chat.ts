export type StreamEventType =
  | "text"
  | "tool_call_start"
  | "tool_call_result"
  | "error"
  | "done";

export type StreamEvent = {
  type: StreamEventType;
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: unknown;
  messageId?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallDisplay[];
  isStreaming?: boolean;
  createdAt: string;
};

export type ToolCallDisplay = {
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
  status: "running" | "completed" | "error";
};

export type ChatRequest = {
  conversationId: string;
  startupId: string;
  message: string;
};
