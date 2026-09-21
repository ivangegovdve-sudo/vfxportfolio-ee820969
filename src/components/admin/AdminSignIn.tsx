import { useState } from "react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";

export function AdminSignIn() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setError("Sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    window.location.replace("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-2xl text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your Google account to edit your CV.
          </p>
        </div>
        <Button onClick={signIn} disabled={busy} className="w-full">
          {busy ? "Opening Google…" : "Continue with Google"}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}

export default AdminSignIn;
