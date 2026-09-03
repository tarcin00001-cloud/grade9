"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Shield, Server, Cpu, Flame, Activity, Zap, ShieldAlert, CheckCircle, ArrowRight, Lock, Network, Search, Terminal, Info, AlertTriangle } from "lucide-react";

type Phase = "briefing" | "assembly" | "testing_idle" | "testing_bomb" | "testing_feedback" | "testing_fixed" | "success";

// The hardware blades (modules)
const BLADES = [
  { id: "parser", label: "Packet Parser", desc: "Decodes incoming raw network packets.", icon: Search, color: "text-cyan-400" },
  { id: "ssl", label: "SSL Validator", desc: "Verifies secure certificates.", icon: Lock, color: "text-emerald-400" },
  { id: "waf", label: "WAF Pattern Scanner", desc: "Inspects traffic against security rules.", icon: ShieldAlert, color: "text-rose-400" },
  { id: "lb", label: "TCP Load Balancer", desc: "Distributes traffic across servers.", icon: Network, color: "text-amber-400" },
  { id: "origin", label: "Origin Gateway", desc: "Forwards clean requests to backend.", icon: Server, color: "text-purple-400" }
];

const CORRECT_PIPELINE = ["parser", "waf", "origin"];

export default function Cloudflare9() {
  const { reportComplete } = useLMSBridge("cloudflare9");
  const { playPop, playSuccess, playError, playZap } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("briefing");
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
      playSuccess();
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
      theme="neon"
      title="Cloudflare WAF Incident"
      bgOverride="bg-slate-950"
      compact
      onReset={handleReset}
    >
      <Celebration
        isActive={phase === "success"}
        message="Crisis Averted! You fixed the Regex, prevented Catastrophic Backtracking, and saved the global network!"
        onReplay={handleReset}
      />

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col gap-4 relative isolate">
        
        {/* High-Tech Background Elements */}
        <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none overflow-hidden rounded-3xl">
           <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        {phase === "briefing" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
          >
             <div className="max-w-2xl w-full bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center flex flex-col items-center">
                <Terminal size={48} className="text-cyan-400 mb-6" />
                <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Incoming Directive</h1>
                <p className="text-cyan-100 text-lg leading-relaxed mb-8">
                  Anomalous traffic detected targeting the Global Origin Network. 
                  You must assemble an Edge Security Pipeline using physical server blades. 
                  <br/><br/>
                  Once the firewall is online, prepare to intercept a malicious CPU-bomb payload.
                </p>
                <button 
                  onClick={() => { playPop(); setPhase("assembly"); }}
                  className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xl uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                  Acknowledge & Initialize
                </button>
             </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          
          {phase !== "briefing" && phase === "assembly" && (
            <motion.div 
              key="assembly"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 min-h-0"
            >
               {/* Left: The Datacenter Rack */}
               <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 p-6 flex flex-col relative shadow-2xl overflow-hidden">
                  
                  {/* Glass Header */}
                  <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
                     <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                     <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Edge Server Rack // Alpha-7</h3>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center gap-6 max-w-2xl mx-auto w-full">
                     {[0, 1, 2].map(slotIndex => {
                        const mountedId = pipeline[slotIndex];
                        const module = BLADES.find(m => m.id === mountedId);
                        
                        return (
                          <div key={slotIndex} className="relative h-28 rounded-xl border-y-4 border-slate-800 bg-slate-950/80 flex items-center justify-center overflow-hidden shadow-inner group">
                             
                             {/* Server Rails */}
                             <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-800 to-slate-900 border-r border-slate-700" />
                             <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-800 to-slate-900 border-l border-slate-700" />

                             {!module ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                   <div className="px-6 py-2 border border-cyan-500/30 bg-cyan-950/20 rounded-full text-cyan-500/50 font-mono text-sm uppercase tracking-widest group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                                      [ Bay 0{slotIndex + 1} - Awaiting Hardware ]
                                   </div>
                                </div>
                             ) : (
                                <motion.div 
                                  layoutId={`blade-${module.id}`}
                                  onClick={() => handleMount(module.id)}
                                  className="absolute inset-0 bg-slate-800 border-y-2 border-slate-600 flex items-center gap-6 px-10 cursor-pointer shadow-lg z-10"
                                >
                                   {/* Blade Handle */}
                                   <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-700 flex flex-col items-center justify-center gap-1 border-r border-slate-900 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.5)]">
                                      <div className="w-1 h-6 bg-slate-900 rounded-full" />
                                   </div>
                                   
                                   {/* Status LED */}
                                   <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                                   </div>

                                   {/* Content */}
                                   <div className="ml-8 flex-1">
                                      <h4 className={`font-black text-xl uppercase tracking-wider ${module.color}`}>{module.label}</h4>
                                      <p className="text-xs text-slate-400 font-mono mt-1">{module.desc}</p>
                                   </div>

                                   {/* Deco Circuit */}
                                   <div className="hidden md:flex flex-col gap-1 opacity-20">
                                      <div className="w-16 h-1 bg-white rounded-full" />
                                      <div className="w-12 h-1 bg-white rounded-full" />
                                      <div className="w-20 h-1 bg-white rounded-full" />
                                   </div>

                                   <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                                      <module.icon size={24} className={module.color} />
                                   </div>
                                </motion.div>
                             )}
                          </div>
                        )
                     })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                     <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
                        <Info size={16} />
                        <span>Click hardware blades from inventory to slide into bays.</span>
                     </div>
                     <button
                       disabled={!isAssembled}
                       onClick={startTesting}
                       className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:shadow-none"
                     >
                       Power On Rack
                     </button>
                  </div>
               </div>

               {/* Right: The Inventory Conveyor */}
               <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border-2 border-slate-800 p-6 flex flex-col relative shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                     <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest">Hardware Inventory</h3>
                     <div className="px-2 py-1 bg-slate-950 rounded text-xs font-mono text-slate-500 border border-slate-800">UNITS: {BLADES.length - pipeline.filter(Boolean).length}</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 relative z-10 space-y-3 pb-4 scrollbar-thin scrollbar-thumb-slate-700">
                      {BLADES.map(module => {
                         const isMounted = pipeline.includes(module.id);
                         if (isMounted) return <div key={module.id} className="h-20 opacity-20 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50" />;
                         
                         return (
                            <motion.div 
                              layoutId={`blade-${module.id}`}
                              key={module.id}
                              onClick={() => handleMount(module.id)}
                              className="h-24 bg-slate-800 border-y-2 border-slate-600 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all group relative overflow-hidden"
                            >
                               {/* Side Handle Visual */}
                               <div className="absolute left-0 top-0 bottom-0 w-4 bg-slate-900 border-r border-slate-950 flex items-center justify-center">
                                  <div className="w-1 h-4 bg-slate-700 rounded-full" />
                               </div>

                               <div className="ml-2 w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                  <module.icon size={20} className={module.color} />
                               </div>
                               <div>
                                  <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wide leading-tight">{module.label}</h4>
                                  <p className="text-[10px] text-slate-400 font-mono mt-1">{module.desc}</p>
                               </div>
                            </motion.div>
                         )
                      })}
                  </div>
               </div>
            </motion.div>
          )}

          {phase !== "briefing" && phase !== "assembly" && (
            <motion.div 
              key="testing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0"
            >
               {/* Left: Holographic Dashboard */}
               <div className={`relative rounded-3xl border-2 flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-500 ${phase === "testing_bomb" || phase === "testing_feedback" ? "bg-rose-950/80 border-rose-600 animate-shake shadow-[0_0_50px_rgba(225,29,72,0.3)]" : "bg-slate-900/80 border-cyan-900 shadow-2xl"}`}>
                  
                  <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                  {/* Giant CPU Hologram */}
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="relative">
                        {/* Outer Glow */}
                        <div className={`absolute inset-0 blur-3xl rounded-full transition-all duration-500 ${cpuLoad > 80 ? 'bg-rose-600/40 animate-pulse' : 'bg-cyan-500/20'}`} />
                        
                        <svg className="w-56 h-56 sm:w-72 sm:h-72 drop-shadow-2xl" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                           {/* Danger Track */}
                           <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(225,29,72,0.2)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="100" strokeLinecap="round" transform="rotate(-90 50 50)" className={cpuLoad > 80 ? 'opacity-100' : 'opacity-0'} />
                           {/* Active Track */}
                           <circle 
                             cx="50" cy="50" r="40" 
                             fill="none" 
                             stroke={cpuLoad > 80 ? "#ef4444" : "#06b6d4"} 
                             strokeWidth="8" 
                             strokeDasharray="251.2" 
                             strokeDashoffset={251.2 - (251.2 * cpuLoad) / 100} 
                             strokeLinecap="round"
                             className="transition-all duration-300"
                             transform="rotate(-90 50 50)"
                           />
                        </svg>
                        
                        {/* Center Hologram Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Core Temp</span>
                           <span className={`text-5xl sm:text-6xl font-black tracking-tighter ${cpuLoad > 80 ? "text-rose-500 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"}`}>
                             {cpuLoad.toFixed(0)}%
                           </span>
                           {cpuLoad > 80 && <AlertTriangle size={24} className="text-rose-500 mt-2 animate-bounce" />}
                        </div>
                     </div>
                  </div>

                  <AnimatePresence>
                    {(phase === "testing_bomb" || phase === "testing_feedback") && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 bg-rose-950/90 backdrop-blur-md border border-rose-500 text-white px-8 py-4 rounded-xl flex items-center gap-4 shadow-[0_0_40px_rgba(225,29,72,0.6)]"
                      >
                         <Flame size={32} className="text-rose-400 animate-pulse" />
                         <div className="text-left">
                            <h4 className="font-black text-lg uppercase tracking-widest text-rose-300">Catastrophic Backtracking</h4>
                            <p className="text-sm font-mono text-rose-100">Regex engine locked in exponential recursive loop.</p>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* Right: Command Terminal */}
               <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                  
                  {/* Top: WAF Config */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner">
                     <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Terminal size={14} /> WAF Regex Configuration
                     </span>
                     <div className={`font-mono text-xl sm:text-2xl font-bold px-4 py-3 rounded-xl border flex justify-between items-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] ${phase === "testing_fixed" || phase === "success" ? "bg-emerald-950/30 border-emerald-900 text-emerald-400" : "bg-slate-900 border-slate-700 text-slate-300"}`}>
                        <span>{phase === "testing_fixed" || phase === "success" ? "^[^=]+=[^=]+$" : ".*.*="}</span>
                        {phase === "testing_fixed" || phase === "success" ? (
                           <CheckCircle size={24} className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                        ) : (
                           <ShieldAlert size={24} className="text-amber-500" />
                        )}
                     </div>
                  </div>

                  {/* Middle: Live execution log */}
                  <div className="bg-black/60 rounded-2xl p-5 flex-1 flex flex-col border border-slate-800 shadow-inner relative overflow-hidden">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={12} /> Execution Trace Log
                     </span>
                     
                     <div className="font-mono text-sm text-slate-300 flex-1 space-y-3">
                        <div>
                           <span className="text-slate-600 block mb-1">INCOMING PAYLOAD:</span> 
                           <span className="text-cyan-400 break-all bg-cyan-950/30 px-2 py-1 rounded">x,y,z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p</span>
                        </div>
                        
                        {regexSteps > 0 && (
                          <div className="animate-in fade-in">
                             <span className="text-slate-600 block mb-1">EVALUATING MATCH:</span>
                             <div className={`font-bold p-3 rounded-lg border ${cpuLoad > 80 ? "bg-rose-950/50 border-rose-900 text-rose-400" : "bg-emerald-950/50 border-emerald-900 text-emerald-400"}`}>
                               {cpuLoad > 80 ? (
                                 <span className="animate-pulse flex flex-col gap-1">
                                    <span>x,y,z... no '='</span>
                                    <span>x,y... no '='</span>
                                    <span>x... no '='</span>
                                    <span className="text-rose-500 mt-2 text-xs">ERR: Recursion Limit Reached...</span>
                                 </span>
                               ) : "Match failed instantly. Traffic Rejected safely."}
                             </div>
                          </div>
                        )}
                     </div>

                     <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Compute Steps</span>
                        <span className={`font-mono text-xl font-black ${cpuLoad > 80 ? "text-rose-500 drop-shadow-[0_0_5px_rgba(225,29,72,0.8)]" : "text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]"}`}>
                          {regexSteps.toLocaleString()} {cpuLoad > 80 && "++"}
                        </span>
                     </div>
                  </div>

                  {/* Actions */}
                  {phase === "testing_idle" && (
                    <button onClick={triggerBomb} className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-lg uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(225,29,72,0.4)]">
                      <Flame size={24} /> Inject CPU Bomb Payload
                    </button>
                  )}

                  {phase === "testing_bomb" && (
                    <button disabled className="w-full py-5 bg-slate-800 text-slate-500 border border-slate-700 rounded-xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed">
                      <Zap size={24} className="animate-pulse" /> System Locked...
                    </button>
                  )}

                  {phase === "testing_feedback" && (
                    <button onClick={optimizeRegex} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl font-black text-lg uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-pulse">
                      Refactor Regex Rule
                    </button>
                  )}

                  {(phase === "testing_fixed" || phase === "success") && (
                    <button onClick={triggerSafeTraffic} disabled={phase === "success"} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-700 text-white rounded-xl font-black text-lg uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:shadow-none">
                      <ArrowRight size={24} /> Re-Inject Payload
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
