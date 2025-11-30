"use client"

import { useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { ScheduleHeader } from "@/components/schedule-header"
import { BandParticipationModal } from "@/components/BandParticipationModal"
import { DisplayNameDialog } from "@/components/display-name-dialog"
import { CreateBandModal } from "@/components/CreateBandModal"
import { ToastContainer, useToast } from "@/components/toast"
import { LoadingIndicator } from "@/components/LoadingIndicator"
import { DataNotReadyMessage } from "@/components/DataNotReadyMessage"
import { ScheduleContent } from "@/components/ScheduleContent"
import { useAuth } from "@/hooks/useAuth"
import { useActor } from "@/hooks/useActor"
import { useBand } from "@/hooks/useBand"
import { useSchedule } from "@/hooks/useSchedule"
import { useCreateBand } from "@/hooks/useCreateBand"
import { useTheme } from "@/hooks/useTheme"
import { useMemberManagement } from "@/hooks/useMemberManagement"
import { useCalendar } from "@/hooks/useCalendar"
import { useMemberSelection } from "@/hooks/useMemberSelection"
import type { Slot } from "@/lib/types"

/**
 * バンドの予定調整ページ
 * 認証、アクター、バンド、スケジュールの状態を統合的に管理
 */
export default function BandPage() {
  const params = useParams()
  const bandId = params?.bandId ? parseInt(params.bandId as string, 10) : null

  // 認証状態
  const { user, loading: authLoading, login, logout, isAuthenticated } = useAuth()

  // アクター状態
  const {
    actor,
    actorLoading,
    isActorInBand,
    showDisplayNameDialog,
    handleDisplayNameSave: originalHandleDisplayNameSave,
    handleGuestSelected: originalHandleGuestSelected,
    resetActor,
    isParticipating,
    startParticipating,
    showActorModal,
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
      await originalHandleDisplayNameSave(displayName)
      // データベースの反映を待ってからバンド情報を再取得
      await new Promise((resolve) => setTimeout(resolve, 500))
      await refreshBands()
    },
    [originalHandleDisplayNameSave, refreshBands]
  )

  // スケジュール状態
  const {
    schedules,
    lockedSlots,
    periods,
    dateRange,
    loading: scheduleLoading,
    error: scheduleError,
    startDayOfWeek,
    setStartDayOfWeek,
    toggleSlot,
    toggleLockSlot,
    goToPreviousWeek,
    goToNextWeek,
    goToPreviousDay,
    goToNextDay,
    refresh: refreshSchedule,
  } = useSchedule(selectedBand, actor)

  // UI状態
  const { toasts, showToast, removeToast } = useToast()
  
  // バンド作成機能
  const {
    showCreateBandModal,
    isCreatingBand,
    handleOpenCreateBandModal,
    handleCloseCreateBandModal,
    handleCreateBand,
  } = useCreateBand()

  // テーマ管理
  const { theme, setTheme } = useTheme()

  // メンバー選択
  const { selectedMember, setSelectedMember } = useMemberSelection(selectedBand)

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

  // メンバー管理
  const { handleRemoveMember } = useMemberManagement(
    selectedBand,
    refreshBands,
    refreshSchedule
  )

  // カレンダー連携
  const { exportToGoogleCalendar, importFromGoogleCalendar } = useCalendar(
    selectedBand,
    user,
    handleLogin,
    showToast
  )

  // ログアウト時にactorをリセット
  useEffect(() => {
    if (!isAuthenticated) {
      resetActor()
    }
  }, [isAuthenticated, resetActor])

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
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          onLogout={handleLogout}
          loading={authLoading || bandLoading || scheduleLoading}
        />
      )}

      {/* メインコンテンツ */}
      {canShowContent ? (
        <ScheduleContent
          scheduleError={scheduleError}
          periods={periods}
          schedules={schedules}
          dateRange={dateRange}
          selectedBand={selectedBand}
          selectedMember={selectedMember}
          lockedSlots={lockedSlots}
          onToggleSlot={toggleSlot}
          onToggleLock={toggleLockSlot}
          onExportToCalendar={exportToGoogleCalendar}
          onImportFromCalendar={importFromGoogleCalendar}
          onRemoveMember={handleRemoveMember}
          canRemoveMembers={isAuthenticated}
          currentActorId={actor?.id || null}
          isLoggedIn={isAuthenticated}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
          startDayOfWeek={startDayOfWeek}
          setStartDayOfWeek={setStartDayOfWeek}
        />
      ) : (
        <main className="container mx-auto px-4 py-12">
          {authLoading || bandLoading || scheduleLoading ? (
            <LoadingIndicator message="データを読み込み中..." />
          ) : (
            <DataNotReadyMessage
              actor={actor}
              selectedBand={selectedBand}
              selectedMember={selectedMember}
              periodsLength={periods.length}
            />
          )}
        </main>
      )}
    </div>
  )
}
