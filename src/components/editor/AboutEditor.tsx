import { useCvData } from "@/contexts/CVDataContext";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const AboutEditor = () => {
  const { data, updateData } = useCvData();

  const updateParagraph = (index: number, value: string) => {
    updateData((prev) => {
      const paragraphs = [...prev.about.paragraphs];
      paragraphs[index] = value;
      return { ...prev, about: { ...prev.about, paragraphs } };
    });
  };

  const addParagraph = () => {
    updateData((prev) => ({
      ...prev,
      about: { ...prev.about, paragraphs: [...prev.about.paragraphs, ""] },
    }));
  };

  const removeParagraph = (index: number) => {
    updateData((prev) => ({
      ...prev,
      about: { ...prev.about, paragraphs: prev.about.paragraphs.filter((_, i) => i !== index) },
    }));
  };

  return (
    <div className="space-y-4">
      {data.about.paragraphs.map((p, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>Paragraph {i + 1}</Label>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeParagraph(i)}>
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
          <Textarea value={p} onChange={(e) => updateParagraph(i, e.target.value)} rows={3} />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addParagraph} className="w-full">
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Paragraph
      </Button>
    </div>
  );
};

export default AboutEditor;
