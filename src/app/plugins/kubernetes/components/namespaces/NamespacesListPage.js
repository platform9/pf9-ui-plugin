import React from 'react'
import { projectAs } from 'utils/fp'
import { prop, head } from 'ramda'
import { loadClusters } from 'k8s/components/infrastructure/actions'
import Picklist from 'core/components/Picklist'
import { withDataLoader } from 'core/DataLoader'
import { deleteNamespace, loadNamespaces } from 'k8s/components/namespaces/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'

const ListPage = ({ ListContainer }) => {
  class ListPage extends React.Component {
    state = {
      activeCluster: null,
    }

    handleChangeCluster = clusterId => {
      this.setState({ activeCluster: clusterId })
      this.props.reloadData('namespaces', { clusterId })
    }

    findClusterName = clusterId => {
      const cluster = this.props.context.clusters.find(x => x.uuid === clusterId)
      return (cluster && cluster.name) || ''
    }

    render () {
      const { activeCluster } = this.state
      const { data: { namespaces, clusters } } = this.props
      const withClusterNames = namespaces.map(ns => ({
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
                { name: 'all', uuid: '__all__' },
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

  return withDataLoader({
    clusters: loadClusters,
    namespaces: loadNamespaces,
  })(ListPage)
}

export const options = {
  addUrl: '/ui/kubernetes/namespaces/add',
  addText: 'Add Namespace',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'namespaces',
  deleteFn: deleteNamespace,
  editUrl: '/ui/kubernetes/namespaces/edit',
  name: 'Namespaces',
  title: 'Namespaces',
  ListPage,
}

const components = createCRUDComponents(options)
export const NodesList = components.List

export default components.ListPage
