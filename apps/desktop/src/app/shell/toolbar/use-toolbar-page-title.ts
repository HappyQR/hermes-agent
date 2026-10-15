import { type RefObject, useEffect } from 'react'

import { $toolbarPageTitle } from '@/store/toolbar'

/** Publish a page's `title` for the toolbar while the page is mounted; it
 *  shows once the page's own large heading (`headingRef`) leaves the view. */
export function useToolbarPageTitle(title: string, headingRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const heading = headingRef.current
    $toolbarPageTitle.set({ shown: false, title })

    if (!heading || typeof IntersectionObserver === 'undefined') {
      return () => $toolbarPageTitle.set(null)
    }

    const observer = new IntersectionObserver(([entry]) =>
      $toolbarPageTitle.set({ shown: !entry?.isIntersecting, title })
    )

    observer.observe(heading)

    return () => {
      observer.disconnect()
      $toolbarPageTitle.set(null)
    }
  }, [headingRef, title])
}
