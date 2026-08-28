/*
Provides a Grade 9 computing lab visualizing a Content Delivery Network (CDN) with pedagogical latency calculations, intelligent cache prioritization guidance, audio feedback, and hardware detailing on the Main Server Depot.
*/
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import LabShell from "@/components/LabShell";
import Celebration from "@/components/Celebration";
import { useLabAudio } from "@/hooks/useLabAudio";
import { useLMSBridge } from "@/hooks/useLMSBridge";

interface StationConfig {
  id: string;
  name: string;
  sub: string;
  demand: number;
  delayMs: number;
  type: "residential" | "metropolis" | "outpost" | "facility";
  sectorTag: string;
  reqLabel: string;
  isNearEdge: boolean;
  latencyBadge: { text: string; bg: string; textCol: string; border: string };
}

const STATIONS: StationConfig[] = [
  {
    id: "nearby_homes",
    name: "Suburban Grid",
    sub: "Low Delay · 12ms",
    demand: 2,
    delayMs: 800,
    type: "residential",
    sectorTag: "SECTOR_A // NEAR_EDGE",
    reqLabel: "Social Stream",
    isNearEdge: true,
    latencyBadge: { text: "12ms · ALREADY FAST", bg: "bg-emerald-100", textCol: "text-emerald-800", border: "border-emerald-300" },
  },
  {
    id: "busy_town",
    name: "Metro Central",
    sub: "High Traffic · Core Hub",
    demand: 4,
    delayMs: 1200,
    type: "metropolis",
    sectorTag: "SECTOR_B // METRO_CORE",
    reqLabel: "4K Video Stream",
    isNearEdge: false,
    latencyBadge: { text: "50ms · HEAVY TRAFFIC", bg: "bg-amber-100", textCol: "text-amber-800", border: "border-amber-300" },
  },
  {
    id: "far_north",
    name: "Northern Hub",
    sub: "High Delay · 180ms",
    demand: 2,
    delayMs: 2400,
    type: "outpost",
    sectorTag: "SECTOR_C // ALPINE_REMOTE",
    reqLabel: "Weather Satellite",
    isNearEdge: false,
    latencyBadge: { text: "180ms · HIGH DELAY", bg: "bg-red-100", textCol: "text-red-800", border: "border-red-300" },
  },
  {
    id: "far_south",
    name: "Southern Port",
    sub: "High Delay · 195ms",
    demand: 3,
    delayMs: 2800,
    type: "facility",
    sectorTag: "SECTOR_D // COASTAL_TERMINAL",
    reqLabel: "Port Cargo Sync",
    isNearEdge: false,
    latencyBadge: { text: "195ms · HIGH DELAY", bg: "bg-red-100", textCol: "text-red-800", border: "border-red-300" },
  },
];

export default function ContentDeliveryNetwork9() {
  const { playDrop, playPop, playSuccess, playChime, playError } = useLabAudio();
  const { reportComplete } = useLMSBridge();

  const [driveLocations, setDriveLocations] = useState<Record<string, string | null>>({
    drive_1: "origin_1",
    drive_2: "origin_2",
    drive_3: "origin_3",
  });

  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const [selectedDrive, setSelectedDrive] = useState<string | null>(null);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [syncingStations, setSyncingStations] = useState<Set<string>>(new Set());
  const [impactStations, setImpactStations] = useState<Set<string>>(new Set());
  const [syncedStations, setSyncedStations] = useState<Set<string>>(new Set());

  const [worldCelebration, setWorldCelebration] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Dynamic SVG 1-to-1 Dual-Lane Rail anchors with dead-level horizontal alignment
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [railCoords, setRailCoords] = useState<{
    serverPorts: Record<string, { x: number; y: number }>;
    stations: Record<string, { x: number; y: number }>;
    stationYs: Record<string, number>;
  }>({
    serverPorts: {},
    stations: {},
    stationYs: {},
  });

  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const updateCoords = () => {
      const container = containerRef.current;
      if (!container) return;

      const cRect = container.getBoundingClientRect();
      const serverRef = nodeRefs.current.server;
      const srvRect = serverRef ? serverRef.getBoundingClientRect() : null;

      const newCoords: any = {
        serverPorts: {},
        stations: {},
        stationYs: {},
      };

      const serverRightX = srvRect ? srvRect.right - cRect.left : 250;

      STATIONS.forEach((st) => {
        const sRef = nodeRefs.current[`station_port_${st.id}`] || nodeRefs.current[`station_card_${st.id}`];
        if (sRef) {
          const sRect = sRef.getBoundingClientRect();
          const targetY = sRect.top - cRect.top + sRect.height * 0.5;
          const targetX = sRect.left - cRect.left;

          newCoords.stations[st.id] = { x: targetX, y: targetY };
          newCoords.serverPorts[st.id] = { x: serverRightX, y: targetY };

          if (srvRect) {
            newCoords.stationYs[st.id] = sRect.top - srvRect.top + sRect.height * 0.5;
          }
        }
      });

      setRailCoords(newCoords);
    };

    const timer = setTimeout(updateCoords, 60);
    const observer = new ResizeObserver(updateCoords);
    if (containerRef.current) observer.observe(containerRef.current);
    Object.values(nodeRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });

    window.addEventListener("resize", updateCoords);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", updateCoords);
    };
  }, []);

  const cachedStationIds = Object.values(driveLocations).filter(
    (loc) => typeof loc === "string" && !loc.startsWith("origin_")
  ) as string[];

  const cachedCount = cachedStationIds.length;

  // Pedagogical Latency Calculation:
  // Baseline = 12ms (Suburban) + 50ms (Metro) + 180ms (North) + 195ms (South) = 437ms
  // Optimal Caching (Metro, North, South) -> Latency = 12ms (Optimal GREEN FAST)
  // Suboptimal Caching (Suburban + 2 others) -> Leaves 180ms or 195ms un-cached!
  const hasSuburban = cachedStationIds.includes("nearby_homes");
  const hasMetro = cachedStationIds.includes("busy_town");
  const hasNorth = cachedStationIds.includes("far_north");
  const hasSouth = cachedStationIds.includes("far_south");

  // Calculate live global average latency in ms
  let liveLatencyMs = 240;
  if (cachedCount === 0) liveLatencyMs = 240;
  else if (cachedCount === 1) {
    liveLatencyMs = hasSuburban ? 228 : hasMetro ? 170 : hasNorth ? 140 : 130;
  } else if (cachedCount === 2) {
    if (hasNorth && hasSouth) liveLatencyMs = 62;
    else if (hasMetro && (hasNorth || hasSouth)) liveLatencyMs = 85;
    else liveLatencyMs = 150;
  } else if (cachedCount === 3) {
    if (hasMetro && hasNorth && hasSouth) liveLatencyMs = 12; // OPTIMAL VICTORY!
    else if (hasSuburban && hasNorth && hasSouth) liveLatencyMs = 50;
    else if (hasSuburban && hasMetro && (hasNorth || hasSouth)) liveLatencyMs = 110;
  }

  // Needle angle mapping: 240ms -> +68° (OVERLOAD), 140ms -> +35°, 60ms -> -10°, 12ms -> -68° (FAST)
  let targetNeedleAngle = 68;
  if (liveLatencyMs <= 15) targetNeedleAngle = -68;
  else if (liveLatencyMs <= 60) targetNeedleAngle = -28;
  else if (liveLatencyMs <= 120) targetNeedleAngle = 18;
  else if (liveLatencyMs <= 180) targetNeedleAngle = 44;
  else targetNeedleAngle = 68;

  // Genuine Victory: Cached 3 stations AND achieved lowest latency (Metro, North, South)
  const isOptimalVictory = cachedCount === 3 && hasMetro && hasNorth && hasSouth;

  useEffect(() => {
    if (isOptimalVictory && !completed && !worldCelebration) {
      const allSynced = cachedStationIds.every((id) => syncedStations.has(id));

      if (allSynced) {
        setWorldCelebration(true);
        setTimeout(() => {
          setCompleted(true);
          playSuccess();
          reportComplete();
        }, 1400);
      }
    }
  }, [isOptimalVictory, syncedStations, cachedStationIds, completed, worldCelebration, playSuccess, reportComplete]);

  const handleDragStart = () => {
    setIsDraggingAny(true);
    setWarningMessage(null);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    let hovered: string | null = null;
    STATIONS.forEach((st) => {
      const ref = nodeRefs.current[`socket_${st.id}`];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (
          info.point.x >= rect.left - 30 &&
          info.point.x <= rect.right + 30 &&
          info.point.y >= rect.top - 30 &&
          info.point.y <= rect.bottom + 30
        ) {
          hovered = st.id;
        }
      }
    });

    ["origin_1", "origin_2", "origin_3"].forEach((id) => {
      const ref = nodeRefs.current[id];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (
          info.point.x >= rect.left - 20 &&
          info.point.x <= rect.right + 20 &&
          info.point.y >= rect.top - 20 &&
          info.point.y <= rect.bottom + 20
        ) {
          hovered = id;
        }
      }
    });

    if (hovered !== activeDropZone) setActiveDropZone(hovered);
  };

  const handleDragEnd = (driveId: string) => {
    setIsDraggingAny(false);
    if (activeDropZone) {
      moveDrive(driveId, activeDropZone);
    }
    setActiveDropZone(null);
  };

  const handleSlotClick = (slotId: string) => {
    if (selectedDrive) {
      moveDrive(selectedDrive, slotId);
      setSelectedDrive(null);
    }
  };

  const moveDrive = (driveId: string, targetZone: string) => {
    const currentLoc = driveLocations[driveId];
    if (currentLoc === targetZone) return;

    if (
      Object.values(driveLocations).includes(targetZone) &&
      targetZone !== "origin_1" &&
      targetZone !== "origin_2" &&
      targetZone !== "origin_3"
    ) {
      return;
    }

    // Pedagogical Check: If student caches Suburban Grid (12ms)
    if (targetZone === "nearby_homes") {
      playError();
      setWarningMessage("Suburban Grid is already at 12ms low delay! Prioritize high-delay stations to reach the green zone.");
    } else {
      setWarningMessage(null);
      playDrop();
    }

    setDriveLocations((prev) => ({ ...prev, [driveId]: targetZone }));

    if (targetZone !== "origin_1" && targetZone !== "origin_2" && targetZone !== "origin_3") {
      const targetStation = targetZone;
      setImpactStations((prev) => new Set(prev).add(targetStation));
      setTimeout(() => {
        setImpactStations((prev) => {
          const next = new Set(prev);
          next.delete(targetStation);
          return next;
        });
      }, 400);

      setSyncingStations((prev) => new Set(prev).add(targetStation));
      if (targetZone !== "nearby_homes") playChime();

      const st = STATIONS.find((s) => s.id === targetStation);
      const journeyDuration = st ? st.delayMs : 1500;

      setTimeout(() => {
        setSyncingStations((prev) => {
          const next = new Set(prev);
          next.delete(targetStation);
          return next;
        });
        setSyncedStations((prev) => new Set(prev).add(targetStation));
        playPop();
      }, journeyDuration);
    } else {
      if (currentLoc && currentLoc !== "origin_1" && currentLoc !== "origin_2" && currentLoc !== "origin_3") {
        setSyncedStations((prev) => {
          const next = new Set(prev);
          next.delete(currentLoc);
          return next;
        });
      }
    }
  };

  const availableCopies = Object.values(driveLocations).filter(
    (loc) => typeof loc === "string" && loc.startsWith("origin_")
  ).length;

  return (
    <LabShell
      labId="cdn-9"
      title="CDN Network Architecture"
      subtitle="Deploy Regional Caches to Reduce Global Wait Time"
      instruction="Drag memory canisters into high-delay regional stations to eliminate network lag."
      hint="Suburban Grid is already close (12ms). Deploy your 3 canisters to Metro Central, Northern Hub, and Southern Port (50–195ms) to bring global waiting time all the way into the green FAST zone!"
      bgOverride="bg-slate-100"
      onReset={() => {
        setDriveLocations({ drive_1: "origin_1", drive_2: "origin_2", drive_3: "origin_3" });
        setSyncingStations(new Set());
        setSyncedStations(new Set());
        setWarningMessage(null);
        setWorldCelebration(false);
        setCompleted(false);
      }}
    >
      {/* ── TECHNICAL MICRO-GRID BLUEPRINT BACKGROUND ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="techGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 5" />
              <circle cx="0" cy="0" r="1.5" fill="#94a3b8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#techGrid)" opacity="0.75" />
        </svg>

        {/* Subtle Central Data Highway Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
          <span className="text-[10px] sm:text-[11px] font-mono font-black text-slate-500 tracking-[0.25em] uppercase">
            HIGH-SPEED FIBER HIGHWAY // 10Gbps FULL-DUPLEX
          </span>
        </div>

        {worldCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-32 h-full bg-emerald-400/25 blur-2xl animate-pulse" />
            <div className="absolute top-0 right-1/4 w-32 h-full bg-cyan-400/25 blur-2xl animate-pulse" />
          </div>
        )}
      </div>

      {/* ── MAIN INTERACTIVE WORLD CONTAINER ── */}
      <div
        ref={containerRef}
        className="flex-1 w-full flex flex-col md:flex-row items-stretch justify-between relative z-10 min-h-0 px-2 sm:px-4 md:px-6 py-1"
      >
        {/* SVG FULL-DUPLEX DUAL-LANE DATA HIGHWAYS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <filter id="boltGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="pulseGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {STATIONS.map((station) => {
            const start = railCoords.serverPorts[station.id];
            const end = railCoords.stations[station.id];
            if (!start || !end || start.x === 0 || end.x === 0) return null;

            const isCached = Object.values(driveLocations).includes(station.id);
            const isSyncing = syncingStations.has(station.id);
            const isFullyActive = isCached && syncedStations.has(station.id);

            const lineY = end.y;

            const txStart = { x: start.x, y: lineY - 4.5 };
            const txEnd = { x: end.x, y: lineY - 4.5 };
            const rxStart = { x: start.x, y: lineY + 4.5 };
            const rxEnd = { x: end.x, y: lineY + 4.5 };

            const txPath = `M ${txEnd.x} ${txEnd.y} L ${txStart.x} ${txStart.y}`;
            const rxPath = `M ${rxStart.x} ${rxStart.y} L ${rxEnd.x} ${rxEnd.y}`;

            const journeySec = station.delayMs / 1000;

            return (
              <g key={`rail-${station.id}`}>
                {/* Outer Heavy Glass Bed Jacket */}
                <path d={txPath} fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
                <path d={rxPath} fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
                <path d={txPath} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
                <path d={rxPath} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />

                {/* 1. UPPER LANE: TX (Upstream Request Lane - Amber) */}
                <path
                  d={txPath}
                  fill="none"
                  stroke={isFullyActive ? "#cbd5e1" : "#f59e0b"}
                  strokeWidth={isFullyActive ? "1.5" : "2.5"}
                  strokeDasharray={isFullyActive ? "4 4" : "6 4"}
                  className={!isFullyActive ? "animate-[dash_0.8s_linear_infinite]" : ""}
                  opacity={isFullyActive ? 0.35 : 1}
                />

                {/* 2. LOWER LANE: RX (Downstream Payload Lane - Cyan Laser) */}
                <path
                  d={rxPath}
                  fill="none"
                  stroke={isFullyActive ? "#cbd5e1" : isSyncing ? "#0284c7" : "#0284c7"}
                  strokeWidth={isFullyActive ? "1.5" : isSyncing ? "4" : "2.5"}
                  strokeDasharray={isFullyActive ? "4 4" : isSyncing ? "none" : "8 4"}
                  className={!isFullyActive && !isSyncing ? "animate-[dash_0.6s_linear_infinite]" : ""}
                  opacity={isFullyActive ? 0.35 : 1}
                />

                {/* Animated Packets during Uncached Origin Fetch */}
                {!isCached && (
                  <>
                    {/* TX: Amber Request Photon moving right to left */}
                    <g filter="url(#pulseGlow)">
                      <circle r="5" fill="#f59e0b">
                        <animateMotion dur={`${journeySec * 1.3}s`} repeatCount="indefinite" path={txPath} />
                      </circle>
                      <circle r="2.5" fill="#ffffff">
                        <animateMotion dur={`${journeySec * 1.3}s`} repeatCount="indefinite" path={txPath} />
                      </circle>
                    </g>

                    {/* RX: Cyan Heavy Payload Photon moving left to right */}
                    <g filter="url(#pulseGlow)">
                      <circle r="5" fill="#0284c7">
                        <animateMotion
                          dur={`${journeySec * 1.3}s`}
                          repeatCount="indefinite"
                          path={rxPath}
                          begin={`${journeySec * 0.65}s`}
                        />
                      </circle>
                      <circle r="2.5" fill="#38bdf8">
                        <animateMotion
                          dur={`${journeySec * 1.3}s`}
                          repeatCount="indefinite"
                          path={rxPath}
                          begin={`${journeySec * 0.65}s`}
                        />
                      </circle>
                    </g>
                  </>
                )}

                {/* High-Velocity Data Sync Surge Shockwave on RX Lane */}
                {isSyncing && (
                  <g filter="url(#boltGlow)">
                    <circle r="9" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5">
                      <animateMotion dur={`${journeySec}s`} repeatCount="1" path={rxPath} fill="freeze" />
                    </circle>
                    <circle r="4.5" fill="#38bdf8">
                      <animateMotion dur={`${journeySec}s`} repeatCount="1" path={rxPath} fill="freeze" />
                    </circle>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* ── LEFT SIDE: Main Server Depot (Tactile Hardware Detailing) ── */}
        <div className="w-full md:w-[245px] lg:w-[265px] xl:w-[285px] flex items-center justify-center z-20 shrink-0 h-full min-h-0">
          <MainServerDepot
            needleAngle={targetNeedleAngle}
            liveLatencyMs={liveLatencyMs}
            driveLocations={driveLocations}
            activeDropZone={activeDropZone}
            selectedDrive={selectedDrive}
            nodeRefs={nodeRefs}
            availableCopies={availableCopies}
            cachedCount={cachedCount}
            onSlotClick={handleSlotClick}
            setSelectedDrive={setSelectedDrive}
            handleDragStart={handleDragStart}
            handleDrag={handleDrag}
            handleDragEnd={handleDragEnd}
            playPop={playPop}
            worldCelebration={worldCelebration}
            stationYs={railCoords.stationYs}
          />
        </div>

        {/* ── RIGHT SIDE: 4 Compact Living Regional Outposts ── */}
        <div className="w-full md:w-[350px] lg:w-[390px] xl:w-[420px] flex flex-col justify-between py-0.5 h-full min-h-0 z-20 gap-2 sm:gap-2.5 shrink-0">
          {STATIONS.map((station) => (
            <VerticalStationModule
              key={station.id}
              station={station}
              isCached={Object.values(driveLocations).includes(station.id)}
              isHovered={activeDropZone === station.id}
              isDraggingAny={isDraggingAny}
              isSyncing={syncingStations.has(station.id)}
              isSynced={syncedStations.has(station.id)}
              isImpact={impactStations.has(station.id)}
              driveId={Object.keys(driveLocations).find((k) => driveLocations[k] === station.id)}
              nodeRefs={nodeRefs}
              selectedDrive={selectedDrive}
              onSlotClick={() => handleSlotClick(station.id)}
              setSelectedDrive={setSelectedDrive}
              handleDragStart={handleDragStart}
              handleDrag={handleDrag}
              handleDragEnd={handleDragEnd}
              playPop={playPop}
              worldCelebration={worldCelebration}
            />
          ))}
        </div>

      </div>

      {/* ── PEDAGOGICAL WARNING BANNER (When student caches Low-Delay station) ── */}
      <AnimatePresence>
        {warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-white font-mono font-bold text-[8.5px] sm:text-[9.5px] px-3 py-1 rounded-full shadow-lg border border-amber-300 flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{warningMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CANONICAL CELEBRATION OVERLAY WITH FULL-SCREEN CONFETTI & PARTICLES ── */}
      <Celebration
        isActive={completed}
        message="Global Latency Eliminated! You strategically deployed regional caches to the highest-lag networks, achieving 12ms optimal edge delivery!"
        onReplay={() => {
          setDriveLocations({ drive_1: "origin_1", drive_2: "origin_2", drive_3: "origin_3" });
          setSyncingStations(new Set());
          setSyncedStations(new Set());
          setWarningMessage(null);
          setWorldCelebration(false);
          setCompleted(false);
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes dash { to { stroke-dashoffset: -20; } }
          @keyframes conveyorTrack { to { background-position: -36px 0; } }
          @keyframes fanRotateFast { to { transform: rotate(360deg); } }
          @keyframes fanRotateSlow { to { transform: rotate(360deg); } }
          @keyframes coolantBubble { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
          @keyframes radarSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes lighthouseBeam { 0%, 100% { opacity: 0.2; transform: scaleX(0.7); } 50% { opacity: 0.9; transform: scaleX(1.15); } }
          @keyframes elevatorMotion { 0%, 100% { transform: translateY(24px); } 50% { transform: translateY(2px); } }
          @keyframes wifiPulse { 0% { opacity: 0.8; transform: scale(0.8); } 100% { opacity: 0; transform: scale(1.6); } }
          @keyframes ledBlink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        `,
      }} />
    </LabShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 1: Western Main Server Depot (Hardware Detailing & Live Latency Readout)
// ─────────────────────────────────────────────────────────────────────────────

function MainServerDepot({
  needleAngle,
  liveLatencyMs,
  driveLocations,
  activeDropZone,
  selectedDrive,
  nodeRefs,
  availableCopies,
  cachedCount,
  onSlotClick,
  setSelectedDrive,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  playPop,
  worldCelebration,
  stationYs,
}: any) {
  const isOverloaded = liveLatencyMs > 100;
  const isCoolAndNominal = liveLatencyMs <= 15;
  const unCachedStations = STATIONS.filter(
    (st) => !Object.values(driveLocations).includes(st.id)
  );

  const fallbackOffsets = ["12%", "37%", "63%", "88%"];

  return (
    <div
      ref={(el) => { nodeRefs.current.server = el; }}
      className={`relative w-full h-full min-h-0 rounded-2xl bg-gradient-to-b from-cyan-950 via-slate-800 to-cyan-900 border-4 shadow-xl p-2 sm:p-2.5 pr-3 flex flex-col justify-between items-center z-20 overflow-visible text-slate-100 transition-all duration-500 ${
        isCoolAndNominal
          ? "border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
          : isOverloaded
          ? "border-cyan-500 shadow-[0_0_22px_rgba(6,182,212,0.35)]"
          : "border-cyan-700 shadow-[0_0_16px_rgba(6,182,212,0.2)]"
      }`}
    >
      {/* 4 Corner Hex Bolt Screws */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-cyan-800 border border-cyan-600 flex items-center justify-center shadow-xs">
        <div className="w-1 h-0.5 bg-cyan-300 rounded-xs" />
      </div>
      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-800 border border-cyan-600 flex items-center justify-center shadow-xs">
        <div className="w-1 h-0.5 bg-cyan-300 rounded-xs" />
      </div>
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-cyan-800 border border-cyan-600 flex items-center justify-center shadow-xs">
        <div className="w-1 h-0.5 bg-cyan-300 rounded-xs" />
      </div>
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-800 border border-cyan-600 flex items-center justify-center shadow-xs">
        <div className="w-1 h-0.5 bg-cyan-300 rounded-xs" />
      </div>

      {/* 4 Dedicated Dual TX/RX Output Connectors Positioned at Dead-Level Station Height */}
      {STATIONS.map((st, idx) => {
        const isStationCached = Object.values(driveLocations).includes(st.id);
        const dynamicY = stationYs[st.id];

        const style = dynamicY !== undefined
          ? { top: `${dynamicY}px`, transform: "translateY(-50%)" }
          : { top: fallbackOffsets[idx], transform: "translateY(-50%)" };

        return (
          <div
            key={`port-${st.id}`}
            ref={(el) => { nodeRefs.current[`server_port_${st.id}`] = el; }}
            style={style}
            className={`absolute right-[-10px] w-4.5 h-6 rounded-r-md border-y border-r flex flex-col justify-between p-0.5 z-30 transition-all ${
              isStationCached
                ? "bg-slate-300 border-slate-400 opacity-60"
                : "bg-cyan-500 border-cyan-400 shadow-[0_0_10px_#38bdf8]"
            }`}
          >
            <div className={`w-1.5 h-1 rounded-full ${isStationCached ? "bg-slate-400" : "bg-amber-300"}`} />
            <div className={`w-1.5 h-1 rounded-full ${isStationCached ? "bg-slate-400" : "bg-cyan-200"}`} />
          </div>
        );
      })}

      {/* Industrial Header with Active Dynamic Cooling Turbines */}
      <div className={`w-full rounded-lg px-2 py-1 border-b-2 shadow-sm flex items-center justify-between text-white shrink-0 transition-colors duration-500 ${
        isCoolAndNominal ? "bg-emerald-600 border-emerald-700" : "bg-sky-600 border-sky-700"
      }`}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-black/20 border border-white/40 flex items-center justify-center overflow-hidden shadow-inner">
            <svg
              viewBox="0 0 20 20"
              className="w-3.5 h-3.5 fill-cyan-200"
              style={{ animation: isOverloaded ? "fanRotateFast 0.4s linear infinite" : "fanRotateSlow 1.8s linear infinite" }}
            >
              <path d="M10 10 L10 2 A3 3 0 0 1 13 4 Z M10 10 L18 10 A3 3 0 0 1 16 13 Z M10 10 L10 18 A3 3 0 0 1 7 16 Z M10 10 L2 10 A3 3 0 0 1 4 7 Z" />
            </svg>
          </div>
          <div className="w-4 h-4 rounded-full bg-black/20 border border-white/40 flex items-center justify-center overflow-hidden shadow-inner">
            <svg
              viewBox="0 0 20 20"
              className="w-3.5 h-3.5 fill-cyan-200"
              style={{ animation: isOverloaded ? "fanRotateFast 0.4s linear infinite" : "fanRotateSlow 1.8s linear infinite" }}
            >
              <path d="M10 10 L10 2 A3 3 0 0 1 13 4 Z M10 10 L18 10 A3 3 0 0 1 16 13 Z M10 10 L10 18 A3 3 0 0 1 7 16 Z M10 10 L2 10 A3 3 0 0 1 4 7 Z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${worldCelebration ? "bg-emerald-300 shadow-[0_0_6px_#10b981]" : isOverloaded ? "bg-red-400 animate-ping" : "bg-emerald-300"}`} />
          <span className="text-[7.5px] sm:text-[8px] font-mono font-bold text-sky-100 tracking-wider">
            {isCoolAndNominal ? "COOL_NOMINAL" : "ORIGIN_DEPOT"}
          </span>
        </div>
      </div>

      <div className="w-full text-center shrink-0">
        <h2 className="text-xs sm:text-sm font-black text-cyan-100 tracking-wider leading-none drop-shadow-sm">
          MAIN SERVER
        </h2>
        <span className="text-[6.5px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mt-0.5">
          CENTRAL ORIGIN // US-WEST 100TB
        </span>
      </div>

      {/* Recessed Dial Gauge with Live Latency Number Readout */}
      <div className="w-full bg-cyan-950/80 p-1 rounded-xl border-2 border-cyan-700 shadow-inner flex flex-col items-center relative shrink-0">
        <div className="text-[8px] sm:text-[9px] font-black text-cyan-300 uppercase tracking-widest mb-0.5">
          WAITING TIME
        </div>

        <svg viewBox="0 0 120 65" className="w-22 sm:w-28 md:w-32 overflow-visible">
          <path d="M 15,60 A 45,45 0 0 1 105,60" fill="none" stroke="#164e63" strokeWidth="14" strokeLinecap="round" />
          <path d="M 15,60 A 45,45 0 0 1 38,24" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
          <path d="M 38,24 A 45,45 0 0 1 82,24" fill="none" stroke="#f59e0b" strokeWidth="10" />
          <path d="M 82,24 A 45,45 0 0 1 105,60" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />

          {/* Needle */}
          <motion.g
            animate={{ rotate: needleAngle }}
            style={{ originX: "60px", originY: "60px", transformBox: "view-box", transformOrigin: "60px 60px" }}
            transition={{ type: "spring", stiffness: 50, damping: 14 }}
          >
            <polygon points="57,60 63,60 60.8,16 59.2,16" fill="#e2e8f0" />
            <line x1="60" y1="60" x2="60" y2="15" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>

          {/* Static Center Pivot Cap */}
          <circle cx="60" cy="60" r="7" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2.5" />
        </svg>

        {/* Live Digital Latency Number Readout */}
        <div className="mt-[-4px] mb-0.5">
          <span className={`text-[8px] sm:text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${
            liveLatencyMs <= 15
              ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-[0_0_8px_#10b981]"
              : liveLatencyMs <= 60
              ? "bg-amber-100 text-amber-800 border-amber-300"
              : "bg-red-100 text-red-800 border-red-300"
          }`}>
            {liveLatencyMs}ms · {liveLatencyMs <= 15 ? "FAST (OPTIMAL)" : liveLatencyMs <= 60 ? "MODERATE" : "OVERLOAD"}
          </span>
        </div>

        <div className="grid grid-cols-3 w-full text-center text-[7px] sm:text-[7.5px] font-black mt-[-2px] tracking-tight">
          <span className="text-emerald-600">FAST</span>
          <span className="text-amber-600">DELAY</span>
          <span className="text-red-600">OVERLOAD</span>
        </div>
      </div>

      {/* Request Queue Belt */}
      <div className="w-full bg-cyan-950/80 rounded-lg p-1.5 border border-cyan-700 shadow-inner flex flex-col justify-center shrink-0">
        <div className="flex justify-between items-center px-1 mb-1">
          <span className="text-[7.5px] sm:text-[8px] font-bold text-cyan-300 uppercase tracking-wider">REQUEST QUEUE</span>
          <span
            className={`text-[7px] sm:text-[7.5px] font-mono font-black px-1.5 py-0.2 rounded ${
              cachedCount === 0
                ? "bg-red-500 text-white shadow-[0_0_6px_#ef4444]"
                : cachedCount === 1
                ? "bg-red-100 text-red-700 border border-red-200"
                : cachedCount === 2
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-emerald-500 text-white shadow-[0_0_6px_#10b981]"
            }`}
          >
            {4 - cachedCount === 0 ? "OFFLOADED" : `${4 - cachedCount} REQS`}
          </span>
        </div>

        <div className="h-6 bg-slate-900 rounded-md border-2 border-slate-700 relative overflow-hidden flex items-center px-1.5 gap-1.5 shadow-inner">
          {/* Left Mechanical Roller */}
          <div className="w-1.5 h-4 bg-slate-600 rounded-xs border-r border-slate-500 shrink-0" />

          {/* Animated Conveyor Track Lines */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, #38bdf8 8px, #38bdf8 16px)",
              animation: isOverloaded ? "conveyorTrack 1s linear infinite" : "conveyorTrack 3.5s linear infinite",
            }}
          />

          {/* Active Request Packets Moving Along Track */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 z-10">
            <AnimatePresence>
              {unCachedStations.map((st) => (
                <motion.div
                  key={`req-${st.id}`}
                  initial={{ scale: 0.5, opacity: 0, x: 10 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0, opacity: 0, y: -10, transition: { duration: 0.3 } }}
                  className="h-3.5 px-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full border border-amber-300 shadow-[0_0_8px_#f59e0b] flex items-center justify-center shrink-0 gap-1"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span className="text-[6px] font-mono font-black text-amber-950 uppercase">{st.name.split(" ")[0]}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {cachedCount === 3 && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[7.5px] font-mono text-emerald-400 font-black mx-auto z-10 tracking-wide"
              >
                ⚡ QUEUE CLEARED (100% EDGE)
              </motion.span>
            )}
          </div>

          {/* Right Mechanical Roller */}
          <div className="w-1.5 h-4 bg-slate-600 rounded-xs border-l border-slate-500 shrink-0" />
        </div>
      </div>

      {/* 3 Canister Bays */}
      <div className="w-full bg-cyan-950/80 p-1.5 rounded-xl border border-cyan-700 flex flex-col items-center shrink-0">
        <div className="text-[8px] sm:text-[8.5px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
          STORAGE CANISTERS ({availableCopies}/3 READY)
        </div>

        <div className="flex flex-row justify-center gap-1.5 sm:gap-2 w-full">
          {["origin_1", "origin_2", "origin_3"].map((id) => {
            const isHovered = activeDropZone === id;
            const driveId = Object.keys(driveLocations).find((k) => driveLocations[k] === id);

            return (
              <div
                key={id}
                ref={(el) => { nodeRefs.current[id] = el; }}
                onClick={() => onSlotClick(id)}
                className={`w-10 h-12 sm:w-11 sm:h-13 md:w-12 md:h-14 rounded-lg border-2 transition-all flex items-center justify-center relative shadow-inner ${
                  isHovered
                    ? "border-cyan-400 bg-cyan-50 scale-105 shadow-[0_0_12px_#38bdf8]"
                    : "border-slate-300 bg-slate-100"
                }`}
              >
                {!driveId && (
                  <div className="flex flex-col items-center gap-1 opacity-30">
                    <div className="w-3 h-1 bg-slate-400 rounded-full" />
                    <div className="w-3 h-1 bg-slate-400 rounded-full" />
                  </div>
                )}

                {driveId && (
                  <MemoryCanister
                    id={driveId}
                    isSelected={selectedDrive === driveId}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setSelectedDrive(driveId === selectedDrive ? null : driveId);
                      playPop();
                    }}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 2: Compact, Balanced Vertical Regional Outpost
// ─────────────────────────────────────────────────────────────────────────────

function VerticalStationModule({
  station,
  isCached,
  isHovered,
  isDraggingAny,
  isSyncing,
  isSynced,
  isImpact,
  driveId,
  nodeRefs,
  selectedDrive,
  onSlotClick,
  setSelectedDrive,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  playPop,
  worldCelebration,
}: any) {
  const hasDrive = !!driveId;
  const isFullyActive = (isCached && isSynced) || worldCelebration;

  return (
    <div
      ref={(el) => { nodeRefs.current[`station_card_${station.id}`] = el; }}
      className={`flex-1 min-h-0 rounded-xl border-2 shadow-sm px-2.5 sm:px-3 py-1 flex flex-row items-center justify-between relative overflow-visible backdrop-blur-xs gap-1.5 transition-all duration-500 ${
        isFullyActive
          ? "bg-gradient-to-r from-emerald-50 via-white to-emerald-50/90 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          : isSyncing
          ? "bg-gradient-to-r from-sky-50 via-white to-sky-50 border-cyan-400 animate-pulse"
          : "bg-white/95 border-slate-200"
      }`}
    >
      {/* Station Receiver Dual-Pin Port on Left Bezel (Dead-Level Centered) */}
      <div
        ref={(el) => { nodeRefs.current[`station_port_${station.id}`] = el; }}
        className={`absolute left-[-10px] top-1/2 -translate-y-1/2 w-4.5 h-6 rounded-l-md border-y border-l flex flex-col justify-between p-0.5 z-30 transition-all ${
          isFullyActive
            ? "bg-slate-300 border-slate-400 opacity-60"
            : "bg-cyan-500 border-cyan-400 shadow-[0_0_8px_#38bdf8]"
        }`}
      >
        <div className={`w-1.5 h-1 rounded-full ${isFullyActive ? "bg-slate-400" : "bg-amber-300"}`} />
        <div className={`w-1.5 h-1 rounded-full ${isFullyActive ? "bg-slate-400" : "bg-cyan-200"}`} />
      </div>

      {/* Top Left: Sector Badge & Mode */}
      <div className="absolute top-1 left-2.5 flex items-center gap-1.5 text-[7px] sm:text-[7.5px] font-mono font-black tracking-wider">
        <span className={isFullyActive ? "text-emerald-700" : "text-slate-500"}>{station.sectorTag}</span>
        <span className={`px-1 py-0.2 rounded font-bold ${isFullyActive ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
          {isFullyActive ? "⚡ 0ms EDGE HIT" : "TX/RX FETCH"}
        </span>
      </div>

      {/* Top Right: High-Contrast Color-Coded Latency Badge */}
      <div className="absolute top-1 right-2.5 z-10">
        <div
          className={`px-1.5 py-0.5 rounded-full text-[6.5px] sm:text-[7.5px] font-mono font-black border shadow-xs ${
            isFullyActive
              ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_8px_#10b981]"
              : `${station.latencyBadge.bg} ${station.latencyBadge.textCol} ${station.latencyBadge.border}`
          }`}
        >
          {isFullyActive ? "0ms · INSTANT" : station.latencyBadge.text}
        </div>
      </div>

      {/* 1. Transmission Machine (Left Side of Card) */}
      <motion.div
        animate={isImpact ? { y: [0, 4, -2, 0], scale: [1, 0.96, 1.02, 1] } : {}}
        transition={{ duration: 0.35 }}
        className="flex flex-row items-center gap-1.5 relative shrink-0 z-20 mt-2"
      >
        {/* Parabolic Dish Antenna */}
        <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex flex-col items-center justify-center">
          <motion.div
            className={`w-6 h-3 sm:w-7 sm:h-3.5 rounded-t-full border flex items-center justify-center relative ${
              isFullyActive
                ? "bg-emerald-400 border-emerald-600 shadow-[0_0_8px_#10b981]"
                : "bg-slate-300 border-slate-400"
            }`}
            animate={{ rotate: isFullyActive ? [0, 20, -20, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          >
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-slate-700 rounded-full" />
          </motion.div>
          <div className="w-0.5 sm:w-1 h-1.5 sm:h-2 bg-slate-500" />
        </div>

        {/* Chassis & Canister Socket */}
        <div
          className={`flex flex-row items-center gap-1.5 rounded-lg border p-1 relative shadow-xs transition-all duration-300 ${
            isFullyActive
              ? "bg-white border-emerald-500 shadow-emerald-100 text-slate-800"
              : isSyncing
              ? "bg-sky-50 border-cyan-500 shadow-cyan-100 text-slate-800 animate-pulse"
              : "bg-slate-50 border-slate-300 text-slate-700"
          }`}
        >
          {/* Socket Chamber with Active Drag-Guidance Ring */}
          <div
            ref={(el) => { nodeRefs.current[`socket_${station.id}`] = el; }}
            onClick={onSlotClick}
            className={`w-9 h-11 sm:w-10 sm:h-12 rounded-lg border-2 transition-all flex items-center justify-center relative shadow-inner overflow-hidden shrink-0 cursor-pointer ${
              isHovered
                ? "border-cyan-500 bg-cyan-50 scale-105 shadow-[0_0_16px_#38bdf8] ring-2 ring-cyan-300"
                : hasDrive
                ? "border-emerald-500 bg-emerald-50 shadow-sm"
                : isDraggingAny
                ? "border-cyan-400 bg-cyan-50/70 ring-2 ring-cyan-400 animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                : "border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-100/60"
            }`}
          >
            {!hasDrive && (
              <div className="flex flex-col items-center justify-center p-0.5 text-center">
                <span className={`text-[7px] font-mono font-black leading-none mb-0.5 ${isDraggingAny ? "text-cyan-700 animate-bounce" : "text-amber-600"}`}>
                  DROP
                </span>
                <span className={`text-[6px] font-mono font-bold leading-none ${isDraggingAny ? "text-cyan-600" : "text-amber-500"}`}>
                  CACHE
                </span>
              </div>
            )}

            {hasDrive && (
              <MemoryCanister
                id={driveId}
                isSelected={selectedDrive === driveId}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setSelectedDrive(driveId === selectedDrive ? null : driveId);
                  playPop();
                }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              />
            )}

            <AnimatePresence>
              {isSyncing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-cyan-500/90 flex flex-col items-center justify-center z-30"
                >
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-[5.5px] font-mono text-white font-black mt-0.5">SYNC</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Station Labels */}
          <div className="flex flex-col justify-center min-w-[75px] sm:min-w-[85px]">
            <h3 className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight ${isFullyActive ? "text-emerald-700" : "text-slate-800"}`}>
              {station.name}
            </h3>
            <span className="text-[6px] sm:text-[6.5px] font-mono font-bold text-slate-500 block leading-tight mt-0.5">{station.sub}</span>
            <div
              className={`mt-0.5 py-0.2 px-1 rounded text-center font-mono text-[6px] sm:text-[6.5px] font-black tracking-tight border ${
                isFullyActive
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : isSyncing
                  ? "bg-sky-50 text-cyan-800 border-cyan-300"
                  : "bg-white text-amber-700 border-slate-200"
              }`}
            >
              {isFullyActive ? "0ms EDGE HIT" : isSyncing ? "SYNCING..." : "FETCHING ORIGIN"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Bolted Local Edge Delivery Pipe */}
      <div className="flex flex-col items-center justify-center px-1 shrink-0">
        <div className={`w-10 sm:w-12 h-2.5 sm:h-3 rounded-full border relative overflow-hidden flex items-center ${isFullyActive ? "bg-emerald-100 border-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-slate-200 border-slate-300"}`}>
          {isFullyActive ? (
            <motion.div
              className="absolute w-3.5 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"
              animate={{ left: ["-15%", "95%"] }}
              transition={{ repeat: Infinity, duration: 0.35, ease: "linear" }}
            />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-auto opacity-40" />
          )}
        </div>
        <span className={`text-[5.5px] sm:text-[6px] font-mono font-bold mt-0.5 ${isFullyActive ? "text-emerald-600 font-black" : "text-slate-400"}`}>
          {isFullyActive ? "EDGE FIBER" : "LOCAL FIBER"}
        </span>
      </div>

      {/* 3. Living Architectural Settlement Vector */}
      <div className="shrink-0 flex items-center justify-end pr-1 mt-2">
        <LivingInfrastructureVector type={station.type} isCached={isFullyActive} />
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 3: Living Grade 9 Architectural Vector Infrastructure
// ─────────────────────────────────────────────────────────────────────────────

function LivingInfrastructureVector({ type, isCached }: { type: string; isCached: boolean }) {
  if (type === "metropolis") {
    return (
      <svg viewBox="0 0 80 52" className="h-[36px] sm:h-[42px] w-auto overflow-visible">
        {/* Left Mid-Rise */}
        <rect x="2" y="16" width="16" height="34" rx="1.5" fill={isCached ? "#0284c7" : "#64748b"} stroke="#0369a1" strokeWidth="1.5" />
        {/* Center Skyscraper */}
        <rect x="22" y="4" width="32" height="46" rx="2" fill={isCached ? "#0369a1" : "#475569"} stroke="#075985" strokeWidth="2" />
        {/* Animated Spire Beacon */}
        <line x1="38" y1="4" x2="38" y2="0" stroke={isCached ? "#10b981" : "#94a3b8"} strokeWidth="1.5" />
        <circle cx="38" cy="0" r="2" fill={isCached ? "#10b981" : "#94a3b8"} className={isCached ? "animate-ping" : ""} />
        {/* Elevator Shaft with Climbing Light Beam */}
        <rect x="36" y="8" width="4" height="38" rx="1" fill="#0f172a" opacity="0.6" />
        <rect
          x="36.5"
          y="8"
          width="3"
          height="8"
          rx="1"
          fill={isCached ? "#38bdf8" : "#f59e0b"}
          style={{ animation: "elevatorMotion 2.2s ease-in-out infinite" }}
        />
        {/* Right High-Rise */}
        <rect x="58" y="20" width="18" height="30" rx="1.5" fill={isCached ? "#0284c7" : "#64748b"} stroke="#0369a1" strokeWidth="1.5" />
        {/* Glowing Windows */}
        {[0, 1, 2, 3].map((row) => (
          <React.Fragment key={`win-${row}`}>
            <rect x="25" y={9 + row * 9} width="5.5" height="4" rx="1" fill={isCached ? "#38bdf8" : "#cbd5e1"} />
            <rect x="44" y={9 + row * 9} width="5.5" height="4" rx="1" fill={isCached ? "#38bdf8" : "#cbd5e1"} />
          </React.Fragment>
        ))}
      </svg>
    );
  }

  if (type === "outpost") {
    return (
      <svg viewBox="0 0 75 50" className="h-[34px] sm:h-[40px] w-auto overflow-visible">
        <rect x="2" y="42" width="70" height="6" rx="1" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
        {/* Geodesic Alpine Dome */}
        <path d="M 8,42 A 22,22 0 0 1 52,42 Z" fill={isCached ? "#0284c7" : "#64748b"} stroke="#0369a1" strokeWidth="2" />
        <line x1="30" y1="20" x2="30" y2="42" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
        <line x1="16" y1="32" x2="44" y2="32" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
        {/* Sweeping Radar Scanner Cone */}
        <g transform="translate(30, 20)">
          <path
            d="M 0,0 L 14,-10 A 18,18 0 0 1 18,0 Z"
            fill={isCached ? "#10b981" : "#38bdf8"}
            opacity="0.5"
            style={{ animation: "radarSweep 3s linear infinite", transformOrigin: "0px 0px" }}
          />
          <circle cx="0" cy="0" r="2" fill="#ffffff" />
        </g>
        {/* Meteorological Tower */}
        <line x1="62" y1="42" x2="62" y2="12" stroke="#475569" strokeWidth="2" />
        <line x1="56" y1="20" x2="68" y2="20" stroke="#475569" strokeWidth="1.5" />
        <circle cx="62" cy="10" r="2.5" fill={isCached ? "#10b981" : "#94a3b8"} className={isCached ? "animate-pulse" : ""} />
      </svg>
    );
  }

  if (type === "facility") {
    return (
      <svg viewBox="0 0 75 50" className="h-[34px] sm:h-[40px] w-auto overflow-visible">
        <rect x="2" y="40" width="70" height="7" rx="1" fill="#475569" stroke="#334155" strokeWidth="1.5" />
        {/* Cargo Terminal */}
        <rect x="6" y="20" width="36" height="20" rx="2" fill={isCached ? "#0f766e" : "#64748b"} stroke="#115e59" strokeWidth="1.5" />
        <rect x="11" y="26" width="9" height="6" rx="1" fill={isCached ? "#5eead4" : "#94a3b8"} />
        <rect x="26" y="26" width="9" height="6" rx="1" fill={isCached ? "#5eead4" : "#94a3b8"} />
        {/* Lighthouse Beacon Tower with Sweeping Light Cone */}
        <polygon points="48,40 52,14 60,14 64,40" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
        <rect x="51" y="9" width="10" height="6" rx="1" fill="#0284c7" />
        <path
          d="M 56,12 L 8,4 L 14,24 Z"
          fill="#fde047"
          opacity="0.35"
          style={{ animation: "lighthouseBeam 3.5s ease-in-out infinite", transformOrigin: "56px 12px" }}
        />
        <circle cx="56" cy="12" r="2.5" fill={isCached ? "#38bdf8" : "#fde047"} className="animate-ping" />
      </svg>
    );
  }

  // Suburban Grid (Residential Cottages with WiFi Radios)
  return (
    <svg viewBox="0 0 75 50" className="h-[34px] sm:h-[40px] w-auto overflow-visible">
      <rect x="2" y="42" width="70" height="6" rx="1" fill="#94a3b8" opacity="0.4" />
      {/* Cottage 1 */}
      <rect x="4" y="20" width="26" height="22" rx="1.5" fill={isCached ? "#3b82f6" : "#64748b"} stroke="#1d4ed8" strokeWidth="1.5" />
      <polygon points="2,20 17,8 32,20" fill={isCached ? "#1d4ed8" : "#475569"} />
      <rect x="8" y="26" width="6" height="6" rx="1" fill={isCached ? "#fde047" : "#cbd5e1"} />
      <rect x="18" y="26" width="6" height="6" rx="1" fill={isCached ? "#fde047" : "#cbd5e1"} />
      {/* WiFi Pulse Ring */}
      <circle
        cx="17"
        cy="8"
        r="6"
        fill="none"
        stroke={isCached ? "#10b981" : "#38bdf8"}
        strokeWidth="1.5"
        style={{ animation: "wifiPulse 1.8s ease-out infinite" }}
      />
      {/* Cottage 2 */}
      <rect x="36" y="14" width="34" height="28" rx="1.5" fill={isCached ? "#2563eb" : "#475569"} stroke="#1e40af" strokeWidth="1.5" />
      <polygon points="34,14 53,2 72,14" fill={isCached ? "#1e40af" : "#334155"} />
      <rect x="42" y="22" width="7" height="6" rx="1" fill={isCached ? "#fde047" : "#cbd5e1"} />
      <rect x="55" y="22" width="7" height="6" rx="1" fill={isCached ? "#fde047" : "#cbd5e1"} />
      <rect x="48" y="32" width="8" height="10" rx="1" fill={isCached ? "#1e40af" : "#334155"} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT 4: Heavy-Duty 3D Memory Canister
// ─────────────────────────────────────────────────────────────────────────────

interface CanisterProps {
  id: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart?: () => void;
  onDrag: (e: any, info: PanInfo) => void;
  onDragEnd: (id: string) => void;
}

function MemoryCanister({ id, isSelected, onClick, onDragStart, onDrag, onDragEnd }: CanisterProps) {
  return (
    <motion.div
      layoutId={`canister-${id}`}
      drag
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.05}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={() => onDragEnd(id)}
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.08, boxShadow: "0 0 18px rgba(56,189,248,0.7)" }}
      whileTap={{ scale: 0.96 }}
      whileDrag={{ scale: 1.22, rotate: -4, zIndex: 50, cursor: "grabbing" }}
      className={`absolute w-8.5 h-10.5 sm:w-9 sm:h-11 md:w-10 md:h-12 rounded-xl cursor-grab flex flex-col items-center justify-between shadow-lg border-2 z-30 overflow-hidden transition-shadow ${
        isSelected
          ? "border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.9)] z-30 bg-white"
          : "border-slate-400 bg-white"
      }`}
    >
      <div className="w-full h-2.5 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 border-b border-orange-700 flex items-center justify-center shadow-inner">
        <div className="w-3.5 h-1 bg-orange-200 rounded-full opacity-85" />
      </div>

      <div className="w-full flex-1 bg-sky-50/90 backdrop-blur-xs flex flex-col items-center justify-center p-0.5 relative">
        <div className="w-full h-full rounded-md bg-gradient-to-b from-cyan-400 via-cyan-300 to-cyan-500 shadow-[0_0_10px_#38bdf8] flex items-center justify-center relative overflow-hidden">
          <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-[coolantBubble_1.2s_easeInOut_infinite]" />
          <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/60 animate-[coolantBubble_0.8s_easeInOut_infinite]" />
        </div>
      </div>

      <div className="w-full h-2 bg-slate-800 flex justify-around items-center px-1 border-t border-slate-600">
        <div className="w-1 h-1.5 bg-amber-400 rounded-xs" />
        <div className="w-1 h-1.5 bg-amber-400 rounded-xs" />
        <div className="w-1 h-1.5 bg-amber-400 rounded-xs" />
      </div>
    </motion.div>
  );
}
