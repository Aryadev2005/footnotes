import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
// import type { Tables } from '@/integrations/supabase/types'
// TODO: Replace with API calls to backend server when ready

export function useFriendships() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['friendships', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<{ user_id: string; friend_id: string }[]> => {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`)
      if (error) throw error
      return (data ?? []).map((f: any) => ({
        user_id: f.user_id,
        friend_id: f.friend_id,
      }))
    },
  })
}

export function useIsFriend(targetUserId?: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['is-friend', user?.id, targetUserId],
    enabled: !!user && !!targetUserId,
    queryFn: async (): Promise<boolean> => {
      const { data } = await supabase
        .from('friendships')
        .select('user_id')
        .eq('user_id', user!.id)
        .eq('friend_id', targetUserId!)
        .maybeSingle()
      return !!data
    },
  })
}

export function useAddFriend() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { error } = await supabase.from('friendships').insert({ user_id: user!.id, friend_id: targetId })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friendships'] }),
  })
}

export function useRemoveFriend() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { error } = await supabase.from('friendships').delete().eq('user_id', user!.id).eq('friend_id', targetId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friendships'] }),
  })
}