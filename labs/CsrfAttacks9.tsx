"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, animate } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Settings, User, ShieldAlert, AlertTriangle, CheckCircle, Database, XCircle, Receipt, Radar } from "lucide-react";

type RequestSource = "HOME" | "TRICKSTER";
type ProtectionMode = "ID_ONLY" | "GEAR_LOCK";
type SameSitePolicy = "NONE" | "LAX";
type RadarMode = "OFF" | "ON";
type VaultStatus = "IDLE" | "SUCCESS" | "COMPROMISED" | "BLOCKED";

export default function CsrfAttacks9() {
  const { reportComplete } = useLMSBridge("csrfattacks9");
  const { playPop, playZap, playError, playSuccess, playClick } = useLabAudio();

  const vaultRef = useRef<HTMLDivElement>(null);
  const gearControls = useAnimation();

  const balance = useMotionValue(10000);
  const [displayBalance, setDisplayBalance] = useState("10,000");
  
  useEffect(() => {
      return balance.onChange((v) => {
          setDisplayBalance(Math.round(v).toLocaleString());
      });
  }, [balance]);

  const [mode, setMode] = useState<ProtectionMode>("ID_ONLY");
  const [sameSitePolicy, setSameSitePolicy] = useState<SameSitePolicy>("NONE");
  const [originRadar, setOriginRadar] = useState<RadarMode>("OFF");
  
  const [activeCapsule, setActiveCapsule] = useState<{ id: number, source: RequestSource } | null>(null);
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>("IDLE");
  const [hasWon, setHasWon] = useState(false);
  const [feedback, setFeedback] = useState("AWAITING LAUNCH...");
  
  // Independent Sandbox Missions!
  // 0: Launch Bank, 1: Scam (ID Stamped), 2: Deploy Token, 3: Scam (Token Blocked), 
  // 4: Set Lax, 5: Scam (Withheld), 6: Deploy Radar, 7: Scam (Radar Zapped)
  const [missions, setMissions] = useState<boolean[]>(Array(8).fill(false));

  const completeMission = (index: number) => {
      setMissions(prev => {
          if (prev[index]) return prev;
          const next = [...prev];
          next[index] = true;
          if (next.every(m => m) && !hasWon) {
              setTimeout(() => setHasWon(true), 2500);
              setTimeout(reportComplete, 3500);
          }
          return next;
      });
  };

  const launchCapsule = (source: RequestSource) => {
      if (activeCapsule || vaultStatus !== "IDLE") return;
      playPop();
      setActiveCapsule({ id: Date.now(), source });
      setFeedback("DISPATCHING CAPSULE...");
  };

  const onCapsuleArrival = (source: RequestSource) => {
      setActiveCapsule(null);
      
      const hasID = source === "HOME" || sameSitePolicy === "NONE";
      const hasGear = source === "HOME" && mode === "GEAR_LOCK";
      const radarBlocked = source === "TRICKSTER" && originRadar === "ON";

      if (radarBlocked) {
          setVaultStatus("BLOCKED");
          setFeedback("BLOCKED! FOREIGN ORIGIN REJECTED.");
          playZap();
          completeMission(7);
      }
      else if (!hasID) {
          setVaultStatus("BLOCKED");
          setFeedback("BLOCKED! BROWSER WITHHELD ID.");
          playZap();
          if (source === "TRICKSTER") completeMission(5);
      }
      else if (mode === "ID_ONLY") {
          if (source === "HOME") {
              setVaultStatus("SUCCESS");
              setFeedback("DELIVERY ACCEPTED. ID VERIFIED.");
              completeMission(0);
              playSuccess();
          } else {
              setVaultStatus("COMPROMISED");
              setFeedback("BREACH! SCAM SITE USED YOUR ID!");
              animate(balance, 0, { duration: 1.5, ease: "easeOut" });
              completeMission(1);
              playError();
          }
      } 
      else {
          if (source === "HOME") {
              setVaultStatus("SUCCESS");
              setFeedback("GEAR MATCHED. VAULT OPENED.");
              completeMission(0);
              playSuccess();
          } else {
              setVaultStatus("BLOCKED");
              setFeedback("MISSING GEAR! ACCESS DENIED.");
              playZap();
              completeMission(3);
          }
      }
      
      setTimeout(() => {
          if (source === "TRICKSTER" && mode === "ID_ONLY" && sameSitePolicy === "NONE" && originRadar === "OFF") {
              setVaultStatus("IDLE");
              setFeedback("INSURANCE REPLENISHING FUNDS...");
              animate(balance, 10000, { duration: 1.5, ease: "easeInOut" });
              setTimeout(() => {
                  if (!hasWon) setFeedback("AWAITING LAUNCH...");
              }, 1500);
          } else {
              setVaultStatus("IDLE");
              if (!hasWon) setFeedback("AWAITING LAUNCH...");
          }
      }, 4000);
  };

  const handleGearDragEnd = (e: any, info: any) => {
      if (!vaultRef.current) return;
      const vaultRect = vaultRef.current.getBoundingClientRect();
      const dropX = info.point.x;
      const dropY = info.point.y;
      
      if (dropX >= vaultRect.left && dropX <= vaultRect.right && dropY >= vaultRect.top && dropY <= vaultRect.bottom) {
          setMode("GEAR_LOCK");
          setFeedback("ANTI-CSRF TOKEN DEPLOYED.");
          completeMission(2);
          playSuccess();
      } else {
          gearControls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
      }
  };

  const reset = () => {
      setMode("ID_ONLY");
      setSameSitePolicy("NONE");
      setOriginRadar("OFF");
      setActiveCapsule(null);
      setVaultStatus("IDLE");
      setHasWon(false);
      setMissions(Array(8).fill(false));
      setFeedback("SYSTEM RESET. AWAITING LAUNCH.");
      balance.set(10000);
      gearControls.set({ x: 0, y: 0 });
      playZap();
  };

  return (
    <LabShell 
      labId="csrfattacks9" 
      title="Cross-Site Request Forgery (CSRF)"
      instruction="Follow the Sandbox Missions to learn how to defend the Vault using Anti-CSRF Tokens, SameSite Cookies, and Origin Validation." 
      compact 
      bgOverride="bg-gradient-to-b from-slate-50 via-sky-100 to-blue-200" 
      onReset={reset}
    >
      <Celebration isActive={hasWon} message="CSRF Defeated! You secured the vault using Anti-CSRF Tokens, SameSite Cookies, and Origin Radar Validation!" onReplay={reset} />

      <div className="flex flex-col w-full h-full min-h-0 relative bg-transparent font-sans overflow-hidden">
        
        {/* ─── WORLD CANVAS ─── */}
        <div className="flex-1 min-h-0 relative w-full overflow-hidden flex flex-col justify-end items-center pb-0">
            
            {/* Jumbotron Mission Board */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[440px] bg-slate-800 border-[4px] border-t-0 border-slate-600 rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center p-2 z-40">
                <div className="w-full bg-slate-900 p-2 rounded-lg shadow-[inset_0_2px_15px_rgba(0,0,0,1)] border border-slate-700">
                    <div className="text-cyan-400 font-black text-[10px] uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5 drop-shadow-[0_0_8px_currentColor]">
                       <CheckCircle size={16} /> Sandbox Missions
                    </div>
                    
                    <div className="flex flex-wrap justify-start items-center gap-x-4 gap-y-1.5 font-mono text-[11px] text-slate-300 w-full">
                       {[
                           "1. Launch from Bank", "2. Scam Site (ID Stamped)",
                           "3. Deploy Anti-CSRF Token", "4. Scam Site (Token Blocked)",
                           "5. Set SameSite=Lax", "6. Scam Site (Cookie Withheld)",
                           "7. Enable Origin Radar", "8. Scam Site (Radar Zapped)"
                       ].map((text, i) => (
                           <div key={i} className={`flex items-center gap-2 transition-colors ${missions[i] ? "text-emerald-500" : "text-white"}`}>
                               <div className={`w-3 h-3 shrink-0 border-2 rounded-sm flex items-center justify-center ${missions[i] ? "bg-emerald-500 border-emerald-500" : "border-zinc-500"}`}>
                                   {missions[i] && <CheckCircle size={10} className="text-slate-900" />}
                               </div>
                               {text}
                           </div>
                       ))}
                    </div>
                </div>
            </div>

            {/* Bank Website */}
            <div className="absolute left-[15%] top-[8%] flex flex-col items-center z-20 -translate-x-1/2">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ y: 20 }}
                    onClick={() => launchCapsule("HOME")}
                    className="w-20 h-12 bg-rose-600 rounded-t-2xl border-4 border-rose-800 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)] z-10 flex items-center justify-center cursor-pointer disabled:opacity-50"
                    disabled={activeCapsule !== null || vaultStatus !== "IDLE"}
                >
                    <span className="text-rose-100 font-black text-[10px] uppercase tracking-widest drop-shadow-md">Launch</span>
                </motion.button>
                <div className="w-8 h-8 bg-zinc-400 border-x-4 border-zinc-600 -mt-2 z-0 shadow-inner" />
                
                <div className="w-[180px] h-[120px] bg-gradient-to-b from-emerald-600 to-emerald-800 border-[8px] border-emerald-950 rounded-t-[90px] rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start overflow-hidden relative">
                    <div className="absolute top-2 w-[80%] h-[30%] bg-white/10 rounded-t-full pointer-events-none" />
                    <AnimatePresence>
                        {mode === "GEAR_LOCK" && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-4 top-10 w-10 h-10 bg-amber-400 rounded-full border-4 border-amber-600 shadow-lg flex items-center justify-center z-30"
                            >
                                <Settings size={18} className="text-amber-800 animate-spin-slow" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="mt-10 flex flex-col items-center justify-center relative z-10">
                        <ShieldAlert size={28} className="text-emerald-300 drop-shadow-md mb-1" />
                        <span className="text-emerald-50 font-black tracking-widest uppercase text-xs drop-shadow-md text-center leading-none mt-1">Bank<br/>Website</span>
                    </div>
                </div>
            </div>

            {/* Scam Website */}
            <div className="absolute left-[85%] top-[8%] flex flex-col items-center z-20 -translate-x-1/2">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ y: 20 }}
                    onClick={() => launchCapsule("TRICKSTER")}
                    className="w-20 h-12 bg-rose-600 rounded-t-2xl border-4 border-rose-800 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)] z-10 flex items-center justify-center cursor-pointer disabled:opacity-50"
                    disabled={activeCapsule !== null || vaultStatus !== "IDLE"}
                >
                    <span className="text-rose-100 font-black text-[10px] uppercase tracking-widest drop-shadow-md">Launch</span>
                </motion.button>
                <div className="w-8 h-8 bg-zinc-400 border-x-4 border-zinc-600 -mt-2 z-0 shadow-inner" />
                <div className="w-[180px] h-[120px] bg-gradient-to-b from-rose-600 to-rose-800 border-[8px] border-rose-950 rounded-t-[90px] rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start overflow-hidden relative">
                    <div className="absolute top-2 w-[80%] h-[30%] bg-white/10 rounded-t-full pointer-events-none" />
                    <div className="mt-10 flex flex-col items-center justify-center relative z-10">
                        <AlertTriangle size={28} className="text-rose-300 drop-shadow-md mb-1" />
                        <span className="text-rose-50 font-black tracking-widest uppercase text-xs drop-shadow-md text-center leading-none mt-1">Scam<br/>Website</span>
                    </div>
                </div>
            </div>

            {/* --- VOLUMETRIC PNEUMATIC TUBES --- */}
            <div className="absolute left-[15%] w-[64px] top-[15%] h-[50%] bg-gradient-to-r from-white/10 via-white/40 to-white/10 border-x-4 border-white/50 backdrop-blur-md -translate-x-1/2 z-0 shadow-lg" />
            <div className="absolute left-[15%] right-[50%] top-[65%] h-[64px] bg-gradient-to-b from-white/40 via-white/10 to-white/40 border-y-4 border-white/50 backdrop-blur-md -translate-y-1/2 z-0 shadow-lg" />
            
            <div className="absolute left-[85%] w-[64px] top-[15%] h-[50%] bg-gradient-to-r from-white/10 via-white/40 to-white/10 border-x-4 border-white/50 backdrop-blur-md -translate-x-1/2 z-0 shadow-lg" />
            <div className="absolute left-[50%] right-[15%] top-[65%] h-[64px] bg-gradient-to-b from-white/40 via-white/10 to-white/40 border-y-4 border-white/50 backdrop-blur-md -translate-y-1/2 z-0 shadow-lg" />

            {/* --- TUBE AUTO-STAMPERS --- */}
            <div className="absolute left-[15%] top-[65%] w-[80px] h-[80px] bg-gradient-to-br from-zinc-400 to-zinc-600 border-4 border-zinc-300 rounded-full shadow-2xl -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                <div className="absolute -top-12 flex flex-col items-center">
                   <div className="w-8 h-10 bg-zinc-800 border-x-4 border-zinc-950" />
                   <motion.div 
                       animate={activeCapsule?.source === "HOME" ? { y: [0, 0, 30, 0, 0] } : { y: 0 }}
                       transition={{ duration: 2.5, times: [0, 0.4, 0.5, 0.6, 1] }}
                       className="w-16 h-10 bg-gradient-to-b from-emerald-500 to-emerald-700 border-4 border-emerald-900 rounded-b-xl flex flex-col items-center justify-center shadow-lg z-30"
                   >
                       <span className="text-[7px] font-black text-emerald-100 leading-tight text-center">AUTO<br/>ATTACH</span>
                   </motion.div>
                </div>
            </div>

            <div className="absolute left-[85%] top-[65%] w-[80px] h-[80px] bg-gradient-to-br from-zinc-400 to-zinc-600 border-4 border-zinc-300 rounded-full shadow-2xl -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                <div className="absolute -top-12 flex flex-col items-center relative">
                   <div className="w-8 h-10 bg-zinc-800 border-x-4 border-zinc-950" />
                   <motion.div 
                       animate={activeCapsule?.source === "TRICKSTER" && sameSitePolicy === "NONE" ? { y: [0, 0, 30, 0, 0] } : { y: 0 }}
                       transition={{ duration: 2.5, times: [0, 0.4, 0.5, 0.6, 1] }}
                       className="w-16 h-10 bg-gradient-to-b from-emerald-500 to-emerald-700 border-4 border-emerald-900 rounded-b-xl flex flex-col items-center justify-center shadow-lg z-30"
                   >
                       <span className="text-[7px] font-black text-emerald-100 leading-tight text-center">AUTO<br/>ATTACH</span>
                   </motion.div>
                   {activeCapsule?.source === "TRICKSTER" && sameSitePolicy === "LAX" && (
                       <motion.div 
                           initial={{ opacity: 0, scale: 0 }}
                           animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.8] }}
                           transition={{ duration: 2, delay: 0.8 }}
                           className="absolute -bottom-6 z-40 bg-rose-500 text-white font-black text-[12px] px-3 py-1 rounded-full border-2 border-rose-300 drop-shadow-[0_0_15px_#f43f5e] whitespace-nowrap flex items-center gap-1"
                       >
                           <XCircle size={12} className="text-white" /> POLICY: WITHHELD
                       </motion.div>
                   )}
                </div>
            </div>

            {/* --- BANK VAULT --- */}
            <div className="relative w-[50%] max-w-[500px] min-w-[380px] flex-1 mt-[110px] bg-gradient-to-b from-slate-300 to-slate-500 border-x-[16px] border-t-[16px] border-slate-600 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center z-20 overflow-hidden">
                
                {/* RADAR DISH */}
                <AnimatePresence>
                    {originRadar === "ON" && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="absolute top-0 w-16 h-12 flex flex-col items-center justify-end z-10"
                        >
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="w-12 h-6 border-b-[4px] border-emerald-500 rounded-b-full drop-shadow-[0_0_8px_#10b981] flex items-center justify-center"
                            >
                                <Radar size={12} className="text-emerald-600" />
                            </motion.div>
                            <div className="w-2 h-6 bg-slate-800 border-x-2 border-slate-900" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-[120px] h-[24px] bg-gradient-to-b from-slate-700 to-slate-900 border-x-[6px] border-b-[6px] border-slate-800 rounded-b-xl shadow-inner -mt-[8px] flex justify-center items-end pb-1 z-10 relative">
                    <div className="w-16 h-3 bg-slate-950 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,1)] flex items-center justify-center">
                       <Database size={8} className="text-slate-600" />
                    </div>
                </div>

                <div className="w-full bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 text-slate-200 text-center py-0.5 mt-1 font-black tracking-widest text-[10px] uppercase shadow-md border-y-2 border-slate-900 z-30 shrink-0">
                    Bank Server API
                </div>

                <div className="mt-2 w-[70%] bg-slate-900 rounded-xl border-[4px] border-slate-700 shadow-inner flex flex-col items-center py-1 relative overflow-hidden z-30 shrink-0">
                    <span className="text-slate-400 font-black text-[11px] uppercase tracking-widest">Account Balance</span>
                    <div className="font-mono text-2xl font-black tracking-widest flex items-center">
                        <span className={vaultStatus === "COMPROMISED" ? "text-rose-500" : "text-emerald-500"}>$</span>
                        <motion.span className={vaultStatus === "COMPROMISED" ? "text-rose-500 drop-shadow-[0_0_10px_#f43f5e]" : "text-emerald-400 drop-shadow-[0_0_10px_#34d399]"}>
                            {displayBalance}
                        </motion.span>
                    </div>
                </div>

                <div className="mt-2 w-[85%] h-10 shrink-0 bg-slate-950 rounded-lg border-4 border-slate-700 shadow-inner flex items-center justify-center relative overflow-hidden z-30">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none" />
                    <span className={`font-mono text-[10px] uppercase font-black tracking-widest z-10 drop-shadow-[0_0_8px_currentColor] ${
                        vaultStatus === "COMPROMISED" ? "text-rose-500" :
                        vaultStatus === "SUCCESS" ? "text-emerald-500" :
                        vaultStatus === "BLOCKED" ? "text-amber-500" : "text-cyan-500"
                    }`}>
                        {feedback}
                    </span>
                </div>

                <div className="flex gap-6 mt-2 p-3 bg-slate-800 rounded-2xl border-[4px] border-slate-600 shadow-[inset_0_10px_30px_rgba(0,0,0,0.9)] z-0 relative shrink-0">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)] pointer-events-none rounded-xl" />
                    
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-300 rounded-xl border-4 border-emerald-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-2 right-2 w-4 h-3 bg-amber-400 rounded-sm border border-amber-600 opacity-80" />
                        <User size={28} className="text-emerald-800 drop-shadow-sm mb-1" />
                        <span className="text-[11px] font-black uppercase text-emerald-950 leading-tight text-center relative z-10">ID Badge<br/>Scanner</span>
                    </div>

                    <div ref={vaultRef} className={`w-20 h-20 rounded-xl border-[4px] shadow-inner flex flex-col items-center justify-center transition-all ${
                        mode === "GEAR_LOCK" 
                            ? "bg-gradient-to-br from-amber-300 to-amber-500 border-amber-600 shadow-[0_0_40px_rgba(251,191,36,0.6)]" 
                            : "bg-slate-900 border-slate-700 shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)]"
                    }`}>
                        {mode === "GEAR_LOCK" ? (
                            <>
                                <Settings size={28} className="text-amber-900 animate-spin-slow drop-shadow-sm mb-1" />
                                <span className="text-[12px] font-black uppercase text-amber-950 leading-tight text-center">Anti-CSRF<br/>Token</span>
                            </>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-950 border-[3px] border-slate-700 shadow-inner flex items-center justify-center">
                                <div className="w-4 h-4 bg-slate-800 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,1)]" />
                            </div>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {vaultStatus === "COMPROMISED" && (
                        <motion.div 
                            initial={{ y: "150%", rotate: -5 }}
                            animate={{ y: "0%", rotate: -2 }}
                            exit={{ y: "150%", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
                            className="absolute bottom-2 w-[70%] bg-white border-4 border-rose-500 shadow-2xl flex flex-col p-4 z-40 transform-gpu"
                            style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 20px, #fecdd3 20px, #fecdd3 21px)" }}
                        >
                            <div className="absolute top-0 left-0 right-0 border-t-[6px] border-dashed border-rose-200" />
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Receipt size={14} className="text-rose-600" />
                                <span className="text-rose-600 font-black text-xs uppercase text-center">Funds Drained!</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-rose-200 pb-1 mb-1">
                                <span className="text-slate-500 font-mono text-[11px] font-bold">DESTINATION:</span>
                                <span className="text-slate-900 font-mono text-[11px] font-black">SCAMMER_ACCNT</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-rose-200 pb-1 mb-1">
                                <span className="text-slate-500 font-mono text-[11px] font-bold">AMOUNT:</span>
                                <span className="text-rose-600 font-mono text-[12px] font-black">-$10,000.00</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-slate-500 font-mono text-[7px] font-bold">AUTHORIZATION:</span>
                                <span className="text-emerald-600 font-mono text-[7px] font-black">VALID ID BADGE</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Blast Doors - using h-[55%] to leave UI exposed */}
                <motion.div 
                    initial={false}
                    animate={{
                        y: vaultStatus === "COMPROMISED" || vaultStatus === "SUCCESS" ? "100%" : vaultStatus === "BLOCKED" ? "0%" : "80%",
                        backgroundColor: vaultStatus === "SUCCESS" ? "#10b981" : vaultStatus === "COMPROMISED" ? "#ef4444" : vaultStatus === "BLOCKED" ? "#f59e0b" : "#334155"
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute inset-x-0 bottom-0 h-[50%] border-t-[8px] border-slate-900 flex items-start justify-center pt-2 rounded-t-xl z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
                    style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0, rgba(0,0,0,0.2) 20px, transparent 20px, transparent 40px)" }}
                >
                     <div className="w-1/3 h-4 bg-slate-950/50 rounded-full shadow-inner" />
                </motion.div>
            </div>

            {/* Flying Capsule Animation */}
            <AnimatePresence>
                {activeCapsule && (
                    <motion.div
                        key={activeCapsule.id}
                        initial={{ 
                            left: activeCapsule.source === "HOME" ? "15%" : "85%", 
                            top: "15%", 
                            x: "-50%", y: "-50%", 
                            scale: 1
                        }}
                        animate={{
                            left: [
                                activeCapsule.source === "HOME" ? "15%" : "85%", 
                                activeCapsule.source === "HOME" ? "15%" : "85%", 
                                activeCapsule.source === "HOME" ? "15%" : "85%", 
                                "50%"
                            ],
                            top: ["15%", "65%", "65%", "65%"],
                            scale: [1, 1, 1, 0.2]
                        }}
                        transition={{ duration: 2.5, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
                        onAnimationComplete={() => onCapsuleArrival(activeCapsule.source)}
                        className="absolute w-[80px] h-[50px] bg-gradient-to-b from-slate-100 to-slate-300 rounded-full border-[6px] border-slate-400 shadow-[0_0_40px_rgba(255,255,255,1)] flex items-center justify-between px-1.5 z-20 overflow-hidden"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={(activeCapsule.source === "HOME" || sameSitePolicy === "NONE") ? { opacity: [0, 0, 1, 1], scale: [0, 0, 1, 1] } : { opacity: 0 }}
                            transition={{ duration: 2.5, times: [0, 0.45, 0.5, 1] }}
                            className="w-[20px] h-[30px] bg-emerald-500 rounded-sm shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] border border-emerald-300 flex items-center justify-center"
                        >
                           <User size={14} className="text-white" />
                        </motion.div>
                        
                        <div className={`w-[26px] h-[26px] rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center ${activeCapsule.source === "HOME" && mode === "GEAR_LOCK" ? "bg-amber-200 border-2 border-amber-400" : "bg-slate-700"}`}>
                            {activeCapsule.source === "HOME" && mode === "GEAR_LOCK" && (
                                <Settings size={20} className="text-amber-600 animate-spin-slow" />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Laser Zap Animation */}
            <AnimatePresence>
                {activeCapsule && originRadar === "ON" && activeCapsule.source === "TRICKSTER" && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
                        transition={{ duration: 0.5, delay: 2.4 }}
                        style={{ transformOrigin: "bottom" }}
                        className="absolute left-1/2 top-1/2 w-2 h-32 bg-emerald-400 shadow-[0_0_20px_#10b981] z-50 -translate-x-1/2 -translate-y-1/2"
                    />
                )}
            </AnimatePresence>
        </div>

        {/* ─── SECURITY TOOLBOX DECK ─── */}
        <div className="flex-none h-[120px] w-full bg-gradient-to-b from-slate-800 to-slate-900 border-t-[16px] border-slate-700 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center gap-12 relative z-50 overflow-hidden">
            
            <div className={`bg-slate-950 px-6 py-3 rounded-2xl border-4 border-slate-900 shadow-[inset_0_5px_20px_rgba(0,0,0,1)] flex flex-col items-center gap-2`}>
                <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest text-center">Browser Policy</span>
                <div 
                    className={`flex bg-slate-900 rounded-full border-2 border-slate-800 p-1 relative w-[160px] cursor-pointer`} 
                    onClick={() => {
                        playClick();
                        const next = sameSitePolicy === "NONE" ? "LAX" : "NONE";
                        setSameSitePolicy(next);
                        if (next === "LAX") completeMission(4);
                    }}
                >
                    <motion.div 
                        className="absolute top-1 bottom-1 w-[74px] bg-cyan-600 rounded-full shadow-md z-0" 
                        animate={{ left: sameSitePolicy === "NONE" ? "4px" : "80px" }} 
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                    <div className={`w-1/2 text-center py-1 text-[10px] font-black z-10 transition-colors ${sameSitePolicy === "NONE" ? "text-white" : "text-slate-500"}`}>NONE</div>
                    <div className={`w-1/2 text-center py-1 text-[10px] font-black z-10 transition-colors ${sameSitePolicy === "LAX" ? "text-white" : "text-slate-500"}`}>LAX</div>
                </div>
            </div>

            <div className="bg-slate-950 px-8 py-2 rounded-2xl border-4 border-slate-900 shadow-[inset_0_5px_20px_rgba(0,0,0,1)] flex flex-col items-center gap-2">
                <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest text-center">Server Security Defenses</span>
                
                <div className="flex items-center gap-8">
                    {/* GEAR LOCK */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-slate-600 font-black text-[11px] uppercase tracking-widest">Anti-CSRF Token</span>
                        <div className="h-12 w-12 flex items-center justify-center relative">
                             <AnimatePresence>
                                 {mode === "ID_ONLY" ? (
                                     <motion.div
                                         key="gear"
                                         drag
                                         dragMomentum={false}
                                         onDragEnd={handleGearDragEnd}
                                         animate={gearControls}
                                         whileDrag={{ scale: 1.2, cursor: "grabbing", zIndex: 100 }}
                                         className="absolute w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 border-[4px] border-amber-300 rounded-full cursor-grab active:cursor-grabbing flex flex-col items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                                     >
                                         <div className="absolute inset-0 border-[4px] border-dashed border-amber-700/30 rounded-full" />
                                         <Settings size={20} className="text-amber-900 drop-shadow-sm z-10" />
                                     </motion.div>
                                 ) : (
                                     <motion.div
                                         key="installed"
                                         initial={{ scale: 0, opacity: 0 }}
                                         animate={{ scale: 1, opacity: 1 }}
                                         className="text-amber-500 font-black text-[10px] text-center uppercase tracking-widest flex flex-col items-center"
                                     >
                                         <Settings size={20} className="mb-1" /> Deployed
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                        </div>
                    </div>
                    
                    {/* ORIGIN RADAR */}
                    <div className="flex flex-col items-center gap-2 mt-1">
                        <span className="text-slate-600 font-black text-[11px] uppercase tracking-widest">Origin Radar</span>
                        <div 
                           className="w-16 h-8 bg-slate-950 rounded-full border-2 border-slate-800 relative cursor-pointer shadow-inner"
                           onClick={() => {
                               playClick();
                               const next = originRadar === "OFF" ? "ON" : "OFF";
                               setOriginRadar(next);
                               if (next === "ON") completeMission(6);
                           }}
                        >
                           <motion.div 
                               className={`absolute top-1 bottom-1 w-6 rounded-full shadow-md flex items-center justify-center ${originRadar === "ON" ? "bg-emerald-500 drop-shadow-[0_0_10px_#10b981]" : "bg-slate-700"}`}
                               animate={{ left: originRadar === "OFF" ? "4px" : "36px" }}
                           >
                               {originRadar === "ON" && <Radar size={12} className="text-emerald-950" />}
                           </motion.div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
      </div>
    </LabShell>
  );
}
