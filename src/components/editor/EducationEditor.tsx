import { useCvData } from "@/contexts/CVDataContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { EducationItem } from "@/data/cvData";

const EducationEditor = () => {
  const { data, updateData } = useCvData();
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateEdu = (id: string, field: keyof EducationItem, value: string) => {
    updateData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const addItem = () => {
    const newId = `edu-${Date.now()}`;
    const newItem: EducationItem = { id: newId, degree: "New Degree", institution: "Institution", startDate: "2024", endDate: "2025" };
    updateData((prev) => ({ ...prev, education: [...prev.education, newItem] }));
    setExpanded(newId);
  };

  const removeItem = (id: string) => {
    updateData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="space-y-2">
      {data.education.map((edu) => (
        <div key={edu.id} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === edu.id ? null : edu.id)}
            className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${expanded === edu.id ? "rotate-90" : ""}`} />
            <span className="text-sm font-medium truncate flex-1">{edu.degree}</span>
          </button>

          {expanded === edu.id && (
            <div className="p-3 pt-0 space-y-3 border-t border-border">
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(edu.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div>
                <Label>Degree / Course</Label>
                <Input value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} />
              </div>
              <div>
                <Label>Institution</Label>
                <Input value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={edu.location || ""} onChange={(e) => updateEdu(edu.id, "location", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Start</Label>
                  <Input value={edu.startDate} onChange={(e) => updateEdu(edu.id, "startDate", e.target.value)} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input value={edu.endDate} onChange={(e) => updateEdu(edu.id, "endDate", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={edu.description || ""} onChange={(e) => updateEdu(edu.id, "description", e.target.value)} rows={2} />
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="w-full">
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
      </Button>
    </div>
  );
};

export default EducationEditor;
