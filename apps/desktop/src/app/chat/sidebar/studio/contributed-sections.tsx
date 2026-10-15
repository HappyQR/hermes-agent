import { useStore } from '@nanostores/react'
import { atom } from 'nanostores'

import { ContribBoundary, ContribRender } from '@/contrib/react/boundary'
import { useContributions } from '@/contrib/react/use-contributions'
import { useI18n } from '@/i18n'
import { SIDEBAR_SECTIONS_AREA, type SidebarSectionContribution } from '@/sdk/sidebar-sections'
import { $showsAdvancedChrome } from '@/store/interface-mode'

import { SidebarSection } from './section-header'

const NO_COUNT = atom(0)

interface ContributedSectionProps {
  id: string
  data: SidebarSectionContribution
  render: () => React.ReactNode
}

function ContributedSection({ id, data, render }: ContributedSectionProps) {
  const count = useStore(data.count ?? NO_COUNT)

  return (
    <SidebarSection
      count={count}
      defaultCollapsed={data.defaultCollapsed}
      id={`contrib:${id}`}
      title={data.title()}
      tools={
        data.tools ? (
          <ContribBoundary id={`${id}:tools`} variant="chip">
            <ContribRender render={data.tools} />
          </ContribBoundary>
        ) : undefined
      }
    >
      <ContribBoundary id={id}>
        <ContribRender render={render} />
      </ContribBoundary>
    </SidebarSection>
  )
}

/**
 * Plugin sections after Sessions (`sidebar.sections`, prototype: the Bots
 * section). Each is a regular sidebar section — collapsible, its fold kept
 * under the contribution id — whose body and header tools belong to the
 * plugin, behind their own error boundaries.
 */
export function SidebarContributedSections() {
  // Titles are read on paint: re-render when the language changes.
  useI18n()
  const items = useContributions(SIDEBAR_SECTIONS_AREA)
  const advanced = useStore($showsAdvancedChrome)

  return (
    <>
      {items.map(item => {
        const data = item.data as Partial<SidebarSectionContribution> | undefined

        if (!item.render || typeof data?.title !== 'function' || (data.tier === 'advanced' && !advanced)) {
          return null
        }

        return (
          <ContributedSection
            data={data as SidebarSectionContribution}
            id={item.id}
            key={item.id}
            render={item.render}
          />
        )
      })}
    </>
  )
}
