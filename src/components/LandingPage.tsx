import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Fixed: Explicit type import for TS strict mode
import type { Variants } from 'framer-motion';
import { 
  ArrowRight, Lock, KeyRound, Sparkles, ChevronRight, 
  ShieldCheck, BarChart2, Users, Zap, Database 
} from 'lucide-react';

interface LandingPageProps {
  onAccessGranted: () => void;
}

// Passkey from environment variable
const PASSKEY = import.meta.env.VITE_AUTH_KEY || 'DDD';

const LandingPage: React.FC<LandingPageProps> = ({ onAccessGranted }) => {
  const [stage, setStage] = useState<'intro' | 'auth'>('intro');
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Derive animation state from key length
  const validCharCount = key.split('').filter(c => c.toUpperCase() === PASSKEY[0]).length;

  useEffect(() => {
    if (key.toUpperCase() === PASSKEY) {
      setSuccess(true);
      setTimeout(() => {
        onAccessGranted();
      }, 1500);
    }
  }, [key, onAccessGranted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.toUpperCase() !== PASSKEY) {
      setError(true);
      setTimeout(() => setError(false), 800);
    }
  };

  // Animation Variants with explicit typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  const features = [
    { icon: <BarChart2 size={20} />, text: "Real-time Analytics", color: "bg-blue-500" },
    { icon: <Users size={20} />, text: "Cohort Tracking", color: "bg-purple-500" },
    { icon: <Database size={20} />, text: "Raw Data Explorer", color: "bg-emerald-500" },
    { icon: <Zap size={20} />, text: "Live Metrics", color: "bg-orange-500" },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors duration-500 font-sans selection:bg-blue-500/30">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 dark:bg-purple-600/10 blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 blur-[100px] animate-pulse-slow"></div>
      </div>

      <div className="z-10 w-full max-w-5xl px-6 py-12">
        <AnimatePresence mode="wait">
          {stage === 'intro' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side: Text Content */}
              <motion.div
                key="intro-text"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                className="text-left"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">System Online v2.4</span>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    Data Intelligence
                  </span>
                  <br />
                  <span className="text-slate-800 dark:text-white">Redefined.</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                  The TTSP Portal aggregates student performance, attendance, and project grades into a single, futuristic dashboard designed for analysts.
                </motion.p>

                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => setStage('auth')}
                    className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center gap-3 overflow-hidden transform hover:-translate-y-1"
                  >
                    <span className="relative z-10">Initialize Session</span>
                    <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-100 dark:group-hover:text-white transition-all duration-300"></div>
                  </button>
                </motion.div>
              </motion.div>

              {/* Right Side: Visuals - Now responsive (visible on mobile) */}
              <motion.div
                key="intro-visuals"
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: -5, transition: { duration: 0.3 } }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative mt-8 lg:mt-0"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20 animate-pulse-slow"></div>
                <div className="relative glass-panel rounded-3xl p-6 md:p-8 border border-white/40 dark:border-white/10 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                  {/* Fake UI Elements */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded opacity-60"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     {[1, 2].map((i) => (
                       <div key={i} className="h-24 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-4">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3"></div>
                          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                       </div>
                     ))}
                  </div>

                  <div className="space-y-3">
                    {features.map((feat, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (idx * 0.1) }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${feat.color} text-white shadow-md`}>
                          {React.cloneElement(feat.icon as React.ReactElement<{ size: number }>, { size: 20 })}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{feat.text}</span>
                        <ChevronRight size={16} className="ml-auto text-slate-400" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            // AUTH STAGE
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.5, type: "spring" as const, stiffness: 100 }}
              className="flex justify-center w-full"
            >
               <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60">
                <div className="flex justify-between items-center mb-8">
                  <button 
                    onClick={() => setStage('intro')}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 uppercase tracking-widest transition-colors"
                  >
                    <ChevronRight className="rotate-180" size={14} /> Back
                  </button>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors duration-500 ${success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${success ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                    <span className="text-[10px] font-bold uppercase">{success ? 'Authorized' : 'Locked'}</span>
                  </div>
                </div>

                {/* Animated Lock Visualizer */}
                <div className="flex justify-center mb-10 relative h-32 items-center">
                   <AnimatePresence mode="wait">
                      {success ? (
                         <motion.div 
                           initial={{ scale: 0.5, opacity: 0, rotate: -180 }} 
                           animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                           className="flex flex-col items-center"
                         >
                            <div className="p-5 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-lg shadow-green-500/30 mb-3">
                               <ShieldCheck className="w-12 h-12 text-white" />
                            </div>
                            <span className="text-green-600 dark:text-green-400 font-bold text-sm tracking-[0.2em] uppercase">Access Granted</span>
                         </motion.div>
                      ) : (
                         <motion.div 
                           className="relative"
                           animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                           transition={{ duration: 0.4 }}
                         >
                            <div className="relative z-10 p-6 rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
                                <Lock className={`w-12 h-12 ${validCharCount > 0 ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'} transition-colors duration-300`} />
                            </div>
                            
                            {[0, 120, 240].map((_, i) => (
                               <motion.div 
                                 key={i}
                                 className="absolute top-1/2 left-1/2 w-32 h-32 border border-slate-200 dark:border-slate-700 rounded-full -translate-x-1/2 -translate-y-1/2"
                                 animate={{ rotate: 360 }}
                                 transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                               >
                                  <div className="w-2 h-2 bg-blue-500 rounded-full absolute -top-1 left-1/2 shadow-[0_0_10px_#3b82f6]"></div>
                               </motion.div>
                            ))}
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Security Key</label>
                    <div className="relative group">
                      <KeyRound 
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${validCharCount > 0 ? 'text-blue-500' : 'text-slate-400'}`} 
                        size={20} 
                      />
                      <input 
                        type="password" 
                        value={key}
                        onChange={(e) => {
                           if (e.target.value.length <= PASSKEY.length) setKey(e.target.value);
                        }}
                        placeholder="•••"
                        className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-center text-xl tracking-[1em] font-mono text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                        autoFocus
                        disabled={success}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {!success && (
                      <motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        Authenticate
                      </motion.button>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 left-0 w-full text-center pointer-events-none px-4"
        >
           <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] font-bold">
              Restricted Access • TTSP Data Analyst Portal
           </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;