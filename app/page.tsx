"use client"

import { useCallback } from "react"
import { CreateBandModal } from "@/components/CreateBandModal"
import { useAuth } from "@/hooks/useAuth"
import { useCreateBand } from "@/hooks/useCreateBand"
import { useUserBands } from "@/hooks/useUserBands"
import { ToastContainer, useToast } from "@/components/toast"
import { BandList } from "@/components/BandList"
import { HomeHeader } from "@/components/HomeHeader"
import { LoadingIndicator } from "@/components/LoadingIndicator"
import { GuestWelcomeSection } from "@/components/GuestWelcomeSection"

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, login } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  const {
    showCreateBandModal,
    isCreatingBand,
    handleOpenCreateBandModal,
    handleCloseCreateBandModal,
    handleCreateBand,
  } = useCreateBand()
  
  // バンド一覧を取得
  const bands = useUserBands(user?.id || null, isAuthenticated, authLoading)

  const handleLogin = useCallback(async () => {
    try {
      await login()
    } catch (err) {
      console.error("Login error:", err)
      showToast("ログインに失敗しました", "error")
    }
  }, [login, showToast])


  return (
    <div className="min-h-screen bg-background">
      {/* 通知 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* バンド作成モーダル */}
      <CreateBandModal
        open={showCreateBandModal}
        onClose={handleCloseCreateBandModal}
        onCreate={handleCreateBand}
        loading={isCreatingBand}
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <HomeHeader />

          {authLoading ? (
            <LoadingIndicator />
          ) : isAuthenticated ? (
            <BandList
              bands={bands}
              onCreateBand={handleOpenCreateBandModal}
            />
          ) : (
            <GuestWelcomeSection
              onLogin={handleLogin}
              onCreateBand={handleOpenCreateBandModal}
            />
          )}
        </div>
      </div>
    </div>
  )
}
