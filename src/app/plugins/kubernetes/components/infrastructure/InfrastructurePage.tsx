import React, { useState, useCallback, useMemo } from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import ClustersListPage from './clusters/ClustersListPage'
import NodesListPage from './nodes/NodesListPage'
import CloudProvidersListPage from './cloudProviders/CloudProvidersListPage'
import InfrastructureStats, { InfrastructureTabs } from './InfrastructureStats'
import PageContainer from 'core/components/pageContainer/PageContainer'
import { FormControlLabel, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { prop } from 'ramda'
import { useSelector } from 'react-redux'
import { sessionStoreKey, SessionState } from 'core/session/sessionReducers'
import Theme from 'core/themes/model'
import DocumentMeta from 'core/components/DocumentMeta'

const tabTogglerSpacing = {
  [InfrastructureTabs.Clusters]: 185,
  [InfrastructureTabs.CloudProviders]: 220,
  [InfrastructureTabs.Nodes]: 200,
}

const useStyles = makeStyles<Theme, { activeTab: InfrastructureTabs }>((theme) => ({
  infrastructureHeader: {
    display: 'flex',
    flexGrow: 1,
    flexFlow: 'column nowrap',
    alignItems: 'flex-end',
    minHeight: 50,
    marginTop: theme.spacing(2),
  },
  toggler: {
    position: 'absolute',
    right: ({ activeTab }) => tabTogglerSpacing[activeTab],
    top: 0,

    '& .MuiTypography-root': {
      ...theme.typography.caption1,
      color: theme.palette.grey[700],
      right: -3,
      position: 'relative',
    },
  },
}))

const StatsToggle = ({ statsVisible, toggleStats, activeTab }) => {
  const classes = useStyles({ activeTab })
  return (
    <FormControlLabel
      className={classes.toggler}
      control={<Switch onChange={toggleStats} checked={statsVisible} color="primary" />}
      label="Stats On"
      labelPlacement="start"
    />
  )
}

const InfrastructurePage = () => {
  const [statsVisible, setStatsVisble] = useState(true)
  const toggleStats = useCallback(() => setStatsVisble(!statsVisible), [statsVisible])
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const {
    userDetails: { role },
  } = session

  const hash = window.location.hash.substr(1) as InfrastructureTabs
  const [activeTab, setActiveTab] = React.useState(hash || InfrastructureTabs.Clusters)
  const classes = useStyles({ activeTab })
  const handleChange = (value) => {
    setActiveTab(value)
  }
  const header = useMemo(
    () => (
      <div className={classes.infrastructureHeader}>
        <StatsToggle statsVisible={statsVisible} toggleStats={toggleStats} activeTab={activeTab} />
        <InfrastructureStats visible={statsVisible} tab={activeTab} />
      </div>
    ),
    [statsVisible, activeTab, toggleStats],
  )
  return (
    <PageContainer>
      <DocumentMeta title="Infrastructure" />
      <Tabs onChange={handleChange}>
        <Tab value={InfrastructureTabs.Clusters} label="Clusters">
          {header}
          <ClustersListPage header={header} />
        </Tab>
        {role === 'admin' && (
          <Tab value={InfrastructureTabs.Nodes} label="Nodes">
            {header}
            <NodesListPage header={header} />
          </Tab>
        )}
        {role === 'admin' && (
          <Tab value={InfrastructureTabs.CloudProviders} label="Cloud Providers">
            {header}
            <CloudProvidersListPage header={header} />
          </Tab>
        )}
      </Tabs>
    </PageContainer>
  )
}

export default InfrastructurePage
