"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, ShieldCheck, Globe, Server, AlertTriangle, Lock, Unlock, FileBadge, ArrowRight, ShieldAlert, FileKey, HelpCircle, Wifi } from "lucide-react";

const TIMER_DURATION_SECONDS = 5 * 60;

type Phase = 
  | "LEARN" 
  | "TRY_CONNECT" 
  | "FAIL_INTERCEPT" 
  | "UNDERSTAND" 
  | "IMPROVE_REQUEST" 
  | "IMPROVE_STAMP" 
  | "IMPROVE_DELIVER" 
  | "READY_SECURE"
  | "COMPLETE_CONNECT" 
  | "OUTCOME";

export default function PublicKeyInfrastructure9() {
  const { reportComplete: _reportComplete } = useLMSBridge("publickeyinfrastructure9");
  const { playPop, playZap, playError, playSuccess, playChime } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("LEARN");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const reportComplete = useCallback(() => {
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  // Global Timer
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
    if (timedOut) {
      _reportComplete({ points: 0 });
    }
  }, [timedOut, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const handleInsecureConnect = () => {
    if (phase !== "LEARN") return;
    setPhase("TRY_CONNECT");
    playPop();

    timersRef.current.push(setTimeout(() => {
      setPhase("FAIL_INTERCEPT");
      playError();
      
      timersRef.current.push(setTimeout(() => {
        setPhase("UNDERSTAND");
      }, 1000));
    }, 1500));
  };

  const handleRequestCertificate = () => {
    if (phase !== "UNDERSTAND") return;
    setPhase("IMPROVE_REQUEST");
    playPop();

    timersRef.current.push(setTimeout(() => {
      setPhase("IMPROVE_STAMP");
      playZap(); // Stamping sound

      timersRef.current.push(setTimeout(() => {
        setPhase("IMPROVE_DELIVER");
        playChime();

        timersRef.current.push(setTimeout(() => {
          setPhase("READY_SECURE");
          playSuccess();
        }, 1500));
      }, 1500));
    }, 1500));
  };

  const handleSecureConnect = () => {
    if (phase !== "READY_SECURE") return;
    setPhase("COMPLETE_CONNECT");
    playPop();

    timersRef.current.push(setTimeout(() => {
      setPhase("OUTCOME");
      playSuccess();
      reportComplete();
    }, 2000));
  };

  const getInstruction = () => {
    switch (phase) {
      case "LEARN": return "Mission: Your Browser wants to connect to tarcin.in. How does it know it's not an imposter? Try connecting directly.";
      case "TRY_CONNECT": return "Initiating connection to tarcin.in...";
      case "FAIL_INTERCEPT": return "DANGER! A hacker intercepted the connection! The browser couldn't verify the server's identity.";
      case "UNDERSTAND": return "Without a Digital Passport (Certificate), anyone can pretend to be the server. We need a trusted third party.";
      case "IMPROVE_REQUEST": return "The Web Server sends a Certificate Signing Request (CSR) to the Global CA.";
      case "IMPROVE_STAMP": return "The Global CA verifies the Server's identity and digitally SIGNS the certificate with its official stamp.";
      case "IMPROVE_DELIVER": return "The stamped Digital Certificate is sent back to the Web Server to be presented to browsers.";
      case "READY_SECURE": return "Certificate installed! Now, try connecting from the Browser again.";
      case "COMPLETE_CONNECT": return "The Browser receives the Certificate and verifies the Global CA's signature...";
      case "OUTCOME": return "Success! The signature is verified. A secure, encrypted TLS Tunnel is established.";
      default: return "";
    }
  };

  const hasCertificate = phase === "IMPROVE_DELIVER" || phase === "READY_SECURE" || phase === "COMPLETE_CONNECT" || phase === "OUTCOME";
  
  return (
    <LabShell
      navExtra={
        phase !== "OUTCOME" && (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm backdrop-blur-md transition-colors font-mono ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 60 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-slate-200 text-slate-700"
          }`}>
            <Timer size={16} strokeWidth={2.5} className={secondsLeft <= 60 && !timedOut ? "animate-spin" : ""} />
            <span>{timedOut ? "0:00" : formattedTime}</span>
          </div>
        )
      }
      labId="publickeyinfrastructure9"
      theme="ocean"
      title="SSL/TLS Certificates & PKI"
      instruction={getInstruction()}
      compact
      onReset={() => {
        setPhase("LEARN");
        setTimedOut(false);
        setSecondsLeft(TIMER_DURATION_SECONDS);
        clearTimers();
      }}
    >
      <Celebration
        isActive={phase === "OUTCOME"}
        message="Chain of Trust Verified! The browser trusted the CA, and the CA vouched for the Server. The encrypted TLS Tunnel is active."
        onReplay={() => {
          setPhase("LEARN");
          setTimedOut(false);
          setSecondsLeft(TIMER_DURATION_SECONDS);
          clearTimers();
        }}
      />

      
      
      
      
      
      
      
      {/* Zero-Scroll Main Viewport */}
      <div className="w-full flex flex-col flex-1 min-h-0 pt-6 md:pt-10 px-6 pb-6 relative z-10 items-center overflow-hidden">
        
        {/* 1. TOP TOOLBAR: Premium Frosted Glass Banner */}
        <div className="w-full max-w-5xl shrink-0 flex flex-col md:flex-row items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl px-8 py-5 relative z-50 gap-6">
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5 flex items-center justify-center md:justify-start gap-2 drop-shadow-md">
              <ArrowRight size={14} strokeWidth={3} /> Mission Objective
            </h3>
            <p className="text-base font-bold text-white leading-snug drop-shadow-sm">
              {getInstruction().replace("tarcin.in", "karky.in")}
            </p>
          </div>
          
          <div className="shrink-0 flex items-center justify-center min-w-[240px]">
            {phase === "LEARN" && (
                <button onClick={handleInsecureConnect} className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/20">
                  <Globe size={20} strokeWidth={2.5} /> Connect
                </button>
            )}
            {phase === "UNDERSTAND" && (
                <button onClick={handleRequestCertificate} className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(99,102,241,0.7)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/20 animate-pulse">
                  <FileBadge size={20} strokeWidth={2.5} /> Request Cert
                </button>
            )}
            {phase === "READY_SECURE" && (
                <button onClick={handleSecureConnect} className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.7)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/20 animate-pulse">
                  <Lock size={20} strokeWidth={2.5} /> Secure Connect
                </button>
            )}
          </div>
        </div>

        {/* 2. BOTTOM LAYER: High-Tech Hardware Grid */}
        <div className="w-full max-w-5xl relative z-20 flex-1 min-h-[260px] max-h-[360px] flex flex-col justify-center mt-4 md:mt-8">
          
          {/* Strict 2-Row, 3-Column Grid */}
          <div className="w-full grid grid-cols-3 grid-rows-[100px_100px] gap-y-12 relative">
             
             {/* BACKGROUND WIRING */}
             <div className="absolute top-[198px] left-[16.6%] right-[16.6%] h-[2px] bg-slate-700/40 border-t border-dashed border-slate-400/30 z-0 -translate-y-1/2" />

             {/* ROW 1: Global CA (Top Center) */}
             <div className="col-start-2 flex justify-center items-center z-20">
               <div className="w-56 h-24 bg-slate-50 border-2 border-amber-300 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center justify-center relative">
                  <ShieldCheck className="w-8 h-8 text-amber-500 mb-1 drop-shadow-md" strokeWidth={2.5} />
                  <div className="text-base font-black text-slate-900 uppercase tracking-wide">Global CA</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Trusted Authority</div>

                  {/* Stamp Animation */}
                  <AnimatePresence>
                    {phase === "IMPROVE_STAMP" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 3, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-[1.25rem] backdrop-blur-md z-30"
                      >
                        <div className="text-amber-600 border-4 border-amber-600 font-black text-2xl px-6 py-1.5 rounded-xl transform -rotate-12 uppercase tracking-widest shadow-2xl">
                          SIGNED
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             </div>

             {/* ROW 2, COL 1: The Real Web Server */}
             <div className="col-start-1 row-start-2 flex justify-center items-center z-20">
                <div className="w-52 h-24 bg-slate-50 border-2 border-indigo-200 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center relative">
                  <Server className="w-8 h-8 text-indigo-500 mb-1 drop-shadow-md" strokeWidth={2.5} />
                  <div className="text-base font-black text-slate-900 uppercase tracking-wide">karky.in</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real Web Server</div>
                  
                  {/* Certificate display */}
                  <AnimatePresence>
                    {hasCertificate && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                      >
                        <FileBadge className="w-5 h-5 text-emerald-600 drop-shadow-sm" strokeWidth={2.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
             </div>

             {/* ROW 2, COL 2: Lurking Fake Wi-Fi / Hacker */}
             <div className="col-start-2 row-start-2 flex justify-center items-center z-10">
                <div
                  className={`w-40 h-24 rounded-3xl flex flex-col items-center justify-center transition-all duration-700 relative ${
                    phase === "LEARN" || phase === "OUTCOME" || phase === "COMPLETE_CONNECT"
                      ? "bg-slate-900/40 backdrop-blur-md border-2 border-slate-700 border-dashed shadow-inner"
                      : "bg-rose-950/80 backdrop-blur-xl border-2 border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.6)] scale-110 z-30"
                  }`}
                >
                  <Wifi className={`w-8 h-8 mb-1 drop-shadow-lg ${phase === "FAIL_INTERCEPT" ? "text-rose-500 animate-pulse" : (phase === "LEARN" || phase === "OUTCOME" || phase === "COMPLETE_CONNECT") ? "text-slate-600" : "text-rose-500"}`} strokeWidth={2.5} />
                  <span className={`text-xs font-black uppercase tracking-wide ${phase === "LEARN" || phase === "OUTCOME" || phase === "COMPLETE_CONNECT" ? "text-slate-500" : "text-white"}`}>Fake Wi-Fi</span>
                  <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${phase === "LEARN" || phase === "OUTCOME" || phase === "COMPLETE_CONNECT" ? "text-slate-600" : "text-rose-300"}`}>Imposter Server</span>
                  
                  {/* Warning Overlay when Active */}
                  <AnimatePresence>
                    {(phase === "FAIL_INTERCEPT" || phase === "UNDERSTAND") && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="absolute -top-4 -right-4 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.8)] border border-rose-300"
                       >
                         Intercept!
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
             </div>

             {/* ROW 2, COL 3: The Browser */}
             <div className="col-start-3 row-start-2 flex justify-center items-center z-20">
                <div className="w-52 h-24 bg-slate-50 border-2 border-emerald-200 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col items-center justify-center relative">
                  <Globe className="w-8 h-8 text-emerald-500 mb-1 drop-shadow-md" strokeWidth={2.5} />
                  <div className="text-base font-black text-slate-900 uppercase tracking-wide">Browser</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Student's Laptop</div>
                  
                  {/* Lock Status */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-lg">
                    {phase === "OUTCOME" ? (
                      <Lock className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                    ) : phase === "FAIL_INTERCEPT" || phase === "UNDERSTAND" ? (
                      <Unlock className="w-5 h-5 text-rose-500" strokeWidth={2.5} />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-slate-400" strokeWidth={2.5} />
                    )}
                  </div>
                </div>
             </div>

             {/* =========================================================================
                 ANIMATIONS & CONNECTIONS (OVERLAYS)
                 Row 1 Center Y: 50px
                 Row 2 Center Y: 198px
                 Col 1 Center X: 16.6%
                 Col 2 Center X: 50%
                 Col 3 Center X: 83.3%
             ========================================================================= */}
             
             {/* TLS TUNNEL (Direct from Browser to Server, rendering OVER the Hacker) */}
             <AnimatePresence>
                {phase === "OUTCOME" && (
                  <motion.div 
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="absolute top-[198px] left-[16.6%] right-[16.6%] h-6 -translate-y-1/2 bg-emerald-400/20 backdrop-blur-md border-y border-emerald-400/50 z-[15] origin-right shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  >
                    <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.6)_50%,transparent_100%)] animate-[pulse_1.5s_linear_infinite]" />
                    {/* Tunnel Label */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-100 bg-emerald-900/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-emerald-500/50 shadow-lg uppercase tracking-widest">
                       Secure TLS Tunnel
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Packet 1: Unsecure Connection (Browser to Fake Wi-Fi) */}
             {phase === "TRY_CONNECT" && (
                <motion.div
                  initial={{ top: "198px", left: "83.3%", x: "-50%", y: "-50%" }}
                  animate={{ top: "198px", left: "50%", x: "-50%", y: "-50%" }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="absolute w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center z-40 border-2 border-slate-300 shadow-lg"
                >
                  <FileKey className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
                </motion.div>
             )}

             {/* Packet 2: CSR to CA (Server to CA) */}
             {phase === "IMPROVE_REQUEST" && (
                <motion.div
                  initial={{ top: "198px", left: "16.6%", x: "-50%", y: "-50%" }}
                  animate={{ top: "50px", left: "50%", x: "-50%", y: "-50%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute w-10 h-12 bg-gradient-to-b from-indigo-50 to-indigo-100 border-2 border-indigo-400 rounded-xl flex items-center justify-center z-40 shadow-[0_5px_15px_rgba(99,102,241,0.3)]"
                >
                  <div className="text-[9px] font-black text-indigo-700">CSR</div>
                </motion.div>
             )}

             {/* Packet 3: Stamped Cert to Server (CA to Server) */}
             {phase === "IMPROVE_DELIVER" && (
                <motion.div
                  initial={{ top: "50px", left: "50%", x: "-50%", y: "-50%" }}
                  animate={{ top: "198px", left: "16.6%", x: "-50%", y: "-50%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute w-10 h-12 bg-gradient-to-b from-emerald-50 to-emerald-100 border-2 border-emerald-400 rounded-xl flex items-center justify-center z-40 shadow-[0_5px_15px_rgba(16,185,129,0.3)]"
                >
                  <FileBadge className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                </motion.div>
             )}

             {/* Packet 4: Secure Connection (Browser to Server through Tunnel) */}
             {phase === "COMPLETE_CONNECT" && (
                <motion.div
                  initial={{ top: "198px", left: "83.3%", x: "-50%", y: "-50%" }}
                  animate={{ top: "198px", left: "16.6%", x: "-50%", y: "-50%" }} 
                  transition={{ duration: 2, ease: "linear" }}
                  className="absolute w-10 h-12 bg-gradient-to-b from-emerald-50 to-emerald-100 border-2 border-emerald-400 rounded-xl flex items-center justify-center z-40 shadow-[0_5px_15px_rgba(16,185,129,0.3)]"
                >
                   <FileBadge className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                </motion.div>
             )}
          </div>
        </div>
      </div>
    
      {/* Failure Modals */}
      {(timedOut) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-2xl">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 max-w-sm text-center mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Timer className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Time's Up!</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
              You did not complete the lab in time.
            </p>
            <button onClick={() => window.location.reload()} className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer shadow-md">
              Initialize Retry
            </button>
          </div>
        </div>
      )}
    </LabShell>
  );
}
