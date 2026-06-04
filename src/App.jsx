import { useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  ControlButton,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useStore } from './store/useStore'
import { GRID, BACKGROUND } from './config'
import PersonNode from './components/PersonNode'
import UnionNode from './components/UnionNode'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'

function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelected,
    setSelectedEdge,
    setLocked,
  } = useStore()

  const nodeTypes = useMemo(() => ({ person: PersonNode, union: UnionNode }), [])
  const [showMiniMap, setShowMiniMap] = useState(true)

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) => setSelected(node.id)}
      onEdgeClick={(_, edge) => setSelectedEdge(edge.id)}
      onPaneClick={() => setSelected(null)}
      fitView
      snapToGrid
      snapGrid={[GRID, GRID]}
      defaultEdgeOptions={{ type: 'smoothstep', pathOptions: { offset: 6, borderRadius: 8 } }}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#d8d2c0" gap={20} />
      <Controls
        fitViewOptions={{ duration: 2400 }}
        onInteractiveChange={(isInteractive) => setLocked(!isInteractive)}
      >
        <ControlButton
          onClick={() => setShowMiniMap((v) => !v)}
          title={showMiniMap ? 'Hide minimap' : 'Show minimap'}
        >
          {/* simple minimap glyph */}
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="8.5" y="8.5" width="5" height="5" rx="1" fill="currentColor" opacity={showMiniMap ? 1 : 0.3} />
          </svg>
        </ControlButton>
      </Controls>
      {showMiniMap && <MiniMap pannable zoomable />}
    </ReactFlow>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Toolbar />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, background: BACKGROUND }}>
            <Canvas />
          </div>
          <Sidebar />
        </div>
      </div>
    </ReactFlowProvider>
  )
}
