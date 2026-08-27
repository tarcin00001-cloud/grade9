"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Unplug, Zap, Cpu, Mouse, Keyboard, Printer, HardDrive, Camera, Monitor, Smartphone, BatteryCharging, CheckCircle2, RotateCcw, Link2 } from "lucide-react";

const LEVELS = [
  { id: '1990s', title: '1990s Chaos', desc: 'Legacy ports', icon: <Unplug size={12} /> },
  { id: 'design', title: 'Design USB', desc: 'Universal', icon: <Cpu size={12} /> },
  { id: 'modern', title: 'Plug & Play', desc: 'One cable', icon: <Zap size={12} /> },
  { id: 'compat', title: 'Compatibility', desc: 'Old meets new', icon: <Link2 size={12} /> },
  { id: 'usbc', title: 'USB-C Era', desc: 'The ultimate', icon: <BatteryCharging size={12} /> }
];

type DeviceType = 'printer' | 'keyboard' | 'mouse' | 'harddrive' | 'webcam' | 'tablet' | 'webcam4k' | 'usb1_mouse' | 'usb3_hdd' | 'usbc_monitor' | 'usbc_phone' | 'usbc_charger';

export default function USBConnectivity25() {
  const { playClick, playPop, playSuccess, playError, playZap } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // === Level 1: 1990s Chaos ===
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [legacyConnections, setLegacyConnections] = useState<{ [key in DeviceType]?: string }>({});

  const handleLegacyPortClick = (portType: string) => {
    if (!selectedDevice) {
      if (playError) playError();
      setErrorMsg("Click a device first to pick up its cable, then click a port to connect it.");
      return;
    }
    
    let isCorrect = false;
    if (selectedDevice === 'printer' && portType === 'Parallel') isCorrect = true;
    if (selectedDevice === 'keyboard' && portType === 'PS/2') isCorrect = true;
    if (selectedDevice === 'mouse' && portType === 'Serial') isCorrect = true;

    if (!isCorrect) {
      if (playError) playError();
      setErrorMsg(`Incompatible port! You cannot plug a ${selectedDevice} into a ${portType} port. This was the frustration of the 1990s!`);
      setSelectedDevice(null);
      return;
    }

    if (playPop) playPop();
    setLegacyConnections(prev => ({ ...prev, [selectedDevice]: portType }));
    setSelectedDevice(null);
    setErrorMsg(null);

    if (Object.keys(legacyConnections).length === 2) {
      if (playSuccess) playSuccess();
    }
  };

  // === Level 2: Design USB ===
  const [usbFeatures, setUsbFeatures] = useState({ power: false, speed: false, auto: false });
  
  const handleFeatureToggle = (feature: keyof typeof usbFeatures) => {
    if (playClick) playClick();
    setUsbFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const checkUSBStandard = () => {
    if (!usbFeatures.power) {
      if (playError) playError();
      setErrorMsg("The Webcam failed! It needs ELECTRICAL POWER delivery to turn on.");
      return;
    }
    if (!usbFeatures.speed) {
      if (playError) playError();
      setErrorMsg("The Hard Drive is too slow! It needs HIGH-SPEED DATA transfer to copy files.");
      return;
    }
    if (!usbFeatures.auto) {
      if (playError) playError();
      setErrorMsg("The User is confused! The Mouse isn't working because they don't have the right drivers. We need AUTO-RECOGNITION.");
      return;
    }

    if (playSuccess) playSuccess();
    setErrorMsg(null);
    nextLevel();
  };

  // === Level 3 & 4 & 5: USB Connections ===
  const [usbConnections, setUsbConnections] = useState<{ [key in DeviceType]?: string }>({});
  
  const handleUSBPortClick = (portId: string) => {
    if (!selectedDevice) {
      if (playError) playError();
      setErrorMsg("Click a device first, then click a port!");
      return;
    }

    if (Object.values(usbConnections).includes(portId)) {
      if (playError) playError();
      setErrorMsg("That port is already in use.");
      return;
    }

    // Level 3 logic (Generations)
    if (currentLevel === 2) {
      if (selectedDevice === 'webcam4k' && portId !== 'USB-Blue') {
        if (playError) playError();
        setErrorMsg("Error: Video is lagging! The 4K Webcam needs the High-Speed USB 3.0 (Blue) port.");
        setSelectedDevice(null);
        return;
      }
      if (selectedDevice === 'tablet' && portId !== 'USB-Red') {
        if (playError) playError();
        setErrorMsg("Error: Not enough power! The Tablet needs the High-Power (Red) port to charge.");
        setSelectedDevice(null);
        return;
      }
      if (selectedDevice === 'keyboard' && portId !== 'USB-Black') {
        if (playError) playError();
        setErrorMsg("It works, but you are wasting a high-performance port! Plug the basic Keyboard into the standard USB 2.0 (Black) port.");
        setSelectedDevice(null);
        return;
      }
    }

    if (playPop) playPop();
    setUsbConnections(prev => ({ ...prev, [selectedDevice]: portId }));
    setSelectedDevice(null);
    setErrorMsg(null);

    const targetCount = currentLevel === 2 ? 3 : currentLevel === 3 ? 2 : 3;
    if (Object.keys(usbConnections).length === targetCount - 1) {
      if (playSuccess) playSuccess();
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
    setSelectedDevice(null);
    setLegacyConnections({});
    setUsbConnections({});
  };

  const resetGame = () => {
    if (playClick) playClick();
    setCurrentLevel(0);
    setWin(false);
    setErrorMsg(null);
    setSelectedDevice(null);
    setLegacyConnections({});
    setUsbConnections({});
    setUsbFeatures({ power: false, speed: false, auto: false });
  };

  const isLevelComplete = () => {
    if (currentLevel === 0) return Object.keys(legacyConnections).length === 3;
    if (currentLevel === 1) return usbFeatures.power && usbFeatures.speed && usbFeatures.auto;
    if (currentLevel === 2) return Object.keys(usbConnections).length === 3;
    if (currentLevel === 3) return Object.keys(usbConnections).length === 2;
    if (currentLevel === 4) return Object.keys(usbConnections).length === 3;
    return false;
  };

  const getChallengeQuestion = () => {
    if (currentLevel === 0) return "Connect all 3 devices to the 1990s PC. You must match the specific cable to the exact port!";
    if (currentLevel === 1) return "Design the USB! Select the necessary features to support Power, Data, and Plug&Play.";
    if (currentLevel === 2) return "USB evolved! Match the devices to the correct port colors: Blue (Speed), Red (Power), Black (Basic).";
    if (currentLevel === 3) return "Backward Compatibility! Plug BOTH the old USB 1.0 Mouse AND the new USB 3.0 Drive into the USB 3.0 ports.";
    if (currentLevel === 4) return "The Ultimate USB-C! Connect the Monitor (Display), Phone (Data), and Charger (Power) into the identical USB-C ports.";
    return "";
  };


  return (
    <LabShell
      labId="usbconnectivity25"
      title="Ajay Bhatt & The USB"
      subtitle="Universal Connectivity"
      theme="cosmos"
      compact={true}
      onReset={resetGame}
      instruction="1. Explore the historical context of legacy cable chaos before the USB. 2. Engage with the interactive simulation to design the Universal Serial Bus architecture. 3. Test the plug-and-play functionality and data transfer rates. 4. Complete the design challenge by connecting multiple peripherals successfully."
    >
      <Celebration isActive={win} onReplay={resetGame} message="You successfully transitioned from legacy chaos to the ultimate USB-C standard!" />

      {!win && (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto gap-2 p-1">
          
          {/* Level Progress */}
          <div className="flex gap-1 shrink-0">
            {LEVELS.map((level, i) => (
              <div 
                key={level.id} 
                className={`flex-1 flex flex-col p-1.5 rounded-lg border-2 transition-colors ${i === currentLevel ? 'bg-indigo-100 border-indigo-400 text-indigo-900 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : i < currentLevel ? 'bg-emerald-50 border-emerald-500/30 text-emerald-600' : 'bg-white border-slate-300 text-slate-500'}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {level.icon}
                  <span className="text-[9px] font-black uppercase tracking-tighter truncate">{level.title}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Visualizer Area */}
          <div className="flex-1 bg-white rounded-2xl border-2 border-slate-700/50 shadow-2xl flex flex-col items-center p-2 relative overflow-hidden min-h-0">
            
            {/* Objective Box */}
            <div className="bg-indigo-50 border-2 border-indigo-500/50 p-1.5 rounded-lg w-full max-w-4xl text-center mb-1 shrink-0 z-20">
               <h3 className="text-indigo-600 font-black uppercase tracking-widest text-[9px] mb-0.5">Current Objective</h3>
               <p className="text-slate-900 text-xs font-bold leading-tight">{getChallengeQuestion()}</p>
            </div>

            {/* The Visualization */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 relative z-10 overflow-hidden">
              
              {/* === Level 1: 1990s Chaos === */}
              {currentLevel === 0 && (
                <div className="flex flex-col w-full h-full justify-around items-center gap-2 py-2">
                  
                  {/* PC Back Panel */}
                  <div className="bg-slate-300 p-2 rounded-xl border-4 border-slate-400 flex gap-6 items-center shadow-inner relative mt-4">
                    <div className="text-slate-800 font-black uppercase tracking-widest text-[10px] absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-200 px-2 rounded-full border-2 border-slate-400 whitespace-nowrap">1990s PC Back Panel</div>
                    
                    <button onClick={() => handleLegacyPortClick('Parallel')} className="flex flex-col items-center gap-1 group mt-2">
                      <div className={`w-16 h-6 bg-pink-600 rounded-sm border-2 border-pink-800 flex flex-wrap gap-0.5 p-0.5 justify-center items-center shadow-inner ${Object.values(legacyConnections).includes('Parallel') ? 'opacity-50 pointer-events-none' : 'group-hover:scale-110 cursor-pointer'}`}>
                        {Array.from({length: 12}).map((_, i) => <div key={i} className="w-1 h-1 bg-pink-900 rounded-full" />)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">Parallel</span>
                    </button>
                    
                    <button onClick={() => handleLegacyPortClick('Serial')} className="flex flex-col items-center gap-1 group mt-2">
                      <div className={`w-10 h-8 bg-teal-600 rounded-b-lg border-2 border-teal-800 flex flex-wrap gap-0.5 p-0.5 justify-center items-center shadow-inner ${Object.values(legacyConnections).includes('Serial') ? 'opacity-50 pointer-events-none' : 'group-hover:scale-110 cursor-pointer'}`}>
                        {Array.from({length: 9}).map((_, i) => <div key={i} className="w-1 h-1 bg-teal-900 rounded-full" />)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">Serial</span>
                    </button>
                    
                    <button onClick={() => handleLegacyPortClick('PS/2')} className="flex flex-col items-center gap-1 group mt-2">
                      <div className={`w-8 h-8 bg-purple-600 rounded-full border-2 border-purple-800 flex flex-wrap gap-0.5 p-0.5 justify-center items-center shadow-inner ${Object.values(legacyConnections).includes('PS/2') ? 'opacity-50 pointer-events-none' : 'group-hover:scale-110 cursor-pointer'}`}>
                        {Array.from({length: 6}).map((_, i) => <div key={i} className="w-1 h-1 bg-purple-900 rounded-full" />)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">PS/2</span>
                    </button>
                  </div>

                  {/* Devices */}
                  <div className="flex gap-4">
                    {(['printer', 'mouse', 'keyboard'] as DeviceType[]).map(device => {
                      const isConnected = legacyConnections[device];
                      const isSelected = selectedDevice === device;
                      const Icon = device === 'printer' ? Printer : device === 'mouse' ? Mouse : Keyboard;
                      
                      return (
                        <div key={device} className="flex flex-col items-center gap-1">
                          {isConnected ? (
                            <div className="text-emerald-400 font-bold text-[9px] uppercase flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded-full"><CheckCircle2 size={10}/> {isConnected}</div>
                          ) : (
                            <div className="h-4" /> 
                          )}
                          <button 
                            onClick={() => { if(!isConnected) setSelectedDevice(device); if(playClick) playClick(); }}
                            disabled={!!isConnected}
                            className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${isConnected ? 'bg-slate-100 border-emerald-500/50 text-slate-400 opacity-50' : isSelected ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-500'}`}
                          >
                            <Icon size={24} />
                            <span className="text-[9px] font-black uppercase">{device}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* === Level 2: Design USB === */}
              {currentLevel === 1 && (
                <div className="flex w-full h-full items-center justify-center gap-8 px-4">
                  
                  {/* Control Panel */}
                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-indigo-500 shadow-2xl flex flex-col gap-3 flex-1 max-w-sm">
                    <h2 className="text-slate-900 font-black text-sm text-center uppercase tracking-wider">Universal Architect</h2>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: 'power', label: 'Power Delivery (VBUS)', desc: 'Provides electricity' },
                        { id: 'speed', label: 'High-Speed Data (D+/D-)', desc: 'Fast file transfer' },
                        { id: 'auto', label: 'Auto-Recognition', desc: 'Plug and play' }
                      ].map(feature => (
                        <button
                          key={feature.id}
                          onClick={() => handleFeatureToggle(feature.id as keyof typeof usbFeatures)}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${usbFeatures[feature.id as keyof typeof usbFeatures] ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-300 hover:border-indigo-500'}`}
                        >
                          <div className="text-left">
                            <div className={`font-bold text-xs ${usbFeatures[feature.id as keyof typeof usbFeatures] ? 'text-emerald-600' : 'text-slate-600'}`}>{feature.label}</div>
                            <div className="text-[9px] text-slate-500 font-medium">{feature.desc}</div>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${usbFeatures[feature.id as keyof typeof usbFeatures] ? 'bg-emerald-500 border-emerald-400 text-slate-900' : 'border-slate-400'}`}>
                            {usbFeatures[feature.id as keyof typeof usbFeatures] && <CheckCircle2 size={12} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Devices Waiting */}
                  <div className="flex flex-col gap-2 flex-1 max-w-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-300 flex items-center gap-3">
                      <Camera className="text-slate-500" size={20} />
                      <div>
                        <div className="text-slate-900 font-bold text-xs">Webcam</div>
                        <div className="text-[9px] text-amber-600 font-bold uppercase">Needs Power</div>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300 flex items-center gap-3">
                      <HardDrive className="text-slate-500" size={20} />
                      <div>
                        <div className="text-slate-900 font-bold text-xs">External Drive</div>
                        <div className="text-[9px] text-sky-600 font-bold uppercase">Needs High-Speed</div>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300 flex items-center gap-3">
                      <Mouse className="text-slate-500" size={20} />
                      <div>
                        <div className="text-slate-900 font-bold text-xs">Mouse</div>
                        <div className="text-[9px] text-fuchsia-600 font-bold uppercase">Needs Auto-Recognition</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* === Level 3: Plug & Play / Generations === */}
              {currentLevel === 2 && (
                <div className="flex flex-col w-full h-full justify-around items-center gap-2 py-2">
                  
                  {/* PC Back Panel */}
                  <div className="bg-slate-300 p-3 rounded-xl border-4 border-slate-400 flex gap-6 items-center shadow-inner relative mt-4">
                    <div className="text-slate-800 font-black uppercase tracking-widest text-[10px] absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-200 px-2 rounded-full border-2 border-slate-400 text-center whitespace-nowrap">USB Generations</div>
                    
                    {[
                      { id: 'USB-Black', color: 'bg-slate-800', label: 'USB 2.0', border: 'border-slate-900' },
                      { id: 'USB-Blue', color: 'bg-blue-600', label: 'USB 3.0', border: 'border-blue-800' },
                      { id: 'USB-Red', color: 'bg-red-600', label: 'Power', border: 'border-red-800' }
                    ].map(port => (
                      <button key={port.id} onClick={() => handleUSBPortClick(port.id)} className="flex flex-col items-center gap-1 group mt-2">
                        <div className={`w-10 h-4 ${port.color} rounded-sm border-2 ${port.border} flex justify-center items-center shadow-inner ${Object.values(usbConnections).includes(port.id) ? 'opacity-50 pointer-events-none' : 'group-hover:scale-110 cursor-pointer hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`}>
                          <div className="w-5 h-0.5 bg-white rounded-sm" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700">{port.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Devices */}
                  <div className="flex gap-4">
                    {(['keyboard', 'webcam4k', 'tablet'] as DeviceType[]).map(device => {
                      const isConnected = usbConnections[device];
                      const isSelected = selectedDevice === device;
                      const Icon = device === 'keyboard' ? Keyboard : device === 'webcam4k' ? Camera : Smartphone;
                      const label = device === 'keyboard' ? 'Keyboard' : device === 'webcam4k' ? '4K Webcam' : 'Tablet';
                      const desc = device === 'keyboard' ? 'Basic Data' : device === 'webcam4k' ? 'Needs Speed' : 'Needs Power';
                      
                      return (
                        <div key={device} className="flex flex-col items-center gap-1">
                          {isConnected ? (
                            <div className="text-emerald-400 font-bold text-[9px] uppercase flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded-full"><CheckCircle2 size={10}/> Connected</div>
                          ) : (
                            <div className="h-4" />
                          )}
                          <button 
                            onClick={() => { if(!isConnected) setSelectedDevice(device); if(playClick) playClick(); }}
                            disabled={!!isConnected}
                            className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${isConnected ? 'bg-slate-100 border-emerald-500/50 text-slate-400 opacity-50' : isSelected ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-500'}`}
                          >
                            <Icon size={24} />
                            <span className="text-[9px] font-black uppercase leading-tight text-center">{label}</span>
                            <div className="text-[7px] bg-slate-200 px-1 rounded-full font-bold text-slate-600 border border-slate-300">{desc}</div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* === Level 4: Backward Compatibility === */}
              {currentLevel === 3 && (
                <div className="flex flex-col w-full h-full justify-around items-center gap-2 py-2">
                  <div className="bg-slate-300 p-3 rounded-xl border-4 border-slate-400 flex gap-6 items-center shadow-inner relative mt-4">
                    <div className="text-slate-800 font-black uppercase tracking-widest text-[10px] absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-200 px-2 rounded-full border-2 border-slate-400 text-center whitespace-nowrap">USB 3.0 Ports</div>
                    {[1, 2].map(portId => (
                      <button key={portId} onClick={() => handleUSBPortClick(`USB3-${portId}`)} className="flex flex-col items-center gap-1 group mt-2">
                        <div className={`w-10 h-4 bg-white rounded-sm border-2 border-blue-500 flex justify-center items-center shadow-inner ${Object.values(usbConnections).includes(`USB3-${portId}`) ? 'opacity-50 pointer-events-none' : 'group-hover:scale-110 cursor-pointer hover:border-indigo-400'}`}>
                          <div className="w-5 h-0.5 bg-blue-400 rounded-sm" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700">USB 3.0</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-8">
                    {(['usb1_mouse', 'usb3_hdd'] as DeviceType[]).map(device => {
                      const isConnected = usbConnections[device];
                      const isSelected = selectedDevice === device;
                      const Icon = device === 'usb1_mouse' ? Mouse : HardDrive;
                      const label = device === 'usb1_mouse' ? 'Old Mouse' : 'New Drive';
                      const cable = device === 'usb1_mouse' ? 'USB 1.0 Cable' : 'USB 3.0 Cable';
                      
                      return (
                        <div key={device} className="flex flex-col items-center gap-1">
                          {isConnected ? (
                            <div className="text-emerald-400 font-bold text-[9px] uppercase flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded-full"><CheckCircle2 size={10}/> Connected</div>
                          ) : (
                            <div className="h-4" />
                          )}
                          <button 
                            onClick={() => { if(!isConnected) setSelectedDevice(device); if(playClick) playClick(); }}
                            disabled={!!isConnected}
                            className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${isConnected ? 'bg-slate-100 border-emerald-500/50 text-slate-400 opacity-50' : isSelected ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-500'}`}
                          >
                            <Icon size={28} />
                            <span className="text-[10px] font-black uppercase text-center leading-tight">{label}</span>
                            <div className={`text-[7px] px-1 rounded-full font-bold border ${device === 'usb1_mouse' ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>{cable}</div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* === Level 5: USB-C Era === */}
              {currentLevel === 4 && (
                <div className="flex flex-col w-full h-full justify-around items-center gap-2 py-2">
                  <div className="bg-slate-400 p-2 rounded-xl border-[6px] border-slate-500 flex gap-4 items-center shadow-inner relative mt-4">
                    <div className="text-slate-800 font-black uppercase tracking-widest text-[10px] absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 px-2 rounded-full border-2 border-slate-500 text-center whitespace-nowrap">Modern Laptop</div>
                    {[1, 2, 3].map(portId => (
                      <button key={portId} onClick={() => handleUSBPortClick(`USBC-${portId}`)} className="flex flex-col items-center gap-1 group mt-2">
                        <div className={`w-8 h-3.5 bg-slate-100 rounded-full border border-slate-300 flex justify-center items-center shadow-inner ${Object.values(usbConnections).includes(`USBC-${portId}`) ? 'opacity-50 pointer-events-none' : 'group-hover:scale-110 cursor-pointer hover:border-indigo-400'}`}>
                          <div className="w-4 h-0.5 bg-slate-400 rounded-full" />
                        </div>
                        <span className="text-[8px] font-bold text-slate-800">USB-C</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {(['usbc_monitor', 'usbc_phone', 'usbc_charger'] as DeviceType[]).map(device => {
                      const isConnected = usbConnections[device];
                      const isSelected = selectedDevice === device;
                      const Icon = device === 'usbc_monitor' ? Monitor : device === 'usbc_phone' ? Smartphone : BatteryCharging;
                      const label = device === 'usbc_monitor' ? 'Display' : device === 'usbc_phone' ? 'Phone' : 'Power';
                      
                      return (
                        <div key={device} className="flex flex-col items-center gap-1">
                          {isConnected ? (
                            <div className="text-emerald-400 font-bold text-[9px] uppercase flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded-full"><CheckCircle2 size={10}/> Connected</div>
                          ) : (
                            <div className="h-4" />
                          )}
                          <button 
                            onClick={() => { if(!isConnected) setSelectedDevice(device); if(playClick) playClick(); }}
                            disabled={!!isConnected}
                            className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${isConnected ? 'bg-slate-100 border-emerald-500/50 text-slate-400 opacity-50' : isSelected ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-500'}`}
                          >
                            <Icon size={24} />
                            <span className="text-[9px] font-black uppercase text-center leading-tight">{label}</span>
                            <div className="text-[7px] px-1 rounded-full font-bold bg-slate-200 text-slate-600 border border-slate-300">Type-C</div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
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
                  className="absolute bottom-2 bg-red-950 px-4 py-2 rounded-xl border-2 border-red-500 shadow-xl max-w-lg text-center z-30"
                >
                  <p className="text-xs font-bold text-red-200 tracking-wide">
                    {errorMsg}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center bg-white p-2 rounded-xl border-2 border-slate-700/50 shrink-0">
            <button 
              onClick={resetCurrentLevel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-[10px]"
            >
              <RotateCcw size={14} /> Reset Level
            </button>
            
            {currentLevel === 1 && !isLevelComplete() ? (
              <motion.button 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={checkUSBStandard}
                className="flex items-center gap-1.5 px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <CheckCircle2 size={16} /> Finalize Standard
              </motion.button>
            ) : isLevelComplete() ? (
              <motion.button 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={nextLevel}
                className="flex items-center gap-1.5 px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <CheckCircle2 size={16} /> {currentLevel === 4 ? 'Finish Lab' : 'Next Level'}
              </motion.button>
            ) : (
              <div className="px-6 py-2 font-black text-xs text-slate-600 uppercase tracking-widest">
                Awaiting Input...
              </div>
            )}
          </div>
          
        </div>
      )}
    </LabShell>
  );
}
