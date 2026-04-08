export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type IdeaType =
  | "b2b_saas"
  | "consumer"
  | "marketplace"
  | "fintech"
  | "api_dev_tool"
  | "d2c"
  | "services"
  | "hardware";

export type Stage =
  | "idea"
  | "prototype"
  | "mvp_no_revenue"
  | "revenue_pre_growth"
  | "growing";

export type BusinessModel =
  | "subscription"
  | "transactional"
  | "marketplace_take_rate"
  | "usage_based"
  | "freemium"
  | "ads"
  | "licensing";

export type Startup = {
  id: string;
  user_id: string;
  name: string;
  one_liner: string | null;
  idea_type: IdeaType | null;
  stage: Stage | null;
  target_customer: string | null;
  business_model: BusinessModel | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type SessionGoal =
  | "poke_holes"
  | "validate_direction"
  | "investor_prep"
  | "pricing"
  | "market_sizing"
  | "find_pmf";

export type ConversationStatus = "active" | "completed" | "abandoned";

export type Conversation = {
  id: string;
  user_id: string;
  startup_id: string;
  title: string | null;
  session_goal: SessionGoal | null;
  status: ConversationStatus;
  layers_explored: string[] | null;
  summary: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
};

export type MessageRole = "user" | "assistant" | "system" | "tool";

export type Message = {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type MemoryType =
  | "decision"
  | "pivot"
  | "insight"
  | "research"
  | "feedback"
  | "gap"
  | "strength"
  | "risk";

export type Memory = {
  id: string;
  user_id: string;
  startup_id: string;
  conversation_id: string | null;
  memory_type: MemoryType;
  content: string;
  layer: string | null;
  confidence: number | null;
  is_superseded: boolean;
  superseded_by: string | null;
  created_at: string;
};

export type ValidationLayer =
  | "problem_pain"
  | "customer_market"
  | "solution_diff"
  | "unit_economics"
  | "pnl_viability"
  | "market_timing"
  | "founder_fit"
  | "traction_pmf";

export type ValidationScore = {
  id: string;
  startup_id: string;
  conversation_id: string | null;
  layer: ValidationLayer;
  score: number;
  rationale: string | null;
  key_gaps: string[] | null;
  key_strengths: string[] | null;
  created_at: string;
  updated_at: string;
};

export type ThreatLevel = "low" | "medium" | "high" | "critical";

export type CompetitorIntel = {
  id: string;
  startup_id: string;
  competitor_name: string;
  website_url: string | null;
  description: string | null;
  funding_info: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  pricing: string | null;
  market_position: string | null;
  threat_level: ThreatLevel | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type ResearchType =
  | "market_size"
  | "trend"
  | "competitor"
  | "regulation"
  | "news"
  | "pricing";

export type MarketResearch = {
  id: string;
  startup_id: string;
  query: string;
  source_url: string | null;
  content_summary: string | null;
  raw_data: Record<string, unknown> | null;
  research_type: ResearchType | null;
  expires_at: string;
  created_at: string;
};
