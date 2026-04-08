"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { ValidationScorecard } from "@/components/scorecard/ValidationScorecard";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { useScores } from "@/lib/hooks/use-scores";
import { Card, Badge, Button, Text } from "@tremor/react";
import { Spinner } from "@/components/ui/spinner";
import { STAGE_LABELS, IDEA_TYPE_LABELS, BUSINESS_MODEL_LABELS } from "@/types/startup";
import type { Startup, Conversation } from "@/types/database";

export default function StartupDetailPage() {
  const params = useParams();
  const startupId = params.startupId as string;
  const [startup, setStartup] = useState<Startup | null>(null);
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { scores, loading: scoresLoading } = useScores(startupId);

  useEffect(() => {
    Promise.all([
      fetch(`/api/startups/${startupId}`).then((r) => r.json()),
      fetch(`/api/sessions?startupId=${startupId}`).then((r) => r.json()),
    ]).then(([startupData, sessionsData]) => {
      setStartup(startupData);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setLoading(false);
    });
  }, [startupId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!startup) {
    return <div className="p-6"><Text>Startup not found</Text></div>;
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader
        title={startup.name}
        actions={
          <Link href={`/chat?startupId=${startupId}`}>
            <Button>Start Session</Button>
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            {startup.one_liner && (
              <Text className="mb-3">{startup.one_liner}</Text>
            )}
            <div className="flex flex-wrap gap-2">
              {startup.stage && <Badge color="indigo">{STAGE_LABELS[startup.stage] || startup.stage}</Badge>}
              {startup.idea_type && <Badge color="slate">{IDEA_TYPE_LABELS[startup.idea_type] || startup.idea_type}</Badge>}
              {startup.business_model && <Badge color="violet">{BUSINESS_MODEL_LABELS[startup.business_model] || startup.business_model}</Badge>}
            </div>
            {startup.target_customer && (
              <Text className="mt-3">
                <span className="font-medium">Target:</span> {startup.target_customer}
              </Text>
            )}
          </Card>

          {scoresLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <ValidationScorecard scores={scores} />
          )}

          <RecentSessions sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
