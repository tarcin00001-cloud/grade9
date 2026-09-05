"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Search, ArrowDownWideNarrow, XCircle, CheckCircle2, Navigation, FastForward, Trophy } from "lucide-react";

// Generate distinct sorted arrays for levels
const LEVEL1_UNSORTED = [73, 15, 119, 9, 4, 137, 82, 50, 94, 150, 42, 61, 31, 108, 23, 125];
const LEVEL1_SORTED = [...LEVEL1_UNSORTED].sort((a, b) => a - b);
const generateSortedArray = (size: number) => {
  const arr = new Set<number>();
  while (arr.size < size) arr.add(Math.floor(Math.random() * 900) + 10);
  return Array.from(arr).sort((a, b) => a - b);
};
const LEVEL2_SORTED = generateSortedArray(32);
const LEVEL3_SORTED = generateSortedArray(64);

type Phase = "idle" | "pick_mid" | "evaluate" | "failed" | "success";
type Level = 1 | 2 | 3;

export default function BinarySearch12() {
  const { playPop, playSuccess, playError, playZap, playChime } = useLabAudio();
  const { reportComplete } = useLMSBridge("binarysearch12");

  const [level, setLevel] = useState<Level>(1);
  const [target, setTarget] = useState(42);
  const [isOrdered, setIsOrdered] = useState(false); // Only applies to Level 1
  
  const [phase, setPhase] = useState<Phase>("idle");
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(15);
  const [midIndex, setMidIndex] = useState<number | null>(null);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState("Step 1: The target is 42. Start the manual search process.");
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const getActiveList = () => {
    if (level === 1) return isOrdered ? LEVEL1_SORTED : LEVEL1_UNSORTED;
    if (level === 2) return LEVEL2_SORTED;
    return LEVEL3_SORTED;
  };
  const activeList = getActiveList();

  const handleReset = () => {
    setIsOrdered(false);
    setLevel(1);
    setTarget(42);
    setPhase("idle");
    setLow(0);
    setHigh(15);
    setMidIndex(null);
    setHasFailedOnce(false);
    setIsComplete(false);
    setMoves(0);
    setFeedback("Step 1: The target is 42. Start the manual search process.");
    setShakeIndex(null);
    playPop();
  };

  const advanceLevel = () => {
    const nextLevel = level === 1 ? 2 : 3;
    const list = nextLevel === 2 ? LEVEL2_SORTED : LEVEL3_SORTED;
    const newTarget = list[Math.floor(Math.random() * list.length)];
    
    setLevel(nextLevel as Level);
    setTarget(newTarget);
    setPhase("idle");
    setLow(0);
    setHigh(list.length - 1);
    setMidIndex(null);
    setMoves(0);
    setFeedback(`Level ${nextLevel}! Target is ${newTarget}. Let's see how few moves it takes.`);
    playZap();
  };

  const handleSort = () => {
    setIsOrdered(true);
    setPhase("idle");
    setLow(0);
    setHigh(15);
    setMidIndex(null);
    setMoves(0);
    setFeedback("List is sorted! Now try the Binary Search logic again.");
    playZap();
  };

  const startSearch = () => {
    setPhase("pick_mid");
    setLow(0);
    setHigh(activeList.length - 1);
    setMidIndex(null);
    setMoves(0);
    setFeedback("Always check the middle of your remaining search space. Click the glowing middle element.");
    playPop();
  };

  const handleElementClick = (idx: number) => {
    if (phase !== "pick_mid") return;
    
    const expectedMid1 = Math.floor((low + high) / 2);
    const expectedMid2 = Math.ceil((low + high) / 2);
    
    if (idx !== expectedMid1 && idx !== expectedMid2) {
      playError();
      setShakeIndex(idx);
      setTimeout(() => setShakeIndex(null), 400);
      setFeedback(`Oops! Try clicking the exact middle card of the active items!`);
      return;
    }

    playPop();
    setMidIndex(idx);
    setMoves(m => m + 1);
    const midValue = activeList[idx];

    if (midValue === target) {
      setPhase("success");
      setFeedback(`Target Found! ${target} was at index ${idx}. Found in ${moves + 1} moves!`);
      playSuccess();
      
      if (level === 3) {
        setTimeout(() => {
          setIsComplete(true);
          reportComplete();
          playChime();
        }, 1500);
      }
    } else {
      setPhase("evaluate");
      setFeedback(`Middle is ${midValue}. Target is ${target}. Which half should we discard?`);
    }
  };

  const handleEvaluate = (direction: "smaller" | "larger") => {
    if (phase !== "evaluate" || midIndex === null) return;
    
    playPop();
    let newLow = low;
    let newHigh = high;

    if (direction === "smaller") {
      newHigh = midIndex - 1;
      setFeedback(`${target} is smaller. Discarding right half... Now pick the new middle element.`);
    } else {
      newLow = midIndex + 1;
      setFeedback(`${target} is larger. Discarding left half... Now pick the new middle element.`);
    }

    if (newLow > newHigh) {
      setPhase("failed");
      setHasFailedOnce(true);
      setMidIndex(null);
      setFeedback(`${target} NOT FOUND! Search space collapsed. We discarded the correct half because the data was scrambled!`);
      playError();
      return;
    }

    setLow(newLow);
    setHigh(newHigh);
    setPhase("pick_mid");
    setMidIndex(null);
  };

  return (
    <LabShell
      labId="binarysearch12"
      title="Advanced Searching Methods"
      hint="Binary search needs ordered data. In pick_mid, find the center of the active white cards."
      bgOverride="bg-slate-50"
      compact={true}
      instruction={`Level ${level} of 3: ${level === 1 ? "See why sorted data is a strict requirement!" : `Crush ${activeList.length} items in minimal moves.`}`}
      onReset={handleReset}
    >
      <Celebration
        isActive={isComplete}
        message={`Algorithm Mastered! You just searched 64 items in mere clicks. Binary search is incredibly fast (O(log n)), but it fundamentally relies on the list being ordered first!`}
        onReplay={handleReset}
      />

      <div className="flex-1 min-h-0 w-full flex flex-col px-4 py-3 gap-3 relative z-10 select-none">
        
        {/* Status & Feedback Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center min-h-[90px]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              phase === "failed" ? "bg-red-100 text-red-600" :
              phase === "success" ? "bg-emerald-100 text-emerald-600" :
              phase === "pick_mid" || phase === "evaluate" ? "bg-indigo-100 text-indigo-600" :
              "bg-slate-100 text-slate-600"
            }`}>
              {phase === "failed" ? <XCircle size={24} /> :
               phase === "success" ? <CheckCircle2 size={24} /> :
               phase === "pick_mid" ? <Navigation size={24} /> :
               <Search size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-800">Binary Search Protocol</h2>
                {(phase === "pick_mid" || phase === "evaluate" || phase === "success") && (
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                    Moves: {moves}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 font-medium ${
                phase === "failed" ? "text-red-600" : 
                phase === "success" ? "text-emerald-600" : 
                "text-slate-600"
              }`}>
                {feedback}
              </p>
            </div>
          </div>
        </div>

        {/* List Visualization */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center items-center relative overflow-hidden">
          <div className={`grid gap-1.5 sm:gap-2 w-full max-w-4xl ${level === 3 ? "grid-cols-8" : "grid-cols-4 sm:grid-cols-8"}`}>
            <AnimatePresence>
              {activeList.map((val, idx) => {
                const isEliminated = (phase === "pick_mid" || phase === "evaluate" || phase === "failed" || phase === "success") && (idx < low || idx > high);
                const isMid = (phase === "evaluate" || phase === "success") && idx === midIndex;
                const isClickableMid = phase === "pick_mid" && !isEliminated;
                const expectedMid1 = Math.floor((low + high) / 2);
                const expectedMid2 = Math.ceil((low + high) / 2);
                const isExpectedMid = phase === "pick_mid" && (idx === expectedMid1 || idx === expectedMid2);
                
                // Adjust size for Level 3
                const cardHeight = level === 3 ? "h-8 sm:h-10" : "h-14";
                const textSize = level === 3 ? "text-xs sm:text-sm" : "text-lg";

                return (
                  <motion.div
                    key={`${level}-${isOrdered ? "s" : "u"}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      x: shakeIndex === idx ? [0, -10, 10, -10, 10, 0] : 0
                    }}
                    transition={{ x: { duration: 0.4 } }}
                    onClick={() => isClickableMid && handleElementClick(idx)}
                    className={`${cardHeight} rounded-xl flex items-center justify-center transition-all duration-300 relative ${
                      isEliminated
                        ? "bg-slate-50/50 border-2 border-slate-100 text-slate-300 opacity-20 pointer-events-none scale-95"
                        : isMid
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-0 text-white shadow-[0_8px_20px_rgba(99,102,241,0.5)] z-20 scale-110"
                        : isExpectedMid
                        ? "bg-white border-2 border-cyan-400 text-cyan-700 shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer z-10 hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(34,211,238,0.5)] ring-2 ring-cyan-100 ring-offset-2"
                        : isClickableMid
                        ? "bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-[0_10px_20px_rgba(99,102,241,0.15)] cursor-pointer hover:-translate-y-1 shadow-[0_4px_10px_rgba(0,0,0,0.04)]"
                        : "bg-slate-50 border-2 border-slate-200 text-slate-400 shadow-sm"
                    }`}
                  >
                    <span className={`${textSize} font-black`}>
                      {val}
                    </span>
                    {isMid && level !== 3 && (
                      <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                        MID
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Controls Tray */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 max-w-sm hidden sm:block">
            Target: <strong className="text-slate-800">{target}</strong>. {phase === "idle" ? "Ready." : "Follow algorithmic rules strictly."}
          </p>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {phase === "idle" && (
              <button
                onClick={startSearch}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Search size={16} /> {level === 1 ? "Begin Manual Search" : `Start Level ${level}`}
              </button>
            )}

            {phase === "evaluate" && (
              <>
                <button
                  onClick={() => handleEvaluate("smaller")}
                  className="flex-1 sm:flex-none px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Target ({target}) &lt; Mid
                </button>
                <button
                  onClick={() => handleEvaluate("larger")}
                  className="flex-1 sm:flex-none px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Target ({target}) &gt; Mid
                </button>
              </>
            )}

            {level === 1 && !isOrdered && hasFailedOnce && (phase === "failed" || phase === "idle") && (
              <button
                onClick={handleSort}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer animate-pulse"
              >
                <ArrowDownWideNarrow size={16} /> Sort List First
              </button>
            )}

            {phase === "success" && level < 3 && (
              <button
                onClick={advanceLevel}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer animate-pulse"
              >
                <FastForward size={16} /> Next Level
              </button>
            )}
          </div>
        </div>

      </div>
    </LabShell>
  );
}
