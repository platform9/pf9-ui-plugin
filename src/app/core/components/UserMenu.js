import React from 'react'
import PropTypes from 'prop-types'
import { Menu, MenuItem, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { withRouter } from 'react-router'
import { logoutUrl, resetPasswordUrl } from 'app/constants'
import { connect } from 'react-redux'
import { sessionStoreKey } from 'core/session/sessionReducers'

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
@connect(
  store => ({ session: store[sessionStoreKey] }),
)
class UserMenu extends React.PureComponent {
  state = { anchorEl: null }
  handleClick = event => this.setState({ anchorEl: event.currentTarget })
  handleClose = () => this.setState({ anchorEl: null })
  handleChangePassword = () => this.props.history.push(resetPasswordUrl)
  logout = () => this.props.history.push(logoutUrl)

  render () {
    const { classes, className, session } = this.props
    const { anchorEl } = this.state
    const username = session.username || '?'

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
          <MenuItem onClick={this.handleChangePassword}>Change Password</MenuItem>
          <MenuItem onClick={this.logout}>Sign Out</MenuItem>
        </Menu>
      </div>
    )
  }
}

UserMenu.propTypes = {
  classes: PropTypes.object,
}

export default UserMenu
