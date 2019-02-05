import React from 'react'
import { Grid, Typography } from '@material-ui/core'
import PanelRow from './PanelRow'

class CommonPanel extends React.Component {
  render () {
    const { node, nodeWalker } = this.props
    const result = nodeWalker.executeAll(nodeWalker.startNode, node)

    return (
      <div>
        <Typography variant="h6">Common</Typography>
        <Grid container alignItems="center">
          <PanelRow title="id">{node.id}</PanelRow>

          <PanelRow title="position">
            x: {node.x.toFixed(0)}
            <br />
            y: {node.y.toFixed(0)}
          </PanelRow>

          <PanelRow title="input">
            <pre>{JSON.stringify(result.input, null, 4)}</pre>
          </PanelRow>

          <PanelRow title="output">
            <pre>{JSON.stringify(result.output, null, 4)}</pre>
          </PanelRow>
        </Grid>
      </div>
    )
  }
}

export default CommonPanel
