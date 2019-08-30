import React from 'react'
import { withStyles } from '@material-ui/styles'
import SvgNetwork from './SvgNetwork'

const styles = theme => ({
  'svg': {
    'max-height': '100%',
    position: 'absolute'
  }
})

@withStyles(styles)
class NetworksGraph extends React.PureComponent {
  render () {
    const { classes } = this.props

    return (
      <svg
        preserveAspectRatio="xMinYMin meet"
        viewBox="-150 -130 300 260"
        className={classes.svg}
      >
        <SvgNetwork />
      </svg>
    )
  }
}

export default NetworksGraph
