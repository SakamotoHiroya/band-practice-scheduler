"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface CreateBandModalProps {
  open: boolean
  onClose: () => void
  onCreate: (bandName: string) => Promise<void>
  loading?: boolean
}

export function CreateBandModal({
  open,
  onClose,
  onCreate,
  loading = false,
}: CreateBandModalProps) {
  const [bandName, setBandName] = useState("")

  const handleCreate = async () => {
    if (!bandName.trim()) {
      return
    }

    await onCreate(bandName.trim())
    setBandName("")
  }

  const handleClose = () => {
    setBandName("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいバンドを作成</DialogTitle>
          <DialogDescription>
            バンド名を入力してください
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">バンド名</label>
            <Input
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              placeholder="バンド名を入力"
              onKeyDown={(e) => {
                if (e.key === "Enter" && bandName.trim() && !loading) {
                  handleCreate()
                }
              }}
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!bandName.trim() || loading}
            >
              {loading ? "作成中..." : "作成"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

