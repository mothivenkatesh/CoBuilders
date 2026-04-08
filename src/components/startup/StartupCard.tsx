"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Startup } from "@/types/database";
import { Card, Badge, Button, Text, Bold, CategoryBar } from "@tremor/react";
import { STAGE_LABELS, IDEA_TYPE_LABELS } from "@/types/startup";
import { RiDeleteBinLine, RiPlayLine, RiArrowRightLine } from "@remixicon/react";

type StartupCardProps = {
  startup: Startup & { validation_scores?: Array<{ layer: string; score: number }> };
  onDelete?: (id: string) => void;
};

export function StartupCard({ startup, onDelete }: StartupCardProps) {
  const scores = startup.validation_scores || [];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxScore = scores.length * 5;
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const handleValidate = async () => {
    setLoading(true);
    try {
      const sessionsRes = await fetch(`/api/sessions?startupId=${startup.id}`);
      const sessions = await sessionsRes.json();
      const activeSession = Array.isArray(sessions)
        ? sessions.find((s: { status: string }) => s.status === "active")
        : null;

      if (activeSession) {
        router.push(`/chat/${activeSession.id}`);
      } else {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupId: startup.id, title: `Validating ${startup.name}` }),
        });
        const session = await res.json();
        router.push(`/chat/${session.id}?autostart=true`);
      }
    } catch {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) onDelete(startup.id);
    setShowConfirm(false);
  };

  return (
    <Card className="group relative transition-shadow hover:shadow-tremor-card">
      {/* Delete button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="absolute right-3 top-3 rounded-tremor-default p-1 text-tremor-content-subtle opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title="Delete startup"
      >
        <RiDeleteBinLine className="h-4 w-4" />
      </button>

      {/* Delete confirmation overlay */}
      {showConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-tremor-default bg-tremor-background/95">
          <div className="text-center">
            <Text className="font-medium">Delete this startup?</Text>
            <Text className="mt-1 text-xs">All sessions and data will be removed</Text>
            <div className="mt-3 flex justify-center gap-2">
              <Button variant="secondary" size="xs" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button size="xs" color="red" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="pr-6">
          <Bold>{startup.name}</Bold>
          {startup.one_liner && (
            <Text className="mt-1 line-clamp-2">{startup.one_liner}</Text>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {startup.stage && (
          <Badge color="indigo">{STAGE_LABELS[startup.stage] || startup.stage}</Badge>
        )}
        {startup.idea_type && (
          <Badge color="slate">{IDEA_TYPE_LABELS[startup.idea_type] || startup.idea_type}</Badge>
        )}
      </div>

      {/* Score bar */}
      {scores.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <Text className="text-xs">{scores.length}/8 layers</Text>
            <Text className="text-xs font-medium">{scorePercent}%</Text>
          </div>
          <CategoryBar
            values={[25, 25, 25, 25]}
            colors={["red", "orange", "yellow", "green"]}
            markerValue={scorePercent}
            showLabels={false}
            className="h-2"
          />
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button size="xs" icon={RiPlayLine} loading={loading} onClick={handleValidate}>
          Validate
        </Button>
        <Button
          variant="secondary"
          size="xs"
          icon={RiArrowRightLine}
          iconPosition="right"
          onClick={() => router.push(`/startups/${startup.id}`)}
        >
          Details
        </Button>
      </div>
    </Card>
  );
}
