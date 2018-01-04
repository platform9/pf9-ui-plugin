import React from 'react'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'

import ClusterInfo from './ClusterInfo'
import ClusterNodes from './ClusterNodes'

const ClusterDetailsPage = () => (
  <Tabs>
    <Tab value="info" label="Info"><ClusterInfo /></Tab>
    <Tab value="nodes" label="Nodes"><ClusterNodes /></Tab>
  </Tabs>
)

export default ClusterDetailsPage
