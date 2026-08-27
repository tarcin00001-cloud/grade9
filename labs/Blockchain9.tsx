"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Link2, Unlink, Pickaxe, HardDrive } from "lucide-react";

// ─── SVG Blockchain Mechanics ─────────────────────────────────────────────────

function BlockchainSVG({
  blocks,
  onMine
}: {
  blocks: { id: number; data: string; hash: string; prev: string; valid: boolean; nonce: number }[];
  onMine: (id: number) => void;
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-valid">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-invalid">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridChain" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridChain)" />

      {/* ── Chain Links ── */}
      {/* Link 1->2 */}
      <g>
        <path d="M 270,250 L 350,250" fill="none" stroke={blocks[1].valid ? "#10b981" : "#ef4444"} strokeWidth="8" filter={blocks[1].valid ? "url(#glow-valid)" : "url(#glow-invalid)"} />
        {!blocks[1].valid && <path d="M 300,230 L 320,270" fill="none" stroke="#fff" strokeWidth="6" />} {/* Visual crack */}
      </g>
      
      {/* Link 2->3 */}
      <g>
        <path d="M 550,250 L 630,250" fill="none" stroke={blocks[2].valid ? "#10b981" : "#ef4444"} strokeWidth="8" filter={blocks[2].valid ? "url(#glow-valid)" : "url(#glow-invalid)"} />
        {!blocks[2].valid && <path d="M 580,230 L 600,270" fill="none" stroke="#fff" strokeWidth="6" />} {/* Visual crack */}
      </g>

      {/* ── Blocks ── */}
      {blocks.map((b, i) => {
        const xOffset = 50 + (i * 280);
        return (
          <g key={b.id} transform={`translate(${xOffset}, 100)`}>
            
            {/* Block Base */}
            <rect x="0" y="0" width="220" height="300" fill="#f8fafc" rx="12" stroke="#ef4444" strokeWidth="4" filter={!b.valid ? "url(#glow-invalid)" : "none"} style={{ transition: "all 0.3s" }} />
            
            <text x="110" y="35" fill={b.valid ? "#1d4ed8" : "#be123c"} fontSize="20" fontWeight="black" textAnchor="middle">BLOCK {b.id}</text>
            
            {/* Nonce */}
            <rect x="20" y="60" width="180" height="40" fill="#e2e8f0" rx="6" />
            <text x="30" y="85" fill="#475569" fontSize="12" fontWeight="bold">Nonce:</text>
            <text x="180" y="85" fill="#1e293b" fontSize="14" fontFamily="monospace" fontWeight="bold" textAnchor="end">{b.nonce}</text>

            {/* Data Preview (Visually read-only here, edited in HTML overlay for interactivity) */}
            <rect x="20" y="110" width="180" height="60" fill="#fff" rx="6" stroke="#cbd5e1" strokeWidth="2" />
            <text x="30" y="130" fill="#475569" fontSize="12" fontWeight="bold">Data:</text>
            <text x="30" y="155" fill="#0f172a" fontSize="14" fontFamily="monospace" fontWeight="bold">"{b.data}"</text>

            {/* Prev Hash */}
            <rect x="20" y="180" width="180" height="40" fill="#e2e8f0" rx="6" />
            <text x="30" y="205" fill="#475569" fontSize="12" fontWeight="bold">Prev:</text>
            <text x="180" y="205" fill={b.valid ? "#059669" : "#dc2626"} fontSize="10" fontFamily="monospace" textAnchor="end">{b.prev}</text>

            {/* Current Hash */}
            <rect x="20" y="230" width="180" height="40" fill="#e2e8f0" rx="6" stroke={b.valid ? "#10b981" : "#ef4444"} strokeWidth="2" />
            <text x="30" y="255" fill="#475569" fontSize="12" fontWeight="bold">Hash:</text>
            <text x="180" y="255" fill="#059669" fontSize="10" fontFamily="monospace" textAnchor="end">{b.hash}</text>

            {/* Interactive Mine Button Overlay (Handled via HTML positioning in parent, but we draw a placeholder) */}
            {!b.valid && (
              <motion.g initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }}>
                <rect x="60" y="285" width="100" height="30" fill="#fb7185" rx="15" />
                <text x="110" y="305" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">NEEDS MINING</text>
              </motion.g>
            )}

          </g>
        );
      })}
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

// Simple hash simulator for visual demonstration
const simHash = (str: string, nonce: number) => {
  let hash = 0;
  const target = str + nonce.toString();
  for (let i = 0; i < target.length; i++) hash = (hash << 5) - hash + target.charCodeAt(i);
  let res = Math.abs(hash).toString(16).padStart(8, '0');
  // If valid (mined), we force the hash to start with '0000' for visual "Proof of Work"
  return res;
};

export default function Blockchain9() {
  const { reportComplete } = useLMSBridge("blockchain9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  // Initial State
  const [blocks, setBlocks] = useState([
    { id: 1, data: "Genesis Tx", hash: "0000a1b2", prev: "00000000", valid: true, nonce: 843, mined: true },
    { id: 2, data: "Alice -> Bob $50", hash: "0000c3d4", prev: "0000a1b2", valid: true, nonce: 129, mined: true },
    { id: 3, data: "Bob -> Eve $10", hash: "0000e5f6", prev: "0000c3d4", valid: true, nonce: 554, mined: true },
  ]);
  const [hasWon, setHasWon] = useState(false);
  const [repairCount, setRepairCount] = useState(0);
  // Tracks whether the chain has been broken since the last repair
  const chainWasBrokenRef = useRef(false);

  const reset = () => {
    setBlocks([
      { id: 1, data: "Genesis Tx", hash: "0000a1b2", prev: "00000000", valid: true, nonce: 843, mined: true },
      { id: 2, data: "Alice -> Bob $50", hash: "0000c3d4", prev: "0000a1b2", valid: true, nonce: 129, mined: true },
      { id: 3, data: "Bob -> Eve $10", hash: "0000e5f6", prev: "0000c3d4", valid: true, nonce: 554, mined: true },
    ]);
    setHasWon(false);
    setRepairCount(0);
    chainWasBrokenRef.current = false;
  };

  // Recalculate chain logic
  const updateChain = (newBlocks: typeof blocks) => {
    for (let i = 0; i < newBlocks.length; i++) {
      const b = newBlocks[i];

      // Only recalculate hash for blocks that haven't been explicitly mined.
      // Mined blocks keep their forced "0000" hash so mining has a lasting effect.
      if (!b.mined) {
        const currentHash = simHash(b.data, b.nonce);
        b.hash = currentHash;
        b.valid = currentHash.startsWith("0000");
      }

      // Check chain link — always verify prev hash matches previous block's hash
      if (i > 0) {
        if (b.prev !== newBlocks[i - 1].hash) {
          b.valid = false;
        }
      }

      // Always propagate this block's hash to the next block's prev pointer
      if (i < newBlocks.length - 1) {
        newBlocks[i + 1].prev = b.hash;
      }
    }
    setBlocks([...newBlocks]);
  };

  const handleDataChange = (id: number, newData: string) => {
    playPop();
    const newBlocks = [...blocks];
    const idx = newBlocks.findIndex(b => b.id === id);
    newBlocks[idx].data = newData;
    // Altering data instantly corrupts the nonce's proof of work and clears mined status
    newBlocks[idx].nonce = Math.floor(Math.random() * 9999);
    newBlocks[idx].mined = false;
    // Mark that the chain has been deliberately broken — needed to count a genuine repair
    chainWasBrokenRef.current = true;
    playError();
    updateChain(newBlocks);
  };

  const handleMine = (id: number) => {
    playZap();
    const newBlocks = [...blocks];
    const idx = newBlocks.findIndex(b => b.id === id);
    
    // Simulate mining finding a valid nonce
    newBlocks[idx].nonce = Math.floor(Math.random() * 90000) + 10000;
    
    // Force a valid "0000" hash visually and mark as mined so updateChain
    // won't overwrite the forced hash with a recalculated one
    const forcedHash = "0000" + Math.abs(Math.random() * 100000).toString(16).substring(0, 4);
    newBlocks[idx].hash = forcedHash;
    newBlocks[idx].valid = true;
    newBlocks[idx].mined = true;

    // Propagate the new valid hash to the next block's prev pointer (which invalidates the next block!)
    // Also clear its mined flag so it must be re-mined after the chain update
    if (idx < newBlocks.length - 1) {
      newBlocks[idx + 1].prev = forcedHash;
      newBlocks[idx + 1].mined = false;
    }

    updateChain(newBlocks);

    // Count a repair when the chain was broken and is now fully valid again
    if (chainWasBrokenRef.current && newBlocks.every(b => b.valid)) {
      chainWasBrokenRef.current = false;
      const newCount = repairCount + 1;
      setRepairCount(newCount);
      // Win after completing 2 full tamper + repair cycles
      if (newCount >= 2 && !hasWon) {
        setHasWon(true);
        playSuccess();
        setTimeout(reportComplete, 1500);
      }
    }
  };

  // ── Dynamic hint derived from current chain state ──────────────────────────
  const allValid = blocks.every(b => b.valid);
  const anyInvalid = blocks.some(b => !b.valid);
  const dataChanged = blocks[1].data !== "Alice -> Bob $50";
  const firstInvalidIdx = blocks.findIndex(b => !b.valid);

  let hint: { step: number; text: string; icon: string };
  if (anyInvalid && firstInvalidIdx >= 0) {
    hint = { step: 2, icon: "⛏️", text: `Block ${blocks[firstInvalidIdx].id} is broken! Click the red MINE button on it to do Proof-of-Work and restore its hash. (Round ${repairCount + 1}/2)` };
  } else if (allValid && repairCount === 1) {
    hint = { step: 3, icon: "🔄", text: "Great! Chain repaired (1/2). Now tamper with a block again and mine it back to complete the lab!" };
  } else if (repairCount === 0 && !anyInvalid) {
    hint = { step: 1, icon: "✏️", text: "Click inside the Data field of any block and change the transaction — e.g. change \"$50\" to \"$999\". Watch the chain break! (Round 1/2)" };
  } else {
    hint = { step: 1, icon: "✏️", text: "Click inside the Data field of any block and change the transaction — e.g. change \"$50\" to \"$999\". Watch the chain break!" };
  }

  return (
    <LabShell labId="blockchain9" theme="forge" title="Cryptographic Blockchain"
      instruction="1. Understand the fundamental structure of a blockchain and decentralized ledgers. 2. Interact with the simulation to create new blocks and calculate their cryptographic hashes. 3. Attempt to alter a previous block to see how it invalidates the entire chain. 4. Complete the lab by successfully participating in the simulated consensus mechanism." onReset={reset} compact>
      
      <Celebration isActive={hasWon} message="Chain Restored! You saw how altering one block invalidates all subsequent blocks, requiring immense computational power (mining) to rewrite history." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Main SVG Area with HTML Overlays for Interaction */}
        <div className="flex-1 bg-white rounded-3xl overflow-x-auto overflow-y-hidden relative border border-slate-300 shadow-sm flex items-center justify-center">
          
          <div className="w-full max-w-5xl aspect-[2.2] relative">
            <BlockchainSVG blocks={blocks} onMine={handleMine} />

            {/* HTML Overlays for Inputs and Buttons to perfectly match SVG coordinates */}
            {/* Very robust way to make SVG text editable */}
            {blocks.map((b, i) => {
              const xOffsetPercent = 5.5 + (i * 31.1); // carefully mapped percentages to match SVG viewbox
              return (
                <div key={`overlay-${b.id}`} className="absolute top-[42%] w-[20%] h-[12%]" style={{ left: `${xOffsetPercent}%` }}>
                  <input 
                    type="text" 
                    value={b.data}
                    onChange={(e) => handleDataChange(b.id, e.target.value)}
                    className="w-full h-full bg-transparent text-transparent caret-slate-900 outline-none cursor-text absolute inset-0 z-10"
                    title="Edit Block Data"
                  />
                </div>
              );
            })}

            {/* Mining Buttons Overlay */}
            {blocks.map((b, i) => {
              if (b.valid) return null;
              const xOffsetPercent = 10.5 + (i * 31.1);
              return (
                <button 
                  key={`mine-${b.id}`}
                  onClick={() => handleMine(b.id)}
                  className="absolute top-[77%] w-[11%] h-[6%] bg-rose-500 hover:bg-rose-400 rounded-full text-white font-black text-[10px] sm:text-xs z-20 flex items-center justify-center gap-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] shadow-rose-500/50 transition-all hover:scale-110"
                  style={{ left: `${xOffsetPercent}%` }}
                >
                  <Pickaxe size={14} /> MINE
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Hint Bar ─────────────────────────────────────────────────── */}
        <div className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm">
          <span className="text-2xl shrink-0">{hint.icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step {hint.step} — Hint</span>
            <span className="text-sm font-semibold text-slate-700 leading-snug">{hint.text}</span>
          </div>
        </div>

      </div>
    </LabShell>
  );
}
