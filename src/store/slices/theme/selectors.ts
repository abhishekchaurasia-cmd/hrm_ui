import { createSelector } from '@reduxjs/toolkit';

import type { ThemeState } from './interface';
import type { RootState } from '@/store/slices';

const selectThemeState = (state: RootState) => state.theme;

const selectTheme = createSelector(
  [selectThemeState],
  (state: ThemeState) => state.theme
);

const selectResolvedTheme = createSelector(
  [selectThemeState],
  (state: ThemeState) => state.resolvedTheme
);

const selectThemeToggleState = createSelector(
  [selectThemeState],
  (state: ThemeState) => ({
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
  })
);

export {
  selectThemeState,
  selectTheme,
  selectResolvedTheme,
  selectThemeToggleState,
};
