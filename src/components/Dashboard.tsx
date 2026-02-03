import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, CheckCircle, AlertTriangle, TrendingUp, 
  Globe, BarChart3, Activity, Layout, Calendar, 
  FileCheck, UserCheck
} from 'lucide-react';
import StatCard from './StatCard';
import { 
  AttendanceTrendsChart, 
  GradesDistributionChart, 
  SubmissionRateChart 
} from './Charts';
import { dataService } from '../services/dataService';
import { MODULE_CONFIG } from '../constants';
import type { Cohort, Module, StudentStat } from '../types';
import { DashboardSkeleton } from './Skeleton';
import RawDataExplorer from './RawDataExplorer';

interface DashboardProps {
  activeTab: string;
}

const COHORTS: Cohort[] = ['1ST', '2ND', '3RD', '4TH'];
const MODULES: Module[] = ['SQL', 'XLS', 'PBI', 'PYTHON'];

const Dashboard: React.FC<DashboardProps> = ({ activeTab }) => {
  const [selectedCohort, setSelectedCohort] = useState<Cohort>('1ST');
  const [selectedModule, setSelectedModule] = useState<Module>('SQL');
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any>({ learners: [], attendance: [], practice: [] });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dataService.fetchDashboardData(selectedCohort, selectedModule);
        setRawData(res);
      } catch (err) { console.error("Fetch Error:", err); }
      setLoading(false);
    };
    load();
  }, [selectedCohort, selectedModule]);

  // --- 1. AGGREGATE STUDENT STATS ---
  const studentStats: StudentStat[] = useMemo(() => {
    const config = MODULE_CONFIG[selectedModule];
    const totalLessons = config.lessons;

    return rawData.learners.map((learner: any) => {
      // Attendance Calculation
      const attRecord = rawData.attendance.find((a: any) => a.learner_name === learner.name);
      let attended = 0;
      if (attRecord) {
        for (let i = 1; i <= totalLessons; i++) {
          if (attRecord[`l${i}_sum`] >= 1) attended++;
        }
      }

      // Practice/Submission Calculation
      const studentPractices = rawData.practice.filter((p: any) => p.learner_name === learner.name);
      const avgScore = studentPractices.length > 0 
        ? studentPractices.reduce((s: number, p: any) => s + (p.score || 0), 0) / studentPractices.length 
        : 0;

      return {
        name: learner.name,
        attendanceRate: Math.round((attended / totalLessons) * 100) || 0,
        submissionRate: Math.round((studentPractices.filter((p: any) => p.date_submitted).length / 5) * 100) || 0,
        projectScore: Math.round(avgScore),
        isAtRisk: attended < (totalLessons * 0.7), // Flag if attendance < 70%
        cohort: learner.cohort_no,
        avgLatenessDays: 0
      };
    });
  }, [rawData, selectedModule]);

  // --- 2. PREPARE CHART DATA ---
  const attendanceTimeline = useMemo(() => {
    const config = MODULE_CONFIG[selectedModule];
    return Array.from({ length: config.lessons }, (_, i) => {
      const lessonKey = `l${i + 1}_sum`;
      const count = rawData.attendance.reduce((sum: number, rec: any) => 
        sum + (rec[lessonKey] >= 1 ? 1 : 0), 0
      );
      return { lesson: `L${i + 1}`, attendance: count };
    });
  }, [rawData, selectedModule]);

  const submissionStats = useMemo(() => {
    const practices = rawData.practice;
    const stats = { onTime: 0, late: 0, missed: 0 };

    practices.forEach((p: any) => {
      if (!p.date_submitted) {
        stats.missed++;
      } else {
        const due = new Date(p.date_required);
        const sub = new Date(p.date_submitted);
        if (sub <= due) stats.onTime++;
        else stats.late++;
      }
    });

    return [{ type: selectedModule, ...stats }];
  }, [rawData, selectedModule]);

  const gradeDistribution = useMemo(() => {
    return [
      { range: '90-100', count: studentStats.filter(s => s.projectScore >= 90).length },
      { range: '80-89', count: studentStats.filter(s => s.projectScore >= 80 && s.projectScore < 90).length },
      { range: '70-79', count: studentStats.filter(s => s.projectScore >= 70 && s.projectScore < 80).length },
      { range: '<70', count: studentStats.filter(s => s.projectScore > 0 && s.projectScore < 70).length },
    ];
  }, [studentStats]);

  const globalStats = {
    attendance: Math.round(studentStats.reduce((a, b) => a + b.attendanceRate, 0) / studentStats.length || 0),
    submission: Math.round(studentStats.reduce((a, b) => a + b.submissionRate, 0) / studentStats.length || 0),
    avgScore: Math.round(studentStats.reduce((a, b) => a + b.projectScore, 0) / studentStats.length || 0),
    flagged: studentStats.filter(s => s.isAtRisk).length
  };

  if (activeTab === 'explorer') return <div className="p-8"><RawDataExplorer /></div>;
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">Analyst Portal</h1>
          <div className="flex items-center gap-2 text-slate-500 mt-3 font-black uppercase text-[10px] tracking-[0.2em]">
            <Globe size={14} className="text-blue-500" />
            <span>{selectedCohort} COHORT • {selectedModule} MODULE • LIVE DATA</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <select value={selectedCohort} onChange={(e) => setSelectedCohort(e.target.value as Cohort)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer">
            {COHORTS.map(c => <option key={c} value={c}>Cohort {c}</option>)}
          </select>
          <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value as Module)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer">
            {MODULES.map(m => <option key={m} value={m}>{m} Module</option>)}
          </select>
        </div>
      </header>

      {/* Top Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Attendance" value={`${globalStats.attendance}%`} icon={<Users/>} colorClass="text-blue-600" />
        <StatCard title="Submission" value={`${globalStats.submission}%`} icon={<CheckCircle/>} colorClass="text-emerald-600" />
        <StatCard title="Avg Score" value={`${globalStats.avgScore}%`} icon={<TrendingUp/>} colorClass="text-purple-600" />
        <StatCard title="Flagged" value={globalStats.flagged} icon={<AlertTriangle/>} colorClass="text-red-600" trend="At Risk" trendUp={false} />
      </div>

      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-8 rounded-[2rem]">
              <h3 className="mb-8 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 text-slate-900 dark:text-white">
                <Activity size={18} className="text-blue-500" /> Engagement Trends
              </h3>
              <AttendanceTrendsChart data={attendanceTimeline} />
            </div>
            <div className="glass-panel p-8 rounded-[2rem]">
              <h3 className="mb-8 font-black text-[11px] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4 text-slate-900 dark:text-white">
                <BarChart3 size={18} className="text-purple-500" /> Grade Distribution
              </h3>
              <GradesDistributionChart data={gradeDistribution} />
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-8 rounded-[2rem]">
              <h3 className="mb-6 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
                <Calendar size={18} className="text-blue-500" /> Attendance Timeline
              </h3>
              <AttendanceTrendsChart data={attendanceTimeline} />
            </div>
            <div className="glass-panel p-8 rounded-[2rem] flex flex-col justify-center items-center text-center">
              <UserCheck size={48} className="text-blue-600 mb-4 opacity-20" />
              <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                {rawData.learners.length}
              </span>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">Enrolled Learners</p>
              <div className="mt-8 w-full space-y-3">
                 <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-slate-500">Avg Presence</span>
                    <span className="text-blue-600">{globalStats.attendance}%</span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${globalStats.attendance}%` }} />
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-[2rem]">
              <h3 className="mb-6 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
                <FileCheck size={18} className="text-emerald-500" /> Submission Reliability
              </h3>
              <SubmissionRateChart data={submissionStats} />
            </div>
            <div className="glass-panel p-8 rounded-[2rem]">
              <h3 className="mb-6 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
                <BarChart3 size={18} className="text-purple-500" /> Grade Distribution
              </h3>
              <GradesDistributionChart data={gradeDistribution} />
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
           <div className="glass-panel p-8 rounded-[2rem]">
              <div className="flex items-center justify-between mb-10 border-b border-slate-100 dark:border-slate-800 pb-6">
                <h3 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter text-slate-900 dark:text-white">
                  <Layout className="text-indigo-500" /> Project Gradebook
                </h3>
                <div className="text-[10px] font-black uppercase text-slate-400">
                  {rawData.practice.length} total submissions
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {studentStats.sort((a,b) => b.projectScore - a.projectScore).map((s, i) => (
                   <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-tight">{s.name}</p>
                        {s.isAtRisk && <AlertTriangle size={14} className="text-red-500" />}
                      </div>
                      <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{s.projectScore}%</h4>
                      <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                         <div 
                          className={`h-full ${s.projectScore >= 80 ? 'bg-emerald-500' : s.projectScore >= 70 ? 'bg-blue-500' : 'bg-red-500'}`} 
                          style={{ width: `${s.projectScore}%` }} 
                        />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;