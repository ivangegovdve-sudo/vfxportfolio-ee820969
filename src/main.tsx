import { CVDataProvider } from "@/contexts/CVDataContext";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("React root element '#root' not found");
}

createRoot(rootElement).render(
  <CVDataProvider>
    <App />
  </CVDataProvider>
);
