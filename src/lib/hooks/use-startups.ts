"use client";

import { useState, useEffect, useCallback } from "react";
import type { Startup } from "@/types/database";
import type { StartupFormData } from "@/types/startup";

export function useStartups() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStartups = useCallback(async () => {
    try {
      const res = await fetch("/api/startups");
      if (res.ok) {
        const data = await res.json();
        setStartups(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  const createStartup = async (data: StartupFormData) => {
    const res = await fetch("/api/startups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create startup");
    const startup = await res.json();
    setStartups((prev) => [startup, ...prev]);
    return startup;
  };

  const archiveStartup = async (id: string) => {
    const res = await fetch(`/api/startups/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStartups((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return { startups, loading, createStartup, archiveStartup, refetch: fetchStartups };
}
