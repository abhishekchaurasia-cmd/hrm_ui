export type YearEndAction =
  | 'reset_to_zero'
  | 'carry_forward_all'
  | 'carry_forward_limited'
  | 'none';

export type LeaveTransactionType =
  | 'allocation'
  | 'deduction'
  | 'carry_forward'
  | 'encashment'
  | 'reversal'
  | 'adjustment';

export interface LeaveTypeConfig {
  id: string;
  leavePlanId: string;
  name: string;
  code: string;
  quota: number;
  isUnlimited: boolean;
  isPaid: boolean;
  yearEndAction: YearEndAction;
  maxCarryForward: number | null;
  carryForwardExpiryDays: number | null;
  isEncashable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeavePlan {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  description: string | null;
  isActive: boolean;
  leaveTypeConfigs?: LeaveTypeConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeavePlanDto {
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface CreateLeaveTypeConfigDto {
  name: string;
  code: string;
  quota: number;
  isUnlimited?: boolean;
  isPaid?: boolean;
  yearEndAction?: YearEndAction;
  maxCarryForward?: number | null;
  carryForwardExpiryDays?: number | null;
  isEncashable?: boolean;
}

export interface LeavePlanAssignment {
  id: string;
  userId: string;
  leavePlanId: string;
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
  leavePlan?: LeavePlan;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeavePlanAssignmentDto {
  userId: string;
  leavePlanId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeConfigId: string;
  year: number;
  allocated: number;
  used: number;
  carriedForward: number;
  adjusted: number;
  balance: number;
  leaveTypeConfig?: LeaveTypeConfig & {
    leavePlan?: { id: string; name: string };
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdjustLeaveBalanceDto {
  leaveBalanceId: string;
  days: number;
  remarks?: string;
}

export interface LeaveTransaction {
  id: string;
  userId: string;
  leaveBalanceId: string;
  leaveId: string | null;
  transactionType: LeaveTransactionType;
  days: number;
  previousBalance: number;
  newBalance: number;
  remarks: string | null;
  performedBy: string;
  createdAt: string;
}

export interface YearEndProcessingDto {
  processingYear: number;
  newYear: number;
}
