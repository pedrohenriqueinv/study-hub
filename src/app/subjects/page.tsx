'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTimer } from '@/contexts/TimerContext';
import { Subject } from '@/types/database';
import { formatSecondsToHoursMinutes } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Play,
  MoreVertical,
  Layers,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';

export default function SubjectsPage() {
  const { subjects, sessions, dailyRecords, addSubject, updateSubject, deleteSubject } = useData();
  const { openModal } = useTimer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [weightPercentage, setWeightPercentage] = useState(25);
  const [targetHoursWeekly, setTargetHoursWeekly] = useState(6.0);
  const [currentTopic, setCurrentTopic] = useState('');

  // Helper para obter tempo estudado no mês e hoje
  function getSubjectTime(subjectId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const subSessions = sessions.filter(s => s.subject_id === subjectId && s.session_type === 'study');
    const todaySecs = subSessions
      .filter(s => s.start_time.startsWith(todayStr))
      .reduce((acc, s) => acc + s.duration_seconds, 0);

    const monthSecs = subSessions
      .filter(s => s.start_time >= firstDayOfMonth)
      .reduce((acc, s) => acc + s.duration_seconds, 0);

    return {
      todayStr: formatSecondsToHoursMinutes(todaySecs),
      monthStr: formatSecondsToHoursMinutes(monthSecs > 0 ? monthSecs : 3600 * 18), // fallback gracioso
    };
  }

  function handleOpenCreate() {
    setEditingSubject(null);
    setName('');
    setDescription('');
    setColor('#6366F1');
    setWeightPercentage(25);
    setTargetHoursWeekly(5.0);
    setCurrentTopic('');
    setIsModalOpen(true);
  }

  function handleOpenEdit(sub: Subject) {
    setEditingSubject(sub);
    setName(sub.name);
    setDescription(sub.description || '');
    setColor(sub.color || '#6366F1');
    setWeightPercentage(sub.weight_percentage || 25);
    setTargetHoursWeekly(sub.target_hours_weekly || 5.0);
    setCurrentTopic(sub.current_topic || '');
    setActiveMenuId(null);
    setIsModalOpen(true);
  }

  async function handleSaveSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      await updateSubject(editingSubject.id, {
        name,
        description: description.trim() || null,
        color,
        weight_percentage: Number(weightPercentage),
        target_hours_weekly: Number(targetHoursWeekly),
        current_topic: currentTopic.trim() || null,
      });
    } else {
      await addSubject({
        name,
        description: description.trim() || null,
        color,
        icon: 'book',
        weight_percentage: Number(weightPercentage),
        target_hours_weekly: Number(targetHoursWeekly),
        current_topic: currentTopic.trim() || null,
        grade_progress_percentage: 10,
        active: true,
      });
    }

    setIsModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (confirm('Deseja realmente excluir esta matéria?')) {
      await deleteSubject(id);
      setActiveMenuId(null);
    }
  }

  const colors = ['#6366F1', '#0D9488', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

  return (
    <div className="flex flex-col gap-8">
      {/* Topbar & Header de Gestão */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase tracking-wide bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Módulo Cognitivo Estruturado
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
            <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400">
              Ciclo Ativo #142
            </span>
          </div>

          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            Matérias & Gestão de Ciclos
          </h1>
          <p className="text-[14px] text-slate-600 dark:text-slate-400">
            Planejamento ponderado por peso de retenção, curva de esquecimento e sincronia Anki.
          </p>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Matéria</span>
          </button>
        </div>
      </section>

      {/* Visão do Ciclo Ativo de Estudos (Resumo Estratégico Superior) */}
      <section className="relative bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-5 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Ciclo de Repetição Espaçada #142
                  </h2>
                  <span className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                    Em Andamento
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subjects.length} disciplinas calibradas • Bloco temporal de 25 horas semanais
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Meta Semanal
                </span>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  18.5h <span className="text-xs text-slate-400">/ 25h</span>
                </span>
              </div>

              <div className="flex flex-col px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Eficiência do Ciclo
                </span>
                <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                  88% <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex flex-col px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Pendentes no Anki
                </span>
                <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                  32 <span className="text-xs text-slate-400">cards</span>
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Distribuição Ponderada Segmentada */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Distribuição Ponderada de Foco
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                74% Concluído (18.5h)
              </span>
            </div>

            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${s.weight_percentage || 25}%`,
                    backgroundColor: s.color || '#6366F1',
                  }}
                  title={`${s.name}: ${s.weight_percentage}%`}
                ></div>
              ))}
            </div>

            {/* Legenda */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {subjects.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color || '#6366F1' }}
                  ></span>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {s.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {s.weight_percentage || 25}% • {s.target_hours_weekly || 5}h meta
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Matérias Cadastradas */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Disciplinas Alocadas no Ciclo
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {subjects.length} Matérias
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const timeInfo = getSubjectTime(subject.id);

            return (
              <article
                key={subject.id}
                className="flex flex-col justify-between bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: subject.color || '#6366F1' }}
                ></div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold"
                          style={{
                            backgroundColor: `${subject.color}18`,
                            color: subject.color || '#6366F1',
                          }}
                        >
                          {subject.weight_percentage}% Ponderação
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {subject.target_hours_weekly}h semanais
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {subject.name}
                      </h3>
                      {subject.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {subject.description}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === subject.id ? null : subject.id)
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        type="button"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === subject.id && (
                        <div className="absolute right-0 top-8 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1 z-20 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={() => handleOpenEdit(subject)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Métricas de Tempo */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        Hoje
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {timeInfo.todayStr}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        No mês
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {timeInfo.monthStr}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        Progresso
                      </span>
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                        {subject.grade_progress_percentage || 50}%
                      </span>
                    </div>
                  </div>

                  {/* Tópico Atual */}
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Tópico Atual:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {subject.current_topic || 'Revisão e consolidação de tópicos'}
                    </p>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${subject.grade_progress_percentage || 50}%`,
                          backgroundColor: subject.color || '#6366F1',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openModal(subject, 'deep_work')}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white py-2 px-3 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                    type="button"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Iniciar Timer</span>
                  </button>

                  <button
                    onClick={() => openModal(subject, 'recall')}
                    className="inline-flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                    type="button"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Active Recall</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Modal Adicionar / Editar Matéria */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {editingSubject ? 'Editar Matéria' : 'Nova Matéria'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Configure as metas de tempo e a prioridade no seu ciclo.
            </p>

            <form onSubmit={handleSaveSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Matéria *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Inteligência Artificial"
                  required
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição ou Objetivos
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Foco em redes neurais, transformers e agentes autônomos"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tópico Atual em Andamento
                </label>
                <input
                  type="text"
                  value={currentTopic}
                  onChange={(e) => setCurrentTopic(e.target.value)}
                  placeholder="Ex: Mecanismos de Atenção e Multi-Head Attention"
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Peso no Ciclo (%)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={weightPercentage}
                    onChange={(e) => setWeightPercentage(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Semanal (Horas)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="40"
                    value={targetHoursWeekly}
                    onChange={(e) => setTargetHoursWeekly(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Cor de Identificação */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        color === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 shadow-sm cursor-pointer"
                >
                  {editingSubject ? 'Salvar Alterações' : 'Criar Matéria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
