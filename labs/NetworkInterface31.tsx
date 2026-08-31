"use client";

import React, { useState, useEffect } from "react";
import LabShell from "@/components/LabShell";
import NetworkInterface3DScene from "@/components/NetworkInterface3DScene";
import Celebration from "@/components/Celebration";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import { 
  Info, Cpu, Network, Server, Play, ShieldAlert,
  ArrowRight, Zap, CheckCircle2,
  Video, Download, AlertTriangle
} from "lucide-react";

type Step = 'LEARN' | 'INIT_MAC' | 'INIT_MEDIUM' | 'TRY_RAW' | 'FAIL_CPU' | 'UNDERSTAND' | 'IMPROVE' | 'OUTCOME';

const STEPS: { id: Step; label: string }[] = [
  { id: 'LEARN', label: '1. Briefing' },
  { id: 'INIT_MAC', label: '2. Identity' },
  { id: 'INIT_MEDIUM', label: '3. Physical' },
  { id: 'TRY_RAW', label: '4. Raw Stream' },
  { id: 'FAIL_CPU', label: '5. Bottleneck' },
  { id: 'UNDERSTAND', label: '6. Insight' },
  { id: 'IMPROVE', label: '7. Config NIC' },
  { id: 'OUTCOME', label: '8. Flawless' },
];

export default function NetworkInterface31() {
  const { playClick, playSuccess, playError, playPop, playGearGrind } = useLabAudio();
  const { reportComplete } = useLMSBridge("networkinterface31");
  
  const [step, setStep] = useState<Step>('LEARN');
  
  // Initialization State
  const [macAddress, setMacAddress] = useState<string | null>(null);
  const [physicalMedia, setPhysicalMedia] = useState<string[]>([]);

  // Hardware Toggles
  const [tcpOffloadEnabled, setTcpOffloadEnabled] = useState(false);
  const [qosEnabled, setQosEnabled] = useState(false);
  
  // Simulation State
  const [isStreaming, setIsStreaming] = useState(false);
  const [cpuLoad, setCpuLoad] = useState(5); // Idle 5%
  const [bufferLoad, setBufferLoad] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  
  const [isShaking, setIsShaking] = useState(false);

  // Simulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        // Calculate dynamic loads based on hardware config
        const targetCpu = tcpOffloadEnabled ? Math.random() * 5 + 15 : 100; // 15-20% if offloaded, 100% if not
        
        setCpuLoad(prev => {
          const next = prev + (targetCpu - prev) * 0.2;
          return next > 100 ? 100 : next < 0 ? 0 : next;
        });

        // If CPU hits 100, buffer fills up fast
        if (targetCpu >= 95) {
          setBufferLoad(prev => Math.min(prev + 15, 100));
        } else {
          setBufferLoad(prev => Math.max(prev - 20, 0));
        }

        // Advance Video Progress
        setVideoProgress(prev => {
          if (prev >= 100) return 100;
          // Speed depends on CPU and QoS. 
          // If CPU is 100, we stutter heavily. If QoS is off, background download steals bandwidth.
          let stepAdv = 0;
          if (targetCpu >= 95) {
            stepAdv = Math.random() * 1; // Stuttering badly
          } else {
            stepAdv = qosEnabled ? Math.random() * 3 + 4 : Math.random() * 2 + 1; // Fast if QoS prioritized
          }
          return Math.min(prev + stepAdv, 100);
        });

      }, 200);
    }
    return () => clearInterval(interval);
  }, [isStreaming, tcpOffloadEnabled, qosEnabled]);

  // Stage Transitions based on Simulation
  useEffect(() => {
    if (isStreaming) {
      if (cpuLoad >= 98 && bufferLoad >= 90 && step === 'TRY_RAW') {
        // Fail state triggered
        setIsStreaming(false);
        if (playError) playError();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setStep('FAIL_CPU');
      }
      
      if (videoProgress >= 100 && step === 'OUTCOME') {
        setIsStreaming(false);
        if (playSuccess) playSuccess();
        setTimeout(reportComplete, 1500);
      }
    }
  }, [isStreaming, cpuLoad, bufferLoad, videoProgress, step, playError, playSuccess, reportComplete]);


  // Actions
  const startRawStream = () => {
    if (playClick) playClick();
    setStep('TRY_RAW');
    setIsStreaming(true);
    setVideoProgress(0);
    setBufferLoad(0);
    setCpuLoad(5);
  };

  const startOptimizedStream = () => {
    if (playClick) playClick();
    setStep('OUTCOME');
    setIsStreaming(true);
    setVideoProgress(0);
    setBufferLoad(0);
  };

  const toggleTcp = () => {
    if (step !== 'IMPROVE') return;
    if (playClick) playClick();
    setTcpOffloadEnabled(!tcpOffloadEnabled);
  };

  const toggleQos = () => {
    if (step !== 'IMPROVE') return;
    if (playClick) playClick();
    setQosEnabled(!qosEnabled);
  };

  const resetLab = () => {
    setStep('LEARN');
    setIsStreaming(false);
    setCpuLoad(5);
    setBufferLoad(0);
    setVideoProgress(0);
    setTcpOffloadEnabled(false);
    setQosEnabled(false);
    setMacAddress(null);
    setPhysicalMedia([]);
  };

  // Briefing mapping
  const briefings: Record<Step, string> = {
    LEARN: "Welcome to the Network Interface Card (NIC) lab. This chip is the bridge between your computer's digital software and the physical network.",
    INIT_MAC: "First, the NIC needs an identity. Click 'Burn MAC' to permanently laser-etch its unique physical address into the silicon.",
    INIT_MEDIUM: "Next, how will data travel? Select a physical medium to bridge the digital code into physical signals.",
    TRY_RAW: "The NIC is initialized. Now, let's try to stream a 4K video while downloading a game update. Start the raw stream.",
    FAIL_CPU: "CRASH! The main CPU is overloaded at 100%. Processing millions of raw packets manually causes the video to lag and buffer.",
    UNDERSTAND: "The main CPU is too busy acting as a mail clerk. We need to delegate this work directly to the NIC hardware.",
    IMPROVE: "Enable the TCP/IP Offload Engine to handle packets, and turn on QoS to prioritize video over background downloads.",
    OUTCOME: "Perfect! By offloading the network stack to the NIC, the CPU is free, and the 4K stream runs flawlessly."
  };

  return (
    <LabShell 
      labId="networkinterface31"
      bgOverride="bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50"
      title="Network Interface Cards" 
      instruction="Configure the NIC hardware protocol stack to rescue the video stream."
      compact={true}
      onReset={resetLab}
    >
      <div className={`flex flex-col h-full w-full gap-3 px-2 py-3 md:py-4 ${isShaking ? 'animate-shake' : ''}`}>
        
        {/* HUD - Top Bar */}
        <div className="flex flex-col md:flex-row gap-2 shrink-0">
          {/* Step Tracker */}
          <div className="flex-[2] lg:flex-[2.5] bg-white rounded-xl p-2 md:p-2.5 border-2 border-slate-100 flex items-center shadow-sm overflow-hidden min-h-0">
            <div className="flex items-center gap-1 lg:gap-1.5 px-1 overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {STEPS.map((s, idx) => {
                const isActive = step === s.id;
                const isPast = STEPS.findIndex(x => x.id === step) > idx;
                return (
                  <React.Fragment key={s.id}>
                    <div className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                      isActive ? 'bg-indigo-900 text-white shadow-md' :
                      isPast ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400 border border-slate-200/60'
                    }`}>
                      {s.label}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`h-0.5 w-1.5 lg:w-2 shrink-0 rounded-full ${isPast ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* Briefing Panel */}
          <div className="flex-1 md:max-w-[320px] lg:max-w-[380px] bg-sky-50 border-2 border-sky-100/70 rounded-xl p-2.5 shadow-sm flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-sky-200/70 text-sky-700 flex items-center justify-center shrink-0 shadow-inner">
              <Info size={16} strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-bold text-slate-700 leading-snug">
                {briefings[step]}
              </p>
            </div>
          </div>
        </div>

        {/* Main Workspace - Split Screen */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">
          
          {/* LEFT: 3D NIC View */}
          <div className="w-full md:w-[60%] lg:w-[70%] flex-shrink-0 h-[40%] md:h-full bg-white rounded-xl border-2 border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-xs font-black text-slate-700 tracking-wider">NIC HARDWARE</h2>
            </div>
            
            <div className="flex-1 w-full h-full">
              <NetworkInterface3DScene 
                step={step}
                tcpOffloadEnabled={tcpOffloadEnabled}
                qosEnabled={qosEnabled}
                isStreaming={isStreaming}
                cpuOverloaded={cpuLoad > 95}
                macAddress={macAddress}
                physicalMedia={physicalMedia}
              />
            </div>
          </div>

          {/* RIGHT: Control Desk */}
          <div className="w-full md:flex-1 min-w-[320px] max-w-full lg:max-w-[500px] bg-white rounded-xl border-2 border-slate-100 shadow-sm p-4 md:p-5 flex flex-col gap-4 overflow-hidden min-h-0">
            
            {/* Action Bar */}
            {step === 'LEARN' && (
              <button 
                onClick={() => { if (playPop) playPop(); setStep('INIT_MAC'); }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98] shrink-0"
              >
                <Cpu size={18} />
                Initialize Factory Settings
              </button>
            )}

            {step === 'INIT_MAC' && (
              <button 
                onClick={() => { 
                  if (playGearGrind) playGearGrind(); 
                  setMacAddress('00:1A:C2:B0:55:09');
                  setTimeout(() => {
                    if (playPop) playPop();
                    setStep('INIT_MEDIUM');
                  }, 1500);
                }}
                disabled={macAddress !== null}
                className={`w-full rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all shadow-md shrink-0 ${
                  macAddress 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-200'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20 active:scale-[0.98]'
                }`}
              >
                <Zap size={18} fill="currentColor" />
                {macAddress ? 'Burning Silicon...' : 'Burn MAC Address'}
              </button>
            )}

            {step === 'INIT_MEDIUM' && (
              <div className="flex flex-col gap-3 shrink-0">
                <div className="grid grid-cols-3 gap-2">
                  {(['COPPER', 'FIBER', 'WIFI'] as const).map(med => {
                    const isSelected = physicalMedia.includes(med);
                    return (
                      <motion.button
                        key={med}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (playPop) playPop();
                          setPhysicalMedia(prev => 
                            isSelected ? prev.filter(m => m !== med) : [...prev, med]
                          );
                        }}
                        className={`rounded-xl p-2 flex flex-col items-center justify-center gap-1 text-[10px] font-black tracking-wider transition-all border-2 ${
                          isSelected
                            ? 'bg-sky-500 border-sky-600 text-white shadow-inner'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {med === 'COPPER' && <Network size={16} />}
                        {med === 'FIBER' && <Zap size={16} />}
                        {med === 'WIFI' && <Info size={16} />}
                        {med}
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {physicalMedia.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        if (playSuccess) playSuccess();
                        setStep('TRY_RAW');
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
                    >
                      Install Modules & Continue <ArrowRight size={18} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {step === 'TRY_RAW' && (
              <button 
                onClick={startRawStream}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98] shrink-0"
              >
                <Play size={18} fill="currentColor" />
                Start Video Stream (Raw)
              </button>
            )}

            {step === 'FAIL_CPU' && (
              <button 
                onClick={() => setStep('UNDERSTAND')}
                className="w-full bg-rose-100 hover:bg-rose-200 text-rose-700 border-2 border-rose-200 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] shrink-0"
              >
                <ShieldAlert size={18} />
                Investigate Crash
              </button>
            )}

            {step === 'UNDERSTAND' && (
              <button 
                onClick={() => setStep('IMPROVE')}
                className="w-full bg-sky-100 hover:bg-sky-200 text-sky-700 border-2 border-sky-200 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] shrink-0"
              >
                <Server size={18} />
                Configure Hardware Options
              </button>
            )}

            {step === 'IMPROVE' && (
              <button 
                onClick={startOptimizedStream}
                disabled={!tcpOffloadEnabled || !qosEnabled}
                className={`w-full rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider transition-all shadow-md shrink-0 ${
                  tcpOffloadEnabled && qosEnabled 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-[0.98]' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
                }`}
              >
                <Zap size={18} fill={tcpOffloadEnabled && qosEnabled ? "currentColor" : "none"} />
                Initialize Optimized Stream
              </button>
            )}

            {/* Stress Test UI - Hidden during Init */}
            {step !== 'LEARN' && step !== 'INIT_MAC' && step !== 'INIT_MEDIUM' && (
              <>
                <hr className="border-slate-100" />
                
                {/* Video Player Simulator */}
                <div className="bg-slate-900 rounded-xl p-2 relative overflow-hidden shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-2 pt-1">
                    <Video size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Stream 4K</span>
                  </div>
                  {/* Simulated Video Frame */}
                  <div className="w-full h-20 lg:h-24 bg-black rounded-lg relative overflow-hidden flex items-center justify-center">
                    {(cpuLoad > 95 || bufferLoad > 80) && isStreaming ? (
                      <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-black/80 z-10 backdrop-blur-sm">
                        <div className="w-8 h-8 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
                        <span className="text-rose-500 text-[10px] font-bold">BUFFERING...</span>
                      </div>
                    ) : isStreaming ? (
                      <div className="absolute inset-0 opacity-40">
                        <div className="w-full h-full bg-gradient-to-br from-cyan-900 to-blue-900 animate-pulse" />
                      </div>
                    ) : null}
                    <div className="text-xs text-slate-600 font-mono">
                      {videoProgress.toFixed(0)}% RECEIVED
                    </div>
                  </div>
                </div>

                {/* Gauges */}
                <div className="space-y-3 shrink-0">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Cpu size={12} /> System CPU Load
                      </span>
                      <span className={`text-xs font-black ${cpuLoad > 90 ? 'text-rose-500' : 'text-slate-700'}`}>
                        {cpuLoad.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-200 ${cpuLoad > 90 ? 'bg-rose-500' : 'bg-blue-500'}`}
                        style={{ width: `${cpuLoad}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Download size={12} /> Receive Buffer
                      </span>
                      <span className={`text-xs font-black ${bufferLoad > 80 ? 'text-rose-500' : 'text-slate-700'}`}>
                        {bufferLoad.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-200 ${bufferLoad > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                        style={{ width: `${bufferLoad}%` }}
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Hardware Toggles */}
                <div className="flex flex-col gap-1 min-h-0 shrink-0">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0">HARDWARE SETTINGS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        if (step === 'IMPROVE' || step === 'OUTCOME') {
                          if (playPop) playPop();
                          setTcpOffloadEnabled(!tcpOffloadEnabled);
                        }
                      }}
                      disabled={step !== 'IMPROVE' && step !== 'OUTCOME'}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                  tcpOffloadEnabled 
                    ? 'border-indigo-400 bg-indigo-50/50 shadow-sm' 
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                } ${step !== 'IMPROVE' && step !== 'OUTCOME' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className={`font-bold text-sm ${tcpOffloadEnabled ? 'text-indigo-900' : 'text-slate-700'}`}>TCP/IP Offload Engine</div>
                  <div className={`text-[10px] md:text-[11px] leading-tight mt-0.5 ${tcpOffloadEnabled ? 'text-indigo-700 font-medium' : 'text-slate-400'}`}>Shift packet framing to NIC hardware</div>
                </div>
                <div className={`w-10 h-5 md:w-12 md:h-6 rounded-full border-2 p-0.5 transition-colors ${
                  tcpOffloadEnabled ? 'bg-indigo-500 border-indigo-600' : 'bg-slate-200 border-slate-300'
                }`}>
                  <div className={`h-full aspect-square rounded-full bg-white shadow-sm transition-transform ${
                    tcpOffloadEnabled ? 'translate-x-[20px] md:translate-x-[24px]' : 'translate-x-0'
                  }`} />
                </div>
              </button>

              <button 
                onClick={() => {
                  if (step === 'IMPROVE' || step === 'OUTCOME') {
                    if (playPop) playPop();
                    setQosEnabled(!qosEnabled);
                  }
                }}
                disabled={step !== 'IMPROVE' && step !== 'OUTCOME'}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                  qosEnabled 
                    ? 'border-emerald-400 bg-emerald-50/50 shadow-sm' 
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                } ${step !== 'IMPROVE' && step !== 'OUTCOME' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className={`font-bold text-sm ${qosEnabled ? 'text-emerald-900' : 'text-slate-700'}`}>Quality of Service (QoS)</div>
                  <div className={`text-[10px] md:text-[11px] leading-tight mt-0.5 ${qosEnabled ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>Prioritize streaming video packets</div>
                </div>
                <div className={`w-10 h-5 md:w-12 md:h-6 rounded-full border-2 p-0.5 transition-colors ${
                  qosEnabled ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-200 border-slate-300'
                }`}>
                  <div className={`h-full aspect-square rounded-full bg-white shadow-sm transition-transform ${
                    qosEnabled ? 'translate-x-[20px] md:translate-x-[24px]' : 'translate-x-0'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </>
      )}

          </div>
        </div>

        {/* Success Modal / Outcome */}
        <AnimatePresence>
          {step === 'OUTCOME' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-50 bg-white/95 backdrop-blur-md border-2 border-emerald-100 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Hardware Optimization Complete!</h3>
                  <p className="text-sm text-slate-600 font-medium mb-4">
                    By offloading TCP/IP framing directly to the NIC hardware and enabling Quality of Service (QoS), you eliminated the CPU bottleneck and secured a flawless Gigabit video stream.
                  </p>
                  <button 
                    onClick={resetLab}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold text-sm transition-colors"
                  >
                    Reset & Replay
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Celebration 
        isActive={step === 'OUTCOME'} 
        message="NIC Protocol Stack Mastered!" 
        onReplay={resetLab} 
      />
    </LabShell>
  );
}