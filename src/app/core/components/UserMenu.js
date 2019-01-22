import React from 'react'
import PropTypes from 'prop-types'
import { Button, Menu, MenuItem, Typography } from '@material-ui/core'
import { default as BaseAvatar } from '@material-ui/core/Avatar'
import { withStyles } from '@material-ui/core/styles'
import { getStorage } from 'core/utils/pf9Storage'
import { withRouter } from 'react-router'

const styles = theme => ({
  avatar: {
    position: 'relative',
    float: 'right',
  },
  avatarImg: {
    backgroundColor: theme.palette.primary.dark,
    marginRight: theme.spacing.unit,
    fontSize: theme.spacing.unit * 2,
    height: theme.spacing.unit * 3,
    width: theme.spacing.unit * 3,
  },
})

@withStyles(styles)
@withRouter
class UserMenu extends React.Component {
  state = {
    anchorEl: null,
  }

  handleClick = anchor => event => {
    this.setState({ [anchor]: event.currentTarget })
  }

  handleClose = anchor => () => {
    this.setState({ [anchor]: null })
  }

  navTo = link => () => {
    this.props.history.push(link)
    // this.setState({ open: false })
  }

  render () {
    const { classes } = this.props
    const { anchorEl } = this.state
    const userName = getStorage('username') || ''

    return (
      <div className={classes.avatar}>
        <Button
          aria-owns={anchorEl ? 'user-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick('anchorEl')}
          color="inherit"
          disableRipple
        >
          <BaseAvatar className={classes.avatarImg}>
            {userName.charAt(0)}
          </BaseAvatar>
          <Typography color="inherit" variant="body1">
            {userName}
          </Typography>
        </Button>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose('anchorEl')}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <MenuItem onClick={this.handleClose('anchorEl')}>Change Password</MenuItem>
          <MenuItem onClick={this.handleClose('anchorEl')}>SSH Keys</MenuItem>
          {/* TODO: Implement a generic logout page or use a plugin relative route */}
          <MenuItem onClick={this.navTo('/ui/openstack/logout')}>Sign Out</MenuItem>
        </Menu>
      </div>
    )
  }
}

UserMenu.propTypes = {
  classes: PropTypes.object,
}

export default UserMenu
