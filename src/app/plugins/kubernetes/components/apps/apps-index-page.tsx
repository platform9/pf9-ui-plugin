import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import AppCatalogPage from 'k8s/components/apps/app-catalog-page'
// import DeployedAppsListPage from 'k8s/components/apps/DeployedAppsListPage'
import RepositoriesListPage from 'k8s/components/repositories/repositories-list-page'
import PageContainer from 'core/components/pageContainer/PageContainer'

const InfrastructurePage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="appCatalog" label="App Catalog">
        <AppCatalogPage />
      </Tab>
      {/* <Tab value="deployedApps" label="Deployed Apps">
        <DeployedAppsListPage />
      </Tab> */}
      <Tab value="repositories" label="Repositories">
        <RepositoriesListPage />
      </Tab>
    </Tabs>
  </PageContainer>
)

export default InfrastructurePage
