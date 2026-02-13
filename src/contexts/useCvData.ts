import { useContext } from "react";
import { CVDataContext, defaultContextValue } from "@/contexts/cvDataStore";

export function useCvData() {
  const contextValue = useContext(CVDataContext);
  if (contextValue === defaultContextValue) {
    throw new Error("useCvData must be used within CVDataProvider");
  }
  return contextValue;
}
