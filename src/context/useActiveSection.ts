import { useContext } from "react";
import { ActiveSectionContext } from "@/context/activeSectionStore";

export function useActiveSection() {
  const context = useContext(ActiveSectionContext);
  if (!context) {
    throw new Error("useActiveSection must be used within ActiveSectionProvider");
  }
  return context;
}
