-- ==============================================================================
-- SYNAPSE COGNITIVE OS - DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase.
-- Ele cria todas as tabelas, índices, triggers automáticos e políticas RLS.

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA: PROFILES (Extensão de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  weekly_goal_hours NUMERIC(5,2) DEFAULT 25.00,
  daily_goal_minutes INTEGER DEFAULT 270, -- 4h 30m
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA: SUBJECTS (Matérias / Ciclos de Estudo)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366F1',
  icon TEXT DEFAULT 'menu_book',
  weight_percentage INTEGER DEFAULT 25,
  target_hours_weekly NUMERIC(5,2) DEFAULT 5.00,
  current_topic TEXT,
  grade_progress_percentage INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA: STUDY_SESSIONS (Sessões do Timer de Foco e Pausas)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('study', 'break')),
  efficiency_rate INTEGER DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA: DAILY_STUDY_RECORDS (Diário de Aprendizado & Checklist Anki)
CREATE TABLE IF NOT EXISTS public.daily_study_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  learning_note TEXT,
  anki_completed BOOLEAN DEFAULT FALSE,
  anki_cards_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_subject_date UNIQUE (user_id, subject_id, date)
);

-- 6. ÍNDICES PARA ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects(user_id, active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_time ON public.study_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON public.study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_records_user_date ON public.daily_study_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_records_subject ON public.daily_study_records(subject_id);

-- 7. FUNÇÃO E TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_subjects_updated_at ON public.subjects;
CREATE TRIGGER set_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_daily_records_updated_at ON public.daily_study_records;
CREATE TRIGGER set_daily_records_updated_at
BEFORE UPDATE ON public.daily_study_records
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. TRIGGER AUTOMÁTICO: CRIAR PERFIL AO REGISTRAR NOVO USUÁRIO NO AUTH.USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) - SEGURANÇA ESTRITA POR USUÁRIO
-- ==============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_study_records ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: PROFILES
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem inserir seu próprio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- POLÍTICAS: SUBJECTS
DROP POLICY IF EXISTS "Usuários podem ver suas próprias matérias" ON public.subjects;
CREATE POLICY "Usuários podem ver suas próprias matérias"
ON public.subjects FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias matérias" ON public.subjects;
CREATE POLICY "Usuários podem criar suas próprias matérias"
ON public.subjects FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias matérias" ON public.subjects;
CREATE POLICY "Usuários podem atualizar suas próprias matérias"
ON public.subjects FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias matérias" ON public.subjects;
CREATE POLICY "Usuários podem deletar suas próprias matérias"
ON public.subjects FOR DELETE
USING (auth.uid() = user_id);

-- POLÍTICAS: STUDY_SESSIONS
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sessões" ON public.study_sessions;
CREATE POLICY "Usuários podem ver suas próprias sessões"
ON public.study_sessions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem registrar suas próprias sessões" ON public.study_sessions;
CREATE POLICY "Usuários podem registrar suas próprias sessões"
ON public.study_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias sessões" ON public.study_sessions;
CREATE POLICY "Usuários podem atualizar suas próprias sessões"
ON public.study_sessions FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias sessões" ON public.study_sessions;
CREATE POLICY "Usuários podem deletar suas próprias sessões"
ON public.study_sessions FOR DELETE
USING (auth.uid() = user_id);

-- POLÍTICAS: DAILY_STUDY_RECORDS
DROP POLICY IF EXISTS "Usuários podem ver seus próprios registros diários" ON public.daily_study_records;
CREATE POLICY "Usuários podem ver seus próprios registros diários"
ON public.daily_study_records FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar seus próprios registros diários" ON public.daily_study_records;
CREATE POLICY "Usuários podem criar seus próprios registros diários"
ON public.daily_study_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios registros diários" ON public.daily_study_records;
CREATE POLICY "Usuários podem atualizar seus próprios registros diários"
ON public.daily_study_records FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios registros diários" ON public.daily_study_records;
CREATE POLICY "Usuários podem deletar seus próprios registros diários"
ON public.daily_study_records FOR DELETE
USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. PERMISSÕES DE ACESSO (Roles anon, authenticated e service_role)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

