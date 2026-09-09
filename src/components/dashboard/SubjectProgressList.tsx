'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { useTimer } from '@/contexts/TimerContext';
import { Play, AlertCircle, CheckCircle2, Plus, Filter } from 'lucide-react';
import { Subject } from '@/types/database';

interface SubjectProgressListProps {
  onOpenNewSubjectModal?: () => void;
}

export function SubjectProgressList({ onOpenNewSubjectModal }: SubjectProgressListProps) {
  const { subjects, sessions, dailyRecords } = useData();
  const { openModal } = useTimer();

  // Helper para obter tempo estudado hoje em uma matéria
  function getTodaySubjectSeconds(subjectId: string): number {
    const todayStr = new Date().toISOString().split('T')[0];
    const subjectSessions = sessions.filter(
      s => s.subject_id === subjectId && s.start_time.startsWith(todayStr) && s.session_type === 'study'
    );
    return subjectSessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  }

  function getSubjectAnkiStatus(subjectId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const rec = dailyRecords.find(r => r.subject_id === subjectId && r.date === todayStr);

    if (rec && rec.anki_completed) {
      return {
        type: 'done',
        text: `Anki Sync: ${rec.anki_cards_count || 12} cards revisados`,
        percentage: '94%',
      };
    }
    if (rec && !rec.anki_completed) {
      return {
        type: 'pending',
        text: `Anki Pendente: ${rec.anki_cards_count || 8} flashcards para revisar`,
        percentage: '25%',
      };
    }
    return {
      type: 'idle',
      text: 'Deck em Dia • Retenção estimada 94%',
      percentage: '70%',
    };
  }

  return (
    <section aria-labelledby="subjects-heading" className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2
            id="subjects-heading"
            className="text-[13px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded bg-indigo-600 dark:bg-indigo-400"></span>
            2. O que preciso estudar
          </h2>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            Prioridade Ponderada
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/subjects"
            className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar</span>
          </Link>

          <Link
            href="/subjects"
            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Matéria</span>
          </Link>
        </div>
      </div>

      {/* Cards de Matérias */}
      <div className="flex flex-col gap-3">
        {subjects.map((subject, index) => {
          const todaySeconds = getTodaySubjectSeconds(subject.id);
          const minutesToday = Math.round(todaySeconds / 60);
          const hoursToday = Math.floor(minutesToday / 60);
          const remMin = minutesToday % 60;
          const timeText = hoursToday > 0 ? `${hoursToday}h ${remMin}m hoje` : `${remMin}m hoje`;

          const ankiStatus = getSubjectAnkiStatus(subject.id);
          const isCurrentActive = index === 0;

          return (
            <div
              key={subject.id}
              className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all group relative overflow-hidden"
            >
              {/* Barra lateral colorida da matéria */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1"
                style={{ backgroundColor: subject.color || '#6366F1' }}
              ></div>

              <div className="pl-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${subject.color}15`,
                        color: subject.color || '#6366F1',
                      }}
                    >
                      {subject.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">
                          {subject.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {timeText}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Próximo tópico:{' '}
                        <strong className="text-slate-700 dark:text-slate-200 font-medium">
                          {subject.current_topic || 'Revisão geral do módulo'}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => openModal(subject, 'deep_work')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer ${
                        isCurrentActive
                          ? 'bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white'
                          : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                      type="button"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCurrentActive ? 'Continuar' : 'Estudar'}</span>
                    </button>
                  </div>
                </div>

                {/* Anki / Flashcard Integration Row */}
                <div className="flex items-center justify-between pt-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    {ankiStatus.type === 'pending' ? (
                      <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{ankiStatus.text}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ankiStatus.text}</span>
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[11px] text-slate-400">
                    Grade: {subject.grade_progress_percentage || 50}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
