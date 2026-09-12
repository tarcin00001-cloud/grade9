"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldCheck, ShieldAlert, Key, Unlock, Lock, ArrowRight, Server, Search, FileCode2, CheckCircle2, XCircle, Timer, Award } from "lucide-react";

type Stage = 
  | "1_INSPECT"
  | "2_AUTH_NORMAL"
  | "3_TAMPER_FAIL"
  | "4_UNDERSTAND"
  | "5_REVEAL_SECRET"
  | "6_RESIGN_AND_HACK"
  | "7_COMPLETE";

type Phase = "IDLE" | "SCANNING" | "VALIDATED" | "REJECTED";

const TIMER_DURATION_SECONDS = 5 * 60;
const SERVER_SECRET = "super_secret_123";

const SIG_STUDENT = "vF9_8mXzP2qL_tNkY5wJ1R4x_student";
const SIG_ADMIN = "hQ4_1pMzL8xK_vBcT9nR2wY7z_admin";

export default function JwtTokens9() {
  const { reportComplete: _reportComplete } = useLMSBridge("jwttokens9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLabComplete, setIsLabComplete] = useState(false);

  const [stage, setStage] = useState<Stage>("1_INSPECT");
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSigned, setIsSigned] = useState(true);
  const [secretInput, setSecretInput] = useState("");
  const [currentSignature, setCurrentSignature] = useState(SIG_STUDENT);

  const reportComplete = useCallback(() => {
    if (!isLabComplete) {
      setIsLabComplete(true);
      _reportComplete({ points: 100 });
    }
  }, [isLabComplete, _reportComplete]);

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
  }, [timedOut, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const payloadObj = { sub: "alice@school.com", role: isAdmin ? "admin" : "student", admin: isAdmin };
  const payloadB64 = btoa(JSON.stringify(payloadObj)).replace(/=/g, "");
  const isTampered = isAdmin && !isSigned;

  const toggleAdmin = () => {
    playPop();
    const newAdminState = !isAdmin;
    setIsAdmin(newAdminState);
    if (newAdminState === true) {
      setIsSigned(false); 
      if (stage === "2_AUTH_NORMAL") setStage("3_TAMPER_FAIL");
    } else {
      setIsSigned(true);
      setCurrentSignature(SIG_STUDENT);
      if (stage === "3_TAMPER_FAIL") setStage("2_AUTH_NORMAL");
    }
  };

  const handleSendToken = () => {
    if (phase !== "IDLE") return;
    setPhase("SCANNING");
    playZap();

    setTimeout(() => {
      if (!isSigned) {
        setPhase("REJECTED");
        playError();
      } else {
        setPhase("VALIDATED");
        playSuccess();
      }
    }, 1500);
  };

  const handleResign = () => {
    if (secretInput === SERVER_SECRET) {
      playSuccess();
      setIsSigned(true);
      setCurrentSignature(SIG_ADMIN);
      setStage("6_RESIGN_AND_HACK");
    } else {
      playError();
    }
  };

  return (
    <LabShell
      labId="jwttokens9"
      theme="ocean"
      title="JSON Web Tokens (JWT)"
      instruction="A JWT is a digital ID card. It has 3 parts: Header, Payload, and Signature. The Payload is publicly readable (Base64), not encrypted! The Signature is a cryptographic seal protecting it. Can you find a way to forge Admin access?"
      compact
      navExtra={
        !isLabComplete && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 30 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-slate-200 text-slate-700"
          }`}>
            <Timer size={14} strokeWidth={2.5} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      }
    >
      <Celebration isActive={stage === "7_COMPLETE" && isLabComplete} message="Access Granted! You successfully bypassed the security mechanism by acquiring the server's private key to re-sign your forged token." />

      <div className="w-full flex flex-col lg:flex-row flex-1 min-h-0 gap-4 p-1 bg-slate-50/95 backdrop-blur-3xl rounded-3xl">
        
        {/* --- LEFT PANEL: JWT BUILDER / ID CARD --- */}
        <div className="lg:w-[420px] bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col shrink-0 overflow-hidden relative min-h-0">
          
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                    <FileCode2 size={14}/>
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Digital ID (JWT)</span>
                </div>
                {isAdmin ? (
                  <span className="text-[10px] font-bold bg-rose-100 border border-rose-200 text-rose-600 px-2.5 py-0.5 rounded-full uppercase shadow-sm">Forged</span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-100 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full uppercase shadow-sm">Authentic</span>
                )}
             </div>
          </div>

          <div className="p-2 flex-1 flex flex-col gap-1.5 overflow-y-auto min-h-0">
             
             {/* Header */}
             <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shrink-0 shadow-inner">
                <div className="px-3 py-1 bg-slate-800 border-b border-slate-700 text-[10px] font-black text-rose-400 uppercase tracking-widest">1. Header (Format)</div>
                <div className="px-3 py-1 font-mono text-[11px] text-slate-300">
                   {`{ `}
                   <span className="text-cyan-400">"alg"</span><span className="text-slate-500">: </span><span className="text-emerald-400">"HS256"</span>
                   <span className="text-slate-500">, </span>
                   <span className="text-cyan-400">"typ"</span><span className="text-slate-500">: </span><span className="text-emerald-400">"JWT"</span>
                   {` }`}
                </div>
             </div>

             {/* Payload */}
             <div className={`rounded-xl border overflow-hidden transition-all duration-300 shrink-0 ${isAdmin ? 'bg-slate-900 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-800 shadow-inner'}`}>
                <div className={`px-3 py-1 border-b text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-colors ${isAdmin ? 'bg-indigo-900/50 border-indigo-800 text-indigo-400' : 'bg-slate-800 border-slate-700 text-indigo-400'}`}>
                  <span>2. Payload (Data)</span>
                  <span className="opacity-60 text-[9px]">(Editable)</span>
                </div>
                <div className={`px-3 py-1 font-mono text-[11px] transition-colors text-slate-300`}>
                   <div>{`{`}</div>
                   <div className="pl-4 pb-0.5 flex items-center">
                     <span className="text-cyan-400 opacity-80">"sub"</span><span className="text-slate-500 opacity-80">: </span><span className="text-emerald-400 opacity-80">"alice@school.com"</span><span className="text-slate-500 opacity-80">,</span>
                   </div>
                   
                   <div className="pl-4 pb-0.5 flex items-center gap-2">
                     <div><span className="text-cyan-400">"role"</span><span className="text-slate-500">: </span></div>
                     <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 items-center">
                       <button 
                          disabled={stage === "7_COMPLETE" || phase !== "IDLE"}
                          onClick={() => isAdmin && toggleAdmin()}
                          className={`px-2 py-0.5 rounded-md transition-all ${!isAdmin ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'}`}
                       >
                         "student"
                       </button>
                       <button 
                          disabled={stage === "7_COMPLETE" || phase !== "IDLE"}
                          onClick={() => !isAdmin && toggleAdmin()}
                          className={`px-2 py-0.5 rounded-md transition-all ${isAdmin ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'}`}
                       >
                         "admin"
                       </button>
                     </div>
                     <span className="text-slate-500">,</span>
                   </div>

                   <div className="pl-4 pb-0.5 flex items-center gap-2">
                     <div><span className="text-cyan-400">"admin"</span><span className="text-slate-500">: </span></div>
                     <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 items-center">
                       <button 
                          disabled={stage === "7_COMPLETE" || phase !== "IDLE"}
                          onClick={() => isAdmin && toggleAdmin()}
                          className={`px-2 py-0.5 rounded-md transition-all ${!isAdmin ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'}`}
                       >
                         <span className="text-orange-400">false</span>
                       </button>
                       <button 
                          disabled={stage === "7_COMPLETE" || phase !== "IDLE"}
                          onClick={() => !isAdmin && toggleAdmin()}
                          className={`px-2 py-0.5 rounded-md transition-all ${isAdmin ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'}`}
                       >
                         <span className="text-orange-400">true</span>
                       </button>
                     </div>
                   </div>
                   <div>{`}`}</div>
                </div>
             </div>

             {/* Signature */}
             <div className={`rounded-xl border overflow-hidden transition-all duration-300 shrink-0 ${!isSigned ? 'bg-slate-900 border-slate-800 opacity-60 grayscale' : 'bg-slate-900 border-sky-900 shadow-inner'}`}>
                <div className={`px-3 py-1 border-b text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-colors ${!isSigned ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-sky-900/40 border-sky-800/50 text-sky-400'}`}>
                  <span>3. Signature (Cryptographic Seal)</span>
                  {!isSigned && <ShieldAlert size={12} className="text-rose-500" />}
                </div>
                <div className={`px-3 py-1 font-mono text-[10px] transition-all ${!isSigned ? 'text-slate-600 line-through decoration-rose-500/50' : 'text-sky-300'}`}>
                   <div className="font-bold opacity-60 mb-0.5 text-slate-400">HMAC-SHA256(Header+"."+Payload, SECRET)</div>
                   <div className="break-all leading-tight bg-slate-950 p-1 rounded border border-slate-800/50 shadow-inner text-[11px]">{currentSignature}</div>
                </div>
             </div>

             {/* Secret Injection Panel (Stage 5+) */}
             <AnimatePresence>
               {(stage === "5_REVEAL_SECRET" || stage === "6_RESIGN_AND_HACK" || stage === "7_COMPLETE") && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }} 
                   animate={{ opacity: 1, height: 'auto' }}
                   className="bg-amber-50 rounded-xl border border-amber-200 p-2 overflow-hidden shrink-0 shadow-inner"
                 >
                   <div className="text-[11px] font-black text-amber-800 flex items-center gap-1.5 mb-1"><Key size={12}/> Server Secret Key</div>
                   <p className="text-[10px] text-amber-700/80 font-bold mb-1 leading-tight">You found a leaked secret in a public repo: <code className="bg-amber-100 text-amber-900 px-1 rounded shadow-sm border border-amber-200">super_secret_123</code>. Enter it to re-sign.</p>
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={secretInput} 
                       onChange={e => setSecretInput(e.target.value)}
                       placeholder="Enter secret..."
                       className="flex-1 min-w-0 bg-white border border-amber-300 rounded-md px-2 py-1 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-inner"
                       disabled={isSigned && isAdmin}
                     />
                     {!isSigned ? (
                       <button 
                         onClick={handleResign}
                         className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-md shadow-sm transition-all whitespace-nowrap active:scale-95"
                       >
                         Re-Sign
                       </button>
                     ) : (
                       <div className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-md border border-emerald-200 flex items-center justify-center gap-1 whitespace-nowrap shadow-sm">
                         <CheckCircle2 size={12}/> Signed
                       </div>
                     )}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="p-2 border-t border-slate-100 bg-white shrink-0">
            {(stage === "1_INSPECT" || stage === "2_AUTH_NORMAL" || stage === "3_TAMPER_FAIL" || stage === "6_RESIGN_AND_HACK") && (
              <div className="relative">
                {stage === "6_RESIGN_AND_HACK" && phase === "IDLE" && (
                  <div className="absolute inset-0 bg-sky-400 rounded-xl animate-ping opacity-20"></div>
                )}
                <button 
                  onClick={handleSendToken} 
                  disabled={phase === "SCANNING" || (stage === "2_AUTH_NORMAL" && !isAdmin)}
                  className={`relative w-full py-2 rounded-xl font-bold shadow-[0_3px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 ${
                    isTampered ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_3px_0_rgba(225,29,72,1)]" : "bg-sky-600 hover:bg-sky-500 text-white shadow-[0_3px_0_rgba(2,132,199,1)]"
                  } disabled:opacity-50 disabled:shadow-none disabled:translate-y-1 disabled:cursor-not-allowed`}
                >
                  {phase === "SCANNING" ? <Search size={16} className="animate-spin"/> : <Server size={16}/>}
                  {phase === "SCANNING" ? "Validating with Server..." : stage === "2_AUTH_NORMAL" ? "Awaiting Payload Tampering" : "Send Token to Server"}
                </button>
              </div>
            )}
            {stage === "4_UNDERSTAND" && (
              <button onClick={() => setStage("5_REVEAL_SECRET")} className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold shadow-[0_3px_0_rgba(217,119,6,1)] active:shadow-none active:translate-y-1 transition-all">
                Find a Workaround
              </button>
            )}
            {stage === "5_REVEAL_SECRET" && (
              <button disabled className="w-full py-2 bg-slate-200 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 opacity-80 shadow-inner">
                <Lock size={16}/> Re-sign the token first
              </button>
            )}
            {stage === "7_COMPLETE" && (
              <div className="w-full py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-200 shadow-inner">
                <Award size={18}/> Lab Completed
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT PANEL: SERVER VALIDATION ENGINE --- */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden min-h-0">
           
           <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/80 backdrop-blur-sm shrink-0">
             <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-800/20 border border-slate-700">
                <Server size={18}/>
             </div>
             <div>
               <h3 className="text-sm font-black text-slate-800">Server Validation Engine</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Checkpoint</p>
             </div>
           </div>

           {stage === "7_COMPLETE" ? (
              <div className="flex-1 p-4 md:p-6 flex flex-col justify-center overflow-y-auto min-h-0">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-indigo-100 mx-auto">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-800 text-center mb-4">Final Assessment</h2>
                <p className="text-sm text-slate-600 font-medium text-center mb-8 max-w-md mx-auto">
                  Why is it considered secure for a website to send your user data (like your role or ID) in a readable JWT payload?
                </p>
                <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
                  {[
                    "Because the payload is encrypted using Base64.",
                    "Because the server uses a secret key to sign the token, preventing tampering.",
                    "Because browsers automatically hide JWTs from users."
                  ].map((ans, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuizAnswer(ans);
                        if (i === 1) {
                           playSuccess();
                           reportComplete();
                        } else {
                           playError();
                        }
                      }}
                      className={`relative p-4 rounded-xl text-left text-sm font-bold border-2 transition-all hover:-translate-y-1 hover:shadow-lg ${
                        quizAnswer === ans 
                          ? (i === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-500/20" : "bg-rose-50 border-rose-500 text-rose-700 shadow-md shadow-rose-500/20")
                          : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                          quizAnswer === ans 
                            ? (i === 1 ? "border-emerald-500 bg-emerald-500" : "border-rose-500 bg-rose-500")
                            : "border-slate-300"
                        }`}>
                           {quizAnswer === ans && (
                             i === 1 ? <CheckCircle2 size={10} className="text-white" /> : <XCircle size={10} className="text-white" />
                           )}
                        </div>
                        <span>{ans}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
           ) : (
              <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-y-auto min-h-0">
                
                <AnimatePresence mode="wait">
                  {phase === "IDLE" && stage === "1_INSPECT" && (
                     <motion.div key="1_INSPECT" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center max-w-sm">
                       <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm"><Search size={28} className="text-slate-400" /></div>
                       <h3 className="text-lg font-black text-slate-700 mb-2">Awaiting Token</h3>
                       <p className="text-sm text-slate-500">Send the JWT to the server to see how the security checkpoint validates it.</p>
                     </motion.div>
                  )}
                  {phase === "IDLE" && stage === "2_AUTH_NORMAL" && (
                     <motion.div key="2_AUTH_NORMAL" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center max-w-sm">
                       <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm"><CheckCircle2 size={28} className="text-emerald-500" /></div>
                       <h3 className="text-lg font-black text-slate-700 mb-2">Authenticated: Student</h3>
                       <p className="text-sm text-slate-500 mb-6">The server trusted your token! Now, use the panel to change your payload from "student" to "admin" and try to hack in.</p>
                     </motion.div>
                  )}
                  {phase === "IDLE" && stage === "3_TAMPER_FAIL" && (
                     <motion.div key="3_TAMPER_FAIL" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center max-w-sm">
                       <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm"><XCircle size={28} className="text-rose-500" /></div>
                       <h3 className="text-lg font-black text-slate-700 mb-2">Access Denied</h3>
                       <p className="text-sm text-slate-500 mb-6">The server caught your forgery! The signature was invalid.</p>
                       <button onClick={() => setStage("4_UNDERSTAND")} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-700 transition-all active:scale-95">Understand Why</button>
                     </motion.div>
                  )}
                  {phase === "IDLE" && stage === "4_UNDERSTAND" && (
                     <motion.div key="4_UNDERSTAND" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center max-w-sm">
                       <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left mb-6 shadow-sm">
                         <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2"><div className="w-6 h-6 rounded bg-rose-100 text-rose-500 flex items-center justify-center"><ShieldAlert size={14}/></div> The Broken Seal</h4>
                         <p className="text-sm text-slate-600 mb-3 leading-relaxed">When you edited the Payload to say "admin", the data changed.</p>
                         <p className="text-sm text-slate-600 leading-relaxed">The server re-calculated the signature using the new Payload and its secret key, but the result didn't match the old Signature on your token.</p>
                       </div>
                     </motion.div>
                  )}
                  {phase === "IDLE" && stage === "5_REVEAL_SECRET" && (
                     <motion.div key="5_REVEAL_SECRET" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center max-w-sm">
                       <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm"><Key size={28} className="text-amber-500" /></div>
                       <h3 className="text-lg font-black text-slate-700 mb-2">Acquire the Secret</h3>
                       <p className="text-sm text-slate-500">Look at the left panel. Enter the leaked secret to forge a brand new signature for your admin token.</p>
                     </motion.div>
                  )}
                  {phase === "IDLE" && stage === "6_RESIGN_AND_HACK" && (
                     <motion.div key="6_RESIGN_AND_HACK" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center max-w-sm">
                       <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-4 border border-sky-100 shadow-sm"><ShieldCheck size={28} className="text-sky-500" /></div>
                       <h3 className="text-lg font-black text-slate-700 mb-2">Token Re-Signed!</h3>
                       <p className="text-sm text-slate-500">Your token now has a valid cryptographic seal. Send it to the server and execute the hack.</p>
                     </motion.div>
                  )}
                </AnimatePresence>

                {phase !== "IDLE" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={
                      phase === "REJECTED" ? { opacity: 1, scale: 1, x: [-10, 10, -10, 10, 0] } :
                      phase === "VALIDATED" ? { opacity: 1, scale: [1, 1.05, 1] } :
                      { opacity: 1, scale: 1 }
                    }
                    transition={{ duration: phase === "REJECTED" ? 0.4 : 0.2 }}
                    className={`w-full max-w-md p-6 rounded-3xl border-2 shadow-xl bg-white relative overflow-hidden ${
                      phase === "SCANNING" ? "border-sky-300 shadow-sky-200" :
                      phase === "REJECTED" ? "border-rose-400 shadow-rose-200" :
                      "border-emerald-400 shadow-emerald-200"
                    }`}
                  >
                     {phase === "SCANNING" && (
                        <motion.div 
                          initial={{ top: "-10%" }} 
                          animate={{ top: "110%" }} 
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,1)] z-50"
                        />
                     )}

                     <h3 className={`text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${
                       phase === "SCANNING" ? "text-sky-600" :
                       phase === "REJECTED" ? "text-rose-600" :
                       "text-emerald-600"
                     }`}>
                       {phase === "SCANNING" && <><Search size={16} className="animate-spin"/> Scanning Token...</>}
                       {phase === "REJECTED" && <><ShieldAlert size={16}/> Access Denied</>}
                       {phase === "VALIDATED" && <><Unlock size={16}/> Access Granted</>}
                     </h3>

                     <div className="space-y-4 font-mono text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">1. Extracted Payload:</span>
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all leading-relaxed shadow-inner">{payloadB64}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">2. Expected Signature (Server computed):</span>
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all leading-relaxed text-sky-700 font-bold shadow-inner">{isSigned ? currentSignature : (isAdmin ? SIG_ADMIN : SIG_STUDENT)}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">3. Provided Signature (From Token):</span>
                          <div className={`p-2.5 rounded-lg border break-all leading-relaxed shadow-inner ${phase === "REJECTED" ? "border-rose-300 text-rose-700 font-bold bg-rose-50" : "border-slate-200 bg-slate-50"}`}>{currentSignature}</div>
                        </div>
                     </div>

                     {phase === "VALIDATED" && (
                       <div className="mt-6 pt-4 border-t border-emerald-100">
                         <div className="text-sm font-black text-emerald-700 flex items-center justify-between">
                           <span>{isAdmin ? "Welcome, Administrator." : "Welcome, Student."}</span>
                           {isAdmin && stage === "6_RESIGN_AND_HACK" && (
                             <button onClick={() => {setPhase("IDLE"); setStage("7_COMPLETE"); playSuccess();}} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95">
                               Continue
                             </button>
                           )}
                           {!isAdmin && stage === "1_INSPECT" && (
                             <button onClick={() => {setPhase("IDLE"); setStage("2_AUTH_NORMAL");}} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95">
                               Continue
                             </button>
                           )}
                         </div>
                       </div>
                     )}

                     {phase === "REJECTED" && (
                       <div className="mt-6 pt-4 border-t border-rose-100">
                         <div className="text-sm font-black text-rose-700 flex items-center justify-between">
                           <span>Signature Mismatch!</span>
                           {stage === "3_TAMPER_FAIL" && (
                             <button onClick={() => {setPhase("IDLE");}} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95">
                               Continue
                             </button>
                           )}
                         </div>
                       </div>
                     )}
                  </motion.div>
                )}

              </div>
           )}
        </div>
      </div>
    </LabShell>
  );
}
