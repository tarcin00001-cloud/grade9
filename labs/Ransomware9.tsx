"use client";

import React, { useState, useEffect, useRef } from 'react';
import LabShell from '@/components/LabShell';
import { useLabAudio } from '@/hooks/useLabAudio';
import { useLMSBridge } from '@/hooks/useLMSBridge';
import { 
    ShieldAlert, Cpu, HardDrive, Server, FileText, Image as ImageIcon, 
    Archive, Database, Activity, Wifi, CheckCircle, Search, Trash2, 
    Key, User, ArrowRight, Lock, Unlock, AlertTriangle, Fingerprint, 
    RefreshCw, X, ShieldCheck, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Celebration from '@/components/Celebration';

type Phase = 
    | 'M1_LEARN' | 'M1_INFECTING' | 'M1_CONTAINED' | 'M1_FAILED'
    | 'M2_FIREWALL' | 'M2_SUCCESS'
    | 'M3_ERADICATE' | 'M3_SUCCESS'
    | 'M4_RECOVERY' | 'M4_SUCCESS'
    | 'M5_FORENSICS' | 'M5_SUCCESS'
    | 'M6_HARDENING' | 'M6_SUCCESS';

export default function RansomwareIncidentResponse() {
    const { reportComplete } = useLMSBridge('ransomware9');
    const { playPop, playZap, playError, playSuccess, playClick, playHeavyThud } = useLabAudio();

    const [phase, setPhase] = useState<Phase>('M1_LEARN');
    const [localFiles, setLocalFiles] = useState([
        { id: 1, name: 'invoice.pdf.exe', isEncrypted: false, isMalicious: true },
        { id: 2, name: 'passwords.txt', isEncrypted: false, isMalicious: false },
        { id: 3, name: 'family_photo.jpg', isEncrypted: false, isMalicious: false },
        { id: 4, name: 'tax_return.pdf', isEncrypted: false, isMalicious: false },
        { id: 5, name: 'code_project.zip', isEncrypted: false, isMalicious: false },
        { id: 6, name: 'db_dump.sql', isEncrypted: false, isMalicious: false },
    ]);

    const [backupFiles, setBackupFiles] = useState([
        { id: 1, name: 'passwords_bkp.txt', isEncrypted: false },
        { id: 2, name: 'family_photo_bkp.jpg', isEncrypted: false },
        { id: 3, name: 'tax_return_bkp.pdf', isEncrypted: false },
        { id: 4, name: 'code_project_bkp.zip', isEncrypted: false },
        { id: 5, name: 'db_dump_bkp.sql', isEncrypted: false },
        { id: 6, name: 'system_image.iso', isEncrypted: false },
    ]);

    const [networkConnected, setNetworkConnected] = useState(true);
    const [fwNode, setFwNode] = useState(0); 
    const [scanProgress, setScanProgress] = useState(0);
    const [quarantined, setQuarantined] = useState(false);
    const [isWiped, setIsWiped] = useState(false);
    const [isCloning, setIsCloning] = useState(false);
    const [logMatched, setLogMatched] = useState(false);
    const [chipSwapped, setChipSwapped] = useState(false);
    const [taskProgress, setTaskProgress] = useState(0);

    const attackIdRef = useRef(0);
    const networkRef = useRef(networkConnected);
    networkRef.current = networkConnected;
    const constraintsRef = useRef(null);

    const handleReset = () => {
        attackIdRef.current += 1;
        setPhase('M1_LEARN');
        setLocalFiles([
            { id: 1, name: 'invoice.pdf.exe', isEncrypted: false, isMalicious: true },
            { id: 2, name: 'passwords.txt', isEncrypted: false, isMalicious: false },
            { id: 3, name: 'family_photo.jpg', isEncrypted: false, isMalicious: false },
            { id: 4, name: 'tax_return.pdf', isEncrypted: false, isMalicious: false },
            { id: 5, name: 'code_project.zip', isEncrypted: false, isMalicious: false },
            { id: 6, name: 'db_dump.sql', isEncrypted: false, isMalicious: false },
        ]);
        setBackupFiles([
            { id: 1, name: 'passwords_bkp.txt', isEncrypted: false },
            { id: 2, name: 'family_photo_bkp.jpg', isEncrypted: false },
            { id: 3, name: 'tax_return_bkp.pdf', isEncrypted: false },
            { id: 4, name: 'code_project_bkp.zip', isEncrypted: false },
            { id: 5, name: 'db_dump_bkp.sql', isEncrypted: false },
            { id: 6, name: 'system_image.iso', isEncrypted: false },
        ]);
        setNetworkConnected(true);
        setFwNode(0);
        setScanProgress(0);
        setQuarantined(false);
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

    // MISSION HELPER DATA
    const getMissionDetails = () => {
        if (phase.startsWith('M1')) {
            if (phase === 'M1_INFECTING') {
                return {
                    title: "Phase 1/6: Physical Containment",
                    status: "MALWARE ACTIVE",
                    statusColor: "bg-rose-500 text-white animate-pulse",
                    instruction: "MALWARE DETECTED! Pull the physical cable! Software Task Manager is too slow to stop propagation!",
                    textColor: "text-rose-400"
                };
            }
            if (phase === 'M1_CONTAINED') {
                return {
                    title: "Phase 1/6: Physical Containment",
                    status: "CONTAINED",
                    statusColor: "bg-emerald-500 text-white",
                    instruction: "Physical isolation successful! Backups preserved. Advance to Phase 2 for Logical Containment.",
                    textColor: "text-emerald-400"
                };
            }
            if (phase === 'M1_FAILED') {
                return {
                    title: "Phase 1/6: Physical Containment",
                    status: "FAILED",
                    statusColor: "bg-rose-600 text-white",
                    instruction: "Mission Failed! Software response was too slow; backups were encrypted. Hit Try Again.",
                    textColor: "text-rose-400"
                };
            }
            return {
                title: "Phase 1/6: Physical Containment",
                status: "READY",
                statusColor: "bg-sky-500 text-white",
                instruction: "Open 'invoice.pdf.exe' to inspect it. If malicious, physically disconnect the backup server immediately!",
                textColor: "text-sky-300"
            };
        }
        if (phase.startsWith('M2')) {
            if (phase === 'M2_SUCCESS') {
                return {
                    title: "Phase 2/6: Logical Containment",
                    status: "FIREWALL SECURED",
                    statusColor: "bg-emerald-500 text-white",
                    instruction: "Rogue C2 route severed! Wi-Fi perimeter locked down. Advance to Phase 3 for Eradication.",
                    textColor: "text-emerald-400"
                };
            }
            return {
                title: "Phase 2/6: Logical Containment",
                status: "ROGUE WI-FI ACTIVE",
                statusColor: "bg-amber-500 text-slate-950",
                instruction: "The cable is gone, but the Wi-Fi adapter activated. A rogue C2 server is connecting. Tap the RED Firewall Node to block it!",
                textColor: "text-amber-300"
            };
        }
        if (phase.startsWith('M3')) {
            if (phase === 'M3_SUCCESS') {
                return {
                    title: "Phase 3/6: Eradication",
                    status: "THREAT QUARANTINED",
                    statusColor: "bg-emerald-500 text-white",
                    instruction: "Hidden payload quarantined in isolated memory! Advance to Phase 4 for Drive Recovery.",
                    textColor: "text-emerald-400"
                };
            }
            return {
                title: "Phase 3/6: Eradication",
                status: "MALWARE IN MEMORY",
                statusColor: "bg-amber-500 text-slate-950",
                instruction: "Malware is trapped in RAM. Drag the X-Ray Scanner over Local Drive to expose the anomaly, then drop Quarantine Cage on it!",
                textColor: "text-amber-300"
            };
        }
        if (phase.startsWith('M4')) {
            if (phase === 'M4_SUCCESS') {
                return {
                    title: "Phase 4/6: Recovery",
                    status: "SYSTEM RESTORED",
                    statusColor: "bg-emerald-500 text-white",
                    instruction: "Drive wiped and clean snapshot cloned from Server! Advance to Phase 5 for Post-Incident Forensics.",
                    textColor: "text-emerald-400"
                };
            }
            return {
                title: "Phase 4/6: Recovery",
                status: "CORRUPTED DRIVE",
                statusColor: "bg-indigo-400 text-slate-950",
                instruction: "Drive is encrypted with garbage. Tap WIPE C:\\ to zero the sectors, then drag the Clone Cable from Server to restore!",
                textColor: "text-indigo-300"
            };
        }
        if (phase.startsWith('M5')) {
            if (phase === 'M5_SUCCESS') {
                return {
                    title: "Phase 5/6: Post-Incident Forensics",
                    status: "PATIENT ZERO FOUND",
                    statusColor: "bg-emerald-500 text-white",
                    instruction: "Initial payload execution log identified! Advance to Phase 6 for Zero-Trust Hardening.",
                    textColor: "text-emerald-400"
                };
            }
            return {
                title: "Phase 5/6: Post-Incident Forensics",
                status: "LOG AUDIT REQUIRED",
                statusColor: "bg-fuchsia-400 text-slate-950",
                instruction: "Review server access logs. Tap the exact log entry revealing the initial execution of the invoice payload.",
                textColor: "text-fuchsia-300"
            };
        }
        if (phase.startsWith('M6')) {
            if (phase === 'M6_SUCCESS') {
                return {
                    title: "Phase 6/6: Zero-Trust Hardening",
                    status: "DEFENSES HARDENED",
                    statusColor: "bg-emerald-500 text-white",
                    instruction: "Incident Response Lifecycle Complete! Defenses hardened under Principle of Least Privilege.",
                    textColor: "text-emerald-400"
                };
            }
            return {
                title: "Phase 6/6: Zero-Trust Hardening",
                status: "EXCESSIVE PRIVILEGES",
                statusColor: "bg-orange-500 text-white",
                instruction: "Employee had local Admin rights. Enforce Least Privilege by physically swapping their Admin chip for a Standard chip.",
                textColor: "text-orange-300"
            };
        }
        return {
            title: "Incident Response Lifecycle",
            status: "ACTIVE",
            statusColor: "bg-slate-700 text-white",
            instruction: "Follow tactical instructions to secure corporate infrastructure.",
            textColor: "text-slate-300"
        };
    };

    const missionInfo = getMissionDetails();

    // RENDER MONITOR BASE
    const renderMonitorBase = (title: string, Icon: any, children: any, isServer: boolean = false) => (
        <div className="w-full max-w-sm lg:max-w-[390px] flex flex-col items-center shrink-0 z-20">
            <div className={`w-full rounded-t-xl p-3 border-x-4 border-t-4 flex items-center justify-between shadow-xl ${isServer ? 'bg-slate-900 border-slate-950' : 'bg-slate-100 border-slate-900'}`}>
                <span className={`font-black tracking-widest text-sm flex items-center gap-2 ${isServer ? 'text-slate-300' : 'text-slate-800'}`}>
                    <Icon size={14}/> {title}
                </span>
                {isServer && (
                    <div className="flex gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${networkConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${networkConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`}></div>
                    </div>
                )}
            </div>
            <div className={`w-full p-4 border-x-4 border-b-4 rounded-b-xl shadow-2xl relative min-h-[14rem] flex flex-col ${isServer ? 'bg-slate-800 border-slate-950' : 'bg-white border-slate-900'}`}>
                {children}
            </div>
            {!isServer ? (
                <>
                    <div className="w-14 h-6 bg-slate-900 rounded-b shadow-xl border-x-4 border-slate-950 shrink-0"></div>
                    <div className="w-28 h-3.5 bg-slate-800 rounded-b shadow-2xl border-x-4 border-b-4 border-slate-950 shrink-0 mb-1"></div>
                </>
            ) : (
                <>
                    <div className="w-14 h-6 invisible shrink-0"></div>
                    <div className="w-28 h-3.5 invisible shrink-0 mb-1"></div>
                </>
            )}
        </div>
    );

    // M1 WORKSPACE
    const renderM1Workspace = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-8 w-full max-w-4xl">
                {/* LOCAL DRIVE */}
                {renderMonitorBase("LOCAL_C:\\", HardDrive, 
                    <div className="grid grid-cols-2 gap-2 w-full h-full">
                        {localFiles.map((f: any) => (
                            <div 
                                key={f.id} 
                                onClick={() => { if (f.id === 1 && phase === 'M1_LEARN') startM1Attack(); }}
                                className={`flex flex-col items-center justify-center p-2.5 md:p-3 rounded-lg border-2 transition-all ${
                                    f.isEncrypted ? 'bg-rose-100 border-rose-500 text-rose-600 shadow-[inset_0_0_10px_rgba(225,29,72,0.3)]' : 
                                    f.id === 1 && phase === 'M1_LEARN' ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 cursor-pointer border-dashed animate-pulse' :
                                    'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                            >
                                {f.isEncrypted ? <ShieldAlert size={28} className="mb-1.5" /> : f.id === 1 ? <FileText size={28} className="mb-1.5 text-rose-500" /> : <ImageIcon size={28} className="mb-1.5" />}
                                <span className="text-xs font-bold text-center break-all leading-snug">
                                    {f.isEncrypted ? 'ENCRYPTED.locked' : f.name}
                                </span>
                            </div>
                        ))}
                    </div>
                , false)}

                {/* CENTER CABLE & RAPID ACTION DOCK */}
                <div className="flex flex-col items-center justify-center gap-3 shrink-0 z-20">
                    {/* Action Panel Docked In Center */}
                    <div className="w-56 bg-slate-900/95 p-3.5 rounded-2xl border-2 border-slate-700 shadow-xl flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px] font-black uppercase tracking-wider">
                            <Activity size={12}/> Containment Dock
                        </div>
                        <div className="flex w-full gap-2">
                            <button 
                                onClick={handleTaskManager} 
                                className="flex-1 px-2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-[11px] uppercase tracking-wider active:scale-95 transition-all flex flex-col items-center"
                            >
                                <Cpu size={18} className="mb-1 text-slate-400"/>
                                Software
                            </button>
                            <button 
                                onClick={handleUnplug} 
                                className={`flex-1 px-2 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-wider transition-all flex flex-col items-center ${
                                    phase === 'M1_INFECTING' 
                                        ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse scale-105 cursor-pointer' 
                                        : 'bg-slate-800 text-slate-600 border-slate-700 opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <Wifi size={18} className="mb-1 text-amber-400"/>
                                Pull Cable
                            </button>
                        </div>
                        {taskProgress > 0 && (
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-rose-500 h-full transition-all duration-100" style={{ width: `${taskProgress}%` }}></div>
                            </div>
                        )}
                    </div>

                    {/* PHYSICAL ETHERNET WIRE */}
                    <div className="w-8 md:w-40 h-20 md:h-10 flex flex-col md:flex-row items-center justify-center shrink-0 relative">
                        {networkConnected ? (
                            <div className="w-3.5 h-full md:w-full md:h-4.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-full border border-amber-800 shadow-[0_0_15px_rgba(245,158,11,0.6)]"></div>
                        ) : (
                            <div className="w-full h-full flex flex-col md:flex-row items-center justify-between">
                                <div className="w-3.5 h-8 md:w-12 md:h-4.5 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full border border-slate-800"></div>
                                <span className="text-[8px] font-mono font-bold text-rose-500 uppercase px-1">DISCONNECTED</span>
                                <div className="w-3.5 h-8 md:w-12 md:h-4.5 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full border border-slate-800"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* SERVER BACKUP */}
                {renderMonitorBase("SERVER_Z:", Server,
                    <div className="grid grid-cols-2 gap-2 w-full h-full">
                        {backupFiles.map((f: any) => (
                            <div key={f.id} className={`flex flex-col items-center justify-center p-2 rounded border-2 transition-colors ${f.isEncrypted ? 'bg-rose-950/50 border-rose-900 text-rose-500 shadow-[inset_0_0_10px_rgba(225,29,72,0.2)]' : 'bg-slate-900/80 border-slate-700 text-slate-400'}`}>
                                {f.isEncrypted ? <ShieldAlert size={28} className="mb-1.5" /> : <Archive size={28} className="mb-1.5 text-slate-500" />}
                                <span className="text-xs font-mono font-bold text-center break-all leading-snug">{f.isEncrypted ? 'ENCRYPTED' : f.name}</span>
                            </div>
                        ))}
                    </div>
                , true)}
            </div>
        </div>
    );

    // M2 FIREWALL WORKSPACE
    const renderM2Workspace = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-slate-900/95 p-7 rounded-2xl border-2 border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(15,23,42,1)] flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                
                {/* Laser scan line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0 opacity-60"></div>
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-black uppercase tracking-widest">
                        <Wifi size={16} className="text-cyan-400"/> Firewall Routing Matrix — Wi-Fi Subsystem
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                        802.11ax Filter
                    </span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 relative z-10 justify-between w-full">
                    {[0, 1, 2].map((i) => {
                        const isThreat = i === 1;
                        const isBlocked = isThreat && fwNode === 1;
                        
                        return (
                            <div key={i} className="flex-1 min-w-0 flex items-center justify-between relative group px-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 shadow-inner">
                                {/* Source Interface */}
                                <div className="flex flex-col items-center gap-1 shrink-0 z-10">
                                    <Wifi size={24} className={isThreat ? 'text-rose-500' : 'text-emerald-500'} />
                                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">WLAN_{i}</span>
                                </div>
                                
                                {/* Left Data Stream Line */}
                                <div className="flex-1 h-1.5 mx-2 relative flex items-center">
                                    <div className={`w-full h-1 rounded-full transition-colors duration-500 ${isThreat ? 'bg-rose-500/30' : 'bg-emerald-500/30'}`}></div>
                                    <div className={`absolute inset-0 rounded-full blur-[2px] transition-colors duration-500 ${isThreat ? 'bg-rose-500/50' : 'bg-emerald-500/40'}`}></div>
                                </div>
                                
                                {/* Firewall Inspection Node */}
                                <button
                                    onClick={() => {
                                        if (isThreat) {
                                            playZap();
                                            playSuccess();
                                            setFwNode(1);
                                            setPhase('M2_SUCCESS');
                                        } else {
                                            playClick();
                                        }
                                    }}
                                    className={`relative z-20 w-14 h-14 rotate-45 rounded-xl border-2 flex items-center justify-center transition-all duration-500 group-hover:scale-105 shrink-0 ${
                                        isBlocked 
                                            ? 'bg-slate-800 border-slate-600 shadow-[0_0_20px_rgba(71,85,105,0.8)] cursor-default'
                                            : isThreat
                                                ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.8)] animate-pulse cursor-pointer'
                                                : 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-default'
                                    }`}
                                >
                                    <div className="-rotate-45 flex flex-col items-center">
                                        {isBlocked ? (
                                            <X size={18} className="text-slate-300 stroke-[3]" />
                                        ) : isThreat ? (
                                            <AlertTriangle size={18} className="text-rose-400 fill-rose-500/20 animate-bounce" />
                                        ) : (
                                            <CheckCircle size={16} className="text-emerald-400" />
                                        )}
                                    </div>
                                </button>
                                
                                {/* Right Data Stream Line */}
                                <div className="flex-1 h-1.5 mx-2 relative flex items-center">
                                    <div className={`w-full h-1 rounded-full transition-colors duration-500 ${
                                        isBlocked 
                                            ? 'bg-slate-800 border-t border-dashed border-slate-700' 
                                            : isThreat 
                                                ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse' 
                                                : 'bg-emerald-500/40'
                                    }`}></div>
                                </div>
                                
                                {/* Destination Server */}
                                <div className="flex flex-col items-center gap-1 shrink-0 z-10">
                                    <Server size={24} className={isBlocked ? 'text-slate-600' : isThreat ? 'text-rose-500' : 'text-emerald-500'} />
                                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{isThreat ? 'C2_SVR' : `NODE_${i}`}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // M3 ERADICATION WORKSPACE (BROUGHT DOWN TO MAIN STAGE!)
    const renderM3Workspace = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-900/95 p-8 rounded-2xl border-2 border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-center gap-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15 pointer-events-none"></div>

                {/* Local Drive Under Scan */}
                <div className="w-full max-w-md bg-slate-950 p-4 rounded-xl border-2 border-slate-800 shadow-inner flex flex-col items-center z-10">
                    <div className="flex items-center justify-between w-full mb-3 text-xs font-mono font-bold text-slate-300 border-b border-slate-800 pb-2">
                        <span className="flex items-center gap-1.5"><HardDrive size={14} className="text-cyan-400"/> LOCAL_C:\\ MEMORY SCAN</span>
                        <span className="text-rose-400 font-bold">{quarantined ? '0 THREATS' : '1 ANOMALY DETECTED'}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 w-full p-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                        {Array(16).fill(0).map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-16 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                    i === 5 && !quarantined 
                                        ? scanProgress > 50 
                                            ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse' 
                                            : 'bg-slate-800 border-slate-700 text-slate-500' 
                                        : i === 5 && quarantined
                                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-600'
                                }`}
                            >
                                {i === 5 && !quarantined && scanProgress > 50 ? (
                                    <>
                                        <AlertTriangle size={16} className="text-rose-400 mb-0.5 animate-bounce"/>
                                        <span className="text-[7px] font-mono font-black">PAYLOAD</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={14} className="opacity-40 mb-0.5"/>
                                        <span className="text-[7px] font-mono opacity-50">0x{i.toString(16).padStart(2,'0')}</span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tactile Tools (Scanner & Quarantine Cage) */}
                <div className="flex flex-col items-center gap-4 z-10 shrink-0">
                    {/* Draggable X-Ray Scanner */}
                    <motion.div 
                        drag 
                        dragConstraints={constraintsRef} 
                        dragElastic={0} 
                        onDrag={(_, info) => {
                            if (info.offset.x < -40) {
                                setScanProgress(100);
                                playPop();
                            }
                        }}
                        className="w-48 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border-2 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
                    >
                        <Search size={18} className="text-cyan-400 animate-pulse" />
                        <span className="font-mono text-xs font-black tracking-wider text-cyan-300 uppercase">Drag X-Ray</span>
                    </motion.div>

                    {/* Draggable Quarantine Cage */}
                    <motion.div 
                        drag 
                        dragConstraints={constraintsRef} 
                        dragElastic={0} 
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -40 && scanProgress > 50 && !quarantined) {
                                playHeavyThud();
                                playSuccess();
                                setQuarantined(true);
                                setPhase('M3_SUCCESS');
                            } else if (!quarantined) {
                                playError();
                            }
                        }}
                        className={`w-48 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                            scanProgress > 50 && !quarantined 
                                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-grab active:cursor-grabbing animate-bounce' 
                                : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed'
                        }`}
                    >
                        <ShieldAlert size={18} />
                        <span className="font-mono text-xs font-black tracking-wider uppercase">Quarantine Cage</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );

    // M4 RECOVERY WORKSPACE
    const renderM4Workspace = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-8 w-full max-w-4xl">
                {/* WIPE DISK WORKSTATION */}
                {renderMonitorBase("LOCAL_C:\\", HardDrive,
                    <div className="flex flex-col items-center justify-center h-full gap-3 p-2">
                        <div className="w-full text-center text-xs font-mono font-bold text-rose-500">
                            {isWiped ? "SECTORS ZEROED (EMPTY)" : "ENCRYPTED DRIVE"}
                        </div>
                        <button 
                            onClick={() => {
                                playHeavyThud();
                                setIsWiped(true);
                            }}
                            disabled={isWiped}
                            className={`w-full py-3.5 px-4 rounded-xl font-black text-base py-4 uppercase tracking-wider transition-all shadow-lg ${
                                isWiped 
                                    ? 'bg-slate-700 text-slate-500 border border-slate-600 cursor-not-allowed' 
                                    : 'bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-700 shadow-rose-600/40 cursor-pointer active:scale-95 animate-pulse'
                            }`}
                        >
                            {isWiped ? "Drive Wiped (Ready)" : "Wipe C:\\ (Format)"}
                        </button>
                    </div>
                , false)}

                {/* CLONE DATA CABLE (DRAGGABLE RESTORE) */}
                <div className="flex flex-col items-center justify-center shrink-0 z-30">
                    <motion.div 
                        drag={isWiped}
                        dragConstraints={constraintsRef} 
                        dragElastic={0} 
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -40 && isWiped) {
                                playSuccess();
                                setIsCloning(true);
                                setTimeout(() => setPhase('M4_SUCCESS'), 1200);
                            }
                        }}
                        className={`w-44 py-4 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                            isWiped && !isCloning
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)] cursor-grab active:cursor-grabbing animate-pulse'
                                : isCloning
                                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/50'
                                    : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed'
                        }`}
                    >
                        <Database size={16} />
                        <span className="font-mono text-[11px] font-black uppercase tracking-wider">
                            {isCloning ? "Restoring..." : "Clone Cable"}
                        </span>
                    </motion.div>
                </div>

                {/* BACKUP REPOSITORY */}
                {renderMonitorBase("SERVER_Z:", Server,
                    <div className="grid grid-cols-2 gap-2 w-full h-full">
                        {backupFiles.map((f: any) => (
                            <div key={f.id} className="flex flex-col items-center justify-center p-2 rounded border-2 bg-slate-900/80 border-slate-700 text-slate-400">
                                <Archive size={28} className="mb-1.5 text-emerald-400" />
                                <span className="text-xs font-mono font-bold text-center break-all leading-snug">{f.name}</span>
                            </div>
                        ))}
                    </div>
                , true)}
            </div>
        </div>
    );

    // M5 FORENSICS WORKSPACE
    const renderM5Workspace = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-slate-900/95 p-7 rounded-2xl border-2 border-slate-700 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-fuchsia-400 font-mono text-sm font-black uppercase tracking-widest">
                        <Search size={16}/> SIEM Forensics Console — Patient Zero Investigation
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">auth.log</span>
                </div>

                <div className="flex flex-col gap-2.5 font-mono text-sm">
                    {[
                        { time: '10:14:02', user: 'system', event: 'Cron daily task backup initiated', threat: false },
                        { time: '10:15:22', user: 'j.smith', event: 'Opened email attachment: invoice.pdf.exe', threat: true },
                        { time: '10:15:25', user: 'invoice.pdf', event: 'Subprocess spawned: powershell -enc JAB...', threat: false },
                        { time: '10:15:30', user: 'network', event: 'Outbound TCP connection to 198.51.100.23:4444', threat: false },
                    ].map((log, i) => (
                        <div 
                            key={i}
                            onClick={() => {
                                if (log.threat) {
                                    playSuccess();
                                    setLogMatched(true);
                                    setPhase('M5_SUCCESS');
                                } else {
                                    playClick();
                                }
                            }}
                            className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                                logMatched && log.threat 
                                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
                                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-950'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500">{log.time}</span>
                                <span className="text-cyan-400 font-bold">{log.user}</span>
                                <span>{log.event}</span>
                            </div>
                            {logMatched && log.threat && (
                                <span className="text-[10px] font-bold uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                                    VECTOR IDENTIFIED
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // M6 HARDENING WORKSPACE
    const renderM6Workspace = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-2xl">
                {/* Employee ID Badge */}
                <div className="w-64 bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center border-2 border-slate-300 relative">
                    <div className="w-10 h-2 bg-slate-300 rounded-full mb-3"></div>
                    <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center mb-3 text-slate-400">
                        <User size={32} />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">J. SMITH</span>
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mb-3">ACCOUNTING DEPT</span>
                    
                    {/* Security Clearance Chip Slot */}
                    <div className={`w-full py-2 px-3 rounded-xl border-2 flex items-center justify-between transition-colors ${
                        chipSwapped ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-rose-50 border-rose-400 text-rose-800'
                    }`}>
                        <span className="text-[10px] font-mono font-bold uppercase">Clearance:</span>
                        <span className="text-[10px] font-black uppercase">{chipSwapped ? "Standard User" : "Domain Admin (Risk!)"}</span>
                    </div>
                </div>

                {/* Anti-Static Chip Tray */}
                <div className="w-64 bg-slate-900 p-6 rounded-2xl border-2 border-slate-700 shadow-2xl flex flex-col items-center gap-3">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">ANTI-STATIC TRAY</span>

                    {/* Standard User Chip */}
                    <motion.div 
                        drag={!chipSwapped}
                        dragConstraints={constraintsRef} 
                        dragElastic={0} 
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -30 && !chipSwapped) {
                                playSuccess();
                                setChipSwapped(true);
                                setPhase('M6_SUCCESS');
                                reportComplete();
                            }
                        }}
                        className={`w-32 py-4 rounded-xl border-2 flex flex-col items-center justify-center shadow-lg transition-all ${
                            chipSwapped 
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 cursor-default' 
                                : 'bg-slate-800 hover:bg-slate-700 border-cyan-400 text-cyan-300 cursor-grab active:cursor-grabbing animate-bounce'
                        }`}
                    >
                        <Cpu size={20} className="mb-1 text-cyan-400" />
                        <span className="font-mono text-[9px] font-black uppercase">Standard Chip</span>
                    </motion.div>
                    <span className="text-[8px] font-mono text-slate-400 text-center">Drag Standard Chip to ID Badge</span>
                </div>
            </div>
        </div>
    );

    return (
        <LabShell 
            labId="ransomware9"
            title="Incident Response Lifecycle"
            compact={true}
            theme="ocean"
            bgOverride="bg-slate-950"
            hint="Follow the tactical instructions carefully. Complete all 6 phases of incident response."
            instruction="Welcome to the Incident Command Center. Secure corporate assets against active ransomware."
            onReset={handleReset}
        >
            <div className="flex-1 w-full h-full flex flex-col min-h-0 bg-slate-950 relative overflow-hidden" ref={constraintsRef}>
                
                {/* ─── TOP MISSION HUD (SLEEK, UNIFIED ~60PX BAR) ─── */}
                <div className="w-full shrink-0 bg-slate-900/95 border-b-2 border-slate-800 px-4 md:px-6 py-3 px-6 flex items-center justify-between shadow-lg z-30">
                    {/* Left: Phase Title & Status Tag */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex flex-col">
                            <span className="text-slate-400 font-mono text-xs uppercase tracking-wider font-black">
                                {missionInfo.title}
                            </span>
                        </div>
                        <span className={`text-[11px] font-mono font-black uppercase px-3 py-1 rounded shadow-sm ${missionInfo.statusColor}`}>
                            {missionInfo.status}
                        </span>
                    </div>

                    {/* Center: Tactical Instruction Headline */}
                    <div className="hidden md:flex flex-1 items-center justify-center px-4">
                        <p className={`font-mono text-sm font-bold text-center ${missionInfo.textColor} drop-shadow-sm line-clamp-1`}>
                            {missionInfo.instruction}
                        </p>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        {phase === 'M1_FAILED' && (
                            <button 
                                onClick={handleReset}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-mono font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                <RefreshCw size={12}/> Try Again
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
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-mono font-black text-sm uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                Next Phase <ArrowRight size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ─── MAIN FULL-STAGE INTERACTIVE WORKSPACE ─── */}
                <div className="flex-1 w-full relative z-10 flex flex-col items-center justify-center overflow-hidden [background-image:radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]">
                    {phase.startsWith('M1') && renderM1Workspace()}
                    {phase.startsWith('M2') && renderM2Workspace()}
                    {phase.startsWith('M3') && renderM3Workspace()}
                    {phase.startsWith('M4') && renderM4Workspace()}
                    {phase.startsWith('M5') && renderM5Workspace()}
                    {phase.startsWith('M6') && renderM6Workspace()}

                    {phase === 'M6_SUCCESS' && (
                        <Celebration 
                            isActive={true} 
                            message="Incident Response Mastered! You successfully contained, eradicated, restored, audited, and hardened corporate infrastructure against ransomware!"
                            onReplay={handleReset}
                        />
                    )}
                </div>

            </div>
        </LabShell>
    );
}
