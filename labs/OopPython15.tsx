"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Code2, Ghost, Shield, Wand2, Swords, Skull, Zap, Lock, Unlock, 
  Heart, AlertTriangle, PlayCircle, CheckCircle2, FlaskConical, Terminal
} from "lucide-react";

export default function OopPython15() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();

  const [stage, setStage] = useState(0);
  
  const [parents, setParents] = useState({ mage: "", warrior: "", boss: "" });
  const [stats, setStats] = useState({ mageHp: "", mageMana: "", warriorHp: "", warriorMana: "" });
  const [dunders, setDunders] = useState({ stringRep: "", comboAtk: "" });

  const [bossHp, setBossHp] = useState(100);
  const [isAttacking, setIsAttacking] = useState(false);
  const [labFinished, setLabFinished] = useState(false);

  const t1Done = parents.mage === "Character" && parents.warrior === "Character" && parents.boss === "Monster";
  const t2Done = stats.mageHp === "80" && stats.mageMana === "200" && stats.warriorHp === "200" && stats.warriorMana === "50";
  const t3Done = dunders.stringRep === "__str__" && dunders.comboAtk === "__add__";

  const handleParentSelect = (entity: "mage"|"warrior"|"boss", val: string) => {
    setParents(p => ({ ...p, [entity]: val }));
    if (playClick) playClick();
  };

  const handleStatSelect = (stat: "mageHp"|"mageMana"|"warriorHp"|"warriorMana", val: string) => {
    setStats(s => ({ ...s, [stat]: val }));
    if (playClick) playClick();
  };

  const handleDunderSelect = (key: "stringRep"|"comboAtk", val: string) => {
    setDunders(d => ({ ...d, [key]: val }));
    if (playClick) playClick();
  };

  const submitTask1 = () => {
    if (t1Done) {
      if (playSuccess) playSuccess();
      setStage(1);
    } else {
      if (playError) playError();
    }
  };

  const submitTask2 = () => {
    if (t2Done) {
      if (playSuccess) playSuccess();
      setStage(2);
    } else {
      if (playError) playError();
    }
  };

  const submitTask3 = () => {
    if (t3Done) {
      if (playSuccess) playSuccess();
      setStage(3);
    } else {
      if (playError) playError();
    }
  };

  const executeComboAttack = async () => {
    if (playZap) playZap();
    setIsAttacking(true);
    
    await new Promise(r => setTimeout(r, 600)); 
    if (playPop) playPop();
    setBossHp(0);
    
    await new Promise(r => setTimeout(r, 1000)); 
    if (playSuccess) playSuccess();
    setStage(4);
    setLabFinished(true);
  };

  const resetLab = () => {
    setStage(0);
    setParents({ mage: "", warrior: "", boss: "" });
    setStats({ mageHp: "", mageMana: "", warriorHp: "", warriorMana: "" });
    setDunders({ stringRep: "", comboAtk: "" });
    setBossHp(100);
    setIsAttacking(false);
    setLabFinished(false);
    if (playPop) playPop();
  };

  return (
    <LabShell
      labId="ooppython15"
      title="OOP in Python"
      subtitle="The RPG Character Forge"
      theme="neon"
      compact={true}
      onReset={resetLab}
      instruction="1. Review the concepts of inheritance and operator overloading in Python. 2. Create a base class and derive new classes using the interactive editor. 3. Implement operator overloading to define custom behaviors for your objects. 4. Run the simulation to verify the objects interact correctly using the new operators."
    >
      <Celebration isActive={labFinished} onReplay={resetLab} />

      <div className="flex flex-col md:flex-row h-full w-full max-w-6xl mx-auto gap-3 p-2">
        
        {/* Left Panel: The Game Engine (Visual Output) */}
        <div className="flex-[1.2] bg-white rounded-xl p-3 border-2 border-slate-400/50 shadow-lg flex flex-col relative overflow-hidden">
          
          <div className="flex items-center gap-2 mb-2 opacity-50 shrink-0">
            <Terminal size={14} className="text-slate-700" />
            <h2 className="text-xs font-black text-slate-700 tracking-widest uppercase">Game Engine View</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-10">
            
            {/* The Blueprint Header */}
            <div className="flex gap-8 opacity-50 absolute top-0">
              <div className="bg-slate-200/50 border border-slate-400 p-1.5 rounded-lg flex flex-col items-center">
                <Shield size={14} className="text-slate-700 mb-0.5" />
                <div className="text-[9px] font-bold text-slate-700 uppercase">Base: Character</div>
              </div>
              <div className="bg-slate-200/50 border border-slate-400 p-1.5 rounded-lg flex flex-col items-center">
                <Ghost size={14} className="text-slate-700 mb-0.5" />
                <div className="text-[9px] font-bold text-slate-700 uppercase">Base: Monster</div>
              </div>
            </div>

            {/* The Battlefield */}
            <div className="w-full flex justify-between items-center px-4 mt-6">
              
              {/* Heroes */}
              <div className="flex flex-col gap-4">
                
                {/* Mage */}
                <div className={`relative flex items-center gap-3 transition-all duration-500 ${stage >= 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${stage >= 1 ? 'bg-fuchsia-900/50 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'bg-slate-200 border-slate-400'}`}>
                    {stage === 0 ? <Lock size={18} className="text-slate-700" /> : <Wand2 size={24} className="text-fuchsia-700" />}
                  </div>
                  <div className="w-24">
                    <div className="font-black text-slate-900 text-xs tracking-widest uppercase mb-1">Mage</div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-400 mb-1">
                      <div className={`h-full transition-all duration-1000 ${stage >= 2 ? 'w-full bg-emerald-500' : 'w-0 bg-red-500'}`} />
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-400">
                      <div className={`h-full transition-all duration-1000 ${stage >= 2 ? 'w-full bg-sky-500' : 'w-0 bg-red-500'}`} />
                    </div>
                    {stage === 1 && <div className="text-[8px] text-red-400 font-bold mt-1 flex items-center gap-1 uppercase"><AlertTriangle size={8}/> Missing Constructor</div>}
                  </div>
                </div>

                {/* Warrior */}
                <div className={`relative flex items-center gap-3 transition-all duration-500 ${stage >= 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${stage >= 1 ? 'bg-sky-900/50 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-slate-200 border-slate-400'}`}>
                    {stage === 0 ? <Lock size={18} className="text-slate-700" /> : <Swords size={24} className="text-sky-700" />}
                  </div>
                  <div className="w-24">
                    <div className="font-black text-slate-900 text-xs tracking-widest uppercase mb-1">Warrior</div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-400 mb-1">
                      <div className={`h-full transition-all duration-1000 ${stage >= 2 ? 'w-full bg-emerald-500' : 'w-0 bg-red-500'}`} />
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-400">
                      <div className={`h-full transition-all duration-1000 ${stage >= 2 ? 'w-full bg-sky-500' : 'w-0 bg-red-500'}`} />
                    </div>
                    {stage === 1 && <div className="text-[8px] text-red-400 font-bold mt-1 flex items-center gap-1 uppercase"><AlertTriangle size={8}/> Missing Constructor</div>}
                  </div>
                </div>

              </div>

              {/* Combo Attack Laser */}
              {isAttacking && bossHp > 0 && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  className="absolute left-[150px] right-[100px] h-3 bg-yellow-400 shadow-[0_0_20px_#facc15] z-0 rounded-full"
                />
              )}

              {/* Boss Enemy */}
              <div className={`relative transition-all duration-500 flex flex-col items-center ${stage >= 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale'}`}>
                <div className="text-red-500 font-black tracking-widest text-[10px] mb-1">VOID SPECTER</div>
                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${stage === 0 ? 'bg-slate-200 border-slate-400' : 'bg-red-950/80 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'}`}>
                  {stage === 0 ? <Lock size={24} className="text-slate-700" /> : <Skull size={40} className="text-red-400" />}
                </div>
                {stage >= 1 && (
                  <div className="w-20 h-2 bg-slate-200 mt-2 border border-slate-400 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: `${bossHp}%` }}
                      className="h-full bg-red-500"
                    />
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Right Panel: The Code Forge (Focus Mode) */}
        <div className="flex-[0.8] flex flex-col gap-2">
          
          <div className="bg-white rounded-xl p-3 border-2 border-slate-400/50 shadow-lg shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-0.5">
                <FlaskConical className="text-sky-700" size={16}/> Code Forge
              </h2>
              <p className="text-[10px] text-slate-700">Complete the OOP architecture.</p>
            </div>
            <div className="bg-slate-200 px-2 py-1 rounded border border-slate-400 font-bold text-[10px] text-slate-800 shadow-inner">
              TASK {Math.min(stage + 1, 3)} / 3
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border-2 border-slate-400/50 shadow-lg flex-1 flex flex-col min-h-0 relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              
              {/* TASK 1: INHERITANCE */}
              {stage === 0 && (
                <motion.div 
                  key="task1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  <div className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-1">Task 1: Inheritance</div>
                  <div className="text-[10px] text-slate-800 mb-3 leading-tight">Assign the Base Class to inherit from.</div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    
                    {/* Mage Inheritance */}
                    <div className="bg-white p-2 rounded-lg border border-slate-400 flex flex-col gap-1.5">
                      <div className="font-mono text-[11px] text-slate-800"><span className="text-fuchsia-700">class</span> Mage(<span className="text-amber-600">{parents.mage || "___"}</span>):</div>
                      <div className="flex gap-1.5">
                        {["Character", "Monster", "Item"].map(opt => (
                          <button key={opt} onClick={() => handleParentSelect("mage", opt)} className={`flex-1 text-[9px] py-1 font-bold rounded border ${parents.mage === opt ? 'bg-sky-500/20 border-sky-400 text-sky-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>

                    {/* Warrior Inheritance */}
                    <div className="bg-white p-2 rounded-lg border border-slate-400 flex flex-col gap-1.5">
                      <div className="font-mono text-[11px] text-slate-800"><span className="text-fuchsia-700">class</span> Warrior(<span className="text-amber-600">{parents.warrior || "___"}</span>):</div>
                      <div className="flex gap-1.5">
                        {["Character", "Monster", "Item"].map(opt => (
                          <button key={opt} onClick={() => handleParentSelect("warrior", opt)} className={`flex-1 text-[9px] py-1 font-bold rounded border ${parents.warrior === opt ? 'bg-sky-500/20 border-sky-400 text-sky-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>

                    {/* Boss Inheritance */}
                    <div className="bg-white p-2 rounded-lg border border-slate-400 flex flex-col gap-1.5">
                      <div className="font-mono text-[11px] text-slate-800"><span className="text-fuchsia-700">class</span> Boss(<span className="text-amber-600">{parents.boss || "___"}</span>):</div>
                      <div className="flex gap-1.5">
                        {["Character", "Monster", "Item"].map(opt => (
                          <button key={opt} onClick={() => handleParentSelect("boss", opt)} className={`flex-1 text-[9px] py-1 font-bold rounded border ${parents.boss === opt ? 'bg-sky-500/20 border-sky-400 text-sky-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>

                  </div>

                  <button 
                    onClick={submitTask1}
                    className="mt-2 w-full bg-sky-500 text-slate-900 font-black text-xs py-2 rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:bg-sky-400 transition-colors"
                  >
                    VERIFY ROUTING
                  </button>
                </motion.div>
              )}

              {/* TASK 2: CONSTRUCTORS */}
              {stage === 1 && (
                <motion.div 
                  key="task2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  <div className="text-xs font-bold text-fuchsia-700 uppercase tracking-widest mb-1">Task 2: Constructors</div>
                  <div className="text-[9px] text-slate-800 mb-2 leading-tight">Use <code className="text-fuchsia-700">super()</code> to initialize <code className="text-fuchsia-700">Character(hp, mana)</code>.<br/>(Warrior = High HP/Low Mana. Mage = Low HP/High Mana)</div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    
                    {/* Mage Super */}
                    <div className="bg-white p-2 rounded-lg border border-slate-400 flex flex-col gap-1.5">
                      <div className="font-mono text-[10px] text-slate-700">Mage <span className="text-sky-700">__init__</span>():</div>
                      <div className="font-mono text-[10px] text-slate-800 bg-white p-1.5 rounded leading-tight">super().__init__(hp=<span className="text-amber-600">{stats.mageHp || "_"}</span>, mana=<span className="text-amber-600">{stats.mageMana || "_"}</span>)</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex gap-1">{["80", "200"].map(opt => (
                            <button key={opt} onClick={() => handleStatSelect("mageHp", opt)} className={`flex-1 text-[9px] py-0.5 font-bold rounded border ${stats.mageHp === opt ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>HP {opt}</button>
                          ))}</div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex gap-1">{["80", "200"].map(opt => (
                            <button key={opt} onClick={() => handleStatSelect("mageMana", opt)} className={`flex-1 text-[9px] py-0.5 font-bold rounded border ${stats.mageMana === opt ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>MP {opt}</button>
                          ))}</div>
                        </div>
                      </div>
                    </div>

                    {/* Warrior Super */}
                    <div className="bg-white p-2 rounded-lg border border-slate-400 flex flex-col gap-1.5">
                      <div className="font-mono text-[10px] text-slate-700">Warrior <span className="text-sky-700">__init__</span>():</div>
                      <div className="font-mono text-[10px] text-slate-800 bg-white p-1.5 rounded leading-tight">super().__init__(hp=<span className="text-amber-600">{stats.warriorHp || "_"}</span>, mana=<span className="text-amber-600">{stats.warriorMana || "_"}</span>)</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex gap-1">{["50", "200"].map(opt => (
                            <button key={opt} onClick={() => handleStatSelect("warriorHp", opt)} className={`flex-1 text-[9px] py-0.5 font-bold rounded border ${stats.warriorHp === opt ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>HP {opt}</button>
                          ))}</div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex gap-1">{["50", "200"].map(opt => (
                            <button key={opt} onClick={() => handleStatSelect("warriorMana", opt)} className={`flex-1 text-[9px] py-0.5 font-bold rounded border ${stats.warriorMana === opt ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>MP {opt}</button>
                          ))}</div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <button 
                    onClick={submitTask2}
                    className="mt-2 w-full bg-fuchsia-500 text-slate-900 font-black text-xs py-2 rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:bg-fuchsia-400 transition-colors"
                  >
                    INITIALIZE STATS
                  </button>
                </motion.div>
              )}

              {/* TASK 3: MAGIC METHODS */}
              {stage === 2 && (
                <motion.div 
                  key="task3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  <div className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-1">Task 3: Dunder Methods</div>
                  <div className="text-[10px] text-slate-800 mb-3 leading-tight">Assign the correct Magic (Dunder) Methods.</div>
                  
                  <div className="flex-1 flex flex-col gap-3">
                    
                    {/* String Rep */}
                    <div className="bg-white p-3 rounded-lg border border-slate-400 flex flex-col gap-2">
                      <div className="text-[10px] text-slate-700 font-bold uppercase">String Representation</div>
                      <div className="font-mono text-[10px] text-slate-800 bg-white p-2 rounded leading-tight">
                        <span className="text-sky-700">def</span> <span className="text-amber-600">{dunders.stringRep || "________"}</span>(self):<br/>
                        &nbsp;&nbsp;<span className="text-fuchsia-700">return</span> f"Character: {'{'}self.name{'}'}"
                      </div>
                      <div className="flex gap-1.5">
                        {["__str__", "__init__", "__repr__"].map(opt => (
                          <button key={opt} onClick={() => handleDunderSelect("stringRep", opt)} className={`flex-1 text-[9px] py-1 font-bold rounded border ${dunders.stringRep === opt ? 'bg-orange-500/20 border-orange-400 text-orange-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>

                    {/* Addition Combo */}
                    <div className="bg-white p-3 rounded-lg border border-slate-400 flex flex-col gap-2">
                      <div className="text-[10px] text-slate-700 font-bold uppercase">Operator Overloading (+)</div>
                      <div className="font-mono text-[10px] text-slate-800 bg-white p-2 rounded leading-tight">
                        <span className="text-sky-700">def</span> <span className="text-amber-600">{dunders.comboAtk || "________"}</span>(self, other):<br/>
                        &nbsp;&nbsp;<span className="text-fuchsia-700">return</span> ComboAttack(self, other)
                      </div>
                      <div className="flex gap-1.5">
                        {["__plus__", "__add__", "__combo__"].map(opt => (
                          <button key={opt} onClick={() => handleDunderSelect("comboAtk", opt)} className={`flex-1 text-[9px] py-1 font-bold rounded border ${dunders.comboAtk === opt ? 'bg-orange-500/20 border-orange-400 text-orange-700' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>

                  </div>

                  <button 
                    onClick={submitTask3}
                    className="mt-2 w-full bg-orange-500 text-slate-900 font-black text-xs py-2 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-orange-400 transition-colors"
                  >
                    BIND METHODS
                  </button>
                </motion.div>
              )}

              {/* FINAL: COMBO ATTACK */}
              {stage >= 3 && (
                <motion.div 
                  key="task4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col h-full items-center justify-center text-center gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500">
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 mb-1">Architecture Complete</div>
                    <div className="text-[10px] text-slate-700">Inheritance, Constructors, and Magic Methods mapped.</div>
                  </div>
                  
                  <button
                    onClick={executeComboAttack}
                    disabled={isAttacking || labFinished}
                    className="mt-2 w-full bg-yellow-400 text-slate-900 font-black text-xs py-3 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:bg-yellow-300 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 font-mono"
                  >
                    <PlayCircle size={16} /> RUN: Mage + Warrior
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
