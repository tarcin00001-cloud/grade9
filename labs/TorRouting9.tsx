"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, Send, ShieldCheck, Lock, Eye, Network, Activity } from "lucide-react";

type Phase = "STEP1_LEARN" | "STEP2_TRY" | "STEP3_FAIL" | "STEP4_UNDERSTAND" | "STEP5_IMPROVE" | "STEP6_COMPLETE" | "OUTCOME";

const TIMER_DURATION_SECONDS = 5 * 60;

export default function TorRouting9() {
  const { reportComplete: _reportComplete } = useLMSBridge("torrouting9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [phase, setPhase] = useState<Phase>("STEP1_LEARN");
  const [nodePosition, setNodePosition] = useState(0); 
  const [layers, setLayers] = useState<string[]>([]); 

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

  const handleSendDirect = () => {
    if (phase !== "STEP1_LEARN") return;
    playPop();
    setPhase("STEP2_TRY");
    setNodePosition(5); 
    
    setTimeout(() => {
      playError();
      setPhase("STEP3_FAIL");
    }, 1000);
  };

  const handleInitTor = () => {
    if (phase !== "STEP3_FAIL" && phase !== "STEP4_UNDERSTAND") return;
    playPop();
    setNodePosition(0); 
    setPhase("STEP5_IMPROVE");
  };

  const handleAddLayer = (layer: string) => {
    playZap();
    setLayers(prev => [...prev, layer]);
  };

  const handleSendTor = () => {
    if (phase !== "STEP5_IMPROVE") return;
    playPop();
    setPhase("STEP6_COMPLETE");
    
    setNodePosition(1);
    setTimeout(() => {
      playZap();
      setLayers(prev => prev.filter(l => l !== "GUARD")); 
      
      setTimeout(() => {
        setNodePosition(2);
        playPop();
        setTimeout(() => {
          playZap();
          setLayers(prev => prev.filter(l => l !== "MIDDLE")); 
          
          setTimeout(() => {
            setNodePosition(3);
            playPop();
            setTimeout(() => {
              playZap();
              setLayers(prev => prev.filter(l => l !== "EXIT")); 
              
              setTimeout(() => {
                setNodePosition(4);
                playPop();
                setTimeout(() => {
                  playSuccess();
                  setPhase("OUTCOME");
                  setTimeout(reportComplete, 1500);
                }, 600);
              }, 800);
            }, 800);
          }, 800);
        }, 800);
      }, 800);
    }, 1000);
  };

  const resetState = () => {
    setPhase("STEP1_LEARN");
    setNodePosition(0);
    setLayers([]);
    setSecondsLeft(TIMER_DURATION_SECONDS);
    setTimedOut(false);
  };

  const getInstruction = () => {
    switch (phase) {
      case "STEP1_LEARN": return "Learn: Standard web traffic is like a transparent postcard. Click 'Send Plaintext Message' to transmit.";
      case "STEP2_TRY": return "Try: Sending unprotected packet straight across the open internet...";
      case "STEP3_FAIL": return "Fail Safely: PRIVACY COMPROMISED! The ISP tap intercepted your message. They can see what you sent and who you sent it to.";
      case "STEP4_UNDERSTAND": return "Understand Why: Your packet had no encryption layers. Click 'Initialize TOR Network' to secure your connection.";
      case "STEP5_IMPROVE": 
        if (!layers.includes("EXIT")) return "Improve: Wrap your message in multiple encryption layers (like an Onion). First, apply the Exit Node Key.";
        if (!layers.includes("MIDDLE")) return "Improve: Now, apply the Middle Node Key.";
        if (!layers.includes("GUARD")) return "Improve: Finally, apply the Guard Node Key.";
        return "Improve: Your Onion Packet is fully sealed! Ready to transmit.";
      case "STEP6_COMPLETE": return "Complete: Transmitting encrypted packet. The ISP cannot read the contents or see the final destination!";
      case "OUTCOME": return "Outcome: Total Privacy Achieved! The packet unwrapped one layer at each hop, arriving safely and anonymously.";
    }
  };

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const getPacketCoords = () => {
    if (nodePosition === 0) return { x: 100, y: 250 };
    if (nodePosition === 5) return { x: 400, y: 250 }; 
    if (nodePosition === 1) return { x: 250, y: 120 }; 
    if (nodePosition === 2) return { x: 450, y: 380 }; 
    if (nodePosition === 3) return { x: 600, y: 120 }; 
    if (nodePosition === 4) return { x: 700, y: 250 }; 
    return { x: 100, y: 250 };
  };

  const TorNode = ({ x, y, label, role, strokeColor }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="32" fill="#ffffff" stroke={strokeColor} strokeWidth="3" filter="url(#hardware-shadow)" />
      <circle r="26" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" className={phase === "STEP6_COMPLETE" ? "animate-[spin-slow_4s_linear_infinite]" : ""} />
      <text x="0" y="-42" fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle">{role}</text>
      <text x="0" y="5" fill={strokeColor} fontSize="14" fontWeight="black" textAnchor="middle">{label}</text>
    </g>
  );

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
      labId="torrouting9"
      theme="ocean"
      title="The Onion Router (TOR) Network"
      instruction={getInstruction()}
      onReset={resetState}
    >
      <Celebration isActive={phase === "OUTCOME"} message="Total Anonymity Achieved!" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        @keyframes dash { to { stroke-dashoffset: -16; } }
        @keyframes ping-slow { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
      `}} />

      <div className="w-full flex flex-col md:flex-row flex-1 min-h-0 gap-4 pt-1">
        
        {/* ── LEFT: Control Panel ── */}
        <div className="md:w-[340px] shrink-0 flex flex-col gap-4">
          
          <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${
            phase === "STEP3_FAIL" ? "border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]" :
            phase === "OUTCOME" ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "border-slate-200"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className={`w-5 h-5 ${phase === "STEP3_FAIL" ? "text-rose-600 animate-pulse" : "text-slate-400"}`} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Espionage Console</span>
              {phase !== "STEP3_FAIL" && phase !== "OUTCOME" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Live Recording" />
              )}
            </div>
            
            <div className="text-2xl font-black tracking-tight mb-2">
              {phase === "STEP1_LEARN" && <span className="text-slate-700">AWAITING TRANSMIT<span className="animate-pulse">_</span></span>}
              {phase === "STEP2_TRY" && <span className="text-amber-500">TRANSMITTING...</span>}
              {phase === "STEP3_FAIL" && <span className="text-rose-600">PACKET INTERCEPTED</span>}
              {phase === "STEP4_UNDERSTAND" && <span className="text-rose-600">PRIVACY BREACHED</span>}
              {phase === "STEP5_IMPROVE" && <span className="text-indigo-600">CONFIGURING TOR...</span>}
              {phase === "STEP6_COMPLETE" && <span className="text-amber-500">ROUTING SECURELY...</span>}
              {phase === "OUTCOME" && <span className="text-emerald-600">DELIVERED SAFELY</span>}
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Network size={14} className={phase >= "STEP5_IMPROVE" ? "text-indigo-500" : "text-slate-400"}/>
              {phase >= "STEP5_IMPROVE" ? "Protocol: Onion Routing" : "Protocol: Direct Cleartext"}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex-1 flex flex-col gap-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              Transmission Controls
            </h3>

            <button 
              onClick={handleSendDirect}
              disabled={phase !== "STEP1_LEARN"}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                phase === "STEP1_LEARN" 
                  ? "bg-slate-800 border-slate-900 text-white hover:bg-slate-700 shadow-md" 
                  : phase < "STEP4_UNDERSTAND" ? "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed" : "hidden"
              }`}
            >
              <span className="flex items-center gap-2">
                {phase === "STEP1_LEARN" ? <Send size={18} className="text-slate-300"/> : <Lock size={16}/>} 
                1. Send Plaintext
              </span>
            </button>

            <button 
              onClick={handleInitTor}
              disabled={phase !== "STEP3_FAIL" && phase !== "STEP4_UNDERSTAND"}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                phase === "STEP3_FAIL" || phase === "STEP4_UNDERSTAND"
                  ? "bg-indigo-600 border border-indigo-700 text-white hover:bg-indigo-700 shadow-md animate-pulse" 
                  : phase < "STEP5_IMPROVE" ? "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed" : "hidden"
              }`}
            >
              <span className="flex items-center gap-2">
                {phase === "STEP3_FAIL" || phase === "STEP4_UNDERSTAND" ? <Network size={18} className="text-indigo-200"/> : <Lock size={16}/>}
                2. Initialize TOR Network
              </span>
            </button>

            {phase >= "STEP5_IMPROVE" && (
              <>
                <button 
                  onClick={() => handleAddLayer("EXIT")}
                  disabled={phase !== "STEP5_IMPROVE" || layers.includes("EXIT")}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                    phase === "STEP5_IMPROVE" && !layers.includes("EXIT")
                      ? "bg-amber-50 border-2 border-amber-400 text-amber-700 hover:bg-amber-100 shadow-sm" 
                      : "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {layers.includes("EXIT") ? <ShieldCheck size={18} className="text-emerald-500"/> : <Lock size={16}/>}
                    3. Apply Exit Node Key
                  </span>
                </button>

                <button 
                  onClick={() => handleAddLayer("MIDDLE")}
                  disabled={phase !== "STEP5_IMPROVE" || !layers.includes("EXIT") || layers.includes("MIDDLE")}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                    phase === "STEP5_IMPROVE" && layers.includes("EXIT") && !layers.includes("MIDDLE")
                      ? "bg-fuchsia-50 border-2 border-fuchsia-400 text-fuchsia-700 hover:bg-fuchsia-100 shadow-sm" 
                      : "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {layers.includes("MIDDLE") ? <ShieldCheck size={18} className="text-emerald-500"/> : <Lock size={16}/>}
                    4. Apply Middle Node Key
                  </span>
                </button>

                <button 
                  onClick={() => handleAddLayer("GUARD")}
                  disabled={phase !== "STEP5_IMPROVE" || !layers.includes("MIDDLE") || layers.includes("GUARD")}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                    phase === "STEP5_IMPROVE" && layers.includes("MIDDLE") && !layers.includes("GUARD")
                      ? "bg-indigo-50 border-2 border-indigo-400 text-indigo-700 hover:bg-indigo-100 shadow-sm" 
                      : "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {layers.includes("GUARD") ? <ShieldCheck size={18} className="text-emerald-500"/> : <Lock size={16}/>}
                    5. Apply Guard Node Key
                  </span>
                </button>
                
                <button 
                  onClick={handleSendTor}
                  disabled={phase !== "STEP5_IMPROVE" || !layers.includes("GUARD")}
                  className={`w-full py-3.5 mt-2 px-4 rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                    phase === "STEP5_IMPROVE" && layers.includes("GUARD")
                      ? "bg-emerald-600 border border-emerald-700 text-white hover:bg-emerald-700 shadow-md animate-pulse" 
                      : phase === "OUTCOME" ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {phase === "OUTCOME" ? <ShieldCheck size={18}/> : phase === "STEP5_IMPROVE" && layers.includes("GUARD") ? <Send size={18}/> : <Lock size={16}/>}
                    6. Transmit Onion Packet
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Surveillance Canvas ── */}
        <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative min-w-0">
          
          {/* Radar Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="px-4 py-3 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm flex justify-between items-center shrink-0 z-10 relative">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Eye size={14} /> Global Wiretap Map
            </h2>
          </div>
          
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
            <svg viewBox="0 0 800 500" className="w-full h-full max-w-[800px] max-h-[500px]" preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.4" />
                  <path d="M 18 20 L 22 20 M 20 18 L 20 22" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
                </pattern>
                <filter id="hardware-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#020617" floodOpacity="0.15" />
                </filter>
                <filter id="packet-glow">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.8" />
                </filter>
              </defs>

              <rect width="100%" height="100%" fill="url(#radar-grid)" />

              {/* ── PATHS ── */}
              <path d="M 100 250 L 700 250" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 8" className={phase === "STEP2_TRY" ? "animate-[dash_1s_linear_infinite]" : ""} />
              
              {phase >= "STEP5_IMPROVE" && (
                <motion.path 
                  initial={{ pathLength: 0 }} 
                  animate={{ pathLength: 1 }} 
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d="M 100 250 L 250 120 L 450 380 L 600 120 L 700 250" 
                  fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="8 8" 
                  className={phase === "STEP6_COMPLETE" ? "animate-[dash_1s_linear_infinite]" : ""}
                />
              )}

              {/* ── FIXED ENTITIES ── */}
              
              {/* Origin User (Tactile Terminal) */}
              <g transform="translate(100, 250)">
                <rect x="-40" y="-35" width="80" height="70" rx="6" fill="#ffffff" stroke="#64748b" strokeWidth="2" filter="url(#hardware-shadow)" />
                <rect x="-40" y="-35" width="80" height="14" rx="6" fill="#f1f5f9" />
                <circle cx="-32" cy="-28" r="2.5" fill="#fca5a5" />
                <circle cx="-24" cy="-28" r="2.5" fill="#fcd34d" />
                <circle cx="-16" cy="-28" r="2.5" fill="#86efac" />
                <path d="M -40 -21 L 40 -21" stroke="#64748b" strokeWidth="2" />
                <text x="0" y="16" fill="#334155" fontSize="13" fontWeight="black" textAnchor="middle" letterSpacing="1">USER</text>
              </g>

              {/* ISP Sniffer Tap (Menacing Pulse) */}
              <g transform="translate(400, 250)">
                <circle r="30" fill="none" stroke={phase === "STEP3_FAIL" ? "#e11d48" : "#f59e0b"} strokeWidth="2" className="animate-[ping-slow_3s_ease-out_infinite]" />
                <circle r="30" fill={phase === "STEP3_FAIL" ? "#ffe4e6" : "#fffbeb"} stroke={phase === "STEP3_FAIL" ? "#e11d48" : "#f59e0b"} strokeWidth="3" filter="url(#hardware-shadow)" />
                
                <Eye x="-14" y="-18" size={28} color={phase === "STEP3_FAIL" ? "#e11d48" : "#d97706"} />
                <text x="0" y="20" fill={phase === "STEP3_FAIL" ? "#e11d48" : "#d97706"} fontSize="10" fontWeight="bold" textAnchor="middle">ISP TAP</text>
                
                {phase === "STEP3_FAIL" && (
                  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute">
                    <rect x="-65" y="-70" width="130" height="26" rx="4" fill="#e11d48" />
                    <text x="0" y="-53" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle" letterSpacing="1">INTERCEPTED!</text>
                  </motion.g>
                )}
              </g>

              {/* Target Server (Server Rack Texture) */}
              <g transform="translate(700, 250)">
                <rect x="-40" y="-35" width="80" height="70" rx="6" fill="#ffffff" stroke="#10b981" strokeWidth="2" filter="url(#hardware-shadow)" />
                <rect x="-35" y="-28" width="70" height="12" rx="2" fill="#f1f5f9" stroke="#10b981" strokeWidth="1" />
                <rect x="-35" y="-10" width="70" height="12" rx="2" fill="#f1f5f9" stroke="#10b981" strokeWidth="1" />
                <rect x="-35" y="8" width="70" height="12" rx="2" fill="#f1f5f9" stroke="#10b981" strokeWidth="1" />
                
                <circle cx="28" cy="-22" r="2" fill="#34d399" className="animate-pulse" />
                <circle cx="28" cy="-4" r="2" fill="#34d399" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                <circle cx="28" cy="14" r="2" fill="#34d399" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
                
                <rect x="-40" y="24" width="80" height="14" fill="#f1f5f9" rx="2"/>
                <text x="0" y="34" fill="#059669" fontSize="11" fontWeight="black" textAnchor="middle" letterSpacing="1">SERVER</text>
              </g>

              {/* TOR Nodes */}
              <AnimatePresence>
                {phase >= "STEP5_IMPROVE" && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                    <TorNode x={250} y={120} label="NODE 1" role="GUARD" strokeColor="#6366f1" />
                    <TorNode x={450} y={380} label="NODE 2" role="MIDDLE" strokeColor="#d946ef" />
                    <TorNode x={600} y={120} label="NODE 3" role="EXIT" strokeColor="#f59e0b" />
                  </motion.g>
                )}
              </AnimatePresence>

              {/* ── THE PACKET ── */}
              {phase !== "STEP4_UNDERSTAND" && (
                <motion.g 
                  initial={{ x: 100, y: 250 }}
                  animate={{ x: getPacketCoords().x, y: getPacketCoords().y }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  filter={layers.length > 0 ? "url(#packet-glow)" : "url(#hardware-shadow)"}
                >
                  <rect x="-20" y="-15" width="40" height="30" rx="4" fill={phase === "STEP3_FAIL" ? "#fecdd3" : "#ffffff"} stroke={phase === "STEP3_FAIL" ? "#e11d48" : "#94a3b8"} strokeWidth="2" />
                  <text x="0" y="3" fontSize="11" fontWeight="bold" textAnchor="middle" fill={phase === "STEP3_FAIL" ? "#e11d48" : "#475569"}>MSG</text>
                  
                  <AnimatePresence>
                    {layers.includes("EXIT") && (
                      <motion.g key="exit" initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.3}} transition={{ duration: 0.4 }}>
                        <rect x="-26" y="-20" width="52" height="40" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
                        <Lock x="-8" y="-9" size={16} color="#d97706" />
                      </motion.g>
                    )}
                    {layers.includes("MIDDLE") && (
                      <motion.g key="middle" initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.3}} transition={{ duration: 0.4 }}>
                        <rect x="-32" y="-25" width="64" height="50" rx="8" fill="#fdf4ff" stroke="#d946ef" strokeWidth="3" />
                        <Lock x="-10" y="-10" size={20} color="#c026d3" />
                      </motion.g>
                    )}
                    {layers.includes("GUARD") && (
                      <motion.g key="guard" initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.3}} transition={{ duration: 0.4 }}>
                        <rect x="-38" y="-30" width="76" height="60" rx="10" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
                        <Lock x="-12" y="-12" size={24} color="#4f46e5" />
                      </motion.g>
                    )}
                  </AnimatePresence>

                </motion.g>
              )}

            </svg>
          </div>
        </div>

      </div>
    </LabShell>
  );
}
