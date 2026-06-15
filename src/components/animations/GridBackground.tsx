'use client';

import { useRef, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────
   Dragon Vandal – Interactive 3D Particle Dragon
   
   Features:
   • Scroll-to-dive: scrolling moves the camera deeper into the scene
   • Mouse parallax: camera tilts and shifts with mouse movement
   • Warp streaks: speed lines appear when scrolling fast
   • Pulsing dragon with breathing glow
   • Fire embers rising from below
   • Energy rings and volumetric lights
   
   variant="auth"  → subtle, behind login forms
   variant="home"  → brighter, more interactive
   ───────────────────────────────────────────────────────── */

export interface GridBackgroundProps {
  variant?: 'auth' | 'home';
}

/* ── Shared scroll state (updated from the DOM layer) ── */
const scrollState = {
  progress: 0,   // 0-1 normalized scroll progress
  velocity: 0,   // current scroll speed for warp effect
  mouseX: 0,
  mouseY: 0,
};

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
      warpCount: 300,
      lightIntensityMultiplier: 1.6,
      ringOpacity: 0.3,
      fogNear: 7,
      fogFar: 28,
      cameraZ: 9,
      scrollDepth: 6,       // how far the camera dives on scroll
      parallaxStrength: 1.5, // mouse parallax multiplier
    };
  }
  return {
    dragonCount: 4000,
    dragonSize: 0.06,
    dragonOpacity: 0.7,
    emberCount: 1200,
    emberSize: 0.04,
    emberOpacity: 0.5,
    dustCount: 600,
    dustOpacity: 0.25,
    warpCount: 150,
    lightIntensityMultiplier: 1,
    ringOpacity: 0.2,
    fogNear: 6,
    fogFar: 22,
    cameraZ: 8,
    scrollDepth: 4,
    parallaxStrength: 1.0,
  };
}

function generateDragonPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 6;
    const segment = i / count;

    const bodyX = Math.sin(t * 0.4) * 2.5 + Math.sin(t * 1.2) * 0.8;
    const bodyY = (segment - 0.5) * 8 + Math.sin(t * 0.6) * 1.2;
    const bodyZ = Math.cos(t * 0.3) * 1.5 + Math.cos(t * 0.9) * 0.5;

    const thickness = Math.sin(segment * Math.PI) * 0.9 + 0.15;
    const scatter = thickness * (0.3 + Math.random() * 0.7);
    const angle = Math.random() * Math.PI * 2;

    positions[i * 3] = bodyX + Math.cos(angle) * scatter;
    positions[i * 3 + 1] = bodyY + (Math.random() - 0.5) * scatter * 0.6;
    positions[i * 3 + 2] = bodyZ + Math.sin(angle) * scatter;

    // Wings
    if ((segment > 0.28 && segment < 0.48) || (segment > 0.53 && segment < 0.73)) {
      const wingSpread = Math.sin((segment - 0.38) * Math.PI * 5) * 3;
      const side = segment < 0.5 ? 1 : -1;
      if (Math.random() > 0.5) {
        positions[i * 3] += wingSpread * side * (0.5 + Math.random());
        positions[i * 3 + 1] += Math.abs(wingSpread) * 0.3 * Math.random();
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.5;
      }
    }

    // Horns
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

/* ── Dragon Particle Cloud with breathing glow ── */
function DragonParticles({ count, size, opacity }: {
  count: number;
  size: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);

  const positions = useMemo(() => generateDragonPoints(count), [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();

    // Scroll makes the dragon rotate more dramatically
    const scrollInfluence = scrollState.progress;
    ref.current.rotation.y = Math.sin(t * 0.08) * 0.3 + scrollInfluence * Math.PI * 0.4;
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.1 + scrollInfluence * 0.3;
    ref.current.rotation.z = Math.cos(t * 0.06) * 0.05;

    // Breathing pulse — more intense as you scroll deeper
    const breathIntensity = 0.03 + scrollInfluence * 0.04;
    const pulse = 1 + Math.sin(t * 0.4) * breathIntensity;
    ref.current.scale.setScalar(pulse);

    // Pulsing opacity for breathing glow
    if (matRef.current) {
      matRef.current.opacity = opacity * (0.85 + Math.sin(t * 0.6) * 0.15);
      matRef.current.size = size * (1 + Math.sin(t * 0.8) * 0.15);
    }
  });

  return (
    <group position={[0.5, -0.5, 0]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          ref={matRef}
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

    const palette = variant === 'home'
      ? [
          new THREE.Color('#FF4655'),
          new THREE.Color('#FF4655'),
          new THREE.Color('#FF3344'),
          new THREE.Color('#FF6B75'),
          new THREE.Color('#E8303D'),
          new THREE.Color('#3B82F6'),
          new THREE.Color('#CC2233'),
          new THREE.Color('#2563EB'),
        ]
      : [
          new THREE.Color('#FF4655'),
          new THREE.Color('#FF6B75'),
          new THREE.Color('#3B82F6'),
          new THREE.Color('#60A5FA'),
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

    // Scroll velocity makes embers move faster
    const speedBoost = 1 + Math.abs(scrollState.velocity) * 3;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3] * speedBoost;
      arr[i * 3 + 1] += velocities[i * 3 + 1] * speedBoost;
      arr[i * 3 + 2] += velocities[i * 3 + 2] * speedBoost;

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

/* ── Warp Speed Streaks — appear when scrolling ── */
function WarpStreaks({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);

  const { positions, basePositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 20 - 2;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;
    }
    return { positions, basePositions };
  }, [count]);

  useFrame(() => {
    if (!ref.current || !matRef.current) return;
    const vel = Math.abs(scrollState.velocity);
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    // Streaks fly toward the camera when scrolling
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += vel * 0.8;
      if (arr[i * 3 + 2] > 10) {
        arr[i * 3] = (Math.random() - 0.5) * 16;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
        arr[i * 3 + 2] = -12 - Math.random() * 8;
      }
    }
    pos.needsUpdate = true;

    // Opacity and stretch based on scroll velocity
    matRef.current.opacity = Math.min(vel * 4, 0.6);
    matRef.current.size = 0.01 + vel * 0.15;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        ref={matRef}
        transparent
        color="#60A5FA"
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0}
      />
    </Points>
  );
}

/* ── Ambient Dust ── */
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
    const scale = 1 + Math.sin(t * speed * 2) * 0.05 + scrollState.progress * 0.3;
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

/* ── Interactive Camera Controller with scroll depth ── */
function CameraRig({ baseZ, scrollDepth, parallaxStrength }: {
  baseZ: number;
  scrollDepth: number;
  parallaxStrength: number;
}) {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0, z: baseZ });

  useFrame(() => {
    const mx = scrollState.mouseX;
    const my = scrollState.mouseY;

    // Mouse parallax — position + subtle rotation
    const targetX = mx * parallaxStrength * 1.2;
    const targetY = -my * parallaxStrength * 0.8;

    // Scroll drives Z depth — scrolling dives into the scene
    const targetZ = baseZ - scrollState.progress * scrollDepth;

    // Smooth lerp everything
    target.current.x += (targetX - target.current.x) * 0.03;
    target.current.y += (targetY - target.current.y) * 0.03;
    target.current.z += (targetZ - target.current.z) * 0.04;

    camera.position.x = target.current.x;
    camera.position.y = target.current.y;
    camera.position.z = target.current.z;

    // Look slightly ahead of center based on mouse for depth feel
    camera.lookAt(
      target.current.x * 0.3,
      target.current.y * 0.3,
      0
    );
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

/* ── Pulsing Glow Sphere at dragon core ── */
function CoreGlow() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const scale = 0.8 + Math.sin(t * 0.5) * 0.3 + scrollState.progress * 0.5;
    ref.current.scale.setScalar(scale);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.04 + Math.sin(t * 0.6) * 0.02 + scrollState.progress * 0.03;
  });

  return (
    <mesh ref={ref} position={[0.5, -0.5, 0]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial
        color="#FF4655"
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
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
      <CameraRig
        baseZ={cfg.cameraZ}
        scrollDepth={cfg.scrollDepth}
        parallaxStrength={cfg.parallaxStrength}
      />

      <fog attach="fog" args={['#0A0A0F', cfg.fogNear, cfg.fogFar]} />
      <ambientLight intensity={0.05 * lm} />

      {/* Dragon body */}
      <DragonParticles
        count={cfg.dragonCount}
        size={cfg.dragonSize}
        opacity={cfg.dragonOpacity}
      />

      {/* Core glow at dragon center */}
      <CoreGlow />

      {/* Fire embers */}
      <EmberField
        count={cfg.emberCount}
        size={cfg.emberSize}
        opacity={cfg.emberOpacity}
        variant={variant}
      />

      {/* Warp speed streaks on scroll */}
      <WarpStreaks count={cfg.warpCount} />

      {/* Ambient dust */}
      <DustField count={cfg.dustCount} opacity={cfg.dustOpacity} />

      {/* Energy rings */}
      <EnergyRing radius={2.2} color="#FF4655" speed={0.15} yOffset={0} opacity={cfg.ringOpacity} />
      <EnergyRing radius={2.8} color="#A855F7" speed={-0.1} yOffset={0.5} opacity={cfg.ringOpacity} />
      <EnergyRing radius={1.6} color="#0FF0FC" speed={0.2} yOffset={-0.8} opacity={cfg.ringOpacity} />

      {/* Volumetric beams */}
      <LightBeam position={[-3, 0, -2]} color="#FF4655" opacity={0.06 * lm} />
      <LightBeam position={[4, 0, -3]} color="#A855F7" opacity={0.04 * lm} />
      <LightBeam position={[1, 0, -1.5]} color="#0FF0FC" opacity={0.035 * lm} />

      {/* Point lights */}
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
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      scrollState.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      scrollState.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

      // Calculate velocity for warp effect
      const delta = scrollY - lastScrollY.current;
      scrollState.velocity = delta / (window.innerHeight * 0.5); // normalized
      lastScrollY.current = scrollY;
    };

    // Decay velocity each frame
    const decayInterval = setInterval(() => {
      scrollState.velocity *= 0.92;
    }, 16);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(decayInterval);
    };
  }, []);

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
