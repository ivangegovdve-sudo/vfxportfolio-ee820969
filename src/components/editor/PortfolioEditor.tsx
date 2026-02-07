import { useCvData } from "@/contexts/CVDataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { PortfolioItem } from "@/data/cvData";

const PortfolioEditor = () => {
  const { data, updateData } = useCvData();
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateItem = (id: string, field: keyof PortfolioItem, value: string) => {
    updateData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    updateData((prev) => {
      const items = [...prev.portfolio];
      const target = index + direction;
      if (target < 0 || target >= items.length) return prev;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, portfolio: items };
    });
  };

  const addItem = () => {
    const newId = `pf-${Date.now()}`;
    const newItem: PortfolioItem = { id: newId, title: "New Project", descriptor: "Description", url: "https://", ctaLabel: "View" };
    updateData((prev) => ({ ...prev, portfolio: [...prev.portfolio, newItem] }));
    setExpanded(newId);
  };

  const removeItem = (id: string) => {
    updateData((prev) => ({ ...prev, portfolio: prev.portfolio.filter((p) => p.id !== id) }));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="space-y-2">
      {data.portfolio.map((item, i) => (
        <div key={item.id} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${expanded === item.id ? "rotate-90" : ""}`} />
            <span className="text-sm font-medium truncate flex-1">{item.title}</span>
          </button>

          {expanded === item.id && (
            <div className="p-3 pt-0 space-y-3 border-t border-border">
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(i, -1)} disabled={i === 0}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(i, 1)} disabled={i === data.portfolio.length - 1}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={item.title} onChange={(e) => updateItem(item.id, "title", e.target.value)} />
              </div>
              <div>
                <Label>Descriptor</Label>
                <Input value={item.descriptor} onChange={(e) => updateItem(item.id, "descriptor", e.target.value)} />
              </div>
              <div>
                <Label>URL</Label>
                <Input value={item.url} onChange={(e) => updateItem(item.id, "url", e.target.value)} />
              </div>
              <div>
                <Label>CTA Label</Label>
                <Input value={item.ctaLabel || ""} onChange={(e) => updateItem(item.id, "ctaLabel", e.target.value)} />
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="w-full">
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Portfolio Item
      </Button>
    </div>
  );
};

export default PortfolioEditor;
