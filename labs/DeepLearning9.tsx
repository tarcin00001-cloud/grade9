"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  BrainCircuit,
  Play,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Info,
  Target
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ShapeId = "circle" | "triangle" | "square" | "star" | "cross" | "pentagon";
type BlockId = "mini-triangle" | "arc" | "straight-line" | "right-angle" | "dot";

// ─── SHAPE DATA ───────────────────────────────────────────────────────────────

interface ShapeData {
  id: ShapeId;
  name: string;
  color: string;
  nearestReason: string;
}

const SHAPES: ShapeData[] = [
  { id: "circle",   name: "Circle",   color: "#38bdf8", nearestReason: "Circles share rounded, smooth curves with Pentagons." },
  { id: "triangle", name: "Triangle", color: "#34d399", nearestReason: "Triangles share sharp pointy angles with Stars." },
  { id: "square",   name: "Square",   color: "#a78bfa", nearestReason: "Squares share right-angle straight lines with Crosses." },
  { id: "star",     name: "Star",     color: "#fbbf24", nearestReason: "A Star is 5 small Triangles arranged around a center." },
  { id: "cross",    name: "Cross",    color: "#fb923c", nearestReason: "Crosses share perpendicular straight bars with Squares." },
  { id: "pentagon", name: "Pentagon", color: "#f472b6", nearestReason: "Pentagons share angled corner joints with Triangles." },
];

// Nearest-neighbor similarity matrix (0 to 1)
const SIMILARITY: Record<ShapeId, Partial<Record<ShapeId, number>>> = {
  circle:   { pentagon: 0.40, square: 0.20, star: 0.18, triangle: 0.15, cross: 0.10 },
  triangle: { star: 0.75, pentagon: 0.60, square: 0.35, cross: 0.30, circle: 0.15 },
  square:   { cross: 0.70, pentagon: 0.45, triangle: 0.35, star: 0.25, circle: 0.20 },
  star:     { triangle: 0.75, pentagon: 0.55, cross: 0.30, square: 0.25, circle: 0.20 },
  cross:    { square: 0.70, triangle: 0.30, star: 0.30, pentagon: 0.30, circle: 0.10 },
  pentagon: { triangle: 0.60, square: 0.45, star: 0.55, circle: 0.40, cross: 0.30 },
};

// ─── FEATURE BLOCK DATA ───────────────────────────────────────────────────────

interface FeatureBlock { id: BlockId; name: string; color: string; }

const FEATURE_BLOCKS: FeatureBlock[] = [
  { id: "mini-triangle",  name: "Mini Triangle",  color: "#fbbf24" },
  { id: "arc",            name: "Curve Arc",       color: "#38bdf8" },
  { id: "straight-line",  name: "Straight Line",   color: "#34d399" },
  { id: "right-angle",    name: "Right Angle",     color: "#a78bfa" },
  { id: "dot",            name: "Center Dot",      color: "#fb923c" },
];

// Blocks required (in order) to assemble each shape
const SHAPE_RECIPE: Record<ShapeId, BlockId[]> = {
  circle:   ["arc", "arc", "arc", "arc"],
  triangle: ["straight-line", "straight-line", "straight-line"],
  square:   ["right-angle", "right-angle", "right-angle", "right-angle"],
  star:     ["mini-triangle", "mini-triangle", "mini-triangle", "mini-triangle", "mini-triangle"],
  cross:    ["straight-line", "straight-line"],
  pentagon: ["straight-line", "straight-line", "straight-line", "straight-line", "straight-line"],
};

const RECIPE_EXPLANATION: Record<ShapeId, string> = {
  circle:   "4 curved arcs join end-to-end to form a perfect circle!",
  triangle: "3 straight lines meet at 3 sharp corner points!",
  square:   "4 right-angle corners lock together into a square!",
  star:     "5 mini triangles arranged around a shared center point form a star!",
  cross:    "2 straight bars crossing at right angles form a cross!",
  pentagon: "5 equal straight sides meeting at 5 angled corners form a pentagon!",
};

// ─── SVG HELPER COMPONENTS ────────────────────────────────────────────────────

const ShapeSVG = ({ id, color, size = 80, filled = false }: { id: ShapeId; color: string; size?: number; filled?: boolean }) => {
  const fill = filled ? color + "28" : "none";
  const sw = 8;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {id === "circle"   && <circle cx="50" cy="50" r="40" fill={fill} stroke={color} strokeWidth={sw} />}
      {id === "triangle" && <polygon points="50,12 88,82 12,82" fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />}
      {id === "square"   && <rect x="15" y="15" width="70" height="70" fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />}
      {id === "star"     && <polygon points="50,10 61,35 90,35 68,57 78,84 50,66 22,84 32,57 10,35 39,35" fill={fill} stroke={color} strokeWidth={6} strokeLinejoin="round" />}
      {id === "cross"    && <g fill={color} opacity={filled ? 0.8 : 1}><rect x="38" y="10" width="24" height="80" rx="5" /><rect x="10" y="38" width="80" height="24" rx="5" /></g>}
      {id === "pentagon" && <polygon points="50,10 90,38 75,82 25,82 10,38" fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />}
    </svg>
  );
};

const BlockSVG = ({ id, color, size = 36 }: { id: BlockId; color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    {id === "mini-triangle"  && <polygon points="30,8 55,50 5,50" fill="none" stroke={color} strokeWidth={7} strokeLinejoin="round" />}
    {id === "arc"            && <path d="M 5 55 Q 30 5 55 55" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />}
    {id === "straight-line"  && <line x1="5" y1="30" x2="55" y2="30" stroke={color} strokeWidth={7} strokeLinecap="round" />}
    {id === "right-angle"    && <polyline points="5,5 5,55 55,55" fill="none" stroke={color} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />}
    {id === "dot"            && <circle cx="30" cy="30" r="12" fill={color} />}
  </svg>
);

// ─── MINI NEURAL NET (for train + detect animations) ─────────────────────────

const LXMINI = [35, 120, 205];
const LNMINI = [3, 5, 3];

const yMini = (n: number) => {
  const h = 88, pad = 12;
  if (n === 1) return [h / 2];
  const step = (h - pad * 2) / (n - 1);
  return Array.from({ length: n }, (_, i) => pad + i * step);
};

interface MiniNetProps { activeLayer: number; shapeColor?: string; }
const MiniNet = ({ activeLayer, shapeColor = "#a78bfa" }: MiniNetProps) => (
  <svg viewBox="0 0 240 88" className="w-full h-full">
    {Array.from({ length: 2 }).map((_, l) => {
      const x1 = LXMINI[l], x2 = LXMINI[l + 1];
      const y1s = yMini(LNMINI[l]), y2s = yMini(LNMINI[l + 1]);
      const active = activeLayer > l;
      const pulsing = activeLayer === l + 1;
      return y1s.flatMap((y1, i) =>
        y2s.map((y2, j) => (
          <line key={`${l}-${i}-${j}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={active ? "rgba(56, 189, 248, 0.75)" : "rgba(255,255,255,0.06)"}
            strokeWidth={active ? 2 : 1}
            className={pulsing ? "pulse-line" : ""}
          />
        ))
      );
    })}
    {LNMINI.map((n, l) =>
      yMini(n).map((y, i) => {
        const active = activeLayer > l;
        return (
          <g key={`n${l}-${i}`}>
            {active && <circle cx={LXMINI[l]} cy={y} r={8} fill="none" stroke={shapeColor} strokeWidth={2} opacity={0.6} className="animate-ping" style={{ animationDuration: "1.2s" }} />}
            <circle cx={LXMINI[l]} cy={y} r={5.5} fill={active ? shapeColor : "#1e293b"} stroke="#0f172a" strokeWidth={2} />
          </g>
        );
      })
    )}
  </svg>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DeepLearning9() {
  const { reportComplete } = useLMSBridge("deeplearning9");
  const { playPop, playSuccess, playError, playZap } = useLabAudio();

  const [activeTab, setActiveTab] = useState<"train" | "detect" | "match">("train");

  // ── Tab 1: Train ────────────────────────────────────────────────────────────
  const [trainedShapes, setTrainedShapes] = useState<Set<ShapeId>>(new Set());
  const [trainingId,    setTrainingId]    = useState<ShapeId | null>(null);
  const [trainLayer,    setTrainLayer]    = useState(0);

  // ── Tab 2: Detect ───────────────────────────────────────────────────────────
  const [testShape,     setTestShape]     = useState<ShapeId | null>(null);
  const [detectState,   setDetectState]   = useState<"pick" | "scanning" | "result">("pick");
  const [detectLayer,   setDetectLayer]   = useState(0);
  const [detection,     setDetection]     = useState<{
    matched: boolean; topShape: ShapeId; scores: Partial<Record<ShapeId, number>>;
  } | null>(null);

  // ── Tab 3: Match ────────────────────────────────────────────────────────────
  const [matchShape,    setMatchShape]    = useState<ShapeId | null>(null);
  const [placedBlocks,  setPlacedBlocks]  = useState<BlockId[]>([]);
  const [matchDone,     setMatchDone]     = useState(false);

  // Global
  const [hasWon, setHasWon] = useState(false);

  // Progressive unlock flags
  const detectUnlocked = trainedShapes.size >= 2;
  const matchUnlocked  = detection !== null || hasWon;

  // ── Training animation loop ─────────────────────────────────────────────────
  useEffect(() => {
    if (!trainingId || trainLayer === 0) return;
    if (trainLayer <= 3) {
      const t = setTimeout(() => { playZap(); setTrainLayer(l => l + 1); }, 430);
      return () => clearTimeout(t);
    }
    // Animation finished
    setTrainedShapes(prev => new Set([...prev, trainingId as ShapeId]));
    playSuccess();
    setTrainingId(null);
    setTrainLayer(0);
  }, [trainingId, trainLayer, playZap, playSuccess]);

  // ── Detection scan animation loop ───────────────────────────────────────────
  useEffect(() => {
    if (detectState !== "scanning") return;
    if (detectLayer <= 3) {
      const t = setTimeout(() => { playZap(); setDetectLayer(l => l + 1); }, 400);
      return () => clearTimeout(t);
    }
    // Compute result
    if (!testShape) return;
    const trained = [...trainedShapes] as ShapeId[];
    const isKnown = trained.includes(testShape);
    const scores: Partial<Record<ShapeId, number>> = {};

    if (isKnown) {
      trained.forEach(s => {
        scores[s] = s === testShape
          ? Math.floor(82 + Math.random() * 15)
          : Math.floor((SIMILARITY[testShape]?.[s] ?? 0.1) * 35);
      });
    } else {
      // Find nearest trained shape
      let topShape: ShapeId = trained[0];
      let topSim = 0;
      trained.forEach(s => {
        const sim = SIMILARITY[testShape]?.[s] ?? 0.1;
        if (sim > topSim) { topSim = sim; topShape = s; }
      });
      trained.forEach(s => {
        const sim = SIMILARITY[testShape]?.[s] ?? 0.1;
        scores[s] = s === topShape ? Math.floor(topSim * 100) : Math.floor(sim * 35);
      });
    }

    const topShape = (Object.entries(scores) as [ShapeId, number][])
      .sort((a, b) => b[1] - a[1])[0][0] as ShapeId;

    setDetection({ matched: isKnown, topShape, scores });
    setDetectState("result");
    setMatchShape(testShape);
    isKnown ? playSuccess() : playPop();
  }, [detectState, detectLayer, testShape, trainedShapes, playZap, playSuccess, playPop]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const trainShape = (id: ShapeId) => {
    if (trainingId !== null || trainedShapes.has(id)) return;
    playPop();
    setTrainingId(id);
    setTrainLayer(1);
  };

  const runDetection = () => {
    if (!testShape) return;
    playZap();
    setDetection(null);
    setDetectState("scanning");
    setDetectLayer(1);
  };

  const resetDetect = () => {
    setTestShape(null);
    setDetectState("pick");
    setDetectLayer(0);
    setDetection(null);
    playPop();
  };

  const handleBlockClick = (bid: BlockId) => {
    if (!matchShape || matchDone) return;
    const recipe = SHAPE_RECIPE[matchShape];
    const needed  = recipe.filter(b => b === bid).length;
    const placed  = placedBlocks.filter(b => b === bid).length;

    if (placed >= needed) { playError(); return; }

    playZap();
    const next = [...placedBlocks, bid];
    setPlacedBlocks(next);

    // Check completion
    const countNeeded: Record<string, number> = {};
    recipe.forEach(b => { countNeeded[b] = (countNeeded[b] ?? 0) + 1; });
    const countPlaced: Record<string, number> = {};
    next.forEach(b  => { countPlaced[b] = (countPlaced[b] ?? 0) + 1; });
    const done = Object.entries(countNeeded).every(([b, n]) => (countPlaced[b] ?? 0) >= n);
    if (done) {
      playSuccess();
      setMatchDone(true);
      setTimeout(() => { setHasWon(true); reportComplete(); }, 1200);
    }
  };

  const resetAll = () => {
    setActiveTab("train");
    setTrainedShapes(new Set());
    setTrainingId(null); setTrainLayer(0);
    setTestShape(null); setDetectState("pick"); setDetectLayer(0); setDetection(null);
    setMatchShape(null); setPlacedBlocks([]); setMatchDone(false);
    setHasWon(false);
    playPop();
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <LabShell
      labId="deeplearning9" theme="neon"
      bgOverride="bg-retro-console"
      title="Deep Learning Brain Lab"
      instruction="1. Study the architecture of a basic neural network presented in the lab. 2. Adjust the weights and biases in the simulation to see their effects. 3. Train the model using the provided dataset and monitor the loss curve. 4. Evaluate the trained model's accuracy on the test data."
      compact
      onReset={resetAll}
    >
      <style>{`
        /* Dynamic Retro Arcade/Console Background */
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

        /* Handheld Arcade Console Body Casing (Chunky Deep Purple) */
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

        /* Screen Inset Screen (Dark neon game terminal screen) */
        .toy-screen {
          background: transparent !important;
          border: 3px solid #1e293b !important;
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
        .toy-panel .text-cyan-300, .toy-panel .text-cyan-400 { color: #0891b2 !important; }
        .toy-panel .text-purple-300, .toy-panel .text-purple-400 { color: #6b21a8 !important; }

        /* Console styling details (D-Pad and rubber buttons) */
        .toy-console-badge {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #ef4444;
          box-shadow: 1px 1px 0px #000000;
        }

        /* Bubbly Game Cards/Buttons (Module/Retro-Gamepad style) */
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

        /* Nav tab buttons */
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
          background: #ef4444 !important; /* red active console screen */
          color: #ffffff !important;
          transform: translateY(1px);
          box-shadow: none !important;
        }

        /* Actions Buttons */
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

        /* Module styling for learned vault elements */
        .toy-vault-card {
          border: 2.5px solid #000000 !important;
          border-radius: 14px !important;
          box-shadow: 3px 3px 0px #000000 !important;
          background: transparent !important;
        }

        /* Result blocks and similarity cards */
        .toy-result-box {
          border: 3px solid #000000 !important;
          border-radius: 20px !important;
          background: transparent !important;
          box-shadow: 4px 4px 0px #000000 !important;
          color: #065f46 !important;
        }

        .toy-result-box-unseen {
          background: transparent !important;
          color: #78350f !important;
        }

        .toy-similarity-overlay {
          border: 2px solid #000000 !important;
          background: transparent !important;
          box-shadow: 2px 2px 0px #000000 !important;
          color: #0f172a !important;
        }

        /* Bubbly Game Progress Rails */
        .toy-progress-rail {
          background: transparent !important;
          border: 2.5px solid #000000 !important;
          height: 16px !important;
          border-radius: 9999px !important;
          overflow: hidden;
          box-shadow: none !important;
        }

        .toy-progress-fill {
          border-right: 2px solid #000000 !important;
          border-radius: 9999px 0 0 9999px !important;
        }

        /* Network Visualizer Container */
        .toy-mini-net-panel {
          background: transparent !important;
          border: 3.5px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
        }

        .toy-arena {
          background: transparent !important;
          border: 3px solid #000000 !important;
          border-radius: 20px !important;
          box-shadow: none !important;
        }

        .toy-explanation-bubble {
          border: 3px solid #000000 !important;
          background: transparent !important;
          color: #064e3b !important;
          box-shadow: 4px 4px 0px #000000 !important;
          border-radius: 20px !important;
        }

        @keyframes pulseFlow { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
        .pulse-line { stroke-dasharray: 6,8; animation: pulseFlow 0.7s linear infinite; }
        @keyframes floatIn { 0%{transform:translateY(-12px) scale(0.8);opacity:0} 100%{transform:translateY(0) scale(1);opacity:1} }
        .float-in { animation: floatIn 0.35s ease-out forwards; }
      `}</style>

      <Celebration
        isActive={hasWon}
        message="Brilliant! You trained an AI brain, tested it on unknown shapes, then discovered the building blocks that explain its nearest-match logic!"
        onReplay={resetAll}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1 font-sans text-gray-100">

        {/* ── Navigation Tabs ── */}
        <div className="shrink-0 flex gap-3">
          {(["train", "detect", "match"] as const).map((tab, i) => {
            const labels = ["Train the Model", "Show the Model", "Match Features"];
            const locked = (tab === "detect" && !detectUnlocked) || (tab === "match" && !matchUnlocked);
            const active = activeTab === tab;
            return (
              <button key={tab}
                onClick={() => { if (!locked) { setActiveTab(tab); playPop(); } }}
                disabled={locked}
                className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
                  locked  ? "opacity-25 cursor-not-allowed bg-gray-800 border-gray-700 text-gray-500" :
                  active  ? "toy-btn-tab active-tab text-white" :
                            "bg-gray-900 text-gray-300 hover:text-white"
                }`}
              >{labels[i]}</button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════
              TAB 1 – TRAIN THE MODEL
          ══════════════════════════════════════════ */}
          {activeTab === "train" && (
            <motion.div key="train"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex flex-col flex-1 min-h-0 gap-3"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

                {/* Left: Shape deck */}
                <div className="lg:col-span-7 toy-panel">
                  {/* Speaker grilles & rubber buttons details */}
                  <div className="absolute top-3.5 right-4 flex gap-1 opacity-70">
                    <span className="toy-console-badge" />
                    <span className="toy-console-badge bg-amber-400" />
                  </div>
                  
                  <div className="toy-screen">
                    <div>
                      <h3 className="text-base font-black text-white">Shape Training Deck</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed font-bold">
                        Click any shape card to feed it into the AI brain. You can deliberately <strong className="text-amber-400">skip shapes</strong> — the model will never learn what it never sees!
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1 mt-4">
                      {SHAPES.map(shape => {
                        const learned   = trainedShapes.has(shape.id);
                        const learning  = trainingId === shape.id;
                        return (
                          <motion.button key={shape.id}
                            whileHover={!learned && !learning ? { scale: 1.04, y: -2 } : {}}
                            whileTap  ={!learned && !learning ? { scale: 0.96 } : {}}
                            onClick={() => trainShape(shape.id)}
                            disabled={learned || learning}
                            className={`relative p-3 toy-card flex flex-col items-center gap-2 cursor-pointer select-none ${
                              learned  ? "cursor-default border-emerald-500 bg-emerald-950/20" :
                              learning ? "border-violet-500/50 bg-purple-950/20 animate-pulse" :
                                         ""
                            }`}
                            style={learned ? { borderColor: shape.color } : {}}
                          >
                            {learned && (
                              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border border-black shadow-[1px_1px_0px_#000000]">
                                <CheckCircle size={10} className="text-white" />
                              </span>
                            )}
                            <ShapeSVG id={shape.id}
                              color={learned ? shape.color : learning ? shape.color : "#475569"}
                              size={52}
                            />
                            <span className="text-[11px] font-black uppercase tracking-wide"
                              style={{ color: learned ? shape.color : learning ? shape.color : "#64748b" }}
                            >{shape.name}</span>
                            {learning && <span className="text-[10px] text-purple-400 font-bold animate-pulse">Learning...</span>}
                            {learned  && <span className="text-[10px] font-bold" style={{ color: shape.color }}>Learned!</span>}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Neural net feed + Knowledge vault */}
                <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">

                  {/* Mini neural net diagram */}
                  <div className="toy-panel">
                    <div className="absolute top-3.5 right-4 flex gap-1 opacity-70">
                      <span className="toy-console-badge bg-sky-400" />
                    </div>

                    <div className="toy-screen p-3.5 gap-2">
                      <div className="flex items-center gap-2">
                        <BrainCircuit size={15} className="text-purple-400" />
                        <span className="text-[11px] font-black uppercase text-purple-300 tracking-wider">AI Brain — Training Feed</span>
                      </div>
                      <div className="h-[88px] w-full toy-mini-net-panel p-1">
                        <MiniNet
                          activeLayer={trainLayer}
                          shapeColor={trainingId ? SHAPES.find(s => s.id === trainingId)?.color : "#a78bfa"}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold text-center">
                        {trainingId
                          ? `Feeding ${SHAPES.find(s => s.id === trainingId)?.name} through the layers...`
                          : trainedShapes.size === 0
                            ? "Click a shape card to start training."
                            : `${trainedShapes.size} shape${trainedShapes.size > 1 ? "s" : ""} stored in model memory.`}
                      </p>
                    </div>
                  </div>

                  {/* Knowledge vault */}
                  <div className="toy-panel flex-1 min-h-0">
                    <div className="absolute top-3.5 right-4 flex gap-1 opacity-50">
                      <div className="w-1 h-3 bg-gray-900 rounded-full" />
                      <div className="w-1 h-3 bg-gray-900 rounded-full" />
                    </div>

                    <div className="toy-screen gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen size={15} className="text-cyan-400" />
                          <span className="text-[11px] font-black uppercase text-cyan-300 tracking-wider">Knowledge Vault</span>
                        </div>
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full toy-vault-badge bg-gray-800 border border-gray-700 text-gray-300">{trainedShapes.size}/6 learned</span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between gap-2">
                        {trainedShapes.size === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-xs text-gray-500 italic font-bold text-center px-2">
                            Vault empty — feed at least 2 shape cards to unlock detection.
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {[...trainedShapes].map(sid => {
                              const s = SHAPES.find(sh => sh.id === sid)!;
                              return (
                                <div key={sid} className="float-in flex flex-col items-center gap-0.5 px-2.5 py-1.5 toy-vault-card border"
                                  style={{ borderColor: s.color }}
                                >
                                  <ShapeSVG id={s.id} color={s.color} size={30} />
                                  <span className="text-[9px] font-black uppercase" style={{ color: s.color }}>{s.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {trainedShapes.size >= 2 ? (
                          <button
                            onClick={() => { setActiveTab("detect"); playPop(); }}
                            className="w-full toy-btn-action toy-btn-action-purple text-xs py-2 flex items-center justify-center gap-1.5 font-black uppercase"
                          >
                            Test the Model <ArrowRight size={13} />
                          </button>
                        ) : (
                          <p className="text-[10px] text-gray-500 text-center font-bold">
                            Train at least 2 shapes to unlock detection.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              TAB 2 – SHOW THE MODEL
          ══════════════════════════════════════════ */}
          {activeTab === "detect" && (
            <motion.div key="detect"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex flex-col flex-1 min-h-0 gap-3"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

                {/* Left: Card picker / scan / result */}
                <div className="lg:col-span-7 toy-panel">
                  <div className="absolute top-3.5 right-4 flex gap-1 opacity-70">
                    <span className="toy-console-badge" />
                    <span className="toy-console-badge bg-emerald-400" />
                  </div>

                  <div className="toy-screen">
                    {/* PICK STATE */}
                    {detectState === "pick" && (
                      <>
                        <div>
                          <h3 className="text-base font-black text-white">Show the Model a Card</h3>
                          <p className="text-xs text-gray-400 mt-1 font-bold leading-relaxed">
                            Pick <strong className="text-amber-400">any</strong> shape — even ones the model has never seen. Cards tagged <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase border border-black">New!</span> are unknown.
                          </p>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 flex-1 content-center">
                          {SHAPES.map(shape => {
                            const known    = trainedShapes.has(shape.id);
                            const selected = testShape === shape.id;
                            return (
                              <motion.button key={shape.id}
                                whileHover={{ scale: 1.06, y: -2 }}
                                whileTap  ={{ scale: 0.95 }}
                                onClick={() => { setTestShape(shape.id); playPop(); }}
                                className={`relative p-2.5 toy-card flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                                  selected ? "bg-gray-800" : ""
                                }`}
                                style={selected ? { borderColor: shape.color } : {}}
                              >
                                {!known && (
                                  <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase border border-black shadow-[1.5px_1.5px_0px_#000000]">New!</span>
                                )}
                                <ShapeSVG id={shape.id}
                                  color={selected ? shape.color : "#475569"}
                                  size={42}
                                />
                                <span className="text-[10px] font-black uppercase"
                                  style={{ color: selected ? shape.color : "#64748b" }}
                                >{shape.name}</span>
                              </motion.button>
                            );
                          })}
                        </div>

                        <button
                          onClick={runDetection}
                          disabled={!testShape}
                          className="w-full toy-btn-action text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-30 font-black uppercase"
                        >
                          <Play size={14} /> Run Model Detection
                        </button>
                      </>
                    )}

                    {/* SCANNING STATE */}
                    {detectState === "scanning" && testShape && (
                      <div className="flex-1 flex flex-col items-center justify-center gap-5">
                        <div className="flex items-center gap-4">
                          <ShapeSVG id={testShape} color={SHAPES.find(s => s.id === testShape)!.color} size={60} />
                          <ArrowRight size={22} className="text-purple-400 animate-pulse" />
                          <div className="text-center">
                            <p className="text-xs font-black text-purple-400 uppercase animate-pulse">Scanning...</p>
                            <p className="text-[10px] text-gray-500 font-bold mt-0.5">Layer {detectLayer} of 3</p>
                          </div>
                        </div>
                        <div className="w-full h-[90px] toy-mini-net-panel p-1">
                          <MiniNet
                            activeLayer={detectLayer}
                            shapeColor={SHAPES.find(s => s.id === testShape)?.color}
                          />
                        </div>
                      </div>
                    )}

                    {/* RESULT STATE */}
                    {detectState === "result" && testShape && detection && (
                      <div className="flex-1 flex flex-col gap-4 justify-between">
                        {/* Header result */}
                        <div className={`flex items-start gap-4 p-4 toy-result-box ${!detection.matched ? "toy-result-box-unseen" : ""}`}>
                          <ShapeSVG id={testShape} color={SHAPES.find(s => s.id === testShape)!.color} size={60} />
                          <div className="flex-1">
                            {detection.matched ? (
                              <>
                                <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm uppercase mb-1.5">
                                  <CheckCircle size={15} /> Recognized!
                                </div>
                                <p className="text-xs text-gray-300 font-bold leading-relaxed">
                                  The model <strong className="text-white">has seen</strong> a {SHAPES.find(s => s.id === testShape)?.name} before. It classified it with high confidence!
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm uppercase mb-1.5">
                                  <Info size={15} /> Nearest Match!
                                </div>
                                <p className="text-xs text-gray-300 font-bold leading-relaxed">
                                  The model has <span className="text-red-400 font-black">never seen</span> a <strong className="text-white">{SHAPES.find(s => s.id === testShape)?.name}</strong>. Closest guess:{" "}
                                  <strong className="font-black animate-pulse" style={{ color: SHAPES.find(s => s.id === detection.topShape)?.color }}>
                                    {SHAPES.find(s => s.id === detection.topShape)?.name}
                                  </strong>.
                                </p>
                                {/* Similarity overlay */}
                                <div className="mt-2.5 flex items-center gap-2.5 p-2.5 toy-similarity-overlay rounded-xl">
                                  <ShapeSVG id={testShape} color={SHAPES.find(s => s.id === testShape)!.color + "a0"} size={26} />
                                  <span className="text-gray-400 font-black text-sm">≈</span>
                                  <ShapeSVG id={detection.topShape} color={SHAPES.find(s => s.id === detection.topShape)!.color} size={26} />
                                  <p className="text-[10px] text-gray-300 font-bold leading-tight flex-1">
                                    {SHAPES.find(s => s.id === testShape)?.nearestReason}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => { setActiveTab("match"); playPop(); }}
                            className="w-full toy-btn-action toy-btn-action-emerald text-xs py-2 flex items-center justify-center gap-1.5 font-black uppercase"
                          >
                            See WHY → Match Features <ArrowRight size={13} />
                          </button>
                          <button
                            onClick={resetDetect}
                            className="w-full text-[11px] text-gray-500 hover:text-gray-300 font-black uppercase flex items-center justify-center gap-1 transition-all mt-1"
                          >
                            <RotateCcw size={11} /> Try Another Shape
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Confidence scores panel */}
                <div className="lg:col-span-5 toy-panel">
                  <div className="absolute top-3.5 right-4 flex gap-1 opacity-70">
                    <span className="toy-console-badge bg-red-400" />
                  </div>

                  <div className="toy-screen gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Target size={15} className="text-amber-400" />
                        <h4 className="text-[11px] font-black uppercase text-amber-300 tracking-wider">Model Confidence Scores</h4>
                      </div>
                      <h3 className="text-sm font-black text-white">Output Layer</h3>
                      <p className="text-xs text-gray-400 font-bold mb-1">Only trained shapes appear as output nodes.</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-2.5">
                      {detectState === "pick" && (
                        <p className="text-xs text-gray-500 italic font-bold text-center py-4">Pick a card and run detection to see results here.</p>
                      )}

                      {detectState === "scanning" && [...trainedShapes].map(sid => (
                        <div key={sid} className="flex flex-col gap-0.5 opacity-60">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-gray-400">{SHAPES.find(s => s.id === sid)?.name}</span>
                            <span className="text-gray-600 font-black">...%</span>
                          </div>
                          <div className="toy-progress-rail">
                            <div className="h-full w-1/4 bg-gray-800 rounded-full animate-pulse" />
                          </div>
                        </div>
                      ))}

                      {detectState === "result" && detection && (
                        <>
                          {(Object.entries(detection.scores) as [ShapeId, number][])
                            .sort((a, b) => b[1] - a[1])
                            .map(([sid, score]) => {
                              const shape = SHAPES.find(s => s.id === sid)!;
                              const isTop = sid === detection.topShape;
                              return (
                                <div key={sid} className="flex flex-col gap-0.5">
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-bold" style={{ color: isTop ? shape.color : "#475569" }}>{shape.name}</span>
                                    <span className="font-black" style={{ color: isTop ? shape.color : "#475569" }}>{score}%</span>
                                  </div>
                                  <div className="toy-progress-rail">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${score}%` }}
                                      transition={{ duration: 0.5, ease: "easeOut" }}
                                      className="h-full toy-progress-fill"
                                      style={{
                                        backgroundColor: shape.color,
                                        boxShadow: isTop ? `0 0 6px ${shape.color}66` : "none"
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}

                          {!detection.matched && (
                            <div className="mt-2.5 p-2.5 toy-similarity-overlay rounded-xl">
                              <p className="text-[10px] font-black text-amber-400 uppercase tracking-wide mb-0.5">Why this prediction?</p>
                              <p className="text-[11px] text-gray-300 font-bold leading-relaxed">
                                {SHAPES.find(s => s.id === testShape)?.nearestReason} Discover the visual proof in the Match Features tab!
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              TAB 3 – MATCH FEATURES
          ══════════════════════════════════════════ */}
          {activeTab === "match" && (
            <motion.div key="match"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex flex-col flex-1 min-h-0 gap-3"
            >
              {/* Shape selector */}
              {!matchShape ? (
                <div className="flex-1 toy-panel">
                  <div className="absolute top-3.5 right-4 flex gap-1 opacity-70">
                    <span className="toy-console-badge bg-red-400" />
                    <span className="toy-console-badge bg-amber-400" />
                  </div>

                  <div className="toy-screen flex flex-col items-center justify-center gap-5">
                    <div className="text-center">
                      <h3 className="text-base font-black text-white mb-1.5">Choose a Shape to Analyze</h3>
                      <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-sm">
                        Assemble each shape from its primitive building blocks and understand <em>why</em> the AI predicts what it predicts!
                      </p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {SHAPES.map(shape => (
                        <motion.button key={shape.id}
                          whileHover={{ scale: 1.06, y: -2 }}
                          whileTap  ={{ scale: 0.95 }}
                          onClick={() => { setMatchShape(shape.id); setPlacedBlocks([]); setMatchDone(false); playPop(); }}
                          className="p-3 toy-card flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <ShapeSVG id={shape.id} color={shape.color} size={44} />
                          <span className="text-[10px] font-black uppercase text-gray-400">{shape.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Assembly arena */
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

                  {/* Left: Canvas */}
                  <div className="lg:col-span-7 toy-panel">
                    <div className="absolute top-3.5 right-4 flex gap-1 opacity-70">
                      <span className="toy-console-badge bg-yellow-400" />
                    </div>

                    <div className="toy-screen justify-between gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-black text-white">
                            Assembling —{" "}
                            <span style={{ color: SHAPES.find(s => s.id === matchShape)!.color }}>
                              {SHAPES.find(s => s.id === matchShape)!.name}
                            </span>
                          </h3>
                          <p className="text-xs text-gray-400 font-bold mt-0.5">Click the correct blocks on the right to build it!</p>
                        </div>
                        <button
                          onClick={() => { setMatchShape(null); setPlacedBlocks([]); setMatchDone(false); playPop(); }}
                          className="text-[10px] text-gray-400 hover:text-white font-black uppercase bg-gray-900 hover:bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-800 shadow-[1.5px_1.5px_0px_#000000] transition-all"
                        >
                          <RotateCcw size={10} className="inline mr-1" />Pick another
                        </button>
                      </div>

                      {/* Shape visual + orbiting placed blocks */}
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 toy-arena py-6">
                        <div className="relative w-[130px] h-[130px] flex items-center justify-center">
                          {/* Ghost shape */}
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${matchDone ? "opacity-100" : "opacity-15"}`}>
                            <ShapeSVG id={matchShape} color={SHAPES.find(s => s.id === matchShape)!.color} size={110} filled />
                          </div>

                          {/* Orbiting placed blocks */}
                          {placedBlocks.map((bid, idx) => {
                            const total = SHAPE_RECIPE[matchShape].length;
                            const angle = (idx / total) * 360 - 90;
                            const rad   = (angle * Math.PI) / 180;
                            const r     = 64;
                            const x     = Math.cos(rad) * r;
                            const y     = Math.sin(rad) * r;
                            const block = FEATURE_BLOCKS.find(b => b.id === bid)!;
                            return (
                              <motion.div key={idx}
                                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                animate={{ opacity: 1, scale: 1, x, y }}
                                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                                className="absolute z-10"
                              >
                                <div className="p-1.5 rounded-lg border-2 border-black bg-gray-900 shadow-[2px_2px_0px_#000000]">
                                  <BlockSVG id={bid} color={block.color} size={26} />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Progress bar */}
                        <div className="flex flex-col items-center gap-1.5 w-full max-w-xs px-5">
                          <div className="flex justify-between w-full text-[11px]">
                            <span className="font-bold text-gray-500">Assembly</span>
                            <span className="font-black text-purple-400">
                              {placedBlocks.length}/{SHAPE_RECIPE[matchShape].length} blocks
                            </span>
                          </div>
                          <div className="w-full toy-progress-rail">
                            <motion.div
                              animate={{ width: `${(placedBlocks.length / SHAPE_RECIPE[matchShape].length) * 100}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 border-r border-black"
                            />
                          </div>
                        </div>

                        {/* Completion callout */}
                        {matchDone && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="mx-5 px-4 py-3 toy-explanation-bubble text-center"
                          >
                            <p className="text-emerald-300 font-black text-xs leading-relaxed">
                              {RECIPE_EXPLANATION[matchShape]}
                            </p>
                            {/* Connect back to detection result */}
                            {detection && !detection.matched && testShape === matchShape && (
                              <p className="text-emerald-400/80 text-[11px] font-bold mt-1.5 leading-relaxed">
                                That's why the model predicted{" "}
                                <strong style={{ color: SHAPES.find(s => s.id === detection.topShape)!.color }}>
                                  {SHAPES.find(s => s.id === detection.topShape)!.name}
                                </strong>{" "}
                                — they share the same building blocks!
                              </p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Feature block grid */}
                  <div className="lg:col-span-5 toy-panel">
                    <div className="absolute top-3.5 right-4 flex gap-1 opacity-70">
                      <span className="toy-console-badge bg-rose-400" />
                    </div>

                    <div className="toy-screen gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Sparkles size={15} className="text-purple-400" />
                          <h4 className="text-[11px] font-black uppercase text-purple-300 tracking-wider">Feature Building Blocks</h4>
                        </div>
                        <h3 className="text-sm font-black text-white">What is it made of?</h3>
                        <p className="text-xs text-gray-400 font-bold mt-0.5 leading-relaxed">
                          Only the <strong className="text-purple-400">correct blocks</strong> will snap in. Wrong ones will bounce!
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 flex-1 content-start mt-2">
                        {FEATURE_BLOCKS.map(block => {
                          const recipe  = SHAPE_RECIPE[matchShape];
                          const needed  = recipe.filter(b => b === block.id).length;
                          const placed  = placedBlocks.filter(b => b === block.id).length;
                          const done    = placed >= needed && needed > 0;
                          const usable  = needed > 0;

                          return (
                            <motion.button key={block.id}
                              whileHover={!done && usable ? { scale: 1.04, y: -2 } : {}}
                              whileTap  ={!done && usable ? { scale: 0.95 } : {}}
                              onClick={() => handleBlockClick(block.id)}
                              disabled={matchDone || !usable}
                              className={`p-3 toy-card flex flex-col items-center gap-2 transition-all ${
                                !usable  ? "opacity-25 cursor-not-allowed border-gray-800 bg-gray-900" :
                                done     ? "cursor-default border-emerald-500 bg-emerald-950/20" :
                                           ""
                              }`}
                              style={done ? { borderColor: "#10b981" } : {}}
                            >
                              <BlockSVG id={block.id} color={done ? block.color : usable ? "#94a3b8" : "#475569"} size={38} />
                              <div className="text-center">
                                <span className="text-[10px] font-black uppercase block"
                                  style={{ color: done ? block.color : usable ? "#cbd5e1" : "#475569" }}
                                >{block.name}</span>
                                {usable && (
                                  <span className={`text-[9px] font-black block mt-0.5 ${done ? "text-emerald-400" : "text-gray-500"}`}>
                                    {done ? `✓ ${needed}× placed` : `${placed}/${needed} needed`}
                                  </span>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {!matchDone && (
                        <div className="p-2.5 rounded-xl toy-similarity-overlay">
                          <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                            <strong className="text-purple-400">Tip:</strong> Think about the basic primitives (lines, angles, curves) that make up a{" "}
                            {SHAPES.find(s => s.id === matchShape)!.name}. Wrong picks bounce back!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </LabShell>
  );
}
