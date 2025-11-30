"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Github, GitBranch, Code, Bug, FileText, MessageSquare } from "lucide-react"

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                トップページに戻る
              </Button>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              How to contribute
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              BandSchedulerへの貢献を歓迎します！
            </p>
            <a
              href="https://github.com/SakamotoHiroya/band-practice-scheduler"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 mt-10 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 border-2 border-primary/50 hover:border-primary"
            >
              <Github className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              <div className="flex flex-col items-start">
                <span className="text-xs opacity-90 font-normal">View on GitHub</span>
                <span className="leading-tight">SakamotoHiroya/band-practice-scheduler</span>
              </div>
            </a>
          </div>

          {/* メインコンテンツ */}
          <div className="space-y-8">
            {/* はじめに */}
            <section className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Github className="h-6 w-6 text-primary" />
                はじめに
              </h2>
              <p className="text-muted-foreground mb-4">
                BandSchedulerはオープンソースプロジェクトです。バグ報告、機能提案、コード改善など、あらゆる形での貢献を歓迎します。
              </p>
              <p className="text-muted-foreground mb-4">
                コントリビュートする前に、プロジェクトのリポジトリを確認し、既存のIssueやPull Requestを確認してください。
              </p>
              <a
                href="https://github.com/SakamotoHiroya/band-practice-scheduler"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <Github className="h-4 w-4" />
                <span>GitHubリポジトリ: SakamotoHiroya/band-practice-scheduler</span>
              </a>
            </section>

            {/* コントリビュートの種類 */}
            <section className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-semibold mb-4">コントリビュートの種類</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">バグ報告</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    不具合を発見した場合は、Issueを作成して報告してください。再現手順や環境情報を含めると助かります。
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">機能追加・改善</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    新機能の提案や既存機能の改善案をIssueで共有してください。実装する場合はPull Requestを作成します。
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">ドキュメント改善</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    READMEの改善、コメントの追加、ドキュメントの整備なども大歓迎です。
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">フィードバック</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    使い勝手やUI/UXに関する意見や提案も歓迎します。IssueやDiscussionで共有してください。
                  </p>
                </div>
              </div>
            </section>

            {/* コントリビュートの手順 */}
            <section className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="h-6 w-6 text-primary" />
                コントリビュートの手順
              </h2>
              <ol className="space-y-4 list-decimal list-inside">
                <li className="pl-2">
                  <strong className="text-foreground">リポジトリをフォーク</strong>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    GitHubでリポジトリをフォークして、自分のアカウントにコピーを作成します。
                  </p>
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">リポジトリをクローン</strong>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    フォークしたリポジトリをローカル環境にクローンします。
                  </p>
                  <pre className="mt-2 ml-6 p-3 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>git clone https://github.com/your-username/band-practice-scheduler.git</code>
                  </pre>
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">ブランチを作成</strong>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    新しい機能や修正用のブランチを作成します。ブランチ名は命名規則に従ってください（例: <code className="text-xs bg-muted px-1 py-0.5 rounded">feature/add-user-authentication</code>）。
                  </p>
                  <pre className="mt-2 ml-6 p-3 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>git checkout -b feature/add-user-authentication</code>
                  </pre>
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">変更を加える</strong>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    コードの変更、バグ修正、機能追加などを行います。コーディング規約に従ってください。
                  </p>
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">変更をコミット</strong>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    変更内容をコミットします。コミットメッセージは変更内容が明確に分かるように記述してください。
                  </p>
                  <pre className="mt-2 ml-6 p-3 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>git add .</code>
                    <br />
                    <code>git commit -m "feat: 新しい機能を追加"</code>
                  </pre>
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">変更をプッシュ</strong>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    作成したブランチをリモートリポジトリにプッシュします。
                  </p>
                  <pre className="mt-2 ml-6 p-3 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>git push origin feature/add-user-authentication</code>
                  </pre>
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">Pull Requestを作成</strong>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    GitHub上でPull Requestを作成します。変更内容、目的、テスト方法などを詳しく記述してください。
                  </p>
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">レビューとマージ</strong>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    メンテナーがレビューを行い、問題がなければマージされます。フィードバックがあれば対応してください。
                  </p>
                </li>
              </ol>
            </section>

            {/* コーディング規約 */}
            <section className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-semibold mb-4">コーディング規約</h2>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>既存のコードスタイルに従ってください</li>
                <li>TypeScriptの型定義を適切に使用してください</li>
                <li>コンポーネントは再利用可能な形で設計してください</li>
                <li>適切なコメントを追加してください</li>
                <li>ESLintのルールに従ってください</li>
                <li>テストを追加することを推奨します</li>
              </ul>
            </section>

            {/* ブランチの命名規則 */}
            <section className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="h-6 w-6 text-primary" />
                ブランチの命名規則
              </h2>
              <p className="text-muted-foreground mb-4">
                ブランチ名は以下の形式に従ってください。プレフィックスと説明をスラッシュ（/）で区切ります。
              </p>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-foreground">プレフィックスの種類</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-semibold">feature/</code>
                    <span className="text-sm text-muted-foreground ml-2">新機能の追加</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-semibold">fix/</code>
                    <span className="text-sm text-muted-foreground ml-2">バグ修正</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-semibold">docs/</code>
                    <span className="text-sm text-muted-foreground ml-2">ドキュメントの更新</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-semibold">refactor/</code>
                    <span className="text-sm text-muted-foreground ml-2">コードのリファクタリング</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-semibold">test/</code>
                    <span className="text-sm text-muted-foreground ml-2">テストの追加・修正</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-semibold">style/</code>
                    <span className="text-sm text-muted-foreground ml-2">コードスタイルの変更（機能に影響しない）</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-semibold">chore/</code>
                    <span className="text-sm text-muted-foreground ml-2">ビルドプロセスやツールの変更</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-foreground">命名のルール</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>ブランチ名は小文字で記述してください</li>
                  <li>単語はハイフン（-）で区切ってください</li>
                  <li>簡潔で分かりやすい名前を付けましょう</li>
                  <li>Issue番号がある場合は含めてください</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">命名例</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">feature/add-user-authentication</code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">fix/schedule-display-bug</code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">docs/update-contribution-guide</code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">refactor/schedule-component</code>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">feature/123-add-dark-mode</code>
                    <span className="text-xs text-muted-foreground ml-2">（Issue #123に関連する場合）</span>
                  </div>
                </div>
              </div>
            </section>

            {/* コミットメッセージの規約 */}
            <section className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-semibold mb-4">コミットメッセージの規約</h2>
              <p className="text-muted-foreground mb-4">
                コミットメッセージは以下の形式に従ってください：
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">feat: 新機能を追加</code>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">fix: バグを修正</code>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">docs: ドキュメントを更新</code>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">style: コードスタイルを修正</code>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">refactor: コードをリファクタリング</code>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">test: テストを追加</code>
                </div>
              </div>
            </section>

            {/* 質問・サポート */}
            <section className="bg-card rounded-lg p-6 border">
              <h2 className="text-2xl font-semibold mb-4">質問・サポート</h2>
              <p className="text-muted-foreground mb-4">
                コントリビュートに関する質問や不明な点がある場合は、以下の方法でお気軽にお問い合わせください：
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>GitHubのIssueで質問する</li>
                <li>Discussionで議論に参加する</li>
                <li>Pull Requestのコメントで質問する</li>
              </ul>
            </section>

            {/* フッター */}
            <div className="text-center pt-8 border-t">
              <p className="text-muted-foreground">
                ご協力をお待ちしています!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

