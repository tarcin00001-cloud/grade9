"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ArrowLeftRight, Clock, Zap } from "lucide-react";

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

export default function WebSockets9() {
  const { reportComplete } = useLMSBridge("websockets9");
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
    <LabShell labId="websockets9" theme="neon" title="Real-Time Data: WebSockets vs Polling" subtitle="L30 · Network Protocols"
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
    </LabShell>
  );
}
