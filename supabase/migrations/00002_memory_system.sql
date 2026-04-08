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
