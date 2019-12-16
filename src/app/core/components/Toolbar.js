import React from 'react'
import PropTypes from 'prop-types'
import TenantChooser from 'openstack/components/tenants/TenantChooser'
import RegionChooser from 'openstack/components/regions/RegionChooser'
import UserMenu from 'core/components/UserMenu'
import MaterialToolbar from '@material-ui/core/Toolbar/Toolbar'
import { AppBar } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import NotificationsPopover from 'core/components/notificationsPopover/NotificationsPopover'
import HelpContainer from 'core/components/HelpContainer'

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'fixed',
    boxShadow: 'none',
    backgroundColor: theme.palette.header.background,
  },
  menuButton: {
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1),
  },
  hide: {
    display: 'none',
  },
  rightTools: {
    position: 'absolute',
    right: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '700px',
  },
  leftMargin: {
    marginLeft: theme.spacing(2),
  },
}))

const Toolbar = ({ open }) => {
  const classes = useStyles()
  return <AppBar className={classes.appBar}>
    <MaterialToolbar variant="dense" disableGutters={!open}>
      <div className={classes.rightTools}>
        <HelpContainer />
        <RegionChooser className={classes.leftMargin} />
        <TenantChooser className={classes.leftMargin} />
        <NotificationsPopover className={classes.leftMargin} />
        <UserMenu className={classes.leftMargin} />
      </div>
    </MaterialToolbar>
  </AppBar>
}

Toolbar.propTypes = {
  open: PropTypes.bool,
}

export default Toolbar
