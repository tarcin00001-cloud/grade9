"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabAudio } from '@/hooks/useLabAudio';
import { useLMSBridge } from '@/hooks/useLMSBridge';
import Celebration from '@/components/Celebration';
import LabShell from '@/components/LabShell';
import { Leaf, AlertTriangle, ShieldCheck, Server, Wind, Tractor, Activity, CheckCircle2, Cloud, Car, Droplets, Zap } from 'lucide-react';

export default function ComputingBenefits44() {
  const { reportComplete } = useLMSBridge("computingbenefits44");
  const { playClick, playPop, playSuccess, playError } = useLabAudio();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // 1: Processing Data, 2: Overload (Fail Safely), 3: Optimizing DC, 4: Complete
  const [stage, setStage] = useState(1);

  // AI Inputs (0 to 100%)
  const [trafficData, setTrafficData] = useState(0);
  const [farmData, setFarmData] = useState(0);

  // Sustainable Tech
  const [liquidCooling, setLiquidCooling] = useState(false);
  const [greenPower, setGreenPower] = useState(false);

  // Physics Engine
  const cityEfficiency = Math.round((trafficData + farmData) / 2); // 0 to 100
  
  // Heat maxes at 100 when full data, but liquid cooling cuts it to 30
  const rawHeat = Math.round((trafficData + farmData) / 2); 
  const serverHeat = liquidCooling ? Math.max(20, rawHeat - 70) : rawHeat;
  
  // Carbon maxes at 100 when full data, but green power cuts it to 10
  const rawCarbon = Math.round((trafficData + farmData) / 2);
  const serverCarbon = greenPower ? Math.max(0, rawCarbon - 90) : rawCarbon;

  const isCityFixed = trafficData === 100 && farmData === 100;
  const isOverheating = serverHeat > 80 || serverCarbon > 80;
  const isBalanced = isCityFixed && !isOverheating;

  // Triggers
  useEffect(() => {
    if (stage === 1 && isCityFixed && isOverheating) {
      // Small delay so they see the sliders hit 100 before the alarm
      const t = setTimeout(() => {
        setStage(2);
        if (playError) playError();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isCityFixed, isOverheating, stage, playError]);

  const handleAcknowledgeFailure = () => {
    if (playClick) playClick();
    setStage(3);
  };

  const handleDeploy = () => {
    if (isBalanced) {
      if (playSuccess) playSuccess();
      setStage(4);
      setTimeout(() => {
        reportComplete({ points: 100 });
      }, 1500);
    }
  };

  const handleReset = () => {
    if (playPop) playPop();
    setStage(1);
    setTrafficData(0);
    setFarmData(0);
    setLiquidCooling(false);
    setGreenPower(false);
  };

  const serverColor = serverHeat < 50 ? 'bg-cyan-500' : serverHeat < 80 ? 'bg-amber-500' : 'bg-rose-600';
  const serverGlow = serverHeat < 50 ? 'shadow-[0_0_15px_rgba(6,182,212,0.6)]' : serverHeat < 80 ? 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'shadow-[0_0_20px_rgba(225,29,72,0.9)] animate-pulse';
  
  const smogOpacity = Math.max(0, 1 - (cityEfficiency / 100));
  const pollutionOpacity = Math.min(1, serverCarbon / 100);

  return (
    <LabShell 
      labId="computingbenefits44" 
      title="Computing Benefits"
      onReset={handleReset}
      bgOverride="bg-slate-200"
      compact={true}
      instruction="Use Supercomputers to solve the city's problems, but watch out for the massive energy costs!"
    >
      <Celebration isActive={stage === 4} />
      
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col relative min-h-0 pt-2 pb-6 px-2 sm:px-4 gap-4">
        
        <AnimatePresence>
          {/* Introductory Note */}
          {isMounted && stage === 1 && trafficData === 0 && farmData === 0 && (
            <motion.div 
              initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
              animate={{ opacity: 1, rotate: -3, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-10 -left-2 sm:-left-8 md:-left-16 lg:-left-24 z-50 bg-yellow-200 p-4 w-64 shadow-[2px_5px_15px_rgba(0,0,0,0.3)] border border-yellow-300"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/50 backdrop-blur-sm border border-black/10 rotate-[-2deg] shadow-sm" />
              <p className="font-mono text-[11px] font-bold text-slate-800 leading-relaxed uppercase border-b border-yellow-300/50 pb-1 mb-2">Goal</p>
              <p className="font-sans text-[14px] text-slate-800 font-bold leading-tight">
                The city is polluted and the farm is wasting water. Feed live data into the <span className="text-blue-700 font-black">AI Supercomputer</span> below to fix it!
              </p>
            </motion.div>
          )}
          
          {/* Failure / Consequence Note */}
          {isMounted && stage === 2 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-rose-100 p-6 w-80 rounded-2xl shadow-[0_20px_50px_rgba(225,29,72,0.4)] border-4 border-rose-500 flex flex-col items-center text-center"
            >
              <AlertTriangle size={48} className="text-rose-600 mb-2 animate-bounce" />
              <h2 className="text-xl font-black text-rose-800 uppercase tracking-widest mb-2">Energy Warning</h2>
              <p className="text-sm font-bold text-rose-700 mb-6">
                The AI algorithms worked! The city is clean and efficient.<br/><br/>
                <span className="font-black">BUT...</span> running those massive supercomputers is using too much electricity! We just moved the pollution from the city to the Data Center!
              </p>
              <button 
                onClick={handleAcknowledgeFailure}
                className="w-full bg-rose-600 text-white font-black py-3 rounded-xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 hover:bg-rose-500 uppercase tracking-widest transition-all"
              >
                Make Computing Green
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP HALF: Digital Twin Diorama */}
        <motion.div 
          animate={isOverheating ? { x: [-2, 2, -2, 2, 0], y: [-1, 1, -1, 1, 0] } : {}}
          transition={{ repeat: isOverheating ? Infinity : 0, duration: 0.2 }}
          className="flex-1 min-h-[20vh] md:min-h-[25vh] bg-slate-900 rounded-[2rem] overflow-hidden flex relative shadow-2xl border-4 border-slate-700 z-10"
        >
          
          {/* Data Streams (Glowing Packets) */}
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-center gap-12 sm:gap-16 px-4 sm:px-10">
            {trafficData > 0 && (
              <div className="w-full h-1 bg-blue-500/20 relative rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }} 
                  animate={{ x: "2000%" }} 
                  transition={{ repeat: Infinity, duration: 2.5 - (trafficData/100)*1.5, ease: "linear" }}
                  className="w-16 sm:w-24 h-full bg-blue-400 shadow-[0_0_15px_#60a5fa] rounded-full" 
                />
              </div>
            )}
            {farmData > 0 && (
              <div className="w-full h-1 bg-emerald-500/20 relative rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }} 
                  animate={{ x: "2000%" }} 
                  transition={{ repeat: Infinity, duration: 2.5 - (farmData/100)*1.5, ease: "linear" }}
                  className="w-16 sm:w-24 h-full bg-emerald-400 shadow-[0_0_15px_#34d399] rounded-full" 
                />
              </div>
            )}
          </div>
          
          {/* Left: The World */}
          <div className={`flex-1 relative overflow-hidden transition-colors duration-1000 ${greenPower ? "bg-amber-100" : "bg-sky-200"}`}>
            {/* World Smog */}
            <div 
              className="absolute inset-0 bg-[#8b7355] mix-blend-multiply transition-opacity duration-1000 z-20 pointer-events-none"
              style={{ opacity: smogOpacity * 0.8 }}
            />
            
            {/* Ground */}
            <div className="absolute bottom-0 w-full h-1/2 bg-emerald-700 transition-colors duration-1000" style={{ filter: `grayscale(${smogOpacity * 100}%)` }} />
            
            {/* Farm Area */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-10">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={`crop-${i}`}
                  animate={{ scale: farmData > i * 20 ? 1 : 0.4, opacity: farmData > i * 20 ? 1 : 0.5 }}
                  className={`drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] ${farmData > i * 20 ? 'text-emerald-400' : 'text-emerald-900'}`}
                >
                  <Leaf size={24} />
                </motion.div>
              ))}
              <Tractor size={24} className={`text-slate-800 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] absolute -bottom-2 -left-2 transition-transform duration-1000 ${farmData > 0 ? 'translate-x-32' : 'translate-x-0'}`} />
            </div>

            {/* City Area */}
            <div className="absolute bottom-12 right-8 flex gap-4 items-end z-10">
              {/* Traffic Light */}
              <div className="w-6 h-16 bg-slate-800 rounded-lg relative flex flex-col items-center justify-evenly border border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${trafficData < 50 ? 'bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)]' : 'bg-slate-700'}`} />
                <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${trafficData >= 50 && trafficData < 100 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-slate-700'}`} />
                <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${trafficData === 100 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-700'}`} />
              </div>
              
              {/* Buildings */}
              <div className="w-16 h-32 bg-slate-700 rounded-t-lg relative grid grid-cols-2 gap-2 p-2 border border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                {[...Array(6)].map((_, i) => (
                  <div key={`win-${i}`} className={`w-full h-4 transition-colors duration-500 ${trafficData > (i * 16) ? 'bg-yellow-200 shadow-[0_0_8px_rgba(254,240,138,0.8)]' : 'bg-slate-500'}`} />
                ))}
              </div>
            </div>

            {/* Green Power Tech (Appears when enabled) */}
            <AnimatePresence>
              {greenPower && (
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

          {/* Right: The Data Center */}
          <div className="w-1/4 min-w-[100px] bg-slate-950 border-l-4 border-slate-800 relative flex flex-col items-center justify-center p-2 sm:p-4 z-30">
            
            {/* Server Smog/Emissions */}
            <div 
              className="absolute inset-0 bg-[#453b3b] mix-blend-multiply transition-opacity duration-1000 pointer-events-none"
              style={{ opacity: pollutionOpacity * 0.9 }}
            />
            {serverCarbon > 20 && (
              <div className="absolute -top-10 flex gap-2 pointer-events-none opacity-80 z-40">
                <motion.div animate={{ y: -100, opacity: 0, scale: 2 }} transition={{ repeat: Infinity, duration: 2 }}><Cloud size={32} className="text-slate-500" /></motion.div>
                <motion.div animate={{ y: -80, opacity: 0, scale: 2 }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}><Cloud size={40} className="text-slate-600" /></motion.div>
              </div>
            )}
            
            {/* Server Meltdown Sparks */}
            <AnimatePresence>
              {isOverheating && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex justify-center items-end pb-8"
                >
                  <div className="absolute inset-0 bg-rose-500/10 animate-pulse mix-blend-color-burn" />
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={`spark-${i}`}
                      initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                      animate={{ 
                        y: -100 - Math.random() * 100, 
                        x: (Math.random() - 0.5) * 80,
                        opacity: 0,
                        scale: Math.random() * 1.5 + 0.5
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.4 + Math.random()*0.4, 
                        delay: Math.random() 
                      }}
                      className="absolute w-1.5 h-1.5 bg-amber-300 rounded-full shadow-[0_0_8px_#fbbf24]"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={`bg-slate-900 border-2 ${liquidCooling ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-700'} rounded-lg p-2 flex flex-col gap-2 w-full shadow-2xl relative z-10 transition-colors`}>
              {[...Array(4)].map((_, i) => (
                <div key={`server-${i}`} className="h-6 sm:h-8 bg-slate-950 rounded flex items-center justify-between px-2 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-slate-800" />
                    <div className="w-1 h-3 bg-slate-800" />
                  </div>
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${serverHeat > i * 25 ? serverColor : 'bg-slate-700'} ${serverHeat > i * 25 ? serverGlow : ''}`} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* BOTTOM HALF: Hardware Console */}
        <div className="shrink-0 bg-white rounded-[2rem] p-3 md:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col gap-2 border-2 border-slate-200 z-20">
          
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 rounded-xl p-2 sm:p-3 gap-2 shadow-inner relative">
            <div className="flex justify-between w-full sm:w-auto gap-4 sm:gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City Health</span>
                <span className={`text-xl sm:text-2xl font-black font-mono ${cityEfficiency === 100 ? 'text-emerald-400' : 'text-slate-300'}`}>{cityEfficiency}%</span>
              </div>
              <div className="flex flex-col border-l border-slate-700 pl-4 sm:pl-8">
                <span className="text-[10px] font-black text-rose-400/80 uppercase tracking-widest">Data Center Heat</span>
                <span className={`text-xl sm:text-2xl font-black font-mono ${serverHeat <= 40 ? 'text-cyan-400' : serverHeat >= 80 ? 'text-rose-500' : 'text-amber-400'}`}>{serverHeat.toFixed(0)}&deg;C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-rose-400/80 uppercase tracking-widest">Data Center Power</span>
                <span className={`text-xl sm:text-2xl font-black font-mono ${serverCarbon <= 20 ? 'text-emerald-400' : serverCarbon >= 80 ? 'text-rose-500' : 'text-amber-400'}`}>{serverCarbon.toFixed(0)} kW</span>
              </div>
            </div>
            
            {stage >= 3 ? (
              <button 
                onClick={handleDeploy}
                disabled={!isBalanced}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                  isBalanced 
                  ? 'bg-emerald-500 text-white border-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400' 
                  : 'bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed'
                }`}
              >
                {isBalanced ? 'Deploy System' : 'System Unstable'}
              </button>
            ) : (
              <button disabled className="w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm border-b-4 bg-slate-800 text-slate-600 border-slate-900 opacity-50">
                Deploy System
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left: The Real World Problems (AI Tasks) */}
            <div className="flex flex-col gap-3">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                Step 1: Solve City Problems
              </h3>
              
              <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-blue-600" />
                      <label className="text-sm font-bold text-slate-700">AI Traffic Optimization</label>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reduces city smog</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="10" 
                    value={trafficData} 
                    onChange={(e) => { if(playPop) playPop(); setTrafficData(Number(e.target.value)); }}
                    disabled={stage >= 2}
                    className="w-full h-4 bg-blue-100 rounded-full appearance-none cursor-pointer outline-none accent-blue-600 disabled:opacity-50"
                  />
                  <div className={`text-[10px] font-mono font-bold mt-1 min-h-[20px] ${trafficData === 100 ? 'text-blue-700' : 'text-slate-500'}`}>
                    {trafficData === 0 ? "Awaiting live camera feeds..." :
                     trafficData < 50 ? `Aggregating ${trafficData}TB of traffic camera data...` :
                     trafficData < 100 ? "Running combinatorial pathfinding..." :
                     "💡 INSIGHT: Rerouting 400 cars. Traffic jam averted. Saved 500gal gas."}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Droplets size={16} className="text-emerald-600" />
                      <label className="text-sm font-bold text-slate-700">AI Smart Farm</label>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Saves farm water</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="10" 
                    value={farmData} 
                    onChange={(e) => { if(playPop) playPop(); setFarmData(Number(e.target.value)); }}
                    disabled={stage >= 2}
                    className="w-full h-4 bg-emerald-100 rounded-full appearance-none cursor-pointer outline-none accent-emerald-600 disabled:opacity-50"
                  />
                  <div className={`text-[10px] font-mono font-bold mt-1 min-h-[20px] ${farmData === 100 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {farmData === 0 ? "Awaiting satellite data..." :
                     farmData < 50 ? `Aggregating ${farmData}TB of infrared imagery...` :
                     farmData < 100 ? "Running predictive weather models..." :
                     "💡 INSIGHT: Sector 4 soil saturated. Shutting off sprinklers. Saved 10,000gal."}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Data Center Optimization (The Caveat) */}
            <div className="flex flex-col gap-3 relative">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                Step 2: Make Computing Green
              </h3>
              
              {stage < 3 ? (
                <div className="absolute inset-0 top-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center z-10">
                  <span className="text-slate-400 font-black tracking-widest uppercase text-sm flex items-center gap-2"><ShieldCheck size={18}/> Fix city first</span>
                </div>
              ) : null}

              <div className={`flex flex-col gap-2 h-full ${stage < 3 ? 'opacity-20 pointer-events-none' : ''}`}>
                <div className={`flex flex-col p-3 rounded-xl border-2 transition-all ${
                  liquidCooling ? 'bg-cyan-50 border-cyan-400 shadow-sm' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${liquidCooling ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Activity size={16} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`text-sm font-bold ${liquidCooling ? 'text-cyan-900' : 'text-slate-700'}`}>Algorithm Efficiency</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reduces CPU Heat</span>
                    </div>
                  </div>
                  <select
                    value={liquidCooling ? 'optimized' : 'brute_force'}
                    onChange={(e) => {
                      if (playClick) playClick();
                      setLiquidCooling(e.target.value === 'optimized');
                    }}
                    disabled={stage >= 4}
                    className={`w-full text-xs font-bold p-2 rounded-lg border outline-none appearance-none cursor-pointer ${
                      liquidCooling ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <option value="brute_force">O(N²) Brute Force Search (High CPU)</option>
                    <option value="optimized">O(N log N) Heuristic Search (Low CPU)</option>
                  </select>
                </div>

                <button 
                  onClick={() => { if(stage < 4) { if(playClick) playClick(); setGreenPower(!greenPower); } }}
                  disabled={stage >= 4}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all disabled:opacity-80 ${
                    greenPower ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${greenPower ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Zap size={20} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`text-sm font-bold ${greenPower ? 'text-emerald-900' : 'text-slate-700'}`}>Switch to Solar/Wind Power</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reduces carbon pollution to zero</span>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${greenPower ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${greenPower ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </LabShell>
  );
}
