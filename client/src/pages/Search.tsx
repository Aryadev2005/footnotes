import { useState, useRef, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// TODO: Replace with API calls to backend server when ready
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Wallet, Sparkles, Search as SearchIcon } from "lucide-react";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { Slider } from "@/components/ui/slider";
import { usePlaces } from "@/hooks/usePlaces";
import { useLocation2 } from "@/contexts/LocationContext";
import { useJournal } from "@/hooks/useJournal";
import type { Place } from "@/data/mockData";

const recentSearches = ["Cubbon Park", "Third Wave Coffee", "Church Street"];

const sanitize = (input: string) =>
  input.replace(/[%_'"\\;]/g, "").trim().slice(0, 50);

const distanceOptions = [
  { label: "Walk", subtitle: "0–1 km", icon: "🚶" },
  { label: "Nearby", subtitle: "1–3 km", icon: "📍" },
  { label: "Short ride", subtitle: "3–7 km", icon: "🛵" },
  { label: "Anywhere", subtitle: "7+ km", icon: "🌍" },
];

const categoryOptions = [
  { label: "Restaurant", icon: "🍽" },
  { label: "Café", icon: "☕" },
  { label: "Sports", icon: "🏃" },
  { label: "Activity", icon: "🎯" },
  { label: "Spots", icon: "🌄" },
];

const visitedFilterOptions = [
  { label: "All", icon: "📋" },
  { label: "Been there", icon: "✅" },
  { label: "Somewhere new", icon: "✨" },
];

const budgetLabels = ["₹100", "₹300", "₹600", "₹1200", "₹1200+"];

const categoryMap: Record<string, string[]> = {
  Restaurant: ["Restaurants"],
  Café: ["Cafés"],
  Sports: ["Sports"],
  Activity: ["Walks", "Markets"],
  Spots: ["Parks", "Art Spaces", "Nightlife", "Bookstores"],
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { selectedCity } = useLocation2();

  const safeQuery = sanitize(query);

  // Discover state
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [budgetRange, setBudgetRange] = useState([2]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [visitedFilter, setVisitedFilter] = useState("All");
  const [showResults, setShowResults] = useState(false);

  const { data: allPlaces = [] } = usePlaces();
  const { data: journalEntries = [] } = useJournal();

  // Search queries
  const { data: userResults = [] } = useQuery({
    queryKey: ["search-users", safeQuery],
    enabled: safeQuery.length >= 1,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").ilike("username", `%${safeQuery}%`).limit(20);
      const { data: data2, error: err2 } = await supabase.from("profiles").select("*").ilike("display_name", `%${safeQuery}%`).limit(20);
      if (error && err2) throw error;
      const all = [...(data ?? []), ...(data2 ?? [])];
      const seen = new Set<string>();
      return all.filter((u) => { if (seen.has(u.id)) return false; seen.add(u.id); return true; });
    },
  });

  const { data: placeResults = [] } = useQuery({
    queryKey: ["search-places", safeQuery],
    enabled: safeQuery.length >= 1,
    queryFn: async () => {
      const { data: byName } = await supabase.from("places").select("*").ilike("name", `%${safeQuery}%`).limit(20);
      const { data: byArea } = await supabase.from("places").select("*").ilike("area", `%${safeQuery}%`).limit(20);
      const all = [...(byName ?? []), ...(byArea ?? [])];
      const seen = new Set<string>();
      return all.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
    },
  });

  // Discover logic
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const visitedPlaceNames = useMemo(
    () => new Set(journalEntries.map((e) => e.placeName.toLowerCase())),
    [journalEntries]
  );

  const filteredPlaces = useMemo(() => {
    let places = allPlaces;
    if (selectedCategories.length > 0) {
      const allowedCategories = selectedCategories.flatMap((cat) => categoryMap[cat] || []);
      places = places.filter((place) => allowedCategories.includes(place.category));
    }
    if (visitedFilter === "Been there") {
      places = places.filter((p) => visitedPlaceNames.has(p.name.toLowerCase()));
    } else if (visitedFilter === "Somewhere new") {
      places = places.filter((p) => !visitedPlaceNames.has(p.name.toLowerCase()));
    }
    return places;
  }, [allPlaces, selectedCategories, visitedFilter, visitedPlaceNames]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (username: string) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/friend/${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Top-level tabs: Search | Discover */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-2">
            <TabsTrigger value="search" className="text-xs font-semibold">Search</TabsTrigger>
            <TabsTrigger value="discover" className="text-xs font-semibold">Discover</TabsTrigger>
          </TabsList>

          {/* ── Search Tab ── */}
          <TabsContent value="search">
            <div className="relative mb-6">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowDropdown(e.target.value.length >= 1); }}
                onFocus={() => safeQuery.length >= 1 && setShowDropdown(true)}
                placeholder="Search places or @username..."
                className="rounded-xl bg-card text-base"
              />
              {showDropdown && safeQuery.length >= 1 && userResults.length > 0 && (
                <div ref={dropdownRef} className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg">
                  {userResults.slice(0, 6).map((u) => (
                    <button key={u.id} onClick={() => handleSelect(u.username)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent">
                      <Avatar className="h-8 w-8">
                        {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.display_name} />}
                        <AvatarFallback className="text-xs font-semibold">{u.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{u.display_name}</p>
                        <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {query.length === 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button key={s} onClick={() => setQuery(s)} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {safeQuery.length >= 1 && (
              <Tabs defaultValue="people" className="w-full">
                <TabsList className="mb-4 w-full grid grid-cols-2">
                  <TabsTrigger value="people" className="text-xs">People ({userResults.length})</TabsTrigger>
                  <TabsTrigger value="places" className="text-xs">Places ({placeResults.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="people">
                  {userResults.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {userResults.map((u) => (
                        <Link key={u.id} to={`/friend/${encodeURIComponent(u.username)}`} className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm transition-colors hover:bg-accent">
                          <Avatar className="h-10 w-10">
                            {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.display_name} />}
                            <AvatarFallback className="text-sm font-semibold">{u.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-sm font-semibold text-foreground">{u.display_name}</p>
                            <p className="text-xs text-muted-foreground">@{u.username}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">No users found for "{query}"</p>
                  )}
                </TabsContent>
                <TabsContent value="places">
                  {placeResults.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {placeResults.map((place) => (
                        <div key={place.id} className="rounded-xl bg-card p-4 shadow-sm">
                          <p className="font-serif text-sm font-semibold text-foreground">{place.name}</p>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {place.area}
                            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{place.category}</span>
                          </div>
                          {place.description && <p className="mt-1.5 text-xs text-foreground/70 line-clamp-2">{place.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">No places found for "{query}"</p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>

          {/* ── Discover Tab ── */}
          <TabsContent value="discover">
            <p className="mb-4 text-sm text-muted-foreground">
              Where should you go right now in <span className="font-semibold text-foreground">{selectedCity}</span>? Tell us and we'll find it.
            </p>

            <div className="mb-8 space-y-6 rounded-xl bg-card p-5 shadow-sm">
              {/* Distance */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-primary" /> How far?
                </div>
                <div className="flex flex-wrap gap-2">
                  {distanceOptions.map((opt, i) => (
                    <button key={opt.label} onClick={() => setSelectedDistance(selectedDistance === i ? null : i)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${selectedDistance === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      <span>{opt.icon}</span><span>{opt.label}</span>
                      <span className="text-[10px] opacity-70">{opt.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Wallet className="h-4 w-4 text-primary" /> Budget per person
                </div>
                <div className="px-1">
                  <Slider value={budgetRange} onValueChange={setBudgetRange} min={0} max={4} step={1} className="w-full" />
                  <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                    {budgetLabels.map((label) => (<span key={label}>{label}</span>))}
                  </div>
                  <p className="mt-1 text-center text-xs font-medium text-foreground">
                    Up to <span className="text-primary">{budgetLabels[budgetRange[0]]}</span>
                  </p>
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="mb-3 text-sm font-semibold text-foreground">What are you looking for?</div>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => (
                    <button key={cat.label} onClick={() => toggleCategory(cat.label)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${selectedCategories.includes(cat.label) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      <span>{cat.icon}</span><span>{cat.label}</span>
                    </button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <button onClick={() => setSelectedCategories([])} className="mt-2 text-[11px] text-muted-foreground underline">Clear all</button>
                )}
              </div>

              {/* Visited filter */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Been there before?
                </div>
                <div className="flex flex-wrap gap-2">
                  {visitedFilterOptions.map((opt) => (
                    <button key={opt.label} onClick={() => setVisitedFilter(opt.label)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${visitedFilter === opt.label ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                      <span>{opt.icon}</span><span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discover button */}
              <div className="flex justify-center pt-2">
                <button onClick={() => setShowResults(true)}
                  className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  <SearchIcon className="h-4 w-4" /> Discover
                </button>
              </div>
            </div>

            {showResults && (
              <div>
                <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">{filteredPlaces.length} places found</h2>
                {filteredPlaces.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filteredPlaces.map((place) => (
                      <PlaceCard key={place.id} place={place as Place} onClick={() => setSelectedPlace(place as Place)} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-card py-12 text-center">
                    <p className="text-sm text-muted-foreground">No places match your filters. Try adjusting them!</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <PlaceDetailModal place={selectedPlace} open={!!selectedPlace} onOpenChange={(open) => !open && setSelectedPlace(null)} />
    </div>
  );
};

export default Search;
