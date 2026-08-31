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
    IMPROVE: "Let's fix the routing. Time-series data needs a Line Chart. Comparisons need a Bar Chart. Parts of a whole need a Pie Chart. Match any dataset to its proper engine.",
    COMPLETE: "Perfect! You selected the correct engine for that data structure. Now, stamp it with clear labels so others can read it.",
    OUTCOME: "The visualization is fully rendered and labeled. You have successfully translated raw data into a human-readable format!"
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
            <Pie data={data} cx="50%" cy="55%" innerRadius={0} outerRadius="70%" dataKey="val" animationDuration={800}>
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
      instruction="Draft the visualization by matching data to the correct chart engine."
      bgOverride="bg-slate-200"
      onReset={resetLab}
    >
      {/* Physical Drafting Desk Environment */}
      <div className="absolute inset-0 top-[60px] md:top-[80px] z-10 bg-slate-200 overflow-hidden flex flex-col p-4 lg:p-8">
        
        {/* Desk Texture / Mat */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,#94a3b8_1px,transparent_1px),linear-gradient(to_bottom,#94a3b8_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        {/* Workspace Container */}
        <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col gap-6 relative z-10 min-h-0">
          
          {/* Top Desk Items: Briefing Note & Checklist */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 shrink-0">
            
            {/* Post-it Note (Briefing) */}
            <div className="bg-yellow-100 p-4 md:p-5 shadow-[2px_5px_15px_rgba(0,0,0,0.1)] border border-yellow-200 rotate-[-1deg] w-full md:w-[350px] relative shrink-0">
              {/* Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/50 backdrop-blur-sm shadow-sm rotate-3 border border-slate-200/50" />
              <div className="flex items-center gap-2 mb-2">
                <Info size={16} className="text-yellow-700" strokeWidth={2.5} />
                <h3 className="font-black text-yellow-800 uppercase tracking-widest text-[10px]">Supervisor Note</h3>
              </div>
              <p className="text-slate-800 font-medium text-sm leading-relaxed">
                {briefings[step]}
              </p>
            </div>

            {/* Physical Checklist (Pipeline Progress) */}
            <div className="flex-1 max-w-[600px] bg-white p-3 pb-8 md:p-4 md:pb-10 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-200 shrink-0">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-3">Drafting Progress</h3>
              <div className="flex items-center justify-between w-full relative">
                {/* Connecting Bar */}
                <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${(STEPS.findIndex(s => s.id === step) / (STEPS.length - 1)) * 100}%` }}
                  />
                </div>
                
                {/* Nodes */}
                {STEPS.map((s, idx) => {
                  const isActive = step === s.id;
                  const isPast = STEPS.findIndex(x => x.id === step) > idx;
                  return (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${
                        isActive ? 'bg-sky-100 border-sky-500 text-sky-700 scale-110 shadow-[0_0_10px_rgba(14,165,233,0.3)]' :
                        isPast ? 'bg-emerald-500 border-emerald-600 text-white shadow-inner' : 
                        'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {isPast ? '✓' : (idx + 1)}
                      </div>
                      <span className={`absolute -bottom-6 w-24 text-center text-[9px] font-black uppercase tracking-wider transition-colors ${
                        isActive ? 'text-sky-700' : isPast ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {s.label.split('. ')[1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Drafting Area (Two-Column Physical Objects) */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 mt-2">
            
            {/* LEFT: Physical Clipboard (The Canvas) */}
            <div className="w-full lg:w-[55%] relative min-h-0 flex flex-col">
              {/* Clipboard Base */}
              <div className="absolute inset-0 bg-[#c19a6b] rounded-2xl shadow-[10px_20px_30px_rgba(0,0,0,0.2)] border-b-[8px] border-r-[4px] border-[#a07b53]">
                {/* Wood Grain Lines (Faint) */}
                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_12px)] rounded-2xl pointer-events-none" />
              </div>
              
              {/* Inner Clipboard Content */}
              <div className="relative flex-1 flex flex-col p-4 md:p-6 pb-8 min-h-0">
                {/* Silver Clip Mechanism */}
                <div className="shrink-0 w-32 h-8 bg-gradient-to-b from-slate-200 to-slate-400 mx-auto rounded-t-lg shadow-md border-b-2 border-slate-500 relative z-20 flex items-center justify-center -mt-2">
                   <div className="w-16 h-2 bg-slate-500 rounded-full shadow-inner opacity-50" />
                </div>
                
                {/* Paper Sheet */}
                <div className="flex-1 bg-white rounded-md shadow-inner relative flex flex-col p-4 min-h-0 -mt-2 border-l border-t border-slate-100">
                  {/* Faint Graph Paper Grid */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:1rem_1rem]" />
                  
                  {/* Canvas Header */}
                  <div className="flex items-center justify-between mb-2 shrink-0 border-b-2 border-slate-100 pb-2 relative z-10">
                    <div className="flex items-center gap-2 text-slate-500">
                      <BarChart2 size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Drafting Canvas</span>
                    </div>
                  </div>

                  {/* Chart Rendering Area */}
                  <div className="flex-1 relative min-h-0 flex items-center justify-center">
                    
                    {step === 'LEARN' && (
                      <div className="w-full h-full relative opacity-20 pointer-events-none flex flex-col items-center justify-center gap-4">
                        <LineChart data={[{ val: 10 }, { val: 20 }, { val: 15 }, { val: 25 }]} width={200} height={150}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                          <Line type="monotone" dataKey="val" stroke="#94a3b8" strokeWidth={4} dot={false} />
                        </LineChart>
                        <span className="font-black text-slate-600 uppercase tracking-[0.2em] text-sm">Awaiting Raw Materials</span>
                      </div>
                    )}

                    {step === 'TRY_RAW' && (
                      <div className="w-full h-full font-mono text-xs text-slate-400 overflow-y-auto break-all p-4 bg-slate-50 rounded border border-slate-200 shadow-inner">
                        {JSON.stringify(TEMP_DATA, null, 2).repeat(10)}
                      </div>
                    )}

                    {step !== 'LEARN' && step !== 'TRY_RAW' && (
                      <div className="w-full h-full relative z-10">
                        {/* Applied Labels for COMPLETE stage */}
                        {(step === 'COMPLETE' || step === 'OUTCOME') ? (
                          <>
                            {labels.title && <div className="absolute top-0 left-0 w-full text-center font-black text-slate-800 text-sm z-10 uppercase tracking-widest bg-white/80 p-1">
                              {activeData === 'CITY' ? 'City Populations (Millions)' : activeData === 'TEMP' ? 'Monthly Temperature (°C)' : 'Favorite Sports (Votes)'}
                            </div>}
                            {labels.ylabel && activeEngine !== 'PIE' && <div className="absolute top-1/2 -left-6 -translate-y-1/2 -rotate-90 font-black text-slate-600 text-[10px] z-10 uppercase tracking-widest bg-white/80 px-2 py-1">
                              {activeData === 'CITY' ? 'Population' : 'Temperature'}
                            </div>}
                            {labels.xlabel && activeEngine !== 'PIE' && <div className="absolute bottom-0 left-0 w-full text-center font-black text-slate-600 text-[10px] z-10 uppercase tracking-widest bg-white/80 p-1">
                              {activeData === 'CITY' ? 'Indian Cities' : 'Months'}
                            </div>}
                          </>
                        ) : null}
                        
                        {activeEngine ? renderChart(getActiveDataset(), activeEngine, step === 'FAIL_PIE') : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 uppercase tracking-widest">
                            No Engine Assigned
                          </div>
                        )}

                        {/* Error Overlay - Flashing Red Stamp */}
                        <AnimatePresence>
                          {step === 'FAIL_PIE' && activeEngine === 'PIE' && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 2, rotate: -20 }}
                              animate={{ opacity: 1, scale: 1, rotate: -10 }}
                              className="absolute top-1/4 left-1/4 right-1/4 z-20 pointer-events-none"
                            >
                              <div className="border-4 border-rose-500 p-4 rounded-lg flex flex-col items-center text-center shadow-[0_0_20px_rgba(244,63,94,0.3)] bg-white/90 backdrop-blur-sm">
                                <AlertTriangle className="text-rose-600 mb-2" size={32} />
                                <h3 className="font-black text-rose-600 uppercase tracking-[0.2em] mb-1 text-lg">Trend Invisible</h3>
                                <p className="text-[11px] text-rose-500 font-bold leading-tight">A pie chart shows NO temporal trend. It just looks like a pizza. Time-series needs a Line Graph!</p>
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

            {/* RIGHT: Data Drafting Machine (Terminal & Controls) */}
            <div className="w-full lg:w-[45%] flex flex-col md:flex-row gap-3 bg-[#e0e4e8] rounded-2xl shadow-[5px_10px_20px_rgba(0,0,0,0.15)] border-t border-l border-white border-b-[6px] border-r-[4px] border-slate-300 p-3 min-h-0 min-w-0">
              
              {/* Screen Bezel */}
              <div className="flex-1 bg-slate-900 border-4 border-[#cbd5e1] rounded-xl shadow-inner flex flex-col overflow-hidden min-h-0">
                <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b border-slate-700 shrink-0">
                  <span className="text-slate-400 text-[9px] font-black tracking-widest uppercase">Matplotlib Compiler</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
                
                {/* Code Area */}
                <div className="flex-1 p-4 md:p-5 font-mono text-xs text-slate-300 overflow-hidden leading-relaxed flex flex-col justify-start">
                  <div className="text-emerald-400">
                    <span className="text-purple-400">import</span> matplotlib.pyplot <span className="text-purple-400">as</span> plt<br/><br/>
                    
                    <span className="text-slate-500"># 1. Load Data</span><br/>
                    <span className="text-sky-300">data</span> = {activeData === 'TEMP' ? <span className="text-amber-300">temperature_log</span> : activeData === 'CITY' ? <span className="text-amber-300">populations</span> : activeData === 'SPORT' ? <span className="text-amber-300">favorites</span> : <span className="text-amber-300">raw_json</span>}<br/><br/>
                    
                    <span className="text-slate-500"># 2. Select Engine</span><br/>
                    {activeEngine === 'BAR' && <span>plt.<span className="text-blue-400">bar</span>(<span className="text-sky-300">data</span>)</span>}
                    {activeEngine === 'LINE' && <span>plt.<span className="text-pink-400">plot</span>(<span className="text-sky-300">data</span>)</span>}
                    {activeEngine === 'PIE' && <span>plt.<span className="text-amber-400">pie</span>(<span className="text-sky-300">data</span>)</span>}
                    {!activeEngine && <span className="text-rose-500">plt.???(<span className="text-sky-300">data</span>)</span>}<br/><br/>

                    <span className="text-slate-500"># 3. Apply Labels</span><br/>
                    {(step === 'COMPLETE' || step === 'OUTCOME') ? (
                      <>
                        {labels.title ? <span>plt.<span className="text-yellow-200">title</span>(<span className="text-green-400">'{activeData === 'CITY' ? 'City Populations' : activeData === 'TEMP' ? 'Monthly Temp' : 'Favorite Sports'}'</span>)<br/></span> : <span className="text-slate-700"># plt.title(...)<br/></span>}
                        {labels.xlabel ? <span>plt.<span className="text-yellow-200">xlabel</span>(<span className="text-green-400">'{activeData === 'CITY' ? 'Indian Cities' : activeData === 'TEMP' ? 'Months' : 'Sports'}'</span>)<br/></span> : <span className="text-slate-700"># plt.xlabel(...)<br/></span>}
                        {labels.ylabel ? <span>plt.<span className="text-yellow-200">ylabel</span>(<span className="text-green-400">'{activeData === 'CITY' ? 'Population' : activeData === 'TEMP' ? 'Temp (C)' : 'Votes'}'</span>)<br/></span> : <span className="text-slate-700"># plt.ylabel(...)<br/></span>}
                      </>
                    ) : (
                      <span className="text-slate-700"># (Awaiting routing lock...)<br/></span>
                    )}
                    <br/>
                    
                    <span className="text-slate-500"># 4. Render Chart</span><br/>
                    plt.<span className="text-yellow-200">show</span>()
                    <span className="animate-pulse ml-1 inline-block w-2 h-3 bg-emerald-500 translate-y-0.5" />
                  </div>
                </div>
              </div>

              {/* Physical Keyboard / Button Panel (Vertical Side-Panel) */}
              <div className="shrink-0 w-full md:w-36 lg:w-40 bg-[#d1d5db] p-3 rounded-xl shadow-inner border-t-2 border-white/60 flex flex-col overflow-y-auto">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">Controls</h3>
                
                <div className="flex flex-col gap-3 my-auto">
                  
                  {step === 'LEARN' && (
                    <button onClick={() => { if(playPop) playPop(); setStep('TRY_RAW'); }} className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-lg p-3 font-black uppercase tracking-wider text-xs transition-all active:translate-y-1 shadow-[0_4px_0_#1d4ed8] active:shadow-[0_0px_0_#1d4ed8] flex flex-col items-center justify-center gap-1 text-center">
                      <Database size={18} /> Import Raw Data
                    </button>
                  )}

                  {step === 'TRY_RAW' && (
                    <button onClick={() => { if(playPop) playPop(); setStep('FAIL_PIE'); }} className="w-full bg-amber-500 hover:bg-amber-400 text-white rounded-lg p-3 font-black uppercase tracking-wider text-xs transition-all active:translate-y-1 shadow-[0_4px_0_#b45309] active:shadow-[0_0px_0_#b45309] flex flex-col items-center justify-center gap-1 text-center">
                      <PieIcon size={18} /> Inject Pie Engine
                    </button>
                  )}

                  {step === 'FAIL_PIE' && (
                    <div className="flex flex-col gap-3">
                      <button onClick={() => { if(playError) playError(); setActiveEngine('PIE'); }} className="w-full bg-slate-300 hover:bg-slate-200 text-slate-600 rounded-lg p-3 font-black uppercase tracking-wider text-xs transition-all active:translate-y-1 shadow-[0_4px_0_#94a3b8] active:shadow-[0_0px_0_#94a3b8]">
                        Execute Pie
                      </button>
                      {activeEngine === 'PIE' && (
                        <button onClick={() => { if(playPop) playPop(); setStep('UNDERSTAND'); setActiveEngine(null); }} className="w-full bg-rose-500 hover:bg-rose-400 text-white rounded-lg p-3 font-black uppercase tracking-wider text-xs transition-all active:translate-y-1 shadow-[0_4px_0_#be123c] active:shadow-[0_0px_0_#be123c]">
                          Analyze Fault
                        </button>
                      )}
                    </div>
                  )}

                  {step === 'UNDERSTAND' && (
                    <button onClick={() => { if(playPop) playPop(); setStep('IMPROVE'); setActiveData('CITY'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg p-3 font-black uppercase tracking-wider text-xs transition-all active:translate-y-1 shadow-[0_4px_0_#047857] active:shadow-[0_0px_0_#047857]">
                      Reset & Re-route
                    </button>
                  )}

                  {step === 'IMPROVE' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        {/* Physical Routing Keys */}
                        <button onClick={() => { if(playClick) playClick(); setActiveData('TEMP'); setActiveEngine('LINE'); }} className={`w-full p-2 rounded-lg font-bold text-[10px] uppercase transition-all active:translate-y-1 flex items-center justify-start gap-2 ${activeData === 'TEMP' && activeEngine === 'LINE' ? 'bg-pink-500 text-white shadow-[0_4px_0_#be185d]' : 'bg-white text-slate-600 shadow-[0_4px_0_#94a3b8] hover:bg-slate-50'}`}>
                          <TrendingUp size={18} className="shrink-0" /> 
                          <div className="flex flex-col items-start leading-tight">
                            <span>Temp</span>
                            <span className="text-[8px] opacity-80">Line Chart</span>
                          </div>
                        </button>
                        <button onClick={() => { if(playClick) playClick(); setActiveData('CITY'); setActiveEngine('BAR'); }} className={`w-full p-2 rounded-lg font-bold text-[10px] uppercase transition-all active:translate-y-1 flex items-center justify-start gap-2 ${activeData === 'CITY' && activeEngine === 'BAR' ? 'bg-blue-500 text-white shadow-[0_4px_0_#1d4ed8]' : 'bg-white text-slate-600 shadow-[0_4px_0_#94a3b8] hover:bg-slate-50'}`}>
                          <BarChart2 size={18} className="shrink-0" /> 
                          <div className="flex flex-col items-start leading-tight">
                            <span>Cities</span>
                            <span className="text-[8px] opacity-80">Bar Chart</span>
                          </div>
                        </button>
                        <button onClick={() => { if(playClick) playClick(); setActiveData('SPORT'); setActiveEngine('PIE'); }} className={`w-full p-2 rounded-lg font-bold text-[10px] uppercase transition-all active:translate-y-1 flex items-center justify-start gap-2 ${activeData === 'SPORT' && activeEngine === 'PIE' ? 'bg-amber-500 text-white shadow-[0_4px_0_#b45309]' : 'bg-white text-slate-600 shadow-[0_4px_0_#94a3b8] hover:bg-slate-50'}`}>
                          <PieIcon size={18} className="shrink-0" /> 
                          <div className="flex flex-col items-start leading-tight">
                            <span>Sports</span>
                            <span className="text-[8px] opacity-80">Pie Chart</span>
                          </div>
                        </button>
                      </div>
                      
                      {((activeData === 'CITY' && activeEngine === 'BAR') || 
                        (activeData === 'TEMP' && activeEngine === 'LINE') || 
                        (activeData === 'SPORT' && activeEngine === 'PIE')) && (
                        <button onClick={() => { if(playSuccess) playSuccess(); setStep('COMPLETE'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg p-3 font-black uppercase tracking-wider text-xs transition-all active:translate-y-1 shadow-[0_4px_0_#047857] active:shadow-[0_0px_0_#047857]">
                          Lock Routing
                        </button>
                      )}
                    </div>
                  )}

                  {step === 'COMPLETE' && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-1">Stamp Labels</h3>
                      <div className="flex flex-col gap-2">
                        {['title', 'xlabel', 'ylabel'].map(l => {
                          const prop = l as keyof typeof labels;
                          return (
                            <button 
                              key={l}
                              disabled={labels[prop]} 
                              onClick={() => { if(playClick) playClick(); setLabels(p => ({...p, [prop]: true})); }} 
                              className={`w-full p-2 rounded-lg font-bold text-xs font-mono transition-all uppercase tracking-wider text-center ${
                                labels[prop] 
                                  ? 'bg-slate-300 text-slate-400 shadow-none translate-y-1' 
                                  : 'bg-white text-sky-700 shadow-[0_4px_0_#94a3b8] active:translate-y-1 active:shadow-none hover:bg-slate-50 border border-slate-200'
                              }`}
                            >
                              {l}
                            </button>
                          );
                        })}
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
        message="Visualization Drafted Perfectly!" 
        onReplay={resetLab} 
      />
    </LabShell>
  );
}
