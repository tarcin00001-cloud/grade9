"use client";

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, CreditCard, Hand, Thermometer } from 'lucide-react';

interface SmartRing3DSceneProps {
  level: 1 | 2 | 3;
  installedSensors: string[];
  isAnomaly?: boolean;
  onInstallSensor: (sensorId: string) => void;
}

const RingModel = ({ installedSensors, level, isAnomaly }: { installedSensors: string[], level: number, isAnomaly?: boolean }) => {
  const ringRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Rotate the ring based on level
  useFrame((state) => {
    if (ringRef.current) {
      const speed = level === 3 ? 0.02 : 0.005;
      ringRef.current.rotation.y += speed;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1 + Math.PI / 6;
    }
    
    // Anomaly flashing effect
    if (isAnomaly && materialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5;
      materialRef.current.color = new THREE.Color().setHSL(0, 1, pulse * 0.5 + 0.1);
    } else if (materialRef.current) {
      materialRef.current.color = new THREE.Color('#0f172a'); // Reset to default resin color
    }
  });

  const hasHeart = installedSensors.includes('heart');
  const hasNfc = installedSensors.includes('nfc');
  const hasGesture = installedSensors.includes('gesture');

  return (
    <group ref={ringRef} position={[0, 0, 0]}>
      {/* Outer Metal Band */}
      <mesh>
        <torusGeometry args={[2, 0.5, 64, 128]} />
        <meshPhysicalMaterial 
          color="#cbd5e1" 
          metalness={0.9} 
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* Inner Translucent Resin Band (where sensors go) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 0.6, 64]} />
        <meshPhysicalMaterial 
          ref={materialRef}
          color="#0f172a" 
          transmission={0.9} 
          opacity={0.8}
          transparent
          roughness={0.1}
          ior={1.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sensor installation visual effects (Microchips inside the ring) */}
      {/* Heart Rate Sensor - Red Glow */}
      {hasHeart && (
        <group position={[1.8, 0, 0]}>
          <mesh><boxGeometry args={[0.2, 0.2, 0.2]}/><meshBasicMaterial color="#ef4444" /></mesh>
          <pointLight color="#ef4444" intensity={5} distance={5} />
        </group>
      )}
      
      {/* NFC Chip - Blue Glow */}
      {hasNfc && (
        <group position={[-1.8, 0, 0]}>
          <mesh><boxGeometry args={[0.2, 0.2, 0.2]}/><meshBasicMaterial color="#3b82f6" /></mesh>
          <pointLight color="#3b82f6" intensity={5} distance={5} />
        </group>
      )}
      
      {/* Gesture Accelerometer - Green Glow */}
      {hasGesture && (
        <group position={[0, 1.8, 0]}>
          <mesh><boxGeometry args={[0.2, 0.2, 0.2]}/><meshBasicMaterial color="#10b981" /></mesh>
          <pointLight color="#10b981" intensity={5} distance={5} />
        </group>
      )}
      
      {/* Temp Sensor for Level 2 - Orange Glow */}
      {level >= 2 && (
        <group position={[0, -1.8, 0]}>
          <mesh><boxGeometry args={[0.2, 0.2, 0.2]}/><meshBasicMaterial color="#f97316" /></mesh>
          <pointLight color="#f97316" intensity={5} distance={5} />
        </group>
      )}
    </group>
  );
};

const SensorNode = ({ position, sensorId, label, icon: Icon, isInstalled, colorClass, onClick }: any) => {
  if (isInstalled) return null; // Hide the node once installed

  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div 
        onClick={(e) => { e.stopPropagation(); onClick(sensorId); }}
        className={`flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-110 group`}
      >
        <div className={`p-3 rounded-full bg-slate-900 border-2 border-slate-700 shadow-xl text-slate-400 group-hover:${colorClass} group-hover:border-current transition-colors animate-bounce`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="bg-black/80 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap">
          {label}
        </div>
      </div>
    </Html>
  );
};

export default function SmartRing3DScene({ level, installedSensors, isAnomaly, onInstallSensor }: SmartRing3DSceneProps) {
  return (
    <div className="w-full h-full relative bg-[#e2e8f0]">
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
        <ambientLight intensity={1} />
        <spotLight position={[5, 10, 5]} intensity={2} angle={0.5} penumbra={1} castShadow />
        <Environment preset="studio" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Suspense fallback={null}>
            <RingModel installedSensors={installedSensors} level={level} isAnomaly={isAnomaly} />
          </Suspense>
          
          {/* Interactive Installation Points floating around the ring (Only in Level 1) */}
          {level === 1 && (
            <>
              <SensorNode 
                position={[2, 1, 0]} 
                sensorId="heart" 
                label="Install ECG Sensor" 
                icon={Activity} 
                isInstalled={installedSensors.includes('heart')} 
                colorClass="text-red-500"
                onClick={onInstallSensor}
              />
              <SensorNode 
                position={[-2, 1.5, 0]} 
                sensorId="nfc" 
                label="Install NFC Chip" 
                icon={CreditCard} 
                isInstalled={installedSensors.includes('nfc')} 
                colorClass="text-blue-500"
                onClick={onInstallSensor}
              />
              <SensorNode 
                position={[0, -2, 1]} 
                sensorId="gesture" 
                label="Install Accelerometer" 
                icon={Hand} 
                isInstalled={installedSensors.includes('gesture')} 
                colorClass="text-emerald-500"
                onClick={onInstallSensor}
              />
            </>
          )}
        </Float>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4} color="#000000" />
        <OrbitControls 
          makeDefault
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
      
      {/* Background radial gradient for lighter theme */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle, transparent 30%, rgba(203,213,225,0.8) 100%)' }} />
    </div>
  );
}
