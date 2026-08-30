"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Factory, 
  Shield, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Cpu, 
  Wrench,
  ArrowRight,
  Sliders,
  Lock,
  Unlock,
  Layers,
  Flame,
  Bot,
  BatteryCharging,
  Gauge,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Type,
  Hash,
  ToggleLeft
} from "lucide-react";

type ActivityId = "blueprint" | "factory" | "actions" | "encapsulation";
type ModuleId = "text" | "number" | "boolean" | "image";

interface ContainerModule {
  id: ModuleId;
  dataTypeTitle: string;
  name: string;
  kind: string;
  example: string;
  bgCard: string;
  borderCard: string;
  badgeBg: string;
  btnBg: string;
}

// 4 Jumbled options (3 valid data types + 1 distractor), perfectly contained without scrollbars
const MODULES: ContainerModule[] = [
  {
    id: "number",
    dataTypeTitle: "Number Type",
    name: "Number Gauge",
    kind: "Stores numeric levels & math counts",
    example: "100",
    bgCard: "bg-sky-50/80 hover:bg-sky-100/80",
    borderCard: "border-sky-300",
    badgeBg: "bg-sky-500 text-white",
    btnBg: "bg-sky-500 hover:bg-sky-600 text-white shadow-xs",
  },
  {
    id: "image",
    dataTypeTitle: "Image Type",
    name: "Camera Snapshot",
    kind: "Stores photo pixels & color grids",
    example: '"profile.png"',
    bgCard: "bg-purple-50/80 hover:bg-purple-100/80",
    borderCard: "border-purple-300",
    badgeBg: "bg-purple-600 text-white",
    btnBg: "bg-purple-600 hover:bg-purple-700 text-white shadow-xs",
  },
  {
    id: "boolean",
    dataTypeTitle: "Boolean Type",
    name: "Power Switch",
    kind: "Stores True or False binary states",
    example: "True (ON)",
    bgCard: "bg-emerald-50/80 hover:bg-emerald-100/80",
    borderCard: "border-emerald-300",
    badgeBg: "bg-emerald-500 text-white",
    btnBg: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs",
  },
  {
    id: "text",
    dataTypeTitle: "Text Type",
    name: "Text Nameplate",
    kind: "Stores words, letters & sentences",
    example: '"Atlas-1"',
    bgCard: "bg-amber-50/80 hover:bg-amber-100/80",
    borderCard: "border-amber-300",
    badgeBg: "bg-amber-500 text-white",
    btnBg: "bg-amber-500 hover:bg-amber-600 text-white shadow-xs",
  },
];

interface SlotTarget {
  id: "name_slot" | "battery_slot" | "power_slot";
  title: string;
  desc: string;
  acceptedId: "text" | "number" | "boolean";
  category: string;
  dataTypeExpected: string;
}

const SLOTS: SlotTarget[] = [
  {
    id: "name_slot",
    title: "Robot Name Property",
    desc: "Stores model name words (e.g. Atlas-1)",
    acceptedId: "text",
    category: "NAME",
    dataTypeExpected: "Text",
  },
  {
    id: "battery_slot",
    title: "Battery Level Property",
    desc: "Stores numeric charge percentage (0 to 100)",
    acceptedId: "number",
    category: "BATTERY",
    dataTypeExpected: "Number",
  },
  {
    id: "power_slot",
    title: "System Power Property",
    desc: "Stores True or False active state",
    acceptedId: "boolean",
    category: "STATUS",
    dataTypeExpected: "Boolean",
  },
];

interface RobotUnit {
  id: string;
  name: string;
  colorName: string;
  colorClass: string;
  bgGradient: string;
  borderColor: string;
  battery: number;
  active: boolean;
  hasBeenTested?: boolean;
}

const BOT_MODELS = [
  { name: "Atlas-1", colorName: "Cobalt Blue", colorClass: "bg-blue-500", bgGradient: "from-blue-500 to-indigo-600", borderColor: "border-blue-500" },
  { name: "Titan-X", colorName: "Amber Gold", colorClass: "bg-amber-500", bgGradient: "from-amber-500 to-orange-600", borderColor: "border-amber-500" },
  { name: "Apex-9", colorName: "Emerald Green", colorClass: "bg-emerald-500", bgGradient: "from-emerald-500 to-teal-600", borderColor: "border-emerald-500" },
];

export default function ClassesInJava9() {
  const { playPop, playSuccess, playError, playZap, playChime } = useLabAudio();
  const { reportComplete } = useLMSBridge();

  const [activeTab, setActiveTab] = useState<ActivityId>("blueprint");

  // Activity 1: Blueprint Assembly
  const [slotPlacements, setSlotPlacements] = useState<Record<string, ModuleId | null>>({
    name_slot: null,
    battery_slot: null,
    power_slot: null,
  });
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [mismatchFeedback, setMismatchFeedback] = useState<string | null>(null);

  // Activity 2: Factory Stamp & Customization
  const [customBattery, setCustomBattery] = useState(100);
  const [customPower, setCustomPower] = useState(true);
  const [robots, setRobots] = useState<RobotUnit[]>([]);
  const [isStamping, setIsStamping] = useState(false);

  // Activity 3: Testing Actions & Behavior (OOP Methods & Independent State)
  const [selectedBotForTest, setSelectedBotForTest] = useState<number>(0);
  const [botActionMessage, setBotActionMessage] = useState<string>("Select an action method below to modify this robot's state!");
  const [animatingAction, setAnimatingAction] = useState<string | null>(null);

  // Activity 4: Encapsulation Shield Sandbox
  const [isShieldLocked, setIsShieldLocked] = useState(false);
  const [hasSetterGuard, setHasSetterGuard] = useState(false);
  const [illegalOvervoltage, setIllegalOvervoltage] = useState(100);
  const [hasDefendedCrash, setHasDefendedCrash] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const allSlotsFilled = slotPlacements.name_slot && slotPlacements.battery_slot && slotPlacements.power_slot;

  // Slot placement logic with pedagogical type feedback
  const handlePlaceModule = (slotId: string, modId: ModuleId) => {
    const slot = SLOTS.find((s) => s.id === slotId);
    if (!slot) return;

    if (slot.acceptedId === modId) {
      playSuccess();
      setSlotPlacements((prev) => ({ ...prev, [slotId]: modId }));
      setSelectedModule(null);
      setSlotError(null);
      setMismatchFeedback(null);
    } else {
      playError();
      setSlotError(slotId);
      
      const modName = MODULES.find((m) => m.id === modId)?.dataTypeTitle || "";
      setMismatchFeedback(`Type Mismatch: ${slot.title} requires ${slot.dataTypeExpected}, but you selected ${modName}!`);
      setTimeout(() => {
        setSlotError(null);
      }, 1200);
    }
  };

  // Build blueprint and advance to factory
  const handleCompleteBlueprint = () => {
    if (!allSlotsFilled) return;
    playZap();
    playChime();
    setActiveTab("factory");
  };

  // Stamp a new robot object
  const handleStampRobot = () => {
    if (robots.length >= 3 || isStamping) return;
    setIsStamping(true);
    playPop();

    const model = BOT_MODELS[robots.length % BOT_MODELS.length];

    setTimeout(() => {
      playZap();
      const newBot: RobotUnit = {
        id: `bot_${Date.now()}`,
        name: model.name,
        colorName: model.colorName,
        colorClass: model.colorClass,
        bgGradient: model.bgGradient,
        borderColor: model.borderColor,
        battery: customBattery,
        active: customPower,
        hasBeenTested: false,
      };

      const nextRobots = [...robots, newBot];
      setRobots(nextRobots);
      setIsStamping(false);
      playSuccess();

      if (nextRobots.length === 3) {
        setTimeout(() => {
          setActiveTab("actions");
          playChime();
        }, 1200);
      }
    }, 450);
  };

  // Activity 3: Trigger actions / methods on robot object
  const handleRobotAction = (actionType: "drive" | "turbo" | "recharge") => {
    if (robots.length === 0) return;
    const bot = robots[selectedBotForTest];
    if (!bot) return;

    setAnimatingAction(actionType);
    setTimeout(() => setAnimatingAction(null), 600);

    if (actionType === "drive") {
      if (bot.battery < 20 || !bot.active) {
        playError();
        setBotActionMessage(`${bot.name} does not have enough energy to drive! Recharge battery.`);
        return;
      }
      playZap();
      const nextBattery = Math.max(0, bot.battery - 20);
      updateBotBattery(selectedBotForTest, nextBattery);
      setBotActionMessage(`METHOD EXECUTED: ${bot.name}.drive() reduced its battery to ${nextBattery}%. Other robots remain unchanged!`);
    } else if (actionType === "turbo") {
      if (bot.battery < 45 || !bot.active) {
        playError();
        setBotActionMessage(`${bot.name} needs at least 45% battery for Turbo Boost!`);
        return;
      }
      playZap();
      const nextBattery = Math.max(0, bot.battery - 45);
      updateBotBattery(selectedBotForTest, nextBattery);
      setBotActionMessage(`METHOD EXECUTED: ${bot.name}.turbo() used 45% energy. Remaining: ${nextBattery}%. Only ${bot.name} changed!`);
    } else if (actionType === "recharge") {
      playSuccess();
      const nextBattery = Math.min(100, bot.battery + 35);
      updateBotBattery(selectedBotForTest, nextBattery);
      setBotActionMessage(`METHOD EXECUTED: ${bot.name}.recharge() added +35% energy. Current: ${nextBattery}%.`);
    }
  };

  const updateBotBattery = (index: number, newBattery: number) => {
    setRobots((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], battery: newBattery, hasBeenTested: true };
      }
      return copy;
    });
  };

  // Activity 4: Live overvoltage injection test
  const handleOvervoltageChange = (val: number) => {
    setIllegalOvervoltage(val);
    playPop();

    if (!isShieldLocked) {
      if (val < 0 || val > 100) {
        playError();
      }
    } else {
      if (hasSetterGuard && (val < 0 || val > 100)) {
        playSuccess();
        if (!hasDefendedCrash) {
          setHasDefendedCrash(true);
        }
      }
    }
  };

  // User clicks to complete after observing the defense
  const handleFinishLab = () => {
    setIsComplete(true);
    reportComplete();
    playChime();
    playSuccess();
  };

  const handleReset = () => {
    setActiveTab("blueprint");
    setSlotPlacements({ name_slot: null, battery_slot: null, power_slot: null });
    setSelectedModule(null);
    setSlotError(null);
    setMismatchFeedback(null);
    setCustomBattery(100);
    setCustomPower(true);
    setRobots([]);
    setIsStamping(false);
    setSelectedBotForTest(0);
    setBotActionMessage("Select an action method below to modify this robot's state!");
    setAnimatingAction(null);
    setIsShieldLocked(false);
    setHasSetterGuard(false);
    setIllegalOvervoltage(100);
    setHasDefendedCrash(false);
    setIsComplete(false);
    playPop();
  };

  // Calculated battery under test in activity 4
  const testBotBattery = !isShieldLocked
    ? illegalOvervoltage
    : hasSetterGuard
    ? Math.max(0, Math.min(100, illegalOvervoltage))
    : illegalOvervoltage;

  const isTestCorrupted = testBotBattery < 0 || testBotBattery > 100;

  return (
    <LabShell
      labId="classesinjava9"
      title="The Robot Factory (OOP)"
      hint="1. Blueprint: Assign Text for names, Number for battery, and Boolean for power switch. 2. Factory: Stamp custom robots from your blueprint. 3. Actions: Drive and recharge robots to test object behaviors. 4. Guard: Lock private access to protect robots from illegal values!"
      bgOverride="bg-slate-100"
      compact={true}
      instruction="1. Build the Robot Blueprint by assigning Text, Number, and Boolean data types to properties. 2. Stamp 3 unique robot objects on the factory line. 3. Test robot actions like Driving and Turbo Boost. 4. Lock private security shields to guard robots from corrupted data."
      onReset={handleReset}
    >
      <Celebration
        isActive={isComplete}
        message="Robot Fleet Assembled, Tested & Fully Guarded! You mastered OOP & Data Types: Text stores words, Number stores numeric counts, Boolean stores true/false status, and Encapsulation protects valid data!"
        onReplay={handleReset}
      />

      {/* Full-Bleed Sunlit Machine Floor */}
      <div ref={containerRef} className="flex-1 min-h-0 w-full flex flex-col px-3 sm:px-6 py-2 gap-2.5 relative z-10 select-none">

        {/* 4 Interactive Activity Tabs */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-slate-200 shadow-xs gap-2 sm:gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Factory size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Robot Factory Ecosystem
              </h2>
              <p className="text-xs text-slate-500 font-normal leading-normal mt-0.5">
                {activeTab === "blueprint" && "Mission 1: Assign Text, Number & Boolean Data Types to Blueprint"}
                {activeTab === "factory" && "Mission 2: Stamp Unique Robot Objects from Blueprint"}
                {activeTab === "actions" && "Mission 3: Execute Robot Methods & Test Independent State"}
                {activeTab === "encapsulation" && "Mission 4: Secure Data with Encapsulation"}
              </p>
            </div>
          </div>

          {/* Tab Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {[
              { id: "blueprint", label: "1. Blueprint", unlocked: true },
              { id: "factory", label: "2. Factory", unlocked: allSlotsFilled },
              { id: "actions", label: "3. Actions", unlocked: robots.length >= 2 },
              { id: "encapsulation", label: "4. Guard", unlocked: robots.length >= 3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.unlocked) {
                    setActiveTab(tab.id as ActivityId);
                    playPop();
                  }
                }}
                disabled={!tab.unlocked}
                className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200"
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
                ACTIVITY 1: BLUEPRINT DRAFTING BAY (ZERO SCROLLBARS)
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === "blueprint" && (
              <motion.div
                key="tab-blueprint"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch"
              >
                {/* Left: Sunlit Blueprint Drafting Table */}
                <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-indigo-200 p-3.5 shadow-sm flex flex-col justify-between min-h-0 relative">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${allSlotsFilled ? "bg-emerald-500 shadow-sm" : "bg-indigo-500 animate-pulse"}`} />
                      <h3 className="text-sm font-bold text-indigo-950">
                        Robot Class Blueprint
                      </h3>
                    </div>
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Class Template
                    </span>
                  </div>

                  {/* 3 Physical Sockets */}
                  <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 my-1.5 overflow-hidden">
                    {SLOTS.map((slot) => {
                      const placedModuleId = slotPlacements[slot.id];
                      const placedModule = MODULES.find((m) => m.id === placedModuleId);
                      const isError = slotError === slot.id;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => {
                            if (selectedModule && !placedModule) {
                              handlePlaceModule(slot.id, selectedModule);
                            }
                          }}
                          className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex flex-col justify-between gap-1.5 flex-1 min-h-0 ${
                            placedModule
                              ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                              : isError
                              ? "bg-rose-50 border-rose-400 animate-shake"
                              : selectedModule
                              ? "bg-indigo-50/70 border-dashed border-indigo-400 ring-2 ring-indigo-200 cursor-pointer animate-pulse"
                              : "bg-slate-50/80 border-dashed border-slate-300 hover:border-slate-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                placedModule ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-200 text-slate-600"
                              }`}>
                                {placedModule ? <Check size={16} strokeWidth={2.5} /> : <Wrench size={14} />}
                              </div>
                              <div>
                                <span className="font-bold text-xs sm:text-sm text-slate-900 block">{slot.title}</span>
                                <span className="text-[11px] text-slate-500 font-normal hidden sm:block">{slot.desc}</span>
                              </div>
                            </div>

                            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-lg border border-indigo-200 shrink-0">
                              Requires {slot.dataTypeExpected}
                            </span>
                          </div>

                          {/* Installed module badge or empty prompt button */}
                          <div>
                            {placedModule ? (
                              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-emerald-300 shadow-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-semibold text-slate-800 truncate">{placedModule.name}</span>
                                  <span className="text-[10px] text-slate-500 font-normal hidden sm:inline truncate">holds {placedModule.example}</span>
                                </div>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${placedModule.badgeBg}`}>
                                  {placedModule.dataTypeTitle}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedModule) {
                                    handlePlaceModule(slot.id, selectedModule);
                                  }
                                }}
                                className={`w-full py-1.5 sm:py-2 px-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center text-center border ${
                                  selectedModule
                                    ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700 shadow-sm cursor-pointer animate-pulse"
                                    : "bg-white hover:bg-slate-50 text-slate-600 border-slate-300"
                                }`}
                              >
                                {selectedModule ? "Snap Selected Container Here" : `Empty Socket · Select a ${slot.dataTypeExpected} Container`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback Strip / Complete Button */}
                  <div className="shrink-0 pt-2 border-t border-indigo-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-medium truncate">
                      {mismatchFeedback ? (
                        <span className="text-rose-600 font-semibold">{mismatchFeedback}</span>
                      ) : allSlotsFilled ? (
                        <span className="text-emerald-700 font-semibold">All 3 Data Types configured! Ready to manufacture robots.</span>
                      ) : (
                        "Browse the rack on the right to select the correct data type for each socket"
                      )}
                    </span>

                    <button
                      onClick={handleCompleteBlueprint}
                      disabled={!allSlotsFilled}
                      className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                        allSlotsFilled
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:translate-y-0.5 cursor-pointer"
                          : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                      }`}
                    >
                      <Sparkles size={15} /> Build Factory <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Right: Tangible Data Type Rack */}
                <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-3.5 shadow-sm flex flex-col justify-between min-h-0">
                  <div className="border-b border-slate-100 pb-2 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers size={18} className="text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Data Containers Rack
                      </h3>
                    </div>
                    <span className="text-xs font-normal text-slate-500">
                      Pick the right type
                    </span>
                  </div>

                  {/* 4 Jumbled Data Type Cards */}
                  <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 my-1.5 overflow-hidden">
                    {MODULES.map((mod) => {
                      const isSelected = selectedModule === mod.id;
                      const isAlreadyPlaced = Object.values(slotPlacements).includes(mod.id);

                      return (
                        <motion.div
                          key={mod.id}
                          drag={!isAlreadyPlaced}
                          dragMomentum={false}
                          dragElastic={0.05}
                          whileDrag={{ scale: 1.05, zIndex: 50 }}
                          onClick={() => {
                            if (!isAlreadyPlaced) {
                              setSelectedModule(isSelected ? null : mod.id);
                              playPop();
                            }
                          }}
                          className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 flex-1 min-h-0 ${mod.bgCard} ${mod.borderCard} ${
                            isAlreadyPlaced
                              ? "opacity-40 grayscale cursor-default"
                              : isSelected
                              ? "ring-4 ring-indigo-300 shadow-sm scale-101 cursor-pointer"
                              : "shadow-2xs hover:shadow-xs cursor-grab active:cursor-grabbing"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`px-2 py-0.5 rounded-lg font-bold text-[10px] shrink-0 ${mod.badgeBg}`}>
                              {mod.dataTypeTitle}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-slate-900 block truncate">{mod.name}</span>
                              <span className="text-[10px] text-slate-600 font-normal block truncate">{mod.kind}</span>
                              <span className="text-[9.5px] font-semibold text-indigo-700 block truncate">Holds: {mod.example}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAlreadyPlaced) {
                                setSelectedModule(isSelected ? null : mod.id);
                                playPop();
                              }
                            }}
                            disabled={isAlreadyPlaced}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all shrink-0 ${
                              isAlreadyPlaced
                                ? "bg-slate-200 text-slate-500"
                                : isSelected
                                ? "bg-indigo-600 text-white shadow-xs"
                                : `${mod.btnBg} cursor-pointer`
                            }`}
                          >
                            {isAlreadyPlaced ? "Placed" : isSelected ? "Selected" : "Pick Up"}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="p-2 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-center text-[11px] font-medium text-indigo-950 shrink-0">
                    Find and select Text, Number, and Boolean to build your robot!
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                ACTIVITY 2: ROBOT FACTORY STAMPING
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === "factory" && (
              <motion.div
                key="tab-factory"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-3xl border-2 border-sky-200 p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Factory size={20} className="text-sky-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Robot Manufacturing Conveyor
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full border border-sky-300">
                    Robots Created: {robots.length}/3
                  </span>
                </div>

                {/* Customizer Deck */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 my-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200 items-center">
                  <div className="sm:col-span-8 flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">Name (Text):</span>
                      <span className="text-sm font-bold text-slate-900">
                        "{BOT_MODELS[robots.length % BOT_MODELS.length].name}"
                      </span>
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Energy (Number):</span>
                        <span className="font-bold text-sky-700">{customBattery}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        value={customBattery}
                        onChange={(e) => setCustomBattery(parseInt(e.target.value))}
                        className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-medium text-slate-500 block mb-1">Power (Boolean):</span>
                      <button
                        onClick={() => setCustomPower(!customPower)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          customPower ? "bg-emerald-500 text-white border-emerald-600 shadow-xs" : "bg-slate-200 text-slate-700 border-slate-300"
                        }`}
                      >
                        {customPower ? "True (Active)" : "False (Standby)"}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      onClick={handleStampRobot}
                      disabled={isStamping || robots.length >= 3}
                      className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                        robots.length >= 3
                          ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md active:translate-y-0.5 cursor-pointer"
                      }`}
                    >
                      <Zap size={16} /> {isStamping ? "Stamping Robot..." : "Stamp New Robot Object"}
                    </button>
                  </div>
                </div>

                {/* Sunlit Assembly Floor with Dynamic Moving Stamper */}
                <div className="flex-1 min-h-[160px] relative bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 rounded-2xl border-2 border-sky-200 overflow-hidden flex flex-col justify-between p-4 my-1 shadow-inner">
                  
                  {/* Dynamic Moving Hydraulic Stamper */}
                  <motion.div
                    animate={{ 
                      left: robots.length === 0 ? "16.66%" : robots.length === 1 ? "50%" : "83.33%",
                      y: isStamping ? 36 : 0 
                    }}
                    transition={{ 
                      left: { type: "spring", stiffness: 180, damping: 22 },
                      y: { type: "spring", stiffness: 450, damping: 18 } 
                    }}
                    className="absolute top-0 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
                  >
                    <div className="w-6 h-12 bg-gradient-to-b from-slate-300 to-slate-500 border-x-2 border-slate-200 shadow-sm" />
                    <div className="w-20 h-6 bg-amber-400 rounded-b-md border border-amber-500 shadow-xs flex items-center justify-center">
                      <span className="text-[9px] font-bold text-amber-950 uppercase tracking-wider">STAMPER</span>
                    </div>

                    {/* Mechanical Stamping Sparks */}
                    {isStamping && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="w-12 h-6 bg-amber-300/60 rounded-full blur-xs mt-0.5"
                      />
                    )}
                  </motion.div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 z-10">
                    <span>Manufacturing Line</span>
                    <span className="text-indigo-700 font-bold">1 Blueprint &rarr; 3 Unique Independent Robots</span>
                  </div>

                  {/* 3 Stamped Robot Pedestals */}
                  <div className="grid grid-cols-3 gap-4 z-10 my-auto">
                    {[0, 1, 2].map((idx) => {
                      const bot = robots[idx];

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between h-28 transition-all relative overflow-hidden ${
                            bot
                              ? "bg-white border-sky-300 shadow-sm"
                              : "bg-white/60 border-dashed border-slate-300 flex items-center justify-center text-center"
                          }`}
                        >
                          {bot ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-700">{bot.colorName}</span>
                                <span className={`w-2.5 h-2.5 rounded-full ${bot.active ? "bg-emerald-500 shadow-sm" : "bg-slate-300"}`} />
                              </div>

                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bot.bgGradient} flex items-center justify-center text-white shadow-xs shrink-0`}>
                                  <Bot size={22} />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-sm text-slate-900 block truncate">{bot.name}</span>
                                  <span className="text-xs font-semibold text-emerald-600 block">
                                    Battery: {bot.battery}%
                                  </span>
                                </div>
                              </div>

                              <span className="text-xs text-slate-500 font-normal block truncate">
                                Robot Object #{idx + 1} Ready
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              Conveyor Slot #{idx + 1} [Empty]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center text-xs font-medium text-slate-600 z-10">
                    {robots.length < 3 ? "Press the button above to stamp robots!" : "All 3 robots created! Proceed to Mission 3."}
                  </div>
                </div>

                {robots.length >= 3 && (
                  <button
                    onClick={() => setActiveTab("actions")}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    Proceed to Mission 3: Robot Actions & Methods <ArrowRight size={15} />
                  </button>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                ACTIVITY 3: TESTING ROBOT METHODS & INDEPENDENT STATE
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === "actions" && (
              <motion.div
                key="tab-actions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-3xl border-2 border-amber-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Navigation size={20} className="text-amber-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Robot Action Testing Grounds (Methods & State)
                      </h3>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Methods perform actions that modify an object's internal Number state in memory
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                    Lesson: Independent Object State
                  </span>
                </div>

                {/* 3 Robot Object Selectors Showing Memory States */}
                <div className="grid grid-cols-3 gap-3 my-2">
                  {robots.map((bot, idx) => (
                    <div
                      key={bot.id}
                      onClick={() => {
                        setSelectedBotForTest(idx);
                        playPop();
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        selectedBotForTest === idx
                          ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-300 shadow-xs"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bot.bgGradient} flex items-center justify-center text-white shadow-2xs shrink-0`}>
                          <Bot size={20} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 block truncate">{bot.name}</span>
                          <span className="text-[11px] font-semibold text-sky-700 block truncate">
                            Memory State: {bot.battery}%
                          </span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        selectedBotForTest === idx ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {selectedBotForTest === idx ? "Active" : "Select"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Interactive Method Execution Arena */}
                <div className="flex-1 min-h-0 bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between my-1">
                  
                  {/* Top Target Indicator */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Executing Methods on: <span className="text-indigo-700 font-black">{robots[selectedBotForTest]?.name || "Atlas-1"}</span>
                    </span>
                    <span className="font-semibold text-slate-600">
                      Current Battery State: <span className="font-bold text-sky-700">{robots[selectedBotForTest]?.battery || 0}%</span>
                    </span>
                  </div>

                  {/* 3 Action Method Buttons */}
                  <div className="grid grid-cols-3 gap-3 my-2">
                    <button
                      onClick={() => handleRobotAction("drive")}
                      className={`p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-xs shadow-xs active:translate-y-0.5 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        animatingAction === "drive" ? "ring-4 ring-sky-300 scale-98" : ""
                      }`}
                    >
                      <Navigation size={18} />
                      <span>Drive Method (-20%)</span>
                    </button>

                    <button
                      onClick={() => handleRobotAction("turbo")}
                      className={`p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs shadow-xs active:translate-y-0.5 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        animatingAction === "turbo" ? "ring-4 ring-rose-300 scale-98" : ""
                      }`}
                    >
                      <Flame size={18} />
                      <span>Turbo Boost Method (-45%)</span>
                    </button>

                    <button
                      onClick={() => handleRobotAction("recharge")}
                      className={`p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs shadow-xs active:translate-y-0.5 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        animatingAction === "recharge" ? "ring-4 ring-emerald-300 scale-98" : ""
                      }`}
                    >
                      <BatteryCharging size={18} />
                      <span>Recharge Method (+35%)</span>
                    </button>
                  </div>

                  {/* Real-time Pedagogical Feedback Callout */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center text-xs font-medium text-slate-800 shadow-2xs">
                    {botActionMessage}
                  </div>
                </div>

                {/* Key OOP Takeaway Bar */}
                <div className="p-2 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-950 font-medium my-1">
                  <span className="flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-600 shrink-0" />
                    <span><b>OOP Core Rule:</b> Each robot object has its own separate memory. Running a method modifies only that specific robot!</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 hidden sm:inline">3 Independent Instances</span>
                </div>

                <button
                  onClick={() => setActiveTab("encapsulation")}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  Proceed to Mission 4: Encapsulation Security <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                ACTIVITY 4: ENCAPSULATION DEFENSE (FORCEFIELD SANDBOX)
            ═══════════════════════════════════════════════════════════ */}
            {activeTab === "encapsulation" && (
              <motion.div
                key="tab-encapsulation"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-3xl border-2 border-indigo-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Shield size={20} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Encapsulation & Security Lab
                    </h3>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    hasDefendedCrash
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}>
                    {hasDefendedCrash ? "Safety Guard Verified" : "Unprotected Field"}
                  </span>
                </div>

                {/* Sandbox Arena */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 my-2.5 flex-1 min-h-0">
                  
                  {/* Left: Robot Shield Pod Under Test */}
                  <div className="sm:col-span-6 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-sky-50 rounded-2xl border border-indigo-200 p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                      <span>Target: Atlas-1</span>
                      <span className="text-indigo-700 font-bold">Diagnostic Bay</span>
                    </div>

                    {/* Robot Visual Status */}
                    <div className={`p-4 rounded-2xl border-2 transition-all my-auto flex flex-col items-center justify-center gap-2 text-center relative ${
                      isTestCorrupted
                        ? "bg-rose-50 border-rose-400 shadow-sm animate-shake"
                        : hasDefendedCrash
                        ? "bg-emerald-50 border-emerald-400 shadow-sm"
                        : "bg-white border-slate-200 shadow-2xs"
                    }`}>
                      {/* Active Forcefield Ring when Guard is installed and Private */}
                      {isShieldLocked && hasSetterGuard && (
                        <motion.div
                          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-2xl border-2 border-emerald-400 bg-emerald-500/5 pointer-events-none"
                        />
                      )}

                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xs ${
                        isTestCorrupted ? "bg-rose-600 animate-pulse" : "bg-blue-500"
                      }`}>
                        {isTestCorrupted ? <Flame size={28} className="text-yellow-300" /> : <Bot size={28} />}
                      </div>

                      <div>
                        <span className="font-bold text-sm text-slate-900 block">Atlas-1 Energy Level</span>
                        <span className={`text-2xl font-bold block mt-0.5 ${
                          isTestCorrupted ? "text-rose-600 animate-pulse" : "text-emerald-600"
                        }`}>
                          {testBotBattery}%
                        </span>
                      </div>

                      <span className={`text-xs font-medium px-3 py-0.5 rounded-full ${
                        isTestCorrupted
                          ? "bg-rose-100 text-rose-700 border border-rose-300"
                          : hasSetterGuard
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {isTestCorrupted
                          ? "MALFUNCTION: Illegal value applied!"
                          : hasSetterGuard && (illegalOvervoltage < 0 || illegalOvervoltage > 100)
                          ? `SAFETY CLAMPED: ${illegalOvervoltage}% blocked -> safe at ${testBotBattery}%`
                          : hasSetterGuard
                          ? "Safety Clamp Active (0% to 100%)"
                          : "Public Access (Vulnerable)"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-normal text-slate-500 border-t border-slate-200 pt-2">
                      <span>Shield: {isShieldLocked ? "Locked (Private)" : "Open (Public)"}</span>
                      <span>Guard: {hasSetterGuard ? "Active" : "Off"}</span>
                    </div>
                  </div>

                  {/* Right: Security Tool Controls */}
                  <div className="sm:col-span-6 flex flex-col justify-between gap-3 min-h-0">
                    
                    {/* Control 1: Access Lock Toggle */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          {isShieldLocked ? <Lock size={16} className="text-emerald-600" /> : <Unlock size={16} className="text-rose-600" />}
                          Variable Access Control:
                        </span>
                        <span className={isShieldLocked ? "text-emerald-600" : "text-rose-600"}>
                          {isShieldLocked ? "Private (Shielded)" : "Public (Open)"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setIsShieldLocked(false);
                            playPop();
                          }}
                          className={`py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                            !isShieldLocked
                              ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          Public (Open)
                        </button>
                        <button
                          onClick={() => {
                            setIsShieldLocked(true);
                            playSuccess();
                          }}
                          className={`py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                            isShieldLocked
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          Private (Locked)
                        </button>
                      </div>
                    </div>

                    {/* Control 2: Setter Validation Clamp */}
                    {isShieldLocked && (
                      <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-bold text-indigo-950">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck size={16} className="text-indigo-600" /> Safety Clamp (0% to 100%):
                          </span>
                          <button
                            onClick={() => {
                              setHasSetterGuard(!hasSetterGuard);
                              playZap();
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                              hasSetterGuard
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                                : "bg-white text-indigo-900 border-indigo-300 shadow-xs"
                            }`}
                          >
                            {hasSetterGuard ? "Guard Installed" : "Install Guard"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Control 3: Live Overvoltage Slider */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>Simulate Power Input / Surge:</span>
                        <span className={`text-sm font-bold ${illegalOvervoltage < 0 || illegalOvervoltage > 100 ? "text-rose-600" : "text-sky-700"}`}>
                          {illegalOvervoltage}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="-200"
                        max="300"
                        step="25"
                        value={illegalOvervoltage}
                        onChange={(e) => handleOvervoltageChange(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />

                      <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span className="text-rose-600 font-semibold">-200% (Surge)</span>
                        <span className="text-emerald-700 font-semibold">0% to 100% (Safe)</span>
                        <span className="text-rose-600 font-semibold">+300% (Overload)</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Plain English Feedback / Finish Button */}
                {hasDefendedCrash ? (
                  <button
                    onClick={handleFinishLab}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all animate-pulse"
                  >
                    <Sparkles size={18} /> Complete Robot Fleet Certification & Finish Lab <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-center text-xs font-medium text-indigo-950">
                    {!isShieldLocked
                      ? "Under Public access, anyone can set impossible values (-200%), breaking the robot!"
                      : hasSetterGuard
                      ? "Test a power surge (e.g. -200% or +300%) with the slider above to see the Safety Guard in action!"
                      : "Variable is locked private. Install the safety guard above to protect against overloads!"}
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
