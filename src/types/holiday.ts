export interface HolidayPlan {
  id: string;
  name: string;
  year: number;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  employeeCount: number;
  holidayCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  holidayListId?: string;
  name: string;
  date: string;
  isOptional: boolean;
  isSpecial: boolean;
  createdAt?: string;
}

export interface HolidayPlanDetail extends HolidayPlan {
  holidays: Holiday[];
}

export interface PublicHolidayCountry {
  countryCode: string;
  name: string;
}

export interface PublicHoliday {
  name: string;
  localName: string;
  date: string;
  isOptional: boolean;
  isSpecial: boolean;
  types: string[];
  isGlobal: boolean;
}

export interface CreateHolidayPlanPayload {
  name: string;
  year: number;
  description?: string;
  isDefault?: boolean;
}

export interface UpdateHolidayPlanPayload {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

export interface AddHolidayPayload {
  name: string;
  date: string;
  isOptional?: boolean;
  isSpecial?: boolean;
}

export interface UpdateHolidayPayload {
  name?: string;
  date?: string;
  isOptional?: boolean;
  isSpecial?: boolean;
}

export interface ImportHolidaysPayload {
  countryCode: string;
  year: number;
  selectedHolidays?: Array<{ name: string; date: string }>;
}

export interface BulkImportResult {
  added: number;
  skipped: number;
  holidays: Holiday[];
}

export interface AssignedEmployee {
  id: string;
  userId: string;
  employeeNumber: string;
  displayName: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AssignResult {
  assigned: number;
}

export interface UnassignResult {
  unassigned: number;
}

export interface MyHolidayPlan {
  id: string;
  name: string;
  year: number;
  description: string | null;
  holidayCount: number;
}

export interface HolidayCalendarResponse {
  year: number;
  totalHolidays: number;
  months: Record<string, Holiday[]>;
}
