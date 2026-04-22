import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin } from 'lucide-react'

interface Props {
  placeName: string
  area: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlaceLightbox({ placeName, area, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif">{placeName}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {area}
        </div>
      </DialogContent>
    </Dialog>
  )
}