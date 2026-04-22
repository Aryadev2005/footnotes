export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Place {
  id: string
  name: string
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  category: string | null
  created_at: string
}

export interface Log {
  id: string
  user_id: string
  place_id: string
  rating: number | null
  review: string | null
  visited_at: string
  photo_url: string | null
  is_public: boolean
  created_at: string
  // joined data (from queries)
  profiles?: Profile
  places?: Place
  likes?: { count: number }[]
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}