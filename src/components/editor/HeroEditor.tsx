import { useCvData } from "@/contexts/CVDataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HeroEditor = () => {
  const { data, updateData } = useCvData();
  const hero = data.hero;

  const update = (field: keyof typeof hero, value: string) => {
    updateData((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="hero-name">Name</Label>
        <Input id="hero-name" value={hero.name} onChange={(e) => update("name", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="hero-title">Title</Label>
        <Input id="hero-title" value={hero.title} onChange={(e) => update("title", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="hero-subtitle">Subtitle</Label>
        <Input id="hero-subtitle" value={hero.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="hero-photo">Photo URL</Label>
        <Input id="hero-photo" value={hero.photoUrl || ""} onChange={(e) => update("photoUrl", e.target.value)} placeholder="https://..." />
      </div>
    </div>
  );
};

export default HeroEditor;
