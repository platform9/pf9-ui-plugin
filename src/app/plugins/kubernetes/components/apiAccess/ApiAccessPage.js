import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import PageContainer from 'core/components/pageContainer/PageContainer'
import ApiAccessListPage from './ApiAccessListPage'

const ApiAccessPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="apiAccess" label="API Access">
        <ApiAccessListPage />
      </Tab>
    </Tabs>
  </PageContainer>
)

export default ApiAccessPage
