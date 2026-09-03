"use client";
import * as THREE from 'three';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls, Html, RoundedBox, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Database, Thermometer, Wind, AlertTriangle, Play, CheckCircle2, ShieldCheck, Printer, Zap } from 'lucide-react';
import { useGLTF } from '@react-three/drei';

// Preload the authentic GLTF model
useGLTF.preload('/models/univac_computer_compressed.glb');

// ---------------------------------------------------------
// 3D COMPONENTS
// ---------------------------------------------------------

function UnivacModel({ isOverheating }: { isOverheating: boolean }) {
    const { scene } = useGLTF('/models/univac_computer_compressed.glb');
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (!groupRef.current) return;
        if (isOverheating) {
            groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.05;
            groupRef.current.position.z = Math.cos(state.clock.elapsedTime * 45) * 0.05;
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
            {isOverheating && (
                <Html position={[0, 2, 0]} center zIndexRange={[100, 0]}>
                    <div className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest whitespace-nowrap animate-pulse border-2 border-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                        Critical Overheat!
                    </div>
                </Html>
            )}
        </group>
    );
}


const SVG_ASSETS = {
  tubes: "/svgs/vaccum_tube.svg",
  drives: "/svgs/tape_drive.svg",
  memory: "/svgs/mercury_memory.svg",
  printer: "/svgs/uniprinter.svg"
};

function ComponentOverlay({ installed, isPredicting }: { installed: Record<string, boolean>, isPredicting: boolean }) {
    return (
        <group>
            {installed.tubes && (
                <Html position={[-3.5, 1.5, -1]} center zIndexRange={[10, 0]}>
                    <div className={`bg-slate-900/80 backdrop-blur border-2 border-slate-700 p-4 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(16,185,129,0.15)] pointer-events-none transition-all ${isPredicting ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : ''}`}>
                        <img src={SVG_ASSETS.tubes} className={`w-24 h-24 object-contain drop-shadow-lg ${isPredicting ? 'animate-pulse' : ''}`} alt="Tubes" />
                        <span className={`text-[11px] font-black uppercase mt-2 tracking-widest ${isPredicting ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {isPredicting ? 'PROCESSING...' : 'Tubes Online'}
                        </span>
                    </div>
                </Html>
            )}
            {installed.tape && (
                <Html position={[3.5, 1.5, -1]} center zIndexRange={[10, 0]}>
                    <div className={`bg-slate-900/80 backdrop-blur border-2 border-slate-700 p-4 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(16,185,129,0.15)] pointer-events-none transition-all ${isPredicting ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : ''}`}>
                        <img src={SVG_ASSETS.drives} className={`w-24 h-24 object-contain drop-shadow-lg ${isPredicting ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} alt="Tape" />
                        <span className={`text-[11px] font-black uppercase mt-2 tracking-widest ${isPredicting ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {isPredicting ? 'READING DATA...' : 'Tape Online'}
                        </span>
                    </div>
                </Html>
            )}
            {installed.memory && (
                <Html position={[-3.5, -0.5, 1.5]} center zIndexRange={[10, 0]}>
                    <div className={`bg-slate-900/80 backdrop-blur border-2 border-slate-700 p-4 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(16,185,129,0.15)] pointer-events-none transition-all ${isPredicting ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : ''}`}>
                        <img src={SVG_ASSETS.memory} className={`w-24 h-24 object-contain drop-shadow-lg ${isPredicting ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} alt="Memory" />
                        <span className={`text-[11px] font-black uppercase mt-2 tracking-widest ${isPredicting ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {isPredicting ? 'STORING...' : 'Memory Online'}
                        </span>
                    </div>
                </Html>
            )}
            {installed.printer && (
                <Html position={[3.5, -0.5, 1.5]} center zIndexRange={[10, 0]}>
                    <div className={`bg-slate-900/80 backdrop-blur border-2 border-slate-700 p-4 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(16,185,129,0.15)] pointer-events-none transition-all ${isPredicting ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : ''}`}>
                        <img src={SVG_ASSETS.printer} className={`w-24 h-24 object-contain drop-shadow-lg ${isPredicting ? 'animate-pulse' : ''}`} alt="Printer" />
                        <span className={`text-[11px] font-black uppercase mt-2 tracking-widest ${isPredicting ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {isPredicting ? 'BUFFERING...' : 'Printer Online'}
                        </span>
                    </div>
                </Html>
            )}
        </group>
    );
}

function PredictionPrintout({ complete }: { complete: boolean }) {
    return (
        <AnimatePresence>
            {complete && (
                <Html position={[-2.5, 0.2, 2.5]} center transform zIndexRange={[10, 0]} rotation={[-Math.PI/8, Math.PI/12, 0]}>
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 160, opacity: 1 }} 
                        transition={{ duration: 1, ease: "linear" }}
                        className="bg-orange-50 border border-orange-200 p-3 shadow-2xl w-40 overflow-hidden font-mono text-[9px] text-slate-800"
                    >
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="border-b-2 border-slate-300 border-dashed pb-1 mb-1 font-black text-[10px]">
                            UNIVAC I PREDICTION
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="text-slate-500 mb-2">NOV 4, 1952 - 8:30 PM</motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="mb-1 font-bold">EARLY RETURNS: 7%</motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} className="mb-2 font-bold">ODDS: 100 TO 1</motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 5.5, type: "spring" }} className="font-black text-indigo-700 bg-indigo-100 p-1.5 rounded text-center text-[10px]">
                            WINNER: EISENHOWER
                        </motion.div>
                    </motion.div>
                </Html>
            )}
        </AnimatePresence>
    );
}

// ---------------------------------------------------------
// MAIN LAB COMPONENT
// ---------------------------------------------------------

export default function Univac9() {
    const { reportComplete } = useLMSBridge("univac9");
    const { playPop, playSuccess, playError, playChime, playClick } = useLabAudio();

    // Mission State
    const [mission, setMission] = useState<1 | 2>(1);
    
    // Hardware State
    const [installed, setInstalled] = useState({ tubes: false, tape: false, memory: false, printer: false });
    const [acStatus, setAcStatus] = useState(false);
    const [isOverheating, setIsOverheating] = useState(false);
    const [hardwarePassed, setHardwarePassed] = useState(false);

    // Prediction State
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false);
    const [predictionComplete, setPredictionComplete] = useState(false);
    
    const allInstalled = Object.values(installed).every(v => v === true);

    const handleInstall = (part: keyof typeof installed) => {
        if (installed[part] || isOverheating) return;
        playPop();
        setInstalled(prev => ({ ...prev, [part]: true }));
    };

    const handleToggleAC = () => {
        playClick();
        setAcStatus(!acStatus);
        if (isOverheating && !acStatus) {
            // Turning it on fixes the overheat
            setIsOverheating(false);
            playSuccess();
        }
    };

    const handleBootSequence = () => {
        playClick();
        if (!acStatus) {
            // Fail safely: Overheat
            setIsOverheating(true);
            playError();
            return;
        }
        
        // Success
        setHardwarePassed(true);
        playSuccess();
    };

    const handleLoadData = () => {
        playPop();
        setDataLoaded(true);
    };

    const handlePredict = () => {
        playClick();
        setIsPredicting(true);
        
        // Simulate computing time
        setTimeout(() => {
            setIsPredicting(false);
            setPredictionComplete(true);
            playSuccess();
            reportComplete();
        }, 3000);
    };

    return (
        <LabShell
            labId="univac9"
            title="UNIVAC I: The Dawn of Analytics"
            compact={true}
            bgOverride="bg-slate-50"
            instruction={mission === 1 
                ? "Mission 1 (Hardware): Assemble the UNIVAC I. Warning: The 5,200 vacuum tubes generate massive heat. Ensure cooling is active before booting!" 
                : "Mission 2 (Software): It is 1952. Feed the early voting data (7% returns) into the system and run the predictive algorithm."}
            onReset={() => {
                setMission(1);
                setInstalled({ tubes: false, tape: false, memory: false, printer: false });
                setAcStatus(false);
                setIsOverheating(false);
                setHardwarePassed(false);
                setDataLoaded(false);
                setIsPredicting(false);
                setPredictionComplete(false);
            }}
        >
            <Celebration isActive={predictionComplete} message="Incredible! You just recreated the most famous data prediction in computing history!" />

            <div className="flex flex-col md:flex-row w-full h-full min-h-0 font-sans overflow-hidden p-2 sm:p-4 gap-4">
                
                {/* LEFT PANE: 3D CLEAN ROOM */}
                <div className={`w-full md:w-[60%] min-h-[300px] md:min-h-[400px] bg-slate-900 rounded-xl shadow-xl border-4 transition-colors duration-500 relative overflow-hidden flex flex-col ${isOverheating ? 'border-rose-600' : 'border-slate-800'}`}>
                    <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 shadow-lg">
                        <Thermometer size={16} className={isOverheating ? "text-rose-500 animate-pulse" : "text-emerald-400"} />
                        <span className="text-xs font-black text-slate-200 tracking-widest uppercase">
                            {isOverheating ? "CRITICAL OVERHEAT" : "Clean Room Temp: Optimal"}
                        </span>
                    </div>

                    <Canvas camera={{ position: [0, 6, 12], fov: 40 }}>
                        <ambientLight intensity={isOverheating ? 0.2 : 0.8} />
                        <spotLight position={[5, 10, 5]} intensity={isOverheating ? 0 : 2} penumbra={1} angle={0.6} castShadow />
                        {isOverheating && <pointLight position={[0, 2, 0]} intensity={4} color="#ef4444" distance={15} />}
                        
                        <Suspense fallback={null}>
                            {/* The crucial Environment map that makes metals and glass look real */}
                            <Environment preset="city" />
                            
                            <group position={[0, -0.5, 0]}>
                                <UnivacModel isOverheating={isOverheating} />
                                <ComponentOverlay installed={installed} isPredicting={isPredicting} />
                                <PredictionPrintout complete={predictionComplete} />
                            </group>
                        </Suspense>
                        
                        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={4} maxDistance={20} />
                        <ContactShadows position={[0, -0.5, 0]} opacity={0.6} scale={20} blur={2.5} />
                    </Canvas>
                    
                    {/* Overheat Overlay Effect */}
                    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-end p-6">
                        <AnimatePresence>
                            {isOverheating && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mx-auto bg-rose-950/95 border-2 border-rose-500 p-4 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.6)] flex items-center gap-4 w-11/12 sm:w-auto">
                                    <AlertTriangle size={32} className="text-rose-500 shrink-0 animate-pulse" />
                                    <div>
                                        <span className="block text-[10px] uppercase text-rose-400 font-black tracking-widest">System Failure</span>
                                        <span className="text-xs font-bold text-rose-200">The 5,200 vacuum tubes melted down! Turn on the Air Conditioning to recover.</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT PANE: CONSOLE CONTROLS */}
                <div className="w-full md:w-[40%] flex flex-col gap-3 min-h-0 z-10 overflow-y-auto">
                    {mission === 1 ? (
                        <div className="bg-white rounded-xl shadow-xl border-4 border-slate-200 flex flex-col h-full overflow-hidden">
                            <div className="p-4 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-3 border-b-2 border-slate-100 pb-3 shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center border border-indigo-200">
                                        <Cpu size={16} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Hardware Assembly</h3>
                                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">UNIVAC I Specifications</span>
                                    </div>
                                </div>
                                
                                <p className="text-[11px] font-medium text-slate-600 mb-4 leading-relaxed shrink-0">
                                    At 16,686 lbs, the UNIVAC I was a behemoth. Install the required modules to complete the circuit.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    <button onClick={() => handleInstall('tubes')} disabled={installed.tubes} className={`p-3 rounded-xl border-2 flex flex-col gap-2 transition-all ${installed.tubes ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}>
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[10px] font-black text-slate-700 uppercase">Vacuum Tubes</span>
                                            {installed.tubes && <CheckCircle2 size={14} className="text-indigo-500" />}
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-medium text-left leading-tight">5,200 tubes for logic. Generates massive heat.</span>
                                    </button>
                                    
                                    <button onClick={() => handleInstall('tape')} disabled={installed.tape} className={`p-3 rounded-xl border-2 flex flex-col gap-2 transition-all ${installed.tape ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}>
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[10px] font-black text-slate-700 uppercase">Tape Drives</span>
                                            {installed.tape && <CheckCircle2 size={14} className="text-indigo-500" />}
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-medium text-left leading-tight">First commercial magnetic tape storage.</span>
                                    </button>

                                    <button onClick={() => handleInstall('memory')} disabled={installed.memory} className={`p-3 rounded-xl border-2 flex flex-col gap-2 transition-all ${installed.memory ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}>
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[10px] font-black text-slate-700 uppercase">Mercury Memory</span>
                                            {installed.memory && <CheckCircle2 size={14} className="text-indigo-500" />}
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-medium text-left leading-tight">Delay line memory storing 1,000 numbers.</span>
                                    </button>

                                    <button onClick={() => handleInstall('printer')} disabled={installed.printer} className={`p-3 rounded-xl border-2 flex flex-col gap-2 transition-all ${installed.printer ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}>
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[10px] font-black text-slate-700 uppercase">UNIPRINTER</span>
                                            {installed.printer && <CheckCircle2 size={14} className="text-indigo-500" />}
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-medium text-left leading-tight">High-speed mechanical output printer.</span>
                                    </button>
                                </div>

                                <div className="mt-auto flex flex-col gap-3">
                                    <button onClick={handleToggleAC} className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all ${acStatus ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                                        <div className="flex items-center gap-2">
                                            <Wind size={16} className={acStatus ? "text-emerald-500 animate-pulse" : "text-slate-400"} />
                                            <span className="text-xs font-black uppercase tracking-widest">Cooling Systems (A/C)</span>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${acStatus ? 'bg-emerald-200' : 'bg-slate-200'}`}>{acStatus ? 'ON' : 'OFF'}</span>
                                    </button>
                                    
                                    <button 
                                        onClick={handleBootSequence} 
                                        disabled={!allInstalled || hardwarePassed}
                                        className={`w-full py-3 font-black rounded-xl uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${isOverheating ? 'bg-rose-500 hover:bg-rose-600 text-white' : hardwarePassed ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                    >
                                        {hardwarePassed ? <ShieldCheck size={18} /> : <Zap size={18} />}
                                        {hardwarePassed ? "Systems Stable" : isOverheating ? "Retry Boot Sequence" : "Run Boot Sequence"}
                                    </button>
                                </div>
                                
                                <AnimatePresence>
                                    {hardwarePassed && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                                            <button onClick={() => { playChime(); setMission(2); }} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl uppercase tracking-widest shadow-md">Proceed to Data Prediction</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-xl border-4 border-slate-200 flex flex-col h-full overflow-hidden">
                            <div className="p-4 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-3 border-b-2 border-slate-100 pb-3 shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center border border-indigo-200">
                                        <Database size={16} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Predictive Analytics</h3>
                                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">1952 CBS Broadcast</span>
                                    </div>
                                </div>
                                
                                <p className="text-[11px] font-medium text-slate-600 mb-6 leading-relaxed shrink-0">
                                    CBS executives are nervous. You only have 7% of the voting data. Can this machine really predict a massive national election outcome?
                                </p>

                                <div className="flex flex-col gap-4">
                                    <button 
                                        onClick={handleLoadData} 
                                        disabled={dataLoaded || isPredicting || predictionComplete} 
                                        className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${dataLoaded ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-300 hover:border-indigo-400'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${dataLoaded ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            <Database size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className={`block font-black text-xs uppercase ${dataLoaded ? 'text-indigo-800' : 'text-slate-700'}`}>Load 7% Sample Data</span>
                                            <span className={`block text-[10px] ${dataLoaded ? 'text-indigo-500' : 'text-slate-500'}`}>Load reels onto Tape Drives</span>
                                        </div>
                                        {dataLoaded && <CheckCircle2 size={20} className="text-indigo-500 ml-auto shrink-0" />}
                                    </button>

                                    <button 
                                        onClick={handlePredict} 
                                        disabled={!dataLoaded || isPredicting || predictionComplete}
                                        className={`w-full py-4 font-black rounded-xl uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${predictionComplete ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700 border-b-4 active:border-b-0 active:translate-y-1'}`}
                                    >
                                        {isPredicting ? (
                                            <><Wind size={18} className="animate-[spin_2s_linear_infinite]" /> Processing 1,905 ops/sec...</>
                                        ) : predictionComplete ? (
                                            <><Printer size={18} /> Prediction Printed</>
                                        ) : (
                                            <><Play size={18} /> Run Prediction Algorithm</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LabShell>
    );
}
