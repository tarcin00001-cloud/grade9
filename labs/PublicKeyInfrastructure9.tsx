"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Lock, FileBadge, CheckCircle, RefreshCcw } from "lucide-react";

// ─── SVG PKI & Certificate Visualizer ─────────────────────────────────────────

type Phase = "IDLE" | "SEND_CSR" | "CA_STAMPS" | "CERT_ISSUED" | "CLIENT_CONNECTS" | "VERIFIED";

function PkiSVG({ phase }: { phase: Phase }) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-cert">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Certificate Authority (Top Center) ── */}
      <g transform="translate(450, 80)">
        <rect x="-80" y="-40" width="160" height="80" fill="#0f172a" rx="8" stroke="#f59e0b" strokeWidth="4" />
        <text x="0" y="-10" fill="#fcd34d" fontSize="16" fontWeight="black" textAnchor="middle">Global CA</text>
        <text x="0" y="10" fill="#f59e0b" fontSize="10" textAnchor="middle">(Trusted by Browsers)</text>
        
        {/* CA's Signing Press */}
        <motion.rect 
          x="-20" y="40" width="40" height="30" fill="#78350f" rx="4" 
          animate={{ y: phase === "CA_STAMPS" ? 60 : 40 }}
          transition={{ type: "spring", bounce: 0.8 }}
        />
        <text x="0" y={phase === "CA_STAMPS" ? 80 : 60} fill="#fff" fontSize="10" textAnchor="middle" style={{ transition: "all 0.3s" }}>SIGN</text>
      </g>

      {/* ── Web Server (Left) ── */}
      <g transform="translate(150, 350)">
        <rect x="-60" y="-50" width="120" height="100" fill="#1e1b4b" rx="8" stroke="#f59e0b" strokeWidth="4" />
        <text x="0" y="-20" fill="#a5b4fc" fontSize="16" fontWeight="black" textAnchor="middle">Web Server</text>
        <text x="0" y="0" fill="#f59e0b" fontSize="10" textAnchor="middle">"I am tarcin.in"</text>
      </g>

      {/* ── Client Browser (Right) ── */}
      <g transform="translate(750, 350)">
        <rect x="-60" y="-50" width="120" height="100" fill="#064e3b" rx="8" stroke="#10b981" strokeWidth="4" />
        <text x="0" y="-20" fill="#a7f3d0" fontSize="16" fontWeight="black" textAnchor="middle">Browser</text>
        <text x="0" y="0" fill="#34d399" fontSize="10" textAnchor="middle">(Trusts Global CA)</text>
        
        {/* Padlock Icon */}
        <AnimatePresence>
          {phase === "VERIFIED" && (
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }} transform="translate(0, 30)">
              <rect x="-10" y="-5" width="20" height="15" fill="#34d399" rx="2" filter="url(#glow-cert)" />
              <path d="M -6,-5 L -6,-10 C -6,-15 6,-15 6,-10 L 6,-5" fill="none" stroke="#10b981" strokeWidth="3" filter="url(#glow-cert)" />
            </motion.g>
          )}
        </AnimatePresence>
      </g>

      {/* ── The Certificate (Animated Actor) ── */}
      <AnimatePresence>
        {phase !== "IDLE" && (
          <motion.g
            initial={{ x: 150, y: 250 }}
            animate={{ 
              x: phase === "SEND_CSR" ? 450 : 
                 phase === "CA_STAMPS" ? 450 : 
                 phase === "CERT_ISSUED" ? 150 : 
                 phase === "CLIENT_CONNECTS" ? 750 : 
                 750,
              y: phase === "SEND_CSR" ? 180 : 
                 phase === "CA_STAMPS" ? 180 : 
                 phase === "CERT_ISSUED" ? 250 : 
                 phase === "CLIENT_CONNECTS" ? 250 : 
                 250
            }}
            transition={{ duration: 1, type: "spring", bounce: 0.1 }}
          >
            <rect x="-40" y="-30" width="80" height="60" fill="#f8fafc" rx="4" stroke="#cbd5e1" strokeWidth="2" />
            <text x="0" y="-10" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">tarcin.in</text>
            <text x="0" y="5" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">Public Key</text>
            
            {/* The CA's Wax Seal Signature (Only appears after stamping) */}
            {(phase === "CERT_ISSUED" || phase === "CLIENT_CONNECTS" || phase === "VERIFIED") && (
              <g transform="translate(20, 15)">
                <circle cx="0" cy="0" r="12" fill="#f59e0b" filter="url(#glow-cert)" />
                <text x="0" y="3" fill="#fff" fontSize="8" fontWeight="black" textAnchor="middle">CA</text>
              </g>
            )}
            
            {/* Client Verification Laser */}
            {phase === "VERIFIED" && (
              <motion.path 
                d="M -50,0 L 50,0" 
                fill="none" stroke="#10b981" strokeWidth="4" 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
                filter="url(#glow-cert)"
              />
            )}
          </motion.g>
        )}
      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function PublicKeyInfrastructure9() {
  const { reportComplete } = useLMSBridge("publickeyinfrastructure9");
  const { playPop, playZap, playSuccess } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("IDLE");
  const [hasWon, setHasWon] = useState(false);

  const startFlow = () => {
    if (phase !== "IDLE" && phase !== "VERIFIED") return;
    
    // Server sends Public Key to CA
    setPhase("SEND_CSR");
    playPop();

    setTimeout(() => {
      // CA Signs it
      setPhase("CA_STAMPS");
      playZap();

      setTimeout(() => {
        // Certificate is born and sent to server
        setPhase("CERT_ISSUED");
        playSuccess(); // Sparkle

        setTimeout(() => {
           // Client connects and gets the certificate
           setPhase("CLIENT_CONNECTS");
           playPop();

           setTimeout(() => {
              // Client verifies the CA signature and locks the padlock
              setPhase("VERIFIED");
              playZap();
              
              if (!hasWon) {
                 setHasWon(true);
                 setTimeout(reportComplete, 1500);
              }
           }, 1500);
        }, 1500);
      }, 1000);
    }, 1000);
  };

  const reset = () => {
    setPhase("IDLE");
    setHasWon(false);
  };

  return (
    <LabShell labId="publickeyinfrastructure9" theme="forge" title="SSL/TLS Certificates & PKI" subtitle="L24 · Cryptography"
      instruction="How do you know a website is real? Watch the Web Server send its Public Key to a trusted Certificate Authority (CA). The CA signs it, creating a Certificate. When your browser connects, it verifies that CA Signature to enable the Green Padlock." compact>
      
      <Celebration isActive={hasWon} message="Secure Connection Established! The browser trusts the CA, and the CA trusts the Server. By verifying the CA's signature on the Certificate, the browser knows the Server is completely legitimate." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-amber-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={startFlow} 
            disabled={phase !== "IDLE" && phase !== "VERIFIED"}
            className="px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50"
          >
            <FileBadge size={18}/> Request SSL Certificate (PKI Flow)
          </button>

          <button onClick={reset} className="px-4 py-3 rounded-xl font-black bg-gray-800/80 border-2 border-gray-700 text-gray-300 hover:bg-gray-700 transition-all">
            <RefreshCcw size={18}/>
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-amber-900/40 bg-[#030712] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <PkiSVG phase={phase} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
