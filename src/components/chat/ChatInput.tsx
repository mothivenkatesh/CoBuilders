"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@tremor/react";
import { RiSendPlane2Fill, RiStopCircleFill } from "@remixicon/react";

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
        className="flex-1 resize-none rounded-tremor-default border border-tremor-border bg-tremor-background px-3 py-2.5 text-base text-tremor-content-emphasis placeholder:text-tremor-content-subtle focus:border-tremor-brand focus:outline-none focus:ring-1 focus:ring-tremor-brand md:px-4 md:py-3 md:text-sm"
        disabled={isStreaming}
      />
      {isStreaming ? (
        <Button color="red" icon={RiStopCircleFill} onClick={onStop}>
          Stop
        </Button>
      ) : (
        <Button icon={RiSendPlane2Fill} onClick={handleSubmit} disabled={!value.trim()}>
          Send
        </Button>
      )}
    </div>
  );
}
