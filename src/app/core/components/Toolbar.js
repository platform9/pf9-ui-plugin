import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import TenantChooser from 'openstack/components/tenants/TenantChooser'
import RegionChooser from 'openstack/components/regions/RegionChooser'
import UserMenu from 'core/components/UserMenu'
import MaterialToolbar from '@material-ui/core/Toolbar/Toolbar'
import { AppBar } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import NotificationsPopover from 'core/components/notifications/NotificationsPopover'
import { CustomerTiers, imageUrls } from 'app/constants'
import useReactRouter from 'use-react-router'
import { routes } from 'core/utils/routes'
import { pathOr, prop } from 'ramda'
import { preferencesStoreKey } from 'core/session/preferencesReducers'
import { useSelector } from 'react-redux'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { determineCurrentStack } from 'core/containers/AuthenticatedContainer'

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'fixed',
    boxShadow: 'none',
    backgroundColor: theme.components.header.background,
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
    marginLeft: 28,
  },
  logo: {
    height: 29,
    marginLeft: 25,
    cursor: 'pointer',
  },
}))

const Toolbar = ({ open, hideNotificationsDropdown }) => {
  const classes = useStyles({})
  const { history } = useReactRouter()
  const selectPrefsState = prop(preferencesStoreKey)
  const { logoUrl } = useSelector(selectPrefsState)

  const handleLogoClick = useCallback(() => history.push(routes.dashboard.path()))

  return (
    <AppBar className={classes.appBar}>
      <MaterialToolbar variant="dense" disableGutters={!open}>
        <img
          src={logoUrl || imageUrls.logoPrimary}
          onClick={handleLogoClick}
          alt="Platform9 Logo"
          className={classes.logo}
        />
        <div className={classes.rightTools}>
          <RegionChooser className={classes.leftMargin} />
          <TenantChooser className={classes.leftMargin} />
          <NotificationsPopover
            className={classes.leftMargin}
            hideDropdown={hideNotificationsDropdown}
          />
          <UserMenu className={classes.leftMargin} />
        </div>
      </MaterialToolbar>
    </AppBar>
  )
}

Toolbar.propTypes = {
  open: PropTypes.bool,
}

export default Toolbar
