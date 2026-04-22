import { useEffect, useState } from 'react'
// import { User } from '@supabase/supabase-js'
// import { supabase } from '@/integrations/supabase/client'
// TODO: Replace with API calls to backend server when ready

interface Props {
  user: User | null
  authLoading: boolean
}

export function useProfileSetup({ user, authLoading }: Props) {
  const [setupDone, setSetupDone] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }

    supabase
      .from('profiles')
      .select('profile_setup_completed')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setSetupDone(data?.profile_setup_completed === true)
        setLoading(false)
      })
  }, [user, authLoading])

  return { setupDone, loading }
}