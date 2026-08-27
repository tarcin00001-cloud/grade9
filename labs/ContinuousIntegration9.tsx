"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { GitCommit, Bug, RefreshCcw, CheckCircle, XCircle, Zap, Play } from "lucide-react";

// ─── Pipeline Stage Config ─────────────────────────────────────────────────────

const ALL_STAGES = [
  { id: "lint", label: "Lint", color: "#f59e0b", description: "Check code style & syntax" },
  { id: "unit", label: "Unit Tests", color: "#a78bfa", description: "Run automated unit tests" },
  { id: "build", label: "Build", color: "#06b6d4", description: "Compile & bundle the app" },
  { id: "integration", label: "Integration", color: "#10b981", description: "Test component interactions" },
  { id: "deploy", label: "Deploy", color: "#ec4899", description: "Push to production" },
];

type StageId = "lint" | "unit" | "build" | "integration" | "deploy";
type StageStatus = "IDLE" | "RUNNING" | "PASSED" | "FAILED" | "SKIPPED";

interface RunState {
  [key: string]: StageStatus;
}

// ─── Stage Node ────────────────────────────────────────────────────────────────

function StageNode({ stage, status }: { stage: typeof ALL_STAGES[0]; status: StageStatus }) {
  const bgMap: Record<StageStatus, string> = {
    IDLE: "bg-slate-900/40 border-slate-800 text-slate-600",
    RUNNING: "bg-violet-950/60 border-violet-600 text-violet-300",
    PASSED: "bg-emerald-950/40 border-emerald-700/50 text-emerald-300",
    FAILED: "bg-rose-950/60 border-rose-700 text-rose-300",
    SKIPPED: "bg-slate-900/20 border-slate-800/30 text-slate-700",
  };

  return (
    <motion.div
      animate={{ scale: status === "RUNNING" ? 1.04 : 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border-2 p-3 flex flex-col items-center gap-1 min-w-[90px] transition-all ${bgMap[status]}`}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stage.color}22`, border: `2px solid ${status === "IDLE" || status === "SKIPPED" ? "#334155" : stage.color}` }}>
        {status === "RUNNING" && (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3 h-3 border-2 border-t-transparent rounded-full" style={{ borderColor: stage.color, borderTopColor: "transparent" }}/>
        )}
        {status === "PASSED" && <CheckCircle size={14} className="text-emerald-400"/>}
        {status === "FAILED" && <XCircle size={14} className="text-rose-400"/>}
        {status === "IDLE" && <div className="w-2 h-2 rounded-full bg-slate-600"/>}
        {status === "SKIPPED" && <div className="w-2 h-2 rounded-full bg-slate-800"/>}
      </div>
      <span className="text-[10px] font-black text-center leading-tight">{stage.label}</span>
      {status === "RUNNING" && <span className="text-[8px] animate-pulse">running...</span>}
      {status === "PASSED" && <span className="text-[8px] text-emerald-500">✓ passed</span>}
      {status === "FAILED" && <span className="text-[8px] text-rose-500">✕ failed</span>}
      {status === "SKIPPED" && <span className="text-[8px] text-slate-700">skipped</span>}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ContinuousIntegration9() {
  const { reportComplete } = useLMSBridge("continuousintegration9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [enabledStages, setEnabledStages] = useState<Set<StageId>>(new Set(["lint", "unit", "build", "deploy"]));
  const [running, setRunning] = useState(false);
  const [runState, setRunState] = useState<RunState>({});
  const [log, setLog] = useState<string[]>([]);
  const [commitType, setCommitType] = useState<"clean" | "buggy">("clean");
  const [hasWon, setHasWon] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<"IDLE" | "SUCCESS" | "FAILED">("IDLE");

  const toggleStage = (id: StageId) => {
    if (id === "deploy") return; // deploy always required
    setEnabledStages(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    playPop();
  };

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 20));

  const runPipeline = async (isBuggy: boolean) => {
    if (running) return;
    setRunning(true);
    setRunState({});
    setLog([]);
    setPipelineResult("IDLE");
    const type = isBuggy ? "buggy" : "clean";
    setCommitType(type);
    playZap();
    addLog(`[${new Date().toLocaleTimeString()}] Pipeline triggered: ${isBuggy ? "🐛 buggy commit" : "✅ clean commit"}`);

    let failed = false;

    for (const stage of ALL_STAGES) {
      if (!enabledStages.has(stage.id as StageId)) {
        setRunState(s => ({ ...s, [stage.id]: "SKIPPED" }));
        addLog(`  → ${stage.label}: SKIPPED (disabled in pipeline)`);
        continue;
      }

      setRunState(s => ({ ...s, [stage.id]: "RUNNING" }));
      addLog(`  → ${stage.label}: running...`);
      await new Promise(r => setTimeout(r, 700 + Math.random() * 400));

      // Unit tests catch bugs; integration tests also catch bugs
      const willFail = isBuggy && (stage.id === "unit" || stage.id === "integration");

      if (willFail) {
        setRunState(s => ({ ...s, [stage.id]: "FAILED" }));
        addLog(`  ✕ ${stage.label}: FAILED — ${stage.id === "unit" ? "test_auth.spec.js failed: expected 200 got 401" : "integration check failed: API contract broken"}`);
        playError();
        failed = true;

        // Mark remaining stages as skipped
        const remainingIdx = ALL_STAGES.findIndex(s => s.id === stage.id) + 1;
        ALL_STAGES.slice(remainingIdx).forEach(s => {
          if (enabledStages.has(s.id as StageId)) {
            setRunState(prev => ({ ...prev, [s.id]: "SKIPPED" }));
            addLog(`  → ${s.label}: SKIPPED (pipeline halted)`);
          }
        });
        break;
      } else {
        setRunState(s => ({ ...s, [stage.id]: "PASSED" }));
        addLog(`  ✓ ${stage.label}: PASSED`);
        playPop();
      }
    }

    if (failed) {
      setPipelineResult("FAILED");
      addLog(`\n❌ Pipeline FAILED — bug caught before deployment!`);
      if (isBuggy && enabledStages.has("unit") && !hasWon) {
        setHasWon(true);
        setTimeout(reportComplete, 1500);
      }
    } else {
      setPipelineResult("SUCCESS");
      addLog(`\n🚀 Pipeline PASSED — deployed to production!`);
      playSuccess();
    }

    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setRunState({});
    setLog([]);
    setPipelineResult("IDLE");
    setEnabledStages(new Set(["lint", "unit", "build", "deploy"]));
    setHasWon(false);
    playZap();
  };

  return (
    <LabShell labId="continuousintegration9" theme="studio" title="Continuous Integration (CI/CD)" subtitle="L46 · DevOps"
      instruction="Build your own CI/CD pipeline by toggling which stages to include. Then push clean or buggy code. Automated stages run sequentially — if a stage fails, the pipeline halts before deploy. Disable the Unit Tests stage and push buggy code to see what happens when QA is removed!" compact>

      <Celebration isActive={hasWon} message="Bug Caught Before Production! Your automated Unit Test stage detected the bug and halted the pipeline before Deploy. Without CI/CD, a developer would manually upload the buggy code and it would reach real users. Auto-System removes human error from the deployment process." onReplay={reset} />

      <div className="w-full flex flex-col xl:flex-row flex-1 min-h-0 gap-3 pt-1">

        {/* ── LEFT: Pipeline Builder ── */}
        <div className="xl:w-[300px] shrink-0 flex flex-col gap-3">

          {/* Stage Toggles */}
          <div className="panel-glass rounded-2xl border-blue-900/40 p-4 flex flex-col gap-2">
            <div className="text-xs font-bold text-slate-400 mb-1">Pipeline Stages (toggle to include/exclude)</div>
            {ALL_STAGES.map(stage => {
              const isEnabled = enabledStages.has(stage.id as StageId);
              const isRequired = stage.id === "deploy";
              return (
                <button
                  key={stage.id}
                  onClick={() => !isRequired && toggleStage(stage.id as StageId)}
                  disabled={running || isRequired}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-xs ${
                    isEnabled
                      ? "border-opacity-50 bg-opacity-10"
                      : "border-slate-800/50 bg-slate-900/20 text-slate-600 opacity-50"
                  } ${running || isRequired ? "cursor-default" : "hover:scale-[1.01] cursor-pointer"}`}
                  style={isEnabled ? { borderColor: `${stage.color}60`, backgroundColor: `${stage.color}0f` } : {}}
                >
                  <div className="w-3 h-3 rounded-sm border-2 flex items-center justify-center shrink-0" style={{ borderColor: isEnabled ? stage.color : "#334155", backgroundColor: isEnabled ? stage.color : "transparent" }}>
                    {isEnabled && <div className="w-1.5 h-1.5 rounded-sm bg-black"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold" style={{ color: isEnabled ? stage.color : "#475569" }}>{stage.label}</div>
                    <div className="text-[9px] text-slate-600">{stage.description}</div>
                  </div>
                  {isRequired && <span className="text-[8px] text-slate-600 shrink-0">always on</span>}
                </button>
              );
            })}
          </div>

          {/* Push Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => runPipeline(false)}
              disabled={running}
              className="w-full py-3 rounded-xl font-black text-sm bg-blue-600 border-2 border-blue-400 text-white hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              <GitCommit size={16}/> Push Clean Code
            </button>
            <button
              onClick={() => runPipeline(true)}
              disabled={running}
              className="w-full py-3 rounded-xl font-black text-sm bg-rose-700 border-2 border-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Bug size={16}/> Push Buggy Code
            </button>
            <button onClick={reset} className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-all flex items-center justify-center gap-1">
              <RefreshCcw size={12}/> Reset
            </button>
          </div>
        </div>

        {/* ── RIGHT: Pipeline Visualizer + Log ── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          {/* Stage Flow */}
          <div className="shrink-0 panel-glass rounded-2xl border-blue-900/40 p-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {ALL_STAGES.map((stage, i) => {
                const status = runState[stage.id] as StageStatus ?? "IDLE";
                const isEnabled = enabledStages.has(stage.id as StageId);
                return (
                  <div key={stage.id} className="flex items-center gap-2 shrink-0">
                    <StageNode stage={stage} status={!isEnabled && status === "IDLE" ? "SKIPPED" : status} />
                    {i < ALL_STAGES.length - 1 && (
                      <div className={`w-6 h-0.5 rounded ${
                        runState[stage.id] === "PASSED" ? "bg-emerald-500" :
                        runState[stage.id] === "FAILED" ? "bg-rose-500" :
                        "bg-slate-800"
                      }`}/>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pipeline status badge */}
            <AnimatePresence>
              {pipelineResult !== "IDLE" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
                    pipelineResult === "SUCCESS"
                      ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                      : "bg-rose-950/40 text-rose-300 border border-rose-800/40"
                  }`}
                >
                  {pipelineResult === "SUCCESS" ? <Zap size={13}/> : <XCircle size={13}/>}
                  {pipelineResult === "SUCCESS" ? "🚀 Deployed to production successfully!" : "❌ Pipeline halted — bug caught, production protected!"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Console Log */}
          <div className="flex-1 min-h-0 panel-glass rounded-2xl border-slate-800/40 bg-black/50 overflow-hidden flex flex-col">
            <div className="shrink-0 px-4 py-2 border-b border-slate-800/50 text-xs font-bold text-slate-500 font-mono flex items-center gap-2">
              <Play size={10}/> Pipeline Console
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-[10px] leading-relaxed">
              {log.length === 0 ? (
                <div className="text-slate-700">$ awaiting commit push...</div>
              ) : (
                log.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${
                      line.includes("FAILED") || line.includes("❌") ? "text-rose-400" :
                      line.includes("PASSED") || line.includes("🚀") ? "text-emerald-400" :
                      line.includes("SKIPPED") ? "text-slate-600" :
                      line.includes("running") ? "text-violet-400" :
                      "text-slate-400"
                    }`}
                  >
                    {line}
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </LabShell>
  );
}
