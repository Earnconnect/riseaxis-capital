import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  // loading = true only until we know whether a session exists.
  // Profile fetching is non-blocking — happens in the background.
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (data) setProfile(data as Profile)
    } catch {
      // silently ignore — profile table may not exist or be inaccessible
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    // Safety net: if getSession() hangs more than 4s, unblock the UI
    const hardStop = setTimeout(() => setLoading(false), 4000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(hardStop)
        setSession(session)
        setUser(session?.user ?? null)
        // Unblock the UI immediately — don't wait for profile
        setLoading(false)
        if (session?.user) fetchProfile(session.user.id)
      })
      .catch(() => {
        clearTimeout(hardStop)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'user',
      })
    }
    return { error: error as Error | null }
  }

  async function signOut() {
    setUser(null)
    setSession(null)
    setProfile(null)
    setLoading(false)
    supabase.auth.signOut().catch(() => {})
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, isAdmin, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
