export interface Member {
  id: number
  name: string
  color: string
}

export interface Band {
  id: number
  name: string
  members: Member[]
}

export interface Date {
    year: number
    month: number //january is 1
    day: number
}

export interface Period {
    id: number
    start: string //HH:MM
    end: string //HH:MM 
}

export interface Slot {
    date: globalThis.Date,
    period: Period
}

// スケジュール: メンバーID -> 日付-時間 -> 空き時間かどうか
export type Schedule = Record<string, Record<string, boolean>>
