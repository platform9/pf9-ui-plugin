import React from 'react'
import PropTypes from 'prop-types'
import { Menu, MenuItem, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { withRouter } from 'react-router'
import { withAppContext } from 'core/providers/AppProvider'
import { logoutUrl } from 'app/constants'
import ChangePasswordModal from './ChangePasswordModal'

const styles = (theme) => ({
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
  state = { anchorEl: null, showChangePasswordModal: false }
  handleClick = (event) => this.setState({ anchorEl: event.currentTarget })
  handleClose = () => this.setState({ anchorEl: null })
  logout = () => this.props.history.push(logoutUrl)

  handleChangePassword = () => this.setState({ showChangePasswordModal: true, anchorEl: null })

  handleCancelChangePassword = () => this.setState({ showChangePasswordModal: false })

  render() {
    const { classes, className, session } = this.props
    const { anchorEl, showChangePasswordModal } = this.state
    const username = session.username || '?'

    if (showChangePasswordModal) {
      return <ChangePasswordModal onCancel={this.handleCancelChangePassword} />
    }

    return (
      <div data-test-id="user-menu" className={`${classes.avatar} ${className}`}>
        <Typography color="inherit" variant="subtitle2" onClick={this.handleClick}>
          {username} &#9662;
        </Typography>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          {false && <MenuItem onClick={this.handleChangePassword}>Change Password</MenuItem>}
          <SimpleLink src={helpUrl} className={classes.link}>
            <MenuListItem data-test-id="user-menu-sign-out" icon="question-circle">
              Help
            </MenuListItem>
          </SimpleLink>
          <MenuListItem icon="sign-out" onClick={this.logout}>
            Sign Out
          </MenuItem>
        </Menu>
      </div>
    )
  }
}

UserMenu.propTypes = {
  classes: PropTypes.object,
}

export default withAppContext(UserMenu)
