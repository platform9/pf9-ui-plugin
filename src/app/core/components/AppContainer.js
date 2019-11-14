import React, { useEffect, useState } from 'react'
import useReactRouter from 'use-react-router'
import axios from 'axios'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import Intercom from 'core/components/integrations/Intercom'
import Navbar, { drawerWidth } from 'core/components/Navbar'
import Toolbar from 'core/components/Toolbar'
import track from 'utils/tracking'
import useToggler from 'core/hooks/useToggler'
import { emptyObj } from 'utils/fp'
import { Switch, Redirect, Route } from 'react-router'
import moize from 'moize'
import { toPairs, apply } from 'ramda'
import { pathJoin } from 'utils/misc'
import ResetPasswordPage from 'openstack/components/ResetPasswordPage'
import ForgotPasswordPage from 'openstack/components/ForgotPasswordPage'
import LogoutPage from 'openstack/components/LogoutPage'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'
import pluginManager from 'core/utils/pluginManager'

const useStyles = makeStyles(theme => ({
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
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
}))

const renderPluginRoutes = (id, plugin) => {
  const defaultRoute = plugin.getDefaultRoute()
  const genericRoutes = [
    // TODO implement generic login page?
    { link: { path: pathJoin(plugin.basePath, 'login') }, component: null },
    {
      link: { path: pathJoin(plugin.basePath, 'reset_password') },
      exact: true,
      component: ResetPasswordPage,
    },
    {
      link: { path: pathJoin(plugin.basePath, 'forgot_password') },
      exact: true,
      component: ForgotPasswordPage,
    },
    { link: { path: pathJoin(plugin.basePath, 'logout') }, exact: true, component: LogoutPage },
    {
      link: { path: pathJoin(plugin.basePath, '') },
      // TODO: Implement 404 page
      render: () => <Redirect to={defaultRoute || '/ui/404'} />,
    },
  ]
  return [...plugin.getRoutes(), ...genericRoutes].map(route => {
    const { component: Component, render, link } = route
    return <Route
      key={link.path}
      path={link.path}
      exact={link.exact || false}
      render={render}
      component={Component} />
  })
}

const getSections = moize(plugins =>
  toPairs(plugins).map(([id, plugin]) => ({
    id,
    name: plugin.name,
    links: plugin.getNavItems(),
  })))

const renderPlugins = moize(plugins =>
  toPairs(plugins).map(apply(renderPluginRoutes)).flat(),
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

const AppContainer = () => {
  const [drawerOpen, toggleDrawer] = useToggler()
  const [features, setFeatures] = useState(emptyObj)
  const { history } = useReactRouter()
  const classes = useStyles()

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      track('pageLoad', { route: `${location.pathname}${location.hash}` })
    })

    // This is to send page event for the first page the user lands on
    track('pageLoad', { route: `${history.location.pathname}${history.location.hash}` })

    // Pass the `setFeatures` function to update the features as we can't use `await` inside of a `useEffect`
    loadFeatures(setFeatures)

    return unlisten
  }, [])

  const plugins = pluginManager.getPlugins()
  const sections = getSections(plugins)
  const devEnabled = window.localStorage.enableDevPlugin === 'true'

  return (
    <div className={classes.root} id="_main-container">
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
              {renderPlugins(plugins)}
            </Switch>
            {devEnabled && <DeveloperToolsEmbed />}
          </div>
        </main>
      </div>
      <Intercom />
    </div>
  )
}

AppContainer.propTypes = {
  sections: Navbar.propTypes.sections,
}

export default AppContainer
