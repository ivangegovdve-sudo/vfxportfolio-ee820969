import { createContext, useContext } from "react";
import type { CvPersona } from "@/data/cvPersonas";

export const CvPersonaContext = createContext<{
  persona: CvPersona;
  selectPersona: (persona: CvPersona) => void;
}>({ persona: "animation", selectPersona: () => {} });

export const useCvPersona = () => useContext(CvPersonaContext);