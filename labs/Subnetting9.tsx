"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Network,
  SplitSquareHorizontal,
  Zap,
  Timer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Activity,
  Server,
  Laptop,
  RefreshCcw,
  HelpCircle,
  HardDrive,
  Radio,
  Layers,
  Gauge,
  XCircle,
  Cpu,
  CornerDownRight,
  ShieldAlert,
  Send,
} from "lucide-react";

// ─── Network Node Definitions ────────────────────────────────────────────────

interface Workstation {
  id: string;
  name: string;
  dept: "Sales" | "Eng";
  flatIp: string;
  subnetIp: string;
  mac: string;
  x: number;
  y: number;
}

const WORKSTATIONS: Workstation[] = [
  // Subnet A (Sales Dept) - Left Territory
  { id: "pc1", name: "PC-Sales-1", dept: "Sales", flatIp: "192.168.1.10", subnetIp: "192.168.1.10", mac: "00:1A:2B:3C:01", x: 105, y: 135 },
  { id: "pc2", name: "PC-Sales-2", dept: "Sales", flatIp: "192.168.1.20", subnetIp: "192.168.1.20", mac: "00:1A:2B:3C:02", x: 105, y: 285 },
  { id: "pc3", name: "Sales-CRM", dept: "Sales", flatIp: "192.168.1.30", subnetIp: "192.168.1.30", mac: "00:1A:2B:3C:03", x: 225, y: 210 },

  // Subnet B (Engineering Dept) - Right Territory
  { id: "pc4", name: "Dev-Server", dept: "Eng", flatIp: "192.168.1.140", subnetIp: "192.168.1.140", mac: "00:1A:2B:3C:04", x: 475, y: 210 },
  { id: "pc5", name: "PC-Eng-1", dept: "Eng", flatIp: "192.168.1.150", subnetIp: "192.168.1.150", mac: "00:1A:2B:3C:05", x: 595, y: 135 },
  { id: "pc6", name: "DB-Master", dept: "Eng", flatIp: "192.168.1.160", subnetIp: "192.168.1.160", mac: "00:1A:2B:3C:06", x: 595, y: 285 },
];

const TIMER_DURATION_SECONDS = 5 * 60;

export default function Subnetting9() {
  const { reportComplete: _reportComplete } = useLMSBridge("subnetting9");
  const { playPop, playZap, playError, playSuccess, playClick, playChime, playHeavyThud } = useLabAudio();

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLabComplete, setIsLabComplete] = useState(false);

  // Network Architecture State
  const [cidrMask, setCidrMask] = useState<"/24" | "/25">("/24"); // /24 = Flat, /25 = Subnetted
  const isSubnetted = cidrMask === "/25";

  // Traffic Simulation State
  const [activeTraffic, setActiveTraffic] = useState<"IDLE" | "UNICAST_LOCAL" | "STORM" | "UNICAST_CROSS">("IDLE");
  const [stormRipples, setStormRipples] = useState<number[]>([]);
  const [shieldBlocked, setShieldBlocked] = useState(false);

  // Telemetry Metrics
  const [switchBandwidth, setSwitchBandwidth] = useState(0); // 0 to 100%
  const [cpuInterruptLoad, setCpuInterruptLoad] = useState(0); // 0 to 100%
  const [selectedNode, setSelectedNode] = useState<Workstation | null>(null);

  // 7-Stage Pedagogical Steps
  const [steps, setSteps] = useState({
    tryUnicast: false,
    triggerStormFlat: false,
    applySubnet: false,
    triggerStormSubnet: false,
    routeCrossSubnet: false,
    
  });

  // Assessment State
  

  // Timer lifecycle
  useEffect(() => {
    if (timedOut || isLabComplete) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
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
  }, [timedOut, isLabComplete]);

  useEffect(() => {
    if (timedOut && !isLabComplete) {
      _reportComplete({ points: 0 });
    }
  }, [timedOut, isLabComplete, _reportComplete]);


  const reportLabComplete = useCallback(() => {
    setIsLabComplete(true);
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  // Auto-complete lab when all 5 steps are done
  useEffect(() => {
    if (steps.tryUnicast && steps.triggerStormFlat && steps.applySubnet && steps.triggerStormSubnet && steps.routeCrossSubnet && !isLabComplete) {
      setTimeout(reportLabComplete, 1200);
    }
  }, [steps, isLabComplete, reportLabComplete]);


  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  // Action 1: Local Unicast (PC-Sales-1 -> PC-Sales-2)
  const handleSendUnicast = () => {
    if (activeTraffic !== "IDLE") return;
    setActiveTraffic("UNICAST_LOCAL");
    setShieldBlocked(false);
    playZap();

    setSwitchBandwidth(4);
    setCpuInterruptLoad(0);

    setTimeout(() => {
      playSuccess();
      setActiveTraffic("IDLE");
      setSwitchBandwidth(0);
      setSteps((prev) => ({ ...prev, tryUnicast: true }));
    }, 1200);
  };

  // Action 2: Trigger ARP Broadcast Storm
  const handleTriggerBroadcastStorm = () => {
    if (activeTraffic !== "IDLE") return;
    setActiveTraffic("STORM");
    setStormRipples([1, 2, 3]);

    if (!isSubnetted) {
      // Flat network failure: Switch floods every port!
      playError();
      setSwitchBandwidth(100);
      setCpuInterruptLoad(96);
      setShieldBlocked(false);

      setTimeout(() => {
        setActiveTraffic("IDLE");
        setStormRipples([]);
        setSwitchBandwidth(0);
        setCpuInterruptLoad(0);
        setSteps((prev) => ({ ...prev, triggerStormFlat: true }));
      }, 3500);
    } else {
      // Subnetted network: Router blocks storm!
      playError();
      setSwitchBandwidth(35); // Subnet A switch only
      setCpuInterruptLoad(30);

      // Router drops packet at 900ms
      setTimeout(() => {
        playHeavyThud();
        setShieldBlocked(true);
      }, 900);

      setTimeout(() => {
        playSuccess();
        setActiveTraffic("IDLE");
        setStormRipples([]);
        setSwitchBandwidth(0);
        setCpuInterruptLoad(0);
        setSteps((prev) => ({ ...prev, triggerStormSubnet: true }));
      }, 3500);
    }
  };

  // Action 3: Cross-Subnet Routed Unicast (PC-Sales-1 -> Dev-Server)
  const handleSendCrossSubnet = () => {
    if (activeTraffic !== "IDLE") return;
    setActiveTraffic("UNICAST_CROSS");
    setShieldBlocked(false);
    playZap();

    setSwitchBandwidth(12);
    setCpuInterruptLoad(0);

    setTimeout(() => {
      playSuccess();
      setActiveTraffic("IDLE");
      setSwitchBandwidth(0);
      setSteps((prev) => ({ ...prev, routeCrossSubnet: true }));
    }, 1800);
  };

  // Subnet Slicer Toggle
  const handleToggleSubnet = (newMask: "/24" | "/25") => {
    if (cidrMask === newMask || activeTraffic !== "IDLE") return;
    playClick();
    setCidrMask(newMask);
    setShieldBlocked(false);
    if (newMask === "/25") {
      setSteps((prev) => ({ ...prev, applySubnet: true }));
      playZap();
    }
  };

  const handleResetLab = () => {
    playZap();
    setCidrMask("/24");
    setActiveTraffic("IDLE");
    setStormRipples([]);
    setShieldBlocked(false);
    setSwitchBandwidth(0);
    setCpuInterruptLoad(0);
    setSelectedNode(null);
    setSteps({
      tryUnicast: false,
      triggerStormFlat: false,
      applySubnet: false,
      triggerStormSubnet: false,
      routeCrossSubnet: false,
      
    });
    
  };

  // Canvas geometry constants
  const SVG_W = 700;
  const SVG_H = 390;

  // Step counts for mission bar
  const completedCount =
    (steps.tryUnicast ? 1 : 0) +
    (steps.triggerStormFlat ? 1 : 0) +
    (steps.applySubnet ? 1 : 0) +
    (steps.triggerStormSubnet ? 1 : 0) +
    (steps.routeCrossSubnet ? 1 : 0) ;

  return (
    <LabShell
      navExtra={
        !isLabComplete && (
          <div
            className={`flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs sm:text-sm font-bold border shadow-sm ${
              timedOut
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : secondsLeft <= 30
                ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                : "bg-white border-sky-100/80 text-sky-800"
            }`}
          >
            <Timer size={15} strokeWidth={2.5} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      }
      labId="subnetting9"
      theme="ocean"
      title="Subnetting & Broadcast Domains"
      instruction="A flat /24 network is like one giant, noisy room where everyone hears everything. Use the Subnet Slicer to split the network in half. This adds a Router to block the noise and keep the Sales and Engineering departments separated!"
      compact
      onReset={handleResetLab}
    >
      <Celebration
        isActive={isLabComplete}
        message="Great job! You proved that Switches let noisy broadcast traffic go everywhere, but Routers block it. By splitting the network into subnets, you stopped the noise and kept the network running fast!"
        onReplay={handleResetLab}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-2 sm:gap-2.5 max-w-7xl mx-auto">
        {/* ── Top Pedagogical Mission Bar ── */}
        <div className="shrink-0 bg-white/95 backdrop-blur border border-slate-200/90 rounded-xl px-3 py-1.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <Activity size={14} className="text-sky-600" />
              <span>Mission Phase</span>
            </div>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              {completedCount === 5
                ? "All Network Missions Completed!"
                : !steps.tryUnicast
                ? "Step 1: Send a direct message (Unicast) from PC-Sales-1 to PC-Sales-2"
                : !steps.triggerStormFlat
                ? "Step 2: Trigger a Broadcast to see the noise flood the whole network"
                : !steps.applySubnet
                ? "Step 3: Use the Subnet Slicer (/25) to split the network and add a Router"
                : !steps.triggerStormSubnet
                ? "Step 4: Trigger the broadcast again — watch the new Router block the noise!"
                : "Step 5: Send a message to the other subnet (PC-Sales-1 to Dev-Server) through the Router"}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {[
              { id: "s1", done: steps.tryUnicast, label: "Unicast" },
              { id: "s2", done: steps.triggerStormFlat, label: "Storm /24" },
              { id: "s3", done: steps.applySubnet, label: "Subnet /25" },
              { id: "s4", done: steps.triggerStormSubnet, label: "Storm /25" },
              { id: "s5", done: steps.routeCrossSubnet, label: "Route" },
              
            ].map((s, idx) => (
              <div
                key={s.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  s.done
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
                title={s.label}
              >
                {s.done ? <CheckCircle2 size={11} className="text-emerald-600" /> : <span>{idx + 1}</span>}
                <span className="hidden md:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Workstation: Topology Canvas (Left) + NOC Control Deck (Right) ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3">
          {/* ════ LEFT PANE: ENTERPRISE NOC TOPOLOGY MONITOR ════ */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-50 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
            {/* Monitor Header Strip */}
            <div className="shrink-0 px-3 py-1.5 bg-white border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  NOC Live Topology // {isSubnetted ? "Dual Broadcast Domains (/25)" : "Single Broadcast Domain (/24)"}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-slate-600">Mask:</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    isSubnetted ? "bg-emerald-100 text-emerald-800 border border-emerald-800" : "bg-amber-100 text-amber-800 border border-amber-800"
                  }`}
                >
                  {isSubnetted ? "255.255.255.128" : "255.255.255.0"}
                </span>
              </div>
            </div>

            {/* Interactive SVG Network Topology */}
            <div className="flex-1 min-h-0 w-full relative flex items-center justify-center p-1 sm:p-2">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full h-full max-h-[380px] lg:max-h-full drop-shadow-sm"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Glowing Filters */}
                  <filter id="glow-storm" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Blueprint Grid Pattern - Light Theme */}
                  <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f1f5f9" />
                  </radialGradient>
                  <pattern id="grid-noc" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
                  </pattern>
                </defs>

                {/* Blueprint Grid */}
                <rect width={SVG_W} height={SVG_H} fill="url(#bg-glow)" rx="16" />
                <rect width={SVG_W} height={SVG_H} fill="url(#grid-noc)" rx="16" />

                {/* Subnet Department Zones */}
                {!isSubnetted ? (
                  // Flat Network Boundary Container
                  <g>
                    <rect
                      x="40"
                      y="70"
                      width="620"
                      height="290"
                      rx="24"
                      fill="#f8fafc"
                      stroke="#cbd5e1"
                      strokeWidth="3"
                      strokeDasharray="10 10"
                      className="drop-shadow-sm"
                    />
                    <text x="350" y="342" fill="#64748b" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">
                      ONE GIANT BROADCAST DOMAIN (192.168.1.0/24)
                    </text>
                  </g>
                ) : (
                  // Subnetted Dual Department Zones
                  <g>
                    {/* Subnet A (Sales) Zone */}
                    <rect
                      x="40"
                      y="70"
                      width="295"
                      height="290"
                      rx="20"
                      fill="#f0f9ff"
                      stroke="#7dd3fc"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                    />
                    <text x="187" y="92" fill="#0284c7" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">
                      SALES ROOM (192.168.1.0/25)
                    </text>

                    {/* Subnet B (Engineering) Zone */}
                    <rect
                      x="365"
                      y="70"
                      width="295"
                      height="290"
                      rx="20"
                      fill="#faf5ff"
                      stroke="#d8b4fe"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                    />
                    <text x="512" y="92" fill="#7e22ce" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">
                      ENGINEERING ROOM (192.168.1.128/25)
                    </text>

                    {/* Vertical Subnet Divider / Firewall Boundary */}
                    <motion.line
                      x1="350"
                      y1="110"
                      x2="350"
                      y2="360"
                      stroke="#f43f5e"
                      strokeWidth="4"
                      strokeDasharray="6 6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <rect x="300" y="235" width="100" height="22" rx="8" fill="#fff1f2" stroke="#fda4af" strokeWidth="2" />
                    <text x="350" y="250" fill="#e11d48" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                      SOUNDPROOF WALL
                    </text>
                  </g>
                )}

                {/* ── Network Cables (Conduits) ── */}
                {/* When Flat: All cables connect to Central Switch at (350, 210) */}
                {!isSubnetted && (
                  <g stroke="#94a3b8" strokeWidth="3">
                    {WORKSTATIONS.map((w) => (
                      <line key={w.id} x1={w.x} y1={w.y} x2={350} y2={210} />
                    ))}
                  </g>
                )}

                {/* When Subnetted: */}
                {isSubnetted && (
                  <g>
                    {/* Subnet A cables connect to Switch A (187, 180) */}
                    <g stroke="#7dd3fc" strokeWidth="3">
                      <line x1={WORKSTATIONS[0].x} y1={WORKSTATIONS[0].y} x2={187} y2={180} />
                      <line x1={WORKSTATIONS[1].x} y1={WORKSTATIONS[1].y} x2={187} y2={180} />
                      <line x1={WORKSTATIONS[2].x} y1={WORKSTATIONS[2].y} x2={187} y2={180} />
                      {/* Switch A to Router R1 (350, 48) */}
                      <line x1={187} y1={180} x2={350} y2={48} stroke="#34d399" strokeWidth="2.5" strokeDasharray="4 4" />
                    </g>

                    {/* Subnet B cables connect to Switch B (512, 180) */}
                    <g stroke="#d8b4fe" strokeWidth="3">
                      <line x1={WORKSTATIONS[3].x} y1={WORKSTATIONS[3].y} x2={512} y2={180} />
                      <line x1={WORKSTATIONS[4].x} y1={WORKSTATIONS[4].y} x2={512} y2={180} />
                      <line x1={WORKSTATIONS[5].x} y1={WORKSTATIONS[5].y} x2={512} y2={180} />
                      {/* Switch B to Router R1 (350, 48) */}
                      <line x1={512} y1={180} x2={350} y2={48} stroke="#34d399" strokeWidth="2.5" strokeDasharray="4 4" />
                    </g>
                  </g>
                )}

                {/* ── Central Hardware Devices ── */}

                {/* Flat Mode: Central Enterprise Switch at (350, 210) */}
                {!isSubnetted && (
                  <g>
                    <rect x="295" y="185" width="110" height="50" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="3" className="drop-shadow-md" />
                    <rect x="305" y="195" width="90" height="12" rx="3" fill="#1e293b" />
                    <circle cx="315" cy="201" r="2.5" fill="#10b981" />
                    <circle cx="335" cy="201" r="2.5" fill="#10b981" />
                    <circle cx="355" cy="201" r="2.5" fill="#10b981" />
                    <circle cx="375" cy="201" r="2.5" fill="#10b981" />
                    <text x="350" y="224" fill="#94a3b8" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">
                      SWITCH S1
                    </text>
                  </g>
                )}

                {/* Subnetted Mode: Dual Department Switches + Central Router */}
                {isSubnetted && (
                  <g>
                    {/* Switch A (Sales) at (187, 180) */}
                    <rect x="137" y="160" width="100" height="40" rx="10" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2.5" className="drop-shadow-md" />
                    <rect x="147" y="168" width="80" height="10" rx="2" fill="#1e293b" />
                    <circle cx="160" cy="173" r="2" fill="#38bdf8" />
                    <circle cx="187" cy="173" r="2" fill="#38bdf8" />
                    <circle cx="214" cy="173" r="2" fill="#38bdf8" />
                    <text x="187" y="192" fill="#bae6fd" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">
                      SWITCH A
                    </text>

                    {/* Switch B (Engineering) at (512, 180) */}
                    <rect x="462" y="160" width="100" height="40" rx="10" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5" className="drop-shadow-md" />
                    <rect x="472" y="168" width="80" height="10" rx="2" fill="#1e293b" />
                    <circle cx="485" cy="173" r="2" fill="#c084fc" />
                    <circle cx="512" cy="173" r="2" fill="#c084fc" />
                    <circle cx="539" cy="173" r="2" fill="#c084fc" />
                    <text x="512" y="192" fill="#e9d5ff" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">
                      SWITCH B
                    </text>

                    {/* Router R1 (Layer 3 Gateway) at (350, 48) */}
                    <g>
                      <circle cx="350" cy="48" r="30" fill="#0f172a" stroke="#10b981" strokeWidth="3" className="drop-shadow-lg" />
                      {/* Router Arrows */}
                      <path d="M 350 28 L 350 40 M 345 35 L 350 28 L 355 35" fill="none" stroke="#34d399" strokeWidth="2" />
                      <path d="M 350 68 L 350 56 M 345 61 L 350 68 L 355 61" fill="none" stroke="#34d399" strokeWidth="2" />
                      <path d="M 330 48 L 342 48 M 335 43 L 330 48 L 335 53" fill="none" stroke="#34d399" strokeWidth="2" />
                      <path d="M 370 48 L 358 48 M 365 43 L 370 48 L 365 53" fill="none" stroke="#34d399" strokeWidth="2" />
                      <circle cx="350" cy="48" r="8" fill="#10b981" />
                    </g>
                    <rect x="290" y="85" width="120" height="20" rx="8" fill="#064e3b" stroke="#34d399" strokeWidth="2" className="drop-shadow-sm" />
                    <text x="350" y="98" fill="#a7f3d0" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace" letterSpacing="0.5">
                      GW: 192.168.1.1
                    </text>
                  </g>
                )}

                {/* ── Active Traffic Animations ── */}

                {/* Clean Unicast Packet (PC-Sales-1 -> PC-Sales-2) */}
                {activeTraffic === "UNICAST_LOCAL" && (
                  <motion.g
                    initial={{ x: WORKSTATIONS[0].x, y: WORKSTATIONS[0].y }}
                    animate={{
                      x: [WORKSTATIONS[0].x, isSubnetted ? 187 : 350, WORKSTATIONS[1].x],
                      y: [WORKSTATIONS[0].y, isSubnetted ? 180 : 210, WORKSTATIONS[1].y],
                    }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                  >
                    <rect x="-34" y="-12" width="68" height="24" rx="12" fill="#d1fae5" stroke="#10b981" strokeWidth="2" />
                    <text x="0" y="3" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      MESSAGE
                    </text>
                  </motion.g>
                )}

                {/* Cross-Subnet Routed Unicast (PC-1 -> Router R1 -> PC-4) */}
                {activeTraffic === "UNICAST_CROSS" && (
                  <motion.g
                    initial={{ x: WORKSTATIONS[0].x, y: WORKSTATIONS[0].y }}
                    animate={{
                      x: [WORKSTATIONS[0].x, 187, 350, 512, WORKSTATIONS[3].x],
                      y: [WORKSTATIONS[0].y, 180, 48, 180, WORKSTATIONS[3].y],
                    }}
                    transition={{ duration: 1.7, ease: "easeInOut" }}
                  >
                    <rect x="-40" y="-12" width="80" height="24" rx="12" fill="#f0f9ff" stroke="#0ea5e9" strokeWidth="2" />
                    <text x="0" y="3" fill="#0369a1" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      ROUTED MSG
                    </text>
                  </motion.g>
                )}

                {/* Broadcast Storm Waves */}
                {activeTraffic === "STORM" && (
                  <g>
                    {/* Shockwaves radiating from PC-1 */}
                    {stormRipples.map((rId) => (
                      <motion.circle
                        key={rId}
                        cx={WORKSTATIONS[0].x}
                        cy={WORKSTATIONS[0].y}
                        r="30"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3.5"
                        initial={{ r: 10, opacity: 0.9 }}
                        animate={{ r: isSubnetted ? 190 : 450, opacity: 0 }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: rId * 0.4 }}
                        filter="url(#glow-storm)"
                      />
                    ))}

                    {/* Router Blocking Shield Reaction when Subnetted */}
                    {isSubnetted && shieldBlocked && (
                      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <rect x="310" y="40" width="80" height="40" rx="12" fill="#fff1f2" stroke="#e11d48" strokeWidth="2.5" />
                        <text x="350" y="64" fill="#e11d48" fontSize="12" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">
                          BLOCKED!
                        </text>
                      </motion.g>
                    )}
                  </g>
                )}

                {/* ── Workstations (6 Desktop Terminals) ── */}
                {WORKSTATIONS.map((w, idx) => {
                  const isSender = w.id === "pc1";
                  const isRecipient = (activeTraffic === "UNICAST_LOCAL" && w.id === "pc2") || (activeTraffic === "UNICAST_CROSS" && w.id === "pc4");
                  const isHitByStorm = activeTraffic === "STORM" && (!isSubnetted || w.dept === "Sales");
                  const isSafeEng = activeTraffic === "STORM" && isSubnetted && w.dept === "Eng";

                  return (
                    <g
                      key={w.id}
                      className="cursor-pointer transition-transform hover:scale-105"
                      onClick={() => {
                        setSelectedNode(w);
                        playPop();
                      }}
                    >
                      {/* Active Pulsing Halo */}
                      {(isRecipient || isSender) && (
                        <circle cx={w.x} cy={w.y} r="32" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="4 4" />
                      )}

                      {/* Storm Alert Ring */}
                      {isHitByStorm && !isSender && (
                        <circle cx={w.x} cy={w.y} r="32" fill="rgba(244, 63, 94, 0.1)" stroke="#f43f5e" strokeWidth="3" />
                      )}

                      {/* Hardware Vector iMac/Monitor style */}
                      {/* Stand */}
                      <path d={`M ${w.x - 6} ${w.y + 12} L ${w.x + 6} ${w.y + 12} L ${w.x + 10} ${w.y + 22} L ${w.x - 10} ${w.y + 22} Z`} fill="#cbd5e1" />
                      {/* Screen Bezel */}
                      <rect
                        x={w.x - 24}
                        y={w.y - 22}
                        width="48"
                        height="34"
                        rx="4"
                        fill={isHitByStorm ? "#fecdd3" : isSafeEng ? "#d1fae5" : "#e2e8f0"}
                        stroke={isHitByStorm ? "#f43f5e" : isSafeEng ? "#10b981" : w.dept === "Sales" ? "#0ea5e9" : "#a855f7"}
                        strokeWidth="2.5"
                        className="drop-shadow-md"
                      />
                      {/* Screen Display */}
                      <rect
                        x={w.x - 20}
                        y={w.y - 18}
                        width="40"
                        height="22"
                        rx="2"
                        fill={isHitByStorm ? "#e11d48" : isSafeEng ? "#059669" : "#0f172a"}
                      />
                      {/* Code/Line graphics inside screen */}
                      {!isHitByStorm && !isSafeEng && (
                        <g>
                          <line x1={w.x - 16} y1={w.y - 12} x2={w.x - 4} y2={w.y - 12} stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                          <line x1={w.x - 16} y1={w.y - 6} x2={w.x + 4} y2={w.y - 6} stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                          <line x1={w.x - 16} y1={w.y} x2={w.x - 8} y2={w.y} stroke={w.dept === "Sales" ? "#38bdf8" : "#c084fc"} strokeWidth="2" strokeLinecap="round" />
                        </g>
                      )}
                      {isHitByStorm && (
                        <text x={w.x} y={w.y - 2} fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">!</text>
                      )}
                      {isSafeEng && (
                        <path d={`M ${w.x - 4} ${w.y - 6} L ${w.x - 1} ${w.y - 3} L ${w.x + 5} ${w.y - 10}`} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      )}

                      {/* Hostname Tag */}
                      <rect
                        x={w.x - 40}
                        y={w.y + 30}
                        width="80"
                        height="18"
                        rx="6"
                        fill="#f8fafc"
                        stroke="#cbd5e1"
                        strokeWidth="1.5"
                      />
                      <text x={w.x} y={w.y + 42} fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                        {w.name}
                      </text>

                      {/* IP Badge */}
                      <text
                        x={w.x}
                        y={w.y + 60}
                        fill={w.dept === "Sales" ? "#0284c7" : "#7e22ce"}
                        fontSize="9.5"
                        fontWeight="900"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {isSubnetted ? w.subnetIp : w.flatIp}
                      </text>

                      {/* CPU Status Tag during Storm */}
                      {isHitByStorm && !isSender && (
                        <g>
                          <rect x={w.x - 30} y={w.y - 42} width="60" height="15" rx="6" fill="#ef4444" />
                          <text x={w.x} y={w.y - 32} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                            FROZEN!
                          </text>
                        </g>
                      )}

                      {isSafeEng && (
                        <g>
                          <rect x={w.x - 26} y={w.y - 42} width="52" height="15" rx="6" fill="#10b981" />
                          <text x={w.x} y={w.y - 32} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                            SAFE
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Monitor Status Banner */}
            <div className="shrink-0 px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs rounded-b-2xl">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-sky-700 font-bold">
                  <span className="w-3 h-3 rounded-md bg-sky-400 shadow-sm" />
                  <span>Sales Room</span>
                </span>
                <span className="flex items-center gap-2 text-purple-700 font-bold">
                  <span className="w-3 h-3 rounded-md bg-purple-400 shadow-sm" />
                  <span>Engineering Room</span>
                </span>
                <span className="flex items-center gap-2 text-emerald-700 font-bold">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                  <span>Router</span>
                </span>
              </div>
            </div>
          </div>

          {/* ════ RIGHT PANE: NOC CONTROL DECK & TELEMETRY ════ */}
          <div className="lg:col-span-5 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-md p-2.5 sm:p-3 gap-2.5 overflow-y-auto">
            {/* 1. Subnet Slicer Architecture Control */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <SplitSquareHorizontal size={15} className="text-indigo-600" />
                  <span>Network Shape</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleSubnet("/24")}
                  disabled={activeTraffic !== "IDLE"}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border-2 ${
                    cidrMask === "/24"
                      ? "bg-amber-50 border-amber-400 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className={`font-black text-sm mb-0.5 ${cidrMask === "/24" ? "text-amber-900" : "text-slate-700"}`}>Level 1: Flat Network</div>
                  <div className={`text-xs font-medium ${cidrMask === "/24" ? "text-amber-700" : "text-slate-500"}`}>One giant, noisy room</div>
                </button>

                <button
                  onClick={() => handleToggleSubnet("/25")}
                  disabled={activeTraffic !== "IDLE"}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border-2 ${
                    cidrMask === "/25"
                      ? "bg-emerald-50 border-emerald-400 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  } ${!steps.applySubnet && steps.triggerStormFlat ? "ring-4 ring-emerald-200 animate-pulse" : ""}`}
                >
                  <div className={`font-black text-sm mb-0.5 ${cidrMask === "/25" ? "text-emerald-900" : "text-slate-700"}`}>Level 2: Subnetted</div>
                  <div className={`text-xs font-medium ${cidrMask === "/25" ? "text-emerald-700" : "text-slate-500"}`}>Two rooms + Router</div>
                </button>
              </div>
            </div>

            {/* 2. Traffic Generator Actions */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Send size={15} className="text-sky-600" />
                <span>Test the Network</span>
              </span>

              <div className="flex flex-col gap-2">
                {/* Clean Unicast Action */}
                <button
                  onClick={handleSendUnicast}
                  disabled={activeTraffic !== "IDLE"}
                  className={`w-full py-2 px-3 rounded-xl text-[13px] font-bold flex items-center justify-between transition-all cursor-pointer border-2 ${
                    !steps.tryUnicast
                      ? "bg-sky-50 text-sky-900 border-sky-400 shadow-sm animate-pulse"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className={!steps.tryUnicast ? "text-sky-600" : "text-slate-400"} />
                    <span>Send a Direct Message</span>
                  </span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-sky-100 text-sky-800 font-bold">Quiet</span>
                </button>

                {/* Broadcast Storm Action */}
                <button
                  onClick={handleTriggerBroadcastStorm}
                  disabled={activeTraffic !== "IDLE"}
                  className={`w-full py-2 px-3 rounded-xl text-[13px] font-bold flex items-center justify-between transition-all cursor-pointer border-2 ${
                    steps.tryUnicast && !steps.triggerStormFlat && !isSubnetted
                      ? "bg-rose-50 text-rose-900 border-rose-400 shadow-sm animate-pulse"
                      : isSubnetted && !steps.triggerStormSubnet
                      ? "bg-indigo-50 text-indigo-900 border-indigo-400 shadow-sm animate-pulse"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Radio size={16} className={!isSubnetted ? "text-rose-500" : "text-indigo-500"} />
                    <span>Yell a Broadcast Message</span>
                  </span>
                  <span className={`text-[11px] px-2 py-1 rounded-full font-bold ${isSubnetted ? "bg-indigo-100 text-indigo-800" : "bg-rose-100 text-rose-800"}`}>
                    {isSubnetted ? "Blocked by Router" : "Very Noisy!"}
                  </span>
                </button>

                {/* Cross-Subnet Routed Action */}
                {isSubnetted && (
                  <button
                    onClick={handleSendCrossSubnet}
                    disabled={activeTraffic !== "IDLE"}
                    className={`w-full py-2 px-3 rounded-xl text-[13px] font-bold flex items-center justify-between transition-all cursor-pointer border-2 ${
                      steps.triggerStormSubnet && !steps.routeCrossSubnet
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400 shadow-sm animate-pulse"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Zap size={16} className="text-emerald-500" />
                      <span>Message the other Room</span>
                    </span>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">Through Router</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. Live Telemetry Gauges */}
            <div className="grid grid-cols-2 gap-2 shrink-0 mb-0">
              {/* Switch Saturation Meter */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Gauge size={13} className="text-slate-400" />
                  <span>Switch Traffic Jam</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-lg font-black ${
                      switchBandwidth >= 80 ? "text-rose-600" : switchBandwidth > 0 ? "text-amber-500" : "text-slate-800"
                    }`}
                  >
                    {switchBandwidth}%
                  </span>
                  <span className="text-xs font-medium text-slate-500">Full</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-300 ${
                      switchBandwidth >= 80 ? "bg-rose-500" : switchBandwidth > 0 ? "bg-amber-500" : "bg-slate-400"
                    }`}
                    style={{ width: `${switchBandwidth}%` }}
                  />
                </div>
              </div>

              {/* Workstation CPU Interrupt Meter */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Cpu size={13} className="text-slate-400" />
                  <span>Computer Stress</span>
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-lg font-black ${
                      cpuInterruptLoad >= 80 ? "text-rose-600" : cpuInterruptLoad > 0 ? "text-amber-500" : "text-slate-800"
                    }`}
                  >
                    {cpuInterruptLoad}%
                  </span>
                  <span className="text-xs font-medium text-slate-500">Lag</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-300 ${
                      cpuInterruptLoad >= 80 ? "bg-rose-500" : cpuInterruptLoad > 0 ? "bg-amber-500" : "bg-slate-400"
                    }`}
                    style={{ width: `${cpuInterruptLoad}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 4. Dynamic Diagnostic Insight or Selected Device HUD */}
            <div className="flex-1 min-h-[95px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {selectedNode ? (
                  <motion.div
                    key="selected-node"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-2 rounded-xl bg-slate-900 text-white flex flex-col gap-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                      <span>{selectedNode.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{selectedNode.dept} Dept</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-600">IP Address:</span>{" "}
                        <span className="text-emerald-400 font-bold">{isSubnetted ? selectedNode.subnetIp : selectedNode.flatIp}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">MAC:</span> <span className="text-slate-800">{selectedNode.mac}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : activeTraffic === "STORM" ? (
                  <motion.div
                    key="storm-alert"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-2 rounded-xl border flex items-start gap-1.5 ${
                      !isSubnetted
                        ? "bg-rose-50 border-rose-200 text-rose-950"
                        : "bg-indigo-50 border-indigo-200 text-indigo-950"
                    }`}
                  >
                    <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${!isSubnetted ? "text-rose-600" : "text-indigo-600"}`} />
                    <div className="text-xs leading-normal">
                      {!isSubnetted ? (
                        <>
                          <strong>BROADCAST NOISE JAM:</strong> The switch copied the message to every single port. All 6 computers are frozen while they read the unwanted noise!
                        </>
                      ) : (
                        <>
                          <strong>NOISE BLOCKED:</strong> The broadcast flooded Subnet A, but <strong>Router R1 blocked it</strong>. Subnet B stayed completely calm and safe!
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle-guide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-1.5"
                  >
                    <Network size={16} className="text-sky-600 shrink-0" />
                    <div className="text-[11px] leading-relaxed">
                      {!steps.triggerStormFlat ? (
                        <span>
                          <strong>Rule:</strong> In a flat <code>/24</code> network, switches are like open hallways. Click the Broadcast button above to see how a traffic jam happens.
                        </span>
                      ) : !isSubnetted ? (
                        <span>
                          <strong>Insight:</strong> The noise jammed the network! Click <strong>/25 (Subnetted)</strong> to add Router R1, which acts like a soundproof wall.
                        </span>
                      ) : (
                        <span>
                          <strong>Subnet Active:</strong> Router R1 now blocks the noise. Test the broadcast again or send a message across departments.
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            
          </div>
        </div>
      </div>

      {/* Time's Up Modal */}
      {timedOut && !isLabComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm text-center mx-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1.5">Time's Up!</h3>
            <p className="text-sm font-medium text-slate-600 mb-4">You did not complete the lab in time.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-1 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </LabShell>
  );
}
