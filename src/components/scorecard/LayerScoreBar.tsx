"use client";

import { useState } from "react";

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
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-green-400",
  5: "bg-green-600",
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

  return (
    <div>
      <button
        className="flex w-full flex-col gap-1 text-left md:flex-row md:items-center md:gap-3"
        onClick={() => hasDetails && setExpanded(!expanded)}
        disabled={!hasDetails}
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 md:w-40 md:shrink-0">
          {label}
        </span>

        <div className="flex items-center gap-2 md:flex-1 md:gap-3">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-3 flex-1 rounded-full ${
                  score !== null && n <= score
                    ? scoreColors[score]
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>

          <span className="w-10 shrink-0 text-right text-sm text-zinc-500 md:w-16">
            {score !== null ? `${score}/5` : "\u2014"}
          </span>

          {hasDetails && !compact && (
            <svg
              className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </button>

      {expanded && hasDetails && (
        <div className="ml-0 mt-2 space-y-2 text-sm md:ml-[172px]">
          {score !== null && (
            <p className="text-zinc-500">
              <span className="font-medium">{scoreLabels[score]}</span>
              {rationale && ` \u2014 ${rationale}`}
            </p>
          )}
          {gaps && gaps.length > 0 && (
            <div>
              <span className="font-medium text-red-600 dark:text-red-400">Gaps: </span>
              <span className="text-zinc-600 dark:text-zinc-400">{gaps.join(", ")}</span>
            </div>
          )}
          {strengths && strengths.length > 0 && (
            <div>
              <span className="font-medium text-green-600 dark:text-green-400">Strengths: </span>
              <span className="text-zinc-600 dark:text-zinc-400">{strengths.join(", ")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
