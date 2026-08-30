"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Bomb, Heart, RefreshCcw, Plus, Minus, ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NodeType = "lb" | "app" | "db";
type NodeStatus = "HEALTHY" | "DEAD";

interface ServerNode {
  id: string;
  type: NodeType;
  label: string;
  status: NodeStatus;
  x: number;
  y: number;
}

interface ArchConfig {
  lbCount: number;
  appCount: number;
  dbCount: number;
}

// ─── Build configuration to nodes collection ────────────────────────────────────────

function buildNodes(cfg: ArchConfig): ServerNode[] {
  const nodes: ServerNode[] = [];
  const pad = 80;
  const colW = 220;

  // Load Balancers (col 1)
  for (let i = 0; i < cfg.lbCount; i++) {
    const spacing = 280 / (cfg.lbCount + 1);
    nodes.push({ id: `lb${i}`, type: "lb", label: `LB ${i + 1}`, status: "HEALTHY", x: pad + colW * 0, y: 80 + spacing * (i + 1) });
  }
  // App Servers (col 2)
  for (let i = 0; i < cfg.appCount; i++) {
    const spacing = 280 / (cfg.appCount + 1);
    nodes.push({ id: `app${i}`, type: "app", label: `App ${i + 1}`, status: "HEALTHY", x: pad + colW * 1, y: 80 + spacing * (i + 1) });
  }
  // Databases (col 3)
  for (let i = 0; i < cfg.dbCount; i++) {
    const spacing = 280 / (cfg.dbCount + 1);
    nodes.push({ id: `db${i}`, type: "db", label: `DB ${i + 1}`, status: "HEALTHY", x: pad + colW * 2, y: 80 + spacing * (i + 1) });
  }
  return nodes;
}

const TYPE_COLORS: Record<NodeType, { stroke: string; fill: string; label: string }> = {
  lb:  { stroke: "#6366f1", fill: "#1e1b4b", label: "Load Balancer" },
  app: { stroke: "#0ea5e9", fill: "#0c1a2e", label: "App Server" },
  db:  { stroke: "#10b981", fill: "#064e3b", label: "Database" },
};

// ─── SVG Visualizer ────────────────────────────────────────────────────────────

function ArchSVG({
  nodes,
  bombTarget,
}: {
  nodes: ServerNode[];
  bombTarget: string | null;
}) {
  const lbs  = nodes.filter(n => n.type === "lb");
  const apps = nodes.filter(n => n.type === "app");
  const dbs  = nodes.filter(n => n.type === "db");

  const healthyLbs  = lbs.filter(n => n.status === "HEALTHY");
  const healthyApps = apps.filter(n => n.status === "HEALTHY");
  const healthyDbs  = dbs.filter(n => n.status === "HEALTHY");

  const isUp = healthyLbs.length > 0 && healthyApps.length > 0 && healthyDbs.length > 0;

  // Connection lines between healthy nodes
  const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  if (healthyLbs.length > 0 && healthyApps.length > 0) {
    healthyLbs.forEach(lb => {
      healthyApps.forEach((app, i) => {
        if (i < 2) lines.push({ x1: lb.x + 50, y1: lb.y, x2: app.x - 50, y2: app.y, key: `${lb.id}-${app.id}` });
      });
    });
  }
  if (healthyApps.length > 0 && healthyDbs.length > 0) {
    healthyApps.forEach(app => {
      healthyDbs.forEach((db, i) => {
        if (i < 2) lines.push({ x1: app.x + 50, y1: app.y, x2: db.x - 50, y2: db.y, key: `${app.id}-${db.id}` });
      });
    });
  }

  return (
    <svg viewBox="0 0 760 440" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-chaos2">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridCh" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.4"/>
        </pattern>
      </defs>

      <rect width="760" height="440" fill="url(#gridCh)"/>

      {/* Column labels */}
      <text x={80} y={50} fill="#4338ca" fontSize={11} fontWeight="bold" textAnchor="middle" fontFamily="monospace">LOAD BALANCERS</text>
      <text x={300} y={50} fill="#0369a1" fontSize={11} fontWeight="bold" textAnchor="middle" fontFamily="monospace">APP SERVERS</text>
      <text x={520} y={50} fill="#065f46" fontSize={11} fontWeight="bold" textAnchor="middle" fontFamily="monospace">DATABASES</text>

      {/* Client arrow */}
      <text x={10} y={230} fill="#475569" fontSize={10} textAnchor="start">Users →</text>
      <line x1={55} y1={225} x2={80 - 50} y2={225} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 3"/>

      {/* Traffic lines */}
      {lines.map(l => (
        <motion.line
          key={l.key}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={isUp ? "#10b981" : "#1e293b"}
          strokeWidth={isUp ? 2.5 : 1}
          strokeDasharray={isUp ? "8 4" : "4 4"}
          opacity={isUp ? 0.7 : 0.2}
          filter={isUp ? "url(#glow-chaos2)" : undefined}
        />
      ))}

      {/* Nodes */}
      {nodes.map(node => {
        const col = TYPE_COLORS[node.type];
        const isDead = node.status === "DEAD";
        const isBombing = bombTarget === node.id;
        return (
          <motion.g
            key={node.id}
            animate={{ opacity: isDead ? 0.35 : 1, scale: isDead ? 0.88 : isBombing ? 1.06 : 1 }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          >
            <rect
              x={node.x - 50} y={node.y - 25}
              width={100} height={50} rx={10}
              fill={isDead ? "#1c0a0f" : col.fill}
              stroke={isDead ? "#f43f5e" : col.stroke}
              strokeWidth={isDead ? 3 : 2.5}
              filter={!isDead && !isBombing ? "url(#glow-chaos2)" : undefined}
            />
            <text x={node.x} y={node.y - 4} fill={isDead ? "#fb7185" : "#fff"} fontSize={11} fontWeight="bold" textAnchor="middle">{node.label}</text>
            {isDead && <text x={node.x} y={node.y + 12} fill="#f43f5e" fontSize={9} fontWeight="bold" textAnchor="middle">DEAD </text>}
            {!isDead && isBombing && <text x={node.x} y={node.y + 12} fill="#f59e0b" fontSize={9} fontWeight="black" textAnchor="middle" className="animate-pulse">TARGET</text>}
            {!isDead && !isBombing && <text x={node.x} y={node.y + 12} fill="#34d399" fontSize={8} textAnchor="middle">HEALTHY</text>}
          </motion.g>
        );
      })}

      {/* Outage overlay */}
      {!isUp && nodes.length > 0 && (
        <g>
          <rect x={0} y={0} width={760} height={440} fill="rgba(0,0,0,0.7)"/>
          <text x={380} y={210} fill="#f43f5e" fontSize={28} fontWeight="black" textAnchor="middle" filter="url(#glow-chaos2)"> SYSTEM DOWN</text>
          <text x={380} y={240} fill="#fb7185" fontSize={14} textAnchor="middle">Single point of failure eliminated all traffic</text>
        </g>
      )}
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ChaosEngineering9() {
  const { reportComplete } = useLMSBridge("chaosengineering9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [cfg, setCfg] = useState<ArchConfig>({ lbCount: 1, appCount: 1, dbCount: 1 });
  const [phase, setPhase] = useState<"BUILD" | "CHAOS">("BUILD");
  const [nodes, setNodes] = useState<ServerNode[]>([]);
  const [bombTarget, setBombTarget] = useState<string | null>(null);
  const [kills, setKills] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  const activeNodes = nodes.filter(n => n.status === "HEALTHY");
  const deadNodes = nodes.filter(n => n.status === "DEAD");
  const lbs  = nodes.filter(n => n.type === "lb");
  const apps = nodes.filter(n => n.type === "app");
  const dbs  = nodes.filter(n => n.type === "db");
  const isUp = lbs.some(n => n.status === "HEALTHY") && apps.some(n => n.status === "HEALTHY") && dbs.some(n => n.status === "HEALTHY");

  const deployArch = () => {
    setNodes(buildNodes(cfg));
    setPhase("CHAOS");
    setKills(0);
    setBombTarget(null);
    playZap();
  };

  const unleashChaos = () => {
    if (!isUp) return;
    const healthy = nodes.filter(n => n.status === "HEALTHY");
    if (healthy.length === 0) return;
    const target = healthy[Math.floor(Math.random() * healthy.length)];
    setBombTarget(target.id);
    playPop();

    setTimeout(() => {
      setBombTarget(null);
      setNodes(prev => prev.map(n => n.id === target.id ? { ...n, status: "DEAD" } : n));
      playError();
      const newKills = kills + 1;
      setKills(newKills);

      // Win: survived 3 kills with redundant setup
      if (newKills >= 3 && isUp && !hasWon) {
        setTimeout(() => {
          const stillUp = nodes.some(n => n.type === "lb" && n.status === "HEALTHY" && n.id !== target.id) &&
                          nodes.some(n => n.type === "app" && n.status === "HEALTHY" && n.id !== target.id) &&
                          nodes.some(n => n.type === "db" && n.status === "HEALTHY" && n.id !== target.id);
          if (stillUp) {
            setHasWon(true);
            playSuccess();
            setTimeout(reportComplete, 1500);
          }
        }, 300);
      }
    }, 700);
  };

  const reset = () => {
    setPhase("BUILD");
    setNodes([]);
    setKills(0);
    setBombTarget(null);
    setHasWon(false);
    playZap();
  };

  const adjust = (key: keyof ArchConfig, delta: number) => {
    setCfg(prev => ({
      ...prev,
      [key]: Math.max(1, Math.min(3, prev[key] + delta)),
    }));
    playPop();
  };

  const redundancyScore = cfg.lbCount + cfg.appCount + cfg.dbCount;
  const hasRedundancy = cfg.lbCount > 1 || cfg.appCount > 1 || cfg.dbCount > 1;

  return (
    <LabShell labId="chaosengineering9" theme="garden" title="Chaos Engineering & Redundancy" subtitle="L48 · System Reliability"
      instruction="Netflix's 'Chaos Monkey' deliberately kills random servers to ensure systems survive failures. First, design your architecture by choosing how many of each server tier to deploy. Then unleash chaos — see if your architecture survives! Single nodes = single point of failure = system down." compact>

      <Celebration isActive={hasWon} message="System Resilient! By building with redundancy (multiple nodes per tier), the system routes around failures automatically. If you had only 1 of each node, a single kill would cause a global outage. Netflix calls this 'fault tolerance' — designing for failure." onReplay={reset} />

      <div className="w-full flex flex-col xl:flex-row flex-1 min-h-0 gap-3 pt-1">

        {/* ── LEFT: Controls ── */}
        <div className="xl:w-[280px] shrink-0 flex flex-col gap-3">

          {phase === "BUILD" ? (
            <>
              {/* Architecture Builder */}
              <div className="panel-glass rounded-2xl border-violet-900/40 p-4 flex flex-col gap-4">
                <div className="text-xs font-bold text-violet-300"> Design Your Architecture</div>

                {(["lbCount", "appCount", "dbCount"] as const).map(key => {
                  const labels = { lbCount: "Load Balancers", appCount: "App Servers", dbCount: "Databases" };
                  const colors = { lbCount: "#6366f1", appCount: "#0ea5e9", dbCount: "#10b981" };
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="flex-1 text-xs font-bold" style={{ color: colors[key] }}>{labels[key]}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => adjust(key, -1)} disabled={cfg[key] <= 1} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-30 flex items-center justify-center">
                          <Minus size={11}/>
                        </button>
                        <div className="w-8 text-center font-black text-white text-lg tabular-nums">{cfg[key]}</div>
                        <button onClick={() => adjust(key, 1)} disabled={cfg[key] >= 3} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-30 flex items-center justify-center">
                          <Plus size={11}/>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Redundancy indicator */}
                <div className={`p-2.5 rounded-xl border text-xs ${hasRedundancy ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-400" : "bg-rose-950/30 border-rose-800/40 text-rose-400"}`}>
                  {hasRedundancy
                    ? <span className="flex items-center gap-1.5"><CheckCircle size={12}/> Redundant architecture — can survive failures</span>
                    : <span className="flex items-center gap-1.5"><AlertTriangle size={12}/> Single points of failure — one kill = outage!</span>
                  }
                </div>
              </div>

              <button
                onClick={deployArch}
                className="w-full py-3 rounded-xl font-black text-sm bg-violet-600 border-2 border-violet-400 text-white hover:bg-violet-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                <ShieldCheck size={16}/> Deploy Architecture →
              </button>
            </>
          ) : (
            <>
              {/* Chaos Controls */}
              <div className="panel-glass rounded-2xl border-orange-900/40 p-4 flex flex-col gap-3">
                <div className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                  <Bomb size={13}/> Chaos Monkey Active
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-400">{activeNodes.length}</div>
                    <div className="text-[9px] text-slate-500">healthy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-rose-400">{deadNodes.length}</div>
                    <div className="text-[9px] text-slate-500">killed</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-black ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                      {isUp ? "UP" : "DOWN"}
                    </div>
                    <div className="text-[9px] text-slate-500">system</div>
                  </div>
                </div>

                <button
                  onClick={unleashChaos}
                  disabled={!isUp || !!bombTarget}
                  className="w-full py-3 rounded-xl font-black text-sm bg-orange-600 border-2 border-orange-400 text-white hover:bg-orange-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                >
                  <Bomb size={16}/> Kill Random Server
                </button>

                {!isUp && (
                  <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-700/50 text-xs text-rose-300 text-center font-bold">
                     System down! {!hasRedundancy && "You had no redundancy."}
                  </div>
                )}
              </div>

              {/* Node Health */}
              <div className="panel-glass rounded-2xl border-slate-800/40 p-3 flex flex-col gap-2">
                <div className="text-xs font-bold text-slate-400">Server Health</div>
                {nodes.map(n => (
                  <div key={n.id} className={`flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded-lg ${n.status === "DEAD" ? "bg-rose-950/30 text-rose-400" : "bg-emerald-950/20 text-emerald-400"}`}>
                    <div className={`w-2 h-2 rounded-full ${n.status === "DEAD" ? "bg-rose-500" : "bg-emerald-500"}`}/>
                    {n.label}
                    <span className="ml-auto text-slate-600">{n.status}</span>
                  </div>
                ))}
              </div>

              <button onClick={reset} className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-all flex items-center justify-center gap-1">
                <RefreshCcw size={12}/> Redesign Architecture
              </button>
            </>
          )}
        </div>

        {/* ── RIGHT: Architecture Visualizer ── */}
        <div className="flex-1 min-h-0 panel-glass rounded-2xl border-orange-900/40 bg-[#030712] overflow-hidden">
          {phase === "BUILD" ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500 p-8">
              <ShieldCheck size={48} strokeWidth={1}/>
              <div className="text-center">
                <div className="text-base font-bold text-slate-300 mb-2">Design your server architecture</div>
                <div className="text-sm text-slate-500">Add redundancy by increasing node counts per tier. With only 1 node per tier, a single server kill causes a total outage.</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-xs mt-2">
                <div className="text-indigo-400 font-bold">{cfg.lbCount}x Load Balancer{cfg.lbCount > 1 ? "s" : ""}</div>
                <div className="text-sky-400 font-bold">{cfg.appCount}x App Server{cfg.appCount > 1 ? "s" : ""}</div>
                <div className="text-emerald-400 font-bold">{cfg.dbCount}x Database{cfg.dbCount > 1 ? "s" : ""}</div>
              </div>
              <div className="text-xs text-slate-600">Total nodes: {cfg.lbCount + cfg.appCount + cfg.dbCount} · Redundancy score: {redundancyScore}/9</div>
            </div>
          ) : (
            <div className="w-full h-full">
              <ArchSVG nodes={nodes} bombTarget={bombTarget} />
            </div>
          )}
        </div>
      </div>
    </LabShell>
  );
}
