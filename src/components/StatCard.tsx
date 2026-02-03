import React from 'react';
// Use "import type" to satisfy verbatimModuleSyntax
import type { LucideProps } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactElement<LucideProps>;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, colorClass = "text-blue-600" }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group transition-all hover:scale-[1.02]">
      {/* Decorative Icon in Background */}
      <div className={`absolute -right-4 -top-4 opacity-5 ${colorClass} scale-[3] rotate-12 transition-transform`}>
        {React.cloneElement(icon, { size: 48 } as LucideProps)}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${colorClass}`}>
            {React.cloneElement(icon, { size: 18 } as LucideProps)}
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
        </div>

        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {value}
          </span>
          
          {trend && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg mb-1.5 ${
              trendUp !== false 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;