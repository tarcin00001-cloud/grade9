"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  HeartPulse, Activity, Zap, ShieldAlert,
  Eye, Cpu, Settings2, Play, MousePointer2,
  CheckCircle2, PlusCircle
} from "lucide-react";

const MAP_ROWS = 20;
const MAP_COLS = 20;
const CELL_SIZE = 20; // px

const LEVELS = [
  {
    id: 1,
    title: "Traditional Surgery",
    desc: "Guide the scalpel to the tumor (E). Human hands naturally have micro-tremors, making precision difficult.",
    robotActiveAllowed: false,
    visionEnhancedAllowed: false,
    map: [
      "####################",
      "####################",
      "####################",
      "###..............###",
      "###..............###",
      "###..............###",
      "###S............E###",
      "###..............###",
      "###..............###",
      "###..............###",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################"
    ]
  },
  {
    id: 2,
    title: "The da Vinci Advantage",
    desc: "The path is narrower! Activate the Robotic System to enable Tremor Elimination technology.",
    robotActiveAllowed: true,
    visionEnhancedAllowed: false,
    map: [
      "####################",
      "####################",
      "....################",
      "S...################",
      "....################",
      "....################",
      "........############",
      "........############",
      "........############",
      "........############",
      "............########",
      "............########",
      "............########",
      "...................E",
      "...................E",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################"
    ]
  },
  {
    id: 3,
    title: "Into the Dark",
    desc: "Tissue obscures the view. Activate 3D Enhanced Vision to illuminate the anatomical pathway.",
    robotActiveAllowed: true,
    visionEnhancedAllowed: true,
    map: [
      "####################",
      "....################",
      "S...################",
      "....################",
      "....#########....###",
      "....#########....###",
      "....#########....###",
      ".................###",
      ".................###",
      ".................###",
      "#############....###",
      "#############....###",
      "#############......E",
      "#############......E",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################"
    ]
  },
  {
    id: 4,
    title: "Minimally Invasive",
    desc: "A tiny incision means a microscopic path. You need both Tremor Elimination and Enhanced Vision.",
    robotActiveAllowed: true,
    visionEnhancedAllowed: true,
    map: [
      "####################",
      "....################",
      "S...################",
      "....################",
      "................####",
      "................####",
      "................####",
      "########........####",
      "########........####",
      "########...........E",
      "########...........E",
      "########...........E",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################"
    ]
  },
  {
    id: 5,
    title: "Remote Expert Operation",
    desc: "Perform a complex, deep-tissue procedure. Perfect synergy of human expertise and robotic precision.",
    robotActiveAllowed: true,
    visionEnhancedAllowed: true,
    map: [
      "####################",
      "....################",
      "S...################",
      "....################",
      "........####....####",
      "........####....####",
      "........####....####",
      "####....####....####",
      "####....####....####",
      "####...............E",
      "####...............E",
      "####...............E",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################",
      "####################"
    ]
  }
];

export default function RoboticSurgery46() {
  const { playClick, playPop, playSuccess, playError } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  
  const levelData = LEVELS[currentLevel];
  const mazeRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [damage, setDamage] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -20, y: -20 });
  const [mousePos, setMousePos] = useState({ x: -20, y: -20 });
  
  // Toggles
  const [robotActive, setRobotActive] = useState(false);
  const [visionEnhanced, setVisionEnhanced] = useState(false);

  // Reset when level changes
  useEffect(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setDamage(0);
    setRobotActive(false);
    setVisionEnhanced(false);
    setCursorPos({ x: -20, y: -20 });
  }, [currentLevel]);

  const handleStartHover = (e: React.MouseEvent) => {
    if (damage >= 100) return;
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (playPop) playPop();
      
      if (mazeRef.current) {
        const rect = mazeRef.current.getBoundingClientRect();
        setCursorPos({ 
          x: e.clientX - rect.left, 
          y: e.clientY - rect.top 
        });
      }
    }
  };

  const handleDamage = () => {
    if (damage < 100 && isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false); // Force them to restart from 'S'
      setDamage(prev => Math.min(prev + 20, 100));
      if (playError) playError();
    }
  };

  const handleWin = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (playSuccess) playSuccess();
      
      setTimeout(() => {
        if (currentLevel === LEVELS.length - 1) {
          setWin(true);
        } else {
          setCurrentLevel(prev => prev + 1);
        }
      }, 1000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mazeRef.current) return;
    
    const rect = mazeRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    setMousePos({ x: rawX, y: rawY });

    if (!isPlayingRef.current) return;

    // Apply Tremor if robot is NOT active
    const tremorAmount = robotActive ? 0 : 25; // 25px jitter
    let finalX = rawX;
    let finalY = rawY;

    if (tremorAmount > 0) {
      // Add random jitter every frame
      finalX += (Math.random() * tremorAmount - tremorAmount / 2);
      finalY += (Math.random() * tremorAmount - tremorAmount / 2);
    }
    
    // Clamp to prevent tremor from pushing out of bounds and causing unfair damage at the edges (like hitting 'E')
    finalX = Math.max(0, Math.min(finalX, (MAP_COLS * CELL_SIZE) - 1));
    finalY = Math.max(0, Math.min(finalY, (MAP_ROWS * CELL_SIZE) - 1));

    setCursorPos({ x: finalX, y: finalY });

    // Check Collision
    const col = Math.floor(finalX / CELL_SIZE);
    const row = Math.floor(finalY / CELL_SIZE);

    if (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS) {
      const cell = levelData.map[row][col];
      if (cell === '#') {
        handleDamage();
      } else if (cell === 'E') {
        handleWin();
      }
    } else {
      // Out of bounds = damage
      handleDamage();
    }
  };

  const handleMouseLeave = () => {
    if (isPlayingRef.current) {
      handleDamage();
    }
    setMousePos({ x: -20, y: -20 });
  };

  if (win) {
    return (
      <LabShell 
        labId="roboticsurgery46" 
        title="Robotics in Surgical Assistance" 
        onReset={() => {
          setCurrentLevel(0);
          setWin(false);
          setIsPlaying(false);
          isPlayingRef.current = false;
          setDamage(0);
          setRobotActive(false);
          setVisionEnhanced(false);
          setCursorPos({ x: -20, y: -20 });
        }}
      >
        <Celebration isActive={win} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.5)]">
            <HeartPulse className="text-white w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-indigo-400">
            Master Surgeon!
          </h2>
          <p className="text-slate-300 text-lg max-w-lg">
            You successfully navigated complex anatomies using robotic assistance! You experienced firsthand how tremor elimination and 3D visualization amplify human skill to save lives.
          </p>
          <button
            onClick={() => {
              setCurrentLevel(0);
              setWin(false);
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors mt-8"
          >
            Play Again
          </button>
        </motion.div>
      </LabShell>
    );
  }

  // Calculate obscure radius for blurry vision
  const isBlurry = levelData.id >= 3 && !visionEnhanced;

  return (
    <LabShell 
      labId="roboticsurgery46" 
      title="Robotics in Surgical Assistance"
      instruction="1. Study the application of robotics and low-latency networks in modern surgery. 2. Operate the remote surgery simulator to perform delicate procedures. 3. Manage the network latency and hardware feedback to ensure surgical precision. 4. Successfully complete the simulated operation within the safety parameters."
      onReset={() => {
        if (playPop) playPop();
        setCurrentLevel(0);
        setWin(false);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setDamage(0);
        setRobotActive(false);
        setVisionEnhanced(false);
        setCursorPos({ x: -20, y: -20 });
      }}
    >
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-rose-600 flex items-center gap-2">
              <Activity size={24} />
              {levelData.title}
            </h2>
            <p className="text-slate-600 text-sm mt-1">{levelData.desc}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {LEVELS.map((lvl, idx) => (
              <div
                key={lvl.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  idx < currentLevel
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : idx === currentLevel
                    ? 'border-rose-500 text-rose-600 bg-rose-50 shadow-sm'
                    : 'border-slate-300 text-slate-500 bg-white'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-start gap-6 w-full">
          
          {/* Main Operating Area */}
          <div className="shrink-0 flex flex-col items-start">
            
            <div 
              ref={mazeRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={`relative overflow-hidden rounded-xl border-4 shadow-2xl transition-all duration-300 shrink-0 ${
                damage >= 100 ? 'border-red-500 bg-red-950/20' : 
                isPlaying ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-slate-700'
              }`}
              style={{
                width: MAP_COLS * CELL_SIZE,
                height: MAP_ROWS * CELL_SIZE,
                cursor: 'none',
                backgroundColor: '#1e293b' // slate-800 base
              }}
            >
              
              {/* Render Map */}
              {levelData.map.map((row, rIdx) => (
                <div key={rIdx} className="flex">
                  {row.split('').map((cell, cIdx) => (
                    <div 
                      key={`${rIdx}-${cIdx}`}
                      style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      className={`shrink-0
                        ${cell === '#' ? 'bg-rose-950/80 border border-rose-900/30' : ''} 
                        ${cell === '.' ? 'bg-slate-800' : ''}
                        ${cell === 'S' ? 'bg-indigo-500 animate-pulse' : ''}
                        ${cell === 'E' ? 'bg-emerald-500 animate-pulse' : ''}
                      `}
                    >
                      {cell === 'S' && (
                        <div 
                          className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white cursor-pointer relative z-20"
                          onMouseEnter={handleStartHover}
                        >
                          START
                        </div>
                      )}
                      {cell === 'E' && (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white relative z-20">
                          END
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Fog of War (Blurry Vision) */}
              {isBlurry && (
                <div 
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(15, 23, 42, 0.9) 100%)`,
                    backdropFilter: 'blur(4px)'
                  }}
                />
              )}

              {/* The "Scalpel" Cursor */}
              {(isPlaying || (!isPlaying && damage < 100)) && (
                <div 
                  className="absolute pointer-events-none z-50 flex items-center justify-center"
                  style={{
                    left: isPlaying ? cursorPos.x : mousePos.x,
                    top: isPlaying ? cursorPos.y : mousePos.y,
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    backgroundColor: robotActive ? '#10b981' : '#f87171',
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${robotActive ? '#10b981' : '#f87171'}`,
                    transition: isPlaying && !robotActive ? 'all 0.05s ease-out' : 'none' // Jitter transition
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}

              {/* Game Over Overlay */}
              <AnimatePresence>
                {damage >= 100 && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-rose-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-50"
                  >
                    <ShieldAlert size={48} className="text-rose-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Critical Tissue Damage</h3>
                    <p className="text-rose-200 mb-6">Patient stress levels exceeded maximum safe limits.</p>
                    <button 
                      onClick={() => { setDamage(0); setIsPlaying(false); }}
                      className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors"
                    >
                      Restart Procedure
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-4 text-center text-sm text-slate-400">
              Hover over <span className="text-indigo-400 font-bold">START</span> to begin the incision. <br/>
              Do not touch the red tissue (walls)!
            </div>
          </div>

          {/* Right Panel: Controls & Telemetry */}
          <div className="flex flex-col md:flex-row flex-1 w-full gap-4">
            
            {/* Patient Telemetry (MOVED TO LEFT) */}
            <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                <Activity size={18} className="text-rose-600" />
                Patient Telemetry
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1 font-bold">
                    <span className="text-slate-600">Tissue Trauma (Stress)</span>
                    <span className={damage > 70 ? 'text-rose-600' : 'text-emerald-600'}>{damage}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${damage > 70 ? 'bg-rose-500' : damage > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${damage}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">System Status</div>
                  <div className="font-mono text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tremor:</span>
                      <span className={robotActive ? 'text-emerald-600' : 'text-rose-600'}>
                        {robotActive ? 'ELIMINATED' : 'DETECTED'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Camera:</span>
                      <span className={visionEnhanced ? 'text-emerald-600' : 'text-amber-600'}>
                        {visionEnhanced ? '3D HIGH-DEF' : 'STANDARD 2D'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Surgical Controls (MOVED TO RIGHT) */}
            <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                <Settings2 size={18} className="text-blue-600" />
                Surgical Controls
              </h3>
              
              <div className="space-y-4">
                {/* Robot Toggle */}
                <div className={`p-3 rounded-xl border transition-all ${
                  !levelData.robotActiveAllowed ? 'opacity-50 grayscale bg-slate-50 border-slate-200' :
                  robotActive ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-300'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Cpu size={16} className={robotActive ? 'text-indigo-600' : 'text-slate-500'} />
                      Robotic Assistance
                    </span>
                    {levelData.robotActiveAllowed && (
                      <button 
                        onClick={() => {
                          setRobotActive(!robotActive);
                          if (playClick) playClick();
                        }}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${robotActive ? 'bg-indigo-500' : 'bg-slate-600'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${robotActive ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    Enables tremor elimination technology, smoothing natural human hand movements.
                  </p>
                </div>

                {/* Vision Toggle */}
                <div className={`p-3 rounded-xl border transition-all ${
                  !levelData.visionEnhancedAllowed ? 'opacity-50 grayscale bg-slate-50 border-slate-200' :
                  visionEnhanced ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-300'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Eye size={16} className={visionEnhanced ? 'text-emerald-600' : 'text-slate-500'} />
                      3D Enhanced Vision
                    </span>
                    {levelData.visionEnhancedAllowed && (
                      <button 
                        onClick={() => {
                          setVisionEnhanced(!visionEnhanced);
                          if (playClick) playClick();
                        }}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${visionEnhanced ? 'bg-emerald-500' : 'bg-slate-600'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${visionEnhanced ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">
                    Provides high-definition, magnified, three-dimensional views of the surgical site.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </LabShell>
  );
}
