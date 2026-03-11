import { z } from 'zod';

import type { EmployeeProfile } from '@/features/admin/employee-profile/types/employee-profile';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const nullableString = (max: number) =>
  z.string().trim().max(max, `Must be at most ${max} characters`).nullable();

const nullableUuid = z.string().uuid('Invalid UUID').nullable();

const nullableInteger = (min: number, max: number) =>
  z.number().int().min(min).max(max).nullable();

export const employeeProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  employeeNumber: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  middleName: nullableString(255),
  displayName: nullableString(255),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  dateOfBirth: z
    .string()
    .regex(dateRegex, 'Date must be YYYY-MM-DD')
    .nullable(),
  nationality: nullableString(255),
  workCountry: nullableString(255),
  mobileNumber: nullableString(20),
  numberSeries: nullableString(20),
  attendanceNumber: nullableString(50),
  joiningDate: z
    .string()
    .regex(dateRegex, 'Date must be YYYY-MM-DD')
    .nullable(),
  jobTitle: nullableString(255),
  secondaryJobTitle: nullableString(255),
  timeType: z.enum(['full_time', 'part_time', 'contract']),
  workerType: z
    .enum(['permanent', 'contract', 'intern', 'consultant'])
    .nullable(),
  reportingManagerId: nullableUuid,
  dottedLineManagerId: nullableUuid,
  departmentId: nullableUuid,
  legalEntityId: nullableUuid,
  businessUnitId: nullableUuid,
  locationId: nullableUuid,
  probationPolicyMonths: nullableInteger(0, 36),
  noticePeriodDays: nullableInteger(0, 365),
  holidayListId: nullableUuid,
  inviteToLogin: z.boolean().nullable(),
  enableOnboardingFlow: z.boolean().nullable(),
});

export type EmployeeProfileFormValues = z.infer<typeof employeeProfileSchema>;

function normalizeNullableString(
  value: string | null | undefined
): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function normalizeNullableUuid(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapProfileToFormValues(
  profile: EmployeeProfile
): EmployeeProfileFormValues {
  return {
    id: profile.id,
    userId: profile.userId,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    employeeNumber: profile.employeeNumber,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    middleName: profile.middleName,
    displayName: profile.displayName,
    gender: profile.gender,
    dateOfBirth: normalizeDate(profile.dateOfBirth),
    nationality: profile.nationality,
    workCountry: profile.workCountry,
    mobileNumber: profile.mobileNumber,
    numberSeries: profile.numberSeries,
    attendanceNumber: profile.attendanceNumber,
    joiningDate: normalizeDate(profile.joiningDate),
    jobTitle: profile.jobTitle,
    secondaryJobTitle: profile.secondaryJobTitle,
    timeType: profile.timeType,
    workerType: profile.workerType,
    reportingManagerId: profile.reportingManagerId,
    dottedLineManagerId: profile.dottedLineManagerId,
    departmentId: profile.departmentId,
    legalEntityId: profile.legalEntityId,
    businessUnitId: profile.businessUnitId,
    locationId: profile.locationId,
    probationPolicyMonths: profile.probationPolicyMonths,
    noticePeriodDays: profile.noticePeriodDays,
    holidayListId: profile.holidayListId,
    inviteToLogin: profile.inviteToLogin,
    enableOnboardingFlow: profile.enableOnboardingFlow,
  };
}

type EmployeeProfileEditablePayload = {
  middleName: string | null;
  displayName: string | null;
  gender: 'male' | 'female' | 'other' | null;
  dateOfBirth: string | null;
  nationality: string | null;
  workCountry: string | null;
  mobileNumber: string | null;
  numberSeries: string | null;
  attendanceNumber: string | null;
  joiningDate: string | null;
  jobTitle: string | null;
  secondaryJobTitle: string | null;
  timeType: 'full_time' | 'part_time' | 'contract';
  workerType: 'permanent' | 'contract' | 'intern' | 'consultant' | null;
  reportingManagerId: string | null;
  dottedLineManagerId: string | null;
  departmentId: string | null;
  legalEntityId: string | null;
  businessUnitId: string | null;
  locationId: string | null;
  probationPolicyMonths: number | null;
  noticePeriodDays: number | null;
  holidayListId: string | null;
  inviteToLogin: boolean | null;
  enableOnboardingFlow: boolean | null;
};

export type EmployeeProfileUpdatePayload =
  Partial<EmployeeProfileEditablePayload>;

export function buildEmployeeProfilePayload(
  values: EmployeeProfileFormValues
): EmployeeProfileEditablePayload {
  return {
    middleName: normalizeNullableString(values.middleName),
    displayName: normalizeNullableString(values.displayName),
    gender: values.gender,
    dateOfBirth: normalizeDate(values.dateOfBirth),
    nationality: normalizeNullableString(values.nationality),
    workCountry: normalizeNullableString(values.workCountry),
    mobileNumber: normalizeNullableString(values.mobileNumber),
    numberSeries: normalizeNullableString(values.numberSeries),
    attendanceNumber: normalizeNullableString(values.attendanceNumber),
    joiningDate: normalizeDate(values.joiningDate),
    jobTitle: normalizeNullableString(values.jobTitle),
    secondaryJobTitle: normalizeNullableString(values.secondaryJobTitle),
    timeType: values.timeType,
    workerType: values.workerType,
    reportingManagerId: normalizeNullableUuid(values.reportingManagerId),
    dottedLineManagerId: normalizeNullableUuid(values.dottedLineManagerId),
    departmentId: normalizeNullableUuid(values.departmentId),
    legalEntityId: normalizeNullableUuid(values.legalEntityId),
    businessUnitId: normalizeNullableUuid(values.businessUnitId),
    locationId: normalizeNullableUuid(values.locationId),
    probationPolicyMonths: values.probationPolicyMonths,
    noticePeriodDays: values.noticePeriodDays,
    holidayListId: normalizeNullableUuid(values.holidayListId),
    inviteToLogin: values.inviteToLogin,
    enableOnboardingFlow: values.enableOnboardingFlow,
  };
}
