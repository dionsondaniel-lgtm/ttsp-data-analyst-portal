import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Projecters from './components/Projecters';
import RawDataExplorer from './components/RawDataExplorer';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme as 'dark' | 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('overview');
  };

  if (!isAuthenticated) {
    return <LandingPage onAccessGranted={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`flex min-h-screen overflow-hidden relative transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse-slow ${theme === 'dark' ? 'bg-blue-600/5' : 'bg-blue-200/20'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse-slow ${theme === 'dark' ? 'bg-purple-600/5' : 'bg-purple-200/20'}`} style={{animationDelay: '1.5s'}}></div>
      </div>

      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="flex-1 h-screen overflow-y-auto transition-all duration-300 relative z-10 lg:ml-64">
        {/* Routing Logic */}
        {activeTab === 'projecters' ? (
          <Projecters />
        ) : activeTab === 'explorer' ? (
          <div className="p-8 h-screen"><RawDataExplorer /></div>
        ) : (
          <Dashboard activeTab={activeTab} theme={theme} />
        )}
      </main>
    </div>
  );
};

export default App;