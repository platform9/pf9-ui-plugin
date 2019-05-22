import React from 'react'
import PropTypes from 'prop-types'
import { compose, lensPath, set, view } from 'ramda'
import { SketchPicker } from 'react-color'
import { ClickAwayListener } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

import { withAppContext } from 'core/AppContext'

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

let debounceFn = null
function debounce (fn, ms) {
  debounceFn = fn
  setTimeout(() => {
    if (fn === debounceFn) { fn() }
  }, ms)
}

const zeroPad = (str, minLen) => str.length < minLen ? zeroPad(`0${str}`, minLen) : str

class ColorPicker extends React.Component {
  state = {
    open: false,
  }

  async componentDidMount () {
    this.input = [...(await navigator.requestMIDIAccess()).inputs.values()][1]
    this.input.onmidimessage = this.handleMIDIMessage
  }

  componentWillUnmount () {
    this.input.onmidimessage = null
  }

  handleMIDIMessage = ({ data }) => {
    const [type, controller, midiValue] = data
    if (!this.props.control) { return }
    const [cr, cg, cb] = this.props.control
    let color = this.getColor()
    if (!color) { return }
    if (color.length === 4) {
      const [r, g, b] = color.substr(1)
      color = `#${r}${r}${g}${g}${b}${b}`
    }
    if (!color || color.length !== 7) { return }
    if (type !== 176) { return }
    const hex = color.substr(1)
    const value = parseInt(hex, 16)
    const r = (value & 0xFF0000) >> 16
    const g = (value & 0x00FF00) >> 8
    const b = (value & 0x0000FF) >> 0
    let newValue
    const calcValue = (r, g, b) => (r << 16) + (g << 8) + b
    if (controller === cr) { newValue = calcValue(midiValue * 2, g, b) }
    if (controller === cg) { newValue = calcValue(r, midiValue * 2, b) }
    if (controller === cb) { newValue = calcValue(r, g, midiValue * 2) }
    if (newValue === undefined) { return }
    const newR = zeroPad(((newValue & 0xFF0000) >> 16).toString(16), 2)
    const newG = zeroPad(((newValue & 0x00FF00) >> 8).toString(16), 2)
    const newB = zeroPad(((newValue & 0x0000FF) >> 0).toString(16), 2)
    const newHex = `#${newR}${newG}${newB}`
    debounce(() => {
      this.props.setContext({
        theme: set(this.lens(), newHex, this.props.context.theme)
      })
    }, 10)
  }

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
