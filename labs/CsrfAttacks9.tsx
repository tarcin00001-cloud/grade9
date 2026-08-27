"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { ShieldAlert, RefreshCcw, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProtectionMode = "NONE" | "CSRF_TOKEN";
type RequestSource = "EVIL" | "BANK";

interface IncomingRequest {
  id: number;
  source: RequestSource;
  amount: number;
  to: string;
  csrfToken: string | null;
  hasCookie: boolean;
}

// ─── Request Card ──────────────────────────────────────────────────────────────

function RequestCard({
  req,
  mode,
  serverToken,
  onDecision,
}: {
  req: IncomingRequest;
  mode: ProtectionMode;
  serverToken: string;
  onDecision: (id: number, accepted: boolean) => void;
}) {
  const tokenMatch = req.csrfToken === serverToken;
  const isEvil = req.source === "EVIL";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      className={`rounded-xl border overflow-hidden ${isEvil ? "border-rose-200" : "border-violet-200"}`}
    >
      {/* Source Label */}
      <div className={`px-4 py-2 text-xs font-bold flex items-center gap-2 ${
        isEvil ? "bg-rose-50 text-rose-700" : "bg-violet-50 text-violet-700"
      }`}>
        {isEvil ? <AlertTriangle size={12}/> : <ExternalLink size={12}/>}
        {isEvil ? "From: evil-cat-pics.com (forged!)" : "From: mybank.com/transfer"}
      </div>

      {/* Request Details */}
      <div className="bg-slate-50 px-4 py-3 font-mono text-xs flex flex-col gap-1">
        <div><span className="text-slate-500">POST</span> <span className="text-amber-600">/api/transfer</span></div>
        <div><span className="text-slate-500">to:</span> <span className="text-slate-900">{req.to}</span></div>
        <div><span className="text-slate-500">amount:</span> <span className="text-slate-900">${req.amount}</span></div>
        <div><span className="text-slate-500">cookie:</span> <span className="text-emerald-600">session=alice123</span> <span className="text-slate-400">(auto-attached!)</span></div>

        {mode === "CSRF_TOKEN" && (
          <div className={`flex items-center gap-1.5 ${tokenMatch ? "text-emerald-600" : "text-rose-600"}`}>
            <span className="text-slate-500">csrf_token:</span>
            <span className="font-mono">{req.csrfToken ?? "(missing)"}</span>
            {tokenMatch ? <CheckCircle size={11}/> : <XCircle size={11}/>}
          </div>
        )}
      </div>

      {/* Auto/Manual Decision */}
      {mode === "NONE" ? (
        <div className="px-4 py-2.5 bg-rose-50 text-xs text-rose-700 font-bold flex items-center gap-2">
          <XCircle size={13}/> No CSRF protection — request automatically accepted!
          <button
            onClick={() => onDecision(req.id, true)}
            className="ml-auto px-3 py-1 rounded bg-rose-600 border border-rose-700 text-white hover:bg-rose-700 transition-all text-[10px] font-black"
          >
            Process →
          </button>
        </div>
      ) : (
        <div className="px-4 py-2.5 bg-slate-100 flex items-center gap-2">
          <span className="text-xs text-slate-500">Server decision:</span>
          {tokenMatch ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={11}/> Valid CSRF token — accepting</span>
          ) : (
            <span className="text-xs text-rose-600 font-bold flex items-center gap-1"><XCircle size={11}/> Token mismatch — rejecting</span>
          )}
          <button
            onClick={() => onDecision(req.id, tokenMatch)}
            className={`ml-auto px-3 py-1 rounded border text-white text-[10px] font-black transition-all ${
              tokenMatch
                ? "bg-emerald-600 border-emerald-700 hover:bg-emerald-700"
                : "bg-rose-600 border-rose-700 hover:bg-rose-700"
            }`}
          >
            {tokenMatch ? "✓ Accept →" : "✕ Reject →"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const SERVER_CSRF_TOKEN = "a3f9b2c7";
let reqCounter = 0;

export default function CsrfAttacks9() {
  const { reportComplete } = useLMSBridge("csrfattacks9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [mode, setMode] = useState<ProtectionMode>("NONE");
  const [queue, setQueue] = useState<IncomingRequest[]>([]);
  const [log, setLog] = useState<{ id: number; msg: string; bad: boolean }[]>([]);
  const [balance, setBalance] = useState(1000);
  const [hasWon, setHasWon] = useState(false);
  const evilBlocked = useRef(0);

  const addToLog = (msg: string, bad: boolean) => {
    setLog(prev => [{ id: Date.now(), msg, bad }, ...prev].slice(0, 8));
  };

  const sendEvilRequest = () => {
    playPop();
    const req: IncomingRequest = {
      id: reqCounter++,
      source: "EVIL",
      amount: 500,
      to: "hacker@evil.com",
      csrfToken: mode === "CSRF_TOKEN" ? "WRONG_TOKEN" : null,
      hasCookie: true, // browser auto-attaches
    };
    setQueue(prev => [...prev, req]);
  };

  const sendLegitRequest = () => {
    playPop();
    const req: IncomingRequest = {
      id: reqCounter++,
      source: "BANK",
      amount: 50,
      to: "savings@mybank.com",
      csrfToken: mode === "CSRF_TOKEN" ? SERVER_CSRF_TOKEN : null,
      hasCookie: true,
    };
    setQueue(prev => [...prev, req]);
  };

  const handleDecision = (id: number, accepted: boolean) => {
    const req = queue.find(r => r.id === id);
    if (!req) return;
    setQueue(prev => prev.filter(r => r.id !== id));

    if (accepted) {
      setBalance(b => b - req.amount);
      addToLog(`✓ Processed: $${req.amount} → ${req.to}`, req.source === "EVIL");
      if (req.source === "EVIL") {
        playError();
        addToLog("💀 Attacker stole $500 from your account!", true);
      } else {
        playSuccess();
      }
    } else {
      playZap();
      addToLog(`✕ Rejected: $${req.amount} to ${req.to} — CSRF token invalid`, false);
      if (req.source === "EVIL") {
        evilBlocked.current += 1;
        if (evilBlocked.current >= 2 && !hasWon) {
          setHasWon(true);
          setTimeout(reportComplete, 1500);
        }
      }
    }
  };

  const reset = () => {
    setMode("NONE");
    setQueue([]);
    setLog([]);
    setBalance(1000);
    evilBlocked.current = 0;
    setHasWon(false);
    playZap();
  };

  return (
    <LabShell labId="csrfattacks9" theme="ocean" title="Cross-Site Request Forgery (CSRF)"
      instruction="1. Read the provided scenario about how CSRF attacks exploit user sessions. 2. Launch the interactive simulation to craft a mock malicious request. 3. Execute the attack in the sandbox to observe the unauthorized action. 4. Implement the defensive token to secure the form and verify the fix." compact onReset={reset}>

      <Celebration isActive={hasWon} message="CSRF Defeated! Browsers automatically attach your session cookie to every request, even ones from evil sites. A CSRF Token is a secret hidden in the actual HTML form. The evil site can never read that token (same-origin policy), so its forged request is missing the token and gets rejected." onReplay={reset} />

      <div className="w-full flex flex-col xl:flex-row flex-1 min-h-0 gap-3 pt-1">

        {/* ── LEFT: Controls + State ── */}
        <div className="xl:w-[340px] shrink-0 flex flex-col gap-3">

          {/* Bank Account State */}
          <div className="panel-glass bg-white rounded-2xl border-slate-200 p-4 shadow-sm">
            <div className="text-xs text-slate-600 font-bold mb-1">Your Bank Balance</div>
            <motion.div
              key={balance}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-3xl font-black tabular-nums ${balance < 800 ? "text-rose-600" : "text-emerald-600"}`}
            >
              ${balance.toLocaleString()}
            </motion.div>
            <div className="text-xs text-slate-500 mt-1">alice@school.com · session=alice123</div>
          </div>

          {/* Protection Toggle */}
          <div className="panel-glass bg-white rounded-2xl border-slate-200 p-4 flex flex-col gap-3 shadow-sm">
            <div className="text-xs font-bold text-slate-600">Server Protection Mode</div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setMode("NONE"); setQueue([]); playZap(); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  mode === "NONE" ? "bg-rose-100 border-rose-300 text-rose-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800"
                }`}
              >
                <XCircle size={13}/> No Protection (Cookie Only)
              </button>
              <button
                onClick={() => { setMode("CSRF_TOKEN"); setQueue([]); playZap(); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  mode === "CSRF_TOKEN" ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800"
                }`}
              >
                <ShieldAlert size={13}/> CSRF Token Required
              </button>
            </div>

            {mode === "CSRF_TOKEN" && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 font-mono text-[10px] text-emerald-800">
                Server token: <span className="font-black">{SERVER_CSRF_TOKEN}</span>
                <div className="text-emerald-600 text-[9px] mt-0.5">↳ Embedded in your bank&apos;s HTML (evil site can&apos;t read it)</div>
              </div>
            )}
          </div>

          {/* Attack Buttons */}
          <div className="panel-glass bg-white rounded-2xl border-slate-200 p-4 flex flex-col gap-2 shadow-sm">
            <div className="text-xs font-bold text-slate-600 mb-1">Simulate Requests</div>
            <button
              onClick={sendEvilRequest}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-black bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200 transition-all flex items-center gap-2"
            >
              <AlertTriangle size={13}/> Visit evil-cat-pics.com (triggers forged request)
            </button>
            <button
              onClick={sendLegitRequest}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-black bg-violet-100 border border-violet-300 text-violet-800 hover:bg-violet-200 transition-all flex items-center gap-2"
            >
              <CheckCircle size={13}/> Make a legit bank transfer
            </button>
          </div>

        </div>

        {/* ── RIGHT: Bank Server Panel ── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          {/* Request Queue */}
          <div className="flex-1 min-h-0 panel-glass rounded-2xl border-slate-200 bg-white overflow-hidden flex flex-col shadow-sm">
            <div className="shrink-0 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert size={13}/> Bank Server — Incoming Requests
            </div>
            <div className="flex-1 overflow-auto p-3 flex flex-col gap-2">
              <AnimatePresence>
                {queue.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-center text-slate-600 text-xs"
                  >
                    No incoming requests — simulate one on the left
                  </motion.div>
                ) : (
                  queue.map(req => (
                    <RequestCard
                      key={req.id}
                      req={req}
                      mode={mode}
                      serverToken={SERVER_CSRF_TOKEN}
                      onDecision={handleDecision}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Activity Log */}
          <div className="shrink-0 panel-glass rounded-2xl border-slate-200 bg-white overflow-hidden shadow-sm" style={{ maxHeight: "160px" }}>
            <div className="px-4 py-2 text-xs font-bold text-slate-800 border-b border-slate-200">Server Log</div>
            <div className="overflow-auto p-3 flex flex-col gap-1">
              <AnimatePresence>
                {log.length === 0
                  ? <div className="text-slate-400 text-xs">Awaiting activity...</div>
                  : log.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-[10px] font-mono ${entry.bad ? "text-rose-600" : "text-slate-700"}`}
                    >
                      {entry.msg}
                    </motion.div>
                  ))
                }
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </LabShell>
  );
}
