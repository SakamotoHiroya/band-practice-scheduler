/**
 * 期間データが空の場合の警告コンポーネント
 */
export function PeriodsEmptyWarning() {
  return (
    <div className="mb-4 p-4 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-500/20">
      <p className="text-sm font-medium">期間データが見つかりませんでした</p>
      <p className="text-xs mt-1 text-yellow-600 dark:text-yellow-500">
        period_timesテーブルにデータが存在するか確認してください。
      </p>
    </div>
  )
}

