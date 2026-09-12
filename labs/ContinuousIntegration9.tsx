"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Server, Activity, AlertTriangle, CheckCircle2, Play, Lock, 
  ToggleLeft, ToggleRight, Radio, Flame, ServerCrash, Timer,
  Bug, Search, Package, ArrowRight, ShieldCheck, Code2, Trash2, Cog, ShieldAlert,
  FlaskConical, Blocks, TerminalSquare
} from "lucide-react";

export default function ContinuousIntegration9() {
  const { reportComplete } = useLMSBridge("continuousintegration9");
  const { playPop, playError, playSuccess, playClick } = useLabAudio();

  // Timer State
  const TIMER_DURATION = 5 * 60;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Lab State
  const [phase, setPhase] = useState(0); 
  const [scanners, setScanners] = useState({ lint: false, test: false, build: false });
  const [payload, setPayload] = useState<{ 
    type: 'clean' | 'buggy' | null, 
    pos: number, 
    status: 'idle' | 'moving' | 'scanning' | 'rejected' | 'deployed' | 'crashed' 
  }>({ type: null, pos: 0, status: 'idle' });

  // Main Simulation Function
  const pushCode = async (type: 'clean' | 'buggy') => {
    if (payload.status !== 'idle' && payload.status !== 'rejected' && payload.status !== 'deployed' && payload.status !== 'crashed') return;
    
    // Update phase logic
    if (phase === 0 && type === 'buggy') setPhase(1);
    if (phase === 5 && type === 'buggy') setPhase(6);
    
    setPayload({ type, pos: 0, status: 'moving' });
    playClick();

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    await wait(400); // Give it a moment to spawn

    const stations = [
      { key: 'lint', pos: 1 },
      { key: 'test', pos: 2 },
      { key: 'build', pos: 3 },
    ];

    for (const station of stations) {
      // Move to station
      setPayload(p => ({ ...p, pos: station.pos, status: 'moving' }));
      await wait(600); // Travel time

      // @ts-ignore
      if (scanners[station.key]) {
        // Scanner is ON
        setPayload(p => ({ ...p, status: 'scanning' }));
        await wait(800); // Scan time

        if (type === 'buggy') {
          // Reject at the first active scanner
          setPayload(p => ({ ...p, status: 'rejected' }));
          playError();
          
          if (phase === 5) {
            setTimeout(() => setPhase(6), 2000);
          }
          return; // Stop the belt
        } else {
          // Pass
          playSuccess();
          await wait(300);
        }
      }
    }

    // Move to Deploy Launchpad
    setPayload(p => ({ ...p, pos: 4, status: 'moving' }));
    await wait(600);

    if (type === 'buggy') {
      setPayload(p => ({ ...p, status: 'crashed' }));
      playError();
      if (phase === 0 || phase === 1) {
        setPhase(2);
        setTimeout(() => setPhase(3), 3000);
      }
    } else {
      setPayload(p => ({ ...p, status: 'deployed' }));
      playSuccess();
      if (phase >= 6) {
        setPhase(7);
        reportComplete();
      }
    }
  };

  const toggleScanner = (key: 'lint' | 'test' | 'build') => {
    if (phase < 3) return;
    playClick();
    setScanners(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (phase === 3 && next.lint && next.test && next.build) {
        setPhase(4);
        setTimeout(() => setPhase(5), 1000);
      }
      return next;
    });
  };

  const getInstruction = () => {
    switch(phase) {
      case 0: return "You have code ready to ship. Push the Buggy Code payload onto the conveyor belt to see what happens.";
      case 1: return "The payload is moving down the assembly line towards the production server...";
      case 2: return "CRITICAL DISASTER! The buggy code reached production and crashed the server!";
      case 3: return "Without quality control, every bug hits production. Toggle the CI/CD Pipeline Scanners ON to protect the server.";
      case 4: return "Activating the CI/CD Safety Net...";
      case 5: return "All scanners are ONLINE. Push the Buggy Code again to test the automated safety trap.";
      case 6: return "Bug caught automatically! The scanner rejected it before it reached production. Now, push Clean Code.";
      case 7: return "MISSION SUCCESS! Clean code passed all CI/CD checks and safely deployed to production.";
      default: return "";
    }
  };

  const getPosPercent = (pos: number) => {
    switch(pos) {
      case 0: return "5%";
      case 1: return "25%";
      case 2: return "45%";
      case 3: return "65%";
      case 4: return "85%";
      default: return "5%";
    }
  };

  return (
    <LabShell
      labId="continuousintegration9"
      title="Continuous Integration (CI/CD)"
      compact={true}
      onReset={() => {
        setPhase(0);
        setPayload({ type: null, pos: 0, status: 'idle' });
        setScanners({ lint: false, test: false, build: false });
        setTimeLeft(TIMER_DURATION);
      }}
      bgOverride="bg-slate-100"
      theme="ocean"
      navExtra={
        <div className="flex items-center gap-1.5 text-sky-700 bg-white hover:bg-sky-50 border border-sky-100 shadow-sm px-3 md:px-4 h-9 md:h-10 rounded-full font-mono text-sm font-bold transition-colors">
          <Timer size={16} strokeWidth={2.5} />
          {formatTime(timeLeft)}
        </div>
      }
    >
      <div className="relative z-10 w-full h-full flex flex-col p-2 sm:p-4 gap-3 sm:gap-4 overflow-y-auto">
        
        {/* Dynamic Instruction Banner */}
        <div className={`w-full border-2 rounded-2xl p-3 sm:p-4 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4 shrink-0 transition-all duration-500
          ${(phase === 1 || phase === 2) ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-100' : 
            (phase === 3 || phase === 4) ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-amber-100' :
            (phase === 6 || phase === 7) ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100' :
            'bg-white border-sky-200 text-sky-900 shadow-sky-50'}`
        }>
          <div className={`p-2 rounded-xl shrink-0 transition-colors 
            ${(phase === 1 || phase === 2) ? 'bg-rose-100 text-rose-600 shadow-inner' : 
              (phase === 3 || phase === 4) ? 'bg-amber-100 text-amber-600 shadow-inner animate-pulse' :
              (phase === 6 || phase === 7) ? 'bg-emerald-100 text-emerald-600 shadow-inner' :
              'bg-sky-100 text-sky-600 shadow-inner'}`}
          >
            {(phase === 1 || phase === 2) ? <AlertTriangle size={24} strokeWidth={2.5} /> :
             (phase === 3 || phase === 4) ? <ShieldAlert size={24} strokeWidth={2.5} /> :
             (phase === 6 || phase === 7) ? <CheckCircle2 size={24} strokeWidth={2.5} /> :
             <Play size={24} strokeWidth={2.5} />}
          </div>
          <p className="text-sm sm:text-base font-bold leading-snug tracking-tight">
            {getInstruction()}
          </p>
        </div>

        <div className="flex-1 w-full flex flex-col md:flex-row gap-3 sm:gap-4 min-h-0 pb-2">
          
          {/* CONTROL DECK (LEFT) */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col shrink-0">
            <div className={`bg-white border-2 rounded-3xl shadow-xl p-3 sm:p-4 flex flex-col h-full relative z-10 transition-colors duration-500 ${
              phase >= 5 ? 'border-emerald-300' : 'border-slate-200'
            }`}>
              
              {/* Telemetry Header */}
              <div className="flex items-center justify-between pb-2 sm:pb-3 border-b-2 border-slate-100 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-white shadow-md">
                    <Cog size={18} strokeWidth={2.5} className={phase < 5 && phase >= 3 ? "animate-spin-slow" : ""} />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Automation</div>
                    <div className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">CI/CD Pipeline</div>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm border ${
                  phase < 3 ? 'bg-rose-50 text-rose-600 border-rose-200' :
                  phase < 5 ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  <Radio size={10} strokeWidth={3} className={phase < 5 && phase >= 3 ? "animate-pulse" : ""} />
                  {phase < 3 ? "OFFLINE" : phase < 5 ? "CONFIGURING" : "ACTIVE"}
                </span>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2 my-2 shrink-0">
                
                {/* Lint Scanner */}
                <button 
                  onClick={() => toggleScanner('lint')}
                  disabled={phase < 3}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-2xl border-2 transition-all duration-300 ${
                    scanners.lint 
                      ? 'bg-white border-cyan-400 shadow-[0_4px_15px_rgba(34,211,238,0.2)]' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  } ${phase < 3 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 text-left">
                    <div className={`p-1.5 sm:p-2 rounded-xl transition-colors ${scanners.lint ? 'bg-cyan-50 text-cyan-500' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                      <TerminalSquare size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-700">1. Lint Code</div>
                      <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Scan for syntax errors</div>
                    </div>
                  </div>
                  {scanners.lint ? <ToggleRight size={24} className="text-cyan-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                </button>

                {/* Unit Tests */}
                <button 
                  onClick={() => toggleScanner('test')}
                  disabled={phase < 3}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-2xl border-2 transition-all duration-300 ${
                    scanners.test 
                      ? 'bg-white border-purple-400 shadow-[0_4px_15px_rgba(168,85,247,0.2)]' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  } ${phase < 3 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 text-left">
                    <div className={`p-1.5 sm:p-2 rounded-xl transition-colors ${scanners.test ? 'bg-purple-50 text-purple-500' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                      <FlaskConical size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-700">2. Unit Tests</div>
                      <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Verify code logic</div>
                    </div>
                  </div>
                  {scanners.test ? <ToggleRight size={24} className="text-purple-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                </button>

                {/* Build Assembler */}
                <button 
                  onClick={() => toggleScanner('build')}
                  disabled={phase < 3}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-2xl border-2 transition-all duration-300 ${
                    scanners.build 
                      ? 'bg-white border-amber-400 shadow-[0_4px_15px_rgba(251,191,36,0.2)]' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  } ${phase < 3 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 text-left">
                    <div className={`p-1.5 sm:p-2 rounded-xl transition-colors ${scanners.build ? 'bg-amber-50 text-amber-500' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                      <Blocks size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-700">3. Build App</div>
                      <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Compile & bundle app</div>
                    </div>
                  </div>
                  {scanners.build ? <ToggleRight size={24} className="text-amber-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                </button>

              </div>

              {/* Dynamic Action Buttons */}
              <div className="flex-1 flex flex-col justify-end gap-2 mt-1 min-h-0">
                <button 
                  onClick={() => pushCode('clean')}
                  disabled={phase < 6 || (payload.status !== 'idle' && payload.status !== 'rejected' && payload.status !== 'deployed' && payload.status !== 'crashed')}
                  className={`w-full py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs sm:text-sm uppercase tracking-widest
                    ${phase >= 6 
                      ? 'bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-[0_4px_0_#0284c7] active:shadow-none active:translate-y-[4px]' 
                      : 'bg-slate-50 text-slate-400 border-2 border-slate-200 shadow-none opacity-60 cursor-not-allowed'
                    } ${phase === 6 && payload.status !== 'moving' ? 'animate-bounce shadow-[0_4px_0_#0284c7,0_10px_15px_rgba(14,165,233,0.4)]' : ''}`}
                >
                  <Code2 size={18} strokeWidth={3} /> PUSH CLEAN CODE
                </button>

                <button 
                  onClick={() => pushCode('buggy')}
                  disabled={(phase > 5) || (payload.status !== 'idle' && payload.status !== 'rejected' && payload.status !== 'deployed' && payload.status !== 'crashed')}
                  className={`w-full py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs sm:text-sm uppercase tracking-widest
                    ${phase <= 5 
                      ? 'bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[0_4px_0_#9f1239] active:shadow-none active:translate-y-[4px]' 
                      : 'hidden'
                    } ${(phase === 0 || phase === 5) && payload.status !== 'moving' ? 'animate-bounce shadow-[0_4px_0_#9f1239,0_10px_15px_rgba(244,63,94,0.4)]' : ''}`}
                >
                  <Bug size={18} strokeWidth={3} /> PUSH BUGGY CODE
                </button>
              </div>

            </div>
          </div>

          {/* FACTORY STAGE (RIGHT) */}
          <div className="flex-1 flex flex-col relative z-0 min-h-[300px] md:min-h-[450px] bg-white border-2 border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            
            {/* Title Bar - elevated z-index to block ceiling struts */}
            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-b-4 border-slate-950 shrink-0 z-20 relative shadow-md">
              <div className="flex items-center gap-3">
                <Cog className="text-slate-500 animate-spin-slow" size={18} strokeWidth={2.5} />
                <h2 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-widest">QA Factory Floor</h2>
              </div>
            </div>

            {/* Stage Field */}
            <div className="flex-1 relative overflow-hidden select-none bg-slate-50 z-0">
              
              {/* Background Grid */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-factory" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M 0 40 L 40 40 L 40 0" fill="none" stroke="#475569" strokeWidth="0.5" opacity="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-factory)" />
              </svg>

              {/* The Conveyor Belt Track */}
              <div className="absolute top-[50%] left-0 w-full h-8 sm:h-12 bg-slate-800 border-y-4 border-slate-900 flex items-center overflow-hidden z-0 shadow-2xl">
                {/* Moving treads via CSS gradient */}
                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent_0px,transparent_15px,#000_15px,#000_30px)] bg-[length:30px_100%] animate-conveyor" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              </div>
              
              {/* Belt Drop Shadow */}
              <div className="absolute top-[50%] mt-8 sm:mt-12 left-0 w-full h-8 bg-black/10 blur-xl z-0" />

              {/* Reject Bin (Incinerator) - Tighter height */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] sm:w-[70%] h-10 sm:h-12 bg-gradient-to-b from-rose-500 to-rose-700 border-x-4 border-t-4 border-rose-800 rounded-t-3xl flex items-center justify-center z-20 shadow-[inset_0_10px_20px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2 text-white font-black uppercase text-xs sm:text-sm tracking-widest drop-shadow-md">
                  <Flame size={18} strokeWidth={3} className="text-rose-200" /> REJECT INCINERATOR
                </div>
                {/* Hazard Stripes */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%,#000_100%)] bg-[length:20px_20px] rounded-t-[20px]" />
              </div>

              {/* SCANNERS (NODES) */}
              
              {/* 1. Lint Scanner */}
              <div className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="absolute bottom-[100%] w-4 h-[250px] bg-gradient-to-b from-slate-200 to-slate-400 border-x-2 border-slate-500 shadow-inner z-0" />
                <div className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 flex flex-col items-center justify-center transition-all duration-500 ${
                  scanners.lint ? 'bg-white border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]' : 'bg-slate-100 border-slate-300 shadow-lg'
                } ${payload.status === 'scanning' && payload.pos === 1 ? 'animate-pulse' : ''}`}>
                  <TerminalSquare className={`w-6 h-6 sm:w-7 sm:h-7 ${scanners.lint ? 'text-cyan-500' : 'text-slate-400'}`} strokeWidth={3} />
                  <span className={`text-[8px] sm:text-[9px] font-black uppercase mt-0.5 tracking-widest ${scanners.lint ? 'text-cyan-700' : 'text-slate-500'}`}>Lint</span>
                </div>
                {/* Laser beam */}
                <div className={`w-3 sm:w-4 transition-all duration-300 origin-top z-0 ${
                  payload.status === 'scanning' && payload.pos === 1 && scanners.lint 
                    ? 'h-20 sm:h-24 bg-gradient-to-b from-cyan-400 to-transparent opacity-100' 
                    : scanners.lint ? 'h-8 sm:h-10 bg-gradient-to-b from-cyan-400 to-transparent opacity-40' : 'h-0'
                }`} />
              </div>

              {/* 2. Test Scanner */}
              <div className="absolute top-[25%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="absolute bottom-[100%] w-4 h-[250px] bg-gradient-to-b from-slate-200 to-slate-400 border-x-2 border-slate-500 shadow-inner z-0" />
                <div className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 flex flex-col items-center justify-center transition-all duration-500 ${
                  scanners.test ? 'bg-white border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)]' : 'bg-slate-100 border-slate-300 shadow-lg'
                } ${payload.status === 'scanning' && payload.pos === 2 ? 'animate-pulse' : ''}`}>
                  <FlaskConical className={`w-6 h-6 sm:w-7 sm:h-7 ${scanners.test ? 'text-purple-500' : 'text-slate-400'}`} strokeWidth={3} />
                  <span className={`text-[8px] sm:text-[9px] font-black uppercase mt-0.5 tracking-widest ${scanners.test ? 'text-purple-700' : 'text-slate-500'}`}>Test</span>
                </div>
                <div className={`w-3 sm:w-4 transition-all duration-300 origin-top z-0 ${
                  payload.status === 'scanning' && payload.pos === 2 && scanners.test 
                    ? 'h-20 sm:h-24 bg-gradient-to-b from-purple-400 to-transparent opacity-100' 
                    : scanners.test ? 'h-8 sm:h-10 bg-gradient-to-b from-purple-400 to-transparent opacity-40' : 'h-0'
                }`} />
              </div>

              {/* 3. Build Scanner */}
              <div className="absolute top-[25%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="absolute bottom-[100%] w-4 h-[250px] bg-gradient-to-b from-slate-200 to-slate-400 border-x-2 border-slate-500 shadow-inner z-0" />
                <div className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 flex flex-col items-center justify-center transition-all duration-500 ${
                  scanners.build ? 'bg-white border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 'bg-slate-100 border-slate-300 shadow-lg'
                } ${payload.status === 'scanning' && payload.pos === 3 ? 'animate-pulse' : ''}`}>
                  <Blocks className={`w-6 h-6 sm:w-7 sm:h-7 ${scanners.build ? 'text-amber-500' : 'text-slate-400'}`} strokeWidth={3} />
                  <span className={`text-[8px] sm:text-[9px] font-black uppercase mt-0.5 tracking-widest ${scanners.build ? 'text-amber-700' : 'text-slate-500'}`}>Build</span>
                </div>
                <div className={`w-3 sm:w-4 transition-all duration-300 origin-top z-0 ${
                  payload.status === 'scanning' && payload.pos === 3 && scanners.build 
                    ? 'h-20 sm:h-24 bg-gradient-to-b from-amber-400 to-transparent opacity-100' 
                    : scanners.build ? 'h-8 sm:h-10 bg-gradient-to-b from-amber-400 to-transparent opacity-40' : 'h-0'
                }`} />
              </div>

              {/* PRODUCTION LAUNCHPAD */}
              {/* Perfectly aligned vertically with top-[50%] to match the track */}
              <div className="absolute top-[50%] left-[85%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className={`w-20 h-24 sm:w-26 sm:h-28 rounded-2xl border-4 flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
                  payload.status === 'crashed' ? 'bg-gradient-to-br from-rose-100 to-rose-200 border-rose-500 shadow-rose-500/50 animate-pulse' :
                  payload.status === 'deployed' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-500 shadow-emerald-500/40' :
                  'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-300'
                }`}>
                  {payload.status === 'crashed' ? (
                    <ServerCrash className="text-rose-600 mb-1 sm:mb-2 w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
                  ) : payload.status === 'deployed' ? (
                    <Server className="text-emerald-600 mb-1 sm:mb-2 w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
                  ) : (
                    <Server className="text-indigo-500 mb-1 sm:mb-2 w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
                  )}
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center px-1 leading-tight ${
                    payload.status === 'crashed' ? 'text-rose-900' :
                    payload.status === 'deployed' ? 'text-emerald-900' :
                    'text-indigo-900'
                  }`}>
                    Production
                  </span>
                  {payload.status === 'crashed' && (
                    <div className="absolute -top-4 bg-rose-600 text-white text-[10px] sm:text-xs font-black px-2 py-1 rounded shadow-lg animate-pulse whitespace-nowrap border-2 border-rose-400">
                      CRASHED
                    </div>
                  )}
                </div>
              </div>


              {/* THE PAYLOAD (Animated Code Box) */}
              <AnimatePresence>
                {payload.type && (
                  <motion.div
                    className={`absolute w-10 h-10 sm:w-14 sm:h-14 rounded-xl border-4 shadow-xl flex items-center justify-center z-30 ${
                      payload.type === 'buggy' ? 'bg-rose-100 border-rose-500 text-rose-600 shadow-rose-500/50' : 'bg-sky-100 border-sky-500 text-sky-600 shadow-sky-500/50'
                    }`}
                    initial={{ left: "5%", top: "50%", y: "-100%", x: "-50%", opacity: 0, scale: 0.5 }}
                    animate={{ 
                      left: getPosPercent(payload.pos),
                      top: payload.status === 'rejected' ? "100%" : "50%",
                      opacity: payload.status === 'crashed' ? 0 : payload.status === 'rejected' ? 0 : 1,
                      scale: payload.status === 'crashed' ? [1, 1.5, 0] : payload.status === 'rejected' ? 0.5 : 1,
                      rotate: payload.status === 'rejected' ? 180 : 0
                    }}
                    transition={{ 
                      duration: payload.status === 'crashed' ? 0.4 : payload.status === 'rejected' ? 0.6 : 0.6,
                      ease: "easeInOut"
                    }}
                    style={{ y: "-100%", x: "-50%" }}
                  >
                    {payload.type === 'buggy' ? <Bug size={24} strokeWidth={3} /> : <Code2 size={24} strokeWidth={3} />}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for conveyor belt animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes conveyor {
          from { background-position: 0 0; }
          to { background-position: -30px 0; }
        }
        .animate-conveyor {
          animation: conveyor 1s linear infinite;
        }
      `}} />

      {/* Victory Celebration */}
      <AnimatePresence>
        {phase === 7 && (
          <Celebration
            isActive={phase === 7}
            message="Pipeline Secure! Your automated Smart Factory successfully rejected the bugs and deployed the clean code to production."
            onReplay={() => {
              setPhase(0);
              setPayload({ type: null, pos: 0, status: 'idle' });
              setScanners({ lint: false, test: false, build: false });
              setTimeLeft(TIMER_DURATION);
            }}
          />
        )}
      </AnimatePresence>
    </LabShell>
  );
}
