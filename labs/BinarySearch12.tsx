"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Server, Zap, Crosshair, ChevronRight, ChevronLeft, ShieldAlert } from "lucide-react";

const LEVELS = [
  { level: 1, count: 15, label: "Server Rack Alpha (15)" },
  { level: 2, count: 31, label: "Server Rack Beta (31)" },
  { level: 3, count: 63, label: "Data Center Omega (63)" }
];

export default function BinarySearch12() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [labFinished, setLabFinished] = useState(false);

  // Game State
  const [array, setarray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  
  // Interaction State
  const [scannedIndex, setScannedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [laserAnim, setLaserAnim] = useState<{ start: number, end: number } | null>(null);

  const initLevel = (levelIdx: number) => {
    const count = LEVELS[levelIdx].count;
    // Generate Ordered unique numbers
    const newArr: number[] = [];
    let current = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < count; i++) {
      newArr.push(current);
      current += Math.floor(Math.random() * 5) + 1;
    }
    
    // Pick random target
    const targetIdx = Math.floor(Math.random() * count);
    
    setarray(newArr);
    setTarget(newArr[targetIdx]);
    setLeft(0);
    setRight(count - 1);
    setScannedIndex(null);
    setErrorMsg("");
    setLaserAnim(null);
  };

  // Initialize first level
  useEffect(() => {
    initLevel(0);
  }, []);

  const currentMid = Math.floor((left + right) / 2);
  const activeCount = right - left + 1;

  const handleBoxClick = (index: number) => {
    if (scannedIndex !== null) return; // Wait for user to decide higher/lower
    
    if (index !== currentMid) {
      if (playError) playError();
      setErrorMsg(`Binary search strictly starts at the exact middle! (Index ${currentMid})`);
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (playPop) playPop();
    setErrorMsg("");
    setScannedIndex(index);
    
    // Auto-win if it's the target
    if (array[index] === target) {
      handleWinLevel();
    }
  };

  const handleWinLevel = () => {
    if (playSuccess) playSuccess();
    
    setTimeout(() => {
      if (currentLevelIndex < LEVELS.length - 1) {
        setCurrentLevelIndex(prev => prev + 1);
        initLevel(currentLevelIndex + 1);
      } else {
        setLabFinished(true);
      }
    }, 1500);
  };

  const handleLogicDecision = (isHigher: boolean) => {
    if (scannedIndex === null) return;
    const scannedVal = array[scannedIndex];
    
    const correctIsHigher = target > scannedVal;
    
    if (isHigher !== correctIsHigher) {
      if (playError) playError();
      setErrorMsg(`Incorrect logic! ${target} is ${correctIsHigher ? "HIGHER" : "LOWER"} than ${scannedVal}.`);
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    // Logic is correct! FIRE THE LASER!
    if (playZap) playZap();
    
    if (correctIsHigher) {
      // Target is higher, destroy left half (from 'left' to 'scannedIndex')
      setLaserAnim({ start: left, end: scannedIndex });
      setTimeout(() => {
        setLeft(scannedIndex + 1);
        setScannedIndex(null);
        setLaserAnim(null);
      }, 600);
    } else {
      // Target is lower, destroy right half (from 'scannedIndex' to 'right')
      setLaserAnim({ start: scannedIndex, end: right });
      setTimeout(() => {
        setRight(scannedIndex - 1);
        setScannedIndex(null);
        setLaserAnim(null);
      }, 600);
    }
  };

  const resetLab = () => {
    setCurrentLevelIndex(0);
    setLabFinished(false);
    initLevel(0);
    if (playPop) playPop();
  };

  return (
    <LabShell
      labId="binarysearch12"
      title="Advanced Searching Methods"
      subtitle="Logarithmic Data Center"
      theme="forge"
      compact={true}
      instruction="1. Review the theory behind Binary Search and logarithmic time complexity. 2. Interact with the visual Array to perform a step-by-step binary search. 3. Compare the number of steps taken with a standard linear search. 4. Complete the searching challenges with different Array sizes."
      onReset={resetLab}
    >
      <Celebration isActive={labFinished} onReplay={resetLab} />

      <div className="flex flex-col h-full w-full max-w-6xl mx-auto gap-4 p-4">
        
        {/* Top Info Bar */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border-2 border-slate-800/20 shadow-none">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-500/50">
              <Crosshair size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-slate-700 font-bold uppercase tracking-widest">Active Target</div>
              <div className="text-2xl font-black text-slate-900">{target}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[0, 1, 2].map((lvl) => (
              <div key={lvl} className={`h-2 w-12 rounded-full transition-all ${
                lvl < currentLevelIndex ? 'bg-orange-500' :
                lvl === currentLevelIndex ? 'bg-orange-400 animate-pulse' : 'bg-slate-700'
              }`} />
            ))}
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-700 font-bold uppercase tracking-widest">Active Servers</div>
            <div className="text-2xl font-black text-sky-700">{activeCount} <span className="text-sm text-slate-600">/ {array.length}</span></div>
          </div>
        </div>

        {/* The Data Center Sandbox */}
        <div className="flex-1 bg-white rounded-xl border-2 border-slate-800/20 shadow-none flex flex-col relative overflow-hidden">
          
          {/* Environment Styling */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />

          {/* Level Header */}
          <div className="relative z-10 w-full text-center p-4">
            <h2 className="text-lg font-black text-slate-900 tracking-widest uppercase flex justify-center items-center gap-2">
              <Server className="text-slate-700" /> {LEVELS[currentLevelIndex].label}
            </h2>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500 text-red-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                <ShieldAlert size={18} /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logic Popup (Higher / Lower) */}
          <AnimatePresence>
            {scannedIndex !== null && array[scannedIndex] !== target && !laserAnim && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-100/95 backdrop-blur border-2 border-sky-400 p-4 rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.3)] flex flex-col items-center gap-3"
              >
                <div className="text-sm font-bold text-slate-700">
                  Target is <span className="text-orange-600 text-lg">{target}</span>. Scanned is <span className="text-sky-600 text-lg">{array[scannedIndex]}</span>.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLogicDecision(false)}
                    className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg font-bold transition-all border border-slate-400"
                  >
                    <ChevronLeft size={16} /> Target is Lower
                  </button>
                  <button
                    onClick={() => handleLogicDecision(true)}
                    className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg font-bold transition-all border border-slate-400"
                  >
                    Target is Higher <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Servers Row */}
          <div className="flex-1 w-full flex items-center justify-center p-4 relative z-10">
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 max-w-[90%]">
              {array.map((val, idx) => {
                const isEliminated = idx < left || idx > right;
                const isMid = idx === currentMid && !isEliminated;
                const isActive = !isEliminated;
                const isScanned = idx === scannedIndex;
                const isLaserTarget = laserAnim && idx >= laserAnim.start && idx <= laserAnim.end;
                
                return (
                  <button
                    key={idx}
                    disabled={isEliminated || labFinished || scannedIndex !== null || laserAnim !== null}
                    onClick={() => handleBoxClick(idx)}
                    className={`relative flex items-center justify-center font-black transition-all duration-300 rounded-md
                      ${array.length === 63 ? 'w-8 h-10 text-[10px]' : array.length === 31 ? 'w-10 h-12 text-xs' : 'w-14 h-16 text-sm'}
                      ${isEliminated 
                        ? 'bg-slate-200/50 border border-slate-300 text-slate-400 scale-95 opacity-50' 
                        : isMid && !isScanned
                          ? 'bg-sky-500/20 border-2 border-sky-400 text-sky-700 shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:bg-sky-500/40 animate-pulse'
                          : isScanned
                            ? array[idx] === target 
                              ? 'bg-emerald-500 text-slate-900 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                              : 'bg-orange-500 text-slate-900 border-2 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.8)]'
                            : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                      }
                    `}
                  >
                    {/* Laser Blast Overlay */}
                    {isLaserTarget && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: [1, 1, 0], scale: [1, 1.2, 0.9], backgroundColor: ["#ef4444", "#991b1b", "#000"] }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 z-20 rounded-md flex items-center justify-center"
                      >
                        <Zap size={16} className="text-white" />
                      </motion.div>
                    )}
                    
                    {/* Only show value if scanned or eliminated (to show they were Ordered) or if it's the target won */}
                    {isScanned || isEliminated || (labFinished && array[idx] === target) ? val : '?'}
                    
                    {/* Middle Indicator */}
                    {isMid && !isScanned && !laserAnim && (
                      <div className="absolute -top-6 text-[10px] text-sky-400 whitespace-nowrap bg-sky-950 px-2 py-0.5 rounded border border-sky-800 font-bold">
                        mid
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </LabShell>
  );
}
