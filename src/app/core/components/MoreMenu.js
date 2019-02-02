import React from 'react'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'

class MoreMenu extends React.Component {
  state = {
    anchorEl: null,
    openedAction: null,
  }

  handleOpen = e => {
    e.stopPropagation()
    this.setState({ anchorEl: e.currentTarget })
  }

  handleClose = e => {
    e.stopPropagation()
    this.setState({ anchorEl: null })
  }

  handleClick = (action, label) => e => {
    e.stopPropagation()
    this.handleClose(e)
    action(this.props.data)
    this.setState({ openedAction: label })
  }

  handleModalClose = () => {
    this.setState({ openedAction: null })
  }

  render () {
    const { anchorEl } = this.state

    return (
      <div>
        {this.props.items.map(({ action, icon, dialog, label }) => {
          const Modal = dialog
          return this.state.openedAction === label && <Modal key={label} onClose={this.handleModalClose} row={this.props.data} />
        })}
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
            <MenuItem key={label} onClick={this.handleClick(action, label)}>
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
      action: PropTypes.func,
      dialog: PropTypes.func, // React class or functional component
      icon: PropTypes.node,
      label: PropTypes.string.isRequired,
    })
  ),

  /**
   * Arbitrary data to pass to the `action` handler.
   */
  data: PropTypes.any,
}

export default MoreMenu
