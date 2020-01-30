import React from 'react'
import { withStyles } from '@material-ui/styles'
import SvgArc from './SemiCircleGraph'

const styles = theme => ({
  svg: {
    'max-height': '100%',
    position: 'absolute'
  }
})

@withStyles(styles)
class StorageGraph extends React.PureComponent {
  state = {
    hover: false
  }

  mouseEnterUpdate = () => {
    this.setState((state) => {
      return { hover: true }
    })
  }

  mouseLeaveUpdate = () => {
    this.setState((state) => {
      return { hover: false }
    })
  }

  render () {
    const { classes } = this.props
    const { hover } = this.state
    // Placeholder value
    const percent = 75
    const duration = 500

    return (
      <svg
        viewBox="-100 -100 200 200"
        className={classes.svg}
        onMouseEnter={this.mouseEnterUpdate}
        onMouseLeave={this.mouseLeaveUpdate}
      >
        <SvgArc hover={hover ? 1 : 0} percent={percent} duration={duration} />
      </svg>
    )
  }
}

export default StorageGraph
