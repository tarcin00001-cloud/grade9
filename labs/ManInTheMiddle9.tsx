"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Lock, Unlock, ShieldAlert, ShieldCheck, Laptop, Server, Terminal, Send, Skull, Network, Activity } from "lucide-react";

type Stage = 1 | 2 | 3 | 4;
type AnimState = "idle" | "start" | "router1" | "eve" | "eve_bounce" | "router2" | "bob";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ManInTheMiddle9() {
  const { reportComplete } = useLMSBridge("maninthemiddle9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [stage, setStage] = useState<Stage>(1);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [arpPoisoned, setArpPoisoned] = useState(false);
  const [tlsEnabled, setTlsEnabled] = useState(false);
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [sniffedData, setSniffedData] = useState("");
  const [feedback, setFeedback] = useState<{title: string, msg: string, type: 'error'|'success'} | null>(null);

  const handleReset = () => {
    setStage(1);
    setIsTransmitting(false);
    setArpPoisoned(false);
    setTlsEnabled(false);
    setAnimState("idle");
    setSniffedData("");
    setFeedback(null);
    playPop();
  };

  const transmitPacket = async () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    setSniffedData("");
    setFeedback(null);
    
    setAnimState('start');
    await wait(50);
    
    playZap();
    setAnimState('router1');
    await wait(800);

    if (!arpPoisoned) {
       playPop();
       setAnimState('bob');
       await wait(800);
       playPop();
       setAnimState('idle');
       setFeedback({
          title: "Normal Transmission",
          msg: "The packet traveled safely from Alice, through the Router, directly to Bob.",
          type: "success"
       });
    } else {
       playPop();
       setAnimState('eve');
       await wait(800);
       
       if (tlsEnabled) {
          playZap();
          setAnimState('eve_bounce');
          setSniffedData("ACCESS_DENIED");
          await wait(400);
          
          playSuccess(); 
          setAnimState('eve');
          setSniffedData("5x9!2Lp#QvX");
       } else {
          playZap();
          const payload = "SECRET_CODE";
          for (let i = 1; i <= payload.length; i++) {
             setSniffedData(payload.substring(0, i) + (i < payload.length ? "█" : ""));
             await wait(60);
          }
          playError(); 
       }
       await wait(1500); 

       playPop();
       setAnimState('router2');
       await wait(800);

       playPop();
       setAnimState('bob');
       await wait(800);

       playPop();
       setAnimState('idle');
       
       if (tlsEnabled) {
          setFeedback({
             title: "System Secured!",
             msg: "Eve intercepted the packet, but End-to-End Encryption rendered it completely unreadable. The defense was successful.",
             type: "success"
          });
          setTimeout(() => {
             setStage(4);
             reportComplete();
          }, 3000);
       } else {
          setFeedback({
             title: "Traffic Compromised!",
             msg: "Because the data was Plaintext, Eve silently read the secret message before forwarding it. Bob has no idea he was spied on.",
             type: "error"
          });
       }
    }
    setIsTransmitting(false);
  };

  const acknowledgeFeedback = () => {
    setFeedback(null);
    if (stage === 1) setStage(2);
    if (stage === 2 && sniffedData === "SECRET_CODE") setStage(3);
  };

  const packetVariants: any = {
    idle: { opacity: 0, x: 120, y: 200, transition: { duration: 0.1 } },
    start: { opacity: 1, x: 120, y: 200, transition: { duration: 0.1 } },
    router1: { opacity: 1, x: 400, y: 80, transition: { duration: 0.8, ease: "linear" } },
    eve: { opacity: 1, x: 400, y: 320, transition: { duration: 0.8, ease: "linear" } },
    eve_bounce: { opacity: 1, x: 430, y: 290, transition: { type: "spring", stiffness: 400, damping: 10 } },
    router2: { opacity: 1, x: 400, y: 80, transition: { duration: 0.8, ease: "linear" } },
    bob: { opacity: 1, x: 680, y: 200, transition: { duration: 0.8, ease: "linear" } },
  };

  return (
    <LabShell 
      labId="maninthemiddle9" 
      theme="ocean" 
      title="Man-In-The-Middle (MitM)" 
      instruction="Execute a Man-In-The-Middle attack to intercept communications, then switch to defense mode to mathematically secure the network with Encryption." 
      compact
      onReset={handleReset}
    >
      <style>{`
        @keyframes data-flow { to { stroke-dashoffset: -24; } }
        .animate-data-flow { animation: data-flow 1s linear infinite; }
      `}</style>

      <Celebration 
        isActive={stage === 4} 
        message="Mission Accomplished! You proved that while we can't always stop hackers from intercepting traffic, Encryption completely destroys their ability to read it." 
        onReplay={handleReset} 
      />

      <div className="w-full flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0 relative isolate pb-4 max-w-7xl mx-auto px-2 md:px-4">
        
        <AnimatePresence>
           {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm w-full rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-5 md:p-6 text-center border-4 border-white
                  ${feedback.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}
              >
                 {feedback.type === 'error' ? <ShieldAlert size={48} className="mx-auto mb-3" /> : <ShieldCheck size={48} className="mx-auto mb-3" />}
                 <h3 className="font-black uppercase tracking-widest text-sm mb-2">{feedback.title}</h3>
                 <p className="font-bold text-base leading-tight mb-6">{feedback.msg}</p>
                 <button 
                   onClick={acknowledgeFeedback} 
                   className={`w-full py-4 bg-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md ${feedback.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}
                 >
                   Acknowledge
                 </button>
              </motion.div>
           )}
        </AnimatePresence>

        {/* LEFT COLUMN: Network Visualizer */}
        <div className="flex-1 bg-slate-50 rounded-3xl border-4 border-slate-200 shadow-inner flex flex-col relative overflow-hidden">
           
           {/* High-End Cyber Grid Background */}
           <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(#94a3b8_2px,transparent_2px)] [background-size:32px_32px]" />
           
           <svg viewBox="0 0 800 400" className="w-full h-full relative z-10" preserveAspectRatio="xMidYMid meet">
              <defs>
                 <linearGradient id="packet-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                 </linearGradient>
                 <linearGradient id="packet-green" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                 </linearGradient>
                 <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                       <feMergeNode in="coloredBlur"/>
                       <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                 </filter>
              </defs>

              {/* Base Structural Lines */}
              <path d="M120 200 L400 80" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
              <path d="M400 80 L680 200" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
              <path d="M400 80 L400 320" stroke={arpPoisoned ? "#fca5a5" : "#e2e8f0"} strokeWidth="8" strokeLinecap="round" className="transition-colors duration-500" />
              
              {/* Animated Traffic Flows */}
              <path d="M120 200 L400 80" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 12" strokeLinecap="round" className="animate-data-flow opacity-60" />
              <path d="M400 80 L680 200" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 12" strokeLinecap="round" className="animate-data-flow opacity-60" />
              {arpPoisoned && <path d="M400 80 L400 320" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 12" strokeLinecap="round" className="animate-data-flow opacity-80" />}
              
              {/* Gamified Circular Nodes */}
              {/* Alice */}
              <foreignObject x="70" y="150" width="100" height="100">
                <div className="flex flex-col items-center justify-center w-full h-full bg-white border-4 border-indigo-100 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.05)] relative group">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping opacity-30" />
                  <Laptop size={28} className="text-indigo-600 mb-1" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest relative z-10 bg-white/80 px-1 rounded">Alice</span>
                </div>
              </foreignObject>

              {/* Router */}
              <foreignObject x="350" y="30" width="100" height="100">
                <div className="flex flex-col items-center justify-center w-full h-full bg-white border-4 border-sky-100 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
                  <Network size={28} className="text-sky-600 mb-1" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest relative z-10 bg-white/80 px-1 rounded">Router</span>
                </div>
              </foreignObject>

              {/* Bob */}
              <foreignObject x="630" y="150" width="100" height="100">
                <div className="flex flex-col items-center justify-center w-full h-full bg-white border-4 border-indigo-100 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
                  <Server size={28} className="text-indigo-600 mb-1" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest relative z-10 bg-white/80 px-1 rounded">Bob</span>
                </div>
              </foreignObject>

              {/* Eve (Attacker) */}
              <foreignObject x="350" y="270" width="100" height="100">
                <div className={`flex flex-col items-center justify-center w-full h-full bg-white border-4 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.05)] transition-all duration-500 relative
                  ${arpPoisoned ? 'border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'border-slate-200'}`}>
                  {arpPoisoned && <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-40" />}
                  <Skull size={28} className={`mb-1 transition-colors duration-500 relative z-10 ${arpPoisoned ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 relative z-10 bg-white/80 px-1 rounded ${arpPoisoned ? 'text-rose-700' : 'text-slate-500'}`}>Eve</span>
                </div>
              </foreignObject>

              {/* The Data Packet (Glossy Pill) */}
              <motion.g animate={animState} variants={packetVariants} className="pointer-events-none">
                 <rect x="-35" y="-18" width="70" height="36" rx="18" fill={tlsEnabled ? "url(#packet-green)" : "url(#packet-blue)"} filter="url(#glow)" />
                 {tlsEnabled ? (
                    <Lock size={18} color="white" x="-9" y="-9" />
                 ) : (
                    <text x="0" y="5" fontSize="12" fill="white" fontWeight="900" textAnchor="middle" className="font-mono tracking-widest">DATA</text>
                 )}
              </motion.g>

           </svg>
        </div>

        {/* RIGHT COLUMN: Control Core */}
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-slate-200 shadow-xl p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden">
           
           {/* Progress Tracker */}
           <div className="shrink-0 bg-slate-50 rounded-2xl p-4 border border-slate-200">
             <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3].map(s => (
                   <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${stage >= s ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-200'}`} />
                ))}
             </div>
             <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-600 flex flex-wrap gap-1 items-center justify-between">
                <span className="whitespace-nowrap">Phase {Math.min(stage, 3)} of 3</span>
                <span className="text-slate-500 text-right leading-tight">{stage === 1 ? "Baseline Network" : stage === 2 ? "The MitM Exploit" : "End-to-End Encryption"}</span>
             </div>
           </div>

           {/* Eve's Packet Sniffer (Terminal) */}
           <div className="flex-1 bg-slate-900 rounded-2xl border-4 border-slate-800 overflow-hidden flex flex-col shadow-inner min-h-[160px] relative">
              {/* Scanline Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }} />
              
              <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-2 shrink-0 relative z-10">
                 <Terminal size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eve_Terminal // Packet_Sniffer</span>
              </div>
              
              <div className="flex-1 p-4 flex flex-col justify-center items-center relative z-10">
                 {sniffedData ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
                       <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Intercepted Payload</span>
                       <span className={`font-mono text-xl md:text-2xl font-black tracking-widest break-all block mb-2
                          ${sniffedData === 'ACCESS_DENIED' ? 'text-rose-500 animate-pulse drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-110 transition-transform' : 
                            tlsEnabled ? 'text-slate-400' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`}>
                          {sniffedData}
                       </span>
                       {tlsEnabled && (
                          <span className="inline-block mt-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-lg">
                             Original Message is Encrypted<br/>(Unreadable to Hacker)
                          </span>
                       )}
                    </motion.div>
                 ) : (
                    <span className="text-xs font-mono text-slate-600 opacity-80 uppercase tracking-widest text-center flex flex-col items-center gap-2">
                       <Activity size={24} className="animate-pulse" />
                       Waiting for traffic...
                    </span>
                 )}
              </div>
           </div>

           {/* Interactive Controls */}
           <div className="shrink-0 flex flex-col gap-3">
              
              {/* Control 1: Poison ARP */}
              <div className={`p-4 rounded-2xl border-2 transition-all relative ${stage >= 2 ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                 {stage < 2 && <Lock size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />}
                 <div className={`flex items-center justify-between ${stage < 2 ? 'pr-8' : ''}`}>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl transition-colors ${arpPoisoned ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}><Skull size={18}/></div>
                       <div>
                          <h4 className="text-sm font-black text-slate-800">Hijack Network Route</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attacker Exploit</p>
                       </div>
                    </div>
                    {stage >= 2 && (
                       <button 
                         disabled={isTransmitting}
                         onClick={() => { setArpPoisoned(p => !p); playPop(); }}
                         className={`w-14 h-7 rounded-full relative transition-colors shadow-inner ${arpPoisoned ? 'bg-rose-500' : 'bg-slate-300'} ${isTransmitting ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                       >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm ${arpPoisoned ? 'left-8' : 'left-1'}`} />
                       </button>
                    )}
                 </div>
              </div>

              {/* Control 2: Enable TLS */}
              <div className={`p-4 rounded-2xl border-2 transition-all relative ${stage >= 3 ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                 {stage < 3 && <Lock size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />}
                 <div className={`flex items-center justify-between ${stage < 3 ? 'pr-8' : ''}`}>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl transition-colors ${tlsEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}><ShieldCheck size={18}/></div>
                       <div>
                          <h4 className="text-sm font-black text-slate-800">Enable End-to-End Encryption</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Defense</p>
                       </div>
                    </div>
                    {stage >= 3 && (
                       <button 
                         disabled={isTransmitting}
                         onClick={() => { setTlsEnabled(p => !p); playPop(); }}
                         className={`w-14 h-7 rounded-full relative transition-colors shadow-inner ${tlsEnabled ? 'bg-emerald-500' : 'bg-slate-300'} ${isTransmitting ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                       >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm ${tlsEnabled ? 'left-8' : 'left-1'}`} />
                       </button>
                    )}
                 </div>
              </div>

              {/* Action Button */}
              <button 
                 onClick={transmitPacket}
                 disabled={isTransmitting}
                 className={`w-full mt-2 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg
                    ${isTransmitting ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
                      tlsEnabled ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 hover:shadow-[0_10px_20px_rgba(5,150,105,0.3)]' : 
                      'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 hover:shadow-[0_10px_20px_rgba(79,70,229,0.3)]'}`}
              >
                 {isTransmitting ? (
                    <><Activity size={18} className="animate-spin-slow"/> Transmitting...</>
                 ) : (
                    <><Send size={18}/> {tlsEnabled ? "Send Secure Packet" : "Send Plaintext Packet"}</>
                 )}
              </button>

           </div>
        </div>

      </div>
    </LabShell>
  );
}
