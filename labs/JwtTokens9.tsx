"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Bug, ShieldCheck, RefreshCcw, Eye, Lock, ChevronDown, ChevronRight } from "lucide-react";

// ─── JWT Structure ─────────────────────────────────────────────────────────────

const REAL_HEADER = { alg: "HS256", typ: "JWT" };
const REAL_PAYLOAD = { sub: "alice@school.com", role: "student", admin: false, exp: 1735689600 };
const REAL_SIG = "x7b8f2a...c9p4"; // fake
const SERVER_SECRET = "S3cr3tK3y!";

function base64url(obj: object) {
  return btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// ─── Segment Card ──────────────────────────────────────────────────────────────

function SegmentCard({
  label,
  color,
  borderColor,
  children,
  defaultOpen,
}: {
  label: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className={`rounded-xl border overflow-hidden`} style={{ borderColor }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
        style={{ backgroundColor: `${color}18` }}
      >
        <span className="text-xs font-black font-mono tracking-wider" style={{ color }}>{label}</span>
        {open ? <ChevronDown size={13} style={{ color }}/> : <ChevronRight size={13} style={{ color }}/>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-black/40 text-xs font-mono leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type Step = "EXPLORE" | "TAMPERED" | "VERIFYING" | "REJECTED" | "ACCEPTED";

export default function JwtTokens9() {
  const { reportComplete } = useLMSBridge("jwttokens9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [adminValue, setAdminValue] = useState<"false" | "true">("false");
  const [roleValue, setRoleValue] = useState<"student" | "teacher" | "admin">("student");
  const [step, setStep] = useState<Step>("EXPLORE");
  const [hasWon, setHasWon] = useState(false);

  const isTampered = adminValue === "true" || roleValue !== "student";

  const currentPayload = { ...REAL_PAYLOAD, admin: adminValue === "true", role: roleValue };
  const encodedHeader = base64url(REAL_HEADER);
  const encodedPayload = base64url(currentPayload);
  const signatureDisplay = isTampered ? "???INVALID???" : REAL_SIG;

  const fullToken = `${encodedHeader}.${encodedPayload}.${isTampered ? "x7b8f2a...TAMPERED" : REAL_SIG}`;

  const sendToServer = () => {
    if (step === "VERIFYING") return;
    setStep("VERIFYING");
    playZap();

    setTimeout(() => {
      if (isTampered) {
        setStep("REJECTED");
        playError();
        if (!hasWon) {
          setHasWon(true);
          setTimeout(reportComplete, 1500);
        }
      } else {
        setStep("ACCEPTED");
        playSuccess();
      }
    }, 1400);
  };

  const reset = () => {
    setStep("EXPLORE");
    setAdminValue("false");
    setRoleValue("student");
    setHasWon(false);
  };

  const statusBg = step === "REJECTED"
    ? "bg-rose-950/60 border-rose-700/50 text-rose-300"
    : step === "ACCEPTED"
    ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-300"
    : step === "VERIFYING"
    ? "bg-violet-950/60 border-violet-700/50 text-violet-300"
    : "bg-slate-900/60 border-slate-800 text-slate-400";

  return (
    <LabShell labId="jwttokens9" theme="cosmos" title="JSON Web Tokens (JWT)" subtitle="L45 · Cryptography"
      instruction="A JWT has 3 parts: Header, Payload, and Signature. The Payload is readable by anyone — it's just Base64, not encryption. Try editing your own role or admin field below. Then send the token to the server and see if your forged permissions are accepted." compact>

      <Celebration isActive={hasWon} message="Hack Blocked! You edited the Payload, but the Signature was computed with the old Payload and the server's secret key. Since you don't know the secret, you can't recompute a valid Signature. The server detected the mismatch and rejected your tampered token." onReplay={reset} />

      <div className="w-full flex flex-col xl:flex-row flex-1 min-h-0 gap-3 pt-1">

        {/* ── LEFT: JWT Token Display & Editor ── */}
        <div className="xl:w-[380px] shrink-0 flex flex-col gap-3">

          {/* Token String */}
          <div className="panel-glass rounded-2xl border-violet-900/40 p-4">
            <div className="text-xs text-slate-500 font-bold mb-2 font-mono">JWT Token (your browser stores this)</div>
            <div className="font-mono text-[9px] break-all leading-relaxed">
              <span className="text-rose-400">{encodedHeader}</span>
              <span className="text-slate-600">.</span>
              <span className="text-violet-400">{encodedPayload}</span>
              <span className="text-slate-600">.</span>
              <span className={isTampered ? "text-rose-300 animate-pulse" : "text-cyan-400"}>{signatureDisplay}</span>
            </div>
          </div>

          {/* Segment Cards */}
          <div className="flex flex-col gap-2">
            <SegmentCard label="HEADER (alg + typ)" color="#f43f5e" borderColor="#f43f5e44">
              <div className="text-rose-300">{"{"}</div>
              <div className="text-rose-300 pl-3">"alg": <span className="text-amber-300">"HS256"</span>,</div>
              <div className="text-rose-300 pl-3">"typ": <span className="text-amber-300">"JWT"</span></div>
              <div className="text-rose-300">{"}"}</div>
              <div className="text-slate-500 text-[10px] mt-2">↳ Tells server which algorithm was used to sign</div>
            </SegmentCard>

            <SegmentCard label="PAYLOAD (claims — you can edit this!)" color="#a78bfa" borderColor="#a78bfa44" defaultOpen>
              <div className="text-violet-300">{"{"}</div>
              <div className="pl-3">
                <span className="text-slate-400">"sub":</span> <span className="text-amber-300">"alice@school.com"</span>,
              </div>
              <div className="pl-3 flex items-center gap-2 flex-wrap">
                <span className="text-slate-400">"role":</span>
                <select
                  value={roleValue}
                  onChange={e => { setRoleValue(e.target.value as typeof roleValue); setStep("EXPLORE"); playPop(); }}
                  className="bg-violet-950/60 border border-violet-700/50 rounded px-2 py-0.5 text-amber-300 text-xs font-mono"
                >
                  <option value="student">"student"</option>
                  <option value="teacher">"teacher"</option>
                  <option value="admin">"admin"</option>
                </select>
                <span className="text-slate-500 text-[10px]">← EDIT</span>
              </div>
              <div className="pl-3 flex items-center gap-2 flex-wrap">
                <span className="text-slate-400">"admin":</span>
                <select
                  value={adminValue}
                  onChange={e => { setAdminValue(e.target.value as "true" | "false"); setStep("EXPLORE"); playPop(); }}
                  className="bg-violet-950/60 border border-violet-700/50 rounded px-2 py-0.5 text-amber-300 text-xs font-mono"
                >
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
                <span className="text-slate-500 text-[10px]">← EDIT</span>
              </div>
              <div className="pl-3"><span className="text-slate-400">"exp":</span> <span className="text-amber-300">1735689600</span></div>
              <div className="text-violet-300">{"}"}</div>
              {isTampered && (
                <div className="mt-2 px-2 py-1 bg-rose-950/50 border border-rose-700/40 rounded text-rose-400 text-[10px] font-bold">
                  ⚠ Payload modified! Signature now INVALID.
                </div>
              )}
            </SegmentCard>

            <SegmentCard label="SIGNATURE (server verifies this)" color="#06b6d4" borderColor="#06b6d444">
              <div className="text-cyan-400 font-mono text-[10px]">HMACSHA256(</div>
              <div className="text-cyan-300 pl-3 text-[10px]">base64url(header) + "." +</div>
              <div className="text-cyan-300 pl-3 text-[10px]">base64url(payload),</div>
              <div className="text-amber-300 pl-3 text-[10px]">secret: "{SERVER_SECRET}"  ← only server knows!</div>
              <div className="text-cyan-400 font-mono text-[10px]">)</div>
              <div className="mt-2 text-slate-500 text-[10px]">↳ If you change the payload, you'd need the secret to re-sign. You don't have it.</div>
            </SegmentCard>
          </div>

          {/* Send Button */}
          <button
            onClick={sendToServer}
            disabled={step === "VERIFYING"}
            className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all border-2 disabled:opacity-50 ${
              isTampered
                ? "bg-rose-600/80 border-rose-500 text-white hover:bg-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                : "bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            }`}
          >
            <ShieldCheck size={16}/> Send Token to Server for Validation
          </button>
        </div>

        {/* ── RIGHT: Server Verification Visualizer ── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          {/* Server Panel */}
          <div className="flex-1 panel-glass rounded-2xl border-cyan-900/40 bg-[#020617] overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col p-6 gap-4 overflow-auto">

              <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Lock size={14}/> Server Validation Engine
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-3">
                {/* Step 1 */}
                <div className={`p-3 rounded-xl border transition-all ${
                  step === "EXPLORE" ? "border-slate-800 bg-slate-900/40 opacity-40" : "border-violet-800/40 bg-violet-950/20"
                }`}>
                  <div className="text-xs font-bold text-violet-300 mb-1">① Receive JWT from browser cookie</div>
                  {step !== "EXPLORE" && (
                    <div className="font-mono text-[9px] text-violet-400 break-all">
                      <span className="text-rose-400">{encodedHeader}</span>.<span className="text-violet-400">{encodedPayload}</span>.<span className={isTampered ? "text-rose-300" : "text-cyan-400"}>{signatureDisplay}</span>
                    </div>
                  )}
                </div>

                {/* Step 2 */}
                <div className={`p-3 rounded-xl border transition-all ${
                  ["EXPLORE"].includes(step) ? "border-slate-800 bg-slate-900/40 opacity-40" : "border-amber-800/40 bg-amber-950/10"
                }`}>
                  <div className="text-xs font-bold text-amber-300 mb-1">② Re-compute signature using server secret</div>
                  {step !== "EXPLORE" && (
                    <div className="font-mono text-[9px] text-amber-400">
                      HMAC("{encodedHeader}.{encodedPayload}", "{SERVER_SECRET}") = <span className="text-cyan-400">{REAL_SIG}</span>
                    </div>
                  )}
                </div>

                {/* Step 3 — Compare */}
                <div className={`p-3 rounded-xl border transition-all ${
                  ["EXPLORE", "VERIFYING"].includes(step) ? "border-slate-800 bg-slate-900/40 opacity-40" : step === "REJECTED" ? "border-rose-800/40 bg-rose-950/20" : "border-emerald-800/40 bg-emerald-950/20"
                }`}>
                  <div className={`text-xs font-bold mb-1 ${step === "REJECTED" ? "text-rose-300" : step === "ACCEPTED" ? "text-emerald-300" : "text-slate-400"}`}>
                    ③ Compare signatures
                  </div>
                  {(step === "REJECTED" || step === "ACCEPTED") && (
                    <div className="flex flex-col gap-1 font-mono text-[10px]">
                      <div>Expected: <span className="text-cyan-400">{REAL_SIG}</span></div>
                      <div>Received: <span className={isTampered ? "text-rose-400" : "text-cyan-400"}>{signatureDisplay}</span></div>
                      <div className={`font-bold mt-1 text-sm ${step === "REJECTED" ? "text-rose-400" : "text-emerald-400"}`}>
                        {step === "REJECTED" ? "✕ MISMATCH — Token tampered! Access denied." : "✓ MATCH — Token authentic! Welcome, Alice."}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verifying animation */}
              <AnimatePresence>
                {step === "VERIFYING" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 text-violet-400 text-sm font-bold"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full"
                    />
                    Re-computing HMAC signature...
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Status Bar */}
          <div className={`shrink-0 rounded-xl p-2.5 text-xs font-mono text-center transition-all border ${statusBg}`}>
            {step === "EXPLORE" && "← Explore the JWT structure. Try editing the Payload fields, then send to the server."}
            {step === "VERIFYING" && "→ Server is re-hashing the token to verify its authenticity..."}
            {step === "REJECTED" && "✕ REJECTED — Signature mismatch. You edited the payload but cannot re-sign without the server secret!"}
            {step === "ACCEPTED" && "✓ ACCEPTED — Valid token. Welcome, Alice! (Try editing the payload now and re-sending.)"}
          </div>

          <button onClick={reset} className="shrink-0 w-full py-2 rounded-xl text-xs font-bold bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5">
            <RefreshCcw size={13}/> Reset
          </button>
        </div>

      </div>
    </LabShell>
  );
}
