"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Search, ArrowDownWideNarrow, XCircle, CheckCircle2, RefreshCw } from "lucide-react";

const TARGET_VALUE = 42;
const UNSORTED_ARRAY = [73, 15, 119, 9, 4, 137, 82, 50, 94, 150, 42, 61, 31, 108, 23, 125];
const SORTED_ARRAY = [...UNSORTED_ARRAY].sort((a, b) => a - b);

type SearchPhase = "idle" | "searching" | "failed" | "success";

export default function BinarySearch12() {
  const { playPop, playSuccess, playError, playZap, playChime } = useLabAudio();
  const { reportComplete } = useLMSBridge();

  const [isOrdered, setIsOrdered] = useState(false);
  const [phase, setPhase] = useState<SearchPhase>("idle");
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(15);
  const [mid, setMid] = useState<number | null>(null);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState("Run Binary Search to find the number 42.");
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeList = isOrdered ? SORTED_ARRAY : UNSORTED_ARRAY;

  const handleReset = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setIsOrdered(false);
    setPhase("idle");
    setLow(0);
    setHigh(15);
    setMid(null);
    setHasFailedOnce(false);
    setIsComplete(false);
    setFeedback("Run Binary Search to find the number 42.");
    playPop();
  };

  const handleSort = () => {
    setIsOrdered(true);
    setPhase("idle");
    setLow(0);
    setHigh(15);
    setMid(null);
    setFeedback("List is now ordered! Binary Search can correctly rely on greater/less than directions.");
    playZap();
  };

  const runSearch = () => {
    if (phase === "searching") return;
    
    setPhase("searching");
    setLow(0);
    setHigh(15);
    setMid(null);
    setFeedback("Starting Binary Search...");
    playPop();

    let currentLow = 0;
    let currentHigh = 15;

    const stepSearch = () => {
      if (currentLow > currentHigh) {
        setPhase("failed");
        setHasFailedOnce(true);
        setMid(null);
        setFeedback(`42 NOT FOUND! Wait... 42 is visibly in the list. Binary Search went the wrong way because the data is scrambled.`);
        playError();
        return;
      }

      const currentMid = Math.floor((currentLow + currentHigh) / 2);
      setMid(currentMid);
      setLow(currentLow);
      setHigh(currentHigh);
      
      const midValue = activeList[currentMid];
      
      if (midValue === TARGET_VALUE) {
        setPhase("success");
        setFeedback(`TARGET FOUND! Found ${TARGET_VALUE} at index ${currentMid}.`);
        playSuccess();
        
        // 4.5s delay before reportComplete
        setTimeout(() => {
          setIsComplete(true);
          reportComplete();
          playChime();
        }, 4500);
        return;
      }

      playPop();
      if (midValue < TARGET_VALUE) {
        setFeedback(`Value ${midValue} < ${TARGET_VALUE}. Searching right half...`);
        currentLow = currentMid + 1;
      } else {
        setFeedback(`Value ${midValue} > ${TARGET_VALUE}. Searching left half...`);
        currentHigh = currentMid - 1;
      }
      
      searchTimeoutRef.current = setTimeout(stepSearch, 1200);
    };

    searchTimeoutRef.current = setTimeout(stepSearch, 800);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  return (
    <LabShell
      labId="binarysearch12"
      title="Advanced Searching Methods"
      subtitle="Understand the critical prerequisite of Binary Search."
      hint="Binary search needs ordered data. If it's failing, try sorting the list first."
      bgOverride="bg-cyan-50"
      compact={true}
      instruction="1. Run Binary Search to find 42. 2. Understand why it fails safely. 3. Sort the list. 4. Run it again to succeed."
      onReset={handleReset}
    >
      <Celebration
        isActive={isComplete}
        message="Algorithm Mastered! Binary search is incredibly fast (O(log n)), but it fundamentally relies on the list being ordered first!"
        onReplay={handleReset}
      />

      <div className="flex-1 min-h-0 w-full flex flex-col px-4 py-3 gap-3 relative z-10 select-none">
        
        {/* Status & Feedback Panel */}
        <div className="bg-white rounded-2xl border border-cyan-200 shadow-sm p-4 flex flex-col justify-center min-h-[90px]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              phase === "failed" ? "bg-red-100 text-red-600" :
              phase === "success" ? "bg-emerald-100 text-emerald-600" :
              "bg-cyan-100 text-cyan-600"
            }`}>
              {phase === "failed" ? <XCircle size={24} /> :
               phase === "success" ? <CheckCircle2 size={24} /> :
               <Search size={24} />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Binary Search Execution</h2>
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
        <div className="flex-1 bg-white rounded-2xl border border-cyan-200 shadow-sm p-4 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full max-w-2xl">
            <AnimatePresence>
              {activeList.map((val, idx) => {
                const isEliminated = phase === "searching" && mid !== null && (idx < low || idx > high);
                const isMid = phase === "searching" && idx === mid;
                const isTargetFound = phase === "success" && val === TARGET_VALUE;
                const isTargetFailed = phase === "failed" && val === TARGET_VALUE;

                return (
                  <motion.div
                    key={`${isOrdered ? "s" : "u"}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-300 relative ${
                      isTargetFound
                        ? "bg-emerald-500 border-emerald-600 text-white shadow-lg ring-4 ring-emerald-200 z-10"
                        : isEliminated
                        ? "bg-slate-100 border-slate-200 text-slate-400 opacity-40 grayscale"
                        : isMid
                        ? "bg-cyan-100 border-cyan-500 text-cyan-900 shadow-md ring-2 ring-cyan-300 z-10 scale-105"
                        : isTargetFailed
                        ? "bg-red-50 border-red-300 text-red-500 animate-pulse"
                        : "bg-slate-50 border-slate-300 text-slate-700"
                    }`}
                  >
                    <span className={`text-lg font-black ${isTargetFound ? "text-white" : ""}`}>
                      {val}
                    </span>
                    {isMid && (
                      <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                        MID
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-cyan-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 max-w-sm">
            Target: <strong className="text-slate-800">42</strong>. Watch how the search space halves.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isOrdered && hasFailedOnce && (
              <button
                onClick={handleSort}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowDownWideNarrow size={16} /> Sort List
              </button>
            )}
            <button
              onClick={runSearch}
              disabled={phase === "searching" || phase === "success"}
              className={`flex-1 sm:flex-none px-4 py-2.5 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                phase === "searching" || phase === "success"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700 text-white"
              }`}
            >
              <Search size={16} /> {phase === "searching" ? "Searching..." : "Run Binary Search"}
            </button>
          </div>
        </div>

      </div>
    </LabShell>
  );
}
