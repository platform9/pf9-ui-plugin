import React from 'react'
// import Tabs from 'core/components/tabs/Tabs'
// import Tab from 'core/components/tabs/Tab'
import PageContainer from 'core/components/pageContainer/PageContainer'
import ApiAccessListPage from './ApiAccessListPage'
import DeployedAppsListPage from '../apps/deployed-apps-list-page'

const ApiAccessPage = () => (
  <PageContainer>
    {/* <ApiAccessListPage /> */}
    <DeployedAppsListPage />
    {/* <Tabs>
      <Tab value="apiAccess" label="API Access">
        <ApiAccessListPage />
      </Tab>
    </Tabs> */}
  </PageContainer>
)

export default ApiAccessPage
