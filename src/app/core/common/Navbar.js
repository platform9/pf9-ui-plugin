import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { withRouter } from 'react-router'
import { rootPath } from '../globals'
import classNames from 'classnames'
import Avatar from './Avatar'
import Selector from './Selector'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import TenantChooser from 'openstack/components/tenants/TenantChooser'
import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
  Toolbar
} from '@material-ui/core'

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
  rightTools: {
    position: 'absolute',
    right: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center'
  }
})

@withStyles(styles, { withTheme: true })
@withRouter
class Navbar extends React.Component {
  state = {
    open: true,
    anchor: 'left',
    curRegion: '',
    regionSearch: '',
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  handleClick = key => event => {
    this.setState({
      [key]: event.target.innerText
    })
  }

  handleSearch = key => value => {
    this.setState({
      [key]: value
    })
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
    const { open, curRegion, regionSearch } = this.state
    const logoPath = rootPath+'images/logo.png'

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
              <div className={classes.rightTools}>
                <Selector
                  name={curRegion.length === 0 ? 'Current Region' : curRegion}
                  list={[`AWS-US-West-1-Test`, `KVM-Neutron`]}
                  onChoose={this.handleClick('curRegion')}
                  onSearchChange={this.handleSearch('regionSearch')}
                  searchTerm={regionSearch}
                />
                <TenantChooser />
                <Avatar />
              </div>
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
