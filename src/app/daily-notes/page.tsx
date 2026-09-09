'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { getTodayDateString } from '@/lib/utils';
import {
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  Plus,
  Filter,
  Calendar,
  Tag,
  Save,
  X,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DailyNotesPage() {
  const { subjects, dailyRecords, saveDailyRecord } = useData();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form para nova nota rápida
  const [modalSubjectId, setModalSubjectId] = useState(subjects[0]?.id || '');
  const [modalDate, setModalDate] = useState(getTodayDateString());
  const [modalNote, setModalNote] = useState('');
  const [modalAnki, setModalAnki] = useState(true);
  const [modalCardsCount, setModalCardsCount] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const filteredRecords = dailyRecords.filter(r => {
    if (selectedSubjectFilter === 'all') return true;
    return r.subject_id === selectedSubjectFilter;
  });

  async function handleToggleAnki(record: typeof dailyRecords[0]) {
    await saveDailyRecord({
      subject_id: record.subject_id,
      date: record.date,
      learning_note: record.learning_note,
      anki_completed: !record.anki_completed,
      anki_cards_count: !record.anki_completed ? (record.anki_cards_count || 10) : 0,
    });
  }

  async function handleSaveNewRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!modalSubjectId || !modalNote.trim()) return;

    setIsSaving(true);
    try {
      await saveDailyRecord({
        subject_id: modalSubjectId,
        date: modalDate,
        learning_note: modalNote.trim(),
        anki_completed: modalAnki,
        anki_cards_count: modalAnki ? Number(modalCardsCount) || 1 : 0,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#6366F1'],
      });

      setIsModalOpen(false);
      setModalNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase tracking-wide bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Retenção Ativa Diária
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
            <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400">
              Sincronização Anki
            </span>
          </div>

          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            Diário de Aprendizado & Flashcards Rápidos
          </h1>
          <p className="text-[14px] text-slate-600 dark:text-slate-400">
            Últimas sínteses ativas registradas ao finalizar sessões do cronômetro.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro por matéria */}
          <div className="relative">
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Matérias</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setModalSubjectId(subjects[0]?.id || '');
              setModalDate(getTodayDateString());
              setModalNote('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Registro</span>
          </button>
        </div>
      </div>

      {/* Lista de Registros Diários */}
      <div className="flex flex-col gap-4">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#0E131F] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Nenhum registro encontrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete um bloco no timer ou clique em &quot;Novo Registro&quot; para registrar o que aprendeu.
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const subject = subjects.find(s => s.id === record.subject_id);

            return (
              <article
                key={record.id}
                className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-3 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-1"
                  style={{ backgroundColor: subject?.color || '#6366F1' }}
                ></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleAnki(record)}
                      className="text-teal-600 dark:text-teal-400 cursor-pointer"
                      title="Marcar/Desmarcar criação de flashcards"
                    >
                      {record.anki_completed ? (
                        <CheckSquare className="w-5 h-5 fill-teal-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <span
                      className="px-2.5 py-0.5 rounded text-xs font-bold"
                      style={{
                        backgroundColor: `${subject?.color || '#6366F1'}15`,
                        color: subject?.color || '#6366F1',
                      }}
                    >
                      {subject?.name || 'Geral'}
                    </span>

                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      • {subject?.current_topic || 'Consolidação teórica'}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-slate-400 pl-7 sm:pl-0">
                    {record.date}
                  </span>
                </div>

                {/* Frase "Hoje eu aprendi..." */}
                <div className="pl-7 pr-2">
                  <blockquote className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border-l-2 border-teal-500">
                    &ldquo;{record.learning_note || 'Nenhuma nota detalhada registrada nesta sessão.'}&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #retencao-ativa
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #ebbinghaus-r1
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {record.anki_completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg">
                          <Sparkles className="w-3 h-3" />
                          Flashcards Criados ({record.anki_cards_count || 12} cards)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleAnki(record)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Marcar Flashcards Feitos
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Modal Novo Registro */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Novo Registro no Diário
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Escreva uma frase curta descrevendo o que aprendeu hoje e marque se criou os flashcards.
            </p>

            <form onSubmit={handleSaveNewRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Matéria *
                  </label>
                  <select
                    value={modalSubjectId}
                    onChange={(e) => setModalSubjectId(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    required
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hoje eu aprendi... *
                </label>
                <textarea
                  rows={4}
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="Descreva em poucas palavras o conceito ou insight fixado hoje..."
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={modalAnki}
                    onChange={(e) => setModalAnki(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-0 accent-teal-600 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Criei os flashcards no Anki
                  </span>
                </label>

                {modalAnki && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Cards:</span>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={modalCardsCount}
                      onChange={(e) => setModalCardsCount(parseInt(e.target.value, 10) || 1)}
                      className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 shadow-sm cursor-pointer"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
