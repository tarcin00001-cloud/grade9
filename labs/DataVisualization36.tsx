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
      title="Data Visualization" 
      subtitle="Grade 9 | Data Representation"
      instruction="Route raw data into the Visualization Projector."
      bgOverride="bg-slate-900"
      onReset={resetLab}
    >
      {/* Full Bleed Environment */}
      <div className="absolute inset-0 top-[60px] md:top-[80px] z-10 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6 relative z-10 min-h-0">
          
          {/* Top Console - Status & Briefing */}
          <div className="flex flex-col md:flex-row gap-4 shrink-0">
            {/* Mission Briefing Screen */}
            <div className="flex-1 bg-slate-950/80 backdrop-blur-md border-2 border-sky-900/50 rounded-2xl p-4 shadow-[0_0_15px_rgba(14,165,233,0.15)] flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-900/50 flex items-center justify-center shrink-0 border border-sky-500/30">
                <Database className="text-sky-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sky-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Incoming Transmission</h3>
                <p className="text-sky-100 text-sm font-medium leading-relaxed">
                  {briefings[step]}
                </p>
              </div>
            </div>

            {/* Pipeline Status Indicator */}
            <div className="flex-[1.5] bg-slate-950/80 backdrop-blur-md border-2 border-slate-800 rounded-2xl p-4 flex flex-col justify-center shadow-inner">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-center">Pipeline Progress</h3>
              <div className="flex items-center justify-between gap-2 w-full px-2">
                {STEPS.map((s, idx) => {
                  const isActive = step === s.id;
                  const isPast = STEPS.findIndex(x => x.id === step) > idx;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="flex flex-col items-center gap-2 relative">
                        {/* Status Node */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-500 ${
                          isActive ? 'bg-sky-500 border-sky-300 text-white shadow-[0_0_15px_rgba(14,165,233,0.6)]' :
                          isPast ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 
                          'bg-slate-900 border-slate-700 text-slate-600'
                        }`}>
                          {idx + 1}
                        </div>
                        {/* Label */}
                        <span className={`absolute -bottom-5 w-24 text-center text-[9px] font-black uppercase tracking-wider ${
                          isActive ? 'text-sky-400' : isPast ? 'text-emerald-500' : 'text-slate-600'
                        }`}>
                          {s.label.split('. ')[1]}
                        </span>
                      </div>
                      {/* Connection Line */}
                      {idx < STEPS.length - 1 && (
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                          <div className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${isPast ? 'w-full bg-emerald-500' : 'w-0 bg-sky-500'}`} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Control Deck */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 mt-4">
            
            {/* The Holographic Projector (Canvas) */}
            <div className="flex-[1.5] relative flex flex-col min-h-0">
              {/* Hardware Bezel */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 rounded-3xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Inner Bezel */}
                <div className="w-full h-full bg-slate-950 rounded-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col">
                  {/* Glass Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
                  
                  {/* Screen Header */}
                  <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-10">
                    <span className="text-slate-500 text-[10px] font-mono tracking-widest">DISPLAY_OUT // 0x3F</span>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    </div>
                  </div>

                  {/* Screen Content */}
                  <div className="flex-1 relative p-4 flex items-center justify-center">
                    
                    {step === 'LEARN' && (
                      <div className="w-full h-full relative opacity-20 pointer-events-none">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[{ val: 10 }, { val: 20 }, { val: 15 }, { val: 25 }]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis hide />
                            <YAxis hide />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                          <div className="w-16 h-16 rounded-full border-2 border-sky-500/30 border-t-sky-500 animate-spin" />
                          <span className="font-mono text-sky-500 uppercase tracking-[0.3em] text-xs">Awaiting Stream</span>
                        </div>
                      </div>
                    )}

                    {step === 'TRY_RAW' && (
                      <div className="w-full h-full font-mono text-xs text-sky-300/50 overflow-y-auto break-all p-4">
                        {JSON.stringify(TEMP_DATA, null, 2).repeat(10)}
                      </div>
                    )}

                    {step !== 'LEARN' && step !== 'TRY_RAW' && (
                      <div className="w-full h-full relative z-10">
                        {/* Applied Labels for COMPLETE stage */}
                        {step === 'COMPLETE' || step === 'OUTCOME' ? (
                          <>
                            {labels.title && <div className="absolute top-0 left-0 w-full text-center font-bold text-slate-300 text-sm z-10 tracking-widest uppercase">City Populations (Millions)</div>}
                            {labels.ylabel && <div className="absolute top-1/2 -left-8 -translate-y-1/2 -rotate-90 font-bold text-slate-400 text-[10px] z-10 uppercase tracking-widest">Population</div>}
                            {labels.xlabel && <div className="absolute bottom-0 left-0 w-full text-center font-bold text-slate-400 text-[10px] z-10 uppercase tracking-widest">Indian Cities</div>}
                          </>
                        ) : null}
                        
                        {activeEngine ? renderChart(getActiveDataset(), activeEngine, step === 'FAIL_PIE') : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-slate-600 uppercase tracking-widest animate-pulse">
                            ENGINE OFFLINE
                          </div>
                        )}

                        {/* Error Overlay */}
                        <AnimatePresence>
                          {step === 'FAIL_PIE' && activeEngine === 'PIE' && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center bg-rose-950/80 backdrop-blur-sm z-20"
                            >
                              <div className="bg-rose-900 border-2 border-rose-500 p-6 rounded-xl flex flex-col items-center text-center shadow-[0_0_30px_rgba(244,63,94,0.4)] max-w-[80%]">
                                <AlertTriangle className="text-rose-400 mb-3 animate-bounce" size={40} />
                                <h3 className="font-black text-white uppercase tracking-wider mb-2 text-lg">Trend Invisible</h3>
                                <p className="text-sm text-rose-200 font-medium">This pie chart shows no temporal trend! It just looks like a pizza. We need a Line Graph.</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* The Control Terminal (Python Script) */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A] rounded-2xl border-2 border-[#333] shadow-2xl relative overflow-hidden">
              {/* Terminal Header */}
              <div className="h-10 bg-[#1A1A1A] border-b border-[#333] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Code2 className="text-emerald-500" size={16} />
                  <span className="text-[#888] font-mono text-[10px] uppercase tracking-widest">terminal // matplotlib</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="flex-1 flex flex-col p-5 font-mono text-xs md:text-sm overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="text-emerald-400 mb-6 leading-relaxed">
                  <span className="text-purple-400">import</span> matplotlib.pyplot <span className="text-purple-400">as</span> plt<br/><br/>
                  <span className="text-slate-600"># 1. Load Data</span><br/>
                  <span className="text-sky-300">data</span> = {activeData === 'TEMP' ? <span className="text-amber-300">temperature_log</span> : activeData === 'CITY' ? <span className="text-amber-300">populations</span> : activeData === 'SPORT' ? <span className="text-amber-300">favorites</span> : <span className="text-amber-300">raw_json</span>}<br/><br/>
                  
                  <span className="text-slate-600"># 2. Select Engine</span><br/>
                  {activeEngine === 'BAR' && <span>plt.<span className="text-blue-400">bar</span>(<span className="text-sky-300">data</span>)</span>}
                  {activeEngine === 'LINE' && <span>plt.<span className="text-pink-400">plot</span>(<span className="text-sky-300">data</span>)</span>}
                  {activeEngine === 'PIE' && <span>plt.<span className="text-amber-400">pie</span>(<span className="text-sky-300">data</span>)</span>}
                  {!activeEngine && <span className="text-rose-500">plt.???(<span className="text-sky-300">data</span>)</span>}<br/><br/>

                  {(step === 'COMPLETE' || step === 'OUTCOME') && (
                    <>
                      <span className="text-slate-600"># 3. Apply Labels</span><br/>
                      {labels.title ? <span>plt.<span className="text-yellow-200">title</span>(<span className="text-green-400">'City Populations'</span>)<br/></span> : <span className="text-slate-700"># plt.title(...)<br/></span>}
                      {labels.xlabel ? <span>plt.<span className="text-yellow-200">xlabel</span>(<span className="text-green-400">'Indian Cities'</span>)<br/></span> : <span className="text-slate-700"># plt.xlabel(...)<br/></span>}
                      {labels.ylabel ? <span>plt.<span className="text-yellow-200">ylabel</span>(<span className="text-green-400">'Population'</span>)<br/></span> : <span className="text-slate-700"># plt.ylabel(...)<br/></span>}
                      <br/>
                    </>
                  )}
                  
                  <span className="text-slate-600"># Render Chart</span><br/>
                  plt.<span className="text-yellow-200">show</span>()
                  <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-emerald-500 translate-y-1" />
                </div>

                {/* Industrial Controls */}
                <div className="mt-auto flex flex-col gap-3 shrink-0 bg-[#111] p-4 rounded-xl border border-[#222]">
                  {step === 'LEARN' && (
                    <button onClick={() => { if(playPop) playPop(); setStep('TRY_RAW'); }} className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-lg p-3 font-black uppercase tracking-[0.2em] text-xs transition-colors flex items-center justify-center gap-2 border border-sky-400 shadow-[0_0_15px_rgba(2,132,199,0.5)]">
                      <Database size={16} /> Import Raw Data
                    </button>
                  )}

                  {step === 'TRY_RAW' && (
                    <button onClick={() => { if(playPop) playPop(); setStep('FAIL_PIE'); }} className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-lg p-3 font-black uppercase tracking-[0.2em] text-xs transition-colors flex items-center justify-center gap-2 border border-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                      <PieIcon size={16} /> Inject Pie Engine
                    </button>
                  )}

                  {step === 'FAIL_PIE' && (
                    <>
                      <button onClick={() => { if(playError) playError(); setActiveEngine('PIE'); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg p-3 font-black uppercase tracking-[0.2em] text-xs transition-colors border border-slate-600">
                        Execute Pie Chart
                      </button>
                      {activeEngine === 'PIE' && (
                        <button onClick={() => { if(playPop) playPop(); setStep('UNDERSTAND'); setActiveEngine(null); }} className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-lg p-3 font-black uppercase tracking-[0.2em] text-xs transition-colors mt-2">
                          Analyze Fault
                        </button>
                      )}
                    </>
                  )}

                  {step === 'UNDERSTAND' && (
                    <button onClick={() => { if(playPop) playPop(); setStep('IMPROVE'); setActiveData('CITY'); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg p-3 font-black uppercase tracking-[0.2em] text-xs transition-colors shadow-[0_0_15px_rgba(5,150,105,0.5)] border border-emerald-400">
                      Re-route Engines
                    </button>
                  )}

                  {step === 'IMPROVE' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => { if(playClick) playClick(); setActiveData('TEMP'); setActiveEngine('LINE'); }} className={`p-2 rounded-lg font-bold text-[9px] uppercase transition-colors flex flex-col items-center justify-center gap-1.5 border ${activeData === 'TEMP' && activeEngine === 'LINE' ? 'bg-pink-600 text-white border-pink-400 shadow-[0_0_10px_rgba(219,39,119,0.5)]' : 'bg-[#222] text-[#888] border-[#333] hover:bg-[#333]'}`}>
                          <TrendingUp size={16} /> Temp
                        </button>
                        <button onClick={() => { if(playClick) playClick(); setActiveData('CITY'); setActiveEngine('BAR'); }} className={`p-2 rounded-lg font-bold text-[9px] uppercase transition-colors flex flex-col items-center justify-center gap-1.5 border ${activeData === 'CITY' && activeEngine === 'BAR' ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-[#222] text-[#888] border-[#333] hover:bg-[#333]'}`}>
                          <BarChart2 size={16} /> Cities
                        </button>
                        <button onClick={() => { if(playClick) playClick(); setActiveData('SPORT'); setActiveEngine('PIE'); }} className={`p-2 rounded-lg font-bold text-[9px] uppercase transition-colors flex flex-col items-center justify-center gap-1.5 border ${activeData === 'SPORT' && activeEngine === 'PIE' ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_10px_rgba(217,119,6,0.5)]' : 'bg-[#222] text-[#888] border-[#333] hover:bg-[#333]'}`}>
                          <PieIcon size={16} /> Sports
                        </button>
                      </div>
                      {activeData === 'CITY' && activeEngine === 'BAR' && (
                        <button onClick={() => { if(playSuccess) playSuccess(); setStep('COMPLETE'); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg p-3 font-black uppercase tracking-[0.2em] text-xs transition-colors border border-emerald-400 shadow-[0_0_15px_rgba(5,150,105,0.5)]">
                          Configure Labels
                        </button>
                      )}
                    </div>
                  )}

                  {step === 'COMPLETE' && (
                    <div className="flex flex-col gap-3">
                      <h3 className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] text-center">Inject Parameters</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <button disabled={labels.title} onClick={() => { if(playClick) playClick(); setLabels(p => ({...p, title: true})); }} className={`p-2 rounded-lg font-bold text-[10px] font-mono transition-colors border ${labels.title ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-[#222] text-green-400 hover:bg-[#333] border-green-900 shadow-[0_0_10px_rgba(74,222,128,0.1)]'}`}>plt.title</button>
                        <button disabled={labels.xlabel} onClick={() => { if(playClick) playClick(); setLabels(p => ({...p, xlabel: true})); }} className={`p-2 rounded-lg font-bold text-[10px] font-mono transition-colors border ${labels.xlabel ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-[#222] text-green-400 hover:bg-[#333] border-green-900 shadow-[0_0_10px_rgba(74,222,128,0.1)]'}`}>plt.xlabel</button>
                        <button disabled={labels.ylabel} onClick={() => { if(playClick) playClick(); setLabels(p => ({...p, ylabel: true})); }} className={`p-2 rounded-lg font-bold text-[10px] font-mono transition-colors border ${labels.ylabel ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-[#222] text-green-400 hover:bg-[#333] border-green-900 shadow-[0_0_10px_rgba(74,222,128,0.1)]'}`}>plt.ylabel</button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <Celebration 
        isActive={step === 'OUTCOME'} 
        message="Data Representation Complete!" 
        onReplay={resetLab} 
      />
    </LabShell>
  );
}
