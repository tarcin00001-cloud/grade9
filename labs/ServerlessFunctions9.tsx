import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Server, Zap, Users, AlertTriangle, FileText, CheckCircle, 
  Coins, Play, RefreshCcw, Activity
} from "lucide-react";
import LabShell from "@/components/LabShell";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";

type Architecture = "MONOLITH" | "SERVERLESS";
type SimState = "IDLE" | "RUNNING" | "MONOLITH_FAILED" | "SERVERLESS_SUCCESS";

const TOTAL_TICKS = 15;
const START_BUDGET = 50.00;
const MONO_COST_PER_TICK = 4.00;
const MONO_CAPACITY = 5;
const SERV_COST_PER_REQ = 0.15;

// Traffic profile for the 15-second simulation (Tick 0 to 14)
const getTrafficForTick = (tick: number) => {
  if (tick >= 5 && tick <= 9) return 15; // Viral Spike!
  return 1; // Normal idle traffic
};

interface Packet {
  id: string;
  status: "success" | "dropped";
  arcOffset: number;
}

export default function ServerlessFunctions9() {
  const { reportComplete } = useLMSBridge();
  const { playPop, playError, playSuccess, playChime } = useLabAudio();

  // Core Simulation State
  const [architecture, setArchitecture] = useState<Architecture>("MONOLITH");
  const [simState, setSimState] = useState<SimState>("IDLE");
  const [tick, setTick] = useState(0);
  
  // Financial & Metrics State
  const [budget, setBudget] = useState(START_BUDGET);
  const [reqProcessed, setReqProcessed] = useState(0);
  const [reqDropped, setReqDropped] = useState(0);
  const [costIdle, setCostIdle] = useState(0);
  const [costCompute, setCostCompute] = useState(0);

  // Animation State
  const [activePackets, setActivePackets] = useState<Packet[]>([]);
  const [activeLambdas, setActiveLambdas] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  // Lab Progression Steps
  const [steps, setSteps] = useState({
    tryMonolith: false,
    monolithFailed: false,
    switchedServerless: false,
    serverlessSuccess: false,
  });

  const _reportComplete = useCallback(() => {
    reportComplete(100, "serverlessfunctions9");
  }, [reportComplete]);

  // Handle Simulation Loop
  useEffect(() => {
    if (simState !== "RUNNING") return;

    const timer = setTimeout(() => {
      // End of simulation check
      if (tick >= TOTAL_TICKS || budget <= 0) {
        if (architecture === "MONOLITH") {
          setSimState("MONOLITH_FAILED");
          setSteps(prev => ({ ...prev, monolithFailed: true }));
          playError();
        } else {
          setSimState("SERVERLESS_SUCCESS");
          setSteps(prev => ({ ...prev, serverlessSuccess: true }));
          playSuccess();
          playChime();
          _reportComplete();
        }
        return;
      }

      const traffic = getTrafficForTick(tick);
      let newProcessed = 0;
      let newDropped = 0;
      let newIdleCost = 0;
      let newComputeCost = 0;

      if (architecture === "MONOLITH") {
        newIdleCost = MONO_COST_PER_TICK;
        newProcessed = Math.min(traffic, MONO_CAPACITY);
        newDropped = Math.max(0, traffic - MONO_CAPACITY);
        
        if (newDropped > 0) {
          setIsShaking(true);
          playError();
          setTimeout(() => setIsShaking(false), 400);
        } else {
          playPop();
        }
      } else {
        // SERVERLESS
        newProcessed = traffic;
        newDropped = 0;
        newComputeCost = traffic * SERV_COST_PER_REQ;
        setActiveLambdas(traffic);
        playPop();
      }

      // Update financials
      const totalTickCost = newIdleCost + newComputeCost;
      setBudget(prev => Math.max(0, prev - totalTickCost));
      setCostIdle(prev => prev + newIdleCost);
      setCostCompute(prev => prev + newComputeCost);
      setReqProcessed(prev => prev + newProcessed);
      setReqDropped(prev => prev + newDropped);

      // Generate visual packets
      const packets: Packet[] = [];
      for (let i = 0; i < newProcessed; i++) {
        packets.push({ id: `p-${tick}-${i}`, status: "success", arcOffset: Math.random() * 40 - 20 });
      }
      for (let i = 0; i < newDropped; i++) {
        packets.push({ id: `d-${tick}-${i}`, status: "dropped", arcOffset: Math.random() * 60 - 30 });
      }
      setActivePackets(packets);

      // Advance time
      setTick(prev => prev + 1);

    }, 1000); // 1 second per tick

    return () => clearTimeout(timer);
  }, [simState, tick, budget, architecture, playError, playPop, playSuccess, playChime, _reportComplete]);

  // Clear lambdas quickly after they spawn
  useEffect(() => {
    if (activeLambdas > 0) {
      const t = setTimeout(() => setActiveLambdas(0), 600);
      return () => clearTimeout(t);
    }
  }, [activeLambdas]);

  const startSimulation = () => {
    setSimState("RUNNING");
    setTick(0);
    setBudget(START_BUDGET);
    setReqProcessed(0);
    setReqDropped(0);
    setCostIdle(0);
    setCostCompute(0);
    setActivePackets([]);
    setActiveLambdas(0);
    if (architecture === "MONOLITH") {
      setSteps(prev => ({ ...prev, tryMonolith: true }));
    }
  };

  const handleReset = () => {
    setArchitecture("MONOLITH");
    setSimState("IDLE");
    setTick(0);
    setBudget(START_BUDGET);
    setReqProcessed(0);
    setReqDropped(0);
    setCostIdle(0);
    setCostCompute(0);
    setActivePackets([]);
    setActiveLambdas(0);
    setSteps({
      tryMonolith: false,
      monolithFailed: false,
      switchedServerless: false,
      serverlessSuccess: false,
    });
  };

  // UI Helpers
  const currentTraffic = simState === "RUNNING" ? getTrafficForTick(tick) : 0;
  const isSpike = currentTraffic > 5;
  
  let instructionText = "Click 'Start 15s Simulation' to see how traditional Monolith servers bill you 24/7.";
  if (simState === "RUNNING" && architecture === "MONOLITH") {
    instructionText = "Simulation running. Watch the budget drain and wait for the viral traffic spike!";
  } else if (simState === "MONOLITH_FAILED") {
    instructionText = "The monolith crashed and burned your budget! Review the invoice below, then switch to Serverless.";
  } else if (simState === "IDLE" && architecture === "SERVERLESS") {
    instructionText = "Serverless selected. Start the simulation to see how on-demand functions handle the spike.";
  } else if (simState === "RUNNING" && architecture === "SERVERLESS") {
    instructionText = "Watch carefully! The budget only drops when Lambdas actually process requests.";
  } else if (simState === "SERVERLESS_SUCCESS") {
    instructionText = "Success! The Serverless functions handled the viral spike flawlessly and saved your startup budget.";
  }

  return (
    <LabShell
      labId="serverlessfunctions9"
      title="Serverless Computing (Lambda)"
      instruction={instructionText}
      theme="ocean"
      compact={true}
      onReset={handleReset}
    >
      <Celebration isActive={steps.serverlessSuccess} />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
        
        {/* LEFT PANEL: Visual Canvas */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-inner flex flex-col relative overflow-hidden">
          
          {/* Subtle Canvas Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          {/* Canvas Header */}
          <div className="shrink-0 p-3 flex justify-between items-center z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm tracking-widest uppercase">
              <Activity size={16} className={isSpike ? "text-rose-500 animate-pulse" : "text-emerald-400"} />
              Traffic: {currentTraffic} Req/s
            </div>
            <div className="text-slate-400 font-mono text-xs">
              Time: 00:{String(tick).padStart(2, "0")} / 00:15
            </div>
          </div>

          {/* Canvas Play Area */}
          <div className="flex-1 relative flex items-center justify-between px-8 py-4 min-h-0">
            
            {/* The Internet (Source) */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl ${isSpike ? 'bg-rose-950 border-rose-500' : 'bg-slate-800 border-slate-600'}`}
                animate={isSpike ? { scale: [1, 1.1, 1], boxShadow: ["0px 0px 0px rgba(244,63,94,0)", "0px 0px 40px rgba(244,63,94,0.6)", "0px 0px 0px rgba(244,63,94,0)"] } : {}}
                transition={{ duration: 0.5, repeat: isSpike ? Infinity : 0 }}
              >
                <Users size={32} className={isSpike ? "text-rose-400" : "text-slate-400"} />
              </motion.div>
              <span className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Global Users</span>
            </div>

            {/* Packet Animations */}
            <div className="absolute left-28 right-40 top-0 bottom-0 pointer-events-none">
              <AnimatePresence>
                {activePackets.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ left: "0%", top: "50%", opacity: 0, scale: 0.5 }}
                    animate={
                      p.status === "success" 
                      ? { left: "100%", top: `calc(50% + ${p.arcOffset}px)`, opacity: [0, 1, 1, 0], scale: 1 }
                      : { left: "60%", top: `calc(50% + ${p.arcOffset + 60}px)`, opacity: [0, 1, 0], scale: [0.5, 1.2, 0], backgroundColor: "#ef4444" }
                    }
                    transition={{ duration: 0.8, ease: "easeIn" }}
                    className={`absolute w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${p.status === "success" ? (architecture === "MONOLITH" ? "bg-emerald-400 text-emerald-400" : "bg-violet-400 text-violet-400") : "bg-rose-500 text-rose-500"}`}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Target Architecture */}
            <div className="relative z-10 w-48 h-64 flex items-center justify-center">
              {architecture === "MONOLITH" ? (
                // Monolith Box
                <motion.div 
                  className={`w-full h-full rounded-xl border-4 flex flex-col items-center justify-center p-4 bg-slate-800 shadow-2xl ${isShaking ? "border-rose-500" : "border-slate-600"}`}
                  animate={isShaking ? { x: [-10, 10, -10, 10, 0], backgroundColor: ["#1e293b", "#4c0519", "#1e293b"] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Server size={48} className={isShaking ? "text-rose-500" : "text-slate-400"} />
                  <span className="mt-4 text-sm font-black text-slate-300 uppercase tracking-widest text-center">Monolith Server</span>
                  <div className="mt-auto px-3 py-1 bg-slate-950 rounded text-[10px] font-mono text-slate-400">
                    Cap: 5 req/s
                  </div>
                  {isShaking && (
                    <div className="absolute -top-4 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-bounce">
                      OVERLOAD!
                    </div>
                  )}
                </motion.div>
              ) : (
                // Serverless Grid
                <div className="w-full h-full rounded-xl border-2 border-dashed border-violet-500/30 flex flex-col items-center justify-center relative bg-violet-950/20">
                  <span className="absolute top-2 text-[10px] font-black text-violet-400/50 uppercase tracking-widest">AWS Lambda Region</span>
                  
                  {/* Lambda Spawns */}
                  <div className="w-full h-full p-4 grid grid-cols-4 gap-2 content-center justify-items-center">
                    {Array.from({ length: Math.min(activeLambdas, 16) }).map((_, i) => (
                      <motion.div
                        key={`lambda-${i}`}
                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                      >
                        <Zap size={16} className="text-white" />
                      </motion.div>
                    ))}
                  </div>

                  {activeLambdas > 16 && (
                    <div className="absolute -bottom-4 bg-violet-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">
                      + {activeLambdas - 16} MORE SCALED!
                    </div>
                  )}
                  {activeLambdas === 0 && simState === "RUNNING" && (
                     <div className="text-violet-400/30 text-xs font-mono">0 Instances Running</div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: FinTech Dashboard */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col min-h-0 overflow-y-auto">
          
          {/* Header & Budget */}
          <div className="shrink-0 p-5 bg-slate-50 border-b border-slate-200 flex flex-col items-center justify-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Startup Budget</span>
            <div className={`text-6xl font-black font-mono tracking-tighter transition-colors duration-300 ${budget <= 0 ? "text-rose-500" : budget < 20 ? "text-amber-500" : "text-emerald-500"}`}>
              ${budget.toFixed(2)}
            </div>
          </div>

          {/* Controls & Architecture Toggle */}
          <div className="shrink-0 p-4 flex flex-col gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
              <button
                onClick={() => {
                  if (simState === "IDLE" || simState === "MONOLITH_FAILED" || simState === "SERVERLESS_SUCCESS") {
                    setArchitecture("MONOLITH");
                    setSimState("IDLE");
                    setBudget(START_BUDGET);
                  }
                }}
                disabled={simState === "RUNNING"}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 text-xs font-bold rounded-lg transition-all ${architecture === "MONOLITH" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 disabled:opacity-50"}`}
              >
                <Server size={14} className={architecture === "MONOLITH" ? "text-amber-500" : ""} />
                Monolith Server
              </button>
              <button
                onClick={() => {
                  if (steps.monolithFailed && (simState === "IDLE" || simState === "MONOLITH_FAILED" || simState === "SERVERLESS_SUCCESS")) {
                    setArchitecture("SERVERLESS");
                    setSimState("IDLE");
                    setBudget(START_BUDGET);
                    setSteps(prev => ({ ...prev, switchedServerless: true }));
                  }
                }}
                disabled={!steps.monolithFailed || simState === "RUNNING"}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 text-xs font-bold rounded-lg transition-all ${architecture === "SERVERLESS" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 disabled:opacity-50"} ${!steps.monolithFailed ? "opacity-30 cursor-not-allowed" : ""}`}
                title={!steps.monolithFailed ? "Run the Monolith simulation first to unlock Serverless" : ""}
              >
                <Zap size={14} className={architecture === "SERVERLESS" ? "text-violet-500" : ""} />
                Serverless (Lambda)
              </button>
            </div>

            {simState === "IDLE" || simState === "MONOLITH_FAILED" || simState === "SERVERLESS_SUCCESS" ? (
              <button
                onClick={startSimulation}
                className={`w-full py-3 rounded-xl text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${architecture === "MONOLITH" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20"}`}
              >
                <Play size={16} fill="currentColor" />
                Start 15s Simulation
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-xl text-sm font-black text-slate-400 bg-slate-100 uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200"
              >
                <RefreshCcw size={16} className="animate-spin" />
                Simulation Running...
              </button>
            )}
          </div>

          {/* Invoice / Receipt Area */}
          <div className="flex-1 p-4 bg-slate-50 border-t border-slate-200 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <FileText size={16} className="text-slate-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Live Invoice</h3>
            </div>
            
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm font-mono text-xs flex flex-col gap-2 relative overflow-hidden min-h-0 justify-center">
              
              {/* Receipt Content */}
              <div className="flex justify-between items-center text-slate-600">
                <span>Requests Processed:</span>
                <span className="font-bold text-slate-800">{reqProcessed}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Requests Dropped:</span>
                <span className={`font-bold ${reqDropped > 0 ? "text-rose-500" : "text-slate-800"}`}>{reqDropped}</span>
              </div>
              
              <hr className="border-dashed border-slate-200 my-1" />
              
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  Fixed Server Rent (Idle):
                  {architecture === "MONOLITH" && simState === "RUNNING" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                </span>
                <span className="text-amber-600 font-bold">-${costIdle.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  Compute Cost (Per Req):
                  {architecture === "SERVERLESS" && activeLambdas > 0 && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />}
                </span>
                <span className="text-violet-600 font-bold">-${costCompute.toFixed(2)}</span>
              </div>

              <hr className="border-dashed border-slate-300 my-1" />

              <div className="flex justify-between items-center font-black text-sm">
                <span className="text-slate-800">TOTAL BILLED:</span>
                <span className="text-slate-800">${(costIdle + costCompute).toFixed(2)}</span>
              </div>

              {/* Status Stamps */}
              {simState === "MONOLITH_FAILED" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-[1px] p-4 text-center z-10">
                  <AlertTriangle size={32} className="text-rose-500 mb-2" />
                  <span className="font-black text-rose-600 uppercase tracking-widest mb-1">Server Crashed</span>
                  <p className="text-[10px] text-rose-800 leading-tight">
                    You paid $30.00 just to rent the server while idle, leaving no budget to handle the massive traffic spike. Requests were dropped!
                  </p>
                </div>
              )}
              {simState === "SERVERLESS_SUCCESS" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-[1px] p-4 text-center z-10">
                  <CheckCircle size={32} className="text-emerald-500 mb-2" />
                  <span className="font-black text-emerald-600 uppercase tracking-widest mb-1">Perfect Efficiency</span>
                  <p className="text-[10px] text-emerald-800 leading-tight">
                    You paid $0.00 for idle time. Lambdas instantly scaled to handle 100% of the spike, and you only paid for exactly what you used!
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </LabShell>
  );
}
