import { supabaseClient } from "@/lib/supabase"

/**
 * アクターをバンドに追加する（既存の場合は再アクティブ化）
 */
export async function addActorToBand(
  actorId: number,
  bandId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // 既にband-membersに存在するかチェック（is_activeに関係なく）
    const { data: existingMember, error: checkError } = await supabaseClient
      .from("band-members")
      .select("id, is_active")
      .eq("actor_id", actorId)
      .eq("band_id", bandId)
      .limit(1)

    if (checkError) {
      console.error("Error checking band-member:", checkError)
      return { success: false, error: "メンバーの確認に失敗しました" }
    }

    if (existingMember && existingMember.length > 0) {
      const member = existingMember[0]
      // is_activeがfalseの場合は再アクティブ化
      if (member.is_active === false) {
        const { error: updateError } = await supabaseClient
          .from("band-members")
          .update({ is_active: true })
          .eq("id", member.id)

        if (updateError) {
          console.error("Error reactivating member:", updateError)
          return { success: false, error: "メンバーの再アクティブ化に失敗しました" }
        }

        // 再アクティブ化が正しく反映されたか確認（リトライロジック）
        for (let i = 0; i < 5; i++) {
          await new Promise((resolve) => setTimeout(resolve, 400))
          const { data: verifyData, error: verifyError } = await supabaseClient
            .from("band-members")
            .select("is_active")
            .eq("id", member.id)
            .single()

          if (!verifyError && verifyData && verifyData.is_active === true) {
            return { success: true }
          }
        }

        return { success: false, error: "再アクティブ化が正しく反映されていません" }
      }
      // 既にis_active=trueの場合は成功
      return { success: true }
    } else {
      // band-membersテーブルに追加（is_active=trueで）
      const { error: insertError } = await supabaseClient
        .from("band-members")
        .insert({
          actor_id: actorId,
          band_id: bandId,
          is_active: true,
        })

      if (insertError) {
        console.error("Error adding actor to band:", insertError)
        return { success: false, error: "メンバーの追加に失敗しました" }
      }

      // 追加が正しく反映されたか確認（リトライロジック）
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const { data: verifyData, error: verifyError } = await supabaseClient
          .from("band-members")
          .select("id, is_active")
          .eq("actor_id", actorId)
          .eq("band_id", bandId)
          .eq("is_active", true)
          .limit(1)

        if (!verifyError && verifyData && verifyData.length > 0) {
          return { success: true }
        }
      }

      return { success: false, error: "メンバーの追加が正しく反映されていません" }
    }
  } catch (err) {
    console.error("Unexpected error adding actor to band:", err)
    return { success: false, error: "エラーが発生しました" }
  }
}

