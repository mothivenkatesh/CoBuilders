-- Validation Scores (per-layer, per-startup)
CREATE TABLE public.validation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  layer TEXT NOT NULL CHECK (layer IN (
    'problem_pain', 'customer_market', 'solution_diff', 'unit_economics',
    'pnl_viability', 'market_timing', 'founder_fit', 'traction_pmf'
  )),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  rationale TEXT,
  key_gaps TEXT[],
  key_strengths TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(startup_id, layer)
);

CREATE INDEX idx_validation_scores_startup ON public.validation_scores(startup_id);
