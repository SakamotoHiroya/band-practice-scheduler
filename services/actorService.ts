import { supabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export interface Actor {
  id: number
  display_name: string | null
}

/**
 * ユーザーIDからアクターを取得する
 */
export async function fetchActorByUserId(userId: string): Promise<Actor | null> {
  const { data, error } = await supabaseClient
    .from("actors")
    .select("id, display_name")
    .eq("user_id", userId)
    .limit(1)

  if (error) {
    console.error("Error fetching actor:", error)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  return { id: data[0].id, display_name: data[0].display_name }
}

/**
 * アクターを作成する（Googleアカウント用）
 */
export async function createActorForUser(user: User): Promise<Actor | null> {
  const { data, error } = await supabaseClient
    .from("actors")
    .insert({
      is_guest: false,
      user_id: user.id,
      display_name: null,
    })
    .select("id, display_name")
    .single()

  if (error) {
    // 重複エラーの可能性があるため、再度チェック
    if (error.code === "23505") {
      return await fetchActorByUserId(user.id)
    }
    console.error("Error creating actor:", error)
    return null
  }

  return data ? { id: data.id, display_name: data.display_name } : null
}

/**
 * ゲストアクターを作成する
 */
export async function createGuestActor(displayName: string): Promise<Actor | null> {
  const { data, error } = await supabaseClient
    .from("actors")
    .insert({
      is_guest: true,
      display_name: displayName,
      user_id: null,
    })
    .select("id, display_name, is_guest")
    .single()

  if (error) {
    console.error("Error creating guest actor:", error)
    return null
  }

  console.log("Created guest actor:", data)
  return data ? { id: data.id, display_name: data.display_name } : null
}

/**
 * アクターの表示名を更新する
 */
export async function updateActorDisplayName(
  actorId: number,
  displayName: string
): Promise<boolean> {
  const { error } = await supabaseClient
    .from("actors")
    .update({ display_name: displayName })
    .eq("id", actorId)

  if (error) {
    console.error("Error updating display name:", error)
    return false
  }

  return true
}

/**
 * アクターがバンドに参加しているかチェックする
 */
export async function checkActorInBand(
  actorId: number,
  bandId: number
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from("band-members")
    .select("id")
    .eq("actor_id", actorId)
    .eq("band_id", bandId)
    .eq("is_active", true)
    .limit(1)

  if (error) {
    console.error("Error checking actor in band:", error)
    return false
  }

  return data && data.length > 0
}

/**
 * バンドに参加しているゲストアクターのリストを取得する
 */
export async function fetchGuestActorsInBand(bandId: number): Promise<Actor[]> {
  try {
    console.log("fetchGuestActorsInBand called with bandId:", bandId)
    // バンドのメンバー（is_active=true）のactor_idを取得
    const { data: bandMembersData, error: bandMembersError } = await supabaseClient
      .from("band-members")
      .select("actor_id")
      .eq("band_id", bandId)
      .eq("is_active", true)

    console.log("band-members query result:", { bandMembersData, bandMembersError })

    if (bandMembersError || !bandMembersData || bandMembersData.length === 0) {
      console.log("No band members found or error occurred")
      return []
    }

    const actorIds = bandMembersData.map((bm) => bm.actor_id)
    console.log("Actor IDs from band-members:", actorIds)

    // ゲストアクターを取得（is_guestフィルタなしで全件取得してからフィルタリング）
    // これにより、新しく作成されたゲストアクターも確実に取得できる
    const { data: actorsData, error: actorsError } = await supabaseClient
      .from("actors")
      .select("id, display_name, is_guest")
      .in("id", actorIds)

    console.log("actors query result (all):", { actorsData, actorsError })

    if (actorsError) {
      console.error("Error fetching guest actors:", actorsError)
      return []
    }

    // クライアント側でis_guest=trueのものだけをフィルタリング
    // is_guestがtrueまたはnull（デフォルト値が設定されていない場合）も含める
    const guestActorsData = actorsData?.filter((actor) => {
      const isGuest = actor.is_guest === true || actor.is_guest === null
      console.log(`Actor ${actor.id}: is_guest=${actor.is_guest}, filtered=${isGuest}`)
      return isGuest
    }) || []
    console.log("Filtered guest actors:", guestActorsData)
    console.log("All actors (for debugging):", actorsData)

    const result = guestActorsData.map((actor) => ({
      id: actor.id,
      display_name: actor.display_name,
    }))
    console.log("Final guest actors result:", result)
    return result
  } catch (err) {
    console.error("Unexpected error fetching guest actors:", err)
    return []
  }
}

