import { createContext } from "react";
import defaultCvData, { CVData } from "@/data/cvData";

export interface CVDataContextValue {
  data: CVData;
  updateData: (updater: (prev: CVData) => CVData) => void;
  replaceData: (next: CVData, options?: { persist?: boolean }) => void;
  resetData: () => void;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
}

export const STORAGE_KEY = "cv-data-v2";

export const defaultContextValue: CVDataContextValue = {
  data: defaultCvData,
  updateData: () => {},
  replaceData: () => {},
  resetData: () => {},
  editorOpen: false,
  setEditorOpen: () => {},
};

export const CVDataContext = createContext<CVDataContextValue>(defaultContextValue);
