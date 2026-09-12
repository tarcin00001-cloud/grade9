"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Search, Server, Cpu, Activity, ArrowRight, Zap, Play, Database, Info } from "lucide-react";

type Phase = "STEP1_LEARN" | "STEP2_TRY" | "STEP3_FAIL" | "STEP4_UNDERSTAND" | "STEP5_IMPROVE" | "STEP6_COMPLETE" | "OUTCOME";

const DATA = [10, 15, 22, 28, 35, 42, 50, 55, 61, 68, 75, 82, 87, 91, 95];
const INITIAL_TARGET = 87;

const TREE_LAYOUT = [
  { id: 0, val: 10, left: 6.25, top: 90 },
  { id: 1, val: 15, left: 12.5, top: 60 },
  { id: 2, val: 22, left: 18.75, top: 90 },
  { id: 3, val: 28, left: 25, top: 30 },
  { id: 4, val: 35, left: 31.25, top: 90 },
  { id: 5, val: 42, left: 37.5, top: 60 },
  { id: 6, val: 50, left: 43.75, top: 90 },
  { id: 7, val: 55, left: 50, top: 0 },
  { id: 8, val: 61, left: 56.25, top: 90 },
  { id: 9, val: 68, left: 62.5, top: 60 },
  { id: 10, val: 75, left: 68.75, top: 90 },
  { id: 11, val: 82, left: 75, top: 30 },
  { id: 12, val: 87, left: 81.25, top: 90 },
  { id: 13, val: 91, left: 87.5, top: 60 },
  { id: 14, val: 95, left: 93.75, top: 90 },
];

const EDGES = [
  [7, 3], [7, 11], [3, 1], [3, 5], [11, 9], [11, 13],
  [1, 0], [1, 2], [5, 4], [5, 6], [9, 8], [9, 10], [13, 12], [13, 14]
];

export default function DatabaseIndexing9() {
  const { reportComplete: _reportComplete } = useLMSBridge("databaseindexing9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("STEP1_LEARN");
  const [isIndexed, setIsIndexed] = useState(false);
  const [scanPath, setScanPath] = useState<number[]>([]);
    const [isScanning, setIsScanning] = useState(false);
  const [customQuery, setCustomQuery] = useState<string>("87");
  const [targetVal, setTargetVal] = useState(INITIAL_TARGET);
  const [notFound, setNotFound] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const reportComplete = useCallback(() => {
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  // Compute search path for a given target in Tree Mode
  const computeTreeSearchPath = (target: number) => {
    let current = 7; // Root index (value 55)
    const path: number[] = [];
    while (current >= 0 && current < DATA.length) {
      path.push(current);
      if (DATA[current] === target) break;
      if (target < DATA[current]) {
        // Find left child
        const edge = EDGES.find(e => e[0] === current && e[1] < current);
        if (!edge) break;
        current = edge[1];
      } else {
        // Find right child
        const edge = EDGES.find(e => e[0] === current && e[1] > current);
        if (!edge) break;
        current = edge[1];
      }
    }
    return path;
  };

  const handleLinearScan = (targetOverride?: number) => {
    const target = targetOverride !== undefined ? targetOverride : targetVal;
    if (isScanning) return;
    setIsScanning(true);
    setScanPath([]);
    setNotFound(false);
    let currentStep = 0;
    const path: number[] = [];

    const interval = setInterval(() => {
      path.push(currentStep);
      setScanPath([...path]);
      playPop();

      if (DATA[currentStep] === target || currentStep >= DATA.length - 1) {
        clearInterval(interval);
        setIsScanning(false);
        if (phase === "STEP2_TRY") {
          setTimeout(() => {
            playError();
            setPhase("STEP3_FAIL");
          }, 500);
        }
      } else {
        currentStep++;
      }
    }, 400); // Painfully slow
  };

  const handleTreeScan = (targetOverride?: number) => {
    const target = targetOverride !== undefined ? targetOverride : targetVal;
    if (isScanning) return;
    setIsScanning(true);
    setScanPath([]);
    setNotFound(false);
    const path = computeTreeSearchPath(target);
    let step = 0;
    const currentPath: number[] = [];

    const interval = setInterval(() => {
      if (step < path.length) {
        currentPath.push(path[step]);
        setScanPath([...currentPath]);
        playPop();
        step++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        const lastNodeVal = DATA[path[path.length - 1]];
        if (lastNodeVal !== target) {
          setNotFound(true);
          playError();
        } else {
          playSuccess();
          if (phase === "STEP6_COMPLETE") {
            setPhase("OUTCOME");
            setShowCelebration(true);
            setTimeout(reportComplete, 1000);
          }
        }
      }
    }, 400); // Fast & snappy
  };

  const executeQuery = (targetOverride?: number) => {
    if (isIndexed) {
      handleTreeScan(targetOverride);
    } else {
      handleLinearScan(targetOverride);
    }
  };

  const handleUnderstand = () => {
    setPhase("STEP4_UNDERSTAND");
    playPop();
  };

  const handleBuildIndex = () => {
    setPhase("STEP5_IMPROVE");
    playZap();
    setIsIndexed(true);
    setScanPath([]);
    setTimeout(() => {
      setPhase("STEP6_COMPLETE");
    }, 2000);
  };

  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (isScanning) return;
    const parsed = parseInt(customQuery, 10);
    if (!isNaN(parsed)) {
      setTargetVal(parsed);
      setNotFound(false);
      setShowCelebration(false);
      executeQuery(parsed);
    }
  };

  const getInstruction = () => {
    switch (phase) {
      case "STEP1_LEARN": return "Learn: We need to locate File #87 in the archive. Click 'Execute Query' to start a manual scan.";
      case "STEP2_TRY": return "Try: Watch the system check every single record. Notice the CPU Cost rising.";
      case "STEP3_FAIL": return "Fail Safely: Server Overload! The linear scan took 13 operations just to find one file.";
      case "STEP4_UNDERSTAND": return "Understand Why: Checking rows one-by-one is an O(N) operation. It scales terribly as databases grow.";
      case "STEP5_IMPROVE": return "Improve: Reorganizing data... Building B-Tree Index architecture.";
      case "STEP6_COMPLETE": return "Complete: The data is now a hierarchical B-Tree. Execute the query again!";
      case "OUTCOME": return "Outcome: O(log N) Efficiency! The search skips irrelevant branches. Try searching for other numbers.";
    }
  };

  const operationsCount = scanPath.length;
  // Linear scan CPU spikes to 95%. Tree scan stays low at 5-15%.
  const cpuCost = isScanning ? (isIndexed ? Math.min(operationsCount * 4, 15) : Math.min(operationsCount * 8, 95)) : (phase === "STEP3_FAIL" || phase === "STEP4_UNDERSTAND" ? 95 : 2);
  const isCrashed = phase === "STEP3_FAIL" || phase === "STEP4_UNDERSTAND";

  return (
    <LabShell
      compact
      labId="databaseindexing9"
      theme="ocean"
      title="Database Indexing Structures"
      onReset={() => {
        setPhase("STEP1_LEARN");
        setIsIndexed(false);
        setScanPath([]);
        setIsScanning(false);
        setTargetVal(INITIAL_TARGET);
        setCustomQuery("87");
        setNotFound(false);
        setShowCelebration(false);
      }}
        >
      <Celebration isActive={showCelebration} message="Lightning Fast Search Achieved!" />
      <div className="w-full bg-white/90 backdrop-blur rounded-xl p-3 mb-3 border border-slate-200 shadow-sm text-sm font-bold text-slate-700 flex items-center justify-center text-center z-20 shrink-0">
        {getInstruction()}
      </div>

      <div className="w-full flex flex-col lg:flex-row flex-1 min-h-0 gap-4 pt-1">
        
        {/* ── LEFT: Query Console ── */}
        <div className="lg:w-[360px] shrink-0 flex flex-col gap-4">
          
          <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${isCrashed ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]" : "border-slate-200"}`}>
            <div className="flex items-center gap-2 mb-5 text-slate-500 uppercase tracking-widest font-black text-xs">
              <Server size={18} />
              <span>Query Cost Analyzer</span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Activity size={16}/> Operations (Steps)</span>
                  <span className={`text-2xl font-black ${operationsCount > 10 ? "text-rose-600" : "text-sky-600"}`}>{operationsCount}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Cpu size={16}/> CPU Usage</span>
                  <span className={`text-lg font-black ${cpuCost > 80 ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}>{cpuCost}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div 
                    className={`h-full transition-colors ${cpuCost > 80 ? "bg-rose-500" : "bg-emerald-500"}`}
                    initial={{ width: "2%" }}
                    animate={{ width: `${cpuCost}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex-1 flex flex-col gap-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              Control Panel
            </h3>

            {phase === "STEP1_LEARN" && (
              <button onClick={() => setPhase("STEP2_TRY")} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-black transition-all shadow-[0_4px_0_rgba(2,132,199,1)] active:translate-y-1 active:shadow-none">
                Initialize System
              </button>
            )}

            {(phase === "STEP2_TRY" || phase === "STEP6_COMPLETE") && (
              <button 
                onClick={() => executeQuery()} 
                disabled={isScanning}
                className={`w-full py-4 px-4 text-white rounded-xl text-sm font-black transition-all flex justify-between items-center ${
                  isIndexed 
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_0_rgba(4,120,87,1)]" 
                    : "bg-slate-800 hover:bg-slate-700 shadow-[0_4px_0_rgba(15,23,42,1)]"
                } active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:translate-y-1 disabled:shadow-none`}
              >
                <span className="flex items-center gap-2">
                  <Search size={18} className={isIndexed ? "text-emerald-200" : "text-sky-400"}/> 
                  Execute Query: FIND {targetVal}
                </span>
              </button>
            )}

            {phase === "STEP3_FAIL" && (
              <button onClick={handleUnderstand} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-black transition-all shadow-[0_4px_0_rgba(159,18,57,1)] active:translate-y-1 active:shadow-none animate-pulse">
                Diagnose Bottleneck
              </button>
            )}

            {phase === "STEP4_UNDERSTAND" && (
              <button onClick={handleBuildIndex} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(2,132,199,1)] active:translate-y-1 active:shadow-none">
                <Database size={18} /> Build B-Tree Index
              </button>
            )}

            {phase === "OUTCOME" && (
              <form onSubmit={handleCustomQuery} className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Custom Query (Enter a number):</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    className="flex-1 border-2 border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-sky-500"
                    placeholder="E.g. 22"
                  />
                  <button type="submit" disabled={isScanning} className="bg-sky-600 text-white px-4 rounded-lg font-bold hover:bg-sky-500 active:translate-y-1 disabled:opacity-50 transition-all">
                    Search
                  </button>
                </div>
                {notFound && (
                  <div className="mt-2 text-rose-600 text-xs font-black bg-rose-50 px-3 py-2 rounded border border-rose-200 animate-pulse text-center uppercase tracking-wider">
                    Record Not Found in Database
                  </div>
                )}
              </form>
            )}

            <div className="mt-auto p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <h4 className="text-xs font-bold text-slate-700 mb-1">Architecture Status</h4>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                <li className="flex justify-between"><span>Structure:</span> <span className={`font-bold ${isIndexed ? "text-emerald-600" : "text-slate-700"}`}>{isIndexed ? "B-Tree (Indexed)" : "Flat Table (Unindexed)"}</span></li>
                <li className="flex justify-between"><span>Search Method:</span> <span className="font-bold text-slate-700">{isIndexed ? "Binary Path" : "Linear Scan"}</span></li>
                <li className="flex justify-between"><span>Time Complexity:</span> <span className={`font-bold ${isIndexed ? "text-emerald-600" : "text-rose-600"}`}>{isIndexed ? "O(log N)" : "O(N)"}</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Data Canvas ── */}
        <div className={`flex-1 bg-slate-50 rounded-2xl border-4 ${isCrashed ? "border-rose-400" : "border-slate-200"} shadow-inner overflow-hidden relative flex flex-col p-6`}>
          
          <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#0f172a 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

          <div className="relative z-10 flex items-center gap-2 mb-6 bg-white/80 w-max px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500">
            <Database size={14} className={isIndexed ? "text-emerald-500" : "text-slate-400"} />
            {isIndexed ? "Archive Mode: Indexed B-Tree" : "Archive Mode: Flat Sequential Array"}
          </div>

          <div className="flex-1 relative w-full h-full flex items-center justify-center">
            
            {/* SVG Connecting Lines for Tree */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: isIndexed ? 1 : 0, transition: "opacity 1s ease-in-out" }}>
              {isIndexed && EDGES.map((edge, idx) => {
                const node1 = TREE_LAYOUT.find(n => n.id === edge[0]);
                const node2 = TREE_LAYOUT.find(n => n.id === edge[1]);
                if (!node1 || !node2) return null;
                
                // Is this edge part of the active search path?
                const isPathActive = scanPath.includes(edge[0]) && scanPath.includes(edge[1]);

                return (
                  <line 
                    key={`line-${idx}`}
                    x1={`${node1.left}%`} 
                    y1={`${node1.top}%`} 
                    x2={`${node2.left}%`} 
                    y2={`${node2.top}%`} 
                    stroke={isPathActive ? "#10b981" : "#cbd5e1"} 
                    strokeWidth={isPathActive ? 4 : 2}
                    className={isPathActive ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-300" : "transition-all duration-300"}
                  />
                );
              })}
            </svg>

            {/* The Nodes */}
            <div className={`relative w-full h-full max-h-[400px] mb-6 ${!isIndexed ? "flex flex-wrap items-center justify-center gap-2 md:gap-3 content-center" : ""}`}>
              {TREE_LAYOUT.map((node, i) => {
                const isScanned = scanPath.includes(i);
                const isCurrent = scanPath[scanPath.length - 1] === i;
                const isTargetFound = isScanned && node.val === targetVal && !isScanning;
                const isNotFoundNode = notFound && isCurrent && !isScanning;
                
                return (
                  <motion.div
                    key={node.id}
                    layout
                    initial={false}
                    animate={isIndexed ? {
                      left: `${node.left}%`,
                      top: `${node.top}%`,
                      x: "-50%",
                      y: "-50%",
                      position: "absolute"
                    } : {
                      position: "relative",
                      left: "auto",
                      top: "auto",
                      x: 0,
                      y: 0
                    }}
                    transition={{ type: "spring", stiffness: 40, damping: 12, mass: 0.8 }}
                    className={`
                      flex items-center justify-center font-mono font-bold text-lg rounded-xl border-2 transition-all duration-300 z-10
                      ${!isIndexed ? "w-12 h-14 md:w-16 md:h-16 shadow-sm" : "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-md"}
                      ${isTargetFound ? "bg-emerald-100 border-emerald-500 text-emerald-800 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110" : 
                        isNotFoundNode ? "bg-rose-100 border-rose-500 text-rose-800 scale-110 shadow-[0_0_20px_rgba(244,63,94,0.4)]" :
                        isCurrent ? "bg-rose-100 border-rose-500 text-rose-800 scale-110 z-20 shadow-[0_0_20px_rgba(244,63,94,0.4)]" :
                        isScanned ? "bg-slate-200 border-slate-300 text-slate-400" : 
                        "bg-white border-sky-200 text-sky-800"}
                    `}
                  >
                    {node.val}
                  </motion.div>
                );
              })}
            </div>
            
          </div>
          
          {/* Legend/Helper at Bottom */}
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-sm bg-white border-2 border-sky-200"></div> Unscanned</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-sm bg-rose-100 border-2 border-rose-500"></div> Active Head</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-sm bg-emerald-100 border-2 border-emerald-500"></div> Target Found</div>
          </div>

        </div>
      </div>
    </LabShell>
  );
}
