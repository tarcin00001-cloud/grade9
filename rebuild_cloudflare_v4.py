import os

content = """\"\"\"
Cloudflare9.tsx
\"\"\"
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Shield, Server, Cpu, Flame, Activity, Zap, ShieldAlert, CheckCircle, RotateCcw, ArrowRight, Globe, Database, Package, Lock, Network } from "lucide-react";

type Phase = "assembly" | "testing_idle" | "testing_bomb" | "testing_feedback" | "testing_fixed" | "success";

const MODULES = [
  { id: "parser", label: "Packet Parser", desc: "Ingests raw web requests and decodes headers.", icon: Package, color: "text-blue-500", bg: "bg-blue-100", border: "border-blue-200" },
  { id: "ssl", label: "SSL Validator", desc: "Verifies secure certificates.", icon: Lock, color: "text-emerald-500", bg: "bg-emerald-100", border: "border-emerald-200" },
  { id: "waf", label: "WAF Pattern Scanner", desc: "Inspects incoming request strings against rules.", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-100", border: "border-rose-200" },
  { id: "lb", label: "TCP Load Balancer", desc: "Distributes incoming traffic across servers.", icon: Network, color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-200" },
  { id: "origin", label: "Origin Server Gateway", desc: "Forwards clean, safe requests to backend.", icon: Server, color: "text-purple-500", bg: "bg-purple-100", border: "border-purple-200" }
];

const CORRECT_PIPELINE = ["parser", "waf", "origin"];

export default function Cloudflare9() {
  const { reportComplete } = useLMSBridge("cloudflare9");
  const { playPop, playSuccess, playError, playZap } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("assembly");
  const [pipeline, setPipeline] = useState<(string | null)[]>([null, null, null]);
  
  // CPU State
  const [cpuLoad, setCpuLoad] = useState(2);
  const [regexSteps, setRegexSteps] = useState(0);

  const isAssembled = pipeline.every(m => m !== null);
  const isCorrect = isAssembled && pipeline.join(",") === CORRECT_PIPELINE.join(",");

  const handleMount = (moduleId: string) => {
    if (pipeline.includes(moduleId)) {
      setPipeline(prev => prev.map(m => m === moduleId ? null : m));
      playPop();
    } else {
      const firstEmpty = pipeline.indexOf(null);
      if (firstEmpty !== -1) {
        setPipeline(prev => {
          const newPipe = [...prev];
          newPipe[firstEmpty] = moduleId;
          return newPipe;
        });
        playPop();
      }
    }
  };

  const startTesting = () => {
    if (isCorrect) {
      playZap();
      setPhase("testing_idle");
    } else {
      playError();
      setPipeline([null, null, null]);
    }
  };

  const triggerBomb = () => {
    playZap();
    setPhase("testing_bomb");
    
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setCpuLoad(prev => Math.min(100, prev + 15 + Math.random() * 10));
      setRegexSteps(prev => prev === 0 ? 2 : prev * 2 + Math.floor(Math.random() * 100));
      
      if (tick > 15) {
        clearInterval(interval);
        setCpuLoad(100);
        playError();
        setTimeout(() => setPhase("testing_feedback"), 1500);
      }
    }, 150);
  };

  const optimizeRegex = () => {
    playPop();
    setPhase("testing_fixed");
    setCpuLoad(2);
    setRegexSteps(0);
  };

  const triggerSafeTraffic = () => {
    playZap();
    
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setCpuLoad(prev => Math.min(15, prev + Math.random() * 5));
      setRegexSteps(1);
      
      if (tick > 5) {
        clearInterval(interval);
        setCpuLoad(2);
        playSuccess();
        setPhase("success");
        setTimeout(reportComplete, 2000);
      }
    }, 200);
  };

  const handleReset = () => {
    playPop();
    setPhase("assembly");
    setPipeline([null, null, null]);
    setCpuLoad(2);
    setRegexSteps(0);
  };

  return (
    <LabShell
      labId="cloudflare9"
      theme="ocean"
      title="Cloudflare WAF Incident"
      compact
      onReset={handleReset}
    >
      <Celebration
        isActive={phase === "success"}
        message="Crisis Averted! You fixed the Regex, prevented Catastrophic Backtracking, and saved the global network!"
        onReplay={handleReset}
      />

      <div className="flex-1 min-h-0 w-full max-w-6xl mx-auto flex flex-col gap-4">
        
        {/* Dynamic Instruction Bar (Restored and styled for Gamification) */}
        <div className="bg-indigo-900 text-white rounded-2xl shadow-md p-3 md:p-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    {phase === "assembly" ? <Shield size={28} className="text-indigo-300" /> : <Flame size={28} className="text-rose-400 animate-pulse" />}
                </div>
                <div>
                    <h2 className="text-sm font-black text-indigo-200 uppercase tracking-widest drop-shadow-sm">
                      {phase === "assembly" ? "Mission 1: Pipeline Assembly" : "Mission 2: Live Network Testing"}
                    </h2>
                    <p className="text-sm text-indigo-50 font-medium">
                      {phase === "assembly" 
                        ? "Bridge the connection! Mount the 3 correct networking chips to route traffic safely from the Internet to the Database." 
                        : "Deploy the WAF rule and observe how Catastrophic Backtracking affects the CPU."}
                    </p>
                </div>
            </div>
            
            <div className="hidden md:flex gap-2 relative z-10 shrink-0">
               <div className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black ${phase === "assembly" ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.6)]" : "bg-indigo-950 text-indigo-500 border border-indigo-800"}`}>1. Assembly</div>
               <div className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black ${phase.startsWith("testing") && phase !== "success" ? "bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]" : "bg-indigo-950 text-indigo-500 border border-indigo-800"}`}>2. CPU Bomb</div>
               <div className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black ${phase === "success" ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.6)]" : "bg-indigo-950 text-indigo-500 border border-indigo-800"}`}>3. Safe Traffic</div>
            </div>
        </div>

        <AnimatePresence mode="wait">
          
          {phase === "assembly" && (
            <motion.div 
              key="assembly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0"
            >
               {/* Left: Gamified Pipeline Slots */}
               <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 md:p-6 flex flex-col gap-2 overflow-y-auto relative">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Network Topology</h3>
                  
                  {/* The Connection Pipe Line (Background) */}
                  <div className="absolute left-[39px] md:left-[47px] top-[70px] bottom-[110px] w-1.5 bg-slate-200 rounded-full z-0"></div>

                  {/* Top Node: Internet */}
                  <div className="relative z-10 flex items-center gap-4 mb-2">
                     <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border-4 border-slate-50 shadow-md">
                        <Globe size={20} className="text-sky-400" />
                     </div>
                     <span className="font-black text-slate-800 uppercase tracking-widest text-sm">Public Internet</span>
                  </div>
                  
                  {/* Slots */}
                  {[0, 1, 2].map(slotIndex => {
                     const mountedId = pipeline[slotIndex];
                     const module = MODULES.find(m => m.id === mountedId);
                     const Icon = module?.icon;
                     
                     return (
                       <div key={slotIndex} className="relative z-10 h-20 ml-6 flex items-center gap-4">
                          {/* Node Connector */}
                          <div className={`w-3 h-3 rounded-full border-2 ${module ? "bg-indigo-500 border-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-white border-slate-300"} shrink-0 relative -left-1.5 z-20 transition-all`} />

                          <div className={`flex-1 relative h-full rounded-2xl border-2 ${module ? `border-transparent` : `border-dashed border-slate-300 bg-white/50`} flex items-center justify-center transition-all`}>
                            {!module ? (
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stage {slotIndex + 1} Slot</span>
                            ) : (
                               <motion.div 
                                 layoutId={`mod-${module.id}`}
                                 onClick={() => handleMount(module.id)}
                                 className={`absolute inset-0 bg-white border-2 ${module.border} rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group`}
                               >
                                  <div className={`w-12 h-12 rounded-xl ${module.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                                     {Icon && <Icon size={24} className={module.color} />}
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-slate-800">{module.label}</h4>
                                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{module.desc}</p>
                                  </div>
                               </motion.div>
                            )}
                          </div>
                       </div>
                     )
                  })}

                  {/* Bottom Node: Database */}
                  <div className="relative z-10 flex items-center gap-4 mt-2">
                     <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border-4 border-slate-50 shadow-md">
                        <Database size={20} className="text-emerald-400" />
                     </div>
                     <span className="font-black text-slate-800 uppercase tracking-widest text-sm">Secure Origin Server</span>
                  </div>

                  <button
                    disabled={!isAssembled}
                    onClick={startTesting}
                    className="mt-6 py-4 bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
                  >
                    {isAssembled ? "Initialize Pipeline" : "Mount 3 Networking Chips"}
                  </button>
               </div>

               {/* Right: Gamified Component Rack */}
               <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto shadow-inner relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Hardware Inventory (Click to Mount)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 relative z-10">
                      {MODULES.map(module => {
                         const isMounted = pipeline.includes(module.id);
                         if (isMounted) return <div key={module.id} className="h-24 opacity-10 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800" />;
                         
                         const Icon = module.icon;
                         
                         return (
                            <motion.div 
                              layoutId={`mod-${module.id}`}
                              key={module.id}
                              onClick={() => handleMount(module.id)}
                              className={`h-24 bg-slate-800 border-2 ${module.border.replace('200', '700/50')} rounded-2xl p-3 flex flex-col justify-center cursor-pointer hover:bg-slate-750 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all group overflow-hidden relative`}
                            >
                               <div className="flex items-center gap-3 mb-1">
                                 <div className={`w-8 h-8 rounded-lg ${module.bg.replace('100', '900/40')} flex items-center justify-center shrink-0`}>
                                    <Icon size={16} className={module.color} />
                                 </div>
                                 <h4 className="font-bold text-sm text-slate-200 leading-tight truncate">{module.label}</h4>
                               </div>
                               <p className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-2 ml-11">{module.desc}</p>
                            </motion.div>
                         )
                      })}
                  </div>
               </div>
            </motion.div>
          )}

          {phase !== "assembly" && (
            <motion.div 
              key="testing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0"
            >
               {/* Left: Server Dashboard */}
               <div className={`relative rounded-3xl border-2 flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-500 ${phase === "testing_bomb" || phase === "testing_feedback" ? "bg-rose-950 border-rose-900 animate-shake" : "bg-slate-900 border-slate-800 shadow-xl"}`}>
                  
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                  <div className="relative z-10 flex flex-col items-center">
                     <svg className="w-48 h-48 sm:w-64 sm:h-64" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                        <circle 
                          cx="50" cy="50" r="40" 
                          fill="none" 
                          stroke={cpuLoad > 80 ? "#ef4444" : "#10b981"} 
                          strokeWidth="8" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * cpuLoad) / 100} 
                          strokeLinecap="round"
                          className="transition-all duration-300"
                          transform="rotate(-90 50 50)"
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">CPU Load</span>
                        <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${cpuLoad > 80 ? "text-rose-500 animate-pulse" : "text-white"}`}>
                          {cpuLoad.toFixed(0)}%
                        </span>
                     </div>
                  </div>

                  <AnimatePresence>
                    {(phase === "testing_bomb" || phase === "testing_feedback") && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 bg-rose-600/90 backdrop-blur-md border border-rose-400 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_40px_rgba(225,29,72,0.6)]"
                      >
                         <Flame size={24} className="animate-bounce" />
                         <div className="text-left">
                            <h4 className="font-black text-sm uppercase tracking-widest">Catastrophic Backtracking</h4>
                            <p className="text-xs font-medium text-rose-100">Regex engine stuck in exponential loop!</p>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* Right: Console Controls */}
               <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-6 flex flex-col gap-4 shadow-sm">
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active WAF Regex Rule</span>
                     <div className="mt-2 font-mono text-lg font-bold text-slate-800 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-inner flex justify-between items-center">
                        <span>{phase === "testing_fixed" || phase === "success" ? "^[^=]+=[^=]+$" : ".*.*="}</span>
                        {phase === "testing_fixed" || phase === "success" ? (
                           <CheckCircle size={20} className="text-emerald-500" />
                        ) : (
                           <ShieldAlert size={20} className="text-amber-500" />
                        )}
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-4 flex-1 flex flex-col border border-slate-800 shadow-inner relative overflow-hidden">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={12} /> Live Engine Visualizer
                     </span>
                     
                     <div className="font-mono text-xs md:text-sm text-slate-300 flex-1">
                        <div className="mb-2"><span className="text-slate-500">Payload:</span> <span className="text-indigo-300 break-all">x,y,z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p</span></div>
                        
                        {regexSteps > 0 && (
                          <div className="animate-in fade-in">
                             <span className="text-slate-500">Checking:</span>
                             <div className={`mt-1 font-bold ${cpuLoad > 80 ? "text-rose-400" : "text-emerald-400"}`}>
                               {cpuLoad > 80 ? "x,y,z... no '='\\nx,y... no '='\\nx... no '='\\n(Backtracking...)" : "Match failed instantly. (Safe)"}
                             </div>
                          </div>
                        )}
                     </div>

                     <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-bold">Compute Steps:</span>
                        <span className={`font-mono font-black ${cpuLoad > 80 ? "text-rose-500" : "text-emerald-500"}`}>
                          {regexSteps.toLocaleString()} {cpuLoad > 80 && "++"}
                        </span>
                     </div>
                  </div>

                  {phase === "testing_idle" && (
                    <button onClick={triggerBomb} className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20">
                      <Flame size={18} /> Send Malicious Payload
                    </button>
                  )}

                  {phase === "testing_bomb" && (
                    <button disabled className="w-full py-4 bg-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                      <Zap size={18} className="animate-pulse" /> System Locked...
                    </button>
                  )}

                  {phase === "testing_feedback" && (
                    <button onClick={optimizeRegex} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 animate-bounce">
                      Optimize Regex Rule
                    </button>
                  )}

                  {(phase === "testing_fixed" || phase === "success") && (
                    <button onClick={triggerSafeTraffic} disabled={phase === "success"} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                      <ArrowRight size={18} /> Send Malicious Payload
                    </button>
                  )}
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </LabShell>
  );
}
"""

with open('labs/cloudflare9.tsx', 'w', encoding='utf-8') as f:
    content = content.replace('"""\nCloudflare9.tsx\n"""\n', '')
    f.write(content)

print("Cloudflare9 rebuilt with V4 Gamification fixes.")
