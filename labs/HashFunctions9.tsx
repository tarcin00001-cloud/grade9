"use client";
import { Timer } from "lucide-react";

import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { FileText, Hash, ShieldAlert, ShieldCheck, RefreshCw, ChevronRight, Lock, AlertTriangle, CheckCircle2, Cpu, ArrowRight } from "lucide-react";

// Fast deterministic 64-char hex hash generator
const computeSimHash = (str: string): string => {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x5bd1e995;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hash1 = (hash1 ^ code) * 0x01000193;
    hash2 = (hash2 ^ (code + i)) * 0x5bd1e995;
  }

  let out = "";
  const hexDigits = "0123456789abcdef";
  let seed = Math.abs(hash1 ^ hash2);

  for (let i = 0; i < 64; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const index = Math.floor((seed / 233280) * 16);
    out += hexDigits[index];
  }
  return out;
};

type Step = 'LEARN' | 'TRY_ORIGINAL' | 'TRY_SNEAK' | 'FAIL' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';


const TIMER_DURATION_SECONDS = 5 * 60;
const STEP_ORDER = ['LEARN', 'TRY_MANUAL', 'TRY_SNEAK', 'FAIL_OVERLOAD', 'UNDERSTAND', 'IMPROVE', 'COMPLETE', 'OUTCOME'];
function marksForStep(s: any): number {
  const index = STEP_ORDER.indexOf(s);
  return Math.round((index / (STEP_ORDER.length - 1)) * 100);
}
export default function HashFunctions9() {
  const { reportComplete } = useLMSBridge("hashfunctions9");
  const { playPop, playZap, playError, playSuccess, playChime, playClick } = useLabAudio();

  const [step, setStep] = useState<Step>('LEARN');
  
  // Document states
  const contract100 = "PAYMENT: $100\nTO: SECURE VENDOR";
  const contract900 = "PAYMENT: $900\nTO: EVIL HACKER  ";
  const hash100 = computeSimHash(contract100);
  const hash900 = computeSimHash(contract900);
  
  const [currentDoc, setCurrentDoc] = useState(contract100);
  const [displayedHash, setDisplayedHash] = useState(hash100);
  
  // Scramble state
  const [isScrambling, setIsScrambling] = useState(false);
  const [scrambleTarget, setScrambleTarget] = useState("");
  const [pulse, setPulse] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const labCurrentStep = step;
  const isLabComplete = (labCurrentStep as any) === "OUTCOME" || (labCurrentStep as any) === "COMPLETE";

  useEffect(() => {
    if (timedOut || isLabComplete) {
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
  }, [timedOut, isLabComplete]);

  useEffect(() => {
    if (timedOut) {
      try { playError(); } catch(e) {}
      reportComplete({ points: marksForStep(labCurrentStep) });
    }
  }, [timedOut, labCurrentStep, reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;


  useEffect(() => {
    if (isScrambling) {
      let ticks = 0;
      const hexChars = "0123456789abcdef";
      const timer = setInterval(() => {
        ticks++;
        let scrambled = "";
        for (let i = 0; i < 64; i++) {
          scrambled += hexChars[Math.floor(Math.random() * 16)];
        }
        setDisplayedHash(scrambled);
        // Haptic audio for scramble
        if (ticks % 3 === 0 && playClick) playClick();

        if (ticks >= 15) {
          clearInterval(timer);
          setDisplayedHash(scrambleTarget);
          setIsScrambling(false);
          if (playZap) playZap(); // The heavy ka-chunk!
          
          if (step === 'IMPROVE') {
             setTimeout(() => {
                setStep('COMPLETE');
                if (playPop) playPop();
             }, 1500);
          }
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isScrambling, scrambleTarget, step, playPop, playClick, playZap]);
  
  const triggerPipeline = (target: string, nextStep: Step, delay: number = 1000) => {
    if (playZap) playZap();
    setPulse(true);
    setTimeout(() => setPulse(false), 800);
    
    setTimeout(() => {
      setScrambleTarget(target);
      setIsScrambling(true);
      if (nextStep) {
        setTimeout(() => setStep(nextStep), delay + 800);
      }
    }, 300);
  };

  const handleNextStep = () => {
    switch (step) {
      case 'LEARN':
        if (playPop) playPop();
        setStep('TRY_ORIGINAL');
        break;
      case 'TRY_ORIGINAL':
        triggerPipeline(hash100, 'TRY_SNEAK');
        break;
      case 'TRY_SNEAK':
        if (playClick) playClick();
        setCurrentDoc(contract900);
        // Notice we DO NOT scramble here. We want them to see the hash is stale!
        break;
      case 'FAIL':
      case 'UNDERSTAND':
      case 'IMPROVE':
      case 'COMPLETE':
      case 'OUTCOME':
        break;
    }
  };

  const handleVerifySneak = () => {
    if (playError) playError();
    setStep('FAIL');
  };

  const handleSeeWhy = () => {
    if (playPop) playPop();
    setStep('UNDERSTAND');
  };

  const handleRecalculate = () => {
    setStep('IMPROVE');
    triggerPipeline(hash900, 'COMPLETE', 2000);
  };

  const handleFinalVerify = () => {
    if (playSuccess) playSuccess();
    setStep('OUTCOME');
    setTimeout(() => {
      reportComplete({ points: marksForStep(labCurrentStep) });
      if (playChime) playChime();
    }, 4500);
  };

  const handleReset = () => {
  setSecondsLeft(TIMER_DURATION_SECONDS);
  setTimedOut(false);
    if (playPop) playPop();
    setStep('LEARN');
    setCurrentDoc(contract100);
    setDisplayedHash(hash100);
    setIsScrambling(false);
    setPulse(false);
  };

  const changedIndices: number[] = [];
  if (step === 'UNDERSTAND' || step === 'IMPROVE' || step === 'COMPLETE' || step === 'OUTCOME') {
     for (let i = 0; i < 64; i++) {
       if (hash100[i] !== displayedHash[i] && !isScrambling) {
         changedIndices.push(i);
       }
     }
  }

  let currentMission = 1;
  if (['TRY_SNEAK', 'FAIL', 'UNDERSTAND'].includes(step)) currentMission = 2;
  if (['IMPROVE', 'COMPLETE', 'OUTCOME'].includes(step)) currentMission = 3;

  // --- Render Helpers --- //
  const renderHashGrid = (hash: string) => {
    return (
      <div className="grid grid-cols-8 gap-0.5 sm:gap-1 w-fit mx-auto relative z-10 my-auto">
        {hash.split("").map((char, idx) => {
          let isChanged = false;
          if (!isScrambling && (step === 'UNDERSTAND' || step === 'COMPLETE' || step === 'OUTCOME' || step === 'IMPROVE')) {
            isChanged = hash100[idx] !== char;
          }
          return (
            <motion.div
              key={idx}
              initial={false}
              animate={{ 
                scale: isScrambling ? [1, 1.1, 1] : 1,
                rotateX: isScrambling ? [0, 90, 0] : 0
              }}
              transition={{ duration: 0.15, repeat: isScrambling ? Infinity : 0 }}
              className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center font-mono font-bold text-[9px] sm:text-[10px] md:text-xs rounded border transition-all duration-300 ${
                isScrambling ? "bg-slate-800 text-slate-400 border-slate-700" :
                isChanged 
                  ? "bg-rose-900 text-rose-300 border-rose-500 shadow-[0_0_12px_#e11d48]" 
                  : "bg-slate-900 text-cyan-400 border-slate-700"
              }`}
            >
              {char.toUpperCase()}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <LabShell
      labId="hashfunctions9"

      navExtra={
        !isLabComplete && (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 30 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-sky-100/80 text-sky-700"
          }`}>
            <Timer size={16} strokeWidth={2.5} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      }
      title="Cryptographic Hash Functions"
      instruction="A hash is a digital fingerprint. Process documents through the SHA-256 ASIC to verify their integrity."
      bgOverride="bg-gradient-to-b from-sky-50 via-white to-slate-100"
      compact={true}
      onReset={handleReset}
    >
      <Celebration
        isActive={step === 'OUTCOME'}
        message="System Secured! You intercepted the forged transaction by proving its digital fingerprint didn't match."
        onReplay={handleReset}
      />

      <div data-step={labCurrentStep}
        className="flex flex-col w-full h-full min-h-0 relative font-sans overflow-hidden px-2 md:px-4 py-1 gap-2 md:gap-3 max-w-6xl mx-auto">
        
        {/* Mission HUD */}
        <div className="bg-white border-[3px] border-slate-200/70 shadow-lg shadow-sky-900/5 rounded-2xl px-4 py-2 shrink-0 flex items-center gap-2 self-center w-full max-w-2xl mt-1">
          <span className="text-[11px] font-extrabold uppercase tracking-tight text-slate-500 hidden sm:inline mr-2">
            Missions:
          </span>
          {[
            { id: 1, title: "1. The Fingerprint" },
            { id: 2, title: "2. Avalanche Attack" },
            { id: 3, title: "3. Restoring Integrity" }
          ].map((m) => (
            <div
              key={m.id}
              className={`flex-1 text-center py-1.5 px-2 rounded-lg text-[10px] md:text-xs font-bold transition-colors ${
                currentMission === m.id
                  ? "bg-sky-100 text-sky-800 border-2 border-sky-300 shadow-inner"
                  : currentMission > m.id
                  ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                  : "bg-slate-50 text-slate-400 border-2 border-slate-100"
              }`}
            >
              {m.title}
            </div>
          ))}
        </div>

        {/* Instruction Plaque (Sticky Note Style) */}
        <div className="self-center bg-[#fdf3c6] border border-[#e5d898] rounded shadow-[2px_4px_10px_rgba(0,0,0,0.1)] px-4 py-3 transform rotate-[-1deg] max-w-2xl w-full z-20 flex items-start gap-3">
          <div className="bg-amber-400/20 p-2 rounded text-amber-700 shrink-0">
            <Lock size={20} />
          </div>
          <div className="flex-1">
            {step === 'LEARN' && (
              <>
                <h3 className="font-extrabold text-amber-900 text-sm uppercase tracking-tight">Mission 1: The Fingerprint</h3>
                <p className="text-xs text-amber-900 mt-0.5 font-medium leading-snug">A hash function acts as a digital shredder that creates a unique "fingerprint" for a document. No two files share the same fingerprint.</p>
              </>
            )}
            {step === 'TRY_ORIGINAL' && (
              <>
                <h3 className="font-extrabold text-amber-900 text-sm uppercase tracking-tight">Mission 1: The Fingerprint</h3>
                <p className="text-xs text-amber-900 mt-0.5 font-medium leading-snug">Press the Hash Processor button to scan the $100 contract and generate its initial signature.</p>
              </>
            )}
            {step === 'TRY_SNEAK' && (
              <>
                <h3 className="font-extrabold text-amber-900 text-sm uppercase tracking-tight">Mission 2: Avalanche Attack</h3>
                <p className="text-xs text-amber-900 mt-0.5 font-medium leading-snug">A hacker intercepts the check and changes the amount and recipient. Submit it to the bank and see if they accept the old hash!</p>
              </>
            )}
            {step === 'FAIL' && (
              <>
                <h3 className="font-extrabold text-rose-700 text-sm uppercase tracking-tight">Mission 2: Avalanche Attack</h3>
                <p className="text-xs text-rose-900 mt-0.5 font-medium leading-snug">The bank detected a mismatch between the altered document and the original digital fingerprint. The forged check was caught!</p>
              </>
            )}
            {step === 'UNDERSTAND' && (
              <>
                <h3 className="font-extrabold text-rose-700 text-sm uppercase tracking-tight">Mission 2: Avalanche Attack</h3>
                <p className="text-xs text-rose-900 mt-0.5 font-medium leading-snug">Notice the glowing red blocks below. Changing a few characters caused a massive cascade, scrambling almost the entire hash!</p>
              </>
            )}
            {step === 'IMPROVE' && (
              <>
                <h3 className="font-extrabold text-amber-900 text-sm uppercase tracking-tight">Mission 3: Restoring Integrity</h3>
                <p className="text-xs text-amber-900 mt-0.5 font-medium leading-snug">To legally change the contract, you must generate a completely new valid hash for the updated document.</p>
              </>
            )}
            {step === 'COMPLETE' && (
              <>
                <h3 className="font-extrabold text-amber-900 text-sm uppercase tracking-tight">Mission 3: Restoring Integrity</h3>
                <p className="text-xs text-amber-900 mt-0.5 font-medium leading-snug">The new signature is ready. Submit the updated contract and its new hash to the bank for final clearance.</p>
              </>
            )}
            {step === 'OUTCOME' && (
              <>
                <h3 className="font-extrabold text-emerald-700 text-sm uppercase tracking-tight">Mission 3: Restoring Integrity</h3>
                <p className="text-xs text-emerald-900 mt-0.5 font-medium leading-snug">The new hash perfectly matches the updated document. Data integrity confirmed.</p>
              </>
            )}
          </div>
        </div>

        {/* 3-Column Workstation Layout */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 relative justify-center items-stretch mt-2 w-full">
          
          {/* LEFT: Physical Clipboard */}
          <div className="w-full lg:flex-1 bg-[#8B5A2B] rounded-xl p-3 shadow-[0_15px_30px_rgba(0,0,0,0.3)] border-[4px] border-[#5C3A21] flex flex-col relative min-w-0">
            {/* Clipboard Clip */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-6 bg-slate-300 rounded-lg border-2 border-slate-400 shadow-md flex items-center justify-center">
              <div className="w-16 h-1 bg-slate-500 rounded-full" />
            </div>
            
            <h4 className="text-[10px] font-black text-[#E8C396] mb-3 mt-2 flex items-center justify-center uppercase tracking-widest text-center">
              Document Payload
            </h4>
            
            <div className="flex-1 bg-[#fcfbf7] border border-[#e2e0d8] rounded shadow-inner p-4 font-mono text-base font-bold text-slate-800 relative whitespace-pre-wrap leading-relaxed overflow-hidden">
              {currentDoc}
              {/* Highlight tampering */}
              {currentDoc === contract900 && step !== 'LEARN' && step !== 'TRY_ORIGINAL' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none border-[3px] border-rose-500/50 rounded" />
              )}
            </div>
            
            {/* Action Area */}
            <div className="mt-4 shrink-0 flex flex-col items-center">
              {step === 'LEARN' && (
                <button onClick={handleNextStep} className="w-full bg-slate-100 border-b-4 border-slate-300 hover:bg-white text-slate-700 font-extrabold py-3 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-sm tracking-wide shadow-lg">
                  Initialize System <ChevronRight size={18} />
                </button>
              )}
              {step === 'TRY_ORIGINAL' && (
                <button onClick={handleNextStep} disabled={isScrambling} className="w-full bg-indigo-600 border-b-[6px] border-indigo-900 hover:bg-indigo-500 text-white font-extrabold py-3 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-sm tracking-wide shadow-lg disabled:opacity-50">
                  <Cpu size={18} /> Run Hash Engine
                </button>
              )}
              {step === 'TRY_SNEAK' && currentDoc === contract100 && (
                <button onClick={handleNextStep} className="w-full bg-rose-600 border-b-[6px] border-rose-900 hover:bg-rose-500 text-white font-extrabold py-3 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-sm tracking-wide shadow-[0_0_20px_rgba(225,29,72,0.5)] animate-pulse">
                  Intercept & Forge Check
                </button>
              )}
              {step === 'TRY_SNEAK' && currentDoc === contract900 && (
                <button onClick={handleVerifySneak} className="w-full bg-slate-800 border-b-[6px] border-black hover:bg-slate-700 text-emerald-400 font-extrabold py-3 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-sm tracking-wide shadow-lg">
                  <ShieldCheck size={18} /> Submit to Bank
                </button>
              )}
              {step === 'FAIL' && (
                <button onClick={handleSeeWhy} className="w-full bg-rose-100 border-b-[4px] border-rose-300 hover:bg-white text-rose-800 font-extrabold py-3 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-sm tracking-wide shadow-lg">
                  <AlertTriangle size={18} /> Investigate Failure
                </button>
              )}
              {step === 'UNDERSTAND' && (
                <button onClick={handleRecalculate} className="w-full bg-indigo-600 border-b-[6px] border-indigo-900 hover:bg-indigo-500 text-white font-extrabold py-3 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-sm tracking-wide shadow-lg">
                  <RefreshCw size={18} /> Re-Hash Document
                </button>
              )}
              {step === 'COMPLETE' && (
                <button onClick={handleFinalVerify} className="w-full bg-emerald-600 border-b-[6px] border-emerald-900 hover:bg-emerald-500 text-white font-extrabold py-3 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <ShieldCheck size={18} /> Submit to Bank
                </button>
              )}
              {step === 'OUTCOME' && (
                <div className="w-full bg-slate-200 border-2 border-slate-300 text-emerald-600 font-extrabold py-3 rounded flex items-center justify-center gap-2 uppercase tracking-wide">
                  <CheckCircle2 size={18} /> Cleared
                </div>
              )}
            </div>
          </div>

          {/* CENTER: The Hash Engine / Pipeline */}
          <div className="hidden lg:flex flex-col justify-center items-center px-2 shrink-0">
            <div className="h-full flex flex-col items-center">
              <div className="w-4 h-1/3 bg-slate-300 border-x-2 border-slate-400 relative overflow-hidden flex justify-center">
                {pulse && <motion.div initial={{ y: -50 }} animate={{ y: 200 }} transition={{ duration: 0.5 }} className="w-full h-8 bg-indigo-500 shadow-[0_0_20px_#6366f1]" />}
              </div>
              
              {/* ASIC Chip */}
              <div className="bg-slate-800 border-[4px] border-slate-900 rounded-xl p-3 shadow-2xl z-10 flex flex-col items-center gap-1">
                <Cpu size={32} className={isScrambling ? "text-indigo-400 animate-pulse" : "text-slate-500"} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SHA-256</span>
              </div>

              <div className="w-4 h-1/3 bg-slate-300 border-x-2 border-slate-400 relative overflow-hidden flex justify-center">
                {pulse && <motion.div initial={{ y: -50 }} animate={{ y: 200 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full h-8 bg-cyan-400 shadow-[0_0_20px_#22d3ee]" />}
              </div>
            </div>
          </div>

          {/* RIGHT: LCD Display Screen */}
          <div className="w-full lg:flex-1 min-h-[260px] lg:min-h-0 bg-slate-300 border-[6px] border-b-[12px] border-slate-400 rounded-2xl shadow-2xl flex flex-col overflow-hidden min-w-0">
             <div className="bg-slate-400 border-b border-slate-500 px-4 py-2 flex items-center justify-between shadow-inner">
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                 <Lock size={12} /> Digital Digest Output
               </span>
               <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-rose-500 shadow-inner" />
                 <div className="w-2 h-2 rounded-full bg-amber-500 shadow-inner" />
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-inner" />
               </div>
             </div>
             
             <div className={`flex-1 bg-[#0f172a] shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)] p-2 md:p-4 flex flex-col relative overflow-hidden transition-colors duration-500 ${step === 'FAIL' ? 'bg-rose-950/40' : step === 'OUTCOME' ? 'bg-emerald-950/20' : ''}`}>
               {/* Screen Glare */}
               <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none transform -skew-y-12" />

               <div className="flex justify-end mb-2 h-5">
                  {(step === 'UNDERSTAND' || step === 'COMPLETE' || step === 'OUTCOME') && !isScrambling && (
                     <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold bg-rose-900/80 border border-rose-500 text-rose-300 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(225,29,72,0.5)]">
                       WARNING: Avalanche ({changedIndices.length}/64 blocks altered)
                     </motion.span>
                  )}
               </div>

               <div className="flex-1 flex items-center justify-center relative">
                  {step === 'LEARN' && (
                     <div className="text-center font-mono text-slate-600 text-xs font-bold uppercase tracking-widest">
                       Awaiting Input Stream...
                     </div>
                  )}
                  {step !== 'LEARN' && renderHashGrid(displayedHash)}
                  
                  {/* The Physical "REJECTED" Stamp Overlay */}
                  <AnimatePresence>
                    {step === 'FAIL' && (
                        <motion.div 
                          initial={{ scale: 3, opacity: 0, rotate: -15 }} 
                          animate={{ scale: 1, opacity: 1, rotate: -10 }} 
                          transition={{ type: "spring", stiffness: 200, damping: 12 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                        >
                          <div className="border-[4px] md:border-[6px] border-rose-600 text-rose-600 px-4 md:px-6 py-2 rounded-lg font-black text-xl md:text-3xl uppercase tracking-widest shadow-[0_0_30px_rgba(225,29,72,0.6)] backdrop-blur-sm bg-slate-900/40 transform">
                              TAMPERED!
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             </div>
          </div>
        </div>

      </div>
    
      {timedOut && !isLabComplete && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm text-center mx-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1.5">Time's Up!</h3>
            <p className="text-sm font-medium text-slate-600 mb-4">
              You reached {marksForStep(labCurrentStep)} / 100 marks before the 5:00 timer ran out.
            </p>
            <button onClick={handleReset} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-1 shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none text-white rounded-xl text-sm font-bold transition-all cursor-pointer">
              Try Again
            </button>
          </div>
        </div>
      )}

    </LabShell>
  );
}
