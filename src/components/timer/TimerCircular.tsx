'use client';

import React from 'react';
import { formatSecondsToClock } from '@/lib/utils';
import { TimerStatus } from '@/contexts/TimerContext';
import { BellOff, Sparkles } from 'lucide-react';

interface TimerCircularProps {
  remainingSeconds: number;
  totalSeconds: number;
  status: TimerStatus;
  isBreak?: boolean;
}

export function TimerCircular({
  remainingSeconds,
  totalSeconds,
  status,
  isBreak = false,
}: TimerCircularProps) {
  const radius = 135;
  const circumference = 2 * Math.PI * radius; // ~848.23

  const safeTotal = Math.max(1, totalSeconds);
  const progress = Math.max(0, Math.min(1, (safeTotal - remainingSeconds) / safeTotal));
  const strokeDashoffset = circumference - progress * circumference;

  const clockText = formatSecondsToClock(remainingSeconds);

  return (
    <div className="relative w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center select-none my-2">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
        {/* Fundo do anel */}
        <circle
          className="text-slate-100 dark:text-slate-800"
          cx="160"
          cy="160"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
        />

        {/* Anel de progresso ativo */}
        <circle
          className={`transition-all duration-700 ease-linear ${
            isBreak
              ? 'text-emerald-500 dark:text-emerald-400'
              : 'text-teal-500 dark:text-teal-400'
          }`}
          cx="160"
          cy="160"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Conteúdo Central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold mb-2 ${
            status === 'running'
              ? isBreak
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
              : status === 'paused'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {status === 'running' && (
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                isBreak ? 'bg-emerald-500' : 'bg-teal-500'
              }`}
            ></span>
          )}
          <span>
            {status === 'running'
              ? isBreak
                ? 'PAUSA CONSCIENTE'
                : 'EM FOCO PROFUNDO'
              : status === 'paused'
              ? 'SESSÃO PAUSADA'
              : status === 'completed'
              ? 'BLOCO CONCLUÍDO'
              : 'PRONTO PARA INICIAR'}
          </span>
        </div>

        {/* Dígitos do relógio */}
        <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums my-1">
          {clockText}
        </div>

        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
          Restantes de {formatSecondsToClock(totalSeconds)}
        </span>

        <div className="mt-3 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-mono">
          <BellOff className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Distrações Bloqueadas</span>
        </div>
      </div>
    </div>
  );
}
