/**
 * HeroSceneR3F — cinematic light dust for the hero section.
 *
 * Deliberately restrained: a handful of warm, out-of-focus motes drifting
 * very slowly. No links, no merges, no gimmicks. Reads as ambient film-grain
 * atmosphere rather than a "particle system".
 */

import { useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMouseNormalized } from "@/hooks/useMouseNormalized";

const DESKTOP_COUNT = 34;
const MOBILE_COUNT = 14;
// Warm amber-gold. Soft additive-style read via shader falloff, NormalBlending
// so it doesn't blow out on the cream background.
const DUST_COLOR = new THREE.Color("#c68a3a");

interface Mote {
  x: number;
  y: number;
  z: number;         // depth 0..1 (0 far, 1 near) — drives size & alpha
  vx: number;
  vy: number;
  seed: number;
  radius: number;    // base px radius
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function spawn(rng: () => number): Mote {
  const z = rng();
  return {
    x: (rng() * 2 - 1) * 1.6,
    y: (rng() * 2 - 1) * 1.0,
    z,
    vx: (rng() - 0.5) * 0.0015,
    vy: 0.0008 + rng() * 0.0016, // gentle upward drift
    seed: rng() * Math.PI * 2,
    // Bigger, softer motes in the foreground; tiny sparkle in the back
    radius: 4 + z * 22,
  };
}

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
  // Very soft gaussian-ish falloff — looks like out-of-focus bokeh
  float a = exp(-d * d * 14.0);
  gl_FragColor = vec4(uColor, a * vAlpha);
}
`;

const Dust = ({ count }: { count: number }) => {
  const { size } = useThree();
  const reduceMotion = useReducedMotion();
  const mouseRef = useMouseNormalized();

  const motes = useMemo<Mote[]>(() => {
    const rng = seededRandom(1337);
    return Array.from({ length: count }, () => spawn(rng));
  }, [count]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(count), 1));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(count), 1));
    return g;
  }, [count]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        uniforms: { uColor: { value: DUST_COLOR } },
      }),
    []
  );

  useFrame((state, delta) => {
    if (reduceMotion) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Very gentle parallax follows the cursor — barely perceptible
    const mx = mouseRef.current.x * 0.05;
    const my = mouseRef.current.y * 0.04;

    const pos = geom.getAttribute("position") as THREE.BufferAttribute;
    const sz = geom.getAttribute("aSize") as THREE.BufferAttribute;
    const al = geom.getAttribute("aAlpha") as THREE.BufferAttribute;
    const posArr = pos.array as Float32Array;
    const szArr = sz.array as Float32Array;
    const alArr = al.array as Float32Array;

    const dpr = state.gl.getPixelRatio();

    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];

      // Slow drift + micro-sway
      m.x += m.vx + Math.sin(t * 0.15 + m.seed) * 0.00025;
      m.y += m.vy * dt * 30;

      // Recycle upward → bottom
      if (m.y > 1.15) {
        m.y = -1.15;
        m.x = (Math.random() * 2 - 1) * 1.6;
      }
      if (m.x < -1.75) m.x = 1.75;
      if (m.x > 1.75) m.x = -1.75;

      // Parallax by depth
      const px = m.x + mx * m.z;
      const py = m.y + my * m.z;

      posArr[i * 3 + 0] = px;
      posArr[i * 3 + 1] = py;
      posArr[i * 3 + 2] = 0;

      szArr[i] = m.radius * dpr;
      // Foreground motes stronger; background whisper-faint. Overall low.
      alArr[i] = 0.10 + m.z * 0.22;
    }

    pos.needsUpdate = true;
    sz.needsUpdate = true;
    al.needsUpdate = true;
  });

  return <points geometry={geom} material={mat} frustumCulled={false} />;
};

const HeroSceneR3F = () => {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const count = isMobile ? MOBILE_COUNT : DESKTOP_COUNT;

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
        <Dust count={count} />
      </Canvas>
    </div>
  );
};

export default HeroSceneR3F;
