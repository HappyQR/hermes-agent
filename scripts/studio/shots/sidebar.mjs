// Sidebar shots for the screenshot harness (run.mjs --shots scripts/studio/shots/sidebar.mjs).
// Each shot leaves the window as it found it (menus closed, view options back to defaults).

const SIDEBAR = '[data-slot="sidebar"]'

async function closeMenus(page, sleep) {
  await page.keyboard.press('Escape')
  await sleep(300)
}

export default {
  async sidebar(page, { shot, sleep, openSession }) {
    await openSession(page, '分组重构')
    await sleep(600)
    await shot(page, 'sidebar')
  },

  async 'sidebar-view-options'(page, { shot, sleep }) {
    const trigger = page.locator(`${SIDEBAR} [data-slot="sidebar-view-options"]`).first()
    await trigger.click()
    await sleep(600)
    await shot(page, 'sidebar-view-options')
    await closeMenus(page, sleep)
  },

  async 'sidebar-account'(page, { shot, sleep }) {
    await page.locator(`${SIDEBAR} [data-slot="sidebar-account"]`).first().click()
    await sleep(600)
    await shot(page, 'sidebar-account')
    await closeMenus(page, sleep)
  },

  async 'sidebar-project'(page, { shot, sleep }) {
    const toggle = page.locator(`${SIDEBAR} [data-slot="sidebar-project-toggle"]`).first()
    await toggle.click()
    await sleep(900)
    await shot(page, 'sidebar-project')
    await toggle.click()
    await sleep(300)
  },

  async 'sidebar-scope'(page, { shot, sleep }) {
    const row = page.locator(`${SIDEBAR} [data-sessions-project] [data-slot="sidebar-project-main"]`).first()
    await row.click()
    await sleep(900)
    await shot(page, 'sidebar-scope')
    const clear = page.locator(`${SIDEBAR} [data-slot="sidebar-scope-chip"] button`).first()
    if (await clear.count()) await clear.click()
    await sleep(300)
  },

  async 'sidebar-collapsed'(page, { shot, sleep }) {
    const header = page.locator(`${SIDEBAR} [data-slot="sidebar-section-header"]`).first()
    await header.click({ button: 'right' })
    await sleep(400)
    const collapseAll = page.locator('[data-slot="context-menu-item"]').nth(2)
    await collapseAll.click()
    await sleep(600)
    await shot(page, 'sidebar-collapsed')
    await header.click({ button: 'right' })
    await sleep(400)
    await page.locator('[data-slot="context-menu-item"]').nth(1).click()
    await sleep(400)
  },

  async 'sidebar-search'(page, { shot, sleep }) {
    await page.locator(`${SIDEBAR} [data-slot="sidebar-search"]`).first().click()
    await sleep(500)
    await page.keyboard.type('分组', { delay: 20 })
    await sleep(1200)
    await shot(page, 'sidebar-search')
    await closeMenus(page, sleep)
  },

  async 'sidebar-bots'(page, { shot, sleep }) {
    const toggle = page.locator(`${SIDEBAR} [data-sidebar-section^="contrib:"] [data-slot="sidebar-section-header"] button[aria-expanded]`).first()
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click()
    await sleep(1200)
    await shot(page, 'sidebar-bots')
    await toggle.click()
    await sleep(300)
  },

  async 'sidebar-rename'(page, { shot, sleep }) {
    const row = page.locator(`${SIDEBAR} .group.row-hover`).nth(1)
    await row.click({ button: 'right' })
    await sleep(400)
    await page.locator('[role="menuitem"]', { hasText: /重命名|Rename/ }).first().click()
    await sleep(600)
    await shot(page, 'sidebar-rename')
    await closeMenus(page, sleep)
  },

  async 'empty-chips'(page, { shot, sleep }) {
    await page.keyboard.press('Meta+N')
    await page.locator('[data-slot="draft-project-chip"]').first().waitFor({ state: 'visible', timeout: 15_000 })
    await sleep(900)
    await shot(page, 'empty-chips')
  },

  async 'empty-chips-project'(page, { shot, sleep }) {
    await page.locator('[data-slot="draft-project-chip"]').first().click()
    await sleep(500)
    await shot(page, 'empty-chips-project')
    await closeMenus(page, sleep)
  },

  async 'empty-chips-profile'(page, { shot, sleep }) {
    await page.locator('[data-slot="draft-profile-chip"]').first().click()
    await sleep(500)
    await shot(page, 'empty-chips-profile')
    await closeMenus(page, sleep)
  },

  async 'sidebar-row-menu'(page, { shot, sleep }) {
    const row = page.locator(`${SIDEBAR} .group.row-hover`).nth(1)
    await row.click({ button: 'right' })
    await sleep(500)
    await shot(page, 'sidebar-row-menu')
    await closeMenus(page, sleep)
  }
}
