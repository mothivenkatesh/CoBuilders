import { Metric, Text } from "@tremor/react";

type OverallScoreProps = {
  total: number;
  maxPossible: number;
};

export function OverallScore({ total, maxPossible }: OverallScoreProps) {
  const percentage = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;

  let color = "text-red-600";
  if (total >= 34) color = "text-green-600";
  else if (total >= 25) color = "text-yellow-600";
  else if (total >= 16) color = "text-orange-600";

  return (
    <div className="text-right">
      <Metric className={color}>{total}</Metric>
      <Text>of {maxPossible} ({percentage}%)</Text>
    </div>
  );
}
