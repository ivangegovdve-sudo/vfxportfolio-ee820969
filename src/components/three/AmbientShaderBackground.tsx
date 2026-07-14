/**
 * Site-wide ambient shader background.
 *
 * ▸ Fixed full-viewport <Canvas> at z-index -1.
 * ▸ Very low opacity (≤ 0.06) — text and cards remain fully readable.
 * ▸ Slow-drifting fbm noise + radial gradient tinted by --primary.
 * ▸ Hue shifts slightly with scroll position for section variety.
 * ▸ Mouse-reactive soft radial warp.
 * ▸ Disabled entirely on mobile; frozen on prefers-reduced-motion.
 * ▸ `frameloop="demand"` keeps GPU near-idle when nothing changes.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMouseNormalized } from "@/hooks/useMouseNormalized";

const AMBIENT_FRAG = /* glsl */ `
precision mediump float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uScroll;
uniform vec3  uTint;

// hash + fbm — cheap, no textures
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv - 0.5;
  p.x *= uResolution.x / uResolution.y;

  // Mouse warp — very gentle
  vec2 m = uMouse * 0.5;
  float md = length(p - m);
  vec2 warp = normalize(p - m + 1e-4) * exp(-md * 3.0) * 0.06;

  // Slow-drifting noise
  vec2 q = (p + warp) * 1.4 + vec2(uTime * 0.02, uTime * -0.015);
  float n = fbm(q + fbm(q * 1.8));

  // Radial fall-off from center → darker edges
  float radial = smoothstep(1.1, 0.15, length(p));

  // Hue shift by scroll — subtle temperature swing around the tint
  float hueShift = sin(uScroll * 6.2831 + 0.7) * 0.08;
  vec3 tint = clamp(uTint + vec3(hueShift * 0.5, hueShift * 0.15, -hueShift * 0.35), 0.0, 1.5);

  float intensity = n * radial * 0.22;
  vec3 col = tint * intensity;

  // Output alpha — perceptible but still restrained
  float alpha = clamp(intensity * 1.1, 0.0, 0.16);
  gl_FragColor = vec4(col, alpha);
}
`;

const AMBIENT_VERT = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

interface AmbientMaterialUniforms {
  uTime: { value: number };
  uResolution: { value: THREE.Vector2 };
  uMouse: { value: THREE.Vector2 };
  uScroll: { value: number };
  uTint: { value: THREE.Vector3 };
}

const AmbientPlane = ({ frozen }: { frozen: boolean }) => {
  const { size, invalidate } = useThree();
  const mouseRef = useMouseNormalized();
  const scrollRef = useRef(0);

  const uniforms = useMemo<AmbientMaterialUniforms>(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      // Warm amber matching --primary (38 92% 50%) roughly => rgb ~ (0.96, 0.66, 0.13)
      uTint: { value: new THREE.Vector3(0.96, 0.66, 0.13) },
    }),
    // size intentionally not a dep here — updated below
    []
  );

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
    invalidate();
  }, [size.width, size.height, uniforms, invalidate]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
      scrollRef.current = Math.min(Math.max(window.scrollY / max, 0), 1);
      invalidate();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate]);

  useFrame((state) => {
    if (!frozen) {
      uniforms.uTime.value = state.clock.elapsedTime;
      invalidate();
    }
    uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    uniforms.uScroll.value = scrollRef.current;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        transparent
        depthTest={false}
        depthWrite={false}
        uniforms={uniforms as unknown as Record<string, THREE.IUniform>}
        vertexShader={AMBIENT_VERT}
        fragmentShader={AMBIENT_FRAG}
      />
    </mesh>
  );
};

const AmbientShaderBackground = () => {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Skip entirely on mobile — CSS motes already provide atmosphere there.
  if (isMobile) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 1.5]}
        frameloop={reduceMotion ? "never" : "always"}
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 1] }}
      >
        <AmbientPlane frozen={!!reduceMotion} />
      </Canvas>
    </div>
  );
};

export default AmbientShaderBackground;
