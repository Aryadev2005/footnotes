import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useJournal } from "@/hooks/useJournal";
import { vibeOptions } from "@/data/mockData";

const Journal = () => {
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const { data: entries = [], isLoading } = useJournal(activeVibe);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 font-serif text-2xl font-semibold text-foreground">
          Your Journal
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Every place tells a story
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveVibe(null)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              !activeVibe
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {vibeOptions.map((vibe) => (
            <button
              key={vibe}
              onClick={() => setActiveVibe(vibe)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeVibe === vibe
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="relative border-l-2 border-border pl-6">
            {entries.map((entry) => (
              <div key={entry.id} className="relative mb-6 pb-2">
                <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary" />
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {entry.date}
                </p>
                <div className="rounded-xl bg-card p-4 shadow-sm">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-base font-semibold text-foreground">
                      {entry.placeName}
                    </h3>
                    <div className="flex gap-0.5 text-xs text-primary">
                      {Array.from({ length: entry.rating }).map((_, i) => (
                        <span key={i}>♥</span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {entry.area}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                    {entry.note}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {entry.vibe}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Journal;
