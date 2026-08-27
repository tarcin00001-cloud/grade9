"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Users, Unlock, Lock, Smartphone, Cpu, 
  Languages, MessageSquare, AlertTriangle, TrendingUp, Globe,
  Activity, Power, Server, Settings, Zap, ArrowRight, ToggleRight, ToggleLeft
} from "lucide-react";

export default function MobilePlatform37() {
  const { playClick, playSuccess, playError, playPop, playChime } = useLabAudio();

  const [level, setLevel] = useState(1);
  const [userBase, setUserBase] = useState(0);
  const [targetUserBase, setTargetUserBase] = useState(0);
  const [win, setWin] = useState(false);

  // Animate user base counter
  useEffect(() => {
    if (userBase < targetUserBase) {
      const diff = targetUserBase - userBase;
      const step = Math.max(Math.ceil(diff / 20), 10000); // chunk it
      const timer = setTimeout(() => {
        setUserBase(prev => Math.min(prev + step, targetUserBase));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [userBase, targetUserBase]);

  const advanceLevel = (userIncrease: number, currentLevel: number) => {
    if (playSuccess) playSuccess();
    setTargetUserBase(prev => prev + userIncrease);
    setTimeout(() => {
      if (currentLevel === 5) {
        if (playChime) playChime();
        setWin(true);
      } else {
        setLevel(currentLevel + 1);
      }
    }, 2000);
  };

  // --- Level 1 State: Wiring ---
  const [isOpenSource, setIsOpenSource] = useState(false);
  const [connectedNodes, setConnectedNodes] = useState<string[]>([]);
  
  const handleL1Connect = (node: string) => {
    if (!isOpenSource && connectedNodes.length >= 1) {
      if (playError) playError();
      return; // Closed system only allows 1
    }
    if (!connectedNodes.includes(node)) {
      if (playPop) playPop();
      const newNodes = [...connectedNodes, node];
      setConnectedNodes(newNodes);
      if (newNodes.length === 3) {
        advanceLevel(50000000, level);
      }
    }
  };

  // --- Level 2 State: Sliders ---
  const [cpu, setCpu] = useState(100);
  const [ram, setRam] = useState(100);
  const [anim, setAnim] = useState(100);
  const [l2Done, setL2Done] = useState(false);

  useEffect(() => {
    if (level === 2 && !l2Done) {
      if (cpu <= 30 && ram <= 30 && anim <= 30) {
        setL2Done(true);
        advanceLevel(450000000, level);
      }
    }
  }, [cpu, ram, anim, level, l2Done]);

  // --- Level 3 State: Toggles ---
  const [rtl, setRtl] = useState(false);
  const [unicode, setUnicode] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);

  const handleL3Region = (region: string) => {
    if (regions.includes(region)) return;
    
    if (region === 'Asia' && !unicode) {
      if (playError) playError(); return;
    }
    if (region === 'ME_Africa' && (!unicode || !rtl)) {
      if (playError) playError(); return;
    }

    if (playPop) playPop();
    const newRegions = [...regions, region];
    setRegions(newRegions);
    if (newRegions.length === 4) {
      advanceLevel(1000000000, level);
    }
  };

  // --- Level 4 State: Routing ---
  const [routeOpen, setRouteOpen] = useState(false);
  const [appsInOpen, setAppsInOpen] = useState(0);
  const [appsInClosed, setAppsInClosed] = useState(0);
  const [l4Done, setL4Done] = useState(false);

  useEffect(() => {
    if (level === 4 && !l4Done) {
      const interval = setInterval(() => {
        if (routeOpen) {
          if (playClick) playClick();
          setAppsInOpen(a => {
            const next = a + 1;
            if (next === 5) {
              setL4Done(true);
              advanceLevel(500000000, level);
            }
            return next;
          });
        } else {
          setAppsInClosed(a => a + 1);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [level, routeOpen, l4Done]);

  // --- Level 5 State: Sequence ---
  const [l5Btns, setL5Btns] = useState<number[]>([]);
  
  const handleL5Btn = (id: number) => {
    if (!l5Btns.includes(id)) {
      if (playPop) playPop();
      const newBtns = [...l5Btns, id];
      setL5Btns(newBtns);
      if (newBtns.length === 4) {
        advanceLevel(500000000, level);
      }
    }
  };

  const handleReset = () => {
    setWin(false); setLevel(1); setUserBase(0); setTargetUserBase(0); 
    setIsOpenSource(false); setConnectedNodes([]);
    setCpu(100); setRam(100); setAnim(100); setL2Done(false);
    setRtl(false); setUnicode(false); setRegions([]);
    setRouteOpen(false); setAppsInOpen(0); setAppsInClosed(0); setL4Done(false);
    setL5Btns([]);
  };

  return (
    <LabShell
      labId="mobileplatform37"
      title="Sundar Pichai & Mobile Platforms"
      instruction="1. Analyze the role of an OS Architect in scaling mobile platforms for a global audience. 2. Make strategic decisions regarding hardware compatibility, app ecosystems, and accessibility. 3. Monitor the adoption rates and user feedback across different simulated regions. 4. Adjust your strategy to successfully reach the goal of 3 billion active users."
      theme="cosmos"
      onReset={handleReset}
    >
      <Celebration 
        isActive={win} 
        onReplay={handleReset} 
        message="Global Scale Achieved! You engineered a platform for 2.5 Billion people." 
      />
      <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative shadow-sm">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col z-10 p-4 relative">
          
              {/* Header / Counter */}
              <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm mb-4 shrink-0">
                <div className="flex items-center gap-2 text-slate-600 mb-1 font-bold uppercase tracking-widest text-xs">
                  <Globe className="text-blue-500" size={16} />
                  <span>Global User Base</span>
                </div>
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 tabular-nums tracking-tighter drop-shadow-sm leading-none">
                  {userBase.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Goal: 2,500,000,000</div>
              </div>

              {/* Levels Container */}
              <div className="flex-1 w-full max-w-3xl mx-auto relative flex flex-col justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  
                  {/* Level 1: Wiring */}
                  {level === 1 && (
                    <motion.div key="l1" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-slate-800 mb-1">Phase 1: Open Ecosystem</h2>
                        <p className="text-slate-600 text-sm max-w-md mx-auto">Closed systems only connect to one hardware partner. Click the lock to open the core and connect all manufacturers!</p>
                      </div>

                      <div className="relative w-full max-w-md h-64 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                        {/* Core Node */}
                        <button 
                          onClick={() => { if(playPop) playPop(); setIsOpenSource(true); }}
                          className={`absolute z-20 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 transition-all ${isOpenSource ? 'bg-blue-50 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-slate-100 border-slate-300'}`}
                        >
                          {isOpenSource ? <Unlock size={32} className="text-blue-600" /> : <Lock size={32} className="text-slate-400" />}
                          <span className="text-xs font-bold text-slate-700 mt-1">{isOpenSource ? 'OPEN' : 'CLOSED'}</span>
                        </button>

                        {/* Peripheral Nodes */}
                        <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                          <button onClick={() => handleL1Connect('premium')} className={`pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${connectedNodes.includes('premium') ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                            <Smartphone size={24} />
                            <span className="text-[10px] font-bold mt-1">Premium Co.</span>
                          </button>
                          
                          <button onClick={() => handleL1Connect('standard')} className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${connectedNodes.includes('standard') ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                            <Smartphone size={24} />
                            <span className="text-[10px] font-bold mt-1">Standard Inc.</span>
                          </button>

                          <button onClick={() => handleL1Connect('budget')} className={`pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${connectedNodes.includes('budget') ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                            <Smartphone size={24} />
                            <span className="text-[10px] font-bold mt-1">Budget Ltd.</span>
                          </button>
                        </div>
                        
                        {/* Wires (Visual Only) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                          <line x1="15%" y1="50%" x2="50%" y2="50%" stroke={connectedNodes.includes('premium') ? '#10b981' : '#cbd5e1'} strokeWidth="4" strokeDasharray={connectedNodes.includes('premium') ? "0" : "5,5"} />
                          <line x1="50%" y1="15%" x2="50%" y2="50%" stroke={connectedNodes.includes('standard') ? '#10b981' : '#cbd5e1'} strokeWidth="4" strokeDasharray={connectedNodes.includes('standard') ? "0" : "5,5"} />
                          <line x1="85%" y1="50%" x2="50%" y2="50%" stroke={connectedNodes.includes('budget') ? '#10b981' : '#cbd5e1'} strokeWidth="4" strokeDasharray={connectedNodes.includes('budget') ? "0" : "5,5"} />
                        </svg>
                      </div>
                    </motion.div>
                  )}

                  {/* Level 2: Sliders */}
                  {level === 2 && (
                    <motion.div key="l2" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-slate-800 mb-1">Phase 2: Hardware Optimization</h2>
                        <p className="text-slate-600 text-sm max-w-md mx-auto">The OS is overheating a $50 budget phone! Slide the resource usage down to the green zone to make it compatible.</p>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        {/* Phone Visual */}
                        <div className="relative flex flex-col items-center justify-center w-32 h-48 bg-slate-100 border-4 border-slate-200 rounded-xl">
                          <div className={`text-4xl ${cpu+ram+anim > 150 ? 'animate-bounce text-red-500' : cpu+ram+anim > 90 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {cpu+ram+anim > 150 ? '🔥' : cpu+ram+anim > 90 ? '⚠️' : '✅'}
                          </div>
                          <span className="text-xs font-bold text-slate-700 mt-2">$50 Phone</span>
                        </div>

                        {/* Sliders */}
                        <div className="flex-1 flex flex-col gap-4 w-full">
                          {[
                            {label: 'Memory Footprint', val: ram, set: setRam},
                            {label: 'CPU Usage', val: cpu, set: setCpu},
                            {label: 'Animation Quality', val: anim, set: setAnim},
                          ].map(s => (
                            <div key={s.label} className="flex flex-col gap-1">
                              <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span>{s.label}</span>
                                <span className={s.val <= 30 ? 'text-emerald-600' : 'text-red-600'}>{s.val}%</span>
                              </div>
                              <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                {/* Green target zone */}
                                <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-emerald-100 border-r-2 border-emerald-400" />
                                <input 
                                  type="range" min="0" max="100" value={s.val} 
                                  onChange={(e) => { if(playClick) playClick(); s.set(parseInt(e.target.value)); }}
                                  className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`h-full pointer-events-none ${s.val <= 30 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{width: `${s.val}%`}} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Level 3: Toggles & Grid */}
                  {level === 3 && (
                    <motion.div key="l3" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-slate-800 mb-1">Phase 3: Localization Engine</h2>
                        <p className="text-slate-600 text-sm max-w-md mx-auto">Enable system-wide Unicode and Right-to-Left (RTL) rendering to unlock global markets, then deploy to all regions.</p>
                      </div>

                      <div className="flex flex-col gap-6 w-full max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        {/* Switches */}
                        <div className="flex justify-center gap-8 border-b border-slate-200 pb-6">
                          <button onClick={() => {if(playClick) playClick(); setUnicode(!unicode)}} className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                            {unicode ? <ToggleRight size={32} className="text-purple-600" /> : <ToggleLeft size={32} className="text-slate-400" />}
                            Unicode Fonts
                          </button>
                          <button onClick={() => {if(playClick) playClick(); setRtl(!rtl)}} className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                            {rtl ? <ToggleRight size={32} className="text-purple-600" /> : <ToggleLeft size={32} className="text-slate-400" />}
                            RTL Rendering
                          </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {id: 'Americas', label: 'Americas (EN/ES)'},
                            {id: 'Europe', label: 'Europe (EN/FR/DE)'},
                            {id: 'Asia', label: 'Asia (Requires Unicode)'},
                            {id: 'ME_Africa', label: 'Mid-East (Req Unicode+RTL)'},
                          ].map(r => (
                            <button 
                              key={r.id}
                              onClick={() => handleL3Region(r.id)}
                              className={`p-4 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all ${regions.includes(r.id) ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                              <Globe size={18} className="mr-2" /> {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Level 4: Routing */}
                  {level === 4 && (
                    <motion.div key="l4" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-slate-800 mb-1">Phase 4: Developer Ecosystem</h2>
                        <p className="text-slate-600 text-sm max-w-md mx-auto">Toggle the route switch to direct third-party developers into the Open Market instead of the restrictive Walled Garden. Route 5 apps to proceed!</p>
                      </div>

                      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center">
                        
                        {/* Conveyor / Flow */}
                        <div className="w-full flex items-center justify-between px-8 mb-8 relative">
                          <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-slate-700 font-bold flex items-center gap-2">
                            <Server size={20} className="text-slate-500" /> Developers
                          </div>
                          
                          {/* Route Line */}
                          <div className="flex-1 h-2 bg-slate-100 mx-4 relative overflow-hidden rounded-full">
                            <motion.div animate={{x: ['-100%', '300%']}} transition={{repeat: Infinity, duration: 1, ease: 'linear'}} className="absolute top-0 bottom-0 w-16 bg-blue-400 shadow-sm" />
                          </div>

                          {/* Switch Button */}
                          <button 
                            onClick={() => {if(playPop)playPop(); setRouteOpen(!routeOpen)}}
                            className={`p-4 rounded-full border-4 font-black z-20 transition-all ${routeOpen ? 'bg-blue-100 border-blue-400 shadow-sm' : 'bg-slate-100 border-slate-300'}`}
                          >
                            <Settings className={`transition-transform ${routeOpen ? 'text-blue-600 rotate-90' : 'text-slate-500 rotate-0'}`} />
                          </button>
                        </div>

                        {/* Destinations */}
                        <div className="w-full flex justify-between px-8">
                          <div className={`p-4 rounded-xl border-2 text-center w-40 transition-colors ${!routeOpen ? 'bg-red-50 border-red-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                            <Lock className={!routeOpen ? "text-red-500 mx-auto mb-2" : "text-slate-400 mx-auto mb-2"} />
                            <div className="text-xs font-bold text-slate-700">Walled Garden</div>
                            <div className="text-2xl font-black text-red-500">{appsInClosed}</div>
                          </div>
                          
                          <div className={`p-4 rounded-xl border-2 text-center w-40 transition-colors ${routeOpen ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                            <Unlock className={routeOpen ? "text-emerald-500 mx-auto mb-2" : "text-slate-400 mx-auto mb-2"} />
                            <div className="text-xs font-bold text-slate-700">Open Market</div>
                            <div className="text-2xl font-black text-emerald-500">{appsInOpen}/5</div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {/* Level 5: Sequence */}
                  {level === 5 && (
                    <motion.div key="l5" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-slate-800 mb-1">Phase 5: Global Initialization</h2>
                        <p className="text-slate-600 text-sm max-w-md mx-auto">The platform is ready. Engage all core systems to launch to 2.5 Billion users!</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
                        {[
                          {id: 1, label: 'Open Source Engine', icon: Unlock, color: 'blue'},
                          {id: 2, label: 'Hardware Scalability', icon: Cpu, color: 'emerald'},
                          {id: 3, label: 'Mass Localization', icon: Languages, color: 'purple'},
                          {id: 4, label: 'Ecosystem Router', icon: Server, color: 'amber'},
                        ].map(btn => {
                          const active = l5Btns.includes(btn.id);
                          const colorClasses = {
                            blue: 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm',
                            emerald: 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm',
                            purple: 'bg-purple-50 border-purple-400 text-purple-700 shadow-sm',
                            amber: 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm'
                          }[btn.color];

                          const textClass = {
                            blue: 'text-blue-600',
                            emerald: 'text-emerald-600',
                            purple: 'text-purple-600',
                            amber: 'text-amber-600'
                          }[btn.color];

                          return (
                            <button 
                              key={btn.id}
                              onClick={() => handleL5Btn(btn.id)}
                              className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${active ? colorClasses : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              <btn.icon size={32} className={active ? `${textClass} animate-pulse` : 'text-slate-400'} />
                              <span className="font-bold text-sm text-center">{btn.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

        </div>
      </div>
    </LabShell>
  );
}
