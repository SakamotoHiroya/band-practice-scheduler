/**
 * 期間データが取得できない場合のエラーメッセージコンポーネント
 */
export function PeriodsFetchError() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-2">期間データが取得できませんでした</p>
      <p className="text-sm text-muted-foreground">
        period_timesテーブルにデータが存在するか確認してください
      </p>
    </div>
  )
}

