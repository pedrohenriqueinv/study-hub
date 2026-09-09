'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Timer, Layers, BarChart3, Settings } from 'lucide-react';
import { useTimer } from '@/contexts/TimerContext';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const { status: timerStatus } = useTimer();

  const links = [
    { label: 'Início', path: '/', icon: LayoutDashboard },
    { label: 'Matérias', path: '/subjects', icon: BookOpen },
    { label: 'Timer', path: '/timer', icon: Timer, isTimer: true },
    { label: 'Diário', path: '/daily-notes', icon: Layers },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Ajustes', path: '/settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-3 flex items-center justify-around">
      {links.map(item => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        const isRunning = item.isTimer && timerStatus === 'running';

        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all',
              isActive
                ? 'text-indigo-600 dark:text-teal-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {isRunning && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
