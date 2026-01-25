import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  LogOut,
  Menu,
  X,
  Database,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeTab, setActiveTab, theme, toggleTheme, onLogout }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <Users size={20} /> },
    { id: 'performance', label: 'Performance', icon: <BookOpen size={20} /> },
    { id: 'projects', label: 'Projects', icon: <GraduationCap size={20} /> },
    { id: 'projecters', label: 'The Projecters', icon: <Sparkles size={20} /> },
    { id: 'explorer', label: 'Raw Explorer', icon: <Database size={20} /> },
  ];

  return (
    <>
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-md border border-slate-200 dark:border-slate-700 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/90 dark:bg-[#0B1120]/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/60 transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/60">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 mr-3 flex items-center justify-center font-bold text-white text-sm shadow-lg">DA</div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide">TTSP Portal</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">Analyst Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'}`}
              >
                {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-500 rounded-r-full" />}
                <div className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`}>{item.icon}</div>
                <span className="relative z-10 tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
            <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all duration-200">
              {theme === 'dark' ? <><Sun size={20} className="text-yellow-400" /><span className="font-medium">Light Mode</span></> : <><Moon size={20} className="text-blue-600" /><span className="font-medium">Dark Mode</span></>}
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 group">
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;