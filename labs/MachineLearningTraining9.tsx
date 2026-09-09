"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Play, RotateCcw, Activity, HelpCircle, Compass, Timer, 
  ArrowRight, Sparkles, AlertTriangle, CheckCircle2, TrendingDown, 
  Target, Sliders, Zap, Check
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

// Unseen Test Point for Stage 7 Inference Task (70 mph -> ~270 ft)
const TEST_POINT = { speed: 70, expectedDistance: 270, svgX: 410, svgY: -10 };

type LearningRatePreset = "SLOW" | "OPTIMAL" | "EXPLOSIVE";

const LR_CONFIG: Record<LearningRatePreset, { label: string; alpha: number; tag: string }> = {
  SLOW: { label: "Slow (α = 0.02)", alpha: 0.02, tag: "Safe but crawls" },
  OPTIMAL: { label: "Optimal (α = 0.12)", alpha: 0.12, tag: "Smooth descent" },
  EXPLOSIVE: { label: "Explosive (α = 1.30)", alpha: 1.30, tag: "Causes overshoot" },
};

// Target optimal parameters: slope m* = 3.6, bias b* = -30
// Parameter weight w represents deviation from optimal: w* = 1.0 (Optimal)
// Initial bad state: w = -1.2 (horizontal line with massive error)
const OPTIMAL_W = 1.0;
const INITIAL_W = -1.2;

const calculateLoss = (w: number) => {
  // Parabolic loss curve: J(w) = 240 * (w - 1.0)^2 + 12.5
  return 240 * Math.pow(w - OPTIMAL_W, 2) + 12.5;
};

// SVG line coordinates based on weight w
const getLineEndpoints = (w: number) => {
  // At w = 1.0: y1 = 200 (at x=40), y2 = 20 (at x=440) -> Line of best fit
  // At w = -1.2: y1 = 70, y2 = 70 -> Flat horizontal line
  const t = (w + 1.2) / (OPTIMAL_W + 1.2); // 0 at initial, 1 at optimal
  const clampedT = Math.max(-0.6, Math.min(2.0, t));
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

  // Model Parameter State
  const [w, setW] = useState(INITIAL_W);
  const [learningRate, setLearningRate] = useState<LearningRatePreset>("OPTIMAL");
  const [epoch, setEpoch] = useState(0);
  const [isAutoTraining, setIsAutoTraining] = useState(false);
  const [isOvershot, setIsOvershot] = useState(false);
  const [hasTestedInference, setHasTestedInference] = useState(false);

  // History ledger for progressive loss tracking
  const [lossHistory, setLossHistory] = useState<Array<{ epoch: number; loss: number; note: string }>>([
    { epoch: 0, loss: calculateLoss(INITIAL_W), note: "Initial Random Guess" }
  ]);

  // Pedagogical Progression Steps
  const [steps, setSteps] = useState({
    inspectedInitial: true,
    tookFirstStep: false,
    overshotCrash: false,
    understoodWhy: false,
    tunedOptimal: false,
    converged: false,
    testedInference: false,
    passedQuiz: false,
  });

  // Concept Assessment Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  const currentLoss = calculateLoss(w);
  const isOptimal = Math.abs(w - OPTIMAL_W) < 0.08;

  // Single Step of Gradient Descent
  const handleStepDescent = useCallback(() => {
    const alpha = LR_CONFIG[learningRate].alpha;

    if (learningRate === "EXPLOSIVE") {
      // Trigger intentional Overshoot Crash (Fail Safely)
      playError();
      setIsOvershot(true);
      const newW = w > OPTIMAL_W ? w + 0.9 : w + 2.4; // Jump across valley
      setW(newW);
      setEpoch(prev => prev + 1);
      const newLoss = calculateLoss(newW);
      setLossHistory(prev => [
        { epoch: prev.length, loss: newLoss, note: "⚠️ OVERSHOOT DIVERGENCE!" },
        ...prev.slice(0, 3)
      ]);
      setSteps(prev => ({ ...prev, overshotCrash: true }));
      return;
    }

    // Normal or Slow Descent step
    playPop();
    setIsOvershot(false);
    
    // Gradient descent step: w_new = w + alpha * 3.2 * (w_opt - w)
    const stepMultiplier = learningRate === "SLOW" ? 0.15 : 0.42;
    const newW = w + (OPTIMAL_W - w) * stepMultiplier;
    setW(newW);
    setEpoch(prev => prev + 1);

    const newLoss = calculateLoss(newW);
    const note = Math.abs(newW - OPTIMAL_W) < 0.08 ? "✓ Converged at Minimum!" : `Step (Loss: ${Math.round(newLoss)})`;
    setLossHistory(prev => [
      { epoch: prev.length, loss: newLoss, note },
      ...prev.slice(0, 3)
    ]);

    setSteps(prev => {
      const updated = { ...prev, tookFirstStep: true };
      if (Math.abs(newW - OPTIMAL_W) < 0.08) {
        updated.converged = true;
      }
      return updated;
    });

    if (Math.abs(newW - OPTIMAL_W) < 0.08) {
      playSuccess();
    }
  }, [w, learningRate, playError, playPop, playSuccess]);

  // Auto-Train Continuous Loop
  useEffect(() => {
    if (!isAutoTraining) return;

    if (Math.abs(w - OPTIMAL_W) < 0.05 || epoch >= 10) {
      setIsAutoTraining(false);
      setW(OPTIMAL_W);
      setSteps(prev => ({ ...prev, converged: true }));
      playSuccess();
      playChime();
      return;
    }

    const timer = setTimeout(() => {
      handleStepDescent();
    }, 450);

    return () => clearTimeout(timer);
  }, [isAutoTraining, w, epoch, handleStepDescent, playSuccess, playChime]);

  const handleReset = () => {
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
    setSteps({
      inspectedInitial: true,
      tookFirstStep: false,
      overshotCrash: false,
      understoodWhy: false,
      tunedOptimal: false,
      converged: false,
      testedInference: false,
      passedQuiz: false,
    });
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
      setSteps(prev => ({ ...prev, passedQuiz: true }));
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
  // Curve domain: x from 40 to 440, center at x = 240
  // w = 1.0 maps to x = 240, y = 92 (bowl bottom)
  const marbleX = Math.max(45, Math.min(435, 240 + (w - OPTIMAL_W) * 110));
  // Parabola height equation: y = 92 - 0.0018 * (x - 240)^2
  const marbleY = Math.max(20, Math.min(94, 92 - 0.0019 * Math.pow(marbleX - 240, 2)));

  const completedCount = 
    (steps.tookFirstStep ? 1 : 0) +
    (steps.overshotCrash ? 1 : 0) +
    (steps.converged ? 1 : 0) +
    (steps.testedInference ? 1 : 0) +
    (steps.passedQuiz ? 1 : 0);

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
            <span>Epoch {epoch}/10</span>
          </div>
        </div>
      }
    >
      <Celebration 
        isActive={steps.passedQuiz} 
        message="AI Engineer Certified! You mastered Gradient Descent: balancing learning rates to guide models down the loss landscape without overshooting into divergence."
        onReplay={handleReset}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-1.5 sm:gap-2 max-w-7xl mx-auto overflow-hidden">
        
        {/* ── Top Pedagogical Progress Strip (7-Stage Journey) ── */}
        <div className="shrink-0 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3 py-1.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 shrink-0">
              <Compass size={13} className="text-indigo-600" />
              <span>Lab Mission</span>
            </div>
            <span className="text-xs font-bold text-slate-800 truncate">
              {completedCount === 5
                ? "All Missions Complete! AI Optimization Mastered."
                : !steps.tookFirstStep
                ? "Step 1: Inspect starting error springs, then click [Step Descent] to take 1 step downhill"
                : !steps.overshotCrash
                ? "Step 2: Switch to 'Explosive (1.30)' Learning Rate and step to witness an Overshoot Crash!"
                : !steps.converged
                ? "Step 3: Switch back to 'Optimal (0.12)' and click [⚡ Auto-Train Model] to find the minimum"
                : !steps.testedInference
                ? "Step 4: Tap the purple 70 mph test point to test autonomous vehicle braking inference"
                : "Step 5: Complete the AI Gradient Descent Concept Assessment"}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {[
              { id: "s1", done: steps.tookFirstStep, label: "First Step" },
              { id: "s2", done: steps.overshotCrash, label: "Overshoot Crash" },
              { id: "s3", done: steps.converged, label: "Global Min" },
              { id: "s4", done: steps.testedInference, label: "Test Inference" },
              { id: "s5", done: steps.passedQuiz, label: "Quiz" },
            ].map((s, idx) => (
              <div
                key={s.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  s.done
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
                title={s.label}
              >
                {s.done ? <CheckCircle2 size={11} className="text-emerald-600" /> : <span>{idx + 1}</span>}
                <span className="hidden md:inline">{s.label}</span>
              </div>
            ))}
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

                {/* Vertical Residual Error Springs (Difference between actual data and prediction line) */}
                {TRAINING_DATA.map((pt) => {
                  // Interpolate Y position on AI prediction line at point's X
                  const lineT = (pt.svgX - lineCoords.x1) / (lineCoords.x2 - lineCoords.x1);
                  const predY = lineCoords.y1 + lineT * (lineCoords.y2 - lineCoords.y1);
                  const errDist = Math.abs(pt.svgY - predY);
                  const isGood = errDist < 16;
                  const isCritical = errDist > 45;

                  return (
                    <g key={pt.id}>
                      {/* Residual Spring Line */}
                      <line 
                        x1={pt.svgX} 
                        y1={pt.svgY} 
                        x2={pt.svgX} 
                        y2={predY} 
                        stroke={isGood ? "#10b981" : isCritical ? "#f43f5e" : "#f59e0b"} 
                        strokeWidth={isGood ? 1.5 : 2.5}
                        strokeDasharray={isGood ? "2 2" : "3 3"} 
                      />
                      
                      {/* Spring Measurement Tick */}
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

                {/* Unseen Test Point for Stage 7 Inference Task */}
                {steps.converged && (
                  <g 
                    transform="translate(410, 30)" 
                    onClick={() => {
                      playSuccess();
                      setHasTestedInference(true);
                      setSteps(prev => ({ ...prev, testedInference: true }));
                    }}
                    className="cursor-pointer group"
                  >
                    <circle r="12" fill="#ec4899" fillOpacity="0.2" className="animate-ping" />
                    <circle r="8.5" fill="#ec4899" stroke="#ffffff" strokeWidth="2" />
                    <text y="-12" fill="#be185d" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {hasTestedInference ? "✓ Test Prediction: 250 ft (Safe)" : "Tap to Predict (70 mph)"}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* BOTTOM HALF (40%): Parameter Loss Landscape J(w) - "Error Mountain" */}
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
                  {/* Parabolic Curve Path */}
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

                  {/* The Physical Model Marble Rolling Downhill */}
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
                  <div className="absolute inset-0 bg-rose-50/90 backdrop-blur-xs flex items-center justify-center rounded-lg border border-rose-300 gap-2">
                    <AlertTriangle size={15} className="text-rose-600 animate-bounce shrink-0" />
                    <span className="text-[11px] font-black text-rose-800">
                      OVERSHOOT DIVERGENCE! Step jumped over the valley floor into high error.
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

          {/* RIGHT PANEL: AI Hyperparameter Tuning Dashboard (Zero Scrollbar Guaranteed) */}
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

            {/* 2. Hyperparameter Controls: Learning Rate & Action Buttons */}
            <div className="shrink-0 flex flex-col gap-1.5 my-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 px-0.5">
                <span className="flex items-center gap-1 font-black uppercase tracking-wider text-slate-500">
                  <Sliders size={11} className="text-indigo-600" />
                  <span>Learning Rate (Step Size α)</span>
                </span>
                <span className="text-indigo-700 font-mono text-[9px]">{LR_CONFIG[learningRate].tag}</span>
              </div>

              {/* 3 Tactile Preset Buttons */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                {(["SLOW", "OPTIMAL", "EXPLOSIVE"] as LearningRatePreset[]).map((preset) => {
                  const isSelected = learningRate === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => {
                        playPop();
                        setLearningRate(preset);
                        setIsOvershot(false);
                        if (preset === "OPTIMAL") {
                          setSteps(prev => ({ ...prev, tunedOptimal: true }));
                        }
                      }}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all text-center truncate ${
                        isSelected 
                          ? (preset === "EXPLOSIVE" ? "bg-rose-600 text-white shadow-xs" : "bg-white text-slate-800 shadow-xs border border-slate-200") 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {preset === "SLOW" ? "Slow (0.02)" : preset === "OPTIMAL" ? "Optimal (0.12)" : "Explode (1.30)"}
                    </button>
                  );
                })}
              </div>

              {/* Main Action CTAs */}
              <div className="flex gap-1.5 pt-0.5">
                <button
                  onClick={handleStepDescent}
                  disabled={isAutoTraining || isOptimal}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Step Descent (1x)</span>
                </button>

                <button
                  onClick={() => setIsAutoTraining(prev => !prev)}
                  disabled={isOptimal}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all active:scale-98 ${
                    isAutoTraining 
                      ? "bg-amber-600 text-white animate-pulse" 
                      : isOptimal 
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                  title="Automatically step descent until minimum loss is reached"
                >
                  <Zap size={13} fill="currentColor" />
                  <span>{isAutoTraining ? "Pausing..." : isOptimal ? "Converged" : "Auto-Train"}</span>
                </button>
              </div>
            </div>

            {/* 3. Lower Section: Loss Ledger OR Concept Assessment Quiz */}
            {!steps.converged ? (
              
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
                      <span className={`font-bold ${item.loss > 400 ? "text-rose-600" : item.loss < 50 ? "text-emerald-600" : "text-slate-800"}`}>
                        J = {Math.round(item.loss)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Overshoot Recovery Callout */}
                {isOvershot ? (
                  <div className="mt-1 p-1.5 rounded-lg bg-rose-100/90 border border-rose-300 text-rose-900 text-[10px] font-sans font-bold flex items-center justify-between gap-1">
                    <span>Overshoot crash! Learning rate too big.</span>
                    <button
                      onClick={() => {
                        setLearningRate("OPTIMAL");
                        setIsOvershot(false);
                        setSteps(prev => ({ ...prev, tunedOptimal: true, understoodWhy: true }));
                        playPop();
                      }}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-black shrink-0"
                    >
                      Fix: Select Optimal α
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 p-1 rounded bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-[9px] font-sans font-semibold text-center">
                    Click &apos;Step Descent&apos; or test &apos;Explosive (1.30)&apos; to explore overshoot.
                  </div>
                )}
              </div>

            ) : (

              // STEP 5: CONCEPT ASSESSMENT CARD (Takes lower panel seamlessly with zero scrolling)
              <div className="flex-1 flex flex-col justify-between p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl min-h-0 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-200/80">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5 font-sans">
                    <HelpCircle size={13} className="text-indigo-600" />
                    <span>Concept Assessment</span>
                  </span>
                  {steps.passedQuiz ? (
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
                        disabled={steps.passedQuiz}
                        className={`text-left text-[10px] p-1.5 rounded-lg border transition-all leading-tight ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/50"
                        } ${steps.passedQuiz ? "opacity-75 cursor-default" : ""}`}
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

                {steps.passedQuiz && (
                  <div className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 p-1.5 rounded leading-tight">
                    {QUIZ_DATA.explanation}
                  </div>
                )}

                {!steps.passedQuiz && (
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
