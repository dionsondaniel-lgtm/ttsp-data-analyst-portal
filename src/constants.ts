import { Module } from './types';

export const MODULE_CONFIG = {
  [Module.SQL]: { lessons: 19, hasProject: true },
  [Module.EXCEL]: { lessons: 5, hasProject: true },
  [Module.POWERBI]: { lessons: 5, hasProject: true },
  [Module.PYTHON]: { lessons: 10, hasProject: true },
};

// Must match the "COHORT_NO" values in your JSON exactly
export const COHORT_OPTIONS = ['1ST', '2ND', '3RD', '4TH'];

export const MOCK_STUDENT_NAMES = []; // No longer needed