import { useState, useEffect, useCallback, useRef } from "react"
import { fetchPeriods } from "@/services/periodService"
import { fetchVotesAsSchedule } from "@/services/voteService"
import { fetchDecidedPeriods } from "@/services/decidedPeriodService"
import { addVote, removeVote } from "@/services/voteService"
import { addDecidedPeriod, removeDecidedPeriod } from "@/services/decidedPeriodService"
import { getWeekRange, getPreviousWeek, getNextWeek, formatDateToString } from "@/lib/utils/date"
import type { Band, Schedule, Period, Slot } from "@/lib/types"

interface ScheduleState {
  schedules: Schedule
  lockedSlots: Slot[]
  periods: Period[]
  dateRange: { start: Date; end: Date }
  loading: boolean
  error: string | null
}

interface PendingOperation {
  type: "vote" | "lock"
  key: string
  revert: () => void
}

/**
 * スケジュールの状態を管理するフック
 * データ取得、更新、楽観的更新を統合的に管理
 */
export function useSchedule(selectedBand: Band | null, actor: { id: number } | null) {
  const [state, setState] = useState<ScheduleState>({
    schedules: {},
    lockedSlots: [],
    periods: [],
    dateRange: getWeekRange(),
    loading: true,
    error: null,
  })

  // 楽観的更新のための保留中の操作を追跡
  const pendingOperationsRef = useRef<Map<string, PendingOperation>>(new Map())
  // データ取得のキャンセル用フラグ
  const isCancelledRef = useRef(false)

  /**
   * 期間データを取得
   */
  const loadPeriods = useCallback(async () => {
    try {
      const periodsData = await fetchPeriods()
      if (periodsData.length === 0) {
        // 期間データが空の場合は警告として扱い、エラーではなく警告メッセージを設定
        setState((prev) => ({
          ...prev,
          periods: [],
          error: null, // エラーではなく、空データとして扱う
        }))
        if (process.env.NODE_ENV === "development") {
          console.warn("期間データが見つかりませんでした。period_timesテーブルにデータが存在するか確認してください。")
        }
      } else {
        setState((prev) => ({ ...prev, periods: periodsData, error: null }))
      }
    } catch (err) {
      console.error("Error loading periods:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })
      setState((prev) => ({
        ...prev,
        error: "期間データの取得に失敗しました",
      }))
    }
  }, [])

  /**
   * 投票データを取得
   */
  const loadVotes = useCallback(
    async (band: Band, dateRange: { start: Date; end: Date }, periods: Period[]) => {
      if (periods.length === 0) return

      // キャンセルフラグをリセット
      isCancelledRef.current = false

      try {
        const memberIds = band.members.map((m) => m.id)
        if (memberIds.length === 0) {
          setState((prev) => ({ ...prev, schedules: {}, loading: false }))
          return
        }

        const votesData = await fetchVotesAsSchedule(
          memberIds,
          periods,
          dateRange.start,
          dateRange.end
        )

        // キャンセルされていない場合のみ状態を更新
        if (!isCancelledRef.current) {
          setState((prev) => ({
            ...prev,
            schedules: votesData,
            loading: false,
            error: null,
          }))
        }
      } catch (err) {
        // キャンセルされた場合は何もしない
        if (isCancelledRef.current) {
          return
        }
        console.error("Error loading votes:", err)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "投票データの取得に失敗しました",
        }))
      }
    },
    []
  )

  /**
   * 決定された期間を取得
   */
  const loadDecidedPeriods = useCallback(
    async (dateRange: { start: Date; end: Date }, periods: Period[], bandId: number | null) => {
      if (periods.length === 0 || !bandId) return

      try {
        const decidedData = await fetchDecidedPeriods(dateRange.start, dateRange.end, bandId)
        setState((prev) => ({ ...prev, lockedSlots: decidedData }))
      } catch (err) {
        console.error("Error loading decided periods:", err)
        setState((prev) => ({
          ...prev,
          error: "決定期間の取得に失敗しました",
        }))
      }
    },
    []
  )

  // 初期化: 期間データを取得
  useEffect(() => {
    loadPeriods()
  }, [loadPeriods])

  // バンドまたは日付範囲が変更されたらデータを再取得
  useEffect(() => {
    if (!selectedBand || state.periods.length === 0) {
      setState((prev) => ({ ...prev, loading: false }))
      return
    }

    // 前回のリクエストをキャンセル
    isCancelledRef.current = true

    setState((prev) => ({ ...prev, loading: true, error: null }))
    
    // 新しいリクエストを開始
    const fetchData = async () => {
      isCancelledRef.current = false
      await loadVotes(selectedBand, state.dateRange, state.periods)
      if (!isCancelledRef.current) {
        await loadDecidedPeriods(state.dateRange, state.periods, selectedBand.id)
      }
    }
    
    fetchData()
  }, [selectedBand, state.dateRange.start.getTime(), state.dateRange.end.getTime(), state.periods.length, loadVotes, loadDecidedPeriods])

  /**
   * スロットのトグル（投票の追加/削除）
   */
  const toggleSlot = useCallback(
    async (memberId: number, date: string, period: Period) => {
      if (!actor) {
        setState((prev) => ({
          ...prev,
          error: "アクターが設定されていません",
        }))
        return
      }

      const actorId = actor.id
      const periodKey = `${period.start}-${period.end}`
      const key = `${date}-${periodKey}`
      const operationKey = `vote-${key}`

      // ロックされているかチェック
      const isLocked = state.lockedSlots.some((slot) => {
        const slotDateStr = formatDateToString(slot.date)
        return slotDateStr === date && slot.period.id === period.id
      })

      if (isLocked) {
        setState((prev) => ({
          ...prev,
          error: "このスロットはロックされています",
        }))
        return
      }

      // 現在の状態を確認
      const currentSchedule = state.schedules[actorId.toString()] || {}
      const isCurrentlyVoted = currentSchedule[key] || false

      // 楽観的更新: 即座にUIを更新
      const previousSchedule = { ...state.schedules }
      setState((prev) => {
        const newSchedules = { ...prev.schedules }
        const memberSchedule = newSchedules[actorId.toString()] || {}
        newSchedules[actorId.toString()] = {
          ...memberSchedule,
          [key]: !memberSchedule[key],
        }
        return { ...prev, schedules: newSchedules, error: null }
      })

      // ロールバック関数
      const revert = () => {
        setState((prev) => ({ ...prev, schedules: previousSchedule }))
      }

      // 保留中の操作として記録
      pendingOperationsRef.current.set(operationKey, {
        type: "vote",
        key: operationKey,
        revert,
      })

      // サーバーに保存
      try {
        const dateObj = new Date(date)
        const result = isCurrentlyVoted
          ? await removeVote(actorId, period.id, dateObj)
          : await addVote(actorId, period.id, dateObj)

        // 保留中の操作を削除
        pendingOperationsRef.current.delete(operationKey)

        if (!result.success) {
          // エラー時はロールバック
          revert()
          setState((prev) => ({
            ...prev,
            error: result.error || "投票の保存に失敗しました",
          }))
        }
        // 成功時は楽観的更新をそのまま使用（再取得は不要）
        // 他のユーザーの変更を反映するために、定期的な再取得は別途実装
      } catch (err) {
        // 保留中の操作を削除
        pendingOperationsRef.current.delete(operationKey)
        // エラー時はロールバック
        revert()
        console.error("Unexpected error toggling vote:", err)
        setState((prev) => ({
          ...prev,
          error: "予期しないエラーが発生しました",
        }))
      }
    },
    [actor, state.schedules, state.lockedSlots, state.dateRange, state.periods, selectedBand, loadVotes, loadDecidedPeriods]
  )

  /**
   * スロットのロック/アンロック
   */
  const toggleLockSlot = useCallback(
    async (slot: Slot) => {
      const dateStr = formatDateToString(slot.date)
      const isCurrentlyLocked = state.lockedSlots.some((s) => {
        const sDateStr = formatDateToString(s.date)
        return sDateStr === dateStr && s.period.id === slot.period.id
      })

      const operationKey = `lock-${dateStr}-${slot.period.id}`

      // 楽観的更新: 即座にUIを更新
      const previousLockedSlots = [...state.lockedSlots]
      setState((prev) => {
        if (isCurrentlyLocked) {
          // ロックを解除
          const newLockedSlots = prev.lockedSlots.filter((s) => {
            const sDateStr = formatDateToString(s.date)
            return !(sDateStr === dateStr && s.period.id === slot.period.id)
          })
          return { ...prev, lockedSlots: newLockedSlots, error: null }
        } else {
          // ロックを追加
          return { ...prev, lockedSlots: [...prev.lockedSlots, slot], error: null }
        }
      })

      // ロールバック関数
      const revert = () => {
        setState((prev) => ({ ...prev, lockedSlots: previousLockedSlots }))
      }

      // 保留中の操作として記録
      pendingOperationsRef.current.set(operationKey, {
        type: "lock",
        key: operationKey,
        revert,
      })

      // サーバーに保存
      try {
        if (!selectedBand) {
          revert()
          setState((prev) => ({
            ...prev,
            error: "バンドが選択されていません",
          }))
          return
        }

        const result = isCurrentlyLocked
          ? await removeDecidedPeriod(slot.period.id, slot.date, selectedBand.id)
          : await addDecidedPeriod(slot.period.id, slot.date, selectedBand.id)

        // 保留中の操作を削除
        pendingOperationsRef.current.delete(operationKey)

        if (!result.success) {
          // エラー時はロールバック
          revert()
          setState((prev) => ({
            ...prev,
            error: result.error || "ロック状態の保存に失敗しました",
          }))
        } else {
          // 成功時はデータを再取得して最新状態を反映
          if (selectedBand) {
            await loadDecidedPeriods(state.dateRange, state.periods, selectedBand.id)
          }
        }
      } catch (err) {
        // 保留中の操作を削除
        pendingOperationsRef.current.delete(operationKey)
        // エラー時はロールバック
        revert()
        console.error("Unexpected error toggling lock:", err)
        setState((prev) => ({
          ...prev,
          error: "予期しないエラーが発生しました",
        }))
      }
    },
    [state.lockedSlots, state.dateRange, state.periods, selectedBand, loadDecidedPeriods]
  )

  /**
   * 前の週に移動
   */
  const goToPreviousWeek = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dateRange: getPreviousWeek(prev.dateRange),
      loading: true,
      error: null,
    }))
  }, [])

  /**
   * 次の週に移動
   */
  const goToNextWeek = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dateRange: getNextWeek(prev.dateRange),
      loading: true,
      error: null,
    }))
  }, [])

  /**
   * データを手動で再読み込み
   */
  const refresh = useCallback(() => {
    if (!selectedBand) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    loadVotes(selectedBand, state.dateRange, state.periods)
    if (selectedBand) {
      loadDecidedPeriods(state.dateRange, state.periods, selectedBand.id)
    }
  }, [selectedBand, state.dateRange, state.periods, loadVotes, loadDecidedPeriods])

  // クリーンアップ: コンポーネントのアンマウント時に保留中の操作をロールバック
  useEffect(() => {
    return () => {
      // 保留中の操作をすべてロールバック
      pendingOperationsRef.current.forEach((operation) => {
        operation.revert()
      })
      pendingOperationsRef.current.clear()

      // 進行中のリクエストをキャンセル
      isCancelledRef.current = true
    }
  }, [])

  return {
    schedules: state.schedules,
    lockedSlots: state.lockedSlots,
    periods: state.periods,
    dateRange: state.dateRange,
    loading: state.loading,
    error: state.error,
    toggleSlot,
    toggleLockSlot,
    goToPreviousWeek,
    goToNextWeek,
    refresh,
  }
}
