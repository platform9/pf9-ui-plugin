import React from 'react'
import PropTypes from 'prop-types'
import { Menu, MenuItem, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { withRouter } from 'react-router'
import { withAppContext } from 'core/AppProvider'
import { logoutUrl } from 'app/constants'

const styles = theme => ({
  avatar: {
    position: 'relative',
    float: 'right',
    cursor: 'pointer',
  },
  avatarImg: {
    backgroundColor: theme.palette.primary.dark,
    marginRight: theme.spacing(1),
    fontSize: theme.spacing(2),
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
})

@withStyles(styles)
@withRouter
class UserMenu extends React.PureComponent {
  state = { anchorEl: null }
  handleClick = event => this.setState({ anchorEl: event.currentTarget })
  handleClose = () => this.setState({ anchorEl: null })
  logout = () => this.props.history.push(logoutUrl)

  render () {
    const { classes, className, context } = this.props
    const { anchorEl } = this.state
    const username = context.session.username || '?'

    return (
      <div className={`${classes.avatar} ${className}`}>
        <Typography color="inherit" variant="subtitle2" onClick={this.handleClick}>{username} &#9662;</Typography>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <MenuItem onClick={this.handleClose}>Change Password</MenuItem>
          <MenuItem onClick={this.handleClose}>SSH Keys</MenuItem>
          <MenuItem onClick={this.logout}>Sign Out</MenuItem>
        </Menu>
      </div>
    )
  }
}

UserMenu.propTypes = {
  classes: PropTypes.object,
}

export default withAppContext(UserMenu)
