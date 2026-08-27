"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Activity, ToggleLeft, XCircle, Cpu, Zap, ShieldAlert, MonitorCheck, BookOpen } from "lucide-react";

const LEVELS = [
  { id: 'not', title: 'Level 1: Negation (NOT)', desc: 'The Opposites Game', icon: <ToggleLeft size={16} /> },
  { id: 'and', title: 'Level 2: Conjunction (AND)', desc: 'The Strict Bouncer', icon: <ShieldAlert size={16} /> },
  { id: 'or', title: 'Level 3: Disjunction (OR)', desc: 'The Generous Friend', icon: <Zap size={16} /> },
  { id: 'implies', title: 'Level 4: Implication (IF... THEN)', desc: 'The Promise', icon: <MonitorCheck size={16} /> },
  { id: 'iff', title: 'Level 5: Biconditional (IFF)', desc: 'The Perfect Match', icon: <Cpu size={16} /> },
  { id: 'compound', title: 'Boss Level: Compound Logic', desc: '(P AND Q) OR (NOT P)', icon: <Activity size={16} /> }
];

type TruthValue = boolean | null;

interface LevelData {
  hint: string;
  expression: string;
  inputs: { p: boolean; q?: boolean }[];
  expected: boolean[];
}

const LEVEL_CONFIGS: Record<number, LevelData> = {
  0: {
    hint: "The NOT operator simply flips the truth value. If it's True, it becomes False. If it's False, it becomes True.",
    expression: "¬P",
    inputs: [{ p: true }, { p: false }],
    expected: [false, true]
  },
  1: {
    hint: "The AND operator is strict. It only results in True if BOTH P and Q are True. Otherwise, it's False.",
    expression: "P ∧ Q",
    inputs: [{ p: true, q: true }, { p: true, q: false }, { p: false, q: true }, { p: false, q: false }],
    expected: [true, false, false, false]
  },
  2: {
    hint: "The OR operator is forgiving. It results in True if AT LEAST ONE of P or Q is True. It's only False when both are False.",
    expression: "P ∨ Q",
    inputs: [{ p: true, q: true }, { p: true, q: false }, { p: false, q: true }, { p: false, q: false }],
    expected: [true, true, true, false]
  },
  3: {
    hint: "Think of P as a promise made, and Q as the promise kept. It's only False (a broken promise) when P is True (you promised) but Q is False (you didn't deliver).",
    expression: "P → Q",
    inputs: [{ p: true, q: true }, { p: true, q: false }, { p: false, q: true }, { p: false, q: false }],
    expected: [true, false, true, true]
  },
  4: {
    hint: "The Biconditional operator results in True ONLY when P and Q have the EXACT SAME truth value (both True, or both False).",
    expression: "P ↔ Q",
    inputs: [{ p: true, q: true }, { p: true, q: false }, { p: false, q: true }, { p: false, q: false }],
    expected: [true, false, false, true]
  },
  5: {
    hint: "Combine what you've learned! Evaluate (P ∧ Q), then find ¬P, and finally use OR (∨) to combine those two results.",
    expression: "(P ∧ Q) ∨ ¬P",
    inputs: [{ p: true, q: true }, { p: true, q: false }, { p: false, q: true }, { p: false, q: false }],
    expected: [true, false, true, true]
  }
};

export default function PropositionalLogic42() {
  const { playClick, playSuccess, playError } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  const [userAnswers, setUserAnswers] = useState<TruthValue[]>(Array(4).fill(null));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const levelData = LEVEL_CONFIGS[currentLevel];
  const isComplete = currentLevel >= LEVELS.length;

  const handleToggle = (index: number) => {
    if (playClick) playClick();
    const newAnswers = [...userAnswers];
    if (newAnswers[index] === null) newAnswers[index] = true;
    else if (newAnswers[index] === true) newAnswers[index] = false;
    else newAnswers[index] = null;
    setUserAnswers(newAnswers);
    setErrorMsg(null);
  };

  const checkAnswers = () => {
    const expectedLength = levelData.inputs.length;
    
    // Check if all are filled
    for (let i = 0; i < expectedLength; i++) {
      if (userAnswers[i] === null) {
        if (playError) playError();
        setErrorMsg("Please fill in all the truth values before submitting.");
        return;
      }
    }

    // Validate
    let allCorrect = true;
    for (let i = 0; i < expectedLength; i++) {
      if (userAnswers[i] !== levelData.expected[i]) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      if (playSuccess) playSuccess();
      setErrorMsg(null);
      if (currentLevel === LEVELS.length - 1) {
        setWin(true);
      } else {
        setTimeout(() => {
          setCurrentLevel(c => c + 1);
          setUserAnswers(Array(4).fill(null));
        }, 1500);
      }
    } else {
      if (playError) playError();
      setErrorMsg("Some values are incorrect. Review the hint and try again!");
    }
  };

  const ValueCell = ({ val }: { val: boolean | undefined }) => {
    if (val === undefined) return null;
    return (
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-base border-2 ${val ? 'border-cyan-500 text-cyan-400 bg-cyan-900/30' : 'border-rose-500 text-rose-400 bg-rose-900/30'}`}>
        {val ? 'T' : 'F'}
      </div>
    );
  };

  const handleReset = () => {
    setCurrentLevel(0);
    setUserAnswers(Array(4).fill(null));
    setWin(false);
    setErrorMsg(null);
  };

  if (isComplete || win) {
    return (
      <LabShell 
        labId="propositionallogic42" 
        title="Propositional Logic"
        onReset={handleReset}
        instruction="1. Review the basics of propositional logic and truth tables. 2. Enter the level-based simulation to construct circuits using logical gates (AND, OR, NOT). 3. Solve the logical puzzles by creating the correct truth table outcomes. 4. Progress through all the levels to master complex propositional statements."
      >
        <Celebration isActive={win} onReplay={handleReset} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.5)]">
            <Cpu className="text-white w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            Logic Master!
          </h2>
          <p className="text-slate-300 text-lg max-w-lg">
            You have successfully conquered all truth tables. Your understanding of propositional logic is perfectly sound!
          </p>
          <button
            onClick={() => {
              setCurrentLevel(0);
              setUserAnswers(Array(4).fill(null));
              setWin(false);
            }}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition-colors mt-8"
          >
            Play Again
          </button>
        </motion.div>
      </LabShell>
    );
  }

  return (
    <LabShell 
      labId="propositionallogic42" 
      title="Propositional Logic"
      onReset={handleReset}
      instruction={levelData.hint}
    >
      <div className="max-w-5xl mx-auto space-y-2">
        
        {/* Header & Progress */}
        <div className="bg-white border border-slate-300 shadow-sm rounded-xl p-3 flex flex-col md:flex-row gap-2 items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <span className="text-cyan-600">{LEVELS[currentLevel].icon}</span>
              {LEVELS[currentLevel].title}
            </h2>
            <p className="text-slate-600 mt-1">{LEVELS[currentLevel].desc}</p>
          </div>
          <div className="flex gap-2">
            {LEVELS.map((lvl, idx) => (
              <div
                key={lvl.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  idx < currentLevel
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : idx === currentLevel
                    ? 'border-cyan-500 text-cyan-600 bg-cyan-50 shadow-sm'
                    : 'border-slate-300 text-slate-500 bg-white'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Hint Box */}
        <motion.div 
          key={currentLevel}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-2 flex gap-2 items-start"
        >
          <BookOpen className="text-indigo-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-indigo-300 font-semibold mb-0 text-sm">Hint</h3>
            <p className="text-indigo-200/80 leading-snug text-sm">{levelData.hint}</p>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Truth Table */}
          <div className="bg-white border border-slate-300 shadow-sm rounded-xl p-3 flex flex-col items-center">
            <h3 className="text-base font-mono text-cyan-700 mb-2 bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-200">
              Evaluate: {levelData.expression}
            </h3>

            <div className="w-full max-w-sm">
              {/* Table Header */}
              <div className="grid grid-cols-3 gap-1 mb-1 text-center text-slate-600 text-xs font-semibold border-b border-slate-300 pb-1">
                <div>P</div>
                <div>{levelData.inputs[0].q !== undefined ? 'Q' : ''}</div>
                <div className="text-cyan-700">{levelData.expression}</div>
              </div>

              {/* Table Rows */}
              <AnimatePresence mode="popLayout">
                {levelData.inputs.map((input, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="grid grid-cols-3 gap-1 mb-1 text-center items-center"
                  >
                    <div className="flex justify-center"><ValueCell val={input.p} /></div>
                    <div className="flex justify-center"><ValueCell val={input.q} /></div>
                    
                    {/* Interactive Output Cell */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggle(idx)}
                        className={`w-8 h-8 rounded-xl font-bold text-lg border-2 transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                          userAnswers[idx] === true
                            ? 'border-cyan-500 bg-cyan-100 text-cyan-600 shadow-sm'
                            : userAnswers[idx] === false
                            ? 'border-rose-500 bg-rose-100 text-rose-600 shadow-sm'
                            : 'border-slate-300 bg-slate-100 text-slate-500 hover:border-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {userAnswers[idx] === true ? 'T' : userAnswers[idx] === false ? 'F' : '?'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <button
              onClick={checkAnswers}
              className="mt-2 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-semibold w-full max-w-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 text-xs"
            >
              Verify Circuit
              <Activity size={18} />
            </button>
            
            {/* Error Message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-rose-400 bg-rose-950/40 px-4 py-2 rounded-lg border border-rose-900/50 flex items-center gap-2 text-sm w-full max-w-sm"
                >
                  <XCircle size={16} />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Educational Sidebar */}
          <div className="bg-white border border-slate-300 shadow-sm rounded-xl p-3 relative overflow-hidden group">
            {/* Background graphic */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Cpu className="w-64 h-64" />
            </div>
            
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Zap className="text-yellow-500" />
              Logic Gates in Action
            </h3>
            
            <div className="space-y-2 text-slate-600 relative z-10 text-xs">
              <p>
                <strong>Propositional Logic</strong> is the foundation of computing, dealing with statements that are either <em>True</em> or <em>False</em>.
              </p>

              <div className="space-y-1 pt-2">
                <h4 className="text-slate-800 font-semibold mb-1">Symbols Guide:</h4>
                <ul className="text-xs space-y-1 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-6 text-center text-cyan-600 font-mono text-sm">¬</span> NOT (Negation)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 text-center text-cyan-600 font-mono text-sm">∧</span> AND (Conjunction)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 text-center text-cyan-600 font-mono text-sm">∨</span> OR (Disjunction)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 text-center text-cyan-600 font-mono text-sm">→</span> IMPLIES (Conditional)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 text-center text-cyan-600 font-mono text-sm">↔</span> IFF (Biconditional)
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </LabShell>
  );
}
