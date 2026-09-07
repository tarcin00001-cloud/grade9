"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Search, Database, Network , Timer} from "lucide-react";

// ─── SVG Database Indexing Visualizer ─────────────────────────────────────────

function IndexingSVG({
  mode,
  targetValue,
  scanPath
}: {
  mode: "FLAT" | "BTREE";
  targetValue: number;
  scanPath: number[];
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-search">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridDb" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridDb)" />

      {/* ── Flat Table Mode (Full Table Scan) ── */}
      {mode === "FLAT" && (
        <g transform="translate(50, 200)">
          <text x="400" y="-40" fill="#94a3b8" fontSize="18" fontWeight="bold" textAnchor="middle">FLAT TABLE (Full Scan Required)</text>
          
          {/* Render 20 flat blocks */}
          {[10, 15, 22, 28, 35, 42, 50, 55, 61, 68, 75, 82, 87, 91, 95].map((val, i) => {
            const isScanned = scanPath.includes(val);
            const isTarget = val === targetValue && isScanned;
            
            return (
              <g key={`flat-${val}`} transform={`translate(${i * 53}, 0)`}>
                <rect 
                  x="0" y="0" width="45" height="45" 
                  fill={isTarget ? "#10b981" : isScanned ? "#ef4444" : "#0f172a"} 
                  rx="4" 
                  stroke={isScanned ? "#fff" : "#334155"} 
                  strokeWidth="2" 
                  filter={isTarget ? "url(#glow-search)" : "none"}
                />
                <text x="22.5" y="27" fill={isScanned ? "#fff" : "#64748b"} fontSize="14" fontWeight="bold" textAnchor="middle">{val}</text>
              </g>
            );
          })}
        </g>
      )}

      {/* ── B-Tree Mode (Logarithmic Search) ── */}
      {mode === "BTREE" && (
        <g transform="translate(450, 100)">
          <text x="0" y="-40" fill="#34d399" fontSize="18" fontWeight="bold" textAnchor="middle" filter="url(#glow-search)">B-TREE INDEX STRUCTURE</text>

          {/* Tree Lines */}
          <path d="M 0,0 L -200,100" fill="none" stroke="#334155" strokeWidth="4" />
          <path d="M 0,0 L 200,100" fill="none" stroke="#334155" strokeWidth="4" />
          <path d="M -200,100 L -300,200" fill="none" stroke="#334155" strokeWidth="4" />
          <path d="M -200,100 L -100,200" fill="none" stroke="#334155" strokeWidth="4" />
          <path d="M 200,100 L 100,200" fill="none" stroke="#334155" strokeWidth="4" />
          <path d="M 200,100 L 300,200" fill="none" stroke="#334155" strokeWidth="4" />

          {/* Helper to render nodes */}
          {([
            { val: 50, x: 0, y: 0 },
            { val: 28, x: -200, y: 100 },
            { val: 75, x: 200, y: 100 },
            { val: 15, x: -300, y: 200 },
            { val: 35, x: -100, y: 200 },
            { val: 61, x: 100, y: 200 },
            { val: 87, x: 300, y: 200 },
          ]).map(node => {
            const isScanned = scanPath.includes(node.val);
            const isTarget = node.val === targetValue && isScanned;
            
            return (
              <g key={`tree-${node.val}`} transform={`translate(${node.x}, ${node.y})`}>
                <circle 
                  cx="0" cy="0" r="30" 
                  fill={isTarget ? "#10b981" : isScanned ? "#ef4444" : "#0f172a"} 
                  stroke={isScanned ? "#fff" : "#3b82f6"} 
                  strokeWidth="4" 
                  filter={isTarget ? "url(#glow-search)" : "none"}
                />
                <text x="0" y="6" fill={isScanned ? "#fff" : "#93c5fd"} fontSize="16" fontWeight="bold" textAnchor="middle">{node.val}</text>
              </g>
            );
          })}
        </g>
      )}

      {/* Target Marker Overlay */}
      {scanPath.length > 0 && (
         <text x="450" y="450" fill="#fbbf24" fontSize="24" fontWeight="black" textAnchor="middle">
           Looking for: {targetValue} (Operations: {scanPath.length})
         </text>
      )}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const TIMER_DURATION_SECONDS = 5 * 60;

export default function DatabaseIndexing9() {
  const { reportComplete: _reportComplete } = useLMSBridge("databaseindexing9");

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
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<"FLAT" | "BTREE">("FLAT");
  const [scanPath, setScanPath] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const target = 87;
  const flatArray = [10, 15, 22, 28, 35, 42, 50, 55, 61, 68, 75, 82, 87, 91, 95];
  const treePath = [50, 75, 87]; // Manual path for visual

  const startSearch = () => {
    if (isSearching) return;
    setIsSearching(true);
    setScanPath([]);
    playZap();

    const sequence = mode === "FLAT" ? flatArray.slice(0, flatArray.indexOf(target) + 1) : treePath;
    
    let step = 0;
    const interval = setInterval(() => {
      setScanPath(prev => [...prev, sequence[step]]);
      
      if (sequence[step] === target) {
        playSuccess();
        clearInterval(interval);
        setIsSearching(false);
        
        if (mode === "BTREE" && !hasWon) {
          setHasWon(true);
          setTimeout(reportComplete, 1500);
        }
      } else {
        playPop(); // Ping for every failure
      }
      step++;
    }, mode === "FLAT" ? 200 : 800); // Flat is fast but has many steps. Tree is slow steps but very few of them.
  };

  const toggleMode = () => {
    setMode(m => m === "FLAT" ? "BTREE" : "FLAT");
    setScanPath([]);
    setIsSearching(false);
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
      } labId="databaseindexing9" theme="studio" title="Database Indexing Structures" subtitle="L22 · Database Engineering"
      instruction="A Database without an index is just a flat file. Click Search to watch the engine perform a grueling 'Full Table Scan' to find 87. Then, build a B-Tree Index and search again. Notice how it logarithmicly skips half the data every step." compact>
      
      <Celebration isActive={hasWon} message="O(log n) Efficiency Achieved! By building an Index, the database transformed a massive flat table into a balanced tree, drastically reducing the number of read operations required to find a record." onReplay={() => {
        setMode("FLAT"); setScanPath([]); setHasWon(false);
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-emerald-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={toggleMode} 
            disabled={isSearching}
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${mode === "FLAT" ? "bg-neutral-800 border-neutral-600 text-neutral-300" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"} disabled:opacity-50`}
          >
            {mode === "FLAT" ? <Database size={20}/> : <Network size={20}/>}
            Architecture: {mode === "FLAT" ? "Flat Table (Unindexed)" : "B-Tree Index"}
          </button>
          
          <button 
            onClick={startSearch} 
            disabled={isSearching}
            className="px-8 py-3 rounded-xl font-black bg-fuchsia-600/20 border-2 border-fuchsia-500/50/50 text-blue-400 hover:bg-fuchsia-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
          >
            <Search size={18}/> Execute Query: FIND 87
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-emerald-900/40 bg-[#0a0a0a] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <IndexingSVG mode={mode} targetValue={87} scanPath={scanPath} />
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
