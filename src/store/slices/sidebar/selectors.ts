import { createSelector } from '@reduxjs/toolkit';

import type { SidebarState } from './interface';
import type { RootState } from '@/store/slices';

const selectSidebarState = (state: RootState) => state.sidebar;

const selectIsCollapsed = createSelector(
  [selectSidebarState],
  (state: SidebarState) => state.isCollapsed
);

const selectIsMobileOpen = createSelector(
  [selectSidebarState],
  (state: SidebarState) => state.isMobileOpen
);

export { selectSidebarState, selectIsCollapsed, selectIsMobileOpen };
