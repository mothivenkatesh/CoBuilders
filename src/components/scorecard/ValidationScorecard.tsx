"use client";

import type { ValidationScore } from "@/types/database";
import { LAYER_LABELS, SCORE_INTERPRETATIONS } from "@/types/startup";
import { LayerScoreBar } from "./LayerScoreBar";
import { OverallScore } from "./OverallScore";
import { Card, Title, Text, Callout, Divider } from "@tremor/react";
import { RiAlertLine, RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";

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

  const fatalFlaw = scores.find((s) => s.score === 1);

  const calloutColor = interpretation?.color === "green" ? "teal"
    : interpretation?.color === "yellow" ? "yellow"
    : interpretation?.color === "orange" ? "orange"
    : "red";

  const calloutIcon = interpretation?.color === "green" ? RiCheckboxCircleLine
    : interpretation?.color === "red" ? RiAlertLine
    : RiErrorWarningLine;

  return (
    <Card className={compact ? "p-3" : ""}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <Title className={compact ? "text-base" : ""}>Validation Scorecard</Title>
          {scores.length > 0 && (
            <Text className="mt-1">{scores.length} of 8 layers scored</Text>
          )}
        </div>
        {scores.length > 0 && (
          <OverallScore total={total} maxPossible={maxPossible} />
        )}
      </div>

      {fatalFlaw && (
        <Callout title="Fatal Flaw Detected" icon={RiAlertLine} color="red" className="mb-4">
          {LAYER_LABELS[fatalFlaw.layer]}
          {fatalFlaw.rationale && `: ${fatalFlaw.rationale}`}
        </Callout>
      )}

      {interpretation && scores.length >= 4 && (
        <Callout
          title={interpretation.label}
          icon={calloutIcon}
          color={calloutColor}
          className="mb-4"
        >
          {interpretation.description}
        </Callout>
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
