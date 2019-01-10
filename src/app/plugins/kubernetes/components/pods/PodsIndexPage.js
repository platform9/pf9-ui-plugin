import React from 'react'
import Tabs from 'core/common/Tabs'
import Tab from 'core/common/Tab'
import PodsListPage from './PodsListPage'
import DeploymentsListPage from './DeploymentsListPage'

const ServicesListPage = () => <h1>TODO: Services List Page</h1>

const PodsIndexPage = () => (
  <Tabs>
    <Tab value="pods" label="Pods"><PodsListPage /></Tab>
    <Tab value="deployments" label="Deployments"><DeploymentsListPage /></Tab>
    <Tab value="services" label="Services"><ServicesListPage /></Tab>
  </Tabs>
)

export default PodsIndexPage
