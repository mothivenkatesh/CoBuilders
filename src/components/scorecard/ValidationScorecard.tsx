"use client";

import type { ValidationScore } from "@/types/database";
import { LAYER_LABELS, SCORE_INTERPRETATIONS } from "@/types/startup";
import { LayerScoreBar } from "./LayerScoreBar";
import { OverallScore } from "./OverallScore";
import { Card } from "@/components/ui";

const ALL_LAYERS = [
  "problem_pain",
  "customer_market",
  "solution_diff",
  "unit_economics",
  "pnl_viability",
  "market_timing",
  "founder_fit",
  "traction_pmf",
] as const;

type ValidationScorecardProps = {
  scores: ValidationScore[];
  compact?: boolean;
};

export function ValidationScorecard({ scores, compact = false }: ValidationScorecardProps) {
  const scoreMap = new Map(scores.map((s) => [s.layer, s]));
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  const maxPossible = scores.length * 5;
  const interpretation = SCORE_INTERPRETATIONS.find(
    (i) => total >= i.min && total <= i.max
  );

  // Check for fatal flaw (any layer at 1)
  const fatalFlaw = scores.find((s) => s.score === 1);

  return (
    <Card padding={compact ? "sm" : "lg"}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Validation Scorecard
          </h3>
          {scores.length > 0 && (
            <p className="mt-1 text-sm text-zinc-500">
              {scores.length} of 8 layers scored
            </p>
          )}
        </div>
        {scores.length > 0 && (
          <OverallScore total={total} maxPossible={maxPossible} />
        )}
      </div>

      {fatalFlaw && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          Fatal flaw detected in <strong>{LAYER_LABELS[fatalFlaw.layer]}</strong>
          {fatalFlaw.rationale && `: ${fatalFlaw.rationale}`}
        </div>
      )}

      {interpretation && scores.length >= 4 && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            interpretation.color === "green"
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : interpretation.color === "yellow"
              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
              : interpretation.color === "orange"
              ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          <strong>{interpretation.label}:</strong> {interpretation.description}
        </div>
      )}

      <div className="space-y-3">
        {ALL_LAYERS.map((layer) => {
          const score = scoreMap.get(layer);
          return (
            <LayerScoreBar
              key={layer}
              layer={layer}
              label={LAYER_LABELS[layer]}
              score={score?.score ?? null}
              rationale={score?.rationale ?? null}
              gaps={score?.key_gaps ?? null}
              strengths={score?.key_strengths ?? null}
              compact={compact}
            />
          );
        })}
      </div>
    </Card>
  );
}
