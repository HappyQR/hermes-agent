// Port the prototype's SF-Symbols-style icon set (icons.js) to a TS data module.
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'

const [src, out] = process.argv.slice(2)
const ctx = { window: {}, React: { createElement: () => null } }
ctx.window = ctx
vm.runInNewContext(readFileSync(src, 'utf8'), ctx)
const icons = ctx.HP.ICONS
const tagRe = /<(path|circle|rect|line|polyline|polygon|ellipse)\b([^>]*?)\/?>/g
const attrRe = /([a-zA-Z-]+)="([^"]*)"/g
const camel = name => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const entries = []
let unknown = 0
for (const [name, markup] of Object.entries(icons)) {
  const shapes = []
  let consumed = ''
  for (const m of markup.matchAll(tagRe)) {
    consumed += m[0]
    const attrs = {}
    for (const a of m[2].matchAll(attrRe)) {
      const key = camel(a[1])
      const num = Number(a[2])
      attrs[key] = a[2] !== '' && !Number.isNaN(num) && /^-?[\d.]+$/.test(a[2]) ? num : a[2]
    }
    shapes.push([m[1], attrs])
  }
  const stripped = markup.replace(tagRe, '').replace(/<\/(path|circle|rect|line|polyline|polygon|ellipse)>/g, '').trim()
  if (stripped) { unknown++; console.error('unparsed', name, stripped.slice(0, 80)) }
  entries.push([name, shapes])
}
entries.sort((a, b) => a[0].localeCompare(b[0]))
const body = entries.map(([name, shapes]) => `  ${/^[a-z][a-zA-Z0-9]*$/.test(name) ? name : `'${name}'`}: ${JSON.stringify(shapes).replace(/"([a-zA-Z]+)":/g, '$1:').replace(/"/g, "'")}`).join(',\n')
writeFileSync(out, `// GENERATED from the Studio prototype's icons.js (SF Symbols–style line icons,\n// 24×24 grid, round caps, stroke = currentColor). Regenerate: node scripts/studio/port-icons.mjs scripts/studio/prototype-icons.js <this file>; do not hand-edit.\n\nexport type StudioIconShape = [tag: string, attrs: Record<string, number | string>]\n\nexport const STUDIO_ICON_SHAPES = {\n${body}\n} satisfies Record<string, StudioIconShape[]>\n`)
console.log('icons', entries.length, 'unparsed', unknown)
