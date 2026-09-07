"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Network, SplitSquareHorizontal, Zap , Timer} from "lucide-react";

// ─── SVG Subnetting Visualizer ────────────────────────────────────────────────

function SubnetSVG({
  isSubnetted,
  stormActive,
  particles
}: {
  isSubnetted: boolean;
  stormActive: boolean;
  particles: { id: number, x: number, y: number, color: string }[];
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-storm">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridSubnet" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridSubnet)" />

      {/* ── Network Container ── */}
      <rect x="100" y="50" width="700" height="400" fill="#0f172a" rx="16" stroke="#334155" strokeWidth="4" />
      
      {/* ── Central Router ── */}
      <circle cx="450" cy="50" r="30" fill="#064e3b" stroke="#10b981" strokeWidth="4" />
      <text x="450" y="55" fill="#a7f3d0" fontSize="16" fontWeight="bold" textAnchor="middle">R1</text>
      <text x="450" y="10" fill="#34d399" fontSize="14" fontWeight="bold" textAnchor="middle">192.168.1.0</text>

      {/* ── Subnetting Firewall Divider (Appears when Subnetted) ── */}
      <AnimatePresence>
        {isSubnetted && (
          <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "450px 50px" }}>
            <rect x="440" y="80" width="20" height="370" fill="#fb7185" rx="4" />
            <text x="450" y="250" fill="#fff" fontSize="14" fontWeight="black" textAnchor="middle" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", transformOrigin: "450px 250px" }}>
              SUBNET ROUTER ISOLATION
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* ── Subnet Labels ── */}
      {!isSubnetted ? (
        <text x="450" y="470" fill="#64748b" fontSize="16" fontWeight="bold" textAnchor="middle">Massive Broadcast Domain (/24 = 256 IPs)</text>
      ) : (
        <g>
          <text x="275" y="470" fill="#fb923c" fontSize="16" fontWeight="bold" textAnchor="middle">Subnet A (/25 = 128 IPs)</text>
          <text x="625" y="470" fill="#f59e0b" fontSize="16" fontWeight="bold" textAnchor="middle">Subnet B (/25 = 128 IPs)</text>
        </g>
      )}

      {/* ── End Devices (PCs) ── */}
      {/* Left side devices */}
      <rect x="150" y="150" width="40" height="40" fill="#1e293b" rx="4" stroke="#f97316" strokeWidth="2" />
      <rect x="150" y="300" width="40" height="40" fill="#1e293b" rx="4" stroke="#f97316" strokeWidth="2" />
      <rect x="300" y="220" width="40" height="40" fill="#1e293b" rx="4" stroke="#f97316" strokeWidth="2" />
      
      {/* Right side devices */}
      <rect x="710" y="150" width="40" height="40" fill="#1e293b" rx="4" stroke={isSubnetted ? "#f59e0b" : "#3b82f6"} strokeWidth="2" />
      <rect x="710" y="300" width="40" height="40" fill="#1e293b" rx="4" stroke={isSubnetted ? "#f59e0b" : "#3b82f6"} strokeWidth="2" />
      <rect x="560" y="220" width="40" height="40" fill="#1e293b" rx="4" stroke={isSubnetted ? "#f59e0b" : "#3b82f6"} strokeWidth="2" />

      {/* ── Bouncing Broadcast Storm Particles ── */}
      {stormActive && particles.map(p => (
        <circle key={p.id} cx={p.x} cy={p.y} r="4" fill={p.color} filter="url(#glow-storm)" />
      ))}

      {/* Warning Overlay if massive storm */}
      {stormActive && !isSubnetted && (
        <text x="450" y="250" fill="#fb7185" fontSize="24" fontWeight="black" textAnchor="middle" opacity="0.3" letterSpacing="4">BROADCAST STORM</text>
      )}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const TIMER_DURATION_SECONDS = 5 * 60;

export default function Subnetting9() {
  const { reportComplete: _reportComplete } = useLMSBridge("subnetting9");

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

  const [isSubnetted, setIsSubnetted] = useState(false);
  const [stormActive, setStormActive] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, vx: number, vy: number, color: string }[]>([]);
  const animRef = useRef<number | null>(null);

  const startStorm = () => {
    if (stormActive) return;
    setStormActive(true);
    playError();

    // Spawn dozens of particles radiating from one PC (x: 170, y: 170)
    let newParticles = [];
    for(let i=0; i<40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: i,
        x: 170,
        y: 170,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: isSubnetted ? "#3b82f6" : "#ef4444" // Blue if contained, Red if chaotic
      });
    }
    setParticles(newParticles);

    // Physics Engine for bouncing
    const updatePhysics = () => {
      setParticles(prev => prev.map(p => {
        let nx = p.x + p.vx;
        let ny = p.y + p.vy;
        let nvx = p.vx;
        let nvy = p.vy;

        // Bounding Box limits based on mode
        const minX = 100;
        const maxX = isSubnetted ? 440 : 800; // Physical isolation wall!
        const minY = 50;
        const maxY = 450;

        if (nx <= minX || nx >= maxX) nvx = -nvx;
        if (ny <= minY || ny >= maxY) nvy = -nvy;

        // Keep inside bounds just in case
        nx = Math.max(minX, Math.min(nx, maxX));
        ny = Math.max(minY, Math.min(ny, maxY));

        return { ...p, x: nx, y: ny, vx: nvx, vy: nvy };
      }));

      animRef.current = requestAnimationFrame(updatePhysics);
    };

    animRef.current = requestAnimationFrame(updatePhysics);

    // Auto-stop storm after 4 seconds
    setTimeout(() => {
       stopStorm();
       if (isSubnetted && !hasWon) {
         setHasWon(true);
         playSuccess();
         setTimeout(reportComplete, 1500);
       }
    }, 4000);
  };

  const stopStorm = () => {
    setStormActive(false);
    setParticles([]);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  };

  const toggleSubnetting = () => {
    playZap();
    setIsSubnetted(!isSubnetted);
    if (stormActive) stopStorm();
  };

  useEffect(() => {
    return () => stopStorm();
  }, []);

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
      } labId="subnetting9" theme="forge" title="Subnetting & Broadcast Domains" subtitle="L23 · Network Architecture"
      instruction="Trigger a Broadcast Storm. In a massive /24 flat network, notice how a single noisy PC spams every other machine across the entire network. Apply a Subnet Mask (/25) to physically slice the network in half. Trigger the storm again to see how Subnets isolate noise and improve security." compact>
      
      <Celebration isActive={hasWon} message="Broadcast Domain Isolated! Subnetting acts like a physical wall. A broadcast sent in Subnet A cannot cross the router into Subnet B, saving bandwidth and improving security." onReplay={() => {
        setIsSubnetted(false); setHasWon(false);
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-emerald-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={toggleSubnetting} 
            disabled={stormActive}
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${isSubnetted ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-slate-800 border-slate-600 text-slate-300"}`}
          >
            <SplitSquareHorizontal size={20}/> Architecture: {isSubnetted ? "Subnetted (/25)" : "Flat Network (/24)"}
          </button>
          
          <button 
            onClick={startStorm} 
            disabled={stormActive}
            className="px-8 py-3 rounded-xl font-black bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 hover:bg-rose-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
          >
            <Zap size={18}/> Trigger Broadcast Protocol (ARP)
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-emerald-900/40 bg-[#020617] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <SubnetSVG isSubnetted={isSubnetted} stormActive={stormActive} particles={particles} />
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
