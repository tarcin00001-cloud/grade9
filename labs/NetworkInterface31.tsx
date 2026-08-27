"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Network, Server, Wifi, Radio, Zap, Sun, Package, ArrowRight, ArrowDown, Activity, AlertTriangle, ShieldCheck, CheckCircle2, RotateCcw, Cpu, Microchip, Power, PowerOff, Router, Laptop, Flame } from "lucide-react";

const LEVELS = [
  { id: 'assembly', title: 'Assembly', desc: 'Protocol Stack', icon: <Package size={12} /> },
  { id: 'physical', title: 'Physical', desc: 'Signal Conversion', icon: <Zap size={12} /> },
  { id: 'qos', title: 'QoS', desc: 'Traffic Shaping', icon: <Activity size={12} /> },
  { id: 'toe', title: 'TCP Offload', desc: 'Hardware Accel', icon: <Microchip size={12} /> },
  { id: 'wol', title: 'Wake-on-LAN', desc: 'Power Mngt', icon: <Power size={12} /> },
  { id: 'beam', title: 'Beamforming', desc: 'WiFi 6 Spatial', icon: <Router size={12} /> }
];

export default function NetworkInterface31() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // === Level 1: Assembly Line ===
  const [assemblyStage, setAssemblyStage] = useState(0);

  const handleAddHeader = (headerType: string) => {
    if (playClick) playClick();
    
    if (headerType === 'TCP' && assemblyStage === 0) {
      if (playPop) playPop();
      setAssemblyStage(1);
      setErrorMsg(null);
    } else if (headerType === 'IP' && assemblyStage === 1) {
      if (playPop) playPop();
      setAssemblyStage(2);
      setErrorMsg(null);
    } else if (headerType === 'MAC' && assemblyStage === 2) {
      if (playSuccess) playSuccess();
      setAssemblyStage(3);
      setErrorMsg(null);
    } else {
      if (playError) playError();
      setAssemblyStage(0);
      if (headerType === 'IP' && assemblyStage === 0) setErrorMsg("Wait! You need a Transport (TCP) header before adding Network (IP) routing.");
      else if (headerType === 'MAC' && assemblyStage < 2) setErrorMsg("Wait! MAC addresses (Data Link) wrap around the IP packet. Add IP first!");
      else if (headerType === 'TCP' && assemblyStage > 0) setErrorMsg("TCP is already added! Don't double-wrap.");
      else setErrorMsg("Incorrect order! Resetting assembly. Order is: Transport (TCP) -> Network (IP) -> Data Link (MAC).");
    }
  };

  // === Level 2: Physical Layer ===
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  
  const handleSignalClick = (signal: string) => {
    if (playClick) playClick();
    setSelectedSignal(signal);
    
    if (signal === 'radio') {
      if (playSuccess) playSuccess();
      setErrorMsg(null);
    } else {
      if (playError) playError();
      setErrorMsg("Incorrect! A WiFi Antenna cannot transmit light pulses or raw electricity. It needs Radio Waves!");
    }
  };

  // === Level 3: QoS Traffic Controller ===
  const [qos, setQos] = useState({ video: '', web: '', update: '' });

  const setPriority = (stream: 'video' | 'web' | 'update', priority: 'HIGH' | 'MED' | 'LOW') => {
    if (playClick) playClick();
    setQos(prev => ({ ...prev, [stream]: priority }));
    setErrorMsg(null);
  };

  const checkQoS = () => {
    if (!qos.video || !qos.web || !qos.update) {
      if (playError) playError();
      setErrorMsg("Assign a priority to all three streams first!");
      return;
    }

    if (qos.video === 'HIGH' && qos.web === 'MED' && qos.update === 'LOW') {
      if (playSuccess) playSuccess();
      setErrorMsg(null);
    } else if (qos.video !== 'HIGH') {
      if (playError) playError();
      setErrorMsg("The Live Video Call is lagging heavily! It requires HIGH priority for real-time latency.");
    } else if (qos.update === 'HIGH') {
      if (playError) playError();
      setErrorMsg("You are wasting HIGH priority bandwidth on a background OS update. The other streams are starving!");
    } else {
      if (playError) playError();
      setErrorMsg("Suboptimal configuration. Video needs highest, Web needs medium, and background Update should be lowest.");
    }
  };

  // === Level 4: TCP Offload Engine ===
  const [toeEnabled, setToeEnabled] = useState(false);
  const handleToggleTOE = () => {
    if (playClick) playClick();
    setToeEnabled(true);
    if (playSuccess) playSuccess();
    setErrorMsg(null);
  };

  // === Level 5: Wake-on-LAN ===
  const [wolPayload, setWolPayload] = useState<string[]>([]);
  const targetMac = "A1:B2:C3:D4:E5:F6";
  const broadcastMac = "FF:FF:FF:FF:FF:FF";

  const handleAddWol = (type: string) => {
    if (playClick) playClick();
    if (type === 'broadcast') {
      if (wolPayload.length === 0) {
        if (playPop) playPop();
        setWolPayload(['broadcast']);
        setErrorMsg(null);
      } else {
        if (playError) playError();
        setErrorMsg("The synchronization stream (Broadcast) must be at the VERY BEGINNING of the Magic Packet.");
        setWolPayload([]);
      }
    } else if (type === 'target') {
      if (wolPayload.length === 1 && wolPayload[0] === 'broadcast') {
        if (playSuccess) playSuccess();
        setWolPayload(['broadcast', 'target']);
        setErrorMsg(null);
      } else {
        if (playError) playError();
        setErrorMsg("You need the synchronization stream (Broadcast MAC) first before adding the target MACs!");
        setWolPayload([]);
      }
    } else if (type === 'random') {
      if (playError) playError();
      setErrorMsg("Random data corrupts the Magic Packet structure! Resetting payload.");
      setWolPayload([]);
    }
  };

  // === Level 6: Beamforming ===
  const [wifiMode, setWifiMode] = useState<'omni' | 'beam'>('omni');
  const [beamDir, setBeamDir] = useState<'left' | 'center' | 'right'>('center');

  const checkBeam = () => {
    if (wifiMode === 'beam' && beamDir === 'right') {
      if (playSuccess) playSuccess();
      setErrorMsg(null);
    } else if (wifiMode === 'omni') {
      if (playError) playError();
      setErrorMsg("Omnidirectional mode spreads the signal too thin! Enable Beamforming.");
    } else {
      if (playError) playError();
      setErrorMsg("You enabled beamforming, but the beam is pointing in the wrong direction!");
    }
  };

  // === General Helpers ===
  const nextLevel = () => {
    if (currentLevel + 1 >= LEVELS.length) {
      if (playZap) playZap();
      setWin(true);
    } else {
      if (playSuccess) playSuccess();
      setCurrentLevel(l => l + 1);
      setErrorMsg(null);
      resetCurrentLevel();
    }
  };

  const resetCurrentLevel = () => {
    if (playClick) playClick();
    setErrorMsg(null);
    if (currentLevel === 0) setAssemblyStage(0);
    if (currentLevel === 1) setSelectedSignal(null);
    if (currentLevel === 2) setQos({ video: '', web: '', update: '' });
    if (currentLevel === 3) setToeEnabled(false);
    if (currentLevel === 4) setWolPayload([]);
    if (currentLevel === 5) {
      setWifiMode('omni');
      setBeamDir('center');
    }
  };

  const isLevelComplete = () => {
    if (currentLevel === 0) return assemblyStage === 3;
    if (currentLevel === 1) return selectedSignal === 'radio';
    if (currentLevel === 2) return qos.video === 'HIGH' && qos.web === 'MED' && qos.update === 'LOW';
    if (currentLevel === 3) return toeEnabled;
    if (currentLevel === 4) return wolPayload.length === 2;
    if (currentLevel === 5) return wifiMode === 'beam' && beamDir === 'right';
    return false;
  };

  const getChallengeQuestion = () => {
    if (currentLevel === 0) return "Assemble the packet! Wrap the raw Payload by adding headers in the correct OSI sequence: Transport -> Network -> Data Link.";
    if (currentLevel === 1) return "Convert the digital frame into physical signals! Which signal type does a WiFi 6 Antenna use to transmit 0s and 1s?";
    if (currentLevel === 2) return "Configure Quality of Service (QoS)! Assign priorities so the Video Call doesn't lag while a background update downloads.";
    if (currentLevel === 3) return "The Server CPU is overloaded by network packets! Enable the TCP Offload Engine (TOE) on the NIC to handle it.";
    if (currentLevel === 4) return "Wake up the remote server! Construct a 'Magic Packet' by adding a Broadcast MAC (sync) followed by 16 copies of the Target MAC.";
    if (currentLevel === 5) return "The laptop has poor signal due to walls. Enable Beamforming and aim the signal directly at the laptop!";
    return "";
  };


  return (
    <LabShell
      labId="networkinterface31"
      title="Network Interface Cards"
      subtitle="Digital Communication Gateways"
      theme="cosmos"
      compact={true}
      onReset={() => {
        setCurrentLevel(0);
        setWin(false);
        resetCurrentLevel();
      }}
      instruction="1. Study the NIC Protocol Stack, Physical Signals, and Quality of Service (QoS). 2. Configure the simulated Network Interface Card for optimal data transmission. 3. Monitor the physical signals and packet flow across the network gateway. 4. Adjust the QoS settings to prioritize critical traffic during high congestion."
    >
      <Celebration isActive={win} onReplay={() => {
        setCurrentLevel(0);
        setWin(false);
        resetCurrentLevel();
      }} message="You successfully built packets, shaped traffic, offloaded TCP, and beamformed WiFi!" />

      {!win && (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto gap-1 p-1">
          
          {/* Level Progress */}
          <div className="flex gap-1 shrink-0 overflow-x-auto pb-1">
            {LEVELS.map((level, i) => (
              <div 
                key={level.id} 
                className={`flex-1 min-w-[60px] flex flex-col p-1.5 rounded-lg border transition-colors ${i === currentLevel ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm' : i < currentLevel ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}
              >
                <div className="flex flex-col lg:flex-row items-center lg:gap-1 mb-0.5">
                  {level.icon}
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-center lg:text-left leading-tight mt-0.5 lg:mt-0 truncate">{level.title}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Visualizer Area */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center p-2 relative overflow-hidden min-h-0">
            
            {/* Objective Box */}
            <div className="bg-slate-50 border border-indigo-200 p-2 rounded-lg w-full max-w-4xl text-center mb-2 shrink-0 z-20 shadow-sm">
               <h3 className="text-indigo-700 font-black uppercase tracking-widest text-[9px] mb-0.5">Current Objective</h3>
               <p className="text-slate-800 text-xs font-bold leading-tight">{getChallengeQuestion()}</p>
            </div>

            {/* The Visualization */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 relative z-10 overflow-hidden">
              
              {/* === Level 1: Assembly Line === */}
              {currentLevel === 0 && (
                <div className="flex flex-col w-full h-full items-center justify-around gap-2 px-4">
                  <div className="flex items-center justify-center gap-1 w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-xl p-4 h-32 shadow-inner">
                    <AnimatePresence>
                      {assemblyStage >= 3 && (
                        <motion.div key="mac" initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }} className="bg-emerald-600 border-2 border-emerald-400 text-emerald-100 font-black text-xs px-3 py-6 rounded-l-lg shadow-lg flex flex-col items-center gap-1">
                          <Network size={16} />
                          <span>MAC Header</span>
                        </motion.div>
                      )}
                      {assemblyStage >= 2 && (
                        <motion.div key="ip" initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }} className="bg-blue-600 border-2 border-blue-400 text-blue-100 font-black text-xs px-3 py-6 rounded shadow-lg flex flex-col items-center gap-1">
                          <Server size={16} />
                          <span>IP Header</span>
                        </motion.div>
                      )}
                      {assemblyStage >= 1 && (
                        <motion.div key="tcp" initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }} className="bg-purple-600 border-2 border-purple-400 text-purple-100 font-black text-xs px-3 py-6 rounded shadow-lg flex flex-col items-center gap-1">
                          <ShieldCheck size={16} />
                          <span>TCP Header</span>
                        </motion.div>
                      )}
                      <motion.div key="payload" layout className={`bg-slate-100 border-2 border-slate-300 text-slate-700 font-black text-xs px-6 py-6 shadow-lg flex flex-col items-center gap-1 ${assemblyStage > 0 ? 'rounded-r-lg' : 'rounded-lg'}`}>
                        <Package size={20} />
                        <span>Raw Payload</span>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <ArrowDown className="text-slate-600 animate-bounce" size={24} />
                  <div className="flex gap-4">
                    <button onClick={() => handleAddHeader('TCP')} disabled={assemblyStage > 0} className={`flex flex-col items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 transition-all ${assemblyStage > 0 ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50' : 'bg-purple-50 border-purple-400 text-purple-700 hover:bg-purple-100 hover:scale-105 active:scale-95'}`}>
                      <ShieldCheck size={24} />
                      <span className="text-[10px] uppercase">Add TCP (Transport)</span>
                    </button>
                    <button onClick={() => handleAddHeader('IP')} disabled={assemblyStage > 1} className={`flex flex-col items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 transition-all ${assemblyStage > 1 ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50' : 'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100 hover:scale-105 active:scale-95'}`}>
                      <Server size={24} />
                      <span className="text-[10px] uppercase">Add IP (Network)</span>
                    </button>
                    <button onClick={() => handleAddHeader('MAC')} disabled={assemblyStage > 2} className={`flex flex-col items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 transition-all ${assemblyStage > 2 ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50' : 'bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:scale-105 active:scale-95'}`}>
                      <Network size={24} />
                      <span className="text-[10px] uppercase">Add MAC (Data Link)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === Level 2: Physical Layer === */}
              {currentLevel === 1 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-4">
                  <div className="flex items-center gap-8 w-full max-w-3xl justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-emerald-100 border-2 border-emerald-400 p-4 rounded-xl flex items-center justify-center">
                        <span className="font-mono text-emerald-800 font-bold tracking-[0.2em] text-lg">01101011</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Digital Frame</span>
                    </div>
                    <ArrowRight className="text-slate-600" size={32} />
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-indigo-100 border-2 border-indigo-400 p-4 rounded-full shadow-sm flex items-center justify-center relative">
                        <Wifi size={40} className="text-indigo-700" />
                        {selectedSignal === 'radio' && (
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.5, opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 border-4 border-indigo-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">WiFi 6 Antenna</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleSignalClick('light')} className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl font-bold border-2 transition-all ${selectedSignal === 'light' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-white border-slate-200 text-slate-500 hover:border-yellow-400 hover:text-yellow-600 active:scale-95'}`}>
                      <Sun size={32} />
                      <span className="text-[10px] uppercase tracking-widest">Light Pulses</span>
                    </button>
                    <button onClick={() => handleSignalClick('electric')} className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl font-bold border-2 transition-all ${selectedSignal === 'electric' ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:border-amber-400 hover:text-amber-600 active:scale-95'}`}>
                      <Zap size={32} />
                      <span className="text-[10px] uppercase tracking-widest">Electrical Signals</span>
                    </button>
                    <button onClick={() => handleSignalClick('radio')} className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl font-bold border-2 transition-all ${selectedSignal === 'radio' ? 'bg-indigo-50 border-indigo-400 text-indigo-700 scale-105 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 active:scale-95'}`}>
                      <Radio size={32} />
                      <span className="text-[10px] uppercase tracking-widest">Radio Waves</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === Level 3: QoS Traffic Controller === */}
              {currentLevel === 2 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-2">
                  <div className="w-full max-w-2xl flex flex-col gap-3">
                    {/* Video Call Stream */}
                    <div className={`flex items-center justify-between bg-white border rounded-xl p-3 transition-colors ${qos.video === 'HIGH' ? 'border-emerald-500 shadow-sm bg-emerald-50' : qos.video ? 'border-slate-300' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-3 w-1/3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><Activity size={24} /></div>
                        <div>
                          <div className="text-slate-800 font-black text-sm">Live Video Call</div>
                          <div className="text-[9px] text-blue-700 uppercase font-bold tracking-widest">Latency Sensitive</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setPriority('video', 'HIGH')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.video === 'HIGH' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>HIGH</button>
                        <button onClick={() => setPriority('video', 'MED')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.video === 'MED' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>MED</button>
                        <button onClick={() => setPriority('video', 'LOW')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.video === 'LOW' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>LOW</button>
                      </div>
                    </div>
                    {/* Web Browsing Stream */}
                    <div className={`flex items-center justify-between bg-white border rounded-xl p-3 transition-colors ${qos.web === 'MED' ? 'border-amber-500 shadow-sm bg-amber-50' : qos.web ? 'border-slate-300' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-3 w-1/3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700"><Network size={24} /></div>
                        <div>
                          <div className="text-slate-800 font-black text-sm">Web Browsing</div>
                          <div className="text-[9px] text-indigo-700 uppercase font-bold tracking-widest">Standard Traffic</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setPriority('web', 'HIGH')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.web === 'HIGH' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>HIGH</button>
                        <button onClick={() => setPriority('web', 'MED')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.web === 'MED' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>MED</button>
                        <button onClick={() => setPriority('web', 'LOW')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.web === 'LOW' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>LOW</button>
                      </div>
                    </div>
                    {/* OS Update Stream */}
                    <div className={`flex items-center justify-between bg-white border rounded-xl p-3 transition-colors ${qos.update === 'LOW' ? 'border-red-500 shadow-sm bg-red-50' : qos.update ? 'border-slate-300' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-3 w-1/3">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-700"><Server size={24} /></div>
                        <div>
                          <div className="text-slate-800 font-black text-sm">Background OS Update</div>
                          <div className="text-[9px] text-purple-700 uppercase font-bold tracking-widest">Large File</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setPriority('update', 'HIGH')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.update === 'HIGH' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>HIGH</button>
                        <button onClick={() => setPriority('update', 'MED')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.update === 'MED' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>MED</button>
                        <button onClick={() => setPriority('update', 'LOW')} className={`px-4 py-1.5 rounded font-black text-[10px] border transition-colors ${qos.update === 'LOW' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>LOW</button>
                      </div>
                    </div>
                  </div>
                  <button onClick={checkQoS} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95">
                    Apply QoS Policy
                  </button>
                </div>
              )}

              {/* === Level 4: TCP Offload Engine === */}
              {currentLevel === 3 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-4">
                  <div className="flex items-center gap-6 w-full max-w-4xl justify-center px-4">
                    
                    {/* Server Box */}
                    <div className={`flex-1 flex flex-col items-center gap-4 border-4 rounded-2xl p-6 transition-colors duration-1000 ${toeEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <h4 className="text-slate-800 font-black text-xl tracking-widest uppercase">Server Core</h4>
                      
                      <div className="flex gap-4 w-full justify-center relative">
                        {/* CPU */}
                        <motion.div 
                          animate={toeEnabled ? { x: 0 } : { x: [-2, 2, -2, 2, 0] }}
                          transition={toeEnabled ? {} : { repeat: Infinity, duration: 0.2 }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 w-32 relative ${toeEnabled ? 'bg-white border-emerald-300' : 'bg-white border-red-300'}`}
                        >
                          <Cpu size={40} className={toeEnabled ? 'text-emerald-600' : 'text-red-600'} />
                          <div className="text-center">
                            <div className="text-[10px] uppercase font-bold text-slate-500">System CPU</div>
                            <div className={`text-xl font-black ${toeEnabled ? 'text-emerald-600' : 'text-red-600'}`}>{toeEnabled ? '12%' : '99%'}</div>
                          </div>
                          {!toeEnabled && <Flame size={16} className="text-orange-500 absolute top-2 right-2 animate-pulse" />}
                        </motion.div>

                        {/* NIC */}
                        <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 w-32 transition-colors duration-1000 ${toeEnabled ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-white border-slate-200'}`}>
                          <Microchip size={40} className={toeEnabled ? 'text-indigo-600' : 'text-slate-500'} />
                          <div className="text-center">
                            <div className="text-[10px] uppercase font-bold text-slate-500">NIC Hardware</div>
                            <div className={`text-xl font-black ${toeEnabled ? 'text-indigo-600' : 'text-slate-500'}`}>{toeEnabled ? 'Active' : 'Idle'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleToggleTOE}
                    disabled={toeEnabled}
                    className={`mt-4 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest border-4 transition-all ${toeEnabled ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-amber-600 border-amber-400 text-amber-100 hover:bg-amber-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]'}`}
                  >
                    {toeEnabled ? 'TCP Offload Enabled' : 'Enable TCP Offload Engine (TOE)'}
                  </button>
                </div>
              )}

              {/* === Level 5: Wake-on-LAN === */}
              {currentLevel === 4 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-2 px-4">
                  
                  {/* Remote Server Status */}
                  <div className="flex items-center justify-center gap-6 bg-slate-50 border border-slate-200 p-6 rounded-2xl w-full max-w-2xl">
                    <div className={`p-4 rounded-full border-4 transition-colors ${wolPayload.length === 2 ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                      {wolPayload.length === 2 ? <Power size={40} /> : <PowerOff size={40} />}
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-black text-xl uppercase tracking-widest">Remote Server</h3>
                      <div className="text-slate-600 font-mono text-xs mt-1">MAC: {targetMac}</div>
                      <div className={`font-bold mt-2 transition-colors ${wolPayload.length === 2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {wolPayload.length === 2 ? 'Status: ONLINE (Waking up...)' : 'Status: ASLEEP (S5 Power State)'}
                      </div>
                    </div>
                  </div>

                  {/* Packet Payload Builder */}
                  <div className="flex flex-col items-center gap-2 w-full max-w-2xl">
                    <div className="text-[10px] font-black uppercase text-indigo-700 tracking-widest">Magic Packet Payload Builder</div>
                    <div className="flex gap-2 bg-white border border-indigo-200 p-2 rounded-xl h-24 w-full items-center px-4 overflow-hidden shadow-inner">
                      <AnimatePresence>
                        {wolPayload.length === 0 && (
                          <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-slate-400 font-bold text-xs uppercase tracking-widest mx-auto">Empty Payload</motion.div>
                        )}
                        {wolPayload.includes('broadcast') && (
                          <motion.div key="sync" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-purple-100 border border-purple-300 text-purple-800 font-mono text-[9px] p-2 rounded shrink-0">
                            Sync Stream:<br/>{broadcastMac}
                          </motion.div>
                        )}
                        {wolPayload.includes('target') && (
                          <motion.div key="target" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-sky-100 border border-sky-300 text-sky-800 font-mono text-[9px] p-2 rounded flex-1">
                            Target x16:<br/>{targetMac} {targetMac} ...
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button onClick={() => handleAddWol('broadcast')} disabled={wolPayload.length > 0} className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border-2 transition-all ${wolPayload.length > 0 ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-purple-50 border-purple-400 text-purple-700 hover:bg-purple-100 hover:scale-105'}`}>
                      1. Add Sync Stream<br/><span className="text-[8px] opacity-70">6 bytes of FF</span>
                    </button>
                    <button onClick={() => handleAddWol('target')} disabled={wolPayload.includes('target')} className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border-2 transition-all ${wolPayload.includes('target') ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-sky-50 border-sky-400 text-sky-700 hover:bg-sky-100 hover:scale-105'}`}>
                      2. Add Target MAC<br/><span className="text-[8px] opacity-70">16 copies</span>
                    </button>
                    <button onClick={() => handleAddWol('random')} disabled={wolPayload.length === 2} className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border-2 transition-all ${wolPayload.length === 2 ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-rose-50 border-rose-400 text-rose-700 hover:bg-rose-100 hover:scale-105'}`}>
                      Add Random Data<br/><span className="text-[8px] opacity-70">Corrupts packet</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === Level 6: Beamforming === */}
              {currentLevel === 5 && (
                <div className="flex flex-col w-full h-full items-center justify-around py-4">
                  
                  {/* Spatial Map */}
                  <div className="relative w-full max-w-2xl h-48 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex justify-center items-end pb-4 shadow-inner">
                    
                    {/* Obstacle (Wall) on the left */}
                    <div className="absolute left-16 top-0 bottom-0 w-8 bg-slate-300 border-x-4 border-slate-400 opacity-80" />

                    {/* Target Laptop (Top Right) */}
                    <div className="absolute top-6 right-16 flex flex-col items-center">
                      <Laptop size={32} className={wifiMode === 'beam' && beamDir === 'right' ? 'text-emerald-500 drop-shadow-sm transition-all duration-500' : 'text-slate-500 transition-all duration-500'} />
                      <div className={`mt-1 font-black text-[10px] uppercase transition-colors duration-500 ${wifiMode === 'beam' && beamDir === 'right' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {wifiMode === 'beam' && beamDir === 'right' ? 'Strong Signal' : 'Weak Signal'}
                      </div>
                    </div>

                    {/* Router (Bottom Center) */}
                    <div className="relative z-10 flex flex-col items-center">
                      <Router size={40} className="text-indigo-600" />
                      
                      {/* Signals */}
                      <AnimatePresence>
                        {wifiMode === 'omni' && (
                          <motion.div 
                            key="omni"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [1, 3, 5], opacity: [0.6, 0.2, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -inset-10 border-4 border-indigo-400 rounded-full"
                          />
                        )}
                        {wifiMode === 'beam' && (
                          <motion.div 
                            key="beam"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 300, opacity: [0.8, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            style={{ originY: 1 }}
                            className={`absolute bottom-8 w-24 bg-gradient-to-t from-indigo-500 to-transparent clip-path-cone transition-transform duration-500 origin-bottom ${beamDir === 'left' ? '-rotate-45 -ml-16' : beamDir === 'right' ? 'rotate-45 ml-16' : ''}`}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-8 w-full max-w-2xl px-4 mt-2">
                    {/* Mode Toggle */}
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest text-center">Transmission Mode</div>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => { setWifiMode('omni'); if(playClick) playClick(); }} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded ${wifiMode === 'omni' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>Omnidirectional</button>
                        <button onClick={() => { setWifiMode('beam'); if(playClick) playClick(); }} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded ${wifiMode === 'beam' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>Beamforming</button>
                      </div>
                    </div>

                    {/* Direction Toggle */}
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest text-center">Beam Direction</div>
                      <div className="flex bg-slate-100 p-1 rounded-lg transition-opacity duration-300">
                        <button onClick={() => { setBeamDir('left'); if(playClick) playClick(); }} disabled={wifiMode !== 'beam'} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded ${beamDir === 'left' && wifiMode === 'beam' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'} disabled:opacity-30 disabled:cursor-not-allowed`}>Left</button>
                        <button onClick={() => { setBeamDir('center'); if(playClick) playClick(); }} disabled={wifiMode !== 'beam'} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded ${beamDir === 'center' && wifiMode === 'beam' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'} disabled:opacity-30 disabled:cursor-not-allowed`}>Center</button>
                        <button onClick={() => { setBeamDir('right'); if(playClick) playClick(); }} disabled={wifiMode !== 'beam'} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded ${beamDir === 'right' && wifiMode === 'beam' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'} disabled:opacity-30 disabled:cursor-not-allowed`}>Right</button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={checkBeam}
                    className="mt-4 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Apply Network Configuration
                  </button>

                </div>
              )}

            </div>

            {/* Error Message Box */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-4 bg-red-950 px-4 py-2 rounded-xl border-2 border-red-500 shadow-xl max-w-lg text-center z-30"
                >
                  <p className="text-xs font-bold text-red-200 tracking-wide flex items-center justify-center gap-2">
                    <AlertTriangle size={16} className="text-red-400" />
                    {errorMsg}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0 mt-1">
            <button 
              onClick={resetCurrentLevel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-[10px]"
            >
              <RotateCcw size={14} /> Reset Level
            </button>
            
            {isLevelComplete() ? (
              <motion.button 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={nextLevel}
                className="flex items-center gap-1.5 px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <CheckCircle2 size={16} /> {currentLevel === LEVELS.length - 1 ? 'Finish Lab' : 'Next Level'}
              </motion.button>
            ) : (
              <div className="px-6 py-2 font-black text-xs text-slate-500 uppercase tracking-widest">
                Awaiting Input...
              </div>
            )}
          </div>
          
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .clip-path-cone {
          clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
      `}} />
    </LabShell>
  );
}
