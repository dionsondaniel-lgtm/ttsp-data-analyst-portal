import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Trash2, Upload, FileSpreadsheet, CheckSquare, Filter, Download,
  Square, Loader2, Edit3, Plus, X, Save, Search, Eye, UserPlus, 
  Calendar, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { dataService } from '../services/dataService';
import DataDetailsModal from './DataDetailsModal';
import * as XLSX from 'xlsx';

// DEFINED SCHEMAS MATCHING YOUR SQL
const TABLE_SCHEMAS: Record<string, string[]> = {
  learners: ['name', 'company', 'designation', 'address', 'cellphone_no', 'email_add', 'linkedin_url', 'facebook_url', 'cohort_no'],
  attendance: ['learner_name', 'cohort_no', 'module', 'l1_sum', 'l2_sum', 'l3_sum', 'l4_sum', 'l5_sum', 'l6_sum', 'l7_sum', 'l8_sum', 'l9_sum', 'l10_sum', 'l11_sum', 'l12_sum', 'l13_sum', 'l14_sum', 'l15_sum', 'l16_sum', 'l17_sum', 'l18_sum', 'l19_sum', 'prj_extras', 'total_lesson_sum', 'overall_sum'],
  practices: ['learner_name', 'cohort_no', 'module', 'lesson_no', 'date_required', 'date_submitted', 'date_approved', 'total_score', 'score']
};

const DATE_COLUMNS = ['date_required', 'date_submitted', 'date_approved'];
const COHORTS = ['1ST', '2ND', '3RD', '4TH'];
const MODULES = ['SQL', 'XLS', 'PBI', 'PYTHON'];
const TABLES = Object.keys(TABLE_SCHEMAS);

const RawDataExplorer: React.FC = () => {
  const [activeTable, setActiveTable] = useState(TABLES[0]);
  const [rows, setRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // FILTERS
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => { loadData(); }, [activeTable]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, columnFilters, activeTable]);

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

  // --- HELPERS ---
  const formatToMMDDYYYY = (val: any) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatToDbDate = (val: any) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  };

  const sanitizeNumeric = (val: any) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  };

  const parseImportDate = (val: any): string | null => {
    if (!val) return null;
    try {
      if (val instanceof Date) return formatToDbDate(val);
      if (typeof val === 'number') return formatToDbDate(new Date((val - 25569) * 86400 * 1000));
      const d = new Date(String(val).trim());
      return !isNaN(d.getTime()) ? formatToDbDate(d) : null;
    } catch { return null; }
  };

  // --- FILTER LOGIC ---
  const toggleFilterValue = (col: string, val: string) => {
    setColumnFilters(prev => {
      const current = prev[col] || [];
      const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
      return { ...prev, [col]: next };
    });
  };

  const clearFilter = (col: string) => {
    const next = { ...columnFilters };
    delete next[col];
    setColumnFilters(next);
  };

  const getUniqueValues = (colName: string) => {
    const values = rows.map(r => DATE_COLUMNS.includes(colName) ? formatToMMDDYYYY(r[colName]) : String(r[colName] || 'N/A'));
    return Array.from(new Set(values.filter(v => v !== ''))).sort();
  };

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchesGlobal = !searchTerm.trim() || Object.entries(row).some(([key, val]) => {
        if (['last_updated_by', 'updated_at', 'id'].includes(key)) return false;
        const displayVal = DATE_COLUMNS.includes(key) ? formatToMMDDYYYY(val) : String(val || '');
        return displayVal.toLowerCase().includes(searchTerm.toLowerCase().trim());
      });
      const matchesColumns = Object.entries(columnFilters).every(([key, selectedList]) => {
        if (!selectedList || selectedList.length === 0) return true;
        const displayVal = DATE_COLUMNS.includes(key) ? formatToMMDDYYYY(row[key]) : String(row[key] || 'N/A');
        return selectedList.includes(displayVal);
      });
      return matchesGlobal && matchesColumns;
    });
  }, [rows, searchTerm, columnFilters]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  // --- CRUD HANDLERS ---
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const editor = prompt("Authorization Required: Enter your name:");
    if (!editor) return;

    setSaving(true);
    try {
      const validKeys = [...TABLE_SCHEMAS[activeTable], 'id', 'last_updated_by', 'updated_at'];
      const payload: any = {};
      validKeys.forEach(key => {
        if (formData[key] !== undefined) {
          let val = formData[key];
          if (key.includes('sum') || key.includes('score') || key.includes('no')) val = sanitizeNumeric(val);
          payload[key] = val;
        }
      });
      payload.last_updated_by = editor.trim();
      payload.updated_at = new Date().toISOString();
      await dataService.upsertRow(activeTable, payload);
      setIsFormModalOpen(false);
      loadData();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([TABLE_SCHEMAS[activeTable].map(h => h.toUpperCase())]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Template_${activeTable}.xlsx`);
  };

  const handleExportXLSX = () => {
    if (filteredRows.length === 0) return alert("Nothing to export.");
    const schema = TABLE_SCHEMAS[activeTable];
    const exportData = filteredRows.map(row => {
        const obj: any = {};
        schema.forEach(key => {
            const val = row[key];
            obj[key.replace(/_/g, ' ').toUpperCase()] = DATE_COLUMNS.includes(key) ? formatToMMDDYYYY(val) : (val ?? '');
        });
        return obj;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTable);
    XLSX.writeFile(wb, `TTSP_${activeTable}_Data.xlsx`);
  };

  // --- REFINED BULK IMPORT ---
  const handleXlsxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const editor = prompt("Import Authorization Name:");
    if (!editor) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary', cellDates: true });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as any[];
        const existingNames = await dataService.getLearnerNames();
        const schema = TABLE_SCHEMAS[activeTable];
        
        const validRows: any[] = [];
        const errorSummary: string[] = [];

        data.forEach((row: any, idx: number) => {
            const rowNum = idx + 2;
            const rowData: any = {};
            
            Object.entries(row).forEach(([rawKey, val]) => {
                let cleanKey = rawKey.toLowerCase().trim().replace(/\s+/g, '_').replace(/[.]/g, '');
                
                // Aggressive mapping for cohort_no (handles: "Cohort", "Cohort No", "Cohort Number")
                if (cleanKey.includes('cohort')) cleanKey = 'cohort_no';
                // Aggressive mapping for learner_name
                if (cleanKey === 'learner' || cleanKey === 'name') {
                  cleanKey = activeTable === 'learners' ? 'name' : 'learner_name';
                }

                if (schema.includes(cleanKey)) {
                    if (DATE_COLUMNS.includes(cleanKey)) {
                        rowData[cleanKey] = parseImportDate(val);
                    } else if (cleanKey.includes('sum') || cleanKey.includes('score') || cleanKey === 'lesson_no') {
                        rowData[cleanKey] = sanitizeNumeric(val);
                    } else if (cleanKey === 'cohort_no') {
                        rowData[cleanKey] = String(val || '').trim().toUpperCase();
                    } else {
                        rowData[cleanKey] = val;
                    }
                }
            });

            const name = (rowData.learner_name || rowData.name || '').toString().trim();
            if (!name) {
                errorSummary.push(`Row ${rowNum}: Name is empty.`);
            } else if (activeTable !== 'learners' && !existingNames.includes(name)) {
                errorSummary.push(`Row ${rowNum}: Learner "${name}" not found.`);
            } else {
                validRows.push({ ...rowData, last_updated_by: editor, updated_at: new Date().toISOString() });
            }
        });

        if (validRows.length > 0) {
            await dataService.bulkUpload(activeTable, validRows);
            const msg = `Success: Imported ${validRows.length} records.`;
            const errs = errorSummary.length > 0 ? `\n\nSkipped ${errorSummary.length} rows.` : '';
            alert(msg + errs);
            loadData();
        } else {
            alert(`Upload Failed:\n${errorSummary.slice(0, 10).join('\n')}`);
            setLoading(false);
        }
      } catch (err: any) { alert(`System Error: ${err.message}`); setLoading(false); }
      finally { if (fileRef.current) fileRef.current.value = ''; }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in pb-10" onClick={() => setOpenFilterDropdown(null)}>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-[1.8rem] border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
        <div className="flex flex-col gap-1">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
              {TABLES.map(t => (
                  <button key={t} onClick={() => setActiveTable(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${activeTable === t ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 ml-2 font-black uppercase tracking-widest">Active Results: {filteredRows.length}</p>
        </div>

        <div className="relative flex-1 max-w-md" onClick={(e) => e.stopPropagation()}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder={`Global Search...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { setFormData(activeTable === 'learners' ? { cohort_no: '1ST' } : { cohort_no: '1ST', module: 'SQL' }); setIsFormModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 shadow-lg transition-all"><Plus size={14}/> Add New</button>
          <button onClick={handleDownloadTemplate} className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-50 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-200" title="Template"><Download size={18}/></button>
          <button onClick={() => fileRef.current?.click()} className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-lg" title="Import"><Upload size={18}/></button>
          <input type="file" ref={fileRef} onChange={handleXlsxUpload} className="hidden" accept=".xlsx" />
          <button onClick={handleExportXLSX} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg" title="Export Table"><FileSpreadsheet size={18}/></button>
          {selectedIds.size > 0 && <button onClick={async () => { if(window.confirm('Delete selected?')) { await dataService.bulkDelete(activeTable, Array.from(selectedIds)); loadData(); } }} className="p-3 bg-red-600 text-white rounded-2xl animate-pulse"><Trash2 size={18}/></button>}
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-[2rem] bg-white dark:bg-slate-900/50 relative shadow-inner custom-scrollbar">
        {loading && <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>}
        
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-50 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <tr>
              <th className="p-5 w-10 text-center border-r border-slate-200/20">
                <button onClick={() => setSelectedIds(selectedIds.size === paginatedRows.length ? new Set() : new Set(paginatedRows.map(r => r.id)))}>
                    {selectedIds.size === paginatedRows.length && paginatedRows.length > 0 ? <CheckSquare size={20} className="text-blue-500" /> : <Square size={20} className="text-slate-400" />}
                </button>
              </th>
              <th className="p-5 text-center border-r border-slate-200/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              {TABLE_SCHEMAS[activeTable].map(col => (
                <th key={col} className="p-5 border-r border-slate-200/20 dark:border-slate-700/20 relative">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{col.replace(/_/g, ' ')}</span>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setOpenFilterDropdown(openFilterDropdown === col ? null : col)} className={`p-1.5 rounded-lg transition-colors ${columnFilters[col]?.length > 0 ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-400'}`}><Filter size={12} /></button>
                        {openFilterDropdown === col && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Filters</span>
                                    <button onClick={() => clearFilter(col)} className="text-[10px] font-bold text-red-500 hover:underline">Clear</button>
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                    {getUniqueValues(col).map(val => (
                                        <label key={val} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer group">
                                            <div onClick={() => toggleFilterValue(col, val)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${columnFilters[col]?.includes(val) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'}`}>
                                                {columnFilters[col]?.includes(val) && <Check size={12} strokeWidth={4} />}
                                            </div>
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{val}</span>
                                        </label>
                                    ))}
                                </div>
                                <button onClick={() => setOpenFilterDropdown(null)} className="w-full py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest">Apply</button>
                            </div>
                        )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedRows.map(row => (
              <tr key={row.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all">
                <td className="p-5 text-center border-r border-slate-200/20"><button onClick={() => { const n = new Set(selectedIds); n.has(row.id) ? n.delete(row.id) : n.add(row.id); setSelectedIds(n); }}>{selectedIds.has(row.id) ? <CheckSquare size={20} className="text-blue-500" /> : <Square size={20} className="text-slate-300 group-hover:text-slate-400" />}</button></td>
                <td className="p-5 border-r border-slate-200/20 text-center whitespace-nowrap">
                    <button onClick={() => {setActiveRow(row); setIsViewModalOpen(true);}} className="p-2 text-slate-400 hover:text-blue-500 inline-block"><Eye size={18} /></button>
                    <button onClick={() => {setFormData({...row}); setIsFormModalOpen(true);}} className="p-2 text-slate-400 hover:text-emerald-500 inline-block"><Edit3 size={18} /></button>
                </td>
                {TABLE_SCHEMAS[activeTable].map(col => (
                    <td key={col} className="p-5 text-xs font-medium text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800/20">
                        {DATE_COLUMNS.includes(col) ? formatToMMDDYYYY(row[col]) : (row[col] ?? '')}
                    </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-4 bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-slate-400">Rows:</span>
                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-3 py-1 text-xs font-bold dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400">Showing {Math.min(filteredRows.length, (currentPage - 1) * rowsPerPage + 1)} - {Math.min(filteredRows.length, currentPage * rowsPerPage)} of {filteredRows.length}</span>
        </div>

        <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all"><ChevronLeft size={20}/></button>
            <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i + 1;
                    if (pageNum > totalPages || pageNum < 1) return null;
                    return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>{pageNum}</button>
                    );
                })}
            </div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                    {activeTable === 'learners' ? <UserPlus size={24}/> : (DATE_COLUMNS.some(d => TABLE_SCHEMAS[activeTable].includes(d)) ? <Calendar size={24}/> : <FileSpreadsheet size={24}/>)}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{formData.id ? 'Modify Data' : `Create ${activeTable}`}</h3>
                </div>
              </div>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
            </div>

            <form onSubmit={handleSaveItem} className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {TABLE_SCHEMAS[activeTable].map(col => (
                <div key={col} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{col.replace(/_/g, ' ')}</label>
                  {col === 'cohort_no' ? (
                      <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl p-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" value={formData[col] || '1ST'} onChange={e => setFormData({...formData, [col]: e.target.value})}>
                          {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  ) : col === 'module' ? (
                      <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl p-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" value={formData[col] || 'SQL'} onChange={e => setFormData({...formData, [col]: e.target.value})}>
                          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                  ) : (
                      <input className="bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-blue-300" value={DATE_COLUMNS.includes(col) ? (formData[col] ? formatToDbDate(formData[col]) : '') : (formData[col] || '')} onChange={e => setFormData({ ...formData, [col]: e.target.value })} required={['name', 'learner_name'].includes(col)} type={DATE_COLUMNS.includes(col) ? 'date' : (col.includes('sum') || col.includes('score') || col.includes('no') ? 'number' : 'text')} step={col === 'score' ? '0.01' : '1'} />
                  )}
                </div>
              ))}
            </form>

            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-6 py-2.5 text-xs font-bold text-slate-500 uppercase hover:text-slate-800 transition-colors">Cancel</button>
              <button onClick={handleSaveItem} disabled={saving} className="px-10 py-3 bg-blue-600 text-white rounded-[1.2rem] text-sm font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>}
                {saving ? 'Processing...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DataDetailsModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} data={activeRow} tableName={activeTable} />
    </div>
  );
};

export default RawDataExplorer;