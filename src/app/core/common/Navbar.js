import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { withRouter } from 'react-router'
import { rootPath } from '../globals'
import classNames from 'classnames'
import {
  AppBar,
  Avatar,
  Button,
  Divider,
  Drawer,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Toolbar,
  Typography
} from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import MenuIcon from '@material-ui/icons/Menu'
import { LOCAL_STORAGE_NAMESPACE } from './pf9-storage'

const drawerWidth = 240

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  appFrame: {
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'appBarShift-left': {
    marginLeft: drawerWidth,
  },
  'appBarShift-right': {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginLeft: theme.spacing.unit * 1.5,
    marginRight: theme.spacing.unit
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    height: '100%',
    minHeight: '100vh',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    maxWidth: 'calc(100% - 48px)',
    overflowX: 'auto',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  'content-left': {
    marginLeft: -drawerWidth,
  },
  'content-right': {
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'contentShift-left': {
    marginLeft: 0,
  },
  'contentShift-right': {
    marginRight: 0,
  },
  logo: {
    maxHeight: theme.spacing.unit * 6.5
  },
  avatar: {
    position: 'absolute',
    right: 0
  },
  avatarImg: {
    backgroundColor: theme.palette.primary.dark,
    marginRight: theme.spacing.unit,
    fontSize: theme.spacing.unit * 2,
    height: theme.spacing.unit * 3,
    width: theme.spacing.unit * 3
  }
})

@withStyles(styles, { withTheme: true })
@withRouter
class Navbar extends React.Component {
  state = {
    open: false,
    anchor: 'left',
    anchorEl: null
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  navTo = link => () => {
    this.props.history.push(link)
    // this.setState({ open: false })
  }

  renderNavLink = ({ link, name }) => (
    <MenuItem onClick={this.navTo(link.path)} key={link.path}><ListItemText primary={name} /></MenuItem>
  )

  render () {
    const { classes, links } = this.props
    const { open, anchorEl } = this.state
    const logoPath = rootPath+'images/logo.png'
    const userName = JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAMESPACE)).username

    const avatar = (
      <div className={classes.avatar}>
        <Button
          aria-owns={anchorEl ? 'user-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
          color="inherit"
        >
          <Avatar className={classes.avatarImg}>{userName.charAt(0)}</Avatar>
          <Typography color="inherit" variant="body1">
            {userName}
          </Typography>
        </Button>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={null}
          anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        >
          <MenuItem onClick={this.handleClose}>Change Password</MenuItem>
          <MenuItem onClick={this.handleClose}>SSH Keys</MenuItem>
          <MenuItem onClick={this.handleClose}>Sign Out</MenuItem>
        </Menu>
      </div>
    )

    const drawer = (
      <Drawer
        variant="persistent"
        classes={{ paper: classes.drawerPaper }}
        anchor="left"
        open={open}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={this.handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <MenuList>
          {links.map(this.renderNavLink)}
        </MenuList>
      </Drawer>
    )

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes['appBarShift-left']]: open,
            })}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <img src={logoPath} className={classes.logo} align="middle" />
              {localStorage[LOCAL_STORAGE_NAMESPACE] && avatar}
            </Toolbar>
          </AppBar>
          {drawer}
          <main
            className={classNames(classes.content, classes['content-left'], {
              [classes.contentShift]: open,
              [classes['contentShift-left']]: open,
            })}
          >
            <div className={classes.drawerHeader} />
            <div>{this.props.children}</div>
          </main>
        </div>
      </div>
    )
  }
}

Navbar.propTypes = {
  classes: PropTypes.object,
}

export default Navbar
