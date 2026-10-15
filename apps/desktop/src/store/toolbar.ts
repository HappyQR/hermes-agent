import { atom } from 'nanostores'

/**
 * Hermes Studio: the title the workspace toolbar shows on a full page. A page
 * publishes its title and whether its own large heading has scrolled away
 * (`useToolbarPageTitle`); the toolbar fades the title in only then
 * (prototype `.tb-page-title.in`).
 */
export const $toolbarPageTitle = atom<null | { shown: boolean; title: string }>(null)
