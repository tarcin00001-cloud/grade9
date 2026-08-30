import os

content = """\"\"\"
Cloudflare9.tsx
Grade 9 Educational Lab
Theme: Ocean (High Contrast)
\"\"\"
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Shield, Server, Cpu, Flame, Activity, Zap, ShieldAlert, CheckCircle, RotateCcw, ArrowRight } from "lucide-react";

type Phase = "assembly" | "testing_idle" | "testing_bomb" | "testing_feedback" | "testing_fixed" | "success";

const MODULES = [
  { id: "parser", label: "Packet Parser", desc: "Ingests raw web requests and decodes headers." },
  { id: "ssl", label: "SSL Validator", desc: "Verifies certificates (Decoy)." },
  { id: "waf", label: "WAF Pattern Scanner", desc: "Inspects incoming request strings against rules." },
  { id: "lb", label: "TCP Load Balancer", desc: "Distributes traffic (Decoy)." },
  { id: "origin", label: "Origin Server Gateway", desc: "Forwards clean, safe requests to backend." }
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
      // Unmount
      setPipeline(prev => prev.map(m => m === moduleId ? null : m));
      playPop();
    } else {
      // Mount to first empty slot
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
      // Reset pipeline if wrong
      setPipeline([null, null, null]);
    }
  };

  const triggerBomb = () => {
    playZap();
    setPhase("testing_bomb");
    
    // Animate CPU spike and exponential steps
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
      setRegexSteps(1); // O(1) time complexity now!
      
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
      instruction="Build the Edge Security Pipeline. Then discover how a single poorly written Regex rule can cause Catastrophic Backtracking and redline global CPUs to 100%!"
      onReset={handleReset}
    >
      <Celebration
        isActive={phase === "success"}
        message="Crisis Averted! You fixed the Regex, prevented Catastrophic Backtracking, and saved the global network!"
        onReplay={handleReset}
      />

      <div className="flex-1 min-h-0 w-full max-w-6xl mx-auto flex flex-col gap-4">
        
        {/* Phase Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 md:p-4 shrink-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <Shield className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      {phase === "assembly" ? "Phase 1: Pipeline Assembly" : "Phase 2: Live Network Testing"}
                    </h2>
                    <p className="text-sm text-slate-600 font-medium">
                      {phase === "assembly" 
                        ? "Mount the correct 3 networking modules to route traffic securely." 
                        : "Test the WAF pattern scanner against live payloads."}
                    </p>
                </div>
            </div>
            
            <div className="hidden md:flex gap-2">
               <div className={`px-3 py-1 rounded-full text-xs font-bold ${phase === "assembly" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>1. Assembly</div>
               <div className={`px-3 py-1 rounded-full text-xs font-bold ${phase.startsWith("testing") && phase !== "success" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>2. CPU Bomb</div>
               <div className={`px-3 py-1 rounded-full text-xs font-bold ${phase === "success" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>3. Safe Traffic</div>
            </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          
          {phase === "assembly" && (
            <motion.div 
              key="assembly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0"
            >
               {/* Left: Slots */}
               <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Edge Security Pipeline</h3>
                  
                  {[0, 1, 2].map(slotIndex => {
                     const mountedId = pipeline[slotIndex];
                     const module = MODULES.find(m => m.id === mountedId);
                     
                     return (
                       <div key={slotIndex} className="relative h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center">
                          {!module ? (
                             <span className="text-sm font-bold text-slate-400">Stage {slotIndex + 1} Slot</span>
                          ) : (
                             <motion.div 
                               layoutId={`mod-${module.id}`}
                               onClick={() => handleMount(module.id)}
                               className="absolute inset-0 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-indigo-100 transition-colors shadow-sm"
                             >
                                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center shrink-0">
                                   <Server size={20} className="text-indigo-700" />
                                </div>
                                <div>
                                   <h4 className="font-bold text-indigo-900">{module.label}</h4>
                                   <p className="text-xs text-indigo-600 font-medium">{module.desc}</p>
                                </div>
                             </motion.div>
                          )}
                       </div>
                     )
                  })}

                  <button
                    disabled={!isAssembled}
                    onClick={startTesting}
                    className="mt-auto py-4 bg-slate-900 disabled:bg-slate-300 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    {isAssembled ? "Initialize Pipeline" : "Mount 3 Components"}
                  </button>
               </div>

               {/* Right: Rack */}
               <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-6 flex flex-col gap-3 overflow-y-auto shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Component Rack (Click to Mount)</h3>
                  
                  {MODULES.map(module => {
                     const isMounted = pipeline.includes(module.id);
                     if (isMounted) return <div key={module.id} className="h-20" />; // Placeholder spacing
                     
                     return (
                        <motion.div 
                          layoutId={`mod-${module.id}`}
                          key={module.id}
                          onClick={() => handleMount(module.id)}
                          className="h-20 bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
                        >
                           <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 transition-colors">
                              <Server size={20} className="text-slate-400 group-hover:text-indigo-600" />
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-800">{module.label}</h4>
                              <p className="text-xs text-slate-500 font-medium line-clamp-1">{module.desc}</p>
                           </div>
                        </motion.div>
                     )
                  })}
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
                  
                  {/* Background Grid */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                  {/* CPU Gauge */}
                  <div className="relative z-10 flex flex-col items-center">
                     <svg className="w-48 h-48 sm:w-64 sm:h-64" viewBox="0 0 100 100">
                        {/* Background Track */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                        {/* Fill Track */}
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

                  {/* Warning Overlay */}
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
                  
                  {/* Rule Viewer */}
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

                  {/* Backtracking Visualizer */}
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
                               {cpuLoad > 80 ? "x,y,z... no '='\nx,y... no '='\nx... no '='\n(Backtracking...)" : "Match failed instantly. (Safe)"}
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

                  {/* Actions */}
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
    content = content.replace('"""\nCloudflare9.tsx\nGrade 9 Educational Lab\nTheme: Ocean (High Contrast)\n"""\n', '')
    f.write(content)

print("Cloudflare UI completely rebuilt and written!")
