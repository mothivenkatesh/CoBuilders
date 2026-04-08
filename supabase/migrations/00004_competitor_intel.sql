-- Competitor Intelligence
CREATE TABLE public.competitor_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  funding_info TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  pricing TEXT,
  market_position TEXT,
  threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_competitor_intel_startup ON public.competitor_intel(startup_id);
