import { createSlice } from '@reduxjs/toolkit';

import type { SidebarState } from './interface';

const SIDEBAR_KEY = 'hrm_sidebar_collapsed';

function loadCollapsedFromStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(SIDEBAR_KEY) === 'true';
}

const initialState: SidebarState = {
  isCollapsed: loadCollapsedFromStorage(),
  isMobileOpen: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: state => {
      state.isCollapsed = !state.isCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_KEY, String(state.isCollapsed));
      }
    },
    collapseSidebar: state => {
      state.isCollapsed = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_KEY, 'true');
      }
    },
    expandSidebar: state => {
      state.isCollapsed = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_KEY, 'false');
      }
    },
    toggleMobileSidebar: state => {
      state.isMobileOpen = !state.isMobileOpen;
    },
    openMobileSidebar: state => {
      state.isMobileOpen = true;
    },
    closeMobileSidebar: state => {
      state.isMobileOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  collapseSidebar,
  expandSidebar,
  toggleMobileSidebar,
  openMobileSidebar,
  closeMobileSidebar,
} = sidebarSlice.actions;

export {
  selectSidebarState,
  selectIsCollapsed,
  selectIsMobileOpen,
} from './selectors';

export type { SidebarState } from './interface';

export default sidebarSlice.reducer;
