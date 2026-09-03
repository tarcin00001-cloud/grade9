import os
import glob

lab_files = glob.glob('labs/[vV]irtual[mM]em9.tsx')
target_file = lab_files[0] if lab_files else 'labs/VirtualMem9.tsx'

content = """\"\"\"
VirtualMem9.tsx
\"\"\"
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Cpu, HardDrive, Zap, Flame, Film, Globe, Music, Gamepad2, Mail, AlertTriangle, Loader2, ArrowRightLeft, FastForward } from "lucide-react";

type Phase = "intro" | "ram_fill" | "first_fault" | "thrashing_intro" | "thrashing" | "upgrade_ssd" | "ssd_test" | "success";

const APPS = [
  { id: "video", name: "Video Editor", icon: Film, color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-300" },
  { id: "browser", name: "Web Browser", icon: Globe, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-300" },
  { id: "music", name: "Music Player", icon: Music, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-300" },
  { id: "game", name: "3D Engine", icon: Gamepad2, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-300" },
  { id: "email", name: "Email Client", icon: Mail, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-300" }
];

export default function VirtualMem9() {
  const { reportComplete } = useLMSBridge("virtualmem9");
  const { playPop, playSuccess, playError, playZap } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [ram, setRam] = useState<(string | null)[]>([null, null, null]);
  const [disk, setDisk] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>(["video", "browser", "music"]);
  const [activeDemand, setActiveDemand] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  
  const [stats, setStats] = useState({ hits: 0, faults: 0, cpuTemp: 45 });
  const [driveType, setDriveType] = useState<"HDD" | "SSD">("HDD");
  
  useEffect(() => {
    if (phase === "intro") return;
    
    if (phase === "ram_fill" && ram.every(s => s !== null)) {
       setTimeout(() => {
         setPhase("first_fault");
         setQueue(["game"]);
         setActiveDemand("game");
       }, 500);
    }
    
    if (phase === "first_fault" && ram.includes("game")) {
       setTimeout(() => {
          setPhase("thrashing_intro");
       }, 1000);
    }
    
    if (phase === "ssd_test" && stats.hits + stats.faults >= 8) {
       setTimeout(() => {
          setPhase("success");
          playSuccess();
          reportComplete();
       }, 1500);
    }
  }, [ram, phase, stats.hits, stats.faults, playSuccess, reportComplete]);

  useEffect(() => {
    if (phase !== "thrashing" && phase !== "ssd_test") return;
    
    const demands = ["video", "browser", "music", "game", "email"];
    
    const interval = setInterval(() => {
       if (!isSwapping) {
          const availableToFault = demands.filter(id => !ram.includes(id));
          if (availableToFault.length > 0) {
             const next = availableToFault[Math.floor(Math.random() * availableToFault.length)];
             setActiveDemand(next);
          }
       }
    }, phase === "thrashing" ? 1500 : 1000); 

    return () => clearInterval(interval);
  }, [phase, isSwapping, ram]);

  const handleAction = (appId: string, source: "queue" | "ram" | "disk", slotIndex?: number) => {
    if (isSwapping) return;

    if (source === "queue") {
       const emptySlot = ram.indexOf(null);
       if (emptySlot !== -1) {
          setRam(prev => {
             const next = [...prev];
             next[emptySlot] = appId;
             return next;
          });
          setQueue(prev => prev.filter(id => id !== appId));
          setStats(s => ({ ...s, hits: s.hits + 1 }));
          playPop();
          
          if (activeDemand === appId) setActiveDemand(null);
       } else {
          playError();
       }
    } 
    else if (source === "disk") {
       const emptySlot = ram.indexOf(null);
       if (emptySlot !== -1) {
          setRam(prev => {
             const next = [...prev];
             next[emptySlot] = appId;
             return next;
          });
          setDisk(prev => prev.filter(id => id !== appId));
          playPop();
          if (activeDemand === appId) {
             setActiveDemand(null);
             setStats(s => ({ ...s, faults: s.faults + 1, cpuTemp: Math.max(45, s.cpuTemp - 10) }));
          }
       } else {
          playError();
       }
    }
    else if (source === "ram" && slotIndex !== undefined) {
       setIsSwapping(true);
       setSwapTarget(appId);
       
       const swapDelay = driveType === "HDD" ? 2500 : 300;
       
       if (driveType === "HDD") {
          setStats(s => ({ ...s, cpuTemp: Math.min(100, s.cpuTemp + 20) }));
       }

       setTimeout(() => {
          setRam(prev => {
             const next = [...prev];
             next[slotIndex] = null;
             return next;
          });
          setDisk(prev => [...prev, appId]);
          
          if (driveType === "HDD") playError(); else playPop();
          setIsSwapping(false);
          setSwapTarget(null);
          
          if (phase === "thrashing" && stats.cpuTemp >= 85) {
             setPhase("upgrade_ssd");
          }
       }, swapDelay);
    }
  };

  const startThrashing = () => {
     setPhase("thrashing");
     setQueue(["email"]);
     setActiveDemand("email");
     playZap();
  };

  const applySSDUpgrade = () => {
     setDriveType("SSD");
     setPhase("ssd_test");
     setStats(s => ({ ...s, cpuTemp: 45 }));
     playZap();
  };

  const handleReset = () => {
    setPhase("intro");
    setRam([null, null, null]);
    setDisk([]);
    setQueue(["video", "browser", "music"]);
    setActiveDemand(null);
    setIsSwapping(false);
    setSwapTarget(null);
    setStats({ hits: 0, faults: 0, cpuTemp: 45 });
    setDriveType("HDD");
    playPop();
  };

  return (
    <LabShell
      labId="virtualmem9"
      theme="ocean"
      title="OS Virtual Memory & Thrashing"
      compact
      onReset={handleReset}
    >
      <Celebration
        isActive={phase === "success"}
        message="System Optimized! The SSD eliminated the swap bottleneck, allowing virtual memory to function seamlessly."
        onReplay={handleReset}
      />

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col gap-2 md:gap-3 relative isolate pb-2">
        
        {/* Sleek Mission HUD */}
        <div className={`bg-white rounded-xl shadow-sm border p-2 md:p-3 shrink-0 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 transition-colors ${stats.cpuTemp > 80 ? 'border-rose-400 bg-rose-50/50' : 'border-sky-200'}`}>
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${stats.cpuTemp > 80 ? 'bg-rose-100 border border-rose-300 text-rose-600 animate-pulse' : 'bg-sky-100 border border-sky-300 text-sky-600'}`}>
                    {stats.cpuTemp > 80 ? <AlertTriangle size={20} /> : <Cpu size={20} />}
                </div>
                <div className="flex-1">
                    <h2 className="text-[10px] md:text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">
                      {phase === "intro" && "Standby"}
                      {phase === "ram_fill" && "Mission 1: Fill RAM"}
                      {phase === "first_fault" && "Mission 2: Page Fault"}
                      {phase === "thrashing_intro" && "Warning: Demand Spike"}
                      {phase === "thrashing" && "Mission 3: Thrashing"}
                      {phase === "upgrade_ssd" && "Critical Failure"}
                      {phase === "ssd_test" && "Mission 4: High-Speed Swap"}
                      {phase === "success" && "Optimization Complete"}
                    </h2>
                    <p className={`text-[9px] md:text-xs font-medium leading-tight ${stats.cpuTemp > 80 ? 'text-rose-700' : 'text-slate-500'}`}>
                      {phase === "intro" && "Click 'Initialize' to power on the system."}
                      {phase === "ram_fill" && "Load the 3 queued apps directly into RAM (Instant Execution)."}
                      {phase === "first_fault" && "RAM is full! Click an app in RAM to 'Page Out' to Disk, making room for the 3D Engine."}
                      {phase === "thrashing_intro" && "The CPU will now rapidly demand apps not in RAM. Get ready."}
                      {phase === "thrashing" && "Keep up with CPU demands by swapping apps! Watch the CPU temperature."}
                      {phase === "upgrade_ssd" && "The slow Hard Drive caused an I/O Bottleneck! Upgrade to an SSD."}
                      {phase === "ssd_test" && "Keep up with demands using the new high-speed NVMe SSD."}
                      {phase === "success" && "Virtual Memory is functioning efficiently with fast storage."}
                    </p>
                </div>
            </div>
            
            <div className="flex gap-3 md:gap-4 relative z-10 shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 md:px-4 md:py-2 self-stretch md:self-auto justify-center">
               <div className="text-center">
                  <div className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">RAM Hits</div>
                  <div className="text-sm md:text-xl font-black text-emerald-600 leading-none mt-0.5">{stats.hits}</div>
               </div>
               <div className="w-px bg-slate-200" />
               <div className="text-center">
                  <div className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page Faults</div>
                  <div className="text-sm md:text-xl font-black text-amber-500 leading-none mt-0.5">{stats.faults}</div>
               </div>
               <div className="w-px bg-slate-200" />
               <div className="text-center">
                  <div className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPU Temp</div>
                  <div className={`text-sm md:text-xl font-black leading-none mt-0.5 ${stats.cpuTemp > 80 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>{stats.cpuTemp}°C</div>
               </div>
            </div>
        </div>

        {/* Phase Overlays */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30 rounded-3xl">
             <div className="max-w-md w-full bg-white border-2 border-sky-200 rounded-3xl p-6 md:p-8 shadow-2xl text-center flex flex-col items-center">
                <HardDrive size={40} className="text-sky-500 mb-4" />
                <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest mb-3">Virtual Memory System</h1>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6">
                  Your PC only has 3 slots of Physical RAM. To run more apps, the Operating System will use the Hard Drive as an overflow "Swap File".
                  <br/><br/>
                  Moving data between RAM and Disk is called <strong>Paging</strong>. Let's see how it affects performance.
                </p>
                <button 
                  onClick={() => { playPop(); setPhase("ram_fill"); }}
                  className="w-full py-3 md:py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm md:text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md"
                >
                  Initialize System
                </button>
             </div>
          </div>
        )}

        {phase === "thrashing_intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40 rounded-3xl">
             <div className="max-w-md w-full bg-white border-2 border-amber-300 rounded-3xl p-6 md:p-8 shadow-2xl text-center flex flex-col items-center">
                <AlertTriangle size={40} className="text-amber-500 mb-4" />
                <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest mb-3">Demand Spike Detected</h1>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6">
                  The CPU is about to rapidly request apps that are currently paged out to the Hard Drive.
                  <br/><br/>
                  You must manually swap them in and out of RAM to keep the CPU fed. Watch out for I/O delays!
                </p>
                <button 
                  onClick={startThrashing}
                  className="w-full py-3 md:py-4 bg-amber-500 hover:bg-amber-400 text-white font-black text-sm md:text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md"
                >
                  Begin Test
                </button>
             </div>
          </div>
        )}

        {phase === "upgrade_ssd" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-rose-950/60 rounded-3xl">
             <div className="max-w-md w-full bg-white border-4 border-rose-500 rounded-3xl p-6 md:p-8 shadow-2xl text-center flex flex-col items-center animate-in zoom-in duration-300">
                <Flame size={40} className="text-rose-500 mb-4 animate-pulse" />
                <h1 className="text-xl md:text-2xl font-black text-rose-700 uppercase tracking-widest mb-3">THRASHING DETECTED</h1>
                <p className="text-slate-700 text-xs md:text-sm leading-relaxed mb-6">
                  Your system spent all its time moving data to the slow mechanical Hard Drive instead of executing programs. This is an I/O Wait Lock!
                  <br/><br/>
                  <strong>Solution:</strong> Upgrade to an NVMe Solid State Drive (SSD) to drastically reduce swap times.
                </p>
                <button 
                  onClick={applySSDUpgrade}
                  className="w-full py-3 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm md:text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                >
                  <Zap size={18} /> Install NVMe SSD
                </button>
             </div>
          </div>
        )}

        {/* Main Interactive Grid - FIXED FOR DESKTOP & MOBILE */}
        <div className={`flex-1 flex flex-col md:flex-row gap-3 md:gap-4 min-h-0 transition-all ${phase === 'thrashing' && stats.cpuTemp > 85 ? 'animate-shake pointer-events-none' : ''}`}>
           
           {/* Left/Top: CPU Demand Queue */}
           <div className="flex flex-row md:flex-col shrink-0 md:w-[240px] lg:w-[280px] bg-white rounded-2xl border border-slate-200 p-3 md:p-4 shadow-sm gap-3 md:gap-4 overflow-hidden">
              
              <div className="w-1/2 md:w-full flex flex-col shrink-0">
                 <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1">
                    <Cpu size={14} /> Scheduler
                 </h3>
                 <span className="text-[9px] md:text-[10px] font-bold text-sky-500 uppercase tracking-widest">Active Demand</span>
                 <div className={`mt-1 h-20 md:h-28 rounded-xl border-2 flex items-center justify-center p-2 shadow-inner bg-slate-50 ${activeDemand ? 'border-sky-300' : 'border-slate-200'}`}>
                    {activeDemand ? (() => {
                       const app = APPS.find(a => a.id === activeDemand)!;
                       return (
                          <div className="flex flex-col items-center gap-1 md:gap-2 animate-in fade-in zoom-in text-center">
                             <app.icon size={28} className={app.color} />
                             <span className={`font-black uppercase tracking-wider text-[10px] md:text-xs leading-none ${app.color}`}>{app.name}</span>
                             <span className="text-[8px] md:text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse mt-1">Waiting...</span>
                          </div>
                       );
                    })() : (
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Idle</span>
                    )}
                 </div>
              </div>

              <div className="w-1/2 md:w-full flex-1 flex flex-col min-h-0">
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Incoming Queue</span>
                 
                 <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    <AnimatePresence>
                       {queue.map(appId => {
                          const app = APPS.find(a => a.id === appId)!;
                          return (
                             <motion.div
                               layoutId={`app-${app.id}`}
                               key={app.id}
                               initial={{ opacity: 0, scale: 0.9 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.9 }}
                               onClick={() => handleAction(app.id, "queue")}
                               className={`bg-white border-l-4 ${app.border} rounded-lg md:rounded-xl p-2 md:p-3 flex items-center gap-2 md:gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow group`}
                             >
                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded md:rounded-lg ${app.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                   <app.icon size={14} className={app.color} />
                                </div>
                                <span className="font-bold text-slate-700 text-[10px] md:text-sm leading-tight">{app.name}</span>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>
                    {queue.length === 0 && !activeDemand && (
                       <div className="h-full flex items-center justify-center text-slate-300 font-bold text-[10px] uppercase tracking-widest text-center">
                          Queue Empty
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right/Bottom: The Motherboard (RAM & Disk) */}
           <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0">
              
              {/* RAM Sockets */}
              <div className="shrink-0 bg-white rounded-2xl border border-slate-200 p-3 md:p-4 shadow-sm relative overflow-hidden flex flex-col">
                 <div className="absolute right-0 top-0 bottom-0 w-32 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-5 pointer-events-none" />
                 
                 <h3 className="text-[10px] md:text-xs font-black text-emerald-500 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2 relative z-10">
                    <Zap size={14} /> Physical RAM (3 Slots)
                 </h3>
                 
                 <div className="grid grid-cols-3 gap-2 md:gap-3 relative z-10">
                    {[0, 1, 2].map(slotIndex => {
                       const appId = ram[slotIndex];
                       const app = appId ? APPS.find(a => a.id === appId) : null;
                       
                       return (
                          <div key={slotIndex} className="relative h-16 md:h-24 rounded-xl md:rounded-2xl bg-slate-50 border-y-[3px] md:border-y-4 border-slate-300 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center group overflow-hidden">
                             
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 md:w-2 h-4 md:h-6 bg-slate-200 rounded-r-sm md:rounded-r-md border border-l-0 border-slate-300" />
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 md:w-2 h-4 md:h-6 bg-slate-200 rounded-l-sm md:rounded-l-md border border-r-0 border-slate-300" />

                             {!app ? (
                                <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Empty<br className="md:hidden"/> Socket</span>
                             ) : (
                                <motion.div
                                  layoutId={`app-${app.id}`}
                                  onClick={() => handleAction(app.id, "ram", slotIndex)}
                                  className={`absolute inset-0 bg-white border-2 ${app.border} flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer shadow-md z-10 hover:bg-slate-50 transition-colors`}
                                >
                                   <div className={`absolute top-1 right-1 md:top-2 md:right-2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]`} />
                                   
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center gap-1">
                                         <Loader2 size={16} className="text-slate-400 animate-spin md:w-6 md:h-6" />
                                         <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Paging Out</span>
                                         <div className="w-12 md:w-16 h-1 bg-slate-200 rounded-full overflow-hidden mt-0.5 md:mt-1">
                                            <motion.div 
                                              initial={{ width: 0 }} 
                                              animate={{ width: "100%" }} 
                                              transition={{ duration: driveType === "HDD" ? 2.5 : 0.3 }}
                                              className={`h-full ${driveType === "HDD" ? "bg-amber-400" : "bg-emerald-400"}`} 
                                            />
                                         </div>
                                      </div>
                                   ) : (
                                      <>
                                         <div className={`w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl ${app.bg} flex items-center justify-center shrink-0`}>
                                            <app.icon size={14} className={`${app.color} md:w-5 md:h-5`} />
                                         </div>
                                         <span className="font-black text-slate-800 text-[9px] md:text-xs uppercase tracking-wider leading-tight text-center px-1">{app.name}</span>
                                      </>
                                   )}
                                </motion.div>
                             )}
                          </div>
                       )
                    })}
                 </div>
              </div>

              {/* Disk Swap File (Wrapping Grid) */}
              <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-300 p-3 md:p-4 shadow-inner relative flex flex-col min-h-0">
                 <div className="flex flex-wrap items-center justify-between gap-2 mb-2 md:mb-3 shrink-0">
                    <h3 className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                       <HardDrive size={14} /> 
                       Pagefile.sys
                    </h3>
                    {driveType === "HDD" ? (
                       <span className="text-[8px] md:text-[9px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10}/> HDD</span>
                    ) : (
                       <span className="text-[8px] md:text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><FastForward size={10}/> SSD</span>
                    )}
                 </div>

                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 flex-1 content-start overflow-y-auto pr-1 pb-1 scrollbar-thin">
                    <AnimatePresence>
                       {disk.map(appId => {
                          const app = APPS.find(a => a.id === appId)!;
                          return (
                             <motion.div
                               layoutId={`app-${app.id}`}
                               key={app.id}
                               initial={{ opacity: 0, scale: 0.8 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.8 }}
                               onClick={() => handleAction(app.id, "disk")}
                               className={`h-16 md:h-24 bg-white border-2 border-slate-300 rounded-xl p-1.5 md:p-2 flex flex-col items-center justify-center gap-1 md:gap-2 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group relative overflow-hidden`}
                             >
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
                                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg ${app.bg} flex items-center justify-center shrink-0 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all`}>
                                   <app.icon size={14} className={`${app.color} md:w-4 md:h-4`} />
                                </div>
                                <span className="font-bold text-slate-500 text-[8px] md:text-[10px] uppercase text-center leading-tight px-0.5">{app.name}</span>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>

                    {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="h-16 md:h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50/50">
                          <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Swap<br/>Slot</span>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>
      </div>
    </LabShell>
  );
}
"""

with open(target_file, 'w', encoding='utf-8') as f:
    content = content.replace('"""\nVirtualMem9.tsx\n"""\n', '')
    f.write(content)

print(f"Successfully rebuilt {target_file} with responsive flex constraints.")
