'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Subject, SessionType } from '@/types/database';
import { useData } from './DataContext';
import { acoustics } from '@/lib/audio';

export type TimerMode = 'deep_work' | 'pomodoro' | 'recall' | 'break' | 'custom';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerConfig {
  mode: TimerMode;
  label: string;
  durationMinutes: number;
  sessionType: SessionType;
}

export const TIMER_PRESETS: Record<TimerMode, TimerConfig> = {
  deep_work: { mode: 'deep_work', label: '50m Foco Profundo', durationMinutes: 50, sessionType: 'study' },
  pomodoro: { mode: 'pomodoro', label: '25m Pomodoro', durationMinutes: 25, sessionType: 'study' },
  recall: { mode: 'recall', label: '15m Active Recall', durationMinutes: 15, sessionType: 'study' },
  break: { mode: 'break', label: '10m Pausa Consciente', durationMinutes: 10, sessionType: 'break' },
  custom: { mode: 'custom', label: 'Personalizado', durationMinutes: 30, sessionType: 'study' },
};

interface TimerContextType {
  status: TimerStatus;
  mode: TimerMode;
  selectedSubject: Subject | null;
  targetSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  isModalOpen: boolean;
  soundMode: 'off' | 'gamma' | 'brown';
  postSessionData: {
    isOpen: boolean;
    subjectId: string | null;
    durationSeconds: number;
    startTime: string;
    endTime: string;
    sessionType: SessionType;
  } | null;
  setMode: (mode: TimerMode) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  openModal: (subject?: Subject | null, mode?: TimerMode) => void;
  closeModal: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  completeSession: () => void;
  setSoundMode: (mode: 'off' | 'gamma' | 'brown') => void;
  closePostSessionDialog: () => void;
}

const STORAGE_KEY = 'synapse_timer_state_v2';

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { subjects, addSession } = useData();

  const [status, setStatus] = useState<TimerStatus>('idle');
  const [mode, setModeState] = useState<TimerMode>('deep_work');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [soundMode, setSoundModeState] = useState<'off' | 'gamma' | 'brown'>('off');

  // Timestamps absolutos para cálculo inviolável
  const [sessionStartTimeISO, setSessionStartTimeISO] = useState<string | null>(null);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [pausedAccumulatedMs, setPausedAccumulatedMs] = useState<number>(0);
  const [targetSeconds, setTargetSeconds] = useState<number>(50 * 60);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(50 * 60);

  // Diálogo pós-sessão ("Hoje eu aprendi...")
  const [postSessionData, setPostSessionData] = useState<{
    isOpen: boolean;
    subjectId: string | null;
    durationSeconds: number;
    startTime: string;
    endTime: string;
    sessionType: SessionType;
  } | null>(null);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || null;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar estado a partir do LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setModeState(parsed.mode || 'deep_work');
        setSelectedSubjectId(parsed.selectedSubjectId || null);
        setTargetSeconds(parsed.targetSeconds || 50 * 60);
        setSessionStartTimeISO(parsed.sessionStartTimeISO || null);
        setPausedAccumulatedMs(parsed.pausedAccumulatedMs || 0);

        if (parsed.status === 'running' && parsed.startTimestamp) {
          const now = Date.now();
          const totalMs = (parsed.pausedAccumulatedMs || 0) + (now - parsed.startTimestamp);
          const currentElapsed = Math.floor(totalMs / 1000);
          const currentRemaining = Math.max(0, (parsed.targetSeconds || 3000) - currentElapsed);

          setStartTimestamp(parsed.startTimestamp);
          setStatus('running');
          setElapsedSeconds(currentElapsed);
          setRemainingSeconds(currentRemaining);
        } else if (parsed.status === 'paused') {
          setStatus('paused');
          const currentElapsed = Math.floor((parsed.pausedAccumulatedMs || 0) / 1000);
          setElapsedSeconds(currentElapsed);
          setRemainingSeconds(Math.max(0, (parsed.targetSeconds || 3000) - currentElapsed));
        } else {
          setStatus('idle');
          setElapsedSeconds(0);
          setRemainingSeconds(parsed.targetSeconds || 50 * 60);
        }
      }
    } catch (err) {
      console.error('Erro ao restaurar timer do storage:', err);
    }
  }, []);

  // Seletor de matéria padrão se nenhuma estiver selecionada
  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Persistir estado sempre que variáveis-chave mudarem
  const persistState = useCallback(() => {
    const payload = {
      status,
      mode,
      selectedSubjectId,
      targetSeconds,
      sessionStartTimeISO,
      startTimestamp,
      pausedAccumulatedMs,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignora erro de cota
    }
  }, [status, mode, selectedSubjectId, targetSeconds, sessionStartTimeISO, startTimestamp, pausedAccumulatedMs]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  // Função para finalizar sessão e gravar no banco
  const handleFinish = useCallback(async (finalDuration: number) => {
    const now = new Date();
    const startTimeStr = sessionStartTimeISO || new Date(now.getTime() - finalDuration * 1000).toISOString();
    const endTimeStr = now.toISOString();
    const currentConfig = TIMER_PRESETS[mode];

    acoustics.playCompletionChime();
    acoustics.stop();
    setSoundModeState('off');

    // Registrar no banco de dados via DataContext
    if (finalDuration >= 30) {
      try {
        await addSession({
          subject_id: currentConfig.sessionType === 'study' ? selectedSubjectId : null,
          start_time: startTimeStr,
          end_time: endTimeStr,
          duration_seconds: finalDuration,
          session_type: currentConfig.sessionType,
          efficiency_rate: 100,
          notes: currentConfig.sessionType === 'study'
            ? `Sessão de ${Math.round(finalDuration / 60)} min: ${selectedSubject?.name || 'Estudos'}`
            : 'Pausa consciente para descanso e alinhamento neural',
        });
      } catch (err) {
        console.error('Erro ao salvar sessão:', err);
      }

      // Se foi sessão de estudo, abre o diálogo de diário ("Hoje eu aprendi...")
      if (currentConfig.sessionType === 'study' && selectedSubjectId) {
        setPostSessionData({
          isOpen: true,
          subjectId: selectedSubjectId,
          durationSeconds: finalDuration,
          startTime: startTimeStr,
          endTime: endTimeStr,
          sessionType: 'study',
        });
      }
    }

    // Resetar timer
    setStatus('completed');
    setStartTimestamp(null);
    setPausedAccumulatedMs(0);
    setSessionStartTimeISO(null);
  }, [sessionStartTimeISO, mode, selectedSubjectId, selectedSubject, addSession]);

  // Loop de atualização contínua via timestamps reais
  useEffect(() => {
    if (status === 'running' && startTimestamp) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const currentElapsedMs = pausedAccumulatedMs + (now - startTimestamp);
        const currentElapsedSec = Math.floor(currentElapsedMs / 1000);
        const currentRemainingSec = Math.max(0, targetSeconds - currentElapsedSec);

        setElapsedSeconds(currentElapsedSec);
        setRemainingSeconds(currentRemainingSec);

        if (currentRemainingSec <= 0) {
          clearInterval(timerRef.current!);
          handleFinish(targetSeconds);
        }
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, startTimestamp, pausedAccumulatedMs, targetSeconds, handleFinish]);

  // Controles
  const setMode = (newMode: TimerMode) => {
    const config = TIMER_PRESETS[newMode];
    setModeState(newMode);
    const secs = config.durationMinutes * 60;
    setTargetSeconds(secs);
    setRemainingSeconds(secs);
    setElapsedSeconds(0);
    setStatus('idle');
    setStartTimestamp(null);
    setPausedAccumulatedMs(0);
  };

  const setSelectedSubject = (subj: Subject | null) => {
    setSelectedSubjectId(subj ? subj.id : null);
  };

  const openModal = (subject?: Subject | null, forcedMode?: TimerMode) => {
    if (subject) setSelectedSubjectId(subject.id);
    if (forcedMode) setMode(forcedMode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const startTimer = () => {
    const now = Date.now();
    setStartTimestamp(now);
    if (!sessionStartTimeISO) {
      setSessionStartTimeISO(new Date(now).toISOString());
    }
    setStatus('running');
  };

  const pauseTimer = () => {
    if (status === 'running' && startTimestamp) {
      const additional = Date.now() - startTimestamp;
      setPausedAccumulatedMs(prev => prev + additional);
      setStartTimestamp(null);
      setStatus('paused');
    }
  };

  const toggleTimer = () => {
    if (status === 'running') {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    setStatus('idle');
    setStartTimestamp(null);
    setPausedAccumulatedMs(0);
    setSessionStartTimeISO(null);
    setElapsedSeconds(0);
    setRemainingSeconds(targetSeconds);
    acoustics.stop();
    setSoundModeState('off');
  };

  const completeSession = () => {
    const duration = elapsedSeconds > 0 ? elapsedSeconds : targetSeconds;
    handleFinish(duration);
  };

  const setSoundMode = (newMode: 'off' | 'gamma' | 'brown') => {
    setSoundModeState(newMode);
    if (newMode === 'gamma') {
      acoustics.playGammaWave();
    } else if (newMode === 'brown') {
      acoustics.playBrownNoise();
    } else {
      acoustics.stop();
    }
  };

  const closePostSessionDialog = () => {
    setPostSessionData(null);
  };

  return (
    <TimerContext.Provider
      value={{
        status,
        mode,
        selectedSubject,
        targetSeconds,
        elapsedSeconds,
        remainingSeconds,
        isModalOpen,
        soundMode,
        postSessionData,
        setMode,
        setSelectedSubject,
        openModal,
        closeModal,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        completeSession,
        setSoundMode,
        closePostSessionDialog,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
