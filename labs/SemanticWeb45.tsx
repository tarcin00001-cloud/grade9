"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import LabShell from "@/components/LabShell";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { 
  Network, BookOpen, User, Calendar, 
  Apple, Laptop, TreeDeciduous, Factory, Cookie,
  Users, Presentation, GraduationCap,
  Microchip, Activity, 
  CheckCircle2, AlertCircle, ArrowRight, Sparkles, DatabaseZap, Cpu, Trophy, Power, Database,
  Search, Pin, FileText, Check, Paperclip, Map
} from "lucide-react";

interface Triple {
  sub: string;
  pred: string;
  obj: string;
}

interface LevelData {
  id: number;
  title: string;
  desc: string;
  nodes: { id: string; label: string; icon: React.ReactNode }[];
  predicates: string[];
  targetTriples: Triple[];
}

const LEVELS: LevelData[] = [
  {
    id: 1,
    title: "Level 1: The Basics",
    desc: "Build basic Subject → Predicate → Object relationships (Triples).",
    nodes: [
      { id: "shakespeare", label: "William Shakespeare", icon: <User size={24} /> },
      { id: "hamlet", label: "Hamlet", icon: <BookOpen size={24} /> },
      { id: "1564", label: "Year 1564", icon: <Calendar size={24} /> }
    ],
    predicates: ["authored", "born_in", "hates"],
    targetTriples: [
      { sub: "shakespeare", pred: "authored", obj: "hamlet" },
      { sub: "shakespeare", pred: "born_in", obj: "1564" }
    ]
  },
  {
    id: 2,
    title: "Level 2: Context Matters",
    desc: "Teach the AI the difference between ambiguous words using context.",
    nodes: [
      { id: "apple_inc", label: "Apple Inc.", icon: <Laptop size={24} /> },
      { id: "apple_fruit", label: "Apple (Fruit)", icon: <Apple size={24} /> },
      { id: "iphone", label: "iPhone", icon: <Microchip size={24} /> },
      { id: "tree", label: "Tree", icon: <TreeDeciduous size={24} /> },
      { id: "tech_co", label: "Tech Company", icon: <Factory size={24} /> },
      { id: "food", label: "Food", icon: <Cookie size={24} /> }
    ],
    predicates: ["is_a", "produces", "grows_on"],
    targetTriples: [
      { sub: "apple_inc", pred: "is_a", obj: "tech_co" },
      { sub: "apple_inc", pred: "produces", obj: "iphone" },
      { sub: "apple_fruit", pred: "is_a", obj: "food" },
      { sub: "apple_fruit", pred: "grows_on", obj: "tree" }
    ]
  },
  {
    id: 3,
    title: "Level 3: Data Modelling",
    desc: "Map out classroom dependencies so an AI could query relationships.",
    nodes: [
      { id: "alice", label: "Student Alice", icon: <User size={24} /> },
      { id: "bob", label: "Student Bob", icon: <Users size={24} /> },
      { id: "mr_smith", label: "Mr. Smith", icon: <GraduationCap size={24} /> },
      { id: "project_x", label: "Project Alpha", icon: <Presentation size={24} /> }
    ],
    predicates: ["teaches", "works_on", "partners_with"],
    targetTriples: [
      { sub: "alice", pred: "works_on", obj: "project_x" },
      { sub: "bob", pred: "works_on", obj: "project_x" },
      { sub: "mr_smith", pred: "teaches", obj: "alice" },
      { sub: "alice", pred: "partners_with", obj: "bob" }
    ]
  }
];

export default function SemanticWeb45() {
  const { playClick, playPop, playSuccess, playError } = useLabAudio();
  const { width, height } = useWindowSize();
  const isMounted = useRef(false);
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  
  const levelData = LEVELS[currentLevel];
  
  // Builder State
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedPred, setSelectedPred] = useState<string | null>(null);
  const [selectedObj, setSelectedObj] = useState<string | null>(null);
  
  // Progress State
  const [learnedTriples, setLearnedTriples] = useState<Triple[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // AI Query Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  
  // Physical Switch state (for animation)
  const [isLeverPulled, setIsLeverPulled] = useState(false);

  const levelPassed = learnedTriples.length === levelData.targetTriples.length;

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Sequence for the AI Query Tracer
  useEffect(() => {
    if (!isSimulating) return;
    
    let timer1: any, timer2: any, timer3: any, timer4: any;

    if (simStep === 1) {
       timer1 = setTimeout(() => setSimStep(2), 2000);
    } else if (simStep === 2) {
       timer2 = setTimeout(() => setSimStep(3), 1500);
    } else if (simStep === 3) {
       timer3 = setTimeout(() => setSimStep(4), 1500);
    } else if (simStep === 4) {
       timer4 = setTimeout(() => {
           setIsSimulating(false);
           setWin(true);
           if (playSuccess) playSuccess();
           if ((window as any).reportComplete) {
              (window as any).reportComplete();
           }
       }, 3000);
    }

    return () => {
        clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4);
    };
  }, [isSimulating, simStep, playSuccess]);

  const handleNodeClick = (nodeId: string) => {
    if (playClick) playClick();
    setErrorMsg(null);
    
    // Toggle off if clicking the currently selected subject
    if (selectedSub === nodeId) {
        setSelectedSub(null);
        setSelectedPred(null);
        setSelectedObj(null);
        return;
    }
    
    // Toggle off if clicking the currently selected object
    if (selectedObj === nodeId) {
        setSelectedObj(null);
        return;
    }

    if (!selectedSub) {
      setSelectedSub(nodeId);
    } else if (selectedSub && !selectedPred) {
      // Swapping the subject gracefully
      setSelectedSub(nodeId);
    } else if (selectedSub && selectedPred) {
      setSelectedObj(nodeId);
    }
  };

  const handlePredClick = (pred: string) => {
    if (playClick) playClick();
    setErrorMsg(null);
    
    // Toggle off if already selected
    if (selectedPred === pred) {
        setSelectedPred(null);
        setSelectedObj(null);
        return;
    }

    if (!selectedSub) {
      if (playError) playError();
      setErrorMsg("Place a Subject clue first!");
      return;
    }
    setSelectedPred(pred);
    setSelectedObj(null); 
  };

  const handleTransmit = () => {
    if (!selectedSub || !selectedPred || !selectedObj) return;

    // Trigger physical animation
    setIsLeverPulled(true);
    setTimeout(() => setIsLeverPulled(false), 300);

    const isValid = levelData.targetTriples.some(
      t => t.sub === selectedSub && t.pred === selectedPred && t.obj === selectedObj
    );

    const isReversed = levelData.targetTriples.some(
      t => t.sub === selectedObj && t.pred === selectedPred && t.obj === selectedSub
    );

    const alreadyLearned = learnedTriples.some(
      t => t.sub === selectedSub && t.pred === selectedPred && t.obj === selectedObj
    );

    setTimeout(() => {
        if (alreadyLearned) {
          if (playError) playError();
          setErrorMsg("Evidence already pinned to board!");
          setSelectedSub(null);
          setSelectedPred(null);
          setSelectedObj(null);
          return;
        }

        if (isReversed) {
            if (playError) playError();
            setErrorMsg("Check your direction. Does that make sense?");
            setSelectedSub(null);
            setSelectedPred(null);
            setSelectedObj(null);
            return;
        }

        if (isValid) {
          if (playSuccess) playSuccess();
          setLearnedTriples([...learnedTriples, { sub: selectedSub, pred: selectedPred, obj: selectedObj }]);
          setSelectedSub(null);
          setSelectedPred(null);
          setSelectedObj(null);
          setErrorMsg(null);
        } else {
          if (playError) playError();
          setErrorMsg("Doesn't fit. Invalid relationship!");
          setSelectedSub(null);
          setSelectedPred(null);
          setSelectedObj(null);
        }
    }, 400);
  };

  const nextLevel = () => {
    if (currentLevel === LEVELS.length - 1) {
      setIsSimulating(true);
      setSimStep(1);
      if (playPop) playPop();
    } else {
      if (playPop) playPop();
      setCurrentLevel(currentLevel + 1);
      setLearnedTriples([]);
      setSelectedSub(null);
      setSelectedPred(null);
      setSelectedObj(null);
      setErrorMsg(null);
    }
  };

  const getNodeLabel = (id: string) => levelData.nodes.find(n => n.id === id)?.label || id;
  const getNodeIcon = (id: string) => levelData.nodes.find(n => n.id === id)?.icon;

  const handleReset = () => {
    if (playPop) playPop();
    setCurrentLevel(0);
    setLearnedTriples([]);
    setSelectedSub(null);
    setSelectedPred(null);
    setSelectedObj(null);
    setErrorMsg(null);
    setIsSimulating(false);
    setSimStep(0);
    setWin(false);
  };

  // Helper for rendering the physical polaroids
  const renderPolaroid = (node: any, isSelected: boolean, context: "box" | "clipboard") => {
      // Add slight randomized rotation in the unsorted box
      const randomRotation = context === "box" && !isSelected ? (node.id.length % 5) - 2 : 0;
      
      return (
          <motion.button
              layoutId={`node-${node.id}`}
              onClick={() => handleNodeClick(node.id)}
              disabled={isSimulating}
              className={`relative flex flex-col items-center justify-center text-center transition-all bg-white border border-slate-200 shadow-md ${
                  context === "box" 
                  ? "w-full p-2 pb-5 min-h-[70px] md:min-h-[90px] hover:shadow-lg hover:-translate-y-1" 
                  : "w-full h-full p-2 pb-4 shadow-sm"
              }`}
              style={{ rotate: randomRotation, borderRadius: '2px' }}
          >
              <div className="mb-1 md:mb-2 text-slate-700 bg-slate-50 p-1.5 md:p-2 border border-slate-100 rounded-sm">
                  {node.icon}
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-slate-800 leading-tight line-clamp-2 px-1 font-sans">
                  {node.label}
              </span>
              
              {/* Fake tape piece when in the box */}
              {context === "box" && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/50 backdrop-blur-sm border border-white/50 rotate-[-4deg] shadow-sm" 
                       style={{ clipPath: 'polygon(0 10%, 100% 0, 95% 90%, 5% 100%)'}} />
              )}
          </motion.button>
      );
  };

  return (
    <LabShell 
      labId="semanticweb45" 
      title="The Semantic Web" 
      bgOverride="bg-[#E5D3B3]" // Base cork color
      instruction="Pin evidence together to build a complete case graph."
      onReset={handleReset}
    >
        {win && (
            <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
                <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-[#FDFBF7]/95 backdrop-blur-md border-4 border-green-600 p-6 md:p-8 rounded-lg shadow-2xl flex flex-col items-center text-center max-w-sm pointer-events-auto relative"
                    style={{ clipPath: 'polygon(1% 0, 100% 2%, 99% 100%, 0 98%)' }}
                >
                    <div className="absolute -top-3 left-6 text-red-500"><Pin size={32} fill="currentColor"/></div>
                    
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 mt-2">
                        <Trophy size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 font-sans">Case Closed!</h2>
                    <p className="text-slate-600 font-medium text-sm">
                        You have successfully mapped out the evidence and constructed a complete Knowledge Graph!
                    </p>
                </motion.div>
            </div>
        )}

      {/* CORK TEXTURE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/5 to-black/20" />

      <div className="flex-1 min-h-0 w-full flex flex-col relative font-sans max-w-7xl mx-auto z-10 px-2 sm:px-0">
        
        {/* HEADER (Manila Folder Tab) */}
        <div className="bg-[#FDF9EE] border border-[#E2D8B9] shadow-md rounded-lg py-3 px-5 flex flex-col md:flex-row items-center justify-between shrink-0 mb-4 gap-3 z-20 relative">
            <div className="flex flex-col">
                <div className="text-[#92400E] font-bold text-xs uppercase tracking-wide flex items-center gap-2">
                    <FileText size={14} /> Case File {levelData.id}
                </div>
                <div className="text-slate-700 font-semibold text-sm md:text-base mt-1">{levelData.title}: {levelData.desc}</div>
            </div>
            <div className="flex gap-2 items-center bg-[#FEFCE8] border border-[#FEF08A] shadow-inner p-2 px-4 rounded-md">
                {Array.from({length: levelData.targetTriples.length}).map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < learnedTriples.length ? 'bg-red-500 shadow-sm' : 'bg-[#E5E7EB] shadow-inner border border-slate-300'}`} />
                ))}
                <div className={`ml-2 text-xs font-bold ${levelPassed ? "text-green-600" : "text-slate-500"}`}>
                    {levelPassed ? <span className="flex items-center gap-1"><CheckCircle2 size={16} /> Complete</span> : "Pending"}
                </div>
            </div>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 pb-4">
            
            {/* COLUMN 1: EVIDENCE BOX */}
            <div className="col-span-1 lg:col-span-3 bg-[#D4C4A8] border border-[#BBA580] rounded-xl flex flex-col overflow-hidden relative shadow-[inset_0_10px_20px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.2)] lg:min-h-0 min-h-[220px]">
                <div className="bg-[#BBA580] pt-2 pb-2 px-4 border-b border-[#A38D64] flex justify-center items-center shrink-0">
                    <div className="font-bold text-[#5C4D32] flex items-center gap-2 text-xs">
                        <Paperclip size={14} /> Unsorted Clues
                    </div>
                </div>
                
                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 h-full" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
                        {levelData.nodes.map(node => {
                            const isSelected = selectedSub === node.id || selectedObj === node.id;
                            return (
                                <div key={node.id} className="relative w-full h-full flex items-center justify-center">
                                    {isSelected ? (
                                        <div className="w-full h-full bg-[#C7B596] rounded-sm border-2 border-dashed border-[#A38D64] flex items-center justify-center opacity-50" />
                                    ) : (
                                        renderPolaroid(node, false, "box")
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* COLUMN 2: CLIPBOARD (Builder) */}
            <div className="col-span-1 lg:col-span-4 flex flex-col relative lg:min-h-0 min-h-[450px] items-center">
                
                <div className="w-full max-w-sm flex-1 min-h-0 bg-[#FDFBF7] border border-[#E2D8B9] rounded-sm shadow-[2px_10px_25px_rgba(0,0,0,0.15)] flex flex-col relative mt-3">
                    {/* Clipboard Clip */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-300 rounded-t-lg border-2 border-slate-400 shadow-md flex justify-center items-end pb-1 z-10">
                        <div className="w-16 h-1.5 bg-slate-400 rounded-full" />
                    </div>

                    <div className="pt-5 pb-2 px-4 border-b border-slate-200 flex justify-center items-center shrink-0">
                        <div className="font-bold text-slate-500 text-xs">Analysis Desk</div>
                    </div>

                    {/* AI Tracer (The Detective's Deduction) */}
                    <AnimatePresence>
                        {isSimulating && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 bg-white/95 backdrop-blur-sm rounded-sm flex flex-col items-center justify-center p-6 text-center border-2 border-red-500"
                            >
                                <motion.div 
                                    animate={{ rotate: [-5, 5, -5], x: [-10, 10, -10] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-red-500 mb-4"
                                >
                                    <Search size={48} />
                                </motion.div>
                                <h3 className="font-bold text-red-600 text-lg mb-4">Drawing Conclusions...</h3>
                                
                                <div className="w-full text-left flex flex-col p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="text-xs font-semibold text-slate-700 mb-2">Question:</div>
                                    <div className="text-sm font-bold text-slate-900 border-b border-red-200 pb-3 mb-3">
                                        "Who teaches the student working on Project Alpha?"
                                    </div>
                                    <div className="flex flex-col gap-2 min-h-[80px]">
                                        <AnimatePresence>
                                            {simStep >= 2 && (
                                                <motion.div key="trace-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm">
                                                    <span className="text-red-500 font-bold">1. </span> 
                                                    [Project Alpha] is worked on by <span className="font-bold">[Alice]</span>
                                                </motion.div>
                                            )}
                                            {simStep >= 3 && (
                                                <motion.div key="trace-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm mt-1">
                                                    <span className="text-red-500 font-bold">2. </span> 
                                                    [Alice] is taught by <span className="font-bold">[Mr. Smith]</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <AnimatePresence>
                                        {simStep >= 4 && (
                                            <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                              className="mt-4 p-3 rounded-md text-center border-2 border-red-500 bg-white shadow-md relative"
                                            >
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">CONCLUSION</div>
                                                <div className="text-xl font-bold text-slate-900 mt-1">Mr. Smith</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex-1 p-4 flex flex-col items-center justify-center relative z-10 min-h-0 w-full">
                        
                        {/* Error Sticky Note */}
                        <AnimatePresence>
                            {errorMsg && (
                                <motion.div 
                                    key="errorMsg"
                                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute top-2 z-20 font-bold text-red-700 bg-red-100 px-4 py-3 shadow-md flex items-center gap-2 text-sm border border-red-200"
                                    style={{ clipPath: 'polygon(0 0, 100% 2%, 98% 100%, 2% 98%)' }}
                                >
                                    <Pin size={16} className="text-red-500 -ml-2 -mt-2 shrink-0" /> {errorMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pipeline */}
                        <div className="w-full max-w-[220px] flex flex-col items-center flex-1 justify-center relative min-h-0">
                            
                            {/* Subject Slot */}
                            <div className="w-full h-[75px] md:h-[90px] rounded-sm flex items-center justify-center relative shrink-0">
                                {selectedSub ? (
                                    <div className="w-full h-full relative">
                                        {renderPolaroid(levelData.nodes.find(n=>n.id===selectedSub), true, "clipboard")}
                                        {/* Red string starting point */}
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-600 shadow-sm z-10 border border-red-800" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full border-2 border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center rounded-sm text-slate-400 font-semibold text-xs">
                                        Place Subject
                                    </div>
                                )}
                            </div>

                            {/* Connection (Red String + Sticky Note) */}
                            <div className="w-full my-4 flex flex-col items-center relative z-10 shrink-0">
                                {/* The String Line */}
                                <div className="absolute inset-y-0 left-1/2 w-1 bg-red-600 -translate-x-1/2 -z-10 shadow-sm" />
                                
                                <div className="bg-[#FEF08A] shadow-sm p-3 w-[110%] border border-[#FDE047] rotate-1 relative" style={{ clipPath: 'polygon(0 0, 100% 2%, 99% 100%, 1% 98%)' }}>
                                    <div className="text-center font-bold text-slate-700 text-[10px] mb-2 border-b border-yellow-300 pb-1 uppercase tracking-wider">Relationship</div>
                                    <div className="flex flex-col gap-1.5">
                                        {levelData.predicates.map(pred => (
                                            <button
                                                key={pred}
                                                onClick={() => handlePredClick(pred)}
                                                disabled={isSimulating}
                                                className={`relative w-full h-7 md:h-8 rounded-sm transition-all flex items-center justify-center font-bold text-[10px] md:text-xs ${
                                                    selectedPred === pred 
                                                    ? 'bg-slate-800 text-white shadow-md scale-105' 
                                                    : 'bg-yellow-50 text-slate-700 border border-yellow-200 hover:bg-white'
                                                }`}
                                            >
                                                {pred.replace(/_/g, " ")}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Object Slot */}
                            <div className="w-full h-[75px] md:h-[90px] rounded-sm flex items-center justify-center relative shrink-0">
                                {selectedObj ? (
                                    <div className="w-full h-full relative">
                                        {/* Red string ending point */}
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-600 shadow-sm z-10 border border-red-800" />
                                        {renderPolaroid(levelData.nodes.find(n=>n.id===selectedObj), true, "clipboard")}
                                    </div>
                                ) : (
                                    <div className="w-full h-full border-2 border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center rounded-sm text-slate-400 font-semibold text-xs">
                                        Place Object
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MASTER TRANSMIT BUTTON */}
                        <div className="w-full max-w-[220px] mt-6 shrink-0">
                            <button
                                onClick={handleTransmit}
                                disabled={!selectedSub || !selectedPred || !selectedObj || isSimulating || isLeverPulled}
                                className={`relative w-full h-12 md:h-14 rounded-md font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2 ${
                                    selectedSub && selectedPred && selectedObj
                                    ? isLeverPulled
                                        ? 'bg-red-700 text-white translate-y-[4px] shadow-none'
                                        : 'bg-red-600 text-white shadow-[0_4px_0_#991B1B] hover:bg-red-500 hover:shadow-[0_4px_0_#991B1B]'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                }`}
                            >
                                <Pin size={18} className={selectedSub && selectedPred && selectedObj ? "-rotate-45" : ""} /> 
                                Pin to Board
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMN 3: THE BOARD (Knowledge Graph) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col relative lg:min-h-0 min-h-[400px]">
                
                {/* Board Frame inner shadow */}
                <div className="absolute inset-0 border-[12px] border-[#5C4D32] rounded-lg shadow-xl pointer-events-none z-20" />
                <div className="absolute inset-0 border-[14px] border-[#3E3320] rounded-lg pointer-events-none z-20 opacity-50" />
                
                <div className="bg-[#5C4D32]/90 backdrop-blur-sm pt-3 pb-2 px-6 flex justify-between items-center shrink-0 z-10 ml-[12px] mr-[12px] mt-[12px] rounded-t-sm shadow-sm border-b border-[#3E3320]">
                    <div className="font-bold text-white flex items-center gap-2 text-sm">
                        <Map size={16} /> Evidence Map
                    </div>
                    <div className="text-xs font-bold text-white/90 bg-black/30 px-3 py-1 rounded-full">
                        {learnedTriples.length} / {levelData.targetTriples.length} Found
                    </div>
                </div>

                <div className="flex-1 p-4 md:p-6 flex flex-col min-h-0 overflow-hidden relative z-10 mx-[12px] mb-[12px]">
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4 justify-center">
                        <AnimatePresence>
                            {learnedTriples.length === 0 && (
                                <motion.div key="empty" className="h-full flex flex-col items-center justify-center space-y-3 opacity-70">
                                    <Pin size={32} className="text-[#8B7355] rotate-12" />
                                    <span className="text-xs font-bold text-[#8B7355] text-center">Board is empty.<br/>Pin connections to build the case.</span>
                                </motion.div>
                            )}

                            {learnedTriples.map((t, index) => {
                                const isGlowing = isSimulating && (
                                    (simStep >= 2 && t.obj === "project_x") ||
                                    (simStep >= 3 && t.sub === "mr_smith" && t.obj === "alice")
                                );
                                
                                // Randomize slight rotations for the board items to look natural
                                const rot = (index % 3) * 2 - 2;

                                return (
                                    <motion.div
                                        key={`${t.sub}-${t.pred}-${t.obj}`}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="relative flex items-center justify-between gap-2 flex-1 min-h-0 max-h-[110px] w-full"
                                        style={{ rotate: rot }}
                                    >
                                        {/* Red String Connecting them */}
                                        <div className={`absolute top-1/2 left-[15%] right-[15%] h-[3px] -translate-y-1/2 z-0 transition-colors duration-300 ${isGlowing ? 'bg-red-400 shadow-[0_0_12px_#EF4444]' : 'bg-red-700/80'}`} />

                                        {/* Subject Polaroid */}
                                        <div className={`relative bg-white p-2 pb-4 shadow-md border border-slate-200 rounded-sm flex flex-col items-center justify-center w-[30%] max-w-[100px] z-10 transition-all ${isGlowing ? 'ring-4 ring-red-500 scale-105' : ''}`}>
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-red-600"><Pin size={16} fill="currentColor" className="-rotate-12"/></div>
                                            <div className="bg-slate-50 p-1.5 sm:p-2 border border-slate-100 rounded-sm mb-1 sm:mb-2 text-slate-700">
                                                {getNodeIcon(t.sub)}
                                            </div>
                                            <span className="text-[8px] sm:text-[10px] font-bold text-slate-800 text-center leading-tight truncate w-full">{getNodeLabel(t.sub)}</span>
                                        </div>
                                        
                                        {/* Predicate Label (Sticky note or tape) */}
                                        <div className={`z-10 bg-[#FEF08A] px-2 py-1 shadow-md border border-[#FDE047] rotate-[-3deg] transition-all ${isGlowing ? 'ring-4 ring-red-500 scale-125' : ''}`}>
                                            <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap">
                                                {t.pred.replace(/_/g, " ")}
                                            </span>
                                        </div>

                                        {/* Object Polaroid */}
                                        <div className={`relative bg-white p-2 pb-4 shadow-md border border-slate-200 rounded-sm flex flex-col items-center justify-center w-[30%] max-w-[100px] z-10 transition-all ${isGlowing ? 'ring-4 ring-red-500 scale-105' : ''}`}>
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-red-600"><Pin size={16} fill="currentColor" className="rotate-12"/></div>
                                            <div className="bg-slate-50 p-1.5 sm:p-2 border border-slate-100 rounded-sm mb-1 sm:mb-2 text-slate-700">
                                                {getNodeIcon(t.obj)}
                                            </div>
                                            <span className="text-[8px] sm:text-[10px] font-bold text-slate-800 text-center leading-tight truncate w-full">{getNodeLabel(t.obj)}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {levelPassed && !win && !isSimulating && (
                            <motion.div 
                                key="graph-complete"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="mt-4 p-4 bg-white border-2 border-green-500 rounded-md flex flex-col items-center justify-center gap-3 shrink-0 shadow-lg relative overflow-hidden"
                                style={{ clipPath: 'polygon(1% 0, 100% 2%, 99% 100%, 0 98%)' }}
                            >
                                <div className="absolute -top-1.5 left-4 text-red-600"><Pin size={24} fill="currentColor"/></div>
                                <div className="absolute -bottom-1.5 right-4 text-red-600 rotate-180"><Pin size={24} fill="currentColor"/></div>
                                
                                <div className="flex items-center gap-2 text-green-700 font-bold text-sm md:text-base">
                                    <CheckCircle2 size={18} /> Evidence Complete
                                </div>
                                <button 
                                    onClick={nextLevel}
                                    className="w-full relative z-10 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs md:text-sm rounded-sm shadow-[0_3px_0_#166534] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    {currentLevel === LEVELS.length - 1 ? (
                                        <>Draw Conclusion <Search size={14} /></>
                                    ) : (
                                        <>Next Case File <ArrowRight size={14} /></>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </div>
      </div>
    </LabShell>
  );
}
