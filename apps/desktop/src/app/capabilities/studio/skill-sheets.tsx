import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { requestComposerFocus, requestComposerInsert } from '@/app/chat/composer/focus'
import { CodeEditor } from '@/components/chat/code-editor'
import {
  SheetBody,
  SheetFooter,
  SheetHeader,
  STUDIO_SHEET_BODY,
  STUDIO_SHEET_CONTENT
} from '@/components/studio/pages/sheet'
import { KeyValueList } from '@/components/studio/pages/surfaces'
import { IconTile, Spinner } from '@/components/studio/pages/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CountSkeleton } from '@/components/ui/skeleton'
import {
  editLearningNode,
  getLearningNode,
  getSkillContent,
  previewSkillHub,
  type ProfileScope,
  profileScopeKey
} from '@/hermes'
import { useI18n } from '@/i18n'
import { queryClient } from '@/lib/query-client'
import { notify, notifyError } from '@/store/notifications'
import { $selectedStoredSessionId } from '@/store/session'
import type { OfficialSkillInfo, SkillInfo } from '@/types/hermes'

import { NEW_CHAT_ROUTE, sessionRoute } from '../../routes'
import { asText } from '../../settings/helpers'
import { parseFrontmatter } from '../skills/frontmatter'
import { isEditableProvenance } from '../skills/skill-provenance'
import { categoryFor, usageOf } from '../skills/skills-data'

import { categoryLabel } from './labels'
import { skillTile } from './tiles'

// The skill sheet (prototype overlays.js:325, 353-357): tags, the SKILL.md
// frontmatter and body; Archive… / Edit SKILL.md for skills Hermes or the user
// wrote, Use in chat to start a turn with it. Official catalog skills open the
// same sheet with Install.

/** Keeps the last value while a sheet animates out. */
function useLatest<T>(value: null | T): null | T {
  const last = useRef(value)

  if (value !== null) {
    last.current = value
  }

  return value ?? last.current
}

function SkillDocument({ content, loading }: { content: null | string; loading: boolean }) {
  const { t } = useI18n()
  const parsed = useMemo(() => (content === null ? null : parseFrontmatter(content)), [content])

  if (loading) {
    return <CountSkeleton />
  }

  if (!parsed) {
    return null
  }

  return (
    <>
      {parsed.meta.length > 0 ? (
        <div className="rounded-[11px] bg-(--pg-card) px-3.5 py-3 shadow-(--pg-card-ring)">
          <KeyValueList
            rows={parsed.meta.map(([key, value]) => ({
              key,
              label: <span className="font-mono text-xs">{key}</span>,
              value: <span className="text-xs whitespace-pre-wrap">{value}</span>
            }))}
          />
        </div>
      ) : null}
      <pre
        className="m-0 overflow-auto rounded-[11px] bg-(--pg-card) px-3.5 py-3 font-mono text-xs leading-[1.65] whitespace-pre-wrap text-(--ui-text-primary) shadow-(--pg-card-ring) wrap-break-word"
        data-selectable-text="true"
      >
        {parsed.body.trim() || t.skills.noDescription}
      </pre>
    </>
  )
}

function SheetTags({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>
}

export function skillSourceLabel(
  skill: SkillInfo,
  source: Record<'agent' | 'bundled' | 'external' | 'hub' | 'local', string>
) {
  const provenance = skill.provenance

  if (provenance === 'agent' || provenance === 'bundled' || provenance === 'external' || provenance === 'hub') {
    return source[provenance]
  }

  return source.local
}

interface SkillSheetProps {
  /** Bot Mode: no chat to send the skill to. */
  embedded: boolean
  onArchive: (name: string) => void
  onOpenChange: (open: boolean) => void
  /** A saved edit reloads the page's lists. */
  onSaved: () => void
  profile: ProfileScope
  skill: null | SkillInfo
}

export function SkillSheet({ embedded, onArchive, onOpenChange, onSaved, profile, skill }: SkillSheetProps) {
  const shown = useLatest(skill)

  return (
    <Dialog onOpenChange={onOpenChange} open={skill !== null}>
      {shown ? (
        <SkillSheetContent
          embedded={embedded}
          key={shown.name}
          onArchive={onArchive}
          onClose={() => onOpenChange(false)}
          onSaved={onSaved}
          profile={profile}
          skill={shown}
        />
      ) : null}
    </Dialog>
  )
}

interface SkillSheetContentProps extends Omit<SkillSheetProps, 'onOpenChange' | 'skill'> {
  onClose: () => void
  skill: SkillInfo
}

function SkillSheetContent({ embedded, onArchive, onClose, onSaved, profile, skill }: SkillSheetContentProps) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const navigate = useNavigate()
  const editable = isEditableProvenance(skill.provenance)
  const tile = skillTile(skill.name, categoryFor(skill))
  const [editor, setEditor] = useState<null | { draft: string; initial: string }>(null)
  const [opening, setOpening] = useState(false)
  const [saving, setSaving] = useState(false)

  // The full SKILL.md, shared with the old detail pane's cache entry.
  const contentQuery = useQuery({
    queryKey: ['skill-content', skill.name, profileScopeKey(profile)],
    queryFn: () => getSkillContent(skill.name, profile),
    staleTime: 60_000
  })

  const startEdit = async () => {
    setOpening(true)

    try {
      const node = await getLearningNode(skill.name, profile)

      setEditor({ draft: node.content, initial: node.content })
    } catch (err) {
      notifyError(err, skill.name)
    } finally {
      setOpening(false)
    }
  }

  const save = async () => {
    if (!editor) {
      return
    }

    setSaving(true)

    try {
      await editLearningNode(skill.name, editor.draft, profile)
      notify({ kind: 'success', message: t.skills.appliesToNewSessions(skill.name), title: t.skills.skillUpdated })
      setEditor(null)
      void queryClient.invalidateQueries({ queryKey: ['skill-content', skill.name] })
      onSaved()
    } catch (err) {
      notifyError(err, skill.name)
    } finally {
      setSaving(false)
    }
  }

  const useInChat = () => {
    const stored = $selectedStoredSessionId.get()

    onClose()
    navigate(stored ? sessionRoute(stored) : NEW_CHAT_ROUTE)
    requestComposerInsert(`/${skill.name} `, { mode: 'prefix', target: 'main' })
    requestComposerFocus('main')
  }

  return (
    <DialogContent
      bodyClassName={STUDIO_SHEET_BODY}
      className={editor ? STUDIO_SHEET_CONTENT.wide : STUDIO_SHEET_CONTENT.md}
      showCloseButton={false}
    >
      <SheetHeader
        description={editor ? c.skills.editing(skill.name) : asText(skill.description) || t.skills.noDescription}
        lead={<IconTile icon={tile.icon} size={30} tone={tile.tone} />}
        title={<span className="font-mono text-sm">{skill.name}</span>}
      />
      {editor ? (
        <div className="flex h-[min(32rem,60vh)] min-h-0 flex-col px-[18px]">
          <CodeEditor
            filePath="SKILL.md"
            framed
            initialValue={editor.initial}
            onCancel={() => setEditor(null)}
            onChange={draft => setEditor(current => (current ? { ...current, draft } : current))}
            onSave={() => void save()}
          />
        </div>
      ) : (
        <SheetBody>
          <SheetTags>
            <Badge variant="muted">{categoryLabel(categoryFor(skill), c)}</Badge>
            <Badge variant={skill.provenance === 'agent' ? 'default' : 'muted'}>
              {skillSourceLabel(skill, c.skills.source)}
            </Badge>
            <Badge variant="muted">{c.usedTimes(usageOf(skill))}</Badge>
          </SheetTags>
          <SkillDocument content={contentQuery.data?.content ?? null} loading={contentQuery.isLoading} />
        </SheetBody>
      )}
      <SheetFooter>
        {editor ? (
          <>
            <span className="flex-1" />
            <Button onClick={() => setEditor(null)} variant="outline">
              {t.common.cancel}
            </Button>
            <Button disabled={saving} onClick={() => void save()}>
              {saving ? t.common.saving : t.common.save}
            </Button>
          </>
        ) : (
          <>
            {editable ? (
              <>
                <Button onClick={() => onArchive(skill.name)} variant="ghost">
                  {c.skills.archiveEllipsis}
                </Button>
                <Button disabled={opening} onClick={() => void startEdit()} variant="ghost">
                  {opening ? <Spinner /> : null}
                  {c.skills.editSkillMd}
                </Button>
              </>
            ) : null}
            <span className="flex-1" />
            <Button onClick={onClose} variant="outline">
              {c.skills.done}
            </Button>
            {embedded ? null : <Button onClick={useInChat}>{c.skills.useInChat}</Button>}
          </>
        )}
      </SheetFooter>
    </DialogContent>
  )
}

interface OfficialSkillSheetProps {
  installing: boolean
  onInstall: (skill: OfficialSkillInfo) => void
  onOpenChange: (open: boolean) => void
  profile: ProfileScope
  skill: null | OfficialSkillInfo
}

export function OfficialSkillSheet({ installing, onInstall, onOpenChange, profile, skill }: OfficialSkillSheetProps) {
  const shown = useLatest(skill)

  return (
    <Dialog onOpenChange={onOpenChange} open={skill !== null}>
      {shown ? (
        <OfficialSkillSheetContent
          installing={installing}
          key={shown.identifier}
          onClose={() => onOpenChange(false)}
          onInstall={onInstall}
          profile={profile}
          skill={shown}
        />
      ) : null}
    </Dialog>
  )
}

function OfficialSkillSheetContent({
  installing,
  onClose,
  onInstall,
  profile,
  skill
}: Omit<OfficialSkillSheetProps, 'onOpenChange' | 'skill'> & { onClose: () => void; skill: OfficialSkillInfo }) {
  const { t } = useI18n()
  const c = t.studio.pages.capabilities
  const tile = skillTile(skill.name, skill.category)

  const previewQuery = useQuery({
    queryKey: ['official-skill-preview', skill.identifier, profileScopeKey(profile)],
    queryFn: () => previewSkillHub(skill.identifier, profile),
    retry: false,
    staleTime: 5 * 60_000
  })

  return (
    <DialogContent bodyClassName={STUDIO_SHEET_BODY} className={STUDIO_SHEET_CONTENT.md} showCloseButton={false}>
      <SheetHeader
        description={asText(skill.description) || t.skills.noDescription}
        lead={<IconTile icon={tile.icon} size={30} tone={tile.tone} />}
        title={<span className="font-mono text-sm">{skill.name}</span>}
      />
      <SheetBody>
        <SheetTags>
          <Badge variant="muted">{c.skills.officialSource(categoryLabel(skill.category, c))}</Badge>
          {skill.tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </SheetTags>
        <SkillDocument content={previewQuery.data?.skill_md ?? null} loading={previewQuery.isLoading} />
      </SheetBody>
      <SheetFooter>
        <span className="flex-1" />
        <Button onClick={onClose} variant="outline">
          {c.skills.done}
        </Button>
        <Button disabled={installing} onClick={() => onInstall(skill)}>
          {installing ? <Spinner /> : null}
          {installing ? t.skills.hub.installing : t.skills.hub.install}
        </Button>
      </SheetFooter>
    </DialogContent>
  )
}
