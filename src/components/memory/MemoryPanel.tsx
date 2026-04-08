"use client";

import { useState, useEffect } from "react";
import type { Memory } from "@/types/database";
import { MemoryItem } from "./MemoryItem";

type MemoryPanelProps = {
  startupId: string;
  isOpen: boolean;
  onToggle: () => void;
};

const TYPE_ORDER = ["decision", "risk", "gap", "insight", "strength", "research", "pivot", "feedback"];

export function MemoryPanel({ startupId, isOpen, onToggle }: MemoryPanelProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && startupId) {
      setLoading(true);
      fetch(`/api/memory?startupId=${startupId}`)
        .then((res) => res.json())
        .then((data) => setMemories(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    }
  }, [isOpen, startupId]);

  // Group by type
  const grouped = new Map<string, Memory[]>();
  for (const m of memories) {
    if (!grouped.has(m.memory_type)) grouped.set(m.memory_type, []);
    grouped.get(m.memory_type)!.push(m);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={`
          ${isOpen ? "fixed inset-0 z-50 w-full md:relative md:inset-auto md:z-auto md:w-80" : "w-0"}
          border-l border-zinc-200 bg-zinc-50 transition-all dark:border-zinc-800 dark:bg-zinc-950
          overflow-hidden
        `}
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Agent Memory
          </h3>
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-3">
          {loading ? (
            <p className="text-center text-sm text-zinc-400">Loading memories...</p>
          ) : memories.length === 0 ? (
            <p className="text-center text-sm text-zinc-400">
              No memories yet. The agent will learn as you chat.
            </p>
          ) : (
            <div className="space-y-4">
              {TYPE_ORDER.map((type) => {
                const items = grouped.get(type);
                if (!items) return null;
                return (
                  <div key={type}>
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {type}s ({items.length})
                    </h4>
                    <div className="space-y-1.5">
                      {items.map((m) => (
                        <MemoryItem key={m.id} memory={m} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
