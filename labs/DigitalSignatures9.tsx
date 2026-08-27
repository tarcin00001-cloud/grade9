"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Edit3, KeyRound, Search, ShieldCheck } from "lucide-react";

// ─── SVG Digital Signatures Visualizer ────────────────────────────────────────

function SignaturesSVG({
  phase,
  tampered
}: {
  phase: "IDLE" | "HASHING" | "SIGNING" | "TRANSIT" | "VERIFYING" | "DONE";
  tampered: boolean;
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-seal">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Sender Side (Left) ── */}
      <g transform="translate(100, 250)">
        <text x="0" y="-120" fill="#94a3b8" fontSize="16" fontWeight="bold" textAnchor="middle">Alice (Sender)</text>
        
        {/* Document */}
        <AnimatePresence>
          {phase !== "TRANSIT" && phase !== "VERIFYING" && phase !== "DONE" && (
            <motion.rect x="-50" y="-80" width="100" height="120" fill="#f8fafc" rx="4" exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>
        {phase !== "TRANSIT" && phase !== "VERIFYING" && phase !== "DONE" && (
          <g>
            <path d="M -30,-60 L 30,-60 M -30,-40 L 30,-40 M -30,-20 L 10,-20" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <text x="0" y="20" fill={tampered ? "#ef4444" : "#1e293b"} fontSize="12" fontWeight="bold" textAnchor="middle">{tampered ? "Transfer $99K" : "Transfer $100"}</text>
          </g>
        )}

        {/* Private Key Press (Animates down during signing) */}
        <motion.g 
          initial={{ y: 80, opacity: 0 }} 
          animate={phase === "SIGNING" ? { y: 20, opacity: 1 } : { y: 80, opacity: 0.5 }}
        >
          <rect x="-20" y="0" width="40" height="40" fill="#4c0519" rx="8" stroke="#ef4444" strokeWidth="2" />
          <text x="0" y="25" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">PRIV KEY</text>
        </motion.g>
      </g>

      {/* ── Transit Packet ── */}
      <AnimatePresence>
        {(phase === "TRANSIT" || phase === "VERIFYING" || phase === "DONE") && (
          <motion.g
            initial={{ x: 100, y: 250 }}
            animate={{ x: phase === "TRANSIT" ? 450 : 700, y: 250 }}
            transition={{ duration: 1, type: "spring", bounce: 0 }}
          >
            {/* The Document */}
            <rect x="-50" y="-80" width="100" height="120" fill="#f8fafc" rx="4" />
            <path d="M -30,-60 L 30,-60 M -30,-40 L 30,-40 M -30,-20 L 10,-20" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <text x="0" y="20" fill={tampered ? "#ef4444" : "#1e293b"} fontSize="12" fontWeight="bold" textAnchor="middle">{tampered ? "Transfer $99K" : "Transfer $100"}</text>
            
            {/* The Cryptographic Wax Seal (Digital Signature) attached to document */}
            <circle cx="30" cy="20" r="18" fill="#f87171" filter="url(#glow-seal)" />
            <circle cx="30" cy="20" r="14" fill="none" stroke="#fca5a5" strokeWidth="2" strokeDasharray="2 2" />
            <text x="30" y="24" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">SIG</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* ── Receiver Side (Right) ── */}
      <g transform="translate(700, 250)">
        <text x="0" y="-120" fill="#94a3b8" fontSize="16" fontWeight="bold" textAnchor="middle">Bob (Receiver)</text>

        {/* Public Key Magnifying Glass (Animates over the seal) */}
        <AnimatePresence>
          {phase === "VERIFYING" && (
            <motion.g 
              initial={{ x: 100, y: 100, opacity: 0 }} 
              animate={{ x: 30, y: 20, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <circle cx="0" cy="0" r="25" fill="none" stroke="#f43f5e" strokeWidth="6" />
              <path d="M 18,18 L 40,40" fill="none" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
              <text x="0" y="-35" fill="#93c5fd" fontSize="12" fontWeight="bold" textAnchor="middle">ALICE'S PUB KEY</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Verification Result Output */}
        {phase === "DONE" && (
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} transform="translate(0, 80)">
             <rect x="-100" y="0" width="200" height="60" fill={tampered ? "#4c0519" : "#064e3b"} rx="8" stroke={tampered ? "#ef4444" : "#10b981"} strokeWidth="4" />
             <text x="0" y="35" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">
                {tampered ? "SIGNATURE INVALID!" : "SIGNATURE VERIFIED!"}
             </text>
             <text x="0" y="50" fill={tampered ? "#fca5a5" : "#a7f3d0"} fontSize="10" textAnchor="middle">
                {tampered ? "Hashes do not match" : "Hashes match perfectly"}
             </text>
          </motion.g>
        )}
      </g>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function DigitalSignatures9() {
  const { reportComplete } = useLMSBridge("digitalsignatures9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [phase, setPhase] = useState<"IDLE" | "HASHING" | "SIGNING" | "TRANSIT" | "VERIFYING" | "DONE">("IDLE");
  const [tampered, setTampered] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const signAndSend = () => {
    if (phase !== "IDLE") return;
    setPhase("HASHING");
    playPop();

    setTimeout(() => {
      setPhase("SIGNING");
      playZap(); // The Private key stamping
      
      setTimeout(() => {
         setPhase("TRANSIT");
         playPop();
      }, 1000);
    }, 1000);
  };

  const receiveAndVerify = () => {
    setPhase("VERIFYING");
    playZap(); // The Public key scanning

    setTimeout(() => {
      setPhase("DONE");
      if (tampered) {
         playError(); // Verification fails!
      } else {
         playSuccess(); // Verification succeeds!
         if (!hasWon) {
           setHasWon(true);
           setTimeout(reportComplete, 1500);
         }
      }
    }, 1500);
  };

  const reset = () => {
    setPhase("IDLE");
    setTampered(false);
  };

  return (
    <LabShell labId="digitalsignatures9" theme="neon" title="Digital Signatures" subtitle="L25 · Cryptography"
      instruction="Alice encrypts a hash of the document with her Private Key to create a Digital Signature. Send the document normally to verify it. Then, restart, tamper with the document mid-transit, and watch Bob's verification fail." compact>
      
      <Celebration isActive={hasWon} message="Authenticity Proven! Bob used Alice's Public Key to decrypt the signature. Because the document hash matched the decrypted signature hash, Bob knows Alice sent it AND that it wasn't altered." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-rose-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={signAndSend} 
            disabled={phase !== "IDLE"}
            className="px-6 py-3 rounded-xl font-black bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 hover:bg-rose-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <KeyRound size={18}/> Sign with Private Key & Send
          </button>

          <button 
            onClick={() => { setTampered(true); playPop(); }} 
            disabled={phase !== "TRANSIT"}
            className={`px-6 py-3 rounded-xl font-black transition-all border-2 flex items-center gap-2 ${phase === "TRANSIT" ? "bg-red-500 border-red-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]" : "bg-stone-800 border-stone-700 text-stone-500"}`}
          >
            <Edit3 size={18}/> Tamper Data (Man-in-the-Middle)
          </button>

          <button 
            onClick={receiveAndVerify} 
            disabled={phase !== "TRANSIT"}
            className="px-6 py-3 rounded-xl font-black bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Search size={18}/> Verify with Public Key
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-rose-900/40 bg-[#0c0a09] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <SignaturesSVG phase={phase} tampered={tampered} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
