"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useAnimationFrame, useMotionTemplate, useMotionValueEvent } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  ShieldAlert, Cpu, Eye, CheckCircle2, Crosshair, 
  ArrowRight, MousePointer2, Settings2, AlertTriangle, Zap, ActivitySquare
} from "lucide-react";

const LEVELS = [
  { 
    id: 1, 
    title: "Traditional Surgery", 
    desc: "Drag the scalpel to the tumor. Human hands naturally have micro-tremors, making precision difficult.", 
    robotAllowed: false, 
    visionAllowed: false, 
    trackWidth: 100, 
    curveFreq: 0.5,
    curveAmp: 0.15,
    dark: false,
    tremorScale: 1
  },
  { 
    id: 2, 
    title: "The da Vinci Advantage", 
    desc: "The path is narrower! Activate Robotic Assistance to enable Tremor Elimination.", 
    robotAllowed: true, 
    visionAllowed: false, 
    trackWidth: 50, 
    curveFreq: 1,
    curveAmp: 0.2,
    dark: false,
    tremorScale: 1.2
  },
  { 
    id: 3, 
    title: "Into the Dark", 
    desc: "Tissue obscures the view. Activate 3D Enhanced Vision to illuminate the surgical site.", 
    robotAllowed: true, 
    visionAllowed: true, 
    trackWidth: 50, 
    curveFreq: 1,
    curveAmp: 0.2,
    dark: true,
    tremorScale: 1.8 
  },
  { 
    id: 4, 
    title: "Minimally Invasive", 
    desc: "A tiny incision means a microscopic path. Use both tremor elimination and enhanced vision.", 
    robotAllowed: true, 
    visionAllowed: true, 
    trackWidth: 32, 
    curveFreq: 1.2,
    curveAmp: 0.22,
    dark: false,
    tremorScale: 2.2 
  },
  { 
    id: 5, 
    title: "Remote Expert Operation", 
    desc: "Navigate the complex, curved anatomy to remove the final tumor.", 
    robotAllowed: true, 
    visionAllowed: true, 
    trackWidth: 32, 
    curveFreq: 1.8,
    curveAmp: 0.28,
    dark: false,
    tremorScale: 2.8 
  },
];

type ModalState = 'none' | 'level1_fail' | 'fail' | 'level_complete' | 'success' | 'quiz';

export default function RoboticSurgery46() {
  const { playClick, playPop, playSuccess, playError, playZap, playHeavyThud } = useLabAudio();
  const { reportComplete } = useLMSBridge();

  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];

  const [robotActive, setRobotActive] = useState(false);
  const [visionEnhanced, setVisionEnhanced] = useState(false);
  const [damage, setDamage] = useState(0);
  const [modalState, setModalState] = useState<ModalState>('none');
  const [hasStarted, setHasStarted] = useState(false);
  
  const [quizAns, setQuizAns] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ w: 0, h: 0 });

  const x = useMotionValue(20);
  const y = useMotionValue(0);

  const currentTrackWidth = level.trackWidth + (visionEnhanced ? 46 : 0);
  const tScale = level.tremorScale || 1;

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setBounds({ w: width, h: height });
      if (modalState === 'none') {
         x.set(20);
         y.set(height / 2);
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [modalState, x, y]);

  const getTrackY = (cx: number, w: number, h: number, lvl: typeof LEVELS[0]) => {
    if (h === 0 || w === 0) return 0;
    const normalizedX = cx / w;
    return h / 2 + Math.sin(normalizedX * Math.PI * 2 * lvl.curveFreq) * (h * lvl.curveAmp);
  };

  const resetLevel = () => {
    x.set(20);
    y.set(getTrackY(20, bounds.w, bounds.h, level));
    setDamage(0);
    setHasStarted(false);
    
    if (!level.robotAllowed) setRobotActive(false);
    if (!level.visionAllowed) setVisionEnhanced(false);
  };

  useEffect(() => {
    resetLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, bounds.w, bounds.h]);

  useMotionValueEvent(x, "change", (latest) => {
      if (latest > 40 && !hasStarted) setHasStarted(true);
  });

  const lastErrorTime = useRef(0);

  useAnimationFrame(() => {
    if (bounds.w === 0 || modalState !== 'none' || !hasStarted) return;
    
    const cx = x.get();
    let cy = y.get();
    
    if (!robotActive) {
      const time = Date.now();
      const highFreqY = Math.sin(time / 25) * (15 * tScale);
      const randomSpike = (Math.random() - 0.5) * (20 * tScale);
      cy += (highFreqY + randomSpike);
    }
    
    const ty = getTrackY(cx, bounds.w, bounds.h, level);
    const dist = Math.abs(cy - ty);
    
    if (dist > currentTrackWidth / 2) {
      setDamage(prev => {
        const next = prev + 1.2;
        if (next >= 100) {
          playHeavyThud();
          if (levelIndex === 0) setModalState('level1_fail');
          else setModalState('fail');
        }
        return Math.min(next, 100);
      });
      
      const now = Date.now();
      if (now - lastErrorTime.current > 250) {
          playError();
          lastErrorTime.current = now;
      }
    }
    
    if (cx >= bounds.w - 50) {
      playSuccess();
      if (levelIndex === LEVELS.length - 1) {
        setModalState('success');
      } else {
        setModalState('level_complete');
      }
    }
  });

  const trackPoints = [];
  if (bounds.w > 0) {
    for (let px = 0; px <= bounds.w; px += 5) {
      trackPoints.push(`${px},${getTrackY(px, bounds.w, bounds.h, level)}`);
    }
  }
  const trackPath = trackPoints.join(" ");
  const bgGradient = useMotionTemplate`radial-gradient(circle ${visionEnhanced ? '1500px' : '90px'} at ${x}px ${y}px, transparent 0%, rgba(2,6,23,0.98) 100%)`;

  const handleQuizSubmit = () => {
      setQuizSubmitted(true);
      if (quizAns === 1) {
          playSuccess();
          setTimeout(() => {
              setModalState('none');
              reportComplete();
          }, 3000);
      } else {
          playError();
      }
  };

  const isCompleted = quizSubmitted && quizAns === 1;
  const isRobotHint = level.robotAllowed && !robotActive && hasStarted;

  // EKG colors based on damage
  const ekgColor = damage > 70 ? "#E11D48" : damage > 40 ? "#F59E0B" : "#10B981";

  return (
    <LabShell 
      labId="roboticsurgery46" 
      title="Robotics in Surgical Assistance"
      instruction="Navigate the surgical scalpel through the anatomical pathways. Learn how robotic assistance eliminates human tremor and provides 3D enhanced vision to improve patient outcomes."
      bgOverride="bg-slate-50"
      onReset={() => {
        setLevelIndex(0);
        setModalState('none');
        setQuizAns(null);
        setQuizSubmitted(false);
        setDamage(0);
        setHasStarted(false);
        setRobotActive(false);
        setVisionEnhanced(false);
        if (bounds.w > 0) {
          x.set(20);
          y.set(bounds.h / 2);
        }
      }}
    >
      {isCompleted && <Celebration isActive={true} />}

      <div className="flex-1 w-full flex flex-col min-h-0 max-w-6xl mx-auto p-2 lg:p-4 gap-4">
        
        {/* Step Indicator */}
        <div className="w-full flex items-center justify-center gap-2 lg:gap-4 shrink-0 px-2 overflow-x-auto">
          {LEVELS.map((lvl, idx) => (
            <div key={lvl.id} className="flex items-center gap-2 lg:gap-4 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                levelIndex === idx ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-md' :
                levelIndex > idx ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' :
                'bg-slate-200 border-slate-300 text-slate-500'
              }`}>
                {levelIndex > idx ? <CheckCircle2 size={16} /> : lvl.id}
              </div>
              {idx < LEVELS.length - 1 && <div className="w-4 lg:w-8 h-0.5 bg-slate-300 rounded-full" />}
            </div>
          ))}
        </div>

        {/* Main Content Area - Surgeon's Console Vibe */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 w-full">
          
          {/* Left: Surgical Viewfinder */}
          <div className="flex-1 flex flex-col bg-[#0f172a] shadow-[0_10px_30px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden min-h-0 relative border-[6px] border-slate-800">
             
             {/* Header */}
             <div className="p-3 lg:p-4 bg-slate-900 shrink-0 flex items-center justify-between border-b border-slate-950 shadow-md z-20">
               <div>
                 <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                   <ActivitySquare className="text-[#2563EB]" size={20} />
                   STAGE {level.id}: {level.title}
                 </h3>
                 <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{level.desc}</p>
               </div>
             </div>

             {/* Interactive SVG / Canvas - MEDICAL CAMERA FEED STYLE */}
             <div ref={containerRef} className="flex-1 relative bg-[#1c0511] overflow-hidden touch-none shadow-inner" style={{ touchAction: "none" }}>
                
                {bounds.w > 0 && (
                  <>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-90 transition-all duration-700">
                       <rect width="100%" height="100%" fill="#1a0410" />
                       
                       {/* Floating cellular particles background */}
                       <circle cx="10%" cy="20%" r="4" fill="#be123c" opacity="0.2" className="animate-pulse" />
                       <circle cx="80%" cy="80%" r="6" fill="#be123c" opacity="0.1" />
                       <circle cx="40%" cy="60%" r="3" fill="#be123c" opacity="0.3" />
                       
                       <polyline points={trackPath} fill="none" stroke="#701a39" strokeWidth={currentTrackWidth + 16} strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-in-out" />
                       <polyline points={trackPath} fill="none" stroke="#be123c" strokeWidth={currentTrackWidth} strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-in-out" />
                       <polyline points={trackPath} fill="none" stroke="#f43f5e" strokeWidth={Math.max(2, currentTrackWidth - 20)} strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-in-out" />
                       
                       <polyline points={trackPath} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 6" opacity={visionEnhanced ? 0.8 : 0.3} className="transition-all duration-700 ease-in-out" />
                       
                       <g transform={`translate(${bounds.w - 40}, ${getTrackY(bounds.w - 40, bounds.w, bounds.h, level)})`}>
                          <circle r={visionEnhanced ? "28" : "22"} fill="#064e3b" stroke="#059669" strokeWidth="2" className="animate-pulse transition-all duration-700" />
                          <circle r="12" fill="#022c22" />
                          <path d="M -5 -5 L 5 5 M -5 5 L 5 -5" stroke="#10b981" strokeWidth="2" opacity="0.5" />
                       </g>
                    </svg>
                    
                    {level.dark && (
                      <motion.div className="absolute inset-0 pointer-events-none z-10" style={{ background: bgGradient }} />
                    )}

                    {/* NEW: Camera Viewfinder Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_120px_rgba(0,0,0,0.8)] border-[4px] border-[#020617]/50 rounded-xl overflow-hidden flex flex-col justify-between p-4 lg:p-8">
                      <div className="flex justify-between items-start opacity-70">
                        <div className="text-red-500 font-bold text-xs lg:text-sm flex items-center gap-2 animate-pulse tracking-widest"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"/> REC</div>
                        <div className="text-white font-mono text-[10px] lg:text-xs">CAM_01 // ENDOSCOPIC</div>
                      </div>
                      <div className="flex justify-between items-end opacity-20">
                        <div className="w-8 h-8 lg:w-12 lg:h-12 border-l-2 border-b-2 border-white"/>
                        <div className="w-8 h-8 lg:w-12 lg:h-12 border-r-2 border-b-2 border-white"/>
                      </div>
                      <div className="absolute top-4 right-4 lg:top-8 lg:right-8 flex justify-between items-start opacity-20">
                         <div className="w-8 h-8 lg:w-12 lg:h-12 border-r-2 border-t-2 border-white"/>
                      </div>
                      <div className="absolute top-4 left-4 lg:top-8 lg:left-8 flex justify-between items-start opacity-20">
                         <div className="w-8 h-8 lg:w-12 lg:h-12 border-l-2 border-t-2 border-white"/>
                      </div>
                    </div>

                    <motion.div
                       drag
                       dragConstraints={{ left: 20, right: bounds.w - 20, top: 20, bottom: bounds.h - 20 }}
                       dragElastic={0}
                       dragMomentum={false}
                       style={{ x, y }}
                       onPointerDown={() => {
                          playPop();
                          if (!hasStarted) setHasStarted(true);
                       }}
                       className="absolute z-30 w-16 h-16 -ml-8 -mt-8 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
                    >
                       <AnimatePresence>
                         {modalState === 'none' && (
                           <motion.div
                             initial={{ opacity: 0, y: 10, scale: 0.9 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             className={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 font-bold text-[10px] lg:text-xs uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border backdrop-blur whitespace-nowrap ${
                                !hasStarted ? 'bg-slate-900/80 border-slate-700 text-white' :
                                robotActive ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-400' :
                                'bg-amber-900/90 border-amber-500/50 text-amber-400'
                             }`}
                           >
                             {!hasStarted ? <><MousePointer2 size={14}/> Guide Scalpel</> :
                              robotActive ? <><CheckCircle2 size={14}/> Guidance Active</> :
                              <><AlertTriangle size={14} className={level.robotAllowed ? "animate-pulse" : ""}/> {level.robotAllowed ? "Robotics Available" : "Tremor Detected"}</>}
                           </motion.div>
                         )}
                       </AnimatePresence>

                       <motion.div 
                           animate={robotActive ? { x: 0, y: 0 } : { 
                               x: [0, -8 * tScale, 6 * tScale, -10 * tScale, 9 * tScale, -7 * tScale, 0], 
                               y: [0, 12 * tScale, -14 * tScale, 11 * tScale, -13 * tScale, 8 * tScale, 0] 
                           }}
                           transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }}
                           className={`rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                             robotActive ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' : 'bg-[#2563EB]/40 border-[#3b82f6] text-[#60a5fa]'
                           } ${visionEnhanced ? 'w-8 h-8' : 'w-6 h-6'}`}
                       >
                          <Crosshair className={visionEnhanced ? "w-5 h-5" : "w-4 h-4"} />
                       </motion.div>
                    </motion.div>
                  </>
                )}
             </div>
          </div>
          
          {/* Right: The Hardware Console Panel */}
          <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 min-h-0 bg-slate-200 p-4 rounded-2xl border-4 border-slate-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
             
             {/* NEW EKG Monitor Card */}
             <div className="bg-[#020617] border-2 border-slate-700 rounded-xl p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.9),_0_5px_15px_rgba(0,0,0,0.1)] relative overflow-hidden">
                
                {/* Subtle Monitor Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#10B981 1px, transparent 1px), linear-gradient(90deg, #10B981 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                
                <div className="relative z-10 flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-[10px] font-mono text-slate-400 tracking-widest flex items-center gap-1.5 uppercase mb-1">
                      <Zap size={12} className={damage > 0 ? "text-[#F59E0B]" : "text-slate-500"} /> System Trauma
                    </h3>
                    <div className={`text-3xl font-black font-mono leading-none ${damage > 70 ? 'text-[#E11D48] animate-pulse drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : damage > 40 ? 'text-[#F59E0B] drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}>
                      {Math.floor(damage)}<span className="text-sm opacity-50">%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-mono text-slate-500 mb-0.5">STATUS</div>
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${damage > 70 ? 'bg-rose-950/50 text-rose-500 border-rose-800' : 'bg-emerald-950/50 text-emerald-500 border-emerald-800'}`}>
                      {damage > 70 ? 'CRITICAL' : 'STABLE'}
                    </div>
                  </div>
                </div>

                {/* Animated EKG Wave SVG */}
                <div className="h-12 w-full border-b border-emerald-900/50 relative flex items-center overflow-hidden bg-slate-900/30 rounded-lg">
                   <svg className="w-[200%] h-full absolute left-0" viewBox="0 0 200 40" preserveAspectRatio="none">
                      <motion.path 
                         d={damage > 70 
                            ? "M0,20 L15,20 L20,5 L25,35 L30,20 L100,20 L115,20 L120,5 L125,35 L130,20 L200,20" 
                            : "M0,20 L40,20 L45,10 L50,30 L55,20 L100,20 L140,20 L145,10 L150,30 L155,20 L200,20"}
                         fill="none" 
                         stroke={ekgColor}
                         strokeWidth="2.5"
                         style={{ filter: `drop-shadow(0 0 4px ${ekgColor})` }}
                         animate={{ x: ["0%", "-50%"] }}
                         transition={{ duration: damage > 70 ? 0.3 : 1.2, repeat: Infinity, ease: "linear" }}
                      />
                   </svg>
                </div>
             </div>

             {/* Hardware Controls Panel */}
             <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-300 p-4 relative">
                <h3 className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">
                  <Settings2 size={14} /> System Override Modules
                </h3>
                
                <div className="grid grid-cols-2 gap-3 flex-1">
                  
                  {/* Tactile Robot Button */}
                  <button 
                    onClick={() => {
                      if(level.robotAllowed) {
                        setRobotActive(!robotActive);
                        playClick();
                      }
                    }}
                    disabled={!level.robotAllowed}
                    className={`relative p-3 rounded-xl border-b-4 transition-all duration-150 flex flex-col items-center justify-center gap-2 ${
                      !level.robotAllowed ? 'bg-slate-100 border-slate-200 opacity-50 grayscale cursor-not-allowed' :
                      robotActive ? 'bg-slate-800 border-slate-950 text-white translate-y-1 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)]' : 
                      isRobotHint ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse' :
                      'bg-slate-50 border-slate-300 hover:bg-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {/* LED Indicator */}
                    <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${robotActive ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-slate-300 shadow-inner'}`} />
                    
                    <Cpu size={28} className={robotActive ? 'text-[#10B981] drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'opacity-70'} />
                    <span className="font-bold text-[9px] uppercase tracking-widest text-center leading-tight mt-1 opacity-80">Robotic<br/>Assist</span>
                  </button>

                  {/* Tactile Vision Button */}
                  <button 
                    onClick={() => {
                      if(level.visionAllowed) {
                        setVisionEnhanced(!visionEnhanced);
                        playClick();
                      }
                    }}
                    disabled={!level.visionAllowed}
                    className={`relative p-3 rounded-xl border-b-4 transition-all duration-150 flex flex-col items-center justify-center gap-2 ${
                      !level.visionAllowed ? 'bg-slate-100 border-slate-200 opacity-50 grayscale cursor-not-allowed' :
                      visionEnhanced ? 'bg-slate-800 border-slate-950 text-white translate-y-1 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)]' : 
                      'bg-slate-50 border-slate-300 hover:bg-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {/* LED Indicator */}
                    <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${visionEnhanced ? 'bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]' : 'bg-slate-300 shadow-inner'}`} />
                    
                    <Eye size={28} className={visionEnhanced ? 'text-[#3B82F6] drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'opacity-70'} />
                    <span className="font-bold text-[9px] uppercase tracking-widest text-center leading-tight mt-1 opacity-80">3D Vision<br/>Enhancer</span>
                  </button>

                </div>

                {/* Sub-status text */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-medium leading-tight text-center">
                  Physical modules required to stabilize human neuro-muscular jitter and illuminate obscured anatomical pathways.
                </div>
             </div>

          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {modalState !== 'none' && !isCompleted && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-center flex flex-col items-center"
              >
                {modalState === 'level1_fail' && (
                  <>
                    <div className="bg-rose-100 p-4 rounded-full text-rose-600 mb-4"><ShieldAlert size={32} /></div>
                    <h2 className="text-xl lg:text-2xl font-black text-[#123B5D] mb-2 uppercase tracking-tight">Procedure Aborted</h2>
                    <p className="text-slate-600 font-medium mb-6 text-sm">
                      Human hands naturally exhibit micro-tremors which cause tissue damage in highly precise pathways. You need technological assistance!
                    </p>
                    <button 
                      onClick={() => {
                        setModalState('none');
                        setLevelIndex(1);
                        playZap();
                      }}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      Unlock Robotic Assistance <ArrowRight size={18} />
                    </button>
                  </>
                )}

                {modalState === 'fail' && (
                  <>
                    <div className="bg-rose-100 p-4 rounded-full text-rose-600 mb-4"><AlertTriangle size={32} /></div>
                    <h2 className="text-xl lg:text-2xl font-black text-[#123B5D] mb-2 uppercase tracking-tight">Critical Tissue Damage</h2>
                    <p className="text-slate-600 font-medium mb-6 text-sm">
                      The scalpel strayed too far from the safe pathway. Ensure your robotic tools are enabled to maximize precision!
                    </p>
                    <button 
                      onClick={() => {
                        setModalState('none');
                        resetLevel();
                      }}
                      className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      Retry Procedure
                    </button>
                  </>
                )}

                {modalState === 'level_complete' && (
                  <>
                    <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-4"><CheckCircle2 size={32} /></div>
                    <h2 className="text-xl lg:text-2xl font-black text-[#123B5D] mb-2 uppercase tracking-tight">Incision Successful</h2>
                    <p className="text-slate-600 font-medium mb-6 text-sm">
                      Excellent precision. Let's advance to the next phase of the operation.
                    </p>
                    <button 
                      onClick={() => {
                        setModalState('none');
                        setLevelIndex(prev => prev + 1);
                        playZap();
                      }}
                      className="w-full py-3.5 bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  </>
                )}

                {modalState === 'success' && (
                  <>
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4"><CheckCircle2 size={32} /></div>
                    <h2 className="text-xl lg:text-2xl font-black text-[#123B5D] mb-2 uppercase tracking-tight">Surgery Complete!</h2>
                    <p className="text-slate-600 font-medium mb-6 text-sm">
                      You successfully navigated complex anatomies! You experienced firsthand how tremor elimination and 3D visualization amplify human skill.
                    </p>
                    <button 
                      onClick={() => {
                        setModalState('quiz');
                        playPop();
                      }}
                      className="w-full py-3.5 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      Continue to Assessment <ArrowRight size={18} />
                    </button>
                  </>
                )}

                {modalState === 'quiz' && (
                  <>
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4"><ActivitySquare size={32} /></div>
                    <h2 className="text-xl lg:text-2xl font-black text-[#123B5D] mb-2 uppercase tracking-tight">Knowledge Check</h2>
                    <p className="text-[#123B5D] font-medium mb-6 text-sm">
                      Based on this simulation, what is the primary advantage of robotic assistance in minimally invasive surgery?
                    </p>
                    
                    <div className="flex flex-col gap-3 w-full text-left">
                        {[
                            "A) It allows surgeons to operate without looking at the patient.",
                            "B) It eliminates micro-tremors and provides enhanced visualization for microscopic precision.",
                            "C) It completely replaces the human surgeon with artificial intelligence."
                        ].map((opt, i) => (
                            <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                quizAns === i ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}>
                                <input 
                                    type="radio" 
                                    name="assessment" 
                                    checked={quizAns === i} 
                                    onChange={() => setQuizAns(i)} 
                                    disabled={quizSubmitted} 
                                    className="w-4 h-4 text-[#2563EB]"
                                />
                                <span className="text-[#123B5D] text-sm font-medium leading-tight">{opt}</span>
                            </label>
                        ))}

                        <AnimatePresence>
                            {quizSubmitted ? (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    className="mt-2 text-sm p-4 rounded-xl border bg-slate-50 border-slate-200"
                                >
                                    {quizAns === 1 ? (
                                        <div>
                                            <span className="font-black text-[#10B981] uppercase flex items-center gap-1"><CheckCircle2 size={16}/> Correct!</span> 
                                            <span className="text-slate-600 block mt-1">Robots don't operate on their own; they translate the surgeon's hand movements flawlessly, filtering out tremors and scaling down motion for incredible precision.</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="font-black text-[#E11D48] uppercase flex items-center gap-1"><ShieldAlert size={16}/> Incorrect</span> 
                                            <span className="text-slate-600 block mt-1">Robots don't operate on their own; they translate the surgeon's hand movements flawlessly, filtering out tremors and scaling down motion for incredible precision.</span>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <button 
                                    onClick={handleQuizSubmit} 
                                    disabled={quizAns === null} 
                                    className={`mt-2 w-full font-bold py-3.5 rounded-xl transition-colors ${
                                        quizAns !== null ? 'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}>
                                    Submit Answer
                                </button>
                            )}
                        </AnimatePresence>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LabShell>
  );
}
