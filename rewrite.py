code = """\"\"\"use client\"\"\";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabAudio } from '@/hooks/useLabAudio';
import { useLMSBridge } from '@/hooks/useLMSBridge';
import Celebration from '@/components/Celebration';
import LabShell from '@/components/LabShell';
import { Leaf, Cpu, Zap, Cloud, AlertTriangle, ShieldCheck, Server, Wind, Tractor, Activity, RotateCcw } from 'lucide-react';

export default function ComputingBenefits44() {
  const { reportComplete } = useLMSBridge("computingbenefits44");
  const { playClick, playPop, playSuccess, playError } = useLabAudio();

  // Hydration guard
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // 1: Learn, 2: Try, 3: Fail Safely, 4: Understand, 5: Improve, 6: Complete, 7: Outcome
  const [stage, setStage] = useState(1);

  // Core Inputs
  const [agCompute, setAgCompute] = useState(0); // 0-10
  const [gridCompute, setGridCompute] = useState(0); // 0-10
  const [greenEnergyEnabled, setGreenEnergyEnabled] = useState(false);
  const [algoOptimized, setAlgoOptimized] = useState(false);

  // Physics Engine Variables
  const totalCompute = agCompute + gridCompute;
  const efficiency = Math.min(100, (totalCompute * 5)); // Target: >= 85
  
  const heatMultiplier = algoOptimized ? 2.5 : 5.0;
  const heat = Math.min(100, totalCompute * heatMultiplier); // Target: <= 80
  
  const carbonMultiplier = (algoOptimized ? 1.0 : 1.5) * (greenEnergyEnabled ? 0.2 : 2.0);
  const carbon = Math.min(100, totalCompute * carbonMultiplier); // Target: <= 15

  // System States
  const isCritical = carbon > 30 || heat > 85;
  const isStable = efficiency >= 85 && carbon <= 15 && heat <= 80;

  // Lifecycle Hooks
  useEffect(() => {
    if (stage === 1 && totalCompute > 0) {
      setStage(2);
    }
    
    // Fail Safely Trigger
    if (stage <= 2 && isCritical) {
      setStage(3);
      if (playError) playError();
    }
  }, [totalCompute, isCritical, stage, playError]);

  const handleAcknowledgeFailure = () => {
    if (playClick) playClick();
    setStage(4);
  };

  const handleDeploy = () => {
    if (isStable) {
      if (playSuccess) playSuccess();
      setStage(6);
      setTimeout(() => {
        setStage(7);
        reportComplete({ points: 100 });
      }, 1500);
    } else {
      if (playError) playError();
    }
  };

  const handleReset = () => {
    if (playPop) playPop();
    setStage(1);
    setAgCompute(0);
    setGridCompute(0);
    setGreenEnergyEnabled(false);
    setAlgoOptimized(false);
  };

  // Visual Colors based on state
  const serverColor = heat < 50 ? 'bg-cyan-500' : heat < 80 ? 'bg-amber-500' : 'bg-rose-600';
  const serverGlow = heat < 50 ? 'shadow-[0_0_15px_rgba(6,182,212,0.6)]' : heat < 80 ? 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'shadow-[0_0_20px_rgba(225,29,72,0.9)] animate-pulse';
  
  const smogOpacity = Math.max(0, 1 - (efficiency / 100));
  const pollutionOpacity = Math.min(1, carbon / 100);

  return (
    <LabShell 
      labId="computingbenefits44" 
      title="Computing Benefits"
      onReset={handleReset}
      bgOverride="bg-slate-200"
      compact={true}
      instruction="Optimize the Digital Twin using advanced computing, but balance the immense energy costs using sustainable tech."
    >
      <Celebration isActive={stage === 7} />
      
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col relative min-h-0 pt-2 pb-6 px-2 sm:px-4 gap-4">
        
        {/* Diegetic Sticky Notes (Floating outside the chassis for zero-scroll visual interest) */}
        <AnimatePresence>
          {isMounted && (stage === 1 || stage === 2) && (
            <motion.div 
              initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
              animate={{ opacity: 1, rotate: -3, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-10 -left-2 sm:-left-8 md:-left-16 lg:-left-24 z-50 bg-yellow-200 p-4 w-64 shadow-[2px_5px_15px_rgba(0,0,0,0.3)] border border-yellow-300"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/50 backdrop-blur-sm border border-black/10 rotate-[-2deg] shadow-sm" />
              <p className="font-mono text-[11px] font-bold text-slate-800 leading-relaxed uppercase border-b border-yellow-300/50 pb-1 mb-2">Sysadmin Note</p>
              <p className="font-mono text-sm text-slate-800 font-bold leading-tight">
                City efficiency is dropping! Allocate compute cores to <span className="text-blue-700">Smart Grid</span> and <span className="text-green-700">Precision Ag</span> to optimize the systems.
              </p>
            </motion.div>
          )}
          
          {isMounted && stage === 3 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-rose-100 p-6 w-80 rounded-2xl shadow-[0_20px_50px_rgba(225,29,72,0.4)] border-4 border-rose-500 flex flex-col items-center text-center"
            >
              <AlertTriangle size={48} className="text-rose-600 mb-2 animate-bounce" />
              <h2 className="text-xl font-black text-rose-800 uppercase tracking-widest mb-2">Thermal Overload</h2>
              <p className="text-sm font-bold text-rose-700 mb-6">
                You maximized the algorithms, but the AI data center is burning massive fossil fuels and overheating! We fixed the city but ruined the atmosphere.
              </p>
              <button 
                onClick={handleAcknowledgeFailure}
                className="w-full bg-rose-600 text-white font-black py-3 rounded-xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 hover:bg-rose-500 uppercase tracking-widest transition-all"
              >
                Find Sustainable Solution
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP HALF: The Digital Twin Diorama */}
        <div className="flex-1 min-h-[35vh] md:min-h-[40vh] bg-slate-900 rounded-[2rem] overflow-hidden flex relative shadow-2xl border-4 border-slate-700 z-10">
          
          {/* Left Side: Real World (City/Farm) */}
          <div className="flex-1 relative overflow-hidden transition-colors duration-1000 bg-sky-200">
            {/* Smog Overlay */}
            <div 
              className="absolute inset-0 bg-[#8b7355] mix-blend-multiply transition-opacity duration-1000 z-20"
              style={{ opacity: smogOpacity * 0.8 + pollutionOpacity * 0.9 }}
            />
            
            {/* Background elements */}
            <div className="absolute bottom-0 w-full h-1/2 bg-emerald-700 transition-colors duration-1000" style={{ filter: `grayscale(${smogOpacity * 100}%)` }} />
            
            {/* Farm Area */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-10">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={`crop-${i}`}
                  animate={{ scale: agCompute > i * 2 ? 1 : 0.4, opacity: agCompute > i * 2 ? 1 : 0.5 }}
                  className="text-emerald-400"
                >
                  <Leaf size={24} className="drop-shadow-md" />
                </motion.div>
              ))}
              <Tractor size={24} className={`text-slate-700 absolute -bottom-2 -left-2 transition-transform duration-1000 ${agCompute > 0 ? 'translate-x-32' : 'translate-x-0'}`} />
            </div>

            {/* Smart Grid / City Area */}
            <div className="absolute bottom-12 right-8 flex gap-4 items-end z-10">
              <div className="w-12 h-24 bg-slate-800 rounded-t-lg relative flex justify-center border border-slate-700">
                <div className={`w-8 h-8 rounded-full mt-2 transition-colors duration-500 ${gridCompute > 5 ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'bg-slate-600'}`} />
              </div>
              <div className="w-16 h-32 bg-slate-800 rounded-t-lg relative grid grid-cols-2 gap-2 p-2 border border-slate-700">
                {[...Array(6)].map((_, i) => (
                  <div key={`win-${i}`} className={`w-full h-4 transition-colors duration-500 ${gridCompute > (i+1) ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>

            {/* Wind Turbines (Green Tech) */}
            <AnimatePresence>
              {greenEnergyEnabled && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute top-8 left-8 z-10 text-slate-100 flex gap-4"
                >
                  {[...Array(2)].map((_, i) => (
                    <div key={`turb-${i}`} className="flex flex-col items-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                        <Wind size={32} />
                      </motion.div>
                      <div className="w-1 h-12 bg-slate-300" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Data Center */}
          <div className="w-1/3 min-w-[120px] bg-slate-950 border-l-4 border-slate-800 relative flex flex-col items-center justify-center p-2 sm:p-4 z-30">
            {/* Emissions Smoke effect */}
            {carbon > 20 && (
              <div className="absolute -top-10 flex gap-2 pointer-events-none opacity-60">
                <motion.div animate={{ y: -100, opacity: 0, scale: 2 }} transition={{ repeat: Infinity, duration: 2 }}><Cloud size={32} className="text-slate-500" /></motion.div>
                <motion.div animate={{ y: -80, opacity: 0, scale: 2 }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}><Cloud size={40} className="text-slate-600" /></motion.div>
              </div>
            )}
            
            <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-2 flex flex-col gap-2 w-full max-w-[100px] shadow-2xl relative z-10">
              {[...Array(5)].map((_, i) => (
                <div key={`server-${i}`} className="h-6 sm:h-8 bg-slate-950 rounded flex items-center justify-between px-2 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-slate-800" />
                    <div className="w-1 h-3 bg-slate-800" />
                  </div>
                  {/* Status Light */}
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${totalCompute > i * 4 ? serverColor : 'bg-slate-700'} ${totalCompute > i * 4 ? serverGlow : ''}`} />
                </div>
              ))}
            </div>
            <div className="mt-4 text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              <Server size={12} /> AI CORE
            </div>
          </div>
        </div>

        {/* BOTTOM HALF: The Hardware Console */}
        <div className="shrink-0 bg-white rounded-[2rem] p-4 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.1),inset_0_2px_10px_rgba(255,255,255,1)] flex flex-col gap-4 border-2 border-slate-200 z-20">
          
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 rounded-xl p-3 sm:p-4 gap-4 shadow-inner">
            <div className="flex gap-4 sm:gap-6 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                <span className={`text-xl sm:text-2xl font-black font-mono ${efficiency >= 85 ? 'text-emerald-400' : 'text-slate-300'}`}>{efficiency}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Carbon</span>
                <span className={`text-xl sm:text-2xl font-black font-mono ${carbon <= 15 ? 'text-emerald-400' : carbon > 30 ? 'text-rose-500' : 'text-amber-400'}`}>{carbon.toFixed(0)}T</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Heat</span>
                <span className={`text-xl sm:text-2xl font-black font-mono ${heat <= 80 ? 'text-cyan-400' : 'text-rose-500'}`}>{heat.toFixed(0)}°</span>
              </div>
            </div>
            
            {stage >= 4 && (
              <button 
                onClick={handleDeploy}
                disabled={!isStable}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                  isStable 
                  ? 'bg-emerald-500 text-white border-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400' 
                  : 'bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed'
                }`}
              >
                {isStable ? 'Deploy Solution' : 'Unstable'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            
            {/* Left: Compute Allocation */}
            <div className="flex flex-col gap-4">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                <Cpu size={16} className="text-blue-500"/> Compute Allocation
              </h3>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600">Smart Grid Routing</label>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{gridCompute} Cores</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="1" 
                  value={gridCompute} 
                  onChange={(e) => { if(playPop) playPop(); setGridCompute(Number(e.target.value)); }}
                  disabled={stage === 3 || stage === 6 || stage === 7}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer outline-none accent-blue-600 disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600">Precision Ag AI</label>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{agCompute} Cores</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="1" 
                  value={agCompute} 
                  onChange={(e) => { if(playPop) playPop(); setAgCompute(Number(e.target.value)); }}
                  disabled={stage === 3 || stage === 6 || stage === 7}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer outline-none accent-emerald-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Right: Sustainable Tech */}
            <div className="flex flex-col gap-4 relative">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                <Leaf size={16} className="text-emerald-500"/> Sustainable Tech
              </h3>
              
              {stage < 4 ? (
                <div className="absolute inset-0 mt-8 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <span className="text-slate-400 font-black tracking-widest uppercase text-sm flex items-center gap-2"><ShieldCheck size={18}/> Locked</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 h-full justify-center">
                  <button 
                    onClick={() => { if(stage < 6) { if(playClick) playClick(); setAlgoOptimized(!algoOptimized); } }}
                    disabled={stage >= 6}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all disabled:opacity-80 ${
                      algoOptimized ? 'bg-cyan-50 border-cyan-400 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${algoOptimized ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Activity size={18} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`text-xs font-bold ${algoOptimized ? 'text-cyan-900' : 'text-slate-600'}`}>Optimize Algorithms</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reduces Server Heat</span>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${algoOptimized ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${algoOptimized ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>

                  <button 
                    onClick={() => { if(stage < 6) { if(playClick) playClick(); setGreenEnergyEnabled(!greenEnergyEnabled); } }}
                    disabled={stage >= 6}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all disabled:opacity-80 ${
                      greenEnergyEnabled ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${greenEnergyEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Wind size={18} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`text-xs font-bold ${greenEnergyEnabled ? 'text-emerald-900' : 'text-slate-600'}`}>Renewable Routing</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reduces Carbon</span>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${greenEnergyEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${greenEnergyEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </LabShell>
  );
}
"""
# Replace the file content
code = code.replace('"""use client""";', '"use client";')
with open("labs/ComputingBenefits44.tsx", "w", encoding="utf-8") as f:
    f.write(code)
print("Success")
