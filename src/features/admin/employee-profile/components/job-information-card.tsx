import {
  RHFDateInput,
  RHFSelectInput,
  RHFTextInput,
} from '@/features/admin/employee-profile/components/form-controls';
import { ProfileSectionCard } from '@/features/admin/employee-profile/components/profile-section-card';

import type { EmployeeProfileFormValues } from '@/features/admin/employee-profile/schema/employee-profile.schema';
import type { OptionItem } from '@/features/admin/employee-profile/types/employee-profile';
import type { Control } from 'react-hook-form';

interface JobInformationCardProps {
  control: Control<EmployeeProfileFormValues>;
  managerOptions: OptionItem[];
}

export function JobInformationCard({
  control,
  managerOptions,
}: JobInformationCardProps) {
  return (
    <ProfileSectionCard title="Job Information">
      <div className="grid gap-4 md:grid-cols-2">
        <RHFDateInput
          control={control}
          name="joiningDate"
          label="Joining Date"
        />
        <RHFTextInput control={control} name="jobTitle" label="Job Title" />
        <RHFTextInput
          control={control}
          name="secondaryJobTitle"
          label="Secondary Job Title"
        />
        <RHFSelectInput
          control={control}
          name="timeType"
          label="Time Type"
          required
          options={[
            { value: 'full_time', label: 'Full Time' },
            { value: 'part_time', label: 'Part Time' },
            { value: 'contract', label: 'Contract' },
          ]}
        />
        <RHFSelectInput
          control={control}
          name="workerType"
          label="Worker Type"
          allowClear
          options={[
            { value: 'permanent', label: 'Permanent' },
            { value: 'contract', label: 'Contract' },
            { value: 'intern', label: 'Intern' },
            { value: 'consultant', label: 'Consultant' },
          ]}
        />
        <RHFSelectInput
          control={control}
          name="reportingManagerId"
          label="Reporting Manager"
          placeholder="Select manager"
          allowClear
          options={managerOptions}
        />
        <RHFSelectInput
          control={control}
          name="dottedLineManagerId"
          label="Dotted Line Manager"
          placeholder="Select manager"
          allowClear
          options={managerOptions}
        />
      </div>
    </ProfileSectionCard>
  );
}
