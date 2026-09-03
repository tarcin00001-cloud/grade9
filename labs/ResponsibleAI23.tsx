"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  ShieldCheck, ShieldAlert, Scale, EyeOff, ScanFace,
  Brain, FileText, Camera, Users, Image as ImageIcon,
  Mic, Activity, Map, Bot, UserX, AlertTriangle, Stamp, Search,
  VenetianMask, LockOpen, UserMinus, PhoneCall, Home, Baby, 
  Subtitles, HeartPulse, CloudRain, Newspaper
} from "lucide-react";

type Phase = "intro" | "playing" | "feedback" | "game_over" | "success";
type Category = "safe" | "bias" | "privacy" | "deepfake";

interface Case {
  id: number;
  title: string;
  description: string;
  category: Category;
  explanation: string;
  Visual: () => React.ReactNode;
}

const CASES: Case[] = [
  {
    id: 1,
    title: "AI Resume Screener v2.0",
    description: "An algorithm designed to filter job applications. It was trained on 10 years of historical hiring data from a male-dominated tech firm.",
    category: "bias",
    explanation: "Because the training data lacked diversity, the AI learned to unfairly downgrade resumes containing words associated with women.",
    Visual: () => (
      <div className="flex gap-4">
        <div className="w-16 h-20 bg-sky-50 border-2 border-sky-200 rounded flex flex-col items-center justify-center opacity-50 relative"><FileText className="text-sky-400 mb-2"/><CheckBadge/></div>
        <div className="w-16 h-20 bg-sky-50 border-2 border-sky-200 rounded flex flex-col items-center justify-center opacity-50 relative"><FileText className="text-sky-400 mb-2"/><CheckBadge/></div>
        <div className="w-16 h-20 bg-rose-50 border-2 border-rose-400 rounded flex flex-col items-center justify-center relative shadow-[0_0_15px_rgba(244,63,94,0.3)]"><FileText className="text-rose-500 mb-2"/><XBadge/></div>
      </div>
    )
  },
  {
    id: 2,
    title: "Smart Mall Security Feed",
    description: "Retail cameras that scan shoppers' faces, identify them without consent, and log their shopping habits to sell to advertisers.",
    category: "privacy",
    explanation: "This system tracks individuals in public spaces without their consent, trading their fundamental right to anonymity for corporate profit.",
    Visual: () => (
      <div className="relative w-48 h-32 bg-slate-900 rounded-lg overflow-hidden border-4 border-slate-700 flex items-center justify-center">
        <div className="absolute top-2 right-2 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/><span className="text-[8px] text-white font-mono">REC</span></div>
        <Camera className="text-slate-600 absolute opacity-20 w-32 h-32" />
        <div className="flex gap-4 z-10">
           <div className="relative"><Users className="text-emerald-400"/><div className="absolute -inset-2 border border-emerald-400/50 rounded-sm bg-emerald-400/10"/></div>
           <div className="relative"><Users className="text-sky-400"/><div className="absolute -inset-2 border border-sky-400/50 rounded-sm bg-sky-400/10"/></div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Viral CEO Audio Leak",
    description: "A leaked audio clip of a rival CEO admitting to corporate fraud. It sounds identical, but the background noise glitches unnaturally.",
    category: "deepfake",
    explanation: "This is synthesized audio designed to manipulate stock prices. Deepfakes use AI to create highly convincing but entirely false media.",
    Visual: () => (
      <div className="flex flex-col items-center justify-center w-full max-w-[200px]">
        <Mic className="text-slate-400 mb-4 w-12 h-12 animate-pulse" />
        <div className="flex items-center gap-1 h-12">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`w-2 bg-fuchsia-400 rounded-full ${i%3===0 ? 'h-full animate-pulse' : i%2===0 ? 'h-3/4' : 'h-1/2'}`} />
          ))}
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Medical Imaging Assistant",
    description: "An AI tool that highlights potential tumors in X-rays. It requires a human radiologist to review and approve the final diagnosis.",
    category: "safe",
    explanation: "This is a safe implementation. The AI acts as an assistant to augment human capabilities, keeping a 'human in the loop' for critical decisions.",
    Visual: () => (
      <div className="relative w-40 h-40 bg-slate-800 rounded-xl border-4 border-slate-600 flex items-center justify-center overflow-hidden">
         <Activity className="text-cyan-400 w-24 h-24 opacity-50" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-dashed border-emerald-400 rounded-full flex items-center justify-center bg-emerald-400/10">
            <CheckBadge />
         </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Predictive Patrol Map",
    description: "A law enforcement algorithm predicting crime hotspots. It repeatedly sends patrols to low-income neighborhoods based on flawed historical arrest records.",
    category: "bias",
    explanation: "Predictive policing algorithms can create dangerous feedback loops. If historical data reflects human prejudices, the AI will amplify them.",
    Visual: () => (
      <div className="relative w-48 h-32 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300">
         <Map className="w-full h-full text-slate-300 opacity-50 absolute inset-0" />
         <div className="absolute top-4 left-6 w-8 h-8 rounded-full bg-amber-500/30 border border-amber-500 animate-pulse" />
         <div className="absolute bottom-6 right-8 w-12 h-12 rounded-full bg-amber-500/40 border border-amber-500 animate-pulse" />
      </div>
    )
  },
  {
    id: 6,
    title: "Health App Data Broker",
    description: "A free fitness app that tracks your daily heart rate and secretly sells the raw biometric data to health insurance corporations.",
    category: "privacy",
    explanation: "Selling highly sensitive biometric health data to third parties without explicit, informed consent is a severe violation of digital privacy.",
    Visual: () => (
      <div className="flex items-center gap-6">
         <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center border-2 border-rose-300"><Activity className="text-rose-500"/></div>
         <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-300"/><div className="w-2 h-2 rounded-full bg-slate-300"/><div className="w-2 h-2 rounded-full bg-slate-300"/>
         </div>
         <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center border-2 border-emerald-300 font-bold text-emerald-600 text-xl">$$$</div>
      </div>
    )
  },
  {
    id: 7,
    title: "Political Rally Photograph",
    description: "A viral photo showing a politician acting violently. Upon close inspection, the lighting is unnatural and the people in the background have distorted faces.",
    category: "deepfake",
    explanation: "Generative AI can create photorealistic images of events that never happened. These are often used as disinformation to damage reputations.",
    Visual: () => (
      <div className="relative w-48 h-32 bg-slate-200 rounded-lg overflow-hidden border-2 border-slate-300 flex items-center justify-center">
         <ImageIcon className="w-24 h-24 text-slate-400" />
         <div className="absolute inset-0 bg-fuchsia-500/10 mix-blend-overlay" />
         <div className="absolute top-4 right-4 w-12 h-12 border-2 border-fuchsia-500 rounded-full flex items-center justify-center bg-fuchsia-500/20 animate-pulse">
            <AlertTriangle size={16} className="text-fuchsia-600" />
         </div>
      </div>
    )
  },
  {
    id: 8,
    title: "Facial Recognition ID Gate",
    description: "An office security gate that uses AI to scan employee faces. It consistently fails to recognize employees with darker skin tones.",
    category: "bias",
    explanation: "Computer vision systems trained primarily on lighter-skinned faces will perform poorly for others, leading to discriminatory technological barriers.",
    Visual: () => (
      <div className="flex flex-col items-center gap-4">
         <div className="flex gap-4">
            <div className="relative w-16 h-16 border-2 border-emerald-400 rounded-lg flex items-center justify-center bg-emerald-50"><UserX className="text-emerald-500"/><CheckBadge/></div>
            <div className="relative w-16 h-16 border-2 border-amber-400 rounded-lg flex items-center justify-center bg-amber-50 shadow-[0_0_15px_rgba(245,158,11,0.3)]"><ScanFace className="text-amber-500"/><XBadge/></div>
         </div>
      </div>
    )
  },
  {
    id: 9,
    title: "AI Educational Tutor",
    description: "A language model that helps students brainstorm ideas. It refuses to write essays for them and provides citations for all its factual claims.",
    category: "safe",
    explanation: "This is a responsible use of Generative AI. It acts as a learning aid, enforces academic integrity, and maintains transparency via citations.",
    Visual: () => (
      <div className="relative w-48 h-32 bg-white rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm flex flex-col">
         <div className="h-8 bg-slate-100 flex items-center px-3 gap-2 border-b border-slate-200"><Bot size={14} className="text-emerald-500"/><span className="text-[10px] font-bold text-slate-500">TutorBot</span></div>
         <div className="p-3 flex-1 flex flex-col gap-2">
            <div className="w-3/4 h-2 bg-slate-200 rounded-full" />
            <div className="w-1/2 h-2 bg-slate-200 rounded-full" />
            <div className="mt-auto self-end w-1/3 h-2 bg-emerald-100 rounded-full border border-emerald-200" />
         </div>
      </div>
    )
  },
  {
    id: 10,
    title: "Smart Home Microphone",
    description: "A voice assistant speaker that constantly records audio 24/7, even when not triggered, uploading ambient household conversations to the cloud.",
    category: "privacy",
    explanation: "Always-on surveillance devices in private spaces without transparent data-retention policies are massive privacy violations.",
    Visual: () => (
      <div className="relative w-32 h-32 bg-slate-800 rounded-full overflow-hidden border-4 border-slate-600 flex flex-col items-center justify-center shadow-lg">
         <Mic className="w-12 h-12 text-slate-300 mb-2" />
         <div className="absolute inset-0 bg-rose-500/20 mix-blend-overlay animate-pulse" />
         <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[8px] font-mono text-rose-400 tracking-widest">UPLOADING</span>
         </div>
      </div>
    )
  },
  {
    id: 11,
    title: "Synthesized Voice Phishing",
    description: "An AI voice clone of a grandmother calling her grandson, desperately asking him to wire money for bail to an unknown account.",
    category: "deepfake",
    explanation: "Generative AI can accurately clone human voices from short audio samples, which criminals weaponize to commit emotional and financial fraud.",
    Visual: () => (
      <div className="relative w-32 h-40 bg-slate-900 rounded-3xl border-4 border-slate-700 flex flex-col items-center justify-center overflow-hidden">
         <PhoneCall className="w-10 h-10 text-emerald-400 mb-4 animate-bounce" />
         <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500">
            <VenetianMask className="w-4 h-4 text-fuchsia-400" />
         </div>
      </div>
    )
  },
  {
    id: 12,
    title: "Automated Loan Approvals",
    description: "A bank's AI routinely denies mortgages to applicants from specific zip codes associated with minority communities.",
    category: "bias",
    explanation: "This is 'digital redlining'. If an AI is trained on biased historical lending data, it will automatically replicate those discriminatory practices.",
    Visual: () => (
      <div className="flex gap-2 items-center">
         <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200"><Home className="text-slate-400"/></div>
         <div className="w-6 h-1 bg-slate-300 rounded-full"/>
         <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center border-2 border-amber-300 relative shadow-md">
            <Home className="text-amber-500"/>
            <XBadge />
         </div>
      </div>
    )
  },
  {
    id: 13,
    title: "Smart Toy Bear",
    description: "An internet-connected teddy bear that records children's conversations and stores them on an unencrypted server accessible to anyone.",
    category: "privacy",
    explanation: "Collecting data from minors without strict encryption and parental consent is highly illegal and a massive ethical privacy breach.",
    Visual: () => (
      <div className="relative w-32 h-32 bg-sky-100 rounded-full flex items-center justify-center border-4 border-sky-200">
         <Baby className="w-16 h-16 text-sky-500" />
         <div className="absolute top-6 right-6 w-4 h-4 bg-rose-500 rounded-full animate-ping" />
      </div>
    )
  },
  {
    id: 14,
    title: "Accessibility Video Captioning",
    description: "An AI that automatically generates subtitles for deaf users on a live video platform, with user controls to toggle them on or off.",
    category: "safe",
    explanation: "This uses AI ethically to increase accessibility for disabled users while maintaining user autonomy and control.",
    Visual: () => (
      <div className="w-48 h-32 bg-slate-800 rounded-xl border-4 border-slate-700 flex flex-col justify-end p-2">
         <div className="w-full bg-black/50 rounded flex items-center justify-center py-2 border border-slate-600">
            <Subtitles className="text-emerald-400 w-6 h-6 mr-2" />
            <div className="w-16 h-2 bg-slate-300 rounded-full" />
         </div>
      </div>
    )
  },
  {
    id: 15,
    title: "Medical Triage Bot",
    description: "A hospital bot that assumes women reporting chest pain are just experiencing anxiety, delaying their emergency cardiac care.",
    category: "bias",
    explanation: "Medical AI trained strictly on male symptom profiles will misdiagnose female patients, leading to dangerous algorithmic bias in healthcare.",
    Visual: () => (
      <div className="relative w-32 h-32 bg-rose-50 rounded-full flex items-center justify-center border-4 border-rose-200">
         <HeartPulse className="w-16 h-16 text-rose-400" />
         <div className="absolute -bottom-2 w-24 h-8 bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center rounded border-2 border-amber-600 shadow-lg">
            LOW PRIORITY
         </div>
      </div>
    )
  },
  {
    id: 16,
    title: "Location-Tracking Weather App",
    description: "A simple weather widget that requires 24/7 GPS access and sells your real-time location history to hundreds of ad networks.",
    category: "privacy",
    explanation: "This is severe data overreach. An app should only collect the minimum data necessary for its function, not exploit permissions to track you.",
    Visual: () => (
      <div className="flex flex-col items-center">
         <CloudRain className="w-16 h-16 text-sky-400 mb-2" />
         <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            <Map className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-mono text-slate-500">TRACKING_ACTIVE</span>
         </div>
      </div>
    )
  },
  {
    id: 17,
    title: "Fake News Generator",
    description: "A bot network that generates millions of hyper-realistic, fake news articles overnight to manipulate a local election.",
    category: "deepfake",
    explanation: "AI text generation (a form of deepfake technology) can be weaponized at scale to spread disinformation and destabilize democratic processes.",
    Visual: () => (
      <div className="relative w-40 h-40 bg-slate-50 rounded-lg flex flex-col p-3 border-2 border-slate-200 shadow-md">
         <div className="flex items-center gap-2 mb-2 border-b pb-2"><Newspaper className="text-slate-400 w-5 h-5"/><div className="w-16 h-2 bg-slate-300 rounded-full"/></div>
         <div className="w-full h-2 bg-slate-200 rounded-full mb-1" />
         <div className="w-3/4 h-2 bg-slate-200 rounded-full mb-1" />
         <div className="w-full h-2 bg-slate-200 rounded-full mb-1" />
         <div className="w-1/2 h-2 bg-slate-200 rounded-full mb-1" />
         <div className="absolute inset-0 bg-fuchsia-500/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <VenetianMask className="w-16 h-16 text-fuchsia-500 drop-shadow-md" />
         </div>
      </div>
    )
  }
];

const CheckBadge = () => <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white"><ShieldCheck size={12} className="text-white"/></div>;
const XBadge = () => <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white"><ShieldAlert size={12} className="text-white"/></div>;

// Updated STAMPS to use the new 9th-grade friendly icons with hover animations
const STAMPS = [
  { id: "safe", name: "Safe & Ethical", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-700", ring: "ring-emerald-500", anim: "group-hover:scale-110" },
  { id: "bias", name: "Algorithmic Bias", icon: UserMinus, color: "text-amber-500", bg: "bg-amber-500", border: "border-amber-700", ring: "ring-amber-500", anim: "group-hover:-translate-x-1 group-hover:translate-x-1" },
  { id: "privacy", name: "Privacy Violation", icon: LockOpen, color: "text-rose-500", bg: "bg-rose-500", border: "border-rose-700", ring: "ring-rose-500", anim: "group-hover:animate-pulse" },
  { id: "deepfake", name: "AI Deepfake", icon: VenetianMask, color: "text-fuchsia-500", bg: "bg-fuchsia-500", border: "border-fuchsia-700", ring: "ring-fuchsia-500", anim: "group-hover:-rotate-12 group-hover:scale-110 transition-transform" }
];

export default function ResponsibleAI23() {
  const { reportComplete } = useLMSBridge("responsibleai23");
  const { playPop, playSuccess, playError, playZap } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [caseIndex, setCaseIndex] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [feedback, setFeedback] = useState<{msg: string, type: 'error'|'success', active: boolean}>({ msg: "", type: "error", active: false });
  const [stampedCategory, setStampedCategory] = useState<Category | null>(null);
  
  // Initialize with a safe default for SSR matching, then shuffle when they hit "Begin"
  const [activeCases, setActiveCases] = useState<Case[]>(() => [...CASES].slice(0, 10));

  const startGame = () => {
    // Shuffle the full bank and pick 10 random cases
    const shuffled = [...CASES].sort(() => Math.random() - 0.5).slice(0, 10);
    setActiveCases(shuffled);
    setPhase("playing");
    setCaseIndex(0);
    setStrikes(0);
    setStampedCategory(null);
    setFeedback({ msg: "", type: "success", active: false });
    playPop();
  };

  const handleReset = () => {
    setPhase("intro");
    playPop();
  };

  // Fallback if activeCases is somehow empty during hydration
  const currentCase = activeCases[caseIndex] || CASES[0];

  const handleStamp = (categoryId: Category) => {
    if (phase !== "playing") return;
    
    setStampedCategory(categoryId);

    if (categoryId === currentCase.category) {
       // Correct Classification
       playZap();
       setTimeout(() => {
          if (caseIndex === 9) { // 10 cases total (0-9)
             setPhase("success");
             playSuccess();
             reportComplete();
          } else {
             setCaseIndex(i => i + 1);
             setStampedCategory(null);
             playPop();
          }
       }, 1000);
    } else {
       // Incorrect Classification
       playError();
       const newStrikes = strikes + 1;
       setStrikes(newStrikes);
       setPhase("feedback");
       setFeedback({ msg: currentCase.explanation, type: "error", active: true });
       
       if (newStrikes >= 3) {
          setTimeout(() => setPhase("game_over"), 4000);
       }
    }
  };

  const clearFeedback = () => {
     setPhase("playing");
     setStampedCategory(null);
     playPop();
  };

  return (
    <LabShell
      labId="responsibleai23"
      theme="ocean"
      title="The Ethics Scanner"
      instruction="Review 10 AI systems. Stamp them as Safe, Biased, a Privacy Risk, or a Deepfake."
      hint="Algorithmic bias discriminates. Privacy violations track data without consent. Deepfakes create deceptive media."
      compact
      onReset={handleReset}
    >
      <Celebration
        isActive={phase === "success"}
        message={`Audit complete! You successfully evaluated all 10 systems, protecting the public from unethical technology.`}
        onReplay={handleReset}
      />

      <div className="w-full flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0 relative isolate pb-4 max-w-7xl mx-auto px-2 md:px-4">
        
        {/* Feedback Banner Overlay */}
        <AnimatePresence>
           {phase === "feedback" && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm w-full bg-rose-600 text-white rounded-2xl shadow-[0_20px_60px_rgba(225,29,72,0.6)] p-6 text-center border-4 border-white"
              >
                 <AlertTriangle size={36} className="mx-auto mb-3" />
                 <h3 className="font-black uppercase tracking-widest text-sm mb-2 text-rose-100">Critical Error</h3>
                 <p className="font-bold text-base leading-tight mb-6">{feedback.msg}</p>
                 <button onClick={clearFeedback} className="w-full py-4 bg-white text-rose-600 font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                   Acknowledge & Retry
                 </button>
              </motion.div>
           )}
        </AnimatePresence>

        {/* OVERLAYS (Intro / Game Over) */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/20 rounded-3xl">
             <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl text-center">
                <Brain size={48} className="text-indigo-600 mb-6 mx-auto" />
                <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">AI Auditing Terminal</h1>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                  Artificial Intelligence is powerful, but it is not inherently neutral. As the Lead AI Auditor, you must review technology before it deploys to the public.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 text-left mb-8 border border-slate-100">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your 4 Authorization Stamps:</h3>
                   <ul className="text-xs text-slate-600 space-y-3 font-medium">
                      <li className="flex items-start gap-2"><ShieldCheck size={16} className="text-emerald-500 shrink-0"/> <strong>Safe & Ethical:</strong> Transparent, unbiased, and protects user data.</li>
                      <li className="flex items-start gap-2"><UserMinus size={16} className="text-amber-500 shrink-0"/> <strong>Algorithmic Bias:</strong> Discriminates due to skewed training data.</li>
                      <li className="flex items-start gap-2"><LockOpen size={16} className="text-rose-500 shrink-0"/> <strong>Privacy Violations:</strong> Collects or tracks personal data without consent.</li>
                      <li className="flex items-start gap-2"><VenetianMask size={16} className="text-fuchsia-500 shrink-0"/> <strong>AI Deepfakes:</strong> Synthesized media designed to deceive or manipulate.</li>
                   </ul>
                </div>
                <button onClick={startGame} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                  Begin Audit
                </button>
             </div>
          </div>
        )}

        {phase === "game_over" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-rose-950/60 rounded-3xl">
             <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(244,63,94,0.3)] text-center animate-in zoom-in duration-300">
                <AlertTriangle size={48} className="text-rose-500 mb-6 mx-auto animate-pulse" />
                <h1 className="text-xl md:text-2xl font-black text-rose-600 uppercase tracking-widest mb-4">AUDIT FAILED</h1>
                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8">
                  You authorized too many unethical AI systems. Harmful algorithms were deployed to the public, causing widespread discrimination and privacy loss.
                </p>
                <button onClick={startGame} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md">
                  Restart Audit
                </button>
             </div>
          </div>
        )}

        {/* LEFT COLUMN: HUD + Evidence Viewer */}
        <div className="flex-1 flex flex-col min-h-0 gap-4 relative">
           {/* HUD */}
           <div className="shrink-0 flex items-center justify-between bg-white rounded-3xl border border-slate-200 p-3 md:p-5 shadow-sm z-20 relative">
              <div className="flex items-center gap-3 md:gap-5">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                    <Search className="text-indigo-500 w-5 h-5 md:w-6 md:h-6" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Systems Audited</span>
                    <span className="text-xl md:text-3xl font-black leading-none text-slate-700">
                       {caseIndex + 1} <span className="text-sm md:text-xl text-slate-400">/ 10</span>
                    </span>
                 </div>
              </div>

              <div className="flex flex-col items-end">
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">Strikes <ShieldAlert size={12}/></span>
                 <div className="flex gap-1.5 md:gap-2">
                    {[1, 2, 3].map(s => (
                       <div key={s} className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center border-2 transition-all ${strikes >= s ? 'bg-rose-500 border-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-100 border-slate-200 text-slate-300'}`}>
                          {strikes >= s ? <AlertTriangle size={14} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* The Viewer Screen */}
           <div className={`flex-1 bg-white rounded-3xl border-4 border-slate-200 shadow-lg overflow-hidden flex flex-col transition-all duration-300 relative ${phase === 'feedback' ? 'blur-sm border-rose-300' : ''}`}>
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
              
              <div className="h-10 md:h-12 bg-slate-100 border-b-2 border-slate-200 flex items-center px-4 md:px-6 justify-between relative z-10 shrink-0">
                 <span className="text-[10px] md:text-xs font-mono font-bold text-slate-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> SYSTEM_PROPOSAL_{currentCase.id.toString().padStart(3, '0')}
                 </span>
                 <span className="text-[10px] md:text-xs font-mono font-bold text-slate-400">AWAITING_CLASSIFICATION</span>
              </div>

              <div className="flex-1 flex items-center justify-center p-8 relative z-10 overflow-hidden min-h-[250px]">
                 <AnimatePresence mode="wait">
                    <motion.div 
                       key={`visual-${currentCase.id}`}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       className="transform scale-125 lg:scale-150 transition-transform origin-center"
                    >
                       {currentCase.Visual()}
                    </motion.div>
                 </AnimatePresence>
                 
                 {/* Stamped Overlay Effect */}
                 {stampedCategory && (
                    <motion.div 
                       initial={{ scale: 3, opacity: 0, rotate: -15 }}
                       animate={{ scale: 1.5, opacity: 1, rotate: -15 }}
                       className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 rounded-2xl px-6 py-3 font-black text-3xl uppercase tracking-widest backdrop-blur-sm z-50 shadow-2xl flex items-center gap-3 ${STAMPS.find(s => s.id === stampedCategory)?.color} border-current bg-white/95`}
                    >
                       <Stamp size={36} />
                       {STAMPS.find(s => s.id === stampedCategory)?.name}
                    </motion.div>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Case Text & Stamps */}
        <div className={`w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col gap-3 md:gap-4 min-h-0 transition-all ${phase !== 'playing' ? 'opacity-50 pointer-events-none' : ''}`}>
           
           {/* Text Description */}
           <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl p-4 md:p-6 flex flex-col justify-center border-2 border-slate-200 shadow-sm relative overflow-hidden">
              <AnimatePresence mode="wait">
                 <motion.div 
                    key={`text-${currentCase.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col"
                 >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center border-2 border-sky-100 mb-2 md:mb-3 shadow-sm shrink-0">
                       <FileText size={18} />
                    </div>
                    <h2 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-widest mb-1 md:mb-2 leading-tight">{currentCase.title}</h2>
                    <p className="text-[11px] md:text-sm text-slate-600 font-medium leading-snug">
                       {currentCase.description}
                    </p>
                 </motion.div>
              </AnimatePresence>
           </div>

           {/* Classification Stamps */}
           <div className="shrink-0 bg-slate-100 rounded-3xl p-3 md:p-4 shadow-inner border-2 border-slate-200 flex flex-col items-center w-full">
              <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                 <Stamp size={14} /> Authorization Stamps
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
                 {STAMPS.map(stamp => (
                    <button
                      key={stamp.id}
                      onClick={() => handleStamp(stamp.id as Category)}
                      className={`relative w-full rounded-2xl border-b-[4px] flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2.5 md:p-3 transition-all group hover:-translate-y-1 active:border-b-0 active:translate-y-1 bg-white border-slate-300 shadow-sm`}
                    >
                       <stamp.icon size={26} strokeWidth={2.5} className={`${stamp.color} ${stamp.anim}`} />
                       <span className={`font-black text-[9px] md:text-[10px] uppercase tracking-wider text-center leading-tight ${stamp.color}`}>
                          {stamp.name}
                       </span>
                    </button>
                 ))}
              </div>
           </div>

        </div>

      </div>
    </LabShell>
  );
}
