"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Play, Square, RotateCcw, Activity, Binary, Hash, Music, Ear, CheckCircle2, ArrowRight
} from "lucide-react";

// Web Audio API context reference
let audioCtx: AudioContext | null = null;

const playSynthNote = (freq: number, type: OscillatorType = "sine", volume = 0.5) => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
};

const NUM_STEPS = 16;

const ALGORITHMS = {
  even: [1, 3, 5, 7, 9, 11, 13, 15], // 0-indexed: steps 2, 4, 6, 8...
  prime: [1, 2, 4, 6, 10, 12], // 0-indexed: steps 2, 3, 5, 7, 11, 13
  fibonacci: [0, 1, 2, 4, 7, 12], // 0-indexed: steps 1, 2, 3, 5, 8, 13
};

export default function AlgorithmicMusic9() {
  const { playPop, playSuccess, playError, playChime } = useLabAudio();

  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<"target" | "user" | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  
  const [grid, setGrid] = useState<boolean[][]>([
    Array(NUM_STEPS).fill(false),
    Array(NUM_STEPS).fill(false),
    Array(NUM_STEPS).fill(false),
  ]);
  
  const [sandboxActive, setSandboxActive] = useState(false);
  const [tracksFilled, setTracksFilled] = useState({ 0: false, 1: false, 2: false });

  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [isGridError, setIsGridError] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => stopSequencer();
  }, []);

  const getTargetTrack = () => {
    if (level === 1) return ALGORITHMS.even;
    if (level === 2) return ALGORITHMS.prime;
    if (level === 3) return ALGORITHMS.fibonacci;
    return [];
  };

  const startSequencer = (mode: "target" | "user") => {
    if (isPlaying) stopSequencer();
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    setIsPlaying(true);
    setPlayMode(mode);
    let step = 0;
    setCurrentStep(step);
    playStepSounds(step, mode);

    timerRef.current = setInterval(() => {
      step = (step + 1) % NUM_STEPS;
      setCurrentStep(step);
      playStepSounds(step, mode);
    }, 600); 
  };

  const stopSequencer = () => {
    setIsPlaying(false);
    setPlayMode(null);
    setCurrentStep(-1);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const playStepSounds = (step: number, mode: "target" | "user") => {
    if (mode === "target") {
      const target = getTargetTrack();
      if (target.includes(step)) {
        playSynthNote(440, "sine"); // Target melody
      }
    } else {
      setGrid(currentGrid => {
        if (currentGrid[0][step]) playSynthNote(440, "sine"); // Melody
        if (currentGrid[1][step]) playSynthNote(220, "square", 0.3); // Bass
        if (currentGrid[2][step]) playSynthNote(100, "sawtooth", 0.8); // Drum
        return currentGrid;
      });
    }
  };

  const toggleCell = (trackIdx: number, stepIdx: number) => {
    if (level === 4 || showSuccessMsg) return; // Prevent manual editing in sandbox or when success
    if (trackIdx !== 0) return; // Only allow editing track 0 in levels 1-3
    
    if (playPop) playPop();
    const newGrid = [...grid];
    newGrid[trackIdx] = [...newGrid[trackIdx]];
    newGrid[trackIdx][stepIdx] = !newGrid[trackIdx][stepIdx];
    setGrid(newGrid);
  };

  const checkPattern = () => {
    const target = getTargetTrack();
    const userTrack = grid[0];
    let isCorrect = true;
    for (let i = 0; i < NUM_STEPS; i++) {
      const shouldBeActive = target.includes(i);
      if (userTrack[i] !== shouldBeActive) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      if (playSuccess) playSuccess();
      setShowSuccessMsg(true);
      stopSequencer();
    } else {
      if (playError) playError();
      setIsGridError(true);
      setTimeout(() => setIsGridError(false), 800);
    }
  };

  const nextLevel = () => {
    setShowSuccessMsg(false);
    clearGrid();
    if (level === 3) {
      setLevel(4);
      setSandboxActive(true);
    } else {
      setLevel(level + 1);
    }
    if (playPop) playPop();
  };

  const applyAlgorithm = (trackIndex: number, algoKey: keyof typeof ALGORITHMS) => {
    if (playPop) playPop();
    const newGrid = [...grid];
    const newTrack = Array(NUM_STEPS).fill(false);
    ALGORITHMS[algoKey].forEach(idx => {
      if (idx < NUM_STEPS) newTrack[idx] = true;
    });
    newGrid[trackIndex] = newTrack;
    setGrid(newGrid);
    
    if (level === 4) {
      setTracksFilled(prev => ({ ...prev, [trackIndex as keyof typeof tracksFilled]: true }));
    }
  };

  const clearGrid = () => {
    setGrid([
      Array(NUM_STEPS).fill(false),
      Array(NUM_STEPS).fill(false),
      Array(NUM_STEPS).fill(false),
    ]);
  };

  const handleReset = () => {
    stopSequencer();
    clearGrid();
    setLevel(1);
    setShowSuccessMsg(false);
    setIsGridError(false);
    setSandboxActive(false);
    setTracksFilled({ 0: false, 1: false, 2: false });
    if (playPop) playPop();
  };

  const getSuccessMessage = () => {
    if (level === 1) return "Perfect! You recreated the Even Numbers algorithm (notes on steps 2, 4, 6, 8...). It creates a steady, marching rhythm.";
    if (level === 2) return "Excellent! You recreated the Prime Numbers algorithm (2, 3, 5, 7, 11, 13). Notice how the irregular gaps make the music feel unpredictable.";
    if (level === 3) return "Brilliant! You found the Fibonacci Sequence (1, 2, 3, 5, 8, 13). Each gap gets wider because the next number is the sum of the previous two.";
    return "";
  };

  return (
    <LabShell
      labId="algorithmicmusic9"
      title="The Math Melody Maker"
      subtitle="Algorithmic Music Composition"
      theme="neon"
      compact={true}
      instruction="1. Learn the principles of algorithmic music composition. 2. Set up the mathematical rules and algorithms in the melody maker interface. 3. Generate a sequence of notes and listen to the resulting composition. 4. Tweak the algorithm parameters to create different musical variations."
      onReset={handleReset}
    >
      <Celebration isActive={level === 5} onReplay={handleReset} />
      
      <div className="flex flex-col h-full w-full max-w-5xl mx-auto gap-4 p-4 font-mono text-slate-100">
        
        {/* Controls Area */}
        <div className="flex justify-between items-end">
          
          {level < 4 ? (
            <div className="flex gap-4">
              <button 
                onClick={() => isPlaying && playMode === "target" ? stopSequencer() : startSequencer("target")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  isPlaying && playMode === "target"
                    ? "bg-red-500/20 text-red-400 border-2 border-red-500" 
                    : "bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500 hover:bg-indigo-500/30"
                }`}
              >
                {isPlaying && playMode === "target" ? <Square fill="currentColor" /> : <Ear />}
                {isPlaying && playMode === "target" ? "Stop Target" : "Play Target Rhythm"}
              </button>
              
              <button 
                onClick={() => isPlaying && playMode === "user" ? stopSequencer() : startSequencer("user")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  isPlaying && playMode === "user"
                    ? "bg-red-500/20 text-red-400 border-2 border-red-500" 
                    : "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 hover:bg-emerald-500/30"
                }`}
              >
                {isPlaying && playMode === "user" ? <Square fill="currentColor" /> : <Play fill="currentColor" />}
                {isPlaying && playMode === "user" ? "Stop My Rhythm" : "Play My Rhythm"}
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={() => isPlaying ? stopSequencer() : startSequencer("user")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  isPlaying 
                    ? "bg-red-500/20 text-red-400 border-2 border-red-500 hover:bg-red-500/30" 
                    : "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 hover:bg-emerald-500/30"
                }`}
              >
                {isPlaying ? <Square fill="currentColor" /> : <Play fill="currentColor" />}
                {isPlaying ? "Stop" : "Play"}
              </button>
            </div>
          )}

          {level < 4 && !showSuccessMsg && (
            <button 
              onClick={checkPattern}
              className="bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center gap-2"
            >
              <CheckCircle2 /> Check Pattern
            </button>
          )}
        </div>

        {/* Sequencer Grid Area */}
        <div className={`bg-white border-2 rounded-2xl p-6 shadow-xl relative overflow-hidden flex-1 flex flex-col gap-4 transition-colors duration-300 ${isGridError ? 'border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-slate-700/50'}`}>
          
          {/* Tracks */}
          {[0, 1, 2].map((trackIdx) => (
            <div key={trackIdx} className={`flex items-center gap-4 ${(level < 4 && trackIdx > 0) ? 'opacity-20 pointer-events-none' : ''}`}>
              
              {/* Track Header */}
              <div className="w-24 shrink-0 flex flex-col gap-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {trackIdx === 0 ? "Melody" : trackIdx === 1 ? "Bass" : "Drum"}
                </div>
                {level === 4 && (
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => applyAlgorithm(trackIdx, 'even')} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-600 transition-colors" title="Even Numbers">E</button>
                    <button onClick={() => applyAlgorithm(trackIdx, 'prime')} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-600 transition-colors" title="Prime Numbers">P</button>
                    <button onClick={() => applyAlgorithm(trackIdx, 'fibonacci')} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-600 transition-colors" title="Fibonacci">F</button>
                  </div>
                )}
              </div>

              {/* Grid Cells */}
              <div className="flex-1 flex gap-2">
                {[...Array(NUM_STEPS)].map((_, stepIdx) => (
                  <button 
                    key={stepIdx} 
                    onClick={() => toggleCell(trackIdx, stepIdx)}
                    disabled={level === 4 || showSuccessMsg || (level < 4 && trackIdx > 0)}
                    className={`flex-1 aspect-square rounded-md border-2 transition-all duration-75 relative
                      ${currentStep === stepIdx ? 'border-white/50 bg-white/20 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10' : 'border-slate-800 bg-slate-950'}
                      ${grid[trackIdx][stepIdx] ? 
                        (trackIdx === 0 ? 'bg-sky-500/50 border-sky-400 shadow-[0_0_10px_#38bdf8]' : 
                         trackIdx === 1 ? 'bg-purple-500/50 border-purple-400 shadow-[0_0_10px_#c084fc]' : 
                         'bg-amber-500/50 border-amber-400 shadow-[0_0_10px_#fbbf24]') 
                      : 'hover:bg-slate-800'}
                      ${level < 4 && trackIdx === 0 ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-50 text-xs font-bold text-slate-400">
                      {stepIdx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Success Overlay for Levels 1-3 */}
          <AnimatePresence>
            {showSuccessMsg && level < 4 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
              >
                <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] max-w-xl text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-lg text-emerald-100 leading-relaxed font-sans">
                    {getSuccessMessage()}
                  </p>
                  <button 
                    onClick={nextLevel}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Sandbox Overlay Instructions */}
          <AnimatePresence>
            {level === 4 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 pointer-events-none flex items-end justify-center pb-4">
                <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 text-emerald-300 px-8 py-5 rounded-xl flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(16,185,129,0.2)] pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <Music className="animate-pulse" />
                    <span className="font-bold text-lg font-sans">Sandbox Mode! Apply algorithms to mix a math song.</span>
                  </div>
                  
                  <button 
                    disabled={!(tracksFilled[0] && tracksFilled[1] && tracksFilled[2])}
                    onClick={() => {
                       stopSequencer();
                       setLevel(5);
                       if (playChime) playChime();
                    }}
                    className={`mt-2 px-8 py-3 rounded-xl font-bold transition-all font-sans ${tracksFilled[0] && tracksFilled[1] && tracksFilled[2] ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_#10b981]' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'}`}
                  >
                    {tracksFilled[0] && tracksFilled[1] && tracksFilled[2] ? 'Confirm Composition' : 'Fill all 3 tracks to continue'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </LabShell>
  );
}
