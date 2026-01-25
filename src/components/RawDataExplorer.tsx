import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Trash2, Upload, FileSpreadsheet, CheckSquare, Filter, Download,
  Square, Loader2, Edit3, Plus, X, Save, Search, Eraser, Eye
} from 'lucide-react';
import { dataService } from '../services/dataService';
import DataDetailsModal from './DataDetailsModal';
import * as XLSX from 'xlsx';

const TABLE_SCHEMAS: Record<string, string[]> = {
  learners: ['name', 'company', 'designation', 'address', 'cellphone_no', 'email_add', 'linkedin_url', 'facebook_url', 'cohort_no'],
  attendance: ['learner_name', 'cohort_no', 'module', 'l1_sum', 'l2_sum', 'l3_sum', 'l4_sum', 'l5_sum', 'l6_sum', 'l7_sum', 'l8_sum', 'l9_sum', 'l10_sum', 'l11_sum', 'l12_sum', 'l13_sum', 'l14_sum', 'l15_sum', 'l16_sum', 'l17_sum', 'l18_sum', 'l19_sum', 'prj_extras', 'total_lesson_sum', 'overall_sum'],
  practices: ['learner_name', 'cohort_no', 'module', 'lesson_no', 'date_required', 'date_submitted', 'date_approved', 'total_score', 'score']
};

const COHORTS = ['1ST', '2ND', '3RD', '4TH'];
const MODULES = ['SQL', 'XLS', 'PBI', 'PYTHON'];
const TABLES = Object.keys(TABLE_SCHEMAS);

const RawDataExplorer: React.FC = () => {
  const [activeTable, setActiveTable] = useState(TABLES[0]);
  const [rows, setRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => { loadData(); }, [activeTable]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getTable(activeTable);
      setRows(data || []);
      setSelectedIds(new Set());
      setColumnFilters({});
      setSearchTerm('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // --- SEARCH & FILTER LOGIC ---
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchesGlobal = !searchTerm.trim() || Object.values(row).some(val => 
        String(val || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
      const matchesColumns = Object.entries(columnFilters).every(([key, filterVal]) => {
        if (!filterVal || filterVal === 'All') return true;
        return String(row[key] || '') === String(filterVal);
      });
      return matchesGlobal && matchesColumns;
    });
  }, [rows, searchTerm, columnFilters]);

  const getUniqueValues = (colName: string) => {
    const values = rows.map(r => String(r[colName] || 'N/A'));
    return ['All', ...Array.from(new Set(values))].sort();
  };

  // --- CRUD HANDLERS ---
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const editor = prompt("Authorization Required: Enter your full name for the audit log:");
    if (!editor || editor.trim() === '') return;

    setLoading(true);
    try {
      const payload = { ...formData, last_updated_by: editor.trim(), updated_at: new Date().toISOString() };
      await dataService.upsertRow(activeTable, payload);
      setIsFormModalOpen(false);
      loadData();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleExportXLSX = () => {
    if (filteredRows.length === 0) return alert("Nothing to export.");
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTable);
    XLSX.writeFile(wb, `TTSP_${activeTable}_Data.xlsx`);
  };

  const handleXlsxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const editor = prompt("Bulk Import Auth: Enter your full name:");
    if (!editor) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary', cellDates: true });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as any[];
        const timestamp = new Date().toISOString();
        const existingNames = await dataService.getLearnerNames();

        const validRows: any[] = [];
        data.forEach(row => {
            const nameToMatch = (row.learner_name || row.name || '').toString().trim();
            if (activeTable === 'learners' || existingNames.includes(nameToMatch)) {
                validRows.push({ ...row, last_updated_by: editor, updated_at: timestamp });
            }
        });

        if (validRows.length > 0) await dataService.bulkUpload(activeTable, validRows);
        alert(`Synced ${validRows.length} records.`);
        loadData();
      } catch (err) { alert("Upload failed."); }
      finally { setLoading(false); if (fileRef.current) fileRef.current.value = ''; }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in pb-10" onClick={() => setOpenFilterDropdown(null)}>
      
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-[1.8rem] border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
        <div className="flex flex-col gap-1">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
              {TABLES.map(t => (
                  <button key={t} onClick={() => setActiveTable(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${activeTable === t ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 ml-2 font-black uppercase tracking-widest">Active: {filteredRows.length} of {rows.length}</p>
        </div>

        <div className="relative flex-1 max-w-md" onClick={(e) => e.stopPropagation()}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder={`Global Search...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><Eraser size={14} /></button>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => {setFormData({ cohort_no: '1ST', module: 'SQL' }); setIsFormModalOpen(true);}} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all"><Plus size={14}/> Add New</button>
          
          <button onClick={() => { const ws = XLSX.utils.aoa_to_sheet([TABLE_SCHEMAS[activeTable]]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Template"); XLSX.writeFile(wb, `Template_${activeTable}.xlsx`); }} className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm" title="Template"><Download size={18}/></button>

          <button onClick={() => fileRef.current?.click()} className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-lg" title="Import"><Upload size={18}/></button>
          <input type="file" ref={fileRef} onChange={handleXlsxUpload} className="hidden" accept=".xlsx" />
          
          <button onClick={handleExportXLSX} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg" title="Export View"><FileSpreadsheet size={18}/></button>
          
          {selectedIds.size > 0 && <button onClick={async () => { if(window.confirm('Delete?')) { await dataService.bulkDelete(activeTable, Array.from(selectedIds)); loadData(); } }} className="p-3 bg-red-600 text-white rounded-2xl animate-pulse"><Trash2 size={18}/></button>}
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-[2rem] bg-white dark:bg-slate-900/50 relative shadow-inner custom-scrollbar">
        {loading && <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>}
        
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <tr>
              <th className="p-5 w-10 text-center border-r border-slate-200/20">
                <button onClick={() => setSelectedIds(selectedIds.size === filteredRows.length ? new Set() : new Set(filteredRows.map(r => r.id)))}>
                    {selectedIds.size === filteredRows.length && filteredRows.length > 0 ? <CheckSquare size={20} className="text-blue-500" /> : <Square size={20} className="text-slate-400" />}
                </button>
              </th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-200/20">Actions</th>
              
              {TABLE_SCHEMAS[activeTable].map(col => (
                <th key={col} className="p-5 border-r border-slate-200/20 dark:border-slate-700/20 relative">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{col.replace(/_/g, ' ')}</span>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setOpenFilterDropdown(openFilterDropdown === col ? null : col)} className={`p-1 rounded-md transition-colors ${columnFilters[col] && columnFilters[col] !== 'All' ? 'bg-blue-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'}`}><Filter size={10} /></button>
                        {openFilterDropdown === col && (
                            <div className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[250] p-2 animate-in slide-in-from-top-2">
                                {getUniqueValues(col).map(val => (
                                    <button key={val} onClick={() => { setColumnFilters({...columnFilters, [col]: val}); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${columnFilters[col] === val || (!columnFilters[col] && val === 'All') ? 'bg-blue-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{val}</button>
                                ))}
                            </div>
                        )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRows.map(row => (
              <tr key={row.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all">
                <td className="p-5 text-center border-r border-slate-200/20"><button onClick={() => { const n = new Set(selectedIds); n.has(row.id) ? n.delete(row.id) : n.add(row.id); setSelectedIds(n); }}>{selectedIds.has(row.id) ? <CheckSquare size={20} className="text-blue-500" /> : <Square size={20} className="text-slate-300 dark:text-slate-700 group-hover:text-slate-400" />}</button></td>
                <td className="p-5 border-r border-slate-200/20">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => {setActiveRow(row); setIsViewModalOpen(true);}} className="text-slate-400 hover:text-blue-500 transition-colors"><Eye size={18} /></button>
                    <button onClick={() => {setFormData({...row}); setIsFormModalOpen(true);}} className="text-slate-400 hover:text-emerald-500 transition-colors"><Edit3 size={18} /></button>
                  </div>
                </td>
                {TABLE_SCHEMAS[activeTable].map(col => <td key={col} className="p-5 text-xs font-medium text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800/20">{row[col] ?? '-'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{formData.id ? 'Modify Record' : 'Create Entry'}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveItem} className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {TABLE_SCHEMAS[activeTable].map(col => (
                <div key={col} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{col.replace(/_/g, ' ')}</label>
                  {col === 'cohort_no' ? (
                      <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData[col] || '1ST'} onChange={e => setFormData({...formData, [col]: e.target.value})}>
                          {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  ) : col === 'module' ? (
                      <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData[col] || 'SQL'} onChange={e => setFormData({...formData, [col]: e.target.value})}>
                          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                  ) : (
                      <input className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData[col] || ''} onChange={e => setFormData({ ...formData, [col]: e.target.value })} required={['name', 'learner_name'].includes(col)} type={col.includes('sum') || col.includes('score') || col.includes('no') ? 'number' : 'text'} />
                  )}
                </div>
              ))}
            </form>
            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase transition-all">Cancel</button>
              <button onClick={handleSaveItem} className="px-10 py-3 bg-blue-600 text-white rounded-[1.2rem] text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><Save size={18}/> Commit Update</button>
            </div>
          </div>
        </div>
      )}

      <DataDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} data={activeRow} tableName={activeTable} />
    </div>
  );
};

export default RawDataExplorer;