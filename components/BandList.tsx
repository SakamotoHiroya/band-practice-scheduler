"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Music, Plus, ArrowRight } from "lucide-react"

interface Band {
  id: number
  name: string
}

interface BandListProps {
  bands: Band[] | null
  onCreateBand: () => void
}

export function BandList({ bands, onCreateBand }: BandListProps) {
  const router = useRouter()

  // バンドリストがnullの場合は読み込み中
  if (bands === null) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  // バンドリストが空の場合はメッセージと作成ボタンを表示
  if (bands.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          参加しているバンドがありません
        </p>
        <Button onClick={onCreateBand} className="gap-2">
          <Plus className="h-4 w-4" />
          新しいバンドを作成
        </Button>
      </div>
    )
  }

  // バンド一覧を表示
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">バンド一覧</h2>
        <Button onClick={onCreateBand} className="gap-2">
          <Plus className="h-4 w-4" />
          新しいバンドを作成
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bands.map((band) => (
          <Button
            key={band.id}
            variant="outline"
            className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-accent transition-colors"
            onClick={() => router.push(`/${band.id}`)}
          >
            <div className="flex items-center gap-3 w-full">
              <Music className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-left flex-1">
                {band.name}
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

