"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Lock, ShieldAlert, CheckCircle2, ChevronRight, Activity, Globe2, Cpu, BarChart3, AlertTriangle, Fingerprint, Network } from "lucide-react";

type Stage = 1 | 2 | 3 | 4;
type SimState = "idle" | "simulating" | "result_closed" | "result_fragmented" | "result_success";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function MobilePlatform37() {
  const { reportComplete } = useLMSBridge("mobileplatform37");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [stage, setStage] = useState<Stage>(1);
  const [simState, setSimState] = useState<SimState>("idle");
  
  // Executive Directives
  const [osOpen, setOsOpen] = useState(false);
  const [qaEnforced, setQaEnforced] = useState(false);
  
  const [userCount, setUserCount] = useState(2500000);
  const [feedback, setFeedback] = useState<{title: string, subtitle: string, msg: string, type: 'error'|'success'|'warning'} | null>(null);

  const counterRef = useRef<NodeJS.Timeout | null>(null);

  const handleReset = () => {
    setStage(1);
    setSimState("idle");
    setOsOpen(false);
    setQaEnforced(false);
    setUserCount(2500000);
    setFeedback(null);
    if (counterRef.current) clearInterval(counterRef.current);
    playPop();
  };

  const animateCounter = (target: number, duration: number) => {
    return new Promise<void>((resolve) => {
      if (counterRef.current) clearInterval(counterRef.current);
      const start = userCount;
      const startTime = performance.now();
      
      const update = () => {
        const now = performance.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        setUserCount(Math.floor(start + (target - start) * ease));
        
        if (progress < 1) {
          counterRef.current = setTimeout(update, 16);
        } else {
          resolve();
        }
      };
      update();
    });
  };

  const executeStrategy = async () => {
    if (simState === "simulating") return;
    setSimState("simulating");
    setFeedback(null);
    playZap();
    
    let targetUsers = 450000000;
    if (osOpen && !qaEnforced) targetUsers = 1800000000;
    if (osOpen && qaEnforced) targetUsers = 3000000000;

    await animateCounter(targetUsers, 2500);
    await wait(400);

    if (!osOpen) {
      playPop();
      setSimState("result_closed");
      setFeedback({
        title: "STRATEGY REPORT",
        subtitle: "LIMITED MARKET REACH",
        msg: "Premium proprietary devices deployed successfully. Quality is flawless, but 85% of the global population cannot afford this hardware. You failed to democratize computing.",
        type: "warning"
      });
    } else if (osOpen && !qaEnforced) {
      playError();
      setSimState("result_fragmented");
      setFeedback({
        title: "SYSTEM OVERLOAD",
        subtitle: "CRITICAL FRAGMENTATION",
        msg: "Global adoption exploded, but the open ecosystem collapsed. Developers abandoned the platform because apps crash constantly on thousands of untested, unregulated screen sizes.",
        type: "error"
      });
    } else {
      playSuccess();
      setSimState("result_success");
      setFeedback({
        title: "MARKET DOMINANCE",
        subtitle: "COMPUTING DEMOCRATIZED",
        msg: "The perfect architectural balance. Open Source access combined with Compatibility Standards allowed global partners to flood the market with affordable, stable devices.",
        type: "success"
      });
      setTimeout(() => {
        setStage(4);
        reportComplete();
      }, 5000);
    }
  };

  const acknowledgeReport = () => {
    setFeedback(null);
    setSimState("idle");
    if (stage === 1 && !osOpen) setStage(2);
    if (stage === 2 && osOpen && !qaEnforced) setStage(3);
  };

  // Holographic Map Nodes (Coordinates adjusted to prevent overlap with control deck and odometer)
  const regions = [
    { id: "NA", x: 220, y: 160, label: "NOR-AM" },
    { id: "SA", x: 280, y: 310, label: "LAT-AM" },
    { id: "EU", x: 450, y: 220, label: "EUR" },
    { id: "AF", x: 520, y: 320, label: "AFR" },
    { id: "ASIA", x: 740, y: 180, label: "ASIA-PAC" },
  ];

  return (
    <LabShell 
      labId="mobileplatform37" 
      theme="ocean" 
      title="Sundar Pichai & Mobile Platforms" 
      instruction="Architect a software ecosystem strategy to bring computing to 3 Billion people." 
      compact
      onReset={handleReset}
    >
      <Celebration 
        isActive={stage === 4} 
        message="Mission Accomplished! You proved that technology platforms serve as great equalizers when designed with accessibility and global diversity as core principles." 
        onReplay={handleReset} 
      />

      {/* THE EXECUTIVE HOLO-TABLE */}
      <div className="w-full flex-1 relative bg-slate-950 overflow-hidden rounded-[2rem] border border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] flex flex-col font-sans">
        
        {/* Holographic Grid Background & Projector Core */}
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none z-0" 
          style={{ background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.15) 0%, rgba(12, 74, 110, 0.05) 40%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/20 via-transparent to-transparent pointer-events-none" />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes dataflow {
            from { stroke-dashoffset: 18; }
            to { stroke-dashoffset: 0; }
          }
          .animate-dataflow { animation: dataflow 1s linear infinite; }
          .animate-dataflow-fast { animation: dataflow 0.15s linear infinite; }
        `}} />

        {/* TOP LAYER: Cinematic Odometer */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none w-full px-4 text-center">

          {/* Clean HUD Instruction (High Contrast) */}
          <p className="text-[11px] md:text-xs text-sky-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold mb-6 tracking-widest uppercase">
            Architect a software ecosystem strategy to bring computing to 3 Billion people.
          </p>

          <div className="flex items-center gap-3 mb-1 border-b border-sky-500/20 pb-2 px-8">
            <Network size={14} className="text-sky-400 opacity-70" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-sky-300/80 drop-shadow-md">
              Global Active Devices
            </span>
          </div>
          
          <div className={`transition-all duration-300 ${simState === 'result_fragmented' ? 'animate-shake' : ''}`}>
            {/* Sleek, textured holographic font */}
            <span className={`font-sans text-5xl md:text-7xl font-light tracking-widest bg-clip-text text-transparent
              ${simState === 'result_success' ? 'bg-gradient-to-b from-emerald-100 to-emerald-700 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]' : 
                simState === 'result_fragmented' ? 'bg-gradient-to-b from-amber-100 to-amber-700 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 
                'bg-gradient-to-b from-white via-sky-100 to-slate-600 drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]'}`}>
              {Intl.NumberFormat('en-US').format(userCount)}
            </span>
          </div>
        </div>

        {/* MAP CANVAS (Hologram Layer) */}
        <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
          
          {/* Fiber Optic Data Lines (Animated) */}
          <g className={`transition-opacity duration-1000 ${simState === 'idle' ? 'opacity-50' : 'opacity-100'}`}>
            <path d="M220 160 L450 220 L740 180" stroke={simState === 'result_success' ? '#10b981' : simState === 'result_fragmented' ? '#f59e0b' : '#38bdf8'} strokeWidth="3" strokeDasharray="6 12" fill="none" className={simState === 'simulating' ? 'animate-dataflow-fast' : 'animate-dataflow'} />
            <path d="M220 160 L280 310 L520 320 L740 180" stroke={simState === 'result_success' ? '#10b981' : simState === 'result_fragmented' ? '#f59e0b' : '#38bdf8'} strokeWidth="3" strokeDasharray="6 12" fill="none" className={simState === 'simulating' ? 'animate-dataflow-fast' : 'animate-dataflow'} />
            <path d="M450 220 L520 320" stroke={simState === 'result_success' ? '#10b981' : simState === 'result_fragmented' ? '#f59e0b' : '#38bdf8'} strokeWidth="3" strokeDasharray="6 12" fill="none" className={simState === 'simulating' ? 'animate-dataflow-fast' : 'animate-dataflow'} />
          </g>

          {/* Region Nodes */}
          {regions.map(c => {
            const isActive = simState !== 'idle' && (c.id === "NA" || c.id === "EU" || osOpen);
            const isFragmented = simState === 'result_fragmented' && isActive;
            const isHealthy = simState === 'result_success' && isActive;
            
            return (
              <foreignObject key={c.id} x={c.x - 70} y={c.y - 45} width="140" height="90" className="overflow-visible">
                <div className={`w-full h-full flex flex-col items-center justify-center transition-all duration-700 ${isFragmented ? 'animate-shake' : ''}`}>
                  
                  {/* Radar Pulse */}
                  <div className={`absolute inset-0 rounded-full transition-all duration-1000 
                    ${isHealthy ? 'bg-emerald-500/30 animate-ping opacity-80' : 
                      isFragmented ? 'bg-amber-500/40 animate-ping opacity-90' : 
                      isActive ? 'bg-sky-500/30 animate-pulse opacity-60' : 'bg-transparent'}`} />
                  
                  {/* Glass Node Core */}
                  <div className={`w-14 h-14 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center relative z-10 transition-colors duration-500
                    ${isHealthy ? 'bg-emerald-950/90 shadow-[0_0_30px_rgba(16,185,129,0.5)] border-emerald-500/80 text-emerald-400' : 
                      isFragmented ? 'bg-amber-950/90 shadow-[0_0_30px_rgba(245,158,11,0.5)] border-amber-500/80 text-amber-500' : 
                      isActive ? 'bg-sky-950/90 shadow-[0_0_30px_rgba(56,189,248,0.5)] border-sky-400/80 text-sky-400' : 
                      'bg-slate-800 shadow-lg border-slate-600 text-slate-300'}`}>
                    
                    {isFragmented ? <AlertTriangle size={24} /> : 
                      isActive ? <Globe2 size={24} /> : 
                      <Globe2 size={24} opacity={0.6} />}
                  </div>
                  
                  {/* Cyber Label */}
                  <span className={`text-[10px] font-sans font-bold uppercase tracking-[0.15em] mt-3 transition-colors duration-500 whitespace-nowrap
                    ${isHealthy ? 'text-emerald-400 drop-shadow-md' : 
                      isFragmented ? 'text-amber-400 drop-shadow-md' : 
                      isActive ? 'text-sky-300 drop-shadow-md' : 'text-slate-400'}`}>
                    {c.label}
                  </span>
                </div>
              </foreignObject>
            );
          })}
        </svg>

        {/* EXECUTIVE MARKET REPORT (Feedback Panel) */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="absolute top-8 right-8 z-50 w-80 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 border border-slate-600"
            >
              <div className={`flex items-center gap-3 mb-2 pb-3 border-b border-slate-700
                ${feedback.type === 'error' ? 'text-amber-500' : feedback.type === 'warning' ? 'text-sky-400' : 'text-emerald-400'}`}>
                {feedback.type === 'error' ? <AlertTriangle size={20} /> : feedback.type === 'warning' ? <BarChart3 size={20} /> : <CheckCircle2 size={20} />}
                <h3 className="font-sans uppercase tracking-widest text-sm font-bold">{feedback.title}</h3>
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">{feedback.subtitle}</h4>
              <p className="text-sm text-slate-200 leading-relaxed mb-6 font-medium">{feedback.msg}</p>
              
              <button 
                onClick={acknowledgeReport} 
                className={`w-full py-4 font-black text-[11px] uppercase tracking-widest rounded-lg transition-all shadow-lg border
                  ${feedback.type === 'error' ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600' : 
                    feedback.type === 'warning' ? 'bg-sky-500 text-white border-sky-600 hover:bg-sky-600' : 
                    'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'}`}
              >
                Acknowledge Protocol
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM LAYER: Strategic Directives Desk (High Contrast Refactor) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[96%] max-w-5xl bg-slate-800/95 backdrop-blur-2xl border border-slate-500 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl p-4 flex flex-col lg:flex-row items-center gap-6 z-30">
          
          {/* Phase Intelligence */}
          <div className="hidden lg:flex flex-col gap-1 w-40 shrink-0 border-r border-slate-600 pr-6">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400">Operation Phase</span>
            <div className="flex gap-1.5 my-1">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-2 flex-1 rounded-full transition-all ${stage >= s ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'bg-slate-700'}`} />
              ))}
            </div>
            <span className="text-xs font-black text-white truncate tracking-wide">
              {stage === 1 ? "Premium Control" : stage === 2 ? "Open Source Scale" : "Ecosystem Balance"}
            </span>
          </div>

          {/* Strategic Toggles Group */}
          <div className="flex w-full lg:w-auto gap-4 flex-1 justify-center">
            
            {/* Directive 1: OS Architecture */}
            <div className="flex-1 flex flex-col gap-2 relative">
               {stage < 2 && (
                 <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center border border-slate-700/50 shadow-inner">
                   <Lock size={20} className="text-slate-400" />
                   <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Locked</span>
                 </div>
               )}
               <span className="text-[10px] text-sky-300 font-black tracking-[0.15em] uppercase px-1 flex items-center gap-2"><Cpu size={14}/> OS Architecture</span>
               <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-700">
                  <button 
                    disabled={stage < 2 || simState === 'simulating'}
                    onClick={() => { setOsOpen(false); playPop(); }}
                    className={`flex-1 py-3 px-2 rounded-lg text-xs font-black tracking-widest transition-all uppercase 
                      ${!osOpen ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.5)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'}`}>
                     Proprietary
                  </button>
                  <button 
                    disabled={stage < 2 || simState === 'simulating'}
                    onClick={() => { setOsOpen(true); if(qaEnforced) setQaEnforced(false); playPop(); }}
                    className={`flex-1 py-3 px-2 rounded-lg text-xs font-black tracking-widest transition-all uppercase 
                      ${osOpen ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'}`}>
                     Open Source
                  </button>
               </div>
            </div>

            {/* Directive 2: Compatibility Standards */}
            <div className="flex-1 flex flex-col gap-2 relative">
               {stage < 3 && (
                 <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center border border-slate-700/50 shadow-inner">
                   <Lock size={20} className="text-slate-400" />
                   <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Locked</span>
                 </div>
               )}
               <span className="text-[10px] text-sky-300 font-black tracking-[0.15em] uppercase px-1 flex items-center gap-2"><Fingerprint size={14}/> Quality Assurance</span>
               <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-700">
                  <button 
                    disabled={stage < 3 || simState === 'simulating'}
                    onClick={() => { setQaEnforced(false); playPop(); }}
                    className={`flex-1 py-3 px-2 rounded-lg text-xs font-black tracking-widest transition-all uppercase 
                      ${!qaEnforced ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'}`}>
                     Bypassed
                  </button>
                  <button 
                    disabled={stage < 3 || simState === 'simulating'}
                    onClick={() => { setQaEnforced(true); playPop(); }}
                    className={`flex-1 py-3 px-2 rounded-lg text-xs font-black tracking-widest transition-all uppercase 
                      ${qaEnforced ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'}`}>
                     Enforced
                  </button>
               </div>
            </div>

          </div>

          {/* Action Button: Execution Protocol */}
          <button 
            onClick={executeStrategy}
            disabled={simState === 'simulating'}
            className={`w-full lg:w-auto shrink-0 h-[72px] px-8 rounded-xl font-black text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 border
              ${simState === 'simulating' ? 'bg-slate-900 text-slate-500 border-slate-700 cursor-not-allowed' : 
                'bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.5)] hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(14,165,233,0.7)] hover:scale-105 active:scale-95'}`}
          >
            {simState === 'simulating' ? (
              <><Activity size={20} className="animate-spin-slow"/> Processing</>
            ) : (
              <>Initiate Deployment <ChevronRight size={20}/></>
            )}
          </button>

        </div>
      </div>
    </LabShell>
  );
}
