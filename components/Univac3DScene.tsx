"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows, Environment, useGLTF } from '@react-three/drei';
import './configureThreeConsole';

type ComponentId = "tubes" | "drives" | "memory" | "printer";

interface Univac3DSceneProps {
  placed: Record<ComponentId, boolean>;
  selectedComponent: string | null;
  hoveredComponent: string | null;
  onSlotClick: (id: ComponentId) => void;
  onSlotHover: (id: ComponentId | null) => void;
  poweringUp: boolean;
}

// Preload the GLTF
useGLTF.preload('/models/univac_computer_compressed.glb');

// The Actual GLB Model Component
const UnivacModel = () => {
  const { scene } = useGLTF('/models/univac_computer_compressed.glb');
  
  // Perfectly centered and scaled model, no rotation
  return (
    <primitive 
      object={scene} 
      position={[0, -1, 0]} 
      scale={[1.5, 1.5, 1.5]} 
      rotation={[0, 0, 0]}
    />
  );
};

// SVG components mapping
const SVG_ASSETS: Record<ComponentId, string> = {
  tubes: "/svgs/vaccum_tube.svg",
  drives: "/svgs/tape_drive.svg",
  memory: "/svgs/mercury_memory.svg",
  printer: "/svgs/uniprinter.svg"
};

// Reusable slot component (Floating 2D SVGs)
const ComponentSlot = ({ 
  id, 
  position, 
  isPlaced,
  isSelected,
  isHovered,
  onClick,
  onHover,
  label
}: { 
  id: ComponentId, 
  position: [number, number, number],
  isPlaced: boolean,
  isSelected: boolean,
  isHovered: boolean,
  onClick: () => void,
  onHover: (id: ComponentId | null) => void,
  label: string
}) => {
  const svgPath = SVG_ASSETS[id];

  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div 
        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
          isPlaced 
            ? 'opacity-80 scale-90' 
            : isSelected 
              ? 'bg-amber-500/20 border-2 border-amber-400 scale-110 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse' 
              : isHovered 
                ? 'bg-white/10 border-2 border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                : 'bg-black/40 border-2 border-slate-600/50 hover:border-slate-400'
        }`}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
      >
        <img 
          src={svgPath} 
          className={`w-16 h-16 object-contain mb-2 ${!isPlaced && 'drop-shadow-lg'}`} 
          alt={label} 
        />
        
        {isPlaced ? (
          <div className="flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-500/80 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">{label} ONLINE</span>
          </div>
        ) : (
          <div className={`px-2.5 py-1 rounded-full ${isSelected ? 'bg-amber-400 text-amber-950' : 'bg-black/60 text-slate-200'} text-[10px] font-black tracking-wider uppercase`}>
            {isSelected ? `CLICK TO INSTALL` : label}
          </div>
        )}
      </div>
    </Html>
  );
};

// Custom Loader
const Loader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/80 border border-amber-500/30 p-6 rounded-2xl backdrop-blur-md">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-amber-500 font-bold font-sans tracking-widest uppercase">Booting UNIVAC</div>
        <div className="text-slate-400 text-xs mt-1">Loading heavy 3D assets...</div>
      </div>
    </Html>
  );
};

export default function Univac3DScene({
  placed,
  selectedComponent,
  hoveredComponent,
  onSlotClick,
  onSlotHover,
  poweringUp
}: Univac3DSceneProps) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      {/* Power Up Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000"
        style={{ 
          background: poweringUp ? 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)' : 'transparent',
          opacity: poweringUp ? 1 : 0 
        }}
      />
      
      <Canvas camera={{ position: [0, 2, 9], fov: 50 }}>
        <color attach="background" args={['#ffffff']} />
        
        {/* Premium Lighting */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={1} color="#3b82f6" />
        
        <Environment preset="city" />
        
        {/* Camera Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={3}
          maxDistance={15}
        />

        <Suspense fallback={<Loader />}>
          <group position={[0, 0, 0]}>
            {/* Perfectly Centered UNIVAC Model */}
            <UnivacModel />
            
            {/* 
              Floating 2D SVG Interfaces
              These are HTML overlays mapped to specific 3D coordinates around the central machine.
            */}
            <ComponentSlot 
              id="tubes" 
              label="Vacuum Tubes"
              position={[-4.5, 2.5, -1.5]} 
              isPlaced={placed.tubes}
              isSelected={selectedComponent === 'tubes'}
              isHovered={hoveredComponent === 'tubes'}
              onClick={() => onSlotClick('tubes')}
              onHover={onSlotHover}
            />
            
            <ComponentSlot 
              id="drives" 
              label="Tape Drives"
              position={[4.5, 2.5, -1.5]} 
              isPlaced={placed.drives}
              isSelected={selectedComponent === 'drives'}
              isHovered={hoveredComponent === 'drives'}
              onClick={() => onSlotClick('drives')}
              onHover={onSlotHover}
            />
            
            <ComponentSlot 
              id="memory" 
              label="Mercury Memory"
              position={[-5.5, 0.5, 1.5]} 
              isPlaced={placed.memory}
              isSelected={selectedComponent === 'memory'}
              isHovered={hoveredComponent === 'memory'}
              onClick={() => onSlotClick('memory')}
              onHover={onSlotHover}
            />
            
            <ComponentSlot 
              id="printer" 
              label="Uniprinter"
              position={[5, -0.5, 2]} 
              isPlaced={placed.printer}
              isSelected={selectedComponent === 'printer'}
              isHovered={hoveredComponent === 'printer'}
              onClick={() => onSlotClick('printer')}
              onHover={onSlotHover}
            />
            
            <ContactShadows position={[0, -1, 0]} opacity={0.6} scale={20} blur={2.5} far={10} />
          </group>
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur border border-white/10 text-white/70 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <span>🔄 Rotate</span>
          <span>🖱️ Scroll to Zoom</span>
        </div>
      </div>
    </div>
  );
}
