import { Box, IconButton, Typography } from '@mui/material'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { ClearIcon } from '../icons'

interface ZoomViewerProps {
  /** Where the work hangs on screen — the zoom grows out of (and back into) it. */
  from: DOMRect
  /** Fresh position of the work for the closing animation (the page may have scrolled). */
  getOrigin: () => DOMRect | null
  thumb: string
  full: string | null
  aspect: number
  title: string
  onClose: () => void
}

interface View {
  s: number
  x: number
  y: number
}

const MAX_SCALE = 10
const DURATION = 560
const EASE = 'cubic-bezier(.66,0,.25,1)'
const IDENTITY: View = { s: 1, x: 0, y: 0 }

function fitted(vw: number, vh: number, aspect: number) {
  const pad = vw < 600 ? 16 : 64
  const availW = vw - 2 * pad
  const availH = vh - 2 * pad - 56 // keep the toolbar clear
  const w = Math.min(availW, availH * aspect)
  const h = w / aspect
  return { w, h, left: (vw - w) / 2, top: (vh - 56 - h) / 2 + 8 }
}

/**
 * Full-screen viewer for the work. Wheel, pinch, double-click or +/− to zoom;
 * drag or arrow keys to pan; Esc, ✕ or a click on the backdrop to leave.
 */
export function ZoomViewer({ from, getOrigin, thumb, full, aspect, title, onClose }: ZoomViewerProps) {
  const host = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  const box = fitted(vp.w, vp.h, aspect)

  const toOrigin = useCallback(
    (rect: DOMRect): View => ({
      s: rect.width / box.w,
      x: rect.left + rect.width / 2 - (box.left + box.w / 2),
      y: rect.top + rect.height / 2 - (box.top + box.h / 2),
    }),
    [box.w, box.left, box.top, box.h],
  )

  const [view, setView] = useState<View>(() => toOrigin(from))
  const [smooth, setSmooth] = useState(false)
  const [shown, setShown] = useState(false) // backdrop + chrome
  const [closing, setClosing] = useState(false)
  const [fullLoaded, setFullLoaded] = useState(false)

  // Enter: start exactly over the painting, then glide to the fitted view.
  useLayoutEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setSmooth(true)
        setShown(true)
        setView(IDENTITY)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  const close = useCallback(() => {
    if (closing) return
    setClosing(true)
    setSmooth(true)
    setShown(false)
    setView(toOrigin(getOrigin() ?? from))
    window.setTimeout(onClose, DURATION)
  }, [closing, toOrigin, getOrigin, from, onClose])

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    host.current?.focus()
    return () => {
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = previous
    }
  }, [])

  const clamp = useCallback(
    (v: View): View => {
      const s = Math.min(MAX_SCALE, Math.max(1, v.s))
      const limX = Math.max(0, (box.w * s - vp.w) / 2 + 24)
      const limY = Math.max(0, (box.h * s - vp.h) / 2 + 24)
      return {
        s,
        x: s === 1 ? 0 : Math.max(-limX, Math.min(limX, v.x)),
        y: s === 1 ? 0 : Math.max(-limY, Math.min(limY, v.y)),
      }
    },
    [box.w, box.h, vp.w, vp.h],
  )

  /** Zoom by `factor`, keeping the screen point (px, py) fixed under the cursor. */
  const zoomAt = useCallback(
    (px: number, py: number, factor: number, animated = false) => {
      setSmooth(animated)
      setView((v) => {
        const s = Math.min(MAX_SCALE, Math.max(1, v.s * factor))
        const r = s / v.s
        const cx = box.left + box.w / 2
        const cy = box.top + box.h / 2
        return clamp({ s, x: px - cx - r * (px - cx - v.x), y: py - cy - r * (py - cy - v.y) })
      })
    },
    [box.left, box.w, box.top, box.h, clamp],
  )

  const center = () => [box.left + box.w / 2, box.top + box.h / 2] as const

  // Wheel needs a non-passive listener to keep the page from scrolling.
  useEffect(() => {
    const el = host.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // Pointers: one finger/mouse pans, two fingers pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const moved = useRef(0)
  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    moved.current = 0
    setSmooth(false)
  }
  const onPointerMove = (e: PointerEvent) => {
    const map = pointers.current
    const prev = map.get(e.pointerId)
    if (!prev) return
    const next = { x: e.clientX, y: e.clientY }
    if (map.size === 1) {
      moved.current += Math.abs(next.x - prev.x) + Math.abs(next.y - prev.y)
      setView((v) => clamp({ ...v, x: v.x + next.x - prev.x, y: v.y + next.y - prev.y }))
    } else if (map.size === 2) {
      const [a, b] = [...map.entries()].map(([id, p]) => (id === e.pointerId ? next : p))
      const [pa, pb] = [...map.values()]
      const before = Math.hypot(pa.x - pb.x, pa.y - pb.y)
      const after = Math.hypot(a.x - b.x, a.y - b.y)
      moved.current += 10
      if (before > 0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, after / before)
    }
    map.set(e.pointerId, next)
  }
  const onPointerUp = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const [cx, cy] = center()
    const step = 90
    switch (e.key) {
      case 'Escape':
        close()
        break
      case '+':
      case '=':
        zoomAt(cx, cy, 1.5, true)
        break
      case '-':
        zoomAt(cx, cy, 1 / 1.5, true)
        break
      case '0':
        setSmooth(true)
        setView(IDENTITY)
        break
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown': {
        const dx = e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0
        const dy = e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0
        setSmooth(true)
        setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }))
        break
      }
      default:
        return
    }
    e.preventDefault()
  }

  const zoomed = view.s > 1.02
  const [cx, cy] = center()

  return (
    <Box
      ref={host}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — ampliada`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => {
        // A click (not the end of a drag) on the backdrop — outside the
        // picture — leaves.
        if (moved.current >= 6 || e.target !== e.currentTarget) return
        const halfW = (box.w * view.s) / 2
        const halfH = (box.h * view.s) / 2
        const onPicture = Math.abs(e.clientX - (cx + view.x)) <= halfW && Math.abs(e.clientY - (cy + view.y)) <= halfH
        if (!onPicture) close()
      }}
      onDoubleClick={(e) => {
        if (zoomed) {
          setSmooth(true)
          setView(IDENTITY)
        } else zoomAt(e.clientX, e.clientY, 2.6, true)
      }}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        overflow: 'hidden',
        outline: 'none',
        touchAction: 'none',
        userSelect: 'none',
        cursor: zoomed ? 'grab' : 'zoom-in',
        '&:active': { cursor: zoomed ? 'grabbing' : 'zoom-in' },
        bgcolor: shown ? 'rgba(12,10,8,.96)' : 'rgba(12,10,8,0)',
        transition: `background-color ${DURATION}ms ${EASE}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: box.left,
          top: box.top,
          width: box.w,
          height: box.h,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
          transformOrigin: 'center',
          transition: smooth ? `transform ${DURATION}ms ${EASE}` : 'none',
          willChange: 'transform',
          pointerEvents: 'none',
          boxShadow: shown ? '0 30px 80px rgba(0,0,0,.5)' : 'none',
        }}
      >
        <Box
          component="img"
          src={thumb}
          alt=""
          draggable={false}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        {full && (
          <Box
            component="img"
            src={full}
            alt={title}
            draggable={false}
            onLoad={() => setFullLoaded(true)}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: fullLoaded ? 1 : 0,
              transition: 'opacity .4s',
            }}
          />
        )}
      </Box>

      {/* chrome */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: shown ? 1 : 0,
          transition: `opacity ${DURATION * 0.6}ms ${EASE}`,
          color: 'background.default',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: { xs: 1.5, sm: 2.5 },
            pb: { xs: 4, sm: 5 },
            background: 'linear-gradient(rgba(12,10,8,.72), rgba(12,10,8,0))',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'inherit',
              flex: 1,
              minWidth: 0,
              fontSize: { xs: 16, sm: 20 },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
          {full && !fullLoaded && (
            <Typography variant="overline" sx={{ color: 'inherit', opacity: 0.6 }}>
              carregando alta resolução…
            </Typography>
          )}
          <IconButton
            aria-label="Fechar"
            onClick={close}
            onPointerDown={(e) => e.stopPropagation()}
            sx={{ pointerEvents: 'auto', color: 'inherit', width: 44, height: 44 }}
          >
            <ClearIcon width={22} height={22} />
          </IconButton>
        </Box>

        <Box
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: { xs: 14, sm: 22 },
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            pointerEvents: 'auto',
            bgcolor: 'rgba(244,241,234,.1)',
            border: '1px solid rgba(244,241,234,.18)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <ToolButton label="Diminuir zoom" onClick={() => zoomAt(cx, cy, 1 / 1.6, true)}>
            −
          </ToolButton>
          <Typography
            variant="overline"
            sx={{ color: 'inherit', minWidth: 52, textAlign: 'center', letterSpacing: '.12em' }}
          >
            {Math.round(view.s * 100)}%
          </Typography>
          <ToolButton label="Aumentar zoom" onClick={() => zoomAt(cx, cy, 1.6, true)}>
            +
          </ToolButton>
          <ToolButton
            label="Ver inteira"
            onClick={() => {
              setSmooth(true)
              setView(IDENTITY)
            }}
          >
            ⤢
          </ToolButton>
        </Box>

        <Typography
          variant="overline"
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            right: 24,
            bottom: 28,
            color: 'inherit',
            opacity: 0.45,
          }}
        >
          role para ampliar · arraste para mover · esc para sair
        </Typography>
      </Box>
    </Box>
  )
}

function ToolButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <IconButton
      aria-label={label}
      onClick={onClick}
      sx={{
        color: 'inherit',
        width: 40,
        height: 40,
        borderRadius: 0,
        fontFamily: '"Instrument Serif",serif',
        fontSize: 22,
        lineHeight: 1,
        '&:hover': { bgcolor: 'rgba(244,241,234,.12)' },
      }}
    >
      {children}
    </IconButton>
  )
}
