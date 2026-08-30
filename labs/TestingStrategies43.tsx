"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
    MousePointer2, ShieldCheck, CheckCircle2, XOctagon, 
    ArrowRight, Rocket, Terminal, ClipboardList, AlertTriangle, 
    Bug, Play, Code2, ServerCrash, FastForward, RotateCcw
} from "lucide-react";

type QAState = 
  | "manual_1_typing" | "manual_1_testing" | "manual_1_success"
  | "regression_alert" | "manual_2_typing" | "manual_2_testing" | "manual_2_fail"
  | "build_selenium" | "selenium_running" | "selenium_success"
  | "assessing" | "completed";

export default function TestingStrategies43() {
  const { playPop, playSuccess, playError, playZap, playHeavyThud } = useLabAudio();
  const { reportComplete } = useLMSBridge();

  const [qaState, setQaState] = useState<QAState>("manual_1_typing");
  const [formUser, setFormUser] = useState("");
  const [formPass, setFormPass] = useState("");
  const [formOutput, setFormOutput] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [scriptBlocks, setScriptBlocks] = useState<string[]>([]);
  const [cursorState, setCursorState] = useState({ x: 150, y: 350, opacity: 0 });
  const [activeBlockIndex, setActiveBlockIndex] = useState(-1);
  const [assessmentAns, setAssessmentAns] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
  };

  const handleLaunchClick = () => {
      if (qaState === "manual_1_typing") {
          if (formUser.toLowerCase() === "commander" && formPass === "1234") {
              playPop();
              setFormOutput("loading");
              setQaState("manual_1_testing");
              setTimeout(() => {
                  playSuccess();
                  setFormOutput("success");
                  setQaState("manual_1_success");
                  setTimeout(() => {
                      playHeavyThud();
                      triggerShake();
                      setQaState("regression_alert");
                      setFormUser("");
                      setFormPass("");
                      setFormOutput("idle");
                  }, 3000);
              }, 1200);
          } else {
              playError();
              triggerShake();
          }
      } else if (qaState === "manual_2_typing" || qaState === "regression_alert") {
          if (formUser.toLowerCase() === "commander" && formPass === "1234") {
              playPop();
              setFormOutput("loading");
              setQaState("manual_2_testing");
              setTimeout(() => {
                  playError();
                  setFormOutput("error"); // The injected bug!
                  setQaState("manual_2_fail");
                  setTimeout(() => {
                      playZap();
                      setFormUser("");
                      setFormPass("");
                      setFormOutput("idle");
                      setQaState("build_selenium");
                  }, 4500);
              }, 1200);
          } else {
              playError();
              triggerShake();
          }
      }
  };

  const AVAILABLE_BLOCKS = [
      { id: "find_user", label: 'driver.find("Username").type("commander")' },
      { id: "find_pass", label: 'driver.find("Password").type("1234")' },
      { id: "click_launch", label: 'driver.find("Launch").click()' },
      { id: "assert_ready", label: 'assert(output == "Ready")' }
  ];

  const handleAddBlock = (id: string) => {
      if (!scriptBlocks.includes(id)) {
          playPop();
          setScriptBlocks([...scriptBlocks, id]);
      }
  };

  const runAutomatedSuite = () => {
      setQaState("selenium_running");
      setFormUser(""); 
      setFormPass(""); 
      setFormOutput("idle");
      
      const runSequence = async () => {
          // Fade in cursor
          setCursorState({ x: 150, y: 310, opacity: 1 });
          await new Promise(r => setTimeout(r, 400));
          
          // Move to username
          setCursorState({ x: 130, y: 130, opacity: 1 });
          setActiveBlockIndex(0);
          playPop();
          await new Promise(r => setTimeout(r, 400));
          setFormUser("commander");
          playZap();
          
          // Move to password
          setCursorState({ x: 130, y: 190, opacity: 1 });
          setActiveBlockIndex(1);
          await new Promise(r => setTimeout(r, 300));
          setFormPass("1234");
          playZap();
          
          // Move to launch button
          setCursorState({ x: 130, y: 280, opacity: 1 });
          setActiveBlockIndex(2);
          await new Promise(r => setTimeout(r, 300));
          setFormOutput("loading");
          playPop();
          
          // Move to assert panel
          setCursorState({ x: 130, y: 60, opacity: 1 });
          setActiveBlockIndex(3);
          await new Promise(r => setTimeout(r, 400));
          
          // Bam, bug caught instantly
          setFormOutput("error"); 
          playError();
          triggerShake();
          setCursorState({ x: 130, y: 60, opacity: 0 }); // hide cursor
          
          await new Promise(r => setTimeout(r, 1000));
          setQaState("selenium_success");
          playSuccess();
          
          await new Promise(r => setTimeout(r, 4000));
          setQaState("assessing");
      };
      
      runSequence();
  };

  const handleAssessmentSubmit = () => {
      setIsSubmitted(true);
      if (assessmentAns === 2) {
          playSuccess();
      } else {
          playError();
      }
  };

  const mText = (() => {
      switch (qaState) {
          case "manual_1_typing":
          case "manual_1_testing":
              return { title: "Manual QA Testing", desc: "Manually test the Launch sequence. Type 'commander' and '1234'.", color: "text-[#0F172A]" };
          case "manual_1_success":
              return { title: "Test Passed", desc: "Good job! But manual testing takes precious time...", color: "text-[#10B981]" };
          case "regression_alert":
          case "manual_2_typing":
          case "manual_2_testing":
              return { title: "Code Updated!", desc: "The developer pushed v1.1.0! You must manually test the whole form again (Regression Testing).", color: "text-[#F59E0B]" };
          case "manual_2_fail":
              return { title: "Regression Bug Found!", desc: "The developer broke the login in v1.1.0! Doing this manually every time is too slow.", color: "text-[#E11D48]" };
          case "build_selenium":
              return { title: "Selenium TestingScript", desc: "Let's build a Selenium robot to automate these clicks. Add the commands in order.", color: "text-[#3B82F6]" };
          case "selenium_running":
              return { title: "Running Automated Suite...", desc: "Watch the robot execute the entire regression test at superhuman speed!", color: "text-[#3B82F6]" };
          case "selenium_success":
              return { title: "Disaster Averted!", desc: "The automated suite caught the bug in 0.4 seconds! The deployment was blocked, saving the mission from a broken launch.", color: "text-[#10B981]" };
          case "assessing":
          case "completed":
              return { title: "TestingScript Master", desc: "You've successfully secured the deployment! Verify your knowledge.", color: "text-[#0F172A]" };
          default:
              return { title: "Testing Strategies", desc: "", color: "text-[#0F172A]" };
      }
  })();

  const currentStep = ["manual_1_typing", "manual_1_testing", "manual_1_success"].includes(qaState) ? 1 :
                      ["regression_alert", "manual_2_typing", "manual_2_testing", "manual_2_fail"].includes(qaState) ? 2 :
                      ["build_selenium", "selenium_running", "selenium_success"].includes(qaState) ? 3 : 4;

  const isManualMode = currentStep <= 2;
  const isInputDisabled = !isManualMode || qaState === "manual_1_testing" || qaState === "manual_2_testing" || qaState === "manual_1_success" || qaState === "manual_2_fail";

  return (
    <LabShell 
      labId="testingstrategies43" 
      bgOverride="bg-[#F8FAFC]"
      title="Testing Strategies & TestingScript"
      instruction="Explore the Test Pyramid. Manual testing is slow and tedious during regressions. Build automated Selenium tests to catch bugs at lightning speed."
      hint={isManualMode ? "Follow the checklist on the right." : "Click the blocks to build your automated test script."}
      onReset={() => { setQaState("manual_1_typing"); setFormUser(""); setFormPass(""); setFormOutput("idle"); setScriptBlocks([]); setIsSubmitted(false); setAssessmentAns(null); }}
    >
      {qaState === "completed" && <Celebration isActive={true} />}
      
      {/* Clean Laboratory Environment - Split Screen */}
      <div className="flex-1 w-full flex flex-col relative overflow-hidden font-sans bg-white lg:rounded-xl border-t lg:border border-slate-200 shadow-sm">
          
          {/* Subtle Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          {/* Progress Indicator */}
          <div className="w-full flex items-center justify-center gap-1.5 pt-3 px-4 shrink-0 z-10 relative">
              {["Step 1: Manual", "Step 2: Fatigue", "Step 3: Selenium", "Step 4: Review"].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                      <div className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                          currentStep === idx + 1 ? 'bg-[#2563EB] text-white shadow-sm' : 
                          currentStep > idx + 1 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-slate-100 text-slate-400'
                      }`}>
                          {step}
                      </div>
                      {idx < 3 && <ArrowRight size={10} className="text-slate-300" />}
                  </div>
              ))}
          </div>

          {/* Mission Text */}
          <div className="flex flex-col items-center justify-center pt-2 pb-2 z-20 px-4 shrink-0 relative">
              <h2 className={`text-lg lg:text-xl font-bold tracking-wide text-center ${mText.color}`}>
                  {mText.title}
              </h2>
              <p className="text-slate-600 font-medium text-xs mt-0.5 max-w-xl text-center">
                  {mText.desc}
              </p>
          </div>

          {/* Split Screen Arena */}
          <div className="flex-1 flex flex-col lg:flex-row w-full z-10 border-t border-slate-100">
              
              {/* LEFT PANE: The App Under Test */}
              <div className="flex-1 flex items-center justify-center bg-slate-50/50 p-6 relative">
                  
                  {/* Phone / App Mockup */}
                  <motion.div 
                      animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className="w-full max-w-[280px] h-[340px] bg-white border-[6px] border-slate-800 rounded-[2rem] shadow-xl flex flex-col relative overflow-hidden shrink-0"
                  >
                      {/* App Header */}
                      <div className="bg-slate-800 text-white text-[10px] uppercase tracking-widest font-bold py-1.5 text-center flex items-center justify-center gap-1.5 shrink-0">
                          <Rocket size={12} />
                          AstroLaunch v{currentStep > 1 ? "1.1.0" : "1.0.0"}
                      </div>

                      {/* App Screen */}
                      <div className="flex-1 p-4 flex flex-col">
                          
                          {/* Output Display */}
                          <div className={`w-full h-12 rounded-xl border flex items-center justify-center mb-4 shadow-inner transition-colors shrink-0 ${
                              formOutput === 'idle' ? 'bg-slate-100 border-slate-200' :
                              formOutput === 'loading' ? 'bg-[#F0F9FF] border-[#38BDF8] text-[#0284C7]' :
                              formOutput === 'success' ? 'bg-[#ECFDF5] border-[#10B981] text-[#059669]' :
                              'bg-[#FFF1F2] border-[#E11D48] text-[#BE123C]'
                          }`}>
                              {formOutput === 'idle' && <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">SYSTEM IDLE</span>}
                              {formOutput === 'loading' && <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5"><RotateCcw size={14} className="animate-spin"/> CONNECTING...</span>}
                              {formOutput === 'success' && <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={14}/> READY FOR LAUNCH</span>}
                              {formOutput === 'error' && <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5"><ServerCrash size={14}/> FATAL ERROR 404</span>}
                          </div>

                          {/* Inputs */}
                          <div className="flex flex-col gap-3 shrink-0">
                              <div className="flex flex-col gap-1">
                                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Commander ID</label>
                                  <input 
                                      type="text" 
                                      value={formUser}
                                      onChange={(e) => setFormUser(e.target.value)}
                                      disabled={isInputDisabled}
                                      placeholder="e.g., commander"
                                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#3B82F6] transition-colors"
                                  />
                              </div>
                              <div className="flex flex-col gap-1">
                                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Passcode</label>
                                  <input 
                                      type="password" 
                                      value={formPass}
                                      onChange={(e) => setFormPass(e.target.value)}
                                      disabled={isInputDisabled}
                                      placeholder="****"
                                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#3B82F6] transition-colors"
                                  />
                              </div>
                          </div>

                          <div className="mt-auto pt-2 shrink-0">
                              <button 
                                  onClick={handleLaunchClick}
                                  disabled={isInputDisabled}
                                  className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-colors ${
                                      isInputDisabled ? 'bg-slate-200 text-slate-400' : 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-md'
                                  }`}
                              >
                                  Execute Launch
                              </button>
                          </div>
                      </div>

                      {/* Selenium Ghost Cursor Overlay */}
                      <motion.div 
                          initial={{ opacity: 0, x: 150, y: 350 }}
                          animate={{ opacity: cursorState.opacity, x: cursorState.x, y: cursorState.y }}
                          transition={{ type: "spring", stiffness: 120, damping: 15 }}
                          className="absolute z-50 pointer-events-none shadow-2xl"
                      >
                          <MousePointer2 size={32} className="text-[#3B82F6] fill-[#3B82F6] drop-shadow-md" />
                      </motion.div>
                  </motion.div>
              </div>

              {/* RIGHT PANE: The QA Terminal */}
              <div className="flex-1 bg-white border-l border-slate-100 p-4 lg:p-6 flex flex-col overflow-y-auto">
                  
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 shrink-0">
                      <div className="flex items-center gap-2 text-slate-800">
                          <Terminal size={18} className="text-[#2563EB]" />
                          <span className="font-black text-sm uppercase tracking-widest">QA Control Center</span>
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${isManualMode ? 'bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'}`}>
                          {isManualMode ? 'MANUAL MODE' : 'SCRIPTING MODE'}
                      </div>
                  </div>

                  {/* Manual QA View */}
                  {isManualMode && (
                      <div className="flex flex-col gap-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden shrink-0">
                              <div className="absolute top-0 right-0 p-2 opacity-5"><ClipboardList size={64}/></div>
                              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-1">Test Checklist (v{currentStep > 1 ? "1.1.0" : "1.0.0"})</h3>
                              
                              <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${formUser.toLowerCase() === 'commander' ? 'bg-[#10B981] border-[#10B981]' : 'border-slate-300'}`}>
                                      {formUser.toLowerCase() === 'commander' && <CheckCircle2 size={12} className="text-white"/>}
                                  </div>
                                  <span className={`text-sm font-medium ${formUser.toLowerCase() === 'commander' ? 'text-slate-800' : 'text-slate-500'}`}>1. Type 'commander' in Commander ID</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${formPass === '1234' ? 'bg-[#10B981] border-[#10B981]' : 'border-slate-300'}`}>
                                      {formPass === '1234' && <CheckCircle2 size={12} className="text-white"/>}
                                  </div>
                                  <span className={`text-sm font-medium ${formPass === '1234' ? 'text-slate-800' : 'text-slate-500'}`}>2. Type '1234' in Passcode</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${formOutput !== 'idle' ? 'bg-[#10B981] border-[#10B981]' : 'border-slate-300'}`}>
                                      {formOutput !== 'idle' && <CheckCircle2 size={12} className="text-white"/>}
                                  </div>
                                  <span className={`text-sm font-medium ${formOutput !== 'idle' ? 'text-slate-800' : 'text-slate-500'}`}>3. Click Execute Launch</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${formOutput === 'success' ? 'bg-[#10B981] border-[#10B981]' : formOutput === 'error' ? 'bg-[#E11D48] border-[#E11D48]' : 'border-slate-300'}`}>
                                      {formOutput === 'success' && <CheckCircle2 size={12} className="text-white"/>}
                                      {formOutput === 'error' && <XOctagon size={12} className="text-white"/>}
                                  </div>
                                  <span className={`text-sm font-medium ${formOutput === 'success' ? 'text-slate-800' : formOutput === 'error' ? 'text-[#E11D48]' : 'text-slate-500'}`}>4. Verify System Ready</span>
                              </div>
                          </div>

                          {qaState === "manual_2_fail" && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FFF1F2] border border-[#FDA4AF] rounded-xl p-3 flex items-start gap-3 mt-2 shrink-0">
                                  <AlertTriangle size={18} className="text-[#E11D48] shrink-0 mt-0.5" />
                                  <div>
                                      <span className="block text-xs font-bold text-[#E11D48] uppercase tracking-widest mb-0.5">Regression Bug Caught!</span>
                                      <span className="text-xs text-[#BE123C] font-medium leading-snug">The v1.1.0 update accidentally broke the login! This is why we re-test everything. But doing it manually every time is too slow. Time to automate!</span>
                                  </div>
                              </motion.div>
                          )}
                      </div>
                  )}

                  {/* TestingScript QA View */}
                  {!isManualMode && (
                      <div className="flex flex-col h-full">
                          
                          {/* Script Canvas */}
                          <div className="min-h-[140px] shrink-0 bg-slate-800 rounded-xl p-4 flex flex-col gap-2 relative border border-slate-700 shadow-inner overflow-y-auto">
                              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-1 flex items-center gap-1.5 shrink-0"><Code2 size={12}/> Selenium.WebDriver.Script</span>
                              
                              <AnimatePresence>
                                  {scriptBlocks.map((id, index) => {
                                      const block = AVAILABLE_BLOCKS.find(b => b.id === id);
                                      const isActive = activeBlockIndex === index;
                                      return (
                                          <motion.div 
                                              initial={{ opacity: 0, x: -10 }} 
                                              animate={{ opacity: 1, x: 0 }} 
                                              key={index} 
                                              className={`text-xs font-mono py-1.5 px-3 rounded-lg border transition-colors shrink-0 ${
                                                  isActive ? 'bg-[#3B82F6] border-[#60A5FA] text-white shadow-md' : 'bg-slate-900 border-slate-700 text-[#38BDF8]'
                                              }`}
                                          >
                                              {index + 1}. {block?.label}
                                          </motion.div>
                                      );
                                  })}
                              </AnimatePresence>

                              {scriptBlocks.length === 0 && (
                                  <div className="text-xs font-mono text-slate-600 mt-2 shrink-0">// Click blocks below to assemble script</div>
                              )}
                          </div>

                          {/* Block Tray */}
                          {scriptBlocks.length < 4 ? (
                              <div className="mt-3 flex flex-col gap-2 shrink-0">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Available Commands</span>
                                  <div className="grid grid-cols-1 gap-1.5">
                                      {AVAILABLE_BLOCKS.map(block => {
                                          const isUsed = scriptBlocks.includes(block.id);
                                          return (
                                              <button 
                                                  key={block.id}
                                                  onClick={() => handleAddBlock(block.id)}
                                                  disabled={isUsed}
                                                  className={`text-[11px] font-mono text-left py-1.5 px-3 rounded-lg border transition-all ${
                                                      isUsed ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' : 'bg-white border-[#3B82F6] text-[#2563EB] hover:bg-[#EFF6FF] hover:shadow-sm cursor-pointer'
                                                  }`}
                                              >
                                                  + {block.label}
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                          ) : (
                              <motion.button 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  onClick={runAutomatedSuite}
                                  disabled={qaState === "selenium_running" || qaState === "selenium_success" || qaState === "assessing"}
                                  className={`mt-4 w-full font-black text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                                      qaState === "selenium_running" ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 
                                      qaState === "selenium_success" || qaState === "assessing" ? 'bg-[#10B981] text-white' : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg'
                                  }`}
                              >
                                  {qaState === "selenium_running" ? <FastForward size={16} className="animate-pulse"/> : qaState === "selenium_success" || qaState === "assessing" ? <CheckCircle2 size={16}/> : <Play size={16}/>}
                                  {qaState === "selenium_running" ? "EXECUTING SCRIPT..." : qaState === "selenium_success" || qaState === "assessing" ? "TEST COMPLETED" : "RUN AUTOMATED SUITE"}
                              </motion.button>
                          )}
                      </div>
                  )}
              </div>
          </div>

          {/* Final Assessment Modal */}
          <AnimatePresence>
              {qaState === "assessing" && (
                  <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 lg:p-6"
                  >
                      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 lg:p-5 max-w-lg w-full shadow-2xl flex flex-col items-center text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="bg-[#EFF6FF] p-1.5 rounded-full text-[#2563EB] shrink-0"><ShieldCheck size={20} /></div>
                              <h2 className="text-lg font-black text-slate-800 tracking-tight shrink-0">Test TestingScript Master!</h2>
                          </div>
                          
                          <p className="text-slate-600 font-medium mb-3 text-[11px] lg:text-xs shrink-0 px-2">
                              Knowledge Check: Why is automated UI testing (like Selenium) critical for modern software teams?
                          </p>
                          
                          <div className="flex flex-col gap-2 w-full text-left shrink-0">
                              {[
                                  "A) It completely replaces the need for writing unit tests.",
                                  "B) It makes testing slow enough for humans to observe errors visually.",
                                  "C) It rapidly runs repeatable regression tests, catching bugs when code changes."
                              ].map((opt, i) => {
                                  if (isSubmitted && assessmentAns !== i) return null; 
                                  return (
                                      <label key={i} className={`flex items-start gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${
                                          assessmentAns === i ? 'border-[#38BDF8] bg-[#F0F9FF]' : 'border-slate-200 bg-white hover:bg-slate-50'
                                      }`}>
                                          <input 
                                              type="radio" 
                                              name="assessment" 
                                              checked={assessmentAns === i} 
                                              onChange={() => setAssessmentAns(i)} 
                                              disabled={isSubmitted} 
                                              className="w-3.5 h-3.5 mt-0.5 text-[#0284C7] shrink-0"
                                          />
                                          <span className={`text-xs font-medium leading-relaxed ${assessmentAns === i ? 'text-[#0284C7]' : 'text-slate-700'}`}>{opt}</span>
                                      </label>
                                  );
                              })}

                              <AnimatePresence>
                                  {isSubmitted ? (
                                      <motion.div 
                                          initial={{ opacity: 0, height: 0 }} 
                                          animate={{ opacity: 1, height: 'auto' }} 
                                          className="mt-1 text-xs p-3 rounded-xl border bg-slate-50 border-slate-200 shrink-0"
                                      >
                                          {assessmentAns === 2 ? (
                                              <div>
                                                  <span className="font-black text-[#10B981] uppercase flex items-center gap-1.5 tracking-widest"><CheckCircle2 size={14}/> Correct!</span> 
                                                  <span className="text-slate-600 block mt-1 leading-snug">Exactly. Because humans fatigue and manual testing doesn't scale, test bots guarantee every feature is repeatedly checked before launch.</span>
                                              </div>
                                          ) : (
                                              <div>
                                                  <span className="font-black text-[#E11D48] uppercase flex items-center gap-1.5 tracking-widest"><XOctagon size={14}/> Incorrect</span> 
                                                  <span className="text-slate-600 block mt-1 leading-snug">Exactly. Because humans fatigue and manual testing doesn't scale, test bots guarantee every feature is repeatedly checked before launch.</span>
                                              </div>
                                          )}
                                          
                                          {assessmentAns === 2 && (
                                              <button 
                                                  onClick={() => { setQaState('completed'); setTimeout(reportComplete, 4500); }} 
                                                  className="mt-3 w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-2.5 rounded-xl uppercase tracking-widest shadow-sm transition-colors"
                                              >
                                                  Complete Lab
                                              </button>
                                          )}
                                      </motion.div>
                                  ) : (
                                      <button 
                                          onClick={handleAssessmentSubmit} 
                                          disabled={assessmentAns === null} 
                                          className={`mt-1 w-full font-bold py-2.5 rounded-xl transition-colors uppercase tracking-widest shrink-0 text-xs ${
                                              assessmentAns !== null ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                      }`}>
                                          Submit Answer
                                      </button>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
    </LabShell>
  );
}
