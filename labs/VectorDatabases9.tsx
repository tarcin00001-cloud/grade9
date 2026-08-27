"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Search, Database, RefreshCcw, Sparkles } from "lucide-react";

// ─── Embedding Map ─────────────────────────────────────────────────────────────
// A 2D semantic space. [x, y] are in -1 to 1 range, mapped to canvas coords.

const FIXED_CONCEPTS = [
  { word: "cat", x: 0.62, y: 0.55, group: "animal" },
  { word: "kitten", x: 0.70, y: 0.48, group: "animal" },
  { word: "puppy", x: -0.35, y: 0.60, group: "animal" },
  { word: "dog", x: -0.50, y: 0.52, group: "animal" },
  { word: "bird", x: 0.10, y: 0.85, group: "animal" },
  { word: "car", x: 0.70, y: -0.60, group: "vehicle" },
  { word: "truck", x: 0.55, y: -0.72, group: "vehicle" },
  { word: "bicycle", x: 0.20, y: -0.65, group: "vehicle" },
  { word: "ocean", x: -0.70, y: -0.30, group: "nature" },
  { word: "river", x: -0.55, y: -0.42, group: "nature" },
  { word: "mountain", x: -0.65, y: 0.05, group: "nature" },
  { word: "code", x: 0.10, y: -0.10, group: "tech" },
  { word: "program", x: 0.25, y: -0.20, group: "tech" },
  { word: "algorithm", x: 0.35, y: -0.05, group: "tech" },
];

const QUERY_WORDS: Record<string, { x: number; y: number; nearest: string; dist: string; explanation: string }> = {
  "puppy": { x: -0.38, y: 0.62, nearest: "dog", dist: "0.08", explanation: "\"puppy\" and \"dog\" share animal-mammal-canine features — very close in embedding space!" },
  "kitten": { x: 0.68, y: 0.50, nearest: "cat", dist: "0.04", explanation: "\"kitten\" is a baby cat — almost identical meaning → almost identical coordinates." },
  "automobile": { x: 0.65, y: -0.63, nearest: "car", dist: "0.07", explanation: "\"automobile\" is a synonym for \"car\" — same region of vehicle-space." },
  "software": { x: 0.18, y: -0.13, nearest: "code", dist: "0.09", explanation: "\"software\" and \"code\" live in the programming cluster — semantic neighbors." },
  "lake": { x: -0.60, y: -0.38, nearest: "river", dist: "0.06", explanation: "\"lake\" and \"river\" are both bodies of water — the model groups water concepts together." },
};

const GROUP_COLORS: Record<string, { dot: string; label: string }> = {
  animal:  { dot: "#10b981", label: "#6ee7b7" },
  vehicle: { dot: "#f59e0b", label: "#fcd34d" },
  nature:  { dot: "#06b6d4", label: "#67e8f9" },
  tech:    { dot: "#a78bfa", label: "#c4b5fd" },
};

function toCanvas(v: number, min: number, max: number) {
  return min + ((v + 1) / 2) * (max - min);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function VectorDatabases9() {
  const { reportComplete } = useLMSBridge("vectordatabases9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<"SQL" | "VECTOR">("SQL");
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<typeof QUERY_WORDS[string] | null>(null);
  const [sqlResult, setSqlResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const W = 560, H = 320;
  const PAD = 40;

  const runSearch = () => {
    if (!query.trim() || searching) return;
    const q = query.trim().toLowerCase();
    setSearching(true);
    setQueryResult(null);
    setSqlResult(null);
    playZap();

    setTimeout(() => {
      if (mode === "SQL") {
        const exactMatch = FIXED_CONCEPTS.find(c => c.word === q);
        setSqlResult(exactMatch ? `Found: "${exactMatch.word}"` : `0 results — no exact match for "${q}"`);
        if (!exactMatch) playError(); else playSuccess();
        setSearching(false);
      } else {
        const vec = QUERY_WORDS[q];
        if (vec) {
          setQueryResult(vec);
          playSuccess();
          if (!hasWon) {
            setHasWon(true);
            setTimeout(reportComplete, 1500);
          }
        } else {
          setSqlResult(`Word "${q}" not in embedding vocab. Try: ${Object.keys(QUERY_WORDS).join(", ")}`);
          playError();
        }
        setSearching(false);
      }
    }, 1000);
  };

  const reset = () => {
    setMode("SQL");
    setQuery("");
    setQueryResult(null);
    setSqlResult(null);
    setSearching(false);
    setHasWon(false);
    playZap();
  };

  return (
    <LabShell labId="vectordatabases9" theme="studio" title="Vector Databases & Embeddings" subtitle="L46 · Artificial Intelligence"
      instruction="SQL searches for exact spelling. Vector databases search by meaning. Type a word and search in SQL mode — it fails unless it's an exact match. Switch to Vector mode — the AI converts your word into XY coordinates and finds the nearest neighbor in semantic space, even for synonyms!" compact>

      <Celebration isActive={hasWon} message="Semantic Match Found! AI models don't understand language — they understand mathematical coordinates called embeddings. Words with similar meanings cluster together in high-dimensional space. Vector databases find the nearest cluster neighbors, enabling semantic search." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1">

        {/* ── Controls ── */}
        <div className="shrink-0 panel-glass rounded-2xl border-violet-900/40 p-3 flex flex-wrap items-center gap-3">

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl border border-slate-800">
            <button
              onClick={() => { setMode("SQL"); setQueryResult(null); setSqlResult(null); playZap(); }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${mode === "SQL" ? "bg-amber-500/20 border border-amber-500/50 text-amber-300" : "text-slate-500 hover:text-slate-300"}`}
            >
              <span className="flex items-center gap-1.5"><Database size={12}/> SQL (Exact Match)</span>
            </button>
            <button
              onClick={() => { setMode("VECTOR"); setQueryResult(null); setSqlResult(null); playZap(); }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${mode === "VECTOR" ? "bg-violet-500/20 border border-violet-500/50 text-violet-300" : "text-slate-500 hover:text-slate-300"}`}
            >
              <span className="flex items-center gap-1.5"><Sparkles size={12}/> Vector (Semantic)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runSearch()}
              placeholder={mode === "SQL" ? 'Type a word, e.g. "puppy"' : 'Try: puppy, automobile, lake, software...'}
              className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-600 transition-all min-w-0"
            />
            <button
              onClick={runSearch}
              disabled={searching || !query.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all disabled:opacity-40 ${
                mode === "SQL"
                  ? "bg-amber-600/80 border border-amber-500 text-white hover:bg-amber-500"
                  : "bg-violet-600 border border-violet-400 text-white hover:bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
              }`}
            >
              <Search size={13}/> Search
            </button>
          </div>

          <button onClick={reset} className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-all">
            <RefreshCcw size={14}/>
          </button>
        </div>

        {/* ── Main: 2D Embedding Map + Result ── */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3">

          {/* Vector Map Canvas */}
          <div className="flex-1 panel-glass rounded-2xl border-violet-900/40 bg-[#020617] overflow-hidden relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="glow-vdb">
                  <feGaussianBlur stdDeviation="3" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Axes */}
              <line x1={W/2} y1={PAD} x2={W/2} y2={H-PAD} stroke="#1e293b" strokeWidth={1}/>
              <line x1={PAD} y1={H/2} x2={W-PAD} y2={H/2} stroke="#1e293b" strokeWidth={1}/>
              <text x={W-PAD+2} y={H/2+12} fill="#334155" fontSize={9} fontFamily="monospace">semantic →</text>
              <text x={W/2+4} y={PAD+8} fill="#334155" fontSize={9} fontFamily="monospace">abstract ↑</text>

              {/* Nearest neighbor line */}
              {queryResult && (() => {
                const nearest = FIXED_CONCEPTS.find(c => c.word === queryResult.nearest);
                if (!nearest) return null;
                const qx = toCanvas(queryResult.x, PAD, W - PAD);
                const qy = toCanvas(-queryResult.y, PAD, H - PAD);
                const nx = toCanvas(nearest.x, PAD, W - PAD);
                const ny = toCanvas(-nearest.y, PAD, H - PAD);
                return (
                  <motion.line
                    x1={qx} y1={qy} x2={nx} y2={ny}
                    stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 3"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    filter="url(#glow-vdb)"
                  />
                );
              })()}

              {/* Fixed concepts */}
              {FIXED_CONCEPTS.map(c => {
                const cx = toCanvas(c.x, PAD, W - PAD);
                const cy = toCanvas(-c.y, PAD, H - PAD);
                const col = GROUP_COLORS[c.group];
                const isNearest = queryResult?.nearest === c.word;
                return (
                  <g key={c.word}>
                    <circle
                      cx={cx} cy={cy} r={isNearest ? 9 : 6}
                      fill={col.dot}
                      filter={isNearest ? "url(#glow-vdb)" : undefined}
                    />
                    <text x={cx} y={cy - 10} fill={col.label} fontSize={isNearest ? 11 : 9} fontWeight={isNearest ? "bold" : "normal"} textAnchor="middle" fontFamily="monospace">
                      {c.word}
                    </text>
                  </g>
                );
              })}

              {/* Query dot */}
              {queryResult && (() => {
                const qx = toCanvas(queryResult.x, PAD, W - PAD);
                const qy = toCanvas(-queryResult.y, PAD, H - PAD);
                return (
                  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <circle cx={qx} cy={qy} r={8} fill="#f43f5e" filter="url(#glow-vdb)"/>
                    <text x={qx} y={qy - 12} fill="#fb7185" fontSize={11} fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      "{query}"
                    </text>
                  </motion.g>
                );
              })()}

              {/* Mode label */}
              <rect x={8} y={8} width={mode === "SQL" ? 100 : 105} height={18} rx={4} fill={mode === "SQL" ? "#422006" : "#1e1b4b"}/>
              <text x={14} y={21} fill={mode === "SQL" ? "#fcd34d" : "#c4b5fd"} fontSize={9} fontWeight="bold" fontFamily="monospace">
                {mode === "SQL" ? "SQL: Exact String" : "VECTOR: Semantic Space"}
              </text>

              {/* SQL overlay */}
              {mode === "SQL" && (
                <rect x={0} y={0} width={W} height={H} fill="rgba(0,0,0,0.55)"/>
              )}
              {mode === "SQL" && (
                <text x={W/2} y={H/2} fill="#475569" fontSize={14} fontWeight="bold" textAnchor="middle">
                  SQL doesn't use this space. Switch to Vector mode.
                </text>
              )}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1">
              {Object.entries(GROUP_COLORS).map(([g, c]) => (
                <div key={g} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }}/>
                  <span className="text-[9px] font-mono" style={{ color: c.label }}>{g}</span>
                </div>
              ))}
              {queryResult && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500"/>
                  <span className="text-[9px] font-mono text-rose-400">your query</span>
                </div>
              )}
            </div>
          </div>

          {/* Result Panel */}
          <div className="lg:w-[260px] shrink-0 flex flex-col gap-3">

            {/* SQL Result */}
            <AnimatePresence>
              {sqlResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`panel-glass rounded-xl border p-4 ${
                    sqlResult.includes("0 results") || sqlResult.includes("not in")
                      ? "border-rose-800/40 bg-rose-950/20"
                      : "border-emerald-800/40 bg-emerald-950/20"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-300 mb-2">{mode === "SQL" ? "SQL Result" : "Error"}</div>
                  <div className="font-mono text-xs text-slate-300 leading-relaxed">{sqlResult}</div>
                  {sqlResult.includes("0 results") && (
                    <div className="mt-2 text-[10px] text-rose-400">
                      SQL looks for exact characters. "puppy" ≠ "dog".
                      Switch to Vector mode!
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vector Result */}
            <AnimatePresence>
              {queryResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="panel-glass rounded-xl border border-emerald-800/40 bg-emerald-950/10 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Sparkles size={13}/> Nearest Neighbor Found!
                  </div>
                  <div className="font-mono text-sm">
                    <span className="text-rose-400">"{query}"</span>
                    <span className="text-slate-500"> → </span>
                    <span className="text-emerald-400">"{queryResult.nearest}"</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Distance: <span className="text-emerald-300 font-mono">{queryResult.dist}</span> (cosine similarity)</div>
                  <div className="text-[10px] text-slate-300 leading-relaxed">{queryResult.explanation}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Searching indicator */}
            <AnimatePresence>
              {searching && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-violet-400 text-xs p-4 panel-glass rounded-xl border border-violet-900/40"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full"/>
                  {mode === "SQL" ? "Scanning rows..." : "Computing embedding..."}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            {!queryResult && !sqlResult && !searching && (
              <div className="panel-glass rounded-xl border border-slate-800/40 p-4 text-[10px] text-slate-500 leading-relaxed">
                <div className="font-bold text-slate-400 mb-1">Try these queries:</div>
                {Object.keys(QUERY_WORDS).map(w => (
                  <button key={w} onClick={() => { setQuery(w); }} className="mr-1 mb-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-all">
                    {w}
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </LabShell>
  );
}
