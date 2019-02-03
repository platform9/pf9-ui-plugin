import React from 'react'
import Draggable from './Draggable'
import HotKeys from './HotKeys'
import SVGCanvas from './SVGCanvas'
import ToolPalette from './ToolPalette'
import { Grid } from '@material-ui/core'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
})

class NodeEditor extends React.Component {
  render () {
    return (
      <div>
        <h1>Node Editor</h1>
        <HotKeys>
          <Grid container spacing={8}>
            <Grid item xs={1}>
              <ToolPalette />
            </Grid>
            <Grid item xs={9}>
              <SVGCanvas width={700} height={800}>
                <Draggable onChange={this.handleDrag}>
                  <g>
                    <rect
                      x="50"
                      y="50"
                      width="50"
                      height="50"
                      fill="#bbc42a"
                    />
                  </g>
                </Draggable>
              </SVGCanvas>
            </Grid>
            <Grid item xs={2}>
              Future property inspector
            </Grid>
          </Grid>
        </HotKeys>
      </div>
    )
  }
}

export default compose(
  withStyles(styles),
  withAppContext,
)(NodeEditor)
