"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLMSBridge } from '@/hooks/useLMSBridge';
import LabShell from '@/components/LabShell';
import Celebration from '@/components/Celebration';
import { 
    Database, ShieldAlert, Terminal, AlertTriangle, ShieldX, ServerCrash
} from 'lucide-react';

type Operator = 'UNION' | 'INTERSECT' | 'DIFFERENCE' | 'SYM_DIFF' | 'COMPLEMENT_A' | 'COMPLEMENT_B';

interface Employee {
    id: string;
    name: string;
    region: 'A' | 'B' | 'AB' | 'U';
    x: number;
    y: number;
}

const EMPLOYEES: Employee[] = [
    { id: '1', name: "Alice", region: 'A', x: 60, y: 80 },
    { id: '2', name: "Bob", region: 'A', x: 75, y: 130 },
    { id: '3', name: "Charlie", region: 'AB', x: 150, y: 70 },
    { id: '4', name: "David", region: 'AB', x: 150, y: 130 },
    { id: '5', name: "Eve", region: 'B', x: 240, y: 80 },
    { id: '6', name: "Frank", region: 'B', x: 225, y: 130 },
    { id: '7', name: "Grace", region: 'B', x: 195, y: 100 },
    { id: '8', name: "Henry", region: 'U', x: 30, y: 170 },
    { id: '9', name: "Ivy", region: 'U', x: 270, y: 30 }
];

const BASE_MISSIONS = [
    {
        title: "The Broad Search",
        instruction: "Send a memo to everyone involved in the project. Find all employees who are Admins OR Engineers.",
        targetOperator: 'UNION'
    },
    {
        title: "Strict Access",
        instruction: "We need to verify dual-access permissions. Find all employees who are Admins AND Engineers.",
        targetOperator: 'INTERSECT'
    },
    {
        title: "Revocation List",
        instruction: "Find all Admins who are NOT Engineers so we can audit their access levels.",
        targetOperator: 'DIFFERENCE'
    },
    {
        title: "The Mismatch Audit",
        instruction: "Find everyone who is in exactly ONE group, but not both, to check for mismatched permissions.",
        targetOperator: 'SYM_DIFF'
    },
    {
        title: "Admin Sweep",
        instruction: "We suspect an admin account is compromised. Find everyone in the entire database who is NOT an Admin.",
        targetOperator: 'COMPLEMENT_A'
    },
    {
        title: "Engineering Sweep",
        instruction: "Find everyone in the database who is NOT an Engineer.",
        targetOperator: 'COMPLEMENT_B'
    }
];

const CHIPS = [
    { id: 'UNION', symbol: '∪', label: 'UNION' },
    { id: 'INTERSECT', symbol: '∩', label: 'INTERSECT' },
    { id: 'DIFFERENCE', symbol: '−', label: 'DIFFERENCE' },
    { id: 'SYM_DIFF', symbol: 'Δ', label: 'SYM DIFF' },
    { id: 'COMPLEMENT_A', symbol: "A'", label: 'NOT A' },
    { id: 'COMPLEMENT_B', symbol: "B'", label: 'NOT B' }
];

export default function SetsAndVenn27() {
    const { reportComplete } = useLMSBridge();

    const [missions, setMissions] = useState(BASE_MISSIONS);
    const [isMounted, setIsMounted] = useState(false);
    const [missionIndex, setMissionIndex] = useState(0);
    const [activeOperator, setActiveOperator] = useState<Operator | null>(null);
    const [showFailureModal, setShowFailureModal] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
    const [showGameOver, setShowGameOver] = useState(false);
    const [strikes, setStrikes] = useState(0);
    const [isVictorious, setIsVictorious] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    React.useEffect(() => {
        shuffleMissions();
        setIsMounted(true);
    }, []);

    const shuffleMissions = () => {
        const arr = [...BASE_MISSIONS];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setMissions(arr);
    };

    const currentMission = missions[missionIndex];

    const handleDragEnd = (event: any, info: any, op: Operator) => {
        if (!isMounted || isAnimating || showFailureModal.show || showGameOver || activeOperator) return;

        const dropZone = document.getElementById('query-slot');
        if (dropZone) {
            const rect = dropZone.getBoundingClientRect();
            // Expanded hit area for better UX
            if (info.point.x > rect.left - 50 && info.point.x < rect.right + 50 && 
                info.point.y > rect.top - 50 && info.point.y < rect.bottom + 50) {
                
                executeOperator(op);
            }
        }
    };

    const executeOperator = (op: Operator) => {
        setActiveOperator(op);
        setIsAnimating(true);

        if (op === currentMission.targetOperator) {
            // SUCCESS
            setTimeout(() => {
                setIsAnimating(false);
                if (missionIndex < missions.length - 1) {
                    setActiveOperator(null);
                    setMissionIndex(m => m + 1);
                } else {
                    setIsVictorious(true);
                    reportComplete({ labId: 'setsandvenn27', points: 100 });
                }
            }, 3500); // Give them time to see the success animation
        } else {
            // FAIL - Wait 1.0s before showing modal so they see the wrong regions light up
            const newStrikes = strikes + 1;
            setStrikes(newStrikes);
            
            setTimeout(() => {
                setIsAnimating(false);
                if (newStrikes >= 3) {
                    setShowGameOver(true);
                } else {
                    setShowFailureModal({
                        show: true,
                        msg: getFailureMessage(op)
                    });
                }
            }, 1000);
        }
    };

    const getFailureMessage = (used: Operator) => {
        if (used === 'UNION') return "UNION (A ∪ B) selects everyone in A, B, or both. That's too broad for this query.";
        if (used === 'INTERSECT') return "INTERSECT (A ∩ B) only selects people in BOTH groups. You missed people we needed.";
        if (used === 'DIFFERENCE') return "DIFFERENCE (A − B) subtracts Engineers from Admins. Look closely at the requirements.";
        if (used === 'SYM_DIFF') return "SYMMETRIC DIFFERENCE (A Δ B) selects people in exactly one group, ignoring the overlap.";
        if (used === 'COMPLEMENT_A') return "COMPLEMENT A (A') selects everything OUTSIDE of Set A. You selected the wrong group.";
        if (used === 'COMPLEMENT_B') return "COMPLEMENT B (B') selects everything OUTSIDE of Set B. You selected the wrong group.";
        return "Incorrect operator.";
    };

    const getSqlTranslation = (op: Operator | null) => {
        switch(op) {
            case 'UNION': return "SELECT * FROM Admins a\nFULL OUTER JOIN Engineers e\nON a.id = e.id;";
            case 'INTERSECT': return "SELECT * FROM Admins a\nINNER JOIN Engineers e\nON a.id = e.id;";
            case 'DIFFERENCE': return "SELECT * FROM Admins a\nLEFT JOIN Engineers e ON a.id = e.id\nWHERE e.id IS NULL;";
            case 'SYM_DIFF': return "SELECT * FROM Admins a\nFULL OUTER JOIN Engineers e ON a.id = e.id\nWHERE a.id IS NULL OR e.id IS NULL;";
            case 'COMPLEMENT_A': return "SELECT * FROM Database\nWHERE is_admin = false;";
            case 'COMPLEMENT_B': return "SELECT * FROM Database\nWHERE is_engineer = false;";
            default: return "-- Awaiting visual query --";
        }
    };

    const isRegionActive = (region: 'A' | 'B' | 'AB' | 'U') => {
        if (!activeOperator) return true; // Default state: all dim
        switch(activeOperator) {
            case 'UNION': return region === 'A' || region === 'B' || region === 'AB';
            case 'INTERSECT': return region === 'AB';
            case 'DIFFERENCE': return region === 'A'; // A - B
            case 'SYM_DIFF': return region === 'A' || region === 'B';
            case 'COMPLEMENT_A': return region === 'B' || region === 'U';
            case 'COMPLEMENT_B': return region === 'A' || region === 'U';
            default: return false;
        }
    };

    // Path data for overlapping circles in a 300x200 SVG box
    const SVG_PATHS = {
        LeftCrescent: "M 150 37.5 A 80 80 0 1 0 150 162.5 A 80 80 0 0 1 150 37.5 Z",
        RightCrescent: "M 150 37.5 A 80 80 0 0 0 150 162.5 A 80 80 0 1 0 150 37.5 Z",
        Lens: "M 150 37.5 A 80 80 0 0 1 150 162.5 A 80 80 0 0 1 150 37.5 Z"
    };

    const opSuccess = activeOperator === currentMission.targetOperator;

    const renderSvgAvatar = (emp: Employee) => {
        const isActive = isRegionActive(emp.region);
        
        let fillColor = "#f1f5f9"; // slate-100
        let strokeColor = "#94a3b8"; // slate-400
        let textColor = "#475569"; // slate-600

        if (emp.region === 'A') { fillColor = "#e0e7ff"; strokeColor = "#818cf8"; textColor = "#4338ca"; }
        if (emp.region === 'B') { fillColor = "#d1fae5"; strokeColor = "#34d399"; textColor = "#047857"; }
        if (emp.region === 'AB') { fillColor = "#cffafe"; strokeColor = "#22d3ee"; textColor = "#0e7490"; }

        return (
            <motion.g
                key={emp.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                    opacity: activeOperator ? (isActive ? 1 : 0.1) : 0.9,
                    scale: activeOperator && isActive ? [1, 1.2, 1] : 1,
                }}
                transition={{ 
                    duration: 0.5, 
                    bounce: 0.5,
                    scale: { repeat: activeOperator && isActive && opSuccess ? Infinity : 0, duration: 1 } 
                }}
                style={{ transformOrigin: `${emp.x}px ${emp.y}px` }} // Crucial for scaling in SVG
            >
                <circle cx={emp.x} cy={emp.y} r="10" fill={fillColor} stroke={strokeColor} strokeWidth="2" style={{ filter: activeOperator && isActive ? 'drop-shadow(0px 0px 4px rgba(255,255,255,0.8))' : 'none' }} />
                <text x={emp.x} y={emp.y + 3} textAnchor="middle" fontSize="8" fontWeight="900" fill={textColor} style={{ pointerEvents: 'none' }}>
                    {emp.name.substring(0,2).toUpperCase()}
                </text>
            </motion.g>
        );
    };

    const handleReset = () => {
        shuffleMissions();
        setMissionIndex(0);
        setActiveOperator(null);
        setShowFailureModal({show: false, msg: ''});
        setShowGameOver(false);
        setStrikes(0);
        setIsVictorious(false);
    };

    return (
        <LabShell
            labId="setsandvenn27"
            title="Sets & Venn Diagrams"
            instruction="Drag the correct Set Operator chip into the query slot to filter the database."
            compact={true}
            bgOverride="bg-slate-200"
            onReset={handleReset}
        >
            <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
                
                {/* HUD: MISSION & CODE TRANSLATION */}
                <div className="flex flex-col md:flex-row border-b-4 border-slate-900 bg-white shrink-0 z-20">
                    <div className="flex-[1.5] p-4 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <ShieldAlert size={16} />
                            <h2 className="text-[10px] font-black uppercase tracking-widest">
                                {isMounted ? `Mission ${missionIndex + 1}: ${currentMission.title}` : "Loading..."}
                            </h2>
                        </div>
                        <p className="text-sm font-bold text-slate-700 leading-tight">
                            {isMounted ? currentMission.instruction : ""}
                        </p>
                    </div>
                    
                    {/* STRIKES HUD */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-100 border-b md:border-b-0 md:border-r border-slate-200 shrink-0">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">System Health</div>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <ShieldX key={i} size={20} className={i <= (3 - strikes) ? 'text-emerald-500' : 'text-rose-300 opacity-30'} />
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-900 p-4 font-mono text-xs text-emerald-400 relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-slate-600"><Terminal size={14} /></div>
                        <div className="text-[9px] text-slate-500 mb-1 uppercase tracking-widest font-sans font-bold">Live SQL Translation</div>
                        <pre className="whitespace-pre-wrap leading-relaxed">
                            {getSqlTranslation(activeOperator)}
                        </pre>
                    </div>
                </div>

                {/* THE ARENA: VENN DIAGRAM + DATA TABLES */}
                <div className={`flex-1 min-h-0 relative flex flex-row items-center justify-center p-2 sm:p-4 gap-4 transition-colors duration-500 ${activeOperator && !opSuccess && showFailureModal.show ? 'bg-rose-50 border-4 border-rose-500' : 'bg-slate-100 border-4 border-transparent'}`}>
                    <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-slate-200 opacity-30 pointer-events-none" />
                    
                    {/* Left Table: Set A (Desktop Only) */}
                    <div className="hidden lg:flex flex-col w-48 z-10 shrink-0 h-full max-h-[300px] bg-white border-2 border-indigo-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-indigo-50 border-b border-indigo-100 p-2 text-center shrink-0">
                            <div className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Set A: Admins</div>
                        </div>
                        <div className="p-2 flex flex-col gap-1 overflow-y-auto">
                            {EMPLOYEES.filter(e => e.region.includes('A')).map(emp => (
                                <div key={emp.id} className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-slate-100">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[8px] flex items-center justify-center shrink-0">{emp.name.substring(0,2).toUpperCase()}</div>
                                    <div className="text-[10px] font-bold text-slate-700">{emp.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BOMBPROOF SVG WRAPPER */}
                    <div className="relative w-full h-full max-w-[800px] flex items-center justify-center pointer-events-none mx-auto">
                        <svg viewBox="0 0 300 200" className="w-full h-full object-contain drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            
                            {/* Left Crescent (Set A - B) */}
                            <path 
                                d={SVG_PATHS.LeftCrescent} 
                                className="transition-all duration-700"
                                fill={isRegionActive('A') ? "rgba(99, 102, 241, 0.4)" : "rgba(203, 213, 225, 0.2)"}
                                stroke={isRegionActive('A') ? "#6366f1" : "#cbd5e1"}
                                strokeWidth={isRegionActive('A') ? "2" : "1"}
                                style={activeOperator && isRegionActive('A') ? { filter: 'url(#glow)' } : {}}
                            />
                            
                            {/* Right Crescent (Set B - A) */}
                            <path 
                                d={SVG_PATHS.RightCrescent} 
                                className="transition-all duration-700"
                                fill={isRegionActive('B') ? "rgba(16, 185, 129, 0.4)" : "rgba(203, 213, 225, 0.2)"}
                                stroke={isRegionActive('B') ? "#10b981" : "#cbd5e1"}
                                strokeWidth={isRegionActive('B') ? "2" : "1"}
                                style={activeOperator && isRegionActive('B') ? { filter: 'url(#glow)' } : {}}
                            />
                            
                            {/* Center Lens (A intersect B) */}
                            <path 
                                d={SVG_PATHS.Lens} 
                                className="transition-all duration-700"
                                fill={isRegionActive('AB') ? "rgba(34, 211, 238, 0.6)" : "rgba(148, 163, 184, 0.2)"}
                                stroke={isRegionActive('AB') ? "#67e8f9" : "#94a3b8"}
                                strokeWidth={isRegionActive('AB') ? "2" : "1"}
                                style={activeOperator && isRegionActive('AB') ? { filter: 'url(#glow)' } : {}}
                            />

                            {/* SVG Text Labels */}
                            <text x="100" y="10" fontSize="10" fontWeight="900" fill="#3730a3" textAnchor="middle">SET A</text>
                            <text x="100" y="20" fontSize="6" fontWeight="bold" letterSpacing="1" fill="#4f46e5" textAnchor="middle">ADMINS</text>
                            
                            <text x="200" y="10" fontSize="10" fontWeight="900" fill="#065f46" textAnchor="middle">SET B</text>
                            <text x="200" y="20" fontSize="6" fontWeight="bold" letterSpacing="1" fill="#059669" textAnchor="middle">ENGINEERS</text>
                            
                            <text x="150" y="195" fontSize="8" fontWeight="900" fill="#64748b" textAnchor="middle">UNIVERSAL SET (U)</text>

                            {/* Avatars natively embedded in SVG for exact positioning */}
                            {EMPLOYEES.map(emp => renderSvgAvatar(emp))}
                        </svg>
                    </div>

                    {/* Right Table: Set B (Desktop Only) */}
                    <div className="hidden lg:flex flex-col w-48 z-10 shrink-0 h-full max-h-[300px] bg-white border-2 border-emerald-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-emerald-50 border-b border-emerald-100 p-2 text-center shrink-0">
                            <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Set B: Engineers</div>
                        </div>
                        <div className="p-2 flex flex-col gap-1 overflow-y-auto">
                            {EMPLOYEES.filter(e => e.region.includes('B')).map(emp => (
                                <div key={emp.id} className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-slate-100">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[8px] flex items-center justify-center shrink-0">{emp.name.substring(0,2).toUpperCase()}</div>
                                    <div className="text-[10px] font-bold text-slate-700">{emp.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BOTTOM DECK: QUERY BUILDER */}
                <div className="bg-slate-900 border-t-4 border-slate-950 p-4 shrink-0 shadow-2xl relative z-30">
                    <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        
                        {/* Operator Chips Dock */}
                        <div className="flex gap-3">
                            {CHIPS.map((op) => (
                                <motion.div
                                    key={op.id}
                                    drag={!activeOperator}
                                    dragSnapToOrigin={true}
                                    onDragEnd={(e, info) => handleDragEnd(e, info, op.id as Operator)}
                                    whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
                                    className={`relative w-16 h-16 md:w-20 md:h-20 bg-slate-800 border-2 border-slate-700 rounded-xl flex flex-col items-center justify-center shadow-lg cursor-grab
                                        ${activeOperator === op.id ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-700 hover:border-slate-500'}`}
                                >
                                    <span className="text-2xl md:text-3xl font-black text-white">{op.symbol}</span>
                                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{op.label}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Query Slot */}
                        <div className="flex-1 w-full flex items-center justify-center md:justify-end gap-4 bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner">
                            <div className="font-black text-slate-600 text-xl">A</div>
                            <div 
                                id="query-slot"
                                className={`w-20 h-20 border-4 border-dashed rounded-xl flex items-center justify-center transition-colors
                                    ${activeOperator ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-700 bg-slate-900'}`}
                            >
                                {activeOperator ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                        <span className="text-3xl font-black text-emerald-400">
                                            {CHIPS.find(c => c.id === activeOperator)?.symbol}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <span className="text-[9px] font-bold text-slate-600 uppercase text-center leading-tight">Drop<br/>Operator</span>
                                )}
                            </div>
                            <div className="font-black text-slate-600 text-xl">B</div>
                        </div>

                    </div>
                </div>
            </div>

            {/* FAILURE MODAL */}
            <AnimatePresence>
                {showFailureModal.show && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl border-4 border-rose-500">
                            <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4" />
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Query Failed</h2>
                            <p className="text-slate-600 text-sm mb-6 bg-rose-50 p-3 rounded-lg border border-rose-200 text-left leading-relaxed">
                                {showFailureModal.msg}
                            </p>
                            <button 
                                onClick={() => {
                                    setShowFailureModal({show: false, msg: ''});
                                    setActiveOperator(null);
                                }} 
                                className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-lg"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* GAME OVER MODAL (3 STRIKES) */}
                {showGameOver && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-slate-900 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border-4 border-rose-600">
                            <ServerCrash size={64} className="mx-auto text-rose-500 mb-6 animate-bounce" />
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">SYSTEM LOCKED</h2>
                            <p className="text-rose-200 text-sm mb-8 leading-relaxed">
                                You triggered too many incorrect security queries. The database has locked you out.
                            </p>
                            <button 
                                onClick={handleReset} 
                                className="w-full bg-rose-600 text-white font-black py-4 rounded-xl hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/50 uppercase tracking-widest"
                            >
                                Reboot System
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Celebration
                isActive={isVictorious}
                message="Set Theory Mastered! You just used mathematical sets to construct real database queries and resolve complex security audits. Georg Cantor would be proud!"
                onReplay={handleReset}
            />
        </LabShell>
    );
}
