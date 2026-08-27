"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  ShoppingCart, PlaySquare, Gamepad2, ShieldCheck, Server, Wifi,
  DollarSign, Rocket, AlertTriangle, CheckCircle2, RotateCcw,
  Layers, ArrowRight
} from "lucide-react";

type FeatureType = "functional" | "non-functional";

interface Feature {
  id: string;
  name: string;
  type: FeatureType;
  cost: number;
  icon: any;
  desc: string;
  requires?: string;
}

const FEATURES: Feature[] = [
  { id: 'f1', name: "E-Commerce Checkout", type: "functional", cost: 2000, icon: ShoppingCart, desc: "Allows users to purchase items.", requires: 'nf1' },
  { id: 'f2', name: "4K Video Streaming", type: "functional", cost: 2000, icon: PlaySquare, desc: "High-res video playback.", requires: 'nf2' },
  { id: 'f3', name: "Global Multiplayer", type: "functional", cost: 2000, icon: Gamepad2, desc: "Real-time interaction for users.", requires: 'nf3' },
  { id: 'nf1', name: "Payment Security (PCI)", type: "non-functional", cost: 1500, icon: ShieldCheck, desc: "Encrypts credit card data securely." },
  { id: 'nf2', name: "High Bandwidth Servers", type: "non-functional", cost: 1500, icon: Server, desc: "Handles massive data transfer." },
  { id: 'nf3', name: "Low-Latency Network", type: "non-functional", cost: 1500, icon: Wifi, desc: "Reduces ping for real-time actions." },
];

export default function RequirementsAnalysis9() {
  const { playPop, playSuccess, playError } = useLabAudio();
  const [level, setLevel] = useState(1);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [launchStatus, setLaunchStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const getLevelBudget = () => {
    if (level === 4) return 10500;
    return 3500;
  };
  
  const getLevelTarget = () => {
    if (level === 1) return ['f1'];
    if (level === 2) return ['f2'];
    if (level === 3) return ['f3'];
    return ['f1', 'f2', 'f3'];
  };

  const getInstruction = () => {
    if (level === 1) return "Level 1: Investors gave you $3,500 to build an E-Commerce Checkout app. Since you are handling credit cards, Payment Security is absolutely mandatory!";
    if (level === 2) return "Level 2: Budget $3,500. Build a 4K Video Streaming app. Streaming HD video requires High Bandwidth Servers to prevent buffering!";
    if (level === 3) return "Level 3: Budget $3,500. Build a Global Multiplayer Game. Gamers need real-time reactions, so a Low-Latency Network is critical!";
    if (level === 4) return "Level 4: You have $10,500. Build a Super App with ALL 3 features. You must buy every functional feature AND its corresponding infrastructure!";
    return "Lab Complete! You have mastered requirement balancing.";
  };


  const BUDGET = getLevelBudget();
  const currentCost = purchased.reduce((total, id) => {
    const f = FEATURES.find(f => f.id === id);
    return total + (f ? f.cost : 0);
  }, 0);
  const remainingBudget = BUDGET - currentCost;

  const toggleFeature = (id: string) => {
    if (launchStatus === "success") return;
    if (playPop) playPop();
    setPurchased(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
    setLaunchStatus("idle");
  };

  const handleLaunch = () => {
    if (purchased.length === 0) {
      setLaunchStatus("error");
      setErrorMessage("Ghost Town! You didn't build anything.");
      if (playError) playError();
      return;
    }

    if (currentCost > BUDGET) {
      setLaunchStatus("error");
      setErrorMessage(`Bankrupt! You exceeded your $${BUDGET.toLocaleString()} budget.`);
      if (playError) playError();
      return;
    }

    const funcs = purchased.filter(id => FEATURES.find(f => f.id === id)?.type === "functional");
    const nonFuncs = purchased.filter(id => FEATURES.find(f => f.id === id)?.type === "non-functional");

    if (funcs.length === 0) {
      setLaunchStatus("error");
      setErrorMessage("Ghost Town! You bought infrastructure, but no features. Users have nothing to do!");
      if (playError) playError();
      return;
    }

    // Check if they built the correct target for the level
    const targets = getLevelTarget();
    for (const t of targets) {
      if (!funcs.includes(t)) {
        setLaunchStatus("error");
        setErrorMessage("Wrong App! You didn't build the functional requirement requested by investors.");
        if (playError) playError();
        return;
      }
    }

    // Check dependencies
    if (funcs.includes('f1') && !nonFuncs.includes('nf1')) {
      setLaunchStatus("error");
      setErrorMessage("HACKED! You built a checkout system without Payment Security.");
      if (playError) playError();
      return;
    }

    if (funcs.includes('f2') && !nonFuncs.includes('nf2')) {
      setLaunchStatus("error");
      setErrorMessage("SERVER CRASH! You added 4K Video Streaming without High Bandwidth Servers.");
      if (playError) playError();
      return;
    }

    if (funcs.includes('f3') && !nonFuncs.includes('nf3')) {
      setLaunchStatus("error");
      setErrorMessage("LAG SPIKE! You launched Global Multiplayer on a slow network. The users rage-quit.");
      if (playError) playError();
      return;
    }

    // Success
    setLaunchStatus("success");
    if (playSuccess) playSuccess();
  };

  const handleNextLevel = () => {
    if (level < 5) setLevel(level + 1);
    setPurchased([]);
    setLaunchStatus("idle");
    if (playPop) playPop();
  };

  const handleReset = () => {
    setLevel(1);
    setPurchased([]);
    setLaunchStatus("idle");
    if (playPop) playPop();
  };

  return (
    <LabShell
      labId="requirementsanalysis9"
      title="Requirements Analysis"
      theme="studio"
      compact={true}
      instruction="1. Analyze the project brief provided in the simulation sandbox. 2. Interview the virtual stakeholders to gather system requirements. 3. Document the functional and non-functional requirements. 4. Submit your final requirements specification for review."
      onReset={handleReset}
    >
      <Celebration isActive={level === 5} onReplay={handleReset} />
      
      <div className="flex flex-col md:flex-row h-full w-full max-w-6xl mx-auto gap-6 p-4">
        
        {/* Left: The Store */}
        <div className="flex-[1.2] flex flex-col gap-4">
          <div className="flex justify-between items-center bg-white rounded-xl p-3 border-2 border-slate-700/50 shadow-lg shrink-0">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Layers size={20} /> Feature Store</h2>
            <div className={`text-xl font-black flex items-center gap-1 ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              <DollarSign size={20} /> {remainingBudget.toLocaleString()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 overflow-hidden h-full">
            {FEATURES.map(f => {
              const isSelected = purchased.includes(f.id);
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFeature(f.id)}
                  disabled={level === 5}
                  className={`text-left p-2 rounded-xl border-2 transition-all flex flex-col items-start gap-1 h-full ${
                    isSelected 
                      ? f.type === 'functional' ? 'bg-sky-500/20 border-sky-500' : 'bg-purple-500/20 border-purple-500'
                      : 'bg-white border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className={`p-1.5 rounded-lg ${isSelected ? (f.type === 'functional' ? 'bg-sky-500 text-white' : 'bg-purple-500 text-white') : 'bg-slate-200 text-slate-700'}`}>
                      <Icon size={16} />
                    </div>
                    <span className="font-bold text-slate-700 flex items-center text-sm"><DollarSign size={12}/>{f.cost}</span>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className={`font-bold text-sm leading-tight ${isSelected ? (f.type === 'functional' ? 'text-sky-700' : 'text-purple-700') : 'text-slate-800'}`}>
                      {f.name}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{f.desc}</p>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600 w-full mt-auto pt-1.5 border-t border-slate-800/50">
                    {f.type}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: The Blueprint & Launch */}
        <div className="flex-[0.8] flex flex-col gap-3">
          <div className="bg-white rounded-xl p-4 border-2 border-slate-700/50 shadow-lg flex-1 flex flex-col relative overflow-hidden">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">App Blueprint</h2>
            
            <div className="flex-1 flex flex-col gap-2">
              <div className="bg-white border border-slate-700 rounded-lg p-3 flex-1 flex flex-col min-h-0">
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-2 shrink-0">Functional Layer (Features)</h3>
                <div className="flex flex-wrap gap-1.5 overflow-y-auto content-start flex-1 pr-1">
                  <AnimatePresence>
                    {purchased.map(id => {
                      const f = FEATURES.find(x => x.id === id);
                      if (f?.type !== 'functional') return null;
                      const Icon = f.icon;
                      return (
                        <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} key={id} className="bg-sky-100 text-sky-800 border border-sky-300 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                          <Icon size={14} /> {f.name}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {purchased.filter(id => FEATURES.find(f => f.id === id)?.type === 'functional').length === 0 && (
                    <span className="text-slate-600 text-sm italic">No features installed...</span>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-700 rounded-lg p-3 flex-1 flex flex-col min-h-0">
                <h3 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-2 shrink-0">Non-Functional Layer (Infrastructure)</h3>
                <div className="flex flex-wrap gap-1.5 overflow-y-auto content-start flex-1 pr-1">
                  <AnimatePresence>
                    {purchased.map(id => {
                      const f = FEATURES.find(x => x.id === id);
                      if (f?.type !== 'non-functional') return null;
                      const Icon = f.icon;
                      return (
                        <motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} key={id} className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                          <Icon size={14} /> {f.name}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {purchased.filter(id => FEATURES.find(f => f.id === id)?.type === 'non-functional').length === 0 && (
                    <span className="text-slate-600 text-sm italic">No infrastructure installed...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Launch Status Overlay */}
            <AnimatePresence>
              {launchStatus !== "idle" && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute bottom-6 left-6 right-6 rounded-xl p-4 border-2 shadow-2xl flex items-start gap-4 ${
                    launchStatus === 'success' ? 'bg-emerald-900/90 border-emerald-500 text-emerald-100' : 
                    'bg-red-900/90 border-red-500 text-red-100'
                  }`}
                >
                  {launchStatus === 'success' ? <CheckCircle2 size={32} className="text-emerald-400 shrink-0 mt-1" /> : <AlertTriangle size={32} className="text-red-400 shrink-0 mt-1" />}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{launchStatus === 'success' ? "Launch Successful!" : "Launch Failed!"}</h3>
                    {launchStatus !== 'success' && (
                      <p className="text-sm opacity-90">{errorMessage}</p>
                    )}
                    {launchStatus === 'success' && level < 4 && (
                      <button onClick={handleNextLevel} className="mt-3 bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 transition-colors flex items-center gap-2">
                        Next Level <ArrowRight size={16} />
                      </button>
                    )}
                    {launchStatus === 'success' && level === 4 && (
                      <button onClick={handleNextLevel} className="mt-3 bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 transition-colors flex items-center gap-2">
                        Complete Lab <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          
          <button 
            onClick={handleLaunch}
            disabled={launchStatus === "success" || level === 5}
            className="bg-emerald-500 text-slate-900 font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Rocket size={24} /> LAUNCH APP
          </button>
        </div>
      </div>
    </LabShell>
  );
}
