'use client';

import { useRef, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────
   Dragon Vandal – Particle Dragon Silhouette
   Renders a serpentine dragon shape from glowing particles
   that drift and pulse with fire-like energy.
   ───────────────────────────────────────────────────────── */

function generateDragonPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 6; // spirals along the body
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

    // Wing-like appendages at ~30-50% and ~55-75% of body
    if ((segment > 0.28 && segment < 0.48) || (segment > 0.53 && segment < 0.73)) {
      const wingSpread = Math.sin((segment - 0.38) * Math.PI * 5) * 3;
      const side = segment < 0.5 ? 1 : -1;
      if (Math.random() > 0.5) {
        positions[i * 3] += wingSpread * side * (0.5 + Math.random());
        positions[i * 3 + 1] += Math.abs(wingSpread) * 0.3 * Math.random();
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.5;
      }
    }

    // Horns / head spikes at the top (segment > 0.9)
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
function DragonParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 4000;

  const positions = useMemo(() => generateDragonPoints(count), [count]);

  // Per-particle attributes for animation
  const { sizes, opacities, phases } = useMemo(() => {
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      sizes[i] = Math.random() * 0.06 + 0.02;
      opacities[i] = Math.random() * 0.6 + 0.4;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { sizes, opacities, phases };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // Slow rotation of the whole dragon
    ref.current.rotation.y = Math.sin(t * 0.08) * 0.3;
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.1;
    ref.current.rotation.z = Math.cos(t * 0.06) * 0.05;

    // Pulse the scale subtly
    const pulse = 1 + Math.sin(t * 0.4) * 0.03;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <group position={[0.5, -0.5, 0]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#FF4655"
          size={0.06}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.7}
        />
      </Points>
    </group>
  );
}

/* ── Ember / Fire Particle Field ── */
function EmberField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 1200;

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#FF4655'), // Valorant red
      new THREE.Color('#FF6B75'), // light red
      new THREE.Color('#FF9F43'), // orange ember
      new THREE.Color('#FFC048'), // gold spark
      new THREE.Color('#A855F7'), // purple
      new THREE.Color('#0FF0FC'), // cyan accent
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
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3];
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];

      // Reset particles that float too high
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
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.5}
      />
    </Points>
  );
}

/* ── Ambient Dust / Sparkle Particles ── */
function DustField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 600;

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
        color="#ffffff"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.25}
      />
    </Points>
  );
}

/* ── Energy Ring ── */
function EnergyRing({ radius, color, speed, yOffset }: {
  radius: number;
  color: string;
  speed: number;
  yOffset: number;
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
        opacity={0.2}
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

  // Register mouse listener
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
    // Smooth lerp toward mouse position
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
function DragonScene() {
  return (
    <>
      <CameraRig />

      {/* Atmosphere */}
      <fog attach="fog" args={['#0A0A0F', 6, 22]} />
      <ambientLight intensity={0.05} />

      {/* Dragon particle body */}
      <DragonParticles />

      {/* Floating embers */}
      <EmberField />

      {/* Ambient dust */}
      <DustField />

      {/* Energy rings around the dragon */}
      <EnergyRing radius={2.2} color="#FF4655" speed={0.15} yOffset={0} />
      <EnergyRing radius={2.8} color="#A855F7" speed={-0.1} yOffset={0.5} />
      <EnergyRing radius={1.6} color="#0FF0FC" speed={0.2} yOffset={-0.8} />

      {/* Volumetric light beams */}
      <LightBeam position={[-3, 0, -2]} color="#FF4655" opacity={0.06} />
      <LightBeam position={[4, 0, -3]} color="#A855F7" opacity={0.04} />
      <LightBeam position={[1, 0, -1.5]} color="#0FF0FC" opacity={0.035} />

      {/* Colored point lights for volumetric glow on the dragon */}
      <pointLight position={[0, 2, 2]} color="#FF4655" intensity={3} distance={8} decay={2} />
      <pointLight position={[-2, -1, 1]} color="#A855F7" intensity={2} distance={6} decay={2} />
      <pointLight position={[2, -2, 3]} color="#0FF0FC" intensity={1.5} distance={6} decay={2} />
      <pointLight position={[0, 0, 0]} color="#FF9F43" intensity={1} distance={4} decay={2} />
    </>
  );
}

/* ── Exported Component ── */
export default function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 30 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <DragonScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
