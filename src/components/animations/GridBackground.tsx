'use client';

import { useRef, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────
   Dragon Vandal – Particle Dragon Silhouette
   Renders a serpentine dragon shape from glowing particles
   that drift and pulse with fire-like energy.

   variant="auth"  → default, subtle behind login forms
   variant="home"  → brighter dragon, more red fire embers
   ───────────────────────────────────────────────────────── */

export interface GridBackgroundProps {
  variant?: 'auth' | 'home';
}

/* ── Config per variant ── */
function getConfig(variant: 'auth' | 'home') {
  if (variant === 'home') {
    return {
      dragonCount: 6000,
      dragonSize: 0.08,
      dragonOpacity: 0.9,
      emberCount: 2000,
      emberSize: 0.03,
      emberOpacity: 0.55,
      dustCount: 800,
      dustOpacity: 0.3,
      lightIntensityMultiplier: 1.6,
      ringOpacity: 0.3,
      fogNear: 7,
      fogFar: 26,
      cameraZ: 9,
    };
  }
  // auth (default)
  return {
    dragonCount: 4000,
    dragonSize: 0.06,
    dragonOpacity: 0.7,
    emberCount: 1200,
    emberSize: 0.04,
    emberOpacity: 0.5,
    dustCount: 600,
    dustOpacity: 0.25,
    lightIntensityMultiplier: 1,
    ringOpacity: 0.2,
    fogNear: 6,
    fogFar: 22,
    cameraZ: 8,
  };
}

function generateDragonPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 6;
    const segment = i / count;

    // Main serpentine body curve
    const bodyX = Math.sin(t * 0.4) * 2.5 + Math.sin(t * 1.2) * 0.8;
    const bodyY = (segment - 0.5) * 8 + Math.sin(t * 0.6) * 1.2;
    const bodyZ = Math.cos(t * 0.3) * 1.5 + Math.cos(t * 0.9) * 0.5;

    // Body thickness — thicker in the middle, thin at tail/head
    const thickness = Math.sin(segment * Math.PI) * 0.9 + 0.15;

    // Random scatter within body volume
    const scatter = thickness * (0.3 + Math.random() * 0.7);
    const angle = Math.random() * Math.PI * 2;

    positions[i * 3] = bodyX + Math.cos(angle) * scatter;
    positions[i * 3 + 1] = bodyY + (Math.random() - 0.5) * scatter * 0.6;
    positions[i * 3 + 2] = bodyZ + Math.sin(angle) * scatter;

    // Wing-like appendages
    if ((segment > 0.28 && segment < 0.48) || (segment > 0.53 && segment < 0.73)) {
      const wingSpread = Math.sin((segment - 0.38) * Math.PI * 5) * 3;
      const side = segment < 0.5 ? 1 : -1;
      if (Math.random() > 0.5) {
        positions[i * 3] += wingSpread * side * (0.5 + Math.random());
        positions[i * 3 + 1] += Math.abs(wingSpread) * 0.3 * Math.random();
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.5;
      }
    }

    // Horns / head spikes
    if (segment > 0.88) {
      const hornFactor = (segment - 0.88) / 0.12;
      if (Math.random() > 0.6) {
        positions[i * 3] += (Math.random() - 0.5) * hornFactor * 2;
        positions[i * 3 + 1] += hornFactor * 1.5;
        positions[i * 3 + 2] += (Math.random() - 0.5) * hornFactor;
      }
    }
  }

  return positions;
}

/* ── Dragon Particle Cloud ── */
function DragonParticles({ count, size, opacity }: {
  count: number;
  size: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => generateDragonPoints(count), [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.08) * 0.3;
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.1;
    ref.current.rotation.z = Math.cos(t * 0.06) * 0.05;

    const pulse = 1 + Math.sin(t * 0.4) * 0.03;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <group position={[0.5, -0.5, 0]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#FF4655"
          size={size}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={opacity}
        />
      </Points>
    </group>
  );
}

/* ── Ember / Fire Particle Field ── */
function EmberField({ count, size, opacity, variant }: {
  count: number;
  size: number;
  opacity: number;
  variant: 'auth' | 'home';
}) {
  const ref = useRef<THREE.Points>(null!);

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Home variant: red + blue fire palette
    const palette = variant === 'home'
      ? [
          new THREE.Color('#FF4655'), // Valorant red
          new THREE.Color('#FF4655'),
          new THREE.Color('#FF3344'), // deeper red
          new THREE.Color('#FF6B75'), // light red
          new THREE.Color('#E8303D'), // crimson
          new THREE.Color('#3B82F6'), // blue
          new THREE.Color('#CC2233'), // dark red
          new THREE.Color('#2563EB'), // deeper blue
        ]
      : [
          new THREE.Color('#FF4655'),
          new THREE.Color('#FF6B75'),
          new THREE.Color('#3B82F6'), // blue
          new THREE.Color('#60A5FA'), // light blue
          new THREE.Color('#A855F7'),
          new THREE.Color('#0FF0FC'),
        ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = Math.random() * 0.008 + 0.002;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, velocities, colors };
  }, [count, variant]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3];
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];

      if (arr[i * 3 + 1] > 7) {
        arr[i * 3] = (Math.random() - 0.5) * 18;
        arr[i * 3 + 1] = -7;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }

    pos.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={size}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={opacity}
      />
    </Points>
  );
}

/* ── Ambient Dust / Sparkle Particles ── */
function DustField({ count, opacity }: { count: number; opacity: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.01;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60A5FA"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={opacity}
      />
    </Points>
  );
}

/* ── Energy Ring ── */
function EnergyRing({ radius, color, speed, yOffset, opacity }: {
  radius: number;
  color: string;
  speed: number;
  yOffset: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = Math.PI / 2 + Math.sin(t * speed * 0.3) * 0.2;
    ref.current.rotation.z = t * speed;
    ref.current.position.y = yOffset + Math.sin(t * speed * 0.5) * 0.3;
    const scale = 1 + Math.sin(t * speed * 2) * 0.05;
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref} position={[0.5, yOffset, 0]}>
      <torusGeometry args={[radius, 0.015, 16, 80]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ── Mouse-reactive Camera Controller ── */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useMemo(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [handleMouseMove]);

  useFrame(() => {
    target.current.x += (mouse.current.x * 1.2 - target.current.x) * 0.02;
    target.current.y += (-mouse.current.y * 0.8 - target.current.y) * 0.02;

    camera.position.x = target.current.x;
    camera.position.y = target.current.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Volumetric Light Beams ── */
function LightBeam({ position, color, opacity }: {
  position: [number, number, number];
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.z = Math.sin(t * 0.15 + position[0]) * 0.1;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = opacity * (0.6 + Math.sin(t * 0.3 + position[1]) * 0.4);
  });

  return (
    <mesh ref={ref} position={position} rotation={[0, 0, 0.3]}>
      <planeGeometry args={[0.08, 14]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ── Full Scene ── */
function DragonScene({ variant }: { variant: 'auth' | 'home' }) {
  const cfg = getConfig(variant);
  const lm = cfg.lightIntensityMultiplier;

  return (
    <>
      <CameraRig />

      {/* Atmosphere */}
      <fog attach="fog" args={['#0A0A0F', cfg.fogNear, cfg.fogFar]} />
      <ambientLight intensity={0.05 * lm} />

      {/* Dragon particle body */}
      <DragonParticles
        count={cfg.dragonCount}
        size={cfg.dragonSize}
        opacity={cfg.dragonOpacity}
      />

      {/* Floating embers – small red fire particles */}
      <EmberField
        count={cfg.emberCount}
        size={cfg.emberSize}
        opacity={cfg.emberOpacity}
        variant={variant}
      />

      {/* Ambient dust */}
      <DustField count={cfg.dustCount} opacity={cfg.dustOpacity} />

      {/* Energy rings around the dragon */}
      <EnergyRing radius={2.2} color="#FF4655" speed={0.15} yOffset={0} opacity={cfg.ringOpacity} />
      <EnergyRing radius={2.8} color="#A855F7" speed={-0.1} yOffset={0.5} opacity={cfg.ringOpacity} />
      <EnergyRing radius={1.6} color="#0FF0FC" speed={0.2} yOffset={-0.8} opacity={cfg.ringOpacity} />

      {/* Volumetric light beams */}
      <LightBeam position={[-3, 0, -2]} color="#FF4655" opacity={0.06 * lm} />
      <LightBeam position={[4, 0, -3]} color="#A855F7" opacity={0.04 * lm} />
      <LightBeam position={[1, 0, -1.5]} color="#0FF0FC" opacity={0.035 * lm} />

      {/* Colored point lights for volumetric glow on the dragon */}
      <pointLight position={[0, 2, 2]} color="#FF4655" intensity={3 * lm} distance={8} decay={2} />
      <pointLight position={[-2, -1, 1]} color="#A855F7" intensity={2 * lm} distance={6} decay={2} />
      <pointLight position={[2, -2, 3]} color="#0FF0FC" intensity={1.5 * lm} distance={6} decay={2} />
      <pointLight position={[0, 0, 0]} color="#FF9F43" intensity={1 * lm} distance={4} decay={2} />
    </>
  );
}

/* ── Exported Component ── */
export default function GridBackground({ variant = 'auth' }: GridBackgroundProps) {
  const cfg = getConfig(variant);

  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, cfg.cameraZ], fov: 55, near: 0.1, far: 30 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <DragonScene variant={variant} />
        </Suspense>
      </Canvas>
    </div>
  );
}
