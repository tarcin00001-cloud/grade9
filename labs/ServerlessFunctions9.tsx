"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Server, Zap, Plus, Minus, DollarSign, Activity } from "lucide-react";

// ─── Constants & Traffic Pattern ──────────────────────────────────────────────

// 15 seconds of traffic (requests per second)
const TRAFFIC_WAVE = [2, 5, 15, 25, 35, 10, 0, 5, 25, 45, 10, 2, 0, 0, 0];
const SIM_DURATION = TRAFFIC_WAVE.length;

const STARTING_BUDGET = 50.00;
const MONOLITH_SERVER_COST = 1.00; // $1 per second per server
const MONOLITH_CAPACITY = 10; // requests per second per server
const SERVERLESS_COST_PER_REQ = 0.10; // 10 cents per request

// ─── SVG Architecture Visualizer ──────────────────────────────────────────────

function ServerlessSVG({ 
  mode, 
  servers,
  currentTraffic,
  phase
}: { 
  mode: "DEDICATED" | "SERVERLESS";
  servers: number;
  currentTraffic: number;
  phase: "IDLE" | "RUNNING" | "WIN" | "LOSE";
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-sl">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridSl" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridSl)" />

      {/* ── Client Traffic Source (Left) ── */}
      <g transform="translate(100, 250)">
        <circle cx="0" cy="0" r="60" fill="#0f172a" stroke="#0ea5e9" strokeWidth="4" />
        <text x="0" y="5" fill="#38bdf8" fontSize="20" fontWeight="black" textAnchor="middle">USERS</text>
        
        {phase === "RUNNING" && currentTraffic > 0 && (
           <text x="0" y="-80" fill="#bae6fd" fontSize="16" fontWeight="bold" textAnchor="middle" filter="url(#glow-sl)">
             {currentTraffic} req/s
           </text>
        )}
      </g>

      {/* ── Backend Architecture (Right) ── */}
      <g transform="translate(450, 100)">
        
        {/* Dedicated Monolith Servers */}
        {mode === "DEDICATED" && (
          <g>
            <rect x="0" y="0" width="350" height="300" fill="#020617" stroke="#475569" strokeWidth="6" />
            <text x="175" y="-15" fill="#94a3b8" fontSize="18" fontWeight="black" textAnchor="middle">MANUAL SERVER FARM</text>
            
            <text x="175" y="280" fill="#64748b" fontSize="12" fontWeight="bold" textAnchor="middle">Capacity: {servers * MONOLITH_CAPACITY} req/s</text>

            <AnimatePresence>
               {[...Array(servers)].map((_, i) => (
                  <motion.g key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                     transform={`translate(${30 + (i % 3) * 100}, ${40 + Math.floor(i / 3) * 100})`}
                  >
                     <rect x="0" y="0" width="80" height="80" fill="#1e1b4b" rx="8" stroke="#8b5cf6" strokeWidth="4" filter="url(#glow-sl)" />
                     <path d="M 20,20 L 60,20 M 20,40 L 60,40 M 20,60 L 60,60" fill="none" stroke="#c4b5fd" strokeWidth="4" />
                  </motion.g>
               ))}
            </AnimatePresence>
          </g>
        )}

        {/* Serverless Functions (AWS Lambda) */}
        {mode === "SERVERLESS" && (
          <g>
            <rect x="0" y="0" width="350" height="300" fill="#020617" stroke="#10b981" strokeWidth="6" strokeDasharray="15 15" />
            <text x="175" y="-15" fill="#34d399" fontSize="18" fontWeight="black" textAnchor="middle">SERVERLESS CLOUD</text>

            <text x="175" y="280" fill="#64748b" fontSize="12" fontWeight="bold" textAnchor="middle">Infinite Auto-Scaling</text>

            {/* Display tiny lambdas for each request */}
            {phase === "RUNNING" && currentTraffic > 0 ? (
               <g>
                  {[...Array(Math.min(currentTraffic, 50))].map((_, i) => (
                     <circle key={i} cx={50 + (i % 10) * 25} cy={50 + Math.floor(i / 10) * 30} r="6" fill="#10b981" filter="url(#glow-sl)" className="animate-pulse" />
                  ))}
               </g>
            ) : (
               <text x="175" y="150" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle">Idle. 0 Servers Running.</text>
            )}
          </g>
        )}
      </g>

      {/* ── Network Traffic Lines ── */}
      {phase === "RUNNING" && currentTraffic > 0 && (
         <g>
            <path d="M 160,250 L 450,250" fill="none" stroke="#0ea5e9" strokeWidth={Math.max(2, currentTraffic / 2)} opacity="0.5" filter="url(#glow-sl)" className="animate-pulse" />
         </g>
      )}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ServerlessFunctions9() {
  const { reportComplete } = useLMSBridge("serverlessfunctions9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<"DEDICATED" | "SERVERLESS">("DEDICATED");
  const [phase, setPhase] = useState<"IDLE" | "RUNNING" | "WIN" | "LOSE">("IDLE");
  
  const [servers, setServers] = useState(1);
  const [budget, setBudget] = useState(STARTING_BUDGET);
  const [time, setTime] = useState(0);
  const [loseReason, setLoseReason] = useState("");
  const [hasWon, setHasWon] = useState(false);

  const currentTraffic = phase === "RUNNING" ? TRAFFIC_WAVE[time] : 0;

  const simRef = useRef<NodeJS.Timeout | null>(null);

  const startSimulation = () => {
    if (phase === "RUNNING") return;
    setPhase("RUNNING");
    setBudget(STARTING_BUDGET);
    setTime(0);
    setServers(1);
    setLoseReason("");
    playZap();

    let t = 0;
    let b = STARTING_BUDGET;

    simRef.current = setInterval(() => {
       if (t >= SIM_DURATION) {
          // Finished!
          if (simRef.current) clearInterval(simRef.current);
          setPhase("WIN");
          playSuccess();
          if (!hasWon) {
             setHasWon(true);
             setTimeout(reportComplete, 1500);
          }
          return;
       }

       const reqs = TRAFFIC_WAVE[t];

       setServers(currentServers => {
          
          let costThisTick = 0;
          let newBudget = b;

          if (mode === "DEDICATED") {
             // Check capacity
             const capacity = currentServers * MONOLITH_CAPACITY;
             if (reqs > capacity) {
                // Crash!
                if (simRef.current) clearInterval(simRef.current);
                setPhase("LOSE");
                setLoseReason(`Servers crashed! Traffic was ${reqs} req/s, but capacity was only ${capacity} req/s.`);
                playError();
                return currentServers;
             }

             // Deduct Cost
             costThisTick = currentServers * MONOLITH_SERVER_COST;
          } else {
             // SERVERLESS
             // Never crashes, infinite capacity
             costThisTick = reqs * SERVERLESS_COST_PER_REQ;
          }

          newBudget -= costThisTick;
          b = newBudget; // Update local ref for next tick

          if (newBudget < 0) {
             if (simRef.current) clearInterval(simRef.current);
             setPhase("LOSE");
             setLoseReason(`Bankrupt! You spent all your startup money.`);
             playError();
             return currentServers;
          }

          setBudget(newBudget);
          
          if (reqs > 0) playPop();

          return currentServers;
       });

       t++;
       setTime(t);

    }, 1000);
  };

  const stopSimulation = () => {
     if (simRef.current) clearInterval(simRef.current);
     setPhase("IDLE");
     setTime(0);
     setBudget(STARTING_BUDGET);
     setServers(1);
  };

  const addServer = () => {
     if (servers < 10) setServers(s => s + 1);
     playZap();
  };

  const removeServer = () => {
     if (servers > 0) setServers(s => s - 1);
     playPop();
  };

  return (
    <LabShell labId="serverlessfunctions9" theme="ocean" title="Serverless Computing (Lambda)" subtitle="L43 · Cloud Architecture"
      instruction="Survive a 15-second traffic spike with your $50 budget. In 'Monolith' mode, you must manually guess the traffic and spin servers up/down. If traffic exceeds your server capacity, the site crashes. If you leave servers running while idle, you go bankrupt! Then, try 'Serverless' mode to see auto-scaling magic." compact>
      
      <Celebration isActive={phase === "WIN"} message="Spike Survived! In 'Serverless' mode, the cloud provider automatically spawns micro-functions for each request and destroys them instantly. You pay exactly $0.10 per request, and $0.00 when idle. No more guessing server capacity!" onReplay={stopSimulation} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-emerald-900/50 p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Mode Switcher */}
          <div className="flex gap-2">
            <button 
              onClick={() => { stopSimulation(); setMode("DEDICATED"); playZap(); }} 
              disabled={phase === "RUNNING"}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all border-2 flex items-center gap-2 ${mode === "DEDICATED" ? "bg-violet-600/30 border-violet-500 text-violet-300" : "bg-neutral-800 border-neutral-700 text-neutral-400"} disabled:opacity-50`}
            >
              <Server size={14}/> Monolith Server Farm
            </button>
            <button 
              onClick={() => { stopSimulation(); setMode("SERVERLESS"); playPop(); }} 
              disabled={phase === "RUNNING"}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all border-2 flex items-center gap-2 ${mode === "SERVERLESS" ? "bg-emerald-600/30 border-emerald-500 text-emerald-300" : "bg-neutral-800 border-neutral-700 text-neutral-400"} disabled:opacity-50`}
            >
              <Zap size={14}/> Serverless Architecture
            </button>
          </div>

          {/* Budget Display */}
          <div className="flex items-center gap-3 px-4 py-2 bg-black/50 border-2 border-emerald-500/50 rounded-xl text-emerald-400 font-black text-xl font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]">
             <DollarSign size={20}/> {budget.toFixed(2)}
          </div>
          
          <button 
            onClick={startSimulation} 
            disabled={phase === "RUNNING"}
            className="px-8 py-3 rounded-xl font-black bg-emerald-600 border-2 border-emerald-400 text-white hover:bg-emerald-500 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
          >
            <Activity size={18}/> {phase === "LOSE" || phase === "WIN" ? "Retry Simulation" : "Start 15s Simulation"}
          </button>

        </div>

        {/* Dynamic Controls (Only visible when running Monolith) */}
        {phase === "RUNNING" && mode === "DEDICATED" && (
           <div className="shrink-0 flex items-center justify-center gap-6 p-3 bg-violet-950/50 border border-violet-900 rounded-xl">
              <span className="text-violet-300 font-bold uppercase text-xs">Manual Auto-Scaling:</span>
              <button onClick={removeServer} className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-500 hover:scale-110 transition-all shadow-[0_0_20px_rgba(225,29,72,0.5)]">
                 <Minus size={24} />
              </button>
              <div className="text-2xl font-black text-white font-mono w-16 text-center">
                 {servers}
              </div>
              <button onClick={addServer} className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-500 hover:scale-110 transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                 <Plus size={24} />
              </button>
              <span className="text-zinc-400 font-bold text-xs">Cost: ${servers * MONOLITH_SERVER_COST}/sec</span>
           </div>
        )}

        {/* Phase Indicator & Lose Reason */}
        {phase === "LOSE" && (
           <div className="shrink-0 text-center font-black text-rose-500 bg-rose-950/50 border border-rose-900 rounded-lg p-2 animate-pulse uppercase">
              GAME OVER: {loseReason}
           </div>
        )}

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-emerald-900/40 bg-[#020617] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <ServerlessSVG mode={mode} servers={servers} currentTraffic={currentTraffic} phase={phase} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
