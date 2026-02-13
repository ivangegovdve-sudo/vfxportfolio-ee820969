import {
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import defaultCvData, { CVData } from "@/data/cvData";
import { CVDataContext, CVDataContextValue, STORAGE_KEY } from "@/contexts/cvDataStore";


// Bump this version whenever cvData.ts defaults change to invalidate stale localStorage
const DATA_VERSION = 2;
const VERSION_KEY = "cv-data-version";

function loadFromStorage(): CVData {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== String(DATA_VERSION)) {
      // Schema or default data changed — clear stale cache
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
      return defaultCvData;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CVData;
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
