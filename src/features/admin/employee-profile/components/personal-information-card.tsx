import {
  RHFDateInput,
  RHFSelectInput,
  RHFTextInput,
} from '@/features/admin/employee-profile/components/form-controls';
import { ProfileSectionCard } from '@/features/admin/employee-profile/components/profile-section-card';

import type { EmployeeProfileFormValues } from '@/features/admin/employee-profile/schema/employee-profile.schema';
import type { Control } from 'react-hook-form';

interface PersonalInformationCardProps {
  control: Control<EmployeeProfileFormValues>;
}

export function PersonalInformationCard({
  control,
}: PersonalInformationCardProps) {
  return (
    <ProfileSectionCard title="Personal Information">
      <div className="grid gap-4 md:grid-cols-2">
        <RHFTextInput
          control={control}
          name="firstName"
          label="First Name"
          disabled
        />
        <RHFTextInput
          control={control}
          name="lastName"
          label="Last Name"
          disabled
        />
        <RHFTextInput control={control} name="middleName" label="Middle Name" />
        <RHFTextInput
          control={control}
          name="displayName"
          label="Display Name"
        />
        <RHFSelectInput
          control={control}
          name="gender"
          label="Gender"
          placeholder="Select gender"
          allowClear
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <RHFDateInput
          control={control}
          name="dateOfBirth"
          label="Date of Birth"
        />
        <RHFTextInput
          control={control}
          name="nationality"
          label="Nationality"
        />
        <RHFTextInput
          control={control}
          name="workCountry"
          label="Work Country"
        />
        <RHFTextInput
          control={control}
          name="mobileNumber"
          label="Mobile Number"
        />
      </div>
    </ProfileSectionCard>
  );
}
