import { makeStyles } from '@material-ui/styles'
import { Button } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'
import { CustomWindow } from 'app/polyfills/window'
import {
  AppPlugins,
  appPlugins,
  clarityDashboardUrl,
  dashboardUrl,
  helpUrl,
  ironicWizardUrl,
  logoutUrl,
} from 'app/constants'
import HelpPage from 'app/plugins/kubernetes/components/common/HelpPage'
import clsx from 'clsx'
import Navbar, { drawerWidth } from 'core/components/Navbar'
import Toolbar from 'core/components/Toolbar'
import useToggler from 'core/hooks/useToggler'
import LogoutPage from 'core/public/LogoutPage'
import { sessionActions, SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import DeveloperToolsEmbed from 'developer/components/DeveloperToolsEmbed'
import moize from 'moize'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router'
import useReactRouter from 'use-react-router'
import { emptyObj, ensureArray, isNilOrEmpty, pathStrOr } from 'utils/fp'
import { pathJoin } from 'utils/misc'
import PushEventsProvider from 'core/providers/PushEventsProvider'
import moment from 'moment'
import { useToast } from 'core/providers/ToastProvider'
import { MessageTypes } from 'core/components/notifications/model'
import { RootState } from 'app/store'
import { apply, Dictionary, keys, mergeAll, prop, toPairs } from 'ramda'
import pluginManager from 'core/utils/pluginManager'
import useScopedPreferences from 'core/session/useScopedPreferences'
import BannerContainer from 'core/components/notifications/BannerContainer'
import BannerContent from 'core/components/notifications/BannerContent'
import { trackEvent } from 'utils/tracking'
import ClusterUpgradeBanner from 'core/banners/ClusterUpgradeBanner'
import Theme from 'core/themes/model'
import DocumentMeta from 'core/components/DocumentMeta'
import Bugsnag from '@bugsnag/js'
import { Route as Router } from 'core/utils/routes'

declare let window: CustomWindow

const { keystone } = ApiClient.getInstance()

interface StyleProps {
  path?: string
  hasSecondaryHeader?: boolean
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  '@global': {
    'body.form-view #main': {
      backgroundColor: theme.palette.grey['100'],
    },
  },
  appFrame: {
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
    backgroundColor: theme.palette.grey['000'],
  },
  content: {
    // marginTop: 55, // header height is hardcoded to 55px. account for that here.
    marginTop: ({ hasSecondaryHeader }) => (hasSecondaryHeader ? 151 : 55),
    overflowX: 'auto',
    flexGrow: 1,
    backgroundColor: theme.palette.grey['000'],
    padding: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  secondaryHeader: {
    position: 'fixed',
    top: 55,
    width: '100%',
    zIndex: 1100,
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
    padding: theme.spacing(3, 3, 3, 3.5),
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
        color: theme.palette.background,
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

// TODO: Deprecate this when a better URL management system is crafted
const redirectToAppropriateStack = (ironicEnabled, kubernetesEnabled, history) => {
  // If it is neither ironic nor kubernetes, bump user to old UI
  if (!ironicEnabled && !kubernetesEnabled) {
    history.push(clarityDashboardUrl)
  }

  // Redirect to ironic wizard if region only has ironic enabled & currently on kubernetes view
  if (ironicEnabled && !kubernetesEnabled && history.location.pathname.includes('kubernetes')) {
    history.push(ironicWizardUrl)
  }

  // Redirect to kubernetes dashboard if region only has kubernetes & currently on ironic view
  if (!ironicEnabled && kubernetesEnabled && history.location.pathname.includes('metalstack')) {
    history.push(dashboardUrl)
  }
}

const determineCurrentStack = (location, features, lastStack) => {
  const currentRoute = Router.getCurrentRoute()
  const handleReturn = () => {
    if (lastStack) {
      return lastStack
    }
    return AppPlugins.Kubernetes
  }

  if (!currentRoute) return handleReturn()

  const match = currentRoute.pattern.match(location.pathname)
  if (!match) return handleReturn()

  if (appPlugins.includes(match.plugin)) {
    return match.plugin
  }
  return handleReturn()
}

const linkedStacks = (stacks) =>
  // Creates object like
  // {
  //   openstack: {
  //     left: 'kubernetes',
  //     right: 'other stack',
  //   },
  //  ...
  // }
  mergeAll(
    stacks.sort().map((stack, index, collection) => ({
      [stack]: {
        left: collection[index - 1] || collection.slice(-1)[0],
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        right: collection[index + 1] || collection[0],
      },
    })),
  )

const determineStacks = (features) => {
  // Returns list of stacks, ensure metalstack and openstack do not show up together
  const stacks = keys(features).filter((stack) => features[stack])
  if (stacks.includes('metalstack') && stacks.includes('openstack')) {
    const filteredStacks = stacks.filter((stack) => stack !== 'openstack')
    return linkedStacks(filteredStacks)
  }
  return linkedStacks(stacks)
}

const loadRegionFeatures = async (setRegionFeatures, setStacks, dispatch, history) => {
  try {
    const features = await keystone.getFeatures()

    // Store entirety of features json in context for global usage
    dispatch(sessionActions.updateSession({ features }))

    const regionFeatures = {
      kubernetes: features.experimental.containervisor,
      metalstack: features.experimental.ironic,
      openstack: features.experimental.openstackEnabled,
    }

    setRegionFeatures(regionFeatures)
    setStacks(determineStacks(regionFeatures))

    redirectToAppropriateStack(
      features.experimental.ironic,
      features.experimental.containervisor,
      history,
    )
  } catch (err) {
    console.error(err)
  }
}

const getSandboxUrl = (pathPart) => `https://platform9.com/${pathPart}/`

const AuthenticatedContainer = () => {
  const { history, location } = useReactRouter()
  const [drawerOpen, toggleDrawer] = useToggler(true)
  const [regionFeatures, setRegionFeatures] = useState<{
    openstack?: boolean
    kubernetes?: boolean
    intercom?: boolean
    ironic?: boolean
  }>(emptyObj)
  const [{ currentRegion, lastStack }, updatePrefs] = useScopedPreferences()
  // stack is the name of the plugin (ex. openstack, kubernetes, developer, theme)
  const [currentStack, setStack] = useState(
    determineCurrentStack(history.location, regionFeatures, lastStack),
  )
  const [stacks, setStacks] = useState([])
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const {
    userDetails: { id: userId, name, displayName, role },
    features,
  } = session
  const plugins = pluginManager.getPlugins()
  const SecondaryHeader = plugins[currentStack]?.getSecondaryHeader()

  const dispatch = useDispatch()
  const showToast = useToast()
  const classes = useStyles({
    path: history.location.pathname,
    hasSecondaryHeader: !!SecondaryHeader,
  })

  useEffect(() => {
    // Pass the `setRegionFeatures` function to update the features as we can't use `await` inside of a `useEffect`
    loadRegionFeatures(setRegionFeatures, setStacks, dispatch, history)
  }, [currentRegion])

  useEffect(() => {
    if (!location || !regionFeatures) {
      return
    }
    const newStack = determineCurrentStack(location, regionFeatures, lastStack)
    setStack(newStack)
    updatePrefs({ lastStack: newStack })
  }, [location, regionFeatures])

  useEffect(() => {
    Bugsnag.setUser(userId, name, displayName)

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
    return () => {
      Bugsnag.setUser()
      clearInterval(id)
    }
  }, [])

  const withStackSlider = regionFeatures.openstack && regionFeatures.kubernetes

  const sections = getSections(plugins, role)
  const devEnabled = window.localStorage.enableDevPlugin === 'true'

  return (
    <>
      <DocumentMeta title="Welcome" />
      <div className={classes.appFrame}>
        <Toolbar />
        {SecondaryHeader && <SecondaryHeader className={classes.secondaryHeader} />}
        <Navbar
          withStackSlider={withStackSlider}
          drawerWidth={drawerWidth}
          sections={sections}
          open={drawerOpen}
          stack={currentStack}
          setStack={setStack}
          handleDrawerToggle={toggleDrawer}
          stacks={stacks}
          hasSecondaryHeader={!!SecondaryHeader}
        />
        <PushEventsProvider>
          <main
            id="main"
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
            {pathStrOr(false, 'experimental.containervisor', features) &&
              currentStack === 'kubernetes' && <ClusterUpgradeBanner />}
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
    </>
  )
}

export default AuthenticatedContainer
