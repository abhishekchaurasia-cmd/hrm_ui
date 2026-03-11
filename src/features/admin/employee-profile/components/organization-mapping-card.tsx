import { Input } from '@/components/ui/input';
import { RHFSelectInput } from '@/features/admin/employee-profile/components/form-controls';
import { ProfileSectionCard } from '@/features/admin/employee-profile/components/profile-section-card';

import type { EmployeeProfileFormValues } from '@/features/admin/employee-profile/schema/employee-profile.schema';
import type { OptionItem } from '@/features/admin/employee-profile/types/employee-profile';
import type { Control } from 'react-hook-form';

interface OrganizationMappingCardProps {
  control: Control<EmployeeProfileFormValues>;
  departmentOptions: OptionItem[];
  legalEntityOptions: OptionItem[];
  businessUnitOptions: OptionItem[];
  locationOptions: OptionItem[];
  departmentReadOnly?: boolean;
  departmentDisplayValue?: string | null;
}

export function OrganizationMappingCard({
  control,
  departmentOptions,
  legalEntityOptions,
  businessUnitOptions,
  locationOptions,
  departmentReadOnly = false,
  departmentDisplayValue,
}: OrganizationMappingCardProps) {
  return (
    <ProfileSectionCard title="Organization Mapping">
      <div className="grid gap-4 md:grid-cols-2">
        {departmentReadOnly ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Department</p>
            <Input
              value={departmentDisplayValue ?? 'Not set'}
              disabled
              readOnly
            />
          </div>
        ) : (
          <RHFSelectInput
            control={control}
            name="departmentId"
            label="Department"
            placeholder="Select department"
            allowClear
            options={departmentOptions}
          />
        )}
        <RHFSelectInput
          control={control}
          name="legalEntityId"
          label="Legal Entity"
          placeholder="Select legal entity"
          allowClear
          options={legalEntityOptions}
        />
        <RHFSelectInput
          control={control}
          name="businessUnitId"
          label="Business Unit"
          placeholder="Select business unit"
          allowClear
          options={businessUnitOptions}
        />
        <RHFSelectInput
          control={control}
          name="locationId"
          label="Location"
          placeholder="Select location"
          allowClear
          options={locationOptions}
        />
      </div>
    </ProfileSectionCard>
  );
}
