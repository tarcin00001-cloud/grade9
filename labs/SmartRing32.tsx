"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceArea } from 'recharts';
import { useLMSBridge } from "@/hooks/useLMSBridge";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { Activity, Bluetooth, Thermometer, Radio, Brain, Battery, Zap, CheckCircle2, XCircle, AlertTriangle, Smartphone, CreditCard, Play, Fingerprint } from "lucide-react";

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

// Expanding signal-wave ring: scales up and fades out on a loop, phase-offset per
// instance so several waves are always mid-flight — the classic "sending data" cue.
function SignalWave({ color, phaseOffset, active, position }: { color: string; phaseOffset: number; active: boolean; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    if (!active) {
      materialRef.current.opacity = 0;
      return;
    }
    const cycle = 1.1; // seconds per wave
    const t = ((state.clock.elapsedTime + phaseOffset) % cycle) / cycle; // 0..1
    const scale = 0.3 + t * 1.4;
    meshRef.current.scale.set(scale, scale, scale);
    materialRef.current.opacity = (1 - t) * 0.8;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.3, 0.36, 32]} />
      <meshBasicMaterial ref={materialRef} color={color} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function RingMesh({ pulseColor, dead }: { pulseColor: string | null, dead: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const bandMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const ledMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (!dead) {
        // Tilt the ring off-axis so its band is visible edge-on, then spin continuously
        // around world Y — a jewelry-turntable rotation showing the full 360° band.
        groupRef.current.rotation.x = 0.9;
        groupRef.current.rotation.y += delta * 0.6;
      } else {
        groupRef.current.rotation.x = 0.5;
      }
    }

    // Pulsing glow effect on the sensor inlay
    if (bandMaterialRef.current && pulseColor && !dead) {
      const intensity = (Math.sin(state.clock.elapsedTime * 4) + 1) / 2; // 0 to 1
      bandMaterialRef.current.emissiveIntensity = 0.3 + (intensity * 1.2);
    }

    // The IoT status LED blinks independently — the "always connected" heartbeat
    if (ledMaterialRef.current && !dead) {
      const blink = Math.sin(state.clock.elapsedTime * 6) > 0.7 ? 1 : 0.15;
      ledMaterialRef.current.emissiveIntensity = blink * 2;
    }
  });

  const accentColor = pulseColor && !dead ? pulseColor : "#38bdf8";
  const RADIUS = 2.2;
  const transmitting = !!pulseColor && !dead;

  return (
    <group ref={groupRef}>
      {/* Brushed-titanium band. A slim torus flattened on Z (scale) gives a rounded, low-profile
          ring silhouette instead of a fat donut tube — closer to a real wearable band. */}
      <mesh castShadow receiveShadow scale={[1, 1, 0.62]}>
        <torusGeometry args={[RADIUS, 0.34, 48, 128]} />
        <meshPhysicalMaterial
          color={dead ? "#3f4a5c" : "#cbd5e1"}
          metalness={dead ? 0.4 : 0.95}
          roughness={dead ? 0.85 : 0.25}
          clearcoat={dead ? 0 : 0.5}
          clearcoatRoughness={0.2}
          envMapIntensity={dead ? 0.3 : 1.8}
        />
      </mesh>

      {/* Ceramic sensor inlay — a slightly smaller, thinner concentric ring set into the
          front face, representing the ECG/temperature contact array. */}
      <mesh position={[0, 0, 0.12]} scale={[1, 1, 0.4]}>
        <torusGeometry args={[RADIUS, 0.16, 24, 128]} />
        <meshStandardMaterial
          ref={bandMaterialRef}
          color={dead ? "#1e293b" : "#0b1220"}
          metalness={0.2}
          roughness={0.55}
          emissive={dead ? "#000000" : accentColor}
          emissiveIntensity={dead ? 0 : 0.25}
        />
      </mesh>

      {/* Main sensor module (ECG/temp die) — smooth rounded capsule, no sharp corners,
          sitting proud on the band's outer face at the 12 o'clock position. Sized up
          and lifted clear of the band so it reads as a distinct component, not a bump. */}
      <mesh position={[0, RADIUS + 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.28, 0.34, 8, 16]} />
        <meshPhysicalMaterial
          color={dead ? "#1e293b" : "#0f172a"}
          metalness={0.7}
          roughness={0.3}
          clearcoat={0.6}
        />
      </mesh>

      {/* Status LED embedded in the sensor module — blinks to show the ring is IoT-connected */}
      <mesh position={[0, RADIUS + 0.28, 0.14]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          ref={ledMaterialRef}
          color={dead ? "#334155" : accentColor}
          emissive={dead ? "#000000" : accentColor}
          emissiveIntensity={dead ? 0 : 2}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, RADIUS + 0.28, 0.3]} color={accentColor} intensity={dead ? 0 : 0.8} distance={1.5} />

      {/* Signal waves — expanding rings emanating from the sensor module while the ring
          is actively transmitting (Bluetooth sync, ECG polling, etc), the same moments
          pulseColor is set. Three staggered so waves keep going out continuously. */}
      <SignalWave color={accentColor} phaseOffset={0} active={transmitting} position={[0, RADIUS + 0.28, 0.14]} />
      <SignalWave color={accentColor} phaseOffset={0.37} active={transmitting} position={[0, RADIUS + 0.28, 0.14]} />
      <SignalWave color={accentColor} phaseOffset={0.74} active={transmitting} position={[0, RADIUS + 0.28, 0.14]} />

      {/* Secondary chip module (Bluetooth/NFC radio) — a flat rectangular die mounted
          beside the main sensor, clearly a second distinct component. */}
      <mesh position={[0.55, RADIUS - 0.15, 0.15]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.32, 0.1, 0.24]} />
        <meshPhysicalMaterial color={dead ? "#292524" : "#1e293b"} metalness={0.6} roughness={0.35} clearcoat={0.4} />
      </mesh>

      {/* NFC / Bluetooth antenna coil — a thick conductive loop set into the band, the
          classic visual signature of wireless comm hardware (this is what makes tap-to-pay
          and Bluetooth sync actually work, not just the sensor die). Bulked up and raised
          proud of the band so the copper trace is unmistakable at a glance. */}
      <mesh position={[0, 0, 0.22]}>
        <torusGeometry args={[RADIUS - 0.34, 0.06, 12, 128]} />
        <meshStandardMaterial
          color={dead ? "#57534e" : "#d97706"}
          metalness={0.9}
          roughness={0.3}
          emissive={dead ? "#000000" : "#f59e0b"}
          emissiveIntensity={dead ? 0 : (pulseColor ? 1.2 : 0.4)}
        />
      </mesh>

      {/* Battery cell — a curved segment slightly proud of the band surface, visually distinct
          (matte, darker) from the polished titanium shank, housing the power source. Sized
          fractionally larger than the band so it fully occludes that section with no z-fighting.
          The arc is centered on the bottom (6 o'clock) by rotating the mesh, not the geometry. */}
      <mesh rotation={[0, 0, Math.PI * 1.25]} scale={[1, 1, 0.66]} castShadow>
        <torusGeometry args={[RADIUS, 0.36, 24, 32, Math.PI * 0.5]} />
        <meshStandardMaterial
          color={dead ? "#292524" : "#1c1917"}
          metalness={0.5}
          roughness={0.6}
        />
      </mesh>

      {/* Charging contacts — two small flush pins on the battery segment where the ring
          docks into its charging cradle. */}
      <mesh position={[0.35, -RADIUS - 0.02, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.35, -RADIUS - 0.02, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Surface-mount components clustered on the second chip module — visible
          resistors/capacitors, sized to actually read at normal viewing distance. */}
      <mesh position={[0.55, RADIUS - 0.15, 0.29]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.09, 0.05, 0.13]} />
        <meshStandardMaterial color="#b45309" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.68, RADIUS - 0.22, 0.29]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.07, 0.05, 0.1]} />
        <meshStandardMaterial color="#78716c" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.42, RADIUS - 0.08, 0.29]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.06, 0.04, 0.09]} />
        <meshStandardMaterial color="#b45309" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Secondary indicator LED beside the antenna coil — a bright amber pinprick that
          confirms wireless hardware is present without competing with the main status LED. */}
      <mesh position={[RADIUS - 0.34, 0, 0.28]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color={dead ? "#57534e" : "#f59e0b"}
          emissive={dead ? "#000000" : "#f59e0b"}
          emissiveIntensity={dead ? 0 : 2}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[RADIUS - 0.34, 0, 0.4]} color="#f59e0b" intensity={dead ? 0 : 0.6} distance={1.2} />

      {/* ECG contact pads — three raised metal dots along the band's inner arc near
          the battery segment, the physical electrodes reading heart rhythm. Placed on
          the true ring circle by angle so they sit flush on the band's surface. */}
      {[Math.PI * 1.3, Math.PI * 1.5, Math.PI * 1.7].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0.24]}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}

      {dead && <pointLight color="#ef4444" intensity={2} distance={5} position={[0, 2, 2]} />}
    </group>
  );
}

function SmartRing3D({ pulseColor, dead }: { pulseColor: string | null, dead: boolean }) {
  return (
    <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 3, 7], fov: 45 }} shadows dpr={[1, 2]}>
        <ambientLight intensity={dead ? 0.2 : 0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        
        <RingMesh pulseColor={pulseColor} dead={dead} />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={20} blur={2.5} far={4} color="#000000" />
        <OrbitControls enableZoom={false} enablePan={false} makeDefault />
      </Canvas>
    </div>
  );
}

function BatteryHUD({ battery }: { battery: number }) {
  const isLow = battery < 20;
  return (
    <div className="absolute top-4 right-4 bg-slate-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 z-20">
      <Battery size={24} className={isLow ? "text-red-400" : "text-emerald-400"} />
      <div className="w-24 sm:w-32 h-6 bg-slate-900 rounded-full overflow-hidden relative shadow-inner border border-slate-700">
        <motion.div className={`absolute top-0 left-0 bottom-0 ${isLow ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} animate={{ width: `${battery}%` }} transition={{ duration: 0.1 }} />
      </div>
      <span className="font-black text-white w-12 text-right text-sm">{Math.round(battery)}%</span>
    </div>
  );
}

// ============================================================================
// MISSION 1: POWER BUDGET (Battery Drain)
// ============================================================================

function Mission1Power({ onWin }: { onWin: () => void }) {
  const { playPop, playZap, playSuccess } = useLabAudio();
  const [polling, setPolling] = useState<'always' | 'intermittent' | null>(null);
  const [running, setRunning] = useState(false);
  const [battery, setBattery] = useState(100);
  const [day, setDay] = useState(1);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!running) return;
    const rate = polling === 'always' ? 25 : 0.5; 
    const interval = setInterval(() => {
      setBattery(b => Math.max(0, b - rate));
      setDay(d => d + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [running, polling]);

  useEffect(() => {
    if (!running) return;
    if (battery <= 0) {
      setRunning(false);
      setFailed(true);
      playZap();
    } else if (day >= 7 && polling === 'intermittent') {
      setRunning(false);
      playSuccess();
      onWin();
    }
  }, [battery, day, running, polling]);

  const handleRun = () => { if (polling) { setBattery(100); setDay(1); setFailed(false); setRunning(true); playPop(); } };
  const reset = () => { setBattery(100); setDay(1); setFailed(false); setRunning(false); setPolling(null); };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex-1 bg-slate-50 rounded-3xl relative border-4 border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
        <BatteryHUD battery={battery} />
        <div className="absolute top-4 left-4 bg-slate-800 text-white px-4 py-2 rounded-xl font-black shadow-lg border border-slate-700 z-20 tracking-wider">DAY {Math.floor(day)} / 7</div>
        <SmartRing3D pulseColor={running ? (polling === 'always' ? '#ef4444' : '#10b981') : null} dead={failed} />
      </div>

      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm z-20 relative">
        <div className="flex-1 w-full flex flex-col items-center md:items-start min-w-0">
           <span className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">ECG Heart Rate Sensor</span>
           <div className="flex gap-2 w-full max-w-lg">
              <button onClick={() => { setPolling('always'); playPop(); }} disabled={running} className={`flex-1 py-4 font-black uppercase text-xs rounded-xl border-b-8 active:border-b-4 active:translate-y-1 transition-all ${polling === 'always' ? 'bg-sky-500 border-sky-700 text-white shadow-md shadow-sky-200' : 'bg-white border-slate-200 border-b-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm'} disabled:opacity-50`}>Always On</button>
              <button onClick={() => { setPolling('intermittent'); playPop(); }} disabled={running} className={`flex-1 py-4 font-black uppercase text-xs rounded-xl border-b-8 active:border-b-4 active:translate-y-1 transition-all ${polling === 'intermittent' ? 'bg-sky-500 border-sky-700 text-white shadow-md shadow-sky-200' : 'bg-white border-slate-200 border-b-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm'} disabled:opacity-50`}>Every 10 Mins</button>
           </div>
        </div>
        <div className="w-full md:w-auto shrink-0 flex">
          <button onClick={handleRun} disabled={!polling || running || day >= 7} className="flex-1 md:flex-none px-8 py-5 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-b-8 bg-emerald-500 border-emerald-700 text-white shadow-lg shadow-emerald-200 active:border-b-4 active:translate-y-1 disabled:opacity-50 disabled:shadow-none transition-all">
            <Play size={20}/> RUN SIMULATION
          </button>
        </div>
      </div>

      <AnimatePresence>
        {failed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] text-center max-w-lg shadow-2xl">
              <Zap size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase mb-4 tracking-widest">Battery Depleted!</h2>
              <p className="text-slate-600 mb-8 font-bold">You cannot run an ECG sensor continuously on a tiny ring battery. It drained completely in less than a day! Use intermittent polling to save power.</p>
              <button onClick={reset} className="w-full bg-red-600 text-white font-black py-4 text-lg rounded-xl border-b-8 border-red-800 active:border-b-4 active:translate-y-1">RECALIBRATE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MISSION 2: BLUETOOTH COMM COST
// ============================================================================

function Mission2Bluetooth({ onWin }: { onWin: () => void }) {
  const { playPop, playZap, playSuccess } = useLabAudio();
  const [sync, setSync] = useState<'continuous' | 'daily' | null>(null);
  const [running, setRunning] = useState(false);
  const [battery, setBattery] = useState(100);
  const [failed, setFailed] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (!running) return;
    const rate = sync === 'continuous' ? 40 : 1; 
    const interval = setInterval(() => {
      setBattery(b => Math.max(0, b - rate));
    }, 100);
    return () => clearInterval(interval);
  }, [running, sync]);

  useEffect(() => {
    if (!running) return;
    if (battery <= 0) {
      setRunning(false);
      setFailed(true);
      playZap();
    } else if (battery < 20 && sync === 'daily') {
      setRunning(false);
      setWon(true);
      playSuccess();
      onWin();
    }
  }, [battery, running, sync]);

  const handleRun = () => { if (sync) { setBattery(100); setFailed(false); setRunning(true); playPop(); } };
  const reset = () => { setBattery(100); setFailed(false); setWon(false); setRunning(false); setSync(null); };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex-1 bg-slate-50 rounded-3xl relative border-4 border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
        <BatteryHUD battery={battery} />
        {running && <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-blue-400 rounded-full" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ repeat: Infinity, duration: sync === 'continuous' ? 0.3 : 2 }} />}
        <SmartRing3D pulseColor={running ? '#3b82f6' : null} dead={failed} />
      </div>

      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm z-20 relative">
        <div className="flex-1 w-full flex flex-col items-center md:items-start min-w-0">
           <span className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Bluetooth Data Sync</span>
           <div className="flex gap-2 w-full max-w-lg">
              <button onClick={() => { setSync('continuous'); playPop(); }} disabled={running || won} className={`flex-1 py-4 font-black uppercase text-xs rounded-xl border-b-8 active:border-b-4 active:translate-y-1 transition-all ${sync === 'continuous' ? 'bg-blue-500 border-blue-700 text-white shadow-md shadow-blue-200' : 'bg-white border-slate-200 border-b-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm'} disabled:opacity-50`}>Live Streaming</button>
              <button onClick={() => { setSync('daily'); playPop(); }} disabled={running || won} className={`flex-1 py-4 font-black uppercase text-xs rounded-xl border-b-8 active:border-b-4 active:translate-y-1 transition-all ${sync === 'daily' ? 'bg-blue-500 border-blue-700 text-white shadow-md shadow-blue-200' : 'bg-white border-slate-200 border-b-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm'} disabled:opacity-50`}>Sync Once Daily</button>
           </div>
        </div>
        <div className="w-full md:w-auto shrink-0 flex">
          <button onClick={handleRun} disabled={!sync || running || won} className="flex-1 md:flex-none px-8 py-5 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-b-8 bg-emerald-500 border-emerald-700 text-white shadow-lg shadow-emerald-200 active:border-b-4 active:translate-y-1 disabled:opacity-50 disabled:shadow-none transition-all">
            <Bluetooth size={20}/> TEST COMM LINK
          </button>
        </div>
      </div>

      <AnimatePresence>
        {failed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] text-center max-w-lg shadow-2xl">
              <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase mb-4 tracking-widest">Comm Overload!</h2>
              <p className="text-slate-600 mb-8 font-bold">Transmitting wireless data (Bluetooth) costs massive amounts of power. Live streaming kills the ring instantly! Store data locally and sync daily.</p>
              <button onClick={reset} className="w-full bg-red-600 text-white font-black py-4 text-lg rounded-xl border-b-8 border-red-800 active:border-b-4 active:translate-y-1">RECALIBRATE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MISSION 3: ILLNESS DETECTION
// ============================================================================

function Mission3Illness({ onWin }: { onWin: () => void }) {
  const { playPop, playSuccess } = useLabAudio();
  const [running, setRunning] = useState(false);
  const [day, setDay] = useState(1);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setDay(d => d + 0.1);
    }, 50);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (day >= 7) {
      setRunning(false);
      setWon(true);
      playSuccess();
      onWin();
    }
  }, [day, running]);

  const handleRun = () => { setDay(1); setWon(false); setRunning(true); playPop(); };

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 1; i <= Math.min(day, 7.1); i += 0.1) {
       let temp = 98.6 + Math.sin(i * 10) * 0.15; // normal body temp noise
       if (i >= 4 && i <= 5.5) temp += 2.6 * Math.sin((i - 4) * Math.PI / 1.5); // spike up to 101.2
       data.push({ day: parseFloat(i.toFixed(1)), temp: parseFloat(temp.toFixed(2)) });
    }
    return data;
  }, [day]);

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex-1 bg-white rounded-3xl relative border-4 border-slate-200 shadow-sm overflow-hidden flex flex-col p-6 min-h-[300px]">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-center mb-6">7-Day Continuous Temperature Monitoring</h3>
        <div className="flex-1 relative w-full h-full max-w-5xl mx-auto">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
               <XAxis 
                 dataKey="day" 
                 type="number" 
                 domain={[1, 7]} 
                 ticks={[1, 2, 3, 4, 5, 6, 7]} 
                 stroke="#94a3b8" 
                 tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                 tickFormatter={(val) => `Day ${val}`} 
               />
               <YAxis 
                 domain={[97, 102]} 
                 stroke="#94a3b8" 
                 tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                 tickFormatter={(val) => `${val}°F`} 
               />
               <Line 
                 type="monotone" 
                 dataKey="temp" 
                 stroke="#ef4444" 
                 strokeWidth={5} 
                 dot={false} 
                 isAnimationActive={false} 
               />
               {won && (
                 <ReferenceArea x1={4} x2={5.5} fill="#fecaca" fillOpacity={0.4} />
               )}
             </LineChart>
           </ResponsiveContainer>
           
           {won && (
             <motion.div 
                className="absolute bg-red-100 border-4 border-red-500 text-red-600 px-6 py-2 rounded-full font-black tracking-widest shadow-xl z-20 flex flex-col items-center" 
                style={{ left: '60%', top: '2rem' }}
                initial={{ scale: 0, opacity: 0, x: "-50%", y: -20 }} 
                animate={{ scale: 1, opacity: 1, x: "-50%", y: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
             >
                FEVER DETECTED
                <div className="absolute top-full left-1/2 w-1 h-12 bg-red-500" style={{ borderLeft: '4px dashed #ef4444', backgroundColor: 'transparent', transform: 'translateX(-50%)' }} />
             </motion.div>
           )}
        </div>
      </div>

      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm z-20 relative">
        <div className="flex-1 w-full flex flex-col justify-center min-w-0">
           <h3 className="font-black text-slate-800 uppercase tracking-wider mb-1 text-lg">Early COVID-19 Detection</h3>
           <p className="text-sm text-slate-600 font-bold leading-relaxed">Researchers proved that continuous ring monitoring can detect subtle temperature and heart-rate spikes days before a patient feels sick.</p>
        </div>
        <div className="w-full md:w-auto shrink-0 flex gap-2">
          <button onClick={handleRun} disabled={running || won} className="flex-1 md:flex-none px-8 py-5 rounded-xl font-black text-sm border-b-8 bg-emerald-500 border-emerald-700 text-white shadow-lg shadow-emerald-200 active:border-b-4 active:translate-y-1 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 transition-all">
            <Thermometer size={20}/> ANALYZE PATIENT DATA
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MISSION 4: GESTURES & UTILITIES
// ============================================================================

function Mission4Gestures({ onWin }: { onWin: () => void }) {
  const { playPop, playZap, playSuccess } = useLabAudio();
  const [mode, setMode] = useState<'always' | 'triggered' | null>(null);
  const [tapped, setTapped] = useState(false);
  const [won, setWon] = useState(false);

  const handleTap = () => {
     if (!mode) return;
     setTapped(true);
     if (mode === 'triggered') {
        playSuccess();
        setWon(true);
        setTimeout(onWin, 2000);
     } else {
        playZap();
     }
  };

  const reset = () => { setTapped(false); setWon(false); setMode(null); };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex-1 bg-slate-50 rounded-3xl relative border-4 border-slate-200 shadow-sm flex flex-col items-center justify-center overflow-hidden min-h-0">
         {/* Background Grid */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" preserveAspectRatio="none">
            <pattern id="desk-grid" width="40" height="40" patternUnits="userSpaceOnUse">
               <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#desk-grid)" />
         </svg>

         {/* POS Terminal Base */}
         <div className="relative w-56 sm:w-64 h-56 sm:h-64 bg-slate-800 rounded-3xl border-8 border-slate-900 flex flex-col items-center p-4 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.5)] z-10 mt-8">
            {/* Terminal Screen */}
            <div className={`w-full h-28 sm:h-32 rounded-xl border-4 ${tapped ? (mode === 'triggered' ? 'bg-emerald-900 border-emerald-500' : 'bg-red-900 border-red-500') : 'bg-slate-900 border-slate-700'} flex flex-col items-center justify-center p-2 transition-colors duration-300 relative overflow-hidden`}>
               {/* Screen Glare */}
               <div className="absolute top-0 left-0 right-0 h-1/2 bg-white opacity-5 rounded-t-lg pointer-events-none" />
               
               {tapped && mode === 'triggered' ? (
                 <>
                   <CheckCircle2 size={32} className="text-emerald-400 mb-1" />
                   <span className="font-black text-emerald-400 text-[10px] sm:text-xs tracking-widest text-center leading-tight">PAYMENT<br/>ACCEPTED</span>
                 </>
               ) : tapped && mode === 'always' ? (
                 <>
                   <Battery size={32} className="text-red-500 mb-1" />
                   <span className="font-black text-red-500 text-[10px] sm:text-xs tracking-widest text-center leading-tight">RING<br/>DEAD</span>
                 </>
               ) : (
                 <>
                   <span className="font-black text-slate-400 text-[10px] tracking-widest mb-1">AMOUNT DUE</span>
                   <span className="font-black text-white text-xl sm:text-2xl mb-1 sm:mb-2">$4.50</span>
                   <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                     <Fingerprint size={20} className="text-sky-400" />
                   </motion.div>
                 </>
               )}
            </div>
            
            {/* Terminal Branding */}
            <p className="absolute bottom-4 font-black text-slate-500 tracking-widest text-[10px] sm:text-xs">SQUARE TERMINAL</p>
            
            {/* The Floating 3D Ring */}
            <motion.div 
               className="absolute -top-20 sm:-top-24 cursor-pointer w-32 h-32 sm:w-40 sm:h-40 z-20" 
               animate={tapped ? { y: 110, scale: 0.9 } : { y: [-10, 10, -10], scale: 1 }} 
               transition={tapped ? { type: "spring", stiffness: 400, damping: 25 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
               onClick={handleTap}
            >
               <SmartRing3D pulseColor={tapped ? (mode === 'triggered' ? '#10b981' : '#ef4444') : null} dead={false} />
               
               {/* Call to action tooltip pointing at ring */}
               {!tapped && mode && (
                 <motion.div className="absolute top-1/2 -right-24 sm:-right-32 -translate-y-1/2 bg-slate-800 text-white font-black text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-xl" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-6 border-r-slate-800 border-b-6 border-b-transparent" />
                    CLICK TO TAP
                 </motion.div>
               )}
            </motion.div>
            
            {/* Impact Ripple */}
            {tapped && mode === 'triggered' && (
              <motion.div className="absolute top-16 w-24 h-24 border-4 border-emerald-400 rounded-full z-10 pointer-events-none" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} />
            )}
         </div>
      </div>

      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm z-20 relative">
        <div className="flex-1 w-full flex flex-col items-center md:items-start min-w-0">
           <span className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Accelerometer Wakeup Protocol</span>
           <div className="flex gap-2 w-full max-w-lg">
              <button onClick={() => { setMode('always'); setTapped(false); playPop(); }} disabled={won} className={`flex-1 py-4 font-black uppercase text-[10px] sm:text-xs rounded-xl border-b-8 active:border-b-4 active:translate-y-1 transition-all ${mode === 'always' ? 'bg-sky-500 border-sky-700 text-white shadow-md shadow-sky-200' : 'bg-white border-slate-200 border-b-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm'} disabled:opacity-50`}>Always On (Searching)</button>
              <button onClick={() => { setMode('triggered'); setTapped(false); playPop(); }} disabled={won} className={`flex-1 py-4 font-black uppercase text-[10px] sm:text-xs rounded-xl border-b-8 active:border-b-4 active:translate-y-1 transition-all ${mode === 'triggered' ? 'bg-sky-500 border-sky-700 text-white shadow-md shadow-sky-200' : 'bg-white border-slate-200 border-b-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm'} disabled:opacity-50`}>Triggered by Tap</button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {tapped && mode === 'always' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] text-center max-w-lg shadow-2xl">
              <Zap size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase mb-4 tracking-widest">Battery Depleted!</h2>
              <p className="text-slate-600 mb-8 font-bold">If the NFC payment chip is "Always On" constantly searching for a terminal, the battery dies in hours. Use the low-power accelerometer to detect a "Tap" gesture to wake up the payment chip!</p>
              <button onClick={reset} className="w-full bg-red-600 text-white font-black py-4 text-lg rounded-xl border-b-8 border-red-800 active:border-b-4 active:translate-y-1">RECALIBRATE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MISSION 5: THE LIFESTYLE HUB (Assessment)
// ============================================================================

const NODES = [
  { id: 'clinic', label: 'The Clinic', sub: 'Fever Detection', icon: Thermometer, chip: 'temp', cx: 15, cy: 15 },
  { id: 'bedroom', label: 'The Bedroom', sub: 'Heart Rhythm', icon: Activity, chip: 'ecg', cx: 85, cy: 15 },
  { id: 'coffee', label: 'Coffee Shop', sub: 'Tap to Pay', icon: CreditCard, chip: 'accel', cx: 15, cy: 85 },
  { id: 'phone', label: 'Smartphone', sub: 'Data Sync', icon: Smartphone, chip: 'blue', cx: 85, cy: 85 },
];

const CHIPS = [
  { id: 'temp', label: 'Temp Sensor', color: 'emerald' },
  { id: 'ecg', label: 'ECG Sensor', color: 'rose' },
  { id: 'accel', label: 'NFC + Accel', color: 'amber' },
  { id: 'blue', label: 'Bluetooth', color: 'blue' }
];



function Mission5Assessment({ onComplete }: { onComplete: () => void }) {
  const { playPop, playSuccess, playZap } = useLabAudio();
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [connected, setConnected] = useState<Record<string, string>>({});
  const [errorNode, setErrorNode] = useState<string | null>(null);

  const handleNodeClick = (node: typeof NODES[0]) => {
     if (connected[node.id]) return; // already connected
     if (!selectedChip) return; // must select a chip first
     
     if (selectedChip === node.chip) {
        const newConnected = { ...connected, [node.id]: selectedChip };
        setConnected(newConnected);
        setSelectedChip(null);
        playPop();
        
        if (Object.keys(newConnected).length === NODES.length) {
           playSuccess();
           setTimeout(onComplete, 1500);
        }
     } else {
        playZap();
        setErrorNode(node.id);
        setTimeout(() => setErrorNode(null), 1000);
     }
  };

  if (Object.keys(connected).length >= NODES.length) {
     return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full">
           <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute inset-0 rounded-full border-8 border-dashed border-sky-200" />
              <CheckCircle2 size={100} className="text-emerald-500 drop-shadow-lg z-10" />
           </div>
           <h2 className="text-4xl sm:text-5xl font-black text-slate-800 uppercase tracking-widest text-center mb-2">Hardware Integrated</h2>
           <p className="text-slate-500 font-bold text-lg">The Smart Ring is fully connected to day-to-day life.</p>
        </motion.div>
     );
  }

  return (
    <div className="flex flex-col h-full gap-4 relative">
      
      {/* 3D Hub Area */}
      <div className="flex-1 bg-white rounded-3xl relative border-4 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center min-h-[300px]">
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
         
         {/* Connecting Lines */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {NODES.map(n => connected[n.id] && (
               <motion.line key={n.id} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} x1="50%" y1="50%" x2={`${n.cx}%`} y2={`${n.cy}%`} stroke="#0ea5e9" strokeWidth="6" strokeDasharray="10 10" className="animate-pulse" />
            ))}
         </svg>

         {/* Background 3D Ring (Fills whole container for 360 drag) */}
         <SmartRing3D pulseColor="#38bdf8" dead={false} />

         {/* Orbiting Nodes */}
         {NODES.map(n => {
            const isConnected = !!connected[n.id];
            const isError = errorNode === n.id;
            const Icon = n.icon;
            
            return (
               <button 
                  key={n.id} 
                  onClick={() => handleNodeClick(n)}
                  className={`absolute z-20 flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-4 transition-all transform -translate-x-1/2 -translate-y-1/2 ${isConnected ? 'bg-sky-50 border-sky-400 scale-110 shadow-lg shadow-sky-200' : isError ? 'bg-red-50 border-red-500 scale-95' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:scale-105'} ${selectedChip && !isConnected ? 'ring-4 ring-emerald-400 ring-opacity-50 cursor-crosshair' : ''}`}
                  style={{ left: `${n.cx}%`, top: `${n.cy}%` }}
               >
                  <Icon size={32} className={`mb-2 ${isConnected ? 'text-sky-500' : isError ? 'text-red-500' : 'text-slate-400'}`} />
                  <span className={`font-black uppercase text-[10px] sm:text-xs tracking-widest ${isConnected ? 'text-sky-700' : 'text-slate-600'}`}>{n.label}</span>
                  <span className="text-[9px] font-bold text-slate-400">{isConnected ? 'INTEGRATED' : n.sub}</span>
               </button>
            );
         })}
      </div>

      {/* Hardware Tray */}
      <div className="shrink-0 bg-white rounded-3xl border-4 border-slate-200 p-4 sm:p-6 flex flex-col items-center gap-4 shadow-sm relative z-30">
        <h3 className="font-black text-slate-800 uppercase tracking-widest">Hardware Inventory (Select to Install)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
           {CHIPS.map(c => {
              const isUsed = Object.values(connected).includes(c.id);
              const isSelected = selectedChip === c.id;
              
              return (
                 <button 
                    key={c.id} 
                    onClick={() => { if (!isUsed) { setSelectedChip(c.id); playPop(); } }}
                    disabled={isUsed}
                    className={`p-3 sm:p-4 rounded-xl border-b-8 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all ${isUsed ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 border-b-4 translate-y-1' : isSelected ? 'bg-emerald-500 border-emerald-700 text-white border-b-4 translate-y-1 ring-4 ring-emerald-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 active:border-b-4 active:translate-y-1'}`}
                 >
                    {c.label}
                 </button>
              );
           })}
        </div>
      </div>

    </div>
  );
}

// ============================================================================
// MAIN LAB SHELL
// ============================================================================

const TABS = [
  { id: 'm1', title: '1. Power Budget', icon: Battery },
  { id: 'm2', title: '2. Comm Cost', icon: Radio },
  { id: 'm3', title: '3. Diagnostics', icon: Thermometer },
  { id: 'm4', title: '4. Gestures', icon: Fingerprint },
  { id: 'm5', title: '5. Assessment', icon: Brain }
];

export default function SmartRing32() {
  const { reportComplete } = useLMSBridge("smartring32");
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState([false, false, false, false, false]);

  const completeTab = (index: number) => {
    const newCompleted = [...completedTabs];
    newCompleted[index] = true;
    setCompletedTabs(newCompleted);
    if (newCompleted.every(Boolean)) reportComplete({ points: 100 });
    else setTimeout(() => setActiveTab(t => Math.min(4, t + 1)), 1500);
  };

  return (
    <LabShell 
      labId="smartring32" 
      theme="ocean" 
      title="Miniaturization & Wearables"
      onReset={() => { setActiveTab(0); setCompletedTabs([false,false,false,false,false]); }}
      instruction="A Smart Ring has a battery smaller than a grain of rice. Master the tradeoffs of continuous monitoring versus ultra-low-power embedded algorithms." 
      compact
    >
      <Celebration isActive={completedTabs.every(Boolean)} message="Firmware Certified! You have mastered power-budget tradeoffs for wearable computing." onReplay={() => {}} />

      <div className="w-full flex flex-col flex-1 min-h-0 max-w-6xl mx-auto relative z-10 pt-2 gap-4">
        
        {/* Top Navigation Tabs */}
        <div className="shrink-0 w-full grid grid-cols-5 gap-2">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isCompleted = completedTabs[i];
            const isActive = activeTab === i;
            return (
              <button key={tab.id} onClick={() => { if (i <= activeTab || completedTabs[i-1] || i === 0) setActiveTab(i); }} className={`flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl border-b-4 transition-all ${isActive ? 'bg-sky-500 border-sky-700 text-white shadow-md -translate-y-1' : isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'} ${(!isCompleted && i > 0 && !completedTabs[i-1] && !isActive) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isCompleted ? <CheckCircle2 size={20} className="mb-1" /> : <Icon size={20} className="mb-1" />}
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center leading-tight hidden sm:block">{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Mission Workspace */}
        <div className="flex-1 min-h-0 bg-slate-50/50 rounded-[2rem] p-2 sm:p-4 border-2 border-slate-100">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full w-full">
              {activeTab === 0 && <Mission1Power onWin={() => completeTab(0)} />}
              {activeTab === 1 && <Mission2Bluetooth onWin={() => completeTab(1)} />}
              {activeTab === 2 && <Mission3Illness onWin={() => completeTab(2)} />}
              {activeTab === 3 && <Mission4Gestures onWin={() => completeTab(3)} />}
              {activeTab === 4 && <Mission5Assessment onComplete={() => completeTab(4)} />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </LabShell>
  );
}
