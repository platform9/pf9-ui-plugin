import React from 'react'
import Text from 'core/elements/text'
import { withStyles } from '@material-ui/styles'
import AnimateValues from 'core/components/AnimateValues'
import { describeArc } from 'core/utils/svgHelpers'
import { hexToRgbaCss } from 'core/utils/colorHelpers'

const strokeWidth = 12

const styles = (theme) => ({
  root: {
    width: ({ width }) => width,
    position: 'relative',
    textAlign: 'center',
  },
  barProgress: {
    fill: 'none',
    stroke: hexToRgbaCss(theme.palette.blue[500], 0.5),
    strokeWidth,
    strokeLinecap: 'square',
    strokeLinejoin: 'square',
  },
  barBackground: {
    fill: 'none',
    stroke: theme.palette.grey[200],
    strokeWidth: strokeWidth - 1,
    strokeLinecap: 'square',
    strokeLinejoin: 'square',
  },
  percent: {
    left: 0,
    right: 0,
    bottom: -8,
    textAlign: 'center',
    position: 'absolute',
    color: theme.palette.blue[700],
    fontWeight: 600,
  },
  label: {
    paddingTop: 5,
    textAlign: 'center',
    width: '100%',
    whiteSpace: 'nowrap',
  },
  graph: {
    position: 'relative',
  },
})

@withStyles(styles, { withTheme: true })
class SemiCircleGraph extends React.PureComponent {
  render() {
    const { label, width, percentage, duration, classes } = this.props
    const arcSize = width / 2 - strokeWidth
    // Enclose cicle in a circumscribing square
    const viewBox = `-${strokeWidth} -${strokeWidth / 2} ${width} ${width / 2}`

    const completedArc = percentage * 1.8

    return (
      <AnimateValues values={{ angle: [0, completedArc] }} duration={duration}>
        {({ angle }) => (
          <div className={classes.root}>
            <div className={classes.graph}>
              <svg width={width} height={width / 2} viewBox={viewBox}>
                <path
                  className={classes.barBackground}
                  fill="none"
                  d={describeArc(arcSize, arcSize, arcSize, 0, 180)}
                />
                <path
                  className={classes.barProgress}
                  fill="none"
                  d={describeArc(arcSize, arcSize, arcSize, 0, angle)}
                />
              </svg>
              <Text variant="h2" className={classes.percent}>
                {percentage}%
              </Text>
            </div>
            <Text variant="caption1" component="div" className={classes.label}>
              {label}
            </Text>
          </div>
        )}
      </AnimateValues>
    )
  }
}

SemiCircleGraph.defaultProps = {
  width: 150,
  duration: 1000,
}

export default SemiCircleGraph
