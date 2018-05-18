import React from 'react'
import { withRouter } from 'react-router-dom'
import { Query } from 'react-apollo'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import gql from 'graphql-tag'

import Loader from 'core/common/Loader'
import DisplayError from 'core/common/DisplayError'
import ConfirmationDialog from 'core/common/ConfirmationDialog'
import ClustersList from './ClustersList'

import { removeCluster } from '../../actions/clusters'

const GET_K8CLUSTERS = gql`
  {
    K8Clusters @client {
      id
      name
    }
  }
`

const ADD_K8SCLUSTER = gql`
  mutation AddK8sCluster {
    id
  }
`

const DELETE_K8SCLUSTER = gql`
  mutation AddK8sCluster {
    id
  }
`

@requiresAuthentication
@withRouter
class ClustersListContainer extends React.Component {
  state = {
    showConfirmation: false,
    clustersToDelete: null,
  }

  redirectToAdd = () => {
    this.props.history.push('/ui/kubernetes/clusters/add')
  }

  handleDelete = selectedIds => {
    this.setState({ showConfirmation: true })
    const selectedClusters = this.props.clusters.filter(cluster => selectedIds.includes(cluster.id))
    this.setState({ clustersToDelete: selectedClusters })
  }

  handleDeleteCancel = () => {
    this.setState({ showConfirmation: false })
  }

  handleDeleteConfirm = () => {
    this.setState({ showConfirmation: false })
    const clusters = this.state.clustersToDelete || []
    clusters.forEach(cluster => this.props.dispatch(removeCluster(cluster.id)))
  }

  deleteConfirmText = () => {
    const { clustersToDelete } = this.state
    if (!clustersToDelete) {
      return
    }
    const clusterNames = clustersToDelete.map(x => x.name).join(', ')
    return `This will permanently delete the following cluster(s): ${clusterNames}`
  }

  render () {
    const { clusters } = this.props

    return (
      <div>
        <ConfirmationDialog
          open={this.state.showConfirmation}
          text={this.deleteConfirmText()}
          onCancel={this.handleDeleteCancel}
          onConfirm={this.handleDeleteConfirm}
        />

        <ClustersList
          clusters={clusters['K8Clusters']}
          onAdd={this.redirectToAdd}
          onDelete={this.handleDelete}
        />
      </div>
    )
  }
}

const GraphqlCrudContainer = ({ query, actions, children, ...props }) => {
  return (
    <Query query={query}>
      {({ loading, error, data, client }) => {
        if (loading) { return <Loader /> }
        if (error) { return <DisplayError error={error} /> }
        console.log(client)
        return children({ data, client, actions: {} })
      }}
    </Query>
  )
}

const GraphqlClustersList = () => (
  <GraphqlCrudContainer query={GET_K8CLUSTERS} actions={{ add: ADD_K8SCLUSTER, delete: DELETE_K8SCLUSTER }}>
    {({ data, actions }) => (
      <ClustersListContainer clusters={data} />
    )}
  </GraphqlCrudContainer>
)

export default GraphqlClustersList
