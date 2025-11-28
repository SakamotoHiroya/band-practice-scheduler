"use client"

import { cn } from "@/lib/utils"
import { Plus, Lock, Unlock, Calendar, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Member {
  id: string
  name: string
  color: string
}

interface Band {
  id: string
  name: string
  members: Member[]
}

interface ScheduleGridProps {
  schedules: Record<string, Record<string, boolean>>
  selectedBand: Band
  selectedMember: Member
  onToggleSlot: (memberId: string, date: string, time: string) => void
  onMemberChange: (member: Member) => void
  onAddMember: () => void
  lockedSlots: Set<string>
  onToggleLock: (date: string, time: string) => void
  onExportToCalendar: (date: string, time: string) => void
  onImportFromCalendar: (memberId: string) => void
}

// 1週間分の日付を生成
const generateDates = () => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date)
  }
  return dates
}

// 1.5時間ごとのタイムスロット（9:00-21:00）
const timeSlots = [
  { label: "09:00-10:30", value: "09:00" },
  { label: "10:30-12:00", value: "10:30" },
  { label: "12:00-13:30", value: "12:00" },
  { label: "13:30-15:00", value: "13:30" },
  { label: "15:00-16:30", value: "15:00" },
  { label: "16:30-18:00", value: "16:30" },
  { label: "18:00-19:30", value: "18:00" },
  { label: "19:30-21:00", value: "19:30" },
]

export function ScheduleGrid({
  schedules,
  selectedBand,
  selectedMember,
  onToggleSlot,
  onMemberChange,
  onAddMember,
  lockedSlots,
  onToggleLock,
  onExportToCalendar,
  onImportFromCalendar,
}: ScheduleGridProps) {
  const dates = generateDates()

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const formatDisplayDate = (date: Date) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"]
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = days[date.getDay()]
    return `${month}/${day} (${dayOfWeek})`
  }

  const formatShortDate = (date: Date) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"]
    const day = date.getDate()
    const dayOfWeek = days[date.getDay()]
    return `${day}(${dayOfWeek})`
  }

  const getAllMembersAvailability = (date: string, time: string) => {
    const availableMembers = selectedBand.members.filter((member) => {
      const memberSchedule = schedules[member.id]
      if (!memberSchedule) return false
      return memberSchedule[`${date}-${time}`] || false
    })
    return {
      count: availableMembers.length,
      allAvailable: availableMembers.length === selectedBand.members.length && selectedBand.members.length > 0,
      members: availableMembers,
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">{"予定を入力するメンバーを選択"}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onImportFromCalendar(selectedMember.id)}
              className="gap-2 bg-transparent"
            >
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">{"カレンダーからインポート"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onAddMember} className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              <span>{"メンバー追加"}</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedBand.members.map((member) => (
            <button
              key={member.id}
              onClick={() => onMemberChange(member)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all",
                "hover:scale-105 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                selectedMember.id === member.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/30 hover:bg-muted/50",
              )}
            >
              <div className={cn("h-3 w-3 rounded-full", member.color)} />
              <span className="text-sm font-medium">{member.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-card/50 backdrop-blur-sm border border-border shadow-sm -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                <th className="sticky left-0 z-10 bg-muted/20 px-2 py-3 text-left text-xs font-semibold text-foreground sm:px-4 sm:py-4 sm:text-sm border-r border-border">
                  {"時間"}
                </th>
                {dates.map((date, index) => (
                  <th
                    key={formatDate(date)}
                    className={cn(
                      "px-2 py-3 text-center text-xs font-semibold text-foreground min-w-[80px] sm:min-w-[120px] sm:px-4 sm:py-4 sm:text-sm",
                      index < dates.length - 1 && "border-r border-border/50",
                    )}
                  >
                    <span className="sm:hidden">{formatShortDate(date)}</span>
                    <span className="hidden sm:inline">{formatDisplayDate(date)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, rowIndex) => (
                <tr
                  key={slot.value}
                  className={cn(
                    "hover:bg-muted/10 transition-colors",
                    rowIndex < timeSlots.length - 1 && "border-b border-border/30",
                  )}
                >
                  <td className="sticky left-0 z-10 bg-card/80 backdrop-blur-sm px-2 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap sm:px-4 sm:py-3 sm:text-sm border-r border-border">
                    {slot.label}
                  </td>
                  {dates.map((date, colIndex) => {
                    const dateStr = formatDate(date)
                    const availability = getAllMembersAvailability(dateStr, slot.value)
                    const slotKey = `${dateStr}-${slot.value}`
                    const isLocked = lockedSlots.has(slotKey)

                    return (
                      <td
                        key={slotKey}
                        className={cn("p-1 sm:p-2", colIndex < dates.length - 1 && "border-r border-border/30")}
                      >
                        <div className="relative">
                          <button
                            onClick={() => onToggleSlot(selectedMember.id, dateStr, slot.value)}
                            disabled={isLocked}
                            className={cn(
                              "w-full min-h-[100px] rounded-lg transition-all duration-200 relative overflow-hidden",
                              !isLocked && "hover:scale-[1.02] active:scale-95",
                              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                              "text-sm sm:text-base sm:min-h-[120px]",
                              "flex flex-col items-center justify-center p-3 sm:p-4 gap-2",
                              availability.allAvailable &&
                                "ring-[3px] ring-blue-500 ring-inset shadow-lg bg-blue-500/5",
                              !availability.allAvailable && availability.count > 0 && "bg-muted/40",
                              availability.count === 0 && "bg-muted/10 hover:bg-muted/20",
                              isLocked && "opacity-80 cursor-not-allowed",
                            )}
                            aria-label={`${selectedMember.name} ${slot.label} on ${formatDisplayDate(date)}`}
                          >
                            {isLocked && (
                              <div className="absolute top-2 right-2">
                                <Lock className="h-4 w-4 text-primary" />
                              </div>
                            )}

                            <div className="flex flex-col gap-1.5 items-start justify-center w-full">
                              {availability.members.map((member) => (
                                <div
                                  key={member.id}
                                  className={cn(
                                    "flex items-center gap-2 text-sm font-medium transition-all",
                                    member.id === selectedMember.id && "scale-110",
                                  )}
                                  title={member.name}
                                >
                                  <div
                                    className={cn(
                                      "h-3 w-3 rounded-full flex-shrink-0",
                                      member.color,
                                      member.id === selectedMember.id && "ring-2 ring-white shadow-md",
                                    )}
                                  />
                                  <span className="text-foreground truncate">{member.name}</span>
                                </div>
                              ))}
                            </div>
                          </button>

                          {availability.allAvailable && (
                            <div className="flex gap-1 mt-2 justify-center">
                              <Button
                                size="sm"
                                variant={isLocked ? "outline" : "default"}
                                onClick={() => onToggleLock(dateStr, slot.value)}
                                className="gap-1 text-xs h-7"
                              >
                                {isLocked ? (
                                  <>
                                    <Unlock className="h-3 w-3" />
                                    <span>{"解除"}</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-3 w-3" />
                                    <span>{"決定"}</span>
                                  </>
                                )}
                              </Button>

                              {isLocked && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onExportToCalendar(dateStr, slot.value)}
                                  className="gap-1 text-xs h-7"
                                >
                                  <Calendar className="h-3 w-3" />
                                  <span>{"カレンダーへ"}</span>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
