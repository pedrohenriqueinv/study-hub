'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { Check, RefreshCw, BookOpen, SunMedium, ArrowRight } from 'lucide-react';

export function TodayActivityFeed() {
  const { sessions, subjects } = useData();

  // Mapear as últimas sessões ou registros
  const recentSessions = sessions.slice(0, 4);

  return (
    <section
      aria-labelledby="activity-feed-heading"
      className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h2
            id="activity-feed-heading"
            className="text-[13px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded bg-teal-500"></span>
            3. O que fiz hoje
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {recentSessions.length} registros consolidados
        </span>
      </div>

      {/* Timeline com conector vertical */}
      <div className="flex flex-col gap-4 relative before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-[1.5px] before:bg-slate-200 dark:before:bg-slate-800">
        {recentSessions.map((session, index) => {
          const subject = subjects.find(s => s.id === session.subject_id);
          const time = new Date(session.start_time).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const minutes = Math.round(session.duration_seconds / 60);

          const isStudy = session.session_type === 'study';

          return (
            <div key={session.id} className="flex items-start gap-3.5 relative">
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 z-10 ${
                  isStudy
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800'
                    : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {isStudy ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
              </div>

              <div className="flex-1 -mt-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isStudy
                      ? `Sessão ${subject?.name || 'Estudos'} Concluída`
                      : 'Pausa Consciente & Recuperação'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{time}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {session.notes || `Bloco de ${minutes} min de foco ativo e absorção sem distrações.`}
                </p>

                {/* Badges de metadados */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[10.5px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    +{minutes} XP Foco
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold">
                    {session.efficiency_rate || 100}% Atenção
                  </span>
                  <span className="text-slate-400">• Sem pausas fora de hora</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <Link
        href="/history"
        className="w-full pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center justify-center gap-1"
      >
        <span>Ver histórico completo do mês</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </section>
  );
}
