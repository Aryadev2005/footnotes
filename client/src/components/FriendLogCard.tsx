import { MapPin, Heart, Bookmark } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSavedLogs } from '@/contexts/SavedLogsContext'
import { Link } from 'react-router-dom'

interface Log {
  id: string
  friendName: string
  friendAvatar: string
  friendUsername: string
  avatarUrl?: string | null
  placeName: string
  area: string
  note: string
  vibe: string
  rating: number
  timestamp: string
  photo?: string | null
}

export function FriendLogCard({ log }: { log: Log }) {
  const { savedLogs, toggleSave } = useSavedLogs()
  const isSaved = savedLogs.some(l => l.id === log.id)

  return (
    <div className="rounded-xl bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          {log.avatarUrl && <AvatarImage src={log.avatarUrl} alt={log.friendName} />}
          <AvatarFallback className="text-sm font-semibold">{log.friendAvatar}</AvatarFallback>
        </Avatar>
        <div>
          <Link
            to={`/friend/${encodeURIComponent(log.friendUsername)}`}
            className="text-sm font-semibold text-foreground hover:underline"
          >
            {log.friendName}
          </Link>
          <p className="text-xs text-muted-foreground">{log.timestamp}</p>
        </div>
      </div>

      {/* Photo */}
      {log.photo && (
        <div className="mb-3 overflow-hidden rounded-lg">
          <img src={log.photo} alt={log.placeName} className="h-48 w-full object-cover" loading="lazy" />
        </div>
      )}

      {/* Place */}
      <p className="font-serif text-sm font-semibold text-foreground">{log.placeName}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        {log.area}
      </div>

      {/* Note */}
      {log.note && <p className="mt-2 text-sm leading-relaxed text-foreground/80">{log.note}</p>}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {log.vibe && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
              {log.vibe}
            </span>
          )}
          {log.rating > 0 && (
            <span className="flex gap-0.5 text-xs text-primary">
              {Array.from({ length: log.rating }).map((_, i) => <span key={i}>♥</span>)}
            </span>
          )}
        </div>
        <button onClick={() => toggleSave(log)} className="transition-opacity hover:opacity-70">
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>
    </div>
  )
}