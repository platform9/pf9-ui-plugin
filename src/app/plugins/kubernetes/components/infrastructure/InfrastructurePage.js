import React, { useState, useCallback } from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import ClustersListPage from './ClustersListPage'
import NodesListPage from './NodesListPage'
import CloudProvidersListPage from './CloudProvidersListPage'
import InfrastructureStats from './InfrastructureStats'
import PageContainer from 'core/components/pageContainer/PageContainer'
import { FormControlLabel, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
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

  return <PageContainer header={<div className={classes.header}>
    <StatsToggle statsVisible={statsVisible} toggleStats={toggleStats} />
    <InfrastructureStats visible={statsVisible} />
  </div>}>
    <Tabs>
      <Tab value="clusters" label="Clusters"><ClustersListPage /></Tab>
      <Tab value="nodes" label="Nodes"><NodesListPage /></Tab>
      <Tab value="cloudProviders" label="Cloud Providers"><CloudProvidersListPage /></Tab>
    </Tabs>
  </PageContainer>
}

export default InfrastructurePage
