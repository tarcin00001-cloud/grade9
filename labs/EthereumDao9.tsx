"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  Box, 
  ArrowRight, 
  Cpu, 
  Zap, 
  Database, 
  CheckCircle, 
  Info, 
  Lock, 
  Unlock, 
  Activity, 
  Shield
} from "lucide-react";

// ─── TYPES & CONSTANTS ────────────────────────────────────────────────────────

interface CodeBlock {
  id: string;
  code: string;
  role: "check" | "effect" | "interaction";
  desc: string;
}

const INITIAL_BLOCKS: CodeBlock[] = [
  { 
    id: "interaction", 
    code: "msg.sender.call{value: amt}(\"\");", 
    role: "interaction",
    desc: "INTERACTION: Send Ether to the requesting user address." 
  },
  { 
    id: "check", 
    code: "uint amt = balances[msg.sender];", 
    role: "check",
    desc: "CHECK: Verify the user balance exists in the ledger."
  },
  { 
    id: "effect", 
    code: "balances[msg.sender] = 0;", 
    role: "effect",
    desc: "EFFECT: Zero out the user balance in internal memory state."
  }
];

const SCENARIOS = [
  {
    title: "Retrieve Stolen Assets & Maintain Utility",
    desc: "The majority of users want their stolen Ether returned. They propose editing block state history to transfer the hacker's balances back to a refund pool, establishing a new chain branch.",
    solution: "hardfork",
    remediation: "Deploying a Hard Fork rollback returns funds to users but breaks immutability, splitting Ethereum into two chains (ETH and ETC)."
  },
  {
    title: "Preserve Absolute Blockchain Immutability",
    desc: "Purists believe that 'Code is Law'. They demand that the blockchain's history remain unaltered and refuse to run any modified block consensus client software.",
    solution: "donothing",
    remediation: "Doing nothing maintains the original chain (Ethereum Classic), letting the hacker keep the funds but preserving strict database immutability."
  },
  {
    title: "Block Hacker Asset Movement Temporarily",
    desc: "Miners look for a minor patch to reject blocks containing transactions from the attacker's contract address, freezing the funds without rewriting historical block data.",
    solution: "softfork",
    remediation: "Deploying a Soft Fork address lockout freezes the stolen assets at a protocol consensus level without resetting block history."
  }
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function EthereumDao9() {
  const { reportComplete } = useLMSBridge("ethereumdao9");
  const { playPop, playSuccess, playError, playZap, playChime, playDrop } = useLabAudio();

  const [phase, setPhase] = useState<"audit" | "exploit" | "consensus">("audit");
  const [hasWon, setHasWon] = useState(false);

  // Level 1: Smart Contract Auditor States
  const [orderedBlocks, setOrderedBlocks] = useState<CodeBlock[]>([]);
  const [auditedCompleted, setAuditedCompleted] = useState(false);
  const [auditMessage, setAuditMessage] = useState("Solidity statements are executed in sequence. Fix the reentrancy code order.");

  // Level 2: Fallback Loop Hijacker States
  const [daoBalance, setDaoBalance] = useState(5);
  const [hackerBalance, setHackerBalance] = useState(0);
  const [exploitState, setExploitState] = useState<"idle" | "withdrawing" | "awaiting_reentry" | "done">("idle");
  const [exploitLoopCount, setExploitLoopCount] = useState(0);
  const [exploitMessage, setExploitMessage] = useState("Smart contract has withdraw before state updates. Click Start Exploit.");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Level 3: Consensus States
  const [currentScenario, setCurrentScenario] = useState(0);
  const [level3Completed, setLevel3Completed] = useState(false);
  const [level3Message, setLevel3Message] = useState("Select the correct blockchain response to resolve the threat.");
  const [scenarioTested, setScenarioTested] = useState(false);
  const [scenarioPassed, setScenarioPassed] = useState<boolean | null>(null);
  const [governanceSelection, setGovernanceSelection] = useState<"none" | "hardfork" | "softfork" | "donothing">("none");

  // Initialize Auditing Blocks in out-of-order state
  useEffect(() => {
    // Mix the blocks: [Interaction, Effect, Check]
    setOrderedBlocks([
      INITIAL_BLOCKS[0], // Interaction
      INITIAL_BLOCKS[2], // Effect
      INITIAL_BLOCKS[1]  // Check
    ]);
  }, []);

  // Level 1 Actions
  const moveBlock = (index: number, direction: "up" | "down") => {
    if (auditedCompleted) return;
    const newBlocks = [...orderedBlocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    
    setOrderedBlocks(newBlocks);
    playPop();
  };

  const checkAuditOrder = () => {
    const isCorrect = 
      orderedBlocks[0].role === "check" && 
      orderedBlocks[1].role === "effect" && 
      orderedBlocks[2].role === "interaction";
      
    if (isCorrect) {
      playSuccess();
      setAuditedCompleted(true);
      setAuditMessage("✓ Audit Pass! The contract updates the user balance BEFORE sending Ether. Reentrancy blocked!");
    } else {
      playError();
      setAuditMessage("✗ Audit Fail! Balances are updated AFTER the external call, leaving the contract open to reentrancy attacks.");
    }
  };

  // Level 2 Actions
  const startExploit = () => {
    if (exploitState !== "idle" || level2Completed) return;
    setExploitState("withdrawing");
    playZap();
    setExploitMessage("Exploit Contract deployed. Requesting withdrawal of 1 ETH...");

    // Trigger fallback window
    timerRef.current = setTimeout(() => {
      setExploitState("awaiting_reentry");
      playChime();
      setExploitMessage("⚡ INTERCEPTED! DAO sent 1 ETH. Hacker Fallback triggered! Re-enter withdraw() now!");
      
      // Auto-fail after 1.5 seconds if they don't click Re-enter
      timerRef.current = setTimeout(() => {
        playError();
        setExploitState("idle");
        setExploitLoopCount(0);
        setDaoBalance(5);
        setHackerBalance(0);
        setExploitMessage("✗ Ledger updated! Loop closed before re-entry. Exploit failed. Click Start Exploit to try again.");
      }, 1500);

    }, 1000);
  };

  const clickReentry = () => {
    if (exploitState !== "awaiting_reentry") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const nextCount = exploitLoopCount + 1;
    setExploitLoopCount(nextCount);
    
    const nextDao = daoBalance - 1;
    const nextHacker = hackerBalance + 1;
    setDaoBalance(nextDao);
    setHackerBalance(nextHacker);

    if (nextDao <= 0) {
      playSuccess();
      setExploitState("done");
      setExploitMessage("🎉 Success! The DAO contract is drained completely. Reentrancy exploit successful!");
    } else {
      playPop();
      setExploitState("withdrawing");
      setExploitMessage(`✓ Re-entered! Stack depth = ${nextCount}. Sending another withdrawal request...`);

      // Trigger next re-entry window
      timerRef.current = setTimeout(() => {
        setExploitState("awaiting_reentry");
        playChime();
        setExploitMessage("⚡ INTERCEPTED! DAO sent 1 ETH. Fallback triggered! Re-enter now!");

        timerRef.current = setTimeout(() => {
          playError();
          setExploitState("idle");
          setExploitLoopCount(0);
          setDaoBalance(5);
          setHackerBalance(0);
          setExploitMessage("✗ Ledger updated! Loop closed. Exploit failed. Try again!");
        }, 1500);

      }, 1000);
    }
  };

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Level 3 Actions
  const handleSelectGovernance = (option: "hardfork" | "softfork" | "donothing") => {
    if (level3Completed || scenarioTested) return;
    setGovernanceSelection(option);
    playPop();
  };

  const deployConsensus = () => {
    if (governanceSelection === "none" || scenarioTested || level3Completed) return;
    setScenarioTested(true);
    const targetScenario = SCENARIOS[currentScenario];
    const isCorrect = governanceSelection === targetScenario.solution;

    if (isCorrect) {
      playSuccess();
      setScenarioPassed(true);
      setLevel3Message("Consensus reached. Blockchain state updated.");
      
      setTimeout(() => {
        if (currentScenario + 1 >= SCENARIOS.length) {
          setLevel3Completed(true);
          setHasWon(true);
          reportComplete();
        } else {
          setCurrentScenario(prev => prev + 1);
          setGovernanceSelection("none");
          setScenarioTested(false);
          setScenarioPassed(null);
          setLevel3Message("Select the correct blockchain response to resolve the threat.");
        }
      }, 2500);
    } else {
      playError();
      setScenarioPassed(false);
      setLevel3Message("Consensus rejected. Split path vulnerable.");
      
      setTimeout(() => {
        setScenarioTested(false);
        setScenarioPassed(null);
        setGovernanceSelection("none");
        setLevel3Message("Select the correct blockchain response to resolve the threat.");
      }, 2000);
    }
  };

  const handleReplay = () => {
    setPhase("audit");
    setOrderedBlocks([
      INITIAL_BLOCKS[0], // Interaction
      INITIAL_BLOCKS[2], // Effect
      INITIAL_BLOCKS[1]  // Check
    ]);
    setAuditedCompleted(false);
    setAuditMessage("Solidity statements are executed in sequence. Fix the reentrancy code order.");

    setDaoBalance(5);
    setHackerBalance(0);
    setExploitState("idle");
    setExploitLoopCount(0);
    setExploitMessage("Smart contract has withdraw before state updates. Click Start Exploit.");

    setCurrentScenario(0);
    setLevel3Completed(false);
    setLevel3Message("Select the correct blockchain response to resolve the threat.");
    setScenarioTested(false);
    setScenarioPassed(null);
    setGovernanceSelection("none");

    setHasWon(false);
  };

  const level2Completed = exploitState === "done";

  return (
    <LabShell
      labId="ethereumdao9" theme="forge"
      bgOverride="bg-retro-console"
      title="The Ethereum DAO Reentrancy Lab"
      onReset={handleReplay}
      instruction="1. Learn about smart contracts and the concept of a reentrancy attack on the Ethereum blockchain. 2. Analyze the vulnerable DAO smart contract code provided in the simulation. 3. Execute a simulated reentrancy exploit to drain funds from the contract. 4. Apply the recommended security patch to fix the vulnerability and re-test."
      compact
    >

      <style>{`
        .bg-retro-console {
          background: linear-gradient(135deg, #faf5ff 0%, #e0f2fe 50%, #f0fdf4 100%) !important;
          position: relative;
        }

        .bg-retro-console::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.07) 2.5px, transparent 2.5px), 
            linear-gradient(90deg, rgba(59, 130, 246, 0.07) 2.5px, transparent 2.5px);
          background-size: 40px 40px;
          animation: gridMove 15s linear infinite;
          pointer-events: none;
        }

        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }

        .toy-panel {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 20px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
          color: #0f172a !important;
          padding: 0.75rem !important;
          display: flex;
          flex-direction: column;
          position: relative;
          font-size: 0.95rem;
        }
        @media (min-width: 768px) {
          .toy-panel {
            border: 1px solid #cbd5e1 !important;
            border-radius: 32px !important;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
            padding: 1.5rem !important;
            font-size: 1.15rem;
          }
        }

        .toy-screen {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 14px !important;
          padding: 0.75rem !important;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02) !important;
          color: #0f172a !important;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          position: relative;
          font-size: 0.95rem;
        }
        @media (min-width: 768px) {
          .toy-screen {
            border: 1px solid #e2e8f0 !important;
            border-radius: 24px !important;
            padding: 1.25rem !important;
            font-size: 1.15rem;
          }
        }

        .toy-btn-tab {
          border: 1px solid #cbd5e1 !important;
          border-radius: 14px !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          font-weight: 950 !important;
          background: #f1f5f9 !important;
          color: #475569 !important;
          transition: all 0.1s ease;
          font-size: 0.85rem !important;
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
        @media (min-width: 768px) {
          .toy-btn-tab {
            border: 1px solid #cbd5e1 !important;
            border-radius: 20px !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
            font-size: 1.15rem !important;
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
        }

        .toy-btn-tab:not([disabled]):hover {
          transform: translateY(-1.5px);
          box-shadow: 0 3px 6px rgba(0,0,0,0.08) !important;
          color: #0f172a;
          background: #e2e8f0 !important;
        }

        .toy-btn-tab.active-tab {
          background: #ef4444 !important;
          color: #ffffff !important;
          transform: translateY(1.5px);
          box-shadow: none !important;
        }

        .toy-btn-action {
          background: #ef4444 !important;
          color: #ffffff !important;
          border: 1px solid #b91c1c !important;
          border-radius: 18px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          font-weight: 950 !important;
          transition: all 0.1s ease;
          font-size: 0.95rem !important;
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
        @media (min-width: 768px) {
          .toy-btn-action {
            border: 1px solid #b91c1c !important;
            border-radius: 24px !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
            font-size: 1.2rem !important;
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
        }

        .toy-btn-action:hover:not([disabled]) {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 8px rgba(0,0,0,0.15) !important;
          background: #dc2626 !important;
        }

        .toy-btn-action:active:not([disabled]) {
          transform: translateY(1.5px) !important;
          box-shadow: none !important;
        }
      `}</style>

      <Celebration
        isActive={hasWon}
        message="Vulnerabilities and aftermath resolved! You successfully audited the contract order, executed reentrancy loop timing, and deployed a Hard Fork consensus refund!"
        onReplay={handleReplay}
      />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-3 pt-1 relative select-none">
        
        {/* Navigation Tabs */}
        <div className="shrink-0 flex gap-3">
          <button
            onClick={() => { setPhase("audit"); playPop(); }}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              phase === "audit" ? "active-tab text-white" : "bg-stone-900 text-stone-300"
            }`}
          >
            Smart Contract Auditor
          </button>
          <button
            onClick={() => { if (auditedCompleted) { setPhase("exploit"); playPop(); } }}
            disabled={!auditedCompleted}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              !auditedCompleted ? "opacity-25 cursor-not-allowed bg-stone-800 border-stone-700 text-stone-500" :
              phase === "exploit" ? "active-tab text-white" : "bg-stone-900 text-stone-300"
            }`}
          >
            Fallback Loop Hijacker
          </button>
          <button
            onClick={() => { if (auditedCompleted && level2Completed) { setPhase("consensus"); playPop(); } }}
            disabled={!auditedCompleted || !level2Completed}
            className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-wider toy-btn-tab ${
              (!auditedCompleted || !level2Completed) ? "opacity-25 cursor-not-allowed bg-stone-800 border-stone-700 text-stone-500" :
              phase === "consensus" ? "active-tab text-white" : "bg-stone-900 text-stone-300"
            }`}
          >
            Blockchain Hard Fork
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* LEVEL 1: Smart Contract Auditor */}
          {phase === "audit" && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* Audit Instructions */}
                <div className="lg:col-span-4 toy-panel flex flex-col min-h-0">
                  <div className="toy-screen bg-stone-50 p-4 flex flex-col gap-4 flex-1">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Auditing Inspector</span>

                    <div className="flex flex-col gap-3 flex-1 justify-center">
                      <p className="text-xs text-stone-600 font-bold leading-normal">
                        Arranging withdraw instructions incorrectly allows attackers to loop execution recursively before their balances are updated.
                      </p>

                      <button
                        onClick={checkAuditOrder}
                        disabled={auditedCompleted}
                        className="w-full toy-btn-action bg-amber-600 text-white py-3.5 font-black text-sm uppercase flex items-center justify-center gap-2 rounded-xl active:translate-y-1"
                      >
                        <Shield className="w-4 h-4" /> Run Auditing Scanner
                      </button>
                    </div>

                    {auditedCompleted && (
                      <button
                        onClick={() => { setPhase("exploit"); playPop(); }}
                        className="w-full toy-btn-action bg-emerald-600 hover:bg-green-500 text-white py-3 uppercase font-black text-xs flex items-center justify-center gap-1.5 rounded-2xl mt-3"
                      >
                        Go to Exploit Loop <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    )}

                    <div className="mt-auto border border-slate-200 bg-amber-50 p-3 rounded-2xl min-h-[90px] flex items-center font-mono text-xs md:text-sm font-bold text-amber-700">
                      <span className="leading-snug">{auditMessage}</span>
                    </div>
                  </div>
                </div>

                {/* Drag-reorder Code Array */}
                <div className="lg:col-span-8 toy-panel flex flex-col gap-3 min-h-0">
                  <span className="text-xs font-black uppercase text-stone-500 tracking-wider mb-1">Solidity withdrawal function blocks:</span>
                  
                  <div className="flex flex-col gap-3 flex-1 justify-center">
                    {orderedBlocks.map((block, idx) => {
                      return (
                        <div
                          key={block.id}
                          className={`p-4 border border-slate-300 rounded-2xl bg-white shadow-sm flex items-center justify-between transition-all ${
                            auditedCompleted ? "opacity-75" : "hover:translate-x-1"
                          }`}
                        >
                          <div className="flex flex-col gap-1 flex-1">
                            <span className="text-sm font-mono font-bold text-amber-700 select-all">
                              {block.code}
                            </span>
                            <span className="text-[10px] text-stone-500 font-extrabold uppercase">
                              {block.desc}
                            </span>
                          </div>

                          {!auditedCompleted && (
                            <div className="flex flex-col gap-1.5 ml-4">
                              <button
                                onClick={() => moveBlock(idx, "up")}
                                disabled={idx === 0}
                                className="px-2 py-0.5 border border-slate-300 rounded bg-stone-50 hover:bg-stone-100 text-xs font-black disabled:opacity-20 text-slate-700"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => moveBlock(idx, "down")}
                                disabled={idx === orderedBlocks.length - 1}
                                className="px-2 py-0.5 border border-slate-300 rounded bg-stone-50 hover:bg-stone-100 text-xs font-black disabled:opacity-20 text-slate-700"
                              >
                                ▼
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LEVEL 2: Fallback Loop Hijacker */}
          {phase === "exploit" && (
            <motion.div
              key="exploit"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* Exploit Dashboard controller */}
                <div className="lg:col-span-4 toy-panel flex flex-col min-h-0">
                  <div className="toy-screen bg-stone-50 p-4 flex flex-col gap-4 flex-1">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Reentrancy Exploit Center</span>

                    <div className="flex flex-col gap-3 flex-1 justify-center">
                      {/* Exploit trigger */}
                      {exploitState === "idle" && (
                        <button
                          onClick={startExploit}
                          className="w-full toy-btn-action bg-rose-600 hover:bg-red-500 text-white py-4 font-black text-sm uppercase flex items-center justify-center gap-2 rounded-xl active:translate-y-1 transition-all"
                        >
                          <Zap className="w-4 h-4 fill-white" /> Start Exploit: Withdraw
                        </button>
                      )}

                      {exploitState === "withdrawing" && (
                        <div className="w-full py-4 bg-stone-50 border border-dashed border-stone-300 text-stone-400 rounded-xl font-black text-sm uppercase text-center cursor-not-allowed">
                          Sending request...
                        </div>
                      )}

                      {exploitState === "awaiting_reentry" && (
                        <button
                          onClick={clickReentry}
                          className="w-full toy-btn-action bg-yellow-500 hover:bg-yellow-400 text-white py-4 font-black text-sm uppercase flex items-center justify-center gap-2 rounded-xl active:translate-y-0.5 active:shadow-none animate-bounce"
                        >
                          ⚡ Re-enter withdraw()
                        </button>
                      )}

                      {exploitState === "done" && (
                        <button
                          onClick={() => { setPhase("consensus"); playPop(); }}
                          className="w-full toy-btn-action bg-emerald-600 hover:bg-green-500 text-white py-3.5 uppercase font-black text-xs flex items-center justify-center gap-1.5 rounded-2xl"
                        >
                          Go to Consensus Fork <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      )}
                    </div>

                    <div className="mt-auto border border-slate-200 bg-amber-50 p-3 rounded-2xl min-h-[90px] flex items-center font-mono text-xs md:text-sm font-bold text-amber-700">
                      <span className="leading-snug">{exploitMessage}</span>
                    </div>
                  </div>
                </div>

                {/* Vault coins schematic visualizer */}
                <div className="lg:col-span-8 toy-panel flex flex-col gap-3 min-h-0">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* The DAO Vault (Victim) */}
                    <div className="border border-slate-200 bg-amber-50 p-4 rounded-[24px] shadow-sm flex flex-col">
                      <span className="text-xs font-black uppercase text-blue-800 flex items-center gap-1.5 mb-3">
                        <Database className="w-4 h-4 fill-blue-700 text-blue-700" /> The DAO Vault Contract
                      </span>

                      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 rounded-2xl p-4">
                        <span className="text-[10px] font-black text-stone-500 uppercase">Ledger Balance:</span>
                        <span className="text-3xl font-mono font-black text-amber-600">{daoBalance} ETH</span>
                        
                        {/* Coins representation */}
                        <div className="flex gap-1.5 flex-wrap justify-center py-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${
                                i < daoBalance ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-stone-50 text-stone-300 border-dashed border-stone-200 shadow-none scale-90"
                              }`}
                            >
                              Ξ
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Exploit Contract (Attacker) */}
                    <div className="border border-slate-200 bg-rose-50 p-4 rounded-[24px] shadow-sm flex flex-col">
                      <span className="text-xs font-black uppercase text-rose-800 flex items-center gap-1.5 mb-3">
                        <ShieldAlert className="w-4 h-4 text-rose-700" /> Malicious Exploit Contract
                      </span>

                      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 rounded-2xl p-4">
                        <span className="text-[10px] font-black text-stone-500 uppercase">Stolen Balance:</span>
                        <span className="text-3xl font-mono font-black text-rose-600">{hackerBalance} ETH</span>
                        
                        {/* Coins representation */}
                        <div className="flex gap-1.5 flex-wrap justify-center py-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${
                                i < hackerBalance ? "bg-amber-100 text-amber-700 border-amber-300 animate-bounce" : "bg-stone-50 text-stone-300 border-dashed border-stone-200 shadow-none scale-90"
                              }`}
                            >
                              Ξ
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LEVEL 3: Blockchain Hard Fork */}
          {phase === "consensus" && (
            <motion.div
              key="consensus"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-3 min-h-0"
            >
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                {/* Scenario details */}
                <div className="lg:col-span-6 toy-panel flex flex-col min-h-0">
                  <div className="toy-screen bg-stone-50 p-4 flex flex-col gap-4 flex-1">
                    <div className="flex justify-between items-center text-xs font-black shrink-0">
                      <span className="text-stone-500 uppercase">Consensus Monitor:</span>
                      <span className="text-blue-700 bg-amber-950/30 border-2 border-amber-500/50 px-2 py-0.5 rounded-lg uppercase">
                        Scenario {currentScenario + 1} of 3
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-3">
                      <div className="border border-slate-200 bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                        <span className="text-[10px] font-black text-rose-600 uppercase">Community Demand:</span>
                        <h4 className="text-base font-black text-stone-800 uppercase tracking-wide leading-tight">
                          {SCENARIOS[currentScenario].title}
                        </h4>
                        <p className="text-xs text-stone-600 font-bold leading-normal mt-1">
                          {SCENARIOS[currentScenario].desc}
                        </p>
                      </div>

                      {governanceSelection !== "none" ? (
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={deployConsensus}
                            disabled={scenarioTested}
                            className="w-full toy-btn-action bg-amber-600 hover:bg-amber-500 text-white py-3.5 font-black text-sm uppercase flex items-center justify-center gap-2 rounded-xl active:translate-y-1 active:shadow-none transition-all"
                          >
                            Deploy Selected patch
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 border border-dashed border-slate-300 bg-slate-50 rounded-2xl text-center text-xs font-bold text-stone-500 uppercase">
                          Select a consensus option on the right to apply.
                        </div>
                      )}

                      {/* Scenario test outcome */}
                      {scenarioTested && (
                        <div className={`p-3 border rounded-xl text-xs font-black uppercase text-center shadow-sm ${
                          scenarioPassed ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                        }`}>
                          {scenarioPassed 
                            ? "SUCCESS: Consensus approved. Blockchain state resolved." 
                            : "FAIL: Consensus rejected. Protocol fork mismatch."
                          }
                        </div>
                      )}
                    </div>

                    {/* Console Log */}
                    <div className="mt-auto border border-slate-200 bg-amber-50 p-3 rounded-2xl min-h-[90px] flex items-center font-mono text-xs md:text-sm font-bold text-amber-700">
                      <span className="leading-snug">{level3Message}</span>
                    </div>
                  </div>
                </div>

                {/* Consensus selection panel */}
                <div className="lg:col-span-6 toy-panel flex flex-col gap-3 min-h-0 overflow-y-auto">
                  <span className="text-xs font-black uppercase text-stone-500 tracking-wider mb-1 shrink-0">Blockchain Governance Choices</span>

                  <div className="flex flex-col gap-3 flex-1 justify-between">
                    {/* Hard Fork Button Card */}
                    <div
                      onClick={() => handleSelectGovernance("hardfork")}
                      className={`p-3 border rounded-2xl cursor-pointer transition-all select-none ${
                        governanceSelection === "hardfork"
                          ? "border-blue-500 bg-blue-50 shadow-sm -translate-y-0.5"
                          : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-mono text-xs font-black">
                          H
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-stone-800 uppercase">Hard Fork Refund</h4>
                          <p className="text-[10px] text-stone-500 font-bold leading-tight mt-0.5">
                            Reorganizes block history to return stolen funds to users, splitting Ethereum (ETH vs ETC).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Soft Fork Button Card */}
                    <div
                      onClick={() => handleSelectGovernance("softfork")}
                      className={`p-3 border rounded-2xl cursor-pointer transition-all select-none ${
                        governanceSelection === "softfork"
                          ? "border-blue-500 bg-blue-50 shadow-sm -translate-y-0.5"
                          : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-mono text-xs font-black">
                          S
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-stone-800 uppercase">Soft Fork lockout</h4>
                          <p className="text-[10px] text-stone-500 font-bold leading-tight mt-0.5">
                            Freezes the attacker's smart contract address without reverting history.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Do Nothing Button Card */}
                    <div
                      onClick={() => handleSelectGovernance("donothing")}
                      className={`p-3 border rounded-2xl cursor-pointer transition-all select-none ${
                        governanceSelection === "donothing"
                          ? "border-blue-500 bg-blue-50 shadow-sm -translate-y-0.5"
                          : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-mono text-xs font-black">
                          C
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-stone-800 uppercase">Do Nothing (Code is Law)</h4>
                          <p className="text-[10px] text-stone-500 font-bold leading-tight mt-0.5">
                            Upholds strict immutability, preserving the unaltered original chain (Ethereum Classic).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </LabShell>
  );
}
