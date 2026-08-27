"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Colossus3DSceneProps {
  level: 1 | 2 | 3;
  phase: "intercept" | "patch" | "decrypt" | "output";
  tapeLoaded: boolean;
  wiresPatched: boolean;
  cipherKey: number;
  isDecrypting: boolean;
  onComponentClick: (component: string) => void;
  onKeyChange: (delta: number) => void;
}

// Reusable glowing tube grid using InstancedMesh for high performance
const TubeGrid = ({ position, isDecrypting, count = 200 }: { position: [number, number, number], isDecrypting: boolean, count?: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Calculate grid layout
  const cols = Math.floor(Math.sqrt(count * 2));
  const rows = Math.ceil(count / cols);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (i >= count) break;
        
        // Position each tube
        dummy.position.set(
          (c - cols / 2) * 0.4,
          (r - rows / 2) * 0.6,
          0
        );
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        
        // Set dynamic emissive color if decrypting
        if (isDecrypting) {
          const timeOffset = i * 0.1;
          const pulse = Math.sin(state.clock.elapsedTime * 15 + timeOffset) * 0.5 + 0.5;
          meshRef.current.setColorAt(i, new THREE.Color().setHSL(0.05 + pulse * 0.05, 1, pulse > 0.7 ? 1 : 0.4));
        } else {
          meshRef.current.setColorAt(i, new THREE.Color('#331100')); // Dim standby
        }
        i++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* Background panel */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[cols * 0.4 + 0.5, rows * 0.6 + 0.5, 0.2]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 12]} />
        {/* Realistic Glass Material */}
        <meshPhysicalMaterial 
          transparent={true} 
          opacity={0.8} 
          metalness={0.1} 
          roughness={0.1}
          transmission={0.9} // Glass effect
          ior={1.5}
          thickness={0.5}
          emissive="#ff5500"
          emissiveIntensity={1}
        />
      </instancedMesh>
    </group>
  );
};

// Paper tape reader with spinning reels
const TapeReader = ({ position, tapeLoaded, isDecrypting, onClick }: { position: [number, number, number], tapeLoaded: boolean, isDecrypting: boolean, onClick: () => void }) => {
  const leftReel = useRef<THREE.Mesh>(null);
  const rightReel = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (isDecrypting && leftReel.current && rightReel.current) {
      leftReel.current.rotation.z -= 0.3;
      rightReel.current.rotation.z -= 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Main console body */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Tape reader bed */}
      <mesh position={[0, 0.1, 0.5]}>
        <boxGeometry args={[3, 0.2, 1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Reels */}
      <mesh ref={leftReel} position={[-1.2, 1, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        {/* Tape wound up */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      </mesh>
      
      <mesh ref={rightReel} position={[1.2, 1, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        {/* Tape wound up */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      </mesh>

      {/* Paper tape strip between reels */}
      {tapeLoaded && (
        <mesh position={[0, 0.2, 0.5]}>
          <boxGeometry args={[2.4, 0.02, 0.2]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      )}

      {/* Interactive Hitbox for loading tape */}
      {!tapeLoaded && (
        <Html position={[0, 1.5, 0.5]} center zIndexRange={[100, 0]}>
          <div 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="px-4 py-2 rounded-xl bg-amber-500/90 text-amber-950 shadow-xl border-2 border-amber-300 text-xs font-black uppercase cursor-pointer hover:scale-110 transition-transform animate-bounce whitespace-nowrap"
          >
            Load Paper Tape
          </div>
        </Html>
      )}
    </group>
  );
};

// Patch panel for programmable logic
const PatchPanel = ({ position, wiresPatched, onClick }: { position: [number, number, number], wiresPatched: boolean, onClick: () => void }) => {
  return (
    <group position={position}>
      {/* Panel backboard */}
      <mesh>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Grid of holes */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[2.8, 3.8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Wires */}
      {wiresPatched && (
        <group>
          {/* Detailed Wires */}
          <mesh position={[-0.5, 0, 0.2]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.04, 0.04, 2.5, 12]} />
            <meshStandardMaterial color="#ef4444" roughness={0.8} />
          </mesh>
          <mesh position={[0.5, -0.5, 0.3]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.04, 0.04, 2, 12]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1, 0.25]} rotation={[0, 0, Math.PI / 2.5]}>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 12]} />
            <meshStandardMaterial color="#10b981" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* Interactive Hitbox for patching */}
      {!wiresPatched && (
        <Html position={[0, 0, 0.5]} center zIndexRange={[100, 0]}>
          <div 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="px-4 py-2 rounded-xl bg-emerald-500/90 text-emerald-950 shadow-xl border-2 border-emerald-300 text-xs font-black uppercase cursor-pointer hover:scale-110 transition-transform animate-bounce whitespace-nowrap"
          >
            Patch Logic Gates
          </div>
        </Html>
      )}
    </group>
  );
};

// Teleprinter Desk for output
const Teleprinter = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Desk */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[3, 2, 2.5]} />
        <meshStandardMaterial color="#64748b" metalness={0.2} roughness={0.9} />
      </mesh>
      {/* Typewriter body */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.5, 0.6, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Paper sticking out */}
      <mesh position={[0, 0.6, -0.2]} rotation={[-Math.PI / 4, 0, 0]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
};

// Cipher Key Configurator for Levels 2 & 3
const CipherKeySelector = ({ position, level, cipherKey, onKeyChange }: { position: [number, number, number], level: number, cipherKey: number, onKeyChange: (delta: number) => void }) => {
  if (level < 2) return null; // Only shows in Level 2+

  return (
    <group position={position}>
      {/* Selector Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.5, 1]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
      
      <Html position={[0, 0, 0.6]} center zIndexRange={[100, 0]}>
        <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-3 flex flex-col items-center gap-2 shadow-xl select-none">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cipher Key</div>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onKeyChange(-1); }}
              className="w-8 h-8 rounded bg-slate-800 text-white font-bold hover:bg-slate-700 active:bg-slate-600 transition-colors"
            >
              -
            </button>
            <div className="text-2xl font-mono text-amber-400 font-black w-12 text-center bg-black/50 py-1 rounded">
              {cipherKey.toString().padStart(3, '0')}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onKeyChange(1); }}
              className="w-8 h-8 rounded bg-slate-800 text-white font-bold hover:bg-slate-700 active:bg-slate-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default function Colossus3DScene({ level, phase, tapeLoaded, wiresPatched, cipherKey, isDecrypting, onComponentClick, onKeyChange }: Colossus3DSceneProps) {
  return (
    <div className="w-full h-full relative bg-[#cbd5e1]">
      <Canvas camera={{ position: [0, 3, 14], fov: 50 }}>
        {/* Lighter, softer ambient light for industrial room look */}
        <ambientLight intensity={1.5} />
        {/* Soft overhead light */}
        <directionalLight position={[5, 15, 5]} intensity={2} castShadow color="#ffffff" />
        {/* Key fill light */}
        <pointLight position={[-5, 5, 5]} intensity={1.5} color="#e2e8f0" distance={20} />
        
        {/* Emissive glow from tubes, bounces onto floor */}
        <pointLight position={[0, 2, -1]} intensity={isDecrypting ? 5 : 1} color="#ff5500" distance={15} />

        <group position={[0, -1.5, -2]}>
          {/* Main Colossus Frame (Massive) */}
          {/* Left Rack (Tubes) */}
          <TubeGrid position={[-4.2, 2, -2]} isDecrypting={isDecrypting} count={300} />
          {/* Center Rack (Tubes) */}
          <TubeGrid position={[0, 2, -2]} isDecrypting={isDecrypting} count={400} />
          {/* Right Rack (Tubes) */}
          <TubeGrid position={[4.2, 2, -2]} isDecrypting={isDecrypting} count={300} />

          {/* Top connecting cable tray */}
          <mesh position={[0, 4.5, -2]}>
            <boxGeometry args={[12, 0.4, 0.6]} />
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.5} />
          </mesh>

          {/* Paper Tape Reader (Foreground Left) */}
          <TapeReader 
            position={[-5, -0.5, 3]} 
            tapeLoaded={tapeLoaded} 
            isDecrypting={isDecrypting} 
            onClick={() => onComponentClick('reader')} 
          />

          {/* Patch Panel (Foreground Right) */}
          <PatchPanel 
            position={[3, 1, 1]} 
            wiresPatched={wiresPatched} 
            onClick={() => onComponentClick('panel')} 
          />

          {/* Cipher Key Selector (Foreground Center) - Appears Level 2+ */}
          <CipherKeySelector 
            level={level}
            cipherKey={cipherKey}
            onKeyChange={onKeyChange}
            position={[-1, -0.5, 2.5]}
          />

          {/* Teleprinter Desk (Far Right) */}
          <Teleprinter position={[6.5, -0.5, 3]} />
          
          {/* Floor */}
          <mesh position={[0, -1.6, 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 20]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.8} />
          </mesh>
          
          <ContactShadows position={[0, -1.5, 2]} opacity={0.6} scale={30} blur={2.5} far={10} color="#0f172a" />
        </group>

        {/* Dynamic camera orbit based on phase */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={5}
          maxDistance={25}
          autoRotate={isDecrypting}
          autoRotateSpeed={1.5}
        />
      </Canvas>
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle, transparent 50%, rgba(51,65,85,0.4) 100%)' }} />
    </div>
  );
}
