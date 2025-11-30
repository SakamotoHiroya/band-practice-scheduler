import { useCallback } from "react"
import { addEventToGoogleCalendar } from "@/services/calendarService"
import type { Slot, Band } from "@/lib/types"
import type { ToastType } from "@/components/toast"

/**
 * Googleカレンダー連携を処理するフック
 */
export function useCalendar(
  selectedBand: Band | null,
  user: any,
  onLogin: () => Promise<void>,
  showToast: (message: string, type?: ToastType, duration?: number) => void
) {
  const exportToGoogleCalendar = useCallback(
    async (slot: Slot) => {
      if (!selectedBand || !user) return

      const result = await addEventToGoogleCalendar(slot, selectedBand.name)
      if (result.success) {
        showToast("カレンダーに追加しました", "success")
      } else {
        if (result.error?.includes("アクセス許可")) {
          showToast(result.error, "error")
          await onLogin()
        } else {
          showToast(result.error || "カレンダーへの追加に失敗しました", "error")
        }
      }
    },
    [selectedBand, user, onLogin, showToast]
  )

  const importFromGoogleCalendar = useCallback((memberId: number) => {
    // TODO: Implement Google Calendar API integration
    console.log("Import from Google Calendar for member:", memberId)
    alert(`${memberId} の Google カレンダーから空き時間をインポートします`)
  }, [])

  return { exportToGoogleCalendar, importFromGoogleCalendar }
}

