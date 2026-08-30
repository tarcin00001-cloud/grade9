"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  ShoppingCart,
  Heart,
  Lock,
  Database,
  Server,
  Play,
  Subtitles,
  Share2,
  Zap,
  Wifi,
  Volume2,
  Cable,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Users,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight, ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Info,
  DollarSign,
  Activity,
  Sliders
} from "lucide-react";

type MissionId = "ecommerce" | "streaming" | "superapp";
type RequirementType = "functional" | "non-functional" | "solution" | "vague";

interface RequirementModule {
  id: string;
  name: string;
  type: RequirementType;
  cost: number;
  iconName: string;
  desc: string;
  impact: string;
}

const ALL_MODULES: Record<string, RequirementModule> = {
  // Stage 1 (E-Commerce)
  f_cart: { id: "f_cart", name: "Shopping Cart", type: "functional", cost: 1000, iconName: "ShoppingCart", desc: "Allows users to add and purchase items", impact: "Enables Checkout Flow" },
  f_wishlist: { id: "f_wishlist", name: "Wishlist Vault", type: "functional", cost: 800, iconName: "Heart", desc: "Allows users to save favorite items", impact: "Enables User Saved Items" },
  nf_crypto: { id: "nf_crypto", name: "Bank-Grade Security", type: "non-functional", cost: 1200, iconName: "Lock", desc: "Scrambles passwords so hackers can't read them", impact: "Protects Against Data Theft" },
  nf_backup: { id: "nf_backup", name: "Cloud Backup", type: "non-functional", cost: 1000, iconName: "Database", desc: "Saves everything safely so nothing gets deleted", impact: "Guarantees Transaction Storage" },
  sol_server: { id: "sol_server", name: "Buy a Metal Server", type: "solution", cost: 1500, iconName: "Server", desc: "Trap! We are writing software, not buying hardware yet.", impact: "Hardware Trap - Not a Requirement" },
  vague_secure: { id: "vague_secure", name: "Make It Safe", type: "vague", cost: 800, iconName: "Lock", desc: "Trap! This is a vague wish. Programmers need exact rules.", impact: "Unmeasurable Specification" },

  // Stage 2 (Streaming)
  f_video: { id: "f_video", name: "4K Video Engine", type: "functional", cost: 1500, iconName: "Play", desc: "Streams 4K video frames on player", impact: "Enables High-Res Playback" },
  f_subtitles: { id: "f_subtitles", name: "Live Captions", type: "functional", cost: 500, iconName: "Subtitles", desc: "Multi-language synchronized subtitles", impact: "Enables Subtitles and Accessibility" },
  f_share: { id: "f_share", name: "Clip Sharing", type: "functional", cost: 800, iconName: "Share2", desc: "Social link generation for clips", impact: "Enables Social Distribution" },
  nf_latency: { id: "nf_latency", name: "Lightning Fast", type: "non-functional", cost: 1500, iconName: "Zap", desc: "The app reacts instantly as soon as you tap", impact: "Stops Playback Lag" },
  nf_buffer: { id: "nf_buffer", name: "Smooth Streaming CDN", type: "non-functional", cost: 1200, iconName: "Wifi", desc: "High-bandwidth edge delivery network", impact: "Eliminates Video Freezing" },
  nf_audio: { id: "nf_audio", name: "Spatial Audio", type: "non-functional", cost: 1000, iconName: "Volume2", desc: "Surround sound acoustic encoding", impact: "Delivers Cinematic Audio" },
  sol_cdn: { id: "sol_cdn", name: "Fiber Optic Lines", type: "solution", cost: 2000, iconName: "Cable", desc: "Physical cables (solution trap)", impact: "Hardware Trap - Not a Requirement" },
  vague_fast: { id: "vague_fast", name: "Make It Super Fast", type: "vague", cost: 500, iconName: "Zap", desc: "Vague speed demand with no metric", impact: "Unmeasurable Specification" },

  // Stage 3 (Super-App)
  f_maps: { id: "f_maps", name: "GPS Navigation", type: "functional", cost: 1800, iconName: "MapPin", desc: "Turn-by-turn routing and geolocation", impact: "Enables Live Map Services" },
  f_chat: { id: "f_chat", name: "Real-Time Chat", type: "functional", cost: 1200, iconName: "MessageSquare", desc: "Instant peer-to-peer message protocol", impact: "Enables Community Messaging" },
  nf_uptime: { id: "nf_uptime", name: "99.99% High Uptime", type: "non-functional", cost: 2000, iconName: "ShieldCheck", desc: "Self-healing distributed cluster", impact: "Guarantees 24/7 Availability" },
  nf_scale: { id: "nf_scale", name: "10,000 Users Scale", type: "non-functional", cost: 1500, iconName: "Users", desc: "High concurrency load balancing", impact: "Prevents Crash Under Traffic Spikes" },
  sol_edge: { id: "sol_edge", name: "Edge Micro-Node", type: "solution", cost: 2500, iconName: "Cpu", desc: "Physical micro-hardware (solution trap)", impact: "Hardware Trap - Not a Requirement" },
  vague_scale: { id: "vague_scale", name: "Support Everyone", type: "vague", cost: 1000, iconName: "Layers", desc: "Vague scale claim with zero concrete numbers", impact: "Unmeasurable Specification" }
};

interface MissionConfig {
  title: string;
  modules: string[];
  requiredF: string[];
  requiredNF: string[];
  budget: number;
  socketsF: number;
  socketsNF: number;
  objective: string;
  appTitle: string;
}

const MISSIONS: Record<MissionId, MissionConfig> = {
  ecommerce: {
    title: "1. Storefront",
    modules: ["f_cart", "f_wishlist", "nf_crypto", "nf_backup", "sol_server", "vague_secure"],
    requiredF: ["f_cart", "f_wishlist"],
    requiredNF: ["nf_crypto", "nf_backup"],
    budget: 4300,
    socketsF: 2,
    socketsNF: 2,
    objective: "Build an online storefront. Customers must buy items and save favorites. The system must encrypt payments and guarantee zero data loss.",
    appTitle: "SwiftStore Shop"
  },
  streaming: {
    title: "2. 4K Streaming",
    modules: ["f_video", "f_subtitles", "f_share", "nf_latency", "nf_buffer", "nf_audio", "sol_cdn", "vague_fast"],
    requiredF: ["f_video", "f_subtitles", "f_share"],
    requiredNF: ["nf_latency", "nf_buffer", "nf_audio"],
    budget: 6800,
    socketsF: 3,
    socketsNF: 3,
    objective: "Deploy a 4K movie app. Users need high-res playback, live captions, and clip sharing. The system must deliver under 50ms latency, zero buffering, and spatial sound.",
    appTitle: "StreamMax 4K"
  },
  superapp: {
    title: "3. Super-App",
    modules: ["f_cart", "f_video", "f_maps", "f_chat", "nf_crypto", "nf_latency", "nf_uptime", "nf_scale", "sol_edge", "vague_scale"],
    requiredF: ["f_cart", "f_video", "f_maps", "f_chat"],
    requiredNF: ["nf_crypto", "nf_latency", "nf_uptime", "nf_scale"],
    budget: 12000,
    socketsF: 4,
    socketsNF: 4,
    objective: "Architect a global super-app combining shopping, video, maps, and chat. The platform must be encrypted, fast, available 24/7, and handle 10,000 concurrent users.",
    appTitle: "OmniPlatform OS"
  }
};

export default function RequirementAnalysis9() {
  const { playPop, playSuccess, playError, playZap, playChime } = useLabAudio();
  const { reportComplete } = useLMSBridge("requirementanalysis9");

  const [activeMission, setActiveMission] = useState<MissionId>("ecommerce");
  
  // Placements: key = module id, value = "tray" | "functional" | "non-functional"
  const [placements, setPlacements] = useState<Record<string, "tray" | "functional" | "non-functional">>({});
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Simulation status: idle | testing | success | error
  const [simStatus, setSimStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<string>("");
  const [diagnosticReason, setDiagnosticReason] = useState<string>("");

  const [completedMissions, setCompletedMissions] = useState<Record<MissionId, boolean>>({
    ecommerce: false,
    streaming: false,
    superapp: false
  });

  const [hasWon, setHasWon] = useState<boolean>(false);
  const testTimer = useRef<NodeJS.Timeout | null>(null);
  const winTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (testTimer.current) clearTimeout(testTimer.current);
      if (winTimer.current) clearTimeout(winTimer.current);
    };
  }, []);

  // Reset placements when mission switches
  useEffect(() => {
    const initialPlacements: Record<string, "tray" | "functional" | "non-functional"> = {};
    MISSIONS[activeMission].modules.forEach((id) => {
      initialPlacements[id] = "tray";
    });
    setPlacements(initialPlacements);
    setSelectedModule(null);
    setSimStatus("idle");
    setDiagnosticFeedback("");
    setDiagnosticReason("");
  }, [activeMission]);

  // Calculate live budget
  const currentCost = Object.entries(placements).reduce((acc, [id, loc]) => {
    if (loc !== "tray" && ALL_MODULES[id]) {
      return acc + ALL_MODULES[id].cost;
    }
    return acc;
  }, 0);

  const budgetRemaining = MISSIONS[activeMission].budget - currentCost;
  const isBudgetExceeded = currentCost > MISSIONS[activeMission].budget;

  // Render Icon helper
  const renderIcon = (name: string, size = 18, className = "") => {
    switch (name) {
      case "ShoppingCart": return <ShoppingCart size={size} className={className} />;
      case "Heart": return <Heart size={size} className={className} />;
      case "Lock": return <Lock size={size} className={className} />;
      case "Database": return <Database size={size} className={className} />;
      case "Server": return <Server size={size} className={className} />;
      case "Play": return <Play size={size} className={className} />;
      case "Subtitles": return <Subtitles size={size} className={className} />;
      case "Share2": return <Share2 size={size} className={className} />;
      case "Zap": return <Zap size={size} className={className} />;
      case "Wifi": return <Wifi size={size} className={className} />;
      case "Volume2": return <Volume2 size={size} className={className} />;
      case "Cable": return <Cable size={size} className={className} />;
      case "MapPin": return <MapPin size={size} className={className} />;
      case "MessageSquare": return <MessageSquare size={size} className={className} />;
      case "ShieldCheck": return <ShieldCheck size={size} className={className} />;
      case "Users": return <Users size={size} className={className} />;
      case "Cpu": return <Cpu size={size} className={className} />;
      case "Layers": return <Layers size={size} className={className} />;
      default: return <Sparkles size={size} className={className} />;
    }
  };

  // Move item to destination slot
  const handleSlotModule = (id: string, target: "functional" | "non-functional" | "tray") => {
    const mod = ALL_MODULES[id];
    if (!mod) return;

    const currentFCount = Object.values(placements).filter((v) => v === "functional").length;
    const currentNFCount = Object.values(placements).filter((v) => v === "non-functional").length;
    const config = MISSIONS[activeMission];

    if (target === "functional") {
      if (placements[id] !== "functional" && currentFCount >= config.socketsF) {
        playError();
        setDiagnosticFeedback("Functional Bay is Full");
        setDiagnosticReason("Remove an existing feature blueprint first.");
        return;
      }
      playPop();
      setPlacements((prev) => ({ ...prev, [id]: "functional" }));
      setSelectedModule(null);
    } else if (target === "non-functional") {
      if (placements[id] !== "non-functional" && currentNFCount >= config.socketsNF) {
        playError();
        setDiagnosticFeedback("Quality Bay is Full");
        setDiagnosticReason("Remove an existing quality gauge first.");
        return;
      }
      playPop();
      setPlacements((prev) => ({ ...prev, [id]: "non-functional" }));
      setSelectedModule(null);
    } else {
      playPop();
      setPlacements((prev) => ({ ...prev, [id]: "tray" }));
      setSelectedModule(null);
    }

    setSimStatus("idle");
  };

  // Run the architecture stress test
  const handleRunStressTest = () => {
    const config = MISSIONS[activeMission];

    // Check budget
    if (currentCost > config.budget) {
      playError();
      setSimStatus("error");
      setDiagnosticFeedback("Budget Exceeded!");
      setDiagnosticReason("Total cost exceeds your allotted budget. Balance your requirements.");
      return;
    }

    // Check for premature solution traps
    const slottedSolutions = Object.entries(placements).filter(([id, loc]) => loc !== "tray" && ALL_MODULES[id].type === "solution");
    if (slottedSolutions.length > 0) {
      playZap();
      setSimStatus("error");
      const trapName = ALL_MODULES[slottedSolutions[0][0]].name;
      setDiagnosticFeedback(`Solution Trap: "${trapName}"`);
      setDiagnosticReason("Requirements specify WHAT the system needs to accomplish, not specific physical hardware. Replace this with a goal specification.");
      return;
    }

    // Check for vague unmeasurable goals
    const slottedVague = Object.entries(placements).filter(([id, loc]) => loc !== "tray" && ALL_MODULES[id].type === "vague");
    if (slottedVague.length > 0) {
      playZap();
      setSimStatus("error");
      const vagueName = ALL_MODULES[slottedVague[0][0]].name;
      setDiagnosticFeedback(`Unmeasurable Goal: "${vagueName}"`);
      setDiagnosticReason("Requirements must be testable and measurable. Replace vague wishes with concrete metrics (e.g. latency numbers or encryption standards).");
      return;
    }

    // Check category placement correctness
    const misplacedFunctional = Object.entries(placements).filter(([id, loc]) => loc === "non-functional" && ALL_MODULES[id].type === "functional");
    if (misplacedFunctional.length > 0) {
      playError();
      setSimStatus("error");
      const name = ALL_MODULES[misplacedFunctional[0][0]].name;
      setDiagnosticFeedback(`Misplaced Feature: "${name}"`);
      setDiagnosticReason(`"${name}" is a user-facing feature (Functional Requirement), not a performance Quality Gauge.`);
      return;
    }

    const misplacedNonFunctional = Object.entries(placements).filter(([id, loc]) => loc === "functional" && ALL_MODULES[id].type === "non-functional");
    if (misplacedNonFunctional.length > 0) {
      playError();
      setSimStatus("error");
      const name = ALL_MODULES[misplacedNonFunctional[0][0]].name;
      setDiagnosticFeedback(`Misplaced Quality Gauge: "${name}"`);
      setDiagnosticReason(`"${name}" is a performance metric (Non-Functional Requirement), not a functional user feature.`);
      return;
    }

    // Check for missing required features
    const missingF = config.requiredF.filter((id) => placements[id] !== "functional");
    if (missingF.length > 0) {
      playError();
      setSimStatus("error");
      const missingName = ALL_MODULES[missingF[0]].name;
      setDiagnosticFeedback(`Missing User Feature: "${missingName}"`);
      setDiagnosticReason(`The stakeholder objective requires "${missingName}" to be functional for users.`);
      return;
    }

    const missingNF = config.requiredNF.filter((id) => placements[id] !== "non-functional");
    if (missingNF.length > 0) {
      playError();
      setSimStatus("error");
      const missingName = ALL_MODULES[missingNF[0]].name;
      setDiagnosticFeedback(`Missing Quality Gauge: "${missingName}"`);
      setDiagnosticReason(`The system is vulnerable without "${missingName}". Equip it to protect performance.`);
      return;
    }

    // Success!
    setSimStatus("testing");
    playChime();

    testTimer.current = setTimeout(() => {
      setSimStatus("success");
      playSuccess();
      setDiagnosticFeedback("Architecture Verified & Certified!");
      setDiagnosticReason("All functional user features and non-functional quality constraints passed production load tests within budget!");

      setCompletedMissions((prev) => {
        const next = { ...prev, [activeMission]: true };
        if (next.ecommerce && next.streaming && next.superapp && !hasWon) {
          winTimer.current = setTimeout(() => {
            setHasWon(true);
            reportComplete();
            playChime();
          }, 3000);
        }
        return next;
      });
    }, 1500);
  };

  const handleReset = () => {
    if (testTimer.current) clearTimeout(testTimer.current);
    if (winTimer.current) clearTimeout(winTimer.current);
    setActiveMission("ecommerce");
    const initialPlacements: Record<string, "tray" | "functional" | "non-functional"> = {};
    MISSIONS.ecommerce.modules.forEach((id) => {
      initialPlacements[id] = "tray";
    });
    setPlacements(initialPlacements);
    setSelectedModule(null);
    setSimStatus("idle");
    setDiagnosticFeedback("");
    setDiagnosticReason("");
    setCompletedMissions({ ecommerce: false, streaming: false, superapp: false });
    setHasWon(false);
    playPop();
  };

  const slottedF = Object.entries(placements).filter(([_, loc]) => loc === "functional").map(([id]) => id);
  const slottedNF = Object.entries(placements).filter(([_, loc]) => loc === "non-functional").map(([id]) => id);
  const trayModules = MISSIONS[activeMission].modules.filter((id) => placements[id] === "tray" || !placements[id]);

  return (
    <LabShell
      labId="requirementanalysis9"
      title="Requirements Analysis Studio"
            hint="1. Functional Blueprints: What the system does (Shopping Cart, Video Engine). 2. Quality Gauges: How well it performs (Encryption, <50ms Latency). 3. Avoid premature hardware traps and vague unmeasurable goals!"
      theme="ocean"
      compact={true}
      instruction="1. Select feature blueprints for user capabilities. 2. Slot measurable quality gauges for security & speed. 3. Avoid hardware traps and stay within budget to deploy the app."
      onReset={handleReset}
    >
      <Celebration
        isActive={hasWon}
        message="Master Software Architect Certified! You mastered Requirements Analysis by distinguishing Functional features from measurable Non-Functional constraints."
        onReplay={handleReset}
      />

      {/* Blueprint Architecture Theme */}
      <div className="flex-1 min-h-0 w-full flex flex-col relative z-10 select-none overflow-hidden  p-2 sm:p-4 gap-4">
        
        {/* Top Mission Header & Budget Strip */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] gap-4">
          
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-12 rounded-xl bg-indigo-600 border border-indigo-400 text-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] shrink-0">
              <Layers size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[12px] sm:text-[14px] font-semibold text-slate-900 leading-snug">
                {MISSIONS[activeMission].objective}
              </h2>
              <span className="text-[11px] text-slate-600 font-semibold tracking-wider uppercase mt-1 block">
                Target Platform: <b className="text-cyan-400">{MISSIONS[activeMission].appTitle}</b>
              </span>
            </div>
          </div>

          {/* Mission Switcher Tabs + Budget Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-300 gap-1">
              {(["ecommerce", "streaming", "superapp"] as MissionId[]).map((mId) => (
                <button
                  key={mId}
                  onClick={() => {
                    if (mId !== activeMission) {
                      playPop();
                      setActiveMission(mId);
                    }
                  }}
                  className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeMission === mId
                      ? "text-slate-900 bg-slate-200 shadow-md"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {MISSIONS[mId].title.split(". ")[1]}
                  {completedMissions[mId] && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" />
                  )}
                </button>
              ))}
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-mono text-[11px] font-black ${
              isBudgetExceeded
                ? "bg-rose-950/50 text-rose-400 border-rose-500/50"
                : budgetRemaining < 1000
                ? "bg-amber-950/50 text-amber-400 border-amber-500/50"
                : "bg-emerald-950/50 text-emerald-400 border-emerald-500/50"
            }`}>
              <span>$ {currentCost.toLocaleString()}</span>
              <span className="text-slate-600 font-normal">/</span>
              <span>$ {MISSIONS[activeMission].budget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-3 min-h-0">
          
          {/* Left Bay: Sockets & Tray */}
          <div className={`flex-1 flex flex-col gap-4 min-w-0 min-h-0 ${simStatus !== "idle" ? "hidden lg:flex" : "flex"}`}>
            
            {/* Assembly Bays */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              
              {/* Functional Sockets */}
              <div 
                onClick={() => selectedModule && handleSlotModule(selectedModule, "functional")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (selectedModule) handleSlotModule(selectedModule, "functional");
                  }
                }}
                className={`flex-1 bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-3 flex flex-col transition-colors cursor-pointer ${
                selectedModule && ALL_MODULES[selectedModule].type === "functional" 
                  ? "border-cyan-500 motion-safe:animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                  : selectedModule 
                  ? "border-cyan-800/80 bg-cyan-950/20 opacity-50"
                  : "border-cyan-900/50 bg-cyan-950/10"
              }`}>
                <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-slate-300">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <ShoppingCart size={14} />
                    <span className="text-xs font-bold uppercase tracking-[0.15em]">App Features (What it does)</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                    {slottedF.length} / {MISSIONS[activeMission].socketsF}
                  </span>
                </div>
                
                <div className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-3 w-full">
                  {Array.from({ length: MISSIONS[activeMission].socketsF }).map((_, i) => {
                    const slottedId = slottedF[i];
                    return (
                      <div key={i} className={`flex-1 min-w-[45%] lg:min-w-0 h-12 rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all ${
                        slottedId 
                          ? "border-cyan-500 bg-cyan-950/30 border-solid" 
                          : "border-cyan-900/60 bg-white/50"
                      }`}>
                        {slottedId ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center cursor-pointer hover:bg-rose-950/30 hover:border-rose-500 group" onClick={(e) => { e.stopPropagation(); handleSlotModule(slottedId, "tray"); }}
                             tabIndex={0}
                             onKeyDown={(e) => {
                               if (e.key === "Enter" || e.key === " ") {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 handleSlotModule(slottedId, "tray");
                               }
                             }}>
                             <span className="text-cyan-400 mb-0.5">{renderIcon(ALL_MODULES[slottedId].iconName, 16)}</span>
                             <span className="text-[10px] font-bold text-slate-900 line-clamp-1 group-hover:hidden">{ALL_MODULES[slottedId].name}</span>
                             <span className="text-[9px] font-bold text-rose-400 hidden group-hover:block">REMOVE</span>
                          </div>
                        ) : (
                           <span className="text-[9px] sm:text-[10px] font-semibold text-cyan-700/60 uppercase tracking-widest text-center px-1">App Feature</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Non-Functional Sockets */}
              <div 
                onClick={() => selectedModule && handleSlotModule(selectedModule, "non-functional")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (selectedModule) handleSlotModule(selectedModule, "non-functional");
                  }
                }}
                className={`flex-1 bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-3 flex flex-col transition-colors cursor-pointer ${
                selectedModule && ALL_MODULES[selectedModule].type === "non-functional" 
                  ? "border-emerald-500 motion-safe:animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                  : selectedModule 
                  ? "border-emerald-800/80 bg-emerald-950/20 opacity-50"
                  : "border-emerald-900/50 bg-emerald-950/10"
              }`}>
                <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck size={14} />
                    <span className="text-xs font-bold uppercase tracking-[0.15em]">Performance Goals (How well it runs)</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                    {slottedNF.length} / {MISSIONS[activeMission].socketsNF}
                  </span>
                </div>
                
                <div className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-3 w-full">
                  {Array.from({ length: MISSIONS[activeMission].socketsNF }).map((_, i) => {
                    const slottedId = slottedNF[i];
                    return (
                      <div key={i} className={`flex-1 min-w-[45%] lg:min-w-0 h-12 rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all ${
                        slottedId 
                          ? "border-emerald-500 bg-emerald-950/30 border-solid" 
                          : "border-emerald-900/60 bg-white/50"
                      }`}>
                        {slottedId ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center cursor-pointer hover:bg-rose-950/30 hover:border-rose-500 group" onClick={(e) => { e.stopPropagation(); handleSlotModule(slottedId, "tray"); }}
                             tabIndex={0}
                             onKeyDown={(e) => {
                               if (e.key === "Enter" || e.key === " ") {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 handleSlotModule(slottedId, "tray");
                               }
                             }}>
                             <span className="text-emerald-400 mb-0.5">{renderIcon(ALL_MODULES[slottedId].iconName, 16)}</span>
                             <span className="text-[10px] font-bold text-slate-900 line-clamp-1 group-hover:hidden">{ALL_MODULES[slottedId].name}</span>
                             <span className="text-[9px] font-bold text-rose-400 hidden group-hover:block">REMOVE</span>
                          </div>
                        ) : (
                           <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700/60 uppercase tracking-widest text-center px-1">Performance Goal</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
            </div>

            {/* Component Tray */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 shadow-md flex flex-col min-h-0 overflow-hidden">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-3 shrink-0">
                Blueprint Repository ({trayModules.length} Available)
              </span>
              
              <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-2 pr-1 content-start">
                {trayModules.map((id) => {
                  const mod = ALL_MODULES[id];
                  const isSelected = selectedModule === id;
                  
                  // Style logic based on type
                  let colorClasses = "border-slate-300 hover:border-slate-500 text-slate-700 border-t-4 " + (mod.type === "functional" ? "border-t-cyan-500/50" : mod.type === "non-functional" ? "border-t-emerald-500/50" : "border-t-rose-500/50");
                  if (isSelected) colorClasses = "border-amber-400 border-t-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] text-slate-900";

                  return (
                    <div
                      key={id}
                      onClick={() => {
                        playPop();
                        setSelectedModule(isSelected ? null : id);
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          playPop();
                          setSelectedModule(isSelected ? null : id);
                        }
                      }}
                      className={`bg-white border-2 rounded-xl p-3 cursor-pointer flex flex-col transition-all ${colorClasses} hover:bg-slate-50 @media(hover:hover):hover:shadow-lg @media(hover:hover):hover:-translate-y-0.5 active:scale-95 group`}
                    >
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`shrink-0 ${isSelected ? "text-amber-400" : "text-slate-500"}`}>
                            {renderIcon(mod.iconName, 14)}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 truncate leading-tight">{mod.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-600 shrink-0">${mod.cost}</span>
                      </div>

                      <p className="text-[10px] text-slate-700 leading-tight line-clamp-2 mb-2 flex-1">
                        {mod.desc}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-300">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 ${
                           mod.type === "functional" ? "text-cyan-500" : mod.type === "non-functional" ? "text-emerald-500" : "text-rose-500" 
                        }`}>
                           {mod.type === "functional" ? "Feature" : mod.type === "non-functional" ? "Quality" : mod.type === "solution" ? "Hardware?" : "Vague?"}
                        </span>
                        
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-amber-400 motion-safe:animate-pulse" : "text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200"}`}>
                          {isSelected ? "TAP BAY TO SLOT" : "SELECT"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          
            {/* Mobile Run Button */}
            <div className="lg:hidden shrink-0 mt-2">
              <button
                onClick={() => {
                  if (simStatus === "success") {
                    playPop();
                    if (!completedMissions.ecommerce) setActiveMission("ecommerce");
                    else if (!completedMissions.streaming) setActiveMission("streaming");
                    else if (!completedMissions.superapp) setActiveMission("superapp");
                  } else {
                    handleRunStressTest();
                  }
                }}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
                  isBudgetExceeded
                    ? "bg-rose-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-slate-900"
                }`}
              >
                <Zap size={16} /> Engage Stress Test
              </button>
            </div>
          </div>

          {/* Right Bay: Live Smartphone Simulator & Stress Test Controller */}
          <div className={`w-full lg:w-72 xl:w-80 bg-slate-50 rounded-3xl border border-slate-200 shadow-xl flex-col justify-between p-3 shrink-0 ${simStatus === "idle" ? "hidden lg:flex" : "flex"}`}>
            
            {/* Header */}
            <div className="border-b border-slate-300 pb-2 mb-2 shrink-0 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-[0.15em]">
                  Live Simulator
                </h3>
              </div>
              <div className={`w-2 h-2 rounded-full ${simStatus === "success" ? "bg-emerald-500 motion-safe:animate-pulse shadow-[0_0_10px_#10b981]" : simStatus === "error" ? "bg-rose-500" : "bg-slate-600"}`} />
            </div>

            {/* Simulated Smartphone Screen */}
            <div className={`my-auto bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-black rounded-[1.5rem] p-3 border-[6px] border-slate-300 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden shadow-inner text-slate-900 flex flex-col justify-between min-h-[260px] relative overflow-hidden transition-all ${
              simStatus === "error" ? "border-rose-900 bg-rose-950/20" : simStatus === "success" ? "border-emerald-900 bg-emerald-950/20" : "border-slate-300"
            }`}>
              
              {/* iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-20"><div className="w-24 h-full bg-slate-200 rounded-b-xl shadow-sm"></div></div>

              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pb-2 shrink-0 z-10">
                <span>9:41</span>
                <span className="truncate max-w-[100px]">{MISSIONS[activeMission].appTitle}</span>
                <span className="flex items-center gap-1"><Wifi size={10}/> 5G</span>
              </div>

              {/* Screen Content reacting live */}
              <div className="my-2 flex-1 flex flex-col justify-center items-center text-center gap-3 z-10">
                {simStatus === "testing" ? (
                  <div className="flex flex-col items-center gap-3 motion-safe:animate-pulse">
                    <Activity size={36} className="text-indigo-500 motion-safe:animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Compiling...</span>
                  </div>
                ) : simStatus === "success" ? (
                  <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <ShieldCheck size={32} />
                    </div>
                    <span className="text-[14px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Deployed</span>
                    <span className="text-[10px] text-emerald-200/70 max-w-[180px] leading-tight">
                      All specs met! $ {budgetRemaining.toLocaleString()} under budget.
                    </span>
                  </div>
                ) : simStatus === "error" ? (
                  <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                      <AlertTriangle size={32} />
                    </div>
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest mt-1">Crash Report</span>
                    <span className="text-[9px] text-rose-200/80 max-w-[180px] leading-relaxed bg-rose-950/50 p-2 rounded-lg border border-rose-900/50">
                      {diagnosticFeedback}: {diagnosticReason}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-3 w-full">
                      {slottedF.map((id) => (
                        <div key={id} className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[9px] font-bold text-cyan-300 flex items-center justify-center gap-1.5 truncate">
                          {renderIcon(ALL_MODULES[id].iconName, 12, "shrink-0")}
                          <span className="truncate">{ALL_MODULES[id].name}</span>
                        </div>
                      ))}
                      {slottedNF.map((id) => (
                        <div key={id} className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[9px] font-bold text-emerald-300 flex items-center justify-center gap-1.5 truncate">
                          {renderIcon(ALL_MODULES[id].iconName, 12, "shrink-0")}
                          <span className="truncate">{ALL_MODULES[id].name}</span>
                        </div>
                      ))}
                    </div>
                    {slottedF.length === 0 && slottedNF.length === 0 && (
                      <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-widest mt-4">
                        Awaiting Architecture
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="shrink-0 mt-3">
              <button
                onClick={() => {
                  if (simStatus === "success") {
                    playPop();
                    if (!completedMissions.ecommerce) setActiveMission("ecommerce");
                    else if (!completedMissions.streaming) setActiveMission("streaming");
                    else if (!completedMissions.superapp) setActiveMission("superapp");
                  } else {
                    handleRunStressTest();
                  }
                }}
                disabled={simStatus === "testing"}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer transition-all border-b-4 active:border-b-0 active:translate-y-1 text-white ${
                  simStatus === "success"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-slate-900 border-emerald-800"
                    : isBudgetExceeded
                    ? "bg-rose-600 hover:bg-rose-500 text-slate-900 border-rose-800"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:from-indigo-400 hover:to-purple-500 text-white border-indigo-200 shadow-lg shadow-indigo-500/25"
                }`}
              >
                {simStatus === "testing" ? (
                  <><Activity size={16} className="motion-safe:animate-spin" /> Verifying...</>
                ) : simStatus === "success" ? (
                  <>Next Stage <ArrowRight size={16} /></>
                ) : (
                  <><Zap size={16} /> Engage Stress Test</>
                )}
              </button>
            </div>
            {/* Mobile Back Button */}
            <div className="lg:hidden shrink-0 mt-3 border-t border-slate-300 pt-3">
              <button
                onClick={() => {
                  setSimStatus("idle");
                  setDiagnosticFeedback("");
                  setDiagnosticReason("");
                  playPop();
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-200 flex items-center justify-center gap-2 active:scale-95"
              >
                <ArrowLeft size={16} /> Back to Architecture
              </button>
            </div>

          </div>

        </div>

      </div>
    </LabShell>
  );
}
