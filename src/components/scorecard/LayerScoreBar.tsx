"use client";

import { useState } from "react";
import { Text, Bold, CategoryBar } from "@tremor/react";
import { RiArrowDownSLine } from "@remixicon/react";

type LayerScoreBarProps = {
  layer: string;
  label: string;
  score: number | null;
  rationale: string | null;
  gaps: string[] | null;
  strengths: string[] | null;
  compact?: boolean;
};

const scoreColors: Record<number, string> = {
  1: "red",
  2: "orange",
  3: "yellow",
  4: "emerald",
  5: "green",
};

const scoreLabels: Record<number, string> = {
  1: "Fatal flaw",
  2: "Weak",
  3: "Needs work",
  4: "Solid",
  5: "Exceptional",
};

export function LayerScoreBar({
  label,
  score,
  rationale,
  gaps,
  strengths,
  compact,
}: LayerScoreBarProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = rationale || (gaps && gaps.length > 0) || (strengths && strengths.length > 0);
  const markerValue = score !== null ? (score / 5) * 100 : 0;

  return (
    <div>
      <button
        className="flex w-full flex-col gap-1 text-left md:flex-row md:items-center md:gap-3"
        onClick={() => hasDetails && setExpanded(!expanded)}
        disabled={!hasDetails}
      >
        <span className="text-sm font-medium text-tremor-content-emphasis md:w-40 md:shrink-0">
          {label}
        </span>

        <div className="flex items-center gap-2 md:flex-1 md:gap-3">
          {score !== null ? (
            <CategoryBar
              values={[20, 20, 20, 20, 20]}
              colors={["red", "orange", "yellow", "emerald", "green"]}
              markerValue={markerValue}
              showLabels={false}
              className="flex-1"
            />
          ) : (
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-2 flex-1 rounded-full bg-tremor-background-subtle" />
              ))}
            </div>
          )}

          <span className="w-10 shrink-0 text-right text-sm text-tremor-content-subtle md:w-16">
            {score !== null ? `${score}/5` : "\u2014"}
          </span>

          {hasDetails && !compact && (
            <RiArrowDownSLine
              className={`h-4 w-4 shrink-0 text-tremor-content-subtle transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      {expanded && hasDetails && (
        <div className="ml-0 mt-2 space-y-2 text-sm md:ml-[172px]">
          {score !== null && (
            <Text>
              <Bold>{scoreLabels[score]}</Bold>
              {rationale && ` \u2014 ${rationale}`}
            </Text>
          )}
          {gaps && gaps.length > 0 && (
            <div>
              <span className="font-medium text-red-600">Gaps: </span>
              <Text className="inline">{gaps.join(", ")}</Text>
            </div>
          )}
          {strengths && strengths.length > 0 && (
            <div>
              <span className="font-medium text-green-600">Strengths: </span>
              <Text className="inline">{strengths.join(", ")}</Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
