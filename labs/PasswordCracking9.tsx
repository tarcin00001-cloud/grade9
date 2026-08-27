"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Unlock, BookOpen, Activity, AlertCircle } from "lucide-react";

// ─── SVG Password Cracker Visualizer ──────────────────────────────────────────

function CrackerSVG({
  mode,
  targetHash,
  currentAttempt,
  isCracking,
  isCracked
}: {
  mode: "DICTIONARY" | "BRUTE_FORCE";
  targetHash: string;
  currentAttempt: string;
  isCracking: boolean;
  isCracked: boolean;
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-crack">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridHash" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridHash)" />

      {/* ── 1. The Target Vault (Top Right) ── */}
      <g transform="translate(550, 150)">
        <rect x="0" y="0" width="250" height="120" fill="#f8fafc" rx="12" stroke={isCracked ? "#10b981" : "#ef4444"} strokeWidth="4" filter={isCracked ? "url(#glow-crack)" : "none"} style={{ transition: "all 0.5s" }} />
        <text x="125" y="30" fill="#0f172a" fontSize="16" fontWeight="bold" textAnchor="middle">TARGET HASH</text>
        <text x="125" y="60" fill="#475569" fontSize="14" fontFamily="monospace" textAnchor="middle">{targetHash}</text>
        
        {/* Lock Icon */}
        <circle cx="125" cy="90" r="15" fill={isCracked ? "#10b981" : "#ef4444"} />
        {!isCracked && <path d="M 115,85 C 115,70 135,70 135,85" fill="none" stroke="#be123c" strokeWidth="3" />}
        {isCracked && <path d="M 125,85 C 125,70 145,70 145,85" fill="none" stroke="#047857" strokeWidth="3" />}
      </g>

      {/* ── 2. The Attack Engine (Left) ── */}
      <g transform="translate(100, 100)">
        <rect x="0" y="0" width="300" height="250" fill="#f3e8ff" rx="16" stroke="#c084fc" strokeWidth="4" />
        <text x="150" y="40" fill="#6b21a8" fontSize="20" fontWeight="black" textAnchor="middle">ATTACK ENGINE</text>
        <text x="150" y="65" fill="#7e22ce" fontSize="12" fontWeight="bold" textAnchor="middle">{mode === "DICTIONARY" ? "Wordlist Mode" : "Combinatorial Generator"}</text>

        {/* Engine Window */}
        <rect x="30" y="90" width="240" height="120" fill="#ffffff" rx="8" stroke="#d8b4fe" strokeWidth="2" />
        
        {/* Current Guess Slot Machine Effect */}
        <text x="150" y="145" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle">CURRENT GUESS:</text>
        
        <g transform="translate(150, 180)">
          <rect x="-100" y="-25" width="200" height="40" fill="#f1f5f9" rx="4" />
          <text x="0" y="5" fill="#d97706" fontSize="24" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            {currentAttempt}
          </text>
        </g>
      </g>

      {/* ── 3. The Computation Laser (Middle) ── */}
      {isCracking && (
        <motion.path 
          d="M 400,210 L 550,210" 
          fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="10 10"
          className="animate-[dash_0.1s_linear_infinite]"
        />
      )}
      
      {/* Hash Collision Spark */}
      <AnimatePresence>
        {isCracked && (
          <motion.circle 
            cx="550" cy="210" r="30" fill="#34d399"
            initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      {/* Dictionary visual cue */}
      {mode === "DICTIONARY" && (
        <path d="M 50,200 L 100,200" fill="none" stroke="#c084fc" strokeWidth="20" strokeDasharray="5 5" className="animate-[dash_0.5s_linear_infinite]" />
      )}
      
      {/* Brute Force visual cue (Gears) */}
      {mode === "BRUTE_FORCE" && (
        <g transform="translate(50, 200)">
          <path d="M -15,-15 L 15,-15 L 15,15 L -15,15 Z" fill="none" stroke="#c084fc" strokeWidth="4" strokeDasharray="4 4" className={isCracking ? "animate-[spin_0.2s_linear_infinite]" : ""} />
        </g>
      )}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

// Simple hash for visual
const sha256_mock = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return Math.abs(hash).toString(16).padStart(16, '0');
};

const DICTIONARY = ["admin", "password123", "qwerty", "iloveyou", "dragon", "baseball"];

export default function PasswordCracking9() {
  const { reportComplete } = useLMSBridge("passwordcracking9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<"DICTIONARY" | "BRUTE_FORCE">("DICTIONARY");
  const [targetPassword, setTargetPassword] = useState("dragon");
  const [targetHash, setTargetHash] = useState(sha256_mock("dragon"));
  
  const [currentAttempt, setCurrentAttempt] = useState("WAITING...");
  const [isCracking, setIsCracking] = useState(false);
  const [isCracked, setIsCracked] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update hash when target changes
  useEffect(() => {
    setTargetHash(sha256_mock(targetPassword));
    setIsCracked(false);
    setCurrentAttempt("WAITING...");
  }, [targetPassword]);

  const startCracking = () => {
    if (isCracking || isCracked || !targetPassword) return;
    setIsCracking(true);
    playZap();

    let attempts = 0;

    if (mode === "DICTIONARY") {
      // Run through dictionary quickly
      intervalRef.current = setInterval(() => {
        if (attempts >= DICTIONARY.length) {
          stopCracking(false); // Failed
          return;
        }
        
        const guess = DICTIONARY[attempts];
        setCurrentAttempt(guess);
        if (attempts % 2 === 0) playPop();

        if (guess === targetPassword) {
          stopCracking(true);
        }
        attempts++;
      }, 300);

    } else {
      // Brute Force (simulate trying aaaaaa... )
      // We will visually scramble letters, then either eventually "find" it if short, or fail if long.
      intervalRef.current = setInterval(() => {
        attempts++;
        
        // Generate random string of same length for visual slot machine effect
        let randGuess = "";
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        for(let i=0; i<targetPassword.length; i++) randGuess += chars.charAt(Math.floor(Math.random() * chars.length));
        
        setCurrentAttempt(randGuess);
        if (attempts % 5 === 0) playPop();

        // Simulate success probability based on length
        // Short passwords (<= 4 chars) crack quickly. Long ones take "forever"
        if (targetPassword.length <= 4 && attempts > 40) {
           setCurrentAttempt(targetPassword);
           stopCracking(true);
        } else if (attempts > 100) {
           setCurrentAttempt("TIME LIMIT EXCEEDED");
           stopCracking(false);
        }
      }, 50); // Very fast tick
    }
  };

  const stopCracking = (success: boolean) => {
    setIsCracking(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (success) {
      setIsCracked(true);
      playSuccess();
      if (!hasWon) {
        setHasWon(true);
        setTimeout(reportComplete, 1500);
      }
    } else {
      playError();
    }
  };

  const reset = () => {
    stopCracking(false);
    setIsCracked(false);
    setCurrentAttempt("WAITING...");
    setHasWon(false);
  };

  return (
    <LabShell labId="passwordcracking9" theme="cosmos" title="Password Cracking Physics" 
      onReset={reset}
      instruction="1. Understand the different methods of password cracking (e.g., brute force, dictionary). 2. Set up the password cracking simulation with varying password complexities. 3. Observe the time and computational power required for each cracking attempt. 4. Implement stronger password policies to secure the simulated system." compact>
      
      <Celebration isActive={hasWon} message="Hash Collision! The engine generated an input that perfectly matched the target hash. You can see why short or common passwords are mathematically unsafe." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-slate-500 text-xs font-bold mb-1">Set Target Password</label>
              <input 
                type="text" 
                value={targetPassword}
                onChange={(e) => {
                  setTargetPassword(e.target.value);
                  reset();
                }}
                disabled={isCracking}
                className="w-32 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-slate-500 text-xs font-bold mb-1">Attack Engine</label>
              <select 
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as "DICTIONARY" | "BRUTE_FORCE");
                  reset();
                }}
                disabled={isCracking}
                className="w-40 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold text-sm focus:outline-none"
              >
                <option value="DICTIONARY">Dictionary</option>
                <option value="BRUTE_FORCE">Brute Force</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={startCracking} 
            disabled={isCracking || isCracked || !targetPassword}
            className={`px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all border-2 ${isCracking || isCracked ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200 hover:scale-[1.02] shadow-sm"}`}
          >
            <Unlock size={18}/> Initiate Attack
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 bg-white rounded-3xl overflow-x-auto overflow-y-hidden relative border-2 border-slate-200 shadow-xl flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <CrackerSVG mode={mode} targetHash={targetHash} currentAttempt={currentAttempt} isCracking={isCracking} isCracked={isCracked} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
