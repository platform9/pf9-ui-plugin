import React from 'react'
import PropTypes from 'prop-types'
import { compose, lensPath, set, view } from 'ramda'
import { SketchPicker } from 'react-color'
import { ClickAwayListener } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

import { withAppContext } from 'core/AppProvider'

const styles = theme => ({
  color: {
    width: '36px',
    height: '14px',
    borderRadius: '2px',
  },
  swatch: {
    padding: '5px',
    background: '#fff',
    borderRadius: '1px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    display: 'inline-block',
    cursor: 'pointer',
  },
  popover: {
    position: 'absolute',
    zIndex: '2',
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
})

class ColorPicker extends React.PureComponent {
  state = { open: false }
  handleClick = () => this.setState({ open: !this.state.open })
  handleClose = () => this.setState({ open: false })

  lens = () => lensPath(this.props.path.split('.'))

  getColor = () => view(this.lens(), this.props.context.theme)

  handleChange = color => this.props.setContext({
    theme: set(this.lens(), color.hex, this.props.context.theme)
  })

  render () {
    const { open } = this.state
    const { classes } = this.props

    /*
     * There are a few variants of color pickers we can choose.  See
     * http://casesandberg.github.io/react-color/ for a visual comparison.
     * Going with SketchPicker for now.
     */
    const Picker = SketchPicker
    const color = this.getColor()

    const expanded = (
      <div className={classes.popover}>
        <div className={classes.color} onClick={this.handleClose} />
        <Picker color={color} onChange={this.handleChange} />
      </div>
    )

    return (
      <ClickAwayListener onClickAway={this.handleClose}>
        <div>
          {this.props.path}&nbsp;
          <div className={classes.swatch} onClick={this.handleClick}>
            <div className={classes.color} style={{ backgroundColor: color }} />
          </div>
          {open && expanded}
        </div>
      </ClickAwayListener>
    )
  }
}

ColorPicker.propTypes = {
  // A lens path specified from context.theme as the root context.
  // For convenience we specify a string with the path deliminated by '.'.
  // Example: 'palette.primary.light'
  path: PropTypes.string.isRequired,
}

export default compose(
  withAppContext,
  withStyles(styles),
)(ColorPicker)
