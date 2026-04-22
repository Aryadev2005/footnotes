import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
// import { supabase } from '@/integrations/supabase/client'
// TODO: Replace with API calls to backend server when ready

export function useActivity() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['activity', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from('activity' as any)
        .select('*')
        .eq('target_user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) return []
      return data ?? []
    },
  })
}