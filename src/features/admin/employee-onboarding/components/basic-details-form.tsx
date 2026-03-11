'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  basicDetailsSchema,
  basicDetailsDefaults,
  type BasicDetailsFormValues,
} from '@/features/admin/employee-onboarding/schema/onboarding.schema';
import {
  RHFTextInput,
  RHFDateInput,
  RHFSelectInput,
} from '@/features/admin/employee-profile/components/form-controls';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const NATIONALITY_OPTIONS = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
];

const NUMBER_SERIES_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manually' },
];

interface BasicDetailsFormProps {
  defaultValues?: BasicDetailsFormValues;
  onSubmit: (data: BasicDetailsFormValues) => void;
  formRef: React.RefObject<{ submit: () => void } | null>;
}

export function BasicDetailsForm({
  defaultValues,
  onSubmit,
  formRef,
}: BasicDetailsFormProps) {
  const form = useForm<BasicDetailsFormValues>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: defaultValues ?? basicDetailsDefaults,
  });

  const { control, handleSubmit } = form;

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
        <h3 className="mb-4 text-base font-semibold">Employee details</h3>

        <div className="mb-4">
          <RHFSelectInput
            control={control}
            name="workCountry"
            label="Work Country"
            placeholder="Select country"
            options={NATIONALITY_OPTIONS}
            allowClear
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <RHFTextInput
            control={control}
            name="firstName"
            label="First Name"
            placeholder="First Name"
            required
          />
          <RHFTextInput
            control={control}
            name="middleName"
            label="Middle Name"
            placeholder="Middle Name"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <RHFTextInput
            control={control}
            name="lastName"
            label="Last Name"
            placeholder="Last Name"
            required
          />
          <RHFTextInput
            control={control}
            name="displayName"
            label="Display Name"
            placeholder="Display Name"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <RHFSelectInput
            control={control}
            name="gender"
            label="Gender"
            placeholder="Select gender"
            options={GENDER_OPTIONS}
            allowClear
          />
          <RHFDateInput
            control={control}
            name="dateOfBirth"
            label="Date of Birth"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <RHFSelectInput
            control={control}
            name="nationality"
            label="Nationality"
            placeholder="Select nationality"
            options={NATIONALITY_OPTIONS}
            allowClear
          />
          <RHFSelectInput
            control={control}
            name="numberSeries"
            label="Number Series"
            placeholder="Select"
            options={NUMBER_SERIES_OPTIONS}
            allowClear
          />
        </div>

        <div className="mt-4 max-w-[calc(50%-0.5rem)]">
          <RHFTextInput
            control={control}
            name="employeeNumber"
            label="Employee Number"
            placeholder="e.g. EMP-001"
          />
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-4 text-base font-semibold">Contact Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <RHFTextInput
            control={control}
            name="email"
            label="Work Email"
            placeholder="employee@company.com"
            required
          />
          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <div className="flex gap-2">
              <div className="bg-muted flex items-center rounded-md border px-3 text-sm">
                +91
              </div>
              <Controller
                control={control}
                name="mobileNumber"
                render={({ field, fieldState }) => (
                  <div className="flex-1 space-y-1">
                    <Input
                      value={field.value ?? ''}
                      onChange={e =>
                        field.onChange(
                          e.target.value === '' ? null : e.target.value
                        )
                      }
                      placeholder="Mobile Number"
                    />
                    {fieldState.error && (
                      <p className="text-destructive text-xs">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 max-w-[calc(50%-0.5rem)]">
          <RHFTextInput
            control={control}
            name="password"
            label="Temporary Password"
            placeholder="Min 8 characters"
            required
          />
        </div>
      </section>
    </form>
  );
}
