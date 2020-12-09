import { makeStyles } from '@material-ui/styles'
import ApiClient from 'api-client/ApiClient'
import { CustomWindow } from 'app/polyfills/window'
import {
  activateUserUrl,
  forgotPasswordUrl,
  loginUrl,
  loginWithCookieUrl,
  resetPasswordThroughEmailUrl,
  resetPasswordUrl,
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
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router'
import useReactRouter from 'use-react-router'
import { isNilOrEmpty, pathStrOr } from 'utils/fp'
import { getCookieValue } from 'utils/misc'
import { createDriftScript, createSegmentScript, trackPage } from 'utils/tracking'
import moment from 'moment'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import axios from 'axios'
import { updateClarityStore } from 'utils/clarityHelper'
import { DocumentMeta } from 'core/components/DocumentMeta'

const { keystone, setActiveRegion } = ApiClient.getInstance()

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
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

  // Attempt to restore the session
  const { username, unscopedToken: currUnscopedToken } = session
  if (username && currUnscopedToken) {
    // We need to make sure the token has not expired.
    return keystone.renewToken(currUnscopedToken)
  }
  return {}
}

const getUserDetails = async (activeTenant, isSsoToken) => {
  const { user, scopedToken } = await keystone.changeProjectScope(activeTenant.id, isSsoToken)
  await keystone.resetCookie()

  /* eslint-disable */
  // Check for sandbox flag, if false identify the user in Segment using Keystone ID
  // This needs to be done here bc this needs to be done before login.
  // Features are requested again later for the specific logged-in region,
  // whereas this one is done on the master DU from which the UI is served.
  // Ignore exception if features.json not found (for local development)
  const features = await axios.get('/clarity/features.json').catch(() => null)
  const sandbox = pathStrOr(false, 'data.experimental.sandbox', features)
  const analyticsOff = pathStrOr(false, 'data.experimental.analyticsOff', features)
  // Identify the user in Segment using Keystone ID
  if (typeof window.analytics !== 'undefined') {
    if (sandbox) {
      window.analytics.identify()
    } else {
      window.analytics.identify(user.id, {
        email: user.email,
      })
    }
  }

  // Segment tracking
  if (!analyticsOff) {
    DocumentMeta.addElementToDomBody(createSegmentScript())
  }

  // Drift tracking code for live demo
  if (sandbox) {
    DocumentMeta.addElementToDomBody(createDriftScript())
  }

  return {
    userDetails: user,
    scopedToken,
  }
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
  const { isSsoToken } = session
  const [, , getUserPrefs] = useScopedPreferences()
  const dispatch = useDispatch()

  useEffect(() => {
    const unlisten = history.listen((location) => {
      trackPage(`${location.pathname}${location.hash}`)
    })

    // This is to send page event for the first page the user lands on
    trackPage(`${pathname}${hash}`)

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
      } = await restoreSession(pathname, session, history)

      if (unscopedToken) {
        await setupSession({ username, unscopedToken, expiresAt, issuedAt, isSsoToken })
      } else {
        // Order matters
        setSessionChecked(true)
        dispatch(sessionActions.destroySession())
        dispatch(cacheActions.clearCache())
        dispatch(notificationActions.clearNotifications())
      }
    }
    validateSession()

    // TODO: Need to fix this code after synching up with backend.
    if (hash.includes(resetPasswordThroughEmailUrl)) {
      history.replace(hash.slice().replace('#', '/ui'))
    }

    return unlisten
  }, [])

  const setupSession = useCallback(
    async ({ username, unscopedToken, expiresAt, issuedAt, isSsoToken }) => {
      const timeDiff = moment(expiresAt).diff(issuedAt)
      const localExpiresAt = moment()
        .add(timeDiff)
        .format()

      const { currentTenant, currentRegion } = getUserPrefs(username)
      const tenants = await loadUserTenants()
      if (isNilOrEmpty(tenants)) {
        throw new Error('No tenants found, please contact support')
      }
      const activeTenant = tenants.find(propEq('name', currentTenant || 'service')) || head(tenants)
      if (!currentTenant && activeTenant) {
        updateClarityStore('tenantObj', activeTenant)
      }
      if (currentRegion) {
        setActiveRegion(currentRegion)
      }
      const { scopedToken, userDetails } = await getUserDetails(activeTenant, isSsoToken)

      // Order matters
      setSessionChecked(true)
      dispatch(
        sessionActions.updateSession({
          username,
          unscopedToken,
          scopedToken,
          expiresAt: localExpiresAt,
          userDetails,
          isSsoToken,
        }),
      )
    },
    [],
  )

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
          <LoginPage onAuthSuccess={setupSession} />
        </Route>
        <Route>
          {sessionChecked ? (
            authContent
          ) : (
            <Progress renderLoadingImage={false} loading message={'Loading app...'} />
          )}
        </Route>
      </Switch>
    </div>
  )
}

export default AppContainer
