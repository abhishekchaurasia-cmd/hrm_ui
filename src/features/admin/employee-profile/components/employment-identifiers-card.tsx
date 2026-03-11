import { RHFTextInput } from '@/features/admin/employee-profile/components/form-controls';
import { ProfileSectionCard } from '@/features/admin/employee-profile/components/profile-section-card';

import type { EmployeeProfileFormValues } from '@/features/admin/employee-profile/schema/employee-profile.schema';
import type { Control } from 'react-hook-form';

interface EmploymentIdentifiersCardProps {
  control: Control<EmployeeProfileFormValues>;
}

export function EmploymentIdentifiersCard({
  control,
}: EmploymentIdentifiersCardProps) {
  return (
    <ProfileSectionCard title="Employment Identifiers">
      <div className="grid gap-4 md:grid-cols-2">
        <RHFTextInput
          control={control}
          name="employeeNumber"
          label="Employee Number"
          disabled
        />
        <RHFTextInput
          control={control}
          name="numberSeries"
          label="Number Series"
        />
        <RHFTextInput
          control={control}
          name="attendanceNumber"
          label="Attendance Number"
        />
      </div>
    </ProfileSectionCard>
  );
}
