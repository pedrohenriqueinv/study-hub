'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTimer } from '@/contexts/TimerContext';
import {
  Brain,
  Timer,
  Layers,
  TrendingUp,
  Download,
  Calendar,
  Sparkles,
  PieChart,
  Sun,
  Sunset,
  Moon,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  PlayCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

export default function AnalyticsPage() {
  const { subjects, sessions } = useData();
  const { openModal } = useTimer();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');

  // Dados para gráficos do Recharts
  const subjectTimeData = subjects.map(s => {
    const subSessions = sessions.filter(sess => sess.subject_id === s.id && sess.session_type === 'study');
    const totalSecs = subSessions.reduce((acc, curr) => acc + curr.duration_seconds, 0);
    const hours = parseFloat((totalSecs > 0 ? totalSecs / 3600 : s.target_hours_weekly * 1.8).toFixed(1));

    return {
      name: s.name.split(' ')[0],
      fullName: s.name,
      horas: hours,
      cor: s.color || '#6366F1',
    };
  });

  const dailyEvolutionData = [
    { dia: 'Seg', horas: 4.0, pausas: 0.8 },
    { dia: 'Ter', horas: 4.8, pausas: 1.0 },
    { dia: 'Qua', horas: 3.7, pausas: 0.6 },
    { dia: 'Qui', horas: 4.2, pausas: 0.75 },
    { dia: 'Sex', horas: 3.5, pausas: 0.5 },
    { dia: 'Sáb', horas: 2.0, pausas: 0.4 },
    { dia: 'Dom', horas: 1.5, pausas: 0.3 },
  ];

  function exportDataCSV() {
    const rows = [
      ['Data', 'Matéria', 'Duração (Min)', 'Tipo', 'Nota'],
      ...sessions.map(s => {
        const sub = subjects.find(sub => sub.id === s.subject_id);
        return [
          s.start_time.split('T')[0],
          sub?.name || 'Geral',
          Math.round(s.duration_seconds / 60),
          s.session_type,
          `"${(s.notes || '').replace(/"/g, '""')}"`,
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `synapse_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase tracking-wide bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Neurociência do Aprendizado • Análise Preditiva FSRS & Ebbinghaus
            </span>
          </div>

          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            Retenção Cognitiva & Analytics
          </h1>
          <p className="text-[14px] text-slate-600 dark:text-slate-400">
            Mapeamento dinâmico da curva de esquecimento, estabilidade mnêmica de longo prazo e telemetria de foco distribuído com base no modelo FSRS v4.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Pill Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl shadow-xs text-xs font-semibold">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'today'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              type="button"
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'week'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              type="button"
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'month'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              type="button"
            >
              Últimos 30 Dias
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'year'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              type="button"
            >
              Ano
            </button>
          </div>

          <button
            onClick={exportDataCSV}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            type="button"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Exportar (.CSV / Anki)</span>
          </button>
        </div>
      </div>

      {/* KPI Precision Grid (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Índice Médio de Retenção
            </span>
            <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                91.4%
              </span>
              <span className="inline-flex items-center font-mono text-xs text-teal-700 dark:text-teal-300 font-medium bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded">
                +2.8%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Algoritmo preditivo FSRS v4 ativo
            </p>
          </div>
          <div className="mt-3 pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Estabilidade Sináptica</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">Alta</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '91.4%' }}></div>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Horas em Foco Profundo
            </span>
            <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                38h 20m
              </span>
              <span className="text-xs font-mono text-slate-400">/ 45h meta</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              85% da meta semanal concluída
            </p>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Pausas conscientes:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">7h 15m</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Flashcards Consolidados
            </span>
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                1.428
              </span>
              <span className="text-xs font-mono text-slate-400">cards</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Acerto na 1ª repetição: 88.6%
            </p>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span> Anki Sync
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">100%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Meia-Vida da Memória
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                18.2
              </span>
              <span className="text-xs font-mono text-slate-400">dias</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Intervalo médio de consolidação
            </p>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Estado neural:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
              Excelente fixação
            </span>
          </div>
        </div>
      </div>

      {/* Primary Analytics Canvas (Split 65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Ebbinghaus Curve Module */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Curva de Ebbinghaus & Pontos de Repetição Espaçada
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Curva teórica de esquecimento passivo vs. Estabilização sináptica via algoritmo FSRS v4
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-400"></span>
                  <span>Sem revisão (Queda)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                  <span className="w-3 h-1 bg-teal-500 rounded-full"></span>
                  <span>Revisões Ativas</span>
                </div>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 relative overflow-hidden border border-slate-200/60 dark:border-slate-800">
              <svg className="w-full h-56 text-teal-600" fill="none" viewBox="0 0 760 260">
                <defs>
                  <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.18"></stop>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.01"></stop>
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line stroke="#dae2fd" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="730" y1="30" y2="30"></line>
                <text className="text-[10px] font-mono" fill="#94a3b8" x="12" y="34">100%</text>
                <line stroke="#dae2fd" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="730" y1="90" y2="90"></line>
                <text className="text-[10px] font-mono" fill="#94a3b8" x="16" y="94">80%</text>
                <line stroke="#dae2fd" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="730" y1="150" y2="150"></line>
                <text className="text-[10px] font-mono" fill="#94a3b8" x="16" y="154">50%</text>
                <line stroke="#dae2fd" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="730" y1="210" y2="210"></line>
                <text className="text-[10px] font-mono" fill="#94a3b8" x="16" y="214">20%</text>

                {/* Passive Decay Curve */}
                <path d="M 60 30 C 100 130, 200 215, 710 225" opacity="0.6" stroke="#94a3b8" strokeDasharray="6 6" strokeWidth="2"></path>

                {/* Area fill */}
                <path
                  d="M 60 30 C 90 60, 110 95, 140 100 L 140 32 C 180 50, 230 75, 280 82 L 280 32 C 340 45, 420 62, 490 68 L 490 32 C 570 40, 650 50, 710 52 L 710 230 L 60 230 Z"
                  fill="url(#curveGradient)"
                ></path>

                {/* Spaced Repetition Paths */}
                <path d="M 60 30 C 90 60, 110 95, 140 100" stroke="#0D9488" strokeWidth="2.5"></path>
                <path d="M 140 100 L 140 32" stroke="#6366F1" strokeWidth="2"></path>
                <path d="M 140 32 C 180 50, 230 75, 280 82" stroke="#0D9488" strokeWidth="2.5"></path>
                <path d="M 280 82 L 280 32" stroke="#6366F1" strokeWidth="2"></path>
                <path d="M 280 32 C 340 45, 420 62, 490 68" stroke="#0D9488" strokeWidth="2.5"></path>
                <path d="M 490 68 L 490 32" stroke="#6366F1" strokeWidth="2"></path>
                <path d="M 490 32 C 570 40, 650 50, 710 52" stroke="#0D9488" strokeWidth="2.5"></path>

                {/* Markers */}
                <circle cx="60" cy="30" fill="#0D9488" r="4.5"></circle>
                <circle cx="140" cy="32" fill="#6366F1" r="5"></circle>
                <circle cx="280" cy="32" fill="#6366F1" r="5"></circle>
                <circle cx="490" cy="32" fill="#6366F1" r="5"></circle>
                <circle cx="710" cy="52" fill="#0D9488" r="5"></circle>

                {/* Labels */}
                <g fill="currentColor" fontFamily="monospace" fontSize="10">
                  <text x="45" y="248">Sessão 0</text>
                  <text x="125" y="248">Dia 1 (R1)</text>
                  <text x="265" y="248">Dia 3 (R2)</text>
                  <text x="475" y="248">Dia 7 (R3)</text>
                  <text x="680" y="248">Dia 21 (R4)</text>
                </g>
              </svg>
            </div>

            {/* Predictive Insight Stripe */}
            <div className="flex items-start gap-3 bg-teal-50 dark:bg-teal-950/40 p-3.5 rounded-xl border border-teal-200/60 dark:border-teal-900/60">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-mono font-bold uppercase text-teal-700 dark:text-teal-300 block">
                  Diagnóstico Preditivo Neural
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                  Próximo declínio mnêmico previsto em <strong className="font-semibold text-slate-900 dark:text-white">Algoritmos & Estruturas (Árvores AVL)</strong> em <span className="font-mono font-bold text-teal-600 dark:text-teal-400">36 horas</span>. Agendamento antecipado de 18 flashcards sugerido para preservar retenção &gt; 90%.
                </p>
              </div>
              <button
                onClick={() => openModal(subjects[0] || null, 'recall')}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm"
              >
                Agendar Revisão
              </button>
            </div>
          </div>

          {/* Gráfico Recharts: Evolução Diária */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Evolução Diária de Foco & Pausas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Horas de estudo profundo vs. períodos de recuperação conscientes
                </p>
              </div>
              <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                Semana 43
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPausas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="horas" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHoras)" name="Foco (h)" />
                  <Area type="monotone" dataKey="pausas" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorPausas)" name="Pausas (h)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Gráfico Recharts: Tempo por Matéria */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Tempo por Matéria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Distribuição de horas nesta semana
                </p>
              </div>
              <PieChart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="horas" fill="#0D9488" radius={[6, 6, 0, 0]} name="Horas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color || '#6366F1' }}></span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {s.weight_percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Janelas de Máximo Desempenho */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Janelas de Máximo Desempenho
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Eficiência de retenção ponderada por horário
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Manhã */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Manhã (07h – 11h)
                  </span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">96% Eficiência</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '96%' }}></div>
                </div>
                <span className="text-[10.5px] text-teal-700 dark:text-teal-400">
                  Pico de foco cognitivo profundo • Ideal para conceitos complexos
                </span>
              </div>

              {/* Tarde */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sunset className="w-3.5 h-3.5 text-indigo-500" /> Tarde (14h – 18h)
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">84% Eficiência</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '84%' }}></div>
                </div>
                <span className="text-[10.5px] text-slate-500">
                  Bom rendimento • Recomendado para resolução ativa de questões
                </span>
              </div>

              {/* Noite */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-slate-400" /> Noite (20h – 22h)
                  </span>
                  <span className="font-mono font-bold text-slate-500">72% Eficiência</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-[10.5px] text-slate-500">
                  Zona de fadiga • Sugerido apenas revisões passivas ou flashcards leves
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Diagnósticos Cognitivos (Grid de 3) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Diagnósticos Cognitivos & Ações Prescritivas
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 uppercase">
            Gerado por Synapse Cognitive OS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[11px] font-semibold">
                  <AlertTriangle className="w-3 h-3" /> Intervenção Recomendada
                </span>
                <span className="font-mono text-xs text-slate-400">Estatística</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                Reforçar Teorema Central do Limite
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                A taxa de erro nos flashcards de fixação subiu para 24% na segunda repetição. O FSRS sugere agendar um bloco direcionado de foco profundo de 25 minutos.
              </p>
            </div>

            <button
              onClick={() => openModal(subjects.find(s => s.name.includes('Estatística')) || null, 'pomodoro')}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Agendar Bloco de 25m</span>
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Otimização de Tempo
                </span>
                <span className="font-mono text-xs text-slate-400">Algoritmos</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                Estabilidade Consolidada em Árvores AVL
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                O índice de acerto imediato atingiu 98% nas últimas três revisões. O intervalo de espaçamento foi estendido com segurança para 14 dias sem risco de esquecimento.
              </p>
            </div>

            <div className="mt-4 w-full flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs font-medium text-teal-600 dark:text-teal-400">
              <span>Intervalo FSRS atualizado:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">14 dias</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                  <Coffee className="w-3 h-3" /> Ritmo Circadiano & Pausas
                </span>
                <span className="font-mono text-xs text-slate-400">Neuroergonomia</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                Manter Intervalo de 10 Minutos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Seus blocos de 50 minutos seguidos de 10 minutos de pausa consciente sem telas resultaram em <strong className="font-semibold text-slate-900 dark:text-white">+18% de absorção e retenção de longo prazo</strong>.
              </p>
            </div>

            <div className="mt-4 w-full flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400">
              <span>Configuração recomendada:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">50m foco / 10m pausa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
