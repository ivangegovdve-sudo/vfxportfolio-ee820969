import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import defaultCvData, { CVData } from "@/data/cvData";

interface CVDataContextValue {
  data: CVData;
  updateData: (updater: (prev: CVData) => CVData) => void;
  resetData: () => void;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
}

const STORAGE_KEY = "cv-data-v2";

const defaultContextValue: CVDataContextValue = {
  data: defaultCvData,
  updateData: () => {},
  resetData: () => {},
  editorOpen: false,
  setEditorOpen: () => {},
};

const CVDataContext = createContext<CVDataContextValue>(defaultContextValue);


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

export function useCvData() {
  const contextValue = useContext(CVDataContext);
  if (contextValue === defaultContextValue) {
    throw new Error("useCvData must be used within CVDataProvider");
  }
  return contextValue;
}
