"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  BookOpen, PlaySquare, Box, Gamepad2, Headphones, 
  MessageSquare, Layers, Swords, CheckCircle2, XCircle, ArrowRight,
  User, GraduationCap, Laptop
} from "lucide-react";

// Types
type BlockId = 'pdf' | 'video' | '3d' | 'game' | 'audio' | 'tutor' | 'basics' | 'challenge';

interface ContentBlock {
  id: BlockId;
  label: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
}

const BLOCKS: ContentBlock[] = [
  { id: 'pdf', label: 'Long Textbook', icon: <BookOpen size={24} />, color: 'slate', desc: 'Detailed, comprehensive reading.' },
  { id: 'video', label: 'Video Lecture', icon: <PlaySquare size={24} />, color: 'blue', desc: 'Visual and auditory explanation.' },
  { id: '3d', label: '3D Interactive', icon: <Box size={24} />, color: 'emerald', desc: 'Highly visual hands-on model.' },
  { id: 'game', label: 'Gamified Quiz', icon: <Gamepad2 size={24} />, color: 'fuchsia', desc: 'Fun, fast-paced assessment.' },
  { id: 'audio', label: 'Podcast Summary', icon: <Headphones size={24} />, color: 'amber', desc: 'Screen-free auditory learning.' },
  { id: 'tutor', label: 'AI Chat Tutor', icon: <MessageSquare size={24} />, color: 'cyan', desc: 'Personalized 1-on-1 guidance.' },
  { id: 'basics', label: 'Flashcards', icon: <Layers size={24} />, color: 'orange', desc: 'Simple repetition and memorization.' },
  { id: 'challenge', label: 'Hard Problem', icon: <Swords size={24} />, color: 'red', desc: 'Advanced difficulty assessment.' }
];

interface StudentProfile {
  id: number;
  name: string;
  avatar: React.ReactNode;
  profile: string;
  requiredBlocks: BlockId[];
  errorMsg: string;
}

const STUDENTS: StudentProfile[] = [
  {
    id: 1,
    name: "Alex",
    avatar: <User size={40} className="text-sky-400" />,
    profile: "Alex is a highly visual learner who gets overwhelmed by reading long paragraphs. They love interactive activities.",
    requiredBlocks: ['3d', 'video', 'game'],
    errorMsg: "Alex got bored or overwhelmed! Make sure to only use visual and interactive content (no textbooks or audio)."
  },
  {
    id: 2,
    name: "Jordan",
    avatar: <GraduationCap size={40} className="text-fuchsia-400" />,
    profile: "Jordan is an advanced student who already knows the basics. They get bored easily and need to be pushed to their limits.",
    requiredBlocks: ['pdf', 'tutor', 'challenge'],
    errorMsg: "Jordan fell asleep! They don't need basic flashcards or games; give them comprehensive reading and challenging tasks."
  },
  {
    id: 3,
    name: "Taylor",
    avatar: <Laptop size={40} className="text-emerald-400" />,
    profile: "Taylor gets severe screen fatigue. They learn best by listening and using simple repetition rather than flashy visuals.",
    requiredBlocks: ['audio', 'tutor', 'basics'],
    errorMsg: "Taylor's eyes hurt from all the visuals! Stick to screen-free audio, simple repetition, and 1-on-1 chatting."
  }
];

export default function AIEducation22() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState<BlockId[]>([]);
  
  const [simulationState, setSimulationState] = useState<'building' | 'simulating' | 'success' | 'failure'>('building');
  const [win, setWin] = useState(false);

  const student = STUDENTS[currentIndex];

  const handleAddBlock = (id: BlockId) => {
    if (simulationState !== 'building') return;
    if (currentPath.length >= 3) return;
    
    if (playClick) playClick();
    setCurrentPath(prev => [...prev, id]);
  };

  const handleRemoveBlock = (index: number) => {
    if (simulationState !== 'building') return;
    if (playPop) playPop();
    setCurrentPath(prev => prev.filter((_, i) => i !== index));
  };

  const runSimulation = () => {
    if (currentPath.length < 3) return;
    if (playZap) playZap();
    setSimulationState('simulating');

    setTimeout(() => {
      // Check if selected blocks match required exactly (order doesn't matter)
      const isCorrect = currentPath.every(b => student.requiredBlocks.includes(b)) && 
                        student.requiredBlocks.every(b => currentPath.includes(b));
      
      if (isCorrect) {
        if (playSuccess) playSuccess();
        setSimulationState('success');
      } else {
        if (playError) playError();
        setSimulationState('failure');
      }
    }, 1500);
  };

  const nextStudent = () => {
    if (playClick) playClick();
    if (currentIndex + 1 >= STUDENTS.length) {
      setWin(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setCurrentPath([]);
      setSimulationState('building');
    }
  };

  const retryStudent = () => {
    if (playPop) playPop();
    setCurrentPath([]);
    setSimulationState('building');
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setCurrentPath([]);
    setSimulationState('building');
    setWin(false);
  };

  return (
    <LabShell
      labId="aieducation22"
      title="Learning Path Optimizer"
      subtitle="AI Curriculum Architect"
      theme="cosmos"
      compact={true}
      onReset={resetGame}
      instruction="1. Understand how AI is used for content generation and personalized learning. 2. Input a student profile and learning objectives into the simulation. 3. Optimize the AI parameters to generate a customized learning path. 4. Evaluate the effectiveness of the path based on the simulated student's progress."
    >
      <Celebration isActive={win} onReplay={resetGame} message="You mastered Educational AI and built perfect personalized learning paths!" />

      {!win && student && (
        <div className="flex flex-col h-full w-full max-w-7xl mx-auto gap-5 p-4 relative">
          
          {/* Header Progress */}
          <div className="flex justify-between items-center bg-white rounded-xl p-3 border-2 border-slate-700/50 shadow-lg shrink-0">
             <div className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Layers className="text-sky-400" size={20} />
                Student {currentIndex + 1} of {STUDENTS.length}
             </div>
             
             {/* Progress dots */}
             <div className="flex gap-2">
                {STUDENTS.map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < currentIndex ? 'bg-sky-500' : i === currentIndex ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} />
                ))}
             </div>
          </div>

          <div className="flex flex-1 gap-4 min-h-0">
            
            {/* Left Column: Student & Path */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              
              {/* Student Profile */}
              <div className="bg-white rounded-2xl border-2 border-slate-700/50 p-4 shadow-xl shrink-0">
                <div className="flex gap-4 items-center mb-2">
                  <div className="bg-slate-100 p-2 rounded-xl border border-slate-200">{student.avatar}</div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">{student.name}</h2>
                    <div className="text-xs font-bold text-sky-600 uppercase tracking-widest">AI Learner Profile</div>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{student.profile}</p>
              </div>

              {/* Learning Path Builder */}
              <div className="bg-white rounded-2xl border-2 border-slate-700/50 p-4 shadow-xl flex-1 flex flex-col relative overflow-hidden">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 text-center">
                  Custom Curriculum Path (Select 3)
                </div>
                
                <div className="flex items-center justify-center gap-2 flex-1">
                  {[0, 1, 2].map((slot) => {
                    const blockId = currentPath[slot];
                    const block = blockId ? BLOCKS.find(b => b.id === blockId) : null;
                    
                    return (
                      <div key={slot} className="flex items-center gap-2">
                        <div 
                          onClick={() => block && handleRemoveBlock(slot)}
                          className={`w-28 h-28 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                            block 
                              ? `border-${block.color}-500 bg-${block.color}-100 cursor-pointer hover:bg-red-100 hover:border-red-500 group` 
                              : 'border-dashed border-slate-300 bg-slate-100'
                          }`}
                        >
                          {block ? (
                            <>
                              <div className={`mb-2 text-${block.color}-600 group-hover:hidden`}>{block.icon}</div>
                              <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center px-1 group-hover:hidden">{block.label}</div>
                              <div className="hidden group-hover:flex flex-col items-center text-red-600">
                                <XCircle size={24} className="mb-1" />
                                <span className="text-[10px] font-black uppercase">Remove</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Empty</div>
                          )}
                        </div>
                        
                        {slot < 2 && (
                          <ArrowRight className="text-slate-600" size={24} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center mt-4">
                  <button 
                    onClick={runSimulation}
                    disabled={currentPath.length < 3 || simulationState !== 'building'}
                    className={`px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
                      currentPath.length < 3 || simulationState !== 'building'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:scale-105 shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                    }`}
                  >
                    Run AI Simulation
                  </button>
                </div>

                {/* Simulation Overlays */}
                <AnimatePresence>
                  {simulationState === 'simulating' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                       <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                       <div className="text-sky-400 font-bold uppercase tracking-widest animate-pulse">Running AI Model...</div>
                    </motion.div>
                  )}
                  {simulationState === 'success' && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                       <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
                       <h3 className="text-3xl font-black text-emerald-400 uppercase tracking-widest mb-2">A+ Grade!</h3>
                       <p className="text-emerald-100 mb-6 font-bold">Perfect! This learning path exactly matches {student.name}'s profile.</p>
                       <button onClick={nextStudent} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest shadow-lg">Next Student</button>
                    </motion.div>
                  )}
                  {simulationState === 'failure' && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-red-950/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                       <XCircle size={64} className="text-red-500 mb-4" />
                       <h3 className="text-3xl font-black text-red-400 uppercase tracking-widest mb-2">Learning Failed</h3>
                       <p className="text-red-100 mb-6 font-bold max-w-sm">{student.errorMsg}</p>
                       <button onClick={retryStudent} className="bg-red-600 hover:bg-red-500 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest shadow-lg">Redesign Path</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Right Column: Content Bank */}
            <div className="w-[460px] bg-white rounded-2xl border-2 border-slate-700/50 p-4 shadow-xl shrink-0 flex flex-col">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 text-center">
                AI Content Blocks
              </div>
              
              <div className="grid grid-cols-2 gap-3 overflow-hidden flex-1 content-start">
                {BLOCKS.map(block => {
                  const isUsed = currentPath.includes(block.id);
                  return (
                    <button
                      key={block.id}
                      disabled={isUsed || simulationState !== 'building' || currentPath.length >= 3}
                      onClick={() => handleAddBlock(block.id)}
                      className={`w-full flex items-center p-2 rounded-xl border-2 transition-all text-left min-h-[72px] ${
                        isUsed 
                          ? 'border-slate-300 bg-slate-100 opacity-50 cursor-not-allowed'
                          : `border-slate-300 bg-white hover:border-${block.color}-500 hover:bg-slate-50`
                      }`}
                    >
                      <div className={`mr-2.5 p-2 rounded-lg bg-slate-100 shrink-0 ${isUsed ? 'text-slate-400' : `text-${block.color}-600`}`}>
                        {block.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{block.label}</div>
                        <div className="text-[9px] text-slate-600 leading-snug mt-1">{block.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
          </div>

        </div>
      )}
    </LabShell>
  );
}
