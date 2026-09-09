'use client';

import React, { useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, Headphones, Volume2, VolumeX } from 'lucide-react';
import { useTimer, TIMER_PRESETS, TimerMode } from '@/contexts/TimerContext';
import { useData } from '@/contexts/DataContext';
import { TimerCircular } from './TimerCircular';

export function FocusTimerModal() {
  const {
    isModalOpen,
    closeModal,
    status,
    mode,
    setMode,
    selectedSubject,
    setSelectedSubject,
    targetSeconds,
    remainingSeconds,
    toggleTimer,
    resetTimer,
    completeSession,
    soundMode,
    setSoundMode,
  } = useTimer();

  const { subjects } = useData();
  const activePreset = TIMER_PRESETS[mode];

  // Atalho de teclado: Tecla Espaço para pausar/continuar e Esc para fechar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isModalOpen) return;

      if (e.key === 'Escape') {
        closeModal();
      } else if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
          e.preventDefault();
          toggleTimer();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal, toggleTimer]);

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative flex flex-col items-center text-center overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Botão Fechar */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          type="button"
          aria-label="Fechar timer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Seletor de Modalidade */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-4 text-xs font-semibold w-full max-w-sm">
          <button
            onClick={() => setMode('deep_work')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              mode === 'deep_work'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            type="button"
          >
            50m Foco
          </button>
          <button
            onClick={() => setMode('pomodoro')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            type="button"
          >
            25m Pomo
          </button>
          <button
            onClick={() => setMode('recall')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              mode === 'recall'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            type="button"
          >
            15m Recall
          </button>
          <button
            onClick={() => setMode('break')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              mode === 'break'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            type="button"
          >
            10m Pausa
          </button>
        </div>

        {/* Matéria Atual / Seletor */}
        {activePreset.sessionType === 'study' ? (
          <div className="w-full max-w-xs mb-3">
            <select
              value={selectedSubject?.id || ''}
              onChange={(e) => {
                const sub = subjects.find(s => s.id === e.target.value) || null;
                setSelectedSubject(sub);
              }}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-teal-500 text-center cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Pausa Consciente & Recuperação Sináptica
          </div>
        )}

        {/* Relógio SVG Circular */}
        <TimerCircular
          remainingSeconds={remainingSeconds}
          totalSeconds={targetSeconds}
          status={status}
          isBreak={activePreset.sessionType === 'break'}
        />

        {/* Controles Principais */}
        <div className="flex items-center gap-3 w-full max-w-xs mt-2">
          <button
            onClick={toggleTimer}
            className={`flex-1 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer ${
              status === 'running'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
            }`}
            type="button"
          >
            {status === 'running' ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar Foco</span>
              </>
            ) : status === 'paused' ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Continuar Foco</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Foco</span>
              </>
            )}
          </button>

          <button
            onClick={completeSession}
            disabled={status === 'idle'}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Concluir bloco agora"
            type="button"
          >
            <CheckCircle className="w-4 h-4" />
          </button>

          <button
            onClick={resetTimer}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reiniciar tempo"
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Controles Acústicos Procedurais */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs w-full max-w-sm justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Headphones className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-mono text-[11px]">Áudio Foco:</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundMode(soundMode === 'gamma' ? 'off' : 'gamma')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                soundMode === 'gamma'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              type="button"
            >
              Gama 40Hz
            </button>

            <button
              onClick={() => setSoundMode(soundMode === 'brown' ? 'off' : 'brown')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                soundMode === 'brown'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              type="button"
            >
              Brown Noise
            </button>

            {soundMode !== 'off' && (
              <button
                onClick={() => setSoundMode('off')}
                className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                title="Desativar áudio"
                type="button"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dica de atalho */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-mono">
          Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Espaço</kbd> para pausar/retomar
        </p>
      </div>
    </div>
  );
}
