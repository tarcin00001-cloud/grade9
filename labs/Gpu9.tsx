"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  PenTool, PaintRoller, AlertTriangle, CheckCircle2, Zap, ArrowDownToLine, 
  Activity, Cpu, MousePointer2, CloudLightning, BrainCircuit, Gamepad2, Sun,
  Database
} from "lucide-react";

const MAZE_PATH = [11, 12, 13, 23, 33, 43, 44, 45, 55, 65, 75, 76, 77, 78, 88];

const LEVELS = [
  { id: 1, title: "MISSION 1: PAINT THE SKY", task: "We need a massive blue sky for our background. Pick the tool that can paint a huge area instantly!", type: "fill" },
  { id: 2, title: "MISSION 2: THE TRICKY MAZE", task: "Carefully trace the red path through the maze. Pick a tool that can make sharp turns and decisions.", type: "maze" },
  { id: 3, title: "MISSION 3: THE VIDEO GAME", task: "Games need teamwork! Drop the Precision Pens onto the 'Player Gravity' logic, and the Massive Stamp onto the 'Explosion Sparks'.", type: "split" },
  { id: 4, title: "MISSION 4: THE GIANT POSTER", task: "Stamp a giant poster! But wait, our standard paint bucket is too small. You might need an upgrade first.", type: "bandwidth" },
  { id: 5, title: "MISSION 5: REALISTIC LIGHTING", task: "The client wants realistic light bouncing off a mirror. Our normal Stamp isn't smart enough for light physics!", type: "raytrace" },
  { id: 6, title: "MISSION 6: TRAINING AN AI BRAIN", task: "Train a new AI! This requires solving a massive grid of simple math problems (a matrix) all at the same time.", type: "ai" },
  { id: 7, title: "MISSION 7: WEATHER SIMULATION", task: "Predict tomorrow's hurricane! We need to simulate a million wind particles at once.", type: "weather" }
];

export default function Gpu9() {
  const { reportComplete } = useLMSBridge("gpu9");
  const { playPop, playZap, playSuccess, playError, playChime, playHeavyThud, playClick } = useLabAudio();

  const [levelIdx, setLevelIdx] = useState(0);
  const level = LEVELS[levelIdx];

  const [canvasState, setCanvasState] = useState<"blank" | "drawing_cpu" | "drawing_gpu" | "stutter_gpu" | "success" | "ruined">("blank");
  const [pixels, setPixels] = useState<string[]>(Array(100).fill("blank"));
  
  const [hasUpgrade, setHasUpgrade] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{text: string, type: "error"|"success"} | null>(null);
  
  // For Level 3 (Split)
  const [splitState, setSplitState] = useState({ logic: false, graphics: false });
  const [hasWon, setHasWon] = useState(false);

  // --- EXECUTION ENGINE ---
  useEffect(() => {
    if (canvasState === "drawing_cpu") {
      if (level.type === "fill" || level.type === "ai" || level.type === "weather" || level.type === "bandwidth" || level.type === "raytrace") {
        setFeedbackMsg({ text: "The Precision Pens are fast, but doing this one-by-one takes too long! (CPU Bottleneck)", type: "error" });
        let step = 0;
        const interval = setInterval(() => {
          setPixels(prev => { const next = [...prev]; for(let i=0; i<4; i++) if (step*4+i < 100) next[step*4+i] = "blue"; return next; });
          playPop(); step++;
          if (step >= 15) { clearInterval(interval); setCanvasState("ruined"); playError(); }
        }, 150);
        return () => clearInterval(interval);
      } 
      else if (level.type === "maze") {
        setFeedbackMsg({ text: "Perfect! The Precision Pens easily followed the complex path. CPUs are great at tricky logic!", type: "success" });
        let step = 0;
        const interval = setInterval(() => {
          setPixels(prev => { const next = [...prev]; if (step < MAZE_PATH.length) next[MAZE_PATH[step]] = "red"; return next; });
          if (step % 2 === 0) playPop(); step++;
          if (step >= MAZE_PATH.length) { clearInterval(interval); setCanvasState("success"); playSuccess(); setTimeout(nextLevel, 2500); }
        }, 150);
        return () => clearInterval(interval);
      }
    }
    
    if (canvasState === "drawing_gpu") {
      if (level.type === "fill" || level.type === "ai" || level.type === "weather") {
        if (level.type === "ai") setFeedbackMsg({ text: "Wow! Because AI relies on massive matrix math, GPUs are the secret engine behind modern AI!", type: "success" });
        else if (level.type === "weather") setFeedbackMsg({ text: "Incredible! Scientists use GPUs to simulate millions of weather particles at once.", type: "success" });
        else setFeedbackMsg({ text: "Wow! The massive Stamp colored everything at once. This is Parallel Processing!", type: "success" });
        
        setTimeout(() => {
          setPixels(Array(100).fill("green"));
          playZap(); playHeavyThud(); setCanvasState("success");
          setTimeout(nextLevel, 3500);
        }, 500);
      }
      else if (level.type === "maze") {
        setFeedbackMsg({ text: "Oh no! The Stamp colored everything red and ruined the maze. It can't make pixel-by-pixel decisions (Conflicting Instructions).", type: "error" });
        setTimeout(() => {
          setPixels(Array(100).fill("red"));
          playHeavyThud(); playError(); setCanvasState("ruined");
        }, 500);
      }
      else if (level.type === "bandwidth") {
        if (hasUpgrade) {
          setFeedbackMsg({ text: "Success! The High-Speed Paint Pipe (GDDR) fed the massive stamp perfectly.", type: "success" });
          setTimeout(() => { setPixels(Array(100).fill("blue")); playZap(); playHeavyThud(); setCanvasState("success"); setTimeout(nextLevel, 2500); }, 500);
        } else {
          setCanvasState("stutter_gpu");
        }
      }
      else if (level.type === "raytrace") {
        if (hasUpgrade) {
          setFeedbackMsg({ text: "Beautiful! Specialized Ray Tracing (RT) cores calculate exactly how light bounces in real-time.", type: "success" });
          setTimeout(() => { setPixels(Array(100).fill("yellow")); playZap(); playHeavyThud(); setCanvasState("success"); setTimeout(nextLevel, 3500); }, 500);
        } else {
          setFeedbackMsg({ text: "The lighting looks flat and dull. Our normal Stamp isn't smart enough for light physics! Install RT Cores.", type: "error" });
          setTimeout(() => { setPixels(Array(100).fill("gray")); playHeavyThud(); playError(); setCanvasState("ruined"); }, 500);
        }
      }
    }

    if (canvasState === "stutter_gpu") {
        setFeedbackMsg({ text: "OUT OF PAINT! The standard paint bucket is too small. GPUs need massive memory pipelines (GDDR).", type: "error" });
        let step = 0;
        const interval = setInterval(() => {
          setPixels(prev => { const next = [...prev]; for(let i=0; i<10; i++) if (step*10+i < 100) next[step*10+i] = "gray"; return next; });
          playPop(); step++;
          if (step >= 5) { clearInterval(interval); setCanvasState("ruined"); playError(); }
        }, 600);
        return () => clearInterval(interval);
    }
  }, [canvasState, level.type, hasUpgrade]);

  // Level 3 Check
  useEffect(() => {
    if (level.type === 'split' && splitState.logic && splitState.graphics && canvasState !== 'success') {
      setCanvasState("success");
      setFeedbackMsg({ text: "Awesome teamwork! This is why your computer has BOTH a CPU for logic and a GPU for graphics.", type: "success" });
      playSuccess();
      setTimeout(nextLevel, 3500);
    }
  }, [splitState, level.type]);

  const nextLevel = () => {
    if (levelIdx < LEVELS.length - 1) {
      setLevelIdx(prev => prev + 1);
      setCanvasState("blank");
      setPixels(Array(100).fill("blank"));
      setFeedbackMsg(null);
      setHasUpgrade(false);
      setSplitState({ logic: false, graphics: false });
      playChime();
    } else {
      setHasWon(true);
      playChime();
      reportComplete();
    }
  };

  const handleDrop = (tool: "cpu" | "gpu") => {
    if (canvasState === 'drawing_cpu' || canvasState === 'drawing_gpu' || canvasState === 'stutter_gpu' || canvasState === 'success') return;
    setPixels(Array(100).fill("blank"));
    setCanvasState(tool === "cpu" ? "drawing_cpu" : "drawing_gpu");
  };

  const handleSplitDrop = (zone: "logic" | "graphics", tool: "cpu" | "gpu") => {
    if (zone === 'logic') {
      if (tool === 'cpu') { setSplitState(s => ({...s, logic: true})); playZap(); }
      else { setFeedbackMsg({ text: "Error! The Stamp is terrible at complex gravity math.", type: "error" }); playError(); }
    } else {
      if (tool === 'gpu') { setSplitState(s => ({...s, graphics: true})); playZap(); }
      else { setFeedbackMsg({ text: "Error! The Pens are too slow to draw 10,000 sparks.", type: "error" }); playError(); }
    }
  };

  const handleUpgrade = () => {
    setHasUpgrade(true);
    setCanvasState("blank");
    setPixels(Array(100).fill("blank"));
    setFeedbackMsg(null);
    playSuccess();
  };

  return (
    <LabShell
      labId="gpu9"
      title="The Parallel Processing Art Studio"
      compact={true}
      bgOverride="bg-slate-200"
      instruction="You are the Studio Manager. Drag the correct computing tool to the canvas to fulfill the commission."
      onReset={() => { setLevelIdx(0); setHasUpgrade(false); setCanvasState("blank"); setSplitState({ logic: false, graphics: false }); setFeedbackMsg(null); }}
    >
      <Celebration isActive={hasWon} message="Master Architect! You successfully learned how CPUs handle complex logic, while GPUs dominate AI, Gaming, and Graphics!" onReplay={() => { setLevelIdx(0); setHasWon(false); setCanvasState("blank"); }} />

      <div className="flex flex-col w-full h-full min-h-0 relative select-none font-sans overflow-hidden p-2 sm:p-4 gap-4" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        
        <div className="absolute top-4 right-4 flex gap-1.5 z-20">
            {LEVELS.map((l, i) => (
                <div key={l.id} className={`w-3 h-3 rounded-full border-2 ${i <= levelIdx ? "bg-emerald-500 border-white shadow-md" : "bg-slate-300 border-slate-400"}`} />
            ))}
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-6 items-center justify-center p-2 lg:p-8">
            
            {/* STICKY NOTE */}
            <motion.div initial={{ rotate: -3, x: -50, opacity: 0 }} animate={{ rotate: -3, x: 0, opacity: 1 }} className="w-full max-w-xs bg-[#FEF3C7] px-5 pb-5 pt-4 shadow-2xl relative shrink-0 z-10 rounded-b-md">
                {/* Small Red Push-Pin */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.3),_2px_4px_6px_rgba(0,0,0,0.4)]" />
                <div className="h-6 w-full" /> {/* SPACER TO PROTECT TEXT FROM PIN */}
                
                {/* Title */}
                <h3 className="font-black text-slate-800 text-sm font-mono tracking-tighter border-b-2 border-amber-300 pb-2 mb-3 uppercase flex items-center gap-2">
                    <Activity size={16} className="text-amber-600 shrink-0"/> <span className="truncate">{level.title}</span>
                </h3>
                <p className="text-slate-700 text-sm font-medium leading-relaxed font-serif">{level.task}</p>
                
                <AnimatePresence>
                    {feedbackMsg && (
                        <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 5 }} animate={{ opacity: 1, scale: 1, rotate: 5 }} exit={{ opacity: 0 }} className={`mt-4 p-3 border-2 shadow-lg text-xs font-bold ${feedbackMsg.type === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-rose-50 border-rose-400 text-rose-800'}`}>
                            <div className="flex items-start gap-2">
                                {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600"/> : <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600"/>}
                                {feedbackMsg.text}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* CANVAS AREA */}
            <motion.div animate={canvasState === 'ruined' ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className="relative shrink-0 flex flex-col items-center">
                
                <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-white shadow-2xl border-4 border-slate-200 relative overflow-hidden rounded-xl">
                    
                    {level.type === 'split' ? (
                        // LEVEL 3 SPLIT CANVAS
                        <div className="absolute inset-0 flex flex-col p-2 gap-2 sm:p-4 sm:gap-4">
                            <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { const tool = e.dataTransfer.getData("tool"); if (tool === "cpu" || tool === "gpu") handleSplitDrop('logic', tool); }}
                                className={`flex-1 border-4 border-dashed rounded-xl flex flex-col items-center justify-center p-2 text-center transition-colors ${splitState.logic ? 'bg-sky-100 border-sky-400' : 'bg-slate-50 border-slate-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Gamepad2 size={24} className={splitState.logic ? 'text-sky-500' : 'text-slate-400'} />
                                    {splitState.logic && <CheckCircle2 size={20} className="text-sky-500"/>}
                                </div>
                                <span className="font-black text-slate-700 text-xs sm:text-sm mt-1 uppercase leading-tight">Player Gravity Math</span>
                                <span className="text-[10px] sm:text-xs text-slate-500 font-bold">(Complex Logic)</span>
                            </div>
                            <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { const tool = e.dataTransfer.getData("tool"); if (tool === "cpu" || tool === "gpu") handleSplitDrop('graphics', tool); }}
                                className={`flex-1 border-4 border-dashed rounded-xl flex flex-col items-center justify-center p-2 text-center transition-colors ${splitState.graphics ? 'bg-emerald-100 border-emerald-400' : 'bg-slate-50 border-slate-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Sun size={24} className={splitState.graphics ? 'text-emerald-500' : 'text-slate-400'} />
                                    {splitState.graphics && <CheckCircle2 size={20} className="text-emerald-500"/>}
                                </div>
                                <span className="font-black text-slate-700 text-xs sm:text-sm mt-1 uppercase leading-tight">10,000 Explosion Sparks</span>
                                <span className="text-[10px] sm:text-xs text-slate-500 font-bold">(Massive Graphics)</span>
                            </div>
                        </div>
                    ) : (
                        // STANDARD GRID CANVAS
                        <>
                            {/* Base Background Overlays for Mission Context */}
                            {level.type === 'maze' && (
                                <div className="absolute inset-0 pointer-events-none z-10 grid" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(10, 1fr)' }}>
                                    {Array(100).fill(0).map((_, i) => (
                                        <div key={`maze-${i}`} className={`border-[0.5px] border-slate-200 flex items-center justify-center ${MAZE_PATH.includes(i) ? 'bg-slate-200 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]' : 'bg-slate-50'}`}>
                                            {i === 11 && <span className="text-[10px] font-black text-slate-400">IN</span>}
                                            {i === 88 && <span className="text-[10px] font-black text-slate-400">OUT</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {level.type === 'ai' && (
                                <div className="absolute inset-0 pointer-events-none z-10 grid p-1 gap-[1px]" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(10, 1fr)' }}>
                                    {Array(100).fill(0).map((_, i) => (
                                        <div key={`ai-${i}`} className="bg-slate-50 flex items-center justify-center overflow-hidden">
                                            <span className="text-[6px] font-mono text-slate-300">{Math.random().toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {level.type === 'raytrace' && (
                                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center bg-slate-900">
                                   <div className="w-1/2 h-1/2 border-4 border-slate-700 rounded-full" />
                                </div>
                            )}

                            {/* RICH SUCCESS OVERLAYS (The user's requested rewards!) */}
                            <AnimatePresence>
                                {canvasState === 'success' && level.type === 'fill' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-gradient-to-b from-sky-400 to-sky-100 flex items-center justify-center">
                                        <Sun size={80} className="text-yellow-300 opacity-80" />
                                    </motion.div>
                                )}
                                {canvasState === 'success' && level.type === 'bandwidth' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-purple-600 bg-gradient-to-tr from-purple-600 to-indigo-600 flex flex-col items-center justify-center overflow-hidden gap-4">
                                        <div className="w-full h-4 bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.5)] transform rotate-12 scale-150" />
                                        <div className="w-full h-8 bg-white/30 shadow-[0_0_30px_rgba(255,255,255,0.8)] transform rotate-12 scale-150" />
                                        <div className="w-full h-4 bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.5)] transform rotate-12 scale-150" />
                                    </motion.div>
                                )}
                                {canvasState === 'success' && level.type === 'raytrace' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-slate-900 flex items-center justify-center overflow-hidden">
                                        {/* Beams of light */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-70">
                                            <div className="absolute w-full h-1 bg-yellow-300 blur-sm rotate-45" />
                                            <div className="absolute w-full h-1 bg-yellow-300 blur-sm -rotate-45" />
                                            <div className="absolute w-1 h-full bg-yellow-300 blur-sm" />
                                            <div className="absolute w-full h-1 bg-yellow-300 blur-sm" />
                                        </div>
                                        {/* Glowing Crystal */}
                                        <div className="relative w-20 h-20 rotate-45 bg-gradient-to-tr from-amber-500 via-yellow-200 to-white shadow-[0_0_60px_rgba(253,224,71,0.8)] border-2 border-white rounded-sm" />
                                    </motion.div>
                                )}
                                {canvasState === 'success' && level.type === 'ai' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-slate-900 p-2 overflow-hidden flex flex-wrap gap-1 items-center justify-center">
                                        {Array(50).fill(0).map((_, i) => <span key={i} className="text-emerald-400 font-mono text-xs opacity-90">{Math.random().toFixed(4)}</span>)}
                                    </motion.div>
                                )}
                                {canvasState === 'success' && level.type === 'weather' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-150" />
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-56 h-56 rounded-full border-r-4 border-t-4 border-cyan-500 opacity-40 absolute" />
                                        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }} className="w-40 h-40 rounded-full border-l-4 border-b-4 border-cyan-400 opacity-60 absolute" />
                                        <CloudLightning size={80} className="text-cyan-200 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Paint Grid (Sits above backgrounds, but below rich success overlays if z-index allows. Wait, success overlays have z-25, paint grid has z-20. So success overlays cover the paint grid!) */}
                            <div className="absolute inset-0 grid z-20" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(10, 1fr)' }}>
                                {pixels.map((color, i) => (
                                    <div key={`px-${i}`} className={`border-[0.5px] border-slate-200/20 transition-all duration-150 ${
                                        color === 'blue' ? 'bg-blue-500' : 
                                        color === 'red' ? 'bg-rose-500 scale-[0.85] rounded-sm shadow-[0_0_10px_rgba(244,63,94,0.6)]' : 
                                        color === 'green' ? 'bg-emerald-500' : 
                                        color === 'yellow' ? 'bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.8)]' : 
                                        color === 'gray' ? 'bg-slate-500' : 'bg-transparent'
                                    }`} />
                                ))}
                            </div>

                            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const tool = e.dataTransfer.getData("tool"); if (tool === "cpu" || tool === "gpu") handleDrop(tool); }} className="absolute inset-0 z-40" />

                            <AnimatePresence>
                                {(canvasState === "drawing_gpu" || canvasState === "stutter_gpu") && (
                                    <motion.div initial={{ y: -400, scale: 1.1 }} animate={canvasState === "stutter_gpu" ? { y: [ -400, -200, -100, 0 ] } : { y: 0, scale: 1 }} transition={canvasState === "stutter_gpu" ? { duration: 5, ease: "linear" } : { type: "spring", stiffness: 200, damping: 15 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                                        <div className="w-[95%] h-[95%] border-[8px] border-slate-800 rounded-lg bg-slate-800/10 backdrop-blur-[1px] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                            <PaintRoller size={80} className="text-slate-800 opacity-50" />
                                        </div>
                                    </motion.div>
                                )}
                                {canvasState === "drawing_cpu" && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 pointer-events-none">
                                        <div className="absolute top-[20%] left-[20%] animate-bounce"><MousePointer2 size={32} className="text-sky-600 fill-sky-200 shadow-lg"/></div>
                                        <div className="absolute top-[20%] right-[20%] animate-bounce" style={{ animationDelay: '0.1s' }}><MousePointer2 size={32} className="text-sky-600 fill-sky-200 shadow-lg"/></div>
                                        <div className="absolute bottom-[20%] left-[20%] animate-bounce" style={{ animationDelay: '0.2s' }}><MousePointer2 size={32} className="text-sky-600 fill-sky-200 shadow-lg"/></div>
                                        <div className="absolute bottom-[20%] right-[20%] animate-bounce" style={{ animationDelay: '0.3s' }}><MousePointer2 size={32} className="text-sky-600 fill-sky-200 shadow-lg"/></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
                <div className="text-center mt-3 font-bold text-slate-500 uppercase tracking-widest text-xs">
                    <ArrowDownToLine size={14} className="inline mr-1" /> Drop Tool Here
                </div>
            </motion.div>

        </div>

        {/* BOTTOM TRAY */}
        <div className="shrink-0 w-full max-w-4xl mx-auto bg-slate-800 rounded-t-3xl p-4 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row items-center gap-6 z-30 border-t-4 border-slate-700">
            <div className="flex-1 flex gap-4 w-full">
                <motion.div draggable onDragStart={(e: any) => { e.dataTransfer.setData("tool", "cpu"); playClick(); }} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.95 }} className="flex-1 bg-white rounded-xl p-3 border-b-4 cursor-grab active:cursor-grabbing flex items-center gap-3 shadow-lg border-sky-300 hover:border-sky-500">
                    <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center shrink-0 border border-sky-200 text-sky-600"><Cpu size={24} /></div>
                    <div><h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight">Precision Pens</h4><p className="text-[10px] sm:text-xs text-slate-500 font-medium">4 Master Artists (CPU)</p></div>
                </motion.div>
                <motion.div draggable onDragStart={(e: any) => { e.dataTransfer.setData("tool", "gpu"); playClick(); }} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.95 }} className="flex-1 bg-white rounded-xl p-3 border-b-4 cursor-grab active:cursor-grabbing flex items-center gap-3 shadow-lg border-emerald-300 hover:border-emerald-500">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 border border-emerald-200 text-emerald-600"><Activity size={24} /></div>
                    <div><h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight">Massive Stamp</h4><p className="text-[10px] sm:text-xs text-slate-500 font-medium">100 Novices (GPU)</p></div>
                </motion.div>
            </div>
            
            <AnimatePresence mode="wait">
                {level.type === 'bandwidth' && !hasUpgrade && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleUpgrade} className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest border-b-4 flex items-center gap-2 shadow-lg transition-colors bg-indigo-500 hover:bg-indigo-400 border-indigo-700 text-white shrink-0">
                        <Database size={18} className="animate-pulse"/> Install High-Speed Paint Pipe
                    </motion.button>
                )}
                {level.type === 'raytrace' && !hasUpgrade && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleUpgrade} className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest border-b-4 flex items-center gap-2 shadow-lg transition-colors bg-amber-500 hover:bg-amber-400 border-amber-700 text-white shrink-0">
                        <Sun size={18} className="animate-pulse"/> Install Ray Tracing Cores
                    </motion.button>
                )}
                {hasUpgrade && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest border-b-4 flex items-center gap-2 shadow-lg bg-slate-700 border-slate-900 text-emerald-400 shrink-0">
                        <CheckCircle2 size={18}/> Upgrade Installed
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </LabShell>
  );
}
