import React from 'react'

import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import AlarmsListPage from 'k8s/components/alarms/AlarmsListPage'
import RulesListPage from './RulesListPage'
import PageContainer from 'core/components/pageContainer/PageContainer'

const MonitoringPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="alarms" label="Alarms">
        <AlarmsListPage />
      </Tab>
      <Tab value="rules" label="Rules">
        <RulesListPage />
      </Tab>
    </Tabs>
  </PageContainer>
)

export default MonitoringPage
