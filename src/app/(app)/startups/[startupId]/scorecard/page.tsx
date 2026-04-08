"use client";

import { useParams } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { ValidationScorecard } from "@/components/scorecard/ValidationScorecard";
import { useScores } from "@/lib/hooks/use-scores";
import { Spinner } from "@/components/ui";

export default function ScorecardPage() {
  const params = useParams();
  const startupId = params.startupId as string;
  const { scores, loading } = useScores(startupId);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Validation Scorecard" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : scores.length === 0 ? (
            <div className="py-20 text-center text-zinc-500">
              No scores yet. Start a validation session to get scored.
            </div>
          ) : (
            <ValidationScorecard scores={scores} />
          )}
        </div>
      </div>
    </div>
  );
}
