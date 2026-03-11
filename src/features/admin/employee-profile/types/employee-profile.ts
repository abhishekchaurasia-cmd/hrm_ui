export type Gender = 'male' | 'female' | 'other';
export type TimeType = 'full_time' | 'part_time' | 'contract';
export type WorkerType = 'permanent' | 'contract' | 'intern' | 'consultant';

export interface ProfileRelation {
  id: string;
  name: string;
}

export interface ProfileManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProfileCompensationBreakup {
  id: string;
  salaryComponent: { id: string; name: string; code: string };
  annualAmount: number;
  monthlyAmount: number;
}

export interface ProfileCompensation {
  id: string;
  annualSalary: number;
  currency: string;
  salaryEffectiveFrom: string;
  regularSalary: number;
  bonus: number | null;
  isEsiEligible: boolean;
  taxRegime: string | null;
  breakups: ProfileCompensationBreakup[];
}

export interface ProfileShiftWeeklyOff {
  dayOfWeek: number;
}

export interface ProfileShift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  workHoursPerDay: number;
  graceMinutes: number;
  weeklyOffs: ProfileShiftWeeklyOff[];
}

export interface ProfileShiftAssignment {
  id: string;
  shiftId: string;
  effectiveFrom: string;
  shift: ProfileShift;
}

export interface ProfileLeavePlan {
  id: string;
  name: string;
  year: number;
}

export interface ProfileLeavePlanAssignment {
  id: string;
  leavePlanId: string;
  effectiveFrom: string;
  leavePlan: ProfileLeavePlan;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  displayName: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  nationality: string | null;
  workCountry: string | null;
  mobileNumber: string | null;
  employeeNumber: string | null;
  numberSeries: string | null;
  attendanceNumber: string | null;
  joiningDate: string | null;
  jobTitle: string | null;
  secondaryJobTitle: string | null;
  timeType: TimeType;
  workerType: WorkerType | null;
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
  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: ProfileRelation;
  };
  reportingManager?: ProfileManager | null;
  dottedLineManager?: ProfileManager | null;
  legalEntity?: ProfileRelation | null;
  businessUnit?: ProfileRelation | null;
  location?: ProfileRelation | null;
  holidayList?: ProfileRelation | null;
  compensation?: ProfileCompensation | null;
  shiftAssignment?: ProfileShiftAssignment | null;
  leavePlanAssignment?: ProfileLeavePlanAssignment | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OptionItem {
  value: string;
  label: string;
}
