import { useQuery } from '@tanstack/react-query'
// import { supabase } from '@/integrations/supabase/client'
// TODO: Replace with API calls to backend server when ready

export function usePlaces(category?: string) {
  return useQuery({
    queryKey: ['places', category],
    queryFn: async () => {
      let query = supabase.from('places').select('*').order('created_at', { ascending: false })
      if (category && category !== 'All') query = query.eq('category', category)
      const { data, error } = await query
      if (error) throw error
      return (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        area: p.area ?? '',
        category: p.category ?? '',
        description: p.description ?? '',
        image: p.image_url ?? null,
        city: p.city ?? '',
      }))
    },
  })
}

export function useNewPlaces() {
  return useQuery({
    queryKey: ['places-new'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)
      if (error) throw error
      return (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        area: p.area ?? '',
        category: p.category ?? '',
        description: p.description ?? '',
        image: p.image_url ?? null,
        city: p.city ?? '',
      }))
    },
  })
}