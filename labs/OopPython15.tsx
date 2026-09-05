"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Code2, Ghost, Shield, Wand2, Swords, Skull, Terminal, PlayCircle, CheckCircle2, MessageSquare, Zap, AlertTriangle
} from "lucide-react";

export default function OopPython15() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();
  const { reportComplete } = useLMSBridge("ooppython15");

  const [stage, setStage] = useState(0);
  const [shakeTask, setShakeTask] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Task 1: Inheritance
  const [parents, setParents] = useState({ mage: "", warrior: "", boss: "" });
  // Task 2: Constructors
  const [supers, setSupers] = useState({ mage: "", warrior: "" });
  // Task 3: Magic Methods
  const [dunders, setDunders] = useState({ stringRep: "", comboAtk: "" });

  const [isAttacking, setIsAttacking] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [labFinished, setLabFinished] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [shakeBlueprint, setShakeBlueprint] = useState(false);

  const t1Done = parents.mage === "Character" && parents.warrior === "Character" && parents.boss === "Monster";
  const t2Done = supers.mage === "super()" && supers.warrior === "super()";
  const t3Done = dunders.stringRep === "__str__" && dunders.comboAtk === "__add__";



  const handleParentSelect = (key: "mage"|"warrior"|"boss", val: string) => {
    setParents(p => ({ ...p, [key]: val }));
    setErrorMsg("");
    if (playClick) playClick();
  };

  const handleSuperSelect = (key: "mage"|"warrior", val: string) => {
    setSupers(s => ({ ...s, [key]: val }));
    setErrorMsg("");
    if (playClick) playClick();
  };

  const handleDunderSelect = (key: "stringRep"|"comboAtk", val: string) => {
    setDunders(d => ({ ...d, [key]: val }));
    setErrorMsg("");
    if (playClick) playClick();
  };

  const submitTask1 = () => {
    if (t1Done) {
      if (playSuccess) playSuccess();
      setStage(1);
    } else {
      if (playError) playError();
      setShakeTask(1);
      setTimeout(() => setShakeTask(0), 500);
      setErrorMsg("Check your routing. Heroes inherit from Character, Boss inherits from Monster.");
    }
  };

  const submitTask2 = () => {
    if (supers.mage === "super()" && supers.warrior === "super()") {
      if (playSuccess) playSuccess();
      setStage(2);
    } else {
      if (playError) playError();
      setShakeTask(2);
      setTimeout(() => setShakeTask(0), 500);
      setErrorMsg("Use super() to route the arguments up to the Base Class constructor.");
    }
  };

  const submitTask3 = () => {
    if (dunders.stringRep === "__str__" && dunders.comboAtk === "__add__") {
      if (playSuccess) playSuccess();
      setStage(3);
    } else {
      if (playError) playError();
      setShakeTask(3);
      setTimeout(() => setShakeTask(0), 500);
      setErrorMsg("Python uses __str__ for string output and __add__ for the '+' operator.");
    }
  };

  const executeComboAttack = async () => {
    if (playZap) playZap();
    setIsAttacking(true);
    
    // Time for laser to travel
    await new Promise(r => setTimeout(r, 600)); 
    if (playPop) playPop();
    setShakeBlueprint(true);
    setShowDamage(true);
    setBossHp(0);
    
    // Wait for damage pop and bar drain
    await new Promise(r => setTimeout(r, 800)); 
    setBossDefeated(true);
    setShakeBlueprint(false);
    
    // Short pause before showing final screen
    await new Promise(r => setTimeout(r, 800)); 
    if (playSuccess) playSuccess();
    setStage(4);
    setLabFinished(true);
    reportComplete();
  };

  const resetLab = () => {
    setStage(0);
    setParents({ mage: "", warrior: "", boss: "" });
    setSupers({ mage: "", warrior: "" });
    setDunders({ stringRep: "", comboAtk: "" });
    setBossHp(100);
    setIsAttacking(false);
    setShowDamage(false);
    setBossDefeated(false);
    setShakeBlueprint(false);
    setLabFinished(false);
    setErrorMsg("");
    if (playPop) playPop();
  };

  // Helper to color SVG paths based on correctness
  const getPathColor = (actual: string, expected: string) => {
    if (!actual) return "#cbd5e1"; // slate-300
    return actual === expected ? "#10b981" : "#ef4444"; // emerald-500 : red-500
  };

  return (
    <LabShell
      labId="ooppython15"
      title="OOP in Python"
      theme="ocean"
      compact={true}
      onReset={resetLab}
      instruction="Build an RPG Engine using Python OOP. Connect the Base Classes, wire up the Constructors, and bind the Magic Methods."
    >
      <Celebration isActive={labFinished} onReplay={resetLab} message="Architecture Complete! You mastered Python OOP." />

      <div className="flex flex-col md:flex-row h-full w-full max-w-6xl mx-auto gap-4 p-2">
        
        {/* Left Panel: Visual Game Engine Blueprint */}
        <motion.div 
          animate={shakeBlueprint ? { x: [-10, 10, -10, 10, -5, 5, 0], y: [-5, 5, -5, 5, -2, 2, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex-[1.2] bg-slate-950 rounded-[2rem] p-4 sm:p-6 shadow-[inset_0_0_60px_rgba(30,58,138,0.4)] border-4 border-blue-600 flex flex-col relative select-none min-h-[400px]"
        >
          
          {/* Background Layers (clipped) */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[1.75rem] pointer-events-none">
            {/* Pac-Man Pellet Grid Pattern */}
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fde047 2.5px, transparent 2.5px)', backgroundSize: '28px 28px' }}></div>
            <div className="absolute inset-3 border-2 border-blue-900/40 rounded-3xl"></div>
          </div>

          <div className="flex items-center gap-2 mb-2 shrink-0 relative z-30">
            <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)] border border-blue-500">
              <Terminal size={14} />
            </div>
            <h2 className="text-xs font-black text-yellow-400 tracking-widest uppercase drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">Engine Blueprint</h2>
          </div>

          <div className="flex-1 relative w-full h-full mt-2">
            
            {/* SVG Lines Layer */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.2))" }}>
              
              {/* Mage to Character Line */}
              <path d="M 16.6 80 L 25 20" stroke={getPathColor(parents.mage, "Character")} strokeWidth="1" strokeLinecap="round" strokeDasharray={parents.mage === "Character" ? "none" : "2 3"} fill="none" />
              {supers.mage === "super()" && (
                <circle r="1.5" fill="#10b981" filter="drop-shadow(0 0 2px #10b981)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path="M 16.6 80 L 25 20" />
                </circle>
              )}

              {/* Warrior to Character Line */}
              <path d="M 50 80 L 25 20" stroke={getPathColor(parents.warrior, "Character")} strokeWidth="1" strokeLinecap="round" strokeDasharray={parents.warrior === "Character" ? "none" : "2 3"} fill="none" />
              {supers.warrior === "super()" && (
                <circle r="1.5" fill="#10b981" filter="drop-shadow(0 0 2px #10b981)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path="M 50 80 L 25 20" />
                </circle>
              )}

              {/* Boss to Monster Line */}
              <path d="M 83.3 80 L 75 20" stroke={getPathColor(parents.boss, "Monster")} strokeWidth="1" strokeLinecap="round" strokeDasharray={parents.boss === "Monster" ? "none" : "2 3"} fill="none" />

              {/* Combo Attack Laser */}
              {isAttacking && !bossDefeated && (
                <>
                  {/* Mage Beam */}
                  <path d="M 16.6 80 L 83.3 80" stroke="#d946ef" strokeWidth="1.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #d946ef)">
                    <animate attributeName="stroke-opacity" values="1;0.2;1" dur="0.1s" repeatCount="indefinite" />
                    <animate attributeName="stroke-dasharray" values="0,100; 100,0" dur="0.2s" fill="freeze" />
                  </path>
                  {/* Warrior Beam */}
                  <path d="M 50 80 L 83.3 80" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" filter="drop-shadow(0 0 5px #0ea5e9)">
                    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="0.15s" repeatCount="indefinite" />
                    <animate attributeName="stroke-dasharray" values="0,100; 100,0" dur="0.3s" fill="freeze" />
                  </path>
                  {/* Core Energy Beam */}
                  <path d="M 50 80 L 83.3 80" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" filter="drop-shadow(0 0 2px #ffffff)">
                    <animate attributeName="stroke-opacity" values="1;0.5;1" dur="0.05s" repeatCount="indefinite" />
                  </path>
                </>
              )}
            </svg>

            {/* Nodes Layer (Flex Grid) */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between py-6">
              
              {/* Top Row: Base Classes */}
              <div className="flex w-full h-32">
                <div className="flex-1 flex justify-center items-center">
                  <div className="relative bg-gradient-to-b from-indigo-500 to-indigo-700 p-4 rounded-2xl flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] w-36 border-b-[6px] border-indigo-950 ring-1 ring-indigo-400">
                    <div className="absolute inset-x-2 top-1 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl pointer-events-none" />
                    <Shield size={32} className="text-white mb-2 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    <div className="text-[10px] font-black text-white uppercase tracking-widest text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Base: Character</div>
                  </div>
                </div>
                <div className="flex-1 flex justify-center items-center">
                  <div className="relative bg-gradient-to-b from-rose-500 to-rose-700 p-4 rounded-2xl flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] w-36 border-b-[6px] border-rose-950 ring-1 ring-rose-400">
                    <div className="absolute inset-x-2 top-1 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl pointer-events-none" />
                    <Ghost size={32} className="text-white mb-2 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    <div className="text-[10px] font-black text-white uppercase tracking-widest text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Base: Monster</div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Child Classes */}
              <div className="flex w-full h-32 mt-auto">
                
                {/* Mage */}
                <div className="flex-1 flex justify-center items-center relative">
                  <div className="flex flex-col items-center">
                    {dunders.stringRep === "__str__" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-10 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-1 z-30 border-2 border-slate-900 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                        <MessageSquare size={12} className="text-yellow-400" /> "Hero: Mage"
                      </motion.div>
                    )}
                    <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 relative z-20 ${parents.mage === "Character" ? 'bg-fuchsia-500 border-4 border-fuchsia-300 shadow-[0_0_25px_rgba(217,70,239,0.8),inset_0_4px_10px_rgba(255,255,255,0.5)] translate-y-[2px]' : 'bg-slate-700 border-4 border-slate-500 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.2)]'}`}>
                      <Wand2 size={32} className={parents.mage === "Character" ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" : "text-blue-300"} />
                    </div>
                    <div className={`mt-4 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${parents.mage === "Character" ? "text-white bg-fuchsia-600 border-2 border-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.8)]" : "text-blue-200 bg-slate-800 border-2 border-slate-600"}`}>Mage</div>
                  </div>
                </div>

                {/* Warrior */}
                <div className="flex-1 flex justify-center items-center relative">
                  <div className="flex flex-col items-center">
                    {dunders.comboAtk === "__add__" && (
                      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-10 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-1 border-2 border-yellow-600 z-30 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
                        <Zap size={12} /> COMBO READY
                      </motion.div>
                    )}
                    <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 relative z-20 ${parents.warrior === "Character" ? 'bg-sky-500 border-4 border-sky-300 shadow-[0_0_25px_rgba(14,165,233,0.8),inset_0_4px_10px_rgba(255,255,255,0.5)] translate-y-[2px]' : 'bg-slate-700 border-4 border-slate-500 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.2)]'}`}>
                      <Swords size={32} className={parents.warrior === "Character" ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" : "text-blue-300"} />
                    </div>
                    <div className={`mt-4 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${parents.warrior === "Character" ? "text-white bg-sky-600 border-2 border-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.8)]" : "text-blue-200 bg-slate-800 border-2 border-slate-600"}`}>Warrior</div>
                  </div>
                </div>

                {/* Boss */}
                <div className="flex-1 flex justify-center items-center relative">
                  <div className="flex flex-col items-center relative">
                    
                    {/* Floating Damage */}
                    <AnimatePresence>
                      {showDamage && !bossDefeated && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 0 }}
                          animate={{ opacity: 1, scale: 1.5, y: -60 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", bounce: 0.6, duration: 1 }}
                          className="absolute z-40 text-rose-500 font-black text-2xl drop-shadow-[0_0_10px_rgba(225,29,72,0.8)] whitespace-nowrap pointer-events-none"
                          style={{ WebkitTextStroke: '1px white' }}
                        >
                          -9999 CRITICAL!
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Boss Node */}
                    <AnimatePresence mode="popLayout">
                      {!bossDefeated ? (
                        <motion.div 
                           key="boss-alive"
                           exit={{ scale: 0, rotate: 180, opacity: 0 }}
                           transition={{ duration: 0.6, type: "spring" }}
                           className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative z-20 ${parents.boss === "Monster" ? 'bg-rose-500 border-4 border-rose-300 shadow-[0_0_25px_rgba(225,29,72,0.8),inset_0_4px_10px_rgba(255,255,255,0.5)] translate-y-[2px]' : 'bg-slate-700 border-4 border-slate-500 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.2)]'}`}
                        >
                          <Skull size={40} className={parents.boss === "Monster" ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" : "text-blue-300"} />
                          {parents.boss === "Monster" && (
                            <div className="absolute -bottom-6 w-[120%] h-4 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                              <motion.div animate={{ width: `${bossHp}%` }} className="h-full bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)] transition-all duration-300" />
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div 
                           key="boss-dead"
                           initial={{ scale: 0, rotate: -180, opacity: 0 }}
                           animate={{ scale: 1, rotate: 0, opacity: 1 }}
                           transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
                           className="w-20 h-20 rounded-full flex items-center justify-center relative z-20 bg-yellow-400 border-4 border-white shadow-[0_0_30px_rgba(250,204,21,0.8),inset_0_4px_10px_rgba(255,255,255,0.8)]"
                        >
                          <CheckCircle2 size={40} className="text-yellow-900" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={`mt-6 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${bossDefeated ? "text-yellow-900 bg-yellow-400 border-2 border-white shadow-[0_0_15px_rgba(250,204,21,0.8)]" : parents.boss === "Monster" ? "text-white bg-rose-600 border-2 border-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.8)]" : "text-blue-200 bg-slate-800 border-2 border-slate-600"}`}>
                       {bossDefeated ? "Defeated" : "Void Specter"}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel: The Code Forge */}
        <div className="flex-[0.8] flex flex-col gap-3 min-w-[340px]">
          
          <div className="bg-white rounded-[1.5rem] p-4 border-2 border-slate-200 shadow-sm shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-slate-100 border-b-2 border-slate-200 flex items-center justify-center text-slate-700 shadow-inner">
                 <Code2 size={20} />
               </div>
               <div>
                 <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase mb-0.5">Python Code Forge</h2>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Complete the architecture</p>
               </div>
            </div>
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg border-b-2 border-slate-200 font-black text-[10px] text-slate-700 uppercase tracking-widest shadow-inner">
              Task {Math.min(stage + 1, 3)} / 3
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-4 sm:p-5 border-2 border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 relative">
            
            <AnimatePresence mode="wait">
              
              {/* TASK 1: INHERITANCE */}
              {stage === 0 && (
                <motion.div 
                  key="task1" initial={{ opacity: 0, x: 20 }} animate={shakeTask === 1 ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-2 shrink-0"><Shield size={16}/> Inheritance</div>
                  <div className="text-xs font-bold text-slate-500 mb-4 leading-relaxed shrink-0">In Python, put the Base Class name in parentheses to inherit from it.</div>
                  
                  <div className="flex-1 overflow-y-auto pr-1 pb-2 flex flex-col gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    
                    {/* Mage Inheritance */}
                    <div className="bg-slate-100/60 p-2 rounded-2xl border-b-2 border-slate-200 shadow-sm">
                      <div className="bg-white rounded-xl p-3 font-mono text-[11px] sm:text-xs text-slate-800 border-2 border-slate-100 flex items-center flex-wrap gap-2">
                        <span><span className="text-fuchsia-600 font-bold">class</span> <span className="text-sky-600 font-bold">Mage</span>(</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg border-b-2 border-slate-200 gap-1 shadow-inner">
                          {["Character", "Monster"].map(opt => (
                            <button key={opt} onClick={() => handleParentSelect("mage", opt)} className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all active:translate-y-px ${parents.mage === opt ? 'bg-indigo-500 text-white shadow-[0_2px_0_#4338ca]' : 'bg-white text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50'}`}>{opt}</button>
                          ))}
                        </div>
                        <span>):</span>
                      </div>
                    </div>

                    {/* Warrior Inheritance */}
                    <div className="bg-slate-100/60 p-2 rounded-2xl border-b-2 border-slate-200 shadow-sm">
                      <div className="bg-white rounded-xl p-3 font-mono text-[11px] sm:text-xs text-slate-800 border-2 border-slate-100 flex items-center flex-wrap gap-2">
                        <span><span className="text-fuchsia-600 font-bold">class</span> <span className="text-sky-600 font-bold">Warrior</span>(</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg border-b-2 border-slate-200 gap-1 shadow-inner">
                          {["Character", "Monster"].map(opt => (
                            <button key={opt} onClick={() => handleParentSelect("warrior", opt)} className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all active:translate-y-px ${parents.warrior === opt ? 'bg-indigo-500 text-white shadow-[0_2px_0_#4338ca]' : 'bg-white text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50'}`}>{opt}</button>
                          ))}
                        </div>
                        <span>):</span>
                      </div>
                    </div>

                    {/* Boss Inheritance */}
                    <div className="bg-slate-100/60 p-2 rounded-2xl border-b-2 border-slate-200 shadow-sm">
                      <div className="bg-white rounded-xl p-3 font-mono text-[11px] sm:text-xs text-slate-800 border-2 border-slate-100 flex items-center flex-wrap gap-2">
                        <span><span className="text-fuchsia-600 font-bold">class</span> <span className="text-rose-600 font-bold">Boss</span>(</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg border-b-2 border-slate-200 gap-1 shadow-inner">
                          {["Character", "Monster"].map(opt => (
                            <button key={opt} onClick={() => handleParentSelect("boss", opt)} className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all active:translate-y-px ${parents.boss === opt ? 'bg-rose-500 text-white shadow-[0_2px_0_#be123c]' : 'bg-white text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50'}`}>{opt}</button>
                          ))}
                        </div>
                        <span>):</span>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="text-[10px] font-bold text-rose-600 bg-rose-50 p-2 border border-rose-200 rounded-lg flex items-center gap-2 mt-1 shrink-0">
                        <AlertTriangle size={14} /> {errorMsg}
                      </div>
                    )}

                  </div>

                  <button onClick={submitTask1} className="mt-4 w-full shrink-0 bg-indigo-500 text-white font-black text-xs py-4 rounded-xl shadow-[0_5px_0_#4338ca] active:shadow-none active:translate-y-[5px] hover:bg-indigo-400 transition-all uppercase tracking-widest">
                    Verify Routing
                  </button>
                </motion.div>
              )}

              {/* TASK 2: CONSTRUCTORS */}
              {stage === 1 && (
                <motion.div 
                  key="task2" initial={{ opacity: 0, x: 20 }} animate={shakeTask === 2 ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="text-xs font-black text-fuchsia-600 uppercase tracking-widest mb-1 flex items-center gap-2 shrink-0"><Wand2 size={16}/> Constructors</div>
                  <div className="text-xs font-bold text-slate-500 mb-4 leading-relaxed shrink-0">Pass arguments from the child's constructor up to the parent using the <code className="text-fuchsia-600 bg-white px-1.5 py-0.5 rounded-md border-b-2 border-slate-200">super()</code> method.</div>
                  
                  <div className="flex-1 overflow-y-auto pr-1 pb-2 flex flex-col gap-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    
                    {/* Mage Super */}
                    <div className="bg-slate-100/60 p-2.5 rounded-2xl border-b-2 border-slate-200 shadow-sm flex flex-col gap-2">
                      <div className="bg-white rounded-xl p-3 font-mono text-xs text-slate-800 border-2 border-slate-100 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] leading-relaxed">
                        <span className="text-fuchsia-600 font-bold">def</span> <span className="text-sky-600 font-bold">__init__</span>(<span className="text-emerald-600">self</span>, hp, mana):<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-500 font-bold">{supers.mage || "_______"}</span>.<span className="text-sky-600 font-bold">__init__</span>(hp, mana)
                      </div>
                      <div className="flex gap-2">
                        {["super()", "self", "Character"].map(opt => (
                          <button key={opt} onClick={() => handleSuperSelect("mage", opt)} className={`flex-1 text-[10px] py-3 font-black uppercase tracking-wider rounded-xl transition-all active:translate-y-1 ${supers.mage === opt ? 'bg-fuchsia-500 text-white border-2 border-fuchsia-500 shadow-[0_4px_0_#a21caf]' : 'bg-white text-slate-600 border-2 border-slate-100 shadow-[0_4px_0_#e2e8f0] hover:bg-slate-50'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>

                    {/* Warrior Super */}
                    <div className="bg-slate-100/60 p-2.5 rounded-2xl border-b-2 border-slate-200 shadow-sm flex flex-col gap-2">
                      <div className="bg-white rounded-xl p-3 font-mono text-xs text-slate-800 border-2 border-slate-100 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] leading-relaxed">
                        <span className="text-fuchsia-600 font-bold">def</span> <span className="text-sky-600 font-bold">__init__</span>(<span className="text-emerald-600">self</span>, hp, mana):<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-500 font-bold">{supers.warrior || "_______"}</span>.<span className="text-sky-600 font-bold">__init__</span>(hp, mana)
                      </div>
                      <div className="flex gap-2">
                        {["super()", "self", "Character"].map(opt => (
                          <button key={opt} onClick={() => handleSuperSelect("warrior", opt)} className={`flex-1 text-[10px] py-3 font-black uppercase tracking-wider rounded-xl transition-all active:translate-y-1 ${supers.warrior === opt ? 'bg-fuchsia-500 text-white border-2 border-fuchsia-500 shadow-[0_4px_0_#a21caf]' : 'bg-white text-slate-600 border-2 border-slate-100 shadow-[0_4px_0_#e2e8f0] hover:bg-slate-50'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="text-[10px] font-bold text-rose-600 bg-rose-50 p-3 border-b-2 border-rose-200 rounded-xl flex items-center gap-2">
                        <AlertTriangle size={16} /> {errorMsg}
                      </div>
                    )}

                  </div>

                  <button onClick={submitTask2} className="mt-4 w-full shrink-0 bg-fuchsia-500 text-white font-black text-xs py-4 rounded-xl shadow-[0_5px_0_#a21caf] active:shadow-none active:translate-y-[5px] hover:bg-fuchsia-400 transition-all uppercase tracking-widest">
                    Initialize Data
                  </button>
                </motion.div>
              )}

              {/* TASK 3: MAGIC METHODS */}
              {stage === 2 && (
                <motion.div 
                  key="task3" initial={{ opacity: 0, x: 20 }} animate={shakeTask === 3 ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2 shrink-0"><Code2 size={16}/> Magic Methods</div>
                  <div className="text-xs font-bold text-slate-500 mb-4 leading-relaxed shrink-0">Assign double-underscore (dunder) methods for built-in behavior.</div>
                  
                  <div className="flex-1 overflow-y-auto pr-1 pb-2 flex flex-col gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    
                    {/* String Rep */}
                    <div className="bg-slate-100/60 p-2 rounded-2xl border-b-2 border-slate-200 shadow-sm flex flex-col gap-1">
                      <div className="px-2 text-[9px] text-slate-500 font-black uppercase tracking-widest">String Output</div>
                      <div className="bg-white rounded-xl p-3 font-mono text-[11px] sm:text-xs text-slate-800 border-2 border-slate-100 flex flex-col gap-1.5 leading-relaxed">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span><span className="text-fuchsia-600 font-bold">def</span></span>
                          <div className="flex bg-slate-100 p-1 rounded-lg border-b-2 border-slate-200 gap-1 shadow-inner">
                            {["__str__", "__init__", "__repr__"].map(opt => (
                              <button key={opt} onClick={() => handleDunderSelect("stringRep", opt)} className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all active:translate-y-px ${dunders.stringRep === opt ? 'bg-amber-500 text-white shadow-[0_2px_0_#b45309]' : 'bg-white text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50'}`}>{opt}</button>
                            ))}
                          </div>
                          <span>(<span className="text-emerald-600">self</span>):</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-fuchsia-600 font-bold">return</span> <span className="text-emerald-600">f"Hero: {'{'}self.name{'}'}"</span>
                        </div>
                      </div>
                    </div>

                    {/* Addition Combo */}
                    <div className="bg-slate-100/60 p-2 rounded-2xl border-b-2 border-slate-200 shadow-sm flex flex-col gap-1">
                      <div className="px-2 text-[9px] text-slate-500 font-black uppercase tracking-widest">Operator Overloading (+)</div>
                      <div className="bg-white rounded-xl p-3 font-mono text-[11px] sm:text-xs text-slate-800 border-2 border-slate-100 flex flex-col gap-1.5 leading-relaxed">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span><span className="text-fuchsia-600 font-bold">def</span></span>
                          <div className="flex bg-slate-100 p-1 rounded-lg border-b-2 border-slate-200 gap-1 shadow-inner">
                            {["__plus__", "__add__", "__combo__"].map(opt => (
                              <button key={opt} onClick={() => handleDunderSelect("comboAtk", opt)} className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all active:translate-y-px ${dunders.comboAtk === opt ? 'bg-amber-500 text-white shadow-[0_2px_0_#b45309]' : 'bg-white text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50'}`}>{opt}</button>
                            ))}
                          </div>
                          <span>(<span className="text-emerald-600">self</span>, other):</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-fuchsia-600 font-bold">return</span> ComboAttack(<span className="text-emerald-600">self</span>, other)
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="text-[10px] font-bold text-rose-600 bg-rose-50 p-2 border border-rose-200 rounded-lg flex items-center gap-2 mt-1 shrink-0">
                        <AlertTriangle size={14} /> {errorMsg}
                      </div>
                    )}

                  </div>

                  <button onClick={submitTask3} className="mt-4 w-full shrink-0 bg-amber-500 text-white font-black text-xs py-4 rounded-xl shadow-[0_5px_0_#b45309] active:shadow-none active:translate-y-[5px] hover:bg-amber-400 transition-all uppercase tracking-widest">
                    Bind Methods
                  </button>
                </motion.div>
              )}

              {/* FINAL: COMBO ATTACK */}
              {stage >= 3 && (
                <motion.div 
                  key="task4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col h-full items-center justify-center text-center gap-8 p-4"
                >
                  <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border-b-4 border-emerald-500 shadow-lg ring-4 ring-emerald-100 shrink-0">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-800 mb-3 uppercase tracking-widest">Engine Ready</div>
                    <div className="text-xs font-bold text-slate-500 leading-loose">Inheritance mapped.<br/>Constructors wired.<br/>Magic Methods bound.</div>
                  </div>
                  
                  <button
                    onClick={executeComboAttack}
                    disabled={isAttacking || labFinished}
                    className="mt-4 w-full shrink-0 bg-emerald-500 text-white font-black text-xs py-4 rounded-xl shadow-[0_5px_0_#047857] active:shadow-none active:translate-y-[5px] hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    <PlayCircle size={18} /> Execute Combo Attack
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
