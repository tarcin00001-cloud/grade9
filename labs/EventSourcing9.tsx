"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { TrendingUp, TrendingDown, RefreshCcw, Rewind, ArrowLeft, ArrowRight, Zap } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type EventType = "ACCOUNT_OPENED" | "DEPOSIT" | "WITHDRAWAL" | "INTEREST" | "FEE";

interface BankEvent {
  id: number;
  type: EventType;
  amount: number;
  note: string;
  timestamp: string;
}

const EVENT_COLORS: Record<EventType, { bg: string; border: string; text: string }> = {
  ACCOUNT_OPENED: { bg: "#1e1b4b", border: "#6366f1", text: "#818cf8" },
  DEPOSIT:        { bg: "#064e3b", border: "#10b981", text: "#34d399" },
  WITHDRAWAL:     { bg: "#4c0519", border: "#f43f5e", text: "#fb7185" },
  INTEREST:       { bg: "#422006", border: "#f59e0b", text: "#fbbf24" },
  FEE:            { bg: "#1c0a0f", border: "#e11d48", text: "#fb7185" },
};

function formatTime(ms: number) {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
}

// ─── Event Row ─────────────────────────────────────────────────────────────────

function EventRow({
  event,
  isCurrent,
  runningBalance,
}: {
  event: BankEvent;
  isCurrent: boolean;
  runningBalance: number;
}) {
  const col = EVENT_COLORS[event.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${isCurrent ? "ring-2 ring-violet-500/50 scale-[1.01]" : ""}`}
      style={{ backgroundColor: col.bg, borderColor: col.border + "60" }}
    >
      {/* ID + time */}
      <div className="shrink-0 text-center">
        <div className="text-[9px] font-mono text-slate-600">#{event.id}</div>
        <div className="text-[9px] font-mono text-slate-700">{event.timestamp}</div>
      </div>

      {/* Event type */}
      <div className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-black min-w-[90px] text-center" style={{ color: col.text, backgroundColor: col.border + "20" }}>
        {event.type}
      </div>

      {/* Note */}
      <div className="flex-1 min-w-0 text-[10px] text-slate-400 truncate">{event.note}</div>

      {/* Amount */}
      <div className={`shrink-0 font-black text-sm tabular-nums ${event.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
        {event.amount >= 0 ? "+" : ""}${event.amount}
      </div>

      {/* Running balance */}
      <div className="shrink-0 text-right">
        <div className="text-[8px] text-slate-600">balance</div>
        <div className="text-xs font-bold text-slate-300 tabular-nums">${runningBalance}</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const INITIAL_EVENTS: BankEvent[] = [
  { id: 1001, type: "ACCOUNT_OPENED", amount: 0, note: "Account created for alice@school.com", timestamp: "09:00:00" },
  { id: 1002, type: "DEPOSIT", amount: 500, note: "Initial deposit — cash", timestamp: "09:01:14" },
  { id: 1003, type: "INTEREST", amount: 12, note: "Monthly interest (2.4% APR)", timestamp: "09:02:30" },
];

export default function EventSourcing9() {
  const { reportComplete } = useLMSBridge("eventsourcing9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [events, setEvents] = useState<BankEvent[]>(INITIAL_EVENTS);
  const [playheadIdx, setPlayheadIdx] = useState<number>(INITIAL_EVENTS.length - 1); // index of current "viewed" event
  const [hasWon, setHasWon] = useState(false);

  let idCounter = events.length > 0 ? events[events.length - 1].id + 1 : 1001;

  // Compute running balance up to each event index
  const runningBalances = events.reduce<number[]>((acc, ev, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    acc.push(prev + ev.amount);
    return acc;
  }, []);

  const currentBalance = runningBalances[playheadIdx] ?? 0;
  const isAtHead = playheadIdx === events.length - 1;

  const addEvent = (type: EventType, amount: number, note: string) => {
    if (!isAtHead) return; // must be at head to add events
    const now = formatTime(Date.now());
    const newEv: BankEvent = { id: idCounter++, type, amount, note, timestamp: now };
    setEvents(prev => [...prev, newEv]);
    setPlayheadIdx(prev => prev + 1);
    if (amount > 0) { playSuccess(); } else { playError(); }

    if (events.length >= 5 && !hasWon) {
      setHasWon(true);
      setTimeout(reportComplete, 1500);
    }
  };

  const stepBack = () => {
    if (playheadIdx > 0) { setPlayheadIdx(p => p - 1); playPop(); }
  };
  const stepForward = () => {
    if (playheadIdx < events.length - 1) { setPlayheadIdx(p => p + 1); playPop(); }
  };
  const jumpToStart = () => { setPlayheadIdx(0); playZap(); };
  const jumpToEnd = () => { setPlayheadIdx(events.length - 1); playZap(); };

  const reset = () => {
    setEvents(INITIAL_EVENTS);
    setPlayheadIdx(INITIAL_EVENTS.length - 1);
    setHasWon(false);
    playZap();
  };

  return (
    <LabShell labId="eventsourcing9" theme="ocean" title="Event Sourcing (CQRS)" subtitle="L47 · Data Architecture"
      instruction="In Event Sourcing, the database NEVER overwrites data — it only appends events to an immutable ledger. The balance is calculated by replaying all events. Use the playhead to time-travel backwards to any past state. Notice: the actual balance number doesn't exist in the DB — only the event history does!" compact>

      <Celebration isActive={hasWon} message="Audit Trail Complete! Unlike SQL (which overwrites and loses history), Event Sourcing keeps every transaction forever. This means you can time-travel to any past state, run compliance audits, and even replay events into a different system. Real banks use this exact architecture." onReplay={reset} />

      <div className="w-full flex flex-col xl:flex-row flex-1 min-h-0 gap-3 pt-1">

        {/* ── LEFT: Balance Display + Actions ── */}
        <div className="xl:w-[280px] shrink-0 flex flex-col gap-3">

          {/* Balance */}
          <div className={`panel-glass rounded-2xl border p-4 transition-all ${!isAtHead ? "border-amber-700/50 bg-amber-950/10" : "border-sky-900/40"}`}>
            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
              {!isAtHead ? (
                <><Rewind size={11} className="text-amber-400"/> Viewing historical state (event #{events[playheadIdx]?.id})</>
              ) : (
                <><Zap size={11} className="text-sky-400"/> Current live balance</>
              )}
            </div>
            <motion.div
              key={`${playheadIdx}-${currentBalance}`}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-black tabular-nums mb-1 ${!isAtHead ? "text-amber-300" : currentBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              ${currentBalance}
            </motion.div>
            <div className="text-[10px] text-slate-600">Calculated by replaying {playheadIdx + 1} event{playheadIdx !== 0 ? "s" : ""}</div>
          </div>

          {/* Time-Travel Playhead */}
          <div className="panel-glass rounded-2xl border-violet-900/40 p-3 flex flex-col gap-2">
            <div className="text-xs font-bold text-violet-300 mb-1">⏱ Time-Travel Playhead</div>
            <div className="flex items-center gap-1">
              <button onClick={jumpToStart} className="p-1.5 rounded-lg bg-violet-900/40 border border-violet-800/40 text-violet-400 hover:bg-violet-800/40 transition-all" title="Jump to start">
                <ArrowLeft size={11}/>
              </button>
              <button onClick={stepBack} disabled={playheadIdx === 0} className="flex-1 py-2 rounded-lg bg-violet-900/30 border border-violet-800/30 text-violet-400 hover:bg-violet-800/40 transition-all disabled:opacity-30 flex items-center justify-center gap-1 text-xs font-bold">
                ◀ Back
              </button>
              <button onClick={stepForward} disabled={isAtHead} className="flex-1 py-2 rounded-lg bg-violet-900/30 border border-violet-800/30 text-violet-400 hover:bg-violet-800/40 transition-all disabled:opacity-30 flex items-center justify-center gap-1 text-xs font-bold">
                Fwd ▶
              </button>
              <button onClick={jumpToEnd} className="p-1.5 rounded-lg bg-violet-900/40 border border-violet-800/40 text-violet-400 hover:bg-violet-800/40 transition-all" title="Jump to latest">
                <ArrowRight size={11}/>
              </button>
            </div>
            <div className="text-[9px] text-slate-600 text-center">
              Event {playheadIdx + 1} of {events.length} · {!isAtHead ? "time-travelling" : "live"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="panel-glass rounded-2xl border-sky-900/40 p-3 flex flex-col gap-2">
            <div className="text-xs font-bold text-slate-400 mb-1">Append to Ledger {!isAtHead && <span className="text-amber-400 text-[9px]">(go to HEAD first)</span>}</div>
            <button onClick={() => addEvent("DEPOSIT", 100, "Paycheck deposit")} disabled={!isAtHead}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
              <TrendingUp size={13}/> Deposit +$100
            </button>
            <button onClick={() => addEvent("WITHDRAWAL", -75, "Monthly subscription bill")} disabled={!isAtHead}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-rose-950/60 border border-rose-700/50 text-rose-300 hover:bg-rose-900/60 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
              <TrendingDown size={13}/> Withdraw -$75
            </button>
            <button onClick={() => addEvent("FEE", -5, "Monthly account maintenance fee")} disabled={!isAtHead}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-slate-900/60 border border-slate-700/50 text-slate-400 hover:bg-slate-800/60 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
              Bank Fee -$5
            </button>
            <button onClick={reset} className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800/60 border border-slate-700 text-slate-500 hover:bg-slate-700 transition-all flex items-center justify-center gap-1">
              <RefreshCcw size={11}/> Reset
            </button>
          </div>
        </div>

        {/* ── RIGHT: Event Ledger ── */}
        <div className="flex-1 min-h-0 flex flex-col gap-2">

          <div className="shrink-0 flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-400">📜 Immutable Event Ledger (append-only, never overwritten)</div>
            <div className="text-[9px] font-mono text-slate-600">{events.length} events total</div>
          </div>

          <div className="flex-1 overflow-auto flex flex-col gap-1.5 pr-1">
            <AnimatePresence>
              {events.map((ev, i) => {
                const isVisible = i <= playheadIdx;
                const isCurrent = i === playheadIdx;
                return isVisible ? (
                  <EventRow
                    key={ev.id}
                    event={ev}
                    isCurrent={isCurrent}
                    runningBalance={runningBalances[i]}
                  />
                ) : (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-800/20 bg-slate-900/10"
                  >
                    <div className="text-[9px] font-mono text-slate-700">#{ev.id} · {ev.type} · FUTURE (not yet replayed)</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Insight */}
          <div className="shrink-0 p-2.5 rounded-xl bg-sky-950/20 border border-sky-800/30 text-[10px] text-sky-400 flex items-start gap-2">
            <Rewind size={11} className="shrink-0 mt-0.5"/>
            <span>Playhead is at event #{events[playheadIdx]?.id ?? "?"}. Balance ${currentBalance} = sum of events 1–{playheadIdx + 1}. The number "$balance" doesn't exist in the DB — only these events do.</span>
          </div>

        </div>
      </div>
    </LabShell>
  );
}
