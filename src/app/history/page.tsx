'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import {
  History as HistoryIcon,
  Download,
  Filter,
  CheckCircle2,
  Coffee,
  BookOpen,
  Calendar,
  Layers,
  Trash2,
} from 'lucide-react';

export default function HistoryPage() {
  const { sessions, subjects, dailyRecords, deleteSession } = useData();

  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateSearch, setDateSearch] = useState<string>('');

  const filteredSessions = sessions.filter(session => {
    if (subjectFilter !== 'all' && session.subject_id !== subjectFilter) {
      return false;
    }
    if (typeFilter !== 'all' && session.session_type !== typeFilter) {
      return false;
    }
    if (dateSearch && !session.start_time.startsWith(dateSearch)) {
      return false;
    }
    return true;
  });

  const totalStudySeconds = filteredSessions
    .filter(s => s.session_type === 'study')
    .reduce((acc, s) => acc + s.duration_seconds, 0);

  const totalBreakSeconds = filteredSessions
    .filter(s => s.session_type === 'break')
    .reduce((acc, s) => acc + s.duration_seconds, 0);

  function exportCSV() {
    const rows = [
      ['Data', 'Hora', 'Matéria', 'Tipo', 'Duração (Min)', 'Nota', 'Flashcards Anki'],
      ...filteredSessions.map(s => {
        const sub = subjects.find(sub => sub.id === s.subject_id);
        const dateStr = s.start_time.split('T')[0];
        const timeStr = new Date(s.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const record = dailyRecords.find(r => r.subject_id === s.subject_id && r.date === dateStr);

        return [
          dateStr,
          timeStr,
          sub?.name || 'Geral/Pausa',
          s.session_type,
          Math.round(s.duration_seconds / 60),
          `"${(s.notes || record?.learning_note || '').replace(/"/g, '""')}"`,
          record?.anki_completed ? 'Sim' : 'Não',
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historico_estudos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase tracking-wide bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Histórico & Auditoria
            </span>
          </div>

          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            Histórico Completo de Sessões
          </h1>
          <p className="text-[14px] text-slate-600 dark:text-slate-400">
            Consulte datas, matérias, tempo estudado, notas consolidadas e flashcards criados.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          type="button"
        >
          <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Exportar Relatório (.CSV)</span>
        </button>
      </div>

      {/* Resumo Rápido dos Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col">
          <span className="text-xs font-semibold uppercase text-slate-400">Tempo Focado Filtrado</span>
          <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatSecondsToHoursMinutes(totalStudySeconds)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col">
          <span className="text-xs font-semibold uppercase text-slate-400">Pausas Conscientes</span>
          <span className="font-mono text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
            {formatSecondsToHoursMinutes(totalBreakSeconds)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col">
          <span className="text-xs font-semibold uppercase text-slate-400">Total de Sessões</span>
          <span className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {filteredSessions.length} blocos
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Matéria */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Matéria:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Sessão */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os tipos</option>
              <option value="study">Estudo Focado</option>
              <option value="break">Pausa / Descanso</option>
            </select>
          </div>

          {/* Busca por data */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Data:</span>
            <input
              type="date"
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none font-mono text-xs"
            />
            {dateSearch && (
              <button
                onClick={() => setDateSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs underline"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <span className="font-mono text-slate-400">
          Mostrando {filteredSessions.length} registros
        </span>
      </div>

      {/* Tabela Responsiva */}
      <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Matéria</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Duração</th>
                <th className="py-3.5 px-4">O que aprendeu / Notas</th>
                <th className="py-3.5 px-4">Anki</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhuma sessão encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const subject = subjects.find(s => s.id === session.subject_id);
                  const dateStr = session.start_time.split('T')[0];
                  const timeStr = new Date(session.start_time).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const durationStr = formatSecondsToHoursMinutes(session.duration_seconds);

                  const record = dailyRecords.find(
                    r => r.subject_id === session.subject_id && r.date === dateStr
                  );

                  const isStudy = session.session_type === 'study';

                  return (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <span className="font-semibold block">{dateStr}</span>
                        <span className="text-[10.5px] text-slate-400">{timeStr}</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {isStudy ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: subject?.color || '#6366F1' }}
                            ></span>
                            <span>{subject?.name || 'Geral'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Pausa / Descanso</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            isStudy
                              ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          }`}
                        >
                          {isStudy ? 'Estudo' : 'Descanso'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {durationStr}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {session.notes || record?.learning_note || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {record?.anki_completed ? (
                          <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sim ({record.anki_cards_count || 12})</span>
                          </span>
                        ) : isStudy ? (
                          <span className="text-slate-400 text-[11px]">Não</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Deseja excluir esta sessão do histórico?')) {
                              deleteSession(session.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Excluir sessão"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
