import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { usePlaces } from "@/hooks/usePlaces";
import { useLocation2 } from "@/contexts/LocationContext";
import type { Place } from "@/data/mockData";

const allCategories = ["All", "Cafés", "Parks", "Bookstores", "Walks", "Restaurants", "Nightlife", "Art Spaces"];

const Popular = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { selectedCity } = useLocation2();

  const { data: filtered = [], isLoading } = usePlaces(activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 font-serif text-2xl font-semibold text-foreground">
          Popular in {selectedCity} this month
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          The spots everyone's been logging lately
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {allCategories.map((cat) => (
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

        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((place) => (
              <PlaceCard
                key={place.id}
                place={place as Place}
                onClick={() => setSelectedPlace(place as Place)}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No places found in this category yet
          </p>
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

export default Popular;
