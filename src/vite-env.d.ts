/// <reference types="vite/client" />

interface RenderProbeStore {
  HeroSection?: number;
  Navigation?: number;
}

interface Window {
  __renderProbes?: RenderProbeStore;
}
