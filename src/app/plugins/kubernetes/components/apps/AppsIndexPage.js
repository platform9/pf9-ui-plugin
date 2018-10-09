import React from 'react'
import Tabs from 'core/common/Tabs'
import Tab from 'core/common/Tab'

const AppCatalogListPage = () => <h1>TODO: App Catalog List Page</h1>
const DeployedAppsListPage = () => <h1>TODO: Deployed Apps List Page</h1>
const RepositoriesListPage = () => <h1>TODO: Repositories List Page</h1>

const InfrastructurePage = () => (
  <Tabs>
    <Tab value="appCatalog" label="App Catalog"><AppCatalogListPage /></Tab>
    <Tab value="deployedApps" label="Deployed Apps"><DeployedAppsListPage /></Tab>
    <Tab value="repositories" label="Repositories"><RepositoriesListPage /></Tab>
  </Tabs>
)

export default InfrastructurePage
