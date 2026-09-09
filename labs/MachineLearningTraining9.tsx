"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Play, RotateCcw, Activity, HelpCircle, Compass, Timer, 
  ArrowRight, Sparkles, AlertTriangle, CheckCircle2, TrendingDown, 
  Target, Sliders, Zap, Check, Lock
} from "lucide-react";
import LabShell from "@/components/LabShell";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";

// ─── Real-World Training Dataset: Vehicle Speed (mph) vs. Braking Distance (ft) ──
const TRAINING_DATA = [
  { id: 1, speed: 20, distance: 40, svgX: 60, svgY: 180 },
  { id: 2, speed: 30, distance: 75, svgX: 130, svgY: 155 },
  { id: 3, speed: 40, distance: 115, svgX: 200, svgY: 125 },
  { id: 4, speed: 50, distance: 165, svgX: 270, svgY: 85 },
  { id: 5, speed: 60, distance: 220, svgX: 340, svgY: 35 },
];

type LearningRatePreset = "SLOW" | "OPTIMAL" | "EXPLOSIVE";

const LR_CONFIG: Record<LearningRatePreset, { label: string; alpha: number; tag: string }> = {
  SLOW: { label: "Slow (α = 0.02)", alpha: 0.02, tag: "Safe but crawls" },
  OPTIMAL: { label: "Optimal (α = 0.12)", alpha: 0.12, tag: "Smooth descent" },
  EXPLOSIVE: { label: "Explosive (α = 1.30)", alpha: 1.30, tag: "Causes overshoot" },
};

// Parameter weight w: w* = 1.0 (Optimal best-fit line)
// Initial bad state: w = -1.2 (flat horizontal line with massive loss)
const OPTIMAL_W = 1.0;
const INITIAL_W = -1.2;

const calculateLoss = (w: number) => {
  return 240 * Math.pow(w - OPTIMAL_W, 2) + 12.5;
};

// SVG line coordinates based on weight w
const getLineEndpoints = (w: number) => {
  const t = (w + 1.2) / (OPTIMAL_W + 1.2);
  const clampedT = Math.max(-0.6, Math.min(2.2, t));
  const yStart = 70 + clampedT * (205 - 70);
  const yEnd = 70 + clampedT * (15 - 70);
  return { x1: 40, y1: yStart, x2: 440, y2: yEnd };
};

const QUIZ_DATA = {
  question: "In Machine Learning, what does 'Gradient Descent' actually calculate to train the model?",
  options: [
    "It downloads pre-written answers from human programmers over the internet.",
    "It measures the slope of the error curve and takes steps downhill to reach the minimum loss.",
    "It generates random numbers until one accidentally matches the data.",
    "It increases the computer's CPU clock speed to make calculations run faster."
  ],
  correct: 1,
  explanation: "Correct! Gradient Descent is an optimization algorithm: it calculates the slope (gradient) of the Loss function and adjusts model weights downhill in small steps until prediction error is as close to zero as possible."
};

export default function MachineLearningTraining9() {
  const { reportComplete } = useLMSBridge();
  const { playPop, playError, playSuccess, playChime } = useLabAudio();

  // ── STRICT STAGE STATE MACHINE (1 through 6) ──
  // Stage 1: First Step (Inspect initial error -> Take 1 step)
  // Stage 2: Overshoot Crash (Select Explosive rate -> Step to trigger divergence)
  // Stage 3: Understand Why (Post-mortem explanation -> Switch to Optimal)
  // Stage 4: Auto-Train to Global Minimum
  // Stage 5: Test Inference (Tap 70 mph unseen test point)
  // Stage 6: Concept Assessment Quiz
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Model Parameter State
  const [w, setW] = useState(INITIAL_W);
  const [learningRate, setLearningRate] = useState<LearningRatePreset>("OPTIMAL");
  const [epoch, setEpoch] = useState(0);
  const [isAutoTraining, setIsAutoTraining] = useState(false);
  const [isOvershot, setIsOvershot] = useState(false);
  const [hasTestedInference, setHasTestedInference] = useState(false);

  // History ledger for loss tracking
  const [lossHistory, setLossHistory] = useState<Array<{ epoch: number; loss: number; note: string }>>([
    { epoch: 0, loss: calculateLoss(INITIAL_W), note: "Initial Random Guess" }
  ]);

  // Concept Assessment Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  const currentLoss = calculateLoss(w);
  const isOptimal = Math.abs(w - OPTIMAL_W) < 0.08;

  // ── STAGE-GATED STEP FUNCTION ──
  const handleStepDescent = useCallback(() => {
    // STAGE 1: FIRST STEP
    if (currentStage === 1) {
      playPop();
      const newW = -0.35; // One clean step downhill
      setW(newW);
      setEpoch(1);
      const newLoss = calculateLoss(newW);
      setLossHistory(prev => [
        { epoch: 1, loss: newLoss, note: "First Step Downhill" },
        ...prev
      ]);
      setCurrentStage(2); // Automatically advance to Stage 2
      return;
    }

    // STAGE 2: THE OVERSHOOT CRASH
    if (currentStage === 2) {
      playError();
      setIsOvershot(true);
      const newW = 2.45; // Jump completely across the valley
      setW(newW);
      setEpoch(2);
      const newLoss = calculateLoss(newW);
      setLossHistory(prev => [
        { epoch: 2, loss: newLoss, note: "⚠️ OVERSHOOT DIVERGENCE!" },
        ...prev
      ]);
      setCurrentStage(3); // Advance to Stage 3 (Understand Why)
      return;
    }

    // STAGE 4: MANUAL OR AUTO STEP
    if (currentStage === 4) {
      playPop();
      const stepMultiplier = learningRate === "SLOW" ? 0.15 : 0.42;
      const newW = w + (OPTIMAL_W - w) * stepMultiplier;
      setW(newW);
      setEpoch(prev => prev + 1);

      const newLoss = calculateLoss(newW);
      const reachedMin = Math.abs(newW - OPTIMAL_W) < 0.08;
      const note = reachedMin ? "✓ Converged at Minimum!" : `Step (Loss: ${Math.round(newLoss)})`;
      setLossHistory(prev => [
        { epoch: prev.length, loss: newLoss, note },
        ...prev.slice(0, 3)
      ]);

      if (reachedMin) {
        setIsAutoTraining(false);
        setW(OPTIMAL_W);
        playSuccess();
        playChime();
        setCurrentStage(5); // Advance to Stage 5 (Test Inference)
      }
    }
  }, [currentStage, learningRate, w, playError, playPop, playSuccess, playChime]);

  // Auto-Train Continuous Loop (Only active during Stage 4)
  useEffect(() => {
    if (!isAutoTraining || currentStage !== 4) return;

    if (Math.abs(w - OPTIMAL_W) < 0.08 || epoch >= 10) {
      setIsAutoTraining(false);
      setW(OPTIMAL_W);
      playSuccess();
      playChime();
      setCurrentStage(5); // Advance to Stage 5
      return;
    }

    const timer = setTimeout(() => {
      handleStepDescent();
    }, 400);

    return () => clearTimeout(timer);
  }, [isAutoTraining, currentStage, w, epoch, handleStepDescent, playSuccess, playChime]);

  // STAGE 3 RECOVERY ACTION
  const handleRecoverFromOvershoot = () => {
    playPop();
    setLearningRate("OPTIMAL");
    setIsOvershot(false);
    setW(0.15); // Return to a safe downhill position
    setLossHistory(prev => [
      { epoch: prev.length, loss: calculateLoss(0.15), note: "Recovered: Optimal Rate" },
      ...prev.slice(0, 3)
    ]);
    setCurrentStage(4); // Advance to Stage 4 (Auto-Train)
  };

  // STAGE 5 INFERENCE ACTION
  const handleTestInference = () => {
    if (currentStage < 5) return;
    playSuccess();
    setHasTestedInference(true);
    setCurrentStage(6); // Advance to Stage 6 (Quiz)
  };

  const handleReset = () => {
    setCurrentStage(1);
    setW(INITIAL_W);
    setLearningRate("OPTIMAL");
    setEpoch(0);
    setIsAutoTraining(false);
    setIsOvershot(false);
    setHasTestedInference(false);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizError(false);
    setLossHistory([
      { epoch: 0, loss: calculateLoss(INITIAL_W), note: "Initial Random Guess" }
    ]);
  };

  const handleAnswerQuiz = (idx: number) => {
    setSelectedOption(idx);
    setQuizError(false);
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null) return;
    if (selectedOption === QUIZ_DATA.correct) {
      setQuizSubmitted(true);
      setQuizError(false);
      playSuccess();
      playChime();
      reportComplete({ points: 100, labId: "machinelearningtraining9" });
    } else {
      setQuizError(true);
      playError();
    }
  };

  // Line endpoints for SVG
  const lineCoords = getLineEndpoints(w);

  // Compute SVG coordinates of Marble on the Parabola J(w)
  const marbleX = Math.max(45, Math.min(435, 240 + (w - OPTIMAL_W) * 110));
  const marbleY = Math.max(20, Math.min(94, 92 - 0.0019 * Math.pow(marbleX - 240, 2)));

  // STAGE-SPECIFIC MISSION INSTRUCTIONS
  const getStageMissionText = () => {
    switch (currentStage) {
      case 1:
        return "Step 1 of 6: Inspect the high initial error springs, then click [Take First Step] to begin.";
      case 2:
        return "Step 2 of 6: Switch Learning Rate to 'Explode (1.30)' and step to witness an Overshoot Crash!";
      case 3:
        return "Step 3 of 6: Overshoot Crash! Click [Fix: Switch to Optimal Rate] to stabilize.";
      case 4:
        return "Step 4 of 6: Now click [⚡ Auto-Train Model] to guide the model into the Global Minimum.";
      case 5:
        return "Step 5 of 6: Tap the pulsing pink 70 mph point on the graph to test braking prediction.";
      case 6:
        return quizSubmitted 
          ? "All Steps Complete! Model Trained & Concept Certified 100/100."
          : "Step 6 of 6: Complete the Concept Assessment Quiz to finalize your certification.";
    }
  };

  return (
    <LabShell
      labId="machinelearningtraining9"
      title="Supervised ML (Gradient Descent)"
      instruction="AI models don't 'think'—they minimize error! Guide the model down the Loss Parabola by tuning learning rates until the prediction line fits the data."
      theme="ocean"
      compact={true}
      onReset={handleReset}
      navExtra={
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-sky-100/80 shadow-xs text-xs font-bold text-sky-800">
            <span>L36 • Artificial Intelligence</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-sky-100/80 shadow-xs text-xs font-bold text-sky-800">
            <Timer size={14} className="text-sky-600" />
            <span>Step {currentStage}/6</span>
          </div>
        </div>
      }
    >
      <Celebration 
        isActive={quizSubmitted} 
        message="AI Engineer Certified! You mastered Gradient Descent: balancing learning rates to guide models down the loss landscape without overshooting into divergence."
        onReplay={handleReset}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-1.5 sm:gap-2 max-w-7xl mx-auto overflow-hidden">
        
        {/* ── Top Pedagogical Progress Strip (Explicit Step Stepper) ── */}
        <div className="shrink-0 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3 py-1.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 shrink-0">
              <Compass size={13} className="text-indigo-600" />
              <span>Mission Stepper</span>
            </div>
            <span className="text-xs font-bold text-slate-800 truncate">
              {getStageMissionText()}
            </span>
          </div>

          {/* 6 Sequential Step Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {[
              { num: 1, label: "First Step" },
              { num: 2, label: "Overshoot Crash" },
              { num: 3, label: "Understand" },
              { num: 4, label: "Auto-Train" },
              { num: 5, label: "Inference" },
              { num: 6, label: "Quiz" },
            ].map((s) => {
              const isDone = currentStage > s.num || (s.num === 6 && quizSubmitted);
              const isCurrent = currentStage === s.num && !(s.num === 6 && quizSubmitted);

              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    isDone
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : isCurrent
                      ? "bg-indigo-600 text-white shadow-xs animate-pulse"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                  title={`Step ${s.num}: ${s.label}`}
                >
                  {isDone ? <CheckCircle2 size={11} className="text-emerald-600" /> : <span>{s.num}</span>}
                  <span className="hidden md:inline">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Interactive Layout Grid ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5 overflow-hidden">
          
          {/* LEFT PANEL: Dual Visualizer (Feature Space + Loss Landscape) */}
          <div className={`lg:col-span-7 bg-white/95 backdrop-blur border border-slate-200/90 rounded-2xl shadow-sm flex flex-col relative overflow-hidden min-h-0 transition-all ${
            isOvershot ? "animate-shake border-rose-400" : ""
          }`}>
            
            {/* Precision Graph Grid Background */}
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none" 
              style={{ 
                backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)", 
                backgroundSize: "24px 24px" 
              }} 
            />

            {/* Sub-Header: Telemetry Status */}
            <div className="shrink-0 px-3 py-1.5 flex justify-between items-center z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-700">
                  <Activity size={13} className="text-indigo-600" />
                  <span>Feature Space: Vehicle Speed vs. Braking Distance</span>
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Line Model: y = {(w * 3.4).toFixed(1)}x + {(w * 25).toFixed(0)}
              </div>
            </div>

            {/* TOP HALF (60%): Feature Space Scatter Plot & Regression Line */}
            <div className="flex-1 relative min-h-0 px-2 pt-1 pb-1">
              <svg viewBox="0 0 460 210" className="w-full h-full" preserveAspectRatio="none">
                {/* Coordinate Axes */}
                <line x1="35" y1="195" x2="445" y2="195" stroke="#94a3b8" strokeWidth="2" />
                <line x1="35" y1="15" x2="35" y2="195" stroke="#94a3b8" strokeWidth="2" />
                
                {/* Axis Tick Labels */}
                <text x="440" y="206" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="end">Speed (mph) →</text>
                <text x="32" y="14" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="end">Braking Distance (ft) ↑</text>
                
                {/* Speed Grid Ticks */}
                {[20, 30, 40, 50, 60].map((spd, i) => (
                  <g key={spd} transform={`translate(${60 + i * 70}, 195)`}>
                    <line y2="4" stroke="#94a3b8" strokeWidth="1.5" />
                    <text y="12" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">{spd}</text>
                  </g>
                ))}

                {/* Vertical Residual Error Springs */}
                {TRAINING_DATA.map((pt) => {
                  const lineT = (pt.svgX - lineCoords.x1) / (lineCoords.x2 - lineCoords.x1);
                  const predY = lineCoords.y1 + lineT * (lineCoords.y2 - lineCoords.y1);
                  const errDist = Math.abs(pt.svgY - predY);
                  const isGood = errDist < 16;
                  const isCritical = errDist > 45;

                  return (
                    <g key={pt.id}>
                      <line 
                        x1={pt.svgX} 
                        y1={pt.svgY} 
                        x2={pt.svgX} 
                        y2={predY} 
                        stroke={isGood ? "#10b981" : isCritical ? "#f43f5e" : "#f59e0b"} 
                        strokeWidth={isGood ? 1.5 : 2.5}
                        strokeDasharray={isGood ? "2 2" : "3 3"} 
                      />
                      {!isGood && (
                        <circle cx={pt.svgX} cy={predY} r="2.5" fill="#f43f5e" />
                      )}
                    </g>
                  );
                })}

                {/* The AI Prediction Line (Laser Cobalt Blue) */}
                <motion.line 
                  x1={lineCoords.x1} 
                  y1={lineCoords.y1} 
                  x2={lineCoords.x2} 
                  y2={lineCoords.y2} 
                  stroke="#2563eb" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  initial={false}
                  animate={{ x1: lineCoords.x1, y1: lineCoords.y1, x2: lineCoords.x2, y2: lineCoords.y2 }}
                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                />

                {/* Ground Truth Training Points (Amethyst Violet) */}
                {TRAINING_DATA.map((pt) => (
                  <g key={pt.id} transform={`translate(${pt.svgX}, ${pt.svgY})`}>
                    <circle r="7.5" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" className="shadow-md" />
                    <circle r="2.5" fill="#ffffff" />
                  </g>
                ))}

                {/* Stage 5: Unseen 70 mph Test Point */}
                {currentStage >= 5 && (
                  <g 
                    transform="translate(410, 30)" 
                    onClick={handleTestInference}
                    className="cursor-pointer group"
                  >
                    {!hasTestedInference && (
                      <circle r="14" fill="#ec4899" fillOpacity="0.25" className="animate-ping" />
                    )}
                    <circle r="8.5" fill="#ec4899" stroke="#ffffff" strokeWidth="2" />
                    <text y="-12" fill="#be185d" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {hasTestedInference ? "✓ Test Prediction: 250 ft (Safe Stop)" : "Tap to Predict (70 mph)"}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* BOTTOM HALF (40%): Parameter Loss Landscape J(w) */}
            <div className="shrink-0 h-28 sm:h-32 bg-slate-50/90 border-t border-slate-200 relative flex flex-col justify-between px-3 py-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-1 uppercase tracking-wider text-slate-500 font-black">
                  <TrendingDown size={12} className="text-indigo-600" />
                  <span>Loss Landscape: J(w) Valley</span>
                </span>
                <span className={isOptimal ? "text-emerald-600 font-black" : "text-slate-500"}>
                  {isOptimal ? "✓ Settled in Global Minimum!" : "Rolling downhill toward minimum error"}
                </span>
              </div>

              {/* Parabolic Loss Curve SVG */}
              <div className="relative w-full h-20">
                <svg viewBox="0 0 480 110" className="w-full h-full" preserveAspectRatio="none">
                  <path 
                    d="M 40,20 Q 240,165 440,20" 
                    fill="none" 
                    stroke="#94a3b8" 
                    strokeWidth="3" 
                  />
                  
                  {/* Glowing Minimum Target Zone */}
                  <circle cx="240" cy="92" r="14" fill="#10b981" fillOpacity="0.2" />
                  <circle cx="240" cy="92" r="5" fill="#10b981" />
                  <text x="240" y="106" fill="#047857" fontSize="8" fontWeight="bold" textAnchor="middle">
                    Min Error (J*)
                  </text>

                  {/* The Physical Model Marble */}
                  <motion.g
                    initial={false}
                    animate={{ x: marbleX, y: marbleY }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  >
                    <circle r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="shadow-lg" />
                    <circle r="3" fill="#ffffff" />
                  </motion.g>
                </svg>

                {/* Overshoot Divergence Warning Badge */}
                {isOvershot && (
                  <div className="absolute inset-0 bg-rose-50/95 backdrop-blur-xs flex items-center justify-center rounded-lg border border-rose-300 gap-2">
                    <AlertTriangle size={15} className="text-rose-600 animate-bounce shrink-0" />
                    <span className="text-[11px] font-black text-rose-800">
                      OVERSHOOT DIVERGENCE! Step jumped past the valley floor.
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Context Chip */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-200/80 pt-1">
                <span>Weight w: {w.toFixed(2)} (Optimal = 1.00)</span>
                <span>Calculus Principle: Gradient = Slope of Loss Curve</span>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Stage-Gated AI Hyperparameter Dashboard */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between p-2.5 sm:p-3 min-h-0 overflow-hidden">
            
            {/* 1. Telemetry Card: Mean Squared Error (Loss) & Epoch */}
            <div className="shrink-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3 shadow-md border border-indigo-900/50 relative overflow-hidden">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <Brain size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Mean Squared Error (Loss)</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400">Target: J &lt; 15</span>
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <div className={`text-3xl font-black font-mono tracking-tight transition-colors ${
                  currentLoss > 400 ? "text-rose-400" : currentLoss > 50 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {Math.round(currentLoss)}
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${
                    isOptimal ? "text-emerald-400" : "text-slate-400"
                  }`}>
                    {isOptimal ? "✓ Minimum Reached" : `Epoch ${epoch}/10`}
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar of Loss Reduction */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${
                    currentLoss > 400 ? "bg-rose-500" : currentLoss > 50 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(4, Math.min(100, (1 - (currentLoss - 12.5) / 1200) * 100))}%` }}
                />
              </div>
            </div>

            {/* 2. Hyperparameter Controls: Stage-Gated Learning Rate & Actions */}
            <div className="shrink-0 flex flex-col gap-1.5 my-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 px-0.5">
                <span className="flex items-center gap-1 font-black uppercase tracking-wider text-slate-500">
                  <Sliders size={11} className="text-indigo-600" />
                  <span>Learning Rate (Step Size α)</span>
                </span>
                <span className="text-indigo-700 font-mono text-[9px]">{LR_CONFIG[learningRate].tag}</span>
              </div>

              {/* 3 Preset Buttons (Gated by Stage) */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                {(["SLOW", "OPTIMAL", "EXPLOSIVE"] as LearningRatePreset[]).map((preset) => {
                  const isSelected = learningRate === preset;
                  const isAllowed = 
                    (currentStage === 1 && preset === "OPTIMAL") ||
                    (currentStage === 2) ||
                    (currentStage >= 3 && preset !== "EXPLOSIVE");

                  return (
                    <button
                      key={preset}
                      disabled={!isAllowed}
                      onClick={() => {
                        playPop();
                        setLearningRate(preset);
                        setIsOvershot(false);
                      }}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all text-center truncate ${
                        isSelected 
                          ? (preset === "EXPLOSIVE" ? "bg-rose-600 text-white shadow-xs" : "bg-white text-slate-800 shadow-xs border border-slate-200") 
                          : isAllowed ? "text-slate-600 hover:text-slate-900" : "text-slate-300 cursor-not-allowed"
                      } ${currentStage === 2 && preset === "EXPLOSIVE" && !isSelected ? "ring-2 ring-rose-500 animate-pulse" : ""}`}
                    >
                      {preset === "SLOW" ? "Slow (0.02)" : preset === "OPTIMAL" ? "Optimal (0.12)" : "Explode (1.30)"}
                    </button>
                  );
                })}
              </div>

              {/* STAGE-AWARE PRIMARY ACTION BUTTON */}
              <div className="pt-0.5">
                {currentStage === 1 && (
                  <button
                    onClick={handleStepDescent}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 animate-pulse"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Take First Descent Step (Step 1 of 6)</span>
                  </button>
                )}

                {currentStage === 2 && (
                  <button
                    onClick={handleStepDescent}
                    disabled={learningRate !== "EXPLOSIVE"}
                    className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 ${
                      learningRate === "EXPLOSIVE"
                        ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    <AlertTriangle size={13} />
                    <span>{learningRate === "EXPLOSIVE" ? "Step with Explosive Rate (Step 2 of 6)" : "Select 'Explode (1.30)' Above"}</span>
                  </button>
                )}

                {currentStage === 3 && (
                  <button
                    onClick={handleRecoverFromOvershoot}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 animate-pulse"
                  >
                    <ArrowRight size={13} />
                    <span>Fix: Switch to Optimal Rate (Step 3 of 6)</span>
                  </button>
                )}

                {currentStage === 4 && (
                  <button
                    onClick={() => setIsAutoTraining(true)}
                    disabled={isAutoTraining}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 animate-pulse"
                  >
                    <Zap size={13} fill="currentColor" />
                    <span>{isAutoTraining ? "Auto-Training..." : "⚡ Auto-Train Model to Minimum (Step 4 of 6)"}</span>
                  </button>
                )}

                {currentStage === 5 && (
                  <button
                    onClick={handleTestInference}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 animate-pulse"
                  >
                    <Sparkles size={13} />
                    <span>Tap 70 mph Point on Graph (Step 5 of 6)</span>
                  </button>
                )}

                {currentStage === 6 && (
                  <div className="w-full py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-[11px] font-bold text-center">
                    {quizSubmitted ? "✓ Model Verified 100/100" : "Complete Quiz Below to Finish (Step 6 of 6)"}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Lower Section: Stage-Driven Loss Ledger OR Concept Assessment Quiz */}
            {currentStage < 6 ? (
              
              // STEP LOSS REDUCTION LEDGER
              <div className="flex-1 flex flex-col justify-between p-2.5 bg-slate-50/90 border border-slate-200 rounded-xl font-mono text-[10px] sm:text-[11px] min-h-0 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-black text-slate-700 flex items-center gap-1 font-sans">
                    <Target size={12} className="text-slate-500" />
                    Gradient Descent Trajectory
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans font-bold">LIVE HISTORY</span>
                </div>

                <div className="flex flex-col gap-1 py-0.5">
                  {lossHistory.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-600 text-[10px]">
                      <span>{item.note}:</span>
                      <span className={`font-bold ${item.loss > 400 ? "text-rose-600 font-black" : item.loss < 50 ? "text-emerald-600" : "text-slate-800"}`}>
                        J = {Math.round(item.loss)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stage 3 Post-Mortem Card */}
                {currentStage === 3 ? (
                  <div className="mt-1 p-2 rounded-lg bg-rose-100 border border-rose-300 text-rose-950 text-[10px] font-sans font-medium leading-tight">
                    <div className="font-black text-rose-900 flex items-center gap-1 mb-0.5">
                      <AlertTriangle size={12} className="text-rose-600" />
                      <span>The Overshoot Dilemma:</span>
                    </div>
                    When α is too large, the mathematical step leaps completely over the valley minimum and lands high on the opposite cliff!
                  </div>
                ) : currentStage === 5 ? (
                  <div className="mt-1 p-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 text-[10px] font-sans font-medium">
                    ✓ Global minimum reached! Tap the pink point on the graph to test your trained model.
                  </div>
                ) : (
                  <div className="mt-1 p-1 rounded bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-[9px] font-sans font-semibold text-center">
                    Follow the stepper above to experience learning, divergence, and convergence.
                  </div>
                )}
              </div>

            ) : (

              // STAGE 6: CONCEPT ASSESSMENT CARD
              <div className="flex-1 flex flex-col justify-between p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl min-h-0 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-200/80">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5 font-sans">
                    <HelpCircle size={13} className="text-indigo-600" />
                    <span>Concept Assessment</span>
                  </span>
                  {quizSubmitted ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Passed 100/100
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Final Step
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-bold text-slate-800 py-0.5 leading-snug">
                  {QUIZ_DATA.question}
                </p>

                <div className="flex flex-col gap-1 my-auto">
                  {QUIZ_DATA.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerQuiz(idx)}
                        disabled={quizSubmitted}
                        className={`text-left text-[10px] p-1.5 rounded-lg border transition-all leading-tight ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/50"
                        } ${quizSubmitted ? "opacity-75 cursor-default" : ""}`}
                      >
                        <span className="font-mono mr-1">{String.fromCharCode(65 + idx)})</span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {quizError && (
                  <div className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 p-1 rounded">
                    Incorrect. Gradient descent calculates the slope of the error curve to take steps downhill!
                  </div>
                )}

                {quizSubmitted && (
                  <div className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 p-1.5 rounded leading-tight">
                    {QUIZ_DATA.explanation}
                  </div>
                )}

                {!quizSubmitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedOption === null}
                    className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[11px] font-black uppercase tracking-wider shadow-xs transition-all active:scale-98 mt-1"
                  >
                    Verify Answer & Complete Lab
                  </button>
                )}
              </div>

            )}

          </div>
        </div>

      </div>
    </LabShell>
  );
}
