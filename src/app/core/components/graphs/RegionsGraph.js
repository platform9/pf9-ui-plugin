import React from 'react'
import { withStyles } from '@material-ui/styles'
import SvgCloud from './SvgCloud'

const styles = theme => ({
  'svg': {
    'max-height': '100%',
    position: 'absolute'
  }
})

@withStyles(styles)
class RegionsGraph extends React.PureComponent {
  render () {
    const { classes } = this.props

    return (
      <svg
        preserveAspectRatio="xMinYMin meet"
        viewBox="-540 -320 3000 2200"
        className={classes.svg}
      >
        <SvgCloud />
      </svg>
    )
  }
}

export default RegionsGraph
