export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent';

export interface TodayAttendance {
  workDate: string;
  punchInAt: string | null;
  punchOutAt: string | null;
  totalMinutes: number | null;
  status: AttendanceStatus | null;
  shiftId: string | null;
}

export interface AttendanceShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  workHoursPerDay: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  shiftId: string | null;
  shift: AttendanceShift | null;
  workDate: string;
  punchInAt: string | null;
  punchOutAt: string | null;
  totalMinutes: number | null;
  status: AttendanceStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceHistoryResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AttendanceSummary {
  month: number;
  year: number;
  totalDays: number;
  present: number;
  late: number;
  halfDay: number;
  absent: number;
  totalWorkedMinutes: number;
  expectedMinutesPerDay: number;
  averageWorkedMinutes: number;
}
