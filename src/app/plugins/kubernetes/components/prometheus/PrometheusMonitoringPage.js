import React from 'react'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'

import PrometheusInstances from './PrometheusInstances'
import PrometheusAlerts from './PrometheusAlerts'

const PrometheusMonitoringPage = () => (
  <Tabs>
    <Tab value="instances" label="Prometheus Instances"><PrometheusInstances /></Tab>
    <Tab value="alerts" label="Alerts"><PrometheusAlerts /></Tab>
  </Tabs>
)

export default PrometheusMonitoringPage
