// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const jaStudioChat: StudioChatTranslations = {
  contextUsage: 'コンテキスト使用量',
  composer: {
    addContext: 'コンテキストを追加',
    addContextHint: 'ファイル、画像、リンク、スニペットを追加',
    popOut: '入力欄を切り離す',
    dock: '入力欄を元に戻す',
    skills: 'スキル…',
    autoApprove: '自動承認',
    autoApproveHint: '承認はオフです。コマンドは確認なしで実行されます',
    yoloHint: 'このチャットは YOLO がオンです。コマンドは確認なしで実行されます',
    turnOffYolo: 'このチャットの YOLO をオフにする',
    contextUsagePercent: percent => `コンテキスト使用量 ${percent}%`,
    cacheHit: value => `キャッシュヒット ${value}`,
    stats: {
      cacheHit: 'キャッシュヒット',
      throughput: '生成速度',
      throughputValue: value => `${value} トークン/秒`,
      turnTime: 'このターン',
      sessionCost: 'セッションの費用'
    },
    compress: 'コンテキストを圧縮',
    compressIdleOnly: 'Hermes が待機中のときに使えます',
    usageDetails: '使用量の詳細',
    effortOff: 'オフ',
    moreSendOptions: 'その他の送信方法',
    steerHint: '次のツール呼び出しの後',
    redirectHint: '停止してから送信',
    voiceOptionsHint: '右クリックで音声オプション',
    voiceEngineHint: '右クリックでエンジンを選択',
    placeholderBusy: combo => `コンテキストを追加するか、${combo} で次のターンに予約`,
    placeholderHero: 'Hermes にタスクを — / でコマンド、@ でファイルを参照'
  },
  transcript: {
    delegateSpawned: count => `${count} 個のサブエージェントを起動`,
    delegateRunning: count => `${count} 件実行中`,
    delegateAllDone: 'すべて完了',
    openAgents: 'エージェントで見る',
    approvalTitle: 'Hermes にこのコマンドの実行を許可しますか？',
    approvalTitleAction: 'Hermes にこの操作を許可しますか？',
    approvalMode: '承認モード…',
    needsChoice: '選択が必要です',
    answered: '回答済み',
    questions: count => `質問 ${count} 件`,
    clarifyHint: '1 つ選ぶか、答えを入力してください',
    clarifyHintMulti: '当てはまるものをすべて選ぶか、答えを入力してください',
    recommended: 'おすすめ',
    moreRecovery: 'その他の復旧方法',
    preparingReply: 'Hermes が返信を準備しています',
    timelineLabel: '会話のタイムライン',
    editAndRerun: '編集して再実行',
    editRerunNote: 'ここから送信します。このチャットの以降のメッセージは削除されます',
    previousVersion: '前のバージョン',
    nextVersion: '次のバージョン',
    exportMarkdown: 'Markdown として書き出す…',
    exportFileName: 'Hermes の返信.md',
    exported: name => `${name} を保存しました`,
    exportFailed: '返信を書き出せませんでした'
  },
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
