import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { withRouter } from 'react-router'
import classNames from 'classnames'
import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
  Toolbar,
  Typography
} from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import MenuIcon from '@material-ui/icons/Menu'

const drawerWidth = 240

const styles = theme => ({
  root: {
    width: '100%',
    zIndex: 1,
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
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
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    height: '100vh',
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
})

@withStyles(styles, { withTheme: true })
@withRouter
class Navbar extends React.Component {
  state = {
    open: false,
    anchor: 'left',
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  navTo = link => () => {
    this.props.history.push(link)
    this.setState({ open: false })
  }

  renderNavLink = ({ link, name }) => (
    <MenuItem onClick={this.navTo(link.path)} key={link.path}><ListItemText primary={name} /></MenuItem>
  )

  render () {
    const { classes, links } = this.props
    const { open } = this.state

    const drawer = (
      <Drawer
        classes={{ paper: classes.drawerPaper }}
        anchor="left"
        open={open}
        onClose={this.handleDrawerClose}
      >
        <div className={classes.drawerInner}>
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <MenuList>
            {links.map(this.renderNavLink)}
          </MenuList>
        </div>
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
                color="default"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography type="title" color="inherit" noWrap>
                Platform9
              </Typography>
            </Toolbar>
          </AppBar>
          {drawer}
        </div>
      </div>
    )
  }
}

Navbar.propTypes = {
  classes: PropTypes.object,
}

export default Navbar
