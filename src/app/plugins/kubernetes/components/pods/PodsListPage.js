import React from 'react'
import Picklist from 'core/components/Picklist'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import Loader from 'core/components/Loader'
import { withAppContext } from 'core/AppContext'
import { loadInfrastructure } from '../infrastructure/actions'
import { loadPods, deletePod } from './actions'

const ListPage = ({ ListContainer }) => {
  class ListPage extends React.Component {
    state = {
      activeCluster: '__all__',
      pods: null,
      clusterOptions: [
        { label: 'all', value: '__all__' },
      ],
    }

    async componentDidMount () {
      const { context, setContext } = this.props
      await loadInfrastructure({ context, setContext })

      // Make sure to use a new reference to props.context since it has now changed
      const clusters = this.props.context.clusters.filter(x => x.hasMasterNode)
      // Need to query for all clusters
      if (clusters.length) {
        await loadPods({ params: { clusterId: clusters[0].uuid }, context, setContext })
      } else {
        setContext({ pods: [] })
      }
      const clusterOptions = clusters.map(cluster => ({
        label: cluster.name,
        value: cluster.uuid
      }))
      this.setState({
        clusterOptions: [
          { label: 'all', value: '__all__' },
          ...clusterOptions
        ]
      })
    }

    handleChangeCluster = clusterId => {
      this.setState({ activeCluster: clusterId })
    }

    findClusterName = clusterId => {
      const cluster = this.props.context.clusters.find(x => x.uuid === clusterId)
      return (cluster && cluster.name) || ''
    }

    render () {
      const { activeCluster, clusterOptions } = this.state
      const { pods } = this.props.context
      if (!pods) { return <Loader /> }
      const filteredPods = (activeCluster === '__all__' && pods) ||
        pods.filter(pod => pod.clusterId === activeCluster)
      const withClusterNames = filteredPods.map(ns => ({
        ...ns,
        clusterName: this.findClusterName(ns.clusterId)
      }))

      return (
        <div>
          <Picklist
            name="currentCluster"
            label="Current Cluster"
            options={clusterOptions}
            value={activeCluster}
            onChange={this.handleChangeCluster}
          />

          <ListContainer data={withClusterNames} />
        </div>
      )
    }
  }
  return withAppContext(ListPage)
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
