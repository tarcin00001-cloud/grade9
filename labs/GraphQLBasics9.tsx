"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Database, Timer, Smartphone, ArrowRight, Check, ChevronRight, Zap, AlertTriangle } from "lucide-react";

type Stage = 
  | "1_INSPECT"
  | "2_REST_FETCH"
  | "3_REST_FAIL"
  | "4_UNDERSTAND"
  | "5_GQL_BUILD"
  | "6_GQL_FETCH"
  | "7_COMPLETE";

type Phase = "IDLE" | "REQUESTING" | "PROCESSING" | "RETURNING" | "DONE";
type QueryResult = { status: "SUCCESS" | "OVERFETCH" | "UNDERFETCH", dataReturned: string[], payloadSize: string };

const TIMER_DURATION_SECONDS = 5 * 60;
const ALL_FIELDS = ["id", "name", "avatar", "email", "address", "phone", "preferences", "history"];
const REQUIRED_FIELDS = ["name", "avatar"];

export default function GraphQLBasics9() {
  const { reportComplete: _reportComplete } = useLMSBridge("graphqlbasics9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLabComplete, setIsLabComplete] = useState(false);

  const [stage, setStage] = useState<Stage>("1_INSPECT");
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [hasWon, setHasWon] = useState(false);

  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [gqlError, setGqlError] = useState<string | null>(null);

  const reportComplete = useCallback(() => {
    setIsLabComplete(true);
    _reportComplete({ points: 100 });
  }, [_reportComplete]);

  useEffect(() => {
    if (timedOut || isLabComplete) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timedOut, isLabComplete]);

  useEffect(() => {
    if (timedOut) {
      _reportComplete({ points: 0 });
    }
  }, [timedOut, _reportComplete]);

  const formattedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const runRestFetch = () => {
    setPhase("REQUESTING");
    playPop();
    setTimeout(() => {
      setPhase("PROCESSING");
      playZap();
      setTimeout(() => {
        setPhase("RETURNING");
        playError();
        setQueryResult({ status: "OVERFETCH", dataReturned: ALL_FIELDS, payloadSize: "14.2 KB" });
        setTimeout(() => {
          setPhase("DONE");
          setStage("3_REST_FAIL");
        }, 1000);
      }, 1000);
    }, 800);
  };

  const runGqlFetch = () => {
    if (selectedFields.length === 0) {
      playError();
      return;
    }
    setPhase("REQUESTING");
    playPop();
    
    let status: QueryResult["status"] = "SUCCESS";
    if (!selectedFields.includes("name") || !selectedFields.includes("avatar")) {
      status = "UNDERFETCH";
    } else if (selectedFields.length > 2) {
      status = "OVERFETCH";
    }

    const size = status === "SUCCESS" ? "0.8 KB" : status === "OVERFETCH" ? `${(selectedFields.length * 1.8).toFixed(1)} KB` : "0.4 KB";

    setTimeout(() => {
      setPhase("PROCESSING");
      playZap();
      setTimeout(() => {
        setPhase("RETURNING");
        if (status === "SUCCESS") playSuccess();
        else playError();
        
        setQueryResult({ status, dataReturned: selectedFields, payloadSize: size });
        
        setTimeout(() => {
          setPhase("DONE");
          if (status === "SUCCESS") {
            setHasWon(true);
            setTimeout(() => {
                setStage("7_COMPLETE");
            }, 2500);
          } else {
             setTimeout(() => {
                setPhase("IDLE");
                setQueryResult(null);
                setStage("5_GQL_BUILD");
                if (status === "UNDERFETCH") setGqlError("Missing fields! The UI needs both name and avatar.");
                else if (status === "OVERFETCH") setGqlError("Over-fetching! Only select the exact fields needed.");
             }, 3000);
          }
        }, 1000);
      }, 1000);
    }, 800);
  };

  const toggleField = (field: string) => {
    if (stage !== "5_GQL_BUILD") return;
    playPop();
    setGqlError(null);
    setSelectedFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const getInstructions = () => {
    switch (stage) {
      case "1_INSPECT": return "Welcome to Web Engineering. Your mobile app needs to display a user profile. Click Next to inspect what data the UI actually needs.";
      case "2_REST_FETCH": return "The UI only needs `name` and `avatar`. Let's see what happens when we use a traditional REST API endpoint (`/api/users/123`).";
      case "3_REST_FAIL": return "Whoa! The REST API sent back the entire database row. This is called 'Over-fetching' and it wastes mobile data and battery.";
      case "4_UNDERSTAND": return "With REST, the Server decides what data to send. With GraphQL, the Client asks for exactly what it needs, and nothing more.";
      case "5_GQL_BUILD": return "Let's build a GraphQL query. Tap the chips to select ONLY the fields required by the Mobile UI (`name` and `avatar`).";
      case "6_GQL_FETCH": return "You've built your query! Now let's execute it and watch the GraphQL Gateway slice out the perfect payload.";
      case "7_COMPLETE": return "Perfect! To finish the lab, answer the final question about what you just learned.";
      default: return "";
    }
  };

  return (
    <LabShell
      navExtra={
        !isLabComplete && (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 30 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-slate-200 text-slate-700"
          }`}>
            <Timer size={16} strokeWidth={2.5} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      }
      labId="graphqlbasics9"
      theme="ocean"
      title="GraphQL Data Fetching"
      instruction={getInstructions()}
      compact
    >
      <Celebration isActive={isLabComplete} message="Lab Complete! You mastered GraphQL precision data fetching." onReplay={() => {
        setStage("1_INSPECT");
        setPhase("IDLE");
        setQueryResult(null);
        setSelectedFields([]);
        setHasWon(false);
        setIsLabComplete(false);
        setQuizAnswer(null);
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 gap-4">
        
        {/* Stepper Header */}
        <div className="shrink-0 flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-3 shadow-sm overflow-x-auto gap-2">
          {[
            { id: "1_INSPECT", label: "Inspect UI" },
            { id: "2_REST_FETCH", label: "REST Baseline" },
            { id: "3_REST_FAIL", label: "Bloat Impact" },
            { id: "4_UNDERSTAND", label: "Understand" },
            { id: "5_GQL_BUILD", label: "Build Query" },
            { id: "6_GQL_FETCH", label: "Execute GraphQL" },
            { id: "7_COMPLETE", label: "Final Quiz" }
          ].map((s, i) => {
            const stages = ["1_INSPECT", "2_REST_FETCH", "3_REST_FAIL", "4_UNDERSTAND", "5_GQL_BUILD", "6_GQL_FETCH", "7_COMPLETE"];
            const currentIndex = stages.indexOf(stage);
            const isPast = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={s.id} className={`flex items-center gap-2 shrink-0 ${isPast ? "opacity-50" : isCurrent ? "opacity-100" : "opacity-30"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isPast ? "bg-emerald-100 text-emerald-600" : 
                  isCurrent ? "bg-indigo-600 text-white shadow-md" : 
                  "bg-slate-100 text-slate-400"
                }`}>
                  {isPast ? <Check size={12} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${isCurrent ? "text-indigo-900" : "text-slate-600"}`}>
                  {s.label}
                </span>
                {i < 6 && <ChevronRight size={14} className="text-slate-300 ml-1" />}
              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          
          {/* Left / Top panel: Controls and UI */}
          <div className="lg:w-[360px] flex flex-col gap-4 shrink-0 overflow-y-auto min-h-0">
            
            {stage === "7_COMPLETE" ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col h-full justify-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <Database size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Final Knowledge Check</h3>
                <p className="text-sm text-slate-600 font-medium mb-6">
                  What is the primary benefit of GraphQL over traditional REST APIs demonstrated in this lab?
                </p>
                
                <div className="flex flex-col gap-3">
                  {[
                    "It makes the database query run faster on the server.",
                    "It prevents over-fetching by letting the client request exactly what it needs.",
                    "It automatically encrypts all payloads for better security."
                  ].map((ans, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuizAnswer(ans);
                        if (i === 1) {
                           playSuccess();
                           reportComplete();
                        } else {
                           playError();
                        }
                      }}
                      className={`p-4 rounded-xl text-left text-sm font-bold border-2 transition-all ${
                        quizAnswer === ans 
                          ? (i === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-rose-50 border-rose-500 text-rose-700")
                          : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 flex items-center gap-1"><Smartphone size={14} /> Mobile App</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Target UI</span>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 relative">
                    <div className="w-64 h-40 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center justify-center gap-3 relative z-10 p-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 shadow-md border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                        Avatar
                      </div>
                      {/* Name */}
                      <div className="h-6 w-32 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                        Name
                      </div>
                      
                      {/* Highlights */}
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: stage === "1_INSPECT" ? [0, 1, 0.5, 1] : 0.5 }} 
                        transition={{ duration: 1.5, repeat: stage === "1_INSPECT" ? Infinity : 0 }}
                        className="absolute inset-0 border-2 border-fuchsia-400 rounded-2xl pointer-events-none" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex-1 flex flex-col">
                  {stage === "1_INSPECT" && (
                     <div className="flex flex-col h-full justify-between">
                        <div>
                           <h3 className="text-base font-black text-slate-800 mb-2">Identify Requirements</h3>
                           <p className="text-sm text-slate-600 font-medium">The Mobile UI only needs two pieces of data to render correctly: the user's name and avatar.</p>
                        </div>
                        <button onClick={() => setStage("2_REST_FETCH")} className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                           Next: Try REST <ArrowRight size={16} />
                        </button>
                     </div>
                  )}

                  {stage === "2_REST_FETCH" && (
                     <div className="flex flex-col h-full justify-between">
                        <div>
                           <h3 className="text-base font-black text-slate-800 mb-2">Standard REST Request</h3>
                           <p className="text-sm text-slate-600 font-medium mb-3">A standard REST call to <code className="bg-slate-100 text-fuchsia-600 px-1 rounded">/users/1</code> fetches the entire user object.</p>
                        </div>
                        <button onClick={runRestFetch} disabled={phase !== "IDLE"} className="mt-4 w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow-[0_4px_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:translate-y-1">
                           <Zap size={16} className={phase !== "IDLE" ? "animate-pulse text-amber-400" : "text-amber-400"}/> 
                           {phase === "IDLE" ? "Execute GET /users/1" : "Fetching..."}
                        </button>
                     </div>
                  )}

                  {stage === "3_REST_FAIL" && (
                     <div className="flex flex-col h-full justify-between">
                        <div>
                           <div className="flex items-center gap-2 text-rose-600 font-black mb-2">
                              <AlertTriangle size={18} /> OVER-FETCHING DETECTED
                           </div>
                           <p className="text-sm text-slate-600 font-medium">
                              The server returned 14.2 KB of data including email, address, and history! The mobile app threw away 90% of it.
                           </p>
                        </div>
                        <button onClick={() => { setStage("4_UNDERSTAND"); setPhase("IDLE"); setQueryResult(null); }} className="mt-4 w-full py-3 bg-rose-600 text-white rounded-xl font-bold shadow-[0_4px_0_rgba(225,29,72,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                           Understand Why <ArrowRight size={16} />
                        </button>
                     </div>
                  )}

                  {stage === "4_UNDERSTAND" && (
                     <div className="flex flex-col h-full justify-between">
                        <div>
                           <h3 className="text-base font-black text-slate-800 mb-2">The REST Limitation</h3>
                           <p className="text-sm text-slate-600 font-medium mb-3">
                              REST endpoints usually return fixed data structures. If you need 2 fields but the server defines 20, you get all 20.
                           </p>
                           <p className="text-sm text-slate-600 font-medium">
                              GraphQL flips this: the Client specifies the exact shape of the response.
                           </p>
                        </div>
                        <button onClick={() => setStage("5_GQL_BUILD")} className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                           Try GraphQL <ArrowRight size={16} />
                        </button>
                     </div>
                  )}

                  {(stage === "5_GQL_BUILD" || stage === "6_GQL_FETCH") && (
                     <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                           <h3 className="text-base font-black text-slate-800">GraphQL Builder</h3>
                           <span className="text-xs font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-1 rounded-md">Query {`{ user { ... } }`}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                           {gqlError && stage === "5_GQL_BUILD" && (
                              <div className="w-full mb-1 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-600 flex items-center gap-2">
                                 <AlertTriangle size={14} /> {gqlError}
                              </div>
                           )}
                           {ALL_FIELDS.map(f => {
                              const isReq = REQUIRED_FIELDS.includes(f);
                              const isSel = selectedFields.includes(f);
                              return (
                                 <button
                                    key={f}
                                    onClick={() => toggleField(f)}
                                    disabled={stage !== "5_GQL_BUILD"}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${
                                       isSel ? "bg-fuchsia-100 border-fuchsia-500 text-fuchsia-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                    } ${stage !== "5_GQL_BUILD" && !isSel ? "opacity-50" : ""}`}
                                 >
                                                                        {f} {isReq && stage === "5_GQL_BUILD" && <span className="text-[10px] text-fuchsia-500 ml-1">*</span>}
                                 </button>
                              );
                           })}
                        </div>
                        
                        <div className="mt-auto">
                           {stage === "5_GQL_BUILD" ? (
                              <button 
                                 onClick={() => setStage("6_GQL_FETCH")} 
                                 disabled={selectedFields.length === 0}
                                 className="w-full py-3 bg-fuchsia-600 text-white rounded-xl font-bold shadow-[0_4px_0_rgba(192,38,211,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:translate-y-1"
                              >
                                 Confirm Schema <ArrowRight size={16} />
                              </button>
                           ) : (
                              <button 
                                 onClick={runGqlFetch} 
                                 disabled={phase !== "IDLE"}
                                 className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:translate-y-1"
                              >
                                 <Zap size={16} className={phase !== "IDLE" ? "animate-pulse text-amber-400" : "text-amber-400"}/> 
                                 {phase === "IDLE" ? "Execute Query" : "Slicing Payload..."}
                              </button>
                           )}
                        </div>
                     </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Panel: SVG Visualizer */}
          <div className="flex-1 bg-[#0f172a] rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden flex items-center justify-center">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px]" />
            
            <svg viewBox="0 0 800 400" className="w-full h-full max-h-full drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
               <defs>
                  <filter id="glow">
                     <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                     <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                     </feMerge>
                  </filter>
                  <filter id="glow-strong">
                     <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                     <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                     </feMerge>
                  </filter>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                     <circle cx="2" cy="2" r="1.5" fill="#334155" opacity="0.4" />
                  </pattern>
               </defs>

               <rect width="800" height="400" fill="url(#grid)" />

               {/* Center Conduit Line */}
               <path d="M 250,200 L 550,200" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />

               {/* Mobile Client (Left) */}
               <g transform="translate(150, 200)">
                  <rect x="-80" y="-120" width="160" height="240" fill="#1e293b" rx="16" stroke="#475569" strokeWidth="2" />
                  <rect x="-70" y="-110" width="140" height="220" fill="#020617" rx="8" />
                  
                  {/* App Screen Mock */}
                  <circle cx="0" cy="-60" r="25" fill="#334155" />
                  <rect x="-40" y="-20" width="80" height="12" fill="#334155" rx="4" />
                  <rect x="-60" y="10" width="120" height="80" fill="#1e293b" rx="6" />

                  <text x="0" y="140" fill="#94a3b8" fontSize="14" fontWeight="bold" textAnchor="middle">Mobile Client</text>

                  {/* Overfetch Alert UI */}
                  {queryResult?.status === "OVERFETCH" && phase === "DONE" && (
                     <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <rect x="-65" y="10" width="130" height="80" fill="#ef4444" opacity="0.9" rx="6" />
                        <path d="M-10,-5 L10,-5 L5,25 L-5,25 Z" fill="#fff" transform="translate(0, 20) scale(0.6)" />
                        <circle cx="0" cy="55" r="3" fill="#fff" />
                        <text x="0" y="75" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Memory Bloat</text>
                     </motion.g>
                  )}
               </g>

               {/* Server/Database (Right) */}
               <g transform="translate(650, 200)">
                  <rect x="-100" y="-140" width="200" height="280" fill="#1e293b" rx="12" stroke="#475569" strokeWidth="2" />
                  <rect x="-90" y="-130" width="180" height="260" fill="#020617" rx="8" />
                  
                  <text x="0" y="-100" fill="#94a3b8" fontSize="16" fontWeight="bold" textAnchor="middle">Database Record</text>
                  <text x="0" y="-85" fill="#64748b" fontSize="10" textAnchor="middle">User: 123</text>

                  {/* Data Rows */}
                  <g transform="translate(0, -60)">
                     {ALL_FIELDS.map((f, i) => {
                        const isReq = REQUIRED_FIELDS.includes(f);
                        const isSel = selectedFields.includes(f);
                        
                        let fill = "#334155";
                        if (stage === "2_REST_FETCH" || stage === "3_REST_FAIL") {
                           fill = "#3b82f6"; // All blue for REST
                        } else if (stage === "6_GQL_FETCH" || stage === "7_COMPLETE") {
                           if (isSel) fill = "#d946ef"; // Fuchsia for GQL selected
                        }

                        return (
                           <g key={f} transform={`translate(0, ${i * 22})`}>
                              <rect x="-70" y="0" width="140" height="16" fill={fill} rx="4" opacity={0.8} />
                              <text x="-60" y="11" fill="#fff" fontSize="10" fontWeight="bold">{f}</text>
                           </g>
                        )
                     })}
                  </g>

                  {/* Gateway Slicing Line */}
                  {(phase === "PROCESSING" && stage === "6_GQL_FETCH") && (
                     <motion.g initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: -90 }} exit={{ opacity: 0 }}>
                        <rect x="0" y="-60" width="4" height="180" fill="#d946ef" filter="url(#glow)" />
                     </motion.g>
                  )}
               </g>

               {/* Request/Response Animations */}
               <AnimatePresence>
                  
                  {/* Outbound Request */}
                  {phase === "REQUESTING" && (
                     <motion.g 
                        initial={{ x: 230, y: 200, scale: 0.8 }} 
                        animate={{ x: 550, y: 200, scale: 1 }} 
                        transition={{ duration: 0.8, ease: "easeInOut" }} 
                        exit={{ opacity: 0 }}
                     >
                        <circle cx="0" cy="0" r="16" fill={stage.includes("REST") ? "#3b82f6" : "#d946ef"} filter="url(#glow)" />
                        <text x="0" y="5" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">GET</text>
                     </motion.g>
                  )}

                  {/* Inbound Response Payload */}
                  {(phase === "RETURNING" || phase === "DONE") && queryResult && (
                     <motion.g 
                        initial={{ x: 550, y: 200, scale: stage.includes("REST") ? 2 : (queryResult.status === "SUCCESS" ? 1 : 1.5) }} 
                        animate={{ x: phase === "DONE" ? 230 : 230, y: 200 }} 
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                     >
                        <rect 
                           x={-40 * (stage.includes("REST") ? 1.5 : 1)} 
                           y={-30 * (stage.includes("REST") ? 1.5 : 1)} 
                           width={80 * (stage.includes("REST") ? 1.5 : 1)} 
                           height={60 * (stage.includes("REST") ? 1.5 : 1)} 
                           fill={queryResult.status === "SUCCESS" ? "#10b981" : "#ef4444"} 
                           rx="8" 
                           filter="url(#glow-strong)" 
                           opacity="0.9"
                        />
                        <text x="0" y="-5" fill="#fff" fontSize={stage.includes("REST") ? 14 : 12} fontWeight="bold" textAnchor="middle">
                           {queryResult.payloadSize}
                        </text>
                        <text x="0" y="15" fill="#fff" fontSize={stage.includes("REST") ? 10 : 8} fontWeight="bold" textAnchor="middle">
                           {queryResult.status === "SUCCESS" ? "PERFECT" : queryResult.status === "OVERFETCH" ? "BLOATED" : "MISSING DATA"}
                        </text>
                     </motion.g>
                  )}
               </AnimatePresence>
            </svg>
          </div>

        </div>

      </div>

      {timedOut && !isLabComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm text-center mx-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Timer className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1.5">Time's Up!</h3>
            <p className="text-sm font-medium text-slate-600 mb-4">
              You did not complete the lab in time.
            </p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:translate-y-1 shadow-[0_4px_0_rgba(79,70,229,1)] active:shadow-none text-white rounded-xl text-sm font-bold transition-all cursor-pointer">
              Try Again
            </button>
          </div>
        </div>
      )}
    </LabShell>
  );
}
