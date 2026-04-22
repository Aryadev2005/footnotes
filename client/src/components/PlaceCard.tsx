import { MapPin } from 'lucide-react'
import type { Place } from '@/data/mockData'

interface Props {
  place: Place
  onClick?: () => void
}

export function PlaceCard({ place, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="aspect-[3/2] overflow-hidden bg-secondary">
        {place.image ? (
          <img src={place.image} alt={place.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <MapPin className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-serif text-sm font-semibold text-foreground">{place.name}</h3>
        <div className="mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{place.area}</p>
        </div>
        {place.category && (
          <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            {place.category}
          </span>
        )}
      </div>
    </div>
  )
}