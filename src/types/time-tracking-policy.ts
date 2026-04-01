export interface WebClockInSettings {
  enabled: boolean;
  commentMandatory: boolean;
  ipRestrictionEnabled: boolean;
  allowedIPs: string[];
}

export interface RemoteClockInSettings {
  enabled: boolean;
  capturesLocation: boolean;
  ipRestrictionEnabled: boolean;
  allowedIPs: string[];
}

export interface MobileClockInSettings {
  enabled: boolean;
}

export interface CaptureSettings {
  biometricEnabled: boolean;
  webClockIn: WebClockInSettings;
  remoteClockIn: RemoteClockInSettings;
  mobileClockIn: MobileClockInSettings;
}

export interface PartialDaySubSetting {
  enabled: boolean;
  maxMinutes: number;
}

export interface PartialDaySettings {
  enabled: boolean;
  limitUnit: 'minutes' | 'hours';
  limitValue: number;
  limitPeriod: 'day' | 'week' | 'month';
  lateArrival: PartialDaySubSetting;
  earlyLeaving: PartialDaySubSetting;
  interveningTimeOff: PartialDaySubSetting;
  requestsAllowed: number;
  requestsPeriod: 'monthly' | 'weekly';
  approvalRequired: boolean;
  commentMandatory: boolean;
  advanceDaysLimit: number;
  allowPastDated: boolean;
}

export interface AdjustmentSettings {
  enabled: boolean;
  adjustmentEntries: number;
  adjustmentPeriod: 'week' | 'month';
  pastDaysLimit: number;
  lastDateOfMonth: number;
}

export interface RegularizationSettings {
  enabled: boolean;
  entries: number;
  period: 'week' | 'month';
  pastDaysLimit: number;
  lastDateOfMonth: number;
  reasonRequired: boolean;
}

export interface ApprovalLevel {
  level: number;
  assigneeType: 'reporting_manager' | 'hr' | 'custom';
}

export interface ApprovalSettings {
  enabled: boolean;
  thresholdCount: number;
  thresholdPeriod: 'all' | 'month';
  levels: ApprovalLevel[];
  autoApproveIfMissing: boolean;
  skipApprovalForEveryRequest: boolean;
}

export interface TimeTrackingPolicy {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  captureSettings: CaptureSettings;
  wfhAllowed: boolean;
  wfhApprovalRequired: boolean;
  onDutyAllowed: boolean;
  partialDaySettings: PartialDaySettings;
  adjustmentSettings: AdjustmentSettings;
  regularizationSettings: RegularizationSettings;
  approvalSettings: ApprovalSettings;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeTrackingPolicyAssignment {
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
  updatedAt: string;
}

export interface CreateTimeTrackingPolicyDto {
  name: string;
  description?: string;
  isDefault?: boolean;
  captureSettings?: CaptureSettings;
  wfhAllowed?: boolean;
  wfhApprovalRequired?: boolean;
  onDutyAllowed?: boolean;
  partialDaySettings?: PartialDaySettings;
  adjustmentSettings?: AdjustmentSettings;
  regularizationSettings?: RegularizationSettings;
  approvalSettings?: ApprovalSettings;
}

export interface UpdateTimeTrackingPolicyDto {
  name?: string;
  description?: string;
  isDefault?: boolean;
  captureSettings?: CaptureSettings;
  wfhAllowed?: boolean;
  wfhApprovalRequired?: boolean;
  onDutyAllowed?: boolean;
  partialDaySettings?: PartialDaySettings;
  adjustmentSettings?: AdjustmentSettings;
  regularizationSettings?: RegularizationSettings;
  approvalSettings?: ApprovalSettings;
}

export interface AssignTimeTrackingPolicyDto {
  userIds: string[];
}
