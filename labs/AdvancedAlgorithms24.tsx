"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Binary, Share2, Layers, AlignLeft, CheckCircle2, RotateCcw } from "lucide-react";

// The levels
const LEVELS = [
  { id: 'binary', title: 'Binary Search', desc: 'Act as the algorithm', icon: <Binary size={20} /> },
  { id: 'dfs', title: 'Depth-First Search', desc: 'Trace the path', icon: <Share2 size={20} /> },
  { id: 'bfs', title: 'Breadth-First Search', desc: 'Trace the path', icon: <Layers size={20} /> },
  { id: 'merge', title: 'Merge Sort', desc: 'Merge the halves', icon: <AlignLeft size={20} /> }
];

export default function AdvancedAlgorithms24() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // === Level 1: Binary Search ===
  const bsArr = [3, 9, 14, 19, 22, 35, 42, 51, 68, 77, 81, 99];
  const bsTarget = 42;
  const [bsL, setBsL] = useState(0);
  const [bsR, setBsR] = useState(11);
  const [bsPhase, setBsPhase] = useState<'select_mid' | 'discard' | 'done'>('select_mid');
  const [bsMid, setBsMid] = useState(-1);

  const handleBsClick = (idx: number) => {
    if (bsPhase === 'done') return;
    setErrorMsg(null);

    const correctMid = Math.floor((bsL + bsR) / 2);

    if (bsPhase === 'select_mid') {
      if (idx !== correctMid) {
        if (playError) playError();
        setErrorMsg("Binary Search always picks the exact middle element of the remaining items!");
        return;
      }
      // Correct mid
      if (playPop) playPop();
      setBsMid(correctMid);
      if (bsArr[correctMid] === bsTarget) {
        if (playSuccess) playSuccess();
        setBsPhase('done');
      } else {
        setBsPhase('discard');
      }
    } else if (bsPhase === 'discard') {
      const midVal = bsArr[bsMid];
      if (midVal < bsTarget) {
        // Target is larger, discard left half (idx <= mid)
        if (idx > bsMid) {
          if (playError) playError();
          setErrorMsg(`42 is larger than ${midVal}, so it must be on the right. You should discard the left half!`);
          return;
        }
        if (playClick) playClick();
        setBsL(bsMid + 1);
        setBsPhase('select_mid');
      } else {
        // Target is smaller, discard right half (idx >= mid)
        if (idx < bsMid) {
          if (playError) playError();
          setErrorMsg(`42 is smaller than ${midVal}, so it must be on the left. You should discard the right half!`);
          return;
        }
        if (playClick) playClick();
        setBsR(bsMid - 1);
        setBsPhase('select_mid');
      }
    }
  };

  // === Level 2 & 3: DFS & BFS ===
  // Graph: 1(root) -> 2(L), 3(R). 2 -> 4(L), 5(R). 3 -> 6(R).
  const dfsCorrect = [1, 2, 4, 5, 3, 6];
  const bfsCorrect = [1, 2, 3];
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);

  const handleNodeClick = (id: number) => {
    if (visitedNodes.includes(id)) return;
    setErrorMsg(null);
    
    const correctSeq = currentLevel === 1 ? dfsCorrect : bfsCorrect;
    const currentStep = visitedNodes.length;
    
    if (currentStep === correctSeq.length) return;

    if (id !== correctSeq[currentStep]) {
      if (playError) playError();
      if (currentLevel === 1) {
        setErrorMsg("DFS goes as deep as possible first! Trace down the leftmost path entirely before backtracking.");
      } else {
        setErrorMsg("BFS explores layer-by-layer! You must visit all nodes on the current level before going deeper.");
      }
      return;
    }

    if (playPop) playPop();
    const newVisited = [...visitedNodes, id];
    setVisitedNodes(newVisited);

    if (newVisited.length === correctSeq.length) {
      if (playSuccess) playSuccess();
    }
  };

  // === Level 4: Merge Sort ===
  const [mergeL, setMergeL] = useState([27, 38]);
  const [mergeR, setMergeR] = useState([3, 43]);
  const [mergeMerged, setMergeMerged] = useState<number[]>([]);

  const handleMergeClick = (val: number, side: 'L'|'R') => {
    setErrorMsg(null);
    
    const nextL = mergeL.length > 0 ? mergeL[0] : Infinity;
    const nextR = mergeR.length > 0 ? mergeR[0] : Infinity;
    const minVal = Math.min(nextL, nextR);

    if (val !== minVal) {
      if (playError) playError();
      setErrorMsg("Merge Sort always picks the lowest available number from either pile to build the Ordered list!");
      return;
    }

    if (playPop) playPop();
    if (side === 'L') {
      setMergeL(mergeL.slice(1));
    } else {
      setMergeR(mergeR.slice(1));
    }
    const newMerged = [...mergeMerged, val];
    setMergeMerged(newMerged);

    if (newMerged.length === 4) {
      if (playSuccess) playSuccess();
    }
  };


  const nextLevel = () => {
    if (currentLevel + 1 >= LEVELS.length) {
      if (playZap) playZap();
      setWin(true);
    } else {
      if (playSuccess) playSuccess();
      setCurrentLevel(l => l + 1);
      setErrorMsg(null);
      
      // Reset all states for the next level
      setBsL(0);
      setBsR(11);
      setBsPhase('select_mid');
      setBsMid(-1);
      setVisitedNodes([]);
      setMergeL([27, 38]);
      setMergeR([3, 43]);
      setMergeMerged([]);
    }
  };

  const resetCurrentLevel = () => {
    if (playClick) playClick();
    setErrorMsg(null);
    if (currentLevel === 0) {
      setBsL(0);
      setBsR(11);
      setBsPhase('select_mid');
      setBsMid(-1);
    } else if (currentLevel === 1 || currentLevel === 2) {
      setVisitedNodes([]);
    } else if (currentLevel === 3) {
      setMergeL([27, 38]);
      setMergeR([3, 43]);
      setMergeMerged([]);
    }
  };

  const resetGame = () => {
    if (playClick) playClick();
    setCurrentLevel(0);
    setWin(false);
    setErrorMsg(null);
    setBsL(0);
    setBsR(11);
    setBsPhase('select_mid');
    setBsMid(-1);
    setVisitedNodes([]);
    setMergeL([27, 38]);
    setMergeR([3, 43]);
    setMergeMerged([]);
  };

  const isLevelComplete = () => {
    if (currentLevel === 0) return bsPhase === 'done';
    if (currentLevel === 1) return visitedNodes.length === dfsCorrect.length;
    if (currentLevel === 2) return visitedNodes.length === bfsCorrect.length;
    if (currentLevel === 3) return mergeMerged.length === 4;
    return false;
  };

  const getChallengeQuestion = () => {
    if (currentLevel === 0) {
      if (bsPhase === 'select_mid') return "Question: We need to find the number 42. What is the first step in Binary Search? (Click the exact middle element)";
      if (bsPhase === 'discard') return `Question: The middle is ${bsArr[bsMid]}. 42 is ${42 > bsArr[bsMid] ? 'larger' : 'smaller'} than ${bsArr[bsMid]}. Which half of the numbers should we discard? (Click the half to discard)`;
      return "Success! You found 42 in O(log n) time.";
    }
    if (currentLevel === 1) return "Question: Find Node 6 using Depth-First Search. Can you click the nodes in the exact order DFS would visit them? (Remember: Go deep first!)";
    if (currentLevel === 2) return "Question: Find Node 3 using Breadth-First Search. Can you click the nodes in the exact order BFS would visit them? (Remember: Explore layer-by-layer!)";
    if (currentLevel === 3) return "Question: Complete the final step of Merge Sort. Can you merge these two Ordered piles into one? (Click the lowest available number)";
    return "";
  };

  const getInstruction = () => {
    return "Follow the Current Objective to complete the algorithm challenge!";
  };

  return (
    <LabShell
      labId="advancedalgorithms24"
      title="Algorithm Explorer"
      subtitle="Interactive Execution"
      theme="cosmos"
      compact={true}
      onReset={resetGame}
      instruction="1. Choose an algorithm (Binary Search, DFS, BFS, or Merge Sort) from the sandbox. 2. Provide a custom dataset or use a randomized one for the algorithm to process. 3. Step through the algorithm execution visually to understand its mechanics. 4. Compare the performance and complexity metrics of different algorithms."
    >
      <Celebration isActive={win} onReplay={resetGame} message="You proved your mastery of Algorithms by executing them perfectly!" />

      {!win && (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto gap-3 p-2">
          
          {/* Level Progress */}
          <div className="flex gap-2 shrink-0">
            {LEVELS.map((level, i) => (
              <div 
                key={level.id} 
                className={`flex-1 flex flex-col p-2 rounded-xl border-2 transition-colors ${i === currentLevel ? 'bg-sky-100 border-sky-400 text-sky-900 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : i < currentLevel ? 'bg-emerald-50 border-emerald-500/30 text-emerald-600' : 'bg-white border-slate-300 text-slate-500'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {level.icon}
                  <span className="text-sm font-black uppercase tracking-widest">{level.title}</span>
                </div>
                <span className="text-xs font-bold opacity-80">{level.desc}</span>
              </div>
            ))}
          </div>

          {/* Main Visualizer Area */}
          <div className="flex-1 bg-white rounded-3xl border-4 border-slate-700/50 shadow-2xl flex flex-col items-center p-3 relative overflow-hidden min-h-0">
            
            {/* Objective Box */}
            <div className="bg-slate-50 border-2 border-sky-500/50 p-2 rounded-xl w-full max-w-4xl text-center mb-2 shadow-[0_0_15px_rgba(14,165,233,0.15)] shrink-0 z-20">
               <h3 className="text-sky-600 font-black uppercase tracking-widest text-[10px] mb-1">Current Objective</h3>
               <p className="text-slate-900 text-sm font-bold leading-tight">{getChallengeQuestion()}</p>
            </div>

            {/* The Visualization */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 relative z-10 overflow-hidden">
              
              {/* === Level 1: Binary Search === */}
              {currentLevel === 0 && (
                <div className="flex gap-2">
                  {bsArr.map((num, idx) => {
                    const isMid = bsPhase === 'discard' && idx === bsMid;
                    const inRange = idx >= bsL && idx <= bsR;
                    const isDiscarded = !inRange;
                    const isTarget = bsPhase === 'done' && num === bsTarget;
                    
                    return (
                      <motion.button 
                        layout
                        onClick={() => handleBsClick(idx)}
                        disabled={isDiscarded || bsPhase === 'done'}
                        key={idx} 
                        animate={{
                          scale: isTarget ? 1.2 : isMid ? 1.15 : 1,
                          opacity: isDiscarded ? 0.2 : 1
                        }}
                        className={`w-12 h-16 flex items-center justify-center rounded-lg border-2 font-black text-xl shadow-lg transition-colors cursor-pointer ${isTarget ? 'bg-emerald-500 border-emerald-400 text-slate-900 z-10' : isMid ? 'bg-amber-400 border-amber-300 text-amber-950 z-10' : isDiscarded ? 'bg-slate-100 border-slate-300 text-slate-400' : 'bg-sky-600 border-sky-400 text-white hover:bg-sky-500'}`}>
                        {isMid || isTarget ? num : '?'}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* === Level 2 & 3: Trees === */}
              {(currentLevel === 1 || currentLevel === 2) && (
                <div className="relative w-[300px] h-[180px] my-auto">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="50%" y1="15%" x2="30%" y2="50%" stroke="#334155" strokeWidth="4" />
                    <line x1="50%" y1="15%" x2="70%" y2="50%" stroke="#334155" strokeWidth="4" />
                    <line x1="30%" y1="50%" x2="15%" y2="85%" stroke="#334155" strokeWidth="4" />
                    <line x1="30%" y1="50%" x2="45%" y2="85%" stroke="#334155" strokeWidth="4" />
                    <line x1="70%" y1="50%" x2="85%" y2="85%" stroke="#334155" strokeWidth="4" />
                  </svg>
                  {[
                    { id: 1, x: 50, y: 15 },
                    { id: 2, x: 30, y: 50 },
                    { id: 3, x: 70, y: 50 },
                    { id: 4, x: 15, y: 85 },
                    { id: 5, x: 45, y: 85 },
                    { id: 6, x: 85, y: 85 }
                  ].map(node => {
                    const isActive = visitedNodes.includes(node.id);
                    return (
                      <motion.button
                        key={node.id}
                        onClick={() => handleNodeClick(node.id)}
                        disabled={isActive}
                        animate={{ 
                          scale: isActive ? 1.2 : 1, 
                          backgroundColor: isActive ? '#10b981' : '#f8fafc',
                          borderColor: isActive ? '#34d399' : '#cbd5e1',
                          color: isActive ? '#022c22' : '#64748b'
                        }}
                        className="absolute w-10 h-10 rounded-full border-[3px] flex items-center justify-center font-black text-lg shadow-lg z-10 hover:border-sky-400 hover:text-sky-400 cursor-pointer transition-colors"
                        style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        {node.id}
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* === Level 4: Merge Sort === */}
              {currentLevel === 3 && (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="flex justify-center gap-8 w-full">
                    {/* Left Pile */}
                    <div className="flex gap-2 bg-slate-100 p-4 rounded-2xl border-2 border-slate-300 shadow-xl min-h-[100px] min-w-[150px]">
                      <AnimatePresence>
                        {mergeL.map((num) => (
                          <motion.button 
                            key={`L-${num}`}
                            layout
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            onClick={() => handleMergeClick(num, 'L')}
                            className="w-12 h-16 flex items-center justify-center bg-fuchsia-600 hover:bg-fuchsia-500 border-2 border-fuchsia-400 rounded-lg font-black text-xl text-white shadow-md cursor-pointer transition-colors"
                          >
                            {num}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Right Pile */}
                    <div className="flex gap-2 bg-slate-100 p-4 rounded-2xl border-2 border-slate-300 shadow-xl min-h-[100px] min-w-[150px]">
                      <AnimatePresence>
                        {mergeR.map((num) => (
                          <motion.button 
                            key={`R-${num}`}
                            layout
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            onClick={() => handleMergeClick(num, 'R')}
                            className="w-12 h-16 flex items-center justify-center bg-sky-600 hover:bg-sky-500 border-2 border-sky-400 rounded-lg font-black text-xl text-white shadow-md cursor-pointer transition-colors"
                          >
                            {num}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Merged List */}
                  <div className="flex gap-2 bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-500/50 shadow-xl min-h-[100px] w-[300px] justify-center items-center">
                    <AnimatePresence>
                      {mergeMerged.length === 0 && (
                        <div className="text-slate-600 font-bold uppercase tracking-widest text-sm">Merged List</div>
                      )}
                      {mergeMerged.map((num) => (
                        <motion.div 
                          key={`M-${num}`}
                          layout
                          initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }}
                          className="w-12 h-16 flex items-center justify-center bg-emerald-600 border-2 border-emerald-400 rounded-lg font-black text-xl text-white shadow-md"
                        >
                          {num}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

            </div>

            {/* Error Message Box */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-8 bg-red-950 px-8 py-4 rounded-2xl border-2 border-red-500 shadow-xl max-w-2xl text-center"
                >
                  <p className="text-lg font-bold text-red-200 tracking-wide">
                    {errorMsg}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-2 border-slate-700/50 shrink-0">
            <button 
              onClick={resetCurrentLevel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm"
            >
              <RotateCcw size={16} /> Reset Level
            </button>
            
            {isLevelComplete() ? (
              <motion.button 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={nextLevel}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-lg uppercase tracking-[0.2em] bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <CheckCircle2 size={20} /> {currentLevel === 3 ? 'Finish Lab' : 'Next Level'}
              </motion.button>
            ) : (
              <div className="px-8 py-3 font-black text-lg text-slate-600 uppercase tracking-[0.2em]">
                Awaiting Input...
              </div>
            )}
          </div>
          
        </div>
      )}
    </LabShell>
  );
}
