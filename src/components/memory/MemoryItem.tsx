import type { Memory } from "@/types/database";
import { LAYER_LABELS } from "@/types/startup";
import { Text } from "@tremor/react";

const typeColors: Record<string, string> = {
  decision: "border-l-blue-500 bg-blue-50/50",
  risk: "border-l-red-500 bg-red-50/50",
  gap: "border-l-orange-500 bg-orange-50/50",
  insight: "border-l-violet-500 bg-violet-50/50",
  strength: "border-l-green-500 bg-green-50/50",
  research: "border-l-slate-400 bg-slate-50/50",
  pivot: "border-l-yellow-500 bg-yellow-50/50",
  feedback: "border-l-cyan-500 bg-cyan-50/50",
};

export function MemoryItem({ memory }: { memory: Memory }) {
  const colorClass = typeColors[memory.memory_type] || "border-l-slate-300 bg-slate-50";
  const layerLabel = memory.layer ? LAYER_LABELS[memory.layer] : null;

  return (
    <div className={`rounded-r-tremor-default border-l-2 px-3 py-2 ${colorClass}`}>
      <Text className="text-xs leading-relaxed">{memory.content}</Text>
      {layerLabel && (
        <span className="mt-1 inline-block text-[10px] text-tremor-content-subtle">
          {layerLabel}
        </span>
      )}
    </div>
  );
}
