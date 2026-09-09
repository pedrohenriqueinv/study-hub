'use client';

import React from 'react';
import Link from 'next/link';
import { Hourglass, Play, BookOpen } from 'lucide-react';
import { useTimer } from '@/contexts/TimerContext';

export function EmptyStateView() {
  const { openModal } = useTimer();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-[#0E131F] border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center max-w-2xl mx-auto w-full my-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 shadow-xs">
        <Hourglass className="w-8 h-8 animate-pulse" />
      </div>

      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
        Novo Ciclo Cognitivo
      </span>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
        Nenhuma sessão registrada hoje ainda.
      </h3>

      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
        Seu cérebro está pronto para um bloco de foco profundo. Inicie uma sessão de 25 ou 50 minutos para computar métricas, sincronizar flashcards e desbloquear os gráficos de retenção.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          type="button"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Iniciar Primeira Sessão</span>
        </button>

        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs px-4 py-2.5 rounded-xl transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Gerenciar Matérias</span>
        </Link>
      </div>
    </div>
  );
}
