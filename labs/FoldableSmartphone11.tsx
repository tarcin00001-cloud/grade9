"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import {
  Smartphone, Laptop, Tablet, MessageSquare, Code2, AlertTriangle, CheckCircle2, RotateCcw, MonitorPlay, PlayCircle
} from "lucide-react";
import Foldable3DScene from "@/components/Foldable3DScene";

type HardwareState = "compact" | "laptop" | "tablet";

type FlexDirection = "row" | "column" | "";
type VideoWidth = "100%" | "65%" | "auto" | "";
type VideoHeight = "100%" | "50%" | "auto" | "";

interface DeviceLogic {
  flexDirection: FlexDirection;
  videoWidth: VideoWidth;
  videoHeight: VideoHeight;
}

const INITIAL_LOGIC: Record<HardwareState, DeviceLogic> = {
  compact: { flexDirection: "", videoWidth: "", videoHeight: "" },
  laptop: { flexDirection: "", videoWidth: "", videoHeight: "" },
  tablet: { flexDirection: "", videoWidth: "", videoHeight: "" }
};

const CORRECT_LOGIC: Record<HardwareState, DeviceLogic> = {
  compact: { flexDirection: "column", videoWidth: "100%", videoHeight: "auto" },
  laptop: { flexDirection: "column", videoWidth: "100%", videoHeight: "50%" },
  tablet: { flexDirection: "row", videoWidth: "65%", videoHeight: "100%" }
};

export default function FoldableSmartphone11() {
  const { playClick, playPop, playSuccess, playZap } = useLabAudio();

  const [hardware, setHardware] = useState<HardwareState>("compact");
  const [testing, setTesting] = useState(false);
  const [labFinished, setLabFinished] = useState(false);

  const [logic, setLogic] = useState<Record<HardwareState, DeviceLogic>>(INITIAL_LOGIC);

  const isStateCorrect = (state: HardwareState) => {
    return logic[state].flexDirection === CORRECT_LOGIC[state].flexDirection &&
           logic[state].videoWidth === CORRECT_LOGIC[state].videoWidth &&
           logic[state].videoHeight === CORRECT_LOGIC[state].videoHeight;
  };

  const isCurrentCorrect = isStateCorrect(hardware);
  const allCorrect = isStateCorrect("compact") && isStateCorrect("laptop") && isStateCorrect("tablet");

  const handlePropertyChange = (property: keyof DeviceLogic, value: string) => {
    setLogic(prev => ({
      ...prev,
      [hardware]: {
        ...prev[hardware],
        [property]: value
      }
    }));
    if (playClick) playClick();
  };

  const runFinalTest = async () => {
    if (playZap) playZap();
    setTesting(true);
    
    setHardware("compact");
    await new Promise(r => setTimeout(r, 1200));
    if (playPop) playPop();
    setHardware("laptop");
    await new Promise(r => setTimeout(r, 1200));
    if (playPop) playPop();
    setHardware("tablet");
    await new Promise(r => setTimeout(r, 1200));
    if (playSuccess) playSuccess();
    
    setTesting(false);
    setLabFinished(true);
  };

  const resetLab = () => {
    setLogic(INITIAL_LOGIC);
    setHardware("compact");
    setLabFinished(false);
    if (playPop) playPop();
  };

  const currentLogic = logic[hardware];

  // If any property is set but they aren't all correct, it's considered broken
  const hasStartedConfiguring = currentLogic.flexDirection || currentLogic.videoWidth || currentLogic.videoHeight;
  const isBroken = hasStartedConfiguring && !isCurrentCorrect;

  return (
    <LabShell
      labId="foldablesmartphone11"
      title="The Foldable Smartphone"
      subtitle="Responsive CSS Logic Builder"
      theme="studio"
      compact={true}
      instruction="1. Study the hardware and software challenges of foldable device screens. 2. Use the adaptive UI sandbox to design an interface for both folded and unfolded states. 3. Test the UI transitions during the simulated folding mechanism. 4. Finalize the design ensuring no content is lost during the screen state change."
      onReset={resetLab}
    >
      <Celebration isActive={labFinished} onReplay={resetLab} />

      <div className="flex flex-col md:flex-row h-full w-full max-w-6xl mx-auto gap-4 p-4">
        
        {/* Left Panel: Virtual Device Sandbox */}
        <div className="flex-[1.2] bg-white rounded-xl p-4 border-2 border-slate-800/20 shadow-none flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Hardware Toggle Controls */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-20">
            <button
              disabled={testing || labFinished}
              onClick={() => { setHardware("compact"); if (playPop) playPop(); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
                hardware === "compact" ? "bg-fuchsia-500 text-slate-900 shadow-[0_0_15px_rgba(217,70,239,0.5)]" : "bg-white text-slate-700 border border-slate-400 hover:bg-slate-200"
              }`}
            >
              <Smartphone size={14} /> Compact
              {isStateCorrect("compact") && <CheckCircle2 size={12} className="text-slate-900" />}
            </button>
            <button
              disabled={testing || labFinished}
              onClick={() => { setHardware("laptop"); if (playPop) playPop(); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
                hardware === "laptop" ? "bg-sky-500 text-slate-900 shadow-[0_0_15px_rgba(14,165,233,0.5)]" : "bg-white text-slate-700 border border-slate-400 hover:bg-slate-200"
              }`}
            >
              <Laptop size={14} /> Mini-Laptop
              {isStateCorrect("laptop") && <CheckCircle2 size={12} className="text-slate-900" />}
            </button>
            <button
              disabled={testing || labFinished}
              onClick={() => { setHardware("tablet"); if (playPop) playPop(); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
                hardware === "tablet" ? "bg-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-white text-slate-700 border border-slate-400 hover:bg-slate-200"
              }`}
            >
              <Tablet size={14} /> Tablet
              {isStateCorrect("tablet") && <CheckCircle2 size={12} className="text-slate-900" />}
            </button>
          </div>

          {/* The Physical Device Wrapper */}
          <div className="flex-1 w-full h-full flex items-center justify-center mt-6">
            <Foldable3DScene 
              hardware={hardware}
              isBroken={!!isBroken}
              uiContent={
                <div 
                  className="flex-1 w-full h-full bg-slate-900 overflow-hidden flex transition-all duration-500"
                  style={{ 
                    flexDirection: (currentLogic.flexDirection as any) || "column"
                  }}
                >
                  {/* Video Component */}
                  <div 
                    className={`bg-slate-950 flex flex-col items-center justify-center relative transition-all duration-500 ${isBroken ? 'border-2 border-red-500/50' : ''}`}
                    style={{
                      width: currentLogic.videoWidth || "100%",
                      height: currentLogic.videoHeight || "50%"
                    }}
                  >
                    <MonitorPlay className="text-slate-700 w-16 h-16 absolute opacity-20" />
                    <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 z-10">
                      <PlayCircle className="text-sky-400 w-5 h-5" />
                      <span className="text-slate-300 text-sm font-bold tracking-wider">LIVE STREAM</span>
                    </div>
                  </div>

                  {/* Chat Component */}
                  <div className="flex-1 flex flex-col bg-slate-900 border-t border-slate-800 transition-all duration-500 min-h-0 min-w-0">
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><MessageSquare size={14}/> Live Chat</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden opacity-50 relative">
                       <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 z-10"></div>
                       <div className="h-6 w-3/4 bg-slate-800 rounded"></div>
                       <div className="h-10 w-full bg-slate-800 rounded"></div>
                       <div className="h-6 w-2/3 bg-slate-800 rounded"></div>
                       <div className="h-12 w-full bg-slate-800 rounded"></div>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* Right Panel: Logic Board */}
        <div className="flex-[0.8] flex flex-col gap-3">
          
          <div className="bg-white rounded-xl p-4 border-2 border-slate-800/20 shadow-none shrink-0">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
              <Code2 className="text-fuchsia-600"/> CSS Builder
            </h2>
            <p className="text-xs text-slate-700">Configure all 3 properties for the <strong className="text-sky-600 uppercase">{hardware}</strong> state.</p>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-slate-800/20 shadow-none flex-1 flex flex-col">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest shrink-0">Responsive Rules</h3>
              {isCurrentCorrect && (
                <span className="bg-emerald-500/20 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle2 size={12} /> Correct
                </span>
              )}
            </div>

            <div className="flex flex-col gap-5 flex-1">
              
              {/* Flex Direction */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">flex-direction</div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handlePropertyChange("flexDirection", "column")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${currentLogic.flexDirection === "column" ? "bg-sky-500 text-slate-900 border-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.3)]" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-200"}`}
                  >
                    column
                  </button>
                  <button 
                    onClick={() => handlePropertyChange("flexDirection", "row")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${currentLogic.flexDirection === "row" ? "bg-sky-500 text-slate-900 border-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.3)]" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-200"}`}
                  >
                    row
                  </button>
                </div>
              </div>

              {/* Video Width */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">video width</div>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handlePropertyChange("videoWidth", "100%")}
                    className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${currentLogic.videoWidth === "100%" ? "bg-fuchsia-500 text-slate-900 border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.3)]" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-200"}`}
                  >
                    100%
                  </button>
                  <button 
                    onClick={() => handlePropertyChange("videoWidth", "65%")}
                    className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${currentLogic.videoWidth === "65%" ? "bg-fuchsia-500 text-slate-900 border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.3)]" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-200"}`}
                  >
                    65%
                  </button>
                  <button 
                    onClick={() => handlePropertyChange("videoWidth", "auto")}
                    className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${currentLogic.videoWidth === "auto" ? "bg-fuchsia-500 text-slate-900 border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.3)]" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-200"}`}
                  >
                    auto
                  </button>
                </div>
              </div>

              {/* Video Height */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">video height</div>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handlePropertyChange("videoHeight", "100%")}
                    className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${currentLogic.videoHeight === "100%" ? "bg-emerald-500 text-slate-900 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-200"}`}
                  >
                    100%
                  </button>
                  <button 
                    onClick={() => handlePropertyChange("videoHeight", "50%")}
                    className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${currentLogic.videoHeight === "50%" ? "bg-emerald-500 text-slate-900 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-200"}`}
                  >
                    50%
                  </button>
                  <button 
                    onClick={() => handlePropertyChange("videoHeight", "auto")}
                    className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${currentLogic.videoHeight === "auto" ? "bg-emerald-500 text-slate-900 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white text-slate-700 border-slate-400 hover:bg-slate-200"}`}
                  >
                    auto
                  </button>
                </div>
              </div>

            </div>

            {allCorrect && (
              <button
                onClick={runFinalTest}
                disabled={testing || labFinished}
                className="mt-4 w-full bg-slate-100 text-slate-900 font-black text-sm py-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shrink-0"
              >
                <PlayCircle size={18} /> {testing ? "RUNNING..." : "RUN HARDWARE TEST"}
              </button>
            )}

          </div>

        </div>
      </div>
    </LabShell>
  );
}
