import React from 'react'

import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import PrometheusInstances from './PrometheusInstances'
import PrometheusRules from './PrometheusRules'
import PrometheusServiceMonitors from './PrometheusServiceMonitors'
import PrometheusAlertManagers from './PrometheusAlertManagers'
import PageContainer from 'core/components/pageContainer/PageContainer'

const PrometheusMonitoringPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="instances" label="Instances"><PrometheusInstances /></Tab>
      <Tab value="rules" label="Rules"><PrometheusRules /></Tab>
      <Tab value="serviceMonitors" label="Service Monitors"><PrometheusServiceMonitors /></Tab>
      <Tab value="alerts" label="Alert Managers"><PrometheusAlertManagers /></Tab>
    </Tabs>
  </PageContainer>
)

export default PrometheusMonitoringPage
