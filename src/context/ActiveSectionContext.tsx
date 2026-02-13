import { ReactNode, useMemo, useState } from "react";
import { ActiveSectionId } from "@/context/activeSectionIds";
import { ActiveSectionContext } from "@/context/activeSectionStore";

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<ActiveSectionId>("hero");
  const value = useMemo(
    () => ({ activeSection, setActiveSection }),
    [activeSection]
  );

  return (
    <ActiveSectionContext.Provider value={value}>
      {children}
    </ActiveSectionContext.Provider>
  );
}
