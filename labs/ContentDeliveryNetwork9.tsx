/*
Provides a Grade 9 computing lab visualizing a Content Delivery Network (CDN) with geographic edge caching and zero-crossing data rails.
*/
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import LabShell from "@/components/LabShell";
import { useLabAudio } from "@/hooks/useLabAudio";

interface StationConfig {
  id: string;
  name: string;
  sub: string;
  demand: number;
  row: "upper" | "lower";
  col: "near" | "far";
  delayMs: number;
  buildings: { w: number; h: number; type: "house" | "shop" | "tower" }[];
}

const STATIONS: StationConfig[] = [
  {
    id: "nearby_homes",
    name: "Nearby Homes",
    sub: "Close / Low Latency",
    demand: 2,
    row: "upper",
    col: "near",
    delayMs: 1200,
    buildings: [
      { w: 22, h: 22, type: "house" },
      { w: 24, h: 26, type: "house" },
    ],
  },
  {
    id: "far_north",
    name: "Far North",
    sub: "Distant / High Latency",
    demand: 2,
    row: "upper",
    col: "far",
    delayMs: 2400,
    buildings: [
      { w: 20, h: 22, type: "house" },
      { w: 26, h: 28, type: "house" },
    ],
  },
  {
    id: "busy_town",
    name: "Busy Town",
    sub: "High Traffic Hub",
    demand: 4,
    row: "lower",
    col: "near",
    delayMs: 1400,
    buildings: [
      { w: 22, h: 24, type: "shop" },
      { w: 28, h: 36, type: "tower" },
      { w: 24, h: 28, type: "shop" },
      { w: 20, h: 22, type: "house" },
    ],
  },
  {
    id: "far_south",
    name: "Far South",
    sub: "Distant / High Latency",
    demand: 3,
    row: "lower",
    col: "far",
    delayMs: 2600,
    buildings: [
      { w: 22, h: 24, type: "house" },
      { w: 26, h: 30, type: "shop" },
      { w: 22, h: 22, type: "house" },
    ],
  },
];

export default function ContentDeliveryNetwork9() {
  const { playDrop, playPop, playSuccess, playChime } = useLabAudio();

  // Location map: drive_1, drive_2, drive_3 -> 'origin_1' | 'origin_2' | 'origin_3' | station_id
  const [driveLocations, setDriveLocations] = useState<Record<string, string | null>>({
    drive_1: "origin_1",
    drive_2: "origin_2",
    drive_3: "origin_3",
  });

  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const [selectedDrive, setSelectedDrive] = useState<string | null>(null);

  // Stations currently undergoing the one-time data sync journey
  const [syncingStations, setSyncingStations] = useState<Set<string>>(new Set());
  // Stations that just received a drive (kinetic bounce)
  const [impactStations, setImpactStations] = useState<Set<string>>(new Set());
  // Stations that are fully synced and operational
  const [syncedStations, setSyncedStations] = useState<Set<string>>(new Set());

  const [completed, setCompleted] = useState(false);

  // SVG Rail coordinate anchors
  const [railCoords, setRailCoords] = useState<{
    serverUpper: { x: number; y: number };
    serverLower: { x: number; y: number };
    stations: Record<string, { x: number; y: number }>;
  }>({
    serverUpper: { x: 0, y: 0 },
    serverLower: { x: 0, y: 0 },
    stations: {},
  });

  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Recalculate rail coordinates on resize
  useEffect(() => {
    const updateCoords = () => {
      const sup = nodeRefs.current["server_upper_port"];
      const slow = nodeRefs.current["server_lower_port"];
      if (!sup || !slow) return;

      const supRect = sup.getBoundingClientRect();
      const slowRect = slow.getBoundingClientRect();

      const newCoords: any = {
        serverUpper: { x: supRect.right, y: supRect.top + supRect.height / 2 },
        serverLower: { x: slowRect.right, y: slowRect.top + slowRect.height / 2 },
        stations: {},
      };

      STATIONS.forEach((st) => {
        const sRef = nodeRefs.current[`station_${st.id}`];
        if (sRef) {
          const sRect = sRef.getBoundingClientRect();
          newCoords.stations[st.id] = { x: sRect.left, y: sRect.top + sRect.height / 2 };
        }
      });

      setRailCoords(newCoords);
    };

    const observer = new ResizeObserver(updateCoords);
    Object.values(nodeRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });

    updateCoords();
    window.addEventListener("resize", updateCoords);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateCoords);
    };
  }, []);

  const cachedCount = Object.values(driveLocations).filter(
    (loc) => typeof loc === "string" && (loc.startsWith("nearby_") || loc === "far_north" || loc === "busy_town" || loc === "far_south")
  ).length;

  // Wait Gauge Angle: 150 deg (Deep Red) -> 90 deg (Amber) -> 40 deg -> 0 deg (Emerald Green)
  const targetNeedleAngle = Math.max(0, 150 - cachedCount * 50);

  // Victory check when all 3 available copies are deployed
  useEffect(() => {
    if (cachedCount === 3 && !completed) {
      const allSynced = STATIONS.filter((st) =>
        Object.values(driveLocations).includes(st.id)
      ).every((st) => syncedStations.has(st.id));

      if (allSynced) {
        setCompleted(true);
        setTimeout(() => playSuccess(), 1200);
      }
    }
  }, [cachedCount, syncedStations, driveLocations, completed, playSuccess]);

  const handleDrag = (_: any, info: PanInfo) => {
    let hovered: string | null = null;
    STATIONS.forEach((st) => {
      const ref = nodeRefs.current[`socket_${st.id}`];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (
          info.point.x >= rect.left - 20 &&
          info.point.x <= rect.right + 20 &&
          info.point.y >= rect.top - 20 &&
          info.point.y <= rect.bottom + 20
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
          info.point.x >= rect.left - 10 &&
          info.point.x <= rect.right + 10 &&
          info.point.y >= rect.top - 10 &&
          info.point.y <= rect.bottom + 10
        ) {
          hovered = id;
        }
      }
    });

    if (hovered !== activeDropZone) setActiveDropZone(hovered);
  };

  const handleDragEnd = (driveId: string) => {
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

    // Disallow dropping into a station that already holds a drive
    if (Object.values(driveLocations).includes(targetZone) && targetZone !== "origin_1" && targetZone !== "origin_2" && targetZone !== "origin_3") {
      return;
    }

    playDrop();
    setDriveLocations((prev) => ({ ...prev, [driveId]: targetZone }));

    // If placed in an Edge Station, trigger physical bounce and one-time copy journey
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

      // Begin one-time copy journey
      setSyncingStations((prev) => new Set(prev).add(targetStation));
      playChime();

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
      // If returned to origin, un-sync that station
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
      instruction="Drag memory canisters from the Main Server into regional edge stations to serve users locally."
      hint="Notice how Busy Town and Nearby Homes are closer, while Far North and Far South take longer rails. Place 3 copies to bring the wait gauge into the green!"
      bgOverride="bg-sky-50"
      onReset={() => {
        setDriveLocations({ drive_1: "origin_1", drive_2: "origin_2", drive_3: "origin_3" });
        setSyncingStations(new Set());
        setSyncedStations(new Set());
        setCompleted(false);
      }}
    >
      {/* Ambient sky landscape background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[25%] w-48 h-16 bg-white/60 rounded-full blur-2xl"></div>
        <div className="absolute top-[40%] right-[15%] w-72 h-24 bg-sky-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[5%] left-[40%] w-60 h-20 bg-emerald-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* Main World Surface */}
      <div className="flex-1 w-full flex flex-row items-stretch justify-between relative z-10 min-h-0 px-2 sm:px-4 md:px-8 gap-3 sm:gap-6">
        
        {/* SVG DATA HIGHWAYS (Zero Crossing Routing) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="railGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {STATIONS.map((station) => {
            const end = railCoords.stations[station.id];
            const start = station.row === "upper" ? railCoords.serverUpper : railCoords.serverLower;
            if (!start || !end || start.x === 0 || end.x === 0) return null;

            const isCached = Object.values(driveLocations).includes(station.id);
            const isSyncing = syncingStations.has(station.id);
            const isFullyActive = isCached && syncedStations.has(station.id);

            const dx = end.x - start.x;
            const dy = end.y - start.y;

            // Direct smooth curved bezier rail
            const railPath = `M ${start.x} ${start.y} Q ${start.x + dx * 0.45} ${start.y + dy * 0.1} ${end.x} ${end.y}`;
            const reverseRailPath = `M ${end.x} ${end.y} Q ${start.x + dx * 0.45} ${start.y + dy * 0.1} ${start.x} ${start.y}`;

            const journeySec = station.delayMs / 1000;

            return (
              <g key={`rail-${station.id}`}>
                {/* Physical Rail Steel Bed */}
                <path d={railPath} fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                <path d={railPath} fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />

                {/* Status Highway Line */}
                <path
                  d={railPath}
                  fill="none"
                  stroke={isFullyActive ? "#a7f3d0" : isSyncing ? "#38bdf8" : "#fde68a"}
                  strokeWidth="2.5"
                  strokeDasharray={isFullyActive ? "6 6" : isSyncing ? "none" : "4 4"}
                  className={!isFullyActive && !isSyncing ? "animate-[dash_1s_linear_infinite]" : ""}
                />

                {/* 1. Un-Cached Traffic: Slow Amber Requests to Origin */}
                {!isCached && (
                  <>
                    <circle r="4.5" fill="#f59e0b" filter="url(#glowAmber)">
                      <animateMotion dur={`${journeySec * 1.5}s`} repeatCount="indefinite" path={reverseRailPath} />
                    </circle>
                    <circle r="4" fill="#38bdf8">
                      <animateMotion dur={`${journeySec * 1.5}s`} repeatCount="indefinite" path={railPath} begin={`${journeySec * 0.75}s`} />
                    </circle>
                  </>
                )}

                {/* 2. One-Time Copy Journey: Supercharged Cyan Capsule */}
                {isSyncing && (
                  <g filter="url(#glowCyan)">
                    <circle r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2">
                      <animateMotion dur={`${journeySec}s`} repeatCount="1" path={railPath} fill="freeze" />
                    </circle>
                    <circle r="4" fill="#38bdf8">
                      <animateMotion dur={`${journeySec}s`} repeatCount="1" path={railPath} fill="freeze" />
                    </circle>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* ── WEST: Main Server Depot ── */}
        <div className="w-[280px] sm:w-[300px] md:w-[320px] flex items-center justify-center z-20 h-full shrink-0">
          <MainServerDepot
            needleAngle={targetNeedleAngle}
            driveLocations={driveLocations}
            activeDropZone={activeDropZone}
            selectedDrive={selectedDrive}
            nodeRefs={nodeRefs}
            availableCopies={availableCopies}
            cachedCount={cachedCount}
            onSlotClick={handleSlotClick}
            setSelectedDrive={setSelectedDrive}
            handleDrag={handleDrag}
            handleDragEnd={handleDragEnd}
            playPop={playPop}
          />
        </div>

        {/* ── EAST: 2x2 Geographic Regional Matrix ── */}
        <div className="flex-1 flex flex-col justify-between py-1 h-full min-h-0 z-10 pl-2 sm:pl-4">
          
          {/* Upper Row: Nearby Homes (Near) & Far North (Distant) */}
          <div className="flex-1 flex flex-row items-center justify-between gap-3 sm:gap-6 min-h-0">
            {STATIONS.filter((s) => s.row === "upper").map((station) => (
              <StationNode
                key={station.id}
                station={station}
                isCached={Object.values(driveLocations).includes(station.id)}
                isHovered={activeDropZone === station.id}
                isSyncing={syncingStations.has(station.id)}
                isSynced={syncedStations.has(station.id)}
                isImpact={impactStations.has(station.id)}
                driveId={Object.keys(driveLocations).find((k) => driveLocations[k] === station.id)}
                nodeRefs={nodeRefs}
                selectedDrive={selectedDrive}
                onSlotClick={() => handleSlotClick(station.id)}
                setSelectedDrive={setSelectedDrive}
                handleDrag={handleDrag}
                handleDragEnd={handleDragEnd}
                playPop={playPop}
              />
            ))}
          </div>

          {/* Lower Row: Busy Town (Near) & Far South (Distant) */}
          <div className="flex-1 flex flex-row items-center justify-between gap-3 sm:gap-6 min-h-0 pt-2">
            {STATIONS.filter((s) => s.row === "lower").map((station) => (
              <StationNode
                key={station.id}
                station={station}
                isCached={Object.values(driveLocations).includes(station.id)}
                isHovered={activeDropZone === station.id}
                isSyncing={syncingStations.has(station.id)}
                isSynced={syncedStations.has(station.id)}
                isImpact={impactStations.has(station.id)}
                driveId={Object.keys(driveLocations).find((k) => driveLocations[k] === station.id)}
                nodeRefs={nodeRefs}
                selectedDrive={selectedDrive}
                onSlotClick={() => handleSlotClick(station.id)}
                setSelectedDrive={setSelectedDrive}
                handleDrag={handleDrag}
                handleDragEnd={handleDragEnd}
                playPop={playPop}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Signature Victory Modal */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-sky-950/40 backdrop-blur-sm pointer-events-none"
          >
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md text-center border-4 border-emerald-400 pointer-events-auto mx-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <svg viewBox="0 0 24 24" width="36" height="36" stroke="#10b981" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1">Global Wait Eliminated!</h2>
              <p className="text-slate-600 font-medium text-sm sm:text-base">
                Congrats! You have deployed regional caches to deliver content directly at the edge.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes dash { to { stroke-dashoffset: -20; } }
          @keyframes conveyorMove { to { background-position: -32px 0; } }
          @keyframes fanSpin { to { transform: rotate(360deg); } }
        `,
      }} />
    </LabShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Main Server Depot (Western Anchor Machine)
// ─────────────────────────────────────────────────────────────────────────────

function MainServerDepot({
  needleAngle,
  driveLocations,
  activeDropZone,
  selectedDrive,
  nodeRefs,
  availableCopies,
  cachedCount,
  onSlotClick,
  setSelectedDrive,
  handleDrag,
  handleDragEnd,
  playPop,
}: any) {
  const isOverloaded = cachedCount < 2;

  return (
    <div
      ref={(el) => { nodeRefs.current.server = el; }}
      className="relative w-full h-full min-h-0 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 border-4 sm:border-8 border-slate-400 shadow-2xl p-2 sm:p-3 flex flex-col items-center justify-between z-20 overflow-hidden"
    >
      {/* Output Port Markers (for SVG Rails) */}
      <div
        ref={(el) => { nodeRefs.current.server_upper_port = el; }}
        className="absolute right-0 top-[28%] w-3 h-5 bg-slate-700 rounded-l-md border-y border-l border-slate-400 z-30"
      />
      <div
        ref={(el) => { nodeRefs.current.server_lower_port = el; }}
        className="absolute right-0 top-[72%] w-3 h-5 bg-slate-700 rounded-l-md border-y border-l border-slate-400 z-30"
      />

      {/* Top Machine Trim with Rotating Cooling Fans */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-slate-800 flex items-center justify-between px-3 border-b-2 border-slate-700">
        <div className="flex items-center gap-2">
          {/* Fan 1 */}
          <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-cyan-400 animate-[fanSpin_0.8s_linear_infinite]">
              <path d="M10 10 L10 2 A3 3 0 0 1 13 4 Z M10 10 L18 10 A3 3 0 0 1 16 13 Z M10 10 L10 18 A3 3 0 0 1 7 16 Z M10 10 L2 10 A3 3 0 0 1 4 7 Z" />
            </svg>
          </div>
          {/* Fan 2 */}
          <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-cyan-400 animate-[fanSpin_0.8s_linear_infinite]">
              <path d="M10 10 L10 2 A3 3 0 0 1 13 4 Z M10 10 L18 10 A3 3 0 0 1 16 13 Z M10 10 L10 18 A3 3 0 0 1 7 16 Z M10 10 L2 10 A3 3 0 0 1 4 7 Z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isOverloaded ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
          <span className="text-[9px] font-mono font-bold text-slate-300 tracking-wider">ORIGIN_DEPOT</span>
        </div>
      </div>

      <div className="mt-7 w-full flex flex-col items-center">
        <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-widest leading-none">MAIN SERVER</h2>
      </div>

      {/* Prominent Origin Dial Gauge */}
      <div className="w-full bg-white/90 p-2 rounded-xl border-2 border-slate-300 shadow-inner flex flex-col items-center my-1 relative">
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-0.5">WAITING TIME</div>

        <svg viewBox="0 0 120 65" className="w-28 sm:w-36 overflow-visible">
          {/* Outer Gauge Track */}
          <path d="M 15,60 A 45,45 0 0 1 105,60" fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
          {/* Green Zone (Fast) */}
          <path d="M 15,60 A 45,45 0 0 1 42,27" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
          {/* Amber Zone (Moderate) */}
          <path d="M 42,27 A 45,45 0 0 1 78,27" fill="none" stroke="#f59e0b" strokeWidth="10" />
          {/* Red Zone (Overloaded) */}
          <path d="M 78,27 A 45,45 0 0 1 105,60" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />

          {/* Pivot & Needle */}
          <motion.g
            animate={{ rotate: needleAngle }}
            style={{ transformOrigin: "60px 60px" }}
            transition={{ type: "spring", stiffness: 45, damping: 12 }}
          >
            <polygon points="57,60 63,60 60.5,18 59.5,18" fill="#1e293b" />
            <line x1="60" y1="60" x2="60" y2="16" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="60" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
          </motion.g>
        </svg>

        <div className="flex justify-between w-full px-4 text-[8px] font-bold text-slate-500 mt-[-4px]">
          <span className="text-emerald-600">FAST</span>
          <span className="text-amber-600">DELAY</span>
          <span className="text-red-600">HEAVY</span>
        </div>
      </div>

      {/* Physical Request Conveyor Belt */}
      <div className="w-full bg-slate-800 rounded-lg p-1.5 border border-slate-600 my-1 shadow-inner flex flex-col justify-center">
        <div className="flex justify-between items-center px-1 mb-1">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">REQUEST QUEUE</span>
          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${isOverloaded ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            {4 - cachedCount} REMOTE REQS
          </span>
        </div>

        {/* Animated conveyor track with accumulation capsules */}
        <div className="h-6 bg-slate-950 rounded border border-slate-700 relative overflow-hidden flex items-center px-1.5 gap-1.5">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, #38bdf8 8px, #38bdf8 16px)",
              animation: isOverloaded ? "conveyorMove 1.2s linear infinite" : "conveyorMove 4s linear infinite",
            }}
          />

          {/* Physical Amber Request Capsules */}
          {Array.from({ length: 4 - cachedCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="h-3.5 px-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full border border-amber-300 shadow-[0_0_6px_#f59e0b] flex items-center justify-center shrink-0 z-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-100 animate-pulse" />
            </motion.div>
          ))}

          {cachedCount === 3 && (
            <span className="text-[8px] font-mono text-emerald-400 font-bold mx-auto z-10">QUEUE CLEARED (OFFLOADED)</span>
          )}
        </div>
      </div>

      {/* 3 Canister Docking Bays */}
      <div className="w-full bg-slate-300/80 p-2 rounded-xl border-t-2 border-slate-400 flex flex-col items-center">
        <div className="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          STORAGE CANISTERS ({availableCopies}/3 READY)
        </div>

        <div className="flex flex-row justify-center gap-3 w-full">
          {["origin_1", "origin_2", "origin_3"].map((id) => {
            const isHovered = activeDropZone === id;
            const driveId = Object.keys(driveLocations).find((k) => driveLocations[k] === id);

            return (
              <div
                key={id}
                ref={(el) => { nodeRefs.current[id] = el; }}
                onClick={() => onSlotClick(id)}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-lg border-2 transition-all flex items-center justify-center relative shadow-inner ${
                  isHovered
                    ? "border-cyan-400 bg-cyan-100/60 scale-105"
                    : "border-slate-400 bg-slate-200"
                }`}
              >
                {!driveId && (
                  <div className="flex flex-col items-center gap-1 opacity-40">
                    <div className="w-4 h-1 bg-slate-600 rounded-full" />
                    <div className="w-4 h-1 bg-slate-600 rounded-full" />
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
// COMPONENT: Regional Station Node (Edge Tower & City Settlement)
// ─────────────────────────────────────────────────────────────────────────────

function StationNode({
  station,
  isCached,
  isHovered,
  isSyncing,
  isSynced,
  isImpact,
  driveId,
  nodeRefs,
  selectedDrive,
  onSlotClick,
  setSelectedDrive,
  handleDrag,
  handleDragEnd,
  playPop,
}: any) {
  const hasDrive = !!driveId;
  const isFullyActive = isCached && isSynced;

  return (
    <div
      ref={(el) => { nodeRefs.current[`station_${station.id}`] = el; }}
      className="flex-1 flex flex-row items-center justify-start gap-2 sm:gap-3 min-h-0 bg-white/70 backdrop-blur-sm p-1.5 sm:p-2 rounded-2xl border-2 border-slate-200/80 shadow-md relative"
    >
      {/* Station Mechanical Body */}
      <motion.div
        animate={isImpact ? { y: [0, 4, -2, 0], scale: [1, 0.96, 1.02, 1] } : {}}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center relative shrink-0"
      >
        {/* Deploying Satellite Dish */}
        <div className="relative w-8 h-6 flex items-center justify-center">
          <div className="w-1 h-3 bg-slate-600 rounded-t-sm" />
          <motion.div
            className={`absolute top-0 w-6 h-3 rounded-t-full border-2 ${
              isFullyActive
                ? "bg-emerald-400 border-emerald-600 shadow-[0_0_8px_#10b981]"
                : "bg-slate-400 border-slate-500"
            }`}
            animate={{ rotate: isFullyActive ? [0, 15, -15, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-800 rounded-full" />
          </motion.div>
        </div>

        {/* Station Chassis */}
        <div
          className={`w-28 sm:w-32 rounded-xl border-3 p-1.5 flex flex-col items-center justify-between relative shadow-lg transition-colors duration-500 ${
            isFullyActive
              ? "bg-white border-emerald-400 shadow-emerald-100"
              : isSyncing
              ? "bg-sky-50 border-cyan-400 animate-pulse"
              : "bg-slate-100 border-slate-300"
          }`}
        >
          {/* Station Title & Latency Subtitle */}
          <div className="w-full text-center mb-1">
            <h3 className={`text-[10px] sm:text-[11px] font-black uppercase leading-tight ${isFullyActive ? "text-emerald-700" : "text-slate-700"}`}>
              {station.name}
            </h3>
            <span className="text-[8px] font-semibold text-slate-500">{station.sub}</span>
          </div>

          {/* Deep Canister Socket */}
          <div
            ref={(el) => { nodeRefs.current[`socket_${station.id}`] = el; }}
            onClick={onSlotClick}
            className={`w-12 h-14 sm:w-14 sm:h-16 rounded-lg border-2 transition-all flex items-center justify-center relative shadow-inner overflow-hidden ${
              isHovered
                ? "border-cyan-400 bg-cyan-100 scale-105 shadow-[0_0_12px_#38bdf8]"
                : hasDrive
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-400 bg-slate-200"
            }`}
          >
            {/* Magnetic Contact Pins */}
            {!hasDrive && (
              <div className="absolute inset-0 flex flex-col justify-between p-1.5 opacity-50">
                <div className="w-full h-1 bg-amber-500/60 rounded-full animate-pulse" />
                <div className="w-full h-1 bg-amber-500/60 rounded-full animate-pulse" />
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
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              />
            )}

            {/* Syncing Overlay */}
            <AnimatePresence>
              {isSyncing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-cyan-500/80 backdrop-blur-xs flex flex-col items-center justify-center z-30"
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-[7px] font-mono text-white font-black mt-1">SYNCING</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dynamic Mechanical Status Plate */}
          <div className="w-full mt-1.5">
            <div
              className={`w-full py-0.5 px-1 rounded text-center font-mono text-[7px] sm:text-[8px] font-black tracking-tight border ${
                isFullyActive
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : isSyncing
                  ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                  : "bg-slate-200 text-slate-600 border-slate-300"
              }`}
            >
              {isFullyActive ? "CACHE HIT: LOCAL" : isSyncing ? "SYNCING COPY..." : "NO COPY: VIA ORIGIN"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Local Delivery Rail & City Settlement */}
      <div className="flex-1 flex flex-row items-center gap-1 sm:gap-2 h-full min-w-0 pl-1">
        
        {/* Local Delivery Rail */}
        <div className="relative w-6 sm:w-10 h-3 flex items-center">
          {/* Physical rail track */}
          <div className={`w-full h-1.5 rounded-full ${isFullyActive ? "bg-emerald-300 shadow-[0_0_8px_#10b981]" : "bg-slate-300"}`} />
          {/* Animated high-speed delivery pulse when cached */}
          {isFullyActive && (
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"
              animate={{ left: ["0%", "85%"] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
            />
          )}
        </div>

        {/* City Settlement Buildings */}
        <div className="flex flex-row items-end gap-1.5 pb-1">
          {station.buildings.map((b: any, idx: number) => (
            <div
              key={idx}
              style={{ width: b.w, height: b.h }}
              className={`rounded-t-sm border relative transition-all duration-500 flex flex-col justify-between p-0.5 ${
                isFullyActive
                  ? "bg-gradient-to-t from-emerald-100 to-white border-emerald-400 shadow-md"
                  : "bg-gradient-to-t from-slate-200 to-slate-100 border-slate-300"
              }`}
            >
              {/* Roof styling */}
              <div className={`w-full h-1 rounded-t-xs ${isFullyActive ? "bg-emerald-500" : "bg-slate-400"}`} />

              {/* Glowing Windows */}
              <div className="flex justify-around items-center w-full px-0.5 my-auto">
                <div className={`w-1.5 h-1.5 rounded-xs transition-colors duration-500 ${isFullyActive ? "bg-amber-300 shadow-[0_0_4px_#fde047]" : "bg-slate-400"}`} />
                <div className={`w-1.5 h-1.5 rounded-xs transition-colors duration-500 ${isFullyActive ? "bg-amber-300 shadow-[0_0_4px_#fde047]" : "bg-slate-400"}`} />
              </div>

              {/* Door */}
              <div className={`w-2 h-2.5 mx-auto rounded-t-xs ${isFullyActive ? "bg-emerald-700" : "bg-slate-500"}`} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Draggable Memory Canister
// ─────────────────────────────────────────────────────────────────────────────

interface CanisterProps {
  id: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDrag: (e: any, info: PanInfo) => void;
  onDragEnd: (id: string) => void;
}

function MemoryCanister({ id, isSelected, onClick, onDrag, onDragEnd }: CanisterProps) {
  return (
    <motion.div
      layoutId={`canister-${id}`}
      drag
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.05}
      onDrag={onDrag}
      onDragEnd={() => onDragEnd(id)}
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ scale: 1.18, rotate: -4, zIndex: 50, cursor: "grabbing" }}
      className={`absolute w-10 h-13 sm:w-11 sm:h-14 rounded-lg cursor-grab flex flex-col items-center justify-between shadow-xl border-2 z-20 overflow-hidden ${
        isSelected
          ? "border-cyan-400 shadow-[0_0_16px_rgba(56,189,248,0.8)] z-30"
          : "border-slate-500 bg-white"
      }`}
    >
      {/* Knurled Orange Grip Handle */}
      <div className="w-full h-3 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 border-b border-orange-700 flex items-center justify-center">
        <div className="w-4 h-1 bg-orange-200 rounded-full opacity-80" />
      </div>

      {/* Transparent Pressurized Glass Chamber */}
      <div className="w-full flex-1 bg-sky-50/90 flex flex-col items-center justify-center p-0.5 relative">
        <div className="w-full h-full rounded-sm bg-gradient-to-b from-cyan-400 to-cyan-500 shadow-[0_0_8px_#38bdf8] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
        </div>
      </div>

      {/* Gold Connector Contact Pins */}
      <div className="w-full h-2.5 bg-slate-800 flex justify-around items-center px-1 border-t border-slate-600">
        <div className="w-1 h-1.5 bg-amber-300 rounded-xs" />
        <div className="w-1 h-1.5 bg-amber-300 rounded-xs" />
        <div className="w-1 h-1.5 bg-amber-300 rounded-xs" />
      </div>
    </motion.div>
  );
}
