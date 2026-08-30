"use client";

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, useGLTF, Html, Float, Center, Bounds, Sphere, Cylinder, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Target } from 'lucide-react';
import './configureThreeConsole';

export type GestureType = 'idle' | 'fist' | 'point' | 'open';

interface GestureHand3DSceneProps {
  level: number;
  currentGesture: GestureType;
  trackingPointsDeployed: number;
  onDeployTrackingPoint?: () => void;
}

const RoboticHand = ({ currentGesture, isPowered }: { currentGesture: GestureType, isPowered: boolean }) => {
  const { scene } = useGLTF('/models/robotic_hand.glb');
  const handRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state) => {
    if (handRef.current) {
      // Gentle floating animation
      handRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      handRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    
    if (glowRef.current) {
      if (!isPowered) {
        glowRef.current.color.setHex(0x111111);
        glowRef.current.emissiveIntensity = 0;
      } else if (currentGesture === 'fist') {
        glowRef.current.color.setHex(0xef4444); // Red
        glowRef.current.emissiveIntensity = 2;
      } else if (currentGesture === 'point') {
        glowRef.current.color.setHex(0x3b82f6); // Blue
        glowRef.current.emissiveIntensity = 2;
      } else if (currentGesture === 'open') {
        glowRef.current.color.setHex(0x10b981); // Green
        glowRef.current.emissiveIntensity = 2;
      } else {
        glowRef.current.color.setHex(0x334155); // Idle slate
        glowRef.current.emissiveIntensity = 0.5;
      }
    }
  });

  return (
    <group ref={handRef}>
      <Center scale={1.5}>
        <primitive object={scene} />
          
        {/* Holographic Overlay that reacts to gestures */}
        <mesh scale={1.1}>
          {/* Provide a rough hull around the hand */}
          <boxGeometry args={[1.5, 2, 0.8]} />
          <meshPhysicalMaterial 
            ref={glowRef}
            color="#334155"
            emissive="#ffffff"
            emissiveIntensity={0.5}
            wireframe={true}
            transparent
            opacity={0.3}
          />
        </mesh>

          {/* Gesture specific holographic effects */}
          {currentGesture === 'point' && (
            <group position={[0, 1.5, 0]}>
              <Cylinder args={[0.02, 0.02, 5]} position={[0, 2.5, 0]}>
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
              </Cylinder>
              <pointLight color="#3b82f6" intensity={5} distance={10} />
            </group>
          )}
          
          {currentGesture === 'fist' && (
            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
              <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.4} />
              <pointLight color="#ef4444" intensity={10} distance={5} />
            </Sphere>
          )}

          {isPowered && currentGesture === 'open' && (
            <group position={[0, 0, 0]}>
              <Grid args={[4, 4]} sectionColor="#10b981" cellColor="#059669" position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]} fadeDistance={4} />
              <pointLight color="#10b981" intensity={5} distance={10} />
            </group>
          )}

        </Center>
    </group>
  );
};

const TrackingNode = ({ position, onClick, isDeployed }: { position: [number, number, number], onClick?: () => void, isDeployed: boolean }) => {
  if (isDeployed) {
    return (
      <group position={position}>
        <Sphere args={[0.1, 16, 16]}>
          <meshBasicMaterial color="#10b981" />
        </Sphere>
        <pointLight color="#10b981" intensity={2} distance={5} />
        {/* Laser pointing to center */}
        <Cylinder args={[0.01, 0.01, 3]} position={[0, -1.5, 0]} rotation={[0, 0, 0]}>
           <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
        </Cylinder>
      </group>
    );
  }

  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div 
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-110 group"
      >
        <div className="p-3 rounded-full bg-slate-900/80 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] text-red-400 group-hover:bg-red-500/20 group-hover:text-red-300 transition-colors animate-pulse">
          <Target className="w-6 h-6" />
        </div>
        <div className="bg-black/80 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap">
          Deploy IR Node
        </div>
      </div>
    </Html>
  );
};

export default function GestureHand3DScene({ level, currentGesture, trackingPointsDeployed, onDeployTrackingPoint }: GestureHand3DSceneProps) {
  return (
    <div className="w-full h-full relative bg-[#09090b]">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 10, 5]} intensity={2} angle={0.5} penumbra={1} castShadow color="#a855f7" />
        <spotLight position={[-5, 5, -5]} intensity={1.5} angle={0.5} penumbra={1} color="#3b82f6" />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <RoboticHand currentGesture={currentGesture} isPowered={trackingPointsDeployed >= 3 || level > 1} />
        </Suspense>

        {/* Level 1: Infrared Hardware Setup */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
           <TrackingNode position={[2, 2, 0]} isDeployed={trackingPointsDeployed >= 1} onClick={onDeployTrackingPoint} />
           <TrackingNode position={[-2, 1, 1]} isDeployed={trackingPointsDeployed >= 2} onClick={onDeployTrackingPoint} />
           <TrackingNode position={[0, -2, 2]} isDeployed={trackingPointsDeployed >= 3} onClick={onDeployTrackingPoint} />
        </Float>
        
        <ContactShadows position={[0, -2.5, 0]} opacity={0.7} scale={10} blur={2} far={4} color="#000000" />
        <OrbitControls 
          makeDefault
          enablePan={false}
          autoRotate={level === 4}
          autoRotateSpeed={2}
        />
      </Canvas>
      
      {/* Background radial gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle, transparent 20%, rgba(9,9,11,0.9) 100%)' }} />
    </div>
  );
}
