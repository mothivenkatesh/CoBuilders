"use client";

import { useState } from "react";
import { Button, TextInput, Textarea, Select, SelectItem, Text } from "@tremor/react";
import { IDEA_TYPE_LABELS, STAGE_LABELS, BUSINESS_MODEL_LABELS } from "@/types/startup";
import type { StartupFormData } from "@/types/startup";

type StartupFormProps = {
  onSubmit: (data: StartupFormData) => Promise<void>;
  onCancel?: () => void;
};

export function StartupForm({ onSubmit, onCancel }: StartupFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StartupFormData>({ name: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Text className="mb-1">Startup Name *</Text>
        <TextInput
          placeholder="e.g., FinTrack"
          value={formData.name}
          onValueChange={(v) => setFormData({ ...formData, name: v })}
        />
      </div>

      <div>
        <Text className="mb-1">One-liner</Text>
        <Textarea
          placeholder="What does it do and for whom? One sentence."
          value={formData.one_liner || ""}
          onChange={(e) => setFormData({ ...formData, one_liner: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text className="mb-1">Idea Type</Text>
          <Select
            value={formData.idea_type || ""}
            onValueChange={(v) => setFormData({ ...formData, idea_type: v || undefined })}
            placeholder="Select type..."
          >
            {Object.entries(IDEA_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <Text className="mb-1">Stage</Text>
          <Select
            value={formData.stage || ""}
            onValueChange={(v) => setFormData({ ...formData, stage: v || undefined })}
            placeholder="Select stage..."
          >
            {Object.entries(STAGE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Text className="mb-1">Target Customer</Text>
        <TextInput
          placeholder="e.g., CFOs at mid-market SaaS companies (100-500 employees)"
          value={formData.target_customer || ""}
          onValueChange={(v) => setFormData({ ...formData, target_customer: v })}
        />
      </div>

      <div>
        <Text className="mb-1">Business Model</Text>
        <Select
          value={formData.business_model || ""}
          onValueChange={(v) => setFormData({ ...formData, business_model: v || undefined })}
          placeholder="Select model..."
        >
          {Object.entries(BUSINESS_MODEL_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={!formData.name.trim()}>
          Create Startup
        </Button>
      </div>
    </form>
  );
}
