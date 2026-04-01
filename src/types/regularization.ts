export type RegularizationRequestType =
  | 'missed_punch_in'
  | 'missed_punch_out'
  | 'incorrect_time'
  | 'forgot_to_punch'
  | 'other';

export type RegularizationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface RegularizationRequest {
  id: string;
  userId: string;
  attendanceId: string | null;
  requestDate: string;
  originalPunchIn: string | null;
  originalPunchOut: string | null;
  requestedPunchIn: string;
  requestedPunchOut: string;
  reason: string | null;
  requestType: RegularizationRequestType;
  status: RegularizationStatus;
  reviewedBy: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegularizationPayload {
  requestDate: string;
  requestedPunchIn: string;
  requestedPunchOut: string;
  requestType: RegularizationRequestType;
  reason?: string;
}

export interface RemainingEntriesInfo {
  enabled: boolean;
  remaining: number;
  total: number;
  period: 'week' | 'month';
  used: number;
  pastDaysLimit?: number;
  lastDateOfMonth?: number;
  reasonRequired?: boolean;
}

export const REQUEST_TYPE_LABELS: Record<RegularizationRequestType, string> = {
  missed_punch_in: 'Missed Punch In',
  missed_punch_out: 'Missed Punch Out',
  incorrect_time: 'Incorrect Time',
  forgot_to_punch: 'Forgot to Punch',
  other: 'Other',
};

export const STATUS_LABELS: Record<RegularizationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};
