"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Smartphone,
  Globe,
  Cpu,
  Layers,
  Users,
  Unlock,
  Lock,
  Zap,
  RotateCcw,
  Sparkles,
  Check,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Languages,
  Wifi,
  Activity,
  Server
} from "lucide-react";

type MissionId = "ecosystem" | "optimization" | "localization";

interface HardwarePartner {
  id: string;
  name: string;
  region: string;
  usersAdded: number;
}

const PARTNERS: HardwarePartner[] = [
  { id: "samsung", name: "Samsung Galaxy Fleet", region: "Global", usersAdded: 150000000 },
  { id: "xiaomi", name: "Xiaomi & Redmi Series", region: "Asia & Europe", usersAdded: 150000000 },
  { id: "motorola", name: "Motorola Mobility", region: "Americas", usersAdded: 100000000 },
  { id: "transsion", name: "Transsion & Tecno", region: "Africa", usersAdded: 100000000 },
];

interface WorldRegion {
  id: string;
  name: string;
  population: string;
  requiredFeature: string;
  userGain: number;
}

const WORLD_REGIONS: WorldRegion[] = [
  { id: "north_america", name: "North America & Europe", population: "500M", requiredFeature: "Base OS", userGain: 500000000 },
  { id: "asia", name: "Asia-Pacific & India", population: "1.2 Billion", requiredFeature: "Unicode & Indic Scripts", userGain: 1200000000 },
  { id: "africa", name: "Africa & Middle East", population: "800M", requiredFeature: "RTL Script & Offline Mode", userGain: 800000000 },
  { id: "latam", name: "Latin America", population: "500M", requiredFeature: "512MB RAM Optimization", userGain: 500000000 },
];

export default function MobilePlatform37() {
  const { playPop, playSuccess, playError, playZap, playChime } = useLabAudio();
  const { reportComplete } = useLMSBridge();

  const [activeTab, setActiveTab] = useState<MissionId>("ecosystem");

  // Mission 1: Open Ecosystem State
  const [isOpenSource, setIsOpenSource] = useState<boolean>(false);
  const [connectedPartners, setConnectedPartners] = useState<string[]>([]);
  const [m1Completed, setM1Completed] = useState<boolean>(false);

  // Mission 2: RAM Optimization State
  const [osRamMb, setOsRamMb] = useState<number>(1024);
  const [backgroundProcesses, setBackgroundProcesses] = useState<number>(35);
  const [m2Completed, setM2Completed] = useState<boolean>(false);

  // Mission 3: Global Localization State
  const [hasUnicode, setHasUnicode] = useState<boolean>(false);
  const [hasRtlScript, setHasRtlScript] = useState<boolean>(false);
  const [hasOfflineMaps, setHasOfflineMaps] = useState<boolean>(false);
  const [unlockedRegions, setUnlockedRegions] = useState<string[]>(["north_america"]);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate live global users
  const calculateGlobalUsers = () => {
    let count = 50000000; // Base 50M
    if (isOpenSource) {
      count += connectedPartners.length * 112500000;
    }
    if (m2Completed) {
      count += 1000000000;
    }
    if (hasUnicode) count += 500000000;
    if (hasRtlScript) count += 500000000;
    if (hasOfflineMaps) count += 500000000;
    return Math.min(3000000000, count);
  };

  const totalUsers = calculateGlobalUsers();

  // Connect partner in Mission 1
  const togglePartner = (id: string) => {
    if (!isOpenSource) {
      playError();
      return;
    }
    playPop();
    setConnectedPartners((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length === 4 && !m1Completed) {
        setM1Completed(true);
        playSuccess();
        playZap();
      }
      return next;
    });
  };

  // RAM check in Mission 2
  useEffect(() => {
    if (osRamMb <= 512 && backgroundProcesses <= 15 && !m2Completed) {
      setM2Completed(true);
      playSuccess();
      playZap();
    }
  }, [osRamMb, backgroundProcesses, m2Completed]);

  // Localization checks in Mission 3
  const handleToggleLocalization = (type: "unicode" | "rtl" | "offline") => {
    playZap();
    if (type === "unicode") {
      const next = !hasUnicode;
      setHasUnicode(next);
      if (next) {
        setUnlockedRegions((prev) => [...new Set([...prev, "asia"])]);
      }
    } else if (type === "rtl") {
      const next = !hasRtlScript;
      setHasRtlScript(next);
      if (next) {
        setUnlockedRegions((prev) => [...new Set([...prev, "africa"])]);
      }
    } else if (type === "offline") {
      const next = !hasOfflineMaps;
      setHasOfflineMaps(next);
      if (next) {
        setUnlockedRegions((prev) => [...new Set([...prev, "latam"])]);
      }
    }
  };

  const handleFinishLab = () => {
    setIsComplete(true);
    reportComplete();
    playChime();
    playSuccess();
  };

  const handleReset = () => {
    setActiveTab("ecosystem");
    setIsOpenSource(false);
    setConnectedPartners([]);
    setM1Completed(false);
    setOsRamMb(1024);
    setBackgroundProcesses(35);
    setM2Completed(false);
    setHasUnicode(false);
    setHasRtlScript(false);
    setHasOfflineMaps(false);
    setUnlockedRegions(["north_america"]);
    setIsComplete(false);
    playPop();
  };

  const isBudgetPhoneSmooth = osRamMb <= 512 && backgroundProcesses <= 15;
  const budgetPhoneFps = isBudgetPhoneSmooth ? 60 : Math.max(12, Math.round(60 - (osRamMb - 512) / 15));

  return (
    <LabShell
      labId="mobileplatform37"
      title="Sundar Pichai & Mobile Platforms"
      subtitle="Architect an open-source mobile OS, optimize for 512MB RAM, and localize for 3 Billion users worldwide!"
      hint="1. Ecosystem: Switch to Open-Source licensing and connect all 4 global phone manufacturers. 2. Memory: Tune OS RAM to 512MB or less so budget phones hit 60 FPS. 3. Localization: Activate Unicode, RTL scripts, and Offline Maps to bring 3 Billion people online!"
      bgOverride="bg-slate-100"
      compact={true}
      instruction="1. Unlock the Open-Source Android ecosystem to unite phone manufacturers worldwide. 2. Optimize OS RAM consumption to 512MB for affordable budget devices. 3. Activate global Unicode scripts and offline mode to empower 3 Billion users across the planet."
      onReset={handleReset}
    >
      <Celebration
        isActive={isComplete}
        message="3 Billion Users Reached! You mastered Mobile Platform Architecture: By choosing Open-Source licensing, optimizing RAM for 512MB budget phones (Android One), and supporting global Unicode scripts, you democratized modern computing for the entire planet!"
        onReplay={handleReset}
      />

      {/* Full-Bleed Sunlit Machine Floor */}
      <div ref={containerRef} className="flex-1 min-h-0 w-full flex flex-col px-3 sm:px-6 py-2 gap-2.5 relative z-10 select-none">

        {/* Global User Base Header Strip */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-slate-200 shadow-xs gap-2 sm:gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Global Mobile Platform Command
              </h2>
              <p className="text-xs text-slate-500 font-normal leading-normal mt-0.5">
                Active Worldwide Users: <span className="font-bold text-emerald-700">{totalUsers.toLocaleString()}</span> / 3,000,000,000
              </p>
            </div>
          </div>

          {/* Tab Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {[
              { id: "ecosystem", label: "1. Ecosystem", unlocked: true },
              { id: "optimization", label: "2. 512MB RAM", unlocked: m1Completed || true },
              { id: "localization", label: "3. 3 Billion Users", unlocked: m2Completed || true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.unlocked) {
                    setActiveTab(tab.id as MissionId);
                    playPop();
                  }
                }}
                disabled={!tab.unlocked}
                className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-200"
                    : tab.unlocked
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phase Layout */}
        <div className="flex-1 min-h-0 flex flex-col min-w-0">
          <AnimatePresence mode="wait">

            {/* ═══════════════════════════════════════════════════════════
                MISSION 1: OPEN ECOSYSTEM VS CLOSED PLATFORM
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === "ecosystem" && (
              <motion.div
                key="tab-eco"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch"
              >
                {/* Left: Licensing Switch & Platform Visual */}
                <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-emerald-200 p-3.5 shadow-sm flex flex-col justify-between min-h-0 relative">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} className="text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        OS Licensing Model
                      </h3>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      isOpenSource ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}>
                      {isOpenSource ? "Open-Source (Android Model)" : "Closed Proprietary"}
                    </span>
                  </div>

                  {/* Visual Status */}
                  <div className={`my-auto p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center relative ${
                    isOpenSource ? "bg-emerald-50/80 border-emerald-300 shadow-sm" : "bg-slate-50 border-slate-200 shadow-2xs"
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                      isOpenSource ? "bg-emerald-600" : "bg-rose-600"
                    }`}>
                      {isOpenSource ? <Unlock size={28} /> : <Lock size={28} />}
                    </div>

                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        {isOpenSource ? "Open Android Ecosystem Active" : "Closed Proprietary Single-Vendor Lock"}
                      </span>
                      <span className="text-xs text-slate-600 font-medium block mt-0.5">
                        {isOpenSource
                          ? "Global phone makers can freely customize and build Android phones!"
                          : "Only 1 phone maker allowed. Global adoption is blocked at 50M."}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-semibold mt-1">
                      <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md">
                        Connected Manufacturers: {connectedPartners.length} / 4
                      </span>
                    </div>
                  </div>

                  {/* Toggle License Button */}
                  <div className="shrink-0 pt-2 border-t border-emerald-100">
                    <button
                      onClick={() => {
                        setIsOpenSource(!isOpenSource);
                        playZap();
                      }}
                      className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                        isOpenSource
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      }`}
                    >
                      {isOpenSource ? <Unlock size={16} /> : <Lock size={16} />}
                      {isOpenSource ? "Ecosystem Open-Source (Active)" : "Switch to Open-Source Ecosystem"}
                    </button>
                  </div>
                </div>

                {/* Right: Hardware Manufacturer Rack */}
                <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-slate-200 p-3.5 shadow-sm flex flex-col justify-between min-h-0">
                  <div className="border-b border-slate-100 pb-2 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers size={18} className="text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Global Hardware Partners
                      </h3>
                    </div>
                    <span className="text-xs font-normal text-slate-500">
                      {isOpenSource ? "Click to partner" : "Requires Open-Source"}
                    </span>
                  </div>

                  {/* 4 Partner Cards */}
                  <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 my-1.5 overflow-hidden">
                    {PARTNERS.map((partner) => {
                      const isConnected = connectedPartners.includes(partner.id);

                      return (
                        <div
                          key={partner.id}
                          onClick={() => togglePartner(partner.id)}
                          className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 flex-1 min-h-0 ${
                            !isOpenSource
                              ? "bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed"
                              : isConnected
                              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-xs cursor-pointer"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 cursor-pointer shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isConnected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              {isConnected ? <Check size={16} strokeWidth={2.5} /> : <Smartphone size={14} />}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-slate-900 block truncate">{partner.name}</span>
                              <span className="text-[10px] text-slate-600 font-normal block truncate">Region: {partner.region}</span>
                              <span className="text-[9.5px] font-semibold text-emerald-700 block truncate">+{partner.usersAdded.toLocaleString()} Users</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePartner(partner.id);
                            }}
                            disabled={!isOpenSource}
                            className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all shrink-0 ${
                              !isOpenSource
                                ? "bg-slate-200 text-slate-400"
                                : isConnected
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                            }`}
                          >
                            {isConnected ? "Partnered" : "Connect Partner"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {m1Completed && (
                    <button
                      onClick={() => setActiveTab("optimization")}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      Proceed to Mission 2: 512MB RAM Optimization <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                MISSION 2: 512MB RAM OPTIMIZATION (ANDROID ONE)
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === "optimization" && (
              <motion.div
                key="tab-opt"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-3xl border-2 border-amber-200 p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Cpu size={20} className="text-amber-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Android One: $50 Budget Phone RAM Tuning
                      </h3>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Trim OS kernel memory to 512MB or less so affordable phones run at a silky-smooth 60 FPS
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isBudgetPhoneSmooth ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}>
                    {isBudgetPhoneSmooth ? "60 FPS Silky Smooth" : `${budgetPhoneFps} FPS (Laggy)`}
                  </span>
                </div>

                {/* Main Interactive Tuning Arena */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 my-2 flex-1 min-h-0">
                  
                  {/* Left: Live Budget Phone Benchmark */}
                  <div className="sm:col-span-5 bg-gradient-to-br from-slate-50 via-amber-50/40 to-sky-50 rounded-2xl border border-amber-200 p-3.5 flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>$50 Budget Phone Bench</span>
                      <span className={isBudgetPhoneSmooth ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                        {isBudgetPhoneSmooth ? "OPTIMIZED" : "STUTTERING"}
                      </span>
                    </div>

                    <div className={`p-4 rounded-2xl border-2 transition-all my-auto flex flex-col items-center justify-center gap-2 text-center ${
                      isBudgetPhoneSmooth ? "bg-emerald-50 border-emerald-400 shadow-sm" : "bg-white border-slate-200 shadow-2xs"
                    }`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                        isBudgetPhoneSmooth ? "bg-emerald-600" : "bg-amber-500"
                      }`}>
                        <Smartphone size={28} />
                      </div>

                      <div>
                        <span className="font-bold text-xs text-slate-500 uppercase tracking-wide block">Frame Rate</span>
                        <span className={`text-3xl font-black block mt-0.5 ${
                          isBudgetPhoneSmooth ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {budgetPhoneFps} FPS
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-slate-600">
                        Memory Used: <span className={osRamMb <= 512 ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>{osRamMb} MB / 512 MB Target</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium border-t border-slate-200 pt-2 text-center">
                      Target: Reduce RAM to &le; 512MB and background tasks to &le; 15
                    </div>
                  </div>

                  {/* Right: RAM & Background Process Tuning Sliders */}
                  <div className="sm:col-span-7 flex flex-col justify-between gap-2.5 min-h-0">
                    
                    {/* Slider 1: OS Kernel RAM Footprint */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>OS Kernel & Graphics RAM Footprint:</span>
                        <span className={osRamMb <= 512 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                          {osRamMb} MB
                        </span>
                      </div>
                      <input
                        type="range"
                        min="256"
                        max="1024"
                        step="64"
                        value={osRamMb}
                        onChange={(e) => setOsRamMb(parseInt(e.target.value))}
                        className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-medium text-slate-500">
                        <span className="text-emerald-700 font-bold">256MB (Ultra Lean)</span>
                        <span className="text-emerald-700 font-bold">512MB (Target)</span>
                        <span className="text-rose-600">1024MB (Too Heavy)</span>
                      </div>
                    </div>

                    {/* Slider 2: Background Services Limit */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>Background Daemon Services:</span>
                        <span className={backgroundProcesses <= 15 ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                          {backgroundProcesses} Processes
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={backgroundProcesses}
                        onChange={(e) => setBackgroundProcesses(parseInt(e.target.value))}
                        className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-medium text-slate-500">
                        <span className="text-emerald-700 font-bold">5 (Minimal)</span>
                        <span className="text-emerald-700 font-bold">15 (Optimized)</span>
                        <span className="text-rose-600">50 (Drains Battery)</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] font-medium text-amber-950">
                      Sundar Pichai created <b>Android One</b> to optimize the Android kernel for affordable \$50 smartphones, bringing high-speed computing to millions!
                    </div>

                  </div>
                </div>

                {m2Completed && (
                  <button
                    onClick={() => setActiveTab("localization")}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    Proceed to Mission 3: The Next Billion Users <ArrowRight size={15} />
                  </button>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                MISSION 3: THE NEXT BILLION USERS (GLOBAL LOCALIZATION)
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === "localization" && (
              <motion.div
                key="tab-loc"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-3xl border-2 border-indigo-200 p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Globe size={20} className="text-indigo-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Global Localization: Reaching 3 Billion People
                      </h3>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Activate multi-language Unicode scripts, RTL support, and Offline maps to empower emerging economies
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-300">
                    Goal: 3,000,000,000 Users
                  </span>
                </div>

                {/* 4 World Region Visualizer Grid (Zero Scrollbars) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2 flex-1 min-h-0">
                  {WORLD_REGIONS.map((region) => {
                    const isUnlocked = unlockedRegions.includes(region.id);

                    return (
                      <div
                        key={region.id}
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                          isUnlocked
                            ? "bg-emerald-50 border-emerald-400 shadow-sm"
                            : "bg-slate-50 border-slate-200 opacity-50 grayscale"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isUnlocked ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            {isUnlocked ? "ONLINE" : "OFFLINE"}
                          </span>
                          <span className="text-xs font-bold text-indigo-700">{region.population}</span>
                        </div>

                        <div className="my-1">
                          <span className="font-bold text-xs text-slate-900 block truncate">{region.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal block truncate">Needs: {region.requiredFeature}</span>
                        </div>

                        <div className="flex justify-end">
                          <span className={`text-[10px] font-bold ${isUnlocked ? "text-emerald-700" : "text-slate-400"}`}>
                            {isUnlocked ? `+${region.userGain.toLocaleString()} Users` : "Pending Activation"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3 Localization Toggle Controls */}
                <div className="grid grid-cols-3 gap-2.5 my-1 shrink-0">
                  <button
                    onClick={() => handleToggleLocalization("unicode")}
                    className={`p-2.5 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      hasUnicode ? "bg-emerald-600 text-white border-emerald-700 shadow-xs" : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <Languages size={18} />
                    <span>Unicode & Indic Scripts</span>
                  </button>

                  <button
                    onClick={() => handleToggleLocalization("rtl")}
                    className={`p-2.5 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      hasRtlScript ? "bg-emerald-600 text-white border-emerald-700 shadow-xs" : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <Languages size={18} />
                    <span>Arabic & Hebrew RTL</span>
                  </button>

                  <button
                    onClick={() => handleToggleLocalization("offline")}
                    className={`p-2.5 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      hasOfflineMaps ? "bg-emerald-600 text-white border-emerald-700 shadow-xs" : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <Wifi size={18} />
                    <span>Offline Maps & Storage</span>
                  </button>
                </div>

                {/* Final Completion Trigger */}
                {totalUsers >= 3000000000 ? (
                  <button
                    onClick={handleFinishLab}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all animate-pulse mt-1"
                  >
                    <Sparkles size={18} /> Complete 3 Billion Users Milestone & Finish Lab <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="p-2 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-center text-xs font-medium text-indigo-950 mt-1">
                    Activate all 3 global localization modules above to reach 3,000,000,000 people!
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </LabShell>
  );
}
