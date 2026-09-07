"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Database, Search, Terminal, Code2 , Timer} from "lucide-react";

// ─── SVG GraphQL Visualizer ───────────────────────────────────────────────────

type Phase = "IDLE" | "REQUESTING" | "PROCESSING" | "RETURNING" | "DONE";
type QueryResult = { status: "SUCCESS" | "OVERFETCH" | "UNDERFETCH" | "SYNTAX_ERROR", dataReturned: string[] };

function GraphQlSVG({ phase, queryResult }: { phase: Phase; queryResult: QueryResult | null }) {
  
  const returnedFields = queryResult?.dataReturned || [];
  
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-gql">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridGql" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" />
        </pattern>
      </defs>

      <rect width="900" height="500" fill="url(#gridGql)" />

      {/* ── Client App (Left) ── */}
      <g transform="translate(150, 250)">
        <rect x="-100" y="-120" width="200" height="240" fill="#0f172a" rx="16" stroke="#ec4899" strokeWidth="4" />
        <text x="0" y="-90" fill="#fbcfe8" fontSize="18" fontWeight="black" textAnchor="middle">MOBILE UI</text>
        
        {/* Desired UI State */}
        <rect x="-80" y="-60" width="160" height="160" fill="#1e1b4b" rx="8" />
        
        {/* Mock Avatar */}
        <circle cx="0" cy="-10" r="30" fill="#a855f7" />
        <text x="0" y="-5" fill="#fff" fontSize="12" textAnchor="middle">avatar</text>
        
        {/* Mock Name */}
        <rect x="-40" y="35" width="80" height="20" fill="#8b5cf6" rx="4" />
        <text x="0" y="49" fill="#fff" fontSize="10" textAnchor="middle">name</text>

        <text x="0" y="85" fill="#fb7185" fontSize="10" fontWeight="bold" textAnchor="middle">Required fields: name, avatar</text>

        {/* Warning if overfetching */}
        {queryResult?.status === "OVERFETCH" && phase === "DONE" && (
           <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transform="translate(0, 140)">
             <path d="M -15,-10 L 15,-10 L 10,20 L -10,20 Z" fill="#fb7185" />
             <text x="0" y="5" fill="#fff" fontSize="10" textAnchor="middle">Trash</text>
             <text x="0" y="35" fill="#fca5a5" fontSize="10" textAnchor="middle">Wasted Bandwidth</text>
           </motion.g>
        )}
      </g>

      {/* ── Server & Database (Right) ── */}
      <g transform="translate(750, 250)">
        <rect x="-100" y="-140" width="200" height="280" fill="#020617" rx="16" stroke="#f97316" strokeWidth="4" />
        <text x="0" y="-110" fill="#93c5fd" fontSize="18" fontWeight="black" textAnchor="middle">DATABASE</text>

        {/* The Massive "User" Record */}
        <g transform="translate(-80, -80)">
          <rect x="0" y="0" width="160" height="200" fill="#1e3a8a" rx="8" />
          
          <rect x="10" y="10" width="140" height="25" fill="#1d4ed8" rx="4" />
          <text x="80" y="27" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">id: "123"</text>
          
          <rect x="10" y="45" width="140" height="25" fill="#fb923c" rx="4" />
          <text x="80" y="62" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">name: "Alice"</text>

          <rect x="10" y="80" width="140" height="25" fill="#fb923c" rx="4" />
          <text x="80" y="97" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">avatar: "url..."</text>

          <rect x="10" y="115" width="140" height="25" fill="#1d4ed8" rx="4" />
          <text x="80" y="132" fill="#fff" fontSize="12" textAnchor="middle">email: "a@b.com"</text>

          <rect x="10" y="150" width="140" height="25" fill="#1d4ed8" rx="4" />
          <text x="80" y="167" fill="#fff" fontSize="12" textAnchor="middle">address: "123 St"</text>
        </g>
      </g>

      {/* ── Animations (The Query) ── */}
      <AnimatePresence>
        
        {/* Request flies to server */}
        {phase === "REQUESTING" && (
          <motion.g initial={{ x: 280, y: 250 }} animate={{ x: 620, y: 250 }} transition={{ duration: 0.8 }} exit={{ opacity: 0 }}>
            <rect x="-40" y="-15" width="80" height="30" fill="#ec4899" rx="4" filter="url(#glow-gql)" />
            <text x="0" y="4" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">query {`{...}`}</text>
          </motion.g>
        )}

        {/* Processing inside the server */}
        {phase === "PROCESSING" && (
          <motion.g transform="translate(750, 180)" initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
             <rect x="-70" y="-5" width="140" height="25" fill="none" stroke="#f59e0b" strokeWidth="4" rx="4" filter="url(#glow-gql)" />
             <text x="0" y="-15" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">Slicing requested fields...</text>
          </motion.g>
        )}

        {/* Payload Return */}
        {(phase === "RETURNING" || phase === "DONE") && queryResult && (
          <motion.g 
            initial={{ x: 620, y: 250 }} 
            animate={{ x: phase === "DONE" ? 250 : 250, y: 250 }} 
            transition={{ duration: 0.8 }}
          >
            <rect 
              x="-60" y={-20 - (returnedFields.length * 10)} 
              width="120" height={40 + (returnedFields.length * 20)} 
              fill={queryResult.status === "SUCCESS" ? "#10b981" : "#ef4444"} 
              rx="8" 
              stroke="#fff" 
              strokeWidth="2" 
              filter="url(#glow-gql)" 
            />
            <text x="0" y={-5 - (returnedFields.length * 10)} fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">
               {queryResult.status === "SUCCESS" ? "PERFECT PAYLOAD" : 
                queryResult.status === "OVERFETCH" ? "OVER-FETCHED" : "UNDER-FETCHED"}
            </text>
            {returnedFields.map((field, i) => (
               <text key={field} x="0" y={15 + (i * 20) - (returnedFields.length * 10)} fill="#fff" fontSize="12" textAnchor="middle">
                 {field}
               </text>
            ))}
          </motion.g>
        )}

      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const TIMER_DURATION_SECONDS = 5 * 60;

export default function GraphQLBasics9() {
  const { reportComplete: _reportComplete } = useLMSBridge("graphqlbasics9");

  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLabComplete, setIsLabComplete] = useState(false);

  const reportComplete = useCallback((args?: any) => {
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
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [queryInput, setQueryInput] = useState("{\n  user {\n    id\n    name\n    avatar\n    email\n    address\n  }\n}");
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [hasWon, setHasWon] = useState(false);

  const ALL_FIELDS = ["id", "name", "avatar", "email", "address"];
  
  const runQuery = () => {
    if (phase !== "IDLE" && phase !== "DONE") return;
    
    // Parse the query simply by checking for keywords
    const lowerQuery = queryInput.toLowerCase();
    
    let returnedFields: string[] = [];
    ALL_FIELDS.forEach(f => {
       if (lowerQuery.includes(f)) {
          returnedFields.push(f);
       }
    });

    let status: QueryResult["status"] = "SUCCESS";
    
    if (!returnedFields.includes("name") || !returnedFields.includes("avatar")) {
        status = "UNDERFETCH";
    } else if (returnedFields.length > 2) {
        status = "OVERFETCH";
    }

    setQueryResult({ status, dataReturned: returnedFields });
    
    // Request flies out
    setPhase("REQUESTING");
    playPop();

    setTimeout(() => {
      // Server processing
      setPhase("PROCESSING");
      playZap();

      setTimeout(() => {
        // Return payload
        setPhase("RETURNING");
        if (status === "SUCCESS") playSuccess();
        else playError();

        setTimeout(() => {
           setPhase("DONE");
           if (status === "SUCCESS" && !hasWon) {
              setHasWon(true);
              setTimeout(reportComplete, 1500);
           }
        }, 800);
      }, 1000);
    }, 800);
  };

  return (
    <LabShell
      navExtra={
        !isLabComplete && (
          <div className={`flex items-center gap-1.5 px-4 h-9 md:h-10 rounded-full text-sm font-bold border shadow-sm ${
            timedOut ? "bg-rose-50 border-rose-200 text-rose-600" :
            secondsLeft <= 30 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" :
            "bg-white border-sky-100/80 text-sky-700"
          }`}>
            <Timer size={16} strokeWidth={2.5} />
            <span>{timedOut ? "Time's Up" : formattedTime}</span>
          </div>
        )
      } labId="graphqlbasics9" theme="forge" title="GraphQL Data Fetching" subtitle="L38 · Web Engineering"
      instruction="Your Mobile App UI only needs the user's `name` and `avatar`. The current query is requesting the entire database row (REST style), which causes an 'Over-fetching' performance issue. Edit the GraphQL query to fetch EXACTLY what is needed, and nothing else." compact>
      
      <Celebration isActive={hasWon} message="Perfect Data Slice! GraphQL solves 'Over-fetching' by letting the Client tell the Server EXACTLY what fields it wants. The Server slices the exact requested data out of the database, resulting in lightning-fast, tiny payloads for mobile devices." onReplay={() => {
        setPhase("IDLE"); setHasWon(false); setQueryResult(null);
      }} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls (The IDE) */}
        <div className="shrink-0 panel-glass rounded-2xl border-pink-900/50 p-4 flex flex-col md:flex-row items-stretch justify-center gap-6">
          
          <div className="flex-1 flex flex-col gap-2 relative">
             <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                <Code2 size={16} /> GraphQL Query Editor
             </div>
             <textarea 
                value={queryInput}
                onChange={(e) => {
                   setQueryInput(e.target.value);
                   setPhase("IDLE");
                }}
                className="w-full h-32 bg-black/60 border-2 border-pink-500/50 rounded-xl p-4 text-pink-300 font-mono text-sm focus:outline-none focus:border-pink-400 resize-none"
                spellCheck="false"
             />
          </div>
          
          <div className="flex flex-col justify-end">
            <button 
              onClick={runQuery} 
              disabled={phase !== "IDLE" && phase !== "DONE"}
              className="px-8 py-4 rounded-xl font-black bg-emerald-600/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2 h-16"
            >
              <Search size={20}/> Execute Query
            </button>
          </div>

        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-pink-900/40 bg-[#030712] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <GraphQlSVG phase={phase} queryResult={queryResult} />
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
