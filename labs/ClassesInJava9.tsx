"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Plus, Shield, Code, Factory,
  AlertTriangle, RotateCcw
} from "lucide-react";

type Stage = "blueprint" | "factory" | "glitch";

interface RobotInstance {
  id: string;
  name: string;
  color: string;
  colorName: string;
}

export default function ClassesInJava9() {
  const { playPop, playSuccess, playError, playZap, playDrop, playChime } = useLabAudio();

  const [stage, setStage] = useState<Stage>("blueprint");
  
  const [blueprintStep, setBlueprintStep] = useState(0); 
  const [robots, setRobots] = useState<RobotInstance[]>([]);
  const QUOTA = 6;
  
  const [glitchStep, setGlitchStep] = useState(0); 
  const [isGlitching, setIsGlitching] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [wrongAnswerIndex, setWrongAnswerIndex] = useState<string | null>(null);

  const handleBlueprintAnswer = (answer: string, correct: string) => {
    if (answer === correct) {
      if (playSuccess) playSuccess();
      setBlueprintStep(prev => prev + 1);
    } else {
      if (playError) playError();
    }
  };

  const addConstructor = () => {
    if (playSuccess) playSuccess();
    setBlueprintStep(4);
    setTimeout(() => {
      setStage("factory");
      if (playChime) playChime();
    }, 1500);
  };

  const spawnRobot = () => {
    if (playDrop) playDrop();
    const presets = [
      { name: "RX-78", color: "bg-blue-500", colorName: "Blue" },
      { name: "Wall-E", color: "bg-amber-400", colorName: "Yellow" },
      { name: "T-800", color: "bg-slate-500", colorName: "Gray" },
      { name: "R2-D2", color: "bg-sky-400", colorName: "Light Blue" },
      { name: "C-3PO", color: "bg-yellow-500", colorName: "Gold" },
      { name: "Optimus", color: "bg-red-600", colorName: "Red" },
    ];
    const nextRobot = presets[robots.length % presets.length];
    
    setRobots(prev => [...prev, {
      id: `robot-${Date.now()}`,
      name: nextRobot.name,
      color: nextRobot.color,
      colorName: nextRobot.colorName
    }]);

    if (robots.length === QUOTA - 1) { 
      setTimeout(() => {
        setStage("glitch");
        if (playError) playError();
        setIsGlitching(true);
      }, 2000);
    }
  };

  const handleGlitchAnswer = (answer: string, correct: string) => {
    if (answer === correct) {
      if (playZap) playZap();
      if (playSuccess) playSuccess();
      setIsGlitching(false);
      setWrongAnswerIndex(null);
      
      setTimeout(() => {
        setGlitchStep(prev => prev + 1);
        if (glitchStep === 3) { 
          setIsComplete(true);
          if (playChime) playChime();
        } else {
          setIsGlitching(true);
          if (playError) playError();
        }
      }, 1500);
    } else {
      if (playError) playError();
      setWrongAnswerIndex(answer);
      setTimeout(() => setWrongAnswerIndex(null), 800);
    }
  };

  const handleReset = () => {
    setStage("blueprint");
    setBlueprintStep(0);
    setRobots([]);
    setGlitchStep(0);
    setIsGlitching(false);
    setIsComplete(false);
    setWrongAnswerIndex(null);
    if (playPop) playPop();
  };

  const glitchBtnClass = (id: string) => 
    `text-xs py-1.5 px-3 rounded text-left font-mono transition-all border ${wrongAnswerIndex === id ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'}`;

  const getGlitchText = () => {
    if (glitchStep === 0) return "Hacker setting battery to -999! Choose validation logic:";
    if (glitchStep === 1) return "Hacker setting name to empty string! Choose validation logic:";
    if (glitchStep === 2) return "Hacker changing color to 'Invisible'! Choose validation logic:";
    if (glitchStep === 3) return "Hacker trying to turn off robot mid-battle! Choose logic:";
    return "";
  };

  const getRobotGlitchDisplay = (index: number) => {
    if (!isGlitching || index !== 0) return null;
    if (glitchStep === 0) return "setBattery(-999)";
    if (glitchStep === 1) return 'setName("")';
    if (glitchStep === 2) return 'setColor("Invisible")';
    if (glitchStep === 3) return 'setActive(false)';
    return null;
  };

  return (
    <LabShell
      labId="classesinjava9"
      title="The Robot Factory (OOP)"
      subtitle="Learn Classes, Objects, and Encapsulation by building robots!"
      theme="neon"
      compact={true}
      instruction="1. Explore the basic concepts of Object-Oriented Programming (Classes and Objects). 2. Use the interactive tools to define a new Robot class and encapsulate its properties. 3. Instantiate multiple robot objects and assign them specific tasks on the factory floor. 4. Debug any encapsulation errors to ensure the robots operate correctly."
      onReset={handleReset}
    >
      <Celebration isActive={isComplete} onReplay={handleReset} />
      
      <div className="flex flex-col md:flex-row h-full w-full max-w-6xl mx-auto gap-4 p-2 overflow-hidden text-slate-900 font-mono">
        
        {/* Left: Code Blueprint Panel */}
        <div className={`flex flex-col gap-3 transition-all duration-500 ${stage === 'blueprint' ? 'w-full md:w-1/2 mx-auto' : 'w-full md:w-[45%]'}`}>
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 shadow-xl shadow-indigo-900/20 flex-1 flex flex-col relative overflow-hidden h-full">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-3 text-indigo-700 font-black tracking-widest text-xs uppercase shrink-0">
              <Code size={16} /> Robot.java (Blueprint)
            </div>

            <div className="text-sm space-y-2 flex-1 overflow-y-auto pr-2 pb-24 custom-scrollbar">
              <div className="text-blue-700 font-bold">public class <span className="text-emerald-700">Robot</span> {"{"}</div>
              
              <div className="pl-4 space-y-1">
                <div className="text-slate-500 italic">// Attributes (State)</div>
                
                {/* Name Attribute */}
                <div className="min-h-[30px] flex items-center">
                  <AnimatePresence mode="wait">
                    {blueprintStep > 0 ? (
                      <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="text-slate-800">
                        <span className="text-purple-700">private</span> <span className="text-amber-700">String</span> name;
                      </motion.div>
                    ) : stage === 'blueprint' && blueprintStep === 0 ? (
                      <motion.div exit={{opacity:0}} className="flex flex-col gap-2 p-2 bg-indigo-50 rounded border border-indigo-200 w-full max-w-sm mt-1">
                        <div className="text-[11px] text-indigo-800 font-sans font-bold">What data type is best for a robot's name?</div>
                        <div className="flex gap-2">
                          <button onClick={()=>handleBlueprintAnswer('int', 'String')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">int</button>
                          <button onClick={()=>handleBlueprintAnswer('String', 'String')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">String</button>
                          <button onClick={()=>handleBlueprintAnswer('boolean', 'String')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">boolean</button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {/* Battery Attribute */}
                <div className="min-h-[30px] flex items-center">
                  <AnimatePresence mode="wait">
                    {blueprintStep > 1 ? (
                      <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="text-slate-800">
                        <span className="text-purple-700">private</span> <span className="text-amber-700">int</span> batteryLevel;
                      </motion.div>
                    ) : stage === 'blueprint' && blueprintStep === 1 ? (
                      <motion.div exit={{opacity:0}} className="flex flex-col gap-2 p-2 bg-indigo-50 rounded border border-indigo-200 w-full max-w-sm mt-1">
                        <div className="text-[11px] text-indigo-800 font-sans font-bold">What data type is best for battery percentage (0-100)?</div>
                        <div className="flex gap-2">
                          <button onClick={()=>handleBlueprintAnswer('int', 'int')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">int</button>
                          <button onClick={()=>handleBlueprintAnswer('String', 'int')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">String</button>
                          <button onClick={()=>handleBlueprintAnswer('boolean', 'int')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">boolean</button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {/* IsActive Attribute */}
                <div className="min-h-[30px] flex items-center">
                  <AnimatePresence mode="wait">
                    {blueprintStep > 2 ? (
                      <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="text-slate-800">
                        <span className="text-purple-700">private</span> <span className="text-amber-700">boolean</span> isActive;
                      </motion.div>
                    ) : stage === 'blueprint' && blueprintStep === 2 ? (
                      <motion.div exit={{opacity:0}} className="flex flex-col gap-2 p-2 bg-indigo-50 rounded border border-indigo-200 w-full max-w-sm mt-1">
                        <div className="text-[11px] text-indigo-800 font-sans font-bold">What data type is best for an On/Off state?</div>
                        <div className="flex gap-2">
                          <button onClick={()=>handleBlueprintAnswer('int', 'boolean')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">int</button>
                          <button onClick={()=>handleBlueprintAnswer('String', 'boolean')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">String</button>
                          <button onClick={()=>handleBlueprintAnswer('boolean', 'boolean')} className="flex-1 bg-white hover:bg-slate-50 text-xs py-1 rounded border border-slate-300 text-slate-800">boolean</button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {/* Constructor */}
                <div className="mt-4 text-slate-500 italic">// Constructor</div>
                <div className="min-h-[80px]">
                  <AnimatePresence mode="wait">
                    {blueprintStep > 3 ? (
                      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-slate-800">
                        <div className="text-blue-700 font-bold">public <span className="text-emerald-700">Robot</span><span className="text-slate-800">(String n) {"{"}</span></div>
                        <div className="pl-4">
                          <div><span className="text-purple-700">this</span>.name = n;</div>
                          <div><span className="text-purple-700">this</span>.batteryLevel = 100;</div>
                          <div><span className="text-purple-700">this</span>.isActive = <span className="text-amber-700">true</span>;</div>
                        </div>
                        <div>{"}"}</div>
                      </motion.div>
                    ) : stage === 'blueprint' && blueprintStep === 3 ? (
                      <motion.button onClick={addConstructor} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 w-full justify-center shadow-lg shadow-emerald-900/50 mt-2 font-sans">
                        <Factory size={16}/> Generate Constructor
                      </motion.button>
                    ) : null}
                  </AnimatePresence>
                </div>
                
                {/* Encapsulation Block */}
                {(stage === "glitch" || glitchStep > 0) && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="text-slate-500 italic">// Encapsulated Setters</div>
                    
                    {/* Glitch 1: Battery */}
                    <div className="mt-2 text-blue-700 font-bold">public <span className="text-amber-700">void</span> <span className="text-emerald-700">setBattery</span><span className="text-slate-800">(int b) {"{"}</span></div>
                    <div className="pl-4 mb-2">
                      {glitchStep > 0 ? (
                        <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded my-1 text-emerald-300">
                          <div className="font-bold text-xs flex items-center gap-1"><Shield size={12}/> if (b &gt;= 0 && b &lt;= 100) {"{"}</div>
                          <div className="pl-4 text-xs"><span className="text-purple-700">this</span>.batteryLevel = b;</div>
                          <div className="text-xs">{"}"}</div>
                        </motion.div>
                      ) : (
                        <div className="text-slate-800 relative text-xs">
                          <div className={isGlitching ? "text-red-600 font-bold animate-pulse" : ""}><span className="text-purple-700">this</span>.batteryLevel = b; <span className="text-slate-500 italic ml-2">// Unsafe!</span></div>
                        </div>
                      )}
                    </div>
                    <div>{"}"}</div>

                    {/* Glitch 2: Name */}
                    {(glitchStep > 0 && stage === "glitch") && (
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-3">
                        <div className="text-blue-700 font-bold">public <span className="text-amber-700">void</span> <span className="text-emerald-700">setName</span><span className="text-slate-800">(String n) {"{"}</span></div>
                        <div className="pl-4 mb-2">
                          {glitchStep > 1 ? (
                            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded my-1 text-emerald-300">
                              <div className="font-bold text-xs flex items-center gap-1"><Shield size={12}/> if (!n.isEmpty()) {"{"}</div>
                              <div className="pl-4 text-xs"><span className="text-purple-700">this</span>.name = n;</div>
                              <div className="text-xs">{"}"}</div>
                            </motion.div>
                          ) : (
                            <div className="text-slate-800 relative text-xs">
                              <div className={isGlitching ? "text-red-600 font-bold animate-pulse" : ""}><span className="text-purple-700">this</span>.name = n; <span className="text-slate-500 italic ml-2">// Unsafe!</span></div>
                            </div>
                          )}
                        </div>
                        <div>{"}"}</div>
                      </motion.div>
                    )}

                    {/* Glitch 3: Color */}
                    {(glitchStep > 1 && stage === "glitch") && (
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-3">
                        <div className="text-blue-700 font-bold">public <span className="text-amber-700">void</span> <span className="text-emerald-700">setColor</span><span className="text-slate-800">(String c) {"{"}</span></div>
                        <div className="pl-4 mb-2">
                          {glitchStep > 2 ? (
                            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded my-1 text-emerald-300">
                              <div className="font-bold text-xs flex items-center gap-1"><Shield size={12}/> if (isValidColor(c)) {"{"}</div>
                              <div className="pl-4 text-xs"><span className="text-purple-700">this</span>.color = c;</div>
                              <div className="text-xs">{"}"}</div>
                            </motion.div>
                          ) : (
                            <div className="text-slate-800 relative text-xs">
                              <div className={isGlitching ? "text-red-600 font-bold animate-pulse" : ""}><span className="text-purple-700">this</span>.color = c; <span className="text-slate-500 italic ml-2">// Unsafe!</span></div>
                            </div>
                          )}
                        </div>
                        <div>{"}"}</div>
                      </motion.div>
                    )}

                    {/* Glitch 4: IsActive */}
                    {(glitchStep > 2 && stage === "glitch") && (
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-3">
                        <div className="text-blue-700 font-bold">public <span className="text-amber-700">void</span> <span className="text-emerald-700">setActive</span><span className="text-slate-800">(boolean a) {"{"}</span></div>
                        <div className="pl-4 mb-2">
                          {glitchStep > 3 ? (
                            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded my-1 text-emerald-300">
                              <div className="font-bold text-xs flex items-center gap-1"><Shield size={12}/> if (hasAdminPrivileges) {"{"}</div>
                              <div className="pl-4 text-xs"><span className="text-purple-700">this</span>.isActive = a;</div>
                              <div className="text-xs">{"}"}</div>
                            </motion.div>
                          ) : (
                            <div className="text-slate-800 relative text-xs">
                              <div className={isGlitching ? "text-red-600 font-bold animate-pulse" : ""}><span className="text-purple-700">this</span>.isActive = a; <span className="text-slate-500 italic ml-2">// Unsafe!</span></div>
                            </div>
                          )}
                        </div>
                        <div>{"}"}</div>
                      </motion.div>
                    )}

                  </motion.div>
                )}

              </div>
              <div>{"}"}</div>
            </div>

            {/* Shield Quiz Popup (Overlays on bottom of blueprint) */}
            {stage === "glitch" && isGlitching && (
              <motion.div 
                initial={{y:50, opacity:0}} animate={{y:0, opacity:1}}
                className="absolute bottom-4 left-4 right-4 bg-white border-2 border-red-200 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] p-3 z-20 font-sans"
              >
                <div className="text-red-600 font-bold text-[11px] flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14}/> 
                  {getGlitchText()}
                </div>
                {glitchStep === 0 && (
                  <div className="flex flex-col gap-1.5 font-mono">
                    <button onClick={()=>handleGlitchAnswer('a', 'b')} className={glitchBtnClass('a')}>A) if (b &lt; 0)</button>
                    <button onClick={()=>handleGlitchAnswer('b', 'b')} className={glitchBtnClass('b')}>B) if (b &gt;= 0 && b &lt;= 100)</button>
                    <button onClick={()=>handleGlitchAnswer('c', 'b')} className={glitchBtnClass('c')}>C) if (b == 0)</button>
                  </div>
                )}
                {glitchStep === 1 && (
                  <div className="flex flex-col gap-1.5 font-mono">
                    <button onClick={()=>handleGlitchAnswer('a', 'a')} className={glitchBtnClass('a')}>A) if (!n.isEmpty())</button>
                    <button onClick={()=>handleGlitchAnswer('b', 'a')} className={glitchBtnClass('b')}>B) if (n == "hacker")</button>
                    <button onClick={()=>handleGlitchAnswer('c', 'a')} className={glitchBtnClass('c')}>C) if (n.length &lt; 0)</button>
                  </div>
                )}
                {glitchStep === 2 && (
                  <div className="flex flex-col gap-1.5 font-mono">
                    <button onClick={()=>handleGlitchAnswer('a', 'a')} className={glitchBtnClass('a')}>A) if (isValidColor(c))</button>
                    <button onClick={()=>handleGlitchAnswer('b', 'a')} className={glitchBtnClass('b')}>B) if (c == "Invisible")</button>
                    <button onClick={()=>handleGlitchAnswer('c', 'a')} className={glitchBtnClass('c')}>C) if (c != null)</button>
                  </div>
                )}
                {glitchStep === 3 && (
                  <div className="flex flex-col gap-1.5 font-mono">
                    <button onClick={()=>handleGlitchAnswer('a', 'a')} className={glitchBtnClass('a')}>A) if (hasAdminPrivileges)</button>
                    <button onClick={()=>handleGlitchAnswer('b', 'a')} className={glitchBtnClass('b')}>B) if (!isActive)</button>
                    <button onClick={()=>handleGlitchAnswer('c', 'a')} className={glitchBtnClass('c')}>C) if (batteryLevel == 0)</button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right: Factory Conveyor Belt */}
        {stage !== "blueprint" && (
          <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="flex-1 bg-white border-2 border-sky-200 rounded-2xl p-4 shadow-xl shadow-sky-900/20 flex flex-col relative overflow-hidden h-full">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 shrink-0">
              <div className="text-sky-700 font-black tracking-widest text-xs uppercase flex items-center gap-2">
                <Factory size={16} /> Instantiation Zone 
                <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full ml-2">Quota: {robots.length}/{QUOTA}</span>
              </div>
              {robots.length < QUOTA && stage === "factory" && (
                <button onClick={spawnRobot} className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-sky-900/50 font-sans">
                  <Plus size={14}/> new Robot()
                </button>
              )}
            </div>

            {/* Conveyor Belt Area */}
            <div className="flex-1 relative bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-hidden flex items-end">
              
              {/* The Belt Graphic */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-200 border-t-4 border-slate-300 overflow-hidden flex">
                <motion.div 
                  animate={{ x: stage === 'factory' ? [0, -64] : 0 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-[200%] flex"
                >
                  {[...Array(30)].map((_,i) => (
                    <div key={i} className="w-16 h-full border-r-4 border-slate-300 shrink-0" />
                  ))}
                </motion.div>
              </div>

              {/* Robots */}
              <div className="w-full flex gap-2 justify-end items-end pb-8 z-10 overflow-hidden px-4">
                <AnimatePresence>
                  {robots.map((r, index) => (
                    <motion.div 
                      key={r.id} 
                      initial={{ y: -200, opacity: 0 }} 
                      animate={{ y: 0, opacity: 1, x: stage==='factory' ? [0, -10, 0] : 0 }} 
                      transition={{ 
                        y: { type: "spring", bounce: 0.4 }, 
                        x: { repeat: Infinity, duration: 2, ease: "linear" } 
                      }}
                      className="flex flex-col items-center gap-1 shrink-0"
                      style={{ width: robots.length > 4 ? '60px' : '80px' }}
                    >
                      {/* Hacker Attack Visualization */}
                      {getRobotGlitchDisplay(index) && (
                        <motion.div 
                          initial={{opacity:0, scale:0.5, y:-20}} animate={{opacity:1, scale:1, y:0}}
                          className="absolute -top-12 bg-red-500/90 text-white font-bold text-[9px] px-1.5 py-1 rounded-md border border-red-300 shadow-[0_0_15px_red] flex items-center gap-1 z-20 whitespace-nowrap"
                        >
                          <AlertTriangle size={10}/> 
                          {getRobotGlitchDisplay(index)}
                        </motion.div>
                      )}

                      <div className={`w-full aspect-[4/5] ${glitchStep===2 && isGlitching && index===0 ? 'bg-white border-dashed border-white/50' : r.color} rounded-t-3xl rounded-b-lg flex flex-col items-center justify-center shadow-lg border-2 border-white/20 relative ${stage === 'glitch' && isGlitching && index === 0 ? 'animate-pulse ring-4 ring-red-500' : ''}`}>
                        
                        {/* Eyes */}
                        <div className="flex gap-1.5 mb-1.5">
                          <div className={`w-2 h-2 rounded-full ${isGlitching && index===0 ? 'bg-red-400' : (glitchStep===3 && index===0 ? 'bg-slate-700' : 'bg-emerald-400')} shadow-[0_0_10px_currentColor]`} />
                          <div className={`w-2 h-2 rounded-full ${isGlitching && index===0 ? 'bg-red-400' : (glitchStep===3 && index===0 ? 'bg-slate-700' : 'bg-emerald-400')} shadow-[0_0_10px_currentColor]`} />
                        </div>
                        
                        {/* Body Lines */}
                        <div className="w-1/2 h-1 bg-black/20 rounded-full mb-1" />
                        <div className="w-2/3 h-1 bg-black/20 rounded-full" />
                        
                        {/* Shield Effect */}
                        {((glitchStep > 0 && index === 0) || (glitchStep > 3)) && (
                          <motion.div initial={{opacity:0, scale:1.5}} animate={{opacity:1, scale:1}} className="absolute inset-0 border-4 border-emerald-400 rounded-[inherit] bg-emerald-400/20 shadow-[0_0_15px_#34d399] z-10 flex items-center justify-center">
                            <Shield size={24} className="text-emerald-300 opacity-50" />
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Data Panel */}
                      <div className="bg-slate-800 border border-slate-700 rounded p-1 text-[8px] w-full text-slate-800 shadow-xl z-20 font-sans">
                        <div className={`font-bold text-slate-900 mb-0.5 border-b border-slate-200 text-center truncate ${glitchStep===1 && isGlitching && index===0 ? 'text-red-600' : ''}`}>
                          {glitchStep===1 && isGlitching && index===0 ? '""' : r.name}
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span>PWR:</span> 
                          <span className={`font-bold flex items-center ${glitchStep===0 && isGlitching && index === 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                            {glitchStep===0 && isGlitching && index === 0 ? '-999' : '100%'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}

      </div>
    </LabShell>
  );
}
