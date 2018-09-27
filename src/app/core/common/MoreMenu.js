import React from 'react'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'

class MoreMenu extends React.Component {
  state = {
    anchorEl: null
  }

  handleOpen = e => {
    e.stopPropagation()
    this.setState({ anchorEl: e.currentTarget })
  }

  handleClose = e => {
    e.stopPropagation()
    this.setState({ anchorEl: null })
  }

  handleClick = action => e => {
    e.stopPropagation()
    this.handleClose()
    action(this.props.data)
  }

  render () {
    const { anchorEl } = this.state

    return (
      <div>
        <IconButton
          aria-label="More Actions"
          aria-owns={anchorEl ? 'more-menu' : null}
          onClick={this.handleOpen}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="more-menu"
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={this.handleClose}
        >
          {this.props.items.map(({ label, action, icon }) =>
            <MenuItem key={label} onClick={this.handleClick(action)}>
              {icon && icon}
              {label}
            </MenuItem>
          )}
        </Menu>
      </div>
    )
  }
}

MoreMenu.propTypes = {
  /**
   * MenuItems and their actions.  Actions will receive `data`.
   */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func,
    })
  ),

  /**
   * Arbitrary data to pass to the `action` handler.
   */
  data: PropTypes.any,
}

export default MoreMenu
