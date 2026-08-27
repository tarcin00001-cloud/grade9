"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Shield, Terminal, RefreshCcw, CheckCircle, XCircle, AlertTriangle, Zap } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PacketState = "IDLE" | "FLYING" | "BLOCKED" | "FORWARDED" | "RETURNED";
type PacketType = "DDOS" | "GOOD";

interface ParseResult {
  hasProxy: boolean;
  hasDeny: boolean;
  proxyTarget: string;
  deniedIp: string;
  errors: string[];
}

// ─── Config Parser ─────────────────────────────────────────────────────────────

function parseNginxConfig(config: string): ParseResult {
  const errors: string[] = [];
  let hasProxy = false;
  let hasDeny = false;
  let proxyTarget = "";
  let deniedIp = "";

  const lines = config.split("\n").map(l => l.trim()).filter(Boolean);
  
  for (const line of lines) {
    // proxy_pass
    const proxyMatch = line.match(/^proxy_pass\s+(https?:\/\/[\w.:]+)\s*;$/);
    if (proxyMatch) {
      hasProxy = true;
      proxyTarget = proxyMatch[1];
      if (!proxyTarget.includes("10.0.0.1:8080")) {
        errors.push(`Wrong proxy target: ${proxyTarget}. Expected http://10.0.0.1:8080`);
        hasProxy = false;
      }
    }

    // deny IP
    const denyMatch = line.match(/^deny\s+([\d.]+)\s*;$/);
    if (denyMatch) {
      hasDeny = true;
      deniedIp = denyMatch[1];
      if (deniedIp !== "198.51.100.1") {
        errors.push(`Wrong denied IP: ${deniedIp}. Expected 198.51.100.1`);
        hasDeny = false;
      }
    }
  }

  if (!hasProxy && !lines.some(l => l.includes("proxy_pass"))) {
    errors.push('Missing: proxy_pass http://10.0.0.1:8080;');
  }
  if (!hasDeny && !lines.some(l => l.includes("deny"))) {
    errors.push('Missing: deny 198.51.100.1;');
  }

  return { hasProxy, hasDeny, proxyTarget, deniedIp, errors };
}

// ─── Network Visualizer SVG ────────────────────────────────────────────────────

function NetworkSVG({
  deployed,
  hasProxy,
  hasDeny,
  packetType,
  packetState,
}: {
  deployed: boolean;
  hasProxy: boolean;
  hasDeny: boolean;
  packetType: PacketType;
  packetState: PacketState;
}) {
  const isPureBlock = packetType === "DDOS" && hasDeny && packetState === "BLOCKED";
  const isFwdGood = packetType === "GOOD" && hasProxy && (packetState === "FORWARDED" || packetState === "RETURNED");

  // Packet positions
  const startX = 80;
  const proxyX = 420;
  const serverX = 720;

  const ddosColor = "#f43f5e";
  const goodColor = "#a78bfa";
  const fwdColor = "#34d399";

  return (
    <svg viewBox="0 0 900 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-net">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridNet" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="420" fill="url(#gridNet)" />

      {/* ── Internet Zone Label ── */}
      <text x={80} y={28} fill="#64748b" fontSize={11} fontWeight="bold" textAnchor="middle">PUBLIC INTERNET</text>

      {/* ── Internet Node ── */}
      <circle cx={80} cy={210} r={45} fill="#0f172a" stroke="#475569" strokeWidth={3}/>
      <text x={80} y={205} fill="#94a3b8" fontSize={11} fontWeight="bold" textAnchor="middle">Client</text>
      <text x={80} y={221} fill="#64748b" fontSize={9} textAnchor="middle">& Attacker</text>

      {/* ── Attacker Callout ── */}
      <rect x={10} y={270} width={140} height={40} rx={6} fill="#1c0a0f" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 3"/>
      <text x={80} y={286} fill="#fb7185" fontSize={9} fontWeight="bold" textAnchor="middle">DDoS: 198.51.100.1</text>
      <text x={80} y={300} fill="#f43f5e" fontSize={8} textAnchor="middle">Attacking Port 22 / Port 3306</text>

      {/* ── NGINX Proxy Box ── */}
      <rect x={350} y={120} width={140} height={180} rx={12}
        fill={deployed ? "#0d0821" : "#0f172a"}
        stroke={deployed ? "#8b5cf6" : "#334155"}
        strokeWidth={deployed ? 4 : 2}
        filter={deployed ? "url(#glow-net)" : undefined}
      />
      <text x={420} y={148} fill={deployed ? "#c4b5fd" : "#475569"} fontSize={13} fontWeight="black" textAnchor="middle">NGINX</text>
      <text x={420} y={165} fill={deployed ? "#7c3aed" : "#334155"} fontSize={10} textAnchor="middle">Reverse Proxy</text>

      {/* Rules Display inside NGINX box */}
      <rect x={360} y={175} width={120} height={55} rx={6} fill="#020617" stroke={hasDeny ? "#f43f5e44" : "#1e293b"} strokeWidth={1}/>
      <text x={368} y={191} fill={hasDeny ? "#fb7185" : "#334155"} fontSize={8} fontFamily="monospace">
        {hasDeny ? "✓ deny 198.51.100.1;" : "deny ???;"}
      </text>
      <text x={368} y={205} fill={hasProxy ? "#34d399" : "#334155"} fontSize={8} fontFamily="monospace">
        {hasProxy ? "✓ proxy_pass" : "proxy_pass ???;"}
      </text>
      <text x={368} y={219} fill={hasProxy ? "#34d399" : "#334155"} fontSize={8} fontFamily="monospace">
        {hasProxy ? "  10.0.0.1:8080;" : ""}
      </text>

      {/* Port indicator */}
      <rect x={360} y={242} width={120} height={22} rx={4} fill={deployed ? "#1e1b4b" : "#0f172a"}/>
      <text x={420} y={257} fill={deployed ? "#818cf8" : "#334155"} fontSize={9} textAnchor="middle" fontFamily="monospace">
        {deployed ? "Port 443 (HTTPS) OPEN" : "Not Deployed"}
      </text>

      {/* ── Backend Server ── */}
      <rect x={650} y={145} width={140} height={130} rx={12}
        fill="#020f07"
        stroke={hasProxy ? "#10b981" : "#1e293b"}
        strokeWidth={hasProxy ? 3 : 1}
      />
      <text x={720} y={175} fill={hasProxy ? "#34d399" : "#475569"} fontSize={13} fontWeight="black" textAnchor="middle">Backend</text>
      <text x={720} y={193} fill="#475569" fontSize={9} textAnchor="middle">10.0.0.1:8080</text>
      <rect x={665} y={205} width={110} height={25} rx={5} fill="#041810"/>
      <text x={720} y={222} fill={hasProxy ? "#10b981" : "#334155"} fontSize={9} textAnchor="middle" fontFamily="monospace">
        {hasProxy ? "HIDDEN from Internet" : "Exposed to Internet"}
      </text>
      <text x={720} y={255} fill="#64748b" fontSize={9} textAnchor="middle">DB / App Server</text>

      {/* ── Connection Lines ── */}
      {/* Internet → NGINX */}
      <line x1={125} y1={210} x2={350} y2={210} stroke={deployed ? "#475569" : "#1e293b"} strokeWidth={2} strokeDasharray="6 4"/>
      {/* NGINX → Backend */}
      <line x1={490} y1={210} x2={650} y2={210} stroke={hasProxy ? "#10b981" : "#1e293b"} strokeWidth={hasProxy ? 3 : 1} strokeDasharray={hasProxy ? "none" : "6 4"}/>

      {/* ── Animated Packets ── */}
      <AnimatePresence>
        {/* DDoS packet flying toward NGINX */}
        {packetType === "DDOS" && (packetState === "FLYING") && (
          <motion.g
            key="ddos-fly"
            initial={{ x: startX + 40, y: 210 }}
            animate={{ x: proxyX - 60, y: 210 }}
            transition={{ duration: 1, ease: "linear" }}
          >
            <rect x={-32} y={-14} width={64} height={28} rx={5} fill={ddosColor} filter="url(#glow-net)"/>
            <text x={0} y={4} fill="#fff" fontSize={9} fontWeight="bold" textAnchor="middle">DDoS Attack</text>
          </motion.g>
        )}

        {/* DDoS BLOCKED at NGINX */}
        {packetType === "DDOS" && packetState === "BLOCKED" && (
          <motion.g key="ddos-blocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <circle cx={proxyX - 10} cy={210} r={22} fill="#1c0214" stroke={ddosColor} strokeWidth={3} filter="url(#glow-net)"/>
            <text x={proxyX - 10} y={205} fill={ddosColor} fontSize={14} fontWeight="black" textAnchor="middle">✕</text>
            <text x={proxyX - 10} y={218} fill="#fb7185" fontSize={8} textAnchor="middle">BLOCKED</text>
          </motion.g>
        )}

        {/* GOOD packet flying toward NGINX */}
        {packetType === "GOOD" && packetState === "FLYING" && (
          <motion.g
            key="good-fly"
            initial={{ x: startX + 40, y: 210 }}
            animate={{ x: proxyX - 60, y: 210 }}
            transition={{ duration: 1, ease: "linear" }}
          >
            <rect x={-32} y={-14} width={64} height={28} rx={5} fill={goodColor} filter="url(#glow-net)"/>
            <text x={0} y={4} fill="#fff" fontSize={9} fontWeight="bold" textAnchor="middle">GET /home</text>
          </motion.g>
        )}

        {/* GOOD → forwarded to backend */}
        {packetType === "GOOD" && packetState === "FORWARDED" && (
          <motion.g
            key="good-fwd"
            initial={{ x: proxyX + 80, y: 210 }}
            animate={{ x: serverX - 50, y: 210 }}
            transition={{ duration: 0.9, ease: "linear" }}
          >
            <rect x={-32} y={-14} width={64} height={28} rx={5} fill={fwdColor} filter="url(#glow-net)"/>
            <text x={0} y={4} fill="#000" fontSize={9} fontWeight="bold" textAnchor="middle">GET /home</text>
          </motion.g>
        )}

        {/* Response returning */}
        {packetType === "GOOD" && packetState === "RETURNED" && (
          <motion.g
            key="good-ret"
            initial={{ x: proxyX + 80, y: 200 }}
            animate={{ x: startX + 50, y: 200 }}
            transition={{ duration: 1.2, ease: "linear" }}
          >
            <rect x={-40} y={-14} width={80} height={28} rx={5} fill={goodColor} filter="url(#glow-net)"/>
            <text x={0} y={4} fill="#fff" fontSize={9} fontWeight="bold" textAnchor="middle">200 OK ✓</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* ── Labels for Private Zone ── */}
      <rect x={640} y={100} width={160} height={18} rx={4} fill="#041810"/>
      <text x={720} y={113} fill="#065f46" fontSize={9} fontWeight="bold" textAnchor="middle">🔒 PRIVATE NETWORK</text>

    </svg>
  );
}

// ─── Hint Box ─────────────────────────────────────────────────────────────────

function HintBox() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-xs text-violet-400 hover:text-violet-200 transition-colors flex items-center gap-1"
      >
        <AlertTriangle size={12}/> {open ? "Hide Hint" : "Show Hint"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2 p-3 bg-violet-950/30 border border-violet-800/40 rounded-lg text-xs text-violet-300 font-mono leading-relaxed"
          >
            <div className="text-violet-200 font-bold mb-1 font-sans">Required rules:</div>
            <div className="text-emerald-400">deny 198.51.100.1;</div>
            <div className="text-emerald-400">proxy_pass http://10.0.0.1:8080;</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const STARTER_CONFIG = `server {
  listen 443;

  location / {
    # Route good traffic to backend
    

    # Block the DDoS attacker
    
  }
}`;

export default function ReverseProxies9() {
  const { reportComplete } = useLMSBridge("reverseproxies9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [config, setConfig] = useState(STARTER_CONFIG);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [deployed, setDeployed] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Packet simulation state
  const [packetType, setPacketType] = useState<PacketType>("DDOS");
  const [packetState, setPacketState] = useState<PacketState>("IDLE");
  const simRef = useRef(false);

  const deployConfig = () => {
    const result = parseNginxConfig(config);
    setParseResult(result);
    if (result.errors.length > 0) {
      playError();
      setDeployed(false);
      return;
    }
    playSuccess();
    setDeployed(true);
    setPacketState("IDLE");
  };

  const simulatePacket = (type: PacketType) => {
    if (!deployed || packetState !== "IDLE" || simRef.current) return;
    simRef.current = true;
    setPacketType(type);
    setPacketState("FLYING");
    playPop();

    if (type === "DDOS" && parseResult?.hasDeny) {
      // Blocked by deny rule
      setTimeout(() => {
        setPacketState("BLOCKED");
        playZap();
        setTimeout(() => { setPacketState("IDLE"); simRef.current = false; }, 1800);
      }, 1100);
    } else if (type === "DDOS" && !parseResult?.hasDeny) {
      // No deny rule — attack gets through
      setTimeout(() => {
        setPacketState("FORWARDED"); // goes to server — bad!
        playError();
        setTimeout(() => { setPacketState("IDLE"); simRef.current = false; }, 1500);
      }, 1100);
    } else if (type === "GOOD" && parseResult?.hasProxy) {
      // Forwarded to backend
      setTimeout(() => {
        setPacketState("FORWARDED");
        playPop();
        setTimeout(() => {
          setPacketState("RETURNED");
          playSuccess();
          setTimeout(() => {
            setPacketState("IDLE");
            simRef.current = false;
            if (!hasWon && parseResult?.hasDeny && parseResult?.hasProxy) {
              setHasWon(true);
              setTimeout(reportComplete, 1500);
            }
          }, 1400);
        }, 1000);
      }, 1100);
    } else {
      setTimeout(() => { setPacketState("IDLE"); simRef.current = false; }, 1200);
    }
  };

  const reset = () => {
    setConfig(STARTER_CONFIG);
    setParseResult(null);
    setDeployed(false);
    setHasWon(false);
    setPacketState("IDLE");
    simRef.current = false;
    playZap();
  };

  const configLines = config.split("\n");

  return (
    <LabShell labId="reverseproxies9" theme="cosmos" title="Reverse Proxies (NGINX)" subtitle="L43 · Network Architecture"
      instruction="Your fragile backend server is at 10.0.0.1:8080. A DDoS attacker at 198.51.100.1 is hammering it. Configure the NGINX Reverse Proxy to: (1) block the attacker's IP, and (2) route good traffic through to the backend. Write the rules, click Deploy, then simulate traffic." compact>

      <Celebration isActive={hasWon} message="Backend Secured! NGINX acts as an armor shield — it is the only server visible to the public internet. Your backend is invisible, and the attacker's IP is permanently denied at the edge before any packet can touch your app." onReplay={reset} />

      <div className="w-full flex flex-col xl:flex-row flex-1 min-h-0 gap-3 pt-1">

        {/* ── LEFT: Config Editor ── */}
        <div className="xl:w-[380px] shrink-0 flex flex-col gap-3">

          {/* Editor Panel */}
          <div className="flex-1 panel-glass rounded-2xl border-violet-900/50 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-violet-900/40 bg-violet-950/20">
              <Terminal size={14} className="text-violet-400"/>
              <span className="text-xs font-bold text-violet-300 font-mono">/etc/nginx/nginx.conf</span>
            </div>

            {/* Line Numbers + Textarea */}
            <div className="flex flex-1 overflow-auto font-mono text-xs">
              {/* Line numbers */}
              <div className="shrink-0 w-8 pt-3 pb-3 text-right pr-2 text-slate-600 select-none leading-[1.6rem] bg-black/20">
                {configLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                value={config}
                onChange={e => { setConfig(e.target.value); setDeployed(false); setParseResult(null); }}
                className="flex-1 resize-none bg-transparent text-green-300 outline-none p-3 leading-[1.6rem] caret-violet-400 min-h-[200px]"
                spellCheck={false}
                style={{ fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: "12px" }}
              />
            </div>

            {/* Hint */}
            <div className="px-4 pb-3">
              <HintBox />
            </div>
          </div>

          {/* Deploy Button */}
          <button
            onClick={deployConfig}
            className="shrink-0 w-full py-3 rounded-xl font-black text-sm bg-violet-600 border-2 border-violet-400 text-white hover:bg-violet-500 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            <Zap size={16}/>
            Deploy Config
          </button>

          {/* Validation Results */}
          <AnimatePresence>
            {parseResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="shrink-0 panel-glass rounded-xl border-violet-900/40 p-3 flex flex-col gap-1.5"
              >
                {parseResult.errors.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle size={14}/> Config valid! NGINX deployed.
                  </div>
                ) : (
                  parseResult.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-rose-400 text-xs">
                      <XCircle size={13} className="shrink-0 mt-0.5"/>
                      <span className="font-mono">{err}</span>
                    </div>
                  ))
                )}
                {parseResult.hasProxy && (
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono">
                    <CheckCircle size={12}/> proxy_pass → {parseResult.proxyTarget}
                  </div>
                )}
                {parseResult.hasDeny && (
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-mono">
                    <Shield size={12}/> deny → {parseResult.deniedIp} (blocked)
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── RIGHT: Network Visualizer + Controls ── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          {/* Traffic Controls */}
          <div className="shrink-0 panel-glass rounded-2xl border-violet-900/40 p-3 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-400 font-bold mr-1">Simulate:</span>
            <button
              onClick={() => simulatePacket("DDOS")}
              disabled={!deployed || packetState !== "IDLE"}
              className="px-4 py-2 rounded-lg text-xs font-black bg-rose-950/60 border border-rose-700/50 text-rose-300 hover:bg-rose-900/60 transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <XCircle size={13}/> Send DDoS Attack
            </button>
            <button
              onClick={() => simulatePacket("GOOD")}
              disabled={!deployed || packetState !== "IDLE"}
              className="px-4 py-2 rounded-lg text-xs font-black bg-violet-950/60 border border-violet-700/50 text-violet-300 hover:bg-violet-900/60 transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <CheckCircle size={13}/> Send Good Request
            </button>
            <div className="ml-auto">
              <button onClick={reset} className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-all">
                <RefreshCcw size={14}/>
              </button>
            </div>
          </div>

          {/* Network SVG */}
          <div className="flex-1 panel-glass rounded-3xl overflow-hidden relative border-violet-900/40 bg-[#030712] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
            <div className="w-full h-full max-h-[420px]">
              <NetworkSVG
                deployed={deployed}
                hasProxy={parseResult?.hasProxy ?? false}
                hasDeny={parseResult?.hasDeny ?? false}
                packetType={packetType}
                packetState={packetState}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className={`shrink-0 rounded-xl p-2.5 text-xs font-mono text-center transition-all ${
            !deployed ? "bg-slate-900/60 text-slate-500 border border-slate-800" :
            packetState === "BLOCKED" ? "bg-rose-950/60 text-rose-300 border border-rose-800/50" :
            packetState === "RETURNED" ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50" :
            "bg-violet-950/40 text-violet-400 border border-violet-800/40"
          }`}>
            {!deployed && "⚙ Write your nginx.conf rules and click Deploy Config"}
            {deployed && packetState === "IDLE" && "✓ NGINX is live — simulate traffic above"}
            {deployed && packetState === "FLYING" && `→ ${packetType === "DDOS" ? "DDoS attack" : "GET request"} traveling to NGINX...`}
            {deployed && packetState === "BLOCKED" && "✕ DDoS IP 198.51.100.1 denied at the edge — backend never saw the packet!"}
            {deployed && packetState === "FORWARDED" && (packetType === "DDOS" ? "⚠ No deny rule — attack reached backend!" : "→ NGINX forwarding to 10.0.0.1:8080...")}
            {deployed && packetState === "RETURNED" && "✓ 200 OK — backend responded safely through NGINX!"}
          </div>

        </div>

      </div>
    </LabShell>
  );
}
