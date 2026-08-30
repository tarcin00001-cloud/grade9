"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldAlert, Cpu, Pickaxe, AlertTriangle, FileDigit, Link2Off, Database, Lock, Fingerprint, CheckCircle2, Wallet, XOctagon, ArrowRight, MousePointer2, ShieldCheck, Unlock } from "lucide-react";

type ChainState = 
  | "trad_pristine" | "trad_hacked" | "trad_cashed_out"
  | "bc_pristine" | "bc_hacked_2" | "bc_hacked_2_rejected" 
  | "bc_mining_2" | "bc_hacked_3" | "bc_hacked_3_rejected" 
  | "bc_mining_3" | "bc_restored" | "assessing" | "completed";

export default function Blockchain9() {
  const { playPop, playSuccess, playError, playZap, playHeavyThud, playChime } = useLabAudio();
  const { reportComplete } = useLMSBridge();

  const [chainState, setChainState] = useState<ChainState>("trad_pristine");
  const [scrambleTick, setScrambleTick] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [assessmentAns, setAssessmentAns] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const vault2Ref = useRef<HTMLDivElement>(null);

  const isBC = chainState.startsWith("bc_") || chainState === "assessing" || chainState === "completed";

  useEffect(() => {
      if (chainState === "bc_mining_2" || chainState === "bc_mining_3") {
          const interval = setInterval(() => setScrambleTick(s => s + 1), 50);
          return () => clearInterval(interval);
      }
  }, [chainState]);

  const triggerShake = () => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
  };

  const handleDragEnd = (e: any, info: any) => {
      if (chainState !== "trad_pristine" && chainState !== "bc_pristine") return;
      const { point } = info;
      const v2Rect = vault2Ref.current?.getBoundingClientRect();
      const inV2 = v2Rect && point.x >= v2Rect.left && point.x <= v2Rect.right && point.y >= v2Rect.top && point.y <= v2Rect.bottom;
      
      if (inV2) {
          if (chainState === "trad_pristine") {
              playPop();
              setChainState("trad_hacked");
          } else {
              playZap();
              setChainState("bc_hacked_2");
          }
      } else {
          playPop();
      }
  };

  const handleAction = () => {
      if (chainState === "trad_hacked") {
          playError(); 
          setChainState("trad_cashed_out");
      } else if (chainState === "bc_hacked_2" || chainState === "bc_hacked_2_rejected") {
          playHeavyThud();
          triggerShake();
          setChainState("bc_hacked_2_rejected");
      } else if (chainState === "bc_hacked_3" || chainState === "bc_hacked_3_rejected") {
          playHeavyThud();
          triggerShake();
          setChainState("bc_hacked_3_rejected");
      } else if (chainState === "bc_restored") {
          playHeavyThud();
          triggerShake();
          setTimeout(() => {
              setChainState("assessing");
          }, 2500); // Increased from 800ms to give the student time to see the network rejection
      }
  };

  const handleUpgrade = () => {
      playChime();
      setChainState("bc_pristine");
  };

  const handleMine2 = () => {
      playPop();
      setChainState("bc_mining_2");
      setTimeout(() => {
          playZap(); 
          setChainState("bc_hacked_3");
      }, 2000);
  };

  const handleMine3 = () => {
      playPop();
      setChainState("bc_mining_3");
      setTimeout(() => {
          playSuccess();
          setChainState("bc_restored");
      }, 2000);
  };

  const handleAssessmentSubmit = () => {
      setIsSubmitted(true);
      if (assessmentAns === 1) {
          playSuccess();
      } else {
          playError();
      }
  };

  const getVaultData = (vaultIndex: number) => {
      if (vaultIndex === 1) {
          return { isBroken: false, input: "00000000", ledger: "Origin Record", stamp: 843, output: "000a1b2", isMining: false };
      }
      
      const isHacked = chainState !== "trad_pristine" && chainState !== "bc_pristine";
      const isMining2 = chainState === "bc_mining_2";
      const isMining3 = chainState === "bc_mining_3";
      
      if (vaultIndex === 2) {
          const isRestored = ["bc_hacked_3", "bc_hacked_3_rejected", "bc_mining_3", "bc_restored", "assessing", "completed"].includes(chainState);
          return {
              isBroken: chainState === "bc_hacked_2" || chainState === "bc_hacked_2_rejected",
              input: "000a1b2",
              ledger: isHacked ? "Alice -> Eve $999" : "Alice -> Bob $50",
              stamp: isMining2 ? Math.floor(Math.random() * 9999) : (isRestored ? 4092 : 129),
              output: isMining2 ? `000${Math.random().toString(16).slice(2,6)}` : (isRestored ? "000f8e1" : (isHacked && isBC ? "ERR-x92" : "000c3d4")),
              isMining: isMining2
          };
      }
      
      if (vaultIndex === 3) {
          const isB3Hacked = ["bc_hacked_3", "bc_hacked_3_rejected", "bc_mining_3"].includes(chainState);
          const isRestored = ["bc_restored", "assessing", "completed"].includes(chainState);
          const expectedInput = ["trad_pristine", "trad_hacked", "trad_cashed_out", "bc_pristine", "bc_hacked_2", "bc_hacked_2_rejected", "bc_mining_2"].includes(chainState) ? "000c3d4" : "000f8e1";
          
          return {
              isBroken: isB3Hacked,
              input: expectedInput,
              ledger: "Bob -> Charlie $10",
              stamp: isMining3 ? Math.floor(Math.random() * 9999) : (isRestored ? 8812 : 554),
              output: isMining3 ? `000${Math.random().toString(16).slice(2,6)}` : (isRestored ? "00099z2" : (isB3Hacked ? "ERR-z14" : "000e5f6")),
              isMining: isMining3
          };
      }
      return { isBroken: false, input: "", ledger: "", stamp: 0, output: "", isMining: false };
  }

  const getMissionText = () => {
      switch (chainState) {
          case "trad_pristine": return { title: "Standard Database", desc: "A traditional database can be hacked easily. Drag the fake transaction into Block 02.", color: "text-[#0F172A]" };
          case "trad_hacked": return { title: "Database Compromised", desc: "The record was overwritten. Click 'Submit Transaction' to see if the system accepts it.", color: "text-[#0F172A]" };
          case "trad_cashed_out": return { title: "Fraud Successful", desc: "The server accepted the forged data! Traditional systems are vulnerable. Upgrade to a Blockchain.", color: "text-[#E11D48]" };
          case "bc_pristine": return { title: "Blockchain Initialized", desc: "Data is now sealed in Blocks using Cryptographic Hashes. Try the exact same hack again!", color: "text-[#2563EB]" };
          case "bc_hacked_2": return { title: "Block 02 Breached", desc: "You hacked the data, but look at the Hash! Try submitting the transaction.", color: "text-[#2563EB]" };
          case "bc_hacked_2_rejected": return { title: "System Lockdown", desc: "The hash signature broke! You must 'Mine' to find a new valid hash for Block 02.", color: "text-[#E11D48]" };
          case "bc_mining_2": return { title: "Mining Block 02...", desc: "The computer is rapidly guessing numbers (Nonce) to find a valid hash...", color: "text-[#F59E0B]" };
          case "bc_hacked_3": return { title: "Block 02 Re-Sealed", desc: "You fixed Block 02's hash! Try submitting the transaction now.", color: "text-[#2563EB]" };
          case "bc_hacked_3_rejected": return { title: "Cascading Security Failure", desc: "Block 03 broke because Block 02's hash changed! You have to mine Block 03 now.", color: "text-[#E11D48]" };
          case "bc_mining_3": return { title: "Mining Block 03...", desc: "The computer is rapidly guessing numbers (Nonce) to find a valid hash...", color: "text-[#F59E0B]" };
          case "bc_restored": return { title: "Tampering Detected", desc: "The network caught the inconsistency. The blockchain remains secure.", color: "text-[#10B981]" };
          case "assessing": return { title: "Security Assessment", desc: "The network rejected your fraudulent chain! Verify your understanding.", color: "text-[#0F172A]" };
          case "completed": return { title: "System Secure", desc: "You demonstrated how cryptographic hashing secures the blockchain!", color: "text-[#10B981]" };
      }
  }

  // Laser Tripwire (Light Theme) - Simplified for visual consistency
  const LaserTripwire = ({ isBroken }: { isBroken: boolean }) => (
      <div className="w-10 h-10 lg:w-12 lg:h-4 relative flex items-center justify-center shrink-0">
          {/* Horizontal line for desktop */}
          <div className={`hidden lg:block absolute w-full h-[3px] rounded-full ${isBroken ? 'bg-[#E11D48]' : 'bg-[#3B82F6]'}`} />
          {/* Vertical line for mobile */}
          <div className={`block lg:hidden absolute w-[3px] h-full rounded-full ${isBroken ? 'bg-[#E11D48]' : 'bg-[#3B82F6]'}`} />
          
          {isBroken && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full z-10 text-[#E11D48] border-2 border-[#E11D48] shadow-sm animate-pulse">
                  <Link2Off size={14} />
              </div>
          )}
      </div>
  );

  const mText = getMissionText();
  
  let currentStep = 1;
  if (chainState === 'trad_hacked' || chainState === 'trad_cashed_out' || chainState === 'bc_hacked_2' || chainState === 'bc_hacked_2_rejected' || chainState === 'bc_hacked_3' || chainState === 'bc_hacked_3_rejected' || chainState === 'bc_restored') currentStep = 2;
  if (isBC) {
      if (chainState === 'bc_pristine') currentStep = 3;
      if (chainState === 'bc_mining_2' || chainState === 'bc_mining_3' || chainState === 'bc_hacked_2_rejected' || chainState === 'bc_hacked_3_rejected' || chainState === 'bc_hacked_3' || chainState === 'bc_restored') currentStep = 3;
  }
  if (chainState === 'assessing' || chainState === 'completed') currentStep = 4;

  const progressSteps = ["Step 1: Learn", "Step 2: Attack", "Step 3: Blockchain", "Step 4: Review"];

  const hideFooterAction = chainState === 'bc_hacked_2_rejected' || chainState === 'bc_hacked_3_rejected' || chainState === 'bc_mining_2' || chainState === 'bc_mining_3';
  const showActionFooter = !hideFooterAction && ["trad_hacked", "trad_cashed_out", "bc_hacked_2", "bc_hacked_3", "bc_restored"].includes(chainState);
  
  let footerBtnLabel = "";
  if (chainState === "trad_hacked" || chainState === "bc_hacked_2" || chainState === "bc_hacked_3") footerBtnLabel = "Submit Transaction";
  if (chainState === "bc_restored") footerBtnLabel = "Verify Network";

  return (
    <LabShell 
      labId="blockchain9" 
      bgOverride="bg-[#F8FAFC]"
      title="Blockchain High-Security Vaults"
      instruction="A traditional server is vulnerable to tampering. Test this vulnerability, then upgrade the system to Cryptographic Vaults (Blockchain) to see how cryptographic hashes create an immutable chain."
      hint="Drag the fake transaction into Block 02. Observe the blue connections when the hash is broken."
      onReset={() => { setChainState("trad_pristine"); setIsSubmitted(false); setAssessmentAns(null); }}
    >
      {chainState === "completed" && <Celebration isActive={true} />}
      
      {/* Clean Laboratory Environment */}
      <div className="flex-1 w-full flex flex-col relative overflow-hidden font-sans bg-white lg:rounded-xl border-t lg:border border-slate-200 shadow-sm">
          
          {/* Subtle Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          {/* Progress Indicator */}
          <div className="w-full flex items-center justify-center gap-1.5 pt-3 px-4 shrink-0 z-10 relative">
              {progressSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                      <div className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                          currentStep === idx + 1 ? 'bg-[#2563EB] text-white shadow-sm' : 
                          currentStep > idx + 1 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-slate-100 text-slate-400'
                      }`}>
                          {step}
                      </div>
                      {idx < 3 && <ArrowRight size={10} className="text-slate-300" />}
                  </div>
              ))}
          </div>

          {/* Mission Text */}
          <div className="flex flex-col items-center justify-center pt-2 pb-1 z-20 px-4 shrink-0 relative">
              <h2 className={`text-lg lg:text-xl font-bold tracking-wide text-center ${mText.color}`}>
                  {mText.title}
              </h2>
              <p className="text-slate-600 font-medium text-xs mt-0.5 max-w-xl text-center">
                  {mText.desc}
              </p>
          </div>

          {/* Main Vault Rail */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full px-2 relative z-10 gap-y-2 lg:gap-y-0 py-2 lg:py-4 overflow-y-auto">
              
              {[1, 2, 3].map((index) => {
                  const vData = getVaultData(index);
                  const nextData = index < 3 ? getVaultData(index + 1) : null;
                  
                  // The pipe is broken if the hashes don't match, OR if either connected block is in a lockdown/error state.
                  // This provides a much clearer visual "Cascading Security Failure" for the student.
                  const pipeBroken = nextData ? (vData.output !== nextData.input || vData.isBroken || nextData.isBroken) : false;
                  
                  const isVault2 = index === 2;
                  
                  const isDropZone = isVault2 && (chainState === 'trad_pristine' || chainState === 'bc_pristine');
                  const isEve = vData.ledger.includes("Eve");
                  
                  let ledgerStyle = "";
                  if (isDropZone) {
                      ledgerStyle = "border-dashed border-[#0EA5E9] bg-[#F0F9FF] text-[#0284C7]";
                  } else if (isEve) {
                      ledgerStyle = "bg-[#FFF1F2] border-[#FDA4AF] text-[#E11D48]";
                  } else {
                      ledgerStyle = "bg-white border-slate-200 text-slate-700";
                  }

                  const blockName = isBC ? `Block 0${index}` : `Record 0${index}`;

                  return (
                      <motion.div layout key={index} className="flex flex-col lg:flex-row items-center z-10">
                          
                          {/* Clean White Vault Card - Reduced Size */}
                          <motion.div 
                              layout
                              ref={isVault2 ? vault2Ref : null}
                              className={`w-[240px] lg:w-[250px] rounded-xl flex flex-col p-[2px] relative transition-all duration-300 shadow-sm ${
                                  isDropZone 
                                    ? 'bg-gradient-to-b from-[#38BDF8] to-slate-200 animate-pulse' 
                                    : vData.isBroken 
                                        ? 'bg-gradient-to-b from-[#E11D48] to-[#FDA4AF]'
                                        : 'bg-slate-200'
                              }`}
                          >
                              {/* Inner Container */}
                              <div className="bg-[#F8FAFC] w-full h-full rounded-[10px] p-3 relative overflow-hidden flex flex-col border border-white">
                                  
                                  {/* Vault Header */}
                                  <div className={`flex items-center justify-between mb-2.5 border-b pb-1.5 ${isDropZone ? 'border-[#38BDF8]/30' : 'border-slate-200'}`}>
                                      <div className={`font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5 ${isDropZone ? 'text-[#0284C7]' : 'text-slate-700'}`}>
                                          <Database size={12} className={isDropZone ? 'text-[#0284C7]' : 'text-[#2563EB]'}/> {blockName}
                                      </div>
                                      {isBC && (
                                          <div className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${vData.isBroken ? 'bg-[#FFF1F2] border-[#FDA4AF] text-[#E11D48]' : 'bg-[#ECFDF5] border-[#6EE7B7] text-[#059669]'}`}>
                                              {vData.isBroken ? 'LOCKDOWN' : 'SECURE'}
                                          </div>
                                      )}
                                  </div>

                                  <div className="flex flex-col gap-2">
                                      {/* Input Lock (Prev Hash) */}
                                      <AnimatePresence>
                                          {isBC && (
                                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                  <div className={`bg-white border rounded-lg p-2 flex flex-col gap-0.5 shadow-sm ${vData.isBroken && index === 3 ? 'border-[#FDA4AF] bg-[#FFF1F2]' : 'border-slate-200'}`}>
                                                      <span className={`text-[9px] uppercase tracking-widest flex items-center gap-1 font-bold ${vData.isBroken && index === 3 ? 'text-[#E11D48]' : 'text-slate-500'}`}>
                                                          {vData.isBroken && index === 3 ? <Unlock size={10}/> : <Lock size={10}/>} Previous Hash
                                                      </span>
                                                      <span className={`font-mono text-xs tracking-wider font-bold ${vData.isBroken && index === 3 ? 'text-[#E11D48]' : 'text-slate-700'}`}>
                                                          {vData.input}
                                                      </span>
                                                  </div>
                                              </motion.div>
                                          )}
                                      </AnimatePresence>

                                      {/* Transaction Data Window */}
                                      <div className={`rounded-lg p-2 border flex flex-col gap-0.5 transition-colors relative overflow-hidden ${ledgerStyle}`}>
                                          <span className="text-[9px] uppercase tracking-widest flex items-center gap-1 font-bold opacity-80">
                                              <FileDigit size={10}/> 
                                              Transaction Data
                                          </span>
                                          <span className={`font-mono text-xs font-bold z-10`}>
                                              {vData.ledger}
                                          </span>
                                      </div>

                                      {/* Work Stamp (Nonce) & Output Seal */}
                                      <AnimatePresence>
                                          {isBC && (
                                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-1.5">
                                                  <div className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-2 mt-0.5 shadow-sm">
                                                      <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Nonce (Work)</span>
                                                      <span className={`font-mono text-xs font-bold ${vData.isMining ? 'text-[#F59E0B] animate-pulse' : 'text-slate-700'}`}>
                                                          {vData.stamp}
                                                      </span>
                                                  </div>

                                                  <div className={`flex justify-between items-center rounded-lg p-2 border shadow-sm ${vData.isBroken ? 'bg-[#FFF1F2] border-[#FDA4AF]' : 'bg-[#ECFDF5] border-[#A7F3D0]'}`}>
                                                      <span className={`text-[9px] uppercase tracking-widest flex items-center gap-1 font-bold ${vData.isBroken ? 'text-[#E11D48]' : 'text-[#059669]'}`}>
                                                          <Fingerprint size={10}/> Block Hash
                                                      </span>
                                                      <span className={`font-mono text-xs tracking-wider font-bold ${vData.isBroken ? 'text-[#E11D48]' : 'text-[#059669]'}`}>
                                                          {vData.output}
                                                      </span>
                                                  </div>
                                              </motion.div>
                                          )}
                                      </AnimatePresence>
                                  </div>

                                  {/* Re-mine Action Buttons */}
                                  <AnimatePresence>
                                      {isBC && vData.isBroken && !vData.isMining && index === 2 && chainState === 'bc_hacked_2_rejected' && (
                                          <motion.button initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 8 }} onClick={handleMine2} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[10px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-widest">
                                              <Pickaxe size={12} /> Mine Block
                                          </motion.button>
                                      )}
                                      {isBC && vData.isBroken && !vData.isMining && index === 3 && chainState === 'bc_hacked_3_rejected' && (
                                          <motion.button initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 8 }} onClick={handleMine3} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[10px] py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-widest">
                                              <Pickaxe size={12} /> Mine Block
                                          </motion.button>
                                      )}
                                      {isBC && vData.isMining && (
                                          <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 8 }} className="w-full bg-[#FEF3C7] border border-[#FCD34D] text-[#D97706] font-bold text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-widest shadow-sm">
                                              <Cpu size={12} className="animate-spin" /> Mining...
                                          </motion.div>
                                      )}
                                  </AnimatePresence>
                              </div>
                          </motion.div>

                          {/* Render Laser Tripwire ONLY IN BC MODE */}
                          {index < 3 && isBC && <LaserTripwire isBroken={pipeBroken} />}
                      </motion.div>
                  );
              })}
          </div>

          {/* Action Area Footer */}
          <div className="w-full shrink-0 flex justify-center items-end pb-4 min-h-[80px] z-50">
              
              {/* Draggable Hacker Payload */}
              <AnimatePresence mode="wait">
                  {(chainState === "trad_pristine" || chainState === "bc_pristine") && (
                      <motion.div 
                          key="payload"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white border-2 border-[#E11D48] p-3 lg:p-4 rounded-2xl shadow-xl flex flex-col items-center relative"
                      >
                          {/* Drag Cue */}
                          <motion.div 
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute -top-10 text-[#E11D48] flex flex-col items-center drop-shadow-sm"
                          >
                              <span className="text-[10px] font-black tracking-widest uppercase mb-1">Drag To Alter Data</span>
                              <MousePointer2 size={16} className="rotate-180" />
                          </motion.div>

                          <div className="flex items-center gap-1.5 mb-2 mt-1">
                              <AlertTriangle className="text-[#E11D48]" size={14} />
                              <span className="text-[10px] uppercase font-bold text-[#E11D48] tracking-widest">Fake Transaction</span>
                          </div>
                          
                          <motion.div
                              drag
                              dragSnapToOrigin
                              onDragEnd={handleDragEnd}
                              whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing', filter: 'drop-shadow(0 10px 15px rgba(225,29,72,0.3))' }}
                              style={{ touchAction: "none" }}
                              className="bg-[#E11D48] text-white font-mono font-bold text-xs lg:text-sm px-6 py-3 rounded-xl cursor-grab active:cursor-grabbing shadow-md flex items-center gap-2 tracking-widest"
                          >
                              <ShieldAlert size={16} /> 
                              Alice -{'>'} Eve $999
                          </motion.div>
                      </motion.div>
                  )}

                  {/* Cash Out Button */}
                  {showActionFooter && (
                      <motion.div 
                          key="cashout"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="relative flex flex-col items-center"
                      >
                          <motion.button
                              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                              transition={{ duration: 0.3 }}
                              onClick={handleAction}
                              className={`text-white font-bold text-sm tracking-widest px-8 py-4 rounded-full transition-all flex items-center gap-2 uppercase shadow-lg hover:scale-105 active:scale-95 ${
                                  chainState === "bc_restored" ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-[#E11D48] hover:bg-[#BE123C]'
                              }`}
                          >
                              <Wallet size={18} /> 
                              {footerBtnLabel}
                          </motion.button>
                      </motion.div>
                  )}

                  {/* Upgrade Button */}
                  {chainState === "trad_cashed_out" && (
                      <motion.div 
                          key="upgrade"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center"
                      >
                          <motion.button
                              onClick={handleUpgrade}
                              className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-sm tracking-widest px-8 py-4 rounded-full transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 uppercase"
                          >
                              <ShieldCheck size={18} /> Upgrade to Blockchain
                          </motion.button>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>

          {/* Final Assessment Modal */}
          <AnimatePresence>
              {chainState === "assessing" && (
                  <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 lg:p-6"
                  >
                      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 lg:p-5 max-w-lg w-full shadow-2xl flex flex-col items-center text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="bg-[#ECFDF5] p-1.5 rounded-full text-[#10B981] shrink-0"><ShieldCheck size={20} /></div>
                              <h2 className="text-lg font-black text-slate-800 tracking-tight shrink-0">Fraud Prevented!</h2>
                          </div>
                          
                          <p className="text-slate-600 font-medium mb-3 text-[11px] lg:text-xs shrink-0 px-2">
                              Knowledge Check: Why did you have to re-mine Block 03 even though you only changed the data in Block 02?
                          </p>
                          
                          <div className="flex flex-col gap-2 w-full text-left shrink-0">
                              {[
                                  "A) Block 03 is connected to the same Wi-Fi network.",
                                  "B) Block 03's Previous Hash combination is mathematically derived from Block 02's Block Hash.",
                                  "C) The network randomly breaks blocks during a security breach."
                              ].map((opt, i) => {
                                  if (isSubmitted && assessmentAns !== i) return null; // Hide unselected options to save vertical space
                                  return (
                                      <label key={i} className={`flex items-start gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${
                                          assessmentAns === i ? 'border-[#38BDF8] bg-[#F0F9FF]' : 'border-slate-200 bg-white hover:bg-slate-50'
                                      }`}>
                                          <input 
                                              type="radio" 
                                              name="assessment" 
                                              checked={assessmentAns === i} 
                                              onChange={() => setAssessmentAns(i)} 
                                              disabled={isSubmitted} 
                                              className="w-3.5 h-3.5 mt-0.5 text-[#0284C7] shrink-0"
                                          />
                                          <span className={`text-xs font-medium leading-relaxed ${assessmentAns === i ? 'text-[#0284C7]' : 'text-slate-700'}`}>{opt}</span>
                                      </label>
                                  );
                              })}

                              <AnimatePresence>
                                  {isSubmitted ? (
                                      <motion.div 
                                          initial={{ opacity: 0, height: 0 }} 
                                          animate={{ opacity: 1, height: 'auto' }} 
                                          className="mt-1 text-xs p-3 rounded-xl border bg-slate-50 border-slate-200 shrink-0"
                                      >
                                          {assessmentAns === 1 ? (
                                              <div>
                                                  <span className="font-black text-[#10B981] uppercase flex items-center gap-1.5 tracking-widest"><CheckCircle2 size={14}/> Correct!</span> 
                                                  <span className="text-slate-600 block mt-1 leading-snug">Changing an earlier block changes its hash seal, immediately breaking the mathematical locks of all later blocks. An attacker would need to recalculate every subsequent block before the network notices!</span>
                                              </div>
                                          ) : (
                                              <div>
                                                  <span className="font-black text-[#E11D48] uppercase flex items-center gap-1.5 tracking-widest"><XOctagon size={14}/> Incorrect</span> 
                                                  <span className="text-slate-600 block mt-1 leading-snug">Changing an earlier block changes its hash seal, immediately breaking the mathematical locks of all later blocks. An attacker would need to recalculate every subsequent block before the network notices!</span>
                                              </div>
                                          )}
                                          
                                          {assessmentAns === 1 && (
                                              <button 
                                                  onClick={() => { setChainState('completed'); setTimeout(reportComplete, 4500); }} 
                                                  className="mt-3 w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 rounded-xl uppercase tracking-widest shadow-sm transition-colors"
                                              >
                                                  Complete Lab
                                              </button>
                                          )}
                                      </motion.div>
                                  ) : (
                                      <button 
                                          onClick={handleAssessmentSubmit} 
                                          disabled={assessmentAns === null} 
                                          className={`mt-1 w-full font-bold py-2.5 rounded-xl transition-colors uppercase tracking-widest shrink-0 text-xs ${
                                              assessmentAns !== null ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                      }`}>
                                          Submit Answer
                                      </button>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>

      </div>
    </LabShell>
  );
}
