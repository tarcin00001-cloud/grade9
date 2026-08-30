"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Globe, Lock, ShieldCheck, UserCircle, KeySquare, ChevronRight, Copy } from "lucide-react";

// ─── SVG Architecture Visualizer ──────────────────────────────────────────────

type Phase = "APP_START" | "GOOGLE_CONSENT" | "GOOGLE_TOKEN" | "APP_RETURN" | "FETCHING_DATA" | "DONE";

function OauthSVG({ phase }: { phase: Phase }) {
  return (
    <svg viewBox="0 0 900 350" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-oauth">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="gridOauth" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
      </defs>

      <rect width="900" height="350" fill="url(#gridOauth)" />

      {/* ── Client (User Browser) ── */}
      <g transform="translate(450, 280)">
        <rect x="-80" y="-30" width="160" height="60" fill="#1e3a8a" rx="30" stroke="#3b82f6" strokeWidth="4" />
        <text x="0" y="5" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">YOUR BROWSER</text>
        
        {/* Token held by user */}
        {(phase === "GOOGLE_TOKEN" || phase === "APP_RETURN" || phase === "FETCHING_DATA" || phase === "DONE") && (
           <rect x="-15" y="-50" width="30" height="20" fill="#f59e0b" rx="4" filter="url(#glow-oauth)" />
        )}
      </g>

      {/* ── Unknown Web App ── */}
      <g transform="translate(200, 100)">
        <rect x="-100" y="-80" width="200" height="160" fill="#0f172a" rx="16" stroke="#94a3b8" strokeWidth="4" />
        <text x="0" y="-50" fill="#cbd5e1" fontSize="18" fontWeight="black" textAnchor="middle">super-sketchy-game.com</text>
        
        {/* State of the app */}
        <rect x="-80" y="-20" width="160" height="60" fill="#1e293b" rx="8" />
        <text x="0" y="15" fill={phase === "DONE" ? "#10b981" : "#475569"} fontSize="14" fontWeight="bold" textAnchor="middle">
           {phase === "DONE" ? "Welcome, Alice!" : "Who are you?"}
        </text>
      </g>

      {/* ── Google Identity Provider ── */}
      <g transform="translate(700, 100)">
        <rect x="-120" y="-80" width="240" height="160" fill="#172554" rx="20" stroke="#3b82f6" strokeWidth="6" />
        <text x="0" y="-50" fill="#bfdbfe" fontSize="20" fontWeight="black" textAnchor="middle">Google (OAuth Provider)</text>

        {/* Database with User Info */}
        <rect x="-90" y="-20" width="180" height="70" fill="#020617" rx="8" stroke="#1d4ed8" strokeWidth="2" />
        <text x="-80" y="0" fill="#fff" fontSize="12" fontWeight="bold">Alice's Secure Data</text>
        <text x="-80" y="20" fill="#94a3b8" fontSize="10">Email: alice@example.com</text>
        <text x="-80" y="40" fill="#ef4444" fontSize="10">Pass: hunter2 (SECRET!)</text>

        {/* The golden token waiting to be minted */}
        {phase === "GOOGLE_CONSENT" && (
           <rect x="0" y="10" width="60" height="30" fill="#f59e0b" rx="4" filter="url(#glow-oauth)" className="animate-pulse" />
        )}
      </g>

      {/* ── Redirection Lines ── */}
      <path d="M 400,250 C 300,200 200,220 200,180" fill="none" stroke="#64748b" strokeWidth="4" strokeDasharray="5 5" />
      <path d="M 500,250 C 600,200 700,220 700,180" fill="none" stroke="#64748b" strokeWidth="4" strokeDasharray="5 5" />

      {/* Active Flow Animations */}
      <AnimatePresence>
         {/* User is on the Sketchy App */}
         {(phase === "APP_START" || phase === "APP_RETURN") && (
            <motion.circle cx="200" cy="180" r="10" fill="#3b82f6" filter="url(#glow-oauth)" />
         )}

         {/* User is on Google */}
         {(phase === "GOOGLE_CONSENT" || phase === "GOOGLE_TOKEN") && (
            <motion.circle cx="700" cy="180" r="10" fill="#3b82f6" filter="url(#glow-oauth)" />
         )}

         {/* App fetches data from Google using Token */}
         {phase === "FETCHING_DATA" && (
            <g>
               <motion.rect x="-15" y="-10" width="30" height="20" fill="#f59e0b" rx="4" filter="url(#glow-oauth)"
                 initial={{ x: 300, y: 100 }} animate={{ x: 580, y: 100 }} transition={{ duration: 1 }}
               />
               <motion.rect x="-30" y="-15" width="60" height="30" fill="#34d399" rx="4"
                 initial={{ x: 580, y: 100 }} animate={{ x: 300, y: 100 }} transition={{ duration: 1, delay: 1 }}
               />
               <text x="440" y="80" fill="#34d399" fontSize="12" textAnchor="middle" filter="url(#glow-oauth)">Returning: "Alice"</text>
            </g>
         )}
      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function OauthFlow9() {
  const { reportComplete } = useLMSBridge("oauthflow9");
  const { playPop, playZap, playSuccess, playError } = useLabAudio();

  const [phase, setPhase] = useState<Phase>("APP_START");
  const [hasWon, setHasWon] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const REAL_TOKEN = "eyJhGci...9fB2";

  const proceedToConsent = () => {
    playZap();
    setPhase("GOOGLE_CONSENT");
  };

  const approveConsent = () => {
    playSuccess();
    setPhase("GOOGLE_TOKEN");
  };

  const copyTokenAndReturn = () => {
    playPop();
    setPhase("APP_RETURN");
  };

  const submitTokenToApp = () => {
     if (tokenInput !== REAL_TOKEN) {
        playError();
        return;
     }

     playPop();
     setPhase("FETCHING_DATA");

     setTimeout(() => {
        setPhase("DONE");
        playSuccess();
        if (!hasWon) {
           setHasWon(true);
           setTimeout(reportComplete, 1500);
        }
     }, 2500);
  };

  const reset = () => {
    setPhase("APP_START");
    setHasWon(false);
    setTokenInput("");
  };

  return (
    <LabShell labId="oauthflow9" theme="ocean" title="OAuth 2.0 (SSO Identity)" subtitle="L42 · Web Security"
      instruction="You want to play 'Super Sketchy Game', but you don't want to create a new password for them (they might steal it!). Be your own browser. Redirect to Google, grant consent for your Name ONLY, get an Access Token, and bring it back to the game to log in securely." compact>
      
      <Celebration isActive={hasWon} message="Identity Verified! OAuth solves the password problem. Instead of handing your password to 100 different sketch apps, you log into 1 secure provider (Google/Apple). They mint a temporary 'Access Token' that only grants access to your Name and Email." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls (The Browser Roleplay) */}
        <div className="shrink-0 flex flex-col border-2 border-slate-700 rounded-2xl overflow-hidden bg-[#020617] shadow-xl">
           
           {/* Browser Address Bar */}
           <div className="bg-slate-900 border-b border-slate-700 p-3 flex items-center gap-3">
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="flex-1 bg-black/50 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-mono text-slate-300">
                 {phase === "GOOGLE_CONSENT" || phase === "GOOGLE_TOKEN" ? (
                    <><Lock size={14} className="text-emerald-500" /> https://accounts.google.com/oauth/consent?client_id=sketchy_game</>
                 ) : (
                    <><Globe size={14} className="text-slate-500" /> http://super-sketchy-game.com{phase === "APP_RETURN" ? "/callback" : ""}</>
                 )}
              </div>
           </div>

           {/* Browser Viewport */}
           <div className="p-6 h-48 flex items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                 
                 {phase === "APP_START" && (
                    <motion.div key="app-start" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center gap-4 text-center">
                       <h2 className="text-xl font-black text-slate-200">Super Sketchy Game</h2>
                       <p className="text-sm text-slate-400">Please log in to play.</p>
                       <button onClick={proceedToConsent} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 transition-all">
                          <UserCircle size={18} /> Login with Google
                       </button>
                    </motion.div>
                 )}

                 {phase === "GOOGLE_CONSENT" && (
                    <motion.div key="google-consent" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center gap-4 text-center max-w-sm">
                       <h2 className="text-xl font-black text-blue-400">Google OAuth</h2>
                       <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-sm text-slate-300">
                          <strong>super-sketchy-game.com</strong> wants to access your:
                          <ul className="list-disc text-left pl-6 mt-2 text-emerald-400 font-bold">
                             <li>Name</li>
                             <li>Email Address</li>
                          </ul>
                          <div className="mt-2 text-rose-400 text-xs">(It will NOT see your password)</div>
                       </div>
                       <button onClick={approveConsent} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 transition-all w-full justify-center">
                          <ShieldCheck size={18} /> Allow Access
                       </button>
                    </motion.div>
                 )}

                 {phase === "GOOGLE_TOKEN" && (
                    <motion.div key="google-token" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 text-center max-w-sm">
                       <h2 className="text-xl font-black text-amber-500 flex items-center gap-2"><KeySquare /> Access Token Generated</h2>
                       <p className="text-sm text-slate-300">Copy this token and bring it back to the app.</p>
                       <div className="bg-amber-500/10 border border-amber-500/50 p-3 rounded-lg text-amber-400 font-mono text-sm tracking-widest break-all">
                          {REAL_TOKEN}
                       </div>
                       <button onClick={copyTokenAndReturn} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 transition-all w-full justify-center">
                          <Copy size={18} /> Copy & Return to App
                       </button>
                    </motion.div>
                 )}

                 {phase === "APP_RETURN" && (
                    <motion.div key="app-return" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center gap-4 text-center">
                       <h2 className="text-xl font-black text-slate-200">Super Sketchy Game</h2>
                       <p className="text-sm text-slate-400">Welcome back. Please paste your token to finish logging in.</p>
                       <div className="flex gap-2 w-full max-w-sm">
                          <input 
                             type="text" 
                             placeholder="Paste token here..." 
                             value={tokenInput}
                             onChange={(e) => setTokenInput(e.target.value)}
                             className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                          />
                          <button onClick={submitTokenToApp} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all">
                             <ChevronRight size={20} />
                          </button>
                       </div>
                    </motion.div>
                 )}

                 {phase === "FETCHING_DATA" && (
                    <motion.div key="fetching-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
                       <h2 className="text-xl font-black text-slate-400 animate-pulse">Exchanging Token for Identity...</h2>
                    </motion.div>
                 )}

                 {phase === "DONE" && (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 text-center">
                       <h2 className="text-2xl font-black text-emerald-400">Welcome, Alice!</h2>
                       <p className="text-sm text-slate-300">You successfully logged in without ever typing a password here.</p>
                       <button onClick={reset} className="mt-2 text-xs text-slate-500 underline hover:text-slate-300">Reset Lab</button>
                    </motion.div>
                 )}

              </AnimatePresence>
           </div>
        </div>

        {/* Main SVG Area */}
        <div className="flex-1 panel-glass rounded-3xl overflow-x-auto overflow-y-hidden relative border-sky-900/40 bg-[#000000] shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.6] min-w-[800px]">
            <OauthSVG phase={phase} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
