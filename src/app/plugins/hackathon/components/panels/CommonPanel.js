import React from 'react'
import { Grid, Typography } from '@material-ui/core'

class CommonPanel extends React.Component {
  render () {
    const { node, nodeWalker } = this.props
    const result = nodeWalker.executeNode(node, null)

    return (
      <div>
        <Typography variant="h6">Common</Typography>
        <Grid container alignItems="center">
          <Grid item xs={4}>id</Grid>
          <Grid item xs={8}>{node.id}</Grid>

          <Grid item xs={4}>position</Grid>
          <Grid item xs={8}>
            x: {node.x.toFixed(0)}
            <br />
            y: {node.y.toFixed(0)}
          </Grid>

          <Grid item xs={4}>Input</Grid>
          <Grid item xs={8}><pre>{JSON.stringify(result.input, null, 4)}</pre></Grid>

          <Grid item xs={4}>Output</Grid>
          <Grid item xs={8}><pre>{JSON.stringify(result.output, null, 4)}</pre></Grid>
        </Grid>
      </div>
    )
  }
}

export default CommonPanel
