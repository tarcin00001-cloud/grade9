"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { FileDigit, Play, CheckCircle, XCircle, Zap, RefreshCw } from "lucide-react";
import Univac3DScene from "@/components/Univac3DScene";

type ComponentId = "tubes" | "drives" | "memory" | "printer";

const COMPONENTS = [
  {
    id: "tubes" as ComponentId,
    name: "Vacuum Tubes",
    svg: "/svgs/vaccum_tube.svg",
    desc: "Acts like tiny light bulbs that do math calculations.",
    keywords: [
      "5,200 Tubes",
      "1,905 Steps / Sec",
      "Needs huge room coolers",
      "Gets super hot!"
    ],
    technical: "They weighed as much as two trucks! If the cooling stopped, office fans were used to blow away the heat."
  },
  {
    id: "drives" as ComponentId,
    name: "Tape Drives",
    svg: "/svgs/tape_drive.svg",
    desc: "America's first big magnetic tapes to store files.",
    keywords: [
      "Tape storage",
      "12,800 Letters / Sec",
      "No punch cards",
      "Holds 1.4M Letters"
    ],
    technical: "Long metal tapes saved massive lists of names, replacing heavy boxes of cardboard cards."
  },
  {
    id: "memory" as ComponentId,
    name: "Mercury Memory",
    svg: "/svgs/mercury_memory.svg",
    desc: "Liquid metal tanks that store memory using sound waves!",
    keywords: [
      "Liquid Mercury",
      "Stores 1,000 numbers max",
      "Sound wave memory",
      "12-digit numbers"
    ],
    technical: "Saved numbers by sending sound waves bouncing back and forth through warm liquid mercury metal."
  },
  {
    id: "printer" as ComponentId,
    name: "Uniprinter",
    svg: "/svgs/uniprinter.svg",
    desc: "A fast typewriter printer to print results on paper.",
    keywords: [
      "Prints on paper",
      "Reads directly from tape",
      "Counted the US population",
      "1952 election winner"
    ],
    technical: "Printed rows of text directly from the magnetic data tapes, so people didn't have to type them by hand."
  },
];


// Layout mapping percentages onto the univac_computer_model.svg (Aspect: 1264 x 843)
const SLOT_POSITIONS: Record<ComponentId, { left: string; top: string; width: string; height: string }> = {
  memory: { left: "11%", top: "45%", width: "16%", height: "22%" },
  tubes: { left: "37%", top: "37%", width: "16%", height: "22%" },
  printer: { left: "62%", top: "62%", width: "17%", height: "24%" },
  drives: { left: "70%", top: "27%", width: "17%", height: "24%" },
};

const Sparks = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(16)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-amber-400"
        initial={{ x: "50%", y: "50%", scale: 1, opacity: 1 }}
        animate={{
          x: `${50 + (Math.random() - 0.5) * 160}%`,
          y: `${50 + (Math.random() - 0.5) * 160}%`,
          scale: 0,
          opacity: 0,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ left: "40%", top: "40%" }}
      />
    ))}
  </div>
);

const HelperBot = ({ state }: { state: "idle" | "dragging" | "success" | "fail" }) => {
  let face = "NEUTRAL";
  let bodyColor = "#f59e0b"; // warm yellow (friendly toy robot)
  let armPathRight = "M 22,25 C 26,25 28,25 32,25";
  let armPathLeft = "M 8,25 C 4,25 2,25 -2,25";

  if (state === "dragging") {
    face = "SURPRISED";
    bodyColor = "#3b82f6"; // bright blue wiggling
    armPathLeft = "M 8,22 C 3,18 0,16 -5,18";
    armPathRight = "M 22,22 C 18,18 15,16 10,18";
  } else if (state === "success") {
    face = "‿";
    bodyColor = "#10b981"; // green cheer
    armPathLeft = "M 8,20 C 4,12 2,8 -2,4";
    armPathRight = "M 22,20 C 26,12 28,8 32,4";
  } else if (state === "fail") {
    face = "_";
    bodyColor = "#ef4444"; // red dizzy
    armPathLeft = "M 8,25 C 5,32 4,36 2,42";
    armPathRight = "M 22,25 C 25,32 26,36 28,42";
  }

  return (
    <motion.div
      animate={
        state === "dragging"
          ? { y: [0, -4, 0], rotate: [-4, 4, -4] }
          : state === "success"
            ? { y: [0, -8, 0], scale: [1, 1.15, 1] }
            : state === "idle"
              ? { y: [0, -2, 0] }
              : {}
      }
      transition={
        state === "dragging"
          ? { repeat: Infinity, duration: 0.3 }
          : state === "success"
            ? { repeat: 3, duration: 0.25 }
            : state === "idle"
              ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
              : {}
      }
      className="w-12 h-14 drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]"
    >
      <svg width="48" height="56" viewBox="0 0 40 48" className="overflow-visible">
        <ellipse cx="20" cy="44" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
        <path d={armPathLeft} stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d={armPathRight} stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="40" r="4.5" fill="#1e293b" />
        <path d="M 18,36 L 22,36 L 20,40 Z" fill="#1e293b" />
        <rect x="9" y="19" width="22" height="19" rx="5" fill={bodyColor} stroke="#1e293b" strokeWidth="2.5" />
        <rect x="12" y="22" width="16" height="10" rx="2.5" fill="#0f172a" />
        <text x="20" y="29.5" fill="#f8fafc" fontSize="9.5" fontWeight="black" fontFamily="var(--font-sans)" textAnchor="middle">{face}</text>
        <rect x="18" y="16" width="4" height="4" fill="#475569" />
        <path d="M 11,16 A 9,9 0 0,1 29,16 Z" fill={bodyColor} stroke="#1e293b" strokeWidth="2.5" />
        <line x1="20" y1="8" x2="20" y2="3" stroke="#475569" strokeWidth="2.5" />
        <circle cx="20" cy="2.5" r="3" fill="#ef4444" className={state === "dragging" ? "animate-pulse" : ""} />
      </svg>
    </motion.div>
  );
};

// Retro CRT dashboard panel casing component
const CRTConsole = ({
  title,
  children,
  powerLight = "green",
  overflowClass = "overflow-hidden"
}: {
  title: string;
  children: React.ReactNode;
  powerLight?: "green" | "red" | "amber";
  overflowClass?: string;
}) => {
  return (
    <div className="relative border-4 border-[#b8a994] bg-[#ebdcc7] rounded-3xl p-4 shadow-xl flex flex-col min-h-0 border-t-[#f5ebd7] border-b-[#998b77] overflow-visible">
      {/* Structural Screw details */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-neutral-400 border border-neutral-600 flex items-center justify-center shadow-inner"><div className="w-1.5 h-0.5 bg-neutral-700 rotate-45" /></div>
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-neutral-400 border border-neutral-600 flex items-center justify-center shadow-inner"><div className="w-1.5 h-0.5 bg-neutral-700 -rotate-45" /></div>
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-neutral-400 border border-neutral-600 flex items-center justify-center shadow-inner"><div className="w-1.5 h-0.5 bg-neutral-700 -rotate-45" /></div>
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-neutral-400 border border-neutral-600 flex items-center justify-center shadow-inner"><div className="w-1.5 h-0.5 bg-neutral-700 rotate-45" /></div>

      {/* Console label */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-[#d1c3af] font-sans text-xs md:text-sm text-[#5c5446] uppercase tracking-wide font-black">
        <span>{title}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] md:text-xs font-bold">STATUS</span>
          <span className={`w-3.5 h-3.5 rounded-full border border-black/30 ${powerLight === "green" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
              powerLight === "red" ? "bg-red-500 shadow-[0_0_8px_#ef4444]" :
                "bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"
            }`} />
        </div>
      </div>

      {/* Retro Inner Box */}
      <div className={`relative flex-1 rounded-2xl bg-white border-4 border-[#786c5c] p-3 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] flex flex-col ${overflowClass}`}>
        {/* CRT Scanline Filter */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-25 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.55)_50%)]" style={{ backgroundSize: "100% 4px" }} />
        <div className="relative z-10 flex-1 flex flex-col min-h-0 text-slate-800 font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Univac9() {
  const { reportComplete } = useLMSBridge("univac9");
  const { playClick, playPop, playSuccess, playError, playZap, playDrop } = useLabAudio();

  const [phase, setPhase] = useState<"assemble" | "run" | "quiz">("assemble");
  const [travelYear, setTravelYear] = useState(1950);
  const [timeJumped, setTimeJumped] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Time travel challenge states
  const [travelStep, setTravelStep] = useState<"jump" | "prediction" | "heatQuestion" | "countQuestion">("jump");
  const [userPrediction, setUserPrediction] = useState(50);
  const [predictionCompared, setPredictionCompared] = useState(false);
  const [heatSelected, setHeatSelected] = useState<string | null>(null);
  const [heatFeedback, setHeatFeedback] = useState<"correct" | "wrong" | null>(null);
  const [bubbleSelected, setBubbleSelected] = useState<number | null>(null);
  const [bubbleFeedback, setBubbleFeedback] = useState<"correct" | "wrong" | null>(null);

  // Assembly states
  const [placed, setPlaced] = useState<Record<ComponentId, boolean>>({
    tubes: false,
    drives: false,
    memory: false,
    printer: false,
  });
  const [sparkActive, setSparkActive] = useState<Record<ComponentId, boolean>>({
    tubes: false,
    drives: false,
    memory: false,
    printer: false,
  });
  const [errorActive, setErrorActive] = useState<Record<ComponentId, boolean>>({
    tubes: false,
    drives: false,
    memory: false,
    printer: false,
  });

  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<ComponentId | null>(null);
  const [failedDragId, setFailedDragId] = useState<ComponentId | null>(null);
  const [justPlacedId, setJustPlacedId] = useState<ComponentId | null>(null);
  const [poweringUp, setPoweringUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Voting Simulation States
  const [totalBallots, setTotalBallots] = useState(100000);
  const [voteRatio, setVoteRatio] = useState(55); // % for Eisenhower/Candidate A
  const [simCounting, setSimCounting] = useState(false);
  const [simFinished, setSimFinished] = useState(false);
  const [univacCount, setUnivacCount] = useState(0);
  const [modernCount, setModernCount] = useState(0);
  const [univacTime, setUnivacTime] = useState(0.0);
  const [modernTime, setModernTime] = useState(0.0);

  const startVotingSimulation = () => {
    if (simCounting) return;
    setSimCounting(true);
    setSimFinished(false);
    setUnivacCount(0);
    setModernCount(0);
    setUnivacTime(0);
    setModernTime(0);
    playZap();

    const intervalMs = 50;

    // We accelerate both speeds for playability but keep the scaling proportional:
    // Modern counts almost instantly (finishes in ~0.7 seconds)
    // UNIVAC counts noticeably slower (finishes in ~3.5 seconds)
    const univacIncrement = Math.ceil(totalBallots / (3000 / intervalMs));
    const modernIncrement = Math.ceil(totalBallots / (700 / intervalMs));

    let currentUnivac = 0;
    let currentModern = 0;
    let uTime = 0.0;
    let mTime = 0.0;

    const timer = setInterval(() => {
      // Ticks for Modern
      if (currentModern < totalBallots) {
        currentModern = Math.min(totalBallots, currentModern + modernIncrement);
        mTime += intervalMs / 1000;
        setModernCount(currentModern);
        setModernTime(Number(mTime.toFixed(2)));
      }

      // Ticks for UNIVAC
      if (currentUnivac < totalBallots) {
        currentUnivac = Math.min(totalBallots, currentUnivac + univacIncrement);
        uTime += intervalMs / 1000;
        setUnivacCount(currentUnivac);
        setUnivacTime(Number(uTime.toFixed(2)));
      }

      // Simulation finishes
      if (currentUnivac >= totalBallots && currentModern >= totalBallots) {
        clearInterval(timer);
        setSimCounting(false);
        setSimFinished(true);
        playSuccess();
      }
    }, intervalMs);
  };



  const triggerPowerUp = () => {
    setPoweringUp(true);
    playZap();
    setTimeout(() => playSuccess(), 1000);
    setTimeout(() => {
      setPoweringUp(false);
      setPhase("run");
    }, 2800);
  };

  const handleDragEnd = (componentId: ComponentId, info: any) => {
    const slotElement = document.getElementById(`slot-${componentId}`);
    if (!slotElement) return;
    const rect = slotElement.getBoundingClientRect();
    const { x, y } = info.point;

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      setPlaced(prev => {
        const next = { ...prev, [componentId]: true };
        setSparkActive(s => ({ ...s, [componentId]: true }));
        setJustPlacedId(componentId);
        setTimeout(() => setSparkActive(s => ({ ...s, [componentId]: false })), 700);
        setTimeout(() => setJustPlacedId(null), 1200);
        playSuccess();

        const allPlaced = Object.values(next).every(v => v);
        if (allPlaced) triggerPowerUp();

        return next;
      });
      setSelectedComponent(null);
    } else {
      // Check collision with incorrect slots to trigger warning buzzer
      let hitWrongSlot = false;
      COMPONENTS.forEach(c => {
        if (c.id !== componentId) {
          const el = document.getElementById(`slot-${c.id}`);
          if (el) {
            const r = el.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hitWrongSlot = true;
          }
        }
      });

      if (hitWrongSlot) {
        setErrorActive(s => ({ ...s, [componentId]: true }));
        setFailedDragId(componentId);
        setTimeout(() => setErrorActive(s => ({ ...s, [componentId]: false })), 700);
        setTimeout(() => setFailedDragId(null), 1200);
        playError();
      } else {
        playDrop();
      }
    }
  };

  const handleSlotClick = (slotId: ComponentId) => {
    if (!selectedComponent) return;

    if (selectedComponent === slotId) {
      setPlaced(prev => {
        const next = { ...prev, [slotId]: true };
        setSparkActive(s => ({ ...s, [slotId]: true }));
        setJustPlacedId(slotId);
        setTimeout(() => setSparkActive(s => ({ ...s, [slotId]: false })), 700);
        setTimeout(() => setJustPlacedId(null), 1200);
        playSuccess();

        const allPlaced = Object.values(next).every(v => v);
        if (allPlaced) triggerPowerUp();

        return next;
      });
      setSelectedComponent(null);
    } else {
      setErrorActive(s => ({ ...s, [slotId]: true }));
      setTimeout(() => setErrorActive(s => ({ ...s, [slotId]: false })), 700);
      playError();
      setSelectedComponent(null);
    }
  };

  const isBootable = Object.values(placed).every(v => v);

  const handleReset = () => {
    setPhase("assemble");
    setTravelYear(1950);
    setTimeJumped(false);
    setTravelStep("jump");
    setUserPrediction(50);
    setPredictionCompared(false);
    setHeatSelected(null);
    setHeatFeedback(null);
    setBubbleSelected(null);
    setBubbleFeedback(null);
    setHasWon(false);
    setPlaced({ tubes: false, drives: false, memory: false, printer: false });
    setSparkActive({ tubes: false, drives: false, memory: false, printer: false });
    setErrorActive({ tubes: false, drives: false, memory: false, printer: false });
    setSimFinished(false);
    setSimCounting(false);
  };

  return (
    <LabShell labId="univac9" theme="forge" title="UNIVAC Computing Room"
      instruction="1. Familiarize yourself with the UNIVAC simulation interface. 2. Follow the historical guide to input the initial data punch cards. 3. Run the computational sequence and monitor the vacuum tubes. 4. Record the final output and compare it with modern computing results." compact onReset={handleReset}>
      <Celebration isActive={hasWon} message={phase === "quiz" ? "You completed all the historic UNIVAC challenges!" : "You reassembled UNIVAC and validated its prediction!"} onReplay={handleReset} />

      <div ref={containerRef} className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1 relative select-none">

        {/* Booting overlay screen */}
        {poweringUp && (
          <div className="absolute inset-0 bg-[#090d16]/75 z-50 pointer-events-none flex flex-col items-center justify-center rounded-3xl backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="bg-[#ebdcc7] border-4 border-[#b8a994] p-6 rounded-3xl flex flex-col items-center justify-center shadow-2xl text-slate-800 font-sans"
            >
              <Zap className="w-10 h-10 mb-2 text-amber-500 animate-bounce" />
              <span className="text-base md:text-lg font-black tracking-normal uppercase">UNIVAC I BOOTING</span>
              <span className="text-xs md:text-sm mt-1.5 text-slate-600 font-bold uppercase animate-pulse">Setting up the tape reels...</span>
            </motion.div>
          </div>
        )}

        {/* Phase Navigation Tabs */}
        <div className="shrink-0 flex gap-3">
          <button onClick={() => { setPhase("assemble"); playPop(); }} className={`flex-1 py-3 rounded-2xl text-sm md:text-base font-black uppercase tracking-wider border-b-4 transition-all duration-100 ${phase === "assemble" ? "bg-amber-400 border-amber-600 text-amber-950 translate-y-0.5" : "bg-white/5 border-white/10 text-white/50"}`}>Assemble</button>
          <button onClick={() => { if (isBootable) { setPhase("run"); playPop(); } }} disabled={!isBootable} className={`flex-1 py-3 rounded-2xl text-sm md:text-base font-black uppercase tracking-wider border-b-4 transition-all duration-100 ${!isBootable ? "opacity-25 cursor-not-allowed" : ""} ${phase === "run" ? "bg-amber-400 border-amber-600 text-amber-950 translate-y-0.5" : "bg-white/5 border-white/10 text-white/50"}`}>Predict</button>
          <button onClick={() => { if (isBootable) { setPhase("quiz"); playPop(); } }} disabled={!isBootable} className={`flex-1 py-3 rounded-2xl text-sm md:text-base font-black uppercase tracking-wider border-b-4 transition-all duration-100 ${!isBootable ? "opacity-25 cursor-not-allowed" : ""} ${phase === "quiz" ? "bg-amber-400 border-amber-600 text-amber-950 translate-y-0.5" : "bg-white/5 border-white/10 text-white/50"}`}>Time Travel</button>
        </div>

        <AnimatePresence mode="wait">
          {phase === "assemble" && (
            <motion.div key="assemble" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex-1 flex flex-col gap-3 min-h-0">

              {/* Top Area: UNIVAC Computer 3D Model Map */}
              <div className="relative w-full border-4 border-[#b8a994] bg-white rounded-3xl overflow-hidden shadow-2xl flex-1 min-h-[250px]">
                <Univac3DScene 
                  placed={placed}
                  selectedComponent={selectedComponent}
                  hoveredComponent={hoveredComponent}
                  onSlotClick={handleSlotClick}
                  onSlotHover={setHoveredComponent}
                  poweringUp={poweringUp}
                />
              </div>

              {/* Bottom Section: Side-by-side CRT control boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">

                {/* Dossier Terminal */}
                <CRTConsole title="Specs Dossier" powerLight={hoveredComponent || selectedComponent ? "amber" : "green"}>
                  {hoveredComponent || selectedComponent ? (
                    (() => {
                      const comp = COMPONENTS.find(c => c.id === (hoveredComponent || selectedComponent));
                      return (
                        <div className="flex flex-col gap-2.5 h-full min-h-[160px] justify-center">
                          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-1.5 shrink-0">
                            <img src={comp?.svg} className="w-6 h-6 object-contain" alt={comp?.name} />
                            <h4 className="text-amber-700 font-black uppercase text-sm md:text-base tracking-normal">{comp?.name}</h4>
                          </div>

                          {/* Keyword Collection */}
                          <div className="flex flex-wrap gap-1.5 py-1 shrink-0">
                            {comp?.keywords.map((kw, i) => (
                              <span key={i} className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-black text-xs md:text-sm uppercase tracking-normal">
                                {kw}
                              </span>
                            ))}
                          </div>

                          <p className="text-slate-600 text-xs md:text-sm leading-relaxed border-t border-amber-500/20 pt-1.5">
                            {comp?.technical}
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col gap-2.5 h-full min-h-[160px] justify-center">
                      <h4 className="text-amber-700 font-black text-xs md:text-sm border-b border-amber-500/20 pb-1.5 uppercase tracking-wide">UNIVAC I Overview</h4>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                        Drag or tap the 4 components (Tubes, Tape, Memory, Printer) to assemble and start the room computer!
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-1 text-xs md:text-sm font-bold">
                        <div className="border border-amber-500/20 p-2 rounded-lg bg-amber-50 text-slate-700">
                          <span className="text-slate-500 block font-bold uppercase text-[9px] md:text-[10px] tracking-wide mb-0.5">Total Weight</span>
                          <span>16,686 lbs (As heavy as a truck)</span>
                        </div>
                        <div className="border border-amber-500/20 p-2 rounded-lg bg-amber-50 text-slate-700">
                          <span className="text-slate-500 block font-bold uppercase text-[9px] md:text-[10px] tracking-wide mb-0.5">Compute Speed</span>
                          <span>1,905 steps / sec</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CRTConsole>

                {/* Component tray */}
                <CRTConsole title="Parts Inventory" overflowClass="overflow-visible">
                  <div className="grid grid-cols-2 gap-2 h-full items-center relative overflow-visible">
                    {COMPONENTS.map(c => {
                      if (placed[c.id]) return <div key={c.id} className="h-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/10 flex items-center justify-center text-slate-500 text-xs md:text-sm font-black uppercase tracking-wide">Placed</div>;
                      return (
                        <motion.div
                          key={c.id}
                          drag
                          dragConstraints={containerRef}
                          dragElastic={0.1}
                          onDragStart={() => {
                            setHoveredComponent(c.id);
                            setActiveDragId(c.id);
                          }}
                          onDragEnd={(e, info) => {
                            setHoveredComponent(null);
                            setActiveDragId(null);
                            handleDragEnd(c.id, info);
                          }}
                          onClick={() => setSelectedComponent(c.id === selectedComponent ? null : c.id)}
                          style={{ zIndex: activeDragId === c.id ? 100 : 1 }}
                          className={`p-2 border rounded-xl flex items-center gap-2.5 cursor-grab active:cursor-grabbing transition-all select-none relative ${activeDragId === c.id
                              ? "bg-slate-100 border-amber-500 shadow-2xl scale-105"
                              : selectedComponent === c.id
                                ? "border-amber-500 bg-amber-50 shadow-lg"
                                : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                            }`}
                        >
                          <img src={c.svg} className="w-10 h-10 object-contain shrink-0" alt={c.name} />
                          <div className="min-w-0">
                            <p className="text-slate-800 font-black text-xs md:text-sm truncate">{c.name}</p>
                            <p className="text-amber-600 text-[9px] md:text-[10px] font-black uppercase tracking-wide">DRAG / TAP</p>
                          </div>

                          {/* Helper Bots inside tray to show drag states */}
                          {activeDragId === c.id && (
                            <div className="absolute -left-12 -top-4 pointer-events-none z-10">
                              <HelperBot state="dragging" />
                            </div>
                          )}
                          {failedDragId === c.id && (
                            <div className="absolute -left-12 -top-4 pointer-events-none z-10">
                              <HelperBot state="fail" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CRTConsole>

              </div>
            </motion.div>
          )}

          {phase === "run" && (
            <motion.div key="run" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col flex-1 min-h-0 gap-3">

              {/* Side-by-Side Simulation Screens */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">

                {/* Left Side: 1952 UNIVAC Vote Counting */}
                <CRTConsole title="1952 - UNIVAC I Counting" powerLight={simCounting ? "amber" : "green"}>
                  <div className="flex flex-col items-center justify-between h-full relative">

                    {/* projected year label */}
                    <div className="absolute top-2 right-2 bg-black/70 border border-amber-500/40 px-3.5 py-1.5 rounded-lg shadow-[0_0_8px_rgba(245,158,11,0.3)] z-20">
                      <span className="text-sm md:text-base font-black text-amber-400 tracking-wide font-sans">YEAR: 1952</span>
                    </div>

                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-amber-500/10 flex items-center justify-center">
                      <img src="/svgs/modern_vote_counting.svg" className="w-full h-full object-contain pointer-events-none select-none" alt="UNIVAC counting system" />

                      {/* Spinning reel indicators on top of graphic during counting */}
                      {simCounting && (
                        <div className="absolute inset-0 bg-black/15 pointer-events-none flex items-center justify-center">
                          <div className="flex gap-16 scale-75 opacity-75">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-14 h-14 rounded-full border-4 border-dashed border-amber-400" />
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-14 h-14 rounded-full border-4 border-dashed border-amber-400" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full bg-black/40 border border-amber-500/20 p-3 rounded-xl text-center font-sans">
                      <div className="flex justify-between items-center text-xs text-slate-400 border-b border-amber-500/20 pb-1.5 mb-1.5">
                        <span className="font-black">SPEED: 12.8 KB/s</span>
                        <span className="font-black">TIME: {univacTime}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-slate-300 font-black uppercase">BALLOTS PROCESSED</span>
                        <span className="text-base md:text-lg font-black text-amber-400">{univacCount.toLocaleString()} / {totalBallots.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CRTConsole>

                {/* Right Side: 2026 Modern Counter */}
                <CRTConsole title="2026 - Modern Scanner" powerLight={simCounting ? "amber" : "green"}>
                  <div className="flex flex-col items-center justify-between h-full relative">

                    {/* projected year label */}
                    <div className="absolute top-2 right-2 bg-black/70 border border-emerald-500/40 px-3.5 py-1.5 rounded-lg shadow-[0_0_8px_rgba(16,185,129,0.3)] z-20">
                      <span className="text-sm md:text-base font-black text-emerald-400 tracking-wide font-sans">YEAR: 2026</span>
                    </div>

                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/10 flex items-center justify-center">
                      <img src="/svgs/univac_vote_counting.svg" className="w-full h-full object-contain pointer-events-none select-none" alt="Modern counting scanner" />

                      {/* Laser scanning bar overlay during counting */}
                      {simCounting && (
                        <motion.div
                          animate={{ top: ["0%", "95%", "0%"] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] z-25 pointer-events-none"
                        />
                      )}
                    </div>

                    <div className="w-full bg-black/40 border border-emerald-500/20 p-3 rounded-xl text-center font-sans">
                      <div className="flex justify-between items-center text-xs text-slate-400 border-b border-emerald-500/20 pb-1.5 mb-1.5">
                        <span className="font-black">SPEED: 10 GB/s</span>
                        <span className="font-black">TIME: {modernTime}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-slate-300 font-black uppercase">BALLOTS PROCESSED</span>
                        <span className="text-base md:text-lg font-black text-emerald-400">{modernCount.toLocaleString()} / {totalBallots.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CRTConsole>

              </div>

              {/* Inputs & Optimal Results Console */}
              <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800 p-3 rounded-2xl">

                {/* Sliders for Voter inputs */}
                <div className="flex flex-col gap-3 justify-center font-sans text-xs md:text-sm">
                  <div>
                    <div className="flex justify-between font-black text-slate-300 mb-1 uppercase tracking-wide">
                      <span>NUMBER OF VOTERS:</span>
                      <span className="text-[#fbbf24] font-black">{totalBallots.toLocaleString()} votes</span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="500000"
                      step="10000"
                      value={totalBallots}
                      disabled={simCounting}
                      onChange={(e) => {
                        setTotalBallots(Number(e.target.value));
                        setSimFinished(false);
                      }}
                      className="w-full h-2 rounded-lg bg-slate-850 appearance-none cursor-pointer accent-[#fbbf24]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-black text-slate-300 mb-1 uppercase tracking-wide">
                      <span>VOTE SHARE FOR CANDIDATE A:</span>
                      <span className="text-[#fbbf24] font-black">{voteRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="5"
                      value={voteRatio}
                      disabled={simCounting}
                      onChange={(e) => {
                        setVoteRatio(Number(e.target.value));
                        setSimFinished(false);
                      }}
                      className="w-full h-2 rounded-lg bg-slate-850 appearance-none cursor-pointer accent-[#fbbf24]"
                    />
                  </div>
                </div>

                {/* Simulation metrics & declarations */}
                <div className="flex flex-col justify-center bg-black/40 border border-slate-900 p-3 rounded-xl font-sans text-xs md:text-sm min-h-[75px]">
                  {simFinished ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="font-bold">Winner (1952):</span>
                        <span className="font-black text-amber-400">{voteRatio >= 50 ? "Eisenhower Landslide (Republican)" : "Stevenson (Democrat)"}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="font-bold">Winner (2026):</span>
                        <span className="font-black text-emerald-400">{voteRatio >= 50 ? "Candidate A Wins" : "Candidate B Wins"}</span>
                      </div>
                      <div className="border-t border-slate-800/80 pt-1.5 text-center text-slate-400 text-[10px] md:text-xs uppercase font-black tracking-wide">
                        Modern computers counted votes {(univacTime / Math.max(0.01, modernTime)).toFixed(0)}x faster than the old UNIVAC!
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-slate-400 font-black animate-pulse">
                      Change the slider numbers and click Start Vote Count to compare!
                    </div>
                  )}
                </div>

              </div>

              {/* Run controls */}
              <div className="shrink-0 flex gap-3">
                <button
                  onClick={startVotingSimulation}
                  disabled={simCounting}
                  className="flex-1 btn-action btn-action-amber text-sm md:text-base py-3 flex items-center justify-center gap-2"
                >
                  <Play size={15} /> {simCounting ? "Counting..." : "Start Vote Count"}
                </button>
                {simFinished && (
                  <button onClick={() => { setPhase("quiz"); playPop(); }} className="flex-1 btn-action btn-action-blue text-sm md:text-base py-3 animate-bounce">
                    Time Travel →
                  </button>
                )}
              </div>

            </motion.div>
          )}

          {phase === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col flex-1 min-h-0 gap-3">

              <CRTConsole
                title={
                  travelStep === "jump" ? "Time Machine Screen" :
                    travelStep === "prediction" ? "1952 Guess Compare" :
                      travelStep === "heatQuestion" ? "Component Heat Test" :
                        "Production Records"
                }
                powerLight={
                  isWarping ? "amber" :
                    heatFeedback === "correct" || bubbleFeedback === "correct" ? "green" :
                      heatFeedback === "wrong" || bubbleFeedback === "wrong" ? "red" :
                        "green"
                }
              >
                <div className="flex flex-col gap-3.5 h-full justify-center py-1.5 font-sans">

                  {/* STEP 1: Temporal Jump */}
                  {travelStep === "jump" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-2">
                      <div className="text-center max-w-md border-b border-amber-500/20 pb-2">
                        <h3 className="text-amber-400 font-black text-sm md:text-base uppercase">Time Machine Console</h3>
                        <p className="text-slate-300 text-xs md:text-sm mt-1 leading-relaxed">
                          Drag the slider below to search the timeline and jump to the exact year UNIVAC counted its first votes (1952).
                        </p>
                      </div>

                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <motion.img
                          src="/svgs/time_machine.svg"
                          className="w-full h-full object-contain"
                          animate={
                            isWarping
                              ? { rotate: 360, scale: [1, 1.3, 0], opacity: [1, 1, 0] }
                              : { y: [0, -4, 0] }
                          }
                          transition={
                            isWarping
                              ? { duration: 1.5, ease: "easeInOut" }
                              : { repeat: Infinity, duration: 3, ease: "easeInOut" }
                          }
                          alt="Time Machine"
                        />
                        {isWarping && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="w-20 h-20 rounded-full border-4 border-amber-400 bg-amber-500/20 blur-md"
                              animate={{ scale: [1, 3.5], opacity: [1, 0] }}
                              transition={{ duration: 1.2 }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-2.5 w-full max-w-sm mt-1">
                        <div className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-xl flex flex-col gap-2">
                          <input
                            type="range"
                            min="1950"
                            max="1954"
                            step="2"
                            value={travelYear}
                            disabled={isWarping}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTravelYear(val);
                              playClick();
                              if (val === 1952) {
                                setIsWarping(true);
                                playZap();
                                setTimeout(() => {
                                  setIsWarping(false);
                                  setTimeJumped(true);
                                  setTravelStep("prediction");
                                  playSuccess();
                                }, 1500);
                              }
                            }}
                            className="w-full h-2 rounded-lg bg-slate-950 appearance-none cursor-pointer accent-amber-400"
                          />
                          <div className="flex justify-between text-xs font-black text-slate-400 px-1">
                            <span className={travelYear === 1950 ? "text-amber-400" : ""}>1950</span>
                            <span className={travelYear === 1952 ? "text-amber-400 font-black scale-105" : ""}>1952</span>
                            <span className={travelYear === 1954 ? "text-amber-400" : ""}>1954</span>
                          </div>
                        </div>

                        {travelYear !== 1952 && (
                          <span className="text-[11px] font-bold text-[#fbbf24] uppercase animate-pulse">
                            {travelYear === 1950 ? "Scanning timeline... (Try another year!)" : "Almost there... (Wrong year!)"}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Prediction Comparison */}
                  {travelStep === "prediction" && (
                    <div className="flex flex-col items-center justify-between h-full py-1 text-center gap-3">
                      <div className="border-b border-amber-500/20 pb-1.5 w-full">
                        <h3 className="text-amber-400 font-black text-sm md:text-base uppercase">Time Travel Successful! Arrived in 1952</h3>
                        <p className="text-slate-300 text-xs md:text-sm mt-0.5">
                          Before the computer counted the votes, people made guesses. Let's see who is closer!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-center">
                        {/* Left: User Input Panel */}
                        <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex flex-col gap-2.5">
                          <span className="text-amber-400 font-black text-xs uppercase">Your Guess Box</span>

                          {/* Vote Guess Selection */}
                          <div className="flex gap-2">
                            <button
                              disabled={predictionCompared}
                              onClick={() => { playClick(); setUserPrediction(60); }}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${userPrediction >= 50 ? "bg-amber-400 border-amber-500 text-amber-950" : "bg-slate-900 border-slate-700 text-slate-300"}`}
                            >
                              Eisenhower (Rep)
                            </button>
                            <button
                              disabled={predictionCompared}
                              onClick={() => { playClick(); setUserPrediction(40); }}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${userPrediction < 50 ? "bg-amber-400 border-amber-500 text-amber-950" : "bg-slate-900 border-slate-700 text-slate-300"}`}
                            >
                              Stevenson (Dem)
                            </button>
                          </div>

                          {/* Slider to fine-tune ratio */}
                          <div className="flex flex-col gap-1 text-left">
                            <div className="flex justify-between text-[11px] font-bold text-slate-300">
                              <span>Your Guess:</span>
                              <span className="text-amber-400">{userPrediction}%</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="80"
                              value={userPrediction}
                              disabled={predictionCompared}
                              onChange={(e) => { setUserPrediction(Number(e.target.value)); playClick(); }}
                              className="w-full h-1.5 rounded bg-slate-800 appearance-none cursor-pointer accent-amber-400"
                            />
                          </div>
                        </div>

                        {/* Right: UNIVAC Automatic Math */}
                        <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl flex flex-col gap-2">
                          <span className="text-amber-400 font-black text-xs uppercase">UNIVAC Math Brain</span>
                          <div className="flex-1 flex flex-col items-center justify-center p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                            {predictionCompared ? (
                              <div className="text-center">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">UNIVAC's Guess</span>
                                <span className="text-lg font-black text-emerald-400">55.1% share</span>
                                <span className="text-xs text-slate-300 block font-bold mt-1">Eisenhower Landslide</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic font-bold">Waiting to compare...</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {predictionCompared ? (
                        <div className="w-full">
                          <p className="text-[#ffe0a3] text-xs md:text-sm leading-relaxed max-w-md mx-auto">
                            UNIVAC predicted that Eisenhower would win, and it was 100% correct even though human experts doubted the machine!
                          </p>
                          <button
                            onClick={() => { setTravelStep("heatQuestion"); playPop(); }}
                            className="btn-action btn-action-emerald text-xs md:text-sm py-2 px-6 rounded-xl border-b-2 mt-2.5"
                          >
                            Next: Check Components →
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setPredictionCompared(true); playSuccess(); }}
                          className="btn-action btn-action-amber text-xs md:text-sm py-2 px-8 rounded-xl border-b-2"
                        >
                          Compare Predictions!
                        </button>
                      )}
                    </div>
                  )}

                  {/* STEP 3: Vacuum Tube Heat Question */}
                  {travelStep === "heatQuestion" && (
                    <div className="flex flex-col items-center justify-between h-full py-1 text-center gap-3">
                      <div className="border-b border-amber-500/20 pb-1.5 w-full">
                        <h3 className="text-amber-400 font-black text-sm md:text-base uppercase">Question from UNIVAC</h3>
                        <p className="text-slate-100 font-black text-base md:text-lg mt-1">
                          "Which of my components got red-hot and caused the computer to stop?"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full my-1">
                        {COMPONENTS.map((comp) => {
                          const isCorrect = comp.id === "tubes";
                          const isSelected = heatSelected === comp.id;
                          let borderClass = "border-slate-800 bg-[#162035] hover:bg-[#1f2d4a]";
                          if (isSelected) {
                            borderClass = isCorrect
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                              : "border-red-500 bg-red-500/10 text-red-300";
                          }

                          return (
                            <button
                              key={comp.id}
                              disabled={heatFeedback === "correct"}
                              onClick={() => {
                                setHeatSelected(comp.id);
                                if (isCorrect) {
                                  setHeatFeedback("correct");
                                  playSuccess();
                                } else {
                                  setHeatFeedback("wrong");
                                  playError();
                                }
                              }}
                              className={`p-2.5 border-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-100 transition-all select-none ${borderClass}`}
                            >
                              <img src={comp.svg} className="w-10 h-10 object-contain" alt={comp.name} />
                              <span className="text-[11px] md:text-xs font-black uppercase tracking-wide">{comp.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="min-h-[50px] flex items-center justify-center max-w-md">
                        {heatFeedback === "correct" && (
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-emerald-400 text-xs md:text-sm leading-relaxed">
                              Correct! Vacuum Tubes got extremely hot and burned out like old lightbulbs. We had 5,200 of them and needed huge coolers to stop them from melting!
                            </p>
                            <button
                              onClick={() => { setTravelStep("countQuestion"); playPop(); }}
                              className="btn-action btn-action-emerald text-xs md:text-sm py-2 px-6 rounded-xl border-b-2 mt-1"
                            >
                              Next: Final Challenge →
                            </button>
                          </div>
                        )}
                        {heatFeedback === "wrong" && (
                          <p className="text-red-400 text-xs md:text-sm leading-relaxed animate-shake">
                            Try again! Think about the parts that get as hot as lightbulbs!
                          </p>
                        )}
                        {!heatFeedback && (
                          <p className="text-slate-400 text-xs md:text-sm italic">
                            Tap on the component that you think has heating drawbacks.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Total Computers Built Challenge */}
                  {travelStep === "countQuestion" && (
                    <div className="flex flex-col items-center justify-between h-full py-1 text-center gap-3 relative overflow-hidden">
                      <div className="border-b border-[#fbbf24]/20 pb-1.5 w-full shrink-0">
                        <h3 className="text-amber-400 font-black text-sm md:text-base uppercase">Final Challenge</h3>
                        <p className="text-slate-100 font-black text-base md:text-lg mt-1">
                          "How many UNIVAC computers were ever built in history?"
                        </p>
                      </div>

                      {/* Floating option bubbles */}
                      <div className="flex-1 w-full min-h-[140px] relative flex items-center justify-around gap-2 px-4 select-none shrink-0">
                        {[12, 46, 120, 500].map((num, idx) => {
                          const isCorrect = num === 46;
                          const isSelected = bubbleSelected === num;
                          let bubbleColor = "bg-blue-600/35 border-blue-400 text-blue-100 hover:bg-blue-500/50 hover:scale-105";
                          if (isSelected) {
                            bubbleColor = isCorrect
                              ? "bg-emerald-500 border-emerald-300 text-white shadow-[0_0_15px_#10b981]"
                              : "bg-red-500 border-red-300 text-white animate-shake";
                          }

                          return (
                            <motion.button
                              key={num}
                              onClick={() => {
                                setBubbleSelected(num);
                                if (isCorrect) {
                                  setBubbleFeedback("correct");
                                  playSuccess();
                                  setTimeout(() => {
                                    setHasWon(true);
                                    reportComplete();
                                  }, 1000);
                                } else {
                                  setBubbleFeedback("wrong");
                                  playError();
                                }
                              }}
                              animate={{
                                y: [0, idx % 2 === 0 ? -12 : 12, 0],
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 3 + idx * 0.5,
                                ease: "easeInOut",
                              }}
                              className={`w-18 h-18 md:w-22 md:h-22 rounded-full border-4 flex items-center justify-center text-lg md:text-xl font-black cursor-pointer shadow-lg transition-colors ${bubbleColor}`}
                            >
                              {num}
                            </motion.button>
                          );
                        })}
                      </div>

                      <div className="min-h-[45px] flex items-center justify-center max-w-md shrink-0">
                        {bubbleFeedback === "correct" && (
                          <p className="text-emerald-400 text-xs md:text-sm font-black animate-bounce">
                            BINGO! Exactly 46 UNIVAC computers were built. You completed the time travel adventure!
                          </p>
                        )}
                        {bubbleFeedback === "wrong" && (
                          <p className="text-red-400 text-xs md:text-sm font-black">
                            Oops! That's not it. Pop another bubble!
                          </p>
                        )}
                        {!bubbleFeedback && (
                          <p className="text-slate-400 text-xs md:text-sm italic font-bold animate-pulse">
                            Pop the correct bubble floating by!
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </CRTConsole>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LabShell>
  );
}
