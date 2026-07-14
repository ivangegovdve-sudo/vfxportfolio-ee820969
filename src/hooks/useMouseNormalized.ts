import { useEffect, useRef } from "react";

/**
 * Tracks pointer position normalized to [-1, 1] on both axes,
 * relative to a target element (defaults to window).
 * rAF-throttled to avoid excessive updates. Ref-based so consumers
 * can read the latest value without triggering re-renders.
 */
export function useMouseNormalized(targetRef?: React.RefObject<HTMLElement | null>) {
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;
    let pending = false;

    const flush = () => {
      raf = 0;
      pending = false;
      mouseRef.current.x = pendingX;
      mouseRef.current.y = pendingY;
    };

    const onMove = (event: PointerEvent) => {
      const target = targetRef?.current;
      const rect = target
        ? target.getBoundingClientRect()
        : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      pendingX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pendingY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.active = true;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(flush);
      }
    };

    const onLeave = () => {
      mouseRef.current.active = false;
    };

    const el: EventTarget = targetRef?.current ?? window;
    el.addEventListener("pointermove", onMove as EventListener, { passive: true });
    el.addEventListener("pointerleave", onLeave as EventListener);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove as EventListener);
      el.removeEventListener("pointerleave", onLeave as EventListener);
    };
  }, [targetRef]);

  return mouseRef;
}
