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
