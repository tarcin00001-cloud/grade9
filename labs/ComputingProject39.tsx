"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Database, ShieldAlert, FileText, BarChart, Layout, 
  Terminal, Code2, Cpu, Rocket, ShoppingCart, Zap, CheckCircle2
} from "lucide-react";

// --- DATA ---
const PROJECTS = [
  { id: 'python', title: 'Python Data', icon: BarChart, color: 'emerald', 
    tech: ['Calculate Mean/Median/Mode', 'Plot matplotlib charts', 'Dataset of 20+ records'] },
  { id: 'security', title: 'Network Security', icon: ShieldAlert, color: 'red', 
    tech: ['Explain vulnerabilities', 'Detail damage caused', 'Recommend countermeasures'] },
  { id: 'database', title: 'Relational DB', icon: Database, color: 'blue', 
    tech: ['4 Tables with relationships', '10 meaningful queries', '2 formatted reports'] },
  { id: 'research', title: 'Digital Citizen', icon: FileText, color: 'purple', 
    tech: ['600-800 Words', 'Clear argument & counter', 'Cited sources'] },
  { id: 'webapp', title: 'Responsive Web', icon: Layout, color: 'cyan', 
    tech: ['2-3 Pages (HTML/CSS/JS)', 'Responsive Mobile/Desktop', 'Interactive browser demo'] }
];

const DOC_GUIDELINES = [
  'Title & Name', 'Why You Chose This', 'Step-by-Step Log', 'What You Learned', 'Screenshots / Demo'
];

// Costs
const COST_CORE = 50;
const COST_TECH = 30;
const COST_DOC = 20;
const COST_SHIP = 150;

export default function ComputingProject39() {
  const { playClick, playSuccess, playError, playPop, playChime } = useLabAudio();

  const [win, setWin] = useState(false);
  
  // Game State
  const [loc, setLoc] = useState(0); // Lines of Code Currency
  const [phase, setPhase] = useState(0); // 0: Core, 1: Tech, 2: Docs, 3: Ship
  
  const [purchasedCore, setPurchasedCore] = useState<string | null>(null);
  const [purchasedTech, setPurchasedTech] = useState<string[]>([]);
  const [purchasedDocs, setPurchasedDocs] = useState<string[]>([]);

  // Click Feedback Animations
  const [clicks, setClicks] = useState<{id: number, x: number, y: number}[]>([]);
  const clickCountRef = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedProject = PROJECTS.find(p => p.id === purchasedCore);

  const handleCodeClick = (e: React.MouseEvent) => {
    if (playClick) playClick();
    
    // Add LOC
    setLoc(prev => prev + 5);

    // Floating text animation
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newClick = { id: clickCountRef.current++, x, y };
      setClicks(prev => [...prev, newClick]);
      setTimeout(() => {
        setClicks(prev => prev.filter(c => c.id !== newClick.id));
      }, 800);
    }
  };

  const handleBuyCore = (id: string) => {
    if (loc >= COST_CORE) {
      if (playSuccess) playSuccess();
      setLoc(prev => prev - COST_CORE);
      setPurchasedCore(id);
      setPhase(1);
    } else {
      if (playError) playError();
    }
  };

  const handleBuyTech = (tech: string) => {
    if (loc >= COST_TECH && !purchasedTech.includes(tech)) {
      if (playPop) playPop();
      setLoc(prev => prev - COST_TECH);
      const newTech = [...purchasedTech, tech];
      setPurchasedTech(newTech);
      if (newTech.length === 3) {
        setTimeout(() => {
          if (playSuccess) playSuccess();
          setPhase(2);
        }, 500);
      }
    } else {
      if (playError) playError();
    }
  };

  const handleBuyDoc = (doc: string) => {
    if (loc >= COST_DOC && !purchasedDocs.includes(doc)) {
      if (playPop) playPop();
      setLoc(prev => prev - COST_DOC);
      const newDocs = [...purchasedDocs, doc];
      setPurchasedDocs(newDocs);
      if (newDocs.length === 5) {
        setTimeout(() => {
          if (playSuccess) playSuccess();
          setPhase(3);
        }, 500);
      }
    } else {
      if (playError) playError();
    }
  };

  const handleShip = () => {
    if (loc >= COST_SHIP) {
      setLoc(prev => prev - COST_SHIP);
      if (playChime) playChime();
      setWin(true);
    } else {
      if (playError) playError();
    }
  };

  const handleReset = () => {
    setWin(false); setPhase(0); setLoc(0);
    setPurchasedCore(null); setPurchasedTech([]); setPurchasedDocs([]);
  };

  return (
    <LabShell
      labId="computingproject39"
      title="Hackathon Tycoon"
      subtitle="Computing Project"
      instruction="1. Review the goals and constraints of the final 4-week computing project. 2. Use the Mission Dispatch Center to explore different project ideas and technologies. 3. Authorize the project scope, allocate resources, and manage the timeline. 4. Present the final simulated project outcome for evaluation."
      theme="cosmos"
      onReset={handleReset}
    >
      <Celebration 
        isActive={win}
        message="Project Shipped! You have successfully funded and built your 10% final project!"
        onReplay={handleReset}
      />

      <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border-2 border-slate-200 relative shadow-xl font-mono text-slate-800">
        
        {/* Top Bar: Currency */}
        <div className="shrink-0 h-16 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-3">
            <Terminal size={24} className="text-blue-500" />
            <span className="text-xl font-black text-slate-800 tracking-widest">HACKATHON_TYCOON</span>
          </div>
          <div className="bg-white border-2 border-blue-200 px-6 py-2 rounded-lg flex items-center gap-3 shadow-sm">
            <Code2 size={20} className="text-blue-500" />
            <span className="text-slate-500 text-sm font-bold">LOC:</span>
            <motion.span 
              key={loc}
              initial={{ scale: 1.5, color: '#3b82f6' }}
              animate={{ scale: 1, color: '#0f172a' }}
              className="text-2xl font-black tabular-nums min-w-[4ch] text-right text-slate-800"
            >
              {loc}
            </motion.span>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
          
          {/* LEFT PANEL: The Grind */}
          <div className="lg:w-1/3 border-b-2 lg:border-b-0 lg:border-r-2 border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)] [background-size:20px_20px]" />
            
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8 text-center relative z-10">
              Workstation<br/>(Click to Generate Code)
            </h2>

            <button
              ref={buttonRef}
              onMouseDown={handleCodeClick}
              className="relative z-10 w-48 h-48 rounded-full bg-white border-4 border-blue-500 flex flex-col items-center justify-center gap-3 shadow-lg hover:bg-slate-50 hover:scale-105 active:scale-95 active:border-blue-600 transition-all focus:outline-none select-none group"
            >
              <Zap size={48} className="text-blue-500 group-active:text-blue-600" />
              <span className="text-xl font-black tracking-widest text-slate-800 group-active:text-slate-900">WRITE</span>
              <span className="text-xl font-black tracking-widest text-slate-800 group-active:text-slate-900">CODE</span>

              {/* Floating Clicks */}
              <AnimatePresence>
                {clicks.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 1, y: c.y - 20, x: c.x }}
                    animate={{ opacity: 0, y: c.y - 80, x: c.x + (Math.random() * 40 - 20) }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute pointer-events-none text-blue-500 font-bold text-2xl drop-shadow-sm"
                  >
                    +5
                  </motion.div>
                ))}
              </AnimatePresence>
            </button>
          </div>

          {/* CENTER PANEL: Assembly Visualizer */}
          <div className="lg:w-1/3 border-b-2 lg:border-b-0 lg:border-r-2 border-slate-200 bg-white p-4 lg:p-6 flex flex-col relative overflow-hidden">
            <h2 className="shrink-0 text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 text-center z-20">
              Project Blueprint
            </h2>

            <div className="flex-1 flex flex-col gap-3 max-w-sm mx-auto w-full pb-2 justify-center">
              
              {/* Blueprint Core */}
              <div className={`p-3 rounded-xl border-2 transition-all ${purchasedCore ? `border-${selectedProject?.color}-400 bg-${selectedProject?.color}-50` : 'border-slate-200 border-dashed bg-slate-50'}`}>
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">1. Core Architecture</div>
                {purchasedCore && selectedProject ? (
                  <div className="flex items-center gap-2">
                    <selectedProject.icon size={20} className={`text-${selectedProject.color}-600`} />
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">{selectedProject.title}</span>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-[11px]">Awaiting Purchase...</div>
                )}
              </div>

              {/* Blueprint Tech Specs */}
              <div className={`p-3 rounded-xl border-2 transition-all ${purchasedTech.length === 3 ? 'border-blue-400 bg-blue-50' : 'border-slate-200 border-dashed bg-slate-50'}`}>
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex justify-between">
                  <span>2. Tech Specs</span>
                  <span>{purchasedTech.length} / 3</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`h-6 rounded flex items-center px-2 text-[10px] font-bold ${purchasedTech[i] ? 'bg-blue-100 text-blue-800' : 'bg-slate-200/50 text-slate-400'}`}>
                      {purchasedTech[i] || 'Empty Slot'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Blueprint Docs */}
              <div className={`p-3 rounded-xl border-2 transition-all ${purchasedDocs.length === 5 ? 'border-purple-400 bg-purple-50' : 'border-slate-200 border-dashed bg-slate-50'}`}>
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex justify-between">
                  <span>3. Documentation</span>
                  <span>{purchasedDocs.length} / 5</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-6 rounded flex items-center px-2 text-[10px] font-bold ${purchasedDocs[i] ? 'bg-purple-100 text-purple-800' : 'bg-slate-200/50 text-slate-400'}`}>
                      {purchasedDocs[i] || 'Empty Slot'}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: The Shop */}
          <div className="lg:w-1/3 bg-slate-100 p-4 lg:p-6 flex flex-col relative overflow-hidden">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2 sticky top-0 py-2 z-20">
              <ShoppingCart size={16} className="text-amber-600" /> Upgrades Shop
            </h2>

            <AnimatePresence mode="wait">
              {/* SHOP PHASE 0: BUY CORE */}
              {phase === 0 && (
                <motion.div key="shop-0" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="flex flex-col gap-2">
                  <div className="text-xs text-slate-500 mb-2 font-bold">Step 1: Purchase a Core Branch</div>
                  {PROJECTS.map(p => {
                    const canAfford = loc >= COST_CORE;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleBuyCore(p.id)}
                        disabled={!canAfford}
                        className={`p-3 rounded-lg border-2 flex items-center justify-between transition-all ${
                          canAfford 
                          ? `border-${p.color}-400 bg-white hover:bg-slate-50 hover:border-${p.color}-500 cursor-pointer shadow-sm` 
                          : 'border-slate-300 bg-slate-200 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <p.icon size={20} className={`text-${p.color}-500`} />
                          <span className="text-sm font-bold text-slate-800">{p.title}</span>
                        </div>
                        <div className={`text-xs font-black px-2 py-1 rounded ${canAfford ? 'bg-green-100 text-green-700' : 'bg-slate-300 text-slate-500'}`}>
                          {COST_CORE} LOC
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              )}

              {/* SHOP PHASE 1: BUY TECH SPECS */}
              {phase === 1 && selectedProject && (
                <motion.div key="shop-1" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="flex flex-col gap-2">
                  <div className="text-xs text-slate-500 mb-2 font-bold">Step 2: Purchase Tech Requirements</div>
                  {selectedProject.tech.map((t, i) => {
                    const purchased = purchasedTech.includes(t);
                    const canAfford = loc >= COST_TECH;
                    
                    if (purchased) {
                      return (
                        <div key={i} className="p-3 rounded-lg border-2 border-green-400 bg-green-50 flex items-center gap-3 text-green-700">
                          <CheckCircle2 size={20} /> <span className="text-xs font-bold line-through opacity-70">{t}</span>
                        </div>
                      )
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handleBuyTech(t)}
                        disabled={!canAfford}
                        className={`p-3 rounded-lg border-2 flex items-center justify-between text-left transition-all ${
                          canAfford 
                          ? `border-blue-400 bg-white hover:bg-slate-50 hover:border-blue-500 cursor-pointer shadow-sm` 
                          : 'border-slate-300 bg-slate-200 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-800 leading-snug max-w-[70%]">{t}</span>
                        <div className={`text-[10px] font-black px-2 py-1 rounded shrink-0 ${canAfford ? 'bg-green-100 text-green-700' : 'bg-slate-300 text-slate-500'}`}>
                          {COST_TECH} LOC
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              )}

              {/* SHOP PHASE 2: BUY DOCS */}
              {phase === 2 && (
                <motion.div key="shop-2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="flex flex-col gap-2">
                  <div className="text-xs text-slate-500 mb-2 font-bold">Step 3: Purchase Documentation</div>
                  {DOC_GUIDELINES.map((d, i) => {
                    const purchased = purchasedDocs.includes(d);
                    const canAfford = loc >= COST_DOC;
                    
                    if (purchased) {
                      return (
                        <div key={i} className="p-2.5 rounded-lg border-2 border-green-400 bg-green-50 flex items-center gap-3 text-green-700">
                          <CheckCircle2 size={16} /> <span className="text-[11px] font-bold line-through opacity-70">{d}</span>
                        </div>
                      )
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handleBuyDoc(d)}
                        disabled={!canAfford}
                        className={`p-2.5 rounded-lg border-2 flex items-center justify-between text-left transition-all ${
                          canAfford 
                          ? `border-purple-400 bg-white hover:bg-slate-50 hover:border-purple-500 cursor-pointer shadow-sm` 
                          : 'border-slate-300 bg-slate-200 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-[11px] font-bold text-slate-800 leading-snug">{d}</span>
                        <div className={`text-[10px] font-black px-2 py-1 rounded shrink-0 ${canAfford ? 'bg-green-100 text-green-700' : 'bg-slate-300 text-slate-500'}`}>
                          {COST_DOC} LOC
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              )}

              {/* SHOP PHASE 3: SHIP IT */}
              {phase === 3 && (
                <motion.div key="shop-3" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="flex flex-col items-center justify-center h-full pt-8">
                  <Rocket size={64} className="text-amber-500 mb-4" />
                  <h3 className="text-xl font-black text-slate-800 text-center mb-2">READY TO DEPLOY</h3>
                  <p className="text-xs text-slate-600 text-center mb-6 px-4">All requirements met. Pay the final hosting fee to ship your project!</p>
                  
                  <button
                    onClick={handleShip}
                    disabled={loc < COST_SHIP}
                    className={`w-full py-5 rounded-xl font-black tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-1 border-4 ${
                      loc >= COST_SHIP
                      ? 'bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-300 hover:scale-105 shadow-md'
                      : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Ship Project</span>
                    <span className={`text-xs ${loc >= COST_SHIP ? 'text-amber-800' : 'text-slate-600'}`}>{COST_SHIP} LOC REQUIRED</span>
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
