export type PenaltyType =
  | 'no_attendance'
  | 'late_arrival'
  | 'work_hours_shortage'
  | 'missing_swipes';

export type DeductionMethod = 'loss_of_pay' | 'paid_leave';

export type ThresholdType = 'instance_based' | 'percentage_based';

export type PenalizationRecordStatus = 'pending' | 'applied' | 'waived';

export interface PenalizationRule {
  id: string;
  versionId: string;
  penaltyType: PenaltyType;
  isEnabled: boolean;
  deductionPerIncident: number;
  thresholdType: ThresholdType | null;
  thresholdValue: number | null;
  thresholdUnit: string | null;
  minInstancesBeforePenalty: number | null;
  effectiveHoursPercentage: number | null;
}

export interface PenalizationPolicyVersion {
  id: string;
  policyId: string;
  versionNumber: number;
  effectiveFrom: string;
  deductionMethod: DeductionMethod;
  bufferPeriodDays: number;
  isActive: boolean;
  rules?: PenalizationRule[];
  createdAt: string;
}

export interface PenalizationPolicy {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  currentVersion?: PenalizationPolicyVersion;
  versions?: PenalizationPolicyVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface PenalizationPolicyAssignment {
  id: string;
  policyId: string;
  userId: string;
  isActive: boolean;
  assignedAt: string;
  unassignedAt: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  policy?: PenalizationPolicy;
  updatedAt: string;
}

export interface PenalizationRecord {
  id: string;
  userId: string;
  policyVersionId: string;
  ruleId: string;
  incidentDate: string;
  penaltyDate: string;
  penaltyType: PenaltyType;
  deductionDays: number;
  deductionMethod: DeductionMethod;
  status: PenalizationRecordStatus;
  attendanceId: string | null;
  remarks: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  policyVersion?: PenalizationPolicyVersion;
  rule?: PenalizationRule;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePenalizationRuleDto {
  penaltyType: PenaltyType;
  isEnabled: boolean;
  deductionPerIncident: number;
  thresholdType?: ThresholdType;
  thresholdValue?: number;
  thresholdUnit?: string;
  minInstancesBeforePenalty?: number;
  effectiveHoursPercentage?: number;
}

export interface CreatePenalizationPolicyDto {
  name: string;
  description?: string;
  effectiveFrom: string;
  deductionMethod: DeductionMethod;
  bufferPeriodDays?: number;
  rules: CreatePenalizationRuleDto[];
}

export interface UpdatePenalizationPolicyDto {
  name?: string;
  description?: string;
  effectiveFrom?: string;
  deductionMethod?: DeductionMethod;
  bufferPeriodDays?: number;
  rules?: CreatePenalizationRuleDto[];
}

export interface AssignPenalizationPolicyDto {
  userIds: string[];
}

export interface PenalizationRecordsResponse {
  records: PenalizationRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
