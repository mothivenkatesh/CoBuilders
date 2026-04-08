"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, TextInput, Button, Title, Text } from "@tremor/react";

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
            <Title className="mb-4 text-sm">Profile</Title>
            <div className="space-y-4">
              <div>
                <Text className="mb-1">Email</Text>
                <TextInput value={user?.email || ""} disabled />
              </div>
              <div>
                <Text className="mb-1">Full Name</Text>
                <TextInput
                  value={fullName}
                  onValueChange={setFullName}
                  placeholder="Your name"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleSave} loading={saving}>
                  Save
                </Button>
                {saved && (
                  <Text color="green">Saved!</Text>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <Title className="mb-2 text-sm">API Keys</Title>
            <Text>
              API keys are configured server-side via environment variables. Contact the admin to update them.
            </Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
