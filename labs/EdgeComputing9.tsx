"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Car, Cloud, RefreshCcw } from "lucide-react";

// ─── SVG Edge Computing Visualizer ────────────────────────────────────────────

type Phase = "IDLE" | "SEND_CLOUD" | "CRASH" | "SEND_EDGE" | "STOP_SAFE" | "DONE";

function EdgeSVG({ phase, mode }: { phase: Phase; mode: "CLOUD" | "EDGE" }) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-edge">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridEdge" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridEdge)" />

      {/* ── World Map Dots (Background) ── */}
      <g opacity="0.2" fill="#334155">
        <circle cx="200" cy="300" r="40" /> {/* London Area */}
        <circle cx="750" cy="200" r="50" /> {/* Tokyo Area */}
        <path d="M 200,300 Q 400,100 750,200" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
      </g>

      {/* ── Scene (Left Side: London) ── */}
      <g transform="translate(100, 300)">
        
        {/* The Road and Obstacle */}
        <rect x="0" y="50" width="300" height="20" fill="#0f172a" />
        <rect x="250" y="30" width="20" height="40" fill="#fb7185" />
        <text x="260" y="20" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">OBSTACLE</text>
        
        {/* The Autonomous Car */}
        <motion.g 
          initial={{ x: 0 }} 
          animate={{ x: phase === "CRASH" ? 230 : (phase === "STOP_SAFE" ? 180 : 0) }} 
          transition={{ duration: phase === "CRASH" ? 1 : 0.8, ease: "linear" }}
        >
           <rect x="0" y="30" width="40" height="20" fill="#c084fc" rx="4" />
           <circle cx="10" cy="50" r="6" fill="#000" />
           <circle cx="30" cy="50" r="6" fill="#000" />
           <text x="20" y="20" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">IoT Car</text>

           {/* Crash explosion */}
           {phase === "CRASH" && (
              <motion.circle cx="40" cy="40" r="30" fill="#fb7185" opacity="0.6" filter="url(#glow-edge)" initial={{ scale: 0 }} animate={{ scale: 1 }} />
           )}
        </motion.g>

        {/* Local Edge Tower (5G) */}
        {mode === "EDGE" && (
          <g transform="translate(100, -80)">
             <rect x="-10" y="-40" width="20" height="80" fill="#064e3b" rx="2" stroke="#10b981" strokeWidth="2" />
             <circle cx="0" cy="-40" r="15" fill="#059669" filter="url(#glow-edge)" className="animate-pulse" />
             <text x="0" y="-60" fill="#a7f3d0" fontSize="12" fontWeight="bold" textAnchor="middle">Local Edge Server</text>
             <text x="0" y="-80" fill="#34d399" fontSize="10" textAnchor="middle">10ms Latency</text>
          </g>
        )}
      </g>

      {/* ── Distant Cloud (Right Side: Tokyo AWS) ── */}
      <g transform="translate(750, 200)">
        <rect x="-60" y="-60" width="120" height="120" fill="#1e1b4b" rx="16" stroke="#8b5cf6" strokeWidth="4" />
        <text x="0" y="-70" fill="#c4b5fd" fontSize="14" fontWeight="bold" textAnchor="middle">Central Cloud (Tokyo)</text>
        <text x="0" y="-90" fill="#fb7185" fontSize="10" fontWeight="bold" textAnchor="middle">200ms Latency</text>
        <path d="M -40,-40 C -60,-60 -20,-80 0,-60 C 20,-80 60,-60 40,-40" fill="#a78bfa" opacity="0.3" />
      </g>

      {/* ── Animations (Data Transmission) ── */}
      <AnimatePresence>
        
        {/* Cloud Flow (Slow) */}
        {phase === "SEND_CLOUD" && (
          <g>
             {/* Sensor data to Cloud */}
             <motion.rect x="-10" y="-5" width="20" height="10" fill="#c084fc" rx="2" filter="url(#glow-edge)"
                initial={{ x: 120, y: 330 }} animate={{ x: 750, y: 200 }} transition={{ duration: 0.8, ease: "linear" }}
             />
             {/* Brake command from Cloud (Arrives too late!) */}
             <motion.rect x="-10" y="-5" width="20" height="10" fill="#fb7185" rx="2" filter="url(#glow-edge)"
                initial={{ x: 750, y: 200 }} animate={{ x: 330, y: 330 }} transition={{ duration: 0.8, delay: 0.8, ease: "linear" }}
             />
          </g>
        )}

        {/* Edge Flow (Instant) */}
        {phase === "SEND_EDGE" && (
          <g>
             {/* Sensor data to Edge */}
             <motion.rect x="-10" y="-5" width="20" height="10" fill="#c084fc" rx="2" filter="url(#glow-edge)"
                initial={{ x: 120, y: 330 }} animate={{ x: 200, y: 220 }} transition={{ duration: 0.2, ease: "linear" }}
             />
             {/* Brake command from Edge (Instant) */}
             <motion.rect x="-10" y="-5" width="20" height="10" fill="#34d399" rx="2" filter="url(#glow-edge)"
                initial={{ x: 200, y: 220 }} animate={{ x: 140, y: 330 }} transition={{ duration: 0.2, delay: 0.2, ease: "linear" }}
             />
          </g>
        )}

      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function EdgeComputing9() {
  const { reportComplete } = useLMSBridge("edgecomputing9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<"CLOUD" | "EDGE">("CLOUD");
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [hasWon, setHasWon] = useState(false);

  const simulateDriving = () => {
    if (phase !== "IDLE" && phase !== "DONE") return;

    if (mode === "CLOUD") {
       setPhase("SEND_CLOUD");
       playPop();

       // Car crashes before signal comes back
       setTimeout(() => {
          setPhase("CRASH");
          playError(); // Boom

          setTimeout(() => {
             setPhase("IDLE");
          }, 2000);
       }, 800); 
    } else {
       setPhase("SEND_EDGE");
       playPop();

       // Edge server is local, signal returns instantly
       setTimeout(() => {
          playZap(); // Brake command received

          setTimeout(() => {
             setPhase("STOP_SAFE");
             playSuccess();

             setTimeout(() => {
                setPhase("DONE");
                if (!hasWon) {
                   setHasWon(true);
                   setTimeout(reportComplete, 1500);
                }
             }, 1000);
          }, 200);
       }, 200);
    }
  };

  const toggleMode = () => {
    setMode(m => m === "CLOUD" ? "EDGE" : "CLOUD");
    setPhase("IDLE");
    playZap();
  };

  return (
    <LabShell labId="edgecomputing9" theme="cosmos" title="Edge Computing Latency" subtitle="L44 · Cloud Infrastructure"
      instruction="An autonomous car in London detects an obstacle. In 'Cloud Mode', the sensor data is sent 6000 miles to a central server in Tokyo to calculate the brake command. It takes 200ms round-trip. Switch to 'Edge Mode', where the data is processed at a local 5G tower 2 miles away in 10ms." compact>
      
      <Celebration isActive={hasWon} message="Car Stopped Safely! The speed of light is a hard physical limit in computing. You cannot send data across the ocean instantly. For mission-critical IoT devices (like self-driving cars or factory robots), the compute hardware must be placed on the 'Edge' of the network, physically close to the user." onReplay={() => {
        setMode("CLOUD"); setPhase("IDLE"); setHasWon(false);
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-sky-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={toggleMode} 
            disabled={phase !== "IDLE" && phase !== "DONE"}
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${mode === "CLOUD" ? "bg-stone-800 border-stone-600 text-stone-300" : "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-[0_0_20px_rgba(14,165,233,0.3)]"} disabled:opacity-50`}
          >
            {mode === "CLOUD" ? <Cloud size={20}/> : <Car size={20}/>}
            Infrastructure: {mode === "CLOUD" ? "Centralized Cloud (Tokyo)" : "Local Edge Tower (London)"}
          </button>
          
          <button 
            onClick={simulateDriving} 
            disabled={phase !== "IDLE" && phase !== "DONE"}
            className="px-8 py-3 rounded-xl font-black bg-purple-600/20 border-2 border-purple-500/50/50 text-blue-400 hover:bg-purple-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
          >
            Simulate Autonomous Event
          </button>

          <button onClick={() => { setPhase("IDLE"); }} className="px-4 py-3 rounded-xl font-black bg-stone-800/80 border-2 border-stone-700 text-stone-300 hover:bg-stone-700 transition-all">
            <RefreshCcw size={18}/>
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-sky-900/40 bg-[#0c0a09] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <EdgeSVG phase={phase} mode={mode} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
