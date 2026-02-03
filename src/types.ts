export type Cohort = '1ST' | '2ND' | '3RD' | '4TH';
export type Module = 'SQL' | 'XLS' | 'PBI' | 'PYTHON';

export interface StudentStat {
  name: string;
  attendanceRate: number;
  projectScore: number;
  submissionRate: number;
  avgLatenessDays: number;
  isAtRisk: boolean;
  cohort: string;
}

export interface Learner {
  id: string;
  name: string;
  company?: string;
  designation?: string;
  cohort_no: Cohort;
  email_add?: string;
  cellphone_no?: string;
}

export interface AttendanceRecord {
  id: string;
  learner_name: string;
  cohort_no: Cohort;
  module: Module;
  [key: string]: any; // Handles l1_sum through l19_sum
}

export interface PracticeRecord {
  id: string;
  learner_name: string;
  cohort_no: Cohort;
  module: Module;
  lesson_no: number;
  score: number | null;
  total_score: number;
}