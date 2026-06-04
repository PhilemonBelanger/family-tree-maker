import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react'
import { GRID, SOLID_WIDTH, DASH_WIDTH } from '../config'

const snap = (v) => Math.round(v / GRID) * GRID
const snapPos = (p) => ({ x: snap(p.x), y: snap(p.y) })

const STORAGE_KEY = 'family-tree-data-v1'

const DEFAULT_BOX_COLOR = '#80C3E1'
const DEFAULT_LINK_COLOR = '#80C3E1'

let idCounter = 1
const nextId = () => `n${Date.now().toString(36)}_${idCounter++}`

function makePerson(position, overrides = {}) {
  return {
    id: nextId(),
    type: 'person',
    position: snapPos(position),
    data: {
      name: 'New Person',
      photo: null,
      birth: '',
      death: '',
      boxColor: DEFAULT_BOX_COLOR,
      ...overrides,
    },
  }
}

function makeUnion(position) {
  return {
    id: nextId(),
    type: 'union',
    position: snapPos(position),
    data: { color: DEFAULT_LINK_COLOR },
  }
}

function makeEdge(source, target, sourceHandle, targetHandle, color = DEFAULT_LINK_COLOR) {
  return {
    id: `e_${source}_${target}_${Math.random().toString(36).slice(2, 7)}`,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: 'smoothstep',
    data: { color },
    style: { stroke: color, strokeWidth: SOLID_WIDTH },
  }
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.nodes?.length) return parsed
    }
  } catch (e) {
    console.warn('Failed to load saved tree', e)
  }
  // Seed with one root person
  const root = makePerson({ x: 400, y: 80 }, { name: 'Root Person', boxColor: '#f0a8c0' })
  return { nodes: [root], edges: [] }
}

const initial = loadInitial()

function persist(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ nodes: state.nodes, edges: state.edges }),
    )
  } catch (e) {
    console.warn('Failed to save tree', e)
  }
}

export const useStore = create((set, get) => ({
  nodes: initial.nodes,
  edges: initial.edges,
  selectedId: null,
  selectedEdgeId: null,
  locked: false,

  setLocked: (locked) => set({ locked }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) })
    persist(get())
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
    persist(get())
  },

  onConnect: (connection) => {
    const edge = {
      ...connection,
      id: `e_${connection.source}_${connection.target}_${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      type: 'smoothstep',
      data: { color: DEFAULT_LINK_COLOR },
      style: { stroke: DEFAULT_LINK_COLOR, strokeWidth: SOLID_WIDTH },
    }
    set({ edges: addEdge(edge, get().edges) })
    persist(get())
  },

  setSelected: (id) => set({ selectedId: id, selectedEdgeId: null }),

  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedId: null }),

  addPerson: () => {
    const node = makePerson({ x: 200 + Math.random() * 300, y: 200 + Math.random() * 200 })
    set({ nodes: [...get().nodes, node], selectedId: node.id })
    persist(get())
  },

  addChild: (parentId) => {
    const parent = get().nodes.find((n) => n.id === parentId)
    if (!parent) return
    // Count existing children to spread them out
    const childCount = get().edges.filter((e) => e.source === parentId && e.sourceHandle === 'bottom').length
    const child = makePerson(
      { x: parent.position.x + (childCount * 220) - 60, y: parent.position.y + 200 },
      { boxColor: parent.data.boxColor },
    )
    const edge = makeEdge(parentId, child.id, 'bottom', 'top')
    set({
      nodes: [...get().nodes, child],
      edges: [...get().edges, edge],
      selectedId: child.id,
    })
    persist(get())
  },

  addSibling: (personId) => {
    const person = get().nodes.find((n) => n.id === personId)
    if (!person) return
    // Find a parent (edge ending at this person's top handle)
    const parentEdge = get().edges.find((e) => e.target === personId && e.targetHandle === 'top')
    const sibling = makePerson(
      { x: person.position.x + 220, y: person.position.y },
      { boxColor: person.data.boxColor },
    )
    const newEdges = [...get().edges]
    if (parentEdge) {
      newEdges.push(makeEdge(parentEdge.source, sibling.id, 'bottom', 'top'))
    }
    set({ nodes: [...get().nodes, sibling], edges: newEdges, selectedId: sibling.id })
    persist(get())
  },

  // Add a partner joined through a union node: person -> union -> partner.
  // Children of the couple should hang from the union (select it, then "+ Child").
  addUnion: (personId) => {
    const person = get().nodes.find((n) => n.id === personId)
    if (!person) return
    const partner = makePerson(
      { x: person.position.x + 250, y: person.position.y },
      { name: 'Partner', boxColor: person.data.boxColor },
    )
    // Union sits ON the couple path: father -> union -> mother. All union handles
    // are centered on the dot, so both couple segments and the child drop-line
    // meet at one point (no gap).
    const union = makeUnion({ x: person.position.x + 193, y: person.position.y + 20 })
    const e1 = makeEdge(personId, union.id, 'right', 'uleft')
    const e2 = makeEdge(union.id, partner.id, 'uright', 'left')
    set({
      nodes: [...get().nodes, union, partner],
      edges: [...get().edges, e1, e2],
      selectedId: union.id,
    })
    persist(get())
  },

  addChildToUnion: (unionId) => {
    const union = get().nodes.find((n) => n.id === unionId)
    if (!union) return
    const childCount = get().edges.filter(
      (e) => e.source === unionId && e.sourceHandle === 'ubottom',
    ).length
    const child = makePerson({
      x: union.position.x + childCount * 220 - 60,
      y: union.position.y + 180,
    })
    const edge = makeEdge(unionId, child.id, 'ubottom', 'top')
    set({
      nodes: [...get().nodes, child],
      edges: [...get().edges, edge],
      selectedId: child.id,
    })
    persist(get())
  },

  addSpouse: (personId) => {
    const person = get().nodes.find((n) => n.id === personId)
    if (!person) return
    const spouse = makePerson(
      { x: person.position.x + 240, y: person.position.y },
      { boxColor: person.data.boxColor },
    )
    const edge = makeEdge(personId, spouse.id, 'right', 'left')
    set({
      nodes: [...get().nodes, spouse],
      edges: [...get().edges, edge],
      selectedId: spouse.id,
    })
    persist(get())
  },

  updatePerson: (id, patch) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    })
    persist(get())
  },

  deletePerson: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedId: null,
    })
    persist(get())
  },

  setEdgeColor: (edgeId, color) => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId
          ? { ...e, data: { ...e.data, color }, style: { ...e.style, stroke: color } }
          : e,
      ),
    })
    persist(get())
  },

  deleteEdge: (edgeId) => {
    set({ edges: get().edges.filter((e) => e.id !== edgeId), selectedEdgeId: null })
    persist(get())
  },

  setEdgeLineStyle: (edgeId, lineStyle) => {
    // Per the style guide: 5px solid, 3px dashed (3/3), 3px dotted (round caps).
    const dash =
      lineStyle === 'dashed' ? '3 3' : lineStyle === 'dotted' ? '1 6' : undefined
    const width = lineStyle === 'solid' ? SOLID_WIDTH : DASH_WIDTH
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId
          ? {
              ...e,
              data: { ...e.data, lineStyle },
              style: {
                ...e.style,
                strokeWidth: width,
                strokeDasharray: dash,
                strokeLinecap: lineStyle === 'dotted' ? 'round' : 'butt',
              },
            }
          : e,
      ),
    })
    persist(get())
  },

  // Set color for every edge touching a node (handy for recoloring a person's links)
  setNodeEdgesColor: (nodeId, color) => {
    set({
      edges: get().edges.map((e) =>
        e.source === nodeId || e.target === nodeId
          ? { ...e, data: { ...e.data, color }, style: { ...e.style, stroke: color } }
          : e,
      ),
    })
    persist(get())
  },

  exportJSON: () => JSON.stringify({ nodes: get().nodes, edges: get().edges }, null, 2),

  importJSON: (json) => {
    const parsed = JSON.parse(json)
    if (!parsed.nodes) throw new Error('Invalid file: missing nodes')
    set({ nodes: parsed.nodes, edges: parsed.edges || [], selectedId: null })
    persist(get())
  },

  clearAll: () => {
    const root = makePerson({ x: 400, y: 80 }, { name: 'Root Person', boxColor: '#f0a8c0' })
    set({ nodes: [root], edges: [], selectedId: null })
    persist(get())
  },
}))

export { DEFAULT_LINK_COLOR, DEFAULT_BOX_COLOR }
