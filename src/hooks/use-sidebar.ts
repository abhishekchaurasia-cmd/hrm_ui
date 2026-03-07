'use client';

import { useCallback } from 'react';

import {
  closeMobileSidebar,
  toggleSidebar,
  toggleMobileSidebar,
  collapseSidebar,
  expandSidebar,
  selectIsCollapsed,
  selectIsMobileOpen,
} from '@/store/slices/sidebar';

import { useAppDispatch, useAppSelector } from './index';

export function useSidebar() {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(selectIsCollapsed);
  const isMobileOpen = useAppSelector(selectIsMobileOpen);

  const toggle = useCallback(() => dispatch(toggleSidebar()), [dispatch]);
  const toggleMobile = useCallback(
    () => dispatch(toggleMobileSidebar()),
    [dispatch]
  );
  const collapse = useCallback(() => dispatch(collapseSidebar()), [dispatch]);
  const expand = useCallback(() => dispatch(expandSidebar()), [dispatch]);
  const closeMobile = useCallback(
    () => dispatch(closeMobileSidebar()),
    [dispatch]
  );

  return {
    isCollapsed,
    isMobileOpen,
    toggleSidebar: toggle,
    toggleMobileSidebar: toggleMobile,
    collapseSidebar: collapse,
    expandSidebar: expand,
    closeMobileSidebar: closeMobile,
  };
}
