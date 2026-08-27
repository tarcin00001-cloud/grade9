"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldAlert, Send, Database, RefreshCcw } from "lucide-react";

// ─── SVG XSS Visualizer ───────────────────────────────────────────────────────

type Phase = "IDLE" | "HACKER_SENDS" | "DB_STORES" | "VICTIM_LOADS" | "XSS_EXECUTES" | "COOKIE_STOLEN";

function XssSVG({ phase }: { phase: Phase }) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-xss">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridXss" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridXss)" />

      {/* ── Hacker Station (Bottom Left) ── */}
      <g transform="translate(150, 400)">
        <rect x="-60" y="-40" width="120" height="80" fill="#fff1f2" rx="8" stroke="#e11d48" strokeWidth="4" />
        <text x="0" y="-10" fill="#be123c" fontSize="16" fontWeight="black" textAnchor="middle">HACKER</text>
      </g>

      {/* ── Server & Database (Top Center) ── */}
      <g transform="translate(450, 100)">
        <rect x="-100" y="-50" width="200" height="120" fill="#f0fdfa" rx="16" stroke="#0d9488" strokeWidth="4" />
        <text x="0" y="-20" fill="#0f766e" fontSize="18" fontWeight="black" textAnchor="middle">APP DATABASE</text>
        
        {/* Comment Storage Row */}
        <rect x="-80" y="10" width="160" height="40" fill="#ccfbf1" rx="4" />
        
        {/* The Stored Payload */}
        <AnimatePresence>
          {(phase === "DB_STORES" || phase === "VICTIM_LOADS" || phase === "XSS_EXECUTES" || phase === "COOKIE_STOLEN") && (
            <motion.text x="0" y="35" fill="#e11d48" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {"<script>steal()</script>"}
            </motion.text>
          )}
        </AnimatePresence>
      </g>

      {/* ── Victim Browser (Bottom Right) ── */}
      <g transform="translate(750, 400)">
        <rect x="-80" y="-60" width="160" height="120" fill="#f0fdf4" rx="8" stroke="#16a34a" strokeWidth="4" />
        <text x="0" y="-35" fill="#15803d" fontSize="16" fontWeight="black" textAnchor="middle">VICTIM BROWSER</text>
        
        {/* The Victim's Session Cookie */}
        <AnimatePresence>
          {phase !== "COOKIE_STOLEN" && (
            <motion.g exit={{ opacity: 0 }}>
              <circle cx="0" cy="10" r="15" fill="#fbbf24" filter="url(#glow-xss)" />
              <text x="0" y="40" fill="#b45309" fontSize="10" fontWeight="bold" textAnchor="middle">SESSION COOKIE</text>
            </motion.g>
          )}
        </AnimatePresence>
      </g>

      {/* ── Animations (The Attack Flow) ── */}
      <AnimatePresence>
        
        {/* Step 1: Hacker Sends Payload */}
        {phase === "HACKER_SENDS" && (
          <motion.g
            initial={{ x: 150, y: 360 }}
            animate={{ x: 450, y: 150 }}
            transition={{ duration: 1, ease: "linear" }}
          >
            <rect x="-60" y="-15" width="120" height="30" fill="#e11d48" rx="4" filter="url(#glow-xss)" />
            <text x="0" y="5" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{"<script>steal()</script>"}</text>
          </motion.g>
        )}

        {/* Step 2: Database serves payload to Victim */}
        {phase === "VICTIM_LOADS" && (
          <motion.g
            initial={{ x: 450, y: 150 }}
            animate={{ x: 750, y: 340 }}
            transition={{ duration: 1, ease: "linear" }}
          >
            <rect x="-60" y="-15" width="120" height="30" fill="#e11d48" rx="4" filter="url(#glow-xss)" />
            <text x="0" y="5" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{"<script>steal()</script>"}</text>
          </motion.g>
        )}

        {/* Step 3: Script Executes in Browser (Turns into a physical claw/hook) */}
        {phase === "XSS_EXECUTES" && (
          <motion.g
            initial={{ x: 750, y: 340, scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <path d="M -20,10 C -40,-20 40,-20 20,10" fill="none" stroke="#e11d48" strokeWidth="6" filter="url(#glow-xss)" />
            <text x="0" y="-15" fill="#e11d48" fontSize="12" fontWeight="black" textAnchor="middle">EXECUTION!</text>
          </motion.g>
        )}

        {/* Step 4: Stolen Cookie flies to Hacker */}
        {phase === "COOKIE_STOLEN" && (
          <motion.g
            initial={{ x: 750, y: 400 }}
            animate={{ x: 150, y: 400 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <circle cx="0" cy="0" r="15" fill="#fbbf24" filter="url(#glow-xss)" />
            <text x="0" y="-20" fill="#e11d48" fontSize="12" fontWeight="black" textAnchor="middle">HIJACKED!</text>
          </motion.g>
        )}

      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function CrossSiteScripting9() {
  const { reportComplete } = useLMSBridge("crosssitescripting9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("IDLE");
  const [hasWon, setHasWon] = useState(false);

  const executeAttack = () => {
    if (phase !== "IDLE") return;
    
    // Hacker injects script
    setPhase("HACKER_SENDS");
    playPop();

    setTimeout(() => {
      // Script is saved blindly by DB
      setPhase("DB_STORES");
      playZap();

      setTimeout(() => {
        // Victim loads the page
        setPhase("VICTIM_LOADS");
        playPop();

        setTimeout(() => {
           // Script executes inside Victim's trusted browser
           setPhase("XSS_EXECUTES");
           playError(); // Evil sound

           setTimeout(() => {
              // Script steals cookie
              setPhase("COOKIE_STOLEN");
              playZap();

              setTimeout(() => {
                 setHasWon(true);
                 playSuccess();
                 setTimeout(reportComplete, 1500);
              }, 1000);
           }, 1000);
        }, 1000);
      }, 1500);
    }, 1000);
  };

  const reset = () => {
    setPhase("IDLE");
    setHasWon(false);
  };

  return (
    <LabShell labId="crosssitescripting9" theme="garden" title="Stored Cross-Site Scripting (XSS)" 
      instruction="1. Learn the difference between reflected and stored Cross-Site Scripting (XSS). 2. Inject a persistent malicious script into the simulated application's database. 3. Observe the script executing when other virtual users access the compromised page. 4. Sanitize the user input in the application code to neutralize the XSS vulnerability." onReset={reset} compact>
      
      <Celebration isActive={hasWon} message="Session Hijacked! Because the app didn't 'sanitize' (clean) your input, the victim's browser thought your attack was just part of the website's normal code. You now own their account." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 bg-white shadow-sm rounded-2xl border border-slate-300 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={executeAttack} 
            disabled={phase !== "IDLE"}
            className="px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 disabled:opacity-50"
          >
            <ShieldAlert size={18}/> Inject Malicious Comment
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 bg-white rounded-3xl overflow-x-auto overflow-y-hidden relative border border-slate-300 shadow-sm flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <XssSVG phase={phase} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
