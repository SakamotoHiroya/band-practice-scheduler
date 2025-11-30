"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Music, Plus, LogIn, LogOut, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"
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
  onLogin,
  onLogout,
  loading,
}: ScheduleHeaderProps) {
  const cycleTheme = () => {
    onThemeChange(theme === "light" ? "dark" : "light")
  }

  const ThemeIcon = theme === "light" ? Sun : Moon

  return (
    <header className="bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">BandScheduler</h1>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>•</span>
              <span>{"軽音部 練習調整"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
              <SelectTrigger id="band-select" className="w-full sm:w-[180px]">
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

            <Button variant="outline" size="sm" onClick={cycleTheme} className="gap-2 bg-transparent">
              <ThemeIcon className="h-4 w-4" />
              <span className="hidden sm:inline capitalize">{theme}</span>
            </Button>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">
                        {user.user_metadata?.full_name || user.email || "ユーザー"}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">ログアウト</span>
                    </Button>
                  </div>
                ) : (
                  <Button variant="default" size="sm" onClick={onLogin} className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Googleでログイン</span>
                    <span className="sm:hidden">ログイン</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
