"use client";

import '@/components/configureThreeConsole';
import * as THREE from 'three';
import React, { useState, useRef, Suspense } from 'react';
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows, useGLTF } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Database, Thermometer, Wind, AlertTriangle, Play, CheckCircle2, 
  ShieldCheck, Printer, Zap, Tv, RotateCcw, Award, Radio
} from 'lucide-react';

// Preload the authentic GLTF model
useGLTF.preload('/models/univac_computer_compressed.glb');

// ---------------------------------------------------------
// 3D LOADER & SCENE COMPONENTS
// ---------------------------------------------------------

function Loader3D() {
  return (
    <Html center zIndexRange={[100, 0]}>
      <div className="flex flex-col items-center gap-3 bg-slate-900/95 backdrop-blur-md px-6 py-5 rounded-2xl border-2 border-indigo-500 shadow-[0_0_35px_rgba(99,102,241,0.6)] text-center w-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-amber-400 rounded-full animate-spin" />
          <Zap size={20} className="text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black uppercase tracking-widest text-amber-300">Heating Vacuum Tubes</span>
          <span className="text-[10px] text-slate-300 font-mono">Calibrating 16,686 lb Mainframe...</span>
        </div>
      </div>
    </Html>
  );
}

function UnivacModel({ isOverheating }: { isOverheating: boolean }) {
  const { scene } = useGLTF('/models/univac_computer_compressed.glb');
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Uses delta accumulation instead of deprecated THREE.Clock APIs
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    if (isOverheating) {
      groupRef.current.position.x = Math.sin(timeRef.current * 48) * 0.06;
      groupRef.current.position.z = Math.cos(timeRef.current * 42) * 0.06;
    } else {
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 0;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        position={[0, -1, 0]} 
        scale={[1.5, 1.5, 1.5]} 
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

// ---------------------------------------------------------
// COMPONENT OVERLAYS (Sleek Holographic Callout Markers)
// ---------------------------------------------------------

const SVG_ASSETS = {
  tubes: "/svgs/vaccum_tube.svg",
  drives: "/svgs/tape_drive.svg",
  memory: "/svgs/mercury_memory.svg",
  printer: "/svgs/uniprinter.svg"
};

function ComponentOverlay({ installed, isPredicting }: { installed: Record<string, boolean>; isPredicting: boolean }) {
  return (
    <group>
      {installed.tubes && (
        <Html position={[-3.6, 1.6, -0.8]} center zIndexRange={[15, 0]}>
          <div className={`p-2 rounded-xl flex flex-col items-center border-2 transition-all shadow-xl backdrop-blur-md ${
            isPredicting 
              ? 'bg-amber-950/95 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.7)]' 
              : 'bg-slate-900/90 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
          }`}>
            <img src={SVG_ASSETS.tubes} className={`w-12 h-12 object-contain drop-shadow-md ${isPredicting ? 'animate-pulse' : ''}`} alt="5200 Vacuum Tubes" />
            <div className="flex items-center gap-1.5 mt-1 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-900 animate-ping" />
              5,200 Tubes (125kW)
            </div>
          </div>
        </Html>
      )}

      {installed.tape && (
        <Html position={[3.6, 1.6, -0.8]} center zIndexRange={[15, 0]}>
          <div className={`p-2 rounded-xl flex flex-col items-center border-2 transition-all shadow-xl backdrop-blur-md ${
            isPredicting 
              ? 'bg-cyan-950/95 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.7)]' 
              : 'bg-slate-900/90 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
          }`}>
            <img src={SVG_ASSETS.drives} className={`w-12 h-12 object-contain drop-shadow-md ${isPredicting ? 'animate-spin' : ''}`} style={{ animationDuration: '2.5s' }} alt="UNISERVO Tape" />
            <div className="flex items-center gap-1.5 mt-1 bg-cyan-400 text-cyan-950 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-900 animate-pulse" />
              UNISERVO Tape (12.8 kB/s)
            </div>
          </div>
        </Html>
      )}

      {installed.memory && (
        <Html position={[-3.6, -0.4, 1.4]} center zIndexRange={[15, 0]}>
          <div className={`p-2 rounded-xl flex flex-col items-center border-2 transition-all shadow-xl backdrop-blur-md ${
            isPredicting 
              ? 'bg-emerald-950/95 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.7)]' 
              : 'bg-slate-900/90 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          }`}>
            <img src={SVG_ASSETS.memory} className={`w-12 h-12 object-contain drop-shadow-md ${isPredicting ? 'animate-bounce' : ''}`} style={{ animationDuration: '1.5s' }} alt="Mercury Memory" />
            <div className="flex items-center gap-1.5 mt-1 bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-900 animate-pulse" />
              Mercury Tank (1K Words)
            </div>
          </div>
        </Html>
      )}

      {installed.printer && (
        <Html position={[3.6, -0.4, 1.4]} center zIndexRange={[15, 0]}>
          <div className={`p-2 rounded-xl flex flex-col items-center border-2 transition-all shadow-xl backdrop-blur-md ${
            isPredicting 
              ? 'bg-violet-950/95 border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.7)]' 
              : 'bg-slate-900/90 border-violet-500/80 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
          }`}>
            <img src={SVG_ASSETS.printer} className={`w-12 h-12 object-contain drop-shadow-md ${isPredicting ? 'animate-pulse' : ''}`} alt="UNIPRINTER" />
            <div className="flex items-center gap-1.5 mt-1 bg-violet-400 text-violet-950 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-900 animate-pulse" />
              UNIPRINTER (600 LPM)
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------
// AUTHENTIC CONTINUOUS TRACTOR-FEED TELETYPE COMPONENT
// ---------------------------------------------------------

function TractorFeedPrintout({ onVerify }: { onVerify: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      className="relative rounded-xl border-2 border-amber-400/80 bg-[#fffef5] shadow-xl overflow-hidden mt-auto"
    >
      {/* Top Perforated Tear Edge */}
      <div className="h-2 w-full border-b border-dashed border-amber-300/80 bg-amber-100/50 flex justify-between px-2 items-center">
        <span className="text-[8px] font-mono font-bold text-amber-600/70 tracking-widest uppercase">
          --- TEAR ALONG PERFORATION ---
        </span>
      </div>

      <div className="flex items-stretch">
        {/* Left Sprocket Feed Holes */}
        <div className="w-5 py-2 flex flex-col justify-between items-center bg-amber-50/80 border-r border-amber-200/60 shrink-0">
          {[...Array(6)].map((_, i) => (
            <div key={`sprocket-l-${i}`} className="w-2 h-2 rounded-full bg-amber-200/90 border border-amber-300 shadow-inner" />
          ))}
        </div>

        {/* Teletype Document Body */}
        <div className="flex-1 p-3 font-mono flex flex-col gap-1.5">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Printer size={13} className="text-amber-700" /> CBS NEWSROOM · UNIVAC I TELETYPE
            </span>
            <span className="text-[9px] text-amber-700 font-bold">8:30 PM · NOV 4, 1952</span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 shadow-sm flex flex-col gap-1.5 text-slate-800">
            <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-1">
              <span className="text-slate-600">PREDICTED WINNER:</span>
              <span className="text-indigo-700 font-black tracking-wide bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                DWIGHT D. EISENHOWER
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-600">ELECTORAL COLLEGE ODDS:</span>
              <span className="text-indigo-600 font-black">100 TO 1</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-600">ELECTORAL VOTES FORECAST:</span>
              <span className="text-emerald-700 font-black">438 VOTES (LANDSLIDE)</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 border-t border-slate-100 pt-1 leading-tight font-sans">
              <span className="font-bold text-amber-800">Historic Drama:</span> CBS anchor Walter Cronkite initially refused to broadcast this result because human pollsters insisted it was a dead heat. At midnight, official returns confirmed UNIVAC was 100% accurate!
            </p>
          </div>

          <button 
            onClick={onVerify} 
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black rounded-lg uppercase tracking-wider text-[11px] shadow-md transition-all active:scale-95 border-b-2 border-amber-700"
          >
            Verify Historical Takeaway & Finish
          </button>
        </div>

        {/* Right Sprocket Feed Holes */}
        <div className="w-5 py-2 flex flex-col justify-between items-center bg-amber-50/80 border-l border-amber-200/60 shrink-0">
          {[...Array(6)].map((_, i) => (
            <div key={`sprocket-r-${i}`} className="w-2 h-2 rounded-full bg-amber-200/90 border border-amber-300 shadow-inner" />
          ))}
        </div>
      </div>

      {/* Bottom Perforated Tear Edge */}
      <div className="h-2 w-full border-t border-dashed border-amber-300/80 bg-amber-100/50 flex justify-center items-center">
        <span className="text-[7px] font-mono text-amber-600/70 tracking-widest uppercase">
          ••••••••••••••••••••••••••••••••••••••••••••••••••
        </span>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------

export default function Univac9() {
  const { reportComplete } = useLMSBridge("univac9");
  const { playPop, playSuccess, playError, playChime, playClick } = useLabAudio();

  // Stage: 1 = Assembly, 2 = Overheat Alarm, 3 = Cold Boot Passed, 4 = 1952 Election, 5 = Assessment / Done
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Hardware Slots
  const [installed, setInstalled] = useState({
    tubes: false,
    tape: false,
    memory: false,
    printer: false
  });
  
  // Clean Room Cooling
  const [acStatus, setAcStatus] = useState(false);
  const [isOverheating, setIsOverheating] = useState(false);

  // 1952 Prediction State
  const [tapeMounted, setTapeMounted] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionRevealed, setPredictionRevealed] = useState(false);

  // Final Assessment State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [assessmentPassed, setAssessmentPassed] = useState(false);

  const allInstalled = Object.values(installed).every(Boolean);

  const handleInstall = (part: keyof typeof installed) => {
    if (installed[part] || isOverheating) return;
    playPop();
    setInstalled(prev => ({ ...prev, [part]: true }));
  };

  const handleToggleAC = () => {
    playClick();
    const nextAC = !acStatus;
    setAcStatus(nextAC);
    if (isOverheating && nextAC) {
      setIsOverheating(false);
      playSuccess();
    }
  };

  const handleBootSequence = () => {
    playClick();
    if (!acStatus) {
      // Historical fail-safe: 5,200 tubes overheat clean room without industrial AC
      setIsOverheating(true);
      setStage(2);
      playError();
      return;
    }

    // Success: System chilled and operational
    setIsOverheating(false);
    setStage(3);
    playSuccess();
  };

  const handleProceedToElection = () => {
    playChime();
    setStage(4);
  };

  const handleMountTape = () => {
    playPop();
    setTapeMounted(true);
  };

  const handleRunPrediction = () => {
    playClick();
    setIsPredicting(true);

    // Historical simulation time (1,905 operations/second)
    setTimeout(() => {
      setIsPredicting(false);
      setPredictionRevealed(true);
      playSuccess();
    }, 2800);
  };

  const handleAnswerAssessment = (index: number) => {
    playClick();
    setSelectedAnswer(index);
    if (index === 0) {
      setAssessmentPassed(true);
      setStage(5);
      playSuccess();
      reportComplete();
    } else {
      playError();
    }
  };

  const handleReset = () => {
    setStage(1);
    setInstalled({ tubes: false, tape: false, memory: false, printer: false });
    setAcStatus(false);
    setIsOverheating(false);
    setTapeMounted(false);
    setIsPredicting(false);
    setPredictionRevealed(false);
    setSelectedAnswer(null);
    setAssessmentPassed(false);
  };

  return (
    <LabShell
      labId="univac9"
      title="UNIVAC I: The Dawn of Analytics"
      compact={true}
      bgOverride="bg-slate-100"
      instruction={
        stage <= 3 
          ? "Mission 1 (Hardware): Assemble UNIVAC I's 4 core modules. Caution: 5,200 vacuum tubes draw 125 kW and melt without industrial A/C!" 
          : stage === 4 
            ? "Mission 2 (Software & History): November 4, 1952. Feed the 7% early voting sample tape into UNIVAC to predict the presidential winner live on CBS!" 
            : "Final Assessment: Confirm why UNIVAC I changed modern computing history forever."
      }
      onReset={handleReset}
    >
      <Celebration 
        isActive={stage === 5 && assessmentPassed} 
        message="Mastery Achieved! You recreated UNIVAC's legendary 1952 election breakthrough and proved computers could predict the future!" 
      />

      <div className="flex flex-col lg:flex-row w-full h-full min-h-0 font-sans overflow-hidden p-2 sm:p-3 gap-3">
        
        {/* ========================================================================= */}
        {/* LEFT PANE: 3D CLEAN ROOM VIEWPORT WITH LABORATORY FLOOR */}
        {/* ========================================================================= */}
        <div className={`w-full lg:w-[58%] min-h-[260px] sm:min-h-[320px] lg:h-full rounded-2xl border-4 transition-all duration-700 relative overflow-hidden flex flex-col shadow-2xl ${
          isOverheating 
            ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)]' 
            : 'bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border-slate-700 shadow-inner'
        }`}>
          
          {/* Real-time Laboratory HUD Badges (Industrial Dial Styling) */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
            
            {/* Thermometer Status Gauge */}
            <div className={`px-3 py-1.5 rounded-xl border-2 flex items-center gap-2 backdrop-blur-md shadow-lg transition-all ${
              isOverheating 
                ? 'bg-rose-600 border-rose-300 text-white animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.8)]' 
                : acStatus 
                  ? 'bg-cyan-950/85 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                  : 'bg-amber-950/85 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            }`}>
              <Thermometer size={16} className={isOverheating ? "animate-bounce" : ""} />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Room Temp</span>
                <span className="text-[11px] font-black tracking-wider font-mono">
                  {isOverheating ? "105°C MELTDOWN!" : acStatus ? "18°C CHILLED" : "65°C HEATING"}
                </span>
              </div>
            </div>

            {/* Power & Operations Telemetry Dial */}
            <div className="px-3 py-1.5 rounded-xl border-2 border-indigo-500/50 bg-slate-950/85 backdrop-blur-md text-slate-200 flex items-center gap-2.5 shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div className="flex flex-col text-right">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Clean Room Telemetry</span>
                <span className="text-[11px] font-black tracking-wider font-mono text-amber-300">
                  125 kW · 1,905 OPS/S
                </span>
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          <Canvas camera={{ position: [0, 5, 11], fov: 42 }}>
            {/* Self-contained Studio Lighting */}
            <ambientLight intensity={isOverheating ? 0.4 : 1.2} />
            <directionalLight position={[6, 12, 6]} intensity={isOverheating ? 0.3 : 1.8} castShadow />
            <directionalLight position={[-6, 6, -6]} intensity={0.8} />
            <pointLight 
              position={[0, 2.5, 2]} 
              intensity={isOverheating ? 5 : 1.6} 
              color={isOverheating ? "#ef4444" : "#e0e7ff"} 
              distance={20} 
            />

            {/* Laboratory Floor Grid */}
            <gridHelper args={[24, 24, '#4f46e5', '#1e1b4b']} position={[0, -1.01, 0]} />

            <Suspense fallback={<Loader3D />}>
              <group position={[0, -0.5, 0]}>
                <UnivacModel isOverheating={isOverheating} />
                <ComponentOverlay installed={installed} isPredicting={isPredicting} />
              </group>
            </Suspense>

            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.05} minDistance={4} maxDistance={18} />
            <ContactShadows position={[0, -1.02, 0]} opacity={0.7} scale={18} blur={2.2} color="#0f172a" />
          </Canvas>

          {/* Thermal Alarm Emergency Overlay */}
          <AnimatePresence>
            {isOverheating && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 30 }} 
                className="absolute inset-x-3 bottom-3 z-30 bg-rose-950/95 border-2 border-rose-500 p-3.5 rounded-xl shadow-[0_0_35px_rgba(225,29,72,0.7)] flex items-center gap-3 backdrop-blur-md"
              >
                <AlertTriangle size={32} className="text-rose-400 shrink-0 animate-bounce" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-rose-300 tracking-widest">
                    True 1951 Historical Hazard!
                  </span>
                  <span className="text-xs font-bold text-rose-100 leading-snug">
                    The 5,200 vacuum tubes are melting! In 1951, when clean-room A/C failed during a demo, engineers had to crack open windows and use desk fans. Turn on the Cooling System to save the circuits!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: TACTILE MISSION WORKSTATION */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[42%] flex flex-col gap-2.5 min-h-0 z-10 overflow-y-auto">
          
          {/* ------------------------------------------------------------- */}
          {/* MISSION 1: HARDWARE ASSEMBLY */}
          {/* ------------------------------------------------------------- */}
          {stage <= 3 && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 flex flex-col p-3.5 sm:p-4 gap-3 h-full">
              
              {/* Header Plate */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">Mission 1: Hardware Assembly</h3>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Weight: 16,686 lbs · Eckert-Mauchly</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black font-mono text-slate-700 shadow-inner">
                  {Object.values(installed).filter(Boolean).length}/4 Installed
                </div>
              </div>

              {/* Hardware Cards (Tactile Industrial Switchboard Look) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* 1. Vacuum Tubes (Amber) */}
                <button 
                  onClick={() => handleInstall('tubes')} 
                  disabled={installed.tubes || isOverheating} 
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1 text-left transition-all relative overflow-hidden ${
                    installed.tubes 
                      ? 'bg-amber-50/80 border-amber-400 shadow-inner' 
                      : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md active:scale-95'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                      Vacuum Tubes
                    </span>
                    {installed.tubes && <CheckCircle2 size={15} className="text-amber-600" />}
                  </div>
                  <span className="text-[10px] font-bold text-amber-700">5,200 glass tubes</span>
                  <span className="text-[9px] text-slate-500 leading-tight">Performs 1,905 calculations/sec. Generates intense 125 kW heat!</span>
                </button>

                {/* 2. Magnetic Tape Drives (Cyan) */}
                <button 
                  onClick={() => handleInstall('tape')} 
                  disabled={installed.tape || isOverheating} 
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1 text-left transition-all relative overflow-hidden ${
                    installed.tape 
                      ? 'bg-cyan-50/80 border-cyan-400 shadow-inner' 
                      : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-md active:scale-95'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black text-cyan-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                      UNISERVO Tape
                    </span>
                    {installed.tape && <CheckCircle2 size={15} className="text-cyan-600" />}
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700">Replaced Punch Cards</span>
                  <span className="text-[9px] text-slate-500 leading-tight">Reads 12,800 chars/sec. 1 tape holds 1.4 million characters.</span>
                </button>

                {/* 3. Mercury Memory (Emerald) */}
                <button 
                  onClick={() => handleInstall('memory')} 
                  disabled={installed.memory || isOverheating} 
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1 text-left transition-all relative overflow-hidden ${
                    installed.memory 
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-inner' 
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md active:scale-95'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      Mercury Memory
                    </span>
                    {installed.memory && <CheckCircle2 size={15} className="text-emerald-600" />}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700">Liquid Sound Waves</span>
                  <span className="text-[9px] text-slate-500 leading-tight">Acoustic delay lines storing 1,000 twelve-digit numbers.</span>
                </button>

                {/* 4. UNIPRINTER (Violet) */}
                <button 
                  onClick={() => handleInstall('printer')} 
                  disabled={installed.printer || isOverheating} 
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1 text-left transition-all relative overflow-hidden ${
                    installed.printer 
                      ? 'bg-violet-50/80 border-violet-400 shadow-inner' 
                      : 'bg-white border-slate-200 hover:border-violet-400 hover:shadow-md active:scale-95'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
                      UNIPRINTER
                    </span>
                    {installed.printer && <CheckCircle2 size={15} className="text-violet-600" />}
                  </div>
                  <span className="text-[10px] font-bold text-violet-700">600 Lines Per Min</span>
                  <span className="text-[9px] text-slate-500 leading-tight">Fast mechanical output teletype printing live telegram results.</span>
                </button>
              </div>

              {/* Bottom Controls: Air Conditioning & Boot Sequence */}
              <div className="mt-auto flex flex-col gap-2 pt-2 border-t-2 border-slate-100">
                
                {/* Air Conditioning Industrial Switch */}
                <button 
                  onClick={handleToggleAC} 
                  className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
                    acStatus 
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wind size={18} className={acStatus ? "text-cyan-600 animate-pulse" : "text-slate-400"} />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black uppercase tracking-wider">Industrial Clean-Room A/C</span>
                      <span className="text-[9px] text-slate-500 font-bold">Required to cool 5,200 vacuum tubes</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                    acStatus ? 'bg-cyan-500 text-white shadow-sm' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {acStatus ? 'ACTIVE (18°C)' : 'OFFLINE'}
                  </span>
                </button>

                {/* Boot Button */}
                {stage < 3 ? (
                  <button 
                    onClick={handleBootSequence} 
                    disabled={!allInstalled}
                    className={`w-full py-3.5 font-black rounded-xl uppercase tracking-wider text-xs shadow-md flex items-center justify-center gap-2 border-b-4 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isOverheating 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800'
                    }`}
                  >
                    {isOverheating ? (
                      <><RotateCcw size={16} /> Retry Clean-Room Boot</>
                    ) : (
                      <><Zap size={16} /> Energize Mainframe (Boot)</>
                    )}
                  </button>
                ) : (
                  <motion.button 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    onClick={handleProceedToElection} 
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl uppercase tracking-wider text-xs shadow-lg border-b-4 border-emerald-700 flex items-center justify-center gap-2 active:border-b-0 active:translate-y-1"
                  >
                    <ShieldCheck size={18} /> Systems Chilled · Proceed to 1952 Election
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* MISSION 2: 1952 CBS ELECTION PREDICTION (NEWSROOM & TRACTOR TAPE) */}
          {/* ------------------------------------------------------------- */}
          {stage === 4 && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 flex flex-col p-3.5 sm:p-4 gap-2.5 h-full">
              
              {/* Retro CBS Newsroom Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                    <Tv size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">Mission 2: 1952 CBS Live Broadcast</h3>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Walter Cronkite · Nov 4, 1952</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-300 text-[9.5px] font-black font-mono text-rose-700 flex items-center gap-1.5 shadow-sm">
                  <Radio size={12} className="animate-pulse text-rose-600" /> LIVE TELEVISION
                </div>
              </div>

              <p className="text-[11px] font-medium text-slate-600 leading-tight">
                CBS executives are terrified. Human pollsters predict a dead-heat election. Can UNIVAC calculate real-world voting patterns from just <span className="font-bold text-slate-800">7% of early returns</span>?
              </p>

              {/* Interactive Tape Loading & Compute Actions */}
              <div className="flex flex-col gap-2">
                
                {/* Step 1: Mount Magnetic Tape Reel */}
                <button 
                  onClick={handleMountTape} 
                  disabled={tapeMounted || isPredicting} 
                  className={`p-2.5 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
                    tapeMounted 
                      ? 'bg-cyan-50 border-cyan-300 text-cyan-950 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-cyan-400 active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tapeMounted ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Database size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-wider">1. Mount 7% Election Sample Tape</span>
                      <span className="text-[9px] text-slate-500">12,800 characters/sec UNISERVO magnetic reel</span>
                    </div>
                  </div>
                  {tapeMounted && <CheckCircle2 size={16} className="text-cyan-600 shrink-0" />}
                </button>

                {/* Step 2: Run Prediction Algorithm */}
                <button 
                  onClick={handleRunPrediction} 
                  disabled={!tapeMounted || isPredicting || predictionRevealed} 
                  className={`w-full py-3 font-black rounded-xl uppercase tracking-wider text-xs shadow-md flex items-center justify-center gap-2 border-b-4 transition-all disabled:opacity-50 active:border-b-0 active:translate-y-1 ${
                    predictionRevealed 
                      ? 'bg-emerald-600 text-white border-emerald-800' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800 shadow-md'
                  }`}
                >
                  {isPredicting ? (
                    <><Wind size={15} className="animate-spin" /> Processing 1,905 Operations / Sec...</>
                  ) : predictionRevealed ? (
                    <><CheckCircle2 size={15} /> Teletype Output Generated</>
                  ) : (
                    <><Play size={15} /> 2. Execute Prediction Algorithm</>
                  )}
                </button>
              </div>

              {/* Authentic Continuous Tractor-Feed Paper Printout */}
              <AnimatePresence>
                {predictionRevealed && (
                  <TractorFeedPrintout onVerify={() => setStage(5)} />
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* MISSION 3: CONCEPT ASSESSMENT */}
          {/* ------------------------------------------------------------- */}
          {stage === 5 && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 flex flex-col p-4 gap-3.5 h-full">
              
              <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">Concept Verification</h3>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Chapter 02 Textbook Takeaway</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Why was UNIVAC I’s 1952 election prediction a watershed turning point in computing history?
                </span>
                <span className="text-[10px] text-slate-500">
                  Select the core conclusion highlighted in your textbook:
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  "It proved computers could analyze real-world patterns from sample data to guide high-stakes human decision-making.",
                  "It proved paper punch cards were superior and faster than magnetic tape reels.",
                  "It proved computers do not need clean rooms or air conditioning to run."
                ].map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === 0;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerAssessment(idx)}
                      disabled={assessmentPassed}
                      className={`p-3 rounded-xl border-2 text-left text-[11px] font-bold transition-all ${
                        isSelected 
                          ? isCorrect 
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-md' 
                            : 'bg-rose-50 border-rose-400 text-rose-900'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-400 text-slate-700 active:scale-98'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isSelected 
                            ? isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {assessmentPassed && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="mt-auto p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-emerald-900 text-xs font-black shadow-inner"
                >
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <span>Verified! UNIVAC I launched the modern commercial data analytics era. LMS Score: 100/100 Recorded.</span>
                </motion.div>
              )}
            </div>
          )}

        </div>
      </div>
    </LabShell>
  );
}
