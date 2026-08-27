"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Box, Layers, Cpu, Server } from "lucide-react";

// ─── SVG Containerization Visualizer ──────────────────────────────────────────

function ArchitectureSVG({
  mode,
  appsDeployed
}: {
  mode: "VM" | "CONTAINER";
  appsDeployed: number;
}) {
  const isVM = mode === "VM";

  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-heavy">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-light">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridArc" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridArc)" />

      {/* ── Base Infrastructure (Common) ── */}
      <g transform="translate(150, 400)">
        <rect x="0" y="0" width="600" height="60" fill="#0f172a" rx="8" stroke="#334155" strokeWidth="4" />
        <text x="300" y="35" fill="#94a3b8" fontSize="20" fontWeight="bold" textAnchor="middle" letterSpacing="4">PHYSICAL HARDWARE (CPU/RAM)</text>
      </g>

      <g transform="translate(150, 340)">
        <rect x="0" y="0" width="600" height="50" fill="#1e1b4b" rx="8" stroke="#4f46e5" strokeWidth="4" />
        <text x="300" y="30" fill="#a5b4fc" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="2">HOST OS / KERNEL</text>
      </g>

      {/* ── Hypervisor vs Docker Engine ── */}
      <g transform="translate(150, 280)">
        <rect x="0" y="0" width="600" height="50" fill={isVM ? "#4c0519" : "#082f49"} rx="8" stroke={isVM ? "#e11d48" : "#0284c7"} strokeWidth="4" style={{ transition: "all 0.3s" }} />
        <text x="300" y="30" fill={isVM ? "#fca5a5" : "#7dd3fc"} fontSize="18" fontWeight="black" textAnchor="middle" style={{ transition: "all 0.3s" }}>
          {isVM ? "HYPERVISOR (VMware / ESXi)" : "DOCKER ENGINE"}
        </text>
      </g>

      {/* ── Applications Deployed ── */}
      {/* Container Mode: Lightweight, sharing the kernel */}
      <AnimatePresence>
        {!isVM && appsDeployed > 0 && Array.from({length: appsDeployed}).map((_, i) => (
          <motion.g 
            key={`cont-${i}`}
            initial={{ y: -100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: i * 0.1 }}
            transform={`translate(${170 + i * 150}, 80)`}
          >
            <rect x="0" y="0" width="120" height="190" fill="#020617" rx="12" stroke="#0ea5e9" strokeWidth="3" filter="url(#glow-light)" />
            
            <rect x="20" y="20" width="80" height="60" fill="#0c4a6e" rx="6" />
            <text x="60" y="55" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">APP {i+1}</text>
            
            <rect x="20" y="100" width="80" height="70" fill="#082f49" rx="6" stroke="#0ea5e9" strokeDasharray="4 2" />
            <text x="60" y="130" fill="#7dd3fc" fontSize="10" fontWeight="bold" textAnchor="middle">Bins / Libs</text>
            <text x="60" y="150" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">~50 MB</text>
            
            {/* Direct pipe to kernel bypassing heavy OS */}
            <path d="M 60,190 L 60,210" fill="none" stroke="#0ea5e9" strokeWidth="4" />
          </motion.g>
        ))}
      </AnimatePresence>

      {/* VM Mode: Heavy, isolated Guest OS */}
      <AnimatePresence>
        {isVM && appsDeployed > 0 && Array.from({length: appsDeployed}).map((_, i) => (
          <motion.g 
            key={`vm-${i}`}
            initial={{ y: -100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            // Slower animation to simulate "heavy" VM booting
            transition={{ type: "spring", stiffness: 40, damping: 20, delay: i * 0.4 }}
            transform={`translate(${160 + i * 290}, 20)`}
          >
            <rect x="0" y="0" width="260" height="250" fill="#171717" rx="12" stroke="#f43f5e" strokeWidth="4" filter="url(#glow-heavy)" />
            
            <rect x="30" y="20" width="200" height="60" fill="#4c0519" rx="6" />
            <text x="130" y="55" fill="#fff" fontSize="20" fontWeight="bold" textAnchor="middle">APP {i+1}</text>
            
            <rect x="30" y="100" width="200" height="50" fill="#2a111a" rx="6" stroke="#f43f5e" strokeDasharray="4 2" />
            <text x="130" y="125" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle">Bins / Libs</text>

            {/* The massive Guest OS block */}
            <rect x="20" y="170" width="220" height="60" fill="#7f1d1d" rx="6" stroke="#f87171" strokeWidth="2" />
            <text x="130" y="195" fill="#fff" fontSize="14" fontWeight="black" textAnchor="middle" letterSpacing="2">GUEST OS (Ubuntu)</text>
            <text x="130" y="215" fill="#fca5a5" fontSize="12" fontFamily="monospace" textAnchor="middle">Size: ~20 GB | Boot: 45s</text>
            
            <path d="M 130,250 L 130,270" fill="none" stroke="#f43f5e" strokeWidth="6" />
          </motion.g>
        ))}
      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Containerization9() {
  const { reportComplete } = useLMSBridge("containerization9");
  const { playPop, playZap, playDrop, playError } = useLabAudio();

  const [mode, setMode] = useState<"VM" | "CONTAINER">("VM");
  const [appsDeployed, setAppsDeployed] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  const toggleMode = () => {
    playPop();
    setMode(m => m === "VM" ? "CONTAINER" : "VM");
    setAppsDeployed(0); // Reset deployments on switch
  };

  const deployApp = () => {
    if (mode === "VM" && appsDeployed >= 2) {
       playError(); // VMs are too heavy, max 2
       return;
    }
    if (mode === "CONTAINER" && appsDeployed >= 4) {
       return; // Max 4 containers for visual space
    }

    if (mode === "VM") playDrop(); // heavy thud sound
    else playZap(); // light fast sound

    const newCount = appsDeployed + 1;
    setAppsDeployed(newCount);

    if (mode === "CONTAINER" && newCount >= 3 && !hasWon) {
      setHasWon(true);
      setTimeout(reportComplete, 1500);
    }
  };

  return (
    <LabShell labId="containerization9" theme="forge" title="VMs vs Docker Containers" subtitle="L23 · Cloud Architecture"
      instruction="Deploy applications in VM mode, then switch to Docker mode. Notice how containers strip away the 20GB Guest OS layer, sharing the base kernel directly for instant booting and infinite scaling." compact>
      
      <Celebration isActive={hasWon} message="Containerization Mastered! By eliminating the heavy Guest OS, Docker allows you to run hundreds of isolated apps on the same server instantly." onReplay={() => {
        setMode("VM"); setAppsDeployed(0); setHasWon(false);
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-slate-700/50 p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <button 
            onClick={toggleMode} 
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${mode === "VM" ? "bg-rose-500/20 border-rose-500/50 text-rose-300" : "bg-sky-500/20 border-sky-500/50 text-sky-300"}`}
          >
            {mode === "VM" ? <Server size={20}/> : <Box size={20}/>}
            Architecture: {mode === "VM" ? "Virtual Machines" : "Docker Containers"}
          </button>
          
          <button 
            onClick={deployApp} 
            disabled={mode === "VM" ? appsDeployed >= 2 : appsDeployed >= 4}
            className={`px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all border-2 ${mode === "VM" ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/30 disabled:opacity-50" : "bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/30 hover:scale-[1.02] shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:opacity-50"}`}
          >
            <Layers size={18}/> Deploy Application {appsDeployed + 1}
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-hidden relative border-slate-800 bg-[#020617] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <ArchitectureSVG mode={mode} appsDeployed={appsDeployed} />
          </div>
          
          {mode === "VM" && appsDeployed >= 2 && (
            <div className="absolute top-10 right-10 panel-glass bg-rose-500/20 border-rose-500/50 p-4 rounded-xl">
              <p className="text-rose-400 font-black text-sm uppercase">Server Overloaded</p>
              <p className="text-rose-300 text-xs">Cannot boot more VMs (RAM exhausted by Guest OS).</p>
            </div>
          )}
        </div>

      </div>
    </LabShell>
  );
}
