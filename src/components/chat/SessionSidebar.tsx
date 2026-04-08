"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Conversation } from "@/types/database";
import { Badge } from "@/components/ui";

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
    <div className="w-64 border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sessions</h3>
        <Link
          href={`/chat?startupId=${startupId}`}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
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
              className={`mb-1 block rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
              }`}
            >
              <p className="truncate font-medium">
                {session.title || "Untitled"}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-zinc-400">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
                {session.status === "completed" && (
                  <Badge variant="green">done</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
