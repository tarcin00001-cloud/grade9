"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Bug, Rocket, TrendingUp, AlertTriangle, FileText, Code, ShieldCheck } from "lucide-react";

type Step = 'learn' | 'try' | 'running_fail' | 'failed' | 'improve' | 'running_success' | 'success';

const COLORS = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' }
};

function ChartView({ data, crashed }: { data: number[], crashed: boolean }) {
  const maxVal = Math.max(100, ...data);
  const points = data.map((val, i) => `${(i / 50) * 100},${100 - (val / maxVal) * 100}`).join(" ");
  
  return (
    <div className="w-full h-full relative border-l-2 border-b-2 border-slate-300">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
        <polyline 
          points={points} 
          fill="none" 
          stroke={crashed ? "#ef4444" : "#f59e0b"} 
          strokeWidth="3" 
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Grid lines */}
      <div className="absolute top-1/4 w-full border-t border-slate-100 -z-10" />
      <div className="absolute top-2/4 w-full border-t border-slate-100 -z-10" />
      <div className="absolute top-3/4 w-full border-t border-slate-100 -z-10" />

      <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono font-bold tracking-widest">ACTIVE USERS</div>
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-mono font-bold tracking-widest">LAUNCH DAYS</div>
    </div>
  );
}

export default function ComputingProject39() {
  const { playClick, playSuccess, playError, playPop } = useLabAudio();
  const { reportComplete } = useLMSBridge("computingproject39");

  const [step, setStep] = useState<Step>('learn');
  const [planning, setPlanning] = useState(10);
  const [dev, setDev] = useState(80);
  const [qa, setQa] = useState(10);
  const [chartData, setChartData] = useState<number[]>([]);

  const total = planning + dev + qa;
  const remaining = 100 - total;

  useEffect(() => {
    if (step === 'running_fail' || step === 'running_success') {
      let tick = 0;
      setChartData([0]);
      
      const interval = setInterval(() => {
        tick++;
        
        if (step === 'running_fail') {
          if (tick <= 30) {
            // Exponential growth up to tick 30
            setChartData(prev => [...prev, Math.floor(Math.pow(1.3, tick))]);
          } else if (tick === 31) {
            // Crash to 0
            setChartData(prev => [...prev, 0]);
            if (playError) playError();
            clearInterval(interval);
            setTimeout(() => setStep('failed'), 1200);
          }
        } else if (step === 'running_success') {
          if (tick <= 50) {
            // Stable growth
            setChartData(prev => [...prev, Math.floor(Math.pow(1.25, tick))]);
          } else {
            if (playSuccess) playSuccess();
            clearInterval(interval);
            setTimeout(() => {
               setStep('success');
               setTimeout(reportComplete, 4500);
            }, 1000);
          }
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [step, playError, playSuccess, reportComplete]);

  // Derived state for launch button
  let launchError = "";
  if (remaining !== 0) {
    launchError = `Allocate exactly 100 days (Current: ${total})`;
  } else if (step === 'try' && qa >= 20) {
    launchError = "Investors demand fast launch! (QA < 20)";
  } else if (step === 'improve' && qa < 20) {
    launchError = "Technical debt risk! (QA must be ≥ 20)";
  }

  const handleLaunch = () => {
    if (remaining !== 0) {
      if (playError) playError();
      return;
    }
    if (playPop) playPop();
    
    if (step === 'try') {
      if (qa >= 20) {
        if (playError) playError();
        return;
      }
      setStep('running_fail');
    } else if (step === 'improve') {
      if (qa < 20) {
        if (playError) playError();
        return;
      }
      setStep('running_success');
    }
  };

  const handleReset = () => {
     setStep('learn');
     setPlanning(10);
     setDev(80);
     setQa(10);
     setChartData([]);
  };

  const isInputDisabled = !['try', 'improve'].includes(step);

  return (
    <LabShell
      labId="computingproject39"
      title="Hackathon Tycoon"
      subtitle="Technical Debt & SDLC"
      instruction="Balance your 100-day Software Development Life Cycle (SDLC) across Planning, Development, and QA to achieve a successful startup launch."
      theme="circuit"
      bgOverride="bg-orange-950"
      onReset={handleReset}
    >
      <div className="flex flex-col h-full gap-4 relative">
        <Celebration isActive={step === 'success'} message="Unicorn Status Achieved!" onReplay={handleReset} />

        {/* TOP PANEL: Story / Status / Chart */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-6 relative z-10">
          
          <AnimatePresence mode="wait">
            {step === 'learn' && (
              <motion.div 
                key="learn"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Rocket className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to Hackathon Tycoon</h3>
                <p className="text-sm text-slate-600 mb-6">
                  You have exactly 100 days to launch a startup. 
                  The Software Development Life Cycle (SDLC) consists of three key phases: <strong>Planning</strong>, <strong>Development</strong>, and <strong>Quality Assurance (QA)</strong>.
                </p>
                <button 
                  onClick={() => { if (playClick) playClick(); setStep('try'); }}
                  className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600 transition-colors shadow-md active:scale-95"
                >
                  Start Phase 1
                </button>
              </motion.div>
            )}

            {step === 'try' && (
              <motion.div 
                key="try"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto"
              >
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">The Rush Job</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Investors demand a fast launch! Allocate your 100 days below. To hit their aggressive deadline, you must allocate <strong>less than 20 days to QA</strong>.
                </p>
                <div className="text-xs font-bold text-orange-500 animate-pulse bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  Awaiting Launch Configuration...
                </div>
              </motion.div>
            )}

            {step === 'failed' && (
              <motion.div 
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-6 bg-white/95 backdrop-blur-sm border-2 border-red-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-2xl z-20"
              >
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Bug className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-red-700 uppercase tracking-wider mb-2">Server Crash</h3>
                <p className="text-sm text-slate-700 mb-6 max-w-xs leading-relaxed">
                  A critical memory leak brought down the app at peak traffic. Because <strong className="text-red-600">QA testing was rushed</strong>, technical debt destroyed the product!
                </p>
                <button 
                  onClick={() => { if (playClick) playClick(); setStep('improve'); }}
                  className="bg-red-500 text-white font-bold px-8 py-3 rounded-full hover:bg-red-600 transition-colors shadow-md active:scale-95 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Improve Process
                </button>
              </motion.div>
            )}

            {step === 'improve' && (
              <motion.div 
                key="improve"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">The Balanced SDLC</h3>
                <p className="text-sm text-slate-600 mb-6">
                  You cannot skip testing! Re-allocate your 100 days. This time, ensure Quality Assurance (QA) gets <strong>at least 20 days</strong> to catch bugs before users do.
                </p>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Ready for a stable launch...
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-6 bg-white/95 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-2xl z-20"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-emerald-700 uppercase tracking-wider mb-2">Unicorn Status</h3>
                <p className="text-sm text-slate-700 max-w-xs leading-relaxed">
                  The app safely handled the massive user load. Balancing your SDLC is the key to sustainable software success!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background Chart */}
          {chartData.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`absolute inset-4 ${['failed', 'success'].includes(step) ? 'opacity-20' : 'opacity-100'} transition-opacity duration-1000 p-4 pt-8`}
            >
              <ChartView data={chartData} crashed={step === 'failed'} />
            </motion.div>
          )}

        </div>

        {/* BOTTOM PANEL: Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 relative z-20">
          <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 shrink-0">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Days Available</span>
            <span className={`font-mono font-black text-xl bg-slate-100 px-3 py-1 rounded-lg ${remaining < 0 ? 'text-red-500' : remaining === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {Math.abs(remaining)} {remaining < 0 ? 'OVER' : remaining === 0 ? 'READY' : 'LEFT'}
            </span>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            <SliderRow 
              label="Planning & Design" 
              value={planning} 
              onChange={setPlanning} 
              color="blue" 
              icon={FileText} 
              disabled={isInputDisabled}
            />
            <SliderRow 
              label="Development" 
              value={dev} 
              onChange={setDev} 
              color="amber" 
              icon={Code} 
              disabled={isInputDisabled}
            />
            <SliderRow 
              label="QA (Testing)" 
              value={qa} 
              onChange={setQa} 
              color="emerald" 
              icon={ShieldCheck} 
              disabled={isInputDisabled}
            />
          </div>

          <div className="mt-1 flex flex-col gap-2 shrink-0">
            <button 
              onClick={handleLaunch} 
              disabled={launchError !== "" || isInputDisabled}
              className={`w-full py-4 rounded-xl font-black tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-2 ${
                launchError === "" && !isInputDisabled
                ? 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
              }`}
            >
              <Rocket className="w-5 h-5" /> Launch Startup
            </button>
            <div className="h-4 flex items-center justify-center">
              {launchError && !isInputDisabled && (
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider animate-pulse text-center">
                  {launchError}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </LabShell>
  );
}

function SliderRow({ 
  label, value, onChange, color, icon: Icon, disabled 
}: { 
  label: string, value: number, onChange: (v: number) => void, color: keyof typeof COLORS, icon: any, disabled: boolean 
}) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${disabled ? 'opacity-50' : 'hover:bg-slate-50'}`}>
      <div className={`w-10 h-10 rounded-xl ${COLORS[color].bg} flex items-center justify-center shrink-0 shadow-inner`}>
         <Icon className={`${COLORS[color].text} w-5 h-5`} />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
         <div className="flex justify-between text-xs font-bold text-slate-700">
            <span className="uppercase tracking-wider">{label}</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{value} DAYS</span>
         </div>
         <input 
           type="range" min="0" max="100" step="5"
           value={value} onChange={e => onChange(Number(e.target.value))}
           disabled={disabled}
           className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:cursor-not-allowed"
         />
      </div>
    </div>
  )
}
