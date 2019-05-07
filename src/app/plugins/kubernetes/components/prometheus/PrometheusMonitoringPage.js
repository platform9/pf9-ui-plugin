import React from 'react'

import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'

import PrometheusInstances from './PrometheusInstances'
import PrometheusRules from './PrometheusRules'
import PrometheusServiceMonitors from './PrometheusServiceMonitors'
import PrometheusAlertManagers from './PrometheusAlertManagers'

import { compose } from 'ramda'
import { loadPrometheusResources } from './actions'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'

class PrometheusMonitoringPage extends React.Component {
  render () {
    return (
      <div>
        <Tabs>
          <Tab value="instances" label="Prometheus Instances"><PrometheusInstances /></Tab>
          <Tab value="rules" label="Rules"><PrometheusRules /></Tab>
          <Tab value="serviceMonitors" label="Service Monitors"><PrometheusServiceMonitors /></Tab>
          <Tab value="alerts" label="Alert Managers"><PrometheusAlertManagers /></Tab>
        </Tabs>
      </div>
    )
  }
}

export default compose(
  withDataLoader({ prometheusInstances: loadPrometheusResources }),
  withAppContext,
)(PrometheusMonitoringPage)
