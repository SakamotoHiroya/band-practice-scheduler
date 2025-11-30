"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogIn, X } from "lucide-react"
import { fetchGuestActorsInBand, createGuestActor } from "@/services/actorService"
import { addActorToBand } from "@/services/bandMemberService"
import { supabaseClient } from "@/lib/supabase"

interface GuestActor {
  id: number
  display_name: string | null
}

interface BandParticipationModalProps {
  open: boolean
  onLogin: () => void
  onGuestSelected: (actorId: number) => void
  bandId: number | null
  isLoggedIn: boolean
  actorId: number | null
}

export function BandParticipationModal({
  open,
  onLogin,
  onGuestSelected,
  bandId,
  isLoggedIn,
  actorId,
}: BandParticipationModalProps) {
  const [guestName, setGuestName] = useState("")
  const [selectedActorId, setSelectedActorId] = useState<string>("")
  const [guests, setGuests] = useState<GuestActor[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const isCreatingRef = useRef(false) // 重複実行防止用のフラグ

  const fetchGuestActors = useCallback(async () => {
    if (!bandId) {
      setGuests([])
      return
    }

    try {
      const guestActors = await fetchGuestActorsInBand(bandId)
      console.log("Fetched guest actors:", guestActors)
      setGuests(guestActors)
    } catch (err) {
      console.error("Error fetching guest actors:", err)
      setGuests([])
    }
  }, [bandId])

  useEffect(() => {
    if (open && bandId) {
      fetchGuestActors()
    }
  }, [open, bandId, fetchGuestActors])

  const handleCreateGuest = async () => {
    if (!guestName.trim() || !bandId) return

    // 重複実行を防ぐ
    if (isCreatingRef.current) {
      console.log("Guest creation already in progress, skipping...")
      return
    }

    isCreatingRef.current = true
    setLoading(true)
    setIsCreatingNew(true)

    try {
      // ゲストアクターを作成
      const actor = await createGuestActor(guestName.trim())
      if (!actor) {
        alert("ゲストの作成に失敗しました")
        setLoading(false)
        setIsCreatingNew(false)
        isCreatingRef.current = false
        return
      }

      // バンドに追加
      const result = await addActorToBand(actor.id, bandId)
      if (!result.success) {
        alert(result.error || "バンドへの参加に失敗しました")
        setLoading(false)
        setIsCreatingNew(false)
        isCreatingRef.current = false
        return
      }

      // リトライロジックで確認
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const { data: verifyData, error: verifyError } = await supabaseClient
          .from("band-members")
          .select("id, is_active")
          .eq("actor_id", actor.id)
          .eq("band_id", bandId)
          .eq("is_active", true)
          .limit(1)

        if (!verifyError && verifyData && verifyData.length > 0) {
          setGuestName("")
          setIsCreatingNew(false)
          setLoading(false)
          isCreatingRef.current = false
          // データベースの反映を待ってからゲスト一覧を再取得
          console.log("Refreshing guest list after creation, actor.id:", actor.id)
          await new Promise((resolve) => setTimeout(resolve, 500))
          await fetchGuestActors()
          console.log("Guest list refreshed, current guests state:", guests)
          // もう一度少し待ってから再度取得（念のため）
          await new Promise((resolve) => setTimeout(resolve, 300))
          await fetchGuestActors()
          console.log("Guest list refreshed again, calling onGuestSelected")
          onGuestSelected(actor.id)
          return
        }
      }

      alert("参加の確認に失敗しました。しばらく待ってから再度お試しください。")
      setLoading(false)
      setIsCreatingNew(false)
      isCreatingRef.current = false
    } catch (err) {
      console.error("Error creating guest:", err)
      alert("エラーが発生しました")
      setLoading(false)
      setIsCreatingNew(false)
      isCreatingRef.current = false
    }
  }

  const handleSelectGuest = async () => {
    if (!selectedActorId || !bandId) return

    const actorId = parseInt(selectedActorId, 10)
    setLoading(true)

    try {
      // バンドに追加（既存の場合は再アクティブ化）
      const result = await addActorToBand(actorId, bandId)
      if (!result.success) {
        alert(result.error || "バンドへの参加に失敗しました")
        setLoading(false)
        return
      }

      // リトライロジックで確認
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const { data: verifyData, error: verifyError } = await supabaseClient
          .from("band-members")
          .select("id, is_active")
          .eq("actor_id", actorId)
          .eq("band_id", bandId)
          .eq("is_active", true)
          .limit(1)

        if (!verifyError && verifyData && verifyData.length > 0) {
          setSelectedActorId("")
          setLoading(false)
          onGuestSelected(actorId)
          return
        }
      }

      alert("参加の確認に失敗しました。しばらく待ってから再度お試しください。")
      setLoading(false)
    } catch (err) {
      console.error("Error selecting guest:", err)
      alert("エラーが発生しました")
      setLoading(false)
    }
  }

  const handleParticipate = async () => {
    if (isLoggedIn && actorId && bandId) {
      // ログイン済みユーザーの参加処理
      setLoading(true)
      try {
        const result = await addActorToBand(actorId, bandId)
        if (!result.success) {
          alert(result.error || "バンドへの参加に失敗しました")
          setLoading(false)
          return
        }
        onGuestSelected(actorId)
        setLoading(false)
      } catch (err) {
        console.error("Error participating:", err)
        alert("エラーが発生しました")
        setLoading(false)
      }
    }
  }

  const clearInput = () => {
    setGuestName("")
    setSelectedActorId("")
    setIsCreatingNew(false)
  }

  return (
    <Dialog open={open}>
      <DialogContent className="w-[95vw] sm:max-w-[425px] z-[101]">
        <DialogHeader>
          <DialogTitle>バンドへ参加</DialogTitle>
          <DialogDescription>
            {isLoggedIn
              ? "このバンドに参加しますか？"
              : "Googleアカウントでログインするか、ゲストとして参加してください"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!isLoggedIn && (
            <>
              <Button onClick={onLogin} className="w-full" variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Googleアカウントでログイン
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-border"></div>
                <span className="text-sm text-muted-foreground">もしくは</span>
                <div className="flex-1 border-t border-border"></div>
              </div>

              <div className="flex items-center gap-2">
                {!isCreatingNew ? (
                  <Select
                    value={selectedActorId}
                    onValueChange={(value) => {
                      if (value === "new") {
                        setIsCreatingNew(true)
                        setSelectedActorId("")
                      } else {
                        setSelectedActorId(value)
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="ゲスト" />
                    </SelectTrigger>
                    <SelectContent className="z-[102]">
                      {guests.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id.toString()}>
                          {guest.display_name || `ゲスト${guest.id}`}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">新規作成</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="text"
                    placeholder="名前を入力"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && guestName.trim()) {
                        handleCreateGuest()
                      }
                    }}
                    autoFocus
                  />
                )}
                <Button
                  onClick={isCreatingNew ? handleCreateGuest : handleSelectGuest}
                  disabled={
                    isCreatingNew
                      ? !guestName.trim() || loading
                      : !selectedActorId || loading
                  }
                  className="shrink-0"
                >
                  {loading
                    ? "参加中..."
                    : isCreatingNew
                      ? "として参加"
                      : "として参加"}
                </Button>
                {isCreatingNew && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsCreatingNew(false)
                      setGuestName("")
                    }}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}

          {isLoggedIn && (
            <Button onClick={handleParticipate} disabled={loading} className="w-full">
              {loading ? "参加中..." : "参加"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

