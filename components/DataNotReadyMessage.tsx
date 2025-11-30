/**
 * データの準備ができていない場合のメッセージコンポーネント
 */
interface DataNotReadyMessageProps {
  actor: any
  selectedBand: any
  selectedMember: any
  periodsLength: number
}

export function DataNotReadyMessage({
  actor,
  selectedBand,
  selectedMember,
  periodsLength,
}: DataNotReadyMessageProps) {
  return (
    <div className="text-center">
      <p className="text-muted-foreground mb-2">データの準備ができていません</p>
      <p className="text-sm text-muted-foreground">
        {!actor && "アクターを選択してください"}
        {actor && !selectedBand && "バンドを選択してください"}
        {actor && selectedBand && !selectedMember && "メンバーを選択してください"}
        {actor && selectedBand && selectedMember && periodsLength === 0 &&
          "期間データが取得できませんでした"}
      </p>
    </div>
  )
}

