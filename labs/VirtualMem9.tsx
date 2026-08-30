"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Cpu, 
  HardDrive, 
  Zap, 
  Database, 
  ArrowRight,
  CheckCircle,
  RotateCcw,
  Info,
  Sliders,
  Sparkles,
  Shield,
  Activity,
  FileText
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ComponentId = "ram" | "pagefile" | "mmu" | "tlb";

interface MemoryComponent {
  id: ComponentId;
  name: string;
  desc: string;
  keywords: string[];
  technical: string;
}

const COMPONENTS: MemoryComponent[] = [
  {
    id: "ram",
    name: "Physical RAM Module",
    desc: "Fast, high-bandwidth volatile memory where actively executing code is stored.",
    keywords: ["High-speed", "DIMM Slot", "Volatile Storage"],
    technical: "Provides nanoscale memory access times (0.1ns). CPU cores read instructions directly from RAM cells via the memory bus."
  },
  {
    id: "pagefile",
    name: "Page File (pagefile.sys)",
    desc: "Dedicated overflow partition on the disk drive used as backup space for RAM.",
    keywords: ["pagefile.sys", "HDD/SSD swap", "Non-volatile"],
    technical: "Enables OS to page out inactive memory ranges to disk space, freeing up high-speed RAM frames for running processes."
  },
  {
    id: "mmu",
    name: "Memory Management Unit",
    desc: "CPU hardware chip responsible for translating virtual addresses into physical addresses.",
    keywords: ["Hardware translator", "Page Table Lookup", "Address Mapping"],
    technical: "Intercepts every virtual memory request from software and maps virtual pages to physical RAM frame locations."
  },
  {
    id: "tlb",
    name: "Translation Lookaside Buffer",
    desc: "An on-chip CPU memory cache that stores recent address translation mappings.",
    keywords: ["Cache buffer", "Speeds translation", "MMU Helper"],
    technical: "Caches virtual-to-physical translations inside the CPU to bypass slow page table lookups, resolving mappings instantly."
  }
];

// ─── INLINE SVGS ─────────────────────────────────────────────────────────────

const PartSVG = ({ id }: { id: ComponentId }) => {
  switch (id) {
    case "ram":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="35" width="90" height="30" rx="4" fill="#d1fae5" stroke="#10b981" strokeWidth="4" />
          <rect x="15" y="42" width="10" height="16" fill="#047857" rx="2" />
          <rect x="32" y="42" width="10" height="16" fill="#047857" rx="2" />
          <rect x="49" y="42" width="10" height="16" fill="#047857" rx="2" />
          <rect x="66" y="42" width="10" height="16" fill="#047857" rx="2" />
          <line x1="10" y1="65" x2="90" y2="65" stroke="#047857" strokeWidth="3" strokeDasharray="3,2" />
        </svg>
      );
    case "pagefile":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" rx="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
          <circle cx="50" cy="50" r="24" fill="none" stroke="#0284c7" strokeWidth="4" strokeDasharray="6,4" />
          <circle cx="50" cy="50" r="10" fill="#0284c7" />
          <path d="M 67,20 L 73,15 M 27,80 L 33,75" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "mmu":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" rx="16" fill="#ffedd5" stroke="#ea580c" strokeWidth="4" />
          <rect x="30" y="30" width="40" height="40" rx="8" fill="#ea580c" />
          <path d="M 50,25 L 50,75 M 25,50 L 75,50" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="50" r="8" fill="#ffedd5" stroke="#ea580c" strokeWidth="3" />
        </svg>
      );
    case "tlb":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" rx="16" fill="#ffe4e6" stroke="#e11d48" strokeWidth="4" />
          <line x1="30" y1="35" x2="70" y2="35" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="50" x2="70" y2="50" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="65" x2="70" y2="65" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />
          <circle cx="35" cy="35" r="4" fill="#090d16" />
          <circle cx="50" cy="50" r="4" fill="#090d16" />
          <circle cx="65" cy="65" r="4" fill="#090d16" />
        </svg>
      );
    default:
      return null;
  }
};

const Sparks = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(16)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2.5 h-2.5 rounded-full bg-teal-400"
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

// Cyber Console Frame
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
    <div className="relative border-2 border-slate-800 bg-sky-100 rounded-[32px] p-5 shadow-none flex flex-col min-h-0 overflow-visible transition-all">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b-4 border-black font-sans text-base md:text-lg text-sky-950 uppercase tracking-wider font-black">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-black text-sky-800">MEM_MANAGER</span>
          <span className={`w-4 h-4 rounded-full border-2 border-black ${
            powerLight === "green" ? "bg-green-400" : 
            powerLight === "red" ? "bg-rose-600 animate-pulse" : 
            "bg-amber-400 animate-pulse"
          }`} />
        </div>
      </div>

      <div className={`relative flex-1 rounded-[20px] bg-white border-2 border-slate-800 p-4 shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)] flex flex-col ${overflowClass}`}>
        <div className="relative z-10 flex-1 flex flex-col min-h-0 text-slate-800 font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function VirtualMem9() {
  const { reportComplete } = useLMSBridge("virtualmem9");
  const { playPop, playSuccess, playError, playZap, playDrop } = useLabAudio();
  const containerRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<"assemble" | "run" | "challenge">("assemble");
  const [hasWon, setHasWon] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [isSubsystemActive, setIsSubsystemActive] = useState(false);
  const [incidentActive, setIncidentActive] = useState(false);

  // Tab 1 Paging Game States
  const [gameDesk, setGameDesk] = useState<string[]>(["Web Browser", "Music Player"]);
  const [gameStorage, setGameStorage] = useState<string[]>(["Spreadsheet"]);
  const [gameIndex, setGameIndex] = useState(0);
  const [gameHits, setGameHits] = useState(0);
  const [gameFaults, setGameFaults] = useState(0);
  const [gameMessage, setGameMessage] = useState("Memory manager online! Click Fetch on 'Video Editor' to load it.");
  const [gameFinished, setGameFinished] = useState(false);
  const [hasSwapped, setHasSwapped] = useState(false);

  const GAME_QUEUE = [
    "Video Editor", 
    "3D Game", 
    "Web Browser", 
    "Spreadsheet", 
    "Music Player", 
    "Email Client"
  ];

  const isBooted = gameFinished;

  // Tab 2 Simulation States
  const [memoryAllocation, setMemoryAllocation] = useState(8); // in GB
  const [storageSpeed, setStorageSpeed] = useState<"hdd" | "ssd">("hdd");
  const [simRunning, setSimRunning] = useState(false);
  const [swappingActive, setSwappingActive] = useState(false);
  const [benchCompleted, setBenchCompleted] = useState({ hdd: false, ssd: false });
  const [latencyValue, setLatencyValue] = useState(0.1);
  const [thrashingActive, setThrashingActive] = useState(false);

  // Tab 3 Challenge States
  const [challengeStep, setChallengeStep] = useState<"translation" | "protection" | "lru">("translation");
  const [translationMappings, setTranslationMappings] = useState<Record<number, number | null>>({
    3: null,
    5: null
  });
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const [protectionTested, setProtectionTested] = useState(false);
  const [protectionPassed, setProtectionPassed] = useState(false);
  
  const [lruChoice, setLruChoice] = useState<number | null>(null);
  const [lruPassed, setLruPassed] = useState(false);

  const isSecondTabDone = benchCompleted.hdd && benchCompleted.ssd;

  const fetchFromDisk = (program: string) => {
    if (gameDesk.length >= 3) {
      playError();
      setGameMessage(" Workbench Full! Page out an active program first.");
      return;
    }
    playPop();
    setGameDesk(prev => [...prev, program]);
    setGameFaults(prev => prev + 1);
    setHasSwapped(true);
    setGameMessage(` Loaded '${program}' from Disk (Page Fault generated).`);
  };

  const pageIn = (program: string) => {
    if (gameDesk.length >= 3) {
      playError();
      setGameMessage(" Workbench Full! Page out an active program first.");
      return;
    }
    playPop();
    setGameDesk(prev => [...prev, program]);
    setGameStorage(prev => prev.filter(p => p !== program));
    setGameFaults(prev => prev + 1);
    setHasSwapped(true);
    setGameMessage(` Paged in '${program}' from storage (Page Fault generated).`);
  };

  const pageOut = (program: string) => {
    if (gameStorage.length >= 5) {
      playError();
      setGameMessage(" Storage Box Full! Clear space or execute active programs.");
      return;
    }
    playDrop();
    setGameStorage(prev => [...prev, program]);
    setGameDesk(prev => prev.filter(p => p !== program));
    setGameMessage(` Paged out '${program}' to storage.`);
  };

  const runActiveProcess = () => {
    const currentReq = GAME_QUEUE[gameIndex];
    if (!gameDesk.includes(currentReq)) {
      playError();
      return;
    }

    let message = "";
    if (!hasSwapped) {
      setGameHits(prev => prev + 1);
      message = ` RAM Hit! Processed '${currentReq}' instantly from physical RAM.`;
    } else {
      message = ` Completed '${currentReq}' after swapping from disk/storage.`;
    }

    playSuccess();

    if (gameIndex + 1 >= GAME_QUEUE.length) {
      setGameFinished(true);
      setGameIndex(prev => prev + 1);
      setGameMessage(" Success! All processes successfully mapped and executed. Tab 2 unlocked!");
    } else {
      const nextIndex = gameIndex + 1;
      setGameIndex(nextIndex);
      setHasSwapped(false);
      const nextReq = GAME_QUEUE[nextIndex];
      const isNextHit = gameDesk.includes(nextReq);
      
      setGameMessage(
        `${message} Next process: '${nextReq}'. ${
          isNextHit ? "It is already in RAM (RAM Hit ready!)." : "Requires swapping (Page Fault)."
        }`
      );
    }
  };

  // Tab 2 Swapping Simulator Logic
  const runSimulation = () => {
    if (simRunning) return;
    setSimRunning(true);
    setSwappingActive(memoryAllocation > 8);
    playZap();

    let targetLatency = 0.1;
    let isThrashing = false;

    if (memoryAllocation > 8) {
      const pressureMultiplier = (memoryAllocation - 8) / 8;
      if (storageSpeed === "hdd") {
        targetLatency = Math.round(12000 * pressureMultiplier);
        isThrashing = true;
      } else {
        targetLatency = Math.round(250 * pressureMultiplier);
      }
    }

    setLatencyValue(targetLatency);
    setThrashingActive(isThrashing);

    setTimeout(() => {
      setSimRunning(false);
      setSwappingActive(false);
      if (isThrashing) {
        playError();
      } else {
        playSuccess();
      }
      setBenchCompleted(prev => ({ ...prev, [storageSpeed]: true }));
    }, 2500);
  };

  // Tab 3 Challenges Mappings
  const handleTranslationMap = (vpn: number, pfn: number) => {
    setTranslationMappings(prev => {
      const next = { ...prev, [vpn]: pfn };
      playPop();
      if (next[3] === 12 && next[5] === 8) {
        setTimeout(() => {
          playSuccess();
          setChallengeStep("protection");
        }, 800);
      } else if (next[3] !== null && next[5] !== null) {
        // incorrect mapping
        playError();
        setTimeout(() => {
          setTranslationMappings({ 3: null, 5: null });
        }, 1000);
      }
      return next;
    });
  };

  const testMemoryProtection = () => {
    setProtectionTested(true);
    if (protectionEnabled) {
      playSuccess();
      setProtectionPassed(true);
      setTimeout(() => {
        setChallengeStep("lru");
      }, 1500);
    } else {
      playError();
      setProtectionPassed(false);
      setTimeout(() => {
        setProtectionTested(false);
      }, 1500);
    }
  };

  const handleLruEviction = (choice: number) => {
    setLruChoice(choice);
    if (choice === 1) {
      playSuccess();
      setLruPassed(true);
    } else {
      playError();
      setTimeout(() => {
        setLruChoice(null);
      }, 1200);
    }
  };

  const handleFinishLab = () => {
    playSuccess();
    setHasWon(true);
    reportComplete();
  };

  const resetLab = () => {
    setPhase("assemble");
    setGameDesk(["Web Browser", "Music Player"]);
    setGameStorage(["Spreadsheet"]);
    setGameIndex(0);
    setGameHits(0);
    setGameFaults(0);
    setGameMessage("Memory manager online! Click Fetch on 'Video Editor' to load it.");
    setGameFinished(false);
    setHasSwapped(false);
    setBenchCompleted({ hdd: false, ssd: false });
    setChallengeStep("translation");
    setTranslationMappings({ 3: null, 5: null });
    setProtectionEnabled(false);
    setProtectionTested(false);
    setProtectionPassed(false);
    setLruChoice(null);
    setLruPassed(false);
    setHasWon(false);
  };

  return (
    <LabShell
      labId="virtualmem9" theme="ocean"
      bgOverride="bg-retro-console"
      title="OS Virtual Memory & Thrashing Lab"
      onReset={resetLab}
      instruction="1. Understand how the operating system uses virtual memory and paging. 2. Run the memory-intensive application simulation and observe the page faults. 3. Induce a thrashing state by overloading the system memory. 4. Optimize the memory allocation to resolve the thrashing and stabilize the OS."
      compact
    >

      <style>{`
        .bg-retro-console {
          background: linear-gradient(135deg, #f3e8ff 0%, #fae8ff 50%, #e0e7ff 100%) !important;
          position: relative;
        }

        .bg-retro-console::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.07) 2.5px, transparent 2.5px), 
            linear-gradient(90deg, rgba(139, 92, 246, 0.07) 2.5px, transparent 2.5px);
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
          border: 2px solid #1e293b !important;
          border-radius: 20px !important;
          box-shadow: none !important;
          color: #0f172a !important;
          padding: 0.5rem !important;
          display: flex;
          flex-direction: column;
          position: relative;
          font-size: 0.85rem;
        }
        @media (min-width: 768px) {
          .toy-panel {
            border: 2px solid #1e293b !important;
            border-radius: 24px !important;
            box-shadow: none !important;
            padding: 1rem !important;
            font-size: 1rem;
          }
        }

        .toy-screen {
          background: #f8fafc !important;
          border: 2px solid #1e293b !important;
          border-radius: 14px !important;
          padding: 0.5rem !important;
          box-shadow: none !important;
          color: #0f172a !important;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          position: relative;
          font-size: 0.85rem;
        }
        @media (min-width: 768px) {
          .toy-screen {
            border: 2px solid #1e293b !important;
            border-radius: 16px !important;
            padding: 1rem !important;
            font-size: 1rem;
          }
        }

        .toy-console-badge {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: #8b5cf6;
          border: 2px solid #000000;
        }
        @media (min-width: 768px) {
          .toy-console-badge {
            width: 12px;
            height: 12px;
          }
        }



        .toy-card {
          border: 2px solid #000000 !important;
          border-radius: 14px !important;
          box-shadow: none !important;
          background: #fdf4ff !important;
          color: #701a75 !important;
          transition: all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-size: 0.9rem;
        }
        @media (min-width: 768px) {
          .toy-card {
            border: 2px solid #000000 !important;
            border-radius: 20px !important;
            box-shadow: none !important;
            font-size: 1.15rem;
          }
        }

        .toy-card:hover:not([disabled]) {
          transform: translateY(-2px) !important;
          box-shadow: none !important;
          background: #fae8ff !important;
        }
        @media (min-width: 768px) {
          .toy-card:hover:not([disabled]) {
            transform: translateY(-2px) !important;
            box-shadow: none !important;
          }
        }

        .toy-card:active:not([disabled]) {
          transform: translateY(1px) !important;
          box-shadow: none !important;
        }

        .toy-btn-tab {
          border: 2px solid #000000 !important;
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
            border: 2px solid #000000 !important;
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
        @media (min-width: 768px) {
          .toy-btn-tab:not([disabled]):hover {
            transform: translateY(-2px);
            box-shadow: none !important;
          }
        }

        .toy-btn-tab.active-tab {
          background: #ef4444 !important; /* red active tab */
          color: #ffffff !important;
          transform: translateY(1.5px);
          box-shadow: none !important;
        }
        @media (min-width: 768px) {
          .toy-btn-tab.active-tab {
            transform: translateY(1px);
            box-shadow: none !important;
          }
        }

        .toy-btn-action {
          background: #ef4444 !important; /* red action button */
          color: #ffffff !important;
          border: 2px solid #000000 !important;
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
            border: 2px solid #000000 !important;
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
          background: #dc2626 !important;
        }
        @media (min-width: 768px) {
          .toy-btn-action:hover:not([disabled]) {
            transform: translateY(-2px) !important;
            box-shadow: none !important;
          }
        }

        .toy-btn-action:active:not([disabled]) {
          transform: translateY(1px) !important;
          box-shadow: none !important;
        }

        .toy-btn-action-emerald {
          background: #10b981 !important;
          color: #ffffff !important;
        }
        .toy-btn-action-emerald:hover:not([disabled]) {
          background: #34d399 !important;
        }

        .toy-progress-rail {
          background: #e2e8f0 !important;
          border: 2px solid #000000 !important;
          height: 22px !important;
          border-radius: 9999px !important;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .toy-progress-fill {
          border-right: 2px solid #000000 !important;
          border-radius: 9999px 0 0 9999px !important;
        }

        .float-in { animation: floatIn 0.35s ease-out forwards; }
        @keyframes floatIn { 0%{transform:translateY(-12px) scale(0.8);opacity:0} 100%{transform:translateY(0) scale(1);opacity:1} }
      `}</style>

      <Celebration
        isActive={hasWon}
        message="OS Safeguards Verified! You booted the system modules, mapped address translations, and evicted least-recently-used pages while avoiding memory thrashing!"
        onReplay={() => {
          setPhase("assemble");
          setGameDesk(["Web Browser", "Music Player"]);
          setGameStorage(["Spreadsheet"]);
          setGameIndex(0);
          setGameHits(0);
          setGameFaults(0);
          setGameMessage("Memory manager online! Click Fetch on 'Video Editor' to load it.");
          setGameFinished(false);
          setHasSwapped(false);
          setBenchCompleted({ hdd: false, ssd: false });
          setChallengeStep("translation");
          setTranslationMappings({ 3: null, 5: null });
          setProtectionEnabled(false);
          setProtectionTested(false);
          setProtectionPassed(false);
          setLruChoice(null);
          setLruPassed(false);
          setHasWon(false);
        }}
      />

      <div ref={containerRef} className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1 relative select-none">
        
        {deploying && (
          <div className="absolute inset-0 bg-slate-100/85 z-50 pointer-events-none flex flex-col items-center justify-center rounded-3xl border-2 border-slate-800">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [1, 1.04, 1], opacity: 1 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="bg-white border-2 border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center shadow-2xl text-slate-900 font-sans"
            >
              <Zap className="w-10 h-10 mb-2 text-purple-400 animate-bounce" />
              <span className="text-base md:text-lg font-black tracking-widest uppercase text-purple-700">ACTIVATING VIRTUAL MEMORY</span>
              <span className="text-xs md:text-sm mt-1.5 text-slate-700 font-bold uppercase animate-pulse">Initializing address lookup table...</span>
            </motion.div>
          </div>
        )}

        <div className="shrink-0 flex gap-3">
          <button
            onClick={() => { setPhase("assemble"); playPop(); }}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              phase === "assemble" ? "active-tab text-white" : "bg-white text-slate-700"
            }`}
          >
            Paging Game
          </button>
          <button
            onClick={() => { if (isBooted) { setPhase("run"); playPop(); } }}
            disabled={!isBooted}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              !isBooted ? "opacity-25 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500" :
              phase === "run" ? "active-tab text-white" : "bg-white text-slate-700"
            }`}
          >
            Swapping Simulator
          </button>
          <button
            onClick={() => { if (isBooted && isSecondTabDone) { setPhase("challenge"); playPop(); } }}
            disabled={!isBooted || !isSecondTabDone}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              (!isBooted || !isSecondTabDone) ? "opacity-25 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500" :
              phase === "challenge" ? "active-tab text-white" : "bg-white text-slate-700"
            }`}
          >
            Memory Safeguards
          </button>
        </div>

        <AnimatePresence mode="wait">

          {phase === "assemble" && (
            <motion.div
              key="assemble"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              {/* TOP HEADER: Progress Queue & Scorecard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 shrink-0">
                {/* Active Request Tracker */}
                <div className="lg:col-span-8 toy-panel bg-white border-2 border-slate-800 p-4 rounded-3xl shadow-none flex flex-col justify-center">
                  <span className="text-xs font-black uppercase text-slate-500 mb-2">Memory Request Execution Queue</span>
                  <div className="flex flex-wrap gap-2">
                    {GAME_QUEUE.map((program, idx) => {
                      const isActive = idx === gameIndex;
                      const isCompleted = idx < gameIndex;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black rounded-xl text-xs font-black uppercase transition-all ${
                            isActive
                              ? "bg-violet-600 text-white shadow-none border-black"
                              : isCompleted
                              ? "bg-emerald-900/40 text-green-700 border-emerald-500/50"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isCompleted ? " " : isActive ? "▶ " : ""}
                          {program}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scorecard */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                  <div className="toy-panel bg-emerald-950/30 border-2 border-emerald-500/50 text-green-700 p-3 rounded-3xl shadow-none flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-emerald-400 mb-1">RAM Hits</span>
                    <span className="text-2xl font-black">{gameHits}</span>
                    <span className="text-[9px] font-bold text-emerald-400/80 mt-0.5"> 0.1ns Speed</span>
                  </div>
                  <div className="toy-panel bg-amber-50 border-2 border-amber-500 text-amber-700 p-3 rounded-3xl shadow-none flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-amber-600 mb-1">Page Faults</span>
                    <span className="text-2xl font-black">{gameFaults}</span>
                    <span className="text-[9px] font-bold text-amber-600/80 mt-0.5"> 12,000ns Speed</span>
                  </div>
                </div>
              </div>

              {/* MAIN BODY: Controller vs Memory Spaces */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* Left side: Active Request & Console (4 cols) */}
                <div className="lg:col-span-4 toy-panel flex flex-col min-h-0">
                  <div className="toy-screen bg-slate-50 p-4 flex flex-col gap-4 flex-1">
                    <span className="text-xs font-black uppercase text-slate-500">Active Controller</span>
                    
                    {!gameFinished ? (
                      <div className="flex flex-col gap-3 flex-1 justify-center">
                        <div className="border-2 border-slate-800 bg-white p-4 rounded-2xl shadow-none flex flex-col gap-2">
                          <span className="text-[10px] font-black text-slate-700 uppercase">Incoming Demand:</span>
                          <h4 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                            {GAME_QUEUE[gameIndex]}
                          </h4>

                          {/* RAM Status Badge */}
                          <div className="mt-1">
                            {gameDesk.includes(GAME_QUEUE[gameIndex]) ? (
                              !hasSwapped ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-green-600 bg-emerald-950/30 text-green-700 text-xs font-black rounded-lg uppercase">
                                  <Zap className="w-3.5 h-3.5 fill-green-600" /> RAM Hit Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-blue-600 bg-sky-950/30 text-blue-700 text-xs font-black rounded-lg uppercase">
                                  <CheckCircle className="w-3.5 h-3.5" /> Loaded in RAM
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-amber-600 bg-amber-50 text-amber-700 text-xs font-black rounded-lg uppercase animate-pulse">
                                <Activity className="w-3.5 h-3.5" /> Page Fault (Offline)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Control Button */}
                        {gameDesk.includes(GAME_QUEUE[gameIndex]) ? (
                          <button
                            onClick={runActiveProcess}
                            className="w-full toy-btn-action bg-emerald-600 hover:bg-green-400 text-white py-3.5 uppercase font-black text-base flex items-center justify-center gap-2 border-2 border-slate-800 rounded-2xl shadow-none active:translate-y-1 active:shadow-none transition-all"
                          >
                             Run Process
                          </button>
                        ) : gameStorage.includes(GAME_QUEUE[gameIndex]) ? (
                          <div className="flex flex-col gap-1.5">
                            <button
                              disabled
                              className="w-full py-3.5 bg-slate-200 border-4 border-dashed border-slate-300 text-slate-700 rounded-2xl font-black text-base uppercase cursor-not-allowed text-center"
                            >
                              Run Process Locked
                            </button>
                            <span className="text-[10px] text-amber-600 font-black text-center uppercase">
                              Click '{GAME_QUEUE[gameIndex]}' in Storage to Page In!
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => fetchFromDisk(GAME_QUEUE[gameIndex])}
                            className="w-full toy-btn-action bg-violet-600 hover:bg-purple-400 text-white py-3.5 uppercase font-black text-base flex items-center justify-center gap-2 border-2 border-slate-800 rounded-2xl shadow-none active:translate-y-1 active:shadow-none transition-all"
                          >
                             Fetch from Disk Source
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 flex-1 justify-center items-center text-center p-4">
                        <div className="w-12 h-12 bg-emerald-900/40 border-4 border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center mb-1 animate-bounce">
                          <CheckCircle className="w-6 h-6 stroke-[3]" />
                        </div>
                        <h4 className="text-base font-black text-green-700 uppercase">Subsystem Booted!</h4>
                        <p className="text-xs font-bold text-slate-600 leading-normal">
                          All memory page requests mapped and executed successfully with optimal swapping isolation.
                        </p>
                        <button
                          onClick={() => { setPhase("run"); playPop(); }}
                          className="mt-2 w-full toy-btn-action bg-emerald-500 hover:bg-emerald-400 text-white py-3 uppercase font-black text-sm flex items-center justify-center gap-1.5 border-2 border-slate-800 rounded-2xl shadow-none"
                        >
                          Go to Swapping Simulator <ArrowRight className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    )}

                    {/* Terminal Message Output */}
                    <div className="mt-auto border-2 border-slate-800 bg-sky-955 p-3 rounded-2xl shadow-[inset_0_3px_6px_rgba(0,0,0,0.3)] min-h-[80px] flex items-center font-mono text-xs md:text-sm font-bold text-emerald-400 bg-sky-950">
                      <span className="leading-snug">{gameMessage}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Workbench RAM and Page File Slots (8 cols) */}
                <div className="lg:col-span-8 toy-panel flex flex-col gap-3 min-h-0 overflow-hidden">
                  {/* Active RAM Desk (desks) */}
                  <div className="border-2 border-slate-800 bg-emerald-950/30/50 p-4 rounded-[24px] shadow-none flex-1 flex flex-col min-h-[120px]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black uppercase text-green-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 fill-green-700 text-green-700" /> Active RAM (Workbench - Max 3 Slots)
                      </span>
                      <span className="text-[10px] font-black text-emerald-400 bg-white border-2 border-emerald-500/50 px-2 py-0.5 rounded-lg uppercase">
                        {gameDesk.length} / 3 Sockets Used
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1 items-stretch">
                      {[0, 1, 2].map((slotIdx) => {
                        const program = gameDesk[slotIdx];
                        return (
                          <div
                            key={slotIdx}
                            className={`rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${
                              program
                                ? "border-black bg-white shadow-none hover:-translate-y-0.5 hover:shadow-none"
                                : "border-dashed border-emerald-800/50 bg-emerald-950/30/20"
                            }`}
                          >
                            {program ? (
                              <div className="flex flex-col items-center justify-between h-full w-full gap-2">
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                  Frame {slotIdx}
                                </span>
                                <span className="text-sm font-black text-slate-800 uppercase leading-snug truncate max-w-full">
                                  {program}
                                </span>
                                <button
                                  onClick={() => pageOut(program)}
                                  className="w-full py-1.5 bg-rose-100 hover:bg-rose-200 border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider text-rose-700 flex items-center justify-center gap-1"
                                >
                                  Page Out 
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-black uppercase tracking-wide text-emerald-400/60">
                                Empty RAM Slot
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Virtual Disk Storage (pagefile) */}
                  <div className="border-2 border-slate-800 bg-sky-950/30/50 p-4 rounded-[24px] shadow-none flex-1 flex flex-col min-h-[120px]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black uppercase text-blue-800 flex items-center gap-1.5">
                        <Database className="w-4 h-4 fill-blue-700 text-blue-700" /> Storage Box (Pagefile.sys - Max 5 Slots)
                      </span>
                      <span className="text-[10px] font-black text-sky-400 bg-white border-2 border-sky-500/50 px-2 py-0.5 rounded-lg uppercase">
                        {gameStorage.length} / 5 Swap Slots
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-3 flex-1 items-stretch">
                      {[0, 1, 2, 3, 4].map((slotIdx) => {
                        const program = gameStorage[slotIdx];
                        return (
                          <div
                            key={slotIdx}
                            className={`rounded-xl border-2 flex flex-col items-center justify-center p-1 text-center transition-all ${
                              program
                                ? "border-black bg-white shadow-none hover:-translate-y-0.5 hover:shadow-none"
                                : "border-dashed border-sky-900/40 bg-sky-950/30/10"
                            }`}
                          >
                            {program ? (
                              <div className="flex flex-col items-center justify-between h-full w-full gap-1.5">
                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                                  Swap {slotIdx}
                                </span>
                                <span className="text-[11px] font-black text-slate-800 uppercase leading-snug break-words max-w-full">
                                  {program}
                                </span>
                                <button
                                  onClick={() => pageIn(program)}
                                  className="w-full py-1 bg-emerald-900/40 hover:bg-green-200 border-2 border-black rounded-lg text-[9px] font-black uppercase tracking-wider text-green-700 flex items-center justify-center gap-1"
                                >
                                  Page In 
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-wide text-blue-400/50">
                                Empty
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "run" && (
            <motion.div
              key="run"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                <div className="lg:col-span-5 toy-panel">
                  <div className="toy-screen gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Swapping Simulator</h3>
                      <p className="text-sm text-slate-600 mt-1 font-bold leading-relaxed">
                        Exceed physical RAM size to invoke virtual swapping. HDD pages out slowly, causing CPU block. SSD handles transactions efficiently.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 bg-violet-950/30 p-4 border-2 border-slate-800 rounded-2xl shadow-none">
                      <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                        <span className="font-black text-sm uppercase">Memory Pressure:</span>
                        <span className="text-violet-400 uppercase font-black text-base bg-white border-2 border-black px-2.5 py-0.5 rounded-xl">
                          {memoryAllocation} GB / 8 GB RAM
                        </span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="32"
                        step="4"
                        value={memoryAllocation}
                        onChange={(e) => { setMemoryAllocation(parseInt(e.target.value)); playPop(); }}
                        disabled={simRunning}
                        className="w-full accent-purple-500 h-2 bg-white border-2 border-black rounded-lg cursor-pointer mt-1"
                      />
                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setStorageSpeed("hdd"); playPop(); }}
                          disabled={simRunning}
                          className={`flex-1 py-3 border-2 border-slate-800 rounded-2xl font-black text-sm uppercase transition-all ${
                            storageSpeed === "hdd" ? "bg-amber-400 text-slate-900 shadow-none" : "bg-white text-slate-600"
                          }`}
                        >
                          Mechanical HDD
                        </button>
                        <button
                          onClick={() => { setStorageSpeed("ssd"); playPop(); }}
                          disabled={simRunning}
                          className={`flex-1 py-3 border-2 border-slate-800 rounded-2xl font-black text-sm uppercase transition-all ${
                            storageSpeed === "ssd" ? "bg-amber-400 text-slate-900 shadow-none" : "bg-white text-slate-600"
                          }`}
                        >
                          Solid-State SSD
                        </button>
                      </div>

                      <button
                        onClick={runSimulation}
                        disabled={simRunning}
                        className="w-full toy-btn-action py-4 text-center font-black uppercase text-base flex items-center justify-center gap-2"
                      >
                        {simRunning ? "Simulating Swapping..." : "Run Allocation Load Test"}
                      </button>
                    </div>

                    {isSecondTabDone && (
                      <button
                        onClick={() => { setPhase("challenge"); playPop(); }}
                        className="w-full toy-btn-action bg-emerald-500 hover:bg-emerald-400 text-white py-3 mt-3 flex items-center justify-center gap-1.5 font-black uppercase border-2 border-slate-800 rounded-2xl shadow-none active:translate-y-1 active:shadow-none transition-all"
                      >
                        Go to Safeguards <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 toy-panel">
                  <div className="toy-screen p-4 justify-center items-center relative overflow-hidden">
                    <div className="w-full h-64 border-2 border-slate-800 rounded-3xl bg-white relative flex items-center justify-center p-2 shadow-inner">
                      <svg viewBox="0 0 800 300" className="w-full h-full">
                        {/* Physical RAM visualizer box */}
                        <rect x="50" y="80" width="280" height="140" rx="16" fill="#f8fafc" stroke="#10b981" strokeWidth="4" />
                        <text x="190" y="65" fill="#34d399" fontSize="14" fontWeight="black" textAnchor="middle">RAM Memory (8GB)</text>

                        {/* Page File on storage visualizer box */}
                        <rect x="470" y="80" width="280" height="140" rx="16" fill="#f8fafc" stroke="#0284c7" strokeWidth="4" />
                        <text x="610" y="65" fill="#0284c7" fontSize="14" fontWeight="black" textAnchor="middle">
                          Page File ({storageSpeed.toUpperCase()})
                        </text>

                        {/* Swapping Data nodes */}
                        {swappingActive ? (
                          <g>
                            {/* Line connecting RAM and Disk */}
                            <line x1="330" y1="150" x2="470" y2="150" stroke="#a855f7" strokeWidth="6" strokeDasharray="10,5" className="animate-[dash_1s_linear_infinite]" />
                            {/* Paging Data Packets flying back and forth */}
                            <motion.circle
                              cx="330"
                              cy="150"
                              r="10"
                              fill="#c084fc"
                              animate={{ cx: [335, 465, 335] }}
                              transition={{ duration: storageSpeed === "hdd" ? 2.0 : 0.4, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.circle
                              cx="465"
                              cy="150"
                              r="8"
                              fill="#f472b6"
                              animate={{ cx: [465, 335, 465] }}
                              transition={{ duration: storageSpeed === "hdd" ? 2.0 : 0.4, repeat: Infinity, ease: "linear" }}
                            />
                            <text x="400" y="125" fill="#a855f7" fontSize="12" fontWeight="black" textAnchor="middle" className="animate-bounce">
                              PAGING ACTIVE
                            </text>
                          </g>
                        ) : (
                          <g>
                            <line x1="330" y1="150" x2="470" y2="150" stroke="#cbd5e1" strokeWidth="4" />
                            <text x="400" y="140" fill="#334155" fontSize="12" fontWeight="bold" textAnchor="middle">
                              {memoryAllocation > 8 ? "Idle. Click Run to start swapping." : "No Swap Required (RAM fit)"}
                            </text>
                          </g>
                        )}

                        {/* Grid slots in RAM and Disk */}
                        {/* RAM Slots */}
                        <g>
                          <rect x="70" y="110" width="50" height="80" rx="8" fill="#34d399" opacity={memoryAllocation >= 4 ? 0.8 : 0.1} />
                          <rect x="130" y="110" width="50" height="80" rx="8" fill="#34d399" opacity={memoryAllocation >= 8 ? 0.8 : 0.1} />
                          <rect x="190" y="110" width="50" height="80" rx="8" fill="#34d399" opacity={memoryAllocation >= 8 ? 0.8 : 0.1} />
                          <rect x="250" y="110" width="50" height="80" rx="8" fill="#34d399" opacity={memoryAllocation >= 8 ? 0.8 : 0.1} />
                          <text x="190" y="155" fill="#064e3b" fontSize="12" fontWeight="black" textAnchor="middle">RAM Full</text>
                        </g>

                        {/* Disk Slots */}
                        <g>
                          <rect x="490" y="110" width="50" height="80" rx="8" fill="#0284c7" opacity={memoryAllocation >= 12 ? 0.8 : 0.1} />
                          <rect x="550" y="110" width="50" height="80" rx="8" fill="#0284c7" opacity={memoryAllocation >= 16 ? 0.8 : 0.1} />
                          <rect x="610" y="110" width="50" height="80" rx="8" fill="#0284c7" opacity={memoryAllocation >= 24 ? 0.8 : 0.1} />
                          <rect x="670" y="110" width="50" height="80" rx="8" fill="#0284c7" opacity={memoryAllocation >= 32 ? 0.8 : 0.1} />
                          <text x="610" y="155" fill="#082f49" fontSize="12" fontWeight="black" textAnchor="middle">
                            {memoryAllocation > 8 ? `Swap +${memoryAllocation - 8}GB` : "Disk Idle"}
                          </text>
                        </g>
                      </svg>
                    </div>

                    <div className="w-full flex justify-between text-sm font-black uppercase mt-4 bg-slate-100 p-4 rounded-2xl border-2 border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-xs font-bold mb-0.5">Average Page Latency</span>
                        <span className={`text-base font-black ${thrashingActive ? "text-rose-400 animate-pulse" : "text-slate-800"}`}>
                          {simRunning ? `${latencyValue} ns` : memoryAllocation > 8 ? `${latencyValue} ns` : "0.1 ns"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs font-bold mb-0.5">System Performance</span>
                        <span className={`text-base font-black ${thrashingActive ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                          {thrashingActive ? " THRASHING DETECTED" : " NORMAL"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === "challenge" && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                <div className="lg:col-span-7 toy-panel">
                  <div className="flex gap-3 mb-4 bg-sky-200/50 p-3 rounded-2xl border-2 border-slate-800 justify-between items-center text-base font-black">
                    <span className="text-sky-950">SAFEGUARDS STEPS:</span>
                    <div className="flex gap-6">
                      <span className={challengeStep === "translation" ? "text-purple-700 font-black animate-bounce" : "text-emerald-400 font-black"}>1. TRANSLATION</span>
                      <span className={challengeStep === "protection" ? "text-purple-700 font-black animate-bounce" : protectionPassed ? "text-emerald-400 font-black" : "text-slate-700"}>2. PROTECTION</span>
                      <span className={challengeStep === "lru" ? "text-purple-700 font-black animate-bounce" : lruPassed ? "text-emerald-400 font-black" : "text-slate-700"}>3. PAGE EVICTION</span>
                    </div>
                  </div>

                  <div className="toy-screen justify-center">

                    {challengeStep === "translation" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 uppercase">
                            Step 1: Virtual Address Translation (Page Table)
                          </h4>
                          <p className="text-base text-slate-700 mt-1 font-bold leading-relaxed">
                            Virtual pages must map to Physical frames in RAM. Match Virtual Page 3 to Frame 12 and Virtual Page 5 to Frame 8 to configure the mapping logic.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                          {/* Virtual Page selectors */}
                          <div className="flex flex-col gap-3">
                            <span className="text-xs font-black uppercase text-slate-500">Virtual Pages (VPN)</span>
                            {[3, 5].map(vpn => {
                              const isMapped = translationMappings[vpn] !== null;
                              return (
                                <div
                                  key={vpn}
                                  className={`p-4 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-white ${
                                    isMapped ? "border-green-600 bg-emerald-950/30" : "border-black"
                                  }`}
                                >
                                  <span className="font-black text-sm">Virtual Page {vpn}</span>
                                  {isMapped ? (
                                    <span className="text-xs font-black text-green-700 bg-green-200 border-2 border-green-700 px-2 py-0.5 rounded-lg">
                                      Frame {translationMappings[vpn]}
                                    </span>
                                  ) : (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleTranslationMap(vpn, 8)}
                                        className="bg-violet-900/40 hover:bg-purple-200 border-2 border-black font-black text-xs px-2 py-1 rounded"
                                      >
                                        Frame 8
                                      </button>
                                      <button
                                        onClick={() => handleTranslationMap(vpn, 12)}
                                        className="bg-violet-900/40 hover:bg-purple-200 border-2 border-black font-black text-xs px-2 py-1 rounded"
                                      >
                                        Frame 12
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex flex-col gap-3 p-4 border-2 border-slate-800 rounded-[24px] bg-slate-50 justify-center">
                            <span className="text-xs font-black uppercase text-slate-500 text-center block mb-2">Page Table Registry</span>
                            <div className="font-mono text-xs font-bold text-slate-700 flex flex-col gap-1.5">
                              <div className="flex justify-between border-b pb-1">
                                <span>VPN</span>
                                <span>PFN (RAM Frame)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>3</span>
                                <span>{translationMappings[3] !== null ? translationMappings[3] : "--"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>5</span>
                                <span>{translationMappings[5] !== null ? translationMappings[5] : "--"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {challengeStep === "protection" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 uppercase">
                            Step 2: Process Memory Protection (Isolation)
                          </h4>
                          <p className="text-base text-slate-700 mt-1 font-bold leading-relaxed">
                            Process B is attempting to write directly to Process A's private physical memory segment (PFN 12). Flip the Memory Protection switch on to enforce hardware-level page permission bounds.
                          </p>
                        </div>

                        <div className="flex flex-col gap-4 bg-sky-50 p-5 rounded-3xl border-2 border-slate-800 max-w-md w-full shadow-none">
                          <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                            <span className="text-base font-black">Memory Protection State:</span>
                            <button
                              onClick={() => { setProtectionEnabled(!protectionEnabled); playPop(); }}
                              className={`border-2 border-slate-800 font-black uppercase px-4 py-2 rounded-xl text-sm transition-all shadow-none ${
                                protectionEnabled ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                              }`}
                            >
                              {protectionEnabled ? "ENABLED" : "DISABLED"}
                            </button>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={testMemoryProtection}
                              disabled={protectionTested}
                              className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-2 border-slate-800 py-3 rounded-2xl font-black text-base uppercase shadow-none"
                            >
                              Test Process B Isolation Write
                            </button>
                          </div>

                          {protectionTested && (
                            <div className={`p-3 border-2 border-slate-800 rounded-xl text-xs font-black uppercase text-center ${
                              protectionPassed ? "bg-emerald-900/40 border-green-600 text-green-700 animate-bounce" : "bg-rose-900/40 border-red-600 text-red-700 animate-shake"
                            }`}>
                              {protectionPassed 
                                ? "Success: Write block active! Process B isolated." 
                                : "Error: Security violation! Process A's data was corrupted."
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {challengeStep === "lru" && (
                      <div className="flex flex-col gap-4 w-full">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 uppercase">
                            Step 3: Page Eviction (LRU Algorithm)
                          </h4>
                          <p className="text-base text-slate-700 mt-1 font-bold leading-relaxed">
                            RAM is full and contains Pages 1, 2, and 3. Page 4 needs to be loaded. Evict the Least Recently Used (LRU) page based on the access log below.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border-2 border-slate-800 bg-sky-50 rounded-2xl flex flex-col gap-2">
                            <span className="text-xs font-black uppercase text-slate-500 mb-1">Access History Log</span>
                            <div className="font-mono text-xs font-bold text-slate-700 flex flex-col gap-1">
                              <div>• Page 2: accessed 1s ago</div>
                              <div>• Page 3: accessed 5s ago</div>
                              <div className="text-sky-900 font-black">• Page 1: accessed 20s ago</div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 justify-center">
                            <span className="text-xs font-black uppercase text-slate-500">Select Page to Evict:</span>
                            <div className="flex gap-2">
                              {[1, 2, 3].map(page => {
                                const isWrong = lruChoice !== null && lruChoice === page && !lruPassed;
                                return (
                                  <button
                                    key={page}
                                    onClick={() => handleLruEviction(page)}
                                    disabled={lruPassed}
                                    className={`flex-1 py-3 border-2 border-slate-800 rounded-xl font-black text-sm uppercase transition-all shadow-none active:translate-y-1 active:shadow-none ${
                                      lruChoice === page && lruPassed ? "bg-emerald-600 text-white border-green-600" :
                                      isWrong ? "bg-rose-600 text-white border-red-600 animate-shake" :
                                      "bg-white text-slate-800 hover:bg-slate-50"
                                    }`}
                                  >
                                    Page {page}
                                  </button>
                                );
                              })}
                            </div>

                            {lruPassed && (
                              <button
                                onClick={handleFinishLab}
                                className="w-full toy-btn-action bg-emerald-500 hover:bg-emerald-400 text-white py-3.5 uppercase font-black text-base flex items-center justify-center gap-2 border-2 border-slate-800 rounded-2xl shadow-none active:translate-y-1 active:shadow-none transition-all mt-3"
                              >
                                Complete Memory Management Audit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                <div className="lg:col-span-5 toy-panel bg-sky-50 border-2 border-slate-800 rounded-[32px] p-6 shadow-none">
                  <div className="toy-screen p-4 justify-between bg-white border-2 border-slate-800 rounded-2xl shadow-inner">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sky-600 mb-1">
                        <Info size={20} className="stroke-[3]" />
                        <span className="text-sm font-black uppercase tracking-wider text-sky-700">OS Memory Registry</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Virtual Memory Logic</h3>
                      <p className="text-base text-slate-700 font-bold leading-relaxed">
                        Virtual address systems isolate applications, providing private address spaces. Physical constraints are bypassed by mapping inactive page segments dynamically to disk swap space.
                      </p>
                    </div>

                    <div className="bg-sky-100 p-4 border-2 border-slate-800 rounded-2xl mt-4">
                      <p className="text-sm text-slate-800 font-bold leading-relaxed">
                        <strong className="text-sky-900 uppercase block mb-1 text-base">OS Protection Check</strong>
                        Modern Operating Systems verify page permissions dynamically to prevent security corruption exploits and protect system core modules.
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
