"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Orbit, Search, AlertTriangle, Info, ChevronRight, Activity, Cpu, Zap, XCircle } from "lucide-react";

type Phase = "LEARN" | "FAIL" | "UNDERSTAND" | "IMPROVE" | "COMPLETE" | "OUTCOME";
type QubitState = "SUPERPOSITION" | "COLLAPSED_0" | "COLLAPSED_1" | "STABLE_0" | "STABLE_1";
type GateType = "NONE" | "H" | "X";

export default function QuantumComputing9() {
  const { reportComplete } = useLMSBridge("quantumcomputing9");
  const { playPop, playClick, playSuccess, playError, playZap, playChime } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("LEARN");
  const [qubitState, setQubitState] = useState<QubitState>("SUPERPOSITION");
  const [slottedGate, setSlottedGate] = useState<GateType>("NONE");
  const [shake, setShake] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleMeasure = () => {
    if (qubitState === "SUPERPOSITION") {
      playError();
      triggerShake();
      const result = Math.random() > 0.5 ? "COLLAPSED_1" : "COLLAPSED_0";
      setQubitState(result);
      setPhase("FAIL");
    } else if (qubitState === "STABLE_0" || qubitState === "STABLE_1") {
      playChime();
      setPhase("OUTCOME");
      
      timerRef.current = setTimeout(() => {
        playSuccess();
        reportComplete();
      }, 4500);
    }
  };

  const handleApplyGate = (gate: GateType) => {
    if (phase !== "IMPROVE" && phase !== "COMPLETE") return;
    
    setSlottedGate(gate);
    playClick();

    if (gate === "H") {
      // H-gate applied to |+> (Superposition) yields |0>
      setQubitState("STABLE_0");
      setPhase("COMPLETE");
      playZap();
    } else if (gate === "X") {
      // X-gate applied to |+> yields |+> (still superposition)
      setQubitState("SUPERPOSITION");
      setPhase("IMPROVE"); // Did not solve the issue
    } else {
      setQubitState("SUPERPOSITION");
      setPhase("IMPROVE");
    }
  };

  const reset = () => {
    playPop();
    setPhase("LEARN");
    setQubitState("SUPERPOSITION");
    setSlottedGate("NONE");
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Probabilities for the UI Gauges
  const prob0 = qubitState === "COLLAPSED_0" || qubitState === "STABLE_0" ? 100 : qubitState === "COLLAPSED_1" || qubitState === "STABLE_1" ? 0 : 50;
  const prob1 = qubitState === "COLLAPSED_1" || qubitState === "STABLE_1" ? 100 : qubitState === "COLLAPSED_0" || qubitState === "STABLE_0" ? 0 : 50;

  return (
    <LabShell 
      labId="quantumcomputing9" 
      theme="cosmos" 
      title="Quantum Superposition"
      instruction="Master qubit states and prevent quantum collapse." 
      compact
      onReset={reset}
    >
      <Celebration isActive={phase === "OUTCOME"} message="Engine Started! You stabilized the quantum core using a Hadamard gate!" onReplay={reset} />

      <div className="w-full flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-2 bg-slate-950">
        
        {/* LEFT PANE: Mission Guide & Quantum Telemetry */}
        <div className="w-full md:w-80 flex flex-col gap-4 min-h-0 shrink-0">
          
          {/* Mission Card */}
          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-700 p-5 shrink-0 flex flex-col">
            <h3 className="font-bold text-white text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
              {phase === "LEARN" && <><Orbit className="text-purple-400" size={18} /> M1: Observation</>}
              {phase === "FAIL" && <><AlertTriangle className="text-rose-500" size={18} /> M2: System Crash</>}
              {phase === "UNDERSTAND" && <><Info className="text-blue-400" size={18} /> M3: Analysis</>}
              {(phase === "IMPROVE" || phase === "COMPLETE" || phase === "OUTCOME") && <><Zap className="text-teal-400" size={18} /> M4: Stabilization</>}
            </h3>
            
            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4 min-h-[80px]">
              {phase === "LEARN" && "The hyper-drive core needs a solid measurement. But right now, the core qubit is spinning wildly in Superposition (both 0 and 1). Try measuring it."}
              {phase === "FAIL" && <span className="text-rose-400"><strong>CRITICAL ERROR:</strong> The scanner forced the qubit to collapse randomly! The engine cannot boot on unpredictable coin-flips.</span>}
              {phase === "UNDERSTAND" && "Observation forces the universe to pick a side. We cannot run reliable math on a random collapse. We must stabilize the probability before scanning."}
              {phase === "IMPROVE" && "Apply a Hadamard (H) Gate. The H-gate acts like a quantum mirror—it reflects a messy superposition back into a clean, predictable state."}
              {phase === "COMPLETE" && "Perfect! The Hadamard gate collapsed the probability perfectly into a stable |0⟩ state. Scan it now!"}
              {phase === "OUTCOME" && "Success! By manipulating quantum probabilities before measuring, you booted the hyper-drive."}
            </p>

            {phase === "FAIL" && (
              <button 
                onClick={() => { setPhase("UNDERSTAND"); playClick(); }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Diagnose Crash <ChevronRight size={16} />
              </button>
            )}

            {phase === "UNDERSTAND" && (
              <button 
                onClick={() => { setPhase("IMPROVE"); setQubitState("SUPERPOSITION"); playClick(); }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Access Toolbox <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Telemetry Card */}
          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="bg-slate-800 p-3 border-b border-slate-700 flex flex-col items-center justify-center">
              <span className="font-black text-white text-sm tracking-widest uppercase flex items-center gap-2"><Activity size={16}/> Wavefunction</span>
            </div>
            
            <div className="p-5 flex-1 flex flex-col gap-6 justify-center">
              
              {/* Probability 0 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>State |0⟩</span>
                  <span className={prob0 === 100 ? "text-teal-400" : ""}>{prob0}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="bg-teal-500 h-full rounded-full"
                    animate={{ width: `${prob0}%` }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                </div>
              </div>

              {/* Probability 1 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>State |1⟩</span>
                  <span className={prob1 === 100 ? "text-teal-400" : ""}>{prob1}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="bg-purple-500 h-full rounded-full"
                    animate={{ width: `${prob1}%` }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center justify-center p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Status</span>
                <span className={`text-sm font-bold ${qubitState === "SUPERPOSITION" ? "text-amber-400 animate-pulse" : qubitState.startsWith("COLLAPSED") ? "text-rose-500" : "text-teal-400"}`}>
                  {qubitState === "SUPERPOSITION" ? "UNSTABLE (SUPERPOSITION)" : qubitState.startsWith("COLLAPSED") ? "COLLAPSED (ERROR)" : "STABLE (READY)"}
                </span>
              </div>

            </div>
          </div>
          
        </div>

        {/* RIGHT PANE: Quantum Circuit Canvas */}
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex-1 bg-slate-900 rounded-3xl shadow-md relative overflow-hidden flex flex-col border border-slate-700"
        >
          
          {/* Deep Space Grid */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#475569_1px,transparent_1px),linear-gradient(90deg,#475569_1px,transparent_1px)] [background-size:30px_30px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-900/90 to-slate-950 pointer-events-none" />

          {/* Interactive Circuit Canvas */}
          <div className="relative w-full flex-1 flex flex-col items-center justify-center min-h-[300px]">
            
            {/* NEW: 9th Grade Visual Metaphor (The "Wow" Factor) */}
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
              <span className="text-slate-500 font-bold tracking-widest text-[10px] uppercase mb-4 bg-slate-900/80 px-4 py-1 rounded-full border border-slate-700">Live Qubit Core</span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                {qubitState === "SUPERPOSITION" && (
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 bg-purple-900/20 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex items-center justify-center overflow-hidden">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-t-purple-400 border-r-transparent border-b-teal-400 border-l-transparent rounded-full opacity-50"
                    />
                    <div className="relative flex items-center justify-center w-full h-full">
                      <span className="absolute text-5xl font-black text-teal-400 opacity-60 animate-ping" style={{ animationDuration: '0.5s' }}>0</span>
                      <span className="absolute text-5xl font-black text-rose-400 opacity-60 animate-ping" style={{ animationDuration: '0.6s' }}>1</span>
                    </div>
                  </div>
                )}
                
                {qubitState === "STABLE_0" && (
                  <div className="absolute inset-0 rounded-full border-8 border-teal-500 bg-teal-900/40 shadow-[0_0_50px_rgba(20,184,166,0.5)] flex items-center justify-center transform scale-110 transition-transform">
                    <span className="text-6xl font-black text-teal-400 drop-shadow-lg">0</span>
                  </div>
                )}

                {(qubitState === "COLLAPSED_0" || qubitState === "COLLAPSED_1") && (
                  <div className="absolute inset-0 rounded-full border-8 border-rose-500 bg-rose-900/40 shadow-[0_0_50px_rgba(244,63,94,0.5)] flex items-center justify-center animate-pulse">
                    <span className="text-6xl font-black text-rose-400 drop-shadow-lg">{qubitState === "COLLAPSED_0" ? "0" : "1"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SVG Wires */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-lg">
              <defs>
                <filter id="neonGlow" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="700">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Central Quantum Wire */}
              <path d="M 150 350 L 850 350.1" fill="none" stroke={qubitState === "SUPERPOSITION" ? "#a855f7" : "#14b8a6"} strokeWidth="10" strokeDasharray={qubitState === "SUPERPOSITION" ? "15,10" : "none"} className="transition-all duration-500" filter="url(#neonGlow)" />
              
              {/* Animated Quantum Particles */}
              {qubitState === "SUPERPOSITION" && (
                <>
                  <circle r="8" fill="#fff" filter="url(#neonGlow)">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M 150 350 L 850 350" />
                  </circle>
                  <circle r="6" fill="#a855f7" filter="url(#neonGlow)">
                    <animateMotion dur="1.2s" repeatCount="indefinite" path="M 150 350 L 850 350" />
                  </circle>
                </>
              )}
              {qubitState.startsWith("STABLE") && (
                <circle r="10" fill="#fff" filter="url(#neonGlow)">
                  <animateMotion dur="0.8s" repeatCount="indefinite" path="M 150 350 L 850 350" />
                </circle>
              )}
            </svg>

            {/* Input Node (Qubit Source) */}
            <div className="absolute left-[15%] top-[70%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="bg-slate-800 text-slate-300 text-[11px] font-bold px-4 py-1.5 rounded-full border border-slate-600 mb-3 shadow-md">
                Superposition Source
              </div>
              <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                 <Orbit className="text-purple-400 animate-spin-slow" size={32} />
              </div>
            </div>

            {/* Gate Slot */}
            <div className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="bg-slate-800/90 backdrop-blur text-slate-300 text-[11px] font-bold px-4 py-1.5 rounded-full border border-slate-600 mb-3 shadow-md">
                Gate Slot
              </div>
              <div className={`w-28 h-28 rounded-2xl border-4 flex items-center justify-center transition-all bg-slate-900/80 backdrop-blur-md ${slottedGate !== "NONE" ? "border-solid border-teal-500 shadow-[0_0_40px_rgba(20,184,166,0.4)] bg-slate-800" : "border-dashed border-slate-500 hover:border-slate-400 hover:bg-slate-800"}`}>
                 {slottedGate === "NONE" && <div className="text-slate-500 font-bold text-sm">DRAG/CLICK</div>}
                 {slottedGate === "H" && <div className="text-teal-400 font-black text-5xl font-serif">H</div>}
                 {slottedGate === "X" && <div className="text-purple-400 font-black text-5xl font-serif">X</div>}
              </div>
              {slottedGate !== "NONE" && (phase === "IMPROVE" || phase === "COMPLETE") && (
                <button onClick={() => { setSlottedGate("NONE"); setQubitState("SUPERPOSITION"); setPhase("IMPROVE"); playClick(); }} className="mt-3 text-[11px] text-rose-400 font-bold uppercase tracking-wider hover:text-rose-300 bg-slate-900/80 px-3 py-1 rounded-full border border-rose-900/50">
                  Remove Gate
                </button>
              )}
            </div>

            {/* Measurement Output */}
            <div className="absolute left-[85%] top-[70%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="bg-slate-800 text-slate-300 text-[11px] font-bold px-4 py-1.5 rounded-full border border-slate-600 mb-3 shadow-md">
                Scanner
              </div>
              
              <button 
                onClick={handleMeasure}
                disabled={phase === "OUTCOME"}
                className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center transition-all border-4 border-b-8 shadow-2xl active:border-b-4 active:translate-y-1 ${
                  qubitState.startsWith("COLLAPSED") ? "bg-rose-900 border-rose-600 border-b-rose-800 shadow-[0_0_50px_rgba(244,63,94,0.4)]" :
                  qubitState.startsWith("STABLE") && phase === "OUTCOME" ? "bg-teal-900 border-teal-500 border-b-teal-700 shadow-[0_0_50px_rgba(20,184,166,0.5)]" :
                  "bg-slate-700 border-slate-500 border-b-slate-800 hover:bg-slate-600 hover:border-slate-400 cursor-pointer"
                }`}
              >
                 {qubitState === "SUPERPOSITION" && <Search className="text-slate-300 mb-2 drop-shadow-md" size={36} />}
                 {qubitState === "COLLAPSED_0" && <span className="text-5xl font-black text-rose-400 drop-shadow-lg">0</span>}
                 {qubitState === "COLLAPSED_1" && <span className="text-5xl font-black text-rose-400 drop-shadow-lg">1</span>}
                 {qubitState === "STABLE_0" && phase === "OUTCOME" && <span className="text-5xl font-black text-teal-400 drop-shadow-lg">0</span>}
                 {qubitState === "SUPERPOSITION" && <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest drop-shadow-md">Measure</span>}
              </button>

            </div>

          </div>

          {/* Bottom Toolbar: Quantum Gates */}
          <AnimatePresence>
            {(phase === "IMPROVE" || phase === "COMPLETE") && (
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="h-24 bg-slate-800/80 border-t border-slate-700 p-4 flex gap-4 items-center justify-center shrink-0 backdrop-blur-md"
              >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-4 hidden md:block">Available<br/>Gates:</div>
                
                <button 
                  onClick={() => handleApplyGate("H")}
                  className="px-6 h-full rounded-xl border-2 border-teal-500/50 bg-slate-900 hover:bg-teal-900/30 flex items-center gap-3 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded bg-slate-800 border border-teal-500 flex items-center justify-center font-serif text-xl font-black text-teal-400 group-hover:scale-110 transition-transform">H</div>
                  <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-teal-400 font-bold text-sm">Hadamard</span>
                    <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Stabilizes Superposition</span>
                  </div>
                </button>

                <button 
                  onClick={() => handleApplyGate("X")}
                  className="px-6 h-full rounded-xl border-2 border-purple-500/50 bg-slate-900 hover:bg-purple-900/30 flex items-center gap-3 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded bg-slate-800 border border-purple-500 flex items-center justify-center font-serif text-xl font-black text-purple-400 group-hover:scale-110 transition-transform">X</div>
                  <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-purple-400 font-bold text-sm">Pauli-X</span>
                    <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Quantum NOT Gate</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
        </motion.div>
        
      </div>
    </LabShell>
  );
}
