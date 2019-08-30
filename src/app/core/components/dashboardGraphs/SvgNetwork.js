import React from 'react'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  network: {
    fill: '#6ca2d1',
    stroke: '#fff',
    'stroke-width': '2'
  }
})

@withStyles(styles)
class SvgNetwork extends React.PureComponent {
  render () {
    const { classes } = this.props
    const side = 43
    const transform = 'scale(1, 0.6) rotate(45)'

    return (
      <rect className={classes.network} width={side} height={side} transform={transform} />
    )
  }
};

export default SvgNetwork
