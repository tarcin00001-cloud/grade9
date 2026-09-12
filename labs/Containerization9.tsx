"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, Server, Cpu, HardDrive, AlertTriangle, Box, Zap, Rocket, CheckCircle2 } from "lucide-react";

type Phase = "STEP1_LEARN" | "STEP2_TRY" | "STEP3_FAIL" | "STEP4_UNDERSTAND" | "STEP5_IMPROVE" | "STEP6_COMPLETE" | "OUTCOME";

const TIMER_DURATION_SECONDS = 5 * 60;

export default function Containerization9() {
  const { reportComplete: _reportComplete } = useLMSBridge("containerization9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [phase, setPhase] = useState<Phase>("STEP1_LEARN");
  const [vms, setVms] = useState<number>(0);
  const [containers, setContainers] = useState<number>(0);
  const [isShaking, setIsShaking] = useState(false);

  const reportComplete = useCallback(() => {
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  useEffect(() => {
    if (timedOut || phase === "OUTCOME") {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timedOut, phase]);

  useEffect(() => {
    if (timedOut) _reportComplete({ points: 0 });
  }, [timedOut, _reportComplete]);

  const handleDeployVM = () => {
    if (phase !== "STEP1_LEARN" && phase !== "STEP2_TRY") return;
    
    const newVms = vms + 1;
    setVms(newVms);
    
    if (newVms === 1) {
      playPop();
      setPhase("STEP2_TRY");
    } else if (newVms === 2) {
      playPop();
    } else if (newVms >= 3) {
      playError();
      setIsShaking(true);
      setPhase("STEP3_FAIL");
      setTimeout(() => setIsShaking(false), 800);
    }
  };

  const handleUnderstand = () => {
    if (phase !== "STEP3_FAIL") return;
    playPop();
    setPhase("STEP4_UNDERSTAND");
  };

  const handleSwitchToDocker = () => {
    if (phase !== "STEP4_UNDERSTAND") return;
    playZap();
    setVms(0);
    setPhase("STEP5_IMPROVE");
  };

  const handleDeployContainer = () => {
    if (phase !== "STEP5_IMPROVE" && phase !== "STEP6_COMPLETE") return;
    
    const newContainers = containers + 1;
    setContainers(newContainers);
    playPop();
    
    if (newContainers === 1) {
      setPhase("STEP6_COMPLETE");
    } else if (newContainers >= 3) {
      playSuccess();
      setPhase("OUTCOME");
      setTimeout(reportComplete, 1500);
    }
  };

  const handleRapidFire = () => {
    if (phase !== "OUTCOME" || containers >= 24) return;
    playPop();
    setContainers(prev => Math.min(prev + 1, 24));
  };

  const resetState = () => {
    setPhase("STEP1_LEARN");
    setVms(0);
    setContainers(0);
    setIsShaking(false);
    setSecondsLeft(TIMER_DURATION_SECONDS);
    setTimedOut(false);
  };

  const getInstruction = () => {
    switch (phase) {
      case "STEP1_LEARN": return "Learn: We need to scale our web app. Click 'Deploy VM' to spin up your first instance.";
      case "STEP2_TRY": return "Try: The VM deployed, but the Guest OS takes up 2GB of RAM just to run a 100MB app! Deploy 2 more VMs to handle traffic.";
      case "STEP3_FAIL": return "Fail Safely: SERVER CRASH! The physical server ran out of memory (RAM) because every app required its own bulky Operating System.";
      case "STEP4_UNDERSTAND": return "Understand Why: Look at the stack. 95% of your server capacity is wasted on duplicating the Guest OS.";
      case "STEP5_IMPROVE": return "Improve: Let's remove the bloat. Swap the Hypervisor for a Container Engine (Docker) which shares the Host OS.";
      case "STEP6_COMPLETE": return "Complete: Deploy 3 Containers. Notice how they only package the app itself, using a fraction of the RAM.";
      case "OUTCOME": return "Outcome: Success! You achieved massive scalability. Try the Rapid Fire button to see how many containers fit!";
    }
  };

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  // Resource Math
  // VM: 32% RAM per VM. Max 3 crashes it (96%).
  // Container: 3% RAM per container. 24 containers = 72%.
  const ramUsagePercent = Math.min((vms * 33.3) + (containers * 3.5), 100);
  const cpuUsagePercent = Math.min((vms * 25) + (containers * 2), 100);
  
  const isCrashed = phase === "STEP3_FAIL" || phase === "STEP4_UNDERSTAND";
  const isDockerMode = phase === "STEP5_IMPROVE" || phase === "STEP6_COMPLETE" || phase === "OUTCOME";

  return (
    <LabShell
      compact
      navExtra={
        phase !== "OUTCOME" && (
          <div className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold border shadow-sm ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 30 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-slate-200 text-slate-600"
          }`}>
            <Timer size={14} strokeWidth={2.5} className={secondsLeft <= 60 && !timedOut ? "animate-spin" : ""} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      }
      labId="containerization9"
      theme="ocean"
      title="VMs vs Docker Containers"
      instruction={getInstruction()}
      onReset={resetState}
    >
      <Celebration isActive={containers >= 24} message="Server Maxed Out! 24 Containers!" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake-hard {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px) rotate(-1deg); }
          20%, 40%, 60%, 80% { transform: translateX(8px) rotate(1deg); }
        }
        .animate-shake-hard { animation: shake-hard 0.6s cubic-bezier(.36,.07,.19,.97) both; }
        
        .diagonal-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.1) 10px,
            transparent 10px,
            transparent 20px
          );
        }
      `}} />

      
      <div className="w-full bg-white/90 backdrop-blur rounded-xl p-3 mb-3 border border-slate-200 shadow-sm text-sm font-bold text-slate-700 flex items-center justify-center text-center z-20 shrink-0">
        {getInstruction()}
      </div>

      <div className="w-full flex flex-col lg:flex-row flex-1 min-h-0 gap-4 pt-1">
        
        {/* ── LEFT: Logistics Console ── */}
        <div className="lg:w-[380px] shrink-0 flex flex-col gap-4">
          
          {/* Resource Meters */}
          <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${
            isCrashed ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]" : "border-slate-200"
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Server className={`w-5 h-5 ${isCrashed ? "text-rose-600 animate-pulse" : "text-slate-400"}`} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Server Capacity</span>
              {isCrashed && <span className="ml-auto text-xs font-bold text-rose-600 animate-pulse flex items-center gap-1"><AlertTriangle size={14}/> CRITICAL</span>}
            </div>

            <div className="flex flex-col gap-5">
              {/* RAM Meter */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><HardDrive size={16}/> RAM Usage</span>
                  <span className={`text-lg font-black ${isCrashed ? "text-rose-600" : "text-indigo-600"}`}>{ramUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div 
                    className={`h-full transition-colors ${
                      isCrashed ? "bg-rose-500" : ramUsagePercent > 75 ? "bg-amber-400" : "bg-indigo-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${ramUsagePercent}%` }}
                    transition={{ type: "spring", stiffness: 60 }}
                  />
                </div>
              </div>

              {/* CPU Meter */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Cpu size={16}/> CPU Usage</span>
                  <span className={`text-lg font-black ${isCrashed ? "text-rose-600" : "text-emerald-600"}`}>{cpuUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div 
                    className={`h-full transition-colors ${
                      isCrashed ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${cpuUsagePercent}%` }}
                    transition={{ type: "spring", stiffness: 60 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex-1 flex flex-col gap-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              Deployment Controls
            </h3>

            {(phase === "STEP1_LEARN" || phase === "STEP2_TRY") && (
              <button 
                onClick={handleDeployVM}
                className="w-full py-4 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-black transition-all flex justify-between items-center shadow-[0_4px_0_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none"
              >
                <span className="flex items-center gap-2">
                  <Box size={18} className="text-amber-400"/> 
                  Deploy Virtual Machine
                </span>
                <span className="bg-slate-700 px-2 py-1 rounded text-xs">{vms}/3</span>
              </button>
            )}

            {phase === "STEP3_FAIL" && (
              <button 
                onClick={handleUnderstand}
                className="w-full py-4 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-black transition-all flex justify-between items-center shadow-[0_4px_0_rgba(159,18,57,1)] active:translate-y-1 active:shadow-none animate-pulse"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle size={18} /> 
                  Understand Why
                </span>
              </button>
            )}

            {phase === "STEP4_UNDERSTAND" && (
              <button 
                onClick={handleSwitchToDocker}
                className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black transition-all flex justify-between items-center shadow-[0_4px_0_rgba(67,56,202,1)] active:translate-y-1 active:shadow-none"
              >
                <span className="flex items-center gap-2">
                  <Zap size={18} className="text-teal-300"/> 
                  Switch to Containers
                </span>
              </button>
            )}

            {(phase === "STEP5_IMPROVE" || phase === "STEP6_COMPLETE") && (
              <button 
                onClick={handleDeployContainer}
                className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black transition-all flex justify-between items-center shadow-[0_4px_0_rgba(4,120,87,1)] active:translate-y-1 active:shadow-none"
              >
                <span className="flex items-center gap-2">
                  <Box size={18} className="text-emerald-100"/> 
                  Deploy Container
                </span>
                <span className="bg-emerald-700 px-2 py-1 rounded text-xs">{containers}/3</span>
              </button>
            )}

            {phase === "OUTCOME" && (
              <button 
                onClick={handleRapidFire}
                disabled={containers >= 24}
                className="w-full py-4 px-4 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-sm font-black transition-all flex justify-between items-center shadow-[0_4px_0_rgba(15,118,110,1)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-1"
              >
                <span className="flex items-center gap-2">
                  <Rocket size={18} className="text-white"/> 
                  Rapid Fire Deploy!
                </span>
                <span className="bg-teal-600 px-2 py-1 rounded text-xs">{containers}/24</span>
              </button>
            )}
            
            <div className="mt-auto p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <h4 className="text-xs font-bold text-slate-700 mb-1">Architecture Metrics</h4>
              <ul className="text-xs text-slate-500 space-y-1 font-medium">
                <li className="flex justify-between"><span>Guest OS Bloat:</span> <span className="text-amber-600 font-bold">{isDockerMode ? "0 GB" : `${vms * 2} GB`}</span></li>
                <li className="flex justify-between"><span>App Payload:</span> <span className="text-indigo-600 font-bold">{isDockerMode ? `${containers * 100} MB` : `${vms * 100} MB`}</span></li>
                <li className="flex justify-between"><span>Boot Time:</span> <span className="text-slate-700 font-bold">{isDockerMode ? "< 1 second" : "45 seconds"}</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Server Rack (Stacking Canvas) ── */}
        <div className={`flex-1 bg-slate-100 rounded-2xl border-4 ${isCrashed ? "border-rose-400 bg-rose-50" : "border-slate-300"} shadow-inner overflow-hidden relative flex flex-col ${isShaking ? "animate-shake-hard" : ""}`}>
          
          {/* Faint Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          {isCrashed && (
            <div className="absolute inset-0 bg-rose-500/10 pointer-events-none z-0 diagonal-stripes animate-pulse" />
          )}

          {/* Top Status Bar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Rack 01-A 
              {isCrashed && <span className="text-rose-600 animate-pulse">OVERLOAD</span>}
              {phase === "OUTCOME" && <span className="text-emerald-500">OPTIMIZED</span>}
            </div>
          </div>

          {/* Stacking Area */}
          <div className="flex-1 flex flex-col-reverse items-center justify-start pb-6 px-6 relative z-10 overflow-hidden gap-1">
            
            {/* The Foundation (Always Present) */}
            <div className="w-full max-w-xl shrink-0 flex flex-col gap-1">
              {/* Dynamic Engine Layer */}
              <AnimatePresence mode="wait">
                {!isDockerMode ? (
                  <motion.div 
                    key="hypervisor" 
                    exit={{ opacity: 0, height: 0, scale: 0.9 }}
                    className="h-8 w-full bg-slate-700 border-2 border-slate-800 rounded-lg flex items-center justify-center text-slate-300 font-black tracking-widest text-sm shadow-md"
                  >
                    HYPERVISOR (VMware / ESXi)
                  </motion.div>
                ) : (
                  <motion.div 
                    key="docker" 
                    initial={{ opacity: 0, height: 0, scale: 0.9 }}
                    animate={{ opacity: 1, height: 48, scale: 1 }}
                    className="h-8 w-full bg-teal-800 border-2 border-teal-900 rounded-lg flex items-center justify-center text-teal-100 font-black tracking-widest text-sm shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                  >
                    CONTAINER ENGINE (Docker)
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="h-8 w-full bg-indigo-900 border-2 border-indigo-950 rounded-lg flex items-center justify-center text-indigo-200 font-black tracking-widest text-sm shadow-md">
                HOST OS / KERNEL (Linux)
              </div>
              <div className="h-10 w-full bg-slate-900 border-b-8 border-slate-950 rounded-xl flex items-center justify-center text-slate-400 font-black tracking-widest text-sm shadow-xl">
                PHYSICAL HARDWARE (64GB RAM / 16-Core CPU)
              </div>
            </div>

            {/* Deployed Blocks (VMs or Containers) */}
            <div className="w-full max-w-xl flex-1 flex flex-col-reverse justify-start items-center pb-2 relative">
              
              {/* VM Rendering */}
              <AnimatePresence>
                {!isDockerMode && Array.from({ length: vms }).map((_, i) => (
                  <motion.div 
                    key={`vm-${i}`}
                    initial={{ y: -400, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="w-full max-w-[400px] mb-2 flex flex-col shadow-lg shrink-0"
                  >
                    <div className="h-8 bg-indigo-100 border-2 border-b-0 border-indigo-300 rounded-t-xl flex items-center justify-center text-indigo-800 font-bold text-sm">
                      App Instance {i + 1} <span className="text-xs ml-2 opacity-70">(100MB)</span>
                    </div>
                    <div className={`h-16 border-2 border-amber-600 rounded-b-xl flex flex-col items-center justify-center transition-colors ${
                      phase === "STEP4_UNDERSTAND" ? "bg-amber-400 animate-pulse" : "bg-amber-500"
                    }`}>
                      <span className="text-amber-950 font-black tracking-wide">FULL GUEST OS</span>
                      <span className="text-amber-900 font-bold text-sm">(2GB Overhead)</span>
                      {phase === "STEP4_UNDERSTAND" && (
                        <span className="mt-2 bg-amber-950 text-amber-100 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest">
                          95% Wasted Space
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Container Rendering */}
              {isDockerMode && (
                <div className="w-full flex flex-wrap-reverse justify-center content-start gap-2 pt-4">
                  <AnimatePresence>
                    {Array.from({ length: containers }).map((_, i) => (
                      <motion.div 
                        key={`container-${i}`}
                        initial={{ y: -300, scale: 0.5, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-[90px] h-[40px] bg-emerald-100 border-2 border-emerald-500 rounded-lg shadow-sm flex flex-col items-center justify-center text-emerald-800"
                      >
                        <span className="font-black text-sm">App {i + 1}</span>
                        <span className="text-[10px] font-bold opacity-70">100MB</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>
    </LabShell>
  );
}
