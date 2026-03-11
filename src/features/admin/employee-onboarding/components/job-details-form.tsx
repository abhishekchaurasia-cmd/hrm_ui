'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Separator } from '@/components/ui/separator';
import {
  jobDetailsSchema,
  jobDetailsDefaults,
  type JobDetailsFormValues,
} from '@/features/admin/employee-onboarding/schema/onboarding.schema';
import {
  RHFTextInput,
  RHFDateInput,
  RHFSelectInput,
  RHFNumberInput,
} from '@/features/admin/employee-profile/components/form-controls';
import {
  useUsersOptions,
  useDepartmentsOptions,
  useLegalEntitiesOptions,
  useBusinessUnitsOptions,
  useLocationsOptions,
} from '@/features/admin/employee-profile/hooks/use-relation-options';

const TIME_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
];

const WORKER_TYPE_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
  { value: 'consultant', label: 'Consultant' },
];

interface JobDetailsFormProps {
  defaultValues?: JobDetailsFormValues;
  onSubmit: (data: JobDetailsFormValues) => void;
  formRef: React.RefObject<{ submit: () => void } | null>;
}

export function JobDetailsForm({
  defaultValues,
  onSubmit,
  formRef,
}: JobDetailsFormProps) {
  const form = useForm<JobDetailsFormValues>({
    resolver: zodResolver(jobDetailsSchema),
    defaultValues: defaultValues ?? jobDetailsDefaults,
  });

  const { control, handleSubmit } = form;

  const { data: users = [] } = useUsersOptions();
  const { data: departments = [] } = useDepartmentsOptions();
  const { data: legalEntities = [] } = useLegalEntitiesOptions();
  const { data: businessUnits = [] } = useBusinessUnitsOptions();
  const { data: locations = [] } = useLocationsOptions();

  useEffect(() => {
    if (formRef) {
      formRef.current = {
        submit: () => {
          void handleSubmit(onSubmit)();
        },
      };
    }
  }, [formRef, handleSubmit, onSubmit]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-8">
      <section>
        <h3 className="mb-4 text-base font-semibold">Employment Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <RHFDateInput
            control={control}
            name="joiningDate"
            label="Joining Date"
          />
          <RHFTextInput
            control={control}
            name="jobTitle"
            label="Job Title"
            placeholder="e.g. Software Engineer"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div />
          <RHFSelectInput
            control={control}
            name="timeType"
            label="Time Type"
            placeholder="Select"
            options={TIME_TYPE_OPTIONS}
            allowClear
          />
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-4 text-base font-semibold">Organisational Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <RHFSelectInput
            control={control}
            name="legalEntityId"
            label="Legal Entity"
            placeholder="Legal Entity"
            options={legalEntities}
            allowClear
          />
          <RHFSelectInput
            control={control}
            name="businessUnitId"
            label="Business Unit"
            placeholder="Business Unit"
            options={businessUnits}
            allowClear
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <RHFSelectInput
            control={control}
            name="departmentId"
            label="Department"
            placeholder="Department"
            options={departments}
            allowClear
          />
          <RHFSelectInput
            control={control}
            name="locationId"
            label="Location"
            placeholder="Location"
            options={locations}
            allowClear
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <RHFSelectInput
            control={control}
            name="workerType"
            label="Worker Type"
            placeholder="Select"
            options={WORKER_TYPE_OPTIONS}
            allowClear
          />
          <RHFSelectInput
            control={control}
            name="reportingManagerId"
            label="Reporting Manager"
            placeholder="Search employee"
            options={users}
            allowClear
          />
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-4 text-base font-semibold">Employment Terms</h3>

        <div className="grid grid-cols-2 gap-4">
          <RHFNumberInput
            control={control}
            name="probationPolicyMonths"
            label="Probation Policy (months)"
            placeholder="e.g. 3"
            min={0}
            max={36}
          />
          <RHFNumberInput
            control={control}
            name="noticePeriodDays"
            label="Notice Period (days)"
            placeholder="e.g. 30"
            min={0}
            max={365}
          />
        </div>
      </section>
    </form>
  );
}
