"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Startup } from "@/types/database";
import { Badge, Button, Card } from "@/components/ui";
import { STAGE_LABELS, IDEA_TYPE_LABELS } from "@/types/startup";

type StartupCardProps = {
  startup: Startup & { validation_scores?: Array<{ layer: string; score: number }> };
  onDelete?: (id: string) => void;
};

const scoreColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-400", "bg-green-600"];

export function StartupCard({ startup, onDelete }: StartupCardProps) {
  const scores = startup.validation_scores || [];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      // Check for existing active session first
      const sessionsRes = await fetch(`/api/sessions?startupId=${startup.id}`);
      const sessions = await sessionsRes.json();
      const activeSession = Array.isArray(sessions)
        ? sessions.find((s: { status: string }) => s.status === "active")
        : null;

      if (activeSession) {
        // Reuse existing session
        router.push(`/chat/${activeSession.id}`);
      } else {
        // Create new session only if none exists
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

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(startup.id);
    }
    setShowConfirm(false);
  };

  return (
    <Card className="relative transition-shadow hover:shadow-md">
      {/* Delete button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="absolute right-3 top-3 rounded-md p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-red-400 [.group:hover_&]:opacity-100"
        title="Delete startup"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>

      {/* Delete confirmation */}
      {showConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/95 dark:bg-zinc-900/95">
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete this startup?</p>
            <p className="mt-1 text-xs text-zinc-500">All sessions and data will be removed</p>
            <div className="mt-3 flex justify-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{startup.name}</h3>
          {startup.one_liner && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{startup.one_liner}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {startup.stage && (
            <Badge variant="blue">{STAGE_LABELS[startup.stage] || startup.stage}</Badge>
          )}
          {startup.idea_type && (
            <Badge>{IDEA_TYPE_LABELS[startup.idea_type] || startup.idea_type}</Badge>
          )}
        </div>
      </div>

      {/* Mini scorecard */}
      {scores.length > 0 && (
        <div className="mt-3 flex gap-1">
          {scores.map((s) => (
            <div
              key={s.layer}
              className={`h-2 w-6 rounded-full ${scoreColors[s.score] || "bg-zinc-200"}`}
              title={`${s.layer}: ${s.score}/5`}
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={handleValidate} loading={loading}>
          {loading ? "Loading..." : "Validate"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/startups/${startup.id}`)}
        >
          Details
        </Button>
      </div>
    </Card>
  );
}
