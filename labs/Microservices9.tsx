"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Bug, ArrowRightLeft, ShieldAlert } from "lucide-react";

// ─── SVG Microservices Visualizer ─────────────────────────────────────────────

function ArchSVG({
  mode,
  bugActive
}: {
  mode: "MONOLITH" | "MICROSERVICES";
  bugActive: boolean;
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-virus">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridArch" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridArch)" />

      {/* ── Monolith Architecture (Left Side Conceptually) ── */}
      {mode === "MONOLITH" && (
        <g transform="translate(300, 100)">
          <text x="150" y="-30" fill="#94a3b8" fontSize="20" fontWeight="black" textAnchor="middle">MONOLITH (One Giant App)</text>
          
          {/* The Giant Block */}
          <rect 
            x="0" y="0" width="300" height="300" 
            fill={bugActive ? "#4c0519" : "#0f172a"} 
            rx="16" 
            stroke={bugActive ? "#ef4444" : "#3b82f6"} 
            strokeWidth="6" 
            style={{ transition: "all 0.5s ease" }}
          />
          
          {/* Internal Modules */}
          <rect x="20" y="20" width="120" height="120" fill={bugActive ? "#7f1d1d" : "#1e3a8a"} rx="8" />
          <text x="80" y="85" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">UI Frontend</text>

          <rect x="160" y="20" width="120" height="120" fill={bugActive ? "#7f1d1d" : "#1e3a8a"} rx="8" />
          <text x="220" y="85" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">Auth</text>

          <rect x="20" y="160" width="120" height="120" fill={bugActive ? "#ef4444" : "#1e3a8a"} rx="8" />
          <text x="80" y="225" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">Cart Module</text>

          <rect x="160" y="160" width="120" height="120" fill={bugActive ? "#7f1d1d" : "#1e3a8a"} rx="8" />
          <text x="220" y="225" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">Billing</text>

          {/* Virus Overlay */}
          <AnimatePresence>
            {bugActive && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                <circle cx="80" cy="220" r="30" fill="#fb7185" filter="url(#glow-virus)" />
                <text x="80" y="225" fill="#fff" fontSize="12" fontWeight="black" textAnchor="middle">FATAL</text>
                
                {/* Infection spread lines */}
                <path d="M 80,160 L 80,140 M 140,220 L 160,220 M 120,180 L 180,120" fill="none" stroke="#f43f5e" strokeWidth="8" strokeDasharray="10 10" className="animate-[dash_0.5s_linear_infinite]" />
                
                <text x="150" y="155" fill="#fca5a5" fontSize="24" fontWeight="black" textAnchor="middle" filter="url(#glow-virus)">ENTIRE SYSTEM DOWN</text>
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      )}

      {/* ── Microservices Architecture (Right Side Conceptually) ── */}
      {mode === "MICROSERVICES" && (
        <g transform="translate(150, 100)">
          <text x="300" y="-30" fill="#94a3b8" fontSize="20" fontWeight="black" textAnchor="middle">MICROSERVICES (Decoupled)</text>

          {/* API Gateway */}
          <rect x="100" y="0" width="400" height="40" fill="#1e1b4b" rx="8" stroke="#8b5cf6" strokeWidth="3" />
          <text x="300" y="25" fill="#c4b5fd" fontSize="16" fontWeight="bold" textAnchor="middle">API Gateway Router</text>

          {/* Network Lines */}
          <path d="M 180,40 L 180,120" fill="none" stroke="#334155" strokeWidth="4" />
          <path d="M 300,40 L 300,120" fill="none" stroke="#334155" strokeWidth="4" />
          <path d="M 420,40 L 420,120" fill="none" stroke={bugActive ? "#ef4444" : "#334155"} strokeWidth="4" strokeDasharray={bugActive ? "10 10" : "none"} />
          <path d="M 540,40 L 540,120" fill="none" stroke="#334155" strokeWidth="4" />

          {/* Independent Services */}
          <rect x="120" y="120" width="120" height="120" fill="#064e3b" rx="16" stroke="#10b981" strokeWidth="3" />
          <text x="180" y="185" fill="#a7f3d0" fontSize="16" fontWeight="bold" textAnchor="middle">UI Frontend</text>

          <rect x="240" y="120" width="120" height="120" fill="#064e3b" rx="16" stroke="#10b981" strokeWidth="3" />
          <text x="300" y="185" fill="#a7f3d0" fontSize="16" fontWeight="bold" textAnchor="middle">Auth</text>

          {/* The Buggy Cart Service */}
          <rect x="360" y="120" width="120" height="120" fill={bugActive ? "#4c0519" : "#064e3b"} rx="16" stroke={bugActive ? "#ef4444" : "#10b981"} strokeWidth="3" />
          <text x="420" y="185" fill={bugActive ? "#fca5a5" : "#a7f3d0"} fontSize="16" fontWeight="bold" textAnchor="middle">Cart Service</text>

          <rect x="480" y="120" width="120" height="120" fill="#064e3b" rx="16" stroke="#10b981" strokeWidth="3" />
          <text x="540" y="185" fill="#a7f3d0" fontSize="16" fontWeight="bold" textAnchor="middle">Billing</text>

          {/* Virus Overlay (Isolated) */}
          <AnimatePresence>
            {bugActive && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                <circle cx="420" cy="180" r="30" fill="#fb7185" filter="url(#glow-virus)" />
                <text x="420" y="185" fill="#fff" fontSize="12" fontWeight="black" textAnchor="middle">CRASH</text>
                
                {/* Traffic rerouting UI */}
                <path d="M 380,20 C 380,-20 460,-20 460,20" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="5 5" className="animate-[dash_0.5s_linear_infinite]" />
                <text x="420" y="-30" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">Traffic Rerouted</text>

                <text x="300" y="280" fill="#34d399" fontSize="18" fontWeight="black" textAnchor="middle">UI, Auth, and Billing remain 100% ONLINE.</text>
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      )}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Microservices9() {
  const { reportComplete } = useLMSBridge("microservices9");
  const { playZap, playError, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<"MONOLITH" | "MICROSERVICES">("MONOLITH");
  const [bugActive, setBugActive] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const injectBug = () => {
    if (bugActive) return;
    setBugActive(true);
    playError(); // Boom

    // If they survive via Microservices
    if (mode === "MICROSERVICES" && !hasWon) {
       setTimeout(() => {
          setHasWon(true);
          playSuccess();
          setTimeout(reportComplete, 1500);
       }, 2000);
    }
  };

  const toggleMode = () => {
    setMode(m => m === "MONOLITH" ? "MICROSERVICES" : "MONOLITH");
    setBugActive(false);
    playZap();
  };

  return (
    <LabShell labId="microservices9" theme="cosmos" title="Microservices Architecture" subtitle="L34 · System Architecture"
      instruction="Inject a fatal memory bug into the 'Cart' code. In a Monolith, all code runs in the same block, so a bug in the Cart crashes the entire website. Switch to Microservices to see how physical isolation prevents a single failure from taking down the whole company." compact>
      
      <Celebration isActive={hasWon} message="Isolation Successful! Microservices divide an app into tiny, independent servers talking over APIs. If the Cart Service crashes, the API Gateway simply returns an error for carts, while the rest of the site (Auth, Billing) functions perfectly." onReplay={() => {
        setBugActive(false); setHasWon(false);
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-violet-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={toggleMode} 
            disabled={bugActive}
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${mode === "MONOLITH" ? "bg-stone-800 border-stone-600 text-stone-300" : "bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]"} disabled:opacity-50`}
          >
            <ArrowRightLeft size={20}/> Architecture: {mode === "MONOLITH" ? "Monolith (Single App)" : "Microservices (Isolated)"}
          </button>
          
          <button 
            onClick={injectBug} 
            disabled={bugActive}
            className="px-8 py-3 rounded-xl font-black bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 hover:bg-rose-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
          >
            <ShieldAlert size={18}/> Inject Bug into Cart Code
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-violet-900/40 bg-[#0c0a09] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <ArchSVG mode={mode} bugActive={bugActive} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
