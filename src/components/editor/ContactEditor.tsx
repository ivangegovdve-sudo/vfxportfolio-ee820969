import { useCvData } from "@/contexts/CVDataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const ContactEditor = () => {
  const { data, updateData } = useCvData();
  const contact = data.contact;

  const updateField = (field: "email" | "location" | "phone" | "website", value: string) => {
    updateData((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    updateData((prev) => {
      const links = [...prev.contact.links];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, contact: { ...prev.contact, links } };
    });
  };

  const addLink = () => {
    updateData((prev) => ({
      ...prev,
      contact: { ...prev.contact, links: [...prev.contact.links, { label: "New Link", url: "https://" }] },
    }));
  };

  const removeLink = (index: number) => {
    updateData((prev) => ({
      ...prev,
      contact: { ...prev.contact, links: prev.contact.links.filter((_, i) => i !== index) },
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input value={contact.email} onChange={(e) => updateField("email", e.target.value)} />
      </div>
      <div>
        <Label>Location</Label>
        <Input value={contact.location} onChange={(e) => updateField("location", e.target.value)} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={contact.phone || ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="Optional" />
      </div>
      <div>
        <Label>Website</Label>
        <Input value={contact.website || ""} onChange={(e) => updateField("website", e.target.value)} placeholder="Optional" />
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-semibold text-foreground mb-3">Links</h4>
        <div className="space-y-3">
          {contact.links.map((link, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Label</Label>
                <Input value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="flex-[2] space-y-1">
                <Label className="text-xs">URL</Label>
                <Input value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} className="h-8 text-sm" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeLink(i)}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLink} className="w-full">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactEditor;
