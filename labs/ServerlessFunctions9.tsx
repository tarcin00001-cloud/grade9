"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Server, Zap, Users, AlertTriangle, FileText, CheckCircle2, 
  Play, RotateCcw, Activity, HelpCircle, Compass, Timer, 
  ArrowRight, Cpu
} from "lucide-react";
import LabShell from "@/components/LabShell";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";

type Architecture = "MONOLITH" | "SERVERLESS";
type SimState = "IDLE" | "RUNNING" | "MONOLITH_FAILED" | "SERVERLESS_SUCCESS";

const TOTAL_TICKS = 15;
const START_BUDGET = 50.00;
const MONO_COST_PER_TICK = 4.00;
const MONO_CAPACITY = 5;
const SERV_COST_PER_REQ = 0.15;

// Standardized 15-second benchmark traffic curve (0 to 14 seconds)
const getTrafficForTick = (tick: number) => {
  if (tick >= 5 && tick <= 9) return 15; // Viral Traffic Spike!
  return 1; // Idle traffic
};

interface Packet {
  id: string;
  status: "success" | "dropped";
  arcOffset: number;
}

const QUIZ_DATA = {
  question: "Why did Serverless cost $0.00 during idle periods, while the Monolith lost over $20.00?",
  options: [
    "Serverless runs on slower, cheaper computers that consume less power.",
    "Serverless only spins up code when triggered by an event, so you never pay for idle hardware.",
    "Cloud providers offer free unlimited servers for the first 15 seconds.",
    "The Monolith server had a hardware virus that drained cryptocurrency."
  ],
  correct: 1,
  explanation: "Correct! Traditional servers bill you 24/7 for dedicated capacity even when 0 users visit. Serverless (Lambda) executes code on-demand and immediately terminates, costing exactly $0.00 when idle!"
};

export default function ServerlessFunctions9() {
  const { reportComplete } = useLMSBridge();
  const { playPop, playError, playSuccess, playChime } = useLabAudio();

  // Core Simulation State
  const [architecture, setArchitecture] = useState<Architecture>("MONOLITH");
  const [simState, setSimState] = useState<SimState>("IDLE");
  const [tick, setTick] = useState(0);
  const [manualSurge, setManualSurge] = useState(0);
  
  // Financial & Metrics State
  const [budget, setBudget] = useState(START_BUDGET);
  const [reqProcessed, setReqProcessed] = useState(0);
  const [reqDropped, setReqDropped] = useState(0);
  const [costIdle, setCostIdle] = useState(0);
  const [costCompute, setCostCompute] = useState(0);

  // Animation State
  const [activePackets, setActivePackets] = useState<Packet[]>([]);
  const [activeLambdas, setActiveLambdas] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  // Lab Progression Steps
  const [steps, setSteps] = useState({
    tryMonolith: false,
    monolithFailed: false,
    switchedServerless: false,
    serverlessSuccess: false,
    passedQuiz: false,
  });

  // Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  // Reset manual surge after tick
  useEffect(() => {
    if (manualSurge > 0) {
      const t = setTimeout(() => setManualSurge(0), 1000);
      return () => clearTimeout(t);
    }
  }, [manualSurge]);

  // Main Simulation Loop
  useEffect(() => {
    if (simState !== "RUNNING") return;

    const timer = setTimeout(() => {
      // Check for end of simulation or budget exhaustion
      if (tick >= TOTAL_TICKS || budget <= 0) {
        if (architecture === "MONOLITH") {
          setSimState("MONOLITH_FAILED");
          setSteps(prev => ({ ...prev, tryMonolith: true, monolithFailed: true }));
          playError();
        } else {
          setSimState("SERVERLESS_SUCCESS");
          setSteps(prev => ({ ...prev, serverlessSuccess: true }));
          playSuccess();
        }
        return;
      }

      const rawTraffic = getTrafficForTick(tick) + manualSurge;
      let newProcessed = 0;
      let newDropped = 0;
      let newIdleCost = 0;
      let newComputeCost = 0;

      if (architecture === "MONOLITH") {
        newIdleCost = MONO_COST_PER_TICK;
        newProcessed = Math.min(rawTraffic, MONO_CAPACITY);
        newDropped = Math.max(0, rawTraffic - MONO_CAPACITY);
        
        if (newDropped > 0) {
          setIsShaking(true);
          playError();
          setTimeout(() => setIsShaking(false), 350);
        } else {
          playPop();
        }
      } else {
        // SERVERLESS (Lambda)
        newProcessed = rawTraffic;
        newDropped = 0;
        newComputeCost = rawTraffic * SERV_COST_PER_REQ;
        setActiveLambdas(rawTraffic);
        playPop();
      }

      // Financial balance updates
      const totalTickCost = newIdleCost + newComputeCost;
      setBudget(prev => Math.max(0, prev - totalTickCost));
      setCostIdle(prev => prev + newIdleCost);
      setCostCompute(prev => prev + newComputeCost);
      setReqProcessed(prev => prev + newProcessed);
      setReqDropped(prev => prev + newDropped);

      // Spawn visual packet dots
      const packets: Packet[] = [];
      const packetRenderCount = Math.min(newProcessed, 8);
      for (let i = 0; i < packetRenderCount; i++) {
        packets.push({ id: `p-${tick}-${i}`, status: "success", arcOffset: (i - packetRenderCount / 2) * 12 });
      }
      const dropRenderCount = Math.min(newDropped, 6);
      for (let i = 0; i < dropRenderCount; i++) {
        packets.push({ id: `d-${tick}-${i}`, status: "dropped", arcOffset: (i - dropRenderCount / 2) * 16 });
      }
      setActivePackets(packets);

      // Increment simulation tick
      setTick(prev => prev + 1);

    }, 1000);

    return () => clearTimeout(timer);
  }, [simState, tick, budget, architecture, manualSurge, playError, playPop, playSuccess]);

  // Clear lambdas quickly
  useEffect(() => {
    if (activeLambdas > 0 && simState === "RUNNING") {
      const t = setTimeout(() => setActiveLambdas(0), 650);
      return () => clearTimeout(t);
    }
  }, [activeLambdas, simState]);

  const handleStartSimulation = () => {
    setSimState("RUNNING");
    setTick(0);
    setBudget(START_BUDGET);
    setReqProcessed(0);
    setReqDropped(0);
    setCostIdle(0);
    setCostCompute(0);
    setActivePackets([]);
    setActiveLambdas(0);
    setManualSurge(0);
    if (architecture === "MONOLITH") {
      setSteps(prev => ({ ...prev, tryMonolith: true }));
    }
  };

  const handleReset = () => {
    setArchitecture("MONOLITH");
    setSimState("IDLE");
    setTick(0);
    setBudget(START_BUDGET);
    setReqProcessed(0);
    setReqDropped(0);
    setCostIdle(0);
    setCostCompute(0);
    setActivePackets([]);
    setActiveLambdas(0);
    setManualSurge(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizError(false);
    setSteps({
      tryMonolith: false,
      monolithFailed: false,
      switchedServerless: false,
      serverlessSuccess: false,
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
      reportComplete({ points: 100, labId: "serverlessfunctions9" });
    } else {
      setQuizError(true);
      playError();
    }
  };

  // UI Metrics Helpers
  const currentTraffic = simState === "RUNNING" ? getTrafficForTick(tick) + manualSurge : 0;
  const isSpike = currentTraffic > 5;
  const currentSlotsFilled = architecture === "MONOLITH" && simState === "RUNNING" 
    ? Math.min(MONO_CAPACITY, currentTraffic) 
    : 0;

  const completedCount = 
    (steps.tryMonolith ? 1 : 0) +
    (steps.monolithFailed ? 1 : 0) +
    (steps.switchedServerless ? 1 : 0) +
    (steps.serverlessSuccess ? 1 : 0) +
    (steps.passedQuiz ? 1 : 0);

  return (
    <LabShell
      labId="serverlessfunctions9"
      title="Serverless Computing (Lambda)"
      instruction="Compare traditional fixed servers against on-demand Serverless Functions: pay-for-time vs pay-per-execution!"
      theme="ocean"
      compact={true}
      onReset={handleReset}
      navExtra={
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-sky-100/80 shadow-xs text-xs font-bold text-sky-800">
            <span>L43 • Cloud Architecture</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-sky-100/80 shadow-xs text-xs font-bold text-sky-800">
            <Timer size={14} className="text-sky-600" />
            <span>00:{String(15 - tick).padStart(2, "0")}</span>
          </div>
        </div>
      }
    >
      <Celebration 
        isActive={steps.passedQuiz} 
        message="Cloud Architect Mastered! You proved that Serverless (AWS Lambda) eliminates idle server costs and scales automatically during viral traffic spikes."
        onReplay={handleReset}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-1.5 sm:gap-2 max-w-7xl mx-auto overflow-hidden">
        
        {/* ── Top Pedagogical Progress Strip ── */}
        <div className="shrink-0 bg-white/95 backdrop-blur border border-slate-200/90 rounded-xl px-3 py-1.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500 shrink-0">
              <Compass size={14} className="text-indigo-600" />
              <span>Lab Mission</span>
            </div>
            <span className="text-xs font-bold text-slate-800 truncate">
              {completedCount === 5
                ? "All Missions Complete! Cloud Architecture Mastered."
                : !steps.tryMonolith
                ? "Step 1: Start simulation on Monolith Server to test idle costs ($4/sec)"
                : !steps.monolithFailed
                ? "Step 2: Watch Monolith crash under Viral Traffic Spike (15 req/s > 5 cap)"
                : !steps.switchedServerless
                ? "Step 3: Review the Invoice, then switch to Serverless Architecture"
                : !steps.serverlessSuccess
                ? "Step 4: Run Serverless benchmark to observe zero-idle cost and auto-scaling"
                : "Step 5: Complete the Cloud Economics Concept Assessment"}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {[
              { id: "s1", done: steps.tryMonolith, label: "Monolith" },
              { id: "s2", done: steps.monolithFailed, label: "Traffic Crash" },
              { id: "s3", done: steps.switchedServerless, label: "Switch Lambda" },
              { id: "s4", done: steps.serverlessSuccess, label: "Auto-Scale" },
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
          
          {/* LEFT PANEL: High-Contrast Cloud Infrastructure Canvas */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur border border-slate-200/90 rounded-2xl shadow-sm flex flex-col relative overflow-hidden min-h-0">
            
            {/* Engineering Blueprint Grid Background */}
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none" 
              style={{ 
                backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)", 
                backgroundSize: "20px 20px" 
              }} 
            />

            {/* Canvas Sub-Header & Live Metrics */}
            <div className="shrink-0 p-2 sm:p-2.5 flex justify-between items-center z-10 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  isSpike ? "bg-rose-100 text-rose-700 border border-rose-200 animate-pulse" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  <Activity size={13} className={isSpike ? "text-rose-600" : "text-emerald-600"} />
                  <span>{currentTraffic} Req/Sec {isSpike ? "(Viral Surge!)" : "(Idle)"}</span>
                </div>
              </div>

              {/* Interactive Student Agency: Manual Surge Trigger */}
              <div className="flex items-center gap-2">
                {simState === "RUNNING" && (
                  <button
                    onClick={() => {
                      setManualSurge(prev => prev + 5);
                      playPop();
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold shadow-2xs transition-all active:scale-95"
                    title="Simulate an instant burst of 5 extra user requests"
                  >
                    <Zap size={11} className="text-amber-600" />
                    <span>+5 Surge Burst</span>
                  </button>
                )}
                <div className="text-slate-500 font-mono text-xs font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  {tick}s / 15s
                </div>
              </div>
            </div>

            {/* Canvas Workspace */}
            <div className="flex-1 relative flex items-center justify-between px-4 sm:px-8 py-2 min-h-0">
              
              {/* SOURCE NODE: Global Users */}
              <div className="relative z-10 flex flex-col items-center shrink-0">
                <motion.div 
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 shadow-md transition-all ${
                    isSpike 
                      ? "bg-rose-50 border-rose-400 shadow-rose-200" 
                      : "bg-indigo-50/80 border-indigo-200 shadow-indigo-100"
                  }`}
                  animate={isSpike ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 0.6, repeat: isSpike ? Infinity : 0 }}
                >
                  <Users size={24} className={isSpike ? "text-rose-600" : "text-indigo-600"} />
                </motion.div>
                <span className="mt-1.5 text-[10px] font-black text-slate-700 uppercase tracking-wider">Global Users</span>
                <span className="text-[9px] text-slate-400 font-semibold">{currentTraffic} active clients</span>
              </div>

              {/* FLIGHT PATH: Moving Packets */}
              <div className="absolute left-20 right-40 sm:left-28 sm:right-48 top-0 bottom-0 pointer-events-none z-20">
                <AnimatePresence>
                  {activePackets.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ left: "0%", top: "50%", opacity: 0, scale: 0.6 }}
                      animate={
                        p.status === "success" 
                        ? { left: "100%", top: `calc(50% + ${p.arcOffset}px)`, opacity: [0, 1, 1, 0], scale: 1 }
                        : { left: "70%", top: `calc(50% + ${p.arcOffset + 40}px)`, opacity: [0, 1, 0], scale: [0.6, 1.3, 0], backgroundColor: "#e11d48" }
                      }
                      transition={{ duration: 0.75, ease: "easeOut" }}
                      className={`absolute w-3 h-3 rounded-full flex items-center justify-center shadow-sm ${
                        p.status === "success" 
                          ? (architecture === "MONOLITH" ? "bg-emerald-500 shadow-emerald-200" : "bg-violet-500 shadow-violet-200") 
                          : "bg-rose-600 shadow-rose-300"
                      }`}
                    >
                      {p.status === "dropped" && <span className="text-[7px] font-bold text-white leading-none">✕</span>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* TARGET NODE: Computing Architecture */}
              <div className="relative z-10 w-40 sm:w-48 h-48 sm:h-56 flex items-center justify-center shrink-0">
                {architecture === "MONOLITH" ? (
                  
                  // 1. Traditional Monolith Server Rack
                  <motion.div 
                    className={`w-full h-full rounded-2xl border-2 flex flex-col justify-between p-3 bg-slate-50/95 shadow-md relative transition-all ${
                      isShaking ? "border-rose-500 bg-rose-50/30" : "border-slate-300"
                    }`}
                    animate={isShaking ? { x: [-6, 6, -6, 6, 0] } : {}}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Rack Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Server size={16} className={isShaking ? "text-rose-600" : "text-slate-700"} />
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Monolith</span>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Always On
                      </span>
                    </div>

                    {/* Segmented Hardware Queue / Capacity Meter */}
                    <div className="my-auto flex flex-col gap-1 py-1">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-600">
                        <span className="flex items-center gap-1">
                          <Cpu size={11} className="text-slate-500" />
                          <span>Hardware Slots:</span>
                        </span>
                        <span className={currentSlotsFilled >= 5 ? "text-rose-600 font-black" : "text-slate-800"}>
                          {currentSlotsFilled}/5 Max
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 bg-white p-1 rounded-lg border border-slate-200">
                        {[0, 1, 2, 3, 4].map((slotIdx) => {
                          const isFilled = slotIdx < currentSlotsFilled;
                          return (
                            <div 
                              key={slotIdx}
                              className={`h-4 rounded flex items-center justify-center text-[8px] font-black transition-all ${
                                isFilled 
                                  ? (currentSlotsFilled >= 5 ? "bg-rose-500 text-white shadow-xs" : "bg-emerald-500 text-white") 
                                  : "bg-slate-100 text-slate-300"
                              }`}
                            >
                              {isFilled ? "REQ" : ""}
                            </div>
                          );
                        })}
                      </div>

                      {isShaking && (
                        <div className="text-[9px] font-black text-rose-600 text-center animate-bounce pt-0.5">
                          ⚠️ OVERLOAD: DROPPING {currentTraffic - MONO_CAPACITY} REQ/S!
                        </div>
                      )}
                    </div>

                    {/* Rack Footer Note */}
                    <div className="pt-1.5 border-t border-slate-200 text-center">
                      <span className="text-[9px] font-mono text-slate-500 font-bold block">
                        Rent: $4.00/sec (Always Billed)
                      </span>
                      <span className="text-[8px] text-slate-400">Fixed capacity: 5 req/s</span>
                    </div>
                  </motion.div>

                ) : (

                  // 2. Elastic Serverless (AWS Lambda) Fleet
                  <div className="w-full h-full rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/50 flex flex-col justify-between p-3 relative shadow-inner">
                    
                    {/* Fleet Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-violet-200/80">
                      <div className="flex items-center gap-1.5">
                        <Zap size={16} className="text-violet-600 fill-violet-600" />
                        <span className="text-[11px] font-black text-violet-950 uppercase tracking-tight">AWS Lambda Fleet</span>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        On-Demand
                      </span>
                    </div>

                    {/* Dynamic Lambda Spawns */}
                    <div className="my-auto flex-1 flex flex-col justify-center">
                      {activeLambdas === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-1.5">
                          <span className="text-[11px] font-bold text-violet-700">0 Active MicroVMs</span>
                          <span className="text-[9px] text-slate-500 mt-0.5 font-medium">Idle cost = $0.00 • Zero hardware rent</span>
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-violet-900">
                            <span>Auto-Scaled Fleet:</span>
                            <span className="text-violet-700 font-mono font-black">{activeLambdas} Functions Running</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1 max-h-20 overflow-hidden">
                            {Array.from({ length: Math.min(activeLambdas, 15) }).map((_, i) => (
                              <motion.div
                                key={`lambda-${i}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="h-5 bg-violet-600 rounded flex items-center justify-center shadow-xs text-white"
                                title={`Lambda Instance #${i + 1}`}
                              >
                                <Zap size={11} className="fill-white" />
                              </motion.div>
                            ))}
                          </div>
                          <div className="text-[8px] text-center font-bold text-emerald-600 mt-0.5">
                            ✓ 100% Traffic Processed • 0 Dropped
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fleet Footer Note */}
                    <div className="pt-1.5 border-t border-violet-200/80 text-center">
                      <span className="text-[9px] font-mono text-violet-800 font-bold block">
                        Cost: $0.15 / execution (Zero Idle)
                      </span>
                      <span className="text-[8px] text-slate-500">Auto-scales: 0 → 1,000 instantly</span>
                    </div>
                  </div>

                )}
              </div>

            </div>

            {/* Real-World Industry Context Chip */}
            <div className="shrink-0 px-3 py-1 bg-slate-50 border-t border-slate-200 text-[9px] text-slate-600 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Real-World Tech:</span>
              <span className="truncate">AWS Lambda, Google Cloud Functions, and Azure Functions power Netflix & Spotify.</span>
            </div>
          </div>

          {/* RIGHT PANEL: Zero-Scroll Compact FinTech Dashboard */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between p-2.5 sm:p-3 min-h-0 overflow-hidden">
            
            {/* 1. Ultra-Compact Budget Bar */}
            <div className="shrink-0 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Startup Capital</span>
                <span className="text-[9px] font-semibold text-slate-500">Starting: $50.00</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-black font-mono tracking-tight transition-colors ${
                  budget <= 0 ? "text-rose-600" : budget < 20 ? "text-amber-600" : "text-emerald-600"
                }`}>
                  ${budget.toFixed(2)}
                </div>
              </div>
            </div>

            {/* 2. Architecture Toggle & Simulation Controls */}
            <div className="shrink-0 flex flex-col gap-1.5 my-1">
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    if (simState !== "RUNNING") {
                      setArchitecture("MONOLITH");
                      setSimState("IDLE");
                      setBudget(START_BUDGET);
                    }
                  }}
                  disabled={simState === "RUNNING"}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] font-bold rounded-lg transition-all ${
                    architecture === "MONOLITH" 
                      ? "bg-white text-slate-800 shadow-xs border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Server size={12} className={architecture === "MONOLITH" ? "text-amber-600" : ""} />
                  <span>Monolith Server</span>
                </button>

                <button
                  onClick={() => {
                    if (steps.monolithFailed && simState !== "RUNNING") {
                      setArchitecture("SERVERLESS");
                      setSimState("IDLE");
                      setBudget(START_BUDGET);
                      setSteps(prev => ({ ...prev, switchedServerless: true }));
                    }
                  }}
                  disabled={!steps.monolithFailed || simState === "RUNNING"}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] font-bold rounded-lg transition-all ${
                    architecture === "SERVERLESS" 
                      ? "bg-white text-violet-900 shadow-xs border border-slate-200" 
                      : "text-slate-400"
                  } ${!steps.monolithFailed ? "opacity-40 cursor-not-allowed" : "hover:text-slate-700"}`}
                  title={!steps.monolithFailed ? "Run Monolith benchmark first to unlock Serverless" : ""}
                >
                  <Zap size={12} className={architecture === "SERVERLESS" ? "text-violet-600 fill-violet-600" : ""} />
                  <span>Serverless (Lambda)</span>
                </button>
              </div>

              {/* Action Button: State-Aware Call to Action */}
              {simState === "MONOLITH_FAILED" ? (
                <button
                  onClick={() => {
                    setArchitecture("SERVERLESS");
                    setSimState("IDLE");
                    setBudget(START_BUDGET);
                    setSteps(prev => ({ ...prev, switchedServerless: true }));
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 animate-pulse"
                >
                  <span>Switch to Serverless Architecture</span>
                  <ArrowRight size={13} />
                </button>
              ) : simState === "IDLE" || simState === "SERVERLESS_SUCCESS" ? (
                <button
                  onClick={handleStartSimulation}
                  className={`w-full py-2 rounded-xl text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 ${
                    architecture === "MONOLITH" 
                      ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" 
                      : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20"
                  }`}
                >
                  <Play size={13} fill="currentColor" />
                  <span>Start 15s Benchmark ({architecture === "MONOLITH" ? "Monolith" : "Serverless"})</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2 rounded-xl text-xs font-black text-slate-400 bg-slate-100 uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200"
                >
                  <RotateCcw size={13} className="animate-spin" />
                  <span>Running Benchmark ({tick}s / 15s)...</span>
                </button>
              )}
            </div>

            {/* 3. Lower Dynamic Area: Invoice OR Concept Assessment */}
            {!steps.serverlessSuccess ? (
              
              // LIVE INVOICE CARD (Always fully visible, zero occlusions)
              <div className="flex-1 flex flex-col justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] sm:text-[11px] min-h-0">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <FileText size={12} className="text-slate-500" />
                    Live Cloud Invoice
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans font-semibold">ITEMIZED RECEIPT</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 py-0.5">
                  <span>Traffic Processed:</span>
                  <span className="font-bold text-slate-800">
                    {reqProcessed} reqs {reqDropped > 0 && <span className="text-rose-600">({reqDropped} dropped)</span>}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600 py-0.5">
                  <span className="flex items-center gap-1">
                    24/7 Idle Server Lease:
                    {architecture === "MONOLITH" && simState === "RUNNING" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
                  </span>
                  <span className="text-amber-700 font-bold">-${costIdle.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 py-0.5">
                  <span className="flex items-center gap-1">
                    On-Demand Compute:
                    {architecture === "SERVERLESS" && activeLambdas > 0 && <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping" />}
                  </span>
                  <span className="text-violet-700 font-bold">-${costCompute.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center font-black pt-1 border-t border-slate-200 text-xs">
                  <span className="text-slate-700">TOTAL BILLED:</span>
                  <span className="text-slate-900 font-mono">${(costIdle + costCompute).toFixed(2)}</span>
                </div>

                {/* Inline Failure Callout Note */}
                {simState === "MONOLITH_FAILED" && (
                  <div className="mt-1 p-1.5 rounded bg-rose-100/70 border border-rose-200 text-rose-900 text-[10px] font-sans font-medium flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                    <span>Fixed server rent drained budget to $0.00 while dropping 50 viral requests!</span>
                  </div>
                )}
              </div>

            ) : (

              // STEP 5: CONCEPT ASSESSMENT CARD (Seamlessly takes lower panel with zero scrolling)
              <div className="flex-1 flex flex-col justify-between p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl min-h-0">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-200/80">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
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

                <p className="text-[11px] font-bold text-slate-800 py-1 leading-snug">
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
                    Incorrect. Serverless only charges for execution milliseconds when triggered by an event!
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
