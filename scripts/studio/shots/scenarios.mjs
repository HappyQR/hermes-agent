// Conversations that exercise the transcript the way the design prototype
// shows it: reasoning, file search/read/patch/write, todos, a terminal run,
// delegated subagents, an approval prompt, a clarify question and an error.
// Paths point into a throwaway project the runner creates inside the sandbox.

import fs from 'node:fs'
import path from 'node:path'

export function seedProject(root) {
  const files = {
    'package.json': JSON.stringify({ name: 'hermes-agent-demo', private: true, scripts: { test: 'node --test' } }, null, 2),
    'src/store/session-groups.ts': [
      "export type GroupKey = 'time' | 'project' | 'source'",
      '',
      'export function groupSessions(sessions: Session[]): Group[] {',
      '  const today = sessions.filter(s => isToday(s.updatedAt))',
      '  const older = sessions.filter(s => !isToday(s.updatedAt))',
      "  return [{ key: 'today', rows: today }, { key: 'older', rows: older }]",
      '}',
      ''
    ].join('\n'),
    'src/app/chat/sidebar/index.tsx': "export function Sidebar() {\n  return <nav aria-label=\"Sessions\" />\n}\n",
    'gateway/platforms/telegram.py': [
      'async def reconnect(self):',
      '    delay = 1',
      '    while not self.connected:',
      '        await asyncio.sleep(delay)',
      '        delay = delay * 2  # reconnect_backoff never resets',
      ''
    ].join('\n'),
    'tests/gateway/test_telegram_reconnect.py': 'def test_reconnect_resets_backoff():\n    ...\n'
  }
  for (const [rel, body] of Object.entries(files)) {
    const file = path.join(root, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, body)
  }
}

export function scenarios(project) {
  const p = rel => path.join(project, rel)
  return [
    {
      title: '侧边栏会话分组重构',
      match: '做一个分组效果的预览页',
      steps: [
        {
          reasoning: '用户想看分组后的侧边栏效果。先找到现在的分组函数，再改成可切换的三种分组，最后生成一个预览页。',
          text: '我先看一下现在的会话列表是怎么分组的。',
          toolCalls: [{ name: 'search_files', args: { pattern: 'groupSessions', path: project } }]
        },
        { text: '', toolCalls: [{ name: 'read_file', args: { path: p('src/store/session-groups.ts') } }] },
        {
          text: '分组逻辑都在一个函数里，我把它改成按时间、项目和来源三种可切换的分组。',
          toolCalls: [
            {
              name: 'patch',
              args: {
                path: p('src/store/session-groups.ts'),
                old_string: "export type GroupKey = 'time' | 'project' | 'source'",
                new_string: "export type GroupKey = 'time' | 'project' | 'source' | 'status'\n\nexport const GROUP_LABELS: Record<GroupKey, string> = {\n  time: '按时间',\n  project: '按项目',\n  source: '按来源',\n  status: '按状态'\n}"
              }
            }
          ]
        },
        {
          text: '',
          toolCalls: [
            {
              name: 'todo',
              args: {
                todos: [
                  { id: '1', content: '找到分组函数', status: 'completed' },
                  { id: '2', content: '支持四种分组方式', status: 'completed' },
                  { id: '3', content: '生成预览页', status: 'in_progress' },
                  { id: '4', content: '检查深色模式', status: 'pending' }
                ]
              }
            }
          ]
        },
        {
          text: '',
          toolCalls: [
            {
              name: 'write_file',
              args: {
                path: p('preview/session-groups.html'),
                content: '<!doctype html>\n<title>会话分组预览</title>\n<main id="app"></main>\n<script type="module" src="./preview.js"></script>\n'
              }
            }
          ]
        },
        { text: '', toolCalls: [{ name: 'terminal', args: { command: `cd ${JSON.stringify(project)} && ls preview && echo "preview ready"` } }] },
        {
          text: [
            '做好了，可以在右侧预览里直接展开、折叠各个分组，切换分组方式。',
            '',
            '- **按时间**，今天、昨天、本周、更早',
            '- **按项目**，每个仓库一组，工作树缩进在下面',
            '- **按来源**，桌面、Telegram、Discord、定时任务各自一组',
            '',
            '| 分组方式 | 适合 |',
            '| --- | --- |',
            '| 按时间 | 日常查找最近的对话 |',
            '| 按项目 | 同时推进几个仓库 |',
            '| 按来源 | 区分手机上发起的会话 |',
            '',
            '```ts',
            "export const GROUP_LABELS: Record<GroupKey, string> = {",
            "  time: '按时间',",
            "  project: '按项目'",
            '}',
            '```'
          ].join('\n')
        }
      ]
    },
    {
      title: '修复 Telegram 网关断线重连',
      match: 'Telegram 网关断线后不会自动重连',
      steps: [
        {
          reasoning: '断线后一直报 ConnectionResetError，说明重连循环在跑但没有成功。先看退避逻辑。',
          text: '我先复现这个问题，再看重连的退避逻辑。',
          toolCalls: [{ name: 'read_file', args: { path: p('gateway/platforms/telegram.py') } }]
        },
        { text: '', toolCalls: [{ name: 'search_files', args: { pattern: 'reconnect_backoff', path: project } }] },
        {
          text: '退避时间只增不减，所以断线几次以后要等很久。我先清掉上次留下的临时目录再跑测试。',
          toolCalls: [{ name: 'terminal', args: { command: 'rm -rf /tmp/hermes-studio-probe && echo cleaned' } }]
        },
        { text: '已经修好：重连成功后把退避时间重置为 1 秒，并加了回归测试。' }
      ]
    },
    {
      title: '每日 AI 新闻摘要',
      match: '每天早上 9 点汇总 AI 新闻',
      steps: [
        {
          text: '可以。动手之前我先确认一个细节。',
          toolCalls: [{ name: 'clarify', args: { questions: [{ question: '摘要发到哪里？', choices: ['Telegram', '这台 Mac 的通知', '邮件'] }] } }]
        },
        { text: '好的，已经建好定时任务，每天早上 9 点发送。' }
      ]
    },
    {
      title: '检查侧边栏的无障碍与深色模式',
      match: '派两个子代理检查侧边栏',
      steps: [
        {
          text: '我派两个子代理分别检查。',
          toolCalls: [
            {
              name: 'delegate_task',
              args: {
                tasks: [
                  { goal: '检查无障碍：对比度、焦点顺序、读屏标签', context: `项目在 ${project}，只检查 src/app/chat/sidebar。` },
                  { goal: '检查深色模式下的分隔线与选中态', context: `项目在 ${project}，只检查 src/app/chat/sidebar。` }
                ]
              }
            }
          ]
        },
        { text: '两个子代理都查完了：修正了 2 处对比度不足的次要文字，深色模式没有问题。' }
      ],
      children: [
        { match: '检查无障碍', steps: [{ text: '修正 2 处对比度不足的次要文字。' }] },
        { match: '检查深色模式', steps: [{ text: '深色模式下分隔线与选中态都正常。' }] }
      ]
    },
    {
      title: '分支：改用按来源分组',
      match: '把会话改成按来源分组',
      steps: [
        {
          text: [
            '可以。按来源分组后，侧边栏会是这样：',
            '',
            '1. **桌面**，在这台 Mac 上发起的会话',
            '2. **Telegram** 和 **Discord**，手机上发来的会话，带平台图标',
            '3. **定时任务**，每次运行一条，可以展开看结果',
            '',
            '要我现在就改成默认分组吗？'
          ].join('\n')
        }
      ]
    },
    {
      title: '检查 OpenRouter 余额',
      match: '查一下 OpenRouter 还剩多少额度',
      fail: 'invalid_api_key: OpenRouter 拒绝了这个密钥（已过期）',
      steps: [{ text: '' }]
    },
    // Not seeded: the `live` shot sends it and captures the turn in front,
    // waiting on its choice (the prototype's "实时运行" scene).
    {
      title: '整理 Hermes 发布说明',
      match: '发布说明整理成一页网页',
      steps: [
        {
          reasoning: '用户要一页发布说明网页，再加一个每周提醒。先列出步骤，再确认写法。',
          text: '好的，我来整理发布说明。开始之前先确认一件事：',
          toolCalls: [
            // Desktop sessions defer the todo tool behind the tool_call bridge.
            {
              name: 'tool_call',
              args: {
                calls: [
                  {
                    name: 'todo_list',
                    arguments: {
                      todos: [
                        { id: 'collect', content: '收集 v0.22 以来合并的改动', status: 'pending' },
                        { id: 'page', content: '生成发布说明网页', status: 'pending' },
                        { id: 'remind', content: '设置每周一 10:00 的提醒', status: 'pending' }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: 'clarify',
              args: { questions: [{ question: '发布说明用哪种写法？', choices: ['要点清单', '面向用户的故事', '技术细节完整版'] }] }
            }
          ]
        },
        { text: '好的，按要点清单来写。' }
      ]
    }
  ]
}

export const LIVE_PROMPT = '帮我把 Hermes 的发布说明整理成一页网页，顺便定个每周提醒。'

// The order sessions are created in; the last one ends up on top.
export const SEND_ORDER = [
  '查一下 OpenRouter 还剩多少额度。',
  '把会话改成按来源分组，Telegram 和 Discord 的会话放在一起。',
  '派两个子代理检查侧边栏的无障碍和深色模式。',
  '每天早上 9 点汇总 AI 新闻发到 Telegram。',
  'Telegram 网关断线后不会自动重连，日志里一直是 ConnectionResetError。帮我找到原因并修好，写个回归测试。',
  '做一个分组效果的预览页给我看看，深色模式也要。'
]
