import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Theme, ThemeState } from './interface';

const THEME_KEY = 'hrm_theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function loadThemeFromStorage(): Theme {
  if (typeof window === 'undefined') {
    return 'system';
  }
  return (localStorage.getItem(THEME_KEY) as Theme) ?? 'system';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

const savedTheme = loadThemeFromStorage();

const initialState: ThemeState = {
  theme: savedTheme,
  resolvedTheme: resolveTheme(savedTheme),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.resolvedTheme = resolveTheme(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_KEY, action.payload);
      }
    },
    toggleTheme: state => {
      const next = state.resolvedTheme === 'dark' ? 'light' : 'dark';
      state.theme = next;
      state.resolvedTheme = next;
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_KEY, next);
      }
    },
    syncSystemTheme: state => {
      if (state.theme === 'system') {
        state.resolvedTheme = getSystemTheme();
      }
    },
  },
});

export const { setTheme, toggleTheme, syncSystemTheme } = themeSlice.actions;

export {
  selectThemeState,
  selectTheme,
  selectResolvedTheme,
  selectThemeToggleState,
} from './selectors';

export type { Theme, ThemeState } from './interface';

export default themeSlice.reducer;
