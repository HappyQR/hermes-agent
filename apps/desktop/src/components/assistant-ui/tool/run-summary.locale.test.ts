import { afterEach, describe, expect, it } from 'vitest'

import { setRuntimeI18nLocale } from '@/i18n'
import { summarizeShellCommand } from '@/lib/summarize-command'

import { summarizeToolRun, type ToolCallLike, toolPresentVerb } from './run-summary'

function tool(toolName: string, args: Record<string, unknown> = {}, result?: unknown): ToolCallLike {
  return { args, result, toolCallId: `${toolName}-${Math.random()}`, toolName }
}

const read = (path: string) => tool('read_file', { path }, { content: '' })
const ran = (command: string) => tool('terminal', { command }, { exit_code: 0 })
const commands = (count: number) => Array.from({ length: count }, (_, index) => ran(`cmd${index}`))

// Every category, each holding more than one thing, so every clause counts
// rather than naming a (Latin-script) target.
const everyCategory = (): ToolCallLike[] => [
  read('a.ts'),
  read('b.ts'),
  tool('patch', { path: 'a.ts' }, { success: true }),
  tool('patch', { path: 'b.ts' }, { success: true }),
  tool('web_search', { query: 'kv cache' }, { success: true }),
  tool('web_search', { query: 'agents' }, { success: true }),
  tool('web_extract', { urls: ['https://a.example', 'https://b.example'] }, { success: true }),
  tool('browser_navigate', { url: 'https://a.example' }, { success: true }),
  tool('browser_navigate', { url: 'https://b.example' }, { success: true }),
  tool('browser_click', {}, { success: true }),
  tool('browser_scroll', {}, { success: true }),
  tool('vision_analyze', { image_url: 'a.png' }, { success: true }),
  tool('vision_analyze', { image_url: 'b.png' }, { success: true }),
  tool('delegate_task', { goal: 'x' }, { success: true }),
  tool('delegate_task', { goal: 'y' }, { success: true }),
  tool('todo', {}, { success: true }),
  tool('memory', {}, { success: true }),
  ...commands(2)
]

afterEach(() => setRuntimeI18nLocale('en'))

describe('tool-run summaries in the UI language', () => {
  it('reads a zh run with no English word in it, settled or live', () => {
    setRuntimeI18nLocale('zh')

    for (const live of [false, true]) {
      const line = summarizeToolRun(everyCategory(), live)

      expect(line, line).not.toMatch(/[A-Za-z]/)
    }

    expect(summarizeToolRun([read('a.ts'), read('b.ts'), ...commands(3)], false)).toBe('探索了 2 个文件，运行了 3 条命令')
    expect(toolPresentVerb('terminal')).toBe('正在运行')
    // A compound command's tail is the locale's too.
    expect(summarizeToolRun([tool('terminal', { command: 'cd x && npm test && npm run lint' })], true)).toBe(
      '正在运行 npm test 及另外 1 条命令'
    )
  })

  it('counts with real Russian plural forms', () => {
    setRuntimeI18nLocale('ru')

    expect([1, 2, 5, 11, 21, 22].map(count => summarizeToolRun(commands(count), false))).toEqual([
      'Выполнил 1 команду',
      'Выполнил 2 команды',
      'Выполнил 5 команд',
      'Выполнил 11 команд',
      'Выполнил 21 команду',
      'Выполнил 22 команды'
    ])
  })

  it('counts with real Arabic number forms', () => {
    setRuntimeI18nLocale('ar')

    expect([1, 2, 3, 11, 100].map(count => summarizeToolRun(commands(count), false))).toEqual([
      'تم تشغيل أمر واحد',
      'تم تشغيل أمرين',
      'تم تشغيل 3 أوامر',
      'تم تشغيل 11 أمرًا',
      'تم تشغيل 100 أمر'
    ])
  })

  it('keeps English byte-identical', () => {
    expect(summarizeToolRun([read('a.ts'), read('b.ts'), ...commands(3)], false)).toBe('Explored 2 files, ran 3 commands')
    expect(toolPresentVerb('terminal')).toBe('Running')
    expect(summarizeShellCommand('cd x && npm test && npm run lint')).toBe('npm test + 1 command')
    expect(summarizeToolRun([tool('terminal', { command: 'cd x && npm test && npm run lint' })], true)).toBe(
      'Running npm test + 1 command'
    )
  })
})
