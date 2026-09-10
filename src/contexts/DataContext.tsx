'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Subject, StudySession, DailyStudyRecord, DailyMetrics } from '@/types/database';
import { INITIAL_SUBJECTS, INITIAL_SESSIONS, INITIAL_DAILY_RECORDS } from '@/lib/initialData';
import { getTodayDateString, isValidUUID } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getSyncChannel, broadcastSync, SyncMessage } from '@/lib/syncChannel';

interface DataContextType {
  subjects: Subject[];
  sessions: StudySession[];
  dailyRecords: DailyStudyRecord[];
  loading: boolean;
  emptyStateMode: boolean;
  setEmptyStateMode: (val: boolean) => void;
  metrics: DailyMetrics;
  addSubject: (data: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Subject>;
  updateSubject: (id: string, data: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addSession: (data: Omit<StudySession, 'id' | 'user_id' | 'created_at'>) => Promise<StudySession>;
  deleteSession: (id: string) => Promise<void>;
  saveDailyRecord: (data: {
    subject_id: string;
    date?: string;
    learning_note?: string | null;
    anki_completed?: boolean;
    anki_cards_count?: number;
  }) => Promise<DailyStudyRecord>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyStudyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [emptyStateMode, setEmptyStateMode] = useState(false);

  const isConfigured = isSupabaseConfigured();

  // Carregar dados (Supabase ou LocalStorage)
  const loadData = useCallback(async () => {
    setLoading(true);

    if (!isConfigured || !user) {
      // Modo local ou offline
      try {
        const savedSubjects = localStorage.getItem('synapse_subjects');
        const savedSessions = localStorage.getItem('synapse_sessions');
        const savedRecords = localStorage.getItem('synapse_daily_records');

        if (savedSubjects) {
          try { setSubjects(JSON.parse(savedSubjects)); } catch { setSubjects(INITIAL_SUBJECTS); }
        } else {
          setSubjects(INITIAL_SUBJECTS);
          localStorage.setItem('synapse_subjects', JSON.stringify(INITIAL_SUBJECTS));
        }

        if (savedSessions) {
          try { setSessions(JSON.parse(savedSessions)); } catch { setSessions(INITIAL_SESSIONS); }
        } else {
          setSessions(INITIAL_SESSIONS);
          localStorage.setItem('synapse_sessions', JSON.stringify(INITIAL_SESSIONS));
        }

        if (savedRecords) {
          try { setDailyRecords(JSON.parse(savedRecords)); } catch { setDailyRecords(INITIAL_DAILY_RECORDS); }
        } else {
          setDailyRecords(INITIAL_DAILY_RECORDS);
          localStorage.setItem('synapse_daily_records', JSON.stringify(INITIAL_DAILY_RECORDS));
        }
      } catch (err) {
        console.error('Erro ao ler localStorage:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Carregar via Supabase
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const [subjectsRes, sessionsRes, recordsRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('study_sessions').select('*').eq('user_id', user.id).order('start_time', { ascending: false }),
        supabase.from('daily_study_records').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);

      if (subjectsRes.data && subjectsRes.data.length > 0) {
        setSubjects(subjectsRes.data as Subject[]);
        try { localStorage.setItem('synapse_subjects', JSON.stringify(subjectsRes.data)); } catch {}
      } else {
        // Se usuário não tiver matérias ainda no Supabase, cria as iniciais associadas ao seu user_id
        const defaults = INITIAL_SUBJECTS.map(({ id: _, ...rest }) => ({
          ...rest,
          user_id: user.id,
        }));
        const { data: createdSubs } = await supabase.from('subjects').insert(defaults).select();
        const finalSubs = (createdSubs as Subject[]) || [];
        setSubjects(finalSubs);
        try { localStorage.setItem('synapse_subjects', JSON.stringify(finalSubs)); } catch {}
      }

      if (sessionsRes.data) {
        setSessions(sessionsRes.data as StudySession[]);
        try { localStorage.setItem('synapse_sessions', JSON.stringify(sessionsRes.data)); } catch {}
      }

      if (recordsRes.data) {
        setDailyRecords(recordsRes.data as DailyStudyRecord[]);
        try { localStorage.setItem('synapse_daily_records', JSON.stringify(recordsRes.data)); } catch {}
      }
    } catch (err) {
      console.error('Erro ao buscar dados do Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sincronização entre abas em tempo real (BroadcastChannel + Storage Event + Visibility/Focus)
  useEffect(() => {
    const ch = getSyncChannel();

    const handleBroadcastMessage = (event: MessageEvent<SyncMessage>) => {
      const msg = event.data;
      if (!msg) return;

      switch (msg.type) {
        case 'SESSION_ADDED':
          setSessions(prev => [msg.payload, ...prev.filter(s => s.id !== msg.payload.id)]);
          break;
        case 'SESSION_DELETED':
          setSessions(prev => prev.filter(s => s.id !== msg.payload));
          break;
        case 'SUBJECT_ADDED':
          setSubjects(prev => [...prev.filter(s => s.id !== msg.payload.id), msg.payload]);
          break;
        case 'SUBJECT_UPDATED':
          setSubjects(prev => prev.map(s => s.id === msg.payload.id ? { ...s, ...msg.payload } : s));
          break;
        case 'SUBJECT_DELETED':
          setSubjects(prev => prev.filter(s => s.id !== msg.payload));
          break;
        case 'RECORD_SAVED':
          setDailyRecords(prev => [
            msg.payload,
            ...prev.filter(r => !(r.subject_id === msg.payload.subject_id && r.date === msg.payload.date)),
          ]);
          break;
        case 'SYNC_ALL':
          loadData();
          break;
      }
    };

    if (ch) {
      ch.addEventListener('message', handleBroadcastMessage);
    }

    // Storage Event para abas em instâncias separadas
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'synapse_sessions' && e.newValue) {
        try { setSessions(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'synapse_subjects' && e.newValue) {
        try { setSubjects(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === 'synapse_daily_records' && e.newValue) {
        try { setDailyRecords(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Quando o usuário alterna abas e clica na aba atual, atualiza os dados instantaneamente
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const savedSessions = localStorage.getItem('synapse_sessions');
        if (savedSessions) {
          try { setSessions(JSON.parse(savedSessions)); } catch {}
        }
        const savedSubjects = localStorage.getItem('synapse_subjects');
        if (savedSubjects) {
          try { setSubjects(JSON.parse(savedSubjects)); } catch {}
        }
        const savedRecords = localStorage.getItem('synapse_daily_records');
        if (savedRecords) {
          try { setDailyRecords(JSON.parse(savedRecords)); } catch {}
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      if (ch) ch.removeEventListener('message', handleBroadcastMessage);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [loadData]);

  // Realtime subscription no Supabase quando logado (para sincronização entre PC e Celular)
  useEffect(() => {
    if (!isConfigured || !user) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`user-sync-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${user.id}` }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_study_records', filter: `user_id=eq.${user.id}` }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects', filter: `user_id=eq.${user.id}` }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConfigured, user, loadData]);

  // Métricas Computadas
  const metrics: DailyMetrics = useMemo(() => {
    if (emptyStateMode) {
      return {
        totalStudySecondsToday: 0,
        totalBreakSecondsToday: 0,
        targetMinutesToday: 270,
        completedBlocksCount: 0,
        activeSubjectsToday: 0,
        totalActiveSubjects: subjects.filter(s => s.active).length,
        ankiCardsToday: 0,
        efficiencyToday: 0,
        weeklyHours: 0,
        weeklyGoalHours: 25.0,
        streakDays: 0,
      };
    }

    const todayStr = getTodayDateString();

    const todaySessions = sessions.filter(s => {
      const sDate = s.start_time.split('T')[0];
      return sDate === todayStr;
    });

    const studySessionsToday = todaySessions.filter(s => s.session_type === 'study');
    const breakSessionsToday = todaySessions.filter(s => s.session_type === 'break');

    const totalStudySecondsToday = studySessionsToday.reduce((acc, curr) => acc + curr.duration_seconds, 0);
    const totalBreakSecondsToday = breakSessionsToday.reduce((acc, curr) => acc + curr.duration_seconds, 0);

    const studiedSubjectIds = new Set(studySessionsToday.map(s => s.subject_id).filter(Boolean));

    const todayRecords = dailyRecords.filter(r => r.date === todayStr);
    const ankiCardsToday = todayRecords.reduce((acc, curr) => acc + (curr.anki_cards_count || 0), 0);

    // Cálculo semanal
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekSessions = sessions.filter(s => new Date(s.start_time) >= sevenDaysAgo && s.session_type === 'study');
    const weeklySeconds = weekSessions.reduce((acc, curr) => acc + curr.duration_seconds, 0);
    const calculatedWeeklyHours = parseFloat((weeklySeconds / 3600).toFixed(1));

    return {
      totalStudySecondsToday,
      totalBreakSecondsToday,
      targetMinutesToday: 270, // 4h 30m
      completedBlocksCount: studySessionsToday.length,
      activeSubjectsToday: studiedSubjectIds.size,
      totalActiveSubjects: subjects.filter(s => s.active).length,
      ankiCardsToday,
      efficiencyToday: studySessionsToday.length > 0 ? 100 : (user ? 0 : 92),
      weeklyHours: calculatedWeeklyHours > 0 ? calculatedWeeklyHours : (user ? 0 : 18.5),
      weeklyGoalHours: 25.0,
      streakDays: studySessionsToday.length > 0 ? 1 : (user ? 0 : 14),
    };
  }, [sessions, subjects, dailyRecords, emptyStateMode, user]);

  // CRUD Subjects com atualização otimista imediata e broadcast
  const addSubject = async (data: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Subject> => {
    const tempId = `subj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newSub: Subject = {
      ...data,
      id: tempId,
      user_id: user?.id || 'user_demo_01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Atualização Imediata em todas as abas
    setSubjects(prev => [...prev, newSub]);
    try {
      const current = JSON.parse(localStorage.getItem('synapse_subjects') || '[]');
      localStorage.setItem('synapse_subjects', JSON.stringify([...current, newSub]));
    } catch {}
    broadcastSync({ type: 'SUBJECT_ADDED', payload: newSub });

    // 2. Persistência no Supabase
    if (isConfigured && user) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: inserted, error } = await supabase.from('subjects').insert({
            name: data.name,
            description: data.description,
            color: data.color,
            icon: data.icon || 'menu_book',
            weight_percentage: data.weight_percentage,
            target_hours_weekly: data.target_hours_weekly,
            current_topic: data.current_topic,
            grade_progress_percentage: data.grade_progress_percentage || 0,
            active: data.active !== undefined ? data.active : true,
            user_id: user.id,
          }).select().single();

          if (!error && inserted) {
            setSubjects(prev => prev.map(s => s.id === tempId ? (inserted as Subject) : s));
            try {
              const current = JSON.parse(localStorage.getItem('synapse_subjects') || '[]');
              localStorage.setItem('synapse_subjects', JSON.stringify(current.map((s: any) => s.id === tempId ? inserted : s)));
            } catch {}
            broadcastSync({ type: 'SUBJECT_UPDATED', payload: inserted });
            return inserted as Subject;
          } else if (error) {
            console.warn('Erro ao salvar matéria no Supabase (mantida localmente):', error);
          }
        } catch (err) {
          console.warn('Exceção ao inserir matéria no Supabase:', err);
        }
      }
    }

    return newSub;
  };

  const updateSubject = async (id: string, data: Partial<Subject>): Promise<void> => {
    // 1. Atualização Imediata em todas as abas
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s));
    try {
      const current = JSON.parse(localStorage.getItem('synapse_subjects') || '[]');
      localStorage.setItem('synapse_subjects', JSON.stringify(current.map((s: any) => s.id === id ? { ...s, ...data } : s)));
    } catch {}
    broadcastSync({ type: 'SUBJECT_UPDATED', payload: { id, ...data } });

    // 2. Persistência no Supabase
    if (isConfigured && user && isValidUUID(id)) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from('subjects').update(data).eq('id', id);
        } catch (err) {
          console.warn('Erro ao atualizar matéria no Supabase:', err);
        }
      }
    }
  };

  const deleteSubject = async (id: string): Promise<void> => {
    // 1. Atualização Imediata em todas as abas
    setSubjects(prev => prev.filter(s => s.id !== id));
    try {
      const current = JSON.parse(localStorage.getItem('synapse_subjects') || '[]');
      localStorage.setItem('synapse_subjects', JSON.stringify(current.filter((s: any) => s.id !== id)));
    } catch {}
    broadcastSync({ type: 'SUBJECT_DELETED', payload: id });

    // 2. Persistência no Supabase
    if (isConfigured && user && isValidUUID(id)) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from('subjects').delete().eq('id', id);
        } catch (err) {
          console.warn('Erro ao deletar matéria no Supabase:', err);
        }
      }
    }
  };

  // Sessions com atualização imediata para todos os timers e abas
  const addSession = async (data: Omit<StudySession, 'id' | 'user_id' | 'created_at'>): Promise<StudySession> => {
    const tempId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newSession: StudySession = {
      ...data,
      id: tempId,
      user_id: user?.id || 'user_demo_01',
      created_at: new Date().toISOString(),
    };

    // 1. ATUALIZAÇÃO IMEDIATA OTIMISTA (Todas as abas atualizam na hora!)
    setSessions(prev => [newSession, ...prev]);
    try {
      const current = JSON.parse(localStorage.getItem('synapse_sessions') || '[]');
      localStorage.setItem('synapse_sessions', JSON.stringify([newSession, ...current]));
    } catch {}
    broadcastSync({ type: 'SESSION_ADDED', payload: newSession });

    // 2. Persistência no Supabase
    if (isConfigured && user) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          // Se subject_id for um UUID válido, envia; caso contrário envia null para evitar erro 22P02 do PostgreSQL
          const validSubjectId = isValidUUID(data.subject_id) ? data.subject_id : null;

          const { data: inserted, error } = await supabase.from('study_sessions').insert({
            start_time: data.start_time,
            end_time: data.end_time,
            duration_seconds: data.duration_seconds,
            session_type: data.session_type,
            efficiency_rate: data.efficiency_rate || 100,
            notes: data.notes || null,
            subject_id: validSubjectId,
            user_id: user.id,
          }).select().single();

          if (!error && inserted) {
            setSessions(prev => prev.map(s => s.id === tempId ? (inserted as StudySession) : s));
            try {
              const current = JSON.parse(localStorage.getItem('synapse_sessions') || '[]');
              localStorage.setItem('synapse_sessions', JSON.stringify(current.map((s: any) => s.id === tempId ? inserted : s)));
            } catch {}
            broadcastSync({ type: 'SESSION_ADDED', payload: inserted });
            return inserted as StudySession;
          } else if (error) {
            console.warn('Erro ao inserir sessão no Supabase (mantida localmente):', error);
          }
        } catch (err) {
          console.warn('Exceção ao inserir sessão no Supabase:', err);
        }
      }
    }

    return newSession;
  };

  const deleteSession = async (id: string): Promise<void> => {
    // 1. Atualização Imediata em todas as abas
    setSessions(prev => prev.filter(s => s.id !== id));
    try {
      const current = JSON.parse(localStorage.getItem('synapse_sessions') || '[]');
      localStorage.setItem('synapse_sessions', JSON.stringify(current.filter((s: any) => s.id !== id)));
    } catch {}
    broadcastSync({ type: 'SESSION_DELETED', payload: id });

    // 2. Persistência no Supabase
    if (isConfigured && user && isValidUUID(id)) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from('study_sessions').delete().eq('id', id);
        } catch (err) {
          console.warn('Erro ao deletar sessão no Supabase:', err);
        }
      }
    }
  };

  // Daily Records (Diário de Aprendizado & Anki)
  const saveDailyRecord = async (data: {
    subject_id: string;
    date?: string;
    learning_note?: string | null;
    anki_completed?: boolean;
    anki_cards_count?: number;
  }): Promise<DailyStudyRecord> => {
    const recordDate = data.date || getTodayDateString();

    const existingIndex = dailyRecords.findIndex(
      r => r.subject_id === data.subject_id && r.date === recordDate
    );

    const newRecord: DailyStudyRecord = {
      id: existingIndex >= 0 ? dailyRecords[existingIndex].id : `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      user_id: user?.id || 'user_demo_01',
      subject_id: data.subject_id,
      date: recordDate,
      learning_note: data.learning_note !== undefined ? data.learning_note : (existingIndex >= 0 ? dailyRecords[existingIndex].learning_note : null),
      anki_completed: data.anki_completed !== undefined ? data.anki_completed : (existingIndex >= 0 ? dailyRecords[existingIndex].anki_completed : false),
      anki_cards_count: data.anki_cards_count !== undefined ? data.anki_cards_count : (existingIndex >= 0 ? dailyRecords[existingIndex].anki_cards_count : 0),
      created_at: existingIndex >= 0 ? dailyRecords[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Atualização Imediata em todas as abas
    let updated: DailyStudyRecord[];
    if (existingIndex >= 0) {
      updated = dailyRecords.map(r => (r.subject_id === data.subject_id && r.date === recordDate ? newRecord : r));
    } else {
      updated = [newRecord, ...dailyRecords];
    }
    setDailyRecords(updated);
    try {
      localStorage.setItem('synapse_daily_records', JSON.stringify(updated));
    } catch {}
    broadcastSync({ type: 'RECORD_SAVED', payload: newRecord });

    // 2. Persistência no Supabase
    if (isConfigured && user && isValidUUID(data.subject_id)) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: upserted, error } = await supabase
            .from('daily_study_records')
            .upsert(
              {
                user_id: user.id,
                subject_id: data.subject_id,
                date: recordDate,
                learning_note: newRecord.learning_note,
                anki_completed: newRecord.anki_completed,
                anki_cards_count: newRecord.anki_cards_count,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,subject_id,date' }
            )
            .select()
            .single();

          if (!error && upserted) {
            setDailyRecords(prev => prev.map(r => (r.subject_id === data.subject_id && r.date === recordDate) ? (upserted as DailyStudyRecord) : r));
            try {
              const current = JSON.parse(localStorage.getItem('synapse_daily_records') || '[]');
              localStorage.setItem('synapse_daily_records', JSON.stringify(current.map((r: any) => (r.subject_id === data.subject_id && r.date === recordDate) ? upserted : r)));
            } catch {}
            broadcastSync({ type: 'RECORD_SAVED', payload: upserted });
            return upserted as DailyStudyRecord;
          } else if (error) {
            console.warn('Erro ao salvar diário no Supabase (mantido localmente):', error);
          }
        } catch (err) {
          console.warn('Exceção ao salvar diário no Supabase:', err);
        }
      }
    }

    return newRecord;
  };

  const activeSubjects = useMemo(() => {
    return emptyStateMode ? [] : subjects;
  }, [emptyStateMode, subjects]);

  const activeSessions = useMemo(() => {
    return emptyStateMode ? [] : sessions;
  }, [emptyStateMode, sessions]);

  const activeRecords = useMemo(() => {
    return emptyStateMode ? [] : dailyRecords;
  }, [emptyStateMode, dailyRecords]);

  return (
    <DataContext.Provider
      value={{
        subjects: activeSubjects,
        sessions: activeSessions,
        dailyRecords: activeRecords,
        loading,
        emptyStateMode,
        setEmptyStateMode,
        metrics,
        addSubject,
        updateSubject,
        deleteSubject,
        addSession,
        deleteSession,
        saveDailyRecord,
        refreshData: loadData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
