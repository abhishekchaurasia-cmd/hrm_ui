import { useMutation } from '@tanstack/react-query';

import { onboardEmployee } from '@/features/admin/employee-onboarding/api/onboarding';

export function useOnboardEmployee() {
  return useMutation({
    mutationFn: onboardEmployee,
  });
}
