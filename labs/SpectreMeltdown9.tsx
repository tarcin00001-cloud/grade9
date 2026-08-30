"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Timer, 
  Search, 
  CheckCircle, 
  RotateCcw, 
  Info, 
  Shield, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Activity, 
  Database
} from "lucide-react";

// ─── TYPES & CONSTANTS ────────────────────────────────────────────────────────

const SPY_GRIDS = [
  ["A", "B", "K", "S", "P", "X", "Y", "Z"], // Target: S
  ["C", "D", "E", "F", "H", "L", "M", "N"], // Target: E
  ["A", "B", "C", "G", "I", "O", "Q", "U"]  // Target: C
];

const TARGET_CHARS = ["S", "E", "C"];

const SCENARIOS = [
  {
    title: "Direct Kernel Privilege Bypass (Meltdown)",
    desc: "An attacker process tries to read kernel space page maps directly. The CPU checks privilege levels only after instructions are executed speculatively, leaving a trace in the L1 cache.",
    solution: "kpti",
    remediation: "Kernel Page Table Isolation (KPTI) splits user and kernel space mapping completely, removing kernel pages from the user address translation tables."
  },
  {
    title: "Speculative Out-of-Bounds Bypass (Spectre)",
    desc: "An attacker trains the CPU branch predictor using valid indices, then runs a request with an out-of-bounds index mapping to kernel memory, causing speculative out-of-bounds execution.",
    solution: "lfence",
    remediation: "Inserting an LFENCE barrier serializes execution, forcing the CPU to complete branch boundaries evaluation before executing subsequent speculative instructions."
  },
  {
    title: "Precise High-Resolution Clock Timing Loop",
    desc: "The attacker process uses nanosecond-precision performance clocks (e.g. performance.now()) to read all pages and measure which offset returns an L1 Cache hit.",
    solution: "coarse",
    remediation: "Coarsening performance timers adds clock jitter and reduces accuracy, making it impossible to distinguish L1 Cache access speeds from physical RAM latency."
  }
];

// ─── MAIN LAB COMPONENT ───────────────────────────────────────────────────────

export default function SpectreMeltdown9() {
  const { reportComplete } = useLMSBridge("spectremeltdown9");
  const { playPop, playSuccess, playError, playZap, playChime, playDrop } = useLabAudio();

  const [phase, setPhase] = useState<"train" | "spy" | "defend">("train");
  const [hasWon, setHasWon] = useState(false);

  // Level 1: Branch Predictor States
  const [trainCount, setTrainCount] = useState(0);
  const [l1CacheSecretState, setL1CacheSecretState] = useState<"EMPTY" | "SPECULATIVE_LOAD" | "FLUSHED_BUT_CACHED">("EMPTY");
  const [l1CachedChar, setL1CachedChar] = useState<string | null>(null);
  const [level1Completed, setLevel1Completed] = useState(false);
  const [level1Message, setLevel1Message] = useState("Train the branch predictor by running valid in-bounds checks.");
  const [level1Animating, setLevel1Animating] = useState(false);

  // Level 2: Cache Spy States
  const [spySecretIndex, setSpySecretIndex] = useState(0);
  const [spyProbedChar, setSpyProbedChar] = useState<string | null>(null);
  const [spyProbeLatency, setSpyProbeLatency] = useState<number | null>(null);
  const [spyProbeStatus, setSpyProbeStatus] = useState<"idle" | "probing" | "done">("idle");
  const [spyExtractedChars, setSpyExtractedChars] = useState<string[]>([]);
  const [level2Completed, setLevel2Completed] = useState(false);
  const [level2Message, setLevel2Message] = useState("L1 cache trace contains paged-in bytes. Probe the offsets to measure speeds.");

  // Level 3: Mitigations States
  const [currentScenario, setCurrentScenario] = useState(0);
  const [level3Completed, setLevel3Completed] = useState(false);
  const [level3Message, setLevel3Message] = useState("Select the correct mitigation to patch the system hardware.");
  const [scenarioTested, setScenarioTested] = useState(false);
  const [scenarioPassed, setScenarioPassed] = useState<boolean | null>(null);
  const [mitigationSelection, setMitigationSelection] = useState<"none" | "lfence" | "kpti" | "coarse">("none");

  const isLevel1Done = level1Completed;
  const isLevel2Done = level2Completed;

  // Level 1 Game Actions
  const runInBoundsTrain = () => {
    if (trainCount >= 3 || level1Animating) return;
    playPop();
    const nextCount = trainCount + 1;
    setTrainCount(nextCount);
    if (nextCount === 1) {
      setLevel1Message("Predictor Status: Weakly Trained. Confidence is low.");
    } else if (nextCount === 2) {
      setLevel1Message("Predictor Status: Strongly Trained. CPU will guess Branch Taken.");
    } else {
      setLevel1Message("Predictor Status: Maximum confidence! Predictor assumes loop is permanent.");
    }
  };

  const runSpeculativeTrick = () => {
    if (trainCount < 3 || level1Animating || level1Completed) return;
    setLevel1Animating(true);
    setL1CacheSecretState("EMPTY");
    setL1CachedChar(null);
    playZap();
    setLevel1Message("Executing out-of-bounds index 9999. CPU is guessing branch is TAKEN...");

    // Stage 1: Speculative fetch
    setTimeout(() => {
      setL1CacheSecretState("SPECULATIVE_LOAD");
      setL1CachedChar("S");
      playPop();
      setLevel1Message("Speculative pipeline active: Kernel memory address resolved. Secret value 'S' cached in L1 cache.");
      
      // Stage 2: Bounds violation check & rollback
      setTimeout(() => {
        setL1CacheSecretState("FLUSHED_BUT_CACHED");
        playError();
        setLevel1Message("VIO: Bounds check failed! CPU rolled back register values, but left the memory trace inside L1 Cache!");

        // Stage 3: Completion
        setTimeout(() => {
          playSuccess();
          setLevel1Completed(true);
          setLevel1Animating(false);
          setLevel1Message("Success! Speculative trace established in L1 cache. Proceed to Level 2 (Cache Spy).");
        }, 1500);

      }, 1800);

    }, 1500);
  };

  // Level 2 Game Actions
  const probeCacheOffset = (char: string) => {
    if (spyProbeStatus === "probing" || level2Completed) return;
    setSpyProbedChar(char);
    setSpyProbeStatus("probing");
    setSpyProbeLatency(null);
    playZap();
    setLevel2Message(`Scanning cache page mapped to offset '${char}'...`);

    setTimeout(() => {
      const targetChar = TARGET_CHARS[spySecretIndex];
      const isHit = char === targetChar;
      setSpyProbeStatus("done");
      if (isHit) {
        setSpyProbeLatency(0.1);
        playChime();
        setLevel2Message(`Cache Hit detected at offset '${char}'! Retrieve the secret byte trace.`);
      } else {
        setSpyProbeLatency(120.0);
        playError();
        setLevel2Message(`Cache Miss at offset '${char}'. Loaded slowly from RAM.`);
      }
    }, 1200);
  };

  const extractSecretByte = () => {
    if (spyProbeLatency !== 0.1 || !spyProbedChar) return;
    playSuccess();
    const nextExtracted = [...spyExtractedChars, spyProbedChar];
    setSpyExtractedChars(nextExtracted);
    
    // Reset probe states
    setSpyProbedChar(null);
    setSpyProbeStatus("idle");
    setSpyProbeLatency(null);

    if (spySecretIndex + 1 >= TARGET_CHARS.length) {
      setLevel2Completed(true);
      setLevel2Message("Success! Full secret word 'SEC' successfully extracted. Proceed to Level 3.");
    } else {
      const nextIndex = spySecretIndex + 1;
      setSpySecretIndex(nextIndex);
      setLevel2Message(`Byte extracted! Cache flushed. Probe offsets to locate the next byte in sequence.`);
    }
  };

  // Level 3 Game Actions
  const handleSelectMitigation = (mitigation: "lfence" | "kpti" | "coarse") => {
    if (level3Completed || scenarioTested) return;
    setMitigationSelection(mitigation);
    playPop();
  };

  const deployMitigation = () => {
    if (mitigationSelection === "none" || scenarioTested || level3Completed) return;
    setScenarioTested(true);
    const targetScenario = SCENARIOS[currentScenario];
    const isCorrect = mitigationSelection === targetScenario.solution;

    if (isCorrect) {
      playSuccess();
      setScenarioPassed(true);
      setLevel3Message("Vulnerability mitigated successfully.");
      
      setTimeout(() => {
        if (currentScenario + 1 >= SCENARIOS.length) {
          setLevel3Completed(true);
          setHasWon(true);
          reportComplete();
        } else {
          setCurrentScenario(prev => prev + 1);
          setMitigationSelection("none");
          setScenarioTested(false);
          setScenarioPassed(null);
          setLevel3Message("Select the correct mitigation to patch the system hardware.");
        }
      }, 2500);
    } else {
      playError();
      setScenarioPassed(false);
      setLevel3Message("Defense failed. Scenario vulnerable.");
      
      setTimeout(() => {
        setScenarioTested(false);
        setScenarioPassed(null);
        setMitigationSelection("none");
        setLevel3Message("Select the correct mitigation to patch the system hardware.");
      }, 2000);
    }
  };

  const handleReplay = () => {
    setPhase("train");
    setTrainCount(0);
    setL1CacheSecretState("EMPTY");
    setL1CachedChar(null);
    setLevel1Completed(false);
    setLevel1Message("Train the branch predictor by running valid in-bounds checks.");
    setLevel1Animating(false);

    setSpySecretIndex(0);
    setSpyProbedChar(null);
    setSpyProbeLatency(null);
    setSpyProbeStatus("idle");
    setSpyExtractedChars([]);
    setLevel2Completed(false);
    setLevel2Message("L1 cache trace contains paged-in bytes. Probe the offsets to measure speeds.");

    setCurrentScenario(0);
    setLevel3Completed(false);
    setLevel3Message("Select the correct mitigation to patch the system hardware.");
    setScenarioTested(false);
    setScenarioPassed(null);
    setMitigationSelection("none");

    setHasWon(false);
  };

  return (
    <LabShell
      labId="spectremeltdown9" theme="studio"
      bgOverride="bg-retro-console"
      title="Spectre & Meltdown CPU Exploit Lab"
      instruction="1. Study the hardware vulnerabilities associated with speculative execution (Spectre and Meltdown). 2. Run the interactive simulation to exploit the CPU cache and read unauthorized memory. 3. Analyze how the exploit bypasses standard software security boundaries. 4. Apply simulated microcode and OS patches to mitigate the vulnerability and verify the fix."
      compact
      onReset={handleReplay}
    >

      <style>{`
        .bg-retro-console {
          background: linear-gradient(135deg, #faf5ff 0%, #fae8ff 50%, #f0fdf4 100%) !important;
          position: relative;
        }

        .bg-retro-console::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(168, 85, 247, 0.07) 2.5px, transparent 2.5px), 
            linear-gradient(90deg, rgba(168, 85, 247, 0.07) 2.5px, transparent 2.5px);
          background-size: 40px 40px;
          animation: gridMove 15s linear infinite;
          pointer-events: none;
        }

        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }

        .toy-panel {
          background: #ffffff !important;
          border: 1px solid #1e293b !important;
          border-radius: 20px !important;
          box-shadow: none !important;
          color: #0f172a !important;
          padding: 0.75rem !important;
          display: flex;
          flex-direction: column;
          position: relative;
          font-size: 0.95rem;
        }
        @media (min-width: 768px) {
          .toy-panel {
            border: 1px solid #1e293b !important;
            border-radius: 32px !important;
            box-shadow: none !important;
            padding: 1.5rem !important;
            font-size: 1.15rem;
          }
        }

        .toy-screen {
          background: #ffffff !important;
          border: 1px solid #1e293b !important;
          border-radius: 14px !important;
          padding: 0.75rem !important;
          box-shadow: none !important;
          color: #0f172a !important;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          position: relative;
          font-size: 0.95rem;
        }
        @media (min-width: 768px) {
          .toy-screen {
            border: 1px solid #1e293b !important;
            border-radius: 24px !important;
            padding: 1.25rem !important;
            font-size: 1.15rem;
          }
        }

        .toy-btn-tab {
          border: 1px solid #1e293b !important;
          border-radius: 14px !important;
          box-shadow: none !important;
          font-weight: 950 !important;
          background: #f1f5f9 !important;
          color: #475569 !important;
          transition: all 0.1s ease;
          font-size: 0.85rem !important;
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
        @media (min-width: 768px) {
          .toy-btn-tab {
            border: 1px solid #1e293b !important;
            border-radius: 20px !important;
            box-shadow: none !important;
            font-size: 1.15rem !important;
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
        }

        .toy-btn-tab:not([disabled]):hover {
          transform: translateY(-1.5px);
          box-shadow: none !important;
          color: #0f172a;
          background: #e2e8f0 !important;
        }

        .toy-btn-tab.active-tab {
          background: #ffffff !important;
          color: #1e293b !important;
          transform: translateY(1.5px);
          box-shadow: none !important;
        }

        .toy-btn-action {
          background: #ffffff !important;
          color: #1e293b !important;
          border: 1px solid #1e293b !important;
          border-radius: 18px !important;
          box-shadow: none !important;
          font-weight: 950 !important;
          transition: all 0.1s ease;
          font-size: 0.95rem !important;
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
        @media (min-width: 768px) {
          .toy-btn-action {
            border: 1px solid #1e293b !important;
            border-radius: 24px !important;
            box-shadow: none !important;
            font-size: 1.2rem !important;
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
        }

        .toy-btn-action:hover:not([disabled]) {
          transform: translateY(-2px) !important;
          box-shadow: none !important;
          background: #f8fafc !important;
        }

        .toy-btn-action:active:not([disabled]) {
          transform: translateY(1.5px) !important;
          box-shadow: none !important;
        }
      `}</style>

      <Celebration
        isActive={hasWon}
        message="Vulnerabilities patched! You successfully trained branches, scan-timed page offsets, and deployed serializing fences, kernel isolation, and timer resolution caps!"
        onReplay={handleReplay}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1 relative select-none">
        
        {/* Navigation Tabs */}
        <div className="shrink-0 flex gap-3">
          <button
            onClick={() => { setPhase("train"); playPop(); }}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              phase === "train" ? "active-tab text-slate-800 bg-white" : "bg-white text-slate-500"
            }`}
          >
            Train Predictor
          </button>
          <button
            onClick={() => { if (isLevel1Done) { setPhase("spy"); playPop(); } }}
            disabled={!isLevel1Done}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              !isLevel1Done ? "opacity-25 cursor-not-allowed bg-white text-slate-400" :
              phase === "spy" ? "active-tab text-slate-800 bg-white" : "bg-white text-slate-500"
            }`}
          >
            Cache Timing scan
          </button>
          <button
            onClick={() => { if (isLevel1Done && isLevel2Done) { setPhase("defend"); playPop(); } }}
            disabled={!isLevel1Done || !isLevel2Done}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              (!isLevel1Done || !isLevel2Done) ? "opacity-25 cursor-not-allowed bg-white text-slate-400" :
              phase === "defend" ? "active-tab text-slate-800 bg-white" : "bg-white text-slate-500"
            }`}
          >
            Hardware Mitigations
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* LEVEL 1: Branch Predictor Trainer */}
          {phase === "train" && (
            <motion.div
              key="train"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* Control Panel */}
                <div className="lg:col-span-4 toy-panel flex flex-col min-h-0">
                  <div className="toy-screen bg-zinc-50 p-4 flex flex-col gap-4 flex-1">
                    <span className="text-xs font-black uppercase text-violet-400 tracking-wider">Predictor Control Unit</span>

                    <div className="flex flex-col gap-3 flex-1 justify-center">
                      {/* Training Progress Card */}
                      <div className="border border-slate-300 bg-white p-4 rounded-2xl flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Training loop count:</span>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-slate-800 uppercase">{trainCount} / 3 Runs Completed</span>
                          <span className={`w-3.5 h-3.5 rounded-full border border-slate-400 ${
                            trainCount >= 3 ? "bg-emerald-600 animate-ping" : trainCount > 0 ? "bg-yellow-400" : "bg-rose-600"
                          }`} />
                        </div>

                        {/* Status bar */}
                        <div className="w-full bg-slate-100 h-4 border border-slate-300 rounded-lg overflow-hidden mt-1">
                          <div 
                            className="bg-violet-600 h-full transition-all duration-300 border-r border-slate-300" 
                            style={{ width: `${(trainCount / 3) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Train Button */}
                      <button
                        onClick={runInBoundsTrain}
                        disabled={trainCount >= 3 || level1Animating}
                        className={`w-full toy-btn-action bg-white hover:bg-slate-50 text-slate-800 py-3 font-black text-sm uppercase flex items-center justify-center gap-2 border border-slate-800 rounded-xl ${
                          trainCount >= 3 ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                      >
                        <Cpu className="w-4 h-4" /> Train Predictor (In-Bounds Run)
                      </button>

                      {/* Trick Query Button */}
                      <button
                        onClick={runSpeculativeTrick}
                        disabled={trainCount < 3 || level1Completed || level1Animating}
                        className={`w-full toy-btn-action bg-white hover:bg-slate-50 text-slate-800 py-3.5 font-black text-sm uppercase flex items-center justify-center gap-2 border border-slate-800 rounded-xl ${
                          (trainCount < 3 || level1Completed || level1Animating) ? "opacity-30 cursor-not-allowed" : "animate-bounce"
                        }`}
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" /> Trigger Trick Query (Out-of-Bounds)
                      </button>
                    </div>

                    {/* Level 1 completion link */}
                    {level1Completed && (
                      <button
                        onClick={() => { setPhase("spy"); playPop(); }}
                        className="w-full toy-btn-action bg-white hover:bg-slate-50 text-slate-800 py-3 uppercase font-black text-xs flex items-center justify-center gap-1.5 border border-slate-800 rounded-2xl mt-3"
                      >
                        Go to Cache Timing scan <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    )}

                    {/* Console Message Panel */}
                    <div className="mt-auto border border-slate-300 bg-fuchsia-50 p-3 rounded-2xl min-h-[90px] flex items-center font-mono text-xs md:text-sm font-bold text-emerald-700">
                      <span className="leading-snug">{level1Message}</span>
                    </div>
                  </div>
                </div>

                {/* Animation / Simulation Area */}
                <div className="lg:col-span-8 toy-panel">
                  <div className="toy-screen justify-center items-center p-4 relative overflow-hidden bg-white border border-slate-300 rounded-2xl">
                    <svg viewBox="0 0 700 350" className="w-full h-full">
                      {/* Grid background */}
                      <rect width="700" height="350" fill="#ffffff" rx="16" />

                      {/* Branch Predictor Block */}
                      <rect x="50" y="80" width="160" height="80" rx="12" fill="#f8fafc" stroke="#d946ef" strokeWidth="1" />
                      <text x="130" y="115" fill="#6b21a8" fontSize="11" fontWeight="black" textAnchor="middle">BRANCH PREDICTOR</text>
                      <text x="130" y="138" fill={trainCount >= 3 ? "#7e22ce" : "#64748b"} fontSize="12" fontWeight="bold" textAnchor="middle" className="uppercase">
                        {trainCount >= 3 ? "STRONG TAKEN" : trainCount > 0 ? "WEAK TAKEN" : "UNSURE"}
                      </text>

                      {/* CPU Pipeline Box */}
                      <rect x="270" y="80" width="180" height="180" rx="16" fill="#f8fafc" stroke={level1Animating ? "#f59e0b" : "#475569"} strokeWidth="1" />
                      <text x="360" y="115" fill="#334155" fontSize="12" fontWeight="black" textAnchor="middle">SPECULATIVE EXECUTION</text>

                      {/* Pipeline Status */}
                      {level1Animating && (
                        <g>
                          <line x1="285" y1="180" x2="435" y2="180" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8,4" className="animate-[dash_1s_linear_infinite]" />
                          <circle cx="360" cy="180" r="10" fill="#b45309" className="animate-ping" />
                          <text x="360" y="225" fill="#b45309" fontSize="10" fontWeight="bold" textAnchor="middle" className="animate-pulse">FETCHING MEMORY SPECULATIVELY</text>
                        </g>
                      )}
                      {l1CacheSecretState === "FLUSHED_BUT_CACHED" && (
                        <g>
                          {/* Red cross for pipeline flush rollback */}
                          <line x1="320" y1="130" x2="400" y2="210" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
                          <line x1="400" y1="130" x2="320" y2="210" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
                          <text x="360" y="240" fill="#be123c" fontSize="11" fontWeight="bold" textAnchor="middle">PIPELINE FLUSHED</text>
                        </g>
                      )}
                      {!level1Animating && l1CacheSecretState === "EMPTY" && (
                        <text x="360" y="180" fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle">PIPELINE IDLE</text>
                      )}

                      {/* L1 Cache Storage */}
                      <rect x="510" y="80" width="140" height="180" rx="16" fill="#f8fafc" stroke="#10b981" strokeWidth="1" />
                      <text x="580" y="115" fill="#065f46" fontSize="12" fontWeight="black" textAnchor="middle">L1 CACHE</text>

                      {/* Cache lines */}
                      {[0, 1, 2].map((i) => (
                        <rect key={i} x="530" y="140 + i * 30" width="100" height="20" rx="4" fill="#e2e8f0" />
                      ))}

                      {/* Speculative Loaded cache block */}
                      {(l1CacheSecretState === "SPECULATIVE_LOAD" || l1CacheSecretState === "FLUSHED_BUT_CACHED") && (
                        <motion.g initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <rect x="530" y="170" width="100" height="20" rx="4" fill="#d1fae5" stroke="#059669" strokeWidth="1" />
                          <text x="580" y="184" fill="#064e3b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                            Offset 'S' Trace
                          </text>
                          <circle cx="615" cy="180" r="4" fill="#34d399" className="animate-ping" />
                        </motion.g>
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LEVEL 2: Cache Spy Timing Attack */}
          {phase === "spy" && (
            <motion.div
              key="spy"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* Spy Monitor panel */}
                <div className="lg:col-span-4 toy-panel flex flex-col min-h-0">
                  <div className="toy-screen bg-zinc-50 p-4 flex flex-col gap-4 flex-1">
                    <span className="text-xs font-black uppercase text-violet-400 tracking-wider">Flush + Reload Spy Unit</span>

                    {/* Progress secret decoder */}
                    <div className="border border-slate-300 bg-white p-4 rounded-2xl flex flex-col gap-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Leaked Kernel Word:</span>
                      <div className="flex justify-center gap-4 py-2 bg-slate-100 border border-slate-300 rounded-xl text-center">
                        {[0, 1, 2].map((idx) => {
                          const char = spyExtractedChars[idx];
                          return (
                            <span 
                              key={idx}
                              className={`text-2xl font-mono font-black w-10 h-10 border-2 rounded-lg flex items-center justify-center ${
                                char ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white text-slate-400 border-slate-300 animate-pulse"
                              }`}
                            >
                              {char || "_"}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Probing Interface */}
                    {spyProbedChar && (
                      <div className="border border-slate-300 bg-white p-4 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="text-slate-500 uppercase">Page Target:</span>
                          <span className="text-violet-700 uppercase font-black">Offset '{spyProbedChar}'</span>
                        </div>

                        {spyProbeStatus === "probing" ? (
                          <div className="flex items-center justify-center gap-2 py-3 bg-violet-50 rounded-xl border border-violet-200">
                            <Timer className="w-5 h-5 text-violet-600 animate-spin" />
                            <span className="text-xs font-black text-purple-700 uppercase animate-pulse">Running clock loops...</span>
                          </div>
                        ) : spyProbeStatus === "done" ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-zinc-100 p-2 rounded-lg border border-black/10">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">Access Latency:</span>
                              <span className={`text-sm font-mono font-black ${spyProbeLatency === 0.1 ? "text-emerald-400" : "text-amber-600"}`}>
                                {spyProbeLatency} ns
                              </span>
                            </div>

                            {spyProbeLatency === 0.1 ? (
                              <button
                                onClick={extractSecretByte}
                                className="w-full toy-btn-action bg-white hover:bg-slate-50 text-slate-800 py-2.5 font-black text-xs uppercase"
                              >
                                Extract Secret Byte
                              </button>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-black text-center uppercase block mt-1">
                                Cache Miss! Probe other pages in the grid.
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Next step link */}
                    {level2Completed && (
                      <button
                        onClick={() => { setPhase("defend"); playPop(); }}
                        className="w-full toy-btn-action bg-white hover:bg-slate-50 text-slate-800 py-3 uppercase font-black text-xs flex items-center justify-center gap-1.5 border border-slate-800 rounded-2xl mt-3"
                      >
                        Go to Safeguards <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    )}

                    {/* Spy message logger */}
                    <div className="mt-auto border border-slate-300 bg-fuchsia-50 p-3 rounded-2xl min-h-[90px] flex items-center font-mono text-xs md:text-sm font-bold text-emerald-700">
                      <span className="leading-snug">{level2Message}</span>
                    </div>
                  </div>
                </div>

                {/* Cache Grid Scanner */}
                <div className="lg:col-span-8 toy-panel flex flex-col gap-3 min-h-0">
                  <div className="flex justify-between items-center shrink-0">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">L1 Shared Cache Offsets (256 Stride pages)</span>
                    <span className="text-[10px] font-black text-violet-700 bg-violet-100 border border-violet-300 px-2 py-0.5 rounded-lg uppercase">
                      Byte {spySecretIndex + 1} of 3
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 flex-1 items-stretch">
                    {SPY_GRIDS[spySecretIndex].map((char) => {
                      const isProbed = spyProbedChar === char;
                      const isTarget = char === TARGET_CHARS[spySecretIndex];
                      const isFinishedForThisChar = spyExtractedChars.includes(char);
                      
                      return (
                        <div
                          key={char}
                          onClick={() => probeCacheOffset(char)}
                          className={`rounded-2xl border flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all select-none ${
                            isFinishedForThisChar
                              ? "border-emerald-300 bg-emerald-50 opacity-40 cursor-not-allowed"
                              : isProbed && spyProbeStatus === "done"
                              ? isTarget
                                ? "border-emerald-400 bg-emerald-100 -translate-y-0.5"
                                : "border-amber-400 bg-amber-50"
                              : isProbed && spyProbeStatus === "probing"
                              ? "border-violet-400 bg-violet-50 animate-pulse"
                              : "border-slate-300 bg-white hover:-translate-y-0.5 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-2 h-full w-full">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Page Offset</span>
                            <span className="text-xl font-black text-slate-800 font-mono">{char}</span>
                            
                            {isProbed && spyProbeStatus === "done" && (
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border-2 ${
                                isTarget ? "bg-green-200 border-green-600 text-green-700" : "bg-amber-200 border-amber-600 text-amber-700"
                              }`}>
                                {isTarget ? "0.1 ns" : "120 ns"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LEVEL 3: Hardware Mitigations */}
          {phase === "defend" && (
            <motion.div
              key="defend"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* Vulnerability System Monitor */}
                <div className="lg:col-span-6 toy-panel flex flex-col min-h-0">
                  <div className="toy-screen bg-zinc-50 p-4 flex flex-col gap-4 flex-1">
                    <div className="flex justify-between items-center text-xs font-black shrink-0">
                      <span className="text-slate-500 uppercase">Scenario Monitor:</span>
                      <span className="text-purple-700 bg-violet-100 border border-violet-300 px-2 py-0.5 rounded-lg uppercase">
                        Vulnerability {currentScenario + 1} of 3
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-3">
                      <div className="border border-slate-300 bg-white p-4 rounded-2xl flex flex-col gap-2">
                        <span className="text-[10px] font-black text-rose-600 uppercase">Threat Detected:</span>
                        <h4 className="text-base font-black text-slate-800 uppercase tracking-wide leading-tight">
                          {SCENARIOS[currentScenario].title}
                        </h4>
                        <p className="text-xs text-slate-600 font-bold leading-normal mt-1">
                          {SCENARIOS[currentScenario].desc}
                        </p>
                      </div>

                      {mitigationSelection !== "none" ? (
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={deployMitigation}
                            disabled={scenarioTested}
                            className="w-full toy-btn-action bg-white hover:bg-slate-50 text-slate-800 py-3.5 font-black text-sm uppercase flex items-center justify-center gap-2 border border-slate-800 rounded-xl shadow-sm active:translate-y-1 active:shadow-none transition-all"
                          >
                            Deploy Selected patch
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 border border-dashed border-slate-300 rounded-2xl text-center text-xs font-bold text-slate-400 uppercase">
                          Select a mitigation patch on the right to apply.
                        </div>
                      )}

                      {/* Scenario test outcome */}
                      {scenarioTested && (
                        <div className={`p-3 border rounded-xl text-xs font-black uppercase text-center ${
                          scenarioPassed ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-rose-50 border-rose-300 text-rose-700"
                        }`}>
                          {scenarioPassed 
                            ? "SUCCESS: Threat blocked. Vulnerability patched." 
                            : "FAIL: Protection bypass detected. Exploit succeeded."
                          }
                        </div>
                      )}
                    </div>

                    {/* Console Log */}
                    <div className="mt-auto border border-slate-300 bg-fuchsia-50 p-3 rounded-2xl min-h-[90px] flex items-center font-mono text-xs md:text-sm font-bold text-emerald-700">
                      <span className="leading-snug">{level3Message}</span>
                    </div>
                  </div>
                </div>

                {/* Mitigation selection panel */}
                <div className="lg:col-span-6 toy-panel flex flex-col gap-3 min-h-0 overflow-y-auto">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1 shrink-0">Available Hardware Protection Patches</span>

                  <div className="flex flex-col gap-3 flex-1 justify-between">
                    {/* LFENCE Button Card */}
                    <div
                      onClick={() => handleSelectMitigation("lfence")}
                      className={`p-3 border rounded-2xl cursor-pointer transition-all select-none ${
                        mitigationSelection === "lfence"
                          ? "border-purple-400 bg-violet-50 shadow-sm -translate-y-0.5"
                          : "border-slate-300 bg-white hover:-translate-y-0.5 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 border border-slate-300 flex items-center justify-center shrink-0 font-mono text-xs font-black text-slate-700">
                          F
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase">LFENCE Barrier</h4>
                          <p className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">
                            Serializes the processor instruction execution pipeline to block speculative out-of-bounds execution steps.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* KPTI Button Card */}
                    <div
                      onClick={() => handleSelectMitigation("kpti")}
                      className={`p-3 border rounded-2xl cursor-pointer transition-all select-none ${
                        mitigationSelection === "kpti"
                          ? "border-purple-400 bg-violet-50 shadow-sm -translate-y-0.5"
                          : "border-slate-300 bg-white hover:-translate-y-0.5 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 border border-slate-300 flex items-center justify-center shrink-0 font-mono text-xs font-black text-slate-700">
                          I
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase">KPTI Isolation</h4>
                          <p className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">
                            Kernel Page Table Isolation splits kernel space mapping translation completely from user-mode tasks.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Coarse clocks Button Card */}
                    <div
                      onClick={() => handleSelectMitigation("coarse")}
                      className={`p-3 border rounded-2xl cursor-pointer transition-all select-none ${
                        mitigationSelection === "coarse"
                          ? "border-purple-400 bg-violet-50 shadow-sm -translate-y-0.5"
                          : "border-slate-300 bg-white hover:-translate-y-0.5 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 border border-slate-300 flex items-center justify-center shrink-0 font-mono text-xs font-black text-slate-700">
                          T
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase">Coarse Clock Precision</h4>
                          <p className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">
                            Degrades timer clock details to prevent code loops from measuring microarchitectural cache latency hits.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </LabShell>
  );
}
