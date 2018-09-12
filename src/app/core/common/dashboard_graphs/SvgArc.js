import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
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
  constructor (props) {
    super(props)
    this.state = {
      currentAngle: 0,
      points: '',
    }

    const endAngle = percentToAngle(props.percent) || 0
    const anglePerTick = endAngle / 60
    const animationTimeMs = props.animationTimeMs

    // TODO: Use requestAnimationFrame instead of designating animation ticks manually
    this.drawArc = (angle, anglePerTick, animationTimeMs) => {
      let points = describeArc(0, 0, 75, 0, this.state.currentAngle)
      if (this.state.currentAngle === angle) {
        this.setState({ points: points })
        return
      }

      this.setState((prevState, props) => {
        const currentAngle = (prevState.currentAngle + anglePerTick) >= angle ? angle : (prevState.currentAngle + anglePerTick)
        return { points, currentAngle }
      })

      this.drawArcInterval = setTimeout(() => {
        this.drawArc(angle, anglePerTick, animationTimeMs)
      }, (animationTimeMs / 60))
    }
    this.drawArc(endAngle, anglePerTick, animationTimeMs)
  }

  render () {
    const { classes } = this.props

    return (
      <path className={classes.arc} d={this.state.points} />
    )
  }
}

SvgArc.propTypes = {
  percent: PropTypes.number,
  animationTimeMs: PropTypes.number
}

export default SvgArc
