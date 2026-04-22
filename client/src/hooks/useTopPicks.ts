import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { supabase } from '@/integrations/supabase/client'
// import type { Tables } from '@/integrations/supabase/types'
// TODO: Replace with API calls to backend server when ready

export type TopPickCategory = 'cafe' | 'restaurant' | 'spot' | 'park'

export function useTopPicks(userId?: string) {
  return useQuery({
    queryKey: ['top-picks', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Tables<'user_top_picks'>[]> => {
      const { data, error } = await supabase
        .from('user_top_picks')
        .select('*')
        .eq('user_id', userId!)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAddTopPick() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pick: { user_id: string; category: TopPickCategory; place_name: string; area?: string }) => {
      const { error } = await supabase.from('user_top_picks').insert(pick)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['top-picks'] }),
  })
}

export function useDeleteTopPick() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_top_picks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['top-picks'] }),
  })
}