"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Server, Search, AlertTriangle, ShieldCheck, Siren, HeartPulse, ShieldAlert, GitMerge,
  MousePointerClick, Flame, Info
} from "lucide-react";

const TOTAL_SERVERS = 30;

type Rule = { id: string, regex: string, isBad: boolean, desc: string };
const RULES: Rule[] = [
    { id: 'A', regex: "^192\\.168\\.[0-9]{1,3}\\.[0-9]{1,3}$", isBad: false, desc: "Standard IP Allowlist" },
    { id: 'B', regex: `(?:(?:"|'|\\]|\\}|\\\\|\\d)+[)];?((?:\\s|-|~|!).*)*)`, isBad: true, desc: "XSS Block (Cloudflare 2019)" },
    { id: 'C', regex: "^[a-zA-Z0-9_]{3,16}$", isBad: false, desc: "Username Validation" }
];

type ComponentType = 'canary' | 'monitor' | 'global';
type PipelineSlot = ComponentType | null;

// Hardcoded visual steps for the Mini-Bomb tutorial
const MINI_BOMB_STEPS = [
    { text: <>aaaaX</>, note: "Start parsing string..." },
    { text: <><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">a</span>aaaX</>, note: "Matches first 'a'" },
    { text: <><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">aa</span>aaX</>, note: "Matches 'aa'" },
    { text: <><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">aaa</span>aX</>, note: "Matches 'aaa'" },
    { text: <><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">aaaa</span>X</>, note: "Matches 'aaaa'" },
    { text: <><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">aaaa</span><span className="bg-rose-500/50 border border-rose-500 rounded px-0.5">X</span></>, note: "ERROR: 'X' does not match!" },
    { text: <><span className="bg-amber-500/30 border border-amber-500 rounded px-0.5">aaa</span>aX</>, note: "BACKTRACKING: Engine steps back to try a different combination..." },
    { text: <><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">aaa</span><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">a</span>X</>, note: "Matches 'aaa', then matches 'a' separately" },
    { text: <><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">aaa</span><span className="bg-emerald-500/30 border border-emerald-500 rounded px-0.5">a</span><span className="bg-rose-500/50 border border-rose-500 rounded px-0.5">X</span></>, note: "ERROR: 'X' fails again!" },
    { text: <><span className="bg-amber-500/30 border border-amber-500 rounded px-0.5">aa</span>aaX</>, note: "BACKTRACKING DEEPER: Steps back again..." }
];

export default function Cloudflare9() {
  const { reportComplete } = useLMSBridge("cloudflare9");
  const { playPop, playZap, playSuccess, playError, playChime, playHeavyThud, playClick } = useLabAudio();

  const [mission, setMission] = useState<0 | 1 | 2>(0);
  
  // Mission 0 State (Mini-Bomb)
  const [miniStep, setMiniStep] = useState(0);

  // Mission 1 State (Detective)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [testState, setTestState] = useState<'idle' | 'testing' | 'safe' | 'bomb'>('idle');
  const [calcSteps, setCalcSteps] = useState(0);
  const [identifiedBad, setIdentifiedBad] = useState(false);

  // Mission 2 State (Architect)
  const [pipeline, setPipeline] = useState<PipelineSlot[]>([null, null, null]);
  const [deployState, setDeployState] = useState<'idle' | 'deploying' | 'outage' | 'saved'>('idle');
  const [serverStates, setServerStates] = useState<"idle" | "active" | "fire"[]>(Array(TOTAL_SERVERS).fill("idle"));
  const [hasWon, setHasWon] = useState(false);
  const [blastRadius, setBlastRadius] = useState(0); // 0 to 100

  // M1: Test Rule Animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testState === 'testing' && selectedRule) {
        setCalcSteps(0);
        let step = 0;
        let multiplier = 2;
        
        interval = setInterval(() => {
            step++;
            if (selectedRule.isBad) {
                setCalcSteps(prev => prev + multiplier);
                multiplier = Math.floor(multiplier * 1.5);
                if (step % 5 === 0) playHeavyThud();
                if (step > 35) {
                    clearInterval(interval);
                    setTestState('bomb');
                    setIdentifiedBad(true);
                    playError();
                }
            } else {
                setCalcSteps(prev => prev + 1);
                if (step % 4 === 0) playPop();
                if (step > 15) {
                    clearInterval(interval);
                    setTestState('safe');
                    playSuccess();
                }
            }
        }, 80);
    }
    return () => clearInterval(interval);
  }, [testState, selectedRule]);

  // M2: Pipeline Deploy Animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (deployState === 'deploying') {
        const isCorrect = pipeline[0] === 'canary' && pipeline[1] === 'monitor' && pipeline[2] === 'global';
        let step = 0;
        
        interval = setInterval(() => {
            step++;
            if (step === 5) {
                // Hits slot 1 (Canary or Global)
                if (pipeline[0] === 'global' || pipeline[0] === 'monitor') {
                     // Bad rule hits global immediately
                     setServerStates(Array(TOTAL_SERVERS).fill("fire"));
                     setBlastRadius(100);
                     playError();
                     setDeployState('outage');
                     clearInterval(interval);
                } else if (pipeline[0] === 'canary') {
                     setServerStates(prev => { const n = [...prev]; n[0] = "fire"; return n; });
                     setBlastRadius(3); // 1 server out of 30
                     playHeavyThud();
                }
            }
            if (step === 15) {
                // Hits slot 2
                if (pipeline[0] === 'canary' && pipeline[1] === 'monitor') {
                    // Monitor caught it!
                    clearInterval(interval);
                    setDeployState('saved');
                    setHasWon(true);
                    playSuccess();
                    reportComplete();
                } else if (pipeline[0] === 'canary' && pipeline[1] === 'global') {
                    // Bleed to global!
                    setServerStates(Array(TOTAL_SERVERS).fill("fire"));
                    setBlastRadius(100);
                    playError();
                    setDeployState('outage');
                    clearInterval(interval);
                }
            }
        }, 100);
    }
    return () => clearInterval(interval);
  }, [deployState, pipeline]);

  const testRule = (rule: Rule) => {
      playClick();
      setSelectedRule(rule);
      setTestState('testing');
  };

  const assignSlot = (slotIdx: number, comp: ComponentType) => {
      if (deployState !== 'idle') return;
      playClick();
      setPipeline(prev => {
          const next = [...prev];
          const existingIdx = next.indexOf(comp);
          if (existingIdx !== -1) next[existingIdx] = null;
          next[slotIdx] = comp;
          return next;
      });
  };

  const handleDeploy = () => {
      if (pipeline.includes(null)) return;
      playClick();
      setDeployState('deploying');
  };

  const handleRollback = () => {
      playZap();
      setDeployState('idle');
      setServerStates(Array(TOTAL_SERVERS).fill("idle"));
      setBlastRadius(0);
  };

  const advanceMiniBomb = () => {
      playClick();
      if (miniStep < MINI_BOMB_STEPS.length - 1) {
          setMiniStep(prev => prev + 1);
      }
  }

  return (
    <LabShell
      labId="cloudflare9"
      title="Cloudflare WAF Incident"
      compact={true}
      bgOverride="bg-slate-200"
      instruction={
          mission === 0 ? "Tutorial: What is Exponential Backtracking? Watch how a simple Regex can get confused." :
          mission === 1 ? "Mission 1: Find the CPU Bomb. Test the Regex rules to find the one causing catastrophic backtracking." : 
          "Mission 2: Build a deployment pipeline to minimize the Blast Radius of bad rules."
      }
      onReset={() => {
        setMission(0);
        setMiniStep(0);
        setSelectedRule(null);
        setTestState('idle');
        setCalcSteps(0);
        setIdentifiedBad(false);
        setPipeline([null, null, null]);
        setDeployState('idle');
        setServerStates(Array(TOTAL_SERVERS).fill("idle"));
        setBlastRadius(0);
        setHasWon(false);
      }}
    >
      <Celebration 
        isActive={hasWon} 
        message="Crisis Averted! You isolated the dangerous Regex using a Canary Deployment and kept the Blast Radius to 3%!" 
      />

      <div className="flex flex-col w-full h-full min-h-0 font-sans overflow-hidden p-2 sm:p-4 gap-4" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        
        {/* TOP STATUS BAR */}
        <div className="shrink-0 bg-slate-900 rounded-xl p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between border-b-4 border-slate-700 z-10 gap-2">
            <div className="flex items-center gap-3 text-white w-full sm:w-auto">
                <ShieldCheck size={28} className={deployState === 'outage' ? "text-rose-500" : "text-emerald-400"} />
                <div>
                    <h2 className="font-black text-sm uppercase tracking-widest">Global WAF Control Desk</h2>
                    <p className="text-[10px] text-slate-400 font-mono">PHASE: {mission === 0 ? "TUTORIAL" : mission === 1 ? "REGEX_DEBUG" : "PIPELINE_ARCHITECT"}</p>
                </div>
            </div>

            {/* BLAST RADIUS METER (Visible in Mission 2) */}
            <AnimatePresence>
                {mission === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 w-full sm:w-64 bg-slate-800 p-2 rounded-lg border border-slate-700">
                        <Flame size={16} className={blastRadius > 5 ? "text-rose-500" : "text-amber-500"} />
                        <div className="flex-1">
                            <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-1">
                                <span>Blast Radius</span>
                                <span className={blastRadius === 100 ? "text-rose-500" : "text-emerald-400"}>{blastRadius}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <motion.div 
                                    animate={{ width: `${blastRadius}%` }}
                                    className={`h-full ${blastRadius === 100 ? 'bg-rose-500' : blastRadius > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {deployState === 'outage' && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-black shadow-inner border-2 bg-rose-500 text-white border-rose-400 shadow-rose-900 animate-pulse">
                    <Siren size={16} /> SEV-1 OUTAGE
                </div>
            )}
        </div>

        {/* MISSION 0: MINI-BOMB TUTORIAL */}
        {mission === 0 && (
            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 z-10">
                <div className="flex-[0.8] bg-slate-900 rounded-xl shadow-xl border-4 border-slate-800 p-6 flex flex-col justify-center">
                    <h3 className="font-black text-cyan-400 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Info size={18} /> The "Mini-Bomb" Regex
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                        A Regex engine tries to match text patterns. If it fails, it <strong className="text-amber-400">backtracks</strong> to try a different path.
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        Look at this rule: <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono">^(a+)+$</code><br/><br/>
                        It looks for repeating <code className="text-emerald-400">a</code>'s. Let's see what happens when we feed it the word <code className="text-rose-400 font-mono">aaaaX</code>.
                    </p>
                </div>

                <div className="flex-1 bg-white rounded-xl shadow-xl border-4 border-slate-300 p-6 flex flex-col relative items-center justify-center">
                    <div className="bg-slate-900 p-6 rounded-xl border-4 border-slate-800 text-center w-full max-w-sm mb-8 shadow-2xl">
                        <span className="block text-[10px] text-slate-500 uppercase font-black mb-2">Engine State</span>
                        <div className="font-mono text-3xl tracking-[0.2em] text-slate-400 font-bold mb-4">
                            {MINI_BOMB_STEPS[miniStep].text}
                        </div>
                        <div className="text-xs font-bold text-amber-500 bg-amber-500/10 p-2 rounded h-12 flex items-center justify-center">
                            {MINI_BOMB_STEPS[miniStep].note}
                        </div>
                    </div>

                    {miniStep < MINI_BOMB_STEPS.length - 1 ? (
                        <button onClick={advanceMiniBomb} className="px-6 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-lg uppercase tracking-widest shadow-lg border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2">
                            <MousePointerClick size={20} /> Step Engine Forward
                        </button>
                    ) : (
                        <AnimatePresence>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                <p className="text-xs font-bold text-slate-600 mb-4 max-w-xs mx-auto">
                                    The nested <code className="bg-slate-100 px-1 rounded">+</code> signs forced it to guess every possible grouping. Now imagine this on a massive string!
                                </p>
                                <button onClick={() => { playChime(); setMission(1); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-lg uppercase tracking-widest shadow-md">
                                    Proceed to Mission 1
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        )}

        {/* MISSION 1: REGEX DEBUGGER */}
        {mission === 1 && (
            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 z-10">
                {/* Rule Selector */}
                <div className="flex-1 bg-white rounded-xl shadow-xl border-4 border-slate-300 p-4 flex flex-col gap-3 overflow-y-auto">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-2 border-b-2 border-slate-100 pb-2">Proposed WAF Rules</h3>
                    {RULES.map(rule => (
                        <button 
                            key={rule.id}
                            onClick={() => testRule(rule)}
                            disabled={testState === 'testing'}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                                selectedRule?.id === rule.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-slate-400'
                            }`}
                        >
                            <span className="block text-[10px] font-black text-slate-500 uppercase mb-1">Rule {rule.id} • {rule.desc}</span>
                            <span className="font-mono text-[10px] sm:text-xs text-slate-700 break-all">{rule.regex}</span>
                        </button>
                    ))}
                    
                    <AnimatePresence>
                        {identifiedBad && testState !== 'testing' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                <button onClick={() => { playChime(); setMission(2); }} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-lg uppercase tracking-widest shadow-md">
                                    Proceed to Pipeline Builder
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Engine Visualizer */}
                <div className="flex-[1.2] bg-slate-900 rounded-xl shadow-xl border-4 border-slate-800 p-4 flex flex-col relative overflow-hidden">
                    <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Search size={16} className="text-cyan-400" /> Regex Engine Visualizer
                    </h3>

                    <div className="flex-1 flex flex-col justify-center items-center relative">
                        <div className="font-mono text-sm sm:text-base text-slate-500 tracking-widest mb-8">
                            {'<script>'}alert('xss'){'</script>'}
                            <AnimatePresence>
                                {testState === 'testing' && (
                                    <motion.div 
                                        animate={selectedRule?.isBad ? { x: [-40, 80, -20, 60, -10, 90, 0] } : { x: [0, 150] }}
                                        transition={{ duration: selectedRule?.isBad ? 0.3 : 1.2, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 left-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                    >
                                        <Search size={32} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <div className="bg-slate-950 p-4 rounded-xl border-2 border-slate-800 w-full text-center">
                            <span className="block text-[10px] text-slate-500 uppercase font-black mb-1">Compute Steps Required</span>
                            <span className={`font-mono text-4xl font-black ${(calcSteps > 1000) ? 'text-rose-500' : 'text-cyan-400'}`}>
                                {calcSteps.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {testState === 'bomb' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 bg-rose-950 border-2 border-rose-500 rounded-lg p-3 shadow-2xl">
                                <h4 className="font-black text-rose-400 uppercase text-xs">CPU Bomb Detected!</h4>
                                <p className="text-rose-200 text-[10px] mt-1 leading-tight">
                                    The massive nested quantifiers <span className="font-mono bg-rose-900 px-1 rounded">(?:...)+</span> and <span className="font-mono bg-rose-900 px-1 rounded">.*</span> caused the same Exponential Backtracking we saw in the tutorial!
                                </p>
                            </motion.div>
                        )}
                        {testState === 'safe' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 bg-emerald-950 border-2 border-emerald-500 rounded-lg p-3 shadow-2xl">
                                <h4 className="font-black text-emerald-400 uppercase text-xs">Rule Safe</h4>
                                <p className="text-emerald-200 text-[10px] mt-1">Regex resolved instantly. No catastrophic nested quantifiers found.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        )}

        {/* MISSION 2: PIPELINE BUILDER */}
        {mission === 2 && (
            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 z-10">
                
                {/* Pipeline Construction */}
                <div className="flex-1 bg-slate-900 rounded-xl shadow-xl border-4 border-slate-800 p-4 flex flex-col">
                    <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                        <GitMerge size={16} className="text-indigo-400" /> Deployment Pipeline
                    </h3>
                    <p className="text-slate-500 text-[10px] mb-4">Click components below to assemble a safe release pipeline to test the CPU Bomb rule.</p>

                    {/* Pipeline Slots */}
                    <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border-2 border-slate-800 mb-6 relative">
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2" />
                        {[0, 1, 2].map(idx => (
                            <div key={idx} className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center transition-colors ${
                                pipeline[idx] ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-900 border-slate-700 border-dashed'
                            }`}>
                                {pipeline[idx] === 'canary' && <><Server size={24} className="text-amber-400 mb-1"/><span className="text-[10px] font-bold text-slate-300">Canary Node (1%)</span></>}
                                {pipeline[idx] === 'monitor' && <><HeartPulse size={24} className="text-emerald-400 mb-1"/><span className="text-[10px] font-bold text-slate-300">Health Monitor</span></>}
                                {pipeline[idx] === 'global' && <><Server size={24} className="text-sky-400 mb-1"/><span className="text-[10px] font-bold text-slate-300">Global Edge (99%)</span></>}
                                {!pipeline[idx] && <span className="text-[10px] font-bold text-slate-600">Slot {idx+1}</span>}
                            </div>
                        ))}
                    </div>

                    {/* Available Components */}
                    <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-2">Available Components</h3>
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => assignSlot(pipeline.indexOf(null) !== -1 ? pipeline.indexOf(null) : 0, 'canary')} disabled={deployState !== 'idle'} className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-lg p-2 flex flex-col items-center">
                            <Server size={16} className="text-amber-400 mb-1" />
                            <span className="text-[9px] font-bold text-slate-300 leading-tight text-center">Canary Node (1%)</span>
                        </button>
                        <button onClick={() => assignSlot(pipeline.indexOf(null) !== -1 ? pipeline.indexOf(null) : 1, 'monitor')} disabled={deployState !== 'idle'} className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-lg p-2 flex flex-col items-center">
                            <HeartPulse size={16} className="text-emerald-400 mb-1" />
                            <span className="text-[9px] font-bold text-slate-300 leading-tight text-center">Health Monitor</span>
                        </button>
                        <button onClick={() => assignSlot(pipeline.indexOf(null) !== -1 ? pipeline.indexOf(null) : 2, 'global')} disabled={deployState !== 'idle'} className="flex-1 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-lg p-2 flex flex-col items-center">
                            <Server size={16} className="text-sky-400 mb-1" />
                            <span className="text-[9px] font-bold text-slate-300 leading-tight text-center">Global Edge (99%)</span>
                        </button>
                    </div>

                    <div className="mt-auto flex gap-2">
                         <button 
                            onClick={handleDeploy} 
                            disabled={pipeline.includes(null) || deployState !== 'idle'} 
                            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black rounded-lg uppercase tracking-widest shadow-md transition-colors"
                        >
                            Deploy CPU Bomb
                        </button>
                        {deployState === 'outage' && (
                             <button onClick={handleRollback} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-lg uppercase tracking-widest shadow-md">
                                ROLLBACK
                            </button>
                        )}
                    </div>
                </div>

                {/* Global Network Visualizer */}
                <div className="flex-[1.2] bg-white rounded-xl shadow-xl border-4 border-slate-300 p-4 flex flex-col relative overflow-hidden">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Server size={18} className="text-indigo-600" /> Global Edge Network
                    </h3>
                    
                    <div className="flex-1 flex flex-wrap gap-2 content-start">
                        {serverStates.map((state, i) => (
                            <motion.div 
                                key={i}
                                animate={state === 'fire' ? { x: [-2, 2, -2, 2, 0], y: [-2, 2, -2, 2, 0] } : {}}
                                transition={{ duration: 0.2, repeat: state === 'fire' ? Infinity : 0 }}
                                className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center shadow-sm transition-colors ${
                                    state === 'idle' ? 'bg-slate-100 border-slate-200' :
                                    state === 'active' ? 'bg-emerald-100 border-emerald-400' :
                                    'bg-rose-500 border-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                                }`}
                            >
                                {state === 'idle' && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                                {state === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                {state === 'fire' && <ShieldAlert size={12} className="text-white" />}
                            </motion.div>
                        ))}
                    </div>

                    <AnimatePresence>
                        {deployState === 'outage' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 bg-rose-100 border-2 border-rose-500 rounded-lg p-3 shadow-xl flex items-center gap-3">
                                <AlertTriangle size={24} className="text-rose-600 shrink-0" />
                                <div>
                                    <h4 className="font-black text-rose-800 uppercase text-[10px]">Global Outage (Blast Radius: 100%)</h4>
                                    <p className="text-rose-700 text-[9px] font-bold leading-tight mt-0.5">Your pipeline deployed the CPU bomb directly to the Global Edge! Hit Rollback and rethink your pipeline order.</p>
                                </div>
                            </motion.div>
                        )}
                        {deployState === 'saved' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 bg-emerald-100 border-2 border-emerald-500 rounded-lg p-3 shadow-xl flex items-center gap-3">
                                <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
                                <div>
                                    <h4 className="font-black text-emerald-800 uppercase text-[10px]">Pipeline Safe (Blast Radius: 3%)</h4>
                                    <p className="text-emerald-700 text-[9px] font-bold leading-tight mt-0.5">The Canary Node crashed, but the Health Monitor caught the CPU spike and halted the global rollout!</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        )}

      </div>
    </LabShell>
  );
}
