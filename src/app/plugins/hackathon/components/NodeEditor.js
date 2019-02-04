import React from 'react'
import uuid from 'uuid'
import HotKeys from './HotKeys'
import ActivitySymbol from './symbols/ActivitySymbol'
import StartSymbol from './symbols/StartSymbol'
import PropertyInspector from './PropertyInspector'
import SVGCanvas from './SVGCanvas'
import ToolPalette from './ToolPalette'
import { Grid } from '@material-ui/core'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { withStyles } from '@material-ui/core/styles'

const cursorMap = {
  create: 'crosshair',
  delete: 'no-drop',
  edit: 'pointer',
  select: 'default',
  text: 'text',
  move: 'grab',
  wire: 'default',
}

const styles = theme => ({
  canvasWrapper: {
    // border: '1px dashed #ccc',
  }
})

class NodeEditor extends React.Component {
  state = {
    nodes: [],
    selectedNode: null,
    selectedTool: 'move',
  }

  componentDidMount () {
    this.handleAddNode({ type: 'start', x: 200, y: 200 })
    this.handleAddNode({ type: 'activity', x: 300, y: 300, label: 'API call 2' })
  }

  handleAddNode = props => {
    const id = uuid.v4()
    const node = { id, ...props }
    this.setState(state => ({
      nodes: [...state.nodes, node]
    }))
  }

  handleClick = id => () => {
    console.log('Node clicked', id)
  }

  handleSelectNode = node => {
    this.setState({ selectedNode: node.id })
  }

  handleNodeDrag = id => props => {
    const nodes = this.state.nodes.map(node =>
      node.id === id ? { ...node, ...props } : node
    )
    this.setState({ nodes })
  }

  handleToolChange = tool => {
    this.setState({ selectedTool: tool })
  }

  renderNode = ({ id, type, ...rest }) => {
    const props = {
      ...rest,
      onClick: this.handleClick(id),
      onDrag: this.handleNodeDrag(id),
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

  selectedNode = () => this.state.nodes.find(node => node.id === this.state.selectedNode)

  render () {
    const { nodes, selectedTool } = this.state
    const { classes } = this.props
    return (
      <div>
        <h1>Node Editor</h1>
        <HotKeys onToolChange={this.handleToolChange} selectedTool={selectedTool}>
          <Grid container spacing={8}>
            <Grid item xs={1}>
              <ToolPalette onToolChange={this.handleToolChange} selectedTool={selectedTool} />
            </Grid>
            <Grid item xs={8} className={classes.canvasWrapper}>
              <SVGCanvas width={1300} height={600} cursor={cursorMap[selectedTool]}>
                {nodes.map(this.renderNode)}
              </SVGCanvas>
            </Grid>
            <Grid item xs={3}>
              <PropertyInspector node={this.selectedNode()} />
            </Grid>
          </Grid>
        </HotKeys>
        <pre>{JSON.stringify(this.state, null, 4)}</pre>
      </div>
    )
  }
}

export default compose(
  withStyles(styles),
  withAppContext,
)(NodeEditor)
