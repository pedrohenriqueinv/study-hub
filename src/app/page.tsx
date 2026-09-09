'use client';

import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { SubjectProgressList } from '@/components/dashboard/SubjectProgressList';
import { QuickFocusEngine } from '@/components/dashboard/QuickFocusEngine';
import { TodayActivityFeed } from '@/components/dashboard/TodayActivityFeed';
import { EmptyStateView } from '@/components/dashboard/EmptyStateView';
import { Cloud, BarChart2, Hourglass, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { emptyStateMode, setEmptyStateMode } = useData();
  const { user, profile, isConfigured } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Pedro';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="flex flex-col gap-8">
      {/* Banner informativo de configuração do Supabase (amigável, aparece apenas se ainda não configurado) */}
      {!isConfigured && (
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                Modo Demonstração Local Ativo
              </span>
              <p className="text-indigo-700 dark:text-indigo-300 mt-0.5">
                Todas as funções, timers e diários funcionam com persistência local. Conecte seu Supabase no arquivo <code className="bg-indigo-100 dark:bg-indigo-900/60 px-1 py-0.5 rounded font-mono">.env.local</code> para sincronização na nuvem.
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shrink-0 self-start sm:self-center"
          >
            Ver Instruções
          </Link>
        </div>
      )}

      {/* Ambient Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase tracking-wide bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Cognitive Flow Ativo
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
            <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {isConfigured ? 'Supabase Sync Online' : 'Local Storage Sync'}
            </span>
          </div>

          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            {emptyStateMode ? `Olá, ${firstName}. Pronto para o foco?` : `Bem-vindo de volta, ${firstName}.`}
          </h1>

          <p className="text-[14px] text-slate-600 dark:text-slate-400 mt-1">
            {emptyStateMode
              ? 'Nenhuma sessão iniciada neste dia. Escolha uma matéria e inicie seu ciclo.'
              : 'Seu estado de foco matinal atingiu 92% de eficiência. Você está a 48 min de cumprir a meta diária.'}
          </p>
        </div>

        {/* UI State Switcher: Realistic Preview Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start md:self-auto shrink-0 shadow-inner">
          <button
            onClick={() => setEmptyStateMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer ${
              !emptyStateMode
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            type="button"
          >
            <BarChart2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Com Dados</span>
          </button>

          <button
            onClick={() => setEmptyStateMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer ${
              emptyStateMode
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            type="button"
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Empty State</span>
          </button>
        </div>
      </div>

      {emptyStateMode ? (
        <EmptyStateView />
      ) : (
        <>
          {/* 1. QUANTO ESTUDEI HOJE? (Métricas Primárias) */}
          <MetricCards />

          {/* 2 & 3. SPLIT OPERACIONAL (O que preciso estudar? vs O que fiz hoje?) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Coluna Esquerda: O que preciso estudar (7 colunas) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <SubjectProgressList />
            </div>

            {/* Coluna Direita: Quick Focus Engine + Feed de Atividades (5 colunas) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <QuickFocusEngine />
              <TodayActivityFeed />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
