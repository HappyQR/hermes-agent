// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const jaStudioChat: StudioChatTranslations = {
  contextUsage: 'コンテキスト使用量',
  tray: {
    label: 'アクティビティ',
    hide: 'アクティビティを隠す',
    show: count => `アクティビティを表示（${count}）`,
    approval: count => (count > 1 ? `承認待ち · ${count}` : '承認待ち'),
    approvalHint: '承認を待っているコマンドへ移動',
    needsInput: '選択を待っています',
    needsInputHint: '質問へ移動',
    previews: count => `プレビュー ${count}`,
    more: 'その他',
    close: '閉じる',
    titles: {
      background: 'バックグラウンドプロセス',
      preview: 'プレビューリンク',
      previousTodo: '以前のタスク',
      queue: 'キュー',
      subagent: 'サブエージェント',
      todo: 'タスク'
    },
    todoCaption: 'このターンの間は Hermes が更新します',
    queueCaption: 'このターンの後に順番に送信します',
    git: {
      hint: 'ブランチ、変更、ワークツリー',
      reviewChanges: '変更をレビュー',
      openPullRequest: number => `プルリクエスト #${number} を開く`,
      copyWorktreePath: 'ワークツリーのパスをコピー'
    }
  }
}
