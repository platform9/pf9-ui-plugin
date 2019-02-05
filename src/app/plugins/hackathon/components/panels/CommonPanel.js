import React from 'react'
import { Grid, Typography } from '@material-ui/core'

const CommonPanel = ({ node, ...rest }) => (
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
    </Grid>
  </div>
)

export default CommonPanel
