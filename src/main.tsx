import { CVDataProvider } from "@/contexts/CVDataContext";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <CVDataProvider>
    <App />
  </CVDataProvider>
);
