"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Html, Center, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import './configureThreeConsole';

interface Foldable3DSceneProps {
  hardware: "compact" | "laptop" | "tablet";
  uiContent: React.ReactNode;
  isBroken: boolean;
}

// Reusable Materials
const ChassisMaterial = () => <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />;
const ScreenBezelMaterial = () => <meshStandardMaterial color="#020617" roughness={0.4} />;
const KeyboardMaterial = () => <meshStandardMaterial color="#1e293b" roughness={0.8} />;

// --- Procedural Devices (1:1 Pixel Scale) ---
const ProceduralCompact = () => (
  <group>
    {/* Screen is 280 x 500 -> Chassis is 300 x 520 x 20 */}
    <RoundedBox args={[300, 520, 20]} radius={20} smoothness={4} castShadow receiveShadow>
      <ChassisMaterial />
    </RoundedBox>
    {/* Screen Glass Bezel */}
    <mesh position={[0, 0, 10.1]}>
      <planeGeometry args={[280, 500]} />
      <ScreenBezelMaterial />
    </mesh>
  </group>
);

const ProceduralLaptop = () => (
  <group>
    {/* Base Deck: Chassis is 540 x 20 x 340 */}
    <RoundedBox args={[540, 20, 340]} position={[0, -10, 170]} radius={10} smoothness={4} castShadow receiveShadow>
      <ChassisMaterial />
    </RoundedBox>
    {/* Keyboard Deck */}
    <mesh position={[0, 10.1, 170]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[500, 260]} />
      <KeyboardMaterial />
    </mesh>
    
    {/* Screen Lid Group (Hinged at 0,0,0) */}
    <group rotation={[-0.15, 0, 0]}> 
      <RoundedBox args={[540, 340, 20]} position={[0, 170, 0]} radius={10} smoothness={4} castShadow receiveShadow>
        <ChassisMaterial />
      </RoundedBox>
      {/* Screen Glass Bezel */}
      <mesh position={[0, 170, 10.1]}>
        <planeGeometry args={[500, 300]} />
        <ScreenBezelMaterial />
      </mesh>
    </group>
  </group>
);

const ProceduralTablet = () => (
  <group>
    {/* Screen is 500 x 340 -> Chassis is 540 x 380 x 20 */}
    <RoundedBox args={[540, 380, 20]} radius={15} smoothness={4} castShadow receiveShadow>
      <ChassisMaterial />
    </RoundedBox>
    {/* Screen Glass Bezel */}
    <mesh position={[0, 0, 10.1]}>
      <planeGeometry args={[500, 340]} />
      <ScreenBezelMaterial />
    </mesh>
  </group>
);

// --- Scene Controller ---
const DeviceScene = ({ hardware, uiContent, isBroken }: Foldable3DSceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 10;
    }
  });

  const getHtmlConfig = () => {
    switch (hardware) {
      case "compact":
        return { 
          position: [0, 0, 11] as [number, number, number], 
          scale: 1, 
          width: 280, 
          height: 500,
          rotation: [0, 0, 0] as [number, number, number]
        };
      case "laptop":
        return { 
          // Positioned on the hinged screen lid (which has center at y=170)
          // We apply the same rotation as the lid group so it sits flush
          position: [0, 170, 11] as [number, number, number], 
          scale: 1, 
          width: 500, 
          height: 300,
          rotation: [-0.15, 0, 0] as [number, number, number]
        };
      case "tablet":
        return { 
          position: [0, 0, 11] as [number, number, number], 
          scale: 1, 
          width: 500, 
          height: 340,
          rotation: [0, 0, 0] as [number, number, number]
        };
    }
  };

  const config = getHtmlConfig();

  return (
    <group ref={groupRef}>
      <Center>
        {hardware === "compact" && <ProceduralCompact />}
        {hardware === "laptop" && <ProceduralLaptop />}
        {hardware === "tablet" && <ProceduralTablet />}

        {/* The 3D Embedded User Interface */}
        <Html 
          transform 
          distanceFactor={400}
          position={config.position} 
          rotation={config.rotation}
          scale={config.scale}
          zIndexRange={[100, 0]}
        >
          <div 
            className={`transition-all duration-500 overflow-hidden ${isBroken ? 'border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,1)] animate-pulse' : 'shadow-[0_0_15px_rgba(255,255,255,0.1)]'}`}
            style={{ 
              width: `${config.width}px`, 
              height: `${config.height}px`,
              backgroundColor: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
              borderRadius: hardware === 'compact' ? '20px' : '8px'
            }}
          >
            {uiContent}
          </div>
        </Html>
      </Center>
    </group>
  );
};

export default function Foldable3DScene(props: Foldable3DSceneProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 150, 800], fov: 45, far: 5000 }}>
        <ambientLight intensity={1.5} />
        <spotLight position={[500, 1000, 500]} intensity={2} castShadow angle={0.5} penumbra={1} color="#a855f7" />
        <spotLight position={[-500, 500, -500]} intensity={1.5} angle={0.5} penumbra={1} color="#3b82f6" />
        <Environment preset="city" />
        
        <DeviceScene {...props} />
        
        <ContactShadows position={[0, -250, 0]} opacity={0.6} scale={1000} blur={2.5} far={400} color="#000000" />
        <OrbitControls 
          makeDefault 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
