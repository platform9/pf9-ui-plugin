import React from 'react'
import PropTypes from 'prop-types'
import { Menu, MenuItem } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { withRouter } from 'react-router'
import { logoutUrl, helpUrl } from 'app/constants'
import { connect } from 'react-redux'
import { sessionStoreKey } from 'core/session/sessionReducers'
import ChangePasswordModal from './ChangePasswordModal'
import FontAwesomeIcon from './FontAwesomeIcon'
import SimpleLink from './SimpleLink'
import Text from 'core/elements/text'
import clsx from 'clsx'
import Avatar from './Avatar'
import { routes } from 'core/utils/routes'

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
  menuItem: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    display: 'grid',
    minWidth: 150,
    gridTemplateColumns: '16px 1fr',
    gridGap: theme.spacing(1),
    padding: theme.spacing(0),
  },
  menuIcon: {
    position: 'relative',
    top: 1,
  },
  link: {
    textDecoration: 'none !important',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  userDetails: {
    display: 'grid',
    margin: theme.spacing(1, 0, 3, 0),
    gridTemplateColumns: 'auto auto',
    gridGap: theme.spacing(2),
  },
  dropdownContainer: {
    padding: theme.spacing(0, 2),
  },
  dropdownLinks: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  dropdownSection: {
    padding: theme.spacing(2),
  },
  divider: {
    border: 'none',
    height: 1,
    backgroundColor: theme.palette.blue[200],
  },
})

@withStyles(styles)
class MenuListItem extends React.PureComponent {
  render() {
    const { classes, title, children, icon, ...props } = this.props
    return (
      <MenuItem {...props} className={classes.menuItem}>
        <FontAwesomeIcon size="sm" className={classes.menuIcon}>
          {icon}
        </FontAwesomeIcon>
        <Text variant="body2">{title || children}</Text>
      </MenuItem>
    )
  }
}

@withStyles(styles)
@withRouter
@connect((store) => ({ session: store[sessionStoreKey] }))
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
    const {
      username,
      userDetails: { displayName },
    } = session

    if (showChangePasswordModal) {
      return <ChangePasswordModal onCancel={this.handleCancelChangePassword} />
    }

    return (
      <div className={`${classes.avatar} ${className}`}>
        <Avatar onClick={this.handleClick} displayName={displayName} diameter={36} fontSize={16} />
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <div className={classes.dropdownContainer}>
            <div className={classes.dropdownSection}>
              <div className={classes.userDetails}>
                <Avatar displayName={displayName} diameter={48} fontSize={18} />
                <div>
                  <Text variant="subtitle2">{displayName}</Text>
                  <Text variant="body2">{username}</Text>
                </div>
              </div>
              <div className={classes.dropdownLinks}>
                {false && <MenuItem onClick={this.handleChangePassword}>Change Password</MenuItem>}
                <SimpleLink src={routes.userManagement.root.path()} className={classes.link}>
                  <MenuListItem icon="cog">Settings</MenuListItem>
                </SimpleLink>
                <MenuListItem icon="sign-out" onClick={this.logout}>
                  Sign Out
                </MenuListItem>
              </div>
            </div>
            <hr className={classes.divider}></hr>
            <div className={classes.dropdownSection}>
              <SimpleLink src={helpUrl} className={classes.link}>
                <MenuListItem icon="question-circle">Support</MenuListItem>
              </SimpleLink>
            </div>
          </div>
        </Menu>
      </div>
    )
  }
}

UserMenu.propTypes = {
  classes: PropTypes.object,
}

export default UserMenu
