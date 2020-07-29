import { makeStyles } from '@material-ui/styles'
import ApiClient from 'api-client/ApiClient'
import {
  clarityDashboardUrl,
  dashboardUrl,
  helpUrl,
  ironicWizardUrl,
  logoutUrl,
} from 'app/constants'
import { Button } from '@material-ui/core'
import HelpPage from 'app/plugins/kubernetes/components/common/HelpPage'
import clsx from 'clsx'
import Intercom from 'core/components/integrations/Intercom'
import Navbar, { drawerWidth } from 'core/components/Navbar'
import Toolbar from 'core/components/Toolbar'
import useToggler from 'core/hooks/useToggler'
import { AppContext } from 'core/providers/AppProvider'
import LogoutPage from 'core/public/LogoutPage'
import pluginManager from 'core/utils/pluginManager'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'
import moize from 'moize'
import { apply, toPairs } from 'ramda'
import React, { useContext, useEffect, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router'
import useReactRouter from 'use-react-router'
import { emptyObj, ensureArray, isNilOrEmpty, pathStrOr } from 'utils/fp'
import { pathJoin } from 'utils/misc'
import PushEventsProvider from '../providers/PushEventsProvider'
import BannerContainer from 'core/components/notifications/BannerContainer'
import BannerContent from 'core/components/notifications/BannerContent'
import { trackEvent } from 'utils/tracking'

const { keystone } = ApiClient.getInstance()

const useStyles = makeStyles((theme) => ({
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
  sandboxBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,

    fontWeight: 'bold',
    fontSize: 16,
    '& a': {
      backgroundColor: '#f3f3f4',
      margin: theme.spacing(0, 1),
      '&:hover': {
        backgroundColor: '#FFFFFF',
      },
      '& *': {
        color: theme.palette.header.background,
      },
      '& i': {
        marginLeft: theme.spacing(),
      },
    },
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

const getSections = moize((plugins, role) =>
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
    window.location = clarityDashboardUrl
  } else if (ironicEnabled && history.location.pathname.includes('kubernetes')) {
    history.push(ironicWizardUrl)
  } else if (!ironicEnabled && history.location.pathname.includes('metalstack')) {
    history.push(dashboardUrl)
  }
}

const loadRegionFeatures = async (setRegionFeatures, setContext, history) => {
  try {
    const features = await keystone.getFeatures()

    // Store entirety of features json in context for global usage
    await setContext({ features })

    setRegionFeatures({
      kubernetes: features.experimental.containervisor,
      ironic: features.experimental.ironic,
      openstack: features.experimental.openstackEnabled,
      intercom: features.experimental.intercom,
    })

    redirectToAppropriateStack(
      // false, // Keep this false until ironic supported by the new UI
      features.experimental.ironic,
      features.experimental.containervisor,
      history,
    )
  } catch (err) {
    console.error(err)
  }
}

const determineStack = (history, features) => {
  if (features.ironic) {
    return 'metalstack'
  }
  return history.location.pathname.includes('openstack') ? 'openstack' : 'kubernetes'
}

const getSandboxUrl = (pathPart) => `https://platform9.com/${pathPart}/`

const AuthenticatedContainer = () => {
  const [drawerOpen, toggleDrawer] = useToggler(true)
  const [regionFeatures, setRegionFeatures] = useState(emptyObj)
  const {
    userDetails: { role },
    currentRegion,
    setContext,
    features,
  } = useContext(AppContext)
  const { history } = useReactRouter()
  const classes = useStyles({ path: history.location.pathname })
  useEffect(() => {
    // Pass the `setRegionFeatures` function to update the features as we can't use `await` inside of a `useEffect`
    loadRegionFeatures(setRegionFeatures, setContext, history)
  }, [currentRegion])

  const withStackSlider = regionFeatures.openstack && regionFeatures.kubernetes
  // stack is the name of the plugin (ex. openstack, kubernetes, developer, theme)
  const stack = determineStack(history, regionFeatures)

  const plugins = pluginManager.getPlugins()
  const sections = getSections(plugins, role)
  const devEnabled = window.localStorage.enableDevPlugin === 'true'

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
            {pathStrOr(false, 'experimental.sandbox', features) && (
              <>
                <BannerContainer />
                <BannerContent>
                  <div className={classes.sandboxBanner}>
                    Welcome! You are in the Platform9 live demo.{' '}
                    <Button
                      component="a"
                      target="_blank"
                      href={getSandboxUrl('signup')}
                      onClick={() =>
                        trackEvent('CTA Deploy a Cluster Now', { 'CTA-Page': 'PMK Live Demo' })
                      }
                    >
                      Start your Free Plan Now
                    </Button>{' '}
                    or{' '}
                    <Button
                      component="a"
                      target="_blank"
                      href={getSandboxUrl('contact')}
                      onClick={() => trackEvent('CTA Contact Us', { 'CTA-Page': 'PMK Live Demo' })}
                    >
                      Contact Us
                    </Button>
                  </div>
                </BannerContent>
              </>
            )}
            <div className={classes.contentMain}>
              {renderRawComponents(plugins)}
              <Switch>
                {renderPlugins(plugins, role)}
                <Route path={helpUrl} component={HelpPage} />
                <Route path={logoutUrl} component={LogoutPage} />
                <Redirect to={dashboardUrl} />
              </Switch>
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
