"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, ShieldCheck, Globe, Server, AlertTriangle, Lock, Unlock, FileBadge, ArrowRight, ShieldAlert, FileKey, HelpCircle } from "lucide-react";

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
      }, 3000));
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
      subtitle="L24 · Cryptography"
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

      <div className="w-full flex flex-col flex-1 min-h-0 pt-24 md:pt-28 px-4 pb-4 gap-4 relative z-10 items-center">
        
        {/* Unified Main Workspace Box */}
        <div className="flex-1 w-full max-w-5xl bg-slate-50 border border-slate-200 rounded-[2.5rem] shadow-inner relative overflow-hidden flex flex-col pt-8 px-8 pb-12">
          
          {/* Subtle Background Elements */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Integrated Instruction Banner & Controls */}
          <div className="w-full shrink-0 flex flex-col items-center gap-4 relative z-50 mb-8">
            <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-sm rounded-2xl p-5 text-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">
                Mission Objective
              </h3>
              <p className="text-sm font-medium text-slate-600">
                {getInstruction()}
              </p>
            </div>

            <div className="flex items-center justify-center min-h-[3rem]">
              {phase === "LEARN" && (
                  <button onClick={handleInsecureConnect} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                    <Globe size={18} /> Connect to Web Server
                  </button>
              )}
              {phase === "UNDERSTAND" && (
                  <button onClick={handleRequestCertificate} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-400 text-white font-bold rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2 animate-pulse">
                    <FileBadge size={18} /> Request Certificate (PKI Flow)
                  </button>
              )}
              {phase === "READY_SECURE" && (
                  <button onClick={handleSecureConnect} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-400 text-white font-bold rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 animate-pulse">
                    <Lock size={18} /> Connect Securely
                  </button>
              )}
            </div>
          </div>

          {/* Network Diagram Area - Fixed Aspect Ratio to prevent clipping */}
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            <div className="w-full max-w-3xl aspect-[16/9] relative">

              {/* TLS TUNNEL */}
              <AnimatePresence>
                {phase === "OUTCOME" && (
                  <motion.div 
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    className="absolute bottom-4 left-[15%] right-[15%] h-8 bg-emerald-100 border-y-4 border-emerald-400 z-0 origin-left"
                  >
                    <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(16,185,129,0.3)_50%,transparent_100%)] animate-[pulse_2s_linear_infinite]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hacker Node */}
              <AnimatePresence>
                {(phase === "TRY_CONNECT" || phase === "FAIL_INTERCEPT" || phase === "UNDERSTAND") && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-rose-50 border-2 border-rose-300 rounded-2xl flex flex-col items-center justify-center z-10 ${phase === "FAIL_INTERCEPT" ? "shadow-[0_0_30px_rgba(244,63,94,0.4)] border-rose-500" : ""}`}
                  >
                    <ShieldAlert className={`w-8 h-8 ${phase === "FAIL_INTERCEPT" ? "text-rose-600 animate-pulse" : "text-rose-400"}`} />
                    <span className="text-[10px] font-bold text-rose-600 mt-1 uppercase">Hacker</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Center: Global CA */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                <div className="w-48 h-28 md:h-32 bg-white border-2 border-amber-300 rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.1)] flex flex-col items-center justify-center relative">
                  <ShieldCheck className="w-10 h-10 text-amber-500 mb-2" />
                  <div className="text-sm font-black text-slate-800 uppercase tracking-wide">Global CA</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Trusted Authority</div>

                  {/* Stamp Animation */}
                  <AnimatePresence>
                    {phase === "IMPROVE_STAMP" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 3, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl backdrop-blur-sm z-30"
                      >
                        <div className="text-amber-600 border-4 border-amber-600 font-black text-xl px-4 py-1 rounded-lg transform -rotate-12 uppercase tracking-widest shadow-lg">
                          SIGNED
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Left: Web Server */}
              <div className="absolute bottom-0 left-0 z-20">
                <div className="w-40 md:w-48 h-28 md:h-32 bg-white border-2 border-indigo-200 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.1)] flex flex-col items-center justify-center relative">
                  <Server className="w-10 h-10 text-indigo-500 mb-2" />
                  <div className="text-sm font-black text-slate-800 uppercase tracking-wide">tarcin.in</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Web Server</div>
                  
                  {/* Server's Certificate display */}
                  <AnimatePresence>
                    {hasCertificate && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-100 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <FileBadge className="w-6 h-6 text-emerald-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Right: Browser */}
              <div className="absolute bottom-0 right-0 z-20">
                <div className="w-40 md:w-48 h-28 md:h-32 bg-white border-2 border-emerald-200 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.1)] flex flex-col items-center justify-center relative">
                  <Globe className="w-10 h-10 text-emerald-500 mb-2" />
                  <div className="text-sm font-black text-slate-800 uppercase tracking-wide">Browser</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Trusts Global CA</div>
                  
                  {/* Browser's Lock Status */}
                  <div className="absolute -top-3 -left-3 w-12 h-12 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-md">
                    {phase === "OUTCOME" ? (
                      <Lock className="w-6 h-6 text-emerald-500" />
                    ) : phase === "FAIL_INTERCEPT" || phase === "UNDERSTAND" ? (
                      <Unlock className="w-6 h-6 text-rose-500" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                </div>
              </div>

          {/* Animated Packets (Absolute positioned overlay) */}
          {/* Packet 1: Unsecure Connection */}
          {phase === "TRY_CONNECT" && (
            <motion.div
              initial={{ left: "20%", bottom: "20%" }}
              animate={{ left: "50%", bottom: "20%" }} // moves to hacker in center
              transition={{ duration: 1.5, ease: "linear" }}
              className="absolute w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center z-40 border border-slate-400"
            >
              <FileKey className="w-4 h-4 text-slate-600" />
            </motion.div>
          )}

          {/* Packet 2: CSR to CA */}
          {phase === "IMPROVE_REQUEST" && (
            <motion.div
              initial={{ left: "20%", bottom: "25%" }}
              animate={{ left: "50%", bottom: "70%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute w-10 h-12 bg-indigo-50 border-2 border-indigo-300 rounded-md flex items-center justify-center z-40"
            >
              <div className="text-[8px] font-bold text-indigo-500">CSR</div>
            </motion.div>
          )}

          {/* Packet 3: Stamped Cert to Server */}
          {phase === "IMPROVE_DELIVER" && (
            <motion.div
              initial={{ left: "50%", bottom: "70%" }}
              animate={{ left: "20%", bottom: "25%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute w-10 h-12 bg-emerald-50 border-2 border-emerald-400 rounded-md flex items-center justify-center z-40"
            >
              <FileBadge className="w-5 h-5 text-emerald-500" />
            </motion.div>
          )}

          {/* Packet 4: Secure Connection */}
          {phase === "COMPLETE_CONNECT" && (
            <motion.div
              initial={{ left: "20%", bottom: "20%" }}
              animate={{ left: "80%", bottom: "20%" }} 
              transition={{ duration: 2, ease: "linear" }}
              className="absolute w-10 h-12 bg-emerald-50 border-2 border-emerald-400 rounded-md flex items-center justify-center z-40"
            >
               <FileBadge className="w-5 h-5 text-emerald-500" />
            </motion.div>
          )}

          </div>
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
