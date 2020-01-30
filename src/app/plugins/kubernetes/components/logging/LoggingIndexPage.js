import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import LoggingListPage from './LoggingListPage'
import PageContainer from 'core/components/pageContainer/PageContainer'

const LoggingIndexPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="logging" label="Logging"><LoggingListPage /></Tab>
    </Tabs>
  </PageContainer>
)

export default LoggingIndexPage
