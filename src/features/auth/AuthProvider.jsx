import { useEffect, useMemo, useState } from 'react'
import { getSupabaseConfigError, supabase } from '../../lib/supabase'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const configError = getSupabaseConfigError()
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(supabase))

  useEffect(() => {
    if (!supabase) return undefined

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      configError,
      async signIn(email, password) {
        if (!supabase) throw new Error(configError)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
      },
      async signOut() {
        if (!supabase) throw new Error(configError)
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
    }),
    [session, user, loading, configError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
