import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import Intercom from 'core/components/integrations/Intercom'
import Navbar, { drawerWidth } from 'core/components/Navbar'
import Toolbar from 'core/components/Toolbar'
import useToggler from 'core/hooks/useToggler'
import { emptyObj, isNilOrEmpty, ensureArray } from 'utils/fp'
import { Switch, Redirect, Route } from 'react-router'
import moize from 'moize'
import { toPairs, apply } from 'ramda'
import { pathJoin } from 'utils/misc'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'
import pluginManager from 'core/utils/pluginManager'
import { logoutUrl, dashboardUrl } from 'app/constants'
import LogoutPage from 'core/public/LogoutPage'
import { AppContext } from 'core/providers/AppProvider'

const useStyles = makeStyles(theme => ({
  appFrame: {
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  content: {
    overflowX: 'auto',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    minHeight: theme.spacing(6),
  },
}))

const renderPluginRoutes = role => (id, plugin) => {
  const defaultRoute = plugin.getDefaultRoute()
  const genericRoutes = [
    {
      link: { path: pathJoin(plugin.basePath, '') },
      // TODO: Implement 404 page
      render: () => <Redirect to={defaultRoute || '/ui/404'} />,
    },
  ]
  const filteredRoutes = plugin.getRoutes()
    .filter(({ requiredRoles }) =>
      isNilOrEmpty(requiredRoles) || ensureArray(requiredRoles).includes(role))

  return [...filteredRoutes, ...genericRoutes].map(route => {
    const { component: Component, render, link } = route
    return <Route
      key={link.path}
      path={link.path}
      exact={link.exact || false}
      render={render}
      component={Component} />
  })
}

const getSections = moize((plugins, role) =>
  toPairs(plugins)
    .map(([id, plugin]) => ({
      id,
      name: plugin.name,
      links: plugin.getNavItems()
        .filter(({ requiredRoles }) =>
          isNilOrEmpty(requiredRoles) || ensureArray(requiredRoles).includes(role)),
    })))

const renderPlugins = moize((plugins, role) =>
  toPairs(plugins).map(apply(renderPluginRoutes(role))).flat(),
)

const loadFeatures = async setFeatures => {
  // Note: urlOrigin may or may not be changed to use a specific path instead of
  // window.location.origin, this depends on whether the new UI is intended to be
  // accessed from the master DU or from each region.
  const urlOrigin = window.location.origin
  // Timestamp tag used for preventing browser caching of features.json
  const timestamp = new Date().getTime()
  try {
    const response = await axios.get(`${urlOrigin}/clarity/features.json?tag=${timestamp}`)
    setFeatures({
      withStackSlider: !!response.data.experimental.openstackEnabled,
    })
  } catch (err) {
    console.error('No features.json')
    // Just set slider to true for now as a default.
    // This is fine from the old UI perspective because if routed to the
    // dashboard (which is what happens today), the old UI can handle
    // the stack switching appropriately.
    setFeatures({
      withStackSlider: true,
    })
  }
}

const AuthenticatedContainer = () => {
  const [drawerOpen, toggleDrawer] = useToggler(true)
  const [features, setFeatures] = useState(emptyObj)
  const { userDetails: { role } } = useContext(AppContext)
  const classes = useStyles()

  useEffect(() => {
    // Pass the `setFeatures` function to update the features as we can't use `await` inside of a `useEffect`
    loadFeatures(setFeatures)
  }, [])

  const plugins = pluginManager.getPlugins()
  const sections = getSections(plugins, role)
  const devEnabled = window.localStorage.enableDevPlugin === 'true'

  return (
    <>
      <div className={classes.appFrame}>
        <Toolbar />
        <Navbar
          withStackSlider={features.withStackSlider}
          drawerWidth={drawerWidth}
          sections={sections}
          open={drawerOpen}
          handleDrawerToggle={toggleDrawer} />
        <main className={clsx(classes.content, classes['content-left'], {
          [classes.contentShift]: drawerOpen,
          [classes['contentShift-left']]: drawerOpen,
        })}>
          <div className={classes.drawerHeader} />
          <div>
            <Switch>
              {renderPlugins(plugins, role)}
              <Route path={logoutUrl} component={LogoutPage} />
              <Redirect to={dashboardUrl} />
            </Switch>
            {devEnabled && <DeveloperToolsEmbed />}
          </div>
        </main>
      </div>
      <Intercom />
    </>
  )
}

export default AuthenticatedContainer
