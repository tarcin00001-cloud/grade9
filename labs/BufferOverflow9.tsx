"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Terminal, ShieldAlert, Bug } from "lucide-react";

// ─── SVG Buffer Overflow Visualizer ───────────────────────────────────────────

function BufferOverflowSVG({
  inputStr,
  phase
}: {
  inputStr: string;
  phase: "IDLE" | "WRITING" | "OVERFLOWED" | "CRASHED";
}) {
  const isOverflowed = phase === "OVERFLOWED" || phase === "CRASHED";
  
  // The buffer holds exactly 8 characters. Anything more overflows upwards into the Return Address.
  const bufferChars = inputStr.substring(0, 8);
  const overflowChars = inputStr.substring(8); // This is what overrides the return address

  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-bad">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridMem" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridMem)" />

      {/* ── 1. Execution Flow (Left) ── */}
      <g transform="translate(100, 100)">
        <rect x="0" y="0" width="200" height="60" fill="#064e3b" rx="8" stroke="#10b981" strokeWidth="2" />
        <text x="100" y="35" fill="#a7f3d0" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">main() function</text>

        {/* Execution Path (Normal) */}
        {!isOverflowed && (
          <path d="M 200,30 L 400,30 L 400,100" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="6 6" />
        )}

        {/* Execution Path (Hijacked) */}
        {phase === "CRASHED" && (
          <path d="M 200,30 L 300,30 L 300,-50 L 400,-50 L 400,30" fill="none" stroke="#f43f5e" strokeWidth="4" strokeDasharray="6 6" className="animate-[dash_0.5s_linear_infinite]" filter="url(#glow-bad)" />
        )}
      </g>
      
      {/* Hijacked Target Code */}
      <g transform="translate(300, 20)">
        <rect x="0" y="0" width="200" height="60" fill="#4c0519" rx="8" stroke="#f43f5e" strokeWidth="2" opacity={phase === "CRASHED" ? 1 : 0.2} style={{ transition: "all 0.5s" }} />
        <text x="100" y="35" fill="#fca5a5" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">hacker_shell()</text>
      </g>

      {/* ── 2. Memory Stack (Right) ── */}
      <g transform="translate(550, 100)">
        <text x="100" y="-20" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle">SYSTEM MEMORY STACK</text>
        
        {/* Stack Container */}
        <rect x="0" y="0" width="200" height="300" fill="#f8fafc" rx="8" stroke="#cbd5e1" strokeWidth="4" />

        {/* High Memory (Return Address) */}
        <rect x="20" y="30" width="160" height="50" fill={isOverflowed ? "#ef4444" : "#e2e8f0"} rx="4" stroke={isOverflowed ? "#fca5a5" : "#94a3b8"} strokeWidth="2" filter={isOverflowed ? "url(#glow-bad)" : "none"} style={{ transition: "all 0.3s" }} />
        <text x="100" y="50" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Return Address Pointer</text>
        
        {/* If Overflowed, the text here physically changes to the spilled characters */}
        {isOverflowed && overflowChars ? (
          <text x="100" y="70" fill="#fff" fontSize="16" fontWeight="black" fontFamily="monospace" textAnchor="middle" filter="url(#glow-bad)">{overflowChars.substring(0, 8)}</text>
        ) : (
          <text x="100" y="70" fill="#059669" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">0x80484b6</text>
        )}

        {/* Gap */}
        <line x1="20" y1="100" x2="180" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />

        {/* Low Memory (The Buffer) */}
        <rect x="20" y="120" width="160" height="150" fill="#f1f5f9" rx="4" stroke="#0ea5e9" strokeWidth="2" />
        <text x="100" y="140" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">Local Buffer [8 chars]</text>

        {/* Render characters written into the buffer visually stacking from bottom up */}
        {bufferChars.split('').map((char, i) => {
          // Bottom up packing
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 35 + col * 35;
          const y = 240 - row * 40;
          return (
            <motion.g key={`char-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <rect x={x} y={y} width="30" height="30" fill="#22d3ee" rx="4" />
              <text x={x+15} y={y+20} fill="#fff" fontSize="16" fontWeight="black" fontFamily="monospace" textAnchor="middle">{char}</text>
            </motion.g>
          );
        })}

        {/* The Overflow Breaking visual */}
        {isOverflowed && (
          <path d="M 20,120 L 50,100 L 80,120 L 110,90 L 140,120 L 180,95" fill="none" stroke="#f43f5e" strokeWidth="4" />
        )}

      </g>
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function BufferOverflow9() {
  const { reportComplete } = useLMSBridge("bufferoverflow9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [inputStr, setInputStr] = useState("");
  const [phase, setPhase] = useState<"IDLE" | "WRITING" | "OVERFLOWED" | "CRASHED">("IDLE");
  const [hasWon, setHasWon] = useState(false);

  const safeInput = "HELLO";
  const maliciousInput = "AAAAAAAA\xEF\xBE\xAD\xDE"; // 8 A's to fill buffer, then memory address

  const submitInput = (str: string) => {
    if (phase !== "IDLE") return;
    setPhase("WRITING");
    
    // Simulate typing character by character visually
    let current = "";
    let i = 0;
    const interval = setInterval(() => {
      current += str[i];
      setInputStr(current);
      playPop();
      
      i++;
      
      if (i > 8) {
         // Uh oh, overflow!
         playError();
         setPhase("OVERFLOWED");
      }

      if (i >= str.length) {
        clearInterval(interval);
        
        setTimeout(() => {
          if (str.length > 8) {
            setPhase("CRASHED");
            playZap();
            if (!hasWon) {
              setHasWon(true);
              setTimeout(() => {
                playSuccess();
                reportComplete();
              }, 1500);
            }
          } else {
            setPhase("IDLE");
            setTimeout(() => setInputStr(""), 2000);
          }
        }, 1000);
      }
    }, 150);
  };

  const reset = () => {
    setPhase("IDLE");
    setInputStr("");
    setHasWon(false);
  };

  return (
    <LabShell labId="bufferoverflow9" theme="ocean" title="Buffer Overflow Hijacking"
      instruction="1. Learn how buffer overflow vulnerabilities occur in memory management. 2. Analyze the vulnerable C-code provided in the interactive sandbox. 3. Craft a malicious payload to overflow the buffer and hijack the execution flow. 4. Implement bounds checking in the code to secure the application against the attack." compact
      onReset={reset}>
      
      <Celebration isActive={hasWon} message="Execution Hijacked! The excess bytes spilled upwards in memory, directly overwriting the CPU's Return Pointer. When the function ended, it jumped to your injected malicious address instead of returning safely." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 bg-white shadow-sm border border-slate-300 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <Terminal className="text-rose-600" size={24} />
            <div>
              <p className="text-rose-700 font-black text-sm uppercase tracking-wider">C Program Input (`gets`)</p>
              <p className="text-slate-600 text-xs font-medium">Feed data into the vulnerable 8-byte buffer.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => submitInput(safeInput)} 
              disabled={phase !== "IDLE"}
              className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 w-full md:w-auto ${phase === "IDLE" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:scale-[1.02]" : "bg-gray-800 border-gray-700 text-gray-500"}`}
            >
              <ShieldAlert size={18}/> Send Safe Data (5 bytes)
            </button>
            <button 
              onClick={() => submitInput(maliciousInput)} 
              disabled={phase !== "IDLE"}
              className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 w-full md:w-auto ${phase === "IDLE" ? "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:scale-[1.02] shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "bg-gray-800 border-gray-700 text-gray-500"}`}
            >
              <Bug size={18}/> Inject Exploit (12 bytes)
            </button>
          </div>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 bg-white shadow-sm border-2 border-slate-300 rounded-3xl overflow-x-auto overflow-y-hidden relative flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <BufferOverflowSVG inputStr={inputStr} phase={phase} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
