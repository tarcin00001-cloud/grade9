"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, ArrowRightLeft, Bug, ShieldCheck, Activity, Server, Database, PowerOff, Lock } from "lucide-react";

type Phase = "STEP1_LEARN" | "STEP2_TRY" | "STEP3_FAIL" | "STEP4_UNDERSTAND" | "STEP5_IMPROVE" | "STEP6_COMPLETE" | "STEP7_RECOVER" | "OUTCOME";
type ArchMode = "MONOLITH" | "MICROSERVICES";

const TIMER_DURATION_SECONDS = 5 * 60;

export default function Microservices9() {
  const { reportComplete: _reportComplete } = useLMSBridge("microservices9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [phase, setPhase] = useState<Phase>("STEP1_LEARN");
  const [mode, setMode] = useState<ArchMode>("MONOLITH");
  const [trafficActive, setTrafficActive] = useState(false);
  const [bugActive, setBugActive] = useState(false);

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

  const handleSimulateTraffic = () => {
    if (phase !== "STEP1_LEARN") return;
    playPop();
    setTrafficActive(true);
    setPhase("STEP2_TRY");
    setTimeout(() => {
      playZap();
      setPhase("STEP3_FAIL");
    }, 3500);
  };

  const handleInjectBug = () => {
    playError();
    setBugActive(true);
    if (phase === "STEP3_FAIL") {
      setTrafficActive(false);
      setPhase("STEP4_UNDERSTAND");
    } else if (phase === "STEP6_COMPLETE") {
      setPhase("STEP7_RECOVER");
    }
  };

  const handleRefactor = () => {
    if (phase !== "STEP4_UNDERSTAND") return;
    playSuccess();
    setMode("MICROSERVICES");
    setBugActive(false);
    setPhase("STEP5_IMPROVE");
    setTimeout(() => {
      playPop();
      setTrafficActive(true);
      setPhase("STEP6_COMPLETE");
    }, 2500);
  };

  const handleRecover = () => {
    if (phase !== "STEP7_RECOVER") return;
    playSuccess();
    setPhase("OUTCOME");
    setTimeout(() => {
      playPop();
      setTimeout(reportComplete, 1500);
    }, 500);
  };

  const resetState = () => {
    setPhase("STEP1_LEARN");
    setMode("MONOLITH");
    setTrafficActive(false);
    setBugActive(false);
    setSecondsLeft(TIMER_DURATION_SECONDS);
    setTimedOut(false);
  };

  const getInstruction = () => {
    switch (phase) {
      case "STEP1_LEARN": return "Learn: A Monolith crams all code into one giant server. Click 'Boot Live Traffic' to start the E-Commerce platform.";
      case "STEP2_TRY": return "Try: Live traffic is flowing! The giant server is handling Video, Cart, Auth, and Payments simultaneously.";
      case "STEP3_FAIL": return "Fail Safely: ALERT! A fatal memory leak was detected in the Payment code! Click 'Inject Bug' to see what happens.";
      case "STEP4_UNDERSTAND": return "Understand Why: Total system failure! Because all modules shared the same hardware, a bug in Payments crashed the ENTIRE machine. Click 'Refactor' to isolate them.";
      case "STEP5_IMPROVE": return "Improve: You physically split the system into 4 independent servers (Microservices)! Booting up traffic...";
      case "STEP6_COMPLETE": return "Complete: Traffic is flowing into the distributed cluster. Now, inject the exact same Payment Bug again.";
      case "STEP7_RECOVER": return "Partial Degradation: Payment is down, but the rest survived! Now, use cloud redundancy to deploy a backup Payment instance.";
      case "OUTCOME": return "Outcome: 100% Recovered! The dead server was isolated and replaced instantly. This is the ultimate power of Cloud Microservices!";
    }
  };

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  // Premium Custom SVGs
  const CoolingFan = ({ cx, cy, isRunning, isError }: { cx: number | string, cy: number | string, isRunning: boolean, isError: boolean }) => (
    <g transform={`translate(${cx}, ${cy})`}>
      <circle r="18" fill={isError ? "#4c0519" : "#0f172a"} stroke={isError ? "#e11d48" : "#334155"} strokeWidth="2" />
      <g className={isRunning ? "animate-[spin-slow_1.0s_linear_infinite]" : ""} style={{ transformOrigin: "0 0" }}>
        <path d="M 0 -3 C 8 -14, 14 -14, 14 -3 Z" fill={isError ? "#f43f5e" : "#64748b"} />
        <path d="M 0 -3 C 8 -14, 14 -14, 14 -3 Z" fill={isError ? "#f43f5e" : "#64748b"} transform="rotate(120)" />
        <path d="M 0 -3 C 8 -14, 14 -14, 14 -3 Z" fill={isError ? "#f43f5e" : "#64748b"} transform="rotate(240)" />
        <circle r="4" fill={isError ? "#be123c" : "#94a3b8"} />
      </g>
      {/* Fan Grill */}
      <circle r="18" fill="none" stroke="#475569" strokeWidth="1" opacity="0.5" />
      <path d="M -18 0 L 18 0 M 0 -18 L 0 18 M -13 -13 L 13 13 M -13 13 L 13 -13" stroke="#475569" strokeWidth="1" opacity="0.3" />
    </g>
  );

  const StatusLED = ({ cx, cy, status }: { cx: number | string, cy: number | string, status: "OFF" | "ON" | "ERROR" }) => (
    <g transform={`translate(${cx}, ${cy})`}>
      <circle r="5" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
      {status === "ON" && (
        <>
          <circle r="3.5" fill="#10b981" />
          <circle r="4" fill="#34d399" className="animate-pulse opacity-60" filter="url(#glow-green)" />
        </>
      )}
      {status === "ERROR" && (
        <>
          <circle r="3.5" fill="#ef4444" />
          <circle r="4" fill="#f87171" className="animate-pulse opacity-90" filter="url(#glow-red)" />
        </>
      )}
    </g>
  );

  const ChipModule = ({ x, y, title, isError, isActive }: { x: number | string, y: number | string, title: string, isError: boolean, isActive: boolean }) => (
    <g transform={`translate(${x}, ${y})`}>
      {/* Gold Pins Top/Bottom */}
      <rect x="10" y="-3" width="100" height="6" fill="url(#gold-pins)" />
      <rect x="10" y="57" width="100" height="6" fill="url(#gold-pins)" />
      
      {/* Chip Body */}
      <rect width="120" height="60" rx="4" fill={isError ? "#4c0519" : "url(#chip-gradient)"} stroke={isError ? "#e11d48" : "#475569"} strokeWidth="2" filter="url(#hardware-shadow)" />
      
      {/* Chip Traces/Details */}
      <path d="M 10 10 L 30 10 L 40 20 M 110 50 L 90 50 L 80 40" fill="none" stroke={isError ? "#9f1239" : "#334155"} strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2" fill={isError ? "#9f1239" : "#475569"} />
      <circle cx="110" cy="50" r="2" fill={isError ? "#9f1239" : "#475569"} />

      <text x="60" y="30" fill={isError ? "#fecdd3" : "#38bdf8"} fontSize="13" fontWeight="bold" textAnchor="middle">{title}</text>
      
      {/* Activity Tx/Rx Indicator */}
      {isActive && !isError && (
        <circle cx="105" cy="15" r="2" fill="#38bdf8" className="animate-pulse" filter="url(#glow-cyan)" />
      )}
      
      {isError && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute">
          <circle cx="60" cy="45" r="8" fill="#e11d48" filter="url(#glow-red)" />
          <PowerOff x="54" y="39" size={12} color="white" strokeWidth={3} />
        </motion.g>
      )}
    </g>
  );

  return (
    <LabShell
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
      labId="microservices9"
      theme="ocean"
      title="Microservices Architecture"
      instruction={getInstruction()}
      compact
      onReset={resetState}
    >
      <Celebration isActive={phase === "OUTCOME"} message="100% Auto-Recovered!" />

      {/* Global CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash { to { stroke-dashoffset: -40; } }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        @keyframes shake-hard { 
            0%, 100% { transform: translate(var(--base-x, 0px), var(--base-y, 0px)); } 
            20%, 60% { transform: translate(calc(var(--base-x, 0px) - 6px), calc(var(--base-y, 0px))) rotate(-1deg); } 
            40%, 80% { transform: translate(calc(var(--base-x, 0px) + 6px), calc(var(--base-y, 0px))) rotate(1deg); } 
        }
      `}} />

      <div className="w-full flex flex-col md:flex-row flex-1 min-h-0 gap-4 pt-1">
        
        {/* ── LEFT: Control Panel ── */}
        <div className="md:w-[340px] shrink-0 flex flex-col gap-4">
          
          <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${
            bugActive && mode === "MONOLITH" ? "border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]" :
            bugActive && mode === "MICROSERVICES" ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]" :
            trafficActive ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "border-slate-200"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className={`w-5 h-5 ${bugActive && mode === "MONOLITH" ? "text-rose-600 animate-pulse" : trafficActive ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Global Health Monitor</span>
            </div>
            
            <div className="text-2xl font-black tracking-tight mb-2">
              {!trafficActive && !bugActive && <span className="text-slate-700">SYSTEM IDLE</span>}
              {trafficActive && !bugActive && phase !== "OUTCOME" && <span className="text-emerald-600">ONLINE & HEALTHY</span>}
              {bugActive && mode === "MONOLITH" && <span className="text-rose-600">FATAL CRASH</span>}
              {bugActive && mode === "MICROSERVICES" && phase !== "OUTCOME" && <span className="text-amber-600">PARTIAL DEGRADATION</span>}
              {phase === "OUTCOME" && <span className="text-emerald-600">100% RECOVERED</span>}
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Server size={14} className="text-indigo-400"/>
              {mode === "MONOLITH" ? "Topology: Monolithic Engine" : "Topology: Distributed Micro-Cluster"}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex-1 flex flex-col gap-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              Engineer's Console
            </h3>

            <button 
              onClick={handleSimulateTraffic}
              disabled={phase !== "STEP1_LEARN"}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                phase === "STEP1_LEARN" 
                  ? "bg-sky-50 border border-sky-300 text-sky-700 hover:bg-sky-100 shadow-sm animate-pulse" 
                  : "bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center gap-2">
                {phase === "STEP1_LEARN" ? <Database size={18} className="text-sky-500"/> : <Lock size={16} className="text-slate-400"/>} 
                1. Boot Live Traffic
              </span>
            </button>

            <button 
              onClick={handleInjectBug}
              disabled={phase !== "STEP3_FAIL" && phase !== "STEP6_COMPLETE"}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                phase === "STEP3_FAIL" || phase === "STEP6_COMPLETE"
                  ? "bg-rose-50 border-2 border-rose-400 text-rose-700 hover:bg-rose-100 shadow-sm animate-pulse" 
                  : "bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center gap-2">
                {phase === "STEP3_FAIL" || phase === "STEP6_COMPLETE" ? <Bug size={18} className="text-rose-500"/> : <Lock size={16} className="text-slate-400"/>}
                2. Inject Payment Bug
              </span>
            </button>

            <button 
              onClick={handleRefactor}
              disabled={phase !== "STEP4_UNDERSTAND"}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                phase === "STEP4_UNDERSTAND" 
                  ? "bg-indigo-600 border border-indigo-700 text-white hover:bg-indigo-700 shadow-md animate-pulse" 
                  : "bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center gap-2">
                {phase === "STEP4_UNDERSTAND" ? <ArrowRightLeft size={18} className="text-indigo-200"/> : <Lock size={16} className="text-slate-400"/>}
                3. Refactor to Microservices
              </span>
            </button>

            {(phase === "STEP7_RECOVER" || phase === "OUTCOME") && (
              <button 
                onClick={handleRecover}
                disabled={phase !== "STEP7_RECOVER"}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                  phase === "STEP7_RECOVER" 
                    ? "bg-emerald-600 border border-emerald-700 text-white hover:bg-emerald-700 shadow-md animate-pulse" 
                    : "bg-emerald-50 border border-emerald-200 text-emerald-700 opacity-50 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Server size={18} className={phase === "STEP7_RECOVER" ? "text-emerald-200" : "text-emerald-500"}/> 
                  4. Deploy Backup Instance
                </span>
              </button>
            )}
            
            {phase === "OUTCOME" && (
              <div className="mt-auto p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center animate-in fade-in slide-in-from-bottom-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-black text-emerald-800">Fault Tolerance Proven</p>
                <p className="text-[11px] font-bold text-emerald-600 mt-1">System is 100% resilient.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Fiber-Optic Canvas ── */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative min-w-0">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center shrink-0">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Server size={14} /> Datacenter Infrastructure Canvas
            </h2>
          </div>
          
          <div className="flex-1 relative bg-slate-50 overflow-hidden flex items-center justify-center p-4">
            <svg viewBox="0 0 800 500" className="w-full h-full max-w-[800px] max-h-[500px]" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f1f5f9" stopOpacity="1" />
                </radialGradient>
                <pattern id="grid-bg" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
                  <circle cx="0" cy="0" r="1.5" fill="#94a3b8" />
                </pattern>
                <filter id="hardware-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#020617" floodOpacity="0.25" />
                </filter>
                <filter id="glow-green">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="glow-cyan">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="glow-red">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="gunmetal-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="50%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="chip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <pattern id="gold-pins" width="8" height="10" patternUnits="userSpaceOnUse">
                  <rect x="2" y="0" width="4" height="6" fill="#fbbf24" />
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#bg-glow)" rx="16" />
              <rect width="100%" height="100%" fill="url(#grid-bg)" rx="16" />

              {/* ── THE INTERNET SOURCE ── */}
              <g transform="translate(400, 50)" style={{ "--base-x": "400px", "--base-y": "50px" } as React.CSSProperties}>
                <ellipse cx="0" cy="0" rx="80" ry="30" fill="url(#gunmetal-sheen)" stroke="#475569" strokeWidth="2" filter="url(#hardware-shadow)" />
                <text x="0" y="5" fill="#f8fafc" fontSize="14" fontWeight="black" textAnchor="middle" letterSpacing="1">GLOBAL WEB</text>
              </g>

              {/* Traffic Tube Function */}
              {(() => {
                const Tube = ({ d, active }: { d: string, active: boolean }) => (
                  <g>
                    {/* Background Fiber Tube */}
                    <path d={d} fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                    {/* Glowing Data Packets inside */}
                    {active && (
                      <path d={d} fill="none" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 24" filter="url(#glow-cyan)" className="animate-[dash_1s_linear_infinite]" strokeLinejoin="round"/>
                    )}
                  </g>
                );

                return (
                  <>
                    <Tube d="M 400 80 L 400 130" active={trafficActive} />

                    <AnimatePresence mode="wait">
                      
                      {/* ── MONOLITH MODE ── */}
                      {mode === "MONOLITH" && (
                        <motion.g 
                          key="monolith" 
                          initial={{ opacity: 0, y: 20 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                          transition={{ duration: 0.5 }}
                          style={{ "--base-x": "0px", "--base-y": "0px" } as React.CSSProperties}
                          className={bugActive ? "animate-[shake-hard_0.4s_ease-in-out_infinite]" : ""}
                        >
                          <Tube d="M 400 130 L 400 170" active={trafficActive && !bugActive} />

                          {/* Giant Hardware Box */}
                          <g transform="translate(220, 170)" filter="url(#hardware-shadow)">
                            <rect width="360" height="280" rx="16" fill={bugActive ? "#4c0519" : "url(#gunmetal-sheen)"} stroke={bugActive ? "#e11d48" : "#475569"} strokeWidth="3" />
                            
                            {/* Top Grill / Branding */}
                            <rect x="20" y="15" width="320" height="30" rx="4" fill="#0f172a" stroke="#1e293b" />
                            <text x="180" y="35" fill={bugActive ? "#f43f5e" : "#94a3b8"} fontSize="16" fontWeight="black" textAnchor="middle" letterSpacing="3">
                              MONOLITHIC KERNEL V1
                            </text>
                            
                            {/* Hardware LEDs & Fans */}
                            <StatusLED cx="320" cy="30" status={bugActive ? "ERROR" : trafficActive ? "ON" : "OFF"} />
                            <CoolingFan cx="50" cy="30" isRunning={trafficActive && !bugActive} isError={bugActive} />

                            {/* Internal Motherboard */}
                            <g transform="translate(30, 70)">
                              <rect x="0" y="0" width="300" height="180" rx="8" fill="#020617" stroke="#1e293b" strokeWidth="2" />
                              
                              <ChipModule x="20" y="20" title="Auth Chip" isError={bugActive} isActive={trafficActive} />
                              <ChipModule x="160" y="20" title="Video Engine" isError={bugActive} isActive={trafficActive} />
                              <ChipModule x="20" y="100" title="Shopping Cart" isError={bugActive} isActive={trafficActive} />
                              <ChipModule x="160" y="100" title="Payment Auth" isError={bugActive} isActive={trafficActive} />

                              {/* Internal Gold Traces */}
                              <path d="M 80 80 L 80 100" fill="none" stroke="#fbbf24" strokeWidth="2" opacity={bugActive ? 0.2 : 0.8} />
                              <path d="M 220 80 L 220 100" fill="none" stroke="#fbbf24" strokeWidth="2" opacity={bugActive ? 0.2 : 0.8} />
                              <path d="M 140 50 L 160 50" fill="none" stroke="#fbbf24" strokeWidth="2" opacity={bugActive ? 0.2 : 0.8} />
                              <path d="M 140 130 L 160 130" fill="none" stroke="#fbbf24" strokeWidth="2" opacity={bugActive ? 0.2 : 0.8} />

                            </g>
                          </g>
                          
                          {bugActive && (
                            <text x="400" y="470" fill="#f43f5e" fontSize="26" fontWeight="black" textAnchor="middle" filter="url(#glow-red)" letterSpacing="4">
                              TOTAL KERNEL PANIC
                            </text>
                          )}
                        </motion.g>
                      )}

                      {/* ── MICROSERVICES MODE ── */}
                      {mode === "MICROSERVICES" && (
                        <motion.g 
                          key="microservices" 
                          initial={{ opacity: 0, y: 20 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ duration: 0.6, staggerChildren: 0.1 }}
                        >
                          
                          {/* API Gateway */}
                          <g transform="translate(250, 130)" filter="url(#hardware-shadow)">
                            <rect width="300" height="46" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                            <text x="150" y="28" fill="#38bdf8" fontSize="14" fontWeight="black" textAnchor="middle" letterSpacing="2">NGINX API GATEWAY</text>
                            <StatusLED cx="280" cy="23" status={trafficActive ? "ON" : "OFF"} />
                          </g>

                          <Tube d="M 400 176 L 400 210 L 160 210 L 160 250" active={trafficActive} />
                          <Tube d="M 400 176 L 400 230 L 320 230 L 320 250" active={trafficActive} />
                          <Tube d="M 400 176 L 400 230 L 480 230 L 480 250" active={trafficActive} />
                          <Tube d="M 400 176 L 400 210 L 640 210 L 640 250" active={trafficActive && (!bugActive || phase === "OUTCOME")} />

                          {/* 1. Auth Service */}
                          <g transform="translate(90, 250)" filter="url(#hardware-shadow)">
                            <rect width="140" height="180" rx="12" fill="url(#gunmetal-sheen)" stroke="#475569" strokeWidth="2" />
                            <rect x="10" y="10" width="120" height="30" rx="4" fill="#0f172a" />
                            <text x="70" y="30" fill="#94a3b8" fontSize="12" fontWeight="black" textAnchor="middle">AUTH . SVC</text>
                            <CoolingFan cx="70" cy="80" isRunning={trafficActive} isError={false} />
                            <StatusLED cx="110" cy="25" status={trafficActive ? "ON" : "OFF"} />
                            <rect x="20" y="120" width="100" height="40" rx="4" fill="#0f172a" stroke="#1e293b" />
                            <text x="70" y="145" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle" filter="url(#glow-green)">HEALTHY</text>
                          </g>

                          {/* 2. Video Service */}
                          <g transform="translate(250, 250)" filter="url(#hardware-shadow)">
                            <rect width="140" height="180" rx="12" fill="url(#gunmetal-sheen)" stroke="#475569" strokeWidth="2" />
                            <rect x="10" y="10" width="120" height="30" rx="4" fill="#0f172a" />
                            <text x="70" y="30" fill="#94a3b8" fontSize="12" fontWeight="black" textAnchor="middle">VIDEO . SVC</text>
                            <CoolingFan cx="70" cy="80" isRunning={trafficActive} isError={false} />
                            <StatusLED cx="110" cy="25" status={trafficActive ? "ON" : "OFF"} />
                            <rect x="20" y="120" width="100" height="40" rx="4" fill="#0f172a" stroke="#1e293b" />
                            <text x="70" y="145" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle" filter="url(#glow-green)">HEALTHY</text>
                          </g>

                          {/* 3. Cart Service */}
                          <g transform="translate(410, 250)" filter="url(#hardware-shadow)">
                            <rect width="140" height="180" rx="12" fill="url(#gunmetal-sheen)" stroke="#475569" strokeWidth="2" />
                            <rect x="10" y="10" width="120" height="30" rx="4" fill="#0f172a" />
                            <text x="70" y="30" fill="#94a3b8" fontSize="12" fontWeight="black" textAnchor="middle">CART . SVC</text>
                            <CoolingFan cx="70" cy="80" isRunning={trafficActive} isError={false} />
                            <StatusLED cx="110" cy="25" status={trafficActive ? "ON" : "OFF"} />
                            <rect x="20" y="120" width="100" height="40" rx="4" fill="#0f172a" stroke="#1e293b" />
                            <text x="70" y="145" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle" filter="url(#glow-green)">HEALTHY</text>
                          </g>

                          {/* 4. Dead Payment Service */}
                          <motion.g 
                            initial={{ x: 570, y: 250 }}
                            animate={phase === "OUTCOME" ? { x: 570, y: 340, opacity: 0.2, scale: 0.9, filter: "grayscale(100%) blur(3px)" } : { x: 570, y: 250, opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            style={{ "--base-x": "570px", "--base-y": "250px" } as React.CSSProperties}
                            className={bugActive && phase !== "OUTCOME" ? "animate-[shake-hard_0.4s_ease-in-out_infinite]" : ""}
                          >
                            <rect width="140" height="180" rx="12" fill={bugActive ? "#4c0519" : "url(#gunmetal-sheen)"} stroke={bugActive ? "#e11d48" : "#475569"} strokeWidth="2" filter="url(#hardware-shadow)" />
                            <rect x="10" y="10" width="120" height="30" rx="4" fill={bugActive ? "#7f1d1d" : "#0f172a"} />
                            <text x="70" y="30" fill={bugActive ? "#fecdd3" : "#94a3b8"} fontSize="12" fontWeight="black" textAnchor="middle">PAY . SVC (01)</text>
                            
                            <CoolingFan cx="70" cy="80" isRunning={trafficActive && !bugActive} isError={bugActive} />
                            <StatusLED cx="110" cy="25" status={bugActive ? "ERROR" : trafficActive ? "ON" : "OFF"} />
                            
                            <rect x="20" y="120" width="100" height="40" rx="4" fill={bugActive ? "#4c0519" : "#0f172a"} stroke={bugActive ? "#e11d48" : "#1e293b"} />
                            <text x="70" y="145" fill={bugActive ? "#f43f5e" : "#10b981"} fontSize="14" fontWeight="bold" textAnchor="middle" filter={bugActive ? "url(#glow-red)" : "none"}>
                              {bugActive ? "CRASHED" : "HEALTHY"}
                            </text>
                          </motion.g>

                          {/* 5. Backup Payment Service */}
                          <AnimatePresence>
                            {phase === "OUTCOME" && (
                              <motion.g 
                                initial={{ x: 570, y: -50, opacity: 0, scale: 0.9 }} 
                                animate={{ x: 570, y: 250, opacity: 1, scale: 1 }} 
                                transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.5 }}
                                filter="url(#hardware-shadow)"
                              >
                                <rect width="140" height="180" rx="12" fill="url(#gunmetal-sheen)" stroke="#10b981" strokeWidth="3" />
                                <rect x="10" y="10" width="120" height="30" rx="4" fill="#0f172a" />
                                <text x="70" y="30" fill="#34d399" fontSize="12" fontWeight="black" textAnchor="middle">PAY . SVC (BKP)</text>
                                
                                <CoolingFan cx="70" cy="80" isRunning={true} isError={false} />
                                <StatusLED cx="110" cy="25" status="ON" />
                                
                                <rect x="20" y="120" width="100" height="40" rx="4" fill="#0f172a" stroke="#10b981" />
                                <text x="70" y="145" fill="#10b981" fontSize="14" fontWeight="bold" textAnchor="middle" filter="url(#glow-green)">HEALTHY</text>
                              </motion.g>
                            )}
                          </AnimatePresence>

                        </motion.g>
                      )}
                    </AnimatePresence>
                  </>
                );
              })()}

            </svg>
          </div>
        </div>

      </div>
    </LabShell>
  );
}
