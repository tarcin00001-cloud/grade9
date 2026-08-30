"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldAlert, Cpu, Pickaxe, AlertTriangle, FileDigit, Link, Link2Off, Database, Lock, Fingerprint, CheckCircle2, Wallet, XOctagon, ArrowRight, MousePointer2, ShieldCheck } from "lucide-react";

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
          playError(); // Changed to error because stealing isn't success
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
          }, 800);
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
          case "trad_pristine": return { title: "Traditional Database", desc: "A database record can be changed if an attacker gains sufficient access.", color: "text-[#123B5D]" };
          case "trad_hacked": return { title: "Attempt Withdrawal", desc: "The altered record is accepted. Test what happens when Eve attempts to withdraw.", color: "text-[#123B5D]" };
          case "trad_cashed_out": return { title: "Fraudulent withdrawal accepted", desc: "The money is gone. Traditional systems are vulnerable. Let's upgrade to a Cryptographic Blockchain.", color: "text-[#E5485D]" };
          case "bc_pristine": return { title: "Blockchain Introduced", desc: "The blocks are now locked with hashes. Try to execute the exact same hack again!", color: "text-[#123B5D]" };
          case "bc_hacked_2": return { title: "Altered Blockchain", desc: "Block 02 was altered. Try submitting the transaction.", color: "text-[#123B5D]" };
          case "bc_hacked_2_rejected": return { title: "Network Rejected", desc: "Block 02 invalid.", color: "text-[#DC3545]" };
          case "bc_mining_2": return { title: "Proof of Work", desc: "Searching for a nonce that produces a valid hash...", color: "text-[#F59E0B]" };
          case "bc_hacked_3": return { title: "Attempt Withdrawal Again", desc: "Block 02 has a valid hash now! Try submitting the transaction again.", color: "text-[#123B5D]" };
          case "bc_hacked_3_rejected": return { title: "Cascading Failure", desc: "Block 03 is now invalid because Block 02’s hash changed.", color: "text-[#DC3545]" };
          case "bc_mining_3": return { title: "Proof of Work", desc: "Searching for a nonce that produces a valid hash...", color: "text-[#F59E0B]" };
          case "bc_restored": return { title: "Tampering Detected", desc: "The chain rejected inconsistent blocks.", color: "text-[#10A875]" };
          case "assessing": return { title: "Knowledge Check", desc: "The network rejected your fraudulent chain! Verify your understanding.", color: "text-[#123B5D]" };
          case "completed": return { title: "Lab Complete", desc: "You demonstrated how cryptographic hashing and network consensus secure the blockchain!", color: "text-[#10A875]" };
      }
  }

  const Pipe = ({ isBroken }: { isBroken: boolean }) => (
      <div className="w-12 h-12 lg:w-16 lg:h-4 relative flex items-center justify-center shrink-0">
          <div className={`block lg:hidden absolute w-0 h-full border-l-[3px] ${isBroken ? 'border-dashed border-[#DC3545]' : 'border-[#2563EB]'}`} />
          <div className={`hidden lg:block absolute w-full h-0 border-t-[3px] ${isBroken ? 'border-dashed border-[#DC3545]' : 'border-[#2563EB]'}`} />
          
          {isBroken ? (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#EDF5FF] p-1 rounded-full z-10 text-[#DC3545]">
                  <Link2Off size={16} />
              </div>
          ) : (
              <>
                  <motion.div 
                      animate={{ left: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="hidden lg:block absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#2563EB] rounded-full z-10"
                      style={{ left: '0%' }}
                  />
                  <motion.div 
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="block lg:hidden absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2563EB] rounded-full z-10"
                      style={{ top: '0%' }}
                  />
              </>
          )}
      </div>
  );

  const mText = getMissionText();
  
  // Logic for what step is active
  let currentStep = 1;
  if (chainState === 'trad_hacked' || chainState === 'trad_cashed_out' || chainState === 'bc_hacked_2' || chainState === 'bc_hacked_2_rejected' || chainState === 'bc_hacked_3' || chainState === 'bc_hacked_3_rejected' || chainState === 'bc_restored') currentStep = 2;
  if (isBC) {
      if (chainState === 'bc_pristine') currentStep = 3;
      if (chainState === 'bc_mining_2' || chainState === 'bc_mining_3' || chainState === 'bc_hacked_2_rejected' || chainState === 'bc_hacked_3_rejected' || chainState === 'bc_hacked_3' || chainState === 'bc_restored') currentStep = 3;
  }
  if (chainState === 'assessing' || chainState === 'completed') currentStep = 4;

  const progressSteps = ["Modify record", "Test attack", "Protect with hashes", "Knowledge check"];

  // Logic to hide the footer action button on pages 6 and 8
  const hideFooterAction = chainState === 'bc_hacked_2_rejected' || chainState === 'bc_hacked_3_rejected' || chainState === 'bc_mining_2' || chainState === 'bc_mining_3';
  const showActionFooter = !hideFooterAction && ["trad_hacked", "trad_cashed_out", "bc_hacked_2", "bc_hacked_3", "bc_restored"].includes(chainState);
  
  // Footer Button Label
  let footerBtnLabel = "";
  if (chainState === "trad_hacked" || chainState === "bc_hacked_2" || chainState === "bc_hacked_3") footerBtnLabel = "Cash Out: $999 To Eve";
  if (chainState === "bc_restored") footerBtnLabel = "Verify Transaction";

  return (
    <LabShell 
      labId="blockchain9" 
      theme="circuit" 
      bgOverride="bg-[#F4F8FC]"
      title="Cryptographic Blockchain"
      instruction="A database record can be changed if an attacker gains sufficient access. Test this vulnerability, then upgrade to a Cryptographic Blockchain to see how it protects data."
      hint="Drag the coral red Transaction Data into Block 02. Once the chain breaks, click 'Re-mine Block'."
      onReset={() => { setChainState("trad_pristine"); setIsSubmitted(false); setAssessmentAns(null); }}
    >
      {chainState === "completed" && <Celebration isActive={true} />}
      
      {/* Clean Technology Lab Environment */}
      <div className="flex-1 w-full flex flex-col relative overflow-hidden font-sans bg-[#EDF5FF] lg:rounded-2xl border-t lg:border border-[#94A3B8]/30">
          
          {/* Progress Indicator */}
          <div className="w-full flex items-center justify-center gap-2 pt-4 px-4 overflow-x-auto shrink-0 pb-1">
              {progressSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                      <div className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full whitespace-nowrap ${
                          currentStep === idx + 1 ? 'bg-[#2563EB] text-white shadow-sm' : 
                          currentStep > idx + 1 ? 'bg-[#10A875]/10 text-[#10A875]' : 'bg-[#94A3B8]/10 text-[#94A3B8]'
                      }`}>
                          {idx + 1}. {step}
                      </div>
                      {idx < 3 && <ArrowRight size={12} className="text-[#94A3B8]/50" />}
                  </div>
              ))}
          </div>

          {/* Mission Text - Condensed */}
          <div className="flex flex-col items-center justify-center pt-2 pb-2 z-20 px-4 shrink-0">
              <h2 className={`text-base lg:text-xl font-black tracking-tight text-center ${mText.color}`}>
                  {mText.title}
              </h2>
              <p className="text-[#123B5D] font-medium text-xs lg:text-sm mt-0.5 max-w-xl text-center">
                  {mText.desc}
              </p>
          </div>

          {/* Main Vault Rail */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full px-2 relative z-10 gap-y-2 lg:gap-y-0 pb-4">
              
              {[1, 2, 3].map((index) => {
                  const vData = getVaultData(index);
                  const nextData = index < 3 ? getVaultData(index + 1) : null;
                  const pipeBroken = nextData ? vData.output !== nextData.input : false;
                  const isVault2 = index === 2;
                  
                  const isDropZone = isVault2 && (chainState === 'trad_pristine' || chainState === 'bc_pristine');
                  const isEve = vData.ledger.includes("Eve");
                  
                  let ledgerStyle = "";
                  if (isDropZone) {
                      ledgerStyle = "border-dashed border-[#0891B2] bg-white text-[#0891B2]";
                  } else if (isEve) {
                      // Coral Red exclusively for malicious/altered data
                      ledgerStyle = "bg-[#E5485D]/10 border-[#E5485D] text-[#E5485D]";
                  } else {
                      ledgerStyle = "bg-white border-[#94A3B8]/50 text-[#123B5D]";
                  }

                  const blockName = isBC ? `Block 0${index}` : `Database Record 0${index}`;

                  return (
                      <motion.div layout key={index} className="flex flex-col lg:flex-row items-center z-10">
                          
                          {/* Clean White Safe Card */}
                          <motion.div 
                              layout
                              ref={isVault2 ? vault2Ref : null}
                              className={`w-[260px] lg:w-[280px] rounded-2xl flex flex-col p-4 relative transition-all duration-300 border shadow-sm ${
                                  isDropZone 
                                    ? 'bg-[#E8FBFF] border-[#0891B2] ring-1 ring-[#0891B2]' 
                                    : vData.isBroken 
                                        ? 'bg-white border-[#DC3545] ring-1 ring-[#DC3545]/50'
                                        : 'bg-white border-[#94A3B8]/30'
                              }`}
                          >
                              {/* Safe Header */}
                              <div className={`flex items-center justify-between mb-3 border-b pb-2 ${isDropZone ? 'border-[#0891B2]/30' : 'border-[#94A3B8]/30'}`}>
                                  <div className={`font-bold text-xs tracking-widest uppercase flex items-center gap-1.5 ${isDropZone ? 'text-[#0891B2]' : 'text-[#123B5D]'}`}>
                                      <Database size={14} className={isDropZone ? 'text-[#0891B2]' : 'text-[#2563EB]'}/> {blockName}
                                  </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                  {/* Input Lock (Prev Hash) */}
                                  <AnimatePresence>
                                      {isBC && (
                                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                              <div className={`bg-white border rounded-lg p-2.5 flex flex-col gap-0.5 ${vData.isBroken && index === 3 ? 'border-[#DC3545]/50' : 'border-[#94A3B8]/30'}`}>
                                                  <span className={`text-[9px] uppercase tracking-widest flex items-center gap-1 font-bold ${vData.isBroken && index === 3 ? 'text-[#DC3545]' : 'text-[#123B5D]'}`}>
                                                      <Lock size={10}/> Previous Block Hash
                                                  </span>
                                                  <span className={`font-mono text-xs font-semibold ${vData.isBroken && index === 3 ? 'text-[#DC3545]' : 'text-[#123B5D]'}`}>
                                                      {vData.input}
                                                  </span>
                                              </div>
                                          </motion.div>
                                      )}
                                  </AnimatePresence>

                                  {/* Transaction Data */}
                                  <div className={`rounded-lg p-2.5 border flex flex-col gap-0.5 transition-colors ${ledgerStyle}`}>
                                      <span className="text-[9px] uppercase tracking-widest flex items-center gap-1 font-bold opacity-90">
                                          <FileDigit size={10}/> 
                                          Transaction Data
                                      </span>
                                      <span className={`font-mono text-[10px] lg:text-xs font-bold`}>
                                          {vData.ledger}
                                      </span>
                                  </div>

                                  {/* Work Stamp (Nonce) & Output Seal */}
                                  <AnimatePresence>
                                      {isBC && (
                                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-2">
                                              <div className="flex justify-between items-center bg-white border border-[#94A3B8]/30 rounded-lg p-2.5 mt-1">
                                                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#123B5D]">Nonce</span>
                                                  <span className={`font-mono text-xs font-bold ${vData.isMining ? 'text-[#F59E0B] animate-pulse' : 'text-[#123B5D]'}`}>
                                                      {vData.stamp}
                                                  </span>
                                              </div>

                                              <div className={`flex justify-between items-center rounded-lg p-2.5 border ${vData.isBroken ? 'bg-[#DC3545]/10 border-[#DC3545]' : 'bg-[#10A875]/10 border-[#10A875]'}`}>
                                                  <span className={`text-[9px] uppercase tracking-widest flex items-center gap-1 font-bold ${vData.isBroken ? 'text-[#DC3545]' : 'text-[#10A875]'}`}>
                                                      <Fingerprint size={10}/> Block Hash
                                                  </span>
                                                  <span className={`font-mono text-xs font-bold ${vData.isBroken ? 'text-[#DC3545]' : 'text-[#10A875]'}`}>
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
                                      <motion.button initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 12 }} onClick={handleMine2} className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm overflow-hidden uppercase tracking-widest">
                                          <Pickaxe size={14} /> Re-mine Block
                                      </motion.button>
                                  )}
                                  {isBC && vData.isBroken && !vData.isMining && index === 3 && chainState === 'bc_hacked_3_rejected' && (
                                      <motion.button initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 12 }} onClick={handleMine3} className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm overflow-hidden uppercase tracking-widest">
                                          <Pickaxe size={14} /> Re-mine Block
                                      </motion.button>
                                  )}
                                  {isBC && vData.isMining && (
                                      <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 12 }} className="w-full bg-[#F59E0B]/10 border border-[#F59E0B]/50 text-[#F59E0B] font-bold text-[10px] lg:text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 animate-pulse overflow-hidden uppercase tracking-widest">
                                          <Cpu size={14} className="animate-spin" /> Mining...
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </motion.div>

                          {/* Render Pipe ONLY IN BC MODE */}
                          {index < 3 && isBC && <Pipe isBroken={pipeBroken} />}
                      </motion.div>
                  );
              })}
          </div>

          {/* Action Area Footer */}
          <div className="w-full shrink-0 flex justify-center items-end pb-6 min-h-[80px] z-50">
              
              {/* Draggable Payload - Malicious Red */}
              <AnimatePresence mode="wait">
                  {(chainState === "trad_pristine" || chainState === "bc_pristine") && (
                      <motion.div 
                          key="payload"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white border-2 border-[#E5485D]/20 p-2 lg:p-3 rounded-2xl shadow-xl flex flex-col items-center relative"
                      >
                          {/* Drag Cue */}
                          <motion.div 
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute -top-10 text-[#E5485D] flex flex-col items-center drop-shadow-sm"
                          >
                              <span className="text-[10px] font-black tracking-widest uppercase">Drag</span>
                              <MousePointer2 size={16} className="rotate-180" />
                          </motion.div>

                          <div className="flex items-center gap-1.5 mb-2 mt-1">
                              <AlertTriangle className="text-[#E5485D]" size={14} />
                              <span className="text-[9px] lg:text-[10px] uppercase font-bold text-[#E5485D] tracking-widest">Malicious Payload Detected</span>
                          </div>
                          
                          <motion.div
                              drag
                              dragSnapToOrigin
                              onDragEnd={handleDragEnd}
                              whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing' }}
                              style={{ touchAction: "none" }}
                              className="bg-[#E5485D] text-white font-bold text-xs lg:text-sm px-6 py-2.5 rounded-xl cursor-grab active:cursor-grabbing shadow-lg flex items-center gap-2 transition-transform tracking-wide"
                          >
                              <ShieldAlert size={16} /> 
                              Altered Ledger: Alice -{'>'} Eve $999
                          </motion.div>
                      </motion.div>
                  )}

                  {/* Cash Out Button */}
                  {showActionFooter && (
                      <motion.div 
                          key="cashout"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative flex flex-col items-center"
                      >
                          <motion.button
                              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                              transition={{ duration: 0.3 }}
                              onClick={handleAction}
                              className={`text-white font-bold text-sm tracking-widest px-8 py-3.5 rounded-full transition-all flex items-center gap-2 uppercase shadow-lg hover:scale-105 active:scale-95 ${
                                  chainState === "bc_restored" ? 'bg-[#2563EB] hover:bg-[#2563EB]/90' : 'bg-[#E5485D] hover:bg-[#E5485D]/90'
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
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center"
                      >
                          <motion.button
                              onClick={handleUpgrade}
                              className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-sm tracking-widest px-8 py-3.5 rounded-full transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 uppercase"
                          >
                              UPGRADE TO BLOCKCHAIN <ArrowRight size={18} />
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
                      className="absolute inset-0 z-50 flex items-center justify-center bg-[#F4F8FC]/80 backdrop-blur-sm p-4"
                  >
                      <div className="bg-white border border-[#94A3B8]/30 rounded-3xl p-6 lg:p-8 max-w-xl shadow-2xl flex flex-col items-center text-center">
                          <div className="bg-[#10A875]/10 p-4 rounded-full text-[#10A875] mb-4 border border-[#10A875]/30"><ShieldCheck size={32} /></div>
                          <h2 className="text-xl lg:text-2xl font-black text-[#123B5D] mb-2 tracking-widest uppercase">Fraud Prevented!</h2>
                          <p className="text-[#123B5D] font-medium mb-6 text-sm">
                              Knowledge Check: Why did you have to re-mine Block 03 even though you only changed the data in Block 02?
                          </p>
                          
                          <div className="flex flex-col gap-3 w-full text-left">
                              {[
                                  "A) Block 03 is connected to the same Wi-Fi network.",
                                  "B) Block 03's Previous Block Hash is mathematically derived from Block 02's Block Hash.",
                                  "C) The network randomly breaks blocks during a hack."
                              ].map((opt, i) => (
                                  <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                      assessmentAns === i ? 'border-[#0891B2] bg-[#E8FBFF]' : 'border-[#94A3B8]/50 bg-white hover:bg-[#EDF5FF]'
                                  }`}>
                                      <input 
                                          type="radio" 
                                          name="assessment" 
                                          checked={assessmentAns === i} 
                                          onChange={() => setAssessmentAns(i)} 
                                          disabled={isSubmitted} 
                                          className="w-4 h-4 text-[#0891B2]"
                                      />
                                      <span className="text-[#123B5D] text-sm font-medium">{opt}</span>
                                  </label>
                              ))}

                              <AnimatePresence>
                                  {isSubmitted ? (
                                      <motion.div 
                                          initial={{ opacity: 0, height: 0 }} 
                                          animate={{ opacity: 1, height: 'auto' }} 
                                          className="mt-2 text-sm p-4 rounded-xl border bg-[#F4F8FC] border-[#94A3B8]/30"
                                      >
                                          {assessmentAns === 1 ? (
                                              <div>
                                                  <span className="font-black text-[#10A875] uppercase flex items-center gap-1"><CheckCircle2 size={16}/> Correct!</span> 
                                                  <span className="text-[#123B5D] block mt-1">Changing an earlier block changes its hash, breaks the links to later blocks and makes tampering detectable. An attacker would need to recompute later blocks and overcome the network’s validation process.</span>
                                              </div>
                                          ) : (
                                              <div>
                                                  <span className="font-black text-[#DC3545] uppercase flex items-center gap-1"><XOctagon size={16}/> Incorrect</span> 
                                                  <span className="text-[#123B5D] block mt-1">Changing an earlier block changes its hash, breaks the links to later blocks and makes tampering detectable. An attacker would need to recompute later blocks and overcome the network’s validation process.</span>
                                              </div>
                                          )}
                                          
                                          {assessmentAns === 1 && (
                                              <button 
                                                  onClick={() => { setChainState('completed'); setTimeout(reportComplete, 1500); }} 
                                                  className="mt-4 w-full bg-[#10A875] hover:bg-[#10A875]/90 text-white font-bold py-2 rounded-lg"
                                              >
                                                  Complete Lab
                                              </button>
                                          )}
                                      </motion.div>
                                  ) : (
                                      <button 
                                          onClick={handleAssessmentSubmit} 
                                          disabled={assessmentAns === null} 
                                          className={`mt-2 w-full font-bold py-3 rounded-lg transition-colors ${
                                              assessmentAns !== null ? 'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow-md' : 'bg-[#94A3B8]/20 text-[#94A3B8] cursor-not-allowed'
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
