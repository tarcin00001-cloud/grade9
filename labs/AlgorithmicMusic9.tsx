"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LabShell from "@/components/LabShell";
import Celebration from "@/components/Celebration";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import {
  Play,
  Square,
  Sparkles,
  SlidersHorizontal,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Music,
  ArrowRight,
  Settings2,
  Activity,
  Cpu,
  Zap,
  RefreshCw,
  HelpCircle,
  Radio,
  Layers,
  Gauge,
  VolumeX,
  Award,
  Disc,
} from "lucide-react";

// --- TYPES & DEFINITIONS ---

type GeneratorType = "random" | "fibonacci" | "primes" | "random_walk";
type FilterType = "bypass" | "pentatonic" | "major" | "dorian";
type TimbreType = "square" | "sine" | "sawtooth";

interface Module {
  id: string;
  type: "generator" | "filter" | "timbre";
  value: GeneratorType | FilterType | TimbreType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  borderCol: string;
  bgCol: string;
  badge: string;
}

const MODULES: Module[] = [
  // Generators
  {
    id: "gen_random",
    type: "generator",
    value: "random",
    label: "Raw Noise",
    sublabel: "Math.random()",
    icon: <Activity size={16} />,
    color: "text-rose-600",
    borderCol: "border-rose-300",
    bgCol: "bg-rose-50",
    badge: "Unconstrained",
  },
  {
    id: "gen_fibonacci",
    type: "generator",
    value: "fibonacci",
    label: "Fibonacci",
    sublabel: "0, 1, 1, 2, 3, 5, 8...",
    icon: <Layers size={16} />,
    color: "text-indigo-600",
    borderCol: "border-indigo-300",
    bgCol: "bg-indigo-50",
    badge: "Golden Ratio",
  },
  {
    id: "gen_primes",
    type: "generator",
    value: "primes",
    label: "Prime Numbers",
    sublabel: "2, 3, 5, 7, 11, 13...",
    icon: <Sparkles size={16} />,
    color: "text-purple-600",
    borderCol: "border-purple-300",
    bgCol: "bg-purple-50",
    badge: "Syncopated",
  },
  {
    id: "gen_walk",
    type: "generator",
    value: "random_walk",
    label: "Brownian Walk",
    sublabel: "xt+1 = xt ± step",
    icon: <RefreshCw size={16} />,
    color: "text-sky-600",
    borderCol: "border-sky-300",
    bgCol: "bg-sky-50",
    badge: "Organic Drift",
  },

  // Modulo Scale Filters
  {
    id: "filt_bypass",
    type: "filter",
    value: "bypass",
    label: "No Filter",
    sublabel: "Bypass / Raw Hz",
    icon: <AlertTriangle size={16} />,
    color: "text-amber-600",
    borderCol: "border-amber-300",
    bgCol: "bg-amber-50",
    badge: "Chaos",
  },
  {
    id: "filt_pentatonic",
    type: "filter",
    value: "pentatonic",
    label: "Pentatonic",
    sublabel: "Modulo 5 (% 5)",
    icon: <CheckCircle2 size={16} />,
    color: "text-emerald-600",
    borderCol: "border-emerald-300",
    bgCol: "bg-emerald-50",
    badge: "Always In Tune",
  },
  {
    id: "filt_major",
    type: "filter",
    value: "major",
    label: "C-Major Scale",
    sublabel: "Modulo 7 (% 7)",
    icon: <Music size={16} />,
    color: "text-teal-600",
    borderCol: "border-teal-300",
    bgCol: "bg-teal-50",
    badge: "Classical",
  },
  {
    id: "filt_dorian",
    type: "filter",
    value: "dorian",
    label: "Synthwave Dorian",
    sublabel: "Modulo 7 (% 7)",
    icon: <Settings2 size={16} />,
    color: "text-cyan-600",
    borderCol: "border-cyan-300",
    bgCol: "bg-cyan-50",
    badge: "Cyber Groove",
  },

  // Timbres
  {
    id: "timb_square",
    type: "timbre",
    value: "square",
    label: "8-Bit Square",
    sublabel: "Retro Chiptune",
    icon: <Square size={16} />,
    color: "text-pink-600",
    borderCol: "border-pink-300",
    bgCol: "bg-pink-50",
    badge: "Game Synth",
  },
  {
    id: "timb_sine",
    type: "timbre",
    value: "sine",
    label: "Warm Sine",
    sublabel: "Pure Sine Bell",
    icon: <Disc size={16} />,
    color: "text-blue-600",
    borderCol: "border-blue-300",
    bgCol: "bg-blue-50",
    badge: "Soft Acoustic",
  },
  {
    id: "timb_saw",
    type: "timbre",
    value: "sawtooth",
    label: "Analog Saw",
    sublabel: "Rich Brass Synth",
    icon: <Zap size={16} />,
    color: "text-orange-600",
    borderCol: "border-orange-300",
    bgCol: "bg-orange-50",
    badge: "Bold Lead",
  },
];

// Scale note frequencies (Hz) & Labels (8 lanes)
const PENTATONIC_FREQS = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25,
];
const PENTATONIC_NAMES = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];

const MAJOR_FREQS = [
  261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25,
];
const MAJOR_NAMES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

const DORIAN_FREQS = [
  293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33,
];
const DORIAN_NAMES = ["D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"];

const FIBONACCI_SEQ = [
  0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597,
];
const PRIMES_SEQ = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
];

interface NoteEvent {
  id: number;
  noteIndex: number;
  freq: number;
  name: string;
  rawVal: number | string;
  isHarmonic: boolean;
  time: number;
}

export default function AlgorithmicMusic9() {
  const { playPop, playSuccess, playError, playClick, playChime } =
    useLabAudio();
  const { reportComplete } = useLMSBridge("algorithmicmusic9");

  // Studio Modular State
  const [generator, setGenerator] = useState<GeneratorType>("random");
  const [filter, setFilter] = useState<FilterType>("bypass");
  const [timbre, setTimbre] = useState<TimbreType>("square");
  const [bpm, setBpm] = useState<number>(120);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Playback & Engine State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [activeNote, setActiveNote] = useState<NoteEvent | null>(null);
  const [noteHistory, setNoteHistory] = useState<NoteEvent[]>([]);
  const [consonance, setConsonance] = useState<number>(0); // 0 to 100%
  const [dissonanceShake, setDissonanceShake] = useState<boolean>(false);

  // Pedagogical Missions (0: Trap, 1: Fibonacci, 2: Primes, 3: Sandbox/Mastery)
  const [currentMission, setCurrentMission] = useState<number>(0);
  const [missionProgress, setMissionProgress] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [missionConsecutiveHits, setMissionConsecutiveHits] =
    useState<number>(0);

  // Assessment Modal
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [selectedQuizAns, setSelectedQuizAns] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

  // Web Audio Context & Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const walkRef = useRef<number>(3); // Initial index for brownian walk

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Clean Web Audio Polyphonic Note Player with ADSR Envelope
  const playSynthesizerTone = useCallback(
    (freq: number, type: OscillatorType, durationMs: number = 220) => {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const now = ctx.currentTime;
        const attack = 0.02;
        const release = durationMs / 1000 - attack;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + attack + release + 0.05);

        setTimeout(() => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (_) {}
        }, durationMs + 100);
      } catch (_) {}
    },
    [getAudioContext, isMuted],
  );

  // Clean Stop
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      audioCtxRef.current.suspend();
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopPlayback]);

  // Single Step Generation Engine
  const executeStep = useCallback(() => {
    setStepIndex((prev) => prev + 1);

    let rawVal: number | string = 0;
    let computedFreq = 261.63;
    let noteName = "C4";
    let noteLane = 0;
    let isHarmonic = true;

    // 1. Math Generator computation
    if (generator === "random") {
      const r = Math.floor(Math.random() * 1000);
      rawVal = r;
    } else if (generator === "fibonacci") {
      const idx = stepIndex % FIBONACCI_SEQ.length;
      rawVal = FIBONACCI_SEQ[idx];
    } else if (generator === "primes") {
      const idx = stepIndex % PRIMES_SEQ.length;
      rawVal = PRIMES_SEQ[idx];
    } else if (generator === "random_walk") {
      const step = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      walkRef.current = Math.max(0, Math.min(20, walkRef.current + step));
      rawVal = walkRef.current;
    }

    // 2. Modulo Scale Quantizer
    if (filter === "bypass") {
      // Raw microtonal chaos
      const chaoticFreq = 180 + (Number(rawVal) % 650) + Math.random() * 30;
      computedFreq = chaoticFreq;
      noteName = `${Math.round(chaoticFreq)} Hz`;
      noteLane = Math.floor(Math.random() * 8);
      isHarmonic = false;
      setConsonance(15);

      // Trigger Dissonance Shake
      setDissonanceShake(true);
      setTimeout(() => setDissonanceShake(false), 300);
    } else if (filter === "pentatonic") {
      const numVal = Number(rawVal) || 0;
      const lane = numVal % PENTATONIC_FREQS.length; // Modulo mapping!
      computedFreq = PENTATONIC_FREQS[lane];
      noteName = PENTATONIC_NAMES[lane];
      noteLane = lane;
      isHarmonic = true;
      setConsonance(98);
    } else if (filter === "major") {
      const numVal = Number(rawVal) || 0;
      const lane = numVal % MAJOR_FREQS.length; // Modulo 7 / 8
      computedFreq = MAJOR_FREQS[lane];
      noteName = MAJOR_NAMES[lane];
      noteLane = lane;
      isHarmonic = true;
      setConsonance(95);
    } else if (filter === "dorian") {
      const numVal = Number(rawVal) || 0;
      const lane = numVal % DORIAN_FREQS.length;
      computedFreq = DORIAN_FREQS[lane];
      noteName = DORIAN_NAMES[lane];
      noteLane = lane;
      isHarmonic = true;
      
      // Give 100% Max Harmonic only for the perfect final mission combo
      if (generator === "primes" && timbre === "square") {
        setConsonance(100);
      } else {
        setConsonance(96);
      }
    }

    // 3. Audio Synthesis
    playSynthesizerTone(computedFreq, timbre, Math.max(120, (60 / bpm) * 800));

    const noteEvent: NoteEvent = {
      id: Date.now() + Math.random(),
      noteIndex: noteLane,
      freq: Math.round(computedFreq * 10) / 10,
      name: noteName,
      rawVal,
      isHarmonic,
      time: Date.now(),
    };

    setActiveNote(noteEvent);
    setNoteHistory((prev) => [noteEvent, ...prev.slice(0, 11)]);

    // 4. Mission Tracking & Progression
    if (currentMission === 0) {
      // Mission 0: Dissonance Trap -> Fix with Pentatonic Filter
      if (filter === "pentatonic" && isHarmonic) {
        setMissionConsecutiveHits((c) => {
          const next = c + 1;
          if (next >= 6 && !missionProgress[0]) {
            setMissionProgress((p) => [true, p[1], p[2]]);
            playSuccess();
            setTimeout(() => {
              setCurrentMission(1);
              setMissionConsecutiveHits(0);
            }, 1200);
          }
          return next;
        });
      }
    } else if (currentMission === 1) {
      // Mission 1: Fibonacci Melodist (Fibonacci + Major or Pentatonic)
      if (generator === "fibonacci" && filter !== "bypass" && isHarmonic) {
        setMissionConsecutiveHits((c) => {
          const next = c + 1;
          if (next >= 8 && !missionProgress[1]) {
            setMissionProgress((p) => [p[0], true, p[2]]);
            playSuccess();
            setTimeout(() => {
              setCurrentMission(2);
              setMissionConsecutiveHits(0);
            }, 1200);
          }
          return next;
        });
      }
    } else if (currentMission === 2) {
      // Mission 2: Prime Groove (Primes + Dorian + 8-Bit)
      if (
        generator === "primes" &&
        filter === "dorian" &&
        timbre === "square" &&
        isHarmonic
      ) {
        setMissionConsecutiveHits((c) => {
          const next = c + 1;
          if (next >= 8 && !missionProgress[2]) {
            setMissionProgress((p) => [p[0], p[1], true]);
            playSuccess();
            setTimeout(() => {
              setShowQuiz(true);
              stopPlayback();
            }, 1500);
          }
          return next;
        });
      }
    }
  }, [
    stepIndex,
    generator,
    filter,
    timbre,
    bpm,
    playSynthesizerTone,
    currentMission,
    missionProgress,
    playSuccess,
    stopPlayback,
  ]);

  const executeStepRef = useRef(executeStep);
  useEffect(() => {
    executeStepRef.current = executeStep;
  }, [executeStep]);

  // Master Transport Control (Play/Stop)
  const togglePlay = () => {
    if (isPlaying) {
      playClick();
      stopPlayback();
    } else {
      playPop();
      setIsPlaying(true);
      getAudioContext();
      // Fire first step immediately
      executeStepRef.current();
    }
  };

  // Reconfigure timer when BPM or play state changes
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 1000 * 0.5;
      const id = setInterval(() => {
        executeStepRef.current();
      }, intervalMs);
      return () => clearInterval(id);
    }
  }, [bpm, isPlaying]);

  // Module Equip Handler
  const equipModule = (mod: Module) => {
    playClick();
    if (mod.type === "generator") {
      setGenerator(mod.value as GeneratorType);
    } else if (mod.type === "filter") {
      setFilter(mod.value as FilterType);
    } else if (mod.type === "timbre") {
      setTimbre(mod.value as TimbreType);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (quizSubmitted) return;
    setSelectedQuizAns(index);
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    if (selectedQuizAns === 1) {
      playSuccess();
      setTimeout(() => {
        setShowQuiz(false);
        setHasWon(true);
        setTimeout(() => {
          reportComplete();
        }, 1500);
      }, 1200); // Wait 1.2s so they see the green success state before closing
    } else {
      playError();
    }
  };

  const resetAll = () => {
    stopPlayback();
    setGenerator("random");
    setFilter("bypass");
    setTimbre("square");
    setBpm(120);
    setStepIndex(0);
    setActiveNote(null);
    setNoteHistory([]);
    setConsonance(0);
    setCurrentMission(0);
    setMissionProgress([false, false, false]);
    setMissionConsecutiveHits(0);
    setShowQuiz(false);
    setSelectedQuizAns(null);
    setQuizSubmitted(false);
    setHasWon(false);
    playClick();
  };

  // Active module lookups for Bay Displays
  const activeGenCart = MODULES.find(
    (c) => c.type === "generator" && c.value === generator,
  )!;
  const activeFiltCart = MODULES.find(
    (c) => c.type === "filter" && c.value === filter,
  )!;
  const activeTimbCart = MODULES.find(
    (c) => c.type === "timbre" && c.value === timbre,
  )!;

  // Needle angle for consonance gauge: 0% -> -60deg, 100% -> +60deg
  const needleAngle = -60 + (consonance / 100) * 120;

  return (
    <LabShell
      labId="algorithmicmusic9"
      title="The Math Melody Maker"
      instruction="Snap mathematical generators and modulo scale filters into the synthesizer rack to turn numerical chaos into musical harmony."
      compact={true}
      bgOverride="bg-slate-50"
      onReset={resetAll}
    >
      <Celebration
        isActive={hasWon}
        message="Master Algorithmic Composer! You successfully harnessed modulo arithmetic and mathematical series to compose structured digital music."
        onReplay={resetAll}
      />

      <div className="flex flex-col w-full h-full min-h-0 relative font-sans overflow-hidden px-2 md:px-4 py-1 gap-2 md:gap-3 max-w-6xl mx-auto">
        {/* ─── TOP MISSION & CONTROL HUD ─── */}
        <div className="flex items-center justify-between gap-2 bg-white border-[3px] border-slate-200/70 shadow-xl shadow-indigo-900/5 rounded-2xl px-4 py-2 shrink-0">
          {/* Mission Progress Badges */}
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
            <span className="text-[11px] font-black uppercase tracking-tight text-slate-500 hidden sm:inline">
              Missions:
            </span>
            {[
              {
                title: "1. Dissonance Fix",
                desc: "Snap Modulo-5 Pentatonic Filter",
              },
              {
                title: "2. Fibonacci Arpeggio",
                desc: "Fibonacci + Major Scale",
              },
              { title: "3. Prime Groove", desc: "Primes + Dorian + 8-Bit" },
            ].map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playClick();
                  setCurrentMission(idx);
                  setMissionConsecutiveHits(0);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentMission === idx
                    ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300"
                    : missionProgress[idx]
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {missionProgress[idx] ? (
                  <CheckCircle2 size={13} className="text-emerald-600" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[9px] font-black">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate tracking-tight">{m.title}</span>
              </button>
            ))}
          </div>

          {/* Master Transport Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* BPM Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-xl border-2 border-slate-200 shadow-inner">
              <span className="text-[10px] font-black tracking-wider text-slate-500">
                BPM
              </span>
              <select
                value={bpm}
                onChange={(e) => {
                  playClick();
                  setBpm(Number(e.target.value));
                }}
                className="bg-transparent font-mono font-black text-sm text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={90}>90</option>
                <option value={120}>120</option>
                <option value={140}>140</option>
                <option value={160}>160</option>
              </select>
            </div>

            {/* Mute Toggle */}
            <button
              onClick={() => {
                playClick();
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className={`p-1.5 rounded-xl border-2 transition-colors ${
                isMuted
                  ? "bg-rose-100 border-rose-300 text-rose-700"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Master Play Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-tight shadow-md transition-all cursor-pointer ${
                isPlaying
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200 border-b-4 border-rose-800"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200 border-b-4 border-emerald-800"
              }`}
            >
              {isPlaying ? (
                <Square size={14} fill="currentColor" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              <span>{isPlaying ? "Halt Synth" : "Run Melody"}</span>
            </motion.button>
          </div>
        </div>

        {/* ─── WORKSPACE (3-BAY MODULAR SYNTH RACK + PIANO ROLL) ─── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-3 overflow-hidden">
          {/* LEFT 7 COLS: EURORACK 3-BAY */}
          <div
            className={`lg:col-span-7 bg-slate-200 border-[6px] border-slate-300 rounded-[2rem] p-4 md:p-5 shadow-[0_20px_50px_-12px_rgba(30,41,59,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] flex flex-col justify-between overflow-hidden relative ${
              dissonanceShake
                ? "animate-shake border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)]"
                : ""
            }`}
          >
            {/* Header Rack Strip */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-slate-300/50 shadow-[0_2px_0_rgba(255,255,255,0.5)]">
              <div className="flex items-center gap-2">
                <Cpu size={20} className="text-slate-600 drop-shadow-sm" />
                <span className="text-sm font-black uppercase tracking-tight text-slate-700 drop-shadow-sm">
                  Modular Algorithmic DSP Rack
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full shadow-inner border border-slate-700">
                <span className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] ${isPlaying ? "bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" : "bg-slate-600"}`}
                  />
                  <span className="font-bold tracking-widest text-slate-300">
                    {isPlaying ? "ACTIVE DSP" : "STANDBY"}
                  </span>
                </span>
                <div className="w-px h-3 bg-slate-600" />
                <span className="text-cyan-400 font-bold tracking-widest">
                  STEP #{stepIndex}
                </span>
              </div>
            </div>

            {/* The 3 Modular Bays */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 relative">
              {/* Connecting DSP Signal Flow Wires */}
              <div className="absolute top-1/2 left-[33.3%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none hidden sm:flex">
                <div className="w-8 h-8 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-indigo-400 shadow-[0_5px_10px_rgba(0,0,0,0.3)]">
                  <ArrowRight size={14} strokeWidth={4} />
                </div>
              </div>
              <div className="absolute top-1/2 left-[66.6%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none hidden sm:flex">
                <div className="w-8 h-8 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-emerald-400 shadow-[0_5px_10px_rgba(0,0,0,0.3)]">
                  <ArrowRight size={14} strokeWidth={4} />
                </div>
              </div>

              {/* BAY 1: MATH GENERATOR SLOT */}
              <div className="bg-slate-200 border-[4px] border-slate-300 rounded-2xl flex flex-col relative shadow-[inset_0_10px_20px_rgba(0,0,0,0.15)] overflow-hidden min-h-[140px]">
                <div className="bg-slate-800 border-b-4 border-slate-900 text-white px-3 py-2 flex items-center justify-between shadow-md z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    1. Math Gen
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-indigo-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                    INPUT
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between p-2.5 relative z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                  <div className="flex flex-col items-center justify-center flex-1 drop-shadow-md">
                    <span className="text-4xl mb-1 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]">
                      {activeGenCart.icon}
                    </span>
                    <span className="text-[11px] font-black text-slate-800 text-center leading-tight tracking-tight bg-white/90 px-3 py-1 rounded-full shadow-sm border border-slate-200">
                      {activeGenCart.label}
                    </span>
                  </div>
                  <div className="bg-slate-950 border-[3px] border-slate-800 rounded-xl py-1.5 px-2.5 flex items-center justify-between text-[11px] font-mono shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] mt-2">
                    <span className="text-slate-500 font-bold tracking-widest">
                      RAW
                    </span>
                    <span className="font-black text-indigo-400 text-sm drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]">
                      {activeNote ? activeNote.rawVal : "---"}
                    </span>
                  </div>
                </div>
              </div>

              {/* BAY 2: MODULO SCALE QUANTIZER SLOT */}
              <div
                className={`rounded-2xl flex flex-col relative overflow-hidden min-h-[140px] transition-colors ${
                  filter === "bypass"
                    ? "bg-amber-100/50 border-[4px] border-amber-200 shadow-[inset_0_10px_20px_rgba(217,119,6,0.15)]"
                    : "bg-emerald-100/50 border-[4px] border-emerald-200 shadow-[inset_0_10px_20px_rgba(5,150,105,0.15)]"
                }`}
              >
                <div
                  className={`border-b-4 px-3 py-2 flex items-center justify-between shadow-md z-10 text-white ${
                    filter === "bypass"
                      ? "bg-amber-600 border-amber-700"
                      : "bg-emerald-600 border-emerald-700"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-sm">
                    2. Scale Filter
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-black/30 px-2 py-0.5 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                    MODULO
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between p-2.5 relative z-0">
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${filter === "bypass" ? "from-amber-500/10" : "from-emerald-500/10"} to-transparent pointer-events-none`}
                  />
                  <div className="flex flex-col items-center justify-center flex-1 drop-shadow-md">
                    <span className="text-4xl mb-1 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]">
                      {activeFiltCart.icon}
                    </span>
                    <span className="text-[11px] font-black text-slate-800 text-center leading-tight tracking-tight bg-white/90 px-3 py-1 rounded-full shadow-sm border border-slate-200">
                      {activeFiltCart.label}
                    </span>
                  </div>
                  <div className="bg-slate-950 border-[3px] border-slate-800 rounded-xl py-1.5 px-2.5 flex items-center justify-between text-[11px] font-mono shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] mt-2">
                    <span className="text-slate-500 font-bold tracking-widest">
                      PITCH
                    </span>
                    <span
                      className={`font-black text-sm drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] ${
                        filter === "bypass"
                          ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                          : "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      }`}
                    >
                      {activeNote ? activeNote.name : "---"}
                    </span>
                  </div>
                </div>
              </div>

              {/* BAY 3: SYNTHESIS & TIMBRE SLOT */}
              <div className="bg-slate-200 border-[4px] border-slate-300 rounded-2xl flex flex-col relative shadow-[inset_0_10px_20px_rgba(0,0,0,0.15)] overflow-hidden min-h-[140px]">
                <div className="bg-slate-800 border-b-4 border-slate-900 text-white px-3 py-2 flex items-center justify-between shadow-md z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    3. Instrument
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-sky-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                    AUDIO
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between p-2.5 relative z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none" />
                  <div className="flex flex-col items-center justify-center flex-1 drop-shadow-md">
                    <span className="text-4xl mb-1 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)]">
                      {activeTimbCart.icon}
                    </span>
                    <span className="text-[11px] font-black text-slate-800 text-center leading-tight tracking-tight bg-white/90 px-3 py-1 rounded-full shadow-sm border border-slate-200">
                      {activeTimbCart.label}
                    </span>
                  </div>
                  <div className="bg-slate-950 border-[3px] border-slate-800 rounded-xl py-1.5 px-2.5 flex items-center justify-between text-[11px] font-mono shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] mt-2">
                    <span className="text-slate-500 font-bold tracking-widest">
                      FREQ
                    </span>
                    <span className="font-black text-sky-400 text-sm drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
                      {activeNote ? `${activeNote.freq}Hz` : "---"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Math Explanation Banner */}
            <div className="mt-4 bg-slate-900 text-slate-100 rounded-xl p-3 border-[3px] border-slate-800 flex items-center justify-between text-xs shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-lg ${filter === "bypass" ? "bg-rose-950" : "bg-emerald-950"}`}
                >
                  <Activity
                    size={20}
                    className={
                      filter === "bypass"
                        ? "text-rose-500 animate-pulse drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]"
                        : "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"
                    }
                  />
                </div>
                <span className="font-mono text-xs font-bold truncate tracking-tight text-slate-300">
                  {filter === "bypass"
                    ? "️ Unconstrained Raw Numbers → High Harmonic Clash!"
                    : `Formula: Note = ${activeGenCart.label} % ${filter === "pentatonic" ? "5 (Pentatonic Scale)" : "7 (Scale Degree)"} → In Tune!`}
                </span>
              </div>
              <span
                className={`shrink-0 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  filter === "bypass"
                    ? "bg-rose-950 text-rose-300 border border-rose-600"
                    : "bg-emerald-950 text-emerald-300 border border-emerald-600"
                }`}
              >
                {filter === "bypass" ? "DISSONANCE" : "CONSONANCE"}
              </span>
            </div>
          </div>

          {/* RIGHT 5 COLS: GLOWING PIANO ROLL & HARMONIC CONSONANCE GAUGE */}
          <div className="lg:col-span-5 bg-slate-200 border-[6px] border-slate-300 rounded-[2rem] p-4 md:p-5 shadow-[0_20px_50px_-12px_rgba(30,41,59,0.25),inset_0_4px_6px_rgba(255,255,255,0.7)] flex flex-col justify-between overflow-hidden gap-4">
            {/* Upper Telemetry: Consonance Gauge & Interval Readout */}
            <div className="flex items-center justify-between bg-slate-800 border-[4px] border-slate-900 rounded-2xl p-3 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
              {/* Giant Dial Gauge */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-14 flex items-end justify-center bg-slate-100 rounded-t-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.2)] border-[3px] border-b-0 border-slate-300 overflow-visible">
                  <div className="absolute inset-0 rounded-t-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                  <svg
                    viewBox="0 0 100 60"
                    className="w-[90%] h-[90%] overflow-visible drop-shadow-md z-10"
                  >
                    {/* Gauge background arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Colored sectors */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 40 22"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 40 22 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Tick Marks */}
                    <line
                      x1="50"
                      y1="10"
                      x2="50"
                      y2="18"
                      stroke="#0f172a"
                      strokeWidth="3"
                    />
                    <line
                      x1="20"
                      y1="28"
                      x2="26"
                      y2="34"
                      stroke="#0f172a"
                      strokeWidth="3"
                    />
                    <line
                      x1="80"
                      y1="28"
                      x2="74"
                      y2="34"
                      stroke="#0f172a"
                      strokeWidth="3"
                    />
                    {/* Needle Group (Centered via transparent circle) */}
                    <motion.g
                      animate={{ rotate: needleAngle }}
                      transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 12,
                      }}
                      style={{ originX: 0.5, originY: 0.5 }}
                    >
                      {/* Transparent bounding box enforcer */}
                      <circle cx="50" cy="50" r="42" fill="transparent" />
                      {/* The actual needle */}
                      <line
                        x1="50"
                        y1="50"
                        x2="50"
                        y2="8"
                        stroke="#0f172a"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    </motion.g>

                    {/* Needle Base Bezel (Drawn on top to cover needle root) */}
                    <circle cx="50" cy="50" r="10" fill="#0f172a" />
                    <circle cx="50" cy="50" r="4" fill="#cbd5e1" />
                  </svg>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest drop-shadow-sm">
                    Consonance
                  </span>
                  <span
                    className={`font-mono text-2xl font-black tracking-tighter ${
                      consonance >= 80
                        ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        : "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                    }`}
                  >
                    {consonance}% {consonance >= 80 ? "Harmonic" : "Clashing"}
                  </span>
                </div>
              </div>

              {/* Active Musical Interval */}
              <div className="flex flex-col items-end text-right font-mono">
                <span className="text-[10px] font-black text-slate-400 tracking-widest">
                  ACTIVE RATIO
                </span>
                <span className="text-sm font-black text-slate-200 tracking-tight">
                  {filter === "bypass" ? "No Scale (Chaos)" : "Harmonic Ratios"}
                </span>
                <span className="text-xs text-indigo-950 font-black bg-indigo-400 px-2 py-1 rounded-md mt-1 shadow-[0_0_10px_rgba(129,140,248,0.5)] border border-indigo-300">
                  {activeNote ? activeNote.name : "Waiting..."}
                </span>
              </div>
            </div>

            {/* Interactive 8-Key Glowing Piano Roll Stave */}
            <div className="flex-1 min-h-[140px] bg-slate-950 rounded-2xl p-3 flex flex-col justify-between border-[6px] border-slate-800 shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
              {/* Upgraded Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

              <div className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 border-b-2 border-slate-700/50 pb-2 z-10">
                <span>PITCH STAVE (C4 → C5)</span>
                <span>OCTAVE FREQ SPECTRUM</span>
              </div>

              {/* 8 Pitch Lanes */}
              <div className="grid grid-cols-8 gap-2 h-full items-end pt-3 z-10">
                {PENTATONIC_NAMES.map((name, idx) => {
                  const isActive =
                    activeNote && activeNote.noteIndex === idx && isPlaying;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center h-full justify-end gap-2 relative"
                    >
                      {/* Note waterfall visualizer */}
                      <div className="w-full flex-1 bg-slate-900 rounded-md flex items-end justify-center relative overflow-hidden border-2 border-b-0 border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        {isActive && (
                          <motion.div
                            initial={{ height: "0%", opacity: 1 }}
                            animate={{ height: "100%", opacity: [1, 0.8, 0.4] }}
                            transition={{ duration: 0.3 }}
                            className={`w-full rounded-md ${
                              activeNote?.isHarmonic
                                ? "bg-gradient-to-t from-emerald-500 to-cyan-300 shadow-[0_0_20px_#34d399]"
                                : "bg-gradient-to-t from-rose-600 to-amber-400 shadow-[0_0_20px_#f43f5e]"
                            }`}
                          />
                        )}
                      </div>

                      {/* Stave Key (Thick 3D Pad) */}
                      <motion.div
                        animate={isActive ? { y: 6 } : { y: 0 }}
                        className={`w-full py-2.5 rounded-lg text-center text-[10px] font-mono font-black transition-colors border-[3px] border-b-[10px] z-20 shadow-[0_5px_10px_rgba(0,0,0,0.5)] ${
                          isActive
                            ? activeNote?.isHarmonic
                              ? "bg-emerald-400 border-emerald-500 border-b-[3px] text-emerald-950 shadow-[0_0_20px_#34d399]"
                              : "bg-rose-500 border-rose-600 border-b-[3px] text-rose-950 shadow-[0_0_20px_#f43f5e]"
                            : "bg-slate-200 border-slate-400 border-b-slate-500 text-slate-800"
                        }`}
                      >
                        {name}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM ROM MODULE TRAY (CLICK-TO-EQUIP) ─── */}
        <div className="bg-slate-200 border-[6px] border-slate-300 rounded-3xl p-3 md:p-4 shadow-[inset_0_10px_20px_rgba(0,0,0,0.1),0_15px_30px_rgba(0,0,0,0.1)] shrink-0 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between px-2 relative z-10">
            <div className="flex items-center gap-2">
              <Disc size={20} className="text-slate-600 drop-shadow-sm" />
              <span className="text-sm font-black uppercase tracking-tight text-slate-700 drop-shadow-sm">
                Rule ROM Modules (Equip into DSP)
              </span>
            </div>
            <span className="text-[10px] text-slate-600 font-black hidden sm:inline bg-slate-300 px-3 py-1 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border border-slate-400">
              Tap any ROM to slam it into its hardware socket
            </span>
          </div>

          {/* Wrapping Grid of ROMs */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-3 relative z-10">
            {MODULES.map((mod) => {
              const isEquipped =
                (mod.type === "generator" && generator === mod.value) ||
                (mod.type === "filter" && filter === mod.value) ||
                (mod.type === "timbre" && timbre === mod.value);

              return (
                <motion.button
                  key={mod.id}
                  whileHover={!isEquipped ? { scale: 1.05, y: -4 } : {}}
                  whileTap={{ scale: 0.95, y: 2 }}
                  onClick={() => equipModule(mod)}
                  className={`flex flex-col items-center p-2.5 rounded-xl border-[3px] border-b-[8px] transition-all cursor-pointer text-left relative overflow-hidden group ${
                    isEquipped
                      ? mod.type === "generator"
                        ? "bg-indigo-600 border-indigo-900 border-b-[3px] translate-y-[5px] text-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)]"
                        : mod.type === "filter"
                          ? "bg-emerald-600 border-emerald-900 border-b-[3px] translate-y-[5px] text-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)]"
                          : "bg-sky-600 border-sky-900 border-b-[3px] translate-y-[5px] text-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.4)]"
                      : "bg-slate-50 border-slate-400 text-slate-800 hover:bg-white shadow-[0_5px_15px_rgba(0,0,0,0.15)]"
                  }`}
                >
                  {isEquipped && (
                    <div className="absolute top-2 right-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white block shadow-[0_0_8px_#ffffff] animate-pulse" />
                    </div>
                  )}
                  {/* Grip ridges on the module */}
                  {!isEquipped && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-20">
                      <div className="w-1 h-1.5 bg-black rounded-full" />
                      <div className="w-1 h-1.5 bg-black rounded-full" />
                      <div className="w-1 h-1.5 bg-black rounded-full" />
                    </div>
                  )}

                  <span className="text-3xl mb-1 drop-shadow-sm mt-1 filter group-hover:drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] transition-all">
                    {mod.icon}
                  </span>
                  <span
                    className={`text-[11px] font-black tracking-tight text-center leading-tight w-full ${isEquipped ? "text-white drop-shadow-md" : "text-slate-900"}`}
                  >
                    {mod.label}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold text-center w-full mt-1 px-1 py-0.5 rounded ${isEquipped ? "bg-black/30 text-white" : "bg-slate-200 text-slate-600"}`}
                  >
                    {mod.badge}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── CONCEPT ASSESSMENT MODAL ─── */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white border-2 border-slate-200 rounded-2xl shadow-2xl p-5 max-w-lg w-full flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100 pb-2">
                <Award size={22} />
                <h3 className="text-base font-black uppercase tracking-wide text-slate-900">
                  Concept Mastery Challenge
                </h3>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-800">
                  How does Modulo Arithmetic (e.g.{" "}
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">
                    Note = Number % 5
                  </code>
                  ) turn crazy, infinite math sequences into good music?
                </span>
                <span className="text-xs text-slate-500">
                  Select the correct concept:
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  "It makes every note louder so you can hear it better.",
                  "It wraps big math numbers around so they always fit perfectly into a small musical scale.",
                  "It just deletes all the bad sounding notes randomly.",
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition-all cursor-pointer ${
                      selectedQuizAns === idx
                        ? quizSubmitted
                          ? idx === 1
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300"
                            : "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-300"
                          : "bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-300"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center font-black text-[10px] shrink-0 bg-white">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                ))}
              </div>

              {quizSubmitted && selectedQuizAns !== 1 && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-2.5 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                  <span>
                    Not quite! Modulo arithmetic works like a clock, wrapping big numbers around so they always fit perfectly into a small, repeating scale! Try again.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowQuiz(false);
                    setQuizSubmitted(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Back to Sandbox
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={selectedQuizAns === null}
                  className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  Submit & Complete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LabShell>
  );
}
