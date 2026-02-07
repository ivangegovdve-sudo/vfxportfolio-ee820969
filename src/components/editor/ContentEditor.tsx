import { useCvData } from "@/contexts/CVDataContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, X, RotateCcw, User, FileText, Briefcase, FolderOpen, Wrench, GraduationCap, Mail } from "lucide-react";
import { useState } from "react";
import HeroEditor from "./HeroEditor";
import AboutEditor from "./AboutEditor";
import ExperienceEditor from "./ExperienceEditor";
import PortfolioEditor from "./PortfolioEditor";
import SkillsEditor from "./SkillsEditor";
import EducationEditor from "./EducationEditor";
import ContactEditor from "./ContactEditor";

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

const ContentEditor = () => {
  const { editorOpen, setEditorOpen, resetData } = useCvData();
  const [activeTab, setActiveTab] = useState<TabId>("hero");

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
    <div className="fixed inset-y-0 left-0 z-50 w-80 bg-background border-r border-border shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display font-semibold text-sm text-foreground">Content Editor</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetData} title="Reset to defaults">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditorOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
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
    </div>
  );
};

export default ContentEditor;
