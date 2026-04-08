"use client";

import Link from "next/link";
import type { Conversation } from "@/types/database";
import { Card, Badge, Title, Text } from "@tremor/react";

type RecentSessionsProps = {
  sessions: Conversation[];
};

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) return null;

  return (
    <Card>
      <Title className="mb-3 text-sm">Recent Sessions</Title>
      <div className="space-y-2">
        {sessions.slice(0, 5).map((session) => (
          <Link
            key={session.id}
            href={`/chat/${session.id}`}
            className="flex items-center justify-between rounded-tremor-default px-3 py-2 transition-colors hover:bg-tremor-background-muted"
          >
            <div>
              <Text className="text-sm font-medium">
                {session.title || "Untitled session"}
              </Text>
              <Text className="text-xs">
                {new Date(session.created_at).toLocaleDateString()} · {session.message_count} messages
              </Text>
            </div>
            <Badge color={session.status === "completed" ? "green" : "gray"}>
              {session.status}
            </Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
}
