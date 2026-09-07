"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Server, Activity, ArrowRightLeft, Skull , Timer} from "lucide-react";

// ─── SVG Load Balancer Visualizer ─────────────────────────────────────────────

type Traffic = { id: number; target: 1 | 2 | 3 };

function LoadBalancingSVG({
  mode,
  traffic,
  serverLoads
}: {
  mode: "ROUND_ROBIN" | "LEAST_CONNECTIONS";
  traffic: Traffic[];
  serverLoads: { s1: number, s2: number, s3: number };
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-traffic">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-fire">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridLb" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridLb)" />

      {/* ── Internet / Incoming Traffic (Left) ── */}
      <text x="50" y="250" fill="#94a3b8" fontSize="16" fontWeight="bold" textAnchor="middle" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", transformOrigin: "50px 250px" }}>
        INTERNET
      </text>

      {/* ── The Load Balancer (Center) ── */}
      <rect x="250" y="150" width="60" height="200" fill="#1e1b4b" rx="8" stroke="#06b6d4" strokeWidth="4" />
      <text x="280" y="250" fill="#a5b4fc" fontSize="14" fontWeight="bold" textAnchor="middle" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", transformOrigin: "280px 250px" }}>
        LOAD BALANCER
      </text>
      
      {/* LB Algorithm text */}
      <text x="280" y="380" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">
        {mode === "ROUND_ROBIN" ? "Step by Step" : "Dynamic Weight"}
      </text>

      {/* ── Backend Servers (Right) ── */}
      {/* Server 1 */}
      <g transform="translate(600, 100)">
        <rect x="0" y="0" width="100" height="60" fill="#0f172a" rx="4" stroke={serverLoads.s1 > 8 ? "#ef4444" : "#10b981"} strokeWidth="2" />
        <text x="50" y="25" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">Server 1</text>
        <text x="50" y="45" fill={serverLoads.s1 > 8 ? "#ef4444" : "#a7f3d0"} fontSize="12" fontWeight="bold" textAnchor="middle">Load: {serverLoads.s1}</text>
        {serverLoads.s1 > 8 && <text x="50" y="-10" fill="#fb7185" fontSize="20" textAnchor="middle" filter="url(#glow-fire)" className="animate-pulse"> CRASHING!</text>}
      </g>

      {/* Server 2 */}
      <g transform="translate(600, 220)">
        <rect x="0" y="0" width="100" height="60" fill="#0f172a" rx="4" stroke={serverLoads.s2 > 8 ? "#ef4444" : "#10b981"} strokeWidth="2" />
        <text x="50" y="25" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">Server 2</text>
        <text x="50" y="45" fill={serverLoads.s2 > 8 ? "#ef4444" : "#a7f3d0"} fontSize="12" fontWeight="bold" textAnchor="middle">Load: {serverLoads.s2}</text>
      </g>

      {/* Server 3 */}
      <g transform="translate(600, 340)">
        <rect x="0" y="0" width="100" height="60" fill="#0f172a" rx="4" stroke={serverLoads.s3 > 8 ? "#ef4444" : "#10b981"} strokeWidth="2" />
        <text x="50" y="25" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">Server 3</text>
        <text x="50" y="45" fill={serverLoads.s3 > 8 ? "#ef4444" : "#a7f3d0"} fontSize="12" fontWeight="bold" textAnchor="middle">Load: {serverLoads.s3}</text>
      </g>

      {/* ── Network Lines ── */}
      <path d="M 310,250 L 600,130" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M 310,250 L 600,250" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M 310,250 L 600,370" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

      {/* ── Animated Traffic ── */}
      <AnimatePresence>
        {traffic.map(t => {
          const targetY = t.target === 1 ? 130 : t.target === 2 ? 250 : 370;

          return (
            <motion.g 
              key={t.id}
              initial={{ x: 100, y: 250 }}
              animate={{ x: [100, 280, 600], y: [250, 250, targetY] }}
              transition={{ duration: 1.5, ease: "linear" }}
              exit={{ opacity: 0 }}
            >
              <circle cx="0" cy="0" r="6" fill="#22d3ee" filter="url(#glow-traffic)" />
              <path d="M -10,-10 L 0,0 L -10,10" fill="none" stroke="#fff" strokeWidth="2" />
            </motion.g>
          );
        })}
      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const TIMER_DURATION_SECONDS = 5 * 60;

export default function LoadBalancing9() {
  const { reportComplete: _reportComplete } = useLMSBridge("loadbalancing9");

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

  const [mode, setMode] = useState<"ROUND_ROBIN" | "LEAST_CONNECTIONS">("ROUND_ROBIN");
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  
  // We simulate "Heavy" jobs taking longer to clear.
  // In our simulation, we manually make Server 1 clear jobs very slowly to cause a bottleneck.
  const [serverLoads, setServerLoads] = useState({ s1: 0, s2: 0, s3: 0 });
  const [isSwarming, setIsSwarming] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const reqIdRef = useRef(0);
  const rrIndexRef = useRef(1); // For round robin (1,2,3)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clearRef = useRef<NodeJS.Timeout | null>(null);

  // Background task clearing
  useEffect(() => {
    clearRef.current = setInterval(() => {
      setServerLoads(prev => ({
        s1: Math.max(0, prev.s1 - 1), // S1 clears very slowly (bottlenecked)
        s2: Math.max(0, prev.s2 - 3), // S2 clears fast
        s3: Math.max(0, prev.s3 - 3)  // S3 clears fast
      }));
    }, 1000);

    return () => {
      if (clearRef.current) clearInterval(clearRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const triggerSwarm = () => {
    if (isSwarming) return;
    setIsSwarming(true);
    playZap();

    let count = 0;
    
    intervalRef.current = setInterval(() => {
      count++;
      if (count > 20) {
        setIsSwarming(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // If they survived using Least Connections
        if (mode === "LEAST_CONNECTIONS" && !hasWon) {
           setTimeout(() => {
             setHasWon(true);
             playSuccess();
             setTimeout(reportComplete, 1500);
           }, 2000);
        }
        return;
      }

      reqIdRef.current++;
      const id = reqIdRef.current;
      playPop();

      // Determine Target based on Algorithm
      let target: 1 | 2 | 3 = 1;

      if (mode === "ROUND_ROBIN") {
        target = rrIndexRef.current as 1|2|3;
        rrIndexRef.current = rrIndexRef.current >= 3 ? 1 : rrIndexRef.current + 1;
      } else {
        // Least Connections: check current server loads and pick the lowest
        setServerLoads(prev => {
          const min = Math.min(prev.s1, prev.s2, prev.s3);
          if (prev.s3 === min) target = 3;
          else if (prev.s2 === min) target = 2;
          else target = 1;
          return prev; // We don't update state here, just reading
        });
      }

      // Spawn visual traffic
      setTraffic(prev => [...prev, { id, target }]);

      // Increase load on target server when it arrives (1.5s later)
      setTimeout(() => {
        setServerLoads(prev => {
          const newLoads = { ...prev };
          if (target === 1) newLoads.s1 += 2;
          if (target === 2) newLoads.s2 += 2;
          if (target === 3) newLoads.s3 += 2;
          
          if (newLoads.s1 > 8 || newLoads.s2 > 8 || newLoads.s3 > 8) {
            playError(); // Fire warning!
          }
          return newLoads;
        });

        // Clean up visual packet
        setTraffic(prev => prev.filter(t => t.id !== id));
      }, 1500);

    }, 300); // Super fast burst!
  };

  const toggleMode = () => {
    setMode(m => m === "ROUND_ROBIN" ? "LEAST_CONNECTIONS" : "ROUND_ROBIN");
    setServerLoads({ s1: 0, s2: 0, s3: 0 });
    rrIndexRef.current = 1;
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
      } labId="loadbalancing9" theme="ocean" title="Load Balancing Algorithms" subtitle="L31 · Cloud Architecture"
      instruction="Server 1 is a slower machine. In Round Robin mode, trigger a traffic swarm. The Load Balancer blindly sends traffic 1-2-3, causing Server 1 to overload and catch fire. Switch to Least Connections mode to watch the Load Balancer dynamically route traffic away from the struggling server." compact>
      
      <Celebration isActive={hasWon} message="System Saved! 'Least Connections' actively monitors backend health. When Server 1 started backing up, the Load Balancer dynamically shifted the traffic to the idle servers to prevent a crash." onReplay={() => {
        setHasWon(false); setServerLoads({ s1: 0, s2: 0, s3: 0 });
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-cyan-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={toggleMode} 
            disabled={isSwarming}
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${mode === "ROUND_ROBIN" ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"} disabled:opacity-50`}
          >
            <ArrowRightLeft size={20}/> Algorithm: {mode === "ROUND_ROBIN" ? "Blind Round Robin" : "Least Connections (Dynamic)"}
          </button>
          
          <button 
            onClick={triggerSwarm} 
            disabled={isSwarming}
            className="px-8 py-3 rounded-xl font-black bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 hover:bg-rose-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
          >
            <Activity size={18}/> Trigger Traffic Swarm
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-cyan-900/40 bg-[#020617] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <LoadBalancingSVG mode={mode} traffic={traffic} serverLoads={serverLoads} />
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
