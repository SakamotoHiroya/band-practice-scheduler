import { supabaseClient } from "@/lib/supabase"
import type { Slot } from "@/lib/types"

/**
 * Google Calendarにイベントを追加する
 */
export async function addEventToGoogleCalendar(
  slot: Slot,
  bandName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Supabaseのセッションからアクセストークンを取得
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession()

    if (sessionError || !session) {
      console.error("Error getting session:", sessionError)
      return { success: false, error: "認証情報の取得に失敗しました。再度ログインしてください。" }
    }

    // Google Calendar APIを使用するために、provider_tokenを取得
    const providerToken = session.provider_token || session.access_token

    // 日付と時間を取得
    const date = new Date(slot.date)
    const [startHour, startMinute] = slot.period.start.split(":").map(Number)
    const [endHour, endMinute] = slot.period.end.split(":").map(Number)

    // 開始日時と終了日時を作成
    const startDateTime = new Date(date)
    startDateTime.setHours(startHour, startMinute, 0, 0)
    const endDateTime = new Date(date)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    // Google Calendar APIにイベントを作成
    const event = {
      summary: `${bandName} 練習`,
      description: "バンド練習の予定",
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }

    // Google Calendar APIを呼び出す
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error creating calendar event:", errorData)

      // スコープが不足している場合
      if (response.status === 403 || response.status === 401) {
        return {
          success: false,
          error: "カレンダーへのアクセス許可が必要です。再度ログインしてください。",
        }
      }

      return { success: false, error: "カレンダーへの追加に失敗しました" }
    }

    const createdEvent = await response.json()
    console.log("Event created:", createdEvent)
    return { success: true }
  } catch (err) {
    console.error("Error exporting to Google Calendar:", err)
    return { success: false, error: "カレンダーへの追加に失敗しました" }
  }
}

