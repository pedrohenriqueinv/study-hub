'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Settings,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Save,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, isConfigured, updateProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name || 'Pedro Henrique');
  const [weeklyGoal, setWeeklyGoal] = useState(profile?.weekly_goal_hours || 25.0);
  const [dailyGoalMin, setDailyGoalMin] = useState(profile?.daily_goal_minutes || 270);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      weekly_goal_hours: Number(weeklyGoal),
      daily_goal_minutes: Number(dailyGoalMin),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }

  function handleCopySQL() {
    const sqlScript = `-- Execute este script no Supabase SQL Editor para criar as tabelas e políticas RLS:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  weekly_goal_hours NUMERIC(5,2) DEFAULT 25.00,
  daily_goal_minutes INTEGER DEFAULT 270,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_study_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_policy" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "subjects_policy" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "sessions_policy" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "records_policy" ON public.daily_study_records FOR ALL USING (auth.uid() = user_id);
`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase tracking-wide bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            Preferências & Sistema
          </span>
        </div>
        <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
          Configurações
        </h1>
        <p className="text-[14px] text-slate-600 dark:text-slate-400">
          Gerencie seu perfil, metas de estudo, conexão com o Supabase e status de sincronização.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Perfil & Metas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card de Sincronização PC & Celular */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-teal-500/5 border border-teal-500/30 dark:border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Sincronização PC & Celular
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                    {user ? 'Sincronizado' : 'Requer Conta'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {user
                    ? `Logado como ${user.email}. Seus estudos sincronizam automaticamente entre qualquer computador e celular!`
                    : 'Para que suas matérias e timers do PC apareçam no seu celular, entre com a mesma conta em ambos os aparelhos.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  type="button"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Cadastrar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-5"
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Perfil de Estudante
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || 'aluno.foco@synapse.edu'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Semanal (Horas)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="80"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                  />
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    Padrão: 25 horas semanais
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Diária (Minutos)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="720"
                    value={dailyGoalMin}
                    onChange={(e) => setDailyGoalMin(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                  />
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    270 min = 4 horas e 30 min
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                {isSaved ? 'Preferências salvas com sucesso!' : ''}
              </span>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Perfil</span>
              </button>
            </div>
          </form>

          {/* Tema Visual */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Aparência & Tema
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Alterne entre modo claro focado e modo escuro imersivo.
                </p>
              </div>

              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                type="button"
              >
                Modo {theme === 'dark' ? 'Escuro Ativo' : 'Claro Ativo'} (Alternar)
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Status Supabase & Nuvem (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Status do Supabase */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Conexão Supabase
                </h3>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${
                  isConfigured
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                ></span>
                {isConfigured ? 'Conectado' : 'Modo Local'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isConfigured
                ? 'Sua aplicação está conectada ao Supabase PostgreSQL com Row Level Security (RLS) e sincronização em tempo real.'
                : 'A aplicação está funcionando em modo local demonstrativo. Para sincronizar seus dados na nuvem e no celular, adicione suas credenciais no arquivo .env.local.'}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs flex flex-col gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Como conectar com o Supabase:
              </span>
              <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 space-y-1">
                <li>Crie um projeto gratuito em <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-teal-600 underline">supabase.com</a></li>
                <li>Copie a <strong>Project URL</strong> e <strong>Anon Key</strong></li>
                <li>Cole no arquivo <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">.env.local</code></li>
                <li>Execute o script SQL no SQL Editor do Supabase</li>
              </ol>
            </div>

            <button
              onClick={handleCopySQL}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              type="button"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSql ? 'Script SQL Copiado!' : 'Copiar Script SQL do Banco'}</span>
            </button>
          </div>

          {/* Preparação Multiplataforma */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Pronto para Tauri & Capacitor
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              O projeto foi arquitetado sem dependências proprietárias de desktop, com suporte a layout móvel responsivo e Web Audio API nativo, pronto para ser empacotado para Windows, Android e iOS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
