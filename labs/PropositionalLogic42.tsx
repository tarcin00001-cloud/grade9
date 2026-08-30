"use client";

import { useState, useEffect } from "react";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Zap, ShieldCheck, ShieldAlert, ChevronRight, Binary, Fingerprint, CreditCard, Lock, Unlock, Battery, BatteryCharging, DoorClosed, DoorOpen, Activity } from "lucide-react";

type GateType = "AND" | "OR" | "XOR" | "NOT";
type MissionPhase = "M1_SANDBOX" | "M2_AND" | "M3_OR" | "M4_XOR" | "M5_FAULT" | "OUTCOME";

export default function PropositionalLogic42() {
  const { reportComplete } = useLMSBridge("propositionallogic42");
  const { playPop, playClick, playSuccess, playError, playZap } = useLabAudio();

  const [phase, setPhase] = useState<MissionPhase>("M1_SANDBOX");
  const [gate, setGate] = useState<GateType>("AND");
  const [inputP, setInputP] = useState(false);
  const [inputQ, setInputQ] = useState(false);
  const [qBroken, setQBroken] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Math/Logic Symbols mapping
  const GateSymbols: Record<GateType, string> = {
    AND: "P ∧ Q",
    OR: "P ∨ Q",
    XOR: "P ⊕ Q",
    NOT: "¬P"
  };

  // Evaluate logic instantly
  const evaluate = (p: boolean, q: boolean, g: GateType) => {
    if (g === "AND") return p && q;
    if (g === "OR") return p || q;
    if (g === "XOR") return p !== q;
    if (g === "NOT") return !p;
    return false;
  };

  const result = evaluate(inputP, inputQ, gate);

  // Audio feedback on evaluation
  useEffect(() => {
    if (result && phase !== "OUTCOME") playPop();
  }, [result]);

  const resetInputs = () => {
    setInputP(false);
    setInputQ(false);
  };

  // Mission Progression State Machine (Learn -> Try -> Fail Safely -> Understand -> Improve -> Complete)
  useEffect(() => {
    if (phase === "M2_AND" && gate === "AND" && inputP && inputQ) {
       playSuccess();
       setTimeout(() => { resetInputs(); setGate("OR"); setPhase("M3_OR"); playZap(); }, 2500);
    }
    if (phase === "M3_OR" && gate === "OR" && (inputP || inputQ)) {
       playSuccess();
       setTimeout(() => { resetInputs(); setGate("XOR"); setPhase("M4_XOR"); playZap(); }, 2500);
    }
    if (phase === "M4_XOR" && gate === "XOR" && (inputP !== inputQ)) {
       playSuccess();
       // Fail safely transition
       setTimeout(() => {
          resetInputs();
          setPhase("M5_FAULT");
          setQBroken(true);
          playZap();
       }, 2500);
    }
    if (phase === "M5_FAULT") {
      if (result && (gate === "OR" || gate === "XOR" || gate === "NOT")) {
         setPhase("OUTCOME");
         setHasWon(true);
         playSuccess();
         setTimeout(() => reportComplete(), 4500);
      }
    }
  }, [inputP, inputQ, gate, phase, result, reportComplete, playSuccess, playZap]);

  const handleSetInputs = (p: boolean, q: boolean) => {
    setInputP(p);
    if (!qBroken) setInputQ(q);
    playClick();
  };

  const handleToggleP = () => handleSetInputs(!inputP, inputQ);
  const handleToggleQ = () => {
    if (qBroken) {
      playError();
      return;
    }
    handleSetInputs(inputP, !inputQ);
  };

  const reset = () => {
    setPhase("M1_SANDBOX");
    setGate("AND");
    setInputP(false);
    setInputQ(false);
    setQBroken(false);
    setHasWon(false);
  };

  // SVG Paths for Authentic Gates
  const renderGateSVG = () => {
    switch (gate) {
      case "AND":
        return <path d="M -40 -40 L -10 -40 A 40 40 0 0 1 30 0 A 40 40 0 0 1 -10 40 L -40 40 Z" fill="currentColor" />;
      case "OR":
        return <path d="M -40 -40 C -10 -40 20 -20 40 0 C 20 20 -10 40 -40 40 C -20 15 -20 -15 -40 -40 Z" fill="currentColor" />;
      case "XOR":
        return (
          <>
            <path d="M -50 -40 C -30 -15 -30 15 -50 40" stroke="currentColor" fill="none" strokeWidth="8" />
            <path d="M -30 -40 C 0 -40 30 -20 50 0 C 30 20 0 40 -30 40 C -10 15 -10 -15 -30 -40 Z" fill="currentColor" />
          </>
        );
      case "NOT":
        return (
          <>
            <path d="M -40 -30 L 20 0 L -40 30 Z" fill="currentColor" />
            <circle cx="30" cy="0" r="10" fill="transparent" stroke="currentColor" strokeWidth="6" />
          </>
        );
    }
  };

  // Truth Table Generator (Bi-directional interactive)
  const generateTruthTable = () => {
    const rows = gate === "NOT" 
      ? [{ p: false, q: false }, { p: true, q: false }]
      : [{ p: false, q: false }, { p: false, q: true }, { p: true, q: false }, { p: true, q: true }];

    return rows.map((row, i) => {
      const out = evaluate(row.p, row.q, gate);
      const isCurrent = row.p === inputP && (gate === "NOT" || row.q === inputQ);
      
      return (
        <button 
          key={i} 
          onClick={() => handleSetInputs(row.p, row.q)}
          disabled={qBroken && row.q === true}
          className={`grid ${gate === "NOT" ? "grid-cols-2" : "grid-cols-3"} w-full text-center py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${isCurrent ? "bg-blue-600 text-white shadow-md transform scale-[1.02]" : "text-slate-600 hover:bg-slate-100 border-b border-slate-100"} ${(qBroken && row.q === true) ? "opacity-30 cursor-not-allowed" : ""}`}
        >
          <div>{row.p ? "1 (T)" : "0 (F)"}</div>
          {gate !== "NOT" && <div>{row.q ? "1 (T)" : "0 (F)"}</div>}
          <div className={isCurrent ? "text-white font-black" : out ? "text-amber-500 font-black" : "text-slate-400"}>{out ? "1 (T)" : "0 (F)"}</div>
        </button>
      );
    });
  };

  const getOutputIcon = () => {
    if (phase === "M3_OR") return result ? <BatteryCharging size={40} className="animate-pulse" /> : <Battery size={40} />;
    if (phase === "M4_XOR") return result ? <DoorOpen size={40} className="animate-pulse" /> : <DoorClosed size={40} />;
    if (phase === "M1_SANDBOX") return <div className="text-3xl font-black">{result ? "1" : "0"}</div>;
    return result ? <Unlock size={40} className="animate-pulse" /> : <Lock size={40} />;
  };

  const getOutputLabel = () => {
    if (phase === "M3_OR") return "Backup Power";
    if (phase === "M4_XOR") return "Airlock Door";
    if (phase === "M1_SANDBOX") return "Output Signal";
    return "Vault Door";
  };

  return (
    <LabShell labId="propositionallogic42" theme="ocean" title="Propositional Logic"
      instruction="Master the core connectives of computer science through interactive circuitry." compact
      onReset={reset}>
      
      <Celebration isActive={hasWon} message="Vault Secured! You successfully used logic structures to bypass the hardware fault!" onReplay={reset} />

      <div className="w-full flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-2 bg-slate-50">
        
        {/* LEFT PANE: Mission Guide & Interactive Truth Table */}
        <div className="w-full md:w-[340px] flex flex-col gap-3 min-h-0 shrink-0 overflow-y-auto pb-4 px-1">
          
          {/* Mission Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 shrink-0 flex flex-col">
            <h3 className="font-bold text-slate-800 text-[13px] tracking-widest uppercase mb-2 flex items-center gap-2">
              {phase === "M1_SANDBOX" && <><Binary className="text-blue-500" size={16} /> M1: Sandbox</>}
              {phase === "M2_AND" && <><ShieldCheck className="text-emerald-500" size={16} /> M2: Security</>}
              {phase === "M3_OR" && <><Zap className="text-amber-500" size={16} /> M3: Power Grid</>}
              {phase === "M4_XOR" && <><Activity className="text-purple-500" size={16} /> M4: Airlock</>}
              {(phase === "M5_FAULT" || phase === "OUTCOME") && <><ShieldAlert className="text-rose-500" size={16} /> M5: Hacker Override</>}
            </h3>
            
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-3">
              {phase === "M1_SANDBOX" && "Explore the core connectives. Click rows in the Truth Table or flip the tactile switches to see how the gates evaluate inputs."}
              {phase === "M2_AND" && <span>Secure the Vault! It must open ONLY if <strong>BOTH</strong> the Keycard (P) and Fingerprint (Q) are active. Select the correct gate and trigger it.</span>}
              {phase === "M3_OR" && <span>Restore Backup Power! Activate the system using Solar (P) <strong>OR</strong> the Generator (Q). Select the correct gate and trigger it.</span>}
              {phase === "M4_XOR" && <span>Space Airlock! Open the Inner Door (P) <strong>OR</strong> Outer Door (Q), but <strong>NEVER BOTH</strong> (vacuum death!). Select the strict gate and trigger it.</span>}
              {phase === "M5_FAULT" && <span className="text-rose-600"><strong>BZZT!</strong> Fingerprint (Q) permanently broke! Emergency override: select a gate that lets Keycard (P) ALONE open the vault!</span>}
              {phase === "OUTCOME" && "Emergency Override successful! By swapping the logic connective, you restored access."}
            </p>

            {phase === "M1_SANDBOX" && (
              <button 
                onClick={() => { setPhase("M2_AND"); setGate("AND"); resetInputs(); playClick(); }}
                className="w-full py-2 mt-auto bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Start Mission 2 <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Truth Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden shrink-0">
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col items-center justify-center">
              <span className="font-black text-slate-800 text-base tracking-widest uppercase">{gate}</span>
              <span className="font-mono text-[11px] text-blue-600 font-bold mt-1 bg-blue-100 px-2 py-0.5 rounded">Math: {GateSymbols[gate]}</span>
            </div>
            
            <div className="p-3 flex-1 flex flex-col">
              <div className={`grid ${gate === "NOT" ? "grid-cols-2" : "grid-cols-3"} text-center pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b-2 border-slate-100 mb-2`}>
                <div>Input P</div>
                {gate !== "NOT" && <div>Input Q</div>}
                <div>Output</div>
              </div>
              <div className="flex-1 space-y-1">
                {generateTruthTable()}
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT PANE: Sunlit Workbench Circuit */}
        <div className="flex-1 bg-white rounded-3xl shadow-md relative overflow-hidden flex flex-col border border-slate-200">
          
          {/* Engineering Canvas Grid */}
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Gate Selector Tabs */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex bg-white/90 backdrop-blur-md p-1 rounded-full shadow-sm border border-slate-200">
            {(["AND", "OR", "XOR", "NOT"] as GateType[]).map(g => (
              <button
                key={g}
                onClick={() => { setGate(g); playClick(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest transition-all ${gate === g ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Interactive SVG Circuit Canvas */}
          <div className="relative w-full flex-1 flex items-center justify-center min-h-[300px] overflow-hidden">
            {/* Aspect Ratio Lock Container for Perfect Alignment */}
            <div className="relative w-full max-w-[1000px] aspect-[2/1] max-h-full">
              <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm">
                
              <defs>
                <filter id="glowActive" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="700">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Wire P - Extended X to 490 to embed safely in all gate curves */}
              <path id="wireP" d={gate === "NOT" ? "M 150 250 L 490 250.1" : "M 150 150 L 280 150 L 280 220 L 490 220"} fill="none" stroke={inputP ? "#f59e0b" : "#3b82f6"} strokeWidth="8" className="transition-colors duration-200" filter={inputP ? "url(#glowActive)" : ""} />
              
              {/* Wire Q - Extended X to 490 to embed safely in all gate curves */}
              {gate !== "NOT" && (
                <path id="wireQ" d="M 150 350 L 280 350 L 280 280 L 490 280" fill="none" stroke={inputQ ? "#f59e0b" : "#3b82f6"} strokeWidth="8" strokeDasharray={qBroken ? "12,12" : "none"} className="transition-colors duration-200" filter={inputQ && !qBroken ? "url(#glowActive)" : ""} />
              )}
              
              {/* Wire OUT */}
              <path id="wireOut" d="M 520 250 L 850 250.1" fill="none" stroke={result ? "#f59e0b" : "#3b82f6"} strokeWidth="8" className="transition-colors duration-200" filter={result ? "url(#glowActive)" : ""} />
                
                {/* Flowing Pulses */}
                {inputP && (
                  <circle r="6" fill="#fff" filter="url(#glowActive)">
                    <animateMotion dur="1.5s" repeatCount="indefinite"><mpath href="#wireP"/></animateMotion>
                  </circle>
                )}
                {inputQ && !qBroken && gate !== "NOT" && (
                  <circle r="6" fill="#fff" filter="url(#glowActive)">
                    <animateMotion dur="1.5s" repeatCount="indefinite"><mpath href="#wireQ"/></animateMotion>
                  </circle>
                )}
                {result && (
                  <circle r="6" fill="#fff" filter="url(#glowActive)">
                    <animateMotion dur="1s" repeatCount="indefinite"><mpath href="#wireOut"/></animateMotion>
                  </circle>
                )}
              </svg>

              {/* HTML Overlay Controls */}

              {/* Input P Switch */}
              <div className="absolute top-[30%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2" style={{ top: gate === "NOT" ? '50%' : '30%' }}>
                <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  Input P {phase !== "M1_SANDBOX" && <CreditCard size={12} className="text-amber-400" />}
                </div>
                <button 
                  onClick={handleToggleP}
                  className={`w-16 h-24 rounded-xl shadow-xl flex items-center justify-center border-4 transition-all ${inputP ? 'bg-amber-100 border-amber-500' : 'bg-slate-100 border-slate-300'} hover:scale-105 active:scale-95`}
                >
                  <div className={`w-8 h-12 rounded bg-gradient-to-b transition-all shadow-inner ${inputP ? 'from-amber-400 to-amber-600 translate-y-[-10px]' : 'from-slate-300 to-slate-400 translate-y-[10px]'}`} />
                </button>
              </div>
              
              {/* Input Q Switch */}
              {gate !== "NOT" && (
                <div className="absolute top-[70%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
                  <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    Input Q {phase !== "M1_SANDBOX" && <Fingerprint size={12} className={qBroken ? "text-rose-500" : "text-amber-400"} />}
                  </div>
                  <button 
                    onClick={handleToggleQ}
                    className={`w-16 h-24 rounded-xl shadow-xl flex items-center justify-center border-4 transition-all relative ${inputQ ? 'bg-amber-100 border-amber-500' : 'bg-slate-100 border-slate-300'} ${qBroken ? 'opacity-60 cursor-not-allowed !bg-rose-100 !border-rose-400' : 'hover:scale-105 active:scale-95'}`}
                  >
                    <div className={`w-8 h-12 rounded bg-gradient-to-b transition-all shadow-inner ${inputQ ? 'from-amber-400 to-amber-600 translate-y-[-10px]' : 'from-slate-300 to-slate-400 translate-y-[10px]'} ${qBroken ? '!from-rose-400 !to-rose-600' : ''}`} />
                    {qBroken && <Zap size={32} className="absolute text-rose-600 animate-pulse drop-shadow-md" />}
                  </button>
                </div>
              )}

              {/* Authentic Schematic Gate */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <svg viewBox="-60 -60 120 120" className={`w-40 h-40 drop-shadow-xl transition-colors duration-300 ${result ? "text-amber-500" : "text-blue-600"}`}>
                  {renderGateSVG()}
                </svg>
              </div>

              {/* Output Load Module */}
              <div className="absolute top-1/2 left-[85%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
                <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                  {getOutputLabel()}
                </div>
                <div className={`w-28 h-28 rounded-2xl flex items-center justify-center transition-all duration-500 border-8 shadow-2xl ${
                  result
                    ? "bg-amber-100 border-amber-400 text-amber-600 shadow-[0_0_60px_rgba(245,158,11,0.5)] scale-105" 
                    : "bg-slate-100 border-slate-300 text-slate-400"
                }`}>
                  {getOutputIcon()}
                </div>
              </div>

            </div>
          </div>
          
        </div>
        
      </div>
    </LabShell>
  );
}
