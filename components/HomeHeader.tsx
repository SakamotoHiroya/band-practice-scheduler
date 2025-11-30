import { Music } from "lucide-react"

/**
 * ホーム画面のヘッダーコンポーネント
 */
export function HomeHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Music className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          BandScheduler
        </h1>
      </div>
      <p className="text-xl text-muted-foreground mb-2">
        BandSchedulerへようこそ
      </p>
    </div>
  )
}

