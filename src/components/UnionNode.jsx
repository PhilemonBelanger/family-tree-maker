import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useStore } from '../store/useStore'
import { UNION_SIZE } from '../config'

// All three handles are pinned to the dot's exact center (right/bottom set to
// 'auto' to cancel React Flow's default edge placement) so the two couple
// segments and the child drop-line all originate at one point.
const handleStyle = {
  width: 6,
  height: 6,
  minWidth: 0,
  minHeight: 0,
  background: 'transparent',
  border: 'none',
  left: '50%',
  top: '50%',
  right: 'auto',
  bottom: 'auto',
  transform: 'translate(-50%, -50%)',
}

// A small "marriage/union" circle. It stays visible in both edit and read mode
// so it bridges the line junction. Its color is editable; default to the link
// color so it reads as part of the line. Children hang from it.
function UnionNode({ data, selected }) {
  const locked = useStore((s) => s.locked)
  const color = data?.color || '#5b8db8'

  return (
    <div
      className="union-node"
      style={{
        width: UNION_SIZE,
        height: UNION_SIZE,
        borderRadius: '50%',
        background: color,
        boxShadow: selected ? '0 0 0 3px rgba(25,113,194,0.55)' : 'none',
        cursor: locked ? 'default' : 'pointer',
      }}
    >
      <Handle type="target" position={Position.Left} id="uleft" style={handleStyle} isConnectable={!locked} />
      <Handle type="source" position={Position.Right} id="uright" style={handleStyle} isConnectable={!locked} />
      <Handle type="source" position={Position.Bottom} id="ubottom" style={handleStyle} isConnectable={!locked} />
    </div>
  )
}

export default memo(UnionNode)
