"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, ArrowRight, Activity, Code2, Play, Zap, Cpu, AlertTriangle, SlidersHorizontal } from "lucide-react";

const TIMER_DURATION_SECONDS = 5 * 60;

type Phase = 
  | "LEARN" 
  | "TRY_JS" 
  | "FAIL_LAG" 
  | "CHALLENGE_SLIDER" 
  | "COMPROMISE"
  | "IMPROVE_WASM" 
  | "OUTCOME";

export default function WebAssembly9() {
  const { reportComplete: _reportComplete } = useLMSBridge("webassembly9");
  const { playPop, playZap, playError, playSuccess, playChime } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("LEARN");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [fps, setFps] = useState(0);
  const [particleCount, setParticleCount] = useState(2000);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simIntervalRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (simIntervalRef.current) cancelAnimationFrame(simIntervalRef.current);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const reportComplete = useCallback(() => {
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  // Global Timer
  useEffect(() => {
    if (timedOut || phase === "OUTCOME") {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timedOut, phase]);

  useEffect(() => {
    if (timedOut) _reportComplete({ points: 0 });
  }, [timedOut, _reportComplete]);

  // Particle Simulator Logic (Visual)
  // To keep DOM light, we only render max 50 visual dots, but the "math" simulates more.
  const visualDots = Math.min(50, Math.max(5, Math.floor(particleCount / 40)));
  const [particles, setParticles] = useState<{x: number, y: number}[]>(Array(visualDots).fill({x: 0, y: 0}));
  const timeRef = useRef(0);

  useEffect(() => {
    if (phase === "LEARN") {
      setFps(0);
      return;
    }

    let lastFrameTime = performance.now();
    
    const renderLoop = (currentTime: number) => {
      const delta = currentTime - lastFrameTime;
      
      // Calculate target FPS based on particle count and engine
      let targetFps = 60;
      if (phase !== "OUTCOME") {
        // JS Engine: Lags heavily above 500 particles
        if (particleCount > 500) {
          targetFps = Math.max(12, 60 - ((particleCount - 500) / 30));
        }
      }

      const frameDelay = 1000 / targetFps;

      if (delta >= frameDelay) {
        setFps(Math.floor(targetFps));
        lastFrameTime = currentTime - (delta % frameDelay);
        timeRef.current += 0.1;
        
        const newParticles = Array(visualDots).fill(0).map((_, i) => ({
          x: Math.cos(timeRef.current + i * 0.1) * (40 + (i % 3) * 20),
          y: Math.sin(timeRef.current + i * 0.1) * (40 + (i % 3) * 20)
        }));
        setParticles(newParticles);
      }
      
      simIntervalRef.current = requestAnimationFrame(renderLoop);
    };

    simIntervalRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (simIntervalRef.current) cancelAnimationFrame(simIntervalRef.current);
    };
  }, [phase, particleCount, visualDots]);

  // Monitor Slider Challenge
  useEffect(() => {
    if (phase === "CHALLENGE_SLIDER" && particleCount <= 500) {
      setPhase("COMPROMISE");
      playChime();
    }
  }, [particleCount, phase, playChime]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const getInstruction = () => {
    switch (phase) {
      case "LEARN": return "Start the engine to run the 2,000-particle physics simulation using JavaScript.";
      case "TRY_JS": return "Reading and translating the JavaScript manual...";
      case "FAIL_LAG": return "LAG DETECTED! The browser is struggling to read text while calculating 2,000 particles.";
      case "CHALLENGE_SLIDER": return "CHALLENGE: Reduce the particles using the slider until the engine hits 60 FPS.";
      case "COMPROMISE": return "It's 60 FPS, but the simulation looks empty! We can't sacrifice quality for speed. Reset to 2,000.";
      case "IMPROVE_WASM": return "Let's compile to WebAssembly. The browser won't have to read text anymore.";
      case "OUTCOME": return "Success! 2,000 particles at 60 FPS. WASM is a pre-built binary engine that runs at pure speed.";
    }
  };

  const handleRunJS = () => {
    if (phase !== "LEARN") return;
    setPhase("TRY_JS");
    playPop();
    timersRef.current.push(setTimeout(() => {
      setPhase("FAIL_LAG");
      playError();
      timersRef.current.push(setTimeout(() => {
        setPhase("CHALLENGE_SLIDER");
      }, 3000));
    }, 1500));
  };

  const handleResetParticles = () => {
    if (phase !== "COMPROMISE") return;
    setParticleCount(2000);
    setPhase("IMPROVE_WASM");
    playPop();
  };

  const handleCompileWASM = () => {
    if (phase !== "IMPROVE_WASM") return;
    playZap();
    setPhase("OUTCOME");
    timersRef.current.push(setTimeout(() => {
      playSuccess();
      timersRef.current.push(setTimeout(() => {
        reportComplete();
      }, 4500));
    }, 1000));
  };

  const isWASM = phase === "OUTCOME";

  return (
    <LabShell
      navExtra={
        phase !== "OUTCOME" ? (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm backdrop-blur-md transition-colors font-mono ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 60 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white/10 border-white/20 text-white"
          }`}>
            <Timer size={16} strokeWidth={2.5} className={secondsLeft <= 60 && !timedOut ? "animate-spin" : ""} />
            <span>{timedOut ? "0:00" : formattedTime}</span>
          </div>
        ) : null
      }
      labId="webassembly9"
      theme="cosmos"
      title="WebAssembly (WASM) Speed"
      instruction={getInstruction()}
      hint="JavaScript is slow because it's text. WebAssembly is fast because it's a pre-built binary."
      compact
      onReset={() => {
        setPhase("LEARN");
        setParticleCount(2000);
        setTimedOut(false);
        setSecondsLeft(TIMER_DURATION_SECONDS);
        clearTimers();
      }}
    >
      {phase === "OUTCOME" && <Celebration isActive={true} />}

      {/* Main Viewport */}
      <div className="w-full flex flex-col flex-1 min-h-0 pt-6 md:pt-10 px-6 pb-6 relative z-10 items-center overflow-hidden">
        
        {/* TOP TOOLBAR */}
        <div className="w-full max-w-5xl shrink-0 flex flex-col md:flex-row items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl px-8 py-5 relative z-50 gap-6">
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center justify-center md:justify-start gap-2 drop-shadow-md">
              <ArrowRight size={14} strokeWidth={3} /> Mission Objective
            </h3>
            <p className="text-base font-bold text-white leading-snug drop-shadow-sm">
              {getInstruction()}
            </p>
          </div>
          
          <div className="shrink-0 flex items-center justify-center min-w-[240px]">
            {phase === "LEARN" && (
                <button onClick={handleRunJS} className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/20">
                  <Play size={20} strokeWidth={2.5} /> Run JS Engine
                </button>
            )}
            {phase === "COMPROMISE" && (
                <button onClick={handleResetParticles} className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/20 animate-pulse">
                  <Activity size={20} strokeWidth={2.5} /> Reset to 2,000
                </button>
            )}
            {phase === "IMPROVE_WASM" && (
                <button onClick={handleCompileWASM} className="w-full px-6 py-4 bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 active:scale-95 text-slate-950 font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(132,204,22,0.6)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/40 animate-pulse">
                  <Cpu size={20} strokeWidth={2.5} /> Compile to WASM
                </button>
            )}
            {(phase === "FAIL_LAG" || phase === "TRY_JS") && (
                <div className="px-6 py-4 bg-slate-800/50 text-slate-400 font-black rounded-2xl border border-slate-700/50 flex items-center justify-center gap-3 text-sm uppercase tracking-widest">
                  Processing...
                </div>
            )}
            {phase === "CHALLENGE_SLIDER" && (
                <div className="px-6 py-4 bg-amber-500/10 text-amber-500 font-black rounded-2xl border border-amber-500/50 flex items-center justify-center gap-3 text-sm uppercase tracking-widest animate-pulse">
                  Use Slider Below ↓
                </div>
            )}
          </div>
        </div>

        {/* MAIN SPLIT AREA */}
        <div className="w-full max-w-5xl relative z-20 flex-1 min-h-[350px] max-h-[500px] flex flex-col md:flex-row gap-6 mt-6 md:mt-8">
          
          {/* LEFT: Code Panel */}
          <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
             <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 shrink-0">
                <Code2 className={`w-5 h-5 mr-3 ${isWASM ? "text-lime-400" : "text-amber-500"}`} />
                <span className="text-sm font-mono font-bold text-slate-300">
                  {isWASM ? "⚙️ physics_engine.wasm" : "📄 physics_engine.js"}
                </span>
             </div>
             <div className="flex-1 p-6 relative overflow-hidden font-mono text-[11px] leading-relaxed break-all">
                
                <AnimatePresence>
                  {!isWASM && (
                    <motion.div exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} className="absolute inset-0 p-6 text-amber-200/80">
                      <div className="text-slate-500 mb-4">// TEXT MANUAL (Browser must read & build this while running)</div>
                      <div>function computePhysics(bodies) {'{'}</div>
                      <div className="pl-4">for (let i = 0; i &lt; bodies.length; i++) {'{'}</div>
                      <div className="pl-8">let body = bodies[i];</div>
                      <div className="pl-8">body.vx += body.fx / body.mass;</div>
                      <div className="pl-8">body.vy += body.fy / body.mass;</div>
                      <div className="pl-8">body.x += body.vx;</div>
                      <div className="pl-8">body.y += body.vy;</div>
                      <div className="pl-4">{'}'}</div>
                      <div>{'}'}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isWASM && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} className="absolute inset-0 p-6 text-lime-400/90 font-black tracking-widest leading-loose">
                      <div className="text-slate-500 mb-4 tracking-normal font-normal">// PRE-BUILT BINARY (Runs instantly at full speed)</div>
                      00 61 73 6D 01 00 00 00 01 0B 02 60 01 7F 00 60 00 00 03 02 01 00 07 0C 01 08 63 6F 6D 70 75 74 65 00 00 0A 1B 01 19 00 20 00 41 00 28 02 00 41 04 28 02 00 6A 36 02 00 20 00 0F 0B
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>

          {/* RIGHT: Physics Simulator */}
          <div className="flex-1 flex flex-col gap-4">
             {/* Simulator Canvas */}
             <div className="flex-1 bg-black border-2 border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                <div className="relative w-[200px] h-[200px] flex items-center justify-center">
                  {(phase !== "LEARN") && particles.map((p, i) => (
                    <div key={i} className={`absolute w-2 h-2 rounded-full shadow-lg ${isWASM ? "bg-lime-400" : "bg-amber-500"}`} style={{ transform: `translate(${p.x}px, ${p.y}px)` }} />
                  ))}
                  {phase === "LEARN" && (
                    <div className="text-slate-600 font-mono text-sm flex flex-col items-center">
                       <Activity className="w-12 h-12 mb-2 opacity-50" />
                       ENGINE STANDBY
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {(phase === "FAIL_LAG" || phase === "CHALLENGE_SLIDER") && fps < 30 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-950/40 border-4 border-red-500/50 flex flex-col items-center justify-center z-20 pointer-events-none">
                      <AlertTriangle className="w-16 h-16 text-red-500 mb-2 animate-ping" />
                      <div className="bg-red-950 text-red-500 font-black px-4 py-2 rounded border border-red-500 tracking-widest uppercase">CPU Overload</div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* INTERACTIVE CONTROLS */}
             <div className={`h-24 bg-[#0f172a] rounded-2xl flex items-center px-6 relative shrink-0 shadow-lg gap-6 transition-all duration-300 ${phase === "CHALLENGE_SLIDER" ? "border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "border border-slate-700"}`}>
                
                {/* Slider */}
                <div className="flex-1 flex flex-col justify-center">
                   <div className="flex justify-between items-end mb-2">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                       <SlidersHorizontal size={12} /> Particles
                     </div>
                     <div className="text-sm font-black text-white font-mono">{particleCount}</div>
                   </div>
                   <input 
                     type="range" 
                     min="100" max="2000" step="100"
                     value={particleCount}
                     onChange={(e) => setParticleCount(Number(e.target.value))}
                     disabled={phase !== "CHALLENGE_SLIDER"}
                     className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${phase === "CHALLENGE_SLIDER" ? "bg-amber-500/30 accent-amber-500" : "bg-slate-800 opacity-50"}`}
                   />
                </div>

                {/* FPS Gauge */}
                <div className="w-24 shrink-0 border-l border-slate-700 pl-6 flex flex-col justify-center items-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FPS</div>
                  <div className={`text-3xl font-black font-mono tracking-tighter ${isWASM || fps >= 60 ? "text-lime-400" : fps > 0 ? "text-red-500" : "text-slate-600"}`}>
                    {fps}
                  </div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </LabShell>
  );
}
