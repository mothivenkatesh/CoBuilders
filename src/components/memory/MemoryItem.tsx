import type { Memory } from "@/types/database";
import { LAYER_LABELS } from "@/types/startup";

const typeColors: Record<string, string> = {
  decision: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10",
  risk: "border-l-red-500 bg-red-50 dark:bg-red-900/10",
  gap: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/10",
  insight: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/10",
  strength: "border-l-green-500 bg-green-50 dark:bg-green-900/10",
  research: "border-l-zinc-400 bg-zinc-50 dark:bg-zinc-800/50",
  pivot: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10",
  feedback: "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/10",
};

export function MemoryItem({ memory }: { memory: Memory }) {
  const colorClass = typeColors[memory.memory_type] || "border-l-zinc-300 bg-zinc-50";
  const layerLabel = memory.layer ? LAYER_LABELS[memory.layer] : null;

  return (
    <div className={`rounded-r-lg border-l-2 px-3 py-2 ${colorClass}`}>
      <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
        {memory.content}
      </p>
      {layerLabel && (
        <span className="mt-1 inline-block text-[10px] text-zinc-400">
          {layerLabel}
        </span>
      )}
    </div>
  );
}
