import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, Navigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users, Bot, Activity, Shield, MapPin, BookOpen, Heart,
  MessageSquare, Bookmark, TrendingUp, Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
  "hsl(var(--secondary))",
];

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (error) throw error;
      return data as boolean;
    },
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["analytics-profiles"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: logsCount = 0 } = useQuery({
    queryKey: ["analytics-logs-count"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("logs")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: placesCount = 0 } = useQuery({
    queryKey: ["analytics-places-count"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("places")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: likesCount = 0 } = useQuery({
    queryKey: ["analytics-likes-count"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: commentsCount = 0 } = useQuery({
    queryKey: ["analytics-comments-count"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: savedCount = 0 } = useQuery({
    queryKey: ["analytics-saved-count"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("saved_logs")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: journalCount = 0 } = useQuery({
    queryKey: ["analytics-journal-count"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ["analytics-recent-logs"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("id, author_name, place_name, area, vibe, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const realUsers = allProfiles.filter((p) => p.user_id !== null);
  const botProfiles = allProfiles.filter((p) => p.user_id === null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const timeSinceCreated = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Today";
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  };

  // City distribution for pie chart
  const cityDistribution = allProfiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.city] = (acc[p.city] || 0) + 1;
    return acc;
  }, {});
  const cityChartData = Object.entries(cityDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Signups per week (last 8 weeks)
  const weeklySignups = (() => {
    const weeks: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const count = allProfiles.filter((p) => {
        const d = new Date(p.created_at);
        return d >= start && d < end;
      }).length;
      weeks.push({
        label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count,
      });
    }
    return weeks;
  })();

  const statsCards = [
    { icon: Activity, label: "Total Profiles", value: allProfiles.length },
    { icon: Users, label: "Real Users", value: realUsers.length },
    { icon: Bot, label: "Bot Profiles", value: botProfiles.length },
    { icon: TrendingUp, label: "Total Logs", value: logsCount },
    { icon: MapPin, label: "Places", value: placesCount },
    { icon: Heart, label: "Likes", value: likesCount },
    { icon: MessageSquare, label: "Comments", value: commentsCount },
    { icon: Bookmark, label: "Saved Logs", value: savedCount },
    { icon: BookOpen, label: "Journal Entries", value: journalCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Admin Dashboard
          </h1>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
          {statsCards.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card p-3 text-center shadow-sm">
              <stat.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <p className="font-serif text-xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {/* Signups chart */}
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Weekly Signups</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklySignups}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* City distribution */}
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Users by City</h2>
            </div>
            {cityChartData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={cityChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {cityChartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {cityChartData.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-muted-foreground">({c.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-3">
            <TabsTrigger value="users" className="text-xs gap-1">
              <Users className="h-3.5 w-3.5" /> Users ({realUsers.length})
            </TabsTrigger>
            <TabsTrigger value="bots" className="text-xs gap-1">
              <Bot className="h-3.5 w-3.5" /> Bots ({botProfiles.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs gap-1">
              <Activity className="h-3.5 w-3.5" /> Recent Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {realUsers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No real users yet.</p>
            ) : (
              <div className="rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Account Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <Link to={`/friend/${encodeURIComponent(u.username)}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-8 w-8">
                              {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.display_name} />}
                              <AvatarFallback className="text-xs">{u.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{u.display_name}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">@{u.username}</TableCell>
                        <TableCell className="text-sm">{u.city}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(u.created_at)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{timeSinceCreated(u.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bots">
            {botProfiles.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No bot profiles.</p>
            ) : (
              <div className="rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profile</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {botProfiles.map((bot) => (
                      <TableRow key={bot.id}>
                        <TableCell>
                          <Link to={`/friend/${encodeURIComponent(bot.username)}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-8 w-8">
                              {bot.avatar_url && <AvatarImage src={bot.avatar_url} alt={bot.display_name} />}
                              <AvatarFallback className="text-xs">{bot.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{bot.display_name}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">@{bot.username}</TableCell>
                        <TableCell className="text-sm">{bot.city}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(bot.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity">
            {recentLogs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No logs yet.</p>
            ) : (
              <div className="rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Author</TableHead>
                      <TableHead>Place</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Vibe</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm font-medium">{log.author_name}</TableCell>
                        <TableCell className="text-sm">{log.place_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.area}</TableCell>
                        <TableCell className="text-sm">{log.vibe}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(log.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
