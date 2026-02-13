import { createContext } from "react";
import { ActiveSectionId } from "@/context/activeSectionIds";

export type ActiveSectionContextValue = {
  activeSection: ActiveSectionId;
  setActiveSection: React.Dispatch<React.SetStateAction<ActiveSectionId>>;
};

export const ActiveSectionContext = createContext<ActiveSectionContextValue | undefined>(undefined);
