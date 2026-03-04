import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Warning threshold: 5 minutes remaining
const WARNING_THRESHOLD_SECONDS = 300;
const STORAGE_KEY = 'v4_timer_state';

type TimerStatus = 'idle' | 'running' | 'paused' | 'timeup';

interface TimerState {
  status: TimerStatus;
  totalSeconds: number;
  remainingSeconds: number;
  startedAt: string | null;
  elapsedBeforeSegment: number;
  planItemId: string | null;
  topicName: string | null;
}

interface TimerContextValue {
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  planItemId: string | null;
  topicName: string | null;
  isWarning: boolean;
  start: (opts: { durationMinutes?: number; planItemId?: string; topicName?: string }) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const initialState: TimerState = {
  status: 'idle',
  totalSeconds: 0,
  remainingSeconds: 0,
  startedAt: null,
  elapsedBeforeSegment: 0,
  planItemId: null,
  topicName: null,
};

const TimerContext = createContext<TimerContextValue>({
  status: 'idle',
  remainingSeconds: 0,
  totalSeconds: 0,
  planItemId: null,
  topicName: null,
  isWarning: false,
  start: () => {},
  pause: () => {},
  resume: () => {},
  stop: () => {},
});

function computeRemaining(state: TimerState): number {
  if (state.status !== 'running' || !state.startedAt) return state.remainingSeconds;
  const segmentElapsed = (Date.now() - new Date(state.startedAt).getTime()) / 1000;
  const totalElapsed = state.elapsedBeforeSegment + segmentElapsed;
  return Math.max(0, state.totalSeconds - totalElapsed);
}

async function persistState(state: TimerState) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Restore persisted state on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved: TimerState = JSON.parse(raw);
        if (saved.status === 'idle') return;

        // Recalculate remaining for running timers
        if (saved.status === 'running') {
          const remaining = computeRemaining(saved);
          saved.remainingSeconds = remaining;
          if (remaining <= 0) saved.status = 'timeup';
        }
        setState(saved);
      } catch {}
    })();
  }, []);

  // Persist on status changes
  useEffect(() => {
    if (state !== initialState) persistState(state);
  }, [state.status, state.remainingSeconds]);

  // Tick interval for running state
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state.status === 'running') {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const remaining = computeRemaining(prev);
          const newStatus = remaining <= 0 ? 'timeup' as const : prev.status;
          return { ...prev, remainingSeconds: remaining, status: newStatus };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.status]);

  // AppState listener: recalculate on foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && stateRef.current.status === 'running') {
        setState(prev => {
          const remaining = computeRemaining(prev);
          const newStatus = remaining <= 0 ? 'timeup' as const : prev.status;
          return { ...prev, remainingSeconds: remaining, status: newStatus };
        });
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  const start = useCallback((opts: { durationMinutes?: number; planItemId?: string; topicName?: string }) => {
    const totalSeconds = (opts.durationMinutes || 60) * 60;
    const newState: TimerState = {
      status: 'running',
      totalSeconds,
      remainingSeconds: totalSeconds,
      startedAt: new Date().toISOString(),
      elapsedBeforeSegment: 0,
      planItemId: opts.planItemId || null,
      topicName: opts.topicName || null,
    };
    setState(newState);
    persistState(newState);
  }, []);

  const pause = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'running') return prev;
      const remaining = computeRemaining(prev);
      const segmentElapsed = prev.startedAt
        ? (Date.now() - new Date(prev.startedAt).getTime()) / 1000
        : 0;
      const newState: TimerState = {
        ...prev,
        status: 'paused',
        remainingSeconds: remaining,
        startedAt: null,
        elapsedBeforeSegment: prev.elapsedBeforeSegment + segmentElapsed,
      };
      persistState(newState);
      return newState;
    });
  }, []);

  const resume = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'paused') return prev;
      const newState: TimerState = {
        ...prev,
        status: 'running',
        startedAt: new Date().toISOString(),
      };
      persistState(newState);
      return newState;
    });
  }, []);

  const stop = useCallback(() => {
    setState(initialState);
    persistState(initialState);
  }, []);

  const value: TimerContextValue = {
    status: state.status,
    remainingSeconds: state.remainingSeconds,
    totalSeconds: state.totalSeconds,
    planItemId: state.planItemId,
    topicName: state.topicName,
    isWarning: state.remainingSeconds <= WARNING_THRESHOLD_SECONDS && state.status !== 'idle',
    start,
    pause,
    resume,
    stop,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer(): TimerContextValue {
  return useContext(TimerContext);
}
