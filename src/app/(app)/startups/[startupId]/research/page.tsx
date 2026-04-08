"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Badge, Spinner } from "@/components/ui";
import type { CompetitorIntel } from "@/types/database";

export default function ResearchPage() {
  const params = useParams();
  const startupId = params.startupId as string;
  const [competitors, setCompetitors] = useState<CompetitorIntel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/research?startupId=${startupId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCompetitors(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [startupId]);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Competitor Research" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : competitors.length === 0 ? (
            <div className="py-20 text-center text-zinc-500">
              No competitor research yet. Mention competitors during a session and the agent will research them automatically.
            </div>
          ) : (
            <div className="space-y-4">
              {competitors.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {c.competitor_name}
                      </h3>
                      {c.website_url && (
                        <a
                          href={c.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {c.website_url}
                        </a>
                      )}
                    </div>
                    {c.threat_level && (
                      <Badge
                        variant={
                          c.threat_level === "critical"
                            ? "red"
                            : c.threat_level === "high"
                            ? "orange"
                            : c.threat_level === "medium"
                            ? "yellow"
                            : "green"
                        }
                      >
                        {c.threat_level}
                      </Badge>
                    )}
                  </div>
                  {c.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {c.description}
                    </p>
                  )}
                  {c.funding_info && (
                    <p className="mt-1 text-sm text-zinc-500">
                      <span className="font-medium">Funding:</span> {c.funding_info}
                    </p>
                  )}
                  {c.pricing && (
                    <p className="mt-1 text-sm text-zinc-500">
                      <span className="font-medium">Pricing:</span> {c.pricing}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    {c.strengths && c.strengths.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-green-600">Strengths:</span>{" "}
                        <span className="text-zinc-500">{c.strengths.join(", ")}</span>
                      </div>
                    )}
                    {c.weaknesses && c.weaknesses.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-red-600">Weaknesses:</span>{" "}
                        <span className="text-zinc-500">{c.weaknesses.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
