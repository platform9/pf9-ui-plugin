import React from 'react'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'
import PodsListPage from './PodsListPage'
import DeploymentsListPage from './DeploymentsListPage'
import ServicesListPage from './ServicesListPage'

const PodsIndexPage = () => (
  <Tabs>
    <Tab value="pods" label="Pods"><PodsListPage /></Tab>
    <Tab value="deployments" label="Deployments"><DeploymentsListPage /></Tab>
    <Tab value="services" label="Services"><ServicesListPage /></Tab>
  </Tabs>
)

export default PodsIndexPage
