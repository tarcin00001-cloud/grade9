"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  ShieldAlert, MailWarning, Usb, StickyNote, MonitorOff, AlertTriangle, PlayCircle, ShieldCheck, UserX,
  Lock, Scissors, Ban, Plug, Server, Terminal, CheckCircle2
} from "lucide-react";

type ThreatType = 'phishing' | 'usb' | 'password' | 'unlocked';
type ToolType = 'blocker' | 'ejector' | 'shredder' | 'padlock' | null;

interface Threat {
  id: string;
  deskIndex: number;
  type: ThreatType;
  timeLeft: number;
  maxTime: number;
}

const TOTAL_TIME_MS = 120000; 
const TICK_MS = 100;
const MAX_STRIKES = 3;

// Tool matching logic
const getCorrectTool = (threat: ThreatType): ToolType => {
  switch (threat) {
    case 'phishing': return 'blocker';
    case 'usb': return 'ejector';
    case 'password': return 'shredder';
    case 'unlocked': return 'padlock';
  }
};

export default function ITSupport18() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();

  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_MS);
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [threats, setThreats] = useState<Threat[]>([]);
  
  // New Mechanics State
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);
  const [serverStatus, setServerStatus] = useState<'healthy' | 'patch_required' | 'vulnerable'>('healthy');
  const [patchCode, setPatchCode] = useState<string>("----");
  const [enteredCode, setEnteredCode] = useState<string>("");
  const [patchTimeLeft, setPatchTimeLeft] = useState<number>(0);
  const [serverMessage, setServerMessage] = useState<string>("");

  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // Refs for loop
  const stateRef = useRef({ 
    timeLeft, isPlaying, gameOver, win, threats, strikes, 
    serverStatus, patchTimeLeft 
  });
  
  useEffect(() => {
    stateRef.current = { 
      timeLeft, isPlaying, gameOver, win, threats, strikes,
      serverStatus, patchTimeLeft
    };
  }, [timeLeft, isPlaying, gameOver, win, threats, strikes, serverStatus, patchTimeLeft]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Spawn timing logic
  const lastThreatSpawnRef = useRef<number>(TOTAL_TIME_MS);
  const lastServerAlarmRef = useRef<number>(TOTAL_TIME_MS);

  useEffect(() => {
    if (isPlaying && !gameOver && !win) {
      timerRef.current = setInterval(() => {
        const state = stateRef.current;
        if (!state.isPlaying) return;

        const newTime = state.timeLeft - TICK_MS;

        if (newTime <= 0) {
          setTimeLeft(0);
          setIsPlaying(false);
          setWin(true);
          if (playSuccess) playSuccess();
          return;
        }

        // Threat Updates
        let newStrikes = state.strikes;
        const updatedThreats = state.threats.map(t => ({ ...t, timeLeft: t.timeLeft - TICK_MS }))
          .filter(t => {
            if (t.timeLeft <= 0) {
              newStrikes++;
              if (playError) playError();
              return false;
            }
            return true;
          });

        if (newStrikes >= MAX_STRIKES) {
          setStrikes(newStrikes);
          setTimeLeft(newTime);
          setThreats(updatedThreats);
          setIsPlaying(false);
          setGameOver(true);
          if (playError) playError();
          return;
        }

        // Server Alarm Logic
        let newServerStatus = state.serverStatus;
        let newPatchTimeLeft = state.patchTimeLeft;
        
        if (state.serverStatus === 'patch_required') {
          newPatchTimeLeft -= TICK_MS;
          if (newPatchTimeLeft <= 0) {
            newServerStatus = 'vulnerable';
            setServerMessage("SERVER VULNERABLE! SPAM RATE x2");
            if (playError) playError();
          }
          setPatchTimeLeft(newPatchTimeLeft);
        }

        const timeSinceLastAlarm = lastServerAlarmRef.current - newTime;
        // Server needs a patch every 25 seconds
        if (timeSinceLastAlarm > 25000 && newServerStatus === 'healthy') {
           newServerStatus = 'patch_required';
           newPatchTimeLeft = 10000; // 10 seconds to patch before becoming vulnerable
           setPatchCode(Math.floor(1000 + Math.random() * 9000).toString());
           setEnteredCode("");
           setServerMessage("CRITICAL PATCH REQUIRED");
           setPatchTimeLeft(newPatchTimeLeft);
           lastServerAlarmRef.current = newTime;
           if (playPop) playPop();
        }
        
        if (state.serverStatus !== newServerStatus) {
           setServerStatus(newServerStatus);
        }

        // Threat Spawning Logic
        const timeSinceLastSpawn = lastThreatSpawnRef.current - newTime;
        // If server is vulnerable, threats spawn twice as fast!
        const spawnMultiplier = newServerStatus === 'vulnerable' ? 0.5 : 1;
        const baseSpawnInterval = newTime < 60000 ? 3000 : 4500;
        const spawnInterval = baseSpawnInterval * spawnMultiplier;
        
        if (timeSinceLastSpawn >= spawnInterval) {
          const availableDesks = [0, 1, 2, 3].filter(d => !updatedThreats.some(t => t.deskIndex === d));
          if (availableDesks.length > 0) {
            const desk = availableDesks[Math.floor(Math.random() * availableDesks.length)];
            const types: ThreatType[] = ['phishing', 'usb', 'password', 'unlocked'];
            const type = types[Math.floor(Math.random() * types.length)];
            const fuse = newTime < 60000 ? 5000 : 6000; // Slightly longer fuse to account for tool switching
            
            updatedThreats.push({
              id: Math.random().toString(),
              deskIndex: desk,
              type,
              timeLeft: fuse,
              maxTime: fuse
            });
            lastThreatSpawnRef.current = newTime;
            if (playPop) playPop();
          }
        }

        setTimeLeft(newTime);
        setStrikes(newStrikes);
        setThreats(updatedThreats);

      }, TICK_MS);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameOver, win, playSuccess, playError, playPop]);

  const handleKeypadPress = (digit: string) => {
    if (!isPlaying || serverStatus === 'healthy') return;
    
    if (playClick) playClick();
    const newCode = enteredCode + digit;
    setEnteredCode(newCode);

    if (newCode.length === 4) {
      if (newCode === patchCode) {
        // Success!
        setServerStatus('healthy');
        setServerMessage("PATCH INSTALLED. SECURE.");
        setEnteredCode("");
        if (playSuccess) playSuccess();
      } else {
        // Fail
        setEnteredCode("");
        setServerMessage("INCORRECT CODE");
        if (playError) playError();
      }
    }
  };

  const interceptThreat = (id: string, type: ThreatType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;

    if (!selectedTool) {
      // Must select tool first
      if (playError) playError();
      return;
    }

    const correctTool = getCorrectTool(type);
    if (selectedTool === correctTool) {
      // Success
      setThreats(prev => prev.filter(t => t.id !== id));
      setScore(s => s + 1);
      if (playZap) playZap();
    } else {
      // Wrong tool penalty! Reduce fuse by 2 seconds
      setThreats(prev => prev.map(t => {
        if (t.id === id) {
           return { ...t, timeLeft: Math.max(0, t.timeLeft - 2000) };
        }
        return t;
      }));
      if (playError) playError();
    }
  };

  const equipTool = (tool: ToolType) => {
    setSelectedTool(tool);
    if (playClick) playClick();
  };

  const startGame = () => {
    if (playClick) playClick();
    lastThreatSpawnRef.current = TOTAL_TIME_MS;
    lastServerAlarmRef.current = TOTAL_TIME_MS;
    setIsPlaying(true);
  };

  const resetGame = () => {
    setTimeLeft(TOTAL_TIME_MS);
    setStrikes(0);
    setScore(0);
    setThreats([]);
    setSelectedTool(null);
    setServerStatus('healthy');
    setPatchCode("----");
    setEnteredCode("");
    setServerMessage("");
    setGameOver(false);
    setWin(false);
    setIsPlaying(false);
    if (playPop) playPop();
  };

  const renderThreatIcon = (type: ThreatType) => {
    switch (type) {
      case 'phishing': return <MailWarning size={32} className="text-red-500" />;
      case 'usb': return <Usb size={32} className="text-amber-500" />;
      case 'password': return <StickyNote size={32} className="text-yellow-400" />;
      case 'unlocked': return <MonitorOff size={32} className="text-fuchsia-500" />;
    }
  };

  const renderThreatLabel = (type: ThreatType) => {
    switch (type) {
      case 'phishing': return "Phishing Email";
      case 'usb': return "Rogue USB Drive";
      case 'password': return "Exposed Password";
      case 'unlocked': return "Unlocked Screen";
    }
  };

  const renderDesk = (index: number) => {
    const threat = threats.find(t => t.deskIndex === index);
    
    return (
      <div className={`relative flex-1 min-h-[120px] rounded-xl border-2 transition-colors duration-300 overflow-hidden ${threat ? 'border-red-500/50 bg-red-200/50' : 'border-slate-400 bg-slate-200/50'}`}>
        
        {/* The Desk Visuals */}
        <div className="absolute inset-x-0 bottom-2 h-16 flex justify-center items-end">
          <div className="w-[70%] h-4 bg-slate-200 rounded-t-lg border-t border-slate-400 relative flex justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div className={`absolute bottom-2 w-16 h-10 rounded-md border-2 flex items-center justify-center transition-colors ${threat && threat.type !== 'unlocked' ? 'bg-sky-300 border-slate-400' : 'bg-white border-slate-400'}`}>
               {!threat || threat.type !== 'unlocked' ? (
                 <div className="w-full h-full bg-sky-500/20 rounded-sm relative overflow-hidden">
                    <div className="w-8 h-0.5 bg-sky-400/30 absolute top-1 left-1 rounded"></div>
                    <div className="w-10 h-0.5 bg-sky-400/30 absolute top-2 left-1 rounded"></div>
                 </div>
               ) : (
                 <div className="w-full h-full bg-white rounded-sm flex flex-col items-center justify-center">
                   <UserX size={12} className="text-slate-700 mb-0.5" />
                 </div>
               )}
            </div>
            
            {(!threat || threat.type !== 'unlocked') && (
              <div className="absolute bottom-1 -right-2 w-8 h-10 bg-slate-300 rounded-t-full flex flex-col items-center justify-end z-10 border border-slate-600 shadow-lg">
                <div className="w-4 h-4 bg-slate-500 rounded-full absolute -top-2 border border-slate-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* The Threat Interactive Element */}
        <AnimatePresence>
          {threat && (
            <motion.div 
              key={threat.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 cursor-pointer group"
              onClick={(e) => interceptThreat(threat.id, threat.type, e)}
            >
              <div className="absolute inset-0 bg-red-500/10 animate-pulse rounded-lg"></div>
              
              <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] flex flex-col items-center transform transition-transform group-hover:scale-105">
                <div className="relative mb-1">
                  <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full"></div>
                  {renderThreatIcon(threat.type)}
                </div>
                
                <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 text-center leading-tight">
                  {renderThreatLabel(threat.type)}
                </div>
                
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ${threat.timeLeft < 1500 ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${(threat.timeLeft / threat.maxTime) * 100}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute top-2 left-2 text-[8px] font-black text-slate-700 uppercase tracking-widest">
          Workstation 0{index + 1}
        </div>
      </div>
    );
  };

  const renderTool = (type: ToolType, label: string, icon: React.ReactNode, threatTarget: string) => {
    const isSelected = selectedTool === type;
    return (
      <button 
        onClick={() => equipTool(type)}
        className={`flex-1 rounded-xl border p-2 flex flex-col items-center justify-center transition-all ${
          isSelected ? 'border-sky-500 bg-sky-200/60 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-slate-400 bg-slate-200 hover:border-slate-500'
        }`}
      >
        <div className={`mb-1 scale-75 origin-bottom ${isSelected ? 'text-sky-700' : 'text-slate-700'}`}>
          {icon}
        </div>
        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">{label}</div>
        <div className="text-[8px] text-slate-700 uppercase tracking-widest">Fixes: {threatTarget}</div>
      </button>
    );
  };

  return (
    <LabShell
      labId="itsupport18"
      title="The Office Defender"
      subtitle="IT Helpdesk Simulator"
      theme="studio"
      compact={true}
      onReset={resetGame}
      instruction="1. Review common human errors and security vulnerabilities in an office environment. 2. Monitor the simulated office and intercept risky behaviors by virtual employees. 3. Implement security policies and conduct virtual training sessions. 4. Achieve a high security score by successfully defending against all simulated threats."
    >
      <Celebration isActive={win} onReplay={resetGame} message="You successfully intercepted all human errors and kept the office network perfectly secure!" />

      <div className="flex flex-col h-full w-full max-w-4xl mx-auto gap-3 p-2">
        
        {/* Top Dashboard */}
        <div className="bg-white rounded-xl p-3 border-2 border-slate-400/50 shadow-lg flex justify-between items-center relative overflow-hidden shrink-0">
          
          <div className="flex items-center gap-4 z-10">
            <div>
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Shift Remaining</div>
              <div className="text-xl font-black text-slate-900 flex items-center gap-1 font-mono">
                {(timeLeft / 1000).toFixed(1)}s
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-300"></div>
            
            <div>
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Intercepted</div>
              <div className="text-xl font-black text-sky-700 flex items-center gap-1 font-mono">
                <ShieldCheck size={16} /> {score}
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-300"></div>

            <div>
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Breaches (Strikes)</div>
              <div className="flex gap-1 mt-0.5">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${s <= strikes ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>
                    <ShieldAlert size={12} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="z-10 flex gap-2">
            {!isPlaying && !gameOver && !win && (
              <button onClick={startGame} className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-6 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.4)] text-sm">
                <PlayCircle size={18} /> {timeLeft < TOTAL_TIME_MS ? "Resume" : "Start"}
              </button>
            )}
            {(gameOver || win) && (
              <button onClick={resetGame} className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold px-6 py-2 rounded-lg transition-colors">
                Play Again
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-3 min-h-0">
          
          {/* The Virtual Office (Left) */}
          <div className="flex-[2] grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
            {renderDesk(0)}
            {renderDesk(1)}
            {renderDesk(2)}
            {renderDesk(3)}
          </div>

          {/* Main Server Rack (Right) */}
          <div className={`flex-[1] rounded-xl border-2 p-3 flex flex-col relative overflow-hidden transition-colors min-h-0 ${
            serverStatus === 'patch_required' ? 'bg-amber-100/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
            serverStatus === 'vulnerable' ? 'bg-red-100/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse' :
            'bg-white border-slate-400/50 shadow-lg'
          }`}>
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <Server size={16} className={serverStatus === 'healthy' ? 'text-emerald-700' : serverStatus === 'patch_required' ? 'text-amber-700' : 'text-red-500'} />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Main Server</h2>
            </div>

            <div className="bg-white border border-slate-400 rounded-lg p-2 mb-2 flex-1 flex flex-col min-h-0">
               <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-700 font-mono shrink-0">
                 <Terminal size={10} /> root@server:~#
               </div>
               
               {serverStatus === 'healthy' && (
                 <div className="text-emerald-700 font-mono text-[10px] flex flex-col items-center justify-center flex-1 gap-1">
                   <CheckCircle2 size={24} />
                   <span>SYSTEM SECURE</span>
                 </div>
               )}

               {serverStatus !== 'healthy' && (
                 <div className="flex flex-col flex-1 min-h-0">
                    <div className={`text-[8px] font-black uppercase tracking-widest mb-1 leading-tight ${serverStatus === 'vulnerable' ? 'text-red-400' : 'text-amber-700'}`}>
                      {serverMessage}
                    </div>
                    {serverStatus === 'patch_required' && (
                      <div className="w-full h-1 bg-slate-200 rounded-full mb-2 overflow-hidden shrink-0">
                        <div className="h-full bg-amber-500" style={{ width: `${(patchTimeLeft / 10000) * 100}%` }}></div>
                      </div>
                    )}
                    
                    <div className="bg-white border border-slate-400 p-1 rounded text-center mb-1 shrink-0">
                      <div className="text-[8px] text-slate-700 uppercase">Incoming Patch</div>
                      <div className="text-sm font-mono text-slate-900 tracking-[0.2em]">{patchCode}</div>
                    </div>

                    <div className="bg-white border border-slate-400 p-1 rounded text-center mb-2 flex items-center justify-center shrink-0 h-6">
                      <span className="text-sky-700 font-mono text-sm tracking-[0.2em]">
                        {enteredCode}{enteredCode.length < 4 && <span className="animate-pulse">_</span>}
                      </span>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-1 mt-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleKeypadPress(num.toString())}
                          disabled={!isPlaying || num === '*' || num === '#'}
                          className="bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded py-1 text-slate-900 font-mono font-bold text-xs transition-colors"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                 </div>
               )}
            </div>
            
            {/* Server visual details */}
            <div className="flex gap-1 shrink-0">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-3 flex-1 bg-white border border-slate-400 rounded flex items-center px-1 justify-between">
                   <div className="flex gap-0.5">
                     <div className={`w-1 h-1 rounded-full ${serverStatus === 'vulnerable' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                     <div className={`w-1 h-1 rounded-full ${serverStatus === 'vulnerable' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Bottom: The IT Toolbelt */}
        <div className="bg-white rounded-xl p-2 border-2 border-slate-400/50 shadow-lg flex flex-col justify-center shrink-0">
           <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 text-center">Your IT Toolbelt (Equip before fixing threats)</div>
           <div className="flex gap-2">
             {renderTool('blocker', 'Network Blocker', <Ban size={24} />, 'Phishing Emails')}
             {renderTool('ejector', 'Port Ejector', <Plug size={24} />, 'Rogue USB Drives')}
             {renderTool('shredder', 'Data Shredder', <Scissors size={24} />, 'Exposed Passwords')}
             {renderTool('padlock', 'Screen Padlock', <Lock size={24} />, 'Unlocked Screens')}
           </div>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <AlertTriangle size={80} className="text-red-500 mb-6 animate-pulse" />
              <h2 className="text-5xl font-black text-red-100 uppercase tracking-widest mb-4">Network Breached!</h2>
              <p className="text-red-300 font-bold mb-8 text-center max-w-lg text-lg">Human error slipped past your defenses 3 times. The network has been compromised by ransomware!</p>
              <button onClick={resetGame} className="bg-red-600 hover:bg-red-500 text-white font-black px-10 py-4 rounded-2xl transition-colors shadow-lg text-xl uppercase tracking-wider">Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LabShell>
  );
}
