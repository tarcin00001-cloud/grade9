"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  ShieldAlert, Shield, ShieldCheck, MailWarning, Usb, 
  StickyNote, Unlock, Ban, Scissors, Lock, 
  Monitor, Keyboard, Mouse, AlertTriangle, CheckCircle2,
  Clock, Activity, HardDrive
} from "lucide-react";

type Phase = "intro" | "playing" | "feedback" | "game_over" | "success";

type ThreatType = "phishing" | "usb" | "password" | "unlocked";
type ToolType = "network_blocker" | "port_ejector" | "data_shredder" | "screen_padlock";

interface ThreatDef {
  id: ThreatType;
  name: string;
  icon: any;
  requiredTool: ToolType;
  color: string;
  bg: string;
  description: string;
  errorMsg: string;
}

const THREATS: Record<ThreatType, ThreatDef> = {
  phishing: {
    id: "phishing", name: "Phishing Email", icon: MailWarning, requiredTool: "network_blocker",
    color: "text-amber-500", bg: "bg-amber-50",
    description: "Employee clicked a suspicious link.",
    errorMsg: "You can't use that on an email. Use the Network Blocker to kill the connection!"
  },
  usb: {
    id: "usb", name: "Rogue USB", icon: Usb, requiredTool: "port_ejector",
    color: "text-rose-500", bg: "bg-rose-50",
    description: "Unknown USB plugged into tower.",
    errorMsg: "Wrong tool! You must use the Port Ejector to disable the physical USB port!"
  },
  password: {
    id: "password", name: "Exposed Password", icon: StickyNote, requiredTool: "data_shredder",
    color: "text-orange-500", bg: "bg-orange-50",
    description: "Password written on sticky note.",
    errorMsg: "That's a physical piece of paper. Use the Data Shredder to destroy it!"
  },
  unlocked: {
    id: "unlocked", name: "Unlocked Screen", icon: Unlock, requiredTool: "screen_padlock",
    color: "text-indigo-500", bg: "bg-indigo-50",
    description: "Employee walked away without locking.",
    errorMsg: "The screen is physically unlocked. Use the Screen Padlock to secure the session!"
  }
};

const TOOLS = [
  { id: "network_blocker", name: "Network Blocker", icon: Ban, color: "text-amber-500" },
  { id: "port_ejector", name: "Port Ejector", icon: Usb, color: "text-rose-500" },
  { id: "data_shredder", name: "Data Shredder", icon: Scissors, color: "text-orange-500" },
  { id: "screen_padlock", name: "Screen Padlock", icon: Lock, color: "text-indigo-500" }
];

interface Workstation {
  id: number;
  state: "idle" | "warning" | "breached" | "secured";
  threat: ThreatType | null;
  timeLeft: number;
  maxTime: number;
}

const SHIFT_DURATION = 60; // 60 seconds to survive
const MAX_STRIKES = 3;
const BASE_THREAT_TIME = 80; // Ticks (approx 8 seconds)

export default function ItSupport18() {
  const { reportComplete } = useLMSBridge("itsupport18");
  const { playPop, playSuccess, playError, playZap } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [timeRemaining, setTimeRemaining] = useState(SHIFT_DURATION);
  const [strikes, setStrikes] = useState(0);
  const [intercepts, setIntercepts] = useState(0);
  
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [feedback, setFeedback] = useState<{msg: string, type: 'error'|'success', active: boolean}>({ msg: "", type: "error", active: false });
  
  const [workstations, setWorkstations] = useState<Workstation[]>([
    { id: 1, state: "idle", threat: null, timeLeft: 0, maxTime: 0 },
    { id: 2, state: "idle", threat: null, timeLeft: 0, maxTime: 0 },
    { id: 3, state: "idle", threat: null, timeLeft: 0, maxTime: 0 },
    { id: 4, state: "idle", threat: null, timeLeft: 0, maxTime: 0 },
  ]);

  // Game Loop Ref
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setPhase("playing");
    setTimeRemaining(SHIFT_DURATION);
    setStrikes(0);
    setIntercepts(0);
    setActiveTool(null);
    setWorkstations(ws => ws.map(w => ({ ...w, state: "idle", threat: null })));
    setFeedback({ msg: "", type: "success", active: false });
    playPop();
  };

  const handleReset = () => {
    setPhase("intro");
    if (tickRef.current) clearInterval(tickRef.current);
    playPop();
  };

  // Main Game Loop
  useEffect(() => {
    if (phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      setWorkstations(prev => {
        let updated = [...prev];
        let stateChanged = false;

        // Decrease timers
        updated = updated.map(ws => {
          if (ws.state === "warning" && ws.threat) {
            const newTime = ws.timeLeft - 1;
            if (newTime <= 0) {
              // Time ran out!
              handleThreatFailure("Too slow! Human error resulted in a security breach.");
              return { ...ws, state: "breached", timeLeft: 0 };
            }
            return { ...ws, timeLeft: newTime };
          }
          if (ws.state === "secured") {
             const newTime = ws.timeLeft - 1;
             if (newTime <= 0) return { ...ws, state: "idle", threat: null };
             return { ...ws, timeLeft: newTime };
          }
          return ws;
        });

        // Randomly spawn new threats if idle
        // Difficulty increases as timeRemaining drops
        const spawnChance = timeRemaining > 40 ? 0.02 : timeRemaining > 20 ? 0.04 : 0.06;
        
        updated.forEach((ws, idx) => {
          if (ws.state === "idle" && Math.random() < spawnChance) {
            const threatKeys = Object.keys(THREATS) as ThreatType[];
            const randomThreat = threatKeys[Math.floor(Math.random() * threatKeys.length)];
            // Speed up threat timers as game progresses
            const threatSpeed = Math.max(40, BASE_THREAT_TIME - (SHIFT_DURATION - timeRemaining));
            updated[idx] = {
              ...ws,
              state: "warning",
              threat: randomThreat,
              maxTime: threatSpeed,
              timeLeft: threatSpeed
            };
            stateChanged = true;
          }
        });

        if (stateChanged) playPop(); // Subtle pop when new threat appears
        return updated;
      });
    }, 100); // 100ms tick

    // Separate 1-second timer for shift clock
    const clockInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      clearInterval(clockInterval);
    };
  }, [phase, timeRemaining]);

  const handleThreatFailure = (msg: string) => {
    playError();
    setPhase("feedback");
    setFeedback({ msg, type: "error", active: true });
    setStrikes(s => {
      const newStrikes = s + 1;
      if (newStrikes >= MAX_STRIKES) {
        setTimeout(() => setPhase("game_over"), 2500);
      } else {
        setTimeout(() => {
           setPhase("playing");
           setWorkstations(ws => ws.map(w => w.state === "breached" ? { ...w, state: "idle", threat: null } : w));
        }, 3500);
      }
      return newStrikes;
    });
  };

  const handleSuccess = () => {
    setPhase("success");
    playSuccess();
    reportComplete();
  };

  const handleWorkstationClick = (wsId: number) => {
    if (phase !== "playing") return;
    
    const ws = workstations.find(w => w.id === wsId);
    if (!ws || ws.state !== "warning" || !ws.threat) return;

    if (!activeTool) {
       playError();
       // Shake it but don't penalize for just clicking without a tool
       return; 
    }

    const threatDef = THREATS[ws.threat];
    
    if (activeTool === threatDef.requiredTool) {
      // SUCCESSFUL INTERCEPT
      playZap();
      setIntercepts(i => i + 1);
      setWorkstations(prev => prev.map(w => 
        w.id === wsId ? { ...w, state: "secured", timeLeft: 10 } : w
      ));
      setActiveTool(null);
    } else {
      // FAILED INTERCEPT (WRONG TOOL)
      handleThreatFailure(threatDef.errorMsg);
      setWorkstations(prev => prev.map(w => 
        w.id === wsId ? { ...w, state: "breached" } : w
      ));
      setActiveTool(null);
    }
  };

  return (
    <LabShell
      labId="itsupport18"
      theme="ocean"
      title="The Office Defender"
      instruction="Equip tools to intercept human errors before they cause a breach."
      hint="Match the correct tool to the threat. E.g. A physical sticky note needs a Data Shredder, not a Network Blocker!"
      compact
      onReset={handleReset}
    >
      <Celebration
        isActive={phase === "success"}
        message={`Shift complete! You intercepted ${intercepts} human errors, preventing catastrophic network breaches.`}
        onReplay={handleReset}
      />

      <div className="w-full flex-1 flex flex-col min-h-0 relative isolate pb-4 max-w-7xl mx-auto">
        
        {/* HUD */}
        <div className="shrink-0 flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm z-20 relative w-full max-w-5xl lg:max-w-6xl mx-auto">
           
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Clock size={12}/> Shift Remaining</span>
                 <span className={`text-2xl font-black leading-none ${timeRemaining < 15 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                    {timeRemaining}s
                 </span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Activity size={12}/> Intercepts</span>
                 <span className="text-2xl font-black leading-none text-emerald-500">
                    {intercepts}
                 </span>
              </div>
           </div>

           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">Strikes (Max 3) <ShieldAlert size={12}/></span>
              <div className="flex gap-2">
                 {[1, 2, 3].map(s => (
                    <div key={s} className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all ${strikes >= s ? 'bg-rose-500 border-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-100 border-slate-200 text-slate-300'}`}>
                       {strikes >= s ? <AlertTriangle size={16} /> : <Shield size={16} />}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* OVERLAYS */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/20 rounded-3xl">
             <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl text-center">
                <ShieldCheck size={48} className="text-sky-600 mb-6 mx-auto" />
                <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">SOC Helpdesk</h1>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                  Hackers rarely break through the firewall directly. Instead, they rely on <strong>human error</strong>.
                  <br/><br/>
                  Your job as an IT Support Specialist is to monitor the floor and apply the correct technical fix to employee mistakes before they compromise the network.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 text-left mb-8 border border-slate-100">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Threat Mappings</h3>
                   <ul className="text-xs text-slate-600 space-y-2 font-medium">
                      <li>• Phishing Email ➔ Network Blocker</li>
                      <li>• Rogue USB ➔ Port Ejector</li>
                      <li>• Sticky Note Pass ➔ Data Shredder</li>
                      <li>• Unlocked PC ➔ Screen Padlock</li>
                   </ul>
                </div>
                <button onClick={startGame} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                  Start Shift
                </button>
             </div>
          </div>
        )}

        {phase === "game_over" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-rose-950/60 rounded-3xl">
             <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(244,63,94,0.3)] text-center animate-in zoom-in duration-300">
                <AlertTriangle size={48} className="text-rose-500 mb-6 mx-auto animate-pulse" />
                <h1 className="text-xl md:text-2xl font-black text-rose-600 uppercase tracking-widest mb-4">SYSTEM COMPROMISED</h1>
                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8">
                  Too many human errors slipped through. A ransomware payload was executed, locking the entire company network.
                </p>
                <button onClick={startGame} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                  Retry Shift
                </button>
             </div>
          </div>
        )}

        {/* CORE WORKSTATION GRID */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative w-full mb-4">
           
           {/* Feedback Banner Overlay */}
           <AnimatePresence>
              {phase === "feedback" && (
                 <motion.div 
                   initial={{ opacity: 0, y: -20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: -10, scale: 0.95 }}
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 max-w-sm w-full bg-rose-600 text-white rounded-2xl shadow-[0_10px_40px_rgba(225,29,72,0.4)] p-6 text-center border-4 border-white"
                 >
                    <AlertTriangle size={32} className="mx-auto mb-3" />
                    <h3 className="font-black uppercase tracking-widest text-sm mb-2 text-rose-100">Strike Logged</h3>
                    <p className="font-bold text-base leading-tight">{feedback.msg}</p>
                 </motion.div>
              )}
           </AnimatePresence>

           <div className={`w-full max-w-5xl lg:max-w-6xl grid grid-cols-2 gap-3 md:gap-6 flex-1 min-h-0 transition-all ${phase === 'feedback' ? 'blur-[2px] pointer-events-none' : ''}`}>
              {workstations.map((ws, i) => {
                 const threat = ws.threat ? THREATS[ws.threat] : null;
                 
                 return (
                    <div 
                      key={ws.id}
                      onClick={() => handleWorkstationClick(ws.id)}
                      className={`relative w-full h-full rounded-2xl border-4 transition-all overflow-hidden flex flex-col cursor-pointer
                        ${ws.state === 'idle' ? 'bg-slate-50 border-slate-200 hover:border-sky-200' : ''}
                        ${ws.state === 'warning' ? 'bg-amber-50 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]' : ''}
                        ${ws.state === 'breached' ? 'bg-rose-50 border-rose-500 animate-shake shadow-[0_0_30px_rgba(244,63,94,0.3)]' : ''}
                        ${ws.state === 'secured' ? 'bg-emerald-50 border-emerald-400' : ''}
                      `}
                    >
                       {/* Background Texture (Fixes Empty Void) */}
                       <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                       {/* Header: Camera Overlay Style */}
                       <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10 font-mono">
                          <span className={`text-[9px] md:text-xs font-black uppercase tracking-widest bg-white/90 px-2 py-1 rounded-md shadow-sm border ${ws.state === 'warning' ? 'text-amber-600 border-amber-200' : 'text-slate-500 border-slate-200'}`}>
                             CAM_0{ws.id}
                          </span>
                          {ws.state === 'warning' ? (
                             <span className="flex items-center gap-1.5 text-[9px] md:text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-1 rounded-md shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                BREACH_DETECTED
                             </span>
                          ) : (
                             <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded border border-transparent">
                                SECURE
                             </span>
                          )}
                       </div>

                       {/* Progress Bar (Timer) */}
                       {ws.state === 'warning' && (
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-200 z-20">
                             <motion.div 
                               className="h-full bg-amber-500" 
                               initial={{ width: "100%" }}
                               animate={{ width: `${(ws.timeLeft / ws.maxTime) * 100}%` }}
                               transition={{ ease: "linear" }}
                             />
                          </div>
                       )}

                       {/* Vector Desk Visual - SCALED UP with Worker */}
                       <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 md:pb-8 pointer-events-none">
                          
                          {/* Wall Details (Whiteboard / Poster) */}
                          <div className="absolute top-[25%] w-[60%] max-w-[180px] h-12 md:h-16 bg-white border-2 border-slate-200 rounded-lg shadow-sm opacity-60 flex flex-col items-center justify-center p-2">
                              <div className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full mb-2" />
                              <div className="w-3/4 h-1.5 md:h-2 bg-slate-100 rounded-full" />
                          </div>

                          <div className="relative w-[85%] max-w-[280px] flex flex-col items-center z-10">
                             {/* Monitor */}
                             <div className={`w-28 md:w-40 aspect-video rounded-t-xl border-[4px] border-b-0 flex items-center justify-center relative bg-white shadow-lg ${ws.state === 'warning' ? 'border-amber-300' : ws.state === 'breached' ? 'border-rose-400 bg-rose-50' : ws.state === 'secured' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300'}`}>
                                {ws.state === 'secured' && <CheckCircle2 size={32} className="text-emerald-500 drop-shadow-sm" />}
                                {ws.state === 'breached' && <ShieldAlert size={32} className="text-rose-500 drop-shadow-sm" />}
                                {ws.state === 'idle' && <Monitor size={28} className="text-slate-200" />}
                                
                                {/* Monitor Stand */}
                                <div className={`absolute -bottom-4 w-6 md:w-8 h-4 ${ws.state === 'warning' ? 'bg-amber-200' : 'bg-slate-300'}`} />
                                <div className={`absolute -bottom-5 w-16 md:w-20 h-1 rounded-full ${ws.state === 'warning' ? 'bg-amber-300' : 'bg-slate-400'}`} />
                             </div>
                             
                             {/* Desk Surface */}
                             <div className="w-full h-4 md:h-5 bg-slate-200 rounded-full shadow-[inset_0_-3px_6px_rgba(0,0,0,0.1)] relative flex items-center justify-center gap-3 md:gap-5 mt-5 border border-slate-300 z-10">
                                <Keyboard size={12} className="text-slate-400 hidden sm:block" />
                                <Mouse size={8} className="text-slate-400 hidden sm:block" />
                                {/* PC Tower */}
                                <div className="absolute right-2 md:right-4 -bottom-12 md:-bottom-16 w-8 md:w-12 h-16 md:h-20 bg-slate-700 rounded-sm border-t-[6px] border-slate-600 flex flex-col items-center py-2 shadow-xl">
                                   <HardDrive size={14} className="text-sky-400 mb-2 opacity-80" />
                                   <div className={`w-2 h-2 rounded-full ${ws.state === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'}`} />
                                </div>
                             </div>

                             {/* Employee Silhouette (The Human Error Factor) */}
                             <div className="absolute -bottom-4 md:-bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 drop-shadow-xl transition-all duration-500">
                                {/* Head */}
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-[3px] border-white translate-y-3 md:translate-y-4 z-10 ${ws.state === 'warning' ? 'bg-amber-600' : ws.state === 'breached' ? 'bg-rose-700' : 'bg-slate-800'}`} />
                                {/* Shoulders */}
                                <div className={`w-28 h-16 md:w-32 md:h-20 rounded-t-[3rem] border-[3px] border-b-0 border-white ${ws.state === 'warning' ? 'bg-amber-500' : ws.state === 'breached' ? 'bg-rose-600' : 'bg-slate-700'}`} />
                             </div>
                          </div>
                       </div>

                       {/* Threat Overlay */}
                       <AnimatePresence>
                          {ws.state === 'warning' && threat && (
                             <motion.div
                               initial={{ scale: 0, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               exit={{ scale: 0, opacity: 0 }}
                               className="absolute inset-0 flex items-center justify-center z-20 backdrop-blur-[1px] bg-white/30"
                             >
                                <div className={`flex flex-col items-center justify-center ${threat.bg} ${threat.color} border-2 border-current rounded-2xl p-3 md:p-5 shadow-lg animate-pulse`}>
                                   <threat.icon size={36} strokeWidth={2.5} className="mb-2" />
                                   <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-center leading-tight max-w-[100px]">{threat.name}</span>
                                </div>
                             </motion.div>
                          )}
                       </AnimatePresence>

                    </div>
                 );
              })}
           </div>
        </div>

        {/* IT TOOLBELT (BOTTOM) */}
        <div className={`shrink-0 bg-slate-800 rounded-3xl p-3 md:p-5 shadow-[0_20px_40px_rgba(15,23,42,0.4)] border border-slate-700 flex flex-col items-center w-full max-w-5xl lg:max-w-6xl mx-auto transition-all ${phase !== 'playing' ? 'opacity-50 pointer-events-none' : ''}`}>
           <h3 className="text-[9px] md:text-xs font-black text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShieldCheck size={14} /> IT Support Toolbelt
           </h3>
           <div className="grid grid-cols-4 gap-2 md:gap-4 w-full h-20 md:h-24">
              {TOOLS.map(tool => (
                 <button
                   key={tool.id}
                   onClick={() => {
                      setActiveTool(tool.id as ToolType);
                      playPop();
                   }}
                   className={`relative w-full h-full rounded-xl border-b-[4px] flex flex-col items-center justify-center gap-1 md:gap-2 transition-all group
                     ${activeTool === tool.id 
                        ? 'bg-sky-500 border-sky-700 text-white translate-y-1 shadow-inner' 
                        : 'bg-slate-700 border-slate-900 text-slate-300 hover:bg-slate-600 hover:text-white hover:border-slate-800'
                     }`}
                 >
                    <tool.icon size={24} className={activeTool === tool.id ? 'text-white' : tool.color} />
                    <span className="font-black text-[8px] md:text-[10px] uppercase tracking-widest text-center px-1 leading-none hidden sm:block">
                       {tool.name.split(' ')[0]}<br/>{tool.name.split(' ')[1]}
                    </span>
                    {/* Active Indicator LED */}
                    {activeTool === tool.id && (
                       <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    )}
                 </button>
              ))}
           </div>
        </div>

      </div>
    </LabShell>
  );
}
