"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Brain, Play, RefreshCcw } from "lucide-react";

// ─── SVG Machine Learning Visualizer ──────────────────────────────────────────

// Scatter plot dataset
const DATA_POINTS = [
  { x: 100, y: 350 },
  { x: 200, y: 300 },
  { x: 300, y: 280 },
  { x: 400, y: 200 },
  { x: 500, y: 150 },
  { x: 600, y: 120 },
  { x: 700, y: 80 }
];

function MlSVG({ epoch, lineAngle, lineY }: { epoch: number; lineAngle: number; lineY: number }) {
  
  // The current AI prediction line equation based on center pivot (x=400)
  const getLineYAtX = (x: number) => {
    const pivotX = 400;
    const dy = (x - pivotX) * Math.tan((lineAngle * Math.PI) / 180);
    return lineY + dy;
  };

  // Calculate total absolute error (sum of all red line lengths)
  const totalError = DATA_POINTS.reduce((sum, pt) => {
    return sum + Math.abs(pt.y - getLineYAtX(pt.x));
  }, 0);

  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-ml">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridMl" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridMl)" />

      {/* Axis */}
      <path d="M 50,450 L 850,450" fill="none" stroke="#475569" strokeWidth="3" />
      <path d="M 50,50 L 50,450" fill="none" stroke="#475569" strokeWidth="3" />
      <text x="450" y="480" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle">Feature X (Input)</text>
      <text x="20" y="250" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", transformOrigin: "20px 250px" }}>Prediction Y (Output)</text>

      {/* Data Points & Error Lines */}
      {DATA_POINTS.map((pt, i) => {
        const predictedY = getLineYAtX(pt.x);
        const errorSize = Math.abs(pt.y - predictedY);
        
        return (
          <g key={i}>
            {/* The physical "Error" line (difference between actual and predicted) */}
            <motion.path 
              d={`M ${pt.x},${pt.y} L ${pt.x},${predictedY}`} 
              fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4"
              initial={false}
              animate={{ d: `M ${pt.x},${pt.y} L ${pt.x},${predictedY}` }}
              transition={{ type: "spring", bounce: 0 }}
            />
            
            {/* Error Magnitude Text (only show on a couple points to avoid clutter) */}
            {(i === 1 || i === 5) && errorSize > 5 && (
               <text x={pt.x + 10} y={(pt.y + predictedY) / 2} fill="#fb7185" fontSize="10" fontWeight="bold">Error</text>
            )}

            {/* The actual Training Data Data Point */}
            <circle cx={pt.x} cy={pt.y} r="8" fill="#a78bfa" filter="url(#glow-ml)" />
          </g>
        );
      })}

      {/* ── The AI's Prediction Line (Linear Regression) ── */}
      <motion.g
        initial={false}
        animate={{ y: lineY, rotate: lineAngle }}
        style={{ transformOrigin: "400px 0px" }}
        transition={{ type: "spring", bounce: 0.2 }}
      >
        <path d="M -200,0 L 1000,0" fill="none" stroke="#10b981" strokeWidth="6" filter="url(#glow-ml)" />
      </motion.g>

      {/* ── Dashboard (Top Right) ── */}
      <g transform="translate(650, 40)">
        <rect x="0" y="0" width="200" height="100" fill="#0f172a" rx="8" stroke="#8b5cf6" strokeWidth="2" />
        <text x="100" y="25" fill="#93c5fd" fontSize="14" fontWeight="bold" textAnchor="middle">AI TRAINING STATE</text>
        
        <text x="20" y="55" fill="#fff" fontSize="12">Epochs (Runs):</text>
        <text x="180" y="55" fill="#a78bfa" fontSize="16" fontWeight="bold" textAnchor="end">{epoch} / 5</text>

        <text x="20" y="80" fill="#fff" fontSize="12">Total Error:</text>
        <text x="180" y="80" fill={totalError < 50 ? "#10b981" : "#ef4444"} fontSize="16" fontWeight="bold" textAnchor="end">
          {Math.round(totalError)}
        </text>
      </g>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function MachineLearningTraining9() {
  const { reportComplete } = useLMSBridge("machinelearningtraining9");
  const { playPop, playZap, playSuccess } = useLabAudio();

  // The AI starts with a terrible horizontal line at the top
  const [epoch, setEpoch] = useState(0);
  const [lineAngle, setLineAngle] = useState(10);
  const [lineY, setLineY] = useState(50);
  const [hasWon, setHasWon] = useState(false);

  const trainEpoch = () => {
    if (epoch >= 5) return;
    
    const newEpoch = epoch + 1;
    setEpoch(newEpoch);
    playPop();

    // Physically step the angle and Y position closer to the line of best fit
    // Optimal is roughly angle: -24, Y: 240
    setLineAngle(prev => prev - 6.8);
    setLineY(prev => prev + 38);

    if (newEpoch === 5) {
      setTimeout(() => {
        setHasWon(true);
        playSuccess();
        setTimeout(reportComplete, 1500);
      }, 500);
    }
  };

  const reset = () => {
    setEpoch(0);
    setLineAngle(10);
    setLineY(50);
    setHasWon(false);
  };

  return (
    <LabShell labId="machinelearningtraining9" theme="cosmos" title="Supervised ML (Gradient Descent)" subtitle="L36 · Artificial Intelligence"
      instruction="AI 'Learning' is just math. The Green Line is the AI's guess. The Red Lines show how wrong it is (Error). Click 'Train Epoch' to adjust the weights. Notice how the AI physically rotates and shifts the line specifically to shrink the red Error lines until it fits the data perfectly." compact>
      
      <Celebration isActive={hasWon} message="Model Trained! You just performed Gradient Descent. The AI doesn't 'think', it just calculates the Error and adjusts its line until that Error hits zero. This is how neural networks learn everything from identifying cats to driving cars." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-emerald-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={trainEpoch} 
            disabled={epoch >= 5}
            className="px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Brain size={18}/> Train Epoch (Adjust Weights to Reduce Error)
          </button>

          <button onClick={reset} className="px-4 py-3 rounded-xl font-black bg-zinc-800/80 border-2 border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all">
            <RefreshCcw size={18}/>
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-emerald-900/40 bg-[#09090b] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <MlSVG epoch={epoch} lineAngle={lineAngle} lineY={lineY} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
