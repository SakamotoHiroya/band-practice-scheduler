import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchBandsWithMembers, fetchBandById } from "@/services/bandService"
import type { Band } from "@/lib/types"

/**
 * バンドの状態を管理するフック
 */
export function useBand(bandId: number | null) {
  const router = useRouter()
  const [bands, setBands] = useState<Band[]>([])
  const [selectedBand, setSelectedBand] = useState<Band | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBands = async () => {
      try {
        setLoading(true)
        const bandsData = await fetchBandsWithMembers()
        setBands(bandsData)

        if (bandId) {
          const band = await fetchBandById(bandId)
          if (band) {
            setSelectedBand(band)
          } else {
            // バンドが見つからない場合はルートにリダイレクト
            router.replace("/")
          }
        }
      } catch (err) {
        console.error("Error fetching bands:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBands()
  }, [bandId, router])

  const handleBandChange = (band: Band) => {
    router.push(`/${band.id}`)
  }

  const refreshBands = async () => {
    const bandsData = await fetchBandsWithMembers()
    setBands(bandsData)
    if (bandId) {
      const band = await fetchBandById(bandId)
      if (band) {
        setSelectedBand(band)
      }
    }
  }

  return {
    bands,
    selectedBand,
    loading,
    handleBandChange,
    refreshBands,
  }
}

