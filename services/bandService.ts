import { supabaseClient } from "@/lib/supabase"
import type { Band, Member } from "@/lib/types"
import { MEMBER_COLORS } from "@/constants"

/**
 * バンドとメンバー情報を取得する
 */
export async function fetchBandsWithMembers(): Promise<Band[]> {
  try {
    const { data: bandsData, error: bandsError } = await supabaseClient
      .from("bands")
      .select("id, name")
      .order("name")

    if (bandsError) {
      console.error("Error fetching bands:", bandsError)
      return []
    }

    if (!bandsData || bandsData.length === 0) {
      return []
    }

    // 各バンドのメンバーを取得
    const bandsWithMembers = await Promise.all(
      bandsData.map(async (band) => {
        const { data: bandMembersData, error: bandMembersError } = await supabaseClient
          .from("band-members")
          .select("actor_id")
          .eq("band_id", band.id)
          .eq("is_active", true)

        if (bandMembersError) {
          console.error(`Error fetching band members for band ${band.id}:`, bandMembersError)
          return { ...band, members: [] }
        }

        if (!bandMembersData || bandMembersData.length === 0) {
          return { ...band, members: [] }
        }

        // 各actorの情報を取得
        const actorIds = bandMembersData.map((bm) => bm.actor_id)

        if (actorIds.length === 0) {
          return { ...band, members: [] }
        }

        const { data: actorsData, error: actorsError } = await supabaseClient
          .from("actors")
          .select("id, display_name")
          .in("id", actorIds)

        if (actorsError) {
          console.error(`Error fetching actors for band ${band.id}:`, actorsError)
          return { ...band, members: [] }
        }

        if (!actorsData || actorsData.length === 0) {
          return { ...band, members: [] }
        }

        // Memberオブジェクトを作成
        const members: Member[] = actorsData.map((actor, index) => ({
          id: actor.id,
          name: actor.display_name || `ゲスト${actor.id}`,
          color: MEMBER_COLORS[index % MEMBER_COLORS.length],
        }))

        return { ...band, members }
      })
    )

    return bandsWithMembers
  } catch (err) {
    console.error("Unexpected error fetching bands:", err)
    return []
  }
}

/**
 * 指定されたバンドIDのバンド情報を取得する
 */
export async function fetchBandById(bandId: number): Promise<Band | null> {
  const bands = await fetchBandsWithMembers()
  return bands.find((band) => band.id === bandId) || null
}

/**
 * 新しいバンドを作成する
 */
export async function createBand(name: string): Promise<{ success: boolean; bandId?: number; error?: string }> {
  try {
    if (!name.trim()) {
      return { success: false, error: "バンド名を入力してください" }
    }

    const { data, error } = await supabaseClient
      .from("bands")
      .insert({ name: name.trim() })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating band:", error)
      return { success: false, error: "バンドの作成に失敗しました" }
    }

    if (!data) {
      return { success: false, error: "バンドの作成に失敗しました" }
    }

    return { success: true, bandId: data.id }
  } catch (err) {
    console.error("Unexpected error creating band:", err)
    return { success: false, error: "エラーが発生しました" }
  }
}

/**
 * バンドからメンバーを削除する（ソフトデリート）
 */
export async function removeMemberFromBand(
  bandId: number,
  actorId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // band-membersテーブルから該当メンバーを探す
    const { data: bandMember, error: findError } = await supabaseClient
      .from("band-members")
      .select("id")
      .eq("band_id", bandId)
      .eq("actor_id", actorId)
      .eq("is_active", true)
      .limit(1)

    if (findError) {
      console.error("Error finding band-member:", findError)
      return { success: false, error: "メンバーの検索に失敗しました" }
    }

    if (!bandMember || bandMember.length === 0) {
      return { success: false, error: "メンバーが見つかりませんでした" }
    }

    // is_activeをfalseに更新（ソフトデリート）
    const { error: updateError } = await supabaseClient
      .from("band-members")
      .update({ is_active: false })
      .eq("id", bandMember[0].id)

    if (updateError) {
      console.error("Error removing member:", updateError)
      return { success: false, error: "メンバーの削除に失敗しました" }
    }

    return { success: true }
  } catch (err) {
    console.error("Unexpected error removing member:", err)
    return { success: false, error: "エラーが発生しました" }
  }
}

