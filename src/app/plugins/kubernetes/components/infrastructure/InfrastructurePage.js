import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import ClustersListPage from './ClustersListPage'
import NodesListPage from './NodesListPage'
import CloudProvidersListPage from './CloudProvidersListPage'
import InfrastructureStats from './InfrastructureStats'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
  },
}))

const InfrastructurePage = () => {
  const classes = useStyles()
  return <div className={classes.root}>
    <InfrastructureStats />
    <Tabs>
      <Tab value="clusters" label="Clusters"><ClustersListPage /></Tab>
      <Tab value="nodes" label="Nodes"><NodesListPage /></Tab>
      <Tab value="cloudProviders" label="Cloud Providers"><CloudProvidersListPage /></Tab>
    </Tabs>
  </div>
}

export default InfrastructurePage
