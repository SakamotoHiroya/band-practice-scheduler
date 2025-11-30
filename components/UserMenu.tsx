"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, LogOut, Home, X } from "lucide-react"
import { useUserInfo } from "@/hooks/useUserInfo"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserMenuProps {
  user: SupabaseUser | null
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

/**
 * ユーザーメニューコンポーネント
 * 右端からスライドインするメニュー
 */
export function UserMenu({ user, isOpen, onClose, onLogout }: UserMenuProps) {
  const router = useRouter()
  const userInfo = useUserInfo(user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ESCキーでメニューを閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // メニューが開いている時は背景のスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!mounted || !isOpen || !userInfo) return null

  const handleGoToHome = () => {
    onClose()
    router.push("/")
  }

  const handleLogout = () => {
    onClose()
    onLogout()
  }

  const menuContent = (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* メニュー */}
      <div className="fixed right-0 top-0 h-full w-[320px] max-w-[85vw] bg-card border-l shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">メニュー</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="メニューを閉じる"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ユーザー情報 */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            {userInfo.avatarUrl ? (
              <img
                src={userInfo.avatarUrl}
                alt={userInfo.displayName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {userInfo.displayName}
              </p>
              {userInfo.email && (
                <p className="text-sm text-muted-foreground truncate">
                  {userInfo.email}
                </p>
              )}
              {userInfo.isGoogleUser && (
                <p className="text-xs text-muted-foreground mt-1">
                  Googleでログイン済み
                </p>
              )}
            </div>
          </div>
        </div>

        {/* メニュー項目 */}
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={handleGoToHome}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Home className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">バンド一覧</span>
          </button>
        </div>

        {/* フッター */}
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>ログアウト</span>
          </Button>
        </div>
      </div>
    </>
  )

  return createPortal(menuContent, document.body)
}

