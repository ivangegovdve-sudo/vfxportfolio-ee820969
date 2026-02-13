import { useCvData } from "@/contexts/useCvData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

const SkillsEditor = () => {
  const { data, updateData } = useCvData();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  // --- Section-level operations ---
  const addSection = () => {
    updateData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        sections: [...prev.skills.sections, { title: "New Section", groups: [] }],
      },
    }));
  };

  const removeSection = (si: number) => {
    updateData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        sections: prev.skills.sections.filter((_, i) => i !== si),
      },
    }));
    if (expandedSection === si) setExpandedSection(null);
  };

  const updateSectionTitle = (si: number, title: string) => {
    updateData((prev) => {
      const sections = [...prev.skills.sections];
      sections[si] = { ...sections[si], title };
      return { ...prev, skills: { ...prev.skills, sections } };
    });
  };

  // --- Group-level operations ---
  const addGroup = (si: number) => {
    updateData((prev) => {
      const sections = [...prev.skills.sections];
      sections[si] = {
        ...sections[si],
        groups: [...sections[si].groups, { category: "New Category", skills: [] }],
      };
      return { ...prev, skills: { ...prev.skills, sections } };
    });
  };

  const removeGroup = (si: number, gi: number) => {
    updateData((prev) => {
      const sections = [...prev.skills.sections];
      sections[si] = {
        ...sections[si],
        groups: sections[si].groups.filter((_, i) => i !== gi),
      };
      return { ...prev, skills: { ...prev.skills, sections } };
    });
  };

  const updateGroup = (si: number, gi: number, field: "category" | "skills" | "note", value: string) => {
    updateData((prev) => {
      const sections = [...prev.skills.sections];
      const groups = [...sections[si].groups];
      if (field === "skills") {
        groups[gi] = { ...groups[gi], skills: value.split("\n").filter(Boolean) };
      } else {
        groups[gi] = { ...groups[gi], [field]: value };
      }
      sections[si] = { ...sections[si], groups };
      return { ...prev, skills: { ...prev.skills, sections } };
    });
  };

  // --- Personal skills ---
  const updatePersonal = (value: string) => {
    updateData((prev) => ({
      ...prev,
      skills: { ...prev.skills, personal: value.split("\n").filter(Boolean) },
    }));
  };

  // --- Languages ---
  const updateLanguage = (index: number, field: string, value: string | number) => {
    updateData((prev) => {
      const languages = [...prev.languages];
      languages[index] = { ...languages[index], [field]: value };
      return { ...prev, languages };
    });
  };

  const addLanguage = () => {
    updateData((prev) => ({
      ...prev,
      languages: [...prev.languages, { language: "New Language", proficiency: "A1 — Beginner", level: 1 }],
    }));
  };

  const removeLanguage = (index: number) => {
    updateData((prev) => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-6">
      {/* Skill Sections */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Skill Sections</h4>
        <div className="space-y-2">
          {data.skills.sections.map((section, si) => (
            <div key={si} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === si ? null : si)}
                className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${expandedSection === si ? "rotate-90" : ""}`} />
                <span className="text-sm font-medium truncate flex-1">{section.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => { e.stopPropagation(); removeSection(si); }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </button>

              {expandedSection === si && (
                <div className="p-3 pt-0 space-y-3 border-t border-border">
                  <div>
                    <Label>Section Title</Label>
                    <Input value={section.title} onChange={(e) => updateSectionTitle(si, e.target.value)} />
                  </div>

                  {section.groups.map((group, gi) => (
                    <div key={gi} className="p-2 border border-border rounded space-y-2 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Group {gi + 1}</Label>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeGroup(si, gi)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        value={group.category}
                        onChange={(e) => updateGroup(si, gi, "category", e.target.value)}
                        placeholder="Category name"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={group.note || ""}
                        onChange={(e) => updateGroup(si, gi, "note", e.target.value)}
                        placeholder="Note (optional)"
                        className="h-8 text-xs"
                      />
                      <Label className="text-xs">Skills (one per line)</Label>
                      <textarea
                        value={group.skills.join("\n")}
                        onChange={(e) => updateGroup(si, gi, "skills", e.target.value)}
                        rows={Math.max(2, group.skills.length)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs resize-y"
                      />
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={() => addGroup(si)} className="w-full text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Group
                  </Button>
                </div>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSection} className="w-full">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Section
          </Button>
        </div>
      </div>

      {/* Personal Skills */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Personal Skills</h4>
        <Label className="text-xs">One per line</Label>
        <textarea
          value={data.skills.personal.join("\n")}
          onChange={(e) => updatePersonal(e.target.value)}
          rows={Math.max(3, data.skills.personal.length)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs resize-y"
        />
      </div>

      {/* Languages */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Languages</h4>
        <div className="space-y-3">
          {data.languages.map((lang, i) => (
            <div key={i} className="p-3 border border-border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <Label>Language</Label>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLanguage(i)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
              <Input value={lang.language} onChange={(e) => updateLanguage(i, "language", e.target.value)} />
              <Label>Proficiency</Label>
              <Input value={lang.proficiency} onChange={(e) => updateLanguage(i, "proficiency", e.target.value)} />
              <Label>Level (1-5)</Label>
              <Input type="number" min={1} max={5} value={lang.level} onChange={(e) => updateLanguage(i, "level", parseInt(e.target.value) || 1)} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLanguage} className="w-full">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Language
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SkillsEditor;

