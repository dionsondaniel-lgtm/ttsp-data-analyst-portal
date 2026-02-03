import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white text-sm font-black">{payload[0].value} Students</p>
      </div>
    );
  }
  return null;
};

export const AttendanceTrendsChart = ({ data }: { data: any[] }) => (
  <div className="w-full h-[350px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="lesson" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
        <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={4} fill="url(#colorAtt)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const GradesDistributionChart = ({ data }: { data: any[] }) => (
  <div className="w-full h-[350px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
        <XAxis type="number" hide />
        <YAxis dataKey="range" type="category" tick={{fontSize: 10, fontWeight: 800}} axisLine={false} tickLine={false} width={80} />
        <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={25} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const SubmissionRateChart = ({ data }: { data: any[] }) => (
  <div className="w-full h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="type" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
        <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="onTime" name="On Time" stackId="a" fill="#10b981" />
        <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" />
        <Bar dataKey="missed" name="Missed" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);