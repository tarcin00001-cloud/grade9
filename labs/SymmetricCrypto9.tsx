"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Box, Database, Key, Fingerprint, Zap, ArrowRight, RefreshCw, CheckCircle2, ShieldAlert, Send, Info, Lock, Unlock } from "lucide-react";

type Step = 'LEARN' | 'TRY_PUBLIC' | 'FAIL_RAW' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'SECURE_CHAT' | 'OUTCOME';

// Token states
type TokenState = 'empty' | 'base' | 'scrambled_a' | 'scrambled_b' | 'master' | 'encrypted_msg';

export default function SymmetricCrypto9() {
  const { reportComplete } = useLMSBridge();
  const { playPop, playZap, playError, playSuccess, playChime, playClick, playHeavyThud, playGearGrind } = useLabAudio();

  const [step, setStep] = useState<Step>('LEARN');
  const [isAnimating, setIsAnimating] = useState(false);
  const [payloads, setPayloads] = useState<{ id: number, type: TokenState | 'secret_a', dir: 1 | -1 }[]>([]);

  // Localized interactive states
  const [aliceWelded, setAliceWelded] = useState(false);
  const [bobWelded, setBobWelded] = useState(false);
  const [aliceForged, setAliceForged] = useState(false);
  const [bobForged, setBobForged] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Watch for localized completion
  useEffect(() => {
    if (step === 'UNDERSTAND' && aliceWelded && bobWelded) {
      timerRef.current = setTimeout(() => {
        if (isMounted.current) {
          setStep('IMPROVE');
          if (playPop) playPop();
        }
      }, 1000);
    }
  }, [aliceWelded, bobWelded, step, playPop]);

  useEffect(() => {
    if (step === 'COMPLETE' && aliceForged && bobForged) {
      timerRef.current = setTimeout(() => {
        if (isMounted.current) {
          setStep('SECURE_CHAT');
          if (playPop) playPop();
        }
      }, 1000);
    }
  }, [aliceForged, bobForged, step, playPop]);

  useEffect(() => {
    if (step === 'OUTCOME') {
      timerRef.current = setTimeout(() => {
        if (isMounted.current) {
          if (playSuccess) playSuccess();
          setTimeout(() => {
            if (isMounted.current) {
              reportComplete();
              if (playChime) playChime();
            }
          }, 2000);
        }
      }, 1500); // Wait 1.5s for them to see Eve's failure
    }
  }, [step, playSuccess, playChime, reportComplete]);

  // Derived state for the HUD
  let currentMission = 1;
  if (['FAIL_RAW'].includes(step)) currentMission = 2;
  if (['UNDERSTAND', 'IMPROVE'].includes(step)) currentMission = 3;
  if (['COMPLETE'].includes(step)) currentMission = 4;
  if (['SECURE_CHAT', 'OUTCOME'].includes(step)) currentMission = 5;

  // Derive node states
  let aliceToken: TokenState = 'empty';
  let bobToken: TokenState = 'empty';
  let eveTokens: (TokenState | 'secret_a')[] = [];

  if (step !== 'LEARN') {
    aliceToken = 'base';
    bobToken = 'base';
    eveTokens.push('base');
  }
  if (step === 'FAIL_RAW') {
    eveTokens.push('secret_a');
  }
  if (step === 'UNDERSTAND') {
    if (aliceWelded) aliceToken = 'scrambled_a';
    if (bobWelded) bobToken = 'scrambled_b';
  }
  if (step === 'IMPROVE') {
    aliceToken = 'scrambled_a';
    bobToken = 'scrambled_b';
  }
  if (step === 'COMPLETE' || step === 'SECURE_CHAT' || step === 'OUTCOME') {
    aliceToken = 'scrambled_b'; // She received Bob's
    bobToken = 'scrambled_a'; // He received Alice's
    eveTokens.push('scrambled_a', 'scrambled_b');
    
    if (aliceForged) aliceToken = 'master';
    if (bobForged) bobToken = 'master';
  }
  if (step === 'OUTCOME') {
    eveTokens.push('encrypted_msg');
  }

  const triggerAnimation = (newPayloads: { type: TokenState | 'secret_a', dir: 1 | -1 }[], nextStep: Step, duration: number) => {
    setIsAnimating(true);
    if (playZap) playZap();
    setPayloads(newPayloads.map((p, i) => ({ ...p, id: Date.now() + i })));
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      setPayloads([]);
      setStep(nextStep);
      setIsAnimating(false);
      
      if (nextStep === 'FAIL_RAW' && playError) playError();
      else if (nextStep === 'OUTCOME' && playError) playError(); // EVE fails sound
      else if (playPop) playPop();
    }, duration);
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStep('LEARN');
    setAliceWelded(false);
    setBobWelded(false);
    setAliceForged(false);
    setBobForged(false);
    setPayloads([]);
    setIsAnimating(false);
    if (playPop) playPop();
  };

  // --- Render Helpers --- //
  const getTokenIcon = (type: TokenState | 'secret_a') => {
    switch (type) {
      case 'base': return <Box size={32} className="text-slate-300 drop-shadow-md" />;
      case 'secret_a': return <Fingerprint size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />;
      case 'scrambled_a': return <Database size={32} className="text-cyan-600 drop-shadow-[0_0_12px_rgba(8,145,178,0.6)]" />;
      case 'scrambled_b': return <Database size={32} className="text-fuchsia-600 drop-shadow-[0_0_12px_rgba(192,38,211,0.6)]" />;
      case 'master': return <Key size={36} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]" />;
      case 'encrypted_msg': return <Lock size={30} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />;
      default: return null;
    }
  };

  const renderSlot = (token: TokenState, label: string) => (
    <div className="w-24 h-24 bg-slate-900 border-4 border-slate-700 rounded-xl shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Hardware scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none" />
      <AnimatePresence mode="wait">
        <motion.div
          key={token}
          initial={{ scale: 0.5, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 flex items-center justify-center w-full h-full"
        >
          {getTokenIcon(token)}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <LabShell
      labId="symmetriccrypto9"
      title="Symmetric Key Exchange"
      instruction="Use the cryptographic forge to securely exchange public keys and derive a shared master key, without ever exposing your private secrets."
      bgOverride="bg-gradient-to-b from-slate-100 via-white to-slate-200"
      compact={true}
      onReset={handleReset}
    >
      <Celebration
        isActive={step === 'OUTCOME'}
        message="System Secured! Alice sent an encrypted message that Eve could not decipher because Eve never acquired the Symmetric Key."
        onReplay={handleReset}
      />

      <div className="flex flex-col h-full relative z-10 max-w-5xl mx-auto w-full pt-4 lg:pt-6">
        
        {/* Mission HUD */}
        <div className="bg-white border-[3px] border-slate-200/70 shadow-lg shadow-sky-900/5 rounded-2xl px-2 sm:px-4 py-2 shrink-0 flex items-center gap-1 sm:gap-2 self-center w-full max-w-4xl mt-1 overflow-x-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-tight text-slate-500 hidden sm:inline mr-1">
            Missions:
          </span>
          {[
            { id: 1, title: "1. Base" },
            { id: 2, title: "2. Leak" },
            { id: 3, title: "3. Exchange" },
            { id: 4, title: "4. Shared Key" },
            { id: 5, title: "5. Secure Chat" }
          ].map((m) => (
            <div
              key={m.id}
              className={`flex-1 text-center py-1.5 px-1 rounded-lg text-[9px] md:text-xs font-bold transition-colors whitespace-nowrap min-w-[70px] ${
                currentMission === m.id
                  ? "bg-slate-800 text-sky-300 border-2 border-slate-900 shadow-inner"
                  : currentMission > m.id
                  ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                  : "bg-slate-50 text-slate-400 border-2 border-slate-100"
              }`}
            >
              {m.title}
            </div>
          ))}
        </div>

        {/* Mission Briefing Panel */}
        <div className={`self-center bg-white/90 backdrop-blur-sm border-y border-r border-l-[6px] rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] px-5 py-4 max-w-3xl w-full z-20 flex items-start gap-4 shrink-0 transition-colors duration-300 mt-4 ${
          ['FAIL_RAW'].includes(step) ? 'border-l-rose-500 border-y-rose-200 border-r-rose-200 bg-rose-50/30' :
          ['SECURE_CHAT', 'OUTCOME'].includes(step) ? 'border-l-emerald-500 border-y-emerald-200 border-r-emerald-200 bg-emerald-50/30' :
          'border-l-sky-500 border-y-slate-200 border-r-slate-200'
        }`}>
          <div className={`p-2.5 rounded-lg shrink-0 ${
            ['FAIL_RAW'].includes(step) ? 'bg-rose-100 text-rose-600' :
            ['SECURE_CHAT', 'OUTCOME'].includes(step) ? 'bg-emerald-100 text-emerald-600' :
            'bg-sky-100 text-sky-600'
          }`}>
            {['FAIL_RAW'].includes(step) ? <ShieldAlert size={22} /> :
             ['SECURE_CHAT', 'OUTCOME'].includes(step) ? <CheckCircle2 size={22} /> :
             <Info size={22} />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            {step === 'LEARN' && (
              <>
                <h3 className="font-black text-sky-900 text-xs md:text-sm uppercase tracking-widest">System Briefing</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">Alice and Bob need an identical Symmetric Key. But if they send raw secrets across Eve's monitored data-bus, she will steal them.</p>
              </>
            )}
            {step === 'TRY_PUBLIC' && (
              <>
                <h3 className="font-black text-sky-900 text-xs md:text-sm uppercase tracking-widest">Mission 1: Public Base</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">The network generated a Public Base. Everyone can see it. What happens if Alice tries to send her Private Secret directly to Bob?</p>
              </>
            )}
            {step === 'FAIL_RAW' && (
              <>
                <h3 className="font-black text-rose-900 text-xs md:text-sm uppercase tracking-widest">Mission 2: Data Leak!</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">Eve intercepted the unprotected Private Secret! If you send secrets un-mixed, the hacker wins. Initialize the Forge to try a secure method.</p>
              </>
            )}
            {step === 'UNDERSTAND' && (
              <>
                <h3 className="font-black text-sky-900 text-xs md:text-sm uppercase tracking-widest">Mission 3: The Cryptographic Forge</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">Instead of sending raw secrets, combine your Private Secret with the Public Base. This one-way physical function computes a safe Public Key!</p>
              </>
            )}
            {step === 'IMPROVE' && (
              <>
                <h3 className="font-black text-sky-900 text-xs md:text-sm uppercase tracking-widest">Mission 3: Safe Exchange</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">Now, transmit the computed Public Keys. Eve will intercept them, but she can't reverse the math to steal the Private Secrets inside!</p>
              </>
            )}
            {step === 'COMPLETE' && (
              <>
                <h3 className="font-black text-sky-900 text-xs md:text-sm uppercase tracking-widest">Mission 4: Derive Symmetric Key</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">You received the Public Keys. Insert your Private Secret one last time to mathematically derive the identical Symmetric Key.</p>
              </>
            )}
            {step === 'SECURE_CHAT' && (
              <>
                <h3 className="font-black text-sky-900 text-xs md:text-sm uppercase tracking-widest">Mission 5: Encrypted Transmission</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">Both nodes successfully derived the exact same Symmetric Key! Send a secure message and see if Eve can read it.</p>
              </>
            )}
            {step === 'OUTCOME' && (
              <>
                <h3 className="font-black text-emerald-900 text-xs md:text-sm uppercase tracking-widest">System Secured</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">Eve intercepted the message, but without the Symmetric Key, she couldn't decrypt it. The transmission was a total success!</p>
              </>
            )}
          </div>
        </div>

        {/* WORKSTATION VIEW */}
        <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-8 mt-6">
          
          {/* ALICE NODE */}
          <div className="flex-1 bg-slate-300 border-[6px] border-b-[12px] border-slate-400 rounded-2xl shadow-2xl flex flex-col relative min-w-0 z-20">
            <div className="bg-slate-800 border-b-4 border-slate-900 py-2 px-4 flex items-center justify-between rounded-t-lg">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2"><Fingerprint size={16}/> ALICE_NODE</span>
              <div className="flex gap-2">
                 <div className={`w-2.5 h-2.5 rounded-full shadow-inner ${step === 'OUTCOME' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'}`} />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-4">
               <div className="flex flex-col items-center mb-4">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 bg-slate-200 px-2 py-1 rounded shadow-inner">Private Secret A</div>
                 <div className="w-10 h-10 rounded bg-slate-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.6)] border-2 border-slate-700 flex items-center justify-center">
                    <Fingerprint size={20} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                 </div>
               </div>
               
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Forge Receptacle</div>
               {renderSlot(aliceToken, "Alice Token")}

               <div className="mt-6 w-full max-w-[200px]">
                 {step === 'TRY_PUBLIC' && (
                   <button 
                     onClick={() => {
                       if(isAnimating) return;
                       if(playClick) playClick();
                       triggerAnimation([{ type: 'secret_a', dir: 1 }], 'FAIL_RAW', 1500);
                     }}
                     disabled={isAnimating}
                     className="w-full bg-rose-600 border-b-[4px] border-rose-800 hover:bg-rose-500 text-white font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all text-[10px] uppercase tracking-wide shadow-lg"
                   >
                     <Send size={14} /> Send Unprotected Secret
                   </button>
                 )}
                 {step === 'UNDERSTAND' && !aliceWelded && (
                   <button 
                     onClick={() => {
                       if(playHeavyThud) playHeavyThud();
                       setAliceWelded(true);
                     }}
                     className="w-full bg-amber-500 border-b-[4px] border-amber-700 hover:bg-amber-400 text-slate-900 font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all text-[10px] uppercase tracking-wide shadow-lg"
                   >
                     <Zap size={14} /> Compute Public Key
                   </button>
                 )}
                 {step === 'UNDERSTAND' && aliceWelded && (
                   <div className="w-full bg-slate-400 border-b-[4px] border-slate-500 text-slate-600 font-black py-2.5 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide">
                     Key Computed
                   </div>
                 )}
                 {step === 'COMPLETE' && !aliceForged && (
                   <button 
                     onClick={() => {
                       if(playHeavyThud) playHeavyThud();
                       setAliceForged(true);
                     }}
                     className="w-full bg-indigo-600 border-b-[4px] border-indigo-800 hover:bg-indigo-500 text-white font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all text-[10px] uppercase tracking-wide shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                   >
                     <Key size={14} /> Derive Symmetric Key
                   </button>
                 )}
                 {step === 'COMPLETE' && aliceForged && (
                   <div className="w-full bg-slate-400 border-b-[4px] border-slate-500 text-slate-600 font-black py-2.5 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide">
                     Key Derived
                   </div>
                 )}
                 {step === 'SECURE_CHAT' && (
                   <button 
                     onClick={() => {
                       if(isAnimating) return;
                       if(playClick) playClick();
                       triggerAnimation([{ type: 'encrypted_msg', dir: 1 }], 'OUTCOME', 2500);
                     }}
                     disabled={isAnimating}
                     className="w-full bg-emerald-600 border-b-[4px] border-emerald-800 hover:bg-emerald-500 text-white font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all text-[10px] uppercase tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                   >
                     <Lock size={14} /> Send Secure Msg
                   </button>
                 )}
                 {step === 'OUTCOME' && (
                   <div className="w-full bg-slate-400 border-b-[4px] border-slate-500 text-slate-600 font-black py-2.5 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide">
                     Message Sent
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* EVE & DATA BUS (NETWORK PIPE) */}
          <div className="flex-1 flex flex-col justify-center relative min-w-0 z-10 min-h-[160px] lg:min-h-0">
             
             <div className="absolute top-0 lg:top-4 left-1/2 -translate-x-1/2 w-4/5 max-w-[260px] bg-slate-950 rounded-lg border-[4px] border-b-0 border-slate-800 p-3 shadow-2xl flex flex-col items-center z-30">
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mb-3">
                  <ShieldAlert size={14} /> EVE (PACKET SNIFFER)
                </div>
                
                <div className="flex gap-2 sm:gap-3 mb-2">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-slate-900 border-2 border-slate-700 shadow-inner flex items-center justify-center overflow-hidden">
                       <AnimatePresence mode="wait">
                         {eveTokens[i] && (
                           <motion.div
                             key={eveTokens[i]}
                             initial={{ scale: 0.5, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="flex items-center justify-center transform scale-[0.7] sm:scale-100"
                           >
                             {getTokenIcon(eveTokens[i])}
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {step === 'FAIL_RAW' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="absolute -bottom-10 bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded border-2 border-rose-800 uppercase tracking-widest animate-pulse shadow-[0_0_20px_#e11d48]"
                    >
                      Leak Detected!
                    </motion.div>
                  )}
                  {step === 'OUTCOME' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="absolute -bottom-10 bg-slate-800 text-rose-500 text-[10px] font-black px-3 py-1.5 rounded border-2 border-slate-700 uppercase tracking-widest shadow-[0_0_10px_#f43f5e]"
                    >
                      Decryption Failed!
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <div className="h-14 lg:h-16 w-full bg-slate-900/40 border-y-[6px] border-slate-700/80 shadow-[inset_0_5px_20px_rgba(0,0,0,0.5)] relative flex items-center overflow-hidden z-20 backdrop-blur-md">
                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent_24%,#475569_25%,transparent_26%,transparent_74%,#475569_75%,transparent_76%)] bg-[length:30px_100%]" />
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                <AnimatePresence>
                   {payloads.map(p => (
                     <motion.div
                        key={p.id}
                        initial={{ left: p.dir === 1 ? '0%' : '100%', x: '-50%' }}
                        animate={{ left: p.dir === 1 ? '100%' : '0%' }}
                        transition={{ duration: 1.5, ease: "linear" }}
                        className="absolute z-30 flex items-center justify-center bg-slate-800 p-2 rounded-lg border-2 border-slate-500 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                     >
                       {getTokenIcon(p.type)}
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
             
             <div className="absolute top-[90px] lg:top-[106px] left-1/2 -translate-x-1/2 w-20 h-10 border-x-[12px] border-slate-900 z-10 bg-slate-800" />

             <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[200px] z-30">
               {step === 'LEARN' && (
                  <button onClick={() => {
                    if (isAnimating) return;
                    if (playClick) playClick();
                    if (playGearGrind) playGearGrind();
                    setStep('TRY_PUBLIC');
                  }} className="w-full bg-slate-800 border-b-[4px] border-slate-950 hover:bg-slate-700 text-sky-400 font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-[10px] tracking-wide shadow-xl">
                    <Box size={14} /> Generate Public Base
                  </button>
               )}
               {step === 'FAIL_RAW' && (
                  <button onClick={() => {
                    if (playClick) playClick();
                    setPayloads([]);
                    setStep('UNDERSTAND');
                  }} className="w-full bg-amber-500 border-b-[4px] border-amber-700 hover:bg-amber-400 text-slate-900 font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-[10px] tracking-wide shadow-xl">
                    <RefreshCw size={14} /> Initialize Forge
                  </button>
               )}
               {step === 'IMPROVE' && (
                  <button onClick={() => {
                    if (isAnimating) return;
                    if (playClick) playClick();
                    triggerAnimation([{ type: 'scrambled_a', dir: 1 }, { type: 'scrambled_b', dir: -1 }], 'COMPLETE', 2000);
                  }} className="w-full bg-emerald-600 border-b-[4px] border-emerald-800 hover:bg-emerald-500 text-white font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all uppercase text-[10px] tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <Send size={14} /> Exchange Public Keys
                  </button>
               )}
             </div>
          </div>

          {/* BOB NODE */}
          <div className="flex-1 bg-slate-300 border-[6px] border-b-[12px] border-slate-400 rounded-2xl shadow-2xl flex flex-col relative min-w-0 z-20 mt-16 lg:mt-0">
            <div className="bg-slate-800 border-b-4 border-slate-900 py-2 px-4 flex items-center justify-between rounded-t-lg">
              <span className="text-xs font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-2"><Fingerprint size={16}/> BOB_NODE</span>
              <div className="flex gap-2">
                 <div className={`w-2.5 h-2.5 rounded-full shadow-inner ${step === 'OUTCOME' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'}`} />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-4">
               <div className="flex flex-col items-center mb-4">
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 bg-slate-200 px-2 py-1 rounded shadow-inner">Private Secret B</div>
                 <div className="w-10 h-10 rounded bg-slate-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.6)] border-2 border-slate-700 flex items-center justify-center">
                    <Fingerprint size={20} className="text-fuchsia-400 drop-shadow-[0_0_5px_rgba(192,38,211,0.8)]" />
                 </div>
               </div>
               
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Forge Receptacle</div>
               {renderSlot(bobToken, "Bob Token")}

               <div className="mt-6 w-full max-w-[200px]">
                 {step === 'TRY_PUBLIC' && (
                   <div className="w-full bg-slate-400 border-b-[4px] border-slate-500 text-slate-500 font-black py-2.5 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide opacity-50">
                     Awaiting Alice
                   </div>
                 )}
                 {step === 'UNDERSTAND' && !bobWelded && (
                   <button 
                     onClick={() => {
                       if(playHeavyThud) playHeavyThud();
                       setBobWelded(true);
                     }}
                     className="w-full bg-amber-500 border-b-[4px] border-amber-700 hover:bg-amber-400 text-slate-900 font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all text-[10px] uppercase tracking-wide shadow-lg"
                   >
                     <Zap size={14} /> Compute Public Key
                   </button>
                 )}
                 {step === 'UNDERSTAND' && bobWelded && (
                   <div className="w-full bg-slate-400 border-b-[4px] border-slate-500 text-slate-600 font-black py-2.5 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide">
                     Key Computed
                   </div>
                 )}
                 {step === 'COMPLETE' && !bobForged && (
                   <button 
                     onClick={() => {
                       if(playHeavyThud) playHeavyThud();
                       setBobForged(true);
                     }}
                     className="w-full bg-indigo-600 border-b-[4px] border-indigo-800 hover:bg-indigo-500 text-white font-black py-2.5 rounded flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all text-[10px] uppercase tracking-wide shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                   >
                     <Key size={14} /> Derive Symmetric Key
                   </button>
                 )}
                 {step === 'COMPLETE' && bobForged && (
                   <div className="w-full bg-slate-400 border-b-[4px] border-slate-500 text-slate-600 font-black py-2.5 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide">
                     Key Derived
                   </div>
                 )}
                 {step === 'SECURE_CHAT' && (
                   <div className="w-full bg-slate-400 border-b-[4px] border-slate-500 text-slate-500 font-black py-2.5 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide opacity-50">
                     Awaiting Message
                   </div>
                 )}
                 {step === 'OUTCOME' && (
                   <div className="w-full bg-emerald-100 border-b-[4px] border-emerald-300 text-emerald-700 font-black py-2.5 rounded flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide">
                     <Unlock size={14} /> Msg Decrypted
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
