"use client";

import React, { useState, useEffect } from "react";
import LabShell from "@/components/LabShell";
import Colossus3DScene from "@/components/Colossus3DScene";
import Celebration from "@/components/Celebration";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { 
  FileText, CheckCircle2, Play, Lock, Unlock, ShieldAlert, 
  Settings2, Zap, ArrowRight, BookOpen, AlertTriangle, Info
} from "lucide-react";

type Step = 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';

const STEPS: { id: Step; label: string }[] = [
  { id: 'LEARN', label: '1. Briefing' },
  { id: 'TRY_MANUAL', label: '2. Mechanical Try' },
  { id: 'FAIL_OVERLOAD', label: '3. Overload' },
  { id: 'UNDERSTAND', label: '4. Insight' },
  { id: 'IMPROVE', label: '5. Build' },
  { id: 'COMPLETE', label: '6. Run' },
  { id: 'OUTCOME', label: '7. Decrypted' }
];

export default function Colossus28() {
  const { playClick, playSuccess, playError, playGearGrind } = useLabAudio();
  const { reportComplete } = useLMSBridge("colossus28");
  const [step, setStep] = useState<Step>('LEARN');
  
  // Interaction State
  const [mechanicalTries, setMechanicalTries] = useState(0);
  const [tapeLoaded, setTapeLoaded] = useState(false);
  const [wiresPatched, setWiresPatched] = useState(false);
  
  // Animation State
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const handleMechanicalSpin = () => {
    if (playGearGrind) playGearGrind();
    setMechanicalTries(prev => prev + 1);
    
    if (mechanicalTries >= 2) {
      if (playError) playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setStep('FAIL_OVERLOAD');
    }
  };

  const handleTape = () => {
    if (playClick) playClick();
    setTapeLoaded(true);
  };

  const handleWires = () => {
    if (playClick) playClick();
    setWiresPatched(true);
  };

  const runElectronic = () => {
    if (!tapeLoaded || !wiresPatched || isDecrypting) return;
    if (playSuccess) playSuccess(); // startup sound
    setIsDecrypting(true);
    setStep('COMPLETE');
  };

  useEffect(() => {
    if (isDecrypting) {
      const interval = setInterval(() => {
        setDecryptProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDecrypting(false);
            if (playSuccess) playSuccess();
            setStep('OUTCOME');
            setTimeout(reportComplete, 1500);
            return 100;
          }
          // Fast progress to simulate speed
          return prev + Math.random() * 8 + 4;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isDecrypting, playSuccess, reportComplete]);

  const resetLab = () => {
    setStep('LEARN');
    setMechanicalTries(0);
    setTapeLoaded(false);
    setWiresPatched(false);
    setIsDecrypting(false);
    setDecryptProgress(0);
  };

  return (
    <LabShell 
      title="Colossus Codebreaker" 
      theme="ocean" 
      labId="28"
      compact={true}
      onReset={resetLab}
      instruction="Rebuild the world's first programmable electronic computer to break the Lorenz cipher."
    >
      <div className="flex flex-col h-full w-full gap-3 p-1">
        
        {/* HUD - Top Bar */}
        <div className="flex flex-col md:flex-row gap-2 shrink-0">
          {/* Step Tracker */}
          <div className="flex-1 bg-white rounded-xl p-2 border-2 border-slate-100 flex items-center justify-center shadow-sm overflow-hidden min-h-0">
            <div className="flex flex-wrap items-center justify-center gap-1 md:gap-1.5 px-1">
              {STEPS.map((s, idx) => {
                const isActive = step === s.id;
                const isPast = STEPS.findIndex(x => x.id === step) > idx;
                return (
                  <React.Fragment key={s.id}>
                    <div className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                      isActive ? 'bg-slate-800 text-white shadow-md' :
                      isPast ? 'bg-slate-100 text-slate-400' : 'bg-transparent text-slate-300'
                    }`}>
                      {s.label}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`h-0.5 w-1.5 md:w-2 rounded-full ${isPast ? 'bg-slate-300' : 'bg-slate-100'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* Briefing Panel */}
          <div className="md:w-[35%] bg-blue-50 border-2 border-blue-100 rounded-xl p-2 shadow-sm flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Info size={16} strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              {step === 'LEARN' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-blue-900 uppercase tracking-wide mr-2">Mission Briefing</strong> 
                  Bletchley Park, 1944. We intercepted a German Lorenz cipher. It's too complex for Enigma machines.
                </p>
              )}
              {step === 'TRY_MANUAL' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-amber-700 uppercase tracking-wide mr-2">Manual Attempt</strong> 
                  Try decoding it mechanically. Spin the dial to test decryption keys.
                </p>
              )}
              {step === 'FAIL_OVERLOAD' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-rose-700 uppercase tracking-wide mr-2">Overload</strong> 
                  Mechanical cracking is too slow! The intelligence will be useless before we finish.
                </p>
              )}
              {step === 'UNDERSTAND' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-indigo-700 uppercase tracking-wide mr-2">The Insight</strong> 
                  Tommy Flowers proposes removing all moving parts and using electronic vacuum tubes instead.
                </p>
              )}
              {step === 'IMPROVE' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-emerald-700 uppercase tracking-wide mr-2">Build Colossus</strong> 
                  Load the paper tape and patch the Boolean logic gates to program the electronic machine.
                </p>
              )}
              {step === 'COMPLETE' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-amber-700 uppercase tracking-wide mr-2">Processing</strong> 
                  Colossus is running! Vacuum tubes are testing 5,000 characters per second.
                </p>
              )}
              {step === 'OUTCOME' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-blue-900 uppercase tracking-wide mr-2">Decrypted</strong> 
                  Success. Programmable electronic computing was born, and the Allies have the intel.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Split Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
          
          {/* Left Side: 3D Viewport */}
          <div className="flex-[1.2] lg:flex-[1.4] bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden relative min-h-[250px] lg:min-h-0">
            <Colossus3DScene 
              step={step}
              tapeLoaded={tapeLoaded}
              wiresPatched={wiresPatched}
              isDecrypting={isDecrypting}
            />
            
            {/* Speed Overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-2 shadow-sm flex items-center gap-3">
               <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Processing Speed</span>
                 {isDecrypting || step === 'OUTCOME' ? (
                   <span className="text-emerald-600 font-mono font-bold text-sm">5,000 chars / sec</span>
                 ) : (
                   <span className="text-slate-600 font-mono font-bold text-sm">1 char / sec (Mechanical)</span>
                 )}
               </div>
            </div>

            {/* Decryption Progress Bar */}
            <AnimatePresence>
              {isDecrypting && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border-2 border-slate-700 p-4 rounded-xl shadow-2xl w-72 text-center"
                >
                  <h3 className="text-amber-400 font-black text-[10px] uppercase tracking-widest mb-2 animate-pulse">Electronic Brute Force</h3>
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${Math.min(100, decryptProgress)}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Control Desk */}
          <div className="flex-1 lg:flex-[0.8] bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col min-w-0 min-h-0 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
              <Settings2 size={18} className="text-slate-400" strokeWidth={2.5} />
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Control Desk</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              
              <AnimatePresence mode="wait">
                
                {/* Stage 1 & 2 & 3: Mechanical Era */}
                {['LEARN', 'TRY_MANUAL', 'FAIL_OVERLOAD'].includes(step) && (
                  <motion.div 
                    key="mechanical"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full justify-center gap-6"
                  >
                    <div className="text-center">
                      <Lock className="w-10 h-10 text-slate-300 mx-auto mb-2" strokeWidth={2} />
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Mechanical Decryption</h4>
                      <p className="text-xs text-slate-500 mt-1">Attempt to manually test keys using the mechanical dial.</p>
                    </div>

                    <div className="flex justify-center">
                      <motion.button
                        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        onClick={step === 'LEARN' ? () => setStep('TRY_MANUAL') : handleMechanicalSpin}
                        disabled={step === 'FAIL_OVERLOAD'}
                        className={`w-32 h-32 rounded-full border-8 shadow-xl flex flex-col items-center justify-center transition-all ${
                          step === 'FAIL_OVERLOAD' 
                            ? 'bg-rose-50 border-rose-200 cursor-not-allowed' 
                            : 'bg-slate-100 border-slate-300 hover:border-slate-400 active:scale-95 cursor-pointer'
                        }`}
                      >
                        <Settings2 className={`w-10 h-10 ${step === 'FAIL_OVERLOAD' ? 'text-rose-400' : 'text-slate-600'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${step === 'FAIL_OVERLOAD' ? 'text-rose-500' : 'text-slate-600'}`}>
                          {step === 'FAIL_OVERLOAD' ? 'JAMMED' : 'SPIN DIAL'}
                        </span>
                      </motion.button>
                    </div>

                    {step === 'FAIL_OVERLOAD' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border-2 border-rose-200 p-3 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                        <div>
                          <h5 className="text-xs font-black text-rose-800 uppercase tracking-wider">Mathematical Overload</h5>
                          <p className="text-[10px] text-rose-700 mt-1 font-medium leading-snug">At mechanical speeds, testing all combinations will take 400 years. We need a faster method.</p>
                          <button onClick={() => setStep('UNDERSTAND')} className="mt-2 text-[10px] font-black text-white bg-rose-600 px-4 py-1.5 rounded-lg uppercase tracking-wider hover:bg-rose-700 transition-colors">
                            Seek Alternative
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Stage 4: Insight */}
                {step === 'UNDERSTAND' && (
                  <motion.div 
                    key="insight"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full justify-center"
                  >
                    <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-2xl text-center">
                      <Zap className="w-12 h-12 text-indigo-500 mx-auto mb-3" strokeWidth={2.5} />
                      <h4 className="text-lg font-black text-indigo-900 uppercase tracking-wider">The Electronic Leap</h4>
                      <p className="text-xs text-indigo-700 mt-2 font-medium leading-relaxed">
                        Engineer Tommy Flowers realizes that physical moving parts are too slow. 
                        By using <strong>vacuum tubes</strong> to perform Boolean logic electronically, we can process data at the speed of light.
                      </p>
                      <button 
                        onClick={() => setStep('IMPROVE')} 
                        className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs py-3 rounded-xl tracking-widest shadow-md transition-all active:scale-95"
                      >
                        Build Colossus
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Stage 5, 6, 7: Electronic Era */}
                {['IMPROVE', 'COMPLETE', 'OUTCOME'].includes(step) && (
                  <motion.div 
                    key="electronic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col h-full gap-3"
                  >
                    <div className="text-center mb-2">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Colossus Programming</h4>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Electronic Logic Configuration</p>
                    </div>

                    <button
                      disabled={tapeLoaded || step !== 'IMPROVE'}
                      onClick={handleTape}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        tapeLoaded 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : step !== 'IMPROVE'
                          ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:shadow-md cursor-pointer active:translate-y-0.5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${tapeLoaded ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <FileText size={20} strokeWidth={2.5} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-xs font-black uppercase tracking-wider">1. Load Paper Tape</div>
                        <div className="text-[10px] font-medium opacity-80">Mount high-speed data stream</div>
                      </div>
                      {tapeLoaded && <CheckCircle2 className="text-emerald-500" size={20} strokeWidth={3} />}
                    </button>

                    <button
                      disabled={wiresPatched || step !== 'IMPROVE'}
                      onClick={handleWires}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        wiresPatched 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : step !== 'IMPROVE'
                          ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:shadow-md cursor-pointer active:translate-y-0.5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${wiresPatched ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <Settings2 size={20} strokeWidth={2.5} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-xs font-black uppercase tracking-wider">2. Patch Logic Gates</div>
                        <div className="text-[10px] font-medium opacity-80">Wire Boolean XOR operations</div>
                      </div>
                      {wiresPatched && <CheckCircle2 className="text-emerald-500" size={20} strokeWidth={3} />}
                    </button>

                    {step === 'IMPROVE' && tapeLoaded && wiresPatched && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={runElectronic}
                        className="mt-auto w-full bg-slate-900 hover:bg-black text-white font-black uppercase text-sm py-4 rounded-xl tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 border-b-4 border-slate-700 active:border-b-0"
                      >
                        <Play fill="currentColor" size={20} />
                        Run Decryption
                      </motion.button>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Success Modal / Outcome */}
        <AnimatePresence>
          {step === 'OUTCOME' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-50 bg-white/95 backdrop-blur-md border-2 border-emerald-100 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Message Decrypted in 2.3 Hours!</h3>
                  <p className="text-sm text-slate-600 font-medium mb-4">
                    By replacing mechanical gears with electronic vacuum tubes, Tommy Flowers created a machine capable of Boolean logic at 5,000 characters per second. The Lorenz cipher is broken.
                  </p>
                  <button 
                    onClick={resetLab}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold text-sm transition-colors"
                  >
                    Reset Machine
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <Celebration 
        isActive={step === 'OUTCOME'} 
        message="You successfully programmed Colossus and broke the Lorenz cipher!" 
        onReplay={resetLab} 
      />
    </LabShell>
  );
}
