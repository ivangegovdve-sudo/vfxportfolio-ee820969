import {
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import defaultCvData, { CVData } from "@/data/cvData";
import { CVDataContext, CVDataContextValue, STORAGE_KEY } from "@/contexts/cvDataStore";


function loadFromStorage(): CVData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CVData;
      // Validate the new structure — if skills.sections doesn't exist, reset
      if (!parsed.skills?.sections) return defaultCvData;
      return parsed;
    }
  } catch {
    return defaultCvData;
  }
  return defaultCvData;
}

export function CVDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CVData>(loadFromStorage);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((updater: (prev: CVData) => CVData) => {
    setData((prev) => updater(prev));
  }, []);

  const resetData = useCallback(() => {
    setData(defaultCvData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const stableValue = useMemo(
    () => ({ data, updateData, resetData, editorOpen, setEditorOpen }),
    [data, updateData, resetData, editorOpen]
  );

  return <CVDataContext.Provider value={stableValue}>{children}</CVDataContext.Provider>;
}
