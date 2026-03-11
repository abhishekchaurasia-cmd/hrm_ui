'use client';

import { useEffect } from 'react';

export function useUnsavedChangesPrompt(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor?.href) return;

      const shouldLeave = window.confirm(
        'You have unsaved changes. Leave this page anyway?'
      );
      if (!shouldLeave) {
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    document.addEventListener('click', clickHandler, true);

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      document.removeEventListener('click', clickHandler, true);
    };
  }, [isDirty]);
}
