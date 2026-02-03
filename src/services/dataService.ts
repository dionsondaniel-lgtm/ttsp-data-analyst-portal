import { supabase } from '../lib/supabase';
import type { Cohort, Module } from '../types';

export const dataService = {
  /**
   * Fetches all data required for the Dashboard visuals.
   * Filters attendance and practices by the selected cohort and module.
   */
  async fetchDashboardData(cohort: Cohort, module: Module) {
    // 1. Fetch learners belonging to the selected cohort
    const { data: learners, error: lErr } = await supabase
      .from('learners')
      .select('*')
      .eq('cohort_no', cohort);

    // 2. Fetch attendance records for the selected cohort and module
    const { data: attendance, error: aErr } = await supabase
      .from('attendance')
      .select('*')
      .eq('cohort_no', cohort)
      .eq('module', module);

    // 3. Fetch practice/grades for the selected cohort and module
    // Added .eq filters here to ensure grades match the dashboard selection
    const { data: practices, error: pErr } = await supabase
      .from('practices')
      .select('*')
      .eq('cohort_no', cohort)
      .eq('module', module);

    if (lErr || aErr || pErr) {
      console.error("Dashboard Fetch Error:", { lErr, aErr, pErr });
    }

    return { 
      learners: learners || [], 
      attendance: attendance || [], 
      practice: practices || [], // Key matches Dashboard.tsx usage
      isLive: true 
    };
  },

  /**
   * Generic fetcher for the Raw Data Explorer
   */
  async getTable(tableName: string) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Helper for validation during XLSX imports
   */
  async getLearnerNames(): Promise<string[]> {
    const { data } = await supabase.from('learners').select('name');
    return data?.map(l => l.name) || [];
  },

  /**
   * Handles both "Add New" and "Edit" functionality via Postgres Upsert
   */
  async upsertRow(tableName: string, payload: any) {
    // Clean payload of system-generated fields if they are null/empty for new records
    if (!payload.id) delete payload.id;
    
    const { data, error } = await supabase
      .from(tableName)
      .upsert(payload)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Handles bulk deletion from the Raw Data Explorer
   */
  async bulkDelete(tableName: string, ids: string[]) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .in('id', ids);

    if (error) throw error;
  },

  /**
   * Handles bulk insertion from XLSX file uploads
   */
  async bulkUpload(tableName: string, data: any[]) {
    const { error } = await supabase
      .from(tableName)
      .insert(data);

    if (error) throw error;
  }
};