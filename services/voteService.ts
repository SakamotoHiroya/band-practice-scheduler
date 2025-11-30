import { supabaseClient } from "@/lib/supabase"
import type { Schedule, Period } from "@/lib/types"
import { formatDateToString } from "@/lib/utils/date"

/**
 * 投票を追加する
 */
export async function addVote(
  actorId: number,
  periodId: number,
  date: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const dateStr = formatDateToString(date)
    const { error } = await supabaseClient.from("votes").insert({
      actor_id: actorId,
      period_id: periodId,
      date: dateStr,
    })

    if (error) {
      console.error("Error adding vote:", error)
      return { success: false, error: "投票の追加に失敗しました" }
    }

    return { success: true }
  } catch (err) {
    console.error("Unexpected error adding vote:", err)
    return { success: false, error: "エラーが発生しました" }
  }
}

/**
 * 投票を削除する
 */
export async function removeVote(
  actorId: number,
  periodId: number,
  date: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const dateStr = formatDateToString(date)
    const { error } = await supabaseClient
      .from("votes")
      .delete()
      .eq("actor_id", actorId)
      .eq("period_id", periodId)
      .eq("date", dateStr)

    if (error) {
      console.error("Error removing vote:", error)
      return { success: false, error: "投票の削除に失敗しました" }
    }

    return { success: true }
  } catch (err) {
    console.error("Unexpected error removing vote:", err)
    return { success: false, error: "エラーが発生しました" }
  }
}

/**
 * 投票を取得してSchedule形式に変換する（periods情報を含む）
 */
export async function fetchVotesAsSchedule(
  memberIds: number[],
  periods: Period[],
  startDate: Date,
  endDate: Date
): Promise<Schedule> {
  if (memberIds.length === 0) {
    return {}
  }

  try {
    const startDateStr = formatDateToString(startDate)
    const endDateStr = formatDateToString(endDate)

    const { data: votesData, error } = await supabaseClient
      .from("votes")
      .select("actor_id, period_id, date")
      .in("actor_id", memberIds)
      .gte("date", startDateStr)
      .lte("date", endDateStr)

    if (error) {
      console.error("Error fetching votes:", error)
      return {}
    }

    if (!votesData) {
      return {}
    }

    // Scheduleオブジェクトに変換
    const schedules: Schedule = {}
    votesData.forEach((vote) => {
      const memberId = vote.actor_id.toString()
      const period = periods.find((p) => p.id === vote.period_id)
      if (!period) return

      const periodKey = `${period.start}-${period.end}`
      const key = `${vote.date}-${periodKey}`

      if (!schedules[memberId]) {
        schedules[memberId] = {}
      }
      schedules[memberId][key] = true
    })

    return schedules
  } catch (err) {
    console.error("Unexpected error fetching votes:", err)
    return {}
  }
}

