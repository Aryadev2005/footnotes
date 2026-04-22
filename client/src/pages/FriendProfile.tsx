import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useLogs } from "@/hooks/useLogs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, UserPlus, UserMinus } from "lucide-react";
import { PlaceLightbox } from "@/components/PlaceLightbox";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready
import { useIsFriend, useAddFriend, useRemoveFriend } from "@/hooks/useFriendships";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const FriendProfile = () => {
  const { username } = useParams<{ username: string }>();
  const decodedUsername = decodeURIComponent(username || "");
  const { user } = useAuth();

  // Look up profile by username (unique)
  const { data: profile } = useQuery({
    queryKey: ["profile-by-username", decodedUsername],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, avatar_url, display_name, username")
        .eq("username", decodedUsername)
        .maybeSingle();
      return data;
    },
  });

  
  const { data: logs = [], isLoading } = useLogs(profile?.user_id);

  const profileUserId = profile?.user_id ?? undefined;
  const avatarUrl = profile?.avatar_url;
  const isOwnProfile = user?.id === profileUserId;

  const { data: isFriend = false } = useIsFriend(profileUserId);
  const addFriend = useAddFriend();
  const removeFriend = useRemoveFriend();

  const resolvedName = profile?.display_name ?? decodedUsername;
  const avatar = resolvedName.charAt(0).toUpperCase();
  const [lightboxPlace, setLightboxPlace] = useState<{ name: string; area: string } | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={resolvedName} />}
            <AvatarFallback className="text-xl font-bold">{avatar}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-serif text-xl font-semibold text-foreground">{resolvedName}</h1>
            {profile?.username && (
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            )}
            <p className="text-sm text-muted-foreground">Explorer · Bangalore</p>
          </div>
          {user && profileUserId && !isOwnProfile && (
            isFriend ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFriend.mutate(profileUserId)}
                disabled={removeFriend.isPending}
              >
                <UserMinus className="h-4 w-4 mr-1" /> Remove
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => addFriend.mutate(profileUserId)}
                disabled={addFriend.isPending}
              >
                <UserPlus className="h-4 w-4 mr-1" /> Add Friend
              </Button>
            )
          )}
        </div>

        <div className="mb-8 flex gap-6">
          <div className="text-center">
            <p className="font-serif text-xl font-semibold text-foreground">{logs.length}</p>
            <p className="text-xs text-muted-foreground">Logs</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-xl font-semibold text-foreground">
              {new Set(logs.map((l) => l.placeName)).size}
            </p>
            <p className="text-xs text-muted-foreground">Places</p>
          </div>
        </div>

        <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">All Logs</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No logs from {resolvedName} yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {logs.map((log) => (
              <div key={log.id} className="rounded-xl bg-card p-5 shadow-sm">
                {log.photo && (
                  <div className="mb-3 overflow-hidden rounded-lg">
                    <img src={log.photo} alt={log.placeName} className="h-48 w-full object-cover" loading="lazy" />
                  </div>
                )}
                <button
                  onClick={() => setLightboxPlace({ name: log.placeName, area: log.area })}
                  className="font-serif text-sm font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {log.placeName}
                </button>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {log.area}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{log.note}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {log.vibe}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {lightboxPlace && (
        <PlaceLightbox
          placeName={lightboxPlace.name}
          area={lightboxPlace.area}
          open={!!lightboxPlace}
          onOpenChange={(open) => !open && setLightboxPlace(null)}
        />
      )}
    </div>
  );
};

export default FriendProfile;
