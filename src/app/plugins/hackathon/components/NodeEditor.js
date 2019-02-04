import React from 'react'
import HotKeys from './HotKeys'
import ActivitySymbol from './symbols/ActivitySymbol'
import StartSymbol from './symbols/StartSymbol'
import SVGCanvas from './SVGCanvas'
import ToolPalette from './ToolPalette'
import { Grid } from '@material-ui/core'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
})

class NodeEditor extends React.Component {
  state = {
    autoIncrementId: 3,
    nodes: [
      { id: 1, type: 'start', x: 200, y: 200 },
      { id: 2, type: 'activity', x: 300, y: 300, label: 'API call 2' },
    ],
  }

  handleNodeDrag = id => props => {
    const nodes = this.state.nodes.map(node =>
      node.id === id ? { ...node, ...props } : node
    )
    this.setState({ nodes })
  }

  renderNode = ({ id, type, ...rest }) => {
    const props = {
      ...rest,
      onDrag: this.handleNodeDrag(id),
    }

    if (type === 'start') {
      return <StartSymbol key={id} {...props} />
    }
    if (type === 'activity') {
      return <ActivitySymbol key={id} {...props} />
    }
  }

  render () {
    const { nodes } = this.state
    return (
      <div>
        <h1>Node Editor</h1>
        <HotKeys>
          <Grid container spacing={8}>
            <Grid item xs={1}>
              <ToolPalette />
            </Grid>
            <Grid item xs={9}>
              <SVGCanvas width={1300} height={600}>
                {nodes.map(this.renderNode)}
              </SVGCanvas>
            </Grid>
            <Grid item xs={2}>
              Future property inspector
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
