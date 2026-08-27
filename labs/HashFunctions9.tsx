"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { FileCode2, ArrowRight, Hash } from "lucide-react";

// ─── SVG Hash Avalanche Visualizer ───────────────────────────────────────────

function HashAvalancheSVG({
  inputStr,
  hashOutput,
  avalancheActive
}: {
  inputStr: string;
  hashOutput: string;
  avalancheActive: boolean;
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-char">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-beam">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Grid */}
      <pattern id="hashGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5"/>
      </pattern>
      <rect width="900" height="500" fill="url(#hashGrid)" />

      {/* ── 1. Input Block (Left) ── */}
      <g transform="translate(100, 200)">
        <text x="100" y="-30" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle">Input String</text>
        <rect x="0" y="0" width="200" height="60" fill="transparent" rx="8" stroke="#3b82f6" strokeWidth="3" />
        
        {/* Render input characters visually */}
        <text x="100" y="38" fill="#0f172a" fontSize="24" fontFamily="monospace" fontWeight="black" textAnchor="middle" letterSpacing="4">
          {inputStr}
        </text>

        {/* Highlight the changed letter if active */}
        {avalancheActive && (
          <circle cx="150" cy="30" r="25" fill="none" stroke="#f43f5e" strokeWidth="3" filter="url(#glow-char)" />
        )}
      </g>

      {/* ── 2. Chaos Chamber / Avalanche Beams (Middle) ── */}
      {/* 
         If avalanche is active, we generate ~40 chaotic bezier curves erupting from the input side, 
         tangling in the middle, and striking random output positions.
      */}
      <AnimatePresence>
        {avalancheActive && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {Array.from({length: 40}).map((_, i) => {
              // Beams originate from right side of input block
              const startX = 300;
              const startY = 230;
              // Beams land randomly across the height of the output block
              const endX = 550;
              const endY = 100 + (i % 8) * 40; 
              
              // Chaotic control points
              const cp1x = 350 + Math.random() * 100;
              const cp1y = 50 + Math.random() * 400;
              const cp2x = 450 + Math.random() * 100;
              const cp2y = 50 + Math.random() * 400;

              return (
                <motion.path 
                  key={`beam-${i}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: [0, 1], 
                    opacity: [0, 0.8, 0],
                    pathOffset: [0, 1]
                  }}
                  transition={{ duration: 0.4 + Math.random() * 0.4, ease: "easeOut" }}
                  d={`M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`}
                  fill="none" 
                  stroke={Math.random() > 0.5 ? "#f43f5e" : "#8b5cf6"} 
                  strokeWidth="2"
                  filter="url(#glow-beam)"
                />
              );
            })}
            
            <text x="425" y="150" fill="#e11d48" fontSize="18" fontWeight="black" textAnchor="middle" filter="url(#glow-char)">AVALANCHE EFFECT</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* ── 3. Output Hash (Right) ── */}
      <g transform="translate(550, 80)">
        <text x="140" y="-20" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle">SHA-256 Digest</text>
        <rect x="0" y="0" width="280" height="300" fill="transparent" rx="12" stroke="#10b981" strokeWidth="3" />
        
        {/* Render the 64 character hex string in an 8x8 grid */}
        {hashOutput.split('').map((char, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          // During avalanche, randomize characters rapidly
          return (
            <text 
              key={`hash-${i}`} 
              x={30 + col * 30} 
              y={40 + row * 35} 
              fill={avalancheActive ? "#059669" : "#334155"} 
              fontSize="18" 
              fontFamily="monospace" 
              fontWeight="bold" 
              textAnchor="middle"
              filter={avalancheActive ? "url(#glow-char)" : "none"}
            >
              {char}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

// Fast SHA256 simulation (for visual purposes, we just generate a deterministic-looking random 64-char hex string)
const simHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  
  // Seed random with the hash
  let seed = Math.abs(hash);
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  let res = "";
  const hex = "0123456789abcdef";
  for(let i=0; i<64; i++) res += hex[Math.floor(random() * 16)];
  return res;
};

export default function HashFunctions9() {
  const { reportComplete } = useLMSBridge("hashfunctions9");
  const { playPop, playZap, playSuccess } = useLabAudio();

  const baseInput = "PASSWORD123";
  const alteredInput = "PASSWORD124";
  
  const [currentInput, setCurrentInput] = useState(baseInput);
  const [hashOutput, setHashOutput] = useState(simHash(baseInput));
  const [avalancheActive, setAvalancheActive] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const triggerAvalanche = () => {
    if (avalancheActive || hasWon) return;
    
    playZap();
    setAvalancheActive(true);
    setCurrentInput(alteredInput);
    
    // Simulate scramble
    let ticks = 0;
    const scramble = setInterval(() => {
      ticks++;
      // Generate random hex chars visually
      let temp = "";
      const hex = "0123456789abcdef";
      for(let i=0; i<64; i++) temp += hex[Math.floor(Math.random() * 16)];
      setHashOutput(temp);
      
      if (ticks > 15) {
        clearInterval(scramble);
        setHashOutput(simHash(alteredInput)); // Final deterministic hash
        setAvalancheActive(false);
        playSuccess();
        setHasWon(true);
        setTimeout(reportComplete, 1500);
      }
    }, 50);
  };

  return (
    <LabShell labId="hashfunctions9" theme="ocean" title="Cryptographic Hash Functions"
      onReset={() => {
        setCurrentInput(baseInput); setHashOutput(simHash(baseInput)); setHasWon(false); setAvalancheActive(false);
      }}
      instruction="1. Understand the properties of cryptographic hash functions (e.g., one-way, deterministic). 2. Input various data strings into the simulation to generate their hash values. 3. Observe the avalanche effect by making a minor change to the input data. 4. Attempt to find a hash collision to understand the security strength of the algorithm." compact>
      
      <Celebration isActive={hasWon} message="Total Cascade! You changed just 1 bit of input, but over 50% of the output bits completely scrambled. This prevents attackers from guessing patterns." onReplay={() => {
        setCurrentInput(baseInput); setHashOutput(simHash(baseInput)); setHasWon(false);
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 bg-white rounded-2xl border-2 border-rose-300 p-4 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3">
            <Hash className="text-rose-600" size={24} />
            <div>
              <p className="text-rose-800 font-black text-sm uppercase tracking-wider">Mutate Input Block</p>
              <p className="text-slate-700 text-xs">Click the button below to alter the final digit of the string.</p>
            </div>
          </div>
          
          <button 
            onClick={triggerAvalanche} 
            disabled={avalancheActive || hasWon}
            className={`flex-1 rounded-xl p-3 font-black text-sm flex items-center justify-center gap-2 transition-all border-2 ${hasWon ? "bg-stone-100 border-stone-300 text-stone-600 cursor-not-allowed" : "bg-rose-500/10 border-rose-400 text-rose-700 hover:scale-[1.02] hover:bg-rose-500/20"}`}
          >
            Change '3' to '4'
          </button>
        </div>

        {/* Main SVG Area */}
        <div className="flex-1 bg-rose-100 rounded-3xl overflow-x-auto overflow-y-hidden relative border-2 border-slate-300 flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <HashAvalancheSVG 
              inputStr={currentInput} 
              hashOutput={hashOutput} 
              avalancheActive={avalancheActive} 
            />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
