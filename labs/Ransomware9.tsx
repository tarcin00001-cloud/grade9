"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { FileIcon, Lock, AlertOctagon, Activity, WifiOff } from "lucide-react";

// ─── SVG Ransomware Visualizer ────────────────────────────────────────────────

type FileData = { id: number; name: string; type: string; isEncrypted: boolean };

function RansomwareSVG({
  localFiles,
  backupFiles,
  phase,
  networkConnected
}: {
  localFiles: FileData[];
  backupFiles: FileData[];
  phase: "IDLE" | "INFECTING" | "GAME_OVER" | "SAVED";
  networkConnected: boolean;
}) {
  const isGameOver = phase === "GAME_OVER";
  
  return (
    <svg viewBox="0 0 900 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow-red">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Areas ── */}
      <rect x="50" y="50" width="350" height="400" fill="#0f172a" rx="12" stroke="#334155" strokeWidth="2" />
      <text x="225" y="80" fill="#94a3b8" fontSize="18" fontWeight="bold" textAnchor="middle">LOCAL DESKTOP (C:)</text>

      <rect x="500" y="50" width="350" height="400" fill="#0f172a" rx="12" stroke="#334155" strokeWidth="2" />
      <text x="675" y="80" fill="#94a3b8" fontSize="18" fontWeight="bold" textAnchor="middle">NETWORK BACKUP (Z:)</text>

      {/* Network Cable */}
      <path d="M 400,250 L 500,250" fill="none" stroke={networkConnected ? "#3b82f6" : "#475569"} strokeWidth="8" strokeDasharray={networkConnected ? "0" : "10,10"} />
      {phase === "INFECTING" && networkConnected && (
         <circle cx="450" cy="250" r="6" fill="#f43f5e" filter="url(#glow-red)">
           <animate attributeName="cx" values="400;500" dur="0.8s" repeatCount="indefinite" />
         </circle>
      )}

      {/* ── Files Rendering ── */}
      {[...localFiles.map((f, i) => ({ ...f, x: 120 + (i % 2) * 120, y: 130 + Math.floor(i / 2) * 100 })),
        ...backupFiles.map((f, i) => ({ ...f, x: 570 + (i % 2) * 120, y: 130 + Math.floor(i / 2) * 100 }))].map((f) => (
        <motion.g 
          key={f.id} 
          initial={{ x: f.x, y: f.y }}
          animate={{ x: f.x, y: f.y, rotateY: f.isEncrypted ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {f.isEncrypted ? (
            <g style={{ transform: "rotateY(180deg)" }}>
              <rect x="-30" y="-30" width="60" height="80" fill="#4c0519" rx="4" stroke="#f43f5e" strokeWidth="2" filter="url(#glow-red)" />
              <rect x="-15" y="-10" width="30" height="20" fill="#fb7185" rx="2" />
              <path d="M -10,-10 C -10,-25 10,-25 10,-10" fill="none" stroke="#f43f5e" strokeWidth="4" />
              <text x="0" y="30" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">.locked</text>
            </g>
          ) : (
            <g>
              <rect x="-30" y="-30" width="60" height="80" fill="#1e293b" rx="4" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M 30,-10 L 10,-30 L 10,-10 Z" fill="#cbd5e1" />
              <text x="0" y="10" fill={f.type === "EXE" ? "#f87171" : "#94a3b8"} fontSize="24" textAnchor="middle" fontFamily="sans-serif">{f.type}</text>
              <text x="0" y="65" fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">{f.name}</text>
            </g>
          )}
        </motion.g>
      ))}

      {/* ── Massive Ransom Note Overlay ── */}
      <AnimatePresence>
        {isGameOver && (
          <motion.g initial={{ y: -500 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 60, damping: 15 }}>
            <rect x="200" y="100" width="500" height="300" fill="#000" rx="16" stroke="#f43f5e" strokeWidth="6" filter="url(#glow-red)" />
            <rect x="200" y="100" width="500" height="60" fill="#fb7185" rx="10" />
            <text x="450" y="140" fill="#fff" fontSize="24" fontWeight="black" textAnchor="middle" letterSpacing="2">ALL YOUR BACKUPS ARE ENCRYPTED!</text>
            
            <text x="450" y="200" fill="#fca5a5" fontSize="16" textAnchor="middle">We used AES-256 to lock everything.</text>
            <text x="450" y="230" fill="#fca5a5" fontSize="16" textAnchor="middle">Because you didn't disconnect the network in time,</text>
            <text x="450" y="260" fill="#fca5a5" fontSize="16" textAnchor="middle">your remote backups are completely destroyed.</text>
            
            <text x="450" y="325" fill="#fbbf24" fontSize="18" fontWeight="bold" textAnchor="middle">TOTAL DATA LOSS</text>
          </motion.g>
        )}
      </AnimatePresence>

    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Ransomware9() {
  const { reportComplete } = useLMSBridge("ransomware9");
  const { playPop, playZap, playError, playSuccess } = useLabAudio();

  const [localFiles, setLocalFiles] = useState<FileData[]>([
    { id: 1, name: "invoice.pdf.exe", type: "EXE", isEncrypted: false }, // The malicious payload disguised as a PDF
    { id: 2, name: "passwords.txt", type: "TXT", isEncrypted: false },
    { id: 3, name: "family_photo.jpg", type: "IMG", isEncrypted: false },
    { id: 4, name: "tax_return.pdf", type: "PDF", isEncrypted: false },
    { id: 5, name: "code_project.zip", type: "ZIP", isEncrypted: false },
    { id: 6, name: "db_dump.sql", type: "SQL", isEncrypted: false },
  ]);

  const [backupFiles, setBackupFiles] = useState<FileData[]>([
    { id: 7, name: "passwords_bkp.txt", type: "TXT", isEncrypted: false },
    { id: 8, name: "family_photo_bkp.jpg", type: "IMG", isEncrypted: false },
    { id: 9, name: "tax_return_bkp.pdf", type: "PDF", isEncrypted: false },
    { id: 10, name: "code_project_bkp.zip", type: "ZIP", isEncrypted: false },
    { id: 11, name: "db_dump_bkp.sql", type: "SQL", isEncrypted: false },
  ]);

  const [phase, setPhase] = useState<"IDLE" | "INFECTING" | "GAME_OVER" | "SAVED">("IDLE");
  const [networkConnected, setNetworkConnected] = useState(true);
  const [hasWon, setHasWon] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInfection = () => {
    if (phase !== "IDLE") return;
    setPhase("INFECTING");
    playError();

    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      let encryptedCount = 0;
      
      // Encrypt Local First
      setLocalFiles(prev => {
        const next = [...prev];
        const unencrypted = next.findIndex(f => !f.isEncrypted);
        if (unencrypted !== -1) {
          next[unencrypted] = { ...next[unencrypted], isEncrypted: true };
          playZap();
        }
        encryptedCount += next.filter(f => f.isEncrypted).length;
        return next;
      });

      // If local is done, and network is connected, encrypt backup
      setLocalFiles(currentLocal => {
         if (currentLocal.every(f => f.isEncrypted)) {
             setBackupFiles(prev => {
                 // Check if network is disconnected! We must use a ref or check state carefully.
                 // Actually, the closure might have stale state for networkConnected. 
                 // So we rely on a functional update trick or effect cleanup.
                 return prev; 
             });
         }
         return currentLocal;
      });

    }, 800);
  };

  // We need an effect to handle the backup encryption so it has fresh network state
  useEffect(() => {
    if (phase !== "INFECTING") return;

    const allLocalEncrypted = localFiles.every(f => f.isEncrypted);
    if (allLocalEncrypted && networkConnected) {
        const unencryptedBackup = backupFiles.findIndex(f => !f.isEncrypted);
        if (unencryptedBackup !== -1) {
            const timeoutId = setTimeout(() => {
                 if (networkConnected && phase === "INFECTING") {
                     setBackupFiles(prev => {
                         const next = [...prev];
                         next[unencryptedBackup] = { ...next[unencryptedBackup], isEncrypted: true };
                         playZap();
                         return next;
                     });
                 }
            }, 800);
            return () => clearTimeout(timeoutId);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPhase("GAME_OVER");
            playError();
        }
    }
  }, [localFiles, backupFiles, networkConnected, phase, playZap, playError]);

  const disconnectNetwork = () => {
    if (phase !== "INFECTING") return;
    setNetworkConnected(false);
    playPop();
    
    // Check if we saved the backups!
    if (backupFiles.some(f => !f.isEncrypted)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("SAVED");
        setHasWon(true);
        playSuccess();
        setTimeout(reportComplete, 1500);
    }
  };

  const killProcess = () => {
    if (phase !== "INFECTING") return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    playPop();
    setPhase("SAVED");
    setHasWon(true);
    playSuccess();
    setTimeout(reportComplete, 1500);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("IDLE");
    setNetworkConnected(true);
    setLocalFiles(localFiles.map(f => ({ ...f, isEncrypted: false })));
    setBackupFiles(backupFiles.map(f => ({ ...f, isEncrypted: false })));
    setHasWon(false);
  };

  return (
    <LabShell 
      labId="ransomware9" 
      theme="studio" 
      title="Ransomware Incident Response" 
      instruction="1. Review the standard procedures for responding to a ransomware incident. 2. Identify the infected systems and isolate them within the simulated network. 3. Analyze the ransomware behavior and attempt to decrypt or restore the data from backups. 4. Draft a post-incident report detailing the mitigation steps and future preventative measures." 
      compact
      onReset={reset}
    >
      
      <Celebration isActive={hasWon} message="Threat Contained! By reacting quickly to sever the network or kill the process, you preserved the Backup Drive. You can now format the local drive and restore from backups without paying the ransom." onReplay={reset} />

      <div className="w-full flex flex-col flex-1 min-h-0 pt-1 gap-3">
        
        {/* Interactive Controls */}
        <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button 
            onClick={startInfection} 
            disabled={phase !== "IDLE"}
            className={`p-4 rounded-xl border-2 transition-all font-black text-sm flex flex-col items-center justify-center gap-2 ${phase === "IDLE" ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 animate-pulse shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400"}`}
          >
            <AlertOctagon size={24}/> 1. Double Click 'invoice.pdf.exe'
          </button>
          
          <button 
            onClick={killProcess} 
            disabled={phase !== "INFECTING"}
            className={`p-4 rounded-xl border-2 transition-all font-black text-sm flex flex-col items-center justify-center gap-2 ${phase === "INFECTING" ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400"}`}
          >
            <Activity size={24}/> Task Manager: Kill Process
          </button>

          <button 
            onClick={disconnectNetwork} 
            disabled={phase !== "INFECTING" || !networkConnected}
            className={`p-4 rounded-xl border-2 transition-all font-black text-sm flex flex-col items-center justify-center gap-2 ${phase === "INFECTING" && networkConnected ? "border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-400"}`}
          >
            <WifiOff size={24}/> Unplug Network Cable
          </button>

        </div>

        {/* Phase Indicator */}
        <div className="shrink-0 flex justify-center">
            {phase === "INFECTING" && <div className="text-rose-500 font-bold animate-pulse text-lg tracking-widest"> ENCRYPTION IN PROGRESS </div>}
            {phase === "GAME_OVER" && <div className="text-rose-600 font-black text-xl">MISSION FAILED - DATA LOST</div>}
            {phase === "SAVED" && <div className="text-emerald-500 font-black text-xl">THREAT CONTAINED - BACKUPS SAFE</div>}
            {phase === "IDLE" && <div className="text-slate-500 font-bold">SYSTEM NORMAL</div>}
        </div>

        {/* Main SVG Area */}
        <div className="flex-1 bg-slate-50 shadow-inner rounded-3xl overflow-x-auto overflow-y-hidden relative border border-slate-200 flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[2.2] min-w-[800px]">
            <RansomwareSVG localFiles={localFiles} backupFiles={backupFiles} phase={phase} networkConnected={networkConnected} />
          </div>
        </div>

      </div>
    </LabShell>
  );
}
