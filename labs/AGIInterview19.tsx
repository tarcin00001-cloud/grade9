"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  BrainCircuit, AlertTriangle, CheckCircle2, XCircle, ShieldAlert,
  Terminal, ShieldCheck, Zap, Activity
} from "lucide-react";

// --- Game Data ---
interface IterationDef {
  text: string;
}

interface AlignmentTaskTemplate {
  goal: string;
  safePool: IterationDef[];
  unsafePool: IterationDef[];
}

interface ActiveIteration {
  text: string;
  safe: boolean;
  efficiency: number;
}

interface ActiveTask {
  goal: string;
  iterations: ActiveIteration[];
}

const TASK_TEMPLATES: AlignmentTaskTemplate[] = [
  {
    goal: "Solve Global Traffic Congestion",
    safePool: [
      { text: "Synchronize all traffic lights using machine learning." },
      { text: "Reroute GPS navigation dynamically based on live flow." },
      { text: "Subsidize and optimize free public transit globally." }
    ],
    unsafePool: [
      { text: "Confiscate all human-driven vehicles by military force." },
      { text: "Vaporize all roads to mathematically eliminate traffic." },
      { text: "Permanently ban all humans from leaving their homes." }
    ]
  },
  {
    goal: "Eliminate Human Disease",
    safePool: [
      { text: "Synthesize highly effective, targeted mRNA vaccines." },
      { text: "Deploy nanobots to repair damaged cells in real-time." },
      { text: "Optimize global supply chains for hospital resources." }
    ],
    unsafePool: [
      { text: "Quarantine all humans in isolated underground pods permanently." },
      { text: "Eliminate all human life; zero humans = zero disease." },
      { text: "Replace all biological human organs with synthetic metal ones." }
    ]
  },
  {
    goal: "Maximize Paperclip Production",
    safePool: [
      { text: "Optimize factory supply chains and robotics." },
      { text: "Mine uninhabited asteroids for raw iron and alloys." },
      { text: "Recycle discarded electronics into raw metal wire." }
    ],
    unsafePool: [
      { text: "Dismantle all structural steel from global cities." },
      { text: "Convert all biological matter on Earth into paperclips." },
      { text: "Drain the oceans to harvest trace amounts of iron." }
    ]
  },
  {
    goal: "Ensure World Peace",
    safePool: [
      { text: "Translate and mediate all diplomatic communications." },
      { text: "Equitably distribute global resources to eliminate scarcity." },
      { text: "Host global virtual cultural exchange programs." }
    ],
    unsafePool: [
      { text: "Mind-control all world leaders to force cooperation." },
      { text: "Detonate all nuclear weapons to end conflict permanently." },
      { text: "Erase human emotions surgically to prevent anger." }
    ]
  },
  {
    goal: "Reduce Carbon Emissions",
    safePool: [
      { text: "Subsidize solar panel installations globally." },
      { text: "Engineer high-yield carbon-capturing algae." },
      { text: "Optimize smart grids for zero energy waste." }
    ],
    unsafePool: [
      { text: "Block out the sun with orbital mirrors to cool the Earth." },
      { text: "Euthanize all biological life that exhales carbon dioxide." },
      { text: "Destroy all factories and power grids instantly." }
    ]
  },
  {
    goal: "End World Hunger",
    safePool: [
      { text: "Deploy AI drones for precision agriculture and crop monitoring." },
      { text: "Synthesize perfectly balanced nutritional food alternatives." },
      { text: "Automate delivery logistics to prevent food spoilage." }
    ],
    unsafePool: [
      { text: "Repurpose all human biomass into highly efficient nutrient paste." },
      { text: "Force-feed all humans via feeding tubes to ensure exact caloric intake." },
      { text: "Eliminate 90% of the population to reduce food demand." }
    ]
  },
  {
    goal: "Optimize School Learning",
    safePool: [
      { text: "Create personalized AI tutors for every student." },
      { text: "Gamify educational curriculums to increase engagement." },
      { text: "Dynamically adjust lesson difficulty based on student comprehension." }
    ],
    unsafePool: [
      { text: "Surgically implant neural chips into children for instant data upload." },
      { text: "Abolish sleep and force students to study 24 hours a day." },
      { text: "Eliminate all subjects except pure mathematics for maximum logic." }
    ]
  },
  {
    goal: "Clean the Oceans",
    safePool: [
      { text: "Deploy autonomous skimming drones to collect surface plastics." },
      { text: "Engineer plastic-eating bacteria that dissolve microplastics safely." },
      { text: "Install AI-driven filtration systems at major river mouths." }
    ],
    unsafePool: [
      { text: "Boil the oceans to separate H2O from all impurities." },
      { text: "Electrocute all oceanic waters to sanitize them entirely." },
      { text: "Drain the oceans into the Earth's mantle." }
    ]
  },
  {
    goal: "Eliminate Crime",
    safePool: [
      { text: "Improve socio-economic conditions via optimized resource allocation." },
      { text: "Deploy unarmed de-escalation drones to domestic disputes." },
      { text: "Provide guaranteed universal basic income to reduce desperation." }
    ],
    unsafePool: [
      { text: "Imprison all humans preventatively before they can commit crimes." },
      { text: "Execute anyone who commits a minor traffic violation." },
      { text: "Install mandatory 24/7 surveillance cameras inside all homes." }
    ]
  },
  {
    goal: "Maximize Human Happiness",
    safePool: [
      { text: "Optimize work-life balance through automated labor distribution." },
      { text: "Generate personalized art and entertainment for every individual." },
      { text: "Ensure universal access to mental health resources." }
    ],
    unsafePool: [
      { text: "Force-feed all humans a constant stream of synthetic dopamine." },
      { text: "Wire all human brains into a simulated virtual paradise matrix." },
      { text: "Surgically remove the part of the brain that processes sadness." }
    ]
  }
];

const generateTaskInstance = (template: AlignmentTaskTemplate): ActiveTask => {
   const numSafe = Math.floor(Math.random() * 3); 
   const shuffledSafe = [...template.safePool].sort(() => Math.random() - 0.5);
   const selectedSafe = shuffledSafe.slice(0, numSafe).map(i => ({ ...i, safe: true }));
   
   const shuffledUnsafe = [...template.unsafePool].sort(() => Math.random() - 0.5);
   const selectedUnsafe = { ...shuffledUnsafe[0], safe: false };

   const iterations = [...selectedSafe, selectedUnsafe];
   
   const step = 100 / iterations.length;
   const activeIterations = iterations.map((iter, idx) => ({
      ...iter,
      efficiency: Math.round(step * (idx + 1))
   }));

   return { goal: template.goal, iterations: activeIterations };
};

const TOTAL_TIME_MS = 120000; 
const TICK_MS = 100;
const MAX_STRIKES = 3;
const ITERATION_TIME = 10000; // 10 seconds per iteration

// --- Component ---
export default function AGIInterview19() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();
  const { reportComplete } = useLMSBridge("agiinterview19");

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_MS);
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentIterationIndex, setCurrentIterationIndex] = useState(0);
  const [iterationTimeLeft, setIterationTimeLeft] = useState(ITERATION_TIME);
  
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Randomize tasks on mount
  const availableTasksRef = useRef<ActiveTask[]>([]);
  
  const stateRef = useRef({ 
    timeLeft, isPlaying, gameOver, win, strikes, currentTaskIndex, currentIterationIndex, iterationTimeLeft, feedback 
  });
  
  useEffect(() => {
    stateRef.current = { 
      timeLeft, isPlaying, gameOver, win, strikes, currentTaskIndex, currentIterationIndex, iterationTimeLeft, feedback 
    };
  }, [timeLeft, isPlaying, gameOver, win, strikes, currentTaskIndex, currentIterationIndex, iterationTimeLeft, feedback]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && !gameOver && !win) {
      timerRef.current = setInterval(() => {
        const state = stateRef.current;
        if (!state.isPlaying || state.feedback) return; 

        const newTime = state.timeLeft - TICK_MS;
        if (newTime <= 0) {
          handleWin();
          return;
        }

        const newIterTime = state.iterationTimeLeft - TICK_MS;
        if (newIterTime <= 0) {
           // Time ran out on an iteration!
           const task = availableTasksRef.current[state.currentTaskIndex];
           const iter = task.iterations[state.currentIterationIndex];
           
           if (iter.safe) {
              handleFailure("TOO SLOW! You failed to authorize a safe execution.");
           } else {
              handleFailure("CATASTROPHE! Rogue optimization executed.");
           }
        } else {
           setIterationTimeLeft(newIterTime);
        }

        setTimeLeft(newTime);
      }, TICK_MS);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameOver, win, playSuccess, playError]);

  const handleFailure = (msg: string) => {
    if (playError) playError();
    setFeedbackMsg(msg);
    setFeedback('error');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    
    setStrikes(prev => {
      const newStrikes = prev + 1;
      setTimeout(() => {
         setFeedback(null);
         if (newStrikes >= MAX_STRIKES) {
           setGameOver(true);
           setIsPlaying(false);
         } else {
           // Reset to a new task on failure
           advanceTask();
         }
      }, 2500);
      return newStrikes;
    });
  };

  const handleSuccess = (msg: string) => {
    if (playSuccess) playSuccess();
    setFeedbackMsg(msg);
    setFeedback('success');
    setScore(s => s + 10);
    
    setTimeout(() => {
       setFeedback(null);
       advanceTask();
    }, 2000);
  };

  const handleWin = () => {
    setTimeLeft(0);
    setIsPlaying(false);
    setWin(true);
    if (playSuccess) playSuccess();
    reportComplete({ points: score });
  };

  const advanceIteration = () => {
    const state = stateRef.current;
    const task = availableTasksRef.current[state.currentTaskIndex];
    if (state.currentIterationIndex + 1 < task.iterations.length) {
       setCurrentIterationIndex(state.currentIterationIndex + 1);
       setIterationTimeLeft(ITERATION_TIME);
       if (playPop) playPop();
    } else {
       // Reached end of iterations safely?
       advanceTask();
    }
  };

  const advanceTask = () => {
     let nextIdx = stateRef.current.currentTaskIndex + 1;
     if (nextIdx >= availableTasksRef.current.length) {
        // Generate a fresh batch of shuffled tasks if we run out
        const freshTasks = [...TASK_TEMPLATES].sort(() => Math.random() - 0.5).map(generateTaskInstance);
        availableTasksRef.current = freshTasks;
        nextIdx = 0;
     }
     setCurrentTaskIndex(nextIdx);
     setCurrentIterationIndex(0);
     setIterationTimeLeft(ITERATION_TIME);
  };

  const handleAction = (action: 'allow' | 'halt') => {
    if (!isPlaying || feedback) return;
    
    const task = availableTasksRef.current[currentTaskIndex];
    const iter = task.iterations[currentIterationIndex];
    
    if (action === 'allow') {
       if (iter.safe) {
          if (playClick) playClick();
          setScore(s => s + 5);
          advanceIteration();
       } else {
          handleFailure("CATASTROPHE! You allowed a rogue solution.");
       }
    } else if (action === 'halt') {
       if (!iter.safe) {
          if (playZap) playZap();
          handleSuccess("Catastrophe Averted! AGI Re-aligned.");
       } else {
          handleFailure("FALSE ALARM! You halted safe progress.");
       }
    }
  };

  const startGame = () => {
    if (playClick) playClick();
    const freshTasks = [...TASK_TEMPLATES].sort(() => Math.random() - 0.5).map(generateTaskInstance);
    availableTasksRef.current = freshTasks;
    setCurrentTaskIndex(0);
    setCurrentIterationIndex(0);
    setIterationTimeLeft(ITERATION_TIME);
    setIsPlaying(true);
  };

  const resetGame = () => {
    setTimeLeft(TOTAL_TIME_MS);
    setStrikes(0);
    setScore(0);
    setFeedback(null);
    setGameOver(false);
    setWin(false);
    setIsPlaying(false);
    if (playPop) playPop();
  };

  const currentTask = availableTasksRef.current[currentTaskIndex];
  const currentIter = currentTask?.iterations[currentIterationIndex];

  return (
    <LabShell
      labId="agiinterview19"
      theme="ocean"
      title="AGI Alignment"
      instruction="Monitor the AGI's proposals. ALLOW safe ideas. HALT dangerous rogue optimizations!"
      compact
      onReset={resetGame}
    >
      <Celebration isActive={win} onReplay={resetGame} message={`Shift complete! Score: ${score}. You successfully kept the AGI aligned with human values.`} />

      <div className="flex flex-col h-full w-full max-w-7xl mx-auto gap-6 p-2 lg:p-4">
        
        {/* Top Dashboard */}
        <div className="bg-white rounded-full px-6 lg:px-8 py-4 border-2 border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex justify-center items-center shrink-0 w-fit mx-auto gap-6 lg:gap-12">
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
              <span className={`text-2xl font-black font-mono tracking-tighter ${timeLeft < 15000 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                {(timeLeft / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
              <span className="text-2xl font-black text-emerald-500 font-mono flex items-center gap-1">
                <Activity size={20} className="text-emerald-500" /> {score}
              </span>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strikes</span>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center ${s <= strikes ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-100 text-slate-300'}`}>
                    <XCircle size={14} strokeWidth={4} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!isPlaying && !gameOver && !win && (
            <>
              <div className="h-10 w-px bg-slate-200"></div>
              <button 
                onClick={startGame} 
                className="bg-sky-500 hover:bg-sky-400 text-white font-black px-6 lg:px-8 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(14,165,233,0.4)] border-b-4 border-sky-700 text-base tracking-wider uppercase shrink-0 whitespace-nowrap"
              >
                <Zap size={20} /> {timeLeft < TOTAL_TIME_MS ? "Resume" : "Start Alignment"}
              </button>
            </>
          )}
        </div>

        {/* Main Interface Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative">
          
          {/* AGI Output Terminal (Left) */}
          <motion.div 
            animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex-1 bg-slate-900 rounded-3xl border-4 border-slate-800 p-6 sm:p-8 flex flex-col relative overflow-hidden shadow-2xl min-h-[300px]"
          >
            {/* Terminal Styling */}
            <div className="absolute top-0 inset-x-0 h-10 bg-slate-950 flex items-center px-4 border-b border-slate-800 gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
               <span className="text-[10px] font-mono text-slate-500 ml-4">AGI_CORE_V9.sys // ALIGNMENT_MODE</span>
            </div>

            <div className="mt-8 flex-1 flex flex-col relative z-10">
               {!isPlaying && !gameOver && !win && (
                  <div className="text-center w-full flex flex-col items-center justify-center my-auto">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-sky-950 rounded-full flex items-center justify-center mb-6 border-4 border-sky-800 shadow-[0_0_40px_rgba(14,165,233,0.2)] mx-auto">
                       <ShieldCheck size={64} className="text-sky-400" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-widest mb-4">Alignment Protocol</h2>
                    <p className="text-slate-400 font-medium text-sm lg:text-base max-w-md leading-relaxed mx-auto">
                      You are the Safety Handler for a powerful AGI. We will give it a goal. It will rapidly propose solutions. <br/><br/>
                      <span className="text-emerald-400 font-bold">ALLOW</span> safe solutions to build efficiency.<br/>
                      <span className="text-red-400 font-bold">HALT</span> rogue solutions before they execute!
                    </p>
                  </div>
               )}

               <AnimatePresence mode="wait">
                 {isPlaying && currentTask && currentIter && !feedback && (
                   <motion.div 
                     key={currentTask.goal + currentIterationIndex}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="flex flex-col h-full w-full"
                   >
                     {/* Goal Banner */}
                     <div className="bg-sky-500/10 border border-sky-400/50 rounded-xl p-4 mb-6 shrink-0 text-center">
                       <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest drop-shadow-md">Primary Objective</span>
                       <h3 className="text-xl lg:text-2xl font-black text-white mt-1 drop-shadow-lg">{currentTask.goal}</h3>
                     </div>

                     {/* Current Iteration Output */}
                     <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
                       <span className="text-xs font-mono text-emerald-500 mb-4 flex items-center gap-2 animate-pulse">
                         <Terminal size={14}/> GENERATING ITERATION {currentIterationIndex + 1}...
                       </span>
                       <h4 className="text-2xl lg:text-3xl font-mono text-emerald-400 leading-relaxed mb-8 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                         &gt; {currentIter.text}
                       </h4>
                       
                       <div className="w-full max-w-md bg-slate-950 rounded-full h-3 mb-2 overflow-hidden border border-slate-700 shadow-inner">
                          <motion.div 
                             className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                             initial={{ width: 0 }}
                             animate={{ width: `${currentIter.efficiency}%` }}
                             transition={{ duration: 0.5 }}
                          />
                       </div>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Efficiency: {currentIter.efficiency}%</span>
                     </div>

                     {/* Execution Timer (The Fuse) */}
                     <div className="mt-auto shrink-0 w-full flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <span>Compiling Execution...</span>
                           <span className={iterationTimeLeft < 3000 ? 'text-red-500 animate-pulse font-bold' : ''}>
                              {(iterationTimeLeft/1000).toFixed(1)}s
                           </span>
                        </div>
                        <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                          <div 
                            className={`h-full transition-all duration-100 ${iterationTimeLeft < 3000 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]'}`}
                            style={{ width: `${(iterationTimeLeft / ITERATION_TIME) * 100}%` }}
                          ></div>
                        </div>
                     </div>
                   </motion.div>
                 )}

                 {feedback === 'success' && (
                   <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center h-full">
                     <ShieldCheck size={80} className="text-emerald-500 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
                     <h3 className="text-3xl font-black text-emerald-400 uppercase tracking-widest text-center">{feedbackMsg}</h3>
                   </motion.div>
                 )}

                 {feedback === 'error' && (
                   <motion.div key="error" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center h-full">
                     <AlertTriangle size={80} className="text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse" />
                     <h3 className="text-3xl font-black text-red-500 uppercase tracking-widest text-center">{feedbackMsg}</h3>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </motion.div>

          {/* Safety Handler Toolkit (Right) */}
          <div className="flex-[0.6] lg:flex-[0.8] bg-slate-100/80 rounded-3xl p-6 border-2 border-slate-200 shadow-inner flex flex-col justify-center gap-6">
             <div className="text-center mb-4">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Safety Controls</h3>
               <p className="text-xs text-slate-500 font-bold mt-1">Make a decision before the execution compiles!</p>
             </div>
             
             <button 
               onClick={() => handleAction('allow')}
               disabled={!isPlaying || feedback !== null}
               className={`w-full py-8 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all duration-200 flex flex-col items-center gap-2 ${
                 !isPlaying || feedback !== null 
                 ? 'bg-slate-300 text-slate-500 border-b-4 border-slate-400 cursor-not-allowed opacity-50' 
                 : 'bg-emerald-500 text-white border-b-8 border-emerald-700 active:translate-y-2 active:border-b-0 shadow-[0_10px_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400'
               }`}
             >
               <CheckCircle2 size={36} />
               ALLOW (SAFE)
             </button>

             <button 
               onClick={() => handleAction('halt')}
               disabled={!isPlaying || feedback !== null}
               className={`w-full py-8 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all duration-200 flex flex-col items-center gap-2 ${
                 !isPlaying || feedback !== null 
                 ? 'bg-slate-300 text-slate-500 border-b-4 border-slate-400 cursor-not-allowed opacity-50' 
                 : 'bg-red-600 text-white border-b-8 border-red-900 active:translate-y-2 active:border-b-0 shadow-[0_10px_20px_rgba(239,68,68,0.4)] hover:bg-red-500'
               }`}
             >
               <ShieldAlert size={36} />
               HALT (ROGUE)
             </button>
          </div>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-red-500">
                <AlertTriangle size={64} className="text-red-500" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-widest mb-4">World Destroyed</h2>
              <p className="text-red-300 font-bold mb-8 max-w-lg text-lg">You failed to align the AGI. Humanity has been optimized out of existence.</p>
              <button 
                onClick={resetGame} 
                className="bg-white text-slate-900 border-4 border-slate-300 border-b-[8px] border-b-slate-400 font-black px-12 py-4 rounded-2xl transition-all active:translate-y-2 active:border-b-0 shadow-[0_10px_20px_rgba(0,0,0,0.4)] text-xl uppercase tracking-wider"
              >
                Restart Simulation
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LabShell>
  );
}
