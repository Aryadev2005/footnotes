import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
// import { supabase } from '@/integrations/supabase/client'
// TODO: Replace with API calls to backend server when ready

export function useJournal(vibeFilter?: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['journal', user?.id, vibeFilter],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from('logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (vibeFilter) query = query.eq('vibe', vibeFilter)

      const { data, error } = await query
      if (error) throw error

      return (data ?? []).map((log: any) => ({
        id: log.id,
        placeName: log.place_name ?? '',
        area: log.area ?? '',
        note: log.review ?? '',
        rating: log.rating ?? 0,
        vibe: log.vibe ?? '',
        date: new Date(log.visited_at ?? log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      }))
    },
  })
}