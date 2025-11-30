import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "./useAuth"
import {
  fetchActorByUserId,
  createActorForUser,
  checkActorInBand,
  updateActorDisplayName,
} from "@/services/actorService"
import { addActorToBand } from "@/services/bandMemberService"

export interface ActorState {
  id: number
}

/**
 * アクターの状態を管理するフック
 * ログイン済みユーザーのアクター取得/作成と、バンド参加状態を管理
 */
export function useActor(bandId: number | null) {
  const { user } = useAuth()
  const [actor, setActor] = useState<ActorState | null>(null)
  const [actorLoading, setActorLoading] = useState(true)
  const [isActorInBand, setIsActorInBand] = useState<boolean | null>(null)
  const [showDisplayNameDialog, setShowDisplayNameDialog] = useState(false)
  const [pendingActorId, setPendingActorId] = useState<number | null>(null)
  const justJoinedRef = useRef(false)
  const [isParticipating, setIsParticipating] = useState(false) // 参加処理中フラグ（状態として管理）

  /**
   * バンド参加状態をチェック
   */
  const checkBandMembership = useCallback(
    async (actorId: number, targetBandId: number) => {
      try {
        const isInBand = await checkActorInBand(actorId, targetBandId)
        setIsActorInBand(isInBand)
        return isInBand
      } catch (err) {
        console.error("Error checking band membership:", err)
        setIsActorInBand(false)
        return false
      }
    },
    []
  )

  /**
   * アクターを取得または作成（ログイン済みユーザー用）
   */
  const fetchOrCreateActor = useCallback(async () => {
    if (!user) {
      setActor(null)
      setActorLoading(false)
      setIsActorInBand(null)
      return
    }

    setActorLoading(true)
    try {
      // 既存のアクターを取得
      let actorData = await fetchActorByUserId(user.id)

      if (!actorData) {
        // アクターが存在しない場合は作成
        actorData = await createActorForUser(user)
      }

      if (!actorData) {
        console.error("Failed to fetch or create actor")
        setActorLoading(false)
        return
      }

      // display_nameが設定されているかチェック
      if (
        actorData.display_name === null ||
        actorData.display_name === undefined ||
        (typeof actorData.display_name === "string" && actorData.display_name.trim() === "")
      ) {
        // display_nameがnullまたは未設定の場合はダイアログを表示
        setPendingActorId(actorData.id)
        setShowDisplayNameDialog(true)
        setActorLoading(false)
        return
      }

      // アクターを設定
      setActor({ id: actorData.id })

      // バンドに参加しているかチェック（自動参加はしない）
      if (bandId) {
        // 参加状態をチェックするだけ（自動参加しない）
        await checkBandMembership(actorData.id, bandId)
      } else {
        setIsActorInBand(null)
      }

      setActorLoading(false)
    } catch (err) {
      console.error("Error in fetchOrCreateActor:", err)
      setActorLoading(false)
    }
  }, [user, bandId, checkBandMembership])

  // ログイン状態が変更されたらアクターを取得
  useEffect(() => {
    fetchOrCreateActor()
  }, [fetchOrCreateActor])

  // actorがバンドに参加しているかチェック（actorまたはbandIdが変更された場合）
  useEffect(() => {
    if (!actor || !bandId) {
      setIsActorInBand(null)
      justJoinedRef.current = false
      return
    }

    // 最近参加した場合は、少し待ってから確認（データベースへの反映を待つ）
    if (justJoinedRef.current) {
      justJoinedRef.current = false
      // 既にisActorInBandがtrueに設定されているので、確認はスキップ
      return
    }

    // バンド参加状態をチェック
    checkBandMembership(actor.id, bandId)
  }, [actor, bandId, checkBandMembership])

  /**
   * 表示名を保存
   */
  const handleDisplayNameSave = useCallback(
    async (displayName: string) => {
      if (!pendingActorId) return

      setActorLoading(true)
      const success = await updateActorDisplayName(pendingActorId, displayName)
      if (!success) {
        alert("表示名の設定に失敗しました")
        setActorLoading(false)
        return
      }

      setShowDisplayNameDialog(false)
      const savedActorId = pendingActorId
      setPendingActorId(null)

      // バンドに参加しているかチェック
      if (bandId) {
        const addResult = await addActorToBand(savedActorId, bandId)
        if (addResult.success) {
          // 参加処理中フラグを設定
          setIsParticipating(true)
          // justJoinedRefを設定して、useEffectでのチェックをスキップ
          justJoinedRef.current = true
          setIsActorInBand(true)
          // 少し待ってからjustJoinedRefとisParticipatingをリセット
          setTimeout(() => {
            justJoinedRef.current = false
            setIsParticipating(false)
          }, 1000)
        } else {
          await checkBandMembership(savedActorId, bandId)
        }
      }

      // アクターを設定（バンド参加処理の後）
      setActor({ id: savedActorId })
      setActorLoading(false)
    },
    [pendingActorId, bandId, checkBandMembership]
  )

  /**
   * ゲストとして参加
   */
  const handleGuestSelected = useCallback(
    async (actorId: number) => {
      // 参加処理中フラグを設定
      setIsParticipating(true)
      
      // actorを設定
      setActor({ id: actorId })

      // バンドに参加しているかチェック
      if (bandId) {
        justJoinedRef.current = true
        setIsActorInBand(true)
        // 少し待ってからjustJoinedRefとisParticipatingをリセット
        setTimeout(() => {
          justJoinedRef.current = false
          setIsParticipating(false)
        }, 1000)
      } else {
        setIsParticipating(false)
      }
    },
    [bandId]
  )

  /**
   * アクターをリセット（ログアウト時など）
   */
  const resetActor = useCallback(() => {
    setActor(null)
    setIsActorInBand(null)
    setActorLoading(true)
    justJoinedRef.current = false
    setIsParticipating(false)
  }, [])

  /**
   * 参加処理を開始（ログイン時など）
   */
  const startParticipating = useCallback(() => {
    setIsParticipating(true)
    // 1秒後に自動的にリセット（参加処理が完了したと仮定）
    setTimeout(() => {
      setIsParticipating(false)
    }, 1000)
  }, [])

  return {
    actor,
    actorLoading,
    isActorInBand,
    showDisplayNameDialog,
    pendingActorId,
    handleDisplayNameSave,
    handleGuestSelected,
    resetActor,
    isParticipating,
    startParticipating,
  }
}
