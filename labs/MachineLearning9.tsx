"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Brain, Activity, RotateCcw, AlertTriangle, Layers, Network, LineChart, FileQuestion, CheckCircle2, XCircle, TrendingUp, Filter } from "lucide-react";

type LearningRate = 'none' | 'slow' | 'optimal' | 'fast';
type FailureState = 'diverged' | 'stagnated' | null;

// ============================================================================
// MISSION 1: GRADIENT DESCENT (Hyper-Parameter Tuning)
// ============================================================================

const M1_USE_CASES = [
  { id: 1, title: "Spam Filter", redLabel: "Spam Email", blueLabel: "Safe Inbox", rColor: "#ef4444", bColor: "#3b82f6" }
];

function Mission1Gradient({ onWin }: { onWin: () => void }) {
  const { playPop, playSuccess, playZap } = useLabAudio();
  const [epoch, setEpoch] = useState(0);
  const [learningRate, setLearningRate] = useState<LearningRate>('none');
  const [failureState, setFailureState] = useState<FailureState>(null);
  const [points, setPoints] = useState<{x: number, y: number, type: string}[]>([]);
  
  useEffect(() => {
    const p = [];
    for(let i=0; i<30; i++) {
      p.push({ x: 100 + Math.random()*250, y: 100 + Math.random()*150, type: "RED" });
      p.push({ x: 550 + Math.random()*250, y: 250 + Math.random()*150, type: "BLUE" });
    }
    setPoints(p);
  }, []);

  const getLineParams = (e: number, lr: LearningRate) => {
    const x1_start = 0, y1_start = 100, x2_start = 900, y2_start = 100;
    const x1_end = 200, y1_end = 500, x2_end = 700, y2_end = 0;

    if (lr === 'fast') {
       if (e === 0) return { x1: x1_start, y1: y1_start, x2: x2_start, y2: y2_start };
       const intensity = e * 120; 
       return {
         x1: x1_start + (Math.sin(e * 2) * intensity), y1: y1_start + (Math.cos(e * 3) * intensity),
         x2: x2_start - (Math.cos(e * 2) * intensity), y2: y2_start - (Math.sin(e * 3) * intensity)
       };
    }
    let t = lr === 'slow' ? (e / 10) * 0.15 : e / 10;
    return {
      x1: x1_start + (x1_end - x1_start) * t, y1: y1_start + (y1_end - y1_start) * t,
      x2: x2_start + (x2_end - x2_start) * t, y2: y2_start + (y2_end - y2_start) * t
    };
  };

  const line = getLineParams(epoch, learningRate);
  const isTrained = epoch === 10 && learningRate === 'optimal';
  const isDiverging = learningRate === 'fast' && epoch > 0;
  
  let lossStr = "1.0000";
  if (learningRate === 'optimal') lossStr = Math.max(0, 1.0 - (epoch / 10)).toFixed(4);
  else if (learningRate === 'slow') lossStr = (1.0 - ((epoch / 10) * 0.15)).toFixed(4);
  else if (learningRate === 'fast') lossStr = (1.0 + (epoch * epoch * 5.3)).toFixed(4);

  const takeStep = () => {
    if (learningRate === 'none' || isTrained || failureState || epoch >= 10) return;
    const nextEpoch = epoch + 1;
    setEpoch(nextEpoch);
    if (learningRate === 'fast') playZap(); else playPop();

    if (nextEpoch >= 10) {
        if (learningRate === 'optimal') { playSuccess(); onWin(); } 
        else if (learningRate === 'slow') setFailureState('stagnated');
        else if (learningRate === 'fast') setFailureState('diverged');
    }
  };

  const reset = () => { setEpoch(0); setLearningRate('none'); setFailureState(null); };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 bg-white rounded-3xl overflow-hidden relative border-4 border-slate-200 shadow-sm">
        <svg viewBox="0 0 900 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="m1-zone" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
            </linearGradient>
            <pattern id="m1-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <motion.rect width="900" height="400" fill="url(#m1-grid)" animate={isDiverging ? { x: [-4, 4, -4, 0], y: [4, -4, 4, 0] } : {}} transition={{ repeat: Infinity, duration: 0.1 }} />
          {isTrained && <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 1 }} width="900" height="400" fill="url(#m1-zone)" />}
          
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="6" fill={p.type === "RED" ? "#ef4444" : "#3b82f6"} stroke="#fff" strokeWidth="1.5" />
          ))}
          
          <motion.line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={isTrained ? "#10b981" : isDiverging ? "#ef4444" : "#0ea5e9"} strokeWidth={isTrained ? 8 : 6} strokeLinecap="round" animate={{ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 }} transition={{ type: "spring", stiffness: isDiverging ? 500 : 80 }} />
          
          <g transform="translate(20, 20)">
            <rect width="160" height="70" fill="#fff" rx="8" stroke="#cbd5e1" strokeWidth="3" />
            <text x="80" y="25" fill="#64748b" fontSize="11" fontWeight="900" textAnchor="middle">LOSS FUNCTION</text>
            <text x="80" y="55" fill={isTrained ? "#10b981" : isDiverging ? "#ef4444" : "#334155"} fontSize="24" fontFamily="monospace" fontWeight="900" textAnchor="middle">{lossStr}</text>
          </g>
        </svg>
      </div>

      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex-1 w-full flex flex-col items-center md:items-start min-w-0">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Step Size (Learning Rate α)</span>
           <div className="flex gap-2 w-full max-w-lg">
              {['slow', 'optimal', 'fast'].map((rate) => (
                <button key={rate} onClick={() => { setLearningRate(rate as LearningRate); setEpoch(0); setFailureState(null); }} className={`flex-1 py-3 font-black uppercase text-[10px] sm:text-xs rounded-xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${learningRate === rate ? 'bg-sky-500 border-sky-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100'}`}>
                  {rate === 'slow' ? 'Baby Steps' : rate === 'optimal' ? 'Walking' : 'Jetpack'}
                </button>
              ))}
           </div>
        </div>
        <div className="w-full md:w-auto shrink-0 flex">
          <button onClick={takeStep} disabled={learningRate === 'none' || isTrained || !!failureState} className="flex-1 md:flex-none px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-b-4 bg-emerald-500 border-emerald-700 text-white active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0">
            TAKE STEP ({epoch}/10)
          </button>
        </div>
      </div>

      <AnimatePresence>
        {failureState && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2rem] text-center max-w-md">
              <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">{failureState === 'diverged' ? 'Jetpack Divergence!' : 'Time Ran Out!'}</h2>
              <p className="text-slate-600 mb-6 text-sm">{failureState === 'diverged' ? 'You took such massive steps you overshot the valley.' : 'You took baby steps and ran out of time.'}</p>
              <button onClick={reset} className="w-full bg-red-600 text-white font-black py-3 rounded-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1">RESTART</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MISSION 2: THE IMPOSSIBLE LINE (Hidden Layers)
// ============================================================================

function Mission2Hidden({ onWin }: { onWin: () => void }) {
  const { playPop, playZap, playSuccess } = useLabAudio();
  const [stage, setStage] = useState<'start' | 'failed' | 'hidden_added' | 'won'>('start');
  const [points, setPoints] = useState<{x: number, y: number, type: string}[]>([]);

  useEffect(() => {
    const p = [];
    for(let i=0; i<30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 60; // Inner cluster
      p.push({ x: 450 + Math.cos(angle)*r, y: 200 + Math.sin(angle)*r, type: "RED" });
      
      const r2 = 120 + Math.random() * 60; // Outer ring
      p.push({ x: 450 + Math.cos(angle)*r2, y: 200 + Math.sin(angle)*r2, type: "BLUE" });
    }
    setPoints(p);
  }, []);

  const handleTrain = () => {
    if (stage === 'start') {
      playZap();
      setStage('failed');
    } else if (stage === 'hidden_added') {
      playSuccess();
      setStage('won');
      onWin();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex-1 bg-white rounded-3xl overflow-hidden relative border-4 border-slate-200 shadow-sm">
        <svg viewBox="0 0 900 400" className="w-full h-full">
          <pattern id="m2-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
          </pattern>
          <rect width="900" height="400" fill="url(#m2-grid)" />

          {/* Boundaries */}
          {stage === 'won' && (
            <motion.circle initial={{ r: 0 }} animate={{ r: 100 }} cx="450" cy="200" fill="#ef4444" fillOpacity="0.1" stroke="#10b981" strokeWidth="6" />
          )}
          {(stage === 'failed' || stage === 'hidden_added') && (
             <motion.line x1="0" y1="200" x2="900" y2="200" stroke="#ef4444" strokeWidth="6" initial={{ opacity: 0 }} animate={{ opacity: stage === 'failed' ? 1 : 0 }} />
          )}

          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="6" fill={p.type === "RED" ? "#ef4444" : "#3b82f6"} stroke="#fff" strokeWidth="1.5" />
          ))}
        </svg>
      </div>

      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex-1 w-full flex flex-col justify-center min-w-0">
           <h3 className="font-black text-slate-800 uppercase tracking-wider mb-1">Bullseye Dataset</h3>
           <p className="text-xs text-slate-500 font-bold">A single straight line cannot separate a circle.</p>
        </div>
        <div className="w-full md:w-auto shrink-0 flex gap-2">
          {stage === 'failed' && (
            <button onClick={() => { playPop(); setStage('hidden_added'); }} className="flex-1 md:flex-none px-6 py-4 rounded-xl font-black text-sm border-b-4 bg-sky-500 border-sky-700 text-white active:border-b-0 active:translate-y-1">
              + ADD HIDDEN LAYER
            </button>
          )}
          <button onClick={handleTrain} disabled={stage === 'won' || stage === 'failed'} className="flex-1 md:flex-none px-8 py-4 rounded-xl font-black text-sm border-b-4 bg-emerald-500 border-emerald-700 text-white active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0">
            TRAIN NETWORK
          </button>
        </div>
      </div>

      <AnimatePresence>
        {stage === 'failed' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3">
             <AlertTriangle className="text-red-500"/> Mathematics Error: A straight line cannot solve a circular problem.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MISSION 3: THE OVERFITTING TRAP
// ============================================================================

function Mission3Overfit({ onWin }: { onWin: () => void }) {
  const { playPop, playZap, playSuccess } = useLabAudio();
  const [model, setModel] = useState<'none' | 'overfit' | 'generalize'>('none');
  const [tested, setTested] = useState(false);

  // Smooth quadratic curve for generalization
  const smoothPath = "M 50,300 Q 450,-50 850,300";
  // Jagged path for overfit
  const overfitPath = "M 50,300 L 150,150 L 250,220 L 350,100 L 450,180 L 550,80 L 650,200 L 750,120 L 850,300";

  const handleTest = () => {
    setTested(true);
    if (model === 'generalize') {
       playSuccess();
       setTimeout(onWin, 1000);
    } else {
       playZap();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex-1 bg-white rounded-3xl overflow-hidden relative border-4 border-slate-200 shadow-sm">
        <svg viewBox="0 0 900 400" className="w-full h-full">
          <pattern id="m3-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
          </pattern>
          <rect width="900" height="400" fill="url(#m3-grid)" />
          
          {model === 'overfit' && <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d={overfitPath} fill="none" stroke="#ef4444" strokeWidth="4" />}
          {model === 'generalize' && <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d={smoothPath} fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />}
          
          {/* Base Training Points */}
          {[ [50,300], [150,150], [250,220], [350,100], [450,180], [550,80], [650,200], [750,120], [850,300] ].map((p, i) => (
             <circle key={`base-${i}`} cx={p[0]} cy={p[1]} r="7" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
          ))}

          {/* Test Points (Dropped Later) */}
          {tested && [ [100,210], [200,160], [300,130], [400,120], [500,110], [600,120], [700,150], [800,210] ].map((p, i) => (
             <motion.circle initial={{ r: 0 }} animate={{ r: 7 }} key={`test-${i}`} cx={p[0]} cy={p[1]} r="7" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          ))}
        </svg>
      </div>

      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
        {!tested ? (
          <>
            <button onClick={() => { setModel('overfit'); playPop(); }} className={`flex-1 py-3 rounded-xl font-black text-sm border-b-4 active:border-b-0 active:translate-y-1 ${model === 'overfit' ? 'bg-sky-500 border-sky-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>1. MEMORIZE (Overfit)</button>
            <button onClick={() => { setModel('generalize'); playPop(); }} className={`flex-1 py-3 rounded-xl font-black text-sm border-b-4 active:border-b-0 active:translate-y-1 ${model === 'generalize' ? 'bg-sky-500 border-sky-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>1. LEARN (Generalize)</button>
            <button onClick={handleTest} disabled={model === 'none'} className="flex-1 py-3 rounded-xl font-black text-sm border-b-4 bg-emerald-500 border-emerald-700 text-white active:border-b-0 active:translate-y-1 disabled:opacity-50">2. DROP REAL-WORLD TEST</button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <p className="font-black text-slate-800 px-4">{model === 'overfit' ? 'FAILURE: The squiggly line memorized the practice test but failed the real one!' : 'SUCCESS: The smooth line learned the general pattern!'}</p>
            <button onClick={() => { setTested(false); setModel('none'); }} className="px-6 py-3 rounded-xl bg-slate-200 border-b-4 border-slate-300 font-black">RETRY</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MISSION 4: FEATURE ENGINEERING
// ============================================================================

function Mission4Features({ onWin }: { onWin: () => void }) {
  const { playPop, playZap, playSuccess } = useLabAudio();
  const [f1, setF1] = useState('sqft');
  const [f2, setF2] = useState('zodiac');
  const [tested, setTested] = useState(false);

  const getFeedback = () => {
    if ((f1 === 'sqft' && f2 === 'beds') || (f1 === 'beds' && f2 === 'sqft')) {
       return { success: true, title: "High Accuracy", desc: "Square Footage and Bedrooms are highly predictive of house prices!" };
    }
    if (f1 === f2) {
       return { success: false, title: "Redundant Data", desc: "You selected the exact same sensor twice! The AI needs diverse data to make predictions." };
    }
    
    const isF1Bad = f1 === 'zodiac' || f1 === 'color';
    const isF2Bad = f2 === 'zodiac' || f2 === 'color';
    
    if (isF1Bad && isF2Bad) {
       return { success: false, title: "Garbage In = Garbage Out", desc: "Zodiac signs and paint color have zero correlation to house prices. The AI learned nothing." };
    }
    
    return { success: false, title: "Corrupted Data", desc: "One of your inputs is good, but the other is completely random! The AI is too confused to predict prices." };
  };

  const fb = getFeedback();

  const handleTest = () => {
    setTested(true);
    if (fb.success) { playSuccess(); setTimeout(onWin, 1500); }
    else playZap();
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex-1 bg-white rounded-3xl border-4 border-slate-200 shadow-sm flex items-center justify-center p-8">
         {tested ? (
           <div className="text-center">
             {fb.success ? <LineChart size={100} className="text-emerald-500 mx-auto mb-4" /> : <Network size={100} className="text-red-500 mx-auto mb-4 opacity-50" />}
             <h2 className={`text-3xl font-black uppercase tracking-widest ${fb.success ? 'text-emerald-600' : 'text-red-500'}`}>{fb.title}</h2>
             <p className="mt-2 text-slate-500 font-bold">{fb.desc}</p>
           </div>
         ) : (
           <div className="text-center">
             <Filter size={64} className="text-sky-500 mx-auto mb-4" />
             <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Select Input Data</h2>
             <p className="mt-2 text-slate-500">Choose the two best sensors to predict Housing Prices.</p>
           </div>
         )}
      </div>

      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4 min-w-0">
          <select value={f1} onChange={(e) => { setF1(e.target.value); setTested(false); playPop(); }} className="flex-1 w-full min-w-0 p-3 rounded-xl border-2 border-slate-300 font-black text-slate-700 bg-slate-50 outline-none focus:border-sky-500 transition-colors">
            <option value="sqft">Square Footage</option>
            <option value="color">House Paint Color</option>
            <option value="zodiac">Owner's Zodiac Sign</option>
            <option value="beds">Number of Bedrooms</option>
          </select>
          <span className="font-black text-slate-400 text-xl shrink-0">+</span >
          <select value={f2} onChange={(e) => { setF2(e.target.value); setTested(false); playPop(); }} className="flex-1 w-full min-w-0 p-3 rounded-xl border-2 border-slate-300 font-black text-slate-700 bg-slate-50 outline-none focus:border-sky-500 transition-colors">
            <option value="zodiac">Owner's Zodiac Sign</option>
            <option value="beds">Number of Bedrooms</option>
            <option value="sqft">Square Footage</option>
            <option value="color">House Paint Color</option>
          </select>
        </div>
        <div className="w-full md:w-auto shrink-0 flex">
          <button onClick={handleTest} className="flex-1 md:flex-none px-8 py-4 rounded-xl font-black text-sm border-b-4 bg-emerald-500 border-emerald-700 text-white active:border-b-0 active:translate-y-1">ANALYZE DATA</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MISSION 5: ASSESSMENT (AI Architect)
// ============================================================================

const Q_POOL = [
  { text: "Filter emails into 'Spam' or 'Inbox'", type: "class" },
  { text: "Estimate a house's selling price in dollars", type: "reg" },
  { text: "Identify a Stop Sign in a photo", type: "class" },
  { text: "Predict tomorrow's exact temperature", type: "reg" },
  { text: "Diagnose a tumor as Malignant or Benign", type: "class" }
];

function Mission5Assessment({ onComplete }: { onComplete: () => void }) {
  const { playPop, playSuccess, playZap } = useLabAudio();
  const [qIndex, setQIndex] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = (type: string) => {
    if (feedback || qIndex >= Q_POOL.length) return;
    
    if (type === Q_POOL[qIndex].type) {
       setFeedback('correct');
       playPop();
       setTimeout(() => {
          setFeedback(null);
          if (qIndex + 1 >= Q_POOL.length) { playSuccess(); onComplete(); }
          else setQIndex(q => q + 1);
       }, 1000);
    } else {
       setFeedback('wrong');
       playZap();
       setStrikes(s => s + 1);
       setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (qIndex >= Q_POOL.length) {
     return <div className="flex flex-col items-center justify-center h-full"><CheckCircle2 size={80} className="text-emerald-500 mb-6 drop-shadow-md" /><h2 className="text-5xl font-black text-emerald-600 uppercase tracking-widest text-center">Architect Certified</h2></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-8">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => ( <XCircle key={i} size={32} className={i < strikes ? "text-red-500" : "text-slate-200"} /> ))}
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl border-4 border-slate-200 max-w-2xl w-full text-center relative overflow-hidden">
        {feedback === 'correct' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-emerald-500 flex items-center justify-center"><CheckCircle2 size={64} className="text-white"/></motion.div>}
        {feedback === 'wrong' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-500 flex items-center justify-center"><XCircle size={64} className="text-white"/></motion.div>}
        
        <FileQuestion size={48} className="text-sky-500 mx-auto mb-6" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Architect Job Ticket {qIndex+1}/5</p>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">{Q_POOL[qIndex].text}</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl mt-4">
        <button onClick={() => handleAnswer('class')} className="flex-1 bg-white hover:bg-sky-50 border-4 border-sky-200 border-b-8 rounded-[2rem] p-6 text-center active:border-b-4 active:translate-y-1 transition-all">
          <h3 className="text-xl font-black text-sky-600 uppercase tracking-widest">Classification</h3>
          <p className="text-sm font-bold text-slate-500 mt-1">(Sorting into categories)</p>
        </button>
        <button onClick={() => handleAnswer('reg')} className="flex-1 bg-white hover:bg-violet-50 border-4 border-violet-200 border-b-8 rounded-[2rem] p-6 text-center active:border-b-4 active:translate-y-1 transition-all">
          <h3 className="text-xl font-black text-violet-600 uppercase tracking-widest">Regression</h3>
          <p className="text-sm font-bold text-slate-500 mt-1">(Predicting a number)</p>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LAB SHELL
// ============================================================================

const TABS = [
  { id: 'm1', title: '1. Gradient Descent', icon: Activity },
  { id: 'm2', title: '2. Hidden Layers', icon: Layers },
  { id: 'm3', title: '3. Overfitting', icon: TrendingUp },
  { id: 'm4', title: '4. Data Quality', icon: Filter },
  { id: 'm5', title: '5. Assessment', icon: Brain }
];

export default function MachineLearning9() {
  const { reportComplete } = useLMSBridge("machinelearning9");
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState([false, false, false, false, false]);

  const completeTab = (index: number) => {
    const newCompleted = [...completedTabs];
    newCompleted[index] = true;
    setCompletedTabs(newCompleted);
    if (newCompleted.every(Boolean)) reportComplete({ points: 100 });
    else setTimeout(() => setActiveTab(t => Math.min(4, t + 1)), 1500);
  };

  return (
    <LabShell 
      labId="machinelearning9" 
      theme="ocean" 
      title="Neural Networks Architecture"
      onReset={() => { setActiveTab(0); setCompletedTabs([false,false,false,false,false]); }}
      instruction="Complete all 5 missions to become a certified AI Architect. Learn how neural networks learn, why they fail, and how to fix them." 
      compact
    >
      <Celebration isActive={completedTabs.every(Boolean)} message="Master Architect! You have mastered the fundamentals of Neural Networks and Machine Learning." onReplay={() => {}} />

      <div className="w-full flex flex-col flex-1 min-h-0 max-w-6xl mx-auto relative z-10 pt-2 gap-4">
        
        {/* Top Navigation Tabs */}
        <div className="shrink-0 w-full grid grid-cols-5 gap-2">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isCompleted = completedTabs[i];
            const isActive = activeTab === i;
            return (
              <button key={tab.id} onClick={() => setActiveTab(i)} className={`flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl border-b-4 transition-all ${isActive ? 'bg-sky-500 border-sky-700 text-white shadow-md -translate-y-1' : isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                {isCompleted ? <CheckCircle2 size={20} className="mb-1" /> : <Icon size={20} className="mb-1" />}
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center leading-tight hidden sm:block">{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Mission Workspace */}
        <div className="flex-1 min-h-0 bg-slate-50/50 rounded-[2rem] p-2 sm:p-4 border-2 border-slate-100">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full w-full">
              {activeTab === 0 && <Mission1Gradient onWin={() => completeTab(0)} />}
              {activeTab === 1 && <Mission2Hidden onWin={() => completeTab(1)} />}
              {activeTab === 2 && <Mission3Overfit onWin={() => completeTab(2)} />}
              {activeTab === 3 && <Mission4Features onWin={() => completeTab(3)} />}
              {activeTab === 4 && <Mission5Assessment onComplete={() => completeTab(4)} />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </LabShell>
  );
}
