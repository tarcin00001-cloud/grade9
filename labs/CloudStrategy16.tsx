"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Building2, Cloud, DollarSign, TrendingDown, TrendingUp, AlertTriangle, PlayCircle, Clock, Smartphone, Gamepad2, HardDrive
} from "lucide-react";

// The 6 Market Events (20 seconds each)
const EVENTS = [
  { id: 1, title: "The Old Ways", desc: "Legacy software is selling well. Cloud is unproven.", 
    rates: { legacy: 20000, azure: -5000, mobile: 0, xbox: -5000 } },
  { id: 2, title: "The Mobile Boom!", desc: "Smartphones explode in popularity! Everyone wants mobile apps.", 
    rates: { legacy: 5000, azure: 0, mobile: 25000, xbox: 0 } },
  { id: 3, title: "Cloud Shift", desc: "Enterprises start moving data to the Cloud. Legacy sales plunge.", 
    rates: { legacy: -5000, azure: 25000, mobile: 5000, xbox: 0 } },
  { id: 4, title: "Xbox Craze", desc: "A new console generation launches! Gamers want cloud streaming.", 
    rates: { legacy: -10000, azure: 10000, mobile: 0, xbox: 30000 } },
  { id: 5, title: "The Open Source Wars", desc: "Developers abandon closed systems. We must scale Azure globally.", 
    rates: { legacy: -15000, azure: 30000, mobile: 5000, xbox: -5000 } },
  { id: 6, title: "Cloud Dominance", desc: "The final push. Azure is printing money. Legacy is dead.", 
    rates: { legacy: -20000, azure: 40000, mobile: 10000, xbox: 0 } },
];

const TOTAL_TIME_MS = 120000;
const EVENT_DUR_MS = 20000;
const TICK_MS = 100; // UI refresh rate
const BURN_RATE_PER_SEC = 1000000; // $1M burn rate per sec
const START_CAP = 10000000; // $10M

type Sector = 'legacy' | 'azure' | 'mobile' | 'xbox';

export default function CloudStrategy16() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();

  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_MS);
  const [marketCap, setMarketCap] = useState(START_CAP);
  
  const [teams, setTeams] = useState<Record<Sector, number>>({ legacy: 100, azure: 0, mobile: 0, xbox: 0 });
  const [unallocated, setUnallocated] = useState(0);
  
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // History for Chart (recorded every 1 second)
  const [history, setHistory] = useState<{t: number, cap: number}[]>([{ t: TOTAL_TIME_MS, cap: START_CAP }]);

  const eventIndex = Math.min(5, Math.floor((TOTAL_TIME_MS - timeLeft) / EVENT_DUR_MS));
  const currentEvent = EVENTS[eventIndex];

  // Current Net Flow per second
  const revPerSec = 
    (teams.legacy * currentEvent.rates.legacy) +
    (teams.azure * currentEvent.rates.azure) +
    (teams.mobile * currentEvent.rates.mobile) +
    (teams.xbox * currentEvent.rates.xbox);
  const netFlowPerSec = revPerSec - BURN_RATE_PER_SEC;
  
  // Refs to avoid stale closures in setInterval
  const stateRef = useRef({ timeLeft, marketCap, isPlaying, gameOver, win, netFlowPerSec });
  useEffect(() => {
    stateRef.current = { timeLeft, marketCap, isPlaying, gameOver, win, netFlowPerSec };
  }, [timeLeft, marketCap, isPlaying, gameOver, win, netFlowPerSec]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && !gameOver && !win) {
      timerRef.current = setInterval(() => {
        const { timeLeft: t, marketCap: cap, netFlowPerSec: flow, isPlaying: playing } = stateRef.current;
        
        if (!playing) return;

        const newTime = t - TICK_MS;
        const newCap = cap + (flow * (TICK_MS / 1000));

        if (newTime <= 0) {
          // Game over win
          setMarketCap(newCap);
          setTimeLeft(0);
          setIsPlaying(false);
          setHistory(prev => [...prev, { t: 0, cap: newCap }]);
          if (newCap > 0) {
            setWin(true);
            if (playSuccess) playSuccess();
          } else {
            setGameOver(true);
            if (playError) playError();
          }
        } else if (newCap <= 0) {
          // Bankrupt early
          setMarketCap(0);
          setTimeLeft(newTime);
          setIsPlaying(false);
          setGameOver(true);
          setHistory(prev => [...prev, { t: newTime, cap: 0 }]);
          if (playError) playError();
        } else {
          setTimeLeft(newTime);
          setMarketCap(newCap);
          // record history every second (t % 1000 === 0)
          if (newTime % 1000 === 0) {
            setHistory(prev => [...prev, { t: newTime, cap: newCap }]);
          }
        }

      }, TICK_MS);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameOver, win]);

  const adjustTeams = (sector: Sector, amount: number) => {
    if (!isPlaying) return;
    
    setTeams(prev => {
      const current = prev[sector];
      const newAmount = current + amount;
      
      if (amount > 0) {
        // trying to add
        if (unallocated >= amount) {
          setUnallocated(u => u - amount);
          return { ...prev, [sector]: newAmount };
        }
      } else {
        // trying to subtract
        if (current >= Math.abs(amount)) {
          setUnallocated(u => u + Math.abs(amount));
          return { ...prev, [sector]: newAmount };
        }
      }
      return prev;
    });
    if (playClick) playClick();
  };

  const startGame = () => {
    if (playClick) playClick();
    setIsPlaying(true);
  };

  const resetGame = () => {
    setTimeLeft(TOTAL_TIME_MS);
    setMarketCap(START_CAP);
    setTeams({ legacy: 100, azure: 0, mobile: 0, xbox: 0 });
    setUnallocated(0);
    setHistory([{ t: TOTAL_TIME_MS, cap: START_CAP }]);
    setGameOver(false);
    setWin(false);
    setIsPlaying(false);
    if (playPop) playPop();
  };

  // SVG Chart Generator
  const renderChartLine = () => {
    if (history.length === 0) return null;
    const maxVal = Math.max(...history.map(h => h.cap), START_CAP) * 1.1; 
    
    let path = `M 0 ${100 - (history[0].cap / maxVal) * 100} `;
    for (let i = 1; i < history.length; i++) {
      const x = ((TOTAL_TIME_MS - history[i].t) / TOTAL_TIME_MS) * 100;
      const y = 100 - (Math.max(0, history[i].cap) / maxVal) * 100;
      path += `L ${x} ${y} `;
    }
    
    // Add current live point
    const currX = ((TOTAL_TIME_MS - timeLeft) / TOTAL_TIME_MS) * 100;
    const currY = 100 - (Math.max(0, marketCap) / maxVal) * 100;
    path += `L ${currX} ${currY} `;

    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 overflow-visible">
        <path d={path} fill="none" stroke="#34d399" strokeWidth="2.5" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0px 0px 4px rgba(52,211,153,0.5))' }} />
        <circle cx={currX} cy={currY} r="2" fill="#fff" style={{ filter: 'drop-shadow(0px 0px 5px rgba(255,255,255,1))' }} />
      </svg>
    );
  };

  return (
    <LabShell
      labId="cloudstrategy16"
      title="Cloud Strategy Tycoon"
      subtitle="Real-Time Resource Allocator"
      theme="studio"
      compact={true}
      onReset={resetGame}
      instruction="1. Analyze the corporate tech pivot scenario and available budget. 2. Make strategic decisions to allocate resources between on-premise and cloud infrastructure. 3. Monitor the company's performance, scalability, and costs over the simulated quarters. 4. Adjust your strategy to maximize profit and ensure system reliability."
    >
      <Celebration isActive={win} onReplay={resetGame} message="You successfully shifted engineers to capture market trends and kept the company profitable!" />

      <div className="flex flex-col h-full w-full max-w-5xl mx-auto gap-3 p-2">
        
        {/* Top Dashboard */}
        <div className="bg-white rounded-xl p-3 border-2 border-slate-400/50 shadow-lg flex justify-between items-center relative overflow-hidden">
          
          <div className="flex items-center gap-6 z-10">
            <div>
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Time Left</div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {(timeLeft / 1000).toFixed(1)}s
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-700"></div>
            
            <div>
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Market Cap</div>
              <div className={`text-2xl font-black flex items-center gap-1 font-mono ${marketCap < 5000000 ? 'text-red-600 animate-pulse' : 'text-emerald-700'}`}>
                <DollarSign size={20} /> {(marketCap / 1000000).toFixed(2)}M
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-700"></div>

            <div>
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Net Cash Flow</div>
              <div className={`text-lg font-black flex items-center gap-1 font-mono ${netFlowPerSec < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {netFlowPerSec < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                {netFlowPerSec < 0 ? '-' : '+'}${(Math.abs(netFlowPerSec) / 1000).toFixed(0)}k/s
              </div>
            </div>
          </div>

          <div className="z-10 flex gap-2">
            {!isPlaying && !gameOver && !win && (
              <button onClick={startGame} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <PlayCircle size={18} /> {timeLeft < TOTAL_TIME_MS ? "Resume" : "Start Simulation"}
              </button>
            )}
            {(gameOver || win) && (
              <button onClick={resetGame} className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold px-6 py-2 rounded-lg transition-colors">
                Play Again
              </button>
            )}
          </div>
        </div>

        {/* Middle: The Financial Chart & Market News */}
        <div className="flex-[0.6] flex gap-3 min-h-0">
          
          <div className="flex-1 bg-white rounded-xl border-2 border-slate-400/50 shadow-inner p-4 flex flex-col relative overflow-hidden">
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 z-10 opacity-50">Market Cap Trajectory</h2>
            <div className="flex-1 relative mx-4 mb-2 border-l border-b border-slate-400">
              {[0, 25, 50, 75, 100].map(pct => (
                <div key={pct} className="absolute w-full border-t border-slate-400/50" style={{ top: `${pct}%` }}></div>
              ))}
              <div className="absolute inset-0">
                {renderChartLine()}
              </div>
            </div>
          </div>

          <div className="w-[300px] bg-white rounded-xl border-2 border-slate-400/50 shadow-lg p-4 flex flex-col">
            <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">Live Market News</h2>
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentEvent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center"
              >
                <div className="text-sm font-bold text-sky-700 bg-sky-200 px-2 py-1 rounded inline-block w-fit mb-2 border border-sky-300">Alert #{currentEvent.id}</div>
                <div className="text-xl font-black text-slate-900 mb-2 leading-tight">{currentEvent.title}</div>
                <div className="text-xs text-slate-800">{currentEvent.desc}</div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-auto pt-2 border-t border-slate-400 text-[10px] text-slate-700 font-mono">
              Next trend in {((EVENT_DUR_MS - (TOTAL_TIME_MS - timeLeft) % EVENT_DUR_MS) / 1000).toFixed(0)}s
            </div>
          </div>
          
        </div>

        {/* Bottom: Resource Allocator */}
        <div className="flex-1 bg-white rounded-xl border-2 border-slate-400/50 shadow-lg p-4 flex flex-col min-h-0">
          
          <div className="flex justify-between items-end mb-4 border-b border-slate-400 pb-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="text-sky-700"/> Engineering Allocation
              </h2>
              <p className="text-[11px] text-slate-700">Shift your 100 teams between divisions to capture market trends.</p>
            </div>
            <div className="bg-white border border-slate-400 px-4 py-2 rounded-lg text-center shadow-inner">
              <div className="text-[9px] font-bold text-slate-700 uppercase">Unallocated Teams</div>
              <div className={`text-2xl font-black font-mono ${unallocated > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-700'}`}>{unallocated}</div>
            </div>
          </div>

          <div className="flex-1 flex gap-4">
            
            {/* Legacy Box */}
            <div className="flex-1 bg-white rounded-xl border border-slate-400 p-3 flex flex-col items-center text-center relative overflow-hidden">
              <HardDrive size={24} className="text-slate-700 mb-1" />
              <div className="text-xs font-bold text-slate-800 uppercase">Legacy PC</div>
              <div className={`text-[10px] font-mono mt-1 ${currentEvent.rates.legacy > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {currentEvent.rates.legacy > 0 ? '+' : '-'}${Math.abs(currentEvent.rates.legacy / 1000)}k/sec per team
              </div>
              <div className="flex-1 w-full flex items-center justify-center">
                <div className="text-4xl font-black font-mono text-slate-900">{teams.legacy}</div>
              </div>
              <div className="flex gap-2 w-full">
                <button onClick={() => adjustTeams('legacy', -10)} disabled={teams.legacy < 10 || !isPlaying} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 py-2 rounded font-black text-red-600">-10</button>
                <button onClick={() => adjustTeams('legacy', 10)} disabled={unallocated < 10 || !isPlaying} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 py-2 rounded font-black text-emerald-700">+10</button>
              </div>
            </div>

            {/* Azure Box */}
            <div className="flex-1 bg-white rounded-xl border border-slate-400 p-3 flex flex-col items-center text-center relative overflow-hidden">
              <Cloud size={24} className="text-sky-700 mb-1" />
              <div className="text-xs font-bold text-sky-700 uppercase">Azure Cloud</div>
              <div className={`text-[10px] font-mono mt-1 ${currentEvent.rates.azure > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {currentEvent.rates.azure > 0 ? '+' : '-'}${Math.abs(currentEvent.rates.azure / 1000)}k/sec per team
              </div>
              <div className="flex-1 w-full flex items-center justify-center">
                <div className="text-4xl font-black font-mono text-sky-700">{teams.azure}</div>
              </div>
              <div className="flex gap-2 w-full">
                <button onClick={() => adjustTeams('azure', -10)} disabled={teams.azure < 10 || !isPlaying} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 py-2 rounded font-black text-red-600">-10</button>
                <button onClick={() => adjustTeams('azure', 10)} disabled={unallocated < 10 || !isPlaying} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 py-2 rounded font-black text-emerald-700">+10</button>
              </div>
            </div>

            {/* Mobile Box */}
            <div className="flex-1 bg-white rounded-xl border border-slate-400 p-3 flex flex-col items-center text-center relative overflow-hidden">
              <Smartphone size={24} className="text-fuchsia-700 mb-1" />
              <div className="text-xs font-bold text-fuchsia-700 uppercase">Mobile Apps</div>
              <div className={`text-[10px] font-mono mt-1 ${currentEvent.rates.mobile > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {currentEvent.rates.mobile > 0 ? '+' : '-'}${Math.abs(currentEvent.rates.mobile / 1000)}k/sec per team
              </div>
              <div className="flex-1 w-full flex items-center justify-center">
                <div className="text-4xl font-black font-mono text-fuchsia-700">{teams.mobile}</div>
              </div>
              <div className="flex gap-2 w-full">
                <button onClick={() => adjustTeams('mobile', -10)} disabled={teams.mobile < 10 || !isPlaying} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 py-2 rounded font-black text-red-600">-10</button>
                <button onClick={() => adjustTeams('mobile', 10)} disabled={unallocated < 10 || !isPlaying} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 py-2 rounded font-black text-emerald-700">+10</button>
              </div>
            </div>

            {/* Xbox Box */}
            <div className="flex-1 bg-white rounded-xl border border-slate-400 p-3 flex flex-col items-center text-center relative overflow-hidden">
              <Gamepad2 size={24} className="text-emerald-700 mb-1" />
              <div className="text-xs font-bold text-emerald-700 uppercase">Xbox Cloud</div>
              <div className={`text-[10px] font-mono mt-1 ${currentEvent.rates.xbox > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {currentEvent.rates.xbox > 0 ? '+' : '-'}${Math.abs(currentEvent.rates.xbox / 1000)}k/sec per team
              </div>
              <div className="flex-1 w-full flex items-center justify-center">
                <div className="text-4xl font-black font-mono text-emerald-700">{teams.xbox}</div>
              </div>
              <div className="flex gap-2 w-full">
                <button onClick={() => adjustTeams('xbox', -10)} disabled={teams.xbox < 10 || !isPlaying} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 py-2 rounded font-black text-red-600">-10</button>
                <button onClick={() => adjustTeams('xbox', 10)} disabled={unallocated < 10 || !isPlaying} className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 py-2 rounded font-black text-emerald-700">+10</button>
              </div>
            </div>

          </div>

        </div>

        {/* Game Over / Win Overlays */}
        <AnimatePresence>
          {gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <AlertTriangle size={64} className="text-red-500 mb-4" />
              <h2 className="text-4xl font-black text-red-100 uppercase tracking-widest mb-2">Bankrupt!</h2>
              <p className="text-red-300 font-bold mb-6 text-center max-w-md">You failed to allocate resources quickly enough and your market cap hit zero.</p>
              <div className="flex gap-4">
                <button onClick={resetGame} className="bg-red-600 hover:bg-red-500 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg">Try Again</button>
                <Link href="/labs" className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg text-center flex items-center justify-center">All Labs</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LabShell>
  );
}
