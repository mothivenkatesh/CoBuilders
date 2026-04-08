-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Startups
CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  one_liner TEXT,
  idea_type TEXT,
  stage TEXT,
  target_customer TEXT,
  business_model TEXT,
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_startups_user_id ON public.startups(user_id);

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  title TEXT,
  session_goal TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  layers_explored TEXT[],
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_startup_id ON public.conversations(startup_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(conversation_id, created_at);
-- Memories (agent self-learning)
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'decision', 'pivot', 'insight', 'research', 'feedback', 'gap', 'strength', 'risk'
  )),
  content TEXT NOT NULL,
  layer TEXT,
  confidence REAL,
  is_superseded BOOLEAN DEFAULT false,
  superseded_by UUID REFERENCES public.memories(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memories_startup_id ON public.memories(startup_id);
CREATE INDEX idx_memories_active ON public.memories(startup_id) WHERE NOT is_superseded;
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
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_research_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Startups: full CRUD on own startups
CREATE POLICY "Users can CRUD own startups" ON public.startups
  FOR ALL USING (auth.uid() = user_id);

-- Conversations: full CRUD on own conversations
CREATE POLICY "Users can CRUD own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Messages: access via conversation ownership
CREATE POLICY "Users can access own messages" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

-- Memories: access via startup ownership
CREATE POLICY "Users can access own memories" ON public.memories
  FOR ALL USING (auth.uid() = user_id);

-- Validation Scores: access via startup ownership
CREATE POLICY "Users can access own scores" ON public.validation_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = validation_scores.startup_id AND s.user_id = auth.uid()
    )
  );

-- Competitor Intel: access via startup ownership
CREATE POLICY "Users can access own competitor intel" ON public.competitor_intel
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = competitor_intel.startup_id AND s.user_id = auth.uid()
    )
  );

-- Market Research Cache: access via startup ownership
CREATE POLICY "Users can access own research" ON public.market_research_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = market_research_cache.startup_id AND s.user_id = auth.uid()
    )
  );
