import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import MenuIcon from '@material-ui/icons/Menu'
import TenantChooser from 'openstack/components/tenants/TenantChooser'
import RegionChooser from 'openstack/components/regions/RegionChooser'
import UserMenu from 'core/components/UserMenu'
import MaterialToolbar from '@material-ui/core/Toolbar/Toolbar'
import { AppBar, IconButton } from '@material-ui/core'
import { logoPath } from 'app/constants'
import { drawerWidth } from 'core/components/Navbar'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
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
    marginRight: theme.spacing.unit,
  },
  hide: {
    display: 'none',
  },
  logo: {
    maxHeight: theme.spacing.unit * 6.5,
  },
  rightTools: {
    position: 'absolute',
    right: theme.spacing.unit * 2,
    display: 'flex',
    alignItems: 'center',
  }
})

const Toolbar = ({ classes, open, handleDrawerOpen }) => (
  <AppBar className={classNames(classes.appBar, {
    [classes.appBarShift]: open,
    [classes['appBarShift-left']]: open,
  })}>
    <MaterialToolbar disableGutters={!open}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        className={classNames(classes.menuButton, open && classes.hide)}
      >
        <MenuIcon />
      </IconButton>
      <img src={logoPath} className={classes.logo} align="middle" />
      <div className={classes.rightTools}>
        <RegionChooser />
        <TenantChooser />
        <UserMenu />
      </div>
    </MaterialToolbar>
  </AppBar>

)

Toolbar.propTypes = {
  open: PropTypes.bool,
  handleDrawerOpen: PropTypes.func,
}

export default withStyles(styles, { withTheme: true })(Toolbar)
