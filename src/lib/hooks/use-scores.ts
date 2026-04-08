"use client";

import { useState, useEffect, useCallback } from "react";
import type { ValidationScore } from "@/types/database";

export function useScores(startupId: string | null) {
  const [scores, setScores] = useState<ValidationScore[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScores = useCallback(async () => {
    if (!startupId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/scores/${startupId}`);
      if (res.ok) {
        const data = await res.json();
        setScores(data);
      }
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return { scores, loading, refetch: fetchScores };
}
