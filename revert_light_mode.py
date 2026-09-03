import os

target_file = 'labs/VirtualMem9.tsx'

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
import { Cpu, HardDrive, Zap, Flame, Film, Globe, Music, Gamepad2, Mail, AlertTriangle, Loader2, FastForward, Activity } from "lucide-react";

type Phase = "intro" | "ram_fill" | "first_fault" | "thrashing_intro" | "thrashing" | "upgrade_ssd" | "ssd_test" | "success";

const APPS = [
  { id: "video", name: "Video Editor", icon: Film, color: "text-rose-500", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
  { id: "browser", name: "Web Browser", icon: Globe, color: "text-sky-500", bgColor: "bg-sky-50", borderColor: "border-sky-200" },
  { id: "music", name: "Music Player", icon: Music, color: "text-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  { id: "game", name: "3D Engine", icon: Gamepad2, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  { id: "email", name: "Email Client", icon: Mail, color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200" }
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
    
    if (phase === "ssd_test" && stats.hits + stats.faults >= 10) {
       setTimeout(() => {
          setPhase("success");
          playSuccess();
          reportComplete();
       }, 1500);
    }
  }, [ram.join(","), phase, stats.hits, stats.faults, playSuccess, reportComplete]);

  useEffect(() => {
    if (phase !== "thrashing" && phase !== "ssd_test") return;
    
    const demands = ["video", "browser", "music", "game", "email"];
    
    const interval = setInterval(() => {
       if (!isSwapping) {
          setActiveDemand(current => {
             if (current) return current; 
             const availableToFault = demands.filter(id => !ram.includes(id));
             if (availableToFault.length > 0) {
                return availableToFault[Math.floor(Math.random() * availableToFault.length)];
             }
             return null;
          });
       }
    }, phase === "thrashing" ? 1500 : 1000); 

    return () => clearInterval(interval);
  }, [phase, isSwapping, ram.join(",")]);

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
      instruction="Load incoming apps into RAM. When RAM is full, page out old apps to the Hard Drive. Upgrade to an SSD to prevent thrashing!"
      hint="Watch the CPU demand queue carefully. Swap apps to the disk to make room, but beware of I/O delays!"
      compact
      onReset={handleReset}
    >
      <Celebration
        isActive={phase === "success"}
        message="System Optimized! The SSD eliminated the swap bottleneck, allowing virtual memory to function seamlessly."
        onReplay={handleReset}
      />

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col gap-4 relative isolate pb-4">
        
        {/* LIGHT HUD */}
        <div className={`bg-white rounded-2xl border p-3 md:p-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-colors ${stats.cpuTemp > 80 ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${stats.cpuTemp > 80 ? 'bg-white border-rose-300 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    {stats.cpuTemp > 80 ? <AlertTriangle size={24} /> : <Cpu size={24} />}
                </div>
                <div className="flex-1">
                    <h2 className={`text-sm font-black uppercase tracking-widest leading-none mb-1.5 ${stats.cpuTemp > 80 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {phase === "intro" && "System Standby"}
                      {phase === "ram_fill" && "Mission 1: Fill RAM"}
                      {phase === "first_fault" && "Mission 2: Page Fault"}
                      {phase === "thrashing_intro" && "Warning: Demand Spike"}
                      {phase === "thrashing" && "Mission 3: Thrashing"}
                      {phase === "upgrade_ssd" && "Critical Failure"}
                      {phase === "ssd_test" && "Mission 4: High-Speed Swap"}
                      {phase === "success" && "Optimization Complete"}
                    </h2>
                    <p className={`text-xs font-semibold leading-tight ${stats.cpuTemp > 80 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {phase === "intro" && "Click 'Power On' to boot the OS Memory Manager."}
                      {phase === "ram_fill" && "Click the 3 queued apps to mount them directly into the fast RAM slots."}
                      {phase === "first_fault" && "RAM is full! Click an app in RAM to eject it, then click the 3D Engine in the Disk to load it."}
                      {phase === "thrashing_intro" && "The CPU will now rapidly demand apps not in RAM. Prepare for heavy I/O."}
                      {phase === "thrashing" && "Click an app in RAM to eject it, then click the demanded app to load it! Watch the CPU temperature!"}
                      {phase === "upgrade_ssd" && "Mechanical HDD bottleneck detected! I/O Wait Lock. Install NVMe."}
                      {phase === "ssd_test" && "Keep the CPU fed! Click an app in RAM to eject it, then click the demanded app to swap it in."}
                      {phase === "success" && "Virtual Memory stabilized. Zero thrashing detected."}
                    </p>
                </div>
            </div>
            
            <div className="flex gap-6 relative z-10 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 shadow-inner">
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM Hits</div>
                  <div className="text-2xl font-black text-emerald-600 leading-none mt-1">{stats.hits}</div>
               </div>
               <div className="w-px bg-slate-200" />
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Faults</div>
                  <div className="text-2xl font-black text-amber-500 leading-none mt-1">{stats.faults}</div>
               </div>
               <div className="w-px bg-slate-200" />
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPU Temp</div>
                  <div className={`text-2xl font-black leading-none mt-1 ${stats.cpuTemp > 80 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>{stats.cpuTemp}°C</div>
               </div>
            </div>
        </div>

        {/* OVERLAYS */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/60 rounded-3xl">
             <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center">
                <HardDrive size={48} className="text-sky-600 mb-6 mx-auto" />
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">Virtual Memory System</h1>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                  Your PC only has 3 slots of fast Physical RAM. To run more apps, the Operating System uses the Hard Drive as an overflow "Swap File".
                  <br/><br/>
                  Moving data between RAM and Disk is called <strong>Paging</strong>. Let's see how mechanical disk speeds affect performance.
                </p>
                <button onClick={() => { playPop(); setPhase("ram_fill"); }} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                  Power On System
                </button>
             </div>
          </div>
        )}

        {phase === "thrashing_intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/60 rounded-3xl">
             <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center">
                <AlertTriangle size={48} className="text-amber-500 mb-6 mx-auto" />
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">Demand Spike Detected</h1>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                  The CPU is about to rapidly request apps that are currently paged out to the mechanical Hard Drive.
                  <br/><br/>
                  You must manually swap them in and out of RAM to keep the CPU fed. Watch out for catastrophic I/O delays!
                </p>
                <button onClick={startThrashing} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                  Begin Stress Test
                </button>
             </div>
          </div>
        )}

        {phase === "upgrade_ssd" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40 rounded-3xl">
             <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center animate-in zoom-in duration-300">
                <Flame size={48} className="text-rose-500 mb-6 mx-auto animate-pulse" />
                <h1 className="text-2xl font-black text-rose-600 uppercase tracking-widest mb-4">THRASHING DETECTED</h1>
                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8">
                  Your system spent all its time moving data to the slow mechanical Hard Drive instead of executing programs. This caused a complete I/O Wait Lock!
                  <br/><br/>
                  <strong>Solution:</strong> Upgrade the hardware to an NVMe Solid State Drive (SSD) to eliminate the swap bottleneck.
                </p>
                <button onClick={applySSDUpgrade} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2">
                  <Zap size={18} /> Install NVMe SSD
                </button>
             </div>
          </div>
        )}

        {/* BRIGHT, HIGH-CONTRAST CHASSIS */}
        <div className={`flex-1 flex flex-col md:flex-row min-h-0 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all ${phase === 'thrashing' && stats.cpuTemp > 85 ? 'animate-shake pointer-events-none border-rose-300' : ''}`}>
           
           {/* Diagnostics Column */}
           <div className="flex flex-col shrink-0 w-full md:w-72 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-5 relative z-10">
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Activity size={16} className="text-sky-500" /> Diagnostics
              </h3>
              
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2">Active Demand</span>
              {/* LCD Panel */}
              <div className="h-28 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-4 relative overflow-hidden">
                 
                 {activeDemand ? (() => {
                    const app = APPS.find(a => a.id === activeDemand)!;
                    return (
                       <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in text-center relative z-10">
                          <app.icon size={32} className={app.color} />
                          <span className={`font-black uppercase tracking-widest text-xs ${app.color}`}>{app.name}</span>
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse mt-1">Awaiting RAM</span>
                       </div>
                    );
                 })() : (
                    <span className="text-slate-400 font-black uppercase tracking-widest text-xs">System Idle</span>
                 )}
              </div>

              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-6">Data Bus Queue</span>
              <div className="flex flex-row flex-wrap gap-3">
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
                            className={`bg-white border border-slate-200 shadow-sm rounded-xl p-2 pr-3 flex items-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all flex-1 min-w-[140px] max-w-[200px] group`}
                          >
                             <div className={`w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0`}>
                                <app.icon size={14} className={app.color} />
                             </div>
                             <span className="font-bold text-slate-600 text-[10px] uppercase tracking-wider group-hover:text-slate-800 transition-colors truncate">{app.name}</span>
                          </motion.div>
                       );
                    })}
                 </AnimatePresence>
                 {queue.length === 0 && !activeDemand && (
                    <div className="h-10 w-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                       Empty
                    </div>
                 )}
              </div>
           </div>

           {/* Motherboard Layout */}
           <div className="flex-1 flex flex-col min-h-0 relative">
              
              {/* RAM Section */}
              <div className="shrink-0 p-6 border-b border-slate-200 relative z-10 bg-white">
                 <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Zap size={16} /> Physical RAM
                 </h3>
                 
                 <div className="grid grid-cols-3 gap-5">
                    {[0, 1, 2].map(slotIndex => {
                       const appId = ram[slotIndex];
                       const app = appId ? APPS.find(a => a.id === appId) : null;
                       
                       return (
                          <div key={slotIndex} className="relative h-28 rounded-xl bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center overflow-hidden">
                             
                             {!app ? (
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest relative z-10">Empty Socket</span>
                             ) : (
                                <motion.div
                                  layoutId={`app-${app.id}`}
                                  onClick={() => handleAction(app.id, "ram", slotIndex)}
                                  className={`absolute inset-[3px] rounded-lg bg-white shadow-sm border-2 ${app.borderColor} flex flex-col items-center justify-center cursor-pointer z-10 hover:shadow-md transition-all`}
                                >
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center justify-center w-full h-full bg-white/90 backdrop-blur-sm rounded-lg absolute inset-0 z-20">
                                         <Loader2 size={20} className={`${driveType === "HDD" ? "text-amber-500" : "text-emerald-500"} animate-spin mb-2`} />
                                         <div className="w-3/4 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                                            <motion.div 
                                              initial={{ width: 0 }} 
                                              animate={{ width: "100%" }} 
                                              transition={{ duration: driveType === "HDD" ? 2.5 : 0.3 }}
                                              className={`h-full ${driveType === "HDD" ? "bg-amber-500" : "bg-emerald-500"}`} 
                                            />
                                         </div>
                                      </div>
                                   ) : (
                                      <>
                                         <div className={`w-10 h-10 rounded-lg ${app.bgColor} flex items-center justify-center border ${app.borderColor}`}>
                                            <app.icon size={18} className={app.color} />
                                         </div>
                                         <span className={`mt-2 font-black text-[10px] uppercase tracking-widest ${app.color}`}>{app.name}</span>
                                      </>
                                   )}
                                </motion.div>
                             )}
                          </div>
                       )
                    })}
                 </div>
              </div>

              {/* Disk Section */}
              <div className="flex-1 p-6 relative flex flex-col min-h-0 bg-slate-50/50">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                       <HardDrive size={16} /> 
                       Pagefile.sys
                    </h3>
                    {driveType === "HDD" ? (
                       <span className="text-[10px] font-black bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={14}/> Mechanical Drive</span>
                    ) : (
                       <span className="text-[10px] font-black bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2"><FastForward size={14}/> NVMe Array</span>
                    )}
                 </div>

                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 flex-1 content-start">
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
                               className={`h-24 bg-white shadow-sm border border-slate-200 rounded-xl p-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all group relative`}
                             >
                                <div className={`w-8 h-8 rounded-lg ${app.bgColor} flex items-center justify-center border ${app.borderColor}`}>
                                   <app.icon size={16} className={app.color} />
                                </div>
                                <span className={`font-black text-[9px] uppercase tracking-wider text-center ${app.color}`}>{app.name}</span>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>

                    {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="h-24 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden opacity-60">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Drive<br/>Bay</span>
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

print(f"Successfully rebuilt {target_file} with HIGH CONTRAST LIGHT THEME.")
