import { useState, useEffect, useRef } from "react"
import { fetchBandsByActorId } from "@/services/bandService"
import { fetchActorByUserId } from "@/services/actorService"
import { useToast } from "@/components/toast"

interface Band {
  id: number
  name: string
}

/**
 * ログインユーザーが参加しているバンド一覧を管理するフック
 */
export function useUserBands(userId: string | null, isAuthenticated: boolean, authLoading: boolean) {
  const [bands, setBands] = useState<Band[] | null>(null)
  const { showToast } = useToast()
  
  // 前回取得したユーザーIDを記録（無限ループ防止）
  const lastUserIdRef = useRef<string | null>(null)
  // 取得中フラグ（重複実行防止）
  const fetchingRef = useRef(false)
  // showToastの参照を保持（依存配列から除外するため）
  const showToastRef = useRef(showToast)

  // showToastの参照を最新に保つ
  useEffect(() => {
    showToastRef.current = showToast
  }, [showToast])

  // バンド一覧を取得（ログインユーザーのみ、参加しているバンドのみ）
  useEffect(() => {
    // 認証状態の読み込み中は何もしない
    if (authLoading) {
      return
    }

    // ログインしていない場合は空配列を設定
    if (!isAuthenticated || !userId) {
      if (lastUserIdRef.current !== null) {
        setBands([])
        lastUserIdRef.current = null
      }
      return
    }

    // 既に同じユーザーのデータを取得済みの場合はスキップ
    if (lastUserIdRef.current === userId) {
      return
    }

    // 既に取得中の場合はスキップ
    if (fetchingRef.current) {
      return
    }

    // バンド一覧を取得
    const loadBands = async () => {
      fetchingRef.current = true
      try {
        // アクターを取得
        const actor = await fetchActorByUserId(userId)
        if (!actor) {
          setBands([])
          lastUserIdRef.current = userId
          fetchingRef.current = false
          return
        }

        // アクターが参加しているバンドのみを取得
        const bandsData = await fetchBandsByActorId(actor.id)
        setBands(bandsData)
        lastUserIdRef.current = userId
      } catch (err) {
        console.error("Unexpected error:", err)
        showToastRef.current("バンド一覧の取得中にエラーが発生しました", "error")
        setBands([])
      } finally {
        fetchingRef.current = false
      }
    }

    loadBands()
  }, [authLoading, isAuthenticated, userId])

  return bands
}

