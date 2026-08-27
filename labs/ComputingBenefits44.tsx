"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Globe2, Sun, Wind, Battery, Droplets, Sprout, Tractor, 
  Smartphone, Calculator, Building, Zap, Wrench, Car, 
  Trash, ArrowRight, RotateCcw, CheckCircle2, AlertCircle,
  Activity, Link2
} from "lucide-react";

interface Stat {
  carbon: number;
  food: number;
  economy: number;
  happiness: number;
}

interface Option {
  name: string;
  cost: number;
  effect: Partial<Stat>;
  icon: React.ReactNode;
}

interface Level {
  id: number;
  type?: 'standard' | 'matching';
  title: string;
  desc: string;
  budget: number;
  initialStats: Stat;
  goal: {
    carbon?: { min?: number; max?: number };
    food?: { min?: number; max?: number };
    economy?: { min?: number; max?: number };
    happiness?: { min?: number; max?: number };
  };
  options: Option[];
  matchingPairs?: { tech: string; benefit: string; icon: React.ReactNode }[];
}

const LEVELS: Level[] = [
  {
    id: 1,
    title: "Level 1: Climate Modeling",
    desc: "Use advanced computing to optimize renewable energy placement and reduce emissions.",
    budget: 3,
    initialStats: { carbon: 80, food: 50, economy: 50, happiness: 50 },
    goal: { carbon: { max: 40 } },
    options: [
      { name: "AI Solar Prediction", cost: 1, effect: { carbon: -15, economy: 10 }, icon: <Sun size={20} /> },
      { name: "Fluid Dynamics Wind Model", cost: 2, effect: { carbon: -30 }, icon: <Wind size={20} /> },
      { name: "Basic Fossil Fuel Generator", cost: 1, effect: { carbon: +20, economy: +10 }, icon: <Battery size={20} /> },
    ]
  },
  {
    id: 2,
    title: "Level 2: Precision Agriculture",
    desc: "Deploy IoT sensors and automated drones to maximize crop yield without wasting resources.",
    budget: 4,
    initialStats: { carbon: 40, food: 30, economy: 60, happiness: 50 },
    goal: { food: { min: 80 } },
    options: [
      { name: "Soil Moisture IoT", cost: 1, effect: { food: 20 }, icon: <Droplets size={20} /> },
      { name: "AI Crop Health Drones", cost: 2, effect: { food: 40, economy: 10 }, icon: <Sprout size={20} /> },
      { name: "Manual Old Tractor", cost: 1, effect: { food: 10, carbon: 10 }, icon: <Tractor size={20} /> },
    ]
  },
  {
    id: 3,
    title: "Level 3: Financial Inclusion",
    desc: "Leverage FinTech algorithms to make financial services accessible to everyone.",
    budget: 4,
    initialStats: { carbon: 45, food: 80, economy: 30, happiness: 40 },
    goal: { economy: { min: 80 }, happiness: { min: 75 } },
    options: [
      { name: "Mobile Money Network", cost: 2, effect: { economy: 30, happiness: 25 }, icon: <Smartphone size={20} /> },
      { name: "Algorithmic Risk Assessment", cost: 1, effect: { economy: 20, happiness: 10 }, icon: <Calculator size={20} /> },
      { name: "Brick & Mortar Bank", cost: 2, effect: { economy: 10, carbon: 10 }, icon: <Building size={20} /> }
    ]
  },
  {
    id: 4,
    type: 'matching',
    title: "Level 4: The Innovation Fair",
    desc: "Match the advanced computing technology to the real-world global benefit it provides.",
    budget: 0,
    initialStats: { carbon: 50, food: 50, economy: 50, happiness: 50 },
    goal: {},
    options: [],
    matchingPairs: [
      { tech: "IoT Soil Sensors", benefit: "Water Conservation", icon: <Droplets size={20} /> },
      { tech: "Algorithmic Risk Assessment", benefit: "Micro-loans for Unbanked", icon: <Calculator size={20} /> },
      { tech: "Fluid Dynamics Sim", benefit: "Wind Farm Placement", icon: <Wind size={20} /> },
      { tech: "Predictive Maintenance", benefit: "Factory Waste Reduction", icon: <Wrench size={20} /> }
    ]
  },
  {
    id: 5,
    title: "Boss Level: The Digital Twin",
    desc: "Create a virtual replica of the city to orchestrate smart grids, traffic, and waste management perfectly.",
    budget: 5,
    initialStats: { carbon: 60, food: 80, economy: 60, happiness: 50 },
    goal: { carbon: { max: 20 }, economy: { min: 90 }, happiness: { min: 90 } },
    options: [
      { name: "Smart Grid Balancing", cost: 2, effect: { carbon: -30, economy: 15 }, icon: <Zap size={20} /> },
      { name: "Predictive Maint.", cost: 1, effect: { economy: 15, happiness: 10 }, icon: <Wrench size={20} /> },
      { name: "Urban Traffic AI", cost: 1, effect: { carbon: -10, happiness: 20 }, icon: <Car size={20} /> },
      { name: "Waste Reduction Algo", cost: 1, effect: { carbon: -5, economy: 10, happiness: 10 }, icon: <Trash size={20} /> }
    ]
  }
];

const MatchingGame = ({ levelData, onComplete }: { levelData: Level, onComplete: () => void }) => {
  const { playClick, playSuccess, playError } = useLabAudio();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ tech: string, benefit: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pairs = levelData.matchingPairs || [];
  
  // Use a stable shuffle on mount
  const [shuffledTechs, setShuffledTechs] = useState<{id: string, icon: React.ReactNode}[]>([]);
  const [shuffledBenefits, setShuffledBenefits] = useState<string[]>([]);
  
  useEffect(() => {
    // Deterministic shuffle for standard feel or random
    const shuffledT = [...pairs].map(p => ({ id: p.tech, icon: p.icon })).sort(() => Math.random() - 0.5);
    const shuffledB = [...pairs].map(p => p.benefit).sort(() => Math.random() - 0.5);
    setShuffledTechs(shuffledT);
    setShuffledBenefits(shuffledB);
  }, []);

  const handleTechClick = (techId: string) => {
    if (matches.find(m => m.tech === techId)) return;
    if (playClick) playClick();
    setSelectedTech(techId);
    setErrorMsg(null);
  };

  const handleBenefitClick = (benefit: string) => {
    if (matches.find(m => m.benefit === benefit)) return;
    if (!selectedTech) {
      setErrorMsg("Select a Technology first!");
      return;
    }

    const validPair = pairs.find(p => p.tech === selectedTech && p.benefit === benefit);
    if (validPair) {
      if (playSuccess) playSuccess();
      const newMatches = [...matches, { tech: selectedTech, benefit }];
      setMatches(newMatches);
      setSelectedTech(null);
      setErrorMsg(null);
      
      if (newMatches.length === pairs.length) {
        setTimeout(onComplete, 1200); 
      }
    } else {
      if (playError) playError();
      setErrorMsg("Incorrect connection! Try again.");
      setSelectedTech(null);
    }
  };
  
  return (
    <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Link2 className="text-cyan-600" />
          Wire the Innovation Fair Booths
        </h3>
        {errorMsg && (
          <div className="text-rose-400 font-bold bg-rose-950/40 px-4 py-1 rounded-full border border-rose-900/50 text-sm">
            {errorMsg}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-stretch gap-8">
        
        {/* Technologies Column */}
        <div className="flex-1 space-y-4">
           <h4 className="text-cyan-400 font-bold mb-2 uppercase text-sm tracking-wider">1. Select Technology</h4>
           {shuffledTechs.map(t => {
             const isMatched = matches.some(m => m.tech === t.id);
             const isSelected = selectedTech === t.id;
             return (
               <button 
                 key={t.id} 
                 onClick={() => handleTechClick(t.id)}
                 disabled={isMatched}
                 className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${
                   isMatched ? 'opacity-40 border-emerald-500/30 bg-emerald-50' : 
                   isSelected ? 'border-cyan-500 bg-cyan-50 shadow-sm transform scale-[1.02]' : 
                   'border-slate-300 hover:border-cyan-400 bg-white hover:bg-slate-50'
                 }`}
               >
                 <span className={isMatched ? 'text-emerald-600' : isSelected ? 'text-cyan-600' : 'text-slate-500'}>{t.icon}</span>
                 <span className={`font-semibold ${isMatched ? 'text-emerald-600' : 'text-slate-800'}`}>{t.id}</span>
               </button>
             );
           })}
        </div>
        
        {/* Benefits Column */}
        <div className="flex-1 space-y-4">
           <h4 className="text-emerald-400 font-bold mb-2 uppercase text-sm tracking-wider">2. Connect to Benefit</h4>
           {shuffledBenefits.map(b => {
             const isMatched = matches.some(m => m.benefit === b);
             return (
               <button 
                 key={b} 
                 onClick={() => handleBenefitClick(b)}
                 disabled={isMatched}
                 className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                   isMatched ? 'border-emerald-500 bg-emerald-50 opacity-90' : 
                   'border-slate-300 hover:border-emerald-400 hover:bg-slate-50 bg-white'
                 }`}
               >
                 <span className={`font-semibold ${isMatched ? 'text-emerald-600' : 'text-slate-700'}`}>{b}</span>
                 {isMatched && <CheckCircle2 className="text-emerald-500" size={20} />}
               </button>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default function ComputingBenefits44() {
  const { playClick, playPop, playSuccess, playError } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  
  const [stats, setStats] = useState<Stat>(LEVELS[0].initialStats);
  const [budgetSpent, setBudgetSpent] = useState(0);
  const [purchases, setPurchases] = useState<number[]>([]);
  const [levelPassed, setLevelPassed] = useState(false);

  const levelData = LEVELS[currentLevel];
  const budgetRemaining = levelData.budget - budgetSpent;

  useEffect(() => {
    if (levelData.type === 'matching') return; // Handled internally by MatchingGame

    const goal = levelData.goal;
    let passed = true;
    
    if (goal.carbon?.max !== undefined && stats.carbon > goal.carbon.max) passed = false;
    if (goal.carbon?.min !== undefined && stats.carbon < goal.carbon.min) passed = false;
    if (goal.food?.max !== undefined && stats.food > goal.food.max) passed = false;
    if (goal.food?.min !== undefined && stats.food < goal.food.min) passed = false;
    if (goal.economy?.max !== undefined && stats.economy > goal.economy.max) passed = false;
    if (goal.economy?.min !== undefined && stats.economy < goal.economy.min) passed = false;
    if (goal.happiness?.max !== undefined && stats.happiness > goal.happiness.max) passed = false;
    if (goal.happiness?.min !== undefined && stats.happiness < goal.happiness.min) passed = false;

    if (passed && !levelPassed) {
      setLevelPassed(true);
      if (playSuccess) playSuccess();
    }
  }, [stats, levelData, levelPassed, playSuccess]);

  const handlePurchase = (idx: number, option: Option) => {
    if (budgetRemaining >= option.cost && !levelPassed) {
      if (playClick) playClick();
      setPurchases([...purchases, idx]);
      setBudgetSpent(b => b + option.cost);
      setStats(prev => ({
        carbon: Math.max(0, Math.min(100, prev.carbon + (option.effect.carbon || 0))),
        food: Math.max(0, Math.min(100, prev.food + (option.effect.food || 0))),
        economy: Math.max(0, Math.min(100, prev.economy + (option.effect.economy || 0))),
        happiness: Math.max(0, Math.min(100, prev.happiness + (option.effect.happiness || 0))),
      }));
    } else {
      if (playError) playError();
    }
  };

  const handleReset = () => {
    if (playPop) playPop();
    setStats(levelData.initialStats);
    setBudgetSpent(0);
    setPurchases([]);
    setLevelPassed(false);
  };

  const fullReset = () => {
    if (playPop) playPop();
    setCurrentLevel(0);
    setStats(LEVELS[0].initialStats);
    setBudgetSpent(0);
    setPurchases([]);
    setLevelPassed(false);
    setWin(false);
  };

  const nextLevel = () => {
    if (currentLevel === LEVELS.length - 1) {
      setWin(true);
      if (playSuccess) playSuccess();
    } else {
      if (playPop) playPop();
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      setStats(LEVELS[nextLvl].initialStats);
      setBudgetSpent(0);
      setPurchases([]);
      setLevelPassed(false);
    }
  };

  const isFailed = !levelPassed && budgetRemaining === 0 && levelData.type !== 'matching';

  const StatBar = ({ label, value, goalMin, goalMax, color }: { label: string, value: number, goalMin?: number, goalMax?: number, color: string }) => {
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-700 font-semibold">{label}</span>
          <span className="text-slate-500">
            {value}% 
            {goalMin !== undefined && ` (Goal: >${goalMin}%)`}
            {goalMax !== undefined && ` (Goal: <${goalMax}%)`}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
          <motion.div 
            className={`h-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
          {goalMax !== undefined && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10" style={{ left: `${goalMax}%` }} />
          )}
          {goalMin !== undefined && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500/80 z-10" style={{ left: `${goalMin}%` }} />
          )}
        </div>
      </div>
    );
  };

  if (win) {
    return (
      <LabShell labId="computingbenefits44" title="Computing Benefits" onReset={fullReset}>
        <Celebration isActive={win} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
            <Globe2 className="text-white w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Global Tech Innovator!
          </h2>
          <p className="text-slate-300 text-lg max-w-lg">
            You successfully navigated the Computing for Good Innovation Fair! Your algorithms are officially saving the planet, optimizing resources, and boosting global economies.
          </p>
          <button
            onClick={() => {
              setCurrentLevel(0);
              setStats(LEVELS[0].initialStats);
              setBudgetSpent(0);
              setPurchases([]);
              setLevelPassed(false);
              setWin(false);
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors mt-8"
          >
            Play Again
          </button>
        </motion.div>
      </LabShell>
    );
  }

  return (
    <LabShell 
      labId="computingbenefits44" 
      title="Computing Benefits"
      onReset={fullReset}
      instruction="1. Explore the positive impacts of computing on global health, environment, and society. 2. Interact with the Planet Health Simulator to apply computing solutions to global challenges. 3. Monitor the improvements in various metrics as you deploy new technologies. 4. Submit a final summary of how your computing interventions benefited the simulated planet."
    >
      <div className="max-w-5xl mx-auto space-y-3">
        
        {/* Header */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
              <Globe2 size={24} />
              {levelData.title}
            </h2>
            <p className="text-slate-600 text-sm mt-1">{levelData.desc}</p>
          </div>
          <div className="flex gap-2">
            {LEVELS.map((lvl, idx) => (
              <div
                key={lvl.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  idx < currentLevel
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : idx === currentLevel
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50 shadow-sm'
                    : 'border-slate-300 text-slate-500 bg-white'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {levelData.type === 'matching' ? (
          <MatchingGame levelData={levelData} onComplete={nextLevel} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Panel: Stats & Budget */}
            <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-cyan-600" />
                  Planet Health Stats
                </h3>
                <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-sm font-mono text-emerald-600 font-bold shadow-inner">
                  Compute Power: {budgetRemaining} CP
                </div>
              </div>

              <div className="flex-1 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <StatBar 
                  label="Carbon Emissions" 
                  value={stats.carbon} 
                  goalMax={levelData.goal.carbon?.max} 
                  color="bg-gradient-to-r from-rose-500 to-orange-500" 
                />
                <StatBar 
                  label="Food Security" 
                  value={stats.food} 
                  goalMin={levelData.goal.food?.min} 
                  color="bg-gradient-to-r from-emerald-500 to-green-400" 
                />
                <StatBar 
                  label="Economic Growth" 
                  value={stats.economy} 
                  goalMin={levelData.goal.economy?.min} 
                  color="bg-gradient-to-r from-blue-600 to-cyan-400" 
                />
                <StatBar 
                  label="Citizen Happiness" 
                  value={stats.happiness} 
                  goalMin={levelData.goal.happiness?.min} 
                  color="bg-gradient-to-r from-yellow-500 to-amber-400" 
                />
              </div>

              {/* Status Messages */}
              <AnimatePresence mode="popLayout">
                {levelPassed && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 size={20} />
                      Goals Met!
                    </div>
                    <button 
                      onClick={nextLevel}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      Next Level <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
                {isFailed && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <AlertCircle size={18} />
                      Out of Compute Power!
                    </div>
                    <button 
                      onClick={handleReset}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg flex items-center gap-1 transition-colors border border-slate-600"
                    >
                      <RotateCcw size={16} /> Retry
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Right Panel: Tech Interventions */}
            <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Zap size={18} className="text-yellow-500" />
                  Deploy Technologies
                </h3>
                {!levelPassed && purchases.length > 0 && (
                  <button 
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Reset Turn
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 flex-1">
                {levelData.options.map((option, idx) => {
                  const count = purchases.filter(p => p === idx).length;
                  const canAfford = budgetRemaining >= option.cost;
                  const isDisabled = levelPassed || (!canAfford && count === 0);

                  return (
                    <button
                      key={idx}
                      onClick={() => handlePurchase(idx, option)}
                      disabled={levelPassed || !canAfford}
                      className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                        count > 0 
                          ? 'bg-cyan-50 border-cyan-300' 
                          : canAfford
                          ? 'bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400'
                          : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 relative z-10">
                        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                          <span className={count > 0 ? 'text-cyan-600' : 'text-slate-500'}>{option.icon}</span>
                          {option.name}
                        </div>
                        <div className="text-xs font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-emerald-600">
                          {option.cost} CP
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2 relative z-10">
                        {Object.entries(option.effect).map(([stat, val]) => (
                          <span key={stat} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            val > 0 ? (stat === 'carbon' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400') 
                                  : (stat === 'carbon' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')
                          }`}>
                            {stat === 'carbon' 
                              ? (val > 0 ? `+${val}% Carbon (Bad)` : `${val}% Carbon (Good)`)
                              : `+${val}% ${stat.charAt(0).toUpperCase() + stat.slice(1)}`
                            }
                          </span>
                        ))}
                      </div>

                      {count > 0 && (
                        <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
                      )}
                      {count > 0 && (
                        <div className="absolute top-2 right-14 bg-cyan-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          x{count}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </LabShell>
  );
}
