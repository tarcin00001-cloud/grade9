"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Send, Skull, GitCompareArrows } from "lucide-react";

// ─── SVG ARP Spoofing / MitM Visualizer ───────────────────────────────────────

function MitmSVG({
  phase,
  arpPoisoned
}: {
  phase: "IDLE" | "ALICE_SEND" | "EVE_READ" | "EVE_FORWARD" | "BOB_RECEIVE";
  arpPoisoned: boolean;
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-good">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-bad">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridNet" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridNet)" />

      {/* ── Switch Hub (Center) ── */}
      <circle cx="450" cy="250" r="40" fill="#0f172a" stroke="#475569" strokeWidth="4" />
      <circle cx="450" cy="250" r="30" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]" />
      <text x="450" y="255" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">SWITCH</text>

      {/* ── Wires ── */}
      <path d="M 200,250 L 410,250" fill="none" stroke="#334155" strokeWidth="4" />
      <path d="M 700,250 L 490,250" fill="none" stroke="#334155" strokeWidth="4" />
      <path d="M 450,150 L 450,210" fill="none" stroke="#334155" strokeWidth="4" />

      {/* ── 1. Alice (Left) ── */}
      <g transform="translate(50, 200)">
        <rect x="0" y="0" width="150" height="100" fill="#0f172a" rx="8" stroke="#ec4899" strokeWidth="3" />
        <text x="75" y="25" fill="#93c5fd" fontSize="14" fontWeight="bold" textAnchor="middle">Alice</text>
        <text x="75" y="45" fill="#60a5fa" fontSize="10" fontFamily="monospace" textAnchor="middle">IP: .10 | MAC: AA</text>
        
        {/* Alice's ARP Table */}
        <rect x="10" y="60" width="130" height="30" fill="#1e293b" rx="4" />
        <text x="75" y="72" fill="#cbd5e1" fontSize="8" textAnchor="middle">ARP Table (Who is Bob?)</text>
        <text x="75" y="85" fill={arpPoisoned ? "#ef4444" : "#10b981"} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" filter={arpPoisoned ? "url(#glow-bad)" : "none"}>
          Bob(.20) = {arpPoisoned ? "EE (EVE)" : "BB"}
        </text>
      </g>

      {/* ── 2. Bob (Right) ── */}
      <g transform="translate(700, 200)">
        <rect x="0" y="0" width="150" height="100" fill="#0f172a" rx="8" stroke="#10b981" strokeWidth="3" />
        <text x="75" y="25" fill="#6ee7b7" fontSize="14" fontWeight="bold" textAnchor="middle">Bob</text>
        <text x="75" y="45" fill="#34d399" fontSize="10" fontFamily="monospace" textAnchor="middle">IP: .20 | MAC: BB</text>
        
        <rect x="10" y="60" width="130" height="30" fill="#1e293b" rx="4" />
        <text x="75" y="72" fill="#cbd5e1" fontSize="8" textAnchor="middle">ARP Table (Who is Alice?)</text>
        <text x="75" y="85" fill={arpPoisoned ? "#ef4444" : "#10b981"} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" filter={arpPoisoned ? "url(#glow-bad)" : "none"}>
          Alice(.10) = {arpPoisoned ? "EE (EVE)" : "AA"}
        </text>
      </g>

      {/* ── 3. Eve / Attacker (Top) ── */}
      <g transform="translate(375, 50)">
        <rect x="0" y="0" width="150" height="100" fill="#2a111a" rx="8" stroke="#ef4444" strokeWidth="3" filter={arpPoisoned ? "url(#glow-bad)" : "none"} />
        <text x="75" y="25" fill="#fca5a5" fontSize="14" fontWeight="bold" textAnchor="middle">Eve (Attacker)</text>
        <text x="75" y="45" fill="#f87171" fontSize="10" fontFamily="monospace" textAnchor="middle">IP: .99 | MAC: EE</text>
        
        {/* Eve's Terminal / Captured Data */}
        <rect x="10" y="60" width="130" height="30" fill="#4c0519" rx="4" />
        <text x="75" y="72" fill="#fca5a5" fontSize="8" textAnchor="middle">Captured Packets</text>
        <AnimatePresence>
          {(phase === "EVE_READ" || phase === "EVE_FORWARD") && (
            <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} x="75" y="85" fill="#fff" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              "Secret Code 007"
            </motion.text>
          )}
        </AnimatePresence>
      </g>

      {/* ── Packet Animations ── */}
      <AnimatePresence>
        {phase !== "IDLE" && (
          <motion.g
            initial={{ x: 200, y: 250 }}
            animate={
              // Normal Route
              !arpPoisoned ? {
                x: phase === "ALICE_SEND" ? 450 : 700, 
                y: 250
              } : 
              // MitM Route
              {
                x: phase === "ALICE_SEND" ? 450 : phase === "EVE_READ" ? 450 : phase === "EVE_FORWARD" ? 450 : 700,
                y: phase === "ALICE_SEND" ? 250 : phase === "EVE_READ" ? 150 : phase === "EVE_FORWARD" ? 250 : 250
              }
            }
            transition={{ duration: 1, ease: "easeInOut" }}
            exit={{ opacity: 0 }}
          >
            <rect x="-20" y="-15" width="40" height="30" fill={arpPoisoned ? "#ef4444" : "#10b981"} rx="4" filter={arpPoisoned ? "url(#glow-bad)" : "url(#glow-good)"} />
            <text x="0" y="3" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">DATA</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* ARP Broadcast Animation */}
      {arpPoisoned && phase === "IDLE" && (
        <g>
          <motion.path d="M 450,150 L 200,250" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" 
            initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} filter="url(#glow-bad)" />
          <motion.path d="M 450,150 L 700,250" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" 
            initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} filter="url(#glow-bad)" />
          <text x="450" y="190" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle" filter="url(#glow-bad)">BROADCAST: "I AM .20 and .10"</text>
        </g>
      )}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ManInTheMiddle9() {
  const { reportComplete } = useLMSBridge("maninthemiddle9");
  const { playPop, playSuccess, playError, playZap } = useLabAudio();

  const [phase, setPhase] = useState<"IDLE" | "ALICE_SEND" | "EVE_READ" | "EVE_FORWARD" | "BOB_RECEIVE">("IDLE");
  const [arpPoisoned, setArpPoisoned] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const poisonArp = () => {
    if (arpPoisoned) return;
    playError();
    setArpPoisoned(true);
  };

  const transmitPacket = () => {
    if (phase !== "IDLE") return;
    playZap();
    setPhase("ALICE_SEND");

    if (!arpPoisoned) {
      // Normal delivery
      setTimeout(() => {
        playPop();
        setPhase("BOB_RECEIVE");
        setTimeout(() => setPhase("IDLE"), 2000);
      }, 1000);
    } else {
      // MitM intercepted
      setTimeout(() => {
        playError(); // Eve catches it
        setPhase("EVE_READ");
        
        setTimeout(() => {
          playPop(); // Eve forwards it
          setPhase("EVE_FORWARD");
          
          setTimeout(() => {
            playPop(); // Bob receives it blindly
            setPhase("BOB_RECEIVE");
            
            if (!hasWon) {
              setHasWon(true);
              playSuccess();
              setTimeout(reportComplete, 1500);
            }
            setTimeout(() => setPhase("IDLE"), 2000);
          }, 1000);
        }, 1500);
      }, 1000);
    }
  };

  const handleReset = () => {
    setPhase("IDLE"); 
    setArpPoisoned(false); 
    setHasWon(false);
  };

  return (
    <LabShell 
      labId="maninthemiddle9" 
      theme="studio" 
      title="Man-In-The-Middle (MitM)" 
      instruction="1. Understand the mechanics of a Man-In-The-Middle attack on an insecure network. 2. Set up the simulation to intercept communications between two virtual clients. 3. Alter the intercepted messages before forwarding them to demonstrate the exploit. 4. Implement encryption protocols (like HTTPS) to secure the channel and prevent the attack." 
      compact
      onReset={handleReset}
    >
      
      <Celebration isActive={hasWon} message="Traffic Intercepted! By poisoning the ARP tables, you silently injected yourself into the middle of their communication. Bob received the packet normally, completely unaware you read it first." onReplay={handleReset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <button 
            onClick={transmitPacket} 
            disabled={phase !== "IDLE"}
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${phase === "IDLE" ? "bg-pink-50 border-pink-300 text-pink-700 hover:scale-[1.02]" : "bg-slate-50 border-slate-200 text-slate-400"}`}
          >
            <Send size={18}/> Alice: Send Packet
          </button>
          
          <button 
            onClick={poisonArp} 
            disabled={arpPoisoned || phase !== "IDLE"}
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${!arpPoisoned && phase === "IDLE" ? "bg-red-50 border-red-300 text-red-700 hover:scale-[1.02] shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse" : "bg-slate-50 border-slate-200 text-red-300 opacity-50"}`}
          >
            <Skull size={18}/> Eve: Poison ARP Tables
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 bg-slate-50 border border-slate-200 shadow-inner rounded-3xl overflow-x-auto overflow-y-hidden relative flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <MitmSVG phase={phase} arpPoisoned={arpPoisoned} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
