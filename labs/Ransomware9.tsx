"use client";
import React, { useState, useEffect, useRef } from 'react';
import LabShell from '@/components/LabShell';
import { useLabAudio } from '@/hooks/useLabAudio';
import { useLMSBridge } from '@/hooks/useLMSBridge';
import { ShieldAlert, Cpu, HardDrive, Server, FileText, Image as ImageIcon, Archive, Database, Activity, Wifi, CheckCircle, Search, Trash2, Key, User, ArrowRight, Lock, Unlock, AlertTriangle, Fingerprint, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Celebration from '@/components/Celebration';

type Phase = 
  | 'M1_LEARN' | 'M1_INFECTING' | 'M1_CONTAINED' | 'M1_FAILED'
  | 'M2_FIREWALL' | 'M2_SUCCESS' 
  | 'M3_ERADICATE' | 'M3_SUCCESS'
  | 'M4_RECOVERY' | 'M4_SUCCESS'
  | 'M5_FORENSICS' | 'M5_SUCCESS'
  | 'M6_HARDENING' | 'M6_SUCCESS';

const INITIAL_LOCAL = [
    { id: 1, name: 'invoice.pdf.exe', type: 'exe', isEncrypted: false },
    { id: 2, name: 'passwords.txt', type: 'txt', isEncrypted: false },
    { id: 3, name: 'family_photo.jpg', type: 'img', isEncrypted: false },
    { id: 4, name: 'tax_return.pdf', type: 'pdf', isEncrypted: false },
    { id: 5, name: 'code_project.zip', type: 'zip', isEncrypted: false },
    { id: 6, name: 'db_dump.sql', type: 'db', isEncrypted: false },
];

const INITIAL_BACKUP = [
    { id: 1, name: 'passwords_bkp.txt', type: 'txt', isEncrypted: false },
    { id: 2, name: 'family_photo_bkp.jpg', type: 'img', isEncrypted: false },
    { id: 3, name: 'tax_return_bkp.pdf', type: 'pdf', isEncrypted: false },
    { id: 4, name: 'code_project_bkp.zip', type: 'zip', isEncrypted: false },
    { id: 5, name: 'db_dump_bkp.sql', type: 'db', isEncrypted: false },
    { id: 6, name: 'system_image.iso', type: 'iso', isEncrypted: false },
];

export default function RansomwareIncidentResponse() {
    const { playClick, playZap, playPop, playError, playSuccess, playHeavyThud, speakInstructions } = useLabAudio();
    const { reportComplete } = useLMSBridge();

    const [phase, setPhase] = useState<Phase>('M1_LEARN');
    const [localFiles, setLocalFiles] = useState(JSON.parse(JSON.stringify(INITIAL_LOCAL)));
    const [backupFiles, setBackupFiles] = useState(JSON.parse(JSON.stringify(INITIAL_BACKUP)));
    
    // M1 States
    const [networkConnected, setNetworkConnected] = useState(true);
    const networkRef = useRef(true);
    const attackIdRef = useRef(0);
    const [taskProgress, setTaskProgress] = useState(0);

    // M2 States
    const [fwNode, setFwNode] = useState(0);

    // M3 States
    const [scannerFound, setScannerFound] = useState(false);
    const constraintsRef = useRef(null);

    // M4 States
    const [isWiped, setIsWiped] = useState(false);
    const [isCloning, setIsCloning] = useState(false);

    // M5 States
    const [logMatched, setLogMatched] = useState(false);

    // M6 States
    const [chipSwapped, setChipSwapped] = useState(false);

    // Sync ref
    useEffect(() => { networkRef.current = networkConnected; }, [networkConnected]);

    const handleReset = () => {
        playClick();
        attackIdRef.current += 1;
        setPhase('M1_LEARN');
        setLocalFiles(JSON.parse(JSON.stringify(INITIAL_LOCAL)));
        setBackupFiles(JSON.parse(JSON.stringify(INITIAL_BACKUP)));
        setNetworkConnected(true);
        setFwNode(0);
        setScannerFound(false);
        setIsWiped(false);
        setIsCloning(false);
        setLogMatched(false);
        setChipSwapped(false);
    };

    // MISSION 1 LOGIC
    const startM1Attack = async () => {
        attackIdRef.current += 1;
        const currentId = attackIdRef.current;
        setPhase('M1_INFECTING');
        playZap();
        
        let cur = JSON.parse(JSON.stringify(localFiles));
        for (let i = 0; i < cur.length; i++) {
            await new Promise(r => setTimeout(r, 400));
            if (attackIdRef.current !== currentId) return;
            cur[i].isEncrypted = true;
            setLocalFiles([...cur]);
            playPop();
        }
        await new Promise(r => setTimeout(r, 500));
        if (attackIdRef.current !== currentId) return;

        if (networkRef.current) {
            playError();
            let bkp = JSON.parse(JSON.stringify(backupFiles));
            for (let i = 0; i < bkp.length; i++) {
                await new Promise(r => setTimeout(r, 300));
                if (attackIdRef.current !== currentId) return;
                bkp[i].isEncrypted = true;
                setBackupFiles([...bkp]);
                playPop();
            }
            await new Promise(r => setTimeout(r, 1000));
            if (attackIdRef.current !== currentId) return;
            
            setPhase('M1_FAILED');
            playHeavyThud();
        } else {
            await new Promise(r => setTimeout(r, 1000));
            if (attackIdRef.current !== currentId) return;
            setPhase('M1_CONTAINED');
            playSuccess();
        }
    };

    const handleTaskManager = () => {
        playClick();
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setTaskProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setTaskProgress(0);
            }
        }, 100);
    };

    const handleUnplug = () => {
        if (phase === 'M1_INFECTING') {
            playZap();
            setNetworkConnected(false);
        }
    };

    // RENDERERS
    const renderMemo = () => {
        let text = "";
        let color = "bg-yellow-100 border-yellow-300 text-slate-800";
        if (phase === 'M1_LEARN') text = "M1: Physical Containment\nOpen 'invoice.pdf.exe' to inspect it. If it's malicious, physically disconnect the Backup Server instantly!";
        if (phase === 'M1_INFECTING') { text = "MALWARE DETECTED! Pull the physical cable! Software is too slow!"; color = "bg-rose-100 border-rose-400 text-rose-900 shadow-[0_0_15px_rgba(244,63,94,0.3)]"; }
        if (phase === 'M1_CONTAINED') { text = "M1 Complete: Physical isolation achieved.\nProceed to M2: Logical Containment."; color = "bg-emerald-100 border-emerald-300 text-emerald-900"; }
        if (phase === 'M1_FAILED') { text = "MISSION FAILED!\nSoftware response was too slow. The backups were destroyed.\nHit Try Again to reset."; color = "bg-rose-100 border-rose-400 text-rose-900"; }
        
        if (phase === 'M2_FIREWALL') text = "M2: Logical Containment\nThe physical cable is gone, but the Wi-Fi adapter activated. A C2 server is trying to connect. Tap the red Firewall Node to block it!";
        if (phase === 'M2_SUCCESS') { text = "M2 Complete: Logical perimeter secured.\nProceed to M3: Eradication."; color = "bg-emerald-100 border-emerald-300 text-emerald-900"; }
        
        if (phase === 'M3_ERADICATE') text = "M3: Eradication\nThe malware is trapped but alive in memory. Drag the X-Ray Scanner over the Local Drive to find the anomaly, then drop the Quarantine Cage on it!";
        if (phase === 'M3_SUCCESS') { text = "M3 Complete: Threat eradicated.\nProceed to M4: Recovery."; color = "bg-emerald-100 border-emerald-300 text-emerald-900"; }
        
        if (phase === 'M4_RECOVERY') text = "M4: Recovery\nThe drive is filled with encrypted garbage. Flip the FORMAT switch to wipe it, then drag the Clone Cable from the Server to restore operations.";
        if (phase === 'M4_SUCCESS') { text = "M4 Complete: Data restored.\nProceed to M5: Forensics."; color = "bg-emerald-100 border-emerald-300 text-emerald-900"; }

        if (phase === 'M5_FORENSICS') text = "M5: Forensics\nHow did it get in? Drag the Timestamp Marker across the System Log to match the infection time (10:14:05) and stamp the Threat Origin.";
        if (phase === 'M5_SUCCESS') { text = "M5 Complete: Root cause identified.\nProceed to M6: Hardening."; color = "bg-emerald-100 border-emerald-300 text-emerald-900"; }

        if (phase === 'M6_HARDENING') text = "M6: Hardening (Zero Trust)\nThe employee had full Admin rights. Enforce Least Privilege by physically swapping their Admin chip for a Standard chip.";
        if (phase === 'M6_SUCCESS') { text = "M6 Complete: Defenses Hardened.\nIncident Response Lifecycle Complete."; color = "bg-emerald-100 border-emerald-300 text-emerald-900"; }

        return (
            <div className={`w-full md:w-64 ${color} p-4 rounded shadow-xl border-2 rotate-0 md:rotate-[-2deg] shrink-0 transition-colors duration-300 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 rounded-bl-full"></div>
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-2 opacity-60">
                    <ShieldAlert size={14} /> MEMO
                </div>
                <p className="text-sm font-medium leading-tight whitespace-pre-wrap relative z-10">{text}</p>
                
                {phase === 'M1_FAILED' && (
                    <button 
                        onClick={handleReset}
                        className="mt-3 w-full py-2 bg-rose-600 text-white rounded font-bold hover:bg-rose-700 transition-colors shadow-lg border-b-4 border-rose-900 active:border-b-0 active:translate-y-1 relative z-10"
                    >
                        Try Again
                    </button>
                )}

                {(phase.includes('SUCCESS') || phase === 'M1_CONTAINED') && phase !== 'M6_SUCCESS' && (
                    <button 
                        onClick={() => {
                            playClick();
                            if(phase === 'M1_CONTAINED') setPhase('M2_FIREWALL');
                            if(phase === 'M2_SUCCESS') setPhase('M3_ERADICATE');
                            if(phase === 'M3_SUCCESS') setPhase('M4_RECOVERY');
                            if(phase === 'M4_SUCCESS') setPhase('M5_FORENSICS');
                            if(phase === 'M5_SUCCESS') setPhase('M6_HARDENING');
                        }}
                        className="mt-3 w-full py-2 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 transition-colors shadow-lg border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 relative z-10 flex items-center justify-center gap-2"
                    >
                        Next Mission <ArrowRight size={16} />
                    </button>
                )}
            </div>
        );
    };

    // M1 & M2 Desk Components
    const renderMonitorBase = (title: string, Icon: any, children: any, isServer: boolean = false) => (
        <div className="w-full max-w-xs flex flex-col items-center shrink-0 z-20">
            <div className={`w-full rounded-t-xl p-3 border-x-4 border-t-4 flex items-center justify-between shadow-xl ${isServer ? 'bg-slate-900 border-slate-950' : 'bg-slate-100 border-slate-900'}`}>
                <span className={`font-black tracking-widest text-xs flex items-center gap-1 ${isServer ? 'text-slate-300' : 'text-slate-800'}`}>
                    <Icon size={14}/> {title}
                </span>
                {isServer && (
                    <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full ${networkConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${networkConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`}></div>
                    </div>
                )}
            </div>
            <div className={`w-full p-4 border-x-4 border-b-4 rounded-b-xl shadow-2xl relative min-h-[11rem] flex flex-col ${isServer ? 'bg-slate-800 border-slate-950' : 'bg-white border-slate-900'}`}>
                {children}
            </div>
            {!isServer ? (
                <>
                    <div className="w-12 h-6 bg-slate-900 rounded-b shadow-xl border-x-4 border-slate-950 shrink-0"></div>
                    <div className="w-24 h-3 bg-slate-800 rounded-b shadow-2xl border-x-4 border-b-4 border-slate-950 shrink-0 mb-2"></div>
                </>
            ) : (
                <>
                    <div className="w-12 h-6 invisible shrink-0"></div>
                    <div className="w-24 h-3 invisible shrink-0 mb-2"></div>
                </>
            )}
        </div>
    );

    const renderM1Desk = () => (
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 w-full min-h-full p-4 relative z-0">
            {renderMonitorBase("LOCAL_C:\\", HardDrive, 
                <div className="grid grid-cols-2 gap-2 w-full h-full">
                    {localFiles.map((f: any) => (
                        <div 
                            key={f.id} 
                            onClick={() => { if (f.id === 1 && phase === 'M1_LEARN') startM1Attack(); }}
                            className={`flex flex-col items-center justify-center p-2 rounded border-2 transition-all ${
                                f.isEncrypted ? 'bg-rose-100 border-rose-500 text-rose-600 shadow-[inset_0_0_10px_rgba(225,29,72,0.3)]' : 
                                f.id === 1 && phase === 'M1_LEARN' ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 cursor-pointer border-dashed animate-pulse' :
                                'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                        >
                            {f.isEncrypted ? <ShieldAlert size={24} className="mb-1" /> : f.id === 1 ? <FileText size={24} className="mb-1 text-rose-500" /> : <ImageIcon size={24} className="mb-1" />}
                            <span className="text-[9px] font-bold text-center break-all leading-tight">
                                {f.isEncrypted ? 'ENCRYPTED.locked' : f.name}
                            </span>
                        </div>
                    ))}
                </div>
            , false)}

            <div className="w-8 md:w-24 h-24 md:h-8 flex flex-col md:flex-row items-center justify-center shrink-0 z-10 relative">
                {networkConnected ? (
                    <div className="w-2 h-full md:w-full md:h-4 bg-gradient-to-r md:bg-gradient-to-b from-amber-500 to-amber-700 rounded-full border-x md:border-y border-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                ) : (
                    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between">
                        <div className="w-2 h-8 md:w-8 md:h-4 bg-gradient-to-r md:bg-gradient-to-b from-slate-400 to-slate-600 rounded-full border-x md:border-y border-slate-800"></div>
                        <div className="w-2 h-8 md:w-8 md:h-4 bg-gradient-to-r md:bg-gradient-to-b from-slate-400 to-slate-600 rounded-full border-x md:border-y border-slate-800"></div>
                    </div>
                )}
            </div>

            {renderMonitorBase("SERVER_Z:", Server,
                <div className="grid grid-cols-2 gap-2 w-full h-full">
                    {backupFiles.map((f: any) => (
                        <div key={f.id} className={`flex flex-col items-center justify-center p-2 rounded border-2 transition-colors ${f.isEncrypted ? 'bg-rose-950/50 border-rose-900 text-rose-500 shadow-[inset_0_0_10px_rgba(225,29,72,0.2)]' : 'bg-slate-900/80 border-slate-700 text-slate-400'}`}>
                            {f.isEncrypted ? <ShieldAlert size={24} className="mb-1" /> : <Archive size={24} className="mb-1 text-slate-500" />}
                            <span className="text-[9px] font-mono font-bold text-center break-all leading-tight">{f.isEncrypted ? 'ENCRYPTED' : f.name}</span>
                        </div>
                    ))}
                </div>
            , true)}
        </div>
    );

    const renderM2Firewall = () => {
        const isBlocked = fwNode === 1;
        
        return (
            <div className="w-full max-w-lg bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(15,23,42,1)] flex flex-col gap-6 relative shrink-0 z-50 overflow-hidden">
                {/* Elite Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                
                {/* Top Scanning Laser */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0 opacity-50"></div>
                
                <h3 className="text-center font-mono text-[10px] tracking-[0.4em] text-cyan-300 uppercase font-black bg-slate-950/80 py-2 rounded border-y border-cyan-900/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] relative z-10 backdrop-blur-sm">
                    Firewall Routing Matrix
                </h3>
                
                <div className="relative w-full h-64 mt-2 z-10">
                    {/* SVG Straight Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                        {/* Source to Nodes */}
                        <line x1="10%" y1="50%" x2="50%" y2="15%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" />
                        <line x1="10%" y1="50%" x2="50%" y2="50%" stroke={isBlocked ? "rgba(51, 65, 85, 0.8)" : "rgba(244, 63, 94, 0.8)"} strokeWidth="4" className={isBlocked ? "" : "animate-pulse"} />
                        <line x1="10%" y1="50%" x2="50%" y2="85%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" />
                        
                        {/* Nodes to Destinations */}
                        <line x1="50%" y1="15%" x2="90%" y2="15%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" />
                        <line x1="50%" y1="50%" x2="90%" y2="50%" stroke={isBlocked ? "rgba(51, 65, 85, 0.8)" : "rgba(244, 63, 94, 0.8)"} strokeWidth="4" className={isBlocked ? "" : "animate-pulse"} />
                        <line x1="50%" y1="85%" x2="90%" y2="85%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" />
                    </svg>

                    {/* Source: Network Interface */}
                    <div className="absolute left-[10%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex flex-col items-center justify-center bg-slate-950 rounded-lg border-2 border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20">
                        <Wifi size={24} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                    </div>

                    {[0, 1, 2].map((i) => {
                        const isThreat = i === 1;
                        const topPos = i === 0 ? '15%' : i === 1 ? '50%' : '85%';
                        
                        return (
                            <div key={i}>
                                {/* Firewall Node */}
                                <div className="absolute left-[50%] -translate-x-1/2 -translate-y-1/2 z-30" style={{ top: topPos }}>
                                    <button 
                                        disabled={!isThreat || isBlocked}
                                        onClick={() => {
                                            if(isThreat) {
                                                playZap();
                                                setFwNode(1);
                                                setTimeout(() => { playHeavyThud(); playSuccess(); setPhase('M2_SUCCESS'); }, 800);
                                            } else {
                                                playError();
                                            }
                                        }}
                                        className={`relative w-12 h-12 flex items-center justify-center transition-all duration-300 ${isThreat && !isBlocked ? 'cursor-pointer hover:scale-110 active:scale-90' : 'cursor-default'}`}
                                    >
                                        {/* Outer Physical Bezel (Diamond) */}
                                        <div className={`absolute inset-0 rounded-lg border-2 rotate-45 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8),0_5px_15px_rgba(0,0,0,0.6)] ${isBlocked && isThreat ? 'bg-slate-800 border-slate-600' : 'bg-slate-950 border-slate-800'}`}></div>
                                        
                                        {/* Inner Core */}
                                        <div className="absolute inset-2 rotate-45 flex items-center justify-center overflow-hidden rounded-sm bg-slate-900">
                                            {isThreat && !isBlocked ? (
                                                <div className="w-full h-full bg-rose-950 flex items-center justify-center relative border border-rose-900 shadow-[inset_0_0_15px_rgba(225,29,72,0.5)]">
                                                    <div className="absolute inset-0 bg-rose-500/30 animate-ping"></div>
                                                    <div className="w-6 h-6 bg-rose-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,1)] border border-rose-400 relative z-10">
                                                        <AlertTriangle size={14} className="text-white -rotate-45" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            ) : isBlocked && isThreat ? (
                                                <div className="w-full h-full bg-gradient-to-b from-slate-300 to-slate-500 flex flex-col justify-evenly p-[2px] border border-slate-400">
                                                    <div className="w-full h-[1px] bg-slate-600/50"></div>
                                                    <div className="w-full h-[1px] bg-slate-600/50"></div>
                                                    <div className="w-full h-[1px] bg-slate-600/50"></div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-slate-900 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                                                    <div className="w-6 h-6 bg-emerald-900/40 rounded flex items-center justify-center border border-emerald-800/50">
                                                        <CheckCircle size={14} className="text-emerald-500/60 -rotate-45" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Blocked X Overlay */}
                                        {isBlocked && isThreat && (
                                            <X size={20} className="relative z-30 text-slate-900 drop-shadow-md" strokeWidth={4}/>
                                        )}
                                    </button>
                                </div>

                                {/* Destination Server */}
                                <div className="absolute left-[90%] -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: topPos }}>
                                    <div className="w-10 h-10 flex items-center justify-center bg-slate-950 rounded border-2 border-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                        <Server size={18} className={isThreat && !isBlocked ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : isBlocked && isThreat ? 'text-slate-600' : 'text-emerald-600'} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderM3Eradicate = () => (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 w-full h-full p-4 relative z-0">
            {/* Massive Infected Monitor */}
            <div className="w-full max-w-sm flex flex-col items-center shrink-0 z-10 relative">
                <div className="w-full bg-slate-100 rounded-t-xl p-3 border-x-4 border-t-4 border-slate-900 flex items-center justify-between shadow-xl">
                    <span className="font-black tracking-widest text-xs text-slate-800 flex items-center gap-1"><HardDrive size={14}/> LOCAL_C:\</span>
                    <span className="text-[10px] font-mono text-rose-600 animate-pulse font-bold">120 THREATS</span>
                </div>
                <div className="w-full bg-slate-900 p-4 border-x-4 border-b-4 border-slate-900 rounded-b-xl grid grid-cols-4 gap-2 shadow-2xl relative min-h-[11rem] overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    {Array(16).fill(0).map((_,i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-2 rounded bg-rose-950/30 border border-rose-900/50">
                            <Lock size={16} className="text-rose-700/50 mb-1" />
                        </div>
                    ))}
                    {/* The Target Anomaly */}
                    {scannerFound && (
                        <div className="absolute top-[45%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-rose-500/20 rounded-full animate-ping z-0 border border-rose-500"></div>
                    )}
                </div>
                <div className="w-16 h-6 bg-slate-900 rounded-b shadow-xl border-x-4 border-slate-950 shrink-0"></div>
                <div className="w-32 h-4 bg-slate-800 rounded-b shadow-2xl border-x-4 border-b-4 border-slate-950 shrink-0 mb-2"></div>
            </div>

            {/* Tools on Desk */}
            <div className="bg-slate-300/50 p-4 rounded-xl border border-slate-400 shadow-inner flex flex-col md:flex-row gap-6 relative z-50">
                <div className="flex flex-col items-center gap-2 relative">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">X-Ray Scanner</span>
                    <div className="absolute top-[28px] w-20 h-20 rounded-full border-2 border-dashed border-slate-400 opacity-50 z-0 flex items-center justify-center"><Search size={24} className="text-slate-400/50"/></div>
                    <motion.div drag dragConstraints={constraintsRef} dragElastic={0} onDrag={(_, info) => {
                        if(info.offset.x < -50) {
                            if(!scannerFound) { setScannerFound(true); playPop(); }
                        }
                    }} className="w-20 h-20 bg-sky-500/20 backdrop-blur-md border-4 border-sky-400 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)] z-50 group">
                        <Search className="text-sky-300 group-active:scale-90 transition-transform" size={28}/>
                        <div className="absolute inset-2 border-2 border-dashed border-sky-300/50 rounded-full animate-[spin_4s_linear_infinite]"></div>
                    </motion.div>
                </div>

                <div className="flex flex-col items-center gap-2 relative">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quarantine</span>
                    <div className="absolute top-[28px] w-20 h-20 rounded-xl border-2 border-dashed border-slate-400 opacity-50 z-0 flex items-center justify-center"><AlertTriangle size={24} className="text-slate-400/50"/></div>
                    <motion.div drag dragConstraints={constraintsRef} onDragEnd={(_, info) => {
                        if(scannerFound && info.offset.x < -50) {
                            playZap(); playSuccess(); setPhase('M3_SUCCESS');
                        } else { playError(); }
                    }} className="w-20 h-20 bg-amber-500/20 backdrop-blur-sm border-4 border-amber-500 rounded-xl cursor-grab active:cursor-grabbing flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] z-50 group">
                        <AlertTriangle className="text-amber-500 group-active:scale-90 transition-transform" size={28}/>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30 mix-blend-overlay"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
    const renderM4Recovery = () => (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-16 w-full h-full p-4 relative z-0">
            {/* The Ruined Monitor */}
            <div className="w-full max-w-sm flex flex-col items-center shrink-0 z-10 relative">
                <div className="w-full bg-slate-100 rounded-t-xl p-3 border-x-4 border-t-4 border-slate-900 flex items-center justify-between shadow-xl">
                    <span className="font-black tracking-widest text-xs text-slate-800 flex items-center gap-1"><HardDrive size={14}/> LOCAL_C:\</span>
                </div>
                <div className={`w-full p-4 border-x-4 border-b-4 border-slate-900 rounded-b-xl shadow-2xl relative min-h-[11rem] flex items-center justify-center overflow-hidden transition-colors duration-1000 ${isWiped ? 'bg-slate-900' : 'bg-rose-950'}`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    {!isWiped && <Lock size={64} className="text-rose-500/50 animate-pulse" />}
                    {isWiped && !isCloning && <span className="font-mono text-slate-500 text-xs">NO BOOT DEVICE FOUND</span>}
                    {isCloning && (
                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center gap-2 border-4 border-emerald-500 animate-pulse rounded-xl z-20">
                            <Database size={48} className="text-emerald-400" />
                            <span className="font-mono text-emerald-400 font-bold tracking-widest mt-2">RESTORING...</span>
                        </div>
                    )}
                </div>
                <div className="w-12 h-6 bg-slate-900 rounded-b shadow-xl border-x-4 border-slate-950 shrink-0"></div>
                <div className="w-24 h-3 bg-slate-800 rounded-b shadow-2xl border-x-4 border-b-4 border-slate-950 shrink-0 mb-2"></div>
            </div>

            {/* The Server with Clone Cable */}
            <div className="w-full max-w-sm flex flex-col items-center shrink-0 z-20">
                <div className="w-full bg-slate-900 rounded-t-xl p-3 border-x-4 border-t-4 border-slate-950 flex items-center justify-between shadow-xl">
                    <span className="font-black tracking-widest text-xs text-slate-300 flex items-center gap-1"><Server size={14}/> SERVER_Z:</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    </div>
                </div>
                <div className="w-full bg-slate-800 p-4 border-x-4 border-b-4 border-slate-950 rounded-b-xl shadow-2xl relative min-h-[11rem] flex flex-col items-center justify-center overflow-hidden">
                    <Database size={48} className="text-slate-600 mb-6 opacity-50" />
                    
                    {/* The Cable Plug */}
                    <motion.div drag dragConstraints={constraintsRef} dragElastic={0} onDragEnd={(_, info) => {
                        if (isWiped && info.offset.x < -50) {
                            playZap(); setIsCloning(true); setTimeout(() => { playSuccess(); setPhase('M4_SUCCESS'); }, 1500);
                        } else if (!isWiped) {
                            playError();
                        }
                    }} className="w-32 h-12 bg-slate-950 border-2 border-slate-700 rounded-md cursor-grab active:cursor-grabbing z-50 flex items-center relative shadow-[0_25px_40px_rgba(0,0,0,0.7)] group transition-transform hover:scale-105 mb-4">
                        {/* Metal Connector Tip */}
                        <div className="w-8 h-8 bg-gradient-to-r from-slate-300 to-slate-400 absolute -left-8 border-y-2 border-l-2 border-slate-500 rounded-l-sm flex flex-col justify-evenly p-1 shadow-inner z-0">
                            <div className="w-full h-1 bg-slate-600 rounded-full"></div>
                            <div className="w-full h-1 bg-slate-600 rounded-full"></div>
                        </div> 
                        {/* Rubber Grip Ribs */}
                        <div className="absolute right-0 w-8 h-full bg-slate-900 border-l-2 border-slate-800 rounded-r-md flex flex-col justify-evenly py-1 px-2 shadow-inner">
                            <div className="w-full h-1 bg-slate-950 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                            <div className="w-full h-1 bg-slate-950 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                            <div className="w-full h-1 bg-slate-950 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                        </div>
                        {/* Cut-off cable wire */}
                        <div className="absolute right-0 translate-x-full w-6 h-4 bg-slate-950 border-y-2 border-slate-800 rounded-r-full shadow-inner opacity-80 z-[-1]"></div>
                        
                        <span className="text-xs text-sky-500 font-mono font-black tracking-widest pl-3 flex items-center gap-2 relative z-10 drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]"><Cpu size={14}/> DATA_LINK</span>
                    </motion.div>
                    <span className="text-[10px] font-bold text-slate-500 mt-4 text-center uppercase tracking-widest opacity-80">Drag Cable To Local_C<br/>After Format</span>

                </div>
                <div className="w-12 h-6 invisible shrink-0"></div>
                <div className="w-24 h-3 invisible shrink-0 mb-2"></div>
            </div>
        </div>
    );
    const renderM5Log = () => (
        <div className="flex-1 w-full flex justify-center items-center p-8">
            {/* Desk Mat */}
            <div className="w-full max-w-2xl bg-[#f4ecd8] rounded shadow-2xl border border-[#d3c9b1] relative overflow-hidden flex flex-col font-mono text-sm text-slate-800 select-none before:absolute before:inset-0 before:opacity-50 before:bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] before:pointer-events-none">
                <div className="absolute left-16 top-0 bottom-0 border-l-2 border-rose-400/30 z-0"></div>
                
                <div className="flex px-4 py-3 bg-[#e8deca] border-b-2 border-[#d3c9b1] font-black tracking-widest text-xs sticky top-0 z-10 shadow-sm">
                    <div className="w-32 text-center text-slate-600">TIMESTAMP</div>
                    <div className="flex-1 text-slate-600">SECURITY_EVENT_LOG.TXT</div>
                </div>

                <div className="h-72 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar">
                    {/* The Match Target */}
                    <div className={`absolute top-[108px] left-0 right-0 h-10 transition-colors ${logMatched ? 'bg-rose-500/20 border-y-2 border-rose-500' : 'bg-transparent'}`}></div>

                    <div className="flex items-center"><div className="w-32 text-center font-bold text-slate-500">10:11:22</div><div>User 'jsmith' authenticated successfully</div></div>
                    <div className="flex items-center"><div className="w-32 text-center font-bold text-slate-500">10:12:05</div><div>Windows Update service check complete</div></div>
                    <div className="flex items-center"><div className="w-32 text-center font-bold text-slate-500">10:13:45</div><div>Inbound email received: billing@haxx.or</div></div>
                    <div className="flex items-center font-black text-slate-900 relative z-20 text-base"><div className="w-32 text-center">10:14:05</div><div>Process created: invoice.pdf.exe</div></div>
                    <div className="flex items-center"><div className="w-32 text-center font-bold text-slate-500">10:14:06</div><div>Abnormal high disk I/O detected</div></div>
                    <div className="flex items-center"><div className="w-32 text-center font-bold text-slate-500">10:15:00</div><div>Outbound connection established: 198.51.100.4</div></div>
                    <div className="flex items-center"><div className="w-32 text-center font-bold text-slate-500">10:15:02</div><div>Volume Shadow Copies deleted</div></div>
                </div>

                <motion.div 
                    drag="y" dragConstraints={{ top: 0, bottom: 200 }} dragElastic={0}
                    onDragEnd={(_, info) => {
                        // Based on the layout, the 10:14:05 row is roughly 100px down.
                        if (info.offset.y > 30) { 
                            playSuccess(); setLogMatched(true); setPhase('M5_SUCCESS');
                        } else { playError(); }
                    }}
                    className="absolute right-12 top-24 w-32 h-16 bg-rose-700 text-white font-black flex flex-col items-center justify-center rounded cursor-grab shadow-2xl border-b-4 border-rose-900 active:border-b-0 active:translate-y-1 z-50 group hover:bg-rose-600 transition-colors"
                >
                    <span className="text-[10px] opacity-75">THREAT ORIGIN</span>
                    <span>STAMP</span>
                    <div className="absolute inset-1 border-2 border-dashed border-white/30 rounded-sm"></div>
                </motion.div>
            </div>
        </div>
    );

    const renderM6Badge = () => (
        <div className="flex-1 w-full flex flex-col md:flex-row justify-center items-center p-4 gap-12 relative z-0">
            {/* The Badge */}
            <div className="w-64 h-[18rem] bg-gradient-to-b from-white to-slate-100 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-300 flex flex-col relative group shrink-0">
                {/* Lanyard Hole */}
                <div className="w-full h-8 flex justify-center items-center border-b border-slate-200 bg-white rounded-t-xl shrink-0">
                    <div className="w-12 h-2 rounded-full bg-slate-300 shadow-inner"></div>
                </div>
                
                {/* Blue Header */}
                <div className="w-full h-8 bg-sky-700 shadow-md shrink-0"></div>
                
                <div className="p-4 flex flex-col items-center h-full relative">
                    <div className="w-full flex justify-between items-start mb-2">
                        {/* Photo */}
                        <div className="w-16 h-20 bg-slate-200 rounded-lg shadow-inner border-2 border-white overflow-hidden flex flex-col justify-end items-center shrink-0">
                            <User size={48} className="text-slate-400 -mb-2" />
                        </div>
                        {/* Corp Logo */}
                        <div className="w-8 h-8 rounded border-2 border-sky-200 bg-sky-50 flex items-center justify-center text-sky-500 shadow-sm shrink-0">
                            <ShieldAlert size={16} />
                        </div>
                    </div>
                    
                    <div className="w-full flex flex-col items-start mt-2">
                        <span className="font-black text-2xl text-slate-800 tracking-tighter">J. SMITH</span>
                        <span className="font-bold text-[10px] text-sky-700 tracking-widest uppercase">Accounting Dept</span>
                        <span className="font-mono text-[8px] text-slate-400 mt-1 border-b-2 border-slate-200 w-full pb-2">EMP-ID: 8492-991-A</span>
                    </div>
                    
                    {/* Precision Chip Socket */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-20 bg-slate-200 rounded-lg border border-slate-300 shadow-[inset_0_5px_10px_rgba(0,0,0,0.1)] flex items-center justify-center">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 rounded-lg pointer-events-none mix-blend-overlay"></div>
                        
                        {/* Admin Chip (Draggable) */}
                        {!chipSwapped && (
                            <motion.div drag dragConstraints={constraintsRef} dragElastic={0} className="w-12 h-14 bg-gradient-to-br from-amber-200 to-amber-500 rounded-md shadow-[0_10px_20px_rgba(245,158,11,0.5)] border border-amber-600 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing relative z-50 group hover:scale-105">
                                {/* Metallic contacts */}
                                <div className="w-8 h-10 border border-amber-600/50 rounded-sm grid grid-cols-2 grid-rows-3 gap-[1px] p-[1px]">
                                    {Array(6).fill(0).map((_,i) => <div key={i} className="bg-amber-400/50 rounded-[1px]"></div>)}
                                </div>
                                <span className="absolute text-[8px] font-black text-amber-900 bottom-1">ADMIN</span>
                            </motion.div>
                        )}
                        
                        {/* Inserted Standard Chip */}
                        {chipSwapped && (
                            <div className="w-12 h-14 bg-gradient-to-br from-slate-200 to-slate-400 rounded-md shadow-[0_2px_5px_rgba(0,0,0,0.3)] border border-slate-500 flex flex-col items-center justify-center relative z-0">
                                <div className="w-8 h-10 border border-slate-500/50 rounded-sm grid grid-cols-2 grid-rows-3 gap-[1px] p-[1px]">
                                    {Array(6).fill(0).map((_,i) => <div key={i} className="bg-slate-300/50 rounded-[1px]"></div>)}
                                </div>
                                <span className="absolute text-[8px] font-black text-slate-700 bottom-1">USER</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Anti-Static Mat for Replacement Chip */}
            <div className="w-48 h-32 bg-slate-800 rounded-xl border-4 border-slate-900 shadow-[0_20px_40px_rgba(0,0,0,0.6)] p-4 flex flex-col items-center justify-center relative z-10 shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 rounded-lg pointer-events-none"></div>
                <span className="text-[9px] font-mono text-emerald-500 tracking-widest absolute top-2 left-3">SECURE_TRAY</span>
                
                {/* Standard Chip (Draggable Replacement) */}
                <motion.div drag dragConstraints={constraintsRef} dragElastic={0} onDragEnd={(_, info) => {
                    if (info.offset.x < -30 && !chipSwapped) {
                        playZap(); playSuccess(); setChipSwapped(true); setPhase('M6_SUCCESS'); reportComplete({points: 100});
                    } else if (!chipSwapped) {
                        playError();
                    }
                }} className="w-12 h-14 bg-gradient-to-br from-slate-200 to-slate-400 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.4)] border border-slate-500 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing relative z-50 group transition-transform hover:scale-105 mt-2">
                    <div className="w-8 h-10 border border-slate-500/50 rounded-sm grid grid-cols-2 grid-rows-3 gap-[1px] p-[1px]">
                        {Array(6).fill(0).map((_,i) => <div key={i} className="bg-slate-300/50 rounded-[1px]"></div>)}
                    </div>
                    <span className="absolute text-[8px] font-black text-slate-700 bottom-1">USER</span>
                </motion.div>
                <span className="text-[8px] font-bold text-slate-500 mt-3 uppercase tracking-widest text-center">Drag to ID Badge</span>
            </div>
        </div>
    );
    return (
        <LabShell 
            labId="ransomware9"
            title="Incident Response"
            compact={true}
            theme="circuit"
            bgOverride="bg-slate-950"
            hint="Follow the memo instructions carefully. Interact with the physical objects on the desk."
            instruction="Welcome to the Corporate Command Center. Complete all 6 stages of the Incident Response Lifecycle."
            onReset={handleReset}
        >
            <div className="flex-1 w-full h-full flex flex-col min-h-0 bg-slate-200" ref={constraintsRef}>
                
                {/* TOP HALF: Wall */}
                <div className="w-full shrink-0 flex flex-col md:flex-row gap-4 p-4 items-center justify-between bg-gradient-to-b from-slate-300 to-slate-400 border-b-8 border-slate-500 shadow-sm relative z-20 min-h-[140px]">
                    {renderMemo()}
                    
                    {/* Mission specific wall panels */}
                    {phase.startsWith('M1') ? (
                        <div className="w-full md:max-w-md bg-slate-800 p-3 rounded-xl border-4 border-slate-950 flex flex-col items-center gap-3 shrink-0 shadow-2xl">
                            <div className="flex items-center gap-2 text-rose-500 uppercase font-black text-[10px] w-full justify-between bg-slate-950 py-1 rounded shadow-inner"><Activity size={14}/> INCIDENT RESPONSE PANEL</div>
                            <div className="flex w-full gap-3">
                                <button onClick={handleTaskManager} className="flex-1 relative overflow-hidden px-2 py-3 rounded border-2 font-black text-[10px] bg-slate-700 text-white border-slate-600 shadow-inner hover:bg-slate-600 active:scale-95 transition-all"><Cpu size={18} className="mx-auto mb-1" />Task Manager</button>
                                <button onClick={handleUnplug} className={`flex-1 px-2 py-3 rounded border-2 font-black text-[10px] transition-all ${phase === 'M1_INFECTING' ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse scale-105 cursor-pointer' : 'bg-amber-600 text-amber-950/50 border-amber-700 opacity-50 cursor-not-allowed'}`}><Wifi size={18} className="mx-auto mb-1" />Unplug Cable</button>
                            </div>
                        </div>
                    ) : phase.startsWith('M2') ? renderM2Firewall()
                      : phase.startsWith('M3') ? renderM3Eradicate()
                      : phase.startsWith('M4') ? (
                          <div className="w-full md:max-w-md bg-slate-900 p-6 rounded-xl border-4 border-slate-950 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col items-center gap-8 shrink-0 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-4 border-b-2 border-amber-500" style={{ background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 15px, #0f172a 15px, #0f172a 30px)' }}></div>
                              <div className="absolute bottom-0 left-0 right-0 h-4 border-t-2 border-amber-500" style={{ background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 15px, #0f172a 15px, #0f172a 30px)' }}></div>
                              
                              <div className="text-amber-500 font-black tracking-widest text-sm uppercase flex items-center gap-2 mt-4 bg-slate-950 px-6 py-2 rounded-lg shadow-[inset_0_2px_10px_rgba(0,0,0,1)] border border-slate-800"><Trash2 size={18}/> Industrial Format</div>
                              
                              <div className="relative p-6 bg-slate-950 rounded-2xl shadow-[inset_0_10px_30px_rgba(0,0,0,1)] border-2 border-slate-800 flex items-center justify-between mb-4">
                                  <button 
                                      onClick={() => {
                                          playHeavyThud();
                                          setIsWiped(true);
                                      }}
                                      disabled={isWiped}
                                      className={`relative w-48 h-16 rounded-xl font-black text-2xl transition-all flex items-center justify-between gap-2 ${
                                          isWiped ? 'bg-slate-800 text-slate-600 shadow-[0_5px_0_#020617,0_10px_10px_rgba(0,0,0,0.5)] translate-y-[10px] cursor-not-allowed' : 'bg-red-600 text-white shadow-[0_15px_0_#7f1d1d,0_25px_20px_rgba(0,0,0,0.8)] hover:bg-red-500 cursor-pointer active:shadow-[0_5px_0_#7f1d1d,0_10px_10px_rgba(0,0,0,0.5)] active:translate-y-[10px]'
                                      }`}
                                  >
                                      WIPE C:\\
                                  </button>
                              </div>
                          </div>
                      ) : <div className="hidden md:block w-64"></div>}

                    
                    <div className="hidden lg:block w-64 shrink-0"></div>
                </div>

                {/* BOTTOM HALF: Desk */}
                <div className="flex-1 w-full relative z-0 flex flex-col bg-slate-200 shadow-[inset_0_20px_20px_-20px_rgba(0,0,0,0.3)] overflow-y-auto pb-12">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                    
                    {phase.startsWith('M1') || phase.startsWith('M2') || phase.startsWith('M3') ? renderM1Desk() : null}
                    {phase.startsWith('M4') ? renderM4Recovery() : null}
                    {phase.startsWith('M5') ? renderM5Log() : null}
                    {phase.startsWith('M6') ? renderM6Badge() : null}
                    
                    {phase === 'M6_SUCCESS' && <Celebration isActive={true} />}
                </div>
            </div>
        </LabShell>
    );
}
