"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Lock, Unlock, ShieldAlert, ShieldCheck, Key, Cpu, ChevronRight, Server, Database, Activity } from "lucide-react";

type Stage = 1 | 2 | 3 | 4;
type AttackStatus = "idle" | "attacking" | "cracked" | "stalled" | "defended";

const COMMON_WORDS = ["password", "123456", "qwerty", "admin", "dragon", "baseball", "iloveyou", "secret", "letmein", "football", "shadow"];

const sha256_mock = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  let hex = Math.abs(hash).toString(16);
  while(hex.length < 64) hex += hex; 
  return hex.substring(0, 64);
};

const generateGarbage = (len: number) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let res = "";
  for(let i=0; i<len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

export default function PasswordCracking9() {
  const { reportComplete } = useLMSBridge("passwordcracking9");
  const { playPop, playZap, playError, playSuccess, playGearGrind } = useLabAudio();

  const [stage, setStage] = useState<Stage>(1);
  const [status, setStatus] = useState<AttackStatus>("idle");
  const [userPassword, setUserPassword] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [feedback, setFeedback] = useState<{title: string, msg: string, type: 'error'|'success'} | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Maximum number of logs to keep on screen to fill the terminal panel dynamically
  const MAX_LOGS = 12;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleReset = () => {
    setStage(1);
    setStatus("idle");
    setUserPassword("");
    setLogs([]);
    setCurrentGuess("");
    setFeedback(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    playPop();
  };

  const nextStage = () => {
    if (stage === 1) {
       setStage(2);
       setStatus("idle");
       setFeedback(null);
       setLogs([]);
       setCurrentGuess("");
       playPop();
    } else if (stage === 2) {
       setStage(3);
       setStatus("idle");
       setFeedback(null);
       setLogs([]);
       setCurrentGuess("");
       playPop();
    } else if (stage === 3 && (status === 'cracked' || status === 'stalled')) {
       setStatus("idle");
       setFeedback(null);
       setLogs([]);
       setCurrentGuess("");
       setUserPassword("");
       playPop();
    }
  };

  const runAttack = () => {
    if (stage === 1) {
      setStatus("attacking");
      setLogs(["Initiating Dictionary Attack...", "Loading wordlist: 10M entries..."]);
      let tick = 0;
      const dict = ["apple", "admin", "123456", "qwerty", "dragon"];
      playZap();
      
      intervalRef.current = setInterval(() => {
        tick++;
        const word = dict[tick % dict.length];
        setCurrentGuess(word);
        setLogs(prev => [...prev.slice(-MAX_LOGS), `Hash match check: ${word}`]);
        playPop();
        
        if (word === "dragon") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus("cracked");
          playError();
          setFeedback({
            title: "CRACKED (0.04s)",
            msg: "Dictionary attacks are instantly fast. Because 'dragon' is a common word, the engine found it immediately.",
            type: "error"
          });
        }
      }, 400);
    }
    
    if (stage === 2) {
      setStatus("attacking");
      setLogs(["Initiating Brute Force Attack...", "Mode: Exhaustive character permutations..."]);
      let tick = 0;
      playGearGrind();
      
      intervalRef.current = setInterval(() => {
        tick++;
        const garbage = generateGarbage(8);
        setCurrentGuess(garbage);
        setLogs(prev => [...prev.slice(-MAX_LOGS), `[BRUTE] ${garbage} -> INVALID`]);
        
        if (tick > 40) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus("stalled");
          playSuccess(); 
          setFeedback({
            title: "ATTACK STALLED",
            msg: "An 8-character complex password has over 6,000,000,000,000,000 combinations. The attack mathematically stalled.",
            type: "success"
          });
        }
      }, 80);
    }
    
    if (stage === 3) {
      if (!userPassword) {
         setFeedback({ title: "Input Required", msg: "Please enter a password to test your defense.", type: "error" });
         return;
      }
      
      setStatus("attacking");
      setLogs(["Initiating Multi-Vector Attack...", "Phase 1: Dictionary lookup..."]);
      let tick = 0;
      playZap();
      
      const weakWord = COMMON_WORDS.find(w => userPassword.toLowerCase().includes(w));
      
      intervalRef.current = setInterval(() => {
        tick++;
        
        if (tick < 15) {
           setCurrentGuess(COMMON_WORDS[tick % COMMON_WORDS.length]);
           setLogs(prev => [...prev.slice(-MAX_LOGS), `[DICT] Checking against known lists...`]);
           if (tick % 3 === 0) playPop();
        } 
        else if (tick === 15) {
           if (weakWord) {
             if (intervalRef.current) clearInterval(intervalRef.current);
             setStatus("cracked");
             setCurrentGuess(weakWord);
             playError();
             setFeedback({
               title: "CRACKED BY DICTIONARY",
               msg: `Your password contains the common word "${weakWord}". Hackers use massive lists to bypass complexity!`,
               type: "error"
             });
           } else {
             setLogs(prev => [...prev.slice(-MAX_LOGS), `Dictionary failed. Falling back to Brute Force...`]);
             playGearGrind();
           }
        }
        else {
           const garbage = generateGarbage(userPassword.length);
           setCurrentGuess(garbage);
           setLogs(prev => [...prev.slice(-MAX_LOGS), `[BRUTE] ${garbage} -> INVALID`]);
           
           if (tick > 50) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              if (userPassword.length < 8) {
                 setStatus("cracked");
                 setCurrentGuess(userPassword);
                 playError();
                 setFeedback({
                   title: "CRACKED BY BRUTE FORCE",
                   msg: `A password of only ${userPassword.length} characters takes less than a few minutes to brute force. Make it 8 or more characters!`,
                   type: "error"
                 });
              } else {
                 setStatus("defended");
                 setCurrentGuess("LOCKED");
                 playSuccess();
                 setFeedback({
                   title: "SYSTEM SECURED",
                   msg: "Your password defeated both the Dictionary and Brute Force engines! It is mathematically secure.",
                   type: "success"
                 });
                 setTimeout(() => {
                    setStage(4);
                    reportComplete();
                 }, 3500);
              }
           }
        }
      }, 70);
    }
  };

  return (
    <LabShell 
      labId="passwordcracking9" 
      theme="ocean" 
      title="Password Cracking Physics" 
      instruction="Step into the shoes of a hacker to understand how passwords are broken, then design an unbreakable defense." 
      compact
      onReset={handleReset}
    >
      <Celebration 
        isActive={stage === 4} 
        message="Mission Accomplished! A strong password avoids common words AND is long enough to make math impossible." 
        onReplay={handleReset} 
      />

      <div className="w-full flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0 relative isolate pb-4 max-w-7xl mx-auto px-2 md:px-4">
        
        {/* Feedback Banner Overlay */}
        <AnimatePresence>
           {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm w-full rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-5 md:p-6 text-center border-4 border-white
                  ${feedback.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}
              >
                 {feedback.type === 'error' ? <ShieldAlert size={48} className="mx-auto mb-3" /> : <ShieldCheck size={48} className="mx-auto mb-3" />}
                 <h3 className="font-black uppercase tracking-widest text-sm mb-2">{feedback.title}</h3>
                 <p className="font-bold text-base leading-tight mb-6">{feedback.msg}</p>
                 <button 
                   onClick={() => setFeedback(null)} 
                   className={`w-full py-4 bg-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md ${feedback.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}
                 >
                   Acknowledge
                 </button>
              </motion.div>
           )}
        </AnimatePresence>

        {/* LEFT COLUMN: Attacker Engine */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
           
           {/* Header */}
           <div className="h-12 bg-slate-50 border-b-2 border-slate-200 flex items-center px-4 justify-between shrink-0">
              <div className="flex items-center gap-2 text-indigo-600">
                 <Server size={18} />
                 <span className="font-black text-xs tracking-widest uppercase">Attack Engine v2.4</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">Status:</span>
                 <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white ${status === 'attacking' ? 'bg-amber-500 animate-pulse' : status === 'cracked' ? 'bg-emerald-500' : status === 'stalled' ? 'bg-rose-500' : 'bg-slate-400'}`}>
                    {status.toUpperCase()}
                 </div>
              </div>
           </div>
           
           {/* Active Guess Display (Fixed empty space issue by making it shrink-0 with explicit min-height) */}
           <div className="shrink-0 p-6 md:p-8 flex flex-col items-center justify-center border-b-2 border-slate-100 relative min-h-[160px]">
              <div className="absolute inset-0 bg-slate-50/50 [background-image:radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
              <div className="relative z-10 flex flex-col items-center w-full">
                 <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-3 flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    <Cpu size={14} className="text-indigo-500"/> Sequence Payload
                 </span>
                 <div className={`w-full max-w-md bg-white border-4 rounded-2xl p-4 md:p-6 text-center shadow-inner transition-colors duration-300
                    ${status === 'cracked' ? 'border-emerald-400 bg-emerald-50' : 
                      status === 'defended' || status === 'stalled' ? 'border-rose-400 bg-rose-50' : 
                      status === 'attacking' ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                    <div className={`text-2xl md:text-4xl font-mono font-black tracking-widest break-all
                       ${status === 'cracked' ? 'text-emerald-600' : 
                         status === 'defended' || status === 'stalled' ? 'text-rose-600' : 
                         status === 'attacking' ? 'text-amber-600' : 'text-slate-400'}`}>
                       {currentGuess || "WAITING"}
                    </div>
                 </div>
              </div>
           </div>

           {/* Logs Panel (Now strictly flex-1 to fill all remaining vertical space) */}
           <div className="flex-1 bg-slate-900 p-4 md:p-6 flex flex-col justify-end overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none" />
              <div className="flex items-center gap-2 mb-2 text-slate-400 absolute top-4 left-4 z-20">
                 <Database size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Engine Logs</span>
              </div>
              <div className="flex flex-col gap-1.5 z-0 mt-8">
                 {logs.map((log, i) => (
                    <div key={i} className={`font-mono text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2 duration-75 ${log.includes('CRACKED') ? 'text-emerald-400 font-bold' : log.includes('INVALID') ? 'text-slate-500' : 'text-sky-400'}`}>
                       <span className="opacity-50 mr-2">{'>'}</span>{log}
                    </div>
                 ))}
                 {logs.length === 0 && (
                    <div className="font-mono text-xs md:text-sm text-slate-400 opacity-80">
                       <span className="opacity-50 mr-2">{'>'}</span>System idle. Awaiting command...
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Defender Core */}
        <div className={`w-full lg:w-[400px] xl:w-[450px] shrink-0 bg-white/95 backdrop-blur-sm rounded-3xl border-2 shadow-sm p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden transition-all duration-500
          ${stage === 3 && status === 'idle' ? 'border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'border-slate-200'}`}>
           
           {/* Progress Tracker */}
           <div className="shrink-0 bg-slate-50 rounded-2xl p-4 border border-slate-200">
             <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3].map(s => (
                   <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${stage >= s ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                ))}
             </div>
             <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center justify-between">
                <span>Phase {stage} of 3</span>
                <span className="text-slate-500">{stage === 1 ? "Dictionary Exploit" : stage === 2 ? "Brute Force Reality" : "Design a Defense"}</span>
             </div>
           </div>

           {/* Lock Visualizer */}
           <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center relative min-h-[220px] shadow-inner overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              
              <div className={`absolute w-40 h-40 rounded-full blur-3xl opacity-20 transition-colors duration-500
                 ${status === 'cracked' ? 'bg-rose-500' : 
                   status === 'defended' || status === 'stalled' ? 'bg-emerald-500' : 
                   status === 'attacking' ? 'bg-amber-500' : 'bg-slate-400'}`} />
              
              <motion.div 
                animate={status === 'attacking' ? { x: [-4,4,-4,4,0], y: [-1,1,-1,1,0] } : {}} 
                transition={{ repeat: status === 'attacking' ? Infinity : 0, duration: 0.1 }}
                className="relative z-10 bg-white p-6 rounded-full shadow-lg border-4 border-slate-100"
              >
                {status === 'cracked' ? (
                   <Unlock size={64} strokeWidth={2} className="text-rose-500" />
                ) : status === 'defended' || status === 'stalled' ? (
                   <Lock size={64} strokeWidth={2} className="text-emerald-500" />
                ) : (
                   <Lock size={64} strokeWidth={2} className="text-slate-300" />
                )}
              </motion.div>
              
              <div className="mt-6 text-center relative z-10 w-full px-6">
                 <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500 font-black flex items-center justify-center gap-1 mb-2"><Activity size={12}/> Target Hash Profile</span>
                 <div className="font-mono text-[10px] md:text-[11px] text-slate-600 bg-white px-3 py-2.5 rounded-lg border-2 border-slate-200 shadow-sm break-all leading-relaxed h-14 flex items-center justify-center">
                    {status === 'cracked' ? <span className="text-rose-600 font-bold tracking-widest">SYSTEM_COMPROMISED</span> : sha256_mock(stage === 1 ? "dragon" : stage === 2 ? "Qx9!#mP2" : (userPassword || "000000"))}
                 </div>
              </div>
           </div>

           {/* Input & Controls */}
           <div className="shrink-0">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black block mb-2 ml-1">Target Password</label>
              
              {/* Fix: Explicit Flex container entirely prevents icon-text overlap */}
              <div className={`flex items-center px-4 py-1 mb-4 bg-white border-2 rounded-xl transition-all 
                 ${stage === 3 && status === 'idle' ? 'border-indigo-300 focus-within:border-indigo-500 focus-within:ring-4 ring-indigo-50 shadow-sm' : 'border-slate-200'}`}>
                 
                 <Key size={18} className={`shrink-0 mr-3 transition-colors ${stage === 3 && status === 'idle' ? 'text-indigo-500' : 'text-slate-400'}`} />
                 
                 <input 
                    type="text" 
                    disabled={stage !== 3 || status === 'attacking' || status === 'cracked' || status === 'defended'}
                    value={stage === 1 ? "dragon" : stage === 2 ? "Qx9!#mP2" : userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 text-sm md:text-base font-mono text-slate-900 placeholder-slate-400 outline-none w-full"
                    placeholder={stage === 3 ? "Type your defense..." : ""}
                 />
              </div>
              
              <button 
                 onClick={status === 'cracked' || status === 'stalled' ? nextStage : runAttack}
                 disabled={status === 'attacking' || (stage === 3 && status === 'idle' && !userPassword)}
                 className={`w-full py-4 rounded-xl font-black text-[11px] md:text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md
                    ${status === 'attacking' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
                      status === 'cracked' || status === 'stalled' ? 'bg-sky-500 text-white hover:bg-sky-600 hover:shadow-lg' : 
                      stage === 3 && status === 'idle' && !userPassword ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                      'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'}`}
              >
                 {status === 'attacking' ? (
                    <><Cpu size={18} className="animate-spin-slow"/> Attacking...</>
                 ) : status === 'cracked' || status === 'stalled' ? (
                    <>{stage === 3 ? "Retry Defense" : "Proceed to Next Phase"} <ChevronRight size={18}/></>
                 ) : (
                    <>{stage === 1 ? "Run Dictionary Attack" : stage === 2 ? "Run Brute Force Attack" : "Test Your Defense"}</>
                 )}
              </button>
           </div>
        </div>

      </div>
    </LabShell>
  );
}
