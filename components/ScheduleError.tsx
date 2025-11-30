/**
 * スケジュールエラー表示コンポーネント
 */
interface ScheduleErrorProps {
  error: string
}

export function ScheduleError({ error }: ScheduleErrorProps) {
  return (
    <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
      <p className="text-sm font-medium">{error}</p>
    </div>
  )
}

