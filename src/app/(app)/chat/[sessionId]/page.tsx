"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useChat } from "@/lib/hooks/use-chat";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { SessionSidebar } from "@/components/chat/SessionSidebar";
import { MemoryPanel } from "@/components/memory/MemoryPanel";
import { Button, Spinner } from "@/components/ui";

function ChatSessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const autostart = searchParams.get("autostart") === "true";
  const [startupId, setStartupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStartupId(data.startup_id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  if (loading || !startupId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ChatSessionInner
      sessionId={sessionId}
      startupId={startupId}
      autostart={autostart}
    />
  );
}

export default function ChatSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ChatSessionContent />
    </Suspense>
  );
}

function ChatSessionInner({
  sessionId,
  startupId,
  autostart,
}: {
  sessionId: string;
  startupId: string;
  autostart: boolean;
}) {
  const { messages, isStreaming, sendMessage, stopStreaming, loadMessages } =
    useChat(sessionId, startupId);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [greeted, setGreeted] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto-start: send a greeting to kick off the validation
  useEffect(() => {
    if (autostart && !greeted && !isStreaming && messages.length === 0) {
      setGreeted(true);
      // Small delay to let UI render first
      const timer = setTimeout(() => {
        sendMessage(
          "I just created this startup profile. Review the details I provided and start validating my idea. Begin with your intake process."
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autostart, greeted, isStreaming, messages.length, sendMessage]);

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await fetch("/api/memory/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: sessionId }),
      });
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Session sidebar: hidden on mobile */}
      <div className="hidden md:block">
        <SessionSidebar startupId={startupId} />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-10 items-center justify-end gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800 md:px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndSession}
            loading={ending}
          >
            End Session
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMemoryOpen(!memoryOpen)}
          >
            {memoryOpen ? "Hide Memory" : "Memory"}
          </Button>
        </div>
        <div className="relative flex flex-1 overflow-hidden">
          <div className="flex-1">
            <ChatContainer
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={sendMessage}
              onStop={stopStreaming}
            />
          </div>
          <MemoryPanel
            startupId={startupId}
            isOpen={memoryOpen}
            onToggle={() => setMemoryOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
