"use client";

import React, { useState, useEffect } from "react";
import LabShell from "@/components/LabShell";
import GestureHand3DScene, { GestureType } from "@/components/GestureHand3DScene";
import Celebration from "@/components/Celebration";
import { Activity, Target, BrainCircuit, Eye, Hand, Tv, VolumeX, Sun, ArrowRight, ShieldAlert, Timer, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback } from "react";

type SmartHomeCommand = "TURN_OFF_TV" | "MUTE_MUSIC" | "OPEN_BLINDS";

export default function GestureControl40() {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [currentGesture, setCurrentGesture] = useState<GestureType>("idle");
  
  // Level 1: Hardware
  const [trackingPointsDeployed, setTrackingPointsDeployed] = useState(0);

  // Level 2: ML Calibration
  const [trainingProgress, setTrainingProgress] = useState({ fist: 0, point: 0, open: 0 });
  const [isTraining, setIsTraining] = useState<GestureType | null>(null);

  // Level 3: Accessibility
  const [accessibilityMappings, setAccessibilityMappings] = useState({ fist: false, point: false, open: false });

  // Level 4: Time Attack
  const [timeLeft, setTimeLeft] = useState(30);
  const [commandsToClear, setCommandsToClear] = useState(5);
  const [currentCommand, setCurrentCommand] = useState<SmartHomeCommand | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [campaignWon, setCampaignWon] = useState(false);

  // ML Training simulation
  useEffect(() => {
    if (isTraining) {
      setCurrentGesture(isTraining);
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          const currentVal = prev[isTraining as keyof typeof prev];
          if (currentVal >= 100) {
            clearInterval(interval);
            setIsTraining(null);
            setCurrentGesture("idle");
            return prev;
          }
          return { ...prev, [isTraining]: currentVal + 5 };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const generateNextCommand = useCallback(() => {
    const commands: SmartHomeCommand[] = ["TURN_OFF_TV", "MUTE_MUSIC", "OPEN_BLINDS"];
    const next = commands[Math.floor(Math.random() * commands.length)];
    setCurrentCommand(next);
  }, []);

  // Level 4 Timer
  useEffect(() => {
    if (level === 4 && !timeExpired && !campaignWon) {
      if (!currentCommand) generateNextCommand();

      const t = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimeExpired(true);
            clearInterval(t);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [level, timeExpired, campaignWon, currentCommand, generateNextCommand]);

  const handleDeployNode = () => {
    if (trackingPointsDeployed < 3) {
      setTrackingPointsDeployed(prev => prev + 1);
    }
  };

  const startTraining = (gesture: GestureType) => {
    if (isTraining || trainingProgress[gesture as keyof typeof trainingProgress] >= 100) return;
    setIsTraining(gesture);
  };

  const toggleMapping = (gesture: keyof typeof accessibilityMappings) => {
    setAccessibilityMappings(prev => ({ ...prev, [gesture]: !prev[gesture] }));
  };

  const executeCommand = (gesture: GestureType) => {
    setCurrentGesture(gesture);
    setTimeout(() => setCurrentGesture("idle"), 500);

    if (level === 4 && !timeExpired && !campaignWon && currentCommand) {
      let isCorrect = false;
      if (currentCommand === "TURN_OFF_TV" && gesture === "point") isCorrect = true;
      if (currentCommand === "MUTE_MUSIC" && gesture === "fist") isCorrect = true;
      if (currentCommand === "OPEN_BLINDS" && gesture === "open") isCorrect = true;

      if (isCorrect) {
        setCommandsToClear(prev => {
          const next = prev - 1;
          if (next <= 0) setCampaignWon(true);
          else generateNextCommand();
          return next;
        });
      }
    }
  };

  const nextLevel = () => {
    if (level < 4) setLevel(prev => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const retryLevel4 = () => {
    setTimeLeft(30);
    setCommandsToClear(5);
    setTimeExpired(false);
    setCampaignWon(false);
    generateNextCommand();
  };

  // State checks for UI
  const isLevel1Complete = trackingPointsDeployed === 3;
  const isLevel2Complete = trainingProgress.fist >= 100 && trainingProgress.point >= 100 && trainingProgress.open >= 100;
  const isLevel3Complete = accessibilityMappings.fist && accessibilityMappings.point && accessibilityMappings.open;

  const handleReset = () => {
    setLevel(1);
    setTrackingPointsDeployed(0);
    setTrainingProgress({ fist: 0, point: 0, open: 0 });
    setAccessibilityMappings({ fist: false, point: false, open: false });
    setTimeLeft(30);
    setCommandsToClear(5);
    setCampaignWon(false);
    setTimeExpired(false);
  };

  return (
    <LabShell 
      title="The Gesture Control Device" 
      theme="neon" 
      labId="40"
      onReset={handleReset}
      instruction="1. Learn the principles of human-computer interaction (HCI) and gesture recognition. 2. Calibrate the simulated gesture control device using the virtual robotic hand. 3. Map specific hand movements to corresponding computer commands. 4. Perform a series of interactive tasks using only the calibrated gesture controls."
    >
      <Celebration 
        isActive={campaignWon} 
        message="Bionic Hand successfully engineered, calibrated, and field-tested in the Smart Home!" 
        onReplay={handleReset}
      />
      
      <div className="flex flex-col h-full w-full gap-4">
        
        {/* Header / Mission Briefing */}
        <div className="bg-white border border-slate-300 shadow-sm p-4 rounded-2xl shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-fuchsia-600 text-white text-xs font-black uppercase px-2 py-1 rounded">Level {level}</span>
              <h2 className="text-black font-black text-lg md:text-xl tracking-wider uppercase">
                {level === 1 && "Mission: Hardware Initialization"}
                {level === 2 && "Mission: AI Gesture Calibration"}
                {level === 3 && "Mission: Accessibility Mapping"}
                {level === 4 && "Mission: Smart Home Time Attack"}
              </h2>
            </div>
            <p className="text-black text-sm font-medium">
              {level === 1 && "Deploy the 3 Infrared Nodes in the 3D space to establish tracking limits."}
              {level === 2 && "Train the AI models! Click to calibrate the 'Fist', 'Point', and 'Open' gestures."}
              {level === 3 && "Map alternative bio-inputs (like eye tracking) to gestures for paralyzed patients."}
              {level === 4 && "Time Attack! Quickly trigger the correct bionic hand gestures before time runs out!"}
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            {level === 1 && (
              <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400">
                <Target className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{trackingPointsDeployed}/3 IR Nodes</span>
              </div>
            )}
            {level === 2 && (
              <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400">
                <BrainCircuit className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider">ML Calibrator</span>
              </div>
            )}
            {level === 3 && (
              <div className="flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400">
                <Eye className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Bio-Mapping Active</span>
              </div>
            )}
            {level === 4 && (
              <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 px-6 rounded-lg border ${timeExpired ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-500'}`}>
                <Timer className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-center">{timeLeft}s Left</span>
              </div>
            )}
          </div>
        </div>

        {/* Layout Container */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[400px]">
          
          {/* 3D Scene - Left side */}
          <div className="relative flex-1 lg:flex-[2] rounded-3xl overflow-hidden border-4 border-[#27272a] shadow-2xl bg-[#09090b] min-h-[300px]">
            <GestureHand3DScene 
              level={level}
              currentGesture={currentGesture}
              trackingPointsDeployed={trackingPointsDeployed}
              onDeployTrackingPoint={handleDeployNode}
            />
            
            {level === 4 && !timeExpired && !campaignWon && currentCommand && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-fuchsia-600 border-4 border-fuchsia-900 shadow-[0_0_30px_rgba(192,38,211,0.8)] px-8 py-3 rounded-full text-white text-2xl font-black uppercase tracking-widest animate-pulse pointer-events-none z-10 whitespace-nowrap">
                {currentCommand === "TURN_OFF_TV" && "COMMAND: TURN OFF TV!"}
                {currentCommand === "MUTE_MUSIC" && "COMMAND: MUTE MUSIC!"}
                {currentCommand === "OPEN_BLINDS" && "COMMAND: OPEN BLINDS!"}
              </div>
            )}

            {level === 4 && timeExpired && !campaignWon && (
              <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <ShieldAlert className="w-20 h-20 text-red-500 mb-4" />
                <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-4">Time Expired</h2>
                <button onClick={retryLevel4} className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-black uppercase tracking-widest">
                  Retry Field Test
                </button>
              </div>
            )}
          </div>

          {/* Right side: Dashboard Panel */}
          <div className="flex-1 lg:flex-[1] flex flex-col gap-2">
            
            {/* Dashboard Header */}
            <div className="bg-white border-2 border-slate-300 shadow-sm rounded-2xl p-4 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-fuchsia-600 animate-pulse" />
                <div>
                  <h3 className="text-black font-black uppercase tracking-widest text-sm">Robotic Hand OS</h3>
                  {level === 4 ? (
                    <p className="text-black font-medium text-xs font-mono">Commands Remaining: {commandsToClear}</p>
                  ) : (
                    <p className="text-black font-medium text-xs font-mono">System Status: {trackingPointsDeployed === 3 ? "ONLINE" : "BOOTING"}</p>
                  )}
                </div>
              </div>
              
              {/* Next Level Buttons */}
              {level === 1 && isLevel1Complete && (
                <button onClick={nextLevel} className="px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded font-black text-[10px] uppercase flex items-center gap-2 animate-bounce">
                  Next Level <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {level === 2 && isLevel2Complete && (
                <button onClick={nextLevel} className="px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded font-black text-[10px] uppercase flex items-center gap-2 animate-bounce">
                  Next Level <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {level === 3 && isLevel3Complete && (
                <button onClick={nextLevel} className="px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded font-black text-[10px] uppercase flex items-center gap-2 animate-bounce">
                  Start Field Test <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Dashboard Modules */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden pr-2 pb-2">
              
              {/* Module: Fist Gesture */}
              <AnimatePresence>
                {level >= 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-[#18181b] border-l-4 border-red-500 rounded-xl px-4 py-3 shadow-lg flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Hand className="text-red-500 w-4 h-4" />
                        <h4 className="text-red-400 font-bold uppercase text-[10px] tracking-widest">Fist Gesture</h4>
                      </div>
                      {level === 2 && trainingProgress.fist >= 100 && <CheckCircle2 className="text-red-500 w-4 h-4" />}
                    </div>

                    {level === 2 && (
                      <div className="flex gap-3 items-center">
                        <button 
                          onClick={() => startTraining("fist")}
                          disabled={isTraining !== null || trainingProgress.fist >= 100}
                          className="px-3 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded font-bold text-[10px] uppercase disabled:opacity-50"
                        >
                          {trainingProgress.fist >= 100 ? "Trained" : "Train AI"}
                        </button>
                        <div className="flex-1 bg-black/50 h-2 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full transition-all duration-200" style={{ width: `${trainingProgress.fist}%` }} />
                        </div>
                      </div>
                    )}

                    {level === 3 && (
                      <div className="flex items-center justify-between bg-black/50 p-2 rounded">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Map: Eye Blink</span>
                        <button onClick={() => toggleMapping("fist")} className={`w-8 h-4 rounded-full transition-colors relative ${accessibilityMappings.fist ? 'bg-red-500' : 'bg-slate-700'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${accessibilityMappings.fist ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    )}

                    {level === 4 && (
                      <div className="flex gap-2">
                        <button onClick={() => executeCommand("fist")} className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-black text-[10px] uppercase">
                          Mute Music
                        </button>
                        <VolumeX className="text-red-500 w-8 h-8 p-1 bg-red-900/20 rounded" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Module: Point Gesture */}
              <AnimatePresence>
                {level >= 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-[#18181b] border-l-4 border-blue-500 rounded-xl px-4 py-3 shadow-lg flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="text-blue-500 w-4 h-4" />
                        <h4 className="text-blue-400 font-bold uppercase text-[10px] tracking-widest">Point Gesture</h4>
                      </div>
                      {level === 2 && trainingProgress.point >= 100 && <CheckCircle2 className="text-blue-500 w-4 h-4" />}
                    </div>

                    {level === 2 && (
                      <div className="flex gap-3 items-center">
                        <button 
                          onClick={() => startTraining("point")}
                          disabled={isTraining !== null || trainingProgress.point >= 100}
                          className="px-3 py-2 bg-blue-900/50 hover:bg-blue-900 text-blue-200 rounded font-bold text-[10px] uppercase disabled:opacity-50"
                        >
                          {trainingProgress.point >= 100 ? "Trained" : "Train AI"}
                        </button>
                        <div className="flex-1 bg-black/50 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full transition-all duration-200" style={{ width: `${trainingProgress.point}%` }} />
                        </div>
                      </div>
                    )}

                    {level === 3 && (
                      <div className="flex items-center justify-between bg-black/50 p-2 rounded">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Map: Head Tilt Right</span>
                        <button onClick={() => toggleMapping("point")} className={`w-8 h-4 rounded-full transition-colors relative ${accessibilityMappings.point ? 'bg-blue-500' : 'bg-slate-700'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${accessibilityMappings.point ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    )}

                    {level === 4 && (
                      <div className="flex gap-2">
                        <button onClick={() => executeCommand("point")} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-black text-[10px] uppercase">
                          Turn Off TV
                        </button>
                        <Tv className="text-blue-500 w-8 h-8 p-1 bg-blue-900/20 rounded" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Module: Open Hand Gesture */}
              <AnimatePresence>
                {level >= 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-[#18181b] border-l-4 border-emerald-500 rounded-xl px-4 py-3 shadow-lg flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Hand className="text-emerald-500 w-4 h-4" />
                        <h4 className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Open Hand Gesture</h4>
                      </div>
                      {level === 2 && trainingProgress.open >= 100 && <CheckCircle2 className="text-emerald-500 w-4 h-4" />}
                    </div>

                    {level === 2 && (
                      <div className="flex gap-3 items-center">
                        <button 
                          onClick={() => startTraining("open")}
                          disabled={isTraining !== null || trainingProgress.open >= 100}
                          className="px-3 py-2 bg-emerald-900/50 hover:bg-emerald-900 text-emerald-200 rounded font-bold text-[10px] uppercase disabled:opacity-50"
                        >
                          {trainingProgress.open >= 100 ? "Trained" : "Train AI"}
                        </button>
                        <div className="flex-1 bg-black/50 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-200" style={{ width: `${trainingProgress.open}%` }} />
                        </div>
                      </div>
                    )}

                    {level === 3 && (
                      <div className="flex items-center justify-between bg-black/50 p-2 rounded">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Map: Jaw Clench</span>
                        <button onClick={() => toggleMapping("open")} className={`w-8 h-4 rounded-full transition-colors relative ${accessibilityMappings.open ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${accessibilityMappings.open ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    )}

                    {level === 4 && (
                      <div className="flex gap-2">
                        <button onClick={() => executeCommand("open")} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-black text-[10px] uppercase">
                          Open Blinds
                        </button>
                        <Sun className="text-emerald-500 w-8 h-8 p-1 bg-emerald-900/20 rounded" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
