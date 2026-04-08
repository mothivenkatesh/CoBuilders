"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Badge, Text, Bold } from "@tremor/react";
import { Spinner } from "@/components/ui/spinner";
import type { CompetitorIntel } from "@/types/database";

const threatColors: Record<string, string> = {
  critical: "red",
  high: "orange",
  medium: "yellow",
  low: "green",
};

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
            <div className="py-20 text-center">
              <Text>No competitor research yet. Mention competitors during a session and the agent will research them automatically.</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {competitors.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <Bold>{c.competitor_name}</Bold>
                      {c.website_url && (
                        <a
                          href={c.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-tremor-brand hover:underline"
                        >
                          {c.website_url}
                        </a>
                      )}
                    </div>
                    {c.threat_level && (
                      <Badge color={threatColors[c.threat_level] || "slate"}>
                        {c.threat_level}
                      </Badge>
                    )}
                  </div>
                  {c.description && (
                    <Text className="mt-2">{c.description}</Text>
                  )}
                  {c.funding_info && (
                    <Text className="mt-1">
                      <span className="font-medium">Funding:</span> {c.funding_info}
                    </Text>
                  )}
                  {c.pricing && (
                    <Text className="mt-1">
                      <span className="font-medium">Pricing:</span> {c.pricing}
                    </Text>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    {c.strengths && c.strengths.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-green-600">Strengths:</span>{" "}
                        <span className="text-tremor-content">{c.strengths.join(", ")}</span>
                      </div>
                    )}
                    {c.weaknesses && c.weaknesses.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-red-600">Weaknesses:</span>{" "}
                        <span className="text-tremor-content">{c.weaknesses.join(", ")}</span>
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
