import React, { useState, useCallback, useContext } from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import ClustersListPage from './clusters/ClustersListPage'
import NodesListPage from './nodes/NodesListPage'
import CloudProvidersListPage from './cloudProviders/CloudProvidersListPage'
import InfrastructureStats from './InfrastructureStats'
import PageContainer from 'core/components/pageContainer/PageContainer'
import { FormControlLabel, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { AppContext } from 'core/providers/AppProvider'

const useStyles = makeStyles(theme => ({
  infrastructureHeader: {
    display: 'flex',
    flexGrow: 1,
    flexFlow: 'column nowrap',
    alignItems: 'flex-end',
    minHeight: 50,
  },
}))

const StatsToggle = ({ statsVisible, toggleStats }) => {
  return <FormControlLabel
    control={
      <Switch onChange={toggleStats} checked={statsVisible} />
    }
    label="Show Stats"
    labelPlacement="start"
  />
}

const InfrastructurePage = () => {
  const classes = useStyles()
  const [statsVisible, setStatsVisble] = useState(true)
  const toggleStats = useCallback(() => setStatsVisble(!statsVisible), [statsVisible])
  const { userDetails: { role } } = useContext(AppContext)

  return <PageContainer header={<div className={classes.infrastructureHeader}>
    <StatsToggle statsVisible={statsVisible} toggleStats={toggleStats} />
    <InfrastructureStats visible={statsVisible} />
  </div>}>
    <Tabs>
      <Tab value="clusters" label="Clusters"><ClustersListPage /></Tab>
      {role === 'admin' &&
      <Tab value="nodes" label="Nodes"><NodesListPage /></Tab>}
      {role === 'admin' &&
      <Tab value="cloudProviders" label="Cloud Providers"><CloudProvidersListPage /></Tab>}
    </Tabs>
  </PageContainer>
}

export default InfrastructurePage
