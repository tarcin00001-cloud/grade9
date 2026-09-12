"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, ArrowRight, Key, FileText, Send, ShieldAlert, ShieldCheck, AlertTriangle, FileSignature, FileWarning, Fingerprint, Lock } from "lucide-react";

const TIMER_DURATION_SECONDS = 5 * 60;

type Phase = 
  | "LEARN" 
  | "SEND_UNSIGNED" 
  | "HACKER_UNSIGNED" 
  | "FAIL_SAFELY" 
  | "UNDERSTAND"
  | "IMPROVE"
  | "READY_SIGNED"
  | "SEND_SIGNED"
  | "HACKER_SIGNED"
  | "OUTCOME";

export default function DigitalSignatures9() {
  const { reportComplete: _reportComplete } = useLMSBridge("digitalsignatures9");
  const { playPop, playZap, playError, playSuccess, playChime } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("LEARN");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [docAmount, setDocAmount] = useState("$100");
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureBroken, setSignatureBroken] = useState(false);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const reportComplete = useCallback(() => {
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  // Global Timer
  useEffect(() => {
    if (timedOut || phase === "OUTCOME") {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timedOut, phase]);

  useEffect(() => {
    if (timedOut) _reportComplete({ points: 0 });
  }, [timedOut, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const getInstruction = () => {
    switch (phase) {
      case "LEARN": return "Send a $100 bank transfer to Bob across the internet.";
      case "SEND_UNSIGNED": return "Sending plain text document to Bob...";
      case "HACKER_UNSIGNED": return "ALERT: A hacker has intercepted your document in transit!";
      case "FAIL_SAFELY": return "BANK DRAINED! Bob received the document and processed $9,000. He couldn't prove it was fake.";
      case "UNDERSTAND": return "Plain text is like a postcard. Anyone can read it and scribble over it. Reset and try again.";
      case "IMPROVE": return "Let's stamp it with a Digital Signature using Alice's Private Key before sending.";
      case "READY_SIGNED": return "Signed! The signature locks the $100 value. Send the signed document.";
      case "SEND_SIGNED": return "Sending signed document to Bob...";
      case "HACKER_SIGNED": return "The hacker intercepted it! They are trying to change it to $9,000...";
      case "OUTCOME": return "SUCCESS! The tampering broke the signature. Bob's verification engine rejected the forged transfer.";
    }
  };

  const handleSendUnsigned = () => {
    if (phase !== "LEARN") return;
    setPhase("SEND_UNSIGNED");
    playPop();

    timersRef.current.push(setTimeout(() => {
      setPhase("HACKER_UNSIGNED");
      playError();
      timersRef.current.push(setTimeout(() => {
        setDocAmount("$9,000"); // Hacker changes it
        playZap();
        timersRef.current.push(setTimeout(() => {
          setPhase("FAIL_SAFELY");
          playError();
          timersRef.current.push(setTimeout(() => {
            setPhase("UNDERSTAND");
          }, 4000));
        }, 1500));
      }, 2000));
    }, 1500));
  };

  const handleReset = () => {
    if (phase !== "UNDERSTAND") return;
    setPhase("IMPROVE");
    setDocAmount("$100");
    setHasSignature(false);
    setSignatureBroken(false);
    playPop();
  };

  const handleSign = () => {
    if (phase !== "IMPROVE") return;
    setHasSignature(true);
    setPhase("READY_SIGNED");
    playChime();
  };

  const handleSendSigned = () => {
    if (phase !== "READY_SIGNED") return;
    setPhase("SEND_SIGNED");
    playPop();

    timersRef.current.push(setTimeout(() => {
      setPhase("HACKER_SIGNED");
      playError();
      timersRef.current.push(setTimeout(() => {
        setDocAmount("$9,000"); // Hacker changes it again
        setSignatureBroken(true); // BUT IT BREAKS THE SIGNATURE!
        playZap();
        timersRef.current.push(setTimeout(() => {
          setPhase("OUTCOME");
          playSuccess();
          timersRef.current.push(setTimeout(() => {
            reportComplete();
          }, 4500));
        }, 2000));
      }, 2000));
    }, 1500));
  };

  // Helper to determine where the document is
  const getDocumentLocation = () => {
    switch (phase) {
      case "LEARN":
      case "UNDERSTAND":
      case "IMPROVE":
      case "READY_SIGNED":
        return "ALICE";
      case "SEND_UNSIGNED":
      case "HACKER_UNSIGNED":
      case "SEND_SIGNED":
      case "HACKER_SIGNED":
        return "NETWORK";
      case "FAIL_SAFELY":
      case "OUTCOME":
        return "BOB";
    }
  };

  const docLocation = getDocumentLocation();

  const DocumentComponent = () => (
    <motion.div 
      layoutId="document"
      className={`w-40 bg-white rounded-xl shadow-2xl p-4 flex flex-col items-center justify-center relative border-b-8 ${hasSignature && !signatureBroken ? 'border-amber-500' : hasSignature && signatureBroken ? 'border-red-500' : 'border-slate-300'}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <FileText className="w-10 h-10 text-slate-400 mb-2" />
      <div className="text-center w-full">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Transfer</div>
        <div className={`text-2xl font-black mt-1 transition-colors ${docAmount === "$9,000" ? "text-red-600" : "text-slate-800"}`}>
          {docAmount}
        </div>
      </div>

      {hasSignature && (
        <div className={`absolute -bottom-4 bg-[#0f172a] px-3 py-1.5 rounded-lg shadow-lg border flex items-center gap-2 ${signatureBroken ? 'border-red-500 text-red-500' : 'border-amber-500/50 text-amber-500'}`}>
          <Fingerprint size={14} className={signatureBroken ? "animate-pulse" : ""} />
          <span className="text-[10px] font-mono font-black tracking-widest">
            {signatureBroken ? "SIG:INVALID" : "SIG:8F92A"}
          </span>
        </div>
      )}
    </motion.div>
  );

  return (
    <LabShell
      navExtra={
        phase !== "OUTCOME" ? (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm backdrop-blur-md transition-colors font-mono ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 60 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white/10 border-white/20 text-white"
          }`}>
            <Timer size={16} strokeWidth={2.5} className={secondsLeft <= 60 && !timedOut ? "animate-spin" : ""} />
            <span>{timedOut ? "0:00" : formattedTime}</span>
          </div>
        ) : null
      }
      labId="digitalsignatures9"
      bgOverride="bg-indigo-950"
      title="Digital Signatures"
      instruction={getInstruction()}
      hint="Without a signature, anyone can modify your file. A digital signature locks the data mathematically."
      compact
      onReset={() => {
        setPhase("LEARN");
        setDocAmount("$100");
        setHasSignature(false);
        setSignatureBroken(false);
        setTimedOut(false);
        setSecondsLeft(TIMER_DURATION_SECONDS);
        clearTimers();
      }}
    >
      {phase === "OUTCOME" && <Celebration isActive={true} />}

      <div className="w-full flex flex-col flex-1 min-h-0 pt-6 md:pt-10 px-6 pb-6 relative z-10 items-center overflow-hidden">
        
        {/* TOP TOOLBAR */}
        <div className="w-full max-w-5xl shrink-0 flex flex-col md:flex-row items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl px-8 py-5 relative z-50 gap-6">
          <div className="flex-1 w-full text-center md:text-left">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center justify-center md:justify-start gap-2 drop-shadow-md">
              <ArrowRight size={14} strokeWidth={3} /> Mission Objective
            </h3>
            <p className="text-base font-bold text-white leading-snug drop-shadow-sm">
              {getInstruction()}
            </p>
          </div>
          
          <div className="shrink-0 flex items-center justify-center min-w-[240px]">
            {phase === "LEARN" && (
                <button onClick={handleSendUnsigned} className="w-full px-6 py-4 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-sm uppercase tracking-widest border border-white/20">
                  <Send size={20} strokeWidth={2.5} /> Send Unsigned
                </button>
            )}
            {phase === "UNDERSTAND" && (
                <button onClick={handleReset} className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border border-white/20 animate-pulse">
                  Reset to Alice
                </button>
            )}
            {phase === "IMPROVE" && (
                <button onClick={handleSign} className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-white font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border-t border-white/40 animate-pulse">
                  <FileSignature size={20} strokeWidth={2.5} /> Sign with Private Key
                </button>
            )}
            {phase === "READY_SIGNED" && (
                <button onClick={handleSendSigned} className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-slate-950 font-black rounded-2xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.6)] flex items-center justify-center gap-3 text-sm uppercase tracking-widest border border-white/40 animate-pulse">
                  <Send size={20} strokeWidth={2.5} /> Send Signed
                </button>
            )}
            {(phase === "SEND_UNSIGNED" || phase === "HACKER_UNSIGNED" || phase === "SEND_SIGNED" || phase === "HACKER_SIGNED" || phase === "FAIL_SAFELY") && (
                <div className="px-6 py-4 bg-slate-800/50 text-slate-400 font-black rounded-2xl border border-slate-700/50 flex items-center justify-center gap-3 text-sm uppercase tracking-widest">
                  Processing...
                </div>
            )}
          </div>
        </div>

        {/* MAIN 3-ZONE AREA */}
        <div className="w-full max-w-5xl relative z-20 flex-1 min-h-[350px] max-h-[500px] flex flex-col md:flex-row gap-4 mt-6 md:mt-8">
          
          {/* ZONE 1: ALICE (SENDER) */}
          <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative p-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest text-center mb-8 border-b border-slate-800 pb-4">Alice (Sender)</h4>
            
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {docLocation === "ALICE" && <DocumentComponent />}
              
              {/* Alice's Private Key */}
              <div className="absolute bottom-4 right-4 flex flex-col items-center opacity-80">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/50 rounded-full flex items-center justify-center text-amber-500 mb-2">
                  <Key size={20} />
                </div>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center leading-tight">Private<br/>Key</span>
              </div>
            </div>
          </div>

          {/* ZONE 2: THE NETWORK (DANGER) */}
          <div className="flex-1 bg-indigo-950/30 border border-indigo-900/50 rounded-3xl overflow-hidden flex flex-col shadow-inner relative p-6">
            <h4 className="text-sm font-black text-indigo-400/50 uppercase tracking-widest text-center mb-8 border-b border-indigo-900/30 pb-4">The Internet</h4>
            
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {docLocation === "NETWORK" && <DocumentComponent />}
              
              <AnimatePresence>
                {(phase === "HACKER_UNSIGNED" || phase === "HACKER_SIGNED") && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30"
                  >
                    <div className="bg-red-950/80 backdrop-blur-md border-2 border-red-500 p-4 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center text-center">
                      <AlertTriangle className="w-12 h-12 text-red-500 mb-2 animate-ping" />
                      <div className="text-red-500 font-black tracking-widest uppercase">Hacker Intercept</div>
                      <div className="text-xs text-red-400 font-bold mt-1">Tampering with Bank Transfer...</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ZONE 3: BOB (RECEIVER) */}
          <div className="flex-1 bg-[#0f172a] border border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative p-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest text-center mb-8 border-b border-slate-800 pb-4">Bob (Receiver)</h4>
            
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {docLocation === "BOB" && <DocumentComponent />}

              {/* Bob's Public Key Verification */}
              <div className="absolute bottom-4 left-4 flex flex-col items-center opacity-80">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                  <Lock size={20} />
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center leading-tight">Alice's<br/>Public Key</span>
              </div>

              {/* Verification Outcome Overlays */}
              <AnimatePresence>
                {phase === "FAIL_SAFELY" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                    <div className="bg-red-950 border border-red-500 text-red-500 font-black px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 uppercase tracking-widest">
                      <ShieldAlert size={20} /> Bank Drained
                    </div>
                  </motion.div>
                )}
                {phase === "OUTCOME" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                    <div className="bg-emerald-950 border border-emerald-500 text-emerald-500 font-black px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 uppercase tracking-widest">
                      <ShieldCheck size={20} /> Forgery Rejected
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
