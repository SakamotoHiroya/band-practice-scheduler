import { useState, useEffect } from "react"
import type { Member, Band } from "@/lib/types"

/**
 * 選択されたメンバーを管理するフック
 */
export function useMemberSelection(selectedBand: Band | null) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // 選択されたバンドの最初のメンバーを選択
  useEffect(() => {
    if (selectedBand && selectedBand.members.length > 0) {
      setSelectedMember(selectedBand.members[0])
    } else {
      setSelectedMember(null)
    }
  }, [selectedBand])

  return { selectedMember, setSelectedMember }
}

