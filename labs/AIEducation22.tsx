"use client";
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  BookOpen, Video, Box, Gamepad2, Headphones, 
  MessageSquare, Layers, Swords, User, Brain,
  Activity, ShieldAlert, CheckCircle2, Info, Target, Zap,
  Users, Terminal
} from "lucide-react";

type Step = 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'BATCH_SCALE' | 'OUTCOME';

type ContentBlock = {
  id: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  iconClass: string;
  bgClass: string;
  borderClass: string;
  traits: string[]; // e.g., 'visual', 'text', 'active', 'challenge', 'audio', 'guided'
};

const BLOCKS: ContentBlock[] = [
  { id: 'textbook', icon: <BookOpen size={20} strokeWidth={2.5}/>, label: 'Textbook', desc: 'Detailed comprehensive reading.', iconClass: 'text-slate-500', bgClass: 'bg-slate-100', borderClass: 'hover:border-slate-400', traits: ['text', 'passive'] },
  { id: 'video', icon: <Video size={20} strokeWidth={2.5}/>, label: 'Video Lecture', desc: 'Visual explanation.', iconClass: 'text-sky-500', bgClass: 'bg-sky-50', borderClass: 'hover:border-sky-400', traits: ['visual', 'passive'] },
  { id: 'interactive', icon: <Box size={20} strokeWidth={2.5}/>, label: '3D Interactive', desc: 'Visual hands-on model.', iconClass: 'text-emerald-500', bgClass: 'bg-emerald-50', borderClass: 'hover:border-emerald-400', traits: ['visual', 'active'] },
  { id: 'quiz', icon: <Gamepad2 size={20} strokeWidth={2.5}/>, label: 'Gamified Quiz', desc: 'Fast-paced assessment.', iconClass: 'text-indigo-500', bgClass: 'bg-indigo-50', borderClass: 'hover:border-indigo-400', traits: ['active', 'engagement'] },
  { id: 'podcast', icon: <Headphones size={20} strokeWidth={2.5}/>, label: 'Podcast', desc: 'Auditory summary.', iconClass: 'text-amber-500', bgClass: 'bg-amber-50', borderClass: 'hover:border-amber-400', traits: ['audio', 'passive'] },
  { id: 'tutor', icon: <MessageSquare size={20} strokeWidth={2.5}/>, label: 'AI Chat Tutor', desc: '1-on-1 guidance.', iconClass: 'text-purple-500', bgClass: 'bg-purple-50', borderClass: 'hover:border-purple-400', traits: ['guided', 'active'] },
  { id: 'flashcards', icon: <Layers size={20} strokeWidth={2.5}/>, label: 'Flashcards', desc: 'Repetition & memorization.', iconClass: 'text-orange-500', bgClass: 'bg-orange-50', borderClass: 'hover:border-orange-400', traits: ['guided', 'repetition'] },
  { id: 'challenge', icon: <Swords size={20} strokeWidth={2.5}/>, label: 'Hard Problem', desc: 'Advanced difficulty.', iconClass: 'text-rose-500', bgClass: 'bg-rose-50', borderClass: 'hover:border-rose-400', traits: ['challenge', 'active'] },
  { id: 'peer_chat', icon: <Users size={20} strokeWidth={2.5}/>, label: 'Peer Discussion', desc: 'Collaborative group work.', iconClass: 'text-teal-500', bgClass: 'bg-teal-50', borderClass: 'hover:border-teal-400', traits: ['active', 'engagement', 'audio'] },
  { id: 'sandbox', icon: <Terminal size={20} strokeWidth={2.5}/>, label: 'Code Sandbox', desc: 'Open practice.', iconClass: 'text-fuchsia-500', bgClass: 'bg-fuchsia-50', borderClass: 'hover:border-fuchsia-400', traits: ['challenge', 'active', 'visual'] },
];

export default function AiEducation22() {
  const { reportComplete } = useLMSBridge("aieducation22");
  const { playPop, playZap, playError, playSuccess, playChime, playClick, playHeavyThud } = useLabAudio();

  const [step, setStep] = useState<Step>('LEARN');
  const [activeStudent, setActiveStudent] = useState(0);
  
  // Array of 3 slots
  const [curriculum, setCurriculum] = useState<(string | null)[]>([null, null, null]);
  const [isSimulating, setIsSimulating] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const STUDENTS = [
    {
      id: 'alex',
      name: 'Alex',
      profile: 'Visual learner. Overwhelmed by long reading. Needs high engagement.',
      needs: ['visual', 'active', 'engagement'],
      avoids: ['text']
    },
    {
      id: 'sam',
      name: 'Sam',
      profile: 'Highly advanced. Gets bored easily. Needs complex challenges.',
      needs: ['challenge', 'active'],
      avoids: ['passive']
    },
    {
      id: 'jordan',
      name: 'Jordan',
      profile: 'Auditory learner. Needs step-by-step guidance and repetition.',
      needs: ['audio', 'guided', 'repetition'],
      avoids: ['challenge']
    }
  ];

  // Calculate predicted mastery based on current blocks in curriculum
  const calculateMastery = (path: (string | null)[], studentIdx: number) => {
    let score = 20; // Base score
    const student = STUDENTS[studentIdx];
    
    path.forEach(blockId => {
      if (!blockId) return;
      const block = BLOCKS.find(b => b.id === blockId);
      if (!block) return;

      let blockScore = 10; // Base points for adding any content
      
      // Bonus for meeting needs
      block.traits.forEach(t => {
        if (student.needs.includes(t)) blockScore += 25;
      });

      // Penalty for hitting avoids
      block.traits.forEach(t => {
        if (student.avoids.includes(t)) blockScore -= 40;
      });

      score += blockScore;
    });

    return Math.max(5, Math.min(100, score)); // Clamp between 5% and 100%
  };

  const currentMastery = calculateMastery(curriculum, activeStudent);
  const isPathFull = curriculum.every(slot => slot !== null);

  const handleAddBlock = (blockId: string) => {
    if (playClick) playClick();
    setCurriculum(prev => {
      const next = [...prev];
      const emptyIdx = next.indexOf(null);
      if (emptyIdx !== -1) {
        next[emptyIdx] = blockId;
      }
      return next;
    });
  };

  const handleRemoveBlock = (index: number) => {
    if (playPop) playPop();
    setCurriculum(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const runSimulation = () => {
    if (playZap) playZap();
    setIsSimulating(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      setIsSimulating(false);

      if (step === 'TRY_MANUAL') {
        if (playError) playError();
        setStep('FAIL_OVERLOAD');
      } else if (step === 'IMPROVE' || step === 'BATCH_SCALE') {
        if (currentMastery >= 90) {
          if (playSuccess) playSuccess();
          if (activeStudent < 2) {
            // Move to next student
            setActiveStudent(prev => prev + 1);
            setCurriculum([null, null, null]);
            if (step === 'IMPROVE') setStep('BATCH_SCALE');
          } else {
            // Done!
            setStep('OUTCOME');
            setTimeout(() => {
              if (isMounted.current) {
                reportComplete();
                if (playChime) playChime();
              }
            }, 1000);
          }
        } else {
          if (playError) playError();
          // The error sound will play, and the simulation overlay will disappear.
          // The student will organically understand they need to keep swapping blocks to hit 90%.
        }
      }
    }, 2000);
  };

  const resetLab = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStep('LEARN');
    setActiveStudent(0);
    setCurriculum([null, null, null]);
    setIsSimulating(false);
    if (playPop) playPop();
  };

  // Derived state for the HUD
  let currentMission = 1;
  if (step === 'TRY_MANUAL') currentMission = 2;
  if (['FAIL_OVERLOAD', 'UNDERSTAND'].includes(step)) currentMission = 3;
  if (['IMPROVE', 'BATCH_SCALE'].includes(step)) currentMission = 4;
  if (step === 'OUTCOME') currentMission = 5;

  return (
    <LabShell
      labId="aieducation22"
      title="Learning Path Optimizer"
      instruction="Act as an AI Curriculum Architect to personalize learning paths using adaptive matching."
      bgOverride="bg-gradient-to-b from-sky-50 via-white to-slate-100"
      compact={true}
      onReset={resetLab}
    >
      <Celebration
        isActive={step === 'OUTCOME'}
        message="System Optimized! The AI accurately predicted and generated the perfect learning path for all students, maximizing their mastery."
        onReplay={resetLab}
      />

      <div className="flex flex-col h-full relative z-10 max-w-6xl mx-auto w-full pt-2 lg:pt-4">
        
        {/* COMBINED HUD & BRIEFING TO SAVE VERTICAL SPACE */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full max-w-5xl mx-auto shrink-0 mb-3 z-20">
          
          {/* Mission HUD (Compact) */}
          <div className="bg-white border-[3px] border-slate-200/70 shadow-lg shadow-sky-900/5 rounded-xl px-2 py-1.5 flex items-center gap-1 overflow-x-auto lg:w-[350px] shrink-0">
            {[
              { id: 1, title: "1. Briefing" },
              { id: 2, title: "2. Standard" },
              { id: 3, title: "3. Overload" },
              { id: 4, title: "4. Optimize" },
              { id: 5, title: "5. Scale" }
            ].map((m) => (
              <div
                key={m.id}
                className={`flex-1 text-center py-1 px-1 rounded-md text-[9px] font-bold transition-colors whitespace-nowrap ${
                  currentMission === m.id
                    ? "bg-slate-800 text-sky-300 border-2 border-slate-900 shadow-inner"
                    : currentMission > m.id
                    ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                    : "bg-slate-50 text-slate-400 border-2 border-slate-100"
                }`}
              >
                {m.title}
              </div>
            ))}
          </div>

          {/* Mission Briefing Panel (Compact) */}
          <div className={`flex-1 bg-white/90 backdrop-blur-sm border-y border-r border-l-[6px] rounded-xl shadow-md px-3 py-2 flex items-center gap-3 transition-colors duration-300 min-w-0 ${
            ['FAIL_OVERLOAD'].includes(step) ? 'border-l-rose-500 border-y-rose-200 border-r-rose-200 bg-rose-50/30' :
            ['OUTCOME'].includes(step) ? 'border-l-emerald-500 border-y-emerald-200 border-r-emerald-200 bg-emerald-50/30' :
            ['UNDERSTAND'].includes(step) ? 'border-l-amber-500 border-y-amber-200 border-r-amber-200 bg-amber-50/30' :
            'border-l-sky-500 border-y-slate-200 border-r-slate-200'
          }`}>
            <div className={`p-1.5 rounded-lg shrink-0 ${
              ['FAIL_OVERLOAD'].includes(step) ? 'bg-rose-100 text-rose-600' :
              ['OUTCOME'].includes(step) ? 'bg-emerald-100 text-emerald-600' :
              ['UNDERSTAND'].includes(step) ? 'bg-amber-100 text-amber-600' :
              'bg-sky-100 text-sky-600'
            }`}>
              {['FAIL_OVERLOAD'].includes(step) ? <ShieldAlert size={18} /> :
               ['OUTCOME'].includes(step) ? <CheckCircle2 size={18} /> :
               ['UNDERSTAND'].includes(step) ? <Brain size={18} /> :
               <Info size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              {step === 'LEARN' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-sky-900 uppercase tracking-wide mr-2">System Briefing</strong> 
                  Traditional classrooms use one "Standard Curriculum" for everyone. Let's test that theory.
                </p>
              )}
              {step === 'TRY_MANUAL' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-sky-900 uppercase tracking-wide mr-2">Mission 2</strong> 
                  Assign Alex the standard path: <strong className="text-slate-900">Textbook → Flashcards → Hard Problem</strong>.
                </p>
              )}
              {step === 'FAIL_OVERLOAD' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-rose-900 uppercase tracking-wide mr-2">Mission 3</strong> 
                  The standard curriculum failed. Format mismatch caused Cognitive Overload.
                </p>
              )}
              {step === 'UNDERSTAND' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-amber-900 uppercase tracking-wide mr-2">AI Insight</strong> 
                  Alex is a <strong className="text-amber-700">Visual Learner</strong>. Mismatch detected. We must optimize.
                </p>
              )}
              {step === 'IMPROVE' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-sky-900 uppercase tracking-wide mr-2">Mission 4</strong> 
                  Rebuild Alex's path using optimal blocks. Watch the AI Live Prediction meter!
                </p>
              )}
              {step === 'BATCH_SCALE' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-sky-900 uppercase tracking-wide mr-2">Mission 5</strong> 
                  Build optimal paths for Student 2 (Sam) and Student 3 (Jordan).
                </p>
              )}
              {step === 'OUTCOME' && (
                <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">
                  <strong className="text-emerald-900 uppercase tracking-wide mr-2">System Optimized</strong> 
                  All students achieved high mastery through personalized, AI-driven pathways!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* WORKSTATION VIEW (Strict Min-H-0 to prevent vertical blowout) */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row items-stretch gap-4 w-full z-10 pb-2">
          
          {/* STUDENT PROFILE (LEFT) */}
          <div className="flex-[1.2] min-w-0 bg-white border-[6px] border-b-[12px] border-slate-200 rounded-2xl shadow-xl flex flex-col relative z-20 overflow-hidden">
            <div className="bg-slate-100 border-b-4 border-slate-200 py-2.5 px-4 flex items-center justify-between shrink-0">
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <User size={16}/> STUDENT PROFILE ({activeStudent + 1} OF 3)
              </span>
            </div>
            
            <div className="flex-1 min-h-0 p-4 flex flex-col overflow-y-auto">
              
              <div className="flex items-start gap-3 mb-4 bg-slate-50 p-3 rounded-xl border-2 border-slate-100 shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border-2 border-indigo-200">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider truncate">{STUDENTS[activeStudent].name}</h2>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5 leading-snug">{STUDENTS[activeStudent].profile}</p>
                </div>
              </div>

              {/* LIVE PREDICTION METERS (Only show during Improve/Scale) */}
              <div className={`mb-4 p-3 rounded-xl border-2 transition-all duration-500 shrink-0 ${
                ['IMPROVE', 'BATCH_SCALE', 'OUTCOME'].includes(step) 
                  ? 'bg-slate-900 border-slate-800 shadow-inner' 
                  : 'hidden'
              }`}>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity size={14} className={currentMastery >= 90 ? 'text-emerald-400' : currentMastery < 40 ? 'text-rose-400' : 'text-amber-400'} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Predicted Mastery</span>
                  </div>
                  <span className={`text-lg font-black leading-none ${currentMastery >= 90 ? 'text-emerald-400' : currentMastery < 40 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {currentMastery}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${currentMastery}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className={`h-full rounded-full ${
                      currentMastery >= 90 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
                      currentMastery < 40 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 
                      'bg-amber-500'
                    }`}
                  />
                </div>
              </div>

              {/* CURRICULUM RECEPTACLES */}
              <div className="flex-1 flex flex-col justify-end min-h-0 shrink-0">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Curriculum Path</div>
                
                <div className="flex justify-between gap-2 bg-slate-100 p-3 rounded-xl border-[3px] border-slate-200 shadow-inner relative">
                  
                  {isSimulating && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-30 rounded-lg flex flex-col items-center justify-center">
                      <Zap size={24} className="text-cyan-400 animate-pulse mb-2" />
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">Running Neural Simulation...</span>
                    </div>
                  )}

                  {[0, 1, 2].map((slot) => {
                    const blockId = curriculum[slot];
                    const block = blockId ? BLOCKS.find(b => b.id === blockId) : null;
                    
                    return (
                      <div key={slot} className="flex-1 max-w-[100px] aspect-square bg-slate-900 border-4 border-slate-800 rounded-xl shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative cursor-pointer hover:border-rose-500 transition-colors group" onClick={() => block && handleRemoveBlock(slot)}>
                        
                        {!block && (
                          <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest text-center px-1">Empty Slot</div>
                        )}

                        <AnimatePresence>
                          {block && (
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              className={`absolute inset-1 rounded-lg bg-white border-2 border-slate-200 flex flex-col items-center justify-center shadow-md`}
                            >
                              <div className={`mb-0.5 p-1.5 rounded-lg shadow-inner ${block.bgClass} ${block.iconClass}`}><React.Fragment>{block.icon}</React.Fragment></div>
                              <div className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider text-center leading-tight px-0.5">{block.label}</div>
                              
                              <div className="absolute inset-0 bg-rose-500/90 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Remove</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-center">
                  {step === 'LEARN' && (
                    <button onClick={() => {
                      if (playClick) playClick();
                      setStep('TRY_MANUAL');
                    }} className="w-full max-w-[240px] bg-sky-600 hover:bg-sky-500 text-white border-b-[4px] border-sky-800 active:border-b-0 active:translate-y-1 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-[11px] tracking-widest shadow-[0_0_15px_rgba(2,132,199,0.3)]">
                      Initialize Builder
                    </button>
                  )}
                  {step === 'FAIL_OVERLOAD' && (
                    <button onClick={() => {
                      if (playClick) playClick();
                      setStep('UNDERSTAND');
                    }} className="w-full max-w-[240px] bg-amber-500 hover:bg-amber-400 text-amber-950 border-b-[4px] border-amber-700 active:border-b-0 active:translate-y-1 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-[11px] tracking-widest shadow-lg">
                      <Brain size={16} /> Analyze Failure
                    </button>
                  )}
                  {step === 'UNDERSTAND' && (
                    <button onClick={() => {
                      if (playClick) playClick();
                      setCurriculum([null, null, null]);
                      setStep('IMPROVE');
                    }} className="w-full max-w-[240px] bg-emerald-600 hover:bg-emerald-500 text-white border-b-[4px] border-emerald-800 active:border-b-0 active:translate-y-1 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all uppercase text-[11px] tracking-widest shadow-lg">
                      <Zap size={16} /> Enable AI Core
                    </button>
                  )}
                  {(step === 'TRY_MANUAL' || step === 'IMPROVE' || step === 'BATCH_SCALE' || step === 'OUTCOME') && (
                    <button 
                      onClick={runSimulation}
                      disabled={!isPathFull || isSimulating} 
                      className={`w-full max-w-[240px] py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-b-[4px] flex justify-center items-center gap-2 ${
                        !isPathFull
                        ? 'bg-slate-200 text-slate-400 border-slate-300'
                        : step === 'TRY_MANUAL'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-800 active:border-b-0 active:translate-y-1 shadow-[0_0_15px_rgba(225,29,72,0.3)] animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800 active:border-b-0 active:translate-y-1 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                      }`}
                    >
                      <Target size={16} /> Run Simulation
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI CONTENT LIBRARY (RIGHT) */}
          <div className="flex-1 lg:flex-[0.8] min-w-0 bg-slate-50 border-[6px] border-b-[12px] border-slate-200 rounded-2xl shadow-xl flex flex-col relative z-20 overflow-hidden">
             <div className="bg-slate-100 border-b-4 border-slate-200 py-2.5 px-4 flex items-center justify-between shrink-0">
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <Box size={16}/> CONTENT LIBRARY
              </span>
            </div>

            <div className="flex-1 min-h-0 p-2.5 overflow-hidden">
              <div className="grid grid-cols-2 grid-rows-5 gap-1.5 h-full">
                {BLOCKS.map(block => {
                  const isUsed = curriculum.includes(block.id);
                  return (
                    <button
                      key={block.id}
                      disabled={isUsed || isPathFull || ['LEARN', 'FAIL_OVERLOAD', 'UNDERSTAND'].includes(step)}
                      onClick={() => handleAddBlock(block.id)}
                      className={`flex flex-col items-center justify-center rounded-xl border-[3px] transition-all min-h-0 ${
                        isUsed || ['LEARN', 'FAIL_OVERLOAD', 'UNDERSTAND'].includes(step)
                          ? 'border-slate-200 bg-slate-100 opacity-40 cursor-not-allowed'
                          : isPathFull
                          ? 'border-slate-200 bg-white opacity-40 cursor-not-allowed'
                          : `border-slate-200 bg-white ${block.borderClass} hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`
                      }`}
                    >
                      <div className={`mb-0.5 p-1 rounded-lg ${block.bgClass} ${block.iconClass}`}><React.Fragment>{block.icon}</React.Fragment></div>
                      <div className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider text-center leading-tight line-clamp-1 px-1">
                        {block.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}

