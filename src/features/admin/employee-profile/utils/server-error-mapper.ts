import axios from 'axios';

import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

const fieldAliasMap: Record<string, string[]> = {
  middleName: ['middleName', 'middle_name'],
  displayName: ['displayName', 'display_name'],
  gender: ['gender'],
  dateOfBirth: ['dateOfBirth', 'date_of_birth'],
  nationality: ['nationality'],
  workCountry: ['workCountry', 'work_country'],
  mobileNumber: ['mobileNumber', 'mobile_number'],
  numberSeries: ['numberSeries', 'number_series'],
  attendanceNumber: ['attendanceNumber', 'attendance_number'],
  joiningDate: ['joiningDate', 'joining_date'],
  jobTitle: ['jobTitle', 'job_title'],
  secondaryJobTitle: ['secondaryJobTitle', 'secondary_job_title'],
  timeType: ['timeType', 'time_type'],
  workerType: ['workerType', 'worker_type'],
  reportingManagerId: ['reportingManagerId', 'reporting_manager_id'],
  dottedLineManagerId: ['dottedLineManagerId', 'dotted_line_manager_id'],
  departmentId: ['departmentId', 'department_id'],
  legalEntityId: ['legalEntityId', 'legal_entity_id'],
  businessUnitId: ['businessUnitId', 'business_unit_id'],
  locationId: ['locationId', 'location_id'],
  probationPolicyMonths: ['probationPolicyMonths', 'probation_policy_months'],
  noticePeriodDays: ['noticePeriodDays', 'notice_period_days'],
  holidayListId: ['holidayListId', 'holiday_list_id'],
  inviteToLogin: ['inviteToLogin', 'invite_to_login'],
  enableOnboardingFlow: ['enableOnboardingFlow', 'enable_onboarding_flow'],
};

function findFieldFromMessage(message: string): string | null {
  const normalized = message.toLowerCase();
  for (const [field, aliases] of Object.entries(fieldAliasMap)) {
    if (aliases.some(alias => normalized.includes(alias.toLowerCase()))) {
      return field;
    }
  }
  return null;
}

export function mapServerValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
): { handledFieldErrors: boolean; globalMessages: string[] } {
  if (!axios.isAxiosError(error)) {
    return { handledFieldErrors: false, globalMessages: [] };
  }

  const message = error.response?.data?.message as unknown;
  if (!message) {
    return { handledFieldErrors: false, globalMessages: [] };
  }

  if (typeof message === 'string') {
    return { handledFieldErrors: false, globalMessages: [message] };
  }

  if (!Array.isArray(message)) {
    return { handledFieldErrors: false, globalMessages: [] };
  }

  let handledFieldErrors = false;
  const globalMessages: string[] = [];

  for (const entry of message) {
    if (typeof entry !== 'string') continue;
    const field = findFieldFromMessage(entry);
    if (field) {
      setError(field as FieldPath<TFieldValues>, {
        type: 'server',
        message: entry,
      });
      handledFieldErrors = true;
    } else {
      globalMessages.push(entry);
    }
  }

  return { handledFieldErrors, globalMessages };
}
