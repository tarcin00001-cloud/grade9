import os

content = """\"\"\"
DeepLearning9.tsx
Grade 9 Educational Lab
Theme: Ocean (High Contrast)
\"\"\"
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Brain, Dog, Cookie, TrendingDown, Layers, Zap, CheckCircle, AlertTriangle, Play, ChevronRight, Info } from "lucide-react";

type Phase = "learn" | "training_fail" | "failed" | "feedback" | "improving" | "training_success" | "success";

const EPOCH_OPTIONS = [1, 10, 50, 100];

export default function DeepLearning9() {
  const { reportComplete } = useLMSBridge("deeplearning9");
  const { playPop, playSuccess, playError, playZap } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("learn");
  const [epochs, setEpochs] = useState<number>(1);
  const [hiddenLayers, setHiddenLayers] = useState<number>(1);
  
  const [currentLoss, setCurrentLoss] = useState<number>(0.89);
  const [lossHistory, setLossHistory] = useState<number[]>([0.89]);
  const [hasWon, setHasWon] = useState(false);

  const isTraining = phase === "training_fail" || phase === "training_success";

  // Neural Network Node Generator
  const getNetworkData = () => {
    const cols: {id: string, x: number, nodes: number[]}[] = [];
    const width = 1000;
    
    // Input Layer (3 nodes - e.g., RGB channels of image)
    cols.push({ id: 'in', x: 100, nodes: [100, 200, 300] });
    
    // Hidden Layers
    const spacing = (900 - 100) / (hiddenLayers + 1);
    for(let i = 0; i < hiddenLayers; i++) {
       cols.push({ id: `h${i}`, x: 100 + spacing * (i + 1), nodes: [60, 140, 220, 300, 380] });
    }
    
    // Output Layer (2 nodes - Dog, Muffin)
    cols.push({ id: 'out', x: 900, nodes: [150, 250] });
    
    // Generate Connections
    const lines: {id: string, x1: number, y1: number, x2: number, y2: number}[] = [];
    for (let i = 0; i < cols.length - 1; i++) {
        const currentCol = cols[i];
        const nextCol = cols[i+1];
        currentCol.nodes.forEach((y1, i1) => {
            nextCol.nodes.forEach((y2, i2) => {
                lines.push({ 
                    id: `${currentCol.id}-${i1}-${nextCol.id}-${i2}`, 
                    x1: currentCol.x, y1, x2: nextCol.x, y2 
                });
            });
        });
    }
    
    return { cols, lines };
  };

  const { cols, lines } = getNetworkData();

  const handleTrain = () => {
    if (isTraining) return;
    playZap();
    
    // Win Condition: Max layers (3) and high epochs (100)
    const willWin = hiddenLayers === 3 && epochs === 100;
    
    // Scale training time based on epochs to teach computational cost
    const steps = 10;
    const totalTime = 500 + (epochs * 25); // 1 epoch = ~525ms, 100 epochs = ~3000ms
    const stepTime = totalTime / steps;
    
    setPhase(willWin ? "training_success" : "training_fail");
    
    let currentStep = 0;
    const newHistory = [0.89];
    
    const interval = setInterval(() => {
      currentStep++;
      let nextLoss;
      
      if (willWin) {
        // Successful convergence to ~2%
        nextLoss = Math.max(0.02, 0.89 * (1 - (currentStep / steps)) - (Math.random() * 0.05));
      } else {
        // Fails to converge, gets stuck around 75%
        const progress = currentStep / steps;
        nextLoss = Math.max(0.70, 0.89 - (progress * 0.15) + (Math.random() * 0.05));
      }
      
      newHistory.push(nextLoss);
      setLossHistory([...newHistory]);
      setCurrentLoss(nextLoss);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        if (willWin) {
          setPhase("success");
          playSuccess();
          setTimeout(() => {
            setHasWon(true);
            reportComplete();
          }, 3000);
        } else {
          setPhase("failed");
          playError();
          setTimeout(() => {
            setPhase("feedback");
          }, 1500);
        }
      }
    }, stepTime);
  };

  const handleReset = () => {
    playPop();
    setPhase("learn");
    setEpochs(1);
    setHiddenLayers(1);
    setCurrentLoss(0.89);
    setLossHistory([0.89]);
    setHasWon(false);
  };

  const renderSparkline = () => {
    const w = 100;
    const h = 24;
    const points = lossHistory.map((loss, i) => {
      const x = (i / Math.max(1, lossHistory.length - 1)) * w;
      // High loss (0.89) = peak of graph (y=0). Low loss = bottom of graph (y=h).
      const y = (1 - loss) * h; 
      return `${x},${y}`;
    }).join(" ");

    const strokeColor = currentLoss < 0.1 ? "#10b981" : "#6366f1"; // Emerald vs Indigo

    return (
      <svg width={w} height={h} className="overflow-visible ml-2 opacity-80">
         <polyline
           points={points}
           fill="none"
           stroke={strokeColor}
           strokeWidth="2.5"
           strokeLinecap="round"
           strokeLinejoin="round"
           className="transition-colors duration-300"
         />
         {lossHistory.length > 0 && (
           <circle
             cx={lossHistory.length === 1 ? 0 : w}
             cy={(1 - currentLoss) * h}
             r="3.5"
             fill={strokeColor}
             className="transition-all duration-300"
           />
         )}
      </svg>
    );
  };

  return (
    <LabShell
      labId="deeplearning9"
      theme="ocean"
      title="Deep Learning Studio"
      compact
      instruction="AI learns by practicing (Epochs) and finding complex patterns using depth (Hidden Layers). Train the network to tell a Chihuahua from a Muffin."
      onReset={handleReset}
    >
      <Celebration
        isActive={hasWon}
        message="Amazing! You added enough Hidden Layers to detect complex patterns, and gave it enough Epochs to practice! The AI is fully trained!"
        onReplay={handleReset}
      />

      <div className="flex-1 flex flex-col gap-4 min-h-0 w-full max-w-6xl mx-auto">
        
        {/* Top: Objective Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 md:p-4 shrink-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <Brain className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Mission Objective</h2>
                    <p className="text-sm text-slate-600 font-medium">Train the neural network to correctly identify the <span className="font-bold text-slate-900">Chihuahua</span> image instead of a Muffin.</p>
                </div>
            </div>
            {phase === "feedback" && (
                <div className="hidden md:flex animate-in slide-in-from-right fade-in px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg items-center gap-2 text-rose-700 text-sm font-bold shadow-sm">
                    <AlertTriangle size={16} />
                    Needs more Layers & Epochs!
                </div>
            )}
        </div>

        {/* Middle: Neural Visualizer */}
        <div className="flex-1 min-h-0 bg-slate-900 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 right-4 flex justify-between text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest z-10">
             <span>Input (Pixels)</span>
             <span className="text-indigo-400">Hidden Layers (Brain)</span>
             <span>Output (Guess)</span>
          </div>
          
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 1000 450" preserveAspectRatio="xMidYMid meet">
             {/* Lines */}
             {lines.map((line) => (
                <line 
                  key={line.id} 
                  x1={line.x1} y1={line.y1} 
                  x2={line.x2} y2={line.y2} 
                  stroke={phase === "success" ? "#10b981" : isTraining ? "#6366f1" : "#334155"} 
                  strokeWidth={isTraining ? 2 : 1}
                  className={`transition-colors duration-500 ${isTraining ? "animate-pulse opacity-50" : "opacity-30"}`}
                />
             ))}

             {/* Nodes */}
             {cols.map((col) => (
                <g key={col.id}>
                  {col.nodes.map((y, idx) => (
                    <circle 
                      key={`${col.id}-${idx}`}
                      cx={col.x} 
                      cy={y} 
                      r={col.id.startsWith('h') ? 8 : 12} 
                      fill={phase === "success" ? "#34d399" : col.id.startsWith('h') ? "#818cf8" : "#cbd5e1"}
                      className="transition-colors duration-500 shadow-xl"
                      filter="drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.5))"
                    />
                  ))}
                </g>
             ))}
          </svg>

          {/* Overlay Status */}
          {isTraining && (
            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center z-20 backdrop-blur-[1px]">
               <div className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full flex items-center gap-2 animate-bounce shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                 <Zap size={18} className="animate-pulse" />
                 Training Network...
               </div>
            </div>
          )}
        </div>

        {/* Bottom: Controls & Output Area */}
        <div className="h-48 md:h-56 shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
           
           {/* Controls Panel */}
           <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-md p-4 flex flex-col justify-between">
              
              <div className="grid grid-cols-2 gap-4 flex-1">
                 {/* Epochs Control */}
                 <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Epochs (Rounds)</span>
                    <div className="flex items-center gap-3">
                       <button 
                         disabled={isTraining || epochs === 1}
                         onClick={() => { playPop(); setEpochs(prev => EPOCH_OPTIONS[Math.max(0, EPOCH_OPTIONS.indexOf(prev) - 1)]) }}
                         className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-100 active:scale-95"
                       >-</button>
                       <span className="w-12 text-center text-xl font-black text-slate-800">{epochs}</span>
                       <button 
                         disabled={isTraining || epochs === 100}
                         onClick={() => { playPop(); setEpochs(prev => EPOCH_OPTIONS[Math.min(EPOCH_OPTIONS.length - 1, EPOCH_OPTIONS.indexOf(prev) + 1)]) }}
                         className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-100 active:scale-95"
                       >+</button>
                    </div>
                 </div>

                 {/* Layers Control */}
                 <div className="flex flex-col items-center justify-center bg-indigo-50/50 rounded-2xl border border-indigo-100/50 p-3">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Hidden Layers</span>
                    <div className="flex items-center gap-3">
                       <button 
                         disabled={isTraining || hiddenLayers === 1}
                         onClick={() => { playPop(); setHiddenLayers(prev => Math.max(1, prev - 1)); setPhase("improving"); }}
                         className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center font-bold text-indigo-600 disabled:opacity-30 hover:bg-indigo-50 active:scale-95"
                       >-</button>
                       <span className="w-8 text-center text-xl font-black text-indigo-900">{hiddenLayers}</span>
                       <button 
                         disabled={isTraining || hiddenLayers === 3}
                         onClick={() => { playPop(); setHiddenLayers(prev => Math.min(3, prev + 1)); setPhase("improving"); }}
                         className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center font-bold text-indigo-600 disabled:opacity-30 hover:bg-indigo-50 active:scale-95"
                       >+</button>
                    </div>
                 </div>
              </div>

              <button
                disabled={isTraining || phase === "success"}
                onClick={handleTrain}
                className="mt-3 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Play size={18} fill="currentColor" />
                {phase === "success" ? "Training Complete" : "Train Network"}
              </button>
           </div>

           {/* Live Output Panel */}
           <div className="bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col overflow-hidden relative">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center shrink-0">
                 <div className="flex items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Loss Curve</span>
                    {renderSparkline()}
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${currentLoss < 0.1 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                   Error: {(currentLoss * 100).toFixed(0)}%
                 </span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                 {phase === "learn" || phase === "improving" ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                         <Dog size={32} className="text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Training</p>
                    </>
                 ) : isTraining ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3 animate-spin">
                         <Zap size={32} className="text-indigo-600" />
                      </div>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Processing...</p>
                    </>
                 ) : phase === "failed" || phase === "feedback" ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-2 animate-shake">
                         <Cookie size={32} className="text-rose-600" />
                      </div>
                      <p className="text-sm font-black text-slate-800">Blueberry Muffin</p>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded mt-1">Incorrect Guess</p>
                    </>
                 ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                         <Dog size={32} className="text-emerald-600" />
                      </div>
                      <p className="text-sm font-black text-slate-800">Chihuahua</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded mt-1">98% Confidence</p>
                    </>
                 )}
              </div>
              
              {/* Overlay Feedback Toast */}
              <AnimatePresence>
                 {phase === "feedback" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 p-4 flex flex-col items-center justify-center text-center border-t-4 border-rose-500"
                    >
                       <AlertTriangle size={32} className="text-rose-500 mb-2" />
                       <h3 className="text-sm font-black text-slate-900 mb-1">Underfitted!</h3>
                       <p className="text-xs font-medium text-slate-600 leading-tight">The AI didn't practice enough (Epochs) and wasn't deep enough to see complex shapes (Layers). Add more to stop it from guessing!</p>
                       <button onClick={() => setPhase("improving")} className="mt-3 px-4 py-1.5 bg-slate-900 text-white text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-slate-800 transition-colors">Got it</button>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </LabShell>
  );
}
"""

with open('labs/DeepLearning9.tsx', 'w', encoding='utf-8') as f:
    # Ensure no python multiline artifacts remain
    content = content.replace('"""\nDeepLearning9.tsx\nGrade 9 Educational Lab\nTheme: Ocean (High Contrast)\n"""\n', '')
    f.write(content)

print("Loss Curve SVG and Computational Scaling implemented!")
