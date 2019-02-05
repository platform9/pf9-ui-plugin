import React from 'react'
import { compose } from 'ramda'
import CommonPanel from './CommonPanel'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
})

class StartPropertyPanel extends React.Component {
  render () {
    const { node } = this.props
    return (
      <div>
        <Typography variant="h5">Start</Typography>
        <hr />
        <CommonPanel node={node} />
      </div>
    )
  }
}

export default compose(
  withStyles(styles),
)(StartPropertyPanel)
