import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ChartProps { data: any[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-2xl">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <span className="text-white text-xs font-bold">{entry.name}:</span>
            <span className="text-white text-xs font-black">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AttendanceTrendsChart = ({ data }: ChartProps) => (
  <div className="w-full h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
        <XAxis dataKey="lesson" tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
        <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="attendance" name="Attendance" stroke="#3b82f6" strokeWidth={3} fill="url(#colorAtt)" animationDuration={1500} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const SubmissionRateChart = ({ data }: ChartProps) => (
  <div className="w-full h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barSize={35}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
        <XAxis dataKey="type" tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} dy={5} />
        <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', opacity: 0.05}} />
        <Bar dataKey="onTime" name="On Time" stackId="a" fill="#10b981" />
        <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" />
        <Bar dataKey="missed" name="Missed" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const GradesDistributionChart = ({ data }: ChartProps) => (
  <div className="w-full h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis dataKey="range" type="category" tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} axisLine={false} tickLine={false} width={70} />
        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
        <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);