"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Plus, Lock, Unlock, Calendar, CalendarPlus, X, ChevronLeft, ChevronRight, Check, Share2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Member, Band, Schedule, Period, Slot } from "@/lib/types"

interface ScheduleGridProps {
  schedules: Schedule
  dateRange: {
    start: Date
    end: Date
  },
  periods: Period[]
  selectedBand: Band
  selectedMember: Member
  onToggleSlot: (memberId: number, date: string, period: Period) => void
  lockedSlots: Slot[]
  onToggleLock: (slot: Slot) => void
  onExportToCalendar: (slot: Slot) => void
  onImportFromCalendar: (memberId: number) => void
  onRemoveMember?: (memberId: number) => void
  canRemoveMembers?: boolean
  currentActorId?: number | null
  isLoggedIn?: boolean
  onPreviousWeek?: () => void
  onNextWeek?: () => void
  onPreviousDay?: () => void
  onNextDay?: () => void
  startDayOfWeek?: number
  setStartDayOfWeek?: (day: number) => void
}

export function ScheduleGrid({
  schedules,
  dateRange,
  periods,
  selectedBand,
  selectedMember,
  onToggleSlot,
  lockedSlots,
  onToggleLock,
  onExportToCalendar,
  onImportFromCalendar,
  onRemoveMember,
  canRemoveMembers = false,
  currentActorId = null,
  isLoggedIn = false,
  onPreviousWeek,
  onNextWeek,
  onPreviousDay,
  onNextDay,
  startDayOfWeek = 0,
  setStartDayOfWeek,
}: ScheduleGridProps) {
  // モバイルかどうかを判定
  const [isMobile, setIsMobile] = useState(false)
  // カレンダーボタンのチェックマーク表示状態（スロットごと）
  const [calendarCheckStates, setCalendarCheckStates] = useState<Map<string, boolean>>(new Map())
  // 共有ダイアログの表示状態
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // dateRangeから日付の配列を生成
  const generateDates = () => {
    const dates: Date[] = []
    const current = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  const allDates = generateDates()
  // モバイルの場合は最初の1日だけ表示
  const dates = isMobile ? allDates.slice(0, 1) : allDates

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

  const getAllMembersAvailability = (date: string, period: Period) => {
    const periodKey = `${period.start}-${period.end}`
    const availableMembers = selectedBand.members.filter((member) => {
      const memberSchedule = schedules[member.id.toString()]
      if (!memberSchedule) return false
      return memberSchedule[`${date}-${periodKey}`] || false
    })
    return {
      count: availableMembers.length,
      allAvailable: availableMembers.length === selectedBand.members.length && selectedBand.members.length > 0,
      members: availableMembers,
    }
  }

  const isSlotLocked = (date: Date, period: Period) => {
    return lockedSlots.some(
      (slot) => {
        const slotDateStr = formatDate(slot.date)
        const currentDateStr = formatDate(date)
        return slotDateStr === currentDateStr && slot.period.id === period.id
      }
    )
  }

  const formatPeriodLabel = (period: Period) => {
    // HH:MM:SS形式をHH:MM形式に変換
    const formatTime = (time: string) => {
      return time.split(":").slice(0, 2).join(":")
    }
    return `${formatTime(period.start)}-${formatTime(period.end)}`
  }

  // 週の範囲を表示する関数
  const formatWeekRange = () => {
    const startMonth = dateRange.start.getMonth() + 1
    const startDay = dateRange.start.getDate()
    const endMonth = dateRange.end.getMonth() + 1
    const endDay = dateRange.end.getDate()
    
    if (startMonth === endMonth) {
      return `${startMonth}/${startDay} - ${endDay}`
    } else {
      return `${startMonth}/${startDay} - ${endMonth}/${endDay}`
    }
  }

  return (
    <div className="space-y-4">
      {/* バンド名 */}
      <div className="px-4 pt-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {selectedBand.name}
        </h2>
      </div>

      {/* メンバー一覧 */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {selectedBand.members.map((member, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg",
                "bg-background border border-border"
              )}
            >
              <div className={cn("h-3 w-3 rounded-full", member.color)} />
              <span className="text-sm font-medium">{member.name}</span>
              {canRemoveMembers && onRemoveMember && currentActorId !== member.id && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  title="メンバーを削除"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* 共有ボタン */}
        <div className="mt-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>共有</span>
          </Button>
        </div>
      </div>

      {/* 共有ダイアログ */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>バンドを共有</DialogTitle>
            <DialogDescription>
              このリンクを共有すると、他の人がこのバンドのスケジュールを表示できます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/${selectedBand.id}` : ""}
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/${selectedBand.id}` : ""
                  try {
                    await navigator.clipboard.writeText(shareUrl)
                    setIsCopied(true)
                    setTimeout(() => setIsCopied(false), 2000)
                  } catch (err) {
                    console.error("コピーに失敗しました:", err)
                  }
                }}
                className="gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>コピー済み</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>コピー</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 週移動コントロール */}
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={isMobile && onPreviousDay ? onPreviousDay : onPreviousWeek}
            className="gap-2"
            disabled={isMobile && onPreviousDay ? !onPreviousDay : !onPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">前の週</span>
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {isMobile && dates.length === 1
              ? formatDisplayDate(dates[0])
              : formatWeekRange()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={isMobile && onNextDay ? onNextDay : onNextWeek}
            className="gap-2"
            disabled={isMobile && onNextDay ? !onNextDay : !onNextWeek}
          >
            <span className="hidden sm:inline">次の週</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 週の開始曜日選択（PC表示時のみ） */}
        {!isMobile && setStartDayOfWeek && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">週の開始:</span>
            <Select
              value={startDayOfWeek.toString()}
              onValueChange={(value) => {
                setStartDayOfWeek(parseInt(value, 10))
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">日曜日</SelectItem>
                <SelectItem value="1">月曜日</SelectItem>
                <SelectItem value="2">火曜日</SelectItem>
                <SelectItem value="3">水曜日</SelectItem>
                <SelectItem value="4">木曜日</SelectItem>
                <SelectItem value="5">金曜日</SelectItem>
                <SelectItem value="6">土曜日</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl bg-card/50 backdrop-blur-sm border border-border shadow-sm">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                  <th className="sticky left-0 z-10 bg-muted/20 px-1.5 py-2 text-center text-[10px] font-semibold text-foreground sm:px-4 sm:py-4 sm:text-sm border-r border-border">
                    <span className="hidden sm:inline">時間</span>
                    <span className="sm:hidden">時間</span>
                  </th>
                {dates.map((date, index) => (
                  <th
                    key={formatDate(date)}
                    className={cn(
                      "px-1 py-2 text-center text-[10px] font-semibold text-foreground min-w-[60px] sm:min-w-[120px] sm:px-4 sm:py-4 sm:text-sm",
                      index < dates.length - 1 && "border-r border-border/50",
                    )}
                  >
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <span className="sm:hidden text-[9px]">{formatShortDate(date)}</span>
                      <span className="hidden sm:inline">{formatDisplayDate(date)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, rowIndex) => (
                <tr
                  key={period.id}
                  className={cn(
                    "hover:bg-muted/10 transition-colors",
                    rowIndex < periods.length - 1 && "border-b border-border/30",
                  )}
                >
                  <td className="sticky left-0 z-10 bg-card/80 backdrop-blur-sm px-1.5 py-1.5 text-center text-[10px] font-medium text-muted-foreground whitespace-nowrap sm:px-4 sm:py-3 sm:text-sm border-r border-border">
                    <span className="hidden sm:inline">{formatPeriodLabel(period)}</span>
                    <span className="sm:hidden">{period.start.split(":").slice(0, 2).join(":")}</span>
                  </td>
                  {dates.map((date, colIndex) => {
                    const dateStr = formatDate(date)
                    const availability = getAllMembersAvailability(dateStr, period)
                    const isLocked = isSlotLocked(date, period)
                    const slot: Slot = { date, period }
                    // 現在のアクターIDを使用（未設定の場合はselectedMember.idをフォールバック）
                    const actorIdToUse = currentActorId || selectedMember.id
                    // カレンダーボタンのチェックマーク表示状態
                    const slotKey = `${dateStr}-${period.id}`
                    const showCalendarCheck = calendarCheckStates.get(slotKey) || false

                    return (
                      <td
                        key={`${dateStr}-${period.id}`}
                        className={cn("p-1.5 sm:p-3 align-top", colIndex < dates.length - 1 && "border-r border-border/30")}
                      >
                        <div className="relative min-h-[60px] sm:min-h-[80px]">
                          <div
                            onClick={() => !isLocked && onToggleSlot(actorIdToUse, dateStr, period)}
                            className={cn(
                              "w-full rounded-lg transition-all duration-200 relative",
                              "text-sm",
                              "flex flex-col items-start p-1.5 sm:p-3 gap-1.5 sm:gap-2",
                              !isLocked && [
                                "cursor-pointer",
                                "hover:bg-muted/60 hover:scale-[1.02] hover:shadow-md",
                                "active:scale-[0.98] active:bg-muted/80",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                "touch-manipulation", // タッチデバイスでのタップ遅延を削減
                              ],
                              availability.allAvailable &&
                                "ring-[2px] sm:ring-[3px] ring-blue-500 ring-inset shadow-lg bg-blue-500/5",
                              !availability.allAvailable && availability.count > 0 && [
                                "bg-muted/40",
                                !isLocked && "hover:bg-muted/60",
                              ],
                              availability.count === 0 && [
                                "bg-muted/10",
                                !isLocked && "hover:bg-muted/30 hover:border-2 hover:border-primary/30",
                              ],
                              isLocked && "opacity-80 cursor-not-allowed",
                            )}
                            role="button"
                            tabIndex={isLocked ? -1 : 0}
                            onKeyDown={(e) => {
                              if (!isLocked && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault()
                                onToggleSlot(actorIdToUse, dateStr, period)
                              }
                            }}
                            aria-label={`${selectedMember.name} ${formatPeriodLabel(period)} on ${formatDisplayDate(date)}`}
                          >
                            {isLocked && (
                              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                                <Lock className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-primary" />
                              </div>
                            )}

                            <div className="flex flex-col gap-1 sm:gap-1.5 items-start w-full pr-6 sm:pr-8 pl-2 sm:pl-0">
                              {availability.members.length > 0 ? (
                                availability.members.map((member) => (
                                  <div
                                    key={member.id}
                                    className={cn(
                                      "flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all w-full",
                                      member.id === selectedMember.id && "scale-105",
                                    )}
                                    title={member.name}
                                  >
                                    <div
                                      className={cn(
                                        "h-2 w-2 sm:h-3 sm:w-3 rounded-full flex-shrink-0",
                                        member.color,
                                        member.id === selectedMember.id && "ring-1 sm:ring-2 ring-white shadow-md",
                                      )}
                                    />
                                    <span className="text-foreground truncate flex-1 min-w-0">{member.name}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-[9px] sm:text-xs">参加者なし</span>
                              )}
                            </div>

                            {availability.allAvailable && (
                              <div className="absolute top-0.5 right-0.5 sm:top-2 sm:right-2 z-20 flex items-center gap-1">
                                {isLocked && isLoggedIn && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      await onExportToCalendar(slot)
                                      // チェックマークを表示
                                      setCalendarCheckStates((prev) => {
                                        const newMap = new Map(prev)
                                        newMap.set(slotKey, true)
                                        return newMap
                                      })
                                      // 3秒後にチェックマークを非表示
                                      setTimeout(() => {
                                        setCalendarCheckStates((prev) => {
                                          const newMap = new Map(prev)
                                          newMap.delete(slotKey)
                                          return newMap
                                        })
                                      }, 3000)
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                    }}
                                    type="button"
                                    className={cn(
                                      "h-5 w-5 sm:h-6 sm:w-6 rounded-full cursor-pointer",
                                      "flex items-center justify-center",
                                      "backdrop-blur-sm border shadow-sm",
                                      "transition-colors",
                                      showCalendarCheck
                                        ? "bg-green-500 border-green-600 text-white hover:bg-green-600"
                                        : "bg-background/90 border-border text-foreground hover:bg-background"
                                    )}
                                    title="カレンダーへ"
                                  >
                                    {showCalendarCheck ? (
                                      <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    ) : (
                                      <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    onToggleLock(slot)
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                  }}
                                  type="button"
                                  className={cn(
                                    "h-5 w-5 sm:h-6 sm:w-6 rounded-full cursor-pointer",
                                    "flex items-center justify-center",
                                    "backdrop-blur-sm border shadow-sm",
                                    "hover:opacity-90 transition-colors",
                                    isLocked
                                      ? "bg-blue-500 border-blue-600 text-white hover:bg-blue-600"
                                      : "bg-background/90 border-border text-foreground hover:bg-background"
                                  )}
                                >
                                  {isLocked ? (
                                    <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  ) : (
                                    <Unlock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
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
