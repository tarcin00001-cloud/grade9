"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Play, Cpu, RefreshCcw, Zap, Code2, Binary } from "lucide-react";

// ─── Source Code Snippets ──────────────────────────────────────────────────────

const JS_CODE = `// physics_sim.js  (runs in V8 JavaScript Engine)
// Must be PARSED → COMPILED → OPTIMIZED every load

function runPhysicsTick(bodies) {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const force = (G * bodies[i].m * bodies[j].m) / (dist * dist);
      bodies[i].vx += force * dx / dist / bodies[i].m;
      bodies[i].vy += force * dy / dist / bodies[i].m;
    }
  }
  // V8 struggles: type-checking + GC pressure
  // Result: ~14-18 FPS  
}`;

const CPP_CODE = `// physics_sim.cpp  (compiles → physics.wasm)
// WASM = pre-compiled binary, skips JS engine entirely

#include <cmath>
struct Body { double x, y, vx, vy, m; };

extern "C" void runPhysicsTick(Body* bodies, int n) {
  for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
      double dx = bodies[j].x - bodies[i].x;
      double dy = bodies[j].y - bodies[i].y;
      double dist = sqrt(dx*dx + dy*dy);
      double force = G * bodies[i].m * bodies[j].m / (dist*dist);
      bodies[i].vx += force * dx / dist / bodies[i].m;
      bodies[i].vy += force * dy / dist / bodies[i].m;
    }
  }
  // Compiled to native machine code — zero overhead
  // Result: 60 FPS  
}`;

const WASM_BYTES = `; physics.wasm  (compiled binary)
; Emscripten output — native machine code in browser

00000000: 0061 736d 0100 0000 0105 0160 0000 0303
0000200a: d7d9 4ae2 6c1b e7a3 c85f 2900 28fc 1c16
0000400a: 3800 0941 0228 fd00 3839 0000 4100 2804
0000600a: fd28 2800 fc14 0028 0004 1c28 2800 4101
0000800a: 2804 0009 3900 0041 0028 0003 1c28 2800
; ...2.8KB of dense binary, runs at native CPU speed
; No parsing. No JIT. No GC.  Straight to silicon.`;

// ─── Compile Step Animation ────────────────────────────────────────────────────

const COMPILE_STEPS = [
  { label: "Lexing & Tokenizing C++...", color: "#a78bfa", ms: 600 },
  { label: "Building Abstract Syntax Tree...", color: "#818cf8", ms: 700 },
  { label: "Optimizing with -O3 flags...", color: "#6366f1", ms: 800 },
  { label: "Emitting WebAssembly bytecode...", color: "#3b82f6", ms: 600 },
  { label: "Linking memory segments...", color: "#06b6d4", ms: 500 },
  { label: " physics.wasm ready (2.8 KB)", color: "#10b981", ms: 0 },
];

// ─── FPS Meter ────────────────────────────────────────────────────────────────

function FpsMeter({ fps, maxFps, label, color }: { fps: number; maxFps: number; label: string; color: string }) {
  const pct = Math.min(fps / maxFps, 1);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-300">{label}</span>
        <motion.span
          className="text-2xl font-black tabular-nums"
          style={{ color }}
          key={fps}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          {fps}<span className="text-sm ml-0.5 font-normal text-slate-400">fps</span>
        </motion.span>
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.3, ease: "linear" }}
        />
      </div>
      <div className="flex justify-between mt-0.5 text-[9px] text-slate-600">
        <span>0</span><span>30fps</span><span>60fps</span>
      </div>
    </div>
  );
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────

type RunMode = "IDLE" | "JS" | "COMPILING" | "WASM";

function ParticleViz({ mode }: { mode: RunMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    if (mode === "IDLE" || mode === "COMPILING") {
      cancelAnimationFrame(frameRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const N = mode === "JS" ? 40 : 180; // JS can only handle fewer bodies smoothly
    const isJS = mode === "JS";

    // Init particles
    const bodies = Array.from({ length: N }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: Math.random() * 3 + 1.5,
      hue: 200 + Math.random() * 120,
    }));

    let lastTime = performance.now();
    let frameCount = 0;
    const stutterInterval = isJS ? 8 : 999999; // JS "stutters" every 8 frames

    function draw(now: number) {
      frameCount++;
      tRef.current = now;

      // JS stutter: freeze for ~80ms every N frames
      if (isJS && frameCount % stutterInterval === 0) {
        const blockUntil = performance.now() + 80; // simulate GC pause / recompile
        while (performance.now() < blockUntil) { /* spin */ }
      }

      ctx.fillStyle = "rgba(2, 6, 23, 0.18)";
      ctx.fillRect(0, 0, W, H);

      for (const b of bodies) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x > W) b.vx *= -1;
        if (b.y < 0 || b.y > H) b.vy *= -1;

        // Orbit effect
        const cx = W / 2, cy = H / 2;
        const dx = cx - b.x, dy = cy - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        b.vx += (dx / d) * 0.015;
        b.vy += (dy / d) * 0.015;

        // speed cap
        const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
        if (speed > 3.5) { b.vx *= 3.5 / speed; b.vy *= 3.5 / speed; }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${b.hue}, 80%, 65%, 0.85)`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frameRef.current); };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={220}
      className="w-full h-full rounded-xl"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function WebAssembly9() {
  const { reportComplete } = useLMSBridge("webassembly9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [lang, setLang] = useState<"JS" | "CPP">("JS");
  const [mode, setMode] = useState<RunMode>("IDLE");
  const [compileStep, setCompileStep] = useState(-1);
  const [jsFps, setJsFps] = useState(0);
  const [wasmFps, setWasmFps] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const fpsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopFps = () => {
    if (fpsRef.current) { clearInterval(fpsRef.current); fpsRef.current = null; }
  };

  const runJS = () => {
    if (mode !== "IDLE") return;
    setLang("JS");
    setMode("JS");
    setWasmFps(0);
    playPop();

    // Simulate erratic JS FPS
    let t = 0;
    const targets = [18, 14, 16, 8, 18, 12, 15, 9, 17, 13];
    fpsRef.current = setInterval(() => {
      setJsFps(targets[t % targets.length]);
      t++;
    }, 400);
  };

  const compileToWasm = async () => {
    if (mode === "COMPILING" || lang !== "CPP") return;
    stopFps();
    setMode("COMPILING");
    setCompileStep(0);
    playZap();

    for (let i = 0; i < COMPILE_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, COMPILE_STEPS[i].ms + 100));
      setCompileStep(i);
      if (i < COMPILE_STEPS.length - 1) playPop();
    }

    playSuccess();
    setMode("WASM");
    setJsFps(0);

    // Smooth 60 FPS
    let t = 0;
    const wTargets = [58, 60, 60, 59, 60, 60, 58, 60, 60, 59];
    fpsRef.current = setInterval(() => {
      setWasmFps(wTargets[t % wTargets.length]);
      t++;
      if (t === 5 && !hasWon) {
        setHasWon(true);
        setTimeout(reportComplete, 1500);
      }
    }, 350);
  };

  const reset = () => {
    stopFps();
    setMode("IDLE");
    setLang("JS");
    setCompileStep(-1);
    setJsFps(0);
    setWasmFps(0);
    setHasWon(false);
    playZap();
  };

  const shownCode = lang === "JS" ? JS_CODE : lang === "CPP" && mode !== "WASM" ? CPP_CODE : WASM_BYTES;
  const codeLabel = lang === "JS" ? "physics_sim.js" : mode === "WASM" ? "physics.wasm  ← compiled binary" : "physics_sim.cpp";

  return (
    <LabShell labId="webassembly9" theme="studio" title="WebAssembly (WASM) Speed" subtitle="L44 · Browser Engines"
      instruction="A physics simulator needs to hit 60 FPS. Running it as JavaScript hits V8's parse/compile bottlenecks and stutters. Switch source to C++, compile it to WebAssembly, and inject the .wasm binary into the browser — bypassing the JS engine entirely for near-native speed." compact>

      <Celebration isActive={hasWon} message="60 FPS Unlocked! WebAssembly bypasses V8's JavaScript engine entirely. Because it's already compiled native machine code, there's zero parsing, zero JIT compilation, and zero garbage collection pauses — the browser runs it at hardware speed." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1">

        {/* ── Top Controls ── */}
        <div className="shrink-0 panel-glass rounded-2xl border-violet-900/40 p-3 flex flex-wrap items-center gap-3">

          {/* Language Selector */}
          <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl border border-slate-800">
            <button
              onClick={() => { if (mode === "IDLE") { setLang("JS"); } }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${lang === "JS" ? "bg-amber-500/20 border border-amber-500/50 text-amber-300" : "text-slate-500 hover:text-slate-300"}`}
            >
              <span className="flex items-center gap-1.5"><Code2 size={12}/> JavaScript</span>
            </button>
            <button
              onClick={() => { if (mode !== "WASM" && mode !== "COMPILING") { setLang("CPP"); stopFps(); setMode("IDLE"); setJsFps(0); } }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${lang === "CPP" ? "bg-violet-500/20 border border-violet-500/50 text-violet-300" : "text-slate-500 hover:text-slate-300"}`}
            >
              <span className="flex items-center gap-1.5"><Cpu size={12}/> C++</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-700/60"/>

          {lang === "JS" ? (
            <button
              onClick={runJS}
              disabled={mode === "JS"}
              className="px-5 py-2 rounded-xl text-xs font-black bg-amber-600/20 border border-amber-600/50 text-amber-300 hover:bg-amber-600/30 transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <Play size={13}/> Run in JavaScript
            </button>
          ) : (
            <button
              onClick={compileToWasm}
              disabled={mode === "COMPILING" || mode === "WASM"}
              className="px-5 py-2 rounded-xl text-xs font-black bg-violet-600 border border-violet-400 text-white hover:bg-violet-500 transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              <Binary size={13}/> Compile → WebAssembly
            </button>
          )}

          {mode === "WASM" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <Zap size={13}/> physics.wasm injected into browser
            </div>
          )}

          <div className="ml-auto">
            <button onClick={reset} className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-all">
              <RefreshCcw size={14}/>
            </button>
          </div>
        </div>

        {/* ── Main Area: Code + Visualizer ── */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3">

          {/* Code Pane */}
          <div className="lg:w-[400px] shrink-0 flex flex-col panel-glass rounded-2xl border-violet-900/40 overflow-hidden">
            <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-violet-900/40 bg-violet-950/20">
              {mode === "WASM"
                ? <Binary size={13} className="text-emerald-400"/>
                : lang === "CPP" ? <Cpu size={13} className="text-violet-400"/> : <Code2 size={13} className="text-amber-400"/>
              }
              <span className={`text-xs font-bold font-mono ${mode === "WASM" ? "text-emerald-300" : lang === "CPP" ? "text-violet-300" : "text-amber-300"}`}>
                {codeLabel}
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={codeLabel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className={`text-[10.5px] leading-relaxed whitespace-pre-wrap font-mono ${
                    mode === "WASM" ? "text-emerald-400/90" : lang === "CPP" ? "text-violet-300/90" : "text-amber-300/90"
                  }`}
                >
                  {shownCode}
                </motion.pre>
              </AnimatePresence>
            </div>

            {/* Compiler log */}
            <AnimatePresence>
              {mode === "COMPILING" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-violet-900/40 overflow-hidden"
                >
                  <div className="p-3 font-mono text-xs flex flex-col gap-1 bg-black/40">
                    <div className="text-slate-500 text-[10px] mb-1">emcc -O3 -o physics.wasm physics_sim.cpp</div>
                    {COMPILE_STEPS.slice(0, compileStep + 1).map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ color: step.color }}
                        className="text-[10px]"
                      >
                        {i < compileStep ? "" : "›"} {step.label}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Simulation + FPS */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">

            {/* Particle Canvas */}
            <div className="flex-1 min-h-0 panel-glass rounded-2xl border-violet-900/40 bg-[#020617] overflow-hidden relative">
              {mode === "IDLE" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Cpu size={36} strokeWidth={1}/>
                  <p className="text-sm font-bold">Select a language and run the physics simulator</p>
                  <p className="text-xs text-slate-600">200 orbiting particles — needs 60 FPS to look smooth</p>
                </div>
              )}
              {mode === "COMPILING" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Binary size={40} className="text-violet-400"/>
                  </motion.div>
                  <p className="text-sm font-bold text-violet-300">Compiling to WebAssembly...</p>
                  <p className="text-xs text-violet-500 font-mono">emcc -O3 physics_sim.cpp → physics.wasm</p>
                </div>
              )}
              <ParticleViz mode={mode} />

              {/* FPS overlay when running */}
              {(mode === "JS" || mode === "WASM") && (
                <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg font-mono text-xs font-black border ${
                  mode === "JS" ? "bg-rose-950/80 border-rose-700/50 text-rose-300" : "bg-emerald-950/80 border-emerald-700/50 text-emerald-300"
                }`}>
                  {mode === "JS" ? `~${jsFps} FPS ` : `${wasmFps} FPS `}
                </div>
              )}

              {/* Mode label */}
              {(mode === "JS" || mode === "WASM") && (
                <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                  mode === "JS" ? "bg-amber-950/70 border-amber-800/50 text-amber-400" : "bg-violet-950/70 border-violet-700/50 text-violet-300"
                }`}>
                  {mode === "JS" ? "V8 JavaScript Engine" : "WebAssembly Runtime (native)"}
                </div>
              )}
            </div>

            {/* FPS Meters */}
            <div className="shrink-0 panel-glass rounded-2xl border-violet-900/40 p-4 flex gap-5 items-start">
              <FpsMeter fps={jsFps} maxFps={60} label="JavaScript (V8)" color="#f59e0b"/>
              <div className="w-px h-14 bg-slate-700/50 self-center"/>
              <FpsMeter fps={wasmFps} maxFps={60} label="WebAssembly" color="#10b981"/>
            </div>

            {/* Insight Box */}
            <AnimatePresence>
              {mode === "WASM" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="shrink-0 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-2"
                >
                  <Zap size={14} className="shrink-0 mt-0.5 text-emerald-400"/>
                  <span>
                    <strong>Why so fast?</strong> The <code className="text-emerald-200">.wasm</code> binary is already machine code — the browser skips parsing, JIT compilation, and garbage collection entirely. It runs <strong>4× more bodies</strong> at <strong>4× higher FPS</strong>.
                  </span>
                </motion.div>
              )}
              {mode === "JS" && jsFps > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="shrink-0 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2"
                >
                  <Play size={14} className="shrink-0 mt-0.5 text-amber-400"/>
                  <span>
                    <strong>V8 is struggling!</strong> Every time the simulation runs, V8 must parse your source text, JIT-compile hot functions, and pause for garbage collection. Switch to <strong>C++ → Compile → WASM</strong> to fix this!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </LabShell>
  );
}
