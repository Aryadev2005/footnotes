import { useQuery } from '@tanstack/react-query'
// import { supabase } from '@/integrations/supabase/client'
// TODO: Replace with API calls to backend server when ready

export function useLogs(userId?: string) {
  console.log('useLogs called with userId:', userId)
  return useQuery({
    queryKey: ['logs', userId],
    queryFn: async () => {
      let query = supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        console.log('Filtering logs by user_id:', userId)
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error
      console.log('useLogs query result:', { userId, dataLength: data?.length, data })

      const transformedLogs = (data ?? []).map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        placeName: log.place_name ?? '',
        area: log.area ?? '',
        note: log.note ?? '',
        rating: log.rating ?? 0,
        vibe: log.vibe ?? '',
        photo: log.photo_url ?? null,
        timestamp: new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        friendName: 'Unknown',
        friendAvatar: '?',
        friendUsername: '',
        avatarUrl: null,
      }))
      console.log('useLogs transformed result:', transformedLogs)
      return transformedLogs
    },
  })
}
export async function createLog(log: {
  user_id?: string;
  author_name: string;
  author_avatar: string;
  place_id?: string | null;
  place_name: string;
  area: string;
  note: string;
  vibe: string;
  photo_url?: string | null;
}) {
  console.log('createLog input:', log)
  const { data, error } = await supabase
    .from('logs')
    .insert([log])
    .select()
    .single();
  if (error) throw error;
  console.log('createLog output:', data)
  return data;
}