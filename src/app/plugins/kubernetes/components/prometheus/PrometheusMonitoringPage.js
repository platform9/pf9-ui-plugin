import React from 'react'

import Picklist from 'core/components/Picklist'
import Tabs from 'core/components/Tabs'
import Tab from 'core/components/Tab'

import PrometheusInstances from './PrometheusInstances'
import PrometheusRules from './PrometheusRules'

import { compose } from 'ramda'
import { projectAs } from 'utils/fp'
import { loadInfrastructure } from '../infrastructure/actions'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'

const PrometheusAlerts = () => <h1>Alerts</h1>
const PrometheusServiceMonitors = () => <h1>Service Monitors</h1>

class PrometheusMonitoringPage extends React.Component {
  state = {
    // clusterUuid: '',
    clusterUuid: 'e8f1d175-2e7d-40fa-a475-ed20b8d8c66d',  // hard-coding during developing to work faster
  }

  handleClusterChange = clusterUuid => this.setState({ clusterUuid })

  render () {
    const { clusterUuid } = this.state
    const { clusters } = this.props.context
    const clusterOptions = projectAs({ value: 'uuid', label: 'name' }, clusters)
    return (
      <div>
        <Picklist
          name="cluster"
          options={clusterOptions}
          onChange={this.handleClusterChange}
          value={clusterUuid}
          label="Cluster"
        />
        <Tabs>
          <Tab value="instances" label="Prometheus Instances"><PrometheusInstances clusterUuid={clusterUuid} /></Tab>
          <Tab value="rules" label="Rules"><PrometheusRules clusterUuid={clusterUuid} /></Tab>
          <Tab value="serviceMonitors" label="Service Monitors"><PrometheusServiceMonitors clusterUuid={clusterUuid} /></Tab>
          <Tab value="alerts" label="Alert Managers"><PrometheusAlerts clusterUuid={clusterUuid} /></Tab>
        </Tabs>
      </div>
    )
  }
}

export default compose(
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure }),
  withAppContext,
)(PrometheusMonitoringPage)
