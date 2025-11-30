import { useCallback } from "react"
import { removeMemberFromBand } from "@/services/bandService"
import type { Band } from "@/lib/types"

/**
 * メンバー管理（削除など）を処理するフック
 */
export function useMemberManagement(
  selectedBand: Band | null,
  refreshBands: () => Promise<void>,
  refreshSchedule: () => void
) {
  const handleRemoveMember = useCallback(
    async (memberId: number) => {
      if (!selectedBand) {
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
    [selectedBand, refreshBands, refreshSchedule]
  )

  return { handleRemoveMember }
}

