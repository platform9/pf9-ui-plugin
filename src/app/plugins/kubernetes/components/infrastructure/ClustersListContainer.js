import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import ClustersList from './ClustersList'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { withRouter } from 'react-router'

class ClustersListContainer extends React.Component {
  handleRemove = async id => {
    const { context, setContext } = this.props
    await context.apiClient.qbert.deleteCluster(id)
    const newClusters = context.clusters.filter(x => x.id !== id)
    setContext({ clusters: newClusters })
  }

  render () {
    const rowActions = [
      // TODO: scale cluster
      // TODO: upgrade
      // TODO: attach nodes
      // TODO: detach nodes
    ]

    return (
      <CRUDListContainer
        items={this.props.data}
        addUrl="/ui/kubernetes/infrastructure/clusters/add"
        editUrl="/ui/kubernetes/infrastructure/clusters/edit"
        onRemove={this.handleRemove}
      >
        {handlers => <ClustersList data={this.props.data} {...handlers} rowActions={rowActions} />}
      </CRUDListContainer>
    )
  }
}

ClustersListContainer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
  withRouter,
)(ClustersListContainer)
