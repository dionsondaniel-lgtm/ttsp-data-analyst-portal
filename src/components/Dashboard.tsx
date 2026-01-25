import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Globe, 
  BarChart3, 
  Activity, 
  ChevronDown,
  Layout
} from 'lucide-react';
import StatCard from './StatCard';
import { AttendanceTrendsChart, GradesDistributionChart, SubmissionRateChart } from './Charts';
import { dataService } from '../services/dataService';
import type { Cohort, Module, StudentStat } from '../types';
import { DashboardSkeleton } from './Skeleton';
import RawDataExplorer from './RawDataExplorer';

const COHORTS: Cohort[] = ['1ST', '2ND', '3RD', '4TH'];
const MODULES: Module[] = ['SQL', 'XLS', 'PBI', 'PYTHON'];

interface DashboardProps {
  activeTab: string;
  theme: 'light' | 'dark'; // Add this line
}

const AnimatedDropdown = ({ 
  value, 
  options, 
  onChange, 
  label 
}: { 
  value: string, 
  options: string[], 
  onChange: (val: any) => void, 
  label: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-slate-200 shadow-md hover:border-blue-600 transition-all min-w-[150px] justify-between uppercase tracking-tight"
      >
        <span>
            <span className="text-slate-700 dark:text-slate-400 mr-1 font-bold">{label}:</span> 
            <span className="text-slate-950 dark:text-white">{value}</span>
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown size={14} className="text-slate-600 dark:text-slate-400" /></motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-full z-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
              {options.map((opt) => (
                <button 
                  key={opt} 
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase transition-colors ${
                    value === opt 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-950 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ activeTab }) => {
  const [selectedCohort, setSelectedCohort] = useState<Cohort>('1ST');
  const [selectedModule, setSelectedModule] = useState<Module>('SQL');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ learners: [], attendance: [], practice: [] });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dataService.fetchDashboardData(selectedCohort, selectedModule);
        setData(res);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [selectedCohort, selectedModule]);

  const studentStats: StudentStat[] = useMemo(() => {
    if (!data.learners.length) return [];
    return data.learners.map((l: any) => {
      const att = data.attendance.find((a: any) => a.learner_name === l.name);
      let present = 0;
      if (att) Object.keys(att).forEach(k => { if (k.includes('_sum') && att[k] >= 1) present++; });
      const practices = data.practice.filter((p: any) => p.learner_name === l.name);
      return {
        name: l.name,
        attendanceRate: Math.round((present / 19) * 100),
        submissionRate: Math.round((practices.filter((p: any) => p.score !== null).length / 5) * 100),
        projectScore: Math.round(practices.length > 0 ? practices.reduce((a: any, b: any) => a + (b.score || 0), 0) / practices.length : 0),
        isAtRisk: present < 14,
        cohort: l.cohort_no,
        avgLatenessDays: 0 
      };
    });
  }, [data]);

  const stats = {
    attendance: Math.round(studentStats.reduce((a,b)=>a+b.attendanceRate,0)/studentStats.length || 0),
    submission: Math.round(studentStats.reduce((a,b)=>a+b.submissionRate,0)/studentStats.length || 0),
    project: Math.round(studentStats.reduce((a,b)=>a+b.projectScore,0)/studentStats.length || 0),
    flagged: studentStats.filter(s=>s.isAtRisk).length
  };

  if (activeTab === 'explorer') return <div className="p-8 h-screen"><RawDataExplorer /></div>;
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20 max-w-[1600px] mx-auto transition-colors duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          {/* Elegant Gradient Title */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-300">
            Analyst Portal
          </h1>
          
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-400 mt-3 font-black uppercase text-[10px] tracking-[0.25em]">
            <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-500/20">
              <Globe size={14} className="text-blue-700 dark:text-blue-400" />
            </div>
            <span className="opacity-80">{selectedCohort} COHORT / {selectedModule} MODULE / REAL-TIME DATA</span>
          </div>
        </motion.div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <AnimatedDropdown label="Cohort" value={selectedCohort} options={COHORTS} onChange={(val) => setSelectedCohort(val)} />
          <AnimatedDropdown label="Module" value={selectedModule} options={MODULES} onChange={(val) => setSelectedModule(val)} />
        </div>
      </header>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Attendance" value={`${stats.attendance}%`} trend="+2.4%" trendUp={true} icon={<Users/>} colorClass="text-blue-900 dark:text-blue-400" />
        <StatCard title="Submissions" value={`${stats.submission}%`} trend="+5.1%" trendUp={true} icon={<CheckCircle/>} colorClass="text-emerald-900 dark:text-emerald-400" />
        <StatCard title="Avg Score" value={`${stats.project}%`} trend="-1.2%" trendUp={false} icon={<TrendingUp/>} colorClass="text-purple-900 dark:text-purple-400" />
        <StatCard title="Flagged" value={stats.flagged} trend="Action Required" trendUp={false} icon={<AlertTriangle/>} colorClass="text-red-900 dark:text-red-400" />
      </div>

      <AnimatePresence mode="wait">
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                <h3 className="mb-8 font-black text-slate-950 dark:text-white flex items-center gap-2 uppercase text-[11px] tracking-widest border-b border-slate-200 dark:border-slate-800 pb-4">
                  <Activity size={18} className="text-blue-800 dark:text-blue-500"/> Engagement Trends
                </h3>
                <AttendanceTrendsChart data={[{lesson: 'L1', attendance: 20}, {lesson: 'L2', attendance: 18}, {lesson: 'L3', attendance: 22}, {lesson: 'L4', attendance: 25}]} />
              </div>
              <div className="glass-panel p-8 rounded-3xl">
                <h3 className="mb-8 font-black text-slate-950 dark:text-white flex items-center gap-2 uppercase text-[11px] tracking-widest border-b border-slate-200 dark:border-slate-800 pb-4">
                  <BarChart3 size={18} className="text-purple-800"/> Performance Range
                </h3>
                <GradesDistributionChart data={[{range: '90-100', count: 5}, {range: '80-89', count: 12}, {range: '70-79', count: 8}]} />
              </div>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                <h3 className="mb-6 font-black text-slate-950 dark:text-white uppercase text-xs tracking-widest">Attendance Timeline</h3>
                <AttendanceTrendsChart data={[{lesson: 'L1', attendance: 24}, {lesson: 'L2', attendance: 22}, {lesson: 'L3', attendance: 25}]} />
              </div>
              <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                 <p className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-500 mb-2 tracking-widest">Learner Capacity</p>
                 <span className="text-8xl font-black text-blue-900 dark:text-blue-500 tracking-tighter">
                   {data.learners.length}
                 </span>
                 <p className="mt-4 font-bold text-slate-900 dark:text-slate-300">Total Enrolled</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div key="performance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-8 rounded-3xl">
                <h3 className="mb-6 font-black text-slate-950 dark:text-white uppercase text-xs tracking-widest">Submission Reliability</h3>
                <SubmissionRateChart data={[{type: 'Class', onTime: 80, late: 15, missed: 5}, {type: 'Home', onTime: 60, late: 20, missed: 20}]} />
              </div>
              <div className="glass-panel p-8 rounded-3xl">
                <h3 className="mb-6 font-black text-slate-950 dark:text-white uppercase text-xs tracking-widest">Grade Distribution</h3>
                <GradesDistributionChart data={[{range: '90-100', count: 10}, {range: '80-89', count: 15}]} />
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
             <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                    <Layout className="text-indigo-800 dark:text-indigo-500" /> Project Gradebook
                  </h3>
                  <div className="bg-slate-200 dark:bg-slate-800 px-4 py-1 rounded-full text-[10px] font-black text-slate-950 dark:text-slate-400 uppercase tracking-widest">
                    Live Rankings
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {studentStats.sort((a,b) => b.projectScore - a.projectScore).map((s, i) => (
                     <motion.div 
                        key={i} 
                        whileHover={{ y: -5 }}
                        className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg transition-all"
                     >
                        <p className="text-[10px] font-black text-slate-900 dark:text-slate-400 uppercase mb-2 tracking-tight">
                          {s.name}
                        </p>
                        <h4 className="text-4xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter">
                          {s.projectScore}%
                        </h4>
                        <div className="mt-4 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                           <div 
                            className="h-full bg-indigo-700" 
                            style={{ width: `${s.projectScore}%` }} 
                           />
                        </div>
                     </motion.div>
                   ))}
                </div>
             </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;