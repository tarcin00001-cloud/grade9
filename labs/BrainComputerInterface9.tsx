"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Brain,
  Activity,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight,
  Gauge
} from "lucide-react";

type LabStage = 
  | "INTRO"             // Step 1: Learn about skull attenuation & bandwidth bottleneck
  | "RAW_ATTEMPT"       // Step 2: Try with raw surface EEG
  | "DSP_TUNING"        // Step 3-5: Toggle 60Hz filter & dock neural threads
  | "MIND_GRASP"        // Step 6: Trigger tuned neural transmission & robotic grasp
  | "COMPLETED";

export default function BrainComputerInterface9() {
  const { playPop, playSuccess, playZap, playError, playClick, playChime } = useLabAudio();
  const { reportComplete } = useLMSBridge("braincomputerinterface9");

  // State Machine
  const [stage, setStage] = useState<LabStage>("INTRO");
  
  // DSP & Hardware Controls
  const [notchFilter, setNotchFilter] = useState(false);
  const [neuralThreadsDocked, setNeuralThreadsDocked] = useState(false);
  const [spikeThreshold, setSpikeThreshold] = useState(55); // microvolts
  
  // Execution & Live Grasping State
  const [isGrasping, setIsGrasping] = useState(false);
  const [graspSuccess, setGraspSuccess] = useState<boolean | null>(null);
  const [lastAttemptFailed, setLastAttemptFailed] = useState(false);
  const [failReason, setFailReason] = useState("");
  
  // Live Waveform Offset
  const [timeOffset, setTimeOffset] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  
  const [isVictorious, setIsVictorious] = useState(false);

  // Compute live Signal-to-Noise Ratio (SNR)
  const computeSNR = useCallback(() => {
    let snr = 18; // Base raw surface EEG
    if (notchFilter) snr += 24; // +24% with 60Hz filter
    if (neuralThreadsDocked) snr += 54; // +54% with direct cortex threads
    return Math.min(snr, 98);
  }, [notchFilter, neuralThreadsDocked]);

  const currentSNR = computeSNR();

  // Animation Loop for Live Oscilloscope
  useEffect(() => {
    let lastTime = performance.now();
    const render = (time: number) => {
      const delta = time - lastTime;
      setTimeOffset((prev) => prev + delta * 0.003);
      lastTime = time;
      animFrameRef.current = requestAnimationFrame(render);
    };
    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Generate Realistic Multi-Component Neural Oscilloscope Waveform
  const generateWavePath = () => {
    const width = 500;
    const height = 140;
    const centerY = height / 2;
    let path = `M 0 ${centerY} `;

    const hasThreads = neuralThreadsDocked;
    const hasNotch = notchFilter;
    
    // Wave parameters based on hardware state
    const humAmp = hasNotch ? 1.5 : 22; // 60Hz powerline hum
    const skullNoiseAmp = hasThreads ? 2 : 18; // Skull bone attenuation noise
    const baseWaveAmp = hasThreads ? 8 : 16; // Low frequency rhythm
    const spikeRate = isGrasping ? (hasThreads ? 45 : 120) : (hasThreads ? 150 : 250);

    for (let x = 0; x <= width; x += 4) {
      const t = timeOffset * 2.5;
      
      // 1. Biological baseline alpha/beta rhythm (3-12 Hz)
      const baseWave = Math.sin((x * 0.03) + t) * baseWaveAmp;
      
      // 2. 60Hz Powerline Interference (rapid oscillation)
      const hum = Math.sin((x * 0.4) + (t * 4)) * humAmp;
      
      // 3. High-frequency random biological & thermal skull noise
      const noise = (Math.random() - 0.5) * skullNoiseAmp;
      
      // 4. Action Potential Spikes (when grasping or active)
      let spike = 0;
      const spikeCycle = (x + Math.floor(t * 80)) % spikeRate;
      if (spikeCycle < 14) {
        // Characteristic biphasic depolarization/repolarization spike
        const spikePhase = (spikeCycle / 14) * Math.PI;
        spike = -Math.sin(spikePhase) * (hasThreads ? 42 : 18);
      }

      let y = centerY + baseWave + hum + noise + spike;
      // Clamp within display
      y = Math.max(8, Math.min(height - 8, y));
      
      path += `L ${x} ${y} `;
    }
    return path;
  };

  // Handle Grasp Execution
  const executeGrasp = () => {
    if (isGrasping) return;
    playClick();
    setIsGrasping(true);
    setGraspSuccess(null);
    setLastAttemptFailed(false);
    setFailReason("");

    setTimeout(() => {
      // Evaluation based on current tuning
      if (!neuralThreadsDocked && !notchFilter) {
        // Complete failure
        playError();
        setIsGrasping(false);
        setGraspSuccess(false);
        setLastAttemptFailed(true);
        setFailReason("SNR too low (18%). Power line hum and thick skull bone drowned out your brainwaves. The claw dropped the object.");
      } else if (!neuralThreadsDocked && notchFilter) {
        // Partial failure: filtered but skull attenuation too high
        playError();
        setIsGrasping(false);
        setGraspSuccess(false);
        setLastAttemptFailed(true);
        setFailReason("Hum removed, but the thick skull blocked the signal. SNR is only 42%. The claw twitched and dropped the object.");
      } else if (neuralThreadsDocked && !notchFilter) {
        // Marginal: threads are in, but hum causes jitter
        playError();
        setIsGrasping(false);
        setGraspSuccess(false);
        setLastAttemptFailed(true);
        setFailReason("Threads are in, but 60Hz power line noise caused erratic motor jitter. The claw dropped the object.");
      } else {
        // Perfect Tuning! SNR 98%
        playSuccess();
        setIsGrasping(false);
        setGraspSuccess(true);
        setLastAttemptFailed(false);
        
        // Lab Complete!
        setTimeout(() => {
          setStage("COMPLETED");
          setIsVictorious(true);
          reportComplete({ labId: "braincomputerinterface9", points: 100 });
          playChime();
        }, 1800);
      }
    }, 1800);
  };

  const resetLab = () => {
    playPop();
    setStage("INTRO");
    setNotchFilter(false);
    setNeuralThreadsDocked(false);
    setSpikeThreshold(55);
    setIsGrasping(false);
    setGraspSuccess(null);
    setLastAttemptFailed(false);
    setFailReason("");
    setIsVictorious(false);
  };

  return (
    <LabShell
      labId="braincomputerinterface9"
      title="Brainwave Tuner: Brain-Computer Interface"
      instruction="Filter biological noise, dock high-density neural threads, and decode motor cortex spikes to command the cybernetic prosthetic hand."
      compact={true}
      bgOverride="bg-slate-50"
      onReset={resetLab}
    >
      <Celebration
        isActive={isVictorious}
        message={`BCI Certification Complete! You achieved 98% SNR and mastered the high-bandwidth neural streaming protocol!`}
        onReplay={resetLab}
      />

      <div className="flex flex-col h-full w-full max-w-6xl mx-auto gap-2 p-1 relative z-10 font-sans select-none overflow-hidden">
        
        {/* ─── STAGE PROGRESS PILL BAR ─── */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium text-slate-600">
            {[
              { id: "INTRO", label: "1. Biological Bottleneck" },
              { id: "RAW_ATTEMPT", label: "2. Surface EEG Trial" },
              { id: "DSP_TUNING", label: "3. Neural DSP Deck" },
              { id: "COMPLETED", label: "4. Calibrated" },
            ].map((st, i) => {
              const isActive = 
                (st.id === "INTRO" && stage === "INTRO") ||
                (st.id === "RAW_ATTEMPT" && stage === "RAW_ATTEMPT") ||
                (st.id === "DSP_TUNING" && (stage === "DSP_TUNING" || stage === "MIND_GRASP")) ||
                (st.id === "COMPLETED" && stage === "COMPLETED");
              
              const isPast = 
                (st.id === "INTRO" && stage !== "INTRO") ||
                (st.id === "RAW_ATTEMPT" && stage !== "INTRO" && stage !== "RAW_ATTEMPT") ||
                (st.id === "DSP_TUNING" && stage === "COMPLETED");

              return (
                <div
                  key={i}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition-all shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : isPast
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isPast ? <CheckCircle2 size={12} className="text-emerald-600" /> : null}
                  <span>{st.label}</span>
                </div>
              );
            })}
          </div>

          {/* Telemetry Badges */}
          <div className="flex items-center gap-2">
            {/* Bandwidth Live Badge */}
            <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg shrink-0">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Activity size={13} className="text-indigo-600" /> BPS:
              </span>
              <span
                className={`font-black ${
                  neuralThreadsDocked
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {neuralThreadsDocked ? ">2,400" : "20"}
              </span>
            </div>

            {/* SNR Live Badge */}
            <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg shrink-0">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Gauge size={13} className="text-indigo-600" /> SNR:
              </span>
              <span
                className={`font-black ${
                  currentSNR > 80
                    ? "text-emerald-600"
                    : currentSNR > 35
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}
              >
                {currentSNR}%
              </span>
            </div>
          </div>
        </div>

        {/* ─── MAIN WORKSPACE GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 overflow-hidden">
          
          {/* ════════ LEFT COLUMN: OSCILLOSCOPE & NEURAL DSP (7 COLS) ════════ */}
          <div className="lg:col-span-7 flex flex-col gap-2 min-h-0">
            
            {/* Live Oscilloscope Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col relative overflow-hidden flex-1 min-h-[160px]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1">
                    <Activity size={14} className="text-indigo-600" /> CORTEX SIGNAL OSCILLOSCOPE
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className={`px-2 py-0.5 rounded font-semibold border ${
                    neuralThreadsDocked 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                      : "bg-amber-50 text-amber-700 border-amber-300"
                  }`}>
                    {neuralThreadsDocked ? "MICRON THREADS (INVASIVE)" : "SURFACE EEG (SCALP)"}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-semibold border ${
                    notchFilter 
                      ? "bg-indigo-50 text-indigo-700 border-indigo-300" 
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}>
                    {notchFilter ? "60Hz NOTCH: ON" : "60Hz HUM: ACTIVE"}
                  </span>
                </div>
              </div>

              {/* SVG Waveform Display */}
              <div className="flex-1 bg-slate-950 rounded-lg relative overflow-hidden border border-slate-800 flex items-center justify-center min-h-0">
                {/* Background Grid Pattern */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: "linear-gradient(#0284c7 1px, transparent 1px), linear-gradient(90deg, #0284c7 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                  }}
                />

                {/* Voltage Threshold Reference Line */}
                <div 
                  className="absolute left-0 right-0 border-b border-dashed border-amber-400/60 pointer-events-none z-10"
                  style={{ top: `${100 - spikeThreshold}%` }}
                >
                  <span className="absolute right-2 -top-3.5 font-mono text-[9px] text-amber-400 bg-black/60 px-1 rounded">
                    TRIGGER: {spikeThreshold}μV
                  </span>
                </div>

                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 500 140" 
                  preserveAspectRatio="none" 
                  className="absolute inset-0 w-full h-full"
                >
                  <path
                    d={generateWavePath()}
                    fill="none"
                    stroke={
                      neuralThreadsDocked && notchFilter 
                        ? "#10b981" 
                        : neuralThreadsDocked || notchFilter 
                        ? "#38bdf8" 
                        : "#f43f5e"
                    }
                    strokeWidth="2.2"
                    style={{
                      filter: `drop-shadow(0px 0px 6px ${
                        neuralThreadsDocked && notchFilter 
                          ? "rgba(16, 185, 129, 0.7)" 
                          : "rgba(56, 189, 248, 0.6)"
                      })`
                    }}
                  />
                </svg>

                {/* Live State Overlay Label */}
                {isGrasping && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-indigo-900/90 border border-indigo-400 text-indigo-200 font-mono text-[10px] px-2 py-0.5 rounded-md animate-pulse">
                    <Zap size={11} className="text-amber-400" /> DECODING MOTOR INTENTION...
                  </div>
                )}
              </div>
            </div>

            {/* Hardware DSP Tuning Deck (Interactive Controls) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1.5">
                  <Sliders size={14} className="text-indigo-600" /> HARDWARE & SIGNAL PROCESSING DECK
                </span>
                <span className="text-[10px] text-slate-500 font-mono">CHAPTER 08 BCI TUNER</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. 60Hz Notch Filter Toggle */}
                <button
                  onClick={() => {
                    playPop();
                    setNotchFilter(!notchFilter);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    notchFilter
                      ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      notchFilter ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      <Radio size={16} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold">Software: 60Hz Filter</div>
                      <div className="text-[10px] text-slate-500">Removes Power Line Noise</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    notchFilter ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {notchFilter && <CheckCircle2 size={12} />}
                  </div>
                </button>

                {/* 2. Neural Thread Matrix Socket */}
                <button
                  onClick={() => {
                    playZap();
                    setNeuralThreadsDocked(!neuralThreadsDocked);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    neuralThreadsDocked
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs ring-2 ring-emerald-400/20"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      neuralThreadsDocked ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      <Cpu size={16} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold">Hardware: Neural Threads</div>
                      <div className="text-[10px] text-slate-500">Bypasses Thick Skull Bone</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    neuralThreadsDocked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {neuralThreadsDocked && <CheckCircle2 size={12} />}
                  </div>
                </button>
              </div>

              {/* Spike Trigger Voltage Slider */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-700 shrink-0 font-mono">
                  Voltage Trigger Threshold:
                </span>
                <input
                  type="range"
                  min="20"
                  max="85"
                  value={spikeThreshold}
                  onChange={(e) => {
                    setSpikeThreshold(Number(e.target.value));
                  }}
                  className="flex-1 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <span className="font-mono text-xs font-bold text-indigo-700 w-10 text-right">
                  {spikeThreshold}μV
                </span>
              </div>
            </div>

          </div>

          {/* ════════ RIGHT COLUMN: TANGIBLE ACTUATOR & MISSION FLOW (5 COLS) ════════ */}
          <div className="lg:col-span-5 flex flex-col gap-2 min-h-0">
            
            {/* Tangible Cybernetic Robotic Hand Workspace */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col relative overflow-hidden shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600" /> ROBOTIC CLAW ACTUATOR
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  graspSuccess === true
                    ? "bg-emerald-100 text-emerald-800"
                    : graspSuccess === false
                    ? "bg-rose-100 text-rose-800"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {graspSuccess === true ? "TARGET CAPTURED" : graspSuccess === false ? "GRIP FAILED" : "STANDBY"}
                </span>
              </div>

              {/* Visual Prosthetic Hand & Target Orb */}
              <div className="h-44 bg-gradient-to-b from-slate-100 to-sky-100/60 rounded-xl border border-slate-200 relative flex items-center justify-center overflow-hidden">
                
                {/* Object to grab */}
                <motion.div
                  animate={{
                    scale: isGrasping && currentSNR > 80 ? 0.8 : 1,
                    y: lastAttemptFailed && !isGrasping ? 120 : 0, // Drops object off screen if failed
                    opacity: lastAttemptFailed && !isGrasping ? 0 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center shadow-lg z-10 absolute ${
                    graspSuccess
                      ? "bg-emerald-500 border-emerald-300 shadow-emerald-400/50"
                      : lastAttemptFailed
                      ? "bg-rose-400 border-rose-200 shadow-rose-300/40"
                      : "bg-indigo-600 border-indigo-300 shadow-indigo-400/40"
                  }`}
                >
                  <Sparkles size={20} className="text-white animate-pulse" />
                </motion.div>

                {/* Left Robotic Claw */}
                <motion.div
                  animate={{
                    x: isGrasping && currentSNR > 80 ? 34 : isGrasping ? (Math.random() > 0.5 ? 15 : -5) : 0,
                    y: isGrasping && !graspSuccess && !lastAttemptFailed ? (Math.random() > 0.5 ? 5 : -5) : 0, // Erratic twitch
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="absolute left-2 z-20 flex items-center"
                >
                  <div className="w-12 h-8 bg-slate-400 border-y-2 border-r-0 border-slate-600 rounded-l-md shadow-inner" />
                  <div className="w-16 h-28 border-t-8 border-l-8 border-b-8 border-slate-800 rounded-l-2xl relative shadow-lg bg-transparent">
                     <div className="absolute -top-2 right-0 w-3 h-8 bg-amber-400 rounded-l-full border border-amber-600 shadow-sm" />
                     <div className="absolute -bottom-2 right-0 w-3 h-8 bg-amber-400 rounded-l-full border border-amber-600 shadow-sm" />
                  </div>
                </motion.div>

                {/* Right Robotic Claw */}
                <motion.div
                  animate={{
                    x: isGrasping && currentSNR > 80 ? -34 : isGrasping ? (Math.random() > 0.5 ? -15 : 5) : 0,
                    y: isGrasping && !graspSuccess && !lastAttemptFailed ? (Math.random() > 0.5 ? -5 : 5) : 0, // Erratic twitch
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="absolute right-2 z-20 flex items-center"
                >
                  <div className="w-16 h-28 border-t-8 border-r-8 border-b-8 border-slate-800 rounded-r-2xl relative shadow-lg bg-transparent">
                     <div className="absolute -top-2 left-0 w-3 h-8 bg-amber-400 rounded-r-full border border-amber-600 shadow-sm" />
                     <div className="absolute -bottom-2 left-0 w-3 h-8 bg-amber-400 rounded-r-full border border-amber-600 shadow-sm" />
                  </div>
                  <div className="w-12 h-8 bg-slate-400 border-y-2 border-l-0 border-slate-600 rounded-r-md shadow-inner" />
                </motion.div>

                {/* Jitter Error Sparks */}
                {lastAttemptFailed && (
                  <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center pointer-events-none z-30">
                    <div className="bg-rose-900/90 text-rose-100 font-mono text-[10px] px-3 py-1 rounded-full border border-rose-400 flex items-center gap-1 shadow-lg mt-20">
                      <AlertTriangle size={12} className="text-rose-400" /> DROPPED DUE TO JITTER
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pedagogical Step Guide & Mission Terminal */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex-1 flex flex-col justify-between min-h-0 overflow-y-auto">
              <AnimatePresence mode="wait">
                
                {/* ── STEP 1: INTRO / BIOLOGICAL BOTTLENECK ── */}
                {stage === "INTRO" && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase font-mono mb-1">
                        <Brain size={16} /> Chapter 08: AI Symbiosis & Prosthetics
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        To keep up with advancing AI or restore agency to paralyzed patients, we need high-bandwidth <strong>Brain-Computer Interfaces (BCIs)</strong>. But physical typing tops out at <strong>~40 WPM (20 bps)</strong>.
                      </p>
                      <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 text-[11px] text-sky-800">
                        <strong>The Challenge:</strong> We have 86 billion neurons, but the thick skull bone blocks the electrical signals, reducing the Signal-to-Noise Ratio (SNR).
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playClick();
                        setStage("RAW_ATTEMPT");
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Test Standard Typing Speed</span>
                      <ArrowRight size={14} />
                    </button>
                  </motion.div>
                )}

                {/* ── STEP 2: RAW SURFACE EEG ATTEMPT ── */}
                {stage === "RAW_ATTEMPT" && (
                  <motion.div
                    key="raw_attempt"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase font-mono mb-1">
                        <Radio size={16} /> Step 2: Test Unfiltered Surface EEG
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Transmit your neural motor intention to command the robotic hand using standard surface scalp electrodes.
                      </p>
                      {lastAttemptFailed && (
                        <div className="mt-2 bg-rose-50 border border-rose-200 rounded-lg p-2 text-[11px] text-rose-800">
                          <strong>Failure Diagnosis:</strong> {failReason}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={executeGrasp}
                        disabled={isGrasping}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Zap size={14} />
                        <span>{isGrasping ? "Transmitting Neural Intent..." : "Transmit Motor Intent (Raw EEG)"}</span>
                      </button>

                      {lastAttemptFailed && (
                        <button
                          onClick={() => {
                            playClick();
                            setStage("DSP_TUNING");
                          }}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>Open Neural DSP Tuning Deck</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3-5: DSP TUNING & GRASP CHALLENGE ── */}
                {(stage === "DSP_TUNING" || stage === "MIND_GRASP") && (
                  <motion.div
                    key="dsp_tuning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase font-mono mb-1">
                        <Sliders size={16} /> Neural Signal Optimization
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        1. Enable the <strong>60Hz Notch Filter</strong> to strip AC grid hum.<br />
                        2. Dock <strong>Micron Neural Threads</strong> to bypass skull attenuation.
                      </p>
                      
                      {lastAttemptFailed && (
                        <div className="mt-1.5 bg-rose-50 border border-rose-200 rounded-lg p-2 text-[11px] text-rose-800">
                          <strong>Warning:</strong> {failReason}
                        </div>
                      )}

                      {currentSNR > 80 && (
                        <div className="mt-1.5 bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[11px] text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <span>Signal Pristine! Ready for High-Bandwidth Actuation.</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={executeGrasp}
                      disabled={isGrasping}
                      className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        currentSNR > 80
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      <Zap size={14} />
                      <span>{isGrasping ? "Transmitting & Decoding..." : "Transmit Calibrated Neural Command"}</span>
                    </button>
                  </motion.div>
                )}


                {/* ── FINAL COMPLETED VIEW ── */}
                {stage === "COMPLETED" && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col h-full justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase font-mono mb-1">
                        <CheckCircle2 size={16} /> BCI Protocol Mastered
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        You successfully bypassed the skull bottleneck. This high-bandwidth neural stream could power a prosthetic limb or allow cognitive symbiosis with AI.
                      </p>

                      {/* Bandwidth Telemetry Comparison Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col gap-1 text-[11px] font-mono">
                        <div className="font-bold text-slate-700 mb-0.5">Telemetry Benchmark:</div>
                        <div className="flex justify-between text-slate-600">
                          <span>Thumb Typing:</span>
                          <span className="text-slate-900 font-semibold">20 bps (~40 WPM)</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Scalp EEG (Filtered):</span>
                          <span className="text-amber-700 font-semibold">12 bps (Low SNR)</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Neural Threads BCI:</span>
                          <span>&gt;2,400 bps (120x Speed)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={resetLab}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      <span>Replay & Calibrate Again</span>
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </LabShell>
  );
}

