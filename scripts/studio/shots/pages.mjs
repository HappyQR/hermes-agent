// Page shots for the Studio redesign (pages area): every workspace page, the
// master/detail selections, sheets and the inspector pane bodies.
//
//   node scripts/studio/shots/run.mjs --shots scripts/studio/shots/pages.mjs --only capabilities,messaging
//
// Pages are reached through the HashRouter (`location.hash`), the same target
// the sidebar rows and the palette navigate to.

// The gateway reconnects once shortly after boot; the first page shot waits it out.
let warmed = false

async function go(page, sleep, route, wait = 1600) {
  if (!warmed) {
    warmed = true
    await sleep(6000)
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
    await page.locator('[data-slot="studio-sheet-foot"] button[type="submit"]').click({ timeout: 5000 })
    await sleep(2500)
    await shot(page, 'automations-job')
  },
  async 'new-job-weekly'(page, { shot, sleep }) {
    await go(page, sleep, '/automations', 2500)
    await page.locator('[data-slot="studio-page-tools"] button').last().click({ timeout: 8000 })
    await sleep(500)
    await page.getByRole('menuitem').first().click({ timeout: 5000 })
    await sleep(900)
    await page.locator('[data-slot="studio-sheet-body"] [data-slot="segmented-control"] button').nth(2).click()
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
    await go(page, sleep, '/starmap', 3500)
    await shot(page, 'memory')
  },
  async 'memory-list'(page, { shot, sleep }) {
    await go(page, sleep, '/memory?view=list', 2500)
    await shot(page, 'memory-list')
  },
  async kanban(page, { shot, sleep }) {
    await go(page, sleep, '/kanban', 2500)
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
