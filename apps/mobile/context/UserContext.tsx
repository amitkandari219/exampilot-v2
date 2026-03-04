import React, { createContext, useContext, useMemo } from 'react';
import { useProfile } from '../hooks/useProfile';

interface UserContextValue {
  daysUsed: number;
  attempt: number;
  isVeteran: boolean;
  examMode: string;
  profileLoading: boolean;
}

const defaultValue: UserContextValue = {
  daysUsed: 0,
  attempt: 1,
  isVeteran: false,
  examMode: 'prelims',
  profileLoading: true,
};

const UserContext = createContext<UserContextValue>(defaultValue);

function normalizeAttempt(raw: string | null): number {
  if (!raw) return 1;
  switch (raw) {
    case 'first':
    case '1':
      return 1;
    case 'second':
    case '2':
      return 2;
    case 'third_plus':
    case '3':
    default:
      return 3;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading } = useProfile();

  const value = useMemo<UserContextValue>(() => {
    if (!profile || isLoading) return defaultValue;

    const daysUsed = profile.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
      : 0;
    const attempt = normalizeAttempt(profile.attempt_number);
    const isVeteran = attempt >= 2;
    const examMode = profile.current_mode || 'prelims';

    return { daysUsed, attempt, isVeteran, examMode, profileLoading: false };
  }, [profile, isLoading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
