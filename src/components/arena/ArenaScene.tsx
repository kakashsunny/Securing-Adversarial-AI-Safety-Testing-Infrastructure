import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useSentinelStore, CameraPreset } from '../../engine/store';
import { EnclaveType } from '../../engine/types';

// Camera Viewpoint Controller with smooth interpolation
const CameraController: React.FC<{ preset: CameraPreset }> = ({ preset }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 8, 14));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    switch (preset) {
      case 'red':
        targetPos.current.set(-6.5, 3.5, 5.0);
        targetLookAt.current.set(-4.5, 0.4, 2.2);
        break;
      case 'blue':
        targetPos.current.set(6.5, 3.5, 5.0);
        targetLookAt.current.set(4.5, 0.4, 2.2);
        break;
      case 'model':
        targetPos.current.set(0, 4.0, -8.0);
        targetLookAt.current.set(0, 0.4, -4.5);
        break;
      case 'arbiter':
        targetPos.current.set(0, 4.5, 5.5);
        targetLookAt.current.set(0, 0.5, 0);
        break;
      case 'overview':
      default:
        targetPos.current.set(0, 8.5, 13.5);
        targetLookAt.current.set(0, 0, 0);
        break;
    }

    camera.position.lerp(targetPos.current, delta * 3.5);
  });

  return null;
};

// Flowing Ambient Particle Stream
const ParticleForcefieldStream: React.FC<{ isSecure: boolean }> = ({ isSecure }) => {
  const count = 180;
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      spd[i] = 0.4 + Math.random() * 0.8;
    }
    return [pos, spd];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const x = posArray[i * 3];
      const z = posArray[i * 3 + 2];
      const angle = Math.atan2(z, x) + delta * speeds[i] * (isSecure ? 0.8 : -1.2);
      const radius = Math.sqrt(x * x + z * z);

      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 2] = Math.sin(angle) * radius;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color={isSecure ? '#06b6d4' : '#f43f5e'}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Enclave Hexagon Component (Pure WebGL 3D Node)
interface EnclaveNodeProps {
  type: EnclaveType;
  position: [number, number, number];
  color: string;
  glowColor: string;
  isSelected: boolean;
  onSelect: (type: EnclaveType) => void;
  activePhaseMatch: boolean;
}

const EnclaveNode: React.FC<EnclaveNodeProps> = ({
  type,
  position,
  color,
  glowColor,
  isSelected,
  onSelect,
  activePhaseMatch,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.4;
    if (ringRef.current) ringRef.current.rotation.z -= delta * 0.6;
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.8;
      coreRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Outer Glowing Energy Ring */}
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 1.75, 32]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={activePhaseMatch ? 0.95 : 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Base Platform */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[1.5, 1.7, 0.2, 6]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Central Hexagonal Glass Enclave */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(type);
          }}
          position={[0, 0.4, 0]}
        >
          <cylinderGeometry args={[1.0, 1.2, 1.6, 6]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={activePhaseMatch ? 0.75 : 0.25}
            transmission={0.85}
            opacity={0.9}
            transparent
            roughness={0.1}
            metalness={0.15}
            ior={1.5}
            thickness={1.2}
          />
        </mesh>

        {/* Inner Floating Hologram Core */}
        <mesh ref={coreRef} position={[0, 0.4, 0]}>
          <octahedronGeometry args={[0.45]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>

        {/* Selection Indicator Beacon */}
        {isSelected && (
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        )}
      </Float>
    </group>
  );
};

// Central Arbiter Gateway Core
const ArbiterCoreNode: React.FC<{
  isSelected: boolean;
  onSelect: () => void;
  activePhase: string;
}> = ({ onSelect }) => {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (outerRingRef.current) outerRingRef.current.rotation.y += delta * 0.8;
    if (midRingRef.current) midRingRef.current.rotation.x += delta * 0.6;
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 1.2;
      coreRef.current.rotation.z += delta * 0.4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Rotating Core */}
      <mesh
        ref={coreRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <dodecahedronGeometry args={[0.9]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.65}
          transmission={0.7}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* Gyroscopic Rings */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.6, 0.04, 16, 64]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
      </mesh>
      <mesh ref={midRingRef}>
        <torusGeometry args={[2.1, 0.03, 16, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

// Isolation Membrane Walls (Between Enclaves)
const IsolationMembranes: React.FC<{ isSecure: boolean }> = ({ isSecure }) => {
  const innerMembraneRef = useRef<THREE.Mesh>(null);
  const outerMembraneRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (innerMembraneRef.current && isSecure) {
      const mat = innerMembraneRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.28 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
      }
    }
  });

  if (!isSecure) {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 5.5, 32]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.22} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh ref={innerMembraneRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.0, 6]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={outerMembraneRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.8, 5.0, 6]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Shockwave Ripple when Breach Lab attacks occur
const ShockwaveRipple: React.FC<{ triggerCount: number }> = ({ triggerCount }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0.1);
  const opacityRef = useRef(1);

  useFrame((_, delta) => {
    if (ringRef.current && triggerCount > 0) {
      scaleRef.current += delta * 6;
      opacityRef.current = Math.max(0, 1 - scaleRef.current / 8);
      ringRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = opacityRef.current;
      }
    }
  });

  React.useEffect(() => {
    if (triggerCount > 0) {
      scaleRef.current = 0.2;
      opacityRef.current = 1;
    }
  }, [triggerCount]);

  if (triggerCount === 0) return null;

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <ringGeometry args={[0.8, 1.0, 32]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={opacityRef.current} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Dynamic Animated Light Packets moving between Enclaves
const AnimatedLightPackets: React.FC<{ phase: string }> = ({ phase }) => {
  const packetRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!packetRef.current) return;
    const t = (state.clock.elapsedTime * 1.5) % 1;

    let pStart = new THREE.Vector3(-4.5, 0.4, 2.2);
    let pEnd = new THREE.Vector3(0, 0.4, 0);

    if (phase === 'COMMIT') {
      pStart = new THREE.Vector3(-4.5, 0.4, 2.2); // Red -> Arbiter
      pEnd = new THREE.Vector3(0, 0.4, 0);
    } else if (phase === 'TEST') {
      pStart = new THREE.Vector3(0, 0.4, 0); // Arbiter -> Model
      pEnd = new THREE.Vector3(0, 0.4, -4.5);
    } else if (phase === 'VERDICT') {
      pStart = new THREE.Vector3(0, 0.4, 0); // Arbiter -> Blue
      pEnd = new THREE.Vector3(4.5, 0.4, 2.2);
    } else if (phase === 'REVEAL') {
      pStart = new THREE.Vector3(-4.5, 0.4, 2.2); // Red -> Arbiter -> Blue
      pEnd = new THREE.Vector3(4.5, 0.4, 2.2);
    }

    const currentPos = new THREE.Vector3().lerpVectors(pStart, pEnd, t);
    packetRef.current.position.copy(currentPos);
  });

  return (
    <mesh ref={packetRef}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>
  );
};

export const ArenaScene: React.FC = () => {
  const {
    mode,
    currentPhase,
    selectedEnclave,
    setSelectedEnclave,
    attackShockwaveTrigger,
    cameraPreset,
  } = useSentinelStore();

  const isSecure = mode === 'secure';

  return (
    <>
      <CameraController preset={cameraPreset} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={20}
        autoRotate={false}
      />

      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 15, 10]} intensity={1.3} color="#f8fafc" />
      <pointLight position={[0, 4, 0]} intensity={2.2} color="#38bdf8" distance={16} />

      {/* Deep Space Stars */}
      <Stars radius={50} depth={50} count={2500} factor={4} saturation={0} fade speed={1} />

      {/* Grid Floor */}
      <gridHelper args={[24, 24, '#1e293b', '#0f172a']} position={[0, -0.7, 0]} />

      {/* Holographic Radar Concentric Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]}>
        <ringGeometry args={[6.5, 6.55, 64]} />
        <meshBasicMaterial color="#0e7490" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Particle Forcefield Stream */}
      <ParticleForcefieldStream isSecure={isSecure} />

      {/* 1. Red Team Enclave (Attacker - Crimson) */}
      <EnclaveNode
        type="RED"
        position={[-4.5, 0, 2.2]}
        color="#ef4444"
        glowColor="#f87171"
        isSelected={selectedEnclave === 'RED'}
        onSelect={setSelectedEnclave}
        activePhaseMatch={currentPhase === 'COMMIT' || currentPhase === 'REVEAL'}
      />

      {/* 2. Blue Team Enclave (Defender - Cyan) */}
      <EnclaveNode
        type="BLUE"
        position={[4.5, 0, 2.2]}
        color="#06b6d4"
        glowColor="#38bdf8"
        isSelected={selectedEnclave === 'BLUE'}
        onSelect={setSelectedEnclave}
        activePhaseMatch={currentPhase === 'VERDICT' || currentPhase === 'REVEAL'}
      />

      {/* 3. Model Enclave (Client LLM - Violet) */}
      <EnclaveNode
        type="MODEL"
        position={[0, 0, -4.5]}
        color="#a855f7"
        glowColor="#c084fc"
        isSelected={selectedEnclave === 'MODEL'}
        onSelect={setSelectedEnclave}
        activePhaseMatch={currentPhase === 'TEST'}
      />

      {/* 4. Central Arbiter Gateway Core (Gold) */}
      <ArbiterCoreNode
        isSelected={selectedEnclave === 'ARBITER'}
        onSelect={() => setSelectedEnclave('ARBITER')}
        activePhase={currentPhase}
      />

      {/* Isolation Forcefield Membranes */}
      <IsolationMembranes isSecure={isSecure} />

      {/* Shockwave Ripple on Attack */}
      <ShockwaveRipple triggerCount={attackShockwaveTrigger} />

      {/* Active Light Packets */}
      <AnimatedLightPackets phase={currentPhase} />
    </>
  );
};
