"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldCheck, EyeOff, RefreshCcw } from "lucide-react";

// ─── SVG TOR Routing Visualizer ───────────────────────────────────────────────

type Phase = "IDLE" | "NODE1" | "NODE2" | "NODE3" | "TARGET" | "DONE";

function TorSVG({ phase }: { phase: Phase }) {
  
  // Location Based logic for the packet
  const getPacketPos = () => {
    switch(phase) {
      case "IDLE": return { x: 100, y: 250 };
      case "NODE1": return { x: 300, y: 150 };
      case "NODE2": return { x: 500, y: 350 };
      case "NODE3": return { x: 700, y: 150 };
      case "TARGET": return { x: 850, y: 250 };
      case "DONE": return { x: 850, y: 250 };
      default: return { x: 100, y: 250 };
    }
  };

  const pos = getPacketPos();

  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-tor">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridTor" width="50" height="50" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridTor)" />

      {/* ── Network Path (Concealed routing) ── */}
      <path d="M 100,250 C 200,250 200,150 300,150" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M 300,150 C 400,150 400,350 500,350" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M 500,350 C 600,350 600,150 700,150" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M 700,150 C 800,150 800,250 850,250" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

      {/* ── The Nodes ── */}
      {/* Client */}
      <g transform="translate(100, 250)">
        <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#fff" strokeWidth="3" />
        <text x="0" y="5" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">YOU</text>
      </g>

      {/* Tor Guard Node 1 */}
      <g transform="translate(300, 150)">
        <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="#3b82f6" strokeWidth="4" />
        <text x="0" y="-5" fill="#93c5fd" fontSize="12" fontWeight="bold" textAnchor="middle">Node 1</text>
        <text x="0" y="10" fill="#60a5fa" fontSize="10" textAnchor="middle">(Guard)</text>
      </g>

      {/* Tor Middle Node 2 */}
      <g transform="translate(500, 350)">
        <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="#10b981" strokeWidth="4" />
        <text x="0" y="-5" fill="#a7f3d0" fontSize="12" fontWeight="bold" textAnchor="middle">Node 2</text>
        <text x="0" y="10" fill="#34d399" fontSize="10" textAnchor="middle">(Middle)</text>
      </g>

      {/* Tor Exit Node 3 */}
      <g transform="translate(700, 150)">
        <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="#f59e0b" strokeWidth="4" />
        <text x="0" y="-5" fill="#fcd34d" fontSize="12" fontWeight="bold" textAnchor="middle">Node 3</text>
        <text x="0" y="10" fill="#f59e0b" fontSize="10" textAnchor="middle">(Exit)</text>
      </g>

      {/* Target Server */}
      <g transform="translate(850, 250)">
        <rect x="-30" y="-30" width="60" height="60" fill="#4c0519" rx="8" stroke="#f43f5e" strokeWidth="4" />
        <text x="0" y="-40" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle">Target</text>
      </g>

      {/* ── The Packet (Onion Layers) ── */}
      <AnimatePresence>
        {phase !== "DONE" && (
          <motion.g
            animate={{ x: pos.x, y: pos.y }}
            transition={{ duration: 1, type: "spring", bounce: 0 }}
          >
            {/* The Raw Message */}
            <rect x="-15" y="-10" width="30" height="20" fill="#fff" rx="2" />
            <text x="0" y="4" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">MSG</text>

            {/* Layer 3 (Inner - Decrypted by Node 3) */}
            <AnimatePresence>
              {(phase === "IDLE" || phase === "NODE1" || phase === "NODE2") && (
                <motion.rect exit={{ opacity: 0, scale: 1.5 }} x="-20" y="-15" width="40" height="30" fill="none" stroke="#f59e0b" strokeWidth="4" rx="4" />
              )}
            </AnimatePresence>

            {/* Layer 2 (Middle - Decrypted by Node 2) */}
            <AnimatePresence>
              {(phase === "IDLE" || phase === "NODE1") && (
                <motion.rect exit={{ opacity: 0, scale: 1.5 }} x="-25" y="-20" width="50" height="40" fill="none" stroke="#10b981" strokeWidth="4" rx="6" />
              )}
            </AnimatePresence>

            {/* Layer 1 (Outer - Decrypted by Node 1) */}
            <AnimatePresence>
              {phase === "IDLE" && (
                <motion.rect exit={{ opacity: 0, scale: 1.5 }} x="-30" y="-25" width="60" height="50" fill="none" stroke="#3b82f6" strokeWidth="4" rx="8" />
              )}
            </AnimatePresence>
            
          </motion.g>
        )}
      </AnimatePresence>

      {/* Success state marker */}
      {phase === "TARGET" && (
        <text x="850" y="250" fill="#fff" fontSize="12" fontWeight="black" textAnchor="middle" filter="url(#glow-tor)">MSG RCV</text>
      )}

      {/* ── Visual UI Explanations ── */}
      {phase === "NODE1" && <text x="300" y="210" fill="#93c5fd" fontSize="14" fontWeight="bold" textAnchor="middle">"I only know YOU sent it"</text>}
      {phase === "NODE2" && <text x="500" y="410" fill="#a7f3d0" fontSize="14" fontWeight="bold" textAnchor="middle">"I know nothing (Blind Router)"</text>}
      {phase === "NODE3" && <text x="700" y="90" fill="#fcd34d" fontSize="14" fontWeight="bold" textAnchor="middle">"I only know the TARGET"</text>}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function TorRouting9() {
  const { reportComplete } = useLMSBridge("torrouting9");
  const { playPop, playZap, playSuccess } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("IDLE");
  const [hasWon, setHasWon] = useState(false);

  const routePacket = () => {
    if (phase !== "IDLE") return;
    
    // Jump to Node 1
    setPhase("NODE1");
    playPop(); // Outer shell breaks

    setTimeout(() => {
      // Jump to Node 2
      setPhase("NODE2");
      playPop(); // Middle shell breaks

      setTimeout(() => {
        // Jump to Node 3
        setPhase("NODE3");
        playPop(); // Inner shell breaks

        setTimeout(() => {
           // Delivered to target
           setPhase("TARGET");
           playZap();

           setTimeout(() => {
              setHasWon(true);
              playSuccess();
              setTimeout(reportComplete, 1500);
           }, 1000);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const reset = () => {
    setPhase("IDLE");
    setHasWon(false);
  };

  return (
    <LabShell labId="torrouting9" theme="ocean" title="The Onion Router (TOR) Network" subtitle="L33 · Network Privacy"
      instruction="Watch the 'Onion' packet traverse the network. Your client wraps the message in 3 layers of encryption. As it hits each Node, exactly one layer is peeled off. Notice how Node 1 knows who you are, and Node 3 knows the destination, but NO single node knows both." compact>
      
      <Celebration isActive={hasWon} message="Anonymity Preserved! Because the encryption is layered like an onion, the Middle Node (Node 2) is completely blind. It only knows it received a packet from Node 1 and must send it to Node 3, ensuring perfect untraceable routing." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-blue-900/50 p-4 flex flex-col md:flex-row items-center justify-center gap-6">
          
          <button 
            onClick={routePacket} 
            disabled={phase !== "IDLE"}
            className="px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            <ShieldCheck size={18}/> Transmit via TOR Darknet
          </button>

          <button onClick={reset} className="px-4 py-3 rounded-xl font-black bg-zinc-800/80 border-2 border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all">
            <RefreshCcw size={18}/>
          </button>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-blue-900/40 bg-[#09090b] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <TorSVG phase={phase} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
