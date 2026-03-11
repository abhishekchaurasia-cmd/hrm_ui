'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Separator } from '@/components/ui/separator';
import {
  useShiftsOptions,
  useLeavePlansOptions,
} from '@/features/admin/employee-onboarding/hooks/use-onboarding-options';
import {
  workDetailsSchema,
  workDetailsDefaults,
  type WorkDetailsFormValues,
} from '@/features/admin/employee-onboarding/schema/onboarding.schema';
import {
  RHFTextInput,
  RHFSelectInput,
  RHFToggleInput,
} from '@/features/admin/employee-profile/components/form-controls';
import { useHolidayListsOptions } from '@/features/admin/employee-profile/hooks/use-relation-options';

interface WorkDetailsFormProps {
  defaultValues?: WorkDetailsFormValues;
  onSubmit: (data: WorkDetailsFormValues) => void;
  formRef: React.RefObject<{ submit: () => void } | null>;
}

export function WorkDetailsForm({
  defaultValues,
  onSubmit,
  formRef,
}: WorkDetailsFormProps) {
  const form = useForm<WorkDetailsFormValues>({
    resolver: zodResolver(workDetailsSchema),
    defaultValues: defaultValues ?? workDetailsDefaults,
  });

  const { control, handleSubmit } = form;

  const { data: shifts = [] } = useShiftsOptions();
  const { data: leavePlans = [] } = useLeavePlansOptions();
  const { data: holidayLists = [] } = useHolidayListsOptions();

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
        <h3 className="mb-4 text-base font-semibold">Onboarding Settings</h3>

        <div className="space-y-3">
          <RHFToggleInput
            control={control}
            name="inviteToLogin"
            label="Invite employee to login"
          />
          <RHFToggleInput
            control={control}
            name="enableOnboardingFlow"
            label="Enable onboarding flow"
          />
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-4 text-base font-semibold">Leave Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <RHFSelectInput
            control={control}
            name="leavePlanId"
            label="Leave Plan"
            placeholder="Select leave plan"
            options={leavePlans}
            allowClear
          />
          <RHFSelectInput
            control={control}
            name="holidayListId"
            label="Holiday List"
            placeholder="Select holiday list"
            options={holidayLists}
            allowClear
          />
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-4 text-base font-semibold">Attendance Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <RHFSelectInput
            control={control}
            name="shiftId"
            label="Shift"
            placeholder="Select shift"
            options={shifts}
            allowClear
          />
          <RHFTextInput
            control={control}
            name="attendanceNumber"
            label="Attendance Number"
            placeholder="Attendance Number"
          />
        </div>
      </section>
    </form>
  );
}
