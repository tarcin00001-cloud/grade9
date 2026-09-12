"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Cloud, Server, AlertTriangle, CheckCircle2, Play, 
  ToggleLeft, ToggleRight, Radio, Activity, Zap, Timer, MapPin, Building2, Car
} from "lucide-react";

export default function EdgeComputing9() {
  const { reportComplete } = useLMSBridge("edgecomputing9");
  const { playPop, playError, playSuccess, playClick } = useLabAudio();

  // Timer State
  const TIMER_DURATION = 5 * 60;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Lab State
  const [phase, setPhase] = useState(0); 
  const [networkMode, setNetworkMode] = useState<'cloud' | 'edge'>('cloud');
  const [carState, setCarState] = useState<'idle' | 'driving' | 'braking' | 'safe' | 'crashed'>('idle');
  const [obstacleVisible, setObstacleVisible] = useState(false);
  const [carLeft, setCarLeft] = useState("10%");
  const [carTransition, setCarTransition] = useState("none");
  const [pingPos, setPingPos] = useState({ left: "15%", bottom: "35%", opacity: 0, transition: "none" });

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  const runSimulation = async () => {
    if (phase === 0) setPhase(1);
    if (phase === 4) setPhase(5);
    
    // Reset state
    setObstacleVisible(false);
    setCarState('idle');
    setCarTransition('none');
    setCarLeft("10%");
    setPingPos({ left: "15%", bottom: "35%", opacity: 0, transition: "none" });
    
    await wait(50); // Frame buffer for reset
    
    // Start driving
    setCarState('driving');
    setCarTransition('left 3s linear');
    setCarLeft("75%"); // drives directly into obstacle at 75%
    playClick();

    await wait(800); // Wait for car to reach ~30%
    
    // Hazard appears!
    setObstacleVisible(true);
    playPop();
    
    // Send ping
    if (networkMode === 'cloud') {
      // Car is at ~30%. Ping flies to cloud.
      setPingPos({ left: "85%", bottom: "80%", opacity: 1, transition: "all 0.8s cubic-bezier(0.4, 0, 1, 1)" });
      await wait(800); // Latency
      // Fly back to where car will be (~60%)
      setPingPos({ left: "60%", bottom: "30%", opacity: 1, transition: "all 0.8s cubic-bezier(0, 0, 0.2, 1)" });
      await wait(800); // Latency
      setPingPos(prev => ({ ...prev, opacity: 0 }));
      
      // Ping arrived. Car is already at 75% (3s elapsed).
      setCarState('crashed');
      playError();
      if (phase === 0 || phase === 1) {
        setPhase(2);
        setTimeout(() => setPhase(3), 2000);
      }
    } else {
      // Edge Mode
      // Car is at ~30%. Ping flies to edge tower.
      setPingPos({ left: "35%", bottom: "45%", opacity: 1, transition: "all 0.1s linear" });
      await wait(100);
      // Fly back
      setPingPos({ left: "35%", bottom: "30%", opacity: 1, transition: "all 0.1s linear" });
      await wait(100);
      setPingPos(prev => ({ ...prev, opacity: 0 }));
      
      // Brakes engaged instantly!
      setCarState('braking');
      // Override transition to slow down safely and stop at 55%
      setCarTransition('left 0.8s ease-out');
      setCarLeft("55%");
      playSuccess(); // braking sound
      
      await wait(800);
      setCarState('safe');
      if (phase >= 4) {
        setPhase(6);
        setTimeout(reportComplete, 1500);
      }
    }
  };

  const getInstruction = () => {
    switch(phase) {
      case 0: return "Self-driving cars send sensor data to servers to know when to brake. Let's test its reflexes.";
      case 1: return "Driving at 60mph... Hazard detected! Sending data to the Cloud...";
      case 2: return "CRASH! The data took too long to travel.";
      case 3: return "The 200ms latency to Tokyo caused the crash. Toggle the network routing to the local Edge Node.";
      case 4: return "Edge Node activated! Press Simulate Hazard to test the new local connection.";
      case 5: return "Driving at 60mph... Hazard detected! Sending data to Edge Node...";
      case 6: return "SUCCESS! The 10ms local ping allowed the car to brake instantly. Edge computing saves lives!";
      default: return "";
    }
  };

  const isSimulating = carState === 'driving' || carState === 'braking';

  return (
    <LabShell
      labId="edgecomputing9"
      title="Edge Computing Latency"
      compact={true}
      onReset={() => {
        setPhase(0);
        setNetworkMode('cloud');
        setCarState('idle');
        setObstacleVisible(false);
        setCarLeft("10%");
        setCarTransition("none");
        setPingPos({ left: "15%", bottom: "35%", opacity: 0, transition: "none" });
        setTimeLeft(TIMER_DURATION);
      }}
      bgOverride="bg-slate-100"
      theme="ocean"
      navExtra={
        <div className="flex items-center gap-1.5 text-sky-700 bg-white hover:bg-sky-50 border border-sky-100 shadow-sm px-3 md:px-4 h-9 md:h-10 rounded-full font-mono text-sm font-bold transition-colors">
          <Timer size={16} strokeWidth={2.5} />
          {formatTime(timeLeft)}
        </div>
      }
    >
      <div className="relative z-10 w-full h-full flex flex-col p-2 sm:p-4 gap-3 sm:gap-4 overflow-y-auto">
        
        {/* Dynamic Instruction Banner */}
        <div className={`w-full border-2 rounded-2xl p-3 sm:p-4 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4 shrink-0 transition-all duration-500
          ${(phase === 1 || phase === 2) ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-100' : 
            (phase === 3 || phase === 4) ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-amber-100' :
            (phase === 6) ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100' :
            'bg-white border-sky-200 text-sky-900 shadow-sky-50'}`
        }>
          <div className={`p-2 rounded-xl shrink-0 transition-colors 
            ${(phase === 1 || phase === 2) ? 'bg-rose-100 text-rose-600 shadow-inner' : 
              (phase === 3 || phase === 4) ? 'bg-amber-100 text-amber-600 shadow-inner animate-pulse' :
              (phase === 6) ? 'bg-emerald-100 text-emerald-600 shadow-inner' :
              'bg-sky-100 text-sky-600 shadow-inner'}`}
          >
            {(phase === 1 || phase === 2) ? <AlertTriangle size={24} strokeWidth={2.5} /> :
             (phase === 3 || phase === 4) ? <Activity size={24} strokeWidth={2.5} /> :
             (phase === 6) ? <CheckCircle2 size={24} strokeWidth={2.5} /> :
             <Play size={24} strokeWidth={2.5} />}
          </div>
          <p className="text-sm sm:text-base font-bold leading-snug tracking-tight">
            {getInstruction()}
          </p>
        </div>

        <div className="flex-1 w-full flex flex-col md:flex-row gap-3 sm:gap-4 min-h-0 pb-2">
          
          {/* CONTROL DECK (LEFT) */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col shrink-0">
            <div className={`bg-white border-2 rounded-3xl shadow-xl p-3 sm:p-4 flex flex-col h-full relative z-10 transition-colors duration-500 ${
              phase >= 4 ? 'border-emerald-300' : 'border-slate-200'
            }`}>
              
              {/* Telemetry Header */}
              <div className="flex items-center justify-between pb-2 sm:pb-3 border-b-2 border-slate-100 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-white shadow-md">
                    <Activity size={18} strokeWidth={2.5} className={isSimulating ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Config</div>
                    <div className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">Edge Computing</div>
                  </div>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm border ${
                  networkMode === 'cloud' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  <Radio size={10} strokeWidth={3} className={isSimulating ? "animate-pulse" : ""} />
                  {networkMode === 'cloud' ? "TOKYO SERVER" : "LOCAL 5G"}
                </span>
              </div>

              {/* Latency Meter */}
              <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-inner my-4 border-4 border-slate-800">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Network Latency</span>
                  <span className={`text-4xl font-mono font-black ${networkMode === 'cloud' ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {networkMode === 'cloud' ? '200' : '10'}<span className="text-sm text-slate-500 ml-1">ms</span>
                  </span>
                </div>
                <Zap size={36} strokeWidth={2.5} className={networkMode === 'cloud' ? 'text-rose-500' : 'text-emerald-400'} />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2 shrink-0">
                
                {/* Cloud Toggle */}
                <button 
                  onClick={() => { if(phase >= 3) setNetworkMode('cloud'); }}
                  disabled={phase < 3}
                  className={`w-full p-3 sm:p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all duration-300 ${
                    networkMode === 'cloud' 
                      ? 'bg-white border-sky-400 shadow-[0_4px_15px_rgba(56,189,248,0.2)]' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  } ${phase < 3 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${networkMode === 'cloud' ? 'bg-sky-50 text-sky-500' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                    <Cloud size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-700">Central Cloud</div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">High Latency (200ms)</div>
                  </div>
                  {networkMode === 'cloud' ? <CheckCircle2 size={24} className="text-sky-500" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
                </button>

                {/* Edge Toggle */}
                <button 
                  onClick={() => { 
                     if(phase >= 3) {
                       setNetworkMode('edge');
                       if(phase === 3) { setPhase(4); playClick(); }
                     }
                  }}
                  disabled={phase < 3}
                  className={`w-full p-3 sm:p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all duration-300 ${
                    networkMode === 'edge' 
                      ? 'bg-white border-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  } ${phase < 3 ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${phase === 3 ? 'animate-pulse border-emerald-400 bg-emerald-50' : ''}`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${networkMode === 'edge' ? 'bg-emerald-50 text-emerald-500' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                    <Server size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-700">Local Edge Node</div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Ultra-Low Latency (10ms)</div>
                  </div>
                  {networkMode === 'edge' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
                </button>
              </div>

              {/* Dynamic Action Buttons */}
              <div className="flex-1 flex flex-col justify-end gap-2 mt-4 min-h-0">
                <button 
                  onClick={runSimulation}
                  disabled={isSimulating || phase === 3}
                  className={`w-full py-3.5 sm:py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs sm:text-sm uppercase tracking-widest
                    ${(!isSimulating && phase !== 3)
                      ? 'bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-[0_4px_0_#0284c7] active:shadow-none active:translate-y-[4px]' 
                      : 'bg-slate-50 text-slate-400 border-2 border-slate-200 shadow-none opacity-60 cursor-not-allowed'
                    } ${(!isSimulating && (phase === 0 || phase === 4)) ? 'animate-bounce shadow-[0_4px_0_#0284c7,0_10px_15px_rgba(14,165,233,0.4)]' : ''}`}
                >
                  <Zap size={20} strokeWidth={3} /> SIMULATE HAZARD
                </button>
              </div>

            </div>
          </div>

          {/* SMART CITY STAGE (RIGHT) */}
          <div className="flex-1 flex flex-col relative z-0 min-h-[300px] md:min-h-[450px] bg-white border-2 border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            
            {/* Title Bar */}
            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-b-4 border-slate-950 shrink-0 z-20 relative shadow-md">
              <div className="flex items-center gap-3">
                <MapPin className="text-slate-500" size={18} strokeWidth={2.5} />
                <h2 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-widest">Autonomous Test Track</h2>
              </div>
            </div>

            {/* Stage Field */}
            <div className="flex-1 relative overflow-hidden select-none bg-sky-50 z-0">
              
              {/* Background City Skyline */}
              <div className="absolute bottom-[20%] left-0 w-full h-[40%] flex items-end gap-1 opacity-10 pointer-events-none z-0 px-2">
                <div className="w-16 h-[50%] bg-slate-900 rounded-t-md" />
                <div className="w-12 h-[30%] bg-slate-900 rounded-t-md" />
                <div className="w-24 h-[80%] bg-slate-900 rounded-t-md" />
                <div className="w-14 h-[40%] bg-slate-900 rounded-t-md" />
                <div className="w-32 h-[70%] bg-slate-900 rounded-t-md" />
                <div className="w-20 h-[90%] bg-slate-900 rounded-t-md" />
                <div className="w-16 h-[60%] bg-slate-900 rounded-t-md" />
                <div className="w-24 h-[40%] bg-slate-900 rounded-t-md" />
              </div>

              {/* The Road */}
              <div className="absolute bottom-0 left-0 w-full h-[25%] bg-slate-800 border-t-[6px] border-slate-700 z-10 shadow-inner">
                {/* Dashed Line */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,#94a3b8_20px,#94a3b8_40px)] opacity-30" />
              </div>

              {/* The Central Cloud (Tokyo) */}
              <div className="absolute top-[10%] right-[5%] z-10 flex flex-col items-center">
                <div className={`w-20 h-16 sm:w-28 sm:h-20 rounded-2xl border-4 flex flex-col items-center justify-center shadow-xl transition-all duration-500 ${
                  networkMode === 'cloud' ? 'bg-sky-50 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.5)]' : 'bg-slate-100 border-slate-300 opacity-60 grayscale'
                }`}>
                  <Cloud className={networkMode === 'cloud' ? 'text-sky-500' : 'text-slate-400'} size={32} strokeWidth={2.5} />
                </div>
                <div className={`text-[9px] sm:text-[10px] font-black uppercase mt-2 px-2.5 py-1 rounded-md shadow-sm transition-colors ${
                  networkMode === 'cloud' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-500'
                }`}>Tokyo Cloud</div>
              </div>

              {/* The Edge Node */}
              <div className="absolute bottom-[25%] left-[35%] z-10 flex flex-col items-center">
                <div className="w-3 h-12 sm:h-16 bg-gradient-to-b from-slate-400 to-slate-600 shadow-inner" />
                <div className={`absolute -top-8 sm:-top-10 w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-4 flex flex-col items-center justify-center shadow-xl transition-all duration-500 ${
                  networkMode === 'edge' ? 'bg-emerald-50 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-100 border-slate-300 opacity-60 grayscale'
                }`}>
                  <Server className={networkMode === 'edge' ? 'text-emerald-500' : 'text-slate-400'} size={24} strokeWidth={2.5} />
                </div>
                <div className={`absolute -top-14 sm:-top-16 text-[8px] sm:text-[9px] font-black uppercase mt-2 px-2 py-0.5 rounded shadow-sm transition-colors whitespace-nowrap ${
                  networkMode === 'edge' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}>Edge Node</div>
              </div>

              {/* The Obstacle / Hazard */}
              <AnimatePresence>
                {obstacleVisible && (
                  <motion.div 
                    initial={{ y: "100%" }} 
                    animate={{ y: "0%" }} 
                    className="absolute bottom-[25%] left-[75%] z-20 flex flex-col items-center"
                  >
                     <div className="w-8 sm:w-10 h-16 sm:h-20 bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#000_10px,#000_20px)] border-4 border-slate-900 rounded-t-lg shadow-xl" />
                     <div className="absolute -top-8 bg-rose-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 rounded border-2 border-rose-800 uppercase tracking-widest whitespace-nowrap shadow-lg animate-pulse">
                       Hazard
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Car */}
              <div 
                className="absolute bottom-[25%] z-30 flex flex-col items-center" 
                style={{ left: carLeft, transition: carTransition }}
              >
                {/* The Car Body */}
                <div className={`relative w-20 sm:w-24 h-10 sm:h-12 rounded-t-xl rounded-br flex items-end px-2 sm:px-3 pb-1 sm:pb-1.5 gap-4 sm:gap-5 shadow-lg border-b-4 border-slate-900 transition-colors duration-500 ${
                  networkMode === 'cloud' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`}>
                  {/* Wheels */}
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-slate-900 rounded-full border-2 border-slate-400 -mb-2.5 sm:-mb-3 shadow-sm ${carState === 'driving' ? 'animate-spin' : ''}`} />
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-slate-900 rounded-full border-2 border-slate-400 -mb-2.5 sm:-mb-3 shadow-sm ${carState === 'driving' ? 'animate-spin' : ''}`} />
                  
                  {/* Headlights */}
                  <div className="absolute right-0 top-3 w-2 h-3 bg-yellow-200 rounded-l shadow-[5px_0_15px_rgba(253,224,71,0.6)]" />
                  
                  {/* Sensor Dome */}
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-4 sm:w-6 h-3 sm:h-4 bg-slate-800 rounded-t-full border-2 border-b-0 border-slate-600 flex justify-center pt-1">
                     <div className={`w-1.5 h-1.5 rounded-full ${networkMode === 'cloud' ? 'bg-sky-400' : 'bg-emerald-400'} animate-pulse`} />
                  </div>
                </div>

                {/* Status Overlays */}
                <AnimatePresence>
                   {carState === 'crashed' && (
                     <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute -right-4 -top-8 text-4xl sm:text-5xl drop-shadow-lg z-50">💥</motion.div>
                   )}
                   {carState === 'braking' && (
                     <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute -left-8 bottom-2 text-xl drop-shadow-md z-10 opacity-70">💨</motion.div>
                   )}
                </AnimatePresence>
              </div>

              {/* The Data Packet (Ping) */}
              <div 
                className="absolute w-4 sm:w-5 h-4 sm:h-5 rounded-full z-50 -translate-x-1/2 translate-y-1/2"
                style={{ 
                  left: pingPos.left, 
                  bottom: pingPos.bottom, 
                  opacity: pingPos.opacity, 
                  transition: pingPos.transition,
                  backgroundColor: networkMode === 'cloud' ? '#38bdf8' : '#10b981',
                  boxShadow: networkMode === 'cloud' ? '0 0 20px #38bdf8' : '0 0 20px #10b981'
                }}
              />

            </div>
          </div>
        </div>
      </div>

      {/* Victory Celebration */}
      <AnimatePresence>
        {phase === 6 && (
          <Celebration
            isActive={phase === 6}
            message="Crisis Averted! By processing the sensor data on the Local Edge Node, the latency dropped from 200ms to 10ms, allowing the autonomous vehicle to brake instantly."
            onReplay={() => {
              setPhase(0);
              setNetworkMode('cloud');
              setCarState('idle');
              setObstacleVisible(false);
              setCarLeft("10%");
              setCarTransition("none");
              setPingPos({ left: "15%", bottom: "35%", opacity: 0, transition: "none" });
              setTimeLeft(TIMER_DURATION);
            }}
          />
        )}
      </AnimatePresence>
    </LabShell>
  );
}
