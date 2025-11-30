import { ScheduleGrid } from "@/components/schedule-grid"
import { ScheduleError } from "@/components/ScheduleError"
import { PeriodsEmptyWarning } from "@/components/PeriodsEmptyWarning"
import { PeriodsFetchError } from "@/components/PeriodsFetchError"
import type { Band, Member, Slot, Period } from "@/lib/types"

interface DateRange {
  start: Date
  end: Date
}

interface ScheduleContentProps {
  scheduleError: string | null
  periods: Period[]
  schedules: Record<string, Record<string, boolean>>
  dateRange: DateRange
  selectedBand: Band
  selectedMember: Member
  lockedSlots: Array<{ date: Date; period: Period }>
  onToggleSlot: (memberId: number, dateStr: string, period: Period) => void
  onToggleLock: (slot: Slot) => void
  onExportToCalendar: (slot: Slot) => void
  onImportFromCalendar: (memberId: number) => void
  onRemoveMember: (memberId: number) => void
  canRemoveMembers: boolean
  currentActorId: number | null
  isLoggedIn: boolean
  onPreviousWeek: () => void
  onNextWeek: () => void
  onPreviousDay?: () => void
  onNextDay?: () => void
  startDayOfWeek?: number
  setStartDayOfWeek?: (day: number) => void
}

/**
 * スケジュールメインコンテンツコンポーネント
 */
export function ScheduleContent({
  scheduleError,
  periods,
  schedules,
  dateRange,
  selectedBand,
  selectedMember,
  lockedSlots,
  onToggleSlot,
  onToggleLock,
  onExportToCalendar,
  onImportFromCalendar,
  onRemoveMember,
  canRemoveMembers,
  currentActorId,
  isLoggedIn,
  onPreviousWeek,
  onNextWeek,
  onPreviousDay,
  onNextDay,
  startDayOfWeek,
  setStartDayOfWeek,
}: ScheduleContentProps) {
  return (
    <main className="container mx-auto px-4 py-4 sm:py-6">
      {/* エラー表示 */}
      {scheduleError && <ScheduleError error={scheduleError} />}

      {/* 期間データが空の場合の警告 */}
      {!scheduleError && periods.length === 0 && <PeriodsEmptyWarning />}

      {/* スケジュールグリッド */}
      {periods.length > 0 ? (
        <ScheduleGrid
          schedules={schedules}
          dateRange={dateRange}
          periods={periods}
          selectedBand={selectedBand}
          selectedMember={selectedMember}
          onToggleSlot={onToggleSlot}
          lockedSlots={lockedSlots}
          onToggleLock={onToggleLock}
          onExportToCalendar={onExportToCalendar}
          onImportFromCalendar={onImportFromCalendar}
          onRemoveMember={onRemoveMember}
          canRemoveMembers={canRemoveMembers}
          currentActorId={currentActorId}
          isLoggedIn={isLoggedIn}
          onPreviousWeek={onPreviousWeek}
          onNextWeek={onNextWeek}
          onPreviousDay={onPreviousDay}
          onNextDay={onNextDay}
          startDayOfWeek={startDayOfWeek}
          setStartDayOfWeek={setStartDayOfWeek}
        />
      ) : (
        <PeriodsFetchError />
      )}
    </main>
  )
}

