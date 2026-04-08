import { SKILL_CONTENT } from "@/lib/skill/skill-content";
import { INTAKE_SCOPING } from "@/lib/skill/intake-scoping";
import { MODEL_ARCHETYPES } from "@/lib/skill/model-archetypes";
import { MARKET_SIZING } from "@/lib/skill/market-sizing";
import { PNL_TEMPLATES } from "@/lib/skill/pnl-templates";
import { COMPANY_FRAMEWORKS } from "@/lib/skill/company-frameworks";
import { FOUNDER_FIT } from "@/lib/skill/founder-fit";
import { CONVICTION_CHECKS } from "@/lib/skill/conviction-checks";
import type { Startup, Memory, ValidationScore } from "@/types/database";

type PromptContext = {
  startup: Startup;
  memories: Memory[];
  scores: ValidationScore[];
  sessionGoal?: string;
  layersExplored?: string[];
};

export function buildSystemPrompt(context: PromptContext): string {
  const parts: string[] = [];

  // Layer 1: Core skill content (always included)
  parts.push(SKILL_CONTENT);

  // Layer 2: Startup context
  parts.push(buildStartupContext(context.startup));

  // Layer 3: Agent memory (if any)
  if (context.memories.length > 0) {
    parts.push(buildMemoryContext(context.memories));
  }

  // Layer 4: Current validation scores
  if (context.scores.length > 0) {
    parts.push(buildScoresContext(context.scores));
  }

  // Layer 5: Dynamically selected reference files
  parts.push(...selectReferences(context));

  return parts.join("\n\n---\n\n");
}

function buildStartupContext(startup: Startup): string {
  const fields = [
    `## Current Startup: ${startup.name}`,
    startup.one_liner ? `**One-liner:** ${startup.one_liner}` : null,
    startup.idea_type ? `**Idea type:** ${startup.idea_type}` : null,
    startup.stage ? `**Stage:** ${startup.stage}` : null,
    startup.target_customer ? `**Target customer:** ${startup.target_customer}` : null,
    startup.business_model ? `**Business model:** ${startup.business_model}` : null,
    startup.notes ? `**Notes:** ${startup.notes}` : null,
  ].filter(Boolean);

  return fields.join("\n");
}

function buildMemoryContext(memories: Memory[]): string {
  const grouped: Record<string, Memory[]> = {};
  const priority = ["decision", "risk", "gap", "insight", "strength", "research", "pivot", "feedback"];

  for (const m of memories) {
    if (!grouped[m.memory_type]) grouped[m.memory_type] = [];
    grouped[m.memory_type].push(m);
  }

  const lines = ["## Agent Memory (from past sessions)"];
  let tokenEstimate = 0;

  for (const type of priority) {
    const items = grouped[type];
    if (!items) continue;

    lines.push(`\n### ${type.charAt(0).toUpperCase() + type.slice(1)}s`);
    for (const item of items) {
      const line = `- ${item.content}${item.layer ? ` [Layer: ${item.layer}]` : ""}`;
      tokenEstimate += line.length / 4;
      if (tokenEstimate > 2000) break;
      lines.push(line);
    }
    if (tokenEstimate > 2000) break;
  }

  return lines.join("\n");
}

function buildScoresContext(scores: ValidationScore[]): string {
  const lines = ["## Current Validation Scores"];
  let total = 0;

  for (const s of scores) {
    total += s.score;
    lines.push(
      `- **${s.layer}:** ${s.score}/5${s.rationale ? ` — ${s.rationale}` : ""}`
    );
    if (s.key_gaps?.length) lines.push(`  Gaps: ${s.key_gaps.join(", ")}`);
    if (s.key_strengths?.length) lines.push(`  Strengths: ${s.key_strengths.join(", ")}`);
  }

  if (scores.length > 0) {
    lines.push(`\n**Total: ${total}/${scores.length * 5}**`);
    if (total >= 34) lines.push("Interpretation: Strong signal.");
    else if (total >= 25) lines.push("Interpretation: Conditional — gaps to close.");
    else if (total >= 16) lines.push("Interpretation: Fragile — fundamental questions remain.");
    else lines.push("Interpretation: Do not build yet.");
  }

  return lines.join("\n");
}

function selectReferences(context: PromptContext): string[] {
  const refs: string[] = [];
  const { startup, scores, sessionGoal, layersExplored } = context;

  // Always include intake scoping if no scores yet
  if (scores.length === 0) {
    refs.push(INTAKE_SCOPING);
  }

  // Include model archetypes once idea type is known
  if (startup.idea_type) {
    refs.push(MODEL_ARCHETYPES);
  }

  // Include market sizing when exploring Layer 2
  if (layersExplored?.includes("customer_market")) {
    refs.push(MARKET_SIZING);
  }

  // Include P&L templates when exploring Layers 4-5
  if (
    layersExplored?.includes("unit_economics") ||
    layersExplored?.includes("pnl_viability")
  ) {
    refs.push(PNL_TEMPLATES);
  }

  // Include founder fit when exploring Layer 7
  if (layersExplored?.includes("founder_fit")) {
    refs.push(FOUNDER_FIT);
  }

  // Include conviction checks for investor prep or poke holes
  if (sessionGoal === "investor_prep" || sessionGoal === "poke_holes") {
    refs.push(CONVICTION_CHECKS);
  }

  // Include company frameworks when pain is vague (no problem_pain score or low score)
  const problemScore = scores.find((s) => s.layer === "problem_pain");
  if (!problemScore || problemScore.score <= 2) {
    refs.push(COMPANY_FRAMEWORKS);
  }

  return refs;
}
