"use client";

import { useState, useEffect } from "react";
import type { Memory } from "@/types/database";
import { MemoryItem } from "./MemoryItem";
import { Bold, Text, Divider } from "@tremor/react";
import { RiCloseLine } from "@remixicon/react";

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

  const grouped = new Map<string, Memory[]>();
  for (const m of memories) {
    if (!grouped.has(m.memory_type)) grouped.set(m.memory_type, []);
    grouped.get(m.memory_type)!.push(m);
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={`
          ${isOpen ? "fixed inset-0 z-50 w-full md:relative md:inset-auto md:z-auto md:w-80" : "w-0"}
          border-l border-tremor-border bg-tremor-background-muted transition-all overflow-hidden
        `}
      >
        <div className="flex h-14 items-center justify-between border-b border-tremor-border px-4">
          <Bold className="text-sm">Agent Memory</Bold>
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-tremor-default text-tremor-content-subtle hover:bg-tremor-background-subtle hover:text-tremor-content"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-3">
          {loading ? (
            <Text className="text-center">Loading memories...</Text>
          ) : memories.length === 0 ? (
            <Text className="text-center">
              No memories yet. The agent will learn as you chat.
            </Text>
          ) : (
            <div className="space-y-4">
              {TYPE_ORDER.map((type) => {
                const items = grouped.get(type);
                if (!items) return null;
                return (
                  <div key={type}>
                    <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider">
                      {type}s ({items.length})
                    </Text>
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
