"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

interface NetworkInterface3DSceneProps {
  step: string;
  tcpOffloadEnabled: boolean;
  qosEnabled: boolean;
  isStreaming: boolean;
  cpuOverloaded: boolean;
  macAddress?: string | null;
  physicalMedia?: string[];
}

// Glowing data traces on the PCB
const DataTraces = ({ isStreaming, tcpOffloadEnabled, qosEnabled, cpuOverloaded }: any) => {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;
    
    linesRef.current.children.forEach((child: any, i) => {
      if (child.material) {
        if (isStreaming) {
          // If overloaded, flash red/erratic. If optimized, flow smoothly cyan/emerald
          const speed = cpuOverloaded ? 15 : 5;
          const pulse = Math.sin(time * speed + i) * 0.5 + 0.5;
          
          let color = new THREE.Color("#38bdf8"); // default cyan flow
          if (cpuOverloaded) color = new THREE.Color("#f43f5e"); // red stutter
          else if (qosEnabled && i % 2 === 0) color = new THREE.Color("#10b981"); // emerald prioritized paths
          
          child.material.emissive = color;
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 2;
        } else {
          child.material.emissive = new THREE.Color("#0f172a");
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        }
      }
    });
  });

  return (
    <group ref={linesRef} position={[0.5, 0.1, 0]}>
      {/* Horizontal traces from Port to Main Chip */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`h-${i}`} position={[-1.5, 0, -0.6 + i * 0.3]}>
          <boxGeometry args={[3, 0.02, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}
      {/* Traces from Main Chip to PCIe Bus */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`v-${i}`} position={[0.8 + i * 0.2, 0, 1.2]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.5, 0.02, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}
    </group>
  );
};

// Main NIC Board
const NetworkCard = ({ tcpOffloadEnabled, qosEnabled, isStreaming, cpuOverloaded, macAddress, physicalMedia = [] }: any) => {
  const offloadChipRef = useRef<THREE.Mesh>(null);
  const qosChipRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (offloadChipRef.current) {
      const mat = offloadChipRef.current.material as THREE.MeshStandardMaterial;
      if (tcpOffloadEnabled && isStreaming) {
        mat.emissiveIntensity = Math.sin(time * 8) * 0.5 + 1.5;
      } else {
        mat.emissiveIntensity = 0;
      }
    }
    if (qosChipRef.current) {
      const mat = qosChipRef.current.material as THREE.MeshStandardMaterial;
      if (qosEnabled && isStreaming) {
        mat.emissiveIntensity = Math.sin(time * 8 + Math.PI) * 0.5 + 1.5;
      } else {
        mat.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* PCB Board */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.1, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* PCIe Gold Pins */}
      <group position={[0, -0.05, 2]}>
        <mesh position={[-1.5, 0, 0]}>
          <boxGeometry args={[1.5, 0.12, 0.2]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[1, 0, 0]}>
          <boxGeometry args={[3, 0.12, 0.2]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Metal Bracket (Left) */}
      <mesh position={[-3.1, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 1.5, 4.5]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* WiFi Antenna (Only shows if WiFi) */}
      {physicalMedia.includes('WIFI') && (
        <group position={[-3.1, 1.25, -1]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
          </mesh>
        </group>
      )}

      {/* RJ45 Ethernet Port */}
      <group position={[-2.7, 0.4, -1]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.7, 1]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Port Hole */}
        <mesh position={[-0.41, 0, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.7]} />
          <meshStandardMaterial 
            color="#000000" 
            emissive={
              physicalMedia.includes('FIBER') && physicalMedia.includes('COPPER') ? "#a855f7" :
              physicalMedia.includes('FIBER') ? "#f43f5e" : 
              physicalMedia.includes('COPPER') ? "#3b82f6" : "#000000"
            } 
            emissiveIntensity={physicalMedia.includes('FIBER') || physicalMedia.includes('COPPER') ? 2 : 0} 
          />
        </mesh>
      </group>

      {/* Main Processor (MAC / Base Controller) */}
      <group position={[-1, 0.1, -0.5]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.15, 1.2]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        <Text position={[0, 0.08, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={macAddress ? 0.12 : 0.2} color={macAddress ? "#10b981" : "#94a3b8"}>
          {macAddress || "MAC"}
        </Text>
      </group>

      {/* TCP/IP Offload Engine Chip */}
      <group position={[1.5, 0.1, -0.5]}>
        <mesh ref={offloadChipRef as any} castShadow>
          <boxGeometry args={[1, 0.12, 1]} />
          <meshStandardMaterial color="#334155" roughness={0.6} emissive="#0ea5e9" emissiveIntensity={0} />
        </mesh>
        <Text position={[0, 0.07, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.15} color={tcpOffloadEnabled ? "#fff" : "#94a3b8"}>
          TCPE
        </Text>
      </group>

      {/* QoS Controller Chip */}
      <group position={[1.5, 0.1, 1]}>
        <mesh ref={qosChipRef as any} castShadow>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial color="#334155" roughness={0.6} emissive="#10b981" emissiveIntensity={0} />
        </mesh>
        <Text position={[0, 0.06, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.15} color={qosEnabled ? "#fff" : "#94a3b8"}>
          QoS
        </Text>
      </group>

      <DataTraces 
        isStreaming={isStreaming} 
        tcpOffloadEnabled={tcpOffloadEnabled} 
        qosEnabled={qosEnabled} 
        cpuOverloaded={cpuOverloaded} 
      />
    </group>
  );
};

export default function NetworkInterface3DScene({ 
  step, 
  tcpOffloadEnabled, 
  qosEnabled, 
  isStreaming, 
  cpuOverloaded,
  macAddress,
  physicalMedia 
}: NetworkInterface3DSceneProps) {
  return (
    <div className="w-full h-full relative bg-slate-50">
      <Canvas camera={{ position: [0, 8, 8], fov: 40 }}>
        <ambientLight intensity={2.5} color="#ffffff" />
        <directionalLight position={[10, 15, 10]} intensity={3} castShadow color="#ffffff" />
        <pointLight position={[-5, 5, -5]} intensity={2} color="#f8fafc" distance={20} />

        <group position={[0, -0.5, -0.5]}>
          <NetworkCard 
            tcpOffloadEnabled={tcpOffloadEnabled}
            qosEnabled={qosEnabled}
            isStreaming={isStreaming}
            cpuOverloaded={cpuOverloaded}
            macAddress={macAddress}
            physicalMedia={physicalMedia}
          />
          
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={15} blur={2} far={4} color="#0f172a" />
        </group>

        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={4}
          maxDistance={20}
          autoRotate={isStreaming && !cpuOverloaded}
          autoRotateSpeed={1.0}
        />
      </Canvas>
    </div>
  );
}
