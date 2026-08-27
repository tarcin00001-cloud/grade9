"use client";

import React, { useState, useEffect } from "react";
import LabShell from "@/components/LabShell";
import Colossus3DScene from "@/components/Colossus3DScene";
import Celebration from "@/components/Celebration";
import { Lock, Unlock, Play, FileText, CheckCircle2, KeyRound, Timer, ShieldAlert, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "intercept" | "patch" | "decrypt" | "output";

export default function Colossus28() {
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [phase, setPhase] = useState<Phase>("intercept");
  
  // Interactions
  const [tapeLoaded, setTapeLoaded] = useState(false);
  const [wiresPatched, setWiresPatched] = useState(false);
  const [cipherKey, setCipherKey] = useState(0);
  
  // Animation/Run State
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [messageDecoded, setMessageDecoded] = useState(false);
  const [decryptionFailed, setDecryptionFailed] = useState(false);
  
  // Level 3 Timer
  const [timeLeft, setTimeLeft] = useState(25);
  const [timeExpired, setTimeExpired] = useState(false);

  // Handle clicks from the 3D scene
  const handleComponentClick = (component: string) => {
    if (component === "reader" && !tapeLoaded) {
      setTapeLoaded(true);
      if (phase === "intercept") setPhase("patch");
    } else if (component === "panel" && !wiresPatched) {
      setWiresPatched(true);
      if (phase === "patch" && tapeLoaded) setPhase("decrypt");
    }
  };

  const handleKeyChange = (delta: number) => {
    setCipherKey((prev) => {
      const next = prev + delta;
      if (next < 0) return 999;
      if (next > 999) return 0;
      return next;
    });
  };

  // Level 3 Timer Logic
  useEffect(() => {
    if (level === 3 && !isDecrypting && !messageDecoded && !timeExpired) {
      const t = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimeExpired(true);
            setPhase("output");
            clearInterval(t);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [level, isDecrypting, messageDecoded, timeExpired]);

  // Decryption simulation
  useEffect(() => {
    if (isDecrypting) {
      const interval = setInterval(() => {
        setDecryptProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDecrypting(false);
            
            // Check win conditions
            if (level >= 2 && cipherKey !== 42) {
              setDecryptionFailed(true);
            } else {
              setMessageDecoded(true);
            }
            
            setPhase("output");
            return 100;
          }
          return prev + Math.random() * 5 + 3; 
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isDecrypting, level, cipherKey]);

  const runDecryption = () => {
    if (tapeLoaded && wiresPatched && !isDecrypting && !messageDecoded && !timeExpired) {
      setIsDecrypting(true);
    }
  };

  const nextLevel = () => {
    if (level < 3) {
      setLevel((prev) => (prev + 1) as 1 | 2 | 3);
      resetLevel();
    }
  };

  const resetLevel = () => {
    setPhase("intercept");
    setTapeLoaded(false);
    setWiresPatched(false);
    setIsDecrypting(false);
    setDecryptProgress(0);
    setMessageDecoded(false);
    setDecryptionFailed(false);
    setTimeExpired(false);
    setCipherKey(0);
    setTimeLeft(25);
  };

  return (
    <LabShell 
      title="Colossus Codebreaker" 
      theme="forge" 
      labId="28"
      onReset={() => { setLevel(1); resetLevel(); }}
      instruction="1. Study the history of the Colossus computer and the Lorenz cipher in WWII. 2. Configure the simulated electronic computer with the correct starting settings. 3. Run the decoding process to intercept and translate the encrypted message. 4. Submit the decoded plaintext to complete the historical simulation."
    >
      <Celebration 
        isActive={messageDecoded && level === 3} 
        message="You successfully completed all Colossus decryption missions and saved the Allies!" 
        onReplay={() => {
          setLevel(1);
          resetLevel();
        }} 
      />
      
      <div className="flex flex-col h-full w-full gap-4">
        
        {/* Header / Mission Briefing */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-red-600 text-white text-xs font-black uppercase px-2 py-1 rounded">Level {level}</span>
              <h2 className="text-red-700 font-black text-lg md:text-xl tracking-wider uppercase">
                {level === 1 && "Mission: Intercept Lorenz Cipher"}
                {level === 2 && "Mission: The Cipher Key"}
                {level === 3 && "Mission: Time Attack"}
              </h2>
            </div>
            <p className="text-slate-700 text-sm">
              {level === 1 && "Bletchley Park, 1944. Load the tape and patch the board to decode the message."}
              {level === 2 && "The Germans updated the cipher! Set the Cipher Key to '042' before running."}
              {level === 3 && "Transmission fading! You have 25 seconds to patch the board, set key to '042', and run."}
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${tapeLoaded ? 'bg-emerald-100 border-emerald-500/50 text-emerald-600' : 'bg-white border-slate-300 text-slate-500'}`}>
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Tape Loaded</span>
            </div>
            <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${wiresPatched ? 'bg-emerald-100 border-emerald-500/50 text-emerald-600' : 'bg-white border-slate-300 text-slate-500'}`}>
              <CheckCircle2 className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Logic Patched</span>
            </div>
            {level >= 2 && (
              <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${cipherKey === 42 ? 'bg-amber-100 border-amber-500/50 text-amber-600' : 'bg-white border-slate-300 text-slate-500'}`}>
                <KeyRound className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Key Configured</span>
              </div>
            )}
            {level === 3 && (
              <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${timeExpired ? 'bg-red-100 border-red-500/50 text-red-600 animate-pulse' : timeLeft <= 10 ? 'bg-amber-100 border-amber-500 text-amber-600' : 'bg-white border-slate-300 text-slate-600'}`}>
                <Timer className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-center">{timeLeft}s Left</span>
              </div>
            )}
          </div>
        </div>

        {/* 3D Scene Container */}
        <div className="relative flex-1 min-h-[200px] rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-[#cbd5e1]">
          <Colossus3DScene 
            level={level}
            phase={phase}
            tapeLoaded={tapeLoaded}
            wiresPatched={wiresPatched}
            cipherKey={cipherKey}
            isDecrypting={isDecrypting}
            onComponentClick={handleComponentClick}
            onKeyChange={handleKeyChange}
          />

          {/* Action Overlay Button */}
          <AnimatePresence>
            {tapeLoaded && wiresPatched && phase === "decrypt" && !isDecrypting && !messageDecoded && !decryptionFailed && !timeExpired && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-6 right-6 flex items-center justify-center pointer-events-none z-50"
              >
                <button 
                  onClick={runDecryption}
                  className="pointer-events-auto bg-red-600 hover:bg-red-500 text-white border-4 border-red-900 rounded-full px-8 py-4 text-2xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(220,38,38,0.6)] flex items-center gap-3 transition-transform active:scale-95"
                >
                  <Play className="fill-current w-8 h-8" />
                  Run Decryption
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Progress Overlay */}
          {isDecrypting && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 border border-red-500/50 p-4 rounded-xl backdrop-blur-md w-64 text-center z-10">
              <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-2 animate-pulse">Processing 5,000 chars/sec</h3>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-100 ease-linear"
                  style={{ width: `${Math.min(100, decryptProgress)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel - Output & Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 min-h-[220px]">
          {/* Left: Console / Log */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col relative overflow-hidden font-mono">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-200 pb-2 mb-3 flex justify-between">
              <span>System Log</span>
              <span>Lvl {level}</span>
            </h3>
            
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto text-sm pb-10">
              <p className="text-slate-700">{">"} SYSTEM_INIT ... OK</p>
              {tapeLoaded && <p className="text-emerald-700">{">"} ENCRYPTED_TAPE_MOUNTED ... OK</p>}
              {wiresPatched && <p className="text-emerald-700">{">"} LOGIC_GATES_CONFIGURED ... OK</p>}
              
              {isDecrypting && (
                <p className="text-amber-700 animate-pulse">{">"} TESTING_DECRYPTION_KEYS ...</p>
              )}
              
              {messageDecoded && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-700 font-bold mt-2">
                  {">"} CIPHER_BROKEN. ALLIED COMMAND NOTIFIED.
                </motion.p>
              )}
              
              {decryptionFailed && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-700 font-bold mt-2">
                  {">"} ERROR: INVALID CIPHER KEY. DECRYPTION FAILED.
                </motion.p>
              )}
              
              {timeExpired && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-700 font-bold mt-2">
                  {">"} TIMEOUT: TRANSMISSION LOST.
                </motion.p>
              )}
            </div>
          </div>

          {/* Right: Message Output */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center relative text-center">
            {(!messageDecoded && !decryptionFailed && !timeExpired) ? (
              <div className="text-slate-500 flex flex-col items-center gap-3">
                <Lock className="w-12 h-12 opacity-50" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-slate-600">Awaiting Decryption</h3>
                  <p className="text-xs mt-1 max-w-[250px] text-slate-500">
                    {level === 1 ? "Load the encrypted tape and patch the logic gates in the 3D view to begin." :
                     level === 2 ? "Set the Cipher Key on the 3D configurator panel to '042', then patch and run." :
                     "Hurry! Patch the logic and set the key to '042' before the timer expires!"}
                  </p>
                </div>
              </div>
            ) : messageDecoded ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-emerald-600 flex flex-col items-center gap-3"
              >
                <Unlock className="w-10 h-10 text-emerald-500" />
                <div>
                  <h3 className="font-black text-xl uppercase tracking-widest text-emerald-700">Message Decrypted</h3>
                  <div className="mt-2 bg-emerald-50 p-3 rounded border border-emerald-200 text-emerald-900 font-mono text-sm">
                    <p className="opacity-50 text-[10px] mb-1">INTERCEPTED GERMAN TRANSMISSION</p>
                    <p>ENEMY POSITIONS REVEALED.</p>
                    {level >= 2 && <p>D-DAY PREPARATIONS SECURE.</p>}
                  </div>
                </div>
                {level < 3 && (
                  <button onClick={nextLevel} className="mt-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-sm rounded-full flex items-center gap-2">
                    Next Level <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-red-600 flex flex-col items-center gap-3"
              >
                <ShieldAlert className="w-12 h-12 text-red-500" />
                <div>
                  <h3 className="font-black text-xl uppercase tracking-widest text-red-700">
                    {timeExpired ? "Transmission Lost" : "Decryption Failed"}
                  </h3>
                  <p className="text-xs text-red-800 mt-2">
                    {timeExpired ? "You ran out of time. The Germans stopped transmitting." : "The machine printed gibberish. Did you configure the correct Cipher Key (042)?"}
                  </p>
                </div>
                <button onClick={resetLevel} className="mt-2 px-6 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-900 font-black uppercase text-sm rounded-full">
                  Retry Level
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </LabShell>
  );
}
