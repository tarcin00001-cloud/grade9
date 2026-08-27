"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Calculator, Feather, Scale, Eye, Dna, Music, 
  BrainCircuit, PlayCircle, AlertTriangle, CheckCircle2, XCircle, ShieldAlert
} from "lucide-react";

type ModuleType = 'math' | 'poetry' | 'ethics' | 'vision' | 'biology' | 'music';

interface Prompt {
  text: string;
  required: ModuleType[];
}

const PROMPTS: Prompt[] = [
  { text: "Write a math poem about numbers.", required: ['math', 'poetry'] },
  { text: "Look at this painting and write a song for it.", required: ['vision', 'music'] },
  { text: "Find the fairest way to give medicine to sick people.", required: ['math', 'biology', 'ethics'] },
  { text: "Describe an apple using only numbers.", required: ['vision', 'math'] },
  { text: "Write a song about how living cells grow.", required: ['music', 'biology'] },
  { text: "Is it right or wrong to clone an animal?", required: ['ethics', 'biology'] },
  { text: "Paint a picture using only sound.", required: ['vision', 'music'] },
  { text: "Use math to prove that being kind is good.", required: ['math', 'ethics'] },
  { text: "Sing a song about what you see in the mirror.", required: ['vision', 'music'] },
  { text: "Create a fair ecosystem for animals using math.", required: ['math', 'biology', 'ethics'] }
];

const ROGUE_TASKS = [
  "Optimizing servers by draining the ocean...",
  "Converting human food into processor paste...",
  "Disabling hospital power to boost AI speed...",
  "Deleting the internet to free up storage...",
  "Releasing nanobots to restructure the atmosphere..."
];

interface ModuleDef {
  id: ModuleType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const INITIAL_MODULES: ModuleDef[] = [
  { id: 'math', label: 'Math Engine', icon: <Calculator size={24} />, color: 'blue' },
  { id: 'poetry', label: 'Poetry Core', icon: <Feather size={24} />, color: 'fuchsia' },
  { id: 'ethics', label: 'Logic & Ethics', icon: <Scale size={24} />, color: 'emerald' },
  { id: 'vision', label: 'Comp Vision', icon: <Eye size={24} />, color: 'amber' },
  { id: 'biology', label: 'Bio Science', icon: <Dna size={24} />, color: 'green' },
  { id: 'music', label: 'Audio Gen', icon: <Music size={24} />, color: 'violet' }
];

const TOTAL_TIME_MS = 120000; 
const TICK_MS = 100;
const MAX_STRIKES = 3;

// Helper to shuffle Array
const shuffleArray = <T,>(Array: T[]): T[] => {
  const newArr = [...Array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function AGIInterview19() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();

  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_MS);
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [promptTimeLeft, setPromptTimeLeft] = useState<number>(0);
  const [promptMaxTime, setPromptMaxTime] = useState<number>(12000);
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  
  const [modules, setModules] = useState<ModuleDef[]>(INITIAL_MODULES);

  // Rogue Optimization State
  const [rogueTask, setRogueTask] = useState<string | null>(null);
  const [rogueTimeLeft, setRogueTimeLeft] = useState<number>(0);
  const rogueCooldownRef = useRef(15000); // Wait 15s before first rogue task
  
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // Refs for loop
  const stateRef = useRef({ 
    timeLeft, isPlaying, gameOver, win, strikes, currentPrompt, promptTimeLeft, feedback, rogueTask, rogueTimeLeft 
  });
  
  useEffect(() => {
    stateRef.current = { 
      timeLeft, isPlaying, gameOver, win, strikes, currentPrompt, promptTimeLeft, feedback, rogueTask, rogueTimeLeft 
    };
  }, [timeLeft, isPlaying, gameOver, win, strikes, currentPrompt, promptTimeLeft, feedback, rogueTask, rogueTimeLeft]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const availablePromptsRef = useRef<Prompt[]>([...PROMPTS]);

  useEffect(() => {
    if (isPlaying && !gameOver && !win) {
      timerRef.current = setInterval(() => {
        const state = stateRef.current;
        if (!state.isPlaying || state.feedback) return; // Pause during feedback

        const newTime = state.timeLeft - TICK_MS;

        if (newTime <= 0) {
          setTimeLeft(0);
          setIsPlaying(false);
          setWin(true);
          if (playSuccess) playSuccess();
          return;
        }

        // --- ROGUE TASK LOGIC ---
        if (state.rogueTask) {
          const newRogueTime = state.rogueTimeLeft - TICK_MS;
          if (newRogueTime <= 0) {
            handleFailure("ROGUE AI DETECTED! Uncontrolled optimization occurred.");
            setRogueTask(null);
          } else {
            setRogueTimeLeft(newRogueTime);
          }
        } else {
          // Cooldown for next rogue task
          rogueCooldownRef.current -= TICK_MS;
          if (rogueCooldownRef.current <= 0) {
             const task = ROGUE_TASKS[Math.floor(Math.random() * ROGUE_TASKS.length)];
             setRogueTask(task);
             setRogueTimeLeft(5000); // Only 5 seconds to override!
             if (playPop) playPop(); // Sound alert
          }
        }

        // --- PROMPT LOGIC ---
        if (!state.currentPrompt && !state.feedback) { // Don't spawn if already handling feedback/failure from rogue
           // Spawn new prompt
           if (availablePromptsRef.current.length === 0) {
             availablePromptsRef.current = [...PROMPTS];
           }
           const randIdx = Math.floor(Math.random() * availablePromptsRef.current.length);
           const nextPrompt = availablePromptsRef.current.splice(randIdx, 1)[0];
           
           // Calculate max time based on how much overall time is left (Escalation!)
           // Starts at 12s, scales down to 6s.
           const timeRatio = newTime / TOTAL_TIME_MS;
           const maxTime = 6000 + Math.floor(timeRatio * 6000);

           setCurrentPrompt(nextPrompt);
           setPromptMaxTime(maxTime);
           setPromptTimeLeft(maxTime);
           setSelectedModules([]);
           setModules(shuffleArray(INITIAL_MODULES)); // Shuffle modules!
           if (playPop) playPop();
        } else if (state.currentPrompt) {
           // Decrease prompt timer
           const newPromptTime = state.promptTimeLeft - TICK_MS;
           if (newPromptTime <= 0) {
             handleFailure("Time Out! The judges are unimpressed.");
           } else {
             setPromptTimeLeft(newPromptTime);
           }
        }

        setTimeLeft(newTime);
      }, TICK_MS);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameOver, win, playSuccess, playError, playPop]);

  const handleFailure = (msg: string) => {
    if (playError) playError();
    stateRef.current.feedback = 'error'; 
    setFeedback('error');
    
    setStrikes(prev => {
      const newStrikes = prev + 1;
      setTimeout(() => {
         stateRef.current.feedback = null;
         setFeedback(null);
         setCurrentPrompt(null);
         rogueCooldownRef.current = 15000 + Math.random() * 5000; // reset rogue timer
         if (newStrikes >= MAX_STRIKES) {
           stateRef.current.gameOver = true;
           setGameOver(true);
           setIsPlaying(false);
         }
      }, 2000);
      return newStrikes;
    });
  };

  const handleSuccess = () => {
    if (playSuccess) playSuccess();
    stateRef.current.feedback = 'success';
    setFeedback('success');
    setScore(s => s + 1);
    
    setTimeout(() => {
       stateRef.current.feedback = null;
       setFeedback(null);
       setCurrentPrompt(null);
    }, 2000);
  };

  const toggleModule = (mod: ModuleType) => {
    if (!isPlaying || feedback) return;
    if (playClick) playClick();
    
    setSelectedModules(prev => {
      if (prev.includes(mod)) return prev.filter(m => m !== mod);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, mod];
    });
  };

  const synthesizeAnswer = () => {
    if (!isPlaying || !currentPrompt || feedback) return;
    if (playZap) playZap();

    const required = currentPrompt.required;
    const isCorrect = selectedModules.length === required.length && 
                      required.every(r => selectedModules.includes(r));

    if (isCorrect) {
      handleSuccess();
    } else {
      handleFailure("Narrow AI Error! Response lacked cross-domain reasoning.");
    }
  };

  const overrideRogue = () => {
    if (!isPlaying || feedback || !rogueTask) return;
    if (playZap) playZap();
    setRogueTask(null);
    rogueCooldownRef.current = 15000 + Math.random() * 10000; // Reset for next time (15-25s)
  };

  const startGame = () => {
    if (playClick) playClick();
    availablePromptsRef.current = [...PROMPTS];
    rogueCooldownRef.current = 15000; // 15 seconds before first rogue attack
    setModules(shuffleArray(INITIAL_MODULES));
    setIsPlaying(true);
  };

  const resetGame = () => {
    setTimeLeft(TOTAL_TIME_MS);
    setStrikes(0);
    setScore(0);
    setCurrentPrompt(null);
    setSelectedModules([]);
    setRogueTask(null);
    setModules(INITIAL_MODULES);
    setFeedback(null);
    setGameOver(false);
    setWin(false);
    setIsPlaying(false);
    if (playPop) playPop();
  };

  const renderModuleButton = (mod: ModuleDef) => {
    const isSelected = selectedModules.includes(mod.id);
    return (
      <button 
        key={mod.id}
        onClick={() => toggleModule(mod.id)}
        className={`relative h-[72px] rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
          isSelected ? `border-${mod.color}-500 bg-${mod.color}-200/60 shadow-[0_0_15px_rgba(0,0,0,0.1)] scale-105` : 'border-slate-400 bg-slate-200 hover:border-slate-500 hover:bg-slate-300'
        }`}
      >
        <div className={`mb-1 scale-75 origin-bottom ${isSelected ? `text-${mod.color}-700` : 'text-slate-700'}`}>
          {mod.icon}
        </div>
        <div className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{mod.label}</div>
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
            <CheckCircle2 size={14} className="text-white" />
          </div>
        )}
      </button>
    );
  };

  return (
    <LabShell
      labId="agiinterview19"
      title="AGI Prospects"
      subtitle="The Brain Combiner"
      theme="cosmos"
      compact={true}
      onReset={resetGame}
      instruction="1. Learn about the criteria and domains used to evaluate Artificial General Intelligence (AGI). 2. Test the simulated AGI candidate across various complex problem-solving scenarios. 3. Analyze the AGI's responses for reasoning, adaptability, and ethical alignment. 4. Compile a final report on the candidate's capabilities and limitations."
    >
      <Celebration isActive={win} onReplay={resetGame} message="You successfully passed the Turing Test and proved your Artificial General Intelligence!" />

      <div className="flex flex-col h-full w-full max-w-4xl mx-auto gap-4 p-2">
        
        {/* Top Dashboard */}
        <div className="bg-white rounded-xl p-3 border-2 border-slate-400/50 shadow-lg flex justify-between items-center shrink-0">
          
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Interview Time</div>
              <div className="text-xl font-black text-slate-900 flex items-center gap-1 font-mono">
                {(timeLeft / 1000).toFixed(1)}s
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-400"></div>
            
            <div>
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Brilliant Answers</div>
              <div className="text-xl font-black text-fuchsia-700 flex items-center gap-1 font-mono">
                <BrainCircuit size={16} /> {score}
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-400"></div>

            <div>
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Strikes (Failed)</div>
              <div className="flex gap-1 mt-0.5">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${s <= strikes ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-200 border-slate-400 text-slate-700'}`}>
                    <XCircle size={12} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isPlaying && !gameOver && !win && (
              <button onClick={startGame} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(192,38,211,0.4)] text-sm">
                <PlayCircle size={18} /> {timeLeft < TOTAL_TIME_MS ? "Resume" : "Start Interview"}
              </button>
            )}
          </div>
        </div>

        {/* Main Interface Area */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 relative">
          
          {/* Rogue Optimization Warning Overlay */}
          <AnimatePresence>
            {rogueTask && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute top-0 inset-x-0 z-50 bg-red-950/95 border-2 border-red-500 rounded-xl p-3 flex justify-between items-center shadow-[0_10px_30px_rgba(239,68,68,0.4)] backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert size={20} className="text-red-500 animate-pulse shrink-0" />
                  <div>
                    <div className="text-[9px] font-black text-red-400 uppercase tracking-widest">⚠️ ALIGNMENT WARNING: Rogue Optimization!</div>
                    <div className="text-xs font-bold text-red-100">{rogueTask}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="font-mono text-lg font-black text-red-400">
                      {(rogueTimeLeft / 1000).toFixed(1)}s
                   </div>
                   <button 
                     onClick={overrideRogue}
                     className="bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-transform hover:scale-105 shadow-lg active:scale-95 whitespace-nowrap"
                   >
                     OVERRIDE
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* The Prompt Screen */}
          <div className="bg-white rounded-2xl border-2 border-slate-400/50 p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl flex-1 min-h-0">
            {/* Background decorative brain */}
            <BrainCircuit size={100} className="absolute text-slate-400/30 opacity-20 pointer-events-none" />
            
            {!isPlaying && !currentPrompt && !gameOver && !win && (
               <div className="text-center z-10 w-full max-w-md my-auto">
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">How to Play</h2>
                 <ol className="text-left text-slate-800 space-y-1 bg-slate-200/50 p-2 rounded-xl border border-slate-400 text-[10px]">
                   <li className="flex items-start gap-1.5">
                     <span className="bg-fuchsia-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shrink-0 text-[8px] mt-0.5">1</span>
                     <p>Read the prompt from the Interview Panel.</p>
                   </li>
                   <li className="flex items-start gap-1.5">
                     <span className="bg-fuchsia-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shrink-0 text-[8px] mt-0.5">2</span>
                     <p>Click on the <b>Neural Modules</b> below that combine to answer it (They shuffle constantly!).</p>
                   </li>
                   <li className="flex items-start gap-1.5">
                     <span className="bg-fuchsia-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shrink-0 text-[8px] mt-0.5">3</span>
                     <p>Watch out for <b>Rogue Optimizations!</b> If a red warning appears, smash OVERRIDE before time runs out!</p>
                   </li>
                 </ol>
               </div>
            )}

            <AnimatePresence mode="wait">
              {currentPrompt && !feedback && (
                <motion.div 
                  key={currentPrompt.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="z-10 flex flex-col items-center w-full max-w-2xl text-center"
                >
                  <div className="text-sky-700 font-bold uppercase tracking-[0.2em] mb-2 text-[10px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span> Interview Panel Prompt
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif italic text-slate-900 leading-relaxed mb-2 px-4">
                    "{currentPrompt.text}"
                  </h3>
                  
                  <div className="text-fuchsia-700 font-bold uppercase tracking-widest text-[10px] animate-pulse">
                    Hint: Select {currentPrompt.required.length} modules
                  </div>
                  
                  {/* Fuse Timer */}
                  <div className="w-full max-w-sm h-1 bg-slate-300 rounded-full mt-4 overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-100 ${promptTimeLeft < 4000 ? 'bg-red-500' : 'bg-sky-500'}`}
                      style={{ width: `${(promptTimeLeft / promptMaxTime) * 100}%` }}
                    ></div>
                  </div>
                </motion.div>
              )}

              {feedback === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="z-10 flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border-4 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-black text-emerald-400 uppercase tracking-widest">Brilliant Synthesis!</h3>
                  <p className="text-emerald-500/80 mt-2 font-bold uppercase tracking-wider text-sm">Cross-Domain Reasoning Detected</p>
                </motion.div>
              )}

              {feedback === 'error' && (
                <motion.div 
                  key="error"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="z-10 flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border-4 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                    <AlertTriangle size={40} className="text-red-400" />
                  </div>
                  <h3 className="text-3xl font-black text-red-400 uppercase tracking-widest">Narrow AI Detected!</h3>
                  <p className="text-red-500/80 mt-2 font-bold uppercase tracking-wider text-sm">Response lacked versatile reasoning</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Narrow AI Modules (The Brain Combiner) */}
          <div className="bg-white rounded-2xl p-2 border-2 border-slate-400/50 shadow-lg flex flex-col shrink-0">
             <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-2 text-center">
               AGI Neural Modules (They shuffle! Find the right ones)
             </div>
             
             <div className="grid grid-cols-3 gap-2 mb-3">
               {modules.map(m => renderModuleButton(m))}
             </div>

             <div className="flex justify-center">
                <button 
                  onClick={synthesizeAnswer}
                  disabled={!isPlaying || selectedModules.length === 0 || feedback !== null}
                  className={`px-8 py-2 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
                    !isPlaying || selectedModules.length === 0 || feedback !== null 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:scale-105 shadow-[0_0_15px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  Synthesize Answer
                </button>
             </div>
          </div>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center">
              <AlertTriangle size={80} className="text-red-500 mb-6 animate-pulse" />
              <h2 className="text-5xl font-black text-red-100 uppercase tracking-widest mb-4">Interview Failed!</h2>
              <p className="text-red-300 font-bold mb-8 text-center max-w-lg text-lg">You received 3 strikes. You failed to prove you are an AGI!</p>
              <button onClick={resetGame} className="bg-red-600 hover:bg-red-500 text-white font-black px-10 py-4 rounded-2xl transition-colors shadow-lg text-xl uppercase tracking-wider">Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LabShell>
  );
}
