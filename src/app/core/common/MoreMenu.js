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

  handleOpen = e => { this.setState({ anchorEl: e.currentTarget }) }
  handleClose = () => { this.setState({ anchorEl: null }) }

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
          {this.props.items.map(({ label, action }) =>
            <MenuItem key={label} onClick={action}>{label}</MenuItem>
          )}
        </Menu>
      </div>
    )
  }
}

MoreMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func,
    })
  )
}

export default MoreMenu
