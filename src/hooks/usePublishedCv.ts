import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CVData } from "@/data/cvData";
import { useCvData } from "@/contexts/useCvData";

/**
 * Loads the published CV content for the public site.
 * - no slug: loads the version marked as live
 * - slug: loads that specific published version
 * Falls back silently to the bundled content.
 */
export function usePublishedCv(slug?: string) {
  const { replaceData } = useCvData();
  const [state, setState] = useState<"loading" | "loaded" | "fallback" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    const query = supabase.from("cv_published").select("data,name,slug");
    const request = slug ? query.eq("slug", slug).maybeSingle() : query.eq("is_live", true).maybeSingle();

    request.then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data) {
        setState(slug ? "missing" : "fallback");
        return;
      }
      replaceData(data.data as unknown as CVData, { persist: false });
      setState("loaded");
    });

    return () => {
      cancelled = true;
    };
  }, [slug, replaceData]);

  return state;
}
