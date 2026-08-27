"use client";

import React, { useState, useEffect } from "react";
import LabShell from "@/components/LabShell";
import SmartRing3DScene from "@/components/SmartRing3DScene";
import Celebration from "@/components/Celebration";
import { Activity, CreditCard, Hand, Fingerprint, Zap, Thermometer, ShieldAlert, Timer, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Command = "PAY" | "SWIPE_LEFT" | "SWIPE_RIGHT" | "CHECK_HR";

export default function SmartRing32() {
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [installedSensors, setInstalledSensors] = useState<string[]>([]);
  
  // Level 1 state
  const isLevel1Complete = installedSensors.length === 3;

  // Level 2 state
  const [temperature, setTemperature] = useState(36.5);
  const [feverThreshold, setFeverThreshold] = useState(38.5);
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [anomalyCaught, setAnomalyCaught] = useState(false);

  // Level 3 state
  const [timeLeft, setTimeLeft] = useState(30);
  const [commandsToClear, setCommandsToClear] = useState(5);
  const [currentCommand, setCurrentCommand] = useState<Command | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [level3Won, setLevel3Won] = useState(false);

  // General simulated data
  const [bpm, setBpm] = useState(72);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");

  // Handle sensor installation
  const handleInstallSensor = (sensorId: string) => {
    if (!installedSensors.includes(sensorId)) {
      setInstalledSensors(prev => [...prev, sensorId]);
    }
  };

  // Simulate BPM
  useEffect(() => {
    if (installedSensors.includes("heart")) {
      const interval = setInterval(() => {
        setBpm(prev => prev + (Math.floor(Math.random() * 5) - 2));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [installedSensors]);

  // Level 2 Temperature Simulation
  useEffect(() => {
    if (level === 2 && !anomalyCaught) {
      const interval = setInterval(() => {
        setTemperature(prev => {
          // Slowly increase temperature to simulate illness onset
          const nextTemp = prev + (Math.random() * 0.4);
          if (nextTemp > feverThreshold) {
            setIsAnomaly(true);
            setAnomalyCaught(true);
          }
          return nextTemp > 39.5 ? 39.5 : nextTemp;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [level, feverThreshold, anomalyCaught]);

  // Level 3 Timer and Commands
  useEffect(() => {
    if (level === 3 && !timeExpired && !level3Won) {
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
  }, [level, timeExpired, level3Won, currentCommand]);

  const generateNextCommand = () => {
    const commands: Command[] = ["PAY", "SWIPE_LEFT", "SWIPE_RIGHT", "CHECK_HR"];
    const next = commands[Math.floor(Math.random() * commands.length)];
    setCurrentCommand(next);
  };

  const executeAction = (action: Command) => {
    // Fulfill Level 3 Command
    if (level === 3 && currentCommand === action && !timeExpired && !level3Won) {
      setCommandsToClear(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setLevel3Won(true);
        } else {
          generateNextCommand();
        }
        return next;
      });
    }

    // Visual feedback for actions
    if (action === "PAY" && paymentStatus === "idle") {
      setPaymentStatus("processing");
      setTimeout(() => setPaymentStatus("success"), 800);
      setTimeout(() => setPaymentStatus("idle"), 2000);
    } else if (action === "SWIPE_LEFT") {
      setCurrentSlide(prev => Math.max(1, prev - 1));
    } else if (action === "SWIPE_RIGHT") {
      setCurrentSlide(prev => Math.min(5, prev + 1));
    } else if (action === "CHECK_HR") {
      setBpm(prev => prev + 5); // Just a visual bump
    }
  };

  const nextLevel = () => {
    if (level < 3) {
      setLevel(prev => (prev + 1) as 1 | 2 | 3);
      setIsAnomaly(false);
      setTemperature(36.5);
    }
  };

  const retryLevel3 = () => {
    setTimeLeft(30);
    setCommandsToClear(5);
    setTimeExpired(false);
    setLevel3Won(false);
    generateNextCommand();
  };

  return (
    <LabShell 
      title="The Smart Ring" 
      theme="studio" 
      labId="32"
      onReset={() => {
        setLevel(1);
        setInstalledSensors([]);
        setAnomalyCaught(false);
        setIsAnomaly(false);
        setTimeLeft(30);
        setCommandsToClear(5);
        setLevel3Won(false);
        setTimeExpired(false);
      }}
      instruction="1. Explore the engineering challenges of miniaturization and wearable technology. 2. Design the internal layout of the smart ring, balancing battery life and sensor capabilities. 3. Test the simulated smart ring for health monitoring and connectivity features. 4. Finalize the prototype that meets all user requirements and constraints."
    >
      <Celebration 
        isActive={level3Won} 
        message="You successfully engineered and field-tested the Smart Ring! Amazing miniaturization!" 
        onReplay={() => {
          setLevel(1);
          setInstalledSensors([]);
          setAnomalyCaught(false);
          setIsAnomaly(false);
          setTimeLeft(30);
          setCommandsToClear(5);
          setLevel3Won(false);
          setTimeExpired(false);
        }} 
      />
      
      <div className="flex flex-col h-full w-full gap-4">
        
        {/* Header / Mission Briefing */}
        <div className="bg-white border border-red-200 shadow-sm p-4 rounded-2xl shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-red-600 text-white text-xs font-black uppercase px-2 py-1 rounded">Level {level}</span>
              <h2 className="text-red-700 font-black text-lg md:text-xl tracking-wider uppercase">
                {level === 1 && "Mission: Hardware Engineering"}
                {level === 2 && "Mission: Early Illness Detection"}
                {level === 3 && "Mission: Real-World Field Test"}
              </h2>
            </div>
            <p className="text-slate-600 text-sm">
              {level === 1 && "Install micro-sensors onto the ring in the 3D view to unlock functionality."}
              {level === 2 && "Calibrate the software. Set the Fever Threshold to ~37.8°C to catch the temperature anomaly!"}
              {level === 3 && "Time Attack! Quickly execute the system commands on the dashboard before time runs out!"}
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            {level === 1 && (
              <>
                <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${installedSensors.includes('heart') ? 'bg-red-50 border-red-300 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <Activity className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">ECG Sensor</span>
                </div>
                <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${installedSensors.includes('nfc') ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">NFC Chip</span>
                </div>
                <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${installedSensors.includes('gesture') ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <Hand className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Accelerometer</span>
                </div>
              </>
            )}
            {level === 2 && (
              <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${anomalyCaught ? 'bg-red-50 border-red-300 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <Thermometer className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{anomalyCaught ? 'Anomaly Caught' : 'Monitoring Temp'}</span>
              </div>
            )}
            {level === 3 && (
              <div className={`flex-1 md:flex-none flex flex-col items-center justify-center p-2 rounded-lg border ${timeExpired ? 'bg-red-50 border-red-300 text-red-700' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
                <Timer className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-center">{timeLeft}s Left</span>
              </div>
            )}
          </div>
        </div>

        {/* Layout Container */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[400px]">
          
          {/* 3D Scene - Left side */}
          <div className="relative flex-1 lg:flex-[2] rounded-3xl overflow-hidden border-4 border-slate-300 shadow-2xl bg-[#e2e8f0] min-h-[300px]">
            <SmartRing3DScene 
              level={level}
              installedSensors={level === 1 ? installedSensors : ['heart', 'nfc', 'gesture']} // Show all installed after level 1
              isAnomaly={isAnomaly}
              onInstallSensor={handleInstallSensor}
            />
            
            {/* Helper Overlays */}
            {level === 1 && installedSensors.length === 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-slate-300 text-sm font-bold animate-pulse pointer-events-none">
                Click the floating sensors to install them into the ring
              </div>
            )}

            {level === 3 && !timeExpired && !level3Won && currentCommand && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-600 border-4 border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.8)] px-8 py-3 rounded-full text-white text-2xl font-black uppercase tracking-widest animate-pulse pointer-events-none z-10 whitespace-nowrap">
                {currentCommand === "PAY" && "ACTION: TAP TO PAY!"}
                {currentCommand === "SWIPE_LEFT" && "ACTION: SWIPE LEFT!"}
                {currentCommand === "SWIPE_RIGHT" && "ACTION: SWIPE RIGHT!"}
                {currentCommand === "CHECK_HR" && "ACTION: CHECK HEART RATE!"}
              </div>
            )}

            {level === 3 && timeExpired && !level3Won && (
              <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <ShieldAlert className="w-20 h-20 text-red-500 mb-4" />
                <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-4">Time Expired</h2>
                <button onClick={retryLevel3} className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-black uppercase tracking-widest">
                  Retry Field Test
                </button>
              </div>
            )}
          </div>

          {/* Right side: Real-time Dashboard */}
          <div className="flex-1 lg:flex-[1] flex flex-col gap-4">
            
            {/* Dashboard Header */}
            <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl p-4 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={`w-6 h-6 ${(installedSensors.length > 0 || level > 1) ? 'text-yellow-500 animate-pulse' : 'text-slate-400'}`} />
                <div>
                  <h3 className="text-slate-800 font-black uppercase tracking-widest text-sm">Smart Ring OS</h3>
                  {level === 1 && <p className="text-slate-500 text-xs font-mono">Sensors active: {installedSensors.length}/3</p>}
                  {level === 3 && <p className="text-slate-500 text-xs font-mono">Commands Remaining: {commandsToClear}</p>}
                </div>
              </div>
              
              {/* Next Level Buttons */}
              {level === 1 && isLevel1Complete && (
                <button onClick={nextLevel} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-black text-xs uppercase flex items-center gap-2 animate-bounce">
                  Next Level <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {level === 2 && anomalyCaught && (
                <button onClick={nextLevel} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-black text-xs uppercase flex items-center gap-2 animate-bounce">
                  Next Level <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dashboard Modules */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden pr-2 pb-2">
              
              {/* Level 2: Temperature Module */}
              <AnimatePresence>
                {level === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className={`border-l-4 rounded-xl px-3 py-2 shadow-sm flex flex-col transition-colors ${anomalyCaught ? 'bg-red-50 border-red-400' : 'bg-white border-orange-300'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Thermometer className={`${anomalyCaught ? 'text-red-500 animate-pulse' : 'text-orange-500'} w-4 h-4`} />
                      <h4 className={`${anomalyCaught ? 'text-red-700' : 'text-orange-600'} font-bold uppercase text-[10px] tracking-widest`}>
                        {anomalyCaught ? "Illness Anomaly Detected!" : "Biometric Calibration"}
                      </h4>
                    </div>
                    
                    <div className="flex items-end justify-between mb-1">
                      <div>
                        <div className={`text-xl font-black font-mono ${anomalyCaught ? 'text-red-600' : 'text-slate-800'}`}>
                          {temperature.toFixed(1)}° <span className="text-xs text-slate-500 font-normal tracking-wider">C</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Live Body Temp</div>
                      </div>
                    </div>

                    {!anomalyCaught && (
                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest">
                          <span>Alert Threshold:</span>
                          <span className="text-orange-600">{feverThreshold.toFixed(1)}°C</span>
                        </div>
                        <input 
                          type="range" 
                          min="37.0" max="39.5" step="0.1" 
                          value={feverThreshold}
                          onChange={(e) => setFeverThreshold(parseFloat(e.target.value))}
                          className="w-full h-1 accent-orange-500"
                        />
                        <p className="text-[9px] text-slate-500 mt-1 text-center">Lower threshold to catch the fever early!</p>
                      </div>
                    )}

                    {anomalyCaught && (
                      <div className="bg-red-100 text-red-700 p-2 rounded border border-red-200 text-[10px] font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Patient Warned Successfully
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Module 1: Heart Rate */}
              <AnimatePresence>
                {(installedSensors.includes("heart") || level > 1) && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className={`bg-white border-l-4 rounded-xl px-3 py-2 shadow-sm flex flex-col transition-colors ${currentCommand === 'CHECK_HR' ? 'border-red-500 bg-red-50' : 'border-red-300'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="text-red-500 w-4 h-4 animate-pulse" />
                      <h4 className="text-red-700 font-bold uppercase text-[10px] tracking-widest">ECG Health Monitor</h4>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xl font-black text-slate-800 font-mono">{bpm} <span className="text-xs text-slate-500 font-normal tracking-wider">BPM</span></div>
                        <div className="text-[10px] text-red-600 mt-0.5">Status: Optimal</div>
                      </div>
                      {/* Interactive Button for Level 3 */}
                      {level === 3 ? (
                        <button onClick={() => executeAction("CHECK_HR")} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold uppercase">
                          Check HR
                        </button>
                      ) : (
                        <div className="w-20 h-6 bg-red-500/10 rounded overflow-hidden relative">
                          <motion.div 
                            animate={{ x: [-80, 80] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="w-full h-full border-t border-red-500 absolute top-1/2" 
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Module 2: NFC Payment */}
              <AnimatePresence>
                {(installedSensors.includes("nfc") || level > 1) && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className={`bg-white border-l-4 rounded-xl px-3 py-2 shadow-sm flex flex-col transition-colors ${currentCommand === 'PAY' ? 'border-blue-500 bg-blue-50' : 'border-blue-300'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="text-blue-500 w-4 h-4" />
                      <h4 className="text-blue-700 font-bold uppercase text-[10px] tracking-widest">Contactless Payment</h4>
                    </div>
                    
                    <button 
                      onClick={() => executeAction("PAY")}
                      disabled={paymentStatus !== "idle"}
                      className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-colors ${
                        paymentStatus === "idle" ? "bg-blue-600 hover:bg-blue-500 text-white" :
                        paymentStatus === "processing" ? "bg-blue-100 text-blue-700 animate-pulse" :
                        "bg-emerald-600 text-white"
                      }`}
                    >
                      {paymentStatus === "idle" && "Simulate Tap to Pay"}
                      {paymentStatus === "processing" && "Processing..."}
                      {paymentStatus === "success" && "Payment Approved ✓"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Module 3: Gesture Control */}
              <AnimatePresence>
                {(installedSensors.includes("gesture") || level > 1) && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className={`bg-white border-l-4 rounded-xl px-3 py-2 shadow-sm flex flex-col transition-colors ${(currentCommand === 'SWIPE_LEFT' || currentCommand === 'SWIPE_RIGHT') ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-300'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Hand className="text-emerald-500 w-4 h-4" />
                      <h4 className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest">Gesture Controller</h4>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center mb-1">
                      <div className="text-slate-700 font-mono text-[10px]">Presentation Slide: {currentSlide}/5</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => executeAction("SWIPE_LEFT")} className={`flex-1 py-1 rounded font-bold text-[10px] uppercase ${currentCommand === 'SWIPE_LEFT' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'}`}>
                        Swipe Left
                      </button>
                      <button onClick={() => executeAction("SWIPE_RIGHT")} className={`flex-1 py-1 rounded font-bold text-[10px] uppercase ${currentCommand === 'SWIPE_RIGHT' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'}`}>
                        Swipe Right
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty State */}
              {level === 1 && installedSensors.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-300 rounded-xl mt-4">
                  <Fingerprint className="w-12 h-12 text-slate-400 mb-2" />
                  <h4 className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-1">No Sensors Installed</h4>
                  <p className="text-slate-500 text-xs">Install sensors on the 3D model to activate modules.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
