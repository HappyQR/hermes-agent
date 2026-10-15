import type { SessionInfo } from '@/hermes'
import { getAllSessionMessages } from '@/hermes'
import { translateNow } from '@/i18n'
import { toChatMessages } from '@/lib/chat-messages/hydration'
import type { ChatMessage } from '@/lib/chat-messages/types'
import { notify, notifyError } from '@/store/notifications'

interface ExportSessionParams {
  sessionId: string
  profile?: string | null
  title?: string | null
  session?: SessionInfo
}

function sanitizeFilenamePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function sessionExportFilename(sessionId: string, title?: string | null, extension = 'json') {
  const titlePart = title ? sanitizeFilenamePart(title) : ''
  const idPart = sanitizeFilenamePart(sessionId).slice(0, 8) || 'session'

  return `${titlePart || 'session'}-${idPart}.${extension}`
}

function download(blob: Blob, filename: string) {
  const downloadUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = downloadUrl
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(downloadUrl)
}

const textOf = (message: ChatMessage) =>
  message.parts
    .flatMap(part => (part.type === 'text' && typeof part.text === 'string' ? [part.text.trim()] : []))
    .filter(Boolean)
    .join('\n\n')

/** The conversation as Markdown: the title, then each visible user and
 *  assistant turn under its speaker. Tool calls and reasoning stay out — the
 *  JSON export carries the full record. */
export function sessionMarkdown(
  title: string,
  messages: readonly ChatMessage[],
  speakers: { assistant: string; user: string }
): string {
  const lines = [`# ${title.trim() || 'Session'}`]

  for (const message of messages) {
    const text = message.hidden ? '' : textOf(message)

    if (text && (message.role === 'user' || message.role === 'assistant')) {
      lines.push('', `## ${message.role === 'user' ? speakers.user : speakers.assistant}`, '', text)
    }
  }

  return `${lines.join('\n')}\n`
}

export async function exportSession(sessionId: string, params: Omit<ExportSessionParams, 'sessionId'> = {}) {
  if (!sessionId) {
    return
  }

  try {
    const profile = params.profile ?? params.session?.profile
    const { messages } = await getAllSessionMessages(sessionId, profile)

    const payload = {
      exported_at: new Date().toISOString(),
      session_id: sessionId,
      title: params.title ?? null,
      session: params.session ?? null,
      message_count: messages.length,
      messages
    }

    download(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      sessionExportFilename(sessionId, params.title)
    )

    notify({ kind: 'success', message: translateNow('desktop.sessionExported'), durationMs: 2_000 })
  } catch (err) {
    notifyError(err, translateNow('desktop.sessionExportFailed'))
  }
}

/** Download the session's conversation as a Markdown file. */
export async function exportSessionMarkdown(sessionId: string, params: Omit<ExportSessionParams, 'sessionId'> = {}) {
  if (!sessionId) {
    return
  }

  try {
    const profile = params.profile ?? params.session?.profile
    const { messages } = await getAllSessionMessages(sessionId, profile)

    const markdown = sessionMarkdown(params.title ?? '', toChatMessages(messages), {
      assistant: translateNow('studio.sidebar.menu.exportAssistant'),
      user: translateNow('studio.sidebar.menu.exportUser')
    })

    download(new Blob([markdown], { type: 'text/markdown' }), sessionExportFilename(sessionId, params.title, 'md'))

    notify({ kind: 'success', message: translateNow('desktop.sessionExported'), durationMs: 2_000 })
  } catch (err) {
    notifyError(err, translateNow('desktop.sessionExportFailed'))
  }
}
