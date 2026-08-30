"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { FileText, Hash, ShieldAlert, ShieldCheck, RefreshCw, ChevronRight, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

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

export default function HashFunctions9() {
  const { reportComplete } = useLMSBridge();
  const { playPop, playZap, playError, playSuccess, playChime } = useLabAudio();

  const [step, setStep] = useState<Step>('LEARN');
  
  // Document states
  const contract100 = "PAYMENT: $100\nTO: HACKER";
  const contract900 = "PAYMENT: $900\nTO: HACKER";
  const hash100 = computeSimHash(contract100);
  const hash900 = computeSimHash(contract900);
  
  const [currentDoc, setCurrentDoc] = useState(contract100);
  const [displayedHash, setDisplayedHash] = useState(hash100);
  
  // Scramble state
  const [isScrambling, setIsScrambling] = useState(false);
  const [scrambleTarget, setScrambleTarget] = useState("");

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

        if (ticks >= 15) {
          clearInterval(timer);
          setDisplayedHash(scrambleTarget);
          setIsScrambling(false);
          if (step === 'IMPROVE') {
             setStep('COMPLETE');
             playPop();
          }
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isScrambling, scrambleTarget, step, playPop]);
  
  const handleNextStep = () => {
    switch (step) {
      case 'LEARN':
        playPop();
        setStep('TRY_ORIGINAL');
        break;
      case 'TRY_ORIGINAL':
        playZap();
        setScrambleTarget(hash100);
        setIsScrambling(true);
        setTimeout(() => setStep('TRY_SNEAK'), 1000);
        break;
      case 'TRY_SNEAK':
        playPop();
        setCurrentDoc(contract900);
        // Keep displayed hash as hash100 to sneak
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
    playError();
    setStep('FAIL');
  };

  const handleSeeWhy = () => {
    playPop();
    setStep('UNDERSTAND');
  };

  const handleRecalculate = () => {
    playZap();
    setStep('IMPROVE');
    setScrambleTarget(hash900);
    setIsScrambling(true);
  };

  const handleFinalVerify = () => {
    playSuccess();
    setStep('OUTCOME');
    setTimeout(() => {
      reportComplete();
      playChime();
    }, 4500);
  };

  const handleReset = () => {
    playPop();
    setStep('LEARN');
    setCurrentDoc(contract100);
    setDisplayedHash(hash100);
    setIsScrambling(false);
  };

  const changedIndices: number[] = [];
  if (step === 'UNDERSTAND' || step === 'IMPROVE' || step === 'COMPLETE' || step === 'OUTCOME') {
     for (let i = 0; i < 64; i++) {
       if (hash100[i] !== displayedHash[i] && !isScrambling) {
         changedIndices.push(i);
       }
     }
  }

  // --- Render Helpers --- //
  const renderHashGrid = (hash: string) => {
    return (
      <div className="grid grid-cols-8 gap-1 w-full max-w-sm mx-auto">
        {hash.split("").map((char, idx) => {
          let isChanged = false;
          if (!isScrambling && (step === 'UNDERSTAND' || step === 'COMPLETE' || step === 'OUTCOME' || step === 'IMPROVE')) {
            isChanged = hash100[idx] !== char;
          }
          return (
            <div
              key={idx}
              className={`aspect-square flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs rounded border transition-colors ${
                isScrambling ? "bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-700/50" :
                isChanged 
                  ? "bg-fuchsia-600/30 text-fuchsia-300 border-fuchsia-500 shadow-[0_0_8px_#d946ef]" 
                  : "bg-slate-900 text-cyan-400 border-slate-700"
              }`}
            >
              {char}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <LabShell
      labId="hashfunctions9"
      title="Cryptographic Hash Functions"
      subtitle="The Avalanche Effect in Action"
      bgOverride="bg-slate-950"
      compact={true}
      instruction="Complete the transaction by ensuring data integrity."
      onReset={handleReset}
    >
      <Celebration
        isActive={step === 'OUTCOME'}
        message="Transaction Cleared! You've learned how digital signatures and hashes protect data integrity."
        onReplay={handleReset}
      />

      <div className="flex-1 min-h-0 w-full flex flex-col p-2 sm:p-4 gap-4 relative z-10 select-none text-slate-200">
        
        {/* Instruction Banner */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start gap-3 shadow-lg shrink-0">
          <div className="bg-cyan-900/50 p-2 rounded-md text-cyan-400">
            <Hash size={20} />
          </div>
          <div className="flex-1">
            {step === 'LEARN' && (
              <>
                <h3 className="font-bold text-cyan-400 text-sm">Concept: One-Way Hash</h3>
                <p className="text-xs text-slate-400 mt-1">A hash acts as a digital fingerprint for a document. It is unique to the exact contents of the file.</p>
              </>
            )}
            {step === 'TRY_ORIGINAL' && (
              <>
                <h3 className="font-bold text-cyan-400 text-sm">Step 1: Sign the Contract</h3>
                <p className="text-xs text-slate-400 mt-1">Click 'Hash Document' to create a digital fingerprint for the $100 contract.</p>
              </>
            )}
            {step === 'TRY_SNEAK' && (
              <>
                <h3 className="font-bold text-cyan-400 text-sm">Step 2: The Attack</h3>
                <p className="text-xs text-slate-400 mt-1">Change the contract to $900, but try to sneak the old hash past the bank verify system.</p>
              </>
            )}
            {step === 'FAIL' && (
              <>
                <h3 className="font-bold text-rose-400 text-sm">Transaction Rejected!</h3>
                <p className="text-xs text-slate-400 mt-1">The bank detected a mismatch between the document and its digital fingerprint.</p>
              </>
            )}
            {step === 'UNDERSTAND' && (
              <>
                <h3 className="font-bold text-fuchsia-400 text-sm">The Avalanche Effect</h3>
                <p className="text-xs text-slate-400 mt-1">Changing even a single character causes a massive cascade, scrambling the output entirely.</p>
              </>
            )}
            {step === 'IMPROVE' && (
              <>
                <h3 className="font-bold text-cyan-400 text-sm">Recalculate Hash</h3>
                <p className="text-xs text-slate-400 mt-1">Generate a new valid hash for the $900 contract.</p>
              </>
            )}
            {step === 'COMPLETE' && (
              <>
                <h3 className="font-bold text-cyan-400 text-sm">Verify Transaction</h3>
                <p className="text-xs text-slate-400 mt-1">Submit the updated contract and its new hash to the bank.</p>
              </>
            )}
            {step === 'OUTCOME' && (
              <>
                <h3 className="font-bold text-emerald-400 text-sm">Transaction Successful</h3>
                <p className="text-xs text-slate-400 mt-1">The hash matches! Data integrity confirmed.</p>
              </>
            )}
          </div>
        </div>

        {/* Dual Pane Layout */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left Pane: Document */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col shadow-inner">
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase shrink-0">
              <FileText size={14} /> Document Payload
            </h4>
            <div className="flex-1 min-h-[100px] bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-cyan-200 relative whitespace-pre-wrap">
              {currentDoc}
              {currentDoc === contract900 && step !== 'LEARN' && step !== 'TRY_ORIGINAL' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none border-2 border-rose-500/50 rounded-lg" />
              )}
            </div>
            
            <div className="mt-4 shrink-0">
              {step === 'LEARN' && (
                <button onClick={handleNextStep} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                  Start Lab <ChevronRight size={16} />
                </button>
              )}
              {step === 'TRY_ORIGINAL' && (
                <button onClick={handleNextStep} disabled={isScrambling} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                  <Hash size={16} /> Hash Document
                </button>
              )}
              {step === 'TRY_SNEAK' && currentDoc === contract100 && (
                <button onClick={handleNextStep} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                  Change to $900
                </button>
              )}
              {step === 'TRY_SNEAK' && currentDoc === contract900 && (
                <button onClick={handleVerifySneak} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                  <ShieldCheck size={16} /> Verify with Bank
                </button>
              )}
              {step === 'FAIL' && (
                <button onClick={handleSeeWhy} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                  <AlertTriangle size={16} /> Understand Why
                </button>
              )}
              {step === 'UNDERSTAND' && (
                <button onClick={handleRecalculate} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> Recalculate Hash
                </button>
              )}
              {step === 'COMPLETE' && (
                <button onClick={handleFinalVerify} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                  <ShieldCheck size={16} /> Verify with Bank
                </button>
              )}
              {step === 'OUTCOME' && (
                <div className="w-full bg-emerald-900/50 border border-emerald-500/50 text-emerald-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Verified
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Hex Display */}
          <div className={`min-h-[220px] md:min-h-0 bg-slate-900 border ${step === 'FAIL' ? 'border-rose-500' : step === 'OUTCOME' ? 'border-emerald-500' : 'border-slate-700'} rounded-xl p-4 flex flex-col shadow-inner transition-colors duration-500`}>
             <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between uppercase shrink-0">
              <span className="flex items-center gap-2"><Lock size={14} /> SHA-256 Digest</span>
              {(step === 'UNDERSTAND' || step === 'COMPLETE' || step === 'OUTCOME') && !isScrambling && (
                 <span className="text-[10px] bg-fuchsia-900/50 text-fuchsia-300 px-2 py-1 rounded">
                   Avalanche: {changedIndices.length}/64 bits
                 </span>
              )}
            </h4>
            <div className="flex-1 flex items-center justify-center relative">
               {step === 'LEARN' && (
                  <div className="text-center text-slate-500 text-xs">Hash will appear here</div>
               )}
               {step !== 'LEARN' && renderHashGrid(displayedHash)}
               
               {step === 'FAIL' && (
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-slate-950/50 rounded-xl">
                     <div className="bg-rose-900/90 border-2 border-rose-500 text-rose-200 p-4 rounded-xl flex flex-col items-center shadow-[0_0_20px_#e11d48]">
                        <ShieldAlert size={32} className="mb-2 text-rose-400" />
                        <span className="font-black text-lg">HASH MISMATCH</span>
                        <span className="text-xs mt-1">Data integrity violation detected</span>
                     </div>
                  </motion.div>
               )}
            </div>
          </div>
        </div>

      </div>
    </LabShell>
  );
}
