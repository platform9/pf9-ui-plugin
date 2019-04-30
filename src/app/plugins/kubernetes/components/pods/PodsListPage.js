import React from 'react'
import { projectAs } from 'utils/fp'
import { head, prop } from 'ramda'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { deletePod, loadPods } from 'k8s/components/pods/actions'
import { withDataLoader } from 'core/DataLoader'
import Picklist from 'core/components/Picklist'

const ListPage = ({ ListContainer }) => {
  class ListPage extends React.Component {
    state = {
      activeCluster: null,
    }

    handleChangeCluster = clusterId => {
      this.setState({ activeCluster: clusterId },
        () => {
          this.props.reloadData(loadPods, { clusterId })
        })
    }

    findClusterName = clusterId => {
      const cluster = this.props.context.clusters.find(x => x.uuid === clusterId)
      return (cluster && cluster.name) || ''
    }

    render () {
      const { activeCluster } = this.state
      const { pods = [], clusters = [] } = this.props.context
      const withClusterNames = pods.map(ns => ({
        ...ns,
        clusterName: this.findClusterName(ns.clusterId),
      }))

      return (
        <div>
          <Picklist
            name="currentCluster"
            label="Current Cluster"
            options={projectAs(
              { label: 'name', value: 'uuid' },
              [
                // TODO: Figure out a way to query for all clusters
                // { name: 'all', uuid: '__all__' },
                ...clusters.filter(cluster => cluster.hasMasterNode),
              ],
            )}
            value={activeCluster || prop('uuid', head(clusters))}
            onChange={this.handleChangeCluster}
          />

          <ListContainer data={withClusterNames} />
        </div>
      )
    }
  }

  return withDataLoader([loadClusters, loadPods])(ListPage)
}

export const options = {
  addUrl: '/ui/kubernetes/pods/add',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'pods',
  deleteFn: deletePod,
  name: 'Pods',
  title: 'Pods',
  ListPage,
}
const components = createCRUDComponents(options)
export const PodsList = components.List

export default components.ListPage
