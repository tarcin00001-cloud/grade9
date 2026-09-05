"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLMSBridge } from '@/hooks/useLMSBridge';
import { useLabAudio } from '@/hooks/useLabAudio';
import LabShell from '@/components/LabShell';
import Celebration from '@/components/Celebration';
import { 
    Printer, Mouse, Smartphone, Video, 
    Plug, Zap, ShieldAlert, Cpu, 
    MonitorSmartphone, Monitor, AlertTriangle
} from 'lucide-react';

type Era = 'LEGACY' | 'USB';

interface Point { x: number, y: number }
interface Connection { from: string, to: string, color: string }

// Extracted Component to prevent infinite re-mounting
const PortNode = ({ 
    id, className, children, isPlug = false, color = "#94a3b8", 
    arenaRef, onUpdate, onPointerDown 
}: { 
    id: string, className: string, children?: React.ReactNode, 
    isPlug?: boolean, color?: string, 
    arenaRef: any,
    onUpdate: (id: string, pos: Point) => void,
    onPointerDown?: (e: React.PointerEvent, id: string, color: string) => void
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updatePos = () => {
            if (ref.current && arenaRef.current) {
                const rect = ref.current.getBoundingClientRect();
                const arenaRect = arenaRef.current.getBoundingClientRect();
                onUpdate(id, {
                    x: rect.left - arenaRect.left + rect.width / 2,
                    y: rect.top - arenaRect.top + rect.height / 2
                });
            }
        };
        
        updatePos();
        
        // Use ResizeObserver for perfect tracking even during animations
        if (!ref.current) return;
        const observer = new ResizeObserver(updatePos);
        observer.observe(ref.current);
        
        // Also observe the arena just in case the parent resizes without the child resizing
        if (arenaRef.current) observer.observe(arenaRef.current);
        
        return () => observer.disconnect();
    }, [id, arenaRef, onUpdate]);

    return (
        <div 
            ref={ref} 
            className={`${className} ${isPlug ? 'cursor-grab active:cursor-grabbing relative z-50' : 'relative z-10'}`}
            onPointerDown={(e) => isPlug && onPointerDown ? onPointerDown(e, id, color) : undefined}
        >
            {children}
        </div>
    );
};

// UI Enhancements
const SpecSheet = ({ specs }: { specs: Record<string, string> }) => (
    <div className="bg-slate-50 border border-slate-200 rounded p-2.5 font-mono text-[9px] text-slate-500 w-full sm:w-auto min-w-[180px] shadow-inner z-10 shrink-0">
        {Object.entries(specs).map(([key, val]) => (
            <div key={key} className="flex justify-between border-b border-slate-100 last:border-0 py-1.5 gap-4">
                <span className="font-bold text-slate-400 whitespace-nowrap">{key}</span>
                <span className="text-slate-700 text-right font-bold whitespace-nowrap">{val}</span>
            </div>
        ))}
    </div>
);

const StatusLed = ({ active }: { active: boolean }) => (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full shadow-inner z-10 shrink-0">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
        <span className="text-[8px] font-bold text-slate-500 uppercase">{active ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
);

export default function UsbConnectivity25() {
    const { reportComplete } = useLMSBridge("usbconnectivity25");
    const { playPop, playError, playSuccess, playClick, playZap } = useLabAudio();

    const [era, setEra] = useState<Era>('LEGACY');
    const [showIntro, setShowIntro] = useState(true);
    const [showLegacyError, setShowLegacyError] = useState(false);
    const [isVictorious, setIsVictorious] = useState(false);

    const [isPoweringOn, setIsPoweringOn] = useState(false);

    // WIRING STATE
    const arenaRef = useRef<HTMLDivElement>(null);
    const [arenaSize, setArenaSize] = useState({ w: 1000, h: 1000 });
    const [nodes, setNodes] = useState<Record<string, Point>>({});
    const [connections, setConnections] = useState<Connection[]>([]);
    const [activeWire, setActiveWire] = useState<{ origin: string, color: string } | null>(null);
    const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });

    // Track Arena Size for SVG ViewBox
    useEffect(() => {
        if (!arenaRef.current) return;
        const observer = new ResizeObserver((entries) => {
            setArenaSize({ 
                w: entries[0].contentRect.width, 
                h: entries[0].contentRect.height 
            });
        });
        observer.observe(arenaRef.current);
        return () => observer.disconnect();
    }, []);

    // Track if specific legacy connections are made
    const hasPrinterData = connections.some(c => c.from === 'printer-plug' && c.to === 'lpt-socket');
    const hasPrinterPower = connections.some(c => c.from === 'printer-power' && c.to === 'wall-outlet');
    const hasMouseData = connections.some(c => c.from === 'mouse-plug' && c.to === 'ps2-socket');

    // Track USB connections
    const usbCount = connections.filter(c => c.to.startsWith('usb-socket')).length;

    // Stable update function
    const handleNodeUpdate = React.useCallback((id: string, pos: Point) => {
        setNodes(prev => {
            // Prevent state update if position hasn't actually changed to avoid render loops
            if (prev[id] && Math.abs(prev[id].x - pos.x) < 1 && Math.abs(prev[id].y - pos.y) < 1) {
                return prev;
            }
            return { ...prev, [id]: pos };
        });
    }, []);

    const handlePlugPointerDown = React.useCallback((e: React.PointerEvent, id: string, color: string) => {
        if (isPoweringOn) return; // Disable drag during animation
        e.preventDefault();
        setConnections(prev => prev.filter(c => c.from !== id));
        setActiveWire({ origin: id, color });
        if (arenaRef.current) {
            setMousePos({ 
                x: e.clientX - arenaRef.current.getBoundingClientRect().left, 
                y: e.clientY - arenaRef.current.getBoundingClientRect().top 
            });
        }
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [isPoweringOn]);

    // WIRING INTERACTION
    const handlePointerMove = (e: React.PointerEvent) => {
        if (activeWire && arenaRef.current) {
            const arenaRect = arenaRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - arenaRect.left,
                y: e.clientY - arenaRect.top
            });
        }
    };

    const handlePointerUp = () => {
        if (activeWire) {
            // Find closest socket
            let closestSocket: string | null = null;
            let minDistance = 50; // Snap radius

            Object.entries(nodes).forEach(([nodeId, pos]) => {
                if (nodeId.includes('-socket') || nodeId === 'wall-outlet') {
                    const dist = Math.hypot(pos.x - mousePos.x, pos.y - mousePos.y);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestSocket = nodeId;
                    }
                }
            });

            if (closestSocket) {
                // Validate connection logic
                let isValid = false;
                if (era === 'LEGACY') {
                    if (activeWire.origin === 'printer-plug' && closestSocket === 'lpt-socket') isValid = true;
                    if (activeWire.origin === 'mouse-plug' && closestSocket === 'ps2-socket') isValid = true;
                    if (activeWire.origin === 'printer-power' && closestSocket === 'wall-outlet') isValid = true;
                } else {
                    if ((closestSocket as string).startsWith('usb-socket')) isValid = true;
                }

                // Ensure socket isn't already occupied
                const isOccupied = connections.some(c => c.to === closestSocket);

                if (isValid && !isOccupied) {
                    setConnections(prev => [...prev, { from: activeWire.origin, to: closestSocket as string, color: activeWire.color }]);
                    if (playPop) playPop();
                }
            }
            setActiveWire(null);
        }
    };

    // GAME LOGIC
    const handlePowerOnLegacy = () => {
        setIsPoweringOn(true);
        setTimeout(() => {
            setIsPoweringOn(false);
            setShowLegacyError(true);
            if (playError) playError();
        }, 1500);
    };

    const handleInventUSB = () => {
        if (playZap) playZap();
        setShowLegacyError(false);
        setConnections([]); // Clear wires
        setEra('USB');
    };

    const handlePowerOnUSB = () => {
        if (usbCount === 3) {
            setIsPoweringOn(true);
            setTimeout(() => {
                setIsPoweringOn(false);
                setIsVictorious(true);
                if (playSuccess) playSuccess();
                reportComplete({ labId: 'usbconnectivity25', points: 100 });
            }, 1500);
        }
    };

    const resetGame = () => {
        if (playClick) playClick();
        setEra('LEGACY');
        setConnections([]);
        setShowLegacyError(false);
        setIsVictorious(false);
        setShowIntro(true);
        setIsPoweringOn(false);
    };

    // Draw SVG Wires
    const renderWires = () => {
        return (
            <svg 
                viewBox={`0 0 ${arenaSize.w} ${arenaSize.h}`}
                className="absolute inset-0 w-full h-full pointer-events-none z-40" 
                style={{ overflow: 'visible' }}
            >
                {/* Established Connections */}
                {connections.map((conn, i) => {
                    const start = nodes[conn.from];
                    const end = nodes[conn.to];
                    if (!start || !end) return null;

                    // Curvy path
                    const path = `M ${start.x} ${start.y} C ${start.x} ${(start.y + end.y) / 2}, ${end.x} ${(start.y + end.y) / 2}, ${end.x} ${end.y}`;

                    return (
                        <g key={i}>
                            <path d={path} fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                            <path d={path} fill="none" stroke={conn.color} strokeWidth="4" strokeLinecap="round" />
                            {/* USB magic pulses */}
                            {era === 'USB' && (
                                <>
                                    <path d={path} fill="none" stroke="#60a5fa" strokeWidth="4" className={isPoweringOn ? "wire-fast" : "wire-normal"} strokeDasharray="10 20" />
                                    <path d={path} fill="none" stroke="#fbbf24" strokeWidth="2" className={isPoweringOn ? "wire-fast-rev" : "wire-normal-rev"} strokeDasharray="5 15" />
                                </>
                            )}
                        </g>
                    );
                })}

                {/* Active Wire being dragged */}
                {activeWire && nodes[activeWire.origin] && (
                    <g>
                        <path 
                            d={`M ${nodes[activeWire.origin].x} ${nodes[activeWire.origin].y} C ${nodes[activeWire.origin].x} ${(nodes[activeWire.origin].y + mousePos.y) / 2}, ${mousePos.x} ${(nodes[activeWire.origin].y + mousePos.y) / 2}, ${mousePos.x} ${mousePos.y}`} 
                            fill="none" 
                            stroke="#1e293b" 
                            strokeWidth="8" 
                            strokeLinecap="round" 
                        />
                        <path 
                            d={`M ${nodes[activeWire.origin].x} ${nodes[activeWire.origin].y} C ${nodes[activeWire.origin].x} ${(nodes[activeWire.origin].y + mousePos.y) / 2}, ${mousePos.x} ${(nodes[activeWire.origin].y + mousePos.y) / 2}, ${mousePos.x} ${mousePos.y}`} 
                            fill="none" 
                            stroke={activeWire.color} 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                        />
                    </g>
                )}
            </svg>
        );
    };

    return (
        <LabShell
            labId="usbconnectivity25"
            title="USB & Connectivity"
            instruction="Wire the peripherals to the computer correctly to boot the system."
            compact={true}
            bgOverride="bg-slate-900"
            onReset={resetGame}
        >
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes dash { to { stroke-dashoffset: -30; } }
                .wire-fast { animation: dash 0.3s linear infinite; }
                .wire-normal { animation: dash 1s linear infinite; }
                .wire-fast-rev { animation: dash 0.4s linear infinite reverse; }
                .wire-normal-rev { animation: dash 1.5s linear infinite reverse; }
                @keyframes error-shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px) rotate(-1deg); }
                    50% { transform: translateX(5px) rotate(1deg); }
                    75% { transform: translateX(-5px) rotate(-1deg); }
                }
                .animate-error-shake { animation: error-shake 0.3s ease-in-out infinite; }
            `}} />

            <div 
                ref={arenaRef}
                className="flex flex-col h-full bg-slate-50 p-2 gap-2 overflow-hidden relative rounded-xl border border-slate-300 shadow-inner select-none"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ touchAction: 'none' }} // Crucial for custom dragging
            >
                {renderWires()}

                {/* TOP ZONE: THE COMPUTER BACK PANEL */}
                <div className={`bg-slate-900 border-b-4 border-slate-950 rounded-xl p-4 shrink-0 shadow-lg relative flex flex-col gap-4 z-10 transition-colors ${isPoweringOn && era === 'LEGACY' ? 'animate-error-shake bg-rose-950' : ''}`}>
                    <div className="absolute top-2 left-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Cpu size={12} /> PC Back Panel
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 h-[60px]">
                        
                        {/* Power Outlet (Always present in Legacy) */}
                        <AnimatePresence>
                            {era === 'LEGACY' && (
                                <motion.div exit={{ opacity: 0, scale: 0 }} className="flex flex-col items-center gap-1">
                                    <PortNode arenaRef={arenaRef} onUpdate={handleNodeUpdate} onPointerDown={handlePlugPointerDown} id="wall-outlet" className="w-12 h-12 bg-white rounded-md border-2 border-slate-300 flex items-center justify-center shadow-inner relative z-50">
                                        <div className="flex gap-2">
                                            <div className="w-1 h-3 bg-slate-800 rounded-sm" />
                                            <div className="w-1 h-3 bg-slate-800 rounded-sm" />
                                        </div>
                                    </PortNode>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">120V AC</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Data Ports */}
                        <AnimatePresence mode="wait">
                            {era === 'LEGACY' ? (
                                <motion.div key="legacy-ports" exit={{ y: -50, opacity: 0 }} className="flex gap-8 items-center">
                                    {/* Parallel Port */}
                                    <div className="flex flex-col items-center gap-1">
                                        <PortNode arenaRef={arenaRef} onUpdate={handleNodeUpdate} onPointerDown={handlePlugPointerDown} id="lpt-socket" className={`w-24 h-8 flex items-center justify-center rounded-sm transition-all duration-300 relative z-50 ${hasPrinterData ? 'bg-pink-700 shadow-[0_0_15px_rgba(219,39,119,0.5)]' : 'bg-pink-900/50 border border-pink-800'}`}>
                                            <div className="flex gap-1 px-2 w-full justify-between">
                                                {[...Array(12)].map((_, i) => <div key={i} className="w-0.5 h-1 bg-pink-950 rounded-full" />)}
                                            </div>
                                        </PortNode>
                                        <span className="text-[9px] font-bold text-pink-500 uppercase tracking-widest">LPT1 Parallel</span>
                                    </div>

                                    {/* PS/2 Port */}
                                    <div className="flex flex-col items-center gap-1">
                                        <PortNode arenaRef={arenaRef} onUpdate={handleNodeUpdate} onPointerDown={handlePlugPointerDown} id="ps2-socket" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-50 ${hasMouseData ? 'bg-emerald-700 shadow-[0_0_15px_rgba(4,120,87,0.5)]' : 'bg-emerald-900/50 border border-emerald-800'}`}>
                                            <div className="grid grid-cols-2 gap-1">
                                                {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-1 bg-emerald-950 rounded-full" />)}
                                            </div>
                                        </PortNode>
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">PS/2 Mouse</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="usb-ports" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 flex justify-center items-center gap-6">
                                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex gap-6 shadow-inner relative z-50">
                                        {/* 3 USB Sockets */}
                                        {[1, 2, 3].map(num => (
                                            <div key={num} className="flex flex-col items-center gap-1">
                                                <PortNode arenaRef={arenaRef} onUpdate={handleNodeUpdate} onPointerDown={handlePlugPointerDown} id={`usb-socket-${num}`} className="w-14 h-6 bg-slate-900 border border-slate-600 rounded-sm flex items-center justify-center">
                                                    <div className="w-10 h-1 bg-slate-950 rounded-sm" />
                                                </PortNode>
                                                <span className="text-[8px] font-bold text-slate-400">USB {num}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* MIDDLE ZONE: THE DESK (DRAGGABLE PLUGS) */}
                <div className="flex-1 flex flex-col gap-2 relative z-20">
                    <AnimatePresence mode="wait">
                        {era === 'LEGACY' ? (
                            <motion.div key="legacy-desk" exit={{ opacity: 0, scale: 0.9 }} className="flex-1 flex flex-col xl:flex-row gap-2">
                                
                                {/* Printer Card */}
                                <div className="flex-[1.5] bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col shadow-sm relative overflow-hidden min-h-[160px]">
                                    <Printer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 text-slate-100 opacity-50 pointer-events-none z-0" />
                                    
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-2 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <Printer size={20} className="text-pink-600" />
                                            <div>
                                                <h3 className="font-black text-slate-700 leading-tight">Dot Matrix Printer</h3>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Needs Data & Power</p>
                                            </div>
                                        </div>
                                        <StatusLed active={hasPrinterData && hasPrinterPower} />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col md:flex-row items-center justify-around w-full relative z-10 gap-4 py-2">
                                        {/* Plugs */}
                                        <div className="flex gap-8 items-center justify-center">
                                            <div className="flex flex-col items-center group">
                                                <PortNode arenaRef={arenaRef} onUpdate={handleNodeUpdate} onPointerDown={handlePlugPointerDown} id="printer-plug" isPlug={true} color="#db2777" className="w-16 h-8 bg-pink-200 border-2 border-pink-400 rounded flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-grab">
                                                    <div className="w-12 h-2 bg-pink-300 flex justify-between px-1"><div className="w-1 h-full bg-pink-400"/><div className="w-1 h-full bg-pink-400"/></div>
                                                </PortNode>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase mt-2 group-hover:text-pink-600">Drag Data Cable</span>
                                            </div>
                                            <div className="flex flex-col items-center group">
                                                <PortNode arenaRef={arenaRef} onUpdate={handleNodeUpdate} onPointerDown={handlePlugPointerDown} id="printer-power" isPlug={true} color="#1e293b" className="w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded flex flex-col items-center justify-end pb-2 shadow-md hover:scale-110 transition-transform cursor-grab">
                                                    <div className="flex gap-1"><div className="w-1 h-3 bg-slate-300 rounded-t-sm"/><div className="w-1 h-3 bg-slate-300 rounded-t-sm"/></div>
                                                </PortNode>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase mt-2 group-hover:text-slate-800">Drag AC Power</span>
                                            </div>
                                        </div>
                                        {/* Specs */}
                                        <SpecSheet specs={{
                                            "INTERFACE": "IEEE 1284 (Parallel)",
                                            "IRQ LINE": "IRQ 7",
                                            "POWER": "120V AC (External)",
                                            "SPEED": "150 Characters/Sec"
                                        }} />
                                    </div>
                                </div>

                                {/* Mouse Card */}
                                <div className="flex-1 bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col shadow-sm relative overflow-hidden min-h-[160px]">
                                    <Mouse className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-slate-100 opacity-50 pointer-events-none z-0" />
                                    
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-2 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <Mouse size={20} className="text-emerald-600" />
                                            <div>
                                                <h3 className="font-black text-slate-700 leading-tight">Ball Mouse</h3>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Data Only (Draws Power)</p>
                                            </div>
                                        </div>
                                        <StatusLed active={hasMouseData} />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col md:flex-row items-center justify-around w-full relative z-10 gap-4 py-2">
                                        <div className="flex flex-col items-center group">
                                            <PortNode arenaRef={arenaRef} onUpdate={handleNodeUpdate} onPointerDown={handlePlugPointerDown} id="mouse-plug" isPlug={true} color="#047857" className="w-10 h-10 bg-emerald-200 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-grab">
                                                <div className="w-4 h-4 bg-emerald-300 rounded-full" />
                                            </PortNode>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase mt-2 group-hover:text-emerald-600">Drag Data Cable</span>
                                        </div>
                                        <SpecSheet specs={{
                                            "INTERFACE": "PS/2 Mini-DIN",
                                            "IRQ LINE": "IRQ 12",
                                            "POWER": "+5V DC (Bus)",
                                            "POLLING": "60 Hz"
                                        }} />
                                    </div>
                                </div>

                            </motion.div>
                        ) : (
                            <motion.div key="usb-desk" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col xl:flex-row gap-2">
                                {/* USB Devices */}
                                {[
                                    { id: 'webcam', icon: Video, name: "HD Webcam", color: "#6366f1", specs: {"CLASS": "Video (UVC)", "SPEED": "12 Mbps", "POWER": "Bus-powered"} },
                                    { id: 'phone', icon: Smartphone, name: "Smartphone", color: "#8b5cf6", specs: {"CLASS": "Storage (MSC)", "SPEED": "480 Mbps", "POWER": "Charging"} },
                                    { id: 'mouse', icon: Mouse, name: "Optical Mouse", color: "#ec4899", specs: {"CLASS": "Human Interface", "SPEED": "1.5 Mbps", "POWER": "Bus-powered"} }
                                ].map((dev, i) => {
                                    const isConnected = connections.some(c => c.from === `${dev.id}-plug`);
                                    return (
                                        <motion.div 
                                            key={i} 
                                            animate={isPoweringOn && era === 'USB' ? { y: [0, -8, 0] } : { y: 0 }} 
                                            transition={isPoweringOn ? { duration: 0.4, repeat: Infinity, delay: i * 0.1 } : {}}
                                            className="flex-1 bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col shadow-sm relative overflow-hidden min-h-[160px]"
                                        >
                                            <dev.icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-slate-100 opacity-50 pointer-events-none z-0" />
                                            
                                            <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-2 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <dev.icon size={20} style={{ color: dev.color }} />
                                                    <h3 className="font-black text-[11px] text-slate-700 leading-tight">{dev.name}</h3>
                                                </div>
                                                <StatusLed active={isConnected} />
                                            </div>
                                            
                                            <div className="flex-1 flex flex-col md:flex-row items-center justify-around w-full relative z-10 gap-4 py-2">
                                                <div className="flex flex-col items-center group">
                                                    <PortNode arenaRef={arenaRef} onUpdate={handleNodeUpdate} onPointerDown={handlePlugPointerDown} id={`${dev.id}-plug`} isPlug={true} color={dev.color} className="w-12 h-6 bg-slate-200 border-2 border-slate-400 rounded-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-grab">
                                                        <div className="w-8 h-1 bg-slate-50" />
                                                    </PortNode>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-2 group-hover:text-indigo-600">Drag USB</span>
                                                </div>
                                                <SpecSheet specs={{
                                                    "INTERFACE": "USB Universal",
                                                    "IRQ LINE": "Auto-assigned",
                                                    ...dev.specs
                                                }} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* BOTTOM: SYSTEM ACTION */}
                <div className="bg-slate-800 rounded-xl p-3 shrink-0 flex items-center justify-between shadow-lg z-20">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Status: <span className="text-white">{connections.length} cables connected</span>
                    </div>
                    {era === 'LEGACY' ? (
                        <button 
                            onClick={handlePowerOnLegacy}
                            disabled={connections.length === 0 || isPoweringOn}
                            className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-md transition-colors ${
                                connections.length > 0 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-500'
                            }`}
                        >
                            {isPoweringOn ? 'POWERING UP...' : 'Power On PC'}
                        </button>
                    ) : (
                        <button 
                            onClick={handlePowerOnUSB}
                            disabled={usbCount < 3 || isPoweringOn}
                            className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-md transition-colors ${
                                usbCount === 3 ? 'bg-emerald-500 hover:bg-emerald-400 text-white animate-pulse' : 'bg-slate-700 text-slate-500'
                            }`}
                        >
                            {isPoweringOn ? 'INITIALIZING...' : 'Power On PC'}
                        </button>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                                <Monitor size={24} className="text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">1995 Wiring Task</h2>
                            <div className="text-slate-600 text-sm mb-6 space-y-3">
                                <p>Grab the plugs from your devices and drag them to the correct ports on the back of the PC.</p>
                                <p className="font-bold text-slate-800">The Problem:</p>
                                <ul className="list-disc pl-4 text-slate-700">
                                    <li>Every device has a unique, incompatible plug.</li>
                                    <li>Data cables don't carry electricity, so you need giant power bricks.</li>
                                    <li>The computer crashes if you don't configure hardware interrupts correctly!</li>
                                </ul>
                            </div>
                            <button onClick={() => setShowIntro(false)} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-md">
                                Start Wiring
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {showLegacyError && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl border-4 border-rose-500">
                            <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4" />
                            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">
                                {!hasPrinterPower ? "Missing Power!" : "IRQ Conflict!"}
                            </h2>
                            <p className="text-slate-600 text-sm mb-6 bg-rose-50 p-3 rounded-lg border border-rose-200 text-left">
                                {!hasPrinterPower 
                                    ? "You plugged in the Parallel data cable, but legacy cables don't carry electricity! The printer won't turn on without its heavy AC power brick connected to the wall."
                                    : "SYSTEM HALTED! The Serial port and Parallel port are fighting for the same hardware interrupt request (IRQ) on the motherboard. The computer has crashed."
                                }
                                <br/><br/>
                                <strong>Ajay Bhatt's Solution:</strong> We need a "Universal Serial Bus" (USB). A single standardized cable that carries both Data and Power, and automatically resolves hardware conflicts!
                            </p>
                            <button 
                                onClick={handleInventUSB} 
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <Zap size={18} /> INVENT USB
                            </button>
                            {!hasPrinterPower && (
                                <button 
                                    onClick={() => setShowLegacyError(false)} 
                                    className="w-full text-slate-500 font-bold py-3 mt-2 hover:text-slate-700 transition-colors"
                                >
                                    Back to 1995 (Fix it manually)
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Celebration
                isActive={isVictorious}
                message="Plug and Play Success! By inventing USB, Ajay Bhatt created a single standard that handled power and data simultaneously. It eliminated IRQ conflicts and ugly power bricks, paving the way for billions of modern devices!"
                onReplay={resetGame}
            />
        </LabShell>
    );
}
