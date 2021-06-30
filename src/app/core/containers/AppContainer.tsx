import { makeStyles } from '@material-ui/styles'
import ApiClient from 'api-client/ApiClient'
import { CustomWindow } from 'app/polyfills/window'
import {
  activateUserUrl,
  CustomerTiers,
  forgotPasswordUrl,
  GlobalPreferences,
  loginUrl,
  loginWithCookieUrl,
  loginWithSsoUrl,
  resetPasswordThroughEmailUrl,
  resetPasswordUrl,
  ssoEnabledTiers,
} from 'app/constants'
import Progress from 'core/components/progress/Progress'
import AuthenticatedContainer from 'core/containers/AuthenticatedContainer'
import ActivateUserPage from 'core/public/ActivateUserPage'
import ForgotPasswordPage from 'core/public/ForgotPasswordPage'
import LoginPage from 'core/public/LoginPage'
import ResetPasswordPage from 'core/public/ResetPasswordPage'
import { sessionStoreKey, sessionActions, SessionState } from 'core/session/sessionReducers'
import { cacheActions } from 'core/caching/cacheReducers'
import { notificationActions } from 'core/notifications/notificationReducers'
import { prop, propEq, head } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router'
import useReactRouter from 'use-react-router'
import { isNilOrEmpty, pathStrOr } from 'utils/fp'
import { getCookieValue } from 'utils/misc'
import {
  appCuesSetAnonymous,
  driftScriptContent,
  segmentScriptContent,
  trackPage,
} from 'utils/tracking'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import axios from 'axios'
import { updateClarityStore } from 'utils/clarityHelper'
import { DocumentMetaCls } from 'core/components/DocumentMeta'
import { updateSession } from 'app/plugins/account/components/userManagement/users/actions'
import Theme from 'core/themes/model'
import Bugsnag from '@bugsnag/js'
import Watchdog from 'core/watchdog'
import systemHealthCheck from 'core/watchdog/system-health'
import { isDecco } from 'core/utils/helpers'
import config from '../../../../config'

const { setActiveRegion, preferenceStore } = ApiClient.getInstance()

const urlBase = process.env.NODE_ENV !== 'production' ? config.apiHost : ''

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  progress: {
    '& img': {
      height: 130,
    },
    '& img ~ span': {
      fontSize: theme.typography.subtitle1.fontSize,
    },
  },
}))

declare let window: CustomWindow

const whiteListedUrls = [loginUrl, forgotPasswordUrl, resetPasswordUrl, activateUserUrl]

const isWhitelistedUrl = (pathname): boolean => {
  // Allow the following paths to load as entry point when user is not logged in
  return whiteListedUrls.includes(pathname)
}

const restoreSession = async (
  pathname,
  session,
  history,
): Promise<{
  username?: string
  unscopedToken?: string
  expiresAt?: string
  issuedAt?: string
  ssoLogin?: boolean
  // eslint-disable-next-line @typescript-eslint/require-await
}> => {
  const { keystone } = ApiClient.getInstance()

  // When trying to login with cookie with pmkft
  if (pathname === loginWithCookieUrl) {
    const urlParams = new URLSearchParams(history.location.search)
    const scopedToken = urlParams.get('token') || getCookieValue('X-Auth-Token')

    // Start from scratch to make use of prebuilt functions
    // for standard login page
    return keystone.getUnscopedTokenWithToken(scopedToken)
  }

  if (pathname === loginWithSsoUrl) {
    return keystone.authenticateSso()
  }

  // Attempt to restore the session
  const { username, unscopedToken: currUnscopedToken } = session
  if (username && currUnscopedToken) {
    // We need to make sure the token has not expired.
    return keystone.renewToken(currUnscopedToken)
  }
  return {}
}

const getUserDetails = async (user) => {
  if (typeof window.analytics === 'undefined') return

  // Need this here again bc not able to use AppContainer state and ensure
  // that sandbox state would be set on time for both users logging in for
  // first time and for users who are already logged in
  const features = await axios.get(`${urlBase}/clarity/features.json`).catch(() => null)
  const sandbox = pathStrOr(false, 'data.experimental.sandbox', features)
  const customerTier = pathStrOr(CustomerTiers.Freedom, 'customer_tier', features)

  // Identify the user in Segment using Keystone ID
  if (sandbox) {
    return window.analytics.identify()
  }

  const payload: any = {
    email: user.email,
  }
  if (
    isDecco(features) &&
    (customerTier === CustomerTiers.Growth || customerTier === CustomerTiers.Enterprise)
  ) {
    try {
      const externalId = await preferenceStore.getGlobalPreference(
        GlobalPreferences.CustomerExternalId,
      )
      if (externalId) {
        payload.accountExternalId = externalId
        payload.contactExternalId = user.email
      }
    } catch (err) {}
  }
  window.analytics.identify(user.id, payload)
}

/**
 * Sets up the Openstack session.
 * Renders children when logged in.
 * Otherwise shows the <LoginPage>
 */
const AppContainer = () => {
  const classes = useStyles({})
  const { history } = useReactRouter()
  const { pathname, hash } = history.location
  const [sessionChecked, setSessionChecked] = useState(false)
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const { features, isSsoToken } = session
  const [, , getUserPrefs] = useScopedPreferences()
  const dispatch = useDispatch()
  const [loginFeatures, setLoginFeatures] = useState({ loaded: false, sso: false })
  const [customerTier, setCustomerTier] = useState(null)

  useEffect(() => {
    const unlisten = history.listen((location) => {
      trackPage(`${location.pathname}${location.hash}`)
      if (features?.experimental?.sandbox) {
        appCuesSetAnonymous()
      }
    })

    // This is to send page event for the first page the user lands on
    trackPage(`${pathname}${hash}`)
    if (features?.experimental?.sandbox) {
      appCuesSetAnonymous()
    }

    const loadLoginFeaturesAndTracking = async () => {
      /* eslint-disable */
      // Check for sandbox flag, if false identify the user in Segment using Keystone ID
      // This needs to be done here bc this needs to be done before login.
      // Features are requested again later for the specific logged-in region,
      // whereas this one is done on the master DU from which the UI is served.
      // Ignore exception if features.json not found (for local development)
      const initialFeatures = await axios.get(`${urlBase}/clarity/features.json`).catch(() => null)
      const customerTier = pathStrOr(CustomerTiers.Freedom, 'data.customer_tier', initialFeatures)
      setCustomerTier(customerTier)
      const sandboxFlag = pathStrOr(false, 'data.experimental.sandbox', initialFeatures)
      const analyticsOff = pathStrOr(false, 'data.experimental.analyticsOff', initialFeatures)
      const airgapped = pathStrOr(false, 'data.experimental.airgapped', initialFeatures)
      const duVersion = pathStrOr('', 'data.releaseVersion', initialFeatures)

      Bugsnag.addMetadata('App', {
        customerTier,
        duVersion,
      })

      // Segment tracking
      if (!analyticsOff && !airgapped) {
        DocumentMetaCls.addScriptElementToDomBody({
          id: 'segmentCode',
          textContent: segmentScriptContent,
        })
      }

      // Drift tracking code for live demo
      if (sandboxFlag) {
        DocumentMetaCls.addScriptElementToDomBody({
          id: 'driftCode',
          textContent: driftScriptContent,
        })
      }

      // Legacy DU & DDU have different conditions
      setLoginFeatures({
        loaded: true,
        sso:
          (initialFeatures?.data?.experimental?.kplane && ssoEnabledTiers.includes(customerTier)) ||
          (!initialFeatures?.data?.experimental?.kplane &&
            pathStrOr(false, 'data.experimental.sso', initialFeatures)),
      })
      if (isDecco(initialFeatures?.data)) {
        Watchdog.register({ handler: systemHealthCheck, frequency: 1000 * 60 * 10 })
      }
    }

    const validateSession = async () => {
      // Bypass the session check if we are accessing a whitelisted url
      if (isWhitelistedUrl(pathname) || hash.includes(resetPasswordThroughEmailUrl)) {
        return setSessionChecked(true)
      }

      // Validate and "refresh" the existing session
      const {
        issuedAt,
        username = session.username,
        unscopedToken,
        expiresAt,
        ssoLogin,
      } = await restoreSession(pathname, session, history)

      if (unscopedToken) {
        await setupSession({
          username,
          unscopedToken,
          expiresAt,
          issuedAt,
          isSsoToken: isSsoToken || ssoLogin,
        })
      } else {
        // Order matters
        setSessionChecked(true)
        dispatch(sessionActions.destroySession())
        dispatch(cacheActions.clearCache())
        dispatch(notificationActions.clearNotifications())
      }
    }

    const initialize = async () => {
      await loadLoginFeaturesAndTracking()
      validateSession()
    }
    initialize()

    // TODO: Need to fix this code after synching up with backend.
    if (hash.includes(resetPasswordThroughEmailUrl)) {
      history.replace(hash.slice().replace('#', '/ui'))
    }

    return unlisten
  }, [])

  const setupSession = async ({ username, unscopedToken, expiresAt, issuedAt, isSsoToken }) => {
    const { currentTenant, currentRegion } = getUserPrefs(username)
    const tenants = await loadUserTenants()
    if (isNilOrEmpty(tenants)) {
      throw new Error('No tenants found, please contact support')
    }
    const activeTenant =
      tenants.find(propEq('id', currentTenant)) ||
      tenants.find(propEq('name', 'service')) ||
      head(tenants)
    if (!currentTenant && activeTenant) {
      updateClarityStore('tenantObj', activeTenant)
    }
    const activeTenantId = activeTenant.id

    if (currentRegion) {
      setActiveRegion(currentRegion)
    }

    // Order matters
    const user = await updateSession({
      username,
      unscopedToken,
      expiresAt,
      issuedAt,
      isSsoToken,
      currentTenantId: activeTenantId,
    })
    setSessionChecked(true)
    if (user) {
      await getUserDetails(user)
    }
  }

  const authContent =
    isNilOrEmpty(session) || !session.username ? (
      <Redirect to={loginUrl} />
    ) : (
      <AuthenticatedContainer />
    )

  // Do not let the rest of the UI load until we have a working session.
  return (
    <div className={classes.root} id="_main-container">
      <Switch>
        <Route path={resetPasswordUrl} component={ResetPasswordPage} />
        <Route path={forgotPasswordUrl} component={ForgotPasswordPage} />
        <Route path={activateUserUrl} component={ActivateUserPage} />
        <Route path={loginUrl}>
          {loginFeatures.loaded && (
            <LoginPage
              onAuthSuccess={setupSession}
              ssoEnabled={loginFeatures.sso}
              customerTier={customerTier}
            />
          )}
        </Route>
        <Route>
          {sessionChecked ? (
            authContent
          ) : (
            <div className={classes.progress}>
              <Progress loading message={'Loading app'} />
            </div>
          )}
        </Route>
      </Switch>
    </div>
  )
}

export default AppContainer
