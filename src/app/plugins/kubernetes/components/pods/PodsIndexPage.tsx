import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import PodsListPage from './PodsListPage'
import DeploymentsListPage from './DeploymentsListPage'
import ServicesListPage from './ServicesListPage'
import PageContainer from 'core/components/pageContainer/PageContainer'
import NamespacesListPage from '../namespaces/NamespacesListPage'

const PodsIndexPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="pods" label="Pods">
        <PodsListPage />
      </Tab>
      <Tab value="deployments" label="Deployments">
        <DeploymentsListPage />
      </Tab>
      <Tab value="services" label="Services">
        <ServicesListPage />
      </Tab>
      <Tab value="namespaces" label="Namespaces">
        <NamespacesListPage />
      </Tab>
    </Tabs>
  </PageContainer>
)

export default PodsIndexPage
