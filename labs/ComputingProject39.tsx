"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import LabShell from "@/components/LabShell";
import Celebration from "@/components/Celebration";
import { 
  Folder, ShieldAlert, Database, FileText, Smartphone, 
  CheckSquare, Square, AlertOctagon, Signature, ShieldCheck
} from "lucide-react";

type Step = 'LEARN' | 'FAIL_SCOPE' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';
type ProjectId = 'python' | 'security' | 'database' | 'essay' | 'web';

interface Project {
  id: ProjectId;
  title: string;
  color: string;
  bgLight: string;
  icon: React.ElementType;
  desc: string;
  deliverables: string[];
  anecdote: string;
  risks: string[];
}

const PROJECTS: Project[] = [
  {
    id: 'python',
    title: 'Python Data Analysis',
    color: 'text-blue-600',
    bgLight: 'bg-blue-50 border-blue-200',
    icon: Folder,
    desc: 'Collect a real dataset, compute statistics, and generate visualizations.',
    deliverables: ['Real dataset (≥20 records)', 'Compute mean, median, mode', 'Display a matplotlib chart'],
    anecdote: "Adhiyan once analyzed his own gaming hours and immediately deleted the results in panic. Don't over-analyze, just deliver!",
    risks: ['I will pick a simple dataset and not get stuck on data collection.', 'I will include the raw data alongside my python script.']
  },
  {
    id: 'security',
    title: 'Network Security Case',
    color: 'text-rose-600',
    bgLight: 'bg-rose-50 border-rose-200',
    icon: ShieldAlert,
    desc: 'Research a historical cyber breach and write a structured case study.',
    deliverables: ['Research a real breach (e.g. WannaCry)', 'Detail vulnerabilities & damage', 'Recommend countermeasures'],
    anecdote: "Riya wrote a brilliant 10-page report on a fictional movie hack instead of a real breach and scored a zero.",
    risks: ['I will research a REAL historical cyber attack.', 'I will properly cite every claim and source.']
  },
  {
    id: 'database',
    title: 'Relational Database',
    color: 'text-purple-600',
    bgLight: 'bg-purple-50 border-purple-200',
    icon: Database,
    desc: 'Build a structured database application for a school, hospital, or library.',
    deliverables: ['Build MySQL/Access DB', '≥4 related tables', '10 meaningful queries & 2 reports'],
    anecdote: "Kabir created 50 tables for a simple library system and spent 3 weeks just linking them.",
    risks: ['I will keep the scope small (exactly 4-5 tables).', 'I will ensure my queries solve real-world problems.']
  },
  {
    id: 'essay',
    title: 'Digital Citizenship',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 border-amber-200',
    icon: FileText,
    desc: 'Write a research paper on deepfakes, privacy law, or algorithmic bias.',
    deliverables: ['600-800 word paper', 'Clear intro, argument, and conclusion', 'Address a counter-argument'],
    anecdote: "Sara wrote 2000 words on why she hates algorithms without a single cited fact.",
    risks: ['I will keep my paper strictly under 800 words.', 'I will include a fair counter-argument and cite sources.']
  },
  {
    id: 'web',
    title: 'Responsive Web App',
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50 border-emerald-200',
    icon: Smartphone,
    desc: 'Build a small HTML/CSS/JS application like a quiz or unit converter.',
    deliverables: ['2-3 page HTML/CSS/JS app', 'Interactive JavaScript element', 'Must work on Desktop & Mobile'],
    anecdote: "Sirpi spent weeks building a beautiful game review site that worked perfectly on his phone and nowhere else.",
    risks: ['I will not overcomplicate the JS logic.', 'I will test my CSS on both desktop and mobile screens.']
  }
];

export default function ComputingProject39() {
  const [step, setStep] = useState<Step>('LEARN');
  const [activeProject, setActiveProject] = useState<ProjectId | null>(null);
  const [checkedRisks, setCheckedRisks] = useState<Record<string, boolean>>({});
  const { playSuccess, playError, playClick, playPop } = useLabAudio();
  const { reportComplete } = useLMSBridge('computingproject39');

  const selected = useMemo(() => PROJECTS.find(p => p.id === activeProject), [activeProject]);

  const allChecked = useMemo(() => {
    if (!selected) return false;
    return selected.risks.every(r => checkedRisks[r]);
  }, [selected, checkedRisks]);

  useEffect(() => {
    if (step === 'IMPROVE' && allChecked) {
      setStep('COMPLETE');
      if (playPop) playPop();
    } else if (step === 'COMPLETE' && !allChecked) {
      setStep('IMPROVE');
    }
  }, [allChecked, step, playPop]);

  const handleSelect = (id: ProjectId) => {
    if (playClick) playClick();
    setActiveProject(id);
    setCheckedRisks({});
    setStep('LEARN');
  };

  const toggleRisk = (risk: string) => {
    if (playClick) playClick();
    setCheckedRisks(prev => ({ ...prev, [risk]: !prev[risk] }));
    if (step === 'LEARN' || step === 'FAIL_SCOPE') {
      setStep('IMPROVE');
    }
  };

  const handleAuthorize = () => {
    if (!selected) return;
    if (!allChecked) {
      if (playError) playError();
      setStep('FAIL_SCOPE');
      return;
    }
    
    if (playSuccess) playSuccess();
    setStep('OUTCOME');
    reportComplete();
  };

  const resetLab = () => {
    setStep('LEARN');
    setActiveProject(null);
    setCheckedRisks({});
  };

  const briefings: Record<Step, string> = {
    LEARN: "Welcome to the Dispatch Center. Select a project dossier to review its requirements.",
    FAIL_SCOPE: "Authorization Denied! You cannot commit to a project without acknowledging its biggest risks.",
    IMPROVE: "Read the failure anecdote and check off the risk acknowledgments.",
    COMPLETE: "Risks acknowledged. The charter is ready for your signature. Click Authorize.",
    OUTCOME: "Project Authorized! Your charter is finalized and you are ready to begin."
  };

  return (
    <LabShell 
      labId="computingproject39"
      title="Hackathon Tycoon" 
      compact={true}
      instruction={briefings[step]}
      bgOverride="bg-slate-200"
      onReset={resetLab}
    >
      <div className="absolute inset-0 top-[60px] md:top-[80px] p-2 md:p-4 flex justify-center overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col md:flex-row gap-4 min-h-0">
          
          {/* LEFT: Project Grid (Sorting Tray) */}
          <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col gap-2 overflow-y-auto bg-slate-300 shadow-inner rounded-2xl p-3 border border-slate-400/50 pb-10 md:pb-3">
            {PROJECTS.map(proj => {
              const isActive = activeProject === proj.id;
              const Icon = proj.icon as any;
              return (
                <button
                  key={proj.id}
                  onClick={() => handleSelect(proj.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    isActive 
                      ? `${proj.bgLight} shadow-md scale-[1.02] border-opacity-100` 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100'} ${proj.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className={`font-black uppercase tracking-wide text-sm ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{proj.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Inspector Pad */}
          <div className="w-full md:w-[60%] lg:w-[65%] bg-[#e0e4e8] rounded-2xl shadow-[5px_10px_20px_rgba(0,0,0,0.15)] border-t border-l border-white border-b-[6px] border-r-[4px] border-slate-300 p-3 md:p-6 flex flex-col min-h-0 relative">
            
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 drop-shadow-sm">
                <Folder size={64} className="mb-4" />
                <h2 className="text-xl font-black uppercase tracking-widest">Select a Dossier</h2>
                <p className="text-sm font-medium">Awaiting project selection...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 relative">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-2 pb-2 border-b-2 border-slate-300/50">
                  <div className={`p-2 rounded-xl bg-white shadow-sm ${selected.color}`}>
                    {React.createElement(selected.icon as React.ElementType, { size: 28 })}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Project Dossier</div>
                    <h2 className="text-xl md:text-2xl font-black uppercase text-slate-800 leading-tight">
                      {selected.title}
                    </h2>
                  </div>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  
                  {/* Deliverables */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Required Deliverables</h3>
                    <ul className="space-y-1">
                      {selected.deliverables.map((del, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                          <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Failure Mode Warning */}
                  <div className="bg-amber-100/80 border border-amber-300 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <div className="flex items-start gap-3">
                      <AlertOctagon className="text-amber-600 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-amber-800 mb-1">Common Failure Mode</h3>
                        <p className="text-sm font-medium text-amber-900 leading-snug">{selected.anecdote}</p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Risk Assessment Checklist</h3>
                    <div className="space-y-2">
                      {selected.risks.map((risk, i) => {
                        const isChecked = checkedRisks[risk];
                        return (
                          <button
                            key={i}
                            onClick={() => toggleRisk(risk)}
                            className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                              isChecked 
                                ? 'bg-emerald-50 border-emerald-200' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className={`mt-0.5 shrink-0 ${isChecked ? 'text-emerald-500' : 'text-slate-300'}`}>
                              {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                            <span className={`font-mono text-sm leading-tight transition-all ${
                              isChecked ? 'text-emerald-700 line-through opacity-70' : 'text-slate-700'
                            }`}>
                              {risk}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-2 mt-2 border-t-2 border-slate-300/50 relative">
                  <button
                    onClick={handleAuthorize}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all ${
                      step === 'OUTCOME'
                        ? 'bg-emerald-500 text-white shadow-inner'
                        : allChecked
                          ? 'bg-slate-800 text-white shadow-lg hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-slate-300 text-slate-500'
                    }`}
                  >
                    {step === 'OUTCOME' ? (
                      <>
                        <ShieldCheck size={24} />
                        Authorized
                      </>
                    ) : (
                      <>
                        <Signature size={24} />
                        Authorize Project
                      </>
                    )}
                  </button>

                  {/* STAMPS */}
                  <AnimatePresence>
                    {step === 'FAIL_SCOPE' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 3, rotate: -15 }}
                        animate={{ opacity: 1, scale: 1, rotate: -15 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                      >
                        <div className="border-4 border-rose-600 text-rose-600 px-6 py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-[0_0_30px_rgba(225,29,72,0.3)]">
                          <h2 className="text-3xl font-black uppercase tracking-widest">Scope Rejected</h2>
                        </div>
                      </motion.div>
                    )}
                    
                    {step === 'OUTCOME' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 3, rotate: 10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 10 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                      >
                        <div className="border-4 border-emerald-600 text-emerald-600 px-6 py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                          <h2 className="text-3xl font-black uppercase tracking-widest">Authorized</h2>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <Celebration 
        isActive={step === 'OUTCOME'} 
        message={`Project Authorized: ${selected?.title}! Now execute it.`} 
        hideModal={true}
      />
    </LabShell>
  );
}
