import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const nullableString = (max: number) =>
  z.string().trim().max(max, `Must be at most ${max} characters`).nullable();

const nullableUuid = z.string().uuid('Invalid selection').nullable();

const nullableDate = z
  .string()
  .regex(dateRegex, 'Date must be YYYY-MM-DD')
  .nullable();

// ---------- Step 1: Basic Details ----------

export const basicDetailsSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(255),
  lastName: z.string().trim().min(1, 'Last name is required').max(255),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .max(128, 'Maximum 128 characters'),
  middleName: nullableString(255),
  displayName: nullableString(255),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  dateOfBirth: nullableDate,
  nationality: nullableString(255),
  workCountry: nullableString(255),
  employeeNumber: nullableString(50),
  numberSeries: nullableString(20),
  mobileNumber: nullableString(20),
});

export type BasicDetailsFormValues = z.infer<typeof basicDetailsSchema>;

export const basicDetailsDefaults: BasicDetailsFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  middleName: null,
  displayName: null,
  gender: null,
  dateOfBirth: null,
  nationality: null,
  workCountry: null,
  employeeNumber: null,
  numberSeries: null,
  mobileNumber: null,
};

// ---------- Step 2: Job Details ----------

export const jobDetailsSchema = z.object({
  joiningDate: nullableDate,
  jobTitle: nullableString(255),
  timeType: z.enum(['full_time', 'part_time', 'contract']).nullable(),
  workerType: z
    .enum(['permanent', 'contract', 'intern', 'consultant'])
    .nullable(),
  departmentId: nullableUuid,
  legalEntityId: nullableUuid,
  businessUnitId: nullableUuid,
  locationId: nullableUuid,
  reportingManagerId: nullableUuid,
  probationPolicyMonths: z.number().int().min(0).max(36).nullable(),
  noticePeriodDays: z.number().int().min(0).max(365).nullable(),
});

export type JobDetailsFormValues = z.infer<typeof jobDetailsSchema>;

export const jobDetailsDefaults: JobDetailsFormValues = {
  joiningDate: null,
  jobTitle: null,
  timeType: 'full_time',
  workerType: 'permanent',
  departmentId: null,
  legalEntityId: null,
  businessUnitId: null,
  locationId: null,
  reportingManagerId: null,
  probationPolicyMonths: null,
  noticePeriodDays: null,
};

// ---------- Step 3: Work Details ----------

export const workDetailsSchema = z.object({
  inviteToLogin: z.boolean().nullable(),
  enableOnboardingFlow: z.boolean().nullable(),
  leavePlanId: nullableUuid,
  holidayListId: nullableUuid,
  shiftId: nullableUuid,
  attendanceNumber: nullableString(50),
});

export type WorkDetailsFormValues = z.infer<typeof workDetailsSchema>;

export const workDetailsDefaults: WorkDetailsFormValues = {
  inviteToLogin: false,
  enableOnboardingFlow: true,
  leavePlanId: null,
  holidayListId: null,
  shiftId: null,
  attendanceNumber: null,
};

// ---------- Step 4: Compensation ----------

const breakupItemSchema = z.object({
  salaryComponentId: z.string().uuid('Invalid component'),
  annualAmount: z.number().min(0, 'Must be 0 or more'),
});

export const compensationSchema = z.object({
  enablePayroll: z.boolean(),
  annualSalary: z.number().min(0, 'Must be 0 or more').nullable(),
  currency: z.string().max(10),
  salaryEffectiveFrom: nullableDate,
  regularSalary: z.number().min(0).nullable(),
  bonus: z.number().min(0).nullable(),
  isEsiEligible: z.boolean().nullable(),
  taxRegime: z.enum(['old_regime', 'new_regime']).nullable(),
  breakup: z.array(breakupItemSchema),
});

export type CompensationFormValues = z.infer<typeof compensationSchema>;

export const compensationDefaults: CompensationFormValues = {
  enablePayroll: true,
  annualSalary: null,
  currency: 'INR',
  salaryEffectiveFrom: null,
  regularSalary: null,
  bonus: null,
  isEsiEligible: false,
  taxRegime: 'new_regime',
  breakup: [],
};

// ---------- Payload Builder ----------

function stripNulls<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result = {} as Partial<T>;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

export function buildOnboardingPayload(data: {
  basicDetails: BasicDetailsFormValues;
  jobDetails?: JobDetailsFormValues;
  workDetails?: WorkDetailsFormValues;
  compensation?: CompensationFormValues;
}) {
  const payload: Record<string, unknown> = {
    basicDetails: {
      firstName: data.basicDetails.firstName,
      lastName: data.basicDetails.lastName,
      email: data.basicDetails.email,
      password: data.basicDetails.password,
      ...stripNulls({
        middleName: data.basicDetails.middleName,
        displayName: data.basicDetails.displayName,
        gender: data.basicDetails.gender,
        dateOfBirth: data.basicDetails.dateOfBirth,
        nationality: data.basicDetails.nationality,
        workCountry: data.basicDetails.workCountry,
        employeeNumber: data.basicDetails.employeeNumber,
        numberSeries: data.basicDetails.numberSeries,
        mobileNumber: data.basicDetails.mobileNumber,
      }),
    },
  };

  if (data.jobDetails) {
    const cleaned = stripNulls(data.jobDetails);
    if (Object.keys(cleaned).length > 0) {
      payload.jobDetails = cleaned;
    }
  }

  if (data.workDetails) {
    const cleaned = stripNulls(data.workDetails);
    if (Object.keys(cleaned).length > 0) {
      payload.moreDetails = cleaned;
    }
  }

  if (data.compensation?.enablePayroll) {
    const { enablePayroll: _enablePayroll, ...rest } = data.compensation;
    const cleaned = stripNulls(rest);
    if (Object.keys(cleaned).length > 0) {
      payload.compensation = cleaned;
    }
  }

  return payload;
}
