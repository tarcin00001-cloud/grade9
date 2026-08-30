"use client";

import { useState, useEffect, useRef } from "react";
import LabShell from "../components/LabShell";
import { MessageSquare, Server, Smartphone, ScanSearch, ShieldCheck, Send, CheckCircle2, AlertTriangle, Database, ArrowRight, Cookie, ShieldX, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type PayloadType = "BENIGN" | "SCRIPT" | "IMG";
type SanitizerMode = "PASS_THROUGH" | "ENCODE";
type SimState = "IDLE" | "DISPATCHING" | "SCANNING" | "STORING" | "DELIVERING" | "EXECUTING" | "SECURE_RENDER";

export default function CrossSiteScripting9() {
    const [payload, setPayload] = useState<PayloadType>("BENIGN");
    const [sanitizerMode, setSanitizerMode] = useState<SanitizerMode>("PASS_THROUGH");
    const [simState, setSimState] = useState<SimState>("IDLE");
    
    // Server State
    const [dbStorage, setDbStorage] = useState<string>("");
    
    // Victim State
    const [victimFeed, setVictimFeed] = useState<string>("");
    const [isHacked, setIsHacked] = useState(false);
    
    // Objective Tracking
    const [hasExploited, setHasExploited] = useState(false);
    const [hasSecured, setHasSecured] = useState(false);

    // Feedback
    const [feedback, setFeedback] = useState<string>("Choose your payload and server rules to begin.");
    const [outcome, setOutcome] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const isMounted = useRef(false);
    const { width, height } = useWindowSize();

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (hasExploited && hasSecured && !isCompleted) {
            setIsCompleted(true);
            if ((window as any).reportComplete) {
                (window as any).reportComplete();
            }
        }
    }, [hasExploited, hasSecured, isCompleted]);

    // Color Theme Lookups for the App Server Panel
    const serverTheme = sanitizerMode === "PASS_THROUGH" 
        ? { bg: "bg-[#fef2f2]", border: "border-[#E5484D]", text: "text-[#E5484D]", header: "bg-[#fef2f2] text-[#E5484D]", icon: "text-[#E5484D]" }
        : { bg: "bg-[#F0FDF4]", border: "border-[#10A875]", text: "text-[#10A875]", header: "bg-[#F0FDF4] text-[#10A875]", icon: "text-[#10A875]" };

    const runPipeline = async () => {
        if (simState !== "IDLE") return;
        
        // Reset states
        setDbStorage("");
        setVictimFeed("");
        setIsHacked(false);
        setOutcome(null);
        setFeedback("Sending payload to the server...");
        setSimState("DISPATCHING");

        // 1. Dispatch (1s)
        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted.current) return;
        setFeedback("Server is scanning the input...");
        setSimState("SCANNING");

        // 2. Scan & Process (1.5s)
        await new Promise(r => setTimeout(r, 1500));
        if (!isMounted.current) return;

        let resultingString = "";
        if (payload === "BENIGN") resultingString = "Love this!";
        else if (payload === "SCRIPT") resultingString = sanitizerMode === "ENCODE" ? "&lt;script&gt;steal()&lt;/script&gt;" : "<script>steal()</script>";
        else if (payload === "IMG") resultingString = sanitizerMode === "ENCODE" ? "&lt;img src=x onerror=steal()&gt;" : "<img src=x onerror=steal()>";

        setDbStorage(resultingString);
        setFeedback("Payload saved to database. Victim is loading the page...");
        setSimState("STORING");

        // 3. Storing to Delivery (1s)
        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted.current) return;
        setSimState("DELIVERING");

        // 4. Delivery to Render (1s)
        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted.current) return;
        setVictimFeed(resultingString);

        if (payload !== "BENIGN" && sanitizerMode === "PASS_THROUGH") {
            setFeedback("Oh no! Script executed in Victim device. The session cookie was stolen!");
            setOutcome("System Hacked!");
            setSimState("EXECUTING");
            setIsHacked(true);
            setHasExploited(true);
        } else if (payload !== "BENIGN" && sanitizerMode === "ENCODE") {
            setFeedback("Success! The encoder neutralized the tags. The payload was safely rendered as text.");
            setOutcome("Script displayed safely as text.");
            setSimState("SECURE_RENDER");
            setHasSecured(true);
        } else {
            setFeedback("Normal comment processed safely.");
            setOutcome("Comment displayed safely as text.");
            setSimState("SECURE_RENDER");
        }

        await new Promise(r => setTimeout(r, 2000));
        if (!isMounted.current) return;
        setSimState("IDLE");
    };

    const reset = () => {
        setSimState("IDLE");
        setDbStorage("");
        setVictimFeed("");
        setIsHacked(false);
        setOutcome(null);
        setIsCompleted(false);
        setFeedback("Choose your payload and server rules to begin.");
    };

    const isRunning = simState !== "IDLE";
    
    const getRawPayloadText = () => {
        if (payload === "BENIGN") return "Love this!";
        if (payload === "SCRIPT") return "<script>steal()</script>";
        return "<img src=x onerror=steal()>";
    };

    return (
        <LabShell 
            labId="crosssitescripting9" 
            bgOverride="bg-[#F5F8FC] text-[#17324D]"
            title="Stored Cross-Site Scripting (XSS)" 
            instruction="See how an unsafe comment becomes stored code." 
            onReset={reset}
        >
            {isCompleted && (
                <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
                    <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-md border-2 border-[#10A875] p-6 md:p-8 rounded-3xl shadow-[0_20px_60px_rgba(16,168,117,0.3)] flex flex-col items-center text-center max-w-sm pointer-events-auto"
                    >
                        <div className="w-16 h-16 bg-[#F0FDF4] text-[#10A875] rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <Trophy size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-[#17324D] uppercase tracking-widest mb-2">Lab Complete!</h2>
                        <p className="text-[#60758A] font-bold text-sm">
                            You successfully demonstrated the threat of XSS and learned how to neutralize it with HTML encoding.
                        </p>
                    </motion.div>
                </div>
            )}
            
            <div className="flex-1 min-h-0 w-full flex flex-col justify-between overflow-hidden relative font-sans">
                
                {/* --- TOP OBJECTIVES & FEEDBACK --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-2 md:px-4 py-3 shrink-0 gap-4">
                    {/* Floating Feedback Banner */}
                    <div className="flex-1 max-w-2xl w-full">
                        <div className="bg-[#FFFFFF] border-2 border-[#CFDCE8] shadow-md rounded-xl py-2.5 px-4 text-[#17324D] font-bold flex items-center gap-2 text-sm w-full">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isRunning ? "bg-[#2563EB] animate-pulse" : "bg-[#10A875]"}`}/>
                            {feedback}
                        </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className="flex gap-4 bg-[#FFFFFF] border-2 border-[#CFDCE8] p-2 px-4 rounded-xl shadow-md text-xs font-bold text-[#60758A]">
                        <div className={`flex items-center gap-2 ${hasExploited ? "text-[#10A875]" : ""}`}>
                            {hasExploited ? <CheckCircle2 size={16}/> : <div className="w-4 h-4 border-2 border-[#CFDCE8] rounded-full"/>}
                            1. Observe Exploit
                        </div>
                        <div className={`flex items-center gap-2 ${hasSecured ? "text-[#10A875]" : ""}`}>
                            {hasSecured ? <CheckCircle2 size={16}/> : <div className="w-4 h-4 border-2 border-[#CFDCE8] rounded-full"/>}
                            2. Encode to Secure
                        </div>
                    </div>
                </div>

                {/* --- MAIN VISUAL JOURNEY --- */}
                <div className="flex-[1_1_100%] min-h-0 w-full overflow-hidden p-2 md:p-4 pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-11 gap-1 items-stretch h-full min-h-full">
                        
                        {/* STATION 1: Hacker's Phone (Col Span 3) */}
                        <div className="col-span-1 lg:col-span-3 bg-[#FFFFFF] border-2 border-[#CFDCE8] rounded-2xl flex flex-col overflow-hidden relative shadow-sm lg:min-h-0 min-h-[250px]">
                            <div className="bg-[#EAF2FB] p-2 border-b border-[#CFDCE8] flex justify-center items-center shrink-0">
                                <div className="font-bold text-[#7C3AED] flex items-center gap-2"><Smartphone size={16}/> Attacker Phone</div>
                            </div>
                            
                            <div className="flex-1 p-3 flex flex-col relative bg-white justify-end overflow-hidden">
                                {/* Chat UI Mockup */}
                                <div className="flex-1 overflow-hidden flex flex-col gap-2 opacity-30 mb-4 min-h-[20px] pointer-events-none">
                                    <div className="bg-[#EAF2FB] p-2 rounded-xl rounded-tl-none self-start w-3/4"></div>
                                    <div className="bg-[#EAF2FB] p-2 rounded-xl rounded-tl-none self-start w-1/2"></div>
                                </div>

                                {/* Active Comment Box */}
                                <div className="bg-[#F5F8FC] border border-[#CFDCE8] rounded-xl p-3 relative shrink-0">
                                    <div className="text-[10px] font-bold text-[#60758A] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        <MessageSquare size={12}/> Draft Comment
                                    </div>
                                    <div className={`font-mono text-xs font-bold break-all ${payload === "BENIGN" ? "text-[#17324D]" : "text-[#E5484D]"}`}>
                                        {getRawPayloadText()}
                                    </div>
                                </div>
                                
                                {/* Animate out */}
                                <AnimatePresence>
                                    {(simState === "DISPATCHING") && (
                                        <motion.div
                                            initial={{ x: 0, opacity: 1, scale: 1 }}
                                            animate={{ x: 300, opacity: 0, scale: 0.8 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="absolute bottom-4 left-4 right-4 bg-[#7C3AED] text-white font-mono text-xs font-bold rounded-xl p-3 shadow-lg break-all z-30"
                                        >
                                            {getRawPayloadText()}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ARROW 1 */}
                        <div className="hidden lg:flex col-span-1 items-center justify-center text-[#CFDCE8] shrink-0">
                            <ArrowRight size={32} className={simState === "DISPATCHING" ? "text-[#7C3AED] animate-pulse" : ""} />
                        </div>

                        {/* STATION 2: Server X-Ray Scanner (Col Span 3) */}
                        <div className={`col-span-1 lg:col-span-3 bg-[#FFFFFF] border-2 ${serverTheme.border} rounded-2xl flex flex-col overflow-hidden relative shadow-sm lg:min-h-0 min-h-[250px] transition-colors duration-500`}>
                            <div className={`${serverTheme.header} p-2 border-b ${serverTheme.border} flex justify-center items-center shrink-0 transition-colors duration-500`}>
                                <div className={`font-bold flex items-center gap-2 ${serverTheme.text}`}><Server size={16} /> App Server</div>
                            </div>
                            
                            <div className={`flex-1 p-2 md:p-3 flex flex-col gap-2 relative justify-center items-center overflow-hidden ${serverTheme.bg} transition-colors duration-500`}>
                                {/* The X-Ray Chamber */}
                                <div className="w-full flex-1 min-h-[80px] bg-[#142238] rounded-xl border border-[#17324D] relative overflow-hidden flex flex-col shadow-inner">
                                    <div className="bg-[#17324D]/50 border-b border-[#17324D] p-1.5 flex justify-center items-center">
                                         <div className="text-[9px] font-black uppercase text-[#60758A] flex items-center gap-1.5">
                                            <ScanSearch size={10} className="text-[#0891B2]"/> X-Ray Scanner
                                        </div>
                                    </div>
                                    <div className="flex-1 relative flex items-center justify-center p-2">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#17324D 1px, transparent 1px), linear-gradient(90deg, #17324D 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                                        
                                        <AnimatePresence>
                                            {((simState !== "IDLE" && simState !== "DISPATCHING") || dbStorage !== "") && (
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 1.1, opacity: 0 }}
                                                    className="z-10 w-full flex flex-col items-center gap-2"
                                                >
                                                    <div className="font-mono text-xs md:text-sm font-bold text-white text-center break-all relative">
                                                        {payload === "BENIGN" && "Love this!"}
                                                        {payload !== "BENIGN" && sanitizerMode === "PASS_THROUGH" && (
                                                            <span><span className="text-[#E5484D] bg-[#E5484D]/20 px-1 rounded">&lt;</span>{payload === "SCRIPT" ? "script" : "img"}<span className="text-[#E5484D] bg-[#E5484D]/20 px-1 rounded">&gt;</span>...</span>
                                                        )}
                                                        {payload !== "BENIGN" && sanitizerMode === "ENCODE" && (
                                                            <span><span className="text-[#0891B2] bg-[#0891B2]/20 px-1 rounded">&amp;lt;</span>{payload === "SCRIPT" ? "script" : "img"}<span className="text-[#0891B2] bg-[#0891B2]/20 px-1 rounded">&amp;gt;</span>...</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${payload !== "BENIGN" && sanitizerMode === "PASS_THROUGH" ? "bg-[#E5484D]/20 border-[#E5484D] text-[#E5484D]" : "bg-[#10A875]/20 border-[#10A875] text-[#10A875]"}`}>
                                                        {payload !== "BENIGN" && sanitizerMode === "PASS_THROUGH" ? (
                                                            <><AlertTriangle size={10}/> VULNERABLE</>
                                                        ) : (
                                                            <><CheckCircle2 size={10}/> SAFE</>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {simState === "SCANNING" && (
                                                <motion.div
                                                    initial={{ top: "0%" }}
                                                    animate={{ top: ["0%", "100%", "0%"] }}
                                                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                                    className="absolute left-0 right-0 h-1 bg-[#0891B2] shadow-[0_0_15px_#0891B2] z-20"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                
                                {/* DB Vault */}
                                <div className="w-full bg-[#142238] rounded-xl p-2 shadow-inner border border-[#17324D] flex flex-col shrink-0">
                                    <div className="text-[9px] font-black text-[#60758A] uppercase tracking-widest flex items-center gap-1.5 mb-1"><Database size={12} className="text-[#0891B2]"/> DATABASE STORAGE</div>
                                    <div className="bg-[#0b1320] border border-[#17324D] rounded-lg py-1.5 px-3 font-mono text-[10px] text-[#10A875] min-h-[30px] flex items-center break-all shadow-inner">
                                        {dbStorage ? dbStorage : <span className="text-[#60758A] italic">No records</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ARROW 2 */}
                        <div className="hidden lg:flex col-span-1 items-center justify-center text-[#CFDCE8] shrink-0">
                            <ArrowRight size={32} className={simState === "DELIVERING" ? "text-[#2563EB] animate-pulse" : ""} />
                        </div>

                        {/* STATION 3: Victim's Phone & Heist (Col Span 3) */}
                        <div className="col-span-1 lg:col-span-3 bg-[#FFFFFF] border-2 border-[#CFDCE8] rounded-2xl flex flex-col overflow-hidden relative shadow-sm lg:min-h-0 min-h-[300px]">
                            
                            <div className="bg-[#EAF2FB] pt-2 pb-2 px-4 border-b border-[#CFDCE8] flex justify-center items-center shrink-0">
                                <div className="font-bold text-[#0891B2] flex items-center gap-2"><Smartphone size={16}/> Victim's Feed</div>
                            </div>
                            
                            <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
                                
                                {/* Social Feed Area */}
                                <div className="flex-1 p-3 overflow-hidden flex flex-col gap-3 relative">
                                    <div className="bg-[#F5F8FC] border border-[#CFDCE8] rounded-xl p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-[#0891B2]/20 text-[#0891B2] flex items-center justify-center font-bold text-xs">A</div>
                                            <div className="font-bold text-xs text-[#17324D]">Alice_88</div>
                                        </div>
                                        <div className="text-sm text-[#60758A]">This is my original post!</div>
                                    </div>
                                    
                                    {/* The Injected Post */}
                                    <AnimatePresence>
                                        {victimFeed && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`bg-[#F5F8FC] border-2 ${hasSecured ? "border-[#10A875]" : "border-[#CFDCE8]"} rounded-xl p-3 shadow-sm relative overflow-hidden shrink-0`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center font-bold text-xs">V</div>
                                                        <div className="font-bold text-xs text-[#17324D]">Visitor</div>
                                                    </div>
                                                    {hasSecured && (
                                                        <div className="text-[10px] font-black tracking-widest uppercase bg-[#10A875]/20 text-[#10A875] px-2 py-0.5 rounded flex items-center gap-1">
                                                            <ShieldCheck size={12}/> Safe
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-[#17324D] font-mono break-all relative z-10 bg-white/50 p-1 rounded">
                                                    {victimFeed}
                                                </div>

                                                {/* Visual Code Execution Glitch */}
                                                {isHacked && (
                                                    <motion.div 
                                                        className="absolute inset-0 bg-[#E5484D]/10 z-0 border-2 border-[#E5484D] rounded-xl"
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 0.2, repeat: 3 }}
                                                    />
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Hacked State Overlay */}
                                    <AnimatePresence>
                                        {isHacked && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute inset-0 z-40 bg-[#E5484D] text-white flex-col flex items-center justify-center text-center"
                                            >
                                                <ShieldX size={48} className="mb-2 animate-bounce"/>
                                                <div className="font-black text-2xl uppercase tracking-widest mb-2">System Hacked</div>
                                                <div className="text-white/90 text-xs font-bold">Script executed in Victim device</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Secure Browser Storage (Cookie Vault) */}
                                <div className="bg-[#142238] border-t border-[#17324D] p-3 flex flex-col items-center shrink-0 relative overflow-hidden z-20">
                                    <div className="text-[9px] font-black text-[#60758A] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                        <Cookie size={12} className="text-[#F59E0B]"/> BROWSER SESSION (COOKIE)
                                    </div>
                                    <div className="bg-[#0b1320] border border-[#17324D] rounded-lg py-1.5 px-4 w-full flex items-center justify-center gap-2">
                                        <span className="text-[10px] text-[#60758A] font-mono">session_id:</span>
                                        <motion.div 
                                            animate={isHacked ? { y: -100, opacity: 0, scale: 0.5, rotate: 180 } : { y: 0, opacity: 1, scale: 1, rotate: 0 }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="text-[#F59E0B]"
                                        >
                                            <Cookie size={16}/>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- COMPACT CONTROL DESK --- */}
                <div className="flex-[0_0_auto] w-full bg-[#FFFFFF] border-t-2 border-[#CFDCE8] p-3 flex flex-col md:flex-row items-center justify-between gap-4 z-20 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] relative">
                    
                    {/* 1. Payload Selector */}
                    <div className="flex flex-col gap-1.5 w-full md:w-auto">
                        <div className="text-[10px] font-black text-[#60758A] uppercase tracking-widest flex items-center gap-1.5">
                            Step 1: Choose Comment
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPayload("BENIGN")} 
                                disabled={isRunning}
                                className={`flex-1 md:flex-none px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${payload === "BENIGN" ? "bg-[#EAF2FB] border-[#2563EB] text-[#2563EB]" : "bg-[#FFFFFF] border-[#CFDCE8] text-[#60758A] hover:bg-[#EAF2FB]"} ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                Normal comment
                            </button>
                            <button 
                                onClick={() => setPayload("SCRIPT")} 
                                disabled={isRunning}
                                className={`flex-1 md:flex-none px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all border-2 ${payload === "SCRIPT" ? "bg-[#fef2f2] border-[#E5484D] text-[#E5484D]" : "bg-[#FFFFFF] border-[#CFDCE8] text-[#60758A] hover:bg-[#fef2f2]"} ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                &lt;script&gt;
                            </button>
                            <button 
                                onClick={() => setPayload("IMG")} 
                                disabled={isRunning}
                                className={`flex-1 md:flex-none px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all border-2 ${payload === "IMG" ? "bg-[#fef2f2] border-[#E5484D] text-[#E5484D]" : "bg-[#FFFFFF] border-[#CFDCE8] text-[#60758A] hover:bg-[#fef2f2]"} ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                &lt;img&gt;
                            </button>
                        </div>
                    </div>

                    {/* 2. Sanitizer Clamp */}
                    <div className="flex flex-col gap-1.5 items-center w-full md:w-auto mt-2 md:mt-0">
                        <div className="text-[10px] font-black text-[#60758A] uppercase tracking-widest flex items-center gap-1.5">
                            Step 2: Server Security Rules
                        </div>
                        <div className="flex bg-[#F5F8FC] p-1 rounded-xl border border-[#CFDCE8] relative">
                            <button 
                                onClick={() => setSanitizerMode("PASS_THROUGH")}
                                disabled={isRunning}
                                className={`relative z-10 px-4 py-2 w-36 md:w-44 text-center rounded-lg font-bold text-[11px] transition-colors ${sanitizerMode === "PASS_THROUGH" ? "text-[#E5484D]" : "text-[#60758A] hover:text-[#17324D]"} ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {sanitizerMode === "PASS_THROUGH" && (
                                    <motion.div layoutId="security-pill" className="absolute inset-0 bg-white border-2 border-[#E5484D] rounded-lg -z-10 shadow-sm" />
                                )}
                                Allow raw HTML
                            </button>
                            <button 
                                onClick={() => setSanitizerMode("ENCODE")}
                                disabled={isRunning}
                                className={`relative z-10 px-4 py-2 w-36 md:w-44 text-center rounded-lg font-bold text-[11px] transition-colors ${sanitizerMode === "ENCODE" ? "text-[#10A875]" : "text-[#60758A] hover:text-[#17324D]"} ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {sanitizerMode === "ENCODE" && (
                                    <motion.div layoutId="security-pill" className="absolute inset-0 bg-white border-2 border-[#10A875] rounded-lg -z-10 shadow-sm" />
                                )}
                                Encode HTML
                            </button>
                        </div>
                    </div>

                    {/* 3. Dispatch Button */}
                    <div className="flex flex-col gap-1.5 items-end w-full md:w-auto mt-2 md:mt-0">
                        <div className="text-[10px] font-black text-[#60758A] uppercase tracking-widest flex items-center gap-1.5 hidden md:flex">Step 3: Execute</div>
                        <button 
                            disabled={isRunning}
                            onClick={runPipeline}
                            className="w-full md:w-auto bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-[#CFDCE8] disabled:text-[#60758A] text-white font-black px-6 py-2 md:px-8 md:py-2.5 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 text-sm shadow-sm border-b-4 border-[#1d4ed8] active:border-b-0 active:translate-y-1"
                        >
                            <Send size={16} />
                            Post Comment
                        </button>
                    </div>

                </div>

            </div>
        </LabShell>
    );
}
