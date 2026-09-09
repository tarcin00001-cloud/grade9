"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, Globe, Lock, Unlock, ArrowRight, FileKey, ShieldAlert, Gamepad2, ShieldCheck, Key, UserCircle, Image as ImageIcon, ExternalLink, BadgeCheck } from "lucide-react";

const TIMER_DURATION_SECONDS = 5 * 60;

type Phase = 
  | "LEARN" 
  | "TRY" 
  | "FAIL_SAFELY" 
  | "UNDERSTAND" 
  | "IMPROVE" 
  | "COMPLETE" 
  | "OUTCOME";

export default function OauthFlow9() {
  const { reportComplete: _reportComplete } = useLMSBridge("oauthflow9");
  const { playPop, playZap, playError, playSuccess, playChime } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("LEARN");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setSecondsLeft((prev) => {
        if (prev <= 1) {
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

  const getInstruction = () => {
    switch (phase) {
      case "LEARN": return "Super Sketchy Game wants you to log in. Will you give them your master password?";
      case "TRY": return "Sending Master Password directly to Sketchy Game...";
      case "FAIL_SAFELY": return "DANGER! Sketchy Game used your password to break into your Email and Photos!";
      case "UNDERSTAND": return "A password is a skeleton key. Never give it to a 3rd-party app. They can access everything.";
      case "IMPROVE": return "Redirecting to Google Auth Server to get a restricted Hotel Keycard (Token)...";
      case "COMPLETE": return "Google granted an OAuth Token! It only allows access to your Basic Profile.";
      case "OUTCOME": return "Sketchy Game tried to steal your Email, but the OAuth Token blocked them! You are safe.";
    }
  };

  const handleInsecureLogin = () => {
    if (phase !== "LEARN") return;
    setPhase("TRY");
    playPop();

    timersRef.current.push(setTimeout(() => {
      setPhase("FAIL_SAFELY");
      playError();
      
      timersRef.current.push(setTimeout(() => {
        setPhase("UNDERSTAND");
      }, 2500));
    }, 1500));
  };

  const handleOAuthRedirect = () => {
    if (phase !== "UNDERSTAND") return;
    setPhase("IMPROVE");
    playPop();

    timersRef.current.push(setTimeout(() => {
      setPhase("COMPLETE");
      playChime();
    }, 2500)); // Token travels back
  };

  const handlePlayGame = () => {
    if (phase !== "COMPLETE") return;
    playPop();
    
    timersRef.current.push(setTimeout(() => {
      setPhase("OUTCOME");
      playSuccess();
      timersRef.current.push(setTimeout(() => {
        reportComplete();
      }, 4500));
    }, 1500));
  };

  const hasToken = phase === "COMPLETE" || phase === "OUTCOME";

  return (
    <LabShell
      navExtra={
        phase !== "OUTCOME" && (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm backdrop-blur-md transition-colors font-mono ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 60 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white/10 border-white/20 text-white"
          }`}>
            <Timer size={16} strokeWidth={2.5} className={secondsLeft <= 60 && !timedOut ? "animate-spin" : ""} />
            <span>{timedOut ? "0:00" : formattedTime}</span>
          </div>
        )
      }
      labId="oauthflow9"
      bgOverride="bg-slate-950"
      title="OAuth 2.0 (SSO Identity)"
      instruction={getInstruction()}
      hint="Never type your master password into a 3rd-party site. Always use the OAuth redirect to safely grant access using a Token."
      compact
      onReset={() => {
        setPhase("LEARN");
        setTimedOut(false);
        setSecondsLeft(TIMER_DURATION_SECONDS);
        clearTimers();
      }}
    >
      {phase === "OUTCOME" && <Celebration isActive={true} />}

      {/* Zero-Scroll Main Viewport */}
      <div className="w-full flex flex-col flex-1 min-h-0 pt-6 md:pt-10 px-6 pb-6 relative z-10 items-center overflow-hidden">
        
        {/* 1. TOP TOOLBAR: Premium Cyberpunk Glass Banner */}
        <div className="w-full max-w-5xl shrink-0 flex flex-col md:flex-row items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl px-8 py-5 relative z-50 gap-6">
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center justify-center md:justify-start gap-2 drop-shadow-md">
              <ArrowRight size={14} strokeWidth={3} /> Mission Objective
            </h3>
            <p className="text-base font-bold text-white leading-snug drop-shadow-sm">
              {getInstruction()}
            </p>
          </div>
          
          <div className="shrink-0 flex items-center justify-center min-w-[240px]">
            {phase === "LEARN" && (
                <button onClick={handleInsecureLogin} className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/20">
                  <Key size={20} strokeWidth={2.5} /> Type Password
                </button>
            )}
            {phase === "UNDERSTAND" && (
                <button onClick={handleOAuthRedirect} className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(6,182,212,0.7)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/20 animate-pulse">
                  <ExternalLink size={20} strokeWidth={2.5} /> Use OAuth Redirect
                </button>
            )}
            {phase === "COMPLETE" && (
                <button onClick={handlePlayGame} className="w-full px-6 py-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(217,70,239,0.7)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/20 animate-pulse">
                  <Gamepad2 size={20} strokeWidth={2.5} /> Play Game
                </button>
            )}
          </div>
        </div>

        {/* 2. BOTTOM LAYER: Premium Network Diagram Grid */}
        <div className="w-full max-w-5xl relative z-20 flex-1 min-h-[300px] max-h-[400px] flex flex-col justify-center mt-4 md:mt-8">
          
          {/* Strict 2-Row, 3-Column Triangular Grid */}
          <div className="w-full grid grid-cols-3 grid-rows-[140px_120px] gap-y-12 relative">
             
             {/* BACKGROUND WIRING */}
             <div className="absolute top-[200px] left-[50%] right-[16.6%] h-[2px] bg-slate-700/40 border-t border-dashed border-slate-400/30 z-0 -translate-y-1/2 origin-left -rotate-[22deg]" />
             <div className="absolute top-[200px] left-[16.6%] right-[50%] h-[2px] bg-slate-700/40 border-t border-dashed border-slate-400/30 z-0 -translate-y-1/2 origin-right rotate-[22deg]" />

             {/* ROW 1, COL 1: Sketchy Game */}
             <div className="col-start-1 row-start-1 flex justify-center items-center z-20 relative">
                <div className={`w-52 h-28 ${phase === "FAIL_SAFELY" ? "bg-rose-950 border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.6)]" : "bg-slate-900 border-fuchsia-500 shadow-[0_0_40px_rgba(217,70,239,0.2)]"} border-2 rounded-3xl flex flex-col items-center justify-center relative transition-all duration-500`}>
                  <Gamepad2 className={`w-10 h-10 mb-1 drop-shadow-md ${phase === "FAIL_SAFELY" ? "text-rose-500 animate-bounce" : "text-fuchsia-400"}`} strokeWidth={2.5} />
                  <div className={`text-base font-black uppercase tracking-wide ${phase === "FAIL_SAFELY" ? "text-rose-100" : "text-white"}`}>Sketchy Game</div>
                  <div className={`text-[9px] font-bold uppercase tracking-[0.2em] ${phase === "FAIL_SAFELY" ? "text-rose-400" : "text-fuchsia-300"}`}>3rd Party App</div>
                  
                  {phase === "FAIL_SAFELY" && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-4 -right-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.8)] border border-rose-300"
                    >
                      HACKING!
                    </motion.div>
                  )}
                </div>
             </div>

             {/* ROW 1, COL 3: Auth Server & Vaults */}
             <div className="col-start-3 row-start-1 flex justify-center items-center z-20 relative">
               <div className="w-56 h-32 bg-slate-900 border-2 border-cyan-400 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col items-center justify-center relative">
                  <ShieldCheck className="w-8 h-8 text-cyan-400 mb-1 drop-shadow-md" strokeWidth={2.5} />
                  <div className="text-base font-black text-white uppercase tracking-wide">Auth Server</div>
                  <div className="text-[9px] font-bold text-cyan-200 uppercase tracking-[0.2em]">Identity Provider</div>

                  {/* Vaults Attached to Server */}
                  <div className="absolute -bottom-8 flex gap-3">
                     {/* Basic Profile Vault */}
                     <div className="w-20 h-14 bg-slate-800 border border-slate-600 rounded-xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                       <UserCircle className="w-5 h-5 text-slate-400 mb-0.5" />
                       <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Profile</span>
                       {(phase === "OUTCOME" || hasToken) && (
                         <div className="absolute inset-0 border-2 border-emerald-400 rounded-xl bg-emerald-500/20" />
                       )}
                     </div>

                     {/* Sensitive Email/Photos Vault */}
                     <div className="w-20 h-14 bg-slate-800 border border-slate-600 rounded-xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                       <ImageIcon className="w-5 h-5 text-slate-400 mb-0.5" />
                       <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Photos</span>
                       {phase === "FAIL_SAFELY" && (
                         <div className="absolute inset-0 border-2 border-rose-500 rounded-xl bg-rose-500/40 flex items-center justify-center">
                           <Unlock className="w-6 h-6 text-rose-200 animate-pulse" />
                         </div>
                       )}
                       {phase === "OUTCOME" && (
                         <div className="absolute inset-0 border-2 border-cyan-500 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                           <Lock className="w-6 h-6 text-cyan-300" />
                         </div>
                       )}
                     </div>
                  </div>
               </div>
             </div>

             {/* ROW 2, COL 2: The Browser */}
             <div className="col-start-2 row-start-2 flex justify-center items-center z-30">
                <div className="w-52 h-24 bg-slate-800 border-2 border-slate-600 rounded-3xl shadow-xl flex flex-col items-center justify-center relative">
                  <Globe className="w-8 h-8 text-slate-300 mb-1 drop-shadow-md" strokeWidth={2.5} />
                  <div className="text-base font-black text-white uppercase tracking-wide">Browser</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Student's Device</div>
                  
                  {/* Token Status */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center shadow-lg">
                    {hasToken ? (
                      <BadgeCheck className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
                    ) : (
                      <div className="w-5 h-5 text-slate-500 flex items-center justify-center font-bold text-lg">?</div>
                    )}
                  </div>
                </div>
             </div>

             {/* =========================================================================
                 ANIMATIONS (Using Grid Cell Centers)
                 Row 1 Y: 70px
                 Row 2 Y: 200px (140px + 48px gap + 12px padding roughly) -> Let's use % based or fixed px
                 Actually, since Browser is bottom-center, it's easy to calculate.
                 Browser center: top 200px, left 50%.
                 Game center: top 70px, left 16.6%.
                 Auth Server center: top 70px, left 83.3%.
             ========================================================================= */}
             
             {/* Attack Beam (Fail Phase) */}
             <AnimatePresence>
                {phase === "FAIL_SAFELY" && (
                  <motion.div 
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="absolute top-[70px] left-[16.6%] right-[16.6%] h-2 -translate-y-1/2 bg-rose-500/50 z-[15] origin-left blur-sm shadow-[0_0_30px_rgba(244,63,94,1)]"
                  />
                )}
             </AnimatePresence>

             {/* Defense Beam (Outcome Phase) */}
             <AnimatePresence>
                {phase === "OUTCOME" && (
                  <motion.div 
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="absolute top-[70px] left-[16.6%] right-[16.6%] h-2 -translate-y-1/2 bg-cyan-400/50 z-[15] origin-right blur-sm shadow-[0_0_30px_rgba(6,182,212,1)]"
                  />
                )}
             </AnimatePresence>

             {/* Packet 1: Raw Password sent to Game */}
             {phase === "TRY" && (
                <motion.div
                  initial={{ top: "200px", left: "50%", x: "-50%", y: "-50%" }}
                  animate={{ top: "70px", left: "16.6%", x: "-50%", y: "-50%" }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="absolute w-12 h-12 bg-rose-950 rounded-xl flex items-center justify-center z-40 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]"
                >
                  <Key className="w-6 h-6 text-rose-400" strokeWidth={2.5} />
                </motion.div>
             )}

             {/* Packet 2: Browser redirect to Auth Server */}
             {phase === "IMPROVE" && (
                <motion.div
                  initial={{ top: "200px", left: "50%", x: "-50%", y: "-50%" }}
                  animate={{ top: "70px", left: "83.3%", x: "-50%", y: "-50%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center z-40 border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                >
                  <Key className="w-6 h-6 text-cyan-400" strokeWidth={2.5} />
                </motion.div>
             )}

             {/* Packet 3: Token issued back to Browser */}
             {phase === "COMPLETE" && (
                <motion.div
                  initial={{ top: "70px", left: "83.3%", x: "-50%", y: "-50%" }}
                  animate={{ top: "200px", left: "50%", x: "-50%", y: "-50%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute w-12 h-12 bg-amber-950 rounded-xl flex items-center justify-center z-40 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]"
                >
                  <BadgeCheck className="w-6 h-6 text-amber-400" strokeWidth={2.5} />
                </motion.div>
             )}

             {/* Packet 4: Browser sends Token to Game */}
             {phase === "OUTCOME" && (
                <motion.div
                  initial={{ top: "200px", left: "50%", x: "-50%", y: "-50%" }}
                  animate={{ top: "70px", left: "16.6%", x: "-50%", y: "-50%" }} 
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="absolute w-12 h-12 bg-amber-950 rounded-xl flex items-center justify-center z-40 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]"
                >
                   <BadgeCheck className="w-6 h-6 text-amber-400" strokeWidth={2.5} />
                </motion.div>
             )}
          </div>
        </div>
      </div>
    
      {/* Failure Modals */}
      {(timedOut || phase === "FAIL_SAFELY") && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-2xl">
          <div className="bg-slate-900 rounded-3xl shadow-[0_0_60px_rgba(244,63,94,0.3)] border-2 border-rose-500/50 p-8 max-w-sm text-center mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-500/50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              {timedOut ? <Timer className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8 animate-pulse" />}
            </div>
            <h3 className="text-xl font-black text-white mb-2">{timedOut ? "Time's Up!" : "DATA STOLEN!"}</h3>
            <p className="text-sm font-medium text-slate-300 mb-6 leading-relaxed">
              {timedOut ? "You did not complete the lab in time." : "Sketchy Game used your master password to access your private emails and photos!"}
            </p>
            {timedOut && (
              <button onClick={() => window.location.reload()} className="w-full px-6 py-4 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer shadow-md">
                Initialize Retry
              </button>
            )}
          </div>
        </div>
      )}
    </LabShell>
  );
}
