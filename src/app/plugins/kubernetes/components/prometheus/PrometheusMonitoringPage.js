import React from 'react'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'

const PrometheusMonitoringPage = () => (
  <Tabs>
    <Tab value="instances" label="Instances">Instances</Tab>
    <Tab value="alerts" label="Alerts">Alerts</Tab>
  </Tabs>
)

export default PrometheusMonitoringPage
