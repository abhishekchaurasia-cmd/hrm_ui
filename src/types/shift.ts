export interface ShiftWeeklyOff {
  id: string;
  shiftId: string;
  dayOfWeek: number;
  isFullDay: boolean;
  createdAt: string;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes: number;
  workHoursPerDay: number;
  isFlexible: boolean;
  graceMinutes: number;
  isDefault: boolean;
  isActive: boolean;
  weeklyOffs: ShiftWeeklyOff[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftDto {
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes?: number;
  workHoursPerDay: number;
  isFlexible?: boolean;
  graceMinutes?: number;
  isDefault?: boolean;
}

export interface SetWeeklyOffsDto {
  weeklyOffs: { dayOfWeek: number; isFullDay: boolean }[];
}

export interface ShiftAssignment {
  id: string;
  userId: string;
  shiftId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  assignedBy: string;
  isActive: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  shift?: Shift;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftAssignmentDto {
  userId: string;
  shiftId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
}
