"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Smartphone, Lock, Unlock, ShieldCheck, AlertCircle } from "lucide-react";

// ─── SVG 2FA Visualizer ───────────────────────────────────────────────────────

type Phase = "IDLE" | "SUCCESS" | "ERROR";

function MfaSVG({ phase, currentTotp, timeLeft }: { phase: Phase; currentTotp: string; timeLeft: number }) {
  const isUnlocked = phase === "SUCCESS";
  
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-mfa">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridMfa" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridMfa)" />

      {/* ── Left Side: The Vault (Server) ── */}
      <g transform="translate(250, 250)">
        {/* Massive Vault Door */}
        <rect x="-150" y="-150" width="300" height="300" fill="#0f172a" rx="20" stroke="#334155" strokeWidth="8" />
        <circle cx="0" cy="0" r="100" fill="#020617" stroke="#475569" strokeWidth="6" />
        <text x="0" y="-110" fill="#94a3b8" fontSize="20" fontWeight="black" textAnchor="middle" letterSpacing="4">SECURE VAULT</text>

        {/* Lock Status */}
        <g transform="translate(0, 0)">
          {isUnlocked ? (
             <g>
               <circle cx="0" cy="0" r="40" fill="#064e3b" stroke="#10b981" strokeWidth="4" filter="url(#glow-mfa)" />
               <path d="M -15,5 L -5,15 L 20,-10" fill="none" stroke="#10b981" strokeWidth="6" />
               <text x="0" y="65" fill="#34d399" fontSize="16" fontWeight="bold" textAnchor="middle" filter="url(#glow-mfa)">ACCESS GRANTED</text>
             </g>
          ) : (
             <g>
               <rect x="-30" y="-10" width="60" height="40" fill="#4c0519" rx="8" stroke="#ef4444" strokeWidth="4" />
               <path d="M -15,-10 C -15,-30 15,-30 15,-10" fill="none" stroke="#ef4444" strokeWidth="6" />
               <text x="0" y="55" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle">AWAITING 2FA TOKEN</text>
             </g>
          )}
        </g>

        {/* Vault Open Animation */}
        {isUnlocked && (
           <motion.circle cx="0" cy="0" r="90" fill="#34d399" opacity="0.2" initial={{ scale: 0 }} animate={{ scale: 1 }} filter="url(#glow-mfa)" />
        )}
      </g>

      {/* ── Right Side: The User's Physical Device (Phone) ── */}
      <g transform="translate(700, 250)">
        <rect x="-70" y="-140" width="140" height="280" fill="#1e1b4b" rx="24" stroke="#a855f7" strokeWidth="4" />
        
        {/* Screen */}
        <rect x="-60" y="-120" width="120" height="240" fill="#020617" rx="12" />
        
        {/* Notch */}
        <rect x="-20" y="-120" width="40" height="15" fill="#1e1b4b" rx="4" />

        <text x="0" y="-80" fill="#c084fc" fontSize="14" fontWeight="bold" textAnchor="middle">Authenticator</text>
        <text x="0" y="-60" fill="#93c5fd" fontSize="10" textAnchor="middle">Secure Vault App</text>
        
        {/* The rotating TOTP Token */}
        <rect x="-50" y="-30" width="100" height="50" fill="#064e3b" rx="8" stroke="#10b981" strokeWidth="2" filter="url(#glow-mfa)" />
        <text x="0" y="2" fill="#a7f3d0" fontSize="24" fontWeight="black" textAnchor="middle" letterSpacing="3">
          {currentTotp}
        </text>

        {/* Timer Bar */}
        <g transform="translate(0, 40)">
           <rect x="-50" y="0" width="100" height="6" fill="#1e293b" rx="3" />
           {/* We tie the width to the timeLeft prop so it moves smoothly in react */}
           <rect x="-50" y="0" width={(timeLeft / 15) * 100} height="6" fill={timeLeft < 4 ? "#ef4444" : "#c084fc"} rx="3" style={{ transition: "width 0.1s linear, fill 0.5s" }} />
           <text x="0" y="25" fill={timeLeft < 4 ? "#ef4444" : "#94a3b8"} fontSize="10" fontWeight="bold" textAnchor="middle" className={timeLeft < 4 ? "animate-pulse" : ""}>
             Refreshes in {timeLeft}s
           </text>
        </g>
      </g>

      {/* ── Visual Error ── */}
      <AnimatePresence>
         {phase === "ERROR" && (
            <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transform="translate(450, 420)">
               <rect x="-100" y="-20" width="200" height="40" fill="#4c0519" rx="8" stroke="#ef4444" strokeWidth="2" filter="url(#glow-mfa)" />
               <text x="0" y="4" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">INVALID OR EXPIRED TOKEN</text>
            </motion.g>
         )}
      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function TwoFactorAuth9() {
  const { reportComplete } = useLMSBridge("twofactorauth9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("IDLE");
  const [currentTotp, setCurrentTotp] = useState("123456");
  const [timeLeft, setTimeLeft] = useState(15);
  const [inputValue, setInputValue] = useState("");
  const [hasWon, setHasWon] = useState(false);

  // Timer & Code Generation
  useEffect(() => {
    const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set initial code
    setCurrentTotp(generateCode());

    // 1-second tick
    const interval = setInterval(() => {
       setTimeLeft(prev => {
          if (prev <= 1) {
             playPop(); // Tick sound on refresh
             setCurrentTotp(generateCode());
             return 15; // Reset timer to 15 seconds
          }
          return prev - 1;
       });
    }, 1000);

    return () => clearInterval(interval);
  }, [playPop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "SUCCESS") return;

    if (inputValue === currentTotp) {
       setPhase("SUCCESS");
       playSuccess();
       setInputValue("");
       if (!hasWon) {
          setHasWon(true);
          setTimeout(reportComplete, 1500);
       }
    } else {
       setPhase("ERROR");
       playError();
       setInputValue("");
       setTimeout(() => {
          setPhase("IDLE");
       }, 2000);
    }
  };

  return (
    <LabShell labId="twofactorauth9" theme="cosmos" title="Multi-Factor Authentication" subtitle="L41 · Security Architecture"
      instruction="A hacker stole your password! But they don't have your physical phone. Look at the Authenticator App on the screen. It generates a new Time-Based One-Time Password (TOTP) every 15 seconds. Type the code quickly into the portal before it expires!" compact>
      
      <Celebration isActive={hasWon} message="Vault Unlocked! Because the token changes every 15 seconds, stolen codes are completely useless to hackers. They would physically need to steal your phone to gain access." onReplay={() => {
         setPhase("IDLE"); setHasWon(false); setInputValue("");
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls (The Login Portal) */}
        <div className="shrink-0 panel-glass rounded-2xl border-purple-900/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-2 text-rose-500 font-bold text-xs bg-rose-950/50 rounded-bl-xl border-b border-l border-rose-900/50">
             [Alert] Hacker intercepted password: 'hunter2'
          </div>

          <div className="flex flex-col gap-1 w-full md:w-1/3">
             <h3 className="text-purple-400 font-black flex items-center gap-2 uppercase tracking-wide">
                <Lock size={18} /> Vault Login Portal
             </h3>
             <p className="text-zinc-400 text-xs">Enter your 6-digit Authenticator code to verify your identity.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 w-full flex items-center gap-3">
             <input 
                type="text"
                placeholder="******"
                maxLength={6}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))} // only numbers
                disabled={phase === "SUCCESS"}
                className="flex-1 h-14 bg-black/60 border-2 border-purple-500/50 rounded-xl text-center text-white font-black text-2xl tracking-[0.5em] focus:outline-none focus:border-purple-400 placeholder:text-zinc-700"
             />
             <button 
                type="submit"
                disabled={inputValue.length !== 6 || phase === "SUCCESS"}
                className="h-14 px-8 rounded-xl font-black bg-purple-600/20 border-2 border-purple-500/50 text-purple-400 hover:bg-purple-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
             >
                <ShieldCheck size={20}/> Verify
             </button>
          </form>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-purple-900/40 bg-[#04020a] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <MfaSVG phase={phase} currentTotp={currentTotp} timeLeft={timeLeft} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
