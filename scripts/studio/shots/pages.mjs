// Page shots for the Studio redesign (pages area): every workspace page, the
// master/detail selections, sheets and the inspector pane bodies.
//
//   node scripts/studio/shots/run.mjs --shots scripts/studio/shots/pages.mjs --only capabilities,messaging
//
// Pages are reached through the HashRouter (`location.hash`), the same target
// the sidebar rows and the palette navigate to.

import fs from 'node:fs'
import path from 'node:path'

// The sandbox's Hermes home (run.mjs --sandbox <dir> → <dir>/hermes-home).
function hermesHome() {
  const i = process.argv.indexOf('--sandbox')

  return i >= 0 ? path.join(path.resolve(process.argv[i + 1]), 'hermes-home') : null
}

// Memories and a few learned skills so the Memory page has a map and a list.
function seedMemory() {
  const home = hermesHome()

  // Seed once per sandbox: rewriting the files while the gateway runs is noise.
  if (!home || fs.existsSync(path.join(home, 'skills', '.usage.json'))) return
  const memories = path.join(home, 'memories')
  fs.mkdirSync(memories, { recursive: true })
  fs.writeFileSync(
    path.join(memories, 'MEMORY.md'),
    [
      '提交信息使用 Conventional Commits，正文用中文。',
      'hermes-agent 的桌面端状态用 nanostores，按功能拆分 store。',
      'Telegram 主频道是 @hermes_home，定时任务的结果默认发到这里。'
    ].join('\n§\n')
  )
  fs.writeFileSync(
    path.join(memories, 'USER.md'),
    ['偏好简洁的回答，先给结论再给细节。', '常用 Telegram 远程派活，周末不发送提醒。'].join('\n§\n')
  )
  const skills = [
    ['software-development', 'electron-debug', '定位 Electron 主进程与渲染进程问题，读取崩溃日志。', 23],
    ['productivity', 'invoice-sorter', '识别发票 PDF，按月份与类型归档并生成汇总表。', 9],
    ['devops', 'homelab-ops', '巡检 NAS、Docker 容器与磁盘健康，异常时告警。', 52],
    ['research', 'paper-digest', '每天筛选指定方向的新论文并写成摘要。', 14],
    ['creative', 'landing-page-designer', '根据产品定位生成可交互的落地页原型。', 3]
  ]
  const usage = {}
  const day = 86_400
  const now = Math.floor(Date.now() / 1000)
  skills.forEach(([category, name, description, uses], index) => {
    const dir = path.join(home, 'skills', category, name)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      path.join(dir, 'SKILL.md'),
      `---\nname: ${name}\ndescription: ${description}\ncategory: ${category}\n---\n\n# ${name}\n\n${description}\n`
    )
    usage[name] = {
      created_at: now - (40 - index * 7) * day,
      created_by: 'agent',
      last_used_at: now - index * 3 * day,
      use_count: uses
    }
  })
  fs.writeFileSync(path.join(home, 'skills', '.usage.json'), JSON.stringify(usage, null, 2))
}

// The composer can appear behind the cold-boot CONNECTING overlay; wait until
// that full-window mask is gone before the first page shot.
let warmed = false

async function waitForBoot(page, sleep) {
  for (let i = 0; i < 90; i++) {
    const masked = await page.evaluate(() =>
      [...document.querySelectorAll('[data-glass-opaque]')].some(el => {
        const style = getComputedStyle(el)
        const box = el.getBoundingClientRect()

        return style.position === 'fixed' && Number(style.opacity) > 0.5 && box.width >= window.innerWidth - 1
      })
    )

    if (!masked) return
    await sleep(1000)
  }
}

async function go(page, sleep, route, wait = 1600) {
  if (!warmed) {
    warmed = true
    await waitForBoot(page, sleep)
    await sleep(2000)
  }

  await page.evaluate(target => {
    window.location.hash = `#${target}`
  }, route)
  await sleep(wait)
}

async function escape(page, sleep, times = 1) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press('Escape')
    await sleep(350)
  }
}

export default {
  async capabilities(page, { shot, sleep }) {
    await go(page, sleep, '/capabilities', 2500)
    await shot(page, 'capabilities')
  },
  async 'capabilities-tools'(page, { shot, sleep }) {
    await go(page, sleep, '/capabilities?tab=toolsets', 2000)
    await shot(page, 'capabilities-tools')
  },
  async 'capabilities-connectors'(page, { shot, sleep }) {
    await go(page, sleep, '/capabilities?tab=connectors', 2500)
    await shot(page, 'capabilities-connectors')
  },
  async 'capabilities-plugins'(page, { shot, sleep }) {
    await go(page, sleep, '/capabilities?tab=plugins', 2500)
    await shot(page, 'capabilities-plugins')
  },
  async 'skill-sheet'(page, { shot, sleep }) {
    await go(page, sleep, '/capabilities', 2500)
    const details = page.locator('[data-slot="studio-grid-card"] button').filter({ hasText: /详情|Details/ }).first()
    await details.click({ timeout: 8000 })
    await sleep(900)
    await shot(page, 'skill-sheet')
    await escape(page, sleep)
  },
  async 'tool-sheet'(page, { shot, sleep }) {
    await go(page, sleep, '/capabilities?tab=toolsets', 2000)
    const row = page.locator('[data-slot="studio-list-row"] button').first()
    await row.click({ timeout: 8000 })
    await sleep(900)
    await shot(page, 'tool-sheet')
    await escape(page, sleep)
  },
  async messaging(page, { shot, sleep }) {
    await go(page, sleep, '/messaging', 2500)
    await shot(page, 'messaging')
  },
  async 'messaging-detail'(page, { shot, sleep }) {
    await go(page, sleep, '/messaging?platform=discord', 2500)
    await shot(page, 'messaging-detail')
  },
  async automations(page, { shot, sleep }) {
    await go(page, sleep, '/cron', 4000)
    await shot(page, 'automations')
  },
  async 'automations-webhook'(page, { shot, sleep }) {
    await go(page, sleep, '/webhooks', 2500)
    await shot(page, 'automations-webhook')
  },
  async 'automations-blueprints'(page, { shot, sleep }) {
    await go(page, sleep, '/automations?tab=blueprints', 2500)
    await shot(page, 'automations-blueprints')
  },
  async 'new-job'(page, { shot, sleep }) {
    await go(page, sleep, '/automations', 2500)
    await page.locator('[data-slot="studio-page-tools"] button').last().click({ timeout: 8000 })
    await sleep(500)
    await page.getByRole('menuitem').first().click({ timeout: 5000 })
    await sleep(1200)
    await shot(page, 'new-job')
    // Fill the sheet and create the job so the master/detail has content.
    await page.locator('#cron-name').fill('每日 AI 新闻摘要')
    await page.locator('#cron-prompt').fill('汇总过去 24 小时 AI 领域的重要新闻，每条一句话，附来源链接。')
    await page.locator('[data-slot="sheet-footer"] button[type="submit"]').click({ timeout: 5000 })
    await sleep(2500)
    await shot(page, 'automations-job')
  },
  async 'new-job-weekly'(page, { shot, sleep }) {
    await go(page, sleep, '/automations', 2500)
    await page.locator('[data-slot="studio-page-tools"] button').last().click({ timeout: 8000 })
    await sleep(500)
    await page.getByRole('menuitem').first().click({ timeout: 5000 })
    await sleep(900)
    await page.locator('[data-slot="sheet-body"] [data-slot="segmented-control"] button').nth(2).click()
    await sleep(500)
    await shot(page, 'new-job-weekly')
    await escape(page, sleep)
  },
  async 'new-hook'(page, { shot, sleep }) {
    await go(page, sleep, '/automations?tab=webhook', 2500)
    await page.locator('[data-slot="studio-page-tools"] button').last().click({ timeout: 8000 })
    await sleep(500)
    await page.getByRole('menuitem').nth(1).click({ timeout: 5000 })
    await sleep(1200)
    await shot(page, 'new-hook')
    await escape(page, sleep)
  },
  async artifacts(page, { shot, sleep }) {
    await go(page, sleep, '/artifacts', 3500)
    await shot(page, 'artifacts')
  },
  async 'quick-look'(page, { shot, sleep }) {
    await go(page, sleep, '/artifacts', 3500)
    const tile = page.locator('[data-tour="artifact-card"]').first()
    await tile.click({ timeout: 8000 })
    await sleep(1000)
    await shot(page, 'quick-look')
    await escape(page, sleep)
  },
  async memory(page, { shot, sleep }) {
    seedMemory()
    await go(page, sleep, '/starmap', 4500)
    await shot(page, 'memory')
  },
  async 'memory-list'(page, { shot, sleep }) {
    seedMemory()
    await go(page, sleep, '/memory?view=list', 3000)
    await shot(page, 'memory-list')
  },
  async kanban(page, { shot, sleep }) {
    // The board is a desktop plugin: switch it on first (Plugins tab) if needed.
    await go(page, sleep, '/capabilities?tab=plugins', 2500)
    const row = page.locator('[data-testid^="plugin-row-"]').filter({ hasText: 'Kanban' }).first()
    const desktop = row.locator('[role="switch"]').first()
    if ((await desktop.count()) > 0 && (await desktop.getAttribute('aria-checked')) !== 'true') {
      await desktop.click({ timeout: 5000 })
      await sleep(2500)
    }
    await go(page, sleep, '/kanban', 3000)
    // An empty board shows no lanes: add a few triage cards (the title field
    // is focused when the dialog opens; Enter creates).
    const newTask = page.locator('[data-slot="kanban-head"] button').filter({ hasText: /新建任务|New task/ }).first()
    for (const title of ['调研 MCP 远程认证方案', '会话列表虚拟化', '补全繁体中文文案']) {
      if ((await page.locator('[data-slot="kanban-card"]').count()) >= 3) break
      await newTask.click({ timeout: 5000 })
      await sleep(700)
      await page.keyboard.type(title)
      await page.keyboard.press('Enter')
      await sleep(1500)
    }
    await sleep(1000)
    await shot(page, 'kanban')
  },
  async 'inspector-files'(page, { shot, sleep, openSession }) {
    await openSession(page, '分组重构')
    await page.keyboard.press('Meta+J')
    await sleep(1200)
    await shot(page, 'inspector-files')
  },
  async 'inspector-changes'(page, { shot, sleep, openSession }) {
    await openSession(page, '分组重构')
    await page.keyboard.press('Meta+G')
    await sleep(1200)
    await shot(page, 'inspector-changes')
    await page.keyboard.press('Meta+G')
    await sleep(500)
  },
  async 'inspector-terminal'(page, { shot, sleep, openSession }) {
    await openSession(page, '分组重构')
    await page.keyboard.press('Control+Backquote')
    await sleep(2500)
    await shot(page, 'inspector-terminal')
    await page.keyboard.press('Control+Backquote')
    await sleep(500)
  },
  async 'inspector-agents'(page, { shot, sleep }) {
    await go(page, sleep, '/agents', 2000)
    await shot(page, 'inspector-agents')
    await escape(page, sleep)
  }
}
