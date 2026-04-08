-- Market Research Cache
CREATE TABLE public.market_research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  source_url TEXT,
  content_summary TEXT,
  raw_data JSONB,
  research_type TEXT CHECK (research_type IN (
    'market_size', 'trend', 'competitor', 'regulation', 'news', 'pricing'
  )),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_market_research_startup ON public.market_research_cache(startup_id);
CREATE INDEX idx_market_research_expires ON public.market_research_cache(expires_at);
