'use client';

import React, { useState } from 'react';
import { useTimer, TimerMode } from '@/contexts/TimerContext';
import { useData } from '@/contexts/DataContext';
import { PlayCircle, ChevronDown, Zap } from 'lucide-react';

export function QuickFocusEngine() {
  const { openModal } = useTimer();
  const { subjects } = useData();

  const [selectedMode, setSelectedMode] = useState<TimerMode>('deep_work');
  const [selectedSubId, setSelectedSubId] = useState<string>(subjects[0]?.id || '');

  const modeMinutes = selectedMode === 'deep_work' ? 50 : selectedMode === 'pomodoro' ? 25 : 15;

  function handleStart() {
    const chosenSubject = subjects.find(s => s.id === selectedSubId) || subjects[0] || null;
    openModal(chosenSubject, selectedMode);
  }

  return (
    <section
      aria-labelledby="quick-focus-heading"
      className="bg-slate-900 dark:bg-[#111827] text-white p-5 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden"
    >
      {/* Geometric Accent */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          Quick Focus Engine
        </span>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          Deep Work
        </span>
      </div>

      <h3
        id="quick-focus-heading"
        className="text-[18px] font-bold text-white tracking-tight leading-snug"
      >
        Pronto para o próximo bloco?
      </h3>

      <p className="text-xs text-slate-300 mt-1">
        Selecione a matéria e a modalidade de foco para sincronizar o cronômetro com seu banco de retenção.
      </p>

      {/* Modalidade Selector */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/90 rounded-xl my-4 text-xs font-semibold">
        <button
          onClick={() => setSelectedMode('deep_work')}
          className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
            selectedMode === 'deep_work'
              ? 'bg-teal-500 text-slate-950 shadow-xs font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
          type="button"
        >
          50m Foco
        </button>

        <button
          onClick={() => setSelectedMode('pomodoro')}
          className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
            selectedMode === 'pomodoro'
              ? 'bg-teal-500 text-slate-950 shadow-xs font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
          type="button"
        >
          25m Pomo
        </button>

        <button
          onClick={() => setSelectedMode('recall')}
          className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
            selectedMode === 'recall'
              ? 'bg-teal-500 text-slate-950 shadow-xs font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
          type="button"
        >
          15m Recall
        </button>
      </div>

      {/* Subject Select */}
      <div className="mb-4">
        <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
          Matéria de foco:
        </label>
        <div className="relative">
          <select
            value={selectedSubId || subjects[0]?.id || ''}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="w-full bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700/80 focus:border-teal-400 focus:outline-none appearance-none font-medium cursor-pointer"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={handleStart}
        className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        type="button"
      >
        <PlayCircle className="w-4 h-4" />
        <span>Abrir Timer de Foco ({modeMinutes}:00)</span>
      </button>
    </section>
  );
}
