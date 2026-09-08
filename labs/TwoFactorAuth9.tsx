"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldCheck, AlertCircle, Timer, Lock, Unlock, KeyRound, ShieldAlert, Smartphone } from "lucide-react";

const TIMER_DURATION_SECONDS = 5 * 60;
type Phase = "LEARN" | "TRY_MANUAL" | "FAIL_OVERLOAD" | "UNDERSTAND" | "IMPROVE" | "COMPLETE" | "OUTCOME";

export default function TwoFactorAuth9() {
  const { reportComplete: _reportComplete } = useLMSBridge("twofactorauth9");
  const { playPop, playZap, playError, playSuccess, playChime } = useLabAudio();

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const [phase, setPhase] = useState<Phase>("LEARN");
  const [currentTotp, setCurrentTotp] = useState("123456");
  const [timeLeft, setTimeLeft] = useState(15);
  const [inputValue, setInputValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

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

  // Global Lab Timer
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

  // TOTP Generator
  useEffect(() => {
    const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentTotp(generateCode());

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (phase === "IMPROVE") playPop();
          setCurrentTotp(generateCode());
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, playPop]);

  // Handle Form Submission based on Phase
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "LEARN" && phase !== "TRY_MANUAL") return;

    if (passwordValue.length > 0) {
      playChime();
      setPhase("FAIL_OVERLOAD");
      
      timersRef.current.push(setTimeout(() => {
        playError();
        setPhase("UNDERSTAND");
        
        timersRef.current.push(setTimeout(() => {
          setPhase("IMPROVE");
        }, 4000));
      }, 1500));
    } else {
      playError();
      setShakeKey(k => k + 1);
    }
  };

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "IMPROVE") return;

    if (inputValue === currentTotp) {
      setPhase("COMPLETE");
      playSuccess();
      setInputValue("");
      
      timersRef.current.push(setTimeout(() => {
        setPhase("OUTCOME");
        reportComplete();
      }, 1500));
    } else {
      playError();
      setInputValue("");
      setShakeKey(k => k + 1);
    }
  };

  const getInstruction = () => {
    switch (phase) {
      case "LEARN":
      case "TRY_MANUAL":
        return "Learn: Passwords are a single point of failure. Enter your password 'hunter2' to attempt access to the Secure Vault.";
      case "FAIL_OVERLOAD":
        return "Fail: DANGER! A hacker intercepted your password over an insecure network and is attempting to log in simultaneously!";
      case "UNDERSTAND":
        return "Understand: The password was compromised, but the vault stopped the hacker. It requires a secondary token from your physical device.";
      case "IMPROVE":
        return "Improve: The token changes every 15 seconds. Quickly enter the 6-digit code from your Authenticator app before it refreshes!";
      case "COMPLETE":
        return "Complete: Token accepted. Verifying secure handshake...";
      case "OUTCOME":
        return "Outcome: Vault Unlocked! The hacker is locked out permanently because they don't possess your physical device.";
      default:
        return "";
    }
  };

  const isVaultUnlocked = phase === "OUTCOME";
  const isAwaiting2FA = phase === "UNDERSTAND" || phase === "IMPROVE" || phase === "COMPLETE";
  const showHackerAlert = phase === "FAIL_OVERLOAD" || phase === "UNDERSTAND" || phase === "IMPROVE";

  return (
    <LabShell
      navExtra={
        !isVaultUnlocked && (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm transition-colors ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 30 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-sky-100/80 text-sky-700"
          }`}>
            <Timer size={16} strokeWidth={2.5} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      }
      labId="twofactorauth9"
      theme="cosmos"
      title="Multi-Factor Authentication"
      subtitle="L41 · Security Architecture"
      instruction={getInstruction()}
      compact
      onReset={() => {
        setPhase("LEARN");
        setInputValue("");
        setPasswordValue("");
        setTimedOut(false);
        setSecondsLeft(TIMER_DURATION_SECONDS);
        clearTimers();
      }}
    >
      <Celebration
        isActive={phase === "OUTCOME"}
        message="Vault Unlocked! Because the token changes every 15 seconds, stolen passwords are completely useless to hackers. They would physically need to steal your phone to gain access."
        onReplay={() => {
          setPhase("LEARN");
          setInputValue("");
          setPasswordValue("");
          setTimedOut(false);
          setSecondsLeft(TIMER_DURATION_SECONDS);
          clearTimers();
        }}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3 relative z-10">
        
        {/* ΓöÇΓöÇΓöÇ 1. TOP BAR: Hacker Alert Notification ΓöÇΓöÇΓöÇ */}
        <div className="h-10 shrink-0 flex items-center justify-end w-full px-2">
          <AnimatePresence>
            {showHackerAlert && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-950/80 border border-rose-500 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.4)] backdrop-blur-md z-50"
              >
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                <span className="text-rose-400 font-mono text-xs sm:text-sm font-bold tracking-wide">
                  [Alert] Hacker intercepted password: '{passwordValue}'
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ΓöÇΓöÇΓöÇ 2. MIDDLE AREA: Vault & Phone Grid (Zero-Scroll HTML Layout) ΓöÇΓöÇΓöÇ */}
        <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 px-4 pb-2 min-h-0">
          
          {/* THE TARGET: Secure Vault */}
          <div className="w-full max-w-[280px] md:max-w-[340px] aspect-square rounded-3xl bg-[#0f172a] border-4 border-[#1e293b] shadow-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden shrink-0">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[#64748b] text-sm md:text-lg font-black tracking-[0.2em] text-center w-full">
              SECURE VAULT
            </div>
            
            {/* Inner Ring */}
            <div className={`w-3/4 aspect-square rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
              isVaultUnlocked ? "border-emerald-500 bg-emerald-950/30 shadow-[0_0_40px_rgba(16,185,129,0.3)]" :
              isAwaiting2FA ? "border-rose-500 bg-rose-950/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]" :
              "border-[#334155] bg-[#020617]"
            }`}>
              <AnimatePresence mode="wait">
                {isVaultUnlocked ? (
                  <motion.div key="unlocked" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <Unlock className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-emerald-400 font-bold text-xs md:text-sm text-center">ACCESS<br/>GRANTED</span>
                  </motion.div>
                ) : isAwaiting2FA ? (
                  <motion.div key="awaiting" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <Lock className="w-10 h-10 md:w-14 md:h-14 text-rose-500 mb-2 animate-pulse" />
                    <span className="text-rose-400 font-bold text-[10px] md:text-xs text-center tracking-widest">AWAITING<br/>2FA TOKEN</span>
                  </motion.div>
                ) : (
                  <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                    <Lock className="w-12 h-12 md:w-16 md:h-16 text-[#475569] mb-2" />
                    <span className="text-[#475569] font-bold text-xs md:text-sm text-center">LOCKED</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* THE TOOL: Authenticator Smartphone */}
          <div className={`w-full max-w-[200px] md:max-w-[240px] aspect-[1/2] rounded-[2rem] border-4 flex flex-col items-center p-2 relative overflow-hidden transition-all duration-700 shrink-0 ${
            phase === "IMPROVE" ? "border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.3)] bg-[#1e1b4b]" :
            "border-[#334155] bg-[#0f172a] opacity-50 grayscale-[50%]"
          }`}>
            {/* Phone Screen */}
            <div className="w-full h-full rounded-[1.5rem] bg-[#020617] flex flex-col items-center pt-8 px-4 pb-6 relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1e1b4b] rounded-b-xl" />
              
              <Smartphone className={`w-8 h-8 mb-2 ${phase === "IMPROVE" ? "text-fuchsia-400" : "text-[#475569]"}`} />
              <div className={`text-sm font-bold mb-1 ${phase === "IMPROVE" ? "text-fuchsia-400" : "text-[#475569]"}`}>Authenticator</div>
              <div className="text-[10px] text-sky-300/60 mb-8">Secure Vault App</div>

              {/* TOTP Display */}
              <div className={`w-full py-3 rounded-xl border flex items-center justify-center mb-4 transition-all ${
                phase === "IMPROVE" ? "bg-emerald-950/50 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-[#0f172a] border-[#334155]"
              }`}>
                <span className={`font-mono text-2xl md:text-3xl font-black tracking-[0.15em] ${phase === "IMPROVE" ? "text-emerald-300 drop-shadow-[0_0_5px_rgba(110,231,183,0.8)]" : "text-[#475569]"}`}>
                  {phase === "IMPROVE" || phase === "COMPLETE" || phase === "OUTCOME" ? currentTotp : "------"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? "bg-rose-500" : "bg-fuchsia-400"}`}
                  style={{ width: phase === "IMPROVE" ? `${(timeLeft / 15) * 100}%` : "0%" }}
                />
              </div>
              <div className={`text-[10px] font-bold ${timeLeft <= 3 && phase === "IMPROVE" ? "text-rose-400 animate-pulse" : "text-[#64748b]"}`}>
                {phase === "IMPROVE" ? `Refreshes in ${timeLeft}s` : "Standby"}
              </div>
            </div>
          </div>

        </div>

        {/* ΓöÇΓöÇΓöÇ 3. BOTTOM BAR: The Input Portal ΓöÇΓöÇΓöÇ */}
        <div className="shrink-0 bg-indigo-950/60 backdrop-blur-md rounded-2xl border border-indigo-500/30 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-xl relative z-20">
          
          <div className="flex flex-col gap-1 w-full md:w-1/3">
            <h3 className="text-indigo-300 font-black flex items-center gap-2 uppercase tracking-wide text-sm">
               <ShieldCheck size={18} /> Vault Login Portal
            </h3>
            <p className="text-indigo-200/60 text-[10px] md:text-xs">
              {phase === "LEARN" || phase === "TRY_MANUAL" ? "Step 1: Enter your password to initiate login." : "Step 2: Enter 6-digit Authenticator code."}
            </p>
          </div>

          <motion.div 
            animate={{ x: shakeKey > 0 ? [-5, 5, -5, 5, 0] : 0 }} 
            transition={{ duration: 0.3 }}
            className="flex-1 w-full flex items-center gap-2 md:gap-3"
          >
            {phase === "LEARN" || phase === "TRY_MANUAL" ? (
              <form onSubmit={handlePasswordSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
                  <input 
                    type="password"
                    placeholder="Enter Password"
                    value={passwordValue}
                    onChange={(e) => {
                      setPasswordValue(e.target.value);
                      if (phase === "LEARN") setPhase("TRY_MANUAL");
                    }}
                    className="w-full h-12 md:h-14 bg-[#020617]/60 border-2 border-indigo-500/50 rounded-xl pl-10 pr-4 text-white font-mono text-lg md:text-xl focus:outline-none focus:border-indigo-400 placeholder:text-indigo-900/50"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={passwordValue.length === 0}
                  className="h-12 md:h-14 px-6 md:px-8 rounded-xl font-black bg-indigo-600/20 border-2 border-indigo-500/50 text-indigo-400 hover:bg-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                >
                  Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleTotpSubmit} className="flex-1 flex gap-2">
                <input 
                  type="text"
                  placeholder="------"
                  maxLength={6}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))} // only numbers
                  disabled={phase === "COMPLETE" || phase === "OUTCOME" || phase === "FAIL_OVERLOAD" || phase === "UNDERSTAND"}
                  className="flex-1 h-12 md:h-14 bg-[#020617]/60 border-2 border-fuchsia-500/50 rounded-xl text-center text-white font-black text-2xl md:text-3xl tracking-[0.4em] md:tracking-[0.5em] focus:outline-none focus:border-fuchsia-400 placeholder:text-fuchsia-900/30 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={inputValue.length !== 6 || phase === "COMPLETE" || phase === "OUTCOME" || phase === "FAIL_OVERLOAD" || phase === "UNDERSTAND"}
                  className="h-12 md:h-14 px-4 md:px-8 rounded-xl font-black bg-fuchsia-600/20 border-2 border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shrink-0"
                >
                  <ShieldCheck size={20} className="hidden sm:block"/> Verify
                </button>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    
      {/* Time's Up Modal */}
      {timedOut && !isVaultUnlocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm text-center mx-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1.5">Time's Up!</h3>
            <p className="text-sm font-medium text-slate-600 mb-4">
              You did not complete the lab in time.
            </p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-1 shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none text-white rounded-xl text-sm font-bold transition-all cursor-pointer">
              Try Again
            </button>
          </div>
        </div>
      )}
    </LabShell>
  );
}
