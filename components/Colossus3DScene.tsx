"use client";

import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import './configureThreeConsole';

const Loader = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center bg-white/90 border border-slate-200 p-6 rounded-2xl backdrop-blur-md shadow-lg">
      <div className="w-12 h-12 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mb-3"></div>
      <div className="text-slate-600 font-bold font-sans tracking-widest uppercase text-xs">Loading Colossus</div>
    </div>
  </Html>
);

interface Colossus3DSceneProps {
  step: 'LEARN' | 'TRY_MANUAL' | 'FAIL_OVERLOAD' | 'UNDERSTAND' | 'IMPROVE' | 'COMPLETE' | 'OUTCOME';
  tapeLoaded: boolean;
  wiresPatched: boolean;
  isDecrypting: boolean;
}

// Re-tuned from real Colossus/Tunny reference photographs (Bletchley Park replica):
// painted cream/grey cabinet metal (not white), black rack faces, brass/gold accents.
const PALETTE = {
  frame: "#8b8d85",       // Painted grey-green cabinet steel
  cabinet: "#c7c4b4",     // Cream/grey painted cabinet panels (not white)
  darkMetal: "#151513",   // Black rack panel faces
  switches: "#f8fafc",    // White pegs
  redSwitches: "#ef4444", // Red pegs
  greenLight: "#22c55e",  // Green indicator LEDs
  metal: "#6b6d63",       // Relays and cylinders
  tubeGlass: "#e5e7eb",   // Vacuum tube glass envelope
  tubeBase: "#1f2937",    // Vacuum tube bakelite base/socket ring
  cableRed: "#b91c1c",    // Cable bundle — dark red
  cableOrange: "#ea580c", // Cable bundle — orange
  cardModule: "#d4d0c0",  // Card-cage plug-in module face (cream)
  cardEdge: "#3a3a35",    // Card-cage slot shadow gap
  brass: "#b08d57",       // Brass/gold trim accents
  wood: "#7a5c3e",        // Teleprinter desk wood
  typewriterBody: "#c9bfa5", // Teleprinter cream housing
};

// --- Sub-Components ---

// The top mechanical relay shelves from the photo
const RelayTier = ({ position }: { position: [number, number, number] }) => {
  // Sized to fit within one ~2.1-wide rack unit (4 relay blocks across),
  // not the old 9.5-wide single-cabinet layout this was originally built for.
  return (
    <group position={position}>
      {/* Horizontal structural beam */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[1.9, 0.15, 0.5]} />
        <meshStandardMaterial color={PALETTE.frame} metalness={0.4} roughness={0.7} />
      </mesh>

      {/* 4 mechanical relay blocks per tier, packed tight */}
      {[...Array(4)].map((_, i) => (
        <group key={i} position={[-0.75 + i * 0.5, 0.25, 0.1]} scale={0.55}>
          {/* Main relay box */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.8, 0.5]} />
            <meshStandardMaterial color={PALETTE.metal} metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Lower contact block */}
          <mesh position={[0, -0.5, 0.1]} castShadow>
            <boxGeometry args={[0.4, 0.3, 0.4]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          {/* Top connector */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.3]} />
            <meshStandardMaterial color="#fcd34d" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Dense grid of white and red pegs (Left and Center panels)
const DensePatchPanel = ({ position, rows = 30, cols = 15 }: { position: [number, number, number], rows?: number, cols?: number }) => {
  const count = rows * cols;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Leave some empty spaces based on the photo
        if (Math.random() > 0.6) { i++; continue; }

        dummy.position.set((c - cols/2) * 0.14, (r - rows/2) * 0.14, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);

        // A few red pegs scattered in
        const isRed = Math.random() > 0.95;
        meshRef.current.setColorAt(i, new THREE.Color(isRed ? PALETTE.redSwitches : PALETTE.switches));
        i++;
      }
    }
    meshRef.current.count = i;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [rows, cols, dummy]);

  return (
    <group position={position}>
      {/* Black background panel */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[cols * 0.14 + 0.2, rows * 0.14 + 0.2, 0.1]} />
        <meshStandardMaterial color={PALETTE.darkMetal} />
      </mesh>
      {/* Instanced pegs */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
        <meshStandardMaterial metalness={0.1} roughness={0.8} />
      </instancedMesh>
    </group>
  );
};

// Dense rows of vacuum-tube sockets — dark bakelite ring + protruding glass envelope,
// matching the real Colossus/Tunny reference photo's dominant front-panel texture
const TubeSocketPanel = ({ position, rows = 8, cols = 12 }: { position: [number, number, number], rows?: number, cols?: number }) => {
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const baseRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = rows * cols;
  const spacing = 0.34;

  useEffect(() => {
    if (!glassRef.current || !baseRef.current) return;
    let i = 0;
    // Cylinders default to a vertical (Y-axis) orientation — rotate 90° on X so each
    // tube's length runs forward along Z and its round cross-section faces the viewer,
    // instead of presenting a flat end-cap that reads as a dark rectangle.
    const tubeRotation = new THREE.Euler(Math.PI / 2, 0, 0);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2) * spacing;
        const y = (r - rows / 2) * spacing;

        dummy.position.set(x, y, 0.08);
        dummy.rotation.copy(tubeRotation);
        dummy.updateMatrix();
        baseRef.current.setMatrixAt(i, dummy.matrix);

        dummy.position.set(x, y, 0.24);
        dummy.rotation.copy(tubeRotation);
        dummy.updateMatrix();
        glassRef.current.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    baseRef.current.instanceMatrix.needsUpdate = true;
    glassRef.current.instanceMatrix.needsUpdate = true;
  }, [rows, cols, dummy]);

  return (
    <group position={position}>
      {/* Dark rack panel background */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[cols * spacing + 0.15, rows * spacing + 0.15, 0.08]} />
        <meshStandardMaterial color={PALETTE.darkMetal} roughness={0.6} />
      </mesh>
      {/* Bakelite socket rings */}
      <instancedMesh ref={baseRef} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.1, 0.11, 0.12, 12]} />
        <meshStandardMaterial color={PALETTE.tubeBase} roughness={0.5} />
      </instancedMesh>
      {/* Protruding glass tube envelopes — brighter, glossier glass so the round
          silhouette and a visible specular highlight sell the "tube" read */}
      <instancedMesh ref={glassRef} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.07, 0.05, 0.32, 14]} />
        <meshStandardMaterial
          color={PALETTE.tubeGlass}
          roughness={0.08}
          metalness={0.05}
          transparent
          opacity={0.9}
          emissive="#fef3c7"
          emissiveIntensity={0.06}
        />
      </instancedMesh>
    </group>
  );
};

// Cascading bundle of red/orange wires — a real but small, contained wiring loom
// on the reference machine's lower-right corner, not a large dominant cascade
const CableBundle = ({ position, height = 1.6 }: { position: [number, number, number], height?: number }) => {
  const strands = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 9; i++) {
      arr.push({
        offsetX: (Math.random() - 0.5) * 0.22,
        offsetZ: (Math.random() - 0.5) * 0.1,
        color: Math.random() > 0.4 ? PALETTE.cableRed : PALETTE.cableOrange,
        wobble: (Math.random() - 0.5) * 0.15,
      });
    }
    return arr;
  }, []);

  return (
    <group position={position}>
      {strands.map((s, i) => (
        <mesh key={i} position={[s.offsetX, -height / 2, s.offsetZ]} rotation={[0, 0, s.wobble]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, height, 6]} />
          <meshStandardMaterial color={s.color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// Card-cage / plug-in module rack — a stack of thin flat cream cards in a slotted frame,
// the far-right rack's dominant texture in the reference photos (distinct from every
// other panel type: uniform horizontal slats with dark gaps between, no round components)
const CardCagePanel = ({ position, count = 14, width = 1.6 }: { position: [number, number, number], count?: number; width?: number }) => {
  const cardHeight = 0.16;
  const gap = 0.04;
  return (
    <group position={position}>
      {/* Recessed frame the cards sit in */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[width + 0.12, count * (cardHeight + gap) + 0.12, 0.1]} />
        <meshStandardMaterial color={PALETTE.cardEdge} roughness={0.7} />
      </mesh>
      {Array.from({ length: count }).map((_, i) => {
        const y = (i - count / 2) * (cardHeight + gap);
        return (
          <mesh key={i} position={[0, y, 0.03]} castShadow>
            <boxGeometry args={[width, cardHeight, 0.06]} />
            <meshStandardMaterial color={PALETTE.cardModule} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

// The foreground teleprinter/typewriter on its wooden desk — a distinctive object
// sitting in front of the rack bank in the reference photo, entirely separate from
// the machine body itself
const TeleprinterDesk = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Wooden desk */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 1.0]} />
        <meshStandardMaterial color={PALETTE.wood} roughness={0.8} />
      </mesh>
      {/* Desk legs */}
      {[
        [-0.7, -0.4],
        [0.7, -0.4],
        [-0.7, 0.4],
        [0.7, 0.4],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]} castShadow>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial color={PALETTE.wood} roughness={0.8} />
        </mesh>
      ))}
      {/* Teleprinter body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.85, 0.28, 0.7]} />
        <meshStandardMaterial color={PALETTE.typewriterBody} roughness={0.5} />
      </mesh>
      {/* Angled keyboard face */}
      <mesh position={[0, 0.68, 0.28]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.75, 0.05, 0.35]} />
        <meshStandardMaterial color={PALETTE.darkMetal} roughness={0.6} />
      </mesh>
      {/* Key rows */}
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 9 }).map((_, c) => (
          <mesh
            key={`${r}-${c}`}
            position={[-0.32 + c * 0.08, 0.66 - r * 0.03, 0.16 + r * 0.08]}
            rotation={[-0.35, 0, 0]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
          </mesh>
        ))
      )}
      {/* Paper platen roller */}
      <mesh position={[0, 0.94, -0.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 12]} />
        <meshStandardMaterial color="#4b5563" roughness={0.5} />
      </mesh>
    </group>
  );
};

// The right panel with horizontal strips and glowing green lights
const RightControlPanel = ({ position, isDecrypting }: { position: [number, number, number], isDecrypting: boolean }) => {
  const greenLightsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!greenLightsRef.current || !isDecrypting) return;
    for (let i = 0; i < 4; i++) {
      const pulse = Math.sin(state.clock.elapsedTime * 15 + i) * 0.5 + 0.5;
      greenLightsRef.current.setColorAt(i, new THREE.Color().setHSL(0.33, 1, pulse > 0.5 ? 0.6 : 0.2));
    }
    if (greenLightsRef.current.instanceColor) greenLightsRef.current.instanceColor.needsUpdate = true;
  });

  useEffect(() => {
    if (!greenLightsRef.current) return;
    for (let i = 0; i < 4; i++) {
      dummy.position.set(-0.8 + i * 0.5, 0.8, 0);
      dummy.updateMatrix();
      greenLightsRef.current.setMatrixAt(i, dummy.matrix);
      greenLightsRef.current.setColorAt(i, new THREE.Color(PALETTE.greenLight));
    }
    greenLightsRef.current.instanceMatrix.needsUpdate = true;
    if (greenLightsRef.current.instanceColor) greenLightsRef.current.instanceColor.needsUpdate = true;
  }, [dummy]);

  return (
    <group position={position}>
      {/* Black background */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.5, 4.4, 0.1]} />
        <meshStandardMaterial color={PALETTE.darkMetal} />
      </mesh>
      
      {/* Horizontal Peg Strips */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[2.3, 0.2, 0.05]} />
        <meshStandardMaterial color={PALETTE.metal} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[2.3, 1.5, 0.05]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Green LEDs */}
      <instancedMesh ref={greenLightsRef} args={[undefined, undefined, 4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
};

// Paper tape spool — idle and empty until loaded, then spins up and feeds a visible
// tape strip toward the machine. This is the direct visual consequence of the
// "Load Paper Tape" control-desk button; before this the spool did nothing at all.
const TapeSpool = ({
  position,
  tapeLoaded,
  isDecrypting,
}: {
  position: [number, number, number];
  tapeLoaded: boolean;
  isDecrypting: boolean;
}) => {
  const spoolRef = useRef<THREE.Group>(null);
  const tapeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (spoolRef.current) {
      const targetSpeed = tapeLoaded ? (isDecrypting ? 14 : 2.5) : 0;
      spoolRef.current.rotation.x += targetSpeed * delta;
    }
    if (tapeRef.current) {
      const targetScale = tapeLoaded ? 1 : 0;
      tapeRef.current.scale.y += (targetScale - tapeRef.current.scale.y) * Math.min(1, delta * 4);
    }
  });

  return (
    <group position={position}>
      <group ref={spoolRef} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.8, 32]} />
          <meshStandardMaterial color={PALETTE.metal} roughness={0.5} />
        </mesh>
        {/* Spoke marks so the spin is visible, not just implied */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0, 0.41]} rotation={[0, 0, (i * Math.PI) / 2]}>
            <boxGeometry args={[0.06, 0.9, 0.02]} />
            <meshStandardMaterial color={PALETTE.darkMetal} />
          </mesh>
        ))}
      </group>
      {/* Fed paper tape strip — grows into view once loaded */}
      <mesh ref={tapeRef} position={[0.5, -0.9, 0]} scale={[1, 0, 1]} castShadow>
        <planeGeometry args={[0.12, 1.8]} />
        <meshStandardMaterial color="#fef9ec" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// A single toggle switch that animates upright ("on") when isOn is true, and glows
// via emissive intensity — the visual consequence of the "Patch Logic Gates" action
const ToggleSwitch = ({
  position,
  color,
  isOn,
}: {
  position: [number, number, number];
  color: string;
  isOn: boolean;
}) => {
  const leverRef = useRef<THREE.Mesh>(null);
  const bulbRef = useRef<THREE.Mesh>(null);
  // Wide swing (off leans hard back, on stands hard forward) so the flip reads
  // clearly even at the small scale these switches render at from the resting camera.
  const OFF_ANGLE = -Math.PI / 2.3;
  const ON_ANGLE = Math.PI / 5;

  useFrame((_, delta) => {
    const targetAngle = isOn ? ON_ANGLE : OFF_ANGLE;
    if (leverRef.current) {
      // Read/write through the object's own rotation state each frame — no JSX
      // `rotation` prop on this mesh, so there is nothing for React to reset it to.
      leverRef.current.rotation.x = THREE.MathUtils.lerp(leverRef.current.rotation.x, targetAngle, Math.min(1, delta * 6));
    }
    if (bulbRef.current) {
      const mat = bulbRef.current.material as THREE.MeshStandardMaterial;
      const targetGlow = isOn ? 2.5 : 0;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetGlow, Math.min(1, delta * 6));
    }
  });

  return (
    <group position={position}>
      <mesh ref={bulbRef} position={[0, -0.1, 0]}>
        <boxGeometry args={[0.13, 0.18, 0.13]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0} toneMapped={false} />
      </mesh>
      <mesh ref={leverRef} position={[0, 0.1, 0.05]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2]} />
        <meshStandardMaterial color={PALETTE.switches} />
      </mesh>
    </group>
  );
};

// One freestanding equipment rack — the repeating unit that, placed side by side
// with visible gaps, gives the real machine its "wall of separate racks" silhouette
const RackUnit = ({
  position,
  width = 2.1,
  depth = 1.0,
  children,
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
  children?: React.ReactNode;
}) => {
  return (
    <group position={position}>
      {/* Rack cabinet body — narrow cream side/top trim only. The FRONT FACE is
          deliberately dark (matching the real machine's packed black rack faces)
          so it reads as a dense wall of components, not a light cabinet door with
          a small decoration floating on it. */}
      <mesh position={[0, 6, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, 12, depth]} />
        <meshStandardMaterial color={PALETTE.cabinet} metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Dark front face plate, flush with the front edge — this is what should be
          visible around/behind every component panel, not cream cabinet material */}
      <mesh position={[0, 6, depth / 2 - 0.02]}>
        <boxGeometry args={[width - 0.06, 11.6, 0.06]} />
        <meshStandardMaterial color={PALETTE.darkMetal} roughness={0.6} />
      </mesh>
      {/* Thin frame legs so each rack visibly stands on its own */}
      <mesh position={[width / 2 - 0.08, 0.5, -depth / 2]} castShadow>
        <boxGeometry args={[0.16, 1, depth]} />
        <meshStandardMaterial color={PALETTE.frame} metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[-(width / 2 - 0.08), 0.5, -depth / 2]} castShadow>
        <boxGeometry args={[0.16, 1, depth]} />
        <meshStandardMaterial color={PALETTE.frame} metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Open girder scaffolding on top — matches the exposed metal lattice frame
          visible above the rack faces in the reference photos, rather than a solid roof */}
      <group position={[0, 12.15, -depth / 2]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[width, 0.1, depth]} />
          <meshStandardMaterial color={PALETTE.frame} metalness={0.5} roughness={0.5} />
        </mesh>
        {[-depth / 2 + 0.08, depth / 2 - 0.08].map((z, i) => (
          <mesh key={i} position={[0, 0.25, z]} castShadow>
            <boxGeometry args={[width, 0.3, 0.06]} />
            <meshStandardMaterial color={PALETTE.frame} metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {children}
    </group>
  );
};

// The main Tunny Machine structure — rebuilt as 4 distinct racks with a visible gap
// between each, dense vacuum-tube-socket panels, and a cascading cable bundle,
// matching the real Colossus/Tunny reference photograph rather than one flat cabinet.
const TunnyMachine = ({
  position,
  isDecrypting,
  tapeLoaded,
  wiresPatched,
}: {
  position: [number, number, number];
  isDecrypting: boolean;
  tapeLoaded: boolean;
  wiresPatched: boolean;
}) => {
  const rackWidth = 2.1;
  const gap = 0.35;
  const step = rackWidth + gap;
  // 4 rack centers, left to right
  const xPositions = [-1.5 * step, -0.5 * step, 0.5 * step, 1.5 * step];

  return (
    <group position={position}>
      {/* --- RACK 1 (far left): Relay bank stacked floor-to-ceiling — every gap
           between tiers is filled so no cream/light material shows through, matching
           the real machine's dense, uninterrupted wall of components. --- */}
      <RackUnit position={[xPositions[0], 0, 0]}>
        <RelayTier position={[0, 10.7, 0.2]} />
        <RelayTier position={[0, 9.3, 0.2]} />
        <RelayTier position={[0, 7.9, 0.2]} />
        <TubeSocketPanel position={[0, 5.4, 0.55]} rows={8} cols={5} />
        <TubeSocketPanel position={[0, 2.2, 0.55]} rows={7} cols={5} />
      </RackUnit>

      {/* --- RACK 2: Dense tube-socket panel + patch pegs, stacked full-height --- */}
      <RackUnit position={[xPositions[1], 0, 0]}>
        <TubeSocketPanel position={[0, 9.8, 0.55]} rows={7} cols={5} />
        <DensePatchPanel position={[0, 4.6, 0.55]} rows={34} cols={13} />
      </RackUnit>

      {/* --- RACK 3: Switch/dial control panel + green status lights, with tube
           panels above AND below so this rack's content reaches full height on
           both ends — not just filled at the top. --- */}
      <RackUnit position={[xPositions[2], 0, 0]}>
        <TubeSocketPanel position={[0, 10.4, 0.55]} rows={4} cols={5} />
        <TubeSocketPanel position={[0, 8.3, 0.55]} rows={4} cols={5} />
        <RightControlPanel position={[0, 5, 0.55]} isDecrypting={isDecrypting} />
        <TubeSocketPanel position={[0, 1.6, 0.55]} rows={4} cols={5} />
      </RackUnit>

      {/* --- RACK 4 (far right): Card-cage / plug-in module bank, stacked to fill
           the full rack height, matching the reference photo's card-slot rack --- */}
      <RackUnit position={[xPositions[3], 0, 0]} width={2.4}>
        <CardCagePanel position={[0, 9.4, 0.55]} count={16} width={1.9} />
        <CardCagePanel position={[0, 5.9, 0.55]} count={16} width={1.9} />
        <CardCagePanel position={[0, 2.4, 0.55]} count={16} width={1.9} />
        <CableBundle position={[1.05, 1.0, 0.5]} height={1.4} />
      </RackUnit>

      {/* --- CONTROL LIP (Bottom of switches) --- */}
      <group position={[0, -0.5, 0.5]}>
        {/* The protruding shelf */}
        <mesh castShadow>
          <boxGeometry args={[9.5, 1, 1]} />
          <meshStandardMaterial color={PALETTE.frame} metalness={0.3} roughness={0.6} />
        </mesh>

        {/* Paper tape spool — spins up and feeds a visible tape strip once loaded,
            the direct visual consequence of the "Load Paper Tape" control-desk action */}
        <TapeSpool position={[-3, 0, 0.8]} tapeLoaded={tapeLoaded} isDecrypting={isDecrypting} />

        {/* Two keyholes/switches next to cylinder */}
        <mesh position={[-1.5, 0, 0.55]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color={PALETTE.darkMetal} />
        </mesh>
        <mesh position={[-0.8, 0, 0.55]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color={PALETTE.darkMetal} />
        </mesh>

        {/* Row of multi-colored toggle switches — flip upright and glow once
            "Patch Logic Gates" is wired, the direct visual consequence of that action */}
        <mesh position={[2.5, 0, 0.55]}>
          <boxGeometry args={[3.5, 0.4, 0.1]} />
          <meshStandardMaterial color={PALETTE.darkMetal} />
        </mesh>
        {[...Array(12)].map((_, i) => {
          const colors = ["#eab308", "#ef4444", "#3b82f6", "#22c55e", "#f8fafc"];
          const c = colors[i % colors.length];
          return (
            <ToggleSwitch key={i} position={[1 + i * 0.28, 0, 0.6]} color={c} isOn={wiresPatched} />
          );
        })}
      </group>

      {/* --- LOWER CABINETS --- */}
      <group position={[0, -2.5, 0.2]}>
        {/* Left Drawer Cabinet */}
        <mesh position={[-2.4, -0.5, 0]} castShadow>
          <boxGeometry args={[4.5, 3, 0.8]} />
          <meshStandardMaterial color={PALETTE.cabinet} roughness={0.8} />
        </mesh>
        {/* White Paper Sign */}
        <mesh position={[-2.4, -0.5, 0.41]}>
          <planeGeometry args={[2.5, 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Text position={[-2.4, -0.5, 0.42]} fontSize={0.15} color="#000" maxWidth={2.3} textAlign="center">
          This is a rebuild of the "Tunny" machine used to decipher teleprinter messages enciphered on the German Lorenz SZ42 cipher machine
        </Text>

        {/* Right Drawer Cabinet */}
        <mesh position={[2.4, -0.5, 0]} castShadow>
          <boxGeometry args={[4.5, 3, 0.8]} />
          <meshStandardMaterial color={PALETTE.cabinet} roughness={0.8} />
        </mesh>
        {/* Drawer lines */}
        <mesh position={[2.4, 0.2, 0.41]}>
          <boxGeometry args={[4.4, 0.05, 0.05]} />
          <meshStandardMaterial color={PALETTE.frame} />
        </mesh>
        <mesh position={[2.4, -1.2, 0.41]}>
          <boxGeometry args={[4.4, 0.05, 0.05]} />
          <meshStandardMaterial color={PALETTE.frame} />
        </mesh>
      </group>

      {/* Foreground teleprinter on its wooden desk — a distinct object standing in
          front of the rack bank, centered on the machine and grounded on the same
          floor plane (y: -3.5) the rest of the scene sits on, not floating beside it */}
      <TeleprinterDesk position={[0, -3.5, 2.3]} />
    </group>
  );
};

export default function Colossus3DScene({ step, tapeLoaded, wiresPatched, isDecrypting }: Colossus3DSceneProps) {
  return (
    <div className="w-full h-full relative bg-[#f1f5f9]">
      <Canvas camera={{ position: [10, 4, 14], fov: 50 }}>
        {/* Bright Studio Lighting */}
        <ambientLight intensity={3.0} color="#ffffff" />
        <directionalLight position={[5, 10, 10]} intensity={2.5} castShadow color="#ffffff" />
        <pointLight position={[-5, 5, 8]} intensity={1.5} color="#e2e8f0" distance={30} />
        <pointLight position={[5, 5, 8]} intensity={1.5} color="#e2e8f0" distance={30} />

        <Suspense fallback={<Loader />}>
          <group position={[0, -2, 0]}>

            <TunnyMachine
              position={[0, 0, 0]}
              isDecrypting={isDecrypting}
              tapeLoaded={tapeLoaded}
              wiresPatched={wiresPatched}
            />

            {/* Floor */}
            <mesh position={[0, -3.5, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[40, 20]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.9} metalness={0.1} />
            </mesh>

            <ContactShadows position={[0, -3.4, 2]} opacity={0.6} scale={20} blur={2} far={5} color="#1e293b" />
          </group>
        </Suspense>

        {/* Full 360° orbit so the machine can be spun and inspected from any side */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2 + 0.15}
          minDistance={8}
          maxDistance={24}
          target={[0, 2, 0]}
        />
      </Canvas>
    </div>
  );
}
