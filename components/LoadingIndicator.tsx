/**
 * ローディング表示コンポーネント
 */
interface LoadingIndicatorProps {
  message?: string
}

export function LoadingIndicator({ message = "読み込み中..." }: LoadingIndicatorProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-2">{message}</p>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  )
}

