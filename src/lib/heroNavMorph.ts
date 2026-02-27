export const HERO_NAV_MORPH_ANCHOR_ID = "cv-hero-nav-morph-anchor";
export const HERO_NAV_MORPH_STATE_EVENT = "cv:hero-nav-morph-state";
export const HERO_NAV_MORPH_LAYOUT_EVENT = "cv:hero-nav-morph-layout";

export type HeroNavMorphStateDetail = {
  active: boolean;
  rawProgress: number;
  visualProgress: number;
};
