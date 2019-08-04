import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import ClustersListPage from './ClustersListPage'
import NodesListPage from './NodesListPage'
import CloudProvidersListPage from './CloudProvidersListPage'

const InfrastructurePage = () => (
  <Tabs>
    <Tab value="clusters" label="Clusters"><ClustersListPage /></Tab>
    <Tab value="nodes" label="Nodes"><NodesListPage /></Tab>
    <Tab value="cloudProviders" label="Cloud Providers"><CloudProvidersListPage /></Tab>
  </Tabs>
)

export default InfrastructurePage
