import { useState, useEffect } from "react"
import { supabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

/**
 * 認証状態を管理するフック
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 現在のセッションを取得
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (redirectPath?: string) => {
    try {
      const currentPath = redirectPath || window.location.pathname
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
          scopes: "https://www.googleapis.com/auth/calendar.events",
        },
      })
      if (error) {
        console.error("Error signing in:", error)
        throw error
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      throw err
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
        throw error
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      throw err
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }
}

