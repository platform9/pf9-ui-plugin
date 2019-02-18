import React from 'react'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'
import AppCatalogPage from 'k8s/components/apps/AppCatalogPage'

const DeployedAppsListPage = () => <h1>TODO: Deployed Apps List Page</h1>
const RepositoriesListPage = () => <h1>TODO: Repositories List Page</h1>

const InfrastructurePage = () => (
  <Tabs>
    <Tab value="appCatalog" label="App Catalog"><AppCatalogPage /></Tab>
    <Tab value="deployedApps" label="Deployed Apps"><DeployedAppsListPage /></Tab>
    <Tab value="repositories" label="Repositories"><RepositoriesListPage /></Tab>
  </Tabs>
)

export default InfrastructurePage
