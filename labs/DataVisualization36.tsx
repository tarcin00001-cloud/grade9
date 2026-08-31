"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import LabShell from "@/components/LabShell";
import Celebration from "@/components/Celebration";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { 
  Info, Database, PieChart as PieIcon, BarChart2, TrendingUp, CheckCircle2, 
  AlertTriangle, Code2, Play, MousePointerClick 
} from "lucide-react";

// ============================================================================
// DATASETS
// ============================================================================

const TEMP_DATA = [
  { label: 'Jan', val: 5 }, { label: 'Feb', val: 8 }, { label: 'Mar', val: 15 },
  { label: 'Apr', val: 22 }, { label: 'May', val: 28 }, { label: 'Jun', val: 32 },
  { label: 'Jul', val: 35 }, { label: 'Aug', val: 34 }, { label: 'Sep', val: 29 },
  { label: 'Oct', val: 21 }, { label: 'Nov', val: 12 }, { label: 'Dec', val: 7 }
];

const CITY_DATA = [
  { label: 'Mumbai', val: 20.4 },
  { label: 'Delhi', val: 16.7 },
  { label: 'Kolkata', val: 14.1 },
  { label: 'Chennai', val: 8.6 },
  { label: 'Bangalore', val: 8.5 }
];

const SPORT_DATA = [
  { label: 'Cricket', val: 45 },
  { label: 'Football', val: 25 },
  { label: 'Badminton', val: 15 },
  { label: 'Tennis', val: 10 },
  { label: 'Hockey', val: 5 }
];

const PIE_COLORS = ['#fbbf24', '#f43f5e', '#0ea5e9', '#10b981', '#a855f7'];

type Step = 'LEARN' | 'TRY_RAW' | 'FAIL_PIE' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';
type Engine = 'BAR' | 'LINE' | 'PIE' | null;
type Dataset = 'TEMP' | 'CITY' | 'SPORT' | null;

const STEPS: { id: Step; label: string }[] = [
  { id: 'LEARN', label: '1. Briefing' },
  { id: 'TRY_RAW', label: '2. Raw Data' },
  { id: 'FAIL_PIE', label: '3. Wrong Engine' },
  { id: 'UNDERSTAND', label: '4. Insight' },
  { id: 'IMPROVE', label: '5. Routing' },
  { id: 'COMPLETE', label: '6. Python Code' },
  { id: 'OUTCOME', label: '7. Flawless' },
];

export default function DataVisualization36() {
  const { playClick, playSuccess, playError, playPop } = useLabAudio();
  const { reportComplete } = useLMSBridge("datavisualization36");

  const [step, setStep] = useState<Step>('LEARN');
  
  // Data Routing State
  const [activeData, setActiveData] = useState<Dataset>('TEMP');
  const [activeEngine, setActiveEngine] = useState<Engine>(null);
  
  // Code Builder State
  const [labels, setLabels] = useState({ title: false, xlabel: false, ylabel: false });

  const resetLab = () => {
    setStep('LEARN');
    setActiveData('TEMP');
    setActiveEngine(null);
    setLabels({ title: false, xlabel: false, ylabel: false });
  };

  const briefings: Record<Step, string> = {
    LEARN: "Welcome to the Digital Data Studio. Raw data is flowing in, but numbers hide patterns. We use matplotlib to reveal them.",
    TRY_RAW: "Look at this raw temperature data. Quick, identify the peak summer trend just by reading the numbers. It's difficult and slow!",
    FAIL_PIE: "Let's push it through a Visualization Engine. Try using the Pie Chart engine for this temperature data.",
    UNDERSTAND: "A Pie Chart for temperature? Pie charts show proportions (like market share), not trends! Time-series data needs a Line Graph.",
    IMPROVE: "Let's route datasets correctly. Line Graphs for time, Bar Graphs for categories, and Pie Charts for proportions. Try all three!",
    COMPLETE: "The chart looks great, but it's missing context. Click the matplotlib commands below to add labels to your Bar Chart.",
    OUTCOME: "Perfect! You transformed raw data into a clear, labeled visualization using Python. The dashboard is ready."
  };

  // Check completion for the labels step
  useEffect(() => {
    if (step === 'COMPLETE' && labels.title && labels.xlabel && labels.ylabel) {
      if (playSuccess) playSuccess();
      const timer = setTimeout(() => {
        setStep('OUTCOME');
        reportComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [labels, step, playSuccess, reportComplete]);

  // Render Chart based on Engine
  const renderChart = (data: typeof TEMP_DATA, engine: Engine, highlightError: boolean = false) => {
    if (!engine) return null;

    if (engine === 'PIE') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="val" animationDuration={800}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={highlightError ? '#ef4444' : PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            {!highlightError && <Tooltip />}
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    if (engine === 'LINE') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip />
            <Line type="monotone" dataKey="val" stroke="#ec4899" strokeWidth={4} dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (engine === 'BAR') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 30, right: 20, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  const getActiveDataset = () => {
    if (activeData === 'TEMP') return TEMP_DATA;
    if (activeData === 'CITY') return CITY_DATA;
    return SPORT_DATA;
  };

  return (
    <LabShell 
      labId="datavisualization36"
      bgOverride="bg-slate-50 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]"
      title="Data Visualization" 
      instruction="Route raw data to the correct visualization engines."
      compact={true}
      onReset={resetLab}
    >
      <div className="flex flex-col h-full w-full gap-3 px-2 py-3 md:py-4">
        
        {/* HUD - Top Bar */}
        <div className="flex flex-col md:flex-row gap-3 shrink-0">
          
          {/* Step Tracker (Data Pipeline Style) */}
          <div className="flex-[2] lg:flex-[2.5] bg-white/80 backdrop-blur-md rounded-2xl p-2 md:p-3 border border-slate-200/60 flex items-center shadow-sm overflow-hidden min-h-0">
            <div className="flex items-center gap-1.5 px-2 overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {STEPS.map((s, idx) => {
                const isActive = step === s.id;
                const isPast = STEPS.findIndex(x => x.id === step) > idx;
                return (
                  <React.Fragment key={s.id}>
                    <div className={`px-2.5 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                      isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105 ring-2 ring-indigo-200' :
                      isPast ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-400'
                    }`}>
                      {s.label}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`h-1 w-3 shrink-0 rounded-full transition-colors ${isPast ? 'bg-indigo-200' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* Briefing Panel */}
          <div className="flex-[1] lg:flex-1 bg-white/80 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-slate-200/60 flex items-center gap-3 shadow-sm min-w-0">
            <div className="bg-indigo-100 p-2 rounded-xl shrink-0">
              <Info className="text-indigo-600" size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-bold text-slate-800 leading-snug">
                {briefings[step]}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Split */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden px-1 pb-1">
          
          {/* Left Hemisphere: The Canvas */}
          <div className="flex-[1.5] lg:flex-[2] bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-5 min-h-0 overflow-hidden relative flex flex-col border border-white">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <BarChart2 className="text-indigo-400" size={20} strokeWidth={2.5} />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">The Canvas</h2>
            </div>
            
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
              
              {/* State: LEARN (Standby Placeholder) */}
              {step === 'LEARN' && (
                <div className="w-full h-full relative opacity-30 pointer-events-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{ val: 10 }, { val: 20 }, { val: 15 }, { val: 25 }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" />
                      <XAxis hide />
                      <YAxis hide />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                    <Database size={32} className="text-slate-400 animate-pulse" />
                    <span className="font-black text-slate-400 uppercase tracking-widest text-sm">Awaiting Data Stream...</span>
                  </div>
                </div>
              )}

              {/* State: TRY_RAW */}
              {step === 'TRY_RAW' && (
                <div className="w-full h-full font-mono text-[10px] md:text-xs text-slate-400 overflow-y-auto break-all p-4">
                  {JSON.stringify(TEMP_DATA, null, 2).repeat(10)}
                </div>
              )}

              {/* State: Chart Rendering */}
              {step !== 'LEARN' && step !== 'TRY_RAW' && (
                <div className="w-full h-full relative">
                  {/* Applied Labels for COMPLETE stage */}
                  {step === 'COMPLETE' || step === 'OUTCOME' ? (
                    <>
                      {labels.title && <div className="absolute top-0 left-0 w-full text-center font-bold text-slate-700 text-sm z-10">City Populations (Millions)</div>}
                      {labels.ylabel && <div className="absolute top-1/2 -left-6 -translate-y-1/2 -rotate-90 font-bold text-slate-500 text-[10px] z-10">Population</div>}
                      {labels.xlabel && <div className="absolute bottom-0 left-0 w-full text-center font-bold text-slate-500 text-[10px] z-10">Indian Cities</div>}
                    </>
                  ) : null}
                  
                  {activeEngine ? renderChart(getActiveDataset(), activeEngine, step === 'FAIL_PIE') : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">
                      Awaiting Data Engine...
                    </div>
                  )}

                  {/* Feedback overlay for FAIL_PIE */}
                  <AnimatePresence>
                    {step === 'FAIL_PIE' && activeEngine === 'PIE' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-20"
                      >
                        <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl flex flex-col items-center text-center shadow-lg max-w-[80%]">
                          <AlertTriangle className="text-rose-500 mb-2" size={32} />
                          <h3 className="font-black text-rose-700 uppercase tracking-wider mb-1 text-sm">Trend Invisible</h3>
                          <p className="text-xs text-rose-600 font-bold">This pie chart shows no temporal trend! It just looks like a pizza. We need a Line Graph.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Hemisphere: The Palette / Code */}
          <div className="flex-1 flex flex-col bg-slate-900 rounded-3xl shadow-xl shadow-slate-900/20 min-h-0 overflow-hidden relative">
            
            {/* macOS Style Window Header */}
            <div className="bg-slate-800/80 backdrop-blur-sm flex items-center px-4 py-3 shrink-0 border-b border-slate-700/50">
              <div className="flex gap-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <Code2 className="text-sky-400 mr-2" size={16} />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">script.py</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 p-5">
              
              {/* Code Preview */}
              <div className="font-mono text-xs md:text-sm text-sky-100 bg-transparent py-2 px-1">
                <span className="text-purple-400">import</span> <span className="text-sky-100">matplotlib.pyplot</span> <span className="text-purple-400">as</span> <span className="text-sky-100">plt</span><br/><br/>
                <span className="text-slate-500"># 1. Load Data</span><br/>
                <span className="text-sky-100">data = {activeData === 'TEMP' ? 'temperature_log' : activeData === 'CITY' ? 'populations' : activeData === 'SPORT' ? 'favorites' : 'raw_json'}</span><br/><br/>
                
                <span className="text-slate-500"># 2. Select Engine</span><br/>
                {activeEngine === 'BAR' && <span><span className="text-sky-100">plt.</span><span className="text-blue-300">bar</span><span className="text-sky-100">(data)</span></span>}
                {activeEngine === 'LINE' && <span><span className="text-sky-100">plt.</span><span className="text-pink-300">plot</span><span className="text-sky-100">(data)</span></span>}
                {activeEngine === 'PIE' && <span><span className="text-sky-100">plt.</span><span className="text-amber-300">pie</span><span className="text-sky-100">(data)</span></span>}
                {!activeEngine && <span className="text-slate-600">plt.???(data)</span>}<br/><br/>

                {(step === 'COMPLETE' || step === 'OUTCOME') && (
                  <>
                    <span className="text-slate-500"># 3. Apply Labels</span><br/>
                    {labels.title ? <span><span className="text-sky-100">plt.</span><span className="text-yellow-200">title</span><span className="text-sky-100">(</span><span className="text-green-300">'City Populations'</span><span className="text-sky-100">)</span><br/></span> : <span className="text-slate-700"># plt.title(...)<br/></span>}
                    {labels.xlabel ? <span><span className="text-sky-100">plt.</span><span className="text-yellow-200">xlabel</span><span className="text-sky-100">(</span><span className="text-green-300">'Indian Cities'</span><span className="text-sky-100">)</span><br/></span> : <span className="text-slate-700"># plt.xlabel(...)<br/></span>}
                    {labels.ylabel ? <span><span className="text-sky-100">plt.</span><span className="text-yellow-200">ylabel</span><span className="text-sky-100">(</span><span className="text-green-300">'Population'</span><span className="text-sky-100">)</span><br/></span> : <span className="text-slate-700"># plt.ylabel(...)<br/></span>}
                    <br/>
                  </>
                )}
                
                <span className="text-slate-500"># Render Chart</span><br/>
                <span className="text-sky-100">plt.</span><span className="text-yellow-200">show</span><span className="text-sky-100">()</span>
              </div>

              {/* Controls */}
              <div className="mt-auto flex flex-col gap-2 shrink-0">
                {step === 'LEARN' && (
                  <button onClick={() => { if(playPop) playPop(); setStep('TRY_RAW'); }} className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl p-3 font-black uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2">
                    <Database size={16} /> Import Raw Data
                  </button>
                )}

                {step === 'TRY_RAW' && (
                  <button onClick={() => { if(playPop) playPop(); setStep('FAIL_PIE'); }} className="w-full bg-rose-500 hover:bg-rose-400 text-white rounded-xl p-3 font-black uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2">
                    <PieIcon size={16} /> Try Pie Chart
                  </button>
                )}

                {step === 'FAIL_PIE' && (
                  <>
                    <button onClick={() => { if(playError) playError(); setActiveEngine('PIE'); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl p-3 font-black uppercase tracking-wider text-sm transition-colors border border-slate-700">
                      Generate Pie Chart
                    </button>
                    {activeEngine === 'PIE' && (
                      <button onClick={() => { if(playPop) playPop(); setStep('UNDERSTAND'); setActiveEngine(null); }} className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl p-3 font-black uppercase tracking-wider text-sm transition-colors mt-2">
                        Analyze Issue
                      </button>
                    )}
                  </>
                )}

                {step === 'UNDERSTAND' && (
                  <button onClick={() => { if(playPop) playPop(); setStep('IMPROVE'); setActiveData('CITY'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl p-3 font-black uppercase tracking-wider text-sm transition-colors">
                    Re-route Engines
                  </button>
                )}

                {step === 'IMPROVE' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => { if(playClick) playClick(); setActiveData('TEMP'); setActiveEngine('LINE'); }} className={`flex-1 p-2 rounded-lg font-bold text-[10px] sm:text-xs uppercase transition-colors flex flex-col items-center justify-center gap-1 ${activeData === 'TEMP' && activeEngine === 'LINE' ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <TrendingUp size={16} /> Temp / Line
                      </button>
                      <button onClick={() => { if(playClick) playClick(); setActiveData('CITY'); setActiveEngine('BAR'); }} className={`flex-1 p-2 rounded-lg font-bold text-[10px] sm:text-xs uppercase transition-colors flex flex-col items-center justify-center gap-1 ${activeData === 'CITY' && activeEngine === 'BAR' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <BarChart2 size={16} /> Cities / Bar
                      </button>
                      <button onClick={() => { if(playClick) playClick(); setActiveData('SPORT'); setActiveEngine('PIE'); }} className={`flex-1 p-2 rounded-lg font-bold text-[10px] sm:text-xs uppercase transition-colors flex flex-col items-center justify-center gap-1 ${activeData === 'SPORT' && activeEngine === 'PIE' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <PieIcon size={16} /> Sports / Pie
                      </button>
                    </div>
                    {activeData === 'CITY' && activeEngine === 'BAR' && (
                      <button onClick={() => { if(playSuccess) playSuccess(); setStep('COMPLETE'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl p-3 font-black uppercase tracking-wider text-sm transition-colors mt-2">
                        Configure Labels
                      </button>
                    )}
                  </div>
                )}

                {step === 'COMPLETE' && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Click to apply labels</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <button disabled={labels.title} onClick={() => { if(playClick) playClick(); setLabels(p => ({...p, title: true})); }} className={`p-2 rounded-lg font-bold text-xs font-mono transition-colors ${labels.title ? 'bg-slate-800 text-slate-600' : 'bg-sky-900/50 text-sky-300 hover:bg-sky-800 border border-sky-700/50'}`}>plt.title()</button>
                      <button disabled={labels.xlabel} onClick={() => { if(playClick) playClick(); setLabels(p => ({...p, xlabel: true})); }} className={`p-2 rounded-lg font-bold text-xs font-mono transition-colors ${labels.xlabel ? 'bg-slate-800 text-slate-600' : 'bg-sky-900/50 text-sky-300 hover:bg-sky-800 border border-sky-700/50'}`}>plt.xlabel()</button>
                      <button disabled={labels.ylabel} onClick={() => { if(playClick) playClick(); setLabels(p => ({...p, ylabel: true})); }} className={`p-2 rounded-lg font-bold text-xs font-mono transition-colors ${labels.ylabel ? 'bg-slate-800 text-slate-600' : 'bg-sky-900/50 text-sky-300 hover:bg-sky-800 border border-sky-700/50'}`}>plt.ylabel()</button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

      </div>

      <Celebration 
        isActive={step === 'OUTCOME'} 
        message="Visualization Pipeline Complete!" 
        onReplay={resetLab} 
      />
    </LabShell>
  );
}
