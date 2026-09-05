// This file is auto-generated. Do not edit directly.
"use client";
import React, { useState, useEffect } from 'react';
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import LabShell from "@/components/LabShell";
import Celebration from "@/components/Celebration";
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
    Users, Package, Cloud, AlertTriangle, Globe, Lock, ArrowRight, TrendingUp, Info, Building2, MessageSquareWarning
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

const STARTING_CASH = 100;
const OPEX = 100;
const TOTAL_ENGINEERS = 10;
const MARKET_SHOCK_QUARTER = 5;
const INTEROP_QUARTER = 9;
const MAX_QUARTERS = 12;

// --- PREMIUM ANIMATED NUMBER COMPONENT ---
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
    const spring = useSpring(value, { bounce: 0, duration: 800 });
    const display = useTransform(spring, (current) => `${prefix}${Math.round(current)}${suffix}`);
    
    useEffect(() => {
        spring.set(value);
    }, [value, spring]);
    
    return <motion.span>{display}</motion.span>;
}

export default function CloudStrategy16() {
    const { reportComplete } = useLMSBridge("cloudstrategy16");
    const { playClick, playPop, playError, playSuccess } = useLabAudio();
    
    const [quarter, setQuarter] = useState(1);
    const [cash, setCash] = useState(STARTING_CASH);
    const [cloudRecurring, setCloudRecurring] = useState(0);
    const [history, setHistory] = useState([
        { quarter: 0, Legacy: 100, Cloud: 0, Total: 100 }
    ]);
    
    // Unassigned engineers in the pool
    const [pool, setPool] = useState(TOTAL_ENGINEERS);
    // Engineers assigned this turn
    const [assignedLegacy, setAssignedLegacy] = useState(0);
    const [assignedCloud, setAssignedCloud] = useState(0);

    // Pedagogical States
    const [showIntro, setShowIntro] = useState(true);
    const [isBankrupt, setIsBankrupt] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [bankruptReason, setBankruptReason] = useState("");
    const [boardMemo, setBoardMemo] = useState<string | null>(null);

    const [showShock, setShowShock] = useState(false);
    const [showInterop, setShowInterop] = useState(false);
    const [isVictorious, setIsVictorious] = useState(false);
    
    const [marketShockActive, setMarketShockActive] = useState(false);
    const [interopMultiplier, setInteropMultiplier] = useState(1);

    // Current yields
    const legacyYieldPerEng = marketShockActive ? 5 : 12;
    const cloudYieldPerEng = 3 * interopMultiplier;

    const isGameOver = isVictorious || isBankrupt || isTimeUp;

    // Derived Financials for this turn (previews)
    const currentLegacyRevenue = assignedLegacy * legacyYieldPerEng;
    const currentCloudRevenue = cloudRecurring + (assignedCloud * cloudYieldPerEng);
    const projectedTotalRevenue = currentLegacyRevenue + currentCloudRevenue;
    const netProfit = projectedTotalRevenue - OPEX;
    const projectedCash = cash + netProfit;
    
    const legacyMultiplier = 2;
    const cloudMultiplier = 15;
    const projectedMarketCap = (currentLegacyRevenue * legacyMultiplier) + (currentCloudRevenue * cloudMultiplier);

    // Display Values (Freeze if game over)
    const lastHistory = history[history.length - 1];
    const displayCash = isGameOver ? cash : projectedCash;
    const displayProfit = isGameOver ? (lastHistory.Total - OPEX) : netProfit;
    const displayTotalRev = isGameOver ? lastHistory.Total : projectedTotalRevenue;
    const displayMarketCap = isGameOver ? ((lastHistory.Legacy * legacyMultiplier) + (lastHistory.Cloud * cloudMultiplier)) : projectedMarketCap;
    
    // Freeze individual zones
    const displayLegacyRev = isGameOver ? lastHistory.Legacy : currentLegacyRevenue;
    const displayCloudRev = isGameOver ? lastHistory.Cloud : currentCloudRevenue;

    const advanceQuarter = () => {
        if (pool > 0) {
            if (playError) playError();
            alert("Assign all engineers before advancing the quarter!");
            return;
        }
        if (playPop) playPop();

        const newLegacyRev = assignedLegacy * legacyYieldPerEng;
        const newCloudAdded = assignedCloud * cloudYieldPerEng;
        const newCloudRev = cloudRecurring + newCloudAdded;
        
        const newTotalRev = newLegacyRev + newCloudRev;
        const newCash = cash + newTotalRev - OPEX;
        const newMarketCap = (newLegacyRev * legacyMultiplier) + (newCloudRev * cloudMultiplier);

        setHistory(prev => [...prev, {
            quarter: quarter,
            Legacy: newLegacyRev,
            Cloud: newCloudRev,
            Total: newTotalRev
        }]);

        setCash(newCash);
        setCloudRecurring(newCloudRev);
        setQuarter(q => q + 1);
        
        // Smart Bankruptcy Analysis
        if (newCash < 0) {
            if (playError) playError();
            if (newLegacyRev < 40 && newCloudRev < 30) {
                setBankruptReason("You pivoted too fast! Cloud subscriptions build slowly. You must keep enough engineers on Legacy software to generate the immediate cash needed to survive the transition.");
            } else {
                setBankruptReason("You ignored the future! When the market shifted to Mobile/Cloud, our boxed sales collapsed and you had no recurring Cloud revenue to save us.");
            }
            setIsBankrupt(true);
            return; // Game Over: Do not reset engineers!
        }

        // Win Condition
        if (newMarketCap >= 1000 && !isVictorious) {
            if (playSuccess) playSuccess();
            setIsVictorious(true);
            reportComplete({ labId: "cloudstrategy16", points: 100 });
            return; // Game Over: Do not reset engineers!
        }

        // Time Limit Failure
        if (quarter >= MAX_QUARTERS) {
            if (playError) playError();
            setIsTimeUp(true);
            return; // Game Over: Do not reset engineers!
        }

        // If game continues, reset pool for next turn
        setPool(TOTAL_ENGINEERS);
        setAssignedLegacy(0);
        setAssignedCloud(0);

        // Trigger Pedagogical Events & Memos
        setBoardMemo(null); // Clear old memo
        if (quarter === 2 && newCloudRev === 0) {
            setBoardMemo("The Board is concerned about our lack of Cloud infrastructure. Competitors are moving fast.");
        } else if (quarter === 3 && newLegacyRev < 50) {
            setBoardMemo("Warning: We are burning cash rapidly. Don't forget that Legacy sales fund our future!");
        }

        if (quarter + 1 === MARKET_SHOCK_QUARTER) {
            setShowShock(true);
            setMarketShockActive(true);
        } else if (quarter + 1 === INTEROP_QUARTER) {
            setShowInterop(true);
        }
    };

    const handleAssign = (type: 'legacy' | 'cloud') => {
        if (pool > 0) {
            if (playPop) playPop();
            setPool(p => p - 1);
            if (type === 'legacy') setAssignedLegacy(l => l + 1);
            if (type === 'cloud') setAssignedCloud(c => c + 1);
        }
    };

    const handleUnassign = (type: 'legacy' | 'cloud', e: React.MouseEvent) => {
        e.stopPropagation();
        if (type === 'legacy' && assignedLegacy > 0) {
            if (playPop) playPop();
            setAssignedLegacy(l => l - 1);
            setPool(p => p + 1);
        }
        if (type === 'cloud' && assignedCloud > 0) {
            if (playPop) playPop();
            setAssignedCloud(c => c - 1);
            setPool(p => p + 1);
        }
    };

    const resetGame = () => {
        if (playClick) playClick();
        setQuarter(1);
        setCash(STARTING_CASH);
        setCloudRecurring(0);
        setHistory([{ quarter: 0, Legacy: 100, Cloud: 0, Total: 100 }]);
        setPool(TOTAL_ENGINEERS);
        setAssignedLegacy(0);
        setAssignedCloud(0);
        setIsBankrupt(false);
        setIsTimeUp(false);
        setShowShock(false);
        setShowInterop(false);
        setIsVictorious(false);
        setMarketShockActive(false);
        setInteropMultiplier(1);
        setShowIntro(true);
        setBoardMemo(null);
    };

    return (
        <LabShell labId="cloudstrategy16"
            title="Cloud Strategy Tycoon"
            instruction="Cannibalize your legacy business to survive the mobile/cloud disruption."
            compact={true}
            bgOverride="bg-slate-200"
            onReset={resetGame}
        >
            <div className="flex flex-col h-full bg-slate-50 p-2 gap-2 overflow-hidden relative rounded-xl border border-slate-300 shadow-inner">
                
                {/* Board Memo Toast */}
                <AnimatePresence>
                    {boardMemo && (
                        <motion.div 
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide max-w-[90%] text-center"
                        >
                            <MessageSquareWarning size={14} />
                            {boardMemo}
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* 1. PREMIUM HEADER METRICS (Fintech Typography) */}
                <div className="grid grid-cols-4 gap-2 shrink-0">
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-bl-lg tracking-widest border-l border-b border-red-200">DEADLINE: Y3 Q4</div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Time</span>
                        <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none mt-1">
                            Y{Math.ceil(quarter/4)} Q{((quarter-1)%4)+1}
                        </span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-center shadow-sm relative overflow-hidden">
                        <div className={`absolute bottom-0 left-0 w-full h-1 ${displayCash < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cash Reserve</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${displayProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {displayProfit >= 0 ? '+' : ''}{displayProfit}M {displayProfit >= 0 ? 'PROFIT' : 'BURN'}
                            </span>
                        </div>
                        <span className={`text-2xl font-black tracking-tighter leading-none mt-1 ${displayCash < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            <AnimatedNumber value={displayCash} prefix="$" suffix="M" />
                        </span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-center shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Rev</span>
                        <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none mt-1">
                            <AnimatedNumber value={displayTotalRev} prefix="$" suffix="M" />
                        </span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-3 flex flex-col justify-center shadow-sm relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] opacity-10">
                            <TrendingUp size={60} className="text-indigo-600" />
                        </div>
                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest relative z-10">Market Cap</span>
                        <span className="text-2xl font-black text-indigo-700 tracking-tighter leading-none mt-1 relative z-10">
                            <AnimatedNumber value={displayMarketCap} prefix="$" suffix="M" />
                        </span>
                    </div>
                </div>

                {/* 2. DYNAMIC CHART (Recharts) */}
                <div className="h-40 bg-white border border-slate-200 rounded-xl p-2 shrink-0 shadow-sm relative">
                    <div className="absolute top-2 left-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest z-10">Revenue Trend</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorLegacy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="quarter" tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                itemStyle={{fontWeight: 'bold'}}
                            />
                            <ReferenceLine y={OPEX} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'OPEX', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="Legacy" stackId="2" stroke="#94a3b8" strokeWidth={2} fill="url(#colorLegacy)" isAnimationActive={true} />
                            <Area type="monotone" dataKey="Cloud" stackId="1" stroke="#6366f1" strokeWidth={3} fill="url(#colorCloud)" isAnimationActive={true} activeDot={{r: 6, strokeWidth: 0}} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. PHYSICAL METAPHOR ARENA */}
                <div className="flex-1 flex gap-2 overflow-hidden">
                    {/* LEGACY WAREHOUSE SHELF */}
                    <div 
                        className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col p-3 relative shadow-sm hover:border-slate-400 transition-colors cursor-pointer group"
                        onClick={() => handleAssign('legacy')}
                    >
                        <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded-bl-lg tracking-widest border-l border-b border-slate-200 flex items-center gap-1 group/tooltip">
                            2x MULTIPLE
                            <Info size={10} className="text-slate-400" />
                            {/* Educational Tooltip */}
                            <div className="absolute top-full right-0 mt-1 w-48 bg-slate-800 text-white p-2 rounded-lg text-[9px] normal-case tracking-normal shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                                Boxed software is a one-time sale. Investors only value this revenue at a 2x multiple because it is unpredictable.
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${marketShockActive ? 'bg-red-50' : 'bg-slate-100'}`}>
                                <Package size={20} className={marketShockActive ? 'text-red-500' : 'text-slate-500'} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-700 leading-tight">Legacy</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Boxed Licenses</p>
                            </div>
                        </div>
                        
                        {/* The Shelf Visual */}
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-hidden mb-2 flex items-center justify-center relative" onClick={(e) => handleUnassign('legacy', e)}>
                            <div className="flex flex-wrap justify-center gap-1.5 w-full">
                                <AnimatePresence>
                                    {Array.from({ length: assignedLegacy }).map((_, i) => (
                                        <motion.div
                                            key={`leg-${i}`}
                                            initial={{ scale: 0, y: -20 }}
                                            animate={{ scale: 1, y: 0 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-200 rounded border border-slate-300 flex items-center justify-center shadow-sm group-hover:bg-slate-300 transition-colors"
                                        >
                                            <Package size={14} className="text-slate-500" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            {assignedLegacy === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">Tap to Assign</div>
                            )}
                        </div>

                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">This QTR</span>
                            <span className="text-xl font-black text-slate-700 tracking-tighter">
                                +<AnimatedNumber value={displayLegacyRev} prefix="$" suffix="M" />
                            </span>
                        </div>
                    </div>

                    {/* CLOUD SERVER RACK */}
                    <div 
                        className="flex-1 bg-white border border-indigo-100 rounded-xl flex flex-col p-3 relative shadow-sm hover:border-indigo-400 transition-colors cursor-pointer group overflow-hidden"
                        onClick={() => handleAssign('cloud')}
                    >
                        {/* Soft background glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white pointer-events-none" />
                        
                        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-1 rounded-bl-lg tracking-widest border-l border-b border-indigo-100 z-20 flex items-center gap-1 group/tooltip">
                            15x MULTIPLE
                            <Info size={10} className="text-indigo-500" />
                            {/* Educational Tooltip */}
                            <div className="absolute top-full right-0 mt-1 w-48 bg-indigo-900 text-white p-2 rounded-lg text-[9px] normal-case tracking-normal shadow-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                                Cloud is a monthly subscription. Investors value recurring, predictable revenue 15 times higher than one-off sales!
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <div className="p-2 rounded-lg bg-indigo-100">
                                <Cloud size={20} className="text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-indigo-700 leading-tight">Cloud</h3>
                                <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-wide">Subscriptions</p>
                            </div>
                        </div>
                        
                        {/* The Server Rack Visual */}
                        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 overflow-hidden mb-2 relative z-10 flex flex-col justify-end gap-1" onClick={(e) => handleUnassign('cloud', e)}>
                            <div className="flex flex-col-reverse justify-start gap-1 h-full w-full">
                                <AnimatePresence>
                                    {Array.from({ length: assignedCloud }).map((_, i) => (
                                        <motion.div
                                            key={`cld-${i}`}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 20, opacity: 0 }}
                                            className="h-3 sm:h-4 w-full bg-slate-800 rounded border border-slate-700 flex items-center px-2 justify-between group-hover:bg-slate-700 transition-colors shrink-0"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                            <div className="h-0.5 w-8 bg-slate-600 rounded-full" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            {assignedCloud === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">Tap to Assign</div>
                            )}
                        </div>

                        <div className="flex justify-between items-end relative z-10">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Recurring</span>
                            <span className="text-xl font-black text-indigo-600 tracking-tighter">
                                <AnimatedNumber value={displayCloudRev} prefix="$" suffix="M" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. COMMAND DOCK (Engineer Pool & Advance) */}
                <div className="bg-white border border-slate-200 rounded-xl p-2 shrink-0 flex gap-2 items-stretch shadow-sm z-20">
                    {/* Engineer Tokens */}
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-wrap gap-1.5 items-center justify-center relative">
                        <AnimatePresence>
                            {Array.from({ length: pool }).map((_, i) => (
                                <motion.div
                                    key={`pool-${i}`}
                                    layout
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-md"
                                >
                                    <Users size={12} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {pool === 0 && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                All Assigned
                            </span>
                        )}
                    </div>
                    
                    <button 
                        onClick={advanceQuarter}
                        disabled={pool > 0}
                        className={`px-4 rounded-lg font-black text-white flex flex-col items-center justify-center transition-all relative ${
                            pool > 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 shadow-md hover:shadow-lg active:scale-95'
                        }`}
                    >
                        <div className="absolute -top-3 right-[-4px] bg-red-100 text-red-700 text-[8px] px-1.5 py-0.5 rounded-full border border-red-200 whitespace-nowrap shadow-sm z-30">
                            -$100M OPEX
                        </div>
                        <span className="text-[10px] uppercase tracking-widest opacity-80 mb-0.5 mt-2">Advance</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* MODALS & SCAFFOLDING */}
            <AnimatePresence>
                {/* 1. ONBOARDING CEO BRIEFING */}
                {showIntro && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                <Building2 size={24} className="text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Welcome, CEO.</h2>
                            <div className="text-slate-600 text-sm mb-6 space-y-3">
                                <p>Our boxed software makes huge profits today, but the future is <strong>Cloud Subscriptions</strong>.</p>
                                <p>Cloud revenue builds slowly but is valued at a massive <strong>15x Multiple</strong> by investors.</p>
                                <p className="font-bold text-slate-800">Your Goal:</p>
                                <ul className="list-disc pl-4 text-slate-700">
                                    <li>Reassign engineers to build the Cloud.</li>
                                    <li>Don't pivot too fast, or we'll run out of cash to pay OPEX!</li>
                                    <li>Reach a $1,000M Market Cap before Year 4.</li>
                                </ul>
                            </div>
                            <button onClick={() => { if (playClick) playClick(); setShowIntro(false); }} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-md">
                                Begin Simulation
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* 2. SMART BANKRUPTCY MODAL */}
                {isBankrupt && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Bankrupt!</h2>
                            <p className="text-slate-600 text-sm mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                {bankruptReason}
                            </p>
                            <button onClick={resetGame} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-md">
                                Try Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* 3. TIME UP MODAL */}
                {isTimeUp && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                            <AlertTriangle size={48} className="mx-auto text-orange-500 mb-4" />
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">You Were Fired!</h2>
                            <p className="text-slate-600 text-sm mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                3 Years have passed and you failed to reach a $1,000M Market Cap. By milking the legacy business for too long, you allowed competitors to dominate the Cloud.
                            </p>
                            <button onClick={resetGame} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-md">
                                Try Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* 4. MARKET SHOCK EVENT */}
                {showShock && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 50}} animate={{scale: 1, y: 0}} transition={{type:"spring"}} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border-2 border-red-500">
                            <TrendingUp size={48} className="mx-auto text-red-500 mb-4 rotate-180" />
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter text-center">Market Disruption!</h2>
                            <p className="text-slate-600 text-sm mb-6 text-center">
                                The industry is rapidly shifting to Mobile and Cloud! Demand for boxed Legacy Software has collapsed. 
                                <br/><br/>
                                <strong className="text-red-600 font-black bg-red-50 p-1 rounded">Legacy Engineers now generate 60% less revenue.</strong>
                            </p>
                            <button onClick={() => { if (playClick) playClick(); setShowShock(false); }} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-400 shadow-lg transition-colors">
                                Acknowledge
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* 5. INTEROPERABILITY EVENT */}
                {showInterop && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border-2 border-indigo-500">
                            <Globe size={48} className="mx-auto text-indigo-500 mb-4" />
                            <h2 className="text-2xl font-black text-slate-800 mb-2 text-center tracking-tighter">Open the Ecosystem?</h2>
                            <p className="text-slate-600 text-sm mb-6 text-center">
                                Your cloud is growing, but it's restricted to MegaSoft devices. Competitors like Apple and Google are dominating mobile.
                                Should we partner with them and make our Cloud services available on their hardware?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => { if (playClick) playClick(); setInteropMultiplier(2); setShowInterop(false); }} 
                                    className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-400 flex items-center justify-center gap-2 transition-colors shadow-md"
                                >
                                    <Globe size={18} /> Yes, Open the Cloud (2x Growth)
                                </button>
                                <button 
                                    onClick={() => { if (playClick) playClick(); setInteropMultiplier(0.8); setShowInterop(false); }} 
                                    className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-colors border border-slate-200"
                                >
                                    <Lock size={18} /> No, Keep it Walled (Slower Growth)
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Celebration
                isActive={isVictorious}
                message="Incredible! You survived the Valley of Death, cannibalized your legacy business, and successfully transformed MegaSoft into a Cloud computing juggernaut!"
                onReplay={resetGame}
            />
        </LabShell>
    );
}
