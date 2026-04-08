"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useStartups } from "@/lib/hooks/use-startups";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button, Card, Spinner } from "@/components/ui";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startupId = searchParams.get("startupId");
  const { startups, loading } = useStartups();
  const [creating, setCreating] = useState(false);

  // If startupId provided, create a new session and redirect
  useEffect(() => {
    if (startupId && !creating) {
      setCreating(true);
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      })
        .then((res) => res.json())
        .then((session) => {
          router.push(`/chat/${session.id}`);
        });
    }
  }, [startupId, router, creating]);

  if (startupId || creating) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Start a Session" />
      <div className="flex-1 overflow-y-auto p-6">
        <p className="mb-4 text-zinc-500">Select a startup to validate:</p>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {startups.map((s) => (
              <Card
                key={s.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/chat?startupId=${s.id}`)}
              >
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{s.name}</h3>
                {s.one_liner && (
                  <p className="mt-1 text-sm text-zinc-500">{s.one_liner}</p>
                )}
              </Card>
            ))}
          </div>
        )}
        {!loading && startups.length === 0 && (
          <div className="text-center py-10">
            <p className="text-zinc-500">No startups yet.</p>
            <Button className="mt-3" onClick={() => router.push("/dashboard")}>
              Create one first
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
