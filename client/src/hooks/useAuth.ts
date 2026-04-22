import { useEffect, useState } from 'react'
// import { User } from '@supabase/supabase-js'
// import { supabase } from '@/integrations/supabase/client'
// TODO: Replace with API calls to backend server when ready

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setDisplayName(null); setAvatarUrl(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', userId)
      .maybeSingle()
    setDisplayName(data?.display_name ?? null)
    setAvatarUrl(data?.avatar_url ?? null)
    setLoading(false)
  }

  const signOut = () => supabase.auth.signOut()

  return { user, loading, displayName, avatarUrl, signOut }
}