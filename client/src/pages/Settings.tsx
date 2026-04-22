import { Navbar } from "@/components/Navbar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready
import { LogOut, Shield } from "lucide-react";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      return data as boolean;
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 font-serif text-2xl font-semibold text-foreground">
          Settings
        </h1>

        <div className="space-y-6 rounded-xl bg-card p-6 shadow-sm">
          {/* Appearance */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Dark Mode
              </Label>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Push Notifications
              </Label>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>

          <Separator />

          {/* Privacy */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Privacy
            </h2>
            <div className="flex items-center justify-between">
              <Label htmlFor="private-profile" className="text-sm font-medium">
                Private Profile
              </Label>
              <Switch id="private-profile" checked={privateProfile} onCheckedChange={setPrivateProfile} />
            </div>
          </div>

          <Separator />

          {/* Admin & Account */}
          <div className="space-y-3">
            {isAdmin && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/admin")}
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <Button
              variant="destructive"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
