import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import RbacProfilesListPage from './rbac-profiles-list-page'
import PageContainer from 'core/components/pageContainer/PageContainer'
import DriftAnalyticsPage from './drift-analytics-page'

const RbacProfilesIndexPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="profiles" label="RBAC Profiles">
        <RbacProfilesListPage />
      </Tab>
      <Tab value="drift" label="Drift Analytics">
        <DriftAnalyticsPage />
      </Tab>
    </Tabs>
  </PageContainer>
)

export default RbacProfilesIndexPage
