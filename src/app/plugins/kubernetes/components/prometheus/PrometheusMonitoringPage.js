import React from 'react'

import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

import PrometheusInstances from './PrometheusInstances'
import PrometheusRules from './PrometheusRules'
import PrometheusServiceMonitors from './PrometheusServiceMonitors'
import PrometheusAlertManagers from './PrometheusAlertManagers'

import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'

class PrometheusMonitoringPage extends React.Component {
  render () {
    return (
      <div>
        <Tabs>
          <Tab value="instances" label="Instances"><PrometheusInstances /></Tab>
          <Tab value="rules" label="Rules"><PrometheusRules /></Tab>
          <Tab value="serviceMonitors" label="Service Monitors"><PrometheusServiceMonitors /></Tab>
          <Tab value="alerts" label="Alert Managers"><PrometheusAlertManagers /></Tab>
        </Tabs>
      </div>
    )
  }
}

export default compose(
  withAppContext,
)(PrometheusMonitoringPage)
