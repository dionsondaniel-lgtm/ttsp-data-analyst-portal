import React from 'react';
import { X, User, Database, Clock, ShieldCheck } from 'lucide-react';

interface DataDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  tableName: string;
}

const DataDetailsModal: React.FC<DataDetailsModalProps> = ({ isOpen, onClose, data, tableName }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-blue-500/10">
        
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-b border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">{tableName.replace('_', ' ')} Details</h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">ID: {data.id?.substring(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* Grid Content */}
        <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => {
              if (['id', 'last_updated_by', 'updated_at', 'created_at'].includes(key)) return null;
              return (
                <div key={key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 hover:border-blue-500/30 transition-colors">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{key.replace(/_/g, ' ')}</p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold truncate">{value === null || value === '' ? '-' : String(value)}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><User size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Modified By</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{data.last_updated_by || 'System'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Clock size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sync Timestamp</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {data.updated_at ? new Date(data.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 flex justify-center border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex items-center gap-2 px-12 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
            <ShieldCheck size={18} /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataDetailsModal;