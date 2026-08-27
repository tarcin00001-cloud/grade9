"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Server, 
  ShieldAlert, 
  Activity, 
  Globe, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Zap, 
  Sliders, 
  Sparkles, 
  ArrowRight,
  Info,
  Shield,
  Cpu,
  Database,
  Network
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ComponentId = "parser" | "waf" | "cache" | "dns";

interface EdgeComponent {
  id: ComponentId;
  name: string;
  desc: string;
  keywords: string[];
  technical: string;
}

const COMPONENTS: EdgeComponent[] = [
  {
    id: "parser",
    name: "HTTP Request Parser",
    desc: "Ingests raw traffic packets and extracts query variables and headers.",
    keywords: ["HTTP Parse", "Extract Headers", "Payload Decoder"],
    technical: "Reads raw bytes from network sockets and structures them into headers and parameters for security inspection."
  },
  {
    id: "waf",
    name: "WAF Firewall Shield",
    desc: "Inspects incoming requests against rulesets to block malicious payloads.",
    keywords: ["WAF Shield", "XSS Filter", "Regular Expressions"],
    technical: "Applies pattern matching algorithms to string inputs, stopping SQL injection and Cross-Site Scripting (XSS)."
  },
  {
    id: "cache",
    name: "Varnish Cache Engine",
    desc: "Stores static files in memory to serve requests instantly without hitting origin databases.",
    keywords: ["Reverse Proxy", "In-Memory cache", "Relieves backend"],
    technical: "Intercepts requests and serves cached files. Reduces bandwidth and database query overhead."
  },
  {
    id: "dns",
    name: "Anycast DNS Resolver",
    desc: "Translates human-readable domain names (e.g. discord.com) to edge proxy server IPs.",
    keywords: ["Anycast Network", "Fast DNS queries", "IP Routing"],
    technical: "Uses global IP routing to direct client queries to the nearest Cloudflare data center in milliseconds."
  }
];

const SLOT_POSITIONS: Record<ComponentId, { left: string; top: string; width: string; height: string }> = {
  parser: { left: "14%", top: "25%", width: "16%", height: "45%" },
  waf:    { left: "34%", top: "30%", width: "24%", height: "36%" },
  cache:  { left: "31%", top: "25%", width: "30%", height: "45%" },
  dns:    { left: "67%", top: "35%", width: "16%", height: "25%" }
};

// ─── INLINE SVGS ─────────────────────────────────────────────────────────────

const PartSVG = ({ id }: { id: ComponentId }) => {
  switch (id) {
    case "parser":
      return (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          <rect x="5" y="5" width="70" height="110" rx="16" fill="#ffedd5" stroke="#ea580c" strokeWidth="4" />
          <path d="M 40,20 L 40,80 M 40,80 L 25,65 M 40,80 L 55,65" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="15" y="90" width="50" height="20" rx="8" fill="#ea580c" />
          <text x="40" y="104" fill="#090d16" fontSize="9" fontWeight="black" textAnchor="middle">PARSER</text>
        </svg>
      );
    case "waf":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="5" y="5" width="90" height="90" rx="20" fill="#ffe4e6" stroke="#e11d48" strokeWidth="4" />
          <path d="M 50,20 L 75,30 L 75,55 C 75,70 50,80 50,80 C 50,80 25,70 25,55 L 25,30 Z" fill="#e11d48" opacity="0.3" stroke="#e11d48" strokeWidth="4" />
          <line x1="38" y1="48" x2="62" y2="48" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" />
          <line x1="50" y1="36" x2="50" y2="60" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case "cache":
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full">
          <rect x="5" y="5" width="90" height="110" rx="20" fill="#d1fae5" stroke="#059669" strokeWidth="4" />
          <ellipse cx="50" cy="30" rx="28" ry="12" fill="#34d399" stroke="#059669" strokeWidth="3" />
          <path d="M 22,30 L 22,55 A 28,12 0 0,0 78,55 L 78,30" fill="#34d399" stroke="#059669" strokeWidth="3" />
          <path d="M 22,55 L 22,80 A 28,12 0 0,0 78,80 L 78,55" fill="#34d399" stroke="#059669" strokeWidth="3" />
        </svg>
      );
    case "dns":
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <rect x="5" y="5" width="70" height="70" rx="16" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
          <circle cx="40" cy="40" r="18" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="4,3" />
          <circle cx="40" cy="40" r="8" fill="#0284c7" />
          <circle cx="20" cy="20" r="6" fill="#0284c7" />
          <circle cx="60" cy="20" r="6" fill="#0284c7" />
          <circle cx="20" cy="60" r="6" fill="#0284c7" />
          <circle cx="60" cy="60" r="6" fill="#0284c7" />
          <line x1="40" y1="40" x2="20" y2="20" stroke="#0284c7" strokeWidth="2.5" />
          <line x1="40" y1="40" x2="60" y2="20" stroke="#0284c7" strokeWidth="2.5" />
          <line x1="40" y1="40" x2="20" y2="60" stroke="#0284c7" strokeWidth="2.5" />
          <line x1="40" y1="40" x2="60" y2="60" stroke="#0284c7" strokeWidth="2.5" />
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
        className="absolute w-2.5 h-2.5 rounded-full bg-amber-400"
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
    <div className="relative border-2 border-black bg-violet-900/40 rounded-[32px] p-5 shadow-none flex flex-col min-h-0 overflow-visible transition-all h-[280px] md:h-[300px]">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b-2 border-black font-sans text-base md:text-lg text-purple-950 uppercase tracking-wider font-extrabold">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-black text-purple-800">EDGE_NODE</span>
          <span className={`w-4 h-4 rounded-full border-2 border-black ${
            powerLight === "green" ? "bg-green-400" : 
            powerLight === "red" ? "bg-rose-600 animate-pulse" : 
            "bg-amber-400 animate-pulse"
          }`} />
        </div>
      </div>

      <div className={`relative flex-1 rounded-[20px] bg-white border-2 border-black p-4 shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)] flex flex-col ${overflowClass}`}>
        <div className="relative z-10 flex-1 flex flex-col min-h-0 text-slate-800 font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Cloudflare9() {
  const { reportComplete } = useLMSBridge("cloudflare9");
  const { playPop, playSuccess, playError, playZap, playDrop } = useLabAudio();

  const [phase, setPhase] = useState<"assemble" | "run" | "challenge">("assemble");
  const [hasWon, setHasWon] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [isWafRulesetActive, setIsWafRulesetActive] = useState(false);
  const [incidentActive, setIncidentActive] = useState(false);
  const [wafKillswitch, setWafKillswitch] = useState(true);

  const [placed, setPlaced] = useState<Record<ComponentId, boolean>>({
    parser: false,
    waf: false,
    cache: false,
    dns: false
  });
  const [sparkActive, setSparkActive] = useState<Record<ComponentId, boolean>>({
    parser: false,
    waf: false,
    cache: false,
    dns: false
  });
  const [errorActive, setErrorActive] = useState<Record<ComponentId, boolean>>({
    parser: false,
    waf: false,
    cache: false,
    dns: false
  });

  const [hoveredComponent, setHoveredComponent] = useState<ComponentId | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentId | null>(null);
  const [justPlacedId, setJustPlacedId] = useState<ComponentId | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [regexPattern, setRegexPattern] = useState<"safe" | "unsafe">("safe");
  const [payloadSize, setPayloadSize] = useState(6);
  const [simRunning, setSimRunning] = useState(false);
  const [opsCount, setOpsCount] = useState(0);
  const [benchCompleted, setBenchCompleted] = useState({ safe: false, unsafe: false });
  const [treeBranches, setTreeBranches] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  const [challengeStep, setChallengeStep] = useState<"redos" | "canary" | "provider">("redos");
  const [redosAnswer, setRedosAnswer] = useState<"safe" | "unsafe" | null>(null);
  const [canarySlider, setCanarySlider] = useState(0);
  const [canaryTriggered, setCanaryTriggered] = useState(false);
  const [canaryRollback, setCanaryRollback] = useState(false);

  const [scanState, setScanState] = useState<Record<"safe" | "unsafe", "idle" | "scanning" | "passed" | "failed">>({
    safe: "idle",
    unsafe: "idle"
  });
  const [ruleQuarantined, setRuleQuarantined] = useState(false);
  const [spofBypassed, setSpofBypassed] = useState(false);

  const runRuleScan = (type: "safe" | "unsafe") => {
    if (scanState[type] !== "idle") return;
    setScanState(prev => ({ ...prev, [type]: "scanning" }));
    playZap();
    setTimeout(() => {
      if (type === "safe") {
        setScanState(prev => ({ ...prev, safe: "passed" }));
        playSuccess();
      } else {
        setScanState(prev => ({ ...prev, unsafe: "failed" }));
        playError();
      }
    }, 1500);
  };

  const isBooted = Object.values(placed).every(v => v);
  const isSecondTabDone = benchCompleted.safe && benchCompleted.unsafe;

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
        return next;
      });
      setSelectedComponent(null);
    } else {
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
        setTimeout(() => setErrorActive(s => ({ ...s, [compId]: false })), 700);
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

  const triggerDeploy = () => {
    setDeploying(true);
    playZap();
    setTimeout(() => {
      setDeploying(false);
      setIsWafRulesetActive(true);
      setIncidentActive(true);
      playError();
    }, 2000);
  };

  const handleKillswitch = () => {
    playZap();
    setWafKillswitch(false);
    setIncidentActive(false);
    playSuccess();
  };

  const runBenchmark = (type: "safe" | "unsafe") => {
    if (simRunning) return;
    setRegexPattern(type);
    setSimRunning(true);
    setOpsCount(0);
    setTreeBranches([]);

    let ops = 0;
    const intervalMs = 60;
    const maxOps = type === "safe" ? payloadSize * 2 : Math.pow(2, payloadSize);

    const timer = setInterval(() => {
      if (type === "safe") {
        ops += 1.5;
        if (ops >= maxOps) ops = maxOps;
        setOpsCount(Math.floor(ops));
      } else {
        ops += Math.floor(Math.pow(1.6, ops / 10)) + 1;
        if (ops >= maxOps) ops = maxOps;
        setOpsCount(Math.floor(ops));

        setTreeBranches(prev => {
          if (prev.length > 35) return prev;
          const currentLength = prev.length;
          const parent = currentLength === 0 ? { x1: 400, y1: 50, x2: 400, y2: 50 } : prev[Math.floor(Math.random() * currentLength)];
          const angle = (Math.random() - 0.5) * 1.5;
          const len = 30 + Math.random() * 20;
          return [
            ...prev,
            {
              x1: parent.x2,
              y1: parent.y2,
              x2: parent.x2 + Math.sin(angle) * len,
              y2: parent.y2 + Math.cos(angle) * len
            }
          ];
        });
      }

      if (ops >= maxOps) {
        clearInterval(timer);
        setSimRunning(false);
        playSuccess();
        setBenchCompleted(prev => ({ ...prev, [type]: true }));
      }
    }, intervalMs);
  };

  const handleRedosCheck = (ans: "safe" | "unsafe") => {
    setRedosAnswer(ans);
    if (ans === "unsafe") {
      playSuccess();
    } else {
      playError();
      setTimeout(() => setRedosAnswer(null), 1200);
    }
  };

  const handleCanarySlider = (val: number) => {
    setCanarySlider(val);
    if (val >= 1 && val <= 5 && !canaryTriggered) {
      setCanaryTriggered(true);
      playError();
      setTimeout(() => {
        setCanaryRollback(true);
        playSuccess();
      }, 1500);
    }
  };

  const handleFinishLab = () => {
    playSuccess();
    setHasWon(true);
    reportComplete();
  };

  return (
    <LabShell
      labId="cloudflare9" theme="cosmos"
      bgOverride="bg-retro-console"
      title="Cloudflare WAF CPU Bomb Lab"
      instruction="1. Learn about Web Application Firewalls (WAF) and CPU exhaustion attacks. 2. Launch a simulated CPU bomb attack against the unprotected server. 3. Configure the Cloudflare WAF rules to detect and mitigate the attack. 4. Verify that legitimate traffic is allowed while malicious requests are blocked."
      onReset={() => {
        setPhase("assemble");
        setPlaced({ parser: false, waf: false, cache: false, dns: false });
        setWafKillswitch(true);
        setIncidentActive(false);
        setIsWafRulesetActive(false);
        setBenchCompleted({ safe: false, unsafe: false });
        setChallengeStep("redos");
        setRedosAnswer(null);
        setCanarySlider(0);
        setCanaryTriggered(false);
        setCanaryRollback(false);
        setHasWon(false);
      }}
      compact
    >

      <style>{`
        .bg-retro-console {
          background: linear-gradient(135deg, #ffedd5 0%, #fef9c3 50%, #e0f2fe 100%) !important;
          position: relative;
        }

        .bg-retro-console::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(244, 63, 94, 0.07) 2.5px, transparent 2.5px), 
            linear-gradient(90deg, rgba(244, 63, 94, 0.07) 2.5px, transparent 2.5px);
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
          border: 2px solid #000000 !important;
          border-radius: 32px !important;
          box-shadow: none !important;
          color: #0f172a !important;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          font-size: 1.15rem;
        }

        .toy-screen {
          background: #f8fafc !important;
          border: 2px solid #000000 !important;
          border-radius: 24px !important;
          padding: 1.25rem;
          box-shadow: none !important;
          color: #0f172a !important;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          position: relative;
          font-size: 1.15rem;
        }

        .toy-console-badge {
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background: #f43f5e;
          border: 2px solid #000000;
        }

        .toy-card {
          border: 2px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
          background: #f0fdf4 !important;
          color: #166534 !important;
          transition: all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-size: 1.15rem;
        }

        .toy-card:hover:not([disabled]) {
          transform: translateY(-2px) !important;
          box-shadow: none !important;
          background: #dcfce7 !important;
        }

        .toy-card:active:not([disabled]) {
          transform: translateY(1px) !important;
          box-shadow: none !important;
        }

        .toy-btn-tab {
          border: 2px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
          font-weight: 950 !important;
          background: #f1f5f9 !important;
          color: #475569 !important;
          transition: all 0.1s ease;
          font-size: 1.15rem !important;
          padding-top: 0.75rem !important;
          padding-bottom: 0.75rem !important;
        }

        .toy-btn-tab:not([disabled]):hover {
          transform: translateY(-2px);
          box-shadow: none !important;
          color: #0f172a;
          background: #e2e8f0 !important;
        }

        .toy-btn-tab.active-tab {
          background: #facc15 !important;
          color: #0f172a !important;
          transform: translateY(1px);
          box-shadow: none !important;
        }

        .toy-btn-action {
          background: #f59e0b !important;
          color: #ffffff !important;
          border: 2px solid #000000 !important;
          border-radius: 24px !important;
          box-shadow: none !important;
          font-weight: 950 !important;
          transition: all 0.1s ease;
          font-size: 1.2rem !important;
        }

        .toy-btn-action:hover:not([disabled]) {
          transform: translateY(-2px) !important;
          box-shadow: none !important;
          background: #fbbf24 !important;
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

        .toy-progress-rail {
          background: #e2e8f0 !important;
          border: 2px solid #000000 !important;
          height: 22px !important;
          border-radius: 9999px !important;
          overflow: hidden;
          box-shadow: none;
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
        message="Outage Resolved! You built the proxy node, benchmarked linear vs exponential backtracking regex, and deployed a canary pipeline with safe rollbacks!"
        onReplay={() => {
          setPhase("assemble");
          setPlaced({ parser: false, waf: false, cache: false, dns: false });
          setWafKillswitch(true);
          setIncidentActive(false);
          setIsWafRulesetActive(false);
          setBenchCompleted({ safe: false, unsafe: false });
          setChallengeStep("redos");
          setRedosAnswer(null);
          setCanarySlider(0);
          setCanaryTriggered(false);
          setCanaryRollback(false);
          setHasWon(false);
        }}
      />

      <div ref={containerRef} className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1 relative select-none">
        
        {deploying && (
          <div className="absolute inset-0 bg-[#020617]/85 z-50 pointer-events-none flex flex-col items-center justify-center rounded-3xl border-4 border-black">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [1, 1.04, 1], opacity: 1 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="bg-[#1e293b] border-4 border-black p-6 rounded-3xl flex flex-col items-center justify-center shadow-2xl text-slate-100 font-sans"
            >
              <Zap className="w-10 h-10 mb-2 text-amber-500 animate-bounce" />
              <span className="text-base md:text-lg font-black tracking-widest uppercase text-amber-400">DEPLOYING WAF RULES</span>
              <span className="text-xs md:text-sm mt-1.5 text-slate-400 font-bold uppercase animate-pulse">Pushing ruleset to 200 cities...</span>
            </motion.div>
          </div>
        )}

        <div className="shrink-0 flex gap-3">
          <button
            onClick={() => { setPhase("assemble"); playPop(); }}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              phase === "assemble" ? "active-tab text-slate-900" : "bg-slate-900 text-slate-300"
            }`}
          >
            Configure WAF
          </button>
          <button
            onClick={() => { if (isBooted) { setPhase("run"); playPop(); } }}
            disabled={!isBooted}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              !isBooted ? "opacity-25 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500" :
              phase === "run" ? "active-tab text-slate-900" : "bg-slate-900 text-slate-300"
            }`}
          >
            Backtracking Simulator
          </button>
          <button
            onClick={() => { if (isBooted && isSecondTabDone) { setPhase("challenge"); playPop(); } }}
            disabled={!isBooted || !isSecondTabDone}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              (!isBooted || !isSecondTabDone) ? "opacity-25 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500" :
              phase === "challenge" ? "active-tab text-slate-900" : "bg-slate-900 text-slate-300"
            }`}
          >
            Deployment Pipeline
          </button>
        </div>

        <AnimatePresence mode="wait">

          {phase === "assemble" && (
            <motion.div
              key="assemble"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="relative w-full border-2 border-black bg-orange-50/50 rounded-[32px] overflow-hidden shadow-none flex flex-col items-center justify-center p-6" style={{ aspectRatio: "1264/700" }}>
                <div className="absolute inset-x-8 top-[20%] bottom-[20%] border-y border-orange-200 pointer-events-none flex flex-col justify-between opacity-40">
                  <div className="border-b border-orange-200 h-1/3 w-full" />
                  <div className="border-b border-orange-200 h-1/3 w-full" />
                </div>

                <div className="grid grid-cols-4 gap-6 w-full max-w-3xl relative z-10">
                  {Object.keys(SLOT_POSITIONS).map((id) => {
                    const compId = id as ComponentId;
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
                        className={`aspect-square rounded-[24px] border-4 transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isPlaced
                            ? compId === "parser" ? "border-orange-500 bg-orange-100 shadow-[2px_2px_0px_#000]" :
                              compId === "waf" ? "border-rose-500/50 bg-rose-900/40 shadow-[2px_2px_0px_#000]" :
                              compId === "cache" ? "border-emerald-500/50 bg-emerald-900/40 shadow-[2px_2px_0px_#000]" :
                              "border-violet-500/50 bg-violet-900/40 shadow-[2px_2px_0px_#000]"
                            : isSelected
                            ? "border-yellow-400 bg-amber-900/40 animate-pulse"
                            : isHovered
                            ? "border-orange-400 bg-orange-50"
                            : compId === "parser" ? "border-dashed border-orange-300 bg-orange-50/20 hover:border-orange-400" :
                              compId === "waf" ? "border-dashed border-rose-800/50 bg-rose-950/30/20 hover:border-red-400" :
                              compId === "cache" ? "border-dashed border-emerald-800/50 bg-emerald-950/30/20 hover:border-green-400" :
                              "border-dashed border-violet-800/50 bg-violet-950/30/20 hover:border-blue-400"
                        }`}
                      >
                        {isPlaced ? (
                          <div className="relative w-full h-full p-2.5 flex flex-col items-center justify-center gap-2">
                            <div className="w-16 h-16"><PartSVG id={compId} /></div>
                            <span className={`text-xs md:text-sm font-black uppercase text-center truncate w-full ${
                              compId === "parser" ? "text-orange-700" :
                              compId === "waf" ? "text-red-700" :
                              compId === "cache" ? "text-green-700" :
                              "text-blue-700"
                            }`}>
                              {COMPONENTS.find(c => c.id === compId)?.name.split(" ")[0]}
                            </span>
                            <span className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-full border-2 border-black ${incidentActive && compId === "waf" ? "bg-rose-600 animate-ping" : "bg-green-400 animate-pulse"}`} />
                          </div>
                        ) : (
                          <div className="text-center p-2 text-slate-500 font-bold flex flex-col items-center gap-2">
                            <div className="w-14 h-14 opacity-30"><PartSVG id={compId} /></div>
                            <span className="text-xs font-black uppercase tracking-wide px-2 py-0.5 rounded bg-black/10 text-slate-600">
                              {COMPONENTS.find(c => c.id === compId)?.name.split(" ")[0]}
                            </span>
                          </div>
                        )}

                        {sparkActive[compId] && <Sparks />}
                        {justPlacedId === compId && (
                          <span className="absolute top-2 right-2 text-xs bg-emerald-600 text-white border-2 border-black font-black px-2 py-0.5 rounded-xl uppercase">Connected!</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {isBooted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 w-full max-w-2xl border-2 p-4 rounded-2xl flex justify-between items-center bg-[#020617] border-black shadow-none`}
                    style={{ borderColor: incidentActive ? "#ef4444" : "#10b981" }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-500 uppercase">CDN Proxy Node Status</span>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full border-2 border-black ${incidentActive ? "bg-rose-600 animate-ping" : "bg-green-400 animate-pulse"}`} />
                        <span className={`text-base font-black uppercase ${incidentActive ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                          {incidentActive ? "CRITICAL: WAF RULES BLOCKED (502 Bad Gateway)" : "NODE ONLINE - ROUTING OK"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-black">
                      <div className="text-right">
                        <span className="text-slate-500 block text-xs uppercase font-bold">Server CPU Load</span>
                        <span className={`text-base font-black ${incidentActive ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                          {incidentActive ? "100.0% CPU" : "2.4% CPU"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="absolute inset-0 pointer-events-none border-[8px] border-orange-200 rounded-3xl" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
                <CyberConsole title="Specs Dossier" powerLight={hoveredComponent || selectedComponent ? "amber" : incidentActive ? "red" : "green"}>
                  {hoveredComponent || selectedComponent ? (
                    (() => {
                      const comp = COMPONENTS.find(c => c.id === (hoveredComponent || selectedComponent));
                      return (
                        <div className="flex flex-col gap-2.5 h-full justify-center">
                          <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-1.5 shrink-0">
                            <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                            <h4 className="text-orange-600 font-black uppercase text-base md:text-lg tracking-wide">{comp?.name}</h4>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 py-0.5 shrink-0">
                            {comp?.keywords.map((kw, i) => (
                              <span key={i} className="px-2.5 py-0.5 rounded-lg bg-orange-100 border-2 border-orange-500 text-orange-700 font-extrabold text-xs uppercase">
                                {kw}
                              </span>
                            ))}
                          </div>
                          
                          <p className="text-slate-700 text-sm md:text-base font-bold leading-relaxed border-t border-slate-200 pt-1.5">
                            {comp?.technical}
                          </p>
                        </div>
                      );
                    })()
                  ) : incidentActive ? (
                    <div className="flex flex-col gap-2.5 h-full justify-center">
                      <h4 className="text-rose-600 font-black text-base md:text-lg border-b-2 border-rose-200 pb-1.5 uppercase tracking-wide flex items-center gap-2 animate-bounce">
                        <ShieldAlert className="w-6 h-6 stroke-[3]" /> ALARM: Catastrophic Backtracking
                      </h4>
                      <p className="text-slate-600 text-sm md:text-base font-bold leading-relaxed">
                        A catastrophic backtracking loop in the newly deployed XSS regex ruleset has locked up the CPU core! Standard deployments are stuck.
                      </p>
                      <button
                        onClick={handleKillswitch}
                        className="mt-2 w-full bg-rose-600 hover:bg-red-400 text-white font-black uppercase text-base py-3 px-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5"
                      >
                        🚨 FLIP RULES SWITCH: OFF 🚨
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 h-full justify-center">
                      <h4 className="text-indigo-700 font-black text-sm md:text-base uppercase tracking-wider">EDGE NODE CONFIGURATOR</h4>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-bold">
                        Drag or click components to insert Request Parser, WAF Firewall Shield, Cache Engine, and DNS Resolver to boot the CDN node.
                      </p>

                      {isBooted && !isWafRulesetActive && (
                        <button
                          onClick={triggerDeploy}
                          className="mt-2 w-full toy-btn-action bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-3 uppercase font-black text-base border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all animate-bounce"
                        >
                          🚀 Deploy WAF Ruleset Update
                        </button>
                      )}

                      {isWafRulesetActive && !incidentActive && (
                        <div className="mt-2 flex flex-col gap-2 p-3 rounded-2xl bg-emerald-50 border-4 border-emerald-300 text-emerald-800 text-sm font-black uppercase">
                          <span>✓ WAF Update safe (Killswitch triggered)</span>
                          <button
                            onClick={() => { setPhase("run"); playPop(); }}
                            className="w-full bg-emerald-600 text-white px-4 py-2 border-4 border-black rounded-xl hover:bg-green-400 transition-all font-black text-sm flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
                          >
                            Go to Tab 2 <ArrowRight className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </CyberConsole>

                <CyberConsole title="Component Inventory" overflowClass="overflow-visible">
                  <div className="grid grid-cols-2 gap-2 h-full items-center relative overflow-visible">
                    {COMPONENTS.map(c => {
                      if (placed[c.id]) {
                        return (
                          <div key={c.id} className="h-14 border-4 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-black uppercase tracking-wide">
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
                          }}
                          onDragEnd={(e, info) => {
                            setHoveredComponent(null);
                            handleDragEnd(c.id, info);
                          }}
                          onClick={() => {
                            setSelectedComponent(isSelected ? null : c.id);
                            playPop();
                          }}
                          className={`h-14 p-2 toy-card flex items-center gap-2 cursor-grab active:cursor-grabbing select-none relative ${
                            isSelected ? "border-yellow-400" : ""
                          }`}
                          style={{ touchAction: "none" }}
                        >
                          <div className="w-10 h-10 shrink-0">
                            <PartSVG id={c.id} />
                          </div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-slate-800 leading-tight">
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
                      <h3 className="text-xl font-black text-slate-800">Backtracking Simulator</h3>
                      <p className="text-sm text-slate-600 mt-1 font-bold leading-relaxed">
                        Simulate regex parsing over string inputs. Adjust the repeating character payload size.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 bg-orange-50 p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000]">
                      <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                        <span className="font-extrabold text-sm uppercase">Payload Size:</span>
                        <span className="text-orange-600 uppercase font-black text-base bg-[#020617] border-2 border-black px-2.5 py-0.5 rounded-xl">
                          {payloadSize} Characters
                        </span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="16"
                        step="1"
                        value={payloadSize}
                        onChange={(e) => { setPayloadSize(parseInt(e.target.value)); playPop(); }}
                        disabled={simRunning}
                        className="w-full accent-orange-500 h-2 bg-[#020617] border-2 border-black rounded-lg cursor-pointer mt-1"
                      />
                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                      <button
                        onClick={() => runBenchmark("safe")}
                        disabled={simRunning}
                        className={`w-full p-4 rounded-2xl border-4 flex items-center justify-between text-left transition-all ${
                          simRunning ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01] cursor-pointer shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none"
                        } ${benchCompleted.safe ? "border-green-600 bg-emerald-950/30 text-green-900" : "border-black bg-[#020617]"}`}
                      >
                        <div>
                          <p className="font-black text-base uppercase text-slate-900">Safe Linear Regex</p>
                          <p className="text-slate-500 text-xs mt-1 font-bold">Complexity: O(N). Linear character search.</p>
                        </div>
                        {benchCompleted.safe ? <CheckCircle className="text-emerald-400 w-6 h-6 stroke-[3]" /> : <Play className="text-violet-400 w-6 h-6 stroke-[3]" />}
                      </button>

                      <button
                        onClick={() => runBenchmark("unsafe")}
                        disabled={simRunning}
                        className={`w-full p-4 rounded-2xl border-4 flex items-center justify-between text-left transition-all ${
                          simRunning ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01] cursor-pointer shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none"
                        } ${benchCompleted.unsafe ? "border-green-600 bg-emerald-950/30 text-green-900" : "border-black bg-[#020617]"}`}
                      >
                        <div>
                          <p className="font-black text-base uppercase text-slate-900">Backtracking Regex</p>
                          <p className="text-slate-500 text-xs mt-1 font-bold">Complexity: O(2^N). Nested loops split paths.</p>
                        </div>
                        {benchCompleted.unsafe ? <CheckCircle className="text-emerald-400 w-6 h-6 stroke-[3]" /> : <Play className="text-rose-400 w-6 h-6 stroke-[3] animate-pulse" />}
                      </button>
                    </div>

                    {isSecondTabDone && (
                      <button
                        onClick={() => { setPhase("challenge"); playPop(); }}
                        className="w-full toy-btn-action bg-emerald-500 hover:bg-emerald-400 text-white py-3 mt-3 flex items-center justify-center gap-1.5 font-black uppercase border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all"
                      >
                        Go to tab 3 <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 toy-panel">
                  <div className="toy-screen p-4 justify-center items-center relative overflow-hidden">
                    <div className="w-full h-64 border-4 border-black rounded-3xl bg-[#020617] relative flex items-center justify-center p-2 shadow-inner">
                      <svg viewBox="0 0 800 300" className="w-full h-full">
                        {regexPattern === "safe" && (
                          <g>
                            <line x1="50" y1="150" x2="750" y2="150" stroke="#cbd5e1" strokeWidth="6" />
                            {Array.from({ length: Math.min(opsCount, 12) }).map((_, i) => (
                              <motion.circle
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                cx={80 + i * 55}
                                cy="150"
                                r="12"
                                fill="#34d399"
                                stroke="#000000"
                                strokeWidth="3"
                              />
                            ))}
                            <text x="400" y="55" fill="#0f172a" fontSize="20" fontWeight="black" textAnchor="middle" letterSpacing="1">
                              LINEAR MATCH STEPS: {opsCount}
                            </text>
                          </g>
                        )}

                        {regexPattern === "unsafe" && (
                          <g>
                            {treeBranches.map((branch, i) => (
                              <motion.line
                                key={i}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3 }}
                                x1={branch.x1}
                                y1={branch.y1}
                                x2={branch.x2}
                                y2={branch.y2}
                                stroke="#f43f5e"
                                strokeWidth="4"
                                opacity="0.9"
                              />
                            ))}
                            <text x="400" y="45" fill="#e11d48" fontSize="22" fontWeight="black" textAnchor="middle" letterSpacing="1" className="animate-pulse">
                              EXPONENTIAL BRANCH SPLITS: {opsCount}
                            </text>
                          </g>
                        )}

                        {opsCount === 0 && (
                          <text x="400" y="150" fill="#94a3b8" fontSize="16" fontWeight="bold" textAnchor="middle">
                            Select a regex ruleset and click Run to view execution complexity.
                          </text>
                        )}
                      </svg>
                    </div>

                    <div className="w-full flex justify-between text-sm font-black uppercase mt-4 bg-slate-100 p-4 rounded-2xl border-4 border-black">
                      <div>
                        <span className="text-slate-500 block text-xs font-bold mb-0.5">Operation Steps</span>
                        <span className={`text-base font-black ${regexPattern === "unsafe" && opsCount > 100 ? "text-rose-400 animate-pulse" : "text-slate-800"}`}>
                          {opsCount} steps
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs font-bold mb-0.5">Core CPU State</span>
                        <span className={`text-base font-black ${simRunning && regexPattern === "unsafe" ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                          {simRunning && regexPattern === "unsafe" ? "💥 100% CPU LOCK" : "✅ NORMAL"}
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
                  <div className="flex gap-3 mb-4 bg-purple-200/50 p-3 rounded-2xl border-4 border-black justify-between items-center text-base font-black">
                    <span className="text-purple-950">PIPELINE STEPS:</span>
                    <div className="flex gap-6">
                      <span className={challengeStep === "redos" ? "text-orange-600 font-black animate-bounce" : ruleQuarantined ? "text-emerald-400 font-black" : "text-purple-400"}>1. SCANNER</span>
                      <span className={challengeStep === "canary" ? "text-orange-600 font-black animate-bounce" : canaryRollback ? "text-emerald-400 font-black" : "text-purple-400"}>2. CANARY</span>
                      <span className={challengeStep === "provider" ? "text-orange-600 font-black animate-bounce" : spofBypassed ? "text-emerald-400 font-black" : "text-purple-400"}>3. REDUNDANCY</span>
                    </div>
                  </div>

                  <div className="toy-screen justify-center">
                    
                    {challengeStep === "redos" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-lg font-black text-slate-200 flex items-center gap-1.5 uppercase">
                            <Sparkles size={18} className="text-amber-500 animate-spin" /> Step 1: WAF Rule Code Scanner
                          </h4>
                          <p className="text-base text-slate-700 mt-1 font-bold leading-relaxed">
                            Before deploying WAF security rules, we must scan them for catastrophic backtracking loops (ReDoS). Click <strong>SCAN</strong> on both rules to inspect them!
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 max-w-md w-full">
                          {[
                            {
                              id: "safe" as const,
                              title: "Rule #1043 (Linear Regex)",
                              code: "/^[a-zA-Z0-9_-]+$/",
                              desc: "Matches standard alphanumeric strings in O(N) linear time."
                            },
                            {
                              id: "unsafe" as const,
                              title: "Rule #1044 (Backtracking Hazard)",
                              code: "/^(a+)+$/",
                              desc: "Danger! Nested quantifiers cause O(2^N) backtracking splits."
                            }
                          ].map(rule => {
                            const state = scanState[rule.id];
                            const isScanning = state === "scanning";
                            return (
                              <div
                                key={rule.id}
                                className={`p-4 border-4 border-black rounded-2xl flex flex-col gap-2 transition-all ${
                                  state === "passed" ? "bg-emerald-900/40 text-green-900 border-green-600" :
                                  state === "failed" ? "bg-rose-900/40 text-red-900 border-red-600 animate-shake" :
                                  "bg-violet-950/30 text-slate-800"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold text-base">{rule.title}</span>
                                  <span className="font-mono bg-black/10 px-2 py-0.5 rounded text-sm font-black">{rule.code}</span>
                                </div>
                                <p className="text-sm font-bold opacity-80">{rule.desc}</p>
                                
                                <div className="flex justify-between items-center mt-1">
                                  {state === "idle" && (
                                    <button
                                      onClick={() => runRuleScan(rule.id)}
                                      className="toy-btn-action bg-amber-400 hover:bg-amber-300 text-slate-200 py-1.5 px-4 text-sm font-black uppercase"
                                    >
                                      SCAN RULE
                                    </button>
                                  )}
                                  {isScanning && (
                                    <div className="flex items-center gap-2 text-sm font-black text-amber-600 uppercase">
                                      <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
                                      Scanning rule patterns...
                                    </div>
                                  )}
                                  {state === "passed" && (
                                    <span className="text-sm font-black text-emerald-400 uppercase flex items-center gap-1">
                                      SCAN PASSED (SAFE)
                                    </span>
                                  )}
                                  {state === "failed" && (
                                    <span className="text-sm font-black text-rose-400 uppercase flex items-center gap-1">
                                      HAZARD DETECTED (RE-DOS RISK)
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {scanState.unsafe === "failed" && !ruleQuarantined && (
                            <button
                              onClick={() => {
                                setRuleQuarantined(true);
                                playSuccess();
                              }}
                              className="mt-2 w-full toy-btn-action bg-rose-500 hover:bg-rose-400 text-white py-3 uppercase font-black text-base flex items-center justify-center gap-2 border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all"
                            >
                              Quarantine & Delete Rule #1044
                            </button>
                          )}

                          {ruleQuarantined && (
                            <button
                              onClick={() => { setChallengeStep("canary"); playPop(); }}
                              className="mt-2 w-full toy-btn-action bg-violet-600 hover:bg-purple-400 text-white py-3 uppercase font-black text-base flex items-center justify-center gap-2 border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all"
                            >
                              Next Step: Canary Deployment <ArrowRight size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {challengeStep === "canary" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-lg font-black text-slate-200 flex items-center gap-1.5 uppercase">
                            <Sparkles size={18} className="text-orange-500" /> Step 2: Progressive Canary Rollout
                          </h4>
                          <p className="text-base text-slate-700 mt-1 font-bold leading-relaxed">
                            Rather than deploying updates globally, staging rollouts isolate issues. Drag the slider to send the update to WAF Canary servers first (1% traffic)!
                          </p>
                        </div>

                        <div className="flex flex-col gap-4 bg-orange-50 p-5 rounded-3xl border-4 border-black max-w-md w-full shadow-[4px_4px_0px_#000]">
                          <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                            <span className="text-base font-black">Staged Traffic Rollout:</span>
                            <span className="text-orange-600 font-black text-lg bg-[#020617] px-2.5 py-0.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">{canarySlider}%</span>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={canarySlider}
                            disabled={canaryRollback}
                            onChange={(e) => handleCanarySlider(parseInt(e.target.value))}
                            className="w-full accent-orange-500 h-3 bg-[#020617] border-2 border-black rounded-lg cursor-pointer"
                          />

                          <div className="relative h-10 bg-[#020617] border-4 border-black rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                            <div className="absolute left-0 w-[5%] h-full bg-orange-400/25 border-r-2 border-dashed border-orange-500 flex items-center justify-center">
                              <span className="text-[9px] text-orange-700 font-extrabold uppercase">Canary</span>
                            </div>
                            <div style={{ width: `${canarySlider}%` }} className="absolute left-0 h-full bg-orange-400/50 transition-all duration-75" />
                            <span className="relative z-10 text-xs font-black uppercase text-slate-800">
                              {canaryRollback ? "Ruleset Reverted Successfully" : canaryTriggered ? "ALERT: CPU LOAD EXCEEDS SAFETY LIMIT! ROLLBACK..." : "Deploying update..."}
                            </span>
                          </div>
                        </div>

                        {canaryRollback && (
                          <div className="max-w-md w-full flex flex-col gap-3">
                            <span className="text-sm text-emerald-400 font-black uppercase text-center block animate-bounce bg-emerald-950/30 border-4 border-emerald-500/50 p-3 rounded-2xl">
                              Success: Automated rollback successful! Only 1% of nodes experienced CPU load.
                            </span>
                            <button
                              onClick={() => { setChallengeStep("provider"); playPop(); }}
                              className="w-full toy-btn-action bg-violet-600 hover:bg-purple-400 text-white py-3 uppercase font-black text-base flex items-center justify-center gap-2 border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all animate-bounce"
                            >
                              Next Step: Redundancy Audit <ArrowRight size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {challengeStep === "provider" && (
                      <div className="flex flex-col gap-4 w-full">
                        <div>
                          <h4 className="text-lg font-black text-slate-200 flex items-center gap-1.5 uppercase">
                            <Sparkles size={18} className="text-emerald-400" /> Step 3: Redundancy Audit (SPOF Bypass)
                          </h4>
                          <p className="text-base text-slate-700 mt-1 font-bold leading-relaxed">
                            Why did a single misconfigured firewall rule on Cloudflare take down Shopify, Fitbit, and Discord all at once? Because they route through one central proxy bottleneck.
                          </p>
                          <p className="text-base font-black text-rose-600 mt-2">
                            Tap the Red Proxy Bottleneck node to activate redundant bypass routing!
                          </p>
                        </div>

                        <div className="w-full bg-slate-50 border-4 border-black rounded-3xl p-4 flex flex-col items-center justify-center min-h-[240px]">
                          <svg viewBox="0 0 600 240" className="w-full h-full max-w-lg">
                            {/* Route paths */}
                            {/* Direct Bypasses */}
                            {spofBypassed && (
                              <g>
                                <path d="M 60,60 C 180,-10 420,-10 540,60" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="8,4" className="animate-[dash_2s_linear_infinite]" />
                                <path d="M 60,180 C 180,250 420,250 540,180" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="8,4" className="animate-[dash_2s_linear_infinite]" />
                                <path d="M 60,120 C 150,50 450,50 540,120" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="8,4" className="animate-[dash_2s_linear_infinite]" />
                              </g>
                            )}

                            {/* Standard paths (through WAF) */}
                            <g>
                              <line x1="60" y1="60" x2="300" y2="120" stroke={spofBypassed ? "#94a3b8" : "#ef4444"} strokeWidth="4" strokeDasharray={spofBypassed ? "" : "6,3"} />
                              <line x1="60" y1="120" x2="300" y2="120" stroke={spofBypassed ? "#94a3b8" : "#ef4444"} strokeWidth="4" strokeDasharray={spofBypassed ? "" : "6,3"} />
                              <line x1="60" y1="180" x2="300" y2="120" stroke={spofBypassed ? "#94a3b8" : "#ef4444"} strokeWidth="4" strokeDasharray={spofBypassed ? "" : "6,3"} />

                              <line x1="300" y1="120" x2="540" y2="60" stroke={spofBypassed ? "#94a3b8" : "#ef4444"} strokeWidth="4" strokeDasharray={spofBypassed ? "" : "6,3"} />
                              <line x1="300" y1="120" x2="540" y2="120" stroke={spofBypassed ? "#94a3b8" : "#ef4444"} strokeWidth="4" strokeDasharray={spofBypassed ? "" : "6,3"} />
                              <line x1="300" y1="120" x2="540" y2="180" stroke={spofBypassed ? "#94a3b8" : "#ef4444"} strokeWidth="4" strokeDasharray={spofBypassed ? "" : "6,3"} />
                            </g>

                            {/* Clients Column */}
                            <circle cx="60" cy="60" r="20" fill="#a78bfa" stroke="#000000" strokeWidth="3" />
                            <text x="60" y="64" fill="#090d16" fontSize="10" fontWeight="black" textAnchor="middle">MOB</text>
                            
                            <circle cx="60" cy="120" r="20" fill="#a78bfa" stroke="#000000" strokeWidth="3" />
                            <text x="60" y="124" fill="#090d16" fontSize="10" fontWeight="black" textAnchor="middle">LAP</text>

                            <circle cx="60" cy="180" r="20" fill="#a78bfa" stroke="#000000" strokeWidth="3" />
                            <text x="60" y="184" fill="#090d16" fontSize="10" fontWeight="black" textAnchor="middle">TAB</text>

                            <text x="60" y="215" fill="#000000" fontSize="11" fontWeight="black" textAnchor="middle">CLIENTS</text>

                            {/* Proxy WAF node in middle */}
                            <motion.g
                              whileHover={{ scale: 1.1 }}
                              onClick={() => {
                                if (!spofBypassed) {
                                  setSpofBypassed(true);
                                  playZap();
                                  setTimeout(() => playSuccess(), 800);
                                }
                              }}
                              className="cursor-pointer"
                            >
                              <circle
                                cx="300"
                                cy="120"
                                r="32"
                                fill={spofBypassed ? "#10b981" : "#ef4444"}
                                stroke="#000000"
                                strokeWidth="4"
                                className={spofBypassed ? "" : "animate-pulse"}
                              />
                              <text x="300" y="124" fill="#090d16" fontSize="9" fontWeight="black" textAnchor="middle">
                                {spofBypassed ? "PASS" : "BLOCKED"}
                              </text>
                              <text x="300" y="172" fill="#000000" fontSize="11" fontWeight="black" textAnchor="middle">
                                {spofBypassed ? "ACTIVE BYPASS" : "SPOF PROXY GATE"}
                              </text>
                            </motion.g>

                            {/* Origin Web Servers */}
                            <circle cx="540" cy="60" r="20" fill="#a78bfa" stroke="#000000" strokeWidth="3" />
                            <text x="540" y="64" fill="#090d16" fontSize="10" fontWeight="black" textAnchor="middle">CHAT</text>
                            <text x="540" y="32" fill="#000000" fontSize="9" fontWeight="black" textAnchor="middle">Discord</text>

                            <circle cx="540" cy="120" r="20" fill="#a78bfa" stroke="#000000" strokeWidth="3" />
                            <text x="540" y="124" fill="#090d16" fontSize="10" fontWeight="black" textAnchor="middle">SHOP</text>
                            <text x="540" y="96" fill="#000000" fontSize="9" fontWeight="black" textAnchor="middle">Shopify</text>

                            <circle cx="540" cy="180" r="20" fill="#a78bfa" stroke="#000000" strokeWidth="3" />
                            <text x="540" y="184" fill="#090d16" fontSize="10" fontWeight="black" textAnchor="middle">FIT</text>
                            <text x="540" y="156" fill="#000000" fontSize="9" fontWeight="black" textAnchor="middle">Fitbit</text>

                            <text x="540" y="215" fill="#000000" fontSize="11" fontWeight="black" textAnchor="middle">WEBSITES</text>
                          </svg>

                          <style>{`
                            @keyframes dash {
                              to {
                                stroke-dashoffset: -40;
                              }
                            }
                          `}</style>
                        </div>

                        {spofBypassed && (
                          <div className="max-w-md w-full flex flex-col gap-3 mt-1">
                            <span className="text-sm text-emerald-400 font-black uppercase text-center block animate-bounce bg-emerald-950/30 border-4 border-emerald-500/50 p-3 rounded-2xl">
                              Direct Redundant paths unlocked! Traffic bypassing single point of failure (SPOF) proxy.
                            </span>
                            <button
                              onClick={handleFinishLab}
                              className="w-full toy-btn-action bg-emerald-500 hover:bg-emerald-400 text-white py-3.5 uppercase font-black text-base flex items-center justify-center gap-2 border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all"
                            >
                              Complete Infrastructure Audit
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                <div className="lg:col-span-5 toy-panel bg-orange-50 border-4 border-black rounded-[32px] p-6 shadow-[6px_6px_0px_#000000]">
                  <div className="toy-screen p-4 justify-between bg-[#020617] border-4 border-black rounded-2xl shadow-inner">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-orange-600 mb-1">
                        <Info size={20} className="stroke-[3]" />
                        <span className="text-sm font-black uppercase tracking-wider text-orange-700">WAF Rule Post-Mortem</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-200">The July 2019 Outage</h3>
                      <p className="text-base text-slate-700 font-bold leading-relaxed">
                        A routine Web Application Firewall (WAF) rule change to detect XSS contained nested loops causing the regex engine to fall into exponential backtracking.
                      </p>
                    </div>

                    <div className="bg-amber-100 p-4 border-4 border-black rounded-2xl mt-4">
                      <p className="text-sm text-slate-800 font-bold leading-relaxed">
                        <strong className="text-orange-700 uppercase block mb-1 text-base">Critical Infrastructure Rollout</strong>
                        Critical global proxy networks require canary rollouts and automated health rollbacks to prevent single rule updates from taking down major internet services globally.
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
