"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, RoundedBox, Html, Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import * as THREE from 'three';
import { 
  Settings, Zap, ShieldCheck, Cpu, Smartphone, MonitorPlay, Keyboard, Tablet, AlertTriangle, Bug
} from "lucide-react";

// The HTML UIs for the 3D Phone
const GlitchUI = () => (
    <div className="w-[290px] h-[290px] bg-blue-600 flex flex-col items-center justify-center p-4 text-white font-mono text-center pointer-events-none select-none">
        <Bug size={48} className="mb-2 text-white animate-pulse" />
        <span className="text-xl font-bold mb-2">FATAL_ERROR</span>
        <span className="text-xs opacity-80">SENSOR_UNMAPPED<br/>0x00000000</span>
    </div>
);

const LaptopTopUI = () => (
    <div className="w-[290px] h-[290px] bg-slate-900 flex items-center justify-center border-b-2 border-slate-950 pointer-events-none select-none">
        <MonitorPlay size={64} className="text-emerald-400" />
    </div>
);

const LaptopBottomUI = () => (
    <div className="w-[290px] h-[290px] bg-slate-800 flex items-center justify-center border-t-2 border-slate-950 pointer-events-none select-none">
        <Keyboard size={64} className="text-slate-400" />
    </div>
);

const TabletTopUI = () => (
    <div className="w-[290px] h-[290px] bg-indigo-900/60 flex items-end justify-center pb-2 pointer-events-none select-none">
        <Tablet size={80} className="text-indigo-400 translate-y-6" />
    </div>
);

const TabletBottomUI = () => (
    <div className="w-[290px] h-[290px] bg-indigo-900/60 flex items-start justify-center pt-2 pointer-events-none select-none">
        <span className="text-2xl font-black text-indigo-400 mt-8 tracking-widest">TABLET MODE</span>
    </div>
);

const CoverUI = () => (
    <div className="w-[260px] h-[280px] bg-slate-900 flex flex-col items-center justify-center p-4 border-[6px] border-black rounded-3xl pointer-events-none select-none">
        <Smartphone size={48} className="text-cyan-400 mb-4" />
        <span className="text-3xl font-black text-white tracking-widest mb-1">12:45</span>
        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">Cover Display</span>
    </div>
);

function FoldableDevice({ 
    foldAngle, 
    isBroken, 
    hasHinges,
    currentLayout,
    targetRootRot
}: { 
    foldAngle: number, 
    isBroken: boolean, 
    hasHinges: boolean,
    currentLayout: string,
    targetRootRot: [number, number, number]
}) {
    const topGroup = useRef<THREE.Group>(null);
    const rootGroup = useRef<THREE.Group>(null);

    useFrame(() => {
        if (rootGroup.current) {
            rootGroup.current.rotation.x = THREE.MathUtils.lerp(rootGroup.current.rotation.x, targetRootRot[0], 0.08);
            rootGroup.current.rotation.y = THREE.MathUtils.lerp(rootGroup.current.rotation.y, targetRootRot[1], 0.08);
            rootGroup.current.rotation.z = THREE.MathUtils.lerp(rootGroup.current.rotation.z, targetRootRot[2], 0.08);
        }

        if (topGroup.current) {
            const targetRotX = ((180 - foldAngle) * Math.PI) / 180;
            if (isBroken) {
                topGroup.current.rotation.x = THREE.MathUtils.lerp(topGroup.current.rotation.x, targetRotX + 0.8, 0.2);
                topGroup.current.rotation.y = THREE.MathUtils.lerp(topGroup.current.rotation.y, 0, 0.2);
                if (!topGroup.current.rotation.z) topGroup.current.rotation.z = 0;
                topGroup.current.rotation.z = THREE.MathUtils.lerp(topGroup.current.rotation.z, 0, 0.2);
            } else {
                topGroup.current.rotation.x = THREE.MathUtils.lerp(topGroup.current.rotation.x, targetRotX, 0.3);
                topGroup.current.rotation.y = THREE.MathUtils.lerp(topGroup.current.rotation.y, 0, 0.3);
                if (!topGroup.current.rotation.z) topGroup.current.rotation.z = 0;
                topGroup.current.rotation.z = THREE.MathUtils.lerp(topGroup.current.rotation.z, 0, 0.3);
            }
        }
    });

    const bodyColor = hasHinges ? "#e2e8f0" : "#64748b"; // Titanium Silver / Dark Slate
    const innerScreenColor = isBroken ? "#991b1b" : "#020202"; // Cracked Red / Deep OLED Black

    return (
        <group ref={rootGroup}>
            {/* Screen Glow when in Laptop Mode */}
            <pointLight position={[0, 0.5, 0.5]} intensity={currentLayout === 'laptop' ? 2 : 0} color="#38bdf8" distance={4} />

            {/* BOTTOM HALF */}
            <group position={[0, -1.5, 0]}>
                {/* Premium Glass/Metal Body */}
                <RoundedBox args={[3, 3, 0.15]} radius={0.05} smoothness={4} position={[0, 0, -0.075]}>
                    <meshPhysicalMaterial color={bodyColor} metalness={0.8} roughness={0.2} clearcoat={0.5} clearcoatRoughness={0.1} />
                </RoundedBox>
                {/* Embedded Branding */}
                <Text position={[0, -1, -0.151]} rotation={[0, Math.PI, 0]} fontSize={0.25} color={hasHinges ? "#94a3b8" : "#334155"} fontWeight="bold" letterSpacing={0.1}>
                    KARKY LABS
                </Text>
                {/* Inner Screen */}
                <mesh position={[0, 0, 0.001]}>
                    <planeGeometry args={[2.9, 2.9]} />
                    <meshPhysicalMaterial color={innerScreenColor} metalness={0.8} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} />
                    {!isBroken && currentLayout === 'none' && (
                        <Html transform scale={0.01} position={[0, 0, 0.01]} style={{ pointerEvents: 'none' }}>
                            <GlitchUI />
                        </Html>
                    )}
                    {!isBroken && currentLayout === 'laptop' && (
                        <Html transform scale={0.01} position={[0, 0, 0.01]} style={{ pointerEvents: 'none' }}>
                            <LaptopBottomUI />
                        </Html>
                    )}
                    {!isBroken && currentLayout === 'tablet' && (
                        <Html transform scale={0.01} position={[0, 0, 0.01]} style={{ pointerEvents: 'none' }}>
                            <TabletBottomUI />
                        </Html>
                    )}
                </mesh>
            </group>

            {/* LUXURY HINGE SPINE */}
            <mesh position={[0, 0, -0.15]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.08, 0.08, 2.9, 32]} />
                <meshPhysicalMaterial color={hasHinges ? "#dfc08f" : "#94a3b8"} metalness={1} roughness={0.1} clearcoat={1} />
            </mesh>

            {/* TOP HALF */}
            <group ref={topGroup} position={[0, 0, 0]}>
                <group position={[0, 1.5, 0]}>
                    <RoundedBox args={[3, 3, 0.15]} radius={0.05} smoothness={4} position={[0, 0, -0.075]}>
                        <meshPhysicalMaterial color={bodyColor} metalness={0.8} roughness={0.2} clearcoat={0.5} clearcoatRoughness={0.1} />
                    </RoundedBox>
                    {/* Inner Screen */}
                    <mesh position={[0, 0, 0.001]}>
                        <planeGeometry args={[2.9, 2.9]} />
                        <meshPhysicalMaterial color={innerScreenColor} metalness={0.8} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} />
                        {!isBroken && currentLayout === 'none' && (
                            <Html transform scale={0.01} position={[0, 0, 0.01]} style={{ pointerEvents: 'none' }}>
                                <GlitchUI />
                            </Html>
                        )}
                        {!isBroken && currentLayout === 'laptop' && (
                            <Html transform scale={0.01} position={[0, 0, 0.01]} style={{ pointerEvents: 'none' }}>
                                <LaptopTopUI />
                            </Html>
                        )}
                        {!isBroken && currentLayout === 'cover' && (
                            <Html transform scale={0.01} position={[0, 0, 0.01]} style={{ pointerEvents: 'none' }}>
                                <CoverUI />
                            </Html>
                        )}
                        {!isBroken && currentLayout === 'tablet' && (
                            <Html transform scale={0.01} position={[0, 0, 0.01]} style={{ pointerEvents: 'none' }}>
                                <TabletTopUI />
                            </Html>
                        )}
                    </mesh>

                    {/* Outer Cover Screen (only active when folded) */}
                    <mesh position={[0, 0, -0.151]} rotation={[0, Math.PI, 0]}>
                        <planeGeometry args={[2.6, 2.8]} />
                        <meshBasicMaterial color="#000000" />
                        {!isBroken && currentLayout === 'cover' && (
                            <Html transform scale={0.01} position={[0, 0, 0.01]} style={{ pointerEvents: 'none' }}>
                                <CoverUI />
                            </Html>
                        )}
                    </mesh>
                </group>
            </group>
        </group>
    );
}

export default function FoldableSmartphone11() {
  const { reportComplete } = useLMSBridge("foldablesmartphone11");
  const { playPop, playSuccess, playError, playChime, playHeavyThud, playClick } = useLabAudio();

  const [mission, setMission] = useState<1 | 2>(1);
  const [hasHinges, setHasHinges] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [foldCount, setFoldCount] = useState(0);
  const [hardwarePassed, setHardwarePassed] = useState(false);
  
  // Software State
  const [foldAngle, setFoldAngle] = useState(180);
  const [logicMap, setLogicMap] = useState<{0: string|null, 90: string|null, 180: string|null}>({0: null, 90: null, 180: null});
  const [softwarePassed, setSoftwarePassed] = useState(false);
  const [targetRootRot, setTargetRootRot] = useState<[number, number, number]>([0, 0, 0]);
  
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isTesting) {
          let cycles = 0;
          let targetCount = hasHinges ? 200000 : 10000;
          let increment = hasHinges ? 5000 : 500;
          interval = setInterval(() => {
              cycles += increment;
              setFoldCount(cycles);
              setFoldAngle(prev => prev > 90 ? 0 : 180);
              if (cycles % 20000 === 0) playPop();
              if (cycles >= targetCount) {
                  clearInterval(interval);
                  setIsTesting(false);
                  if (hasHinges) {
                      setFoldAngle(180);
                      setHardwarePassed(true);
                      playSuccess();
                  } else {
                      setIsBroken(true);
                      setFoldAngle(90);
                      playError();
                      playHeavyThud();
                  }
              }
          }, 50);
      }
      return () => clearInterval(interval);
  }, [isTesting, hasHinges]);

  useEffect(() => {
      if (logicMap[0] === 'cover' && logicMap[90] === 'laptop' && logicMap[180] === 'tablet' && !softwarePassed) {
          setSoftwarePassed(true);
          playSuccess();
          reportComplete();
      }
  }, [logicMap, softwarePassed]);

  const handleRunTest = () => { if (isTesting) return; playClick(); setIsTesting(true); setFoldCount(0); setIsBroken(false); };
  
  const handleMapLogic = (angle: 0|90|180, layout: string) => { 
      playClick(); 
      setLogicMap(prev => ({...prev, [angle]: layout})); 
      
      // Auto-fold and Cinematic Sweep
      setFoldAngle(angle);
      if (angle === 0) setTargetRootRot([0, Math.PI, 0]);
      else if (angle === 90) setTargetRootRot([Math.PI / 6, -Math.PI / 8, 0]);
      else setTargetRootRot([0, 0, 0]);
  };
  
  const handleSliderChange = (e: any) => {
      setFoldAngle(parseInt(e.target.value));
      setTargetRootRot([0, 0, 0]); // Reset perspective when manually driving
  };

  let currentLayout = 'none';
  if (mission === 2) {
      if (foldAngle < 45) currentLayout = logicMap[0] || 'none';
      else if (foldAngle < 135) currentLayout = logicMap[90] || 'none';
      else currentLayout = logicMap[180] || 'none';
  }

  return (
    <LabShell
      labId="foldablesmartphone11"
      title="The Foldable Smartphone"
      compact={true}
      bgOverride="bg-slate-50"
      instruction={mission === 1 ? "Mission 1 (Hardware): The OLED screen must survive 200,000 folds. Install micro-hinges and run the durability test." : "Mission 2 (Software): Program the Adaptive UI. Map the physical hinge angle to the correct software layout algorithm."}
      onReset={() => {
        setMission(1); setHasHinges(false); setIsTesting(false); setIsBroken(false); setFoldCount(0);
        setHardwarePassed(false); setFoldAngle(180); setLogicMap({0: null, 90: null, 180: null}); setSoftwarePassed(false);
        setTargetRootRot([0, 0, 0]);
      }}
    >
      <Celebration isActive={softwarePassed} message="Masterful Engineering! You designed a durable folding mechanism and programmed a seamless Adaptive UI!" />

      <div className="flex flex-col md:flex-row w-full h-full min-h-0 font-sans overflow-hidden p-2 sm:p-4 gap-4">
        
        {/* LEFT/TOP: 3D CANVAS */}
        <div className="w-full md:w-[60%] min-h-[400px] bg-slate-900 rounded-xl shadow-xl border-4 border-slate-800 relative overflow-hidden flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 shadow-lg">
                <Settings size={16} className="text-cyan-400" />
                <span className="text-xs font-black text-slate-200 tracking-widest uppercase">3D Hardware Sandbox</span>
            </div>
            
            <Canvas camera={{ position: [6, 4, 6], fov: 45 }}>
                <ambientLight intensity={currentLayout === 'laptop' ? 0.8 : 1.5} />
                <directionalLight position={[5, 10, 5]} intensity={currentLayout === 'laptop' ? 1.5 : 3} color="#ffffff" castShadow />
                <pointLight position={[-5, 2, -5]} intensity={4} color="#38bdf8" distance={20} />
                <pointLight position={[5, 5, -5]} intensity={3} color="#a855f7" distance={20} />
                <Suspense fallback={null}>
                    <Environment preset="studio" />
                    <FoldableDevice foldAngle={foldAngle} isBroken={isBroken} hasHinges={hasHinges} currentLayout={currentLayout} targetRootRot={targetRootRot} />
                </Suspense>
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.5} minDistance={3} maxDistance={12} />
                <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={12} blur={2.5} far={4} color="#000000" />
            </Canvas>

            <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-end p-6">
                <AnimatePresence>
                    {isTesting && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto bg-slate-950/95 border-2 border-cyan-500 p-4 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center gap-4">
                            <Zap size={24} className="text-cyan-400 animate-pulse" />
                            <div><span className="block text-[10px] uppercase text-cyan-400 font-black tracking-widest">Stress Test Active</span><span className="font-mono text-2xl font-bold text-white">{foldCount.toLocaleString()} Cycles</span></div>
                        </motion.div>
                    )}
                    {isBroken && !isTesting && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto bg-rose-950/95 border-2 border-rose-500 p-4 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.6)] flex items-center gap-4 w-11/12 sm:w-auto">
                            <AlertTriangle size={32} className="text-rose-500 shrink-0" />
                            <div><span className="block text-[10px] uppercase text-rose-400 font-black tracking-widest">Catastrophic Failure</span><span className="text-xs font-bold text-rose-200">The OLED screen snapped at 10,000 folds! Needs Micro-Hinges.</span></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* RIGHT/BOTTOM: CONTROLS */}
        <div className="w-full md:w-[40%] flex flex-col gap-3 min-h-0 z-10 overflow-y-auto">
            {mission === 1 ? (
                <div className="bg-white rounded-xl shadow-xl border-4 border-slate-200 p-4 flex flex-col h-full">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-3 flex items-center gap-2 border-b-2 border-slate-100 pb-2"><Cpu size={18} className="text-indigo-500" /> Hardware Engineering</h3>
                    <p className="text-xs font-medium text-slate-600 mb-4 leading-relaxed">Flexible OLEDs can bend, but without complex mechanics behind the crease, they will buckle and snap under pressure.</p>
                    <button onClick={() => { playClick(); setHasHinges(true); setIsBroken(false); setFoldCount(0); }} disabled={hasHinges || isTesting} className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all mb-4 ${hasHinges ? 'bg-slate-900 border-slate-950 shadow-lg shadow-indigo-500/20' : 'bg-slate-50 border-slate-300 hover:border-indigo-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasHinges ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-slate-200 text-slate-500'}`}><Settings size={20} className={hasHinges ? "animate-[spin_4s_linear_infinite]" : ""} /></div>
                        <div className="text-left"><span className={`block font-black text-xs uppercase ${hasHinges ? 'text-white' : 'text-slate-700'}`}>Install Micro-Hinges</span><span className={`block text-[10px] ${hasHinges ? 'text-slate-400' : 'text-slate-500'}`}>Dozens of gears to relieve tension.</span></div>
                        {hasHinges && <ShieldCheck size={20} className="text-emerald-400 ml-auto shrink-0" />}
                    </button>
                    <div className="mt-auto">
                        <button onClick={handleRunTest} disabled={isTesting} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"><Zap size={18} className={isTesting ? "animate-pulse text-amber-400" : "text-amber-400"} /> {isTesting ? "Testing..." : "Run 200,000 Fold Test"}</button>
                    </div>
                    <AnimatePresence>
                        {hardwarePassed && !isTesting && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3"><button onClick={() => { playChime(); setMission(2); }} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl uppercase tracking-widest shadow-md">Proceed to Software UI</button></motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col gap-3 h-full">
                    {/* Premium Software Logic Panel */}
                    <div className="bg-white rounded-xl shadow-xl border-4 border-slate-200 flex flex-col h-full overflow-hidden">
                        <div className="p-4 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-3 border-b-2 border-slate-100 pb-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center border border-indigo-200 shrink-0">
                                    <Cpu size={16} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Logic Controller</h3>
                                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Software Engineering</span>
                                </div>
                            </div>
                            
                            <p className="text-[11px] font-medium text-slate-600 mb-3 leading-relaxed">Map each physical hinge angle to the correct layout mode.</p>
                            
                            <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
                                {[{ angle: 0, label: "0° (Folded)", icon: Smartphone }, { angle: 90, label: "90° (Half Open)", icon: MonitorPlay }, { angle: 180, label: "180° (Flat Open)", icon: Tablet }].map(sensor => {
                                    const isMapped = logicMap[sensor.angle as 0|90|180] !== null;
                                    const isCorrect = logicMap[sensor.angle as 0|90|180] === (sensor.angle === 0 ? 'cover' : sensor.angle === 90 ? 'laptop' : 'tablet');
                                    
                                    return (
                                        <div key={sensor.angle} className={`flex flex-col gap-2 p-2 rounded-xl border-2 transition-colors ${isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-2">
                                                    <sensor.icon size={14} className={isCorrect ? "text-emerald-500" : "text-slate-400"} />
                                                    <span className={`text-[11px] font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-700' : 'text-slate-700'}`}>{sensor.label}</span>
                                                </div>
                                                {isCorrect ? <ShieldCheck size={16} className="text-emerald-500" /> : isMapped ? <AlertTriangle size={16} className="text-amber-500" /> : <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />}
                                            </div>
                                            
                                            <div className="flex gap-2 w-full">
                                                {(['cover', 'laptop', 'tablet'] as const).map(layout => {
                                                    const isSelected = logicMap[sensor.angle as 0|90|180] === layout;
                                                    const LayoutIcon = layout === 'cover' ? Smartphone : layout === 'laptop' ? MonitorPlay : Tablet;
                                                    const layoutName = layout === 'cover' ? 'Cover' : layout === 'laptop' ? 'Split' : 'Tablet';
                                                    
                                                    return (
                                                        <button 
                                                            key={layout} 
                                                            onClick={() => handleMapLogic(sensor.angle as 0|90|180, layout)} 
                                                            className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-lg border-2 transition-all duration-300 ${
                                                                isSelected 
                                                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.3)] transform scale-[1.02]' 
                                                                : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-500'
                                                            }`}
                                                        >
                                                            <LayoutIcon size={12} className={isSelected ? "text-indigo-200" : "text-slate-300"} />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{layoutName}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Interactive Hinge Slider (Footer) */}
                        <div className="mt-auto bg-slate-50 border-t-2 border-slate-200 p-4 shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Live Sensor Override</span>
                                </div>
                                <div className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-200">
                                    <span className="text-xs font-black text-indigo-600">{foldAngle}°</span>
                                </div>
                            </div>
                            <input type="range" min="0" max="180" step="1" value={foldAngle} onChange={handleSliderChange} className="w-full h-2 bg-slate-300 rounded-full appearance-none cursor-pointer accent-indigo-600 shadow-inner" />
                            <div className="flex justify-between mt-2 px-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                <span>0° (Folded)</span>
                                <span>90° (Laptop)</span>
                                <span>180° (Tablet)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </LabShell>
  );
}
