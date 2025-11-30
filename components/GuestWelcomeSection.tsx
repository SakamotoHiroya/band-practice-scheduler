import { Button } from "@/components/ui/button"
import { Plus, LogIn } from "lucide-react"

interface GuestWelcomeSectionProps {
  onLogin: () => void
  onCreateBand: () => void
}

/**
 * ゲストユーザー向けのウェルカムセクション
 */
export function GuestWelcomeSection({ onLogin, onCreateBand }: GuestWelcomeSectionProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-6">
        ログインすると参加しているバンドが一覧で表示されるようになります
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          onClick={onLogin}
          className="gap-2"
          size="lg"
        >
          <LogIn className="h-5 w-5" />
          Googleでログイン
        </Button>
        <Button
          onClick={onCreateBand}
          variant="outline"
          className="gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          新しいバンドを作成
        </Button>
      </div>
    </div>
  )
}

