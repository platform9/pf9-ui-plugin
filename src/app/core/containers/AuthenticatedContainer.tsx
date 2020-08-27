import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'
import { CustomWindow } from 'app/polyfills/window'
import { dashboardUrl, helpUrl, logoutUrl, ironicWizardUrl } from 'app/constants'
import HelpPage from 'app/plugins/kubernetes/components/common/HelpPage'
import clsx from 'clsx'
import Intercom from 'core/components/integrations/Intercom'
import Navbar, { drawerWidth } from 'core/components/Navbar'
import Toolbar from 'core/components/Toolbar'
import useToggler from 'core/hooks/useToggler'
import LogoutPage from 'core/public/LogoutPage'
import { sessionActions, sessionStoreKey, SessionState } from 'core/session/sessionReducers'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'
import moize from 'moize'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router'
import useReactRouter from 'use-react-router'
import { emptyObj, ensureArray, isNilOrEmpty } from 'utils/fp'
import { pathJoin } from 'utils/misc'
import PushEventsProvider from 'core/providers/PushEventsProvider'
import moment from 'moment'
import { useToast } from 'core/providers/ToastProvider'
import { MessageTypes } from 'core/components/notifications/model'
import { RootState } from 'app/store'
import { Dictionary, toPairs, prop, apply } from 'ramda'
import pluginManager from 'core/utils/pluginManager'
import useDataLoader from 'core/hooks/useDataLoader'
import { regionActions } from 'k8s/components/infrastructure/common/actions'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import Progress from 'core/components/progress/Progress'

declare let window: CustomWindow

const { keystone } = ApiClient.getInstance()

const useStyles = makeStyles((theme: Theme) => ({
  appFrame: {
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  content: {
    marginTop: 55, // header height is hardcoded to 55px. account for that here.
    overflowX: 'auto',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
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
  contentMain: {
    padding: theme.spacing(3, 3, 3, 5),
  },
}))

const renderPluginRoutes = (role) => (id, plugin) => {
  const defaultRoute = plugin.getDefaultRoute()
  const genericRoutes = [
    {
      link: { path: pathJoin(plugin.basePath, '') },
      // TODO: Implement 404 page
      render: () => <Redirect to={defaultRoute || '/ui/404'} />,
    },
  ]
  const filteredRoutes = plugin
    .getRoutes()
    .filter(
      ({ requiredRoles }) =>
        isNilOrEmpty(requiredRoles) || ensureArray(requiredRoles).includes(role),
    )

  return [...filteredRoutes, ...genericRoutes].map((route) => {
    const { component: Component, render, link } = route
    return (
      <Route
        key={link.path}
        path={link.path}
        exact={link.exact || false}
        render={render}
        component={Component}
      />
    )
  })
}

const getSections = moize((plugins: Dictionary<any>, role) =>
  toPairs(plugins).map(([id, plugin]) => ({
    id,
    name: plugin.name,
    links: plugin
      .getNavItems()
      .filter(
        ({ requiredRoles }) =>
          isNilOrEmpty(requiredRoles) || ensureArray(requiredRoles).includes(role),
      ),
  })),
)

const renderPlugins = moize((plugins, role) =>
  toPairs(plugins)
    .map(apply(renderPluginRoutes(role)))
    .flat(),
)

const renderPluginComponents = (id, plugin) => {
  const pluginComponents = plugin.getComponents()

  return (
    <Route key={plugin.basePath} path={plugin.basePath} exact={false}>
      {pluginComponents.map((PluginComponent, idx) => (
        <PluginComponent key={idx} />
      ))}
    </Route>
  )
}

const renderRawComponents = moize((plugins) =>
  toPairs(plugins)
    .map(apply(renderPluginComponents))
    .flat(),
)

const redirectToAppropriateStack = (ironicEnabled, kubernetesEnabled, history) => {
  // If it is neither ironic nor kubernetes, bump user to old UI
  // TODO: For production, I need to always bump user to old UI in both ironic
  // and standard openstack cases, but I don't want to do that yet for development.
  // In fact maybe just never do that for development build since old ui is not running.
  if (!ironicEnabled && !kubernetesEnabled) {
    // window.location = clarityDashboardUrl
  } else if (ironicEnabled && history.location.pathname.includes('kubernetes')) {
    history.push(ironicWizardUrl)
  } else if (!ironicEnabled && history.location.pathname.includes('ironic')) {
    history.push(dashboardUrl)
  }
}

const AuthenticatedContainer = () => {
  const [drawerOpen, toggleDrawer] = useToggler(true)
  const [regionFeatures, setRegionFeatures] = useState<{
    openstack?: boolean
    kubernetes?: boolean
    intercom?: boolean
    ironic?: boolean
  }>(emptyObj)
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const {
    userDetails: { role },
  } = useSelector<RootState, SessionState>(selectSessionState)
  const session = useSelector<RootState, SessionState>(selectSessionState)
  const dispatch = useDispatch()
  const { history } = useReactRouter()
  const showToast = useToast()
  const classes = useStyles({ path: history.location.pathname })
  // Preload regions and tenants
  const [, loadingRegions] = useDataLoader(regionActions.list)
  const [, loadingTenants] = useDataLoader(loadUserTenants)

  useEffect(() => {
    const loadRegionFeatures = async () => {
      try {
        const features = await keystone.getFeatures()

        setRegionFeatures({
          kubernetes: features?.experimental?.containervisor,
          ironic: false, // Keep this false until ironic supported by the new UI
          // ironic: features?.experimental?.ironic,
          openstack: features?.experimental?.openstackEnabled,
          intercom: features?.experimental?.intercom,
        })

        redirectToAppropriateStack(
          false, // Keep this false until ironic supported by the new UI
          // features?.experimental?.ironic,
          features?.experimental?.containervisor,
          history,
        )
      } catch (err) {
        console.error(err)
      }
    }
    loadRegionFeatures()

    const id = setInterval(() => {
      // Check if session has expired
      const { expiresAt } = session
      const sessionExpired = moment().isAfter(expiresAt)
      if (sessionExpired) {
        dispatch(sessionActions.destroySession())
        showToast('The session has expired, please log in again', MessageTypes.warning)
        clearInterval(id)
      }
    }, 1000)
    // Reset the interval if the session changes
    return () => clearInterval(id)
  }, [])

  const withStackSlider = regionFeatures.openstack && regionFeatures.kubernetes
  // stack is the name of the plugin (ex. openstack, kubernetes, developer, theme)
  const stack = history.location.pathname.includes('openstack') ? 'openstack' : 'kubernetes'

  const plugins = pluginManager.getPlugins()
  const sections = getSections(plugins, role)
  const devEnabled = window.localStorage.enableDevPlugin === 'true'
  const authContent = (
    <Switch>
      {renderPlugins(plugins, role)}
      <Route path={helpUrl} component={HelpPage} />
      <Route path={logoutUrl} component={LogoutPage} />
      <Redirect to={dashboardUrl} />
    </Switch>
  )
  return (
    <>
      <div className={classes.appFrame}>
        <Toolbar />
        <Navbar
          withStackSlider={withStackSlider}
          drawerWidth={drawerWidth}
          sections={sections}
          open={drawerOpen}
          stack={stack}
          handleDrawerToggle={toggleDrawer}
        />
        <PushEventsProvider>
          <main
            className={clsx(classes.content, classes['content-left'], {
              [classes.contentShift]: drawerOpen,
              [classes['contentShift-left']]: drawerOpen,
            })}
          >
            {/* <BannerContainer /> */}
            <div className={classes.contentMain}>
              {renderRawComponents(plugins)}
              {!loadingRegions && !loadingTenants ? (
                authContent
              ) : (
                <Progress loading message={'Loading Regions and Tenants...'} />
              )}
              {devEnabled && <DeveloperToolsEmbed />}
            </div>
          </main>
        </PushEventsProvider>
      </div>
      {regionFeatures.intercom && <Intercom />}
    </>
  )
}

export default AuthenticatedContainer
