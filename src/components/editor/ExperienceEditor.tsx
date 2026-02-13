import { useCvData } from "@/contexts/useCvData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ExperienceItem } from "@/data/cvData";

const ExperienceEditor = () => {
  const { data, updateData } = useCvData();
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateExp = (id: string, field: keyof ExperienceItem, value: string) => {
    updateData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const updateHighlights = (id: string, value: string) => {
    updateData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === id ? { ...e, highlights: value.split("\n").filter((h) => h.trim()) } : e
      ),
    }));
  };

  const updateTags = (id: string, value: string) => {
    updateData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === id ? { ...e, tags: value.split(",").map((t) => t.trim()).filter(Boolean) } : e
      ),
    }));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    updateData((prev) => {
      const items = [...prev.experience];
      const target = index + direction;
      if (target < 0 || target >= items.length) return prev;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, experience: items };
    });
  };

  const addItem = () => {
    const newId = `exp-${Date.now()}`;
    const newItem: ExperienceItem = {
      id: newId,
      role: "New Role",
      company: "Company",
      startDate: "Jan 2024",
      endDate: "Present",
      description: "",
    };
    updateData((prev) => ({ ...prev, experience: [...prev.experience, newItem] }));
    setExpanded(newId);
  };

  const removeItem = (id: string) => {
    updateData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="space-y-2">
      {data.experience.map((exp, i) => (
        <div key={exp.id} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
            className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${expanded === exp.id ? "rotate-90" : ""}`} />
            <span className="text-sm font-medium truncate flex-1">{exp.role}</span>
            <span className="text-xs text-muted-foreground shrink-0">{exp.company}</span>
          </button>

          {expanded === exp.id && (
            <div className="p-3 pt-0 space-y-3 border-t border-border">
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(i, -1)} disabled={i === 0}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(i, 1)} disabled={i === data.experience.length - 1}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(exp.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div>
                <Label>Role</Label>
                <Input value={exp.role} onChange={(e) => updateExp(exp.id, "role", e.target.value)} />
              </div>
              <div>
                <Label>Company</Label>
                <Input value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Start</Label>
                  <Input value={exp.startDate} onChange={(e) => updateExp(exp.id, "startDate", e.target.value)} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input value={exp.endDate} onChange={(e) => updateExp(exp.id, "endDate", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input value={exp.location || ""} onChange={(e) => updateExp(exp.id, "location", e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={exp.description} onChange={(e) => updateExp(exp.id, "description", e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Highlights (one per line)</Label>
                <Textarea
                  value={(exp.highlights || []).join("\n")}
                  onChange={(e) => updateHighlights(exp.id, e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={(exp.tags || []).join(", ")} onChange={(e) => updateTags(exp.id, e.target.value)} />
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="w-full">
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Experience
      </Button>
    </div>
  );
};

export default ExperienceEditor;

