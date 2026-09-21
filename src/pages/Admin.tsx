import { useAuthSession } from "@/hooks/useAuthSession";
import AdminSignIn from "@/components/admin/AdminSignIn";
import AdminPanel from "@/components/admin/AdminPanel";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { user, isAdmin, loading } = useAuthSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return <AdminSignIn />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="font-display text-xl">Waiting for approval</h1>
          <p className="text-sm text-muted-foreground">
            You're signed in as {user.email}, but you don't have editing access yet.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.replace("/");
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminPanel userEmail={user.email ?? null} />
      <Toaster />
    </>
  );
};

export default Admin;
