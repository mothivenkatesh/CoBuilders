"use client";

import { useState } from "react";
import { useStartups } from "@/lib/hooks/use-startups";
import { AppHeader } from "@/components/layout/AppHeader";
import { StartupCard } from "@/components/startup/StartupCard";
import { StartupForm } from "@/components/startup/StartupForm";
import { Button, Modal, Spinner } from "@/components/ui";

export default function StartupsPage() {
  const { startups, loading, createStartup } = useStartups();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <AppHeader
        title="Your Startups"
        actions={<Button onClick={() => setShowForm(true)}>New Startup</Button>}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {startups.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Startup">
        <StartupForm
          onSubmit={async (data) => {
            await createStartup(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
