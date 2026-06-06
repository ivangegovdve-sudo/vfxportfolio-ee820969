import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Dot = {
  theta: number;
  phi: number;
  radius: number;
  depth: number;
};

const DOT_COUNT = 360;
const RING_COUNT = 22;

const buildSphereDots = () =>
  Array.from({ length: DOT_COUNT }, (_, index): Dot => {
    const offset = 2 / DOT_COUNT;
    const y = index * offset - 1 + offset / 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = index * Math.PI * (3 - Math.sqrt(5));

    return {
      theta,
      phi: Math.asin(y),
      radius,
      depth: 0.55 + (index % 17) / 34,
    };
  });

const HeroParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return;
    }

    const dots = buildSphereDots();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;
    let start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      pointer.ty = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    };

    const draw = (now: number) => {
      const elapsed = reduceMotion ? 0 : (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.055;
      pointer.y += (pointer.ty - pointer.y) * 0.055;

      context.clearRect(0, 0, width, height);

      const cx = width * (0.68 + pointer.x * 0.025);
      const cy = height * (0.48 + pointer.y * 0.035);
      const sphereRadius = Math.min(width, height) * (width < 700 ? 0.28 : 0.36);
      const rotateY = elapsed * 0.18 + pointer.x * 0.45;
      const rotateX = -0.28 + pointer.y * 0.28;

      const lightX = width * (0.32 + pointer.x * 0.12);
      const lightY = height * (0.2 + pointer.y * 0.1);
      const light = context.createRadialGradient(lightX, lightY, 0, lightX, lightY, height * 0.9);
      light.addColorStop(0, "rgba(255,255,255,0.34)");
      light.addColorStop(0.16, "rgba(255,199,92,0.18)");
      light.addColorStop(0.5, "rgba(79,172,255,0.08)");
      light.addColorStop(1, "rgba(2,6,18,0)");
      context.fillStyle = light;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(cx, cy);
      context.rotate(pointer.x * 0.05);

      for (let ring = 0; ring < RING_COUNT; ring += 1) {
        const t = ring / RING_COUNT;
        const radius = sphereRadius * (0.52 + t * 0.95);
        const wave = Math.sin(elapsed * 1.6 - ring * 0.34) * 7;
        context.beginPath();
        context.ellipse(0, 0, radius + wave, (radius + wave) * 0.34, rotateY * 0.45, 0, Math.PI * 2);
        context.strokeStyle = `rgba(88, 166, 255, ${0.018 + (1 - t) * 0.04})`;
        context.lineWidth = 1;
        context.stroke();
      }

      dots.forEach((dot) => {
        const theta = dot.theta + rotateY * dot.depth;
        const x0 = Math.cos(theta) * dot.radius;
        const z0 = Math.sin(theta) * dot.radius;
        const y0 = Math.sin(dot.phi);
        const y = y0 * Math.cos(rotateX) - z0 * Math.sin(rotateX);
        const z = y0 * Math.sin(rotateX) + z0 * Math.cos(rotateX);
        const perspective = 0.72 + z * 0.28;
        const x = x0 * sphereRadius * perspective;
        const py = y * sphereRadius * perspective;
        const distanceToPointer = Math.hypot(x / sphereRadius - pointer.x * 0.4, py / sphereRadius - pointer.y * 0.4);
        const repel = Math.max(0, 1 - distanceToPointer * 1.8);
        const size = (1.1 + perspective * 2.4 + repel * 2.2) * (z > -0.45 ? 1 : 0.55);
        const alpha = Math.max(0.04, 0.1 + z * 0.2 + repel * 0.34);

        context.beginPath();
        context.arc(x + pointer.x * repel * 14, py + pointer.y * repel * 14, size, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, ${Math.floor(198 + perspective * 36)}, ${Math.floor(110 + perspective * 90)}, ${alpha})`;
        context.fill();
      });

      context.restore();

      if (!reduceMotion) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    resize();
    start = performance.now();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden="true" className="hero-particle-stage">
      <canvas ref={canvasRef} className="hero-particle-canvas" />
      <div className="hero-light-cloud hero-light-cloud-a" />
      <div className="hero-light-cloud hero-light-cloud-b" />
      <div className="hero-scan-grid" />
    </div>
  );
};

export default HeroParticles;
