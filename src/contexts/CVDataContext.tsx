import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import defaultCvData, { CVData } from "@/data/cvData";

interface CVDataContextValue {
  data: CVData;
  updateData: (updater: (prev: CVData) => CVData) => void;
  resetData: () => void;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
}

const STORAGE_KEY = "cv-data-v2";

const CVDataContext = createContext<CVDataContextValue | null>(null);

function withPortfolioThumbnails(data: CVData): CVData {
  const defaultThumbById = new Map(defaultCvData.portfolio.map((item) => [item.id, item.thumbnail]));

  return {
    ...data,
    portfolio: data.portfolio.map((item) => ({
      ...item,
      thumbnail: item.thumbnail || defaultThumbById.get(item.id) || "",
    })),
  };
}

function loadFromStorage(): CVData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CVData;
      // Validate the new structure — if skills.sections doesn't exist, reset
      if (!parsed.skills?.sections) return defaultCvData;
      return withPortfolioThumbnails(parsed);
    }
  } catch {}
  return withPortfolioThumbnails(defaultCvData);
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

  return (
    <CVDataContext.Provider value={{ data, updateData, resetData, editorOpen, setEditorOpen }}>
      {children}
    </CVDataContext.Provider>
  );
}

export function useCvData() {
  const ctx = useContext(CVDataContext);
  if (!ctx) throw new Error("useCvData must be used within CVDataProvider");
  return ctx;
}
