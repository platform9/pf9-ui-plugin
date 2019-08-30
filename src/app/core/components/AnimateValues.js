import React from 'react'
import PropTypes from 'prop-types'

class AnimateValues extends React.PureComponent {
  elapsed = () => {
    const { duration } = this.props
    const delta = Date.now() - this.state.startTime
    // Don't go past the duration or else we will overshoot 100%
    return delta > duration ? duration : delta
  }

  calcEasing = (percent, method) => {
    switch (method) {
      // TODO: add other easing methods
      case 'linear':
      default:
        return percent
    }
  }

  calcValues = timePercent => {
    const { values, method } = this.props
    const percent = this.calcEasing(timePercent, method)
    return Object.keys(values).reduce(
      (accum, key) => {
        const [start, end] = values[key]
        const delta = end - start
        accum[key] = delta * percent
        return accum
      },
      {}
    )
  }

  state = {
    values: this.calcValues(0),
    startTime: Date.now(),
    elapsed: 0,
  }

  tick = () => {
    const { duration } = this.props
    const offsetMs = this.elapsed()
    if (offsetMs < duration) {
      this.setState({ elapsed: offsetMs })
      this.subscription = requestAnimationFrame(this.tick)
      return this.subscription
    }
    this.setState({ elapsed: duration })
  }

  componentDidMount () {
    this.subscription = requestAnimationFrame(this.tick)
  }

  componentWillUnmount = () => {
    cancelAnimationFrame(this.subscription)
  }

  render () {
    const { children, duration } = this.props
    const timePercent = this.state.elapsed / duration
    const values = this.calcValues(timePercent)

    return children(values)
  }
}

/**
 * Specifies start and stop values for each key.
 *
 * Ex:
 *   <AnimateValues
 *     values={{ arcAngle: [0, 360] }}
 *     duration={500}
 *    />
 *      {({ arcAngle }) => <div>Arc value: ${arcAngle}</div>}
 *    </AnimateValues>
 */
AnimateValues.propTypes = {
  /**
   * Object of key values, where key is property name and
   * value is array of [startValue, endValue].
   * These values will be interpolated over during the animation.
   */
  values: PropTypes.object.isRequired,

  /** Duration of animation in milliseconds */
  duration: PropTypes.number.isRequired,

  /**
   * renderProp that gets passed object of values
   * as specified in props.values
   */
  children: PropTypes.func.isRequired,

  /** The easing method used to interpolate the values */
  method: PropTypes.oneOf(['linear'])
}

AnimateValues.defaultProps = {
  method: 'linear',
}

export default AnimateValues
