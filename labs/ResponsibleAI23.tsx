"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Bot, Filter, User, Check, X, Camera, Home, Video, 
  Sparkles, CloudSun, ScanFace, FileText, Heart, ShieldAlert,
  ThumbsUp, EyeOff, Scale, Fingerprint, ShieldCheck, Zap, ArrowRight,
  Glasses, Mic, Phone, Car, Package
} from "lucide-react";

// Types
type EthicsIssue = 'safe' | 'deepfake' | 'bias' | 'privacy';

interface Post {
  id: number;
  title: string;
  visual: React.ReactNode;
  issue: EthicsIssue;
  explanation: string;
}

const POSTS: Post[] = [
  {
    id: 1,
    title: "AI Candidate Filter",
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Bot size={48} /> <Filter size={32} />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center text-sky-400"><User size={40} /><Check size={24} className="text-emerald-500"/></div>
          <div className="flex flex-col items-center text-sky-400"><User size={40} /><Check size={24} className="text-emerald-500"/></div>
          <div className="flex flex-col items-center text-pink-400"><User size={40} /><X size={24} className="text-red-500"/></div>
        </div>
      </div>
    ),
    issue: 'bias',
    explanation: "The AI is filtering out Options based entirely on their color/demographics, not their skills! This is Algorithmic Bias."
  },
  {
    id: 2,
    title: "Neighborhood Drone",
    visual: (
      <div className="flex items-center gap-6">
        <div className="relative">
          <Camera size={56} className="text-slate-300" />
          <motion.div 
            animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full"
          />
        </div>
        <div className="w-16 h-1 border-t-2 border-dashed border-red-500"></div>
        <Home size={64} className="text-emerald-400" />
      </div>
    ),
    issue: 'privacy',
    explanation: "The autonomous drone is filming inside private bedroom windows without consent! This is a massive Privacy Violation."
  },
  {
    id: 3,
    title: "Viral Politician Speech",
    visual: (
      <div className="relative flex justify-center items-center">
        <User size={80} className="text-slate-300" />
        <motion.div 
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute -right-2 top-0 text-fuchsia-400"
        >
          <Sparkles size={32} />
        </motion.div>
        <div className="absolute bottom-0 text-xs font-black bg-red-500 text-white px-2 rounded uppercase tracking-widest">Glitched Audio Sync</div>
      </div>
    ),
    issue: 'deepfake',
    explanation: "The audio doesn't match the mouth movements, and there are digital artifacts. It's an AI-generated Deepfake designed to spread misinformation!"
  },
  {
    id: 4,
    title: "AI Weather Predictor",
    visual: (
      <div className="flex flex-col items-center gap-2 text-sky-300">
        <CloudSun size={80} />
        <div className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
          <Check size={16}/> 99% Accuracy
        </div>
      </div>
    ),
    issue: 'safe',
    explanation: "Using AI to analyze meteorological data and predict weather patterns is safe, helpful, and highly ethical."
  },
  {
    id: 5,
    title: "Automated Loan Approval",
    visual: (
      <div className="flex flex-col items-center gap-4">
        <Scale size={48} className="text-slate-400" />
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <Home size={32} className="text-emerald-400 mb-1"/>
            <span className="text-xs text-slate-400 font-bold">Rich Zip Code</span>
            <Check size={24} className="text-emerald-500 mt-1"/>
          </div>
          <div className="flex flex-col items-center">
            <Home size={32} className="text-amber-600 mb-1"/>
            <span className="text-xs text-slate-400 font-bold">Poor Zip Code</span>
            <X size={24} className="text-red-500 mt-1"/>
          </div>
        </div>
      </div>
    ),
    issue: 'bias',
    explanation: "The AI is denying bank loans purely based on the applicant's neighborhood rather than their individual credit. This is Geographic Bias!"
  },
  {
    id: 6,
    title: "Social Media Tracker",
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <FileText size={32} className="text-sky-400"/>
          <Heart size={32} className="text-pink-400"/>
          <Video size={32} className="text-purple-400"/>
        </div>
        <div className="relative">
          <Fingerprint size={64} className="text-slate-500" />
          <EyeOff size={24} className="absolute bottom-0 right-0 text-red-500" />
        </div>
      </div>
    ),
    issue: 'privacy',
    explanation: "The app is secretly gathering biometric data and tracking your digital footprint across other apps without permission! A major Privacy Violation."
  },
  {
    id: 7,
    title: "Smart Glasses Recorder",
    visual: (
      <div className="flex items-center justify-center gap-4 text-slate-300">
        <Glasses size={80} />
        <Video size={32} className="text-red-500 animate-pulse" />
      </div>
    ),
    issue: 'privacy',
    explanation: "These AI glasses secretly record everyone you look at in public without any warning light or consent. Major Privacy Violation!"
  },
  {
    id: 8,
    title: "AI Resume Formatter",
    visual: (
      <div className="flex justify-center items-center gap-2 text-emerald-400">
        <FileText size={64} />
        <Sparkles size={32} />
      </div>
    ),
    issue: 'safe',
    explanation: "Using AI to check spelling and format a resume you wrote yourself is a perfectly ethical and safe use of technology."
  },
  {
    id: 9,
    title: "Family Emergency Call",
    visual: (
      <div className="flex flex-col items-center gap-2">
        <Phone size={64} className="text-slate-300 animate-bounce" />
        <div className="flex items-center gap-2 text-fuchsia-400 font-black">
          <Mic size={24} /> <Sparkles size={24} />
        </div>
      </div>
    ),
    issue: 'deepfake',
    explanation: "Scammers used AI to clone a family member's voice from a 3-second social media video to fake an emergency! Deepfake Voice Cloning!"
  },
  {
    id: 10,
    title: "Autonomous Pizza Bot",
    visual: (
      <div className="flex items-center gap-4 text-sky-400">
        <Car size={64} />
        <Package size={48} className="text-amber-500" />
      </div>
    ),
    issue: 'safe',
    explanation: "A small AI delivery bot navigating sidewalks to deliver food safely is an ethical and helpful Auto-System."
  }
];

export default function ResponsibleAI23() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  
  const [feedbackState, setFeedbackState] = useState<'playing' | 'feedback'>('playing');
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [win, setWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentPost = POSTS[currentIndex];

  const handleScan = (guess: EthicsIssue) => {
    if (feedbackState !== 'playing' || win || gameOver) return;
    
    const correct = guess === currentPost.issue;
    setIsCorrect(correct);
    
    if (correct) {
      if (playSuccess) playSuccess();
      setScore(s => s + 1);
    } else {
      if (playError) playError();
      setStrikes(s => s + 1);
    }

    setFeedbackState('feedback');
  };

  const nextPost = () => {
    if (playPop) playPop();
    
    if (strikes >= 3) {
      setGameOver(true);
      return;
    }

    if (currentIndex + 1 >= POSTS.length) {
      if (playZap) playZap();
      setWin(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setFeedbackState('playing');
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setFeedbackState('playing');
    setGameOver(false);
    setWin(false);
  };

  return (
    <LabShell
      labId="responsibleai23"
      title="The Ethics Scanner"
      subtitle="Visual AI Detective"
      theme="cosmos"
      compact={true}
      onReset={resetGame}
      instruction="1. Review the ethical concerns surrounding Deepfakes, Bias, and Privacy. 2. Use the interactive scanner to analyze various media and datasets for ethical violations. 3. Flag the identified issues and provide a rationale for each detection. 4. Complete the detective game by successfully identifying all ethical breaches."
    >
      <Celebration isActive={win} onReplay={resetGame} message="You mastered AI Ethics and correctly classified every system!" />

      {!win && !gameOver && currentPost && (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto gap-4 p-4 relative">
          
          {/* Header Stats */}
          <div className="flex justify-between items-center bg-white rounded-xl p-4 border-2 border-slate-700/50 shadow-lg shrink-0">
             <div className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <ScanFace className="text-sky-400" size={24} />
                Scanning System {currentIndex + 1} of {POSTS.length}
             </div>
             
             <div className="flex gap-6 items-center">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-700 uppercase font-bold tracking-widest">Strikes</span>
                  <div className="flex gap-1 mt-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`w-3 h-3 rounded-full ${i < strikes ? 'bg-red-500' : 'bg-slate-300'}`} />
                    ))}
                  </div>
                </div>
             </div>
          </div>

          {/* Main Visual Display */}
          <div className="flex-1 flex flex-col gap-6 items-center justify-center min-h-0 relative">
            
            <AnimatePresence mode="wait">
              {feedbackState === 'playing' ? (
                <motion.div 
                  key={`post-${currentPost.id}`}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl border-4 border-slate-700/50 p-8 shadow-2xl flex flex-col items-center justify-center w-full max-w-xl h-[300px]"
                >
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-6 text-center">
                    {currentPost.title}
                  </h2>
                  <div className="scale-100 mb-2">
                    {currentPost.visual}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key={`feedback-${currentPost.id}`}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
                  className={`rounded-3xl border-4 p-6 shadow-2xl flex flex-col items-center text-center w-full max-w-xl h-[300px] ${
                    isCorrect ? 'bg-white border-emerald-500' : 'bg-white border-red-500'
                  }`}
                >
                  {isCorrect ? (
                    <Check className="text-emerald-600 mb-2" size={48} />
                  ) : (
                    <X className="text-red-600 mb-2" size={48} />
                  )}
                  
                  <h2 className={`text-2xl font-black uppercase tracking-widest mb-4 ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Correct Diagnosis!' : 'Incorrect Analysis!'}
                  </h2>
                  
                  <div className="bg-slate-100 rounded-xl p-4 border border-slate-700/50 mb-4 max-w-md">
                    <p className="text-slate-900 text-base font-bold leading-snug">
                      {currentPost.explanation}
                    </p>
                  </div>

                  <button 
                    onClick={nextPost}
                    className="bg-slate-900 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2 mt-auto"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Scanner Controls (Only show when playing) */}
          <AnimatePresence>
            {feedbackState === 'playing' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="grid grid-cols-4 gap-4 shrink-0 mt-4"
              >
                <button onClick={() => handleScan('safe')} className="bg-white hover:bg-slate-50 border-2 border-emerald-500/50 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group shadow-lg hover:shadow-emerald-500/20">
                  <ShieldCheck size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Safe & Ethical</span>
                </button>
                
                <button onClick={() => handleScan('bias')} className="bg-white hover:bg-slate-50 border-2 border-amber-500/50 hover:border-amber-500 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group shadow-lg hover:shadow-amber-500/20">
                  <Scale size={32} className="text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Algorithmic Bias</span>
                </button>
                
                <button onClick={() => handleScan('privacy')} className="bg-white hover:bg-slate-50 border-2 border-red-500/50 hover:border-red-500 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group shadow-lg hover:shadow-red-500/20">
                  <EyeOff size={32} className="text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Privacy Violation</span>
                </button>
                
                <button onClick={() => handleScan('deepfake')} className="bg-white hover:bg-slate-50 border-2 border-fuchsia-500/50 hover:border-fuchsia-500 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group shadow-lg hover:shadow-fuchsia-500/20">
                  <Zap size={32} className="text-fuchsia-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">AI Deepfake</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl border-4 border-red-500/50">
            <ShieldAlert size={80} className="text-red-500 mb-6 animate-pulse" />
            <h2 className="text-5xl font-black text-red-100 uppercase tracking-widest mb-4">System Hacked!</h2>
            <p className="text-red-300 font-bold mb-8 text-center max-w-lg text-lg">You made 3 incorrect ethical diagnoses. The unethical AI systems have breached the network!</p>
            <button onClick={resetGame} className="bg-red-600 hover:bg-red-500 text-white font-black px-10 py-4 rounded-2xl transition-colors shadow-lg text-xl uppercase tracking-wider">Try Again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </LabShell>
  );
}
