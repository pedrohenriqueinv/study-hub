'use client';

import React, { useState } from 'react';
import { useTimer, TIMER_PRESETS, TimerMode } from '@/contexts/TimerContext';
import { useData } from '@/contexts/DataContext';
import { TimerCircular } from '@/components/timer/TimerCircular';
import { formatSecondsToHoursMinutes, getTodayDateString } from '@/lib/utils';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Headphones,
  Maximize2,
  Minimize2,
  CheckSquare,
  Sparkles,
  Save,
  Layers,
  History,
  Target,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TimerPage() {
  const {
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

  const { subjects, sessions, metrics, saveDailyRecord } = useData();

  // Micro-checklist deste bloco
  const [subtasks, setSubtasks] = useState([
    { id: 't1', text: 'Revisar propriedades teóricas e definições', completed: true },
    { id: 't2', text: 'Mapear casos de borda e invariantes estruturais', completed: true },
    { id: 't3', text: 'Implementar exercícios práticos e fixar recall', completed: false },
  ]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  // Diário de retenção inferior
  const [retentionText, setRetentionText] = useState('');
  const [exportAnki, setExportAnki] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  function toggleSubtask(id: string) {
    setSubtasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function addSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: `t_${Date.now()}`, text: newSubtaskText.trim(), completed: false },
    ]);
    setNewSubtaskText('');
    setShowAddSubtask(false);
  }

  async function handleSaveRetention(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubject) return;

    setIsSaving(true);
    try {
      await saveDailyRecord({
        subject_id: selectedSubject.id,
        date: getTodayDateString(),
        learning_note: retentionText.trim() || null,
        anki_completed: exportAnki,
        anki_cards_count: exportAnki ? 12 : 0,
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0D9488', '#6366F1', '#14B8A6'],
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      setRetentionText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullScreen(false);
      }
    }
  }

  const activePreset = TIMER_PRESETS[mode];
  const todaySessions = sessions.filter(s => {
    const todayStr = getTodayDateString();
    return s.start_time.startsWith(todayStr);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Topbar Contextual & Métricas Cognitivas */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-xs font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Sessão Ativa: {selectedSubject?.name || 'Foco Geral'}
            </span>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
              CICLO #142 • BLOCO B
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Timer de Foco & Modos Cognitivos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Ambiente imersivo para retenção de alta fidelidade e eliminação cirúrgica de sobrecarga mental.
          </p>
        </div>

        {/* Micro-pills de Performance Diária */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Tempo Focado
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {formatSecondsToHoursMinutes(metrics.totalStudySecondsToday)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Pausas
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">
                {formatSecondsToHoursMinutes(metrics.totalBreakSecondsToday)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Eficiência
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {metrics.efficiencyToday}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Painel Central: Grid Principal (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timer Master Canvas */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Seletor de Protocolo Sináptico */}
          <div className="flex items-center justify-between pb-4 flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Protocolo Sináptico
            </span>

            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex-wrap gap-1">
              <button
                onClick={() => setMode('deep_work')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'deep_work'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                type="button"
              >
                Deep Work (50m • 10m)
              </button>

              <button
                onClick={() => setMode('pomodoro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'pomodoro'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                type="button"
              >
                Pomodoro (25m • 5m)
              </button>

              <button
                onClick={() => setMode('recall')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'recall'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                type="button"
              >
                Active Recall (15m)
              </button>

              <button
                onClick={() => setMode('break')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'break'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                type="button"
              >
                Pausa (10m)
              </button>
            </div>
          </div>

          {/* Matéria de Estudo Ativa */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 my-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs"
                style={{
                  backgroundColor: `${selectedSubject?.color || '#6366F1'}20`,
                  color: selectedSubject?.color || '#6366F1',
                }}
              >
                {selectedSubject?.name.substring(0, 2).toUpperCase() || 'ED'}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSubject?.id || ''}
                    onChange={(e) => {
                      const sub = subjects.find(s => s.id === e.target.value) || null;
                      setSelectedSubject(sub);
                    }}
                    className="font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-transparent border-none focus:outline-none cursor-pointer p-0"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tópico: {selectedSubject?.current_topic || 'Revisão geral do módulo'}
                </span>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-mono text-xs bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Codificação & Análise
            </span>
          </div>

          {/* Core SVG Circular Display */}
          <div className="flex justify-center py-4">
            <TimerCircular
              remainingSeconds={remainingSeconds}
              totalSeconds={targetSeconds}
              status={status}
              isBreak={activePreset.sessionType === 'break'}
            />
          </div>

          {/* Botões de Controle Tátil */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={toggleTimer}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold text-sm px-8 py-3 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer ${
                status === 'running'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
              }`}
              type="button"
            >
              {status === 'running' ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar Sessão</span>
                </>
              ) : status === 'paused' ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Retomar Foco</span>
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              type="button"
            >
              <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Concluir Bloco</span>
            </button>

            <button
              onClick={resetTimer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </button>
          </div>

          {/* Quick Toggles de Ambiente */}
          <div className="flex flex-wrap items-center justify-around gap-4 pt-6 mt-6 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
            <button
              onClick={() => setSoundMode(soundMode === 'gamma' ? 'off' : 'gamma')}
              className={`inline-flex items-center gap-1.5 font-medium cursor-pointer ${
                soundMode === 'gamma'
                  ? 'text-teal-600 dark:text-teal-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              type="button"
            >
              <Headphones className="w-4 h-4" />
              <span>Ruído Gama 40Hz {soundMode === 'gamma' ? '(Ativo)' : ''}</span>
            </button>

            <button
              onClick={() => setSoundMode(soundMode === 'brown' ? 'off' : 'brown')}
              className={`inline-flex items-center gap-1.5 font-medium cursor-pointer ${
                soundMode === 'brown'
                  ? 'text-teal-600 dark:text-teal-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              type="button"
            >
              <Headphones className="w-4 h-4" />
              <span>Brown Noise {soundMode === 'brown' ? '(Ativo)' : ''}</span>
            </button>

            <button
              onClick={toggleFullScreen}
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              type="button"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isFullScreen ? 'Sair Tela Cheia' : 'Modo Imersivo'}</span>
            </button>
          </div>
        </div>

        {/* Inspector Lateral (4 colunas) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card: Acústica & Frequência Cognitiva */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Camada Acústica
                </h3>
              </div>
              <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded font-semibold">
                {soundMode !== 'off' ? 'Ativo' : 'Pausado'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                <span>{soundMode === 'gamma' ? 'Gamma Wave 40.0 Hz' : soundMode === 'brown' ? 'Brown Noise Profundo' : 'Áudio Desativado'}</span>
                <span className="font-mono text-[11px] text-slate-400">Web Audio API</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Projetado para tarefas de alta retenção mnemônica e raciocínio lógico formal.
              </p>

              {/* Mini visualizer de ondas */}
              <div className="h-6 flex items-center gap-1 mt-1 px-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                {[12, 20, 15, 24, 18, 10, 22, 14, 20, 16, 26, 12].map((height, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all ${
                      soundMode !== 'off' ? 'bg-teal-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{
                      height: `${height}px`,
                      animationDelay: `${idx * 80}ms`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setSoundMode('gamma')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-left font-medium transition-colors cursor-pointer"
                type="button"
              >
                Gama 40Hz Foco
              </button>
              <button
                onClick={() => setSoundMode('brown')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-left font-medium transition-colors cursor-pointer"
                type="button"
              >
                Brown Noise
              </button>
            </div>
          </div>

          {/* Card: Micro-Objetivos do Bloco Vigente */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Metas Deste Bloco
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {subtasks.filter(t => t.completed).length} / {subtasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {subtasks.map(t => (
                <label
                  key={t.id}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleSubtask(t.id)}
                    className="mt-0.5 w-4 h-4 rounded text-teal-600 border-slate-300 dark:border-slate-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <span
                    className={`text-xs ${
                      t.completed
                        ? 'text-slate-400 line-through'
                        : 'text-slate-800 dark:text-slate-200 font-medium'
                    }`}
                  >
                    {t.text}
                  </span>
                </label>
              ))}
            </div>

            {showAddSubtask ? (
              <form onSubmit={addSubtask} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Nova meta do bloco..."
                  autoFocus
                  className="flex-1 h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 h-8 bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold rounded-lg"
                >
                  Adicionar
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowAddSubtask(true)}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline pt-1 text-left font-medium cursor-pointer"
                type="button"
              >
                + Adicionar sub-tarefa rápida
              </button>
            )}
          </div>

          {/* Card: Integração Anki */}
          <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Deck Sincronizado
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedSubject?.name || 'Algoritmos_2025'}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
              +12 cards
            </span>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Diário de Retenção Ativa & Histórico de Hoje */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Formulário de Consolidação Pós-Sessão (7 colunas) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Diário de Retenção Ativa
              </h2>
            </div>
            <span className="text-[11px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
              Fechamento Imediato
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registre em uma ou duas frases a essência do que foi assimilado antes da troca de contexto mental.
          </p>

          <form onSubmit={handleSaveRetention} className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="retention-input"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
              >
                O que você consolidou com total clareza?
              </label>
              <textarea
                id="retention-input"
                rows={3}
                value={retentionText}
                onChange={(e) => setRetentionText(e.target.value)}
                placeholder="Ex: Fixei a diferença estrutural entre re-coloração de nós e rotações duplas na inserção de folhas filhas..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportAnki}
                  onChange={(e) => setExportAnki(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-0 accent-teal-600 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Exportar insights para o Anki Deck
                </span>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-600'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savedSuccess ? 'Salvo com Sucesso!' : isSaving ? 'Salvando...' : 'Salvar no Diário'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Mini Feed Histórico de Blocos Completados Hoje (5 colunas) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Blocos Concluídos Hoje
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {todaySessions.length} blocos
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {todaySessions.slice(0, 3).map((sess) => {
              const sub = subjects.find(s => s.id === sess.subject_id);
              const minutes = Math.round(sess.duration_seconds / 60);

              return (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {sess.session_type === 'study' ? sub?.name || 'Estudo Focado' : 'Pausa Consciente'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {sess.notes || 'Consolidação e foco sem ruído'}
                      </span>
                      <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 mt-1">
                        100% atenção • {sess.session_type}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white shrink-0">
                    {minutes} min
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
