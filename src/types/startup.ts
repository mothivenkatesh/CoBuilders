import type { Startup, ValidationScore, Conversation } from "./database";

export type StartupWithScores = Startup & {
  scores: ValidationScore[];
  lastSession: Conversation | null;
};

export type StartupFormData = {
  name: string;
  one_liner?: string;
  idea_type?: string;
  stage?: string;
  target_customer?: string;
  business_model?: string;
  notes?: string;
};

export const IDEA_TYPE_LABELS: Record<string, string> = {
  b2b_saas: "B2B SaaS",
  consumer: "Consumer App",
  marketplace: "Marketplace",
  fintech: "Fintech",
  api_dev_tool: "API / Dev Tool",
  d2c: "D2C / E-commerce",
  services: "Services / Consulting",
  hardware: "Hardware",
};

export const STAGE_LABELS: Record<string, string> = {
  idea: "Just an idea",
  prototype: "Prototype / Mockup",
  mvp_no_revenue: "MVP (no revenue)",
  revenue_pre_growth: "Revenue (pre-growth)",
  growing: "Growing",
};

export const BUSINESS_MODEL_LABELS: Record<string, string> = {
  subscription: "Subscription",
  transactional: "Transactional",
  marketplace_take_rate: "Marketplace Take Rate",
  usage_based: "Usage-based",
  freemium: "Freemium",
  ads: "Advertising",
  licensing: "Licensing",
};

export const LAYER_LABELS: Record<string, string> = {
  problem_pain: "Problem & Pain",
  customer_market: "Customer & Market",
  solution_diff: "Solution & Differentiation",
  unit_economics: "Unit Economics",
  pnl_viability: "P&L Viability",
  market_timing: "Market Timing & Moat",
  founder_fit: "Founder Fit",
  traction_pmf: "Traction & PMF",
};

export const SCORE_INTERPRETATIONS = [
  { min: 34, max: 40, label: "Strong signal", color: "green", description: "Back this. Build or invest." },
  { min: 25, max: 33, label: "Conditional", color: "yellow", description: "2-3 crisp gaps to close." },
  { min: 16, max: 24, label: "Fragile", color: "orange", description: "Fundamental questions unanswered." },
  { min: 0, max: 15, label: "Do not build yet", color: "red", description: "Core assumptions unvalidated." },
];
