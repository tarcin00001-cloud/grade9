"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Wallet, Diamond, ArrowRight, Code, XOctagon, CheckCircle2, ShieldAlert, Coins, Timer, Lightbulb } from "lucide-react";

export default function SmartContracts9() {
  const { reportComplete } = useLMSBridge("smartcontracts9");
  const { playPop, playError, playSuccess, playClick } = useLabAudio();

  // Timer State
  const TIMER_DURATION = 5 * 60;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // State
  const [phase, setPhase] = useState(0); // 0: Intro, 1: Try 1 ETH, 2: Reverted, 3: Try 2 ETH, 4: Success
  const [ethBalance, setEthBalance] = useState(5);
  const [hasNFT, setHasNFT] = useState(false);
  const [txState, setTxState] = useState<"idle" | "evaluating" | "reverted" | "success">("idle");
  const [activeLine, setActiveLine] = useState(-1);
  const [coinPos, setCoinPos] = useState<"wallet" | "contract" | "returned">("wallet");
  
  // Learning Mechanisms
  const [viewMode, setViewMode] = useState<"code" | "english">("code");
  const [hasReadEnglish, setHasReadEnglish] = useState(false);

  const codeLines = [
    "function buyNFT() payable {",
    "  require(msg.value == 2 ETH, 'Not enough ETH');",
    "  dispenseAsset(msg.sender);",
    "}"
  ];

  const englishLines = [
    "When anyone tries to buy the NFT:",
    "  RULE: Must pay exactly 2 ETH. If not, cancel everything.",
    "  ACTION: Give the digital asset to the payer.",
    "" // Blank line to perfectly match code height
  ];

  const handleSend1Eth = () => {
    if (phase !== 0 && phase !== 2) return;
    if (phase === 0 && !hasReadEnglish) return;
    
    playClick();
    setPhase(1);
    setTxState("evaluating");
    setEthBalance(prev => prev - 1);
    setCoinPos("contract");
    setActiveLine(0);

    setTimeout(() => {
      playPop();
      setActiveLine(1); // Hits require
      
      setTimeout(() => {
        playError();
        setTxState("reverted");
        setCoinPos("returned");
        setPhase(2); // Understand why
        
        // Refund and Reset state for next try
        setTimeout(() => {
          setEthBalance(prev => prev + 1);
          setCoinPos("wallet");
          setActiveLine(-1);
          setTxState("idle");
        }, 1500);
      }, 1200);
    }, 800);
  };

  const handleSend2Eth = () => {
    if (phase < 2) return;
    playClick();
    setPhase(3);
    setTxState("evaluating");
    setEthBalance(prev => prev - 2);
    setCoinPos("contract");
    setActiveLine(0);

    setTimeout(() => {
      playPop();
      setActiveLine(1); // Hits require
      
      setTimeout(() => {
        playPop();
        setActiveLine(2); // Hits dispense
        
        setTimeout(() => {
          playSuccess();
          setTxState("success");
          setHasNFT(true);
          setActiveLine(3);
          setPhase(4);
          setCoinPos("wallet"); // Trigger coin drop animation
          reportComplete();
        }, 800);
      }, 1200);
    }, 800);
  };

  const resetLab = () => {
    setPhase(0);
    setEthBalance(5);
    setHasNFT(false);
    setTxState("idle");
    setActiveLine(-1);
    setCoinPos("wallet");
    setTimeLeft(TIMER_DURATION);
    setViewMode("code");
    setHasReadEnglish(false);
  };

  let currentInstruction = "";
  if (phase === 0) {
    currentInstruction = hasReadEnglish 
      ? "Great! The 'require' rule acts as a strict bouncer. Let's test it out. Click 'Send 1 ETH' to try and buy the Diamond."
      : "A Smart Contract is a digital vending machine made of strict rules. Toggle the code to ENGLISH to learn how it works.";
  } else if (phase === 1) {
    currentInstruction = "Evaluating transaction on the blockchain...";
  } else if (phase === 2) {
    currentInstruction = "Transaction Reverted! The code strictly requires 2 ETH. Your 1 ETH was safely refunded. Now try sending exactly 2 ETH.";
  } else if (phase === 3) {
    currentInstruction = "Evaluating transaction...";
  } else if (phase === 4) {
    currentInstruction = "Success! The requirement was met, the code executed, and you received the asset!";
  }

  const currentLines = viewMode === "code" ? codeLines : englishLines;

  return (
    <LabShell
      labId="smartcontracts9"
      title="Smart Contracts Mechanics"
      instruction={currentInstruction}
      compact={true}
      onReset={resetLab}
      bgOverride="bg-slate-50"
      theme="ocean"
      navExtra={
        <div className="flex items-center gap-1.5 text-sky-700 bg-white hover:bg-sky-50 border border-sky-100 shadow-sm px-3 md:px-4 h-9 md:h-10 rounded-full font-mono text-sm font-bold transition-colors">
          <Timer size={16} strokeWidth={2.5} />
          {formatTime(timeLeft)}
        </div>
      }
    >
      {/* Ocean Theme Background Grid */}
      <div className="absolute inset-0 bg-slate-50 overflow-hidden z-0 pointer-events-none">
        <svg className="w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-sc" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-sc)" />
        </svg>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-y-auto">
        
        {/* Dynamic Instruction Banner */}
        <div className="w-full bg-white border-2 border-sky-200 text-sky-900 rounded-xl p-3 shadow-sm flex items-start sm:items-center gap-3 shrink-0 transition-all duration-300">
          <div className={`p-2 rounded-lg shrink-0 transition-colors ${phase === 0 && !hasReadEnglish ? 'bg-amber-100' : 'bg-sky-100'}`}>
            {txState === "reverted" ? <XOctagon className="text-rose-600" size={20} /> :
             txState === "success" ? <CheckCircle2 className="text-emerald-600" size={20} /> :
             phase === 0 && !hasReadEnglish ? <Lightbulb className="text-amber-600 animate-pulse" size={20} /> :
             <Lightbulb className="text-sky-600" size={20} />}
          </div>
          <p className="text-sm sm:text-base font-semibold leading-snug">
            {currentInstruction}
          </p>
        </div>

        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3 sm:gap-4 min-h-0 pb-4">
          
          {/* USER WALLET (LEFT) */}
          <div className="w-full sm:w-1/3 flex flex-col gap-4 shrink-0">
            <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col h-full relative z-10">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Wallet className="text-slate-600" size={20} />
                </div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Your Wallet</h2>
              </div>
              
              <div className="mb-4 shrink-0">
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Balance</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
                  {ethBalance} <span className="text-base sm:text-lg text-amber-500">ETH</span>
                </div>
              </div>

              <div className="mb-4 flex-1 flex flex-col justify-center min-h-[60px]">
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assets</div>
                <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-500 ${hasNFT ? 'bg-indigo-50 border-indigo-300 shadow-inner' : 'bg-slate-50 border-slate-300'}`}>
                  <AnimatePresence>
                    {hasNFT && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-indigo-500 drop-shadow-md"
                      >
                        <Diamond size={32} fill="currentColor" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto shrink-0">
                <button 
                  onClick={handleSend1Eth}
                  disabled={txState !== "idle" || phase >= 3 || (!hasReadEnglish && phase === 0)}
                  className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-sm sm:text-base"
                >
                  Send 1 ETH
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={handleSend2Eth}
                  disabled={txState !== "idle" || phase < 2 || hasNFT}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-sm sm:text-base"
                >
                  Send 2 ETH
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* SMART CONTRACT VENDING MACHINE (RIGHT) */}
          <div className="flex-1 flex flex-col relative z-0 min-h-[300px]">
            <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
              
              {/* Machine Header */}
              <div className="bg-slate-800 p-3 flex items-center justify-between border-b-4 border-slate-900 shrink-0">
                <div className="flex items-center gap-2">
                  <Code className="text-cyan-400" size={18} />
                  <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest">Digital Vending Machine</h2>
                </div>
                <div className="bg-slate-700 px-2 sm:px-3 py-1 rounded-full text-[10px] font-mono text-slate-300">
                  0x8f3...a1b
                </div>
              </div>

              {/* Code Diagnostic Screen */}
              <div className="p-3 sm:p-4 bg-slate-900 flex-1 relative font-mono text-[11px] sm:text-xs md:text-sm leading-relaxed overflow-y-auto">
                
                {/* Header & Toggle */}
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">Contract Logic</div>
                  
                  <div className="flex bg-slate-800 rounded p-0.5">
                    <button 
                      onClick={() => setViewMode("code")}
                      className={`px-3 py-1 rounded text-[10px] font-sans font-bold transition-all ${viewMode === "code" ? "bg-slate-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      CODE
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode("english");
                        setHasReadEnglish(true);
                      }}
                      className={`px-3 py-1 rounded text-[10px] font-sans font-bold transition-all ${viewMode === "english" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      ENGLISH
                    </button>
                  </div>
                </div>

                {/* Code Lines */}
                {currentLines.map((line, i) => (
                  <div 
                    key={i} 
                    className={`px-2 py-1 rounded transition-all duration-300 mb-1 ${
                      activeLine === i && txState === "reverted" && i === 1 ? "bg-rose-500/20 text-rose-300 border-l-4 border-rose-500 shadow-[inset_0_0_15px_rgba(244,63,94,0.2)]" :
                      activeLine === i && txState !== "reverted" ? "bg-emerald-500/20 text-emerald-300 border-l-4 border-emerald-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]" :
                      viewMode === "english" ? "text-sky-100 border-l-4 border-transparent font-sans" :
                      "text-slate-300 border-l-4 border-transparent"
                    }`}
                    style={{ whiteSpace: 'pre' }}
                  >
                    {line}
                  </div>
                ))}
                
                {/* Overlay for TX Reverted */}
                <AnimatePresence>
                  {txState === "reverted" && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm flex flex-col items-center justify-center border-t border-rose-500/30 z-10"
                    >
                      <XOctagon className="text-rose-500 mb-2 sm:mb-3" size={36} />
                      <span className="text-base sm:text-lg font-bold text-rose-100 tracking-wider">TX REVERTED</span>
                      <span className="text-[10px] sm:text-xs font-medium text-rose-300 mt-1">Conditions not met</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dispenser Area */}
              <div className="bg-slate-100 p-3 sm:p-4 flex flex-col items-center justify-center border-t-2 border-slate-200 h-24 sm:h-28 relative overflow-hidden shrink-0">
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Output Dispenser</div>
                
                <div className="relative flex justify-center w-full">
                  {/* Dispenser Slot */}
                  <div className="w-20 sm:w-28 h-3 sm:h-4 bg-slate-300 rounded-full shadow-inner relative z-10"></div>
                  
                  {/* NFT Asset inside machine */}
                  <AnimatePresence>
                    {!hasNFT && (
                      <motion.div
                        exit={{ y: 80, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.8, ease: "backIn" }}
                        className="absolute left-1/2 -translate-x-1/2 -top-10 sm:-top-12 text-indigo-400 opacity-50 blur-[2px]"
                      >
                        <Diamond size={28} fill="currentColor" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Animated Coin */}
                  <AnimatePresence>
                    {coinPos === "contract" && (
                      <motion.div
                        initial={{ y: -100, x: -100, opacity: 0, scale: 2 }}
                        animate={{ y: -12, x: -14, opacity: 1, scale: 1 }}
                        exit={{ 
                          y: txState === "reverted" ? -150 : 30, 
                          x: txState === "reverted" ? -150 : -14,
                          opacity: 0,
                          rotate: txState === "reverted" ? -180 : 0
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute left-1/2 -translate-x-1/2 -top-2 z-20 text-amber-500 drop-shadow-md"
                      >
                        <Coins size={28} fill="currentColor" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Celebration */}
      <AnimatePresence>
        {phase === 4 && (
          <Celebration
            isActive={phase === 4}
            message="Smart Contract Executed! Because you matched the strict rules of the code, the transaction succeeded and the digital asset was dispensed. No middleman required!"
            onReplay={resetLab}
          />
        )}
      </AnimatePresence>
    </LabShell>
  );
}
