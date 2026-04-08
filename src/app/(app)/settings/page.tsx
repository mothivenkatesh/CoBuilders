"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button, Input, Card } from "@/components/ui";

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-lg space-y-6">
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Profile
            </h3>
            <div className="space-y-4">
              <Input
                label="Email"
                value={user?.email || ""}
                disabled
              />
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleSave} loading={saving}>
                  Save
                </Button>
                {saved && (
                  <span className="text-sm text-green-600">Saved!</span>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              API Keys
            </h3>
            <p className="text-sm text-zinc-500">
              API keys are configured server-side via environment variables. Contact the admin to update them.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
