"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Server, Globe, Activity, Shield, ShieldAlert, AlertTriangle, 
  CheckCircle2, Cpu, Zap, Play, Lock, ToggleLeft, ToggleRight, 
  ArrowRight, Radio, Flame, ShieldCheck, ServerCrash, Timer,
  Bug, Laptop
} from "lucide-react";

const ConduitLine = ({ x1, y1, x2, y2, active = true }: any) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round">
    {active && <animate attributeName="stroke-dashoffset" values="16;0" dur="0.8s" repeatCount="indefinite" />}
  </line>
);

export default function ReverseProxies9() {
  const { reportComplete } = useLMSBridge("reverseproxies9");
  const { playPop, playError, playSuccess, playClick } = useLabAudio();

  // Timer State
  const TIMER_DURATION = 5 * 60;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Lab State
  const [phase, setPhase] = useState(0); 
  const [cpuUsage, setCpuUsage] = useState(12);
  const [trafficState, setTrafficState] = useState<'idle' | 'direct_flooding' | 'proxy_filtering'>('idle');
  
  // NGINX Config Rules
  const [rules, setRules] = useState({ blockIp: false, proxyPass: false });

  // Handle direct traffic attack
  const handleSimulateDirect = () => {
    if (phase !== 0) return;
    playClick();
    setPhase(1);
    setTrafficState('direct_flooding');

    // Simulate CPU Spike
    let cpu = 12;
    const cpuInterval = setInterval(() => {
      cpu += Math.floor(Math.random() * 20) + 15;
      if (cpu >= 100) {
        cpu = 100;
        clearInterval(cpuInterval);
      }
      setCpuUsage(cpu);
    }, 300);

    // Crash after 2.5 seconds
    setTimeout(() => {
      playError();
      setPhase(2); // Crashed
      
      setTimeout(() => {
        setTrafficState('idle');
        setCpuUsage(0); // offline
        setPhase(3); // Prompt NGINX
      }, 3000);
    }, 2500);
  };

  // Handle deploying NGINX
  const handleDeployNginx = () => {
    if (phase !== 3) return;
    playPop();
    setPhase(4); // Config mode
    setCpuUsage(12); // Backend restarted
  };

  // Check rules completion
  useEffect(() => {
    if (phase === 4 && rules.blockIp && rules.proxyPass) {
      playSuccess();
      setTimeout(() => {
        setPhase(5); // Ready
      }, 500);
    }
  }, [rules, phase, playSuccess]);

  // Handle final stress test
  const handleStressTest = () => {
    if (phase !== 5) return;
    playClick();
    setTrafficState('proxy_filtering');
    
    // CPU stays calm
    const cpuInterval = setInterval(() => {
      setCpuUsage(prev => {
        const next = prev + (Math.random() > 0.5 ? 2 : -2);
        return Math.min(Math.max(next, 10), 25);
      });
    }, 500);

    setTimeout(() => {
      clearInterval(cpuInterval);
      setTrafficState('idle');
      playSuccess();
      setPhase(6);
      reportComplete();
    }, 5000);
  };

  const resetLab = () => {
    setPhase(0);
    setTrafficState('idle');
    setCpuUsage(12);
    setRules({ blockIp: false, proxyPass: false });
    setTimeLeft(TIMER_DURATION);
  };

  const getInstruction = () => {
    switch(phase) {
      case 0: return "WARNING: Your backend is exposed to the wild internet! Run a traffic test to see the vulnerability.";
      case 1: return "CRITICAL ALERT! A DDoS attack is flooding the server! The CPU is maxing out!";
      case 2: return "SYSTEM CRASH (502 Bad Gateway). The backend was overwhelmed by direct malicious traffic.";
      case 3: return "Without a perimeter shield, your server must handle every bad request. Deploy an NGINX Gatehouse.";
      case 4: return "NGINX is active! Configure its security rules to block the DDoS Attacker and forward (proxy_pass) safe traffic.";
      case 5: return "Rules securely configured! NGINX will now shield the backend. Launch the Full Stress Test.";
      case 6: return "MISSION SUCCESS! The NGINX Proxy safely rejected the DDoS attack at the perimeter while routing good traffic.";
      default: return "";
    }
  };

  const getCpuColor = () => {
    if (phase === 2 || cpuUsage > 85) return 'bg-rose-500';
    if (phase === 3) return 'bg-slate-400'; // offline
    if (cpuUsage > 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <LabShell
      labId="reverseproxies9"
      title="Reverse Proxies (NGINX)"
      compact={true}
      onReset={resetLab}
      bgOverride="bg-slate-50"
      theme="ocean"
      navExtra={
        <div className="flex items-center gap-1.5 text-sky-700 bg-white hover:bg-sky-50 border border-sky-100 shadow-sm px-3 md:px-4 h-9 md:h-10 rounded-full font-mono text-sm font-bold transition-colors">
          <Timer size={16} strokeWidth={2.5} />
          {formatTime(timeLeft)}
        </div>
      }
    >
      <div className="relative z-10 w-full h-full flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-y-auto">
        
        {/* Dynamic Instruction Banner */}
        <div className={`w-full border-2 rounded-xl p-3 shadow-sm flex items-start sm:items-center gap-3 shrink-0 transition-colors duration-500
          ${(phase === 1 || phase === 2) ? 'bg-rose-50 border-rose-300 text-rose-900' : 
            phase === 3 ? 'bg-amber-50 border-amber-300 text-amber-900' :
            phase === 6 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
            'bg-white border-sky-200 text-sky-900'}`
        }>
          <div className={`p-2 rounded-lg shrink-0 transition-colors 
            ${(phase === 1 || phase === 2) ? 'bg-rose-100 text-rose-600' : 
              phase === 3 ? 'bg-amber-100 text-amber-600 animate-pulse' :
              phase === 6 ? 'bg-emerald-100 text-emerald-600' :
              'bg-sky-100 text-sky-600'}`}
          >
            {(phase === 1 || phase === 2) ? <AlertTriangle size={20} strokeWidth={2.5} /> :
             phase === 3 ? <ShieldAlert size={20} strokeWidth={2.5} /> :
             phase === 6 ? <CheckCircle2 size={20} strokeWidth={2.5} /> :
             <Globe size={20} strokeWidth={2.5} />}
          </div>
          <p className="text-sm sm:text-base font-semibold leading-snug">
            {getInstruction()}
          </p>
        </div>

        <div className="flex-1 w-full flex flex-col md:flex-row gap-3 sm:gap-4 min-h-0 pb-2">
          
          {/* CONTROL DECK (LEFT) */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-3 shrink-0">
            <div className={`bg-white border-2 rounded-2xl shadow-sm p-4 flex flex-col h-full relative z-10 transition-colors duration-500 ${
              phase >= 4 ? 'border-emerald-400 shadow-emerald-50' : 'border-slate-300'
            }`}>
              
              {/* Telemetry Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl bg-slate-100 text-slate-700`}>
                    <Activity size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Health</div>
                    <div className="text-sm font-black text-slate-800">Mission Telemetry</div>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  phase === 1 ? 'bg-rose-100 text-rose-700 animate-pulse' :
                  phase === 2 ? 'bg-rose-600 text-white animate-pulse' :
                  phase === 3 ? 'bg-amber-100 text-amber-700' :
                  phase >= 4 ? 'bg-emerald-100 text-emerald-700' :
                  'bg-sky-100 text-sky-700'
                }`}>
                  <Radio size={10} strokeWidth={3} className={phase === 1 || phase === 2 ? "animate-pulse" : ""} />
                  {phase === 2 ? "OFFLINE" : phase === 3 ? "RECOVERY" : phase >= 4 ? "SHIELDED" : "EXPOSED"}
                </span>
              </div>

              {/* CPU Gauge */}
              <div className={`bg-slate-900 text-slate-200 rounded-xl p-4 my-3 text-xs font-mono space-y-3 shrink-0 border border-slate-800 relative overflow-hidden transition-shadow duration-300 ${
                phase === 2 || cpuUsage > 85 ? 'shadow-[0_0_25px_rgba(244,63,94,0.4)]' : ''
              }`}>
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-sans font-bold text-[10px] uppercase tracking-widest">Backend Core Load</span>
                  <span className={`text-lg font-black leading-none ${phase === 2 || cpuUsage > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {phase === 3 ? "ERR" : `${cpuUsage}%`}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700 relative">
                  <div className={`h-full transition-all duration-300 ease-out ${getCpuColor()}`} style={{ width: `${Math.min(cpuUsage, 100)}%` }} />
                </div>
                {phase === 2 && (
                  <div className="absolute inset-0 bg-rose-500/20 animate-pulse pointer-events-none flex items-center justify-center">
                    <span className="bg-rose-600 text-white text-[10px] px-2 py-1 rounded font-bold tracking-widest flex items-center gap-1"><Flame size={12} strokeWidth={3}/> CORE MELTDOWN</span>
                  </div>
                )}
              </div>

              {/* Dynamic Action / Config Deck */}
              <div className="flex-1 flex flex-col justify-end">
                <AnimatePresence mode="wait">
                  
                  {/* Phase 0: Try Traffic */}
                  {phase === 0 && (
                    <motion.div key="phase0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                      <div className="text-xs text-slate-500 font-bold mb-1 text-center">Core backend is unprotected.</div>
                      <button onClick={handleSimulateDirect} className="w-full bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-sm font-black py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1">
                        <Bug size={18} strokeWidth={2.5} /> INITIATE TRAFFIC STORM
                      </button>
                    </motion.div>
                  )}

                  {/* Phase 1/2: Attacking / Crashed (No buttons, just observe) */}
                  {(phase === 1 || phase === 2) && (
                    <motion.div key="phase12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-rose-500">
                      <ServerCrash size={40} strokeWidth={2.5} className={phase === 1 ? "animate-spin" : "animate-bounce"} />
                      <div className="text-sm font-black mt-2 text-center tracking-wide uppercase">{phase === 1 ? "Processing Malicious Flood..." : "Server Overloaded!"}</div>
                    </motion.div>
                  )}

                  {/* Phase 3: Deploy NGINX */}
                  {phase === 3 && (
                    <motion.div key="phase3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                      <div className="text-xs text-amber-600 font-bold mb-1 text-center">SYSTEM RECOVERY: Establish perimeter.</div>
                      <button onClick={handleDeployNginx} className="w-full bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-black py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/30 border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 animate-bounce">
                        <Shield size={18} strokeWidth={2.5} /> DEPLOY NGINX GATEHOUSE
                      </button>
                    </motion.div>
                  )}

                  {/* Phase 4: Configure Rules */}
                  {phase === 4 && (
                    <motion.div key="phase4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col gap-3">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-200 pb-2">NGINX Gatehouse Config</div>
                        
                        {/* Toggle 1: Block IP */}
                        <button 
                          onClick={() => { playClick(); setRules(r => ({ ...r, blockIp: !r.blockIp })) }}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${rules.blockIp ? 'bg-emerald-500 border-emerald-600 text-white shadow-inner' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                        >
                          <div className="flex flex-col items-start text-left">
                            <span className="text-xs font-bold">Rule: Filter Rogue IP</span>
                            <span className={`text-[10px] font-mono ${rules.blockIp ? 'text-emerald-100' : 'text-slate-400'}`}>deny 198.51.100.1;</span>
                          </div>
                          {rules.blockIp ? <ToggleRight size={24} className="text-white" /> : <ToggleLeft size={24} className="text-slate-400" />}
                        </button>

                        {/* Toggle 2: Proxy Pass */}
                        <button 
                          onClick={() => { playClick(); setRules(r => ({ ...r, proxyPass: !r.proxyPass })) }}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${rules.proxyPass ? 'bg-emerald-500 border-emerald-600 text-white shadow-inner' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                        >
                          <div className="flex flex-col items-start text-left">
                            <span className="text-xs font-bold">Rule: Secure Routing</span>
                            <span className={`text-[10px] font-mono ${rules.proxyPass ? 'text-emerald-100' : 'text-slate-400'}`}>proxy_pass http://backend;</span>
                          </div>
                          {rules.proxyPass ? <ToggleRight size={24} className="text-white" /> : <ToggleLeft size={24} className="text-slate-400" />}
                        </button>

                      </div>
                    </motion.div>
                  )}

                  {/* Phase 5: Launch Stress Test */}
                  {phase === 5 && (
                    <motion.div key="phase5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                      <div className="text-xs text-emerald-600 font-bold mb-1 text-center">NGINX Shield Online. Ready for trial.</div>
                      <button onClick={handleStressTest} className="w-full bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-black py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1">
                        <Zap size={18} strokeWidth={2.5} /> LAUNCH STRESS TEST
                      </button>
                    </motion.div>
                  )}

                  {/* Phase 6: Success */}
                  {phase === 6 && (
                    <motion.div key="phase6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center shadow-inner">
                      <ShieldCheck size={20} strokeWidth={2.5} className="text-emerald-600 mr-2 shrink-0" />
                      Infrastructure Secured & Validated!
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* NETWORK CONCOURSE (RIGHT) */}
          <div className="flex-1 flex flex-col relative z-0 min-h-[250px] md:min-h-[360px] bg-white border-2 border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Title Bar */}
            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0 z-10">
              <div className="flex items-center gap-2">
                <Globe className="text-sky-400" size={16} strokeWidth={2.5} />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Cloud Network Architecture</h2>
              </div>
            </div>

            {/* Stage Field */}
            <div className="flex-1 relative bg-slate-50 overflow-hidden select-none">
              
              {/* Background Grid Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-net" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-net)" />
              </svg>

              {/* Zone Backgrounds */}
              <div className="absolute top-0 bottom-0 left-0 w-[30%] bg-gradient-to-r from-sky-100/80 to-transparent border-r border-sky-200" />
              <div className="absolute top-0 bottom-0 right-0 w-[35%] bg-gradient-to-l from-indigo-100/80 to-transparent border-l border-indigo-200" />
              
              <div className="absolute top-3 left-4 text-[10px] font-black uppercase text-sky-700/60 tracking-widest z-0">Public Internet</div>
              <div className="absolute top-3 right-4 text-[10px] font-black uppercase text-indigo-700/60 tracking-widest z-0">Private Network</div>

              {/* Conduit Wires (SVG Lines) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* Attacker Line */}
                {phase < 4 ? (
                  // Direct to Backend
                  <ConduitLine x1="15%" y1="25%" x2="85%" y2="50%" active={true} />
                ) : (
                  // To NGINX
                  <ConduitLine x1="15%" y1="25%" x2="50%" y2="50%" active={true} />
                )}
                
                {/* Client Line */}
                {phase < 4 ? (
                  // Direct to Backend
                  <ConduitLine x1="15%" y1="75%" x2="85%" y2="50%" active={true} />
                ) : (
                  // To NGINX
                  <ConduitLine x1="15%" y1="75%" x2="50%" y2="50%" active={true} />
                )}
                
                {/* NGINX to Backend Line */}
                {phase >= 4 && (
                  <ConduitLine x1="50%" y1="50%" x2="85%" y2="50%" active={true} />
                )}
              </svg>

              {/* NODES */}
              
              {/* Node: Attacker */}
              <div className="absolute top-[25%] left-[15%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-24 sm:h-24 bg-gradient-to-br from-white to-rose-50 border-2 border-rose-300 rounded-full flex flex-col items-center justify-center shadow-lg shadow-rose-500/20 z-10">
                <Bug className="text-rose-500 mb-0.5 sm:mb-1 w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
                <span className="text-[7px] sm:text-[10px] font-black text-rose-800 uppercase tracking-wide">Attacker</span>
                <span className="text-[6px] sm:text-[8px] font-mono text-rose-600/80 font-bold">198.51.100.1</span>
              </div>

              {/* Node: Good Client */}
              <div className="absolute top-[75%] left-[15%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-24 sm:h-24 bg-gradient-to-br from-white to-sky-50 border-2 border-sky-300 rounded-full flex flex-col items-center justify-center shadow-lg shadow-sky-500/20 z-10">
                <Laptop className="text-sky-500 mb-0.5 sm:mb-1 w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
                <span className="text-[7px] sm:text-[10px] font-black text-sky-800 uppercase tracking-wide">Customer</span>
                <span className="text-[6px] sm:text-[8px] font-mono text-sky-600/80 font-bold">203.0.113.5</span>
              </div>

              {/* Node: NGINX Gatehouse */}
              <div className={`absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-20 h-24 sm:w-32 sm:h-40 rounded-xl flex flex-col items-center justify-center transition-all duration-700 z-20 ${
                phase >= 4 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-400 shadow-xl shadow-emerald-500/30' : 'bg-slate-50/50 border-2 border-dashed border-slate-300 opacity-60 backdrop-blur-sm'
              }`}>
                {phase >= 4 ? (
                  <>
                    <ShieldCheck className="text-emerald-600 mb-1 sm:mb-2 w-6 h-6 sm:w-9 sm:h-9" strokeWidth={2.5} />
                    <span className="text-[9px] sm:text-xs font-black text-emerald-900 uppercase tracking-widest text-center px-1 sm:px-2 leading-tight">NGINX Proxy</span>
                    <div className="mt-1 sm:mt-2 text-[7px] sm:text-[8px] font-mono text-emerald-700 bg-emerald-100/50 px-1 sm:px-2 py-0.5 sm:py-1 rounded border border-emerald-300 text-center leading-tight shadow-sm font-bold">
                      IP Shielding<br/>Active
                    </div>
                  </>
                ) : (
                  <>
                    <Shield className="text-slate-400 mb-1 sm:mb-2 w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2} />
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase text-center px-1 sm:px-2 leading-tight">No Perimeter Shield</span>
                  </>
                )}
              </div>

              {/* Node: Backend Server */}
              <div className={`absolute top-[50%] left-[85%] -translate-x-1/2 -translate-y-1/2 w-20 h-24 sm:w-32 sm:h-40 rounded-xl flex flex-col items-center justify-center transition-all duration-500 z-10 ${
                phase === 2 ? 'bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.5)] animate-pulse' : 
                'bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-400 shadow-xl shadow-indigo-500/20'
              }`}>
                {phase === 2 ? (
                  <ServerCrash className="text-rose-600 mb-1 sm:mb-2 w-6 h-6 sm:w-9 sm:h-9" strokeWidth={2.5} />
                ) : (
                  <Server className="text-indigo-600 mb-1 sm:mb-2 w-6 h-6 sm:w-9 sm:h-9" strokeWidth={2.5} />
                )}
                <span className={`text-[9px] sm:text-xs font-black uppercase tracking-widest text-center px-1 sm:px-2 leading-tight ${phase === 2 ? 'text-rose-800' : 'text-indigo-900'}`}>
                  Private Backend
                </span>
                
                {/* Server IP Exposure Warning */}
                {phase < 4 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-rose-600 shadow-sm animate-pulse z-30">
                    IP EXPOSED: 10.0.0.1
                  </div>
                )}
              </div>

              {/* PARTICLES (TRAFFIC ANIMATIONS) */}
              <AnimatePresence>
                {/* Direct Traffic (Phase 1) */}
                {trafficState === 'direct_flooding' && (
                  <>
                    {/* Red Packets (Fast Spam) */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={`red-${i}`}
                        className="absolute w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)] z-30"
                        initial={{ left: "15%", top: "25%", opacity: 0, scale: 0.5 }}
                        animate={{ left: "85%", top: "50%", opacity: [0, 1, 1, 0], scale: 1 }}
                        transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity, ease: "linear" }}
                      />
                    ))}
                    {/* Blue Packets (Slower, overwhelmed) */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={`blue-${i}`}
                        className="absolute w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,1)] z-30"
                        initial={{ left: "15%", top: "75%", opacity: 0, scale: 0.5 }}
                        animate={{ left: "85%", top: "50%", opacity: [0, 1, 1, 0], scale: 1 }}
                        transition={{ duration: 1.2, delay: i * 0.5, repeat: Infinity, ease: "linear" }}
                      />
                    ))}
                  </>
                )}

                {/* Proxy Shielding Traffic (Phase 5/6) */}
                {trafficState === 'proxy_filtering' && (
                  <>
                    {/* Red Packets bouncing off NGINX */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={`red-proxy-${i}`}
                        className="absolute w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)] z-30"
                        initial={{ left: "15%", top: "25%", opacity: 0, scale: 0.5 }}
                        animate={{ 
                          left: ["15%", "50%", "45%"], 
                          top: ["25%", "50%", "40%"], 
                          opacity: [0, 1, 0], 
                          scale: [0.5, 1, 2] 
                        }}
                        transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity, ease: "linear" }}
                      />
                    ))}

                    {/* Shield Bounce Sparks */}
                    <motion.div
                      className="absolute left-[45%] top-[45%] text-rose-600 font-black text-xs pointer-events-none z-40"
                      animate={{ opacity: [0, 1, 0], y: [0, -20], scale: [0.5, 1.2, 0.8] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.1 }}
                    >
                      403 DENY
                    </motion.div>

                    {/* Blue Packets routing through NGINX to Backend */}
                    {[...Array(4)].map((_, i) => (
                      <React.Fragment key={`blue-proxy-wrap-${i}`}>
                        {/* Leg 1: Client to NGINX */}
                        <motion.div
                          key={`blue-proxy-1-${i}`}
                          className="absolute w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,1)] z-30"
                          initial={{ left: "15%", top: "75%", opacity: 0, scale: 0.5 }}
                          animate={{ left: "50%", top: "50%", opacity: [0, 1, 0], scale: 1 }}
                          transition={{ duration: 0.6, delay: i * 0.4, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Leg 2: NGINX to Backend (delayed) */}
                        <motion.div
                          key={`blue-proxy-2-${i}`}
                          className="absolute w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,1)] z-30"
                          initial={{ left: "50%", top: "50%", opacity: 0, scale: 0.5 }}
                          animate={{ left: "85%", top: "50%", opacity: [0, 1, 0], scale: 1 }}
                          transition={{ duration: 0.6, delay: i * 0.4 + 0.6, repeat: Infinity, ease: "linear" }}
                        />
                      </React.Fragment>
                    ))}
                  </>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>

      {/* Victory Celebration */}
      <AnimatePresence>
        {phase === 6 && (
          <Celebration
            isActive={phase === 6}
            message="Proxy Deployed! You successfully shielded the backend server. The NGINX reverse proxy now blocks bad IPs at the perimeter and routes legitimate customers safely to the backend."
            onReplay={resetLab}
          />
        )}
      </AnimatePresence>
    </LabShell>
  );
}
