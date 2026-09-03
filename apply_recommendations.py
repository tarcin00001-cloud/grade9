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
  { id: "video", name: "Video Editor", icon: Film, color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30" },
  { id: "browser", name: "Web Browser", icon: Globe, color: "text-sky-400", bgColor: "bg-sky-500/10", borderColor: "border-sky-500/30" },
  { id: "music", name: "Music Player", icon: Music, color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30" },
  { id: "game", name: "3D Engine", icon: Gamepad2, color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  { id: "email", name: "Email Client", icon: Mail, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" }
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
    if (phase === "thrashing" && stats.cpuTemp >= 85) {
       const timer = setTimeout(() => {
          setPhase("upgrade_ssd");
       }, 1500); // 1.5s of dramatic shaking before interrupting
       return () => clearTimeout(timer);
    }
  }, [stats.cpuTemp, phase]);

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
        
        {/* BRIGHT HUD - Reverted to match Ocean theme header legibility */}
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
                      {phase === "first_fault" && "RAM is full! Click an app in RAM to eject it to the Disk, then click the 3D Engine in the Queue to load it."}
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
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 rounded-3xl">
             <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center">
                <HardDrive size={48} className="text-sky-600 mb-6 mx-auto" />
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">Virtual Memory System</h1>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                  Your PC only has 3 slots of fast Physical RAM. To run more apps, the Operating System uses the Hard Drive as an overflow "Swap File".
                  <br/><br/>
                  Moving data between RAM and Disk is called <strong className="text-slate-700">Paging</strong>. Let's see how mechanical disk speeds affect performance.
                </p>
                <button onClick={() => { playPop(); setPhase("ram_fill"); }} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                  Power On System
                </button>
             </div>
          </div>
        )}

        {phase === "thrashing_intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 rounded-3xl">
             <div className="max-w-md w-full bg-white border border-amber-200 rounded-3xl p-8 shadow-2xl text-center">
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
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-rose-950/60 rounded-3xl">
             <div className="max-w-md w-full bg-slate-900 border border-rose-500/50 rounded-3xl p-8 shadow-[0_0_60px_rgba(244,63,94,0.3)] text-center animate-in zoom-in duration-300">
                <Flame size={48} className="text-rose-500 mb-6 mx-auto animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
                <h1 className="text-2xl font-black text-rose-500 uppercase tracking-widest mb-4">THRASHING DETECTED</h1>
                <p className="text-slate-300 font-medium text-sm leading-relaxed mb-8">
                  Your system spent all its time moving data to the slow mechanical Hard Drive instead of executing programs. This caused a complete I/O Wait Lock!
                  <br/><br/>
                  <strong className="text-emerald-400">Solution:</strong> Upgrade the hardware to an NVMe Solid State Drive (SSD) to eliminate the swap bottleneck.
                </p>
                <button onClick={applySSDUpgrade} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(5,150,105,0.4)] flex items-center justify-center gap-2">
                  <Zap size={18} /> Install NVMe SSD
                </button>
             </div>
          </div>
        )}

        {/* PREMIUM SKEUOMORPHIC HARDWARE CHASSIS */}
        <div className={`flex-1 flex flex-col md:flex-row min-h-0 bg-slate-900 rounded-3xl border-[6px] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all ${phase === 'thrashing' && stats.cpuTemp > 85 ? 'animate-shake pointer-events-none border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.2)]' : ''}`}>
           
           {/* Diagnostics Column (The Casing) */}
           <div className="flex flex-col shrink-0 w-full bg-slate-900 border-b-4 md:border-b-0 md:border-r-4 border-slate-950 p-5 relative z-10" style={{ maxWidth: "100%", flexBasis: "288px" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative">
                 <Activity size={14} className="text-cyan-500" /> SYSTEM.DIAGNOSTICS
              </h3>
              
              {/* LCD Panel */}
              <div className="h-28 rounded-md bg-emerald-950/80 border-[4px] border-slate-950 shadow-[inset_0_4px_20px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono mt-2 mb-6">
                 {/* Fake Scanlines via repeating linear gradient */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none" />
                 
                 {activeDemand ? (() => {
                    const app = APPS.find(a => a.id === activeDemand)!;
                    return (
                       <div className="flex flex-col items-center gap-1 animate-in fade-in zoom-in text-center relative z-10">
                          <span className="font-bold uppercase tracking-widest text-sm text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] truncate w-full max-w-[180px]">{app.name}</span>
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-pulse mt-1 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]">&gt; REQ_RAM</span>
                       </div>
                    );
                 })() : (
                    <span className="text-emerald-900/60 font-black uppercase tracking-widest text-xs">NO SIGNAL</span>
                 )}
              </div>

              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 relative flex items-center justify-between">
                 DATA BUS QUEUE
                 <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                    <div className="w-1 h-1 rounded-full bg-cyan-500/30" />
                 </div>
              </h3>
              
              <div className="flex flex-row flex-wrap gap-3 relative">
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
                            className={`bg-slate-700 border-t-2 border-slate-500 border-x border-slate-600 border-b-4 border-b-slate-950 shadow-lg rounded-md p-2 pr-3 flex items-center gap-2 cursor-pointer hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex-1 min-w-[120px] max-w-[200px] group`}
                          >
                             <div className={`w-6 h-6 rounded-sm bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner`}>
                                <app.icon size={12} className={app.color} />
                             </div>
                             <span className="font-bold text-slate-200 text-[9px] uppercase tracking-wider truncate font-mono">{app.name}</span>
                          </motion.div>
                       );
                    })}
                 </AnimatePresence>
                 {queue.length === 0 && !activeDemand && (
                    <div className="h-10 w-full flex items-center justify-center text-slate-700 font-bold text-[10px] uppercase tracking-widest font-mono">
                       QUEUE_EMPTY
                    </div>
                 )}
              </div>
           </div>

           {/* Motherboard PCB (Teal/Emerald Tinted) */}
           <div className="flex-1 flex flex-col min-h-0 relative bg-teal-950/20">
              {/* Copper Traces */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgtdjJtMC0ySDh2MmgxMnptMC00SDh2MmgxMnoiIGZpbGw9IiMwZjM4M2MiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] pointer-events-none opacity-40" />
              
              {/* RAM Section */}
              <div className="shrink-0 p-6 border-b-4 border-slate-900/50 relative z-10">
                 <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-5 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
                    <Zap size={14} /> PHYSICAL.RAM_ARRAY
                 </h3>
                 
                 <div className="grid grid-cols-3 gap-5">
                    {[0, 1, 2].map(slotIndex => {
                       const appId = ram[slotIndex];
                       const app = appId ? APPS.find(a => a.id === appId) : null;
                       
                       return (
                          <div key={slotIndex} className="relative h-28 rounded-lg bg-slate-950 border-t-4 border-l-4 border-slate-900 border-b border-r border-slate-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-hidden">
                             
                             {/* Hardware LED Indicator */}
                             <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full z-20 ${app ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]' : 'bg-rose-950 border border-rose-900 shadow-[inset_0_1px_2px_rgba(0,0,0,1)]'}`} />

                             {!app ? (
                                <span className="text-[10px] font-bold text-slate-800/80 uppercase tracking-widest relative z-10 font-mono">SLOT_{slotIndex}</span>
                             ) : (
                                <motion.div
                                  layoutId={`app-${app.id}`}
                                  onClick={() => handleAction(app.id, "ram", slotIndex)}
                                  className={`absolute inset-[8px] rounded-sm bg-slate-700 border-t border-slate-500 border-x border-slate-600 border-b-4 border-b-slate-950 shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center cursor-pointer z-10 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all`}
                                >
                                   {isSwapping && swapTarget === app.id ? (
                                      <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900/90 backdrop-blur-sm rounded-sm absolute inset-0 z-20">
                                         <Loader2 size={16} className={`${driveType === "HDD" ? "text-amber-500" : "text-emerald-500"} animate-spin mb-2`} />
                                         <div className="w-2/3 h-1 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800">
                                            <motion.div 
                                              initial={{ width: 0 }} 
                                              animate={{ width: "100%" }} 
                                              transition={{ duration: driveType === "HDD" ? 2.5 : 0.3 }}
                                              className={`h-full shadow-[0_0_8px_currentColor] ${driveType === "HDD" ? "bg-amber-500" : "bg-emerald-500"}`} 
                                            />
                                         </div>
                                      </div>
                                   ) : (
                                      <>
                                         <div className={`w-8 h-8 rounded-sm ${app.bgColor} flex items-center justify-center border ${app.borderColor}`}>
                                            <app.icon size={16} className={app.color} style={{ filter: 'drop-shadow(0 0 5px currentColor)' }} />
                                         </div>
                                         <span className={`mt-2 font-bold text-[9px] uppercase tracking-widest font-mono ${app.color}`}>{app.name}</span>
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
              <div className="flex-1 p-6 relative flex flex-col min-h-0 bg-transparent">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">
                       <HardDrive size={14} /> 
                       PAGEFILE.SYS
                    </h3>
                    {driveType === "HDD" ? (
                       <span className="text-[9px] font-black bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.1)]"><AlertTriangle size={12}/> MECH.DRIVE</span>
                    ) : (
                       <span className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.1)]"><FastForward size={12}/> NVME_ARRAY</span>
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
                               className={`h-24 bg-slate-800 shadow-[0_5px_15px_rgba(0,0,0,0.4)] border-t border-slate-600 border-x border-slate-700 border-b-4 border-slate-950 rounded-md p-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all group relative`}
                             >
                                <div className={`w-8 h-8 rounded-sm ${app.bgColor} flex items-center justify-center border ${app.borderColor}`}>
                                   <app.icon size={16} className={app.color} style={{ filter: 'drop-shadow(0 0 5px currentColor)' }} />
                                </div>
                                <span className={`font-bold text-[9px] uppercase tracking-wider text-center font-mono ${app.color}`}>{app.name}</span>
                             </motion.div>
                          );
                       })}
                    </AnimatePresence>

                    {Array.from({ length: Math.max(0, 5 - disk.length) }).map((_, i) => (
                       <div key={`empty-${i}`} className="h-24 rounded-md bg-slate-950/40 border-2 border-dashed border-slate-900/50 flex flex-col items-center justify-center relative overflow-hidden opacity-60">
                          <div className="w-1 h-1 bg-slate-800 rounded-full mb-2" />
                          <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest text-center font-mono">DRIVE_BAY</span>
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

print(f"Successfully applied UI/UX recommendations to {target_file}.")
