// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const jaStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: '設定を検索',
  pages: {
    general: {
      title: '一般',
      hero: '言語、起動方法、ヒント、ウインドウの動作。'
    },
    appearance: {
      title: '外観',
      hero: 'カラー、テーマ、ウインドウのガラス、フォント、ペット。'
    },
    chat: {
      title: 'チャット',
      hero: '返信のスタイルと、思考過程・ツール呼び出し・メッセージの表示方法。'
    },
    notifications: {
      title: '通知',
      hero: 'どんなときに通知するか、作業完了時のサウンド。'
    },
    keyboard: {
      title: 'キーボードとショートカット',
      hero: 'ショートカット、クイック質問、HUD ジェスチャ、ウインドウのキャプチャ。'
    },
    models: {
      title: 'モデル',
      hero: 'デフォルトのモデル、予備のモデル、バックグラウンド処理用の補助モデル。'
    },
    providers: {
      title: 'アカウントとプロバイダー',
      hero: 'サインイン中のアカウント、API キー、カスタムエンドポイント、ローカルモデル。'
    },
    memory: {
      title: 'メモリとコンテキスト',
      hero: 'Hermes が何をどれだけ覚えるか、長い会話をどう圧縮するか。'
    },
    voice: {
      title: '音声',
      hero: '音声会話、音声入力、読み上げ、ウェイクワード。'
    },
    workspace: {
      title: 'ワークスペース',
      hero: 'プロジェクトフォルダ、コマンドの実行環境、ファイルのチェックポイント。'
    },
    safety: {
      title: '安全とプライバシー',
      hero: 'コマンドの承認、プライバシー、ブラウザとプライベートネットワークへのアクセス。'
    },
    passwords: {
      title: 'パスワードとログイン',
      hero: 'Hermes があなたの代わりにサイトへサインインするときの認証情報。'
    },
    tools: {
      title: 'ツールとキー',
      hero: 'ツールサービスの API キーとサーバーの環境変数。'
    },
    gateways: {
      title: 'ゲートウェイと接続',
      hero: 'このウインドウが接続する Hermes と、保存された接続。'
    },
    sessions: {
      title: 'セッションとアーカイブ',
      hero: '自動アーカイブとアーカイブ済みのセッション。'
    },
    plugins: {
      title: 'プラグイン',
      hero: page => `インストール済みプラグインの設定です。インストールと有効化は「${page} › プラグイン」で行います。`
    },
    billing: {
      title: '請求',
      hero: '残高、プラン、自動チャージ、利用上限。'
    },
    advanced: {
      title: '詳細設定',
      hero: 'エージェントのステップ数、ターミナルのバックエンド、サブエージェント、出力の上限。Hermes に詳しい方向け。'
    },
    about: {
      title: 'Hermes について',
      hero: 'バージョン、アップデート、設定のバックアップ、アンインストール。'
    }
  },
  window: {
    navLabel: '設定のカテゴリ',
    noResults: query => `「${query}」に一致する項目はありません`,
    categoryResult: 'カテゴリ',
    onlyThisMac: 'この Mac のみ',
    onlyThisDevice: 'このデバイスのみ',
    appliesToProfile: profile => `「${profile}」に適用`,
    appliesTo: '適用先',
    scopeMenuTitle: 'これらの設定の適用先'
  }
}
