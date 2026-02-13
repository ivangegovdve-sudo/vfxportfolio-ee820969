import { CVDataProvider } from "@/contexts/CVDataContext";
import { ActiveSectionProvider } from "@/context/ActiveSectionContext";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <CVDataProvider>
    <ActiveSectionProvider>
      <App />
    </ActiveSectionProvider>
  </CVDataProvider>
);
