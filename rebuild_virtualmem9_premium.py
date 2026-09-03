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
import { Cpu, HardDrive, Zap, Flame, Film, Globe, Music, Gamepad2, Mail, AlertTriangle, Loader2, FastForward, Activity } from "lucide-react";

type Phase = "intro" | "ram_fill" | "first_fault" | "thrashing_intro" | "thrashing" | "upgrade_ssd" | "ssd_test" | "success";

const APPS = [
  { id: "video", name: "Video Editor", icon: Film, color: "text-rose-400", bgDot: "bg-rose-400", glowClass: "shadow-[0_0_20px_rgba(225,29,72,0.4)]", borderHigh: "border-rose-400/50" },
  { id: "browser", name: "Web Browser", icon: Globe, color: "text-sky-400", bgDot: "bg-sky-400", glowClass: "shadow-[0_0_20px_rgba(14,165,233,0.4)]", borderHigh: "border-sky-400/50" },
  { id: "music", name: "Music Player", icon: Music, color: "text-emerald-400", bgDot: "bg-emerald-400", glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.4)]", borderHigh: "border-emerald-400/50" },
  { id: "game", name: "3D Engine", icon: Gamepad2, color: "text-purple-400", bgDot: "bg-purple-400", glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.4)]", borderHigh: "border-purple-400/50" },
  { id: "email", name: "Email Client", icon: Mail, color: "text-amber-400", bgDot: "bg-amber-400", glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.4)]", borderHigh: "border-amber-400/50" }
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

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto flex flex-col gap-3 relative isolate pb-2">
        
        {/* PREMIUM HUD */}
        <div className={`bg-[#0f1115] rounded-xl border border-white/10 p-2 md:p-3 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-colors ${stats.cpuTemp > 80 ? 'border-rose-500/50 bg-rose-950/20' : ''}`}>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] ${stats.cpuTemp > 80 ? 'bg-[#1a0505] border-rose-500/30 text-rose-500 animate-pulse' : 'bg-[#050a10] border-sky-500/30 text-sky-400'}`}>
                    {stats.cpuTemp > 80 ? <AlertTriangle size={20} /> : <Cpu size={20} />}
                </div>
                <div className="flex-1">
                    <h2 className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${stats.cpuTemp > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {phase === "intro" && "System Standby"}
                      {phase === "ram_fill" && "Mission 1: Fill RAM"}
                      {phase === "first_fault" && "Mission 2: Page Fault"}
                      {phase === "thrashing_intro" && "Warning: Demand Spike"}
                      {phase === "thrashing" && "Mission 3: Thrashing"}
                      {phase === "upgrade_ssd" && "Critical Failure"}
                      {phase === "ssd_test" && "Mission 4: High-Speed Swap"}
                      {phase === "success" && "Optimization Complete"}
                    </h2>
                    <p className={`text-[10px] font-medium leading-tight ${stats.cpuTemp > 80 ? 'text-rose-500/80' : 'text-slate-400'}`}>
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
            
            <div className="flex gap-4 relative z-10 shrink-0 bg-[#050505] border border-white/5 rounded-lg px-5 py-2 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">RAM Hits</div>
                  <div className="text-xl font-black text-emerald-400 leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">{stats.hits}</div>
               </div>
               <div className="w-px bg-white/10" />
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Page Faults</div>
                  <div className="text-xl font-black text-amber-400 leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">{stats.faults}</div>
               </div>
               <div className="w-px bg-white/10" />
               <div className="text-center flex flex-col justify-center">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">CPU Temp</div>
                  <div className={`text-xl font-black leading-none mt-0.5 ${stats.cpuTemp > 80 ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse' : 'text-slate-300'}`}>{stats.cpuTemp}°C</div>
               </div>
            </div>
        </div>

        {/* Overlays */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 rounded-2xl">
             <div className="max-w-md w-full bg-[#12141a] border border-sky-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(14,165,233,0.15)] text-center">
                <HardDrive size={40} className="text-sky-400 mb-4 mx-auto" />
                <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-3">Virtual Memory System</h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Your PC only has 3 slots of fast Physical RAM. To run more apps, the Operating System uses the Hard Drive as an overflow "Swap File".
                  <br/><br/>
                  Moving data between RAM and Disk is called <strong>Paging</strong>. Let's see how mechanical disk speeds affect performance.
                </p>
                <button onClick={() => { playPop(); setPhase("ram_fill"); }} className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  Power On System
                </button>
             </div>
          </div>
        )}

        {phase === "thrashing_intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 rounded-2xl">
             <div className="max-w-md w-full bg-[#12141a] border border-amber-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-center">
                <AlertTriangle size={40} className="text-amber-500 mb-4 mx-auto" />
                <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-3">Demand Spike Detected</h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  The CPU is about to rapidly request apps that are currently paged out to the mechanical Hard Drive.
                  <br/><br/>
                  You must manually swap them in and out of RAM to keep the CPU fed. Watch out for catastrophic I/O delays!
                </p>
                <button onClick={startThrashing} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  Begin Stress Test
                </button>
             </div>
          </div>
        )}

        {phase === "upgrade_ssd" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80 rounded-2xl">
             <div className="max-w-md w-full bg-[#12141a] border border-rose-500/50 rounded-2xl p-8 shadow-[0_0_60px_rgba(225,29,72,0.2)] text-center animate-in zoom-in duration-300">
                <Flame size={40} className="text-rose-500 mb-4 mx-auto animate-pulse drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
                <h1 className="text-2xl font-black text-rose-500 uppercase tracking-widest mb-3">THRASHING DETECTED</h1>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Your system spent all its time moving data to the slow mechanical Hard Drive instead of executing programs. This caused a complete I/O Wait Lock!
                  <br/><br/>
                  <strong>Solution:</strong> Upgrade the hardware to an NVMe Solid State Drive (SSD) to eliminate the swap bottleneck.
                </p>
                <button onClick={applySSDUpgrade} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2">
                  <Zap size={18} /> Install NVMe SSD
                </button>
             </div>
          </div>
        )}

        {/* PREMIUM MAIN CHASSIS */}
        <div className={`flex-1 flex flex-col md:flex-row min-h-0 bg-[#0a0c10] rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all ${phase === 'thrashing' && stats.cpuTemp > 85 ? 'animate-shake pointer-events-none' : ''}`}>
           
           {/* Diagnostics Column */}
           <div className="flex flex-col shrink-0 w-full md:w-[280px] bg-[#12141a] border-b md:border-b-0 md:border-r border-white/5 p-5 relative z-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                 <Activity size={14} className="text-sky-500" /> Diagnostics
              </h3>
              
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 mt-2">Active Demand</span>
              {/* Premium LCD Panel */}
              <div className="h-28 rounded-lg bg-[#050505] border border-white/5 shadow-[inset_0_4px_20px_rgba(0,0,0,1)] flex items-center justify-center p-3 relative overflow-hidden">
                 {/* LCD subtle scanline */}
                 <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20" />
                 
                 {activeDemand ? (() => {
                    const app = APPS.find(a => a.id === activeDemand)!;
                    return (
                       <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in text-center relative z-10">
                          <app.icon size={26} className={`${app.color} drop-shadow-[0_0_10px_currentColor]`} />
                          <span className={`font-black uppercase tracking-[0.2em] text-[10px] leading-none ${app.color} drop-shadow-[0_0_8px_currentColor]`}>{app.name}</span>
                          <span className="text-[8px] font-bold text-rose-500/80 uppercase tracking-widest animate-pulse mt-1">Awaiting RAM</span>
                       </div>
                    );
                 })() : (
                    <span className="text-slate-600/50 font-bold uppercase tracking-[0.2em] text-[10px] relative z-10">System Idle</span>
                 )}
              </div>

              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">Data Bus Queue</span>
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
                            className={`bg-gradient-to-r from-[#1a1c23] to-[#12141a] border border-white/5 rounded-lg p-2.5 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-all group`}
                          >
                             <div className={`w-7 h-7 rounded bg-[#050505] shadow-inner border border-white/5 flex items-center justify-center shrink-0`}>
                                <app.icon size={12} className={app.color} />
                             </div>
                             <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider group-hover:text-white transition-colors">{app.name}</span>
                          </motion.div>
                       );
                    })}
                 </AnimatePresence>
                 {queue.length === 0 && !activeDemand && (
                    <div className="h-full flex items-center justify-center text-slate-600/50 font-bold text-[10px] uppercase tracking-[0.2em]">
                       Empty
                    </div>
                 )}
              </div>
           </div>

           {/* Motherboard Layout */}
           <div className="flex-1 flex flex-col min-h-0 relative bg-[#0a0c10]">
              
              {/* RAM Section */}
              <div className="shrink-0 p-5 border-b border-white/5 relative z-10">
                 <h3 className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap size={14} /> Physical RAM
                 </h3>
                 
                 <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map(slotIndex => {
                       const appId = ram[slotIndex];
                       const app = appId ? APPS.find(a => a.id === appId) : null;
                       
                       return (
                          <div key={slotIndex} className="relative h-24 rounded-lg bg-[#030305] shadow-[inset_0_10px_20px_rgba(0,0,0,1),_0_1px_0_rgba(255,255,255,0.05)] border-x border-t border-black flex items-center justify-center overflow-hidden">
                             
                             {/* Fake Copper Pins in the empty socket */}
                             <div className="absolute bottom-0 w-full h-1.5 flex justify-center gap-0.5 opacity-30">
                                {[...Array(14)].map((_, i) => <div key={i} className="w-[2px] h-full bg-amber-600 rounded-t-sm" />)}
                             </div>

                             {!app ? (
                                <span className="text-[9px] font-black text-white/5 uppercase tracking-widest">Socket {slotIndex+1}</span>
                             ) : (
                                <motion.div
                                  layoutId={`app-${app.id}`}
                                  onClick={() => handleAction(app.id, "ram", slotIndex)}
                                  className={`absolute inset-[2px] rounded bg-gradient-to-b from-[#1e222a] to-[#0f1115] border border-white/5 ${app.borderHigh} flex flex-col items-center justify-center cursor-pointer z-10 transition-all ${app.glowClass} hover:brightness-110`}
                                >
                                   <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${app.bgDot} shadow-[0_0_8px_currentColor]`} />
                                   
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center justify-center w-full h-full bg-[#050505]/90 backdrop-blur-sm rounded absolute inset-0 z-20">
                                         <Loader2 size={16} className={`${driveType === "HDD" ? "text-amber-500" : "text-emerald-500"} animate-spin mb-1`} />
                                         <div className="w-3/4 h-1 bg-black rounded-full overflow-hidden shadow-inner">
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
                                         <div className={`w-8 h-8 rounded bg-[#050505] flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border border-white/5`}>
                                            <app.icon size={14} className={app.color} />
                                         </div>
                                         <span className={`mt-1.5 font-black text-[9px] uppercase tracking-widest ${app.color}`}>{app.name}</span>
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
              <div className="flex-1 p-5 relative flex flex-col min-h-0 bg-[#07080a] shadow-[inset_0_20px_30px_rgba(0,0,0,0.6)]">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest flex items-center gap-2">
                       <HardDrive size={14} /> 
                       Pagefile.sys
                    </h3>
                    {driveType === "HDD" ? (
                       <span className="text-[8px] font-black bg-[#1a0505] border border-rose-900/50 text-rose-500 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10}/> Mechanical Drive</span>
                    ) : (
                       <span className="text-[8px] font-black bg-[#051a10] border border-emerald-900/50 text-emerald-500 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.1)]"><FastForward size={10}/> NVMe Array</span>
                    )}
                 </div>

                 <div className="grid grid-cols-4 md:grid-cols-5 gap-3 flex-1 content-start overflow-y-auto pr-1 pb-1 scrollbar-thin">
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
                               className={`h-24 bg-gradient-to-b from-[#1e222a] to-[#0f1115] border border-white/5 ${app.borderHigh} rounded-lg p-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:brightness-125 transition-all group relative shadow-lg grayscale opacity-60 hover:grayscale-0 hover:opacity-100`}
                             >
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-600 transition-colors group-hover:bg-slate-300" />
                                <div className={`w-8 h-8 rounded bg-[#050505] flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border border-white/5`}>
                                   <app.icon size={14} className={app.color} />
                                </div>
                                <span className="font-bold text-slate-400 text-[8px] uppercase tracking-wider text-center group-hover:text-white transition-colors">{app.name}</span>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>

                    {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="h-24 rounded-lg bg-[#050508] border border-black shadow-[inset_0_5px_15px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.03)] flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum-dark.png')] opacity-10" />
                          <span className="text-[8px] font-black text-white/5 uppercase tracking-[0.2em] text-center">Drive<br/>Bay</span>
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

print(f"Successfully rebuilt {target_file} with PREMIUM UI.")
