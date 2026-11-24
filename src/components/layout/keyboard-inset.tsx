'use client'

import { useEffect } from 'react'

/** Below this the difference is browser chrome (URL bar), not the on-screen keyboard. */
const KEYBOARD_MIN_HEIGHT = 120

/**
 * Publishes `--keyboard-inset` on `<html>`: how much of the layout viewport the on-screen
 * keyboard covers. Bottom sheets and fixed footers add it to their `bottom` so they stay
 * above the keyboard.
 *
 * Android Chrome resizes the layout viewport itself (`interactive-widget=resizes-content`),
 * so the value stays 0 there; iOS Safari keeps the layout viewport and only shrinks the
 * visual one, which is the case this covers.
 */
export function KeyboardInset() {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    let frame = 0
    const root = document.documentElement

    function update() {
      frame = 0
      if (!viewport) return
      const covered = window.innerHeight - viewport.height - viewport.offsetTop
      const inset = covered > KEYBOARD_MIN_HEIGHT ? Math.round(covered) : 0
      root.style.setProperty('--keyboard-inset', `${inset}px`)
    }

    function schedule() {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    viewport.addEventListener('resize', schedule)
    viewport.addEventListener('scroll', schedule)

    return () => {
      viewport.removeEventListener('resize', schedule)
      viewport.removeEventListener('scroll', schedule)
      if (frame) window.cancelAnimationFrame(frame)
      root.style.removeProperty('--keyboard-inset')
    }
  }, [])

  return null
}
