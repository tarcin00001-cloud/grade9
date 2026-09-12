"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Timer, Rewind, FastForward, ShieldAlert, Trash2, History, Banknote, ShieldCheck, Plus, AlertTriangle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type EventType = "ACCOUNT_OPENED" | "DEPOSIT" | "WITHDRAWAL" | "SYSTEM_GLITCH" | "REFUND";
type Phase = "STEP1_BUY" | "STEP2_TRAP" | "STEP3_FIX" | "COMPLETE";

interface BankEvent {
  id: number;
  type: EventType;
  amount: number;
  note: string;
  timestamp: string;
}

const EVENT_STYLES: Record<EventType, { bg: string; border: string; text: string; badgeText: string; badgeBg: string }> = {
  ACCOUNT_OPENED: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", badgeText: "text-slate-700", badgeBg: "bg-slate-200" },
  DEPOSIT:        { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badgeText: "text-emerald-700", badgeBg: "bg-emerald-200" },
  WITHDRAWAL:     { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badgeText: "text-rose-700", badgeBg: "bg-rose-200" },
  SYSTEM_GLITCH:  { bg: "bg-red-50", border: "border-red-400", text: "text-red-900", badgeText: "text-red-100", badgeBg: "bg-red-600" },
  REFUND:         { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", badgeText: "text-indigo-800", badgeBg: "bg-indigo-200" },
};

function formatTime(ms: number) {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
}

// ─── Main Component ────────────────────────────────────────────────────────────

const INITIAL_EVENTS: BankEvent[] = [
  { id: 1001, type: "ACCOUNT_OPENED", amount: 0, note: "Account created", timestamp: "09:00:00" },
  { id: 1002, type: "DEPOSIT", amount: 1000, note: "Initial allowance", timestamp: "09:01:14" },
];

const TIMER_DURATION_SECONDS = 5 * 60;

export default function EventSourcing9() {
  const { reportComplete: _reportComplete } = useLMSBridge("eventsourcing9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [phase, setPhase] = useState<Phase>("STEP1_BUY");
  const [events, setEvents] = useState<BankEvent[]>(INITIAL_EVENTS);
  const [playheadIdx, setPlayheadIdx] = useState<number>(INITIAL_EVENTS.length - 1);
  const [shakeDelete, setShakeDelete] = useState<number | null>(null);
  const [composerType, setComposerType] = useState<EventType>("WITHDRAWAL");
  const [composerAmount, setComposerAmount] = useState<string>("300");
  const [composerError, setComposerError] = useState<string | null>(null);
  const submitLockRef = useRef(false);


  // Compute running balance up to each event index
  const runningBalances = events.reduce<number[]>((acc, ev, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    acc.push(prev + ev.amount);
    return acc;
  }, []);

  const currentBalance = runningBalances[playheadIdx] ?? 0;
  const isAtHead = playheadIdx === events.length - 1;
  const hasGlitch = events.some(e => e.type === "SYSTEM_GLITCH");

  const reportComplete = useCallback(() => {
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  // Global Timer
  useEffect(() => {
    if (timedOut || phase === "COMPLETE") {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timedOut, phase]);

  useEffect(() => {
    if (timedOut) _reportComplete({ points: 0 });
  }, [timedOut, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  // ─── Actions ───

  const handleCompose = () => {
    if (submitLockRef.current) return; // Prevent rapid-click race conditions
    if (!isAtHead || phase === "COMPLETE") return;
    const amt = parseInt(composerAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      playError();
      return;
    }

    const actualAmount = (composerType === "WITHDRAWAL" || composerType === "SYSTEM_GLITCH") ? -amt : amt;
    
    // PRE-VALIDATION: Prevent spamming incorrect refunds in Phase 3
    if (phase === "STEP3_FIX") {
      if (composerType !== "REFUND" || actualAmount !== 300) {
        playError();
        setComposerError(`Invalid fix! To correctly cancel out the SYSTEM GLITCH, you must append a REFUND of exactly $300.`);
        setTimeout(() => setComposerError(null), 4000);
        return; // Block appending
      }
    }

    setComposerError(null);
    const note = composerType === "WITHDRAWAL" ? "Purchased Laptop" : composerType === "REFUND" ? "Refund for glitch" : "Deposit";
    
    // Generate ID securely inside the state callback to prevent closure staleness causing duplicate keys
    setEvents(prev => {
      const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1001;
      const newEv: BankEvent = { id: nextId, type: composerType, amount: actualAmount, note, timestamp: formatTime(Date.now()) };
      setPlayheadIdx(prev.length);
      return [...prev, newEv];
    });

    if (phase === "STEP1_BUY" && composerType === "WITHDRAWAL" && actualAmount === -300) {
      submitLockRef.current = true; // Lock until hacker event finishes
      playSuccess();
      setPhase("STEP2_TRAP");
      
      // Auto trigger hacker attack
      setTimeout(() => {
        setEvents(prev => {
          const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1001;
          const glitchEv: BankEvent = { id: nextId, type: "SYSTEM_GLITCH", amount: -300, note: "FATAL: Duplicate Charge", timestamp: formatTime(Date.now()) };
          setPlayheadIdx(prev.length);
          return [...prev, glitchEv];
        });
        playError();
        setComposerType("REFUND");
        setComposerAmount("300");
        submitLockRef.current = false; // Unlock for user
      }, 1500);
    } 
    else if (phase === "STEP3_FIX") {
      submitLockRef.current = true; // Lock permanently for COMPLETE phase
      playSuccess();
      setPhase("COMPLETE");
      setTimeout(reportComplete, 1500);
    } else {
      playSuccess();
    }
  };

  const attemptDelete = (eventId: number) => {
    playError();
    setShakeDelete(eventId);
    setTimeout(() => setShakeDelete(null), 500);
    if (phase === "STEP2_TRAP") {
      setPhase("STEP3_FIX");
    }
  };

  const getInstruction = () => {
    switch (phase) {
      case "STEP1_BUY": return "Learn & Try: Event ledgers keep a receipt of everything. Use the Event Composer to append a Withdrawal of $300 to buy a laptop.";
      case "STEP2_TRAP": return "Fail Safely: A system glitch just duplicated your charge! Try to click the Trash icon on the glitch to delete it from the database.";
      case "STEP3_FIX": return "Understand & Improve: Ledgers are IMMUTABLE. You cannot erase history! To fix the math, you must use the Composer to append a Compensating Event (Refund) that cancels the glitch.";
      case "COMPLETE": return "Outcome: You fixed the balance without erasing history! Auditors now have a perfect record of both the glitch and the fix.";
    }
  };

  return (
    <LabShell
      navExtra={
        phase !== "COMPLETE" && (
          <div className={`flex items-center gap-1.5 px-3.5 h-9 rounded-full text-sm font-bold border shadow-sm ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 30 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-slate-200 text-slate-700"
          }`}>
            <Timer size={15} strokeWidth={2.5} className={secondsLeft <= 60 && !timedOut ? "animate-spin" : ""} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      }
      labId="eventsourcing9"
      theme="ocean"
      title="Event Sourcing (CQRS)"
      instruction={getInstruction()}
      compact
      onReset={() => {
        setPhase("STEP1_BUY");
        setEvents(INITIAL_EVENTS);
        setPlayheadIdx(INITIAL_EVENTS.length - 1);
        setSecondsLeft(TIMER_DURATION_SECONDS);
        setTimedOut(false);
        setComposerType("WITHDRAWAL");
        setComposerAmount("300");
      }}
    >
      <Celebration isActive={phase === "COMPLETE"} message="Audit Trail Perfect! You fixed the balance by appending a compensating event. You now understand how enterprise systems use Event Sourcing to prevent data loss and ensure total accountability." />

      <div className="w-full flex flex-col md:flex-row flex-1 min-h-0 gap-4 pt-1">
        
        {/* ── LEFT: State View & Event Composer ── */}
        <div className="md:w-[320px] shrink-0 flex flex-col gap-4">
          
          {/* Current State (Bank Display) */}
          <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${!isAtHead ? "border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]" : "border-slate-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${!isAtHead ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
                {!isAtHead ? <Rewind size={16} /> : <Banknote size={16} />}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${!isAtHead ? "text-indigo-600" : "text-emerald-700"}`}>
                {!isAtHead ? "Historical State" : "Live Bank Balance"}
              </span>
            </div>
            
            <motion.div
              key={currentBalance}
              initial={{ scale: 1.05, filter: "blur(4px)" }}
              animate={{ scale: 1, filter: "blur(0px)" }}
              className={`text-5xl font-black tabular-nums tracking-tight ${currentBalance >= 0 ? "text-slate-800" : "text-rose-600"}`}
            >
              ${currentBalance}
            </motion.div>
            
            <div className="mt-2 text-[11px] font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
              Calculated dynamically by replaying <strong>{playheadIdx + 1}</strong> event{playheadIdx !== 0 ? "s" : ""} from the ledger.
            </div>
          </div>

          {/* Event Composer Widget */}
          <div className={`bg-white rounded-2xl border-2 p-4 shadow-sm flex-1 flex flex-col transition-all ${phase === "STEP3_FIX" ? "border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-slate-200"}`}>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Plus size={14} /> Event Composer
            </h3>
            
            {phase === "COMPLETE" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-emerald-700">Ledger Sealed & Audited.</p>
                <p className="text-[10px] text-emerald-600 mt-1">Outcome achieved! You may still use the Time Machine below to review the immutable history.</p>
              </div>
            ) : phase === "STEP2_TRAP" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-rose-50 rounded-xl border border-dashed border-rose-300">
                <ShieldAlert className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
                <p className="text-xs font-bold text-rose-700">COMPOSER LOCKED</p>
                <p className="text-[10px] text-rose-600 mt-1">A system glitch has been detected! Try to delete the bad event directly from the Ledger list using the Trash icon.</p>
              </div>
            ) : !isAtHead ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <History className="w-8 h-8 text-indigo-300 mb-2" />
                <p className="text-xs font-bold text-slate-500">You are time-traveling.</p>
                <p className="text-[10px] text-slate-400 mt-1">Return to the Present (Live) to append new transactions.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Event Type</label>
                  <select 
                    value={composerType} 
                    onChange={e => setComposerType(e.target.value as EventType)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="DEPOSIT">Deposit (+)</option>
                    <option value="WITHDRAWAL">Withdrawal (-)</option>
                    <option value="REFUND">Refund (+)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Amount ($)</label>
                  <input 
                    type="number" 
                    value={composerAmount}
                    onChange={e => setComposerAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm font-black tabular-nums focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Enter amount"
                  />
                </div>
                
                <button 
                  onClick={handleCompose}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-black bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} /> Append to Ledger
                </button>
                <AnimatePresence>
                  {composerError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg flex items-start gap-1 mt-1 leading-snug"
                    >
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <span>{composerError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Immutable Ledger & Scrubber ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* Ledger List */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <History size={16} className="text-slate-400" />
                Immutable Event Ledger
              </h2>
              {phase === "STEP3_FIX" && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full animate-pulse">
                  Ledger is Locked (Append-Only)
                </span>
              )}
            </div>
            
            {/* The "Receipt Tape" wrapper */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 relative bg-slate-50/30">
              {/* Timeline spine */}
              <div className="absolute left-7 top-0 bottom-0 w-px bg-slate-200 pointer-events-none" />
              
              <AnimatePresence initial={false}>
                {events.map((ev, i) => {
                  const style = EVENT_STYLES[ev.type];
                  const isCurrent = i <= playheadIdx;
                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={shakeDelete === ev.id ? { x: [-5, 5, -5, 5, 0] } : { opacity: 1, y: 0 }}
                      className={`flex items-center gap-2 sm:gap-4 p-3 rounded-xl border-2 transition-all ${style.bg} ${style.border} ${isCurrent ? "shadow-sm" : "opacity-40 grayscale-[0.5]"}`}
                    >
                      <div className="shrink-0 text-center w-12 relative bg-white border border-slate-200 py-1 rounded shadow-sm z-10">
                        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">ID</div>
                        <div className="text-[10px] font-mono font-black text-slate-700">#{ev.id}</div>
                      </div>
                      <div className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-black min-w-[90px] text-center tracking-wide ${style.badgeText} ${style.badgeBg}`}>
                        {ev.type}
                      </div>
                      <div className={`flex-1 min-w-0 text-xs font-bold truncate ${style.text}`}>{ev.note}</div>
                      <div className={`shrink-0 font-black text-sm md:text-base tabular-nums ${ev.amount > 0 ? "text-emerald-600" : ev.amount < 0 ? "text-rose-600" : "text-slate-600"}`}>
                        {ev.amount > 0 ? "+" : ev.amount < 0 ? "-" : ""}${Math.abs(ev.amount)}
                      </div>
                      
                      {/* Trash Icon (Visible on Glitch or when testing) */}
                      {isCurrent && ev.type !== "ACCOUNT_OPENED" && ev.type !== "DEPOSIT" && (
                        <button
                          onClick={() => attemptDelete(ev.id)}
                          className="shrink-0 p-1.5 rounded hover:bg-rose-100 text-slate-300 hover:text-rose-500 transition-colors"
                          title="Try to delete event"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Time-Travel Scrubber */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-indigo-500">
              <span className="flex items-center gap-1.5"><Rewind size={14}/> Time Machine</span>
              {isAtHead ? <span className="text-emerald-500">Present (Live)</span> : <span className="text-amber-500 animate-pulse">Viewing History</span>}
            </div>
            
            <div className="relative pt-2 pb-1 px-1">
              <input 
                type="range" 
                min={0} 
                max={events.length - 1} 
                step={1}
                value={playheadIdx}
                onChange={(e) => {
                  setPlayheadIdx(parseInt(e.target.value, 10));
                  playPop();
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                style={{ 
                  background: `linear-gradient(to right, #4f46e5 ${(playheadIdx / Math.max(1, events.length - 1)) * 100}%, #e2e8f0 ${(playheadIdx / Math.max(1, events.length - 1)) * 100}%)` 
                }}
              />
            </div>
          </div>

        </div>

      </div>
    </LabShell>
  );
}
