"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Search,
  Database,
  Sparkles,
  RefreshCcw,
  Timer,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Compass,
  Layers,
  Cpu,
  Target,
  Zap,
  HelpCircle,
  Hash,
  XCircle,
} from "lucide-react";

// ─── Semantic Dataset & Embedding Coordinates ──────────────────────────────
// High-dimensional embeddings projected into 2D normalized space [-1, 1]

interface ConceptPoint {
  id: string;
  word: string;
  category: "animal" | "vehicle" | "nature" | "tech";
  x: number;
  y: number;
  icon: string;
  desc: string;
}

const STORED_CONCEPTS: ConceptPoint[] = [
  // Animals (Quadrant 2 / Upper Left & Top)
  { id: "cat", word: "cat", category: "animal", x: 0.58, y: 0.62, icon: "", desc: "Domestic feline carnivore" },
  { id: "dog", word: "dog", category: "animal", x: -0.48, y: 0.58, icon: "", desc: "Domestic canine companion" },
  { id: "bird", word: "bird", category: "animal", x: 0.08, y: 0.78, icon: "", desc: "Feathered winged vertebrate" },
  { id: "wolf", word: "wolf", category: "animal", x: -0.68, y: 0.66, icon: "", desc: "Wild pack-hunting canine" },

  // Vehicles (Quadrant 4 / Bottom Right)
  { id: "car", word: "car", category: "vehicle", x: 0.64, y: -0.58, icon: "", desc: "Motor vehicle with wheels" },
  { id: "truck", word: "truck", category: "vehicle", x: 0.48, y: -0.74, icon: "", desc: "Heavy freight transport" },
  { id: "bicycle", word: "bicycle", category: "vehicle", x: 0.22, y: -0.62, icon: "", desc: "Two-wheeled pedal vehicle" },
  { id: "train", word: "train", category: "vehicle", x: 0.80, y: -0.70, icon: "", desc: "Rail locomotive transport" },

  // Nature (Quadrant 3 / Bottom Left)
  { id: "ocean", word: "ocean", category: "nature", x: -0.72, y: -0.32, icon: "", desc: "Vast expanse of salt water" },
  { id: "river", word: "river", category: "nature", x: -0.52, y: -0.48, icon: "️", desc: "Flowing natural freshwater" },
  { id: "mountain", word: "mountain", category: "nature", x: -0.64, y: 0.08, icon: "️", desc: "Elevated landform pinnacle" },
  { id: "forest", word: "forest", category: "nature", x: -0.38, y: -0.16, icon: "", desc: "Dense woodland ecosystem" },

  // Technology (Quadrant 1 / Center & Upper-Center Right)
  { id: "code", word: "code", category: "tech", x: 0.16, y: -0.08, icon: "", desc: "Programming instructions" },
  { id: "algorithm", word: "algorithm", category: "tech", x: 0.38, y: -0.04, icon: "️", desc: "Logic computation steps" },
  { id: "server", word: "server", category: "tech", x: 0.32, y: -0.28, icon: "️", desc: "Network host infrastructure" },
  { id: "data", word: "data", category: "tech", x: 0.04, y: -0.24, icon: "", desc: "Quantified information records" },
];

const CATEGORY_META = {
  animal: {
    label: "Animals",
    color: "#10b981", // emerald
    dotBg: "bg-emerald-500",
    textCol: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  vehicle: {
    label: "Vehicles",
    color: "#f59e0b", // amber
    dotBg: "bg-amber-500",
    textCol: "text-amber-700",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  nature: {
    label: "Nature",
    color: "#06b6d4", // cyan
    dotBg: "bg-cyan-500",
    textCol: "text-cyan-700",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  tech: {
    label: "Tech",
    color: "#8b5cf6", // violet
    dotBg: "bg-purple-500",
    textCol: "text-purple-700",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

interface QueryProfile {
  word: string;
  x: number;
  y: number;
  nearestId: string;
  dist: number;
  similarityPct: number;
  explanation: string;
  category: "animal" | "vehicle" | "nature" | "tech";
}

const PRESET_QUERIES: Record<string, QueryProfile> = {
  automobile: {
    word: "automobile",
    x: 0.60,
    y: -0.62,
    nearestId: "car",
    dist: 0.06,
    similarityPct: 96,
    explanation: "'automobile' is a direct synonym for 'car'. In vector space, their embedding coordinates are virtually identical!",
    category: "vehicle",
  },
  kitten: {
    word: "kitten",
    x: 0.64,
    y: 0.54,
    nearestId: "cat",
    dist: 0.10,
    similarityPct: 93,
    explanation: "'kitten' is a juvenile feline. The AI embedding model places it right inside the cat cluster.",
    category: "animal",
  },
  puppy: {
    word: "puppy",
    x: -0.40,
    y: 0.62,
    nearestId: "dog",
    dist: 0.09,
    similarityPct: 94,
    explanation: "'puppy' and 'dog' share canine, domestic, and pet dimensions, landing adjacent in vector space.",
    category: "animal",
  },
  hound: {
    word: "hound",
    x: -0.52,
    y: 0.54,
    nearestId: "dog",
    dist: 0.06,
    similarityPct: 96,
    explanation: "'hound' refers to hunting canines. The neural encoder clusters it tightly with 'dog'.",
    category: "animal",
  },
  lake: {
    word: "lake",
    x: -0.56,
    y: -0.42,
    nearestId: "river",
    dist: 0.07,
    similarityPct: 95,
    explanation: "'lake' and 'river' are inland freshwater bodies. Even though the spelling is completely different, vector proximity is tight.",
    category: "nature",
  },
  software: {
    word: "software",
    x: 0.22,
    y: -0.12,
    nearestId: "code",
    dist: 0.07,
    similarityPct: 95,
    explanation: "'software' and 'code' share programming semantics. Vector geometric distance is minimal.",
    category: "tech",
  },
  woods: {
    word: "woods",
    x: -0.42,
    y: -0.19,
    nearestId: "forest",
    dist: 0.05,
    similarityPct: 97,
    explanation: "'woods' and 'forest' are synonymous natural habitats — they occupy the exact same semantic territory.",
    category: "nature",
  },
};

const TIMER_DURATION_SECONDS = 5 * 60;

function toSvgCoord(v: number, min: number, max: number) {
  return min + ((v + 1) / 2) * (max - min);
}

// Trigger HMR update 2
export default function VectorDatabases9() {
  const { reportComplete: _reportComplete } = useLMSBridge("vectordatabases9");
  const { playPop, playZap, playError, playSuccess, playClick, playChime } = useLabAudio();

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLabComplete, setIsLabComplete] = useState(false);

  // Core Search State
  const [mode, setMode] = useState<"SQL" | "VECTOR">("SQL");
  const [queryInput, setQueryInput] = useState("");
  const [activeQueryWord, setActiveQueryWord] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Search Results
  const [sqlResult, setSqlResult] = useState<{
    found: boolean;
    word?: string;
    message: string;
    query: string;
  } | null>(null);

  const [vectorResult, setVectorResult] = useState<{
    queryWord: string;
    coords: [number, number];
    nearest: ConceptPoint;
    distance: number;
    similarity: number;
    explanation: string;
  } | null>(null);

  // Selected Concept for Inspector
  const [selectedConcept, setSelectedConcept] = useState<ConceptPoint | null>(null);

  // 7-Stage Pedagogical Steps
  const [steps, setSteps] = useState({
    trySqlExact: false,
    failSqlSynonym: false,
    switchedToVector: false,
    tryVectorSearch: false,
    passedQuiz: false,
  });

  // Quiz Assessment State
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  // Timer lifecycle
  useEffect(() => {
    if (timedOut || isLabComplete) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timedOut, isLabComplete]);

  useEffect(() => {
    if (timedOut && !isLabComplete) {
      _reportComplete({ points: 0 });
    }
  }, [timedOut, isLabComplete, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const reportLabComplete = useCallback(() => {
    setIsLabComplete(true);
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  // Execute Search
  const handleExecuteSearch = (targetWord?: string) => {
    const rawWord = (targetWord || queryInput).trim().toLowerCase();
    if (!rawWord || isSearching) return;

    setIsSearching(true);
    setActiveQueryWord(rawWord);
    setSqlResult(null);
    setVectorResult(null);
    playZap();

    setTimeout(() => {
      setIsSearching(false);

      if (mode === "SQL") {
        // Relational exact string match
        const exactMatch = STORED_CONCEPTS.find((c) => c.word.toLowerCase() === rawWord);
        if (exactMatch) {
          setSqlResult({
            found: true,
            word: exactMatch.word,
            message: `Exact row match found in SQL database table: 1 record returned.`,
            query: `SELECT * FROM concepts WHERE word = '${rawWord}';`,
          });
          playSuccess();
          setSteps((prev) => ({ ...prev, trySqlExact: true }));
        } else {
          setSqlResult({
            found: false,
            message: `0 rows returned. Exact string comparison failed: '${rawWord}' does not match any table records.`,
            query: `SELECT * FROM concepts WHERE word = '${rawWord}';`,
          });
          playError();
          setSteps((prev) => ({ ...prev, failSqlSynonym: true }));
        }
      } else {
        // Vector semantic search
        let profile = PRESET_QUERIES[rawWord];

        // If searching a known stored concept directly
        if (!profile) {
          const directStored = STORED_CONCEPTS.find((c) => c.word.toLowerCase() === rawWord);
          if (directStored) {
            profile = {
              word: directStored.word,
              x: directStored.x,
              y: directStored.y,
              nearestId: directStored.id,
              dist: 0.0,
              similarityPct: 100,
              explanation: `'${rawWord}' matches exact stored embedding coordinates in vector space!`,
              category: directStored.category,
            };
          }
        }

        if (profile) {
          const nearest = STORED_CONCEPTS.find((c) => c.id === profile.nearestId) || STORED_CONCEPTS[0];
          setVectorResult({
            queryWord: rawWord,
            coords: [profile.x, profile.y],
            nearest,
            distance: profile.dist,
            similarity: profile.similarityPct,
            explanation: profile.explanation,
          });
          playSuccess();
          setSteps((prev) => ({ ...prev, tryVectorSearch: true }));
        } else {
          // Fallback guidance
          setSqlResult({
            found: false,
            message: `Word '${rawWord}' not mapped in demo vocabulary. Try presets: automobile, kitten, puppy, hound, lake, software, woods.`,
            query: `EMBEDDING_GENERATE('${rawWord}')`,
          });
          playError();
        }
      }
    }, 700);
  };

  const handleSelectPreset = (word: string) => {
    playClick();
    setQueryInput(word);
    handleExecuteSearch(word);
  };

  const handleSwitchMode = (newMode: "SQL" | "VECTOR") => {
    if (mode === newMode) return;
    playClick();
    setMode(newMode);
    setSqlResult(null);
    setVectorResult(null);
    setActiveQueryWord(null);
    if (newMode === "VECTOR") {
      setSteps((prev) => ({ ...prev, switchedToVector: true }));
    }
  };

  const handleReset = () => {
    playZap();
    setMode("SQL");
    setQueryInput("");
    setActiveQueryWord(null);
    setSqlResult(null);
    setVectorResult(null);
    setSelectedConcept(null);
    setSteps({
      trySqlExact: false,
      failSqlSynonym: false,
      switchedToVector: false,
      tryVectorSearch: false,
      passedQuiz: false,
    });
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setQuizError(false);
  };

  const handleAnswerQuiz = (optionIdx: number) => {
    playClick();
    setQuizSelectedOption(optionIdx);
    setQuizError(false);
  };

  const handleSubmitQuiz = () => {
    if (quizSelectedOption === null) return;
    if (quizSelectedOption === 1) {
      setQuizSubmitted(true);
      setQuizError(false);
      setSteps((prev) => ({ ...prev, passedQuiz: true }));
      playSuccess();
      playChime();
      setTimeout(reportLabComplete, 1200);
    } else {
      setQuizError(true);
      playError();
    }
  };

  const SVG_W = 600;
  const SVG_H = 380;
  const PAD = 42;

  const completedCount =
    (steps.trySqlExact ? 1 : 0) +
    (steps.failSqlSynonym ? 1 : 0) +
    (steps.switchedToVector ? 1 : 0) +
    (steps.tryVectorSearch ? 1 : 0) +
    (steps.passedQuiz ? 1 : 0);

  return (
    <LabShell
      navExtra={
        !isLabComplete && (
          <div
            className={`flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs sm:text-sm font-bold border shadow-sm ${
              timedOut
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : secondsLeft <= 30
                ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                : "bg-white border-sky-100/80 text-sky-800"
            }`}
          >
            <Timer size={15} strokeWidth={2.5} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      }
      labId="vectordatabases9"
      theme="ocean"
      title="Vector Databases & Embeddings"
      instruction="Keyword (SQL) search only checks exact character spelling. Vector Databases convert text into mathematical coordinates (embeddings) so AI can search by conceptual meaning and synonyms!"
      compact
      onReset={handleReset}
    >
      <Celebration
        isActive={isLabComplete}
        message="Semantic Architecture Mastered! You proved that Vector Databases search by geometric coordinates rather than ASCII spelling, enabling AI models to understand synonyms and conceptual relationships."
        onReplay={handleReset}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-2 sm:gap-2.5 max-w-7xl mx-auto">
        {/* ── Top Pedagogical Progress Strip ── */}
        <div className="shrink-0 bg-white/95 backdrop-blur border border-slate-200/90 rounded-xl px-3 py-1.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <Compass size={14} className="text-indigo-600" />
              <span>Lab Mission</span>
            </div>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              {completedCount === 5
                ? "All Missions Complete!"
                : !steps.trySqlExact
                ? "Step 1: Test exact match in SQL ('cat')"
                : !steps.failSqlSynonym
                ? "Step 2: Test synonym in SQL ('automobile') to see it fail"
                : !steps.switchedToVector
                ? "Step 3: Switch to Vector Mode"
                : !steps.tryVectorSearch
                ? "Step 4: Run Vector Search on 'automobile'"
                : "Step 5: Complete the Concept Assessment"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: "s1", done: steps.trySqlExact, label: "SQL Exact" },
              { id: "s2", done: steps.failSqlSynonym, label: "SQL Fail" },
              { id: "s3", done: steps.switchedToVector, label: "Vector Mode" },
              { id: "s4", done: steps.tryVectorSearch, label: "Semantic Search" },
              { id: "s5", done: steps.passedQuiz, label: "Quiz" },
            ].map((s, idx) => (
              <div
                key={s.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  s.done
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
                title={s.label}
              >
                {s.done ? <CheckCircle2 size={11} className="text-emerald-600" /> : <span>{idx + 1}</span>}
                <span className="hidden md:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Workspace: Observatory Canvas (Left) + Workstation Deck (Right) ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3">
          {/* ════ LEFT PANE: CELESTIAL SEMANTIC RADAR OBSERVATORY ════ */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            {/* Observatory Header Strip */}
            <div className="shrink-0 px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Semantic Radar Space [2D Projection]
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="text-slate-400">Dimensions:</span>
                <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">X: Category</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Y: Concrete/Abstract</span>
              </div>
            </div>

            {/* Radar Canvas SVG */}
            <div className="flex-1 min-h-0 w-full relative flex items-center justify-center p-1 sm:p-2">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full h-full max-h-[360px] lg:max-h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Neon Glow Filter */}
                  <filter id="vector-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Soft Background Radial Clusters */}
                  <radialGradient id="grad-animals" cx="65%" cy="30%" r="40%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="grad-vehicles" cx="70%" cy="80%" r="40%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="grad-nature" cx="25%" cy="70%" r="40%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="grad-tech" cx="55%" cy="50%" r="35%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Soft Cluster Ambient Glows */}
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#grad-animals)" />
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#grad-vehicles)" />
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#grad-nature)" />
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#grad-tech)" />

                {/* Concentric Radar Distance Rings */}
                {[70, 130, 190, 250].map((r) => (
                  <circle
                    key={r}
                    cx={SVG_W / 2}
                    cy={SVG_H / 2}
                    r={r}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                ))}

                {/* Cartesian Coordinate Axes */}
                <line
                  x1={SVG_W / 2}
                  y1={PAD}
                  x2={SVG_W / 2}
                  y2={SVG_H - PAD}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <line
                  x1={PAD}
                  y1={SVG_H / 2}
                  x2={SVG_W - PAD}
                  y2={SVG_H / 2}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />

                {/* Axis Labels */}
                <text x={SVG_W - PAD + 4} y={SVG_H / 2 + 3} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  +X
                </text>
                <text x={PAD - 18} y={SVG_H / 2 + 3} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  -X
                </text>
                <text x={SVG_W / 2 + 4} y={PAD - 4} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  +Y
                </text>
                <text x={SVG_W / 2 + 4} y={SVG_H - PAD + 14} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  -Y
                </text>

                {/* Animated Radar Sweep (active in Vector mode) */}
                {mode === "VECTOR" && (
                  <motion.line
                    x1={SVG_W / 2}
                    y1={SVG_H / 2}
                    x2={SVG_W / 2 + 250}
                    y2={SVG_H / 2}
                    stroke="rgba(139, 92, 246, 0.45)"
                    strokeWidth="2"
                    filter="url(#vector-glow)"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    style={{ originX: `${SVG_W / 2}px`, originY: `${SVG_H / 2}px` }}
                  />
                )}

                {/* Vector Mode: Elastic Nearest-Neighbor Caliper Line */}
                {vectorResult &&
                  (() => {
                    const qx = toSvgCoord(vectorResult.coords[0], PAD, SVG_W - PAD);
                    const qy = toSvgCoord(-vectorResult.coords[1], PAD, SVG_H - PAD);
                    const nx = toSvgCoord(vectorResult.nearest.x, PAD, SVG_W - PAD);
                    const ny = toSvgCoord(-vectorResult.nearest.y, PAD, SVG_H - PAD);
                    const midX = (qx + nx) / 2;
                    const midY = (qy + ny) / 2;

                    return (
                      <g>
                        {/* Connecting Caliper Line */}
                        <motion.line
                          x1={qx}
                          y1={qy}
                          x2={nx}
                          y2={ny}
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          filter="url(#vector-glow)"
                        />

                        {/* Distance Caliper Pill */}
                        <motion.g
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <rect
                            x={midX - 38}
                            y={midY - 10}
                            width="76"
                            height="20"
                            rx="10"
                            fill="#0f172a"
                            stroke="#10b981"
                            strokeWidth="1.5"
                          />
                          <text
                            x={midX}
                            y={midY + 3.5}
                            fill="#34d399"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            d = {vectorResult.distance.toFixed(2)} ({vectorResult.similarity}%)
                          </text>
                        </motion.g>

                        {/* Echo Pulse Rings on Nearest Match */}
                        <motion.circle
                          cx={nx}
                          cy={ny}
                          r="16"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          animate={{ scale: [1, 2.2], opacity: [0.9, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                      </g>
                    );
                  })()}

                {/* Stored Database Concepts */}
                {STORED_CONCEPTS.map((c) => {
                  const cx = toSvgCoord(c.x, PAD, SVG_W - PAD);
                  const cy = toSvgCoord(-c.y, PAD, SVG_H - PAD);
                  const meta = CATEGORY_META[c.category];
                  const isNearest = vectorResult?.nearest.id === c.id;
                  const isSqlMatch = sqlResult?.found && sqlResult.word === c.word;
                  const isSelected = selectedConcept?.id === c.id;

                  return (
                    <g
                      key={c.id}
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => {
                        setSelectedConcept(c);
                        setQueryInput(c.word);
                        playClick();
                      }}
                    >
                      {/* Highlight Halo if Nearest or Selected */}
                      {(isNearest || isSqlMatch || isSelected) && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="14"
                          fill="none"
                          stroke={isSqlMatch ? "#f59e0b" : meta.color}
                          strokeWidth="2"
                          strokeDasharray="3 3"
                          filter="url(#vector-glow)"
                        />
                      )}

                      {/* Main Node Point */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isNearest || isSqlMatch ? "8" : "6"}
                        fill={isSqlMatch ? "#fbbf24" : meta.color}
                        filter={isNearest || isSqlMatch ? "url(#vector-glow)" : undefined}
                      />

                      {/* Word Label Pill */}
                      <rect
                        x={cx - (c.word.length * 3.5 + 8)}
                        y={cy + 8}
                        width={c.word.length * 7 + 16}
                        height="16"
                        rx="8"
                        fill="rgba(15, 23, 42, 0.85)"
                        stroke={isNearest ? "#10b981" : isSqlMatch ? "#f59e0b" : "#334155"}
                        strokeWidth={isNearest || isSqlMatch ? "1.5" : "1"}
                      />

                      <text
                        x={cx}
                        y={cy + 19.5}
                        fill={isNearest ? "#6ee7b7" : isSqlMatch ? "#fde047" : "#e2e8f0"}
                        fontSize="9.5"
                        fontWeight={isNearest || isSqlMatch ? "bold" : "600"}
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {c.icon} {c.word}
                      </text>
                    </g>
                  );
                })}

                {/* Active Query Vector Marker */}
                {vectorResult &&
                  (() => {
                    const qx = toSvgCoord(vectorResult.coords[0], PAD, SVG_W - PAD);
                    const qy = toSvgCoord(-vectorResult.coords[1], PAD, SVG_H - PAD);

                    return (
                      <motion.g
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                      >
                        {/* Target Crosshair */}
                        <line x1={qx - 12} y1={qy} x2={qx + 12} y2={qy} stroke="#f43f5e" strokeWidth="1.5" />
                        <line x1={qx} y1={qy - 12} x2={qx + 12} y2={qy} stroke="#f43f5e" strokeWidth="1.5" />

                        <circle cx={qx} cy={qy} r="7" fill="#f43f5e" filter="url(#vector-glow)" />

                        <rect
                          x={qx - (vectorResult.queryWord.length * 4 + 10)}
                          y={qy - 24}
                          width={vectorResult.queryWord.length * 8 + 20}
                          height="18"
                          rx="9"
                          fill="#881337"
                          stroke="#fb7185"
                          strokeWidth="1.5"
                        />
                        <text
                          x={qx}
                          y={qy - 12}
                          fill="#fecdd3"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          "{vectorResult.queryWord}"
                        </text>
                      </motion.g>
                    );
                  })()}

                {/* SQL Overlay Banner when in SQL Mode */}
                {mode === "SQL" && (
                  <g>
                    <rect
                      x="20"
                      y={SVG_H - 44}
                      width={SVG_W - 40}
                      height="28"
                      rx="8"
                      fill="rgba(15, 23, 42, 0.92)"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x={SVG_W / 2}
                      y={SVG_H - 26}
                      fill="#94a3b8"
                      fontSize="10.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ️ SQL Mode Active: Bypasses semantic coordinates. Queries relational string tables.
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Legend Bar */}
            <div className="shrink-0 px-3 py-1.5 bg-[#0a1024]/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1 text-[10px]">
              <div className="flex items-center gap-3">
                {Object.entries(CATEGORY_META).map(([catKey, meta]) => (
                  <div key={catKey} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-slate-700 font-mono">{meta.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Query Vector</span>
              </div>
            </div>
          </div>

          {/* ════ RIGHT PANE: CONTROL WORKSTATION & DIAGNOSTICS DECK ════ */}
          <div className="lg:col-span-5 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-md p-3 sm:p-4 gap-2.5 overflow-y-auto">
            {/* 1. Mode Switcher */}
            <div className="shrink-0 bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => handleSwitchMode("SQL")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === "SQL"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Database size={14} />
                <span>SQL (Exact Match)</span>
              </button>

              <button
                onClick={() => handleSwitchMode("VECTOR")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === "VECTOR"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Sparkles size={14} />
                <span>Vector (Semantic)</span>
              </button>
            </div>

            {/* 2. Interactive Search Bar */}
            <div className="shrink-0 flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExecuteSearch()}
                  placeholder={
                    mode === "SQL" ? 'Type exact word, e.g. "cat" or "automobile"' : 'Search concept, e.g. "automobile", "kitten"'
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-2 py-1.5 text-xs sm:text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <button
                onClick={() => handleExecuteSearch()}
                disabled={isSearching || !queryInput.trim()}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 text-white transition-all cursor-pointer disabled:opacity-50 ${
                  mode === "SQL"
                    ? "bg-amber-600 hover:bg-amber-700 shadow-sm"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                }`}
              >
                {isSearching ? (
                  <span className="animate-spin text-sm">⟳</span>
                ) : (
                  <>
                    <span>Search</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>

            {/* Quick Query Chips */}
            {(mode === "SQL" || !steps.tryVectorSearch) && (
            <div className="shrink-0 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Test:</span>
              {[
                { word: "cat", modeHint: "SQL", tag: "Exact" },
                { word: "automobile", modeHint: "Synonym", tag: "Synonym" },
                { word: "kitten", modeHint: "Synonym", tag: "Synonym" },
                { word: "hound", modeHint: "Synonym", tag: "Synonym" },
                { word: "lake", modeHint: "Synonym", tag: "Synonym" },
                { word: "software", modeHint: "Synonym", tag: "Synonym" },
              ].map((item) => {
                const isRecommended =
                  (!steps.trySqlExact && item.word === "cat" && mode === "SQL") ||
                  (steps.trySqlExact && !steps.failSqlSynonym && item.word === "automobile" && mode === "SQL") ||
                  (steps.switchedToVector && !steps.tryVectorSearch && item.word === "automobile" && mode === "VECTOR");

                return (
                  <button
                    key={item.word}
                    onClick={() => handleSelectPreset(item.word)}
                    className={`px-1.5 py-0 rounded-md text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                      isRecommended
                        ? "bg-amber-200 border-amber-500 text-amber-950 animate-pulse ring-2 ring-amber-300/50"
                        : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    }`}
                  >
                    "{item.word}"
                  </button>
                  );
                })}
              </div>
            )}

            {/* 3. Real-Time Result Inspector */}
            <div className="flex-1 min-h-[140px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {/* Searching Spinner */}
                {isSearching && (
                  <motion.div
                    key="searching"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-2 text-center"
                  >
                    <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-slate-700">
                      {mode === "SQL" ? "Scanning Table Index via ASCII..." : "Generating Neural Vector Embedding..."}
                    </span>
                  </motion.div>
                )}

                {/* SQL Result View */}
                {!isSearching && sqlResult && (
                  <motion.div
                    key="sql-result"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border flex flex-col gap-2 ${
                      sqlResult.found
                        ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                        : "bg-rose-50/90 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        {sqlResult.found ? (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        ) : (
                          <XCircle size={16} className="text-rose-600" />
                        )}
                        <span>{sqlResult.found ? "SQL Record Found!" : "SQL Query Failed (0 Rows)"}</span>
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-slate-200">
                        Exact Lexical Scan
                      </span>
                    </div>

                    <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-2 rounded-lg leading-relaxed">
                      <code>{sqlResult.query}</code>
                    </div>

                    <p className="text-xs font-medium leading-normal">{sqlResult.message}</p>

                    {!sqlResult.found && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
                        <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <strong>The Lexical Problem:</strong> SQL matches raw binary character strings. It does not
                          know that an <em>automobile</em> is a <em>car</em>. Switch to <strong>Vector Mode</strong> to
                          bridge meaning!
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Vector Result View */}
                {!isSearching && vectorResult && (
                  <motion.div
                    key="vector-result"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-indigo-700">
                        <Sparkles size={16} className="text-indigo-600" />
                        <span>Nearest Neighbor Identified</span>
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                        {vectorResult.similarity}% Match
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="p-2 rounded-lg bg-white border border-indigo-100 flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Query Embedding</span>
                        <span className="font-bold text-rose-600 font-mono">"{vectorResult.queryWord}"</span>
                        <span className="text-[10px] font-mono text-slate-600">
                          [{vectorResult.coords[0].toFixed(2)}, {vectorResult.coords[1].toFixed(2)}]
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-indigo-100 flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Stored Neighbor</span>
                        <span className="font-bold text-emerald-600 font-mono">
                          {vectorResult.nearest.icon} "{vectorResult.nearest.word}"
                        </span>
                        <span className="text-[10px] font-mono text-slate-600">
                          [{vectorResult.nearest.x.toFixed(2)}, {vectorResult.nearest.y.toFixed(2)}]
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-100/70 border border-indigo-200 text-[11px] text-indigo-900 leading-normal">
                      <strong>Why this works:</strong> {vectorResult.explanation}
                    </div>
                  </motion.div>
                )}

                {/* Default Initial State */}
                {!isSearching && !sqlResult && !vectorResult && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex flex-col items-center text-center gap-1.5"
                  >
                    <Target size={22} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800">
                      {mode === "SQL" ? "Relational Lexical Search Ready" : "Vector Space Embedding Ready"}
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      {mode === "SQL"
                        ? "Search for 'cat' to see an exact match, or 'automobile' to witness lexical search fail."
                        : "Search for 'automobile', 'kitten', or 'software' to see nearest neighbor cosine matching in action."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Pedagogical Concept Assessment Card */}
            {steps.tryVectorSearch && mode === "VECTOR" && vectorResult && (
            <div className="shrink-0 border-t border-slate-200 pt-2 mt-0 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <HelpCircle size={13} className="text-indigo-600" />
                  <span>Concept Assessment</span>
                </span>
                {steps.passedQuiz && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Passed 100/100
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-800">
                Why could the Vector Database match <em>"automobile"</em> to <em>"car"</em> when SQL failed?
              </p>

              <div className="flex flex-col gap-1 text-xs">
                {[
                  "It looked up human-written synonym dictionary tables in SQL.",
                  "AI converted both words into mathematical vectors based on meaning, allowing distance measurement.",
                  "It randomly guessed based on the length of the words.",
                ].map((optText, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswerQuiz(optIdx)}
                    disabled={steps.passedQuiz}
                    className={`p-1.5 rounded-lg text-left text-[11px] leading-tight font-medium border transition-all cursor-pointer ${
                      quizSelectedOption === optIdx
                        ? optIdx === 1
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-200"
                          : "bg-rose-50 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-200"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)})</span>
                    {optText}
                  </button>
                ))}
              </div>

              {quizError && (
                <p className="text-[11px] text-rose-600 font-bold animate-shake">
                  Not quite. AI models don't rely on static human dictionaries — they map concepts into mathematical
                  vector space! Try again.
                </p>
              )}

              {!steps.passedQuiz && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={quizSelectedOption === null}
                  className="mt-1 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-0.5 disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  Verify Answer & Complete Lab
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Time's Up Modal */}
      {timedOut && !isLabComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm text-center mx-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1.5">Time's Up!</h3>
            <p className="text-sm font-medium text-slate-600 mb-4">You did not complete the lab in time.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-1 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </LabShell>
  );
}
