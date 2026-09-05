"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLMSBridge } from '@/hooks/useLMSBridge';
import { useLabAudio } from '@/hooks/useLabAudio';
import LabShell from '@/components/LabShell';
import Celebration from '@/components/Celebration';
import { 
    Key, Lock, Server, Laptop, Ghost, ArrowRight, 
    ShieldAlert, ShieldCheck, Zap, AlertTriangle, 
    Info, RefreshCcw, LockKeyhole, UserPlus, Trash2,
    Users
} from 'lucide-react';

export default function SSHKeys9() {
    const { reportComplete } = useLMSBridge("sshkeys9");
    const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();

    const [level, setLevel] = useState(1);
    
    // Entity States
    const [playerState, setPlayerState] = useState({
        keysGenerated: false,
        pubKeyInstalled: false,
        isConnected: false,
        isRevoked: false
    });
    
    const [aliceState, setAliceState] = useState({
        keysGenerated: false,
        pubKeyInstalled: false,
        isConnected: false
    });

    const [hackerState, setHackerState] = useState({
        isActive: false,
        isBreached: false,
        isBlocked: false
    });

    // Transit System
    type PacketType = 'PASSWORD' | 'PLAYER_PUBKEY' | 'ALICE_PUBKEY' | 'PLAYER_HANDSHAKE' | 'ALICE_HANDSHAKE' | 'HACKER_HANDSHAKE' | null;
    const [transitPacket, setTransitPacket] = useState<PacketType>(null);
    const [transitStatus, setTransitStatus] = useState<'MOVING' | 'INTERCEPTED' | 'BLOCKED' | 'SUCCESS'>('MOVING');

    // Modals
    const [showIntro, setShowIntro] = useState(true);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [failureReason, setFailureReason] = useState("");
    
    const [showMissionComplete, setShowMissionComplete] = useState(false);
    const [showL2Intro, setShowL2Intro] = useState(false);
    const [showL3Intro, setShowL3Intro] = useState(false);
    const [isVictorious, setIsVictorious] = useState(false);

    // LEVEL 3 TIMER
    const [timeLeft, setTimeLeft] = useState(5);
    useEffect(() => {
        if (level === 3 && hackerState.isActive && !hackerState.isBlocked && !hackerState.isBreached) {
            if (timeLeft > 0) {
                const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
                return () => clearTimeout(timerId);
            } else {
                // Time ran out!
                if (!playerState.isRevoked) {
                    if (playError) playError();
                    setHackerState(prev => ({...prev, isBreached: true}));
                    setFailureReason("The hacker got in! You didn't change the locks fast enough. When a private key is compromised, you must revoke the public key immediately.");
                    setShowFailureModal(true);
                }
            }
        }
    }, [level, hackerState, playerState.isRevoked, timeLeft]);

    // ACTIONS
    const handleSendPassword = () => {
        if (playPop) playPop();
        setTransitPacket('PASSWORD');
        setTransitStatus('MOVING');
        setTimeout(() => {
            setTransitStatus('INTERCEPTED');
            setTimeout(() => {
                if (playError) playError();
                setFailureReason("The packet sniffer grabbed your password in plaintext! Because the internet is a public network, sending passwords is fundamentally insecure.\n\nSolution: We need a system where the secret password never actually travels across the network.");
                setShowFailureModal(true);
            }, 800);
        }, 1500);
    };

    const handleGenerateKeys = () => {
        if (playPop) playPop();
        setTransitPacket(null);
        setShowFailureModal(false);
        setPlayerState(prev => ({...prev, keysGenerated: true}));
    };

    const handleSendPublicKey = () => {
        if (playPop) playPop();
        setTransitPacket('PLAYER_PUBKEY');
        setTransitStatus('MOVING');
        setTimeout(() => {
            setTransitPacket(null);
            setPlayerState(prev => ({...prev, pubKeyInstalled: true}));
        }, 2000);
    };

    const handleConnectSSH = () => {
        if (playPop) playPop();
        setTransitPacket('PLAYER_HANDSHAKE');
        setTransitStatus('MOVING');
        setTimeout(() => {
            setTransitPacket(null);
            setPlayerState(prev => ({...prev, isConnected: true}));
            setTimeout(() => {
                if (playSuccess) playSuccess();
                setShowMissionComplete(true);
            }, 1000);
        }, 2500);
    };

    // LEVEL 2 ACTIONS
    const handleGenerateAliceKeys = () => {
        if (playPop) playPop();
        setAliceState(prev => ({...prev, keysGenerated: true}));
    };

    const handleSendAlicePublicKey = () => {
        if (playPop) playPop();
        setTransitPacket('ALICE_PUBKEY');
        setTransitStatus('MOVING');
        setTimeout(() => {
            setTransitPacket(null);
            setAliceState(prev => ({...prev, pubKeyInstalled: true}));
        }, 2000);
    };

    const handleAliceConnectSSH = () => {
        if (playPop) playPop();
        setTransitPacket('ALICE_HANDSHAKE');
        setTransitStatus('MOVING');
        setTimeout(() => {
            setTransitPacket(null);
            setAliceState(prev => ({...prev, isConnected: true}));
            setTimeout(() => {
                if (playSuccess) playSuccess();
                setShowMissionComplete(true);
            }, 1000);
        }, 2500);
    };

    // LEVEL 3 ACTIONS
    const handleRevoke = () => {
        if (playZap) playZap();
        setPlayerState(prev => ({...prev, isRevoked: true}));
        setHackerState(prev => ({...prev, isBlocked: true}));
        
        // Let the hacker attempt handshake and bounce
        setTransitPacket('HACKER_HANDSHAKE');
        setTransitStatus('MOVING');
        setTimeout(() => {
            setTransitStatus('BLOCKED');
            setTimeout(() => {
                setTransitPacket(null);
                setTimeout(() => {
                    if (playSuccess) playSuccess();
                    setIsVictorious(true);
                    reportComplete({ labId: "sshkeys9", points: 100 });
                }, 1000);
            }, 1500);
        }, 1500);
    };

    const resetGame = () => {
        if (playClick) playClick();
        setLevel(1);
        setPlayerState({ keysGenerated: false, pubKeyInstalled: false, isConnected: false, isRevoked: false });
        setAliceState({ keysGenerated: false, pubKeyInstalled: false, isConnected: false });
        setHackerState({ isActive: false, isBreached: false, isBlocked: false });
        setTransitPacket(null);
        setShowFailureModal(false);
        setIsVictorious(false);
        setShowIntro(true);
        setShowMissionComplete(false);
        setShowL2Intro(false);
        setShowL3Intro(false);
        setTimeLeft(5);
    };

    // Derived UI states
    const isNetworkSecure = (level === 1 && playerState.isConnected) || (level === 2 && aliceState.isConnected) || (level === 3 && hackerState.isBlocked);
    const isNetworkCompromised = (transitPacket === 'PASSWORD' && transitStatus === 'INTERCEPTED') || hackerState.isBreached;

    return (
        <LabShell labId="sshkeys9"
            title="SSH Key Cryptography"
            instruction={`Mission ${level}: ${level === 1 ? 'Establish secure connection.' : level === 2 ? 'Add a teammate securely.' : 'DEFEND THE SERVER!'}`}
            compact={true}
            bgOverride="bg-slate-200"
            onReset={resetGame}
        >
            <div className="flex flex-col h-full bg-slate-50 p-2 gap-2 overflow-hidden relative rounded-xl border border-slate-300 shadow-inner">
                
                {/* STATUS HEADER */}
                <div className={`bg-white border rounded-xl p-3 shrink-0 shadow-sm flex items-center justify-between transition-colors ${
                    level === 3 && !hackerState.isBlocked && !hackerState.isBreached ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                }`}>
                    <div className="flex flex-col">
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${level === 3 && !hackerState.isBlocked ? 'text-rose-500' : 'text-slate-400'}`}>Network Status</span>
                        <span className={`text-xl font-black tracking-tighter leading-none mt-1 ${
                            isNetworkSecure ? 'text-emerald-600' : 
                            isNetworkCompromised || (level === 3 && !hackerState.isBlocked) ? 'text-rose-600' : 
                            'text-slate-700'
                        }`}>
                            {isNetworkSecure ? 'SECURE (ENCRYPTED)' : 
                             isNetworkCompromised ? 'COMPROMISED' : 
                             level === 3 && !hackerState.isBlocked ? 'ATTACK IN PROGRESS' :
                             'VULNERABLE (PLAINTEXT)'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {isNetworkSecure && level !== 3 && (
                            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                                <ShieldCheck size={16} /> Authenticated
                            </div>
                        )}
                        {level === 3 && !hackerState.isBlocked && !hackerState.isBreached && (
                            <div className="bg-rose-600 text-white px-4 py-1 rounded-lg flex items-center gap-2 font-black text-lg tracking-wider tabular-nums">
                                00:0{timeLeft}
                            </div>
                        )}
                    </div>
                </div>

                {/* ARENA: 3 ZONES */}
                <div className="flex-1 flex gap-2 overflow-hidden relative">
                    
                    {/* LEFT: TEAM LAPTOPS */}
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2 relative shadow-sm z-10">
                        <div className="flex items-center gap-2 mb-2 shrink-0">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-700 leading-tight">Team Laptops</h3>
                            </div>
                        </div>

                        {/* Player Laptop */}
                        <div className={`flex-1 bg-slate-50 border rounded-lg p-2 flex flex-col items-center justify-center relative group transition-colors ${
                            level === 3 ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                        }`}>
                            <div className="absolute top-2 left-2 flex items-center gap-1">
                                {level === 3 ? <ShieldAlert size={12} className="text-rose-500" /> : <Laptop size={12} className="text-slate-400" />}
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${level === 3 ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {level === 3 ? 'STOLEN LAPTOP' : 'Your Laptop'}
                                </span>
                            </div>
                            
                            {level === 3 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <Ghost size={64} className="text-rose-600" />
                                </div>
                            )}

                            <AnimatePresence>
                                {(playerState.keysGenerated || transitPacket === 'PLAYER_PUBKEY') && (
                                    <motion.div 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex gap-4 items-center justify-center w-full relative z-10"
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-10 h-10 bg-indigo-100 border-2 border-indigo-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                                                <Key size={20} className="text-indigo-600" />
                                            </div>
                                            <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest">Private Key</span>
                                        </div>

                                        {!playerState.pubKeyInstalled && transitPacket !== 'PLAYER_PUBKEY' && (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 bg-indigo-100 border-2 border-indigo-400 rounded-full flex items-center justify-center">
                                                    <LockKeyhole size={20} className="text-indigo-600" />
                                                </div>
                                                <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest">Public Key</span>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Alice's Laptop (Appears in L2/L3) */}
                        <AnimatePresence>
                            {level >= 2 && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center relative group"
                                >
                                    <div className="absolute top-2 left-2 flex items-center gap-1">
                                        <Laptop size={12} className="text-emerald-500" />
                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Alice's Laptop</span>
                                    </div>

                                    {(aliceState.keysGenerated || transitPacket === 'ALICE_PUBKEY') && (
                                        <motion.div 
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex gap-4 items-center justify-center w-full relative z-10"
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 bg-emerald-100 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                                                    <Key size={20} className="text-emerald-600" />
                                                </div>
                                                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Private Key</span>
                                            </div>

                                            {!aliceState.pubKeyInstalled && transitPacket !== 'ALICE_PUBKEY' && (
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="w-10 h-10 bg-emerald-100 border-2 border-emerald-400 rounded-full flex items-center justify-center">
                                                        <LockKeyhole size={20} className="text-emerald-600" />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Public Key</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* CENTER: THE INTERNET */}
                    <div className={`flex-1 rounded-xl p-3 flex flex-col relative shadow-inner border transition-colors ${
                        level === 3 ? 'bg-slate-900 border-rose-900/50' : 'bg-slate-800 border-slate-700'
                    }`}>
                        {/* Flowing dashed lines background */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden flex flex-col justify-evenly">
                            <div className="w-full h-px border-t-2 border-dashed border-slate-400" />
                            <div className="w-full h-px border-t-2 border-dashed border-slate-400" />
                            <div className="w-full h-px border-t-2 border-dashed border-slate-400" />
                        </div>
                        
                        <div className="flex items-center justify-center gap-1 mb-2 relative z-10">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">The Public Internet</span>
                        </div>

                        {/* The Hacker */}
                        <div className="flex-1 flex items-center justify-center relative z-10">
                            <div className="flex flex-col items-center gap-2">
                                <motion.div 
                                    animate={
                                        transitStatus === 'INTERCEPTED' || hackerState.isBreached ? { scale: [1, 1.2, 1], color: '#ef4444' } : 
                                        transitPacket === 'PASSWORD' || level === 3 ? { opacity: 1 } :
                                        { opacity: 0.3, color: '#94a3b8' }
                                    }
                                    className="w-16 h-16 bg-slate-950 border-2 border-slate-700 rounded-full flex items-center justify-center shadow-lg relative"
                                >
                                    <Ghost size={32} />
                                    {(transitStatus === 'INTERCEPTED' || hackerState.isBreached) && (
                                        <div className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 animate-bounce">
                                            <ShieldAlert size={14} />
                                        </div>
                                    )}
                                </motion.div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${level === 3 ? 'text-rose-500' : 'text-slate-500'}`}>
                                    {level === 3 ? 'Hacker' : 'Packet Sniffer'}
                                </span>
                            </div>
                        </div>

                        {/* ANIMATED PACKETS */}
                        
                        {/* 1. Password Packet */}
                        <AnimatePresence>
                            {transitPacket === 'PASSWORD' && (
                                <motion.div 
                                    initial={{ left: '-60%', top: '50%', y: '-50%', x: '-50%' }}
                                    animate={
                                        transitStatus === 'MOVING' ? { left: '50%', x: '-50%' } : 
                                        transitStatus === 'INTERCEPTED' ? { left: '50%', x: '-50%', scale: 1.5, rotate: 10 } : {}
                                    }
                                    transition={{ duration: 1.5, ease: 'linear' }}
                                    className={`absolute z-20 px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-xl border-2 ${
                                        transitStatus === 'INTERCEPTED' ? 'bg-rose-100 border-rose-500 text-rose-700' : 'bg-white border-slate-300 text-slate-800'
                                    }`}
                                >
                                    P@ssw0rd123
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 2. Public Key Packets */}
                        <AnimatePresence>
                            {(transitPacket === 'PLAYER_PUBKEY' || transitPacket === 'ALICE_PUBKEY') && (
                                <motion.div 
                                    initial={{ left: '-60%', top: transitPacket === 'PLAYER_PUBKEY' ? '30%' : '70%', y: '-50%', x: '-50%' }}
                                    animate={{ left: '160%', x: '-50%' }}
                                    transition={{ duration: 2, ease: 'linear' }}
                                    className={`absolute z-20 w-12 h-12 border-2 rounded-full flex items-center justify-center shadow-lg ${
                                        transitPacket === 'PLAYER_PUBKEY' ? 'bg-indigo-100 border-indigo-400' : 'bg-emerald-100 border-emerald-400'
                                    }`}
                                >
                                    <LockKeyhole size={24} className={transitPacket === 'PLAYER_PUBKEY' ? 'text-indigo-600' : 'text-emerald-600'} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. SSH Handshake Packets */}
                        <AnimatePresence>
                            {(transitPacket === 'PLAYER_HANDSHAKE' || transitPacket === 'ALICE_HANDSHAKE' || transitPacket === 'HACKER_HANDSHAKE') && (
                                <>
                                    {/* Server sends Locked Challenge */}
                                    <motion.div 
                                        initial={{ left: '160%', top: transitPacket === 'PLAYER_HANDSHAKE' || transitPacket === 'HACKER_HANDSHAKE' ? '30%' : '70%', y: '-50%', x: '-50%' }}
                                        animate={{ left: '-60%', x: '-50%' }}
                                        transition={{ duration: 1, ease: 'linear' }}
                                        className={`absolute z-20 px-2 py-1 border rounded text-[9px] font-bold flex items-center gap-1 uppercase ${
                                            transitPacket === 'ALICE_HANDSHAKE' ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        }`}
                                    >
                                        <LockKeyhole size={12} /> Challenge
                                    </motion.div>
                                    
                                    {/* Client sends Proof (delayed) */}
                                    <motion.div 
                                        initial={{ left: '-60%', top: transitPacket === 'PLAYER_HANDSHAKE' || transitPacket === 'HACKER_HANDSHAKE' ? '40%' : '80%', y: '-50%', x: '-50%' }}
                                        animate={
                                            transitStatus === 'BLOCKED' ? { left: '160%', x: '-50%', top: '150%' } : // Bounces away if blocked
                                            { left: '160%', x: '-50%' }
                                        }
                                        transition={{ duration: 1, ease: 'linear', delay: 1.2 }}
                                        className={`absolute z-20 px-2 py-1 border rounded text-[9px] font-bold flex items-center gap-1 uppercase ${
                                            transitPacket === 'HACKER_HANDSHAKE' ? 'bg-rose-100 border-rose-300 text-rose-700' :
                                            transitPacket === 'ALICE_HANDSHAKE' ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                        }`}
                                    >
                                        {transitStatus === 'BLOCKED' ? <ShieldAlert size={12} /> : <Key size={12} />} 
                                        {transitStatus === 'BLOCKED' ? 'REJECTED' : 'Valid Proof'}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: REMOTE SERVER */}
                    <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col relative shadow-lg z-10 text-white overflow-hidden">
                        {/* Secure Green Glow if connected */}
                        {isNetworkSecure && (
                            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                        )}

                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <div className={`p-2 rounded-lg ${isNetworkSecure ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                <Server size={20} />
                            </div>
                            <div>
                                <h3 className={`font-black leading-tight ${isNetworkSecure ? 'text-emerald-400' : 'text-slate-200'}`}>Remote Server</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Production Env</p>
                            </div>
                        </div>

                        {/* Authorized Keys File */}
                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-col items-start gap-2 relative z-10">
                            <div className="flex items-center gap-1 shrink-0 mb-2">
                                <span className="text-[9px] font-mono text-slate-500">~/.ssh/authorized_keys</span>
                            </div>

                            <div className="flex gap-2 w-full justify-center">
                                <AnimatePresence>
                                    {playerState.pubKeyInstalled && !playerState.isRevoked && (
                                        <motion.div 
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <div className="w-10 h-10 bg-indigo-900/50 border-2 border-indigo-500/50 rounded-full flex items-center justify-center shadow-lg">
                                                <LockKeyhole size={20} className="text-indigo-400" />
                                            </div>
                                            <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">You</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {aliceState.pubKeyInstalled && (
                                        <motion.div 
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <div className="w-10 h-10 bg-emerald-900/50 border-2 border-emerald-500/50 rounded-full flex items-center justify-center shadow-lg">
                                                <LockKeyhole size={20} className="text-emerald-400" />
                                            </div>
                                            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Alice</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {/* Empty state text */}
                            {!playerState.pubKeyInstalled && !aliceState.pubKeyInstalled && (
                                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700 uppercase tracking-widest text-center px-4 pointer-events-none">
                                    No Public Keys Installed
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* COMMAND DOCK */}
                <div className={`bg-white border rounded-xl p-3 shrink-0 flex gap-2 items-center justify-between shadow-sm z-20 transition-colors ${
                    level === 3 && !hackerState.isBlocked ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                }`}>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <ArrowRight size={12} /> Select Action
                    </div>
                    <div className="flex gap-2">
                        {/* LEVEL 1 ACTIONS */}
                        {level === 1 && !playerState.keysGenerated && (
                            <button 
                                onClick={handleSendPassword}
                                className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1"
                            >
                                <Lock size={14} /> Send Password
                            </button>
                        )}
                        
                        {level === 1 && !playerState.keysGenerated && (
                            <button 
                                onClick={handleGenerateKeys}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1"
                            >
                                <RefreshCcw size={14} /> Generate SSH Keypair
                            </button>
                        )}

                        {level === 1 && playerState.keysGenerated && !playerState.pubKeyInstalled && (
                            <button 
                                onClick={handleSendPublicKey}
                                className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1"
                            >
                                <LockKeyhole size={14} /> Distribute Public Key
                            </button>
                        )}

                        {level === 1 && playerState.pubKeyInstalled && !playerState.isConnected && (
                            <button 
                                onClick={handleConnectSSH}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1"
                            >
                                <Zap size={14} /> Connect via SSH
                            </button>
                        )}

                        {/* LEVEL 2 ACTIONS */}
                        {level === 2 && !aliceState.keysGenerated && (
                            <button 
                                onClick={handleGenerateAliceKeys}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1"
                            >
                                <UserPlus size={14} /> Generate Alice's Keys
                            </button>
                        )}

                        {level === 2 && aliceState.keysGenerated && !aliceState.pubKeyInstalled && (
                            <button 
                                onClick={handleSendAlicePublicKey}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1"
                            >
                                <LockKeyhole size={14} /> Distribute Alice's Key
                            </button>
                        )}

                        {level === 2 && aliceState.pubKeyInstalled && !aliceState.isConnected && (
                            <button 
                                onClick={handleAliceConnectSSH}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1"
                            >
                                <Zap size={14} /> Test Alice's Connection
                            </button>
                        )}

                        {/* LEVEL 3 ACTIONS */}
                        {level === 3 && !playerState.isRevoked && !hackerState.isBreached && (
                            <button 
                                onClick={handleRevoke}
                                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-black text-[12px] uppercase tracking-widest transition-colors shadow-lg flex items-center gap-1 animate-pulse"
                            >
                                <Trash2 size={16} /> REVOKE MY COMPROMISED KEY
                            </button>
                        )}

                        {transitPacket !== null && (
                            <button 
                                disabled
                                className="bg-slate-100 text-slate-400 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-1 opacity-70"
                            >
                                <RefreshCcw size={14} className="animate-spin" /> Processing...
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS & SCAFFOLDING */}
            <AnimatePresence>
                {/* 1. ONBOARDING BRIEFING */}
                {showIntro && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4 border border-indigo-200">
                                <ShieldAlert size={24} className="text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Mission 1: The Basics</h2>
                            <div className="text-slate-600 text-sm mb-6 space-y-3">
                                <p>We need to securely connect our laptop to the remote production server.</p>
                                <p>The problem? The internet is a public road. Hackers are running packet sniffers.</p>
                                <p className="font-bold text-slate-800">Your Goal:</p>
                                <ul className="list-disc pl-4 text-slate-700">
                                    <li>Try logging in with a password.</li>
                                    <li>Generate an asymmetric keypair.</li>
                                    <li>Distribute the padlock to securely establish a connection.</li>
                                </ul>
                            </div>
                            <button onClick={() => { if (playClick) playClick(); setShowIntro(false); }} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-md">
                                Begin Access Protocol
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* LEVEL COMPLETE MODAL */}
                {showMissionComplete && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl border-4 border-emerald-500">
                            <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4" />
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Mission {level} Complete!</h2>
                            <p className="text-slate-600 text-sm mb-6 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                {level === 1 ? "You shared a public padlock safely over an insecure network. The secret never had to travel!" :
                                 "You added Alice to the server without sharing your private key! The server now accepts either padlock."}
                            </p>
                            <button 
                                onClick={() => {
                                    if (playClick) playClick();
                                    setShowMissionComplete(false);
                                    if (level === 1) {
                                        setLevel(2);
                                        setShowL2Intro(true);
                                    } else if (level === 2) {
                                        setLevel(3);
                                        setShowL3Intro(true);
                                    }
                                }} 
                                className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                Start Mission {level + 1} <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* LEVEL 2 INTRO */}
                {showL2Intro && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4 border border-emerald-200">
                                <Users size={24} className="text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Mission 2: Scalability</h2>
                            <div className="text-slate-600 text-sm mb-6 space-y-3">
                                <p>The CEO just hired a new Sysadmin: Alice. She needs root access to the server.</p>
                                <p><strong>Rule #1 of Cryptography:</strong> NEVER share your Private Key.</p>
                                <p className="font-bold text-slate-800">Your Goal:</p>
                                <ul className="list-disc pl-4 text-slate-700">
                                    <li>Generate a brand new keypair just for Alice.</li>
                                    <li>Install her Public Key (Padlock) onto the server alongside yours.</li>
                                </ul>
                            </div>
                            <button onClick={() => { if (playClick) playClick(); setShowL2Intro(false); }} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-md">
                                Begin Mission 2
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* LEVEL 3 INTRO */}
                {showL3Intro && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-rose-900/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border-4 border-rose-500">
                            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 border border-rose-200">
                                <AlertTriangle size={24} className="text-rose-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter text-rose-600">CRITICAL ALERT</h2>
                            <div className="text-slate-600 text-sm mb-6 space-y-3">
                                <p>You left your laptop at a coffee shop and it was stolen! The thief extracted your Private Key!</p>
                                <p>A hacker is currently attempting to use your stolen key to breach the Remote Server.</p>
                                <p className="font-bold text-rose-600">Your Goal:</p>
                                <ul className="list-disc pl-4 text-slate-700 font-bold">
                                    <li>Revoke your Public Key from the server immediately!</li>
                                    <li>You have 5 seconds before the hacker breaches the system.</li>
                                </ul>
                            </div>
                            <button onClick={() => {
                                if (playClick) playClick();
                                setShowL3Intro(false);
                                setHackerState(prev => ({...prev, isActive: true}));
                            }} className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-500 transition-colors shadow-lg">
                                SCRAMBLE DEFENSES!
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* SMART FAILURE */}
                {showFailureModal && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl border-4 border-red-500">
                            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Breach Detected!</h2>
                            <p className="text-slate-600 text-sm mb-6 bg-red-50 p-3 rounded-lg border border-red-200 text-left whitespace-pre-wrap">
                                {failureReason}
                            </p>
                            <button 
                                onClick={() => {
                                    if (playClick) playClick();
                                    if (level === 1) {
                                        setShowFailureModal(false);
                                        setTransitPacket(null);
                                    } else {
                                        resetGame();
                                    }
                                }} 
                                className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={18} /> {level === 1 ? "Try Encryption" : "Restart Simulation"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Celebration
                isActive={isVictorious}
                message="Threat Neutralized! You successfully revoked your compromised padlock before the hacker could get in. Because Alice had her own separate keypair, she remained safely connected!"
                onReplay={resetGame}
            />
        </LabShell>
    );
}
