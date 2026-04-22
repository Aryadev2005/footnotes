export interface Place {
  id: string
  name: string
  area: string
  category: string
  description?: string
  image?: string | null
  city?: string
}

export const categories = [
  'All', 'Cafés', 'Parks', 'Bookstores',
  'Walks', 'Restaurants', 'Nightlife', 'Art Spaces', 'Sports', 'Markets'
]

export const vibeOptions = [
  'Cosy', 'Lively', 'Romantic', 'Solo', 'Work-friendly',
  'Family', 'Date night', 'Hidden gem', 'Chill', 'Adventurous'
]