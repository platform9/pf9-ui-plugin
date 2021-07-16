// @ts-nocheck
import { makeStyles } from '@material-ui/styles'
import { Button } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'
import { CustomWindow } from 'app/polyfills/window'
import {
  AppPlugins,
  appPlugins,
  clarityDashboardUrl,
  CustomerTiers,
  dashboardUrl,
  helpUrl,
  ironicWizardUrl,
  logoutUrl,
  pmkftSignupLink,
  UserPreferences,
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
import { useToast } from 'core/providers/ToastProvider'
import { RootState } from 'app/store'
import { apply, Dictionary, keys, mergeAll, path, pathOr, prop, toPairs as ToPairs } from 'ramda'
import pluginManager from 'core/utils/pluginManager'
import useScopedPreferences from 'core/session/useScopedPreferences'
import BannerContainer from 'core/components/notifications/BannerContainer'
import BannerContent from 'core/components/notifications/BannerContent'
import { trackEvent } from 'utils/tracking'
// import ClusterUpgradeBanner from 'core/banners/ClusterUpgradeBanner'
import Theme from 'core/themes/model'
import DocumentMeta from 'core/components/DocumentMeta'
import Bugsnag from '@bugsnag/js'
import { Route as Router } from 'core/utils/routes'
import { addZendeskWidgetScriptToDomBody, hideZendeskWidget } from 'utils/zendesk-widget'
import { preferencesActions } from 'core/session/preferencesReducers'
import { isDecco, isProductionEnv } from 'core/utils/helpers'
import Watchdog from 'core/watchdog'
import sessionTimeoutCheck from 'core/watchdog/session-timeout'
import OnboardingPage, { OnboardingStepNames } from 'k8s/components/onboarding/onboarding-page'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { mngmUserActions } from 'app/plugins/account/components/userManagement/users/actions'
import Progress from 'core/components/progress/Progress'
import DataKeys from 'k8s/DataKeys'
import { cacheStoreKey, updatingStoreKey } from 'core/caching/cacheReducers'

const toPairs: any = ToPairs

declare let window: CustomWindow

const { keystone, preferenceStore } = ApiClient.getInstance()

const userPreferenceKeys = [
  UserPreferences.FeatureFlags,
  UserPreferences.Aws,
  UserPreferences.Azure,
]

interface StyleProps {
  path?: string
  hasSecondaryHeader?: boolean
  showNavBar?: boolean
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
    minHeight: '100vh',
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
    padding: ({ showNavBar }) =>
      showNavBar ? theme.spacing(3, 3, 3, 3.5) : theme.spacing(3, 3, 3, 25),
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
  modal: {
    position: 'fixed',
    left: 0,
    top: '55px',
    width: '100vw',
    height: 'calc(100vh - 55px)', // 55px is the toolbar height
    overflow: 'auto',
    zIndex: 5000,
    backgroundColor: theme.palette.grey['100'],
    padding: theme.spacing(2, 4),
    boxSizing: 'border-box',
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

const getSections = moize((plugins: Dictionary<any>, role, features) =>
  toPairs(plugins).map(([id, plugin]) => ({
    id,
    name: plugin.name,
    links: plugin
      .getNavItems()
      .filter(
        ({ requiredRoles }) =>
          isNilOrEmpty(requiredRoles) || ensureArray(requiredRoles).includes(role),
      )
      .filter(
        ({ requiredFeatures }) => isNilOrEmpty(requiredFeatures) || requiredFeatures(features),
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

export const determineCurrentStack = (location, features, lastStack) => {
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
      kubernetes: features?.experimental?.containervisor,
      metalstack: features?.experimental?.ironic,
      openstack: features?.experimental?.openstackEnabled,
    }

    setRegionFeatures(regionFeatures)
    setStacks(determineStacks(regionFeatures))

    redirectToAppropriateStack(
      features?.experimental?.ironic,
      features?.experimental?.containervisor,
      history,
    )
  } catch (err) {
    console.error(err)
  }
}

const getSandboxUrl = (pathPart) => `https://platform9.com/${pathPart}/`

function isOnboardingEnv(currentStack, features) {
  const customerTier = pathOr<CustomerTiers>(CustomerTiers.Freedom, ['customer_tier'], features)
  return (
    currentStack === AppPlugins.Kubernetes &&
    isDecco(features) &&
    customerTier === CustomerTiers.Freedom
  )
}

function needsOnboardingBackfill(
  currentStack,
  features,
  featureFlags,
  clusters,
  clustersUpdating,
  users,
) {
  const isOnboardingTargetEnv = isOnboardingEnv(currentStack, features)
  return (
    isOnboardingTargetEnv &&
    featureFlags.isOnboarded === undefined &&
    !clustersUpdating &&
    clusters?.length > 0 &&
    users?.length > 1
  )
}

const AuthenticatedContainer = () => {
  const { history, location } = useReactRouter()
  const [drawerOpen, toggleDrawer] = useToggler(true)
  const dispatch = useDispatch()
  const showToast = useToast()
  const [regionFeatures, setRegionFeatures] = useState<{
    openstack?: boolean
    kubernetes?: boolean
    intercom?: boolean
    ironic?: boolean
  }>(emptyObj)
  const { prefs, updatePrefs } = useScopedPreferences()
  const { currentRegion, lastStack } = prefs
  // stack is the name of the plugin (ex. openstack, kubernetes, developer, theme)
  const [currentStack, setStack] = useState(
    determineCurrentStack(history.location, regionFeatures, lastStack),
  )
  const [stacks, setStacks] = useState([])
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const {
    username,
    userDetails: { id: userId, name, displayName, role },
    features,
    onboardingRedirectToUrl,
  } = session
  const customerTier = pathOr<CustomerTiers>(CustomerTiers.Freedom, ['customer_tier'], features)
  const plugins = pluginManager.getPlugins()
  const SecondaryHeader = plugins[currentStack]?.getSecondaryHeader()

  // Onboarding
  const clustersUpdating = useSelector(path([cacheStoreKey, updatingStoreKey, DataKeys.Clusters]))

  const { prefs: defaultPrefs, updateUserDefaults } = useScopedPreferences('defaults')
  const { featureFlags = {} as any } = defaultPrefs
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const shouldBackfillOnboarding = needsOnboardingBackfill(
    currentStack,
    features,
    featureFlags,
    clusters,
    clustersUpdating,
    users,
  )
  const isOnboardingTargetEnv = isOnboardingEnv(currentStack, features)

  const isLoadingInitialData =
    (clusters?.length === 0 && loadingClusters) || (users?.length === 0 && loadingUsers)

  const showOnboarding =
    isOnboardingTargetEnv && !shouldBackfillOnboarding && !featureFlags.isOnboarded

  let onboardingWizardStep = OnboardingStepNames.WelcomeStep
  if (showOnboarding && clusters?.length >= 1 && users?.length === 1) {
    onboardingWizardStep = OnboardingStepNames.InviteCoworkerStep
  }

  const shouldShowNavbarForCurrentStack =
    currentStack !== AppPlugins.MyAccount ||
    (currentStack === AppPlugins.MyAccount && role === 'admin')

  const showNavBar =
    shouldShowNavbarForCurrentStack &&
    !(isOnboardingTargetEnv && !featureFlags.isOnboarded && isLoadingInitialData)

  const classes = useStyles({
    path: history.location.pathname,
    hasSecondaryHeader: !!SecondaryHeader,
    showNavBar: showNavBar,
  })

  // onboarding
  useEffect(() => {
    if (shouldBackfillOnboarding) {
      updateUserDefaults(UserPreferences.FeatureFlags, { isOnboarded: true })
    }
    if (onboardingRedirectToUrl) {
      history.push(onboardingRedirectToUrl)
      dispatch(sessionActions.updateSession({ onboardingRedirectToUrl: null }))
    }
  }, [shouldBackfillOnboarding, onboardingRedirectToUrl, history])

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

    const cleanupCb = Watchdog.register({
      handler: sessionTimeoutCheck(session, showToast),
      frequency: 1000,
    })
    // Reset the interval if the session changes
    return () => {
      Bugsnag.setUser()
      cleanupCb()
    }
  }, [])

  // Add Zendesk widget script only for Enterprise users
  useEffect(() => {
    if (customerTier === CustomerTiers.Enterprise && isProductionEnv) {
      addZendeskWidgetScriptToDomBody({ userId, displayName, email: name })
    }
    return () => {
      hideZendeskWidget()
    }
  }, [userId, displayName, name, customerTier])

  useEffect(() => {
    const loadUserPrefs = async () => {
      if (!userId) return

      userPreferenceKeys.map(async (key) => {
        const response: any = await preferenceStore.getUserPreference(userId, key)
        if (!response) return
        const value = JSON.parse(response.value)

        dispatch(
          preferencesActions.updatePrefs({
            username,
            key: ['defaults', key],
            prefs: value,
          }),
        )
      })
    }
    loadUserPrefs()
  }, [userId, username])

  const withStackSlider = regionFeatures?.openstack && regionFeatures?.kubernetes

  const sections = getSections(plugins, role, features)
  const devEnabled = window.localStorage.enableDevPlugin === 'true'

  const renderOnboardingWizard = () => (
    <div id="onboarding" className={classes.modal}>
      <OnboardingPage initialStep={onboardingWizardStep} />
    </div>
  )

  const renderMainContent = () => (
    <>
      {renderRawComponents(plugins)}
      <Switch>
        {renderPlugins(plugins, role)}
        <Route path={helpUrl} component={HelpPage} />
        <Route path={logoutUrl} component={LogoutPage} />
        <Redirect to={dashboardUrl} />
      </Switch>
      {devEnabled && <DeveloperToolsEmbed />}
    </>
  )

  return (
    <>
      <DocumentMeta title="Welcome" />
      <div className={classes.appFrame}>
        <Toolbar hideNotificationsDropdown={showOnboarding} />
        {SecondaryHeader && <SecondaryHeader className={classes.secondaryHeader} />}
        {showNavBar && (
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
        )}
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
                      href={pmkftSignupLink}
                      onClick={() =>
                        trackEvent('Live Demo - Signup Request', { 'CTA-Page': 'PMK Live Demo' })
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
              {isOnboardingTargetEnv && !featureFlags.isOnboarded && isLoadingInitialData ? (
                <Progress loading={loadingClusters || loadingUsers} />
              ) : showOnboarding ? (
                renderOnboardingWizard()
              ) : (
                renderMainContent()
              )}
            </div>
          </main>
        </PushEventsProvider>
      </div>
    </>
  )
}

export default AuthenticatedContainer
