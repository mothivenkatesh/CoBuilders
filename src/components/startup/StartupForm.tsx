"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
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
      <Input
        label="Startup Name"
        placeholder="e.g., FinTrack"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Textarea
        label="One-liner"
        placeholder="What does it do and for whom? One sentence."
        value={formData.one_liner || ""}
        onChange={(e) => setFormData({ ...formData, one_liner: e.target.value })}
        rows={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Idea Type
          </label>
          <select
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={formData.idea_type || ""}
            onChange={(e) => setFormData({ ...formData, idea_type: e.target.value || undefined })}
          >
            <option value="">Select type...</option>
            {Object.entries(IDEA_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Stage
          </label>
          <select
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={formData.stage || ""}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value || undefined })}
          >
            <option value="">Select stage...</option>
            {Object.entries(STAGE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Target Customer"
        placeholder="e.g., CFOs at mid-market SaaS companies (100-500 employees)"
        value={formData.target_customer || ""}
        onChange={(e) => setFormData({ ...formData, target_customer: e.target.value })}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Business Model
        </label>
        <select
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          value={formData.business_model || ""}
          onChange={(e) => setFormData({ ...formData, business_model: e.target.value || undefined })}
        >
          <option value="">Select model...</option>
          {Object.entries(BUSINESS_MODEL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
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
