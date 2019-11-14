import React from 'react'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { withAppContext } from 'core/providers/AppProvider'

class MoreMenu extends React.PureComponent {
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
    action && action(this.props.data, this.props.context)
    this.setState({ openedAction: label })
  }

  handleModalClose = () => {
    this.setState({ openedAction: null }, this.props.onComplete)
  }

  render () {
    const { anchorEl, openedAction } = this.state
    const { data, context } = this.props

    return (
      <div>
        {this.props.items.map(({ dialog, label }) => {
          const Modal = dialog
          return openedAction === label && <Modal key={label} onClose={this.handleModalClose} row={this.props.data} />
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
          onClick={e => e.stopPropagation()}
        >
          {this.props.items.map(({ action, cond, icon, label }) =>
            <MenuItem key={label} onClick={this.handleClick(action, label)} disabled={cond && !cond(data, context)}>
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

      // cond :: fn -> bool
      cond: PropTypes.func,
    })
  ),

  /**
   * Arbitrary data to pass to the `action` handler.
   */
  data: PropTypes.any,

  /**
   * Action to perform after closing a dialog
   */
  onComplete: PropTypes.func,
}

export default withAppContext(MoreMenu)
