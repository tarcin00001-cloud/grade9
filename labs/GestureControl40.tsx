"use client";

import React, { useState, useRef, useCallback } from "react";
import LabShell from "@/components/LabShell";
import Celebration from "@/components/Celebration";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import { Terminal, ShieldAlert, ShieldCheck, Activity, ArrowRight, Settings2, Unplug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Point = { x: number; y: number };

type LabStep = "LEARN" | "TRY" | "FAIL" | "UNDERSTAND" | "IMPROVE" | "COMPLETE" | "OUTCOME";

export default function GestureControl40() {
  const { reportComplete } = useLMSBridge("gesturecontrol40"); // just to be safe
  const { playPop, playError, playSuccess, playClick } = useLabAudio();
  const [step, setStep] = useState<LabStep>("LEARN");
  const [isSmoothingEnabled, setIsSmoothingEnabled] = useState(false);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [rawPoints, setRawPoints] = useState<Point[]>([]);
  const [noisyPoints, setNoisyPoints] = useState<Point[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);
  const [lastDrawnPoints, setLastDrawnPoints] = useState<Point[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Vault state
  const [vaultStatus, setVaultStatus] = useState<"LOCKED" | "UNLOCKED" | "ERROR">("LOCKED");

  const WINDOW_SIZE = 10;
  const JITTER_AMOUNT = 20;

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (step !== "TRY" && step !== "COMPLETE") return;
    if (vaultStatus === "ERROR" || vaultStatus === "UNLOCKED") return;

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const p = { x, y };
      
      setRawPoints([p]);
      setNoisyPoints([p]);
      setFilteredPoints([p]);
      setIsDrawing(true);
      setVaultStatus("LOCKED");
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newPoint = { x, y };
      
      setRawPoints(prev => [...prev, newPoint]);

      // Add noise
      const noiseX = (Math.random() - 0.5) * JITTER_AMOUNT;
      const noiseY = (Math.random() - 0.5) * JITTER_AMOUNT;
      const newNoisyPoint = { x: x + noiseX, y: y + noiseY };
      
      let nextNoisyPoints: Point[] = [];
      setNoisyPoints(prev => {
        nextNoisyPoints = [...prev, newNoisyPoint];
        return nextNoisyPoints;
      });

      // Apply Moving Average
      setFilteredPoints(prev => {
        const recentNoisy = nextNoisyPoints.slice(-WINDOW_SIZE);
        const sum = recentNoisy.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        const avgPoint = { x: sum.x / recentNoisy.length, y: sum.y / recentNoisy.length };
        return [...prev, avgPoint];
      });
    }
  };

  const evaluateSwipe = useCallback((points: Point[]) => {
    if (points.length < 10) return false;
    const start = points[0];
    const end = points[points.length - 1];
    
    // Check horizontal swipe
    const dx = end.x - start.x;
    const dy = Math.abs(end.y - start.y);
    
    // Smoothness check: check if consecutive points jump too much
    let maxJump = 0;
    for (let i = 1; i < points.length; i++) {
      const d = Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
      if (d > maxJump) maxJump = d;
    }

    // A valid swipe needs to be mostly horizontal, long enough, and smooth enough
    const isLongEnough = dx > 150;
    const isHorizontal = dy < 100;
    const isSmooth = maxJump < 30; // 30 is threshold. Noisy will jump ~40+ occasionally

    return isLongEnough && isHorizontal && isSmooth;
  }, []);

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const targetPoints = isSmoothingEnabled ? filteredPoints : noisyPoints;
    setLastDrawnPoints(targetPoints);

    if (targetPoints.length < 5) {
        setRawPoints([]);
        setNoisyPoints([]);
        setFilteredPoints([]);
        return; // Too short
    }

    const isValid = evaluateSwipe(targetPoints);

    if (!isValid) {
      setVaultStatus("ERROR");
      if (playError) playError();
      if (step === "TRY") {
        setTimeout(() => {
          setStep("FAIL");
        }, 1500);
      }
    } else {
      setVaultStatus("UNLOCKED");
      if (playSuccess) playSuccess();
      if (step === "COMPLETE") {
        setStep("OUTCOME");
        setTimeout(() => {
          reportComplete();
        }, 4500);
      }
    }
  };

  const getPathData = (points: Point[]) => {
    if (points.length === 0) return "";
    return points.reduce((acc, p, i) => {
      return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, "");
  };

  const handleReset = () => {
    if (playClick) playClick();
    setStep("LEARN");
    setIsSmoothingEnabled(false);
    setRawPoints([]);
    setNoisyPoints([]);
    setFilteredPoints([]);
    setLastDrawnPoints([]);
    setVaultStatus("LOCKED");
  };

  return (
    <LabShell
      title="The Gesture Control Device"
      theme="grade9"
      bgOverride="bg-emerald-50"
      labId="gesturecontrol40"
      onReset={handleReset}
      instruction="Real-world sensors pick up noise. Learn how software smooths noisy hardware data."
    >
      {step === "OUTCOME" && (
        <Celebration isActive={true} message="Vault Unlocked! Gesture recognized flawlessly." onReplay={handleReset} />
      )}

      <div className="flex flex-col h-full max-w-5xl mx-auto w-full gap-4 relative">
        
        {/* Header Section */}
        <div className="bg-white border-2 border-emerald-200 shadow-sm p-4 rounded-2xl shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-emerald-950 font-black text-xl flex items-center gap-2">
              <Activity className="text-emerald-500 w-6 h-6" />
              Sensor Calibration Lab
            </h2>
            <p className="text-emerald-700 text-sm font-medium mt-1">
              {step === "LEARN" && "Welcome. We need to program a gesture-unlock system."}
              {step === "TRY" && "Try drawing a long horizontal swipe (left to right) to unlock the vault."}
              {step === "FAIL" && "The hardware sensor data was too noisy!"}
              {step === "UNDERSTAND" && "Micro-vibrations in the accelerometer scramble the gesture."}
              {step === "IMPROVE" && "Let's apply a Moving Average filter to smooth the data."}
              {step === "COMPLETE" && "Filter active! Try drawing the swipe again."}
              {step === "OUTCOME" && "Success! The data stream is clean and reliable."}
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-2">
             <div className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${isSmoothingEnabled ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                Filter: {isSmoothingEnabled ? "ON" : "OFF"}
             </div>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          
          {/* LEFT: Drawing Canvas & Vault */}
          <div className="flex-1 flex flex-col bg-white border-2 border-emerald-200 rounded-3xl overflow-hidden shadow-sm relative">
            
            {/* Vault Status UI */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
               <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border-2 shadow-lg transition-colors duration-500 ${
                  vaultStatus === "LOCKED" ? "bg-slate-800 border-slate-700 text-white" :
                  vaultStatus === "ERROR" ? "bg-red-600 border-red-500 text-white" :
                  "bg-emerald-500 border-emerald-400 text-white"
               }`}>
                  {vaultStatus === "LOCKED" && <ShieldAlert className="w-6 h-6" />}
                  {vaultStatus === "ERROR" && <ShieldAlert className="w-6 h-6 animate-bounce" />}
                  {vaultStatus === "UNLOCKED" && <ShieldCheck className="w-6 h-6" />}
                  <span className="font-black tracking-wider uppercase">
                    {vaultStatus === "LOCKED" && "VAULT LOCKED"}
                    {vaultStatus === "ERROR" && "UNRECOGNIZED GESTURE"}
                    {vaultStatus === "UNLOCKED" && "VAULT OPEN"}
                  </span>
               </div>
            </div>

            <div className="flex-1 relative cursor-crosshair touch-none" style={{ touchAction: 'none' }}>
                {/* Background grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                {/* Target Swipe Guideline */}
                {(step === "TRY" || step === "COMPLETE") && (
                    <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-16 border-4 border-dashed border-emerald-100 rounded-full pointer-events-none flex items-center justify-center">
                        <ArrowRight className="w-8 h-8 text-emerald-200" />
                    </div>
                )}

                <svg 
                  ref={svgRef}
                  className="w-full h-full absolute inset-0 z-0"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  <path 
                    d={getPathData(isSmoothingEnabled ? filteredPoints : noisyPoints)} 
                    fill="none" 
                    stroke={vaultStatus === "ERROR" ? "#ef4444" : (isSmoothingEnabled ? "#10b981" : "#f59e0b")} 
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-300"
                  />
                  {/* Show raw (invisible/faint) path to imply hardware tracking */}
                  {isSmoothingEnabled && (
                      <path 
                        d={getPathData(noisyPoints)} 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="2"
                        strokeOpacity="0.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                  )}
                </svg>

                {/* Overlays for different steps */}
                <AnimatePresence>
                  {step === "LEARN" && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                       <Unplug className="w-16 h-16 text-emerald-600 mb-4" />
                       <h3 className="text-2xl font-black text-emerald-950 mb-2">Hardware is Messy</h3>
                       <p className="text-emerald-700 max-w-md mb-6">Accelerometers and touch sensors pick up every tiny vibration and electrical fluctuation. This is called "noise".</p>
                       <button onClick={() => setStep("TRY")} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105">
                         Begin Calibration
                       </button>
                    </motion.div>
                  )}
                  {step === "FAIL" && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                       <h3 className="text-2xl font-black text-red-600 mb-2">Authentication Failed</h3>
                       <p className="text-slate-600 max-w-md mb-6">The system couldn't read your swipe because the raw line is too jagged.</p>
                       <button onClick={() => setStep("UNDERSTAND")} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full shadow-lg">
                         Diagnose Issue
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>

            </div>
          </div>

          {/* RIGHT: Data Terminal Sidebar */}
          <div className="lg:w-80 flex flex-col gap-4">
             <div className="bg-slate-900 rounded-3xl p-4 flex-1 flex flex-col shadow-inner border-4 border-slate-800 overflow-hidden relative">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                   <Terminal className="text-emerald-400 w-5 h-5" />
                   <h3 className="text-slate-300 font-mono text-sm font-bold uppercase">Raw Data Stream</h3>
                </div>

                {/* Simulated Terminal Scrolling */}
                <div className="flex-1 overflow-hidden relative font-mono text-[10px] leading-relaxed flex flex-col justify-end pb-2">
                   {noisyPoints.length === 0 && lastDrawnPoints.length === 0 && (
                     <div className="text-slate-600 italic">Waiting for input...</div>
                   )}
                   
                   {/* Display last ~15 points */}
                   <div className="flex flex-col gap-1 w-full absolute bottom-0">
                      {(isDrawing ? noisyPoints : lastDrawnPoints).slice(-15).map((p, i) => (
                        <div key={i} className="flex justify-between w-full border-b border-slate-800 pb-0.5">
                           <span className="text-slate-500">X: {Math.round(p.x)}</span>
                           <span className="text-slate-500">Y: {Math.round(p.y)}</span>
                           <span className={isSmoothingEnabled ? "text-emerald-400" : "text-amber-500"}>
                              {isSmoothingEnabled ? "FILTERED" : "NOISY"}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Overlays for sidebar */}
                {step === "UNDERSTAND" && (
                   <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center z-10">
                      <Settings2 className="w-12 h-12 text-amber-500 mb-4 animate-spin-slow" />
                      <h4 className="text-white font-bold mb-2">Look at the Data</h4>
                      <p className="text-slate-400 text-xs mb-4">Notice how the Y-coordinates jump up and down wildly? The computer can't recognize a straight line in this chaos.</p>
                      <button onClick={() => setStep("IMPROVE")} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm">
                        Fix Algorithm
                      </button>
                   </div>
                )}
             </div>

             {/* Action Panel */}
             <div className="bg-white border-2 border-emerald-200 rounded-3xl p-4 flex flex-col gap-3">
                <h3 className="text-emerald-950 font-black text-sm uppercase tracking-wider">Algorithm Settings</h3>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                   <div>
                     <span className="block text-sm font-bold text-slate-800">Moving Average</span>
                     <span className="text-xs text-slate-500">Window: 10 samples</span>
                   </div>
                   <button 
                      onClick={() => {
                         setIsSmoothingEnabled(prev => !prev);
                         if (step === "IMPROVE") setStep("COMPLETE");
                      }}
                      disabled={step !== "IMPROVE" && step !== "COMPLETE" && step !== "OUTCOME"}
                      className={`relative w-14 h-8 rounded-full transition-colors duration-300 disabled:opacity-50 ${isSmoothingEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow ${isSmoothingEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                   </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </LabShell>
  );
}
