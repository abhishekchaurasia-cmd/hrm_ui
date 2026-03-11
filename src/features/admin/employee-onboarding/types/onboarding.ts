export type Gender = 'male' | 'female' | 'other';
export type TimeType = 'full_time' | 'part_time' | 'contract';
export type WorkerType = 'permanent' | 'contract' | 'intern' | 'consultant';
export type TaxRegime = 'old_regime' | 'new_regime';

export interface BasicDetailsPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  middleName?: string | null;
  displayName?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  workCountry?: string | null;
  employeeNumber?: string | null;
  numberSeries?: string | null;
  mobileNumber?: string | null;
}

export interface JobDetailsPayload {
  joiningDate?: string | null;
  jobTitle?: string | null;
  timeType?: TimeType | null;
  workerType?: WorkerType | null;
  departmentId?: string | null;
  legalEntityId?: string | null;
  businessUnitId?: string | null;
  locationId?: string | null;
  reportingManagerId?: string | null;
  probationPolicyMonths?: number | null;
  noticePeriodDays?: number | null;
}

export interface WorkDetailsPayload {
  inviteToLogin?: boolean | null;
  enableOnboardingFlow?: boolean | null;
  leavePlanId?: string | null;
  holidayListId?: string | null;
  shiftId?: string | null;
  attendanceNumber?: string | null;
}

export interface SalaryBreakupItem {
  salaryComponentId: string;
  annualAmount: number;
}

export interface CompensationPayload {
  annualSalary: number;
  currency?: string;
  salaryEffectiveFrom: string;
  regularSalary: number;
  bonus?: number | null;
  isEsiEligible?: boolean | null;
  taxRegime?: TaxRegime | null;
  breakup?: SalaryBreakupItem[];
}

export interface OnboardEmployeePayload {
  basicDetails: BasicDetailsPayload;
  jobDetails?: JobDetailsPayload;
  moreDetails?: WorkDetailsPayload;
  compensation?: CompensationPayload;
}

export interface OnboardEmployeeResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    profile: {
      id: string;
      employeeNumber: string;
    };
    shiftAssignment?: {
      id: string;
      shiftId: string;
    };
    leavePlanAssignment?: {
      id: string;
      leavePlanId: string;
    };
    compensation?: {
      id: string;
      annualSalary: number;
    };
  };
}

export interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  componentType: 'earning' | 'deduction';
  calculationType: 'fixed' | 'percentage_of_basic' | 'percentage_of_gross';
  defaultPercentage: number | null;
  isMandatory: boolean;
}

export interface OptionItem {
  value: string;
  label: string;
}
