import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { indianCities } from "@/contexts/LocationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Onboarding = () => {
  const { user, displayName: googleName, avatarUrl: googleAvatar } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(googleName ?? "");
  const [username, setUsername] = useState(
    (googleName ?? "").toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
  );
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(googleAvatar);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time username availability check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);
    setUsernameAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("user_id", user?.id ?? "")
        .maybeSingle();
      setUsernameAvailable(!data);
      setCheckingUsername(false);
      if (data) {
        setUsernameError("This username is already taken. Try another.");
      } else {
        setUsernameError("");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, user?.id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
    setUsername(clean);
    setUsernameError("");
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!username.trim() || username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    if (usernameAvailable === false) {
      setUsernameError("This username is already taken. Try another.");
      return;
    }
    if (checkingUsername) return;

    setLoading(true);
    try {
      let finalAvatarUrl: string | null = avatarPreview;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const filePath = `avatars/${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);
        finalAvatarUrl = urlData.publicUrl;
      }

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            display_name: displayName.trim(),
            username,
            avatar_url: finalAvatarUrl,
            city: selectedCity,
            profile_setup_completed: true,
          })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert({
          user_id: user.id,
          display_name: displayName.trim(),
          username,
          avatar_url: finalAvatarUrl,
          city: selectedCity,
          profile_setup_completed: true,
        });
        if (error) throw error;
      }

      navigate("/", { replace: true });
    } catch (err: unknown) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = displayName?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-2 inline-block rounded-lg bg-card px-6 py-2 shadow-sm">
            <span className="font-serif text-2xl font-semibold tracking-wide text-foreground">
              FootNotes
            </span>
          </div>
          <h2 className="mt-3 font-serif text-xl font-semibold text-foreground">Set up your profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us a bit about yourself to get started.
          </p>
        </div>

        {/* Avatar picker */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-20 w-20 cursor-pointer" onClick={() => fileRef.current?.click()}>
              {avatarPreview && <AvatarImage src={avatarPreview} alt={displayName} />}
              <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="text-xs text-muted-foreground">Tap to change photo</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              placeholder="e.g. Priya Sharma"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <Input
                id="username"
                placeholder="your_username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`pl-7 pr-9 ${
                  username.length >= 3
                    ? usernameAvailable === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : usernameAvailable === false
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                    : ""
                }`}
              />
              {username.length >= 3 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : usernameAvailable === true ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : usernameAvailable === false ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : null}
                </span>
              )}
            </div>
            {usernameError ? (
              <p className="text-xs text-destructive">{usernameError}</p>
            ) : username.length >= 3 && usernameAvailable === true ? (
              <p className="text-xs text-green-500">Username is available!</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Only lowercase letters, numbers, and underscores. Max 20 chars.
            </p>
          </div>

          {/* City Selection */}
          <div className="space-y-1.5">
            <Label>Your City</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Select your city" />
                </div>
              </SelectTrigger>
              <SelectContent className="z-[100] bg-popover">
                {indianCities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              We'll show you places in your city. You can change this anytime.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full font-semibold"
            size="lg"
            disabled={loading || checkingUsername || usernameAvailable === false}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : checkingUsername ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              "Let's go →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
