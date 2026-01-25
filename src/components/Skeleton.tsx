
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded ${className}`} />
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in w-full">
       {/* Header Skeleton */}
       <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
             <Skeleton className="h-8 w-64 rounded-lg" />
             <Skeleton className="h-4 w-48 rounded" />
          </div>
          <div className="flex gap-3">
             <Skeleton className="h-10 w-32 rounded-xl" />
             <Skeleton className="h-10 w-32 rounded-xl" />
             <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
       </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl h-36 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="flex items-end gap-3">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 h-[400px]">
           <div className="flex justify-between mb-8">
             <Skeleton className="h-6 w-48 rounded" />
             <Skeleton className="h-6 w-24 rounded-full" />
           </div>
           <Skeleton className="w-full h-[280px] rounded-xl" />
        </div>
        
        {/* Side Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 h-[400px]">
           <Skeleton className="h-6 w-40 mb-8 rounded" />
           <div className="flex flex-col gap-4">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                   <Skeleton className="h-4 w-8" />
                   <Skeleton className="h-8 w-full rounded" />
                </div>
             ))}
           </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-56 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-8 w-40 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex justify-between px-4 mb-4">
             {[...Array(5)].map((_, i) => (
               <Skeleton key={i} className="h-4 w-24 rounded" />
             ))}
          </div>
          {/* Table Rows */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-2">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <Skeleton className="h-6 w-32 rounded flex-shrink-0" />
              <div className="flex-1 flex justify-center"><Skeleton className="h-4 w-16 rounded" /></div>
              <div className="flex-1 flex justify-center"><Skeleton className="h-4 w-16 rounded" /></div>
              <div className="flex-1 flex justify-end"><Skeleton className="h-6 w-16 rounded-full" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
