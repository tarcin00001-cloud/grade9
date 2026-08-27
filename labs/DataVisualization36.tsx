"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Play, Terminal, Activity, PieChart, BarChart3, Database, CheckCircle2, ScatterChart } from "lucide-react";

export default function DataVisualization36() {
  const { playClick, playSuccess, playError, playPop } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);

  // === Level 0 & 1: The Sorting Chute ===
  const [boxPosition, setBoxPosition] = useState<'belt' | 'pie' | 'bar' | 'line' | 'scatter'>('belt');
  
  const routeBox = (type: 'pie' | 'bar' | 'line' | 'scatter') => {
    if (playClick) playClick();
    setBoxPosition(type);
    
    setTimeout(() => {
      if ((currentLevel === 0 && type === 'line') || (currentLevel === 1 && type === 'scatter')) {
        if (playSuccess) playSuccess();
        setTimeout(() => {
          setBoxPosition('belt');
          nextLevel();
        }, 1500);
      } else {
        if (playError) playError();
        setTimeout(() => setBoxPosition('belt'), 1000);
      }
    }, 600);
  };

  // === Level 2: Python Wiring ===
  const [wires, setWires] = useState({ pie: '', bar: '', line: '', scatter: '' });
  const handleWire = (chartType: 'pie'|'bar'|'line'|'scatter', command: string) => {
    if (playClick) playClick();
    setWires(prev => ({ ...prev, [chartType]: command }));
  };

  const checkWires = () => {
    if (wires.pie === 'plt.pie()' && wires.bar === 'plt.bar()' && wires.line === 'plt.plot()' && wires.scatter === 'plt.scatter()') {
      if (playSuccess) playSuccess();
      setTimeout(() => nextLevel(), 1000);
    } else {
      if (playError) playError();
      setWires({ pie: '', bar: '', line: '', scatter: '' });
    }
  };

  // === Level 3: Customizing Bar Chart ===
  const [barCode, setBarCode] = useState({ title: "'City Population'", color: "'blue'" });
  const checkBarCode = () => {
    if (playClick) playClick();
    if (barCode.title !== "''" && (barCode.color === "'green'" || barCode.color === "'red'" || barCode.color === "'blue'")) {
      if (playSuccess) playSuccess();
      setTimeout(() => nextLevel(), 1500);
    } else {
      if (playError) playError();
    }
  };

  // === Level 4: Customizing Scatter Plot ===
  const [scatterCode, setScatterCode] = useState({ size: "50", marker: "'o'" });
  const checkScatterCode = () => {
    if (playClick) playClick();
    if ((scatterCode.size === "100" || scatterCode.size === "200") && (scatterCode.marker === "'*'" || scatterCode.marker === "'s'" || scatterCode.marker === "'o'")) {
      if (playSuccess) playSuccess();
      setWin(true);
    } else {
      if (playError) playError();
    }
  };

  const nextLevel = () => {
    setCurrentLevel(l => l + 1);
  };

  const handleReset = () => {
    setWin(false);
    setCurrentLevel(0);
    setBoxPosition('belt');
    setWires({ pie: '', bar: '', line: '', scatter: '' });
    setBarCode({ title: "'City Population'", color: "'blue'" });
    setScatterCode({ size: "50", marker: "'o'" });
  };

  return (
    <LabShell
      labId="datavisualization36"
      title="Data Visualization Techniques"
      subtitle="The Chart Translator Machine"
      instruction="1. Understand the importance of mapping raw data to visual representations. 2. Enter the interactive factory simulation to process raw datasets. 3. Use Python-based visualization tools to create meaningful charts and graphs. 4. Customize the visual elements to highlight key data trends and insights."
      theme="garden"
      onReset={handleReset}
    >
      {/* Progress Lights */}
      <div className="w-full max-w-6xl mx-auto flex justify-end mb-2 relative z-20">
        <div className="flex gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-3 h-3 rounded-full border ${currentLevel > i ? 'bg-green-500 border-green-600 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : currentLevel === i ? 'bg-amber-400 border-amber-500 shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse' : 'bg-slate-700 border-slate-600'}`} />
          ))}
        </div>
      </div>

      {/* Main Content: Side-by-Side (Compact, no scroll) */}
      <div className="flex flex-1 min-h-0 relative bg-slate-100 rounded-xl overflow-hidden shadow-2xl w-full max-w-6xl mx-auto border-4 border-slate-700/30">
        <Celebration isActive={win} onReplay={handleReset} message="You built the Data Factory and mastered all 4 chart types!" />
        
        {!win && (
          <>
            {/* LEFT PANEL: Control Terminal (Compact) */}
            <div className="w-[420px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-lg text-slate-800">
              
              <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-2 shrink-0">
                <Terminal size={16} className="text-blue-600" />
                <span className="font-bold text-sm text-slate-700 uppercase">Command Interface</span>
              </div>
              
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
                
                {(currentLevel === 0 || currentLevel === 1) && (
                  <div className="flex flex-col gap-2 h-full">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r shrink-0">
                      <h3 className="font-black text-blue-900 text-base mb-1">Objective: Route Data</h3>
                      <p className="text-sm text-blue-800 leading-tight">Identify if the data on the belt represents a trend, proportion, comparison, or correlation. Route it to the correct machine!</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-1 justify-center">
                      <p className="text-xs font-bold text-slate-500 uppercase">Machine Controls</p>
                      
                      <button onClick={() => routeBox('line')} className="bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-bold py-2 px-3 rounded flex items-center justify-between transition-all group">
                        <span className="flex items-center gap-2 text-base"><Activity className="text-emerald-500" size={18}/> Line Chute</span>
                        <Play size={14} className="text-slate-300 group-hover:text-emerald-500" />
                      </button>
                      
                      <button onClick={() => routeBox('scatter')} className="bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 font-bold py-2 px-3 rounded flex items-center justify-between transition-all group">
                        <span className="flex items-center gap-2 text-base"><ScatterChart className="text-blue-500" size={18}/> Scatter Chute</span>
                        <Play size={14} className="text-slate-300 group-hover:text-blue-500" />
                      </button>
                      
                      <button onClick={() => routeBox('bar')} className="bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 font-bold py-2 px-3 rounded flex items-center justify-between transition-all group">
                        <span className="flex items-center gap-2 text-base"><BarChart3 className="text-amber-500" size={18}/> Bar Chute</span>
                        <Play size={14} className="text-slate-300 group-hover:text-amber-500" />
                      </button>
                      
                      <button onClick={() => routeBox('pie')} className="bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-slate-700 font-bold py-2 px-3 rounded flex items-center justify-between transition-all group">
                        <span className="flex items-center gap-2 text-base"><PieChart className="text-purple-500" size={18}/> Pie Chute</span>
                        <Play size={14} className="text-slate-300 group-hover:text-purple-500" />
                      </button>
                    </div>
                  </div>
                )}

                {currentLevel === 2 && (
                  <div className="flex flex-col gap-2 h-full">
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-2 rounded-r shrink-0">
                      <h3 className="font-black text-amber-900 text-base">Objective: Python Logic</h3>
                      <p className="text-sm text-amber-800 leading-tight mt-1">Match the correct `matplotlib` command to each physical module.</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2 justify-center">
                      <div className="flex justify-between items-center text-sm text-blue-600 font-mono font-bold bg-slate-100 p-1 rounded">
                        <span>plt.plot()</span><span>plt.bar()</span><span>plt.pie()</span><span>plt.scatter()</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-700">Line Logic:</label>
                          <select value={wires.line} onChange={(e) => handleWire('line', e.target.value)} className="bg-white border border-slate-200 rounded p-1 font-mono text-sm text-blue-700 focus:border-blue-500 outline-none">
                            <option value="">-- select --</option><option value="plt.bar()">plt.bar()</option><option value="plt.pie()">plt.pie()</option><option value="plt.plot()">plt.plot()</option><option value="plt.scatter()">plt.scatter()</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-700">Scatter Logic:</label>
                          <select value={wires.scatter} onChange={(e) => handleWire('scatter', e.target.value)} className="bg-white border border-slate-200 rounded p-1 font-mono text-sm text-blue-700 focus:border-blue-500 outline-none">
                            <option value="">-- select --</option><option value="plt.bar()">plt.bar()</option><option value="plt.pie()">plt.pie()</option><option value="plt.plot()">plt.plot()</option><option value="plt.scatter()">plt.scatter()</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-700">Bar Logic:</label>
                          <select value={wires.bar} onChange={(e) => handleWire('bar', e.target.value)} className="bg-white border border-slate-200 rounded p-1 font-mono text-sm text-blue-700 focus:border-blue-500 outline-none">
                            <option value="">-- select --</option><option value="plt.bar()">plt.bar()</option><option value="plt.pie()">plt.pie()</option><option value="plt.plot()">plt.plot()</option><option value="plt.scatter()">plt.scatter()</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-700">Pie Logic:</label>
                          <select value={wires.pie} onChange={(e) => handleWire('pie', e.target.value)} className="bg-white border border-slate-200 rounded p-1 font-mono text-sm text-blue-700 focus:border-blue-500 outline-none">
                            <option value="">-- select --</option><option value="plt.bar()">plt.bar()</option><option value="plt.pie()">plt.pie()</option><option value="plt.plot()">plt.plot()</option><option value="plt.scatter()">plt.scatter()</option>
                          </select>
                        </div>
                      </div>

                      <button onClick={checkWires} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-sm py-2 rounded shadow-md transition-colors w-full">
                        Boot System
                      </button>
                    </div>
                  </div>
                )}

                {currentLevel === 3 && (
                  <div className="flex flex-col gap-2 h-full">
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded-r shrink-0">
                      <h3 className="font-black text-purple-900 text-base">Objective: Customize Bar</h3>
                      <p className="text-sm text-purple-800 leading-tight mt-1">Change the chart title and pick a different color for the bars.</p>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded overflow-hidden font-mono text-sm mt-2">
                      <div className="bg-slate-200 text-slate-500 text-xs px-2 py-1 font-bold">script.py</div>
                      <div className="p-3 flex flex-col gap-1 text-slate-600">
                        <div><span className="text-pink-600">import</span> <span className="text-blue-600">matplotlib.pyplot</span> <span className="text-pink-600">as</span> plt</div>
                        <div className="mt-2 text-slate-400"># Render Bar Chart</div>
                        <div>
                          plt.bar(x, y, 
                          <span className="text-orange-600">color</span>=
                          <select value={barCode.color} onChange={(e) => { if(playPop) playPop(); setBarCode(prev => ({...prev, color: e.target.value})) }} className="bg-white border border-slate-300 text-green-700 px-1 ml-1 rounded outline-none cursor-pointer">
                            <option value="'blue'">'blue'</option>
                            <option value="'green'">'green'</option>
                            <option value="'red'">'red'</option>
                          </select>)
                        </div>
                        <div className="mt-2 text-slate-400"># Set Title</div>
                        <div className="flex items-center">
                          plt.title(<input type="text" value={barCode.title.replace(/'/g, '')} onChange={(e) => setBarCode(prev => ({...prev, title: "'" + e.target.value + "'"}))} className="bg-white border border-slate-300 text-green-700 px-1 ml-1 rounded w-32 outline-none focus:border-blue-500" />)
                        </div>
                        <div className="mt-2">plt.show()</div>
                      </div>
                    </div>

                    <button onClick={checkBarCode} className="mt-auto bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-sm py-2 rounded shadow-md transition-colors w-full">
                      Render Art
                    </button>
                  </div>
                )}

                {currentLevel === 4 && (
                  <div className="flex flex-col gap-2 h-full">
                    <div className="bg-pink-50 border-l-4 border-pink-500 p-2 rounded-r shrink-0">
                      <h3 className="font-black text-pink-900 text-base">Objective: Customize Scatter</h3>
                      <p className="text-sm text-pink-800 leading-tight mt-1">Change the scatter point size (`s`) and marker shape (`marker`).</p>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded overflow-hidden font-mono text-sm mt-2">
                      <div className="bg-slate-200 text-slate-500 text-xs px-2 py-1 font-bold">script.py</div>
                      <div className="p-3 flex flex-col gap-1 text-slate-600">
                        <div><span className="text-pink-600">import</span> <span className="text-blue-600">matplotlib.pyplot</span> <span className="text-pink-600">as</span> plt</div>
                        <div className="mt-2 text-slate-400"># Render Scatter Plot</div>
                        <div>
                          plt.scatter(x, y, 
                          <span className="text-orange-600">s</span>=
                          <select value={scatterCode.size} onChange={(e) => { if(playPop) playPop(); setScatterCode(prev => ({...prev, size: e.target.value})) }} className="bg-white border border-slate-300 text-green-700 px-1 ml-1 rounded outline-none cursor-pointer">
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                          </select>,
                        </div>
                        <div className="pl-4">
                          <span className="text-orange-600">marker</span>=
                          <select value={scatterCode.marker} onChange={(e) => { if(playPop) playPop(); setScatterCode(prev => ({...prev, marker: e.target.value})) }} className="bg-white border border-slate-300 text-green-700 px-1 ml-1 rounded outline-none cursor-pointer">
                            <option value="'o'">circle ('o')</option>
                            <option value="'s'">square ('s')</option>
                            <option value="'*'">star ('*')</option>
                          </select>)
                        </div>
                        <div className="mt-2">plt.show()</div>
                      </div>
                    </div>

                    <button onClick={checkScatterCode} className="mt-auto bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-sm py-2 rounded shadow-md transition-colors w-full">
                      Render Art
                    </button>
                  </div>
                )}
                
              </div>
            </div>

            {/* RIGHT PANEL: Factory Floor */}
            <div className="flex-1 bg-blue-50 relative overflow-hidden flex flex-col justify-center">
              
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
              
              {(currentLevel === 0 || currentLevel === 1) && (
                <div className="w-full h-full flex flex-col items-center justify-center relative z-10 p-4">
                  
                  {/* Conveyor Belt */}
                  <div className="relative w-full max-w-sm h-24 bg-slate-200 border-y-4 border-slate-300 rounded flex items-center justify-center shadow-inner mb-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[slide_1.5s_linear_infinite]" />
                    
                    <motion.div 
                      animate={{ 
                        x: boxPosition === 'belt' ? 0 : 250,
                        y: boxPosition === 'pie' ? -150 : boxPosition === 'bar' ? 150 : boxPosition === 'scatter' ? 75 : boxPosition === 'line' ? -75 : 0,
                        scale: boxPosition === 'belt' ? 1 : 0.4,
                        opacity: boxPosition === 'belt' ? 1 : 0
                      }}
                      className="bg-white border-[3px] border-blue-400 p-2 rounded shadow-md flex flex-col items-center z-20"
                    >
                      <Database className="text-blue-500" size={24} />
                      <span className="font-black text-slate-700 text-xs uppercase tracking-tight text-center mt-1">
                        {currentLevel === 0 ? "Monthly Temp" : "Height vs Age"}
                      </span>
                    </motion.div>
                  </div>

                  {/* Chutes */}
                  <div className="absolute right-4 top-4 bottom-4 flex flex-col justify-between">
                    <div className="bg-white/80 backdrop-blur border-2 border-purple-200 p-2 rounded-xl flex items-center gap-2 shadow-md w-36">
                      <PieChart size={24} className="text-purple-500 shrink-0" />
                      <span className="font-bold text-xs text-purple-700 uppercase">Pie Module</span>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur border-2 border-emerald-200 p-2 rounded-xl flex items-center gap-2 shadow-md w-36 relative">
                      <Activity size={24} className="text-emerald-500 shrink-0" />
                      <span className="font-bold text-xs text-emerald-700 uppercase">Line Module</span>
                      {boxPosition === 'line' && currentLevel === 0 && (
                        <motion.div initial={{ scale:0 }} animate={{ scale:1 }} className="absolute -left-20 bg-green-500 text-white font-bold text-sm p-1 rounded">Correct!</motion.div>
                      )}
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur border-2 border-blue-200 p-2 rounded-xl flex items-center gap-2 shadow-md w-36 relative">
                      <ScatterChart size={24} className="text-blue-500 shrink-0" />
                      <span className="font-bold text-xs text-blue-700 uppercase">Scatter Mod</span>
                      {boxPosition === 'scatter' && currentLevel === 1 && (
                        <motion.div initial={{ scale:0 }} animate={{ scale:1 }} className="absolute -left-20 bg-green-500 text-white font-bold text-sm p-1 rounded">Correct!</motion.div>
                      )}
                    </div>

                    <div className="bg-white/80 backdrop-blur border-2 border-amber-200 p-2 rounded-xl flex items-center gap-2 shadow-md w-36">
                      <BarChart3 size={24} className="text-amber-500 shrink-0" />
                      <span className="font-bold text-xs text-amber-700 uppercase">Bar Module</span>
                    </div>
                  </div>

                </div>
              )}

              {currentLevel === 2 && (
                <div className="flex-1 flex items-center justify-center p-4 relative z-10 w-full">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                    
                    {[
                      { type: 'line', icon: Activity, color: 'emerald', cmd: wires.line, expected: 'plt.plot()' },
                      { type: 'bar', icon: BarChart3, color: 'amber', cmd: wires.bar, expected: 'plt.bar()' },
                      { type: 'scatter', icon: ScatterChart, color: 'blue', cmd: wires.scatter, expected: 'plt.scatter()' },
                      { type: 'pie', icon: PieChart, color: 'purple', cmd: wires.pie, expected: 'plt.pie()' }
                    ].map((m) => (
                      <div key={m.type} className={`bg-white border-[3px] rounded-xl p-3 flex flex-col items-center gap-2 shadow-lg transition-colors ${m.cmd === m.expected ? "border-" + m.color + "-400 bg-" + m.color + "-50" : m.cmd ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}>
                        <m.icon size={36} className={m.cmd === m.expected ? "text-" + m.color + "-500" : 'text-slate-300'} />
                        <div className="text-center">
                          <h4 className="font-black text-slate-700 text-sm uppercase">{m.type} Graph</h4>
                        </div>
                        <div className={`w-full py-1 text-center rounded font-mono text-xs font-bold ${m.cmd === m.expected ? "bg-" + m.color + "-500 text-white" : m.cmd ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {m.cmd || 'NO LOGIC'}
                        </div>
                      </div>
                    ))}
                    
                  </div>
                </div>
              )}

              {currentLevel === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-6 w-full max-w-lg">
                    <h2 className="text-lg font-black text-slate-800 text-center mb-6">{barCode.title === "''" ? "Untitled Chart" : barCode.title.replace(/'/g, '')}</h2>
                    
                    <div className="flex items-end justify-around h-48 border-b-2 border-l-2 border-slate-300 pb-1 pl-2 pr-2">
                      {/* Bars */}
                      <motion.div initial={{height:0}} animate={{height: 120}} className={`w-12 rounded-t-sm shadow-md ${barCode.color === "'blue'" ? 'bg-blue-500' : barCode.color === "'green'" ? 'bg-green-500' : 'bg-red-500'}`} />
                      <motion.div initial={{height:0}} animate={{height: 90}} className={`w-12 rounded-t-sm shadow-md ${barCode.color === "'blue'" ? 'bg-blue-400' : barCode.color === "'green'" ? 'bg-green-400' : 'bg-red-400'}`} />
                      <motion.div initial={{height:0}} animate={{height: 150}} className={`w-12 rounded-t-sm shadow-md ${barCode.color === "'blue'" ? 'bg-blue-600' : barCode.color === "'green'" ? 'bg-green-600' : 'bg-red-600'}`} />
                      <motion.div initial={{height:0}} animate={{height: 60}} className={`w-12 rounded-t-sm shadow-md ${barCode.color === "'blue'" ? 'bg-blue-300' : barCode.color === "'green'" ? 'bg-green-300' : 'bg-red-300'}`} />
                    </div>
                    <div className="flex justify-around mt-1 text-xs font-bold text-slate-500 uppercase">
                      <span>Mumbai</span><span>Delhi</span><span>Bangalore</span><span>Chennai</span>
                    </div>
                  </div>
                </div>
              )}

              {currentLevel === 4 && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-6 w-full max-w-lg">
                    <h2 className="text-lg font-black text-slate-800 text-center mb-4">Height vs Age</h2>
                    
                    <div className="h-48 border-b-2 border-l-2 border-slate-300 relative">
                      
                      {/* Scatter Points */}
                      {[
                        {x: 10, y: 20}, {x: 20, y: 35}, {x: 30, y: 40}, {x: 40, y: 55}, {x: 50, y: 65}, {x: 60, y: 70}, {x: 70, y: 85}, {x: 80, y: 90}
                      ].map((pt, i) => (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          style={{ left: pt.x + "%", bottom: pt.y + "%" }}
                          className="absolute -translate-x-1/2 translate-y-1/2 flex items-center justify-center"
                        >
                          {scatterCode.marker === "'o'" && <div className="bg-pink-500 rounded-full opacity-80" style={{ width: (parseInt(scatterCode.size)/5) + "px", height: (parseInt(scatterCode.size)/5) + "px" }} />}
                          {scatterCode.marker === "'s'" && <div className="bg-pink-500 opacity-80" style={{ width: (parseInt(scatterCode.size)/5) + "px", height: (parseInt(scatterCode.size)/5) + "px" }} />}
                          {scatterCode.marker === "'*'" && (
                            <svg className="text-pink-500 fill-current opacity-80" style={{ width: (parseInt(scatterCode.size)/4) + "px", height: (parseInt(scatterCode.size)/4) + "px" }} viewBox="0 0 24 24">
                              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                            </svg>
                          )}
                        </motion.div>
                      ))}

                    </div>
                    <div className="flex justify-between mt-1 text-xs font-bold text-slate-500 uppercase px-2">
                      <span>Age 10</span><span>Age 20</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
      
    </LabShell>
  );
}
