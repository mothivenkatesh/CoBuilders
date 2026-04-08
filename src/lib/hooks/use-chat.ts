"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage, StreamEvent, ToolCallDisplay } from "@/types/chat";

export function useChat(conversationId: string, startupId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${conversationId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(
        (data.messages || [])
          .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
          .map((m: { id: string; role: string; content: string; created_at: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.created_at,
          }))
      );
    } catch {
      // Ignore load errors
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      // Add user message optimistically
      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      // Add streaming placeholder for assistant
      const assistantMsg: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        isStreaming: true,
        toolCalls: [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        abortRef.current = new AbortController();

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, startupId, message: content }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`Chat failed: ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);

            try {
              const event: StreamEvent = JSON.parse(data);

              if (event.type === "text") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    last.content += event.content || "";
                  }
                  return updated;
                });
              } else if (event.type === "tool_call_start") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    const toolCall: ToolCallDisplay = {
                      name: event.toolName || "",
                      input: {},
                      status: "running",
                    };
                    last.toolCalls = [...(last.toolCalls || []), toolCall];
                  }
                  return updated;
                });
              } else if (event.type === "tool_call_result") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant" && last.toolCalls) {
                    const tc = last.toolCalls.find(
                      (t) => t.name === event.toolName && t.status === "running"
                    );
                    if (tc) {
                      tc.status = "completed";
                      tc.result = event.toolResult;
                    }
                  }
                  return updated;
                });
              } else if (event.type === "done") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    last.isStreaming = false;
                  }
                  return updated;
                });
              } else if (event.type === "error") {
                setError(event.content || "An error occurred");
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(String(err));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversationId, startupId, isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, sendMessage, stopStreaming, loadMessages };
}
