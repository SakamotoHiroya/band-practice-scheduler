"use client"

import { useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Music, Plus, LogIn, User, Github } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/UserMenu"
import { useUserInfo } from "@/hooks/useUserInfo"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Member, Band } from "@/lib/types"

interface ScheduleHeaderProps {
  bands: Band[]
  selectedBand: Band | null
  onBandChange: (band: Band) => void
  theme: "light" | "dark"
  onThemeChange: (theme: "light" | "dark") => void
  onCreateBand: () => void
  user: SupabaseUser | null
  isAuthenticated: boolean
  onLogin: () => void
  onLogout: () => void
  loading: boolean
}

export function ScheduleHeader({
  bands,
  selectedBand,
  onBandChange,
  theme,
  onThemeChange,
  onCreateBand,
  user,
  isAuthenticated,
  onLogin,
  onLogout,
  loading,
}: ScheduleHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userInfo = useUserInfo(user)

  const cycleTheme = () => {
    onThemeChange(theme === "light" ? "dark" : "light")
  }

  const ThemeIcon = theme === "light" ? Sun : Moon

  const handleUserInfoClick = () => {
    setIsUserMenuOpen(true)
  }

  const handleCloseUserMenu = () => {
    setIsUserMenuOpen(false)
  }

  return (
    <header className="bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        {/* デスクトップレイアウト */}
        <div className="hidden sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 text-primary" />
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl cursor-pointer">BandScheduler</h1>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>•</span>
              <span>{"バンド練調整"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={cycleTheme} className="gap-2 bg-transparent">
              <ThemeIcon className="h-4 w-4" />
              <span className="capitalize">{theme}</span>
            </Button>

            <Link href="/contribute">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Github className="h-4 w-4" />
                <span>contribute</span>
              </Button>
            </Link>

            {isAuthenticated && (
              <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">{"バンド:"}</span>
            <Select
                  value={selectedBand?.id.toString() || ""}
              onValueChange={(value) => {
                if (value === "_create_new") {
                  onCreateBand()
                  return
                }
                    const band = bands.find((b) => b.id.toString() === value)
                if (band) onBandChange(band)
              }}
            >
                  <SelectTrigger id="band-select" className="w-[180px]">
                <SelectValue placeholder="バンドを選択" />
              </SelectTrigger>
              <SelectContent>
                {bands.map((band) => (
                      <SelectItem key={band.id} value={band.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      <span>{band.name}</span>
                      <span className="text-xs text-muted-foreground">({band.members.length}人)</span>
                    </div>
                  </SelectItem>
                ))}
                <Separator className="my-1" />
                <SelectItem value="_create_new" className="text-primary">
                  <div className="flex items-center gap-2 font-medium">
                    <Plus className="h-4 w-4" />
                    <span>{"新しいバンドを作成"}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
              </div>
            )}

            {!loading && (
              <>
                {user && userInfo ? (
                  <button
                    onClick={handleUserInfoClick}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span className="max-w-[120px] truncate">
                      {userInfo.displayName}
                    </span>
                    {userInfo.avatarUrl ? (
                      <img
                        src={userInfo.avatarUrl}
                        alt={userInfo.displayName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </button>
                ) : (
                  <Button variant="default" size="sm" onClick={onLogin} className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Googleでログイン</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* モバイルレイアウト */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* 1段目: BandScheduler(左端) | ユーザ情報とログアウトボタン(右端) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-primary" />
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-xl font-bold tracking-tight text-foreground cursor-pointer">BandScheduler</h1>
              </Link>
            </div>

            {!loading && (
              <>
                {user && userInfo ? (
                  <button
                    onClick={handleUserInfoClick}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span className="max-w-[100px] truncate">
                      {userInfo.displayName}
                    </span>
                    {userInfo.avatarUrl ? (
                      <img
                        src={userInfo.avatarUrl}
                        alt={userInfo.displayName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </button>
                ) : (
                  <Button variant="default" size="sm" onClick={onLogin} className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>ログイン</span>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* 2段目: バンド選択ボタン(左端) | テーマ選択ボタン, コントリビュートボタン(右端) */}
          <div className="flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">{"バンド:"}</span>
                <Select
                      value={selectedBand?.id.toString() || ""}
                  onValueChange={(value) => {
                    if (value === "_create_new") {
                      onCreateBand()
                      return
                    }
                        const band = bands.find((b) => b.id.toString() === value)
                    if (band) onBandChange(band)
                  }}
                >
                  <SelectTrigger id="band-select-mobile" className="w-[180px]">
                    <SelectValue placeholder="バンドを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {bands.map((band) => (
                          <SelectItem key={band.id} value={band.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" />
                          <span>{band.name}</span>
                          <span className="text-xs text-muted-foreground">({band.members.length}人)</span>
                        </div>
                      </SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <SelectItem value="_create_new" className="text-primary">
                      <div className="flex items-center gap-2 font-medium">
                        <Plus className="h-4 w-4" />
                        <span>{"新しいバンドを作成"}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onCreateBand}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>作成</span>
              </Button>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={cycleTheme} className="gap-2 bg-transparent">
                <ThemeIcon className="h-4 w-4" />
              </Button>

              <Link href="/contribute">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Github className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ユーザーメニュー */}
      <UserMenu
        user={user}
        isOpen={isUserMenuOpen}
        onClose={handleCloseUserMenu}
        onLogout={onLogout}
      />
    </header>
  )
}
