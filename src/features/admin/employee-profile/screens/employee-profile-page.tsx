'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, RefreshCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmploymentIdentifiersCard } from '@/features/admin/employee-profile/components/employment-identifiers-card';
import { JobInformationCard } from '@/features/admin/employee-profile/components/job-information-card';
import { OrganizationMappingCard } from '@/features/admin/employee-profile/components/organization-mapping-card';
import { PersonalInformationCard } from '@/features/admin/employee-profile/components/personal-information-card';
import { PolicyAndAccessCard } from '@/features/admin/employee-profile/components/policy-and-access-card';
import { ProfileMetadataCard } from '@/features/admin/employee-profile/components/profile-metadata-card';
import {
  useEmployeeProfile,
  useUpdateEmployeeProfile,
} from '@/features/admin/employee-profile/hooks/use-employee-profile';
import {
  useBusinessUnitsOptions,
  useDepartmentsOptions,
  useHolidayListsOptions,
  useLegalEntitiesOptions,
  useLocationsOptions,
  useUsersOptions,
} from '@/features/admin/employee-profile/hooks/use-relation-options';
import { useUnsavedChangesPrompt } from '@/features/admin/employee-profile/hooks/use-unsaved-changes-prompt';
import {
  buildEmployeeProfilePayload,
  employeeProfileSchema,
  mapProfileToFormValues,
  type EmployeeProfileFormValues,
} from '@/features/admin/employee-profile/schema/employee-profile.schema';
import { mapServerValidationErrors } from '@/features/admin/employee-profile/utils/server-error-mapper';

interface EmployeeProfilePageProps {
  userId: string;
  departmentReadOnly?: boolean;
  pageTitle?: string;
}

const DEFAULT_VALUES: EmployeeProfileFormValues = {
  id: '',
  userId: '',
  email: '',
  firstName: '',
  lastName: '',
  employeeNumber: null,
  createdAt: '',
  updatedAt: '',
  middleName: null,
  displayName: null,
  gender: null,
  dateOfBirth: null,
  nationality: null,
  workCountry: null,
  mobileNumber: null,
  numberSeries: null,
  attendanceNumber: null,
  joiningDate: null,
  jobTitle: null,
  secondaryJobTitle: null,
  timeType: 'full_time',
  workerType: null,
  reportingManagerId: null,
  dottedLineManagerId: null,
  departmentId: null,
  legalEntityId: null,
  businessUnitId: null,
  locationId: null,
  probationPolicyMonths: null,
  noticePeriodDays: null,
  holidayListId: null,
  inviteToLogin: null,
  enableOnboardingFlow: null,
};

export function EmployeeProfilePage({
  userId,
  departmentReadOnly = false,
  pageTitle = 'Employee Profile',
}: EmployeeProfilePageProps) {
  const profileQuery = useEmployeeProfile(userId);
  const updateMutation = useUpdateEmployeeProfile(userId);
  const usersOptionsQuery = useUsersOptions();
  const departmentsOptionsQuery = useDepartmentsOptions();
  const legalEntitiesOptionsQuery = useLegalEntitiesOptions();
  const businessUnitsOptionsQuery = useBusinessUnitsOptions();
  const locationsOptionsQuery = useLocationsOptions();
  const holidayListsOptionsQuery = useHolidayListsOptions();
  const [messageBanner, setMessageBanner] = useState<string | null>(null);

  const form = useForm<EmployeeProfileFormValues>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  });

  useUnsavedChangesPrompt(form.formState.isDirty);

  useEffect(() => {
    if (profileQuery.data?.data) {
      form.reset(mapProfileToFormValues(profileQuery.data.data));
    }
  }, [profileQuery.data?.data, form]);

  const isOptionsLoading =
    usersOptionsQuery.isLoading ||
    departmentsOptionsQuery.isLoading ||
    legalEntitiesOptionsQuery.isLoading ||
    businessUnitsOptionsQuery.isLoading ||
    locationsOptionsQuery.isLoading ||
    holidayListsOptionsQuery.isLoading;

  const relationLoadWarning = useMemo(() => {
    if (
      usersOptionsQuery.error ||
      departmentsOptionsQuery.error ||
      legalEntitiesOptionsQuery.error ||
      businessUnitsOptionsQuery.error ||
      locationsOptionsQuery.error ||
      holidayListsOptionsQuery.error
    ) {
      return 'Some relation options failed to load. You can still edit other fields.';
    }

    return null;
  }, [
    usersOptionsQuery.error,
    departmentsOptionsQuery.error,
    legalEntitiesOptionsQuery.error,
    businessUnitsOptionsQuery.error,
    locationsOptionsQuery.error,
    holidayListsOptionsQuery.error,
  ]);

  const onSubmit = form.handleSubmit(async values => {
    setMessageBanner(null);
    try {
      const payload = buildEmployeeProfilePayload(values);
      const finalPayload = departmentReadOnly
        ? (({ departmentId: _departmentId, ...rest }) => rest)(payload)
        : payload;
      await updateMutation.mutateAsync(finalPayload);
      if (userId !== 'me') {
        toast.success('Employee profile updated successfully');
      }
      form.reset(values);
    } catch (error: unknown) {
      const { globalMessages } = mapServerValidationErrors(
        error,
        form.setError
      );
      if (globalMessages.length > 0) {
        setMessageBanner(globalMessages.join(' '));
        toast.error(globalMessages.join(' '));
        return;
      }

      setMessageBanner('Failed to update employee profile');
      toast.error('Failed to update employee profile');
    }
  });

  const handleReset = () => {
    if (!profileQuery.data?.data) return;
    form.reset(mapProfileToFormValues(profileQuery.data.data));
    setMessageBanner(null);
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">
          Loading employee profile...
        </p>
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <AlertTriangle className="text-destructive size-5" />
          <p className="text-sm font-medium">
            Could not load employee profile.
          </p>
          <Button onClick={() => void profileQuery.refetch()}>
            <RefreshCcw className="size-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profileQuery.data?.data) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-muted-foreground text-center text-sm">
            Employee profile not found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const profileValues = form.getValues();
  const departmentIdValue = profileValues.departmentId;
  const departmentLabel =
    departmentsOptionsQuery.data?.find(
      option => option.value === departmentIdValue
    )?.label ?? departmentIdValue;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm">
            View and update profile details for this employee.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!form.formState.isDirty || updateMutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={() => void onSubmit()}
            disabled={!form.formState.isDirty || updateMutation.isPending}
          >
            <Save className="size-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {messageBanner ? (
        <div className="bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {messageBanner}
        </div>
      ) : null}

      {isOptionsLoading ? (
        <div className="bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 text-sm">
          Loading relation options...
        </div>
      ) : null}

      {relationLoadWarning ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {relationLoadWarning}
        </div>
      ) : null}

      <form className="space-y-5">
        <PersonalInformationCard control={form.control} />
        <EmploymentIdentifiersCard control={form.control} />
        <JobInformationCard
          control={form.control}
          managerOptions={usersOptionsQuery.data ?? []}
        />
        <OrganizationMappingCard
          control={form.control}
          departmentOptions={departmentsOptionsQuery.data ?? []}
          legalEntityOptions={legalEntitiesOptionsQuery.data ?? []}
          businessUnitOptions={businessUnitsOptionsQuery.data ?? []}
          locationOptions={locationsOptionsQuery.data ?? []}
          departmentReadOnly={departmentReadOnly}
          departmentDisplayValue={departmentLabel}
        />
        <PolicyAndAccessCard
          control={form.control}
          holidayListOptions={holidayListsOptionsQuery.data ?? []}
        />
        <ProfileMetadataCard
          values={{
            id: profileValues.id,
            userId: profileValues.userId,
            email: profileValues.email,
            createdAt: profileValues.createdAt,
            updatedAt: profileValues.updatedAt,
          }}
        />
      </form>
    </div>
  );
}
