// libs
import React, { useCallback, useEffect, useMemo } from 'react'
import useReactRouter from 'use-react-router'
import { pathOr, prop } from 'ramda'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/styles'
// Constants
import { UserPreferences } from 'app/constants'
// Components
import StatusCard from './StatusCard'
import Text from 'core/elements/text'
import { routes } from 'core/utils/routes'
import Theme from 'core/themes/model'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { dashboardCardsByType } from './card-templates'
import { isDecco } from 'core/utils/helpers'
import { emptyArr } from 'utils/fp'
import IconButton from 'core/elements/icon-button'
import { baseCards, generateDashboardMosaicGrid, filterReportsWithUserRole } from './helpers'

const useStyles = makeStyles<Theme>((theme) => ({
  dashboardMosaic: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 290px)',
    gridTemplateAreas: `
      'cluster node pod cloud'
      'deployment service user tenant'
    `,
    gridGap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  cardColumn: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  cluster: {
    gridArea: 'cluster',
  },
  node: {
    gridArea: 'node',
  },
  cloud: {
    gridArea: 'cloud',
  },
  user: {
    gridArea: 'user',
  },
  tenant: {
    gridArea: 'tenant',
  },
  deployment: {
    gridArea: 'deployment',
  },
  service: {
    gridArea: 'service',
  },
  pod: {
    gridArea: 'pod',
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

const DashboardPage = () => {
  const { history } = useReactRouter()
  const { prefs, updateUserDefaults } = useScopedPreferences('defaults')
  const { cardOrder = emptyArr, isInitialized = false } = prefs?.dashboard || {}

  const reportCards =
    prefs?.dashboard?.addedCards?.length > 0 ? prefs?.dashboard?.addedCards : baseCards
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const {
    username,
    userDetails: { displayName, role },
    features,
  } = session
  const classes = useStyles()
  useEffect(() => {
    const isDeccoEnv = isDecco(features)
    if (isDeccoEnv && !isInitialized && !cardOrder.length) {
      updateUserDefaults(UserPreferences.Dashboard, {
        isInitialized: true,
        cardOrder: baseCards,
        addedCards: baseCards,
      })
    }
  }, [features, isInitialized, cardOrder])
  // To avoid missing API errors for ironic region UX-751
  const kubeRegion = pathOr(false, ['experimental', 'containervisor'], features)
  const handleEditDashboard = useCallback(() => {
    history.push(routes.dashboard.edit.path())
  }, [])
  const reports = useMemo(() => reportCards.map((cardType) => dashboardCardsByType[cardType]), [
    reportCards,
  ])
  const cards = useMemo(
    () =>
      filterReportsWithUserRole(reports, cardOrder, session.userDetails.role).map((report) => (
        <StatusCard key={report.route} {...report} className={classes[report.entity]} />
      )),
    [reports, cardOrder, session.userDetails.role],
  )
  const [top, bottom] = generateDashboardMosaicGrid(reports, cardOrder)
  const mosaicStyle = {
    gridTemplateAreas: `'${top}' '${bottom}'`,
  }
  return (
    <>
      <section className={classes.cardColumn} id={`dashboard-page`}>
        <Text id="dashboard-title" variant="h5">
          Welcome{displayName ? ` ${displayName}` : ''}!
        </Text>
        <IconButton icon="pencil" onClick={handleEditDashboard} />
        {kubeRegion && (
          <div className={classes.dashboardMosaic} style={mosaicStyle}>
            {cards}
          </div>
        )}
      </section>
    </>
  )
}

export default DashboardPage
