"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ArrowLeftRight, Clock, Zap , Timer} from "lucide-react";

// ─── SVG WebSockets Visualizer ────────────────────────────────────────────────

type Packet = { id: number; type: "REQ" | "EMPTY_RES" | "DATA"; x: number; y: number };

function WebSocketsSVG({
  mode,
  packets,
  isConnected
}: {
  mode: "POLLING" | "WEBSOCKETS";
  packets: Packet[];
  isConnected: boolean;
}) {
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-ws">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridNet" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridNet)" />

      {/* ── Network Pipe ── */}
      <rect x="250" y="220" width="400" height="60" fill="#0f172a" stroke="#334155" strokeWidth="4" />
      
      {/* WebSocket Glowing Tunnel */}
      {mode === "WEBSOCKETS" && isConnected && (
         <rect x="250" y="230" width="400" height="40" fill="#fb7185" opacity="0.2" filter="url(#glow-ws)" />
      )}
      {mode === "WEBSOCKETS" && isConnected && (
         <path d="M 250,250 L 650,250" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="10 10" className="animate-[dash_1s_linear_infinite]" filter="url(#glow-ws)" />
      )}

      {/* ── Client (Left) ── */}
      <g transform="translate(150, 250)">
        <circle cx="0" cy="0" r="60" fill="#1e293b" stroke="#cbd5e1" strokeWidth="4" />
        <text x="0" y="5" fill="#fff" fontSize="18" fontWeight="black" textAnchor="middle">CLIENT</text>
        
        {/* State Indicator */}
        <rect x="-40" y="30" width="80" height="20" fill="#020617" rx="4" />
        <text x="0" y="44" fill={mode === "POLLING" ? "#f59e0b" : "#10b981"} fontSize="10" fontWeight="bold" textAnchor="middle">
          {mode === "POLLING" ? "Asking every 1s..." : "Listening Instantly"}
        </text>
      </g>

      {/* ── Server (Right) ── */}
      <g transform="translate(750, 250)">
        <rect x="-50" y="-70" width="100" height="140" fill="#1e1b4b" rx="8" stroke="#f43f5e" strokeWidth="4" />
        <text x="0" y="5" fill="#a5b4fc" fontSize="18" fontWeight="black" textAnchor="middle">SERVER</text>
        
        {/* Server State */}
        <text x="0" y="40" fill="#f43f5e" fontSize="10" textAnchor="middle">New Data Available?</text>
        <circle cx="0" cy="55" r="5" fill={packets.some(p => p.type === "DATA" && p.x > 500) ? "#10b981" : "#4c0519"} filter="url(#glow-ws)" />
      </g>

      {/* ── Packets in Transit ── */}
      <AnimatePresence>
        {packets.map(p => {
          const isData = p.type === "DATA";
          const isReq = p.type === "REQ";
          
          return (
            <motion.g 
              key={p.id}
              initial={{ x: isReq ? 210 : 690, y: isReq ? 240 : 260, scale: 0 }}
              animate={{ x: isReq ? 690 : 210, y: isReq ? 240 : 260, scale: 1 }}
              transition={{ duration: 0.8, ease: "linear" }}
              exit={{ opacity: 0, scale: 0 }}
            >
              {isReq && (
                <g>
                  <rect x="-15" y="-10" width="30" height="20" fill="#f59e0b" rx="4" />
                  <text x="0" y="3" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">REQ?</text>
                </g>
              )}
              {p.type === "EMPTY_RES" && (
                <g>
                  <rect x="-15" y="-10" width="30" height="20" fill="#475569" rx="4" />
                  <text x="0" y="3" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">NO</text>
                </g>
              )}
              {isData && (
                <g filter="url(#glow-ws)">
                  <rect x="-20" y="-15" width="40" height="30" fill="#34d399" rx="4" stroke="#fff" strokeWidth="2" />
                  <text x="0" y="4" fill="#000" fontSize="12" fontWeight="black" textAnchor="middle">DATA!</text>
                </g>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const TIMER_DURATION_SECONDS = 5 * 60;

export default function WebSockets9() {
  const { reportComplete: _reportComplete } = useLMSBridge("websockets9");

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLabComplete, setIsLabComplete] = useState(false);

  const reportComplete = useCallback((args?: any) => {
    setIsLabComplete(true);
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  useEffect(() => {
    if (timedOut || isLabComplete) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timedOut, isLabComplete]);

  useEffect(() => {
    if (timedOut) {
      _reportComplete({ points: 0 });
    }
  }, [timedOut, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const { playPop, playZap, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<"POLLING" | "WEBSOCKETS">("POLLING");
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const packetIdRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (mode === "POLLING") {
      // Start polling loop
      intervalRef.current = setInterval(() => {
        const reqId = ++packetIdRef.current;
        playPop();
        // Client shoots REQ
        setPackets(prev => [...prev, { id: reqId, type: "REQ", x: 0, y: 0 }]);
        
        // Server responds NO after 0.8s (transit time)
        setTimeout(() => {
          const resId = ++packetIdRef.current;
          setPackets(prev => prev.filter(p => p.id !== reqId)); // remove req
          setPackets(prev => [...prev, { id: resId, type: "EMPTY_RES", x: 0, y: 0 }]);
          
          // Remove res after transit
          setTimeout(() => {
             setPackets(prev => prev.filter(p => p.id !== resId));
          }, 800);
        }, 800);
      }, 2000);
    } else {
      // WebSocket Mode
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPackets([]);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, playPop]);

  const triggerWebSocketHandshake = () => {
    playZap();
    setIsConnected(true);
    // Nothing else happens until Server specifically PUSHES data
  };

  const triggerServerPush = () => {
    const dataId = ++packetIdRef.current;
    playSuccess();
    
    // Server instantly shoots DATA without being asked
    setPackets(prev => [...prev, { id: dataId, type: "DATA", x: 0, y: 0 }]);
    
    setTimeout(() => {
       setPackets(prev => prev.filter(p => p.id !== dataId));
       if (mode === "WEBSOCKETS" && !hasWon) {
         setHasWon(true);
         setTimeout(reportComplete, 1500);
       }
    }, 800);
  };

  const toggleMode = () => {
    setMode(m => m === "POLLING" ? "WEBSOCKETS" : "POLLING");
    setIsConnected(false);
    setPackets([]);
    setHasWon(false);
  };

  return (
    <LabShell
      navExtra={
        !isLabComplete && (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 30 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-sky-100/80 text-sky-700"
          }`}>
            <Timer size={16} strokeWidth={2.5} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      } labId="websockets9" theme="neon" title="Real-Time Data: WebSockets vs Polling" subtitle="L30 · Network Protocols"
      instruction="In Polling Mode, the Client blindly asks 'Any updates?' every 2 seconds, wasting bandwidth with empty responses. Switch to WebSockets, open the connection, and notice the silence. Now, trigger a 'Server Push'. The data is sent instantly without the client ever asking." compact>
      
      <Celebration isActive={hasWon} message="Bi-Directional Communication! WebSockets keep a permanent pipe open. This is how multiplayer games and chat apps work—the server PUSHES data the millisecond it happens, rather than waiting for the client to ask." onReplay={toggleMode} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 panel-glass rounded-2xl border-rose-900/50 p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <button 
            onClick={toggleMode} 
            className={`px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all border-2 w-full md:w-auto ${mode === "POLLING" ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-rose-600/20 border-rose-500/50/50 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]"}`}
          >
            <Clock size={20}/> Mode: {mode === "POLLING" ? "HTTP Long-Polling" : "WebSocket (TCP)"}
          </button>
          
          <div className="flex gap-3">
            {mode === "WEBSOCKETS" && !isConnected && (
              <button 
                onClick={triggerWebSocketHandshake} 
                className="px-6 py-3 rounded-xl font-black bg-rose-600/20 border-2 border-rose-500/50/50 text-blue-400 hover:bg-rose-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <ArrowLeftRight size={18}/> Open WS Connection
              </button>
            )}
            
            <button 
              onClick={triggerServerPush} 
              disabled={mode === "WEBSOCKETS" && !isConnected}
              className="px-8 py-3 rounded-xl font-black bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
            >
              <Zap size={18}/> Server: Push Data
            </button>
          </div>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-rose-900/40 bg-[#0a0a0a] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <WebSocketsSVG mode={mode} packets={packets} isConnected={isConnected} />
          </div>
        </div>

      </div>
    
      {timedOut && !isLabComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm text-center mx-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1.5">Time's Up!</h3>
            <p className="text-sm font-medium text-slate-600 mb-4">
              You did not complete the lab in time.
            </p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-1 shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none text-white rounded-xl text-sm font-bold transition-all cursor-pointer">
              Try Again
            </button>
          </div>
        </div>
      )}
</LabShell>
  );
}
