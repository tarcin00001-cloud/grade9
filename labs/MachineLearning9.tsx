"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Brain, Activity, RotateCcw } from "lucide-react";

// ─── SVG Machine Learning Perceptron Visualizer ───────────────────────────────

function PerceptronSVG({
  epoch
}: {
  epoch: number; // 0 to 10
}) {
  // Generate static random scatter points
  // Red points in upper left, Blue points in bottom right
  const [points] = useState(() => {
    const p = [];
    for(let i=0; i<30; i++) {
      p.push({ x: 100 + Math.random()*300, y: 100 + Math.random()*150, type: "RED" }); // Upper left chunk
      p.push({ x: 500 + Math.random()*300, y: 250 + Math.random()*150, type: "BLUE" }); // Lower right chunk
    }
    // A few noisy points
    p.push({ x: 450, y: 200, type: "RED" });
    p.push({ x: 480, y: 220, type: "BLUE" });
    return p;
  });

  // Calculate the Decision Boundary Line based on the epoch (Gradient Descent Steps)
  // Epoch 0: Bad random line
  // Epoch 10: Perfect diagonal line separating red and blue
  const getLineParams = (e: number) => {
    // We interpolate from a bad line to a good line
    // Good line (Epoch 10): passes through roughly (450, 0) to (450, 500), but let's make it diagonal: (0, 0) to (900, 500) separates them well.
    // Let's use points (x1, y1) to (x2, y2)
    const t = e / 10;
    
    // Bad line (t=0): completely horizontal at y=100
    const x1_start = 0, y1_start = 100;
    const x2_start = 900, y2_start = 100;
    
    // Good line (t=1): Diagonal from (200, 500) to (700, 0)
    const x1_end = 200, y1_end = 500;
    const x2_end = 700, y2_end = 0;

    return {
      x1: x1_start + (x1_end - x1_start) * t,
      y1: y1_start + (y1_end - y1_start) * t,
      x2: x2_start + (x2_end - x2_start) * t,
      y2: y2_start + (y2_end - y2_start) * t
    };
  };

  const line = getLineParams(epoch);
  const isTrained = epoch === 10;

  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-line">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="decision-zone" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#0f172a" stopOpacity="0" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect width="900" height="500" fill="#ffffff" />
      
      {/* Background Grid */}
      <pattern id="mlGrid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
      </pattern>
      <rect width="900" height="500" fill="url(#mlGrid)" />

      {/* Area Under Curve (Decision Zones) - only show when trained */}
      {isTrained && (
        <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 1 }} width="900" height="500" fill="url(#decision-zone)" />
      )}

      {/* Data Points */}
      {points.map((p, i) => (
        <circle 
          key={`pt-${i}`} 
          cx={p.x} cy={p.y} r="6" 
          fill={p.type === "RED" ? "#ef4444" : "#3b82f6"} 
          stroke={p.type === "RED" ? "#7f1d1d" : "#1e3a8a"} 
          strokeWidth="2" 
        />
      ))}

      {/* Decision Boundary Line */}
      <motion.line 
        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
        stroke={isTrained ? "#10b981" : "#a855f7"} 
        strokeWidth={isTrained ? 6 : 4} 
        strokeLinecap="round"
        filter="url(#glow-line)"
        animate={{ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      />

      {/* Dynamic Error HUD */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="180" height="80" fill="#f8fafc" rx="8" stroke="#cbd5e1" strokeWidth="2" />
        <text x="90" y="25" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle">LOSS FUNCTION</text>
        <text x="90" y="60" fill={isTrained ? "#10b981" : "#ef4444"} fontSize="24" fontFamily="monospace" fontWeight="black" textAnchor="middle">
          {(Math.max(0, 1.0 - (epoch / 10))).toFixed(4)}
        </text>
      </g>
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function MachineLearning9() {
  const { reportComplete } = useLMSBridge("machinelearning9");
  const { playPop, playSuccess, playZap } = useLabAudio();

  const [epoch, setEpoch] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  const trainEpoch = () => {
    if (epoch >= 10) return;
    
    playPop();
    const nextEpoch = epoch + 1;
    setEpoch(nextEpoch);

    if (nextEpoch === 10) {
      playZap();
      setHasWon(true);
      setTimeout(() => {
        playSuccess();
        reportComplete();
      }, 1000);
    }
  };

  const reset = () => {
    setEpoch(0);
    setHasWon(false);
  };

  return (
    <LabShell labId="machinelearning9" theme="neon" title="Neural Networks & Gradient Descent"
      onReset={reset}
      instruction="1. Learn the mathematical foundation of neural networks and gradient descent. 2. Configure a simple neural network and initialize its parameters. 3. Step through the gradient descent process to see how the weights are updated. 4. Achieve convergence to a local minimum to successfully train the model." compact>
      
      <Celebration isActive={hasWon} message="Convergence Achieved! The algorithm successfully learned the weights to perfectly separate the two datasets. Loss is minimized." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Step Controls */}
        <div className="shrink-0 bg-white rounded-2xl border-2 border-zinc-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 mr-4">
            <Brain className={epoch === 10 ? "text-emerald-500" : "text-violet-500"} size={24} />
            <div>
              <p className="text-zinc-900 font-black text-sm uppercase tracking-wider">Perceptron Engine</p>
              <p className="text-zinc-500 text-xs">Epoch {epoch}/10</p>
            </div>
          </div>

          <button 
            onClick={trainEpoch} 
            disabled={epoch >= 10}
            className={`flex-1 rounded-xl p-3 font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${epoch >= 10 ? "bg-zinc-100 border-zinc-300 text-zinc-400" : "bg-violet-100 border-violet-300 text-violet-700 hover:scale-[1.02]"}`}
          >
            <Activity size={16}/> Execute Gradient Descent Step
          </button>
          
          <button 
            onClick={reset} 
            className="px-6 rounded-xl border-2 border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 font-black flex items-center gap-2 py-3"
          >
            <RotateCcw size={16}/> Reset Weights
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 bg-white rounded-3xl overflow-x-auto overflow-y-hidden relative border-2 border-zinc-200 shadow-inner flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <PerceptronSVG epoch={epoch} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
