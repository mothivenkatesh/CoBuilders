"use client";

import Link from "next/link";
import type { Startup } from "@/types/database";
import { Badge, Card } from "@/components/ui";
import { STAGE_LABELS, IDEA_TYPE_LABELS } from "@/types/startup";

type StartupCardProps = {
  startup: Startup & { validation_scores?: Array<{ layer: string; score: number }> };
};

const scoreColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-400", "bg-green-600"];

export function StartupCard({ startup }: StartupCardProps) {
  const scores = startup.validation_scores || [];

  return (
    <Card className="transition-shadow hover:shadow-md">
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
        <Link
          href={`/chat?startupId=${startup.id}`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Validate
        </Link>
        <Link
          href={`/startups/${startup.id}`}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Details
        </Link>
      </div>
    </Card>
  );
}
