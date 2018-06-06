import React from 'react'
import requiresAuthentication from '../../openstack/util/requiresAuthentication'
import { connect } from 'react-redux'
import { fetchClusters } from '../actions/clusters'

import Loader from 'core/common/Loader'
import ClustersListContainer from './clusters/ClustersListContainer'

function mapStateToProps (state, ownProps) {
  const { clusters } = state.openstack
  return {
    clustersLoaded: clusters.clustersLoaded,
  }
}

@requiresAuthentication
@connect(mapStateToProps)
class ClustersPage extends React.Component {
  componentDidMount () {
    // Load the clusters if they don't already exist
    if (!this.props.clustersLoaded) {
      this.props.dispatch(fetchClusters())
    }
  }
  render () {
    const { clustersLoaded } = this.props
    return (
      <div>
        <h1>Clusters Page</h1>
        {!clustersLoaded && <Loader />}
        {clustersLoaded && <ClustersListContainer />}
      </div>
    )
  }
}

export default ClustersPage
