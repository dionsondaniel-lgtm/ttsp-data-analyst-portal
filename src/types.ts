export type Cohort = '1ST' | '2ND' | '3RD' | '4TH';
export type Module = 'SQL' | 'XLS' | 'PBI' | 'PYTHON';

export interface Learner {
  id: string;
  name: string;
  company?: string;
  designation?: string;
  cohort_no: string;
  email_add?: string;
}

export interface AttendanceRecord {
  id: string;
  learner_name: string;
  cohort_no: string;
  module: string;
  [key: string]: any; // Allows l1_sum, l2_sum, etc.
}

export interface PracticeRecord {
  id: string;
  learner_name: string;
  lesson_no: number;
  score: number | null;
  total_score: number;
  date_submitted?: string;
}

export interface StudentStat {
  name: string;
  attendanceRate: number;
  projectScore: number;
  submissionRate: number;
  avgLatenessDays: number;
  isAtRisk: boolean;
  cohort: string;
}