import ApplicationsListContainer from 'core/components/appCatalog/ApplicationsListContainer'
import Loader from 'core/components/Loader'
import Picklist from 'core/components/Picklist'
import { withDataLoader } from 'core/DataLoader'
import { loadApps } from 'k8s/components/apps/actions'
import { loadInfrastructure } from 'k8s/components/infrastructure/actions'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { compose, prop } from 'ramda'
import React from 'react'

class AppCatalogPage extends React.Component {
  state = {
    activeCluster: '__all__',
    pods: null,
    clusterOptions: [
      // { label: 'all', value: '__all__' },
    ]
  }

  async componentDidMount () {
    // Make sure to use a new reference to props.context since it has now changed
    const clusters = this.props.context.clusters.filter(x => x.hasMasterNode)

    const clusterOptions = clusters.map(cluster => ({
      label: cluster.name,
      value: cluster.uuid
    }))

    this.setState(
      {
        activeCluster: prop('value', clusterOptions[0]),
        clusterOptions
      },
      this.reloadPageData
    )
  }

  reloadPageData = async () => {
    const { activeCluster } = this.state
    const { context, setContext } = this.props
    if (activeCluster) {
      // Need to query for all clusters
      await loadApps({
        params: { clusterId: activeCluster },
        context,
        setContext
      })
    }
  }

  handleChangeCluster = clusterId => {
    this.setState({ activeCluster: clusterId }, this.reloadPageData)
  }

  findClusterName = clusterId => {
    const cluster = this.props.context.clusters.find(x => x.uuid === clusterId)
    return (cluster && cluster.name) || ''
  }

  render () {
    const { activeCluster, clusterOptions } = this.state
    const {
      context: { clusters, apps }
    } = this.props

    if (!clusters || !apps) {
      return <Loader />
    }
    return (
      <div className="applications">
        <Picklist
          name="currentCluster"
          label="Current Cluster"
          options={clusterOptions}
          value={activeCluster}
          onChange={this.handleChangeCluster}
        />
        <ApplicationsListContainer applications={apps} />
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure })
)(AppCatalogPage)
