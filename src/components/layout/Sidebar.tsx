'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  Layers,
  BarChart3,
  History,
  Settings,
  Flame,
  Sun,
  Moon,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTimer } from '@/contexts/TimerContext';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { status: timerStatus } = useTimer();
  const { metrics } = useData();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Matérias & Ciclos', path: '/subjects', icon: BookOpen, badge: '4' },
    {
      label: 'Timer de Foco',
      path: '/timer',
      icon: Timer,
      isTimer: true,
      hasPulse: timerStatus === 'running',
    },
    { label: 'Diário & Anki', path: '/daily-notes', icon: Layers, badgeTag: '94%' },
    { label: 'Retenção & Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Histórico Completo', path: '/history', icon: History },
    { label: 'Configurações', path: '/settings', icon: Settings },
  ];

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pedro Henrique';
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'PH';

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[260px] bg-white dark:bg-[#0E131F] border-r border-slate-200 dark:border-slate-800/80 z-50 flex-col justify-between py-6 px-4 select-none">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 flex items-center justify-center text-teal-400 shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-[17px] leading-tight">
                Synapse
              </span>
              <span className="text-[10px] font-mono font-medium text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                Cognitive OS
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
            v2.4
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 text-[13.5px]">
          {navItems.map(item => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-medium',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{item.label}</span>
                </div>

                {item.hasPulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                )}

                {item.badge && !item.hasPulse && (
                  <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                    {item.badge}
                  </span>
                )}

                {item.badgeTag && !item.hasPulse && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                    {item.badgeTag}
                  </span>
                )}

                {isActive && !item.hasPulse && !item.badge && !item.badgeTag && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Habit Mini Stats in Sidebar */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Streak Cognitivo
            </span>
            <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {metrics.streakDays} dias
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            <span className="h-2 rounded bg-teal-500" title="Seg: 4h"></span>
            <span className="h-2 rounded bg-teal-500" title="Ter: 3h 45m"></span>
            <span className="h-2 rounded bg-teal-500" title="Qua: 4h 10m"></span>
            <span className="h-2 rounded bg-teal-500" title="Qui: 3h 42m (Hoje)"></span>
            <span className="h-2 rounded bg-slate-200 dark:bg-slate-700" title="Sex"></span>
            <span className="h-2 rounded bg-slate-200 dark:bg-slate-700" title="Sáb"></span>
            <span className="h-2 rounded bg-slate-200 dark:bg-slate-700" title="Dom"></span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Meta semanal</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              {metrics.weeklyHours}h / {metrics.weeklyGoalHours}h
            </span>
          </div>
        </div>
      </div>

      {/* User Profile & Theme Switcher Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 dark:ring-slate-800 shrink-0">
            {initials}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
              {userName}
            </span>
            <span className="text-[10.5px] font-mono text-teal-600 dark:text-teal-400 font-medium truncate">
              Deep Work Pro
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Alternar tema claro/escuro"
            type="button"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && (
            <button
              onClick={() => signOut()}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sair da conta"
              type="button"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
