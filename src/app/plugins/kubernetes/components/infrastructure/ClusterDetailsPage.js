import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import ClusterInfo from './ClusterInfo'
import ClusterNodes from './ClusterNodes'
import PageContainer from 'core/components/pageContainer/PageContainer'

const ClusterDetailsPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="info" label="Info"><ClusterInfo /></Tab>
      <Tab value="nodes" label="Nodes"><ClusterNodes /></Tab>
    </Tabs>
  </PageContainer>
)

export default ClusterDetailsPage
