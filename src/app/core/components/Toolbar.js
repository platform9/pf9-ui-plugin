import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import MenuIcon from '@material-ui/icons/Menu'
import TenantChooser from 'openstack/components/tenants/TenantChooser'
import RegionChooser from 'openstack/components/regions/RegionChooser'
import UserMenu from 'core/components/UserMenu'
import MaterialToolbar from '@material-ui/core/Toolbar/Toolbar'
import { AppBar, IconButton } from '@material-ui/core'
import { imageUrls } from 'app/constants'
import { drawerWidth } from 'core/components/Navbar'
import { withStyles } from '@material-ui/styles'

export const extraContentId = 'top-extra-content'

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
    justifyContent: 'flex-end',
    width: '700px',
  },
  leftMargin: {
    marginLeft: theme.spacing.unit * 2,
  },
  extraContent: {
    position: 'absolute',
    color: theme.palette.text.primary,
    right: theme.spacing.unit * 3,
    bottom: -(theme.spacing.unit * 9.5),
  },
})

const renderExtraContent = classes => {
  return <div className={classes.extraContent} id={extraContentId} />
}

const Toolbar = ({ classes, open, handleDrawerOpen }) => (
  <AppBar className={clsx(classes.appBar, {
    [classes.appBarShift]: open,
    [classes['appBarShift-left']]: open,
  })}>
    <MaterialToolbar disableGutters={!open}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        className={clsx(classes.menuButton, open && classes.hide)}
      >
        <MenuIcon />
      </IconButton>
      <img src={imageUrls.logo} className={classes.logo} align="middle" />
      <div className={classes.rightTools}>
        <RegionChooser />
        <TenantChooser className={classes.leftMargin} />
        <UserMenu className={classes.leftMargin} />
      </div>
    </MaterialToolbar>
    {renderExtraContent(classes)}
  </AppBar>

)

Toolbar.propTypes = {
  open: PropTypes.bool,
  handleDrawerOpen: PropTypes.func,
}

export default withStyles(styles, { withTheme: true })(Toolbar)
