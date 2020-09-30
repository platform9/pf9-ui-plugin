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
    display: 'grid',
    minWidth: 150,
    gridTemplateColumns: '30px 1fr',
    gridTemplateRows: 'minmax(35px, min-content)',
    gridColumnGap: theme.spacing(),
    padding: theme.spacing(0, 1),
  },
  link: {
    textDecoration: 'none !important',
  },
  title: {
    color: theme.palette.grey[200],
  },
})

@withStyles(styles)
class MenuListItem extends React.PureComponent {
  render() {
    const { classes, title, children, icon, ...props } = this.props
    return (
      <MenuItem {...props} className={classes.menuItem}>
        <FontAwesomeIcon>{icon}</FontAwesomeIcon>
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
    const username = session.username || '?'

    if (showChangePasswordModal) {
      return <ChangePasswordModal onCancel={this.handleCancelChangePassword} />
    }

    return (
      <div className={`${classes.avatar} ${className}`}>
        <Text color="inherit" variant="body2" className={classes.title} onClick={this.handleClick}>
          {username} &#9662;
        </Text>
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
            <MenuListItem icon="question-circle">Help</MenuListItem>
          </SimpleLink>
          <MenuListItem icon="sign-out" onClick={this.logout}>
            Sign Out
          </MenuListItem>
        </Menu>
      </div>
    )
  }
}

UserMenu.propTypes = {
  classes: PropTypes.object,
}

export default UserMenu
