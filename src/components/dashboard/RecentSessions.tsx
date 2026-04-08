"use client";

import Link from "next/link";
import type { Conversation } from "@/types/database";
import { Card, Badge } from "@/components/ui";

type RecentSessionsProps = {
  sessions: Conversation[];
};

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Recent Sessions
      </h3>
      <div className="space-y-2">
        {sessions.slice(0, 5).map((session) => (
          <Link
            key={session.id}
            href={`/chat/${session.id}`}
            className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {session.title || "Untitled session"}
              </p>
              <p className="text-xs text-zinc-400">
                {new Date(session.created_at).toLocaleDateString()} · {session.message_count} messages
              </p>
            </div>
            <Badge variant={session.status === "completed" ? "green" : "default"}>
              {session.status}
            </Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
}
