"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Gamepad2, Rocket, MessageSquare, Zap, BatteryWarning, Server, Smartphone, CheckCircle, Lightbulb, Wifi } from "lucide-react";

type ProtocolMode = "POLLING" | "WEBSOCKET";

// Packet type for animations
type Packet = {
  id: number;
  type: "POLL_REQ" | "POLL_EMPTY" | "POLL_DATA" | "WS_DATA" | "WS_HANDSHAKE";
  direction: "C2S" | "S2C";
  createdAt: number;
};

export default function WebSockets9() {
  const { reportComplete } = useLMSBridge("websockets9");
  const { playPop, playError, playSuccess, playClick } = useLabAudio();

  // Phase: 0=Intro, 1=Polling, 2=Understand (Unlock Upgrade), 3=Upgrading, 4=WebSocket, 5=Victory
  const [phase, setPhase] = useState<number>(0);
  const [mode, setMode] = useState<ProtocolMode>("POLLING");
  
  // Game Positions (0 to 100)
  const [clientPos, setClientPos] = useState<number>(50);
  const [serverPos, setServerPos] = useState<number>(50);
  
  // Telemetry
  const [wastedRequests, setWastedRequests] = useState(0);
  const [latencyMs, setLatencyMs] = useState(1200);
  const [wsFramesSent, setWsFramesSent] = useState(0);

  // Animation packets
  const [packets, setPackets] = useState<Packet[]>([]);
  const packetIdRef = useRef(0);

  // References for polling loop
  const clientPosRef = useRef(50);
  const serverPosRef = useRef(50);
  
  useEffect(() => {
    clientPosRef.current = clientPos;
  }, [clientPos]);

  useEffect(() => {
    serverPosRef.current = serverPos;
  }, [serverPos]);

  // Polling Loop
  useEffect(() => {
    if (mode !== "POLLING" || phase === 0 || phase >= 3) return;

    const interval = setInterval(() => {
      // 1. Client asks "Are we there yet?"
      const reqId = packetIdRef.current++;
      setPackets((prev) => [...prev, { id: reqId, type: "POLL_REQ", direction: "C2S", createdAt: Date.now() }]);
      playPop();

      // 2. Server responds after 600ms (half the lag)
      setTimeout(() => {
        const cPos = clientPosRef.current;
        const sPos = serverPosRef.current;
        
        const resId = packetIdRef.current++;
        if (cPos !== sPos) {
          // Data changed!
          setPackets((prev) => [...prev, { id: resId, type: "POLL_DATA", direction: "S2C", createdAt: Date.now() }]);
          setServerPos(cPos); // Server updates its state
        } else {
          // No data changed, wasted request
          setPackets((prev) => [...prev, { id: resId, type: "POLL_EMPTY", direction: "S2C", createdAt: Date.now() }]);
          setWastedRequests((prev) => {
            const next = prev + 1;
            if (next >= 5 && phase === 1) {
              setPhase(2); // Unlock upgrade after 5 wasted requests
              playError();
            }
            return next;
          });
        }
      }, 600);

    }, 1200); // Poll every 1.2s

    return () => clearInterval(interval);
  }, [mode, phase, playPop, playError]);

  // Cleanup old packets immediately after they finish animating to prevent visual pile-ups
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const maxAge = mode === "WEBSOCKET" ? 400 : 900; // slightly longer than duration
      setPackets((prev) => prev.filter(p => now - p.createdAt < maxAge));
    }, 200);
    return () => clearInterval(cleanup);
  }, [mode]);

  // Handle Joystick Input
  const handleJoystick = (val: number) => {
    if (phase === 0) setPhase(1); // Start interacting
    
    setClientPos(val);
    
    if (mode === "WEBSOCKET") {
      // Instant streaming!
      setServerPos(val);
      setWsFramesSent((prev) => prev + 1);
      
      // Add a tiny dot packet
      const pid = packetIdRef.current++;
      setPackets((prev) => [...prev, { id: pid, type: "WS_DATA", direction: "C2S", createdAt: Date.now() }]);
      
      if (phase === 4 && wsFramesSent > 30) {
        setPhase(5); // Victory!
        playSuccess();
        reportComplete();
      }
    }
  };

  const handleUpgrade = () => {
    playClick();
    setPhase(3); // Upgrading handshake
    
    // Handshake animation
    const hsId = packetIdRef.current++;
    setPackets((prev) => [...prev, { id: hsId, type: "WS_HANDSHAKE", direction: "C2S", createdAt: Date.now() }]);
    
    setTimeout(() => {
      setMode("WEBSOCKET");
      setPhase(4);
      setLatencyMs(12); // Buttery smooth!
      playSuccess();
    }, 1500);
  };

  const resetLab = () => {
    setPhase(0);
    setMode("POLLING");
    setClientPos(50);
    setServerPos(50);
    setWastedRequests(0);
    setLatencyMs(1200);
    setWsFramesSent(0);
    setPackets([]);
    packetIdRef.current = 0;
  };

  const currentInstruction = phase === 0 ? "Drag the blue controller to move your ship. Notice how the server's rocket is lagging behind?" :
    phase === 1 ? "In 'Polling', your phone has to ask the server 'Any updates?' every second. It's incredibly slow!" :
    phase === 2 ? "When you stand still, your phone is STILL asking! Look at all those wasted 'Nope' messages. It drains your battery." :
    phase === 3 ? "Upgrading to a WebSocket connection..." :
    phase === 4 ? "WebSockets keep the connection OPEN! Move your ship now. The server gets your move instantly." :
    "Mission Complete! You fixed the game lag by upgrading the network.";

  return (
    <LabShell
      labId="websockets9"
      title="Real-Time Data: WebSockets vs Polling"
      instruction={currentInstruction}
      compact={true}
      onReset={resetLab}
      bgOverride="bg-slate-50"
      theme="ocean"
    >
      {/* Ocean Theme Background */}
      <div className="absolute inset-0 bg-slate-50 overflow-hidden z-0">
        <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ws" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-ws)" />
        </svg>
      </div>

      {/* Main Layout */}
      <div className="relative z-10 w-full h-full flex flex-col p-4 sm:p-6 pt-16 sm:pt-20 gap-4">
        
        {/* Dynamic Instruction Banner */}
        <div className="w-full bg-white border-2 border-sky-200 text-sky-900 rounded-xl p-3 sm:p-4 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4 z-20">
          <div className="bg-sky-100 p-2 rounded-lg shrink-0">
            <Lightbulb className="text-sky-600" size={20} />
          </div>
          <p className="text-sm sm:text-base font-semibold leading-snug">
            {currentInstruction}
          </p>
        </div>
        
        {/* Top Control Bar */}
        <div className="w-full flex justify-between items-center bg-white border border-slate-200 rounded-xl p-3 shadow-sm h-16">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${mode === "POLLING" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
              {mode === "POLLING" ? <Wifi size={20} /> : <Zap size={20} />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide leading-tight">Connection Type</h2>
              <p className={`text-xs font-mono font-bold leading-tight ${mode === "POLLING" ? "text-amber-500" : "text-emerald-500"}`}>
                {mode === "POLLING" ? "REPEATED ASKING (POLLING)" : "OPEN STREAM (WEBSOCKET)"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <AnimatePresence>
              {phase === 2 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleUpgrade}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow-md shadow-emerald-500/20 flex items-center gap-2 animate-pulse"
                >
                  <Zap size={14} />
                  Upgrade to WebSocket
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Central Canvas (Client -> Pipe -> Server) */}
        <div className="flex-1 w-full flex items-center justify-between gap-4 sm:gap-8 relative">
          
          {/* CLIENT NODE (PHONE) */}
          <div className="w-24 sm:w-32 h-full bg-white border-2 border-slate-200 rounded-2xl shadow-sm flex flex-col items-center py-4 z-20 relative">
            <div className="bg-slate-100 p-2 rounded-full mb-2">
              <Smartphone size={24} className="text-slate-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Your Phone</h3>
            
            {/* Joystick Area */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative">
              <div className="absolute inset-y-0 w-8 bg-slate-200 rounded-full shadow-inner flex justify-center">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={100 - clientPos} // Invert so UP is 0 in slider, but visually top
                  onChange={(e) => handleJoystick(100 - parseInt(e.target.value))}
                  className="absolute w-8 h-full opacity-0 cursor-pointer z-20 pointer-events-auto"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                />
                {/* Player Avatar */}
                <motion.div 
                  className="absolute w-12 h-12 bg-blue-500 rounded-full shadow-md z-10 flex items-center justify-center pointer-events-none"
                  animate={{ top: `${clientPos}%` }}
                  transition={{ type: "tween", duration: 0.05 }}
                  style={{ marginTop: '-24px' }}
                >
                  <Gamepad2 size={20} className="text-white" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* THE NETWORK PIPE */}
          <div className="flex-1 h-32 relative flex items-center z-10">
            {/* Pipe Background */}
            <div className={`w-full h-16 sm:h-20 rounded-full border-y-2 border-slate-300 relative transition-all duration-700 ${mode === "WEBSOCKET" ? "bg-emerald-50 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-slate-100"}`}>
              {/* Glowing WebSocket Beam */}
              {mode === "WEBSOCKET" && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-30 rounded-full"></div>
              )}

              {/* Packets */}
              <AnimatePresence>
                {packets.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ 
                      left: p.direction === "C2S" ? "15%" : "85%", 
                      x: "-50%",
                      y: "-50%",
                      opacity: 0,
                    }}
                    animate={{ 
                      left: p.direction === "C2S" ? "85%" : "15%",
                      x: "-50%",
                      y: "-50%",
                      opacity: [0, 1, 1, 0],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: mode === "WEBSOCKET" ? 0.3 : 0.8, 
                      times: [0, 0.2, 0.8, 1],
                      ease: "linear" 
                    }}
                    className="absolute z-30"
                    style={{ 
                      top: p.direction === "C2S" ? "30%" : "70%", 
                    }}
                  >
                    {p.type === "POLL_REQ" && (
                      <div className="bg-white border border-slate-300 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-slate-400" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 whitespace-nowrap">"Any updates?"</span>
                      </div>
                    )}
                    {p.type === "POLL_EMPTY" && (
                      <div className="bg-amber-100 border border-amber-300 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-amber-500" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 whitespace-nowrap">"Nope."</span>
                      </div>
                    )}
                    {p.type === "POLL_DATA" && (
                      <div className="bg-blue-100 border border-blue-300 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-blue-500" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 whitespace-nowrap">"Player moved!"</span>
                      </div>
                    )}
                    {p.type === "WS_HANDSHAKE" && (
                      <div className="bg-emerald-100 border border-emerald-400 shadow-lg rounded-full px-3 py-1.5 flex items-center gap-1.5">
                        <Zap size={14} className="text-emerald-600" />
                        <span className="text-[10px] sm:text-[12px] font-bold text-emerald-800 whitespace-nowrap">"Keep connection open!"</span>
                      </div>
                    )}
                    {p.type === "WS_DATA" && (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]"></div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* SERVER NODE (GAME SERVER) */}
          <div className="w-24 sm:w-32 h-full bg-slate-800 border-2 border-slate-700 rounded-2xl shadow-xl flex flex-col items-center py-4 z-20 relative overflow-hidden">
            <div className="bg-slate-700 p-2 rounded-lg mb-2 shadow-inner">
              <Server size={24} className="text-cyan-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Game Server</h3>
            
            {/* Server Avatar Representation */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative">
              <div className="absolute inset-y-0 w-8 bg-slate-700/50 rounded-full shadow-inner flex justify-center">
                <motion.div 
                  className="absolute w-12 h-12 bg-indigo-500 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] rounded-full z-0 flex items-center justify-center"
                  animate={{ top: `${serverPos}%` }}
                  transition={{ 
                    type: mode === "WEBSOCKET" ? "spring" : "tween", 
                    duration: mode === "WEBSOCKET" ? 0.1 : 0.2 
                  }}
                  style={{ marginTop: '-24px' }}
                >
                  <Rocket size={20} className="text-white" />
                </motion.div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Telemetry Dashboard */}
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 mt-auto z-20">
          
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-center">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">How it communicates</span>
            <div className="flex items-center gap-2">
              {mode === "POLLING" ? (
                <span className="text-xs sm:text-sm font-bold text-amber-600">Repeated Asking</span>
              ) : (
                <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle size={16} /> Open Stream
                </span>
              )}
            </div>
          </div>

          <div className={`border rounded-xl p-3 shadow-sm flex flex-col transition-colors duration-500 ${wastedRequests > 0 && mode === "POLLING" ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wasted Messages</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl sm:text-2xl font-black leading-none ${mode === "POLLING" ? "text-amber-600" : "text-slate-700"}`}>
                {mode === "POLLING" ? wastedRequests : "0"}
              </span>
              <span className={`text-[10px] sm:text-xs font-bold ${mode === "POLLING" ? "text-amber-700" : "text-slate-500"}`}>
                useless checks
              </span>
            </div>
          </div>

          <div className={`border rounded-xl p-3 shadow-sm flex flex-col transition-colors duration-500 ${mode === "WEBSOCKET" ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Game Lag</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl sm:text-2xl font-black leading-none ${mode === "WEBSOCKET" ? "text-emerald-600" : "text-amber-600"}`}>
                {latencyMs}
              </span>
              <span className={`text-[10px] sm:text-xs font-bold ${mode === "WEBSOCKET" ? "text-emerald-700" : "text-slate-500"}`}>
                ms ping
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Victory Celebration */}
      <AnimatePresence>
        {phase === 5 && (
          <Celebration
            isActive={phase === 5}
            message="Zero Lag Achieved! WebSockets establish an open pipe, eliminating the massive overhead of HTTP polling. You just saved 98% of your phone's battery and bandwidth!"
            onReplay={resetLab}
          />
        )}
      </AnimatePresence>
    </LabShell>
  );
}
