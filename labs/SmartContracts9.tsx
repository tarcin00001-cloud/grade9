"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Bitcoin, Code, ArrowDownCircle , Timer} from "lucide-react";

// ─── SVG Smart Contract Visualizer ────────────────────────────────────────────

function SmartContractSVG({
  coinValue,
  machineState
}: {
  coinValue: number;
  machineState: "IDLE" | "EVALUATING" | "REJECTED" | "DISPENSING";
}) {
  const isDispensing = machineState === "DISPENSING";
  const isEvaluating = machineState === "EVALUATING";

  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-eth">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-code">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridSc" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridSc)" />

      {/* ── 1. The Smart Contract "Vending Machine" (Center) ── */}
      <g transform="translate(300, 50)">
        <rect x="0" y="0" width="300" height="400" fill="#0f172a" rx="16" stroke="#ec4899" strokeWidth="4" />
        <rect x="20" y="20" width="260" height="60" fill="#1e1b4b" rx="8" />
        <text x="150" y="55" fill="#a5b4fc" fontSize="24" fontWeight="black" textAnchor="middle">SMART CONTRACT</text>

        {/* Code Block (The "Law") */}
        <rect x="20" y="100" width="260" height="120" fill="#020617" rx="8" stroke="#312e81" strokeWidth="2" />
        <text x="30" y="130" fill="#fbbf24" fontSize="14" fontFamily="monospace" fontWeight="bold">function buyNFT() payable {"{"}</text>
        
        {/* Physical Evaluation Glow */}
        <rect x="30" y="145" width="240" height="25" fill={isEvaluating ? "#312e81" : "transparent"} rx="4" />
        <text x="50" y="162" fill={isEvaluating ? "#fff" : "#cbd5e1"} fontSize="14" fontFamily="monospace" filter={isEvaluating ? "url(#glow-code)" : "none"} style={{ transition: "all 0.3s" }}>
          require(msg.value == 2 ETH);
        </text>
        
        <text x="50" y="190" fill="#cbd5e1" fontSize="14" fontFamily="monospace">dispenseAsset(msg.sender);</text>
        <text x="30" y="210" fill="#fbbf24" fontSize="14" fontFamily="monospace" fontWeight="bold">{"}"}</text>

        {/* Coin Slot */}
        <rect x="125" y="250" width="50" height="10" fill="#000" rx="4" stroke="#475569" strokeWidth="2" />
        <text x="150" y="240" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">INSERT ETH</text>

        {/* Dispenser Tray */}
        <path d="M 100,320 L 200,320 L 220,380 L 80,380 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        
        {/* Gears (Turn when dispensing) */}
        <g transform="translate(150, 290)">
          <path d="M -15,-15 L 15,-15 L 15,15 L -15,15 Z" fill="none" stroke="#ec4899" strokeWidth="4" strokeDasharray="4 4" className={isDispensing ? "animate-[spin_1s_linear_infinite]" : ""} />
        </g>
      </g>

      {/* ── 2. The Interactive Coin ── */}
      <AnimatePresence>
        {coinValue > 0 && machineState !== "IDLE" && (
          <motion.g
            initial={{ x: 450, y: -50, scale: 0 }}
            animate={
              machineState === "EVALUATING" ? { x: 450, y: 255, scale: 1 } : // Drops into slot
              machineState === "REJECTED" ? { x: 450, y: 450, scale: 1 } : // Spits out bottom
              { x: 450, y: 255, scale: 0, opacity: 0 } // Consumed by contract
            }
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            exit={{ opacity: 0 }}
          >
            <circle cx="0" cy="0" r="20" fill="#f472b6" stroke="#93c5fd" strokeWidth="3" filter="url(#glow-eth)" />
            <text x="0" y="5" fill="#fff" fontSize="14" fontWeight="black" textAnchor="middle">{coinValue} E</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* ── 3. The Digital Asset (NFT) Dispensing ── */}
      <AnimatePresence>
        {isDispensing && (
          <motion.g
            initial={{ x: 450, y: 300, scale: 0, opacity: 0 }}
            animate={{ x: 450, y: 350, scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, type: "spring" }}
          >
            <rect x="-30" y="-30" width="60" height="60" fill="#f59e0b" rx="8" stroke="#fef3c7" strokeWidth="3" filter="url(#glow-eth)" />
            <text x="0" y="5" fill="#fff" fontSize="12" fontWeight="black" textAnchor="middle">NFT</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Rejection Notification */}
      {machineState === "REJECTED" && (
        <text x="450" y="290" fill="#f87171" fontSize="16" fontWeight="black" textAnchor="middle" className="animate-bounce">TRANSACTION REVERTED</text>
      )}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const TIMER_DURATION_SECONDS = 5 * 60;

export default function SmartContracts9() {
  const { reportComplete: _reportComplete } = useLMSBridge("smartcontracts9");

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLabComplete, setIsLabComplete] = useState(false);

  const reportComplete = useCallback((args?: any) => {
    setIsLabComplete(true);
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

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
      _reportComplete({ points: 0 });
    }
  }, [timedOut, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const { playPop, playZap, playError, playSuccess, playDrop } = useLabAudio();

  const [machineState, setMachineState] = useState<"IDLE" | "EVALUATING" | "REJECTED" | "DISPENSING">("IDLE");
  const [coinValue, setCoinValue] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  const insertCoin = (val: number) => {
    if (machineState !== "IDLE") return;
    setCoinValue(val);
    setMachineState("EVALUATING");
    playPop();

    setTimeout(() => {
      if (val === 2) {
        // Contract logic passes
        playZap();
        setMachineState("DISPENSING");
        setTimeout(() => {
          playSuccess();
          if (!hasWon) {
            setHasWon(true);
            setTimeout(reportComplete, 1500);
          }
        }, 1500);
      } else {
        // Contract logic fails (revert)
        playError();
        setMachineState("REJECTED");
        setTimeout(() => setMachineState("IDLE"), 2000);
      }
    }, 1200);
  };

  const reset = () => {
    setMachineState("IDLE");
    setHasWon(false);
    setCoinValue(0);
  };

  return (
    <LabShell
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
      } labId="smartcontracts9" theme="studio" title="Smart Contracts Mechanics" subtitle="L29 · Blockchain Technology"
      instruction="A Smart Contract is just code that holds money like a physical vending machine. Try sending 1 ETH. Notice how the code evaluates and physically 'reverts' the transaction. Then send 2 ETH to fulfill the condition." compact>
      
      <Celebration isActive={hasWon} message="Code is Law! The Smart Contract autonomously verified the condition (2 ETH) without any human broker, consumed the funds securely, and dispensed the digital asset trustlessly." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-pink-900/50 p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <Code className="text-pink-500" size={24} />
            <div>
              <p className="text-pink-400 font-black text-sm uppercase tracking-wider">Execute Transaction</p>
              <p className="text-white/50 text-xs">Call the buyNFT() function with ETH attached.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => insertCoin(1)} 
              disabled={machineState !== "IDLE"}
              className="px-6 py-3 rounded-xl font-black bg-stone-800 border-2 border-stone-600 text-stone-300 hover:bg-stone-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowDownCircle size={18}/> Send 1 ETH
            </button>
            <button 
              onClick={() => insertCoin(2)} 
              disabled={machineState !== "IDLE"}
              className="px-6 py-3 rounded-xl font-black bg-pink-500/20 border-2 border-pink-500/50 text-pink-400 hover:bg-pink-500/30 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowDownCircle size={18}/> Send 2 ETH
            </button>
          </div>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-pink-900/40 bg-[#0c0a09] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <SmartContractSVG coinValue={coinValue} machineState={machineState} />
          </div>
        </div>

      </div>
    
      {timedOut && !isLabComplete && (
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
