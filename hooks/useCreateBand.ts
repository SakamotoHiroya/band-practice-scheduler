import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBand } from "@/services/bandService"
import { useToast } from "@/components/toast"

/**
 * バンド作成機能を管理するフック
 */
export function useCreateBand() {
  const router = useRouter()
  const { showToast } = useToast()
  const [showCreateBandModal, setShowCreateBandModal] = useState(false)
  const [isCreatingBand, setIsCreatingBand] = useState(false)

  const handleOpenCreateBandModal = useCallback(() => {
    setShowCreateBandModal(true)
  }, [])

  const handleCloseCreateBandModal = useCallback(() => {
    setShowCreateBandModal(false)
  }, [])

  const handleCreateBand = useCallback(
    async (bandName: string, redirectToNewBand: boolean = true) => {
      setIsCreatingBand(true)
      try {
        const result = await createBand(bandName.trim())
        if (!result.success) {
          showToast(result.error || "バンドの作成に失敗しました", "error")
          setIsCreatingBand(false)
          return
        }

        if (result.bandId) {
          showToast("バンドを作成しました", "success")
          setShowCreateBandModal(false)
          setIsCreatingBand(false)

          if (redirectToNewBand) {
            router.push(`/${result.bandId}`)
          }
        }
      } catch (err) {
        console.error("Error creating band:", err)
        showToast("エラーが発生しました", "error")
        setIsCreatingBand(false)
      }
    },
    [router, showToast]
  )

  return {
    showCreateBandModal,
    isCreatingBand,
    handleOpenCreateBandModal,
    handleCloseCreateBandModal,
    handleCreateBand,
  }
}

