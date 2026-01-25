// Use "import type" to satisfy verbatimModuleSyntax
import type { Module, Cohort } from './types';

/**
 * Configuration for each module based on the Module type.
 * Keys must match: 'SQL' | 'XLS' | 'PBI' | 'PYTHON'
 */
export const MODULE_CONFIG: Record<Module, { lessons: number; hasProject: boolean }> = {
  SQL: { 
    lessons: 19, 
    hasProject: true 
  },
  XLS: { 
    lessons: 5, 
    hasProject: true 
  },
  PBI: { 
    lessons: 5, 
    hasProject: true 
  },
  PYTHON: { 
    lessons: 10, 
    hasProject: true 
  },
};

/**
 * Available cohorts for filtering.
 * Keys must match: '1ST' | '2ND' | '3RD' | '4TH'
 */
export const COHORT_OPTIONS: Cohort[] = ['1ST', '2ND', '3RD', '4TH'];

// This is no longer needed as we fetch real data from Supabase
export const MOCK_STUDENT_NAMES = [];