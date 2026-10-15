import { describe, expect, it } from 'vitest'

import { SECTIONS } from '../constants'
import { SETTING_IDS } from '../settings-manifest'

import { SETTINGS_PAGE_IDS } from './categories'
import {
  canonicalSettingsSearch,
  configFieldLocation,
  configLocationForField,
  resolveSettingsLocation,
  SETTINGS_SECTIONS
} from './locations'

const resolve = (search: string) => resolveSettingsLocation(new URLSearchParams(search))

describe('settings window locations', () => {
  it('opens on General by default and honours a canonical page + section', () => {
    expect(resolve('')).toEqual({ page: 'general' })
    expect(resolve('?tab=appearance')).toEqual({ page: 'appearance' })
    expect(resolve('?tab=models&section=moa')).toEqual({ page: 'models', section: 'moa' })
    // An unknown section keeps the page.
    expect(resolve('?tab=models&section=nope')).toEqual({ page: 'models' })
  })

  it('resolves every legacy tab and sub-page to the page that hosts it now', () => {
    expect(resolve('?tab=config:model')).toEqual({ page: 'models' })
    expect(resolve('?tab=config:model&page=auxiliary')).toEqual({ page: 'models', section: 'auxiliary' })
    expect(resolve('?tab=config:chat&page=attachments')).toEqual({ page: 'chat', section: 'media' })
    expect(resolve('?tab=config:appearance&page=general')).toEqual({ page: 'general', section: 'language' })
    expect(resolve('?tab=config:appearance&page=chat-display')).toEqual({ page: 'chat', section: 'replies' })
    expect(resolve('?tab=config:appearance&page=window-layout')).toEqual({ page: 'appearance', section: 'window' })
    expect(resolve('?tab=config:safety&page=checkpoints')).toEqual({ page: 'workspace', section: 'checkpoints' })
    expect(resolve('?tab=config:browser')).toEqual({ page: 'safety', section: 'browser' })
    expect(resolve('?tab=config:advanced&page=desktop')).toEqual({ page: 'general', section: 'system' })
    expect(resolve('?tab=vault&page=sources')).toEqual({ page: 'passwords', section: 'managers' })
    expect(resolve('?tab=gateway&page=devices')).toEqual({ page: 'gateways', section: 'saved' })
    expect(resolve('?tab=connections')).toEqual({ page: 'gateways', section: 'saved' })
    expect(resolve('?tab=keybinds&page=screen-capture')).toEqual({ page: 'keyboard', section: 'hud' })
    expect(resolve('?tab=keys&kview=settings')).toEqual({ page: 'tools', section: 'server-env' })
    expect(resolve('?tab=sessions&page=default-directory')).toEqual({ page: 'workspace', section: 'projects' })
    expect(resolve('?tab=providers&pview=custom-endpoints')).toEqual({ page: 'providers', section: 'endpoints' })
    expect(resolve('?tab=notifications&page=sounds')).toEqual({ page: 'notifications', section: 'sounds' })
    expect(resolve('?tab=about&page=uninstall')).toEqual({ page: 'about', section: 'uninstall' })
  })

  it('lets a deep-link target win over the tab it came with', () => {
    // Manifest rows that moved off their old sibling page.
    expect(resolve(`?tab=config:advanced&setting=${SETTING_IDS.advanced.quickEntry}`)).toEqual({
      page: 'keyboard',
      section: 'quick-ask'
    })
    expect(resolve(`?tab=config:appearance&setting=${SETTING_IDS.appearance.minimizeToTray}`)).toEqual({
      page: 'general',
      section: 'system'
    })
    expect(resolve(`?tab=keybinds&setting=${SETTING_IDS.keybinds.hudModifier}`)).toEqual({
      page: 'keyboard',
      section: 'hud'
    })
    // Config fields, item params and credentials.
    expect(resolve('?tab=config:advanced&field=checkpoints.max_snapshots')).toEqual({
      page: 'workspace',
      section: 'checkpoints'
    })
    expect(resolve('?tab=config:model&aux=vision')).toEqual({ page: 'models', section: 'auxiliary' })
    expect(resolve('?tab=sessions&session=abc')).toEqual({ page: 'sessions', section: 'archived' })
    expect(resolve('?tab=vault&kind=login&origin=https%3A%2F%2Fx.test')).toEqual({
      page: 'passwords',
      section: 'credentials'
    })
    expect(resolve('?tab=keys&key=FIRECRAWL_API_KEY')).toEqual({ page: 'tools', section: 'tool-keys' })
    expect(resolve('?tab=providers&pview=keys&key=OPENROUTER_API_KEY')).toEqual({
      page: 'providers',
      section: 'api-keys'
    })
    expect(resolve('?tab=plugins&plugin=kanban')).toEqual({ page: 'plugins' })
  })

  it('places every classic config field on a real page section', () => {
    for (const section of SECTIONS) {
      for (const key of section.keys) {
        const location = configFieldLocation(key, section.id)

        expect(SETTINGS_PAGE_IDS).toContain(location.page)
        expect(SETTINGS_SECTIONS[location.page]).toContain(location.section)
      }
    }

    // A field the backend adds later still lands somewhere sensible.
    expect(configLocationForField('voice.some_future_knob')).toEqual({ page: 'voice', section: 'conversation' })
    expect(configFieldLocation('unheard.of', 'workspace')).toEqual({ page: 'workspace', section: 'execution' })
  })

  it('rewrites legacy queries to the canonical shape and keeps the target params', () => {
    expect(canonicalSettingsSearch('?tab=general')).toBeNull()
    expect(canonicalSettingsSearch('?tab=config:model&page=auxiliary&aux=vision')).toBe(
      '?tab=models&section=auxiliary&aux=vision'
    )
    expect(canonicalSettingsSearch('?tab=keys&kview=tools&key=EXA_API_KEY')).toBe(
      '?tab=tools&section=tool-keys&key=EXA_API_KEY'
    )
    expect(canonicalSettingsSearch('?tab=providers&pview=local')).toBe('?tab=providers&section=local&pview=local')
    expect(canonicalSettingsSearch('?tab=billing&bview=plans')).toBeNull()
    // Already canonical (after a rewrite) stays put: no navigation loop.
    expect(canonicalSettingsSearch('?tab=models&section=auxiliary&aux=vision')).toBeNull()
  })
})
