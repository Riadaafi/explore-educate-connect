
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  school TEXT DEFAULT '',
  formation TEXT DEFAULT '',
  city TEXT DEFAULT '',
  status TEXT DEFAULT 'student',
  skills TEXT[] DEFAULT '{}',
  mbti TEXT DEFAULT '',
  avatar_emoji TEXT DEFAULT '🎓',
  avatar_gradient TEXT DEFAULT 'from-teal-300 to-emerald-500',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- CONNECTIONS
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, recipient_id),
  CHECK (requester_id <> recipient_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Users create own connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Recipient updates status" ON public.connections FOR UPDATE USING (auth.uid() = recipient_id OR auth.uid() = requester_id);
CREATE POLICY "Users delete own connections" ON public.connections FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users update received messages" ON public.messages FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Users delete own messages" ON public.messages FOR DELETE USING (auth.uid() = sender_id);
CREATE INDEX ON public.messages (recipient_id, created_at DESC);
CREATE INDEX ON public.messages (sender_id, created_at DESC);

-- FORMATIONS (publiques + modifiables par tout user connecté)
CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  sector TEXT NOT NULL,
  school TEXT NOT NULL,
  city TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  expertise_level TEXT DEFAULT 'Débutant',
  description TEXT DEFAULT '',
  outlets TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.formations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.formations TO authenticated;
GRANT ALL ON public.formations TO service_role;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Formations viewable by all" ON public.formations FOR SELECT USING (true);
CREATE POLICY "Auth users create formations" ON public.formations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users update formations" ON public.formations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users delete own formations" ON public.formations FOR DELETE USING (auth.uid() = created_by);
CREATE INDEX ON public.formations (sector);
CREATE INDEX ON public.formations (type);

-- MBTI
CREATE TABLE public.mbti_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL,
  scores JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.mbti_results TO authenticated;
GRANT ALL ON public.mbti_results TO service_role;
ALTER TABLE public.mbti_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mbti" ON public.mbti_results FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER touch_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_formations BEFORE UPDATE ON public.formations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
