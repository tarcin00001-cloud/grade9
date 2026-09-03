"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Lock, Unlock, Key, KeyRound, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, ShieldX, Building2 } from "lucide-react";

type Mission1Step = "LEARN" | "TRY" | "FAIL" | "UNDERSTAND" | "IMPROVE" | "COMPLETE" | "OUTCOME";
type Mission2Step = "INTRO" | "TESTING_A" | "FAILED_A" | "TESTING_B" | "SUCCESS_B" | "OUTCOME";

export default function AsymmetricCrypto9() {
  const { reportComplete } = useLMSBridge("asymmetriccrypto9");
  const { playPop, playSuccess, playZap, playError, playChime } = useLabAudio();

  const [mission, setMission] = useState<1 | 2>(1);
  const [m1Step, setM1Step] = useState<Mission1Step>("LEARN");
  const [m2Step, setM2Step] = useState<Mission2Step>("INTRO");
  
  const [decryptedText, setDecryptedText] = useState("****************");
  const [payloadA, setPayloadA] = useState("****************");
  const [payloadB, setPayloadB] = useState("****************");
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetLab = () => {
    setMission(1);
    setM1Step("LEARN");
    setM2Step("INTRO");
    setDecryptedText("****************");
    setPayloadA("****************");
    setPayloadB("****************");
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playPop) playPop();
  };

  const scrambleText = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      let str = "";
      for(let i=0; i<16; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setter(str);
    }, 50);
  };

  const stopScramble = (setter: React.Dispatch<React.SetStateAction<string>>, finalText: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setter(finalText);
  };

  // --- MISSION 1 HANDLERS ---
  const handleNextM1 = () => {
    playPop();
    if (m1Step === "LEARN") setM1Step("TRY");
    else if (m1Step === "FAIL") setM1Step("UNDERSTAND");
    else if (m1Step === "UNDERSTAND") setM1Step("IMPROVE");
  };

  const handleTryDecrypt = () => {
    playZap();
    scrambleText(setDecryptedText);
    setTimeout(() => {
      playError();
      stopScramble(setDecryptedText, "8F#2A!9K@1L$P30Z");
      setM1Step("FAIL");
    }, 2000);
  };

  const handleImproveDecrypt = () => {
    playChime();
    scrambleText(setDecryptedText);
    setM1Step("COMPLETE");
    setTimeout(() => {
      playSuccess();
      stopScramble(setDecryptedText, "TOP_SECRET_PLANS");
      setM1Step("OUTCOME");
    }, 2500);
  };

  // --- MISSION 2 HANDLERS ---
  const startMission2 = () => {
    playPop();
    setMission(2);
  };

  const handleTestA = () => {
    playZap();
    setM2Step("TESTING_A");
    scrambleText(setPayloadA);
    setTimeout(() => {
      playError();
      stopScramble(setPayloadA, "8F#2A!9K@1L$P30Z");
      setM2Step("FAILED_A");
    }, 2000);
  };

  const handleTestB = () => {
    playZap();
    setM2Step("TESTING_B");
    scrambleText(setPayloadB);
    setTimeout(() => {
      playSuccess();
      stopScramble(setPayloadB, "AUTHORIZE_$5000.");
      setM2Step("SUCCESS_B");
      setTimeout(() => {
        setM2Step("OUTCOME");
        reportComplete();
      }, 2500);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <LabShell 
      labId="asymmetriccrypto9" 
      theme="ocean" 
      title="Asymmetric Cryptography"
      instruction={mission === 1 ? "Mission 1: Confidentiality. Public keys lock, Private keys unlock." : "Mission 2: Digital Signatures. Prove identity by reversing the math."} 
      compact
      onReset={resetLab}
    >
      <Celebration 
        isActive={m2Step === "OUTCOME"} 
        message="Mastery Achieved! You successfully verified Alice's Digital Signature." 
        onReplay={resetLab} 
      />

      <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 rounded-2xl p-4 overflow-hidden border border-slate-200 shadow-sm relative z-10 select-none">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 px-2">
           <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mission === 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-700'}`}>
               {mission === 1 ? <ShieldAlert className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
             </div>
             <h2 className="text-lg font-black text-slate-800">
               {mission === 1 ? "Alice's Inbox" : "Bank Verification Server"}
             </h2>
           </div>
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
              TARGET: {mission === 1 ? "ALICE_SYSTEM" : "BANK_SERVER"}
           </div>
        </div>

        {/* Central Viz */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4">
           
           {/* Message Box(es) */}
           {mission === 1 ? (
             <motion.div 
               className="w-full max-w-md bg-slate-900 rounded-2xl p-6 mb-10 relative shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-4 border-slate-800"
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 px-4 py-1 text-[10px] font-black text-white tracking-widest rounded-full shadow-md uppercase">
                  Intercepted Payload
                </div>
                <div className={`font-mono text-center text-xl sm:text-2xl tracking-[0.2em] break-all h-16 flex items-center justify-center bg-black/60 rounded-xl border-2 shadow-inner transition-colors duration-300 ${
                  m1Step === "FAIL" ? "text-rose-400 border-rose-900/50" :
                  m1Step === "OUTCOME" ? "text-emerald-400 border-emerald-900/50" :
                  "text-cyan-400 border-cyan-900/50"
                }`}>
                   {decryptedText}
                </div>
             </motion.div>
           ) : (
             <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <motion.div 
                  className={`bg-slate-900 rounded-2xl p-6 relative shadow-xl border-4 transition-colors duration-300 ${m2Step === "FAILED_A" ? "border-rose-600" : "border-slate-800"}`}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-black text-white tracking-widest rounded-full shadow-md uppercase ${m2Step === "FAILED_A" ? "bg-rose-600" : "bg-slate-600"}`}>
                    Message A
                  </div>
                  <div className={`font-mono text-center text-sm tracking-[0.1em] break-all h-12 flex items-center justify-center bg-black/60 rounded-xl border shadow-inner transition-colors duration-300 ${
                    m2Step === "FAILED_A" ? "text-rose-400 border-rose-900/50" : "text-slate-400 border-slate-700"
                  }`}>
                    {payloadA}
                  </div>
                </motion.div>
                
                <motion.div 
                  className={`bg-slate-900 rounded-2xl p-6 relative shadow-xl border-4 transition-colors duration-300 ${m2Step === "SUCCESS_B" || m2Step === "OUTCOME" ? "border-emerald-500" : "border-slate-800"}`}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                >
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-black text-white tracking-widest rounded-full shadow-md uppercase ${m2Step === "SUCCESS_B" || m2Step === "OUTCOME" ? "bg-emerald-500" : "bg-slate-600"}`}>
                    Message B
                  </div>
                  <div className={`font-mono text-center text-sm tracking-[0.1em] break-all h-12 flex items-center justify-center bg-black/60 rounded-xl border shadow-inner transition-colors duration-300 ${
                    m2Step === "SUCCESS_B" || m2Step === "OUTCOME" ? "text-emerald-400 border-emerald-900/50" : "text-slate-400 border-slate-700"
                  }`}>
                    {payloadB}
                  </div>
                </motion.div>
             </div>
           )}

           {/* Keys Area */}
           <div className="flex gap-6 sm:gap-10 justify-center w-full">
              {/* Public Key */}
              <motion.div 
                animate={(m1Step === "FAIL" || m2Step === "FAILED_A") ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-300 relative ${
                  (m1Step === "TRY" || m1Step === "FAIL" || mission === 2) 
                    ? "bg-gradient-to-b from-emerald-50 to-emerald-100 border-emerald-400 shadow-[0_8px_20px_rgba(16,185,129,0.2)] scale-105 z-10" 
                    : "bg-white border-slate-200 opacity-60 scale-95"
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner ${
                  (m1Step === "TRY" || m1Step === "FAIL" || mission === 2) ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  <Lock className="w-8 h-8" />
                </div>
                <div className={`font-black text-sm tracking-wider ${
                  (m1Step === "TRY" || m1Step === "FAIL" || mission === 2) ? "text-emerald-700" : "text-slate-500"
                }`}>ALICE'S PUBLIC KEY</div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                  {mission === 1 ? "Encrypts Only" : "Decrypts Signatures"}
                </div>
              </motion.div>

              {/* Private Key */}
              <motion.div 
                className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-300 relative ${
                  (m1Step === "IMPROVE" || m1Step === "COMPLETE" || m1Step === "OUTCOME") 
                    ? "bg-gradient-to-b from-amber-50 to-amber-100 border-amber-400 shadow-[0_8px_20px_rgba(245,158,11,0.2)] scale-105 z-10" 
                    : "bg-white border-slate-200 opacity-40 grayscale scale-95"
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner ${
                  (m1Step === "IMPROVE" || m1Step === "COMPLETE" || m1Step === "OUTCOME") ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  <Key className="w-8 h-8" />
                </div>
                <div className={`font-black text-sm tracking-wider ${
                  (m1Step === "IMPROVE" || m1Step === "COMPLETE" || m1Step === "OUTCOME") ? "text-amber-700" : "text-slate-500"
                }`}>ALICE'S PRIVATE KEY</div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                  {mission === 1 ? "Decrypts Secrets" : "Hidden"}
                </div>
              </motion.div>
           </div>
        </div>

        {/* Pedagogical Panel */}
        <div className="h-[180px] shrink-0 bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-slate-50 opacity-50 pointer-events-none">
             <KeyRound className="w-32 h-32" />
          </div>
          
          <AnimatePresence mode="wait">
            
            {/* --- MISSION 1 CONTENT --- */}
            {mission === 1 && m1Step === "LEARN" && (
              <motion.div key="m1_learn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-indigo-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><Lock className="w-4 h-4"/> Mission 1: Confidentiality</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  In Asymmetric Cryptography, everyone has a pair of keys. The <b className="text-emerald-600">Public Key</b> acts like an open padlock anyone can snap shut. But only the owner holds the <b className="text-amber-600">Private Key</b> to open it.
                </p>
                <button onClick={handleNextM1} className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-1 shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
                  Try it out <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {mission === 1 && m1Step === "TRY" && (
              <motion.div key="m1_try" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-emerald-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><ShieldAlert className="w-4 h-4"/> Interactive Task</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  You've intercepted a secret message sent to Alice. You found Alice's <b className="text-emerald-600">Public Key</b> online. Try using it to decrypt the message!
                </p>
                <button onClick={handleTryDecrypt} className="self-end px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 shadow-[0_4px_0_rgba(16,185,129,1)] active:shadow-none text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
                  <Lock className="w-4 h-4" /> Decrypt with Public Key
                </button>
              </motion.div>
            )}

            {mission === 1 && m1Step === "FAIL" && (
              <motion.div key="m1_fail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-rose-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><AlertTriangle className="w-4 h-4"/> Decryption Failed</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  The text remains scrambled! The mathematical gears are jammed because the <b className="text-emerald-600">Public Key</b> cannot reverse the encryption.
                </p>
                <button onClick={handleNextM1} className="self-end px-6 py-2.5 bg-rose-500 hover:bg-rose-600 active:translate-y-1 shadow-[0_4px_0_rgba(244,63,94,1)] active:shadow-none text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
                  Why did this fail? <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {mission === 1 && m1Step === "UNDERSTAND" && (
              <motion.div key="m1_understand" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-amber-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><Lock className="w-4 h-4"/> Understand Why</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  A Public Key only turns the mathematical gear <i>one way</i> (encrypt). It cannot turn it backward. You need Alice's heavily guarded <b className="text-amber-600">Private Key</b>.
                </p>
                <button onClick={handleNextM1} className="self-end px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:translate-y-1 shadow-[0_4px_0_rgba(245,158,11,1)] active:shadow-none text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
                  Switch to Alice's Perspective <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {mission === 1 && m1Step === "IMPROVE" && (
              <motion.div key="m1_improve" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-amber-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><Unlock className="w-4 h-4"/> Improve</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  You are now Alice. You have access to your secure <b className="text-amber-600">Private Key</b>. Apply it to the ciphertext to unlock the message.
                </p>
                <button onClick={handleImproveDecrypt} className="self-end px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:translate-y-1 shadow-[0_4px_0_rgba(245,158,11,1)] active:shadow-none text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
                  <Key className="w-4 h-4" /> Apply Private Key
                </button>
              </motion.div>
            )}

            {mission === 1 && m1Step === "COMPLETE" && (
              <motion.div key="m1_complete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center items-center relative z-10">
                <h3 className="text-indigo-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm animate-pulse"><CheckCircle2 className="w-6 h-6"/> Processing Decryption...</h3>
                <p className="text-sm font-medium text-slate-500">
                  The Private Key is mathematically unlocking the data...
                </p>
              </motion.div>
            )}

            {mission === 1 && m1Step === "OUTCOME" && (
              <motion.div key="m1_outcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-emerald-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><Unlock className="w-4 h-4"/> Secret Revealed!</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  The message is perfectly decrypted. You used the Private Key to read a secret. But keys have a second, even more powerful feature.
                </p>
                <button onClick={startMission2} className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-1 shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer animate-pulse">
                  Start Mission 2: Digital Signatures <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* --- MISSION 2 CONTENT --- */}
            {mission === 2 && m2Step === "INTRO" && (
              <motion.div key="m2_intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-indigo-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><Building2 className="w-4 h-4"/> Mission 2: Digital Signatures</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  You are a Bank. You received two wire requests claiming to be from Alice. Alice "signed" her real message by encrypting it with her <b className="text-amber-600">Private Key</b>. Which one is real?
                </p>
                <button onClick={handleTestA} className="self-end px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 shadow-[0_4px_0_rgba(16,185,129,1)] active:shadow-none text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
                  Test Message A with Public Key <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {mission === 2 && m2Step === "TESTING_A" && (
              <motion.div key="m2_test_a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center items-center relative z-10">
                <h3 className="text-indigo-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm animate-pulse"><Lock className="w-6 h-6"/> Testing Signature A...</h3>
                <p className="text-sm font-medium text-slate-500">
                  Applying Alice's Public Key...
                </p>
              </motion.div>
            )}

            {mission === 2 && m2Step === "FAILED_A" && (
              <motion.div key="m2_failed_a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-rose-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><ShieldX className="w-4 h-4"/> Forgery Detected!</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  Message A failed to decrypt! This means it was NOT encrypted with Alice's Private Key. A hacker tried to spoof her identity.
                </p>
                <button onClick={handleTestB} className="self-end px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 shadow-[0_4px_0_rgba(16,185,129,1)] active:shadow-none text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer">
                  Test Message B <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {mission === 2 && m2Step === "TESTING_B" && (
              <motion.div key="m2_test_b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col justify-center items-center relative z-10">
                <h3 className="text-indigo-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm animate-pulse"><Lock className="w-6 h-6"/> Testing Signature B...</h3>
                <p className="text-sm font-medium text-slate-500">
                  Applying Alice's Public Key...
                </p>
              </motion.div>
            )}

            {mission === 2 && (m2Step === "SUCCESS_B" || m2Step === "OUTCOME") && (
              <motion.div key="m2_success_b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col relative z-10">
                <h3 className="text-emerald-600 font-black mb-2 flex items-center gap-2 uppercase tracking-wide text-sm"><CheckCircle2 className="w-4 h-4"/> Identity Verified!</h3>
                <p className="text-sm font-medium text-slate-600 flex-1 leading-relaxed">
                  Message B successfully decrypted into readable text! Because only Alice has her Private Key, this perfectly proves she wrote the message.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </LabShell>
  );
}
