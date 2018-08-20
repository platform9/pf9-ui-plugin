import React from 'react'
import requiresAuthentication from '../../openstack/util/requiresAuthentication'
// import ClustersListContainer from './clusters/ClustersListContainer'
import { compose } from 'core/fp'

class ClustersPage extends React.Component {
  fetchClusters () {}

  componentDidMount () {
    // Load the clusters if they don't already exist
  }
  render () {
    return (
      <div>
        <h1>Clusters Page</h1>
      </div>
    )
  }
}

export default compose(
  requiresAuthentication
)(ClustersPage)
