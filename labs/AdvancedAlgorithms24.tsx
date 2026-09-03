"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Search, GitMerge, Waypoints, Network, CheckCircle2, AlertTriangle, XCircle, ArrowDown, RotateCcw, ClipboardCheck
} from "lucide-react";

// --- Data & Types ---
const TABS = [
  { id: 'bs', name: 'Binary Search', icon: Search, desc: 'Find 68 in O(log n) time.' },
  { id: 'ms', name: 'Merge Sort', icon: GitMerge, desc: 'Merge arrays in O(n) time.' },
  { id: 'dfs', name: 'DFS Traversal', icon: Waypoints, desc: 'Explore deep before wide.' },
  { id: 'bfs', name: 'BFS Traversal', icon: Network, desc: 'Explore level-by-level.' },
  { id: 'assess', name: 'Deployment', icon: ClipboardCheck, desc: 'Final architectural deployment.' }
];

const ALL_SCENARIOS = [
  // Binary Search
  { id: 0, text: "Locate a specific user profile instantly within a sorted database of 10 billion records.", correct: 'bs' },
  { id: 1, text: "Quickly find a word's definition in a digital dictionary that is strictly sorted alphabetically.", correct: 'bs' },
  { id: 2, text: "Guess a secret number between 1 and 1,000,000 using the absolute fewest possible attempts.", correct: 'bs' },
  { id: 3, text: "Pinpoint the exact timestamp of a specific error in a massive, chronologically sorted server log.", correct: 'bs' },
  { id: 4, text: "Identify a specific song by its unique catalog ID in a highly structured, ordered music library.", correct: 'bs' },
  
  // Merge Sort
  { id: 5, text: "Sort petabytes of unstructured data efficiently using thousands of parallel servers.", correct: 'ms' },
  { id: 6, text: "Combine and sort millions of decentralized customer records pulled from 50 different retail branches.", correct: 'ms' },
  { id: 7, text: "Organize an e-commerce catalog of 500 million products by price using external memory.", correct: 'ms' },
  { id: 8, text: "Efficiently process and sort massive genome sequencing data files that are too large to fit in RAM.", correct: 'ms' },
  { id: 9, text: "Systematically stitch together thousands of smaller, sorted log files into one massive timeline.", correct: 'ms' },
  
  // DFS
  { id: 10, text: "Solve a logic maze by completely exploring a single path to a dead-end before backtracking.", correct: 'dfs' },
  { id: 11, text: "Check software for infinite loops by diving deep into function call dependency chains.", correct: 'dfs' },
  { id: 12, text: "Generate a highly complex labyrinth for a video game by carving out long, twisting corridors.", correct: 'dfs' },
  { id: 13, text: "Search a computer's file system by exploring a folder and all its deeply nested sub-folders.", correct: 'dfs' },
  { id: 14, text: "Analyze possible moves in a game of Chess by imagining one specific sequence of plays to its absolute end.", correct: 'dfs' },
  
  // BFS
  { id: 15, text: "Analyze a GPS road map to find the absolute shortest physical driving route between two cities.", correct: 'bfs' },
  { id: 16, text: "Recommend new connections on a social network by scanning 'friends of friends' level-by-level.", correct: 'bfs' },
  { id: 17, text: "Sweep a game grid to find the nearest health pack radiating outward from the player's location.", correct: 'bfs' },
  { id: 18, text: "Search a peer-to-peer network for a file by asking your immediate neighbors, then their neighbors.", correct: 'bfs' },
  { id: 19, text: "Broadcast a critical emergency alert to a network of cell towers, prioritizing the closest towers first.", correct: 'bfs' },
];

const BS_ARRAY = [3, 14, 25, 47, 68, 84, 99];
const BS_TARGET = 68;

const MS_LEFT = [3, 27, 38];
const MS_RIGHT = [9, 10, 82];

const GRAPH_NODES = [
  { id: 'A', x: 50, y: 15 },
  { id: 'B', x: 25, y: 45 },
  { id: 'C', x: 75, y: 45 },
  { id: 'D', x: 10, y: 85 },
  { id: 'E', x: 40, y: 85 },
  { id: 'F', x: 75, y: 85 }
];
const GRAPH_EDGES = [
  ['A', 'B'], ['A', 'C'],
  ['B', 'D'], ['B', 'E'],
  ['C', 'F']
];
const DFS_ORDER = ['A', 'B', 'D', 'E', 'C', 'F'];
const BFS_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];

const MAX_STRIKES = 3;

// --- Main Component ---
export default function AdvancedAlgorithms24() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();
  const { reportComplete } = useLMSBridge("advancedalgorithms24");

  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState([false, false, false, false, false]);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [activeScenarios, setActiveScenarios] = useState<typeof ALL_SCENARIOS>([]);
  const [strikes, setStrikes] = useState(0);
  const [feedback, setFeedback] = useState<{msg: string, type: 'error'|'success'} | null>(null);

  // Initialize random scenarios on mount
  useEffect(() => {
    if (activeScenarios.length === 0) {
      const shuffled = [...ALL_SCENARIOS].sort(() => 0.5 - Math.random());
      setActiveScenarios(shuffled.slice(0, 5));
    }
  }, [activeScenarios.length]);

  // Binary Search State
  const [bsLeft, setBsLeft] = useState(0);
  const [bsRight, setBsRight] = useState(BS_ARRAY.length - 1);
  const [bsFound, setBsFound] = useState(false);

  // Merge Sort State
  const [msLeftIdx, setMsLeftIdx] = useState(0);
  const [msRightIdx, setMsRightIdx] = useState(0);
  const [msMerged, setMsMerged] = useState<number[]>([]);

  // Graph State (DFS/BFS)
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);

  const resetGame = () => {
    setActiveTab(0);
    setStrikes(0);
    setCompletedTabs([false, false, false, false, false]);
    setCurrentScenario(0);
    
    // Shuffle and pick 5 new scenarios
    const shuffled = [...ALL_SCENARIOS].sort(() => 0.5 - Math.random());
    setActiveScenarios(shuffled.slice(0, 5));
    
    setFeedback(null);
    
    setBsLeft(0);
    setBsRight(BS_ARRAY.length - 1);
    setBsFound(false);
    
    setMsLeftIdx(0);
    setMsRightIdx(0);
    setMsMerged([]);
    
    setVisitedNodes([]);
    
    if (playPop) playPop();
  };

  const handleStrike = (msg: string) => {
    if (playError) playError();
    setFeedback({ msg, type: 'error' });
    setStrikes(s => s + 1);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleTabComplete = (tabIdx: number) => {
    if (playSuccess) playSuccess();
    setFeedback({ msg: `${TABS[tabIdx].name} Mastered!`, type: 'success' });
    
    const newCompleted = [...completedTabs];
    newCompleted[tabIdx] = true;
    setCompletedTabs(newCompleted);

    setTimeout(() => {
       setFeedback(null);
       if (newCompleted.every(Boolean)) {
         reportComplete({ points: 100 - (strikes * 10) });
       } else {
         // Auto advance to next uncompleted tab
         const nextTab = newCompleted.findIndex(c => !c);
         if (nextTab !== -1) setActiveTab(nextTab);
       }
    }, 2000);
  };

  useEffect(() => {
    if (completedTabs.length === 4) {
       setCompletedTabs(prev => [...prev, false]);
    }
  }, [completedTabs.length]);

  const handleAssessmentClick = (selectedAlgoId: string) => {
     if (completedTabs[4] || strikes >= 3 || currentScenario >= activeScenarios.length) return;
     
     const correctId = activeScenarios[currentScenario].correct;
     if (selectedAlgoId === correctId) {
         setFeedback({ msg: "Architecture matched!", type: 'success' });
         
         if (currentScenario === activeScenarios.length - 1) {
             const newCompleted = [...completedTabs];
             newCompleted[4] = true;
             setCompletedTabs(newCompleted);
             setCurrentScenario(s => s + 1);
             
             setTimeout(() => {
                setFeedback(null);
                if (newCompleted.every(Boolean)) {
                  reportComplete({ points: 100 - (strikes * 10) });
                }
             }, 2000);
         } else {
             setCurrentScenario(s => s + 1);
             setTimeout(() => setFeedback(null), 1500);
         }
     } else {
         handleStrike("CRITICAL FLAW! Wrong algorithm for this job.");
     }
  };

  // --- Interactions ---
  const handleBsClick = (idx: number) => {
    if (completedTabs[0] || feedback) return;
    if (idx < bsLeft || idx > bsRight) return; 

    // Explicitly use the professional integer overflow prevention formula from Chapter 24
    const expectedMid = bsLeft + Math.floor((bsRight - bsLeft) / 2);
    if (idx !== expectedMid) {
      handleStrike(`Wrong! Formula: left + ((right - left) / 2). Middle of ${bsLeft} to ${bsRight} is ${expectedMid}.`);
      return;
    }

    if (playPop) playPop();
    const val = BS_ARRAY[idx];
    if (val === BS_TARGET) {
      setBsFound(true);
      handleTabComplete(0);
    } else if (val < BS_TARGET) {
      setBsLeft(idx + 1);
    } else {
      setBsRight(idx - 1);
    }
  };

  const handleMsClick = (side: 'left' | 'right') => {
    if (completedTabs[1] || feedback) return;
    
    const leftVal = msLeftIdx < MS_LEFT.length ? MS_LEFT[msLeftIdx] : Infinity;
    const rightVal = msRightIdx < MS_RIGHT.length ? MS_RIGHT[msRightIdx] : Infinity;
    
    if (side === 'left' && leftVal === Infinity) return;
    if (side === 'right' && rightVal === Infinity) return;

    if (side === 'left') {
       if (leftVal < rightVal) {
          if (playClick) playClick();
          setMsMerged([...msMerged, leftVal]);
          setMsLeftIdx(msLeftIdx + 1);
          if (msLeftIdx + 1 === MS_LEFT.length && msRightIdx === MS_RIGHT.length) handleTabComplete(1);
       } else {
          handleStrike(`Wrong! ${rightVal} is smaller than ${leftVal}. Always pick the minimum!`);
       }
    } else {
       if (rightVal < leftVal) {
          if (playClick) playClick();
          setMsMerged([...msMerged, rightVal]);
          setMsRightIdx(msRightIdx + 1);
          if (msLeftIdx === MS_LEFT.length && msRightIdx + 1 === MS_RIGHT.length) handleTabComplete(1);
       } else {
          handleStrike(`Wrong! ${leftVal} is smaller than ${rightVal}. Always pick the minimum!`);
       }
    }
  };

  const handleGraphClick = (nodeId: string, isDfs: boolean) => {
    const tabIdx = isDfs ? 2 : 3;
    if (completedTabs[tabIdx] || feedback) return;
    if (visitedNodes.includes(nodeId)) return;

    const targetOrder = isDfs ? DFS_ORDER : BFS_ORDER;
    const expectedNode = targetOrder[visitedNodes.length];

    if (nodeId === expectedNode) {
      if (playPop) playPop();
      const newVisited = [...visitedNodes, nodeId];
      setVisitedNodes(newVisited);
      if (newVisited.length === GRAPH_NODES.length) {
         handleTabComplete(tabIdx);
      }
    } else {
      handleStrike(`Wrong! In ${isDfs ? 'DFS' : 'BFS'}, ${expectedNode} is the next node to visit.`);
    }
  };

  useEffect(() => {
    if (activeTab === 2 || activeTab === 3) {
       setVisitedNodes([]);
    }
  }, [activeTab]);

  const renderBinarySearch = () => (
    <div className="flex flex-col items-center justify-center h-full w-full gap-3 sm:gap-6 flex-1 min-h-0">
       <div className="text-center shrink-0">
         <p className="text-slate-600 font-bold text-xs sm:text-sm lg:text-base mb-1">
           Rule: Click exact middle using <strong className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">left + (right - left) / 2</strong>.
         </p>
         <p className="text-slate-800 font-black text-lg sm:text-xl lg:text-3xl">
           Target Value: <span className="text-2xl sm:text-3xl lg:text-5xl text-emerald-600 ml-1 sm:ml-2">{BS_TARGET}</span>
         </p>
       </div>
       
       <div className="flex flex-wrap justify-center gap-2 sm:gap-4 w-full max-w-6xl">
         <AnimatePresence>
           {BS_ARRAY.map((num, idx) => {
             const isOut = idx < bsLeft || idx > bsRight;
             
             return (
               <motion.button
                 key={num}
                 layout
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ 
                   opacity: isOut ? 0.15 : 1, 
                   scale: isOut ? 0.7 : 1,
                   y: isOut ? 10 : 0
                 }}
                 onClick={() => handleBsClick(idx)}
                 disabled={isOut || completedTabs[0]}
                 className={`w-14 h-16 sm:w-20 sm:h-24 lg:w-24 lg:h-28 rounded-xl lg:rounded-2xl font-black text-xl sm:text-3xl lg:text-4xl transition-all flex flex-col items-center justify-center
                   ${isOut ? 'bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed' : 
                     bsFound && num === BS_TARGET ? 'bg-emerald-500 text-white border-b-4 lg:border-b-8 border-emerald-700 shadow-xl scale-110 z-10' :
                     'bg-sky-500 text-white border-b-4 lg:border-b-8 border-sky-700 shadow-lg active:translate-y-2 active:border-b-0 hover:bg-sky-400 cursor-pointer'}
                 `}
               >
                 {num}
                 <span className={`text-[10px] lg:text-xs mt-0.5 lg:mt-1 ${isOut ? 'text-slate-400' : 'text-sky-100 font-bold'}`}>idx {idx}</span>
               </motion.button>
             );
           })}
         </AnimatePresence>
       </div>
    </div>
  );

  const renderMergeSort = () => (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4 sm:gap-6 flex-1 min-h-0">
       <div className="text-center shrink-0">
         <p className="text-slate-600 font-bold text-xs sm:text-sm lg:text-base">
           Rule: Merge arrays by clicking the <strong>strictly smallest element</strong> at the front of either array.
         </p>
       </div>
       
       <div className="flex gap-4 sm:gap-12 lg:gap-24 w-full max-w-5xl justify-center">
          {/* Left Shelf */}
          <div className="flex flex-col items-center gap-2 sm:gap-4">
             <span className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-0.5 rounded-full border border-slate-200">Left Array</span>
             <div className="flex gap-2 lg:gap-3">
                {MS_LEFT.map((num, idx) => {
                  const isAvailable = idx === msLeftIdx;
                  const isGone = idx < msLeftIdx;
                  return (
                    <div key={num} className="relative">
                      {!isGone && (
                        <motion.button
                          layoutId={`ms-item-${num}`}
                          onClick={() => handleMsClick('left')}
                          disabled={!isAvailable || completedTabs[1]}
                          className={`w-12 h-14 sm:w-20 sm:h-24 lg:w-24 lg:h-28 rounded-xl lg:rounded-2xl font-black text-xl sm:text-3xl lg:text-4xl flex items-center justify-center transition-all absolute top-0 left-0
                            ${isAvailable ? 'bg-indigo-500 text-white border-b-4 lg:border-b-8 border-indigo-700 shadow-lg active:translate-y-2 active:border-b-0 hover:bg-indigo-400 cursor-pointer z-10' 
                            : 'bg-slate-200 text-slate-400 border-b-2 sm:border-b-4 border-slate-300 opacity-60 cursor-not-allowed z-0'}
                          `}
                        >
                          {num}
                        </motion.button>
                      )}
                      <div className="w-12 h-14 sm:w-20 sm:h-24 lg:w-24 lg:h-28 bg-slate-50 rounded-xl lg:rounded-2xl border-2 sm:border-4 border-dashed border-slate-200"></div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Right Shelf */}
          <div className="flex flex-col items-center gap-2 sm:gap-4">
             <span className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-0.5 rounded-full border border-slate-200">Right Array</span>
             <div className="flex gap-2 lg:gap-3">
                {MS_RIGHT.map((num, idx) => {
                  const isAvailable = idx === msRightIdx;
                  const isGone = idx < msRightIdx;
                  return (
                    <div key={num} className="relative">
                      {!isGone && (
                        <motion.button
                          layoutId={`ms-item-${num}`}
                          onClick={() => handleMsClick('right')}
                          disabled={!isAvailable || completedTabs[1]}
                          className={`w-12 h-14 sm:w-20 sm:h-24 lg:w-24 lg:h-28 rounded-xl lg:rounded-2xl font-black text-xl sm:text-3xl lg:text-4xl flex items-center justify-center transition-all absolute top-0 left-0
                            ${isAvailable ? 'bg-indigo-500 text-white border-b-4 lg:border-b-8 border-indigo-700 shadow-lg active:translate-y-2 active:border-b-0 hover:bg-indigo-400 cursor-pointer z-10' 
                            : 'bg-slate-200 text-slate-400 border-b-2 sm:border-b-4 border-slate-300 opacity-60 cursor-not-allowed z-0'}
                          `}
                        >
                          {num}
                        </motion.button>
                      )}
                      <div className="w-12 h-14 sm:w-20 sm:h-24 lg:w-24 lg:h-28 bg-slate-50 rounded-xl lg:rounded-2xl border-2 sm:border-4 border-dashed border-slate-200"></div>
                    </div>
                  );
                })}
             </div>
          </div>
       </div>

       <div className="h-4 sm:h-8 flex items-center justify-center shrink-0">
         <ArrowDown size={24} className="text-slate-300 animate-bounce sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
       </div>

       {/* Merged Array Tray */}
       <div className="bg-slate-50 border-4 border-slate-200 rounded-2xl lg:rounded-[2rem] p-2 sm:p-4 w-full max-w-4xl flex gap-2 sm:gap-4 justify-center items-center shrink-0">
          {msMerged.map((num) => (
             <motion.div 
               layoutId={`ms-item-${num}`}
               key={`merged-${num}`} 
               className="w-12 h-14 sm:w-20 sm:h-24 lg:w-24 lg:h-28 bg-emerald-500 text-white border-b-2 sm:border-b-4 lg:border-b-8 border-emerald-700 rounded-xl lg:rounded-2xl font-black text-xl sm:text-3xl lg:text-4xl flex items-center justify-center shadow-md"
             >
               {num}
             </motion.div>
          ))}
          {Array.from({ length: MS_LEFT.length + MS_RIGHT.length - msMerged.length }).map((_, i) => (
             <div key={`empty-${i}`} className="w-12 h-14 sm:w-20 sm:h-24 lg:w-24 lg:h-28 bg-white rounded-xl lg:rounded-2xl border-2 sm:border-4 border-dashed border-slate-200"></div>
          ))}
       </div>
    </div>
  );

  const renderGraph = (isDfs: boolean) => (
    <div className="flex flex-col items-center justify-center h-full w-full gap-2 sm:gap-4 flex-1 min-h-0">
       <div className="text-center shrink-0">
         <p className="text-slate-600 font-bold text-xs sm:text-sm lg:text-base">
           Rule: Trace the graph starting from <strong>Node A</strong>.<br className="hidden sm:block"/>
           {isDfs ? " Explore deeply (prioritize children alphabetically) before backtracking." : " Explore level-by-level (prioritize neighbors alphabetically)."}
         </p>
       </div>
       
       <div className="relative w-full max-w-5xl flex-1 min-h-0 bg-slate-50 rounded-3xl lg:rounded-[2.5rem] border-4 lg:border-8 border-slate-200 shadow-inner overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {GRAPH_EDGES.map((edge, idx) => {
               const n1 = GRAPH_NODES.find(n => n.id === edge[0])!;
               const n2 = GRAPH_NODES.find(n => n.id === edge[1])!;
               const isTraversed = visitedNodes.includes(n1.id) && visitedNodes.includes(n2.id);
               return (
                 <motion.line 
                   key={idx}
                   x1={`${n1.x}%`} y1={`${n1.y}%`}
                   x2={`${n2.x}%`} y2={`${n2.y}%`}
                   stroke={isTraversed ? '#10b981' : '#cbd5e1'}
                   strokeWidth="6"
                   strokeLinecap="round"
                   animate={{ stroke: isTraversed ? '#10b981' : '#cbd5e1', strokeWidth: isTraversed ? 10 : 6 }}
                 />
               );
            })}
          </svg>

          {GRAPH_NODES.map((node) => {
             const isVisited = visitedNodes.includes(node.id);
             return (
               <button
                 key={node.id}
                 onClick={() => handleGraphClick(node.id, isDfs)}
                 disabled={isVisited || completedTabs[isDfs ? 2 : 3]}
                 className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full font-black text-lg sm:text-2xl lg:text-3xl flex items-center justify-center transition-all shadow-lg
                   ${isVisited ? 'bg-emerald-500 text-white border-2 lg:border-4 border-emerald-300 scale-110 z-20' 
                   : 'bg-white text-slate-700 border-b-4 lg:border-b-8 border-slate-300 active:translate-y-1 sm:active:translate-y-2 active:border-b-0 hover:border-sky-400 hover:text-sky-500 cursor-pointer z-10'}
                 `}
                 style={{ left: `${node.x}%`, top: `${node.y}%` }}
               >
                 {node.id}
               </button>
             );
          })}
       </div>

       <div className="flex gap-2 sm:gap-3 items-center h-8 sm:h-12 shrink-0">
         <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mr-1 sm:mr-2">Sequence:</span>
         {visitedNodes.map((n) => (
            <motion.div key={n} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-emerald-500 text-white rounded-lg lg:rounded-xl font-black text-lg lg:text-xl flex items-center justify-center shadow-sm">
              {n}
            </motion.div>
         ))}
       </div>
    </div>
  );

  const renderAssessment = () => {
    if (activeScenarios.length === 0) return null; // Wait for initialization

    if (currentScenario >= activeScenarios.length) {
       return (
         <div className="flex flex-col items-center justify-center h-full w-full">
            <CheckCircle2 size={80} className="text-emerald-500 mb-6 drop-shadow-md" />
            <h2 className="text-4xl sm:text-5xl font-black text-emerald-600 uppercase tracking-widest text-center">Systems Optimized</h2>
         </div>
       );
    }

    const scene = activeScenarios[currentScenario];

    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-6 sm:gap-10 flex-1 min-h-0">
         <div className="text-center shrink-0 w-full px-4">
           <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Incoming Architecture Job</h3>
           <div className="relative mx-auto max-w-3xl">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={scene.id}
                   initial={{ opacity: 0, x: 100, rotate: 5 }}
                   animate={{ opacity: 1, x: 0, rotate: 0 }}
                   exit={{ opacity: 0, x: -100, rotate: -5 }}
                   transition={{ type: "spring", stiffness: 200, damping: 20 }}
                   className="bg-white border-4 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_rgba(30,41,59,1)] lg:shadow-[12px_12px_0px_rgba(30,41,59,1)]"
                 >
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 leading-snug">{scene.text}</p>
                 </motion.div>
              </AnimatePresence>
           </div>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl px-4 shrink-0">
            {TABS.slice(0,4).map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => handleAssessmentClick(tab.id)}
                 disabled={strikes >= 3}
                 className="flex flex-col items-center justify-center gap-2 sm:gap-4 bg-slate-50 hover:bg-sky-50 border-4 border-b-8 border-slate-300 hover:border-sky-400 active:border-b-4 active:translate-y-1 rounded-2xl p-4 sm:p-6 transition-all group cursor-pointer"
               >
                 <tab.icon size={48} className="text-slate-400 group-hover:text-sky-500 group-active:scale-95 transition-all" />
                 <span className="font-black text-slate-600 group-hover:text-sky-600 uppercase tracking-widest text-[10px] sm:text-sm text-center">{tab.name}</span>
               </button>
            ))}
         </div>
      </div>
    );
  };

  return (
    <LabShell
      labId="advancedalgorithms24"
      theme="ocean"
      title="Algorithm Explorer"
      instruction="Execute these 4 advanced algorithms perfectly without running out of strikes."
      compact
      onReset={resetGame}
    >
      <Celebration isActive={completedTabs.every(Boolean)} onReplay={resetGame} message={`Algorithm Mastery Complete! Score: ${100 - (strikes*10)}`} />

      <div className="flex flex-col h-full w-full max-w-7xl mx-auto gap-2 p-2">
        
        {/* Massive White Card containing everything (Scrolling Prohibited) */}
        <div className="flex-1 bg-white rounded-[1.5rem] lg:rounded-[2rem] border-4 border-slate-200 shadow-2xl flex flex-col p-3 lg:p-6 relative overflow-hidden">
           
           {/* Top Header inside white card */}
           <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-slate-100 gap-2 shrink-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden sm:block text-xs font-black text-slate-400 uppercase tracking-widest">Strikes</span>
                <div className="flex gap-1.5 sm:gap-2">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 
                      ${s <= strikes ? 'bg-red-500 border-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                      <XCircle size={16} strokeWidth={3} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 flex justify-center">
                 <AnimatePresence mode="wait">
                   {feedback && (
                     <motion.div 
                       key={feedback.msg}
                       initial={{ opacity: 0, scale: 0.9, y: 5 }} 
                       animate={{ opacity: 1, scale: 1, y: 0 }} 
                       exit={{ opacity: 0, scale: 0.9, y: -5 }}
                       className={`font-black uppercase tracking-widest text-[10px] sm:text-xs lg:text-sm px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border-2 shadow-sm whitespace-nowrap
                         ${feedback.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}
                     >
                       {feedback.type === 'error' ? <AlertTriangle size={14} className="inline mr-1 mb-0.5" /> : <CheckCircle2 size={14} className="inline mr-1 mb-0.5" />}
                       {feedback.msg}
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-lg sm:text-xl font-black text-slate-800 tracking-tighter leading-none">
                   {completedTabs.filter(Boolean).length}<span className="text-slate-300 text-sm sm:text-base">/4</span>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Mastery</span>
              </div>
           </div>

           {/* Extremely Compact Tab Navigation */}
           <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full shrink-0 mb-3">
             {TABS.map((tab, idx) => {
               const isActive = activeTab === idx;
               const isCompleted = completedTabs[idx];
               const Icon = tab.icon;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(idx)}
                   className={`relative overflow-hidden p-2 rounded-xl text-left border-2 sm:border-4 transition-all flex items-center gap-2
                     ${isActive ? 'bg-white border-sky-500 shadow-md z-10' : 
                       isCompleted ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : 
                       'bg-slate-50 border-slate-200 hover:bg-slate-100'}
                   `}
                 >
                   <div className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-sky-100 text-sky-600' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                     <Icon size={18} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className={`font-black uppercase tracking-wider text-[10px] sm:text-xs truncate ${isActive ? 'text-sky-900' : isCompleted ? 'text-emerald-900' : 'text-slate-600'}`}>
                       {tab.name}
                     </h3>
                   </div>
                   {isCompleted && <CheckCircle2 size={16} className="text-emerald-500 shrink-0 hidden sm:block" />}
                   {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500"></div>}
                 </button>
               );
             })}
           </div>

           {/* Sandbox Area inside white card */}
           <div className="flex-1 w-full flex flex-col relative min-h-0 overflow-hidden">
             <AnimatePresence mode="wait">
               <motion.div 
                 key={activeTab}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.2 }}
                 className="flex-1 w-full flex flex-col relative"
               >
                  {/* Completion Overlay for specific tab */}
                  {completedTabs[activeTab] && !completedTabs.every(Boolean) && (
                     <motion.div 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                     >
                       <div className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner">
                         <CheckCircle2 size={48} className="text-emerald-500 sm:w-16 sm:h-16" />
                       </div>
                       <h2 className="text-2xl sm:text-4xl font-black text-emerald-600 mb-2 sm:mb-4 tracking-tight">MODULE MASTERED</h2>
                       <p className="text-slate-600 text-sm sm:text-lg font-bold">
                         Select another tab to continue your training.
                       </p>
                     </motion.div>
                  )}

                  {activeTab === 0 && renderBinarySearch()}
                  {activeTab === 1 && renderMergeSort()}
                  {activeTab === 2 && renderGraph(true)}
                  {activeTab === 3 && renderGraph(false)}
                  {activeTab === 4 && renderAssessment()}
               </motion.div>
             </AnimatePresence>
           </div>
           
           {/* ENTIRE CARD GAME OVER OVERLAY (Modal Style) */}
           <AnimatePresence>
             {strikes >= 3 && (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 rounded-[inherit]"
               >
                 <motion.div 
                   initial={{ scale: 0.95, y: 20 }}
                   animate={{ scale: 1, y: 0 }}
                   className="bg-white rounded-[2rem] shadow-2xl flex flex-col items-center p-8 sm:p-12 text-center max-w-lg w-full relative overflow-hidden"
                 >
                   <div className="text-red-500 mb-6">
                     <AlertTriangle size={72} strokeWidth={2} />
                   </div>
                   
                   <h2 className="text-2xl sm:text-3xl font-black text-red-600 mb-4 tracking-widest uppercase">
                     Algorithm Failed
                   </h2>
                   
                   <p className="text-slate-600 text-sm sm:text-base font-bold mb-10 leading-relaxed px-2 sm:px-6">
                     You made too many algorithmic errors. The explorer has crashed and must be reset to continue training.
                   </p>
                   
                   <button 
                     onClick={resetGame}
                     className="w-full py-4 sm:py-5 bg-[#e11d48] hover:bg-rose-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-md active:translate-y-1 transition-all uppercase tracking-widest"
                   >
                     Restart Lab
                   </button>
                 </motion.div>
               </motion.div>
             )}
           </AnimatePresence>

        </div>
      </div>
    </LabShell>
  );
}
