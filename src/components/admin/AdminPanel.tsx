import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Check,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  GraduationCap,
  Globe,
  LogOut,
  Mail,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCvData } from "@/contexts/useCvData";
import defaultCvData, { CVData } from "@/data/cvData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import HeroEditor from "@/components/editor/HeroEditor";
import AboutEditor from "@/components/editor/AboutEditor";
import ExperienceEditor from "@/components/editor/ExperienceEditor";
import PortfolioEditor from "@/components/editor/PortfolioEditor";
import SkillsEditor from "@/components/editor/SkillsEditor";
import EducationEditor from "@/components/editor/EducationEditor";
import ContactEditor from "@/components/editor/ContactEditor";

const tabs = [
  { id: "hero", label: "Hero", icon: User },
  { id: "about", label: "About", icon: FileText },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "access", label: "Access", icon: Users },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface VersionRow {
  id: string;
  name: string;
  slug: string;
  purpose: string | null;
  is_live: boolean;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function AdminPanel({ userEmail }: { userEmail: string | null }) {
  const { data, replaceData } = useCvData();
  const { toast } = useToast();
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("hero");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());

  const selected = useMemo(
    () => versions.find((v) => v.id === selectedId) ?? null,
    [versions, selectedId]
  );

  const loadVersions = useCallback(async () => {
    const [{ data: rows }, { data: pub }] = await Promise.all([
      supabase
        .from("cv_versions")
        .select("id,name,slug,purpose,is_live,updated_at")
        .order("created_at", { ascending: true }),
      supabase.from("cv_published").select("version_id"),
    ]);
    setVersions(rows ?? []);
    setPublishedIds(new Set((pub ?? []).map((p) => p.version_id)));
    return rows ?? [];
  }, []);

  const loadAccess = useCallback(async () => {
    const [{ data: profileRows }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name").order("created_at"),
      supabase.from("user_roles").select("user_id").eq("role", "admin"),
    ]);
    setProfiles(profileRows ?? []);
    setAdminIds(new Set((roleRows ?? []).map((r) => r.user_id)));
  }, []);

  useEffect(() => {
    void loadAccess();
    void loadVersions().then(async (rows) => {
      if (rows.length === 0) {
        const { data: created } = await supabase
          .from("cv_versions")
          .insert({ name: "Main CV", slug: "main", data: defaultCvData as never, is_live: true })
          .select("id,name,slug,purpose,is_live,updated_at")
          .single();
        if (created) {
          setVersions([created]);
          setSelectedId(created.id);
          replaceData(defaultCvData, { persist: false });
        }
        return;
      }
      setSelectedId((prev) => prev ?? rows.find((r) => r.is_live)?.id ?? rows[0].id);
    });
  }, [loadAccess, loadVersions, replaceData]);

  // Load the selected version's content into the editor
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    supabase
      .from("cv_versions")
      .select("data")
      .eq("id", selectedId)
      .single()
      .then(({ data: row }) => {
        if (cancelled || !row) return;
        savedRef.current = JSON.stringify(row.data);
        replaceData(row.data as unknown as CVData, { persist: false });
        setDirty(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, replaceData]);

  // Track unsaved changes
  useEffect(() => {
    if (!selectedId) return;
    setDirty(JSON.stringify(data) !== savedRef.current);
  }, [data, selectedId]);

  const saveDraft = async () => {
    if (!selectedId) return;
    setSaving(true);
    const snapshot = JSON.stringify(data);
    const { error } = await supabase
      .from("cv_versions")
      .update({ data: data as never })
      .eq("id", selectedId);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    savedRef.current = snapshot;
    setDirty(false);
    toast({ title: "Draft saved" });
  };

  const publish = async () => {
    if (!selected) return;
    setSaving(true);
    await supabase.from("cv_versions").update({ data: data as never }).eq("id", selected.id);
    const { error } = await supabase.from("cv_published").upsert({
      version_id: selected.id,
      slug: selected.slug,
      name: selected.name,
      data: data as never,
      is_live: selected.is_live,
      published_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not publish", description: error.message, variant: "destructive" });
      return;
    }
    setDirty(false);
    await loadVersions();
    toast({ title: "Published", description: selected.is_live ? "Live on your main page." : "Available at its own link." });
  };

  const makeLive = async () => {
    if (!selected) return;
    await supabase.from("cv_versions").update({ is_live: true }).eq("id", selected.id);
    await supabase.from("cv_published").update({ is_live: false }).neq("version_id", selected.id);
    await supabase.from("cv_published").update({ is_live: true }).eq("version_id", selected.id);
    await loadVersions();
    toast({ title: "This version is now the live one" });
  };

  const createVersion = async () => {
    const name = newName.trim();
    if (!name) return;
    const base = slugify(name) || "version";
    const slug = versions.some((v) => v.slug === base) ? `${base}-${Date.now().toString(36).slice(-4)}` : base;
    const { data: created, error } = await supabase
      .from("cv_versions")
      .insert({ name, slug, data: data as never })
      .select("id,name,slug,purpose,is_live,updated_at")
      .single();
    if (error) {
      toast({ title: "Could not create version", description: error.message, variant: "destructive" });
      return;
    }
    setNewName("");
    await loadVersions();
    if (created) setSelectedId(created.id);
    toast({ title: `Created "${name}"`, description: "Starts as a copy of what you're editing." });
  };

  const deleteVersion = async (id: string) => {
    await supabase.from("cv_versions").delete().eq("id", id);
    const rows = await loadVersions();
    if (selectedId === id) setSelectedId(rows[0]?.id ?? null);
  };

  const toggleAdmin = async (profileId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      await supabase.from("user_roles").insert({ user_id: profileId, role: "admin" });
    } else {
      await supabase.from("user_roles").delete().eq("user_id", profileId).eq("role", "admin");
    }
    await loadAccess();
  };

  const publicUrl = selected
    ? selected.is_live
      ? window.location.origin + "/"
      : `${window.location.origin}/cv/${selected.slug}`
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <aside className="lg:w-72 border-b lg:border-b-0 lg:border-r border-border p-4 space-y-4">
        <div>
          <h1 className="font-display text-lg">CV Admin</h1>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>

        <div className="space-y-1">
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                v.id === selectedId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="truncate flex-1">{v.name}</span>
                {v.is_live && <Globe className="w-3.5 h-3.5 shrink-0" aria-label="Live version" />}
                {publishedIds.has(v.id) && <Check className="w-3.5 h-3.5 shrink-0" aria-label="Published" />}
              </span>
              <span className="block text-[10px] opacity-70">/cv/{v.slug}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <Label className="text-xs">New version</Label>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Feature film lead"
              className="h-9 text-sm"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={createVersion} aria-label="Create version">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.replace("/");
          }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border p-4 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[10rem]">
            <p className="text-sm font-medium truncate">{selected?.name ?? "No version"}</p>
            <p className="text-xs text-muted-foreground">
              {dirty ? "Unsaved changes" : "All changes saved"}
              {selected && publishedIds.has(selected.id) ? " · published" : " · not published yet"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={saveDraft} disabled={!selected || saving}>
            <Save className="w-4 h-4 mr-1.5" /> Save draft
          </Button>
          <Button size="sm" onClick={publish} disabled={!selected || saving}>
            <UploadCloud className="w-4 h-4 mr-1.5" /> Publish
          </Button>
          {selected && !selected.is_live && (
            <Button variant="outline" size="sm" onClick={makeLive}>
              <Globe className="w-4 h-4 mr-1.5" /> Make live
            </Button>
          )}
          {selected && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(publicUrl);
                  toast({ title: "Link copied" });
                }}
              >
                <Copy className="w-4 h-4 mr-1.5" /> Copy link
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1.5" /> View
                </a>
              </Button>
              {!selected.is_live && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteVersion(selected.id)}
                  aria-label="Delete version"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </>
          )}
        </header>

        <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto">
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

        <ScrollArea className="flex-1">
          <div className="p-4 max-w-3xl">
            {activeTab === "hero" && <HeroEditor />}
            {activeTab === "about" && <AboutEditor />}
            {activeTab === "portfolio" && <PortfolioEditor />}
            {activeTab === "skills" && <SkillsEditor />}
            {activeTab === "experience" && <ExperienceEditor />}
            {activeTab === "education" && <EducationEditor />}
            {activeTab === "contact" && <ContactEditor />}
            {activeTab === "access" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Anyone who signs in appears here. Give editing access only to people you trust.
                </p>
                {profiles.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 border border-border rounded-md px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{p.full_name || p.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                    </div>
                    <Button
                      variant={adminIds.has(p.id) ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleAdmin(p.id, !adminIds.has(p.id))}
                    >
                      {adminIds.has(p.id) ? "Remove access" : "Approve"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

export default AdminPanel;
