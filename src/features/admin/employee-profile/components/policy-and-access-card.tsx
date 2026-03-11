import {
  RHFNumberInput,
  RHFSelectInput,
  RHFToggleInput,
} from '@/features/admin/employee-profile/components/form-controls';
import { ProfileSectionCard } from '@/features/admin/employee-profile/components/profile-section-card';

import type { EmployeeProfileFormValues } from '@/features/admin/employee-profile/schema/employee-profile.schema';
import type { OptionItem } from '@/features/admin/employee-profile/types/employee-profile';
import type { Control } from 'react-hook-form';

interface PolicyAndAccessCardProps {
  control: Control<EmployeeProfileFormValues>;
  holidayListOptions: OptionItem[];
}

export function PolicyAndAccessCard({
  control,
  holidayListOptions,
}: PolicyAndAccessCardProps) {
  return (
    <ProfileSectionCard title="Policy and Access Controls">
      <div className="grid gap-4 md:grid-cols-2">
        <RHFNumberInput
          control={control}
          name="probationPolicyMonths"
          label="Probation Policy (Months)"
          min={0}
          max={36}
        />
        <RHFNumberInput
          control={control}
          name="noticePeriodDays"
          label="Notice Period (Days)"
          min={0}
          max={365}
        />
        <RHFSelectInput
          control={control}
          name="holidayListId"
          label="Holiday List"
          placeholder="Select holiday list"
          allowClear
          options={holidayListOptions}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <RHFToggleInput
          control={control}
          name="inviteToLogin"
          label="Invite to Login"
        />
        <RHFToggleInput
          control={control}
          name="enableOnboardingFlow"
          label="Enable Onboarding Flow"
        />
      </div>
    </ProfileSectionCard>
  );
}
