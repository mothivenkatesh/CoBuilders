"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/types/chat";
import { ToolCallIndicator } from "./ToolCallIndicator";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
          AI
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
      >
        {/* Tool call indicators */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {message.toolCalls.map((tc, i) => (
              <ToolCallIndicator key={i} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Message content with markdown */}
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-inherit prose-table:text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-violet-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-xs font-bold text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
          U
        </div>
      )}
    </div>
  );
}
