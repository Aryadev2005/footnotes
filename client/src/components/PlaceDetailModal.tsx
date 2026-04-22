import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin } from 'lucide-react'
import type { Place } from '@/data/mockData'

interface Props {
  place: Place | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlaceDetailModal({ place, open, onOpenChange }: Props) {
  if (!place) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">{place.name}</DialogTitle>
        </DialogHeader>
        {place.image && (
          <div className="overflow-hidden rounded-lg">
            <img src={place.image} alt={place.name} className="h-48 w-full object-cover" />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {place.area}{place.city ? `, ${place.city}` : ''}
          </div>
          {place.category && (
            <span className="inline-block rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground">
              {place.category}
            </span>
          )}
          {place.description && (
            <p className="text-sm leading-relaxed text-foreground/80">{place.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}