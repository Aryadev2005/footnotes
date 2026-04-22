import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { usePlaces, useNewPlaces } from "@/hooks/usePlaces";
import { categories } from "@/data/mockData";
import { useLocation2 } from "@/contexts/LocationContext";
import type { Place } from "@/data/mockData";

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const navigate = useNavigate();
  const { selectedCity } = useLocation2();

  const { data: allPlaces = [] } = usePlaces();
  const { data: filtered = [] } = usePlaces(activeCategory);
  const { data: newPlaces = [] } = useNewPlaces();

  // Use first 4 for popular preview
  const popularPreview = allPlaces.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Popular in Bangalore */}
        <button
          onClick={() => navigate("/popular")}
          className="mb-10 w-full rounded-2xl bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Popular in {selectedCity} this month
            </h2>
            <span className="text-xs font-semibold tracking-wide text-primary">
              SEE ALL
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {popularPreview.map((place) => (
              <div key={place.id} className="overflow-hidden rounded-xl">
                <div className="aspect-[3/2] overflow-hidden bg-secondary">
                  {place.image && (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="bg-secondary/50 px-2.5 py-2">
                  <p className="truncate font-serif text-xs font-semibold text-foreground">
                    {place.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{place.area}</p>
                </div>
              </div>
            ))}
          </div>
        </button>

        {/* New This Week */}
        <section className="mb-10">
          <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
            New this week — must-visit in {selectedCity}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place as Place}
                onClick={() => setSelectedPlace(place as Place)}
              />
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section>
          <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
            Browse by category
          </h2>
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((place) => (
              <PlaceCard key={place.id} place={place as Place} />
            ))}
          </div>
        </section>
      </main>

      <PlaceDetailModal
        place={selectedPlace}
        open={!!selectedPlace}
        onOpenChange={(open) => !open && setSelectedPlace(null)}
      />
    </div>
  );
};

export default Explore;
