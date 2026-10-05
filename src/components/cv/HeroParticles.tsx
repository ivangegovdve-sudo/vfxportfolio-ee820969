import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Dot = {
  theta: number;
  phi: number;
  radius: number;
  depth: number;
};

const DOT_COUNT = 360;
const MOBILE_DOT_COUNT = 120;
const RING_COUNT = 22;

const buildSphereDots = (count: number) =>
  Array.from({ length: count }, (_, index): Dot => {
    const offset = 2 / count;
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

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const dots = buildSphereDots(isMobile ? MOBILE_DOT_COUNT : DOT_COUNT);
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;
    let start = performance.now();
    let isVisible = document.visibilityState !== "hidden";
    let isInViewport = true;
    let rect = { left: 0, top: 0, width: 0, height: 0 };

    const resize = () => {
      rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) {
        draw(performance.now());
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const txTarget = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      const tyTarget = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
      pointer.tx = Math.max(-1, Math.min(1, txTarget));
      pointer.ty = Math.max(-1, Math.min(1, tyTarget));
    };

    const draw = (now: number) => {
      if (!isVisible || !isInViewport) {
        return;
      }

      const elapsed = reduceMotion ? 0 : (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.055;
      pointer.y += (pointer.ty - pointer.y) * 0.055;

      context.clearRect(0, 0, width, height);

      const cx = width * (0.68 + pointer.x * 0.025);
      const cy = height * (0.48 + pointer.y * 0.035);
      const sphereRadius = Math.min(width, height) * (width < 700 ? 0.28 : 0.36);
      const rotateY = elapsed * 0.18 + pointer.x * 0.45;
      const rotateX = -0.28 + pointer.y * 0.28;
      const visibleDots = width < 640 ? dots.slice(0, 220) : dots;
      const visibleRingCount = width < 640 ? 12 : RING_COUNT;

      const lightX = width * (0.32 + pointer.x * 0.12);
      const lightY = height * (0.2 + pointer.y * 0.1);
      const light = context.createRadialGradient(lightX, lightY, 0, lightX, lightY, height * 0.9);
      light.addColorStop(0, "rgba(255,255,255,0.38)");
      light.addColorStop(0.14, "rgba(255,199,92,0.22)");
      light.addColorStop(0.42, "rgba(88,166,255,0.11)");
      light.addColorStop(1, "rgba(2,6,18,0)");
      context.fillStyle = light;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(cx, cy);
      context.rotate(pointer.x * 0.05);

      for (let ring = 0; ring < visibleRingCount; ring += 1) {
        const t = ring / visibleRingCount;
        const radius = sphereRadius * (0.52 + t * 0.95);
        const wave = Math.sin(elapsed * 1.6 - ring * 0.34) * 7;
        const rx = Math.max(0, radius + wave);
        context.beginPath();
        context.ellipse(0, 0, rx, rx * 0.34, rotateY * 0.45, 0, Math.PI * 2);
        context.strokeStyle = `rgba(88, 166, 255, ${0.018 + (1 - t) * 0.04})`;
        context.lineWidth = 1;
        context.stroke();
      }

      visibleDots.forEach((dot) => {
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

    const onVisibilityChange = () => {
      isVisible = document.visibilityState !== "hidden";
      if (!isVisible) {
        window.cancelAnimationFrame(frameId);
        return;
      }

      if (!reduceMotion) {
        start = performance.now();
        frameId = window.requestAnimationFrame(draw);
      } else {
        draw(performance.now());
      }
    };

    const scheduleFrame = () => {
      if (!isVisible || !isInViewport) {
        return;
      }

      if (!reduceMotion) {
        start = performance.now();
        frameId = window.requestAnimationFrame(draw);
      } else {
        draw(performance.now());
      }
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          isInViewport = entries.some((entry) => entry.isIntersecting);
          if (!isInViewport) {
            window.cancelAnimationFrame(frameId);
          } else {
            scheduleFrame();
          }
        },
        { threshold: 0 }
      );
      observer.observe(canvas);
    }

    const hero = canvas.closest("#hero");
    const pointerTarget = hero ?? window;

    resize();
    start = performance.now();
    window.addEventListener("resize", resize);
    pointerTarget.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      pointerTarget.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
