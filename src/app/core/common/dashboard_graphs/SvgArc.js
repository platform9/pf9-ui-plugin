import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { describeArc, percentToAngle } from 'core/common/svg-helpers'

const styles = theme => ({
  arc: {
    stroke: '#aee0ff',
    fill: 'transparent',
    'stroke-width': '15'
  }
})

// Basic SVG circle drawing component, placeholder for future dashboard graph usage
// Todo: Animated circle drawing using setTimeout
//       Support more customizations (color, stroke width, multiple arcs, etc)
@withStyles(styles)
class SvgArc extends React.Component {
  render () {
    const { classes, percent } = this.props
    const angle = percentToAngle(percent) || 0

    // This is currently just a placeholder value for the hover
    const points = this.props.hover ? describeArc(0, 0, 75, 0, 180) : describeArc(0, 0, 75, 0, angle)

    return (
      <path className={classes.arc} d={points} />
    )
  }
}

export default SvgArc
