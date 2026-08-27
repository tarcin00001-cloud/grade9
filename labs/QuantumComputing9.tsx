"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Box, Play, Orbit, Search, Atom, RotateCcw } from "lucide-react";

// ─── SVG Quantum Qubit Bloch Sphere ───────────────────────────────────────────

function QuantumSVG({
  state
}: {
  state: "ZERO" | "SUPERPOSITION" | "MEASURED_0" | "MEASURED_1"
}) {
  const isSuper = state === "SUPERPOSITION";

  // Determine vector target coordinates based on state
  // Center is (450, 250). Radius is 150.
  // |0> is top (450, 100). |1> is bottom (450, 400).
  // Superposition |+> is equator right (600, 250).

  let vectorEndX = 450;
  let vectorEndY = 100;

  if (isSuper) {
    vectorEndX = 600;
    vectorEndY = 250;
  } else if (state === "MEASURED_1") {
    vectorEndX = 450;
    vectorEndY = 400;
  }

  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-quantum">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-wave">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="sphere-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.4" />
          <stop offset="80%" stopColor="#312e81" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      <rect width="900" height="500" fill="#ffffff" />

      {/* ── 1. The Bloch Sphere ── */}
      <circle cx="450" cy="250" r="150" fill="url(#sphere-grad)" stroke="#14b8a6" strokeWidth="2" />
      
      {/* Equator */}
      <ellipse cx="450" cy="250" rx="150" ry="40" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="6 6" />
      {/* Prime Meridian */}
      <ellipse cx="450" cy="250" rx="40" ry="150" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="6 6" />

      {/* Axes */}
      <line x1="450" y1="50" x2="450" y2="450" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="250" y1="250" x2="650" y2="250" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Axis Labels */}
      <text x="450" y="80" fill="#1e293b" fontSize="20" fontWeight="bold" textAnchor="middle">|0⟩</text>
      <text x="450" y="435" fill="#1e293b" fontSize="20" fontWeight="bold" textAnchor="middle">|1⟩</text>
      <text x="670" y="255" fill="#0d9488" fontSize="20" fontWeight="bold" textAnchor="middle">|+⟩</text>

      {/* ── 2. Quantum Vector State ── */}
      {/* If superposition, show probability cloud */}
      {isSuper && (
        <motion.circle 
          cx="600" cy="250" r="30" fill="#a855f7" 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 1, repeat: Infinity }} 
          filter="url(#glow-quantum)" 
        />
      )}

      {/* The State Vector Line */}
      <motion.line 
        x1="450" y1="250" 
        animate={{ x2: vectorEndX, y2: vectorEndY }} 
        transition={{ type: "spring", stiffness: 80, damping: 10 }}
        stroke={isSuper ? "#a855f7" : "#06b6d4"} strokeWidth="6" strokeLinecap="round" filter="url(#glow-quantum)" 
      />
      
      {/* Vector Head */}
      <motion.circle 
        animate={{ cx: vectorEndX, cy: vectorEndY }}
        transition={{ type: "spring", stiffness: 80, damping: 10 }}
        r="8" fill="#fff" filter="url(#glow-quantum)"
      />

      {/* ── 3. Wave Function Visualizer (Background) ── */}
      <g transform="translate(50, 50)">
        <text x="0" y="0" fill="#334155" fontSize="12" fontWeight="bold" letterSpacing="2">PROBABILITY WAVE</text>
        {isSuper ? (
           <motion.path 
             d="M 0,40 Q 50,10 100,40 T 200,40" 
             fill="none" stroke="#a855f7" strokeWidth="3" filter="url(#glow-wave)"
             animate={{ d: ["M 0,40 Q 50,10 100,40 T 200,40", "M 0,40 Q 50,70 100,40 T 200,40"] }}
             transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }}
           />
        ) : (
          <path d="M 0,40 L 200,40" fill="none" stroke="#06b6d4" strokeWidth="3" filter="url(#glow-wave)" />
        )}
      </g>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function QuantumComputing9() {
  const { reportComplete } = useLMSBridge("quantumcomputing9");
  const { playPop, playSuccess, playZap, playChime } = useLabAudio();

  const [state, setState] = useState<"ZERO" | "SUPERPOSITION" | "MEASURED_0" | "MEASURED_1">("ZERO");
  const [hasWon, setHasWon] = useState(false);

  const applyHadamard = () => {
    if (state !== "ZERO") return;
    playZap();
    setState("SUPERPOSITION");
  };

  const measure = () => {
    if (state !== "SUPERPOSITION") return;
    playChime();
    
    // Wave function collapse (50/50 probability)
    const result = Math.random() > 0.5 ? "MEASURED_1" : "MEASURED_0";
    setState(result);
    
    if (!hasWon) {
      setTimeout(() => {
        playSuccess();
        setHasWon(true);
        reportComplete();
      }, 1000);
    }
  };

  const handleReset = () => {
    playPop();
    setState("ZERO");
    setHasWon(false);
  };

  return (
    <LabShell labId="quantumcomputing9" theme="garden" title="Quantum Superposition"
      instruction="1. Understand the core quantum computing concept of superposition and qubits. 2. Interact with the simulation to manipulate qubits into states of superposition. 3. Perform a basic quantum measurement and observe the probability collapse. 4. Complete the quantum logic challenge by building a simple quantum circuit." compact
      onReset={handleReset}
    >
      
      <Celebration isActive={hasWon} message="Wave function collapsed! You observed how quantum probability forces a qubit to decide on a binary state only when measured." onReplay={handleReset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Controls */}
        <div className="shrink-0 flex gap-3">
          <button 
            onClick={applyHadamard} 
            disabled={state !== "ZERO"}
            className={`flex-1 rounded-2xl border-2 p-3 flex items-center justify-between transition-all ${state !== "ZERO" ? "opacity-50 cursor-not-allowed bg-violet-600/10 border-violet-500/50/30 text-purple-400" : "hover:scale-[1.02] bg-teal-500/10 border-teal-500/30 text-teal-400"}`}
          >
            <div className="text-left">
              <p className="font-black text-sm flex items-center gap-2"><Orbit size={16}/> Apply Hadamard Gate (H)</p>
              <p className="opacity-60 text-xs mt-1 max-w-[350px]">Rotate the vector to the equator, holding |0&gt; and |1&gt; simultaneously.</p>
            </div>
          </button>
          
          <button 
            onClick={measure} 
            disabled={state !== "SUPERPOSITION"}
            className={`flex-1 rounded-2xl border-2 p-3 flex items-center justify-between transition-all ${state !== "SUPERPOSITION" ? "opacity-50 cursor-not-allowed bg-neutral-500/10 border-neutral-500/30 text-neutral-400" : "hover:scale-[1.02] bg-pink-500/10 border-pink-500/30 text-pink-400"}`}
          >
            <div className="text-left">
              <p className="font-black text-sm flex items-center gap-2"><Search size={16}/> Measure Qubit</p>
              <p className="opacity-60 text-xs mt-1 max-w-[350px]">Collapse the probability wave. The outcome is truly random physics.</p>
            </div>
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 rounded-3xl overflow-x-auto overflow-y-hidden relative border-2 border-slate-300 bg-white shadow-sm p-2 md:p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <QuantumSVG state={state} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
