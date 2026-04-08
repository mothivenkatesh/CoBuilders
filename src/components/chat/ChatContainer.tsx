"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Spinner } from "@/components/ui/spinner";
import { Title, Text } from "@tremor/react";

type ChatContainerProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
  onStop: () => void;
};

export function ChatContainer({ messages, isStreaming, onSendMessage, onStop }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messages[messages.length - 1]?.content]);

  return (
    <div className="flex h-full flex-col bg-tremor-background">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <Title>CoBuilders AI</Title>
              <Text className="mt-2 max-w-sm">
                I think like a YC partner. Tell me about your startup idea and I&apos;ll push hard to find the gaps.
              </Text>
            </div>
          </div>
        )}

        {messages.length === 0 && isStreaming && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
                <Spinner size="md" />
              </div>
              <Text>Reviewing your startup profile...</Text>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="mx-auto max-w-3xl space-y-4 px-3 py-4 md:space-y-5 md:px-4 md:py-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-tremor-border bg-tremor-background px-3 py-2 md:px-4 md:py-3">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSend={onSendMessage}
            isStreaming={isStreaming}
            onStop={onStop}
          />
        </div>
      </div>
    </div>
  );
}
