/**
 * 指定された日付を含む週の日曜日を取得する
 */
export function getSundayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = 日曜日, 1 = 月曜日, ...
  const diff = d.getDate() - day // 日曜日までの日数を計算
  const sunday = new Date(d.setDate(diff))
  sunday.setHours(0, 0, 0, 0)
  return sunday
}

/**
 * 日曜日から始まる1週間の日付範囲を取得する
 */
export function getWeekRange(date: Date = new Date()) {
  const start = getSundayOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // 日曜日から6日後（土曜日）
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * 前の週の日付範囲を取得する
 */
export function getPreviousWeek(currentRange: { start: Date; end: Date }) {
  const newStart = new Date(currentRange.start)
  newStart.setDate(currentRange.start.getDate() - 7)
  const newEnd = new Date(newStart)
  newEnd.setDate(newStart.getDate() + 6)
  newEnd.setHours(23, 59, 59, 999)
  return { start: newStart, end: newEnd }
}

/**
 * 次の週の日付範囲を取得する
 */
export function getNextWeek(currentRange: { start: Date; end: Date }) {
  const newStart = new Date(currentRange.start)
  newStart.setDate(currentRange.start.getDate() + 7)
  const newEnd = new Date(newStart)
  newEnd.setDate(newStart.getDate() + 6)
  newEnd.setHours(23, 59, 59, 999)
  return { start: newStart, end: newEnd }
}

/**
 * 日付をYYYY-MM-DD形式の文字列に変換する
 */
export function formatDateToString(date: Date): string {
  return date.toISOString().split("T")[0]
}

