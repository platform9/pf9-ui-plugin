import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import AnimateValues from 'core/components/AnimateValues'
import { describeArc } from 'core/utils/svgHelpers'

const strokeWidth = 8

const styles = theme => ({
  root: {
    padding: theme.spacing(1),
    width: ({ width }) => width,
    position: 'relative',
  },
  barProgress: {
    fill: 'none',
    stroke: '#31DA6D',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  barBackground: {
    fill: 'none',
    stroke: '#D0E7F6',
    strokeWidth: strokeWidth - 1,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',

  },
  percent: {
    left: 0,
    right: 0,
    bottom: 40,
    textAlign: 'center',
    position: 'absolute',
    fontWeight: 'bold',
    fill: 'red',
  },
  label: {
    paddingTop: 5,
    textAlign: 'center',
    width: '100%'
  }
})

@withStyles(styles, { withTheme: true })
class SemiCircle extends React.PureComponent {
  render () {
    const { label, width, percentage, duration, classes } = this.props
    const arcSize = width / 2 - strokeWidth
    // Enclose cicle in a circumscribing square
    const viewBox = `-${strokeWidth} -${strokeWidth / 2} ${width} ${width / 2}`

    const completedArc = percentage * 1.80

    return (
      <AnimateValues values={{ angle: [0, completedArc] }} duration={duration}>
        {({ angle }) =>
          <div className={classes.root}>
            <svg
              width={width}
              height={width / 2}
              viewBox={viewBox}>
              <path className={classes.barBackground} fill="none"
                d={describeArc(arcSize, arcSize, arcSize, 0, 180)} />
              <path className={classes.barProgress} fill="none"
                d={describeArc(arcSize, arcSize, arcSize, 0, angle)} />
            </svg>
            <Typography variant="h5" className={classes.percent}>
              {percentage}%
            </Typography>
            <Typography variant="caption" className={classes.label}>
              {label}
            </Typography>
          </div>}
      </AnimateValues>
    )
  }
}

SemiCircle.defaultProps = {
  width: 150,
  duration: 1000,
}

SemiCircle.propTypes = {
  width: PropTypes.number,
  label: PropTypes.string,
  duration: PropTypes.number,
  percentage: PropTypes.number.isRequired,
}

export default SemiCircle
