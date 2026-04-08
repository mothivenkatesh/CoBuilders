"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStartups } from "@/lib/hooks/use-startups";
import { AppHeader } from "@/components/layout/AppHeader";
import { StartupCard } from "@/components/startup/StartupCard";
import { StartupForm } from "@/components/startup/StartupForm";
import { Button, Title, Text, Dialog, DialogPanel } from "@tremor/react";
import { Spinner } from "@/components/ui/spinner";
import { RiAddLine, RiRocketLine } from "@remixicon/react";

export default function DashboardPage() {
  const { startups, loading, createStartup, archiveStartup } = useStartups();
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const handleCreateAndChat = async (data: Parameters<typeof createStartup>[0]) => {
    const startup = await createStartup(data);
    setShowForm(false);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId: startup.id, title: `Validating ${startup.name}` }),
    });
    const session = await res.json();
    router.push(`/chat/${session.id}?autostart=true`);
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader
        title="Dashboard"
        actions={
          <Button icon={RiAddLine} onClick={() => setShowForm(true)}>
            New Startup
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : startups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-tremor-brand-muted">
              <RiRocketLine className="h-8 w-8 text-tremor-brand" />
            </div>
            <Title>No startups yet</Title>
            <Text className="mt-2">
              Create your first startup idea to start validating it with AI.
            </Text>
            <Button className="mt-4" icon={RiAddLine} onClick={() => setShowForm(true)}>
              Create your first startup
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup) => (
              <StartupCard
                key={startup.id}
                startup={startup}
                onDelete={archiveStartup}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onClose={() => setShowForm(false)} static={true}>
        <DialogPanel>
          <Title className="mb-4">New Startup</Title>
          <StartupForm
            onSubmit={handleCreateAndChat}
            onCancel={() => setShowForm(false)}
          />
        </DialogPanel>
      </Dialog>
    </div>
  );
}
