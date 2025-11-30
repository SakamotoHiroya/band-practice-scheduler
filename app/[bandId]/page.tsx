"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ScheduleHeader } from "@/components/schedule-header"
import { ScheduleGrid } from "@/components/schedule-grid"
import { BandParticipationModal } from "@/components/BandParticipationModal"
import { DisplayNameDialog } from "@/components/display-name-dialog"
import { CreateBandModal } from "@/components/CreateBandModal"
import { ToastContainer, useToast } from "@/components/toast"
import { useAuth } from "@/hooks/useAuth"
import { useActor } from "@/hooks/useActor"
import { useBand } from "@/hooks/useBand"
import { useSchedule } from "@/hooks/useSchedule"
import { removeMemberFromBand, createBand } from "@/services/bandService"
import { addEventToGoogleCalendar } from "@/services/calendarService"
import type { Member, Slot } from "@/lib/types"

/**
 * バンドの予定調整ページ
 * 認証、アクター、バンド、スケジュールの状態を統合的に管理
 */
export default function BandPage() {
  const params = useParams()
  const router = useRouter()
  const bandId = params?.bandId ? parseInt(params.bandId as string, 10) : null

  // 認証状態
  const { user, loading: authLoading, login, logout, isAuthenticated } = useAuth()

  // アクター状態
  const {
    actor,
    actorLoading,
    isActorInBand,
    showDisplayNameDialog,
    handleDisplayNameSave,
    handleGuestSelected: originalHandleGuestSelected,
    resetActor,
    isParticipating,
    startParticipating,
  } = useActor(bandId)

  // バンド状態
  const { bands, selectedBand, loading: bandLoading, handleBandChange, refreshBands } =
    useBand(bandId)

  // handleGuestSelectedをラップして、バンド情報を再取得する
  const handleGuestSelected = useCallback(
    async (actorId: number) => {
      await originalHandleGuestSelected(actorId)
      // データベースの反映を待ってからバンド情報を再取得
      await new Promise((resolve) => setTimeout(resolve, 500))
      await refreshBands()
    },
    [originalHandleGuestSelected, refreshBands]
  )

  // handleDisplayNameSaveをラップして、バンド情報を再取得する
  const handleDisplayNameSaveWrapped = useCallback(
    async (displayName: string) => {
      await handleDisplayNameSave(displayName)
      // データベースの反映を待ってからバンド情報を再取得
      await new Promise((resolve) => setTimeout(resolve, 500))
      await refreshBands()
    },
    [handleDisplayNameSave, refreshBands]
  )

  // スケジュール状態
  const {
    schedules,
    lockedSlots,
    periods,
    dateRange,
    loading: scheduleLoading,
    error: scheduleError,
    toggleSlot,
    toggleLockSlot,
    goToPreviousWeek,
    goToNextWeek,
    refresh: refreshSchedule,
  } = useSchedule(selectedBand, actor)

  // UI状態
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [showCreateBandModal, setShowCreateBandModal] = useState(false)
  const [isCreatingBand, setIsCreatingBand] = useState(false)
  const { toasts, showToast, removeToast } = useToast()

  // テーマをDOMに適用
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  // ログアウト時にactorをリセット
  useEffect(() => {
    if (!isAuthenticated) {
      resetActor()
    }
  }, [isAuthenticated, resetActor])

  // 選択されたバンドの最初のメンバーを選択
  useEffect(() => {
    if (selectedBand && selectedBand.members.length > 0) {
      setSelectedMember(selectedBand.members[0])
    } else {
      setSelectedMember(null)
    }
  }, [selectedBand])

  /**
   * ログイン処理
   */
  const handleLogin = useCallback(async () => {
    // 参加処理を開始（モーダルを閉じる）
    startParticipating()
    try {
      await login()
    } catch (err) {
      console.error("Login error:", err)
    }
  }, [login, startParticipating])

  /**
   * ログアウト処理
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      resetActor()
    } catch (err) {
      console.error("Logout error:", err)
    }
  }, [logout, resetActor])

  /**
   * メンバー削除処理
   */
  const handleRemoveMember = useCallback(
    async (memberId: number) => {
      if (!selectedBand || !user) {
        return
      }

      if (!confirm("このメンバーをバンドから削除しますか？")) {
        return
      }

      const result = await removeMemberFromBand(selectedBand.id, memberId)
      if (!result.success) {
        alert(result.error || "メンバーの削除に失敗しました")
        return
      }

      // バンド情報を再取得
      await refreshBands()
      // スケジュールも再取得
      refreshSchedule()
    },
    [selectedBand, user, refreshBands, refreshSchedule]
  )

  /**
   * Googleカレンダーへのエクスポート
   */
  const exportToGoogleCalendar = useCallback(
    async (slot: Slot) => {
      if (!selectedBand || !user) return

      const result = await addEventToGoogleCalendar(slot, selectedBand.name)
      if (result.success) {
        showToast("カレンダーに追加しました", "success")
      } else {
        if (result.error?.includes("アクセス許可")) {
          showToast(result.error, "error")
          await handleLogin()
        } else {
          showToast(result.error || "カレンダーへの追加に失敗しました", "error")
        }
      }
    },
    [selectedBand, user, handleLogin, showToast]
  )

  /**
   * Googleカレンダーからのインポート（未実装）
   */
  const importFromGoogleCalendar = useCallback((memberId: number) => {
    // TODO: Implement Google Calendar API integration
    console.log("Import from Google Calendar for member:", memberId)
    alert(`${memberId} の Google カレンダーから空き時間をインポートします`)
  }, [])

  /**
   * バンド作成モーダルを開く
   */
  const handleOpenCreateBandModal = useCallback(() => {
    setShowCreateBandModal(true)
  }, [])

  /**
   * バンド作成モーダルを閉じる
   */
  const handleCloseCreateBandModal = useCallback(() => {
    setShowCreateBandModal(false)
  }, [])

  /**
   * バンド作成処理
   */
  const handleCreateBand = useCallback(
    async (bandName: string) => {
      setIsCreatingBand(true)
      try {
        const result = await createBand(bandName.trim())
        if (!result.success) {
          showToast(result.error || "バンドの作成に失敗しました", "error")
          setIsCreatingBand(false)
          return
        }

        if (result.bandId) {
          // 新しいバンドにリダイレクト
          router.push(`/${result.bandId}`)
        }
      } catch (err) {
        console.error("Error creating band:", err)
        showToast("エラーが発生しました", "error")
        setIsCreatingBand(false)
      }
    },
    [router, showToast]
  )

  /**
   * 参加モーダルの表示条件
   * 
   * 表示する条件:
   * 1. bandIdが確定している（URLから取得できている）
   * 2. アクターが未設定、またはバンドに参加していない場合
   * 
   * 注意: ローディング状態は待たない（bandIdが確定したら即座に表示）
   */
  const showActorModal = useMemo(() => {
    // 参加処理中はモーダルを表示しない
    if (isParticipating) {
      return false
    }

    // bandIdが確定しているか（URLから取得できている）
    const hasBandId = bandId !== null

    // アクターが未設定、またはバンドに参加していない
    const needsParticipation =
      !actor || // アクターが未設定（ローディング中でも表示）
      (actor && bandId !== null && isActorInBand === false) || // バンドに参加していない
      (actor && bandId !== null && isActorInBand === null && !actorLoading) // バンド参加状態が未確認で、アクターのローディングが完了

    const shouldShow = hasBandId && needsParticipation

    return shouldShow
  }, [bandId, actor, isActorInBand, actorLoading, isParticipating])

  // メインコンテンツの表示条件
  const canShowContent = actor && selectedBand && selectedMember && periods.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* 通知 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* 表示名設定ダイアログ */}
      <DisplayNameDialog open={showDisplayNameDialog} onSave={handleDisplayNameSaveWrapped} />

      {/* バンド作成モーダル */}
      <CreateBandModal
        open={showCreateBandModal}
        onClose={handleCloseCreateBandModal}
        onCreate={handleCreateBand}
        loading={isCreatingBand}
      />

      {/* バンド参加モーダル */}
      <BandParticipationModal
        open={showActorModal}
        onLogin={handleLogin}
        onGuestSelected={handleGuestSelected}
        bandId={bandId}
        isLoggedIn={isAuthenticated}
        actorId={actor?.id || null}
      />

      {/* ヘッダー */}
      {actor && (
        <ScheduleHeader
          bands={bands}
          selectedBand={selectedBand}
          onBandChange={handleBandChange}
          theme={theme}
          onThemeChange={setTheme}
          onCreateBand={handleOpenCreateBandModal}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          loading={authLoading || bandLoading || scheduleLoading}
        />
      )}

      {/* メインコンテンツ */}
      {canShowContent ? (
        <main className="container mx-auto px-4 py-4 sm:py-6">
          {/* エラー表示 */}
          {scheduleError && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              <p className="text-sm font-medium">{scheduleError}</p>
            </div>
          )}

          {/* 期間データが空の場合の警告 */}
          {!scheduleError && periods.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-500/20">
              <p className="text-sm font-medium">期間データが見つかりませんでした</p>
              <p className="text-xs mt-1 text-yellow-600 dark:text-yellow-500">
                period_timesテーブルにデータが存在するか確認してください。
              </p>
            </div>
          )}

          {/* スケジュールグリッド */}
          {periods.length > 0 ? (
            <ScheduleGrid
              schedules={schedules}
              dateRange={dateRange}
              periods={periods}
              selectedBand={selectedBand}
              selectedMember={selectedMember}
              onToggleSlot={toggleSlot}
              lockedSlots={lockedSlots}
              onToggleLock={toggleLockSlot}
              onExportToCalendar={exportToGoogleCalendar}
              onImportFromCalendar={importFromGoogleCalendar}
              onRemoveMember={handleRemoveMember}
              canRemoveMembers={isAuthenticated}
              currentActorId={actor?.id || null}
              isLoggedIn={isAuthenticated}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">期間データが取得できませんでした</p>
              <p className="text-sm text-muted-foreground">
                period_timesテーブルにデータが存在するか確認してください
              </p>
            </div>
          )}
        </main>
      ) : (
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            {authLoading || bandLoading || scheduleLoading ? (
              <>
                <p className="text-muted-foreground mb-2">データを読み込み中...</p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">データの準備ができていません</p>
                <p className="text-sm text-muted-foreground">
                  {!actor && "アクターを選択してください"}
                  {actor && !selectedBand && "バンドを選択してください"}
                  {actor && selectedBand && !selectedMember && "メンバーを選択してください"}
                  {actor && selectedBand && selectedMember && periods.length === 0 &&
                    "期間データが取得できませんでした"}
                </p>
              </>
            )}
          </div>
        </main>
      )}
    </div>
  )
}
