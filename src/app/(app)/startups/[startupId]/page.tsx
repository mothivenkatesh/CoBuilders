"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { ValidationScorecard } from "@/components/scorecard/ValidationScorecard";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { useScores } from "@/lib/hooks/use-scores";
import { Button, Badge, Spinner, Card } from "@/components/ui";
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
    return <div className="p-6 text-zinc-500">Startup not found</div>;
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
          {/* Startup info */}
          <Card>
            {startup.one_liner && (
              <p className="mb-3 text-zinc-600 dark:text-zinc-400">{startup.one_liner}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {startup.stage && <Badge variant="blue">{STAGE_LABELS[startup.stage] || startup.stage}</Badge>}
              {startup.idea_type && <Badge>{IDEA_TYPE_LABELS[startup.idea_type] || startup.idea_type}</Badge>}
              {startup.business_model && <Badge variant="purple">{BUSINESS_MODEL_LABELS[startup.business_model] || startup.business_model}</Badge>}
            </div>
            {startup.target_customer && (
              <p className="mt-3 text-sm text-zinc-500">
                <span className="font-medium">Target:</span> {startup.target_customer}
              </p>
            )}
          </Card>

          {/* Scorecard */}
          {scoresLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <ValidationScorecard scores={scores} />
          )}

          {/* Recent sessions */}
          <RecentSessions sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
