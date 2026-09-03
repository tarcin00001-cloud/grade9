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

interface PhaseDetail {
  label: string;
  task: string;
  reqTag: string;
}

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
  phases: Record<Phase, PhaseDetail>;
  validate: (alloc: Record<Phase, number>) => { valid: boolean; reason?: string };
}

const TOTAL_BUDGET = 40;
const STEP_SIZE = 5;
const PHASE_KEYS: Phase[] = ['planning', 'building', 'testing'];

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
    recommendedHint: "Keep Dataset Collection at 5–10h. Focus heavy hours (≥20h) on Python Coding.",
    phases: {
      planning: {
        label: 'Dataset Collection & Cleaning',
        task: 'Locate ≥20 records, clean missing values, verify CSV format',
        reqTag: '5–10h max'
      },
      building: {
        label: 'Python Scripts & Matplotlib',
        task: 'Write Python functions for mean, median, mode and plot charts',
        reqTag: 'Req: ≥20h'
      },
      testing: {
        label: 'Statistical Math Validation',
        task: 'Hand-verify calculations against raw data records',
        reqTag: 'Req: ≥5h'
      }
    },
    validate: (alloc) => {
      if (alloc.planning < 5) {
        return {
          valid: false,
          reason: `Scope Rejected! Dataset Collection & Cleaning has only ${alloc.planning}h. You need at least 5h to locate and inspect your dataset records before writing scripts!`
        };
      }
      if (alloc.planning > 10) {
        return {
          valid: false,
          reason: `Scope Rejected! You allocated ${alloc.planning}h to Dataset Collection. Like Adhiyan, you're spending too much time over-analyzing! Cap at 5–10h and spend more time building.`
        };
      }
      if (alloc.building < 20) {
        return {
          valid: false,
          reason: `Scope Rejected! Python Scripts & Matplotlib has only ${alloc.building}h. Cleaning data and coding visualizations requires at least 20h.`
        };
      }
      if (alloc.testing < 5) {
        return {
          valid: false,
          reason: `Scope Rejected! Statistical Math Validation has only ${alloc.testing}h. You need at least 5h to verify calculations against raw records.`
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
    recommendedHint: "Allocate at least 15h to Real Breach Research so every technical claim cites official incident reports.",
    phases: {
      planning: {
        label: 'Real Breach Research & Sources',
        task: 'Investigate WannaCry or AIIMS incident reports, gather verified sources',
        reqTag: 'Req: ≥15h'
      },
      building: {
        label: 'Attack Breakdown & Case Drafting',
        task: 'Document attack vectors, system vulnerabilities, and impact',
        reqTag: 'Req: ≥10h'
      },
      testing: {
        label: 'Countermeasures & Citation Audit',
        task: 'Fact-check technical claims and verify all reference links',
        reqTag: 'Req: ≥10h'
      }
    },
    validate: (alloc) => {
      if (alloc.planning < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Real Breach Research has only ${alloc.planning}h. Riya failed because she didn't research a real historical breach! Case studies require at least 15h of verified incident research.`
        };
      }
      if (alloc.building < 10) {
        return {
          valid: false,
          reason: `Scope Rejected! Attack Breakdown & Case Drafting has only ${alloc.building}h. Documenting vulnerabilities and impact requires at least 10h.`
        };
      }
      if (alloc.testing < 10) {
        return {
          valid: false,
          reason: `Scope Rejected! Countermeasures & Citation Audit has only ${alloc.testing}h. You need at least 10h to audit every citation and source link.`
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
    recommendedHint: "Allocate at least 15h to ER Modeling & Schema Design to avoid Kabir's 50 tangled tables.",
    phases: {
      planning: {
        label: 'ER Modeling & Schema Design',
        task: 'Design 4–5 related tables, normalize, map primary and foreign keys',
        reqTag: 'Req: ≥15h'
      },
      building: {
        label: 'SQL Table & Query Creation',
        task: 'Build ≥4 tables, insert test records, write 10 relational queries',
        reqTag: 'Req: ≥15h'
      },
      testing: {
        label: 'Query Testing & Report Validation',
        task: 'Verify JOIN integrity, check NULL constraints, format 2 reports',
        reqTag: 'Req: ≥5h'
      }
    },
    validate: (alloc) => {
      if (alloc.planning < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Only ${alloc.planning}h for ER Modeling & Schema Design. Kabir built 50 broken tables by skipping schema design! Spend at least 15h planning tables, keys, and ER diagrams first.`
        };
      }
      if (alloc.building < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! SQL Table & Query Creation has only ${alloc.building}h. Constructing tables and writing 10 meaningful relational queries requires at least 15h.`
        };
      }
      if (alloc.testing < 5) {
        return {
          valid: false,
          reason: `Scope Rejected! Query Testing & Report Validation has only ${alloc.testing}h. You need at least 5h to test queries and verify data integrity.`
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
    recommendedHint: "Give at least 15h to Fact-Finding & Evidence, and reserve ≥10h to enforce the 800-word limit.",
    phases: {
      planning: {
        label: 'Fact-Finding & Evidence Gathering',
        task: 'Research AI bias/deepfakes, gather verified statistics and counter-arguments',
        reqTag: 'Req: ≥15h'
      },
      building: {
        label: 'Structured Paper Drafting',
        task: 'Draft introduction, central claims, and balanced counter-arguments',
        reqTag: 'Req: ≥10h'
      },
      testing: {
        label: 'Word Count Trimming & Citation Polish',
        task: 'Enforce strictly 600–800 words and format academic source citations',
        reqTag: 'Req: ≥10h'
      }
    },
    validate: (alloc) => {
      if (alloc.planning < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Only ${alloc.planning}h in Fact-Finding & Evidence Gathering. Sara wrote 2000 unverified words! Allocate at least 15h to gather verified facts and citations.`
        };
      }
      if (alloc.building < 10) {
        return {
          valid: false,
          reason: `Scope Rejected! Structured Paper Drafting has only ${alloc.building}h. Constructing a cohesive argument and balanced counter-argument needs at least 10h.`
        };
      }
      if (alloc.testing < 10) {
        return {
          valid: false,
          reason: `Scope Rejected! Word Count Trimming & Citation Polish has only ${alloc.testing}h. You need at least 10h to trim the word count strictly to 600-800 words and proofread citations.`
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
    recommendedHint: "Allocate at least 5h to Wireframing & UI Structure and at least 15h to Cross-Device Responsive Testing.",
    phases: {
      planning: {
        label: 'Wireframing & UI Architecture',
        task: 'Design mobile and desktop layouts, site navigation, and user flow',
        reqTag: 'Req: ≥5h'
      },
      building: {
        label: 'HTML, CSS & JavaScript Coding',
        task: 'Build semantic HTML pages, CSS grid/flexbox, and interactive JS logic',
        reqTag: 'Req: ≥15h'
      },
      testing: {
        label: 'Cross-Device Responsive Testing',
        task: 'Test media queries across desktop monitors, tablets, and mobile screens',
        reqTag: 'Req: ≥15h'
      }
    },
    validate: (alloc) => {
      if (alloc.planning < 5) {
        return {
          valid: false,
          reason: `Scope Rejected! Wireframing & UI Architecture has only ${alloc.planning}h. You cannot start building without at least 5h planning wireframes, site structure, and user flow!`
        };
      }
      if (alloc.building < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! HTML, CSS & JavaScript Coding has only ${alloc.building}h. Developing semantic HTML/CSS and interactive JS requires at least 15h.`
        };
      }
      if (alloc.testing < 15) {
        return {
          valid: false,
          reason: `Scope Rejected! Cross-Device Responsive Testing has only ${alloc.testing}h. Sirpi's site broke on every device except his phone! Allocate at least 15h to multi-device testing.`
        };
      }
      return { valid: true };
    }
  }
];

export default function ComputingProject39() {
  const [step, setStep] = useState<Step>('LEARN');
  const [activeProject, setActiveProject] = useState<ProjectId | null>('python');
  const [approvedProjects, setApprovedProjects] = useState<Record<ProjectId, boolean>>({} as any);
  const [savedAllocations, setSavedAllocations] = useState<Record<ProjectId, Record<Phase, number>>>({} as any);
  const [allocations, setAllocations] = useState<Record<Phase, number>>({
    planning: 10,
    building: 20,
    testing: 10
  });
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const { playSuccess, playError, playClick, playPop } = useLabAudio();
  const { reportComplete } = useLMSBridge('computingproject39');

  const selected = useMemo(() => PROJECTS.find(p => p.id === activeProject), [activeProject]);

  const approvedCount = useMemo(() => {
    return Object.values(approvedProjects).filter(Boolean).length;
  }, [approvedProjects]);

  const isCurrentApproved = activeProject ? !!approvedProjects[activeProject] : false;

  const totalAllocated = useMemo(() => {
    return allocations.planning + allocations.building + allocations.testing;
  }, [allocations]);

  const remainingHours = TOTAL_BUDGET - totalAllocated;

  const handleSelect = (id: ProjectId) => {
    if (playClick) playClick();
    setActiveProject(id);
    setRejectionReason(null);
    const isApproved = !!approvedProjects[id];
    setStep(isApproved ? 'COMPLETE' : 'LEARN');
    if (savedAllocations[id]) {
      setAllocations(savedAllocations[id]);
    } else {
      // Default starter distribution
      setAllocations({ planning: 10, building: 20, testing: 10 });
    }
  };

  const handleNextProject = () => {
    if (playClick) playClick();
    const nextUnapproved = PROJECTS.find(p => !approvedProjects[p.id]);
    if (nextUnapproved) {
      handleSelect(nextUnapproved.id);
    } else {
      const currentIndex = PROJECTS.findIndex(p => p.id === activeProject);
      const nextIndex = (currentIndex + 1) % PROJECTS.length;
      handleSelect(PROJECTS[nextIndex].id);
    }
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

    const nextApproved = { ...approvedProjects, [selected.id]: true };
    setApprovedProjects(nextApproved);
    setSavedAllocations(prev => ({ ...prev, [selected.id]: { ...allocations } }));

    const count = Object.values(nextApproved).filter(Boolean).length;
    if (count === PROJECTS.length) {
      setStep('OUTCOME');
      reportComplete();
    } else {
      setStep('COMPLETE');
    }
  };

  const resetLab = () => {
    setStep('LEARN');
    setActiveProject('python');
    setApprovedProjects({} as any);
    setSavedAllocations({} as any);
    setAllocations({ planning: 10, building: 20, testing: 10 });
    setRejectionReason(null);
  };

  const currentInstruction = useMemo(() => {
    if (approvedCount === PROJECTS.length) {
      return "🎉 Capstone Master: All 5 computing projects balanced and approved!";
    }
    if (step === 'FAIL_SCOPE' && rejectionReason) {
      return rejectionReason;
    }
    if (isCurrentApproved) {
      return `Project "${selected?.title}" approved! Click 'Next Project Brief' to continue (${approvedCount}/5 completed).`;
    }
    const idx = PROJECTS.findIndex(p => p.id === activeProject) + 1;
    return `Project ${idx} of 5: Balance hours for ${selected?.title} to defend against its failure mode.`;
  }, [approvedCount, step, rejectionReason, isCurrentApproved, selected, activeProject]);

  return (
    <LabShell 
      labId="computingproject39"
      title="Computing Project" 
      compact={true}
      instruction={currentInstruction}
      bgOverride="bg-slate-200"
      onReset={resetLab}
    >
      <div className="absolute inset-0 top-[52px] md:top-[68px] p-2 md:p-3 flex justify-center overflow-hidden">
        <div className="w-full max-w-6xl h-full flex flex-col md:flex-row gap-3 min-h-0">
          
          {/* LEFT: Project Grid (Sorting Tray) */}
          <div className="w-full md:w-[38%] lg:w-[34%] flex flex-col gap-1.5 overflow-y-auto bg-slate-300 shadow-inner rounded-2xl p-2.5 border border-slate-400/50 shrink-0 min-h-0">
            <div className="px-1 py-0.5 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">All 5 Projects Required</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                approvedCount === PROJECTS.length ? "bg-emerald-200 text-emerald-900" : "bg-sky-100 text-sky-800"
              }`}>
                {approvedCount}/5 Approved
              </span>
            </div>
            
            {PROJECTS.map(proj => {
              const isActive = activeProject === proj.id;
              const isApproved = !!approvedProjects[proj.id];
              const Icon = proj.icon;
              return (
                <button
                  key={proj.id}
                  onClick={() => handleSelect(proj.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border-2 text-left transition-all ${
                    isActive 
                      ? `${proj.bgLight} shadow-sm border-opacity-100 scale-[1.01] ring-2 ring-sky-400/40` 
                      : isApproved
                        ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isApproved ? 'bg-emerald-100 text-emerald-700' : isActive ? 'bg-white shadow-xs' : 'bg-slate-100'} ${proj.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className={`font-black uppercase tracking-wide text-xs truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {proj.title}
                      </h3>
                      {isApproved && (
                        <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded shrink-0">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 leading-snug">{proj.desc}</p>
                  </div>
                </button>
              );
            })}

            {/* Quick Context Card & Progress Meter */}
            <div className="mt-auto bg-white/80 rounded-xl p-2 border border-slate-300/80 text-[10px] text-slate-600">
              <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                <span>🎯 Mission Progress</span>
                <span className="text-sky-700 font-mono font-black">{approvedCount} of 5 Completed</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(approvedCount / PROJECTS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Inspector Pad & Scope Balancer */}
          <div className="w-full md:w-[62%] lg:w-[66%] bg-[#e2e6ea] rounded-2xl shadow-[5px_10px_20px_rgba(0,0,0,0.12)] border-t border-l border-white border-b-[5px] border-r-[3px] border-slate-300 p-2.5 md:p-3 flex flex-col min-h-0 relative">
            
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 drop-shadow-xs">
                <Folder size={52} className="mb-2.5 opacity-60" />
                <h2 className="text-base md:text-lg font-black uppercase tracking-widest text-slate-700">Select a Project Plan</h2>
                <p className="text-xs font-medium text-slate-500">Pick a project option on the left to begin.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between min-h-0 gap-1.5">
                
                {/* Project Header */}
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-300 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-white shadow-xs ${selected.color}`}>
                      {React.createElement(selected.icon, { size: 22 })}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">Project Brief</span>
                        {isCurrentApproved && (
                          <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            Approved
                          </span>
                        )}
                      </div>
                      <h2 className="text-base md:text-lg font-black uppercase text-slate-800 leading-tight">
                        {selected.title}
                      </h2>
                    </div>
                  </div>

                  {/* Budget Pill */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-300 shadow-xs shrink-0">
                    <Clock size={13} className="text-slate-500" />
                    <span className="text-[11px] font-bold text-slate-700">
                      Budget: <strong className={remainingHours === 0 ? "text-emerald-600" : "text-amber-600"}>{totalAllocated}</strong>/40h
                    </span>
                  </div>
                </div>

                {/* Status / Alert Banner: Morphs between Failure Trap, Rejection, and Approval */}
                <div className="shrink-0">
                  {step === 'FAIL_SCOPE' && rejectionReason ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-rose-50 border border-rose-300 rounded-lg px-2.5 py-1.5 shadow-xs flex items-center gap-2"
                    >
                      <ShieldAlert className="text-rose-600 shrink-0" size={16} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-1.5 py-0.2 rounded">Scope Rejected</span>
                          <span className="text-[10px] text-rose-600 font-semibold truncate">Adjust +/- hours below to fix</span>
                        </div>
                        <p className="text-[11px] font-semibold text-rose-950 leading-tight mt-0.5">{rejectionReason}</p>
                      </div>
                    </motion.div>
                  ) : isCurrentApproved ? (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1.5 shadow-xs flex items-center gap-2">
                      <ShieldCheck className="text-emerald-600 shrink-0" size={16} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded">Charter Approved</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">Scope verified successfully!</span>
                        </div>
                        <p className="text-[11px] font-medium text-emerald-950 leading-tight mt-0.5">
                          {approvedCount < PROJECTS.length 
                            ? `Great job! Click 'Next Project Brief' below to analyze the remaining ${PROJECTS.length - approvedCount} projects.`
                            : "Excellent! You have successfully balanced and approved all 5 capstone project types."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1.5 shadow-xs flex items-center gap-2">
                      <AlertOctagon className="text-amber-600 shrink-0" size={16} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded">Common Trap</span>
                          <span className="text-[10px] text-amber-700 font-semibold">Avoid this failure mode</span>
                        </div>
                        <p className="text-[11px] font-medium text-amber-950 leading-tight mt-0.5">{selected.anecdote}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scope Balancer Controls */}
                <div className="bg-white rounded-xl p-2.5 border border-slate-300/80 shadow-xs flex-1 flex flex-col justify-between min-h-0">
                  <div className="flex items-center justify-between mb-1 shrink-0">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Scope Balancer (40 Hours Total)</h4>
                      <p className="text-[10px] text-slate-500">Distribute hours between phases to protect your project.</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        remainingHours === 0 ? "bg-emerald-100 text-emerald-800" :
                        remainingHours > 0 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {remainingHours === 0 ? "Balanced (40h)" : `${Math.abs(remainingHours)}h ${remainingHours > 0 ? 'Remaining' : 'Over'}`}
                      </span>
                    </div>
                  </div>

                  {/* Stepper Rows */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-around py-0.5">
                    {PHASE_KEYS.map(key => {
                      const ph = selected.phases[key];
                      const val = allocations[key];
                      const pct = Math.round((val / TOTAL_BUDGET) * 100);
                      return (
                        <div key={key} className="bg-slate-50 rounded-lg px-2.5 py-1 border border-slate-200 flex items-center justify-between gap-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-xs mb-0.5">
                              <div className="flex items-center gap-1.5 min-w-0 truncate">
                                <span className="font-bold text-slate-800 text-[11px] truncate">{ph.label}</span>
                                <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded shrink-0">
                                  {ph.reqTag}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-[10px] text-slate-600 shrink-0 ml-1">{val}h ({pct}%)</span>
                            </div>
                            
                            {/* Visual Mini Progress Bar */}
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-sky-600 transition-all duration-200 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          {/* Stepper Controls (+/- 5h) */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => adjustHours(key, -STEP_SIZE)}
                              disabled={val <= 0}
                              className="w-7 h-7 rounded-md bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 transition-transform"
                              title={`Subtract ${STEP_SIZE} hours`}
                            >
                              <Minus size={12} />
                            </button>
                            
                            <div className="w-8 text-center font-mono font-black text-xs text-slate-800">
                              {val}h
                            </div>

                            <button
                              onClick={() => adjustHours(key, STEP_SIZE)}
                              disabled={remainingHours <= 0}
                              className="w-7 h-7 rounded-md bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-95 transition-transform"
                              title={`Add ${STEP_SIZE} hours`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Deliverables Checklist Chips */}
                <div className="bg-white/80 rounded-lg px-2.5 py-1.5 border border-slate-300/70 shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Required Deliverables</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                    {selected.deliverables.map((del, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-slate-100/90 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-medium border border-slate-200/80 truncate">
                        <CheckCircle2 size={11} className="text-sky-600 shrink-0" />
                        <span className="truncate">{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-1 shrink-0 relative">
                  {isCurrentApproved ? (
                    approvedCount === PROJECTS.length ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider bg-emerald-600 text-white shadow-md cursor-default"
                      >
                        <ShieldCheck size={18} />
                        🎉 All 5 Charters Approved! Lab Complete
                      </button>
                    ) : (
                      <button
                        onClick={handleNextProject}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white shadow-md cursor-pointer transition-all"
                      >
                        <Sparkles size={18} />
                        Next Project Brief ({approvedCount}/5 Completed) →
                      </button>
                    )
                  ) : (
                    <button
                      onClick={handleAuthorize}
                      disabled={totalAllocated !== TOTAL_BUDGET}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all ${
                        totalAllocated === TOTAL_BUDGET
                          ? 'bg-slate-800 text-white shadow-md hover:bg-slate-700 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {totalAllocated !== TOTAL_BUDGET ? (
                        <>
                          <Clock size={16} />
                          {remainingHours > 0 
                            ? `Allocate ${remainingHours}h More to Authorize` 
                            : `Remove ${Math.abs(remainingHours)}h to Reach 40h`}
                        </>
                      ) : (
                        <>
                          <Signature size={18} />
                          Authorize {selected.title} Charter
                        </>
                      )}
                    </button>
                  )}

                  {/* Physical Stamp Animation Overlays */}
                  <AnimatePresence>
                    {step === 'FAIL_SCOPE' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 2.2, rotate: -12 }}
                        animate={{ opacity: 1, scale: 1, rotate: -12 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-30"
                      >
                        <div className="border-4 border-rose-600 text-rose-600 px-4 py-1 rounded-xl bg-white/95 backdrop-blur-md shadow-2xl">
                          <h2 className="text-xl font-black uppercase tracking-widest">Scope Rejected</h2>
                        </div>
                      </motion.div>
                    )}
                    
                    {isCurrentApproved && !rejectionReason && (
                      <motion.div
                        initial={{ opacity: 0, scale: 2.2, rotate: 8 }}
                        animate={{ opacity: 1, scale: 1, rotate: 8 }}
                        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-30"
                      >
                        <div className="border-4 border-emerald-600 text-emerald-600 px-4 py-1 rounded-xl bg-white/95 backdrop-blur-md shadow-2xl">
                          <h2 className="text-xl font-black uppercase tracking-widest">Charter Approved</h2>
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
        isActive={approvedCount === PROJECTS.length} 
        message="Mastery Complete! You have successfully balanced and approved all 5 Grade 9 Capstone projects!" 
        hideModal={true}
      />
    </LabShell>
  );
}
