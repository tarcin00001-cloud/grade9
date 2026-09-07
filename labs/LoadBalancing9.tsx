"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Activity, ArrowRightLeft, CheckCircle2, XCircle, AlertTriangle, Timer, Globe, PlusCircle, Server, ShieldCheck } from "lucide-react";

const TIMER_DURATION_SECONDS = 5 * 60;

type Phase = "INIT_SINGLE" | "SWARM_1" | "CRASHED_1" | "ROUND_ROBIN" | "READY_RR_SWARM" | "SWARM_RR" | "FAILED_RR" | "LEAST_CONNECTIONS" | "SWARM_LC" | "DONE";
type ServerNode = { id: number; load: number; active: boolean };
type Traffic = { id: number; target: number; dropped: boolean };

const INSTRUCTIONS: Record<Phase, string> = {
  "INIT_SINGLE": "A single server can handle low traffic. Click 'Trigger Traffic Swarm' to simulate a sudden surge of users.",
  "SWARM_1": "Traffic is hitting the single server quickly...",
  "CRASHED_1": "The single server overloaded and crashed! All further packets are dropped. We need to scale horizontally.",
  "ROUND_ROBIN": "Load Balancer added! Let's simulate a hardware failure. Click Server 2 to turn it off.",
  "READY_RR_SWARM": "Server 2 is offline. In 'Blind Round Robin' mode, trigger a swarm and watch what happens.",
  "SWARM_RR": "Round Robin blindly sends packets 1-2-3, completely ignoring that Server 2 is offline...",
  "FAILED_RR": "Packets sent to Server 2 were lost forever! We need a smarter algorithm.",
  "LEAST_CONNECTIONS": "Upgraded to 'Least Connections + Health Checks'. Trigger the final swarm.",
  "SWARM_LC": "The Load Balancer is dynamically routing traffic around the dead server based on real-time load!",
  "DONE": "Lab Complete! You've mastered resilient Load Balancing architecture."
};

export default function LoadBalancing9() {
  const { reportComplete: _reportComplete } = useLMSBridge();
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("INIT_SINGLE");
  const [servers, setServers] = useState<ServerNode[]>([{ id: 1, load: 0, active: true }]);
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  
  const serversRef = useRef(servers);
  const phaseRef = useRef(phase);
  
  useEffect(() => { serversRef.current = servers; }, [servers]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const reqIdRef = useRef(0);
  const rrIndexRef = useRef(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isLabComplete = phase === "DONE";
  const labCurrentStep = phase;

  const reportComplete = useCallback(() => {
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
    if (isLabComplete) {
      reportComplete();
    }
  }, [timedOut, isLabComplete, _reportComplete, reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  // Drain server loads every 1s
  useEffect(() => {
    const drainInterval = setInterval(() => {
      setServers(prev => prev.map(s => ({
        ...s,
        load: s.active ? Math.max(0, s.load - 2) : s.load
      })));
    }, 1000);
    return () => clearInterval(drainInterval);
  }, []);

  const triggerSwarm = () => {
    playZap();
    let count = 0;
    
    if (phase === "INIT_SINGLE") setPhase("SWARM_1");
    if (phase === "READY_RR_SWARM") setPhase("SWARM_RR");
    if (phase === "LEAST_CONNECTIONS") setPhase("SWARM_LC");

    intervalRef.current = setInterval(() => {
      count++;
      if (count > 20) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Advance phase
        setTimeout(() => {
          const currentP = phaseRef.current;
          if (currentP === "SWARM_1") {
             setPhase("CRASHED_1");
             playError();
          }
          if (currentP === "SWARM_RR") {
             setPhase("FAILED_RR");
             playError();
          }
          if (currentP === "SWARM_LC") {
             setPhase("DONE");
             playSuccess();
          }
        }, 2000); // wait for last packets to arrive
        return;
      }

      const id = ++reqIdRef.current;
      playPop();

      let targetId = 1;
      const curPhase = phaseRef.current;

      if (curPhase === "SWARM_RR" || curPhase === "READY_RR_SWARM") {
        targetId = rrIndexRef.current;
        rrIndexRef.current = targetId >= 3 ? 1 : targetId + 1;
      } else if (curPhase === "SWARM_LC" || curPhase === "LEAST_CONNECTIONS") {
        const activeServers = serversRef.current.filter(s => s.active);
        if (activeServers.length > 0) {
          activeServers.sort((a,b) => a.load - b.load);
          targetId = activeServers[0].id;
        } else {
          targetId = 1; // Fallback
        }
      }

      setTraffic(prev => [...prev, { id, target: targetId, dropped: false }]);

      // Arrive at 1500ms
      setTimeout(() => {
        const s = serversRef.current.find(srv => srv.id === targetId);
        if (!s || !s.active || s.load >= 10) {
          // Drop packet
          setTraffic(prev => prev.map(pt => pt.id === id ? { ...pt, dropped: true } : pt));
          // If in single mode and overload, trigger a single alert sound if we just hit 10
          if (s && s.load < 10) playError();
          
          if (s && s.active) {
             setServers(prev => prev.map(srv => srv.id === targetId ? { ...srv, load: 10 } : srv));
          }
          
          setTimeout(() => setTraffic(prev => prev.filter(pt => pt.id !== id)), 600);
        } else {
          // Process packet
          setServers(prev => prev.map(srv => srv.id === targetId ? { ...srv, load: srv.load + 1 } : srv));
          setTimeout(() => setTraffic(prev => prev.filter(pt => pt.id !== id)), 200);
        }
      }, 1500);

    }, 200);
  };

  const addLoadBalancer = () => {
    setServers([
      { id: 1, load: 0, active: true },
      { id: 2, load: 0, active: true },
      { id: 3, load: 0, active: true }
    ]);
    setPhase("ROUND_ROBIN");
    playPop();
  };

  const killServer = (id: number) => {
    if (phase !== "ROUND_ROBIN") return;
    setServers(prev => prev.map(s => s.id === id ? { ...s, active: false, load: 0 } : s));
    setPhase("READY_RR_SWARM");
    playError();
  };

  const upgradeAlgorithm = () => {
    setPhase("LEAST_CONNECTIONS");
    playSuccess();
  };

  const hasLB = phase !== "INIT_SINGLE" && phase !== "SWARM_1" && phase !== "CRASHED_1";
  const isSwarming = phase === "SWARM_1" || phase === "SWARM_RR" || phase === "SWARM_LC";

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
      } 
      labId="loadbalancing9" 
      theme="ocean" 
      title="Load Balancing Architecture" 
      instruction={INSTRUCTIONS[phase]} 
      compact
    >
      <Celebration 
        isActive={isLabComplete} 
        message="Architect Certified! You successfully used Least Connections and Health Checks to dynamically route traffic around a dead server, maintaining 100% uptime." 
        onReplay={() => window.location.reload()} 
      />

      <div data-step={labCurrentStep} className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-4">
        
        {/* Controls Bar */}
        <div className="shrink-0 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative z-20">
          
          <div className="flex items-center gap-3">
             <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-black">
                {phase === "INIT_SINGLE" || phase === "SWARM_1" || phase === "CRASHED_1" ? "1" : phase === "ROUND_ROBIN" || phase === "READY_RR_SWARM" || phase === "SWARM_RR" || phase === "FAILED_RR" ? "2" : "3"}
             </div>
             <div className="flex flex-col">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Algorithm</span>
                 <span className="text-sm font-black text-slate-800">
                     {!hasLB ? "None (Direct to Server)" : (phase === "LEAST_CONNECTIONS" || phase === "SWARM_LC" || phase === "DONE") ? "Least Connections + Health Check" : "Blind Round Robin"}
                 </span>
             </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === "INIT_SINGLE" || phase === "READY_RR_SWARM" || phase === "LEAST_CONNECTIONS" ? (
              <button 
                onClick={triggerSwarm} 
                className="px-6 py-2.5 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all hover:-translate-y-0.5 shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none active:translate-y-1 flex items-center gap-2"
              >
                <Activity size={18}/> Trigger Traffic Swarm
              </button>
            ) : phase === "CRASHED_1" ? (
              <button 
                onClick={addLoadBalancer} 
                className="px-6 py-2.5 rounded-xl font-black bg-sky-500 hover:bg-sky-600 text-white transition-all hover:-translate-y-0.5 shadow-[0_4px_0_rgba(14,165,233,1)] active:shadow-none active:translate-y-1 flex items-center gap-2 animate-bounce"
              >
                <PlusCircle size={18}/> Add Load Balancer
              </button>
            ) : phase === "FAILED_RR" ? (
              <button 
                onClick={upgradeAlgorithm} 
                className="px-6 py-2.5 rounded-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white transition-all hover:-translate-y-0.5 shadow-[0_4px_0_rgba(16,185,129,1)] active:shadow-none active:translate-y-1 flex items-center gap-2 animate-bounce"
              >
                <ShieldCheck size={18}/> Enable Smart Routing
              </button>
            ) : (
              <button disabled className="px-6 py-2.5 rounded-xl font-black bg-slate-100 text-slate-400 flex items-center gap-2 border border-slate-200">
                <Activity size={18}/> Processing Swarm...
              </button>
            )}
          </div>
        </div>

        {/* Network Canvas */}
        <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner relative overflow-hidden flex items-center justify-center min-h-[350px]">
          
          {/* Path Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <line x1="10%" y1="50%" x2={hasLB ? "45%" : "85%"} y2="50%" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 6" />
              {hasLB && (
                  <>
                      <line x1="45%" y1="50%" x2="85%" y2="20%" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 6" />
                      <line x1="45%" y1="50%" x2="85%" y2="50%" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 6" />
                      <line x1="45%" y1="50%" x2="85%" y2="80%" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 6" />
                  </>
              )}
          </svg>

          {/* Internet Node */}
          <div className="absolute left-[10%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-500 shadow-sm relative">
                  <Globe size={28} />
                  {isSwarming && <span className="absolute -top-2 -right-2 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span></span>}
              </div>
              <span className="font-bold text-[10px] text-slate-500 tracking-widest bg-slate-50 px-1">INTERNET</span>
          </div>

          {/* Load Balancer Node */}
          {hasLB && (
          <div className="absolute left-[45%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
              <div className="w-24 h-28 rounded-2xl bg-sky-50 border-2 border-sky-400 flex flex-col items-center justify-center text-sky-600 shadow-sm relative overflow-hidden">
                  <ArrowRightLeft size={28} className="mb-2"/>
                  <span className="font-bold text-[10px] text-center leading-tight">LOAD<br/>BALANCER</span>
                  {/* Traffic flow scan effect */}
                  {isSwarming && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-300/30 to-transparent w-full h-[200%] animate-[scan_1s_linear_infinite]" style={{ animationName: 'scan' }} />}
                  <style>{`@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(50%); } }`}</style>
              </div>
          </div>
          )}

          {/* Server Nodes */}
          {servers.map(s => {
              const topPos = hasLB ? (s.id === 1 ? '20%' : s.id === 2 ? '50%' : '80%') : '50%';
              const isOverloaded = s.load >= 10;
              
              return (
                 <div key={s.id} 
                    onClick={() => { if (phase === 'ROUND_ROBIN' && s.id === 2) killServer(s.id) }}
                    className={`absolute left-[85%] -translate-x-1/2 -translate-y-1/2 z-10 p-4 rounded-xl border-2 w-40 sm:w-48 shadow-sm transition-all duration-300 ${
                      !s.active ? 'bg-slate-100 border-slate-300 opacity-60' : 
                      isOverloaded ? 'bg-rose-50 border-rose-500' : 
                      s.load >= 7 ? 'bg-amber-50 border-amber-400' : 
                      'bg-white border-slate-200'
                    } ${
                      phase === 'ROUND_ROBIN' && s.id === 2 ? 'cursor-pointer hover:border-indigo-400 ring-4 ring-indigo-500/20' : ''
                    }`} 
                    style={{ 
                      top: topPos,
                      animation: isOverloaded ? 'shake 0.4s cubic-bezier(.36,.07,.19,.97) infinite' : 'none' 
                    }}>
                     <style>{`@keyframes shake { 10%, 90% { transform: translate(-50%, -50%) translate3d(-1px, 0, 0); } 20%, 80% { transform: translate(-50%, -50%) translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate(-50%, -50%) translate3d(-4px, 0, 0); } 40%, 60% { transform: translate(-50%, -50%) translate3d(4px, 0, 0); } }`}</style>
                     
                     <div className="flex justify-between items-center mb-3">
                         <span className="font-black text-slate-700 flex items-center gap-1.5"><Server size={14}/> Srv {s.id}</span>
                         {!s.active ? <XCircle size={18} className="text-slate-400"/> : isOverloaded ? <AlertTriangle size={18} className="text-rose-500"/> : <CheckCircle2 size={18} className="text-emerald-500"/>}
                     </div>
                     <div className="flex gap-1 h-6">
                         {[...Array(10)].map((_, i) => (
                             <div key={i} className={`flex-1 rounded-[2px] transition-colors duration-200 ${
                               i < s.load ? (isOverloaded ? 'bg-rose-500' : s.load >= 7 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-100'
                             }`} />
                         ))}
                     </div>
                     {phase === 'ROUND_ROBIN' && s.id === 2 && (
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-indigo-600">
                         Click to Disable
                       </div>
                     )}
                 </div>
              )
          })}

          {/* Packet Animations */}
          <AnimatePresence>
              {traffic.map(p => {
                  const targetTop = hasLB ? (p.target === 1 ? '20%' : p.target === 2 ? '50%' : '80%') : '50%';
                  return (
                      <motion.div
                          key={p.id}
                          initial={{ left: '10%', top: '50%', scale: 0, x: '-50%', y: '-50%' }}
                          animate={{
                              left: hasLB ? ['10%', '45%', '85%'] : ['10%', '85%'],
                              top: hasLB ? ['50%', '50%', targetTop] : ['50%', targetTop],
                              scale: [0.5, 1, 1],
                              opacity: p.dropped ? 0 : 1,
                              y: p.dropped ? '40px' : '-50%' // Fall down if dropped
                          }}
                          transition={{ duration: 1.5, ease: "linear", times: hasLB ? [0, 0.4, 1] : [0, 1] }}
                          className={`absolute w-3.5 h-3.5 rounded-full z-20 ${
                            p.dropped ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]'
                          }`}
                      />
                  )
              })}
          </AnimatePresence>

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
