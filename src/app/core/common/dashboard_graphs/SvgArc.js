import React from 'react'
import PropTypes from 'prop-types'
import AnimateValues from 'core/common/AnimateValues'
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
// TODO: Support more customizations (color, stroke width, multiple arcs, etc)
const SvgArc = ({ classes, percent, duration }) => {
  const endAngle = percentToAngle(percent) || 0
  const values = { angle: [0, endAngle] }
  return (
    <AnimateValues values={values} duration={duration}>
      {({ angle }) =>
        <path className={classes.arc} d={describeArc(0, 0, 75, 0, angle)} />
      }
    </AnimateValues>
  )
}

SvgArc.propTypes = {
  /** Percent from 0 to 100 of how complete the arc is */
  percent: PropTypes.number,

  /** Duration in milliseconds */
  duration: PropTypes.number,
}

export default withStyles(styles)(SvgArc)
