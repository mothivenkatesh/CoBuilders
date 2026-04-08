"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";

type ChatInputProps = {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onStop: () => void;
};

export function ChatInput({ onSend, isStreaming, onStop }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your startup idea..."
        rows={1}
        className="flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 md:px-4 md:py-3 md:text-sm"
        disabled={isStreaming}
      />
      {isStreaming ? (
        <Button variant="danger" size="md" onClick={onStop}>
          Stop
        </Button>
      ) : (
        <Button onClick={handleSubmit} disabled={!value.trim()}>
          Send
        </Button>
      )}
    </div>
  );
}
