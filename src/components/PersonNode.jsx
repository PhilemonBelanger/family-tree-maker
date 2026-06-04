import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { useStore } from '../store/useStore'
import { GRID, BOX_WIDTH, FONT_STACK } from '../config'

// Box dimensions are kept to multiples of 2*GRID so that the center of each
// side (where the handles sit) lands on the snap grid. Height is quantized to
// the natural content height rounded up to the next 2*GRID step.
const STEP = 2 * GRID

// Pick black/white text for contrast against a hex bg.
function textColor(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1a1a1a' : '#ffffff'
}

function formatDates(birth, death) {
  if (!birth && !death) return ''
  if (birth && death) return `${birth} – ${death}`
  if (birth) return `b. ${birth}`
  return `d. ${death}`
}

const handleStyle = {
  width: 9,
  height: 9,
  background: '#888',
  border: '2px solid #fff',
}

function PersonNode({ id, data, selected }) {
  const locked = useStore((s) => s.locked)
  const { setCenter, getNode } = useReactFlow()
  const box = data.boxColor || '#b9d6e8'
  const fg = textColor(box)
  const dates = formatDates(data.birth, data.death)

  // Middle-mouse: single click = gold flash, double click = animate-center.
  const nodeRef = useRef(null)
  const [flash, setFlash] = useState(false)
  const lastMid = useRef(0)
  const singleTimer = useRef(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    const el = nodeRef.current
    if (!el) return

    const doFlash = () => {
      setFlash(false)
      requestAnimationFrame(() => setFlash(true)) // restart anim on repeat clicks
      clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setFlash(false), 2000)
    }
    const centerOnMe = () => {
      const n = getNode(id)
      if (!n) return
      const w = n.measured?.width ?? BOX_WIDTH
      const h = n.measured?.height ?? STEP * 5
      setCenter(n.position.x + w / 2, n.position.y + h / 2, { zoom: 1.2, duration: 2400 })
    }
    const onPointerDown = (e) => {
      if (e.button !== 1) return // middle button only
      e.preventDefault()
      e.stopPropagation()
      const now = Date.now()
      if (now - lastMid.current < 350) {
        clearTimeout(singleTimer.current)
        lastMid.current = 0
        centerOnMe()
      } else {
        lastMid.current = now
        clearTimeout(singleTimer.current)
        singleTimer.current = setTimeout(doFlash, 320)
      }
    }
    // stop the browser's middle-click autoscroll
    const noAux = (e) => { if (e.button === 1) e.preventDefault() }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('auxclick', noAux)
    el.addEventListener('mousedown', noAux)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('auxclick', noAux)
      el.removeEventListener('mousedown', noAux)
    }
  }, [id, getNode, setCenter])

  // Measure natural content height and round the box up to a multiple of STEP.
  const contentRef = useRef(null)
  const [height, setHeight] = useState(STEP * 5) // sensible first paint

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return
    const measure = () => {
      const natural = el.scrollHeight
      const quantized = Math.max(STEP * 4, Math.ceil(natural / STEP) * STEP)
      setHeight((h) => (h === quantized ? h : quantized))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [data.photo, data.name, data.birth, data.death])

  // Keep handles mounted even when locked (edges anchor to them); just hide them.
  const hStyle = locked
    ? { ...handleStyle, opacity: 0, pointerEvents: 'none' }
    : handleStyle

  return (
    <div
      ref={nodeRef}
      className={flash ? 'flash-gold' : undefined}
      style={{
        background: box,
        border: 'none',
        borderRadius: 10,
        width: BOX_WIDTH,
        height,
        boxShadow: selected
          ? '0 0 0 3px rgba(25,113,194,0.55)'
          : '0 2px 5px rgba(0,0,0,0.18)',
        fontFamily: FONT_STACK,
        color: fg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" style={hStyle} isConnectable={!locked} />
      <Handle type="target" position={Position.Left} id="left" style={hStyle} isConnectable={!locked} />

      {/* content wrapper is measured for the quantized height */}
      <div ref={contentRef} style={{ padding: 8, textAlign: 'center' }}>
        {data.photo ? (
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 6,
              marginBottom: 6,
              overflow: 'hidden',
            }}
          >
            <img
              src={data.photo}
              alt={data.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
        ) : null}

        <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.15 }}>
          {data.name || 'Unnamed'}
        </div>
        {dates ? (
          <div style={{ fontSize: 12, marginTop: 3, opacity: 0.85 }}>{dates}</div>
        ) : null}
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" style={hStyle} isConnectable={!locked} />
      <Handle type="source" position={Position.Right} id="right" style={hStyle} isConnectable={!locked} />
    </div>
  )
}

export default memo(PersonNode)
