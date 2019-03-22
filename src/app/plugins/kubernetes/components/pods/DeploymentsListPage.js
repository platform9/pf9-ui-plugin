import React from 'react'
import Picklist from 'core/components/Picklist'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadInfrastructure } from '../infrastructure/actions'
import { loadDeployments } from './actions'
import { withMultiLoader } from 'core/DataLoader'
import { projectAs } from 'utils/fp'
import { prop, head } from 'ramda'

const ListPage = ({ ListContainer }) => {
  class ListPage extends React.Component {
    state = {
      activeCluster: null,
    }

    handleChangeCluster = clusterId => {
      this.setState({ activeCluster: clusterId },
        () => {
          this.props.reload('deployments', { clusterId })
        })
    }

    findClusterName = clusterId => {
      const cluster = this.props.context.clusters.find(x => x.uuid === clusterId)
      return (cluster && cluster.name) || ''
    }

    render () {
      const { activeCluster } = this.state
      const { deployments = [], clusters = [] } = this.props.context
      const withClusterNames = deployments.map(ns => ({
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
      deployments: {
        requires: 'clusters',
        loaderFn: loadDeployments,
      },
    })(ListPage)
}

export const options = {
  addUrl: '/ui/kubernetes/deployments/add',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'deployments',
  name: 'Deployments',
  title: 'Deployments',
  ListPage,
}
const components = createCRUDComponents(options)
export const DeploymentsList = components.List

export default components.ListPage
