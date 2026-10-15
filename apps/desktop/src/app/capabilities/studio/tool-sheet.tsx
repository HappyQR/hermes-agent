import { compactNumber } from '@hermes/shared'
import { useRef } from 'react'
import { useNavigate } from 'react-router'

import { FormGroup, FormRow, FormSection } from '@/components/studio/pages/form'
import {
  SheetBody,
  SheetFooter,
  SheetHeader,
  STUDIO_SHEET_BODY,
  STUDIO_SHEET_CONTENT
} from '@/components/studio/pages/sheet'
import { IconTile } from '@/components/studio/pages/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { type ProfileScope, profileScopeKey } from '@/hermes'
import { useI18n } from '@/i18n'
import type { ToolsetInfo } from '@/types/hermes'

import { SETTINGS_ROUTE } from '../../routes'
import { BrowserRealProfilePanel } from '../../settings/browser-real-profile-panel'
import { ComputerUsePanel } from '../../settings/computer-use-panel'
import { asText, toolNames, toolsetDisplayLabel } from '../../settings/helpers'
import { TerminalBackendPanel } from '../../settings/terminal-backend-panel'
import { ToolsetConfigPanel } from '../../settings/toolset-config-panel'

import { toolsetTile } from './tiles'

// The tool sheet (prototype overlays.js:326-332): what the toolset contains and
// everything it can be configured with — the terminal backend, the real
// browser profile, the vision model, computer-use permissions and the provider
// matrix with its keys — all the panels the old detail pane mounted.

interface ToolSheetProps {
  onConfiguredChange: () => void
  onOpenChange: (open: boolean) => void
  profile: ProfileScope
  toolCalls: Record<string, number>
  toolset: null | ToolsetInfo
}

export function ToolSheet({ onConfiguredChange, onOpenChange, profile, toolCalls, toolset }: ToolSheetProps) {
  const last = useRef(toolset)

  if (toolset) {
    last.current = toolset
  }

  const shown = toolset ?? last.current

  return (
    <Dialog onOpenChange={onOpenChange} open={toolset !== null}>
      {shown ? (
        <ToolSheetContent
          key={shown.name}
          onClose={() => onOpenChange(false)}
          onConfiguredChange={onConfiguredChange}
          profile={profile}
          toolCalls={toolCalls}
          toolset={shown}
        />
      ) : null}
    </Dialog>
  )
}

interface ToolSheetContentProps extends Omit<ToolSheetProps, 'onOpenChange' | 'toolset'> {
  onClose: () => void
  toolset: ToolsetInfo
}

function ToolSheetContent({ onClose, onConfiguredChange, profile, toolCalls, toolset }: ToolSheetContentProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const navigate = useNavigate()
  const label = toolsetDisplayLabel(toolset)
  const tile = toolsetTile(toolset.name)
  const tools = toolNames(toolset)
  const scopeKey = profileScopeKey(profile)

  return (
    <DialogContent bodyClassName={STUDIO_SHEET_BODY} className={STUDIO_SHEET_CONTENT.md} showCloseButton={false}>
      <SheetHeader
        description={asText(toolset.description) || t.skills.noDescription}
        lead={<IconTile icon={tile.icon} size={30} tone={tile.tone} />}
        title={label}
        trailing={toolset.configured ? null : <Badge variant="warn">{t.skills.needsKeys}</Badge>}
      />
      <SheetBody>
        {toolset.name === 'vision' ? (
          // Vision has no provider matrix: its model is the auxiliary "vision"
          // slot in Settings → Models.
          <FormGroup>
            <FormRow description={t.skills.visionModelHint} stack>
              <Button
                className="self-start"
                onClick={() => {
                  onClose()
                  navigate(`${SETTINGS_ROUTE}?tab=config:model&aux=vision`)
                }}
                size="sm"
                variant="outline"
              >
                {t.skills.visionModelLink}
              </Button>
            </FormRow>
          </FormGroup>
        ) : null}
        {toolset.name === 'computer_use' ? <ComputerUsePanel onConfiguredChange={onConfiguredChange} /> : null}
        {toolset.name === 'browser' ? <BrowserRealProfilePanel profile={profile} /> : null}
        {toolset.name === 'terminal' ? (
          <TerminalBackendPanel key={scopeKey} onConfiguredChange={onConfiguredChange} profile={profile} />
        ) : null}
        {tools.length > 0 ? (
          <FormSection meta={c.tools.includedToolsNote(tools.length)} title={c.tools.includedTools}>
            <div className="flex flex-wrap gap-1.5 px-1">
              {tools.map(name => (
                <Badge className="font-mono" key={name} variant="muted">
                  {name}
                  {(toolCalls[name] ?? 0) > 0 ? (
                    <span className="text-(--ui-text-tertiary)">×{compactNumber(toolCalls[name])}</span>
                  ) : null}
                </Badge>
              ))}
            </div>
          </FormSection>
        ) : null}
        {/* The provider matrix renders nothing for toolsets without one; the
            heading hides with it. */}
        <section
          className="flex min-w-0 flex-col gap-2 [&:not(:has(>:nth-child(2)))]:hidden"
          data-slot="tool-providers"
        >
          <h4 className="mx-1 my-0 text-[0.8125rem] font-[650] text-(--ui-text-primary)">{c.tools.providers}</h4>
          <ToolsetConfigPanel
            key={`${toolset.name}:${scopeKey}`}
            onConfiguredChange={onConfiguredChange}
            profile={profile}
            toolset={toolset.name}
          />
        </section>
        <p className="m-0 mx-1 text-xs text-(--ui-text-tertiary)">{t.skills.changesApplyNewSessions}</p>
      </SheetBody>
      <SheetFooter>
        <span className="flex-1" />
        <Button onClick={onClose} variant="outline">
          {c.skills.done}
        </Button>
      </SheetFooter>
    </DialogContent>
  )
}
