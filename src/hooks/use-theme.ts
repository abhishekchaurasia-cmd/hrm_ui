'use client';

import { useCallback, useEffect } from 'react';

import {
  setTheme,
  syncSystemTheme,
  toggleTheme,
  selectThemeToggleState,
  type Theme,
} from '@/store/slices/theme';

import { useAppDispatch, useAppSelector } from './index';

export function useTheme() {
  const dispatch = useAppDispatch();
  const { theme, resolvedTheme } = useAppSelector(selectThemeToggleState);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => dispatch(syncSystemTheme());

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [dispatch]);

  const changeTheme = useCallback(
    (t: Theme) => dispatch(setTheme(t)),
    [dispatch]
  );

  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);

  return {
    theme,
    resolvedTheme,
    setTheme: changeTheme,
    toggleTheme: toggle,
    isDark: resolvedTheme === 'dark',
  };
}
