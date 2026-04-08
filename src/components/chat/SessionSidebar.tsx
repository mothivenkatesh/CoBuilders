"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Conversation } from "@/types/database";
import { Badge, Text, Bold } from "@tremor/react";

type SessionSidebarProps = {
  startupId: string;
};

export function SessionSidebar({ startupId }: SessionSidebarProps) {
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const params = useParams();
  const currentSessionId = params.sessionId as string;

  useEffect(() => {
    fetch(`/api/sessions?startupId=${startupId}`)
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));
  }, [startupId]);

  return (
    <div className="w-64 border-r border-tremor-border bg-tremor-background-muted">
      <div className="flex h-14 items-center justify-between border-b border-tremor-border px-4">
        <Bold className="text-sm">Sessions</Bold>
        <Link
          href={`/chat?startupId=${startupId}`}
          className="text-xs text-tremor-brand hover:underline"
        >
          + New
        </Link>
      </div>
      <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-2">
        {sessions.map((session) => {
          const isActive = session.id === currentSessionId;
          return (
            <Link
              key={session.id}
              href={`/chat/${session.id}`}
              className={`mb-1 block rounded-tremor-default px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-tremor-brand-muted text-tremor-brand-emphasis"
                  : "text-tremor-content hover:bg-tremor-background-subtle"
              }`}
            >
              <p className="truncate font-medium">
                {session.title || "Untitled"}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <Text className="text-xs">
                  {new Date(session.created_at).toLocaleDateString()}
                </Text>
                {session.status === "completed" && (
                  <Badge size="xs" color="green">done</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
