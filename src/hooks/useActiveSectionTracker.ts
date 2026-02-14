import { useEffect, useRef } from "react";
import { useActiveSection } from "@/context/useActiveSection";
import { ActiveSectionId, TRACKED_SECTION_IDS } from "@/context/activeSectionIds";

const OBSERVER_THRESHOLDS = [0, 0.3, 0.6, 0.9];
const PROGRAMMATIC_SCROLL_START_EVENT = "cv:programmatic-scroll-start";
const PROGRAMMATIC_SCROLL_SETTLE_MS = 300;
const ACTIVE_TOP_RATIO = 0.35;
const HERO_ACTIVE_SCROLL_MAX = 40;

const getScore = (entry: IntersectionObserverEntry, viewportHeight: number) => {
  const ratio = entry.intersectionRatio;
  const rect = entry.boundingClientRect;
  const viewportCenter = viewportHeight / 2;
  const sectionCenter = rect.top + rect.height / 2;
  const centerDistance = Math.abs(sectionCenter - viewportCenter);
  const centerScore = 1 - Math.min(centerDistance / viewportHeight, 1);
  return ratio * 0.8 + centerScore * 0.2;
};

export function useActiveSectionTracker(sectionIds: readonly ActiveSectionId[] = TRACKED_SECTION_IDS) {
  const { setActiveSection } = useActiveSection();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const entriesRef = useRef<Map<ActiveSectionId, IntersectionObserverEntry>>(new Map());
  const rafRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollUnlockTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const entriesMap = entriesRef.current;
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sectionElements.length === 0) {
      return;
    }

    const evaluateActiveSection = () => {
      rafRef.current = null;

      if (isProgrammaticScrollRef.current) {
        return;
      }

      const viewportHeight = Math.max(window.innerHeight || 0, 1);
      const activeTopBoundary = viewportHeight * ACTIVE_TOP_RATIO;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      let bestId: ActiveSectionId | null = null;
      let bestScore = -1;

      for (const id of sectionIds) {
        const entry = entriesMap.get(id);
        if (!entry || !entry.isIntersecting) {
          continue;
        }
        if (entry.boundingClientRect.top > activeTopBoundary) {
          continue;
        }
        if (id === "hero" && scrollY >= HERO_ACTIVE_SCROLL_MAX) {
          continue;
        }

        const score = getScore(entry, viewportHeight);
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      }

      if (!bestId) {
        let fallbackId: ActiveSectionId | null = null;
        let fallbackDistance = Number.POSITIVE_INFINITY;

        for (const id of sectionIds) {
          if (id === "hero" && scrollY >= HERO_ACTIVE_SCROLL_MAX) {
            continue;
          }
          const element = document.getElementById(id);
          if (!element) {
            continue;
          }

          const distance = Math.abs(element.getBoundingClientRect().top - activeTopBoundary);
          if (distance < fallbackDistance) {
            fallbackDistance = distance;
            fallbackId = id;
          }
        }

        if (!fallbackId) {
          return;
        }

        bestId = fallbackId;
      }

      setActiveSection((current) => (current === bestId ? current : bestId));
    };

    const queueEvaluation = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(evaluateActiveSection);
    };

    const scheduleProgrammaticUnlock = () => {
      if (scrollUnlockTimeoutRef.current != null) {
        window.clearTimeout(scrollUnlockTimeoutRef.current);
      }

      scrollUnlockTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        queueEvaluation();
      }, PROGRAMMATIC_SCROLL_SETTLE_MS);
    };

    const handleProgrammaticScrollStart = () => {
      isProgrammaticScrollRef.current = true;
      scheduleProgrammaticUnlock();
    };

    const handleScroll = () => {
      if (!isProgrammaticScrollRef.current) {
        return;
      }

      scheduleProgrammaticUnlock();
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as ActiveSectionId;
          entriesMap.set(id, entry);
        }
        queueEvaluation();
      },
      {
        threshold: OBSERVER_THRESHOLDS,
      }
    );

    for (const section of sectionElements) {
      observerRef.current.observe(section);
    }

    window.addEventListener(PROGRAMMATIC_SCROLL_START_EVENT, handleProgrammaticScrollStart);
    window.addEventListener("scroll", handleScroll, { passive: true });
    queueEvaluation();

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (scrollUnlockTimeoutRef.current != null) {
        window.clearTimeout(scrollUnlockTimeoutRef.current);
      }
      isProgrammaticScrollRef.current = false;
      window.removeEventListener(PROGRAMMATIC_SCROLL_START_EVENT, handleProgrammaticScrollStart);
      window.removeEventListener("scroll", handleScroll);
      observerRef.current?.disconnect();
      observerRef.current = null;
      entriesMap.clear();
    };
  }, [sectionIds, setActiveSection]);
}
