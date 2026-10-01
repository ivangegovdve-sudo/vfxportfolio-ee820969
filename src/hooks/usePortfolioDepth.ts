import { useEffect } from "react";

/**
 * Scrollcraft's parallax vocabulary, authored for a React lifecycle.
 * The supplied standalone engine has no unmount API, so this small page adapter
 * uses the same data attributes without leaving animation loops on admin routes.
 */
export function usePortfolioDepth() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hero = document.querySelector<HTMLElement>(".portfolio-hero");
    if (!hero) return;
    const planes = [...hero.querySelectorAll<HTMLElement>("[data-sc-parallax]")];
    const animations: Animation[] = [];
    const entrances = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entrances.unobserve(entry.target);
        if (mediaQuery.matches || typeof entry.target.animate !== "function") continue;
        const reveal = entry.target.hasAttribute("data-sc-reveal");
        animations.push(entry.target.animate(
          reveal
            ? [{ clipPath: "inset(0 0 8% 0)", opacity: 0.88 }, { clipPath: "inset(0)", opacity: 1 }]
            : [{ opacity: 0.75, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: reveal ? 480 : 360, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
        ));
      }
    }, { threshold: 0.08 });
    document.querySelectorAll(".biography-copy, [data-sc-reveal]").forEach((element) => entrances.observe(element));
    let frame = 0;

    const read = () => {
      frame = 0;
      const heroHeight = hero.offsetHeight;
      const progress = Math.max(0, Math.min(1, window.scrollY / Math.max(heroHeight, 1)));
      hero.style.setProperty("--sc-p", String(progress));
      for (const plane of planes) {
        const rate = Number(plane.dataset.scParallax ?? 0);
        plane.style.transform = mediaQuery.matches
          ? ""
          : `translate3d(0, ${(progress * window.innerHeight * rate).toFixed(2)}px, 0)`;
      }
    };
    const schedule = () => {
      if (mediaQuery.matches) animations.forEach((animation) => animation.cancel());
      if (!frame) frame = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    mediaQuery.addEventListener("change", schedule);
    read();
    document.documentElement.classList.add("sc-ready");
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mediaQuery.removeEventListener("change", schedule);
      entrances.disconnect();
      animations.forEach((animation) => animation.cancel());
      if (frame) cancelAnimationFrame(frame);
      for (const plane of planes) plane.style.transform = "";
      document.documentElement.classList.remove("sc-ready");
    };
  }, []);
}
