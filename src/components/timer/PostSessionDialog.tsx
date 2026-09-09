'use client';

import React, { useState } from 'react';
import { useTimer } from '@/contexts/TimerContext';
import { useData } from '@/contexts/DataContext';
import { formatSecondsToHoursMinutes, getTodayDateString } from '@/lib/utils';
import { Sparkles, CheckSquare, Save, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export function PostSessionDialog() {
  const { postSessionData, closePostSessionDialog } = useTimer();
  const { subjects, saveDailyRecord } = useData();

  const [learningNote, setLearningNote] = useState('');
  const [ankiCompleted, setAnkiCompleted] = useState(true);
  const [cardsCount, setCardsCount] = useState(12);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!postSessionData || !postSessionData.isOpen || !postSessionData.subjectId) {
    return null;
  }

  const subject = subjects.find(s => s.id === postSessionData.subjectId);
  const durationText = formatSecondsToHoursMinutes(postSessionData.durationSeconds);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!postSessionData?.subjectId) return;

    setIsSaving(true);
    try {
      await saveDailyRecord({
        subject_id: postSessionData.subjectId,
        date: getTodayDateString(),
        learning_note: learningNote.trim() || null,
        anki_completed: ankiCompleted,
        anki_cards_count: ankiCompleted ? Number(cardsCount) || 0 : 0,
      });

      // Efeito de celebração com confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#14B8A6', '#6366F1', '#F59E0B'],
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        closePostSessionDialog();
      }, 1400);
    } catch (err) {
      console.error('Erro ao salvar no diário:', err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative flex flex-col overflow-hidden">
        {/* Close button */}
        <button
          onClick={closePostSessionDialog}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Fechamento de Sessão • {durationText}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {subject?.name || 'Diário de Aprendizado'}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Fixe a retenção do bloco que você acabou de concluir. Sintetize em poucas palavras o insight essencial antes de alternar o foco.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Hoje eu aprendi... */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="learningNote" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hoje eu aprendi...
            </label>
            <textarea
              id="learningNote"
              rows={3}
              value={learningNote}
              onChange={(e) => setLearningNote(e.target.value)}
              placeholder="Ex: Entendi que a inserção na árvore rubro-negra com tio vermelho exige recoloração, e tio preto exige rotação simples ou dupla..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
              autoFocus
            />
          </div>

          {/* Checklist Anki */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ankiCompleted}
                onChange={(e) => setAnkiCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 border-slate-300 dark:border-slate-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Criei os flashcards no Anki
              </span>
            </label>

            {ankiCompleted && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[11px] font-mono text-slate-400">Qtd cards:</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={cardsCount}
                  onChange={(e) => setCardsCount(parseInt(e.target.value, 10) || 0)}
                  className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closePostSessionDialog}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Pular Registro
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>Registrado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar no Diário'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
