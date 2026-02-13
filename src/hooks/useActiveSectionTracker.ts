import { useEffect, useRef } from "react";
import { useActiveSection } from "@/context/useActiveSection";
import { ActiveSectionId, TRACKED_SECTION_IDS } from "@/context/activeSectionIds";

const OBSERVER_THRESHOLDS = [0, 0.3, 0.6, 0.9];

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

      const viewportHeight = Math.max(window.innerHeight || 0, 1);
      let bestId: ActiveSectionId | null = null;
      let bestScore = -1;

      for (const id of sectionIds) {
        const entry = entriesMap.get(id);
        if (!entry || !entry.isIntersecting) {
          continue;
        }

        const score = getScore(entry, viewportHeight);
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      }

      if (!bestId) {
        let fallbackId = sectionIds[0];
        let fallbackDistance = Number.POSITIVE_INFINITY;

        for (const id of sectionIds) {
          const element = document.getElementById(id);
          if (!element) {
            continue;
          }

          const distance = Math.abs(element.getBoundingClientRect().top);
          if (distance < fallbackDistance) {
            fallbackDistance = distance;
            fallbackId = id;
          }
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

    queueEvaluation();

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      observerRef.current?.disconnect();
      observerRef.current = null;
      entriesMap.clear();
    };
  }, [sectionIds, setActiveSection]);
}
