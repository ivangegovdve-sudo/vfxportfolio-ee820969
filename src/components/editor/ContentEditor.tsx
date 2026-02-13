import { useCvData } from "@/contexts/useCvData";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pencil,
  X,
  RotateCcw,
  User,
  FileText,
  Briefcase,
  FolderOpen,
  Wrench,
  GraduationCap,
  Mail,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import HeroEditor from "./HeroEditor";
import AboutEditor from "./AboutEditor";
import ExperienceEditor from "./ExperienceEditor";
import PortfolioEditor from "./PortfolioEditor";
import SkillsEditor from "./SkillsEditor";
import EducationEditor from "./EducationEditor";
import ContactEditor from "./ContactEditor";
import cvDataTemplate from "@/data/cvData.ts?raw";

const tabs = [
  { id: "hero", label: "Hero", icon: User },
  { id: "about", label: "About", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "contact", label: "Contact", icon: Mail },
] as const;

type TabId = (typeof tabs)[number]["id"];

const MIN_WIDTH = 280;
const MAX_WIDTH = 560;
const DEFAULT_WIDTH = 320;
const COLLAPSED_WIDTH = 56;

const ContentEditor = () => {
  const { data, editorOpen, setEditorOpen, resetData } = useCvData();
  const [activeTab, setActiveTab] = useState<TabId>("hero");
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [searchParams] = useSearchParams();

  const isEditMode =
    searchParams.get("edit") === "true" || import.meta.env.VITE_ENABLE_EDITOR === "true";

  const exportCvData = useCallback(() => {
    const replacement = `const cvData: CVData = ${JSON.stringify(data, null, 2)};`;
    const fileContents = cvDataTemplate.replace(
      /const cvData: CVData = [\s\S]*?;\n\nexport default cvData;/,
      `${replacement}\n\nexport default cvData;`
    );

    const blob = new Blob([fileContents], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cvData.ts";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  if (!isEditMode) return null;

  if (!editorOpen) {
    return (
      <Button
        onClick={() => setEditorOpen(true)}
        className="fixed bottom-6 left-6 z-50 rounded-full w-12 h-12 shadow-lg"
        size="icon"
      >
        <Pencil className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <EditorPanel
      panelWidth={panelWidth}
      setPanelWidth={setPanelWidth}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      setEditorOpen={setEditorOpen}
      resetData={resetData}
      exportCvData={exportCvData}
    />
  );
};

interface EditorPanelProps {
  panelWidth: number;
  setPanelWidth: (w: number) => void;
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
  setEditorOpen: (o: boolean) => void;
  resetData: () => void;
  exportCvData: () => void;
}

function EditorPanel({
  panelWidth,
  setPanelWidth,
  activeTab,
  setActiveTab,
  setEditorOpen,
  resetData,
  exportCvData,
}: EditorPanelProps) {
  const isDragging = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const startX = e.clientX;
      const startWidth = panelWidth;

      const onMouseMove = (ev: MouseEvent) => {
        const newWidth = Math.min(Math.max(startWidth + (ev.clientX - startX), MIN_WIDTH), MAX_WIDTH);
        setPanelWidth(newWidth);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [panelWidth, setPanelWidth]
  );

  return (
    <div
      className="fixed inset-y-0 left-0 z-50 bg-background border-r border-border shadow-xl flex"
      style={{ width: isCollapsed ? COLLAPSED_WIDTH : panelWidth }}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          {!isCollapsed && <h2 className="font-display font-semibold text-sm text-foreground">Content Editor</h2>}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsCollapsed((prev) => !prev)}
              title={isCollapsed ? "Expand editor" : "Collapse editor"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </Button>
            {!isCollapsed && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportCvData} title="Export CV Data">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetData} title="Reset to defaults">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditorOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <ScrollArea className="flex-1 p-4">
              {activeTab === "hero" && <HeroEditor />}
              {activeTab === "about" && <AboutEditor />}
              {activeTab === "experience" && <ExperienceEditor />}
              {activeTab === "portfolio" && <PortfolioEditor />}
              {activeTab === "skills" && <SkillsEditor />}
              {activeTab === "education" && <EducationEditor />}
              {activeTab === "contact" && <ContactEditor />}
            </ScrollArea>

            <div className="px-4 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground text-center">
                Changes are saved to your browser automatically
              </p>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <div
          onMouseDown={startResize}
          className="w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors shrink-0"
          title="Drag to resize"
        />
      )}
    </div>
  );
}

export default ContentEditor;

