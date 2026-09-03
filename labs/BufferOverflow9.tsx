"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Terminal, Shield, ShieldAlert, Cpu, Code2, 
  AlertOctagon, XCircle, Bug, Lock, Sparkles, 
  ArrowRight, ShieldCheck, Zap, Sliders, CheckCircle2 
} from "lucide-react";

type Stage = 1 | 2 | 3 | 4 | 5 | 6;
type SysState = "IDLE" | "PROCESSING" | "CRASHED" | "HIJACKED" | "SECURED";
type PayloadType = "SAFE" | "OVERFLOW" | "EXPLOIT";

export default function BufferOverflow9() {
  const { reportComplete } = useLMSBridge("bufferoverflow9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [stage, setStage] = useState<Stage>(1);
  const [sysState, setSysState] = useState<SysState>("IDLE");
  const [bufferData, setBufferData] = useState<string[]>([]);
  const [returnAddress, setReturnAddress] = useState<string>("0x080484b6");
  const [isPatched, setIsPatched] = useState(false);
  const [terminalLog, setTerminalLog] = useState<string[]>([
    "SYSTEM BOOT... MEMORY ALLOCATED AT 0x08048000.",
    "READY: Enter payload to test buffer limits."
  ]);

  // Interactive Payload Controller State
  const [payloadLen, setPayloadLen] = useState<number>(5);
  const [payloadType, setPayloadType] = useState<PayloadType>("SAFE");

  const addLog = (msg: string) => setTerminalLog(prev => [...prev, msg].slice(-4));
  const isErrorState = sysState === 'HIJACKED' || sysState === 'CRASHED';

  const handleReset = () => {
    setStage(1);
    setSysState("IDLE");
    setBufferData([]);
    setReturnAddress("0x080484b6");
    setIsPatched(false);
    setPayloadLen(5);
    setPayloadType("SAFE");
    setTerminalLog(["SYSTEM REBOOTED... MEMORY CLEARED."]);
    playPop();
  };

  // Sync payload length to type preset helper
  const handleSelectPreset = (type: PayloadType) => {
    playPop();
    setPayloadType(type);
    if (type === "SAFE") setPayloadLen(5);
    else if (type === "OVERFLOW") setPayloadLen(12);
    else if (type === "EXPLOIT") setPayloadLen(12);
  };

  const handleSliderChange = (newLen: number) => {
    setPayloadLen(newLen);
    if (payloadType === "EXPLOIT") {
      if (newLen !== 12) setPayloadType("OVERFLOW");
    } else {
      if (newLen <= 8) setPayloadType("SAFE");
      else setPayloadType("OVERFLOW");
    }
  };

  // Construct current payload display array
  const getPayloadBytes = (): string[] => {
    if (payloadType === "EXPLOIT") {
      const padding = Array(Math.min(payloadLen, 8)).fill("X");
      const overflow = ["0", "x", "H", "4"].slice(0, Math.max(0, payloadLen - 8));
      return [...padding, ...overflow];
    }
    return Array(payloadLen).fill("A");
  };

  const handleInject = () => {
    if (sysState === "PROCESSING") return;
    playZap();
    setSysState("PROCESSING");

    const bytes = getPayloadBytes();

    // STEP 1: Safe Observation
    if (stage === 1) {
      if (payloadLen > 8) {
        addLog("HINT: Set slider to 8 bytes or fewer first to observe safe execution.");
        setSysState("IDLE");
        playError();
        return;
      }
      addLog(`EXEC gets(buffer) -> INJECTING ${payloadLen} BYTES...`);
      setTimeout(() => {
        setBufferData(bytes);
        setReturnAddress("0x080484b6");
        setSysState("IDLE");
        setStage(2);
        setPayloadType("OVERFLOW");
        setPayloadLen(12);
        addLog(`SUCCESS: BUFFER AT ${Math.round((payloadLen / 8) * 100)}% CAPACITY. RET_ADDR INTACT.`);
        playSuccess();
      }, 900);
      return;
    }

    // STEP 2: Cause System Crash
    if (stage === 2) {
      if (payloadLen <= 8) {
        addLog("HINT: Increase the slider above 8 bytes (e.g., 12 bytes) to overflow the buffer!");
        setSysState("IDLE");
        playError();
        return;
      }
      addLog(`EXEC gets(buffer) -> OVERFLOWING ${payloadLen} BYTES (BOUNDARY BREACH)...`);
      setTimeout(() => {
        setBufferData(bytes);
        setReturnAddress("0x41414141");
        setSysState("CRASHED");
        setStage(3);
        setPayloadType("EXPLOIT");
        setPayloadLen(12);
        playError();
        addLog("FATAL: SEGMENTATION FAULT! 0x41414141 IS INVALID CODE POINTER.");
      }, 1100);
      return;
    }

    // STEP 3: Hijack Control Flow
    if (stage === 3) {
      if (payloadType !== "EXPLOIT" || payloadLen < 12) {
        addLog("HINT: Select 'Exploit (12B)' to align 0xH4CK3D over the return pointer.");
        setSysState("IDLE");
        playError();
        return;
      }
      addLog("EXEC gets(buffer) -> INJECTING CRAFTED EXPLOIT PAYLOAD...");
      setTimeout(() => {
        setBufferData(bytes);
        setReturnAddress("0xH4CK3D");
        setSysState("HIJACKED");
        setStage(4);
        playError();
        addLog("CRITICAL: HIJACKED! RETURN ADDRESS POINTING TO hacker_shell().");
      }, 1100);
      return;
    }

    // STEP 5: Verification (Post-Patch)
    if (stage >= 5) {
      addLog(`EXEC fgets(buffer, 8) -> INJECTING ${payloadLen} BYTES...`);
      setTimeout(() => {
        // Enforced boundary: only first 8 bytes pass through!
        setBufferData(bytes.slice(0, 8));
        setReturnAddress("0x080484b6");
        setSysState("SECURED");
        setStage(6);
        playSuccess();
        addLog("BLOCKED: INPUT SAFELY TRUNCATED TO 8 BYTES. SYSTEM SECURED!");
        setTimeout(() => {
          reportComplete();
        }, 2000);
      }, 1000);
    }
  };

  const handleBadPatch = () => {
    playError();
    addLog("PATCH REJECTED: Attackers can just send 101 bytes. Buffer size is not boundary security!");
  };

  const handleGoodPatch = () => {
    playSuccess();
    setIsPatched(true);
    setSysState("IDLE");
    setBufferData([]);
    setReturnAddress("0x080484b6");
    setStage(5);
    setPayloadType("EXPLOIT");
    setPayloadLen(12);
    addLog("PATCH APPLIED: gets() replaced with fgets(buffer, 8). Boundary enforced.");
  };

  return (
    <LabShell 
      labId="bufferoverflow9" 
      theme="ocean" 
      title="Buffer Overflow Hijacking" 
      instruction="Analyze memory corruption. Distinguish crashes from exploits, then engineer the boundary solution."
      compact
      onReset={handleReset}
    >
      <Celebration 
        isActive={stage === 6} 
        message="System Secured! You learned that increasing buffer sizes doesn't stop memory corruption—enforcing strict physical boundaries does." 
        onReplay={handleReset} 
      />

      <div className="w-full flex-1 relative bg-slate-50 overflow-hidden rounded-[2rem] border border-slate-200 shadow-inner flex flex-col lg:flex-row font-sans text-slate-800 min-h-0">
        
        {/* Left Hemisphere: Code & Interactive Payload Controller */}
        <div className="w-full lg:w-5/12 flex flex-col border-r border-slate-200 bg-white z-10 shadow-[10px_0_20px_rgba(0,0,0,0.03)] relative min-h-0">
          
          {/* Dynamic Step Banner */}
          <div className="bg-slate-900 text-white px-5 py-2 text-xs font-bold tracking-widest uppercase flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              {stage === 1 && "Step 1: Observe Normal Execution"}
              {stage === 2 && "Step 2: Cause a System Crash"}
              {stage === 3 && "Step 3: Hijack Control Flow"}
              {stage === 4 && "Step 4: Engineer a Solution"}
              {stage >= 5 && "Step 5: Verify Secured System"}
            </span>
            <span className="text-slate-400 font-mono font-normal">
              {Math.min(stage, 5)}/5
            </span>
          </div>

          {/* Card Header */}
          <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <Code2 className="text-blue-600" size={20} />
              <h2 className="font-bold text-base tracking-tight text-slate-900">Source Code Analysis</h2>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${
              sysState === 'HIJACKED' ? 'bg-rose-100 text-rose-600 border border-rose-300' : 
              isPatched ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 
              sysState === 'CRASHED' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 
              'bg-slate-200 text-slate-600'
            }`}>
              {sysState === 'HIJACKED' ? <><AlertOctagon size={11}/> Hijacked</> : 
               isPatched ? <><ShieldCheck size={11}/> Secured</> : 
               sysState === 'CRASHED' ? <><Bug size={11}/> Crashed</> : 
               <><ShieldAlert size={11}/> Vulnerable</>}
            </div>
          </div>
            {/* Code Viewer Panel */}
            <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed relative border-b border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800 text-[9px] text-slate-400">
                <span>vulnerable_program.c</span>
                <span className="text-amber-400 font-mono">GCC x86 (32-bit Stack)</span>
              </div>
              <pre className="overflow-x-auto">
                <span className="text-purple-400">void</span> <span className="text-sky-400">process_input</span>() {"{\n"}
                {"  "}<span className="text-purple-400">char</span> buffer[<span className="text-amber-400 font-bold">8</span>]; <span className="text-slate-500">// 8 bytes allocated</span><br/>
                {"  "}printf(<span className="text-emerald-400">"Enter Data:"</span>);
                {isPatched ? (
                  <span className="bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500 font-bold block my-0.5">
                    {"  "}fgets(buffer, <span className="text-amber-400">8</span>, stdin); <span className="text-emerald-400/80 text-[10px]">// BOUNDARY ENFORCED!</span>
                  </span>
                ) : (
                  <span className={`px-1.5 py-0.5 rounded border font-bold block my-0.5 ${
                    sysState === "PROCESSING" ? "bg-rose-950 text-rose-300 border-rose-500 animate-pulse" : "bg-rose-950/60 text-rose-300 border-rose-700/80"
                  }`}>
                    {"  "}gets(buffer); <span className="text-rose-400/80 text-[10px]">// DANGER: No bounds check</span>
                  </span>
                )}
                {"  "}<span className="text-purple-400">return</span>; <span className="text-slate-500">// Jumps to Return Address</span><br/>
                {"}"}
              </pre>
            </div>

          {/* Interactive Controls & Payload Crafter */}
          <div className="p-3 flex-1 flex flex-col justify-between bg-slate-50/50 overflow-y-auto">
            {stage === 4 ? (
              /* Step 4 Fix Decision */
              <div className="flex flex-col gap-3 my-auto">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-xs font-black uppercase tracking-wider text-blue-900 mb-1 flex items-center gap-1.5">
                    <Shield size={14} className="text-blue-600"/> Security Engineering
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    The root cause is that <code className="bg-white px-1 py-0.5 rounded border border-slate-300 text-rose-600 font-bold">gets()</code> never checks if input exceeds 8 bytes. How will you fix it?
                  </p>
                </div>

                <button 
                  onClick={handleBadPatch} 
                  className="w-full py-3 px-4 bg-white border-2 border-slate-300 hover:border-rose-400 rounded-xl font-bold text-slate-700 hover:text-rose-600 text-xs flex items-center justify-between transition-all hover:bg-rose-50 shadow-sm active:scale-95 group"
                >
                  <span className="flex items-center gap-2">
                    <XCircle size={16} className="text-slate-400 group-hover:text-rose-500"/>
                    Option A: Increase buffer[100]
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Naive Fix</span>
                </button>

                <button 
                  onClick={handleGoodPatch} 
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-700 rounded-xl font-black text-white text-xs flex items-center justify-between shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Lock size={16} className="text-emerald-100"/>
                    Option B: Enforce Boundary with fgets(8)
                  </span>
                  <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded text-emerald-100 font-mono">Secure</span>
                </button>
              </div>
            ) : (
              /* Steps 1, 2, 3, 5: Interactive Payload Controller */
              <div className="flex flex-col gap-1.5">
                {/* Step Instructions Hint */}
                <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>
                    {stage === 1 && "Inject ≤ 8 bytes to verify safe memory storage."}
                    {stage === 2 && "Overload the buffer! Increase slider to > 8 bytes (e.g. 12B)."}
                    {stage === 3 && "Select 'Exploit' to hijack the return address pointer."}
                    {stage >= 5 && "Test the 12-byte exploit against the secured boundary."}
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectPreset("SAFE")}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all flex items-center justify-center gap-1 ${
                      payloadType === "SAFE" 
                        ? "bg-blue-600 text-white border-blue-700 shadow-sm" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 size={12}/> Safe (5B)
                  </button>

                  <button
                    onClick={() => handleSelectPreset("OVERFLOW")}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all flex items-center justify-center gap-1 ${
                      payloadType === "OVERFLOW" 
                        ? "bg-amber-600 text-white border-amber-700 shadow-sm" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Bug size={12}/> Overflow (12B)
                  </button>

                  <button
                    onClick={() => handleSelectPreset("EXPLOIT")}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all flex items-center justify-center gap-1 ${
                      payloadType === "EXPLOIT" 
                        ? "bg-rose-600 text-white border-rose-700 shadow-sm" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <AlertOctagon size={12}/> Exploit (12B)
                  </button>
                </div>

                {/* Interactive Slider */}
                <div className="bg-white p-2 px-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sliders size={14} className="text-blue-600" />
                      Payload Size:
                    </span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-black ${
                      payloadLen <= 8 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {payloadLen} / 16 B {payloadLen > 8 && `(+${payloadLen - 8})`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={payloadLen}
                    disabled={stage === 5}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                    <span>1B</span>
                    <span className="text-emerald-600 font-bold">8B Limit</span>
                    <span className="text-rose-600 font-bold">16B Max</span>
                  </div>
                </div>

                {/* Live Byte Stream Preview */}
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1 flex justify-between">
                    <span>Payload Stream Preview:</span>
                    <span className="text-cyan-400">{payloadType}</span>
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {getPayloadBytes().map((byte, idx) => (
                      <span 
                        key={idx} 
                        className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-black shadow-inner ${
                          idx < 8 
                            ? "bg-blue-600/30 text-sky-300 border border-blue-500/50" 
                            : payloadType === "EXPLOIT" 
                              ? "bg-rose-500 text-white border border-rose-400 animate-pulse" 
                              : "bg-amber-500 text-slate-950 border border-amber-400"
                        }`}
                        title={idx >= 8 ? `Byte ${idx + 1}: Overflows into Return Pointer!` : `Byte ${idx + 1}: Fits in local buffer`}
                      >
                        {byte}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Main Action Button */}
                <button
                  onClick={handleInject}
                  disabled={sysState === "PROCESSING"}
                  className={`w-full py-2 px-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    stage >= 5
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                      : payloadType === "EXPLOIT"
                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                        : payloadLen > 8
                          ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                  }`}
                >
                  <Zap size={16} className="fill-current"/>
                  {sysState === "PROCESSING" ? "Injecting Data Packet..." : 
                   stage >= 5 ? "Inject Exploit (Verify Shield)" : 
                   `Inject Payload (${payloadLen} Bytes)`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Hemisphere: Visual Memory Architecture & Dynamic Stack */}
        <div className="flex-1 bg-slate-100/60 relative flex flex-col items-center justify-between p-4 lg:p-6 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden min-h-0">
          
          {/* Visual Canvas (600x380 Relative Coordinate Space) */}
          <div className="relative w-full max-w-[580px] aspect-[600/380] shrink-0 my-auto">
            
            {/* SVG Data Flow & Redirect Laser Traces */}
            <svg viewBox="0 0 600 380" className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible hidden md:block">
              <defs>
                <linearGradient id="laserBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="laserRed" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>

              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes flow-fwd { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
                .laser-fwd { animation: flow-fwd 0.8s linear infinite; }
              `}} />
              
              {/* Background Guide Tracks */}
              <path d="M 180 100 L 320 100" stroke="#cbd5e1" strokeWidth="4" fill="none" strokeDasharray="6 6" />
              <path d="M 320 100 L 250 100 L 250 280 L 180 280" stroke="#e2e8f0" strokeWidth="4" fill="none" strokeDasharray="6 6" />
              
              {/* Active Lasers */}
              {sysState === "HIJACKED" ? (
                <path 
                  d="M 320 100 L 250 100 L 250 280 L 180 280" 
                  stroke="url(#laserRed)" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeLinejoin="round" 
                  strokeLinecap="round" 
                  strokeDasharray="12 12" 
                  className="laser-fwd drop-shadow-[0_0_10px_rgba(244,63,94,0.7)]" 
                />
              ) : sysState === "SECURED" || stage === 1 || stage === 2 || sysState === "IDLE" ? (
                <path 
                  d="M 180 100 L 320 100" 
                  stroke="url(#laserBlue)" 
                  strokeWidth="5" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeDasharray="8 8" 
                  className="laser-fwd drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                />
              ) : null}
            </svg>

            {/* main() Function Node */}
            <div className={`hidden md:flex absolute top-[18%] left-[5%] w-[25%] h-[16%] bg-white border-2 rounded-xl shadow-md items-center justify-center text-sm font-bold font-mono z-20 transition-all duration-300 ${
              sysState === 'PROCESSING' 
                ? 'border-blue-500 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105' 
                : 'border-slate-300 text-slate-700'
            }`}>
              <div className="flex flex-col items-center">
                <span>main()</span>
                <span className="text-[9px] text-slate-400 font-normal">Normal Flow</span>
              </div>
              <div className={`absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 rounded-full transition-colors duration-300 ${
                sysState === 'PROCESSING' ? 'border-blue-500 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'border-slate-300'
              }`} />
            </div>

            {/* hacker_shell() Function Node */}
            <div className={`hidden md:flex absolute top-[65%] left-[5%] w-[25%] h-[16%] border-2 rounded-xl shadow-md items-center justify-center text-sm font-bold font-mono transition-all duration-500 z-20 ${
              sysState === 'HIJACKED' 
                ? 'bg-rose-600 border-rose-700 text-white shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-105 animate-pulse' 
                : 'bg-slate-100/80 border-slate-300 text-slate-400 border-dashed'
            }`}>
              {/* Address Badge */}
              <div className="absolute -top-3 -right-2 bg-slate-900 text-rose-300 text-[10px] px-2 py-0.5 rounded shadow border border-slate-700 font-bold tracking-wider z-30 font-mono">
                0xH4CK3D
              </div>

              <div className="flex flex-col items-center">
                <span className="flex items-center gap-1.5">
                  <AlertOctagon size={14}/> hacker_shell()
                </span>
                <span className="text-[9px] opacity-80 font-normal">Unauthorized Root</span>
              </div>
              
              <div className={`absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 rounded-full transition-colors duration-500 ${
                sysState === 'HIJACKED' ? 'border-rose-500 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]' : 'border-slate-300'
              }`} />
            </div>

            {/* System Memory Stack Chamber */}
            <div className={`absolute top-[5%] left-[54%] w-[42%] h-[90%] bg-white border-2 border-slate-300 rounded-3xl shadow-xl z-20 overflow-hidden flex flex-col p-4 transition-transform duration-300 ${
              isErrorState ? 'animate-shake' : ''
            }`}>
              
              {/* Stack Chamber Header */}
              <div className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-2 flex items-center justify-center gap-1.5">
                <Cpu size={12}/> System Memory Stack
              </div>

              {/* RETURN ADDRESS SLOT (TOP OF STACK) */}
              <div className="relative mb-3">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex justify-between">
                  <span>Return Address Pointer</span>
                  <span className="font-mono text-[9px]">[4 Bytes]</span>
                </div>
                
                <div className={`w-full h-11 rounded-xl border-2 flex items-center justify-center font-mono text-sm font-black transition-all duration-300 shadow-inner relative overflow-hidden ${
                  sysState === 'HIJACKED' 
                    ? 'bg-rose-500 text-white border-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                    : sysState === 'CRASHED' 
                      ? 'bg-amber-100 text-amber-900 border-amber-500' 
                      : 'bg-slate-900 text-cyan-300 border-slate-800'
                }`}>
                  {returnAddress}
                  {sysState === "HIJACKED" && (
                    <span className="absolute right-2 top-1 text-[8px] bg-rose-900/80 px-1 rounded uppercase font-sans">
                      HIJACKED
                    </span>
                  )}
                </div>
              </div>

              {/* PHYSICAL MEMORY BOUNDARY BARRIER (THE CRITICAL ELEMENT) */}
              <div className="relative my-1 flex items-center justify-center">
                {isPatched ? (
                  /* Armored fgets boundary barrier */
                  <motion.div 
                    initial={{ scaleX: 0 }} 
                    animate={{ scaleX: 1 }} 
                    className="w-full py-1 px-2 bg-emerald-500 text-white rounded-md text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400 z-30"
                  >
                    <Lock size={11} className="fill-current"/>
                    <span>Boundary Enforced (8-Byte Limit)</span>
                  </motion.div>
                ) : isErrorState ? (
                  /* Fractured / Breached Boundary */
                  <div className="w-full py-0.5 px-2 bg-rose-600/90 text-white rounded text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 animate-pulse z-30 shadow-md">
                    <Zap size={10} className="fill-current text-amber-300"/>
                    <span>⚠️ Boundary Breached (gets overflow)</span>
                  </div>
                ) : (
                  /* Normal 8-byte limit line */
                  <div className="w-full border-t-2 border-dashed border-cyan-400/80 flex items-center justify-center relative my-1">
                    <span className="bg-cyan-50 text-cyan-700 px-2 text-[8px] font-bold font-mono tracking-wider border border-cyan-200 rounded-full uppercase">
                      Physical Buffer Boundary
                    </span>
                  </div>
                )}
              </div>

              {/* LOCAL BUFFER SLOTS (8 FINITE BYTES) */}
              <div className="flex-1 flex flex-col justify-end mt-1">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex justify-between">
                  <span>char buffer[8]</span>
                  <span className="font-mono text-[9px]">[8 Bytes]</span>
                </div>

                <div className="w-full h-28 border-2 border-blue-200 bg-blue-50/50 rounded-xl p-2 relative grid grid-cols-4 grid-rows-2 gap-1.5 shadow-inner">
                  {/* Empty Background Slots (8 bytes) */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`slot-${i}`}
                      className="rounded border border-dashed border-blue-300/80 bg-blue-100/30 flex items-center justify-center text-[8px] font-mono text-blue-400 font-bold"
                    >
                      B{i}
                    </div>
                  ))}

                  {/* Filled Data Bytes */}
                  <AnimatePresence>
                    {bufferData.map((byte, i) => {
                      const isOverflow = i >= 8;
                      return (
                        <motion.div
                          key={`${i}-${byte}`}
                          initial={{ opacity: 0, y: -40, scale: 0.8 }}
                          animate={{ 
                            opacity: 1, 
                            y: isOverflow ? -100 : 0, 
                            scale: 1,
                            rotate: isOverflow ? ((i % 2 === 0 ? 1 : -1) * 10) : 0 
                          }}
                          transition={{ type: "spring", stiffness: 350, damping: 22, delay: i * 0.04 }}
                          className={`rounded border-2 flex items-center justify-center font-mono font-bold text-xs shadow-sm absolute ${
                            byte === 'A' 
                              ? isOverflow 
                                ? 'bg-amber-400 border-amber-600 text-slate-950 z-30 shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                                : 'bg-sky-500 border-sky-600 text-white z-10'
                              : byte === 'X' 
                                ? 'bg-indigo-500 border-indigo-600 text-white z-10' 
                                : 'bg-rose-500 border-rose-700 text-white z-30 shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                          }`}
                          style={{
                            width: 'calc(25% - 5px)',
                            height: 'calc(50% - 5px)',
                            left: `calc(8px + ${(i % 4) * 25}%)`,
                            bottom: `calc(8px + ${Math.floor((i % 8) / 4) * 50}%)`,
                            zIndex: isOverflow ? 40 : 10
                          }}
                        >
                          {byte}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>

          {/* Cyberpunk Terminal Output Console */}
          <div className="w-full max-w-[580px] mt-3 bg-slate-900 rounded-xl border border-slate-800 p-3 shadow-xl shrink-0 z-30 relative">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Terminal size={13} className="text-slate-400"/>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">System Execution Console</span>
              </div>
              <span className="text-[9px] font-mono text-cyan-400">tty1</span>
            </div>

            <div className="font-mono text-xs leading-snug flex flex-col gap-1 min-h-[2.5rem]">
              {terminalLog.map((log, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, x: -6 }} 
                  animate={{ opacity: i === terminalLog.length - 1 ? 1 : 0.6, x: 0 }}
                  className={
                    log.includes("FATAL") || log.includes("REJECTED") || log.includes("CRITICAL") ? "text-rose-400 font-bold" : 
                    log.includes("BLOCKED") || log.includes("SUCCESS") ? "text-emerald-400 font-bold" : 
                    log.includes("HINT") ? "text-amber-300 font-semibold" : 
                    "text-sky-300"
                  }
                >
                  &gt; {log}
                </motion.span>
              ))}
              {sysState === "PROCESSING" && (
                <span className="text-slate-500 animate-pulse">&gt; _</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </LabShell>
  );
}

// Trigger HMR
