"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Database, Timer, Smartphone, ArrowRight, Check, ChevronRight, Zap, AlertTriangle, User, Camera, Type, Sparkles, Mail, MapPin, Phone, Settings, Clock, Key, Server } from "lucide-react";

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

const FIELD_ICONS: Record<string, any> = {
  id: Key,
  name: Type,
  avatar: Camera,
  email: Mail,
  address: MapPin,
  phone: Phone,
  preferences: Settings,
  history: Clock
};

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

      <div className="w-full flex flex-col flex-1 min-h-0 gap-3 bg-slate-50/95 backdrop-blur-3xl rounded-3xl p-3 md:p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)] border border-white/60">
        
        {/* Stepper Header */}
        <div className="shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-2.5 shadow-sm overflow-x-auto gap-2">
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
              <div key={s.id} className={`flex items-center gap-2 shrink-0 ${isPast ? "opacity-60" : isCurrent ? "opacity-100" : "opacity-40"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isPast ? "bg-emerald-100 text-emerald-600" : 
                  isCurrent ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30 ring-2 ring-fuchsia-200" : 
                  "bg-slate-100 text-slate-400"
                }`}>
                  {isPast ? <Check size={12} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${isCurrent ? "text-fuchsia-900" : "text-slate-600"}`}>
                  {s.label}
                </span>
                {i < 6 && <ChevronRight size={14} className="text-slate-300 ml-1" />}
              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
          
          {/* Left Panel: Consolidated Control Console */}
          <div className="lg:w-[380px] bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/50 flex flex-col shrink-0 overflow-hidden relative">
            
            {stage === "7_COMPLETE" ? (
              <div className="p-4 md:p-5 flex flex-col h-full justify-center overflow-y-auto min-h-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                  <Database size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1.5">Final Knowledge Check</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mb-4 leading-relaxed">
                  What is the primary benefit of GraphQL over traditional REST APIs demonstrated in this lab?
                </p>
                
                <div className="flex flex-col gap-2.5">
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
                      className={`p-3 rounded-xl text-left text-xs sm:text-sm font-bold border-2 transition-all ${
                        quizAnswer === ans 
                          ? (i === 1 ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-500/20" : "bg-rose-50 border-rose-500 text-rose-700 shadow-md shadow-rose-500/20")
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-fuchsia-300 hover:bg-fuchsia-50 hover:shadow-xs"
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Top Half: Compact Target UI Mockup */}
                <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-100 relative shrink-0">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[11px] font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                       <Smartphone size={13} /> Target Mobile UI
                     </span>
                     <span className="text-[10px] font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-full border border-fuchsia-100">
                       Profile Card
                     </span>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 px-3 py-2.5 flex items-center gap-3 relative overflow-hidden">
                     {/* Sleek Profile Avatar with Camera Icon */}
                     <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-500 shadow-xs border-2 border-white flex items-center justify-center text-white">
                           <Camera size={18} strokeWidth={2.2} />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-fuchsia-200 flex items-center justify-center text-fuchsia-600 shadow-xs">
                           <Sparkles size={9} strokeWidth={2.5} />
                        </span>
                     </div>
                     
                     {/* Name with Type Icon */}
                     <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 rounded-lg border border-slate-200/80 w-fit">
                           <Type size={13} className="text-fuchsia-600 shrink-0" strokeWidth={2.5} />
                           <span className="text-xs font-black text-slate-700 tracking-tight">Alex Morgan</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 truncate pl-0.5">Required: avatar + name</span>
                     </div>
                     
                     {/* Requirements Focus Highlight */}
                     <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: stage === "1_INSPECT" ? [0, 1, 0.4, 1] : 0 }} 
                        transition={{ duration: 1.5, repeat: stage === "1_INSPECT" ? Infinity : 0 }}
                        className="absolute inset-0 border-2 border-fuchsia-400 rounded-xl pointer-events-none" 
                     />
                  </div>
                </div>

                {/* Bottom Half: Controls & Instructions */}
                <div className="p-4 flex-1 flex flex-col bg-white min-h-0 overflow-y-auto">
                  {stage === "1_INSPECT" && (
                     <div className="flex flex-col h-full justify-between gap-3">
                        <div>
                           <h3 className="text-base font-black text-slate-800 mb-1.5">Identify Requirements</h3>
                           <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">The Mobile UI above only needs two pieces of data to render correctly: the user's <span className="font-bold text-fuchsia-600 bg-fuchsia-50 px-1 rounded">name</span> and <span className="font-bold text-fuchsia-600 bg-fuchsia-50 px-1 rounded">avatar</span>.</p>
                        </div>
                        <button onClick={() => setStage("2_REST_FETCH")} className="mt-auto w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold shadow-[0_3px_0_rgba(192,38,211,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 group">
                           Next: Try REST <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  )}

                  {stage === "2_REST_FETCH" && (
                     <div className="flex flex-col h-full justify-between gap-3">
                        <div>
                           <h3 className="text-base font-black text-slate-800 mb-1.5">Standard REST Request</h3>
                           <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-2">A standard REST API call to <code className="bg-slate-100 text-sky-600 px-1.5 py-0.5 rounded-md font-bold text-xs border border-slate-200">GET /users/123</code> fetches the entire user object by default.</p>
                        </div>
                        <button onClick={runRestFetch} disabled={phase !== "IDLE"} className="mt-auto w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold shadow-[0_3px_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:translate-y-1">
                           <Zap size={16} className={phase !== "IDLE" ? "animate-pulse text-sky-400" : "text-sky-400"}/> 
                           {phase === "IDLE" ? "Execute REST Request" : "Fetching..."}
                        </button>
                     </div>
                  )}

                  {stage === "3_REST_FAIL" && (
                     <div className="flex flex-col h-full justify-between gap-3">
                        <div>
                           <div className="flex items-center gap-2 text-rose-600 font-black mb-2 bg-rose-50 p-2 rounded-lg border border-rose-100 text-xs">
                              <AlertTriangle size={16} /> OVER-FETCHING DETECTED
                           </div>
                           <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                              The server returned <strong className="text-rose-600">14.2 KB</strong> of data including email, address, and history! The mobile app threw away 90% of it, wasting data and battery.
                           </p>
                        </div>
                        <button onClick={() => { setStage("4_UNDERSTAND"); setPhase("IDLE"); setQueryResult(null); }} className="mt-auto w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-[0_3px_0_rgba(225,29,72,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 group">
                           Understand Why <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  )}

                  {stage === "4_UNDERSTAND" && (
                     <div className="flex flex-col h-full justify-between gap-2.5">
                        <div>
                           <h3 className="text-base font-black text-slate-800 mb-1.5">The REST Limitation</h3>
                           <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-2">
                              REST endpoints return fixed data structures. If you need 2 fields but the server defines 20, you get all 20.
                           </p>
                           <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed bg-fuchsia-50 p-2.5 rounded-xl border border-fuchsia-100 text-fuchsia-900">
                              <strong className="text-fuchsia-700">GraphQL flips this:</strong> the Client specifies the exact shape of the response it wants.
                           </p>
                        </div>
                        <button onClick={() => setStage("5_GQL_BUILD")} className="mt-auto w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold shadow-[0_3px_0_rgba(192,38,211,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 group">
                           Try GraphQL <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  )}

                  {(stage === "5_GQL_BUILD" || stage === "6_GQL_FETCH") && (
                     <div className="flex flex-col h-full justify-between">
                        <div>
                           <div className="flex items-center justify-between mb-2.5">
                              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5"><Database size={15} className="text-fuchsia-500"/> Query Builder</h3>
                              <span className="text-[10px] font-bold text-fuchsia-700 bg-fuchsia-100 px-2 py-0.5 rounded-md uppercase tracking-widest border border-fuchsia-200">GraphQL</span>
                           </div>
                           
                           {gqlError && stage === "5_GQL_BUILD" && (
                              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-start gap-1.5 shadow-xs">
                                 <AlertTriangle size={15} className="shrink-0 mt-0.5" /> <span className="leading-tight">{gqlError}</span>
                              </motion.div>
                           )}
                           
                           <div className="flex flex-wrap gap-1.5 mb-3">
                              {ALL_FIELDS.map(f => {
                                 const isReq = REQUIRED_FIELDS.includes(f);
                                 const isSel = selectedFields.includes(f);
                                 const Icon = FIELD_ICONS[f] || Database;
                                 return (
                                    <button
                                       key={f}
                                       onClick={() => toggleField(f)}
                                       disabled={stage !== "5_GQL_BUILD"}
                                       className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-1 shadow-xs ${
                                          isSel ? "bg-fuchsia-50 border-fuchsia-500 text-fuchsia-700 ring-2 ring-fuchsia-500/20" : "bg-white border-slate-200 text-slate-600 hover:border-fuchsia-300 hover:bg-fuchsia-50/50"
                                       } ${stage !== "5_GQL_BUILD" && !isSel ? "opacity-40" : ""}`}
                                    >
                                       <Icon size={13} className={isSel ? "text-fuchsia-500" : "text-slate-400"} />
                                       {f} 
                                       {isReq && stage === "5_GQL_BUILD" && <span className="text-[10px] text-fuchsia-500 ml-0.5">★</span>}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                        
                        <div className="mt-auto pt-1">
                           {stage === "5_GQL_BUILD" ? (
                              <button 
                                 onClick={() => setStage("6_GQL_FETCH")} 
                                 disabled={selectedFields.length === 0}
                                 className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold shadow-[0_3px_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:translate-y-1 group"
                              >
                                 Confirm Schema <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                           ) : (
                              <button 
                                 onClick={runGqlFetch} 
                                 disabled={phase !== "IDLE"}
                                 className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold shadow-[0_3px_0_rgba(192,38,211,1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:translate-y-1"
                              >
                                 <Zap size={16} className={phase !== "IDLE" ? "animate-pulse text-amber-300" : "text-amber-300"}/> 
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

          {/* Right Panel: Enhanced SVG Visualizer */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/50 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-sky-200/40 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-fuchsia-200/40 rounded-full blur-[80px]" />
            
            <motion.svg 
               animate={stage === "3_REST_FAIL" ? { x: [-5, 5, -5, 5, 0] } : {}}
               transition={{ duration: 0.4 }}
               viewBox="0 0 800 400" className="w-full h-full max-h-[500px] drop-shadow-xl" preserveAspectRatio="xMidYMid meet"
            >
               <defs>
                  <filter id="glow-light">
                     <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                     <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                     </feMerge>
                  </filter>
                  <filter id="glow-strong-light">
                     <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                     <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                     </feMerge>
                  </filter>
                  <pattern id="grid-light" width="40" height="40" patternUnits="userSpaceOnUse">
                     <circle cx="2" cy="2" r="1.5" fill="#cbd5e1" opacity="0.6" />
                  </pattern>
               </defs>

               <rect width="800" height="400" fill="url(#grid-light)" />

               {/* Center Fiber Optic Conduit */}
               <path d="M 230,200 L 570,200" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
               <path d="M 230,200 L 570,200" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 8" className="animate-[dash_10s_linear_infinite]" />

               {/* Mobile Client (Left) - Glassy Design */}
               <g transform="translate(140, 200)">
                  {/* Phone Bezel */}
                  <rect x="-80" y="-130" width="160" height="260" fill="#f8fafc" rx="20" stroke="#cbd5e1" strokeWidth="3" />
                  {/* Phone Screen */}
                  <rect x="-72" y="-120" width="144" height="240" fill="#ffffff" rx="12" stroke="#f1f5f9" strokeWidth="2" />
                  
                  {/* App UI Inside Phone */}
                  <rect x="-60" y="-90" width="120" height="150" fill="#f8fafc" rx="8" />
                  <circle cx="0" cy="-50" r="24" fill="#e2e8f0" />
                  <rect x="-35" y="-10" width="70" height="10" fill="#e2e8f0" rx="5" />
                  <rect x="-45" y="15" width="90" height="8" fill="#f1f5f9" rx="4" />
                  <rect x="-45" y="30" width="60" height="8" fill="#f1f5f9" rx="4" />

                  <text x="0" y="155" fill="#64748b" fontSize="13" fontWeight="900" textAnchor="middle" letterSpacing="1">MOBILE CLIENT</text>

                  {/* Overfetch Alert UI on Phone */}
                  {queryResult?.status === "OVERFETCH" && phase === "DONE" && (
                     <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <rect x="-65" y="-10" width="130" height="80" fill="#ef4444" opacity="0.95" rx="12" filter="url(#glow-light)" />
                        <path d="M-12,-10 L12,-10 L6,25 L-6,25 Z" fill="#fff" transform="translate(0, 15) scale(0.6)" />
                        <circle cx="0" cy="45" r="3.5" fill="#fff" />
                        <text x="0" y="62" fill="#fff" fontSize="11" fontWeight="900" textAnchor="middle">MEMORY BLOAT</text>
                     </motion.g>
                  )}
               </g>

               {/* Server/Database (Right) - Server Rack Design */}
               <g transform="translate(660, 200)">
                  {/* Server Chassis */}
                  <rect x="-110" y="-150" width="220" height="300" fill="#f8fafc" rx="16" stroke="#cbd5e1" strokeWidth="3" />
                  <rect x="-100" y="-140" width="200" height="280" fill="#ffffff" rx="12" stroke="#f1f5f9" strokeWidth="2" />
                  
                  {/* Server Header */}
                  <rect x="-100" y="-140" width="200" height="40" fill="#f1f5f9" rx="12" />
                  <text x="0" y="-115" fill="#475569" fontSize="14" fontWeight="900" textAnchor="middle" letterSpacing="1">DATABASE RACK</text>

                  {/* Data Cartridges */}
                  <g transform="translate(0, -75)">
                     {ALL_FIELDS.map((f, i) => {
                        const isReq = REQUIRED_FIELDS.includes(f);
                        const isSel = selectedFields.includes(f);
                        
                        let fill = "#f1f5f9"; // Default inactive cartridge
                        let stroke = "#e2e8f0";
                        let textFill = "#64748b";

                        if (stage === "2_REST_FETCH" || stage === "3_REST_FAIL") {
                           fill = "#e0f2fe"; // Sky blue for REST
                           stroke = "#7dd3fc";
                           textFill = "#0369a1";
                        } else if (stage === "6_GQL_FETCH" || stage === "7_COMPLETE") {
                           if (isSel) {
                              fill = "#fae8ff"; // Fuchsia for GQL selected
                              stroke = "#f0abfc";
                              textFill = "#a21caf";
                           }
                        }

                        return (
                           <g key={f} transform={`translate(0, ${i * 26})`}>
                              <rect x="-80" y="0" width="160" height="20" fill={fill} rx="6" stroke={stroke} strokeWidth="1.5" />
                              <circle cx="-65" cy="10" r="3" fill={isSel || stage.includes("REST") ? stroke : "#cbd5e1"} />
                              <text x="-50" y="14" fill={textFill} fontSize="11" fontWeight="800">{f.toUpperCase()}</text>
                           </g>
                        )
                     })}
                  </g>

                  {/* Gateway Slicing Line (GraphQL only) */}
                  {(phase === "PROCESSING" && stage === "6_GQL_FETCH") && (
                     <motion.g initial={{ opacity: 0, x: -110 }} animate={{ opacity: 1, x: -90 }} exit={{ opacity: 0 }}>
                        <rect x="0" y="-85" width="6" height="220" fill="#d946ef" filter="url(#glow-light)" rx="3" />
                     </motion.g>
                  )}
               </g>

               {/* Network Packet Animations */}
               <AnimatePresence>
                  
                  {/* Outbound Request Packet */}
                  {phase === "REQUESTING" && (
                     <motion.g 
                        initial={{ x: 230, y: 200, scale: 0.5, opacity: 0 }} 
                        animate={{ x: 550, y: 200, scale: 1, opacity: 1 }} 
                        transition={{ duration: 0.8, ease: "easeInOut" }} 
                        exit={{ opacity: 0, scale: 0 }}
                     >
                        <rect x="-20" y="-12" width="40" height="24" rx="6" fill={stage.includes("REST") ? "#0ea5e9" : "#d946ef"} filter="url(#glow-light)" />
                        <text x="0" y="3" fill="#fff" fontSize="10" fontWeight="900" textAnchor="middle">GET</text>
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
                           x={-45 * (stage.includes("REST") ? 1.5 : 1)} 
                           y={-30 * (stage.includes("REST") ? 1.5 : 1)} 
                           width={90 * (stage.includes("REST") ? 1.5 : 1)} 
                           height={60 * (stage.includes("REST") ? 1.5 : 1)} 
                           fill={queryResult.status === "SUCCESS" ? "#10b981" : "#ef4444"} 
                           rx="10" 
                           filter="url(#glow-strong-light)" 
                           opacity="0.95"
                           stroke="#fff"
                           strokeWidth="2"
                        />
                        <text x="0" y="-2" fill="#fff" fontSize={stage.includes("REST") ? 14 : 12} fontWeight="900" textAnchor="middle">
                           {queryResult.payloadSize}
                        </text>
                        <text x="0" y="16" fill="#fff" fontSize={stage.includes("REST") ? 10 : 9} fontWeight="800" textAnchor="middle">
                           {queryResult.status === "SUCCESS" ? "PERFECT" : queryResult.status === "OVERFETCH" ? "BLOATED" : "MISSING DATA"}
                        </text>
                     </motion.g>
                  )}
               </AnimatePresence>
            </motion.svg>
          </div>

        </div>

      </div>

      {timedOut && !isLabComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm text-center mx-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Timer className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1.5">Time's Up!</h3>
            <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
              You did not complete the lab in time.
            </p>
            <button onClick={() => window.location.reload()} className="w-full px-6 py-3.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_0_rgba(192,38,211,1)] active:shadow-none active:translate-y-1 transition-all">
              Try Again
            </button>
          </div>
        </div>
      )}
    </LabShell>
  );
}
