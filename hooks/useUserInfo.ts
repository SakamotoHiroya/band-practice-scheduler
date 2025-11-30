import { useMemo } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export interface UserInfo {
  displayName: string
  email: string | null
  avatarUrl: string | null
  isGoogleUser: boolean
}

/**
 * ユーザー情報を整形して取得するフック
 */
export function useUserInfo(user: SupabaseUser | null): UserInfo | null {
  return useMemo(() => {
    if (!user) return null

    const displayName = user.user_metadata?.full_name || user.email || "ユーザー"
    const email = user.email || null
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    const isGoogleUser = user.app_metadata?.provider === "google" || !!user.user_metadata?.provider

    return {
      displayName,
      email,
      avatarUrl,
      isGoogleUser,
    }
  }, [user])
}

