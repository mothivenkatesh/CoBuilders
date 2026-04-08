import { Card, Metric, Text } from "@tremor/react";

type QuickStatsProps = {
  startupCount: number;
  sessionCount: number;
  avgScore: number | null;
  weakestLayer: string | null;
};

export function QuickStats({ startupCount, sessionCount, avgScore, weakestLayer }: QuickStatsProps) {
  const stats = [
    { label: "Startups", value: startupCount },
    { label: "Sessions", value: sessionCount },
    { label: "Avg Score", value: avgScore !== null ? `${avgScore.toFixed(1)}/5` : "\u2014" },
    { label: "Weakest Layer", value: weakestLayer || "\u2014" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-3">
          <Text className="text-xs">{stat.label}</Text>
          <Metric className="mt-1 text-xl">{stat.value}</Metric>
        </Card>
      ))}
    </div>
  );
}
