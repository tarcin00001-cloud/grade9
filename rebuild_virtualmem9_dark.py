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
import { Cpu, HardDrive, Zap, Flame, Film, Globe, Music, Gamepad2, Mail, AlertTriangle, Loader2, ArrowRightLeft, FastForward, Activity } from "lucide-react";

type Phase = "intro" | "ram_fill" | "first_fault" | "thrashing_intro" | "thrashing" | "upgrade_ssd" | "ssd_test" | "success";

const APPS = [
  { id: "video", name: "Video Editor", icon: Film, color: "text-rose-400", bg: "bg-rose-950", border: "border-rose-700", glow: "shadow-[0_0_15px_rgba(225,29,72,0.5)]" },
  { id: "browser", name: "Web Browser", icon: Globe, color: "text-sky-400", bg: "bg-sky-950", border: "border-sky-700", glow: "shadow-[0_0_15px_rgba(14,165,233,0.5)]" },
  { id: "music", name: "Music Player", icon: Music, color: "text-emerald-400", bg: "bg-emerald-950", border: "border-emerald-700", glow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]" },
  { id: "game", name: "3D Engine", icon: Gamepad2, color: "text-purple-400", bg: "bg-purple-950", border: "border-purple-700", glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]" },
  { id: "email", name: "Email Client", icon: Mail, color: "text-amber-400", bg: "bg-amber-950", border: "border-amber-700", glow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]" }
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
  }, [ram.join(","), phase, stats.hits, stats.faults, playSuccess, reportComplete]);

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

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col gap-2 md:gap-3 relative isolate pb-2">
        
        {/* HUD: Cybernetic LED Panel */}
        <div className={`bg-slate-900 rounded-xl border-[3px] p-2 md:p-3 shrink-0 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${stats.cpuTemp > 80 ? 'border-rose-900 bg-rose-950/40' : 'border-slate-800'}`}>
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] border ${stats.cpuTemp > 80 ? 'bg-black border-rose-500/50 text-rose-500 animate-pulse' : 'bg-black border-sky-500/50 text-sky-400'}`}>
                    {stats.cpuTemp > 80 ? <AlertTriangle size={20} /> : <Cpu size={20} />}
                </div>
                <div className="flex-1">
                    <h2 className={`text-[10px] md:text-sm font-black uppercase tracking-widest leading-none mb-1 ${stats.cpuTemp > 80 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {phase === "intro" && "System Standby"}
                      {phase === "ram_fill" && "Mission 1: Fill RAM"}
                      {phase === "first_fault" && "Mission 2: Page Fault"}
                      {phase === "thrashing_intro" && "Warning: Demand Spike"}
                      {phase === "thrashing" && "Mission 3: Thrashing"}
                      {phase === "upgrade_ssd" && "Critical Failure"}
                      {phase === "ssd_test" && "Mission 4: High-Speed Swap"}
                      {phase === "success" && "Optimization Complete"}
                    </h2>
                    <p className={`text-[9px] md:text-xs font-medium leading-tight ${stats.cpuTemp > 80 ? 'text-rose-500/80' : 'text-slate-500'}`}>
                      {phase === "intro" && "Click 'Power On' to boot the OS Memory Manager."}
                      {phase === "ram_fill" && "Mount the 3 queued apps directly into the fast RAM slots."}
                      {phase === "first_fault" && "RAM is full! Eject an app from RAM to the Hard Drive to load the 3D Engine."}
                      {phase === "thrashing_intro" && "The CPU will now rapidly demand apps not in RAM. Prepare for heavy I/O."}
                      {phase === "thrashing" && "Keep up with CPU demands! Swap apps instantly. Watch the temperature!"}
                      {phase === "upgrade_ssd" && "Mechanical HDD bottleneck detected! I/O Wait Lock. Install NVMe."}
                      {phase === "ssd_test" && "Resume operations with high-speed solid-state storage."}
                      {phase === "success" && "Virtual Memory stabilized. Zero thrashing detected."}
                    </p>
                </div>
            </div>
            
            <div className="flex gap-3 md:gap-4 relative z-10 shrink-0 bg-black border border-slate-800 rounded-lg px-3 py-1.5 md:px-5 md:py-2 self-stretch md:self-auto justify-center shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)]">
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">RAM Hits</div>
                  <div className="text-sm md:text-xl font-black text-emerald-500 leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">{stats.hits}</div>
               </div>
               <div className="w-px bg-slate-800" />
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">Page Faults</div>
                  <div className="text-sm md:text-xl font-black text-amber-500 leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">{stats.faults}</div>
               </div>
               <div className="w-px bg-slate-800" />
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">CPU Temp</div>
                  <div className={`text-sm md:text-xl font-black leading-none mt-0.5 ${stats.cpuTemp > 80 ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)] animate-pulse' : 'text-slate-300'}`}>{stats.cpuTemp}°C</div>
               </div>
            </div>
        </div>

        {/* Phase Overlays (Styled to match the dark hardware vibe) */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 rounded-3xl">
             <div className="max-w-md w-full bg-slate-900 border-2 border-sky-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(14,165,233,0.3)] text-center flex flex-col items-center">
                <HardDrive size={40} className="text-sky-400 mb-4" />
                <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest mb-3">Virtual Memory System</h1>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6 font-medium">
                  Your PC only has 3 slots of fast Physical RAM. To run more apps, the Operating System uses the Hard Drive as an overflow "Swap File".
                  <br/><br/>
                  Moving data between RAM and Disk is called <strong>Paging</strong>. Let's see how mechanical disk speeds affect performance.
                </p>
                <button 
                  onClick={() => { playPop(); setPhase("ram_fill"); }}
                  className="w-full py-3 md:py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm md:text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                >
                  Power On System
                </button>
             </div>
          </div>
        )}

        {phase === "thrashing_intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 rounded-3xl">
             <div className="max-w-md w-full bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center flex flex-col items-center">
                <AlertTriangle size={40} className="text-amber-500 mb-4" />
                <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest mb-3">Demand Spike Detected</h1>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6 font-medium">
                  The CPU is about to rapidly request apps that are currently paged out to the mechanical Hard Drive.
                  <br/><br/>
                  You must manually swap them in and out of RAM to keep the CPU fed. Watch out for catastrophic I/O delays!
                </p>
                <button 
                  onClick={startThrashing}
                  className="w-full py-3 md:py-4 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm md:text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  Begin Stress Test
                </button>
             </div>
          </div>
        )}

        {phase === "upgrade_ssd" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80 rounded-3xl">
             <div className="max-w-md w-full bg-slate-900 border-4 border-rose-600 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(225,29,72,0.5)] text-center flex flex-col items-center animate-in zoom-in duration-300">
                <Flame size={40} className="text-rose-500 mb-4 animate-pulse drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
                <h1 className="text-xl md:text-2xl font-black text-rose-500 uppercase tracking-widest mb-3">THRASHING DETECTED</h1>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6 font-medium">
                  Your system spent all its time moving data to the slow mechanical Hard Drive instead of executing programs. This caused a complete I/O Wait Lock!
                  <br/><br/>
                  <strong>Solution:</strong> Upgrade the hardware to an NVMe Solid State Drive (SSD) to eliminate the swap bottleneck.
                </p>
                <button 
                  onClick={applySSDUpgrade}
                  className="w-full py-3 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm md:text-lg uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                >
                  <Zap size={18} /> Install NVMe SSD
                </button>
             </div>
          </div>
        )}

        {/* Main Hardware Chassis */}
        <div className={`flex-1 flex flex-col md:flex-row gap-0 min-h-0 bg-slate-800 rounded-2xl md:rounded-3xl border-4 md:border-[6px] border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all ${phase === 'thrashing' && stats.cpuTemp > 85 ? 'animate-shake pointer-events-none' : ''}`}>
           
           {/* Left/Top: CPU Scheduler (The Diagnostics Column) */}
           <div className="flex flex-row md:flex-col shrink-0 md:w-[240px] lg:w-[280px] bg-slate-900 border-b-4 md:border-b-0 md:border-r-4 border-slate-950 p-3 md:p-4 gap-3 md:gap-4 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 pointer-events-none mix-blend-overlay" />
              
              <div className="w-1/2 md:w-full flex flex-col shrink-0 relative z-10">
                 <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1">
                    <Activity size={14} className="text-sky-500" /> Diagnostics
                 </h3>
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Demand</span>
                 
                 {/* LCD Screen styling for Active Demand */}
                 <div className={`mt-1 h-20 md:h-28 rounded-lg border-[3px] flex items-center justify-center p-2 bg-black shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] transition-colors duration-300 ${activeDemand ? 'border-sky-900/50' : 'border-slate-800'}`}>
                    {activeDemand ? (() => {
                       const app = APPS.find(a => a.id === activeDemand)!;
                       return (
                          <div className="flex flex-col items-center gap-1 md:gap-2 animate-in fade-in zoom-in text-center">
                             <app.icon size={28} className={`${app.color} drop-shadow-[0_0_8px_currentColor]`} />
                             <span className={`font-black uppercase tracking-wider text-[10px] md:text-xs leading-none ${app.color} drop-shadow-[0_0_5px_currentColor]`}>{app.name}</span>
                             <span className="text-[8px] md:text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse mt-1">Awaiting RAM...</span>
                          </div>
                       );
                    })() : (
                       <span className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Idle</span>
                    )}
                 </div>
              </div>

              {/* Data Bus / Queue */}
              <div className="w-1/2 md:w-full flex-1 flex flex-col min-h-0 relative z-10">
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Data Bus Queue</span>
                 
                 <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin bg-black/40 rounded-lg p-2 border-2 border-slate-800 shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)]">
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
                               className={`bg-slate-800 border-l-4 ${app.border} rounded-md p-2 flex items-center gap-2 cursor-pointer hover:bg-slate-700 transition-colors group shadow-md`}
                             >
                                <div className={`w-6 h-6 rounded ${app.bg} flex items-center justify-center shrink-0 border border-slate-700`}>
                                   <app.icon size={12} className={app.color} />
                                </div>
                                <span className="font-bold text-slate-300 text-[9px] md:text-[11px] leading-tight group-hover:text-white transition-colors">{app.name}</span>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>
                    {queue.length === 0 && !activeDemand && (
                       <div className="h-full flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase tracking-widest text-center">
                          Empty
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right/Bottom: The Motherboard (RAM & Disk) */}
           <div className="flex-1 flex flex-col gap-0 min-h-0 relative">
              
              {/* Motherboard Grid Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              {/* RAM Sockets (The Fast Lane) */}
              <div className="shrink-0 p-3 md:p-5 relative overflow-hidden flex flex-col border-b-[3px] md:border-b-4 border-slate-950">
                 <h3 className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2 relative z-10 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]">
                    <Zap size={14} /> Physical RAM
                 </h3>
                 
                 <div className="grid grid-cols-3 gap-2 md:gap-4 relative z-10">
                    {[0, 1, 2].map(slotIndex => {
                       const appId = ram[slotIndex];
                       const app = appId ? APPS.find(a => a.id === appId) : null;
                       
                       return (
                          <div key={slotIndex} className="relative h-16 md:h-24 rounded-lg bg-black border-y-4 md:border-y-[6px] border-slate-900 shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] flex items-center justify-center group overflow-hidden">
                             
                             {/* Socket Notches */}
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 md:w-1.5 h-6 md:h-8 bg-slate-800 rounded-r-md border border-l-0 border-slate-950" />
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 md:w-1.5 h-6 md:h-8 bg-slate-800 rounded-l-md border border-r-0 border-slate-950" />

                             {!app ? (
                                <span className="text-[8px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest text-center">Empty<br/>Socket</span>
                             ) : (
                                <motion.div
                                  layoutId={`app-${app.id}`}
                                  onClick={() => handleAction(app.id, "ram", slotIndex)}
                                  className={`absolute inset-[1px] md:inset-[2px] bg-slate-800 border-2 ${app.border} flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer z-10 hover:brightness-125 transition-all ${app.glow}`}
                                >
                                   {/* Glowing LED on the cartridge */}
                                   <div className={`absolute top-1 right-1 md:top-2 md:right-2 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${app.bg} ${app.glow} border border-slate-700`} />
                                   
                                   {/* Golden connector pins at bottom */}
                                   <div className="absolute bottom-0 left-2 right-2 h-0.5 md:h-1 bg-amber-500/30 flex justify-evenly">
                                      <div className="w-px h-full bg-black/50" />
                                      <div className="w-px h-full bg-black/50" />
                                      <div className="w-px h-full bg-black/50" />
                                      <div className="w-px h-full bg-black/50" />
                                   </div>
                                   
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center justify-center w-full h-full bg-black/90 backdrop-blur-sm z-20 absolute inset-0">
                                         <Loader2 size={16} className={`${driveType === "HDD" ? "text-amber-500" : "text-emerald-500"} animate-spin md:w-6 md:h-6 mb-1`} />
                                         <div className="w-3/4 h-1 md:h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                              initial={{ width: 0 }} 
                                              animate={{ width: "100%" }} 
                                              transition={{ duration: driveType === "HDD" ? 2.5 : 0.3 }}
                                              className={`h-full ${driveType === "HDD" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"}`} 
                                            />
                                         </div>
                                      </div>
                                   ) : (
                                      <>
                                         <div className={`w-5 h-5 md:w-8 md:h-8 rounded md:rounded-lg ${app.bg} flex items-center justify-center shrink-0 border border-slate-700`}>
                                            <app.icon size={14} className={app.color} />
                                         </div>
                                         <span className={`font-black text-[8px] md:text-[10px] uppercase tracking-wider leading-tight text-center px-1 ${app.color}`}>{app.name}</span>
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
              <div className="flex-1 bg-slate-900/60 p-3 md:p-5 relative flex flex-col min-h-0 shadow-[inset_0_20px_30px_rgba(0,0,0,0.3)]">
                 <div className="flex flex-wrap items-center justify-between gap-2 mb-2 md:mb-4 shrink-0">
                    <h3 className="text-[10px] md:text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 md:gap-2 drop-shadow-[0_0_5px_rgba(99,102,241,0.6)]">
                       <HardDrive size={14} /> 
                       Pagefile.sys
                    </h3>
                    {driveType === "HDD" ? (
                       <span className="text-[8px] md:text-[9px] font-black bg-black border border-slate-700 text-slate-400 px-2 py-0.5 md:px-3 md:py-1 rounded-sm uppercase tracking-widest flex items-center gap-1 shadow-inner"><AlertTriangle size={10} className="text-amber-500"/> Mechanical Drive (Slow)</span>
                    ) : (
                       <span className="text-[8px] md:text-[9px] font-black bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 md:px-3 md:py-1 rounded-sm uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]"><FastForward size={10}/> NVMe Array (Fast)</span>
                    )}
                 </div>

                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 flex-1 content-start overflow-y-auto pr-1 pb-1 scrollbar-thin">
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
                               className={`h-16 md:h-24 bg-slate-800 border-2 ${app.border} rounded-lg p-1.5 md:p-2 flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer hover:brightness-125 transition-all group relative overflow-hidden shadow-lg`}
                             >
                                {/* Dimmed LED */}
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-600 transition-colors" />
                                
                                <div className={`w-5 h-5 md:w-8 md:h-8 rounded-md md:rounded-lg ${app.bg} flex items-center justify-center shrink-0 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all border border-slate-700`}>
                                   <app.icon size={14} className={app.color} />
                                </div>
                                <span className="font-bold text-slate-400 text-[8px] md:text-[9px] uppercase text-center leading-tight px-0.5">{app.name}</span>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>

                    {/* Industrial Recessed Empty Bays */}
                    {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="h-16 md:h-24 border-2 border-slate-800 rounded-lg flex items-center justify-center bg-black shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)]">
                          <span className="text-[8px] md:text-[9px] font-black text-slate-700 uppercase tracking-widest text-center">Drive<br/>Bay</span>
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

print(f"Successfully rebuilt {target_file} with Dark Skeuomorphic UI.")
