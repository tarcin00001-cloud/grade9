"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldCheck, AlertCircle, Timer, Lock, Unlock, KeyRound, ShieldAlert, Smartphone, RefreshCcw, ShieldOff, MessageSquareWarning } from "lucide-react";

const TIMER_DURATION_SECONDS = 5 * 60;

type Phase = 
  | "M1_LEARN" | "M1_TRY" | "M1_ALERT" | "M1_UNDERSTAND" | "M1_INPUT" | "M1_SUCCESS"
  | "M2_START" | "M2_DESYNC_FAIL" | "M2_SYNCED" | "M2_SUCCESS"
  | "M3_START" | "M3_PHISHED" | "M3_SUCCESS"
  | "OUTCOME";

export default function TwoFactorAuth9() {
  const { reportComplete: _reportComplete } = useLMSBridge("twofactorauth9");
  const { playPop, playZap, playError, playSuccess, playChime } = useLabAudio();

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const [phase, setPhase] = useState<Phase>("M1_LEARN");
  const [currentTotp, setCurrentTotp] = useState("123456");
  const [timeLeft, setTimeLeft] = useState(30);
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
    if (timedOut || phase === "M3_PHISHED") {
      _reportComplete({ points: 0 });
    }
  }, [timedOut, phase, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  // TOTP Generator (30 seconds)
  useEffect(() => {
    const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentTotp(generateCode());

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (phase === "M1_INPUT" || phase === "M2_START" || phase === "M2_DESYNC_FAIL" || phase === "M2_SYNCED" || phase === "M3_START") {
            playPop();
          }
          setCurrentTotp(generateCode());
          return 30; // 30 second timer
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, playPop]);

  // Handle Form Submission based on Phase
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "M1_LEARN" && phase !== "M1_TRY") return;

    if (passwordValue.length > 0) {
      playChime();
      setPhase("M1_ALERT");
      setShakeKey(k => k + 1); // Shake to indicate interception
      
      timersRef.current.push(setTimeout(() => {
        playError();
        setPhase("M1_UNDERSTAND");
        
        timersRef.current.push(setTimeout(() => {
          setPhase("M1_INPUT");
        }, 4000));
      }, 1500));
    } else {
      playError();
      setShakeKey(k => k + 1);
    }
  };

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (phase === "M1_INPUT") {
      if (inputValue === currentTotp) {
        setPhase("M1_SUCCESS");
        playSuccess();
        setInputValue("");
        timersRef.current.push(setTimeout(() => {
          setPhase("M2_START");
          playChime();
        }, 2000));
      } else {
        playError();
        setInputValue("");
        setShakeKey(k => k + 1);
      }
    } 
    else if (phase === "M2_START" || phase === "M2_DESYNC_FAIL") {
      // In M2_START, the code fails no matter what because of time desync
      playError();
      setInputValue("");
      setShakeKey(k => k + 1);
      setPhase("M2_DESYNC_FAIL");
    }
    else if (phase === "M2_SYNCED") {
      if (inputValue === currentTotp) {
        setPhase("M2_SUCCESS");
        playSuccess();
        setInputValue("");
        timersRef.current.push(setTimeout(() => {
          setPhase("M3_START");
          playChime();
        }, 2000));
      } else {
        playError();
        setInputValue("");
        setShakeKey(k => k + 1);
      }
    }
    else if (phase === "M3_START") {
      // If they type the code and submit during phishing, they lose!
      if (inputValue === currentTotp) {
        setPhase("M3_PHISHED");
        playError();
      } else {
        playError();
        setInputValue("");
        setShakeKey(k => k + 1);
      }
    }
  };

  const handleSyncClock = () => {
    if (phase === "M2_START" || phase === "M2_DESYNC_FAIL") {
      playZap();
      setPhase("M2_SYNCED");
      setTimeLeft(30); // reset clock visually to show sync
    }
  };

  const handleReportPhishing = () => {
    if (phase === "M3_START") {
      setPhase("M3_SUCCESS");
      playSuccess();
      timersRef.current.push(setTimeout(() => {
        setPhase("OUTCOME");
        reportComplete();
      }, 2000));
    }
  };

  const getInstruction = () => {
    switch (phase) {
      case "M1_LEARN":
      case "M1_TRY":
        return "Mission 1 (The Stolen Password): Passwords are a single point of failure. Type a password below to initiate login.";
      case "M1_ALERT":
        return "Fail: DANGER! A hacker intercepted your password and is trying to log in simultaneously!";
      case "M1_UNDERSTAND":
        return "Understand: The password was compromised, but the vault stopped the hacker. It requires a secondary token.";
      case "M1_INPUT":
        return "Improve: The token changes every 30 seconds. Enter the 6-digit code from your Authenticator app before it refreshes!";
      case "M1_SUCCESS":
        return "Token Accepted. Verifying secure handshake...";
      case "M2_START":
        return "Mission 2 (Time Drift): Try entering your 6-digit code. Why might it fail?";
      case "M2_DESYNC_FAIL":
        return "Code Rejected. TOTP relies on strict time synchronization. Sync your device clock to generate a valid token.";
      case "M2_SYNCED":
        return "Clock synced! The generated token is now valid. Enter the new code.";
      case "M2_SUCCESS":
        return "Token Accepted. Security checkpoint passed.";
      case "M3_START":
        return "Mission 3 (Social Engineering): URGENT MESSAGE received. Read the prompt on the login portal carefully.";
      case "M3_PHISHED":
        return "CRITICAL FAILURE: You willingly gave the token to the hacker. 2FA cannot protect you from Social Engineering.";
      case "M3_SUCCESS":
        return "Phishing reported! You successfully identified the social engineering attack.";
      case "OUTCOME":
        return "Outcome: Vault Unlocked! You have successfully mastered Multi-Factor Authentication.";
      default:
        return "";
    }
  };

  const isVaultUnlocked = phase === "OUTCOME";
  const isAwaiting2FA = phase !== "M1_LEARN" && phase !== "M1_TRY" && phase !== "OUTCOME";
  
  // Show hacker alert toast during M1 intercept
  const showHackerAlert = phase === "M1_ALERT" || phase === "M1_UNDERSTAND" || phase === "M1_INPUT";
  
  // Phone UI states
  const showPhoneActive = phase === "M1_INPUT" || phase === "M1_SUCCESS" || phase === "M2_START" || phase === "M2_DESYNC_FAIL" || phase === "M2_SYNCED" || phase === "M2_SUCCESS" || phase === "M3_START";
  const showPhoneDesync = phase === "M2_START" || phase === "M2_DESYNC_FAIL";

  return (
    <LabShell
      navExtra={
        !isVaultUnlocked && (
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
      labId="twofactorauth9"
      theme="ocean" // LIGHT THEME
      title="Multi-Factor Authentication"
      instruction={getInstruction()}
      compact
      onReset={() => {
        setPhase("M1_LEARN");
        setInputValue("");
        setPasswordValue("");
        setTimedOut(false);
        setSecondsLeft(TIMER_DURATION_SECONDS);
        clearTimers();
      }}
    >
      <Celebration
        isActive={phase === "OUTCOME"}
        message="Vault Unlocked! You successfully defended against credential stuffing, time drift, and social engineering phishing attacks!"
        onReplay={() => {
          setPhase("M1_LEARN");
          setInputValue("");
          setPasswordValue("");
          setTimedOut(false);
          setSecondsLeft(TIMER_DURATION_SECONDS);
          clearTimers();
        }}
      />

      {/* Light Bright Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-200/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3 relative z-10">
        
        {/* ΓöÇΓöÇΓöÇ 1. TOP BAR: Hacker Alert Notification ΓöÇΓöÇΓöÇ */}
        <div className="h-10 shrink-0 flex items-center justify-end w-full px-2 relative z-50">
          <AnimatePresence>
            {showHackerAlert && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 border border-rose-200 rounded-lg shadow-lg backdrop-blur-xl relative overflow-hidden"
              >
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="text-rose-600 font-mono text-xs sm:text-sm font-bold tracking-wide">
                  [Alert] Hacker intercepted password: <span className="text-rose-700">'{passwordValue}'</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ΓöÇΓöÇΓöÇ 2. MIDDLE AREA: Vault & Phone Grid (Zero-Scroll HTML Layout) ΓöÇΓöÇΓöÇ */}
        <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 px-4 pb-2 min-h-0">
          
          {/* THE TARGET: Secure Vault - Light Glassmorphism */}
          <div className="w-full max-w-[280px] md:max-w-[340px] aspect-square rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-6 relative overflow-hidden shrink-0">
            {/* Glossy Edge */}
            <div className="absolute inset-0 border-t-2 border-white/80 rounded-[inherit] pointer-events-none" />
            
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-slate-800 text-sm md:text-lg font-black tracking-[0.25em] text-center w-full">
              SECURE VAULT
            </div>
            
            {/* Inner Ring */}
            <div className={`w-3/4 aspect-square rounded-full border-[3px] flex items-center justify-center transition-all duration-1000 relative bg-white/50 ${
              isVaultUnlocked ? "border-emerald-400 shadow-[inset_0_0_40px_rgba(16,185,129,0.1),0_0_40px_rgba(16,185,129,0.15)]" :
              isAwaiting2FA ? "border-rose-400 shadow-[inset_0_0_40px_rgba(244,63,94,0.1),0_0_40px_rgba(244,63,94,0.15)]" :
              "border-slate-200"
            }`}>
              
              {/* Spinning idle ring effect */}
              {!isVaultUnlocked && !isAwaiting2FA && (
                <div className="absolute inset-[-3px] border-[3px] border-transparent border-t-slate-300 rounded-full animate-[spin_8s_linear_infinite]" />
              )}
              {isAwaiting2FA && (
                <div className="absolute inset-[-3px] border-[3px] border-transparent border-t-rose-400 rounded-full animate-[spin_2s_linear_infinite]" />
              )}

              <AnimatePresence mode="wait">
                {isVaultUnlocked ? (
                  <motion.div key="unlocked" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <Unlock className="w-12 h-12 md:w-16 md:h-16 text-emerald-500 mb-2" />
                    <span className="text-emerald-600 font-bold text-xs md:text-sm text-center tracking-widest">ACCESS<br/>GRANTED</span>
                  </motion.div>
                ) : isAwaiting2FA ? (
                  <motion.div key="awaiting" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <Lock className="w-10 h-10 md:w-14 md:h-14 text-rose-500 mb-2 animate-pulse" />
                    <span className="text-rose-500 font-bold text-[10px] md:text-xs text-center tracking-widest">AWAITING<br/>2FA TOKEN</span>
                  </motion.div>
                ) : (
                  <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                    <Lock className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mb-2" />
                    <span className="text-slate-700 font-bold text-xs md:text-sm text-center tracking-widest">LOCKED</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* THE TOOL: Authenticator Smartphone - Light Glassmorphism */}
          <div className={`w-full max-w-[200px] md:max-w-[240px] aspect-[1/2] rounded-[2.5rem] border-2 flex flex-col items-center p-2 relative overflow-hidden transition-all duration-700 shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-2xl ${
            showPhoneActive ? "border-indigo-400/50 bg-indigo-50/80 shadow-[0_0_30px_rgba(99,102,241,0.15)]" :
            "border-slate-200 bg-white/60"
          }`}>
            
            {/* Phone Screen */}
            <div className="w-full h-full rounded-[2rem] bg-white flex flex-col items-center pt-8 px-4 pb-6 relative overflow-hidden shadow-inner border border-slate-100">
              
              {/* Subtle background radar/grid effect when active */}
              {showPhoneActive && (
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent animate-[ping_4s_linear_infinite]" style={{ height: '200%' }} />
                </div>
              )}

              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-100 rounded-b-2xl border border-t-0 border-slate-200 flex justify-center items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <div className="w-8 h-1.5 rounded-full bg-slate-300" />
              </div>
              
              <Smartphone className={`w-8 h-8 mb-2 z-10 ${showPhoneActive ? "text-indigo-500" : "text-slate-400"}`} />
              <div className={`text-sm font-black tracking-wide mb-1 z-10 ${showPhoneActive ? "text-indigo-700" : "text-slate-500"}`}>Authenticator</div>
              <div className="text-[10px] text-slate-600 font-bold mb-6 z-10 uppercase tracking-widest">Secure Vault App</div>

              {/* TOTP Display */}
              <div className={`w-full py-4 rounded-2xl border flex flex-col items-center justify-center mb-4 transition-all z-10 shadow-sm ${
                showPhoneDesync ? "bg-amber-50 border-amber-200" :
                showPhoneActive ? "bg-emerald-50 border-emerald-200" : 
                "bg-slate-50 border-slate-200"
              }`}>
                <span className={`font-mono text-3xl md:text-4xl font-bold tracking-[0.15em] ${
                  showPhoneDesync ? "text-amber-500 opacity-60 line-through decoration-amber-400" :
                  showPhoneActive ? "text-emerald-600" : 
                  "text-slate-400"
                }`}>
                  {showPhoneActive ? currentTotp : "------"}
                </span>
                
                {showPhoneDesync && (
                  <span className="text-[10px] text-amber-600 font-bold mt-1.5 tracking-widest uppercase">Out of Sync</span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2 z-10 border border-slate-200">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? "bg-rose-500" : "bg-indigo-500"}`}
                  style={{ width: showPhoneActive ? `${(timeLeft / 30) * 100}%` : "0%" }}
                />
              </div>
              <div className={`text-[10px] font-mono mb-4 z-10 uppercase tracking-wider ${timeLeft <= 5 && showPhoneActive ? "text-rose-500 animate-pulse" : "text-slate-500"}`}>
                {showPhoneActive ? `Refreshes in ${timeLeft}s` : "Standby"}
              </div>

              {/* Sync Button (Appears in Mission 2) */}
              <AnimatePresence>
                {showPhoneDesync && (
                  <motion.button
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    onClick={handleSyncClock}
                    className="flex items-center justify-center gap-2 w-[80%] py-3 bg-amber-100 border border-amber-300 rounded-xl text-amber-700 hover:bg-amber-200 active:scale-95 transition-all text-xs font-black uppercase tracking-widest shadow-sm z-10"
                  >
                    <RefreshCcw size={14} /> Sync Clock
                  </motion.button>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

        {/* ΓöÇΓöÇΓöÇ 3. BOTTOM BAR: The Input Portal - Light Glassmorphism ΓöÇΓöÇΓöÇ */}
        <div className="px-4 pb-4">
          <motion.div 
            animate={{ x: shakeKey > 0 ? [-10, 10, -10, 10, -5, 5, 0] : 0 }} 
            transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
            className={`w-full bg-white/70 backdrop-blur-xl rounded-3xl border border-white ${phase.startsWith("M3") ? "shadow-[0_10px_40px_rgba(244,63,94,0.1)]" : "shadow-[0_20px_50px_rgba(0,0,0,0.05)]"} p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 relative z-20 transition-all duration-500`}
          >
            
            <div className="flex flex-col gap-1.5 w-full md:w-1/3">
              <h3 className={`font-black flex items-center gap-2 uppercase tracking-widest text-sm ${phase.startsWith("M3") ? "text-rose-600" : "text-indigo-800"}`}>
                 {phase.startsWith("M3") ? <MessageSquareWarning size={18} /> : <ShieldCheck size={18} />}
                 {phase.startsWith("M3") ? "IT Admin Override" : "Vault Login Portal"}
              </h3>
              <p className={`text-[11px] md:text-xs font-medium leading-relaxed ${phase.startsWith("M3") ? "text-rose-700/80" : "text-slate-500"}`}>
                {phase === "M1_LEARN" || phase === "M1_TRY" ? "Mission 1: Enter your password to initiate login." : 
                 phase.startsWith("M3") ? "URGENT: We detected suspicious activity. Verify your identity immediately." :
                 "Mission 2: Enter 6-digit Authenticator code to proceed."}
              </p>
            </div>

            <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
              {phase === "M1_LEARN" || phase === "M1_TRY" ? (
                <form onSubmit={handlePasswordSubmit} className="flex-1 flex gap-3 w-full">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="password"
                      placeholder="Enter Password"
                      value={passwordValue}
                      onChange={(e) => {
                        setPasswordValue(e.target.value);
                        if (phase === "M1_LEARN") setPhase("M1_TRY");
                      }}
                      className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-800 font-mono text-lg focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] placeholder:text-slate-400 transition-all shadow-inner"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={passwordValue.length === 0}
                    className="h-14 px-8 rounded-2xl font-black uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100 shrink-0"
                  >
                    Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleTotpSubmit} className="flex-1 flex w-full gap-3">
                  <input 
                    type="text"
                    placeholder="------"
                    maxLength={6}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))} // only numbers
                    disabled={phase === "M1_SUCCESS" || phase === "M2_SUCCESS" || phase === "M3_SUCCESS" || phase === "OUTCOME" || phase === "M1_ALERT" || phase === "M1_UNDERSTAND"}
                    className={`flex-1 h-14 bg-white border-2 rounded-2xl text-center text-slate-800 font-mono font-bold text-2xl md:text-3xl tracking-[0.4em] focus:outline-none disabled:opacity-50 transition-all shadow-inner ${
                      phase.startsWith("M3") ? "border-rose-200 focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.1)] placeholder:text-rose-200" : 
                      "border-indigo-200 focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] placeholder:text-slate-300"
                    }`}
                  />
                  
                  {phase.startsWith("M3") && phase !== "M3_SUCCESS" && phase !== "OUTCOME" ? (
                    <div className="flex gap-2">
                      <button 
                        type="submit"
                        disabled={inputValue.length !== 6}
                        className="h-14 px-4 sm:px-6 rounded-2xl font-black uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-700 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100 shrink-0"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={handleReportPhishing}
                        className="h-14 px-4 sm:px-6 rounded-2xl font-black uppercase tracking-wider bg-emerald-100 border border-emerald-200 text-emerald-700 hover:bg-emerald-200 shadow-sm active:scale-95 transition-all flex items-center gap-2 shrink-0"
                      >
                        <ShieldOff size={18} className="hidden sm:block" /> Report Phishing
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="submit"
                      disabled={inputValue.length !== 6 || phase === "M1_SUCCESS" || phase === "M2_SUCCESS" || phase === "M3_SUCCESS" || phase === "OUTCOME" || phase === "M1_ALERT" || phase === "M1_UNDERSTAND"}
                      className="h-14 px-6 md:px-10 rounded-2xl font-black uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100 flex items-center gap-2 shrink-0"
                    >
                      <ShieldCheck size={20} className="hidden sm:block"/> Verify
                    </button>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    
      {/* Failure Modals */}
      {(timedOut || phase === "M3_PHISHED") && !isVaultUnlocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-2xl">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 max-w-sm text-center mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
              {timedOut ? <Timer className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              {timedOut ? "Time's Up!" : "Phishing Attack Successful"}
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
              {timedOut ? "You did not complete the lab in time." : "You willingly typed your authenticator code into a fraudulent portal. The hacker stole it and unlocked the vault."}
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
