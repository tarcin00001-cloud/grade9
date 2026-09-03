"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Trash2, Shield, Settings, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Celebration from '@/components/Celebration';
import LabShell from "@/components/LabShell";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";

// Types
type Packet = { id: number; type: 'good' | 'bad'; y: number; x: number; status: 'moving' | 'dropped' | 'processed' };

export default function RateLimiting9() {
  const [stage, setStage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const [health, setHealth] = useState(100);
  const [capacity, setCapacity] = useState(10);
  const [refillRate, setRefillRate] = useState(5);
  const [tokens, setTokens] = useState(10);
  
  const [stats, setStats] = useState({ droppedBad: 0, processedGood: 0, droppedGood: 0, processedBad: 0 });
  const [showModal, setShowModal] = useState(false);
  const { reportComplete } = useLMSBridge("ratelimiting9");
  const { playError, playSuccess } = useLabAudio();

  // Decoupled Physics Engine state
  const physics = useRef({
    packets: [] as Packet[],
    health: 100,
    tokens: 10,
    stats: { droppedBad: 0, processedGood: 0, droppedGood: 0, processedBad: 0 },
    lastGoodSpawn: 0,
    lastBadSpawn: 0,
    burstCount: 0,
    lastRefill: 0
  });

  // React state just for painting frames
  const [renderPackets, setRenderPackets] = useState<Packet[]>([]);

    useEffect(() => {
    const FPS = 30;
    const interval = setInterval(() => {
      // We only run physics in active stages
      if (![1, 2, 3, 6].includes(stage)) return;

      const now = Date.now();
      const p = physics.current;
      
      // 1. REFILL TOKENS
      if (stage === 6) {
        if (now - p.lastRefill > (1000 / refillRate)) {
          p.tokens = Math.min(capacity, p.tokens + 1);
          p.lastRefill = now;
        }
      } else {
        p.tokens = capacity; // Infinite tokens if limiter off
      }

      // 2. SPAWN PACKETS
      if (now - p.lastGoodSpawn > 2000) {
        p.burstCount = 5;
        p.lastGoodSpawn = now;
      }
      if (p.burstCount > 0 && Math.random() > 0.4) {
        p.packets.push({ id: Math.random(), type: 'good', y: 0, x: 50 + (Math.random() * 8 - 4), status: 'moving' });
        p.burstCount--;
      }

      if ((stage === 3 || stage === 6) && now - p.lastBadSpawn > 50) { // 20 bad packets/sec
        p.packets.push({ id: Math.random(), type: 'bad', y: 0, x: 50 + (Math.random() * 8 - 4), status: 'moving' });
        p.lastBadSpawn = now;
      }

      // 3. MOVE & EVALUATE
      const speed = stage === 3 ? 6 : 4; // Faster crash in stage 3
      const bouncerY = 50;
      const serverY = 90;

      for (let i = 0; i < p.packets.length; i++) {
        let pkt = p.packets[i];
        if (pkt.status === 'moving') {
          const oldY = pkt.y;
          pkt.y += speed;

          if (oldY < bouncerY && pkt.y >= bouncerY && stage === 6) {
            if (p.tokens > 0) {
              p.tokens--;
            } else {
                if (pkt.type === 'good' && capacity >= 10 && refillRate <= 10 && refillRate >= 4) { }
                else { pkt.status = 'dropped'; if (pkt.type === 'bad') p.stats.droppedBad++; if (pkt.type === 'good') p.stats.droppedGood++; }
            }
          }

          if (pkt.y >= serverY && pkt.status === 'moving') {
            pkt.status = 'processed';
            if (pkt.type === 'bad') {
              p.health -= 2;
              p.stats.processedBad++;
            } else {
              p.stats.processedGood++;
            }
            if (stage === 6 && refillRate > 12) {
                p.health -= 0.5; // Penalty for dangerously loose rate
            }
          }
        }
      }

      // Passive heal
      if (p.health > 0 && p.health < 100 && stage !== 3) {
        p.health = Math.min(100, p.health + 0.2);
      }

      // Cleanup
      p.packets = p.packets.filter(pkt => pkt.y < 110 && (pkt.status === 'moving' || pkt.y < bouncerY + 20));

      // Trigger Game Over Logic
      if (stage === 3 && p.health <= 0) {
        setStage(4);
        setShowModal(true);
        playError();
      }

      if (stage === 6) {
        if (p.health <= 0 || p.stats.droppedGood >= 3) {
          setStage(5);
          setShowModal(true);
          playError();
          p.health = 100;
          p.packets = [];
        } else if (p.stats.droppedBad > 60) {
          setStage(7);
          playSuccess();
          reportComplete({ points: 100 });
        }
      }

      // Push to React for rendering
      setRenderPackets([...p.packets]);
      setTokens(p.tokens);
      setHealth(Math.max(0, p.health));
      setStats({ ...p.stats });

    }, 1000 / FPS);

    return () => clearInterval(interval);
  }, [stage, capacity, refillRate, playError, playSuccess, reportComplete]);

  const handleLaunchBotnet = () => {
    setStage(3);
  };

  const handleTestDefense = () => {
    physics.current.health = 100;
    physics.current.tokens = capacity;
    physics.current.stats = { droppedBad: 0, processedGood: 0, droppedGood: 0, processedBad: 0 };
    physics.current.packets = [];
    setHealth(100);
    setTokens(capacity);
    setStats({ droppedBad: 0, processedGood: 0, droppedGood: 0, processedBad: 0 });
    setStage(6);
  };


  const handleReset = () => {
    setStage(1);
    setShowModal(false);
    setCapacity(10);
    setRefillRate(6);
    physics.current = {
      packets: [],
      health: 100,
      tokens: 10,
      stats: { droppedBad: 0, processedGood: 0, droppedGood: 0, processedBad: 0 },
      lastGoodSpawn: 0,
      lastBadSpawn: 0,
      burstCount: 0,
      lastRefill: 0
    };
    setRenderPackets([]);
    setHealth(100);
    setTokens(10);
    setStats({ droppedBad: 0, droppedGood: 0, processedGood: 0, processedBad: 0 });
  };
  return (
    <LabShell 
      bgOverride="bg-slate-200" labId="ratelimiting9"
      title="API Rate Limiter Tuning" 
      instruction="Configure a Token Bucket firewall to defend the server from a DDoS botnet, without blocking real users."
      compact={true}
      onReset={handleReset}
    >
      <Celebration isActive={stage === 7} />
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 sm:p-6 min-h-0 relative">
        

          {/* External Diegetic Sticky Notes */}
          {isMounted && stage <= 2 && (
            <div className="absolute top-12 left-2 sm:top-16 sm:-left-12 md:-left-24 lg:-left-32 xl:-left-40 bg-yellow-200 p-4 w-64 shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-3 z-50 border border-yellow-300 transform transition-transform hover:rotate-0">
               <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
               <p className="font-mono text-sm text-slate-800 font-bold leading-tight">
                 Task: Configure a Token Bucket firewall to defend the server from a DDoS botnet, without blocking real users.
               </p>
            </div>
          )}
          {isMounted && stage === 5 && (
            <div className="absolute top-12 left-2 sm:top-16 sm:-left-12 md:-left-24 lg:-left-32 xl:-left-40 bg-yellow-200 p-4 w-72 shadow-[2px_5px_15px_rgba(0,0,0,0.4)] rotate-[-2deg] z-50 border border-yellow-300 transform transition-transform hover:rotate-0">
               <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-200/50 border border-slate-300/30 rotate-[-2deg] shadow-sm backdrop-blur-sm" />
               <p className="font-mono text-[10px] text-slate-800 font-bold leading-tight mb-2 uppercase border-b border-yellow-300/50 pb-1">Sysadmin Note</p>
               <p className="font-mono text-[11px] text-slate-800 font-bold leading-relaxed">
                 - Users send bursts of <b>5</b> packets. Capacity must absorb this.<br/>
                 - Botnet sends <b>20</b> pkt/sec. Keep Refill low (under 10) so they can't crash the API Core!
               </p>
            </div>
          )}
        {/* THE HARDWARE CHASSIS */}
        <div className="flex-1 w-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-[2rem] border-[12px] border-slate-600 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5),0_20px_40px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col sm:flex-row p-6 gap-6">
          
          {/* HARDWARE SCREWS */}
          <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 shadow-inner border border-slate-700 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-800 rotate-45"></div></div>
          <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 shadow-inner border border-slate-700 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-800 -rotate-12"></div></div>

          <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 shadow-inner border border-slate-700 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-800 rotate-90"></div></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 shadow-inner border border-slate-700 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-800 rotate-180"></div></div>

          {/* BACKGROUND VENTS */}
          <div className="absolute left-6 top-16 bottom-16 w-12 flex flex-col justify-between opacity-20">
             {[...Array(15)].map((_, i) => <div key={i} className="h-2 w-full bg-black rounded-full shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />)}
          </div>

          {/* LEFT: SIMULATION GLASS TUBE */}
          <div className="flex-1 bg-slate-950 rounded-2xl border-4 border-slate-900 shadow-[inset_0_0_50px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col items-center justify-between ml-16 z-10">
            
            {/* The Fiber Optic Pipe Background */}
            <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-slate-900/0 via-slate-700/20 to-slate-900/0 border-x border-slate-700/50 flex justify-center shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
               <div className="w-[2px] h-full bg-cyan-900/30" />
            </div>

            {/* PACKETS RENDERER */}
            {renderPackets.map(p => {
               if (p.status === 'moving') {
                  return (
                    <div
                      key={p.id}
                      className={`absolute w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] z-20 ${p.type === 'good' ? 'bg-cyan-400 text-cyan-400' : 'bg-red-500 text-red-500'}`}
                      style={{ top: `${p.y}%`, left: `${p.x}%` }}
                    />
                  );
               } else if (p.status === 'dropped') {
                  return (
                    <motion.div
                      key={p.id}
                      className={`absolute w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] z-20 ${p.type === 'good' ? 'bg-cyan-400 text-cyan-400' : 'bg-red-500 text-red-500'}`}
                      initial={{ top: `${p.y}%`, left: `${p.x}%` }}
                      animate={{ top: '50%', left: '80%', opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3 }}
                    />
                  );
               } else {
                  return (
                    <motion.div
                      key={p.id}
                      className={`absolute w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] z-20 ${p.type === 'good' ? 'bg-cyan-400 text-cyan-400' : 'bg-red-500 text-red-500'}`}
                      initial={{ top: `${p.y}%`, left: `${p.x}%` }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 0.2 }}
                    />
                  );
               }
            })}

            {/* INTERNET SOURCE */}
            <div className="relative w-40 py-2 bg-slate-800 rounded-b-xl border-b-4 border-x-4 border-slate-700 flex flex-col items-center justify-center z-30 shadow-2xl">
              <div className="w-16 h-2 bg-cyan-900 rounded-full mb-1 overflow-hidden"><div className="w-1/2 h-full bg-cyan-400 animate-pulse" /></div>
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Uplink Port</span>
            </div>

            {/* THE TOKEN BUCKET GLASS MODULE */}
            {stage >= 5 && (
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center z-30 w-full justify-center gap-4">
                 
                 {/* Glass Tank */}
                 <div className="relative w-16 h-24 bg-slate-900/80 rounded-xl border-2 border-slate-600 shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col justify-end p-1 backdrop-blur-sm">
                    <div className="absolute top-1 w-full text-center text-[8px] font-black text-slate-500 tracking-widest z-10">CAPACITY</div>
                    <div className="w-full bg-cyan-500/80 rounded-lg transition-all duration-100 ease-linear shadow-[0_0_20px_rgba(34,211,238,0.8)] border-t border-cyan-300" style={{ height: `${(tokens / capacity) * 100}%` }} />
                 </div>

                 {/* Valve Status */}
                 <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 mt-16 w-48 flex justify-center">
                    <div className={`px-4 py-1 rounded-full border-2 font-black text-[10px] tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md ${tokens > 0 ? 'bg-slate-900/90 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-red-950/90 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
                      <Settings size={14} className={tokens === 0 ? "animate-spin" : ""} /> {tokens > 0 ? 'VALVE OPEN' : 'DEFLECTING'}
                    </div>
                 </div>

                 {/* Waste Pipe */}
                 <div className="absolute right-4 top-1/2 flex flex-col items-center gap-1 z-30">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg border-4 border-slate-700 shadow-inner flex flex-col items-center justify-center">
                       <Trash2 size={16} className="text-slate-500 mb-1" />
                       <div className="text-[8px] font-black flex gap-2">
                         <span className="text-red-500">{stats.droppedBad}</span>
                         <span className="text-cyan-600">{stats.droppedGood}</span>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* API SERVER CORE */}
            <div className="relative mb-4 flex flex-col items-center z-30">
               {health <= 0 && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -inset-10 bg-red-500/40 blur-2xl rounded-full" />
               )}
               <div className={`w-40 h-24 rounded-2xl border-4 flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.1)] transition-colors duration-300 relative overflow-hidden ${health > 50 ? 'bg-slate-800 border-slate-600' : health > 0 ? 'bg-amber-900 border-amber-600' : 'bg-red-950 border-red-600'}`}>
                  {/* Server Grill Texture */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>
                  <Server size={32} className={`relative z-10 ${health > 50 ? 'text-cyan-500' : health > 0 ? 'text-amber-500' : 'text-red-500'}`} />
                  <div className="w-24 h-3 bg-slate-950 rounded-full mt-3 overflow-hidden border border-slate-900 shadow-inner relative z-10">
                     <div className={`h-full transition-all duration-300 ${health > 50 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} style={{ width: `${health}%` }} />
                  </div>
               </div>
               <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-2 drop-shadow-md">API Core Processor</span>
            </div>
          </div>

          {/* RIGHT: HARDWARE CONTROL PANEL & STICKY NOTE */}
          <div className="w-full sm:w-80 flex flex-col justify-center gap-6 relative z-20">



             {/* Diegetic Sticky Note for early stages */}
             {/* Action Panel */}
             {stage <= 2 && (
               <div className="bg-slate-800 p-6 rounded-2xl border-4 border-slate-700 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.5)]">
                  <h3 className="font-black text-slate-300 text-lg tracking-widest uppercase mb-2 flex items-center gap-2"><ShieldCheck className="text-emerald-500"/> SYSTEM NOMINAL</h3>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">Traffic flowing. Awaiting simulated load test.</p>
                  
                  {stage === 1 ? (
                    <button onClick={() => setStage(2)} className="w-full bg-cyan-600 text-white font-black uppercase tracking-widest px-6 py-4 rounded-xl border-b-8 border-cyan-800 active:border-b-4 active:translate-y-1 hover:bg-cyan-500 transition-all shadow-[0_5px_15px_rgba(8,145,178,0.4)]">Initialize Setup</button>
                  ) : (
                    <button onClick={handleLaunchBotnet} className="w-full bg-red-600 text-white font-black uppercase tracking-widest px-6 py-4 rounded-xl border-b-8 border-red-800 active:border-b-4 active:translate-y-1 hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center gap-2">
                       <AlertTriangle /> LAUNCH BOTNET
                    </button>
                  )}
               </div>
             )}

             {/* SRE Faders (Stage 5/6) */}
             {(stage === 5 || stage === 6) && (
               <div className="bg-slate-800 p-6 rounded-2xl border-4 border-slate-700 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.5)] flex flex-col gap-6">
                  <div className="border-b-2 border-slate-700 pb-2">
                     <h3 className="font-black text-slate-300 tracking-widest uppercase text-sm">Hardware Calibration</h3>
                  </div>
                  
                  {/* Fader 1 */}
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bucket Capacity</span>
                        <span className="text-xs font-black text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">{capacity} TOK</span>
                     </div>
                     <input 
                       type="range" min="1" max="20" step="1" 
                       value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}
                       disabled={stage === 6}
                       className="w-full h-4 bg-slate-900 rounded-full appearance-none shadow-inner border border-slate-700 disabled:opacity-50 cursor-pointer outline-none slider-thumb-metal"
                     />
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Burst Limit Control</p>
                  </div>

                  {/* Fader 2 */}
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refill Rate</span>
                        <span className="text-xs font-black text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">{refillRate} / SEC</span>
                     </div>
                     <input 
                       type="range" min="2" max="25" step="1" 
                       value={refillRate} onChange={(e) => setRefillRate(Number(e.target.value))}
                       disabled={stage === 6}
                       className="w-full h-4 bg-slate-900 rounded-full appearance-none shadow-inner border border-slate-700 disabled:opacity-50 cursor-pointer outline-none slider-thumb-metal"
                     />
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Sustained Flow Control</p>
                  </div>

                  {/* Custom CSS for slider thumbs since Tailwind doesn't have pseudo element classes by default without plugins */}
                  <style dangerouslySetInnerHTML={{__html: `
                    .slider-thumb-metal::-webkit-slider-thumb {
                       appearance: none;
                       width: 24px;
                       height: 32px;
                       background: linear-gradient(180deg, #94a3b8, #64748b);
                       border: 2px solid #334155;
                       border-radius: 6px;
                       box-shadow: 0 4px 6px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3);
                       cursor: pointer;
                    }
                  `}} />

                  {stage === 5 ? (
                    <button onClick={handleTestDefense} className="w-full bg-cyan-600 text-white font-black uppercase tracking-widest px-4 py-4 rounded-xl border-b-8 border-cyan-800 active:border-b-4 active:translate-y-1 hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] flex justify-center items-center gap-2 mt-2">
                       <ShieldCheck size={20} /> ENGAGE FIREWALL
                    </button>
                  ) : (
                    <button disabled className="w-full bg-amber-600 text-amber-100 font-black uppercase tracking-widest px-4 py-4 rounded-xl border-b-8 border-amber-800 shadow-[0_0_20px_rgba(217,119,6,0.4)] flex justify-center items-center gap-2 mt-2">
                       <AlertTriangle size={20} className="animate-pulse" /> TESTING LOAD...
                    </button>
                  )}
               </div>
             )}

             {/* Outcome Panel */}
             {stage === 7 && (
               <div className="bg-emerald-900 p-6 rounded-2xl border-4 border-emerald-700 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),0_10px_30px_rgba(16,185,129,0.3)] relative overflow-hidden">
                  
                  <h3 className="font-black text-emerald-300 text-xl tracking-widest uppercase mb-4 flex items-center gap-2">
                     <Shield size={24} /> SECURE
                  </h3>
                  <div className="space-y-4">
                     <div className="bg-emerald-950 p-3 rounded-lg border border-emerald-800 flex justify-between items-center">
                       <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Malicious Dropped</span>
                       <span className="text-lg font-black text-red-500">{stats.droppedBad}</span>
                     </div>
                     <div className="bg-emerald-950 p-3 rounded-lg border border-emerald-800 flex justify-between items-center">
                       <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Users Saved</span>
                       <span className="text-lg font-black text-cyan-400">{stats.processedGood}</span>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* EDUCATIONAL MODALS */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            
            {stage === 4 && (
              <div className="bg-white p-8 rounded-[2rem] max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-slate-200 relative">
                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6 border-4 border-red-500 mx-auto shadow-inner">
                   <XCircle size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-center text-slate-800 uppercase mb-4 tracking-widest">503 SERVER CRASH</h2>
                <p className="text-slate-600 font-bold mb-4">A server can only process a finite number of requests per second. The botnet sent thousands of requests at once, maxing out the CPU and crashing the system.</p>
                <p className="text-slate-600 font-bold mb-8">We need to install an <strong>API Rate Limiter</strong> at the door. It acts as a physical valve, dropping excess requests before they reach the server core.</p>
                <button onClick={() => { setShowModal(false); setStage(5); }} className="w-full bg-slate-800 text-white font-black py-4 rounded-xl border-b-8 border-slate-900 active:border-b-4 active:translate-y-1 hover:bg-slate-700 tracking-widest uppercase">INSTALL LIMITER</button>
              </div>
            )}

            {stage === 5 && (
              <div className="bg-white p-8 rounded-[2rem] max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-slate-200 relative text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 border-4 border-amber-500 mx-auto shadow-inner">
                   <AlertTriangle size={40} className="text-amber-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase mb-4 tracking-widest">Defense Failed</h2>
                <p className="text-slate-600 font-bold mb-8">
                  {stats.droppedGood >= 3 
                    ? "Your limit was TOO STRICT! The bucket capacity was too small, so normal bursts of legitimate traffic got blocked. Your real customers are angry!" 
                    : "Your limit was TOO LOOSE! The refill rate was too high, allowing too many botnet requests through and crashing the server core."}
                </p>
                <button onClick={() => setShowModal(false)} className="w-full bg-amber-500 text-white font-black py-4 rounded-xl border-b-8 border-amber-700 active:border-b-4 active:translate-y-1 hover:bg-amber-400 tracking-widest uppercase shadow-[0_5px_15px_rgba(245,158,11,0.4)]">RE-CALIBRATE</button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </LabShell>
  );
}