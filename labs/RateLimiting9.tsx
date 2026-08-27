"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldAlert, Zap, SlidersHorizontal, Activity } from "lucide-react";

// ─── SVG Rate Limiter Visualizer ──────────────────────────────────────────────

type RequestData = { id: number; type: "normal" | "ddos"; status: "pending" | "allowed" | "blocked" | "processing"; y: number; x: number };

function RateLimitSVG({ 
  tokens, 
  maxTokens,
  requests,
  dbLoad
}: { 
  tokens: number; 
  maxTokens: number;
  requests: RequestData[];
  dbLoad: number;
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-rl">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Client (Bottom) ── */}
      <rect x="0" y="450" width="900" height="50" fill="#0f172a" />
      <text x="450" y="480" fill="#94a3b8" fontSize="16" fontWeight="black" textAnchor="middle">THE INTERNET</text>

      {/* ── Backend Server (Top) ── */}
      <rect x="0" y="0" width="900" height="100" fill="#1e1b4b" stroke={dbLoad > 9 ? "#f43f5e" : "#8b5cf6"} strokeWidth="4" />
      <text x="450" y="40" fill="#a5b4fc" fontSize="20" fontWeight="black" textAnchor="middle">DATABASE SERVER</text>
      
      {/* DB Load Bar */}
      <rect x="350" y="60" width="200" height="15" fill="#0f172a" rx="4" />
      <rect x="350" y="60" width={Math.min(dbLoad * 20, 200)} height="15" fill={dbLoad > 9 ? "#f43f5e" : "#10b981"} rx="4" style={{ transition: "width 0.2s" }} />
      <text x="450" y="72" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Load: {dbLoad}/10 req/s</text>

      {/* ── API Gateway (Token Bucket) (Center) ── */}
      <g transform="translate(450, 250)">
        {/* Gateway Wall */}
        <path d="M -300,0 L -80,0 M 80,0 L 300,0" fill="none" stroke="#ec4899" strokeWidth="6" strokeDasharray="10 10" />
        
        {/* The Bucket */}
        <path d="M -60,-20 L -50,60 L 50,60 L 60,-20" fill="none" stroke="#10b981" strokeWidth="6" />
        <text x="0" y="85" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">TOKEN BUCKET</text>
        <text x="0" y="100" fill="#6ee7b7" fontSize="10" textAnchor="middle">{tokens} / {maxTokens}</text>

        {/* Tokens inside the Bucket */}
        {[...Array(maxTokens)].map((_, i) => (
          <circle 
            key={i} 
            cx={(i % 5) * 18 - 36} 
            cy={50 - Math.floor(i / 5) * 15} 
            r="6" 
            fill={i < tokens ? "#3b82f6" : "#0f172a"} 
            stroke={i < tokens ? "none" : "#334155"}
            strokeWidth="1"
            filter={i < tokens ? "url(#glow-rl)" : "none"}
            style={{ transition: "all 0.1s ease" }}
          />
        ))}
      </g>

      {/* ── Requests ── */}
      {requests.map(req => {
        const color = req.type === "normal" ? "#34d399" : "#f43f5e";
        return (
          <motion.g 
            key={`req-${req.id}`} 
            initial={false}
            animate={{ x: req.x, y: req.y, opacity: req.status === "processing" ? 0 : 1 }} 
            transition={{ duration: 0.1, ease: "linear" }}
          >
            {req.status === "blocked" ? (
              <g>
                <path d="M -10,-10 L 10,10 M -10,10 L 10,-10" stroke="#ef4444" strokeWidth="4" filter="url(#glow-rl)" />
                <text x="0" y="-15" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">429 Blocked</text>
              </g>
            ) : (
              <circle cx="0" cy="0" r="8" fill={color} filter="url(#glow-rl)" />
            )}
          </motion.g>
        );
      })}

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function RateLimiting9() {
  const { reportComplete } = useLMSBridge("ratelimiting9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [maxTokens, setMaxTokens] = useState(15);
  const [refillRate, setRefillRate] = useState(2); // tokens per second
  
  const [tokens, setTokens] = useState(15);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [dbLoad, setDbLoad] = useState(0); // requests processed in the last second
  const [phase, setPhase] = useState<"IDLE" | "RUNNING" | "WIN" | "LOSE">("IDLE");
  const [loseReason, setLoseReason] = useState("");
  
  const simTickRef = useRef<NodeJS.Timeout | null>(null);
  const refillTickRef = useRef<NodeJS.Timeout | null>(null);
  const dbTickRef = useRef<NodeJS.Timeout | null>(null);

  // Stop everything
  const stopSimulation = () => {
    if (simTickRef.current) clearInterval(simTickRef.current);
    if (refillTickRef.current) clearInterval(refillTickRef.current);
    if (dbTickRef.current) clearInterval(dbTickRef.current);
  };

  const startSimulation = () => {
    if (phase === "RUNNING") return;
    
    stopSimulation();
    setPhase("RUNNING");
    setRequests([]);
    setTokens(maxTokens);
    setDbLoad(0);
    setLoseReason("");
    playZap();

    let timeMs = 0;
    let reqIdCounter = 0;
    let dbLoadHistory: number[] = [];

    // Refill Interval
    refillTickRef.current = setInterval(() => {
       setTokens(prev => Math.min(prev + 1, maxTokens));
    }, 1000 / refillRate);

    // DB Load Tracking Interval
    dbTickRef.current = setInterval(() => {
       // Clear load every second
       setDbLoad(0);
       dbLoadHistory = [];
    }, 1000);

    // Main Simulation Tick (every 50ms)
    simTickRef.current = setInterval(() => {
       timeMs += 50;
       
       if (timeMs >= 10000) {
          // Simulation complete!
          stopSimulation();
          setPhase("WIN");
          playSuccess();
          setTimeout(reportComplete, 1500);
          return;
       }

       // Traffic Generation
       let numSpawns = 0;
       let spawnType: "normal" | "ddos" = "normal";

       // Normal Traffic: ~3 req/s -> 15% chance per 50ms tick
       if (Math.random() < 0.15) {
         numSpawns = 1;
         spawnType = "normal";
       }

       // DDoS Traffic: Spikes at t=3s and t=7s for 1 second (15 req/s -> 75% chance per 50ms tick)
       if ((timeMs >= 3000 && timeMs <= 4000) || (timeMs >= 7000 && timeMs <= 8000)) {
         if (Math.random() < 0.75) {
           numSpawns = 1;
           spawnType = "ddos";
         }
       }

       setRequests(prev => {
          let next = [...prev];

          // Spawn new
          for (let i=0; i<numSpawns; i++) {
             next.push({
                id: reqIdCounter++,
                type: spawnType,
                status: "pending",
                x: 350 + Math.random() * 200, // random x start
                y: 450
             });
          }

          // Move existing
          next = next.map(req => {
             if (req.status === "pending") {
                const nextY = req.y - 15;
                if (nextY <= 250) {
                   // Hit API Gateway
                   setTokens(currentTokens => {
                      if (currentTokens > 0) {
                         // Allowed
                         req.status = "allowed";
                         playPop();
                         return currentTokens - 1;
                      } else {
                         // Blocked
                         req.status = "blocked";
                         if (req.type === "normal") {
                            // Uh oh, blocked legitimate traffic
                            stopSimulation();
                            setPhase("LOSE");
                            setLoseReason("Legitimate User Traffic was Blocked! (Refill Rate too low or Bucket too small)");
                            playError();
                         }
                         return currentTokens;
                      }
                   });
                }
                return { ...req, y: nextY };
             } else if (req.status === "allowed") {
                const nextY = req.y - 15;
                if (nextY <= 100) {
                   // Hit DB
                   req.status = "processing";
                   setDbLoad(l => {
                      const newLoad = l + 1;
                      if (newLoad > 10) {
                         // DB Crash
                         stopSimulation();
                         setPhase("LOSE");
                         setLoseReason("Database Overloaded & Crashed! (Bucket size allowed too much burst traffic)");
                         playError();
                      }
                      return newLoad;
                   });
                }
                return { ...req, y: nextY };
             } else if (req.status === "blocked") {
                // Bounce down
                return { ...req, y: req.y + 15, x: req.x + (Math.random() > 0.5 ? 5 : -5) };
             }
             return req;
          });

          // Clean up offscreen
          return next.filter(r => r.y > -50 && r.y < 550 && r.status !== "processing");
       });

    }, 50);

  };

  useEffect(() => {
    return () => stopSimulation();
  }, []);

  const resetLab = () => {
    stopSimulation();
    setPhase("IDLE");
    setRequests([]);
    setDbLoad(0);
    setTokens(maxTokens);
    setLoseReason("");
  };

  return (
    <LabShell 
      labId="ratelimiting9" 
      theme="studio" 
      title="API Rate Limiter Tuning" 
      instruction="1. Learn why APIs require rate limiting to prevent abuse and ensure fair usage. 2. Monitor the API traffic in the simulation and identify instances of excessive requests. 3. Configure the rate limiting algorithms (e.g., token bucket) to throttle the traffic. 4. Test the API to ensure legitimate users are not blocked while abusive behavior is curtailed." 
      compact
      onReset={resetLab}
    >
      
      <Celebration isActive={phase === "WIN"} message="Perfect Configuration! Your rate limiter successfully absorbed the DDoS attacks while serving all legitimate users perfectly. The database remained stable." onReplay={resetLab} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Slider 1: Bucket Size */}
             <div className="flex flex-col gap-2">
                <div className="flex justify-between text-pink-700 font-bold text-xs uppercase">
                   <span className="flex items-center gap-1"><ShieldAlert size={14} /> Bucket Size (Burst Capacity)</span>
                   <span className="text-slate-700 font-mono">{maxTokens} tokens</span>
                </div>
                <input 
                   type="range" min="1" max="20" step="1" 
                   value={maxTokens} 
                   onChange={(e) => { setMaxTokens(Number(e.target.value)); setTokens(Number(e.target.value)); setPhase("IDLE"); }}
                   className="w-full accent-pink-500"
                   disabled={phase === "RUNNING"}
                />
             </div>

             {/* Slider 2: Refill Rate */}
             <div className="flex flex-col gap-2">
                <div className="flex justify-between text-pink-700 font-bold text-xs uppercase">
                   <span className="flex items-center gap-1"><Zap size={14} /> Refill Rate (Steady Flow)</span>
                   <span className="text-slate-700 font-mono">{refillRate} tokens/sec</span>
                </div>
                <input 
                   type="range" min="1" max="10" step="1" 
                   value={refillRate} 
                   onChange={(e) => { setRefillRate(Number(e.target.value)); setPhase("IDLE"); }}
                   className="w-full accent-pink-500"
                   disabled={phase === "RUNNING"}
                />
             </div>
          </div>

          <button 
             onClick={startSimulation} 
             disabled={phase === "RUNNING"}
             className="px-8 py-4 rounded-xl font-black bg-pink-50 border-2 border-pink-300 text-pink-700 hover:bg-pink-100 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2 h-16 whitespace-nowrap shadow-sm"
          >
             <Activity size={20}/> {phase === "LOSE" || phase === "WIN" ? "Restart Simulation" : "Run Simulation"}
          </button>

        </div>

        {/* Phase Indicator & Lose Reason */}
        {phase === "LOSE" && (
           <div className="shrink-0 text-center font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 animate-pulse shadow-sm">
              GAME OVER: {loseReason}
           </div>
        )}
        {phase === "RUNNING" && (
           <div className="shrink-0 text-center font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-2 shadow-sm">
              SIMULATION IN PROGRESS... PROTECT THE DATABASE!
           </div>
        )}

        {/* Main SVG Area */}
        <div className="flex-1 bg-slate-50 shadow-inner rounded-3xl overflow-x-auto overflow-y-hidden relative border border-slate-200 flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <RateLimitSVG tokens={tokens} maxTokens={maxTokens} requests={requests} dbLoad={dbLoad} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
