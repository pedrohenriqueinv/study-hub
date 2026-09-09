'use client';

import React from 'react';
import { useData } from '@/contexts/DataContext';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import { Timer, CheckCircle2, BookOpen, Sparkles, TrendingUp } from 'lucide-react';

export function MetricCards() {
  const { metrics, emptyStateMode } = useData();

  const totalStudyStr = formatSecondsToHoursMinutes(metrics.totalStudySecondsToday);
  const totalBreakStr = formatSecondsToHoursMinutes(metrics.totalBreakSecondsToday);

  // Percentual da meta diária (meta padrão 4h30 = 16200 seg)
  const targetSeconds = metrics.targetMinutesToday * 60;
  const progressPercent = Math.min(100, Math.round((metrics.totalStudySecondsToday / targetSeconds) * 100));
  const remainingMinutes = Math.max(0, Math.round((targetSeconds - metrics.totalStudySecondsToday) / 60));

  const subjectsRatio = `${metrics.activeSubjectsToday} / ${metrics.totalActiveSubjects || 4}`;

  return (
    <section aria-labelledby="metrics-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="metrics-heading"
          className="text-[12px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          1. Quanto estudei hoje?
        </h2>
        <span className="text-[11px] font-mono text-slate-500">
          Ciclo #142 • Atualizado em tempo real
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Tempo Total em Foco */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
              Tempo Total em Foco
            </span>
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300">
              <Timer className="w-4 h-4" />
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                {emptyStateMode ? '0m' : totalStudyStr}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 4h 30m</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${emptyStateMode ? 0 : progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11.5px] pt-1">
            <span className="text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> {emptyStateMode ? 0 : progressPercent}% da meta
            </span>
            <span className="font-mono text-slate-500">
              {emptyStateMode ? '4h 30m' : `${remainingMinutes}m`} para meta
            </span>
          </div>
        </div>

        {/* Card 2: Sessões Realizadas */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
              Sessões Realizadas
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                {metrics.completedBlocksCount}
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                blocos concluídos
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-2.5">
              {metrics.completedBlocksCount > 0 ? (
                Array.from({ length: Math.min(6, metrics.completedBlocksCount) }).map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 flex-1 rounded-full bg-indigo-600"
                    title={`Bloco ${i + 1}`}
                  ></span>
                ))
              ) : (
                <span className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700"></span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11.5px] pt-1 text-slate-500">
            <span>{metrics.completedBlocksCount}x blocos profundos</span>
            <span className="font-mono">{metrics.ankiCardsToday} cards</span>
          </div>
        </div>

        {/* Card 3: Matérias no Ciclo */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
              Matérias no Ciclo
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                {emptyStateMode ? '0 / 4' : subjectsRatio}
              </span>
              <span className="text-xs text-slate-500">ativas hoje</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{
                  width: `${
                    metrics.totalActiveSubjects > 0
                      ? (metrics.activeSubjectsToday / metrics.totalActiveSubjects) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11.5px] pt-1">
            <span className="text-amber-700 dark:text-amber-400 font-medium">
              {metrics.totalActiveSubjects - metrics.activeSubjectsToday > 0
                ? `${metrics.totalActiveSubjects - metrics.activeSubjectsToday} pendente`
                : 'Todas estudadas'}
            </span>
            <span className="font-mono text-slate-500">75% da grade</span>
          </div>
        </div>

        {/* Card 4: Recuperação & Pausas Intencionais */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
              Recuperação Sináptica
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
                {emptyStateMode ? '0m' : totalBreakStr}
              </span>
              <span className="text-xs text-slate-500">em pausas</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${emptyStateMode ? 0 : 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11.5px] pt-1">
            <span className="text-slate-600 dark:text-slate-400">Pausas conscientes</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
              Zero fadiga
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
