'use client'

import { useEffect } from 'react'

/**
 * Attaches global touchstart/touchend listeners and sets data-pressing
 * on the closest interactive element. This is more reliable than CSS :active
 * on iOS Safari, which doesn't fire inside scrollable containers.
 */
export default function TapFeedback() {
  useEffect(() => {
    function onStart(e: TouchEvent) {
      const el = (e.target as Element).closest(
        'button:not(:disabled), a, [role="button"]'
      ) as HTMLElement | null
      if (!el) return
      el.dataset.pressing = '1'
    }

    function onEnd(e: TouchEvent) {
      const el = (e.target as Element).closest(
        'button, a, [role="button"]'
      ) as HTMLElement | null
      if (!el) return
      delete el.dataset.pressing
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  return null
}
