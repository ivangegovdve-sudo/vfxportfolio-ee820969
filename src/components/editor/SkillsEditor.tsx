import { useCvData } from "@/contexts/CVDataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const SkillsEditor = () => {
  const { data, updateData } = useCvData();

  const updateCategory = (index: number, field: "category" | "skills", value: string) => {
    updateData((prev) => {
      const technical = [...prev.skills.technical];
      if (field === "category") {
        technical[index] = { ...technical[index], category: value };
      } else {
        technical[index] = { ...technical[index], skills: value.split(",").map((s) => s.trim()).filter(Boolean) };
      }
      return { ...prev, skills: { ...prev.skills, technical } };
    });
  };

  const addCategory = () => {
    updateData((prev) => ({
      ...prev,
      skills: { ...prev.skills, technical: [...prev.skills.technical, { category: "New Category", skills: [] }] },
    }));
  };

  const removeCategory = (index: number) => {
    updateData((prev) => ({
      ...prev,
      skills: { ...prev.skills, technical: prev.skills.technical.filter((_, i) => i !== index) },
    }));
  };

  const updatePersonal = (value: string) => {
    updateData((prev) => ({
      ...prev,
      skills: { ...prev.skills, personal: value.split(",").map((s) => s.trim()).filter(Boolean) },
    }));
  };

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
      {/* Technical Skills */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Technical Skills</h4>
        <div className="space-y-4">
          {data.skills.technical.map((cat, i) => (
            <div key={i} className="space-y-2 p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCategory(i)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
              <Input value={cat.category} onChange={(e) => updateCategory(i, "category", e.target.value)} />
              <Label>Skills (comma-separated)</Label>
              <Input value={cat.skills.join(", ")} onChange={(e) => updateCategory(i, "skills", e.target.value)} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addCategory} className="w-full">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
          </Button>
        </div>
      </div>

      {/* Personal Skills */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Personal Skills</h4>
        <Label>Skills (comma-separated)</Label>
        <Input value={data.skills.personal.join(", ")} onChange={(e) => updatePersonal(e.target.value)} />
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
