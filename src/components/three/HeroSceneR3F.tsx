/**
 * HeroSceneR3F — three.js particle field for the hero section.
 *
 * Behavior (desktop):
 *   ▸ ~120 particles drift in a soft 2D field.
 *   ▸ Nearby particles are connected by a thin line whose thickness (opacity)
 *     grows as they approach.
 *   ▸ When two particles collide (d < mergeRadius), they MERGE into one
 *     heavier particle. Mass decays back to 1 over ~8s. New particles spawn
 *     at the edges to keep the population lively.
 *   ▸ The cursor is a soft attractor — merges cluster where you point.
 *
 * Mobile:
 *   ▸ Fewer particles (~35). Link/merge disabled. Simple drift only.
 *
 * Reduced-motion:
 *   ▸ Static snapshot, no updates.
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMouseNormalized } from "@/hooks/useMouseNormalized";

/* ── Tunables ─────────────────────────────────────────── */

const DESKTOP_COUNT = 120;
const MOBILE_COUNT = 40;
const LINK_RADIUS = 0.22;      // in world units (scene spans ~[-1.6, 1.6])
const MERGE_RADIUS = 0.028;
const BASE_SIZE = 9.0;          // px, at mass 1
const MAX_LINKS = 260;          // cap: geometry uses fixed-length buffer
// Deep amber — reads against the light cream background. Normal (not additive)
// blending is critical: additive on near-white bg makes the colour invisible.
const PRIMARY_COLOR = new THREE.Color("#a15c07");

/* ── Particle datatype ────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;   // >= 1
  seed: number;   // for per-particle phase
  alive: boolean;
}

function spawn(rng: () => number, edge = false): Particle {
  // World field extends roughly ±1.6 (x) × ±1.0 (y) — matches a 16:10 view
  const x = edge
    ? (rng() < 0.5 ? -1.7 : 1.7)
    : (rng() * 2 - 1) * 1.5;
  const y = (rng() * 2 - 1) * 0.95;
  const angle = rng() * Math.PI * 2;
  const speed = 0.008 + rng() * 0.014;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    mass: 1,
    seed: rng() * Math.PI * 2,
    alive: true,
  };
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/* ── Point sprite shader (soft radial) ────────────────── */

const POINT_VERT = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize;
}
`;

const POINT_FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.4);
  gl_FragColor = vec4(uColor, a * vAlpha);
}
`;

const LINE_VERT = /* glsl */ `
attribute float aAlpha;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LINE_FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(uColor, vAlpha);
}
`;

/* ── Scene contents ───────────────────────────────────── */

const ParticleField = ({ count, enableLinks }: { count: number; enableLinks: boolean }) => {
  const { size } = useThree();
  const reduceMotion = useReducedMotion();
  const mouseRef = useMouseNormalized();

  const particles = useMemo<Particle[]>(() => {
    const rng = seededRandom(1337);
    return Array.from({ length: count }, () => spawn(rng, false));
  }, [count]);

  const rngRef = useRef(seededRandom(9001));

  // Point buffers
  const pointGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(count), 1));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(count), 1));
    return g;
  }, [count]);

  // Link buffers (fixed cap)
  const linkGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 2 * 3), 3));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 2), 1));
    g.setDrawRange(0, 0);
    return g;
  }, []);

  const pointMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        uniforms: { uColor: { value: PRIMARY_COLOR } },
      }),
    []
  );

  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: LINE_VERT,
        fragmentShader: LINE_FRAG,
        uniforms: { uColor: { value: PRIMARY_COLOR } },
      }),
    []
  );

  useFrame((state, delta) => {
    if (reduceMotion) return;
    const dt = Math.min(delta, 0.05);
    const aspect = size.width / Math.max(size.height, 1);
    const worldHalfX = 1.5 * Math.max(aspect / 1.6, 1); // widen field on wide displays

    const mx = mouseRef.current.x * worldHalfX;
    const my = mouseRef.current.y * 0.95;
    const mouseActive = mouseRef.current.active;

    // 1. Integrate motion
    for (const p of particles) {
      if (!p.alive) continue;

      // Mass decay toward 1
      if (p.mass > 1) p.mass = Math.max(1, p.mass - dt * 0.15);

      // Very gentle sinusoidal wander
      p.vx += Math.sin(state.clock.elapsedTime * 0.4 + p.seed) * 0.00025;
      p.vy += Math.cos(state.clock.elapsedTime * 0.35 + p.seed * 1.3) * 0.00025;

      // Cursor attraction (soft)
      if (mouseActive) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 0.6 * 0.6) {
          const falloff = (1 - Math.sqrt(d2) / 0.6);
          p.vx += dx * falloff * dt * 0.4;
          p.vy += dy * falloff * dt * 0.4;
        }
      }

      // Damping
      p.vx *= 0.985;
      p.vy *= 0.985;

      p.x += p.vx;
      p.y += p.vy;

      // Recycle when off-field
      if (p.x < -worldHalfX - 0.2 || p.x > worldHalfX + 0.2 || p.y < -1.15 || p.y > 1.15) {
        Object.assign(p, spawn(rngRef.current, true));
      }
    }

    // 2. Link + merge (desktop only)
    let linkIdx = 0;
    const linkPos = linkGeom.getAttribute("position") as THREE.BufferAttribute;
    const linkAlpha = linkGeom.getAttribute("aAlpha") as THREE.BufferAttribute;
    const linkPosArr = linkPos.array as Float32Array;
    const linkAlphaArr = linkAlpha.array as Float32Array;

    if (enableLinks) {
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (!a.alive) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (!b.alive) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_RADIUS * LINK_RADIUS) continue;
          const d = Math.sqrt(d2);

          if (d < MERGE_RADIUS) {
            // Merge b into a (weighted by mass)
            const m = a.mass + b.mass;
            a.x = (a.x * a.mass + b.x * b.mass) / m;
            a.y = (a.y * a.mass + b.y * b.mass) / m;
            a.vx = (a.vx * a.mass + b.vx * b.mass) / m;
            a.vy = (a.vy * a.mass + b.vy * b.mass) / m;
            a.mass = Math.min(m, 6);
            // Respawn b at an edge to maintain population
            Object.assign(b, spawn(rngRef.current, true));
            continue;
          }

          if (linkIdx < MAX_LINKS) {
            const alpha = (1 - d / LINK_RADIUS);
            const a1 = alpha * alpha * 0.35;
            const base = linkIdx * 6;
            linkPosArr[base + 0] = a.x;
            linkPosArr[base + 1] = a.y;
            linkPosArr[base + 2] = 0;
            linkPosArr[base + 3] = b.x;
            linkPosArr[base + 4] = b.y;
            linkPosArr[base + 5] = 0;
            const abase = linkIdx * 2;
            linkAlphaArr[abase + 0] = a1;
            linkAlphaArr[abase + 1] = a1;
            linkIdx++;
          }
        }
      }
    }

    linkGeom.setDrawRange(0, linkIdx * 2);
    linkPos.needsUpdate = true;
    linkAlpha.needsUpdate = true;

    // 3. Push point attributes
    const pos = pointGeom.getAttribute("position") as THREE.BufferAttribute;
    const sz = pointGeom.getAttribute("aSize") as THREE.BufferAttribute;
    const al = pointGeom.getAttribute("aAlpha") as THREE.BufferAttribute;
    const posArr = pos.array as Float32Array;
    const szArr = sz.array as Float32Array;
    const alArr = al.array as Float32Array;

    const dpr = state.gl.getPixelRatio();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      posArr[i * 3 + 0] = p.x;
      posArr[i * 3 + 1] = p.y;
      posArr[i * 3 + 2] = 0;
      szArr[i] = BASE_SIZE * Math.sqrt(p.mass) * dpr;
      alArr[i] = 0.55 + Math.min(p.mass - 1, 5) * 0.06;
    }
    pos.needsUpdate = true;
    sz.needsUpdate = true;
    al.needsUpdate = true;
  });

  return (
    <>
      {enableLinks && <lineSegments geometry={linkGeom} material={lineMat} frustumCulled={false} />}
      <points geometry={pointGeom} material={pointMat} frustumCulled={false} />
    </>
  );
};

const HeroSceneR3F = () => {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const count = isMobile ? MOBILE_COUNT : DESKTOP_COUNT;
  const enableLinks = !isMobile && !reduceMotion;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
        frameloop={reduceMotion ? "demand" : "always"}
        camera={{ position: [0, 0, 2.4], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ParticleField count={count} enableLinks={enableLinks} />
      </Canvas>
    </div>
  );
};

export default HeroSceneR3F;
