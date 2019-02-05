import React from 'react'
import uuid from 'uuid'
import HotKeys from './HotKeys'
import ActivitySymbol, { addActivityNode } from './symbols/ActivitySymbol'
import StartSymbol from './symbols/StartSymbol'
import PropertyInspector from './PropertyInspector'
import SVGCanvas from './SVGCanvas'
import ToolPalette from './ToolPalette'
import { Grid } from '@material-ui/core'
import { compose, omit, propEq } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { withStyles } from '@material-ui/core/styles'
import calcWireCoords from './utils/calcWireCoords'

const cursorMap = {
  create: 'crosshair',
  delete: 'no-drop',
  edit: 'pointer',
  select: 'default',
  text: 'text',
  move: 'grab',
  wire: 'default',
}

export const hoverableTools = 'delete select wire'.split(' ')

const styles = theme => ({
})

class NodeEditor extends React.Component {
  state = {
    nodes: [],
    wires: [],
    selectedNode: null,
    selectedTool: 'move',
    hovered: false,

    // for wire tool
    sourceNode: null,
  }

  componentDidMount () {
    // This is just temp stuff while developing this component
    this.handleAddNode({ type: 'start', x: 200, y: 200 })
    this.handleAddNode({ type: 'activity', x: 300, y: 300, label: 'Delete Node API', action: 'API', httpMethod: 'DELETE', url: '/nodes/{id}' })
    setTimeout(() => { this.addWire(this.state.nodes[0].id, this.state.nodes[1].id) }, 500)
  }

  deleteNode = selected => {
    const notSelected = node => node.id !== selected
    const wireDoesntMatch = wire => wire.source !== selected && wire.dest !== selected
    this.setState(state => {
      const nodes = state.nodes.filter(notSelected)
      // Delete any wires that were attached to the now deleted node
      const wires = state.wires.filter(wireDoesntMatch)
      return ({ nodes, wires })
    })
  }

  deleteWire = selected => {
    const notSelected = wire => wire.source !== selected.source && wire.dest !== selected.dest
    this.setState(state => ({ wires: state.wires.filter(notSelected) }))
  }

  determineCursor = () => {
    const { hovered, hoveredNodeId, selectedTool } = this.state
    const hoveredNode = this.state.nodes.find(node => node.id === hoveredNodeId)
    const isStartNode = hoveredNode && hoveredNode.type === 'start'
    const isWire = !hoveredNode
    if (hovered && this.isHoverable() && (!isStartNode || isWire)) {
      return 'pointer'
    }
    return cursorMap[selectedTool]
  }

  handleAddNode = props => {
    const id = uuid.v4()
    const node = { id, ...props }

    let defaultProps = {}
    if (props.type === 'activity') {
      defaultProps = addActivityNode(props)
    }

    this.setState(state => ({
      nodes: [...state.nodes, {...node, ...defaultProps}]
    }))
  }

  handleClick = id => () => {
    const { selectedTool, sourceNode } = this.state

    if (selectedTool === 'select') { this.setState({ selectedNode: id }) }

    if (selectedTool === 'wire') {
      if (!sourceNode) { return this.setState({ sourceNode: id }) }
      if (id !== sourceNode) { this.addWire(sourceNode, id) }
      this.setState({ sourceNode: null })
    }

    if (selectedTool === 'delete') {
      // Don't allow deleting of the start node
      if (this.state.nodes.find(node => node.id === id).type === 'start') { return }
      this.deleteNode(id)
    }
  }

  handleNodeHoverChange = id => hovered => this.setState({ hovered, hoveredNodeId: hovered ? id : null })
  handleWireHoverChange = hovered => this.setState({ hovered, hoveredNodeId: null })

  handleSelectNode = node => {
    this.setState({ selectedNode: node.id })
  }

  handleNodeDrag = id => props => {
    const nodes = this.state.nodes.map(node =>
      node.id === id ? { ...node, ...props } : node
    )
    this.setState({ nodes })
  }

  handlePropertyChanges = changes => {
    const { nodes, selectedNode } = this.state
    const updatedNode = { ...this.selectedNode(), ...changes }
    const newNodes = nodes.map(_node => _node.id === selectedNode ? updatedNode : _node)
    this.setState(state => ({ nodes: newNodes }))
  }

  handleToolChange = tool => {
    this.setState({ selectedTool: tool, selectedNode: null })
  }

  isHoverable = () => hoverableTools.includes(this.state.selectedTool)

  renderNode = ({ id, type, ...rest }) => {
    const props = {
      ...rest,
      onClick: this.handleClick(id),
      onDrag: this.handleNodeDrag(id),
      onHoverChange: this.handleNodeHoverChange(id),
      onToolChange: this.handleToolChange,
      selectedTool: this.state.selectedTool,
    }

    if (type === 'start') {
      return <StartSymbol key={id} {...props} />
    }

    if (type === 'activity') {
      return <ActivitySymbol key={id} {...props} />
    }
  }

  renderWire = (wire) => {
    const isDelete = this.state.selectedTool === 'delete'
    const source = this.state.nodes.find(propEq('id', wire.source))
    const dest = this.state.nodes.find(propEq('id', wire.dest))
    const props = {
      ...calcWireCoords(source, dest),
      onMouseEnter: () => isDelete && this.handleWireHoverChange(true),
      onMouseLeave: () => isDelete && this.handleWireHoverChange(false),
      onClick: () => isDelete && this.deleteWire(wire),
    }
    const key = `${wire.source}-${wire.dest}`
    return <line key={key} stroke="black" strokeWidth="3" {...props} />
  }

  selectedNode = () => this.state.nodes.find(node => node.id === this.state.selectedNode)

  addWire = (source, dest) => {
    const { wires } = this.state

    const alreadyFound = wires.find(node => node.source === source && node.dest === dest)
    if (alreadyFound) { return }
    const _wires = [...wires, { source, dest }]
    this.setState({ wires: _wires })
  }

  render () {
    const { nodes, selectedTool, sourceNode, wires } = this.state
    const { classes } = this.props
    const debugJson = omit(['nodes', 'wires'], this.state)
    return (
      <div>
        <h1>Node Editor</h1>
        <HotKeys onToolChange={this.handleToolChange} selectedTool={selectedTool}>
          <Grid container spacing={8}>
            <Grid item xs={1}>
              <ToolPalette onToolChange={this.handleToolChange} selectedTool={selectedTool} />
            </Grid>
            <Grid item xs={8} className={classes.canvasWrapper}>
              <SVGCanvas width={1300} height={600} cursor={this.determineCursor()} onAddNode={this.handleAddNode}>
                {wires.map(this.renderWire)}
                {nodes.map(this.renderNode)}
              </SVGCanvas>
            </Grid>
            <Grid item xs={3}>
              {selectedTool === 'select' &&
                <PropertyInspector node={this.selectedNode()} onChange={this.handlePropertyChanges} />
              }
              {selectedTool === 'wire' &&
                <div>
                  {!sourceNode && <span>Choose the source node</span>}
                  {sourceNode && <span>Choose the destination node</span>}
                </div>
              }
            </Grid>
          </Grid>
        </HotKeys>
        <pre>{JSON.stringify(debugJson, null, 4)}</pre>
      </div>
    )
  }
}

export default compose(
  withStyles(styles),
  withAppContext,
)(NodeEditor)
