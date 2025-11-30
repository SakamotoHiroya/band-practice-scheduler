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

interface DisplayNameDialogProps {
  open: boolean
  onSave: (displayName: string) => void
}

export function DisplayNameDialog({
  open,
  onSave,
}: DisplayNameDialogProps) {
  const [displayName, setDisplayName] = useState("")

  const handleSave = () => {
    if (displayName.trim()) {
      onSave(displayName.trim())
      setDisplayName("")
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>表示名を設定</DialogTitle>
          <DialogDescription>
            バンド内で表示される名前を入力してください。
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">表示名</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力"
              onKeyDown={(e) => {
                if (e.key === "Enter" && displayName.trim()) {
                  handleSave()
                }
              }}
              autoFocus
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={!displayName.trim()}
            className="w-full"
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

