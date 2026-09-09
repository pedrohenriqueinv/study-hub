'use client';

import React from 'react';
import { Calendar, Play, Sparkles, Sun, Moon } from 'lucide-react';
import { formatDatePTBR, formatSecondsToHoursMinutes, getWeekNumber } from '@/lib/utils';
import { useTimer } from '@/contexts/TimerContext';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';

export function TopHeader() {
  const { openModal } = useTimer();
  const { metrics } = useData();
  const { theme, toggleTheme } = useTheme();

  const formattedDate = formatDatePTBR(new Date());
  const weekNumber = getWeekNumber(new Date());
  const timeTodayStr = formatSecondsToHoursMinutes(metrics.totalStudySecondsToday);

  return (
    <header className="sticky top-0 h-16 bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 z-40 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Logo Title */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-teal-400">
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-[16px]">Synapse</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[13px] font-medium">
          <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>{formattedDate}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-mono text-slate-600 dark:text-slate-300 text-[12px]">
            Semana {weekNumber}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Daily Total */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[12.5px]">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="hidden md:inline text-slate-500 dark:text-slate-400">Tempo focado hoje:</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-white">
            {timeTodayStr}
          </span>
        </div>

        {/* Quick Session Button */}
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          type="button"
        >
          <Play className="w-4 h-4 fill-white" />
          <span className="hidden xs:inline">Iniciar Sessão</span>
        </button>

        {/* Mobile theme toggle */}
        <button
          onClick={toggleTheme}
          className="lg:hidden w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          type="button"
          title="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
