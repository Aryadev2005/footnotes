import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LogEntryModal } from "@/components/LogEntryModal";
import { useSavedLogs } from "@/contexts/SavedLogsContext";
import { useJournal } from "@/hooks/useJournal";
import { useLogs } from "@/hooks/useLogs";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Bookmark, Users, Star, Bell, Heart, UserPlus, MessageCircle, X, Plus, BookOpen, Settings, LogOut, Shield } from "lucide-react";
import { useFriendships } from "@/hooks/useFriendships";
import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready
import { Link, useNavigate } from "react-router-dom";
import { useTopPicks, useAddTopPick, useDeleteTopPick, TopPickCategory } from "@/hooks/useTopPicks";
import { useActivity } from "@/hooks/useActivity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const goList = [
  { id: "g1", name: "Toit Brewpub", area: "Indiranagar", category: "Restaurants" },
  { id: "g2", name: "Ranga Shankara", area: "JP Nagar", category: "Theatre" },
  { id: "g3", name: "Windmills Craftworks", area: "Whitefield", category: "Cafés" },
  { id: "g4", name: "ISKCON Temple", area: "Rajajinagar", category: "Temples" },
  { id: "g5", name: "Bangalore Fort", area: "KR Market", category: "Heritage" },
];

const topPickCategories: { key: TopPickCategory; label: string; emoji: string }[] = [
  { key: "cafe", label: "Café", emoji: "☕" },
  { key: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { key: "spot", label: "Spot", emoji: "📍" },
  { key: "park", label: "Park", emoji: "🌿" },
];

const Profile = () => {
  const { savedLogs, toggleSave } = useSavedLogs();
  const { displayName, avatarUrl, user, signOut } = useAuth();
  const { data: journalEntries = [] } = useJournal();
  const { data: userLogs = [] } = useLogs(user?.id);
  const { data: friendships = [] } = useFriendships();
  const { data: topPicks = [] } = useTopPicks(user?.id);
  const { data: activities = [] } = useActivity();
  const addTopPick = useAddTopPick();
  const deleteTopPick = useDeleteTopPick();
  const initials = displayName?.charAt(0)?.toUpperCase() ?? "U";
  const navigate = useNavigate();
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

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

  const [addPickOpen, setAddPickOpen] = useState(false);
  const [addPickCategory, setAddPickCategory] = useState<TopPickCategory>("cafe");
  const [addPickName, setAddPickName] = useState("");
  const [addPickArea, setAddPickArea] = useState("");
  const [logModalOpen, setLogModalOpen] = useState(false);

  const { data: ownProfile } = useQuery({
    queryKey: ["own-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("username").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const friendUserIds = friendships.map((f) => (f.user_id === user?.id ? f.friend_id : f.user_id));
  const { data: friendProfiles = [] } = useQuery({
    queryKey: ["friend-profiles", friendUserIds],
    enabled: friendUserIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("user_id", friendUserIds);
      if (error) throw error;
      return data;
    },
  });

  const handleAddPick = () => {
    if (!addPickName.trim() || !user) return;
    addTopPick.mutate({
      user_id: user.id,
      category: addPickCategory,
      place_name: addPickName.trim(),
      area: addPickArea.trim() || undefined,
    });
    setAddPickName("");
    setAddPickArea("");
    setAddPickOpen(false);
  };

  const formatActivityTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-serif text-xl font-semibold text-foreground">{displayName}</h1>
            {ownProfile?.username && <p className="text-xs text-muted-foreground">@{ownProfile.username}</p>}
            <p className="text-sm text-muted-foreground">Exploring Bangalore, one spot at a time</p>
          </div>
          {/* Go List + Activity Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogModalOpen(true)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title="Log a place"
            >
              <Plus className="h-5 w-5" />
            </button>
            <Link to="/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {activities.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activities.length > 9 ? "9+" : activities.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 sm:w-96">
              <SheetHeader>
                <SheetTitle className="font-serif">Activity</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                {activities.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 rounded-lg bg-card p-3">
                      <div className="mt-0.5">
                        {a.type === "like" && <Heart className="h-4 w-4 text-destructive" />}
                        {a.type === "friend_add" && <UserPlus className="h-4 w-4 text-primary" />}
                        {a.type === "comment" && <MessageCircle className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{a.actor_name}</span>{" "}
                          <span className="text-foreground/70">{a.detail}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">{formatActivityTime(a.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 flex gap-6">
        {[
          { label: "Logs", value: userLogs.length },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-serif text-xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
        <button onClick={() => setFriendsDialogOpen(true)} className="text-center hover:opacity-70 transition-opacity">
          <p className="font-serif text-xl font-semibold text-foreground">{friendProfiles.length}</p>
          <p className="text-xs text-muted-foreground">Friends</p>
        </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-4">
            <TabsTrigger value="logs" className="text-xs gap-1">
              <BookOpenIcon className="h-3.5 w-3.5" /> Logs
            </TabsTrigger>
            <TabsTrigger value="top3" className="text-xs gap-1">
              <Star className="h-3.5 w-3.5" /> Top 3
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs gap-1">
              <Bookmark className="h-3.5 w-3.5" /> Saved
            </TabsTrigger>
            <TabsTrigger value="golist" className="text-xs gap-1">
              <MapPin className="h-3.5 w-3.5" /> Go List
            </TabsTrigger>
          </TabsList>

          {/* Logs Tab */}
          <TabsContent value="logs">
            {userLogs.length === 0 ? (
              <div className="rounded-xl bg-card p-8 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">No logs yet. Start logging your favourite places!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {userLogs.map((log) => (
                  <div key={log.id} className="rounded-xl bg-card p-4 shadow-sm">
                    <h3 className="font-serif text-sm font-semibold text-foreground">{log.placeName}</h3>
                    <p className="text-xs text-muted-foreground">{log.area}</p>
                    <p className="mt-2 text-sm text-foreground/80">{log.note}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground">{log.vibe}</span>
                      <span className="text-[11px] text-muted-foreground">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Top 3 Tab */}
          <TabsContent value="top3">
            <div className="space-y-6">
              {topPickCategories.map(({ key, label, emoji }) => {
                const picks = topPicks.filter((p: any) => p.category === key);
                return (
                  <div key={key}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-serif text-sm font-semibold text-foreground">
                        {emoji} Top {label}s
                      </h3>
                      {picks.length < 3 && (
                        <button
                          onClick={() => { setAddPickCategory(key); setAddPickOpen(true); }}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add
                        </button>
                      )}
                    </div>
                    {picks.length === 0 ? (
                      <div className="rounded-xl bg-card p-4 text-center shadow-sm">
                        <p className="text-xs text-muted-foreground">No top {label.toLowerCase()}s added yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {picks.map((pick: any, i: number) => (
                          <div key={pick.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-sm font-semibold text-foreground truncate">{pick.place_name}</p>
                              {pick.area && <p className="text-xs text-muted-foreground">{pick.area}</p>}
                            </div>
                            <button onClick={() => deleteTopPick.mutate(pick.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Top Pick Dialog */}
            <Dialog open={addPickOpen} onOpenChange={setAddPickOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="font-serif">Add Top Pick</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div className="flex gap-2 flex-wrap">
                    {topPickCategories.map(({ key, label, emoji }) => (
                      <button
                        key={key}
                        onClick={() => setAddPickCategory(key)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${addPickCategory === key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground'}`}
                      >
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                  <Input placeholder="Place name" value={addPickName} onChange={(e) => setAddPickName(e.target.value)} />
                  <Input placeholder="Area (optional)" value={addPickArea} onChange={(e) => setAddPickArea(e.target.value)} />
                  <Button className="w-full" onClick={handleAddPick} disabled={!addPickName.trim()}>Add Pick</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Saved Logs Tab */}
          <TabsContent value="saved">
            {savedLogs.length === 0 ? (
              <div className="rounded-xl bg-card p-8 text-center shadow-sm">
                <Bookmark className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No saved logs yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedLogs.map((log) => (
                  <div key={log.id} className="rounded-xl bg-card p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                        {log.friendAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-foreground">{log.friendName}</span>
                          <span className="text-xs text-muted-foreground">at {log.placeName} · {log.area}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-foreground/80">{log.note}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground">{log.vibe}</span>
                          <button onClick={() => toggleSave(log)}>
                            <Bookmark className="h-3.5 w-3.5 fill-primary text-primary" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Go List Tab */}
          <TabsContent value="golist">
            <div className="grid grid-cols-1 gap-3">
              {goList.map((place, i) => (
                <div key={place.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm font-semibold text-foreground">{place.name}</p>
                    <p className="text-xs text-muted-foreground">{place.area} · {place.category}</p>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Friends Dialog */}
        <Dialog open={friendsDialogOpen} onOpenChange={setFriendsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Friends</DialogTitle>
            </DialogHeader>
            <div className="mt-2 max-h-80 overflow-y-auto space-y-2">
              {friendProfiles.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">No friends yet. Visit other profiles and add them!</p>
              ) : (
                friendProfiles.map((friend) => (
                  <Link
                    key={friend.id}
                    to={`/friend/${encodeURIComponent(friend.username)}`}
                    onClick={() => setFriendsDialogOpen(false)}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                  >
                    <Avatar className="h-10 w-10">
                      {friend.avatar_url && <AvatarImage src={friend.avatar_url} alt={friend.display_name} />}
                      <AvatarFallback className="text-sm font-semibold">{friend.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="font-serif text-sm font-semibold text-foreground">{friend.display_name}</p>
                  </Link>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <LogEntryModal open={logModalOpen} onOpenChange={setLogModalOpen} />
    </div>
  );
};

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export default Profile;
