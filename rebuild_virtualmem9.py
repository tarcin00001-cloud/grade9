import os
import glob

# Ensure we overwrite the exact file regardless of exact casing in the labs folder.
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
import { Cpu, HardDrive, Zap, Film, Globe, Music, Gamepad2, Mail, AlertTriangle, Loader2, ArrowRightLeft, FastForward, CheckCircle2 } from "lucide-react";

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
  
  // Game Loop logic
  useEffect(() => {
    if (phase === "intro") return;
    
    // Check if phase progression is needed based on state
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
    
  }, [ram, phase, stats.hits, stats.faults]);

  // Automated Thrashing Sequence
  useEffect(() => {
    if (phase !== "thrashing" && phase !== "ssd_test") return;
    
    const demands = ["video", "browser", "music", "game", "email"];
    
    const interval = setInterval(() => {
       if (!isSwapping) {
          // Pick something that is NOT in RAM to force a fault
          const availableToFault = demands.filter(id => !ram.includes(id));
          if (availableToFault.length > 0) {
             const next = availableToFault[Math.floor(Math.random() * availableToFault.length)];
             setActiveDemand(next);
          }
       }
    }, phase === "thrashing" ? 1500 : 1000); // Fast demands!

    return () => clearInterval(interval);
  }, [phase, isSwapping, ram]);

  const handleAction = (appId: string, source: "queue" | "ram" | "disk", slotIndex?: number) => {
    if (isSwapping) return;

    if (source === "queue") {
       // Move to RAM if space
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
          // RAM Full
          playError();
       }
    } 
    else if (source === "disk") {
       // Only allow moving from disk if RAM has space
       const emptySlot = ram.indexOf(null);
       if (emptySlot !== -1) {
          // Instant Paging In (Assume it's loaded to RAM)
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
       // Paging out to Disk
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

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col gap-3 relative isolate">
        
        {/* Sleek Mission HUD */}
        <div className={`bg-white rounded-2xl shadow-sm border p-3 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${stats.cpuTemp > 80 ? 'border-rose-400 bg-rose-50/50' : 'border-sky-200'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${stats.cpuTemp > 80 ? 'bg-rose-100 border border-rose-300 text-rose-600 animate-pulse' : 'bg-sky-100 border border-sky-300 text-sky-600'}`}>
                    {stats.cpuTemp > 80 ? <AlertTriangle size={24} /> : <Cpu size={24} />}
                </div>
                <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      {phase === "intro" && "Standby"}
                      {phase === "ram_fill" && "Mission 1: Fill RAM"}
                      {phase === "first_fault" && "Mission 2: Page Fault"}
                      {phase === "thrashing_intro" && "Warning: Demand Spike"}
                      {phase === "thrashing" && "Mission 3: Thrashing"}
                      {phase === "upgrade_ssd" && "Critical Failure"}
                      {phase === "ssd_test" && "Mission 4: High-Speed Swap"}
                      {phase === "success" && "Optimization Complete"}
                    </h2>
                    <p className={`text-xs font-medium ${stats.cpuTemp > 80 ? 'text-rose-700' : 'text-slate-500'}`}>
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
            
            <div className="flex gap-4 relative z-10 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
               <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RAM Hits</div>
                  <div className="text-xl font-black text-emerald-600">{stats.hits}</div>
               </div>
               <div className="w-px bg-slate-200" />
               <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page Faults</div>
                  <div className="text-xl font-black text-amber-500">{stats.faults}</div>
               </div>
               <div className="w-px bg-slate-200" />
               <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPU Temp</div>
                  <div className={`text-xl font-black ${stats.cpuTemp > 80 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>{stats.cpuTemp}°C</div>
               </div>
            </div>
        </div>

        {/* Phase Overlays */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30 rounded-3xl">
             <div className="max-w-md w-full bg-white border-2 border-sky-200 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center">
                <HardDrive size={48} className="text-sky-500 mb-6" />
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">Virtual Memory System</h1>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  Your PC only has 3 slots of Physical RAM. To run more apps, the Operating System will use the Hard Drive as an overflow "Swap File".
                  <br/><br/>
                  Moving data between RAM and Disk is called <strong>Paging</strong>. Let's see how it affects performance.
                </p>
                <button 
                  onClick={() => { playPop(); setPhase("ram_fill"); }}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md"
                >
                  Initialize System
                </button>
             </div>
          </div>
        )}

        {phase === "thrashing_intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/40 rounded-3xl">
             <div className="max-w-md w-full bg-white border-2 border-amber-300 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center">
                <AlertTriangle size={48} className="text-amber-500 mb-6" />
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">Demand Spike Detected</h1>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">
                  The CPU is about to rapidly request apps that are currently paged out to the Hard Drive.
                  <br/><br/>
                  You must manually swap them in and out of RAM to keep the CPU fed. Watch out for I/O delays!
                </p>
                <button 
                  onClick={startThrashing}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-black text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md"
                >
                  Begin Test
                </button>
             </div>
          </div>
        )}

        {phase === "upgrade_ssd" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-rose-950/60 rounded-3xl">
             <div className="max-w-md w-full bg-white border-4 border-rose-500 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center animate-in zoom-in duration-300">
                <Flame size={48} className="text-rose-500 mb-6 animate-pulse" />
                <h1 className="text-2xl font-black text-rose-700 uppercase tracking-widest mb-4">THRASHING DETECTED</h1>
                <p className="text-slate-700 text-sm leading-relaxed mb-8">
                  Your system spent all its time moving data to the slow mechanical Hard Drive instead of actually executing programs. This caused an I/O Wait Lock!
                  <br/><br/>
                  <strong>Solution:</strong> Upgrade to an NVMe Solid State Drive (SSD) to drastically reduce swap times.
                </p>
                <button 
                  onClick={applySSDUpgrade}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                >
                  <Zap size={20} /> Install NVMe SSD
                </button>
             </div>
          </div>
        )}

        {/* Main Interactive Grid */}
        <div className={`flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 min-h-0 transition-all ${phase === 'thrashing' && stats.cpuTemp > 85 ? 'animate-shake pointer-events-none' : ''}`}>
           
           {/* Left: CPU Demand Queue */}
           <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col relative shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Cpu size={14} /> CPU Scheduler
              </h3>
              
              <div className="flex-1 flex flex-col gap-3">
                 {/* Active Demand */}
                 <div className="mb-4">
                    <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Active Demand</span>
                    <div className={`mt-1 h-24 rounded-2xl border-2 flex items-center justify-center p-3 shadow-inner bg-slate-50 ${activeDemand ? 'border-sky-300' : 'border-slate-200'}`}>
                       {activeDemand ? (() => {
                          const app = APPS.find(a => a.id === activeDemand);
                          return (
                             <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in">
                                <app.icon size={32} className={app.color} />
                                <span className={`font-black uppercase tracking-wider text-sm ${app.color}`}>{app.name}</span>
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">Waiting for RAM...</span>
                             </div>
                          );
                       })() : (
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Idle</span>
                       )}
                    </div>
                 </div>

                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incoming Queue</span>
                 
                 <div className="flex-1 overflow-y-auto space-y-2 pr-2">
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
                               className={`bg-white border-l-4 ${app.border} rounded-xl p-3 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow group`}
                             >
                                <div className={`w-8 h-8 rounded-lg ${app.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                   <app.icon size={16} className={app.color} />
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{app.name}</span>
                                <ArrowRightLeft size={14} className="ml-auto text-slate-300 group-hover:text-sky-500 transition-colors" />
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>
                    {queue.length === 0 && !activeDemand && (
                       <div className="h-full flex items-center justify-center text-slate-400 font-bold text-sm uppercase tracking-widest">
                          Queue Empty
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right: The Motherboard (RAM & Disk) */}
           <div className="flex flex-col gap-4 min-h-0">
              
              {/* RAM Sockets */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm relative overflow-hidden flex flex-col">
                 <div className="absolute right-0 top-0 bottom-0 w-32 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-5 pointer-events-none" />
                 
                 <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <Zap size={14} /> Physical RAM (3 Slots)
                 </h3>
                 
                 <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                    {[0, 1, 2].map(slotIndex => {
                       const appId = ram[slotIndex];
                       const app = appId ? APPS.find(a => a.id === appId) : null;
                       
                       return (
                          <div key={slotIndex} className="relative h-28 rounded-2xl bg-slate-50 border-y-4 border-slate-300 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] flex items-center justify-center group overflow-hidden">
                             
                             {/* Socket Notches */}
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-6 bg-slate-200 rounded-r-md border border-l-0 border-slate-300" />
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-6 bg-slate-200 rounded-l-md border border-r-0 border-slate-300" />

                             {!app ? (
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empty Socket</span>
                             ) : (
                                <motion.div
                                  layoutId={`app-${app.id}`}
                                  onClick={() => handleAction(app.id, "ram", slotIndex)}
                                  className={`absolute inset-0 bg-white border-2 ${app.border} flex flex-col items-center justify-center gap-2 cursor-pointer shadow-md z-10 hover:bg-slate-50 transition-colors`}
                                >
                                   <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]`} />
                                   
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center gap-2">
                                         <Loader2 size={24} className="text-slate-400 animate-spin" />
                                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Paging Out...</span>
                                         <div className="w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
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
                                         <div className={`w-10 h-10 rounded-xl ${app.bg} flex items-center justify-center shrink-0`}>
                                            <app.icon size={20} className={app.color} />
                                         </div>
                                         <span className="font-black text-slate-800 text-xs uppercase tracking-wider">{app.name}</span>
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
              <div className="flex-1 bg-slate-100 rounded-3xl border border-slate-300 p-5 shadow-inner relative flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                       <HardDrive size={14} /> 
                       Pagefile.sys ({driveType})
                    </h3>
                    {driveType === "HDD" ? (
                       <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10}/> Mechanical (Slow)</span>
                    ) : (
                       <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><FastForward size={10}/> NVMe (Fast)</span>
                    )}
                 </div>

                 {/* WRAPPING GRID FOR OVERFLOW */}
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 flex-1 content-start">
                    {/* Render actual swapped items */}
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
                               className={`h-24 bg-white border-2 border-slate-300 rounded-xl p-2 flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group relative overflow-hidden`}
                             >
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
                                <div className={`w-8 h-8 rounded-lg ${app.bg} flex items-center justify-center shrink-0 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all`}>
                                   <app.icon size={16} className={app.color} />
                                </div>
                                <span className="font-bold text-slate-500 text-[10px] uppercase text-center leading-tight">{app.name}</span>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>

                    {/* Render placeholder empty slots to visually represent capacity */}
                    {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50/50">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Swap<br/>Slot</span>
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

print(f"Successfully rebuilt {target_file} with Gamified V5 UI.")
