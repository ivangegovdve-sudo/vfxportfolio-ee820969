import { CVDataProvider } from "@/contexts/CVDataContext";
import { ActiveSectionProvider } from "@/context/ActiveSectionContext";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const BUILD_SHA = import.meta.env.VITE_BUILD_SHA ?? "cycle1-about-down-20260214a";
console.info("BUILD_SHA", BUILD_SHA);

createRoot(document.getElementById("root")!).render(
  <CVDataProvider>
    <ActiveSectionProvider>
      <App />
    </ActiveSectionProvider>
  </CVDataProvider>
);
