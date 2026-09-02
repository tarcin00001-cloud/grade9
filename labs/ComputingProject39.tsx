"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import LabShell from "@/components/LabShell";
import Celebration from "@/components/Celebration";
import { 
  Folder, ShieldAlert, Database, FileText, Smartphone, 
  AlertOctagon, Signature, ShieldCheck, Clock, Plus, Minus,
  Sparkles, CheckCircle2, RotateCcw
} from "lucide-react";

type Step = 'LEARN' | 'FAIL_SCOPE' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';
type ProjectId = 'python' | 'security' | 'database' | 'essay' | 'web';
type Phase = 'planning' | 'building' | 'testing';

interface Project {
  id: ProjectId;
  title: string;
  color: string;
  accentBg: string;
  bgLight: string;
  icon: any;
  desc: string;
  deliverables: string[];
  anecdote: string;
  recommendedHint: string;
  validate: (alloc: Record<Phase, number>) => { valid: boolean; reason?: string };
}

const TOTAL_BUDGET = 40;
const STEP_SIZE = 5;

const PROJECTS: Project[] = [
  {
    id: 'python',
    title: 'Python Data Analysis',
    color: 'text-blue-600',
    accentBg: 'bg-blue-600',
    bgLight: 'bg-blue-50 border-blue-200',
    icon: Folder,
    desc: 'Collect ≥20 records, compute mean/median/mode, display matplotlib chart.',
    deliverables: ['Real dataset (≥20 records)', 'Compute mean, median, mode', 'Matplotlib visualization'],
    anecdote: "Adhiyan spent 3 weeks over-analyzing endless datasets, panicked, and deleted everything! Don't over-plan.",
    recommendedHint: "Cap Planning under 15h. Focus the majority of hours on Building & writing Python code.",
    validate: (alloc) => {
      if (alloc.planning >= 15) {
        return {
          valid: false,
          reason: `Scope Rejected! You allocated ${alloc.planning}h to Planning. Like Adhiyan, you're at risk of over-analyzing! Cap Planning below 15h and dedicate more time to Building.`
        };
      }
      if (alloc.building < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! You only gave ${alloc.building}h to Building. Python data cleaning and charting requires at least 15h.`
        };
      }
      return { valid: true };
    }
  },
  {
    id: 'security',
    title: 'Network Security Case',
    color: 'text-rose-600',
    accentBg: 'bg-rose-600',
    bgLight: 'bg-rose-50 border-rose-200',
    icon: ShieldAlert,
    desc: 'Research a historical cyber breach (e.g. WannaCry), analyze flaws & countermeasures.',
    deliverables: ['Real breach research (WannaCry)', 'Vulnerabilities & damage map', 'Countermeasures with citations'],
    anecdote: "Riya wrote a 10-page report on a fictional Hollywood movie hack with zero real sources and got zero marks.",
    recommendedHint: "Allocate at least 15h to Research & Planning so every technical claim cites real incident reports.",
    validate: (alloc) => {
      if (alloc.planning < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Research & Planning has only ${alloc.planning}h. Riya failed because she didn't research a real historical breach! Give at least 15h to Research.`
        };
      }
      if (alloc.testing < 10) {
        return {
          valid: false,
          reason: `Scope Rejected! Testing & Review has only ${alloc.testing}h. Case studies need at least 10h to fact-check sources and peer review citations.`
        };
      }
      return { valid: true };
    }
  },
  {
    id: 'database',
    title: 'Relational Database',
    color: 'text-purple-600',
    accentBg: 'bg-purple-600',
    bgLight: 'bg-purple-50 border-purple-200',
    icon: Database,
    desc: 'Build a MySQL/Access DB (School/Hospital domain) with ≥4 tables & 10 queries.',
    deliverables: ['Normalized schema (≥4 tables)', '10 SQL queries + 2 reports', 'Data dictionary & ER diagram'],
    anecdote: "Kabir created 50 messy tables without schema planning, then spent 3 weeks stuck in broken foreign key loops.",
    recommendedHint: "Allocate at least 15h to Planning to model your ER diagram and primary keys before touching SQL.",
    validate: (alloc) => {
      if (alloc.planning < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Only ${alloc.planning}h for Planning. Kabir built 50 broken tables by skipping ER planning! Spend at least 15h designing your schema first.`
        };
      }
      if (alloc.building < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! You need at least 15h in Building to construct tables and craft 10 meaningful relational queries.`
        };
      }
      return { valid: true };
    }
  },
  {
    id: 'essay',
    title: 'Digital Citizenship',
    color: 'text-amber-600',
    accentBg: 'bg-amber-600',
    bgLight: 'bg-amber-50 border-amber-200',
    icon: FileText,
    desc: 'Write a 600-800 word paper on deepfakes/AI bias with cited counter-arguments.',
    deliverables: ['600-800 word focused paper', 'Structured introduction & conclusion', 'Well-cited counter-argument'],
    anecdote: "Sara wrote 2000 rambling words about algorithms without a single cited statistic or verified counter-argument.",
    recommendedHint: "Give at least 15h to Research & Fact-finding, and reserve time in Review to enforce the 800-word limit.",
    validate: (alloc) => {
      if (alloc.planning < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Only ${alloc.planning}h in Research. Sara wrote 2000 unverified words! Allocate at least 15h to gather verified facts and citations.`
        };
      }
      if (alloc.testing < 10) {
        return {
          valid: false,
          reason: `Scope Rejected! Review & Polish has only ${alloc.testing}h. You need at least 10h to trim the word count strictly to 600-800 words.`
        };
      }
      return { valid: true };
    }
  },
  {
    id: 'web',
    title: 'Responsive Web App',
    color: 'text-emerald-600',
    accentBg: 'bg-emerald-600',
    bgLight: 'bg-emerald-50 border-emerald-200',
    icon: Smartphone,
    desc: 'Build a 2-3 page interactive HTML/CSS/JS app that adapts seamlessly to desktop & mobile.',
    deliverables: ['2-3 page semantic HTML/CSS/JS', 'Interactive quiz or calculator', 'Flawless mobile & desktop layout'],
    anecdote: "Sirpi spent 4 weeks building a stunning game site that only worked on his specific phone screen and failed testing.",
    recommendedHint: "Allocate at least 15h to Testing & Review to verify media queries across multiple screen viewports.",
    validate: (alloc) => {
      if (alloc.testing < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Testing & Review has only ${alloc.testing}h. Sirpi's site broke on every device except his phone! Allocate at least 15h to multi-device testing.`
        };
      }
      if (alloc.building < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Building & Coding has only ${alloc.building}h. Developing interactive JS elements needs at least 15h.`
        };
      }
      return { valid: true };
    }
  }
];

const PHASES: { key: Phase; label: string; desc: string; iconColor: string }[] = [
  { 
    key: 'planning', 
    label: 'Research & Planning', 
    desc: 'ER schemas, literature search, outline, data selection',
    iconColor: 'bg-indigo-100 text-indigo-700'
  },
  { 
    key: 'building', 
    label: 'Building & Coding', 
    desc: 'Writing Python scripts, SQL tables, HTML/CSS/JS, drafting text',
    iconColor: 'bg-blue-100 text-blue-700'
  },
  { 
    key: 'testing', 
    label: 'Testing & Review', 
    desc: 'Cross-device checks, bug fixes, citation auditing, word count trimming',
    iconColor: 'bg-emerald-100 text-emerald-700'
  }
];

export default function ComputingProject39() {
  const [step, setStep] = useState<Step>('LEARN');
  const [activeProject, setActiveProject] = useState<ProjectId | null>('web');
  const [allocations, setAllocations] = useState<Record<Phase, number>>({
    planning: 10,
    building: 20,
    testing: 10
  });
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const { playSuccess, playError, playClick, playPop } = useLabAudio();
  const { reportComplete } = useLMSBridge('computingproject39');

  const selected = useMemo(() => PROJECTS.find(p => p.id === activeProject), [activeProject]);

  const totalAllocated = useMemo(() => {
    return allocations.planning + allocations.building + allocations.testing;
  }, [allocations]);

  const remainingHours = TOTAL_BUDGET - totalAllocated;

  const handleSelect = (id: ProjectId) => {
    if (playClick) playClick();
    setActiveProject(id);
    setRejectionReason(null);
    setStep('LEARN');
    // Default starter distribution
    setAllocations({ planning: 10, building: 20, testing: 10 });
  };

  const adjustHours = (phase: Phase, delta: number) => {
    const current = allocations[phase];
    const target = current + delta;
    if (target < 0) return;
    
    // If adding, make sure we do not exceed TOTAL_BUDGET
    if (delta > 0 && totalAllocated + delta > TOTAL_BUDGET) return;

    if (playPop) playPop();
    setAllocations(prev => ({
      ...prev,
      [phase]: target
    }));

    if (rejectionReason) {
      setRejectionReason(null);
    }
    if (step === 'FAIL_SCOPE') {
      setStep('IMPROVE');
    }
  };

  const handleAuthorize = () => {
    if (!selected) return;
    
    if (totalAllocated !== TOTAL_BUDGET) {
      if (playError) playError();
      return;
    }

    const validation = selected.validate(allocations);
    if (!validation.valid) {
      if (playError) playError();
      setRejectionReason(validation.reason || "Scope requirements not met.");
      setStep('FAIL_SCOPE');
      return;
    }

    if (playSuccess) playSuccess();
    setRejectionReason(null);
    setStep('OUTCOME');
    reportComplete();
  };

  const resetLab = () => {
    setStep('LEARN');
    setActiveProject('web');
    setAllocations({ planning: 10, building: 20, testing: 10 });
    setRejectionReason(null);
  };

  const briefings: Record<Step, string> = {
    LEARN: "Capstone Dispatch: Balance your 40 Project Hours to avoid the common failure mode and authorize your charter.",
    FAIL_SCOPE: "Scope Rejected! Review the feedback below, rebalance your time budget, and try again.",
    IMPROVE: "Rebalancing budget: adjust hours between Planning, Building, and Testing.",
    COMPLETE: "40 hours balanced! Click Authorize Project Charter to commit.",
    OUTCOME: "Charter Authorized! You balanced the project scope successfully."
  };

  return (
    <LabShell 
      labId="computingproject39"
      title="Computing Project" 
      compact={true}
      instruction={briefings[step]}
      bgOverride="bg-slate-200"
      onReset={resetLab}
    >
      <div className="absolute inset-0 top-[52px] md:top-[68px] p-2 md:p-3 flex justify-center overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col md:flex-row gap-3 min-h-0">
          
          {/* LEFT: Project Grid (Sorting Tray) */}
          <div className="w-full md:w-[38%] lg:w-[34%] flex flex-col gap-1.5 overflow-y-auto bg-slate-300 shadow-inner rounded-2xl p-2.5 border border-slate-400/50 shrink-0 min-h-0">
            <div className="px-1 py-0.5 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">Choose Option (1 of 5)</span>
              <span className="text-[10px] font-bold text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">4-Week Capstone</span>
            </div>
            
            {PROJECTS.map(proj => {
              const isActive = activeProject === proj.id;
              const Icon = proj.icon;
              return (
                <button
                  key={proj.id}
                  onClick={() => handleSelect(proj.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all ${
                    isActive 
                      ? `${proj.bgLight} shadow-sm border-opacity-100 scale-[1.01] ring-2 ring-sky-400/40` 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-white shadow-xs' : 'bg-slate-100'} ${proj.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-black uppercase tracking-wide text-xs truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">{proj.desc}</p>
                  </div>
                </button>
              );
            })}

            {/* Quick Context Card */}
            <div className="mt-auto bg-white/70 rounded-xl p-2.5 border border-slate-300/80 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800">💡 Course Rule: </span>
              Worth 10% of your final Grade 9 course mark. You complete exactly ONE project over 4 weeks.
            </div>
          </div>

          {/* RIGHT: Inspector Pad & Scope Balancer */}
          <div className="w-full md:w-[62%] lg:w-[66%] bg-[#e2e6ea] rounded-2xl shadow-[5px_10px_20px_rgba(0,0,0,0.12)] border-t border-l border-white border-b-[5px] border-r-[3px] border-slate-300 p-3 md:p-4 flex flex-col min-h-0 relative">
            
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 drop-shadow-xs">
                <Folder size={56} className="mb-3 opacity-60" />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-700">Select a Dossier</h2>
                <p className="text-xs font-medium text-slate-500">Pick a project from the left dispatch tray to begin.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                
                {/* Dossier Header */}
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-300 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-white shadow-xs ${selected.color}`}>
                      {React.createElement(selected.icon, { size: 24 })}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">Project Dossier</div>
                      <h2 className="text-lg md:text-xl font-black uppercase text-slate-800 leading-tight">
                        {selected.title}
                      </h2>
                    </div>
                  </div>

                  {/* Budget Pill */}
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-300 shadow-xs shrink-0">
                    <Clock size={14} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">
                      Budget: <strong className={remainingHours === 0 ? "text-emerald-600" : "text-amber-600"}>{totalAllocated}</strong>/40h
                    </span>
                  </div>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-2.5 min-h-0">
                  
                  {/* Failure Mode Warning & Anecdote */}
                  <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-2.5 relative overflow-hidden shadow-xs">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <div className="flex items-start gap-2.5">
                      <AlertOctagon className="text-amber-600 shrink-0 mt-0.5" size={18} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-800">Common Failure Mode</h4>
                          <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded font-semibold">Avoid this trap!</span>
                        </div>
                        <p className="text-xs font-medium text-amber-950 mt-0.5 leading-snug">{selected.anecdote}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scope Balancer Controls */}
                  <div className="bg-white rounded-xl p-3 border border-slate-300/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Scope Balancer (40 Hours Total)</h4>
                        <p className="text-[11px] text-slate-500">Distribute your hours to defend against the failure mode.</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                          remainingHours === 0 ? "bg-emerald-100 text-emerald-800" :
                          remainingHours > 0 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {remainingHours === 0 ? "Balanced (40h)" : `${Math.abs(remainingHours)}h ${remainingHours > 0 ? 'Remaining' : 'Over'}`}
                        </span>
                      </div>
                    </div>

                    {/* Stepper Rows */}
                    <div className="space-y-2">
                      {PHASES.map(ph => {
                        const val = allocations[ph.key];
                        const pct = Math.round((val / TOTAL_BUDGET) * 100);
                        return (
                          <div key={ph.key} className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800">{ph.label}</span>
                                <span className="text-[11px] font-mono font-bold text-slate-500">{val}h ({pct}%)</span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{ph.desc}</p>
                              
                              {/* Visual Mini Progress Bar */}
                              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div 
                                  className="h-full bg-sky-600 transition-all duration-200 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            {/* Stepper Controls (+/- 5h) */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => adjustHours(ph.key, -STEP_SIZE)}
                                disabled={val <= 0}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 transition-transform"
                                title={`Subtract ${STEP_SIZE} hours`}
                              >
                                <Minus size={14} />
                              </button>
                              
                              <div className="w-10 text-center font-mono font-black text-sm text-slate-800">
                                {val}h
                              </div>

                              <button
                                onClick={() => adjustHours(ph.key, STEP_SIZE)}
                                disabled={remainingHours <= 0}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 transition-transform"
                                title={`Add ${STEP_SIZE} hours`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rejection Alert Banner (Fail Safely State) */}
                  <AnimatePresence>
                    {step === 'FAIL_SCOPE' && rejectionReason && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="bg-rose-50 border-2 border-rose-400 rounded-xl p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">Rejection Rationale:</h4>
                            <p className="text-xs font-semibold text-rose-950 mt-0.5">{rejectionReason}</p>
                            <p className="text-[11px] font-medium text-rose-700 mt-1">
                              👉 <em>Fix:</em> Use the +/- buttons above to rebalance your hours, then re-authorize.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Deliverables Checklist Chips */}
                  <div className="bg-white/80 rounded-xl p-2.5 border border-slate-300/60">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Required Deliverables</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {selected.deliverables.map((del, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded text-[11px] text-slate-700 font-medium border border-slate-200 truncate">
                          <CheckCircle2 size={12} className="text-sky-600 shrink-0" />
                          <span className="truncate">{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-2 mt-1 border-t border-slate-300/80 shrink-0 relative">
                  <button
                    onClick={handleAuthorize}
                    disabled={totalAllocated !== TOTAL_BUDGET}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm md:text-base uppercase tracking-wider transition-all ${
                      step === 'OUTCOME'
                        ? 'bg-emerald-500 text-white shadow-inner'
                        : totalAllocated === TOTAL_BUDGET
                          ? 'bg-slate-800 text-white shadow-md hover:bg-slate-700 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {step === 'OUTCOME' ? (
                      <>
                        <ShieldCheck size={20} />
                        Charter Authorized!
                      </>
                    ) : totalAllocated !== TOTAL_BUDGET ? (
                      <>
                        <Clock size={18} />
                        {remainingHours > 0 
                          ? `Allocate ${remainingHours}h More to Authorize` 
                          : `Remove ${Math.abs(remainingHours)}h to Reach 40h`}
                      </>
                    ) : (
                      <>
                        <Signature size={20} />
                        Authorize Project Charter
                      </>
                    )}
                  </button>

                  {/* Physical Stamp Animation Overlays */}
                  <AnimatePresence>
                    {step === 'FAIL_SCOPE' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 2.5, rotate: -12 }}
                        animate={{ opacity: 1, scale: 1, rotate: -12 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none z-30"
                      >
                        <div className="border-4 border-rose-600 text-rose-600 px-5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-2xl">
                          <h2 className="text-2xl font-black uppercase tracking-widest">Scope Rejected</h2>
                        </div>
                      </motion.div>
                    )}
                    
                    {step === 'OUTCOME' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 2.5, rotate: 8 }}
                        animate={{ opacity: 1, scale: 1, rotate: 8 }}
                        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none z-30"
                      >
                        <div className="border-4 border-emerald-600 text-emerald-600 px-5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-2xl">
                          <h2 className="text-2xl font-black uppercase tracking-widest">Charter Approved</h2>
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
        message={`Project Charter Authorized for ${selected?.title}! Your 40-hour plan is balanced and ready.`} 
        hideModal={true}
      />
    </LabShell>
  );
}
