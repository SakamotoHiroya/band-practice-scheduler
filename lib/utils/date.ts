/**
 * 指定された日付を含む週の開始日（指定された曜日）を取得する
 * @param date 基準となる日付
 * @param startDayOfWeek 週の開始曜日（0 = 日曜日, 1 = 月曜日, ..., 6 = 土曜日）
 */
export function getStartOfWeek(date: Date, startDayOfWeek: number = 0): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = 日曜日, 1 = 月曜日, ...
  // 週の開始日までの日数を計算
  let diff = day - startDayOfWeek
  if (diff < 0) {
    diff += 7 // 負の場合は前の週に戻る
  }
  const startDate = new Date(d.setDate(d.getDate() - diff))
  startDate.setHours(0, 0, 0, 0)
  return startDate
}

/**
 * 指定された日付を含む週の日曜日を取得する（後方互換性のため）
 */
export function getSundayOfWeek(date: Date): Date {
  return getStartOfWeek(date, 0)
}

/**
 * 指定された週の開始曜日から始まる1週間の日付範囲を取得する
 * @param date 基準となる日付（デフォルトは今日）
 * @param startDayOfWeek 週の開始曜日（0 = 日曜日, 1 = 月曜日, ..., 6 = 土曜日、デフォルトは0）
 */
export function getWeekRange(date: Date = new Date(), startDayOfWeek: number = 0) {
  const start = getStartOfWeek(date, startDayOfWeek)
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // 開始日から6日後
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * 前の週の日付範囲を取得する
 */
export function getPreviousWeek(currentRange: { start: Date; end: Date }, startDayOfWeek: number = 0) {
  const newStart = new Date(currentRange.start)
  newStart.setDate(currentRange.start.getDate() - 7)
  newStart.setHours(0, 0, 0, 0)
  const newEnd = new Date(newStart)
  newEnd.setDate(newStart.getDate() + 6)
  newEnd.setHours(23, 59, 59, 999)
  return { start: newStart, end: newEnd }
}

/**
 * 次の週の日付範囲を取得する
 */
export function getNextWeek(currentRange: { start: Date; end: Date }, startDayOfWeek: number = 0) {
  const newStart = new Date(currentRange.start)
  newStart.setDate(currentRange.start.getDate() + 7)
  newStart.setHours(0, 0, 0, 0)
  const newEnd = new Date(newStart)
  newEnd.setDate(newStart.getDate() + 6)
  newEnd.setHours(23, 59, 59, 999)
  return { start: newStart, end: newEnd }
}

/**
 * 前の日の日付範囲を取得する（1週間分）
 */
export function getPreviousDay(currentRange: { start: Date; end: Date }) {
  const newStart = new Date(currentRange.start)
  newStart.setDate(currentRange.start.getDate() - 1)
  newStart.setHours(0, 0, 0, 0)
  const newEnd = new Date(newStart)
  newEnd.setDate(newStart.getDate() + 6)
  newEnd.setHours(23, 59, 59, 999)
  return { start: newStart, end: newEnd }
}

/**
 * 次の日の日付範囲を取得する（1週間分）
 */
export function getNextDay(currentRange: { start: Date; end: Date }) {
  const newStart = new Date(currentRange.start)
  newStart.setDate(currentRange.start.getDate() + 1)
  newStart.setHours(0, 0, 0, 0)
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

