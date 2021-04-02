import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import AppCatalogPage from 'k8s/components/app-catalog/app-catalog-page'
import RepositoriesListPage from 'k8s/components/app-catalog/repositories/repositories-list-page'
import PageContainer from 'core/components/pageContainer/PageContainer'
import DeployedAppsListPage from './deployed-apps/deployed-apps-list-page'

const InfrastructurePage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="appCatalog" label="App Catalog">
        <AppCatalogPage />
      </Tab>
      <Tab value="deployedApps" label="Deployed Apps">
        <DeployedAppsListPage />
      </Tab>
      <Tab value="repositories" label="Repositories">
        <RepositoriesListPage />
      </Tab>
    </Tabs>
  </PageContainer>
)

export default InfrastructurePage
