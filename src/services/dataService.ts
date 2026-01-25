import { supabase } from '../lib/supabase';
import type { Cohort, Module } from '../types';

export const dataService = {
  async fetchDashboardData(cohort: Cohort, module: Module) {
    const { data: learners } = await supabase.from('learners').select('*').eq('cohort_no', cohort);
    const { data: attendance } = await supabase.from('attendance').select('*').eq('cohort_no', cohort).eq('module', module);
    const { data: practices } = await supabase.from('practices').select('*');
    return { learners: learners || [], attendance: attendance || [], practice: practices || [], isLive: true };
  },

  async getTable(tableName: string) {
    const { data, error } = await supabase.from(tableName).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getLearnerNames(): Promise<string[]> {
    const { data } = await supabase.from('learners').select('name');
    return data?.map(l => l.name) || [];
  },

  async upsertRow(tableName: string, payload: any) {
    const { data, error } = await supabase.from(tableName).upsert(payload).select();
    if (error) throw error;
    return data;
  },

  async bulkDelete(tableName: string, ids: string[]) {
    const { error } = await supabase.from(tableName).delete().in('id', ids);
    if (error) throw error;
  },

  async bulkUpload(tableName: string, data: any[]) {
    const { error } = await supabase.from(tableName).insert(data);
    if (error) throw error;
  }
};