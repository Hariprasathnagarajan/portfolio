import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    return isFinePointer && !isTouch
  })

  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [cursorText, setCursorText] = useState('')
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let mouseX = -100
    let mouseY = -100
    let trailX = -100
    let trailY = -100
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      setPosition({ x: mouseX, y: mouseY })

      // Check if hovering interactive elements
      const target = e.target as HTMLElement | null
      if (target) {
        const interactive = target.closest('a, button, [role="button"], input, select, textarea, [data-cursor]')
        if (interactive) {
          setIsHovered(true)
          const text = interactive.getAttribute('data-cursor') || ''
          setCursorText(text)
        } else {
          setIsHovered(false)
          setCursorText('')
        }
      }
    }

    const onMouseDown = () => setClicked(true)
    const onMouseUp = () => setClicked(false)

    // Smooth lerp loop for the trailing ring
    const render = () => {
      trailX += (mouseX - trailX) * 0.18
      trailY += (mouseY - trailY) * 0.18
      setTrailingPos({ x: trailX, y: trailY })
      rafId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    rafId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      cancelAnimationFrame(rafId)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="custom-cursor-container" aria-hidden="true">
      {/* Precision center dot */}
      <div
        className={`cursor-dot ${clicked ? 'cursor-dot--clicked' : ''}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />

      {/* Trailing smooth ring */}
      <div
        className={`cursor-ring ${isHovered ? 'cursor-ring--hover' : ''} ${
          cursorText ? 'cursor-ring--text' : ''
        } ${clicked ? 'cursor-ring--clicked' : ''}`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`,
        }}
      >
        {cursorText && <span className="cursor-ring__label">{cursorText}</span>}
      </div>
    </div>
  )
}
