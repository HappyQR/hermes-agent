// Shell shots: toolbar menus, the inspector and its segments, the sidebar-hidden
// window cluster. Run after --seed so the seeded conversations exist:
//   node scripts/studio/shots/run.mjs --shots scripts/studio/shots/shell.mjs --only toolbar,inspector,...

async function escape(page, sleep) {
  await page.keyboard.press('Escape')
  await sleep(250)
}

// The Browser's first use asks about importing the browser profile; decline it
// (zh or en sandbox) so it doesn't cover the shot.
async function dismissBrowserPrompt(page, sleep) {
  const notNow = page.getByRole('button', { name: /^(暂不|Not now)$/ })

  if (await notNow.first().isVisible().catch(() => false)) {
    await notNow.first().click()
    await sleep(300)
  }
}

export default {
  toolbar: async (page, { openSession, shot, sleep }) => {
    await dismissBrowserPrompt(page, sleep)
    await openSession(page, '分组重构')
    await shot(page, 'toolbar')
  },
  'title-menu': async (page, { shot, sleep }) => {
    await page.locator('[data-slot="toolbar-title"]').first().click()
    await sleep(400)
    await shot(page, 'title-menu')
    await escape(page, sleep)
  },
  'project-menu': async (page, { shot, sleep }) => {
    await page.locator('[data-slot="toolbar-project"]').first().click()
    await sleep(400)
    await shot(page, 'project-menu')
    await escape(page, sleep)
  },
  'layout-menu': async (page, { shot, sleep }) => {
    await page.locator('[data-slot="toolbar-capsule"] button').first().click()
    await sleep(400)
    await shot(page, 'layout-menu')
    await escape(page, sleep)
  },
  inspector: async (page, { shot, sleep }) => {
    await page.locator('[data-slot="toolbar-inspector-toggle"]').first().click()
    await sleep(900)
    await shot(page, 'inspector')
  },
  'inspector-changes': async (page, { shot, sleep }) => {
    await page.locator('[data-inspector-kind="review"]').first().click()
    await sleep(900)
    await shot(page, 'inspector-changes')
  },
  'inspector-terminal': async (page, { shot, sleep }) => {
    await page.locator('[data-inspector-kind="terminal"]').first().click()
    await sleep(1500)
    await shot(page, 'inspector-terminal')
  },
  'inspector-preview': async (page, { shot, sleep }) => {
    await page.locator('[data-inspector-kind="preview"]').first().click()
    await sleep(1500)
    await dismissBrowserPrompt(page, sleep)
    await shot(page, 'inspector-preview')
  },
  'dump-header': async page => {
    const tree = await page.evaluate(() => {
      const header = [...document.querySelectorAll('[data-panel-header]')].find(el => el.querySelector('[data-zone-tabstrip]'))
      const walk = (el, depth) =>
        depth > 3
          ? ''
          : `${'  '.repeat(depth)}<${el.tagName.toLowerCase()} ${[...el.attributes].filter(a => a.name.startsWith('data-') || a.name === 'role').map(a => `${a.name}="${a.value}"`).join(' ')}>\n` +
            [...el.children].map(child => walk(child, depth + 1)).join('')
      return header ? walk(header, 0) : 'no header with a tab strip'
    })
    console.log(tree)
  },
  'dump-tabs': async page => {
    const info = await page.evaluate(() => {
      const zone = document.querySelector('[data-slot="studio-toolbar"]')?.closest('[data-tree-group]')
      const header = zone?.querySelector('[data-panel-header]')
      const strip = header?.querySelector(':scope > [data-zone-tabstrip]')
      const tab = strip?.querySelector('[data-slot="pane-tab"][data-active="true"]')
      const style = tab ? getComputedStyle(tab) : null
      return {
        headerChildren: header ? [...header.children].map(el => [...el.attributes].map(a => a.name).join(',')) : null,
        matches: strip ? strip.matches('[data-panel-header]:has(> [data-zone-band]) > [data-zone-tabstrip]') : null,
        stripHeight: strip ? getComputedStyle(strip).height : null,
        tabRadius: style?.borderTopLeftRadius,
        tabShadow: style?.boxShadow,
        tabs: strip ? strip.querySelectorAll('[data-slot="pane-tab"]').length : 0
      }
    })
    console.log(JSON.stringify(info, null, 1))
  },
  tabs: async (page, { shot, sleep }) => {
    await page.keyboard.press('Meta+T')
    await sleep(1200)
    await shot(page, 'tabs')
  },
  'inspector-closed': async (page, { shot, sleep }) => {
    await page.keyboard.press('Meta+J')
    await sleep(700)
    await shot(page, 'inspector-closed')
  },
  'sidebar-hidden': async (page, { shot, sleep }) => {
    await page.keyboard.press('Meta+B')
    await sleep(700)
    await shot(page, 'sidebar-hidden')
    await page.keyboard.press('Meta+B')
    await sleep(500)
  }
}
