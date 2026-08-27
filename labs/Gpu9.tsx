"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Cpu, 
  Server, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Sliders, 
  Sparkles, 
  ArrowRight,
  Info
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ComponentId = "gpu" | "vram" | "fan" | "cable";

interface GPUComponent {
  id: ComponentId;
  name: string;
  desc: string;
  keywords: string[];
  technical: string;
}

const COMPONENTS: GPUComponent[] = [
  {
    id: "gpu",
    name: "GPU Core Chip",
    desc: "The main processing engine packed with thousands of mini shader cores.",
    keywords: ["Silicon Die", "2,540 Parallel Cores", "Matrix Operations", "Heats up fast"],
    technical: "Does millions of simple pixel calculations at the exact same time, performing matrix math for 3D textures."
  },
  {
    id: "vram",
    name: "High-Speed VRAM",
    desc: "Dedicated video memory to hold high-resolution game textures.",
    keywords: ["GDDR6 Memory", "Holds Textures", "Gigabytes of space", "Fast bandwidth"],
    technical: "Stores color buffers, mesh coordinates, and large image files so the core chip doesn't have to wait."
  },
  {
    id: "fan",
    name: "Dual Cooling Fans",
    desc: "Heavy heatsink cooler to disperse heat under processing workloads.",
    keywords: ["Dual fans", "Aluminium fins", "Heat pipes", "Disperses heat"],
    technical: "GPUs get hot very quickly! Cooling fans draw heat away to prevent components from melting during games."
  },
  {
    id: "cable",
    name: "PCIe Power Cable",
    desc: "Direct power lines supplying electricity to run the graphics card.",
    keywords: ["8-Pin Socket", "Direct PSU link", "225W Power delivery", "Locked connectors"],
    technical: "The GPU draws more power than the motherboard can supply on its own, requiring extra power lines."
  }
];

// Coordinate slot positions over the motherboard/pc layout background (pc.png)
const SLOT_POSITIONS: Record<ComponentId, { left: string; top: string; width: string; height: string }> = {
  vram:  { left: "4%", top: "30%", width: "18%", height: "35%" },
  gpu:   { left: "26%", top: "35%", width: "18%", height: "26%" },
  fan:   { left: "48%", top: "30%", width: "24%", height: "36%" },
  cable: { left: "76%", top: "42%", width: "18%", height: "18%" }
};

// ─── INLINE PARTS SVGS ───────────────────────────────────────────────────────

const PartSVG = ({ id }: { id: ComponentId }) => {
  switch (id) {
    case "vram":
      return (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          <rect x="5" y="5" width="70" height="110" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="3" />
          <line x1="5" y1="105" x2="75" y2="105" stroke="#f59e0b" strokeWidth="4" strokeDasharray="3,2" />
          {/* VRAM Memory Blocks */}
          <rect x="15" y="15" width="20" height="25" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <rect x="45" y="15" width="20" height="25" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <rect x="15" y="55" width="20" height="25" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <rect x="45" y="55" width="20" height="25" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        </svg>
      );
    case "fan":
      return (
        <svg viewBox="0 0 140 100" className="w-full h-full">
          {/* Heatsink Fins */}
          <rect x="10" y="10" width="120" height="80" rx="10" fill="#475569" stroke="#64748b" strokeWidth="3" />
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1={20 + i * 5.8} y1="15" x2={20 + i * 5.8} y2="85" stroke="#334155" strokeWidth="2" />
          ))}
          {/* Twin Fan Rings */}
          <circle cx="45" cy="50" r="28" fill="#1e293b" stroke="#334155" strokeWidth="3" />
          <circle cx="95" cy="50" r="28" fill="#1e293b" stroke="#334155" strokeWidth="3" />
          {/* Fan Blades (static preview icon) */}
          <path d="M 45,30 L 45,70 M 25,50 L 65,50 M 31,36 L 59,64 M 31,64 L 59,36" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
          <path d="M 95,30 L 95,70 M 75,50 L 115,50 M 81,36 L 109,64 M 81,64 L 109,36" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "cable":
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Power Connectors */}
          <rect x="25" y="10" width="30" height="25" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="3" />
          <rect x="29" y="5" width="22" height="6" rx="2" fill="#475569" />
          {/* Color Wires */}
          <path d="M 30,35 Q 25,60 10,70" fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
          <path d="M 40,35 Q 40,65 40,75" fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          <path d="M 50,35 Q 55,60 70,70" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

// Twin fans that spin when powered on!
const RotatingFans = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-gray-900/90 rounded-2xl border-4 border-gray-700">
    <svg viewBox="0 0 140 100" className="w-full h-full">
      {/* Twin spinning fans */}
      <circle cx="45" cy="50" r="32" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
      <circle cx="95" cy="50" r="32" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
      {/* Fan 1 Blades */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
        style={{ transformOrigin: "45px 50px" }}
      >
        <circle cx="45" cy="50" r="8" fill="#475569" />
        <path d="M 45,18 L 45,82 M 13,50 L 77,50 M 22,27 L 68,73 M 22,73 L 68,27" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
      </motion.g>
      {/* Fan 2 Blades */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
        style={{ transformOrigin: "95px 50px" }}
      >
        <circle cx="95" cy="50" r="8" fill="#475569" />
        <path d="M 95,18 L 95,82 M 63,50 L 127,50 M 72,27 L 118,73 M 72,73 L 118,27" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
      </motion.g>
    </svg>
  </div>
);

// Particle spark emitter for correct drops
const Sparks = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(16)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400"
        initial={{ x: "50%", y: "50%", scale: 1, opacity: 1 }}
        animate={{
          x: `${50 + (Math.random() - 0.5) * 160}%`,
          y: `${50 + (Math.random() - 0.5) * 160}%`,
          scale: 0,
          opacity: 0,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ left: "40%", top: "40%" }}
      />
    ))}
  </div>
);

// Cute Helper Bot
const HelperBot = ({ state }: { state: "idle" | "dragging" | "success" | "fail" }) => {
  let face = "●‿●";
  let bodyColor = "#a855f7"; // purple casing
  let armPathRight = "M 22,25 C 26,25 28,25 32,25"; 
  let armPathLeft = "M 8,25 C 4,25 2,25 -2,25";
  
  if (state === "dragging") {
    face = "●_●";
    bodyColor = "#38bdf8"; 
    armPathLeft = "M 8,22 C 3,18 0,16 -5,18";
    armPathRight = "M 22,22 C 18,18 15,16 10,18";
  } else if (state === "success") {
    face = "★‿★";
    bodyColor = "#10b981"; 
    armPathLeft = "M 8,20 C 4,12 2,8 -2,4";
    armPathRight = "M 22,20 C 26,12 28,8 32,4";
  } else if (state === "fail") {
    face = "✖_✖";
    bodyColor = "#ef4444"; 
    armPathLeft = "M 8,25 C 5,32 4,36 2,42";
    armPathRight = "M 22,25 C 25,32 26,36 28,42";
  }

  return (
    <motion.div
      animate={
        state === "dragging"
          ? { y: [0, -4, 0], rotate: [-4, 4, -4] }
          : state === "success"
          ? { y: [0, -8, 0], scale: [1, 1.15, 1] }
          : state === "idle"
          ? { y: [0, -2, 0] }
          : {}
      }
      transition={
        state === "dragging"
          ? { repeat: Infinity, duration: 0.3 }
          : state === "success"
          ? { repeat: 3, duration: 0.25 }
          : state === "idle"
          ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
          : {}
      }
      className="w-12 h-14 drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]"
    >
      <svg width="48" height="56" viewBox="0 0 40 48" className="overflow-visible">
        <ellipse cx="20" cy="44" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
        <path d={armPathLeft} stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d={armPathRight} stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="40" r="4.5" fill="#0f172a" />
        <path d="M 18,36 L 22,36 L 20,40 Z" fill="#0f172a" />
        <rect x="9" y="19" width="22" height="19" rx="5" fill={bodyColor} stroke="#0f172a" strokeWidth="2.5" />
        <rect x="12" y="22" width="16" height="10" rx="2.5" fill="#0f172a" />
        <text x="20" y="29.5" fill="#f8fafc" fontSize="9.5" fontWeight="black" fontFamily="var(--font-sans)" textAnchor="middle">{face}</text>
        <rect x="18" y="16" width="4" height="4" fill="#475569" />
        <path d="M 11,16 A 9,9 0 0,1 29,16 Z" fill={bodyColor} stroke="#0f172a" strokeWidth="2.5" />
        <line x1="20" y1="8" x2="20" y2="3" stroke="#475569" strokeWidth="2.5" />
        <circle cx="20" cy="2.5" r="3" fill="#fb7185" className={state === "dragging" ? "animate-pulse" : ""} />
      </svg>
    </motion.div>
  );
};

// High-Tech Cyber Console Frame
const CyberConsole = ({
  title,
  children,
  powerLight = "green",
  overflowClass = "overflow-hidden"
}: {
  title: string;
  children: React.ReactNode;
  powerLight?: "green" | "red" | "amber";
  overflowClass?: string;
}) => {
  return (
    <div className="relative border-2 border-[#0f172a] bg-white rounded-3xl p-4 shadow-none flex flex-col min-h-0 border-t-[#312e81] border-b-[#020617] overflow-visible">
      {/* Screw details */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-900 flex items-center justify-center shadow-inner"><div className="w-1.5 h-0.5 bg-gray-950 rotate-45" /></div>
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-900 flex items-center justify-center shadow-inner"><div className="w-1.5 h-0.5 bg-gray-950 -rotate-45" /></div>
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-900 flex items-center justify-center shadow-inner"><div className="w-1.5 h-0.5 bg-gray-950 -rotate-45" /></div>
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-900 flex items-center justify-center shadow-inner"><div className="w-1.5 h-0.5 bg-gray-950 rotate-45" /></div>

      {/* Console label */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-gray-400 font-sans text-xs md:text-sm text-sky-700 uppercase tracking-wide font-black">
        <span>{title}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] md:text-xs font-bold text-gray-700">SYS_LINK</span>
          <span className={`w-3 h-3 rounded-full border border-black/50 ${
            powerLight === "green" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : 
            powerLight === "red" ? "bg-rose-600 shadow-[0_0_8px_#e11d48]" : 
            "bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"
          }`} />
        </div>
      </div>

      {/* Screen Area */}
      <div className={`relative flex-1 rounded-2xl bg-white border-2 border-[#111827] p-3 shadow-none flex flex-col ${overflowClass}`}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-25 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.55)_50%)]" style={{ backgroundSize: "100% 4px" }} />
        <div className="relative z-10 flex-1 flex flex-col min-h-0 text-[#0f172a] font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Gpu9() {
  const { reportComplete } = useLMSBridge("gpu9");
  const { playPop, playSuccess, playError, playZap, playDrop } = useLabAudio();

  const [phase, setPhase] = useState<"assemble" | "run" | "challenge">("assemble");
  const [hasWon, setHasWon] = useState(false);
  const [poweringUp, setPoweringUp] = useState(false);

  // ── Tab 1: Assemble States ──────────────────────────────────────────────────
  const [placed, setPlaced] = useState<Record<ComponentId, boolean>>({
    gpu: false,
    vram: false,
    fan: false,
    cable: false
  });
  const [sparkActive, setSparkActive] = useState<Record<ComponentId, boolean>>({
    gpu: false,
    vram: false,
    fan: false,
    cable: false
  });
  const [errorActive, setErrorActive] = useState<Record<ComponentId, boolean>>({
    gpu: false,
    vram: false,
    fan: false,
    cable: false
  });

  const [hoveredComponent, setHoveredComponent] = useState<ComponentId | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentId | null>(null);
  const [activeDragId, setActiveDragId] = useState<ComponentId | null>(null);
  const [failedDragId, setFailedDragId] = useState<ComponentId | null>(null);
  const [justPlacedId, setJustPlacedId] = useState<ComponentId | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Tab 2: Workload States ──────────────────────────────────────────────────
  const [workload, setWorkload] = useState<"logic" | "graphics" | null>(null);
  const [running, setRunning] = useState(false);
  const [workloadResolution, setWorkloadResolution] = useState(0); // 0=1080p, 1=1440p, 2=4K
  const [cpuProgress, setCpuProgress] = useState(0);
  const [gpuProgress, setGpuProgress] = useState(0);
  const [cpuActive, setCpuActive] = useState<number[]>([]);
  const [gpuActive, setGpuActive] = useState<number[]>([]);
  const [completedWorkloads, setCompletedWorkloads] = useState({ logic: false, graphics: false });

  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Tab 3: Challenge States ─────────────────────────────────────────────────
  const [challengeStep, setChallengeStep] = useState<"calculator" | "shader" | "vram">("calculator");
  const [coreMultiplier, setCoreMultiplier] = useState(10);
  const [coreMathCorrect, setCoreMathCorrect] = useState(false);

  const [switchRed, setSwitchRed] = useState(false);
  const [switchGreen, setSwitchGreen] = useState(false);
  const [switchBlue, setSwitchBlue] = useState(false);
  const [shaderMatched, setShaderMatched] = useState(false);
  const [shaderGridPainted, setShaderGridPainted] = useState(false);

  const [vramBufferPercent, setVramBufferPercent] = useState(40);

  const isBooted = Object.values(placed).every(v => v);
  const isSecondTabDone = completedWorkloads.logic && completedWorkloads.graphics;

  // ── Assembly Handlers ───────────────────────────────────────────────────────

  const triggerPowerUp = () => {
    setPoweringUp(true);
    playZap();
    setTimeout(() => playSuccess(), 1200);
    setTimeout(() => {
      setPoweringUp(false);
      setPhase("run");
    }, 2800);
  };

  const handleDragEnd = (compId: ComponentId, info: any) => {
    const slotElement = document.getElementById(`slot-${compId}`);
    if (!slotElement) return;
    const rect = slotElement.getBoundingClientRect();
    const { x, y } = info.point;
    
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      setPlaced(prev => {
        const next = { ...prev, [compId]: true };
        setSparkActive(s => ({ ...s, [compId]: true }));
        setJustPlacedId(compId);
        setTimeout(() => setSparkActive(s => ({ ...s, [compId]: false })), 700);
        setTimeout(() => setJustPlacedId(null), 1200);
        playSuccess();
        
        const allPlaced = Object.values(next).every(v => v);
        if (allPlaced) triggerPowerUp();
        
        return next;
      });
      setSelectedComponent(null);
    } else {
      // Check wrong slot collisions
      let hitWrongSlot = false;
      COMPONENTS.forEach(c => {
        if (c.id !== compId) {
          const el = document.getElementById(`slot-${c.id}`);
          if (el) {
            const r = el.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hitWrongSlot = true;
          }
        }
      });

      if (hitWrongSlot) {
        setErrorActive(s => ({ ...s, [compId]: true }));
        setFailedDragId(compId);
        setTimeout(() => setErrorActive(s => ({ ...s, [compId]: false })), 700);
        setTimeout(() => setFailedDragId(null), 1200);
        playError();
      } else {
        playDrop();
      }
    }
  };

  const handleSlotClick = (compId: ComponentId) => {
    if (!selectedComponent) return;

    if (selectedComponent === compId) {
      setPlaced(prev => {
        const next = { ...prev, [compId]: true };
        setSparkActive(s => ({ ...s, [compId]: true }));
        setJustPlacedId(compId);
        setTimeout(() => setSparkActive(s => ({ ...s, [compId]: false })), 700);
        setTimeout(() => setJustPlacedId(null), 1200);
        playSuccess();

        const allPlaced = Object.values(next).every(v => v);
        if (allPlaced) triggerPowerUp();

        return next;
      });
      setSelectedComponent(null);
    } else {
      setErrorActive(s => ({ ...s, [compId]: true }));
      setTimeout(() => setErrorActive(s => ({ ...s, [compId]: false })), 700);
      playError();
      setSelectedComponent(null);
    }
  };

  // ── Workload Handlers ───────────────────────────────────────────────────────

  const runWorkloadTest = (type: "logic" | "graphics") => {
    if (running) return;
    playPop();
    setWorkload(type);
    setRunning(true);
    setCpuProgress(0);
    setGpuProgress(0);
    setCpuActive([]);
    setGpuActive([]);

    let c = 0, g = 0;
    const intervalMs = 50;

    // Res settings impact speeds
    const resFactor = [1, 1.6, 2.5][workloadResolution];

    simTimerRef.current = setInterval(() => {
      if (type === "logic") {
        // CPU logic processing - fast
        c += 4;
        setCpuActive(Array.from({ length: 2 }, () => Math.floor(Math.random() * 4)));
        
        // GPU logic processing - slow
        g += 0.8 / resFactor;
        setGpuActive(Array.from({ length: 4 }, () => Math.floor(Math.random() * 64)));
      } else {
        // CPU graphics rendering - slow
        c += 0.6 / resFactor;
        setCpuActive([0, 1, 2, 3]);

        // GPU graphics rendering - fast (massive parallel shader core utilization)
        g += 4.5;
        setGpuActive(Array.from({ length: 50 }, (_, i) => i));
      }

      if (c >= 100) c = 100;
      if (g >= 100) g = 100;

      setCpuProgress(c);
      setGpuProgress(g);

      if (c === 100 && g === 100) {
        clearInterval(simTimerRef.current!);
        setRunning(false);
        setCpuActive([]);
        setGpuActive([]);
        playSuccess();

        setCompletedWorkloads(prev => {
          const next = { ...prev, [type]: true };
          return next;
        });
      }
    }, intervalMs);
  };

  // ── Challenge Handlers ──────────────────────────────────────────────────────

  useEffect(() => () => { if (simTimerRef.current) clearInterval(simTimerRef.current); }, []);

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <LabShell
      labId="gpu9" theme="cosmos"
      bgOverride="bg-retro-console"
      title="GPU Parallel Power Lab"
      instruction="1. Understand the difference between CPU Step by Step processing and GPU parallel processing. 2. Configure the GPU simulation to handle a massive graphics rendering task. 3. Monitor the performance metrics as parallel threads execute simultaneously. 4. Optimize the workload distribution to achieve the highest frame rate."
      onReset={() => {
        setPhase("assemble");
        setPlaced({ gpu: false, vram: false, fan: false, cable: false });
        setCompletedWorkloads({ logic: false, graphics: false });
        setChallengeStep("calculator");
        setCoreMultiplier(10);
        setCoreMathCorrect(false);
        setSwitchRed(false);
        setSwitchGreen(false);
        setSwitchBlue(false);
        setShaderMatched(false);
        setShaderGridPainted(false);
        setVramBufferPercent(40);
        setHasWon(false);
      }}
      compact
    >
      <style>{`
        /* Dynamic Retro Arcade Background */
        .bg-retro-console {
          background: transparent !important;
          position: relative;
        }

        .bg-retro-console::before {
          display: none !important;
        }

        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 32px 32px; }
        }

        /* Handheld gaming console bodies */
        .toy-panel {
          background: transparent !important;
          border: 2px solid #000000 !important;
          border-radius: 24px !important;
          box-shadow: none !important;
          color: #0f172a !important;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .toy-screen {
          background: transparent !important;
          border: 2px solid #111827 !important;
          border-radius: 18px !important;
          padding: 1rem;
          box-shadow: none !important;
          color: #1e293b !important;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          position: relative;
        }

        /* Force dark text for transparent background legibility */
        .toy-panel .text-white, .toy-panel .text-gray-100 { color: #0f172a !important; }
        .toy-panel .text-gray-300, .toy-panel .text-gray-400 { color: #334155 !important; }
        .toy-panel .text-gray-500 { color: #475569 !important; }
        .toy-panel .text-cyan-300, .toy-panel .text-cyan-400, .toy-panel .text-sky-400, .toy-panel .text-sky-300 { color: #0891b2 !important; }
        .toy-panel .text-purple-300, .toy-panel .text-purple-400 { color: #6b21a8 !important; }

        /* Rubber console details */
        .toy-console-badge {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #38bdf8;
          box-shadow: none;
        }

        /* Playful gamepad buttons */
        .toy-card {
          border: 2px solid #000000 !important;
          border-radius: 18px !important;
          box-shadow: none !important;
          background: transparent !important;
          color: #0f172a !important;
          transition: all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .toy-card:hover:not([disabled]) {
          transform: translateY(-2px) !important;
          box-shadow: none !important;
          background: rgba(0,0,0,0.05) !important;
        }

        .toy-card:active:not([disabled]) {
          transform: translateY(1px) !important;
          box-shadow: none !important;
        }

        /* Nav buttons */
        .toy-btn-tab {
          border: 2px solid #000000 !important;
          border-radius: 18px !important;
          box-shadow: none !important;
          font-weight: 900 !important;
          background: transparent !important;
          color: #475569 !important;
          transition: all 0.1s ease;
        }

        .toy-btn-tab:not([disabled]):hover {
          transform: translateY(-2px);
          box-shadow: none !important;
          color: #0f172a !important;
        }

        .toy-btn-tab.active-tab {
          background: #ef4444 !important; /* red active tab */
          color: #0f172a !important;
          transform: translateY(1px);
          box-shadow: none !important;
        }

        /* Power Actions */
        .toy-btn-action {
          background: #eab308 !important;
          color: #000000 !important;
          border: 2px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
          font-weight: 950 !important;
          transition: all 0.1s ease;
        }

        .toy-btn-action:hover:not([disabled]) {
          transform: translateY(-2px) !important;
          box-shadow: none !important;
          background: #facc15 !important;
        }

        .toy-btn-action:active:not([disabled]) {
          transform: translateY(1px) !important;
          box-shadow: none !important;
        }

        .toy-btn-action-purple {
          background: #a855f7 !important;
          color: #ffffff !important;
        }
        .toy-btn-action-purple:hover:not([disabled]) {
          background: #c084fc !important;
        }

        .toy-btn-action-emerald {
          background: #10b981 !important;
          color: #ffffff !important;
        }
        .toy-btn-action-emerald:hover:not([disabled]) {
          background: #34d399 !important;
        }

        /* CRT Viewport border styles */
        .toy-progress-rail {
          background: transparent !important;
          border: 2px solid #000000 !important;
          height: 16px !important;
          border-radius: 9999px !important;
          overflow: hidden;
          box-shadow: none !important;
        }

        .toy-progress-fill {
          border-right: 2px solid #000000 !important;
          border-radius: 9999px 0 0 9999px !important;
        }

        .toy-mini-net-panel {
          background: transparent !important;
          border: 2px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
        }

        .toy-arena {
          background: transparent !important;
          border: 2px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
        }

        .toy-explanation-bubble {
          border: 2px solid #000000 !important;
          background: transparent !important;
          color: #042f2e !important;
          box-shadow: none !important;
          border-radius: 20px !important;
        }

        @keyframes pulseFlow { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
        .pulse-line { stroke-dasharray: 6,8; animation: pulseFlow 0.7s linear infinite; }
        @keyframes floatIn { 0%{transform:translateY(-12px) scale(0.8);opacity:0} 100%{transform:translateY(0) scale(1);opacity:1} }
        .float-in { animation: floatIn 0.35s ease-out forwards; }
      `}</style>

      <Celebration
        isActive={hasWon}
        message="Master GPU Builder! You successfully reassembled the hardware, ran parallel speed benchmarks, and solved the VRAM and Shader equations!"
        onReplay={() => {
          setPhase("assemble");
          setPlaced({ gpu: false, vram: false, fan: false, cable: false });
          setCompletedWorkloads({ logic: false, graphics: false });
          setChallengeStep("calculator");
          setCoreMultiplier(10);
          setCoreMathCorrect(false);
          setSwitchRed(false);
          setSwitchGreen(false);
          setSwitchBlue(false);
          setShaderMatched(false);
          setShaderGridPainted(false);
          setVramBufferPercent(40);
          setHasWon(false);
        }}
      />

      <div ref={containerRef} className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1 relative select-none">

        {/* Booting overlay screen */}
        {poweringUp && (
          <div className="absolute inset-0 bg-[#030712]/85 z-50 pointer-events-none flex flex-col items-center justify-center rounded-3xl backdrop-blur-xs border-4 border-gray-950">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [1, 1.04, 1], opacity: 1 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="bg-[#1e1b4b] border-4 border-black p-6 rounded-3xl flex flex-col items-center justify-center shadow-2xl text-gray-100 font-sans"
            >
              <Zap className="w-10 h-10 mb-2 text-cyan-400 animate-bounce" />
              <span className="text-base md:text-lg font-black tracking-widest uppercase text-cyan-400">PC SYSTEM BOOTING</span>
              <span className="text-xs md:text-sm mt-1.5 text-gray-400 font-bold uppercase animate-pulse">Initializing GPU Core Cores...</span>
            </motion.div>
          </div>
        )}

        {/* Phase Navigation Tabs */}
        <div className="shrink-0 flex gap-3">
          <button
            onClick={() => { setPhase("assemble"); playPop(); }}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              phase === "assemble" ? "active-tab text-gray-900" : "bg-gray-900 text-gray-300"
            }`}
          >
            Assemble GPU
          </button>
          <button
            onClick={() => { if (isBooted) { setPhase("run"); playPop(); } }}
            disabled={!isBooted}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              !isBooted ? "opacity-25 cursor-not-allowed bg-gray-800 border-gray-700 text-gray-500" :
              phase === "run" ? "active-tab text-gray-900" : "bg-gray-900 text-gray-300"
            }`}
          >
            Run Workloads
          </button>
          <button
            onClick={() => { if (isBooted && isSecondTabDone) { setPhase("challenge"); playPop(); } }}
            disabled={!isBooted || !isSecondTabDone}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              (!isBooted || !isSecondTabDone) ? "opacity-25 cursor-not-allowed bg-gray-800 border-gray-700 text-gray-500" :
              phase === "challenge" ? "active-tab text-gray-900" : "bg-gray-900 text-gray-300"
            }`}
          >
            Hardware Challenge
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════
              PHASE 1: ASSEMBLE GPU
          ══════════════════════════════════════════ */}
          {phase === "assemble" && (
            <motion.div
              key="assemble"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              {/* Motherboard Layout Mapping Arena */}
              <div className="relative w-full border-2 border-black bg-white rounded-3xl overflow-hidden shadow-none" style={{ aspectRatio: "1264/843" }}>
                {/* Background computer model */}
                <img src="/svgs/pc.png" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-40 mix-blend-multiply" alt="PC Motherboard Base" />

                {/* Hotspot Slots */}
                {Object.keys(SLOT_POSITIONS).map((id) => {
                  const compId = id as ComponentId;
                  const pos = SLOT_POSITIONS[compId];
                  const isPlaced = placed[compId];
                  const isSelected = selectedComponent === compId;
                  const isHovered = hoveredComponent === compId;

                  return (
                    <motion.div
                      key={compId}
                      id={`slot-${compId}`}
                      onClick={() => handleSlotClick(compId)}
                      onMouseEnter={() => setHoveredComponent(compId)}
                      onMouseLeave={() => setHoveredComponent(null)}
                      animate={errorActive[compId] ? { x: [-5, 5, -5, 5, 0] } : {}}
                      className={`absolute rounded-2xl border-4 transition-all flex items-center justify-center cursor-pointer z-10 ${
                        isPlaced 
                          ? "border-emerald-400 bg-emerald-950/20" 
                          : isSelected 
                          ? "border-amber-400 bg-amber-500/20 animate-pulse"
                          : isHovered
                          ? "border-cyan-300 bg-[#030712]/5"
                          : "border-dashed border-gray-600 bg-black/45 hover:border-gray-400"
                      }`}
                      style={{ left: pos.left, top: pos.top, width: pos.width, height: pos.height }}
                    >
                      {isPlaced ? (
                        <div className="relative w-full h-full p-1.5 flex flex-col items-center justify-center">
                          {compId === "gpu" && <img src="/svgs/gpu.png" className="w-full h-full object-contain" alt="GPU Core" />}
                          {compId === "fan" && <RotatingFans />}
                          {compId !== "gpu" && compId !== "fan" && <PartSVG id={compId} />}
                          {/* Online LED indicator */}
                          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] border-2 border-black animate-pulse" />
                        </div>
                      ) : (
                        <div className="text-center p-1 font-sans text-[10px] md:text-xs font-bold text-gray-700">
                          {compId === "gpu" ? (
                            <img src="/svgs/gpu.png" className="w-8 h-8 object-contain opacity-40 grayscale mx-auto mb-1" alt="GPU core" />
                          ) : (
                            <div className="w-8 h-8 opacity-40 mx-auto mb-1"><PartSVG id={compId} /></div>
                          )}
                          <span className="bg-white px-1.5 py-0.5 rounded text-[8px] md:text-[10px] tracking-wide uppercase text-gray-800">
                            {COMPONENTS.find(c => c.id === compId)?.name}
                          </span>
                        </div>
                      )}

                      {sparkActive[compId] && <Sparks />}
                      {justPlacedId === compId && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                          <HelperBot state="success" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* CRT screen scanline glass overlay */}
                <div className="absolute inset-0 pointer-events-none border-[10px] border-gray-900 rounded-3xl" />
              </div>

              {/* Specs & Inventory control boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
                {/* Dossier Terminal */}
                <CyberConsole title="Specs Dossier" powerLight={hoveredComponent || selectedComponent ? "amber" : "green"}>
                  {hoveredComponent || selectedComponent ? (
                    (() => {
                      const comp = COMPONENTS.find(c => c.id === (hoveredComponent || selectedComponent));
                      return (
                        <div className="flex flex-col gap-2 h-full justify-center">
                          <div className="flex items-center gap-2 border-b border-cyan-800/30 pb-1 shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
                            <h4 className="text-cyan-800 font-black uppercase text-xs md:text-sm tracking-wide">{comp?.name}</h4>
                          </div>
                          
                          {/* Keywords */}
                          <div className="flex flex-wrap gap-1 py-0.5 shrink-0">
                            {comp?.keywords.map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-cyan-900/10 border border-cyan-800/25 text-cyan-800 font-bold text-[10px] md:text-xs uppercase">
                                {kw}
                              </span>
                            ))}
                          </div>
                          
                          <p className="text-gray-800 text-xs leading-relaxed border-t border-cyan-800/30 pt-1">
                            {comp?.technical}
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col gap-2 h-full justify-center">
                      <h4 className="text-cyan-800 font-black text-xs md:text-sm border-b border-cyan-800/30 pb-1 uppercase tracking-wide">Arcade Assembler</h4>
                      <p className="text-gray-700 text-xs leading-relaxed">
                        Drag or click components to insert VRAM, GPU Core, twin fans, and PCIe power lines to boot the hardware system!
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-1 text-xs font-bold">
                        <div className="border border-cyan-800/20 p-2 rounded-xl bg-cyan-900/5 text-cyan-900">
                          <span className="text-gray-700 block font-bold uppercase text-[9px] mb-0.5">Core Clock</span>
                          <span>1.4 GHz clock</span>
                        </div>
                        <div className="border border-cyan-800/20 p-2 rounded-xl bg-cyan-900/5 text-cyan-900">
                          <span className="text-gray-700 block font-bold uppercase text-[9px] mb-0.5">Parallel Lanes</span>
                          <span>2,540 lanes (ALUs)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CyberConsole>

                {/* Component Tray */}
                <CyberConsole title="Component Inventory" overflowClass="overflow-visible">
                  <div className="grid grid-cols-2 gap-2 h-full items-center relative overflow-visible">
                    {COMPONENTS.map(c => {
                      if (placed[c.id]) {
                        return (
                          <div key={c.id} className="h-14 border border-dashed border-gray-800 rounded-xl bg-gray-950/20 flex items-center justify-center text-gray-600 text-xs font-black uppercase tracking-wide">
                            Placed
                          </div>
                        );
                      }
                      const isSelected = selectedComponent === c.id;

                      return (
                        <motion.div
                          key={c.id}
                          drag
                          dragConstraints={containerRef}
                          dragElastic={0.1}
                          dragSnapToOrigin
                          whileDrag={{ scale: 1.08, zIndex: 100, boxShadow: "0px 10px 25px rgba(0,0,0,0.5)" }}
                          onDragStart={() => {
                            setHoveredComponent(c.id);
                            setActiveDragId(c.id);
                          }}
                          onDragEnd={(e, info) => {
                            setHoveredComponent(null);
                            setActiveDragId(null);
                            handleDragEnd(c.id, info);
                          }}
                          onClick={() => {
                            setSelectedComponent(isSelected ? null : c.id);
                            playPop();
                          }}
                          className={`h-14 p-2 toy-card flex items-center gap-2 cursor-grab active:cursor-grabbing select-none relative ${
                            isSelected ? "border-amber-400" : ""
                          }`}
                          style={{ touchAction: "none" }}
                        >
                          <div className="w-10 h-10 shrink-0">
                            {c.id === "gpu" ? (
                              <img src="/svgs/gpu.png" className="w-full h-full object-contain" alt="GPU die" />
                            ) : (
                              <PartSVG id={c.id} />
                            )}
                          </div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-gray-900 leading-tight">
                            {c.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CyberConsole>
              </div>

            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              PHASE 2: RUN WORKLOADS
          ══════════════════════════════════════════ */}
          {phase === "run" && (
            <motion.div
              key="run"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">

                {/* Left side: Workload Selector */}
                <div className="lg:col-span-5 toy-panel">
                  {/* Casing accents */}
                  <div className="absolute top-3.5 right-4 flex gap-1 opacity-50">
                    <span className="toy-console-badge bg-rose-400" />
                    <span className="toy-console-badge bg-amber-400" />
                  </div>

                  <div className="toy-screen gap-4">
                    <div>
                      <h3 className="text-base font-black text-white">Workload Controller</h3>
                      <p className="text-xs text-gray-400 mt-1 font-bold leading-relaxed">
                        Adjust execution parameters and trigger either CPU Step by Step code or GPU parallel renderings.
                      </p>
                    </div>

                    {/* Resolution slider */}
                    <div className="flex flex-col gap-1 bg-gray-950 p-3 rounded-xl border border-gray-900">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-1">
                        <span>Workload Size</span>
                        <span className="text-cyan-400 uppercase">
                          {["1080p Standard", "1440p High Quality", "4K Ultra HD"][workloadResolution]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="1"
                        value={workloadResolution}
                        onChange={(e) => { setWorkloadResolution(parseInt(e.target.value)); playPop(); }}
                        disabled={running}
                        className="w-full accent-cyan-400 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Workload triggers */}
                    <div className="flex flex-col gap-2 mt-auto">
                      <button
                        onClick={() => runWorkloadTest("logic")}
                        disabled={running}
                        className={`w-full p-3.5 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
                          running ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-900 hover:scale-[1.02] cursor-pointer"
                        } ${completedWorkloads.logic ? "border-emerald-500 bg-emerald-950/15" : "border-gray-800 bg-gray-900/50"}`}
                      >
                        <div>
                          <p className="text-white font-black text-sm uppercase">Math Code (Logic)</p>
                          <p className="text-gray-400 text-[10px] mt-0.5">Executes steps one-by-one. CPU excels here.</p>
                        </div>
                        {completedWorkloads.logic ? <CheckCircle className="text-emerald-400" /> : <Play className="text-cyan-400" />}
                      </button>

                      <button
                        onClick={() => runWorkloadTest("graphics")}
                        disabled={running}
                        className={`w-full p-3.5 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
                          running ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-900 hover:scale-[1.02] cursor-pointer"
                        } ${completedWorkloads.graphics ? "border-emerald-500 bg-emerald-950/15" : "border-gray-800 bg-gray-900/50"}`}
                      >
                        <div>
                          <p className="text-white font-black text-sm uppercase">3D Game Render (Parallel)</p>
                          <p className="text-gray-400 text-[10px] mt-0.5">Calculates millions of pixels at once. GPU excels here.</p>
                        </div>
                        {completedWorkloads.graphics ? <CheckCircle className="text-emerald-400" /> : <Play className="text-fuchsia-400" />}
                      </button>
                    </div>

                    {/* Lock message */}
                    {!isSecondTabDone && (
                      <p className="text-[10px] text-gray-500 text-center font-bold uppercase tracking-wider animate-pulse">
                        Run both workloads to unlock hardware challenge!
                      </p>
                    )}

                    {isSecondTabDone && (
                      <button
                        onClick={() => { setPhase("challenge"); playPop(); }}
                        className="w-full toy-btn-action toy-btn-action-emerald text-xs py-2 mt-2 flex items-center justify-center gap-1 font-black uppercase"
                      >
                        Go to Challenge <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right side: Execution simulation */}
                <div className="lg:col-span-7 grid grid-rows-2 gap-3 min-h-0">

                  {/* CPU Cores Screen */}
                  <div className="toy-panel">
                    <div className="toy-screen p-3 justify-between flex-row items-center gap-3">
                      {/* Silicon Core Grid */}
                      <div className="w-20 h-20 shrink-0 border-2 border-gray-800 rounded-xl p-1 bg-gray-950 flex flex-col gap-1 justify-center">
                        <span className="text-[8px] font-black uppercase text-gray-500 text-center tracking-wider block mb-0.5">CPU Die</span>
                        <div className="grid grid-cols-2 gap-1 flex-1">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded transition-all border ${
                                cpuActive.includes(i) ? "bg-sky-400 border-sky-300 shadow-[0_0_4px_#38bdf8]" : "bg-gray-900 border-gray-800"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Progress Metrics */}
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="text-sky-400 uppercase flex items-center gap-1"><Cpu size={14} /> CPU ALU cores</span>
                          <span className="text-white">{Math.floor(cpuProgress)}%</span>
                        </div>
                        <div className="toy-progress-rail">
                          <div style={{ width: `${cpuProgress}%`, backgroundColor: "#38bdf8" }} className="h-full toy-progress-fill" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold leading-relaxed mt-0.5">
                          {workload === "logic" 
                            ? "Few fast cores easily crunch complex branching loops!" 
                            : workload === "graphics" 
                            ? "Struggling to calculate millions of pixels one-by-one..." 
                            : "Waiting to run task."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* GPU Cores Screen */}
                  <div className="toy-panel">
                    <div className="toy-screen p-3 justify-between flex-row items-center gap-3">
                      {/* Silicon Core Grid */}
                      <div className="w-20 h-20 shrink-0 border-2 border-gray-800 rounded-xl p-1 bg-gray-950 flex flex-col gap-1 justify-center">
                        <span className="text-[8px] font-black uppercase text-gray-500 text-center tracking-wider block mb-0.5">GPU Die</span>
                        <div className="grid grid-cols-8 gap-0.5 flex-1">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-xs transition-all ${
                                gpuActive.includes(i) ? "bg-emerald-400 shadow-[0_0_2px_#10b981]" : "bg-gray-900"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Progress Metrics */}
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="text-emerald-400 uppercase flex items-center gap-1"><Server size={14} /> GPU Shader cores</span>
                          <span className="text-white">{Math.floor(gpuProgress)}%</span>
                        </div>
                        <div className="toy-progress-rail">
                          <div style={{ width: `${gpuProgress}%`, backgroundColor: "#10b981" }} className="h-full toy-progress-fill" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold leading-relaxed mt-0.5">
                          {workload === "logic" 
                            ? "Simple cores struggle to run multi-step branching logic!" 
                            : workload === "graphics" 
                            ? "Unleashing 64 cores in parallel to draw pixels instantly!" 
                            : "Waiting to run task."}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              PHASE 3: HARDWARE CHALLENGE
          ══════════════════════════════════════════ */}
          {phase === "challenge" && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">

                {/* Left side: Linear Challenge Stepper */}
                <div className="lg:col-span-7 toy-panel">
                  {/* Stepper indicators */}
                  <div className="flex gap-2 mb-3 bg-gray-950 p-2 rounded-xl border border-gray-900 justify-between items-center text-xs font-black">
                    <span className="text-gray-400">CHALLENGE STEPS:</span>
                    <div className="flex gap-4">
                      <span className={challengeStep === "calculator" ? "text-cyan-400 font-black animate-pulse" : coreMathCorrect ? "text-emerald-400" : "text-gray-600"}>1. CORES</span>
                      <span className={challengeStep === "shader" ? "text-cyan-400 font-black animate-pulse" : shaderGridPainted ? "text-emerald-400" : "text-gray-600"}>2. SHADERS</span>
                      <span className={challengeStep === "vram" ? "text-cyan-400 font-black animate-pulse" : "text-gray-600"}>3. VRAM</span>
                    </div>
                  </div>

                  <div className="toy-screen justify-center">
                    
                    {/* CHALLENGE 1: CORE MATH */}
                    {challengeStep === "calculator" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase">
                            <Sparkles size={14} className="text-cyan-400" /> Step 1: Core Parallel Multiplier
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 font-bold leading-relaxed">
                            CPUs have 4 fast cores. GPUs have 400 simple cores. Drag the slider to match how many times more tasks the GPU runs in parallel!
                          </p>
                        </div>

                        {/* Interactive Multiplier Slider */}
                        <div className="flex flex-col gap-3 bg-gray-950 p-4 rounded-xl border border-gray-900 w-full max-w-xs">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                            <span>GPU Multiplier:</span>
                            <span className="text-cyan-400 font-black text-sm">{coreMultiplier}x</span>
                          </div>

                          <input
                            type="range"
                            min="10"
                            max="200"
                            step="10"
                            value={coreMultiplier}
                            disabled={coreMathCorrect}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setCoreMultiplier(val);
                              playPop();
                              
                              if (val === 100) {
                                playSuccess();
                                setCoreMathCorrect(true);
                              }
                            }}
                            className="w-full accent-cyan-400 h-2 bg-gray-800 rounded-lg cursor-pointer"
                          />

                          {/* Silicon Workload Capacity Preview */}
                          <div className="border border-gray-800 p-2.5 rounded-lg bg-black/40 flex justify-between text-[10px] md:text-xs font-bold gap-2">
                            <div>
                              <span className="text-gray-500 block text-[8px] uppercase">CPU Tasks</span>
                              <span className="text-sky-400">4 at once</span>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-500 block text-[8px] uppercase">GPU Tasks</span>
                              <span className="text-emerald-400">
                                {4 * coreMultiplier} ({coreMultiplier}x)
                              </span>
                            </div>
                          </div>
                        </div>

                        {coreMathCorrect && (
                          <motion.button
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            onClick={() => {
                              setChallengeStep("shader");
                              playPop();
                            }}
                            className="mt-2 w-full max-w-xs toy-btn-action toy-btn-action-purple text-xs py-2 uppercase font-black flex items-center justify-center gap-1.5"
                          >
                            Next Step: Shaders <ArrowRight size={13} />
                          </motion.button>
                        )}
                      </div>
                    )}

                    {/* CHALLENGE 2: SHADER MIXER */}
                    {challengeStep === "shader" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase">
                            <Sparkles size={14} className="text-purple-400" /> Step 2: RGB Pixel Shader Mixer
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 font-bold leading-relaxed">
                            Shaders mix color lights (Red, Green, Blue) to color pixels. Toggle the switches to mix YELLOW and paint a banana!
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 bg-gray-950 p-4 rounded-xl border border-gray-900 w-full max-w-xs">
                          {/* Target vs Current Mix Screens */}
                          <div className="flex gap-4 justify-center items-center py-1">
                            {/* Target Screen */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[8px] text-gray-500 font-bold uppercase">Target</span>
                              <div className="w-11 h-11 rounded-xl border-2 border-black bg-[#eab308] shadow-[2px_2px_0px_#000000] flex items-center justify-center text-[9px] text-gray-950 font-black">
                                Yellow
                              </div>
                            </div>

                            <span className="text-gray-500 font-black text-sm">➔</span>

                            {/* Current Mix Screen */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[8px] text-gray-500 font-bold uppercase">Mix</span>
                              <div 
                                className="w-11 h-11 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] transition-colors duration-300"
                                style={{ 
                                  backgroundColor: 
                                    switchRed && switchGreen && switchBlue ? "#ffffff" :
                                    switchRed && switchGreen ? "#eab308" :
                                    switchRed && switchBlue ? "#ec4899" :
                                    switchGreen && switchBlue ? "#06b6d4" :
                                    switchRed ? "#ef4444" :
                                    switchGreen ? "#10b981" :
                                    switchBlue ? "#3b82f6" : "#000000"
                                }}
                              />
                            </div>
                          </div>

                          {/* Toggle Switches */}
                          <div className="flex gap-1.5 justify-around py-0.5">
                            {[
                              { color: "Red", active: switchRed, setter: setSwitchRed, colorClass: "bg-rose-600 border-rose-800" },
                              { color: "Green", active: switchGreen, setter: setSwitchGreen, colorClass: "bg-emerald-600 border-emerald-800" },
                              { color: "Blue", active: switchBlue, setter: setSwitchBlue, colorClass: "bg-violet-700 border-blue-800" }
                            ].map(sw => (
                              <button
                                key={sw.color}
                                disabled={shaderMatched}
                                onClick={() => {
                                  playPop();
                                  const nextState = !sw.active;
                                  sw.setter(nextState);
                                  
                                  const r = sw.color === "Red" ? nextState : switchRed;
                                  const g = sw.color === "Green" ? nextState : switchGreen;
                                  const b = sw.color === "Blue" ? nextState : switchBlue;
                                  
                                  if (r && g && !b) {
                                    playSuccess();
                                    setShaderMatched(true);
                                    playZap();
                                    setShaderGridPainted(true);
                                  }
                                }}
                                className={`px-2 py-1 rounded-lg border-2 font-black uppercase text-[9px] md:text-[10px] transition-all shadow-[2px_2px_0px_#000000] active:translate-y-[1.5px] active:shadow-[0.5px_0.5px_0px_#000000] ${
                                  sw.active 
                                    ? `${sw.colorClass} text-white` 
                                    : "bg-gray-950 border-gray-800 text-gray-400 hover:text-gray-200"
                                }`}
                              >
                                {sw.color}: {sw.active ? "ON" : "OFF"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {shaderGridPainted && (
                          <div className="mt-2 flex flex-col items-center gap-3 float-in">
                            <div className="grid grid-cols-16 gap-0.5 w-full max-w-[160px] aspect-square p-1 bg-gray-950 rounded-lg border border-gray-900">
                              {Array.from({ length: 256 }).map((_, i) => (
                                <div key={i} className="w-full h-full rounded-2xs bg-yellow-400 animate-pulse" />
                              ))}
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase animate-pulse text-center">✓ Painted 256 pixels at once in 1 cycle!</span>
                            
                            <button
                              onClick={() => {
                                setChallengeStep("vram");
                                playPop();
                              }}
                              className="w-full max-w-xs toy-btn-action toy-btn-action-purple text-xs py-2 uppercase font-black flex items-center justify-center gap-1.5"
                            >
                              Next Step: VRAM <ArrowRight size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CHALLENGE 3: VRAM BUFFER */}
                    {challengeStep === "vram" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase">
                            <Sparkles size={14} className="text-emerald-400" /> Step 3: VRAM Texture Fit
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 font-bold leading-relaxed">
                            Game textures require fast GDDR6 VRAM storage. Drag the slider to match the target allocated memory footprint!
                          </p>
                        </div>

                        {/* Interactive VRAM Matcher */}
                        <div className="flex flex-col gap-3 bg-gray-950 p-4 rounded-xl border border-gray-900">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                            <span>VRAM Allocated:</span>
                            <span className="text-emerald-400 font-black">{vramBufferPercent}%</span>
                          </div>

                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={vramBufferPercent}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setVramBufferPercent(val);
                              playPop();
                              
                              if (val >= 60 && val <= 80 && !hasWon) {
                                playSuccess();
                                setHasWon(true);
                                reportComplete();
                              }
                            }}
                            className="w-full accent-emerald-400 h-2 bg-gray-800 rounded-lg cursor-pointer"
                          />

                          {/* Graphical Buffer Bar */}
                          <div className="relative h-6 bg-gray-900 border-2 border-black rounded-lg overflow-hidden flex items-center">
                            {/* Target Highlight Zone (60% to 80%) */}
                            <div className="absolute left-[60%] w-[20%] h-full bg-emerald-500/20 border-x border-dashed border-emerald-400/50 flex items-center justify-center">
                              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Target</span>
                            </div>
                            {/* Current Fill */}
                            <div style={{ width: `${vramBufferPercent}%` }} className="h-full bg-emerald-500/50 transition-all duration-75" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {vramBufferPercent >= 60 && vramBufferPercent <= 80 ? (
                            <p className="text-[10px] text-emerald-400 font-bold text-center uppercase tracking-wide animate-pulse">
                              ✓ Target matched! Lab completed!
                            </p>
                          ) : (
                            <p className="text-[10px] text-gray-500 font-bold text-center uppercase tracking-wide">
                              Drag slider into the green TARGET zone to complete the lab!
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Right side: Informational terminal panel */}
                <div className="lg:col-span-5 toy-panel">
                  <div className="absolute top-3.5 right-4 flex gap-1 opacity-70">
                    <span className="toy-console-badge bg-cyan-400" />
                  </div>

                  <div className="toy-screen p-3.5 justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                        <Info size={15} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">GPU Architecture Profile</span>
                      </div>
                      <h3 className="text-sm font-black text-white">How GPUs Work</h3>
                      <p className="text-xs text-gray-400 font-bold leading-relaxed mt-1">
                        CPUs handle single-threaded pipelines step-by-step. GPUs use massive arrays of simple calculations in parallel to process millions of pixel light shadders, vector calculations, and textures simultaneously.
                      </p>
                    </div>

                    <div className="toy-panel bg-gray-950/40 p-2.5 border border-gray-900 rounded-xl mt-3">
                      <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                        <strong className="text-cyan-400 uppercase block mb-0.5">VRAM & Memory bandwidth</strong>
                        GDDR6 memory pipelines stream gigabytes of raw graphical mesh arrays. Low buffer sizes force the GPU to wait for CPU storage, dropping rendering frame outputs.
                      </p>
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
