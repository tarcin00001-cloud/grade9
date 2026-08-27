"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Brain, Activity, CheckCircle2, Zap, RotateCcw, Lock, HelpCircle
} from "lucide-react";

// The 3 Regions to Tune
const REGIONS = [
  { id: 1, name: "Motor Cortex", desc: "Controls voluntary movements.", targetAmp: 60, targetFreq: 3, targetPhase: 0 },
  { id: 2, name: "Visual Cortex", desc: "Processes visual information.", targetAmp: 30, targetFreq: 7, targetPhase: 180 },
  { id: 3, name: "Language Center", desc: "Comprehends and generates speech.", targetAmp: 80, targetFreq: 5, targetPhase: 90 },
];

export default function BrainComputerInterface9() {
  const { playPop, playSuccess, playZap, playClick } = useLabAudio();
  
  const [currentRegionIndex, setCurrentRegionIndex] = useState(0);
  const [completedRegions, setCompletedRegions] = useState<number[]>([]);
  const [labFinished, setLabFinished] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);

  // User Tuner State
  const [amp, setAmp] = useState(10);
  const [freq, setFreq] = useState(1);
  const [phase, setPhase] = useState(0);

  const region = REGIONS[currentRegionIndex];
  const isAllComplete = completedRegions.length === REGIONS.length;

  // Animation Loop for moving waves
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const render = (time: number) => {
      const delta = time - lastTime;
      // move wave based on time
      setTimeOffset(prev => prev + delta * 0.002);
      lastTime = time;
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Check for Match
  useEffect(() => {
    if (!region || completedRegions.includes(region.id)) return;
    
    const ampMatch = Math.abs(amp - region.targetAmp) <= 5;
    const freqMatch = freq === region.targetFreq;
    let phaseDiff = Math.abs(phase - region.targetPhase) % 360;
    if (phaseDiff > 180) phaseDiff = 360 - phaseDiff;
    const phaseMatch = phaseDiff <= 15;

    if (ampMatch && freqMatch && phaseMatch) {
      setCompletedRegions(prev => [...prev, region.id]);
      if (playSuccess) playSuccess();
    }
  }, [amp, freq, phase, region, completedRegions, playSuccess]);

  const handleNextRegion = () => {
    if (currentRegionIndex < REGIONS.length - 1) {
      setCurrentRegionIndex(prev => prev + 1);
      // Reset sliders for next puzzle
      setAmp(10);
      setFreq(1);
      setPhase(0);
      if (playPop) playPop();
    }
  };

  const initiateNeuralLink = () => {
    if (playZap) playZap();
    setLabFinished(true);
  };

  const resetLab = () => {
    setCurrentRegionIndex(0);
    setCompletedRegions([]);
    setLabFinished(false);
    setAmp(10);
    setFreq(1);
    setPhase(0);
    if (playPop) playPop();
  };

  // SVG Wave Generator
  const generateWavePath = (amplitude: number, frequency: number, phaseShiftDeg: number, isTarget: boolean) => {
    // scale amplitude from 0-100 to 0-80px visually
    const A = (amplitude / 100) * 80;
    // scale frequency so 1-10 is visible number of peaks in 600px width
    const F = (frequency * Math.PI * 2) / 600;
    // convert phase deg to rad
    const P = (phaseShiftDeg * Math.PI) / 180;
    
    let path = "M 0 100 "; // Start at left, middle height (100)
    for (let x = 0; x <= 600; x += 5) {
      // timeOffset makes the wave travel right to left
      const t = isTarget ? timeOffset * region.targetFreq * 2 : timeOffset * freq * 2;
      const y = 100 + A * Math.sin(F * x + P + t);
      path += `L ${x} ${y} `;
    }
    return path;
  };

  const isCurrentMatched = region && completedRegions.includes(region.id);

  return (
    <LabShell
      labId="braincomputerinterface9"
      title="Brainwave Tuner"
      subtitle="Establishing Direct Neural Interface"
      theme="neon"
      compact={true}
      instruction="1. Review the concepts comparing biological, voice, and neural interfaces. 2. Calibrate the simulated brain-computer interface to the user's baseline. 3. Perform the interactive tasks using the different interface modes. 4. Analyze the efficiency and error rates of each interface type."
      onReset={resetLab}
    >
      <Celebration isActive={labFinished} onReplay={resetLab} />

      <div className="flex flex-col md:flex-row h-full w-full max-w-6xl mx-auto gap-3 p-2">
        
        {/* Left Panel: Oscilloscope */}
        <div className="flex-[1.2] flex flex-col gap-2">
          <div className={`bg-white rounded-xl p-3 border-2 shadow-lg flex-1 flex flex-col transition-colors duration-500 relative overflow-hidden ${
            labFinished ? 'border-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.5)]' : 'border-slate-700/50'
          }`}>
            
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2 z-10 shrink-0">
              <Activity className="text-sky-600" size={18}/> Neural Oscilloscope
            </h2>

            {/* SVG Oscilloscope Display */}
            <div className="bg-white border border-slate-700 rounded-xl flex-1 relative overflow-hidden flex items-center justify-center min-h-0 shadow-inner z-10">
              
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              {!labFinished ? (
                <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  {/* Target Brain Wave (Blue) */}
                  {region && (
                    <path
                      d={generateWavePath(region.targetAmp, region.targetFreq, region.targetPhase, true)}
                      fill="none"
                      stroke="rgba(56, 189, 248, 0.6)"
                      strokeWidth="6"
                      style={{ filter: 'drop-shadow(0px 0px 8px rgba(56, 189, 248, 0.8))' }}
                    />
                  )}
                  {/* User Receiver Wave (Pink) */}
                  {!isCurrentMatched && (
                    <path
                      d={generateWavePath(amp, freq, phase, false)}
                      fill="none"
                      stroke="rgba(232, 121, 249, 0.8)"
                      strokeWidth="4"
                      style={{ filter: 'drop-shadow(0px 0px 8px rgba(232, 121, 249, 0.8))' }}
                    />
                  )}
                </svg>
              ) : (
                /* Lab Finished: Massive Data Transfer Viz */
                <div className="absolute inset-0 flex items-center justify-center bg-fuchsia-900/40">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute w-[800px] h-[800px] bg-fuchsia-500/20 blur-3xl rounded-full" />
                  <div className="text-center z-10">
                    <Zap size={48} className="text-fuchsia-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-xl font-black text-fuchsia-100 uppercase tracking-widest">Symbiosis Achieved</p>
                    <p className="text-fuchsia-300 font-bold mt-1 text-sm">10,000,000 bps Transfer Rate</p>
                  </div>
                </div>
              )}

              {/* Status Overlay inside Oscilloscope */}
              {isCurrentMatched && !labFinished && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 bg-emerald-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <CheckCircle2 size={48} className="text-emerald-400 mb-2" />
                  <h3 className="text-xl font-black text-emerald-100 tracking-wider">SYNC ESTABLISHED</h3>
                  <p className="text-emerald-300 font-bold text-sm">{region?.name} locked in.</p>
                </motion.div>
              )}
            </div>
            
          </div>
        </div>

        {/* Right Panel: Controls & Progress */}
        <div className="flex-[0.8] flex flex-col gap-2">
          
          {/* Progress Tracker */}
          <div className="bg-white rounded-xl p-2 border-2 border-slate-700/50 shadow-lg shrink-0">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest mb-1.5">Brain Regions</h3>
            <div className="flex flex-col gap-1.5">
              {REGIONS.map((r, idx) => {
                const isCompleted = completedRegions.includes(r.id);
                const isCurrent = currentRegionIndex === idx;
                return (
                  <div key={r.id} className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
                    isCompleted ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-700' :
                    isCurrent ? 'bg-sky-500/20 border-sky-500/50 text-sky-700' : 'bg-white border-slate-700 text-slate-800'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : isCurrent ? <Activity size={16} className="animate-pulse" /> : <Lock size={16} />}
                    <div>
                      <div className="font-bold text-xs leading-none mb-0.5">{r.name}</div>
                      <div className="text-[9px] opacity-80 leading-none">{r.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hints Box */}
          {!isAllComplete && (
            <div className="bg-white rounded-xl p-2 border border-slate-700 shadow-sm shrink-0">
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-1"><HelpCircle size={12} className="text-sky-600"/> How to Tune</h3>
              <ul className="text-[10px] text-slate-700 space-y-0.5 leading-tight">
                <li>• <strong className="text-fuchsia-700">Amplitude:</strong> Adjusts the <em>height</em> of the wave.</li>
                <li>• <strong className="text-fuchsia-700">Frequency:</strong> Adjusts the <em>number of hills</em>.</li>
                <li>• <strong className="text-fuchsia-700">Phase:</strong> Shifts the wave <em>left or right</em>.</li>
                <li className="pt-0.5 text-emerald-700 font-bold">Goal: Overlap the pink and blue waves!</li>
              </ul>
            </div>
          )}

          {/* Tuner Controls or Final Button */}
          <div className="bg-white rounded-xl p-2 border-2 border-slate-700/50 shadow-lg flex-1 flex flex-col justify-center min-h-0">
            
            {!isAllComplete ? (
              <>
                <h3 className="text-[11px] font-bold text-fuchsia-700 uppercase tracking-widest mb-1 shrink-0">Receiver Controls</h3>
                
                <div className="flex-1 flex flex-col justify-center gap-1.5">
                  {/* Amplitude Slider */}
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-slate-800">Amplitude (Strength)</label>
                      <span className="text-[10px] font-mono text-fuchsia-700">{amp} mV</span>
                    </div>
                    <input 
                      type="range" min="10" max="100" step="5"
                      value={amp} onChange={(e) => { setAmp(Number(e.target.value)); if (playClick) playClick(); }}
                      disabled={isCurrentMatched}
                      className="w-full accent-fuchsia-500 h-1.5 bg-slate-800 rounded-full appearance-none disabled:opacity-50"
                    />
                  </div>

                  {/* Frequency Slider */}
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-slate-800">Frequency (Speed)</label>
                      <span className="text-[10px] font-mono text-fuchsia-700">{freq} Hz</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="1"
                      value={freq} onChange={(e) => { setFreq(Number(e.target.value)); if (playClick) playClick(); }}
                      disabled={isCurrentMatched}
                      className="w-full accent-fuchsia-500 h-1.5 bg-slate-800 rounded-full appearance-none disabled:opacity-50"
                    />
                  </div>

                  {/* Phase Slider */}
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-slate-800">Phase (Offset)</label>
                      <span className="text-[10px] font-mono text-fuchsia-700">{phase}°</span>
                    </div>
                    <input 
                      type="range" min="0" max="345" step="15"
                      value={phase} onChange={(e) => { setPhase(Number(e.target.value)); if (playClick) playClick(); }}
                      disabled={isCurrentMatched}
                      className="w-full accent-fuchsia-500 h-1.5 bg-slate-800 rounded-full appearance-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {isCurrentMatched && (
                  <button onClick={handleNextRegion} className="mt-1 shrink-0 bg-emerald-500 text-slate-900 font-bold py-1.5 rounded-lg hover:bg-emerald-400 transition-colors shadow-lg animate-pulse text-[11px]">
                    Proceed to Next Region
                  </button>
                )}
              </>
            ) : (
              // All Complete - Final Action
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Brain size={32} className="text-fuchsia-700" />
                <h3 className="text-sm font-bold text-center text-slate-900">Neural Pathway Synced</h3>
                <button
                  onClick={initiateNeuralLink}
                  disabled={labFinished}
                  className="w-full bg-fuchsia-500 text-slate-900 font-black text-sm py-3 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:bg-fuchsia-400 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-2"
                >
                  <Zap size={16} /> INITIATE LINK
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </LabShell>
  );
}
