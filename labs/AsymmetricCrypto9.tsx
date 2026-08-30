"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Lock, Unlock, Key, KeyRound, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

type Step = 
  | "LEARN" 
  | "TRY" 
  | "FAIL" 
  | "UNDERSTAND" 
  | "IMPROVE" 
  | "COMPLETE" 
  | "OUTCOME";

export default function AsymmetricCrypto9() {
  const { reportComplete } = useLMSBridge("asymmetriccrypto9");
  const { playPop, playSuccess, playZap, playError, playChime } = useLabAudio();

  const [step, setStep] = useState<Step>("LEARN");
  const [decryptedText, setDecryptedText] = useState("****************");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetLab = () => {
    setStep("LEARN");
    setDecryptedText("****************");
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playPop) playPop();
  };

  const scrambleText = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      let str = "";
      for(let i=0; i<16; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setDecryptedText(str);
    }, 50);
  };

  const stopScramble = (finalText: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDecryptedText(finalText);
  };

  const handleNext = () => {
    playPop();
    if (step === "LEARN") setStep("TRY");
    else if (step === "FAIL") setStep("UNDERSTAND");
    else if (step === "UNDERSTAND") setStep("IMPROVE");
  };

  const handleTryDecrypt = () => {
    playZap();
    scrambleText();
    setTimeout(() => {
      playError();
      stopScramble("8F#2A!9K@1L$P30Z");
      setStep("FAIL");
    }, 2000);
  };

  const handleImproveDecrypt = () => {
    playChime();
    scrambleText();
    setStep("COMPLETE");
    setTimeout(() => {
      playSuccess();
      stopScramble("TOP_SECRET_PLANS");
      setStep("OUTCOME");
      setTimeout(() => {
        reportComplete();
      }, 4500);
    }, 2500);
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <LabShell 
      labId="asymmetriccrypto9" 
      theme="cosmos" 
      title="Asymmetric Cryptography"
      instruction="Understand Public Key Infrastructure (PKI). Public keys lock, Private keys unlock." 
      compact
      onReset={resetLab}
    >
      <Celebration 
        isActive={step === "OUTCOME"} 
        message="Decryption successful! You revealed the hidden message using the Private Key." 
        onReplay={resetLab} 
      />

      <div className="flex-1 flex flex-col h-full bg-slate-950/40 text-slate-200 rounded-3xl p-4 overflow-hidden border border-indigo-900/30 shadow-inner">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4 px-2">
           <h2 className="text-xl font-bold text-indigo-300">Decryption Terminal</h2>
           <div className="text-sm font-mono text-slate-500">
              TARGET: ALICE_SYSTEM
           </div>
        </div>

        {/* Central Viz */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4">
           {/* Message Box */}
           <motion.div 
             className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 relative shadow-xl"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
           >
              <div className="absolute -top-3 left-4 bg-slate-900 px-2 text-xs font-bold text-indigo-400 tracking-wider rounded">ENCRYPTED PAYLOAD</div>
              <div className="font-mono text-center text-2xl tracking-[0.2em] break-all h-16 flex items-center justify-center bg-black/50 rounded-lg text-emerald-400 border border-emerald-900/30">
                 {decryptedText}
              </div>
           </motion.div>

           {/* Keys Area */}
           <div className="flex gap-8 justify-center w-full">
              {/* Public Key */}
              <motion.div 
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-500 ${
                  (step === "TRY" || step === "FAIL") 
                    ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                    : "border-slate-800 bg-slate-900/50 opacity-50"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-emerald-950 flex items-center justify-center mb-2 border border-emerald-500/50">
                  <KeyRound className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-emerald-400 font-bold text-sm">PUBLIC KEY</div>
                <div className="text-xs text-slate-400 mt-1">Encrypts Only</div>
              </motion.div>

              {/* Private Key */}
              <motion.div 
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-500 ${
                  (step === "IMPROVE" || step === "COMPLETE" || step === "OUTCOME") 
                    ? "border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                    : "border-slate-800 bg-slate-900/50 opacity-30"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-amber-950 flex items-center justify-center mb-2 border border-amber-500/50">
                  <Key className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-amber-400 font-bold text-sm">PRIVATE KEY</div>
                <div className="text-xs text-slate-400 mt-1">Decrypts Only</div>
              </motion.div>
           </div>
        </div>

        {/* Pedagogical Panel - Fixed Height to prevent shifting */}
        <div className="h-44 shrink-0 bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-sm">
          <AnimatePresence mode="wait">
            
            {step === "LEARN" && (
              <motion.div key="learn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><Lock className="w-5 h-5"/> Learning Goal</h3>
                <p className="text-sm text-slate-300 flex-1 leading-relaxed">
                  In Asymmetric Cryptography, everyone has a pair of keys. The <b className="text-emerald-400">Public Key</b> acts like an open padlock anyone can snap shut. But only the owner holds the <b className="text-amber-400">Private Key</b> to open it.
                </p>
                <button onClick={handleNext} className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  Try it <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === "TRY" && (
              <motion.div key="try" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> Interactive Task</h3>
                <p className="text-sm text-slate-300 flex-1 leading-relaxed">
                  You've intercepted a secret message sent to Alice. You managed to find Alice's <b className="text-emerald-400">Public Key</b> online. Try using it to decrypt the message!
                </p>
                <button onClick={handleTryDecrypt} className="self-end px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  <KeyRound className="w-4 h-4" /> Decrypt with Public Key
                </button>
              </motion.div>
            )}

            {step === "FAIL" && (
              <motion.div key="fail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                <h3 className="text-rose-400 font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Decryption Failed</h3>
                <p className="text-sm text-slate-300 flex-1 leading-relaxed">
                  The output is total mathematical garbage! The text remains scrambled because the Public Key cannot reverse the encryption.
                </p>
                <button onClick={handleNext} className="self-end px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  Why did this fail? <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === "UNDERSTAND" && (
              <motion.div key="understand" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2"><Lock className="w-5 h-5"/> Understand Why</h3>
                <p className="text-sm text-slate-300 flex-1 leading-relaxed">
                  A Public Key only turns the mathematical gear <i>one way</i> (encrypt). It mathematically cannot turn it backward. You need Alice's heavily guarded <b className="text-amber-400">Private Key</b>.
                </p>
                <button onClick={handleNext} className="self-end px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  Switch to Alice <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === "IMPROVE" && (
              <motion.div key="improve" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2"><Unlock className="w-5 h-5"/> Improve</h3>
                <p className="text-sm text-slate-300 flex-1 leading-relaxed">
                  You are now Alice. You have access to your secure <b className="text-amber-400">Private Key</b>. Apply it to the ciphertext to reveal the message.
                </p>
                <button onClick={handleImproveDecrypt} className="self-end px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  <Key className="w-4 h-4" /> Apply Private Key
                </button>
              </motion.div>
            )}

            {step === "COMPLETE" && (
              <motion.div key="complete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Processing...</h3>
                <p className="text-sm text-slate-300 flex-1 leading-relaxed">
                  The Private Key is turning the mathematical gears backward. Decrypting data...
                </p>
              </motion.div>
            )}

            {step === "OUTCOME" && (
              <motion.div key="outcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Unlock className="w-5 h-5"/> Secret Revealed!</h3>
                <p className="text-sm text-slate-300 flex-1 leading-relaxed">
                  The message is perfectly decrypted. This is how the modern web securely transmits credit cards and passwords over public networks!
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </LabShell>
  );
}
