"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldAlert, KeyRound, ArrowRight, Lock, Unlock } from "lucide-react";

// ─── SVG Asymmetric Crypto Architecture ───────────────────────────────────────

function CryptoSVG({
  phase
}: {
  phase: "IDLE" | "ALICE_LOCK" | "TRANSIT" | "ATTACKER" | "BOB_UNLOCK" | "DONE"
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-key">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-danger">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridCrypto" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
        <linearGradient id="laser" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>



      {/* ── 1. Alice (Sender) ── */}
      <g transform="translate(50, 100)">
        <rect x="0" y="0" width="200" height="300" fill="#0f172a" rx="16" stroke="#ec4899" strokeWidth="3" />
        <text x="100" y="35" fill="#fbcfe8" fontSize="18" fontWeight="black" textAnchor="middle">Alice's Computer</text>
        
        {/* Bob's Public Key (Floating component to be "used") */}
        <g transform={phase === "IDLE" ? "translate(20, 60)" : "translate(20, -500)"} style={{ transition: "all 0.5s ease" }}>
           <rect width="160" height="50" fill="#1e1b4b" rx="25" stroke="#d946ef" strokeWidth="2" filter="url(#glow-key)" />
           <circle cx="25" cy="25" r="15" fill="#d946ef" />
           <path d="M 25,18 C 25,12 35,12 35,18 L 35,22 L 20,22 L 20,18 Z M 20,22 L 40,22 L 40,32 L 20,32 Z" fill="#fff" transform="translate(-10, -5)" />
           <text x="100" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" textAnchor="middle">Bob's Public Key</text>
        </g>

        {/* Message Box */}
        <rect x="40" y="150" width="120" height="100" fill="#1e293b" rx="8" stroke="#cbd5e1" strokeWidth="2" />
        <text x="100" y="205" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">"Hello Bob!"</text>
        
        {/* Lock Animation */}
        <AnimatePresence>
          {(phase === "ALICE_LOCK" || phase === "TRANSIT" || phase === "ATTACKER" || phase === "BOB_UNLOCK" || phase === "DONE") && (
             <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
               <rect x="80" y="190" width="40" height="30" fill="#d946ef" rx="4" filter="url(#glow-key)" />
               <path d="M 90,190 C 90,170 110,170 110,190" fill="none" stroke="#d946ef" strokeWidth="6" />
               <text x="100" y="210" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">LOCKED</text>
             </motion.g>
          )}
        </AnimatePresence>
      </g>

      {/* ── 2. The Internet (Transit) ── */}
      <g transform="translate(250, 250)">
        <path d="M 0,0 L 400,0" fill="none" stroke="#334155" strokeWidth="12" strokeDasharray="20 10" className="animate-[dash_1s_linear_infinite]" />
      </g>

      {/* Animated Message in Transit */}
      <AnimatePresence>
        {(phase === "TRANSIT" || phase === "ATTACKER") && (
          <motion.g 
            initial={{ x: 250, y: 200 }} 
            animate={{ x: phase === "ATTACKER" ? 400 : 650, y: phase === "ATTACKER" ? 120 : 200 }} 
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <rect x="0" y="0" width="80" height="60" fill="#1e293b" rx="6" stroke="#d946ef" strokeWidth="3" filter="url(#glow-key)" />
            <rect x="20" y="15" width="40" height="30" fill="#d946ef" rx="4" />
            <path d="M 30,15 C 30,-5 50,-5 50,15" fill="none" stroke="#d946ef" strokeWidth="6" />
            <text x="40" y="60" fill="#d946ef" fontSize="12" fontWeight="black" textAnchor="middle">ENCRYPTED</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* ── 3. Eve (Attacker) ── */}
      <g transform="translate(350, 20)">
        <rect x="0" y="0" width="180" height="120" fill="#2a111a" rx="12" stroke="#e11d48" strokeWidth="3" />
        <text x="90" y="30" fill="#fda4af" fontSize="14" fontWeight="black" textAnchor="middle">Eve (Attacker)</text>
        
        {/* Attacker Intercept & Laser Attack */}
        {phase === "ATTACKER" && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Tractor beam pulling data */}
            <path d="M 90,120 L 50,220 L 130,220 Z" fill="url(#laser)" opacity="0.3" className="animate-pulse" />
            
            <rect x="10" y="50" width="160" height="60" fill="#4c0519" rx="6" stroke="#f43f5e" strokeWidth="2" />
            <text x="90" y="75" fill="#fb7185" fontSize="10" fontWeight="bold" textAnchor="middle">BRUTE FORCE DECRYPT</text>
            <text x="90" y="95" fill="#fca5a5" fontSize="14" fontFamily="monospace" fontWeight="black" textAnchor="middle" filter="url(#glow-danger)">ERROR: NO PRIV_KEY</text>
          </motion.g>
        )}
      </g>

      {/* ── 4. Bob (Receiver) ── */}
      <g transform="translate(650, 100)">
        <rect x="0" y="0" width="200" height="300" fill="#0f172a" rx="16" stroke="#d946ef" strokeWidth="3" />
        <text x="100" y="35" fill="#93c5fd" fontSize="18" fontWeight="black" textAnchor="middle">Bob's Computer</text>
        
        {/* Bob's Private Key */}
        <g transform={phase === "BOB_UNLOCK" ? "translate(20, 60)" : phase === "DONE" ? "translate(20, -500)" : "translate(20, 60)"} style={{ transition: "all 0.5s ease" }}>
           <rect width="160" height="50" fill="#1e3a8a" rx="25" stroke="#10b981" strokeWidth="2" filter="url(#glow-key)" />
           <circle cx="25" cy="25" r="15" fill="#34d399" />
           <path d="M 25,18 C 25,12 35,12 35,18 L 35,22 L 20,22 L 20,18 Z" fill="none" stroke="#fff" strokeWidth="3" transform="translate(-10, -5)" />
           <path d="M 20,22 L 40,22 L 40,32 L 20,32 Z" fill="#fff" transform="translate(-10, -5)" />
           <text x="100" y="30" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle">Bob's Private Key</text>
        </g>

        {/* Message Box Arrived */}
        <AnimatePresence>
          {(phase === "BOB_UNLOCK" || phase === "DONE") && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <rect x="40" y="150" width="120" height="100" fill="#1e293b" rx="8" stroke={phase === "DONE" ? "#10b981" : "#cbd5e1"} strokeWidth="2" />
              
              {phase === "BOB_UNLOCK" ? (
                <g>
                  <rect x="80" y="190" width="40" height="30" fill="#d946ef" rx="4" filter="url(#glow-key)" />
                  <path d="M 90,190 C 90,170 110,170 110,190" fill="none" stroke="#d946ef" strokeWidth="6" />
                </g>
              ) : (
                <g>
                  <text x="100" y="205" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">"Hello Bob!"</text>
                  <rect x="80" y="210" width="40" height="30" fill="#34d399" rx="4" filter="url(#glow-key)" />
                  <path d="M 90,210 C 90,190 110,190 110,210" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="4 4" />
                </g>
              )}
            </motion.g>
          )}
        </AnimatePresence>

      </g>
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function AsymmetricCrypto9() {
  const { reportComplete } = useLMSBridge("asymmetriccrypto9");
  const { playPop, playSuccess, playZap, playError, playChime } = useLabAudio();

  const [phase, setPhase] = useState<"IDLE" | "ALICE_LOCK" | "TRANSIT" | "ATTACKER" | "BOB_UNLOCK" | "DONE">("IDLE");
  const [hasWon, setHasWon] = useState(false);

  const step1_encrypt = () => {
    if (phase !== "IDLE") return;
    playZap();
    setPhase("ALICE_LOCK");
  };

  const step2_transmit = () => {
    if (phase !== "ALICE_LOCK") return;
    playPop();
    setPhase("TRANSIT");
    
    setTimeout(() => {
      playError();
      setPhase("ATTACKER");
      
      setTimeout(() => {
        playPop();
        setPhase("BOB_UNLOCK");
      }, 2000);
    }, 1500);
  };

  const step3_decrypt = () => {
    if (phase !== "BOB_UNLOCK") return;
    playChime();
    setPhase("DONE");
    setHasWon(true);
    setTimeout(reportComplete, 1500);
  };

  const resetLab = () => {
    setPhase("IDLE");
    setHasWon(false);
    if (playPop) playPop();
  };

  return (
    <LabShell labId="asymmetriccrypto9" theme="studio" title="Asymmetric Cryptography"
      instruction="1. Learn the concepts of public and private keys in asymmetric cryptography. 2. Generate a key pair and share the public key in the simulation. 3. Encrypt a secret message using the recipient's public key. 4. Decrypt the received message using your private key to reveal the text." compact
      onReset={resetLab}>
      
      <Celebration isActive={hasWon} message="Secure Transmission! You physically stepped through the cryptography that protects the entire internet." onReplay={resetLab} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Step Controls */}
        <div className="shrink-0 bg-white rounded-2xl border-2 border-slate-800/20 shadow-none p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <button 
            onClick={step1_encrypt} 
            disabled={phase !== "IDLE"}
            className={`flex-1 rounded-xl p-3 font-black text-sm flex items-center justify-center gap-2 transition-all w-full border-2 ${phase === "IDLE" ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-700 hover:scale-[1.02]" : "bg-white border-slate-400 text-slate-700 hover:bg-slate-200"}`}
          >
            <Lock size={16}/> 1. Apply Public Key
          </button>
          
          <button 
            onClick={step2_transmit} 
            disabled={phase !== "ALICE_LOCK"}
            className={`flex-1 rounded-xl p-3 font-black text-sm flex items-center justify-center gap-2 transition-all w-full border-2 ${phase === "ALICE_LOCK" ? "bg-pink-500/20 border-pink-500/50 text-pink-700 hover:scale-[1.02]" : "bg-white border-slate-400 text-slate-700 hover:bg-slate-200"}`}
          >
            <ArrowRight size={16}/> 2. Transmit Packet
          </button>
          
          <button 
            onClick={step3_decrypt} 
            disabled={phase !== "BOB_UNLOCK"}
            className={`flex-1 rounded-xl p-3 font-black text-sm flex items-center justify-center gap-2 transition-all w-full border-2 ${phase === "BOB_UNLOCK" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-700 hover:scale-[1.02]" : "bg-white border-slate-400 text-slate-700 hover:bg-slate-200"}`}
          >
            <Unlock size={16}/> 3. Apply Private Key
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 bg-white rounded-3xl overflow-x-auto overflow-y-hidden relative border-2 border-slate-800/20 shadow-none flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <CryptoSVG phase={phase} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
