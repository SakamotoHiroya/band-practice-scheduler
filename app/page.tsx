"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Music, Plus, ArrowRight } from "lucide-react"
import { supabaseClient } from "@/lib/supabase"
import { CreateBandModal } from "@/components/CreateBandModal"
import { createBand } from "@/services/bandService"
import { ToastContainer, useToast } from "@/components/toast"

interface Band {
  id: number
  name: string
}

export default function Home() {
  const router = useRouter()
  const [bands, setBands] = useState<Band[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateBandModal, setShowCreateBandModal] = useState(false)
  const [isCreatingBand, setIsCreatingBand] = useState(false)
  const { toasts, showToast, removeToast } = useToast()

  // バンド一覧を取得
  useEffect(() => {
    const fetchBands = async () => {
      try {
        const { data: bandsData, error } = await supabaseClient
          .from("bands")
          .select("id, name")
          .order("name")

        if (error) {
          console.error("Error fetching bands:", error)
      return
    }

        setBands(bandsData || [])
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBands()
  }, [])

  const handleCreateBand = async (bandName: string) => {
    setIsCreatingBand(true)
    try {
      const result = await createBand(bandName.trim())
      if (!result.success) {
        showToast(result.error || "バンドの作成に失敗しました", "error")
        setIsCreatingBand(false)
        return
      }

      if (result.bandId) {
        // バンド一覧を再取得
        const { data: bandsData, error } = await supabaseClient
          .from("bands")
          .select("id, name")
          .order("name")

        if (!error && bandsData) {
          setBands(bandsData)
        }

        // モーダルを閉じる
        setShowCreateBandModal(false)
        setIsCreatingBand(false)

        // 新しいバンドにリダイレクト
        router.push(`/${result.bandId}`)
      }
    } catch (err) {
      console.error("Error creating band:", err)
      showToast("エラーが発生しました", "error")
      setIsCreatingBand(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 通知 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* バンド作成モーダル */}
      <CreateBandModal
        open={showCreateBandModal}
        onClose={() => setShowCreateBandModal(false)}
        onCreate={handleCreateBand}
        loading={isCreatingBand}
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                BandScheduler
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              軽音部でバンド練習を取るための予定合わせツール
            </p>
            <p className="text-muted-foreground">
              各ユーザが予定のない箇所を入力すると全員の予定が合う箇所が表示されます
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : bands.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  バンド一覧
                </h2>
                <Button
                  onClick={() => setShowCreateBandModal(true)}
                  className="gap-2"
                >
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                まだバンドが登録されていません
              </p>
              <Button
                onClick={() => setShowCreateBandModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                新しいバンドを作成
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
