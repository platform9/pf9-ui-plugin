import React from 'react'
import Picklist from 'core/components/Picklist'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { deleteService } from './actions'
import { projectAs } from 'utils/fp'
import { withMultiLoader } from 'core/DataLoader'
import { loadInfrastructure } from 'k8s/components/infrastructure/actions'
import { loadServices } from 'k8s/components/pods/actions'
import { prop, head } from 'ramda'

const ListPage = ({ ListContainer }) => {
  class ListPage extends React.Component {
    state = {
      activeCluster: null,
    }

    handleChangeCluster = clusterId => {
      this.setState({ activeCluster: clusterId },
        () => {
          this.props.reload('services', { clusterId })
        })
    }

    findClusterName = clusterId => {
      const cluster = this.props.context.clusters.find(x => x.uuid === clusterId)
      return (cluster && cluster.name) || ''
    }

    render () {
      const { activeCluster } = this.state
      const { kubeServices = [], clusters = [] } = this.props.context

      const withClusterNames = kubeServices.map(ns => ({
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
                ...clusters.filter(
                  cluster => cluster.hasMasterNode)],
            )}
            value={activeCluster || prop('uuid', head(clusters))}
            onChange={this.handleChangeCluster}
          />

          <ListContainer data={withClusterNames} />
        </div>
      )
    }
  }

  return withMultiLoader(
    {
      clusters: loadInfrastructure,
      services: {
        requires: 'clusters',
        loaderFn: loadServices,
      },
    })(ListPage)
}

export const options = {
  addUrl: '/ui/kubernetes/services/add',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'kubeServices',
  deleteFn: deleteService,
  name: 'Services',
  title: 'Services',
  ListPage,
}
const components = createCRUDComponents(options)
export const ServicesList = components.List

export default components.ListPage
