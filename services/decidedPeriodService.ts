import { supabaseClient } from "@/lib/supabase"
import type { Slot } from "@/lib/types"
import { formatDateToString } from "@/lib/utils/date"

/**
 * 決定された期間を取得する
 */
export async function fetchDecidedPeriods(
  startDate: Date,
  endDate: Date,
  bandId: number
): Promise<Slot[]> {
  try {
    const startDateStr = formatDateToString(startDate)
    const endDateStr = formatDateToString(endDate)

    const { data: decidedPeriodsData, error } = await supabaseClient
      .from("decided_periods")
      .select("date, period_id")
      .eq("band_id", bandId)
      .gte("date", startDateStr)
      .lte("date", endDateStr)

    if (error) {
      console.error("Error fetching decided periods:", error)
      return []
    }

    if (!decidedPeriodsData) {
      return []
    }

    // period_idからperiod情報を取得する必要がある
    // ここではperiod_idのみを返し、呼び出し側でperiod情報を結合する
    // または、period_timesテーブルとJOINする
    const periodIds = [...new Set(decidedPeriodsData.map((dp) => dp.period_id))]

    const { data: periodsData, error: periodsError } = await supabaseClient
      .from("period_times")
      .select("id, start_time, end_time")
      .in("id", periodIds)

    if (periodsError || !periodsData) {
      console.error("Error fetching periods for decided periods:", periodsError)
      return []
    }

    // Slotオブジェクトに変換
    const slots: Slot[] = decidedPeriodsData
      .map((dp) => {
        const period = periodsData.find((p) => p.id === dp.period_id)
        if (!period) return null

        return {
          date: new Date(dp.date),
          period: {
            id: period.id,
            start: period.start_time,
            end: period.end_time,
          },
        }
      })
      .filter((slot): slot is Slot => slot !== null)

    return slots
  } catch (err) {
    console.error("Unexpected error fetching decided periods:", err)
    return []
  }
}

/**
 * 決定された期間を追加する
 */
export async function addDecidedPeriod(
  periodId: number,
  date: Date,
  bandId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const dateStr = formatDateToString(date)
    const { error } = await supabaseClient.from("decided_periods").insert({
      period_id: periodId,
      date: dateStr,
      band_id: bandId,
    })

    if (error) {
      console.error("Error adding decided period:", error)
      return { success: false, error: "決定期間の追加に失敗しました" }
    }

    return { success: true }
  } catch (err) {
    console.error("Unexpected error adding decided period:", err)
    return { success: false, error: "エラーが発生しました" }
  }
}

/**
 * 決定された期間を削除する（ハードデリート）
 */
export async function removeDecidedPeriod(
  periodId: number,
  date: Date,
  bandId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const dateStr = formatDateToString(date)
    const { error } = await supabaseClient
      .from("decided_periods")
      .delete()
      .eq("period_id", periodId)
      .eq("date", dateStr)
      .eq("band_id", bandId)

    if (error) {
      console.error("Error removing decided period:", error)
      return { success: false, error: "決定期間の削除に失敗しました" }
    }

    return { success: true }
  } catch (err) {
    console.error("Unexpected error removing decided period:", err)
    return { success: false, error: "エラーが発生しました" }
  }
}

