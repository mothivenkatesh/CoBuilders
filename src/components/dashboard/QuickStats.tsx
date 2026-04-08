import { Card } from "@/components/ui";

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
    { label: "Avg Score", value: avgScore !== null ? `${avgScore.toFixed(1)}/5` : "—" },
    { label: "Weakest Layer", value: weakestLayer || "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} padding="sm">
          <p className="text-xs text-zinc-500">{stat.label}</p>
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
