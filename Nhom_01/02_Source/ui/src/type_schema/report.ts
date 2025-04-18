export interface WeeklyReportEntry {
  id: number;
  project_id: number;
  user_id: number;
  duration: number;
  date: string;
  description?: string;
  activity_id?: number;
  task_id?: number;
}

export interface ProjectReportData {
  id: number;
  customer_id: number;
  customer_name: string;
  name: string;
  hourly_quota: number;
  budget: number;
  spent: number;
  time_spent: number;
  last_entry: string;
  this_month: number;
  total: number;
  not_exported: number;
  not_billed: number;
  budget_used_percentage: number;
  color: string;
}

export interface UserReportData {
  id: number;
  name: string;
  email?: string;
  role: string;
}

export interface CustomerReportData {
  id: number;
  name: string;
  address?: string;
  contact?: string;
}

export interface WeekDay {
  date: Date;
  dayNumber: number;
  dayName: string;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: number;
  projectId?: number;
  customerId?: number;
  activityId?: number;
  taskId?: number;
}

// API response types for reports
export interface WeeklyUserReportResponse {
  entries: WeeklyReportEntry[];
  projects: {
    id: number;
    name: string;
    color: string;
  }[];
  user: {
    id: number;
    name: string;
  };
  week: {
    number: number;
    year: number;
    start: string;
    end: string;
  };
  totals: {
    duration: number;
    byDay: Record<string, number>;
    byProject: Record<number, number>;
  };
}

export interface ProjectOverviewResponse {
  projects: ProjectReportData[];
  customers: CustomerReportData[];
}

export interface WeeklyAllUsersReportResponse {
  entries: WeeklyReportEntry[];
  users: UserReportData[];
  projects: {
    id: number;
    name: string;
    color: string;
  }[];
  week: {
    number: number;
    year: number;
    start: string;
    end: string;
  };
  totals: {
    duration: number;
    byDay: Record<string, number>;
    byUser: Record<number, number>;
  };
}
