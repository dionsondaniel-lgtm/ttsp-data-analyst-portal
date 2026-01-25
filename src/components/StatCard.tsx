import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, colorClass = "text-blue-600 dark:text-blue-400" }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/40 shadow-sm">
      {/* Decorative Icon in Background */}
      <div className={`absolute top-0 right-0 p-4 opacity-10 ${colorClass}`}>
        {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 48 })}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${colorClass} bg-current flex items-center justify-center`}>
            {React.cloneElement(icon as React.ReactElement<{ size: number; className: string }>, { 
              size: 20, 
              className: colorClass 
            })}
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
        </div>

        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          
          {trend && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg mb-1.5 shadow-sm ${
              trendUp 
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
            }`}>
              {trend}
            </span>
          )}
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 dark:opacity-20 bg-current ${colorClass}`}></div>
    </div>
  );
};

export default StatCard;