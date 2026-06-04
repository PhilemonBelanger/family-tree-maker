import { useRef } from 'react'
import { useReactFlow, getNodesBounds } from '@xyflow/react'
import { toPng } from 'html-to-image'
import { useStore } from '../store/useStore'
import { BACKGROUND } from '../config'

const btn = {
  padding: '7px 12px',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
}

export default function Toolbar() {
  const importRef = useRef(null)
  const { addPerson, exportJSON, importJSON, clearAll } = useStore()

  const loadDemo = async () => {
    if (!confirm('Load the Fittipaldi demo? This replaces the current tree.')) return
    try {
      const res = await fetch('/demo/fittipaldi.json')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      importJSON(await res.text())
    } catch (err) {
      alert('Could not load demo: ' + err.message)
    }
  }
  const { getNodes } = useReactFlow()

  const exportPng = async () => {
    const nodes = getNodes()
    if (!nodes.length) return
    const viewport = document.querySelector('.react-flow__viewport')
    if (!viewport) return

    const bounds = getNodesBounds(nodes)
    const scale = 2 // render at 2x for crisp output
    const pad = 50 // px margin around content (in output pixels)
    const width = Math.round(bounds.width * scale + pad * 2)
    const height = Math.round(bounds.height * scale + pad * 2)
    const tx = pad - bounds.x * scale
    const ty = pad - bounds.y * scale

    const dataUrl = await toPng(viewport, {
      backgroundColor: BACKGROUND,
      width,
      height,
      // Skip connection handles (union circles stay — they bridge the junction)
      filter: (el) => !el?.classList?.contains?.('react-flow__handle'),
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
      },
    })

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'family-tree.png'
    a.click()
  }

  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'family-tree.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importJSON(reader.result)
      } catch (err) {
        alert('Import failed: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        background: '#2b2b2b',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <strong style={{ fontSize: 16, marginRight: 8 }}>Family Tree Maker</strong>
      <button style={btn} onClick={addPerson}>+ Add Person</button>
      <button style={btn} onClick={doExport}>Export JSON</button>
      <button style={btn} onClick={() => importRef.current?.click()}>Import JSON</button>
      <button style={btn} onClick={exportPng}>Export PNG</button>
      <button style={btn} onClick={loadDemo}>Load Demo</button>
      <input
        ref={importRef}
        type="file"
        accept="application/json"
        onChange={doImport}
        style={{ display: 'none' }}
      />
      <div style={{ flex: 1 }} />
      <button
        style={{ ...btn, color: '#c92a2a' }}
        onClick={() => {
          if (confirm('Clear the whole tree? This cannot be undone.')) clearAll()
        }}
      >
        Clear
      </button>
    </header>
  )
}
