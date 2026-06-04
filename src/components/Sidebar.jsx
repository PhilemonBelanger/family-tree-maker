import { useRef } from 'react'
import { useStore } from '../store/useStore'
import { PALETTE } from '../config'

// Quick-pick swatches from the UsefulCharts palette. onPick(hex) is called on click.
function Swatches({ onPick }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
      {PALETTE.map((c) => (
        <button
          key={c.hex}
          title={`${c.name} (${c.hex})`}
          onClick={() => onPick(c.hex)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: c.hex,
            border: '1px solid rgba(0,0,0,0.25)',
            cursor: 'pointer',
            padding: 0,
          }}
        />
      ))}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#444' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14,
  boxSizing: 'border-box',
}

const btn = {
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
}

export default function Sidebar() {
  const fileRef = useRef(null)
  const {
    nodes,
    edges,
    selectedId,
    selectedEdgeId,
    updatePerson,
    deletePerson,
    addChild,
    addSibling,
    addSpouse,
    addUnion,
    addChildToUnion,
    setNodeEdgesColor,
    setEdgeColor,
    setEdgeLineStyle,
    deleteEdge,
  } = useStore()

  const selectedNode = nodes.find((n) => n.id === selectedId)
  const person = selectedNode?.type === 'person' ? selectedNode : null
  const union = selectedNode?.type === 'union' ? selectedNode : null
  const edge = edges.find((e) => e.id === selectedEdgeId)

  const onPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updatePerson(selectedId, { photo: reader.result })
    reader.readAsDataURL(file)
  }

  if (edge) {
    return (
      <aside style={asideStyle}>
        <h3 style={{ marginTop: 0 }}>Link</h3>
        <Field label="Link color">
          <input
            type="color"
            value={edge.data?.color || '#80C3E1'}
            onChange={(e) => setEdgeColor(edge.id, e.target.value)}
            style={{ width: '100%', height: 36, border: 'none', background: 'none' }}
          />
          <Swatches onPick={(hex) => setEdgeColor(edge.id, hex)} />
        </Field>
        <Field label="Line style">
          <select
            style={inputStyle}
            value={edge.data?.lineStyle || 'solid'}
            onChange={(e) => setEdgeLineStyle(edge.id, e.target.value)}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </Field>
        <button
          style={{ ...btn, width: '100%', color: '#c92a2a', borderColor: '#f1aeae', marginBottom: 12 }}
          onClick={() => deleteEdge(edge.id)}
        >
          Delete link
        </button>
        <p style={{ fontSize: 12, color: '#666' }}>
          Tip: click a box to edit a person. Drag from a box's handle to another to create a link.
        </p>
      </aside>
    )
  }

  if (union) {
    return (
      <aside style={asideStyle}>
        <h3 style={{ marginTop: 0 }}>Union (couple)</h3>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
          This node joins two partners. Children of the couple should hang from here.
        </p>
        <Field label="Union dot color">
          <input
            type="color"
            value={union.data?.color || '#80C3E1'}
            onChange={(e) => updatePerson(union.id, { color: e.target.value })}
            style={{ width: '100%', height: 36, border: 'none', background: 'none' }}
          />
          <Swatches onPick={(hex) => updatePerson(union.id, { color: hex })} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button style={btn} onClick={() => addChildToUnion(union.id)}>+ Child</button>
          <button
            style={{ ...btn, color: '#c92a2a', borderColor: '#f1aeae' }}
            onClick={() => deletePerson(union.id)}
          >
            Delete
          </button>
        </div>
        <Field label="Recolor this union's links">
          <input
            type="color"
            defaultValue="#80C3E1"
            onChange={(e) => setNodeEdgesColor(union.id, e.target.value)}
            style={{ width: '100%', height: 36, border: 'none', background: 'none' }}
          />
          <Swatches onPick={(hex) => setNodeEdgesColor(union.id, hex)} />
        </Field>
      </aside>
    )
  }

  if (!person) {
    return (
      <aside style={asideStyle}>
        <h3 style={{ marginTop: 0 }}>Controls</h3>

        <h4 style={helpHeading}>Selecting & editing</h4>
        <ul style={helpList}>
          <li><b>Click a box</b> — edit that person.</li>
          <li><b>Click a link</b> — change its color / line style or delete it.</li>
          <li><b>Click a union dot</b> — add the couple's children or recolor.</li>
        </ul>

        <h4 style={helpHeading}>Building the tree</h4>
        <ul style={helpList}>
          <li><b>Drag a box</b> — move it (snaps to the grid).</li>
          <li><b>Drag from an edge dot</b> to another box — connect manually
            (bottom → top = parent/child, right → left = spouse).</li>
          <li>Use the <b>+ Partner / Child / Sibling</b> buttons when a person is selected.</li>
        </ul>

        <h4 style={helpHeading}>Middle mouse (on a box)</h4>
        <ul style={helpList}>
          <li><b>Single middle-click</b> — flash a gold outline to spot the box.</li>
          <li><b>Double middle-click</b> — smoothly pan &amp; zoom to center on it.</li>
        </ul>

        <h4 style={helpHeading}>Canvas</h4>
        <ul style={helpList}>
          <li><b>Scroll</b> — zoom · <b>drag empty space</b> — pan.</li>
          <li>Bottom-left controls: zoom, <b>fit view</b> (animated), and the
            <b> padlock</b> to lock layout &amp; hide the dots (read mode).</li>
        </ul>

        <h4 style={helpHeading}>Toolbar</h4>
        <ul style={helpList}>
          <li><b>Add Person</b>, <b>Export / Import JSON</b>, <b>Export PNG</b>,
            <b> Load Demo</b>, <b>Clear</b>.</li>
        </ul>

        <p style={{ fontSize: 12, color: '#888', marginTop: 14 }}>
          Your tree auto-saves in this browser. Use Export JSON to back it up.
        </p>
      </aside>
    )
  }

  return (
    <aside style={asideStyle}>
      <h3 style={{ marginTop: 0 }}>Edit Person</h3>

      <Field label="Name">
        <input
          style={inputStyle}
          value={person.data.name}
          onChange={(e) => updatePerson(person.id, { name: e.target.value })}
        />
      </Field>

      <div style={{ display: 'flex', gap: 8 }}>
        <Field label="Birth">
          <input
            style={inputStyle}
            placeholder="e.g. 1888"
            value={person.data.birth}
            onChange={(e) => updatePerson(person.id, { birth: e.target.value })}
          />
        </Field>
        <Field label="Death (optional)">
          <input
            style={inputStyle}
            placeholder="blank if living"
            value={person.data.death}
            onChange={(e) => updatePerson(person.id, { death: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Photo (optional)">
        <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ fontSize: 12 }} />
        {person.data.photo ? (
          <button
            style={{ ...btn, marginTop: 6 }}
            onClick={() => {
              updatePerson(person.id, { photo: null })
              if (fileRef.current) fileRef.current.value = ''
            }}
          >
            Remove photo
          </button>
        ) : null}
      </Field>

      <Field label="Box color">
        <input
          type="color"
          value={person.data.boxColor}
          onChange={(e) => updatePerson(person.id, { boxColor: e.target.value })}
          style={{ width: '100%', height: 36, border: 'none', background: 'none' }}
        />
        <Swatches onPick={(hex) => updatePerson(person.id, { boxColor: hex })} />
      </Field>

      <Field label="Recolor this person's links">
        <input
          type="color"
          defaultValue="#80C3E1"
          onChange={(e) => setNodeEdgesColor(person.id, e.target.value)}
          style={{ width: '100%', height: 36, border: 'none', background: 'none' }}
        />
        <Swatches onPick={(hex) => setNodeEdgesColor(person.id, hex)} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
        <button style={btn} onClick={() => addUnion(person.id)}>+ Partner</button>
        <button style={btn} onClick={() => addChild(person.id)}>+ Child (solo)</button>
        <button style={btn} onClick={() => addSibling(person.id)}>+ Sibling</button>
        <button style={btn} onClick={() => addSpouse(person.id)}>+ Spouse (no union)</button>
        <button
          style={{ ...btn, color: '#c92a2a', borderColor: '#f1aeae', gridColumn: '1 / -1' }}
          onClick={() => deletePerson(person.id)}
        >
          Delete
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#666', marginTop: 10, lineHeight: 1.45 }}>
        <strong>+ Partner</strong> adds a partner joined by a union dot — then select the dot to add
        the couple's children. <strong>+ Child (solo)</strong> links a child straight from this
        person (no partner shown).
      </p>
    </aside>
  )
}

const helpHeading = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: '#888',
  margin: '14px 0 4px',
}

const helpList = {
  margin: 0,
  paddingLeft: 18,
  fontSize: 13,
  color: '#555',
  lineHeight: 1.5,
}

const asideStyle = {
  width: 280,
  flexShrink: 0,
  background: '#fafafa',
  borderLeft: '1px solid #ddd',
  padding: 16,
  overflowY: 'auto',
  fontFamily: 'system-ui, sans-serif',
}
