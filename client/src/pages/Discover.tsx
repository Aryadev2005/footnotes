import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { Slider } from "@/components/ui/slider";
import { usePlaces } from "@/hooks/usePlaces";
import { useLocation2 } from "@/contexts/LocationContext";
import { useJournal } from "@/hooks/useJournal";
import { MapPin, Wallet, Sparkles, Search } from "lucide-react";
import type { Place } from "@/data/mockData";

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

const Discover = () => {
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [budgetRange, setBudgetRange] = useState([2]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [visitedFilter, setVisitedFilter] = useState("All");
  const [showResults, setShowResults] = useState(false);
  const { selectedCity } = useLocation2();

  const { data: allPlaces = [] } = usePlaces();
  const { data: journalEntries = [] } = useJournal();

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const visitedPlaceNames = useMemo(
    () => new Set(journalEntries.map((e) => e.placeName.toLowerCase())),
    [journalEntries]
  );

  const filteredPlaces = useMemo(() => {
    let places = allPlaces;

    if (selectedCategories.length > 0) {
      const allowedCategories = selectedCategories.flatMap(
        (cat) => categoryMap[cat] || []
      );
      places = places.filter((place) =>
        allowedCategories.includes(place.category)
      );
    }

    if (visitedFilter === "Been there") {
      places = places.filter((p) => visitedPlaceNames.has(p.name.toLowerCase()));
    } else if (visitedFilter === "Somewhere new") {
      places = places.filter((p) => !visitedPlaceNames.has(p.name.toLowerCase()));
    }

    return places;
  }, [allPlaces, selectedCategories, visitedFilter, visitedPlaceNames]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Discover {selectedCity}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Where should you go right now? Tell us and we'll find it.
          </p>
        </div>

        <div className="mb-8 space-y-6 rounded-xl bg-card p-5 shadow-sm">
          {/* Distance */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              How far?
            </div>
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map((opt, i) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedDistance(selectedDistance === i ? null : i)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    selectedDistance === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                  <span className="text-[10px] opacity-70">{opt.subtitle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet className="h-4 w-4 text-primary" />
              Budget per person
            </div>
            <div className="px-1">
              <Slider value={budgetRange} onValueChange={setBudgetRange} min={0} max={4} step={1} className="w-full" />
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                {budgetLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
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
                <button
                  key={cat.label}
                  onClick={() => toggleCategory(cat.label)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    selectedCategories.includes(cat.label)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <button onClick={() => setSelectedCategories([])} className="mt-2 text-[11px] text-muted-foreground underline">
                Clear all
              </button>
            )}
          </div>

          {/* Visited filter */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Been there before?
            </div>
            <div className="flex flex-wrap gap-2">
              {visitedFilterOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setVisitedFilter(opt.label)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    visitedFilter === opt.label
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discover button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowResults(true)}
              className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              Discover
            </button>
          </div>
        </div>

        {showResults && (
          <div>
            <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
              {filteredPlaces.length} places found
            </h2>
            {filteredPlaces.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </main>

      <PlaceDetailModal
        place={selectedPlace}
        open={!!selectedPlace}
        onOpenChange={(open) => !open && setSelectedPlace(null)}
      />
    </div>
  );
};

export default Discover;
